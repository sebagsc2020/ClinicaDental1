// ============================================================
// AGENDA
// ============================================================

// Variables de estado
let semanaActual = new Date();
let filterOdontologo = 'todos';
let filterSucursal = 'todos';
let vistaActual = 'semana';
const HORA_INICIO = 8;
const PX_POR_HORA = 128;
const SLOT_MINUTOS = 15;

// Colores y etiquetas de estados
const ESTADOS_COLORS = {
  'pendiente': '#6cd9f4',
  'confirmado': '#395ff3',
  'en_recepcion': '#f59e0b',
  'en_atencion': '#d853f3',
  'finalizado': '#16a34a',
  'cancelado': '#9ca3af',
  'ausente': '#dc2626'
};
const ESTADOS_LABELS = {
  'pendiente': 'Pendiente',
  'confirmado': 'Confirmado',
  'en_recepcion': 'En recepción',
  'en_atencion': 'En atención',
  'finalizado': 'Finalizado',
  'cancelado': 'Cancelado',
  'ausente': 'Ausente'
};

// Helper para getElementById
function $(id) { return document.getElementById(id); }

// Obtener el lunes de una fecha
function obtenerLunes(fecha) {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  return d;
}

// Formatear fecha para mostrar
function formatearFecha(yyyy_mm_dd) {
  const p = yyyy_mm_dd.split('-');
  const d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return dias[d.getDay()] + ' ' + d.getDate() + ' ' + meses[d.getMonth()] + ' ' + p[0];
}

// Obtener el rango de fechas de la semana
function getSemanaFechas(lunes) {
  const fechas = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    fechas.push(d.toISOString().slice(0, 10));
  }
  return fechas;
}

// Calcular posición vertical de un turno
function calcularPosicion(hora, duracion = 30) {
  const [h, m] = hora.split(':').map(Number);
  const minutosDesdeInicio = (h - HORA_INICIO) * 60 + m;
  const top = (minutosDesdeInicio / 60) * PX_POR_HORA;
  const height = (duracion / 60) * PX_POR_HORA;
  return { top, height };
}

