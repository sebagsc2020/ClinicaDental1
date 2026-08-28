// ============================================================
// ESPECIALIDADES - SPA (Single Page Application)
// ============================================================

// ============================================================
// RENDER ESPECIALIDADES PRINCIPAL
// ============================================================
function renderEspecialidades() {
  const el = $('view-especialidades');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Especialidades</div>
        <div class="page-subtitle">Especialidades que ofrecen los profesionales de la clínica</div>
      </div>
      <button class="btn btn-primary" onclick="openModalNuevaEspecialidad()">+ Nueva especialidad</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden;">
      <div id="especialidades-list">
        <div style="text-align:center;padding:30px;color:var(--text-muted);">Cargando especialidades...</div>
      </div>
    </div>
  `;

  cargarEspecialidades();
}

// ============================================================
// CARGAR ESPECIALIDADES DESDE FIRESTORE
// ============================================================
function cargarEspecialidades() {
  db.collection('especialidades')
    .orderBy('nombre')
    .onSnapshot((snapshot) => {
      const container = document.getElementById('especialidades-list');
      if (!container) return;

      if (snapshot.empty) {
        container.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;">
            No hay especialidades registradas.
          </div>
        `;
        return;
      }

      let html = `
        <table class="table" style="margin:0;">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th style="text-align:center;">Orden</th>
              <th style="text-align:center;">Estado</th>
              <th style="text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const nombre = data.nombre || '';
        const descripcion = data.descripcion || '—';
        const orden = data.orden || 0;
        const estado = data.estado || 'activa';
        const estadoLabel = estado === 'activa' ? 'Activa' : 'Inactiva';
        const estadoColor = estado === 'activa' ? '#dcfce7' : '#fef2f2';
        const estadoTextColor = estado === 'activa' ? '#15803d' : '#b91c1c';

        html += `
          <tr>
            <td style="font-weight:600;">${escapeHtml(nombre)}</td>
            <td style="color:var(--text-muted);font-size:13px;">${escapeHtml(descripcion)}</td>
            <td style="text-align:center;color:var(--text-muted);font-size:13px;">${orden}</td>
            <td style="text-align:center;">
              <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;
                           background:${estadoColor};color:${estadoTextColor};">
                ${estadoLabel}
              </span>
            </td>
            <td style="text-align:right;">
              <button class="btn btn-sm btn-secondary" onclick="openModalEditarEspecialidad('${id}')">Editar</button>
              <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;"
                      onclick="eliminarEspecialidad('${id}', '${escapeHtml(nombre)}')">
                Eliminar
              </button>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;

    }, (error) => {
      console.error('Error cargando especialidades:', error);
      const container = document.getElementById('especialidades-list');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:30px;color:#dc2626;">
            Error al cargar los datos: ${error.message}
          </div>
        `;
      }
    });
}

// ============================================================
// ESCAPAR HTML PARA EVITAR INYECCIONES
// ============================================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// MODAL: NUEVA ESPECIALIDAD
// ============================================================
window.openModalNuevaEspecialidad = function() {
  openModal(`
    <div class="modal-title">➕ Nueva especialidad</div>
    <form id="form-nueva-especialidad" onsubmit="event.preventDefault(); guardarNuevaEspecialidad()">
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="f-esp-nombre" placeholder="Ej: Ortodoncia" required>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <input class="form-control" id="f-esp-descripcion" placeholder="Breve descripción de la especialidad">
      </div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;">
        <div class="form-group">
          <label class="form-label">Orden</label>
          <input class="form-control" id="f-esp-orden" type="number" min="0" value="0" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-control" id="f-esp-estado">
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
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

  db.collection('especialidades').add({
    nombre: nombre,
    descripcion: descripcion,
    orden: orden,
    estado: estado,
    created_at: new Date().toISOString()
  })
  .then(() => {
    closeModal();
    showToast('✅ Especialidad creada exitosamente.');
  })
  .catch((err) => {
    alert('❌ Error al guardar: ' + err.message);
  });
};

// ============================================================
// MODAL: EDITAR ESPECIALIDAD (CORREGIDO)
// ============================================================
window.openModalEditarEspecialidad = function(id) {
  // 1. Mostrar modal de carga
  openModal(`
    <div class="modal-title">✏️ Editar especialidad</div>
    <div style="text-align:center;padding:20px;color:var(--text-muted);">
      <div style="font-size:14px;">Cargando datos...</div>
    </div>
  `);

  // 2. Obtener datos de Firestore
  db.collection('especialidades').doc(id).get()
    .then((doc) => {
      if (!doc.exists) {
        closeModal();
        alert('Especialidad no encontrada.');
        return;
      }

      const data = doc.data();
      const nombre = data.nombre || '';
      const descripcion = data.descripcion || '';
      const orden = data.orden || 0;
      const estado = data.estado || 'activa';

      // 3. Cerrar el modal de carga y abrir el formulario de edición
      closeModal();
      
      // Abrir nuevo modal con el formulario
      openModal(`
        <div class="modal-title">✏️ Editar especialidad</div>
        <form id="form-editar-especialidad" onsubmit="event.preventDefault(); guardarEdicionEspecialidad('${id}')">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input class="form-control" id="f-esp-edit-nombre" value="${escapeHtml(nombre)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input class="form-control" id="f-esp-edit-descripcion" value="${escapeHtml(descripcion)}">
          </div>
          <div class="form-grid" style="grid-template-columns:1fr 1fr;">
            <div class="form-group">
              <label class="form-label">Orden</label>
              <input class="form-control" id="f-esp-edit-orden" type="number" min="0" value="${orden}">
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-control" id="f-esp-edit-estado">
                <option value="activa" ${estado === 'activa' ? 'selected' : ''}>Activa</option>
                <option value="inactiva" ${estado === 'inactiva' ? 'selected' : ''}>Inactiva</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Actualizar</button>
          </div>
        </form>
      `);
    })
    .catch((err) => {
      closeModal();
      alert('❌ Error al cargar: ' + err.message);
    });
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

  db.collection('especialidades').doc(id).update({
    nombre: nombre,
    descripcion: descripcion,
    orden: orden,
    estado: estado,
    updated_at: new Date().toISOString()
  })
  .then(() => {
    closeModal();
    showToast('✅ Especialidad actualizada.');
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

  db.collection('especialidades').doc(id).delete()
    .then(() => {
      showToast('🗑 Especialidad eliminada.');
    })
    .catch((err) => {
      alert('❌ Error al eliminar: ' + err.message);
    });
};

// ============================================================
// NOTA: Las funciones showToast, $, db, openModal, closeModal
// deben estar definidas globalmente.
// ============================================================
