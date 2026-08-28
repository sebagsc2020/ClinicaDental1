// ============================================================
// PACIENTES - VISTA EXACTA AL EJEMPLO DE DENTALSOFT
// ============================================================

// Variables de estado para filtros
let filterBusqueda = '';
let filterEstado = '';

// ============================================================
// RENDER PACIENTES PRINCIPAL
// ============================================================
function renderPacientes() {
  const el = $('view-pacientes');

  // Construir el HTML
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Pacientes</div>
        <div class="page-subtitle" id="pacientes-count">Cargando...</div>
      </div>
      <a href="#" class="btn btn-primary" onclick="openModalNuevoPaciente()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo paciente
      </a>
    </div>

    <!-- Búsqueda y filtros -->
    <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
      <form id="pac-filter-form" style="display:flex;gap:10px;flex:1;flex-wrap:wrap;" onsubmit="return false;">
        <div style="position:relative;flex:1;min-width:200px;max-width:400px;">
          <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);opacity:.4" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="pac-search-input" class="form-control" style="padding-left:34px"
                 placeholder="Buscar por nombre, DNI, email o teléfono..." oninput="aplicarFiltrosPacientes()">
        </div>
        <select id="pac-filter-estado" class="form-control" style="width:160px" onchange="aplicarFiltrosPacientes()">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button type="button" class="btn btn-secondary" onclick="aplicarFiltrosPacientes()">Buscar</button>
        <button type="button" class="btn btn-secondary" onclick="limpiarFiltrosPacientes()">Limpiar</button>
      </form>
    </div>

    <!-- Modal confirmar eliminación -->
    <div id="modal-eliminar" style="display:none;position:fixed;inset:0;z-index:9000;align-items:center;justify-content:center;background:rgba(0,0,0,.45)">
      <div class="card" style="width:100%;max-width:420px;margin:0 16px;padding:28px 24px">
        <div style="font-weight:700;font-size:16px;margin-bottom:8px">Eliminar paciente</div>
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:20px">
          ¿Estás seguro de que querés eliminar a <strong id="modal-nombre-paciente"></strong>?
          Esta acción no se puede deshacer y eliminará todos sus datos.
        </p>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-secondary" onclick="cerrarEliminar()">Cancelar</button>
          <button type="button" class="btn" style="background:var(--danger,#e53e3e);color:#fff;border-color:var(--danger,#e53e3e)" onclick="ejecutarEliminar()">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Tabla desktop -->
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
        <tbody id="pacientes-list">
          <!-- Generado por JS -->
        </tbody>
      </table>
    </div>

    <!-- Lista mobile de pacientes -->
    <div class="pac-mob-list" id="pacientes-mobile-list" style="border-radius:10px;border:1px solid var(--border);overflow:hidden;background:#fff;display:none;">
      <!-- Generado por JS -->
    </div>
  `;

  // Agregar estilos para mobile (si no existen)
  if (!document.getElementById('pac-mobile-styles')) {
    const style = document.createElement('style');
    style.id = 'pac-mobile-styles';
    style.textContent = `
      @media (max-width: 768px) {
        #pac-filter-form { flex-wrap: wrap !important; }
        #pac-filter-form > div[style*="max-width:400px"] { flex: 1 1 100% !important; max-width: 100% !important; }
        #pac-filter-form select { flex: 1 1 auto; }
        .table-wrap { display: none !important; }
        .pac-mob-list { display: block !important; }
      }
      /* Desktop: ocultar lista mobile */
      .pac-mob-list { display: none; }
      @media (min-width: 769px) {
        .pac-mob-list { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // Cargar pacientes en tiempo real
  cargarPacientes();
}

// ============================================================
// CARGAR PACIENTES DESDE FIRESTORE
// ============================================================
function cargarPacientes() {
  // Escuchar cambios en tiempo real
  db.collection('pacientes').orderBy('nombre').onSnapshot((snapshot) => {
    const pacientes = [];
    snapshot.forEach(doc => {
      pacientes.push({ id: doc.id, ...doc.data() });
    });
    window._pacientesData = pacientes;
    aplicarFiltrosPacientes();
  }, (error) => {
    console.error('Error cargando pacientes:', error);
    $('pacientes-list').innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">Error al cargar los datos.</td></tr>`;
  });
}

// ============================================================
// APLICAR FILTROS
// ============================================================
window.aplicarFiltrosPacientes = function() {
  const searchInput = $('pac-search-input');
  const estadoSelect = $('pac-filter-estado');

  const busqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const estado = estadoSelect ? estadoSelect.value : '';

  let filtrados = window._pacientesData || [];

  // Filtro por búsqueda
  if (busqueda) {
    filtrados = filtrados.filter(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
      const dni = (p.dni || '').toString();
      const telefono = (p.telefono || '').toString();
      const email = (p.email || '').toLowerCase();
      return nombre.includes(busqueda) || dni.includes(busqueda) || telefono.includes(busqueda) || email.includes(busqueda);
    });
  }

  // Filtro por estado
  if (estado === 'activo') {
    filtrados = filtrados.filter(p => p.estado !== false);
  } else if (estado === 'inactivo') {
    filtrados = filtrados.filter(p => p.estado === false);
  }

  // Actualizar contador
  const countEl = $('pacientes-count');
  if (countEl) {
    countEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'resultado' : 'resultados'}`;
  }

  renderTablaPacientes(filtrados);
  renderMobilePacientes(filtrados);
};

// ============================================================
// RENDER TABLA DESKTOP
// ============================================================
function renderTablaPacientes(pacientes) {
  const tbody = $('pacientes-list');
  if (!tbody) return;

  if (pacientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">No hay pacientes que coincidan con los filtros.</td></tr>`;
    return;
  }

  let html = '';
  pacientes.forEach(p => {
    const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
    const iniciales = nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const estadoActivo = p.estado !== false;
    const estadoBadge = estadoActivo ? 'badge-green' : 'badge-gray';
    const estadoTexto = estadoActivo ? 'Activo' : 'Inactivo';
    const dni = p.dni || '—';
    const telefono = p.telefono || '—';
    const email = p.email || '';
    const obraSocial = p.obra_social || '—';
    const ultimaConsulta = p.ultima_consulta || '—';

    html += `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="background:var(--teal-light);color:var(--teal);font-size:12px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">
              ${iniciales || 'P'}
            </div>
            <div>
              <a href="#" style="font-weight:600;color:var(--text);" onclick="verPaciente('${p.id}')">
                ${nombre}
              </a>
              <div style="font-size:11px;color:var(--text-muted)">${p.codigo || 'PAC-' + String(p.id).padStart(4, '0')}</div>
            </div>
          </div>
        </td>
        <td style="font-size:13px">${dni}</td>
        <td>
          <div style="font-size:13px">${telefono}</div>
          ${email ? `<div style="font-size:11px;color:var(--text-muted)">${email}</div>` : ''}
        </td>
        <td style="font-size:13px">${obraSocial}</td>
        <td style="font-size:12px;color:var(--text-muted)">${ultimaConsulta}</td>
        <td><span class="badge ${estadoBadge}">${estadoTexto}</span></td>
        <td style="white-space:nowrap">
          <button class="btn btn-secondary btn-sm" onclick="verPaciente('${p.id}')">Ver</button>
          <button class="btn btn-secondary btn-sm" onclick="editarPaciente('${p.id}')">Editar</button>
          <button type="button" class="btn btn-sm" style="color:var(--danger,#e53e3e);border-color:var(--danger,#e53e3e);background:transparent;margin-left:4px"
                  onclick="confirmarEliminar('${p.id}', '${nombre.replace(/'/g, "\\'")}')">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================
// RENDER LISTA MOBILE
// ============================================================
function renderMobilePacientes(pacientes) {
  const container = $('pacientes-mobile-list');
  if (!container) return;

  if (pacientes.length === 0) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">No hay pacientes que coincidan con los filtros.</div>`;
    container.style.display = 'block';
    return;
  }

  let html = '';
  pacientes.forEach(p => {
    const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
    const iniciales = nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const estadoActivo = p.estado !== false;
    const estadoBadge = estadoActivo ? 'badge-green' : 'badge-gray';
    const estadoTexto = estadoActivo ? 'Activo' : 'Inactivo';
    const dni = p.dni || '—';
    const telefono = p.telefono || '—';
    const codigo = p.codigo || 'PAC-' + String(p.id).padStart(4, '0');

    html += `
      <a href="#" onclick="verPaciente('${p.id}')"
         style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #f1f5f9;text-decoration:none;color:inherit;">
        <div class="avatar" style="background:var(--teal-light);color:var(--teal);font-size:12px;flex-shrink:0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">
          ${iniciales || 'P'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${nombre}
          </div>
          <div style="font-size:11px;color:var(--text-muted);">
            ${codigo} ${dni !== '—' ? '· DNI ' + dni : ''}
          </div>
          ${telefono !== '—' ? `<div style="font-size:12px;color:var(--text);margin-top:1px;">${telefono}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="badge ${estadoBadge}">${estadoTexto}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
    `;
  });

  container.innerHTML = html;
  container.style.display = 'block';
}

// ============================================================
// LIMPIAR FILTROS
// ============================================================
window.limpiarFiltrosPacientes = function() {
  const searchInput = $('pac-search-input');
  const estadoSelect = $('pac-filter-estado');
  if (searchInput) searchInput.value = '';
  if (estadoSelect) estadoSelect.value = '';
  aplicarFiltrosPacientes();
};

// ============================================================
// FUNCIONES CRUD
// ============================================================

// --- Variable global para eliminar ---
let _eliminarId = null;

// --- Confirmar eliminación ---
window.confirmarEliminar = function(id, nombre) {
  _eliminarId = id;
  document.getElementById('modal-nombre-paciente').textContent = nombre;
  document.getElementById('modal-eliminar').style.display = 'flex';
};

// --- Cerrar modal eliminar ---
window.cerrarEliminar = function() {
  document.getElementById('modal-eliminar').style.display = 'none';
  _eliminarId = null;
};

// --- Ejecutar eliminación ---
window.ejecutarEliminar = function() {
  if (!_eliminarId) return;
  db.collection('pacientes').doc(_eliminarId).delete()
    .then(() => {
      cerrarEliminar();
      showToast('🗑 Paciente eliminado.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// --- Ver paciente ---
window.verPaciente = function(id) {
  alert('Ver detalle del paciente ID: ' + id);
  // Aquí puedes redirigir a una página de detalle o abrir un modal
};

// ============================================================
// MODAL: NUEVO PACIENTE
// ============================================================
window.openModalNuevoPaciente = function() {
  openModal(`
    <div class="modal-title">➕ Nuevo paciente</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="f-pac-nombre" placeholder="Nombre">
      </div>
      <div class="form-group">
        <label class="form-label">Apellido</label>
        <input class="form-control" id="f-pac-apellido" placeholder="Apellido">
      </div>
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input class="form-control" id="f-pac-dni" placeholder="DNI">
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono</label>
        <input class="form-control" id="f-pac-telefono" placeholder="Teléfono">
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label class="form-label">Email</label>
        <input class="form-control" id="f-pac-email" type="email" placeholder="Email">
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label class="form-label">Obra social</label>
        <input class="form-control" id="f-pac-os" placeholder="Obra social">
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input type="checkbox" id="f-pac-activo" checked> Activo
        </label>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarPaciente()">Guardar</button>
    </div>
  `);
};

// ============================================================
// GUARDAR PACIENTE
// ============================================================
window.guardarPaciente = function() {
  const nombre = $('f-pac-nombre').value.trim();
  const apellido = $('f-pac-apellido').value.trim();
  const dni = $('f-pac-dni').value.trim();
  const telefono = $('f-pac-telefono').value.trim();
  const email = $('f-pac-email').value.trim();
  const obra_social = $('f-pac-os').value.trim();
  const activo = $('f-pac-activo').checked;

  if (!nombre) return alert('El nombre es obligatorio.');

  const data = {
    nombre,
    apellido,
    dni,
    telefono,
    email,
    obra_social,
    estado: activo,
    fecha_creacion: new Date().toISOString().slice(0, 10)
  };

  db.collection('pacientes').add(data)
    .then(() => {
      closeModal();
      showToast('✅ Paciente creado exitosamente.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// EDITAR PACIENTE
// ============================================================
window.editarPaciente = function(id) {
  db.collection('pacientes').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Paciente no encontrado');
    const data = doc.data();

    openModal(`
      <div class="modal-title">✏️ Editar paciente</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-pac-edit-nombre" value="${data.nombre || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Apellido</label>
          <input class="form-control" id="f-pac-edit-apellido" value="${data.apellido || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">DNI</label>
          <input class="form-control" id="f-pac-edit-dni" value="${data.dni || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input class="form-control" id="f-pac-edit-telefono" value="${data.telefono || ''}">
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">Email</label>
          <input class="form-control" id="f-pac-edit-email" type="email" value="${data.email || ''}">
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">Obra social</label>
          <input class="form-control" id="f-pac-edit-os" value="${data.obra_social || ''}">
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-pac-edit-activo" ${data.estado !== false ? 'checked' : ''}> Activo
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="actualizarPaciente('${id}')">Actualizar</button>
      </div>
    `);
  });
};

// ============================================================
// ACTUALIZAR PACIENTE
// ============================================================
window.actualizarPaciente = function(id) {
  const nombre = $('f-pac-edit-nombre').value.trim();
  const apellido = $('f-pac-edit-apellido').value.trim();
  const dni = $('f-pac-edit-dni').value.trim();
  const telefono = $('f-pac-edit-telefono').value.trim();
  const email = $('f-pac-edit-email').value.trim();
  const obra_social = $('f-pac-edit-os').value.trim();
  const activo = $('f-pac-edit-activo').checked;

  if (!nombre) return alert('El nombre es obligatorio.');

  db.collection('pacientes').doc(id).update({
    nombre,
    apellido,
    dni,
    telefono,
    email,
    obra_social,
    estado: activo
  }).then(() => {
    closeModal();
    showToast('✅ Paciente actualizado.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// ELIMINAR PACIENTE (desde tabla)
// ============================================================
window.eliminarPaciente = function(id) {
  if (!confirm('¿Eliminar este paciente?')) return;
  db.collection('pacientes').doc(id).delete()
    .then(() => showToast('🗑 Paciente eliminado.'))
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
// Cerrar modal de eliminación al hacer clic fuera
document.addEventListener('click', function(e) {
  const modal = document.getElementById('modal-eliminar');
  if (modal && e.target === modal) {
    cerrarEliminar();
  }
});
