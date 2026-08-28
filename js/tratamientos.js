// ============================================================
// TRATAMIENTOS - SPA (Single Page Application)
// ============================================================

let filterCategoria = 'Todos';
let filterEstadoTratamientos = 'Todos';
let filterAgendaVirtual = false;
let allTratamientosData = [];

// ============================================================
// RENDER LISTA DE TRATAMIENTOS
// ============================================================
function renderTratamientos() {
  const el = document.getElementById('view-tratamientos');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Catálogo de tratamientos</div>
        <div class="page-subtitle" id="tratamientos-count">Cargando...</div>
      </div>
      <button class="btn btn-primary" onclick="renderNuevoTratamiento()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo tratamiento
      </button>
    </div>

    <!-- Resumen por categoría (pills) -->
    <div id="categoria-pills" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;"></div>

    <!-- Filtros -->
    <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-primary" data-filter="Todos" onclick="setFilterEstado('Todos')">Todos</button>
      <button class="btn btn-sm btn-secondary" data-filter="Activos" onclick="setFilterEstado('Activos')">Activos</button>
      <button class="btn btn-sm btn-secondary" data-filter="Inactivos" onclick="setFilterEstado('Inactivos')">Inactivos</button>
      <button class="btn btn-sm btn-secondary" data-filter="AgendaVirtual" onclick="toggleAgendaVirtual()" style="border-color:var(--accent-light);">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:3px;"><rect x="3" y="3" width="18" height="14" rx="3"/><path d="M8 21l4-4 4 4"/></svg>
        Agenda virtual
      </button>
    </div>

    <!-- Tabla dentro de un card (mismo estilo que formularios) -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tratamiento</th>
              <th>Especialidad</th>
              <th>Precio base</th>
              <th>Duración</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="tbody-tratamientos">
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Cargar datos desde Firestore
  if (typeof db !== 'undefined') {
    db.collection('tratamientos').onSnapshot(snap => {
      allTratamientosData = [];
      snap.forEach(doc => {
        const data = doc.data();
        allTratamientosData.push({ id: doc.id, ...data });
      });
      actualizarVistaTratamientos();
    }, (error) => {
      console.error('Error en snapshot de tratamientos:', error);
    });
  } else {
    allTratamientosData = [];
    actualizarVistaTratamientos();
  }
}

