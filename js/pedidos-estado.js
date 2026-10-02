/* ══════════════════════════════════════════════════════════════
   pedidos-estado.js — Cambio de estado de un pedido
   Lo usan el panel admin (admin.html) y la pantalla de pedidos en
   vivo (pedidos-live.js). Solo el admin puede hacerlo: las reglas de
   Firestore no dejan que nadie más escriba pedidos, puntos ni stock.

   Además del estado, acá se hace lo que el estado implica:

   - Dar el pedido por pagado ("Pago confirmado") o por entregado
     ("Completado") acredita los puntos que ganó esa compra, si
     todavía no se acreditaron. Un pedido por transferencia o
     efectivo nace "Pendiente de pago" sin esos puntos.
   - Cancelar devuelve el stock al catálogo, le devuelve al cliente
     los puntos que usó y le quita los que había ganado.

   Todo va en una sola transacción, y lo que ya se hizo queda anotado
   en el pedido (stockDescontado, pointsUsedApplied, pointsApplied):
   apretar dos veces el botón, o desde dos dispositivos, no acredita
   ni devuelve nada dos veces.
══════════════════════════════════════════════════════════════ */

import { doc, runTransaction }
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const ESTADOS_PERMITIDOS = ['confirmed', 'processing', 'shipped', 'completed', 'cancelled'];

// Estados que significan "el cliente pagó".
const ESTADOS_PAGADO = ['confirmed', 'completed'];

const COLECCIONES_PRODUCTOS = [
  'bebidas', 'snacks', 'almacen', 'higiene', 'limpieza',
  'congelados', 'lacteos', 'panaderia', 'mascotas',
  'perfumeria', 'bazar'
];

// Qué se hizo ya con el pedido. Los pedidos anteriores a estas marcas no las
// tienen: los de transferencia/efectivo descontaban stock y puntos al
// crearse, y los de Mercado Pago recién cuando se acreditaba el pago.
function estadoDelPedido(pedido) {
  const esMP = pedido.payment === 'mp';
  const stockDescontado = pedido.stockDescontado ?? (!esMP || !!pedido.mpPaymentId);
  const ganadosAcreditados = pedido.pointsApplied ?? !esMP;
  const usadosDescontados = pedido.pointsUsedApplied ?? ganadosAcreditados;
  return { stockDescontado, ganadosAcreditados, usadosDescontados };
}

// Cantidad por producto, sumando si el mismo producto aparece dos veces.
function cantidadesPorProducto(items) {
  const cantidades = new Map();
  (items || []).forEach(item => {
    const qty = Number(item?.qty || 0);
    if (!item?.docId || !COLECCIONES_PRODUCTOS.includes(item.coleccion) || !(qty > 0)) return;
    const clave = item.coleccion + '/' + item.docId;
    const previo = cantidades.get(clave);
    cantidades.set(clave, { coleccion: item.coleccion, docId: item.docId, qty: (previo?.qty || 0) + qty });
  });
  return [...cantidades.values()];
}

/**
 * Cambia el estado del pedido y aplica lo que ese cambio implica.
 * Devuelve { status, sinCambios, puntos, saldo, stock }:
 *   puntos: cuántos puntos se le sumaron (o restaron) al cliente
 *   saldo:  saldo del cliente después del cambio, o null si no se tocó
 *   stock:  'descontado', 'devuelto' o null
 */
export async function cambiarEstadoPedido(db, pedidoId, nuevoEstado) {
  if (!ESTADOS_PERMITIDOS.includes(nuevoEstado)) {
    throw new Error('Estado no válido: ' + nuevoEstado);
  }

  const pedidoRef = doc(db, 'pedidos', pedidoId);

  return runTransaction(db, async (tx) => {
    const pedidoSnap = await tx.get(pedidoRef);
    if (!pedidoSnap.exists()) throw new Error('El pedido ya no existe');

    const pedido = pedidoSnap.data();

    if (pedido.status === nuevoEstado) {
      return { status: nuevoEstado, sinCambios: true, puntos: 0, saldo: null, stock: null };
    }
    if (pedido.status === 'cancelled') {
      throw new Error('El pedido está cancelado: ya se devolvieron el stock y los puntos');
    }
    if (nuevoEstado === 'cancelled' && pedido.status === 'completed') {
      throw new Error('Un pedido entregado no se puede cancelar');
    }

    const hecho = estadoDelPedido(pedido);
    const pointsUsed = Math.max(0, Number(pedido.pointsUsed) || 0);
    const pointsEarned = Math.max(0, Number(pedido.pointsEarned) || 0);

    const cambios = { status: nuevoEstado, updatedAt: new Date() };
    let puntos = 0;         // lo que se le suma (o resta) al saldo del cliente
    let stock = null;       // 'descontar' | 'devolver'

    if (nuevoEstado === 'cancelled') {
      if (hecho.usadosDescontados) puntos += pointsUsed;
      if (hecho.ganadosAcreditados) puntos -= pointsEarned;
      if (hecho.stockDescontado) stock = 'devolver';
      cambios.pointsUsedApplied = false;
      cambios.pointsApplied = false;
      cambios.stockDescontado = false;
    } else if (ESTADOS_PAGADO.includes(nuevoEstado)) {
      if (!hecho.usadosDescontados) puntos -= pointsUsed;
      if (!hecho.ganadosAcreditados) puntos += pointsEarned;
      if (!hecho.stockDescontado) stock = 'descontar';
      cambios.pointsUsedApplied = true;
      cambios.pointsApplied = true;
      cambios.stockDescontado = true;
    }

    // Firestore exige leer todo antes de escribir.
    let userRef = null;
    let userSnap = null;
    if (pedido.userId && puntos !== 0) {
      userRef = doc(db, 'users', pedido.userId);
      userSnap = await tx.get(userRef);
    }

    const productos = [];
    if (stock) {
      for (const item of cantidadesPorProducto(pedido.items)) {
        const ref = doc(db, item.coleccion, item.docId);
        productos.push({ ref, qty: item.qty, snap: await tx.get(ref) });
      }
    }

    let saldo = null;
    if (userSnap && userSnap.exists()) {
      saldo = Math.max(0, Number(userSnap.data().points || 0) + puntos);
      tx.update(userRef, { points: saldo });
    } else {
      puntos = 0; // compra como invitado, o la cuenta ya no existe
    }

    productos.forEach(({ ref, qty, snap }) => {
      if (!snap.exists()) return;
      const actual = snap.data().stock;
      if (actual === undefined || actual === null) return; // producto sin control de stock
      const nuevo = stock === 'devolver'
        ? Number(actual) + qty
        : Math.max(0, Number(actual) - qty);
      tx.update(ref, { stock: nuevo });
    });

    tx.update(pedidoRef, cambios);

    return {
      status: nuevoEstado,
      sinCambios: false,
      puntos,
      saldo,
      stock: stock === 'devolver' ? 'devuelto' : stock === 'descontar' ? 'descontado' : null
    };
  });
}
