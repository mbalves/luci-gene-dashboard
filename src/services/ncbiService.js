/**
 * NCBI integration service.
 *
 * Uses two NCBI APIs:
 *   - E-utilities eSummary (batch, fast, basic gene/position info)
 *   - Variation API     (single RS, rich clinical data)
 *
 * Rate limits (without API key): 3 req/sec
 * Rate limits (with NCBI_API_KEY): 10 req/sec
 */

const db = require('../db/index');

const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const ESUMMARY_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const VARIATION_BASE = 'https://api.ncbi.nlm.nih.gov/variation/v0/refsnp';
const TOOL = 'luci-gene-dashboard';
const EMAIL = process.env.NCBI_EMAIL || 'admin@example.com';

// Minimum ms between requests
const RATE_DELAY = NCBI_API_KEY ? 110 : 350;
let lastRequest = 0;

async function rateLimit() {
  const now = Date.now();
  const wait = RATE_DELAY - (now - lastRequest);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequest = Date.now();
}

/**
 * Strip 'rs' prefix and return numeric ID.
 */
function numericId(rsid) {
  return rsid.replace(/^rs/i, '');
}

/**
 * Batch-enrich up to 200 RSIDs via eSummary.
 * Returns array of gene_reference rows (not yet saved to DB).
 */
async function batchEnrichFromNcbi(rsids) {
  if (!rsids || rsids.length === 0) return [];

  const ids = rsids.map(numericId).join(',');
  const params = new URLSearchParams({
    db: 'snp',
    id: ids,
    retmode: 'json',
    tool: TOOL,
    email: EMAIL,
  });
  if (NCBI_API_KEY) params.append('api_key', NCBI_API_KEY);

  await rateLimit();

  let data;
  try {
    const res = await fetch(`${ESUMMARY_BASE}?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`NCBI HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('NCBI eSummary error:', err.message);
    return [];
  }

  const result = data?.result || {};
  const enriched = [];

  for (const rsid of rsids) {
    const nid = numericId(rsid);
    const snp = result[nid];
    if (!snp || snp.error) continue;

    const genes = snp.genes || [];
    const geneName = genes.map(g => g.name).filter(Boolean).join(', ') || null;
    const geneId   = genes.map(g => g.gene_id).filter(Boolean).join(',') || null;

    // chrpos format: "1:5935162"
    let chromosome = snp.chr || null;
    let position   = snp.chrpos ? parseInt(snp.chrpos.split(':')[1], 10) : null;
    if (!position && snp.chrpos_prev_assm) {
      position = parseInt(snp.chrpos_prev_assm.split(':')[1], 10) || null;
    }

    const clinSig = snp.clinical_significance || null;
    const maf     = snp.global_mafs?.[0]?.freq || snp.global_maf || null;

    enriched.push({
      rsid: rsid.toLowerCase().startsWith('rs') ? rsid : `rs${rsid}`,
      gene_name: geneName,
      gene_id: geneId,
      chromosome,
      position: isNaN(position) ? null : position,
      clinical_significance: clinSig,
      global_maf: maf ? String(maf) : null,
    });
  }

  return enriched;
}

/**
 * Fetch detailed single-SNP data from the Variation API.
 * Used for detailed gene page view.
 */
async function fetchVariationDetail(rsid) {
  await rateLimit();
  const nid = numericId(rsid);
  const url = `${VARIATION_BASE}/${nid}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Variation API HTTP ${res.status}`);
    const data = await res.json();

    const snap = data?.primary_snapshot_data || {};
    const annotations = snap.allele_annotations?.[0] || {};
    const asmAnnot = annotations.assembly_annotation?.[0] || {};
    const genes = asmAnnot.genes || [];

    const geneNames = genes.map(g => g.name).filter(Boolean).join(', ');
    const clinical = annotations.clinical || [];
    const clinSig = clinical.flatMap(c => c.clinical_significances || []).join(', ') || null;
    const diseaseNames = clinical.flatMap(c => c.disease_names || []).join('; ') || null;

    return {
      rsid,
      gene_name: geneNames || null,
      clinical_significance: clinSig,
      disease_names: diseaseNames,
      raw: data,
    };
  } catch (err) {
    console.error('Variation API error:', err.message);
    return null;
  }
}