// Calcular hora de fin
function calcularHoraFin(horaInicio, duracion) {
  const [h, m] = horaInicio.split(':').map(Number);
  const totalMin = h * 60 + m + duracion;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Snap a slot de tiempo
function snapToSlot(y) {
  let totalMin = (y / PX_POR_HORA) * 60 + HORA_INICIO * 60;
  totalMin = Math.floor(totalMin / SLOT_MINUTOS) * SLOT_MINUTOS;
  totalMin = Math.max(HORA_INICIO * 60, Math.min(totalMin, (20 * 60) - SLOT_MINUTOS));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const hora = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  const top = (totalMin / 60 - HORA_INICIO) * PX_POR_HORA;
  return { hora, top };
}

// ============================================================
// RENDER AGENDA PRINCIPAL
// ============================================================
function renderAgenda() {
  const el = $('view-agenda');
  if (!el) return;

  const lunes = obtenerLunes(semanaActual);
  const fechas = getSemanaFechas(lunes);
  const hoy = new Date().toISOString().slice(0, 10);

  let fechasMostrar = fechas;
  if (vistaActual === 'dia') {
    const diaActual = semanaActual.toISOString().slice(0, 10);
    fechasMostrar = [diaActual];
  } else if (vistaActual === 'mes') {
    const year = semanaActual.getFullYear();
    const month = semanaActual.getMonth();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    fechasMostrar = [];
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      fechasMostrar.push(fecha);
    }
  } else if (vistaActual === 'lista') {
    fechasMostrar = fechas;
  }

  let headersHTML = '';
  if (vistaActual === 'semana' || vistaActual === 'dia' || vistaActual === 'lista') {
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    fechasMostrar.forEach((f, idx) => {
      const diaNum = new Date(f + 'T00:00:00').getDate();
      const esHoy = f === hoy;
      const diaSemana = diasSemana[new Date(f + 'T00:00:00').getDay()] || '';
      headersHTML += `
        <div data-col-idx="${idx}" style="padding:10px 8px;text-align:center;border-left:1px solid var(--border);${esHoy ? 'background:var(--accent-light,#e8f4f8);' : ''}">
          <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${diaSemana}</div>
          <div style="font-size:20px;font-weight:800;${esHoy ? 'color:var(--primary);' : 'color:var(--text);'}line-height:1.2;">${diaNum}</div>
          <div class="turnos-count" style="font-size:10px;color:var(--text-muted);">0 turnos</div>
        </div>
      `;
    });
  } else if (vistaActual === 'mes') {
    fechasMostrar.forEach((f, idx) => {
      const diaNum = new Date(f + 'T00:00:00').getDate();
      const esHoy = f === hoy;
      headersHTML += `
        <div data-col-idx="${idx}" style="padding:10px 8px;text-align:center;border-left:1px solid var(--border);${esHoy ? 'background:var(--accent-light,#e8f4f8);' : ''}">
          <div style="font-size:20px;font-weight:800;${esHoy ? 'color:var(--primary);' : 'color:var(--text);'}line-height:1.2;">${diaNum}</div>
          <div class="turnos-count" style="font-size:10px;color:var(--text-muted);">0 turnos</div>
        </div>
      `;
    });
  }

  let bodyHTML = '';
  if (vistaActual === 'dia' || vistaActual === 'semana' || vistaActual === 'lista') {
    if (vistaActual === 'lista') {
      bodyHTML = `<div id="lista-turnos" style="padding:16px;overflow-y:auto;max-height:600px;">Cargando turnos...</div>`;
    } else {
      bodyHTML = `
        <div style="position:relative;height:1536px;">
          ${Array.from({length:12}, (_, i) => HORA_INICIO + i).map(h => `
            <div style="position:absolute;top:${(h - HORA_INICIO) * PX_POR_HORA}px;right:6px;font-size:10px;color:var(--text-muted);line-height:1;">${String(h).padStart(2,'0')}:00</div>
          `).join('')}
        </div>
        ${fechasMostrar.map((fecha, colIdx) => `
          <div class="cal-col"
               data-fecha="${fecha}"
               data-col-idx="${colIdx}"
               style="position:relative;height:1536px;border-left:1px solid var(--border);${fecha === hoy ? 'background:#fafeff;' : ''}">
            ${Array.from({length:24}, (_, i) => {
              const top = i * 64;
              if (i % 2 === 0) {
                return `<div style="position:absolute;top:${top}px;left:0;right:0;height:64px;background:#f0f7ff;pointer-events:none;z-index:0;"></div>`;
              }
              return '';
            }).join('')}
            ${Array.from({length:13}, (_, i) => {
              const top = i * PX_POR_HORA;
              return `<div style="position:absolute;top:${top}px;left:0;right:0;border-top:${i % 1 === 0 ? '1px solid #dde8f0' : '1px dashed #e8edf2'};pointer-events:none;z-index:1;"></div>`;
            }).join('')}
            <div class="day-create-link"
                 data-fecha="${fecha}"
                 data-odontologo="0"
                 style="position:absolute;inset:0;z-index:2;cursor:pointer;"
                 title="Crear turno">
            </div>
            <div class="turnos-container" style="position:absolute;inset:0;z-index:3;pointer-events:none;"></div>
          </div>
        `).join('')}
      `;
    }
  } else if (vistaActual === 'mes') {
    bodyHTML = `
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;padding:16px;">
        ${fechasMostrar.map((fecha) => {
          const diaNum = new Date(fecha + 'T00:00:00').getDate();
          const esHoy = fecha === hoy;
          return `<div class="dia-mes" data-fecha="${fecha}" style="padding:8px;border:1px solid var(--border);border-radius:6px;min-height:60px;${esHoy ? 'background:var(--accent-light);' : ''}">
            <div style="font-weight:700;font-size:14px;${esHoy ? 'color:var(--primary);' : ''}">${diaNum}</div>
            <div class="turnos-container-mes" style="font-size:11px;color:var(--text-muted);margin-top:4px;"></div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  el.innerHTML = `
    <div class="page-header" style="margin-bottom:0;">
      <div>
        <div class="page-title">Agenda</div>
        <div class="page-subtitle">
          ${vistaActual === 'dia' ? `Día ${new Date(semanaActual).toLocaleDateString()}` :
            vistaActual === 'mes' ? `Mes de ${new Date(semanaActual).toLocaleString('es', {month:'long', year:'numeric'})}` :
            vistaActual === 'lista' ? 'Lista de turnos' :
            `Semana del ${fechas[0].split('-').reverse().join('/')} al ${fechas[6].split('-').reverse().join('/')}`}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <div style="display:flex;gap:6px;align-items:center;">
          <select id="filtro-odontologo-agenda" class="form-control" style="width:180px;" onchange="aplicarFiltrosAgenda()">
            <option value="todos">Todos los profesionales</option>
          </select>
          <select id="filtro-sucursal-agenda" class="form-control" style="width:180px;" onchange="aplicarFiltrosAgenda()">
            <option value="todos">Todas las sucursales</option>
          </select>
        </div>
        <button onclick="openModalBloqueo()" class="btn btn-secondary btn-sm">🔒 Bloquear</button>
        <div style="display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
          <button class="btn btn-sm ${vistaActual === 'dia' ? 'btn-primary' : 'btn-secondary'}" style="border-radius:0;border:none;" onclick="cambiarVista('dia')">Día</button>
          <button class="btn btn-sm ${vistaActual === 'semana' ? 'btn-primary' : 'btn-secondary'}" style="border-radius:0;border:none;border-left:1px solid var(--border);" onclick="cambiarVista('semana')">Semana</button>
          <button class="btn btn-sm ${vistaActual === 'mes' ? 'btn-primary' : 'btn-secondary'}" style="border-radius:0;border:none;border-left:1px solid var(--border);" onclick="cambiarVista('mes')">Mes</button>
          <button class="btn btn-sm ${vistaActual === 'lista' ? 'btn-primary' : 'btn-secondary'}" style="border-radius:0;border:none;border-left:1px solid var(--border);" onclick="cambiarVista('lista')">Lista</button>
        </div>
        <a href="#" class="btn btn-primary btn-sm" onclick="openModalNuevoTurnoAgenda('${hoy}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo turno
        </a>
        <a href="#" class="btn btn-sm" style="background:#fef2f2;color:#b91c1c;border:1px solid #fca5a5;" onclick="openModalNuevoTurnoAgenda('${hoy}', true)">⚡ Urgencia</a>
      </div>
    </div>

    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:16px;flex-wrap:nowrap;height:79px;">
      <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(-1)">← Anterior</button>
      <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(0)">Hoy</button>
      <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(1)">Siguiente →</button>
      <div id="reprog-panel" style="display:none;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:10px 14px;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;">📅 Reprogramar turno</div>
          <div id="rp-paciente" style="font-size:13px;font-weight:700;color:#1e2d3a;"></div>
          <div id="rp-info" style="font-size:11px;color:#64748b;margin-top:1px;"></div>
        </div>
        <div style="font-size:11px;color:#92400e;background:rgba(245,158,11,.15);padding:5px 10px;border-radius:6px;white-space:nowrap;">Hacé click en la celda donde querés mover el turno</div>
        <button onclick="exitReprogramarMode()" class="btn btn-secondary btn-sm" style="white-space:nowrap;flex-shrink:0;">✕ Cancelar</button>
      </div>
    </div>

    <div id="cal-wrap" style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;">
      <div id="cal-headers" style="display:grid;grid-template-columns:${vistaActual === 'lista' ? '1fr' : '52px repeat('+fechasMostrar.length+',1fr)'};border-bottom:2px solid var(--border);">
        ${vistaActual === 'lista' ? '<div style="padding:10px;font-weight:700;">Turnos</div>' : `<div></div>${headersHTML}`}
      </div>
      <div id="cal-body" style="display:grid;grid-template-columns:${vistaActual === 'lista' ? '1fr' : '52px repeat('+fechasMostrar.length+',1fr)'};overflow-y:auto;max-height:1556px;">
        ${vistaActual === 'lista' ? `
          <div id="lista-turnos-container" style="padding:16px;">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Profesional</th><th>Estado</th><th></th></tr></thead>
                <tbody id="lista-turnos-tbody"></tbody>
              </table>
            </div>
          </div>
        ` : bodyHTML}
      </div>
    </div>

    <div id="leyenda-agenda" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;align-items:center;">
      ${Object.entries(ESTADOS_COLORS).map(([estado, color]) => `
        <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-muted);">
          <div style="width:10px;height:10px;border-radius:3px;background:${color};"></div>
          ${ESTADOS_LABELS[estado] || estado}
        </div>
      `).join('')}
      <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-muted);">
        <div style="width:10px;height:10px;border-radius:3px;background:#dc2626;border:1px solid #991b1b;"></div>
        Urgencia/Sobreturno
      </div>
      <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-muted);">
        <div style="width:10px;height:10px;border-radius:3px;background:repeating-linear-gradient(45deg,#f8fafc,#f8fafc 2px,#e9ecef 2px,#e9ecef 4px);"></div>
        Bloqueado
      </div>
    </div>
  `;

  // Cargar profesionales y sucursales en filtros
  db.collection('profesionales').orderBy('nombre').get().then(snap => {
    const select = $('filtro-odontologo-agenda');
    if (!select) return;
    snap.forEach(doc => {
      const data = doc.data();
      const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      select.innerHTML += `<option value="${doc.id}">${nombre}</option>`;
    });
  });

  db.collection('sucursales').orderBy('nombre').get().then(snap => {
    const select = $('filtro-sucursal-agenda');
    if (!select) return;
    snap.forEach(doc => {
      const data = doc.data();
      select.innerHTML += `<option value="${doc.id}">${data.nombre || 'Sin nombre'}</option>`;
    });
  });

  // Cargar turnos según la vista
  if (vistaActual === 'lista') {
    cargarTurnosLista(fechas);
  } else if (vistaActual === 'mes') {
    cargarTurnosMes(fechasMostrar);
  } else {
    cargarTurnosSemana(fechasMostrar);
  }
}

