// ============================================================
// NAVEGACIÓN SPA (sin variables globales conflictivas)
// ============================================================

// ─── Auxiliares ──────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function qsa(sel) { return document.querySelectorAll(sel); }

// ─── Mostrar/ocultar vistas ─────────────────────────────────
function mostrarVista(id) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('view-' + id);
  if (target) target.classList.add('active');
}

// ─── Activar item del menú ──────────────────────────────────
function setActiveMenuItem(viewId) {
  document.querySelectorAll('.sidebar .sidebar-item, .topnav .nav-links a').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.sidebar .sidebar-item[data-view="' + viewId + '"], .topnav .nav-links a[data-view="' + viewId + '"]').forEach(item => {
    item.classList.add('active');
  });
}

// ─── Sidebar: toggle grupos ─────────────────────────────────
function toggleGroup(id) {
  if (document.documentElement.classList.contains('sidebar-collapsed')) {
    setSidebarCollapsed(false);
    return;
  }
  var el = document.getElementById(id);
  if (!el) return;
  var btn = el.previousElementSibling ? el.previousElementSibling.querySelector('.sidebar-chevron') : null;
  var open = el.classList.contains('open');
  el.classList.toggle('open', !open);
  if (btn) btn.classList.toggle('open', !open);
}

function setSidebarCollapsed(collapsed) {
  document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
  localStorage.setItem('ds_sidebar_collapsed', collapsed ? '1' : '0');
}

// Restaurar estado del sidebar
(function() {
  if (localStorage.getItem('ds_sidebar_collapsed') === '1') {
    document.documentElement.classList.add('sidebar-collapsed');
  }
})();

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// ─── Dropdown usuario ────────────────────────────────────────
function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.user-menu-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById('user-dropdown');
    if (dd) dd.classList.remove('open');
  }
});

// ─── Modal y Toast ───────────────────────────────────────────
function openModal(html) {
  const content = document.getElementById('modal-generic-content');
  if (content) {
    content.innerHTML = html;
    document.getElementById('modal-generic').classList.add('active');
  }
}
function closeModal() {
  document.getElementById('modal-generic').classList.remove('active');
}

function showToast(message, type = 'success') {
  const el = document.getElementById('notif');
  if (!el) return;
  const bg = type === 'success' ? '#16a34a' : '#dc2626';
  el.innerHTML = `<div style="background:${bg};color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:14px;">${message}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 3000);
}

// ─── Cerrar sesión ───────────────────────────────────────────
function cerrarSesion() {
  if (!confirm('¿Cerrar sesión?')) return;
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().then(() => {
      showToast('✅ Sesión cerrada.');
      window.location.href = '/login.html';
    }).catch(err => showToast('❌ Error: ' + err.message, 'error'));
  } else {
    window.location.href = '/login.html';
  }
}

// ─── Navegación principal ────────────────────────────────────
const views = [
  'dashboard','agenda','pacientes','profesionales','liquidaciones',
  'automatizaciones','caja','presupuestos','productividad',
  'obras_sociales','liquidaciones_os','inventario','proveedores',
  'tratamientos','especialidades','web','whatsapp','configuracion'
];
let currentView = 'dashboard';

// Función global de navegación (expuesta en window)
window.navigateTo = function(view) {
  if (!views.includes(view)) return;
  currentView = view;

  // Actualizar clases activas en menús
  qsa('.sidebar .sidebar-item[data-view], .topnav .nav-links a[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  // Mostrar la vista correspondiente
  qsa('.view').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) {
    target.classList.add('active');
    // Cargar contenido si está vacío o si es agenda (refrescar)
    if (target.innerHTML.trim() === '') {
      loadView(view);
    } else if (view === 'agenda' && typeof window.renderAgenda === 'function') {
      window.renderAgenda();
    }
  }
};

function loadView(view) {
  switch(view) {
    case 'dashboard':   if (typeof renderDashboard === 'function') renderDashboard(); break;
    case 'agenda':      if (typeof window.renderAgenda === 'function') window.renderAgenda(); break;
    case 'pacientes':   if (typeof renderPacientes === 'function') renderPacientes(); break;
    case 'profesionales': if (typeof renderProfesionales === 'function') renderProfesionales(); break;
    case 'liquidaciones': if (typeof renderLiquidaciones === 'function') renderLiquidaciones(); break;
    case 'automatizaciones': if (typeof renderAutomatizaciones === 'function') renderAutomatizaciones(); break;
    case 'caja':        if (typeof renderCaja === 'function') renderCaja(); break;
    case 'presupuestos': if (typeof renderPresupuestos === 'function') renderPresupuestos(); break;
    case 'productividad': if (typeof renderProductividad === 'function') renderProductividad(); break;
    case 'obras_sociales': if (typeof renderObrasSociales === 'function') renderObrasSociales(); break;
    case 'liquidaciones_os': if (typeof renderLiquidacionesOS === 'function') renderLiquidacionesOS(); break;
    case 'inventario':  if (typeof renderInventario === 'function') renderInventario(); break;
    case 'proveedores': if (typeof renderProveedores === 'function') renderProveedores(); break;
    case 'tratamientos': if (typeof renderTratamientos === 'function') renderTratamientos(); break;
    case 'especialidades': if (typeof renderEspecialidades === 'function') renderEspecialidades(); break;
    case 'web':         if (typeof renderWeb === 'function') renderWeb(); break;
    case 'whatsapp':    if (typeof renderWhatsApp === 'function') renderWhatsApp(); break;
    case 'configuracion': if (typeof renderConfiguracion === 'function') renderConfiguracion(); break;
    default: break;
  }
}

// ─── Inicialización ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Asignar eventos a los elementos del menú con data-view
  document.querySelectorAll('.sidebar .sidebar-item[data-view], .topnav .nav-links a[data-view]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      var view = this.dataset.view;
      if (view) window.navigateTo(view);
    });
  });

  // Cerrar modal genérico al hacer clic fuera
  document.getElementById('modal-generic').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // Cargar vista inicial
  window.navigateTo('dashboard');
});
