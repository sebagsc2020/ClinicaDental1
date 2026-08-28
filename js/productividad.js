// ============================================================
// PRODUCTIVIDAD - SPA (Single Page Application)
// ============================================================
function renderProductividad() {
  const el = document.getElementById('view-productividad');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Productividad</div>
        <div class="page-subtitle" id="prod-periodo">Cargando datos...</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="renderProductividad()">↻ Actualizar</button>
        <select id="prod-filtro-periodo" class="form-control" style="width:150px;font-size:13px;padding:6px 10px;" onchange="cargarDatosProductividad()">
          <option value="hoy">Hoy</option>
          <option value="semana" selected>Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="trimestre">Último trimestre</option>
        </select>
      </div>
    </div>

    <!-- KPIs -->
    <div id="prod-kpi-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;">
      <div class="card" style="border-left:3px solid var(--primary);">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Turnos atendidos</div>
        <div style="font-size:28px;font-weight:800;color:var(--primary);" id="prod-turnos-atendidos">-</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;" id="prod-turnos-atendidos-label">en el período</div>
      </div>
      <div class="card" style="border-left:3px solid #22c55e;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Ingresos totales</div>
        <div style="font-size:28px;font-weight:800;color:#22c55e;" id="prod-ingresos">-</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">en el período</div>
      </div>
      <div class="card" style="border-left:3px solid #dc2626;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Ausencias / Cancelaciones</div>
        <div style="font-size:28px;font-weight:800;color:#dc2626;" id="prod-ausencias">-</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">en el período</div>
      </div>
      <div class="card" style="border-left:3px solid #8b5cf6;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Pacientes nuevos</div>
        <div style="font-size:28px;font-weight:800;color:#8b5cf6;" id="prod-pacientes-nuevos">-</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">en el período</div>
      </div>
    </div>

    <!-- Turnos por día de semana -->
    <div class="card" style="margin-bottom:20px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Turnos por día de semana</div>
      <div style="overflow-x:auto;">
        <table class="table" style="margin:0;">
          <thead>
            <tr>
              <th>Día</th>
              <th style="text-align:center;">Turnos atendidos</th>
              <th style="text-align:center;">Promedio por día</th>
            </tr>
          </thead>
          <tbody id="prod-dia-semana-tbody">
            <tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-muted);">Cargando datos...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rendimiento por profesional -->
    <div class="card" style="margin-bottom:20px;padding:0;overflow:hidden;">
      <div style="padding:14px 20px;border-bottom:1px solid var(--border);">
        <div style="font-size:13px;font-weight:700;">Rendimiento por profesional</div>
      </div>
      <div style="overflow-x:auto;">
        <table class="table" style="margin:0;">
          <thead>
            <tr>
              <th>Profesional</th>
              <th style="text-align:center;">Turnos atendidos</th>
              <th style="text-align:right;">Ingresos generados</th>
              <th style="text-align:right;">Promedio por turno</th>
            </tr>
          </thead>
          <tbody id="prod-profesional-tbody">
            <tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">Cargando datos...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Turnos atendidos — últimos 6 meses -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;">Turnos atendidos — últimos 6 meses</div>
        <div style="font-size:11px;color:var(--text-muted);">Evolución mensual</div>
      </div>
      <div id="prod-turnos-6m" style="display:flex;align-items:flex-end;gap:4px;height:80px;margin-bottom:6px;">
        <div style="text-align:center;width:100%;color:var(--text-muted);font-size:12px;">Cargando datos...</div>
      </div>
      <div id="prod-turnos-6m-etiquetas" style="display:flex;gap:4px;">
        <!-- Etiquetas generadas por JS -->
      </div>
    </div>

    <!-- Ingresos cobrados — últimos 6 meses -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;">Ingresos cobrados — últimos 6 meses</div>
        <div style="font-size:11px;color:var(--text-muted);">Evolución mensual</div>
      </div>
      <div id="prod-ingresos-6m" style="display:flex;align-items:flex-end;gap:4px;height:80px;margin-bottom:6px;">
        <div style="text-align:center;width:100%;color:var(--text-muted);font-size:12px;">Cargando datos...</div>
      </div>
      <div id="prod-ingresos-6m-etiquetas" style="display:flex;gap:4px;">
        <!-- Etiquetas generadas por JS -->
      </div>
    </div>
  `;

  cargarDatosProductividad();
}

// ============================================================
// CARGAR DATOS DE PRODUCTIVIDAD DESDE FIRESTORE
// ============================================================
function cargarDatosProductividad() {
  const periodo = document.getElementById('prod-filtro-periodo')?.value || 'semana';
  const ahora = new Date();
  let fechaInicio;

  switch (periodo) {
    case 'hoy':
      fechaInicio = new Date(ahora);
      fechaInicio.setHours(0, 0, 0, 0);
      document.getElementById('prod-periodo').textContent = 'Hoy · ' + fechaInicio.toLocaleDateString('es-AR');
      break;
    case 'semana':
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(ahora.getDate() - 7);
      document.getElementById('prod-periodo').textContent = 'Últimos 7 días · ' + fechaInicio.toLocaleDateString('es-AR') + ' → ' + ahora.toLocaleDateString('es-AR');
      break;
    case 'mes':
      fechaInicio = new Date(ahora);
      fechaInicio.setMonth(ahora.getMonth() - 1);
      document.getElementById('prod-periodo').textContent = 'Último mes · ' + fechaInicio.toLocaleDateString('es-AR') + ' → ' + ahora.toLocaleDateString('es-AR');
      break;
    case 'trimestre':
      fechaInicio = new Date(ahora);
      fechaInicio.setMonth(ahora.getMonth() - 3);
      document.getElementById('prod-periodo').textContent = 'Último trimestre · ' + fechaInicio.toLocaleDateString('es-AR') + ' → ' + ahora.toLocaleDateString('es-AR');
      break;
    default:
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(ahora.getDate() - 7);
      document.getElementById('prod-periodo').textContent = 'Últimos 7 días';
  }

  if (typeof db === 'undefined') {
    mostrarDatosEjemplo();
    return;
  }

  const fechaInicioStr = fechaInicio.toISOString().slice(0, 10);
  const hoyStr = ahora.toISOString().slice(0, 10);

  // 1. Obtener turnos del período
  db.collection('turnos')
    .where('fecha', '>=', fechaInicioStr)
    .where('fecha', '<=', hoyStr)
    .get()
    .then(snapshot => {
      const turnos = [];
      snapshot.forEach(doc => {
        turnos.push({ id: doc.id, ...doc.data() });
      });
      return turnos;
    })
    .then(turnos => {
      // Calcular KPIs
      let atendidos = 0;
      let ausencias = 0;
      turnos.forEach(t => {
        const estado = t.estado || 'pendiente';
        if (estado === 'finalizado') atendidos++;
        else if (estado === 'ausente' || estado === 'cancelado') ausencias++;
      });
      document.getElementById('prod-turnos-atendidos').textContent = atendidos;
      document.getElementById('prod-ausencias').textContent = ausencias;
      document.getElementById('prod-turnos-atendidos-label').textContent = `en ${periodo}`;

      // Turnos por día de semana (solo finalizados)
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const conteoDias = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
      turnos.forEach(t => {
        if (t.estado === 'finalizado' && t.fecha) {
          const fecha = new Date(t.fecha + 'T00:00:00');
          const dia = fecha.getDay();
          conteoDias[dia] = (conteoDias[dia] || 0) + 1;
        }
      });
      // Calcular promedio (número de días en el período que tuvieron turnos)
      const diasDelPeriodo = Math.ceil((new Date(hoyStr) - new Date(fechaInicioStr)) / (1000*60*60*24)) + 1;
      renderDiaSemana(conteoDias, diasDelPeriodo);

      // Rendimiento por profesional
      return Promise.all([
        Promise.resolve(turnos),
        db.collection('profesionales').get(),
        db.collection('pagos')
          .where('fecha', '>=', fechaInicioStr)
          .where('fecha', '<=', hoyStr)
          .where('estado', '==', 'completado')
          .get()
      ]);
    })
    .then(([turnos, profSnap, pagosSnap]) => {
      // Mapa de profesionales
      const profesionales = {};
      profSnap.forEach(doc => {
        const data = doc.data();
        profesionales[doc.id] = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      });

      // Mapa de pagos por paciente o por turno (asumimos que los pagos tienen paciente_id o turno_id)
      // Simplificamos: los turnos finalizados tienen total_paciente, y los pagos pueden estar asociados.
      // Para este ejemplo, usamos total_paciente de cada turno finalizado como ingreso.
      // Si hay pagos, los sumamos por profesional a través del turno (si tienen odontologo_id).
      const ingresosPorProf = {};
      const turnosPorProf = {};
      turnos.forEach(t => {
        if (t.estado === 'finalizado' && t.odontologo_id) {
          const profId = t.odontologo_id;
          if (!turnosPorProf[profId]) turnosPorProf[profId] = 0;
          turnosPorProf[profId]++;
          const monto = t.total_paciente || 0;
          if (!ingresosPorProf[profId]) ingresosPorProf[profId] = 0;
          ingresosPorProf[profId] += monto;
        }
      });

      // Si tenemos pagos, también podemos sumarlos (pero los pagos no tienen odontologo_id directamente)
      // Para simplificar, usamos solo los totales de turnos.

      renderRendimientoProfesional(turnosPorProf, ingresosPorProf, profesionales);

      // 2. Turnos atendidos últimos 6 meses
      return cargarDatos6Meses();
    })
    .then(([turnos6m, pagos6m]) => {
      renderGrafico6Meses('prod-turnos-6m', 'prod-turnos-6m-etiquetas', turnos6m, 'Turnos');
      renderGrafico6Meses('prod-ingresos-6m', 'prod-ingresos-6m-etiquetas', pagos6m, 'Ingresos');
    })
    .catch(err => {
      console.error('Error cargando datos de productividad:', err);
      mostrarDatosEjemplo();
    });
}

// ============================================================
// RENDER TURNOS POR DÍA DE SEMANA
// ============================================================
function renderDiaSemana(conteoDias, diasDelPeriodo) {
  const tbody = document.getElementById('prod-dia-semana-tbody');
  if (!tbody) return;

  const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  let html = '';
  for (let i = 0; i < 7; i++) {
    const total = conteoDias[i] || 0;
    const promedio = diasDelPeriodo > 0 ? (total / diasDelPeriodo).toFixed(1) : 0;
    html += `
      <tr>
        <td>${nombres[i]}</td>
        <td style="text-align:center;">${total}</td>
        <td style="text-align:center;">${promedio}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

