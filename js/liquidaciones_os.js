// ============================================================
// LIQUIDACIONES DE OBRAS SOCIALES - SPA
// ============================================================
function renderLiquidacionesOS() {
  const el = document.getElementById('view-liquidaciones_os');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Liquidaciones de obras sociales</div>
        <div class="page-subtitle" id="los-count">Cargando...</div>
      </div>
      <button class="btn btn-primary" onclick="renderNuevaLiquidacionOS()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva liquidación OS
      </button>
    </div>

    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Obra social</th>
              <th>Plan</th>
              <th style="text-align:right;">Monto</th>
              <th>Estado</th>
              <th>Periodo</th>
              <th style="text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbody-liquidaciones-os">
          </tbody>
        </table>
      </div>
    </div>
  `;

  cargarLiquidacionesOS();
}

// ============================================================
// CARGAR LIQUIDACIONES DESDE FIRESTORE
// ============================================================
function cargarLiquidacionesOS() {
  const tbody = document.getElementById('tbody-liquidaciones-os');
  const countEl = document.getElementById('los-count');
  if (!tbody) return;

  if (typeof db === 'undefined') {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">Firestore no disponible.</td></tr>';
    if (countEl) countEl.textContent = '0';
    return;
  }

  db.collection('liquidaciones_os')
    .orderBy('fecha', 'desc')
    .onSnapshot(snap => {
      if (snap.empty) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">No hay liquidaciones registradas.</td></tr>';
        if (countEl) countEl.textContent = '0';
        return;
      }

      let html = '';
      let count = 0;

      snap.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        count++;

        const fecha = data.fecha ? formatDateOS(data.fecha) : '—';
        const obraSocial = data.obra_social || '—';
        const plan = data.plan || '—';
        const monto = data.monto || 0;
        const estado = data.estado || 'pendiente';
        const periodo = data.periodo || '—';

        const estadoBadge = estado === 'aprobado' ? 'badge-green' :
                            estado === 'rechazado' ? 'badge-red' :
                            'badge-amber';
        const estadoTexto = estado === 'aprobado' ? 'Aprobado' :
                            estado === 'rechazado' ? 'Rechazado' :
                            'Pendiente';

        html += `
          <tr>
            <td style="font-size:12px;white-space:nowrap;">${fecha}</td>
            <td>${escapeHtmlOS(obraSocial)}</td>
            <td>${escapeHtmlOS(plan)}</td>
            <td style="text-align:right;font-weight:600;">$${Number(monto).toLocaleString()}</td>
            <td><span class="badge ${estadoBadge}">${estadoTexto}</span></td>
            <td style="font-size:12px;color:var(--text-muted);">${escapeHtmlOS(periodo)}</td>
            <td style="text-align:right;">
              <button class="btn btn-sm btn-secondary" onclick="renderEditarLiquidacionOS('${id}')">Editar</button>
              <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarLiquidacionOS('${id}')">Eliminar</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
      if (countEl) countEl.textContent = `${count} ${count === 1 ? 'liquidación' : 'liquidaciones'}`;
    }, error => {
      console.error('Error cargando liquidaciones:', error);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#dc2626;">Error al cargar los datos: ${error.message}</td></tr>`;
    });
}

