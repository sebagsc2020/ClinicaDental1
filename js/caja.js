// ============================================================
// CAJA - SPA (Single Page Application)
// ============================================================

// ============================================================
// RENDER CAJA PRINCIPAL
// ============================================================
function renderCaja() {
  const el = $('view-caja');

  el.innerHTML = `
    <style>
    @media (max-width: 768px) {
      #caja-pagos-table { display: none !important; }
      #caja-mob-list { display: block !important; }
    }
    #caja-mob-list { display: none; }
    </style>

    <!-- Modal de confirmación de anulación -->
    <div id="modal-anular" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:5000;align-items:center;justify-content:center;padding:20px"
         onclick="if(event.target===this)cerrarAnular()">
      <div style="background:#fff;border-radius:16px;padding:28px;max-width:400px;width:100%;box-shadow:0 12px 48px rgba(0,0,0,.22)">
        <div id="ma-titulo" style="font-size:16px;font-weight:700;color:#dc2626;margin-bottom:12px">Anular pago</div>
        <p id="ma-intro" style="font-size:13px;color:#64748b;margin:0 0 6px">Vas a anular el pago de</p>
        <p id="ma-paciente" style="font-size:14px;font-weight:700;color:#1e2d3a;margin:0 0 4px"></p>
        <p id="ma-monto" style="font-size:22px;font-weight:800;color:#dc2626;margin:0 0 12px"></p>
        <p id="ma-desc" style="font-size:12px;color:#94a3b8;margin:0 0 20px">Se generará un registro en negativo por el mismo monto. El registro original quedará marcado como anulado.</p>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button onclick="cerrarAnular()" class="btn btn-secondary">Cancelar</button>
          <button onclick="confirmarAnular()" class="btn" style="background:#dc2626;color:#fff;border:none">Confirmar anulación</button>
        </div>
      </div>
    </div>

    <div class="page-header">
      <div>
        <div class="page-title">Caja</div>
        <div class="page-subtitle" id="caja-fecha-actual">${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <a href="#" class="btn btn-secondary" onclick="alert('Función en desarrollo')">Cierres de caja</a>
        <a href="#" class="btn btn-secondary" onclick="alert('Función en desarrollo')">Realizar cierre</a>
        <a href="#" class="btn btn-secondary" onclick="renderPresupuestos()">Presupuestos</a>
        <a href="#" class="btn btn-secondary" style="color:#dc2626;border-color:#fecaca;" onclick="alert('Función en desarrollo')">− Registrar egreso</a>
        <a href="#" class="btn btn-primary" onclick="alert('Función en desarrollo')">+ Registrar pago</a>
      </div>
    </div>

    <!-- Resumen en 3 cards -->
    <div id="caja-resumen" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
      <div class="card"><div style="text-align:center;padding:8px 0;color:var(--text-muted);">Cargando resumen...</div></div>
      <div class="card"><div style="text-align:center;padding:8px 0;color:var(--text-muted);">Cargando resumen...</div></div>
      <div class="card"><div style="text-align:center;padding:8px 0;color:var(--text-muted);">Cargando resumen...</div></div>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:16px;">
      <div id="caja-filtros" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Desde</label>
          <input type="date" id="filtro-desde" class="form-control" value="">
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Hasta</label>
          <input type="date" id="filtro-hasta" class="form-control" value="">
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Método</label>
          <select id="filtro-metodo" class="form-control">
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta_credito">Tarjeta crédito</option>
            <option value="tarjeta_debito">Tarjeta débito</option>
            <option value="transferencia">Transferencia</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="obra_social">Obra social</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Estado</label>
          <select id="filtro-estado" class="form-control">
            <option value="">Todos</option>
            <option value="completado">Completado</option>
            <option value="pendiente">Pendiente</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>
        <button type="button" class="btn btn-secondary" onclick="aplicarFiltrosCaja()">Filtrar</button>
        <button type="button" class="btn btn-secondary" onclick="limpiarFiltrosCaja()">Limpiar</button>
      </div>
    </div>

    <!-- Tabla de pagos -->
    <div class="card">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
        <span id="caja-contador-pagos">Cargando...</span>
      </div>
      <div id="caja-pagos-table">
        <table class="table" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Fecha</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Paciente</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Método</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Comprobante</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Registrado por</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Monto</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Estado</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;"></th>
            </tr>
          </thead>
          <tbody id="caja-pagos-body">
            <!-- Generado por JS -->
          </tbody>
        </table>
      </div>
      <!-- Lista mobile -->
      <div id="caja-mob-list" style="border-radius:8px;border:1px solid var(--border);overflow:hidden;margin-bottom:4px;">
        <!-- Generado por JS -->
      </div>
    </div>
  `;

  // Agregar estilos responsive para la tabla
  if (!document.getElementById('caja-mobile-styles')) {
    const style = document.createElement('style');
    style.id = 'caja-mobile-styles';
    style.textContent = `
      @media (max-width: 768px) {
        #caja-pagos-table .table th:nth-child(3),
        #caja-pagos-table .table td:nth-child(3),
        #caja-pagos-table .table th:nth-child(4),
        #caja-pagos-table .table td:nth-child(4),
        #caja-pagos-table .table th:nth-child(5),
        #caja-pagos-table .table td:nth-child(5) {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Iniciar carga de datos
  cargarPagos();
}

// ============================================================
// CARGAR PAGOS DESDE FIRESTORE
// ============================================================
let _todosLosPagos = [];
let _pagosFiltrados = [];
let _pagoAEliminar = null;

function cargarPagos() {
  db.collection('pagos')
    .orderBy('fecha', 'desc')
    .onSnapshot((snapshot) => {
      const pagos = [];
      snapshot.forEach(doc => {
        pagos.push({ id: doc.id, ...doc.data() });
      });
      _todosLosPagos = pagos;
      calcularResumenes(pagos);
      aplicarFiltrosCaja();
    }, (error) => {
      console.error('Error cargando pagos:', error);
      document.getElementById('caja-pagos-body').innerHTML = `
        <tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">
          Error al cargar los datos. ${error.message}
        </td></tr>
      `;
    });
}

// ============================================================
// CALCULAR RESÚMENES (Hoy, Semana, Mes)
// ============================================================
function calcularResumenes(pagos) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  // Filtrar pagos completados (no anulados)
  const pagosValidos = pagos.filter(p => p.estado !== 'anulado');

  // Función para agrupar por método
  function agruparPorMetodo(pagosFiltrados) {
    const grupos = {};
    pagosFiltrados.forEach(p => {
      const metodo = p.metodo || 'otro';
      if (!grupos[metodo]) grupos[metodo] = 0;
      grupos[metodo] += p.monto || 0;
    });
    return grupos;
  }

  // Resumen Hoy
  const pagosHoy = pagosValidos.filter(p => {
    const fecha = new Date(p.fecha);
    fecha.setHours(0, 0, 0, 0);
    return fecha.getTime() === hoy.getTime();
  });
  const totalHoy = pagosHoy.reduce((sum, p) => sum + (p.monto || 0), 0);
  const gruposHoy = agruparPorMetodo(pagosHoy);

  // Resumen Semana
  const pagosSemana = pagosValidos.filter(p => {
    const fecha = new Date(p.fecha);
    fecha.setHours(0, 0, 0, 0);
    return fecha >= inicioSemana && fecha <= hoy;
  });
  const totalSemana = pagosSemana.reduce((sum, p) => sum + (p.monto || 0), 0);
  const gruposSemana = agruparPorMetodo(pagosSemana);

  // Resumen Mes
  const pagosMes = pagosValidos.filter(p => {
    const fecha = new Date(p.fecha);
    fecha.setHours(0, 0, 0, 0);
    return fecha >= inicioMes && fecha <= hoy;
  });
  const totalMes = pagosMes.reduce((sum, p) => sum + (p.monto || 0), 0);
  const gruposMes = agruparPorMetodo(pagosMes);

  // Renderizar cards
  const coloresMetodo = {
    'efectivo': '#22c55e',
    'tarjeta_credito': '#3b82f6',
    'tarjeta_debito': '#8b5cf6',
    'transferencia': '#f59e0b',
    'mercadopago': '#0070f3',
    'obra_social': '#ec4899',
    'otro': '#94a3b8'
  };
  const nombresMetodo = {
    'efectivo': 'Efectivo',
    'tarjeta_credito': 'T. Crédito',
    'tarjeta_debito': 'T. Débito',
    'transferencia': 'Transferencia',
    'mercadopago': 'MercadoPago',
    'obra_social': 'Obra social',
    'otro': 'Otro'
  };

  function renderCard(titulo, total, grupos, periodo) {
    const entries = Object.entries(grupos);
    let detallesHTML = '';
    if (entries.length === 0) {
      detallesHTML = `<div style="font-size:11px;color:var(--text-muted);">Sin movimientos</div>`;
    } else {
      detallesHTML = entries.map(([metodo, monto]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;">
          <div style="display:flex;align-items:center;gap:5px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${coloresMetodo[metodo] || '#94a3b8'};"></div>
            ${nombresMetodo[metodo] || metodo}
          </div>
          <span style="font-weight:600;">$${Number(monto).toLocaleString()}</span>
        </div>
      `).join('');
    }

    return `
      <div class="card">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">${titulo}</div>
        <div style="font-size:26px;font-weight:700;color:var(--text);">$${Number(total).toLocaleString()}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">${periodo} · acumulado</div>
        <div style="display:flex;flex-direction:column;gap:4px;">${detallesHTML}</div>
      </div>
    `;
  }

  const resumenHTML = `
    ${renderCard('Hoy', totalHoy, gruposHoy, new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }))}
    ${renderCard('Semana', totalSemana, gruposSemana, 'Esta semana')}
    ${renderCard('Mes', totalMes, gruposMes, new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }))}
  `;

  document.getElementById('caja-resumen').innerHTML = resumenHTML;
}

