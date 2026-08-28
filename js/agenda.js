// ============================================================
// CONFIGURACIÓN DE FIREBASE (ya la tienes, la mantengo)
// ============================================================
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsTQoWZnMmcYwt2vjRQUPNUOKbHj3ZKqA",
  authDomain: "clinicadental1.firebaseapp.com",
  projectId: "clinicadental1",
  storageBucket: "clinicadental1.firebasestorage.app",
  messagingSenderId: "85943745725",
  appId: "1:85943745725:web:65e02bdb2c5abee1e2cbd4",
  measurementId: "G-74CV5LL9F7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================================
// CONFIGURACIÓN DE LA AGENDA (igual que en el HTML original)
// ============================================================
const HORA_INICIO = 8;          // 8:00 AM
const HORA_FIN = 20;            // 8:00 PM
const PX_POR_HORA = 128;        // 128px por hora (coincide con el HTML)
const SLOT_MINUTOS = 15;        // slots de 15 minutos
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

// Mapeo de estados (etiquetas y colores) – mismos que en el HTML
const ESTADOS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_recepcion: 'En recepción',
  en_atencion: 'En atención',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
  ausente: 'Ausente'
};
const ESTADOS_COLORS = {
  pendiente: '#6cd9f4',
  confirmado: '#395ff3',
  en_recepcion: '#f59e0b',
  en_atencion: '#d853f3',
  finalizado: '#16a34a',
  cancelado: '#9ca3af',
  ausente: '#dc2626'
};

// Plantillas de WhatsApp (igual que en el HTML)
const PLANTILLAS_WA = {
  confirmacion: {
    label: '✅ Confirmación de turno',
    mensaje: `🦷 Hola {paciente}!\n\nTu turno en {clinica} quedó confirmado ✅\n\n📅 Fecha: {fecha}\n🕒 Hora: {hora}\n👨‍⚕️ Profesional: Dr/a. {odontologo}\n📍 Ubicación: {ubicacion}\n\n¡Te esperamos! 😀`
  },
  recordatorio_24h: {
    label: '🔔 Recordatorio 24 horas',
    mensaje: `🦷 Hola {paciente}!\n\nTe recordamos que mañana tenés turno en {clinica}.\n\n📅 Fecha: {fecha}\n🕒 Hora: {hora}\n👨‍⚕️ Profesional: Dr/a. {odontologo}\n\nSi necesitás reprogramar, escribinos 😀\n\n¡Te esperamos!`
  },
  resena: {
    label: '⭐ Solicitud de reseña',
    mensaje: `🦷 Hola {paciente}!\n\nEsperamos que tu consulta en {clinica} haya sido excelente 😀\n\n⭐ ¿Podés dejarnos una reseña en Google?\nTu opinión nos ayuda muchísimo y permite que más personas conozcan nuestro trabajo.\n\n🔗 {link_resena}\n\n¡Muchas gracias por confiar en nosotros! 💙`
  }
};

const DS_TENANT_NOMBRE = "Clínica Dental Demo"; // Nombre de tu clínica

// ============================================================
// VARIABLES GLOBALES DE ESTADO
// ============================================================
let turnos = [];                 // Todos los turnos de la semana actual
let odontologoActual = null;     // UID del odontólogo autenticado
let esOdontologo = false;        // Flag (se puede ajustar según rol)
let fechaActual = new Date();
let semanaInicio = obtenerLunes(fechaActual);

// Variables para drag & drop
let dragTurnoId = null;
let dragDuracion = 0;
let dragOriginal = null;         // { fecha, hora, nombre, doc }
let pendingMover = null;

// Variables para resize
let _rzEl = null;
let _rzStartY = 0;
let _rzOrigDur = 0;
let _rzPending = 0;
let _rzMoved = false;
let _rzPaciente = '';

// Reprogramación
let _reprogData = null;          // datos del turno a reprogramar

// Atención en curso
let TURNO_EN_ATENCION = null;    // { id, paciente, odontologo }

// Listeners de Firestore
let unsubscribeTurnos = null;
let unsubscribeAtencion = null;

// Variables para la vista (se setean al cargar)
let _sseModoDia = false;
let _sseCurrentLunes = formatearFecha(semanaInicio);
let _sseOdontologoId = 0;
let _sseSucursalId = 0;

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function obtenerLunes(fecha) {
  const dia = fecha.getDay();
  const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1);
  return new Date(fecha.getFullYear(), fecha.getMonth(), diff);
}