// ============================================================
// FORMATO DE FECHA
// ============================================================
function formatDateOS(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================================
// ESCAPAR HTML
// ============================================================
function escapeHtmlOS(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// RENDER: NUEVA LIQUIDACIÓN OS (SPA)
// ============================================================
window.renderNuevaLiquidacionOS = function() {
  const el = document.getElementById('view-liquidaciones_os');
  if (!el) return;

  // Cargar obras sociales para el select
  let obrasSocialesHTML = '<option value="">— Seleccionar obra social —</option>';
  if (typeof db !== 'undefined') {
    db.collection('obras_sociales').orderBy('nombre').get()
      .then(snap => {
        snap.forEach(doc => {
          const data = doc.data();
          obrasSocialesHTML += `<option value="${doc.id}">${escapeHtmlOS(data.nombre || 'Sin nombre')}</option>`;
        });
        // Actualizar el select después de cargar los datos
        const select = document.getElementById('f-los-os');
        if (select) select.innerHTML = obrasSocialesHTML;
      })
      .catch(err => console.error('Error cargando obras sociales:', err));
  }

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">➕ Nueva liquidación OS</div>
        <div class="page-subtitle">Registrar liquidación de obra social</div>
      </div>
      <button class="btn btn-secondary" onclick="renderLiquidacionesOS()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-nueva-liquidacion-os" onsubmit="event.preventDefault(); guardarNuevaLiquidacionOS()">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Obra social *</label>
            <select id="f-los-os" class="form-control" required>
              <option value="">— Seleccionar obra social —</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Plan</label>
            <select id="f-los-plan" class="form-control">
              <option value="">— Seleccionar plan —</option>
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Fecha *</label>
            <input type="date" id="f-los-fecha" class="form-control" value="${new Date().toISOString().slice(0,10)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Monto *</label>
            <input type="number" id="f-los-monto" class="form-control" step="0.01" min="0" placeholder="0.00" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Periodo</label>
          <input type="text" id="f-los-periodo" class="form-control" placeholder="Ej: Agosto 2026">
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="f-los-estado" class="form-control">
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <textarea id="f-los-observaciones" class="form-control" rows="2" placeholder="Notas adicionales..."></textarea>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderLiquidacionesOS()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar liquidación</button>
        </div>
      </form>
    </div>
  `;

  // Poblar el select de obras sociales (ya se está haciendo arriba, pero asegurar)
  if (typeof db !== 'undefined') {
    const selectOS = document.getElementById('f-los-os');
    if (selectOS && selectOS.options.length <= 1) {
      db.collection('obras_sociales').orderBy('nombre').get()
        .then(snap => {
          snap.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = data.nombre || 'Sin nombre';
            selectOS.appendChild(option);
          });
        })
        .catch(err => console.error('Error cargando obras sociales:', err));
    }
  }

  // Evento para cargar planes al seleccionar obra social
  document.getElementById('f-los-os').addEventListener('change', function() {
    const osId = this.value;
    const planSelect = document.getElementById('f-los-plan');
    planSelect.innerHTML = '<option value="">— Seleccionar plan —</option>';
    if (!osId) return;

    if (typeof db !== 'undefined') {
      db.collection('obras_sociales').doc(osId).get()
        .then(doc => {
          if (doc.exists) {
            const data = doc.data();
            const planes = data.planes || [];
            planes.forEach(plan => {
              const option = document.createElement('option');
              option.value = plan.id || '';
              option.textContent = plan.nombre || 'Plan sin nombre';
              planSelect.appendChild(option);
            });
          }
        })
        .catch(err => console.error('Error cargando planes:', err));
    }
  });
};

// ============================================================
// GUARDAR NUEVA LIQUIDACIÓN OS
// ============================================================
window.guardarNuevaLiquidacionOS = function() {
  const obraSocialId = document.getElementById('f-los-os').value;
  const planId = document.getElementById('f-los-plan').value;
  const fecha = document.getElementById('f-los-fecha').value;
  const monto = parseFloat(document.getElementById('f-los-monto').value);
  const periodo = document.getElementById('f-los-periodo').value.trim();
  const estado = document.getElementById('f-los-estado').value;
  const observaciones = document.getElementById('f-los-observaciones').value.trim();

  if (!obraSocialId) return alert('Selecciona una obra social.');
  if (!fecha) return alert('Selecciona una fecha.');
  if (!monto || monto <= 0) return alert('Ingresa un monto válido.');

  // Obtener nombres de OS y plan
  const osSelect = document.getElementById('f-los-os');
  const obraSocialNombre = osSelect.options[osSelect.selectedIndex].text;

  const planSelect = document.getElementById('f-los-plan');
  const planNombre = planId ? planSelect.options[planSelect.selectedIndex].text : '';

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('liquidaciones_os').add({
    obra_social_id: obraSocialId,
    obra_social: obraSocialNombre,
    plan_id: planId || null,
    plan: planNombre || null,
    fecha: fecha,
    monto: monto,
    periodo: periodo || null,
    estado: estado,
    observaciones: observaciones || null,
    created_at: new Date().toISOString()
  })
  .then(() => {
    showToast('✅ Liquidación creada exitosamente.');
    renderLiquidacionesOS();
  })
  .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// RENDER: EDITAR LIQUIDACIÓN OS (SPA)
// ============================================================
window.renderEditarLiquidacionOS = function(id) {
  const el = document.getElementById('view-liquidaciones_os');
  if (!el) return;

  // Mostrar carga
  el.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">✏️ Editar liquidación</div></div>
      <button class="btn btn-secondary" onclick="renderLiquidacionesOS()">← Volver</button>
    </div>
    <div class="card"><p class="text-muted">Cargando datos...</p></div>
  `;

  db.collection('liquidaciones_os').doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        el.innerHTML = '<div class="card"><p class="text-muted">Liquidación no encontrada.</p></div>';
        return;
      }
      const data = doc.data();

      // Cargar obras sociales para el select
      let osOptions = '<option value="">— Seleccionar obra social —</option>';
      db.collection('obras_sociales').orderBy('nombre').get()
        .then(snap => {
          snap.forEach(d => {
            const dData = d.data();
            const selected = d.id === data.obra_social_id ? 'selected' : '';
            osOptions += `<option value="${d.id}" ${selected}>${escapeHtmlOS(dData.nombre || 'Sin nombre')}</option>`;
          });

          // Ahora cargar planes para la OS seleccionada
          let planOptions = '<option value="">— Seleccionar plan —</option>';
          if (data.obra_social_id) {
            db.collection('obras_sociales').doc(data.obra_social_id).get()
              .then(osDoc => {
                if (osDoc.exists) {
                  const osData = osDoc.data();
                  const planes = osData.planes || [];
                  planes.forEach(p => {
                    const selected = p.id === data.plan_id ? 'selected' : '';
                    planOptions += `<option value="${p.id || ''}" ${selected}>${escapeHtmlOS(p.nombre || 'Plan sin nombre')}</option>`;
                  });
                }
                mostrarFormularioEdicion(data, osOptions, planOptions);
              })
              .catch(() => mostrarFormularioEdicion(data, osOptions, planOptions));
          } else {
            mostrarFormularioEdicion(data, osOptions, planOptions);
          }
        })
        .catch(err => {
          console.error('Error cargando obras sociales:', err);
          mostrarFormularioEdicion(data, osOptions, '<option value="">— Seleccionar plan —</option>');
        });
    })
    .catch(err => {
      el.innerHTML = `<div class="card"><p class="text-muted">Error: ${err.message}</p></div>`;
    });
};

