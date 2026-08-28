// ============================================================
// PROFESIONALES - 
// ============================================================

// ============================================================
// RENDER PROFESIONALES PRINCIPAL
// ============================================================
function renderProfesionales() {
  const el = $('view-profesionales');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Profesionales</div>
        <div class="page-subtitle" id="profesionales-count">Cargando...</div>
      </div>
      <a href="#" class="btn btn-primary" onclick="openModalNuevoProfesional()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nuevo profesional
      </a>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:16px;">
      <form id="prof-filter-form" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;" onsubmit="return false;">
        <div class="form-group" style="margin:0;flex:1;min-width:160px;">
          <label class="form-label">Buscar</label>
          <input type="text" id="prof-search-input" class="form-control" placeholder="Nombre, apellido o email…" oninput="aplicarFiltrosProfesionales()">
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Rol</label>
          <select id="prof-filter-rol" class="form-control" onchange="aplicarFiltrosProfesionales()">
            <option value="">Todos</option>
            <option value="odontologo">Odontólogo</option>
            <option value="admin">Administrador</option>
            <option value="secretaria">Secretaria/o</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Estado</label>
          <select id="prof-filter-estado" class="form-control" onchange="aplicarFiltrosProfesionales()">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <button type="button" class="btn btn-primary" onclick="aplicarFiltrosProfesionales()">Filtrar</button>
        <button type="button" class="btn btn-secondary" onclick="limpiarFiltrosProfesionales()">Limpiar</button>
      </form>
    </div>

    <!-- Modal confirmar eliminación -->
    <div id="modal-eliminar-prof" style="display:none;position:fixed;inset:0;z-index:9000;align-items:center;justify-content:center;background:rgba(0,0,0,.45)">
      <div class="card" style="width:100%;max-width:420px;margin:0 16px;padding:28px 24px">
        <div style="font-weight:700;font-size:16px;margin-bottom:8px">Eliminar profesional</div>
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:20px">
          ¿Estás seguro de que querés eliminar a <strong id="modal-nombre-prof"></strong>?
          Esta acción no se puede deshacer.
        </p>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-secondary" onclick="cerrarEliminarProf()">Cancelar</button>
          <button type="button" class="btn" style="background:var(--danger,#e53e3e);color:#fff;border-color:var(--danger,#e53e3e)" onclick="ejecutarEliminarProf()">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Tabla desktop -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="prof-table-wrap" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Profesional</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Rol</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Especialidad</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Email</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Teléfono</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:center;">Agenda</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Estado</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;"></th>
            </tr>
          </thead>
          <tbody id="profesionales-list">
            <!-- Generado por JS -->
          </tbody>
        </table>
      </div>

      <div class="prof-mob-list" id="profesionales-mobile-list" style="display:none;border-top:1px solid var(--border);">
        <!-- Generado por JS -->
      </div>
    </div>
  `;

  // Estilos para mobile
  if (!document.getElementById('prof-mobile-styles')) {
    const style = document.createElement('style');
    style.id = 'prof-mobile-styles';
    style.textContent = `
      @media (max-width: 768px) {
        .prof-table-wrap { display: none !important; }
        .prof-mob-list { display: block !important; }
        .card form > div { min-width: 0; }
      }
      .prof-mob-list { display: none; }
      @media (min-width: 769px) {
        .prof-mob-list { display: none !important; }
      }
      .avatar-prof {
        width: 34px; height: 34px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 13px; flex-shrink: 0;
        background: var(--primary, #355063); color: #fff; overflow: hidden;
      }
      .avatar-prof img { width: 100%; height: 100%; object-fit: cover; }
      .modal-box { max-width: 900px !important; }
      @media (max-width: 768px) {
        #prof-edit-grid { grid-template-columns: 1fr !important; }
        #prof-edit-datos-grid { grid-template-columns: 1fr !important; }
        #prof-edit-prof-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }

  cargarProfesionales();
}

// ============================================================
// CARGAR PROFESIONALES DESDE FIRESTORE
// ============================================================
function cargarProfesionales() {
  db.collection('profesionales').orderBy('nombre').onSnapshot((snapshot) => {
    const profesionales = [];
    snapshot.forEach(doc => {
      profesionales.push({ id: doc.id, ...doc.data() });
    });
    window._profesionalesData = profesionales;
    aplicarFiltrosProfesionales();
  }, (error) => {
    console.error('Error cargando profesionales:', error);
    $('profesionales-list').innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">Error al cargar los datos.</td></tr>`;
  });
}

// ============================================================
// APLICAR FILTROS
// ============================================================
window.aplicarFiltrosProfesionales = function() {
  const searchInput = $('prof-search-input');
  const rolSelect = $('prof-filter-rol');
  const estadoSelect = $('prof-filter-estado');

  const busqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const rol = rolSelect ? rolSelect.value : '';
  const estado = estadoSelect ? estadoSelect.value : '';

  let filtrados = window._profesionalesData || [];

  if (busqueda) {
    filtrados = filtrados.filter(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
      const email = (p.email || '').toLowerCase();
      return nombre.includes(busqueda) || email.includes(busqueda);
    });
  }

  if (rol) {
    filtrados = filtrados.filter(p => p.rol === rol);
  }

  if (estado === 'activo') {
    filtrados = filtrados.filter(p => p.estado !== false);
  } else if (estado === 'inactivo') {
    filtrados = filtrados.filter(p => p.estado === false);
  }

  const countEl = $('profesionales-count');
  if (countEl) {
    countEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'en total' : 'en total'}`;
  }

  renderTablaProfesionales(filtrados);
  renderMobileProfesionales(filtrados);
};

// ============================================================
// RENDER TABLA DESKTOP
// ============================================================
function renderTablaProfesionales(profesionales) {
  const tbody = $('profesionales-list');
  if (!tbody) return;

  if (profesionales.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">No hay profesionales que coincidan con los filtros.</td></tr>`;
    return;
  }

  const rolBadges = {
    'odontologo': 'badge-blue',
    'admin': 'badge-amber',
    'secretaria': 'badge-green'
  };
  const rolTextos = {
    'odontologo': 'Odontólogo',
    'admin': 'Administrador',
    'secretaria': 'Secretaria/o'
  };

  let html = '';
  profesionales.forEach(p => {
    const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
    const iniciales = nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const estadoActivo = p.estado !== false;
    const estadoBadge = estadoActivo ? 'badge-green' : 'badge-gray';
    const estadoTexto = estadoActivo ? 'Activo' : 'Inactivo';
    const rolClase = rolBadges[p.rol] || 'badge-gray';
    const rolTexto = rolTextos[p.rol] || p.rol || '—';
    const especialidad = p.especialidad || '—';
    const email = p.email || '—';
    const telefono = p.telefono || '—';
    const cedula = p.cedula || '';
    const colorAgenda = p.color_agenda || '#355063';
    const tieneFoto = p.foto ? true : false;

    const toggleBtn = estadoActivo
      ? `<a href="#" class="btn btn-sm" style="background:#fef3cd;color:#856404;" onclick="toggleEstadoProfesional('${p.id}')">Desactivar</a>`
      : `<a href="#" class="btn btn-sm" style="background:#d4edda;color:#155724;" onclick="toggleEstadoProfesional('${p.id}')">Activar</a>`;

    html += `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar-prof">
              ${tieneFoto ? `<img src="${p.foto}" alt="">` : iniciales}
            </div>
            <div>
              <div style="font-weight:600">${nombre}</div>
              ${cedula ? `<div style="font-size:11px;color:var(--text-muted)">Cédula: ${cedula}</div>` : ''}
            </div>
          </div>
        </td>
        <td><span class="badge ${rolClase}">${rolTexto}</span></td>
        <td style="font-size:12px;color:var(--text-muted)">${especialidad}</td>
        <td style="font-size:12px">${email}</td>
        <td style="font-size:12px;color:var(--text-muted)">${telefono}</td>
        <td style="text-align:center">
          <span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:${colorAgenda};" title="${colorAgenda}"></span>
        </td>
        <td><span class="badge ${estadoBadge}">${estadoTexto}</span></td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <a href="#" class="btn btn-secondary btn-sm" onclick="editarProfesional('${p.id}')">Editar</a>
            <a href="#" class="btn btn-secondary btn-sm" onclick="openModalHorarios('${p.id}')" title="Configurar horarios">🕐 Horarios</a>
            <a href="#" class="btn btn-secondary btn-sm" onclick="openModalObrasSociales('${p.id}')" title="Obras sociales que atiende">🏥 Obras</a>
            ${toggleBtn}
            <button type="button" class="btn btn-sm" style="color:var(--danger,#e53e3e);border-color:var(--danger,#e53e3e);background:transparent;" onclick="confirmarEliminarProf('${p.id}', '${nombre.replace(/'/g, "\\'")}')">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================
// RENDER LISTA MOBILE
// ============================================================
function renderMobileProfesionales(profesionales) {
  const container = $('profesionales-mobile-list');
  if (!container) return;

  if (profesionales.length === 0) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">No hay profesionales que coincidan con los filtros.</div>`;
    container.style.display = 'block';
    return;
  }

  const rolTextos = {
    'odontologo': 'Odontólogo',
    'admin': 'Administrador',
    'secretaria': 'Secretaria/o'
  };
  const rolBadges = {
    'odontologo': 'badge-blue',
    'admin': 'badge-amber',
    'secretaria': 'badge-green'
  };

  let html = '';
  profesionales.forEach(p => {
    const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
    const iniciales = nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const estadoActivo = p.estado !== false;
    const estadoBadge = estadoActivo ? 'badge-green' : 'badge-gray';
    const estadoTexto = estadoActivo ? 'Activo' : 'Inactivo';
    const rolClase = rolBadges[p.rol] || 'badge-gray';
    const rolTexto = rolTextos[p.rol] || p.rol || '—';
    const especialidad = p.especialidad || '';
    const tieneFoto = p.foto ? true : false;

    html += `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #f1f5f9;">
        <div class="avatar-prof" style="width:38px;height:38px;font-size:13px;">
          ${tieneFoto ? `<img src="${p.foto}" alt="">` : iniciales}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${nombre}
          </div>
          <div style="margin-top:3px;display:flex;gap:4px;flex-wrap:wrap;">
            <span class="badge ${rolClase}">${rolTexto}</span>
            <span class="badge ${estadoBadge}">${estadoTexto}</span>
          </div>
          ${especialidad ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${especialidad}</div>` : ''}
        </div>
        <a href="#" class="btn btn-secondary btn-sm" style="flex-shrink:0;" onclick="editarProfesional('${p.id}')">Editar</a>
      </div>
    `;
  });

  container.innerHTML = html;
  container.style.display = 'block';
}

// ============================================================
// LIMPIAR FILTROS
// ============================================================
window.limpiarFiltrosProfesionales = function() {
  const searchInput = $('prof-search-input');
  const rolSelect = $('prof-filter-rol');
  const estadoSelect = $('prof-filter-estado');
  if (searchInput) searchInput.value = '';
  if (rolSelect) rolSelect.value = '';
  if (estadoSelect) estadoSelect.value = '';
  aplicarFiltrosProfesionales();
};

// ============================================================
// FUNCIONES CRUD BÁSICAS
// ============================================================

let _eliminarProfId = null;

window.confirmarEliminarProf = function(id, nombre) {
  _eliminarProfId = id;
  document.getElementById('modal-nombre-prof').textContent = nombre;
  document.getElementById('modal-eliminar-prof').style.display = 'flex';
};

window.cerrarEliminarProf = function() {
  document.getElementById('modal-eliminar-prof').style.display = 'none';
  _eliminarProfId = null;
};

window.ejecutarEliminarProf = function() {
  if (!_eliminarProfId) return;
  db.collection('profesionales').doc(_eliminarProfId).delete()
    .then(() => {
      cerrarEliminarProf();
      showToast('🗑 Profesional eliminado.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

window.toggleEstadoProfesional = function(id) {
  const prof = window._profesionalesData.find(p => p.id === id);
  if (!prof) return;
  const nuevoEstado = prof.estado === false ? true : false;
  const mensaje = nuevoEstado ? 'activar' : 'desactivar';
  if (!confirm(`¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} este profesional?`)) return;
  db.collection('profesionales').doc(id).update({ estado: nuevoEstado })
    .then(() => showToast(`✅ Profesional ${mensaje}do.`))
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// MODAL: NUEVO PROFESIONAL (simplificado)
// ============================================================
window.openModalNuevoProfesional = function() {
  openModal(`
    <div class="modal-title">➕ Nuevo profesional</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group"><label class="form-label">Nombre *</label><input class="form-control" id="f-prof-nombre" placeholder="Nombre"></div>
      <div class="form-group"><label class="form-label">Apellido *</label><input class="form-control" id="f-prof-apellido" placeholder="Apellido"></div>
      <div class="form-group"><label class="form-label">Email *</label><input class="form-control" id="f-prof-email" type="email" placeholder="Email"></div>
      <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="f-prof-telefono" placeholder="Teléfono"></div>
      <div class="form-group"><label class="form-label">Cédula</label><input class="form-control" id="f-prof-cedula" placeholder="Cédula profesional"></div>
      <div class="form-group"><label class="form-label">Comisión (%)</label><input class="form-control" id="f-prof-comision" type="number" step="0.01" value="40"></div>
      <div class="form-group"><label class="form-label">Color agenda</label><input class="form-control" id="f-prof-color" type="color" value="#355063"></div>
      <div class="form-group">
        <label class="form-label">Rol</label>
        <select class="form-control" id="f-prof-rol">
          <option value="odontologo">Odontólogo</option>
          <option value="admin">Administrador</option>
          <option value="secretaria">Secretaria/o</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-control" id="f-prof-estado">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarProfesional()">Guardar</button>
    </div>
  `);
};

window.guardarProfesional = function() {
  const nombre = $('f-prof-nombre').value.trim();
  const apellido = $('f-prof-apellido').value.trim();
  const email = $('f-prof-email').value.trim();
  const telefono = $('f-prof-telefono').value.trim();
  const cedula = $('f-prof-cedula').value.trim();
  const comision = parseFloat($('f-prof-comision').value) || 0;
  const color = $('f-prof-color').value || '#355063';
  const rol = $('f-prof-rol').value;
  const estado = $('f-prof-estado').value === 'activo';

  if (!nombre || !apellido || !email) return alert('Nombre, apellido y email son obligatorios.');

  db.collection('profesionales').add({
    nombre, apellido, email, telefono, cedula,
    comision_porcentaje: comision,
    color_agenda: color,
    rol, estado,
    especialidades_ids: [],
    tratamiento_ids: [],
    fecha_creacion: new Date().toISOString().slice(0, 10)
  }).then(() => {
    closeModal();
    showToast('✅ Profesional creado exitosamente.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// EDITAR PROFESIONAL - SIN FOTO (simplificado)
// ============================================================
window.editarProfesional = function(id) {
  db.collection('profesionales').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Profesional no encontrado');
    const data = doc.data();

    // Cargar especialidades y tratamientos SIN orderBy compuesto
    Promise.all([
      db.collection('especialidades').orderBy('nombre').get(),
      db.collection('tratamientos').get()
    ]).then(([especialidadesSnap, tratamientosSnap]) => {
      const especialidades = [];
      especialidadesSnap.forEach(d => especialidades.push({ id: d.id, ...d.data() }));

      const tratamientosPorCategoria = {};
      tratamientosSnap.forEach(d => {
        const t = { id: d.id, ...d.data() };
        const cat = t.categoria || 'otros';
        if (!tratamientosPorCategoria[cat]) tratamientosPorCategoria[cat] = [];
        tratamientosPorCategoria[cat].push(t);
      });
      for (const cat in tratamientosPorCategoria) {
        tratamientosPorCategoria[cat].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      }

      let especialidadesHTML = '';
      especialidades.forEach(esp => {
        const checked = (data.especialidades_ids && data.especialidades_ids.includes(esp.id)) ? 'checked' : '';
        especialidadesHTML += `
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:#fff;font-size:13px;transition:background .1s"
                 onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">
            <input type="checkbox" name="especialidad_ids[]" value="${esp.id}" ${checked} style="accent-color:var(--primary)">
            ${esp.nombre || 'Sin nombre'}
          </label>
        `;
      });

      let tratamientosHTML = '';
      for (const [cat, items] of Object.entries(tratamientosPorCategoria)) {
        tratamientosHTML += `<div><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px">${cat}</div><div style="display:flex;flex-wrap:wrap;gap:6px">`;
        items.forEach(t => {
          const checked = (data.tratamiento_ids && data.tratamiento_ids.includes(t.id)) ? 'checked' : '';
          tratamientosHTML += `
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:#fff;font-size:13px;transition:background .1s"
                   onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">
              <input type="checkbox" name="tratamiento_ids[]" value="${t.id}" ${checked} style="accent-color:var(--primary)">
              ${t.nombre || 'Sin nombre'}
            </label>
          `;
        });
        tratamientosHTML += `</div></div>`;
      }

      const nombreCompleto = `${data.nombre || ''} ${data.apellido || ''}`.trim();
      const iniciales = nombreCompleto.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

      openModal(`
        <div style="margin-bottom:12px;display:flex;align-items:center;gap:12px;">
          <a href="#" class="btn btn-secondary btn-sm" onclick="closeModal();return false;">&larr; Volver</a>
          <div>
            <div class="modal-title" style="margin:0;">Editar profesional</div>
            <div style="font-size:14px;color:var(--text-muted);">${nombreCompleto}</div>
          </div>
        </div>

        <div id="prof-edit-grid" style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start;">

          <!-- Columna principal -->
          <div style="display:flex;flex-direction:column;gap:16px;">

            <!-- Datos personales -->
            <div class="card">
              <div style="font-size:13px;font-weight:700;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">Datos personales</div>
              <div id="prof-edit-datos-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div class="form-group">
                  <label class="form-label">Nombre <span style="color:red">*</span></label>
                  <input type="text" id="f-prof-edit-nombre" class="form-control" value="${data.nombre || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Apellido <span style="color:red">*</span></label>
                  <input type="text" id="f-prof-edit-apellido" class="form-control" value="${data.apellido || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Email <span style="color:red">*</span></label>
                  <input type="email" id="f-prof-edit-email" class="form-control" value="${data.email || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input type="text" id="f-prof-edit-telefono" class="form-control" value="${data.telefono || ''}">
                </div>
              </div>
            </div>

            <!-- Datos profesionales -->
            <div class="card">
              <div style="font-size:13px;font-weight:700;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">Datos profesionales</div>
              <div id="prof-edit-prof-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div class="form-group" style="grid-column:1/-1;">
                  <label class="form-label">Especialidades</label>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);">
                    ${especialidadesHTML}
                  </div>
                  <span class="form-hint">Se muestra al paciente al reservar turno online</span>
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                  <label class="form-label">Tratamientos que realiza</label>
                  <div style="border:1px solid var(--border);border-radius:8px;background:var(--bg);padding:12px;display:flex;flex-direction:column;gap:12px;">
                    ${tratamientosHTML}
                  </div>
                  <span class="form-hint">Solo se mostrarán profesionales que realizan el tratamiento seleccionado al reservar turno online</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Cédula / Matrícula profesional</label>
                  <input type="text" id="f-prof-edit-cedula" class="form-control" value="${data.cedula || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Comisión (%)</label>
                  <input type="number" id="f-prof-edit-comision" class="form-control" value="${data.comision_porcentaje || 40}" min="0" max="100" step="0.01">
                </div>
                <div class="form-group">
                  <label class="form-label">Color en agenda</label>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <input type="color" id="f-prof-edit-color" value="${data.color_agenda || '#355063'}" style="width:44px;height:36px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px;">
                    <span style="font-size:12px;color:var(--text-muted)">Se usa para identificar al profesional en la agenda</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cambiar contraseña -->
            <div class="card">
              <div style="font-size:13px;font-weight:700;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">Cambiar contraseña</div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Dejá en blanco para mantener la contraseña actual.</div>
              <div style="max-width:320px;">
                <div class="form-group" style="margin:0;position:relative;">
                  <label class="form-label">Contraseña</label>
                  <input type="password" id="f-prof-edit-password" class="form-control" placeholder="Nueva contraseña (opcional)" autocomplete="new-password">
                  <button type="button" onclick="togglePwdEdit()" style="position:absolute;right:10px;top:32px;background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:13px;" tabindex="-1">👁</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna lateral (sin foto) -->
          <div style="display:flex;flex-direction:column;gap:16px;">

            <!-- Configuración -->
            <div class="card">
              <div style="font-size:13px;font-weight:700;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">Configuración</div>
              <div class="form-group">
                <label class="form-label">Rol</label>
                <select id="f-prof-edit-rol" class="form-control">
                  <option value="odontologo" ${data.rol === 'odontologo' ? 'selected' : ''}>Odontólogo</option>
                  <option value="admin" ${data.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                  <option value="secretaria" ${data.rol === 'secretaria' ? 'selected' : ''}>Secretaria/o</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Estado</label>
                <select id="f-prof-edit-estado" class="form-control">
                  <option value="activo" ${data.estado !== false ? 'selected' : ''}>Activo</option>
                  <option value="inactivo" ${data.estado === false ? 'selected' : ''}>Inactivo</option>
                </select>
              </div>
            </div>

            <button type="button" class="btn btn-primary" onclick="guardarEdicionProfesional('${id}')" style="width:100%;">Guardar cambios</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="width:100%;text-align:center;">Cancelar</button>
          </div>
        </div>
      `);

    }).catch(err => alert('Error al cargar datos: ' + err.message));
  }).catch(err => alert('Error al cargar profesional: ' + err.message));
};

