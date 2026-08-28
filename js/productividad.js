// ============================================================
// PRODUCTIVIDAD - SPA (Single Page Application)
// ============================================================

// ============================================================
// RENDER PRODUCTIVIDAD (Dashboard)
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
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">en el período</div>
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

    <!-- Gráfico de productividad por día -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;">Turnos por día</div>
        <div style="font-size:11px;color:var(--text-muted);" id="prod-grafico-subtitulo">Últimos 7 días</div>
      </div>
      <div id="prod-grafico-barras" style="display:flex;align-items:flex-end;gap:4px;height:80px;margin-bottom:6px;">
        <div style="text-align:center;width:100%;color:var(--text-muted);font-size:12px;">Cargando datos...</div>
      </div>
      <div id="prod-grafico-etiquetas" style="display:flex;gap:4px;">
        <!-- Etiquetas generadas por JS -->
      </div>
    </div>

    <!-- Últimos turnos atendidos -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
        <div style="font-size:13px;font-weight:700;">Últimos turnos atendidos</div>
        <span style="font-size:11px;color:var(--text-muted);" id="prod-ultimos-count">0 registros</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="table" style="margin:0;">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th style="text-align:right;">Monto</th>
            </tr>
          </thead>
          <tbody id="prod-ultimos-tbody">
            <tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">Cargando turnos...</td></tr>
          </tbody>
        </table>
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

  // 1. Turnos atendidos y ausencias
  db.collection('turnos')
    .where('fecha', '>=', fechaInicioStr)
    .where('fecha', '<=', hoyStr)
    .get()
    .then(snapshot => {
      let atendidos = 0;
      let ausencias = 0;
      let turnosPorDia = {};
      const turnosLista = [];

      snapshot.forEach(doc => {
        const t = doc.data();
        const estado = t.estado || 'pendiente';
        const fecha = t.fecha;

        if (estado === 'finalizado') {
          atendidos++;
          turnosLista.push({ id: doc.id, ...t });
        } else if (estado === 'ausente' || estado === 'cancelado') {
          ausencias++;
        }

        // Para el gráfico, contamos los finalizados por día
        if (estado === 'finalizado' && fecha) {
          if (!turnosPorDia[fecha]) turnosPorDia[fecha] = 0;
          turnosPorDia[fecha]++;
        }
      });

      // Ordenar turnos por fecha descendente y limitar a 10
      turnosLista.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
      const ultimos = turnosLista.slice(-10).reverse();

      // Actualizar KPIs
      document.getElementById('prod-turnos-atendidos').textContent = atendidos;
      document.getElementById('prod-ausencias').textContent = ausencias;

      // Graficar turnos por día
      renderGraficoProductividad(turnosPorDia, fechaInicio, ahora);

      // Renderizar tabla de últimos turnos
      renderUltimosTurnos(ultimos);

      // Actualizar contador
      document.getElementById('prod-ultimos-count').textContent = `${ultimos.length} registros`;

      // 2. Ingresos (desde pagos)
      return db.collection('pagos')
        .where('fecha', '>=', fechaInicioStr)
        .where('fecha', '<=', hoyStr)
        .where('estado', '==', 'completado')
        .get();
    })
    .then(snapshot => {
      let totalIngresos = 0;
      if (snapshot) {
        snapshot.forEach(doc => {
          const p = doc.data();
          const monto = p.monto || 0;
          totalIngresos += monto;
        });
      }
      document.getElementById('prod-ingresos').textContent = '$' + Number(totalIngresos).toLocaleString();

      // 3. Pacientes nuevos
      return db.collection('pacientes')
        .where('created_at', '>=', fechaInicio.toISOString())
        .get();
    })
    .then(snapshot => {
      if (snapshot) {
        document.getElementById('prod-pacientes-nuevos').textContent = snapshot.size;
      }
    })
    .catch(err => {
      console.error('Error cargando datos de productividad:', err);
      mostrarDatosEjemplo();
    });
}