/**
 * Look up RSIDs: check cache first, enrich missing ones from NCBI.
 * @param {string[]} rsids
 * @returns {Promise<Map<string, object>>} rsid → gene_reference row
 */
async function lookupAndCache(rsids) {
  if (!rsids || rsids.length === 0) return new Map();

  // 1. Check DB cache
  const lower = rsids.map(r => r.toLowerCase());
  const cached = await db.query(
    'SELECT * FROM gene_reference WHERE rsid = ANY($1)',
    [lower]
  );

  const cacheMap = new Map(cached.rows.map(r => [r.rsid, r]));
  const missing = lower.filter(r => !cacheMap.has(r));

  if (missing.length === 0) return cacheMap;

  // 2. Enrich missing in batches of 200
  const BATCH = 200;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    const enriched = await batchEnrichFromNcbi(batch);

    for (const row of enriched) {
      try {
        const res = await db.query(
          `INSERT INTO gene_reference
             (rsid, gene_name, gene_id, chromosome, position, clinical_significance, global_maf)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (rsid) DO UPDATE SET
             gene_name             = EXCLUDED.gene_name,
             gene_id               = EXCLUDED.gene_id,
             chromosome            = EXCLUDED.chromosome,
             position              = EXCLUDED.position,
             clinical_significance = EXCLUDED.clinical_significance,
             global_maf            = EXCLUDED.global_maf,
             enriched_at           = NOW()
           RETURNING *`,
          [row.rsid, row.gene_name, row.gene_id, row.chromosome,
           row.position, row.clinical_significance, row.global_maf]
        );
        if (res.rows[0]) cacheMap.set(row.rsid, res.rows[0]);
      } catch (err) {
        console.error('Cache insert error for', row.rsid, err.message);
      }
    }
  }

  return cacheMap;
}

/**
 * Busca todos os RSIDs associados a um gene pelo nome no NCBI dbSNP.
 *
 * Usa E-utilities esearch com filtro [gene_name] no banco snp.
 * Retorna { rsids: string[], ncbiTotal: number }
 *
 * Cache em memória por 10 minutos para evitar chamadas repetidas.
 */
const _geneNameCache = new Map(); // geneName → { rsids, ncbiTotal, expiresAt }
const GENE_CACHE_TTL = 10 * 60 * 1000; // 10 min

async function searchNcbiByGeneName(geneName) {
  const key = geneName.toLowerCase().trim();

  // Checar cache em memória
  const cached = _geneNameCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { rsids: cached.rsids, ncbiTotal: cached.ncbiTotal };
  }

  const ESEARCH_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  // Uma única requisição com retmax=10000 (limite máximo do esearch).
  // Evita complexidade de WebEnv/paginação que era instável.
  const params = new URLSearchParams({
    db:      'snp',
    term:    `${geneName}[gene_name] AND Homo sapiens[organism]`,
    retmode: 'json',
    retmax:  '10000',
    sort:    'snp_id',   // crescente: RSIDs mais antigos/estabelecidos primeiro
    tool:    TOOL,
    email:   EMAIL,
  });
  if (NCBI_API_KEY) params.append('api_key', NCBI_API_KEY);

  await rateLimit();

  try {
    const res = await fetch(`${ESEARCH_BASE}?${params}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`esearch HTTP ${res.status}`);
    const data = await res.json();

    const ncbiTotal = parseInt(data?.esearchresult?.count || '0', 10);
    const idlist    = data?.esearchresult?.idlist || [];
    const rsids     = idlist.map(id => `rs${id}`);

    const result = { rsids, ncbiTotal };
    _geneNameCache.set(key, { ...result, expiresAt: Date.now() + GENE_CACHE_TTL });
    return result;
  } catch (err) {
    console.error('NCBI gene name search error:', err.message);
    return { rsids: [], ncbiTotal: 0 };
  }
}

module.exports = { lookupAndCache, fetchVariationDetail, batchEnrichFromNcbi, searchNcbiByGeneName };
