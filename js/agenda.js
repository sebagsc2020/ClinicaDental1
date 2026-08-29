// ============================================================
// AGENDA.JS (compat, sin dependencia de autenticación)
// ============================================================

const HORA_INICIO = 8;
const HORA_FIN = 20;
const PX_POR_HORA = 128;
const SLOT_MINUTOS = 15;
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const ESTADOS_LABELS = { pendiente: 'Pendiente', confirmado: 'Confirmado', en_recepcion: 'En recepción', en_atencion: 'En atención', finalizado: 'Finalizado', cancelado: 'Cancelado', ausente: 'Ausente' };
const ESTADOS_COLORS = { pendiente: '#6cd9f4', confirmado: '#395ff3', en_recepcion: '#f59e0b', en_atencion: '#d853f3', finalizado: '#16a34a', cancelado: '#9ca3af', ausente: '#dc2626' };

let turnos = [];
let semanaInicio = obtenerLunes(new Date());
let unsubscribeTurnos = null;

// ─── Funciones básicas ──────────────────────────────────────
function obtenerLunes(fecha) { const dia = fecha.getDay(); const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); return new Date(fecha.getFullYear(), fecha.getMonth(), diff); }
function formatearFecha(fecha) { const y = fecha.getFullYear(); const m = String(fecha.getMonth() + 1).padStart(2, '0'); const d = String(fecha.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
function formatearHora(hora) { const hh = String(Math.floor(hora)).padStart(2, '0'); const mm = String(Math.round((hora % 1) * 60)).padStart(2, '0'); return `${hh}:${mm}`; }
function snapToSlot(y) { const totalMin = (y / PX_POR_HORA) * 60 + HORA_INICIO * 60; const slot = Math.floor(totalMin / SLOT_MINUTOS); const clampedSlot = Math.max(0, Math.min(slot, (HORA_FIN - HORA_INICIO) * 60 / SLOT_MINUTOS - 1)); const hora = HORA_INICIO + (clampedSlot * SLOT_MINUTOS) / 60; return { hora: formatearHora(hora), top: (hora - HORA_INICIO) * PX_POR_HORA }; }
function showToast(msg, type) { if (typeof window.showToast === 'function') { window.showToast(msg, type); } else { alert(msg); } }

// ─── SOLUCIÓN 404: Navegación por Hash y MODAL ───────────────
function navigateToRuta(ruta) { window.location.hash = ruta; }

function handleHashChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#/crear-turno')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        const fecha = params.get('fecha') || formatearFecha(new Date());
        abrirNuevoTurno(fecha);
    }
}
window.addEventListener('hashchange', handleHashChange);

// ─── Lógica del Modal Nuevo Turno ────────────────────────────
window.abrirNuevoTurno = function(fecha) {
    if (typeof navigateTo === 'function') navigateTo('agenda');
    const modal = document.getElementById('modal-nuevo-turno');
    if (!modal) return;
    document.getElementById('input-fecha').value = fecha || formatearFecha(new Date());
    cargarOpcionesModal();
    modal.style.display = 'flex';
};

window.cerrarModalNuevoTurno = function() {
    document.getElementById('modal-nuevo-turno').style.display = 'none';
};

window.handleManualInput = function(tipo) {
    const select = document.getElementById(tipo + '-select');
    const manual = document.getElementById(tipo + '-manual');
    if (select.value === 'manual') { manual.style.display = 'block'; } else { manual.style.display = 'none'; }
};