function mostrarFormularioEdicion(data, osOptions, planOptions) {
  const el = document.getElementById('view-liquidaciones_os');
  const fecha = data.fecha || new Date().toISOString().slice(0,10);
  const monto = data.monto || 0;
  const periodo = data.periodo || '';
  const estado = data.estado || 'pendiente';
  const observaciones = data.observaciones || '';

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">✏️ Editar liquidación</div>
        <div class="page-subtitle">Actualizar datos de la liquidación</div>
      </div>
      <button class="btn btn-secondary" onclick="renderLiquidacionesOS()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-editar-liquidacion-os" onsubmit="event.preventDefault(); guardarEdicionLiquidacionOS('${data.id}')">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Obra social *</label>
            <select id="f-los-edit-os" class="form-control" required>
              ${osOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Plan</label>
            <select id="f-los-edit-plan" class="form-control">
              ${planOptions}
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Fecha *</label>
            <input type="date" id="f-los-edit-fecha" class="form-control" value="${fecha}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Monto *</label>
            <input type="number" id="f-los-edit-monto" class="form-control" step="0.01" min="0" value="${monto}" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Periodo</label>
          <input type="text" id="f-los-edit-periodo" class="form-control" value="${escapeHtmlOS(periodo)}" placeholder="Ej: Agosto 2026">
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="f-los-edit-estado" class="form-control">
            <option value="pendiente" ${estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="aprobado" ${estado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
            <option value="rechazado" ${estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <textarea id="f-los-edit-observaciones" class="form-control" rows="2" placeholder="Notas adicionales...">${escapeHtmlOS(observaciones)}</textarea>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderLiquidacionesOS()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Actualizar liquidación</button>
        </div>
      </form>
    </div>
  `;

  // Evento para cargar planes al cambiar OS en edición
  document.getElementById('f-los-edit-os').addEventListener('change', function() {
    const osId = this.value;
    const planSelect = document.getElementById('f-los-edit-plan');
    planSelect.innerHTML = '<option value="">— Seleccionar plan —</option>';
    if (!osId) return;

    if (typeof db !== 'undefined') {
      db.collection('obras_sociales').doc(osId).get()
        .then(doc => {
          if (doc.exists) {
            const osData = doc.data();
            const planes = osData.planes || [];
            planes.forEach(plan => {
              const option = document.createElement('option');
              option.value = plan.id || '';
              option.textContent = plan.nombre || 'Plan sin nombre';
              planSelect.appendChild(option);
            });
          }
        })
        .catch(err => console.error('Error cargando planes:', err));
    }
  });
}

// ============================================================
// GUARDAR EDICIÓN DE LIQUIDACIÓN OS
// ============================================================
window.guardarEdicionLiquidacionOS = function(id) {
  const obraSocialId = document.getElementById('f-los-edit-os').value;
  const planId = document.getElementById('f-los-edit-plan').value;
  const fecha = document.getElementById('f-los-edit-fecha').value;
  const monto = parseFloat(document.getElementById('f-los-edit-monto').value);
  const periodo = document.getElementById('f-los-edit-periodo').value.trim();
  const estado = document.getElementById('f-los-edit-estado').value;
  const observaciones = document.getElementById('f-los-edit-observaciones').value.trim();

  if (!obraSocialId) return alert('Selecciona una obra social.');
  if (!fecha) return alert('Selecciona una fecha.');
  if (!monto || monto <= 0) return alert('Ingresa un monto válido.');

  const osSelect = document.getElementById('f-los-edit-os');
  const obraSocialNombre = osSelect.options[osSelect.selectedIndex].text;

  const planSelect = document.getElementById('f-los-edit-plan');
  const planNombre = planId ? planSelect.options[planSelect.selectedIndex].text : '';

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('liquidaciones_os').doc(id).update({
    obra_social_id: obraSocialId,
    obra_social: obraSocialNombre,
    plan_id: planId || null,
    plan: planNombre || null,
    fecha: fecha,
    monto: monto,
    periodo: periodo || null,
    estado: estado,
    observaciones: observaciones || null,
    updated_at: new Date().toISOString()
  })
  .then(() => {
    showToast('✅ Liquidación actualizada.');
    renderLiquidacionesOS();
  })
  .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// ELIMINAR LIQUIDACIÓN OS
// ============================================================
window.eliminarLiquidacionOS = function(id) {
  if (!confirm('¿Eliminar esta liquidación?')) return;

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('liquidaciones_os').doc(id).delete()
    .then(() => {
      showToast('🗑 Liquidación eliminada.');
      renderLiquidacionesOS();
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-liquidaciones_os')) {
  renderLiquidacionesOS();
}
