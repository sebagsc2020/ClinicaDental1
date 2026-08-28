// ============================================================
// OBRAS SOCIALES - SPA (Single Page Application)
// ============================================================

// ============================================================
// RENDER LISTA DE OBRAS SOCIALES
// ============================================================
function renderObrasSociales() {
  const el = document.getElementById('view-obras_sociales');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Obras sociales</div>
        <div class="page-subtitle" id="os-count">Cargando...</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="renderNuevaObraSocial()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva obra social
        </button>
        <button class="btn btn-secondary" onclick="renderNuevaLiquidacionOS()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
          Nueva liquidación
        </button>
      </div>
    </div>
    <div id="os-list-container" style="display:flex;flex-direction:column;gap:12px;">
      <p class="text-muted">Cargando obras sociales...</p>
    </div>
  `;

  cargarListaObrasSociales();
}

// ============================================================
// CARGAR LISTA DE OBRAS SOCIALES DESDE FIRESTORE
// ============================================================
function cargarListaObrasSociales() {
  if (typeof db === 'undefined') {
    document.getElementById('os-list-container').innerHTML = '<div class="card"><p class="text-muted">Firestore no disponible.</p></div>';
    return;
  }

  db.collection('obras_sociales')
    .orderBy('nombre')
    .onSnapshot(snap => {
      const container = document.getElementById('os-list-container');
      const countEl = document.getElementById('os-count');

      if (!container) return;

      if (snap.empty) {
        container.innerHTML = '<div class="card"><p class="text-muted">No hay obras sociales registradas.</p></div>';
        if (countEl) countEl.textContent = '0 registradas';
        return;
      }

      let html = '';
      let totalOS = 0;

      snap.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        totalOS++;

        const planes = data.planes || [];
        const cantidadPlanes = planes.length;

        let detalles = [];
        if (data.codigo) detalles.push(`<span>Cód: ${data.codigo}</span>`);
        if (data.email) detalles.push(`<span>${data.email}</span>`);
        detalles.push(`<span>${cantidadPlanes} ${cantidadPlanes === 1 ? 'plan' : 'planes'}</span>`);

        html += `
          <div class="card" style="padding:0;overflow:hidden;">
            <div class="os-card-header" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:10px;">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:40px;height:40px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <div style="font-size:15px;font-weight:700;color:var(--text);">${escapeHtmlOS(data.nombre || 'Sin nombre')}</div>
                  <div style="font-size:12px;color:var(--text-muted);display:flex;gap:12px;flex-wrap:wrap;margin-top:2px;">
                    ${detalles.join(' · ')}
                  </div>
                </div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <button class="btn btn-sm btn-secondary" onclick="renderEditarObraSocial('${id}')">Editar</button>
                <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarObraSocial('${id}', '${escapeHtmlOS(data.nombre || '')}')">Eliminar</button>
              </div>
            </div>

            <div style="padding:10px 20px 12px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:8px;">Planes</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
        `;

        if (cantidadPlanes === 0) {
          html += `<span style="font-size:13px;color:var(--text-muted);">Sin planes cargados</span>`;
        } else {
          planes.forEach(plan => {
            html += `
              <div style="display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;">
                <div>
                  <span style="font-size:13px;font-weight:600;color:var(--text);">${escapeHtmlOS(plan.nombre || 'Plan sin nombre')}</span>
                  ${plan.descripcion ? `<div style="font-size:11px;color:var(--text-muted);">${escapeHtmlOS(plan.descripcion)}</div>` : ''}
                </div>
                <div style="display:flex;gap:4px;margin-left:4px;">
                  <button class="btn btn-sm btn-secondary" style="padding:2px 8px;font-size:11px;" onclick="renderEditarPlan('${id}', '${plan.id || ''}')">Editar</button>
                  <button class="btn btn-sm" style="padding:2px 8px;font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarPlan('${id}', '${plan.id || ''}')">✕</button>
                </div>
              </div>
            `;
          });
        }

        html += `
              </div>
              <div style="margin-top:10px;">
                <button class="btn btn-sm btn-secondary" onclick="renderNuevoPlan('${id}')">+ Agregar plan</button>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      if (countEl) countEl.textContent = `${totalOS} ${totalOS === 1 ? 'registrada' : 'registradas'}`;
    }, error => {
      console.error('Error cargando obras sociales:', error);
      const container = document.getElementById('os-list-container');
      if (container) container.innerHTML = '<div class="card"><p class="text-muted">Error al cargar los datos.</p></div>';
    });
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
// RENDER: NUEVA OBRA SOCIAL (SPA)
// ============================================================
window.renderNuevaObraSocial = function() {
  const el = document.getElementById('view-obras_sociales');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">➕ Nueva obra social</div>
        <div class="page-subtitle">Completa los datos de la nueva obra social</div>
      </div>
      <button class="btn btn-secondary" onclick="renderObrasSociales()">← Volver</button>
    </div>

    <div class="card">
      <form id="form-nueva-os" onsubmit="event.preventDefault(); guardarNuevaObraSocial()">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" id="f-os-nombre" placeholder="Ej: OSDE" required autofocus>
        </div>
        <div class="form-group">
          <label class="form-label">Código</label>
          <input class="form-control" id="f-os-codigo" placeholder="Ej: OSDE123">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" id="f-os-email" type="email" placeholder="contacto@os.com">
        </div>

        <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
          <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Planes (opcional)</div>
          <div id="planes-container-nuevo">
            <div style="display:flex;gap:8px;margin-bottom:6px;">
              <input class="form-control" id="f-plan-1" placeholder="Nombre del plan" style="flex:1;">
              <input class="form-control" id="f-plan-desc-1" placeholder="Descripción" style="flex:1;">
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="agregarCampoPlanNuevo()" style="margin-top:4px;">
            + Agregar otro plan
          </button>
        </div>

        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderObrasSociales()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar obra social</button>
        </div>
      </form>
    </div>
  `;
};

// ============================================================
// GUARDAR NUEVA OBRA SOCIAL
// ============================================================
window.guardarNuevaObraSocial = function() {
  const nombre = document.getElementById('f-os-nombre').value.trim();
  const codigo = document.getElementById('f-os-codigo').value.trim();
  const email = document.getElementById('f-os-email').value.trim();

  if (!nombre) return alert('El nombre es obligatorio.');

  const planes = [];
  // Recoger todos los campos de planes (pueden ser dinámicos)
  const planInputs = document.querySelectorAll('#planes-container-nuevo [id^="f-plan-"]');
  const descInputs = document.querySelectorAll('#planes-container-nuevo [id^="f-plan-desc-"]');
  const maxPlanes = Math.max(planInputs.length, descInputs.length);
  for (let i = 1; i <= maxPlanes; i++) {
    const nombrePlan = document.getElementById(`f-plan-${i}`);
    const descPlan = document.getElementById(`f-plan-desc-${i}`);
    if (nombrePlan && nombrePlan.value.trim()) {
      planes.push({
        id: Date.now().toString() + i,
        nombre: nombrePlan.value.trim(),
        descripcion: descPlan ? descPlan.value.trim() : ''
      });
    }
  }

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('obras_sociales').add({
    nombre,
    codigo,
    email,
    planes,
    creado: new Date().toISOString()
  }).then(() => {
    showToast('✅ Obra social creada exitosamente.');
    renderObrasSociales();
  }).catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// AGREGAR CAMPO DE PLAN EN NUEVA OBRA SOCIAL
// ============================================================
let planCounterNuevo = 1;

window.agregarCampoPlanNuevo = function() {
  planCounterNuevo++;
  const container = document.getElementById('planes-container-nuevo');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.marginBottom = '6px';
  div.innerHTML = `
    <input class="form-control" id="f-plan-${planCounterNuevo}" placeholder="Nombre del plan" style="flex:1;">
    <input class="form-control" id="f-plan-desc-${planCounterNuevo}" placeholder="Descripción" style="flex:1;">
    <button type="button" class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(div);
};

