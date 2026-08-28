// ============================================================
// AUTOMATIZACIONES
// ============================================================
function renderAutomatizaciones() {
  const el = $('view-automatizaciones');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Automatizaciones</div><div class="page-subtitle">Recordatorios y mensajes automáticos</div></div></div>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="card" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--primary)">5</div><div class="text-muted">Activas</div></div>
        <div class="card" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#f59e0b">44</div><div class="text-muted">Errores</div></div>
        <div class="card" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#10b981">71</div><div class="text-muted">Enviados este mes</div></div>
      </div>
      <div id="auto-list"><p class="text-muted">Cargando...</p></div>
    </div>
  `;
  db.collection('automatizaciones').onSnapshot(snap => {
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <span><strong>${data.nombre||'Sin nombre'}</strong> <span class="badge ${data.activa?'badge-green':'badge-gray'}">${data.activa?'Activa':'Inactiva'}</span></span>
        <span>${data.canales||'WhatsApp, Email'}</span>
      </div>`;
    });
    $('auto-list').innerHTML = html || '<p class="text-muted">No hay automatizaciones</p>';
  });
}