// ============================================================
// RENDER GRÁFICO DE BARRAS
// ============================================================
function renderGraficoProductividad(turnosPorDia, fechaInicio, fechaFin) {
  const container = document.getElementById('prod-grafico-barras');
  const etiquetasContainer = document.getElementById('prod-grafico-etiquetas');
  const subtitulo = document.getElementById('prod-grafico-subtitulo');

  if (!container) return;

  // Generar lista de días entre fechaInicio y fechaFin (inclusive)
  const dias = [];
  const current = new Date(fechaInicio);
  while (current <= fechaFin) {
    const fechaStr = current.toISOString().slice(0, 10);
    dias.push(fechaStr);
    current.setDate(current.getDate() + 1);
  }

  const valores = dias.map(d => turnosPorDia[d] || 0);
  const maxValor = Math.max(...valores, 1);

  // Si hay más de 10 días, agrupar por semana o mostrar solo últimos 10
  const diasMostrar = dias.length > 10 ? dias.slice(-10) : dias;
  const valoresMostrar = dias.length > 10 ? valores.slice(-10) : valores;

  // Actualizar subtítulo
  if (diasMostrar.length > 1) {
    subtitulo.textContent = `${diasMostrar[0]} → ${diasMostrar[diasMostrar.length-1]}`;
  } else {
    subtitulo.textContent = diasMostrar[0] || '';
  }

  // Generar barras
  let barrasHTML = '';
  let etiquetasHTML = '';

  valoresMostrar.forEach((val, i) => {
    const altura = Math.max(4, (val / maxValor) * 74);
    const diaNum = new Date(diasMostrar[i] + 'T00:00:00').getDate();
    const esHoy = diasMostrar[i] === new Date().toISOString().slice(0, 10);
    barrasHTML += `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
        <div title="${val} turno(s)" style="width:100%;background:${esHoy ? 'var(--primary)' : 'var(--border)'};border-radius:3px 3px 0 0;height:${altura}px;min-height:4px;transition:.2s;"></div>
      </div>
    `;
    etiquetasHTML += `
      <div style="flex:1;text-align:center;font-size:9px;color:var(--text-muted);${esHoy ? 'font-weight:700;color:var(--primary);' : ''}">${diaNum}</div>
    `;
  });

  if (valoresMostrar.length === 0) {
    container.innerHTML = '<div style="text-align:center;width:100%;color:var(--text-muted);font-size:12px;">Sin datos en este período.</div>';
    etiquetasContainer.innerHTML = '';
  } else {
    container.innerHTML = barrasHTML;
    etiquetasContainer.innerHTML = etiquetasHTML;
  }
}

// ============================================================
// RENDER ÚLTIMOS TURNOS
// ============================================================
function renderUltimosTurnos(turnos) {
  const tbody = document.getElementById('prod-ultimos-tbody');
  if (!tbody) return;

  if (turnos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">No hay turnos atendidos en este período.</td></tr>';
    return;
  }

  const estadoBadges = {
    'finalizado': 'badge-green',
    'pendiente': 'badge-amber',
    'confirmado': 'badge-blue',
    'en_recepcion': 'badge-teal',
    'en_atencion': 'badge-gray',
    'cancelado': 'badge-red',
    'ausente': 'badge-red'
  };
  const estadoTextos = {
    'finalizado': 'Finalizado',
    'pendiente': 'Pendiente',
    'confirmado': 'Confirmado',
    'en_recepcion': 'En recepción',
    'en_atencion': 'En atención',
    'cancelado': 'Cancelado',
    'ausente': 'Ausente'
  };

  let html = '';
  turnos.slice(0, 15).forEach(t => {
    const fecha = t.fecha || '—';
    const paciente = t.paciente || '—';
    const profesional = t.odontologo || '—';
    const estado = t.estado || 'pendiente';
    const badge = estadoBadges[estado] || 'badge-gray';
    const texto = estadoTextos[estado] || estado;
    const monto = t.total_paciente || 0;

    html += `
      <tr>
        <td style="font-size:12px;white-space:nowrap;">${fecha}</td>
        <td>${paciente}</td>
        <td style="font-size:12px;color:var(--text-muted);">${profesional}</td>
        <td><span class="badge ${badge}">${texto}</span></td>
        <td style="text-align:right;font-weight:600;">$${Number(monto).toLocaleString()}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================
// DATOS DE EJEMPLO (fallback cuando Firestore no está disponible)
// ============================================================
function mostrarDatosEjemplo() {
  document.getElementById('prod-turnos-atendidos').textContent = '12';
  document.getElementById('prod-ingresos').textContent = '$45.000';
  document.getElementById('prod-ausencias').textContent = '2';
  document.getElementById('prod-pacientes-nuevos').textContent = '21';

  // Datos de ejemplo para el gráfico
  const hoy = new Date();
  const turnosEjemplo = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const fechaStr = d.toISOString().slice(0, 10);
    turnosEjemplo[fechaStr] = Math.floor(Math.random() * 5) + 1;
  }
  const fechaInicio = new Date(hoy);
  fechaInicio.setDate(hoy.getDate() - 6);
  renderGraficoProductividad(turnosEjemplo, fechaInicio, hoy);

  // Datos de ejemplo para la tabla
  const turnosEjemploLista = [
    { fecha: hoy.toISOString().slice(0, 10), paciente: 'María González', odontologo: 'Dr. Hernán Pérez', estado: 'finalizado', total_paciente: 15000 },
    { fecha: hoy.toISOString().slice(0, 10), paciente: 'Juan Pérez', odontologo: 'Dra. Martina Gutierrez', estado: 'finalizado', total_paciente: 25000 },
    { fecha: hoy.toISOString().slice(0, 10), paciente: 'Lucía Pereyra', odontologo: 'Rodrigo Sosa', estado: 'finalizado', total_paciente: 5000 },
  ];
  renderUltimosTurnos(turnosEjemploLista);
  document.getElementById('prod-ultimos-count').textContent = `${turnosEjemploLista.length} registros`;
  document.getElementById('prod-periodo').textContent = 'Últimos 7 días · Datos de ejemplo';
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-productividad')) {
  renderProductividad();
}
