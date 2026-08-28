// ============================================================
// PACIENTES
// ============================================================

// Variables de estado
let pacientesData = [];
let filterEstado = 'todos';
let searchQuery = '';
let pacientesListener = null;
let currentPacienteId = null;

// Helper
function $(id) { return document.getElementById(id); }

// ============================================================
// RENDER LISTADO DE PACIENTES
// ============================================================
function renderPacientes() {
  const el = $('view-pacientes');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Pacientes</div>
        <div class="page-subtitle" id="pacientes-count">Cargando...</div>
      </div>
      <button class="btn btn-primary" onclick="renderNuevoPaciente()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo paciente
      </button>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
      <div style="position:relative;flex:1;max-width:400px;">
        <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);opacity:.4" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="pac-search-input" class="form-control" style="padding-left:34px;" placeholder="Buscar por nombre, DNI, email o teléfono..." oninput="aplicarFiltrosPacientes()">
      </div>
      <select id="pac-filtro-estado" class="form-control" style="width:160px;" onchange="aplicarFiltrosPacientes()">
        <option value="todos">Todos los estados</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>
      <button class="btn btn-secondary" onclick="aplicarFiltrosPacientes()">Buscar</button>
    </div>

    <div id="modal-eliminar-paciente" style="display:none;position:fixed;inset:0;z-index:9000;align-items:center;justify-content:center;background:rgba(0,0,0,.45);">
      <div class="card" style="width:100%;max-width:420px;margin:0 16px;padding:28px 24px;">
        <div style="font-weight:700;font-size:16px;margin-bottom:8px;">Eliminar paciente</div>
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:20px;">
          ¿Estás seguro de que querés eliminar a <strong id="modal-nombre-paciente"></strong>?
          Esta acción no se puede deshacer y eliminará todos sus datos.
        </p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" onclick="cerrarEliminarPaciente()">Cancelar</button>
          <button type="button" class="btn" style="background:var(--danger,#e53e3e);color:#fff;border-color:var(--danger,#e53e3e);" onclick="confirmarEliminarPaciente()">Eliminar</button>
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>DNI</th>
            <th>Contacto</th>
            <th>Obra social</th>
            <th>Última consulta</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="pac-tbody"></tbody>
      </table>
    </div>

    <div class="pac-mob-list" id="pac-mob-list" style="border-radius:10px;border:1px solid var(--border);overflow:hidden;background:#fff;display:none;"></div>
  `;

  cargarPacientes();
}

// ============================================================
// CARGAR PACIENTES DESDE FIRESTORE
// ============================================================
function cargarPacientes() {
  if (pacientesListener) {
    pacientesListener();
    pacientesListener = null;
  }

  pacientesListener = db.collection('pacientes').onSnapshot((snapshot) => {
    pacientesData = [];
    snapshot.forEach(doc => {
      pacientesData.push({ id: doc.id, ...doc.data() });
    });

    pacientesData.sort((a, b) => {
      const apellidoA = (a.apellido || '').toLowerCase();
      const apellidoB = (b.apellido || '').toLowerCase();
      if (apellidoA < apellidoB) return -1;
      if (apellidoA > apellidoB) return 1;
      const nombreA = (a.nombre || '').toLowerCase();
      const nombreB = (b.nombre || '').toLowerCase();
      return nombreA.localeCompare(nombreB);
    });

    aplicarFiltrosPacientes();
  }, (error) => {
    console.error('Error cargando pacientes:', error);
    const tbody = $('pac-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">Error al cargar pacientes: ${error.message}</td></tr>`;
  });
}