// ============================================================
// ACTUALIZAR VISTA (filtros y tabla)
// ============================================================
function actualizarVistaTratamientos() {
  const container = document.getElementById('tbody-tratamientos');
  const countEl = document.getElementById('tratamientos-count');
  const pillsContainer = document.getElementById('categoria-pills');

  if (!container) return;

  // Calcular categorías y contadores
  const categoriasSet = new Set();
  allTratamientosData.forEach(item => {
    if (item.categoria) categoriasSet.add(item.categoria);
  });
  const counts = {};
  allTratamientosData.forEach(item => {
    const cat = item.categoria || 'sin-categoria';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const cats = ['Todos', ...Array.from(categoriasSet).sort()];

  // Generar pills de categoría
  let pillsHtml = '';
  cats.forEach(cat => {
    const count = cat === 'Todos' ? allTratamientosData.length : counts[cat] || 0;
    const activa = filterCategoria === cat ? 'activa' : '';
    pillsHtml += `<button class="pill-categoria ${activa}" onclick="setFilterCategoria('${cat}')">${cat === 'Todos' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)} <span class="contador">${count}</span></button>`;
  });
  if (pillsContainer) pillsContainer.innerHTML = pillsHtml;

  // Filtrar datos
  let filtered = allTratamientosData;
  if (filterCategoria !== 'Todos') {
    filtered = filtered.filter(item => item.categoria === filterCategoria);
  }
  if (filterEstadoTratamientos === 'Activos') {
    filtered = filtered.filter(item => item.activo !== false);
  } else if (filterEstadoTratamientos === 'Inactivos') {
    filtered = filtered.filter(item => item.activo === false);
  }
  if (filterAgendaVirtual) {
    filtered = filtered.filter(item => item.agenda_virtual === true);
  }
  filtered.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  // Actualizar contador
  if (countEl) {
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'tratamiento' : 'tratamientos'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">No hay tratamientos que coincidan con los filtros.</td></tr>`;
    return;
  }

  // Colores por categoría
  const coloresCategoria = {
    'cirugia': 'badge-red',
    'consulta': 'badge-teal',
    'diagnostico': 'badge-gray',
    'endodoncia': 'badge-amber',
    'estetica': 'badge-teal',
    'implante': 'badge-gray',
    'limpieza': 'badge-blue',
    'odontopediatria': 'badge-gray',
    'ortodoncia': 'badge-blue',
    'protesis': 'badge-gray',
    'restauracion': 'badge-green'
  };
  const getColorCategoria = (cat) => coloresCategoria[cat] || 'badge-gray';

  // Generar filas
  let htmlFilas = '';
  filtered.forEach((item) => {
    const activo = item.activo !== undefined ? item.activo : true;
    const estadoBadge = activo ? 'badge-green' : 'badge-gray';
    const estadoTexto = activo ? 'Activo' : 'Inactivo';
    const nombreCategoria = (item.categoria || 'sin categoría').charAt(0).toUpperCase() + (item.categoria || '').slice(1);

    // Etiquetas adicionales
    let etiquetas = '';
    if (item.agenda_virtual) {
      etiquetas += `<span class="badge-etiqueta azul"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><rect x="3" y="3" width="18" height="14" rx="3"/><path d="M8 21l4-4 4 4"/></svg> Agenda virtual</span> `;
    }
    if (item.requiere_lab) {
      etiquetas += `<span class="badge-etiqueta ambar">Requiere laboratorio</span> `;
    }

    htmlFilas += `
      <tr>
        <td>
          <div style="font-weight:600">${item.nombre || ''}</div>
          ${item.codigo ? `<div style="font-size:11px;color:var(--text-muted)">Cód. ${item.codigo}</div>` : ''}
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${etiquetas}</div>
        </td>
        <td>
          <button type="button" class="badge ${getColorCategoria(item.categoria)}"
                  style="border:none;cursor:pointer;font-size:11px"
                  title="Click para cambiar la especialidad"
                  onclick="abrirEspecialidadModal('${item.id}', '${(item.nombre || '').replace(/'/g, "\\'")}', '${item.especialidad_id || ''}')">
            ${nombreCategoria}
          </button>
        </td>
        <td style="font-weight:600">$ ${Number(item.precio_base || 0).toLocaleString()}</td>
        <td>${item.duracion || '30 min'}</td>
        <td>
          <form onsubmit="event.preventDefault(); toggleEstado('${item.id}')" style="display:inline">
            <button type="submit" class="badge ${estadoBadge}"
                    style="border:none;cursor:pointer;font-size:11px"
                    title="Click para cambiar estado">
              ${estadoTexto}
            </button>
          </form>
        </td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <a href="#" class="btn btn-secondary btn-sm" onclick="renderEditarTratamiento('${item.id}')">Editar</a>
            <a href="#" class="btn btn-secondary btn-sm" onclick="openModalOS('${item.id}')" title="Configurar cobertura por obra social">🏥 OS</a>
            <form onsubmit="event.preventDefault(); eliminarTratamiento('${item.id}')" style="display:inline">
              <button type="submit" class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca">Eliminar</button>
            </form>
          </div>
        </td>
      </tr>
    `;
  });
  container.innerHTML = htmlFilas;
}

// ============================================================
// FILTROS
// ============================================================
window.setFilterCategoria = function(cat) {
  filterCategoria = cat;
  actualizarVistaTratamientos();
};

window.setFilterEstado = function(estado) {
  filterEstadoTratamientos = estado;
  if (estado !== 'AgendaVirtual') filterAgendaVirtual = false;
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    if (btn.dataset.filter === estado) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    }
  });
  actualizarVistaTratamientos();
};

window.toggleAgendaVirtual = function() {
  filterAgendaVirtual = !filterAgendaVirtual;
  const btn = document.querySelector('[data-filter="AgendaVirtual"]');
  if (btn) {
    btn.classList.toggle('btn-primary', filterAgendaVirtual);
    btn.classList.toggle('btn-secondary', !filterAgendaVirtual);
  }
  actualizarVistaTratamientos();
};

