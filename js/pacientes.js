// ============================================================
// PACIENTES
// ============================================================
function renderPacientes() {
  const el = $('view-pacientes');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Pacientes</div><div class="page-subtitle">Listado</div></div>
      <button class="btn btn-primary" onclick="openModalNuevoPaciente()">+ Nuevo paciente</button>
    </div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th></th></tr></thead><tbody id="pacientes-list"></tbody></table></div></div>
  `;
  db.collection('pacientes').orderBy('nombre').onSnapshot(snap => {
    const tbody = $('pacientes-list');
    tbody.innerHTML = '';
    snap.forEach(d => {
      const data = d.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${data.nombre||''} ${data.apellido||''}</td><td>${data.telefono||''}</td><td>${data.email||''}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="editarPaciente('${d.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarPaciente('${d.id}')">Eliminar</button></td>`;
      tbody.appendChild(tr);
    });
  });
}

window.openModalNuevoPaciente = function() {
  openModal(`
    <div class="modal-title">Nuevo paciente</div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-pac-nombre"></div>
      <div class="form-group"><label class="form-label">Apellido</label><input class="form-control" id="f-pac-apellido"></div>
      <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="f-pac-telefono"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-pac-email"></div>
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarPaciente()">Guardar</button></div>
  `);
};

window.guardarPaciente = function() {
  const nombre = $('f-pac-nombre').value.trim();
  const apellido = $('f-pac-apellido').value.trim();
  const telefono = $('f-pac-telefono').value.trim();
  const email = $('f-pac-email').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('pacientes').add({ nombre, apellido, telefono, email, fecha_creacion: new Date().toISOString().slice(0,10) })
    .then(() => { closeModal(); showToast('Paciente creado'); });
};

window.eliminarPaciente = function(id) {
  if (!confirm('¿Eliminar este paciente?')) return;
  db.collection('pacientes').doc(id).delete().then(() => showToast('Eliminado'));
};

window.editarPaciente = function(id) {
  db.collection('pacientes').doc(id).get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();
    openModal(`
      <div class="modal-title">Editar paciente</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="f-pac-edit-nombre" value="${data.nombre||''}"></div>
        <div class="form-group"><label class="form-label">Apellido</label><input class="form-control" id="f-pac-edit-apellido" value="${data.apellido||''}"></div>
        <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="f-pac-edit-telefono" value="${data.telefono||''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-pac-edit-email" value="${data.email||''}"></div>
      </div>
      <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="actualizarPaciente('${id}')">Actualizar</button></div>
    `);
  });
};

window.actualizarPaciente = function(id) {
  const nombre = $('f-pac-edit-nombre').value.trim();
  const apellido = $('f-pac-edit-apellido').value.trim();
  const telefono = $('f-pac-edit-telefono').value.trim();
  const email = $('f-pac-edit-email').value.trim();
  if (!nombre) return alert('Nombre requerido');
  db.collection('pacientes').doc(id).update({ nombre, apellido, telefono, email })
    .then(() => { closeModal(); showToast('Actualizado'); });
};