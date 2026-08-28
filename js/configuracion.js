// ============================================================
// CONFIGURACIÓN
// ============================================================
function renderConfiguracion() {
  $('view-configuracion').innerHTML = `
    <div class="page-header"><div><div class="page-title">Configuración</div><div class="page-subtitle">Sucursales y horarios</div></div></div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-weight:700">Sucursales</span><button class="btn btn-primary btn-sm" onclick="openModalNuevaSucursal()">+ Agregar</button></div>
      <div id="sucursales-list"><p class="text-muted">Cargando...</p></div>
    </div>
    <div class="card">
      <div class="form-group"><label class="form-label">Zona horaria</label><select class="form-control" id="cfg-timezone"><option value="America/Argentina/Buenos_Aires">UTC-03:00 Buenos Aires</option><option value="UTC">UTC</option></select></div>
      <button class="btn btn-primary" onclick="guardarConfiguracion()">Guardar</button>
    </div>
  `;
  db.collection('sucursales').orderBy('nombre').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Dirección</th><th></th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.nombre||''}</td><td>${data.direccion||''}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarSucursal('${d.id}')">Eliminar</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    $('sucursales-list').innerHTML = html || '<p class="text-muted">Sin sucursales</p>';
  });
  db.collection('configuracion').doc('main').get().then(doc => {
    if (doc.exists) $('cfg-timezone').value = doc.data().timezone||'America/Argentina/Buenos_Aires';
  });
}

window.openModalNuevaSucursal = function() {
  openModal(`
    <div class="modal-title">Nueva sucursal</div>
    <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-suc-nombre"></div>
    <div class="form-group"><label class="form-label">Dirección</label><input class="form-control" id="f-suc-direccion"></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarSucursal()">Guardar</button></div>
  `);
};

window.guardarSucursal = function() {
  const nombre = $('f-suc-nombre').value.trim();
  const direccion = $('f-suc-direccion').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('sucursales').add({ nombre, direccion })
    .then(() => { closeModal(); showToast('Guardado'); });
};

window.eliminarSucursal = function(id) {
  if (!confirm('¿Eliminar sucursal?')) return;
  db.collection('sucursales').doc(id).delete().then(() => showToast('Eliminado'));
};

window.guardarConfiguracion = function() {
  const timezone = $('cfg-timezone').value;
  db.collection('configuracion').doc('main').set({ timezone, updated: new Date().toISOString() })
    .then(() => showToast('Configuración guardada'));
};