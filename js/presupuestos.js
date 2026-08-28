// ============================================================
// PRESUPUESTOS
// ============================================================

// Variables de estado
let presupuestosData = [];
let filterEstado = 'todos';
let searchQuery = '';
let presupuestosListener = null;

// Datos para el formulario
let pacientesDataForm = [];
let profesionalesDataForm = [];
let tratamientosDataForm = [];
let coberturasData = {};
let activePlanId = 0;
let activeObraSocialId = null;

// Helper
function $(id) { return document.getElementById(id); }

// ============================================================
// RENDER LISTADO DE PRESUPUESTOS
// ============================================================
function renderPresupuestos() {
  const el = $('view-presupuestos');
  if (!el) return;

  el.innerHTML = `
    <style>
      @media (max-width:768px) {
        .table th:nth-child(3), .table td:nth-child(3),
        .table th:nth-child(4), .table td:nth-child(4),
        .table th:nth-child(5), .table td:nth-child(5) { display:none }
      }
    </style>

    <div class="page-header">
      <div>
        <div class="page-title">Presupuestos</div>
        <div class="page-subtitle" id="presupuestos-count">Cargando...</div>
      </div>
      <a href="#" class="btn btn-primary" onclick="renderNuevoPresupuesto()">
        + Nuevo presupuesto
      </a>
    </div>

    <!-- Buscador -->
    <div class="card" style="margin-bottom:12px;padding:12px 16px">
      <div style="display:flex;gap:8px;align-items:center">
        <div style="position:relative;flex:1;max-width:420px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"
               style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="presupuesto-buscar" value=""
                 placeholder="Buscar por número de presupuesto o paciente…"
                 class="form-control" style="padding-left:32px"
                 oninput="aplicarFiltrosPresupuestos()" autofocus>
        </div>
        <button class="btn btn-secondary" onclick="aplicarFiltrosPresupuestos()">Buscar</button>
      </div>
    </div>

    <!-- Filtros de estado -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap" id="presupuesto-filtros">
      <a href="#" class="btn btn-sm btn-primary" data-estado="todos" onclick="setFilterEstadoPresupuesto('todos')">Todos</a>
      <a href="#" class="btn btn-sm btn-secondary" data-estado="pendiente" onclick="setFilterEstadoPresupuesto('pendiente')">Pendiente</a>
      <a href="#" class="btn btn-sm btn-secondary" data-estado="aprobado" onclick="setFilterEstadoPresupuesto('aprobado')">Aprobado</a>
      <a href="#" class="btn btn-sm btn-secondary" data-estado="rechazado" onclick="setFilterEstadoPresupuesto('rechazado')">Rechazado</a>
      <a href="#" class="btn btn-sm btn-secondary" data-estado="vencido" onclick="setFilterEstadoPresupuesto('vencido')">Vencido</a>
    </div>

    <!-- Tabla -->
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Paciente</th>
            <th>Profesional</th>
            <th>Emisión</th>
            <th>Vencimiento</th>
            <th style="text-align:right">Total</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="presupuestos-tbody">
          <tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">Cargando presupuestos...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  cargarPresupuestos();
}

// ============================================================
// CARGAR PRESUPUESTOS DESDE FIRESTORE
// ============================================================
function cargarPresupuestos() {
  if (presupuestosListener) {
    presupuestosListener();
    presupuestosListener = null;
  }

  presupuestosListener = db.collection('presupuestos')
    .orderBy('fecha_emision', 'desc')
    .onSnapshot((snapshot) => {
      presupuestosData = [];
      snapshot.forEach(doc => {
        presupuestosData.push({ id: doc.id, ...doc.data() });
      });
      aplicarFiltrosPresupuestos();
    }, (error) => {
      // Si la colección no existe, Firestore devuelve un error de permisos o de índice
      // Mostramos mensaje amigable en lugar de error
      console.warn('No se pudieron cargar presupuestos:', error);
      const tbody = $('presupuestos-tbody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">No hay presupuestos registrados. ¡Creá el primero!</td></tr>`;
      }
      const countEl = $('presupuestos-count');
      if (countEl) countEl.textContent = '0 registros';
    });
}

