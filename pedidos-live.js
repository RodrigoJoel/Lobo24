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

const pedidosContainer = document.getElementById("pedidosContainer");
const emptyState = document.getElementById("emptyState");
const pedidoCount = document.getElementById("pedidoCount");
const alertSound = document.getElementById("alertSound");

let knownOrders = new Set();
let firstLoad = true;

const STATUS_LABELS = {
  pending_payment: "Pendiente de pago",
  confirmed: "Confirmado",
  processing: "En preparación",
  completed: "Entregado",
  cancelled: "Cancelado"
};

const STATUS_CLASS = {
  pending_payment: "pendiente",
  confirmed: "pendiente",
  processing: "preparacion",
  completed: "entregado",
  cancelled: "pendiente"
};

initNotifications();
listenOrders();

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

    if (!knownOrders.has(id)) {
      knownOrders.add(id);

      if (!firstLoad) {
        notifyNewOrder(pedido);
      }
    }
  });

  firstLoad = false;
}

function notifyNewOrder(pedido) {
  playSound();

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Nuevo pedido en Lobo24", {
      body: `Pedido #${pedido.orderId || pedido.firebaseId} - Total $${Number(pedido.total || 0).toLocaleString("es-AR")}`,
      icon: "imagenes/iconoLobo24.png"
    });
  }
}

function playSound() {
  if (!alertSound) return;

  alertSound.currentTime = 0;
  alertSound.play().catch(() => {
    console.warn("El navegador bloqueó el sonido hasta que el usuario interactúe.");
  });
}

function initNotifications() {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
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
    const entrega = pedido.delivery === "local" ? "Retiro en sucursal" : "Envío a domicilio";

    return `
      <div class="pedido-card">
        <div class="status ${statusClass}">${statusLabel}</div>

        <h2>#${pedido.orderId || pedido.firebaseId}</h2>

        <div class="info"><strong>Cliente:</strong> ${escapeHtml(cliente)}</div>
        ${telefono ? `<div class="info"><strong>Tel:</strong> ${escapeHtml(telefono)}</div>` : ""}
        ${email ? `<div class="info"><strong>Email:</strong> ${escapeHtml(email)}</div>` : ""}

        <div class="info"><strong>Entrega:</strong> ${escapeHtml(entrega)}</div>
        <div class="info"><strong>Dirección:</strong> ${escapeHtml(direccion)}</div>
        <div class="info"><strong>Pago:</strong> ${escapeHtml(pago)}</div>

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