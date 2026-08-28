// ============================================================
// TRATAMIENTOS
// ============================================================
let filterCategoria = 'Todos';
let filterEstadoTratamientos = 'Todos'; // ← Renombrada para evitar conflicto
let filterAgendaVirtual = false;
let allTratamientosData = [];

function renderTratamientos() {
  const el = $('view-tratamientos');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Catálogo de tratamientos</div>
        <div class="page-subtitle" id="tratamientos-count">Cargando...</div>
      </div>
      <button class="btn btn-primary" onclick="openModalNuevoTratamiento()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo tratamiento
      </button>
    </div>

    <div id="categoria-pills" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;"></div>

    <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-primary" data-filter="Todos" onclick="setFilterEstado('Todos')">Todos</button>
      <button class="btn btn-sm btn-secondary" data-filter="Activos" onclick="setFilterEstado('Activos')">Activos</button>
      <button class="btn btn-sm btn-secondary" data-filter="Inactivos" onclick="setFilterEstado('Inactivos')">Inactivos</button>
      <button class="btn btn-sm btn-secondary" data-filter="AgendaVirtual" onclick="toggleAgendaVirtual()" style="border-color:var(--accent-light);">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:3px;"><rect x="3" y="3" width="18" height="14" rx="3"/><path d="M8 21l4-4 4 4"/></svg>
        Agenda virtual
      </button>
    </div>

    <div class="table-wrap" id="tabla-tratamientos">
      <table>
        <thead>
          <tr>
            <th>Tratamiento</th>
            <th>Categoría</th>
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
  `;

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
}

function actualizarVistaTratamientos() {
  const container = $('tbody-tratamientos');
  const countEl = $('tratamientos-count');
  const pillsContainer = $('categoria-pills');

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
  let pillsHtml = '';
  cats.forEach(cat => {
    const count = cat === 'Todos' ? allTratamientosData.length : counts[cat] || 0;
    const activa = filterCategoria === cat ? 'activa' : '';
    pillsHtml += `<button class="pill-categoria ${activa}" onclick="setFilterCategoria('${cat}')">${cat === 'Todos' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)} <span class="contador">${count}</span></button>`;
  });
  pillsContainer.innerHTML = pillsHtml;

  let filtered = allTratamientosData;
  if (filterCategoria !== 'Todos') {
    filtered = filtered.filter(item => item.categoria === filterCategoria);
  }
  // ⬇️ USO DE LA VARIABLE RENOMBRADA ⬇️
  if (filterEstadoTratamientos === 'Activos') {
    filtered = filtered.filter(item => item.activo !== false);
  } else if (filterEstadoTratamientos === 'Inactivos') {
    filtered = filtered.filter(item => item.activo === false);
  }
  if (filterAgendaVirtual) {
    filtered = filtered.filter(item => item.agenda_virtual === true);
  }
  filtered.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  if (countEl) {
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'tratamiento' : 'tratamientos'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">No hay tratamientos que coincidan con los filtros.</td></tr>`;
    return;
  }

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

  let htmlFilas = '';
  filtered.forEach((item) => {
    const activo = item.activo !== undefined ? item.activo : true;
    const estadoBadge = activo ? 'badge-estado-activo' : 'badge-estado-inactivo';
    const estadoTexto  = activo ? 'Activo' : 'Inactivo';
    const nombreCategoria = (item.categoria || 'sin categoría').charAt(0).toUpperCase() + (item.categoria || '').slice(1);

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
          <div style="font-size:11px;color:#64748b;">Cód. ${item.codigo || '—'}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${etiquetas}</div>
        </td>
        <td><span class="badge ${getColorCategoria(item.categoria)}">${nombreCategoria}</span></td>
        <td style="font-weight:600">$ ${Number(item.precio_base || 0).toLocaleString()}</td>
        <td style="font-size:13px;color:#64748b;">${item.duracion || '30 min'}</td>
        <td>
          <button class="badge ${estadoBadge}" style="border:none;cursor:pointer;font-size:11px;" onclick="toggleEstado('${item.id}')">
            ${estadoTexto}
          </button>
        </td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="openModalEditarTratamiento('${item.id}')">Editar</button>
            <button class="btn btn-secondary btn-sm" onclick="openModalOS('${item.id}')" title="Configurar cobertura por obra social">🏥 OS</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarTratamiento('${item.id}')">🗑</button>
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
  filterEstadoTratamientos = estado; // ⬅️ Asignación corregida
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
// CRUD TRATAMIENTOS
// ============================================================
window.openModalNuevoTratamiento = function() {
  const categorias = ['cirugia','consulta','diagnostico','endodoncia','estetica','implante','limpieza','odontopediatria','ortodoncia','protesis','restauracion'];
  const opts = categorias.map(c => `<option value="${c}">${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('');

  openModal(`
    <div class="modal-title">➕ Nuevo tratamiento</div>
    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input class="form-control" id="f-trat-nombre" placeholder="Ej: Alargamiento Quirúrgico">
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
        <input class="form-control" id="f-trat-precio" type="number" step="0.01" placeholder="0">
      </div>
      <div class="form-group">
        <label class="form-label">Duración</label>
        <input class="form-control" id="f-trat-duracion" placeholder="Ej: 45 min">
      </div>
    </div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
        <input type="checkbox" id="f-trat-activo" checked> Activo
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarTratamiento()">Guardar</button>
    </div>
  `);
};

window.guardarTratamiento = function() {
  const nombre = $('f-trat-nombre').value.trim();
  const codigo = $('f-trat-codigo').value.trim();
  const categoria = $('f-trat-categoria').value;
  const precio_base = parseFloat($('f-trat-precio').value) || 0;
  const duracion = $('f-trat-duracion').value.trim() || '30 min';
  const activo = $('f-trat-activo').checked;

  if (!nombre) return alert('El nombre es obligatorio.');
  if (!categoria) return alert('Selecciona una categoría.');

  db.collection('tratamientos').add({
    nombre, codigo, categoria, precio_base, duracion, activo,
    precio_os: precio_base,
    creado: new Date().toISOString()
  }).then(() => {
    closeModal();
    showToast('✅ Tratamiento creado exitosamente.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.openModalEditarTratamiento = function(id) {
  db.collection('tratamientos').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Tratamiento no encontrado');
    const data = doc.data();
    const categorias = ['cirugia','consulta','diagnostico','endodoncia','estetica','implante','limpieza','odontopediatria','ortodoncia','protesis','restauracion'];
    const opts = categorias.map(c =>
      `<option value="${c}" ${data.categoria === c ? 'selected' : ''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`
    ).join('');

    openModal(`
      <div class="modal-title">✏️ Editar tratamiento</div>
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="f-trat-edit-nombre" value="${data.nombre || ''}">
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Código</label>
          <input class="form-control" id="f-trat-edit-codigo" value="${data.codigo || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <select class="form-control" id="f-trat-edit-categoria">${opts}</select>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Precio base ($) *</label>
          <input class="form-control" id="f-trat-edit-precio" type="number" step="0.01" value="${data.precio_base || 0}">
        </div>
        <div class="form-group">
          <label class="form-label">Duración</label>
          <input class="form-control" id="f-trat-edit-duracion" value="${data.duracion || '30 min'}">
        </div>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input type="checkbox" id="f-trat-edit-activo" ${data.activo !== false ? 'checked' : ''}> Activo
        </label>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarEdicionTratamiento('${id}')">Actualizar</button>
      </div>
    `);
  });
};

window.guardarEdicionTratamiento = function(id) {
  const nombre = $('f-trat-edit-nombre').value.trim();
  const codigo = $('f-trat-edit-codigo').value.trim();
  const categoria = $('f-trat-edit-categoria').value;
  const precio_base = parseFloat($('f-trat-edit-precio').value) || 0;
  const duracion = $('f-trat-edit-duracion').value.trim() || '30 min';
  const activo = $('f-trat-edit-activo').checked;

  if (!nombre) return alert('El nombre es obligatorio.');
  if (!categoria) return alert('Selecciona una categoría.');

  db.collection('tratamientos').doc(id).update({
    nombre, codigo, categoria, precio_base, duracion, activo
  }).then(() => {
    closeModal();
    showToast('✅ Tratamiento actualizado.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.openModalOS = function(id) {
  db.collection('tratamientos').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Tratamiento no encontrado');
    const data = doc.data();
    const precioActual = data.precio_os !== undefined ? data.precio_os : data.precio_base;

    openModal(`
      <div class="modal-title">🏥 Actualizar precio para Obra Social</div>
      <div style="margin-bottom:16px;">
        <div><strong>${data.nombre || ''}</strong></div>
        <div class="text-muted" style="font-size:13px;">Precio base actual: $${Number(data.precio_base || 0).toLocaleString()}</div>
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
  });
};

window.guardarOS = function(id) {
  const nuevoPrecio = parseFloat($('f-os-precio').value);
  if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
    return alert('Ingresa un número válido (mayor o igual a 0)');
  }
  db.collection('tratamientos').doc(id).update({
    precio_os: nuevoPrecio
  }).then(() => {
    closeModal();
    showToast('✅ Precio OS actualizado correctamente.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.eliminarTratamiento = function(id) {
  if (!confirm('¿Eliminar este tratamiento de forma permanente?')) return;
  db.collection('tratamientos').doc(id).delete()
    .then(() => showToast('🗑 Tratamiento eliminado.'))
    .catch(err => alert('❌ Error: ' + err.message));
};

window.toggleEstado = function(id) {
  const trat = allTratamientosData.find(t => t.id === id);
  if (!trat) return;
  const nuevoEstado = !trat.activo;
  db.collection('tratamientos').doc(id).update({ activo: nuevoEstado })
    .then(() => showToast(`Estado cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}`))
    .catch(err => alert('❌ Error: ' + err.message));
};