// ============================================================
// APLICAR FILTROS (listado)
// ============================================================
function aplicarFiltrosPresupuestos() {
  const searchInput = $('presupuesto-buscar');
  if (searchInput) searchQuery = searchInput.value.toLowerCase().trim();

  let filtered = [...presupuestosData];

  if (searchQuery) {
    filtered = filtered.filter(p => {
      const numero = (p.numero || '').toLowerCase();
      const paciente = (p.paciente_nombre || '').toLowerCase();
      return numero.includes(searchQuery) || paciente.includes(searchQuery);
    });
  }

  if (filterEstado !== 'todos') {
    filtered = filtered.filter(p => p.estado === filterEstado);
  }

  const countEl = $('presupuestos-count');
  if (countEl) {
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  }

  renderTablaPresupuestos(filtered);
}

function renderTablaPresupuestos(presupuestos) {
  const tbody = $('presupuestos-tbody');
  if (!tbody) return;

  if (presupuestos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">No hay presupuestos que coincidan con los filtros.</td></tr>`;
    return;
  }

  const estadoColores = {
    'pendiente': 'badge-amber',
    'aprobado': 'badge-green',
    'rechazado': 'badge-red',
    'vencido': 'badge-gray'
  };
  const estadoLabels = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'vencido': 'Vencido'
  };

  let html = '';
  presupuestos.forEach(p => {
    const numero = p.numero || `PRES-${String(p.id).padStart(4,'0')}`;
    const paciente = p.paciente_nombre || '—';
    const profesional = p.profesional_nombre || '—';
    const fechaEmision = p.fecha_emision ? formatearFecha(p.fecha_emision) : '—';
    const fechaVencimiento = p.fecha_vencimiento ? formatearFecha(p.fecha_vencimiento) : '—';
    const total = p.total || 0;
    const estado = p.estado || 'pendiente';
    const badgeClass = estadoColores[estado] || 'badge-gray';
    const estadoLabel = estadoLabels[estado] || estado;

    html += `
      <tr>
        <td style="font-weight:600;font-size:12px">${numero}</td>
        <td>${paciente}</td>
        <td style="font-size:12px;color:var(--text-muted)">${profesional}</td>
        <td style="font-size:12px">${fechaEmision}</td>
        <td style="font-size:12px;color:var(--text-muted)">${fechaVencimiento}</td>
        <td style="text-align:right;font-weight:600">${formatearMoneda(total)}</td>
        <td><span class="badge ${badgeClass}">${estadoLabel}</span></td>
        <td>
          <a href="#" onclick="verPresupuesto('${p.id}')" class="btn btn-sm btn-secondary">Ver</a>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function setFilterEstadoPresupuesto(estado) {
  filterEstado = estado;
  document.querySelectorAll('#presupuesto-filtros .btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    if (btn.dataset.estado === estado) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    }
  });
  aplicarFiltrosPresupuestos();
}

function verPresupuesto(id) {
  alert('Funcionalidad "Ver presupuesto" pendiente. ID: ' + id);
}

// ============================================================
// RENDER NUEVO PRESUPUESTO (formulario)
// ============================================================
function renderNuevoPresupuesto() {
  const el = $('view-presupuestos');
  if (!el) return;

  // Cargar datos necesarios (pacientes, profesionales, tratamientos, coberturas)
  cargarDatosFormulario().then(() => {
    // Construir selects de pacientes y profesionales
    let pacientesHTML = '<option value="">— Seleccionar paciente —</option>';
    pacientesDataForm.forEach(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
      pacientesHTML += `<option value="${p.id}">${nombre}</option>`;
    });

    let profesionalesHTML = '<option value="">— Seleccionar profesional —</option>';
    profesionalesDataForm.forEach(p => {
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
      profesionalesHTML += `<option value="${p.id}">${nombre}</option>`;
    });

    // Tratamientos para el catálogo (solo activos)
    let tratamientosHTML = '<option value="">— Seleccionar tratamiento —</option>';
    tratamientosDataForm.forEach(t => {
      if (t.activo === false) return;
      const nombre = t.nombre || 'Sin nombre';
      const precio = t.precio_base || 0;
      tratamientosHTML += `<option value="${t.id}" data-nombre="${nombre}" data-precio="${precio}">${nombre} — ${formatearMoneda(precio)}</option>`;
    });

    // Fechas por defecto
    const hoy = new Date().toISOString().slice(0, 10);
    const proximoMes = new Date();
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    const fechaVencimiento = proximoMes.toISOString().slice(0, 10);

    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">Nuevo presupuesto</div></div>
        <a href="#" class="btn btn-secondary" onclick="renderPresupuestos()">← Volver</a>
      </div>

      <form id="form-pres" onsubmit="guardarPresupuesto(event)">
        <input type="hidden" name="obra_social_id" id="hid-os-id" value="">
        <input type="hidden" name="plan_id" id="hid-plan-id" value="">

        <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">

          <!-- Columna principal -->
          <div style="display:flex;flex-direction:column;gap:16px">

            <div class="card">
              <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Paciente y profesional</div>
              <div class="form-grid">
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Paciente *</label>
                  <select name="paciente_id" id="sel-paciente" class="form-control" required onchange="onPacienteChange(this.value)">
                    ${pacientesHTML}
                  </select>
                  <div id="os-badge" style="display:none;margin-top:8px;padding:8px 12px;background:var(--teal-light, #e0f2f1);border-radius:8px;font-size:12px;color:var(--teal, #00796b)">
                    <strong>Obra social:</strong> <span id="os-badge-texto"></span>
                  </div>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Profesional *</label>
                  <select name="odontologo_id" class="form-control" required>
                    ${profesionalesHTML}
                  </select>
                </div>
              </div>
            </div>

            <!-- Ítems del presupuesto -->
            <div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Ítems</div>
                <button type="button" class="btn btn-sm btn-secondary" onclick="addItem()">+ Agregar ítem</button>
              </div>

              <!-- Cabecera -->
              <div id="items-header" style="display:grid;grid-template-columns:1fr 90px 50px 70px 70px 80px 32px;gap:6px;font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;padding:0 2px">
                <div>Descripción</div>
                <div style="text-align:right">Precio</div>
                <div style="text-align:center">Cant.</div>
                <div style="text-align:center" id="hdr-cob">Cob. OS%</div>
                <div style="text-align:right" id="hdr-pac">Pte. paga</div>
                <div style="text-align:right">Subtotal</div>
                <div></div>
              </div>

              <div id="items-container"></div>

              <!-- Quick-add desde catálogo -->
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
                <label class="form-label">Agregar desde catálogo</label>
                <select id="cat-select" class="form-control" onchange="addFromCatalog(this)">
                  ${tratamientosHTML}
                </select>
              </div>
            </div>

          </div>

          <!-- Columna lateral -->
          <div style="display:flex;flex-direction:column;gap:16px">

            <div class="card">
              <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">Fechas</div>
              <div style="display:flex;flex-direction:column;gap:12px">
                <div class="form-group">
                  <label class="form-label">Fecha emisión</label>
                  <input type="date" name="fecha_emision" class="form-control" value="${hoy}">
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha vencimiento</label>
                  <input type="date" name="fecha_vencimiento" class="form-control" value="${fechaVencimiento}">
                </div>
              </div>
            </div>

            <div class="card">
              <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">Totales</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div style="display:flex;justify-content:space-between;font-size:13px">
                  <span>Subtotal</span><span id="lbl-subtotal" style="font-weight:600">$0</span>
                </div>
                <div class="form-group" style="margin:0">
                  <label class="form-label">Descuento ($)</label>
                  <input type="number" name="descuento" id="descuento" class="form-control"
                         step="0.01" min="0" value="0" oninput="recalc()">
                </div>
                <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;padding-top:8px;border-top:1px solid var(--border)">
                  <span>Total</span><span id="lbl-total">$0</span>
                </div>
                <div id="os-split" style="display:none;padding-top:8px;border-top:1px dashed var(--border)">
                  <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--primary)">
                    <span>↳ Paciente paga</span><span id="lbl-total-pac" style="font-weight:700">$0</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:12px;color:#0891b2">
                    <span>↳ Cubre obra social</span><span id="lbl-total-os" style="font-weight:700">$0</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notas</label>
              <textarea name="notas" class="form-control" rows="3"></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-block">Crear presupuesto</button>
            <a href="#" class="btn btn-secondary btn-block" onclick="renderPresupuestos()" style="text-align:center">Cancelar</a>
          </div>

        </div>
      </form>
    `;

    // Inicializar items con una fila vacía
    addItem();

    // Si hay paciente preseleccionado, disparar cambio para cargar cobertura
    const selPac = document.getElementById('sel-paciente');
    if (selPac && selPac.value) {
      onPacienteChange(selPac.value);
    }

    // Recálculo inicial
    recalc();
  });
}

