// ============================================================
// PRESUPUESTOS - SPA (Single Page Application)
// ============================================================

// ============================================================
// RENDER PRESUPUESTOS PRINCIPAL (LISTA)
// ============================================================
function renderPresupuestos() {
  const el = $('view-presupuestos');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Presupuestos</div>
        <div class="page-subtitle" id="presupuestos-count">Cargando...</div>
      </div>
      <a href="#" class="btn btn-primary" onclick="renderNuevoPresupuestoView()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nuevo presupuesto
      </a>
    </div>

    <!-- Buscador -->
    <div class="card" style="margin-bottom:12px;padding:12px 16px;">
      <div style="display:flex;gap:8px;align-items:center;">
        <div style="position:relative;flex:1;max-width:420px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"
               style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="pres-search-input" value=""
                 placeholder="Buscar por número de presupuesto o paciente…"
                 class="form-control" style="padding-left:32px"
                 oninput="aplicarFiltrosPresupuestos()">
        </div>
        <button type="button" class="btn btn-secondary" onclick="aplicarFiltrosPresupuestos()">Buscar</button>
        <button type="button" class="btn btn-secondary" onclick="limpiarFiltrosPresupuestos()">Limpiar</button>
      </div>
    </div>

    <!-- Filtros de estado -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-primary" data-estado="todos" onclick="setFilterEstadoPresupuesto('todos')">Todos</button>
      <button class="btn btn-sm btn-secondary" data-estado="pendiente" onclick="setFilterEstadoPresupuesto('pendiente')">Pendiente</button>
      <button class="btn btn-sm btn-secondary" data-estado="aprobado" onclick="setFilterEstadoPresupuesto('aprobado')">Aprobado</button>
      <button class="btn btn-sm btn-secondary" data-estado="rechazado" onclick="setFilterEstadoPresupuesto('rechazado')">Rechazado</button>
      <button class="btn btn-sm btn-secondary" data-estado="vencido" onclick="setFilterEstadoPresupuesto('vencido')">Vencido</button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div class="table-wrap">
        <table class="table" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Número</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Paciente</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Profesional</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Emisión</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Vencimiento</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Total</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Estado</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;"></th>
            </tr>
          </thead>
          <tbody id="presupuestos-list">
            <!-- Generado por JS -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Agregar estilos responsive
  if (!document.getElementById('pres-mobile-styles')) {
    const style = document.createElement('style');
    style.id = 'pres-mobile-styles';
    style.textContent = `
      @media (max-width: 768px) {
        .table th:nth-child(3), .table td:nth-child(3),
        .table th:nth-child(4), .table td:nth-child(4),
        .table th:nth-child(5), .table td:nth-child(5) { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  cargarPresupuestos();
}

// ============================================================
// CARGAR PRESUPUESTOS DESDE FIRESTORE
// ============================================================
function cargarPresupuestos() {
  db.collection('presupuestos').orderBy('fecha_emision', 'desc').onSnapshot((snapshot) => {
    const presupuestos = [];
    snapshot.forEach(doc => {
      presupuestos.push({ id: doc.id, ...doc.data() });
    });
    window._presupuestosData = presupuestos;
    aplicarFiltrosPresupuestos();
  }, (error) => {
    console.error('Error cargando presupuestos:', error);
    $('presupuestos-list').innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">Error al cargar los datos.</td></tr>`;
  });
}

// ============================================================
// APLICAR FILTROS
// ============================================================
let filterEstadoPresupuesto = 'todos';

