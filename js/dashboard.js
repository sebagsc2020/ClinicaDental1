// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {
  const el = $('view-dashboard');
  if (!el) return;

  // Fecha actual formateada
  const ahora = new Date();
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaStr = diasSemana[ahora.getDay()] + ', ' + ahora.getDate() + ' de ' + meses[ahora.getMonth()] + ' ' + ahora.getFullYear();

  // Obtener fecha de hoy y primer día del mes
  const hoy = new Date().toISOString().slice(0, 10);
  const mesInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  el.innerHTML = `
    <style>
      @media (max-width:768px) {
        /* Header: botones debajo del título */
        .page-header > div:last-child { flex-direction:column; width:100%; }
        .page-header > div:last-child .btn { width:100%; justify-content:center; }
        /* Tarjetas KPI: reducir tamaño de fuente */
        #db-kpi-grid .card { padding:12px }
        #db-kpi-grid [style*="font-size:32px"] { font-size:24px !important }
        #db-kpi-grid [style*="font-size:24px"] { font-size:18px !important }
        /* Agenda del día: ocultar nombre de doctor en mobile */
        #db-agenda-hoy [style*="color:var(--text-muted);flex-shrink:0"] { display:none }
        /* Gráfico 7 días: altura menor */
        #db-chart-7d { height:44px !important }
      }
    </style>

    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">${fechaStr}</div>
      </div>
      <div style="display:flex;gap:8px">
        <a href="#" class="btn btn-secondary" onclick="navigateTo('agenda')">+ Nuevo turno</a>
        <a href="#" class="btn btn-primary" onclick="navigateTo('pacientes')">+ Nuevo paciente</a>
      </div>
    </div>

    <!-- Métricas principales -->
    <div id="db-kpi-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      <div class="card" style="border-left:3px solid var(--primary)">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Turnos hoy</div>
        <div style="font-size:32px;font-weight:800;color:var(--primary);line-height:1" id="dash-turnos-hoy">0</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">agendados para hoy</div>
      </div>
      <div class="card" style="border-left:3px solid #22c55e">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Pacientes nuevos</div>
        <div style="font-size:32px;font-weight:800;color:#22c55e;line-height:1" id="dash-pacientes-nuevos">0</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">este mes</div>
      </div>
      <div class="card" style="border-left:3px solid #8b5cf6">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Ingresos del mes</div>
        <div style="font-size:24px;font-weight:800;color:#8b5cf6;line-height:1" id="dash-ingresos">$0</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px" id="dash-mes-actual">${meses[ahora.getMonth()]} ${ahora.getFullYear()}</div>
      </div>
      <div class="card" style="border-left:3px solid #f59e0b">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Turnos pendientes</div>
        <div style="font-size:32px;font-weight:800;color:#f59e0b;line-height:1" id="dash-turnos-pendientes">0</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">confirmados y programados</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;margin-bottom:20px">

      <!-- Agenda de hoy -->
      <div id="db-agenda-hoy" class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:14px;font-weight:700">Agenda de hoy</div>
          <a href="#" onclick="navigateTo('agenda')" style="font-size:12px;color:var(--primary)">Ver agenda completa →</a>
        </div>
        <div id="db-agenda-lista" style="display:flex;flex-direction:column;gap:8px">
          <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px">Cargando turnos...</div>
        </div>
      </div>

      <!-- Panel derecho -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Flujo 7 días -->
        <div class="card">
          <div style="font-size:13px;font-weight:700;margin-bottom:12px">Ingresos últimos 7 días</div>
          <div id="db-chart-7d" style="display:flex;align-items:flex-end;gap:4px;height:56px;margin-bottom:6px">
            <!-- Se llena dinámicamente -->
          </div>
          <div id="db-chart-labels" style="display:flex;gap:4px">
            <!-- Se llena dinámicamente -->
          </div>
        </div>

        <!-- Próximos turnos -->
        <div class="card">
          <div style="font-size:13px;font-weight:700;margin-bottom:12px">Próximos turnos</div>
          <div id="db-proximos" style="display:flex;flex-direction:column;gap:6px">
            <div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px">Cargando...</div>
          </div>
        </div>

      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- Top tratamientos -->
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:16px">Top tratamientos del mes</div>
        <div id="db-top-tratamientos" style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px">Cargando...</div>
      </div>

      <!-- Últimos pacientes -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:13px;font-weight:700">Últimos pacientes</div>
          <a href="#" onclick="navigateTo('pacientes')" style="font-size:12px;color:var(--primary)">Ver todos →</a>
        </div>
        <div id="db-ultimos-pacientes" style="display:flex;flex-direction:column;gap:8px">
          <div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px">Cargando...</div>
        </div>
      </div>

    </div>
  `;

  // ── Cargar datos ──────────────────────────────────────────────────────────

  // 1. Turnos hoy
  db.collection('turnos').where('fecha', '==', hoy).get().then(snap => {
    const el = document.getElementById('dash-turnos-hoy');
    if (el) el.textContent = snap.size;

    // Renderizar agenda de hoy
    const lista = document.getElementById('db-agenda-lista');
    if (!lista) return;
    if (snap.empty) {
      lista.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px">No hay turnos para hoy.</div>';
      return;
    }
    let html = '';
    snap.forEach(doc => {
      const t = doc.data();
      const hora = t.hora || '--:--';
      const paciente = t.paciente || 'Sin paciente';
      const tratamiento = t.tratamiento || '—';
      const profesional = t.odontologo || 'Profesional';
      const estado = t.estado || 'pendiente';
      const estadoColor = {
        'pendiente': 'background:#eff6ff;color:#1d4ed8;',
        'confirmado': 'background:#f0fdf4;color:#0d9488;',
        'en_recepcion': 'background:#fffbeb;color:#b45309;',
        'en_atencion': 'background:#faf5ff;color:#7c3aed;',
        'finalizado': 'background:#f1f5f9;color:#475569;',
        'cancelado': 'background:#fef2f2;color:#b91c1c;',
        'ausente': 'background:#fef2f2;color:#b91c1c;'
      };
      const estadoLabel = {
        'pendiente': 'Pendiente',
        'confirmado': 'Confirmado',
        'en_recepcion': 'En recepción',
        'en_atencion': 'En atención',
        'finalizado': 'Finalizado',
        'cancelado': 'Cancelado',
        'ausente': 'Ausente'
      };
      html += `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;background:var(--bg);border:1px solid var(--border)">
          <div style="font-size:13px;font-weight:700;color:var(--primary);width:46px;flex-shrink:0;text-align:center">${hora}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${paciente}</div>
            <div style="font-size:11px;color:var(--text-muted)">${tratamiento}</div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);flex-shrink:0">${profesional}</div>
          <span style="padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;${estadoColor[estado] || 'background:#f1f5f9;color:#475569;'}flex-shrink:0">${estadoLabel[estado] || estado}</span>
        </div>
      `;
    });
    lista.innerHTML = html;
  }).catch(() => {
    const lista = document.getElementById('db-agenda-lista');
    if (lista) lista.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px">Error al cargar turnos.</div>';
  });

  // 2. Pacientes nuevos (este mes)
  db.collection('pacientes').where('creado', '>=', mesInicio).get().then(snap => {
    const el = document.getElementById('dash-pacientes-nuevos');
    if (el) el.textContent = snap.size;
  }).catch(() => {});

  // 3. Ingresos del mes (desde pagos)
  db.collection('pagos').where('fecha', '>=', mesInicio).get().then(snap => {
    let total = 0;
    snap.forEach(d => { total += d.data().monto || 0; });
    const el = document.getElementById('dash-ingresos');
    if (el) el.textContent = '$' + total.toLocaleString();
  }).catch(() => {});

  // 4. Turnos pendientes (estado = pendiente o confirmado)
  db.collection('turnos')
    .where('estado', 'in', ['pendiente', 'confirmado'])
    .get()
    .then(snap => {
      const el = document.getElementById('dash-turnos-pendientes');
      if (el) el.textContent = snap.size;
    })
    .catch(() => {});

  // 5. Gráfico de ingresos últimos 7 días
  const fechas7d = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    fechas7d.push(d.toISOString().slice(0, 10));
  }
  // Para cada fecha, obtener el total de pagos
  // Como no podemos hacer 7 consultas, hacemos una sola y agrupamos
  const fechaInicio7d = fechas7d[0];
  db.collection('pagos')
    .where('fecha', '>=', fechaInicio7d)
    .get()
    .then(snap => {
      const totals = {};
      fechas7d.forEach(f => totals[f] = 0);
      snap.forEach(d => {
        const fecha = d.data().fecha;
        if (totals[fecha] !== undefined) {
          totals[fecha] += d.data().monto || 0;
        }
      });
      const maxVal = Math.max(...Object.values(totals), 1);
      const chartContainer = document.getElementById('db-chart-7d');
      const labelsContainer = document.getElementById('db-chart-labels');
      if (chartContainer) {
        let bars = '';
        fechas7d.forEach(f => {
          const val = totals[f] || 0;
          const pct = Math.max((val / maxVal) * 100, 3);
          const isToday = f === hoy;
          bars += `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end">
              <div title="$${val.toLocaleString()}"
                   style="width:100%;background:${isToday ? 'var(--primary)' : 'var(--border)'};border-radius:3px 3px 0 0;height:${pct}%;min-height:3px;transition:.2s"></div>
            </div>
          `;
        });
        chartContainer.innerHTML = bars;
      }
      if (labelsContainer) {
        let labels = '';
        fechas7d.forEach(f => {
          const parts = f.split('-');
          labels += `<div style="flex:1;text-align:center;font-size:9px;color:var(--text-muted)">${parts[2]}/${parts[1]}</div>`;
        });
        labelsContainer.innerHTML = labels;
      }
    })
    .catch(() => {});

  // 6. Próximos turnos (futuros, ordenados por fecha)
  db.collection('turnos')
    .where('fecha', '>=', hoy)
    .orderBy('fecha', 'asc')
    .limit(6)
    .get()
    .then(snap => {
      const container = document.getElementById('db-proximos');
      if (!container) return;
      if (snap.empty) {
        container.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px">No hay turnos próximos.</div>';
        return;
      }
      let html = '';
      snap.forEach(doc => {
        const t = doc.data();
        const fecha = t.fecha || '--/--/----';
        const hora = t.hora || '--:--';
        const paciente = t.paciente || 'Sin paciente';
        const parts = fecha.split('-');
        const fechaDisplay = parts[2] + '/' + parts[1];
        html += `
          <div style="display:flex;gap:10px;align-items:center;font-size:12px">
            <div style="color:var(--text-muted);font-weight:600;white-space:nowrap;width:64px;flex-shrink:0">${fechaDisplay} ${hora}</div>
            <div style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${paciente}</div>
          </div>
        `;
      });
      container.innerHTML = html;
    })
    .catch(() => {});

  // 7. Últimos pacientes (5 más recientes)
  db.collection('pacientes')
    .orderBy('creado', 'desc')
    .limit(5)
    .get()
    .then(snap => {
      const container = document.getElementById('db-ultimos-pacientes');
      if (!container) return;
      if (snap.empty) {
        container.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px">No hay pacientes registrados.</div>';
        return;
      }
      let html = '';
      snap.forEach(doc => {
        const p = doc.data();
        const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
        const iniciales = nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const codigo = p.codigo || 'PAC-' + String(doc.id).padStart(4, '0');
        const fecha = p.creado ? formatearFecha(p.creado) : '—';
        html += `
          <a href="#" onclick="verPaciente('${doc.id}')" style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;text-decoration:none;color:inherit;border:1px solid transparent"
             onmouseover="this.style.background='var(--bg)';this.style.borderColor='var(--border)'"
             onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
            <div class="avatar" style="background:var(--teal-light);color:var(--teal);font-weight:700;font-size:13px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;flex-shrink:0">${iniciales}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600">${nombre}</div>
              <div style="font-size:11px;color:var(--text-muted)">${codigo}</div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);flex-shrink:0">${fecha}</div>
          </a>
        `;
      });
      container.innerHTML = html;
    })
    .catch(() => {});

  // 8. Top tratamientos del mes (desde turnos con tratamientos realizados)
  db.collection('turnos')
    .where('fecha', '>=', mesInicio)
    .get()
    .then(snap => {
      const container = document.getElementById('db-top-tratamientos');
      if (!container) return;
      const counts = {};
      snap.forEach(doc => {
        const t = doc.data();
        const trat = t.tratamiento || t.tratamientos || 'Sin especificar';
        // Si es un array, tomar el primero o unirlos
        let nombreTrat = trat;
        if (Array.isArray(trat)) {
          nombreTrat = trat[0] || 'Sin especificar';
        }
        counts[nombreTrat] = (counts[nombreTrat] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (sorted.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px">Sin datos aún.</div>';
        return;
      }
      let html = '';
      sorted.forEach(([nombre, count]) => {
        html += `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">
            <span>${nombre}</span>
            <span style="font-weight:600;color:var(--primary)">${count} ${count === 1 ? 'vez' : 'veces'}</span>
          </div>
        `;
      });
      container.innerHTML = html;
    })
    .catch(() => {});
}

// Helper: formatear fecha
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
