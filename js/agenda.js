// ============================================================
// AGENDA - VISTA COMPLETA ESTILO DENTALSOFT
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

  const lunes = obtenerLunes(semanaActual);
  const fechas = getSemanaFechas(lunes);
  const hoy = new Date().toISOString().slice(0, 10);

  el.innerHTML = `
    <div class="page-header" style="margin-bottom:0;">
      <div>
        <div class="page-title">Agenda</div>
        <div class="page-subtitle">Semana del ${fechas[0].split('-').reverse().join('/')} al ${fechas[6].split('-').reverse().join('/')}</div>
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
          <button class="btn btn-sm btn-secondary" style="border-radius:0;border:none;" onclick="cambiarVista('dia')">Día</button>
          <span class="btn btn-sm" style="border-radius:0;background:var(--primary);color:#fff;cursor:default;border:none;border-left:1px solid var(--border);">Semana</span>
          <button class="btn btn-sm btn-secondary" style="border-radius:0;border:none;border-left:1px solid var(--border);" onclick="cambiarVista('mes')">Mes</button>
          <button class="btn btn-sm btn-secondary" style="border-radius:0;border:none;border-left:1px solid var(--border);" onclick="cambiarVista('lista')">Lista</button>
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
      <div id="cal-headers" style="display:grid;grid-template-columns:52px repeat(7,1fr);border-bottom:2px solid var(--border);">
        <div></div>
        ${fechas.map((f, idx) => {
          const diaNum = new Date(f + 'T00:00:00').getDate();
          const esHoy = f === hoy;
          const diaSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][idx];
          return `
            <div data-col-idx="${idx}" style="padding:10px 8px;text-align:center;border-left:1px solid var(--border);${esHoy ? 'background:var(--accent-light,#e8f4f8);' : ''}">
              <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${diaSemana}</div>
              <div style="font-size:20px;font-weight:800;${esHoy ? 'color:var(--primary);' : 'color:var(--text);'}line-height:1.2;">${diaNum}</div>
              <div class="turnos-count" style="font-size:10px;color:var(--text-muted);">0 turnos</div>
            </div>
          `;
        }).join('')}
      </div>
      <div id="cal-body" style="display:grid;grid-template-columns:52px repeat(7,1fr);overflow-y:auto;max-height:1556px;">
        <div style="position:relative;height:1536px;">
          ${Array.from({length:12}, (_, i) => HORA_INICIO + i).map(h => `
            <div style="position:absolute;top:${(h - HORA_INICIO) * PX_POR_HORA}px;right:6px;font-size:10px;color:var(--text-muted);line-height:1;">${String(h).padStart(2,'0')}:00</div>
          `).join('')}
        </div>
        ${fechas.map((fecha, colIdx) => `
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

  // Cargar profesionales en el filtro
  db.collection('profesionales').orderBy('nombre').get().then(snap => {
    const select = $('filtro-odontologo-agenda');
    snap.forEach(doc => {
      const data = doc.data();
      const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      select.innerHTML += `<option value="${doc.id}">${nombre}</option>`;
    });
  });

  db.collection('sucursales').orderBy('nombre').get().then(snap => {
    const select = $('filtro-sucursal-agenda');
    snap.forEach(doc => {
      const data = doc.data();
      select.innerHTML += `<option value="${doc.id}">${data.nombre || 'Sin nombre'}</option>`;
    });
  });

  cargarTurnosSemana(fechas);
}

