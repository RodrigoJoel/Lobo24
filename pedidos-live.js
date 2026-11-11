import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { cambiarEstadoPedido, estadoDelPedido } from "./js/pedidos-estado.js?v=2";

const firebaseConfig = {
  apiKey: "AIzaSyBiN4r47hmNycD7aZjkZa6XakZSzXwbL8Q",
  authDomain: "lobo24-9e46b.firebaseapp.com",
  projectId: "lobo24-9e46b",
  storageBucket: "lobo24-9e46b.firebasestorage.app",
  messagingSenderId: "922799111894",
  appId: "1:922799111894:web:bfd10fffc39a63fcd7d377"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mismo criterio que admin-login.js / firestore.rules: sin esto,
// las reglas de Firestore rechazan la lectura de "pedidos" porque
// esta pantalla nunca se autenticaba de verdad.
const ADMIN_EMAILS = ["rodrigoatatat@gmail.com"];

const pedidosContainer = document.getElementById("pedidosContainer");
const emptyState = document.getElementById("emptyState");
const pedidoCount = document.getElementById("pedidoCount");
const soundGate = document.getElementById("soundGate");
const enableAlertsBtn = document.getElementById("enableAlertsBtn");
const alertModal = document.getElementById("alertModal");
const alertBody = document.getElementById("alertBody");
const alertExtra = document.getElementById("alertExtra");
const acceptOrderBtn = document.getElementById("acceptOrderBtn");

const histOpenBtn = document.getElementById("histOpenBtn");
const histPanel = document.getElementById("histPanel");
const histBackdrop = document.getElementById("histBackdrop");
const histTitle = document.getElementById("histTitle");
const histBackBtn = document.getElementById("histBackBtn");
const histCloseBtn = document.getElementById("histCloseBtn");
const histList = document.getElementById("histList");
const histDetail = document.getElementById("histDetail");

const cancelModal = document.getElementById("cancelModal");
const cancelTitle = document.getElementById("cancelTitle");
const cancelText = document.getElementById("cancelText");
const cancelError = document.getElementById("cancelError");
const cancelYesBtn = document.getElementById("cancelYesBtn");
const cancelNoBtn = document.getElementById("cancelNoBtn");

const printArea = document.getElementById("printArea");

const knownOrders = new Map();
let firstLoad = true;

// Todos los pedidos (abiertos, entregados y cancelados), del más nuevo al
// más viejo. La pantalla ya los traía todos para quedarse con los abiertos:
// el historial usa los mismos, sin leer nada más de la base.
let todosLosPedidos = [];
let pedidosCargados = false;

const STATUS_LABELS = {
  pending: "Pendiente de pago",
  pending_payment: "Mercado Pago sin pagar",
  payment_confirmed: "Pago acreditado",
  confirmed: "Pago confirmado",
  processing: "En preparación",
  shipped: "Despachado",
  completed: "Entregado",
  cancelled: "Cancelado"
};

const STATUS_CLASS = {
  pending: "pendiente",
  pending_payment: "pendiente",
  payment_confirmed: "preparacion",
  confirmed: "preparacion",
  processing: "preparacion",
  shipped: "preparacion",
  completed: "entregado",
  cancelled: "pendiente"
};

// Colores de la etiqueta de estado en el historial.
const CHIP_CLASS = {
  pending: "pendiente",
  pending_payment: "sinpagar",
  payment_confirmed: "preparacion",
  confirmed: "preparacion",
  processing: "preparacion",
  shipped: "preparacion",
  completed: "entregado",
  cancelled: "cancelado"
};

const MOTIVOS_CANCELACION = {
  pago_rechazado: "Mercado Pago rechazó el pago.",
  pago_no_realizado: "El cliente no terminó de pagar con Mercado Pago a tiempo."
};

onAuthStateChanged(auth, (user) => {
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    window.location.href = "admin-login.html?redirect=pedidos-live.html";
    return;
  }
  initNotifications();
  listenOrders();
});

function listenOrders() {
  const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    const pedidos = [];

    snapshot.forEach((docSnap) => {
      pedidos.push({
        firebaseId: docSnap.id,
        ...docSnap.data()
      });
    });

    todosLosPedidos = pedidos;
    pedidosCargados = true;

    const activeOrders = pedidos.filter(p =>
      p.status !== "completed" && p.status !== "cancelled"
    );

    detectNewOrders(activeOrders);
    renderOrders(activeOrders);
    refrescarHistorial();
  });
}

function detectNewOrders(pedidos) {
  pedidos.forEach((pedido) => {
    const id = pedido.firebaseId;
    const prevStatus = knownOrders.get(id);
    knownOrders.set(id, pedido.status);

    // Los pedidos de Mercado Pago nacen como "pending_payment" (el cliente
    // todavía no pagó): suenan recién cuando se confirma el pago.
    const esNuevo = prevStatus === undefined || prevStatus === "pending_payment";
    if (!firstLoad && esNuevo && pedido.status !== "pending_payment") {
      queueAlert(pedido);
    }
  });

  // Si el pedido ya se atendió desde otro dispositivo, dejar de avisar por él.
  const atendidos = new Set(
    pedidos.filter(p => p.status === "processing").map(p => p.firebaseId)
  );
  const vigentes = new Set(pedidos.map(p => p.firebaseId));
  const antes = alertQueue.length;
  alertQueue = alertQueue.filter(p => vigentes.has(p.firebaseId) && !atendidos.has(p.firebaseId));
  if (alertQueue.length !== antes) refreshAlert();

  firstLoad = false;
}

