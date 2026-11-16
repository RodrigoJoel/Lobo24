/* ══════════════════════════════════════════════════════════════
   tienda-cierre.js — Tienda online cerrada
   El local la cierra desde "Pedidos en vivo" (pedidos-live.js), que
   guarda en config/general:

     cierre: { activo: true, hasta: <fecha o null>, nota: "...", desde: <fecha> }

   Mientras está cerrada se ven los productos pero no se puede comprar:
   cartel arriba de la página, botones de agregar apagados, el carrito
   no deja ir a pagar y la página de pago no deja confirmar. Si tiene
   "hasta", se vuelve a abrir sola a esa hora, sin recargar.

   Las páginas ya escuchan config/general para la barra de arriba y
   llaman a TiendaCierre.aplicar(d.cierre): no suma lecturas a la base.
   El servidor también rechaza los pedidos mientras está cerrada
   (tiendaCerrada() en webVentas-backend/server.js).
══════════════════════════════════════════════════════════════ */
(function () {
  function aFecha(valor) {
    if (!valor) return null;
    const fecha = typeof valor.toDate === 'function' ? valor.toDate() : new Date(valor);
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  // Devuelve null si la tienda está abierta, o { hasta, nota } si está cerrada.
  function estado(cierre, ahora) {
    if (!cierre || cierre.activo !== true) return null;
    const hasta = aFecha(cierre.hasta);
    if (hasta && hasta.getTime() <= (ahora || new Date()).getTime()) return null;
    return { hasta, nota: String(cierre.nota || '').trim().slice(0, 200) };
  }

  function inicioDelDia(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
  }

  // "mañana a partir de las 7:00 h", "el lunes a partir de las 7:00 h"
  function cuando(hasta, ahora) {
    ahora = ahora || new Date();
    const hora = hasta.getHours() + ':' + String(hasta.getMinutes()).padStart(2, '0');
    const aLas = (hasta.getHours() === 1 ? 'a partir de la ' : 'a partir de las ') + hora + ' h';
    const dias = Math.round((inicioDelDia(hasta) - inicioDelDia(ahora)) / 86400000);
    if (dias <= 0) return 'hoy ' + aLas;
    if (dias === 1) return 'mañana ' + aLas;
    const diaSemana = hasta.toLocaleDateString('es-AR', { weekday: 'long' });
    const fecha = dias < 7 ? '' : ' ' + hasta.getDate() + '/' + (hasta.getMonth() + 1);
    return 'el ' + diaSemana + fecha + ' ' + aLas;
  }

  function textos(est, ahora) {
    return {
      titulo: 'La tienda online está cerrada.',
      detalle: est.hasta
        ? 'Volvemos a tomar pedidos ' + cuando(est.hasta, ahora) + '.'
        : 'Por ahora no estamos tomando pedidos.',
      nota: est.nota
    };
  }

  function mensaje(est, ahora) {
    const t = textos(est, ahora);
    return [t.titulo, t.detalle, t.nota].filter(Boolean).join(' ');
  }

  function esc(valor) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------- En la tienda ----------

  let ultimo = null;   // el último "cierre" que llegó de config/general
  let timer = null;

  function pintar() {
    clearTimeout(timer);
    const est = estado(ultimo);
    document.documentElement.classList.toggle('tienda-cerrada', !!est);

    let aviso = document.getElementById('avisoCierre');
    let enCarrito = document.getElementById('cierreCarrito');
    if (!est) {
      if (aviso) aviso.remove();
      if (enCarrito) enCarrito.remove();
      return;
    }

    const t = textos(est);
    if (!aviso) {
      aviso = document.createElement('div');
      aviso.id = 'avisoCierre';
      aviso.className = 'aviso-cierre';
      aviso.setAttribute('role', 'status');
      const ancla = document.getElementById('elTopbar') || document.querySelector('.steps-bar');
      if (ancla) ancla.after(aviso);
      else document.body.prepend(aviso);
    }
    aviso.innerHTML = `
      <div class="aviso-cierre-in">
        <i class="fa-solid fa-store-slash" aria-hidden="true"></i>
        <p><strong>${esc(t.titulo)}</strong> ${esc(t.detalle)}${t.nota ? `<span class="aviso-cierre-nota">${esc(t.nota)}</span>` : ''}</p>
      </div>`;

    const pie = document.getElementById('drawerFooter');
    if (pie) {
      if (!enCarrito) {
        enCarrito = document.createElement('p');
        enCarrito.id = 'cierreCarrito';
        enCarrito.className = 'cierre-carrito';
        pie.prepend(enCarrito);
      }
      enCarrito.textContent = t.titulo + ' ' + t.detalle + ' Lo que agregaste queda guardado en el carrito.';
    }

    // Se vuelve a pintar justo cuando abre, y cada minuto para que
    // "hoy" / "mañana" siga siendo cierto si la página queda abierta.
    const falta = est.hasta ? est.hasta.getTime() - Date.now() + 500 : 60000;
    timer = setTimeout(pintar, Math.max(1000, Math.min(falta, 60000)));
  }

  function aplicar(cierre) {
    ultimo = cierre || null;
    pintar();
  }

  // Si la tienda está cerrada, avisa y devuelve true (no seguir con la compra).
  function bloquearCompra() {
    const est = estado(ultimo);
    if (!est) return false;
    // Los avisos (showToast) arman HTML: el texto va escapado.
    if (typeof showToast === 'function') showToast('🔒 ' + esc(mensaje(est)), 'warn');
    return true;
  }

  window.TiendaCierre = { estado, cuando, textos, mensaje, aplicar, bloquearCompra, aFecha };
})();
