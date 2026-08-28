// ============================================================
// ESPECIALIDADES - SPA (Single Page Application)
// ============================================================

let allEspecialidadesData = [];

// ============================================================
// RENDER LISTA DE ESPECIALIDADES
// ============================================================
function renderEspecialidades() {
  const el = document.getElementById('view-especialidades');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Especialidades</div>
        <div class="page-subtitle" id="especialidades-count">Cargando...</div>
      </div>
      <button class="btn btn-primary" onclick="renderNuevaEspecialidad()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva especialidad
      </button>
    </div>

    <!-- Tabla dentro de un card (mismo estilo que formularios) -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th style="text-align:center;">Orden</th>
              <th style="text-align:center;">Estado</th>
              <th style="text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbody-especialidades">
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Cargar datos desde Firestore
  if (typeof db !== 'undefined') {
    db.collection('especialidades')
      .orderBy('nombre')
      .onSnapshot(snap => {
        allEspecialidadesData = [];
        snap.forEach(doc => {
          const data = doc.data();
          allEspecialidadesData.push({ id: doc.id, ...data });
        });
        actualizarVistaEspecialidades();
      }, (error) => {
        console.error('Error en snapshot de especialidades:', error);
      });
  } else {
    allEspecialidadesData = [];
    actualizarVistaEspecialidades();
  }
}