// ============================================================
// FILTROS Y RENDERIZADO
// ============================================================
function aplicarFiltrosPacientes() {
  const searchInput = $('pac-search-input');
  const estadoSelect = $('pac-filtro-estado');
  if (searchInput) searchQuery = searchInput.value.toLowerCase().trim();
  if (estadoSelect) filterEstado = estadoSelect.value;

  let filtered = [...pacientesData];
  if (filterEstado !== 'todos') {
    filtered = filtered.filter(p => p.estado === filterEstado);
  }
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
      const dni = (p.dni || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const telefono = (p.telefono || '').toLowerCase();
      return nombre.includes(searchQuery) || dni.includes(searchQuery) || email.includes(searchQuery) || telefono.includes(searchQuery);
    });
  }

  const countEl = $('pacientes-count');
  if (countEl) countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`;

  renderTablaPacientes(filtered);
  renderMobilePacientes(filtered);
}

function renderTablaPacientes(pacientes) {
  const tbody = $('pac-tbody');
  if (!tbody) return;

  if (pacientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">No hay pacientes que coincidan con los filtros.</td></tr>`;
    return;
  }

  let html = '';
  pacientes.forEach(p => {
    const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
    const iniciales = nombreCompleto.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    const estado = p.estado || 'activo';
    const badgeClass = estado === 'activo' ? 'badge-green' : 'badge-gray';
    const estadoLabel = estado === 'activo' ? 'Activo' : 'Inactivo';
    const dni = p.dni || '—';
    const telefono = p.telefono || '—';
    const email = p.email || '';
    const obraSocial = p.obra_social_nombre || '—';
    const ultimaConsulta = p.ultima_consulta ? formatearFecha(p.ultima_consulta) : '—';

    html += `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar" style="background:var(--teal-light);color:var(--teal);font-size:12px;flex-shrink:0;">${iniciales}</div>
            <div>
              <a href="#" onclick="verPaciente('${p.id}')" style="font-weight:600;color:var(--text);">${nombreCompleto}</a>
              <div style="font-size:11px;color:var(--text-muted);">${p.codigo || 'PAC-' + String(p.id).padStart(4,'0')}</div>
            </div>
          </div>
        </td>
        <td style="font-size:13px;">${dni}</td>
        <td>
          <div style="font-size:13px;">${telefono}</div>
          ${email ? `<div style="font-size:11px;color:var(--text-muted);">${email}</div>` : ''}
        </td>
        <td style="font-size:13px;">${obraSocial}</td>
        <td style="font-size:12px;color:var(--text-muted);">${ultimaConsulta}</td>
        <td><span class="badge ${badgeClass}">${estadoLabel}</span></td>
        <td style="white-space:nowrap;">
          <a href="#" onclick="verPaciente('${p.id}')" class="btn btn-secondary btn-sm">Ver</a>
          <button type="button" class="btn btn-sm" style="color:var(--danger,#e53e3e);border-color:var(--danger,#e53e3e);background:transparent;margin-left:4px;" onclick="abrirEliminarPaciente('${p.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function renderMobilePacientes(pacientes) {
  const container = $('pac-mob-list');
  if (!container) return;

  if (pacientes.length === 0) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;">No hay pacientes.</div>`;
    container.style.display = 'block';
    return;
  }

  let html = '';
  pacientes.forEach(p => {
    const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
    const iniciales = nombreCompleto.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    const estado = p.estado || 'activo';
    const badgeClass = estado === 'activo' ? 'badge-green' : 'badge-gray';
    const estadoLabel = estado === 'activo' ? 'Activo' : 'Inactivo';
    const dni = p.dni || '—';
    const telefono = p.telefono || '—';
    const codigo = p.codigo || 'PAC-' + String(p.id).padStart(4,'0');

    html += `
      <a href="#" onclick="verPaciente('${p.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #f1f5f9;text-decoration:none;color:inherit;">
        <div class="avatar" style="background:var(--teal-light);color:var(--teal);font-size:12px;flex-shrink:0;">${iniciales}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${nombreCompleto}</div>
          <div style="font-size:11px;color:var(--text-muted);">${codigo} · DNI ${dni}</div>
          ${telefono !== '—' ? `<div style="font-size:12px;color:var(--text);margin-top:1px;">${telefono}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="badge ${badgeClass}">${estadoLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
    `;
  });
  container.innerHTML = html;
  container.style.display = 'block';
}

// ============================================================
// ELIMINAR PACIENTE
// ============================================================
let pacienteAEliminarId = null;

function abrirEliminarPaciente(id) {
  const paciente = pacientesData.find(p => p.id === id);
  if (!paciente) return;
  pacienteAEliminarId = id;
  const nombre = `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() || 'Sin nombre';
  const nombreEl = $('modal-nombre-paciente');
  if (nombreEl) nombreEl.textContent = nombre;
  const modal = $('modal-eliminar-paciente');
  if (modal) modal.style.display = 'flex';
}

function cerrarEliminarPaciente() {
  pacienteAEliminarId = null;
  const modal = $('modal-eliminar-paciente');
  if (modal) modal.style.display = 'none';
}

function confirmarEliminarPaciente() {
  if (!pacienteAEliminarId) return;
  db.collection('pacientes').doc(pacienteAEliminarId).delete()
    .then(() => {
      cerrarEliminarPaciente();
      showToast('🗑 Paciente eliminado.');
    })
    .catch(err => alert('❌ Error al eliminar: ' + err.message));
}

document.addEventListener('click', function(e) {
  const modal = $('modal-eliminar-paciente');
  if (modal && e.target === modal) cerrarEliminarPaciente();
});

// ============================================================
// VER PACIENTE (DETALLE)
// ============================================================
function verPaciente(id) {
  currentPacienteId = id;
  db.collection('pacientes').doc(id).get().then(doc => {
    if (!doc.exists) {
      alert('Paciente no encontrado.');
      return;
    }
    const paciente = { id: doc.id, ...doc.data() };
    renderVerPaciente(paciente);
  }).catch(err => {
    alert('Error al cargar el paciente: ' + err.message);
  });
}

// ============================================================
// RENDER VISTA DETALLE (resumida, como antes)
// ============================================================
function renderVerPaciente(paciente) {
  const el = $('view-pacientes');
  if (!el) return;

  const nombreCompleto = `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() || 'Sin nombre';
  const iniciales = nombreCompleto.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const estado = paciente.estado || 'activo';
  const badgeClass = estado === 'activo' ? 'badge-green' : 'badge-gray';
  const estadoLabel = estado === 'activo' ? 'Activo' : 'Inactivo';
  const codigo = paciente.codigo || 'PAC-' + String(paciente.id).padStart(4,'0');
  const dni = paciente.dni || '—';
  const telefono = paciente.telefono || '—';
  const whatsapp = paciente.whatsapp || '—';
  const email = paciente.email || '—';
  const obraSocial = paciente.obra_social_nombre || '—';
  const plan = paciente.plan_nombre || '—';
  const primeraConsulta = paciente.creado ? formatearFecha(paciente.creado) : '—';

  el.innerHTML = `
    <style>
      @media (max-width:768px) {
        .page-header { flex-direction:column !important; align-items:flex-start !important; gap:10px !important }
        .page-header > div:first-child { flex-wrap:wrap }
        .page-header > div:last-child { display:flex; gap:8px; width:100% }
        .page-header > div:last-child .btn { flex:1; text-align:center; justify-content:center }
        #ver-tabs-wrapper .tabs { flex-wrap:nowrap !important; overflow-x:auto !important; -webkit-overflow-scrolling:touch; padding-bottom:2px; gap:0 !important; }
        #ver-tabs-wrapper .tabs .tab { white-space:nowrap; flex-shrink:0; font-size:12px; padding:8px 12px }
        #tab-resumen > div { grid-template-columns:1fr !important }
        #tab-turnos .table th:nth-child(3), #tab-turnos .table td:nth-child(3),
        #tab-turnos .table th:nth-child(4), #tab-turnos .table td:nth-child(4) { display:none }
      }
    </style>

    <div class="page-header">
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="avatar avatar-lg" style="background:var(--teal-light);color:var(--teal);font-size:20px;font-weight:700;width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:50%;">
          ${iniciales}
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div class="page-title">${nombreCompleto}</div>
            <span class="badge ${badgeClass}">${estadoLabel}</span>
          </div>
          <div class="page-subtitle">${codigo} · DNI ${dni}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <a href="#" onclick="renderPacientes()" class="btn btn-secondary">← Volver</a>
        <a href="#" onclick="renderEditarPaciente('${paciente.id}')" class="btn btn-secondary">Editar</a>
      </div>
    </div>

    <div id="ver-tabs-wrapper">
      <div class="tabs">
        <div class="tab active" onclick="switchTabPacienteDetalle(this,'tab-resumen')">Resumen</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-ficha')">Ficha médica</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-odontograma')">Odontograma</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-ortodoncia')">Ortodoncia</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-escaneos3d')">Escaneos 3D</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-notas')">Notas</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-turnos')">Turnos <span class="badge badge-blue" style="margin-left:4px;">0</span></div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-presupuestos')">Presupuestos</div>
        <div class="tab" onclick="switchTabPacienteDetalle(this,'tab-pagos')">Pagos</div>
      </div>

      <div id="tab-resumen" data-tab>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="card">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px;">Datos personales</div>
            <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg);">
              <span style="font-size:12px;color:var(--text-muted);width:110px;flex-shrink:0;">Teléfono</span>
              <span style="font-size:13px;">${telefono}</span>
            </div>
            <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg);">
              <span style="font-size:12px;color:var(--text-muted);width:110px;flex-shrink:0;">WhatsApp</span>
              <span style="font-size:13px;">${whatsapp}</span>
            </div>
            <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg);">
              <span style="font-size:12px;color:var(--text-muted);width:110px;flex-shrink:0;">Email</span>
              <span style="font-size:13px;">${email}</span>
            </div>
          </div>
          <div class="card">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px;">Clínico y cobertura</div>
            <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg);">
              <span style="font-size:12px;color:var(--text-muted);width:130px;flex-shrink:0;">Obra social</span>
              <span style="font-size:13px;">${obraSocial}</span>
            </div>
            <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg);">
              <span style="font-size:12px;color:var(--text-muted);width:130px;flex-shrink:0;">Plan</span>
              <span style="font-size:13px;">${plan}</span>
            </div>
            <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg);">
              <span style="font-size:12px;color:var(--text-muted);width:130px;flex-shrink:0;">1ra consulta</span>
              <span style="font-size:13px;">${primeraConsulta}</span>
            </div>
          </div>
        </div>
      </div>

      <div id="tab-ficha" data-tab style="display:none;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="font-size:14px;font-weight:700;">Ficha médica</div>
          </div>
          <form onsubmit="event.preventDefault(); alert('Guardar ficha médica (en desarrollo)');">
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">Enfermedades sistémicas</label>
                <textarea name="enfermedades_sistemicas" class="form-control" rows="2" placeholder="Diabetes, hipertensión, cardiopatías...">${paciente.enfermedades_sistemicas || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Cirugías previas</label>
                <textarea name="cirugias_previas" class="form-control" rows="2">${paciente.cirugias_previas || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Hábitos</label>
                <textarea name="habitos" class="form-control" rows="2" placeholder="Tabaco, alcohol, bruxismo...">${paciente.habitos || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Antecedentes familiares</label>
                <textarea name="antecedentes_familiares" class="form-control" rows="2">${paciente.antecedentes_familiares || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Datos adicionales</label>
                <textarea name="datos_adicionales" class="form-control" rows="2">${paciente.datos_adicionales || ''}</textarea>
              </div>
              <div>
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                  <input type="checkbox" name="embarazo" value="1" ${paciente.embarazo ? 'checked' : ''} style="width:16px;height:16px;">
                  Paciente en estado de embarazo
                </label>
              </div>
              <div style="display:flex;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--border);">
                <button type="submit" class="btn btn-primary">Guardar ficha médica</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div id="tab-odontograma" data-tab style="display:none;">
        <div class="card" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;opacity:0.2;">🦷</div>
          <div style="font-size:16px;font-weight:600;margin-top:12px;">Odontograma</div>
          <p style="color:var(--text-muted);font-size:13px;">Funcionalidad en desarrollo. Próximamente podrás gestionar el odontograma.</p>
        </div>
      </div>

      <div id="tab-ortodoncia" data-tab style="display:none;">
        <div class="card" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;opacity:0.2;">🦷</div>
          <div style="font-size:16px;font-weight:600;margin-top:12px;">Ortodoncia</div>
          <p style="color:var(--text-muted);font-size:13px;">Funcionalidad en desarrollo. Próximamente podrás gestionar el tratamiento ortodóncico.</p>
        </div>
      </div>

      <div id="tab-escaneos3d" data-tab style="display:none;">
        <div class="card" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;opacity:0.2;">📐</div>
          <div style="font-size:16px;font-weight:600;margin-top:12px;">Escaneos 3D</div>
          <p style="color:var(--text-muted);font-size:13px;">Funcionalidad en desarrollo. Próximamente podrás gestionar escaneos 3D.</p>
        </div>
      </div>

      <div id="tab-notas" data-tab style="display:none;">
        <div class="card" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;opacity:0.2;">📝</div>
          <div style="font-size:16px;font-weight:600;margin-top:12px;">Notas</div>
          <p style="color:var(--text-muted);font-size:13px;">Funcionalidad en desarrollo. Próximamente podrás agregar notas.</p>
        </div>
      </div>

      <div id="tab-turnos" data-tab style="display:none;">
        <div class="card">
          <div id="turnos-container">
            <div style="text-align:center;padding:20px;color:var(--text-muted);">Cargando turnos...</div>
          </div>
        </div>
      </div>

      <div id="tab-presupuestos" data-tab style="display:none;">
        <div class="card" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;opacity:0.2;">💰</div>
          <div style="font-size:16px;font-weight:600;margin-top:12px;">Presupuestos</div>
          <p style="color:var(--text-muted);font-size:13px;">Funcionalidad en desarrollo. Próximamente podrás gestionar presupuestos.</p>
        </div>
      </div>

      <div id="tab-pagos" data-tab style="display:none;">
        <div class="card" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;opacity:0.2;">💳</div>
          <div style="font-size:16px;font-weight:600;margin-top:12px;">Pagos</div>
          <p style="color:var(--text-muted);font-size:13px;">Funcionalidad en desarrollo. Próximamente podrás gestionar pagos.</p>
        </div>
      </div>
    </div>
  `;

  cargarTurnosPaciente(paciente.id);
}

// ============================================================
// CARGAR TURNOS DEL PACIENTE
// ============================================================
function cargarTurnosPaciente(pacienteId) {
  const container = document.getElementById('turnos-container');
  if (!container) return;

  db.collection('turnos')
    .where('paciente_id', '==', pacienteId)
    .orderBy('fecha', 'desc')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">No hay turnos registrados para este paciente.</div>';
        return;
      }

      let html = `
        <table class="table" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);">Fecha</th>
              <th style="text-align:left;padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);">Horario</th>
              <th style="text-align:left;padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);">Profesional</th>
              <th style="text-align:left;padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);">Tratamiento</th>
              <th style="text-align:left;padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);">Estado</th>
              <th style="text-align:left;padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);"></th>
            </tr>
          </thead>
          <tbody>
      `;

      snapshot.forEach(doc => {
        const turno = doc.data();
        const fechaFormateada = turno.fecha ? formatearFecha(turno.fecha) : '—';
        const horaInicio = turno.hora || '—';
        const duracion = turno.duracion || 30;
        const horaFin = calcularHoraFin(horaInicio, duracion);
        const estado = turno.estado || 'pendiente';
        const estadoColor = {
          'pendiente': 'badge-blue',
          'confirmado': 'badge-green',
          'en_recepcion': 'badge-amber',
          'en_atencion': 'badge-purple',
          'finalizado': 'badge-gray',
          'cancelado': 'badge-red',
          'ausente': 'badge-red'
        }[estado] || 'badge-gray';

        const estadoLabel = {
          'pendiente': 'Pendiente',
          'confirmado': 'Confirmado',
          'en_recepcion': 'En recepción',
          'en_atencion': 'En atención',
          'finalizado': 'Finalizado',
          'cancelado': 'Cancelado',
          'ausente': 'Ausente'
        }[estado] || estado;

        html += `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;white-space:nowrap;font-weight:600;">${fechaFormateada}</td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;white-space:nowrap;">${horaInicio} – ${horaFin}</td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-muted);">${turno.odontologo || '—'}</td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;">${turno.tratamiento || '—'}</td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--border);">
              <span class="badge ${estadoColor}">${estadoLabel}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--border);">
              <a href="#" onclick="alert('Editar turno ${doc.id}')" class="btn btn-sm btn-secondary">Ver</a>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;

      const badge = document.querySelector('#ver-tabs-wrapper .tabs .tab:nth-child(7) .badge');
      if (badge) badge.textContent = snapshot.size;
    })
    .catch(err => {
      console.error('Error cargando turnos:', err);
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Error al cargar turnos.</div>';
    });
}