// ============================================================
// CARGAR DATOS PARA EL FORMULARIO DESDE FIRESTORE
// ============================================================
function cargarDatosFormulario() {
  // Si ya tenemos los datos en caché, usarlos
  if (pacientesDataForm.length && profesionalesDataForm.length && tratamientosDataForm.length) {
    return Promise.resolve();
  }

  const promesas = [
    db.collection('pacientes').get(),
    db.collection('profesionales').get(),
    db.collection('tratamientos').get(),
    db.collection('coberturas').get()
  ];

  return Promise.all(promesas).then(([pacSnap, profSnap, tratSnap, cobSnap]) => {
    pacientesDataForm = [];
    pacSnap.forEach(doc => {
      pacientesDataForm.push({ id: doc.id, ...doc.data() });
    });

    profesionalesDataForm = [];
    profSnap.forEach(doc => {
      profesionalesDataForm.push({ id: doc.id, ...doc.data() });
    });

    tratamientosDataForm = [];
    tratSnap.forEach(doc => {
      tratamientosDataForm.push({ id: doc.id, ...doc.data() });
    });

    // Coberturas: { tratamientoId: { planId: porcentaje } }
    coberturasData = {};
    cobSnap.forEach(doc => {
      const data = doc.data();
      const tratId = data.tratamiento_id;
      const planId = data.plan_id;
      const pct = parseFloat(data.porcentaje) || 0;
      if (tratId && planId) {
        if (!coberturasData[tratId]) coberturasData[tratId] = {};
        coberturasData[tratId][planId] = pct;
      }
    });

    // Ordenar pacientes y profesionales
    pacientesDataForm.sort((a, b) => {
      const apA = (a.apellido || '').toLowerCase();
      const apB = (b.apellido || '').toLowerCase();
      if (apA < apB) return -1;
      if (apA > apB) return 1;
      const nA = (a.nombre || '').toLowerCase();
      const nB = (b.nombre || '').toLowerCase();
      return nA.localeCompare(nB);
    });
    profesionalesDataForm.sort((a, b) => {
      const nA = (a.nombre || '').toLowerCase();
      const nB = (b.nombre || '').toLowerCase();
      return nA.localeCompare(nB);
    });
    tratamientosDataForm.sort((a, b) => {
      const nA = (a.nombre || '').toLowerCase();
      const nB = (b.nombre || '').toLowerCase();
      return nA.localeCompare(nB);
    });
  });
}