// ============================================================
// CARGAR TURNOS (semana, día, mes, lista)
// ============================================================
function cargarTurnosSemana(fechas) {
  if (!fechas || fechas.length === 0) return;
  const fechaInicio = fechas[0];
  const fechaFin = fechas[fechas.length - 1];

  db.collection('turnos')
    .where('fecha', '>=', fechaInicio)
    .where('fecha', '<=', fechaFin)
    .onSnapshot((snapshot) => {
      document.querySelectorAll('.turnos-container').forEach(container => {
        container.innerHTML = '';
      });
      document.querySelectorAll('.turnos-count').forEach(el => {
        el.textContent = '0 turnos';
      });

      const turnosPorFecha = {};
      fechas.forEach(f => turnosPorFecha[f] = []);

      snapshot.forEach(doc => {
        const turno = doc.data();
        const fecha = turno.fecha;
        if (turnosPorFecha[fecha]) {
          turnosPorFecha[fecha].push({ id: doc.id, ...turno });
        }
      });

      fechas.forEach(fecha => {
        const turnos = turnosPorFecha[fecha] || [];
        const container = document.querySelector(`.cal-col[data-fecha="${fecha}"] .turnos-container`);
        if (!container) return;

        const idx = fechas.indexOf(fecha);
        const header = document.querySelector(`[data-col-idx="${idx}"] .turnos-count`);
        if (header) header.textContent = `${turnos.length} ${turnos.length === 1 ? 'turno' : 'turnos'}`;

        turnos.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

        const slots = [];
        turnos.forEach(turno => {
          const { top, height } = calcularPosicion(turno.hora || '08:00', turno.duracion || 30);
          let col = 0;
          let ocupado = true;
          while (ocupado) {
            ocupado = slots.some(s => s.col === col && s.top < top + height && s.top + s.height > top);
            if (ocupado) col++;
          }
          slots.push({ col, top, height, turno });
        });

        slots.forEach(({ col, top, height, turno }) => {
          const esUrgencia = turno.es_urgencia || false;
          const color = esUrgencia ? '#dc2626' : (turno.color || '#355063');
          const estado = turno.estado || 'pendiente';
          const esCancelado = estado === 'cancelado' || estado === 'ausente';
          const opacity = esCancelado ? '0.45' : '1';

          const bloque = document.createElement('div');
          bloque.className = 'turno-block';
          bloque.draggable = true;
          bloque.dataset.id = turno.id;
          bloque.dataset.dur = turno.duracion || 30;
          bloque.dataset.fwFecha = turno.fecha;
          bloque.dataset.fwHora = turno.hora || '08:00';
          bloque.dataset.fwOdo = turno.odontologo_id || '0';
          bloque.dataset.origRightPct = col > 0 ? Math.round(100 / (col + 1)) : 0;

          const width = col === 0 ? 100 : Math.round(100 / (col + 1));
          const left = col > 0 ? Math.round((col / (col + 1)) * 100) : 0;

          bloque.style.cssText = `
            position:absolute;
            left:${left}%;
            right:${col > 0 ? (100 - left - width) : 0}%;
            top:${top}px;
            height:${height - 2}px;
            background:${color};
            border-radius:5px;
            padding:3px 5px;
            overflow:hidden;
            z-index:3;
            cursor:pointer;
            opacity:${opacity};
            pointer-events:auto;
            ${esUrgencia ? 'border:2px solid #991b1b;box-shadow:0 0 6px rgba(220,38,38,.4);' : ''}
            transition:right .18s ease;
          `;

          const horaMostrar = turno.hora || '--:--';
          const paciente = turno.paciente || 'Sin paciente';
          const estadoLabel = ESTADOS_LABELS[estado] || estado;
          const tratamiento = turno.tratamiento || '';

          bloque.innerHTML = `
            <div style="font-size:10px;font-weight:700;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;">
              ${esUrgencia ? '⚡ ' : ''}${horaMostrar} ${paciente}
            </div>
            <div style="display:flex;align-items:center;gap:4px;margin-top:1px;pointer-events:none;">
              <span style="font-size:9px;font-weight:700;color:#fff;background:${ESTADOS_COLORS[estado] || '#6cd9f4'};border-radius:3px;padding:1px 5px;white-space:nowrap;flex-shrink:0;">${estadoLabel}</span>
              ${tratamiento ? `<span style="font-size:9px;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tratamiento}</span>` : ''}
            </div>
            <div class="resize-handle" style="position:absolute;bottom:0;left:0;right:0;height:8px;cursor:ns-resize;display:flex;align-items:center;justify-content:center;z-index:4;" title="Arrastrar para cambiar duración">
              <div style="width:20px;height:2px;background:rgba(255,255,255,.6);border-radius:2px;pointer-events:none;"></div>
            </div>
          `;

          bloque.dataset.popup = JSON.stringify({
            id: turno.id,
            paciente: paciente,
            paciente_nombre: paciente,
            telefono: turno.telefono || '',
            duracion: turno.duracion || 30,
            hora: `${horaMostrar} – ${calcularHoraFin(horaMostrar, turno.duracion || 30)}`,
            hora_inicio: horaMostrar,
            fecha: turno.fecha,
            trat: tratamiento,
            doc: turno.odontologo || 'Profesional',
            odontologo_nombre: turno.odontologo || 'Profesional',
            estado: estado,
            color: color,
            urgencia: esUrgencia,
            edit_url: '#',
            reprog_url: '#',
            del_url: '#',
            pago_url: '#',
            tratamientos: turno.tratamientos_realizados || [],
            total: turno.total_paciente || 0
          });

          bloque.addEventListener('click', function(e) {
            e.stopPropagation();
            mostrarPopupTurno(this);
          });

          bloque.addEventListener('dragstart', function(e) {
            e.dataTransfer.effectAllowed = 'move';
            this.style.opacity = '0.4';
          });
          bloque.addEventListener('dragend', function() {
            this.style.opacity = '';
          });

          container.appendChild(bloque);
        });
      });

      attachDragDropListeners();

    }, (error) => {
      console.error('Error cargando turnos:', error);
    });
}

function cargarTurnosLista(fechas) {
  if (!fechas || fechas.length === 0) return;
  const fechaInicio = fechas[0];
  const fechaFin = fechas[fechas.length - 1];

  db.collection('turnos')
    .where('fecha', '>=', fechaInicio)
    .where('fecha', '<=', fechaFin)
    .onSnapshot((snapshot) => {
      const tbody = $('lista-turnos-tbody');
      if (!tbody) return;
      let html = '';
      snapshot.forEach(doc => {
        const t = doc.data();
        const estado = t.estado || 'pendiente';
        const color = ESTADOS_COLORS[estado] || '#6cd9f4';
        html += `
          <tr>
            <td>${formatearFecha(t.fecha)}</td>
            <td>${t.hora || ''}</td>
            <td>${t.paciente || ''}</td>
            <td>${t.odontologo || ''}</td>
            <td><span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${ESTADOS_LABELS[estado] || estado}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="alert('Editar turno ${doc.id}')">Editar</button></td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#94a3b8;">No hay turnos en este período.</td></tr>';
    });
}

function cargarTurnosMes(fechas) {
  if (!fechas || fechas.length === 0) return;
  const fechaInicio = fechas[0];
  const fechaFin = fechas[fechas.length - 1];

  db.collection('turnos')
    .where('fecha', '>=', fechaInicio)
    .where('fecha', '<=', fechaFin)
    .onSnapshot((snapshot) => {
      document.querySelectorAll('.turnos-container-mes').forEach(el => el.innerHTML = '');
      const turnosPorFecha = {};
      fechas.forEach(f => turnosPorFecha[f] = []);
      snapshot.forEach(doc => {
        const t = doc.data();
        if (turnosPorFecha[t.fecha]) turnosPorFecha[t.fecha].push(t);
      });
      fechas.forEach(fecha => {
        const container = document.querySelector(`.dia-mes[data-fecha="${fecha}"] .turnos-container-mes`);
        if (!container) return;
        const turnos = turnosPorFecha[fecha] || [];
        container.innerHTML = turnos.map(t => `<div>${t.hora || ''} ${t.paciente || ''}</div>`).join('');
      });
    });
}

// ============================================================
// POPUP DE TURNO
// ============================================================
window.mostrarPopupTurno = function(element) {
  const data = JSON.parse(element.dataset.popup);
  alert(`Turno: ${data.paciente}\nFecha: ${data.fecha}\nHora: ${data.hora}\nEstado: ${data.estado}`);
};

// ============================================================
// DRAG & DROP
// ============================================================
function attachDragDropListeners() {
  document.querySelectorAll('.cal-col').forEach(col => {
    col.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const existing = col.querySelector('.drop-indicator');
      if (!existing) {
        const ind = document.createElement('div');
        ind.className = 'drop-indicator';
        ind.style.cssText = 'position:absolute;left:2px;right:2px;height:2px;background:var(--primary);z-index:20;pointer-events:none;border-radius:2px;';
        col.appendChild(ind);
      }
      const rect = col.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const snap = snapToSlot(y);
      col.querySelector('.drop-indicator').style.top = snap.top + 'px';
    });

    col.addEventListener('dragleave', function() {
      const ind = col.querySelector('.drop-indicator');
      if (ind) ind.remove();
    });

    col.addEventListener('drop', function(e) {
      e.preventDefault();
      const ind = col.querySelector('.drop-indicator');
      if (ind) ind.remove();

      const turnoId = e.dataTransfer.getData('text/plain');
      if (!turnoId) return;

      const fecha = this.dataset.fecha;
      const rect = this.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const snap = snapToSlot(y);

      if (confirm(`¿Mover turno a ${fecha} a las ${snap.hora}?`)) {
        moverTurno(turnoId, fecha, snap.hora);
      }
    });
  });

  document.querySelectorAll('.turno-block').forEach(block => {
    block.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', this.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
    });
  });
}