// ============================================================
// RENDER: EDITAR OBRA SOCIAL (SPA)
// ============================================================
window.renderEditarObraSocial = function(id) {
  const el = document.getElementById('view-obras_sociales');
  if (!el) return;

  // Mostrar carga
  el.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">✏️ Editar obra social</div></div>
      <button class="btn btn-secondary" onclick="renderObrasSociales()">← Volver</button>
    </div>
    <div class="card"><p class="text-muted">Cargando datos...</p></div>
  `;

  db.collection('obras_sociales').doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        el.innerHTML = '<div class="card"><p class="text-muted">Obra social no encontrada.</p></div>';
        return;
      }
      const data = doc.data();
      const planes = data.planes || [];

      // Construir HTML con el formulario de edición y la lista de planes
      let planesHTML = '';
      if (planes.length === 0) {
        planesHTML = '<p class="text-muted" style="margin:8px 0;">Sin planes cargados.</p>';
      } else {
        planes.forEach(plan => {
          planesHTML += `
            <div style="display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;margin-bottom:6px;">
              <div style="flex:1;">
                <span style="font-size:13px;font-weight:600;">${escapeHtmlOS(plan.nombre || 'Sin nombre')}</span>
                ${plan.descripcion ? `<div style="font-size:11px;color:var(--text-muted);">${escapeHtmlOS(plan.descripcion)}</div>` : ''}
              </div>
              <div style="display:flex;gap:4px;">
                <button class="btn btn-sm btn-secondary" style="padding:2px 8px;font-size:11px;" onclick="renderEditarPlan('${id}', '${plan.id}')">Editar</button>
                <button class="btn btn-sm" style="padding:2px 8px;font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarPlan('${id}', '${plan.id}')">✕</button>
              </div>
            </div>
          `;
        });
      }

      el.innerHTML = `
        <div class="page-header">
          <div>
            <div class="page-title">✏️ Editar obra social</div>
            <div class="page-subtitle">Actualiza los datos de la obra social</div>
          </div>
          <button class="btn btn-secondary" onclick="renderObrasSociales()">← Volver</button>
        </div>

        <div class="card">
          <form id="form-editar-os" onsubmit="event.preventDefault(); guardarEdicionObraSocial('${id}')">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input class="form-control" id="f-os-edit-nombre" value="${escapeHtmlOS(data.nombre || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Código</label>
              <input class="form-control" id="f-os-edit-codigo" value="${escapeHtmlOS(data.codigo || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-control" id="f-os-edit-email" type="email" value="${escapeHtmlOS(data.email || '')}">
            </div>

            <div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Planes</div>
                <button type="button" class="btn btn-sm btn-secondary" onclick="renderNuevoPlan('${id}')">+ Agregar plan</button>
              </div>
              <div id="planes-lista-editar">${planesHTML}</div>
            </div>

            <div class="modal-actions" style="margin-top:16px;">
              <button type="button" class="btn btn-secondary" onclick="renderObrasSociales()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Actualizar obra social</button>
            </div>
          </form>
        </div>
      `;
    })
    .catch(err => {
      el.innerHTML = `<div class="card"><p class="text-muted">Error: ${err.message}</p></div>`;
    });
};

// ============================================================
// GUARDAR EDICIÓN DE OBRA SOCIAL
// ============================================================
window.guardarEdicionObraSocial = function(id) {
  const nombre = document.getElementById('f-os-edit-nombre').value.trim();
  const codigo = document.getElementById('f-os-edit-codigo').value.trim();
  const email = document.getElementById('f-os-edit-email').value.trim();

  if (!nombre) return alert('El nombre es obligatorio.');

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('obras_sociales').doc(id).update({
    nombre,
    codigo,
    email,
    updated: new Date().toISOString()
  })
  .then(() => {
    showToast('✅ Obra social actualizada.');
    renderObrasSociales();
  })
  .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// ELIMINAR OBRA SOCIAL
// ============================================================
window.eliminarObraSocial = function(id, nombre) {
  if (!confirm(`¿Eliminar la obra social "${nombre}" y todos sus planes?`)) return;

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('obras_sociales').doc(id).delete()
    .then(() => {
      showToast('🗑 Obra social eliminada.');
      renderObrasSociales();
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// RENDER: NUEVO PLAN (SPA)
// ============================================================
window.renderNuevoPlan = function(osId) {
  const el = document.getElementById('view-obras_sociales');
  if (!el) return;

  // Si estamos en edición, podemos mostrar el formulario dentro de la misma vista de edición,
  // pero para simplificar, renderizamos una vista separada.
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">➕ Nuevo plan</div>
        <div class="page-subtitle">Agregar un plan a la obra social</div>
      </div>
      <button class="btn btn-secondary" onclick="renderEditarObraSocial('${osId}')">← Volver</button>
    </div>

    <div class="card">
      <form id="form-nuevo-plan" onsubmit="event.preventDefault(); guardarNuevoPlan('${osId}')">
        <div class="form-group">
          <label class="form-label">Nombre del plan *</label>
          <input class="form-control" id="f-plan-nombre" placeholder="Ej: OSDE 210" required autofocus>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <input class="form-control" id="f-plan-desc" placeholder="Breve descripción">
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="renderEditarObraSocial('${osId}')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar plan</button>
        </div>
      </form>
    </div>
  `;
};

