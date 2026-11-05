'use strict';

// Pathway map gene boxes — calibrated coordinates for 1650x1275 PNG.
// x, y, w, h are percentages of the base image dimensions (1650x1275px).
// Start with 15 key genes, expand after visual verification.

const PATHWAY_MAP = [
  // ── METHYLATION CYCLE (top-left, core) ──────────────────────────────────
  { id: 'mthfr_677',  label: 'MTHFR 677',  rsid: 'rs1801133', riskAllele: 'T', hetIsRisk: false, protectiveAllele: null, x: 12, y: 10, w: 7, h: 4 },
  { id: 'mthfr_1298', label: 'MTHFR 1298', rsid: 'rs1801131', riskAllele: 'C', hetIsRisk: false, protectiveAllele: null, x: 12, y: 15, w: 7, h: 4 },
  { id: 'mtr',        label: 'MTR',        rsid: 'rs1805087', riskAllele: 'A', hetIsRisk: false, protectiveAllele: null, x: 22, y: 10, w: 5, h: 4 },
  { id: 'mtrr',       label: 'MTRR',       rsid: 'rs1801394', riskAllele: 'G', hetIsRisk: false, protectiveAllele: null, x: 22, y: 15, w: 5, h: 4 },
  { id: 'cbs',        label: 'CBS',        rsid: 'rs234706',  riskAllele: 'G', hetIsRisk: false, protectiveAllele: null, x: 32, y: 10, w: 5, h: 4 },

  // ── NEUROTRANSMITTERS (left-center) ─────────────────────────────────────
  { id: 'comt',       label: 'COMT',       rsid: 'rs4680',    riskAllele: 'A', hetIsRisk: false, protectiveAllele: null, x: 12, y: 30, w: 5, h: 4 },
  { id: 'maoa',       label: 'MAOA',       rsid: 'rs6323',    riskAllele: 'T', hetIsRisk: true,  protectiveAllele: null, x: 22, y: 30, w: 5, h: 4 },
  { id: 'bdnf',       label: 'BDNF',       rsid: 'rs6265',    riskAllele: 'T', hetIsRisk: false, protectiveAllele: null, x: 32, y: 30, w: 5, h: 4 },

  // ── CARDIOVASCULAR / LIPID (center) ─────────────────────────────────────
  { id: 'apoe_1',     label: 'APOE E4',    rsid: 'rs429358',  riskAllele: 'C', hetIsRisk: true,  protectiveAllele: null, x: 12, y: 50, w: 7, h: 4 },
  { id: 'fto',        label: 'FTO',        rsid: 'rs9939609', riskAllele: 'A', hetIsRisk: false, protectiveAllele: null, x: 22, y: 50, w: 5, h: 4 },
  { id: 'pon1',       label: 'PON1',       rsid: 'rs662',     riskAllele: 'A', hetIsRisk: false, protectiveAllele: null, x: 32, y: 50, w: 5, h: 4 },

  // ── INFLAMMATION (lower-left) ───────────────────────────────────────────
  { id: 'tnf',        label: 'TNF',        rsid: 'rs1800629', riskAllele: 'A', hetIsRisk: true,  protectiveAllele: null, x: 12, y: 68, w: 5, h: 4 },
  { id: 'il6',        label: 'IL-6',       rsid: 'rs1800795', riskAllele: 'G', hetIsRisk: false, protectiveAllele: null, x: 22, y: 68, w: 5, h: 4 },

  // ── METABOLISM & LONGEVITY (lower-center) ──────────────────────────────
  { id: 'sod2',       label: 'SOD2',       rsid: 'rs4880',    riskAllele: 'T', hetIsRisk: false, protectiveAllele: null, x: 32, y: 68, w: 5, h: 4 },
  { id: 'vdr',        label: 'VDR',        rsid: 'rs2228570', riskAllele: 'A', hetIsRisk: false, protectiveAllele: null, x: 42, y: 68, w: 5, h: 4 },
];

module.exports = { PATHWAY_MAP };