// ============================================================
// ACTUALIZAR VISTA (tabla y contador)
// ============================================================
function actualizarVistaEspecialidades() {
  const container = document.getElementById('tbody-especialidades');
  const countEl = document.getElementById('especialidades-count');

  if (!container) return;

  // Actualizar contador
  if (countEl) {
    countEl.textContent = `${allEspecialidadesData.length} ${allEspecialidadesData.length === 1 ? 'especialidad' : 'especialidades'}`;
  }

  if (allEspecialidadesData.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;">No hay especialidades registradas.</td></tr>`;
    return;
  }

  // Generar filas
  let htmlFilas = '';
  allEspecialidadesData.forEach((item) => {
    const estado = item.estado || 'activa';
    const estadoLabel = estado === 'activa' ? 'Activa' : 'Inactiva';
    const estadoColor = estado === 'activa' ? '#dcfce7' : '#fef2f2';
    const estadoTextColor = estado === 'activa' ? '#15803d' : '#b91c1c';

    htmlFilas += `
      <tr>
        <td style="font-weight:600;">${escapeHtml(item.nombre || '')}</td>
        <td style="color:var(--text-muted);font-size:13px;">${escapeHtml(item.descripcion || '—')}</td>
        <td style="text-align:center;color:var(--text-muted);font-size:13px;">${item.orden || 0}</td>
        <td style="text-align:center;">
          <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;
                       background:${estadoColor};color:${estadoTextColor};">
            ${estadoLabel}
          </span>
        </td>
        <td style="text-align:right;">
          <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="renderEditarEspecialidad('${item.id}')">Editar</button>
            <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;"
                    onclick="eliminarEspecialidad('${item.id}', '${escapeHtml(item.nombre || '')}')">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  container.innerHTML = htmlFilas;
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
// RENDER: NUEVA ESPECIALIDAD (SPA)
// ============================================================
window.renderNuevaEspecialidad = function() {
  const el = document.getElementById('view-especialidades');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">➕ Nueva especialidad</div>
        <div class="page-subtitle">Completa los datos de la nueva especialidad</div>
      </div>
      <button class="btn btn-secondary" onclick="renderEspecialidades()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-nueva-especialidad" onsubmit="event.preventDefault(); guardarNuevaEspecialidad()">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-esp-nombre" placeholder="Ej: Ortodoncia" required>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <input class="form-control" id="f-esp-descripcion" placeholder="Breve descripción de la especialidad">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Orden</label>
            <input class="form-control" id="f-esp-orden" type="number" min="0" value="0">
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" id="f-esp-estado">
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>
          </div>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderEspecialidades()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar especialidad</button>
        </div>
      </form>
    </div>
  `;
};

// ============================================================
// GUARDAR NUEVA ESPECIALIDAD
// ============================================================
window.guardarNuevaEspecialidad = function() {
  const nombre = document.getElementById('f-esp-nombre').value.trim();
  const descripcion = document.getElementById('f-esp-descripcion').value.trim();
  const orden = parseInt(document.getElementById('f-esp-orden').value) || 0;
  const estado = document.getElementById('f-esp-estado').value;

  if (!nombre) {
    alert('El nombre es requerido.');
    return;
  }

  if (typeof db === 'undefined') {
    const newItem = { id: Date.now().toString(), nombre, descripcion, orden, estado };
    allEspecialidadesData.push(newItem);
    if (typeof showToast === 'function') showToast('✅ Especialidad creada exitosamente.');
    renderEspecialidades();
    return;
  }

  db.collection('especialidades').add({
    nombre,
    descripcion: descripcion || null,
    orden,
    estado,
    created_at: new Date().toISOString()
  })
  .then(() => {
    if (typeof showToast === 'function') showToast('✅ Especialidad creada exitosamente.');
    renderEspecialidades();
  })
  .catch((err) => {
    alert('❌ Error al guardar: ' + err.message);
  });
};

// ============================================================
// RENDER: EDITAR ESPECIALIDAD (SPA)
// ============================================================
window.renderEditarEspecialidad = function(id) {
  const item = allEspecialidadesData.find(e => e.id === id);
  if (!item) {
    alert('Especialidad no encontrada');
    return;
  }

  const el = document.getElementById('view-especialidades');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">✏️ Editar especialidad</div>
        <div class="page-subtitle">Actualiza los datos de la especialidad</div>
      </div>
      <button class="btn btn-secondary" onclick="renderEspecialidades()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-editar-especialidad" onsubmit="event.preventDefault(); guardarEdicionEspecialidad('${id}')">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-esp-edit-nombre" value="${escapeHtml(item.nombre || '')}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <input class="form-control" id="f-esp-edit-descripcion" value="${escapeHtml(item.descripcion || '')}">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Orden</label>
            <input class="form-control" id="f-esp-edit-orden" type="number" min="0" value="${item.orden || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" id="f-esp-edit-estado">
              <option value="activa" ${item.estado === 'activa' ? 'selected' : ''}>Activa</option>
              <option value="inactiva" ${item.estado === 'inactiva' ? 'selected' : ''}>Inactiva</option>
            </select>
          </div>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderEspecialidades()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Actualizar especialidad</button>
        </div>
      </form>
    </div>
  `;
};

// ============================================================
// GUARDAR EDICIÓN DE ESPECIALIDAD
// ============================================================
window.guardarEdicionEspecialidad = function(id) {
  const nombre = document.getElementById('f-esp-edit-nombre').value.trim();
  const descripcion = document.getElementById('f-esp-edit-descripcion').value.trim();
  const orden = parseInt(document.getElementById('f-esp-edit-orden').value) || 0;
  const estado = document.getElementById('f-esp-edit-estado').value;

  if (!nombre) {
    alert('El nombre es requerido.');
    return;
  }

  if (typeof db === 'undefined') {
    const index = allEspecialidadesData.findIndex(e => e.id === id);
    if (index !== -1) {
      allEspecialidadesData[index] = { ...allEspecialidadesData[index], nombre, descripcion, orden, estado };
    }
    if (typeof showToast === 'function') showToast('✅ Especialidad actualizada.');
    renderEspecialidades();
    return;
  }

  db.collection('especialidades').doc(id).update({
    nombre,
    descripcion: descripcion || null,
    orden,
    estado,
    updated_at: new Date().toISOString()
  })
  .then(() => {
    if (typeof showToast === 'function') showToast('✅ Especialidad actualizada.');
    renderEspecialidades();
  })
  .catch((err) => {
    alert('❌ Error al actualizar: ' + err.message);
  });
};

// ============================================================
// ELIMINAR ESPECIALIDAD
// ============================================================
window.eliminarEspecialidad = function(id, nombre) {
  if (!confirm(`¿Eliminar la especialidad «${nombre}»?`)) return;

  if (typeof db === 'undefined') {
    allEspecialidadesData = allEspecialidadesData.filter(e => e.id !== id);
    if (typeof showToast === 'function') showToast('🗑 Especialidad eliminada.');
    actualizarVistaEspecialidades();
    return;
  }

  db.collection('especialidades').doc(id).delete()
    .then(() => {
      if (typeof showToast === 'function') showToast('🗑 Especialidad eliminada.');
    })
    .catch((err) => {
      alert('❌ Error al eliminar: ' + err.message);
    });
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-especialidades')) {
  renderEspecialidades();
}