// ============================================================
// RENDER RENDIMIENTO POR PROFESIONAL
// ============================================================
function renderRendimientoProfesional(turnosPorProf, ingresosPorProf, profesionales) {
  const tbody = document.getElementById('prod-profesional-tbody');
  if (!tbody) return;

  const profIds = Object.keys(turnosPorProf);
  if (profIds.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">No hay datos de profesionales en este período.</td></tr>';
    return;
  }

  let html = '';
  profIds.forEach(profId => {
    const nombre = profesionales[profId] || 'Sin nombre';
    const turnos = turnosPorProf[profId] || 0;
    const ingresos = ingresosPorProf[profId] || 0;
    const promedio = turnos > 0 ? ingresos / turnos : 0;
    html += `
      <tr>
        <td><strong>${nombre}</strong></td>
        <td style="text-align:center;">${turnos}</td>
        <td style="text-align:right;">$${Number(ingresos).toLocaleString()}</td>
        <td style="text-align:right;">$${Number(promedio).toLocaleString()}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// ============================================================
// CARGAR DATOS DE ÚLTIMOS 6 MESES (turnos atendidos e ingresos)
// ============================================================
function cargarDatos6Meses() {
  const ahora = new Date();
  const meses = [];
  const promesas = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora);
    d.setMonth(ahora.getMonth() - i);
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    const mesStr = `${anio}-${String(mes).padStart(2,'0')}`;
    meses.push({ mes: mesStr, anio, mesNum: mes });

    // Consultar turnos finalizados de ese mes
    const inicioMes = `${mesStr}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const finMes = `${mesStr}-${String(ultimoDia).padStart(2,'0')}`;

    promesas.push(
      db.collection('turnos')
        .where('fecha', '>=', inicioMes)
        .where('fecha', '<=', finMes)
        .where('estado', '==', 'finalizado')
        .get()
        .then(snap => {
          let total = 0;
          snap.forEach(doc => {
            const t = doc.data();
            total += t.total_paciente || 0;
          });
          return { mes: mesStr, turnos: snap.size, ingresos: total };
        })
    );
  }

  return Promise.all(promesas);
}

// ============================================================
// RENDER GRÁFICO DE BARRAS PARA 6 MESES
// ============================================================
function renderGrafico6Meses(containerId, etiquetasId, datos, label) {
  const container = document.getElementById(containerId);
  const etiquetasContainer = document.getElementById(etiquetasId);
  if (!container || !etiquetasContainer) return;

  if (!datos || datos.length === 0) {
    container.innerHTML = '<div style="text-align:center;width:100%;color:var(--text-muted);font-size:12px;">Sin datos.</div>';
    etiquetasContainer.innerHTML = '';
    return;
  }

  const valores = datos.map(d => d.turnos || d.ingresos || 0);
  const maxValor = Math.max(...valores, 1);

  // Nombres de meses abreviados
  const nombresMeses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  let barrasHTML = '';
  let etiquetasHTML = '';
  datos.forEach((d, i) => {
    const val = d.turnos || d.ingresos || 0;
    const altura = Math.max(4, (val / maxValor) * 74);
    const mesNombre = nombresMeses[d.mesNum - 1] || d.mes;
    barrasHTML += `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
        <div title="${label}: ${val}" style="width:100%;background:var(--primary);opacity:.75;border-radius:3px 3px 0 0;height:${altura}px;min-height:4px;transition:.2s;"></div>
      </div>
    `;
    etiquetasHTML += `<div style="flex:1;text-align:center;font-size:9px;color:var(--text-muted);">${mesNombre}</div>`;
  });

  container.innerHTML = barrasHTML;
  etiquetasContainer.innerHTML = etiquetasHTML;
}

// ============================================================
// DATOS DE EJEMPLO (fallback)
// ============================================================
function mostrarDatosEjemplo() {
  document.getElementById('prod-turnos-atendidos').textContent = '12';
  document.getElementById('prod-ingresos').textContent = '$45.000';
  document.getElementById('prod-ausencias').textContent = '2';
  document.getElementById('prod-pacientes-nuevos').textContent = '21';
  document.getElementById('prod-periodo').textContent = 'Últimos 7 días · Datos de ejemplo';

  // Datos de ejemplo para días de semana
  const conteoDias = {0:1,1:3,2:2,3:4,4:2,5:5,6:0};
  renderDiaSemana(conteoDias, 7);

  // Datos de ejemplo para profesionales
  const turnosProf = {'1':5, '2':3, '3':4};
  const ingresosProf = {'1':15000, '2':8000, '3':22000};
  const profesionales = {'1':'Dr. Pérez', '2':'Dra. Gutierrez', '3':'Dr. Sosa'};
  renderRendimientoProfesional(turnosProf, ingresosProf, profesionales);

  // Datos de ejemplo para 6 meses
  const meses = [
    { mes: '2026-03', mesNum: 3, turnos: 8, ingresos: 12000 },
    { mes: '2026-04', mesNum: 4, turnos: 12, ingresos: 18000 },
    { mes: '2026-05', mesNum: 5, turnos: 7, ingresos: 9000 },
    { mes: '2026-06', mesNum: 6, turnos: 15, ingresos: 25000 },
    { mes: '2026-07', mesNum: 7, turnos: 10, ingresos: 14000 },
    { mes: '2026-08', mesNum: 8, turnos: 18, ingresos: 32000 }
  ];
  renderGrafico6Meses('prod-turnos-6m', 'prod-turnos-6m-etiquetas', meses.map(d => ({turnos: d.turnos, mesNum: d.mesNum})), 'Turnos');
  renderGrafico6Meses('prod-ingresos-6m', 'prod-ingresos-6m-etiquetas', meses.map(d => ({ingresos: d.ingresos, mesNum: d.mesNum})), 'Ingresos');
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-productividad')) {
  renderProductividad();
}
