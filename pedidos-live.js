import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

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

const knownOrders = new Map();
let firstLoad = true;

const STATUS_LABELS = {
  pending_payment: "Pendiente de pago",
  payment_confirmed: "Pago confirmado",
  confirmed: "Confirmado",
  processing: "En preparación",
  completed: "Entregado",
  cancelled: "Cancelado"
};

const STATUS_CLASS = {
  pending_payment: "pendiente",
  payment_confirmed: "preparacion",
  confirmed: "pendiente",
  processing: "preparacion",
  completed: "entregado",
  cancelled: "pendiente"
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

    const activeOrders = pedidos.filter(p =>
      p.status !== "completed" && p.status !== "cancelled"
    );

    detectNewOrders(activeOrders);
    renderOrders(activeOrders);
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

function formatFecha(createdAt) {
  if (!createdAt) return "—";
  const date = typeof createdAt.toDate === "function" ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

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

    const mpValidado = pedido.status === "payment_confirmed";
    const mpNote = pedido.payment === "mp" ? `
      <div class="mp-note ${mpValidado ? "mp-ok" : "mp-wait"}">
        ${mpValidado
          ? "✅ Pago acreditado por Mercado Pago"
          : "⏳ Esperar validación: confirmar que el dinero ingresó a la cuenta antes de entregar/preparar"}
      </div>` : "";

    return `
      <div class="pedido-card">
        <div class="status ${statusClass}">${statusLabel}</div>

        <h2>#${pedido.orderId || pedido.firebaseId}</h2>
        <div class="info fecha"><strong>Fecha:</strong> ${escapeHtml(fecha)}</div>

        ${esRetiro ? `<div class="pickup-badge">🏪 RETIRO EN SUCURSAL</div>` : ""}

        <div class="info"><strong>Cliente:</strong> ${escapeHtml(cliente)}</div>
        ${telefono ? `<div class="info"><strong>Tel:</strong> ${escapeHtml(telefono)}</div>` : ""}
        ${email ? `<div class="info"><strong>Email:</strong> ${escapeHtml(email)}</div>` : ""}

        <div class="info"><strong>Entrega:</strong> ${escapeHtml(entrega)}</div>
        <div class="info"><strong>Dirección:</strong> ${escapeHtml(direccion)}</div>
        <div class="info"><strong>Pago:</strong> ${escapeHtml(pago)}</div>
        ${mpNote}

        <div class="total">$${total.toLocaleString("es-AR")}</div>

        <div class="info">
          Subtotal: $${subtotal.toLocaleString("es-AR")}<br>
          Envío: ${deliveryCost === 0 ? "Gratis" : "$" + deliveryCost.toLocaleString("es-AR")}
        </div>

        <div class="items">
          <strong>Productos:</strong>
          ${(pedido.items || []).map(item => `
            <div class="item">
              ${escapeHtml(item.name || "Producto")} x${item.qty || 1}
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
      </div>
    `;
  }).join("");
}

async function updateOrderStatus(orderFirebaseId, status) {
  try {
    const ref = doc(db, "pedidos", orderFirebaseId);
    await updateDoc(ref, {
      status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    alert("No se pudo actualizar el pedido.");
  }
}

function getPaymentLabel(payment) {
  if (payment === "mp") return "Mercado Pago";
  if (payment === "transfer") return "Transferencia bancaria";
  if (payment === "efectivo") return "Efectivo en local";
  return payment || "Sin especificar";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.updateOrderStatus = updateOrderStatus;