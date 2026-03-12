/**
 * DNA file parser supporting 23andMe and Tellmegen CSV formats.
 *
 * 23andMe (tab-separated):
 *   # rsid\tchromosome\tposition\tgenotype
 *   rs4477212\t1\t82154\tAA
 *
 * Tellmegen (comma-separated):
 *   # rsid,chromosome,position,genotype
 *   rs4477212,1,82154,AA
 */

const { parse } = require('csv-parse');
const { Readable } = require('stream');

/**
 * Detect format from file header lines.
 * @param {string} sample - First 2000 bytes of file as string
 * @returns {'23andme'|'tellmegen'|'unknown'}
 */
function detectFormat(sample) {
  const lower = sample.toLowerCase();

  if (lower.includes('23andme') || lower.includes('23-and-me')) {
    return '23andme';
  }
  if (lower.includes('tellmegen')) {
    return 'tellmegen';
  }

  // Fallback: detect delimiter from first data line
  const lines = sample.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.includes('\t')) return '23andme';
    if (firstLine.includes(',')) return 'tellmegen';
  }

  return 'unknown';
}

/**
 * Parse raw DNA file buffer into SNP records.
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<{format: string, snps: Array<{rsid,chromosome,position,genotype}>}>}
 */
async function parseDnaFile(buffer) {
  const sample = buffer.slice(0, 4096).toString('utf8');
  const format = detectFormat(sample);

  const delimiter = format === 'tellmegen' ? ',' : '\t';
  const snps = [];

  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);

    const parser = parse({
      delimiter,
      comment: '#',
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    parser.on('data', (row) => {
      // Some files have a header row (rsid / chromosome / ...)
      if (!row[0] || row[0].toLowerCase() === 'rsid' || row[0].toLowerCase() === '# rsid') return;
      if (row.length < 4) return;

      const rsid = row[0].trim();
      const chromosome = row[1] ? row[1].trim() : null;
      const position = row[2] ? parseInt(row[2].trim(), 10) : null;
      const genotype = row[3] ? row[3].trim() : null;

      // Ignorar IDs internos (23andMe começa com 'i', Illumina com 'IlmnSeq_', vazios, etc.)
      if (!rsid || rsid === '--' || rsid === '.' ) return;
      // Rejeitar qualquer ID que não seja rs<número> nem puramente numérico
      if (!rsid.match(/^rs\d+$/i) && !/^\d+$/.test(rsid)) return;
      // Segurança extra: ignorar valores muito longos (> 50 chars)
      if (rsid.length > 50) return;

      snps.push({
        rsid: rsid.startsWith('rs') ? rsid : `rs${rsid}`,
        chromosome: chromosome || null,
        position: isNaN(position) ? null : position,
        genotype: genotype && genotype !== '--' ? genotype.toUpperCase() : null,
      });
    });

    parser.on('error', reject);
    parser.on('end', () => resolve({ format, snps }));

    stream.pipe(parser);
  });
}

/**
 * Batch-insert SNPs into patient_snps, skipping duplicates.
 * @param {object} client - pg client
 * @param {number} patientId
 * @param {number} fileId
 * @param {Array} snps
 * @returns {Promise<number>} rows inserted
 */
async function batchInsertSnps(client, patientId, fileId, snps) {
  const BATCH = 500;
  let inserted = 0;

  // Deduplicar pelo rsid antes de qualquer inserção — last-wins
  const uniqueMap = new Map();
  for (const snp of snps) {
    uniqueMap.set(snp.rsid, snp);
  }
  const unique = Array.from(uniqueMap.values());

  for (let i = 0; i < unique.length; i += BATCH) {
    const chunk = unique.slice(i, i + BATCH);

    // Deduplicar dentro do chunk (garante unicidade mesmo que o Map acima seja bypassado)
    const chunkMap = new Map(chunk.map(s => [s.rsid, s]));
    const deduped = Array.from(chunkMap.values());

    const vals = [];
    const ph = deduped.map((snp, idx) => {
      const base = idx * 6;
      vals.push(patientId, fileId, snp.rsid, snp.chromosome, snp.position, snp.genotype);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    });

    const sql = `
      INSERT INTO patient_snps (patient_id, file_id, rsid, chromosome, position, genotype)
      VALUES ${ph.join(', ')}
      ON CONFLICT (patient_id, rsid) DO UPDATE
        SET genotype = EXCLUDED.genotype,
            file_id  = EXCLUDED.file_id
    `;
    const result = await client.query(sql, vals);
    inserted += result.rowCount;
  }

  return inserted;
}

module.exports = { parseDnaFile, batchInsertSnps, detectFormat };
