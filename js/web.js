// ============================================================
// WEB (Landing page) - SPA completo
// ============================================================

// ============================================================
// RENDER WEB (Landing page)
// ============================================================
function renderWeb() {
  const el = document.getElementById('view-web');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Landing page pública</div>
        <div class="page-subtitle">
          <a href="#" target="_blank" style="color:var(--primary)" onclick="verLandingPublica()">
            Ver landing pública ↗
          </a>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <a href="#" class="btn btn-secondary" onclick="verLandingPublica()">Ver landing →</a>
      </div>
    </div>

    <style>
    @media (max-width:768px) {
      #landing-tabs-wrapper .tabs { flex-wrap:wrap !important; gap:4px !important }
      #landing-tabs-wrapper .tabs .tab { font-size:12px !important; padding:6px 10px !important; flex-shrink:0 }
    }
    /* Estilos para las tarjetas de plantillas */
    .plt-rubros { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
    .plt-rubro-btn {
      padding:6px 16px; border-radius:100px; border:1.5px solid var(--border);
      font-size:12px; font-weight:600; cursor:pointer; background:transparent;
      color:var(--text-muted); transition:border-color .2s,color .2s,background .2s;
    }
    .plt-rubro-btn.is-active { border-color:var(--primary); color:var(--primary); background:rgba(0,100,210,.06); }
    .plt-rubro-section { display:none; }
    .plt-rubro-section.is-active { display:block; }
    .plt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:16px; }
    .plt-card {
      border:2px solid var(--border);
      border-radius:12px;
      overflow:hidden;
      cursor:pointer;
      transition:border-color .2s,box-shadow .2s;
      position:relative;
      background:var(--bg-card,#fff);
      user-select:none;
    }
    .plt-card:hover { border-color:var(--primary); }
    .plt-card.is-selected { border-color:var(--primary); box-shadow:0 0 0 3px rgba(0,100,210,.12); }
    .plt-preview { height:140px; position:relative; overflow:hidden; }
    .plt-check {
      position:absolute; top:8px; right:8px;
      background:var(--primary); color:#fff;
      border-radius:50%; width:22px; height:22px;
      display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:700;
      opacity:0; transition:opacity .2s; z-index:2;
    }
    .plt-card.is-selected .plt-check { opacity:1; }
    .plt-info { padding:12px 14px 14px; }
    .plt-name { font-weight:700; font-size:14px; color:var(--text); margin-bottom:4px; }
    .plt-desc { font-size:12px; color:var(--text-muted); line-height:1.5; }
    /* Previews de plantillas */
    .plt-preview--clasica { background:linear-gradient(160deg,#0e6ee8 0%,#1a91cc 60%,#fff 60%); }
    .plt-preview--clasica::after {
      content:'';position:absolute;bottom:0;left:0;right:0;height:56px;
      background:#fff;
      clip-path:polygon(0 30%,100% 0,100% 100%,0 100%);
    }
    .plt-pre-clasica-hero { position:absolute;top:16px;left:16px;right:60px; }
    .plt-pre-clasica-hero .h1 { height:10px;background:rgba(255,255,255,.9);border-radius:3px;margin-bottom:6px;width:70%; }
    .plt-pre-clasica-hero .h2 { height:7px;background:rgba(255,255,255,.6);border-radius:3px;width:50%;margin-bottom:10px; }
    .plt-pre-clasica-hero .btn { display:inline-block;height:16px;width:56px;background:rgba(255,255,255,.9);border-radius:4px; }
    .plt-pre-clasica-cards { position:absolute;bottom:10px;left:12px;right:12px;display:flex;gap:6px; }
    .plt-pre-clasica-cards .card { flex:1;height:28px;background:#e8f0fe;border-radius:5px;border:1px solid #c7d7f8; }
    .plt-preview--moderna { background:#0f172a; }
    .plt-pre-moderna-band { position:absolute;top:0;left:0;right:0;height:6px;background:#38bdf8; }
    .plt-pre-moderna-hero { position:absolute;top:18px;left:16px;right:60px; }
    .plt-pre-moderna-hero .tag { height:8px;width:80px;background:rgba(56,189,248,.3);border-radius:10px;margin-bottom:8px; }
    .plt-pre-moderna-hero .h1 { height:10px;background:rgba(255,255,255,.85);border-radius:3px;margin-bottom:5px;width:75%; }
    .plt-pre-moderna-hero .h2 { height:7px;background:rgba(255,255,255,.3);border-radius:3px;width:55%;margin-bottom:10px; }
    .plt-pre-moderna-hero .btn { height:14px;width:52px;background:#38bdf8;border-radius:4px; }
    .plt-pre-moderna-cards { position:absolute;bottom:10px;left:12px;right:12px;display:flex;gap:5px; }
    .plt-pre-moderna-cards .card { flex:1;height:26px;background:#1e293b;border-radius:5px;border:1px solid #334155; }
    .plt-pre-moderna-cards .card::before { content:'';display:block;width:8px;height:8px;background:#38bdf8;border-radius:50%;margin:9px 0 0 8px;opacity:.7; }
    .plt-preview--minimalista { background:#fafafa;border-bottom:1px solid #e8e8e8; }
    .plt-pre-min-hero { position:absolute;top:20px;left:16px;right:90px; }
    .plt-pre-min-hero .tag { height:7px;width:70px;background:#e0e0ff;border-radius:10px;margin-bottom:10px; }
    .plt-pre-min-hero .h1 { height:11px;background:#1a1a2e;border-radius:3px;width:80%;margin-bottom:5px;opacity:.85; }
    .plt-pre-min-hero .h1b { height:11px;background:#6366f1;border-radius:3px;width:40%;margin-bottom:10px;opacity:.85; }
    .plt-pre-min-hero .sub { height:6px;background:#e0e0e0;border-radius:2px;width:90%;margin-bottom:3px; }
    .plt-pre-min-hero .btn { height:14px;width:52px;background:#6366f1;border-radius:4px;margin-top:8px; }
    .plt-pre-min-stats { position:absolute;bottom:0;left:0;right:0;height:32px;background:#fff;border-top:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-around;padding:0 12px; }
    .plt-pre-min-stats .num { height:8px;width:24px;background:#6366f1;border-radius:2px;opacity:.6; }
    .plt-preview--estetica_clasica { background:linear-gradient(160deg,#5a1441 0%,#8c2364 55%,#edf6f6 55%); }
    .plt-preview--estetica_clasica::after {
      content:'';position:absolute;bottom:0;left:0;right:0;height:56px;
      background:#edf6f6;
      clip-path:polygon(0 30%,100% 0,100% 100%,0 100%);
    }
    .plt-pre-estetica_clasica-hero { position:absolute;top:16px;left:16px;right:60px; }
    .plt-pre-estetica_clasica-hero .h1 { height:10px;background:rgba(255,255,255,.9);border-radius:3px;margin-bottom:6px;width:70%; }
    .plt-pre-estetica_clasica-hero .h2 { height:7px;background:rgba(255,255,255,.6);border-radius:3px;width:50%;margin-bottom:10px; }
    .plt-pre-estetica_clasica-hero .btn { display:inline-block;height:16px;width:56px;background:rgba(255,255,255,.9);border-radius:4px; }
    .plt-pre-estetica_clasica-cards { position:absolute;bottom:10px;left:12px;right:12px;display:flex;gap:6px; }
    .plt-pre-estetica_clasica-cards .card { flex:1;height:28px;background:#fce8f0;border-radius:5px;border:1px solid #e8b4ce; }
    .plt-preview--estetica_moderna { background:#1a0a14; }
    .plt-pre-estetica_moderna-band { position:absolute;top:0;left:0;right:0;height:6px;background:#e879a0; }
    .plt-pre-estetica_moderna-hero { position:absolute;top:18px;left:16px;right:60px; }
    .plt-pre-estetica_moderna-hero .tag { height:8px;width:80px;background:rgba(232,121,160,.3);border-radius:10px;margin-bottom:8px; }
    .plt-pre-estetica_moderna-hero .h1 { height:10px;background:rgba(255,255,255,.85);border-radius:3px;margin-bottom:5px;width:75%; }
    .plt-pre-estetica_moderna-hero .h2 { height:7px;background:rgba(255,255,255,.3);border-radius:3px;width:55%;margin-bottom:10px; }
    .plt-pre-estetica_moderna-hero .btn { height:14px;width:52px;background:#e879a0;border-radius:4px; }
    .plt-pre-estetica_moderna-cards { position:absolute;bottom:10px;left:12px;right:12px;display:flex;gap:5px; }
    .plt-pre-estetica_moderna-cards .card { flex:1;height:26px;background:#2d1127;border-radius:5px;border:1px solid rgba(232,121,160,.3); }
    .plt-pre-estetica_moderna-cards .card::before { content:'';display:block;width:8px;height:8px;background:#e879a0;border-radius:50%;margin:9px 0 0 8px;opacity:.7; }
    .plt-preview--estetica_minimalista { background:#fdf8f5;border-bottom:1px solid #ede4e0; }
    .plt-pre-estetica_minimalista-hero { position:absolute;top:20px;left:16px;right:90px; }
    .plt-pre-estetica_minimalista-hero .tag { height:7px;width:70px;background:#fce8f0;border-radius:10px;margin-bottom:10px; }
    .plt-pre-estetica_minimalista-hero .h1 { height:11px;background:#2a1820;border-radius:3px;width:80%;margin-bottom:5px;opacity:.85; }
    .plt-pre-estetica_minimalista-hero .h1b { height:11px;background:#b44f7a;border-radius:3px;width:40%;margin-bottom:10px;opacity:.85; }
    .plt-pre-estetica_minimalista-hero .sub { height:6px;background:#ede4e0;border-radius:2px;width:90%;margin-bottom:3px; }
    .plt-pre-estetica_minimalista-hero .btn { height:14px;width:52px;background:#b44f7a;border-radius:3px;margin-top:8px; }
    .plt-pre-estetica_minimalista-stats { position:absolute;bottom:0;left:0;right:0;height:32px;background:#fff;border-top:1px solid #ede4e0;display:flex;align-items:center;justify-content:space-around;padding:0 12px; }
    .plt-pre-estetica_minimalista-stats .num { height:8px;width:24px;background:#b44f7a;border-radius:2px;opacity:.6; }
    .plt-preview--peluqueria_clasica { background:linear-gradient(160deg,#1a1614 0%,#3a1e0a 55%,#f9f5ef 55%); }
    .plt-preview--peluqueria_clasica::after {
      content:'';position:absolute;bottom:0;left:0;right:0;height:56px;
      background:#f9f5ef;
      clip-path:polygon(0 30%,100% 0,100% 100%,0 100%);
    }
    .plt-pre-peluqueria_clasica-hero { position:absolute;top:16px;left:16px;right:60px; }
    .plt-pre-peluqueria_clasica-hero .h1 { height:10px;background:rgba(255,255,255,.9);border-radius:3px;margin-bottom:6px;width:70%; }
    .plt-pre-peluqueria_clasica-hero .h2 { height:7px;background:rgba(201,151,58,.7);border-radius:3px;width:45%;margin-bottom:10px; }
    .plt-pre-peluqueria_clasica-hero .btn { display:inline-block;height:16px;width:56px;background:#c9973a;border-radius:4px; }
    .plt-pre-peluqueria_clasica-cards { position:absolute;bottom:10px;left:12px;right:12px;display:flex;gap:6px; }
    .plt-pre-peluqueria_clasica-cards .card { flex:1;height:28px;background:#f0e8dc;border-radius:5px;border:1px solid #e8ddd0; }
    .plt-preview--peluqueria_moderna { background:#0c0c0c; }
    .plt-pre-peluqueria_moderna-band { position:absolute;top:0;left:0;right:0;height:6px;background:#1de9c8; }
    .plt-pre-peluqueria_moderna-hero { position:absolute;top:18px;left:16px;right:60px; }
    .plt-pre-peluqueria_moderna-hero .tag { height:8px;width:80px;background:rgba(29,233,200,.25);border-radius:10px;margin-bottom:8px; }
    .plt-pre-peluqueria_moderna-hero .h1 { height:10px;background:rgba(255,255,255,.85);border-radius:3px;margin-bottom:5px;width:75%; }
    .plt-pre-peluqueria_moderna-hero .h2 { height:7px;background:rgba(255,255,255,.3);border-radius:3px;width:55%;margin-bottom:10px; }
    .plt-pre-peluqueria_moderna-hero .btn { height:14px;width:52px;background:#1de9c8;border-radius:4px; }
    .plt-pre-peluqueria_moderna-cards { position:absolute;bottom:10px;left:12px;right:12px;display:flex;gap:5px; }
    .plt-pre-peluqueria_moderna-cards .card { flex:1;height:26px;background:#141414;border-radius:5px;border:1px solid rgba(29,233,200,.2); }
    .plt-pre-peluqueria_moderna-cards .card::before { content:'';display:block;width:8px;height:8px;background:#1de9c8;border-radius:50%;margin:9px 0 0 8px;opacity:.7; }
    .plt-preview--peluqueria_minimalista { background:#faf8f5;border-bottom:1px solid #e8ddd0; }
    .plt-pre-peluqueria_minimalista-hero { position:absolute;top:20px;left:16px;right:90px; }
    .plt-pre-peluqueria_minimalista-hero .tag { height:7px;width:70px;background:#e8ddd0;border-radius:10px;margin-bottom:10px; }
    .plt-pre-peluqueria_minimalista-hero .h1 { height:11px;background:#2c2218;border-radius:3px;width:80%;margin-bottom:5px;opacity:.85; }
    .plt-pre-peluqueria_minimalista-hero .h1b { height:11px;background:#8b6f4e;border-radius:3px;width:40%;margin-bottom:10px;opacity:.85; }
    .plt-pre-peluqueria_minimalista-hero .sub { height:6px;background:#e8ddd0;border-radius:2px;width:90%;margin-bottom:3px; }
    .plt-pre-peluqueria_minimalista-hero .btn { height:14px;width:52px;background:#8b6f4e;border-radius:3px;margin-top:8px; }
    .plt-pre-peluqueria_minimalista-stats { position:absolute;bottom:0;left:0;right:0;height:32px;background:#fff;border-top:1px solid #e8ddd0;display:flex;align-items:center;justify-content:space-around;padding:0 12px; }
    .plt-pre-peluqueria_minimalista-stats .num { height:8px;width:24px;background:#8b6f4e;border-radius:2px;opacity:.6; }
    </style>

    <div id="landing-tabs-wrapper">
    <div class="tabs">
      <div class="tab active" onclick="switchTabWeb(this,'tab-basico','landing-tabs-wrapper')">Inicio</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-plantilla','landing-tabs-wrapper')">Plantilla</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-contacto','landing-tabs-wrapper')">Contacto</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-horarios','landing-tabs-wrapper')">Horarios</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-servicios','landing-tabs-wrapper')">Servicios</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-galeria','landing-tabs-wrapper')">Galería</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-redes','landing-tabs-wrapper')">Redes sociales</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-testimonios','landing-tabs-wrapper')">Testimonios</div>
      <div class="tab" onclick="switchTabWeb(this,'tab-chatbot','landing-tabs-wrapper')">Chatbot IA</div>
    </div>

    <form id="form-landing" onsubmit="event.preventDefault(); guardarWebCompleto()">

    <!-- TAB: INICIO -->
    <div id="tab-basico" data-tab>
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Información principal</div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Tagline / Eslogan</label>
          <input type="text" name="tagline" id="web-tagline" class="form-control" maxlength="255" placeholder="Tu sonrisa, nuestra pasión">
          <span class="form-hint">Frase corta que aparece en el hero de la landing page</span>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción de la clínica</label>
          <textarea name="descripcion" id="web-descripcion" class="form-control" rows="5" placeholder="Contá quiénes son, qué ofrecen, cuántos años de experiencia tienen..."></textarea>
          <span class="form-hint">Aparece en la sección "Quiénes somos"</span>
        </div>
        <div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="checkbox" name="activo" id="web-activo" value="1" style="width:16px;height:16px">
            Landing page activa (visible para los pacientes)
          </label>
        </div>
      </div>
    </div>
    </div>

    <!-- TAB: PLANTILLA -->
    <div id="tab-plantilla" data-tab style="display:none">
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Plantilla de diseño</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Elegí el diseño visual de tu landing page. El contenido (textos, fotos, servicios, contacto) se comparte entre todas las plantillas.</div>

      <!-- Rubros -->
      <div class="plt-rubros">
        <button class="plt-rubro-btn is-active" onclick="switchRubroWeb('odontologia', this)">Odontología</button>
        <button class="plt-rubro-btn" onclick="switchRubroWeb('estetica', this)">Centros de Estética</button>
        <button class="plt-rubro-btn" onclick="switchRubroWeb('peluqueria', this)">Peluquería</button>
      </div>

      <!-- Odontología -->
      <div id="plt-rubro-odontologia" class="plt-rubro-section is-active">
        <div class="plt-grid">
          <label class="plt-card is-selected" onclick="selectPlantillaWeb('clasica')">
            <input type="radio" name="plantilla" value="clasica" checked style="display:none">
            <div class="plt-preview plt-preview--clasica">
              <div class="plt-pre-clasica-hero"><div class="h1"></div><div class="h2"></div><div class="btn"></div></div>
              <div class="plt-pre-clasica-cards"><div class="card"></div><div class="card"></div><div class="card"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Clásica</div><div class="plt-desc">Hero azul con wave, cards de servicios y carrusel de fotos.</div></div>
          </label>
          <label class="plt-card" onclick="selectPlantillaWeb('moderna')">
            <input type="radio" name="plantilla" value="moderna" style="display:none">
            <div class="plt-preview plt-preview--moderna">
              <div class="plt-pre-moderna-band"></div>
              <div class="plt-pre-moderna-hero"><div class="tag"></div><div class="h1"></div><div class="h2"></div><div class="btn"></div></div>
              <div class="plt-pre-moderna-cards"><div class="card"></div><div class="card"></div><div class="card"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Moderna</div><div class="plt-desc">Tema oscuro profesional con acento celeste y cards con borde.</div></div>
          </label>
          <label class="plt-card" onclick="selectPlantillaWeb('minimalista')">
            <input type="radio" name="plantilla" value="minimalista" style="display:none">
            <div class="plt-preview plt-preview--minimalista">
              <div class="plt-pre-min-hero"><div class="tag"></div><div class="h1"></div><div class="h1b"></div><div class="sub"></div><div class="sub" style="width:60%"></div><div class="btn"></div></div>
              <div class="plt-pre-min-stats"><div class="num"></div><div class="num"></div><div class="num"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Minimalista</div><div class="plt-desc">Diseño blanco y elegante con tipografía serif y espacio generoso.</div></div>
          </label>
        </div>
      </div>

      <!-- Centros de Estética -->
      <div id="plt-rubro-estetica" class="plt-rubro-section">
        <div class="plt-grid">
          <label class="plt-card" onclick="selectPlantillaWeb('estetica_clasica')">
            <input type="radio" name="plantilla" value="estetica_clasica" style="display:none">
            <div class="plt-preview plt-preview--estetica_clasica">
              <div class="plt-pre-estetica_clasica-hero"><div class="h1"></div><div class="h2"></div><div class="btn"></div></div>
              <div class="plt-pre-estetica_clasica-cards"><div class="card"></div><div class="card"></div><div class="card"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Clásica</div><div class="plt-desc">Estilo elegante con tonos rosados y wave.</div></div>
          </label>
          <label class="plt-card" onclick="selectPlantillaWeb('estetica_moderna')">
            <input type="radio" name="plantilla" value="estetica_moderna" style="display:none">
            <div class="plt-preview plt-preview--estetica_moderna">
              <div class="plt-pre-estetica_moderna-band"></div>
              <div class="plt-pre-estetica_moderna-hero"><div class="tag"></div><div class="h1"></div><div class="h2"></div><div class="btn"></div></div>
              <div class="plt-pre-estetica_moderna-cards"><div class="card"></div><div class="card"></div><div class="card"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Moderna</div><div class="plt-desc">Tema oscuro con acento rosa y cards con borde.</div></div>
          </label>
          <label class="plt-card" onclick="selectPlantillaWeb('estetica_minimalista')">
            <input type="radio" name="plantilla" value="estetica_minimalista" style="display:none">
            <div class="plt-preview plt-preview--estetica_minimalista">
              <div class="plt-pre-estetica_minimalista-hero"><div class="tag"></div><div class="h1"></div><div class="h1b"></div><div class="sub"></div><div class="sub" style="width:60%"></div><div class="btn"></div></div>
              <div class="plt-pre-estetica_minimalista-stats"><div class="num"></div><div class="num"></div><div class="num"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Minimalista</div><div class="plt-desc">Diseño limpio con tonos cálidos y tipografía refinada.</div></div>
          </label>
        </div>
      </div>

      <!-- Peluquería -->
      <div id="plt-rubro-peluqueria" class="plt-rubro-section">
        <div class="plt-grid">
          <label class="plt-card" onclick="selectPlantillaWeb('peluqueria_clasica')">
            <input type="radio" name="plantilla" value="peluqueria_clasica" style="display:none">
            <div class="plt-preview plt-preview--peluqueria_clasica">
              <div class="plt-pre-peluqueria_clasica-hero"><div class="h1"></div><div class="h2"></div><div class="btn"></div></div>
              <div class="plt-pre-peluqueria_clasica-cards"><div class="card"></div><div class="card"></div><div class="card"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Clásica</div><div class="plt-desc">Estilo tradicional con tonos cálidos y wave.</div></div>
          </label>
          <label class="plt-card" onclick="selectPlantillaWeb('peluqueria_moderna')">
            <input type="radio" name="plantilla" value="peluqueria_moderna" style="display:none">
            <div class="plt-preview plt-preview--peluqueria_moderna">
              <div class="plt-pre-peluqueria_moderna-band"></div>
              <div class="plt-pre-peluqueria_moderna-hero"><div class="tag"></div><div class="h1"></div><div class="h2"></div><div class="btn"></div></div>
              <div class="plt-pre-peluqueria_moderna-cards"><div class="card"></div><div class="card"></div><div class="card"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Moderna</div><div class="plt-desc">Tema oscuro con acento turquesa y cards con borde.</div></div>
          </label>
          <label class="plt-card" onclick="selectPlantillaWeb('peluqueria_minimalista')">
            <input type="radio" name="plantilla" value="peluqueria_minimalista" style="display:none">
            <div class="plt-preview plt-preview--peluqueria_minimalista">
              <div class="plt-pre-peluqueria_minimalista-hero"><div class="tag"></div><div class="h1"></div><div class="h1b"></div><div class="sub"></div><div class="sub" style="width:60%"></div><div class="btn"></div></div>
              <div class="plt-pre-peluqueria_minimalista-stats"><div class="num"></div><div class="num"></div><div class="num"></div></div>
            </div>
            <div class="plt-check">✓</div>
            <div class="plt-info"><div class="plt-name">Minimalista</div><div class="plt-desc">Diseño natural con tonos tierra y tipografía limpia.</div></div>
          </label>
        </div>
      </div>

      <div style="margin-top:16px;padding:12px 14px;background:#f8fafc;border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--text-muted)">
        💡 <strong>Recordá guardar</strong> para que el cambio de plantilla se aplique en la landing pública.
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Colores de marca</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Elegí el color principal (botones, acentos) y el color secundario (fondos oscuros) de tu landing pública.</div>
      <div style="display:flex;flex-wrap:wrap;gap:28px">
        <div class="form-group" style="margin:0">
          <label class="form-label">Color principal</label>
          <div style="display:flex;align-items:center;gap:10px">
            <input type="color" id="color_primario_picker" value="#355063" oninput="document.getElementById('color_primario_hex').value=this.value.toUpperCase();document.getElementById('color_primario').value=this.value" style="width:44px;height:38px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px">
            <input type="text" id="color_primario_hex" class="form-control" value="#355063" oninput="if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){document.getElementById('color_primario_picker').value=this.value;document.getElementById('color_primario').value=this.value}" placeholder="#1db6b3" maxlength="7" style="width:120px">
            <input type="hidden" name="color_primario" id="color_primario" value="#355063">
          </div>
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Color secundario</label>
          <div style="display:flex;align-items:center;gap:10px">
            <input type="color" id="color_secundario_picker" value="#05254C" oninput="document.getElementById('color_secundario_hex').value=this.value.toUpperCase();document.getElementById('color_secundario').value=this.value" style="width:44px;height:38px;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:2px">
            <input type="text" id="color_secundario_hex" class="form-control" value="#05254C" oninput="if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){document.getElementById('color_secundario_picker').value=this.value;document.getElementById('color_secundario').value=this.value}" placeholder="#05254c" maxlength="7" style="width:120px">
            <input type="hidden" name="color_secundario" id="color_secundario" value="#05254C">
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- TAB: CONTACTO -->
    <div id="tab-contacto" data-tab style="display:none">
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Datos de contacto</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input type="text" name="telefono" id="web-telefono" class="form-control" placeholder="+54 11 1234-5678">
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp</label>
          <input type="text" name="whatsapp" id="web-whatsapp" class="form-control" placeholder="+54 9 11 1234-5678">
          <span class="form-hint">Número con código de país, sin espacios</span>
        </div>
        <div class="form-group">
          <label class="form-label">Email de contacto</label>
          <input type="email" name="email_contacto" id="web-email" class="form-control" placeholder="info@miclinica.com">
        </div>
        <div class="form-group">
          <label class="form-label">Sitio web</label>
          <input type="url" name="website" id="web-website" class="form-control" placeholder="https://miclinica.com">
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Ubicación</div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Dirección</label>
          <input type="text" name="direccion" id="web-direccion" class="form-control" placeholder="Av. Corrientes 1234, Piso 3">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Ciudad</label>
            <input type="text" name="ciudad" id="web-ciudad" class="form-control" placeholder="Buenos Aires">
          </div>
          <div class="form-group">
            <label class="form-label">Provincia</label>
            <input type="text" name="provincia" id="web-provincia" class="form-control" placeholder="CABA">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Embed de Google Maps</label>
          <textarea name="google_maps_embed" id="web-maps" class="form-control" rows="3" placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'></textarea>
          <span class="form-hint">En Google Maps → Compartir → Insertar mapa → copiá el código &lt;iframe&gt;</span>
        </div>
      </div>
    </div>
    </div>

    <!-- TAB: HORARIOS -->
    <div id="tab-horarios" data-tab style="display:none">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Horarios de atención</div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="addHorarioWeb()">+ Agregar fila</button>
      </div>
      <div style="margin-bottom:8px;display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;font-size:11px;font-weight:700;color:var(--text-muted)">
        <div>Días</div>
        <div>Horario</div>
        <div></div>
      </div>
      <div id="horarios-container"></div>
    </div>
    </div>

    <!-- TAB: SERVICIOS -->
    <div id="tab-servicios" data-tab style="display:none">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Servicios destacados</div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="addServicioWeb()">+ Agregar servicio</button>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Aparecen como tarjetas en la landing page. Podés usar cualquier emoji como ícono.</div>
      <div id="servicios-container"></div>
    </div>
    </div>

    <!-- TAB: GALERÍA -->
    <div id="tab-galeria" data-tab style="display:none">
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Galería de fotos</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Subí fotos desde tu ordenador o pegá una URL externa. Hasta 6 fotos · Máx. 5 MB por imagen.</div>
      <div style="display:flex;flex-direction:column;gap:10px" id="galeria-container"></div>
    </div>
    </div>

    <!-- TAB: REDES SOCIALES -->
    <div id="tab-redes" data-tab style="display:none">
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Redes sociales</div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Instagram</label>
          <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden">
            <span style="padding:8px 10px;background:var(--bg);color:var(--text-muted);font-size:13px;border-right:1px solid var(--border)">instagram.com/</span>
            <input type="text" name="instagram" id="web-instagram" style="border:none;padding:8px 10px;flex:1;outline:none;font-size:13px" placeholder="miclinica">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Facebook</label>
          <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden">
            <span style="padding:8px 10px;background:var(--bg);color:var(--text-muted);font-size:13px;border-right:1px solid var(--border)">facebook.com/</span>
            <input type="text" name="facebook" id="web-facebook" style="border:none;padding:8px 10px;flex:1;outline:none;font-size:13px" placeholder="miclinica">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">TikTok</label>
          <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden">
            <span style="padding:8px 10px;background:var(--bg);color:var(--text-muted);font-size:13px;border-right:1px solid var(--border)">tiktok.com/@</span>
            <input type="text" name="tiktok" id="web-tiktok" style="border:none;padding:8px 10px;flex:1;outline:none;font-size:13px" placeholder="miclinica">
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- TAB: TESTIMONIOS -->
    <div id="tab-testimonios" data-tab style="display:none">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Testimonios de pacientes</div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="addTestimonioWeb()">+ Agregar testimonio</button>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Hasta 9 testimonios · Se muestran en la sección de reviews de la landing page.</div>
      <div id="testimonios-container"></div>
    </div>
    </div>

    <!-- TAB: CHATBOT -->
    <div id="tab-chatbot" data-tab style="display:none">
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Asistente virtual con IA</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px">El chatbot aparece como un botón flotante en la landing pública y responde preguntas usando OpenAI a través de tu flujo de n8n.</div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">URL del webhook de n8n</label>
          <input type="url" name="chatbot_webhook_url" id="web-chatbot-url" class="form-control" placeholder="https://tu-n8n.com/webhook/dental-chatbot">
          <span class="form-hint">Copiá la URL del webhook de tu flujo n8n. Si está vacío, el chatbot no aparece en la landing.</span>
        </div>
        <div class="form-group">
          <label class="form-label">Token de seguridad (API)</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="text" name="chatbot_api_token" id="web-chatbot-token" class="form-control" placeholder="Generá un token secreto y ponelo también en n8n">
            <button type="button" class="btn btn-secondary btn-sm" onclick="generarTokenWeb()" style="white-space:nowrap">Generar</button>
          </div>
          <span class="form-hint">Token secreto que autentica las llamadas de n8n a la API de DentalSoft. Debe coincidir con el valor en el nodo de n8n.</span>
        </div>
        <div class="form-group">
          <label class="form-label">URL base de la API <span style="font-weight:400;color:var(--text-muted)">(solo si n8n corre en Docker)</span></label>
          <input type="url" name="chatbot_api_base_url" id="web-chatbot-base-url" class="form-control" placeholder="http://host.docker.internal  ó  http://192.168.1.x">
          <span class="form-hint">Solo el <strong>host</strong>, sin subfolder ni ruta. Ej: <code>http://host.docker.internal</code> (Docker en Windows/Mac) o <code>http://172.17.0.1</code> (Docker en Linux). El sistema agrega automáticamente el path correcto. Dejá vacío si DentalSoft tiene una URL pública.</span>
        </div>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px 16px;font-size:13px;color:#0369a1">
          <strong>¿Cómo configurarlo?</strong><br>
          1. Importá el workflow JSON que te proveyó DentalSoft en tu n8n.<br>
          2. Configurá tu credencial de OpenAI en n8n (clave API).<br>
          3. Activá el workflow y copiá la URL del nodo Webhook aquí.<br>
          4. Guardá los cambios y el chatbot aparecerá en tu landing.
        </div>
      </div>
    </div>
    </div>

    <!-- Guardar -->
    <div style="display:flex;justify-content:flex-end;padding:20px 0;border-top:1px solid var(--border);margin-top:4px">
      <button type="submit" class="btn btn-primary" style="min-width:160px">Guardar cambios</button>
    </div>

    </form>
    </div>

    <!-- Templates -->
    <template id="tpl-horario-web">
      <div class="horario-row" style="display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;margin-bottom:6px;align-items:center">
        <input type="text" name="hor_dias[]" class="form-control" placeholder="Lunes a Viernes">
        <input type="text" name="hor_hora[]" class="form-control" placeholder="09:00 – 18:00">
        <button type="button" onclick="this.closest('.horario-row').remove()" style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:0">✕</button>
      </div>
    </template>

    <template id="tpl-servicio-web">
      <div class="servicio-row" style="display:grid;grid-template-columns:60px 1fr 1fr 32px;gap:8px;margin-bottom:8px;align-items:start">
        <input type="text" name="srv_icono[]" class="form-control" value="🦷" style="text-align:center;font-size:20px" placeholder="🦷">
        <input type="text" name="srv_titulo[]" class="form-control" placeholder="Nombre del servicio">
        <input type="text" name="srv_descripcion[]" class="form-control" placeholder="Descripción breve">
        <button type="button" onclick="this.closest('.servicio-row').remove()" style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:0;margin-top:6px">✕</button>
      </div>
    </template>

    <template id="tpl-testimonio-web">
      <div class="testimonio-row" style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px">
        <div style="display:grid;grid-template-columns:1fr auto 32px;gap:8px;align-items:center">
          <input type="text" name="test_nombre[]" class="form-control" placeholder="Nombre del paciente">
          <div style="display:flex;gap:4px;align-items:center" class="star-selector">
            <label style="cursor:pointer;font-size:20px;color:var(--border)"><input type="radio" name="test_reputacion[]" value="1" style="display:none" onchange="updateStarsWeb(this)">★</label>
            <label style="cursor:pointer;font-size:20px;color:var(--border)"><input type="radio" name="test_reputacion[]" value="2" style="display:none" onchange="updateStarsWeb(this)">★</label>
            <label style="cursor:pointer;font-size:20px;color:var(--border)"><input type="radio" name="test_reputacion[]" value="3" style="display:none" onchange="updateStarsWeb(this)">★</label>
            <label style="cursor:pointer;font-size:20px;color:var(--border)"><input type="radio" name="test_reputacion[]" value="4" style="display:none" onchange="updateStarsWeb(this)">★</label>
            <label style="cursor:pointer;font-size:20px;color:#f59e0b"><input type="radio" name="test_reputacion[]" value="5" checked style="display:none" onchange="updateStarsWeb(this)">★</label>
          </div>
          <button type="button" onclick="this.closest('.testimonio-row').remove()" style="background:none;border:none;color:var(--danger);font-size:18px;cursor:pointer;padding:0">✕</button>
        </div>
        <textarea name="test_comentario[]" class="form-control" rows="2" placeholder="Comentario del paciente..."></textarea>
      </div>
    </template>

    <template id="tpl-foto-web">
      <div class="foto-row" style="display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center">
        <div class="foto-thumb" style="width:56px;height:42px;border-radius:6px;border:1px solid var(--border);overflow:hidden;background:var(--bg);flex-shrink:0;display:flex;align-items:center;justify-content:center">
          <span style="font-size:20px;color:var(--text-muted)">🖼️</span>
        </div>
        <input type="url" name="fotos[]" class="form-control foto-url-input" placeholder="https://mi-imagen.com/foto.jpg" oninput="previewFotoUrlWeb(this)">
        <div style="display:flex;flex-direction:column;gap:4px">
          <button type="button" class="btn btn-sm btn-secondary upload-foto-btn" onclick="this.nextElementSibling.click()" style="white-space:nowrap;font-size:12px;padding:5px 10px">📁 Subir</button>
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none" onchange="uploadFotoWeb(this)">
        </div>
      </div>
    </template>
  `;

  // Cargar datos desde Firestore
  cargarWebData();
}

// ============================================================
// CARGAR DATOS DE LA LANDING DESDE FIRESTORE
// ============================================================
function cargarWebData() {
  if (typeof db === 'undefined') {
    console.warn('Firestore no disponible');
    return;
  }

  db.collection('landing_config').doc('main').get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        // Campos básicos
        setVal('web-tagline', data.tagline);
        setVal('web-descripcion', data.descripcion);
        if (data.activo) document.getElementById('web-activo').checked = true;

        // Contacto
        setVal('web-telefono', data.telefono);
        setVal('web-whatsapp', data.whatsapp);
        setVal('web-email', data.email_contacto);
        setVal('web-website', data.website);
        setVal('web-direccion', data.direccion);
        setVal('web-ciudad', data.ciudad);
        setVal('web-provincia', data.provincia);
        setVal('web-maps', data.google_maps_embed);

        // Redes sociales
        setVal('web-instagram', data.instagram);
        setVal('web-facebook', data.facebook);
        setVal('web-tiktok', data.tiktok);

        // Chatbot
        setVal('web-chatbot-url', data.chatbot_webhook_url);
        setVal('web-chatbot-token', data.chatbot_api_token);
        setVal('web-chatbot-base-url', data.chatbot_api_base_url);

        // Colores
        if (data.color_primario) {
          document.getElementById('color_primario').value = data.color_primario;
          document.getElementById('color_primario_picker').value = data.color_primario;
          document.getElementById('color_primario_hex').value = data.color_primario.toUpperCase();
        }
        if (data.color_secundario) {
          document.getElementById('color_secundario').value = data.color_secundario;
          document.getElementById('color_secundario_picker').value = data.color_secundario;
          document.getElementById('color_secundario_hex').value = data.color_secundario.toUpperCase();
        }

        // Plantilla
        if (data.plantilla) {
          selectPlantillaWeb(data.plantilla);
        }

        // Horarios
        if (data.horarios && data.horarios.length) {
          const container = document.getElementById('horarios-container');
          container.innerHTML = '';
          data.horarios.forEach(h => {
            const row = document.createElement('div');
            row.className = 'horario-row';
            row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;margin-bottom:6px;align-items:center';
            row.innerHTML = `
              <input type="text" name="hor_dias[]" class="form-control" value="${escapeHtmlWeb(h.dias || '')}" placeholder="Lunes a Viernes">
              <input type="text" name="hor_hora[]" class="form-control" value="${escapeHtmlWeb(h.hora || '')}" placeholder="09:00 – 18:00">
              <button type="button" onclick="this.closest('.horario-row').remove()" style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:0">✕</button>
            `;
            container.appendChild(row);
          });
        } else {
          // Agregar filas por defecto
          addHorarioWeb();
          addHorarioWeb();
          addHorarioWeb();
        }

        // Servicios
        if (data.servicios && data.servicios.length) {
          const container = document.getElementById('servicios-container');
          container.innerHTML = '';
          data.servicios.forEach(s => {
            const row = document.createElement('div');
            row.className = 'servicio-row';
            row.style.cssText = 'display:grid;grid-template-columns:60px 1fr 1fr 32px;gap:8px;margin-bottom:8px;align-items:start';
            row.innerHTML = `
              <input type="text" name="srv_icono[]" class="form-control" value="${escapeHtmlWeb(s.icono || '🦷')}" style="text-align:center;font-size:20px" placeholder="🦷">
              <input type="text" name="srv_titulo[]" class="form-control" value="${escapeHtmlWeb(s.titulo || '')}" placeholder="Nombre del servicio">
              <input type="text" name="srv_descripcion[]" class="form-control" value="${escapeHtmlWeb(s.descripcion || '')}" placeholder="Descripción breve">
              <button type="button" onclick="this.closest('.servicio-row').remove()" style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:0;margin-top:6px">✕</button>
            `;
            container.appendChild(row);
          });
        } else {
          // Agregar servicios por defecto
          addServicioWeb();
          addServicioWeb();
          addServicioWeb();
        }

        // Galería
        if (data.fotos && data.fotos.length) {
          const container = document.getElementById('galeria-container');
          container.innerHTML = '';
          data.fotos.forEach(foto => {
            const row = document.createElement('div');
            row.className = 'foto-row';
            row.style.cssText = 'display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center';
            row.innerHTML = `
              <div class="foto-thumb" style="width:56px;height:42px;border-radius:6px;border:1px solid var(--border);overflow:hidden;background:var(--bg);flex-shrink:0;display:flex;align-items:center;justify-content:center">
                <img src="${escapeHtmlWeb(foto)}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
              </div>
              <input type="url" name="fotos[]" class="form-control foto-url-input" value="${escapeHtmlWeb(foto)}" placeholder="https://mi-imagen.com/foto.jpg" oninput="previewFotoUrlWeb(this)">
              <div style="display:flex;flex-direction:column;gap:4px">
                <button type="button" class="btn btn-sm btn-secondary upload-foto-btn" onclick="this.nextElementSibling.click()" style="white-space:nowrap;font-size:12px;padding:5px 10px">📁 Subir</button>
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none" onchange="uploadFotoWeb(this)">
              </div>
            `;
            container.appendChild(row);
          });
        } else {
          // Agregar filas de fotos por defecto
          for (let i = 0; i < 3; i++) addFotoWeb();
        }

        // Testimonios
        if (data.testimonios && data.testimonios.length) {
          const container = document.getElementById('testimonios-container');
          container.innerHTML = '';
          data.testimonios.forEach(t => {
            const row = document.createElement('div');
            row.className = 'testimonio-row';
            row.style.cssText = 'border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px';
            const estrellas = t.reputacion || 5;
            row.innerHTML = `
              <div style="display:grid;grid-template-columns:1fr auto 32px;gap:8px;align-items:center">
                <input type="text" name="test_nombre[]" class="form-control" value="${escapeHtmlWeb(t.nombre || '')}" placeholder="Nombre del paciente">
                <div style="display:flex;gap:4px;align-items:center" class="star-selector">
                  ${[1,2,3,4,5].map(i => `
                    <label style="cursor:pointer;font-size:20px;color:${i <= estrellas ? '#f59e0b' : 'var(--border)'}">
                      <input type="radio" name="test_reputacion[]" value="${i}" ${i === estrellas ? 'checked' : ''} style="display:none" onchange="updateStarsWeb(this)">★
                    </label>
                  `).join('')}
                </div>
                <button type="button" onclick="this.closest('.testimonio-row').remove()" style="background:none;border:none;color:var(--danger);font-size:18px;cursor:pointer;padding:0">✕</button>
              </div>
              <textarea name="test_comentario[]" class="form-control" rows="2" placeholder="Comentario del paciente...">${escapeHtmlWeb(t.comentario || '')}</textarea>
            `;
            container.appendChild(row);
          });
        } else {
          // Agregar testimonios por defecto
          addTestimonioWeb();
          addTestimonioWeb();
          addTestimonioWeb();
        }
      } else {
        // Datos por defecto
        addHorarioWeb();
        addHorarioWeb();
        addHorarioWeb();
        addServicioWeb();
        addServicioWeb();
        addServicioWeb();
        for (let i = 0; i < 3; i++) addFotoWeb();
        addTestimonioWeb();
        addTestimonioWeb();
        addTestimonioWeb();
      }
    })
    .catch(err => {
      console.error('Error cargando landing_config:', err);
      // Cargar datos por defecto
      addHorarioWeb();
      addHorarioWeb();
      addHorarioWeb();
      addServicioWeb();
      addServicioWeb();
      addServicioWeb();
      for (let i = 0; i < 3; i++) addFotoWeb();
      addTestimonioWeb();
      addTestimonioWeb();
      addTestimonioWeb();
    });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}

function escapeHtmlWeb(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// GUARDAR DATOS COMPLETOS DE LA LANDING
// ============================================================
window.guardarWebCompleto = function() {
  // Recoger datos del formulario
  const data = {
    tagline: getVal('web-tagline'),
    descripcion: getVal('web-descripcion'),
    activo: document.getElementById('web-activo').checked,
    telefono: getVal('web-telefono'),
    whatsapp: getVal('web-whatsapp'),
    email_contacto: getVal('web-email'),
    website: getVal('web-website'),
    direccion: getVal('web-direccion'),
    ciudad: getVal('web-ciudad'),
    provincia: getVal('web-provincia'),
    google_maps_embed: getVal('web-maps'),
    instagram: getVal('web-instagram'),
    facebook: getVal('web-facebook'),
    tiktok: getVal('web-tiktok'),
    chatbot_webhook_url: getVal('web-chatbot-url'),
    chatbot_api_token: getVal('web-chatbot-token'),
    chatbot_api_base_url: getVal('web-chatbot-base-url'),
    color_primario: document.getElementById('color_primario').value,
    color_secundario: document.getElementById('color_secundario').value,
    plantilla: document.querySelector('input[name="plantilla"]:checked')?.value || 'clasica',
    horarios: [],
    servicios: [],
    fotos: [],
    testimonios: [],
    updated: new Date().toISOString()
  };

  // Horarios
  document.querySelectorAll('.horario-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 2) {
      const dias = inputs[0].value.trim();
      const hora = inputs[1].value.trim();
      if (dias || hora) {
        data.horarios.push({ dias, hora });
      }
    }
  });

  // Servicios
  document.querySelectorAll('.servicio-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 3) {
      const icono = inputs[0].value.trim();
      const titulo = inputs[1].value.trim();
      const descripcion = inputs[2].value.trim();
      if (titulo) {
        data.servicios.push({ icono: icono || '🦷', titulo, descripcion });
      }
    }
  });

  // Fotos
  document.querySelectorAll('.foto-row .foto-url-input').forEach(input => {
    const url = input.value.trim();
    if (url) data.fotos.push(url);
  });

  // Testimonios
  document.querySelectorAll('.testimonio-row').forEach(row => {
    const nombreInput = row.querySelector('input[name="test_nombre[]"]');
    const comentarioTextarea = row.querySelector('textarea');
    const radioChecked = row.querySelector('input[name="test_reputacion[]"]:checked');
    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const comentario = comentarioTextarea ? comentarioTextarea.value.trim() : '';
    const reputacion = radioChecked ? parseInt(radioChecked.value) : 5;
    if (nombre || comentario) {
      data.testimonios.push({ nombre, comentario, reputacion });
    }
  });

  if (typeof db === 'undefined') {
    showToast('⚠️ Firestore no disponible. Datos guardados localmente.', 'error');
    console.log('Datos guardados:', data);
    return;
  }

  db.collection('landing_config').doc('main').set(data)
    .then(() => {
      showToast('✅ Configuración de landing guardada correctamente.');
    })
    .catch(err => {
      showToast('❌ Error al guardar: ' + err.message, 'error');
    });
};

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// ============================================================
// FUNCIONES DE TABS
// ============================================================
window.switchTabWeb = function(el, tabId, wrapperId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  wrapper.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  wrapper.querySelectorAll('[data-tab]').forEach(t => t.style.display = 'none');
  const target = document.getElementById(tabId);
  if (target) target.style.display = 'block';
};

// ============================================================
// FUNCIONES DE PLANTILLAS
// ============================================================
window.selectPlantillaWeb = function(value) {
  document.querySelectorAll('.plt-card').forEach(card => {
    const radio = card.querySelector('input[type=radio]');
    if (radio && radio.value === value) {
      radio.checked = true;
      card.classList.add('is-selected');
    } else {
      card.classList.remove('is-selected');
    }
  });
};

window.switchRubroWeb = function(rubro, btn) {
  document.querySelectorAll('.plt-rubro-section').forEach(s => s.classList.remove('is-active'));
  document.querySelectorAll('.plt-rubro-btn').forEach(b => b.classList.remove('is-active'));
  const sec = document.getElementById('plt-rubro-' + rubro);
  if (sec) sec.classList.add('is-active');
  if (btn) btn.classList.add('is-active');
};

// ============================================================
// FUNCIONES DE HORARIOS
// ============================================================
window.addHorarioWeb = function() {
  const tpl = document.getElementById('tpl-horario-web');
  if (!tpl) return;
  const container = document.getElementById('horarios-container');
  if (container) {
    const clone = tpl.content.cloneNode(true);
    container.appendChild(clone);
  }
};

// ============================================================
// FUNCIONES DE SERVICIOS
// ============================================================
window.addServicioWeb = function() {
  const tpl = document.getElementById('tpl-servicio-web');
  if (!tpl) return;
  const container = document.getElementById('servicios-container');
  if (container) {
    const clone = tpl.content.cloneNode(true);
    container.appendChild(clone);
  }
};

// ============================================================
// FUNCIONES DE TESTIMONIOS
// ============================================================
window.addTestimonioWeb = function() {
  const container = document.getElementById('testimonios-container');
  if (!container) return;
  if (container.querySelectorAll('.testimonio-row').length >= 9) {
    alert('Máximo 9 testimonios permitidos.');
    return;
  }
  const tpl = document.getElementById('tpl-testimonio-web');
  if (tpl) {
    const clone = tpl.content.cloneNode(true);
    container.appendChild(clone);
  }
};

window.updateStarsWeb = function(radio) {
  const selector = radio.closest('.star-selector');
  if (!selector) return;
  const val = parseInt(radio.value);
  selector.querySelectorAll('label').forEach((lbl, i) => {
    lbl.style.color = (i < val) ? '#f59e0b' : 'var(--border)';
  });
};

// ============================================================
// FUNCIONES DE GALERÍA (FOTOS)
// ============================================================
window.addFotoWeb = function() {
  const tpl = document.getElementById('tpl-foto-web');
  if (!tpl) return;
  const container = document.getElementById('galeria-container');
  if (container) {
    const clone = tpl.content.cloneNode(true);
    container.appendChild(clone);
  }
};

window.previewFotoUrlWeb = function(input) {
  const row = input.closest('.foto-row');
  if (!row) return;
  const thumb = row.querySelector('.foto-thumb');
  if (!thumb) return;
  let img = thumb.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.style.cssText = 'width:100%;height:100%;object-fit:cover';
    img.onerror = function() { this.style.display = 'none'; };
    thumb.innerHTML = '';
    thumb.appendChild(img);
  }
  img.src = input.value;
  img.style.display = input.value ? 'block' : 'none';
};

window.uploadFotoWeb = function(fileInput) {
  const row = fileInput.closest('.foto-row');
  if (!row) return;
  const btn = row.querySelector('.upload-foto-btn');
  const urlInput = row.querySelector('.foto-url-input');
  const thumb = row.querySelector('.foto-thumb');

  if (!fileInput.files.length) return;

  const fd = new FormData();
  fd.append('foto', fileInput.files[0]);

  btn.disabled = true;
  btn.textContent = '⏳';

  // Usar el endpoint de la demo
  fetch('https://dentalsoft.com.ar/demo/panel/landing/upload_foto', {
    method: 'POST',
    body: fd,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.url) {
      urlInput.value = data.url;
      thumb.innerHTML = '<img src="' + data.url + '" style="width:100%;height:100%;object-fit:cover">';
    } else {
      alert('Error al subir: ' + (data.error || 'Error desconocido'));
    }
  })
  .catch(() => alert('Error de conexión al subir la imagen.'))
  .finally(() => {
    btn.disabled = false;
    btn.textContent = '📁 Subir';
    fileInput.value = '';
  });
};

// ============================================================
// FUNCIONES DE CHATBOT
// ============================================================
window.generarTokenWeb = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 40; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById('web-chatbot-token').value = token;
};

// ============================================================
// VER LANDING PÚBLICA
// ============================================================
window.verLandingPublica = function() {
  window.open('https://dentalsoft.com.ar/demo/', '_blank');
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
if (document.getElementById('view-web')) {
  renderWeb();
}
