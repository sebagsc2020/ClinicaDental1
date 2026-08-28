// ============================================================
// OBRAS SOCIALES
// ============================================================
function renderObrasSociales() {
  const el = $('view-obras_sociales');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Obras sociales</div>
        <div class="page-subtitle" id="os-count">Cargando...</div>
      </div>
      <button class="btn btn-primary" onclick="openModalNuevaObraSocial()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nueva obra social
      </button>
    </div>
    <div id="os-list-container" style="display:flex;flex-direction:column;gap:12px;">
      <p class="text-muted">Cargando obras sociales...</p>
    </div>
  `;

  db.collection('obras_sociales').orderBy('nombre').onSnapshot(snap => {
    const container = $('os-list-container');
    const countEl = $('os-count');

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
          <div class="os-card-header">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:40px;height:40px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <div style="font-size:15px;font-weight:700;color:var(--text);">${data.nombre || 'Sin nombre'}</div>
                <div style="font-size:12px;color:var(--text-muted);display:flex;gap:12px;flex-wrap:wrap;margin-top:2px;">
                  ${detalles.join(' · ')}
                </div>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn btn-sm btn-secondary" onclick="openModalNuevoPlan('${id}')">+ Plan</button>
              <button class="btn btn-sm btn-secondary" onclick="openModalEditarObraSocial('${id}')">Editar</button>
              <button class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarObraSocial('${id}')">Eliminar</button>
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
                <span style="font-size:13px;font-weight:600;color:var(--text);">${plan.nombre || 'Plan sin nombre'}</span>
                ${plan.descripcion ? `<div style="font-size:11px;color:var(--text-muted);">${plan.descripcion}</div>` : ''}
              </div>
              <div style="display:flex;gap:4px;margin-left:4px;">
                <button class="btn btn-sm btn-secondary" style="padding:2px 8px;font-size:11px;" onclick="openModalEditarPlan('${id}', '${plan.id || ''}')">Editar</button>
                <button class="btn btn-sm" style="padding:2px 8px;font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;" onclick="eliminarPlan('${id}', '${plan.id || ''}')">✕</button>
              </div>
            </div>
          `;
        });
      }

      html += `
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (countEl) countEl.textContent = `${totalOS} ${totalOS === 1 ? 'registrada' : 'registradas'}`;
  }, error => {
    console.error('Error cargando obras sociales:', error);
    $('os-list-container').innerHTML = '<div class="card"><p class="text-muted">Error al cargar los datos.</p></div>';
  });
}

// ============================================================
// CRUD OBRAS SOCIALES Y PLANES
// ============================================================
let planCounter = 1;

window.openModalNuevaObraSocial = function() {
  planCounter = 1;
  openModal(`
    <div class="modal-title">➕ Nueva obra social</div>

    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input class="form-control" id="f-os-nombre" placeholder="Ej: OSDE" autofocus>
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
      <div id="planes-container">
        <div style="display:flex;gap:8px;margin-bottom:6px;">
          <input class="form-control" id="f-plan-1" placeholder="Nombre del plan" style="flex:1;">
          <input class="form-control" id="f-plan-desc-1" placeholder="Descripción" style="flex:1;">
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-secondary" onclick="agregarCampoPlan()" style="margin-top:4px;">
        + Agregar otro plan
      </button>
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarObraSocialCompleta()">Guardar obra social</button>
    </div>
  `);
};

window.agregarCampoPlan = function() {
  planCounter++;
  const container = document.getElementById('planes-container');
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.marginBottom = '6px';
  div.innerHTML = `
    <input class="form-control" id="f-plan-${planCounter}" placeholder="Nombre del plan" style="flex:1;">
    <input class="form-control" id="f-plan-desc-${planCounter}" placeholder="Descripción" style="flex:1;">
    <button type="button" class="btn btn-sm" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(div);
};

