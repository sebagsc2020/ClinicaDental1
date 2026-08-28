// ============================================================
// NAVEGACIÓN SPA
// ============================================================
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

document.querySelectorAll('.sidebar .sidebar-item[data-view]').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.view));
});
document.querySelectorAll('.topnav .nav-links a[data-view]').forEach(btn => {
  btn.addEventListener('click', (e) => { e.preventDefault(); navigateTo(btn.dataset.view); });
});

function toggleUserMenu() {
  const dd = $('user-dropdown');
  dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu-wrap')) $('user-dropdown').style.display = 'none';
});

function loadView(view) {
  switch(view) {
    case 'dashboard': renderDashboard(); break;
    case 'agenda': renderAgenda(); break;
    case 'pacientes': renderPacientes(); break;
    case 'profesionales': renderProfesionales(); break;
    case 'liquidaciones': renderLiquidaciones(); break;
    case 'automatizaciones': renderAutomatizaciones(); break;
    case 'caja': renderCaja(); break;
    case 'presupuestos': renderPresupuestos(); break;
    case 'productividad': renderProductividad(); break;
    case 'obras_sociales': renderObrasSociales(); break;
    case 'liquidaciones_os': renderLiquidacionesOS(); break;
    case 'inventario': renderInventario(); break;
    case 'proveedores': renderProveedores(); break;
    case 'tratamientos': renderTratamientos(); break;
    case 'especialidades': renderEspecialidades(); break;
    case 'web': renderWeb(); break;
    case 'whatsapp': renderWhatsApp(); break;
    case 'configuracion': renderConfiguracion(); break;
  }
}

// ============================================================
// FUNCIONES DE SIDEBAR (toggle, colapsar, etc.)
// ============================================================
function toggleGroup(id) {
  if (document.documentElement.classList.contains('sidebar-collapsed')) {
    setSidebarCollapsed(false);
    return;
  }
  var el  = document.getElementById(id);
  var btn = el.previousElementSibling.querySelector('.sidebar-chevron');
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

function closeSidebar() { /* solo para mobile, se puede dejar vacío */ }