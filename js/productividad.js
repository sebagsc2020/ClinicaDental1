// ============================================================
// PRODUCTIVIDAD
// ============================================================
function renderProductividad() {
  $('view-productividad').innerHTML = `
    <div class="page-header"><div><div class="page-title">Productividad</div><div class="page-subtitle">Rendimiento clínico</div></div></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px">
      <div class="card"><div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase">Turnos atendidos</div><div style="font-size:28px;font-weight:800">12</div></div>
      <div class="card"><div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase">Ingresos</div><div style="font-size:28px;font-weight:800">$45.000</div></div>
      <div class="card"><div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase">Ausentes</div><div style="font-size:28px;font-weight:800">2</div></div>
      <div class="card"><div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase">Pacientes nuevos</div><div style="font-size:28px;font-weight:800">21</div></div>
    </div>
    <div class="card"><div class="text-muted">Gráficos y detalles adicionales</div></div>
  `;
}