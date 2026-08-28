// ============================================================
// INVENTARIO
// ============================================================
function renderInventario() {
  const el = $('view-inventario');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Inventario</div><div class="page-subtitle">Insumos</div></div>
      <button class="btn btn-primary" onclick="openModalNuevoProducto()">+ Nuevo producto</button>
    </div>
    <div class="card"><div id="inventario-list"><p class="text-muted">Cargando...</p></div></div>
  `;
  db.collection('inventario').orderBy('nombre').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Stock</th><th>Precio</th><th></th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.nombre||''}</td><td>${data.stock||0}</td><td>$${data.precio||0}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarProducto('${d.id}')">Eliminar</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    $('inventario-list').innerHTML = html || '<p class="text-muted">Sin productos</p>';
  });
}

window.openModalNuevoProducto = function() {
  openModal(`
    <div class="modal-title">Nuevo producto</div>
    <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-inv-nombre"></div>
    <div class="form-group"><label class="form-label">Stock</label><input class="form-control" id="f-inv-stock" type="number"></div>
    <div class="form-group"><label class="form-label">Precio</label><input class="form-control" id="f-inv-precio" type="number" step="0.01"></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarProducto()">Guardar</button></div>
  `);
};

window.guardarProducto = function() {
  const nombre = $('f-inv-nombre').value.trim();
  const stock = parseInt($('f-inv-stock').value)||0;
  const precio = parseFloat($('f-inv-precio').value)||0;
  if (!nombre) return alert('Nombre requerido');
  db.collection('inventario').add({ nombre, stock, precio })
    .then(() => { closeModal(); showToast('Producto guardado'); });
};

window.eliminarProducto = function(id) {
  if (!confirm('¿Eliminar?')) return;
  db.collection('inventario').doc(id).delete().then(() => showToast('Eliminado'));
};