// ============================================================
// GUARDAR NUEVO PLAN
// ============================================================
window.guardarNuevoPlan = function(osId) {
  const nombre = document.getElementById('f-plan-nombre').value.trim();
  const descripcion = document.getElementById('f-plan-desc').value.trim();

  if (!nombre) return alert('El nombre del plan es obligatorio.');

  const plan = {
    id: Date.now().toString(),
    nombre,
    descripcion
  };

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('obras_sociales').doc(osId).update({
    planes: firebase.firestore.FieldValue.arrayUnion(plan)
  })
  .then(() => {
    showToast('✅ Plan agregado.');
    renderEditarObraSocial(osId);
  })
  .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// RENDER: EDITAR PLAN (SPA)
// ============================================================
window.renderEditarPlan = function(osId, planId) {
  const el = document.getElementById('view-obras_sociales');
  if (!el) return;

  // Mostrar carga
  el.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">✏️ Editar plan</div></div>
      <button class="btn btn-secondary" onclick="renderEditarObraSocial('${osId}')">← Volver</button>
    </div>
    <div class="card"><p class="text-muted">Cargando datos...</p></div>
  `;

  db.collection('obras_sociales').doc(osId).get()
    .then(doc => {
      if (!doc.exists) {
        el.innerHTML = '<div class="card"><p class="text-muted">Obra social no encontrada.</p></div>';
        return;
      }
      const data = doc.data();
      const planes = data.planes || [];
      const plan = planes.find(p => p.id === planId);
      if (!plan) {
        el.innerHTML = '<div class="card"><p class="text-muted">Plan no encontrado.</p></div>';
        return;
      }

      el.innerHTML = `
        <div class="page-header">
          <div>
            <div class="page-title">✏️ Editar plan</div>
            <div class="page-subtitle">Actualizar datos del plan</div>
          </div>
          <button class="btn btn-secondary" onclick="renderEditarObraSocial('${osId}')">← Volver</button>
        </div>

        <div class="card">
          <form id="form-editar-plan" onsubmit="event.preventDefault(); guardarEdicionPlan('${osId}', '${planId}')">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input class="form-control" id="f-plan-edit-nombre" value="${escapeHtmlOS(plan.nombre || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <input class="form-control" id="f-plan-edit-desc" value="${escapeHtmlOS(plan.descripcion || '')}">
            </div>
            <div class="modal-actions" style="margin-top:16px;">
              <button type="button" class="btn btn-secondary" onclick="renderEditarObraSocial('${osId}')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Actualizar plan</button>
            </div>
          </form>
        </div>
      `;
    })
    .catch(err => {
      el.innerHTML = `<div class="card"><p class="text-muted">Error: ${err.message}</p></div>`;
    });
};

// ============================================================
// GUARDAR EDICIÓN DE PLAN
// ============================================================
window.guardarEdicionPlan = function(osId, planId) {
  const nombre = document.getElementById('f-plan-edit-nombre').value.trim();
  const descripcion = document.getElementById('f-plan-edit-desc').value.trim();

  if (!nombre) return alert('El nombre es obligatorio.');

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('obras_sociales').doc(osId).get()
    .then(doc => {
      if (!doc.exists) throw new Error('Obra social no encontrada');
      const data = doc.data();
      const planes = data.planes || [];
      const index = planes.findIndex(p => p.id === planId);
      if (index === -1) throw new Error('Plan no encontrado');
      planes[index] = { ...planes[index], nombre, descripcion };
      return db.collection('obras_sociales').doc(osId).update({ planes });
    })
    .then(() => {
      showToast('✅ Plan actualizado.');
      renderEditarObraSocial(osId);
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// ELIMINAR PLAN
// ============================================================
window.eliminarPlan = function(osId, planId) {
  if (!confirm('¿Eliminar este plan?')) return;

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible.', 'error');
    return;
  }

  db.collection('obras_sociales').doc(osId).get()
    .then(doc => {
      if (!doc.exists) throw new Error('Obra social no encontrada');
      const data = doc.data();
      const planes = data.planes || [];
      const nuevosPlanes = planes.filter(p => p.id !== planId);
      return db.collection('obras_sociales').doc(osId).update({ planes: nuevosPlanes });
    })
    .then(() => {
      showToast('🗑 Plan eliminado.');
      // Si estamos en la vista de edición, refrescar
      const view = document.getElementById('view-obras_sociales');
      if (view && view.innerHTML.includes('Editar obra social')) {
        renderEditarObraSocial(osId);
      } else {
        renderObrasSociales();
      }
    })
    .catch(err => alert('❌ Error: ' + err.message));
};

// ============================================================
// RENDER: NUEVA LIQUIDACIÓN (redirige a liquidaciones OS)
// ============================================================
window.renderNuevaLiquidacionOS = function() {
  // Si existe la función renderLiquidacionesOS, la invocamos
  if (typeof renderLiquidacionesOS === 'function') {
    renderLiquidacionesOS();
    // También podríamos pasar un parámetro para indicar que queremos nueva liquidación
    // Pero asumimos que la vista de liquidaciones tiene su propio botón "Nueva liquidación"
    if (typeof setActiveMenuItem === 'function') {
      setActiveMenuItem('Liquidaciones OS');
    }
  } else {
    // Fallback: mostrar mensaje
    const el = document.getElementById('view-obras_sociales');
    if (el) {
      el.innerHTML = `
        <div class="page-header">
          <div>
            <div class="page-title">Nueva liquidación</div>
            <div class="page-subtitle">Función en desarrollo</div>
          </div>
          <button class="btn btn-secondary" onclick="renderObrasSociales()">← Volver</button>
        </div>
        <div class="card">
          <p class="text-muted">La funcionalidad de liquidaciones estará disponible próximamente.</p>
          <button class="btn btn-secondary" onclick="renderObrasSociales()">Volver a obras sociales</button>
        </div>
      `;
    }
  }
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-obras_sociales')) {
  renderObrasSociales();
}
