// ============================================================
// ESPECIALIDADES
// ============================================================
function renderEspecialidades() {
  const el = $('view-especialidades');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Especialidades</div></div>
      <button class="btn btn-primary" onclick="openModalNuevaEspecialidad()">+ Nueva especialidad</button>
    </div>
    <div class="card"><div id="especialidades-list"><p class="text-muted">Cargando...</p></div></div>
  `;
  db.collection('especialidades').orderBy('nombre').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Nombre</th><th></th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.nombre||''}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarEspecialidad('${d.id}')">Eliminar</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    $('especialidades-list').innerHTML = html || '<p class="text-muted">Sin especialidades</p>';
  });
}

window.openModalNuevaEspecialidad = function() {
  openModal(`
    <div class="modal-title">Nueva especialidad</div>
    <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-esp-nombre"></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarEspecialidad()">Guardar</button></div>
  `);
};

window.guardarEspecialidad = function() {
  const nombre = $('f-esp-nombre').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('especialidades').add({ nombre })
    .then(() => { closeModal(); showToast('Guardado'); });
};

window.eliminarEspecialidad = function(id) {
  if (!confirm('¿Eliminar?')) return;
  db.collection('especialidades').doc(id).delete().then(() => showToast('Eliminado'));
};