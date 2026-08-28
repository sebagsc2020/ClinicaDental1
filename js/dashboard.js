// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const el = $('view-dashboard');
  el.innerHTML = `
    <div class="page-header"><div><div class="page-title">Dashboard</div><div class="page-subtitle">Resumen de hoy</div></div></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      <div class="card" style="border-left:3px solid var(--primary)"><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Turnos hoy</div><div style="font-size:32px;font-weight:800;color:var(--primary)" id="dash-turnos-hoy">0</div></div>
      <div class="card" style="border-left:3px solid #22c55e"><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Pacientes nuevos (mes)</div><div style="font-size:32px;font-weight:800;color:#22c55e" id="dash-pacientes-nuevos">0</div></div>
      <div class="card" style="border-left:3px solid #8b5cf6"><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Ingresos del mes</div><div style="font-size:24px;font-weight:800;color:#8b5cf6" id="dash-ingresos">$0</div></div>
      <div class="card" style="border-left:3px solid #f59e0b"><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Turnos pendientes</div><div style="font-size:32px;font-weight:800;color:#f59e0b" id="dash-turnos-pendientes">0</div></div>
    </div>
    <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Próximos turnos</div><div id="dash-proximos"></div></div>
  `;
  const hoy = new Date().toISOString().slice(0,10);
  db.collection('turnos').where('fecha','==',hoy).get().then(snap => { $('dash-turnos-hoy').textContent = snap.size; });
  const mesInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  db.collection('pacientes').where('fecha_creacion','>=',mesInicio).get().then(snap => { $('dash-pacientes-nuevos').textContent = snap.size; });
  db.collection('pagos').where('fecha','>=',mesInicio).get().then(snap => {
    let total=0; snap.forEach(d => total+=d.data().monto||0);
    $('dash-ingresos').textContent = '$'+total.toLocaleString();
  });
  db.collection('turnos').where('estado','==','pendiente').get().then(snap => { $('dash-turnos-pendientes').textContent = snap.size; });
  db.collection('turnos').limit(5).get().then(snap => {
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>${data.paciente||'Paciente'}</span><span>${data.fecha} ${data.hora}</span></div>`;
    });
    $('dash-proximos').innerHTML = html || '<div class="text-muted">No hay turnos próximos</div>';
  });
}