// ============================================================
// SWITCH TABS EN DETALLE
// ============================================================
function switchTabPacienteDetalle(tabEl, tabId) {
  const wrapper = tabEl.closest('#ver-tabs-wrapper');
  if (!wrapper) return;
  wrapper.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  wrapper.querySelectorAll('[data-tab]').forEach(t => t.style.display = 'none');
  tabEl.classList.add('active');
  const target = wrapper.querySelector(`#${tabId}`);
  if (target) target.style.display = 'block';
}

// ============================================================
// RENDER EDITAR PACIENTE (formulario con datos precargados)
// ============================================================
function renderEditarPaciente(id) {
  const el = $('view-pacientes');
  if (!el) return;

  db.collection('pacientes').doc(id).get().then(doc => {
    if (!doc.exists) {
      alert('Paciente no encontrado.');
      return;
    }
    const paciente = { id: doc.id, ...doc.data() };

    // Construir el HTML del formulario de edición (igual al HTML proporcionado)
    el.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Editar paciente</div>
          <div class="page-subtitle">${paciente.nombre || ''} ${paciente.apellido || ''} · ${paciente.codigo || 'PAC-' + String(paciente.id).padStart(4,'0')}</div>
        </div>
        <a href="#" onclick="verPaciente('${paciente.id}')" class="btn btn-secondary">← Volver</a>
      </div>

      <form id="form-editar-paciente" onsubmit="guardarEdicionPaciente(event, '${paciente.id}')">

        <div id="form-tabs-wrapper">
          <div class="tabs" style="margin-bottom:20px">
            <div class="tab active" onclick="switchTabPaciente(this,'tab-datos')">Datos personales</div>
            <div class="tab" onclick="switchTabPaciente(this,'tab-medico')">Información médica</div>
            <div class="tab" onclick="switchTabPaciente(this,'tab-crm')">Notas y origen</div>
          </div>

          <!-- Tab: Datos personales -->
          <div id="tab-datos" data-tab>
            <div class="card">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nombre *</label>
                  <input type="text" name="nombre" class="form-control" value="${paciente.nombre || ''}" required autofocus>
                </div>
                <div class="form-group">
                  <label class="form-label">Apellido *</label>
                  <input type="text" name="apellido" class="form-control" value="${paciente.apellido || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">DNI</label>
                  <input type="text" name="dni" class="form-control" value="${paciente.dni || ''}" placeholder="12.345.678">
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha de nacimiento</label>
                  <input type="date" name="fecha_nacimiento" class="form-control" value="${paciente.fecha_nacimiento || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Género</label>
                  <select name="genero" class="form-control">
                    <option value="">— Seleccionar —</option>
                    <option value="masculino" ${paciente.genero === 'masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="femenino" ${paciente.genero === 'femenino' ? 'selected' : ''}>Femenino</option>
                    <option value="otro" ${paciente.genero === 'otro' ? 'selected' : ''}>Otro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Estado</label>
                  <select name="estado" class="form-control">
                    <option value="activo" ${paciente.estado === 'activo' ? 'selected' : ''}>Activo</option>
                    <option value="inactivo" ${paciente.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Obra social</label>
                  <select name="obra_social_id" id="sel-obra-social-edit" class="form-control" onchange="cargarPlanesPacienteEdit(this.value)">
                    <option value="">— Sin obra social —</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Plan</label>
                  <select name="plan_id" id="sel-plan-edit" class="form-control">
                    <option value="">— Sin plan —</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Número de afiliado</label>
                  <input type="text" name="numero_afiliado" class="form-control" value="${paciente.numero_afiliado || ''}">
                </div>
              </div>

              <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
                <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text-muted)">CONTACTO Y DIRECCIÓN</div>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="text" name="telefono" class="form-control" value="${paciente.telefono || ''}" placeholder="+54 11 1234-5678">
                  </div>
                  <div class="form-group">
                    <label class="form-label">WhatsApp</label>
                    <input type="text" name="whatsapp" class="form-control" value="${paciente.whatsapp || ''}" placeholder="+54 9 11 1234-5678">
                  </div>
                  <div class="form-group" style="grid-column:1/-1">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-control" value="${paciente.email || ''}" placeholder="paciente@email.com">
                  </div>
                  <div class="form-group" style="grid-column:1/-1">
                    <label class="form-label">Dirección</label>
                    <input type="text" name="direccion" class="form-control" value="${paciente.direccion || ''}" placeholder="Av. Corrientes 1234">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Ciudad</label>
                    <input type="text" name="ciudad" class="form-control" value="${paciente.ciudad || ''}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Provincia</label>
                    <input type="text" name="provincia" class="form-control" value="${paciente.provincia || ''}">
                  </div>
                </div>
              </div>

              <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
                <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text-muted)">CONTACTO DE EMERGENCIA</div>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input type="text" name="contacto_emergencia_nombre" class="form-control" value="${paciente.contacto_emergencia_nombre || ''}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="text" name="contacto_emergencia_telefono" class="form-control" value="${paciente.contacto_emergencia_telefono || ''}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Relación</label>
                    <input type="text" name="contacto_emergencia_relacion" class="form-control" value="${paciente.contacto_emergencia_relacion || ''}" placeholder="Cónyuge, padre/madre...">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Información médica -->
          <div id="tab-medico" data-tab style="display:none">
            <div class="card">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Grupo sanguíneo</label>
                  <select name="grupo_sanguineo" class="form-control">
                    <option value="">—</option>
                    <option value="A+" ${paciente.grupo_sanguineo === 'A+' ? 'selected' : ''}>A+</option>
                    <option value="A-" ${paciente.grupo_sanguineo === 'A-' ? 'selected' : ''}>A-</option>
                    <option value="B+" ${paciente.grupo_sanguineo === 'B+' ? 'selected' : ''}>B+</option>
                    <option value="B-" ${paciente.grupo_sanguineo === 'B-' ? 'selected' : ''}>B-</option>
                    <option value="AB+" ${paciente.grupo_sanguineo === 'AB+' ? 'selected' : ''}>AB+</option>
                    <option value="AB-" ${paciente.grupo_sanguineo === 'AB-' ? 'selected' : ''}>AB-</option>
                    <option value="O+" ${paciente.grupo_sanguineo === 'O+' ? 'selected' : ''}>O+</option>
                    <option value="O-" ${paciente.grupo_sanguineo === 'O-' ? 'selected' : ''}>O-</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Presión arterial habitual</label>
                  <input type="text" name="presion_arterial" class="form-control" value="${paciente.presion_arterial || ''}" placeholder="120/80">
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Alergias</label>
                  <textarea name="alergias" class="form-control" rows="2" placeholder="Penicilina, látex...">${paciente.alergias || ''}</textarea>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Medicamentos actuales</label>
                  <textarea name="medicamentos_actuales" class="form-control" rows="2">${paciente.medicamentos_actuales || ''}</textarea>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Antecedentes médicos</label>
                  <textarea name="antecedentes_medicos" class="form-control" rows="3">${paciente.antecedentes_medicos || ''}</textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: CRM -->
          <div id="tab-crm" data-tab style="display:none">
            <div class="card">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Fuente de origen</label>
                  <select name="fuente_origen" class="form-control">
                    <option value="">—</option>
                    <option value="referido" ${paciente.fuente_origen === 'referido' ? 'selected' : ''}>Referido</option>
                    <option value="web" ${paciente.fuente_origen === 'web' ? 'selected' : ''}>Web / Google</option>
                    <option value="redes_sociales" ${paciente.fuente_origen === 'redes_sociales' ? 'selected' : ''}>Redes sociales</option>
                    <option value="publicidad" ${paciente.fuente_origen === 'publicidad' ? 'selected' : ''}>Publicidad</option>
                    <option value="otro" ${paciente.fuente_origen === 'otro' ? 'selected' : ''}>Otro</option>
                  </select>
                </div>
                <div class="form-group" style="display:flex;flex-direction:column;justify-content:flex-end">
                  <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
                    <input type="checkbox" name="acepta_comunicaciones" value="1" ${paciente.acepta_comunicaciones ? 'checked' : ''} style="width:16px;height:16px">
                    Acepta comunicaciones y recordatorios
                  </label>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Notas internas</label>
                  <textarea name="notas_internas" class="form-control" rows="4" placeholder="Notas visibles solo para el equipo...">${paciente.notas_internas || ''}</textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <a href="#" onclick="verPaciente('${paciente.id}')" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary">Guardar cambios</button>
        </div>
      </form>
    `;

    // Cargar obras sociales y planes en el formulario de edición
    cargarObrasSocialesYPlanesEdit(paciente);

  }).catch(err => {
    alert('Error al cargar el paciente: ' + err.message);
  });
}

// ============================================================
// CARGAR OBRAS SOCIALES Y PLANES PARA EDICIÓN
// ============================================================
function cargarObrasSocialesYPlanesEdit(paciente) {
  const selObra = document.getElementById('sel-obra-social-edit');
  const selPlan = document.getElementById('sel-plan-edit');
  if (!selObra || !selPlan) return;

  // Cargar obras sociales
  db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
    selObra.innerHTML = '<option value="">— Sin obra social —</option>';
    snap.forEach(doc => {
      const data = doc.data();
      const selected = paciente.obra_social_id === doc.id ? 'selected' : '';
      selObra.innerHTML += `<option value="${doc.id}" ${selected}>${data.nombre || 'Sin nombre'} (${data.codigo || ''})</option>`;
    });

    // Cargar planes para la obra social seleccionada
    const obraId = paciente.obra_social_id || '';
    if (obraId) {
      cargarPlanesPacienteEdit(obraId, paciente.plan_id);
    } else {
      selPlan.innerHTML = '<option value="">— Sin plan —</option>';
    }
  }).catch(err => console.error('Error cargando obras sociales:', err));
}

function cargarPlanesPacienteEdit(obraSocialId, selectedPlanId) {
  const selPlan = document.getElementById('sel-plan-edit');
  if (!selPlan) return;
  selPlan.innerHTML = '<option value="">— Sin plan —</option>';
  if (!obraSocialId) return;

  db.collection('planes')
    .where('obra_social_id', '==', obraSocialId)
    .where('activo', '==', true)
    .orderBy('nombre')
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const data = doc.data();
        const selected = (selectedPlanId && selectedPlanId === doc.id) ? 'selected' : '';
        selPlan.innerHTML += `<option value="${doc.id}" ${selected}>${data.nombre || 'Sin nombre'}</option>`;
      });
    })
    .catch(err => console.error('Error cargando planes:', err));
}

// ============================================================
// GUARDAR EDICIÓN DE PACIENTE
// ============================================================
function guardarEdicionPaciente(e, id) {
  e.preventDefault();
  const form = document.getElementById('form-editar-paciente');
  if (!form) return;

  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (key === 'acepta_comunicaciones') {
      data[key] = value === '1' ? true : false;
    } else {
      data[key] = value;
    }
  }

  if (!data.nombre || !data.apellido) {
    alert('Nombre y apellido son obligatorios.');
    return;
  }

  // Obtener nombres de obra social y plan para mostrar en el listado
  const obraSelect = document.getElementById('sel-obra-social-edit');
  if (obraSelect) {
    const selectedOption = obraSelect.options[obraSelect.selectedIndex];
    data.obra_social_nombre = selectedOption ? selectedOption.textContent.trim().split('(')[0].trim() : '';
  }
  const planSelect = document.getElementById('sel-plan-edit');
  if (planSelect) {
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    data.plan_nombre = selectedOption ? selectedOption.textContent.trim() : '';
  }

  // Actualizar en Firestore
  db.collection('pacientes').doc(id).update(data)
    .then(() => {
      showToast('✅ Paciente actualizado exitosamente.');
      verPaciente(id); // Volver a la vista detalle
    })
    .catch(err => {
      alert('❌ Error al actualizar paciente: ' + err.message);
    });
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calcularHoraFin(horaInicio, duracionMinutos) {
  if (!horaInicio || horaInicio === '—') return '—';
  try {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m + duracionMinutos;
    const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
    const mm = String(totalMin % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch (e) {
    return '—';
  }
}

function showToast(mensaje) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1e2d3a;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
  el.textContent = mensaje;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ============================================================
// RENDER NUEVO PACIENTE (formulario de creación)
// ============================================================
function renderNuevoPaciente() {
  const el = $('view-pacientes');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Nuevo paciente</div>
      </div>
      <button class="btn btn-secondary" onclick="renderPacientes()">← Volver</button>
    </div>

    <form id="form-nuevo-paciente" onsubmit="guardarPaciente(event)">

      <div id="form-tabs-wrapper">
        <div class="tabs" style="margin-bottom:20px;">
          <div class="tab active" onclick="switchTabPaciente(this,'tab-datos')">Datos personales</div>
          <div class="tab" onclick="switchTabPaciente(this,'tab-medico')">Información médica</div>
          <div class="tab" onclick="switchTabPaciente(this,'tab-crm')">Notas y origen</div>
        </div>

        <div id="tab-datos" data-tab>
          <div class="card">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" name="nombre" class="form-control" required autofocus>
              </div>
              <div class="form-group">
                <label class="form-label">Apellido *</label>
                <input type="text" name="apellido" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">DNI</label>
                <input type="text" name="dni" class="form-control" placeholder="12.345.678">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha de nacimiento</label>
                <input type="date" name="fecha_nacimiento" class="form-control">
              </div>
              <div class="form-group">
                <label class="form-label">Género</label>
                <select name="genero" class="form-control">
                  <option value="">— Seleccionar —</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <select name="estado" class="form-control">
                  <option value="activo" selected>Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Obra social</label>
                <select name="obra_social_id" id="sel-obra-social" class="form-control" onchange="cargarPlanesPaciente(this.value)">
                  <option value="">— Sin obra social —</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Plan</label>
                <select name="plan_id" id="sel-plan" class="form-control">
                  <option value="">— Sin plan —</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Número de afiliado</label>
                <input type="text" name="numero_afiliado" class="form-control">
              </div>
            </div>

            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
              <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text-muted);">CONTACTO Y DIRECCIÓN</div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input type="text" name="telefono" class="form-control" placeholder="+54 11 1234-5678">
                </div>
                <div class="form-group">
                  <label class="form-label">WhatsApp</label>
                  <input type="text" name="whatsapp" class="form-control" placeholder="+54 9 11 1234-5678">
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-control" placeholder="paciente@email.com">
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                  <label class="form-label">Dirección</label>
                  <input type="text" name="direccion" class="form-control" placeholder="Av. Corrientes 1234">
                </div>
                <div class="form-group">
                  <label class="form-label">Ciudad</label>
                  <input type="text" name="ciudad" class="form-control">
                </div>
                <div class="form-group">
                  <label class="form-label">Provincia</label>
                  <input type="text" name="provincia" class="form-control">
                </div>
              </div>
            </div>

            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
              <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text-muted);">CONTACTO DE EMERGENCIA</div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nombre</label>
                  <input type="text" name="contacto_emergencia_nombre" class="form-control">
                </div>
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input type="text" name="contacto_emergencia_telefono" class="form-control">
                </div>
                <div class="form-group">
                  <label class="form-label">Relación</label>
                  <input type="text" name="contacto_emergencia_relacion" class="form-control" placeholder="Cónyuge, padre/madre...">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="tab-medico" data-tab style="display:none;">
          <div class="card">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Grupo sanguíneo</label>
                <select name="grupo_sanguineo" class="form-control">
                  <option value="">—</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Presión arterial habitual</label>
                <input type="text" name="presion_arterial" class="form-control" placeholder="120/80">
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Alergias</label>
                <textarea name="alergias" class="form-control" rows="2" placeholder="Penicilina, látex..."></textarea>
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Medicamentos actuales</label>
                <textarea name="medicamentos_actuales" class="form-control" rows="2"></textarea>
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Antecedentes médicos</label>
                <textarea name="antecedentes_medicos" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div id="tab-crm" data-tab style="display:none;">
          <div class="card">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Fuente de origen</label>
                <select name="fuente_origen" class="form-control">
                  <option value="">—</option>
                  <option value="referido">Referido</option>
                  <option value="web">Web / Google</option>
                  <option value="redes_sociales">Redes sociales</option>
                  <option value="publicidad">Publicidad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="form-group" style="display:flex;flex-direction:column;justify-content:flex-end;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">
                  <input type="checkbox" name="acepta_comunicaciones" value="1" checked style="width:16px;height:16px;">
                  Acepta comunicaciones y recordatorios
                </label>
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Notas internas</label>
                <textarea name="notas_internas" class="form-control" rows="4" placeholder="Notas visibles solo para el equipo..."></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button type="button" class="btn btn-secondary" onclick="renderPacientes()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Crear paciente</button>
      </div>
    </form>
  `;

  cargarObrasSocialesYPlanes();
}

// ============================================================
// TABS DEL FORMULARIO (compartido para nuevo y edición)
// ============================================================
function switchTabPaciente(tabEl, tabId) {
  const wrapper = tabEl.closest('#form-tabs-wrapper');
  if (!wrapper) return;
  wrapper.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  wrapper.querySelectorAll('[data-tab]').forEach(t => t.style.display = 'none');
  tabEl.classList.add('active');
  const target = wrapper.querySelector(`#${tabId}`);
  if (target) target.style.display = 'block';
}

// ============================================================
// CARGAR OBRAS SOCIALES Y PLANES (para nuevo paciente)
// ============================================================
function cargarObrasSocialesYPlanes() {
  db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
    const sel = $('sel-obra-social');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Sin obra social —</option>';
    snap.forEach(doc => {
      const data = doc.data();
      sel.innerHTML += `<option value="${doc.id}">${data.nombre || 'Sin nombre'} (${data.codigo || ''})</option>`;
    });
    if (sel.value) cargarPlanesPaciente(sel.value);
  }).catch(err => console.error('Error cargando obras sociales:', err));
}