function cargarOpcionesModal() {
    const db = firebase.firestore();
    
    db.collection('pacientes').get().then(snapshot => {
        let html = '<option value="">— Seleccionar paciente —</option>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const nombre = data.nombre || data.pacienteNombre || 'Sin nombre';
            html += `<option value="${doc.id}">${nombre}</option>`;
        });
        html += '<option value="manual">✍️ Escribir manualmente</option>';
        document.getElementById('paciente-select').innerHTML = html;
    }).catch(err => {
        console.error("Error cargando pacientes:", err);
        document.getElementById('paciente-select').innerHTML = '<option value="">Error al cargar</option><option value="manual">✍️ Escribir manualmente</option>';
    });
    
    db.collection('profesionales').get().then(snapshot => {
        let html = '<option value="">— Seleccionar profesional —</option>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const nombre = data.nombre || data.odontologoNombre || 'Sin nombre';
            html += `<option value="${doc.id}">${nombre}</option>`;
        });
        html += '<option value="manual">✍️ Escribir manualmente</option>';
        document.getElementById('odontologo-select').innerHTML = html;
    }).catch(err => {
        console.error("Error cargando profesionales:", err);
        document.getElementById('odontologo-select').innerHTML = '<option value="">Error al cargar</option><option value="manual">✍️ Escribir manualmente</option>';
    });
    
    db.collection('tratamientos').get().then(snapshot => {
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const nombre = data.nombre || 'Tratamiento';
            const precio = data.precio || 0;
            html += `<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;border-top:1px solid var(--border)">
                        <input type="checkbox" class="trt-check" value="${doc.id}" data-precio="${precio}" data-nombre="${nombre}" onchange="recalcPrecioModal()" style="width:15px;height:15px;">
                        <span style="flex:1;font-size:13px;">${nombre}</span>
                        <span style="font-size:13px;font-weight:600;">$${precio.toLocaleString()}</span>
                    </label>`;
        });
        if (!html) html = '<div style="padding:10px;font-size:12px;color:var(--text-muted)">No hay tratamientos cargados en Firestore.</div>';
        document.getElementById('tratamientos-lista').innerHTML = html;
    }).catch(err => {
        console.error("Error cargando tratamientos:", err);
        document.getElementById('tratamientos-lista').innerHTML = '<div style="padding:10px;font-size:12px;color:var(--text-muted)">Error al cargar tratamientos.</div>';
    });
}

window.recalcPrecioModal = function() {
    let total = 0;
    document.querySelectorAll('.trt-check:checked').forEach(cb => {
        total += parseFloat(cb.dataset.precio) || 0;
    });
    document.getElementById('trt-total-val').textContent = total.toLocaleString();
};

window.guardarNuevoTurno = function() {
    const db = firebase.firestore();
    const selectPaciente = document.getElementById('paciente-select');
    const selectOdontologo = document.getElementById('odontologo-select');
    
    let paciente = selectPaciente.value === 'manual' 
        ? document.getElementById('paciente-manual').value 
        : selectPaciente.selectedOptions[0].textContent;
    
    let odontologo = selectOdontologo.value === 'manual' 
        ? document.getElementById('odontologo-manual').value 
        : selectOdontologo.selectedOptions[0].textContent;
    
    if (!paciente || !odontologo) { alert("Debes seleccionar o escribir un paciente y un profesional."); return; }

    const fecha = document.getElementById('input-fecha').value;
    const horaInicio = document.getElementById('input-hora').value;
    const duracion = parseInt(document.getElementById('dur-input').value);
    const estado = document.getElementById('estado-select').value;
    const esUrgencia = document.getElementById('check-urgencia').checked;
    const motivo = document.getElementById('input-motivo').value;

    const [hh, mm] = horaInicio.split(':').map(Number);
    const horaNum = hh + (mm / 60);

    const tratamientos = [];
    document.querySelectorAll('.trt-check:checked').forEach(cb => {
        tratamientos.push({ id: cb.value, nombre: cb.dataset.nombre, precio: parseFloat(cb.dataset.precio) });
    });
    const total = tratamientos.reduce((sum, t) => sum + t.precio, 0);

    // Guardar en Firestore (compatible con tu estructura actual)
    db.collection('turnos').add({
        fecha: fecha,
        hora: horaNum,
        duracion: duracion,
        estado: estado,
        paciente: paciente,
        pacienteNombre: paciente,
        profesional: odontologo,
        odontologoNombre: odontologo,
        es_urgencia: esUrgencia,
        urgencia: esUrgencia,
        motivo: motivo,
        tratamientos: tratamientos,
        total: total,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        cerrarModalNuevoTurno();
        showToast('Turno creado correctamente', 'success');
    }).catch(err => {
        console.error("Error al crear turno:", err);
        showToast('Error al crear el turno', 'error');
    });
};

