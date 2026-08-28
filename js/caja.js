// ============================================================
// CAJA - SPA (Single Page Application)
// ============================================================

// ============================================================
// RENDER CAJA PRINCIPAL (LISTA DE PAGOS Y RESUMEN)
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
        <a href="#" class="btn btn-secondary" onclick="renderCierresView()">Cierres de caja</a>
        <a href="#" class="btn btn-secondary" onclick="renderRealizarCierreView()">Realizar cierre</a>
        <a href="#" class="btn btn-secondary" onclick="renderPresupuestos()">Presupuestos</a>
        <a href="#" class="btn btn-secondary" style="color:#dc2626;border-color:#fecaca;" onclick="renderRegistrarEgresoView()">− Registrar egreso</a>
        <a href="#" class="btn btn-primary" onclick="renderRegistrarPagoView()">+ Registrar pago</a>
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
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Cierre</th>
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
        #caja-pagos-table .table td:nth-child(5),
        #caja-pagos-table .table th:nth-child(8),
        #caja-pagos-table .table td:nth-child(8) {
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
        <tr><td colspan="9" style="text-align:center;padding:30px;color:#94a3b8;">
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

  // Filtrar pagos completados (no anulados) y solo ingresos (no egresos)
  const pagosValidos = pagos.filter(p => p.estado !== 'anulado' && p.tipo !== 'egreso');

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

  if (metodo) {
    filtrados = filtrados.filter(p => p.metodo === metodo);
  }

  if (estado) {
    filtrados = filtrados.filter(p => p.estado === estado);
  }

  _pagosFiltrados = filtrados;
  renderTablaPagos(filtrados);
};

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
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:#94a3b8;">No hay pagos que coincidan con los filtros.</td></tr>`;
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
    const esEgreso = p.tipo === 'egreso';
    const cierreId = p.cierre_id || null;

    const btnAnular = !esAnulado && !esEgreso ? `
      <button type="button" class="btn btn-sm"
        style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;"
        onclick="abrirAnular('${p.id}', '${paciente}', ${monto})">
        Anular
      </button>
    ` : '';

    const signo = esEgreso ? '−' : '';
    const colorMonto = esEgreso ? 'var(--danger)' : (esAnulado ? 'var(--text-muted)' : 'var(--text)');

    // Badge de cierre (si tiene)
    let cierreBadge = '';
    if (cierreId) {
      cierreBadge = `
        <a href="#" onclick="renderVerCierreView('${cierreId}')"
           style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#1d4ed8;text-decoration:none;background:#eff6ff;padding:3px 8px;border-radius:4px;border:1px solid #bfdbfe;white-space:nowrap;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          Cierre #${cierreId.slice(0,4)}
        </a>
      `;
    } else {
      cierreBadge = `<span style="font-size:11px;color:var(--text-muted);">—</span>`;
    }

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
        <td style="text-align:right;font-weight:700;white-space:nowrap;color:${colorMonto};">
          ${signo}$${Number(monto).toLocaleString()}
        </td>
        <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td>${cierreBadge}</td>
        <td>${btnAnular}</td>
      </tr>
    `;

    mobHTML += `
      <div style="padding:11px 14px;border-bottom:1px solid #f1f5f9;background:#fff;${esAnulado ? 'opacity:0.5;' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;">
          <div style="font-weight:600;font-size:14px;flex:1;min-width:0;padding-right:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${paciente}
          </div>
          <div style="font-weight:700;font-size:15px;white-space:nowrap;color:${colorMonto};flex-shrink:0;">
            ${signo}$${Number(monto).toLocaleString()}
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
  })
  .catch(err => {
    alert('❌ Error al anular el pago: ' + err.message);
  });
};

