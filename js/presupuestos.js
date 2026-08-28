// ============================================================
// PRESUPUESTOS
// ============================================================

// ============================================================
// RENDER PRESUPUESTOS PRINCIPAL
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

// --- Ver presupuesto ---
window.verPresupuesto = function(id) {
  alert('Ver detalle del presupuesto ID: ' + id);
  // Aquí puedes redirigir a una página de detalle o abrir un modal
  // window.location.href = '#presupuesto/' + id;
};

// --- Editar presupuesto ---
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

// --- Guardar edición ---
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

// --- Eliminar presupuesto ---
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

// ============================================================
// GUARDAR PRESUPUESTO
// ============================================================
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