function formatearFecha(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatearHora(hora) {
  const hh = String(Math.floor(hora)).padStart(2, '0');
  const mm = String(Math.round((hora % 1) * 60)).padStart(2, '0');
  return `${hh}:${mm}`;
}

function horaDesdeSlot(slot) {
  return HORA_INICIO + (slot * SLOT_MINUTOS) / 60;
}

function slotDesdeHora(hora) {
  return Math.round((hora - HORA_INICIO) * 60 / SLOT_MINUTOS);
}

function snapToSlot(y) {
  const totalMin = (y / PX_POR_HORA) * 60 + HORA_INICIO * 60;
  const slot = Math.floor(totalMin / SLOT_MINUTOS);
  const clampedSlot = Math.max(0, Math.min(slot, (HORA_FIN - HORA_INICIO) * 60 / SLOT_MINUTOS - 1));
  const hora = HORA_INICIO + (clampedSlot * SLOT_MINUTOS) / 60;
  const top = (hora - HORA_INICIO) * PX_POR_HORA;
  return { hora: formatearHora(hora), top: top };
}

function formatFecha(yyyy_mm_dd) {
  const p = yyyy_mm_dd.split('-');
  const d = new Date(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2]));
  const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  return dias[d.getDay()] + ' ' + d.getDate() + ' ' + MESES_ES[d.getMonth()] + ' ' + p[0];
}

function _normalizarTelefonoAr(telefono) {
  let digits = (telefono || '').replace(/\D/g, '');
  if (digits && digits.substring(0, 2) !== '54') {
    digits = '54' + digits.replace(/^0+/, '');
  }
  return digits;
}

function _esMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function showToast(msg, type) {
  // Si existe la función global notify (del dentalsoft.js) la usamos, sino alert
  if (typeof notify === 'function') {
    notify(msg, type || 'warning');
  } else {
    alert(msg);
  }
}