// ============================================================
// RENDER: NUEVO TRATAMIENTO (SPA)
// ============================================================
window.renderNuevoTratamiento = function() {
  const el = document.getElementById('view-tratamientos');
  if (!el) return;

  const categorias = ['cirugia','consulta','diagnostico','endodoncia','estetica','implante','limpieza','odontopediatria','ortodoncia','protesis','restauracion'];
  const opts = categorias.map(c => `<option value="${c}">${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">➕ Nuevo tratamiento</div>
        <div class="page-subtitle">Completa los datos del nuevo tratamiento</div>
      </div>
      <button class="btn btn-secondary" onclick="renderTratamientos()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-nuevo-tratamiento" onsubmit="event.preventDefault(); guardarNuevoTratamiento()">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-trat-nombre" placeholder="Ej: Alargamiento Quirúrgico" required>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Código</label>
            <input class="form-control" id="f-trat-codigo" placeholder="Ej: 1008">
          </div>
          <div class="form-group">
            <label class="form-label">Categoría *</label>
            <select class="form-control" id="f-trat-categoria">${opts}</select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Precio base ($) *</label>
            <input class="form-control" id="f-trat-precio" type="number" step="0.01" placeholder="0" required>
          </div>
          <div class="form-group">
            <label class="form-label">Duración</label>
            <input class="form-control" id="f-trat-duracion" placeholder="Ej: 45 min" value="30 min">
          </div>
        </div>
        <div class="form-group" style="display:flex;gap:20px;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-trat-activo" checked> Activo
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-trat-agenda-virtual"> Agenda virtual
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-trat-requiere-lab"> Requiere laboratorio
          </label>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderTratamientos()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar tratamiento</button>
        </div>
      </form>
    </div>
  `;
};

// ============================================================
// GUARDAR NUEVO TRATAMIENTO
// ============================================================
window.guardarNuevoTratamiento = function() {
  const nombre = document.getElementById('f-trat-nombre').value.trim();
  const codigo = document.getElementById('f-trat-codigo').value.trim();
  const categoria = document.getElementById('f-trat-categoria').value;
  const precio_base = parseFloat(document.getElementById('f-trat-precio').value) || 0;
  const duracion = document.getElementById('f-trat-duracion').value.trim() || '30 min';
  const activo = document.getElementById('f-trat-activo').checked;
  const agendaVirtual = document.getElementById('f-trat-agenda-virtual').checked;
  const requiereLab = document.getElementById('f-trat-requiere-lab').checked;

  if (!nombre) return alert('El nombre es obligatorio.');
  if (!categoria) return alert('Selecciona una categoría.');
  if (precio_base <= 0) return alert('El precio base debe ser mayor que 0.');

  if (typeof db === 'undefined') {
    const newItem = { id: Date.now().toString(), nombre, codigo, categoria, precio_base, duracion, activo, agenda_virtual: agendaVirtual, requiere_lab: requiereLab };
    allTratamientosData.push(newItem);
    if (typeof showToast === 'function') showToast('✅ Tratamiento creado exitosamente.');
    renderTratamientos();
    return;
  }

  db.collection('tratamientos').add({
    nombre,
    codigo: codigo || null,
    categoria,
    precio_base,
    duracion,
    activo,
    agenda_virtual: agendaVirtual,
    requiere_lab: requiereLab,
    precio_os: precio_base,
    creado: new Date().toISOString()
  }).then(() => {
    if (typeof showToast === 'function') showToast('✅ Tratamiento creado exitosamente.');
    renderTratamientos();
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// RENDER: EDITAR TRATAMIENTO (SPA)
// ============================================================
window.renderEditarTratamiento = function(id) {
  const item = allTratamientosData.find(t => t.id === id);
  if (!item) {
    alert('Tratamiento no encontrado');
    return;
  }

  const el = document.getElementById('view-tratamientos');
  if (!el) return;

  const categorias = ['cirugia','consulta','diagnostico','endodoncia','estetica','implante','limpieza','odontopediatria','ortodoncia','protesis','restauracion'];
  const opts = categorias.map(c =>
    `<option value="${c}" ${item.categoria === c ? 'selected' : ''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`
  ).join('');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">✏️ Editar tratamiento</div>
        <div class="page-subtitle">Actualiza los datos del tratamiento</div>
      </div>
      <button class="btn btn-secondary" onclick="renderTratamientos()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-editar-tratamiento" onsubmit="event.preventDefault(); guardarEdicionTratamiento('${id}')">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-trat-edit-nombre" value="${item.nombre || ''}" required>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Código</label>
            <input class="form-control" id="f-trat-edit-codigo" value="${item.codigo || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Categoría *</label>
            <select class="form-control" id="f-trat-edit-categoria">${opts}</select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Precio base ($) *</label>
            <input class="form-control" id="f-trat-edit-precio" type="number" step="0.01" value="${item.precio_base || 0}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Duración</label>
            <input class="form-control" id="f-trat-edit-duracion" value="${item.duracion || '30 min'}">
          </div>
        </div>
        <div class="form-group" style="display:flex;gap:20px;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-trat-edit-activo" ${item.activo !== false ? 'checked' : ''}> Activo
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-trat-edit-agenda-virtual" ${item.agenda_virtual ? 'checked' : ''}> Agenda virtual
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-trat-edit-requiere-lab" ${item.requiere_lab ? 'checked' : ''}> Requiere laboratorio
          </label>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderTratamientos()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Actualizar tratamiento</button>
        </div>
      </form>
    </div>
  `;
};

// ============================================================
// GUARDAR EDICIÓN DE TRATAMIENTO
// ============================================================
window.guardarEdicionTratamiento = function(id) {
  const nombre = document.getElementById('f-trat-edit-nombre').value.trim();
  const codigo = document.getElementById('f-trat-edit-codigo').value.trim();
  const categoria = document.getElementById('f-trat-edit-categoria').value;
  const precio_base = parseFloat(document.getElementById('f-trat-edit-precio').value) || 0;
  const duracion = document.getElementById('f-trat-edit-duracion').value.trim() || '30 min';
  const activo = document.getElementById('f-trat-edit-activo').checked;
  const agendaVirtual = document.getElementById('f-trat-edit-agenda-virtual').checked;
  const requiereLab = document.getElementById('f-trat-edit-requiere-lab').checked;

  if (!nombre) return alert('El nombre es obligatorio.');
  if (!categoria) return alert('Selecciona una categoría.');
  if (precio_base <= 0) return alert('El precio base debe ser mayor que 0.');

  if (typeof db === 'undefined') {
    const index = allTratamientosData.findIndex(t => t.id === id);
    if (index !== -1) {
      allTratamientosData[index] = { ...allTratamientosData[index], nombre, codigo, categoria, precio_base, duracion, activo, agenda_virtual: agendaVirtual, requiere_lab: requiereLab };
    }
    if (typeof showToast === 'function') showToast('✅ Tratamiento actualizado.');
    renderTratamientos();
    return;
  }

  db.collection('tratamientos').doc(id).update({
    nombre,
    codigo: codigo || null,
    categoria,
    precio_base,
    duracion,
    activo,
    agenda_virtual: agendaVirtual,
    requiere_lab: requiereLab
  }).then(() => {
    if (typeof showToast === 'function') showToast('✅ Tratamiento actualizado.');
    renderTratamientos();
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// MODAL: CONFIGURAR PRECIO PARA OBRA SOCIAL (sigue siendo modal)
// ============================================================
window.openModalOS = function(id) {
  const item = allTratamientosData.find(t => t.id === id);
  if (!item) {
    alert('Tratamiento no encontrado');
    return;
  }

  const precioActual = item.precio_os !== undefined ? item.precio_os : item.precio_base;

  if (typeof openModal !== 'function') {
    alert('La función openModal no está disponible.');
    return;
  }

  openModal(`
    <div class="modal-title">🏥 Actualizar precio para Obra Social</div>
    <div style="margin-bottom:16px;">
      <div><strong>${item.nombre || ''}</strong></div>
      <div class="text-muted" style="font-size:13px;">Precio base actual: $${Number(item.precio_base || 0).toLocaleString()}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Nuevo precio OS ($)</label>
      <input class="form-control" id="f-os-precio" type="number" step="0.01" value="${precioActual}" min="0">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarOS('${id}')">Guardar precio OS</button>
    </div>
  `);
};

window.guardarOS = function(id) {
  const nuevoPrecio = parseFloat(document.getElementById('f-os-precio').value);
  if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
    return alert('Ingresa un número válido (mayor o igual a 0)');
  }

  if (typeof db === 'undefined') {
    const index = allTratamientosData.findIndex(t => t.id === id);
    if (index !== -1) {
      allTratamientosData[index].precio_os = nuevoPrecio;
    }
    if (typeof closeModal === 'function') closeModal();
    if (typeof showToast === 'function') showToast('✅ Precio OS actualizado.');
    actualizarVistaTratamientos();
    return;
  }

  db.collection('tratamientos').doc(id).update({
    precio_os: nuevoPrecio
  }).then(() => {
    if (typeof closeModal === 'function') closeModal();
    if (typeof showToast === 'function') showToast('✅ Precio OS actualizado correctamente.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// ELIMINAR TRATAMIENTO
// ============================================================
window.eliminarTratamiento = function(id) {
  const item = allTratamientosData.find(t => t.id === id);
  if (!confirm(`¿Eliminar el tratamiento '${item ? item.nombre : ''}'? Esta acción no se puede deshacer.`)) return;

  if (typeof db === 'undefined') {
    allTratamientosData = allTratamientosData.filter(t => t.id !== id);
    if (typeof showToast === 'function') showToast('🗑 Tratamiento eliminado.');
    actualizarVistaTratamientos();
    return;
  }

  db.collection('tratamientos').doc(id).delete()
    .then(() => {
      if (typeof showToast === 'function') showToast('🗑 Tratamiento eliminado.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// TOGGLE ESTADO (Activo/Inactivo)
// ============================================================
window.toggleEstado = function(id) {
  const item = allTratamientosData.find(t => t.id === id);
  if (!item) return;
  const nuevoEstado = !item.activo;

  if (typeof db === 'undefined') {
    const index = allTratamientosData.findIndex(t => t.id === id);
    if (index !== -1) {
      allTratamientosData[index].activo = nuevoEstado;
    }
    if (typeof showToast === 'function') showToast(`Estado cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}`);
    actualizarVistaTratamientos();
    return;
  }

  db.collection('tratamientos').doc(id).update({ activo: nuevoEstado })
    .then(() => {
      if (typeof showToast === 'function') showToast(`Estado cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}`);
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// MODAL: CAMBIAR ESPECIALIDAD (sigue siendo modal)
// ============================================================
window.abrirEspecialidadModal = function(id, nombre, especialidadId) {
  let especialidadesHTML = '<option value="">Sin especialidad</option>';

  if (typeof db !== 'undefined') {
    db.collection('especialidades').orderBy('nombre').get()
      .then(snap => {
        snap.forEach(doc => {
          const data = doc.data();
          const selected = (especialidadId && especialidadId === doc.id) ? 'selected' : '';
          especialidadesHTML += `<option value="${doc.id}" ${selected}>${data.nombre || 'Sin nombre'}</option>`;
        });
        mostrarModalEspecialidad(id, nombre, especialidadesHTML);
      })
      .catch(() => {
        // Fallback si no hay especialidades en Firestore
        const espEjemplo = ['Implantologia', 'Ortodoncia', 'Perodoncia', 'Endodoncia', 'Odontopediatría'];
        espEjemplo.forEach((e, i) => {
          const val = (i + 1).toString();
          const selected = (especialidadId && especialidadId === val) ? 'selected' : '';
          especialidadesHTML += `<option value="${val}" ${selected}>${e}</option>`;
        });
        mostrarModalEspecialidad(id, nombre, especialidadesHTML);
      });
  } else {
    const espEjemplo = ['Implantologia', 'Ortodoncia', 'Perodoncia', 'Endodoncia', 'Odontopediatría'];
    espEjemplo.forEach((e, i) => {
      const val = (i + 1).toString();
      const selected = (especialidadId && especialidadId === val) ? 'selected' : '';
      especialidadesHTML += `<option value="${val}" ${selected}>${e}</option>`;
    });
    mostrarModalEspecialidad(id, nombre, especialidadesHTML);
  }
};

function mostrarModalEspecialidad(id, nombre, especialidadesHTML) {
  if (typeof openModal !== 'function') {
    alert('La función openModal no está disponible.');
    return;
  }

  openModal(`
    <div class="modal-title">Cambiar especialidad</div>
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Tratamiento: <strong>${nombre}</strong></div>
    <form onsubmit="event.preventDefault(); guardarEspecialidadTratamiento('${id}')">
      <div class="form-group">
        <label class="form-label">Especialidad</label>
        <select name="especialidad_id" id="esp-modal-select" class="form-control">
          ${especialidadesHTML}
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

window.guardarEspecialidadTratamiento = function(id) {
  const especialidadId = document.getElementById('esp-modal-select').value;

  if (typeof db === 'undefined') {
    const index = allTratamientosData.findIndex(t => t.id === id);
    if (index !== -1) {
      allTratamientosData[index].especialidad_id = especialidadId;
    }
    if (typeof closeModal === 'function') closeModal();
    if (typeof showToast === 'function') showToast('✅ Especialidad actualizada.');
    actualizarVistaTratamientos();
    return;
  }

  db.collection('tratamientos').doc(id).update({
    especialidad_id: especialidadId
  }).then(() => {
    if (typeof closeModal === 'function') closeModal();
    if (typeof showToast === 'function') showToast('✅ Especialidad actualizada.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-tratamientos')) {
  renderTratamientos();
}