// ============================================================
// APLICAR FILTROS
// ============================================================
window.aplicarFiltrosCaja = function() {
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  const metodo = document.getElementById('filtro-metodo').value;
  const estado = document.getElementById('filtro-estado').value;

  let filtrados = _todosLosPagos || [];

  // Filtro por fecha
  if (desde) {
    const desdeDate = new Date(desde);
    desdeDate.setHours(0, 0, 0, 0);
    filtrados = filtrados.filter(p => {
      const fecha = new Date(p.fecha);
      fecha.setHours(0, 0, 0, 0);
      return fecha >= desdeDate;
    });
  }
  if (hasta) {
    const hastaDate = new Date(hasta);
    hastaDate.setHours(23, 59, 59, 999);
    filtrados = filtrados.filter(p => {
      const fecha = new Date(p.fecha);
      return fecha <= hastaDate;
    });
  }

  // Filtro por método
  if (metodo) {
    filtrados = filtrados.filter(p => p.metodo === metodo);
  }

  // Filtro por estado
  if (estado) {
    filtrados = filtrados.filter(p => p.estado === estado);
  }

  _pagosFiltrados = filtrados;
  renderTablaPagos(filtrados);
};

// ============================================================
// LIMPIAR FILTROS
// ============================================================
window.limpiarFiltrosCaja = function() {
  document.getElementById('filtro-desde').value = '';
  document.getElementById('filtro-hasta').value = '';
  document.getElementById('filtro-metodo').value = '';
  document.getElementById('filtro-estado').value = '';
  aplicarFiltrosCaja();
};