// ============================================================
// CARGAR TURNOS DESDE FIRESTORE
// ============================================================
function cargarTurnosSemana(fechas) {
  const fechaInicio = fechas[0];
  const fechaFin = fechas[6];

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

        const header = document.querySelector(`[data-col-idx="${fechas.indexOf(fecha)}"] .turnos-count`);
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

// ============================================================
// POPUP DE TURNO (básico)
// ============================================================
function mostrarPopupTurno(element) {
  const data = JSON.parse(element.dataset.popup);
  alert(`Turno: ${data.paciente}\nFecha: ${data.fecha}\nHora: ${data.hora}\nEstado: ${data.estado}`);
}

// ============================================================
// DRAG & DROP LISTENERS
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

// ============================================================
// MOVER TURNO
// ============================================================
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
// NAVEGACIÓN DE SEMANA
// ============================================================
window.cambiarSemana = function(direccion) {
  if (direccion === 0) {
    semanaActual = obtenerLunes(new Date());
  } else {
    semanaActual.setDate(semanaActual.getDate() + direccion * 7);
  }
  renderAgenda();
};

// ============================================================
// FILTROS Y VISTAS
// ============================================================
window.aplicarFiltrosAgenda = function() {
  renderAgenda();
};

window.cambiarVista = function(vista) {
  vistaActual = vista;
  renderAgenda();
};

// ============================================================
// MODAL: NUEVO TURNO (desde agenda)
// ============================================================
window.openModalNuevoTurnoAgenda = function(fecha, esUrgencia = false, hora = '09:00') {
  let pacientesHTML = '<option value="">— Seleccionar paciente —</option>';
  let profesionalesHTML = '<option value="">— Seleccionar profesional —</option>';
  let sucursalesHTML = '<option value="">— Seleccionar sucursal —</option>';

  db.collection('pacientes').orderBy('nombre').get().then(snap => {
    snap.forEach(doc => {
      const data = doc.data();
      const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      pacientesHTML += `<option value="${doc.id}">${nombre}</option>`;
    });
    document.getElementById('f-turno-paciente').innerHTML = pacientesHTML;
  });

  db.collection('profesionales').orderBy('nombre').get().then(snap => {
    snap.forEach(doc => {
      const data = doc.data();
      const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      profesionalesHTML += `<option value="${doc.id}">${nombre}</option>`;
    });
    document.getElementById('f-turno-profesional').innerHTML = profesionalesHTML;
  });

  db.collection('sucursales').orderBy('nombre').get().then(snap => {
    snap.forEach(doc => {
      const data = doc.data();
      sucursalesHTML += `<option value="${doc.id}">${data.nombre || ''}</option>`;
    });
    document.getElementById('f-turno-sucursal').innerHTML = sucursalesHTML;
  });

  const modalHTML = `
    <div class="modal-title">${esUrgencia ? '⚡ Nuevo turno de urgencia' : '📋 Nuevo turno'}</div>
    <form id="form-nuevo-turno-agenda" style="margin-top:8px;">
      <div class="form-grid" style="grid-template-columns:1fr 1fr; gap:12px;">
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

      <div class="form-grid" style="grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
        <div class="form-group">
          <label class="form-label">Fecha *</label>
          <input type="date" id="f-turno-fecha" class="form-control" value="${fecha}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Hora de inicio *</label>
          <input type="time" id="f-turno-hora" class="form-control" step="900" value="${hora}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Duración *</label>
          <div style="display:flex;align-items:center;gap:6px;">
            <select id="dur-select" class="form-control" style="width:130px;" onchange="document.getElementById('dur-input').value = this.value === 'custom' ? '' : this.value">
              ${[15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240].map(m => `<option value="${m}" ${m===30?'selected':''}>${m} min</option>`).join('')}
              <option value="custom">Personalizado…</option>
            </select>
            <input type="number" id="dur-input" min="15" step="1" value="30" class="form-control" style="width:72px;" oninput="document.getElementById('dur-select').value = 'custom'">
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

      ${esUrgencia ? `
        <div style="margin-top:14px;padding:12px;border-radius:10px;background:#fef2f2;border:1px solid #fca5a5;">
          <div style="font-weight:700;font-size:13px;color:#b91c1c;">⚡ Turno de urgencia / Sobreturno</div>
          <div style="font-size:12px;color:#64748b;">Se mostrará en rojo en la agenda y se asignará aunque el profesional esté ocupado.</div>
        </div>
      ` : ''}

      <div class="form-group" style="margin-top:14px;">
        <label class="form-label">Motivo de consulta</label>
        <textarea id="f-turno-motivo" class="form-control" rows="2"></textarea>
      </div>

      <div class="modal-actions" style="margin-top:16px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="guardarTurnoAgenda(${esUrgencia})">${esUrgencia ? 'Guardar urgencia' : 'Crear turno'}</button>
      </div>
    </form>
  `;

  openModal(modalHTML);
};

// ============================================================
// GUARDAR TURNO DESDE AGENDA
// ============================================================
window.guardarTurnoAgenda = function(esUrgencia = false) {
  const pacienteId = $('f-turno-paciente').value;
  const profesionalId = $('f-turno-profesional').value;
  const sucursalId = $('f-turno-sucursal').value;
  const fecha = $('f-turno-fecha').value;
  const hora = $('f-turno-hora').value;
  const duracion = parseInt($('dur-input').value) || 30;
  const estado = $('f-turno-estado').value;
  const motivo = $('f-turno-motivo').value.trim();

  if (!pacienteId) return alert('Selecciona un paciente.');
  if (!profesionalId) return alert('Selecciona un profesional.');
  if (!sucursalId) return alert('Selecciona una sucursal.');
  if (!fecha || !hora) return alert('Completa fecha y hora.');

  const pacienteNombre = $('f-turno-paciente').options[$('f-turno-paciente').selectedIndex].text;
  const profesionalNombre = $('f-turno-profesional').options[$('f-turno-profesional').selectedIndex].text;

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
    tratamientos_realizados: [],
    total_paciente: 0,
    total_obra_social: 0,
    creado: new Date().toISOString()
  };

  db.collection('turnos').add(turnoData)
    .then(() => {
      closeModal();
      showToast('✅ Turno creado exitosamente.');
      renderAgenda();
    })
    .catch(err => alert('❌ Error: ' + err.message));
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
    document.getElementById('f-bloqueo-profesional').innerHTML = profesionalesHTML;
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
  const profesionalId = $('f-bloqueo-profesional').value;
  const fechaInicio = $('f-bloqueo-fecha-inicio').value;
  const fechaFin = $('f-bloqueo-fecha-fin').value;
  const horaInicio = $('f-bloqueo-hora-inicio').value;
  const horaFin = $('f-bloqueo-hora-fin').value;
  const motivo = $('f-bloqueo-motivo').value.trim();

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
  document.getElementById('reprog-panel').style.display = 'none';
  document.body.classList.remove('ds-reprog-mode');
};