function moverTurno(turnoId, fecha, hora) {
  db.collection('turnos').doc(turnoId).update({
    fecha: fecha,
    hora: hora
  }).then(() => {
    showToast('✅ Turno reprogramado.');
    renderAgenda();
  }).catch(err => alert('❌ Error: ' + err.message));
}

// ============================================================
// NAVEGACIÓN Y VISTAS
// ============================================================
window.cambiarSemana = function(direccion) {
  if (direccion === 0) {
    semanaActual = new Date();
  } else if (vistaActual === 'dia') {
    semanaActual.setDate(semanaActual.getDate() + direccion);
  } else if (vistaActual === 'mes') {
    semanaActual.setMonth(semanaActual.getMonth() + direccion);
  } else {
    semanaActual.setDate(semanaActual.getDate() + direccion * 7);
  }
  renderAgenda();
};

window.aplicarFiltrosAgenda = function() {
  renderAgenda();
};

window.cambiarVista = function(vista) {
  vistaActual = vista;
  renderAgenda();
};

// ============================================================
// MODAL: NUEVO TURNO (VERSIÓN CORREGIDA - SIN orderBy en tratamientos)
// ============================================================

// Variables globales
let _currentPlanId = 0;
let _pendingIrACaja = false;
const _DIAS_SEMANA = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
const _DIAS_LARGO = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const _MESES_LARGO = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const _DUR_PRESETS = [15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240];

// Datos de cobertura y horarios (se cargan desde Firestore o se toman del ámbito global)
let HORARIOS_PROF = window.HORARIOS_PROF || {};
let PACIENTES_OS = window.PACIENTES_OS || {};
let COBERTURAS = window.COBERTURAS || {};
let PACIENTES_TEL = window.PACIENTES_TEL || {};
let PACIENTES_EMAIL = window.PACIENTES_EMAIL || {};
let CONFIRM_CANALES = window.CONFIRM_CANALES || ["whatsapp","email"];

// Función para cargar datos desde Firestore si no existen
function cargarDatosParaModal() {
  const promesas = [];
  if (Object.keys(HORARIOS_PROF).length === 0) {
    promesas.push(db.collection('profesionales').get().then(snap => {
      snap.forEach(doc => {
        const data = doc.data();
        if (data.horarios) {
          HORARIOS_PROF[doc.id] = data.horarios;
        }
      });
    }).catch(() => {}));
  }
  if (Object.keys(PACIENTES_OS).length === 0) {
    promesas.push(db.collection('pacientes').get().then(snap => {
      snap.forEach(doc => {
        const data = doc.data();
        PACIENTES_OS[doc.id] = { obra_social_id: data.obra_social_id || null, plan_id: data.plan_id || 0 };
        PACIENTES_TEL[doc.id] = data.telefono || '';
        PACIENTES_EMAIL[doc.id] = data.email || '';
      });
    }).catch(() => {}));
  }
  if (Object.keys(COBERTURAS).length === 0) {
    promesas.push(db.collection('coberturas').get().then(snap => {
      snap.forEach(doc => {
        const data = doc.data();
        COBERTURAS[doc.id] = data;
      });
    }).catch(() => {}));
  }
  if (CONFIRM_CANALES.length === 0) {
    promesas.push(db.collection('configuracion').doc('notificaciones').get().then(doc => {
      if (doc.exists) {
        CONFIRM_CANALES = doc.data().canales || ["whatsapp","email"];
      }
    }).catch(() => {}));
  }
  return Promise.all(promesas);
}