// ============================================================
// RENDERIZADO DE LA AGENDA (genera el HTML igual al original)
// ============================================================
function renderizarAgenda() {
  const wrap = document.getElementById('cal-wrap');
  if (!wrap) return;

  // Obtener la semana actual (lunes a domingo)
  const fechas = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(semanaInicio);
    d.setDate(d.getDate() + i);
    fechas.push(formatearFecha(d));
  }

  // Construir el HTML de la agenda
  let html = `<div style="display:grid;grid-template-columns:52px repeat(7,1fr);border-bottom:2px solid var(--border)">`;
  // Cabecera
  html += `<div></div>`;
  for (let i = 0; i < 7; i++) {
    const fecha = fechas[i];
    const d = new Date(semanaInicio);
    d.setDate(d.getDate() + i);
    const esHoy = (fecha === formatearFecha(new Date()));
    const numTurnos = turnos.filter(t => t.fecha === fecha).length;
    const claseDia = esHoy ? ' style="background:var(--accent-light,#e8f4f8)"' : '';
    html += `<div data-col-idx="${i}" style="padding:10px 8px;text-align:center;border-left:1px solid var(--border);${claseDia}">
      <div style="font-size:11px;color:var(--text-muted);font-weight:500">${DIAS_SEMANA[i]}</div>
      <div style="font-size:20px;font-weight:800;color:var(--text);line-height:1.2">${d.getDate()}</div>
      ${numTurnos > 0 ? `<div style="font-size:10px;color:var(--text-muted)">${numTurnos} turnos</div>` : ''}
    </div>`;
  }
  html += `</div>`;

  // Cuerpo: columnas de horas y celdas
  html += `<div style="display:grid;grid-template-columns:52px repeat(7,1fr);overflow-y:auto;max-height:1556px" id="cal-body">`;

  // Columna de horas
  html += `<div style="position:relative;height:1536px">`;
  for (let h = HORA_INICIO; h <= HORA_FIN; h += 1) {
    const top = (h - HORA_INICIO) * PX_POR_HORA;
    html += `<div style="position:absolute;top:${top}px;right:6px;font-size:10px;color:var(--text-muted);line-height:1">${String(h).padStart(2,'0')}:00</div>`;
  }
  html += `</div>`;

  // Columnas de días
  for (let i = 0; i < 7; i++) {
    const fecha = fechas[i];
    const esHoy = (fecha === formatearFecha(new Date()));
    const claseCol = esHoy ? ' style="background:#fafeff"' : '';
    html += `<div class="cal-col" data-fecha="${fecha}" data-col-idx="${i}" style="position:relative;height:1536px;border-left:1px solid var(--border);${claseCol}">`;

    // Fondo alternado (cada SLOT_MINUTOS)
    const totalSlots = (HORA_FIN - HORA_INICIO) * 60 / SLOT_MINUTOS;
    for (let slot = 0; slot < totalSlots; slot++) {
      const top = slot * (PX_POR_HORA * SLOT_MINUTOS / 60);
      if (slot % 2 === 0) {
        html += `<div style="position:absolute;top:${top}px;left:0;right:0;height:${PX_POR_HORA * SLOT_MINUTOS / 60}px;background:#f0f7ff;pointer-events:none;z-index:0"></div>`;
      }
    }

    // Líneas de hora (cada hora)
    for (let h = HORA_INICIO; h <= HORA_FIN; h++) {
      const top = (h - HORA_INICIO) * PX_POR_HORA;
      const border = h === HORA_INICIO ? 'transparent' : '#dde8f0';
      html += `<div style="position:absolute;top:${top}px;left:0;right:0;border-top:1px solid ${border};pointer-events:none;z-index:1"></div>`;
    }
    // Líneas de sub-slot (cada SLOT_MINUTOS)
    for (let slot = 1; slot < totalSlots; slot++) {
      const top = slot * (PX_POR_HORA * SLOT_MINUTOS / 60);
      if (slot % 4 !== 0) { // cada 15 min, pero no las horas exactas
        html += `<div style="position:absolute;top:${top}px;left:0;right:0;border-top:1px dashed #e8edf2;pointer-events:none;z-index:1"></div>`;
      }
    }

    // Zona click para crear turno
    html += `<div class="day-create-link" data-fecha="${fecha}" data-odontologo="0" style="position:absolute;inset:0;z-index:2;cursor:pointer" title="Crear turno"></div>`;

    // Turnos de este día
    const turnosDelDia = turnos.filter(t => t.fecha === fecha);
    // Agrupar por hora (para calcular solapamientos)
    const grupos = {};
    turnosDelDia.forEach(t => {
      const key = t.hora.toFixed(2);
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(t);
    });
    // Para cada grupo, calcular columnas (simplificado: asumimos que no se solapan en el mismo slot)
    // En el HTML original, se usa data-orig-right-pct para manejar solapamientos, pero aquí simplificamos
    // asignando un ancho completo a cada turno (se superponen si coinciden)
    // Podemos mejorar con un algoritmo de columnas, pero por ahora dejamos que se superpongan.

    turnosDelDia.forEach(turno => {
      const durSlots = Math.round(turno.duracion / SLOT_MINUTOS);
      const top = (turno.hora - HORA_INICIO) * PX_POR_HORA;
      const height = durSlots * (PX_POR_HORA * SLOT_MINUTOS / 60);
      const color = ESTADOS_COLORS[turno.estado] || '#355063';
      const esCancelado = (turno.estado === 'cancelado' || turno.estado === 'ausente');
      const esUrgencia = turno.urgencia || false;

      // Construir el data-popup (objeto JSON)
      const popupData = {
        id: turno.id,
        paciente: turno.pacienteNombre || 'Paciente',
        paciente_nombre: turno.pacienteNombre || 'Paciente',
        telefono: turno.telefono || '',
        duracion: turno.duracion,
        hora: `${formatearHora(turno.hora)} – ${formatearHora(turno.hora + turno.duracion/60)}`,
        hora_inicio: formatearHora(turno.hora),
        fecha: turno.fecha,
        trat: turno.tratamiento || '',
        doc: turno.odontologoNombre || 'Odontólogo',
        odontologo_nombre: turno.odontologoNombre || 'Odontólogo',
        estado: turno.estado || 'pendiente',
        color: color,
        urgencia: esUrgencia,
        edit_url: `/editar-turno?id=${turno.id}`,
        reprog_url: `/crear-turno?fecha=${turno.fecha}&odontologo=${turno.odontologoId || ''}`,
        del_url: `/eliminar-turno/${turno.id}`,
        pago_url: turno.tratamiento ? `/caja/registrar?turno_id=${turno.id}` : '',
        tratamientos: turno.tratamientos || [],
        total: turno.total || 0,
        link_confirmar: '',
        link_cancelar: '',
        ubicacion: turno.ubicacion || ''
      };

      const popupJson = JSON.stringify(popupData).replace(/"/g, '&quot;');

      html += `<div class="turno-block" draggable="true" data-id="${turno.id}" data-dur="${turno.duracion}" data-popup='${popupJson}' data-fw-fecha="${turno.fecha}" data-fw-hora="${formatearHora(turno.hora)}" data-fw-odo="${turno.odontologoId || ''}" data-orig-right-pct="0" style="position:absolute;left:calc(0% + 1px);right:calc(0% + 1px);top:${top}px;height:${height}px;background:${color};border-radius:5px;padding:3px 5px;overflow:hidden;z-index:3;cursor:pointer;opacity:${esCancelado ? 0.5 : 1};transition:right .18s ease;">
        <div style="font-size:10px;font-weight:700;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none">
          ${formatearHora(turno.hora)} ${turno.pacienteNombre || 'Paciente'}
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:1px;pointer-events:none">
          <span style="font-size:9px;font-weight:700;color:#fff;background:${color};border-radius:3px;padding:1px 5px;white-space:nowrap;flex-shrink:0">${ESTADOS_LABELS[turno.estado] || turno.estado}</span>
          ${turno.tratamiento ? `<span style="font-size:9px;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${turno.tratamiento}</span>` : ''}
        </div>
        <div class="resize-handle" style="position:absolute;bottom:0;left:0;right:0;height:8px;cursor:ns-resize;display:flex;align-items:center;justify-content:center;z-index:4" title="Arrastrar para cambiar duración">
          <div style="width:20px;height:2px;background:rgba(255,255,255,.6);border-radius:2px;pointer-events:none"></div>
        </div>
      </div>`;

      // Botón "+" para crear turno en el mismo slot
      html += `<div class="quick-add-btn" style="position:absolute;right:calc(0% + 1px);top:${top}px;height:${height}px;width:0;overflow:hidden;z-index:4;background:#f1f5f9;border-left:1px solid #cbd5e1;border-radius:0 5px 5px 0;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;cursor:pointer;transition:width .18s ease,opacity .15s ease;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" style="pointer-events:none;flex-shrink:0">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>`;
    });

    html += `</div>`; // fin cal-col
  }

  html += `</div>`; // fin cal-body
  html += `</div>`; // fin cal-wrap

  wrap.innerHTML = html;

  // Reasignar eventos
  attachAgendaListeners();
  updateNowLine();
}

// ============================================================
// CARGA DE DATOS DESDE FIRESTORE
// ============================================================
function cargarTurnosSemana(fechaInicio) {
  if (unsubscribeTurnos) {
    unsubscribeTurnos();
    unsubscribeTurnos = null;
  }

  const inicioStr = formatearFecha(fechaInicio);
  const fin = new Date(fechaInicio);
  fin.setDate(fin.getDate() + 7);
  const finStr = formatearFecha(fin);

  const q = query(
    collection(db, 'turnos'),
    where('fecha', '>=', inicioStr),
    where('fecha', '<', finStr),
    orderBy('fecha'),
    orderBy('hora')
  );

  unsubscribeTurnos = onSnapshot(q, (snapshot) => {
    turnos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      turnos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      });
    });
    renderizarAgenda();
    // También actualizar contadores de turnos en cabeceras (opcional)
  }, (error) => {
    console.error('Error en listener de turnos:', error);
    showToast('Error al cargar turnos', 'error');
  });
}

function cargarAtencionActual() {
  if (unsubscribeAtencion) {
    unsubscribeAtencion();
    unsubscribeAtencion = null;
  }

  if (!odontologoActual) return;

  const q = query(
    collection(db, 'turnos'),
    where('odontologoId', '==', odontologoActual),
    where('estado', '==', 'en_atencion'),
    limit(1)
  );

  unsubscribeAtencion = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      TURNO_EN_ATENCION = { id: doc.id, paciente: data.pacienteNombre || 'Paciente', odontologo: data.odontologoNombre || 'Odontólogo' };
    } else {
      TURNO_EN_ATENCION = null;
    }
    actualizarPanelAtencion();
  }, (error) => {
    console.error('Error en listener de atención:', error);
  });
}

// ============================================================
// PANEL DE ATENCIÓN EN CURSO
// ============================================================
function actualizarPanelAtencion() {
  const panel = document.getElementById('atencion-panel');
  if (!panel) return;

  if (TURNO_EN_ATENCION) {
    panel.style.display = 'inline-flex';
    document.getElementById('ap-paciente').textContent = TURNO_EN_ATENCION.paciente;
    document.getElementById('ap-hora').textContent = ''; // podrías mostrar más datos
    document.getElementById('ap-btn').onclick = function() {
      finalizarAtencion(TURNO_EN_ATENCION.id);
    };
  } else {
    panel.style.display = 'none';
  }
}

function finalizarAtencion(id) {
  if (!id) return;
  updateDoc(doc(db, 'turnos', id), {
    estado: 'finalizado',
    updatedAt: serverTimestamp()
  }).then(() => {
    showToast('Atención finalizada', 'success');
  }).catch(err => {
    console.error(err);
    showToast('Error al finalizar atención', 'error');
  });
}

// ============================================================
// EVENTOS Y LISTENERS (se re-ejecutan tras cada renderizado)
// ============================================================
function attachAgendaListeners() {
  // ---------- CLICK EN TURNO: POPUP ----------
  document.querySelectorAll('.turno-block').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const popupData = JSON.parse(this.dataset.popup.replace(/&quot;/g, '"'));
      mostrarPopupTurno(popupData, this);
    });
  });

  // ---------- DRAG & DROP ----------
  document.querySelectorAll('.turno-block').forEach(el => {
    el.addEventListener('dragstart', function(e) {
      dragTurnoId = this.dataset.id;
      dragDuracion = parseInt(this.dataset.dur || 30);
      const pop = JSON.parse(this.dataset.popup.replace(/&quot;/g, '"'));
      dragOriginal = {
        fecha: pop.fecha || '',
        hora: pop.hora_inicio || '',
        nombre: pop.paciente || '',
        doc: pop.doc || ''
      };
      e.dataTransfer.effectAllowed = 'move';
      this.style.opacity = '0.4';
      closePopup();
    });
    el.addEventListener('dragend', function() {
      this.style.opacity = '';
    });
  });

  document.querySelectorAll('.cal-col').forEach(col => {
    col.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      let ind = col.querySelector('.drop-indicator');
      if (!ind) {
        ind = document.createElement('div');
        ind.className = 'drop-indicator';
        ind.style.cssText = 'position:absolute;left:2px;right:2px;height:2px;background:var(--primary);z-index:20;pointer-events:none;border-radius:2px';
        col.appendChild(ind);
      }
      const rect = col.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const snap = snapToSlot(y);
      ind.style.top = snap.top + 'px';
    });
    col.addEventListener('dragleave', function() {
      const ind = col.querySelector('.drop-indicator');
      if (ind) ind.remove();
    });
    col.addEventListener('drop', function(e) {
      e.preventDefault();
      const ind = col.querySelector('.drop-indicator');
      if (ind) ind.remove();
      if (!dragTurnoId) return;
      const fecha = this.dataset.fecha;
      const rect = this.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const snap = snapToSlot(y);
      showConfirmMover(dragTurnoId, fecha, snap.hora);
    });
  });

  // ---------- CLICK EN CELDA VACÍA (crear turno) ----------
  document.querySelectorAll('.day-create-link').forEach(el => {
    el.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const snap = snapToSlot(y);
      // Si estamos en modo reprogramación, usar ese turno
      if (_reprogData) {
        dragOriginal = {
          fecha: _reprogData.fecha,
          hora: _reprogData.hora_inicio,
          nombre: _reprogData.paciente,
          doc: _reprogData.doc
        };
        showConfirmMover(_reprogData.turnoId, this.dataset.fecha, snap.hora);
        return;
      }
      const fecha = this.dataset.fecha;
      const url = `/crear-turno?fecha=${fecha}&hora=${snap.hora}`;
      window.location.href = url;
    });
  });

  // ---------- RESIZE ----------
  document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      _rzEl = this.closest('.turno-block');
      _rzStartY = e.clientY;
      _rzOrigDur = parseInt(_rzEl.dataset.dur || 30);
      _rzPending = _rzOrigDur;
      _rzMoved = false;
      const pop = JSON.parse(_rzEl.dataset.popup.replace(/&quot;/g, '"'));
      _rzPaciente = pop.paciente || '';
      document.addEventListener('mousemove', _rzMove);
      document.addEventListener('mouseup', _rzUp);
    });
    handle.addEventListener('click', function(e) { e.stopPropagation(); });
  });

  // ---------- BOTÓN "+" (quick add) ----------
  document.querySelectorAll('.turno-block').forEach(el => {
    const btn = el.nextElementSibling;
    if (!btn || !btn.classList.contains('quick-add-btn')) return;
    const pct = parseFloat(el.dataset.origRightPct) || 0;
    let hoverTimer = null;

    function expand() {
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
      el.style.right = 'calc(' + pct + '% + 25px)';
      btn.style.width = '24px';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
    function collapse() {
      hoverTimer = null;
      el.style.right = 'calc(' + pct + '% + 1px)';
      btn.style.width = '0';
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
    }
    el.addEventListener('mouseenter', expand);
    el.addEventListener('mouseleave', function() {
      hoverTimer = setTimeout(collapse, 80);
    });
    btn.addEventListener('mouseenter', function() {
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    });
    btn.addEventListener('mouseleave', collapse);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const url = `/crear-turno?fecha=${el.dataset.fwFecha}&hora=${el.dataset.fwHora}&odontologo=${el.dataset.fwOdo}`;
      window.location.href = url;
    });
  });
}

// Funciones de resize (mousemove/mouseup)
function _rzMove(e) {
  if (!_rzEl) return;
  _rzMoved = true;
  const dy = e.clientY - _rzStartY;
  let newDur = _rzOrigDur + Math.round(dy / PX_POR_HORA * 60 / SLOT_MINUTOS) * SLOT_MINUTOS;
  newDur = Math.max(SLOT_MINUTOS, newDur);
  _rzPending = newDur;
  _rzEl.style.height = Math.max((newDur / 60) * PX_POR_HORA - 2, 20) + 'px';
}
function _rzUp() {
  document.removeEventListener('mousemove', _rzMove);
  document.removeEventListener('mouseup', _rzUp);
  if (!_rzEl || !_rzMoved || _rzPending === _rzOrigDur) { _rzEl = null; return; }
  document.getElementById('cr-old-dur').textContent = _rzOrigDur;
  document.getElementById('cr-new-dur').textContent = _rzPending;
  document.getElementById('cr-paciente').textContent = _rzPaciente;
  document.getElementById('confirm-resize-overlay').style.display = 'flex';
}

// ============================================================
// POPUP DE TURNO
// ============================================================
function mostrarPopupTurno(d, elemento) {
  const popup = document.getElementById('turno-popup');
  if (!popup) return;

  currentPopupData = d;

  document.getElementById('tp-paciente').textContent = d.paciente;
  document.getElementById('tp-hora').textContent = d.hora;
  document.getElementById('tp-dur').textContent = d.duracion ? d.duracion + ' min' : '';
  document.getElementById('tp-trat').textContent = d.trat;
  document.getElementById('tp-doc').textContent = d.doc;
  document.getElementById('tp-header').style.background = d.color;
  document.getElementById('tp-urgencia-badge').style.display = d.urgencia ? 'block' : 'none';
  document.getElementById('tp-editar').href = d.edit_url;
  document.getElementById('tp-reprogramar').href = d.reprog_url;
  const delBtn = document.getElementById('tp-eliminar');
  if (delBtn) { delBtn.dataset.url = d.del_url; delBtn.dataset.paciente = d.paciente; }

  // Tratamientos
  const trtsDiv = document.getElementById('tp-trts');
  const hayTrts = d.tratamientos && d.tratamientos.length > 0;
  if (hayTrts) {
    let html = '';
    d.tratamientos.forEach(t => {
      html += `<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:3px;color:var(--text-muted)">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.nombre}</span>
        <span style="font-weight:600;white-space:nowrap;flex-shrink:0">$${t.precio.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:0})}</span>
      </div>`;
    });
    if (d.total > 0) {
      html += `<div style="display:flex;justify-content:space-between;font-weight:700;font-size:12px;border-top:1px solid var(--border);margin-top:4px;padding-top:4px;color:var(--text)">
        <span>Total</span><span>$${d.total.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:0})}</span>
      </div>`;
    }
    trtsDiv.innerHTML = html;
    trtsDiv.style.display = 'block';
  } else {
    trtsDiv.innerHTML = '';
    trtsDiv.style.display = 'none';
  }

  // Botón pago
  const pagoBtn = document.getElementById('tp-pago');
  if (d.pago_url) {
    pagoBtn.style.display = 'block';
    if (hayTrts) {
      pagoBtn.href = d.pago_url;
      pagoBtn.style.opacity = '1';
      pagoBtn.style.pointerEvents = '';
      pagoBtn.title = '';
    } else {
      pagoBtn.removeAttribute('href');
      pagoBtn.style.opacity = '.4';
      pagoBtn.style.pointerEvents = 'none';
      pagoBtn.title = 'Agregá tratamientos al turno para registrar el pago';
    }
  } else {
    pagoBtn.style.display = 'none';
  }

  // WhatsApp
  const waWrap = document.getElementById('tp-wa-wrap');
  document.getElementById('tp-wa-menu').style.display = 'none';
  waWrap.style.display = (d.telefono && Object.keys(PLANTILLAS_WA).length > 0) ? 'block' : 'none';

  // Estados
  const estadosDiv = document.getElementById('tp-estados');
  estadosDiv.innerHTML = '';
  const estadosList = ['pendiente','confirmado','en_recepcion','en_atencion','finalizado','cancelado','ausente'];
  estadosList.forEach(est => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm';
    btn.textContent = ESTADOS_LABELS[est] || est;
    btn.style.cssText = est === d.estado
      ? 'background:' + ESTADOS_COLORS[est] + ';color:#fff;border:none;font-size:10px;padding:4px 8px'
      : 'background:#f1f5f9;color:#4a5568;border:none;font-size:10px;padding:4px 8px';
    (function(capEst) {
      btn.onclick = function() {
        if (capEst === 'en_atencion' && TURNO_EN_ATENCION && TURNO_EN_ATENCION.id !== d.id) {
          abrirConflictoAtencion(d.id, d.paciente);
        } else {
          cambiarEstado(d.id, capEst);
        }
      };
    })(est);
    estadosDiv.appendChild(btn);
  });

  // Posicionar popup
  const rect = elemento.getBoundingClientRect();
  const pw = 300, ph = 280;
  let left = rect.right + 8;
  let top = rect.top;
  if (left + pw > window.innerWidth) left = rect.left - pw - 8;
  if (top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  popup.style.display = 'block';
}

function closePopup() {
  document.getElementById('turno-popup').style.display = 'none';
  document.getElementById('tp-wa-menu').style.display = 'none';
}

// ============================================================
// FUNCIONES GLOBALES (llamadas desde onclick en el HTML)
// ============================================================

// --- Cambiar estado ---
function cambiarEstado(turnoId, estado) {
  if (estado === 'en_atencion' && TURNO_EN_ATENCION && TURNO_EN_ATENCION.id !== turnoId) {
    // El conflicto se maneja en el popup, pero si se llama directo, también
    const turno = turnos.find(t => t.id === turnoId);
    if (turno) abrirConflictoAtencion(turnoId, turno.pacienteNombre);
    return;
  }
  updateDoc(doc(db, 'turnos', turnoId), {
    estado: estado,
    updatedAt: serverTimestamp()
  }).then(() => {
    showToast(`Estado cambiado a ${ESTADOS_LABELS[estado] || estado}`, 'success');
    closePopup();
  }).catch(err => {
    console.error(err);
    showToast('Error al cambiar estado', 'error');
  });
}

// --- Eliminar turno ---
function confirmarEliminarTurno() {
  const btn = document.getElementById('tp-eliminar');
  const url = btn.dataset.url;
  const paciente = btn.dataset.paciente;
  document.getElementById('ce-paciente').textContent = paciente;
  document.getElementById('confirm-eliminar-overlay').style.display = 'flex';
  _delUrl = url;
}
let _delUrl = '';
function cerrarEliminar() {
  document.getElementById('confirm-eliminar-overlay').style.display = 'none';
  _delUrl = '';
}
function ejecutarEliminar() {
  if (!_delUrl) return;
  const id = _delUrl.split('/').pop(); // extraer ID de la URL
  deleteDoc(doc(db, 'turnos', id))
    .then(() => {
      showToast('Turno eliminado', 'success');
      cerrarEliminar();
      closePopup();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al eliminar', 'error');
    });
}

// --- WhatsApp ---
function toggleWaMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const menu = document.getElementById('tp-wa-menu');
  if (menu.style.display === 'block') { menu.style.display = 'none'; return; }
  menu.innerHTML = '';
  Object.keys(PLANTILLAS_WA).forEach(tipo => {
    const item = document.createElement('button');
    item.type = 'button';
    item.textContent = PLANTILLAS_WA[tipo].label;
    item.style.cssText = 'display:block;width:100%;text-align:left;padding:9px 12px;background:#fff;border:none;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer';
    item.onmouseenter = () => item.style.background = '#f8fafc';
    item.onmouseleave = () => item.style.background = '#fff';
    item.onclick = (ev) => { ev.stopPropagation(); enviarWaManual(tipo); menu.style.display = 'none'; };
    menu.appendChild(item);
  });
  menu.style.display = 'block';
}

function enviarWaManual(tipo) {
  const d = currentPopupData;
  if (!d || !d.telefono) return;
  const tpl = PLANTILLAS_WA[tipo];
  if (!tpl) return;
  const fechaFmt = d.fecha ? new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '';
  let mensaje = tpl.mensaje
    .replace(/\{paciente\}/g, d.paciente_nombre || d.paciente || '')
    .replace(/\{clinica\}/g, DS_TENANT_NOMBRE || '')
    .replace(/\{fecha\}/g, fechaFmt)
    .replace(/\{hora\}/g, d.hora_inicio || '')
    .replace(/\{odontologo\}/g, d.odontologo_nombre || d.doc || '')
    .replace(/\{link_confirmar\}/g, d.link_confirmar || '')
    .replace(/\{link_cancelar\}/g, d.link_cancelar || '')
    .replace(/\{ubicacion\}/g, d.ubicacion || '');
  const tel = _normalizarTelefonoAr(d.telefono);
  const base = _esMobile() ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
  const url = base + '?phone=' + tel + '&text=' + encodeURIComponent(mensaje);
  window.open(url, '_blank');
}

// --- Reprogramación ---
function iniciarReprogramar() {
  if (!currentPopupData) return;
  _reprogData = {
    turnoId: currentPopupData.id,
    paciente: currentPopupData.paciente,
    hora: currentPopupData.hora,
    hora_inicio: currentPopupData.hora_inicio,
    fecha: currentPopupData.fecha,
    doc: currentPopupData.doc,
    color: currentPopupData.color
  };
  sessionStorage.setItem('ds_reprog', JSON.stringify(_reprogData));
  closePopup();
  // Mostrar panel de reprogramación
  document.getElementById('rp-paciente').textContent = _reprogData.paciente;
  let info = _reprogData.hora;
  if (_reprogData.fecha) {
    const d = new Date(_reprogData.fecha + 'T00:00:00');
    info = DIAS_SEMANA[d.getDay()] + ' ' + d.getDate() + ' ' + MESES_ES[d.getMonth()] + ' · ' + _reprogData.hora;
  }
  if (_reprogData.doc) info += ' · ' + _reprogData.doc;
  document.getElementById('rp-info').textContent = info;
  document.getElementById('reprog-panel').style.display = 'flex';
  document.body.classList.add('ds-reprog-mode');
}

function exitReprogramarMode() {
  sessionStorage.removeItem('ds_reprog');
  _reprogData = null;
  document.getElementById('reprog-panel').style.display = 'none';
  document.body.classList.remove('ds-reprog-mode');
}

// --- Confirmar mover (drag & drop y reprogramación) ---
function showConfirmMover(turnoId, fecha, hora) {
  pendingMover = { turnoId, fecha, hora };
  const orig = dragOriginal || {};
  document.getElementById('cm-old-fecha').textContent = orig.fecha ? formatFecha(orig.fecha) : '';
  document.getElementById('cm-old-hora').textContent = orig.hora || '';
  document.getElementById('cm-old-pac').textContent = orig.nombre || '';
  document.getElementById('cm-old-doc').textContent = orig.doc || '';
  document.getElementById('cm-new-fecha').textContent = formatFecha(fecha);
  document.getElementById('cm-new-hora').textContent = hora;
  document.getElementById('cm-new-pac').textContent = orig.nombre || '';
  document.getElementById('cm-new-doc').textContent = orig.doc || '';
  document.getElementById('confirm-mover-overlay').style.display = 'flex';
}

function confirmarMover() {
  document.getElementById('confirm-mover-overlay').style.display = 'none';
  if (!pendingMover) return;
  const { turnoId, fecha, hora } = pendingMover;
  // Convertir hora string a número (ej. "14:30" -> 14.5)
  const [hh, mm] = hora.split(':').map(Number);
  const horaNum = hh + mm/60;
  updateDoc(doc(db, 'turnos', turnoId), {
    fecha: fecha,
    hora: horaNum,
    updatedAt: serverTimestamp()
  }).then(() => {
    showToast('Turno movido correctamente', 'success');
    pendingMover = null;
    dragTurnoId = null;
    dragOriginal = null;
    // Salir del modo reprogramación si está activo
    exitReprogramarMode();
  }).catch(err => {
    console.error(err);
    showToast('Error al mover', 'error');
  });
}

function cancelarMover() {
  document.getElementById('confirm-mover-overlay').style.display = 'none';
  pendingMover = null;
  dragTurnoId = null;
  dragOriginal = null;
}

// --- Confirmar resize ---
function confirmarResize() {
  document.getElementById('confirm-resize-overlay').style.display = 'none';
  if (!_rzEl) return;
  const id = _rzEl.dataset.id;
  const newDur = _rzPending;
  _rzEl = null;
  updateDoc(doc(db, 'turnos', id), {
    duracion: newDur,
    updatedAt: serverTimestamp()
  }).then(() => {
    showToast('Duración actualizada', 'success');
  }).catch(err => {
    console.error(err);
    showToast('Error al redimensionar', 'error');
  });
}

function cancelarResize() {
  document.getElementById('confirm-resize-overlay').style.display = 'none';
  if (_rzEl) _rzEl.style.height = Math.max((_rzOrigDur / 60) * PX_POR_HORA - 2, 20) + 'px';
  _rzEl = null;
}

// --- Conflicto de atención ---
let _cacNuevoId = null;
let _cacNuevoPaciente = null;

function abrirConflictoAtencion(nuevoId, nuevoPaciente) {
  _cacNuevoId = nuevoId;
  _cacNuevoPaciente = nuevoPaciente;
  const elActual = document.getElementById('cac-actual');
  const elPrefijo = document.getElementById('cac-prefijo');
  if (esOdontologo) {
    document.getElementById('cac-titulo').textContent = 'Ya estás atendiendo un turno';
    elPrefijo.textContent = 'Actualmente estás atendiendo a ';
  } else {
    document.getElementById('cac-titulo').textContent = 'El profesional se encuentra ocupado';
    elPrefijo.textContent = TURNO_EN_ATENCION.odontologo + ' se encuentra atendiendo a ';
  }
  elActual.textContent = TURNO_EN_ATENCION.paciente;
  document.getElementById('cac-nuevo').textContent = nuevoPaciente;
  document.getElementById('modal-conflicto-atencion').style.display = 'flex';
  closePopup();
}

function cerrarConflictoAtencion() {
  document.getElementById('modal-conflicto-atencion').style.display = 'none';
  _cacNuevoId = null;
  _cacNuevoPaciente = null;
}

function finalizarYAtender() {
  document.getElementById('modal-conflicto-atencion').style.display = 'none';
  const idFinalizar = TURNO_EN_ATENCION.id;
  const nuevoId = _cacNuevoId;
  _cacNuevoId = null;
  _cacNuevoPaciente = null;
  // Finalizar el actual
  updateDoc(doc(db, 'turnos', idFinalizar), {
    estado: 'finalizado',
    updatedAt: serverTimestamp()
  }).then(() => {
    // Poner el nuevo en atención
    return updateDoc(doc(db, 'turnos', nuevoId), {
      estado: 'en_atencion',
      updatedAt: serverTimestamp()
    });
  }).then(() => {
    showToast('Atención iniciada', 'success');
  }).catch(err => {
    console.error(err);
    showToast('Error al cambiar atención', 'error');
  });
}

// ============================================================
// LÍNEA DE HORA ACTUAL
// ============================================================
function updateNowLine() {
  const line = document.getElementById('now-line');
  if (!line) return;
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  const top = (h - HORA_INICIO) * PX_POR_HORA;
  line.style.top = top + 'px';
}
setInterval(updateNowLine, 60000);

// ============================================================
// INICIALIZACIÓN
// ============================================================
function init() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      odontologoActual = user.uid;
      // Aquí podrías consultar el rol del usuario (esOdontologo)
      // Por ahora lo dejamos en false, pero puedes cambiarlo según tu lógica
      esOdontologo = false;
      // Cargar datos
      cargarTurnosSemana(semanaInicio);
      cargarAtencionActual();
      // Restaurar modo reprogramación desde sessionStorage
      try {
        const stored = JSON.parse(sessionStorage.getItem('ds_reprog'));
        if (stored) {
          _reprogData = stored;
          // Mostrar panel
          document.getElementById('rp-paciente').textContent = _reprogData.paciente;
          let info = _reprogData.hora;
          if (_reprogData.fecha) {
            const d = new Date(_reprogData.fecha + 'T00:00:00');
            info = DIAS_SEMANA[d.getDay()] + ' ' + d.getDate() + ' ' + MESES_ES[d.getMonth()] + ' · ' + _reprogData.hora;
          }
          if (_reprogData.doc) info += ' · ' + _reprogData.doc;
          document.getElementById('rp-info').textContent = info;
          document.getElementById('reprog-panel').style.display = 'flex';
          document.body.classList.add('ds-reprog-mode');
        }
      } catch(e) {}
    } else {
      // Usuario no autenticado - redirigir al login o mostrar mensaje
      console.warn('Usuario no autenticado');
    }
  });
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', init);
