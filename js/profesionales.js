// ============================================================
// PROFESIONALES - VISTA EXACTA AL EJEMPLO DE DENTALSOFT
// ============================================================

// ============================================================
// RENDER PROFESIONALES PRINCIPAL
// ============================================================
function renderProfesionales() {
  const el = $('view-profesionales');

  // Construir el HTML
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

      <!-- Lista mobile de profesionales (oculta en desktop) -->
      <div class="prof-mob-list" id="profesionales-mobile-list" style="display:none;border-top:1px solid var(--border);">
        <!-- Generado por JS -->
      </div>
    </div>
  `;

  // Agregar estilos para mobile (si no existen)
  if (!document.getElementById('prof-mobile-styles')) {
    const style = document.createElement('style');
    style.id = 'prof-mobile-styles';
    style.textContent = `
      @media (max-width: 768px) {
        .prof-table-wrap { display: none !important; }
        .prof-mob-list { display: block !important; }
        .card form > div { min-width: 0; }
      }
      /* Desktop: ocultar lista mobile */
      .prof-mob-list { display: none; }
      @media (min-width: 769px) {
        .prof-mob-list { display: none !important; }
      }
      /* Estilos para avatar */
      .avatar-prof {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 13px;
        flex-shrink: 0;
        background: var(--primary, #355063);
        color: #fff;
        overflow: hidden;
      }
      .avatar-prof img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;
    document.head.appendChild(style);
  }

  // Cargar profesionales en tiempo real
  cargarProfesionales();
}

// ============================================================
// CARGAR PROFESIONALES DESDE FIRESTORE
// ============================================================
function cargarProfesionales() {
  // Escuchar cambios en tiempo real
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

  // Filtro por búsqueda
  if (busqueda) {
    filtrados = filtrados.filter(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
      const email = (p.email || '').toLowerCase();
      return nombre.includes(busqueda) || email.includes(busqueda);
    });
  }

  // Filtro por rol
  if (rol) {
    filtrados = filtrados.filter(p => p.rol === rol);
  }

  // Filtro por estado
  if (estado === 'activo') {
    filtrados = filtrados.filter(p => p.estado !== false);
  } else if (estado === 'inactivo') {
    filtrados = filtrados.filter(p => p.estado === false);
  }

  // Actualizar contador
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

  // Mapeo de roles a badges
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

    // Determinar si mostrar "Desactivar" o "Activar"
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
            <a href="#" class="btn btn-secondary btn-sm" onclick="configurarHorarios('${p.id}')" title="Configurar horarios">🕐 Horarios</a>
            <a href="#" class="btn btn-secondary btn-sm" onclick="configurarObrasSociales('${p.id}')" title="Obras sociales que atiende">🏥 Obras</a>
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
// FUNCIONES CRUD
// ============================================================

// --- Variable global para eliminar ---
let _eliminarProfId = null;

// --- Confirmar eliminación ---
window.confirmarEliminarProf = function(id, nombre) {
  _eliminarProfId = id;
  document.getElementById('modal-nombre-prof').textContent = nombre;
  document.getElementById('modal-eliminar-prof').style.display = 'flex';
};

// --- Cerrar modal eliminar ---
window.cerrarEliminarProf = function() {
  document.getElementById('modal-eliminar-prof').style.display = 'none';
  _eliminarProfId = null;
};