// ============================================================
// RENDER TABLA DE PAGOS
// ============================================================
function renderTablaPagos(pagos) {
  const tbody = document.getElementById('caja-pagos-body');
  const mobList = document.getElementById('caja-mob-list');
  const contador = document.getElementById('caja-contador-pagos');

  if (!tbody) return;

  if (pagos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">No hay pagos que coincidan con los filtros.</td></tr>`;
    mobList.innerHTML = '';
    contador.textContent = '0 registro(s)';
    return;
  }

  contador.textContent = `${pagos.length} ${pagos.length === 1 ? 'registro' : 'registros'}`;

  const estadoBadges = {
    'completado': 'badge-green',
    'pendiente': 'badge-amber',
    'anulado': 'badge-gray'
  };
  const estadoTextos = {
    'completado': 'Completado',
    'pendiente': 'Pendiente',
    'anulado': 'Anulado'
  };

  const coloresMetodo = {
    'efectivo': '#22c55e',
    'tarjeta_credito': '#3b82f6',
    'tarjeta_debito': '#8b5cf6',
    'transferencia': '#f59e0b',
    'mercadopago': '#0070f3',
    'obra_social': '#ec4899',
    'otro': '#94a3b8'
  };
  const nombresMetodo = {
    'efectivo': 'Efectivo',
    'tarjeta_credito': 'T. Crédito',
    'tarjeta_debito': 'T. Débito',
    'transferencia': 'Transferencia',
    'mercadopago': 'MercadoPago',
    'obra_social': 'Obra social',
    'otro': 'Otro'
  };

  let html = '';
  let mobHTML = '';

  pagos.forEach(p => {
    const fecha = p.fecha ? formatDateCaja(p.fecha) : '—';
    const paciente = p.paciente || '—';
    const metodo = p.metodo || 'otro';
    const metodoColor = coloresMetodo[metodo] || '#94a3b8';
    const metodoNombre = nombresMetodo[metodo] || metodo;
    const comprobante = p.comprobante || '';
    const registradoPor = p.registrado_por || '—';
    const monto = p.monto || 0;
    const estado = p.estado || 'pendiente';
    const estadoClase = estadoBadges[estado] || 'badge-gray';
    const estadoTexto = estadoTextos[estado] || estado;
    const esAnulado = estado === 'anulado';

    // Mostrar botón anular solo si no está anulado
    const btnAnular = !esAnulado ? `
      <button type="button" class="btn btn-sm"
        style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;"
        onclick="abrirAnular('${p.id}', '${paciente}', ${monto})">
        Anular
      </button>
    ` : '';

    // Fila de tabla
    html += `
      <tr style="${esAnulado ? 'opacity:0.5;' : ''}">
        <td style="font-size:12px;white-space:nowrap;">${fecha}</td>
        <td>${paciente}</td>
        <td>
          <div style="display:flex;align-items:center;gap:5px;font-size:12px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${metodoColor};"></div>
            ${metodoNombre}
          </div>
        </td>
        <td style="font-size:12px;color:var(--text-muted);">${comprobante}</td>
        <td style="font-size:12px;color:var(--text-muted);">${registradoPor}</td>
        <td style="text-align:right;font-weight:700;white-space:nowrap;color:${esAnulado ? 'var(--text-muted)' : 'var(--text)'};">
          ${esAnulado ? '−' : '$'}${Number(monto).toLocaleString()}
        </td>
        <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td>${btnAnular}</td>
      </tr>
    `;

    // Lista mobile
    mobHTML += `
      <div style="padding:11px 14px;border-bottom:1px solid #f1f5f9;background:#fff;${esAnulado ? 'opacity:0.5;' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;">
          <div style="font-weight:600;font-size:14px;flex:1;min-width:0;padding-right:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${paciente}
          </div>
          <div style="font-weight:700;font-size:15px;white-space:nowrap;color:${esAnulado ? 'var(--text-muted)' : 'var(--text)'};flex-shrink:0;">
            ${esAnulado ? '−' : '$'}${Number(monto).toLocaleString()}
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
          <div style="font-size:11px;color:var(--text-muted);">
            ${fecha} · ${metodoNombre}
          </div>
          <div style="display:flex;gap:5px;align-items:center;flex-shrink:0;">
            <span class="badge ${estadoClase}" style="font-size:10px;">${estadoTexto}</span>
            ${btnAnular}
          </div>
        </div>
      </div>
    `;
  });

  tbody.innerHTML = html;
  mobList.innerHTML = mobHTML;
}

