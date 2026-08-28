// ============================================================
// INVENTARIO - SPA (Insumos y Productos)
// ============================================================

// ============================================================
// RENDER INVENTARIO (función principal con parámetro tipo)
// ============================================================
function renderInventario(tipo) {
  // tipo: 'insumos' o 'productos'
  const el = document.getElementById('view-' + tipo);
  if (!el) return;

  const titulo = tipo === 'insumos' ? 'Insumos' : 'Productos';
  const subtitulo = tipo === 'insumos' 
    ? 'Materiales e insumos utilizados en la clínica' 
    : 'Productos comercializados o utilizados en la clínica';

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">${titulo}</div>
        <div class="page-subtitle">${subtitulo}</div>
      </div>
      <button class="btn btn-primary" onclick="openModalNuevoInventario('${tipo}')">
        + Nuevo ${tipo === 'insumos' ? 'insumo' : 'producto'}
      </button>
    </div>

    <!-- Buscador -->
    <div class="card" style="margin-bottom:12px;padding:12px 16px;">
      <div style="display:flex;gap:8px;align-items:center;">
        <div style="position:relative;flex:1;max-width:420px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"
               style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="inventario-search-${tipo}" value=""
                 placeholder="Buscar por nombre o código…"
                 class="form-control" style="padding-left:32px"
                 oninput="aplicarFiltroInventario('${tipo}')">
        </div>
        <button type="button" class="btn btn-secondary" onclick="aplicarFiltroInventario('${tipo}')">Buscar</button>
        <button type="button" class="btn btn-secondary" onclick="limpiarFiltroInventario('${tipo}')">Limpiar</button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div id="inventario-list-${tipo}">
        <div style="text-align:center;padding:30px;color:var(--text-muted);">Cargando ${tipo}...</div>
      </div>
    </div>
  `;

  // Cargar los datos
  cargarInventario(tipo);
}

// ============================================================
// CARGAR INVENTARIO DESDE FIRESTORE
// ============================================================
let _inventarioData = { insumos: [], productos: [] };

function cargarInventario(tipo) {
  // Escuchar cambios en la colección 'inventario' y filtrar por tipo
  db.collection('inventario')
    .where('tipo', '==', tipo === 'insumos' ? 'insumo' : 'producto')
    .orderBy('nombre')
    .onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      _inventarioData[tipo] = items;
      renderTablaInventario(tipo, items);
    }, (error) => {
      console.error('Error cargando inventario:', error);
      const container = document.getElementById('inventario-list-' + tipo);
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
// RENDER TABLA DE INVENTARIO
// ============================================================
function renderTablaInventario(tipo, items) {
  const container = document.getElementById('inventario-list-' + tipo);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;">
        No hay ${tipo === 'insumos' ? 'insumos' : 'productos'} registrados.
      </div>
    `;
    return;
  }

  let html = `
    <table class="table" style="margin:0;">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th style="text-align:center;">Stock</th>
          <th style="text-align:right;">Precio</th>
          <th style="text-align:center;">Estado</th>
          <th style="text-align:right;">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach(item => {
    const codigo = item.codigo || '—';
    const nombre = item.nombre || '';
    const descripcion = item.descripcion || '—';
    const stock = item.stock || 0;
    const precio = item.precio || 0;
    const estado = item.estado || 'activo';
    const estadoLabel = estado === 'activo' ? 'Activo' : 'Inactivo';
    const estadoColor = estado === 'activo' ? '#dcfce7' : '#fef2f2';
    const estadoTextColor = estado === 'activo' ? '#15803d' : '#b91c1c';

    html += `
      <tr>
        <td style="font-weight:600;font-size:12px;">${escapeHtml(codigo)}</td>
        <td style="font-weight:500;">${escapeHtml(nombre)}</td>
        <td style="color:var(--text-muted);font-size:13px;">${escapeHtml(descripcion)}</td>
        <td style="text-align:center;font-weight:600;">${stock}</td>
        <td style="text-align:right;font-weight:600;">$${Number(precio).toLocaleString()}</td>
        <td style="text-align:center;">
          <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;
                       background:${estadoColor};color:${estadoTextColor};">
            ${estadoLabel}
          </span>
        </td>
        <td style="text-align:right;">
          <button class="btn btn-sm btn-secondary" onclick="openModalEditarInventario('${item.id}', '${tipo}')">Editar</button>
          <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;"
                  onclick="eliminarInventario('${item.id}', '${escapeHtml(nombre)}')">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
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
// FILTROS (búsqueda en cliente)
// ============================================================
window.aplicarFiltroInventario = function(tipo) {
  const searchInput = document.getElementById('inventario-search-' + tipo);
  if (!searchInput) return;
  const q = searchInput.value.toLowerCase().trim();
  const items = _inventarioData[tipo] || [];
  if (!q) {
    renderTablaInventario(tipo, items);
    return;
  }
  const filtrados = items.filter(item => {
    const nombre = (item.nombre || '').toLowerCase();
    const codigo = (item.codigo || '').toLowerCase();
    return nombre.includes(q) || codigo.includes(q);
  });
  renderTablaInventario(tipo, filtrados);
};