// ============================================================
// ABRIR NUEVO TURNO EN EL CONTENEDOR PRINCIPAL (CORREGIDO - SIN orderBy)
// ============================================================
window.openModalNuevoTurnoAgenda = function(fecha, esUrgencia = false, hora = '09:00') {
  const el = $('view-agenda');
  if (!el) {
    console.error('view-agenda no encontrado');
    return;
  }

  // HTML del formulario
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">${esUrgencia ? '⚡ Nuevo turno de urgencia' : '📋 Nuevo turno'}</div>
      </div>
      <button class="btn btn-secondary" onclick="renderAgenda()">← Volver a la agenda</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start">

      <!-- Columna principal -->
      <div style="display:flex;flex-direction:column;gap:16px;">

        <!-- Paciente y profesional -->
        <div class="card">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Paciente y profesional</div>
          <div class="form-grid">
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Paciente *</label>
              <select id="f-turno-paciente" class="form-control" required>
                <option value="">— Seleccionar paciente —</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Profesional *</label>
              <select id="f-turno-profesional" class="form-control" required>
                <option value="">— Seleccionar profesional —</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Sucursal *</label>
              <select id="f-turno-sucursal" class="form-control" required>
                <option value="">— Seleccionar sucursal —</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Fecha, hora y urgencia -->
        <div class="card">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Fecha y horario</div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Fecha *</label>
              <input type="date" id="f-turno-fecha" class="form-control" value="${fecha}" required>
              <div id="fecha-warning" style="color:#b91c1c;font-size:11px;margin-top:4px;display:none;">Los domingos no están disponibles para turnos.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Hora de inicio *</label>
              <input type="time" id="f-turno-hora" class="form-control" step="900" value="${hora}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Duración *</label>
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <select id="dur-select" class="form-control" style="width:130px;" onchange="durSelectChange(this.value)">
                  ${[15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240].map(m => `<option value="${m}" ${m===30?'selected':''}>${m} min</option>`).join('')}
                  <option value="custom">Personalizado…</option>
                </select>
                <input type="number" id="dur-input" min="15" step="1" value="30" class="form-control" style="width:72px;" oninput="durInputChange(this.value)">
                <span style="font-size:13px;color:var(--text-muted);white-space:nowrap;">min</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select id="f-turno-estado" class="form-control">
                <option value="pendiente" ${esUrgencia ? '' : 'selected'}>Pendiente</option>
                <option value="confirmado" ${esUrgencia ? 'selected' : ''}>Confirmado</option>
                <option value="en_recepcion">En recepción</option>
                <option value="en_atencion">En atención</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
                <option value="ausente">Ausente</option>
              </select>
            </div>
          </div>

          <!-- Urgencia -->
          <div style="margin-top:14px;padding:12px;border-radius:10px;background:#f8fafc;border:1px solid var(--border);">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
              <input type="checkbox" id="f-turno-urgencia" value="1" ${esUrgencia ? 'checked' : ''} onchange="toggleUrgencia(this)" style="width:16px;height:16px;cursor:pointer;">
              <div>
                <div style="font-weight:700;font-size:13px;color:var(--text);">⚡ Urgencia / Sobreturno</div>
                <div style="font-size:12px;color:var(--text-muted);">Permite asignar el turno aunque el profesional esté ocupado. Se muestra en rojo en la agenda.</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Clínico -->
        <div class="card">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Clínico</div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">Motivo de consulta</label>
              <textarea id="f-turno-motivo" class="form-control" rows="2"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna lateral -->
      <div style="display:flex;flex-direction:column;gap:16px;">

        <!-- Botones -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button type="button" class="btn btn-primary btn-block" id="btn-crear-turno" onclick="mostrarConfirmCrear()">Crear turno</button>
          <button type="button" class="btn btn-secondary btn-block" onclick="renderAgenda()">Cancelar</button>
        </div>

        <!-- Tratamientos realizados -->
        <div class="card">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Tratamientos realizados</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Marcá los realizados durante este turno — se usarán al registrar el pago en Caja</div>

          <div id="os-banner" style="display:none;margin-bottom:10px;padding:8px 12px;background:#e0f2fe;border-radius:8px;font-size:12px;color:#0369a1;">
            <strong id="os-banner-nombre"></strong> — se muestra la cobertura por tratamiento
          </div>

          <input type="text" id="trt-buscar" class="form-control" placeholder="Buscar tratamiento…" style="margin-bottom:8px;font-size:13px;" oninput="filtrarTrts(this.value)">

          <div id="trt-lista" style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;">
            <!-- Se llena dinámicamente -->
          </div>

          <input type="hidden" id="inp-total-paciente" value="">
          <input type="hidden" id="inp-total-obra-social" value="">

          <div id="trt-subtotal" style="display:none;margin-top:8px;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:var(--text-muted);"><span id="trt-count">0</span> tratamiento(s)</span>
              <span style="font-size:14px;font-weight:700;color:var(--primary);">$<span id="trt-total-val">0</span></span>
            </div>
            <div id="os-totales" style="display:none;margin-top:6px;padding-top:6px;border-top:1px dashed var(--border);">
              <div style="display:flex;justify-content:space-between;font-size:12px;">
                <span style="color:var(--text-muted);">Tratamientos paciente:</span>
                <span style="font-weight:700;color:#15803d;">$<span id="trt-paciente-val">0</span></span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:2px;">
                <span style="color:var(--text-muted);">Cubre obra social:</span>
                <span style="font-weight:700;color:#0891b2;">$<span id="trt-os-val">0</span></span>
              </div>
            </div>
            <div id="coseguro-row" style="display:none;margin-top:6px;padding-top:6px;border-top:1px dashed var(--border);">
              <div style="display:flex;justify-content:space-between;font-size:12px;">
                <span style="color:var(--text-muted);">Coseguro:</span>
                <span style="font-weight:700;color:#f59e0b;">$<span id="trt-coseguro-val">0</span></span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:2px;padding-top:4px;border-top:1px solid var(--border);">
                <span style="font-weight:600;color:var(--text);">Paciente paga total:</span>
                <span style="font-weight:700;color:#15803d;">$<span id="trt-paciente-total-val">0</span></span>
              </div>
            </div>
          </div>

          <!-- Coseguro -->
          <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg);flex-wrap:wrap;">
            <div>
              <div style="font-size:12px;font-weight:600;color:var(--text);">Coseguro</div>
              <div style="font-size:11px;color:var(--text-muted);">Pago adicional del paciente (opcional)</div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:13px;color:var(--text-muted);font-weight:600;">$</span>
              <input type="number" id="coseguro-input" min="0" step="0.01" value="" oninput="recalcPrecio()" style="width:90px;border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:13px;text-align:right;" placeholder="0.00">
            </div>
          </div>

          <button type="button" id="btn-pago-caja" onclick="guardarYPagar()" class="btn btn-block" disabled style="margin-top:12px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;opacity:.45;cursor:not-allowed;">
            💰 Guardar y Registrar pago en Caja
          </button>
        </div>
      </div>
    </div>
  `;

  // Inyectar en el contenedor
  el.innerHTML = html;

  // Función mejorada para cargar datos con reintentos y logs (SIN orderBy en tratamientos)
  function cargarDatosCuandoExistan(intentos = 0) {
    const maxIntentos = 20;
    const pacSelect = document.getElementById('f-turno-paciente');
    const profSelect = document.getElementById('f-turno-profesional');
    const sucSelect = document.getElementById('f-turno-sucursal');
    const listaTrat = document.getElementById('trt-lista');

    if (!pacSelect || !profSelect || !sucSelect || !listaTrat) {
      if (intentos >= maxIntentos) {
        console.error('No se encontraron los elementos del formulario después de múltiples intentos.');
        return;
      }
      console.log(`Esperando elementos del formulario (intento ${intentos+1})...`);
      setTimeout(() => cargarDatosCuandoExistan(intentos + 1), 200);
      return;
    }

    console.log('Elementos encontrados, cargando datos...');

    // Cargar datos auxiliares (horarios, coberturas, etc.)
    cargarDatosParaModal().then(() => {
      console.log('Datos auxiliares cargados (PACIENTES_OS, COBERTURAS, etc.)');

      // Cargar pacientes, profesionales, sucursales y tratamientos (SIN orderBy para evitar índices)
      const promesas = [
        db.collection('pacientes').get(),
        db.collection('profesionales').orderBy('nombre').get(),
        db.collection('sucursales').orderBy('nombre').get(),
        db.collection('tratamientos').get() // SIN orderBy, se ordena en cliente
      ];

      Promise.all(promesas).then(([pacSnap, profSnap, sucSnap, tratSnap]) => {
        console.log(`Pacientes: ${pacSnap.size}, Profesionales: ${profSnap.size}, Sucursales: ${sucSnap.size}, Tratamientos: ${tratSnap.size}`);

        // --- Llenar pacientes (ordenar en cliente) ---
        let pacientes = [];
        pacSnap.forEach(doc => pacientes.push({ id: doc.id, ...doc.data() }));
        pacientes.sort((a, b) => {
          const nomA = (a.nombre || '').toLowerCase();
          const nomB = (b.nombre || '').toLowerCase();
          return nomA.localeCompare(nomB);
        });
        pacSelect.innerHTML = '<option value="">— Seleccionar paciente —</option>';
        pacientes.forEach(p => {
          const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
          pacSelect.innerHTML += `<option value="${p.id}">${nombre}</option>`;
        });
        pacSelect.addEventListener('change', onPacienteChange);
        onPacienteChange();

        // --- Llenar profesionales ---
        profSelect.innerHTML = '<option value="">— Seleccionar profesional —</option>';
        profSnap.forEach(doc => {
          const data = doc.data();
          const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
          const especialidad = data.especialidad || '';
          profSelect.innerHTML += `<option value="${doc.id}">${nombre} ${especialidad ? '· ' + especialidad : ''}</option>`;
        });

        // --- Llenar sucursales ---
        sucSelect.innerHTML = '<option value="">— Seleccionar sucursal —</option>';
        sucSnap.forEach(doc => {
          const data = doc.data();
          sucSelect.innerHTML += `<option value="${doc.id}">${data.nombre || ''}</option>`;
        });

        // --- Llenar tratamientos (ordenar en cliente) ---
        let tratamientos = [];
        tratSnap.forEach(doc => tratamientos.push({ id: doc.id, ...doc.data() }));
        // Ordenar por categoría y luego por nombre
        tratamientos.sort((a, b) => {
          const catA = (a.categoria || '').toLowerCase();
          const catB = (b.categoria || '').toLowerCase();
          if (catA < catB) return -1;
          if (catA > catB) return 1;
          const nomA = (a.nombre || '').toLowerCase();
          const nomB = (b.nombre || '').toLowerCase();
          return nomA.localeCompare(nomB);
        });

        let grupos = {};
        tratamientos.forEach(trat => {
          const cat = trat.categoria || 'sin-categoria';
          if (!grupos[cat]) grupos[cat] = [];
          grupos[cat].push(trat);
        });

        let htmlTrat = '';
        Object.keys(grupos).sort().forEach(cat => {
          const items = grupos[cat];
          htmlTrat += `<div class="trt-grupo" data-cat="${cat}">
            <div style="padding:4px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);background:var(--bg);position:sticky;top:0;">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>`;
          items.forEach(trat => {
            const precio = trat.precio_base || 0;
            htmlTrat += `
              <label class="trt-item" data-nombre="${(trat.nombre || '').toLowerCase()}"
                     style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;border-top:1px solid var(--border);"
                     onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
                <input type="checkbox" name="tratamientos_realizados_ids[]" value="${trat.id}"
                       data-precio="${precio}"
                       data-trat-id="${trat.id}"
                       onchange="recalcPrecio()"
                       style="width:15px;height:15px;accent-color:var(--primary);flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${trat.nombre || ''}</div>
                  <div class="os-split-label" style="display:none;font-size:11px;color:var(--text-muted);margin-top:1px;"></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                  <div style="font-size:12px;font-weight:600;color:var(--primary);white-space:nowrap;">$${precio.toLocaleString()}</div>
                  <div class="os-pct-badge" style="display:none;font-size:10px;font-weight:700;color:#0891b2;white-space:nowrap;"></div>
                </div>
              </label>`;
          });
          htmlTrat += `</div>`;
        });
        listaTrat.innerHTML = htmlTrat;
        recalcPrecio();

        // Validación de domingos
        const fechaInput = document.getElementById('f-turno-fecha');
        const fechaWarning = document.getElementById('fecha-warning');
        const btnCrear = document.getElementById('btn-crear-turno');

        function validarDomingo() {
          if (!fechaInput) return;
          const val = fechaInput.value;
          if (val) {
            const d = new Date(val + 'T00:00:00');
            const esDomingo = d.getDay() === 0;
            if (esDomingo) {
              fechaWarning.style.display = 'block';
              btnCrear.disabled = true;
              btnCrear.style.opacity = '0.5';
              btnCrear.style.cursor = 'not-allowed';
            } else {
              fechaWarning.style.display = 'none';
              btnCrear.disabled = false;
              btnCrear.style.opacity = '1';
              btnCrear.style.cursor = '';
            }
          }
        }

        fechaInput.addEventListener('change', validarDomingo);
        fechaInput.addEventListener('input', validarDomingo);
        validarDomingo();

        if (esUrgencia) {
          const cb = document.getElementById('f-turno-urgencia');
          if (cb) toggleUrgencia(cb);
        }

        recalcPrecio();
        console.log('✅ Datos cargados correctamente en el formulario.');
      }).catch(err => {
        console.error('Error cargando datos principales:', err);
        alert('Error al cargar datos: ' + err.message);
      });
    }).catch(err => {
      console.error('Error en cargarDatosParaModal:', err);
      alert('Error al cargar datos auxiliares: ' + err.message);
    });
  }

  // Iniciar la carga con reintentos
  setTimeout(() => cargarDatosCuandoExistan(), 200);
};

// ============================================================
// FUNCIONES DEL FORMULARIO (globales)
// ============================================================

window.onPacienteChange = function() {
  const sel = document.getElementById('f-turno-paciente');
  if (!sel) return;
  const pid = parseInt(sel.value);
  const osData = pid ? PACIENTES_OS[pid] : null;
  _currentPlanId = osData ? (osData.plan_id || 0) : 0;

  const banner = document.getElementById('os-banner');
  if (banner) {
    if (osData && _currentPlanId) {
      const opt = sel.options[sel.selectedIndex];
      banner.style.display = 'block';
      const nombreEl = document.getElementById('os-banner-nombre');
      if (nombreEl) nombreEl.textContent = opt.textContent.trim().split('—')[0].trim();
    } else {
      banner.style.display = 'none';
    }
  }

  document.querySelectorAll('input[name="tratamientos_realizados_ids[]"]').forEach(function(cb) {
    const tid = parseInt(cb.dataset.tratId);
    const precio = parseFloat(cb.dataset.precio) || 0;
    const label = cb.closest('label');
    const splitEl = label ? label.querySelector('.os-split-label') : null;
    const badgeEl = label ? label.querySelector('.os-pct-badge') : null;

    let pct = 0;
    if (_currentPlanId && COBERTURAS[tid] && COBERTURAS[tid][_currentPlanId]) {
      pct = parseFloat(COBERTURAS[tid][_currentPlanId]);
    }

    if (splitEl) {
      if (pct > 0 && precio > 0) {
        const montoOS = precio * pct / 100;
        const montoPac = precio - montoOS;
        splitEl.textContent = 'Pte: $' + fmtNum(montoPac) + ' · OS ' + pct + '%: $' + fmtNum(montoOS);
        splitEl.style.display = 'block';
      } else {
        splitEl.style.display = 'none';
      }
    }
    if (badgeEl) {
      if (pct > 0) {
        badgeEl.textContent = 'OS ' + pct + '%';
        badgeEl.style.display = 'block';
      } else {
        badgeEl.style.display = 'none';
      }
    }
  });

  recalcPrecio();
};

function fmtNum(n) {
  return n.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:0});
}

window.recalcPrecio = function() {
  const checks = document.querySelectorAll('input[name="tratamientos_realizados_ids[]"]:checked');
  let total = 0, totalPac = 0, totalOS = 0, count = 0;
  checks.forEach(function(cb) {
    const precio = parseFloat(cb.dataset.precio) || 0;
    const tid = parseInt(cb.dataset.tratId);
    let pct = 0;
    if (_currentPlanId && COBERTURAS[tid] && COBERTURAS[tid][_currentPlanId]) {
      pct = parseFloat(COBERTURAS[tid][_currentPlanId]);
    }
    const montoOS = precio * pct / 100;
    total += precio;
    totalOS += montoOS;
    totalPac += precio - montoOS;
    count++;
  });

  const coseguroInp = document.getElementById('coseguro-input');
  const coseguro = coseguroInp ? (parseFloat(coseguroInp.value) || 0) : 0;

  const subtDiv = document.getElementById('trt-subtotal');
  const countEl = document.getElementById('trt-count');
  const totalEl = document.getElementById('trt-total-val');
  const pacEl = document.getElementById('trt-paciente-val');
  const osEl = document.getElementById('trt-os-val');
  const osTotDiv = document.getElementById('os-totales');
  const coseguroRow = document.getElementById('coseguro-row');
  const coseguroEl = document.getElementById('trt-coseguro-val');
  const pacTotalEl = document.getElementById('trt-paciente-total-val');
  const btnCaja = document.getElementById('btn-pago-caja');
  const inpPac = document.getElementById('inp-total-paciente');
  const inpOS = document.getElementById('inp-total-obra-social');

  const hasContent = count > 0 || coseguro > 0;

  if (hasContent) {
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = fmtNum(total);
    subtDiv.style.display = 'block';

    if (_currentPlanId && totalOS > 0) {
      if (pacEl) pacEl.textContent = fmtNum(totalPac);
      if (osEl) osEl.textContent = fmtNum(totalOS);
      if (osTotDiv) osTotDiv.style.display = 'block';
    } else {
      if (osTotDiv) osTotDiv.style.display = 'none';
    }

    if (coseguro > 0) {
      if (coseguroEl) coseguroEl.textContent = fmtNum(coseguro);
      if (pacTotalEl) pacTotalEl.textContent = fmtNum(totalPac + coseguro);
      if (coseguroRow) coseguroRow.style.display = 'block';
    } else {
      if (coseguroRow) coseguroRow.style.display = 'none';
    }

    if (inpPac) inpPac.value = totalPac.toFixed(2);
    if (inpOS) inpOS.value = totalOS.toFixed(2);

    if (btnCaja) { btnCaja.disabled = false; btnCaja.style.opacity = '1'; btnCaja.style.cursor = ''; }
  } else {
    subtDiv.style.display = 'none';
    if (coseguroRow) coseguroRow.style.display = 'none';
    if (inpPac) inpPac.value = '';
    if (inpOS) inpOS.value = '';
    if (btnCaja) { btnCaja.disabled = true; btnCaja.style.opacity = '.45'; btnCaja.style.cursor = 'not-allowed'; }
  }
};

window.filtrarTrts = function(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.trt-item').forEach(function(item) {
    item.style.display = (!q || (item.dataset.nombre || '').indexOf(q) !== -1) ? '' : 'none';
  });
  document.querySelectorAll('.trt-grupo').forEach(function(grupo) {
    const vis = Array.from(grupo.querySelectorAll('.trt-item')).filter(function(i){ return i.style.display !== 'none'; });
    grupo.style.display = vis.length > 0 ? '' : 'none';
  });
};

window.durSelectChange = function(val) {
  if (val === 'custom') return;
  const input = document.getElementById('dur-input');
  if (input) input.value = val;
};

window.durInputChange = function(val) {
  const sel = document.getElementById('dur-select');
  if (!sel) return;
  sel.value = _DUR_PRESETS.indexOf(parseInt(val)) !== -1 ? val : 'custom';
};

window.toggleUrgencia = function(cb) {
  const wrap = cb.closest('div[style]');
  if (cb.checked) {
    wrap.style.background = '#fef2f2';
    wrap.style.border = '1px solid #fca5a5';
    cb.nextElementSibling.querySelector('div').style.color = '#b91c1c';
  } else {
    wrap.style.background = '#f8fafc';
    wrap.style.border = '1px solid var(--border)';
    cb.nextElementSibling.querySelector('div').style.color = 'var(--text)';
  }
};

// ============================================================
// CONFIRMACIÓN Y GUARDADO
// ============================================================

window.mostrarConfirmCrear = function() {
  const pac = document.getElementById('f-turno-paciente');
  const prof = document.getElementById('f-turno-profesional');
  const suc = document.getElementById('f-turno-sucursal');
  const fecha = document.getElementById('f-turno-fecha');
  const hora = document.getElementById('f-turno-hora');
  if (!pac || !prof || !suc || !fecha || !hora) {
    alert('Completá todos los campos obligatorios (*).');
    return;
  }
  if (!pac.value || !prof.value || !suc.value || !fecha.value || !hora.value) {
    alert('Completá todos los campos obligatorios (*).');
    return;
  }

  const d = new Date(fecha.value + 'T00:00:00');
  if (d.getDay() === 0) {
    alert('No se pueden crear turnos los domingos.');
    return;
  }

  const dur = parseInt(document.getElementById('dur-input').value) || 30;
  const motivo = document.getElementById('f-turno-motivo').value.trim();
  const pacId = parseInt(pac.value);
  const profId = parseInt(prof.value);
  const pacText = pac.options[pac.selectedIndex].textContent.trim();
  const profText = prof.options[prof.selectedIndex].textContent.trim();
  const fechaVal = fecha.value;
  const horaIni = hora.value;

  const hh = parseInt(horaIni.split(':')[0]);
  const mm = parseInt(horaIni.split(':')[1]);
  const endTot = hh * 60 + mm + dur;
  const horaFin = String(Math.floor(endTot / 60)).padStart(2,'0') + ':' + String(endTot % 60).padStart(2,'0');

  const dp = fechaVal.split('-');
  const dObj = new Date(parseInt(dp[0]), parseInt(dp[1]) - 1, parseInt(dp[2]));
  const fechaFmt = _DIAS_LARGO[dObj.getDay()] + ' ' + dObj.getDate() + ' de ' + _MESES_LARGO[dObj.getMonth()] + ' ' + dp[0];

  const checked = Array.from(document.querySelectorAll('input[name="tratamientos_realizados_ids[]"]:checked'));
  const trtNames = checked.map(function(cb) {
    const nameDiv = cb.closest('label').querySelector('div > div:first-child');
    return nameDiv ? nameDiv.textContent.trim() : '';
  }).filter(Boolean);

  let confirmHTML = `
    <div class="modal-title">📋 Confirmar nuevo turno</div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:13px;margin-bottom:18px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid var(--border)">
      <span style="color:var(--text-muted);white-space:nowrap">Paciente</span>
      <span style="font-weight:700;color:var(--text)">${pacText}</span>
      <span style="color:var(--text-muted);white-space:nowrap">Profesional</span>
      <span style="font-weight:600;color:var(--text)">${profText}</span>
      <span style="color:var(--text-muted);white-space:nowrap">Fecha</span>
      <span style="font-weight:600;color:var(--text)">${fechaFmt}</span>
      <span style="color:var(--text-muted);white-space:nowrap">Horario</span>
      <span style="font-weight:600;color:var(--text)">${horaIni} – ${horaFin} (${dur} min)</span>
      ${trtNames.length > 0 ? `<span style="color:var(--text-muted)">Tratamientos</span><span style="font-weight:600;color:var(--text)">${trtNames.join(', ')}</span>` : ''}
      ${motivo ? `<span style="color:var(--text-muted)">Motivo</span><span style="color:var(--text)">${motivo}</span>` : ''}
    </div>
  `;

  const urgCb = document.getElementById('f-turno-urgencia');
  let warnMsg = '';
  if (!(urgCb && urgCb.checked)) {
    const horarios = HORARIOS_PROF[profId];
    if (horarios) {
      const dia = _DIAS_SEMANA[dObj.getDay()];
      const hcfg = horarios[dia];
      const profNombre = profText.split('·')[0].trim();
      if (!hcfg || !hcfg.activo) {
        warnMsg = profNombre + ' no trabaja este día.';
      } else {
        const horaMin = hh * 60 + mm;
        const iniMin = parseInt(hcfg.inicio.split(':')[0]) * 60 + parseInt(hcfg.inicio.split(':')[1]);
        const finMin = parseInt(hcfg.fin.split(':')[0]) * 60 + parseInt(hcfg.fin.split(':')[1]);
        if (horaMin < iniMin || horaMin >= finMin) {
          warnMsg = 'El horario ' + horaIni + ' está fuera del horario laboral de ' + profNombre + ' (' + hcfg.inicio + ' – ' + hcfg.fin + ').';
        }
      }
    }
  }
  if (warnMsg) {
    confirmHTML += `<div style="margin-bottom:12px;padding:10px 14px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;font-size:12px;color:#92400e"><strong>⚠️ Atención:</strong> ${warnMsg}</div>`;
  }

  const tel = PACIENTES_TEL[pacId] || '';
  const email = PACIENTES_EMAIL[pacId] || '';
  const hasWa = CONFIRM_CANALES.indexOf('whatsapp') !== -1;
  const hasEmail = CONFIRM_CANALES.indexOf('email') !== -1;

  let notifRows = [];
  if (hasWa) {
    if (tel) notifRows.push(`<div style="padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;font-size:12px;color:#15803d"><strong>📲 Notificación por WhatsApp</strong> Se enviará confirmación al número <strong>${tel}</strong>.</div>`);
    else notifRows.push(`<div style="padding:10px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;font-size:12px;color:#b91c1c"><strong>📵 Sin teléfono registrado</strong> El paciente no tiene teléfono. No se enviará por WhatsApp.</div>`);
  }
  if (hasEmail) {
    if (email) notifRows.push(`<div style="padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;font-size:12px;color:#15803d"><strong>✉️ Notificación por Email</strong> Se enviará confirmación a <strong>${email}</strong>.</div>`);
    else notifRows.push(`<div style="padding:10px 14px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;font-size:12px;color:#92400e"><strong>📧 Sin email registrado</strong> El paciente no tiene email. No se enviará por email.</div>`);
  }
  if (notifRows.length) {
    confirmHTML += `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">${notifRows.join('')}</div>`;
  }

  confirmHTML += `
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button type="button" class="btn btn-primary" onclick="confirmarCrearTurno()">✓ Confirmar turno</button>
    </div>
  `;

  openModal(confirmHTML);
  _pendingIrACaja = false;
};