window.guardarObraSocialCompleta = function() {
  const nombre = document.getElementById('f-os-nombre').value.trim();
  const codigo = document.getElementById('f-os-codigo').value.trim();
  const email = document.getElementById('f-os-email').value.trim();

  if (!nombre) return alert('El nombre es obligatorio.');

  const planes = [];
  for (let i = 1; i <= planCounter; i++) {
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

  db.collection('obras_sociales').add({
    nombre,
    codigo,
    email,
    planes: planes,
    creado: new Date().toISOString()
  }).then(() => {
    closeModal();
    planCounter = 1;
    showToast('✅ Obra social creada exitosamente.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.openModalEditarObraSocial = function(id) {
  db.collection('obras_sociales').doc(id).get().then(doc => {
    if (!doc.exists) return alert('No encontrada');
    const data = doc.data();
    openModal(`
      <div class="modal-title">✏️ Editar obra social</div>
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="f-os-edit-nombre" value="${data.nombre || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Código</label>
        <input class="form-control" id="f-os-edit-codigo" value="${data.codigo || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-control" id="f-os-edit-email" type="email" value="${data.email || ''}">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarEdicionObraSocial('${id}')">Actualizar</button>
      </div>
    `);
  });
};

window.guardarEdicionObraSocial = function(id) {
  const nombre = $('f-os-edit-nombre').value.trim();
  const codigo = $('f-os-edit-codigo').value.trim();
  const email = $('f-os-edit-email').value.trim();
  if (!nombre) return alert('El nombre es obligatorio.');

  db.collection('obras_sociales').doc(id).update({ nombre, codigo, email })
    .then(() => { closeModal(); showToast('✅ Actualizada.'); })
    .catch(err => alert('❌ Error: ' + err.message));
};

window.eliminarObraSocial = function(id) {
  if (!confirm('¿Eliminar esta obra social y todos sus planes?')) return;
  db.collection('obras_sociales').doc(id).delete()
    .then(() => showToast('🗑 Eliminada.'))
    .catch(err => alert('❌ Error: ' + err.message));
};

window.openModalNuevoPlan = function(osId) {
  openModal(`
    <div class="modal-title">➕ Nuevo plan</div>
    <div class="form-group">
      <label class="form-label">Nombre del plan *</label>
      <input class="form-control" id="f-plan-nombre" placeholder="Ej: OSDE 210">
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <input class="form-control" id="f-plan-desc" placeholder="Breve descripción">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarPlan('${osId}')">Guardar</button>
    </div>
  `);
};

window.guardarPlan = function(osId) {
  const nombre = $('f-plan-nombre').value.trim();
  const descripcion = $('f-plan-desc').value.trim();
  if (!nombre) return alert('El nombre del plan es obligatorio.');

  const plan = {
    id: Date.now().toString(),
    nombre,
    descripcion
  };

  db.collection('obras_sociales').doc(osId).update({
    planes: firebase.firestore.FieldValue.arrayUnion(plan)
  }).then(() => {
    closeModal();
    showToast('✅ Plan agregado.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.openModalEditarPlan = function(osId, planId) {
  db.collection('obras_sociales').doc(osId).get().then(doc => {
    if (!doc.exists) return alert('No encontrada');
    const data = doc.data();
    const planes = data.planes || [];
    const plan = planes.find(p => p.id === planId);
    if (!plan) return alert('Plan no encontrado');

    openModal(`
      <div class="modal-title">✏️ Editar plan</div>
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="f-plan-edit-nombre" value="${plan.nombre || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <input class="form-control" id="f-plan-edit-desc" value="${plan.descripcion || ''}">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarEdicionPlan('${osId}', '${planId}')">Actualizar</button>
      </div>
    `);
  });
};

window.guardarEdicionPlan = function(osId, planId) {
  const nombre = $('f-plan-edit-nombre').value.trim();
  const descripcion = $('f-plan-edit-desc').value.trim();
  if (!nombre) return alert('El nombre es obligatorio.');

  db.collection('obras_sociales').doc(osId).get().then(doc => {
    if (!doc.exists) return alert('No encontrada');
    const data = doc.data();
    const planes = data.planes || [];
    const index = planes.findIndex(p => p.id === planId);
    if (index === -1) return alert('Plan no encontrado');

    planes[index] = { ...planes[index], nombre, descripcion };
    return db.collection('obras_sociales').doc(osId).update({ planes });
  }).then(() => {
    closeModal();
    showToast('✅ Plan actualizado.');
  }).catch(err => alert('❌ Error: ' + err.message));
};

window.eliminarPlan = function(osId, planId) {
  if (!confirm('¿Eliminar este plan?')) return;

  db.collection('obras_sociales').doc(osId).get().then(doc => {
    if (!doc.exists) return alert('No encontrada');
    const data = doc.data();
    const planes = data.planes || [];
    const nuevosPlanes = planes.filter(p => p.id !== planId);
    return db.collection('obras_sociales').doc(osId).update({ planes: nuevosPlanes });
  }).then(() => {
    showToast('🗑 Plan eliminado.');
  }).catch(err => alert('❌ Error: ' + err.message));
};