// --- Ejecutar eliminación ---
window.ejecutarEliminarProf = function() {
  if (!_eliminarProfId) return;
  db.collection('profesionales').doc(_eliminarProfId).delete()
    .then(() => {
      cerrarEliminarProf();
      showToast('🗑 Profesional eliminado.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// --- Toggle estado (Activar/Desactivar) ---
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

// --- Configurar horarios (placeholder) ---
window.configurarHorarios = function(id) {
  alert('Configurar horarios para profesional ID: ' + id);
  // Aquí puedes redirigir a una página de configuración o abrir un modal
};

// --- Configurar obras sociales (placeholder) ---
window.configurarObrasSociales = function(id) {
  alert('Configurar obras sociales para profesional ID: ' + id);
  // Aquí puedes redirigir a una página de configuración o abrir un modal
};

// ============================================================
// MODAL: NUEVO PROFESIONAL
// ============================================================
window.openModalNuevoProfesional = function() {
  openModal(`
    <div class="modal-title">➕ Nuevo profesional</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="f-prof-nombre" placeholder="Nombre">
      </div>
      <div class="form-group">
        <label class="form-label">Apellido</label>
        <input class="form-control" id="f-prof-apellido" placeholder="Apellido">
      </div>
      <div class="form-group">
        <label class="form-label">Cédula</label>
        <input class="form-control" id="f-prof-cedula" placeholder="Cédula profesional">
      </div>
      <div class="form-group">
        <label class="form-label">Rol</label>
        <select class="form-control" id="f-prof-rol">
          <option value="odontologo">Odontólogo</option>
          <option value="admin">Administrador</option>
          <option value="secretaria">Secretaria/o</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Especialidad</label>
        <input class="form-control" id="f-prof-especialidad" placeholder="Ej: Ortodoncia">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-control" id="f-prof-email" type="email" placeholder="Email">
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono</label>
        <input class="form-control" id="f-prof-telefono" placeholder="Teléfono">
      </div>
      <div class="form-group">
        <label class="form-label">Color de agenda</label>
        <input class="form-control" id="f-prof-color" type="color" value="#355063">
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input type="checkbox" id="f-prof-activo" checked> Activo
        </label>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarProfesional()">Guardar</button>
    </div>
  `);
};

// ============================================================
// GUARDAR PROFESIONAL
// ============================================================
window.guardarProfesional = function() {
  const nombre = $('f-prof-nombre').value.trim();
  const apellido = $('f-prof-apellido').value.trim();
  const cedula = $('f-prof-cedula').value.trim();
  const rol = $('f-prof-rol').value;
  const especialidad = $('f-prof-especialidad').value.trim();
  const email = $('f-prof-email').value.trim();
  const telefono = $('f-prof-telefono').value.trim();
  const color_agenda = $('f-prof-color').value;
  const activo = $('f-prof-activo').checked;

  if (!nombre) return alert('El nombre es obligatorio.');

  const data = {
    nombre,
    apellido,
    cedula,
    rol,
    especialidad,
    email,
    telefono,
    color_agenda: color_agenda || '#355063',
    estado: activo,
    fecha_creacion: new Date().toISOString().slice(0, 10)
  };

  db.collection('profesionales').add(data)
    .then(() => {
      closeModal();
      showToast('✅ Profesional creado exitosamente.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// EDITAR PROFESIONAL
// ============================================================
window.editarProfesional = function(id) {
  db.collection('profesionales').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Profesional no encontrado');
    const data = doc.data();

    openModal(`
      <div class="modal-title">✏️ Editar profesional</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-prof-edit-nombre" value="${data.nombre || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Apellido</label>
          <input class="form-control" id="f-prof-edit-apellido" value="${data.apellido || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Cédula</label>
          <input class="form-control" id="f-prof-edit-cedula" value="${data.cedula || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Rol</label>
          <select class="form-control" id="f-prof-edit-rol">
            <option value="odontologo" ${data.rol === 'odontologo' ? 'selected' : ''}>Odontólogo</option>
            <option value="admin" ${data.rol === 'admin' ? 'selected' : ''}>Administrador</option>
            <option value="secretaria" ${data.rol === 'secretaria' ? 'selected' : ''}>Secretaria/o</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Especialidad</label>
          <input class="form-control" id="f-prof-edit-especialidad" value="${data.especialidad || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" id="f-prof-edit-email" type="email" value="${data.email || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input class="form-control" id="f-prof-edit-telefono" value="${data.telefono || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Color de agenda</label>
          <input class="form-control" id="f-prof-edit-color" type="color" value="${data.color_agenda || '#355063'}">
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-prof-edit-activo" ${data.estado !== false ? 'checked' : ''}> Activo
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="actualizarProfesional('${id}')">Actualizar</button>
      </div>
    `);
  });
};

// ============================================================
// ACTUALIZAR PROFESIONAL
// ============================================================
window.actualizarProfesional = function(id) {
  const nombre = $('f-prof-edit-nombre').value.trim();
  const apellido = $('f-prof-edit-apellido').value.trim();
  const cedula = $('f-prof-edit-cedula').value.trim();
  const rol = $('f-prof-edit-rol').value;
  const especialidad = $('f-prof-edit-especialidad').value.trim();
  const email = $('f-prof-edit-email').value.trim();
  const telefono = $('f-prof-edit-telefono').value.trim();
  const color_agenda = $('f-prof-edit-color').value;
  const activo = $('f-prof-edit-activo').checked;

  if (!nombre) return alert('El nombre es obligatorio.');

  db.collection('profesionales').doc(id).update({
    nombre,
    apellido,
    cedula,
    rol,
    especialidad,
    email,
    telefono,
    color_agenda: color_agenda || '#355063',
    estado: activo
  }).then(() => {
    closeModal();
    showToast('✅ Profesional actualizado.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// ELIMINAR PROFESIONAL (desde tabla)
// ============================================================
window.eliminarProfesional = function(id) {
  if (!confirm('¿Eliminar este profesional?')) return;
  db.collection('profesionales').doc(id).delete()
    .then(() => showToast('🗑 Profesional eliminado.'))
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
// Cerrar modal de eliminación al hacer clic fuera
document.addEventListener('click', function(e) {
  const modal = document.getElementById('modal-eliminar-prof');
  if (modal && e.target === modal) {
    cerrarEliminarProf();
  }
});