// ---------- Alerta fuerte hasta aceptar el pedido ----------

let alertQueue = [];
let audioCtx = null;
let sirenTimer = null;
let titleTimer = null;
let wakeLock = null;
const originalTitle = document.title;

function queueAlert(pedido) {
  alertQueue.push(pedido);
  refreshAlert();

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🚨 NUEVO PEDIDO en Lobo24", {
      body: `Pedido #${pedido.orderId || pedido.firebaseId} - Total $${Number(pedido.total || 0).toLocaleString("es-AR")}`,
      icon: "imagenes/iconoLobo24.png",
      requireInteraction: true,
      tag: "lobo24-pedido-" + pedido.firebaseId
    });
  }
}

function refreshAlert() {
  if (!alertQueue.length) {
    stopAlert();
    return;
  }

  const p = alertQueue[0];
  const esRetiro = p.delivery === "local";
  alertBody.innerHTML = `
    <div>Pedido <strong>#${escapeHtml(p.orderId || p.firebaseId)}</strong></div>
    <div class="alert-total">$${Number(p.total || 0).toLocaleString("es-AR")}</div>
    <div>${escapeHtml(p.contact?.name || "Cliente")}</div>
    <div>${esRetiro ? "🏪 Retiro en sucursal" : "🛵 Envío a domicilio"} · ${escapeHtml(getPaymentLabel(p.payment))}</div>
  `;
  alertExtra.textContent = alertQueue.length > 1 ? `Hay ${alertQueue.length} pedidos sin aceptar` : "";
  alertModal.classList.add("show");
  startSiren();
  startTitleFlash();
}

function acceptCurrentAlert() {
  alertQueue.shift();
  refreshAlert();
}

function stopAlert() {
  alertModal.classList.remove("show");
  clearInterval(sirenTimer);
  sirenTimer = null;
  clearInterval(titleTimer);
  titleTimer = null;
  document.title = originalTitle;
  if (navigator.vibrate) navigator.vibrate(0);
}

// Sirena sintetizada (no depende de ningún archivo externo): dos tonos
// alternados a volumen máximo, repetida hasta que se acepte el pedido.
function beepSiren() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;

  const master = audioCtx.createGain();
  master.gain.value = 1;
  const comp = audioCtx.createDynamicsCompressor();
  master.connect(comp).connect(audioCtx.destination);

  [880, 1320, 880, 1320].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const start = t0 + i * 0.25;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(1, start + 0.02);
    g.gain.setValueAtTime(1, start + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    osc.connect(g).connect(master);
    osc.start(start);
    osc.stop(start + 0.25);
  });

  if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
}

function startSiren() {
  if (sirenTimer) return;
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  beepSiren();
  sirenTimer = setInterval(beepSiren, 1300);
}

function startTitleFlash() {
  if (titleTimer) return;
  let on = false;
  titleTimer = setInterval(() => {
    on = !on;
    document.title = on ? "🚨 ¡NUEVO PEDIDO! 🚨" : originalTitle;
  }, 600);
}

async function keepScreenAwake() {
  try {
    if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) {
    console.warn("No se pudo mantener la pantalla encendida:", e);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && wakeLock) keepScreenAwake();
});

// El navegador no deja reproducir sonido hasta un toque del usuario.
function enableAlerts() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (Ctx && !audioCtx) audioCtx = new Ctx();
  if (audioCtx) audioCtx.resume();
  soundGate.classList.remove("show");
  keepScreenAwake();
  beepSiren(); // prueba: confirma que el sonido funciona
}