// ============================================================
// FUNCIONES DEL FORMULARIO
// ============================================================

function onPacienteChange(pacienteId) {
  if (!pacienteId) {
    document.getElementById('os-badge').style.display = 'none';
    document.getElementById('hid-os-id').value = '';
    document.getElementById('hid-plan-id').value = '';
    activePlanId = 0;
    recalc();
    return;
  }

  // Buscar el paciente en pacientesDataForm
  const paciente = pacientesDataForm.find(p => p.id === pacienteId);
  if (!paciente) return;

  const obraSocialId = paciente.obra_social_id || null;
  const planId = paciente.plan_id || null;
  activePlanId = planId || 0;
  activeObraSocialId = obraSocialId;

  document.getElementById('hid-os-id').value = obraSocialId || '';
  document.getElementById('hid-plan-id').value = planId || '';

  // Mostrar badge con OS/plan
  const badge = document.getElementById('os-badge');
  const badgeText = document.getElementById('os-badge-texto');
  if (obraSocialId && planId) {
    badgeText.textContent = `Obra social: ${obraSocialId} · Plan: ${planId}`;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }

  // Actualizar porcentajes de cobertura para todos los ítems existentes
  document.querySelectorAll('.pres-item').forEach(row => {
    const tratId = row.querySelector('.item-trat-id').value;
    if (tratId && activePlanId && coberturasData[tratId] && coberturasData[tratId][activePlanId]) {
      const pct = coberturasData[tratId][activePlanId];
      row.querySelector('.item-pct').value = pct;
    } else {
      row.querySelector('.item-pct').value = 0;
    }
  });
  recalc();
}

