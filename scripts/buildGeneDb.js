#!/usr/bin/env node
/**
 * buildGeneDb.js
 *
 * Downloads clinically relevant SNP data from NCBI's ClinVar and dbSNP,
 * then populates the gene_reference table in PostgreSQL.
 *
 * Data sources (public, free):
 *   1. NCBI ClinVar VCF  — clinical variants with gene names and significance
 *      https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz
 *
 * Usage:
 *   node scripts/buildGeneDb.js [--limit 10000]
 *
 * Options:
 *   --limit N    Only import first N records (for testing)
 *   --source     'clinvar' (default) | 'custom'
 */

require('dotenv').config();
const https = require('https');
const zlib = require('zlib');
const readline = require('readline');
const { pool } = require('../src/db/index');

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

const CLINVAR_VCF_URL =
  'https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz';

// ── helpers ─────────────────────────────────────────────────────────────────

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'luci-gene-dashboard/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpsGet(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      resolve(res);
    }).on('error', reject);
  });
}

/**
 * Parse ClinVar VCF INFO field into key→value map.
 */
function parseInfo(info) {
  const map = {};
  for (const kv of info.split(';')) {
    const eq = kv.indexOf('=');
    if (eq === -1) { map[kv] = true; continue; }
    map[kv.slice(0, eq)] = kv.slice(eq + 1);
  }
  return map;
}

// ── batch insert helper ───────────────────────────────────────────────────────

async function flushBatch(client, batch) {
  if (batch.length === 0) return 0;

  const vals = [];
  const ph = batch.map((row, idx) => {
    const b = idx * 7;
    vals.push(
      row.rsid, row.gene_name, row.chromosome, row.position,
      row.clinical_significance, row.alleles, row.global_maf
    );
    return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7})`;
  });

  const sql = `
    INSERT INTO gene_reference
      (rsid, gene_name, chromosome, position, clinical_significance, alleles, global_maf)
    VALUES ${ph.join(',')}
    ON CONFLICT (rsid) DO UPDATE SET
      gene_name             = EXCLUDED.gene_name,
      chromosome            = EXCLUDED.chromosome,
      position              = EXCLUDED.position,
      clinical_significance = EXCLUDED.clinical_significance,
      alleles               = EXCLUDED.alleles,
      enriched_at           = NOW()
  `;
  const result = await client.query(sql, vals);
  return result.rowCount;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function buildFromClinVar() {
  console.log('Downloading ClinVar VCF from NCBI FTP…');
  console.log(`URL: ${CLINVAR_VCF_URL}`);
  console.log(LIMIT !== Infinity ? `Limit: ${LIMIT} records` : 'No limit — importing all records');
  console.log('');

  const client = await pool.connect();

  try {
    const response = await httpsGet(CLINVAR_VCF_URL);
    const gunzip = zlib.createGunzip();
    const rl = readline.createInterface({ input: response.pipe(gunzip), crlfDelay: Infinity });

    const BATCH_SIZE = 500;
    let batch = [];
    let lineCount = 0;
    let importedTotal = 0;
    let skipped = 0;

    console.log('Parsing VCF and importing to database…');

    for await (const line of rl) {
      if (line.startsWith('#')) continue; // VCF header

      const cols = line.split('\t');
      if (cols.length < 8) continue;

      const [chrom, pos, id, ref, alt, , , info] = cols;

      // Only process lines with RS IDs
      const rsMatch = id.match(/^rs(\d+)$/i) || (info && info.match(/RS=(\d+)/));
      if (!rsMatch) { skipped++; continue; }

      const rsid = rsMatch[0].startsWith('rs') ? rsMatch[0] : `rs${rsMatch[1]}`;
      const infoMap = parseInfo(info);

      const geneName = infoMap.GENEINFO
        ? infoMap.GENEINFO.split(':')[0].replace(/\|.*/, '')
        : (infoMap.GENE || null);

      const clinSig = infoMap.CLNSIG
        ? decodeURIComponent(infoMap.CLNSIG).replace(/_/g, ' ')
        : null;

      const alleles = alt ? `${ref}>${alt}` : null;

      batch.push({
        rsid: rsid.toLowerCase(),
        gene_name: geneName,
        chromosome: chrom.replace(/^chr/i, ''),
        position: parseInt(pos, 10),
        clinical_significance: clinSig,
        alleles,
        global_maf: null,
      });

      lineCount++;

      if (batch.length >= BATCH_SIZE) {
        const n = await flushBatch(client, batch);
        importedTotal += n;
        batch = [];
        process.stdout.write(`\r  Processed ${lineCount.toLocaleString()} variants, imported ${importedTotal.toLocaleString()}…`);
      }

      if (lineCount >= LIMIT) break;
    }

    // Flush remaining
    if (batch.length > 0) {
      const n = await flushBatch(client, batch);
      importedTotal += n;
    }

    console.log(`\n\nDone!`);
    console.log(`  Lines processed : ${lineCount.toLocaleString()}`);
    console.log(`  Records imported: ${importedTotal.toLocaleString()}`);
    console.log(`  Skipped (no RS) : ${skipped.toLocaleString()}`);

  } finally {
    client.release();
    await pool.end();
  }
}

buildFromClinVar().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
