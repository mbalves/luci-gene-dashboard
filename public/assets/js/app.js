/* ── Estado ──────────────────────────────────────────────────────────────── */
const state = {
  patients: [],
  filteredPatients: [],
  currentPatient: null,
  currentFile: null,
  geneOffset: 0,
  geneLimit: 50,
  geneQuery: '',
  pollingIntervals: {},
};

/* ── Helpers de API ──────────────────────────────────────────────────────── */
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`/api${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ── Notificação (Toast) ─────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

/* ── Navegação ───────────────────────────────────────────────────────────── */
function navigate(view, patientId) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  if (view === 'patients') {
    document.getElementById('view-patients').style.display = '';
    document.getElementById('nav-patients').classList.add('active');
    loadPatients();
  } else if (view === 'patient' && patientId) {
    document.getElementById('view-patient').style.display = '';
    // reset report panel
    document.getElementById('report-section').style.display = 'none';
    document.getElementById('report-iframe').src = 'about:blank';
    const bl = document.getElementById('btn-laudo');
    if (bl) bl.textContent = 'Laudo Nutrigenético';
    loadPatientDetail(patientId);
  } else if (view === 'search') {
    document.getElementById('view-search').style.display = '';
    document.getElementById('nav-search').classList.add('active');
  }
}

/* ══ VISÃO: LISTA DE PACIENTES ═══════════════════════════════════════════════ */

async function loadPatients() {
  try {
    state.patients = await api('GET', '/patients');
    state.filteredPatients = [...state.patients];
    renderPatientGrid();
    const c = state.patients.length;
    document.getElementById('patient-count').textContent =
      `${c} paciente${c !== 1 ? 's' : ''} cadastrado${c !== 1 ? 's' : ''}`;
  } catch (err) {
    document.getElementById('patients-grid').innerHTML =
      `<div class="no-results"><div class="no-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

function filterPatients(q) {
  const term = q.toLowerCase();
  state.filteredPatients = state.patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(term) ||
    (p.email || '').toLowerCase().includes(term)
  );
  renderPatientGrid();
}

