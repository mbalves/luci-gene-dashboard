'use strict';
const express = require('express');
const router  = express.Router();
const { pool } = require('../db/index');
const { PANEL } = require('../data/panel');

// ─── Risk scoring ────────────────────────────────────────────────────────────
function countRiskAlleles(genotype, riskAllele) {
  if (!genotype || !riskAllele) return 0;
  // genotype is 2 chars like "AA", "AG", "TC"
  return [...genotype].filter(a => a === riskAllele).length;
}

function scoreSection(section, snpMap) {
  let riskCount = 0;
  let totalAlleles = 0;
  const detail = [];

  for (const snp of section.snps) {
    const genotype = snpMap.get(snp.rsid.toLowerCase());
    const ra = countRiskAlleles(genotype, snp.riskAllele);
    riskCount += ra;
    totalAlleles += 2;
    detail.push({ ...snp, genotype: genotype || null, riskCount: ra });
  }

  const pct = totalAlleles > 0 ? Math.round((riskCount / totalAlleles) * 1000) / 10 : 0;
  const level = pct < 33 ? 'Baixo' : pct < 67 ? 'Médio' : 'Alto';
  const color = pct < 33 ? '#22c55e' : pct < 67 ? '#f97316' : '#ef4444';
  return { pct, level, color, detail, riskCount, totalAlleles };
}

