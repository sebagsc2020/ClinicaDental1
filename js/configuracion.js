// ============================================================
// CONFIGURACIÓN - SPA (Single Page Application)
// ============================================================

// Usamos un objeto de estado para evitar redeclaraciones
var _configState = {
  tabActual: 'horarios',
  sucursalesData: [],
  horariosData: {},
  permisosData: {},
  estadosData: {},
  aparienciaData: {}
};

// ============================================================
// RENDER CONFIGURACIÓN PRINCIPAL (TABS)
// ============================================================
function renderConfiguracion() {
  const el = document.getElementById('view-configuracion');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Configuración</div>
        <div class="page-subtitle">Ajustá los parámetros de tu clínica</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" style="margin-bottom:0;border-bottom:none;">
      <button class="tab ${_configState.tabActual === 'horarios' ? 'active' : ''}" onclick="cambiarTabConfig('horarios')">Sucursales y horarios</button>
      <button class="tab ${_configState.tabActual === 'permisos' ? 'active' : ''}" onclick="cambiarTabConfig('permisos')">Permisos</button>
      <button class="tab ${_configState.tabActual === 'estados' ? 'active' : ''}" onclick="cambiarTabConfig('estados')">Estados</button>
      <button class="tab ${_configState.tabActual === 'apariencia' ? 'active' : ''}" onclick="cambiarTabConfig('apariencia')">Apariencia</button>
    </div>

    <div id="config-tab-content" style="margin-top:20px;">
      <div class="text-muted">Cargando datos...</div>
    </div>
  `;

  cargarDatosConfiguracion();
}

// ============================================================
// CAMBIAR TAB
// ============================================================
function cambiarTabConfig(tab) {
  _configState.tabActual = tab;
  renderConfiguracion();
}

// ============================================================
// CARGAR DATOS DESDE FIRESTORE
// ============================================================
function cargarDatosConfiguracion() {
  const promesas = [
    db.collection('sucursales').orderBy('nombre').get(),
    db.collection('configuracion').doc('horarios').get(),
    db.collection('configuracion').doc('permisos').get(),
    db.collection('configuracion').doc('estados').get(),
    db.collection('configuracion').doc('apariencia').get()
  ];

  Promise.all(promesas)
    .then(([sucSnap, horDoc, perDoc, estDoc, apDoc]) => {
      _configState.sucursalesData = [];
      sucSnap.forEach(doc => {
        _configState.sucursalesData.push({ id: doc.id, ...doc.data() });
      });

      _configState.horariosData = horDoc.exists ? horDoc.data() : { slot_minutos: 15, timezone: 'America/Argentina/Buenos_Aires' };
      _configState.permisosData = perDoc.exists ? perDoc.data() : {};
      _configState.estadosData = estDoc.exists ? estDoc.data() : {};
      _configState.aparienciaData = apDoc.exists ? apDoc.data() : { estilo: 'claro' };

      mostrarTabConfiguracion(_configState.tabActual);
    })
    .catch(err => {
      console.error('Error cargando datos de configuración:', err);
      document.getElementById('config-tab-content').innerHTML = `
        <div class="card"><p class="text-muted">Error al cargar los datos. ${err.message}</p></div>
      `;
    });
}

// ============================================================
// MOSTRAR TAB SELECCIONADA
// ============================================================
function mostrarTabConfiguracion(tab) {
  const container = document.getElementById('config-tab-content');
  if (!container) return;

  switch (tab) {
    case 'horarios':
      renderHorariosTab(container);
      break;
    case 'permisos':
      renderPermisosTab(container);
      break;
    case 'estados':
      renderEstadosTab(container);
      break;
    case 'apariencia':
      renderAparienciaTab(container);
      break;
    default:
      container.innerHTML = '<div class="card"><p class="text-muted">Sección no disponible.</p></div>';
  }
}

// ============================================================
// TAB: HORARIOS Y SUCURSALES
// ============================================================
function renderHorariosTab(container) {
  let sucursalesHTML = '';
  if (_configState.sucursalesData.length === 0) {
    sucursalesHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">No hay sucursales registradas.</td></tr>';
  } else {
    _configState.sucursalesData.forEach(s => {
      sucursalesHTML += `
        <tr>
          <td style="font-weight:600;">${escapeHtml(s.nombre || '')}</td>
          <td>${escapeHtml(s.direccion || '')}</td>
          <td>${escapeHtml(s.ciudad || '')}</td>
          <td>${escapeHtml(s.pais || '')}</td>
          <td style="text-align:right;white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="renderHorariosSucursal('${s.id}')">Horarios</button>
            <button class="btn btn-secondary btn-sm" onclick="renderEditarSucursal('${s.id}')">Editar</button>
            <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarSucursal('${s.id}', '${escapeHtml(s.nombre || '')}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
  }

  container.innerHTML = `
    <div class="card" style="margin-top:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Sucursales</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;line-height:1.5;">Gestioná las sedes de tu clínica y el horario de atención de cada una.</div>
        </div>
        <button class="btn btn-primary" onclick="renderNuevaSucursal()">+ Nueva sucursal</button>
      </div>

      <div style="overflow-x:auto;margin-top:16px;">
        <table class="table" style="min-width:640px;">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Ciudad</th>
              <th>País</th>
              <th style="text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody>${sucursalesHTML}</tbody>
        </table>
      </div>
    </div>

    <form id="form-config-horarios" onsubmit="event.preventDefault(); guardarConfiguracionHorarios()">
      <div class="card" style="margin-top:20px;">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Granularidad de la agenda</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;line-height:1.5;">Define el tamaño de las celdas en la vista semanal de la agenda.</div>
        <select name="slot_minutos" id="cfg-slot-minutos" class="form-control" style="max-width:400px;">
          <option value="30" ${_configState.horariosData.slot_minutos === 30 ? 'selected' : ''}>Cada 30 minutos</option>
          <option value="15" ${_configState.horariosData.slot_minutos === 15 ? 'selected' : ''}>Cada 15 minutos</option>
        </select>
      </div>

      <div class="card" style="margin-top:20px;">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Zona horaria</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;line-height:1.5;">Afecta a toda la plataforma: el día actual en la agenda, las fechas del chatbot, y cualquier otro cálculo de hora local.</div>
        <select name="timezone" id="cfg-timezone" class="form-control" style="max-width:400px;">
          ${generarOpcionesZonaHoraria(_configState.horariosData.timezone || 'America/Argentina/Buenos_Aires')}
        </select>
      </div>

      <div style="display:flex;gap:10px;align-items:center;margin-top:16px;">
        <button type="submit" class="btn btn-primary">Guardar cambios</button>
      </div>
    </form>
  `;
}

