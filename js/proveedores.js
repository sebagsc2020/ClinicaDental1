// ============================================================
// PROVEEDORES
// ============================================================
function renderProveedores() {
  const el = $('view-proveedores');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Proveedores</div></div>
      <button class="btn btn-primary" onclick="openModalNuevoProveedor()">+ Nuevo proveedor</button>
    </div>
    <div class="card"><div id="proveedores-list"><p class="text-muted">Cargando...</p></div></div>
  `;
  db.collection('proveedores').orderBy('nombre').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Contacto</th><th></th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.nombre||''}</td><td>${data.contacto||''}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarProveedor('${d.id}')">Eliminar</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    $('proveedores-list').innerHTML = html || '<p class="text-muted">Sin proveedores</p>';
  });
}

window.openModalNuevoProveedor = function() {
  openModal(`
    <div class="modal-title">Nuevo proveedor</div>
    <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-prov-nombre"></div>
    <div class="form-group"><label class="form-label">Contacto</label><input class="form-control" id="f-prov-contacto"></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarProveedor()">Guardar</button></div>
  `);
};

window.guardarProveedor = function() {
  const nombre = $('f-prov-nombre').value.trim();
  const contacto = $('f-prov-contacto').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('proveedores').add({ nombre, contacto })
    .then(() => { closeModal(); showToast('Guardado'); });
};

window.eliminarProveedor = function(id) {
  if (!confirm('¿Eliminar?')) return;
  db.collection('proveedores').doc(id).delete().then(() => showToast('Eliminado'));
};