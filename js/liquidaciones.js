// ============================================================
// LIQUIDACIONES (Profesionales)
// ============================================================
function renderLiquidaciones() {
  const el = $('view-liquidaciones');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Liquidaciones</div><div class="page-subtitle">Historial</div></div>
      <button class="btn btn-primary" onclick="openModalNuevaLiquidacion()">+ Nueva liquidación</button>
    </div>
    <div class="card"><div id="liquidaciones-list"><p class="text-muted">Cargando...</p></div></div>
  `;
  db.collection('liquidaciones').orderBy('fecha','desc').onSnapshot(snap => {
    let html = '<div class="table-wrap"><table><thead><tr><th>Profesional</th><th>Período</th><th>Total</th><th>Fecha</th></tr></thead><tbody>';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr><td>${data.profesional||''}</td><td>${data.periodo||''}</td><td>$${data.total||0}</td><td>${data.fecha||''}</td></tr>`;
    });
    html += '</tbody></table></div>';
    $('liquidaciones-list').innerHTML = html || '<p class="text-muted">Sin liquidaciones</p>';
  });
}

window.openModalNuevaLiquidacion = function() {
  openModal(`
    <div class="modal-title">Nueva liquidación</div>
    <div class="form-group"><label class="form-label">Profesional</label><input class="form-control" id="f-liq-prof" placeholder="Nombre"></div>
    <div class="form-group"><label class="form-label">Período</label><input class="form-control" id="f-liq-periodo" placeholder="Ej: Agosto 2026"></div>
    <div class="form-group"><label class="form-label">Total</label><input class="form-control" id="f-liq-total" type="number" step="0.01"></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="guardarLiquidacion()">Guardar</button></div>
  `);
};

window.guardarLiquidacion = function() {
  const profesional = $('f-liq-prof').value.trim();
  const periodo = $('f-liq-periodo').value.trim();
  const total = parseFloat($('f-liq-total').value);
  if (!profesional || !periodo || isNaN(total)) return alert('Completá todos los campos');
  db.collection('liquidaciones').add({ profesional, periodo, total, fecha: new Date().toISOString().slice(0,10) })
    .then(() => { closeModal(); showToast('Liquidación guardada'); });
};