// ============================================================
// VISTA: CIERRES DE CAJA (LISTA)
// ============================================================
window.renderCierresView = function() {
  const el = $('view-caja');
  el.innerHTML = `
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <a href="#" class="btn btn-secondary btn-sm" onclick="renderCaja()">&larr; Volver</a>
        <div>
          <div class="page-title">Cierres de caja</div>
          <div class="page-subtitle" id="cierres-count">Cargando...</div>
        </div>
      </div>
      <a href="#" class="btn btn-primary" onclick="renderRealizarCierreView()">Nuevo cierre</a>
    </div>
    <div class="card">
      <div id="cierres-list" style="padding:20px;text-align:center;color:var(--text-muted);">Cargando cierres...</div>
    </div>
  `;

  // Cargar cierres desde Firestore
  db.collection('cierres')
    .orderBy('fecha_cierre', 'desc')
    .get()
    .then(snapshot => {
      const list = document.getElementById('cierres-list');
      if (snapshot.empty) {
        list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;">No hay cierres de caja registrados.</div>';
        document.getElementById('cierres-count').textContent = '0 registros';
        return;
      }
      const cierres = [];
      snapshot.forEach(doc => cierres.push({ id: doc.id, ...doc.data() }));
      document.getElementById('cierres-count').textContent = `${cierres.length} ${cierres.length === 1 ? 'registro' : 'registros'}`;

      let html = `
        <table class="table" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">N°</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Fecha cierre</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Período</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Efectivo esperado</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Efectivo ingresado</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Diferencia</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Cerrado por</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;"></th>
            </tr>
          </thead>
          <tbody>
      `;
      cierres.forEach((c, index) => {
        const fecha = c.fecha_cierre ? formatDateCaja(c.fecha_cierre) : '—';
        const periodo = c.periodo || '—';
        const efectivoEsperado = c.efectivo_esperado || 0;
        const efectivoIngresado = c.efectivo_ingresado || 0;
        const diff = efectivoIngresado - efectivoEsperado;
        const diffColor = Math.abs(diff) < 0.01 ? 'var(--success)' : (diff < 0 ? 'var(--danger)' : 'var(--warning)');
        const cerradoPor = c.cerrado_por || '—';
        html += `
          <tr>
            <td style="font-weight:600;">${index + 1}</td>
            <td>${fecha}</td>
            <td>${periodo}</td>
            <td style="text-align:right;">$${Number(efectivoEsperado).toLocaleString()}</td>
            <td style="text-align:right;">$${Number(efectivoIngresado).toLocaleString()}</td>
            <td style="text-align:right;font-weight:600;color:${diffColor};">${diff >= 0 ? '+' : ''}$${Number(diff).toLocaleString()}</td>
            <td>${cerradoPor}</td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="renderVerCierreView('${c.id}')">Ver</button>
            </td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      list.innerHTML = html;
    })
    .catch(err => {
      document.getElementById('cierres-list').innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    });
};

// ============================================================
// VISTA: VER DETALLE DE UN CIERRE
// ============================================================
window.renderVerCierreView = function(cierreId) {
  const el = $('view-caja');
  el.innerHTML = `
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <a href="#" class="btn btn-secondary btn-sm" onclick="renderCierresView()">&larr; Volver</a>
        <div>
          <div class="page-title">Detalle de cierre</div>
          <div class="page-subtitle" id="cierre-detalle-subtitle">Cargando...</div>
        </div>
      </div>
    </div>
    <div id="cierre-detalle-contenido" style="text-align:center;padding:20px;color:var(--text-muted);">Cargando datos del cierre...</div>
  `;

  // Obtener datos del cierre y sus pagos asociados
  Promise.all([
    db.collection('cierres').doc(cierreId).get(),
    db.collection('pagos').where('cierre_id', '==', cierreId).get()
  ])
  .then(([cierreDoc, pagosSnap]) => {
    if (!cierreDoc.exists) {
      document.getElementById('cierre-detalle-contenido').innerHTML = '<div class="alert alert-danger">Cierre no encontrado.</div>';
      return;
    }

    const cierre = { id: cierreDoc.id, ...cierreDoc.data() };
    const pagos = [];
    pagosSnap.forEach(doc => pagos.push({ id: doc.id, ...doc.data() }));

    // Calcular totales
    const totalEfectivo = pagos.filter(p => p.metodo === 'efectivo').reduce((sum, p) => sum + (p.monto || 0), 0);
    const totalOtros = pagos.filter(p => p.metodo !== 'efectivo').reduce((sum, p) => sum + (p.monto || 0), 0);
    const totalGeneral = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);

    // Mostrar fecha formateada
    const fechaCierre = cierre.fecha_cierre ? formatDateCaja(cierre.fecha_cierre) : '—';
    document.getElementById('cierre-detalle-subtitle').textContent = `Cierre del ${fechaCierre} · ${cierre.periodo || ''}`;

    // Construir HTML
    const diff = (cierre.efectivo_ingresado || 0) - (cierre.efectivo_esperado || 0);
    const diffColor = Math.abs(diff) < 0.01 ? 'var(--success)' : (diff < 0 ? 'var(--danger)' : 'var(--warning)');

    let pagosHTML = '';
    if (pagos.length === 0) {
      pagosHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">No hay pagos asociados a este cierre.</div>';
    } else {
      pagosHTML = `
        <table class="table" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Fecha</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Paciente</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Método</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Comprobante</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Monto</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${pagos.map(p => `
              <tr>
                <td style="font-size:12px;white-space:nowrap;">${formatDateCaja(p.fecha)}</td>
                <td>${p.paciente || '—'}</td>
                <td>${p.metodo || 'otro'}</td>
                <td style="font-size:12px;color:var(--text-muted);">${p.comprobante || ''}</td>
                <td style="text-align:right;font-weight:700;">$${Number(p.monto).toLocaleString()}</td>
                <td><span class="badge badge-green">${p.estado === 'anulado' ? 'Anulado' : 'Completado'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const contenido = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div class="card">
          <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:var(--text);">Resumen del cierre</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span>Fecha de cierre</span>
              <span style="font-weight:600;">${fechaCierre}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span>Período</span>
              <span style="font-weight:600;">${cierre.periodo || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding-top:8px;border-top:1px solid var(--border);">
              <span>Efectivo esperado</span>
              <span style="font-weight:600;">$${Number(cierre.efectivo_esperado || 0).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span>Efectivo ingresado</span>
              <span style="font-weight:600;">$${Number(cierre.efectivo_ingresado || 0).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:${diffColor};">
              <span>Diferencia</span>
              <span>${diff >= 0 ? '+' : ''}$${Number(diff).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="card">
          <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:var(--text);">Totales por método</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span>Efectivo</span>
              <span style="font-weight:600;">$${Number(totalEfectivo).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span>Otros métodos</span>
              <span style="font-weight:600;">$${Number(totalOtros).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;padding-top:8px;border-top:2px solid var(--border);">
              <span>Total general</span>
              <span style="color:var(--primary);">$${Number(totalGeneral).toLocaleString()}</span>
            </div>
          </div>
          ${cierre.observaciones ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:13px;color:var(--text-muted);"><strong>Observaciones:</strong> ${cierre.observaciones}</div>` : ''}
        </div>
      </div>
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:14px;color:var(--text);">Pagos incluidos en este cierre <span style="font-weight:400;color:var(--text-muted);font-size:12px;">(${pagos.length} registros)</span></div>
        ${pagosHTML}
      </div>
    `;

    document.getElementById('cierre-detalle-contenido').innerHTML = contenido;
  })
  .catch(err => {
    document.getElementById('cierre-detalle-contenido').innerHTML = `<div class="alert alert-danger">Error al cargar el cierre: ${err.message}</div>`;
  });
};

// ============================================================
// VISTA: REALIZAR CIERRE DE CAJA
// ============================================================
window.renderRealizarCierreView = function() {
  const el = $('view-caja');
  el.innerHTML = `
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <a href="#" class="btn btn-secondary btn-sm" onclick="renderCierresView()">&larr; Volver</a>
        <div>
          <div class="page-title">Realizar cierre de caja</div>
          <div class="page-subtitle" id="cierre-subtitle">Cargando...</div>
        </div>
      </div>
    </div>
    <form id="form-cierre" onsubmit="event.preventDefault(); confirmarCierre()">
      <div id="cierre-datos" style="text-align:center;padding:20px;color:var(--text-muted);">Cargando datos del cierre...</div>
    </form>
  `;

  // Calcular totales de pagos no cerrados (solo ingresos, excluyendo egresos)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  db.collection('pagos')
    .where('estado', '==', 'completado')
    .get()
    .then(snapshot => {
      const pagos = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.tipo !== 'egreso' && !data.cierre_id) {
          pagos.push({ id: doc.id, ...data });
        }
      });

      const efectivoTotal = pagos
        .filter(p => p.metodo === 'efectivo')
        .reduce((sum, p) => sum + (p.monto || 0), 0);

      const otros = {};
      pagos.forEach(p => {
        if (p.metodo !== 'efectivo') {
          const key = p.metodo || 'otro';
          if (!otros[key]) otros[key] = 0;
          otros[key] += p.monto || 0;
        }
      });

      const totalGeneral = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);

      const formHtml = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <!-- Efectivo -->
          <div class="card">
            <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:var(--text);">Efectivo</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:10px 12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
              <span style="font-size:13px;color:#166534;font-weight:600;">Esperado en caja</span>
              <span style="font-size:20px;font-weight:800;color:#166534;" id="efe-esperado">$${Number(efectivoTotal).toLocaleString()}</span>
            </div>
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label">Efectivo contado físicamente</label>
              <input type="number" name="efectivo_ingresado" id="efe-ingresado"
                     class="form-control" step="0.01" min="0" value="${efectivoTotal}"
                     oninput="calcDiferenciaCierre()" style="font-size:18px;font-weight:700;text-align:right;">
            </div>
            <div id="diferencia-box" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;">
              <span style="font-size:13px;color:var(--text-muted);font-weight:600;">Diferencia</span>
              <span id="diferencia-val" style="font-size:18px;font-weight:800;">$0</span>
            </div>
          </div>

          <!-- Otros métodos -->
          <div class="card">
            <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:var(--text);">Otros métodos de pago</div>
            ${Object.entries(otros).length === 0 ? '<div style="color:var(--text-muted);font-size:13px;">No hay pagos con otros métodos.</div>' : ''}
            ${Object.entries(otros).map(([metodo, monto]) => {
              const nombres = { 'tarjeta_credito': 'Tarjeta crédito', 'tarjeta_debito': 'Tarjeta débito', 'transferencia': 'Transferencia', 'mercadopago': 'MercadoPago', 'obra_social': 'Obra social', 'otro': 'Otro' };
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--surface);border-radius:6px;margin-bottom:6px;">
                  <div style="font-size:13px;color:var(--text);">${nombres[metodo] || metodo}</div>
                  <div style="text-align:right;">
                    <div style="font-size:15px;font-weight:700;color:var(--text);">$${Number(monto).toLocaleString()}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${pagos.filter(p => p.metodo === metodo).length} pago(s)</div>
                  </div>
                </div>
              `;
            }).join('')}
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;">
              <span style="font-size:13px;font-weight:600;color:var(--text-muted);">Total otros</span>
              <span style="font-size:15px;font-weight:700;color:var(--text);" id="total-otros">$${Number(totalGeneral - efectivoTotal).toLocaleString()}</span>
            </div>
            <div style="margin-top:14px;padding:10px 12px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;font-weight:700;color:#1d4ed8;">Total general</span>
              <span style="font-size:20px;font-weight:800;color:#1d4ed8;" id="total-general">$${Number(totalGeneral).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="card" style="margin-bottom:20px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Observaciones (opcional)</label>
            <textarea name="observaciones" id="obs-cierre" class="form-control" rows="3" placeholder="Notas sobre este cierre…"></textarea>
          </div>
        </div>

        <!-- Acciones -->
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <a href="#" class="btn btn-secondary" onclick="renderCierresView()">Cancelar</a>
          <button type="submit" class="btn btn-primary" style="background:#16a34a;border-color:#16a34a;">Confirmar cierre de caja</button>
        </div>

        <!-- Registros incluidos -->
        <div class="card" style="margin-top:24px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:14px;color:var(--text);">
            Registros que serán contemplados en este cierre
            <span style="font-weight:400;color:var(--text-muted);font-size:12px;">(${pagos.length} pagos)</span>
          </div>
          ${pagos.length === 0 ? '<div style="text-align:center;color:var(--text-muted);">No hay pagos pendientes de cierre.</div>' : `
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Método</th>
                <th>Comprobante</th>
                <th>Registrado por</th>
                <th style="text-align:right;">Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${pagos.map(p => `
                <tr>
                  <td style="font-size:12px;white-space:nowrap;">${formatDateCaja(p.fecha)}</td>
                  <td>${p.paciente || '—'}</td>
                  <td>${p.metodo || 'otro'}</td>
                  <td style="font-size:12px;color:var(--text-muted);">${p.comprobante || ''}</td>
                  <td style="font-size:12px;color:var(--text-muted);">${p.registrado_por || '—'}</td>
                  <td style="text-align:right;font-weight:700;">$${Number(p.monto).toLocaleString()}</td>
                  <td><span class="badge badge-green">Completado</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          `}
        </div>
      `;

      document.getElementById('cierre-datos').innerHTML = formHtml;
      document.getElementById('cierre-subtitle').textContent = `Primer cierre — todos los movimientos acumulados (${pagos.length} pagos)`;

      window._cierrePagos = pagos;
      window._cierreEfectivoEsperado = efectivoTotal;
      window._cierreOtros = otros;
      calcDiferenciaCierre();
    })
    .catch(err => {
      document.getElementById('cierre-datos').innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    });
};

// ============================================================
// CALCULAR DIFERENCIA EN CIERRE
// ============================================================
function calcDiferenciaCierre() {
  const esperado = window._cierreEfectivoEsperado || 0;
  const ingresado = parseFloat(document.getElementById('efe-ingresado').value) || 0;
  const diff = ingresado - esperado;
  const box = document.getElementById('diferencia-box');
  const val = document.getElementById('diferencia-val');

  val.textContent = (diff >= 0 ? '+' : '') + '$' + Math.abs(diff).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (Math.abs(diff) < 0.01) {
    box.style.background = '#f0fdf4';
    box.style.borderColor = '#bbf7d0';
    val.style.color = '#166534';
  } else if (diff < 0) {
    box.style.background = '#fef2f2';
    box.style.borderColor = '#fecaca';
    val.style.color = '#dc2626';
  } else {
    box.style.background = '#fffbeb';
    box.style.borderColor = '#fde68a';
    val.style.color = '#92400e';
  }
}

// ============================================================
// CONFIRMAR Y GUARDAR CIERRE
// ============================================================
window.confirmarCierre = function() {
  if (!confirm('¿Confirmar el cierre de caja? Los totales se reiniciarán a 0.')) return;

  const efectivoIngresado = parseFloat(document.getElementById('efe-ingresado').value) || 0;
  const observaciones = document.getElementById('obs-cierre').value || '';
  const pagos = window._cierrePagos || [];
  const efectivoEsperado = window._cierreEfectivoEsperado || 0;

  const cierreData = {
    fecha_cierre: new Date().toISOString(),
    periodo: new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
    efectivo_esperado: efectivoEsperado,
    efectivo_ingresado: efectivoIngresado,
    otros_metodos: window._cierreOtros || {},
    observaciones: observaciones,
    cerrado_por: 'Admin',
    created_at: new Date().toISOString()
  };

  db.collection('cierres').add(cierreData)
    .then(docRef => {
      const promises = pagos.map(p => {
        return db.collection('pagos').doc(p.id).update({
          cierre_id: docRef.id,
          updated_at: new Date().toISOString()
        });
      });
      return Promise.all(promises);
    })
    .then(() => {
      showToast('✅ Cierre de caja realizado correctamente.');
      renderCierresView();
    })
    .catch(err => {
      alert('❌ Error al guardar el cierre: ' + err.message);
    });
};

// ============================================================
// VISTA: REGISTRAR EGRESO
// ============================================================
window.renderRegistrarEgresoView = function() {
  const el = $('view-caja');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Registrar egreso</div>
        <div class="page-subtitle">Salida de dinero de caja</div>
      </div>
      <a href="#" class="btn btn-secondary" onclick="renderCaja()">← Volver</a>
    </div>
    <form id="form-egreso" onsubmit="event.preventDefault(); guardarEgreso()">
      <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start;">
        <div class="card">
          <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Datos del egreso</div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">Concepto *</label>
              <input type="text" name="concepto" id="egreso-concepto" class="form-control" placeholder="Ej: Materiales, Alquiler, Sueldos…" required>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Monto *</label>
                <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
                  <span style="padding:8px 10px;background:#fef2f2;color:#dc2626;font-size:13px;font-weight:700;border-right:1px solid var(--border);">−$</span>
                  <input type="number" name="monto" id="egreso-monto" step="0.01" min="0.01" style="border:none;padding:8px 10px;flex:1;outline:none;font-size:13px;" placeholder="0.00" required>
                </div>
                <span class="form-hint">Ingresá el monto positivo — se registrará como salida</span>
              </div>
              <div class="form-group">
                <label class="form-label">Fecha *</label>
                <input type="date" name="fecha_pago" id="egreso-fecha" class="form-control" value="${new Date().toISOString().slice(0,10)}" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Método de pago *</label>
              <select name="metodo_pago" id="egreso-metodo" class="form-control" required>
                <option value="">— Seleccionar —</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta_credito">Tarjeta crédito</option>
                <option value="tarjeta_debito">Tarjeta débito</option>
                <option value="mercadopago">MercadoPago</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nro. comprobante</label>
              <input type="text" name="numero_comprobante" id="egreso-comprobante" class="form-control" placeholder="Factura, recibo, etc.">
            </div>
            <div class="form-group">
              <label class="form-label">Notas</label>
              <textarea name="notas" id="egreso-notas" class="form-control" rows="2"></textarea>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button type="submit" class="btn btn-block" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:700;">− Registrar egreso</button>
          <a href="#" class="btn btn-secondary btn-block" style="text-align:center;" onclick="renderCaja()">Cancelar</a>
          <div class="card" style="margin-top:4px;">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">¿Qué es un egreso?</div>
            <div style="font-size:13px;line-height:1.7;color:var(--text-muted);">
              <p>Un egreso es una salida de dinero de la caja, no vinculada a un paciente.</p>
              <p style="margin-top:8px;">Ejemplos: compra de materiales, pago de servicios, alquiler, sueldos, etc.</p>
              <p style="margin-top:8px;">Se registra con monto negativo y afecta el total de caja.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  `;
};

// ============================================================
// GUARDAR EGRESO
// ============================================================
window.guardarEgreso = function() {
  const concepto = document.getElementById('egreso-concepto').value.trim();
  const monto = parseFloat(document.getElementById('egreso-monto').value);
  const fecha = document.getElementById('egreso-fecha').value;
  const metodo = document.getElementById('egreso-metodo').value;
  const comprobante = document.getElementById('egreso-comprobante').value.trim();
  const notas = document.getElementById('egreso-notas').value.trim();

  if (!concepto) { alert('Ingresa el concepto.'); return; }
  if (!monto || monto <= 0) { alert('Ingresa un monto válido.'); return; }
  if (!fecha) { alert('Selecciona una fecha.'); return; }
  if (!metodo) { alert('Selecciona un método de pago.'); return; }

  const data = {
    tipo: 'egreso',
    concepto: concepto,
    monto: monto,
    fecha: fecha,
    metodo: metodo,
    comprobante: comprobante,
    notas: notas,
    estado: 'completado',
    registrado_por: 'Admin',
    paciente: '—',
    created_at: new Date().toISOString()
  };

  db.collection('pagos').add(data)
    .then(() => {
      showToast('✅ Egreso registrado correctamente.');
      renderCaja();
    })
    .catch(err => {
      alert('❌ Error al registrar egreso: ' + err.message);
    });
};

// ============================================================
// VISTA: REGISTRAR PAGO
// ============================================================
window.renderRegistrarPagoView = function() {
  const el = $('view-caja');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Registrar pago</div>
        <div class="page-subtitle">Nuevo ingreso en caja</div>
      </div>
      <a href="#" class="btn btn-secondary" onclick="renderCaja()">← Volver</a>
    </div>
    <form id="form-pago" onsubmit="event.preventDefault(); guardarPago()">
      <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Datos del pago</div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">Paciente *</label>
                <select name="paciente_id" id="pago-paciente" class="form-control" required>
                  <option value="">— Seleccionar paciente —</option>
                </select>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Monto *</label>
                  <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
                    <span style="padding:8px 10px;background:var(--bg);color:var(--text-muted);font-size:13px;border-right:1px solid var(--border);">$</span>
                    <input type="number" name="monto" id="pago-monto" step="0.01" min="0.01" style="border:none;padding:8px 10px;flex:1;outline:none;font-size:13px;" placeholder="0.00" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha *</label>
                  <input type="date" name="fecha_pago" id="pago-fecha" class="form-control" value="${new Date().toISOString().slice(0,10)}" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Método de pago *</label>
                <select name="metodo_pago" id="pago-metodo" class="form-control" required>
                  <option value="">— Seleccionar —</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta_credito">Tarjeta crédito</option>
                  <option value="tarjeta_debito">Tarjeta débito</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="obra_social">Obra social</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nro. comprobante</label>
                <input type="text" name="numero_comprobante" id="pago-comprobante" class="form-control" placeholder="Factura, recibo, etc.">
              </div>
              <div class="form-group">
                <label class="form-label">Notas</label>
                <textarea name="notas" id="pago-notas" class="form-control" rows="2"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">Vinculación (opcional)</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <div class="form-group">
                <label class="form-label">ID Turno</label>
                <input type="number" name="turno_id" id="pago-turno" class="form-control" placeholder="Nro. turno">
                <span class="form-hint">Dejá vacío si no aplica</span>
              </div>
              <div class="form-group">
                <label class="form-label">ID Presupuesto</label>
                <input type="number" name="presupuesto_id" id="pago-presupuesto" class="form-control" placeholder="Nro. presupuesto">
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Registrar pago</button>
          <a href="#" class="btn btn-secondary btn-block" style="text-align:center;" onclick="renderCaja()">Cancelar</a>
        </div>
      </div>
    </form>
  `;

  // Cargar pacientes en el select
  db.collection('pacientes').orderBy('nombre').get()
    .then(snapshot => {
      const select = document.getElementById('pago-paciente');
      snapshot.forEach(doc => {
        const data = doc.data();
        const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${nombre} (PAC-${String(doc.id).slice(0,6).toUpperCase()})`;
        select.appendChild(option);
      });
    })
    .catch(err => console.error('Error cargando pacientes:', err));
};

// ============================================================
// GUARDAR PAGO
// ============================================================
window.guardarPago = function() {
  const pacienteId = document.getElementById('pago-paciente').value;
  const monto = parseFloat(document.getElementById('pago-monto').value);
  const fecha = document.getElementById('pago-fecha').value;
  const metodo = document.getElementById('pago-metodo').value;
  const comprobante = document.getElementById('pago-comprobante').value.trim();
  const notas = document.getElementById('pago-notas').value.trim();
  const turnoId = document.getElementById('pago-turno').value.trim();
  const presupuestoId = document.getElementById('pago-presupuesto').value.trim();

  if (!pacienteId) { alert('Selecciona un paciente.'); return; }
  if (!monto || monto <= 0) { alert('Ingresa un monto válido.'); return; }
  if (!fecha) { alert('Selecciona una fecha.'); return; }
  if (!metodo) { alert('Selecciona un método de pago.'); return; }

  const select = document.getElementById('pago-paciente');
  const pacienteNombre = select.options[select.selectedIndex].text;

  const data = {
    tipo: 'ingreso',
    paciente_id: pacienteId,
    paciente: pacienteNombre,
    monto: monto,
    fecha: fecha,
    metodo: metodo,
    comprobante: comprobante,
    notas: notas,
    turno_id: turnoId || null,
    presupuesto_id: presupuestoId || null,
    estado: 'completado',
    registrado_por: 'Admin',
    created_at: new Date().toISOString()
  };

  db.collection('pagos').add(data)
    .then(() => {
      showToast('✅ Pago registrado correctamente.');
      renderCaja();
    })
    .catch(err => {
      alert('❌ Error al registrar pago: ' + err.message);
    });
};

// ============================================================
// NOTA: Las funciones showToast, $, db deben estar definidas globalmente
// ============================================================