function initNotifications() {
  soundGate.classList.add("show");

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

enableAlertsBtn.addEventListener("click", enableAlerts);
acceptOrderBtn.addEventListener("click", acceptCurrentAlert);

// ---------- Fechas y montos ----------

function aFecha(valor) {
  if (!valor) return null;
  const date = typeof valor.toDate === "function" ? valor.toDate() : new Date(valor);
  return isNaN(date.getTime()) ? null : date;
}

function formatFecha(createdAt) {
  const date = aFecha(createdAt);
  if (!date) return "—";
  return date.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function hora(date) {
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// "el martes 11 de noviembre a las 14:32 h"
function fechaLarga(date) {
  const opciones = { weekday: "long", day: "numeric", month: "long" };
  if (date.getFullYear() !== new Date().getFullYear()) opciones.year = "numeric";
  return `el ${date.toLocaleDateString("es-AR", opciones)} a las ${hora(date)} h`;
}

function plata(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-AR");
}

// ---------- Tiempo de espera de los pedidos abiertos ----------
// Cuenta desde que entró el pedido. Se pone naranja a los 15 minutos y
// rojo a los 30. Los de Mercado Pago que todavía no se pagaron no cambian
// de color: ahí no hay nada que preparar.

const ESPERA_AVISO_MIN = 15;
const ESPERA_DEMORA_MIN = 30;

function textoEspera(minutos) {
  if (minutos < 1) return "Entró recién";
  if (minutos < 60) return `Entró hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    const resto = minutos % 60;
    return `Entró hace ${horas} h${resto ? ` ${resto} min` : ""}`;
  }
  const dias = Math.floor(horas / 24);
  return `Entró hace ${dias} día${dias !== 1 ? "s" : ""}`;
}

function claseEspera(minutos, status) {
  if (status === "pending_payment") return "";
  if (minutos >= ESPERA_DEMORA_MIN) return "demora";
  if (minutos >= ESPERA_AVISO_MIN) return "aviso";
  return "";
}

function esperaHtml(pedido) {
  const desde = aFecha(pedido.createdAt);
  if (!desde) return "";
  return `<div class="espera" data-desde="${desde.getTime()}" data-status="${escapeHtml(pedido.status || "")}"></div>`;
}

function actualizarEsperas() {
  const ahora = Date.now();
  document.querySelectorAll(".espera[data-desde]").forEach((el) => {
    const minutos = Math.max(0, Math.floor((ahora - Number(el.dataset.desde)) / 60000));
    el.className = ("espera " + claseEspera(minutos, el.dataset.status)).trim();
    el.innerHTML = `<i class="fas fa-clock" aria-hidden="true"></i> ${textoEspera(minutos)}`;
  });
}

setInterval(actualizarEsperas, 30 * 1000);

// ---------- Cobro y puntos ----------

// Aviso de cobro: si el pedido está pago o qué falta para que lo esté.
// pointsApplied pasa a true cuando el pedido se da por pagado
// (js/pedidos-estado.js); los pedidos viejos no tienen esa marca.
function notaCobro(pedido) {
  const mpValidado = pedido.status === "payment_confirmed" || !!pedido.mpPaymentId;
  const dadoPorPagado = pedido.pointsApplied === true;
  let nota = "";
  if (pedido.payment === "mp") {
    nota = `
      <div class="mp-note ${mpValidado || dadoPorPagado ? "mp-ok" : "mp-wait"}">
        ${mpValidado
          ? "✅ Pago acreditado por Mercado Pago"
          : dadoPorPagado
            ? "✅ Dado por pagado a mano (Mercado Pago no avisó)"
            : "⏳ Esperar validación: confirmar que el dinero ingresó a la cuenta antes de entregar/preparar"}
      </div>`;
  } else if (pedido.pointsApplied === false) {
    nota = `
      <div class="mp-note mp-wait">
        ${pedido.payment === "transfer"
          ? "⏳ Transferencia sin confirmar: esperar el comprobante antes de entregar"
          : "💵 Cobrar en efectivo al entregar"}
      </div>`;
  } else if (dadoPorPagado) {
    nota = `<div class="mp-note mp-ok">✅ Pago confirmado</div>`;
  }

  // El cliente pagó con un descuento en puntos que ya había gastado en otro pedido.
  const puntosFaltantes = Number(pedido.pointsFaltantes) || 0;
  if (puntosFaltantes > 0) {
    nota += `
      <div class="mp-note mp-wait">
        ⚠️ Usó puntos que ya había gastado en otro pedido: faltan cobrar ${plata(puntosFaltantes)}
      </div>`;
  }
  return nota;
}

function estaPagado(pedido) {
  return pedido.pointsApplied === true
    || !!pedido.mpPaymentId
    || pedido.status === "payment_confirmed"
    || pedido.status === "confirmed"
    || pedido.status === "completed";
}

function puntosHtml(pedido) {
  const usados = Math.max(0, Number(pedido.pointsUsed) || 0);
  const ganados = Math.max(0, Number(pedido.pointsEarned) || 0);
  const cancelado = pedido.status === "cancelled";

  let usadosTxt = "No usó puntos";
  if (usados > 0) {
    usadosTxt = `Usó ${usados.toLocaleString("es-AR")} puntos: ${plata(usados)} de descuento`;
    if (cancelado && pedido.pointsUsedApplied === false) usadosTxt += " (se le devolvieron al cancelar)";
  }

  let ganadosTxt = "";
  if (!pedido.userId) {
    ganadosTxt = "Compró sin cuenta: no suma puntos";
  } else if (ganados > 0) {
    if (cancelado) ganadosTxt = `Iba a sumar ${ganados.toLocaleString("es-AR")} puntos (anulados por la cancelación)`;
    else if (pedido.pointsApplied === false) {
      ganadosTxt = `Suma ${ganados.toLocaleString("es-AR")} puntos cuando ${estaPagado(pedido) ? "lo marques como entregado" : "se confirme el pago o lo marques como entregado"}`;
    }
    else ganadosTxt = `Sumó ${ganados.toLocaleString("es-AR")} puntos`;
  }

  const faltantes = Number(pedido.pointsFaltantes) || 0;
  return `
    <p class="det-dato ${usados > 0 ? "fuerte" : ""}">${escapeHtml(usadosTxt)}</p>
    ${ganadosTxt ? `<p class="det-dato apagado">${escapeHtml(ganadosTxt)}</p>` : ""}
    ${faltantes > 0 && !cancelado ? `<div class="mp-note mp-wait">⚠️ Esos puntos ya los había gastado en otro pedido: faltan cobrar ${plata(faltantes)}</div>` : ""}
  `;
}

// ---------- Pedidos abiertos ----------

function renderOrders(pedidos) {
  pedidoCount.textContent = `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""}`;

  if (!pedidos.length) {
    pedidosContainer.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  pedidosContainer.innerHTML = pedidos.map(pedido => {
    const status = pedido.status || "confirmed";
    const statusLabel = STATUS_LABELS[status] || status;
    const statusClass = STATUS_CLASS[status] || "pendiente";

    const total = Number(pedido.total || 0);
    const subtotal = Number(pedido.subtotal || 0);
    const deliveryCost = Number(pedido.deliveryCost || 0);

    const cliente = pedido.contact?.name || "Cliente sin nombre";
    const telefono = pedido.contact?.phone || "";
    const email = pedido.contact?.email || "";
    const direccion = pedido.delivery === "local"
      ? "Retiro en sucursal"
      : `${pedido.contact?.street || ""}, ${pedido.contact?.city || ""}, ${pedido.contact?.province || ""}`;

    const pago = getPaymentLabel(pedido.payment);
    const esRetiro = pedido.delivery === "local";
    const entrega = esRetiro ? "Retiro en sucursal" : "Envío a domicilio";
    const fecha = formatFecha(pedido.createdAt);
    const id = escapeHtml(pedido.firebaseId);

    return `
      <div class="pedido-card">
        <div class="status ${statusClass}">${escapeHtml(statusLabel)}</div>

        <h2>#${escapeHtml(pedido.orderId || pedido.firebaseId)}</h2>
        <div class="info fecha"><strong>Fecha:</strong> ${escapeHtml(fecha)}</div>
        ${esperaHtml(pedido)}

        ${esRetiro ? `<div class="pickup-badge">🏪 RETIRO EN SUCURSAL</div>` : ""}

        <div class="info"><strong>Cliente:</strong> ${escapeHtml(cliente)}</div>
        ${telefono ? `<div class="info"><strong>Tel:</strong> ${escapeHtml(telefono)}</div>` : ""}
        ${email ? `<div class="info"><strong>Email:</strong> ${escapeHtml(email)}</div>` : ""}

        <div class="info"><strong>Entrega:</strong> ${escapeHtml(entrega)}</div>
        <div class="info"><strong>Dirección:</strong> ${escapeHtml(direccion)}</div>
        <div class="info"><strong>Pago:</strong> ${escapeHtml(pago)}</div>
        ${notaCobro(pedido)}

        <div class="total">$${total.toLocaleString("es-AR")}</div>

        <div class="info">
          Subtotal: $${subtotal.toLocaleString("es-AR")}<br>
          Envío: ${deliveryCost === 0 ? "Gratis" : "$" + deliveryCost.toLocaleString("es-AR")}
        </div>

        <div class="items">
          <strong>Productos:</strong>
          ${(pedido.items || []).map(item => `
            <div class="item">
              ${escapeHtml(item.name || "Producto")} x${escapeHtml(item.qty || 1)}
              — $${Number(item.subtotal || ((item.price || 0) * (item.qty || 1))).toLocaleString("es-AR")}
            </div>
          `).join("")}
        </div>

        ${pedido.contact?.notes ? `
          <div class="info" style="margin-top:12px">
            <strong>Notas:</strong> ${escapeHtml(pedido.contact.notes)}
          </div>
        ` : ""}

        <div class="actions">
          <button class="btn-prep" onclick="updateOrderStatus('${pedido.firebaseId}', 'processing')">
            En preparación
          </button>
          <button class="btn-entregado" onclick="updateOrderStatus('${pedido.firebaseId}', 'completed')">
            Entregado
          </button>
        </div>
        <div class="actions actions-sec">
          <button type="button" class="btn-sec" data-accion="imprimir" data-id="${id}">
            <i class="fas fa-print" aria-hidden="true"></i> Imprimir
          </button>
          <button type="button" class="btn-peligro" data-accion="cancelar" data-id="${id}">
            <i class="fas fa-ban" aria-hidden="true"></i> Cancelar
          </button>
        </div>
      </div>
    `;
  }).join("");

  actualizarEsperas();
}

// El cambio de estado va por js/pedidos-estado.js: al marcar un pedido como
// entregado se acreditan los puntos de esa compra, si faltaba acreditarlos.
async function updateOrderStatus(orderFirebaseId, status) {
  try {
    await cambiarEstadoPedido(db, orderFirebaseId, status);
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    alert("No se pudo actualizar el pedido. " + (error?.message || ""));
  }
}

function getPaymentLabel(payment) {
  if (payment === "mp") return "Mercado Pago";
  if (payment === "transfer") return "Transferencia bancaria";
  if (payment === "efectivo") return "Efectivo en local";
  return payment || "Sin especificar";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buscarPedido(id) {
  return todosLosPedidos.find(p => p.firebaseId === id) || null;
}

// ---------- Historial: panel lateral con todos los pedidos ----------

const HIST_PAGINA = 60;
let histMostrando = HIST_PAGINA;
let panelAbierto = false;
let vista = "lista";
let detalleId = null;
let scrollLista = 0;

function claveDia(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function etiquetaDia(date) {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (claveDia(date) === claveDia(hoy)) return "Hoy";
  if (claveDia(date) === claveDia(ayer)) return "Ayer";
  const opciones = { weekday: "long", day: "numeric", month: "long" };
  if (date.getFullYear() !== hoy.getFullYear()) opciones.year = "numeric";
  const texto = date.toLocaleDateString("es-AR", opciones);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function chipHtml(status) {
  return `<span class="chip ${CHIP_CLASS[status] || "pendiente"}">${escapeHtml(STATUS_LABELS[status] || status || "Sin estado")}</span>`;
}

function filaHistorial(pedido, date) {
  const status = pedido.status || "confirmed";
  const usoPuntos = Number(pedido.pointsUsed) > 0;
  const pagoCorto = { mp: "Mercado Pago", transfer: "Transferencia", efectivo: "Efectivo" }[pedido.payment];
  const meta = [
    "#" + (pedido.orderId || pedido.firebaseId),
    pagoCorto || getPaymentLabel(pedido.payment),
    pedido.delivery === "local" ? "Retiro" : "Envío"
  ].join(" · ");
  return `
    <li>
      <button type="button" class="hist-fila" data-accion="detalle" data-id="${escapeHtml(pedido.firebaseId)}">
        <span class="hist-hora">${date ? hora(date) : "—"}</span>
        <span class="hist-cliente">${escapeHtml(pedido.contact?.name || "Cliente sin nombre")}</span>
        <span class="hist-total">${plata(pedido.total)}</span>
        <span class="hist-estado">${chipHtml(status)}</span>
        <span class="hist-meta">${escapeHtml(meta)}${usoPuntos ? ` · <i class="fas fa-star" aria-label="Usó puntos"></i>` : ""}</span>
      </button>
    </li>`;
}

function renderHistorialLista() {
  if (!pedidosCargados) {
    histList.innerHTML = `<p class="hist-vacio">Cargando pedidos…</p>`;
    return;
  }
  const total = todosLosPedidos.length;
  if (!total) {
    histList.innerHTML = `<p class="hist-vacio">Todavía no hay pedidos.</p>`;
    return;
  }

  let html = `<p class="hist-resumen">${total} pedido${total !== 1 ? "s" : ""} · los más nuevos primero</p>`;
  let diaActual = null;
  todosLosPedidos.slice(0, histMostrando).forEach((pedido) => {
    const date = aFecha(pedido.createdAt);
    const clave = date ? claveDia(date) : "sin-fecha";
    if (clave !== diaActual) {
      if (diaActual !== null) html += `</ul></section>`;
      diaActual = clave;
      html += `<section class="hist-dia"><h3>${escapeHtml(date ? etiquetaDia(date) : "Sin fecha")}</h3><ul>`;
    }
    html += filaHistorial(pedido, date);
  });
  html += `</ul></section>`;

  const faltan = total - histMostrando;
  if (faltan > 0) {
    html += `<button type="button" class="hist-mas" data-accion="ver-mas">Ver ${Math.min(HIST_PAGINA, faltan)} pedidos anteriores</button>`;
  }
  histList.innerHTML = html;
}

function motivoHtml(pedido) {
  const cambio = aFecha(pedido.updatedAt);
  let texto = MOTIVOS_CANCELACION[pedido.motivoCancelacion]
    || `Cancelado a mano${cambio ? " " + fechaLarga(cambio) : ""}.`;
  let html = `<div class="mp-note mp-wait">❌ ${escapeHtml(texto)}</div>`;
  if (pedido.mpPaymentId && pedido.motivoCancelacion !== "pago_rechazado") {
    html += `<div class="mp-note mp-wait">Este pedido se había pagado con Mercado Pago. Si todavía no le devolviste la plata al cliente, hacelo desde tu cuenta de Mercado Pago.</div>`;
  }
  return html;
}

function detalleHtml(pedido) {
  const status = pedido.status || "confirmed";
  const c = pedido.contact || {};
  const entro = aFecha(pedido.createdAt);
  const cambio = aFecha(pedido.updatedAt);
  const esRetiro = pedido.delivery === "local";
  const cerrado = status === "completed" || status === "cancelled";
  const direccion = [c.street, c.city, c.province].filter(Boolean).join(", ");
  const km = Number(pedido.distanceKm);
  const descuento = Math.max(0, Number(pedido.pointsUsed) || 0);
  const envio = Number(pedido.deliveryCost || 0);
  const id = escapeHtml(pedido.firebaseId);

  let cuando = entro ? `Entró ${escapeHtml(fechaLarga(entro))}` : "";
  if (status === "completed" && cambio) cuando += `<br>Entregado ${escapeHtml(fechaLarga(cambio))}`;

  const items = (pedido.items || []).map((item) => {
    const qty = Number(item.qty || 1);
    const precio = Number(item.price || 0);
    const linea = Number(item.subtotal || precio * qty);
    return `
      <li>
        <span class="det-qty">${escapeHtml(qty)}×</span>
        <span class="det-prod">${escapeHtml(item.name || "Producto")}
          ${item.brand || precio ? `<small>${escapeHtml([item.brand, precio ? plata(precio) + " c/u" : ""].filter(Boolean).join(" · "))}</small>` : ""}
        </span>
        <span class="det-linea">${plata(linea)}</span>
      </li>`;
  }).join("");

  return `
    <div class="det-cabecera">
      ${chipHtml(status)}
      <h3 class="det-id">#${escapeHtml(pedido.orderId || pedido.firebaseId)}</h3>
      ${cuando ? `<p class="det-cuando">${cuando}</p>` : ""}
      ${status === "cancelled" ? motivoHtml(pedido) : ""}
    </div>

    <section class="det-bloque">
      <h4>Cliente</h4>
      <p class="det-dato fuerte">${escapeHtml(c.name || "Cliente sin nombre")}</p>
      ${c.phone
        ? `<a class="det-tel" href="tel:${escapeHtml(String(c.phone).replace(/[^\d+]/g, ""))}"><i class="fas fa-phone" aria-hidden="true"></i> ${escapeHtml(c.phone)}</a>`
        : `<p class="det-dato apagado">Sin teléfono</p>`}
      ${c.email ? `<p class="det-dato apagado">${escapeHtml(c.email)}</p>` : ""}
    </section>

    <section class="det-bloque">
      <h4>Entrega</h4>
      <p class="det-dato fuerte">${esRetiro ? "🏪 Retiro en sucursal" : "🛵 Envío a domicilio"}</p>
      ${esRetiro ? "" : `<p class="det-dato">${escapeHtml(direccion || "Sin dirección")}</p>`}
      ${!esRetiro && km > 0 ? `<p class="det-dato apagado">${pedido.distanceApprox ? "A unos" : "A"} ${km.toLocaleString("es-AR", { maximumFractionDigits: 1 })} km</p>` : ""}
    </section>

    <section class="det-bloque">
      <h4>Pago</h4>
      <p class="det-dato fuerte">${escapeHtml(getPaymentLabel(pedido.payment))}</p>
      ${pedido.mpPaymentId ? `<p class="det-dato apagado">Pago de Mercado Pago n.º ${escapeHtml(pedido.mpPaymentId)}</p>` : ""}
      ${status === "cancelled" ? "" : notaCobro(pedido)}
    </section>

    <section class="det-bloque">
      <h4>Puntos</h4>
      ${puntosHtml(pedido)}
    </section>

    <section class="det-bloque">
      <h4>Productos</h4>
      <ul class="det-items">${items || `<li class="det-dato apagado">Sin productos</li>`}</ul>
      <dl class="det-totales">
        <dt>Subtotal</dt><dd>${plata(pedido.subtotal)}</dd>
        <dt>Envío</dt><dd>${envio === 0 ? "Gratis" : plata(envio)}</dd>
        ${descuento > 0 ? `<dt>Descuento con puntos</dt><dd>−${plata(descuento)}</dd>` : ""}
        <dt class="det-total">Total</dt><dd class="det-total">${plata(pedido.total)}</dd>
      </dl>
    </section>

    ${c.notes ? `
      <section class="det-bloque">
        <h4>Notas del cliente</h4>
        <p class="det-nota">${escapeHtml(c.notes)}</p>
      </section>` : ""}

    <div class="det-acciones">
      <button type="button" class="btn-sec" data-accion="imprimir" data-id="${id}">
        <i class="fas fa-print" aria-hidden="true"></i> Imprimir pedido
      </button>
      ${cerrado ? "" : `
        <button type="button" class="btn-peligro" data-accion="cancelar" data-id="${id}">
          <i class="fas fa-ban" aria-hidden="true"></i> Cancelar pedido
        </button>`}
    </div>
  `;
}

function renderHistorialDetalle() {
  const pedido = buscarPedido(detalleId);
  histDetail.innerHTML = pedido
    ? detalleHtml(pedido)
    : `<p class="hist-vacio">Este pedido ya no existe.</p>`;
}

function refrescarHistorial() {
  if (!panelAbierto) return;
  if (vista === "detalle") renderHistorialDetalle();
  else renderHistorialLista();
}

function mostrarPanel() {
  if (panelAbierto) return;
  panelAbierto = true;
  histPanel.inert = false;
  histPanel.classList.add("open");
  histBackdrop.classList.add("open");
  histPanel.setAttribute("aria-hidden", "false");
  histOpenBtn.setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("panel-abierto");
  histCloseBtn.focus({ preventScroll: true });
}

function ocultarPanel() {
  if (!panelAbierto) return;
  panelAbierto = false;
  histPanel.classList.remove("open");
  histBackdrop.classList.remove("open");
  histPanel.setAttribute("aria-hidden", "true");
  histPanel.inert = true;
  histOpenBtn.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("panel-abierto");
  cerrarModalCancelar();
  histOpenBtn.focus({ preventScroll: true });
}

function mostrarLista() {
  vista = "lista";
  detalleId = null;
  histDetail.hidden = true;
  histList.hidden = false;
  histBackBtn.hidden = true;
  histTitle.textContent = "Historial de pedidos";
  renderHistorialLista();
  histList.scrollTop = scrollLista;
}

function mostrarDetalle(id) {
  if (vista === "lista" && !histList.hidden) scrollLista = histList.scrollTop;
  vista = "detalle";
  detalleId = id;
  histList.hidden = true;
  histDetail.hidden = false;
  histBackBtn.hidden = false;
  histTitle.textContent = "Detalle del pedido";
  renderHistorialDetalle();
  histDetail.scrollTop = 0;
}

// El panel y el detalle se anotan en el historial del navegador: así el
// botón o el gesto de "atrás" del celular cierra el panel en vez de salir
// de la pantalla de pedidos (y dejar de escuchar la alarma).
function abrirHistorial() {
  if (panelAbierto) return;
  scrollLista = 0;
  histMostrando = HIST_PAGINA;
  history.pushState({ hist: "lista" }, "");
  mostrarLista();
  mostrarPanel();
}

function abrirDetalle(id) {
  history.pushState({ hist: "detalle", id }, "");
  mostrarDetalle(id);
}

function cerrarHistorial() {
  const enHistorial = history.state?.hist;
  const pasos = enHistorial === "detalle" ? 2 : enHistorial === "lista" ? 1 : 0;
  if (pasos) history.go(-pasos);
  else ocultarPanel();
}

function volverALista() {
  if (history.state?.hist === "detalle") history.back();
  else mostrarLista();
}

window.addEventListener("popstate", (e) => {
  const enHistorial = e.state?.hist;
  if (enHistorial === "detalle") {
    mostrarDetalle(e.state.id);
    mostrarPanel();
  } else if (enHistorial === "lista") {
    mostrarLista();
    mostrarPanel();
  } else {
    ocultarPanel();
  }
});

// Si la página se recargó con el panel anotado, se arranca con el panel cerrado.
if (history.state?.hist) history.replaceState(null, "");

histOpenBtn.addEventListener("click", abrirHistorial);
histCloseBtn.addEventListener("click", cerrarHistorial);
histBackBtn.addEventListener("click", volverALista);
histBackdrop.addEventListener("click", cerrarHistorial);

// En el celular, deslizar el panel hacia la derecha lo cierra. Alcanza con
// arrastrar un tercio del ancho o con un movimiento rápido.
let arrastre = null;
let ignorarClick = false;

histPanel.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "touch" || !panelAbierto || arrastre) return;
  arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, activo: false };
});

histPanel.addEventListener("pointermove", (e) => {
  if (!arrastre || e.pointerId !== arrastre.id) return;
  const dx = e.clientX - arrastre.x;
  const dy = e.clientY - arrastre.y;
  if (!arrastre.activo) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { arrastre = null; return; }
    if (dx < 10 || dx < Math.abs(dy)) return;
    arrastre.activo = true;
    histPanel.classList.add("arrastrando");
    try { histPanel.setPointerCapture(e.pointerId); } catch (_) { /* sigue igual sin captura */ }
  }
  arrastre.dx = Math.max(0, dx);
  histPanel.style.transform = `translateX(${arrastre.dx}px)`;
});

function soltarPanel(e) {
  if (!arrastre || e.pointerId !== arrastre.id) return;
  const { dx, t, activo } = arrastre;
  arrastre = null;
  if (!activo) return;
  ignorarClick = true;
  setTimeout(() => { ignorarClick = false; }, 0);
  histPanel.classList.remove("arrastrando");
  histPanel.style.transform = "";
  const velocidad = dx / Math.max(1, performance.now() - t);
  if (dx > histPanel.offsetWidth / 3 || velocidad > 0.11) cerrarHistorial();
}

histPanel.addEventListener("pointerup", soltarPanel);
histPanel.addEventListener("pointercancel", soltarPanel);
histPanel.addEventListener("click", (e) => {
  if (!ignorarClick) return;
  e.stopPropagation();
  e.preventDefault();
}, true);

// ---------- Cancelar un pedido ----------

let pedidoACancelar = null;

function pedirCancelacion(id) {
  const pedido = buscarPedido(id);
  if (!pedido || pedido.status === "completed" || pedido.status === "cancelled") return;

  pedidoACancelar = id;
  const hecho = estadoDelPedido(pedido);
  const usados = Math.max(0, Number(pedido.pointsUsed) || 0);
  const ganados = Math.max(0, Number(pedido.pointsEarned) || 0);

  const consecuencias = ["El pedido pasa a “Cancelado” y sale de la lista de pedidos abiertos."];
  if (hecho.stockDescontado) consecuencias.push("Los productos vuelven al stock de la tienda.");
  if (pedido.userId && usados > 0 && hecho.usadosDescontados) {
    consecuencias.push(`Se le devuelven al cliente los ${usados.toLocaleString("es-AR")} puntos que usó.`);
  }
  if (pedido.userId && ganados > 0 && hecho.ganadosAcreditados) {
    consecuencias.push(`Se le quitan los ${ganados.toLocaleString("es-AR")} puntos que sumó con esta compra.`);
  }
  if (estaPagado(pedido)) {
    consecuencias.push(pedido.payment === "mp"
      ? "El cliente ya pagó con Mercado Pago y la plata no se devuelve sola: hacé la devolución desde tu cuenta de Mercado Pago."
      : "El cliente ya pagó: la devolución de la plata la tenés que hacer vos.");
  }
  consecuencias.push("No se puede deshacer.");

  cancelTitle.textContent = `¿Cancelar el pedido #${pedido.orderId || pedido.firebaseId}?`;
  cancelText.innerHTML = `
    <p class="confirm-cliente">${escapeHtml(pedido.contact?.name || "Cliente sin nombre")} · ${plata(pedido.total)}</p>
    <ul>${consecuencias.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
  cancelError.textContent = "";
  cancelYesBtn.disabled = false;
  cancelNoBtn.disabled = false;
  cancelYesBtn.textContent = "Sí, cancelar pedido";
  cancelModal.classList.add("show");
  cancelNoBtn.focus({ preventScroll: true });
}

function cerrarModalCancelar() {
  if (!cancelModal.classList.contains("show")) return;
  cancelModal.classList.remove("show");
  pedidoACancelar = null;
}

async function confirmarCancelacion() {
  if (!pedidoACancelar) return;
  cancelYesBtn.disabled = true;
  cancelNoBtn.disabled = true;
  cancelYesBtn.textContent = "Cancelando…";
  cancelError.textContent = "";
  try {
    await cambiarEstadoPedido(db, pedidoACancelar, "cancelled");
    cerrarModalCancelar();
  } catch (error) {
    console.error("Error cancelando pedido:", error);
    cancelError.textContent = "No se pudo cancelar: " + (error?.message || "probá de nuevo.");
    cancelYesBtn.disabled = false;
    cancelNoBtn.disabled = false;
    cancelYesBtn.textContent = "Sí, cancelar pedido";
  }
}

cancelYesBtn.addEventListener("click", confirmarCancelacion);
cancelNoBtn.addEventListener("click", cerrarModalCancelar);
cancelModal.addEventListener("click", (e) => {
  if (e.target === cancelModal && !cancelNoBtn.disabled) cerrarModalCancelar();
});

// ---------- Imprimir el pedido (comanda para armarlo) ----------

function cobroComanda(pedido) {
  const total = plata(pedido.total);
  if (pedido.status === "cancelled") return "PEDIDO CANCELADO";
  if (pedido.payment === "mp") {
    return estaPagado(pedido) ? "PAGADO CON MERCADO PAGO" : "MERCADO PAGO: TODAVÍA SIN PAGAR";
  }
  if (pedido.payment === "transfer") {
    return pedido.pointsApplied === false ? "TRANSFERENCIA: ESPERAR EL COMPROBANTE" : "PAGADO POR TRANSFERENCIA";
  }
  return pedido.pointsApplied === false ? `COBRAR ${total} EN EFECTIVO` : "PAGADO EN EFECTIVO";
}

function comandaHtml(pedido) {
  const c = pedido.contact || {};
  const entro = aFecha(pedido.createdAt);
  const esRetiro = pedido.delivery === "local";
  const direccion = [c.street, c.city, c.province].filter(Boolean).join(", ");
  const descuento = Math.max(0, Number(pedido.pointsUsed) || 0);
  const envio = Number(pedido.deliveryCost || 0);
  const faltantes = Number(pedido.pointsFaltantes) || 0;

  const items = (pedido.items || []).map((item) => {
    const qty = Number(item.qty || 1);
    const linea = Number(item.subtotal || Number(item.price || 0) * qty);
    return `
      <tr>
        <td class="tk-check">☐</td>
        <td class="tk-qty">${escapeHtml(qty)}</td>
        <td>${escapeHtml(item.name || "Producto")}${item.brand ? ` <span class="tk-marca-prod">${escapeHtml(item.brand)}</span>` : ""}</td>
        <td class="tk-num">${plata(linea)}</td>
      </tr>`;
  }).join("");

  return `
    <div class="tk">
      <div class="tk-logo">LOBO24</div>
      <div class="tk-id">Pedido #${escapeHtml(pedido.orderId || pedido.firebaseId)}</div>
      ${entro ? `<div class="tk-fecha">${escapeHtml(entro.toLocaleDateString("es-AR"))} · ${escapeHtml(hora(entro))} h</div>` : ""}
      <div class="tk-sep"></div>
      <div class="tk-grande">${esRetiro ? "RETIRA EN EL LOCAL" : "ENVÍO A DOMICILIO"}</div>
      <div><strong>Cliente:</strong> ${escapeHtml(c.name || "Sin nombre")}</div>
      ${c.phone ? `<div><strong>Tel:</strong> ${escapeHtml(c.phone)}</div>` : ""}
      ${esRetiro ? "" : `<div><strong>Dirección:</strong> ${escapeHtml(direccion || "Sin dirección")}</div>`}
      <div class="tk-sep"></div>
      <table class="tk-items">${items}</table>
      <div class="tk-sep"></div>
      <table class="tk-totales">
        <tr><td>Subtotal</td><td class="tk-num">${plata(pedido.subtotal)}</td></tr>
        <tr><td>Envío</td><td class="tk-num">${envio === 0 ? "Gratis" : plata(envio)}</td></tr>
        ${descuento > 0 ? `<tr><td>Descuento con puntos</td><td class="tk-num">−${plata(descuento)}</td></tr>` : ""}
        <tr class="tk-total"><td>TOTAL</td><td class="tk-num">${plata(pedido.total)}</td></tr>
      </table>
      <div class="tk-sep"></div>
      <div class="tk-grande">${escapeHtml(cobroComanda(pedido))}</div>
      ${faltantes > 0 ? `<div><strong>Falta cobrar ${plata(faltantes)}:</strong> usó puntos que ya había gastado.</div>` : ""}
      ${c.notes ? `<div class="tk-sep"></div><div><strong>Notas:</strong> ${escapeHtml(c.notes)}</div>` : ""}
    </div>`;
}

function imprimirPedido(id) {
  const pedido = buscarPedido(id);
  if (!pedido) return;
  printArea.innerHTML = comandaHtml(pedido);
  window.print();
}

window.addEventListener("afterprint", () => { printArea.innerHTML = ""; });

// ---------- Botones de las tarjetas y del panel ----------

document.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;
  const id = boton.dataset.id;
  switch (boton.dataset.accion) {
    case "detalle": abrirDetalle(id); break;
    case "ver-mas":
      histMostrando += HIST_PAGINA;
      renderHistorialLista();
      break;
    case "imprimir": imprimirPedido(id); break;
    case "cancelar": pedirCancelacion(id); break;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (cancelModal.classList.contains("show")) {
    if (!cancelNoBtn.disabled) cerrarModalCancelar();
  } else if (panelAbierto) {
    if (vista === "detalle") volverALista();
    else cerrarHistorial();
  }
});

window.updateOrderStatus = updateOrderStatus;