function addItem(nombre, precio, tratId) {
  const container = document.getElementById('items-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'pres-item';
  row.style.cssText = 'display:grid;grid-template-columns:1fr 90px 50px 70px 70px 80px 32px;gap:6px;margin-bottom:6px;align-items:center';

  row.innerHTML = `
    <input type="text"   name="item_nombre[]"         class="form-control item-nombre" placeholder="Descripción" required oninput="recalc()" value="${nombre || ''}">
    <input type="number" name="item_precio[]"         class="form-control item-precio" placeholder="0" step="0.01" min="0" style="text-align:right" oninput="recalc()" value="${precio || ''}">
    <input type="number" name="item_cantidad[]"       class="form-control item-cantidad" value="${precio ? 1 : ''}" min="1" style="text-align:center" oninput="recalc()">
    <input type="number" name="item_porcentaje[]"     class="form-control item-pct" value="0" min="0" max="100" step="0.5" style="text-align:center" placeholder="%" oninput="recalc()" title="% que cubre la obra social">
    <div class="item-pac-label" style="font-size:12px;text-align:right;color:var(--primary);font-weight:600">—</div>
    <input type="hidden" name="item_diente[]"         class="item-diente" value="">
    <input type="hidden" name="item_tratamiento_id[]" class="item-trat-id" value="${tratId || ''}">
    <button type="button" onclick="removeItem(this)" style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:0;line-height:1">✕</button>
  `;

  container.appendChild(row);

  // Si hay un plan activo y tratId, aplicar cobertura automáticamente
  if (tratId && activePlanId && coberturasData[tratId] && coberturasData[tratId][activePlanId]) {
    const pct = coberturasData[tratId][activePlanId];
    row.querySelector('.item-pct').value = pct;
  }
  recalc();
}

function removeItem(btn) {
  const row = btn.closest('.pres-item');
  if (row && document.querySelectorAll('.pres-item').length > 1) {
    row.remove();
    recalc();
  } else {
    alert('Debe haber al menos un ítem.');
  }
}

function addFromCatalog(sel) {
  const opt = sel.options[sel.selectedIndex];
  if (!opt.value) return;
  const nombre = opt.dataset.nombre;
  const precio = parseFloat(opt.dataset.precio) || 0;
  const tratId = opt.value;
  addItem(nombre, precio, tratId);
  sel.value = '';
}

function recalc() {
  const rows = document.querySelectorAll('.pres-item');
  let subtotal = 0;
  let totalOs = 0;

  rows.forEach(row => {
    const precio = parseFloat(row.querySelector('.item-precio').value) || 0;
    const cantidad = parseInt(row.querySelector('.item-cantidad').value) || 1;
    const pct = parseFloat(row.querySelector('.item-pct').value) || 0;
    const sub = precio * cantidad;
    const os = Math.round(sub * pct / 100 * 100) / 100;
    subtotal += sub;
    totalOs += os;

    const pacLabel = row.querySelector('.item-pac-label');
    if (pacLabel) {
      if (pct > 0) {
        const pac = sub - os;
        pacLabel.textContent = '$' + pac.toLocaleString('es-AR', { maximumFractionDigits: 0 });
      } else {
        pacLabel.textContent = '—';
      }
    }
  });

  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const total = Math.max(0, subtotal - descuento);
  const totalPac = Math.max(0, total - totalOs);

  document.getElementById('lbl-subtotal').textContent = '$' + subtotal.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  document.getElementById('lbl-total').textContent = '$' + total.toLocaleString('es-AR', { maximumFractionDigits: 0 });

  const split = document.getElementById('os-split');
  if (totalOs > 0 && activePlanId) {
    document.getElementById('lbl-total-pac').textContent = '$' + totalPac.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    document.getElementById('lbl-total-os').textContent = '$' + totalOs.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    split.style.display = 'block';
  } else {
    split.style.display = 'none';
  }
}

// ============================================================
// GUARDAR PRESUPUESTO
// ============================================================
function guardarPresupuesto(e) {
  e.preventDefault();
  const form = document.getElementById('form-pres');
  if (!form) return;

  const formData = new FormData(form);

  // Obtener paciente y profesional seleccionados
  const pacienteId = formData.get('paciente_id');
  const profesionalId = formData.get('odontologo_id');
  if (!pacienteId || !profesionalId) {
    alert('Seleccione paciente y profesional.');
    return;
  }

  // Obtener nombres
  const paciente = pacientesDataForm.find(p => p.id === pacienteId);
  const profesional = profesionalesDataForm.find(p => p.id === profesionalId);
  const pacienteNombre = paciente ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() : 'Sin nombre';
  const profesionalNombre = profesional ? `${profesional.nombre || ''} ${profesional.apellido || ''}`.trim() : 'Sin nombre';

  // Obtener ítems
  const items = [];
  const itemNombres = form.querySelectorAll('.item-nombre');
  const itemPrecios = form.querySelectorAll('.item-precio');
  const itemCantidades = form.querySelectorAll('.item-cantidad');
  const itemPcts = form.querySelectorAll('.item-pct');
  const itemTratIds = form.querySelectorAll('.item-trat-id');

  for (let i = 0; i < itemNombres.length; i++) {
    const nombre = itemNombres[i].value.trim();
    const precio = parseFloat(itemPrecios[i].value) || 0;
    const cantidad = parseInt(itemCantidades[i].value) || 1;
    const pct = parseFloat(itemPcts[i].value) || 0;
    const tratId = itemTratIds[i].value || null;
    if (nombre && precio > 0) {
      items.push({ nombre, precio, cantidad, porcentaje: pct, tratamiento_id: tratId });
    }
  }

  if (items.length === 0) {
    alert('Agregue al menos un ítem con descripción y precio.');
    return;
  }

  // Calcular totales
  let subtotal = 0, totalOs = 0;
  items.forEach(item => {
    const sub = item.precio * item.cantidad;
    subtotal += sub;
    totalOs += Math.round(sub * item.porcentaje / 100 * 100) / 100;
  });
  const descuento = parseFloat(formData.get('descuento')) || 0;
  const total = Math.max(0, subtotal - descuento);
  const totalPac = Math.max(0, total - totalOs);

  const data = {
    paciente_id: pacienteId,
    paciente_nombre: pacienteNombre,
    odontologo_id: profesionalId,
    profesional_nombre: profesionalNombre,
    fecha_emision: formData.get('fecha_emision') || new Date().toISOString().slice(0, 10),
    fecha_vencimiento: formData.get('fecha_vencimiento') || '',
    items: items,
    subtotal: subtotal,
    descuento: descuento,
    total: total,
    total_paciente: totalPac,
    total_obra_social: totalOs,
    notas: formData.get('notas') || '',
    estado: 'pendiente',
    creado: new Date().toISOString()
  };

  // Si hay obra social, guardar IDs
  data.obra_social_id = document.getElementById('hid-os-id').value || null;
  data.plan_id = document.getElementById('hid-plan-id').value || null;

  db.collection('presupuestos').add(data)
    .then(docRef => {
      // Asignar número basado en una parte del ID
      const numero = `PRES-${String(docRef.id).slice(0, 6).toUpperCase()}`;
      return docRef.update({ numero: numero });
    })
    .then(() => {
      showToast('✅ Presupuesto creado exitosamente.');
      renderPresupuestos(); // Volver al listado
    })
    .catch(err => {
      alert('❌ Error al crear presupuesto: ' + err.message);
    });
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatearMoneda(valor) {
  return '$' + Number(valor).toLocaleString('es-AR');
}

function showToast(mensaje) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1e2d3a;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
  el.textContent = mensaje;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ============================================================
// INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  if ($('view-presupuestos')) {
    renderPresupuestos();
  }
});
