// ============================================================
// CAJA
// ============================================================
function renderCaja() {
  const el = $('view-caja');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Caja</div><div class="page-subtitle">Registros de pago</div></div>
      <button class="btn btn-primary" onclick="openModalNuevoPago()">+ Registrar pago</button>
    </div>
    <div class="card"><div id="pagos-list"><p class="text-muted">Cargando...</p></div></div>
  `;
  db.collection('pagos').orderBy('fecha','desc').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Monto</th><th>Método</th><th>Fecha</th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.paciente||''}</td><td>$${data.monto||0}</td><td>${data.metodo||''}</td><td>${data.fecha||''}</td></tr>`;
    });
    html += '</tbody></table></div>';
    $('pagos-list').innerHTML = html || '<p class="text-muted">Sin pagos</p>';
  });
}

window.openModalNuevoPago = function() {
  openModal(`
    <div class="modal-title">Registrar pago</div>
    <div class="form-group"><label class="form-label">Paciente</label><input class="form-control" id="f-pago-paciente"></div>
    <div class="form-group"><label class="form-label">Monto</label><input class="form-control" id="f-pago-monto" type="number" step="0.01"></div>
    <div class="form-group"><label class="form-label">Método</label><select class="form-control" id="f-pago-metodo"><option>Efectivo</option><option>Tarjeta crédito</option><option>Transferencia</option></select></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarPago()">Guardar</button></div>
  `);
};

window.guardarPago = function() {
  const paciente = $('f-pago-paciente').value.trim();
  const monto = parseFloat($('f-pago-monto').value);
  const metodo = $('f-pago-metodo').value;
  if (!paciente || isNaN(monto)) return alert('Completá todos los campos');
  db.collection('pagos').add({ paciente, monto, metodo, fecha: new Date().toISOString().slice(0,10) })
    .then(() => { closeModal(); showToast('Pago registrado'); });
};