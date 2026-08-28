// ============================================================
// PRESUPUESTOS
// ============================================================

// Variables de estado
let presupuestosData = [];
let filterEstado = 'todos';
let searchQuery = '';
let presupuestosListener = null;

// Helper
function $(id) { return document.getElementById(id); }

// ============================================================
// RENDER LISTADO DE PRESUPUESTOS
// ============================================================
function renderPresupuestos() {
  const el = $('view-presupuestos');
  if (!el) return;

  // Construir HTML de la página (idéntico al diseño original)
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

  // Cargar datos
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
      console.error('Error cargando presupuestos:', error);
      const tbody = $('presupuestos-tbody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">Error al cargar presupuestos: ${error.message}</td></tr>`;
      }
    });
}

// ============================================================
// APLICAR FILTROS (búsqueda + estado)
// ============================================================
function aplicarFiltrosPresupuestos() {
  const searchInput = $('presupuesto-buscar');
  if (searchInput) searchQuery = searchInput.value.toLowerCase().trim();

  let filtered = [...presupuestosData];

  // Filtro por búsqueda (número o paciente)
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const numero = (p.numero || '').toLowerCase();
      const paciente = (p.paciente_nombre || '').toLowerCase();
      return numero.includes(searchQuery) || paciente.includes(searchQuery);
    });
  }

  // Filtro por estado
  if (filterEstado !== 'todos') {
    filtered = filtered.filter(p => p.estado === filterEstado);
  }

  // Actualizar contador
  const countEl = $('presupuestos-count');
  if (countEl) {
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  }

  // Renderizar tabla
  renderTablaPresupuestos(filtered);
}

// ============================================================
// RENDER TABLA
// ============================================================
function renderTablaPresupuestos(presupuestos) {
  const tbody = $('presupuestos-tbody');
  if (!tbody) return;

  if (presupuestos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">No hay presupuestos que coincidan con los filtros.</td></tr>`;
    return;
  }

  // Estados y sus colores
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

// ============================================================
// FILTRO POR ESTADO (actualiza el botón activo)
// ============================================================
function setFilterEstadoPresupuesto(estado) {
  filterEstado = estado;
  // Actualizar clases de los botones
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

// ============================================================
// VER PRESUPUESTO (placeholder)
// ============================================================
function verPresupuesto(id) {
  alert('Funcionalidad "Ver presupuesto" pendiente. ID: ' + id);
  // Aquí puedes abrir un modal de detalle o redirigir a una vista
}

// ============================================================
// NUEVO PRESUPUESTO (placeholder)
// ============================================================
function renderNuevoPresupuesto() {
  alert('Funcionalidad "Nuevo presupuesto" en desarrollo.');
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

// ============================================================
// INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  if ($('view-presupuestos')) {
    renderPresupuestos();
  }
});