function generarOpcionesZonaHoraria(selected) {
  const zonas = [
    { value: 'Etc/GMT+12', label: 'UTC-12:00' },
    { value: 'Pacific/Pago_Pago', label: 'UTC-11:00 — Pago Pago' },
    { value: 'Pacific/Honolulu', label: 'UTC-10:00 — Honolulu (Hawái)' },
    { value: 'America/Anchorage', label: 'UTC-09:00 — Anchorage' },
    { value: 'America/Los_Angeles', label: 'UTC-08:00 — Los Ángeles, Vancouver' },
    { value: 'America/Denver', label: 'UTC-07:00 — Denver, Phoenix' },
    { value: 'America/Chicago', label: 'UTC-06:00 — Chicago, Ciudad de México' },
    { value: 'America/New_York', label: 'UTC-05:00 — Nueva York, Lima, Bogotá' },
    { value: 'America/Caracas', label: 'UTC-04:00 — Caracas' },
    { value: 'America/Halifax', label: 'UTC-04:00 — Halifax, Santiago' },
    { value: 'America/Argentina/Buenos_Aires', label: 'UTC-03:00 — Buenos Aires, Montevideo' },
    { value: 'America/Sao_Paulo', label: 'UTC-03:00 — São Paulo, Brasilia' },
    { value: 'America/Noronha', label: 'UTC-02:00 — Fernando de Noronha' },
    { value: 'Atlantic/Azores', label: 'UTC-01:00 — Azores' },
    { value: 'UTC', label: 'UTC+00:00 — UTC' },
    { value: 'Europe/London', label: 'UTC+00:00 — Londres, Lisboa (invierno)' },
    { value: 'Europe/Paris', label: 'UTC+01:00 — París, Madrid, Roma' },
    { value: 'Europe/Athens', label: 'UTC+02:00 — Atenas, Cairo, Johannesburgo' },
    { value: 'Europe/Moscow', label: 'UTC+03:00 — Moscú, Nairobi, Estambul' },
    { value: 'Asia/Tehran', label: 'UTC+03:30 — Teherán' },
    { value: 'Asia/Dubai', label: 'UTC+04:00 — Dubái, Abu Dhabi' },
    { value: 'Asia/Kabul', label: 'UTC+04:30 — Kabul' },
    { value: 'Asia/Karachi', label: 'UTC+05:00 — Karachi, Islamabad' },
    { value: 'Asia/Kolkata', label: 'UTC+05:30 — Nueva Delhi, Mumbai' },
    { value: 'Asia/Kathmandu', label: 'UTC+05:45 — Katmandú' },
    { value: 'Asia/Dhaka', label: 'UTC+06:00 — Daca, Almaty' },
    { value: 'Asia/Rangoon', label: 'UTC+06:30 — Rangún' },
    { value: 'Asia/Bangkok', label: 'UTC+07:00 — Bangkok, Hanói, Yakarta' },
    { value: 'Asia/Shanghai', label: 'UTC+08:00 — Beijing, Shanghái, Singapur' },
    { value: 'Asia/Tokyo', label: 'UTC+09:00 — Tokio, Seúl' },
    { value: 'Australia/Adelaide', label: 'UTC+09:30 — Adelaida, Darwin' },
    { value: 'Australia/Sydney', label: 'UTC+10:00 — Sídney, Melbourne' },
    { value: 'Pacific/Guadalcanal', label: 'UTC+11:00 — Islas Salomón' },
    { value: 'Pacific/Auckland', label: 'UTC+12:00 — Auckland, Fiyi' },
    { value: 'Pacific/Apia', label: 'UTC+13:00 — Samoa, Tonga' },
    { value: 'Pacific/Kiritimati', label: 'UTC+14:00 — Isla de Navidad' }
  ];
  return zonas.map(z => `<option value="${z.value}" ${z.value === selected ? 'selected' : ''}>${z.label}</option>`).join('');
}