// ============================================================
// TOGGLE CONTRASEÑA
// ============================================================
window.togglePwdEdit = function() {
  const input = document.getElementById('f-prof-edit-password');
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
};

// ============================================================
// GUARDAR EDICIÓN DE PROFESIONAL (sin foto)
// ============================================================
window.guardarEdicionProfesional = function(id) {
  const nombre = $('f-prof-edit-nombre').value.trim();
  const apellido = $('f-prof-edit-apellido').value.trim();
  const email = $('f-prof-edit-email').value.trim();
  const telefono = $('f-prof-edit-telefono').value.trim();
  const cedula = $('f-prof-edit-cedula').value.trim();
  const comision = parseFloat($('f-prof-edit-comision').value) || 0;
  const color = $('f-prof-edit-color').value || '#355063';
  const rol = $('f-prof-edit-rol').value;
  const estado = $('f-prof-edit-estado').value === 'activo';
  const password = $('f-prof-edit-password').value;

  if (!nombre || !apellido || !email) return alert('Nombre, apellido y email son obligatorios.');

  const especialidadesCheckboxes = document.querySelectorAll('input[name="especialidad_ids[]"]:checked');
  const especialidades_ids = Array.from(especialidadesCheckboxes).map(cb => cb.value);

  const tratamientosCheckboxes = document.querySelectorAll('input[name="tratamiento_ids[]"]:checked');
  const tratamiento_ids = Array.from(tratamientosCheckboxes).map(cb => cb.value);

  const updateData = {
    nombre, apellido, email, telefono, cedula,
    comision_porcentaje: comision,
    color_agenda: color,
    rol, estado,
    especialidades_ids,
    tratamiento_ids
  };

  if (password) {
    updateData.password = password;
  }

  db.collection('profesionales').doc(id).update(updateData)
    .then(() => {
      closeModal();
      showToast('✅ Profesional actualizado correctamente.');
    })
    .catch(err => {
      alert('❌ Error al actualizar: ' + err.message);
    });
};