window.aplicarFiltrosPresupuestos = function() {
  const searchInput = $('pres-search-input');
  const busqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtrados = window._presupuestosData || [];

  if (busqueda) {
    filtrados = filtrados.filter(p => {
      const numero = (p.numero || '').toLowerCase();
      const paciente = (p.paciente || '').toLowerCase();
      return numero.includes(busqueda) || paciente.includes(busqueda);
    });
  }

  if (filterEstadoPresupuesto !== 'todos') {
    filtrados = filtrados.filter(p => p.estado === filterEstadoPresupuesto);
  }

  const countEl = $('presupuestos-count');
  if (countEl) {
    countEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'registro' : 'registros'}`;
  }

  renderTablaPresupuestos(filtrados);
};

window.setFilterEstadoPresupuesto = function(estado) {
  filterEstadoPresupuesto = estado;
  document.querySelectorAll('[data-estado]').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    if (btn.dataset.estado === estado) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    }
  });
  aplicarFiltrosPresupuestos();
};

window.limpiarFiltrosPresupuestos = function() {
  const searchInput = $('pres-search-input');
  if (searchInput) searchInput.value = '';
  setFilterEstadoPresupuesto('todos');
};

// ============================================================
// RENDER TABLA
// ============================================================
function renderTablaPresupuestos(presupuestos) {
  const tbody = $('presupuestos-list');
  if (!tbody) return;

  if (presupuestos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8;">No hay presupuestos que coincidan con los filtros.</td></tr>`;
    return;
  }

  const estadoBadges = {
    'pendiente': 'badge-amber',
    'aprobado': 'badge-green',
    'rechazado': 'badge-red',
    'vencido': 'badge-gray'
  };
  const estadoTextos = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'vencido': 'Vencido'
  };

  let html = '';
  presupuestos.forEach(p => {
    const numero = p.numero || 'PRES-' + String(p.id).slice(0, 6).toUpperCase();
    const paciente = p.paciente || '—';
    const profesional = p.profesional || '—';
    const fechaEmision = p.fecha_emision || '—';
    const fechaVencimiento = p.fecha_vencimiento || '—';
    const total = p.total || 0;
    const estado = p.estado || 'pendiente';
    const estadoClase = estadoBadges[estado] || 'badge-gray';
    const estadoTexto = estadoTextos[estado] || estado;

    html += `
      <tr>
        <td style="font-weight:600;font-size:12px;">${numero}</td>
        <td>${paciente}</td>
        <td style="font-size:12px;color:var(--text-muted);">${profesional}</td>
        <td style="font-size:12px;">${fechaEmision}</td>
        <td style="font-size:12px;color:var(--text-muted);">${fechaVencimiento}</td>
        <td style="text-align:right;font-weight:600;">$${Number(total).toLocaleString()}</td>
        <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td>
          <a href="#" class="btn btn-sm btn-secondary" onclick="renderDetallePresupuestoView('${p.id}')">Ver</a>
          <a href="#" class="btn btn-sm btn-secondary" onclick="renderEditarPresupuestoView('${p.id}')">Editar</a>
          <button type="button" class="btn btn-sm" style="color:var(--danger,#e53e3e);border-color:var(--danger,#e53e3e);background:transparent;margin-left:4px;" onclick="eliminarPresupuesto('${p.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================
// FUNCIÓN PARA VOLVER A LA LISTA
// ============================================================
function volverAListaPresupuestos() {
  renderPresupuestos();
}

// ============================================================
// VER PRESUPUESTO (DETALLE EN EL CONTENEDOR)
// ============================================================
window.renderDetallePresupuestoView = function(id) {
  const el = $('view-presupuestos');
  el.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Cargando...</div></div>
      <a href="#" class="btn btn-secondary" onclick="volverAListaPresupuestos()">← Volver</a>
    </div>
    <div style="text-align:center;padding:40px;color:var(--text-muted);">Obteniendo datos...</div>
  `;

  db.collection('presupuestos').doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        el.innerHTML = `<div class="alert alert-danger">Presupuesto no encontrado</div>`;
        return;
      }
      const presupuesto = { id: doc.id, ...doc.data() };

      // Obtener paciente y profesional
      const promises = [];
      let pacienteData = null, profesionalData = null;
      if (presupuesto.paciente_id) {
        promises.push(db.collection('pacientes').doc(presupuesto.paciente_id).get()
          .then(d => { pacienteData = d.exists ? d.data() : null; }));
      }
      if (presupuesto.profesional_id) {
        promises.push(db.collection('profesionales').doc(presupuesto.profesional_id).get()
          .then(d => { profesionalData = d.exists ? d.data() : null; }));
      }

      return Promise.all(promises).then(() => {
        const html = renderDetallePresupuestoHTML(presupuesto, pacienteData, profesionalData);
        el.innerHTML = html;
      });
    })
    .catch(err => {
      el.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    });
};

