'use strict';
const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const sharp   = require('sharp');
const db      = require('../db/index');
const { RSID_RISK_ALLELES } = require('../data/rsidRiskAlleles');

// Load SVG template once
const SVG_PATH = path.join(__dirname, '../..', 'public/assets/images/metabolic-pathways-colored-v2-with-rs-ids.svg');
let svgTemplate = null;

function loadSvgTemplate() {
  if (!svgTemplate) {
    svgTemplate = fs.readFileSync(SVG_PATH, 'utf8');
  }
  return svgTemplate;
}

// ── Color logic for SVG rsid boxes ────────────────────────────────────────────
function classifyGenotype(genotype, riskAllele, baseColor) {
  if (!genotype || genotype === '--' || genotype.includes('-')) {
    return '#ffffff'; // white - no genotype
  }

  const gt = genotype.toUpperCase().replace(/[^ACGT]/g, '');
  if (gt.length !== 2) return '#ffffff';

  // Heterozygous always → yellow
  if (gt[0] !== gt[1]) return '#ffff00';

  // Homozygous genotypes - respect base color where appropriate
  const isHeterozygoteRisk = riskAllele && gt[0] === riskAllele.toUpperCase();

  // If homozygous risk allele → red
  if (isHeterozygoteRisk) return '#ff0000';

  // Homozygous non-risk: use base color if available (blue, orange, yellow, etc.), otherwise green
  if (baseColor === 'blue') return '#0070bf'; // blue for blue-marked rsids
  if (baseColor === 'orange') return '#ff9900'; // orange for orange-marked rsids
  if (baseColor === 'red') return '#ff0000'; // red rsids stay red if homozygous non-risk too
  if (baseColor === 'yellow') return '#ffff00'; // yellow-marked rsids stay yellow
  if (baseColor === 'white') return '#ffffff'; // white-marked rsids stay white

  // Default to green for unmarked rsids
  return '#00802f';
}

// ── GET /api/pathways/:patientId ──────────────────────────────────────────────
router.get('/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const pRes = await db.query(
      'SELECT id FROM patients WHERE id = $1',
      [patientId]
    );
    if (pRes.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Fetch ALL rsids with SNP data
    const snpRes = await db.query(
      'SELECT rsid, genotype FROM patient_snps WHERE patient_id = $1',
      [patientId]
    );

    // Build rsid → color map (only for rsids with patient data)
    const rsidColorMap = {};
    for (const row of snpRes.rows) {
      const rsid = row.rsid.toLowerCase();
      const rsidInfo = RSID_RISK_ALLELES[rsid];
      if (!rsidInfo) continue; // skip if not in reference

      const riskAllele = rsidInfo.riskAllele;
      const baseColor = rsidInfo.color;
      const hexColor = classifyGenotype(row.genotype, riskAllele, baseColor);
      rsidColorMap[rsid] = hexColor;
    }

    // Load SVG template and apply colors (single pass for performance)
    let svg = loadSvgTemplate();

    // Replace all rsid colors in one pass: white (default) or patient-specific color
    svg = svg.replace(/fill="[^"]*"([^>]*?)id="(rs[^"]+)"/g, (match, attrs, rsid) => {
      const rsidLower = rsid.toLowerCase();
      const newColor = rsidColorMap[rsidLower] || '#ffffff'; // white if no patient data
      return `fill="${newColor}"${attrs}id="${rsid}"`;
    });

    // Save calculated SVG for debugging
    const fs = require('fs');
    const debugPath = path.join(__dirname, '../..', `temp/calculated-svg-patient-${patientId}.svg`);
    fs.writeFileSync(debugPath, svg);

    // Convert SVG to PNG at 2x resolution for zoom support (780*2 = 1560px wide, supports 2x zoom)
    const pngBuffer = await sharp(Buffer.from(svg), { density: 200 })
      .png()
      .toBuffer();

    // Return PNG image
    res.type('image/png');
    res.send(pngBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
