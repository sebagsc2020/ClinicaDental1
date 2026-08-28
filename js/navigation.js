// ============================================================
// NAVEGACIÓN SPA (versión mejorada)
// ============================================================

// ============================================================
// FUNCIONES AUXILIARES (getElementById, querySelectorAll)
// ============================================================
function $(id) { return document.getElementById(id); }
function qsa(sel) { return document.querySelectorAll(sel); }

// ============================================================
// MOSTRAR/OCULTAR VISTAS (para usar con onclick)
// ============================================================
function mostrarVista(id) {
  // Oculta todas las vistas
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  // Muestra la vista seleccionada
  const target = document.getElementById('view-' + id);
  if (target) target.classList.add('active');
}

// ============================================================
// ACTIVAR ITEM DEL MENÚ (sidebar y topnav)
// ============================================================
function setActiveMenuItem(viewId) {
  // Remover active de todos los items del sidebar
  document.querySelectorAll('.sidebar .sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  // Remover active de todos los enlaces del topnav
  document.querySelectorAll('.topnav .nav-links a').forEach(item => {
    item.classList.remove('active');
  });

  // Buscar el item del sidebar que coincida con el onclick
  document.querySelectorAll('.sidebar .sidebar-item').forEach(item => {
    const onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes(viewId)) {
      item.classList.add('active');
    }
  });
  // Buscar en topnav
  document.querySelectorAll('.topnav .nav-links a').forEach(item => {
    const onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes(viewId)) {
      item.classList.add('active');
    }
  });
}

// ============================================================
// SIDEBAR: TOGGLE Y COLAPSO (ya lo tenías, lo conservamos)
// ============================================================
function toggleGroup(id) {
  if (document.documentElement.classList.contains('sidebar-collapsed')) {
    setSidebarCollapsed(false);
    return;
  }
  var el  = document.getElementById(id);
  if (!el) return;
  var btn = el.previousElementSibling ? el.previousElementSibling.querySelector('.sidebar-chevron') : null;
  var open = el.classList.contains('open');
  el.classList.toggle('open', !open);
  if (btn) btn.classList.toggle('open', !open);
}

function setSidebarCollapsed(collapsed) {
  document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
  localStorage.setItem('ds_sidebar_collapsed', collapsed ? '1' : '0');
  var btn = document.getElementById('sb-toggle');
  if (btn) btn.title = collapsed ? 'Expandir menú' : 'Colapsar menú';
}

function toggleSidebarCollapse() {
  setSidebarCollapsed(!document.documentElement.classList.contains('sidebar-collapsed'));
}

// Restaurar estado del sidebar desde localStorage
(function() {
  if (localStorage.getItem('ds_sidebar_collapsed') === '1') {
    document.documentElement.classList.add('sidebar-collapsed');
  }
})();

// ============================================================
// TOGGLE SIDEBAR (para móvil)
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

// ============================================================
// DROPDOWN DEL USUARIO
// ============================================================
function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (dd) {
    dd.classList.toggle('open');
  }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.user-menu-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById('user-dropdown');
    if (dd) dd.classList.remove('open');
  }
});

// ============================================================
// MODAL Y TOAST
// ============================================================
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
  el.innerHTML = `<div style="background:${type === 'success' ? '#16a34a' : '#dc2626'};color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:14px;">${message}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 3000);
}

// ============================================================
// CERRAR SESIÓN
// ============================================================
function cerrarSesion() {
  if (confirm('¿Cerrar sesión?')) {
    if (typeof auth !== 'undefined' && auth.signOut) {
      auth.signOut().then(() => {
        showToast('✅ Sesión cerrada.');
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/login.html';
        }
      }).catch(err => showToast('❌ Error: ' + err.message, 'error'));
    } else {
      // Si no hay auth, redirigir directamente
      window.location.href = '/login.html';
    }
  }
}

// ============================================================
// (Opcional) NAVEGACIÓN CON data-view (si decides usarlo)
// ============================================================
// Si prefieres usar data-view en lugar de onclick, puedes mantener
// esta función y agregar los atributos data-view a los enlaces.
// Por ahora está comentada para no interferir con los onclick.
/*
const views = ['dashboard','agenda','pacientes','profesionales','liquidaciones','automatizaciones',
               'caja','presupuestos','productividad','obras_sociales','liquidaciones_os','inventario',
               'proveedores','tratamientos','especialidades','web','whatsapp','configuracion'];
let currentView = 'dashboard';

function navigateTo(view) {
  if (!views.includes(view)) return;
  currentView = view;
  qsa('.sidebar .sidebar-item[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  qsa('.topnav .nav-links a[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  qsa('.view').forEach(el => el.classList.remove('active'));
  const target = $('view-'+view);
  if (target) target.classList.add('active');
  if (target && target.innerHTML.trim() === '') {
    loadView(view);
  }
}

function loadView(view) {
  switch(view) {
    case 'dashboard': renderDashboard(); break;
    case 'agenda': renderAgenda(); break;
    // ... etc
  }
}
*/
