// ============================================================
// PACIENTES
// ============================================================

// Variables de estado
let pacientesData = [];
let filterEstado = 'todos'; // 'todos', 'activo', 'inactivo'
let searchQuery = '';
let obrasSocialesData = {};
let planesData = {};
let currentPacienteId = null; // para edición (no usado en creación)

// Helper para getElementById
function $(id) { return document.getElementById(id); }

// ============================================================
// RENDER LISTADO DE PACIENTES
// ============================================================
function renderPacientes() {
  const el = $('view-pacientes');
  if (!el) return;

  // Construir HTML del listado
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

    <!-- Búsqueda y filtros -->
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

    <!-- Modal confirmar eliminación -->
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

    <!-- Tabla (desktop) -->
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

    <!-- Lista mobile -->
    <div class="pac-mob-list" id="pac-mob-list" style="border-radius:10px;border:1px solid var(--border);overflow:hidden;background:#fff;display:none;"></div>
  `;

  // Cargar pacientes desde Firestore
  cargarPacientes();
}

// ============================================================
// CARGAR PACIENTES DESDE FIRESTORE
// ============================================================
function cargarPacientes() {
  db.collection('pacientes').orderBy('apellido').orderBy('nombre').onSnapshot((snapshot) => {
    pacientesData = [];
    snapshot.forEach(doc => {
      pacientesData.push({ id: doc.id, ...doc.data() });
    });
    aplicarFiltrosPacientes();
  }, (error) => {
    console.error('Error cargando pacientes:', error);
    const tbody = $('pac-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">Error al cargar pacientes: ${error.message}</td></tr>`;
  });
}

// ============================================================
// APLICAR FILTROS Y RENDERIZAR TABLA
// ============================================================
function aplicarFiltrosPacientes() {
  const searchInput = $('pac-search-input');
  const estadoSelect = $('pac-filtro-estado');
  if (searchInput) searchQuery = searchInput.value.toLowerCase().trim();
  if (estadoSelect) filterEstado = estadoSelect.value;

  let filtered = pacientesData;

  // Filtro por estado
  if (filterEstado !== 'todos') {
    filtered = filtered.filter(p => p.estado === filterEstado);
  }

  // Filtro por búsqueda
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
      const dni = (p.dni || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const telefono = (p.telefono || '').toLowerCase();
      return nombre.includes(searchQuery) || dni.includes(searchQuery) || email.includes(searchQuery) || telefono.includes(searchQuery);
    });
  }

  // Actualizar contador
  const countEl = $('pacientes-count');
  if (countEl) countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`;

  // Renderizar tabla y cards
  renderTablaPacientes(filtered);
  renderMobilePacientes(filtered);
}

// ============================================================
// RENDER TABLA (desktop)
// ============================================================
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

// ============================================================
// RENDER MOBILE (cards)
// ============================================================
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
      // La data se actualizará por el snapshot
    })
    .catch(err => {
      alert('❌ Error al eliminar: ' + err.message);
    });
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
  const modal = $('modal-eliminar-paciente');
  if (modal && e.target === modal) cerrarEliminarPaciente();
});

// ============================================================
// VER PACIENTE (placeholder)
// ============================================================
function verPaciente(id) {
  alert('Funcionalidad "Ver paciente" pendiente. ID: ' + id);
  // Aquí podrías abrir un modal de edición o redirigir a una vista de detalle.
}

// ============================================================
// RENDER NUEVO PACIENTE (formulario)
// ============================================================
function renderNuevoPaciente() {
  const el = $('view-pacientes');
  if (!el) return;

  // HTML del formulario de nuevo paciente (adaptado del HTML proporcionado)
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

        <!-- Tab: Datos personales -->
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

        <!-- Tab: Información médica -->
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

        <!-- Tab: CRM -->
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

      <!-- Botones -->
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button type="button" class="btn btn-secondary" onclick="renderPacientes()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Crear paciente</button>
      </div>
    </form>
  `;

  // Cargar obras sociales y planes
  cargarObrasSocialesYPlanes();
}

// ============================================================
// TABS DEL FORMULARIO
// ============================================================
function switchTabPaciente(tabEl, tabId) {
  // Desactivar todos los tabs
  const wrapper = tabEl.closest('#form-tabs-wrapper');
  wrapper.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  wrapper.querySelectorAll('[data-tab]').forEach(t => t.style.display = 'none');
  // Activar el seleccionado
  tabEl.classList.add('active');
  const target = wrapper.querySelector(`#${tabId}`);
  if (target) target.style.display = 'block';
}

// ============================================================
// CARGAR OBRAS SOCIALES Y PLANES
// ============================================================
function cargarObrasSocialesYPlanes() {
  // Cargar obras sociales
  db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
    const sel = $('sel-obra-social');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Sin obra social —</option>';
    snap.forEach(doc => {
      const data = doc.data();
      sel.innerHTML += `<option value="${doc.id}">${data.nombre || 'Sin nombre'} (${data.codigo || ''})</option>`;
    });
    // Si hay alguna seleccionada, cargar sus planes
    if (sel.value) cargarPlanesPaciente(sel.value);
  }).catch(err => console.error('Error cargando obras sociales:', err));

  // Cargar planes (se cargarán bajo demanda)
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
// GUARDAR PACIENTE
// ============================================================
function guardarPaciente(e) {
  e.preventDefault();
  const form = document.getElementById('form-nuevo-paciente');
  if (!form) return;

  // Recoger datos del formulario
  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    // Si es checkbox, solo guardar si está checked
    if (key === 'acepta_comunicaciones') {
      data[key] = value === '1' ? true : false;
    } else {
      data[key] = value;
    }
  }

  // Validar campos obligatorios
  if (!data.nombre || !data.apellido) {
    alert('Nombre y apellido son obligatorios.');
    return;
  }

  // Agregar campos adicionales
  data.creado = new Date().toISOString();
  data.estado = data.estado || 'activo';

  // Obtener nombre de obra social seleccionada para mostrarlo en la lista
  const obraSelect = $('sel-obra-social');
  if (obraSelect) {
    const selectedOption = obraSelect.options[obraSelect.selectedIndex];
    data.obra_social_nombre = selectedOption ? selectedOption.textContent.trim().split('(')[0].trim() : '';
  }

  db.collection('pacientes').add(data)
    .then(() => {
      showToast('✅ Paciente creado exitosamente.');
      renderPacientes(); // Volver al listado
    })
    .catch(err => {
      alert('❌ Error al crear paciente: ' + err.message);
    });
}

// ============================================================
// FORMATEAR FECHA (helper)
// ============================================================
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ============================================================
// INICIALIZAR (se llama al cargar la página)
// ============================================================
// Si el módulo se carga después de que el DOM esté listo, renderizar pacientes.
document.addEventListener('DOMContentLoaded', function() {
  // Si existe el contenedor, renderizar
  if ($('view-pacientes')) {
    renderPacientes();
  }
});