// ============================================================
// FORMATO DE FECHA
// ============================================================
function formatDateCaja(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================================
// ANULAR PAGO
// ============================================================
let _anularId = null;
let _anularPaciente = '';
let _anularMonto = 0;

window.abrirAnular = function(id, paciente, monto) {
  _anularId = id;
  _anularPaciente = paciente;
  _anularMonto = monto;

  document.getElementById('ma-titulo').textContent = 'Anular pago';
  document.getElementById('ma-intro').textContent = 'Vas a anular el pago de';
  document.getElementById('ma-paciente').textContent = paciente;
  document.getElementById('ma-monto').textContent = '$' + Number(monto).toLocaleString();
  document.getElementById('modal-anular').style.display = 'flex';
};

window.cerrarAnular = function() {
  document.getElementById('modal-anular').style.display = 'none';
  _anularId = null;
};

window.confirmarAnular = function() {
  if (!_anularId) return;

  db.collection('pagos').doc(_anularId).update({
    estado: 'anulado',
    updated_at: new Date().toISOString()
  })
  .then(() => {
    cerrarAnular();
    showToast('✅ Pago anulado correctamente.');
    // Los datos se actualizan en tiempo real gracias al onSnapshot
  })
  .catch(err => {
    alert('❌ Error al anular el pago: ' + err.message);
  });
};

// ============================================================
// NOTA: Las funciones showToast, $, etc. deben estar definidas globalmente
// ============================================================
