const express = require('express');
const router = express.Router();
const db = require('../db/index');
const { lookupAndCache, fetchVariationDetail, searchNcbiByGeneName } = require('../services/ncbiService');

/**
 * Rank a clinical_significance string (lower = more relevant).
 */
function clinPriority(sig) {
  if (!sig || sig.trim() === '' || sig === '.') return 99;
  const s = sig.toLowerCase();
  if (s.includes('pathogenic') && !s.includes('likely') && !s.includes('non')) return 1;
  if (s.includes('likely pathogenic'))   return 2;
  if (s.includes('risk factor'))         return 3;
  if (s.includes('conflicting'))         return 4;
  if (s.includes('uncertain'))           return 5;
  if (s.includes('likely benign'))       return 6;
  if (s.includes('benign'))              return 7;
  return 8; // other recognised sig
}

/**
 * Keep only variants that have clinical significance data, sorted by relevance.
 * Falls back to all results (sorted) if none have clinical data.
 */
function filterByRelevance(results) {
  const sorted = [...results].sort((a, b) =>
    clinPriority(a.clinical_significance) - clinPriority(b.clinical_significance)
  );
  const withSig = sorted.filter(r => clinPriority(r.clinical_significance) < 99);
  return withSig.length > 0 ? withSig : sorted;
}

/**
 * GET /api/genes/search?patientId=1&q=BRCA1&limit=50&offset=0
 *
 * Search modes:
 *   - q starts with "rs"  → search by RSID (prefix match)
 *   - q matches chr:pos   → search by chromosome + position
 *   - otherwise           → search by gene name (fuzzy)
 */
router.get('/search', async (req, res, next) => {
  try {
    const { patientId, q, limit = 50, offset = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'A busca deve ter pelo menos 2 caracteres.' });
    }

    const term = q.trim().toLowerCase();
    const lim = Math.min(Number(limit) || 50, 200);
    const off = Number(offset) || 0;

    let snpRows = [];

    // — RSID search —
    if (term.startsWith('rs') || /^\d{5,}$/.test(term)) {
      const rsid = term.startsWith('rs') ? term : `rs${term}`;
      if (patientId) {
        const r = await db.query(
          `SELECT ps.rsid, ps.chromosome, ps.position, ps.genotype
           FROM patient_snps ps
           WHERE ps.patient_id = $1
             AND ps.rsid ILIKE $2
           ORDER BY ps.rsid
           LIMIT $3 OFFSET $4`,
          [patientId, `${rsid}%`, lim, off]
        );
        snpRows = r.rows;
      } else {
        const r = await db.query(
          `SELECT rsid, chromosome, position, NULL::text AS genotype
           FROM gene_reference
           WHERE rsid ILIKE $1
           ORDER BY rsid
           LIMIT $2 OFFSET $3`,
          [`${rsid}%`, lim, off]
        );
        snpRows = r.rows;
      }
    }

    // — chromosome:position search (e.g. "1:752566" or "17:41276113") —
    else if (/^[\dxyXY]{1,2}:\d+$/.test(term)) {
      const [chrom, pos] = term.split(':');
      const posNum = parseInt(pos, 10);
      const range = 5000; // ±5 kb window

      if (patientId) {
        const r = await db.query(
          `SELECT ps.rsid, ps.chromosome, ps.position, ps.genotype
           FROM patient_snps ps
           WHERE ps.patient_id = $1
             AND LOWER(ps.chromosome) = LOWER($2)
             AND ps.position BETWEEN $3 AND $4
           ORDER BY ps.position
           LIMIT $5 OFFSET $6`,
          [patientId, chrom, posNum - range, posNum + range, lim, off]
        );
        snpRows = r.rows;
      } else {
        const r = await db.query(
          `SELECT rsid, chromosome, position, NULL::text AS genotype
           FROM gene_reference
           WHERE LOWER(chromosome) = LOWER($1)
             AND position BETWEEN $2 AND $3
           ORDER BY position
           LIMIT $4 OFFSET $5`,
          [chrom, posNum - range, posNum + range, lim, off]
        );
        snpRows = r.rows;
      }
    }

    // — Busca por nome de gene —
    // Estratégia: NCBI esearch (autoritativo) + cache local, em paralelo.
    // Os RSIDs encontrados são cruzados com o arquivo do paciente.
    else {
      // Executar busca local (cache) e NCBI em paralelo
      const [cacheResult, ncbiResult] = await Promise.all([
        db.query(
          `SELECT rsid FROM gene_reference WHERE gene_name ILIKE $1 LIMIT 5000`,
          [`%${term}%`]
        ),
        searchNcbiByGeneName(term),
      ]);

      // Unir RSIDs das duas fontes (sem duplicatas)
      const rsidSet = new Set([
        ...cacheResult.rows.map(r => r.rsid),
        ...ncbiResult.rsids,
      ]);
      const allRsids = Array.from(rsidSet);

      if (patientId) {
        // Cruzar com o arquivo do paciente: só retorna o que o paciente tem
        const r = await db.query(
          `SELECT ps.rsid, ps.chromosome, ps.position, ps.genotype
           FROM patient_snps ps
           WHERE ps.patient_id = $1
             AND ps.rsid = ANY($2)
           ORDER BY ps.chromosome, ps.position
           LIMIT $3 OFFSET $4`,
          [patientId, allRsids, lim, off]
        );
        snpRows = r.rows;

        // Total de matches no paciente (sem o LIMIT, para paginação)
        const countR = await db.query(
          `SELECT COUNT(*)::int AS cnt FROM patient_snps
           WHERE patient_id = $1 AND rsid = ANY($2)`,
          [patientId, allRsids]
        );
        const patientMatchCount = countR.rows[0]?.cnt || 0;

        if (snpRows.length === 0) {
          return res.json({
            results: [],
            total: 0,
            enriched: true,
            ncbi_total: ncbiResult.ncbiTotal,
            patient_match_count: 0,
            gene_query: term.toUpperCase(),
          });
        }

        const rsids = snpRows.map(r => r.rsid);
        const geneMap = await lookupAndCache(rsids);

        const allResults = snpRows.map(snp => {
          const ref = geneMap.get(snp.rsid) || {};
          return {
            rsid:                  snp.rsid,
            chromosome:            snp.chromosome || ref.chromosome || null,
            position:              snp.position   || ref.position   || null,
            genotype:              snp.genotype   || null,
            gene_name:             ref.gene_name  || null,
            gene_id:               ref.gene_id    || null,
            clinical_significance: ref.clinical_significance || null,
            global_maf:            ref.global_maf || null,
            enriched_at:           ref.enriched_at || null,
          };
        });

        // Sort by clinical relevance; only return variants with known clinical significance
        const results = filterByRelevance(allResults);

        return res.json({
          results,
          total: results.length,
          enriched: true,
          ncbi_total: ncbiResult.ncbiTotal,
          patient_match_count: patientMatchCount,
          gene_query: term.toUpperCase(),
        });

      } else {
        // Busca global: retornar da referência local + enriquecer via NCBI
        const r = await db.query(
          `SELECT rsid, chromosome, position, NULL::text AS genotype
           FROM gene_reference
           WHERE gene_name ILIKE $1
           ORDER BY gene_name, rsid
           LIMIT $2 OFFSET $3`,
          [`%${term}%`, lim, off]
        );
        snpRows = r.rows;
      }
    }

    if (snpRows.length === 0) {
      return res.json({ results: [], total: 0, enriched: false });
    }

    // Enriquecer resultados (cache DB + NCBI)
    const rsids = snpRows.map(r => r.rsid);
    const geneMap = await lookupAndCache(rsids);

    const results = snpRows.map(snp => {
      const ref = geneMap.get(snp.rsid) || {};
      return {
        rsid:                 snp.rsid,
        chromosome:           snp.chromosome || ref.chromosome || null,
        position:             snp.position   || ref.position   || null,
        genotype:             snp.genotype   || null,
        gene_name:            ref.gene_name  || null,
        gene_id:              ref.gene_id    || null,
        clinical_significance: ref.clinical_significance || null,
        global_maf:           ref.global_maf || null,
        enriched_at:          ref.enriched_at || null,
      };
    });

    res.json({ results, total: results.length, enriched: true });
  } catch (err) { next(err); }
});

