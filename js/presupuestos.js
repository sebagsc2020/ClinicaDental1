// ============================================================
// PRESUPUESTOS
// ============================================================
function renderPresupuestos() {
  const el = $('view-presupuestos');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Presupuestos</div><div class="page-subtitle">Listado</div></div>
      <button class="btn btn-primary" onclick="openModalNuevoPresupuesto()">+ Nuevo presupuesto</button>
    </div>
    <div class="card"><div id="presupuestos-list"><p class="text-muted">Cargando...</p></div></div>
  `;
  db.collection('presupuestos').orderBy('fecha','desc').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.paciente||''}</td><td>$${data.total||0}</td><td><span class="badge ${data.estado==='aprobado'?'badge-green':'badge-amber'}">${data.estado||'Pendiente'}</span></td><td>${data.fecha||''}</td></tr>`;
    });
    html += '</tbody></table></div>';
    $('presupuestos-list').innerHTML = html || '<p class="text-muted">Sin presupuestos</p>';
  });
}

window.openModalNuevoPresupuesto = function() {
  openModal(`
    <div class="modal-title">Nuevo presupuesto</div>
    <div class="form-group"><label class="form-label">Paciente</label><input class="form-control" id="f-pres-paciente"></div>
    <div class="form-group"><label class="form-label">Total</label><input class="form-control" id="f-pres-total" type="number" step="0.01"></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarPresupuesto()">Guardar</button></div>
  `);
};

window.guardarPresupuesto = function() {
  const paciente = $('f-pres-paciente').value.trim();
  const total = parseFloat($('f-pres-total').value);
  if (!paciente || isNaN(total)) return alert('Completá todos los campos');
  db.collection('presupuestos').add({ paciente, total, estado:'pendiente', fecha: new Date().toISOString().slice(0,10) })
    .then(() => { closeModal(); showToast('Presupuesto creado'); });
};