window.limpiarFiltroInventario = function(tipo) {
  const searchInput = document.getElementById('inventario-search-' + tipo);
  if (searchInput) searchInput.value = '';
  aplicarFiltroInventario(tipo);
};

// ============================================================
// FUNCIONES RENDER (llamadas desde el menú)
// ============================================================
function renderInsumos() {
  mostrarVista('insumos');
  setActiveMenuItem('Insumos');
  renderInventario('insumos');
}

function renderProductos() {
  mostrarVista('productos');
  setActiveMenuItem('Productos');
  renderInventario('productos');
}

// ============================================================
// MODAL: NUEVO INVENTARIO
// ============================================================
window.openModalNuevoInventario = function(tipo) {
  const esInsumo = tipo === 'insumos';
  const label = esInsumo ? 'insumo' : 'producto';

  openModal(`
    <div class="modal-title">➕ Nuevo ${label}</div>
    <form id="form-nuevo-inventario" onsubmit="event.preventDefault(); guardarNuevoInventario('${tipo}')">
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Código</label>
          <input class="form-control" id="f-inv-codigo" placeholder="Ej: INS-001">
        </div>
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-inv-nombre" placeholder="Nombre del ${label}" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <input class="form-control" id="f-inv-descripcion" placeholder="Descripción breve">
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Stock</label>
          <input class="form-control" id="f-inv-stock" type="number" min="0" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">Precio</label>
          <input class="form-control" id="f-inv-precio" type="number" step="0.01" min="0" value="0">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-control" id="f-inv-estado">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
};

// ============================================================
// GUARDAR NUEVO INVENTARIO
// ============================================================
window.guardarNuevoInventario = function(tipo) {
  const esInsumo = tipo === 'insumos';
  const tipoValor = esInsumo ? 'insumo' : 'producto';

  const codigo = document.getElementById('f-inv-codigo').value.trim();
  const nombre = document.getElementById('f-inv-nombre').value.trim();
  const descripcion = document.getElementById('f-inv-descripcion').value.trim();
  const stock = parseInt(document.getElementById('f-inv-stock').value) || 0;
  const precio = parseFloat(document.getElementById('f-inv-precio').value) || 0;
  const estado = document.getElementById('f-inv-estado').value;

  if (!nombre) {
    alert('El nombre es requerido.');
    return;
  }

  db.collection('inventario').add({
    tipo: tipoValor,
    codigo: codigo || null,
    nombre: nombre,
    descripcion: descripcion || null,
    stock: stock,
    precio: precio,
    estado: estado,
    created_at: new Date().toISOString()
  })
  .then(() => {
    closeModal();
    showToast('✅ ' + (esInsumo ? 'Insumo' : 'Producto') + ' creado exitosamente.');
  })
  .catch((err) => {
    alert('❌ Error al guardar: ' + err.message);
  });
};

// ============================================================
// MODAL: EDITAR INVENTARIO
// ============================================================
window.openModalEditarInventario = function(id, tipo) {
  openModal(`
    <div class="modal-title">✏️ Editar ${tipo === 'insumos' ? 'insumo' : 'producto'}</div>
    <div style="text-align:center;padding:20px;color:var(--text-muted);">Cargando datos...</div>
  `);

  db.collection('inventario').doc(id).get()
    .then((doc) => {
      if (!doc.exists) {
        closeModal();
        alert('Elemento no encontrado.');
        return;
      }
      const data = doc.data();
      const codigo = data.codigo || '';
      const nombre = data.nombre || '';
      const descripcion = data.descripcion || '';
      const stock = data.stock || 0;
      const precio = data.precio || 0;
      const estado = data.estado || 'activo';

      closeModal();
      openModal(`
        <div class="modal-title">✏️ Editar ${tipo === 'insumos' ? 'insumo' : 'producto'}</div>
        <form id="form-editar-inventario" onsubmit="event.preventDefault(); guardarEdicionInventario('${id}', '${tipo}')">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Código</label>
              <input class="form-control" id="f-inv-edit-codigo" value="${escapeHtml(codigo)}">
            </div>
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input class="form-control" id="f-inv-edit-nombre" value="${escapeHtml(nombre)}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input class="form-control" id="f-inv-edit-descripcion" value="${escapeHtml(descripcion)}">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Stock</label>
              <input class="form-control" id="f-inv-edit-stock" type="number" min="0" value="${stock}">
            </div>
            <div class="form-group">
              <label class="form-label">Precio</label>
              <input class="form-control" id="f-inv-edit-precio" type="number" step="0.01" min="0" value="${precio}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" id="f-inv-edit-estado">
              <option value="activo" ${estado === 'activo' ? 'selected' : ''}>Activo</option>
              <option value="inactivo" ${estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
            </select>
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
// GUARDAR EDICIÓN DE INVENTARIO
// ============================================================
window.guardarEdicionInventario = function(id, tipo) {
  const esInsumo = tipo === 'insumos';

  const codigo = document.getElementById('f-inv-edit-codigo').value.trim();
  const nombre = document.getElementById('f-inv-edit-nombre').value.trim();
  const descripcion = document.getElementById('f-inv-edit-descripcion').value.trim();
  const stock = parseInt(document.getElementById('f-inv-edit-stock').value) || 0;
  const precio = parseFloat(document.getElementById('f-inv-edit-precio').value) || 0;
  const estado = document.getElementById('f-inv-edit-estado').value;

  if (!nombre) {
    alert('El nombre es requerido.');
    return;
  }

  db.collection('inventario').doc(id).update({
    codigo: codigo || null,
    nombre: nombre,
    descripcion: descripcion || null,
    stock: stock,
    precio: precio,
    estado: estado,
    updated_at: new Date().toISOString()
  })
  .then(() => {
    closeModal();
    showToast('✅ ' + (esInsumo ? 'Insumo' : 'Producto') + ' actualizado.');
  })
  .catch((err) => {
    alert('❌ Error al actualizar: ' + err.message);
  });
};

// ============================================================
// ELIMINAR INVENTARIO
// ============================================================
window.eliminarInventario = function(id, nombre) {
  if (!confirm(`¿Eliminar "${nombre}"?`)) return;

  db.collection('inventario').doc(id).delete()
    .then(() => {
      showToast('🗑 Elemento eliminado.');
    })
    .catch((err) => {
      alert('❌ Error al eliminar: ' + err.message);
    });
};

// ============================================================
// NOTA: Las funciones mostrarVista, setActiveMenuItem, openModal,
// closeModal, showToast, db deben estar definidas globalmente.
// ============================================================
