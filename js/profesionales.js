// ============================================================
// PROFESIONALES
// ============================================================
function renderProfesionales() {
  const el = $('view-profesionales');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Profesionales</div><div class="page-subtitle">Listado</div></div>
      <button class="btn btn-primary" onclick="openModalNuevoProfesional()">+ Nuevo profesional</button>
    </div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Especialidad</th><th>Email</th><th></th></tr></thead><tbody id="profesionales-list"></tbody></table></div></div>
  `;
  db.collection('profesionales').orderBy('nombre').onSnapshot(snap => {
    const tbody = $('profesionales-list');
    tbody.innerHTML = '';
    snap.forEach(d => {
      const data = d.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${data.nombre||''} ${data.apellido||''}</td><td>${data.especialidad||''}</td><td>${data.email||''}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="editarProfesional('${d.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarProfesional('${d.id}')">Eliminar</button></td>`;
      tbody.appendChild(tr);
    });
  });
}

window.openModalNuevoProfesional = function() {
  openModal(`
    <div class="modal-title">Nuevo profesional</div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-prof-nombre"></div>
      <div class="form-group"><label class="form-label">Apellido</label><input class="form-control" id="f-prof-apellido"></div>
      <div class="form-group"><label class="form-label">Especialidad</label><input class="form-control" id="f-prof-especialidad"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-prof-email"></div>
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarProfesional()">Guardar</button></div>
  `);
};

window.guardarProfesional = function() {
  const nombre = $('f-prof-nombre').value.trim();
  const apellido = $('f-prof-apellido').value.trim();
  const especialidad = $('f-prof-especialidad').value.trim();
  const email = $('f-prof-email').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('profesionales').add({ nombre, apellido, especialidad, email })
    .then(() => { closeModal(); showToast('Profesional creado'); });
};

window.eliminarProfesional = function(id) {
  if (!confirm('¿Eliminar?')) return;
  db.collection('profesionales').doc(id).delete().then(() => showToast('Eliminado'));
};

window.editarProfesional = function(id) {
  db.collection('profesionales').doc(id).get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();
    openModal(`
      <div class="modal-title">Editar profesional</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-prof-edit-nombre" value="${data.nombre||''}"></div>
        <div class="form-group"><label class="form-label">Apellido</label><input class="form-control" id="f-prof-edit-apellido" value="${data.apellido||''}"></div>
        <div class="form-group"><label class="form-label">Especialidad</label><input class="form-control" id="f-prof-edit-especialidad" value="${data.especialidad||''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-prof-edit-email" value="${data.email||''}"></div>
      </div>
      <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="actualizarProfesional('${id}')">Actualizar</button></div>
    `);
  });
};

window.actualizarProfesional = function(id) {
  const nombre = $('f-prof-edit-nombre').value.trim();
  const apellido = $('f-prof-edit-apellido').value.trim();
  const especialidad = $('f-prof-edit-especialidad').value.trim();
  const email = $('f-prof-edit-email').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('profesionales').doc(id).update({ nombre, apellido, especialidad, email })
    .then(() => { closeModal(); showToast('Actualizado'); });
};