// ─── Renderizado de la agenda ──────────────────────────────
function renderizarAgenda() {
  const wrap = document.getElementById('cal-wrap');
  if (!wrap) return;
  const inicio = new Date(semanaInicio);
  const fin = new Date(semanaInicio); fin.setDate(fin.getDate() + 6);
  document.getElementById('semana-label').textContent = inicio.toLocaleDateString('es-AR', {day:'numeric', month:'short'}) + ' – ' + fin.toLocaleDateString('es-AR', {day:'numeric', month:'short'});

  const fechas = [];
  for (let i = 0; i < 7; i++) { const d = new Date(semanaInicio); d.setDate(d.getDate() + i); fechas.push(formatearFecha(d)); }

  let html = `<div style="display:grid;grid-template-columns:52px repeat(7,1fr);border-bottom:2px solid var(--border)">`;
  html += `<div></div>`;
  for (let i = 0; i < 7; i++) {
    const fecha = fechas[i];
    const d = new Date(semanaInicio); d.setDate(d.getDate() + i);
    const esHoy = (fecha === formatearFecha(new Date()));
    const numTurnos = turnos.filter(t => t.fecha === fecha).length;
    html += `<div data-col-idx="${i}" style="padding:10px 8px;text-align:center;border-left:1px solid var(--border);${esHoy ? 'background:#e8f0fe;' : ''}">
      <div style="font-size:11px;color:var(--text-muted)">${DIAS_SEMANA[i]}</div>
      <div style="font-size:20px;font-weight:800">${d.getDate()}</div>
      ${numTurnos > 0 ? `<div style="font-size:10px;color:var(--text-muted)">${numTurnos} turnos</div>` : ''}
    </div>`;
  }
  html += `</div><div style="display:grid;grid-template-columns:52px repeat(7,1fr);overflow-y:auto;max-height:1556px" id="cal-body">`;
  
  // Columna de horas
  html += `<div style="position:relative;height:1536px">`;
  for (let h = HORA_INICIO; h <= HORA_FIN; h += 1) { const top = (h - HORA_INICIO) * PX_POR_HORA; html += `<div style="position:absolute;top:${top}px;right:6px;font-size:10px;color:var(--text-muted)">${String(h).padStart(2,'0')}:00</div>`; }
  html += `</div>`;

  // Columnas de días
  for (let i = 0; i < 7; i++) {
    const fecha = fechas[i];
    html += `<div class="cal-col" data-fecha="${fecha}" data-col-idx="${i}" style="position:relative;height:1536px;border-left:1px solid var(--border)">`;
    
    // Líneas de fondo
    for (let h = HORA_INICIO; h <= HORA_FIN; h++) { html += `<div style="position:absolute;top:${(h - HORA_INICIO) * PX_POR_HORA}px;left:0;right:0;border-top:1px solid #dde8f0;pointer-events:none;z-index:1"></div>`; }
    
    // Link para crear
    html += `<div class="day-create-link" data-fecha="${fecha}" data-odontologo="0" style="position:absolute;inset:0;z-index:2;cursor:pointer" title="Crear turno"></div>`;

    // Turnos
    const turnosDelDia = turnos.filter(t => t.fecha === fecha);
    turnosDelDia.forEach(turno => {
      const durSlots = Math.round(turno.duracion / SLOT_MINUTOS);
      const horaNum = typeof turno.hora === 'number' ? turno.hora : parseFloat(turno.hora);
      const top = (horaNum - HORA_INICIO) * PX_POR_HORA;
      const height = durSlots * (PX_POR_HORA * SLOT_MINUTOS / 60);
      const color = ESTADOS_COLORS[turno.estado] || '#355063';
      const esCancelado = (turno.estado === 'cancelado' || turno.estado === 'ausente');
      const esUrgencia = turno.urgencia || false;

      const nombrePaciente = turno.paciente || turno.pacienteNombre || 'Paciente';
      const nombreOdontologo = turno.profesional || turno.odontologoNombre || 'Odontólogo';

      html += `<div class="turno-block" draggable="true" data-id="${turno.id}" data-dur="${turno.duracion}" data-fw-fecha="${turno.fecha}" data-fw-hora="${formatearHora(horaNum)}" style="position:absolute;left:calc(0% + 1px);right:calc(0% + 1px);top:${top}px;height:${height}px;background:${color};border-radius:5px;padding:3px 5px;overflow:hidden;z-index:3;cursor:pointer;opacity:${esCancelado ? 0.5 : 1};">
        <div style="font-size:10px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none">${formatearHora(horaNum)} ${nombrePaciente}</div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:1px;pointer-events:none">
          <span style="font-size:9px;font-weight:700;color:#fff;background:${color};border-radius:3px;padding:1px 5px;white-space:nowrap;flex-shrink:0">${ESTADOS_LABELS[turno.estado] || turno.estado}</span>
          ${turno.tratamiento ? `<span style="font-size:9px;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${turno.tratamiento}</span>` : ''}
        </div>
      </div>`;
    });

    html += `</div>`;
  }

  html += `</div>`;
  wrap.innerHTML = html;
  attachAgendaListeners();
}

// ─── Carga de datos desde Firestore ─────────────────────────
function cargarTurnosSemana(fechaInicio) {
  if (unsubscribeTurnos) { unsubscribeTurnos(); unsubscribeTurnos = null; }
  const db = firebase.firestore();
  const inicioStr = formatearFecha(fechaInicio);
  const fin = new Date(fechaInicio); fin.setDate(fin.getDate() + 7);

  const q = db.collection('turnos')
    .where('fecha', '>=', inicioStr)
    .where('fecha', '<', formatearFecha(fin))
    .orderBy('fecha')
    .orderBy('hora');

  unsubscribeTurnos = q.onSnapshot((snapshot) => {
    turnos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      turnos.push({ id: doc.id, ...data });
    });
    renderizarAgenda();
  }, (error) => {
    console.error('Error en listener de turnos:', error);
    showToast('Error al cargar turnos', 'error');
  });
}

// ─── Eventos y listeners ─────────────────────────────────────
function attachAgendaListeners() {
  // Click en turno
  document.querySelectorAll('.turno-block').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const turno = turnos.find(t => t.id === this.dataset.id);
      if (turno) mostrarPopupTurno(turno, this);
    });
  });

  // Click en celda vacía para crear
  document.querySelectorAll('.day-create-link').forEach(el => {
    el.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const snap = snapToSlot(y);
      navigateToRuta(`/crear-turno?fecha=${this.dataset.fecha}&hora=${snap.hora}`);
    });
  });
}

// ─── Popup ────────────────────────────────────────────────────
function mostrarPopupTurno(turno, elemento) {
  const popup = document.getElementById('turno-popup');
  if (!popup) return;
  
  const horaNum = typeof turno.hora === 'number' ? turno.hora : parseFloat(turno.hora);
  const color = ESTADOS_COLORS[turno.estado] || '#355063';
  
  document.getElementById('tp-paciente').textContent = turno.paciente || turno.pacienteNombre || 'Paciente';
  document.getElementById('tp-hora').textContent = `${formatearHora(horaNum)} – ${formatearHora(horaNum + turno.duracion/60)}`;
  document.getElementById('tp-dur').textContent = turno.duracion + ' min';
  document.getElementById('tp-trat').textContent = turno.tratamiento || '';
  document.getElementById('tp-doc').textContent = turno.profesional || turno.odontologoNombre || 'Odontólogo';
  document.getElementById('tp-header').style.background = color;

  const rect = elemento.getBoundingClientRect();
  popup.style.left = (rect.right + 8) + 'px';
  popup.style.top = (rect.top) + 'px';
  popup.style.display = 'block';
}

function closePopup() { document.getElementById('turno-popup').style.display = 'none'; }

// ─── Navegación entre semanas ────────────────────────────────
window.cambiarSemana = function(delta) {
  semanaInicio.setDate(semanaInicio.getDate() + delta * 7);
  cargarTurnosSemana(semanaInicio);
};

window.irHoy = function() {
  semanaInicio = obtenerLunes(new Date());
  cargarTurnosSemana(semanaInicio);
};

// ─── Inicialización ──────────────────────────────────────────
window.renderAgenda = function() {
  if (unsubscribeTurnos) { renderizarAgenda(); } else { initAgenda(); }
};

function initAgenda() {
  cargarTurnosSemana(semanaInicio);
}

// Si el DOM ya está cargado, esperar un poco para que navigation.js cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() { if (!unsubscribeTurnos) initAgenda(); }, 300);
  });
} else {
  setTimeout(function() { if (!unsubscribeTurnos) initAgenda(); }, 300);
}