/**
 * GET /api/genes/:rsid — detailed info for a single RS, optionally with patient genotype
 */
router.get('/:rsid', async (req, res, next) => {
  try {
    const rsid = req.params.rsid.toLowerCase();
    const { patientId } = req.query;

    // Get patient genotype if requested
    let genotype = null;
    if (patientId) {
      const ptSnp = await db.query(
        'SELECT genotype FROM patient_snps WHERE patient_id = $1 AND rsid = $2',
        [patientId, rsid]
      );
      genotype = ptSnp.rows[0]?.genotype || null;
    }

    // Get cached gene ref
    let ref = await db.query('SELECT * FROM gene_reference WHERE rsid = $1', [rsid]);
    let refRow = ref.rows[0] || null;

    // Fetch detailed variation data from NCBI
    const detail = await fetchVariationDetail(rsid);

    // Update cache if we got fresh data
    if (detail && detail.gene_name) {
      const upsert = await db.query(
        `INSERT INTO gene_reference (rsid, gene_name, clinical_significance)
         VALUES ($1, $2, $3)
         ON CONFLICT (rsid) DO UPDATE SET
           gene_name             = EXCLUDED.gene_name,
           clinical_significance = EXCLUDED.clinical_significance,
           enriched_at           = NOW()
         RETURNING *`,
        [rsid, detail.gene_name, detail.clinical_significance]
      );
      refRow = upsert.rows[0];
    }

    res.json({
      rsid,
      genotype,
      gene_name:            refRow?.gene_name || detail?.gene_name || null,
      gene_id:              refRow?.gene_id || null,
      chromosome:           refRow?.chromosome || null,
      position:             refRow?.position || null,
      clinical_significance: refRow?.clinical_significance || detail?.clinical_significance || null,
      disease_names:        detail?.disease_names || null,
      global_maf:           refRow?.global_maf || null,
      enriched_at:          refRow?.enriched_at || null,
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/genes/patient/:patientId — list all SNPs for a patient with pagination
 */
router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { limit = 100, offset = 0, chromosome } = req.query;

    let sql = `
      SELECT ps.rsid, ps.chromosome, ps.position, ps.genotype,
             gr.gene_name, gr.clinical_significance, gr.global_maf
      FROM patient_snps ps
      LEFT JOIN gene_reference gr ON gr.rsid = ps.rsid
      WHERE ps.patient_id = $1
    `;
    const params = [patientId];

    if (chromosome) {
      params.push(chromosome);
      sql += ` AND ps.chromosome = $${params.length}`;
    }

    sql += ` ORDER BY ps.chromosome, ps.position LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Math.min(Number(limit) || 100, 500), Number(offset) || 0);

    const result = await db.query(sql, params);

    // Total count
    const countRes = await db.query(
      'SELECT COUNT(*)::int AS total FROM patient_snps WHERE patient_id = $1',
      [patientId]
    );

    res.json({
      results: result.rows,
      total: countRes.rows[0]?.total || 0,
    });
  } catch (err) { next(err); }
});

module.exports = router;
