// ============================================================
// WEB (Landing page)
// ============================================================
function renderWeb() {
  $('view-web').innerHTML = `
    <div class="page-header"><div><div class="page-title">Landing page</div><div class="page-subtitle">Configuración de la página pública</div></div></div>
    <div class="card">
      <div class="form-group"><label class="form-label">Tagline</label><input class="form-control" id="web-tagline" placeholder="Tu sonrisa, nuestra pasión"></div>
      <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-control" id="web-desc" rows="3"></textarea></div>
      <button class="btn btn-primary" onclick="guardarWeb()">Guardar</button>
    </div>
  `;
  db.collection('landing_config').doc('main').get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      $('web-tagline').value = data.tagline||'';
      $('web-desc').value = data.descripcion||'';
    }
  });
}

window.guardarWeb = function() {
  const tagline = $('web-tagline').value.trim();
  const descripcion = $('web-desc').value.trim();
  db.collection('landing_config').doc('main').set({ tagline, descripcion, updated: new Date().toISOString() })
    .then(() => showToast('Configuración guardada'));
};