// ============================================================
// RENDER DETALLE PRESUPUESTO (HTML para el contenedor)
// ============================================================
function renderDetallePresupuestoHTML(presupuesto, pacienteData, profesionalData) {
  const estadoBadges = {
    'pendiente': 'badge-amber',
    'aprobado': 'badge-green',
    'rechazado': 'badge-red',
    'vencido': 'badge-gray'
  };
  const estadoTextos = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'vencido': 'Vencido'
  };

  const estado = presupuesto.estado || 'pendiente';
  const estadoClase = estadoBadges[estado] || 'badge-gray';
  const estadoTexto = estadoTextos[estado] || estado;

  const fechaEmision = presupuesto.fecha_emision ? formatDate(presupuesto.fecha_emision) : '—';
  const fechaVencimiento = presupuesto.fecha_vencimiento ? formatDate(presupuesto.fecha_vencimiento) : '—';

  const pacienteNombre = pacienteData
    ? `${pacienteData.nombre || ''} ${pacienteData.apellido || ''}`.trim() || 'Sin nombre'
    : (presupuesto.paciente || '—');
  const pacienteDNI = pacienteData?.dni || '';

  const profesionalNombre = profesionalData
    ? `${profesionalData.nombre || ''} ${profesionalData.apellido || ''}`.trim() || 'Sin nombre'
    : (presupuesto.profesional || '—');
  const profesionalMatricula = profesionalData?.matricula || '';

  const items = presupuesto.items || [];
  let itemsHTML = '';
  if (items.length === 0) {
    itemsHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">Sin ítems registrados</td></tr>`;
  } else {
    items.forEach(item => {
      const desc = item.descripcion || '';
      const diente = item.diente || '';
      const cantidad = item.cantidad || 1;
      const precio = item.precio || 0;
      const subtotal = item.subtotal || (precio * cantidad);
      itemsHTML += `
        <tr>
          <td>${desc}</td>
          <td style="text-align:center;font-size:12px;color:var(--text-muted);">${diente}</td>
          <td style="text-align:center;">${cantidad}</td>
          <td style="text-align:right;">$${Number(precio).toLocaleString()}</td>
          <td style="text-align:right;font-weight:600;">$${Number(subtotal).toLocaleString()}</td>
        </tr>
      `;
    });
  }

  const total = presupuesto.total || 0;
  const descuento = presupuesto.descuento || 0;

  // Botones para cambiar estado
  const estadosPosibles = ['pendiente', 'aprobado', 'rechazado', 'vencido'];
  let botonesEstadoHTML = '';
  estadosPosibles.forEach(est => {
    if (est === estado) {
      botonesEstadoHTML += `
        <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--bg);border-radius:6px;">
          <span class="badge ${estadoBadges[est]}">${estadoTextos[est]}</span>
          <span style="font-size:11px;color:var(--text-muted);">(actual)</span>
        </div>
      `;
    } else {
      botonesEstadoHTML += `
        <form onsubmit="event.preventDefault(); cambiarEstadoPresupuesto('${presupuesto.id}', '${est}')">
          <button type="submit" class="btn btn-sm btn-block btn-secondary">${estadoTextos[est]}</button>
        </form>
      `;
    }
  });

  return `
    <div class="page-header">
      <div>
        <div class="page-title">${presupuesto.numero || 'PRES-' + presupuesto.id.slice(0,6).toUpperCase()}</div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;">
          <span class="badge ${estadoClase}">${estadoTexto}</span>
          <span style="font-size:13px;color:var(--text-muted);">· Emitido el ${fechaEmision}</span>
          <span style="font-size:13px;color:var(--text-muted);">· Vence ${fechaVencimiento}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button onclick="window.print()" class="btn btn-secondary">Imprimir</button>
        <a href="#" class="btn btn-secondary" onclick="volverAListaPresupuestos()">← Volver</a>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start;">
      <!-- Columna principal -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Datos paciente/profesional -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
            <div>
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Paciente</div>
              <div style="font-size:16px;font-weight:700;margin-top:2px;">${pacienteNombre}</div>
              ${pacienteDNI ? `<div style="font-size:12px;color:var(--text-muted);">DNI: ${pacienteDNI}</div>` : ''}
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Profesional</div>
              <div style="font-size:14px;font-weight:600;margin-top:2px;">${profesionalNombre}</div>
              ${profesionalMatricula ? `<div style="font-size:12px;color:var(--text-muted);">Matrícula: ${profesionalMatricula}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="card">
          <table class="table" style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr>
                <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Descripción</th>
                <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:center;">Diente</th>
                <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:center;">Cant.</th>
                <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Precio</th>
                <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
            <tfoot>
              <tr style="border-top:2px solid var(--border);">
                <td colspan="3" style="text-align:right;font-size:14px;">Subtotal</td>
                <td colspan="2" style="text-align:right;font-weight:600;">$${Number(total + descuento).toLocaleString()}</td>
              </tr>
              ${descuento > 0 ? `<tr><td colspan="3" style="text-align:right;font-size:13px;color:var(--text-muted);">Descuento</td><td colspan="2" style="text-align:right;color:var(--text-muted);">- $${Number(descuento).toLocaleString()}</td></tr>` : ''}
              <tr>
                <td colspan="3" style="text-align:right;font-size:16px;font-weight:700;">TOTAL</td>
                <td colspan="2" style="text-align:right;font-size:18px;font-weight:700;color:var(--primary);">$${Number(total).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Lateral: cambio de estado -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="card">
          <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">Cambiar estado</div>
          <div style="display:flex;flex-direction:column;gap:6px;">${botonesEstadoHTML}</div>
        </div>
        <div class="card" style="font-size:11px;color:var(--text-muted);">
          Creado el ${presupuesto.created_at ? formatDate(presupuesto.created_at) : '—'}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// CAMBIAR ESTADO (desde detalle)
// ============================================================
window.cambiarEstadoPresupuesto = function(id, nuevoEstado) {
  if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;
  db.collection('presupuestos').doc(id).update({
    estado: nuevoEstado,
    updated_at: new Date().toISOString()
  })
  .then(() => {
    showToast(`✅ Estado actualizado a ${nuevoEstado}.`);
    renderDetallePresupuestoView(id); // refrescar detalle
  })
  .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// NUEVO PRESUPUESTO (FORMULARIO EN CONTENEDOR)
// ============================================================
window.renderNuevoPresupuestoView = function() {
  const el = $('view-presupuestos');
  el.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Nuevo presupuesto</div></div>
      <a href="#" class="btn btn-secondary" onclick="volverAListaPresupuestos()">← Volver</a>
    </div>
    <div id="form-presupuesto-container">
      <!-- El formulario se genera con JS después de cargar pacientes/profesionales -->
      <div style="text-align:center;padding:40px;color:var(--text-muted);">Cargando datos...</div>
    </div>
  `;

  // Cargar pacientes y profesionales para los selects
  let pacientesHTML = '<option value="">— Seleccionar paciente —</option>';
  let profesionalesHTML = '<option value="">— Seleccionar profesional —</option>';

  Promise.all([
    db.collection('pacientes').orderBy('nombre').get(),
    db.collection('profesionales').orderBy('nombre').get()
  ]).then(([pacientesSnap, profSnap]) => {
    pacientesSnap.forEach(d => {
      const p = d.data();
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
      pacientesHTML += `<option value="${d.id}">${nombre}</option>`;
    });
    profSnap.forEach(d => {
      const p = d.data();
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
      profesionalesHTML += `<option value="${d.id}">${nombre}</option>`;
    });

    // Generar el formulario
    const formHtml = generarFormularioPresupuesto(pacientesHTML, profesionalesHTML, null);
    document.getElementById('form-presupuesto-container').innerHTML = formHtml;
    // Inicializar lógica de ítems
    inicializarItemsPresupuesto();
  }).catch(err => {
    document.getElementById('form-presupuesto-container').innerHTML = `<div class="alert alert-danger">Error cargando datos: ${err.message}</div>`;
  });
};

// ============================================================
// EDITAR PRESUPUESTO (FORMULARIO EN CONTENEDOR)
// ============================================================
window.renderEditarPresupuestoView = function(id) {
  const el = $('view-presupuestos');
  el.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Editar presupuesto</div></div>
      <a href="#" class="btn btn-secondary" onclick="volverAListaPresupuestos()">← Volver</a>
    </div>
    <div id="form-presupuesto-container">
      <div style="text-align:center;padding:40px;color:var(--text-muted);">Cargando datos...</div>
    </div>
  `;

  Promise.all([
    db.collection('presupuestos').doc(id).get(),
    db.collection('pacientes').orderBy('nombre').get(),
    db.collection('profesionales').orderBy('nombre').get()
  ]).then(([presDoc, pacientesSnap, profSnap]) => {
    if (!presDoc.exists) {
      document.getElementById('form-presupuesto-container').innerHTML = `<div class="alert alert-danger">Presupuesto no encontrado</div>`;
      return;
    }
    const presupuesto = { id: presDoc.id, ...presDoc.data() };

    let pacientesHTML = '<option value="">— Seleccionar paciente —</option>';
    pacientesSnap.forEach(d => {
      const p = d.data();
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
      const selected = d.id === presupuesto.paciente_id ? 'selected' : '';
      pacientesHTML += `<option value="${d.id}" ${selected}>${nombre}</option>`;
    });

    let profesionalesHTML = '<option value="">— Seleccionar profesional —</option>';
    profSnap.forEach(d => {
      const p = d.data();
      const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
      const selected = d.id === presupuesto.profesional_id ? 'selected' : '';
      profesionalesHTML += `<option value="${d.id}" ${selected}>${nombre}</option>`;
    });

    const formHtml = generarFormularioPresupuesto(pacientesHTML, profesionalesHTML, presupuesto);
    document.getElementById('form-presupuesto-container').innerHTML = formHtml;
    inicializarItemsPresupuesto(presupuesto.items || []);
    // Si tiene items, agregarlos
    if (presupuesto.items && presupuesto.items.length > 0) {
      // Ya se inicializan en inicializarItemsPresupuesto con los items pasados
    }
    // Setear descuento
    const descInput = document.getElementById('descuento');
    if (descInput) descInput.value = presupuesto.descuento || 0;
    recalcPresupuesto();

    // Guardar referencia del ID para actualización
    window._editPresupuestoId = id;
  }).catch(err => {
    document.getElementById('form-presupuesto-container').innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  });
};

// ============================================================
// GENERAR FORMULARIO (común para nuevo y edición)
// ============================================================
function generarFormularioPresupuesto(pacientesHTML, profesionalesHTML, data) {
  const fechaEmision = data?.fecha_emision || new Date().toISOString().slice(0, 10);
  const fechaVencimiento = data?.fecha_vencimiento || new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10);
  const numero = data?.numero || '';
  const notas = data?.notas || '';
  const estado = data?.estado || 'pendiente';
  const descuento = data?.descuento || 0;
  const isEdit = data !== null;

  return `
    <form id="form-presupuesto" onsubmit="event.preventDefault(); guardarPresupuestoForm()">
      <input type="hidden" name="obra_social_id" id="hid-os-id" value="">
      <input type="hidden" name="plan_id" id="hid-plan-id" value="">

      <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;">
        <!-- Columna principal -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Paciente y profesional</div>
            <div class="form-grid">
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Paciente *</label>
                <select name="paciente_id" id="sel-paciente" class="form-control" required onchange="onPacienteChange(this)">
                  ${pacientesHTML}
                </select>
                <div id="os-badge" style="display:none;margin-top:8px;padding:8px 12px;background:var(--teal-light, #e0f2f1);border-radius:8px;font-size:12px;color:var(--teal, #00796b);">
                  <strong>Obra social:</strong> <span id="os-badge-texto"></span>
                </div>
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Profesional *</label>
                <select name="odontologo_id" id="sel-profesional" class="form-control" required>
                  ${profesionalesHTML}
                </select>
              </div>
            </div>
          </div>

          <!-- Ítems -->
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Ítems</div>
              <button type="button" class="btn btn-sm btn-secondary" onclick="addItemPresupuesto()">+ Agregar ítem</button>
            </div>
            <div id="items-header" style="display:grid;grid-template-columns:1fr 90px 50px 70px 70px 80px 32px;gap:6px;font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;padding:0 2px;">
              <div>Descripción</div>
              <div style="text-align:right;">Precio</div>
              <div style="text-align:center;">Cant.</div>
              <div style="text-align:center;" id="hdr-cob">Cob. OS%</div>
              <div style="text-align:right;" id="hdr-pac">Pte. paga</div>
              <div style="text-align:right;">Subtotal</div>
              <div></div>
            </div>
            <div id="items-container"></div>

            <!-- Agregar desde catálogo -->
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
              <label class="form-label">Agregar desde catálogo</label>
              <select id="cat-select" class="form-control" onchange="addFromCatalog(this)">
                <option value="">— Seleccionar tratamiento —</option>
                <!-- Aquí se cargarán desde Firestore en la inicialización -->
              </select>
            </div>
          </div>
        </div>

        <!-- Columna lateral -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">Fechas</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <div class="form-group">
                <label class="form-label">Número</label>
                <input type="text" name="numero" class="form-control" value="${numero}" placeholder="Ej: PRES-2024-001">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha emisión</label>
                <input type="date" name="fecha_emision" class="form-control" value="${fechaEmision}">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha vencimiento</label>
                <input type="date" name="fecha_vencimiento" class="form-control" value="${fechaVencimiento}">
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <select name="estado" class="form-control">
                  <option value="pendiente" ${estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="aprobado" ${estado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
                  <option value="rechazado" ${estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                  <option value="vencido" ${estado === 'vencido' ? 'selected' : ''}>Vencido</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">Totales</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;">
                <span>Subtotal</span><span id="lbl-subtotal" style="font-weight:600;">$0</span>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Descuento ($)</label>
                <input type="number" name="descuento" id="descuento" class="form-control" step="0.01" min="0" value="${descuento}" oninput="recalcPresupuesto()">
              </div>
              <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;padding-top:8px;border-top:1px solid var(--border);">
                <span>Total</span><span id="lbl-total">$0</span>
              </div>
              <div id="os-split" style="display:none;padding-top:8px;border-top:1px dashed var(--border);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--primary);">
                  <span>↳ Paciente paga</span><span id="lbl-total-pac" style="font-weight:700;">$0</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:#0891b2;">
                  <span>↳ Cubre obra social</span><span id="lbl-total-os" style="font-weight:700;">$0</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea name="notas" class="form-control" rows="3">${notas}</textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block">${isEdit ? 'Actualizar' : 'Crear'} presupuesto</button>
          <a href="#" class="btn btn-secondary btn-block" style="text-align:center;" onclick="volverAListaPresupuestos()">Cancelar</a>
        </div>
      </div>
    </form>
  `;
}

// ============================================================
// INICIALIZAR ITEMS Y CATÁLOGO
// ============================================================
function inicializarItemsPresupuesto(items = []) {
  // Cargar catálogo de tratamientos (para el select)
  const catSelect = document.getElementById('cat-select');
  if (catSelect) {
    db.collection('tratamientos').orderBy('nombre').get().then(snap => {
      catSelect.innerHTML = '<option value="">— Seleccionar tratamiento —</option>';
      snap.forEach(doc => {
        const t = doc.data();
        const precio = t.precio || 0;
        const option = document.createElement('option');
        option.value = doc.id;
        option.dataset.nombre = t.nombre || '';
        option.dataset.precio = precio;
        option.textContent = `${t.nombre || 'Sin nombre'} — $${Number(precio).toLocaleString()}`;
        catSelect.appendChild(option);
      });
    }).catch(err => console.error('Error cargando catálogo:', err));
  }

  // Agregar items existentes (si es edición)
  const container = document.getElementById('items-container');
  if (!container) return;
  container.innerHTML = '';
  if (items.length === 0) {
    // Agregar un item vacío por defecto
    addItemPresupuesto();
  } else {
    items.forEach(item => {
      addItemPresupuesto(item.descripcion, item.precio, item.cantidad, item.porcentaje || 0, item.tratamiento_id || '');
    });
  }
  recalcPresupuesto();
}

// ============================================================
// AGREGAR ITEM AL FORMULARIO
// ============================================================
window.addItemPresupuesto = function(nombre, precio, cantidad, pct, tratId) {
  const container = document.getElementById('items-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'pres-item';
  row.style.cssText = 'display:grid;grid-template-columns:1fr 90px 50px 70px 70px 80px 32px;gap:6px;margin-bottom:6px;align-items:center;';

  const inputNombre = document.createElement('input');
  inputNombre.type = 'text';
  inputNombre.className = 'form-control item-nombre';
  inputNombre.placeholder = 'Descripción';
  inputNombre.required = true;
  inputNombre.value = nombre || '';
  inputNombre.oninput = recalcPresupuesto;

  const inputPrecio = document.createElement('input');
  inputPrecio.type = 'number';
  inputPrecio.className = 'form-control item-precio';
  inputPrecio.placeholder = '0';
  inputPrecio.step = '0.01';
  inputPrecio.min = '0';
  inputPrecio.style.textAlign = 'right';
  inputPrecio.value = precio || 0;
  inputPrecio.oninput = recalcPresupuesto;

  const inputCantidad = document.createElement('input');
  inputCantidad.type = 'number';
  inputCantidad.className = 'form-control item-cantidad';
  inputCantidad.value = cantidad || 1;
  inputCantidad.min = '1';
  inputCantidad.style.textAlign = 'center';
  inputCantidad.oninput = recalcPresupuesto;

  const inputPct = document.createElement('input');
  inputPct.type = 'number';
  inputPct.className = 'form-control item-pct';
  inputPct.value = pct || 0;
  inputPct.min = '0';
  inputPct.max = '100';
  inputPct.step = '0.5';
  inputPct.style.textAlign = 'center';
  inputPct.placeholder = '%';
  inputPct.title = '% que cubre la obra social';
  inputPct.oninput = recalcPresupuesto;

  const labelPac = document.createElement('div');
  labelPac.className = 'item-pac-label';
  labelPac.style.cssText = 'font-size:12px;text-align:right;color:var(--primary);font-weight:600;';
  labelPac.textContent = '—';

  // Hidden para diente y tratamiento_id
  const inputDiente = document.createElement('input');
  inputDiente.type = 'hidden';
  inputDiente.className = 'item-diente';
  inputDiente.value = '';

  const inputTratId = document.createElement('input');
  inputTratId.type = 'hidden';
  inputTratId.className = 'item-trat-id';
  inputTratId.value = tratId || '';

  const btnRemove = document.createElement('button');
  btnRemove.type = 'button';
  btnRemove.style.cssText = 'background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:0;line-height:1;';
  btnRemove.innerHTML = '✕';
  btnRemove.onclick = function() { row.remove(); recalcPresupuesto(); };

  row.appendChild(inputNombre);
  row.appendChild(inputPrecio);
  row.appendChild(inputCantidad);
  row.appendChild(inputPct);
  row.appendChild(labelPac);
  row.appendChild(inputDiente);
  row.appendChild(inputTratId);
  row.appendChild(btnRemove);

  container.appendChild(row);
  recalcPresupuesto();
};

// ============================================================
// AGREGAR DESDE CATÁLOGO
// ============================================================
window.addFromCatalog = function(sel) {
  const opt = sel.options[sel.selectedIndex];
  if (!opt.value) return;
  const nombre = opt.dataset.nombre || '';
  const precio = parseFloat(opt.dataset.precio) || 0;
  const tratId = opt.value;
  addItemPresupuesto(nombre, precio, 1, 0, tratId);
  sel.value = '';
};

// ============================================================
// RECALCULAR TOTALES DEL FORMULARIO
// ============================================================
window.recalcPresupuesto = function() {
  const rows = document.querySelectorAll('.pres-item');
  let subtotal = 0, totalOs = 0;
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
        pacLabel.textContent = '$' + pac.toLocaleString('es-AR', {maximumFractionDigits:0});
      } else {
        pacLabel.textContent = '—';
      }
    }
  });

  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const total = Math.max(0, subtotal - descuento);
  const totalPac = Math.max(0, total - totalOs);

  document.getElementById('lbl-subtotal').textContent = '$' + subtotal.toLocaleString('es-AR', {maximumFractionDigits:0});
  document.getElementById('lbl-total').textContent = '$' + total.toLocaleString('es-AR', {maximumFractionDigits:0});

  const split = document.getElementById('os-split');
  if (totalOs > 0) {
    document.getElementById('lbl-total-pac').textContent = '$' + totalPac.toLocaleString('es-AR', {maximumFractionDigits:0});
    document.getElementById('lbl-total-os').textContent = '$' + totalOs.toLocaleString('es-AR', {maximumFractionDigits:0});
    split.style.display = 'block';
  } else {
    split.style.display = 'none';
  }
};