// ============================================================
// GUARDAR CONFIGURACIÓN DE HORARIOS
// ============================================================
function guardarConfiguracionHorarios() {
  const slot_minutos = parseInt(document.getElementById('cfg-slot-minutos').value);
  const timezone = document.getElementById('cfg-timezone').value;

  db.collection('configuracion').doc('horarios').set({
    slot_minutos,
    timezone,
    updated: new Date().toISOString()
  })
  .then(() => {
    showToast('✅ Configuración de horarios guardada.');
    renderConfiguracion();
  })
  .catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// SPA: NUEVA SUCURSAL
// ============================================================
function renderNuevaSucursal() {
  const el = document.getElementById('view-configuracion');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">➕ Nueva sucursal</div>
        <div class="page-subtitle">Completa los datos de la nueva sucursal</div>
      </div>
      <button class="btn btn-secondary" onclick="renderConfiguracion()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-nueva-sucursal" onsubmit="event.preventDefault(); guardarNuevaSucursal()">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-suc-nombre" placeholder="Ej: Sede Centro" required>
        </div>
        <div class="form-group">
          <label class="form-label">Dirección</label>
          <input class="form-control" id="f-suc-direccion" placeholder="Ej: Av. Corrientes 1234">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Ciudad</label>
            <input class="form-control" id="f-suc-ciudad" placeholder="Rosario">
          </div>
          <div class="form-group">
            <label class="form-label">País</label>
            <input class="form-control" id="f-suc-pais" placeholder="Argentina">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input class="form-control" id="f-suc-telefono" placeholder="+54 11 1234-5678">
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderConfiguracion()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar sucursal</button>
        </div>
      </form>
    </div>
  `;
}

function guardarNuevaSucursal() {
  const nombre = document.getElementById('f-suc-nombre').value.trim();
  const direccion = document.getElementById('f-suc-direccion').value.trim();
  const ciudad = document.getElementById('f-suc-ciudad').value.trim();
  const pais = document.getElementById('f-suc-pais').value.trim();
  const telefono = document.getElementById('f-suc-telefono').value.trim();

  if (!nombre) return alert('El nombre es obligatorio.');

  db.collection('sucursales').add({
    nombre,
    direccion,
    ciudad,
    pais,
    telefono,
    created_at: new Date().toISOString()
  })
  .then(() => {
    showToast('✅ Sucursal creada.');
    renderConfiguracion();
  })
  .catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// SPA: EDITAR SUCURSAL
// ============================================================
function renderEditarSucursal(id) {
  const el = document.getElementById('view-configuracion');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">✏️ Editar sucursal</div>
        <div class="page-subtitle">Actualiza los datos de la sucursal</div>
      </div>
      <button class="btn btn-secondary" onclick="renderConfiguracion()">← Volver</button>
    </div>
    <div class="card"><p class="text-muted">Cargando datos...</p></div>
  `;

  db.collection('sucursales').doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        el.innerHTML = '<div class="card"><p class="text-muted">Sucursal no encontrada.</p></div>';
        return;
      }
      const data = doc.data();
      el.innerHTML = `
        <div class="page-header">
          <div>
            <div class="page-title">✏️ Editar sucursal</div>
            <div class="page-subtitle">Actualiza los datos de la sucursal</div>
          </div>
          <button class="btn btn-secondary" onclick="renderConfiguracion()">← Volver</button>
        </div>

        <div class="card">
          <form id="form-editar-sucursal" onsubmit="event.preventDefault(); guardarEdicionSucursal('${id}')">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input class="form-control" id="f-suc-edit-nombre" value="${escapeHtml(data.nombre || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Dirección</label>
              <input class="form-control" id="f-suc-edit-direccion" value="${escapeHtml(data.direccion || '')}">
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Ciudad</label>
                <input class="form-control" id="f-suc-edit-ciudad" value="${escapeHtml(data.ciudad || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">País</label>
                <input class="form-control" id="f-suc-edit-pais" value="${escapeHtml(data.pais || '')}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input class="form-control" id="f-suc-edit-telefono" value="${escapeHtml(data.telefono || '')}">
            </div>
            <div class="modal-actions" style="margin-top:16px;">
              <button type="button" class="btn btn-secondary" onclick="renderConfiguracion()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Actualizar sucursal</button>
            </div>
          </form>
        </div>
      `;
    })
    .catch(err => {
      el.innerHTML = `<div class="card"><p class="text-muted">Error: ${err.message}</p></div>`;
    });
}

