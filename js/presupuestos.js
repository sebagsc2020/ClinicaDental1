// ============================================================
// PRESUPUESTOS 
// ============================================================
function renderPresupuestos() {
  const el = $('view-presupuestos');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Presupuestos</div>
        <div class="page-subtitle" id="presupuestos-count">Cargando...</div>
      </div>
      <a href="#" class="btn btn-primary" onclick="openModalNuevoPresupuesto()">
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

  // Filtro por búsqueda
  if (busqueda) {
    filtrados = filtrados.filter(p => {
      const numero = (p.numero || '').toLowerCase();
      const paciente = (p.paciente || '').toLowerCase();
      return numero.includes(busqueda) || paciente.includes(busqueda);
    });
  }

  // Filtro por estado
  if (filterEstadoPresupuesto !== 'todos') {
    filtrados = filtrados.filter(p => p.estado === filterEstadoPresupuesto);
  }

  // Actualizar contador
  const countEl = $('presupuestos-count');
  if (countEl) {
    countEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'registro' : 'registros'}`;
  }

  renderTablaPresupuestos(filtrados);
};

// ============================================================
// SET FILTRO ESTADO
// ============================================================
window.setFilterEstadoPresupuesto = function(estado) {
  filterEstadoPresupuesto = estado;
  // Actualizar estilo de botones
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

// ============================================================
// LIMPIAR FILTROS
// ============================================================
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

  // Mapeo de estados a badges
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
          <a href="#" class="btn btn-sm btn-secondary" onclick="verPresupuesto('${p.id}')">Ver</a>
          <a href="#" class="btn btn-sm btn-secondary" onclick="editarPresupuesto('${p.id}')">Editar</a>
          <button type="button" class="btn btn-sm" style="color:var(--danger,#e53e3e);border-color:var(--danger,#e53e3e);background:transparent;margin-left:4px;" onclick="eliminarPresupuesto('${p.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================
// FUNCIONES CRUD
// ============================================================

// --- Ver presupuesto (DETALLE EN MODAL) ---
window.verPresupuesto = function(id) {
  // Mostrar indicador de carga
  const loadingHTML = `
    <div class="modal-title">📄 Cargando presupuesto…</div>
    <div style="text-align:center;padding:30px;color:var(--text-muted);">
      <div style="font-size:14px;">Obteniendo datos...</div>
    </div>
  `;
  openModal(loadingHTML);

  // Obtener el presupuesto
  db.collection('presupuestos').doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        closeModal();
        alert('Presupuesto no encontrado');
        return;
      }
      const presupuesto = { id: doc.id, ...doc.data() };

      // Obtener datos del paciente y profesional en paralelo
      const promises = [];
      let pacienteData = null;
      let profesionalData = null;

      if (presupuesto.paciente_id) {
        promises.push(
          db.collection('pacientes').doc(presupuesto.paciente_id).get()
            .then(d => { pacienteData = d.exists ? d.data() : null; })
        );
      }
      if (presupuesto.profesional_id) {
        promises.push(
          db.collection('profesionales').doc(presupuesto.profesional_id).get()
            .then(d => { profesionalData = d.exists ? d.data() : null; })
        );
      }

      return Promise.all(promises).then(() => {
        // Construir HTML del modal
        const html = renderDetallePresupuesto(presupuesto, pacienteData, profesionalData);
        // Reemplazar contenido del modal (ya abierto)
        const modalContent = document.querySelector('#modal-container .modal-content');
        if (modalContent) {
          modalContent.innerHTML = html;
        } else {
          // Si por alguna razón no existe, abrir de nuevo
          closeModal();
          openModal(html);
        }
      });
    })
    .catch(err => {
      closeModal();
      alert('❌ Error al cargar el presupuesto: ' + err.message);
    });
};

// ============================================================
// RENDER DETALLE PRESUPUESTO
// ============================================================
function renderDetallePresupuesto(presupuesto, pacienteData, profesionalData) {
  // Mapeo de estados a badges
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

  // Fechas formateadas
  const fechaEmision = presupuesto.fecha_emision ? formatDate(presupuesto.fecha_emision) : '—';
  const fechaVencimiento = presupuesto.fecha_vencimiento ? formatDate(presupuesto.fecha_vencimiento) : '—';

  // Datos del paciente
  const pacienteNombre = pacienteData
    ? `${pacienteData.nombre || ''} ${pacienteData.apellido || ''}`.trim() || 'Sin nombre'
    : (presupuesto.paciente || '—');
  const pacienteDNI = pacienteData?.dni || '';

  // Datos del profesional
  const profesionalNombre = profesionalData
    ? `${profesionalData.nombre || ''} ${profesionalData.apellido || ''}`.trim() || 'Sin nombre'
    : (presupuesto.profesional || '—');
  const profesionalMatricula = profesionalData?.matricula || '';

  // Ítems
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

  // Total
  const total = presupuesto.total || 0;

  // Botones de cambio de estado (excepto el actual, que se muestra como badge)
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
          <button type="submit" class="btn btn-sm btn-block btn-secondary">
            ${estadoTextos[est]}
          </button>
        </form>
      `;
    }
  });

  return `
    <div style="padding:4px 0;">
      <!-- Encabezado -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div>
          <div style="font-size:20px;font-weight:800;color:var(--text);">${presupuesto.numero || 'PRES-' + presupuesto.id.slice(0,6).toUpperCase()}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px;flex-wrap:wrap;">
            <span class="badge ${estadoClase}">${estadoTexto}</span>
            <span style="font-size:13px;color:var(--text-muted);">· Emitido el ${fechaEmision}</span>
            <span style="font-size:13px;color:var(--text-muted);">· Vence ${fechaVencimiento}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="closeModal()" class="btn btn-secondary">Cerrar</button>
          <button onclick="window.print()" class="btn btn-secondary">Imprimir</button>
        </div>
      </div>

      <!-- Grid: Paciente / Profesional -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div class="card" style="padding:14px 16px;">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Paciente</div>
          <div style="font-size:16px;font-weight:700;margin-top:2px;">${pacienteNombre}</div>
          ${pacienteDNI ? `<div style="font-size:12px;color:var(--text-muted);">DNI: ${pacienteDNI}</div>` : ''}
        </div>
        <div class="card" style="padding:14px 16px;">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Profesional</div>
          <div style="font-size:16px;font-weight:700;margin-top:2px;">${profesionalNombre}</div>
          ${profesionalMatricula ? `<div style="font-size:12px;color:var(--text-muted);">Matrícula: ${profesionalMatricula}</div>` : ''}
        </div>
      </div>

      <!-- Tabla de ítems -->
      <div class="card" style="margin-bottom:20px;overflow-x:auto;">
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
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid var(--border);">
              <td colspan="4" style="text-align:right;font-size:14px;font-weight:700;">TOTAL</td>
              <td style="text-align:right;font-size:18px;font-weight:700;color:var(--primary);">
                $${Number(total).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Lateral: Cambio de estado (dentro del modal) -->
      <div style="display:grid;grid-template-columns:1fr 280px;gap:20px;">
        <div></div> <!-- espacio vacío -->
        <div class="card" style="padding:16px;">
          <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">Cambiar estado</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${botonesEstadoHTML}
          </div>
        </div>
      </div>

      <!-- Información de creación -->
      <div style="margin-top:12px;font-size:11px;color:var(--text-muted);text-align:right;">
        Creado el ${presupuesto.created_at ? formatDate(presupuesto.created_at) : '—'}
      </div>
    </div>
  `;
}