// ============================================================
// CAMBIO DE PACIENTE (carga cobertura)
// ============================================================
window.onPacienteChange = function(sel) {
  // Aquí podrías cargar la obra social del paciente desde Firestore
  // Como no tenemos un mapa predefinido, lo simulamos con una consulta
  const pacienteId = sel.value;
  if (!pacienteId) {
    document.getElementById('os-badge').style.display = 'none';
    document.getElementById('hid-os-id').value = '';
    document.getElementById('hid-plan-id').value = '';
    return;
  }
  db.collection('pacientes').doc(pacienteId).get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();
    const osId = data.obra_social_id || '';
    const planId = data.plan_id || '';
    document.getElementById('hid-os-id').value = osId;
    document.getElementById('hid-plan-id').value = planId;

    if (osId) {
      // Obtener nombre de OS
      db.collection('obras_sociales').doc(osId).get().then(osDoc => {
        const osNombre = osDoc.exists ? osDoc.data().nombre : 'OS';
        document.getElementById('os-badge-texto').textContent = osNombre + (planId ? ' — Plan ' + planId : '');
        document.getElementById('os-badge').style.display = 'block';
      }).catch(() => {});
    } else {
      document.getElementById('os-badge').style.display = 'none';
    }
  }).catch(() => {});
};