function guardarEdicionSucursal(id) {
  const nombre = document.getElementById('f-suc-edit-nombre').value.trim();
  const direccion = document.getElementById('f-suc-edit-direccion').value.trim();
  const ciudad = document.getElementById('f-suc-edit-ciudad').value.trim();
  const pais = document.getElementById('f-suc-edit-pais').value.trim();
  const telefono = document.getElementById('f-suc-edit-telefono').value.trim();

  if (!nombre) return alert('El nombre es obligatorio.');

  db.collection('sucursales').doc(id).update({
    nombre,
    direccion,
    ciudad,
    pais,
    telefono,
    updated: new Date().toISOString()
  })
  .then(() => {
    showToast('✅ Sucursal actualizada.');
    renderConfiguracion();
  })
  .catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// ELIMINAR SUCURSAL
// ============================================================
function eliminarSucursal(id, nombre) {
  if (!confirm(`¿Eliminar la sucursal "${nombre}"?`)) return;
  db.collection('sucursales').doc(id).delete()
    .then(() => {
      showToast('🗑 Sucursal eliminada.');
      renderConfiguracion();
    })
    .catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// SPA: HORARIOS DE SUCURSAL
// ============================================================
function renderHorariosSucursal(id) {
  const el = document.getElementById('view-configuracion');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">🕐 Horarios de atención</div>
        <div class="page-subtitle" id="horarios-sucursal-nombre">Cargando...</div>
      </div>
      <button class="btn btn-secondary" onclick="renderConfiguracion()">← Volver</button>
    </div>
    <div class="card"><p class="text-muted">Cargando horarios...</p></div>
  `;

  db.collection('sucursales').doc(id).get()
    .then(doc => {
      if (!doc.exists) throw new Error('Sucursal no encontrada');
      const nombre = doc.data().nombre || 'Sin nombre';
      document.getElementById('horarios-sucursal-nombre').textContent = nombre;

      return db.collection('horarios').doc(id).get();
    })
    .then(doc => {
      const horarios = doc.exists ? doc.data() : {};
      const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
      const diasLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

      let rowsHTML = '';
      dias.forEach((dia, i) => {
        const cfg = horarios[dia] || { activo: true, inicio: '08:00', fin: '20:00' };
        rowsHTML += `
          <div class="horario-dia-row" style="display:grid;grid-template-columns:110px 70px 1fr 1fr;gap:12px;padding:10px 12px;border:1px solid var(--border);border-top:none;align-items:center;">
            <div style="font-size:13px;font-weight:600;">${diasLabels[i]}</div>
            <div style="text-align:center;">
              <label style="position:relative;display:inline-block;width:40px;height:22px;">
                <input type="checkbox" class="hm-activo" data-dia="${dia}" ${cfg.activo ? 'checked' : ''}
                       onchange="toggleDiaHorario(this)" style="opacity:0;width:0;height:0;position:absolute;">
                <span class="hm-track" style="position:absolute;inset:0;background:${cfg.activo ? 'var(--primary)' : '#cbd5e1'};border-radius:22px;cursor:pointer;transition:background .2s;">
                  <span class="hm-thumb" style="position:absolute;left:${cfg.activo ? '20px' : '2px'};top:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);"></span>
                </span>
              </label>
            </div>
            <div>
              <input type="time" class="hm-inicio form-control" data-dia="${dia}" step="900" value="${cfg.inicio || '08:00'}" style="max-width:130px;" ${cfg.activo ? '' : 'disabled'}>
            </div>
            <div>
              <input type="time" class="hm-fin form-control" data-dia="${dia}" step="900" value="${cfg.fin || '20:00'}" style="max-width:130px;" ${cfg.activo ? '' : 'disabled'}>
            </div>
          </div>
        `;
      });

      const container = document.querySelector('.main .card');
      if (container) {
        container.innerHTML = `
          <form id="form-horarios-sucursal" onsubmit="event.preventDefault(); guardarHorariosSucursal('${id}')">
            <div style="display:flex;flex-direction:column;gap:0;">
              <div style="display:grid;grid-template-columns:110px 70px 1fr 1fr;gap:12px;padding:8px 12px;background:var(--bg);border-radius:8px 8px 0 0;border:1px solid var(--border);font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px;">
                <div>Día</div>
                <div style="text-align:center;">Abierto</div>
                <div>Apertura</div>
                <div>Cierre</div>
              </div>
              ${rowsHTML}
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
              <button type="button" class="btn btn-secondary" onclick="renderConfiguracion()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar horarios</button>
            </div>
          </form>
        `;
      }
    })
    .catch(err => {
      const container = document.querySelector('.main .card');
      if (container) container.innerHTML = `<p class="text-muted">Error: ${err.message}</p>`;
    });
}

function toggleDiaHorario(cb) {
  const row = cb.closest('.horario-dia-row');
  const track = row.querySelector('.hm-track');
  const thumb = row.querySelector('.hm-thumb');
  const inicio = row.querySelector('.hm-inicio');
  const fin = row.querySelector('.hm-fin');
  const checked = cb.checked;

  track.style.background = checked ? 'var(--primary)' : '#cbd5e1';
  thumb.style.left = checked ? '20px' : '2px';
  inicio.disabled = !checked;
  fin.disabled = !checked;
  inicio.style.opacity = checked ? '1' : '0.4';
  fin.style.opacity = checked ? '1' : '0.4';
}

function guardarHorariosSucursal(id) {
  const rows = document.querySelectorAll('.horario-dia-row');
  const horarios = {};
  rows.forEach(row => {
    const dia = row.querySelector('.hm-activo').dataset.dia;
    const activo = row.querySelector('.hm-activo').checked;
    const inicio = row.querySelector('.hm-inicio').value || '08:00';
    const fin = row.querySelector('.hm-fin').value || '20:00';
    horarios[dia] = { activo, inicio, fin };
  });

  db.collection('horarios').doc(id).set(horarios)
    .then(() => {
      showToast('✅ Horarios guardados.');
      renderConfiguracion();
    })
    .catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// TAB: PERMISOS
// ============================================================
function renderPermisosTab(container) {
  const modulos = [
    'dashboard', 'agenda', 'pacientes', 'profesionales', 'automatizaciones', 'chat',
    'caja', 'presupuestos', 'productividad', 'liquidaciones', 'marketing',
    'tratamientos', 'especialidades', 'obras_sociales', 'inventario', 'proveedores',
    'landing', 'configuracion'
  ];
  const roles = ['secretaria', 'odontologo'];
  const roleLabels = {
    secretaria: 'Secretaria/o',
    odontologo: 'Profesional (Odontólogo)'
  };

  const moduloLabels = {
    dashboard: 'Dashboard',
    agenda: 'Agenda',
    pacientes: 'Pacientes',
    profesionales: 'Profesionales',
    automatizaciones: 'Automatizaciones',
    chat: 'Chat WhatsApp',
    caja: 'Caja',
    presupuestos: 'Presupuestos',
    productividad: 'Productividad',
    liquidaciones: 'Liquidaciones',
    marketing: 'Marketing',
    tratamientos: 'Tratamientos',
    especialidades: 'Especialidades',
    obras_sociales: 'Obras sociales',
    inventario: 'Inventario',
    proveedores: 'Proveedores',
    landing: 'Landing page',
    configuracion: 'Configuración'
  };

  const defaults = {
    secretaria: ['dashboard', 'agenda', 'pacientes', 'profesionales', 'caja', 'presupuestos', 'tratamientos'],
    odontologo: ['dashboard', 'agenda', 'pacientes']
  };

  const permisosGuardados = _configState.permisosData.permisos || {};

  let html = `
    <div class="card" style="margin-bottom:16px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:6px;padding-bottom:12px;border-bottom:1px solid var(--border);">
        Accesos por módulo
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;line-height:1.5;">
        El perfil <strong>Administrador</strong> siempre tiene acceso completo a todos los módulos y no puede ser restringido.<br>
        El acceso al <strong>Dashboard</strong> es obligatorio para todos los perfiles.
      </div>

      <div style="overflow-x:auto;">
        <table class="table" style="min-width:600px;">
          <thead>
            <tr>
              <th style="width:220px;">Módulo</th>
              <th style="text-align:center;width:60px;">Admin</th>
              <th style="text-align:center;"><span style="background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">Secretaria/o</span></th>
              <th style="text-align:center;"><span style="background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">Profesional (Odontólogo)</span></th>
            </tr>
          </thead>
          <tbody>
  `;

  modulos.forEach(mod => {
    const label = moduloLabels[mod] || mod;
    const isDashboard = mod === 'dashboard';
    html += `
      <tr>
        <td style="font-weight:500;font-size:13px;">${label}</td>
        <td style="text-align:center;"><span style="color:#1a6645;font-size:16px;" title="Admin siempre tiene acceso">✓</span></td>
    `;
    roles.forEach(rol => {
      const saved = permisosGuardados[rol] || [];
      const checked = saved.includes(mod) || (isDashboard) || (defaults[rol] && defaults[rol].includes(mod));
      const disabled = isDashboard || (rol === 'secretaria' && mod === 'dashboard') || (rol === 'odontologo' && mod === 'dashboard');
      html += `
        <td style="text-align:center;">
          <input type="checkbox" name="permisos[${rol}][${mod}]" value="1"
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : ''}
            style="width:16px;height:16px;accent-color:var(--primary);cursor:${disabled ? 'default' : 'pointer'};">
          ${disabled ? `<input type="hidden" name="permisos[${rol}][${mod}]" value="1">` : ''}
        </td>
      `;
    });
    html += `</tr>`;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>

    <form id="form-permisos" onsubmit="event.preventDefault(); guardarPermisos()">
      <div style="display:flex;gap:8px;align-items:center;">
        <button type="submit" class="btn btn-primary">Guardar cambios</button>
        <button type="button" class="btn btn-secondary" onclick="resetPermisosDefaults()">Restaurar valores por defecto</button>
      </div>
    </form>
  `;

  container.innerHTML = html;
}

function guardarPermisos() {
  const form = document.getElementById('form-permisos');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]:not([disabled])');
  const permisos = {};

  checkboxes.forEach(cb => {
    const match = cb.name.match(/permisos\[(\w+)\]\[(\w+)\]/);
    if (!match) return;
    const rol = match[1];
    const modulo = match[2];
    if (!permisos[rol]) permisos[rol] = [];
    if (cb.checked) permisos[rol].push(modulo);
  });

  ['secretaria', 'odontologo'].forEach(rol => {
    if (!permisos[rol]) permisos[rol] = [];
    if (!permisos[rol].includes('dashboard')) permisos[rol].push('dashboard');
  });

  db.collection('configuracion').doc('permisos').set({ permisos, updated: new Date().toISOString() })
    .then(() => {
      showToast('✅ Permisos guardados.');
      renderConfiguracion();
    })
    .catch(err => alert('❌ Error: ' + err.message));
}

