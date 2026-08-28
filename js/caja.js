// ============================================================
// EXPORTAR CIERRE A PDF (ventana de impresión)
// ============================================================
window.exportarPdfCierre = function(cierreId, numeroCierre) {
  // Mostrar indicador de carga
  const loading = document.createElement('div');
  loading.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;color:#fff;font-size:18px;';
  loading.innerHTML = 'Generando PDF...';
  document.body.appendChild(loading);

  // Obtener datos del cierre y sus pagos
  Promise.all([
    db.collection('cierres').doc(cierreId).get(),
    db.collection('pagos').where('cierre_id', '==', cierreId).get()
  ])
  .then(([cierreDoc, pagosSnap]) => {
    document.body.removeChild(loading);

    if (!cierreDoc.exists) {
      alert('Cierre no encontrado');
      return;
    }

    const cierre = { id: cierreDoc.id, ...cierreDoc.data() };
    const pagos = [];
    pagosSnap.forEach(doc => pagos.push({ id: doc.id, ...doc.data() }));

    // --- Calcular totales ---
    const totalEfectivo = pagos.filter(p => p.metodo === 'efectivo').reduce((sum, p) => sum + (p.monto || 0), 0);
    const totalOtros = pagos.filter(p => p.metodo !== 'efectivo').reduce((sum, p) => sum + (p.monto || 0), 0);
    const totalGeneral = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);

    // --- Fechas ---
    const fechaCierre = cierre.fecha_cierre ? formatDateCaja(cierre.fecha_cierre) + ' ' + new Date(cierre.fecha_cierre).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '—';
    const fechaInicio = cierre.periodo_inicio ? formatDateCaja(cierre.periodo_inicio) + ' ' + new Date(cierre.periodo_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '—';
    const fechaFin = cierre.periodo_fin ? formatDateCaja(cierre.periodo_fin) + ' ' + new Date(cierre.periodo_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '—';

    // --- Diferencia ---
    const efectivoEsperado = cierre.efectivo_esperado || 0;
    const efectivoIngresado = cierre.efectivo_ingresado || 0;
    const diff = efectivoIngresado - efectivoEsperado;
    const diffSign = diff >= 0 ? '+' : '';
    const diffClass = Math.abs(diff) < 0.01 ? 'diff-zero' : (diff > 0 ? 'diff-positive' : 'diff-negative');
    const diffText = Math.abs(diff) < 0.01 ? 'Caja exacta' : (diff > 0 ? 'Sobrante' : 'Faltante');

    // --- Otros métodos (agrupados) ---
    const otrosMetodos = {};
    pagos.forEach(p => {
      if (p.metodo !== 'efectivo') {
        const key = p.metodo || 'otro';
        if (!otrosMetodos[key]) otrosMetodos[key] = 0;
        otrosMetodos[key] += p.monto || 0;
      }
    });

    const nombresMetodo = {
      'efectivo': 'Efectivo',
      'tarjeta_credito': 'Tarjeta crédito',
      'tarjeta_debito': 'Tarjeta débito',
      'transferencia': 'Transferencia',
      'mercadopago': 'MercadoPago',
      'obra_social': 'Obra social',
      'otro': 'Otro'
    };

    const coloresMetodo = {
      'efectivo': '#22c55e',
      'tarjeta_credito': '#3b82f6',
      'tarjeta_debito': '#8b5cf6',
      'transferencia': '#f59e0b',
      'mercadopago': '#0070f3',
      'obra_social': '#ec4899',
      'otro': '#94a3b8'
    };

    // --- Construir HTML del PDF ---
    const now = new Date();
    const fechaGeneracion = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
                           now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    // Filas de la tabla de pagos
    let payRows = '';
    if (pagos.length === 0) {
      payRows = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No hay registros asociados a este cierre.</td></tr>`;
    } else {
      pagos.forEach(p => {
        const esEgreso = p.tipo === 'egreso';
        const signo = esEgreso ? '−' : '';
        const rowClass = esEgreso ? 'neg-row' : '';
        payRows += `
          <tr class="${rowClass}">
            <td>${formatDateCaja(p.fecha)}</td>
            <td>${p.paciente || '—'}</td>
            <td><span class="dot" style="background:${coloresMetodo[p.metodo] || '#94a3b8'};"></span> ${nombresMetodo[p.metodo] || p.metodo || 'Otro'}</td>
            <td>${p.comprobante || ''}</td>
            <td class="td-right">${signo}$${Number(p.monto).toLocaleString()}</td>
            <td><span class="badge ${p.estado === 'anulado' ? 'badge-gray' : 'badge-green'}">${p.estado === 'anulado' ? 'Anulado' : 'Completado'}</span></td>
          </tr>
        `;
      });
    }

    // Filas de otros métodos
    let metodosRows = '';
    if (Object.keys(otrosMetodos).length === 0) {
      metodosRows = `<tr><td colspan="2" style="text-align:center;color:#94a3b8;padding:12px;">Sin movimientos de otros métodos en este período.</td></tr>`;
    } else {
      Object.entries(otrosMetodos).forEach(([metodo, monto]) => {
        metodosRows += `
          <tr>
            <td><span class="dot" style="background:${coloresMetodo[metodo] || '#94a3b8'};"></span> ${nombresMetodo[metodo] || metodo}</td>
            <td class="td-amt">$${Number(monto).toLocaleString()}</td>
          </tr>
        `;
      });
      metodosRows += `
        <tr>
          <td><strong>Total otros</strong></td>
          <td class="td-amt"><strong>$${Number(totalOtros).toLocaleString()}</strong></td>
        </tr>
      `;
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cierre de Caja #${numeroCierre} — Clínica Dental Demo</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 13px; color: #1e293b; background: #f1f5f9; }
.page { background: #fff; max-width: 860px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,.12); }

/* Header */
.doc-header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; }
.doc-header .clinic { font-size: 12px; opacity: .65; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 4px; }
.doc-header h1 { font-size: 22px; font-weight: 800; margin-bottom: 3px; }
.doc-header .meta { font-size: 12px; opacity: .6; }
.doc-header .badge-cierre { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); border-radius: 8px; padding: 8px 16px; text-align: right; }
.doc-header .badge-cierre .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .7px; opacity: .65; margin-bottom: 4px; }
.doc-header .badge-cierre .val { font-size: 24px; font-weight: 800; }

/* Summary band */
.summary-band { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border-bottom: 1px solid #e2e8f0; }
.summary-cell { padding: 18px 24px; border-right: 1px solid #e2e8f0; }
.summary-cell:last-child { border-right: none; }
.summary-cell .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: #64748b; font-weight: 700; margin-bottom: 5px; }
.summary-cell .val { font-size: 20px; font-weight: 800; color: #1e293b; }
.summary-cell .sub { font-size: 11px; color: #94a3b8; margin-top: 3px; }
.diff-positive { color: #92400e; background: #fffbeb; }
.diff-negative { color: #dc2626; background: #fef2f2; }
.diff-zero     { color: #166534; background: #f0fdf4; }

/* Period bar */
.period-bar { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 24px; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 8px; }
.period-bar strong { color: #334155; }

/* Section */
.section { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
.section-title { font-size: 10px; text-transform: uppercase; letter-spacing: .7px; font-weight: 700; color: #94a3b8; margin-bottom: 12px; }

/* Efectivo grid */
.efe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.efe-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
.efe-item .lbl { font-size: 11px; color: #64748b; margin-bottom: 4px; }
.efe-item .val { font-size: 18px; font-weight: 800; color: #1e293b; }
.efe-diff { border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.efe-diff .lbl { font-size: 12px; font-weight: 700; }
.efe-diff .val { font-size: 22px; font-weight: 800; }

/* Otros metodos */
.metodos-table { width: 100%; border-collapse: collapse; }
.metodos-table th { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #94a3b8; font-weight: 700; padding: 6px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }
.metodos-table td { padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f8fafc; }
.metodos-table .td-amt { text-align: right; font-weight: 700; }
.metodos-table .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
.metodos-table tfoot td { font-weight: 700; border-top: 2px solid #e2e8f0; padding-top: 10px; }

/* Payments table */
.pay-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.pay-table th { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #94a3b8; font-weight: 700; padding: 7px 10px; background: #f8fafc; text-align: left; border-bottom: 2px solid #e2e8f0; }
.pay-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.pay-table tr:last-child td { border-bottom: none; }
.pay-table tr.neg-row { background: #fff8f8; }
.pay-table tfoot td { font-weight: 700; background: #f8fafc; border-top: 2px solid #e2e8f0; padding: 10px; }
.td-right { text-align: right; }
.badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-gray  { background: #f1f5f9; color: #64748b; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }

/* Observations */
.obs-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
.obs-box .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: #92400e; font-weight: 700; margin-bottom: 4px; }
.obs-box .val { font-size: 13px; color: #78350f; white-space: pre-line; }

/* Footer */
.doc-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.doc-footer .left { font-size: 11px; color: #94a3b8; }
.doc-footer .right { font-size: 11px; color: #94a3b8; }

/* Print button */
.print-btn { display: block; text-align: center; padding: 12px; background: #1e3a5f; }
.print-btn button { background: #fff; color: #1e3a5f; border: none; padding: 9px 24px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; }
.print-btn button:hover { background: #e2e8f0; }

@media print {
    body { background: #fff; }
    .page { box-shadow: none; }
    .print-btn { display: none; }
    @page { margin: 1cm; size: A4; }
}
</style>
</head>
<body>

<div class="print-btn">
    <button onclick="window.print()">🖨 Imprimir / Guardar como PDF</button>
</div>

<div class="page">

    <!-- Header -->
    <div class="doc-header">
        <div>
            <div class="clinic">Clínica Dental Demo</div>
            <h1>Cierre de Caja #${numeroCierre}</h1>
            <div class="meta">
                Emitido el ${fechaCierre} · Cerrado por ${cierre.cerrado_por || 'Admin'}
            </div>
        </div>
        <div class="badge-cierre">
            <div class="lbl">Total del período</div>
            <div class="val">$${Number(totalGeneral).toLocaleString()}</div>
        </div>
    </div>

    <!-- Period bar -->
    <div class="period-bar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Período cubierto:
        <strong>${fechaInicio || '—'}</strong>
        →
        <strong>${fechaFin || '—'}</strong>
    </div>

    <!-- Summary band -->
    <div class="summary-band">
        <div class="summary-cell">
            <div class="lbl">Efectivo esperado</div>
            <div class="val">$${Number(efectivoEsperado).toLocaleString()}</div>
            <div class="sub">Cobrado en efectivo</div>
        </div>
        <div class="summary-cell">
            <div class="lbl">Efectivo contado</div>
            <div class="val">$${Number(efectivoIngresado).toLocaleString()}</div>
            <div class="sub">Ingresado físicamente</div>
        </div>
        <div class="summary-cell ${diffClass}">
            <div class="lbl">Diferencia</div>
            <div class="val">${diffSign}$${Number(diff).toLocaleString()}</div>
            <div class="sub">${diffText}</div>
        </div>
    </div>

    <!-- Detalle de efectivo y otros métodos -->
    <div class="section">
        <div class="section-title">Desglose por método de pago</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Efectivo</div>
                <div class="efe-item">
                    <div class="lbl">Esperado en caja</div>
                    <div class="val">$${Number(efectivoEsperado).toLocaleString()}</div>
                </div>
                <div class="efe-item" style="margin-top:6px;">
                    <div class="lbl">Contado físicamente</div>
                    <div class="val">$${Number(efectivoIngresado).toLocaleString()}</div>
                </div>
                <div class="efe-diff ${diffClass}" style="margin-top:8px;">
                    <span class="lbl">Diferencia</span>
                    <span class="val">${diffSign}$${Number(diff).toLocaleString()}</span>
                </div>
            </div>
            <div>
                <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Otros métodos</div>
                <table class="metodos-table">
                    <thead><tr><th>Método</th><th style="text-align:right">Monto</th></tr></thead>
                    <tbody>${metodosRows}</tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Observaciones -->
    ${cierre.observaciones ? `
    <div class="section">
        <div class="section-title">Observaciones</div>
        <div class="obs-box">
            <div class="lbl">Notas del cierre</div>
            <div class="val">${cierre.observaciones}</div>
        </div>
    </div>
    ` : ''}

    <!-- Detalle de pagos -->
    <div class="section">
        <div class="section-title">Detalle de pagos incluidos (${pagos.length})</div>
        <table class="pay-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Paciente</th>
                    <th>Método</th>
                    <th>Comprobante</th>
                    <th style="text-align:right">Monto</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>${payRows}</tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align:right;"><strong>Total general</strong></td>
                    <td class="td-right"><strong>$${Number(totalGeneral).toLocaleString()}</strong></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>

    <!-- Footer -->
    <div class="doc-footer">
        <div class="left">Clínica Dental Demo · DentalSoft</div>
        <div class="right">Generado el ${fechaGeneracion}</div>
    </div>

</div>

</body>
</html>
    `;

    // Abrir nueva ventana con el HTML
    const win = window.open('', '_blank', 'width=900,height=800');
    if (!win) {
      alert('Por favor, permite ventanas emergentes para generar el PDF.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    // Esperar a que cargue el contenido antes de mostrar el botón de impresión
    setTimeout(() => {
      // El usuario puede hacer clic en el botón de impresión dentro de la ventana
    }, 500);

  })
  .catch(err => {
    document.body.removeChild(loading);
    alert('❌ Error al generar el PDF: ' + err.message);
  });
};
