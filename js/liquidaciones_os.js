// ============================================================
// LIQUIDACIONES OS – VISTA EXACTA AL EJEMPLO
// ============================================================
function renderLiquidacionesOS() {
  const el = $('view-liquidaciones_os');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Liquidaciones de obras sociales</div>
        <div class="page-subtitle">Importes pendientes y liquidaciones generadas</div>
      </div>
      <button class="btn btn-primary" onclick="openModalNuevaLiquidacionOS()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nueva liquidación OS
      </button>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:16px;">
      <div id="filtros-liquidaciones" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
        <div class="form-group" style="flex:1;min-width:160px;margin:0;">
          <label class="form-label">Obra social</label>
          <select id="filtro-os" class="form-control">
            <option value="">— Todas —</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;min-width:140px;margin:0;">
          <label class="form-label">Estado</label>
          <select id="filtro-estado" class="form-control">
            <option value="">— Todos —</option>
            <option value="pendiente">Pendiente</option>
            <option value="presentada">Presentada</option>
            <option value="cobrada">Cobrada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
        <button class="btn btn-secondary" style="margin:0;" onclick="aplicarFiltrosLiquidaciones()">Filtrar</button>
        <button class="btn btn-secondary" style="margin:0;" onclick="limpiarFiltrosLiquidaciones()">Limpiar</button>
      </div>
    </div>

    <!-- Contenedor de la tabla -->
    <div id="liq-os-container">
      <div class="card" style="padding:0;">
        <div style="padding:48px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:8px;">🏥</div>
          <div style="font-weight:600;margin-bottom:4px;">No hay liquidaciones de OS aún</div>
          <div style="font-size:13px;">Generá la primera desde el botón "Nueva liquidación OS"</div>
        </div>
      </div>
    </div>
  `;

  // Cargar obras sociales en el filtro
  db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
    const select = $('filtro-os');
    snap.forEach(doc => {
      const data = doc.data();
      select.innerHTML += `<option value="${doc.id}">${data.nombre || 'Sin nombre'}</option>`;
    });
  });

  // Escuchar cambios en liquidaciones
  db.collection('liquidaciones_os').orderBy('fecha', 'desc').onSnapshot(snap => {
    const container = $('liq-os-container');
    if (snap.empty) {
      container.innerHTML = `
        <div class="card" style="padding:0;">
          <div style="padding:48px;text-align:center;color:var(--text-muted);">
            <div style="font-size:32px;margin-bottom:8px;">🏥</div>
            <div style="font-weight:600;margin-bottom:4px;">No hay liquidaciones de OS aún</div>
            <div style="font-size:13px;">Generá la primera desde el botón "Nueva liquidación OS"</div>
          </div>
        </div>
      `;
      return;
    }

    const liquidaciones = [];
    snap.forEach(doc => {
      const data = doc.data();
      liquidaciones.push({ id: doc.id, ...data });
    });
    window._liquidacionesData = liquidaciones;
    renderTablaLiquidacionesOS(liquidaciones);
  }, error => {
    console.error('Error cargando liquidaciones OS:', error);
    $('liq-os-container').innerHTML = `
      <div class="card" style="padding:0;">
        <div style="padding:48px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
          <div style="font-weight:600;margin-bottom:4px;">Error al cargar los datos</div>
          <div style="font-size:13px;">${error.message}</div>
        </div>
      </div>
    `;
  });
}

function renderTablaLiquidacionesOS(liquidaciones) {
  const container = $('liq-os-container');
  
  const osFilter = $('filtro-os')?.value || '';
  const estadoFilter = $('filtro-estado')?.value || '';

  let filtradas = liquidaciones;
  if (osFilter) {
    filtradas = filtradas.filter(liq => liq.obra_social_id === osFilter);
  }
  if (estadoFilter) {
    filtradas = filtradas.filter(liq => liq.estado === estadoFilter);
  }

  if (filtradas.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding:0;">
        <div style="padding:48px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:8px;">🔍</div>
          <div style="font-weight:600;margin-bottom:4px;">No hay liquidaciones con esos filtros</div>
          <div style="font-size:13px;">Probá cambiando los filtros o creando una nueva liquidación</div>
        </div>
      </div>
    `;
    return;
  }

  const estadoColors = {
    'pendiente': 'badge-amber',
    'presentada': 'badge-blue',
    'cobrada': 'badge-green',
    'anulada': 'badge-gray'
  };
  const estadoTextos = {
    'pendiente': 'Pendiente',
    'presentada': 'Presentada',
    'cobrada': 'Cobrada',
    'anulada': 'Anulada'
  };

  let html = `
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Obra social</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Plan</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Período</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:right;">Monto</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Estado</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Fecha</th>
              <th style="padding:10px 12px;background:var(--bg);font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border);text-align:left;">Acciones</th>
            </tr>
          </thead>
          <tbody>
  `;

  filtradas.forEach(liq => {
    const estadoClase = estadoColors[liq.estado] || 'badge-gray';
    const estadoTexto = estadoTextos[liq.estado] || liq.estado || '—';

    html += `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;"><strong>${liq.obra_social || '—'}</strong></td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;">${liq.plan || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;">${liq.periodo || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;text-align:right;font-weight:600;">$${Number(liq.monto || 0).toLocaleString()}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;"><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:13px;color:var(--text-muted);">${liq.fecha || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;">
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" onclick="editarLiquidacionOS('${liq.id}')">Editar</button>
            <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarLiquidacionOS('${liq.id}')">Eliminar</button>
            ${liq.estado === 'pendiente' ? `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoLiquidacionOS('${liq.id}', 'presentada')">Presentar</button>` : ''}
            ${liq.estado === 'presentada' ? `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoLiquidacionOS('${liq.id}', 'cobrada')">Cobrar</button>` : ''}
            ${liq.estado === 'pendiente' ? `<button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="cambiarEstadoLiquidacionOS('${liq.id}', 'anulada')">Anular</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ============================================================
// FUNCIONES GLOBALES
// ============================================================
window.aplicarFiltrosLiquidaciones = function() {
  if (window._liquidacionesData) {
    renderTablaLiquidacionesOS(window._liquidacionesData);
  }
};

window.limpiarFiltrosLiquidaciones = function() {
  const osSelect = $('filtro-os');
  const estadoSelect = $('filtro-estado');
  if (osSelect) osSelect.value = '';
  if (estadoSelect) estadoSelect.value = '';
  aplicarFiltrosLiquidaciones();
};

window.openModalNuevaLiquidacionOS = function() {
  let osOptions = '<option value="">Seleccionar obra social</option>';
  db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
    snap.forEach(doc => {
      const data = doc.data();
      osOptions += `<option value="${doc.id}">${data.nombre || 'Sin nombre'}</option>`;
    });

    const modalHTML = `
      <div class="modal-title">➕ Nueva liquidación OS</div>
      
      <div class="form-group">
        <label class="form-label">Obra social *</label>
        <select class="form-control" id="f-liq-os">${osOptions}</select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Plan</label>
        <input class="form-control" id="f-liq-plan" placeholder="Ej: OSDE 210">
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Período *</label>
          <input class="form-control" id="f-liq-periodo" placeholder="Ej: Agosto 2026">
        </div>
        <div class="form-group">
          <label class="form-label">Monto *</label>
          <input class="form-control" id="f-liq-monto" type="number" step="0.01" placeholder="0.00">
        </div>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-control" id="f-liq-estado">
            <option value="pendiente">Pendiente</option>
            <option value="presentada">Presentada</option>
            <option value="cobrada">Cobrada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <input class="form-control" id="f-liq-fecha" type="date" value="${new Date().toISOString().slice(0,10)}">
        </div>
      </div>

      <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Comisión (opcional)</div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Porcentaje de comisión (%)</label>
          <input class="form-control" id="f-liq-comision-pct" type="number" step="0.01" placeholder="10" value="10">
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarLiquidacionOS()">Guardar liquidación</button>
      </div>
    `;

    openModal(modalHTML);
  });
};

window.guardarLiquidacionOS = function() {
  const obraSocialId = $('f-liq-os').value;
  const obraSocial = $('f-liq-os').options[$('f-liq-os').selectedIndex]?.text || '';
  const plan = $('f-liq-plan').value.trim();
  const periodo = $('f-liq-periodo').value.trim();
  const monto = parseFloat($('f-liq-monto').value);
  const estado = $('f-liq-estado').value;
  const fecha = $('f-liq-fecha').value;
  const comisionPct = parseFloat($('f-liq-comision-pct').value) || 0;

  if (!obraSocialId) return alert('Seleccioná una obra social.');
  if (!periodo) return alert('El período es obligatorio.');
  if (isNaN(monto) || monto <= 0) return alert('Ingresá un monto válido.');

  const comision = monto * (comisionPct / 100);

  db.collection('liquidaciones_os').add({
    obra_social_id: obraSocialId,
    obra_social: obraSocial,
    plan: plan,
    periodo: periodo,
    monto: monto,
    comision_pct: comisionPct,
    comision: comision,
    estado: estado,
    fecha: fecha || new Date().toISOString().slice(0,10),
    creado: new Date().toISOString()
  }).then(() => {
    closeModal();
    showToast('✅ Liquidación OS creada exitosamente.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.editarLiquidacionOS = function(id) {
  db.collection('liquidaciones_os').doc(id).get().then(doc => {
    if (!doc.exists) return alert('No encontrada');
    const data = doc.data();

    let osOptions = '<option value="">Seleccionar obra social</option>';
    db.collection('obras_sociales').orderBy('nombre').get().then(snap => {
      snap.forEach(docOS => {
        const d = docOS.data();
        const selected = docOS.id === data.obra_social_id ? 'selected' : '';
        osOptions += `<option value="${docOS.id}" ${selected}>${d.nombre || 'Sin nombre'}</option>`;
      });

      const modalHTML = `
        <div class="modal-title">✏️ Editar liquidación OS</div>
        
        <div class="form-group">
          <label class="form-label">Obra social *</label>
          <select class="form-control" id="f-liq-edit-os">${osOptions}</select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Plan</label>
          <input class="form-control" id="f-liq-edit-plan" value="${data.plan || ''}">
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Período *</label>
            <input class="form-control" id="f-liq-edit-periodo" value="${data.periodo || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Monto *</label>
            <input class="form-control" id="f-liq-edit-monto" type="number" step="0.01" value="${data.monto || 0}">
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" id="f-liq-edit-estado">
              <option value="pendiente" ${data.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="presentada" ${data.estado === 'presentada' ? 'selected' : ''}>Presentada</option>
              <option value="cobrada" ${data.estado === 'cobrada' ? 'selected' : ''}>Cobrada</option>
              <option value="anulada" ${data.estado === 'anulada' ? 'selected' : ''}>Anulada</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input class="form-control" id="f-liq-edit-fecha" type="date" value="${data.fecha || ''}">
          </div>
        </div>

        <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
          <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Comisión</div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Porcentaje de comisión (%)</label>
            <input class="form-control" id="f-liq-edit-comision-pct" type="number" step="0.01" value="${data.comision_pct || 0}">
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="guardarEdicionLiquidacionOS('${id}')">Actualizar</button>
        </div>
      `;

      openModal(modalHTML);
    });
  });
};

window.guardarEdicionLiquidacionOS = function(id) {
  const obraSocialId = $('f-liq-edit-os').value;
  const obraSocial = $('f-liq-edit-os').options[$('f-liq-edit-os').selectedIndex]?.text || '';
  const plan = $('f-liq-edit-plan').value.trim();
  const periodo = $('f-liq-edit-periodo').value.trim();
  const monto = parseFloat($('f-liq-edit-monto').value);
  const estado = $('f-liq-edit-estado').value;
  const fecha = $('f-liq-edit-fecha').value;
  const comisionPct = parseFloat($('f-liq-edit-comision-pct').value) || 0;

  if (!obraSocialId) return alert('Seleccioná una obra social.');
  if (!periodo) return alert('El período es obligatorio.');
  if (isNaN(monto) || monto <= 0) return alert('Ingresá un monto válido.');

  const comision = monto * (comisionPct / 100);

  db.collection('liquidaciones_os').doc(id).update({
    obra_social_id: obraSocialId,
    obra_social: obraSocial,
    plan: plan,
    periodo: periodo,
    monto: monto,
    comision_pct: comisionPct,
    comision: comision,
    estado: estado,
    fecha: fecha || new Date().toISOString().slice(0,10)
  }).then(() => {
    closeModal();
    showToast('✅ Liquidación actualizada.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.eliminarLiquidacionOS = function(id) {
  if (!confirm('¿Eliminar esta liquidación?')) return;
  db.collection('liquidaciones_os').doc(id).delete()
    .then(() => showToast('🗑 Eliminada.'))
    .catch(err => alert('❌ Error: ' + err.message));
};

window.cambiarEstadoLiquidacionOS = function(id, nuevoEstado) {
  const mensajes = {
    'presentada': '¿Presentar esta liquidación?',
    'cobrada': '¿Marcar como cobrada?',
    'anulada': '¿Anular esta liquidación?'
  };
  if (!confirm(mensajes[nuevoEstado] || '¿Cambiar el estado?')) return;

  db.collection('liquidaciones_os').doc(id).update({ estado: nuevoEstado })
    .then(() => showToast(`✅ Estado cambiado a ${nuevoEstado}.`))
    .catch(err => alert('❌ Error: ' + err.message));
};