function cargarPlanesPaciente(obraSocialId) {
  const selPlan = $('sel-plan');
  if (!selPlan) return;
  selPlan.innerHTML = '<option value="">— Sin plan —</option>';
  if (!obraSocialId) return;

  db.collection('planes')
    .where('obra_social_id', '==', obraSocialId)
    .where('activo', '==', true)
    .orderBy('nombre')
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const data = doc.data();
        selPlan.innerHTML += `<option value="${doc.id}">${data.nombre || 'Sin nombre'}</option>`;
      });
    })
    .catch(err => console.error('Error cargando planes:', err));
}

// ============================================================
// GUARDAR NUEVO PACIENTE
// ============================================================
function guardarPaciente(e) {
  e.preventDefault();
  const form = document.getElementById('form-nuevo-paciente');
  if (!form) return;

  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (key === 'acepta_comunicaciones') {
      data[key] = value === '1' ? true : false;
    } else {
      data[key] = value;
    }
  }

  if (!data.nombre || !data.apellido) {
    alert('Nombre y apellido son obligatorios.');
    return;
  }

  data.creado = new Date().toISOString();
  data.estado = data.estado || 'activo';

  const obraSelect = $('sel-obra-social');
  if (obraSelect) {
    const selectedOption = obraSelect.options[obraSelect.selectedIndex];
    data.obra_social_nombre = selectedOption ? selectedOption.textContent.trim().split('(')[0].trim() : '';
  }
  const planSelect = $('sel-plan');
  if (planSelect) {
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    data.plan_nombre = selectedOption ? selectedOption.textContent.trim() : '';
  }

  db.collection('pacientes').add(data)
    .then(() => {
      showToast('✅ Paciente creado exitosamente.');
      renderPacientes();
    })
    .catch(err => alert('❌ Error al crear paciente: ' + err.message));
}

// ============================================================
// INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  if ($('view-pacientes')) {
    renderPacientes();
  }
});