function resetPermisosDefaults() {
  if (!confirm('¿Restaurar los permisos por defecto? Se perderán los cambios actuales.')) return;
  const defaults = {
    secretaria: ['dashboard', 'agenda', 'pacientes', 'profesionales', 'caja', 'presupuestos', 'tratamientos'],
    odontologo: ['dashboard', 'agenda', 'pacientes']
  };
  const checkboxes = document.querySelectorAll('#form-permisos input[type="checkbox"]:not([disabled])');
  checkboxes.forEach(cb => {
    const match = cb.name.match(/permisos\[(\w+)\]\[(\w+)\]/);
    if (!match) return;
    const rol = match[1];
    const modulo = match[2];
    cb.checked = defaults[rol] && defaults[rol].includes(modulo);
  });
}

// ============================================================
// TAB: ESTADOS
// ============================================================
function renderEstadosTab(container) {
  const estados = [
    { key: 'pendiente', label: 'Pendiente', defaultColor: '#6cd9f4' },
    { key: 'confirmado', label: 'Confirmado', defaultColor: '#395ff3' },
    { key: 'en_recepcion', label: 'En recepción', defaultColor: '#f59e0b' },
    { key: 'en_atencion', label: 'En atención', defaultColor: '#d853f3' },
    { key: 'finalizado', label: 'Finalizado', defaultColor: '#16a34a' },
    { key: 'cancelado', label: 'Cancelado', defaultColor: '#9ca3af' },
    { key: 'ausente', label: 'Ausente', defaultColor: '#dc2626' }
  ];

  const coloresGuardados = _configState.estadosData.colores || {};

  let html = `
    <div class="card" style="margin-bottom:16px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:4px;">Colores de los estados de turno</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">El color se aplica en la agenda, en los badges y en los cambios de estado del popup.</div>

      <div style="display:flex;flex-direction:column;gap:0;">
  `;

  estados.forEach(est => {
    const color = coloresGuardados[est.key] || est.defaultColor;
    html += `
      <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);">
        <div style="width:140px;flex-shrink:0;border-radius:6px;padding:6px 8px;background:${color};position:relative;">
          <div style="font-size:10px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">11:00 Apellido, Nombre</div>
          <div style="display:inline-block;margin-top:3px;font-size:9px;font-weight:700;color:${color};background:rgba(255,255,255,.88);border-radius:3px;padding:1px 5px;">${est.label}</div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:var(--text);">${est.label}</div>
          <div style="font-size:11px;color:var(--text-muted);font-family:monospace;">${est.key}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <input type="color" name="color[${est.key}]" value="${color}" id="cp-${est.key}"
            oninput="actualizarPreviewEstado('${est.key}', this.value)"
            style="width:44px;height:36px;padding:2px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:none;">
          <input type="text" id="hex-${est.key}" value="${color}" maxlength="7"
            oninput="sincronizarHexEstado('${est.key}', this.value)"
            style="width:80px;font-family:monospace;font-size:13px;" class="form-control">
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>

    <form id="form-estados" onsubmit="event.preventDefault(); guardarEstados()">
      <div style="display:flex;gap:8px;align-items:center;">
        <button type="submit" class="btn btn-primary">Guardar colores</button>
        <button type="button" class="btn btn-secondary" onclick="restaurarEstadosDefaults()">Restaurar</button>
      </div>
    </form>
  `;

  container.innerHTML = html;
}

function actualizarPreviewEstado(key, color) {
  document.getElementById('hex-' + key).value = color;
  const row = document.getElementById('cp-' + key).closest('[style*="border-bottom"]');
  if (!row) return;
  const preview = row.querySelector('div[style*="border-radius:6px"]');
  if (preview) preview.style.background = color;
  const badge = row.querySelector('div[style*="display:inline-block"]');
  if (badge) badge.style.color = color;
}

function sincronizarHexEstado(key, val) {
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    document.getElementById('cp-' + key).value = val;
    actualizarPreviewEstado(key, val);
  }
}

function guardarEstados() {
  const colores = {};
  document.querySelectorAll('#form-estados input[type="color"]').forEach(input => {
    const key = input.name.match(/color\[(\w+)\]/);
    if (key) colores[key[1]] = input.value;
  });

  db.collection('configuracion').doc('estados').set({ colores, updated: new Date().toISOString() })
    .then(() => {
      showToast('✅ Colores de estados guardados.');
      renderConfiguracion();
    })
    .catch(err => alert('❌ Error: ' + err.message));
}

function restaurarEstadosDefaults() {
  if (!confirm('¿Restaurar colores por defecto?')) return;
  const defaults = {
    pendiente: '#6cd9f4',
    confirmado: '#395ff3',
    en_recepcion: '#f59e0b',
    en_atencion: '#d853f3',
    finalizado: '#16a34a',
    cancelado: '#9ca3af',
    ausente: '#dc2626'
  };
  Object.keys(defaults).forEach(key => {
    document.getElementById('cp-' + key).value = defaults[key];
    document.getElementById('hex-' + key).value = defaults[key];
    actualizarPreviewEstado(key, defaults[key]);
  });
}

// ============================================================
// TAB: APARIENCIA
// ============================================================
function renderAparienciaTab(container) {
  const estiloActual = _configState.aparienciaData.estilo || 'claro';
  const colores = _configState.aparienciaData.colores || {
    primario: '#355063',
    accent: '#4285F4',
    menu: '#080303',
    fondo: '#ffffff'
  };

  container.innerHTML = `
    <form id="form-apariencia" onsubmit="event.preventDefault(); guardarApariencia()">
      <div class="card" style="margin-bottom:16px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px;">Estilo del panel</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">Elegí cómo se ve el panel para todo el equipo de la clínica (topnav, botones, links, tablas, tarjetas). No afecta la landing pública.</div>

        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          ${['claro', 'oscuro', 'personalizado'].map(est => `
            <label class="ap-style-card" id="estilo-card-${est}" onclick="seleccionarEstiloApariencia('${est}')"
                   style="cursor:pointer;flex:1;min-width:220px;max-width:280px;border:2px solid ${est === estiloActual ? 'var(--accent)' : 'var(--border)'};border-radius:12px;padding:4px;">
              <input type="radio" name="estilo" value="${est}" ${est === estiloActual ? 'checked' : ''} style="display:none;">
              <div style="border-radius:8px;overflow:hidden;background:${est === 'claro' ? '#f0f4f7' : est === 'oscuro' ? '#0f1720' : '#f0f4f7'};height:110px;position:relative;">
                ${est === 'claro' ? `
                  <div style="height:22px;background:#253845;"></div>
                  <div style="position:absolute;top:22px;left:0;bottom:0;width:36%;background:#fff;border-right:1px solid #dce4ea;"></div>
                  <div style="position:absolute;top:32px;left:6%;width:24%;height:8px;border-radius:3px;background:#e8f0fe;"></div>
                  <div style="position:absolute;top:46px;left:6%;width:20%;height:6px;border-radius:3px;background:#dce4ea;"></div>
                  <div style="position:absolute;top:32px;left:40%;width:50%;height:34px;border-radius:6px;background:#fff;border:1px solid #dce4ea;"></div>
                  <div style="position:absolute;top:72px;left:40%;width:50%;height:24px;border-radius:6px;background:#fff;border:1px solid #dce4ea;"></div>
                ` : est === 'oscuro' ? `
                  <div style="height:22px;background:#000;"></div>
                  <div style="position:absolute;top:22px;left:0;bottom:0;width:36%;background:#17222c;border-right:1px solid #2c3b48;"></div>
                  <div style="position:absolute;top:32px;left:6%;width:24%;height:8px;border-radius:3px;background:#26313d;"></div>
                  <div style="position:absolute;top:46px;left:6%;width:20%;height:6px;border-radius:3px;background:#2c3b48;"></div>
                  <div style="position:absolute;top:32px;left:40%;width:50%;height:34px;border-radius:6px;background:#17222c;border:1px solid #2c3b48;"></div>
                  <div style="position:absolute;top:72px;left:40%;width:50%;height:24px;border-radius:6px;background:#17222c;border:1px solid #2c3b48;"></div>
                ` : `
                  <div style="height:22px;background:linear-gradient(90deg,#7c3aed,#db2777);"></div>
                  <div style="position:absolute;top:22px;left:0;bottom:0;width:36%;background:#fff;border-right:1px solid #dce4ea;"></div>
                  <div style="position:absolute;top:32px;left:6%;width:24%;height:8px;border-radius:3px;background:#f3e8ff;"></div>
                  <div style="position:absolute;top:46px;left:6%;width:20%;height:6px;border-radius:3px;background:#dce4ea;"></div>
                  <div style="position:absolute;top:32px;left:40%;width:50%;height:34px;border-radius:6px;background:#fff;border:1px solid #dce4ea;"></div>
                  <div style="position:absolute;top:72px;left:40%;width:50%;height:24px;border-radius:6px;background:#fff;border:1px solid #dce4ea;"></div>
                `}
              </div>
              <div style="padding:10px 6px 6px;font-size:13px;font-weight:700;">${est === 'claro' ? '☀️ Claro' : est === 'oscuro' ? '🌙 Oscuro' : '🎨 Personalizado'}</div>
              <div style="padding:0 6px 8px;font-size:11px;color:var(--text-muted);">${est === 'claro' ? 'El estilo por defecto del panel.' : est === 'oscuro' ? 'Fondo oscuro para todo el equipo.' : 'Elegí tus propios colores.'}</div>
            </label>
          `).join('')}
        </div>

        <div id="ap-colores-wrap" style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);display:${estiloActual === 'personalizado' ? 'flex' : 'none'};flex-wrap:wrap;gap:28px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Color primario (topnav)</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <input type="color" id="ap_color_primario_picker" value="${colores.primario || '#355063'}"
                oninput="document.getElementById('ap_color_primario_hex').value=this.value.toUpperCase();document.getElementById('ap_color_primario').value=this.value"
                style="width:44px;height:38px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;">
              <input type="text" id="ap_color_primario_hex" class="form-control" value="${colores.primario || '#355063'}"
                oninput="if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){document.getElementById('ap_color_primario_picker').value=this.value;document.getElementById('ap_color_primario').value=this.value}"
                placeholder="#355063" maxlength="7" style="width:120px;">
              <input type="hidden" name="color_primario" id="ap_color_primario" value="${colores.primario || '#355063'}">
            </div>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Color de acento (botones, links)</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <input type="color" id="ap_color_accent_picker" value="${colores.accent || '#4285F4'}"
                oninput="document.getElementById('ap_color_accent_hex').value=this.value.toUpperCase();document.getElementById('ap_color_accent').value=this.value"
                style="width:44px;height:38px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;">
              <input type="text" id="ap_color_accent_hex" class="form-control" value="${colores.accent || '#4285F4'}"
                oninput="if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){document.getElementById('ap_color_accent_picker').value=this.value;document.getElementById('ap_color_accent').value=this.value}"
                placeholder="#4285F4" maxlength="7" style="width:120px;">
              <input type="hidden" name="color_accent" id="ap_color_accent" value="${colores.accent || '#4285F4'}">
            </div>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Color del menú lateral</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <input type="color" id="ap_color_menu_picker" value="${colores.menu || '#080303'}"
                oninput="document.getElementById('ap_color_menu_hex').value=this.value.toUpperCase();document.getElementById('ap_color_menu').value=this.value"
                style="width:44px;height:38px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;">
              <input type="text" id="ap_color_menu_hex" class="form-control" value="${colores.menu || '#080303'}"
                oninput="if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){document.getElementById('ap_color_menu_picker').value=this.value;document.getElementById('ap_color_menu').value=this.value}"
                placeholder="#080303" maxlength="7" style="width:120px;">
              <input type="hidden" name="color_menu" id="ap_color_menu" value="${colores.menu || '#080303'}">
            </div>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Color de fondo</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <input type="color" id="ap_color_fondo_picker" value="${colores.fondo || '#ffffff'}"
                oninput="document.getElementById('ap_color_fondo_hex').value=this.value.toUpperCase();document.getElementById('ap_color_fondo').value=this.value"
                style="width:44px;height:38px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;">
              <input type="text" id="ap_color_fondo_hex" class="form-control" value="${colores.fondo || '#ffffff'}"
                oninput="if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){document.getElementById('ap_color_fondo_picker').value=this.value;document.getElementById('ap_color_fondo').value=this.value}"
                placeholder="#ffffff" maxlength="7" style="width:120px;">
              <input type="hidden" name="color_fondo" id="ap_color_fondo" value="${colores.fondo || '#ffffff'}">
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;align-items:center;">
        <button type="submit" class="btn btn-primary">Guardar apariencia</button>
      </div>
    </form>
  `;
}

function seleccionarEstiloApariencia(valor) {
  ['claro', 'oscuro', 'personalizado'].forEach(v => {
    document.getElementById('estilo-card-' + v).style.borderColor = (v === valor) ? 'var(--accent)' : 'var(--border)';
  });
  document.querySelector('input[name="estilo"][value="' + valor + '"]').checked = true;
  document.getElementById('ap-colores-wrap').style.display = (valor === 'personalizado') ? 'flex' : 'none';
}

function guardarApariencia() {
  const estilo = document.querySelector('input[name="estilo"]:checked').value;
  const colores = {
    primario: document.getElementById('ap_color_primario').value,
    accent: document.getElementById('ap_color_accent').value,
    menu: document.getElementById('ap_color_menu').value,
    fondo: document.getElementById('ap_color_fondo').value
  };

  db.collection('configuracion').doc('apariencia').set({ estilo, colores, updated: new Date().toISOString() })
    .then(() => {
      showToast('✅ Apariencia guardada.');
      renderConfiguracion();
    })
    .catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// ESCAPAR HTML
// ============================================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-configuracion')) {
  renderConfiguracion();
}