function renderPatientGrid() {
  const grid = document.getElementById('patients-grid');
  if (state.filteredPatients.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🧬</div>
        <h3>Nenhum paciente cadastrado</h3>
        <p>Adicione o primeiro paciente para começar.</p>
        <button class="btn btn-primary" onclick="openPatientModal()">+ Novo Paciente</button>
      </div>`;
    return;
  }

  grid.innerHTML = state.filteredPatients.map(p => {
    const initials = (p.first_name[0] + p.last_name[0]).toUpperCase();
    const dob = p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('pt-BR') : '—';
    const hasFiles = p.file_count > 0;
    const sexLabel = { male: 'Masculino', female: 'Feminino', other: 'Outro' };
    return `
      <div class="patient-tile" onclick="navigate('patient', ${p.id})">
        <div class="tile-avatar">${initials}</div>
        <div class="tile-name">${esc(p.first_name)} ${esc(p.last_name)}</div>
        <div class="tile-meta">
          ${p.date_of_birth ? `Nasc.: ${dob}<br>` : ''}
          ${p.email ? esc(p.email) + '<br>' : ''}
          ${p.sex ? (sexLabel[p.sex] || capitalize(p.sex)) : ''}
        </div>
        <span class="tile-badge ${hasFiles ? '' : 'no-files'}">
          ${hasFiles ? `🧬 ${p.file_count} arquivo${p.file_count !== 1 ? 's' : ''}` : 'Sem arquivos DNA'}
        </span>
        ${hasFiles ? `<a class="tile-report-btn" href="/api/report/${p.id}" target="_blank" onclick="event.stopPropagation()" title="Abrir laudo nutrigenético">📋 Laudo</a>` : ''}
      </div>`;
  }).join('');
}

/* ══ VISÃO: DETALHE DO PACIENTE ══════════════════════════════════════════════ */

async function loadPatientDetail(id) {
  try {
    const p = await api('GET', `/patients/${id}`);
    state.currentPatient = p;

    const initials = (p.first_name[0] + p.last_name[0]).toUpperCase();
    const dob = p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('pt-BR') : '—';
    const sexLabel = { male: 'Masculino', female: 'Feminino', other: 'Outro' };

    document.getElementById('patient-card').innerHTML = `
      <div class="patient-card-avatar">${initials}</div>
      <div class="patient-card-info">
        <div class="patient-card-name">${esc(p.first_name)} ${esc(p.last_name)}</div>
        <div class="patient-card-details">
          <div class="detail-item"><span class="detail-label">Data de Nascimento</span><span class="detail-value">${dob}</span></div>
          <div class="detail-item"><span class="detail-label">Sexo</span><span class="detail-value">${p.sex ? (sexLabel[p.sex] || capitalize(p.sex)) : '—'}</span></div>
          <div class="detail-item"><span class="detail-label">E-mail</span><span class="detail-value">${p.email ? esc(p.email) : '—'}</span></div>
          <div class="detail-item"><span class="detail-label">Telefone</span><span class="detail-value">${p.phone ? esc(p.phone) : '—'}</span></div>
          ${p.notes ? `<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Observações</span><span class="detail-value">${esc(p.notes)}</span></div>` : ''}
        </div>
      </div>`;

    renderFilesList(p.files || []);
    document.getElementById('gene-results').innerHTML = '';
    document.getElementById('gene-query').value = '';
  } catch (err) {
    showToast(err.message, 'error');
    navigate('patients');
  }
}

function renderFilesList(files) {
  const list = document.getElementById('files-list');
  if (files.length === 0) {
    list.innerHTML = `<p style="color:var(--text-sub);font-size:13px">Nenhum arquivo de DNA enviado ainda.</p>`;
    return;
  }

  const statusLabel = { ready: 'pronto', processing: 'processando', error: 'erro' };

  list.innerHTML = files.map(f => {
    const uploaded = new Date(f.uploaded_at).toLocaleString('pt-BR');
    const fmt = f.file_format !== 'unknown' ? f.file_format.toUpperCase() : '?';
    const snps = f.total_snps ? `${f.total_snps.toLocaleString('pt-BR')} SNPs` : '';
    const statusTxt = statusLabel[f.status] || f.status;
    return `
      <div class="file-row" id="file-${f.id}">
        <span class="file-icon">🧬</span>
        <div class="file-info">
          <div class="file-name" title="${esc(f.filename)}">${esc(f.filename)}</div>
          <div class="file-meta">${fmt} · ${snps} · ${uploaded}</div>
        </div>
        <span class="file-status ${f.status}">${statusTxt}</span>
        <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px" onclick="deleteFile(${f.id}, event)">✕</button>
      </div>`;
  }).join('');

  files.filter(f => f.status === 'processing').forEach(f => startPolling(f.id));
}

/* ── Upload de Arquivo ────────────────────────────────────────────────────── */
async function uploadFile(input) {
  const file = input.files[0];
  if (!file || !state.currentPatient) return;
  input.value = '';

  const patientId = state.currentPatient.id;
  const formData = new FormData();
  formData.append('dnafile', file);

  const list = document.getElementById('files-list');
  const tempId = `upload-${Date.now()}`;
  list.insertAdjacentHTML('afterbegin', `
    <div class="upload-progress" id="${tempId}">
      <div class="spinner"></div>
      <span>Enviando <strong>${esc(file.name)}</strong>…</span>
    </div>`);

  try {
    const res = await fetch(`/api/files/upload/${patientId}`, {
      method: 'POST', body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha no envio');

    document.getElementById(tempId)?.remove();
    showToast('Arquivo recebido — processando em segundo plano…', 'success');

    const refreshed = await api('GET', `/patients/${patientId}`);
    state.currentPatient = refreshed;
    renderFilesList(refreshed.files || []);

    if (data.file_id) startPolling(data.file_id);

  } catch (err) {
    document.getElementById(tempId)?.remove();
    showToast(err.message, 'error');
  }
}

function startPolling(fileId) {
  if (state.pollingIntervals[fileId]) return;
  const statusLabel = { ready: 'pronto', processing: 'processando', error: 'erro' };

  state.pollingIntervals[fileId] = setInterval(async () => {
    try {
      const f = await api('GET', `/files/${fileId}/status`);
      const row = document.getElementById(`file-${fileId}`);
      if (row) {
        const badge = row.querySelector('.file-status');
        if (badge) {
          badge.className = `file-status ${f.status}`;
          badge.textContent = statusLabel[f.status] || f.status;
        }
        const meta = row.querySelector('.file-meta');
        if (meta && f.total_snps) {
          const parts = meta.textContent.split('·');
          parts[1] = ` ${f.total_snps.toLocaleString('pt-BR')} SNPs `;
          meta.textContent = parts.join('·');
        }
      }
      if (f.status !== 'processing') {
        clearInterval(state.pollingIntervals[fileId]);
        delete state.pollingIntervals[fileId];
        if (f.status === 'ready') showToast(`Arquivo pronto: ${f.total_snps?.toLocaleString('pt-BR')} SNPs importados`, 'success');
        if (f.status === 'error')  showToast(`Erro no processamento: ${f.error_msg}`, 'error');
      }
    } catch {
      clearInterval(state.pollingIntervals[fileId]);
      delete state.pollingIntervals[fileId];
    }
  }, 2500);
}

async function deleteFile(fileId, ev) {
  ev.stopPropagation();
  if (!confirm('Excluir este arquivo e todos os seus dados de SNP?')) return;
  try {
    await api('DELETE', `/files/${fileId}`);
    clearInterval(state.pollingIntervals[fileId]);
    delete state.pollingIntervals[fileId];
    showToast('Arquivo excluído', 'success');
    const refreshed = await api('GET', `/patients/${state.currentPatient.id}`);
    state.currentPatient = refreshed;
    renderFilesList(refreshed.files || []);
  } catch (err) { showToast(err.message, 'error'); }
}

/* ══ BUSCA DE GENES ══════════════════════════════════════════════════════════ */

async function searchGenes(offset = 0) {
  const q = document.getElementById('gene-query').value.trim();
  if (!q) return;
  state.geneQuery = q;
  state.geneOffset = offset;
  await runGeneSearch(q, state.currentPatient?.id, offset, document.getElementById('gene-results'));
}

async function loadAllGenes(offset = 0) {
  state.geneOffset = offset;
  const container = document.getElementById('gene-results');
  container.innerHTML = `<div class="spinner"></div>`;
  try {
    const data = await api('GET', `/genes/patient/${state.currentPatient.id}?limit=${state.geneLimit}&offset=${offset}`);
    renderGeneTable(data.results, container, data.total, offset, (pg) => loadAllGenes(pg));
  } catch (err) {
    container.innerHTML = `<div class="no-results"><div class="no-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

async function globalSearch() {
  const q = document.getElementById('global-query').value.trim();
  if (!q) return;
  await runGeneSearch(q, null, 0, document.getElementById('global-results'));
}

async function runGeneSearch(q, patientId, offset, container) {
  container.innerHTML = `<div class="spinner"></div>`;
  try {
    const params = new URLSearchParams({ q, limit: state.geneLimit, offset });
    if (patientId) params.append('patientId', patientId);
    const data = await api('GET', `/genes/search?${params}`);

    // Banner informativo para busca por nome de gene com NCBI
    let banner = '';
    if (data.gene_query) {
      if (data.ncbi_total > 0 && data.patient_match_count === 0) {
        banner = `
          <div class="gene-banner warn">
            🧬 <strong>${esc(data.gene_query)}</strong>:
            ${data.ncbi_total.toLocaleString('pt-BR')} variantes encontradas no NCBI —
            nenhuma presente no arquivo deste paciente.
          </div>`;
      } else if (data.ncbi_total > 0) {
        const filtered = data.patient_match_count > data.results.length
          ? ` · <strong>${data.results.length}</strong> com significância clínica conhecida` : '';
        banner = `
          <div class="gene-banner info">
            🧬 <strong>${esc(data.gene_query)}</strong>:
            ${data.ncbi_total.toLocaleString('pt-BR')} variantes no NCBI ·
            <strong>${data.patient_match_count.toLocaleString('pt-BR')}</strong> no arquivo do paciente${filtered}
          </div>`;
      }
    }

    if (data.results.length === 0) {
      container.innerHTML = banner + `
        <div class="no-results">
          <div class="no-icon">🔍</div>
          <p>Nenhum resultado encontrado para <strong>${esc(q)}</strong>.</p>
          <p style="margin-top:8px;font-size:12px">Tente um código RS diferente, nome de gene ou cromossomo:posição.</p>
        </div>`;
      return;
    }

    const tableHtml = buildGeneTableHtml(data.results, data.total, offset,
      (pg) => runGeneSearch(q, patientId, pg, container));

    container.innerHTML = banner + tableHtml;
  } catch (err) {
    container.innerHTML = `<div class="no-results"><div class="no-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

// Global pagination callback — avoids serializing closures in onclick attributes
let _onGenePage = null;
function _genePage(offset) { if (_onGenePage) _onGenePage(offset); }

function renderGeneTable(rows, container, total, offset, onPage) {
  container.innerHTML = buildGeneTableHtml(rows, total, offset, onPage);
}

function buildGeneTableHtml(rows, total, offset, onPage) {
  _onGenePage = onPage;

  const showGenotype = rows.some(r => r.genotype != null);

  const thead = `
    <tr>
      <th>Código RS</th>
      <th>Gene</th>
      <th>Crom.</th>
      <th>Posição</th>
      ${showGenotype ? '<th>Genótipo</th>' : ''}
      <th>Significância Clínica</th>
      <th>MAF</th>
    </tr>`;

  const tbody = rows.map(r => `
    <tr onclick="openRsDetail('${r.rsid}', ${state.currentPatient?.id || 'null'})">
      <td class="rsid-cell">${r.rsid}</td>
      <td class="gene-name-cell">${r.gene_name ? esc(r.gene_name) : '<span style="color:var(--text-sub)">—</span>'}</td>
      <td class="chrom-cell">${r.chromosome || '—'}</td>
      <td class="pos-cell">${r.position ? Number(r.position).toLocaleString('pt-BR') : '—'}</td>
      ${showGenotype ? `<td><span class="genotype-badge">${r.genotype || '?'}</span></td>` : ''}
      <td>${clinSigBadge(r.clinical_significance)}</td>
      <td style="font-size:11px;color:var(--text-sub)">${r.global_maf ? esc(String(r.global_maf).slice(0, 30)) : '—'}</td>
    </tr>`).join('');

  const limit = state.geneLimit;
  const hasPrev = offset > 0;
  const hasNext = offset + rows.length < total;

  const pagination = (total > limit) ? `
    <div class="pagination">
      <button class="btn btn-secondary" ${hasPrev ? '' : 'disabled'} onclick="_genePage(${Math.max(0, offset - limit)})">← Anterior</button>
      <span class="page-info">Exibindo ${offset + 1}–${Math.min(offset + rows.length, total)} de ${total.toLocaleString('pt-BR')}</span>
      <button class="btn btn-secondary" ${hasNext ? '' : 'disabled'} onclick="_genePage(${offset + limit})">Próximo →</button>
    </div>` : `<div class="page-info" style="padding:12px 0;color:var(--text-sub)">${total} resultado${total !== 1 ? 's' : ''}</div>`;

  return `
    <table class="gene-table">
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table>
    ${pagination}`;
}

function clinSigBadge(sig) {
  if (!sig || sig === '.' || sig.trim() === '') return '<span style="color:var(--text-sub)">—</span>';
  const s = sig.toLowerCase();
  let cls = 'other';
  if (s.includes('benign') && !s.includes('pathogenic')) cls = 'benign';
  else if (s.includes('pathogenic')) cls = 'pathogenic';
  else if (s.includes('uncertain') || s.includes('vus')) cls = 'uncertain';

  // Tradução dos termos clínicos comuns
  const traducoes = {
    'benign': 'Benigno',
    'likely benign': 'Provavelmente benigno',
    'pathogenic': 'Patogênico',
    'likely pathogenic': 'Provavelmente patogênico',
    'uncertain significance': 'Significância incerta',
    'conflicting interpretations of pathogenicity': 'Interpretações conflitantes',
    'not provided': 'Não informado',
    'risk factor': 'Fator de risco',
  };
  const traduzido = traducoes[s] || sig.slice(0, 40);
  return `<span class="clinsig ${cls}">${esc(traduzido)}</span>`;
}

/* ── Painel Lateral: Detalhe do RS ───────────────────────────────────────── */
async function openRsDetail(rsid, patientId) {
  document.getElementById('drawer-rsid').textContent = rsid;
  document.getElementById('drawer-content').innerHTML = `<div class="spinner"></div>`;
  document.getElementById('drawer-overlay').classList.add('open');

  try {
    const params = patientId ? `?patientId=${patientId}` : '';
    const d = await api('GET', `/genes/${rsid}${params}`);

    const rows = [
      { label: 'Código RS',              val: d.rsid,            mono: true },
      { label: 'Gene',                   val: d.gene_name },
      { label: 'ID do Gene',             val: d.gene_id,         mono: true },
      { label: 'Cromossomo',             val: d.chromosome },
      { label: 'Posição',                val: d.position ? Number(d.position).toLocaleString('pt-BR') : null, mono: true },
      { label: 'Genótipo do Paciente',   val: d.genotype,        mono: true },
      { label: 'Significância Clínica',  val: d.clinical_significance },
      { label: 'Doenças Associadas',     val: d.disease_names },
      { label: 'Frequência Alélica (MAF)', val: d.global_maf },
      { label: 'Última Atualização',     val: d.enriched_at ? new Date(d.enriched_at).toLocaleString('pt-BR') : null },
    ].filter(r => r.val);

    document.getElementById('drawer-content').innerHTML = `
      <div class="detail-section">
        <div class="detail-section-title">Informações do SNP</div>
        ${rows.map(r => `
          <div class="detail-row">
            <span class="detail-key">${r.label}</span>
            <span class="detail-val ${r.mono ? 'mono' : ''}">${esc(String(r.val))}</span>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px">
        <a href="https://www.ncbi.nlm.nih.gov/snp/${rsid}" target="_blank" rel="noopener"
           class="btn btn-secondary" style="width:100%;justify-content:center">
          Ver no NCBI dbSNP ↗
        </a>
      </div>`;
  } catch (err) {
    document.getElementById('drawer-content').innerHTML =
      `<div class="no-results"><div class="no-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('open');
}

/* ══ MODAL DE PACIENTE ═══════════════════════════════════════════════════════ */

let editingPatientId = null;

function openPatientModal() {
  editingPatientId = null;
  document.getElementById('modal-title').textContent = 'Novo Paciente';
  document.getElementById('modal-submit').textContent = 'Salvar Paciente';
  document.getElementById('patient-form').reset();
  document.getElementById('modal-overlay').classList.add('open');
}

function openEditModal() {
  if (!state.currentPatient) return;
  const p = state.currentPatient;
  editingPatientId = p.id;
  document.getElementById('modal-title').textContent = 'Editar Paciente';
  document.getElementById('modal-submit').textContent = 'Atualizar Paciente';

  const form = document.getElementById('patient-form');
  form.reset();
  form.first_name.value    = p.first_name || '';
  form.last_name.value     = p.last_name  || '';
  form.date_of_birth.value = p.date_of_birth ? p.date_of_birth.slice(0, 10) : '';
  form.sex.value           = p.sex   || '';
  form.email.value         = p.email || '';
  form.phone.value         = p.phone || '';
  form.notes.value         = p.notes || '';

  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(ev) {
  if (ev && ev.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('open');
}

async function submitPatient(ev) {
  ev.preventDefault();
  const form = ev.target;
  const submit = document.getElementById('modal-submit');
  submit.disabled = true;

  const body = {
    first_name:    form.first_name.value.trim(),
    last_name:     form.last_name.value.trim(),
    date_of_birth: form.date_of_birth.value || null,
    sex:           form.sex.value || null,
    email:         form.email.value.trim() || null,
    phone:         form.phone.value.trim() || null,
    notes:         form.notes.value.trim() || null,
  };

  try {
    if (editingPatientId) {
      const updated = await api('PUT', `/patients/${editingPatientId}`, body);
      state.currentPatient = { ...state.currentPatient, ...updated };
      await loadPatientDetail(editingPatientId);
      showToast('Paciente atualizado com sucesso', 'success');
    } else {
      const created = await api('POST', '/patients', body);
      showToast('Paciente cadastrado com sucesso', 'success');
      document.getElementById('modal-overlay').classList.remove('open');
      navigate('patient', created.id);
      return;
    }
    document.getElementById('modal-overlay').classList.remove('open');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submit.disabled = false;
  }
}

function toggleReport() {
  if (!state.currentPatient) return;
  const section = document.getElementById('report-section');
  const iframe  = document.getElementById('report-iframe');
  const extLink = document.getElementById('report-external-link');
  const btn     = document.getElementById('btn-laudo');
  const url     = `/api/report/${state.currentPatient.id}`;

  const isOpen = section.style.display !== 'none';
  if (isOpen) {
    section.style.display = 'none';
    iframe.src = 'about:blank';
    btn.textContent = 'Laudo Nutrigenético';
  } else {
    extLink.href = url;
    if (iframe.src !== url) iframe.src = url;
    section.style.display = '';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    btn.textContent = '✕ Fechar Laudo';
  }
}

async function deleteCurrentPatient() {
  if (!state.currentPatient) return;
  const p = state.currentPatient;
  if (!confirm(`Excluir o paciente ${p.first_name} ${p.last_name} e TODOS os seus dados de DNA? Esta ação não pode ser desfeita.`)) return;
  try {
    await api('DELETE', `/patients/${p.id}`);
    showToast('Paciente excluído', 'success');
    navigate('patients');
  } catch (err) { showToast(err.message, 'error'); }
}

/* ── Atalhos de teclado ──────────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
    document.getElementById('modal-overlay').classList.remove('open');
  }
});

/* ── Utilitários ─────────────────────────────────────────────────────────── */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/* ── Inicialização ───────────────────────────────────────────────────────── */
navigate('patients');