window.guardarYPagar = function() {
  _pendingIrACaja = true;
  mostrarConfirmCrear();
};

window.confirmarCrearTurno = function() {
  const pacienteId = document.getElementById('f-turno-paciente').value;
  const profesionalId = document.getElementById('f-turno-profesional').value;
  const sucursalId = document.getElementById('f-turno-sucursal').value;
  const fecha = document.getElementById('f-turno-fecha').value;
  const hora = document.getElementById('f-turno-hora').value;
  const duracion = parseInt(document.getElementById('dur-input').value) || 30;
  const estado = document.getElementById('f-turno-estado').value;
  const esUrgencia = document.getElementById('f-turno-urgencia').checked;
  const motivo = document.getElementById('f-turno-motivo').value.trim();

  const d = new Date(fecha + 'T00:00:00');
  if (d.getDay() === 0) {
    alert('No se pueden crear turnos los domingos.');
    return;
  }

  const tratamientosIds = Array.from(document.querySelectorAll('input[name="tratamientos_realizados_ids[]"]:checked')).map(cb => cb.value);
  const totalPaciente = parseFloat(document.getElementById('inp-total-paciente').value) || 0;
  const totalOS = parseFloat(document.getElementById('inp-total-obra-social').value) || 0;
  const coseguro = parseFloat(document.getElementById('coseguro-input').value) || 0;

  const pacSel = document.getElementById('f-turno-paciente');
  const profSel = document.getElementById('f-turno-profesional');
  const pacienteNombre = pacSel.options[pacSel.selectedIndex].textContent.trim();
  const profesionalNombre = profSel.options[profSel.selectedIndex].textContent.trim();

  const turnoData = {
    paciente_id: pacienteId,
    paciente: pacienteNombre,
    odontologo_id: profesionalId,
    odontologo: profesionalNombre,
    sucursal_id: sucursalId,
    fecha: fecha,
    hora: hora,
    duracion: duracion,
    estado: estado,
    es_urgencia: esUrgencia,
    motivo_consulta: motivo,
    tratamientos_realizados_ids: tratamientosIds,
    total_paciente: totalPaciente,
    total_obra_social: totalOS,
    coseguro: coseguro,
    creado: new Date().toISOString()
  };

  db.collection('turnos').add(turnoData)
    .then(() => {
      closeModal();
      showToast('✅ Turno creado exitosamente.');
      renderAgenda();
      if (_pendingIrACaja) {
        showToast('💰 Redirigiendo a Caja... (simulado)');
        _pendingIrACaja = false;
      }
    })
    .catch(err => {
      alert('❌ Error al crear turno: ' + err.message);
    });
};