// ============================================================
// MODALES: HORARIOS Y OBRAS SOCIALES
// ============================================================

window.openModalHorarios = function(id) {
  db.collection('profesionales').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Profesional no encontrado');
    const data = doc.data();
    const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';

    openModal(`
      <div class="modal-title">🕐 Configurar horarios</div>
      <div style="margin-bottom:16px;">
        <div style="font-weight:600;font-size:15px;">${nombre}</div>
        <div style="font-size:13px;color:var(--text-muted);">Aquí puedes configurar los horarios de atención del profesional.</div>
      </div>
      <div style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg);margin-bottom:16px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Horarios por día</div>
        <div style="display:grid;grid-template-columns:100px 1fr 1fr;gap:8px;font-size:13px;">
          <div style="font-weight:600;color:var(--text-muted);">Día</div>
          <div style="font-weight:600;color:var(--text-muted);">Desde</div>
          <div style="font-weight:600;color:var(--text-muted);">Hasta</div>
          ${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(dia => `
            <div>${dia}</div>
            <input type="time" class="form-control" style="width:100%;" value="09:00">
            <input type="time" class="form-control" style="width:100%;" value="18:00">
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
        <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary" onclick="alert('Funcionalidad en desarrollo')">Guardar horarios</button>
      </div>
    `);
  }).catch(err => alert('Error: ' + err.message));
};

window.openModalObrasSociales = function(id) {
  db.collection('profesionales').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Profesional no encontrado');
    const data = doc.data();
    const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';

    db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
      let osHTML = '';
      snap.forEach(d => {
        const os = d.data();
        const checked = (data.obras_sociales_ids && data.obras_sociales_ids.includes(d.id)) ? 'checked' : '';
        osHTML += `
          <label style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-size:13px;">
            <input type="checkbox" name="os_ids[]" value="${d.id}" ${checked} style="accent-color:var(--primary);">
            ${os.nombre || 'Sin nombre'}
          </label>
        `;
      });

      openModal(`
        <div class="modal-title">🏥 Obras sociales que atiende</div>
        <div style="margin-bottom:16px;">
          <div style="font-weight:600;font-size:15px;">${nombre}</div>
          <div style="font-size:13px;color:var(--text-muted);">Selecciona las obras sociales que atiende este profesional.</div>
        </div>
        <div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg);display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
          ${osHTML || '<p class="text-muted">No hay obras sociales cargadas.</p>'}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
          <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
          <button class="btn btn-primary" onclick="guardarObrasSocialesProfesional('${id}')">Guardar</button>
        </div>
      `);
    });
  }).catch(err => alert('Error: ' + err.message));
};

window.guardarObrasSocialesProfesional = function(id) {
  const checkboxes = document.querySelectorAll('input[name="os_ids[]"]:checked');
  const ids = Array.from(checkboxes).map(cb => cb.value);
  db.collection('profesionales').doc(id).update({ obras_sociales_ids: ids })
    .then(() => {
      closeModal();
      showToast('✅ Obras sociales actualizadas.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};