// ============================================================
// CAMBIAR ESTADO DEL PRESUPUESTO (desde el detalle)
// ============================================================
window.cambiarEstadoPresupuesto = function(id, nuevoEstado) {
  if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

  db.collection('presupuestos').doc(id).update({
    estado: nuevoEstado,
    updated_at: new Date().toISOString()
  })
  .then(() => {
    showToast(`✅ Estado actualizado a ${nuevoEstado}.`);
    // Cerrar el modal y refrescar la lista
    closeModal();
    // Recargar la lista para reflejar el cambio
    if (typeof aplicarFiltrosPresupuestos === 'function') {
      aplicarFiltrosPresupuestos();
    }
  })
  .catch(err => {
    alert('❌ Error al actualizar estado: ' + err.message);
  });
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
// EDICIÓN Y ELIMINACIÓN (ya existentes, se mantienen)
// ============================================================
window.editarPresupuesto = function(id) {
  db.collection('presupuestos').doc(id).get().then(doc => {
    if (!doc.exists) return alert('Presupuesto no encontrado');
    const data = doc.data();

    // Cargar pacientes para el select
    let pacientesHTML = '<option value="">Seleccionar paciente</option>';
    db.collection('pacientes').orderBy('nombre').get().then(snap => {
      snap.forEach(d => {
        const p = d.data();
        const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
        const selected = d.id === data.paciente_id ? 'selected' : '';
        pacientesHTML += `<option value="${d.id}" ${selected}>${nombre}</option>`;
      });

      // Cargar profesionales para el select
      let profesionalesHTML = '<option value="">Seleccionar profesional</option>';
      db.collection('profesionales').orderBy('nombre').get().then(snap2 => {
        snap2.forEach(d => {
          const p = d.data();
          const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre';
          const selected = d.id === data.profesional_id ? 'selected' : '';
          profesionalesHTML += `<option value="${d.id}" ${selected}>${nombre}</option>`;
        });

        openModal(`
          <div class="modal-title">✏️ Editar presupuesto</div>
          <div class="form-group">
            <label class="form-label">Número</label>
            <input class="form-control" id="f-pres-edit-numero" value="${data.numero || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Paciente *</label>
            <select class="form-control" id="f-pres-edit-paciente">${pacientesHTML}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Profesional</label>
            <select class="form-control" id="f-pres-edit-profesional">${profesionalesHTML}</select>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Fecha emisión</label>
              <input class="form-control" id="f-pres-edit-fecha-emision" type="date" value="${data.fecha_emision || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Fecha vencimiento</label>
              <input class="form-control" id="f-pres-edit-fecha-vencimiento" type="date" value="${data.fecha_vencimiento || ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Total</label>
            <input class="form-control" id="f-pres-edit-total" type="number" step="0.01" value="${data.total || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" id="f-pres-edit-estado">
              <option value="pendiente" ${data.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="aprobado" ${data.estado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
              <option value="rechazado" ${data.estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
              <option value="vencido" ${data.estado === 'vencido' ? 'selected' : ''}>Vencido</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="guardarEdicionPresupuesto('${id}')">Actualizar</button>
          </div>
        `);
      });
    });
  }).catch(err => alert('Error: ' + err.message));
};

window.guardarEdicionPresupuesto = function(id) {
  const numero = $('f-pres-edit-numero').value.trim();
  const pacienteId = $('f-pres-edit-paciente').value;
  const profesionalId = $('f-pres-edit-profesional').value;
  const fechaEmision = $('f-pres-edit-fecha-emision').value;
  const fechaVencimiento = $('f-pres-edit-fecha-vencimiento').value;
  const total = parseFloat($('f-pres-edit-total').value) || 0;
  const estado = $('f-pres-edit-estado').value;

  if (!pacienteId) return alert('Selecciona un paciente.');

  // Obtener nombres para mostrar
  const pacienteNombre = $('f-pres-edit-paciente').options[$('f-pres-edit-paciente').selectedIndex].text;
  const profesionalNombre = $('f-pres-edit-profesional').options[$('f-pres-edit-profesional').selectedIndex].text;

  const updateData = {
    numero,
    paciente_id: pacienteId,
    paciente: pacienteNombre,
    profesional_id: profesionalId || null,
    profesional: profesionalNombre || null,
    fecha_emision: fechaEmision || new Date().toISOString().slice(0, 10),
    fecha_vencimiento: fechaVencimiento || null,
    total,
    estado,
    updated_at: new Date().toISOString()
  };

  db.collection('presupuestos').doc(id).update(updateData)
    .then(() => {
      closeModal();
      showToast('✅ Presupuesto actualizado.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

window.eliminarPresupuesto = function(id) {
  if (!confirm('¿Eliminar este presupuesto?')) return;
  db.collection('presupuestos').doc(id).delete()
    .then(() => showToast('🗑 Presupuesto eliminado.'))
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// MODAL: NUEVO PRESUPUESTO
// ============================================================
window.openModalNuevoPresupuesto = function() {
  // Cargar pacientes para el select
  let pacientesHTML = '<option value="">Seleccionar paciente</option>';
  db.collection('pacientes').orderBy('nombre').get().then(snap => {
    snap.forEach(d => {
      const data = d.data();
      const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
      pacientesHTML += `<option value="${d.id}">${nombre}</option>`;
    });

    // Cargar profesionales para el select
    let profesionalesHTML = '<option value="">Seleccionar profesional</option>';
    db.collection('profesionales').orderBy('nombre').get().then(snap2 => {
      snap2.forEach(d => {
        const data = d.data();
        const nombre = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Sin nombre';
        profesionalesHTML += `<option value="${d.id}">${nombre}</option>`;
      });

      openModal(`
        <div class="modal-title">➕ Nuevo presupuesto</div>
        <div class="form-group">
          <label class="form-label">Número</label>
          <input class="form-control" id="f-pres-numero" placeholder="Ej: PRES-2024-001">
        </div>
        <div class="form-group">
          <label class="form-label">Paciente *</label>
          <select class="form-control" id="f-pres-paciente">${pacientesHTML}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Profesional</label>
          <select class="form-control" id="f-pres-profesional">${profesionalesHTML}</select>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Fecha emisión</label>
            <input class="form-control" id="f-pres-fecha-emision" type="date" value="${new Date().toISOString().slice(0, 10)}">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha vencimiento</label>
            <input class="form-control" id="f-pres-fecha-vencimiento" type="date" value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Total</label>
          <input class="form-control" id="f-pres-total" type="number" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-control" id="f-pres-estado">
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="guardarPresupuesto()">Guardar</button>
        </div>
      `);
    });
  });
};

window.guardarPresupuesto = function() {
  const numero = $('f-pres-numero').value.trim();
  const pacienteId = $('f-pres-paciente').value;
  const profesionalId = $('f-pres-profesional').value;
  const fechaEmision = $('f-pres-fecha-emision').value;
  const fechaVencimiento = $('f-pres-fecha-vencimiento').value;
  const total = parseFloat($('f-pres-total').value) || 0;
  const estado = $('f-pres-estado').value;

  if (!pacienteId) return alert('Selecciona un paciente.');

  const pacienteNombre = $('f-pres-paciente').options[$('f-pres-paciente').selectedIndex].text;
  const profesionalNombre = $('f-pres-profesional').options[$('f-pres-profesional').selectedIndex].text;

  const data = {
    numero: numero || 'PRES-' + Date.now().toString().slice(-6),
    paciente_id: pacienteId,
    paciente: pacienteNombre,
    profesional_id: profesionalId || null,
    profesional: profesionalNombre || null,
    fecha_emision: fechaEmision || new Date().toISOString().slice(0, 10),
    fecha_vencimiento: fechaVencimiento || null,
    total,
    estado,
    created_at: new Date().toISOString()
  };

  db.collection('presupuestos').add(data)
    .then(() => {
      closeModal();
      showToast('✅ Presupuesto creado exitosamente.');
    })
    .catch(err => alert('❌ Error: ' + err.message));
};