// ============================================================
// MODAL: BLOQUEAR HORARIO
// ============================================================
window.openModalBloqueo = function() {
  let profesionalesHTML = '<option value="">Toda la clínica</option>';
  db.collection('profesionales').orderBy('nombre').get().then(snap => {
    snap.forEach(doc => {
      const data = doc.data();
      const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      profesionalesHTML += `<option value="${doc.id}">${nombre}</option>`;
    });
    const sel = document.getElementById('f-bloqueo-profesional');
    if (sel) sel.innerHTML = profesionalesHTML;
  });

  const modalHTML = `
    <div class="modal-title">🔒 Bloquear horario</div>
    <form id="form-bloqueo" style="margin-top:8px;">
      <div class="form-group">
        <label class="form-label">Profesional</label>
        <select id="f-bloqueo-profesional" class="form-control">
          <option value="">Toda la clínica</option>
        </select>
      </div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Fecha inicio *</label>
          <input type="date" id="f-bloqueo-fecha-inicio" class="form-control" value="${new Date().toISOString().slice(0,10)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha fin *</label>
          <input type="date" id="f-bloqueo-fecha-fin" class="form-control" value="${new Date().toISOString().slice(0,10)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Hora inicio</label>
          <input type="time" id="f-bloqueo-hora-inicio" class="form-control" value="08:00" step="900">
        </div>
        <div class="form-group">
          <label class="form-label">Hora fin</label>
          <input type="time" id="f-bloqueo-hora-fin" class="form-control" value="20:00" step="900">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Motivo</label>
        <input type="text" id="f-bloqueo-motivo" class="form-control" placeholder="Ej: Feriado, Vacaciones, Reunión…">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="guardarBloqueo()">Guardar bloqueo</button>
      </div>
    </form>
  `;

  openModal(modalHTML);
};

window.guardarBloqueo = function() {
  const profesionalId = document.getElementById('f-bloqueo-profesional').value;
  const fechaInicio = document.getElementById('f-bloqueo-fecha-inicio').value;
  const fechaFin = document.getElementById('f-bloqueo-fecha-fin').value;
  const horaInicio = document.getElementById('f-bloqueo-hora-inicio').value;
  const horaFin = document.getElementById('f-bloqueo-hora-fin').value;
  const motivo = document.getElementById('f-bloqueo-motivo').value.trim();

  if (!fechaInicio || !fechaFin) return alert('Las fechas son obligatorias.');

  db.collection('bloqueos').add({
    profesional_id: profesionalId || null,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    hora_inicio: horaInicio || null,
    hora_fin: horaFin || null,
    motivo: motivo,
    creado: new Date().toISOString()
  }).then(() => {
    closeModal();
    showToast('✅ Bloqueo guardado.');
    renderAgenda();
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// REPROGRAMAR MODO
// ============================================================
let _reprogData = null;

window.exitReprogramarMode = function() {
  _reprogData = null;
  const panel = document.getElementById('reprog-panel');
  if (panel) panel.style.display = 'none';
  document.body.classList.remove('ds-reprog-mode');
};