// ─── HTML template ────────────────────────────────────────────────────────────
function renderReport(patient, sections) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const summaryCards = sections.map(({ section, score }) => {
    const fill = Math.min(100, score.pct);
    return `
      <div class="sum-card">
        <div class="sum-title">${section.title}</div>
        <div class="sum-bar-wrap">
          <div class="sum-bar-track">
            <div class="sum-bar-fill" style="width:${fill}%;background:${score.color}"></div>
          </div>
          <span class="sum-pct" style="color:${score.color}">${score.pct}%</span>
        </div>
        <div class="sum-level" style="color:${score.color}">Risco ${score.level}</div>
      </div>`;
  }).join('');

  const sectionHtml = sections.map(({ section, score }) => {
    const rows = score.detail.map(snp => {
      const gt = snp.genotype || '—';
      const ra = snp.riskAllele;
      const rc = snp.riskCount;
      const dot = rc === 0 ? '●' : rc === 1 ? '◐' : '●';
      const dotColor = rc === 0 ? '#22c55e' : rc === 1 ? '#f97316' : '#ef4444';
      return `
        <tr>
          <td class="td-gene">${snp.gene}</td>
          <td class="td-rs">${snp.rsid}</td>
          <td class="td-allele">${ra}</td>
          <td class="td-gt">${gt}</td>
          <td class="td-dot"><span style="color:${dotColor};font-size:1.2em">${dot}</span></td>
        </tr>`;
    }).join('');

    const fill = Math.min(100, score.pct);
    const coverage = score.detail.filter(s => s.genotype).length;
    const total = score.detail.length;

    return `
      <div class="section-block" id="${section.id}">
        <div class="sec-header">
          <div class="sec-meta">
            <span class="sec-cat">${section.category}</span>
            <h2 class="sec-title">${section.title}</h2>
            <p class="sec-desc">${section.description}</p>
          </div>
          <div class="sec-score">
            <div class="score-pct" style="color:${score.color}">${score.pct}%</div>
            <div class="score-label" style="color:${score.color}">Risco ${score.level}</div>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width:${fill}%;background:${score.color}"></div>
            </div>
            <div class="score-coverage">${coverage}/${total} SNPs genotipados</div>
          </div>
        </div>
        <table class="snp-table">
          <thead>
            <tr>
              <th>Gene</th><th>dbSNP</th><th>Alelo Risco</th><th>Genótipo</th><th>Resultado</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join('');

  const catGroups = {};
  for (const { section, score } of sections) {
    if (!catGroups[section.category]) catGroups[section.category] = [];
    catGroups[section.category].push({ section, score });
  }

  const navLinks = Object.keys(catGroups).map(cat => {
    const links = catGroups[cat].map(({ section, score }) =>
      `<a href="#${section.id}" style="color:${score.color}">${section.title}</a>`
    ).join('');
    return `<div class="nav-group"><strong>${cat}</strong>${links}</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Laudo Nutrigenético – ${patient.first_name} ${patient.last_name}</title>
<style>
/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base ── */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1e293b;
  background: #f1f5f9;
  line-height: 1.5;
}

/* ── Top header bar (screen only) ── */
.topbar {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  color: #fff;
  padding: 20px 28px 18px;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.topbar-inner {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}
.topbar h1 { font-size: 18px; font-weight: 700; white-space: nowrap; }
.topbar .subtitle { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.patient-pills {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.pi-item label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; display: block; }
.pi-item span  { font-size: 12px; font-weight: 600; }

/* ── Page shell: sidebar + main ── */
.shell {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 80px);
}

/* ── Sidebar ── */
.sidebar {
  width: 210px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  padding: 14px 12px;
  font-size: 11px;
}
.sidebar h3 {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 10px;
}
.nav-group { margin-bottom: 10px; }
.nav-group strong {
  display: block;
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 3px;
  padding-top: 6px;
  border-top: 1px solid #e2e8f0;
}
.nav-group a {
  display: block;
  padding: 2px 6px;
  border-radius: 3px;
  text-decoration: none;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background .1s;
  color: inherit;
}
.nav-group a:hover { background: #f1f5f9; }

/* ── Main content ── */
.main {
  flex: 1;
  min-width: 0;          /* prevents flex child from overflowing */
  padding: 20px 20px 60px;
}

/* ── Intro card ── */
.section-intro {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px 22px;
  margin-bottom: 20px;
}
.section-intro h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.section-intro p  { color: #475569; font-size: 12px; }

/* ── Summary grid ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
  margin-bottom: 28px;
}
.sum-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
}
.sum-title { font-size: 11px; font-weight: 600; color: #1e293b; margin-bottom: 7px; }
.sum-bar-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.sum-bar-track {
  flex: 1;
  height: 7px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  min-width: 0;
}
.sum-bar-fill {
  height: 100%;
  border-radius: 4px;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.sum-pct { font-size: 11px; font-weight: 700; width: 38px; text-align: right; flex-shrink: 0; }
.sum-level { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }

/* ── Section blocks ── */
.section-block {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 18px 20px;
  margin-bottom: 14px;
  page-break-inside: avoid;
}

/* Section header: two columns, wraps on narrow */
.sec-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: start;
  margin-bottom: 14px;
}
.sec-meta { min-width: 0; }
.sec-cat   { font-size: 9px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 2px; }
.sec-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; line-height: 1.3; }
.sec-desc  { font-size: 11px; color: #64748b; line-height: 1.4; }

.sec-score { text-align: right; width: 150px; flex-shrink: 0; }
.score-pct   { font-size: 26px; font-weight: 800; line-height: 1; white-space: nowrap; }
.score-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; margin: 2px 0 6px; }
.score-bar-track { height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.score-bar-fill  { height: 100%; border-radius: 3px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.score-coverage  { font-size: 10px; color: #94a3b8; }

/* ── SNP table ── */
.snp-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.snp-table th {
  background: #f8fafc;
  padding: 5px 10px;
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .4px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}
.snp-table td { padding: 4px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.snp-table tr:last-child td { border-bottom: none; }
.td-gene   { font-weight: 600; color: #0f172a; }
.td-rs     { font-family: monospace; color: #475569; white-space: nowrap; }
.td-allele { font-weight: 700; font-family: monospace; }
.td-gt     { font-family: monospace; background: #f8fafc; border-radius: 3px; padding: 1px 6px; white-space: nowrap; }
.td-dot    { text-align: center; width: 40px; }

/* ── Print button ── */
.print-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #0f172a;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
  z-index: 500;
}
.print-btn:hover { background: #1e3a5f; }

/* ── Print overrides ── */
@media print {
  body { background: #fff; font-size: 11px; }
  @page { margin: 12mm 14mm; }
  .no-print, .sidebar, .print-btn { display: none !important; }
  .shell { display: block; }
  .main  { padding: 0; }
  .section-block { border: 1px solid #ddd; margin-bottom: 10px; padding: 12px; }
  .sec-header { grid-template-columns: 1fr auto; }
  .print-header { display: block !important; }
  .topbar { display: none !important; }
  .sum-bar-fill, .score-bar-fill { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}

/* ── Print-only header ── */
.print-header {
  display: none;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  color: #fff;
  padding: 16px 20px;
  margin-bottom: 16px;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.print-header h1   { font-size: 16px; font-weight: 700; }
.print-header .sub { font-size: 10px; color: #94a3b8; margin-top: 3px; }
</style>
</head>
<body>

<!-- Screen header (hidden on print) -->
<div class="topbar no-print">
  <div class="topbar-inner">
    <div>
      <h1>Laudo Nutrigenético</h1>
      <div class="subtitle">Análise de variantes genéticas (SNPs) em 55 painéis</div>
    </div>
    <div class="patient-pills">
      <div class="pi-item"><label>Paciente</label><span>${patient.first_name} ${patient.last_name}</span></div>
      <div class="pi-item"><label>Nascimento</label><span>${patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('pt-BR') : '—'}</span></div>
      <div class="pi-item"><label>Data do Laudo</label><span>${now}</span></div>
    </div>
  </div>
</div>

<!-- Print-only header -->
<div class="print-header">
  <h1>Laudo Nutrigenético — ${patient.first_name} ${patient.last_name}</h1>
  <div class="sub">303 SNPs em 55 painéis &nbsp;|&nbsp; Data: ${now} &nbsp;|&nbsp; Luci Gene Dashboard</div>
</div>

<!-- Sidebar + main shell -->
<div class="shell">

  <nav class="sidebar no-print">
    <h3>Seções</h3>
    ${navLinks}
  </nav>

  <div class="main">

    <div class="section-intro">
      <h2>Resumo do Perfil Genético</h2>
      <p>Este relatório apresenta a análise de variantes genéticas (SNPs) associadas a predisposições em 55 áreas da saúde. Os percentuais indicam a carga de alelos de risco encontrados no genoma do paciente. <strong>Este resultado tem finalidade informativa e não substitui avaliação clínica.</strong></p>
    </div>

    <div class="summary-grid">
      ${summaryCards}
    </div>

    ${sectionHtml}

  </div><!-- /.main -->
</div><!-- /.shell -->

<button class="print-btn no-print" onclick="window.print()">🖨 Imprimir / Salvar PDF</button>

</body>
</html>`;
}

// ─── Route ────────────────────────────────────────────────────────────────────
router.get('/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    // Load patient
    const pRes = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);
    if (pRes.rows.length === 0) return res.status(404).send('Paciente não encontrado');
    const patient = pRes.rows[0];

    // Load SNPs into map (lowercase rsid → genotype)
    const sRes = await pool.query(
      'SELECT rsid, genotype FROM patient_snps WHERE patient_id = $1',
      [patientId]
    );
    const snpMap = new Map();
    for (const row of sRes.rows) {
      snpMap.set(row.rsid.toLowerCase(), row.genotype);
    }

    // Score each section
    const sections = PANEL
      .filter(s => s.snps.length > 0)
      .map(section => ({ section, score: scoreSection(section, snpMap) }));

    const html = renderReport(patient, sections);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).send('Erro ao gerar laudo: ' + err.message);
  }
});

module.exports = router;