// ============================================================
// GUARDAR PRESUPUESTO (Nuevo o Edición)
// ============================================================
window.guardarPresupuestoForm = function() {
  const form = document.getElementById('form-presupuesto');
  if (!form) return;

  // Validar paciente y profesional
  const pacienteId = form.querySelector('[name="paciente_id"]').value;
  const profesionalId = form.querySelector('[name="odontologo_id"]').value;
  if (!pacienteId) { alert('Selecciona un paciente.'); return; }
  if (!profesionalId) { alert('Selecciona un profesional.'); return; }

  // Obtener nombres de paciente y profesional (desde los selects)
  const pacienteNombre = form.querySelector('[name="paciente_id"]').options[form.querySelector('[name="paciente_id"]').selectedIndex].text;
  const profesionalNombre = form.querySelector('[name="odontologo_id"]').options[form.querySelector('[name="odontologo_id"]').selectedIndex].text;

  // Datos del formulario
  const numero = form.querySelector('[name="numero"]').value.trim() || 'PRES-' + Date.now().toString().slice(-6);
  const fechaEmision = form.querySelector('[name="fecha_emision"]').value;
  const fechaVencimiento = form.querySelector('[name="fecha_vencimiento"]').value;
  const estado = form.querySelector('[name="estado"]').value;
  const notas = form.querySelector('[name="notas"]').value;
  const descuento = parseFloat(document.getElementById('descuento').value) || 0;

  // Recoger ítems
  const rows = document.querySelectorAll('.pres-item');
  const items = [];
  let subtotal = 0;
  rows.forEach(row => {
    const nombre = row.querySelector('.item-nombre').value.trim();
    const precio = parseFloat(row.querySelector('.item-precio').value) || 0;
    const cantidad = parseInt(row.querySelector('.item-cantidad').value) || 1;
    const porcentaje = parseFloat(row.querySelector('.item-pct').value) || 0;
    const tratamientoId = row.querySelector('.item-trat-id').value || '';
    const diente = row.querySelector('.item-diente').value || '';
    if (nombre) {
      const sub = precio * cantidad;
      subtotal += sub;
      items.push({
        descripcion: nombre,
        precio: precio,
        cantidad: cantidad,
        porcentaje: porcentaje,
        subtotal: sub,
        tratamiento_id: tratamientoId,
        diente: diente
      });
    }
  });

  if (items.length === 0) { alert('Agrega al menos un ítem.'); return; }

  const total = Math.max(0, subtotal - descuento);

  const data = {
    numero,
    paciente_id: pacienteId,
    paciente: pacienteNombre,
    profesional_id: profesionalId,
    profesional: profesionalNombre,
    fecha_emision: fechaEmision || new Date().toISOString().slice(0, 10),
    fecha_vencimiento: fechaVencimiento || null,
    estado,
    notas,
    descuento,
    items,
    total,
    updated_at: new Date().toISOString()
  };

  // Determinar si es edición o nuevo
  const editId = window._editPresupuestoId || null;
  let promise;
  if (editId) {
    promise = db.collection('presupuestos').doc(editId).update(data);
  } else {
    data.created_at = new Date().toISOString();
    promise = db.collection('presupuestos').add(data);
  }

  promise.then(() => {
    showToast(editId ? '✅ Presupuesto actualizado.' : '✅ Presupuesto creado.');
    window._editPresupuestoId = null;
    volverAListaPresupuestos();
  }).catch(err => {
    alert('❌ Error: ' + err.message);
  });
};

// ============================================================
// ELIMINAR PRESUPUESTO
// ============================================================
window.eliminarPresupuesto = function(id) {
  if (!confirm('¿Eliminar este presupuesto?')) return;
  db.collection('presupuestos').doc(id).delete()
    .then(() => {
      showToast('🗑 Presupuesto eliminado.');
      // Si estamos en detalle, volver a lista
      if (document.querySelector('#view-presupuestos .page-title')?.textContent.includes('PRES-')) {
        volverAListaPresupuestos();
      }
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// FUNCIÓN AUXILIAR: FORMATO DE FECHA
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================================
// NOTA: El resto de funciones (editar, etc.) ya están cubiertas
// ============================================================
