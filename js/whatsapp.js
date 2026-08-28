// ============================================================
// WHATSAPP
// ============================================================
function renderWhatsApp() {
  $('view-whatsapp').innerHTML = `
    <div class="page-header"><div><div class="page-title">WhatsApp</div><div class="page-subtitle">Configuración</div></div></div>
    <div class="card">
      <div class="form-group"><label class="form-label">Proveedor</label><select class="form-control" id="wp-proveedor"><option value="evolution">Evolution API</option><option value="meta">Meta (Oficial)</option></select></div>
      <div class="form-group"><label class="form-label">API Key / Token</label><input class="form-control" id="wp-token" placeholder="Token"></div>
      <div class="form-group"><label class="form-label">Mensaje automático</label><textarea class="form-control" id="wp-mensaje" rows="2">Hola {nombre}, recibimos tu mensaje.</textarea></div>
      <button class="btn btn-primary" onclick="guardarWhatsApp()">Guardar</button>
    </div>
  `;
  db.collection('whatsapp_config').doc('main').get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      $('wp-proveedor').value = data.proveedor||'evolution';
      $('wp-token').value = data.token||'';
      $('wp-mensaje').value = data.mensaje_auto||'';
    }
  });
}

window.guardarWhatsApp = function() {
  const proveedor = $('wp-proveedor').value;
  const token = $('wp-token').value.trim();
  const mensaje_auto = $('wp-mensaje').value.trim();
  db.collection('whatsapp_config').doc('main').set({ proveedor, token, mensaje_auto, updated: new Date().toISOString() })
    .then(() => showToast('Configuración guardada'));
};