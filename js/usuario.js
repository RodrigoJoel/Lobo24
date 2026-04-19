/* ══════════════════════════════════════
   USUARIO - LÓGICA COMPLETA (VERSIÓN MODULAR)
══════════════════════════════════════ */

let currentUser = null;
let userData = null;

// Estados de pedido para mostrar al usuario
const USER_ORDER_STATUS = {
  pending: { label: '⏳ Pendiente de confirmación', icon: '🕐', color: '#f0c040' },
  confirmed: { label: '✅ Pago confirmado', icon: '✅', color: '#4ade80' },
  processing: { label: '📦 En proceso de armado', icon: '📦', color: '#a78bfa' },
  shipped: { label: '🚚 Despachado', icon: '🚚', color: '#60a5fa' },
  completed: { label: '🎉 Completado', icon: '🎉', color: '#34d399' }
};

// Datos de la tienda
const STORE = {
  address: 'Sarmiento 322, Resistencia, Chaco'
};

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado');
  initTabs();
  handleTabFromURL();
  initAuth();
});

function initAuth() {
  if (!window.auth) {
    console.error('Auth no disponible, reintentando...');
    setTimeout(initAuth, 500);
    return;
  }
  
  window.auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user?.email);
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    
    currentUser = user;
    await loadUserData();
    loadUserProfile();
    loadUserOrders();
    loadUserPoints();
  });
}

async function loadUserData() {
  try {
    const userDocRef = doc(window.db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      userData = userDoc.data();
      console.log('Usuario encontrado:', userData);
      // Asegurar que puntos tenga un valor
      if (userData.points === undefined) {
        userData.points = 0;
        await updateDoc(userDocRef, { points: 0 });
      }
    } else {
      userData = { 
        name: currentUser.email.split('@')[0], 
        email: currentUser.email, 
        phone: '', 
        points: 0, 
        createdAt: new Date() 
      };
      await setDoc(userDocRef, userData);
      console.log('Usuario creado:', userData);
    }
    
    // Actualizar variable global
    window._userPoints = userData.points || 0;
    
  } catch (error) {
    console.error('Error al cargar usuario:', error);
    userData = { points: 0 };
    window._userPoints = 0;
  }
}

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
function initTabs() {
  const tabs = document.querySelectorAll('.user-tab');
  const contents = document.querySelectorAll('.user-tab-content');
  
  if (!tabs.length) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById(`tab${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
      if (targetContent) targetContent.classList.add('active');
      
      const url = new URL(window.location);
      url.searchParams.set('tab', targetTab);
      window.history.pushState({}, '', url);
    });
  });
}

function handleTabFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  if (tab && tab !== 'cuenta') {
    const targetTab = document.querySelector(`.user-tab[data-tab="${tab}"]`);
    if (targetTab) targetTab.click();
  }
}

// ─────────────────────────────────────────────
// MI CUENTA
// ─────────────────────────────────────────────
function loadUserProfile() {
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const phoneEl = document.getElementById('profilePhone');
  const sinceEl = document.getElementById('profileSince');
  
  if (nameEl) nameEl.textContent = userData?.name || 'No especificado';
  if (emailEl) emailEl.textContent = currentUser?.email || 'No especificado';
  if (phoneEl) phoneEl.textContent = userData?.phone || 'No especificado';
  
  if (sinceEl && userData?.createdAt) {
    let createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
    sinceEl.textContent = createdAt.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

function enableEditMode() {
  const infoDiv = document.getElementById('profileInfo');
  const editDiv = document.getElementById('profileEdit');
  const editName = document.getElementById('editName');
  const editPhone = document.getElementById('editPhone');
  
  if (infoDiv) infoDiv.style.display = 'none';
  if (editDiv) editDiv.style.display = 'block';
  if (editName) editName.value = userData?.name || '';
  if (editPhone) editPhone.value = userData?.phone || '';
}

function cancelEditMode() {
  const infoDiv = document.getElementById('profileInfo');
  const editDiv = document.getElementById('profileEdit');
  
  if (infoDiv) infoDiv.style.display = 'block';
  if (editDiv) editDiv.style.display = 'none';
}

async function saveProfileChanges() {
  const newName = document.getElementById('editName')?.value.trim();
  const newPhone = document.getElementById('editPhone')?.value.trim();
  
  if (!newName) {
    showToast('⚠️ El nombre no puede estar vacío');
    return;
  }
  
  try {
    const userDocRef = doc(window.db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      name: newName,
      phone: newPhone || ''
    });
    
    userData.name = newName;
    userData.phone = newPhone || '';
    loadUserProfile();
    cancelEditMode();
    showToast('✅ Datos actualizados correctamente');
  } catch (error) {
    console.error('Error al actualizar:', error);
    showToast('❌ Error al actualizar');
  }
}

// ─────────────────────────────────────────────
// MIS COMPRAS (ACTUALIZADO CON ESTADOS)
// ─────────────────────────────────────────────
async function loadUserOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;
  
  try {
    const ordersRef = collection(window.db, 'pedidos');
    const q = query(ordersRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      ordersList.innerHTML = `
        <div style="text-align:center;padding:40px">
          <i class="fas fa-shopping-bag" style="font-size:48px;color:var(--muted);margin-bottom:16px"></i>
          <p style="color:var(--muted)">No realizaste ninguna compra todavía.</p>
          <a href="index.html" class="btn btn-primary" style="margin-top:16px">Ir a la tienda</a>
        </div>
      `;
      return;
    }
    
    ordersList.innerHTML = '';
    querySnapshot.forEach(docSnap => {
      const order = { id: docSnap.id, ...docSnap.data() };
      ordersList.appendChild(createOrderCard(order));
    });
  } catch (error) {
    console.error('Error al cargar órdenes:', error);
    ordersList.innerHTML = '<p style="color:var(--red);text-align:center;padding:20px">Error al cargar tus compras</p>';
  }
}

function createOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'order-card';
  
  let orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const orderPoints = Math.floor((order.subtotal || order.total) / 100);
  const status = USER_ORDER_STATUS[order.status] || USER_ORDER_STATUS.pending;
  
  card.innerHTML = `
    <div class="order-header">
      <div class="order-date">
        <i class="fas fa-calendar-alt"></i>
        <span>${formattedDate}</span>
      </div>
      <div class="order-status-badge" style="background:${status.color}20;color:${status.color};border:1px solid ${status.color}40;padding:4px 12px;border-radius:20px;font-size:12px">
        ${status.icon} ${status.label}
      </div>
      <div class="order-total">
        <span class="order-amount">$${(order.total || 0).toLocaleString('es-AR')}</span>
        <span class="order-points">⭐ +${orderPoints} puntos</span>
      </div>
    </div>
    <div class="order-products">
      ${order.items?.map(item => `
        <div class="order-product-item">
          <span class="order-product-name">${escapeHtml(item.name)}</span>
          <span class="order-product-qty">x${item.qty}</span>
          <span class="order-product-price">$${item.price.toLocaleString('es-AR')}</span>
          <span class="order-product-subtotal">$${(item.price * item.qty).toLocaleString('es-AR')}</span>
        </div>
      `).join('')}
    </div>
    <div class="order-footer" style="padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div class="order-payment-method">
        <i class="fas fa-credit-card"></i> ${order.payment === 'mp' ? 'Mercado Pago' : order.payment === 'transfer' ? 'Transferencia bancaria' : 'Efectivo en local'}
      </div>
      <div class="order-delivery">
        <i class="fas fa-truck"></i> ${order.delivery === 'local' ? 'Retiro en sucursal' : 'Envío a domicilio'}
      </div>
      <button class="btn btn-ghost btn-sm" onclick="toggleOrderDetailsUser('${order.id}')">
        Ver detalles <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    <div class="order-details-user" id="order-details-${order.id}" style="display:none;padding:16px;border-top:1px solid var(--border);background:var(--bg3)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <strong>📦 Dirección de envío:</strong><br>
          ${order.delivery === 'local' ? 'Retiro en sucursal - ' + STORE.address : `${escapeHtml(order.contact?.street || '')}, ${escapeHtml(order.contact?.city || '')}, ${escapeHtml(order.contact?.province || '')}`}
        </div>
        <div>
          <strong>💳 Método de pago:</strong><br>
          ${order.payment === 'mp' ? 'Mercado Pago' : order.payment === 'transfer' ? 'Transferencia bancaria' : 'Efectivo en local'}
        </div>
        ${order.pointsUsed > 0 ? `
        <div>
          <strong>⭐ Puntos usados:</strong><br>
          ${order.pointsUsed} puntos ($${order.pointsUsed.toLocaleString('es-AR')})
        </div>
        ` : ''}
        <div>
          <strong>⭐ Puntos ganados:</strong><br>
          +${orderPoints} puntos
        </div>
        ${order.contact?.notes ? `
        <div style="grid-column:span 2">
          <strong>📝 Notas adicionales:</strong><br>
          ${escapeHtml(order.contact.notes)}
        </div>
        ` : ''}
        ${order.status === 'pending' ? `
        <div style="grid-column:span 2;background:rgba(240,192,64,0.1);padding:10px;border-radius:8px;text-align:center">
          <i class="fas fa-clock"></i> Tu pedido está pendiente de confirmación. Te llegará un email cuando sea confirmado.
        </div>
        ` : ''}
        ${order.status === 'shipped' ? `
        <div style="grid-column:span 2;background:rgba(96,165,250,0.1);padding:10px;border-radius:8px;text-align:center">
          <i class="fas fa-truck"></i> ¡Tu pedido está en camino! El tiempo estimado de entrega es de 24-48 horas hábiles.
        </div>
        ` : ''}
      </div>
    </div>
  `;
  
  return card;
}

function toggleOrderDetailsUser(orderId) {
  const details = document.getElementById(`order-details-${orderId}`);
  if (details) {
    if (details.style.display === 'none') {
      details.style.display = 'block';
    } else {
      details.style.display = 'none';
    }
  }
}

// ─────────────────────────────────────────────
// MIS PUNTOS (ACTUALIZADO)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// MIS PUNTOS (CORREGIDO)
// ─────────────────────────────────────────────
async function loadUserPoints() {
  try {
    // Obtener puntos directamente del usuario (más confiable)
    if (userData && userData.points !== undefined) {
      const totalPoints = userData.points;
      const totalPointsEl = document.getElementById('totalPoints');
      const pointsValueEl = document.getElementById('pointsValue');
      
      if (totalPointsEl) totalPointsEl.textContent = totalPoints;
      if (pointsValueEl) pointsValueEl.textContent = `$${totalPoints.toLocaleString('es-AR')}`;
    }
    
    // Calcular puntos a vencer desde los pedidos
    const ordersRef = collection(window.db, 'pedidos');
    const q = query(ordersRef, where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    let expiringPoints = 0;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    querySnapshot.forEach(docSnap => {
      const order = docSnap.data();
      let orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const orderPoints = Math.floor((order.subtotal || order.total) / 100);
      const expiryDate = new Date(orderDate);
      expiryDate.setDate(expiryDate.getDate() + 60);
      
      if (expiryDate > now && expiryDate <= nextWeek) {
        expiringPoints += orderPoints;
      }
    });
    
    const expiringPointsEl = document.getElementById('expiringPoints');
    if (expiringPointsEl) expiringPointsEl.textContent = expiringPoints;
    
  } catch (error) {
    console.error('Error al cargar puntos:', error);
    // Mostrar puntos desde userData aunque falle la consulta
    if (userData && userData.points !== undefined) {
      document.getElementById('totalPoints').textContent = userData.points;
      document.getElementById('pointsValue').textContent = `$${userData.points.toLocaleString('es-AR')}`;
    }
  }
}

// ─────────────────────────────────────────────
// FUNCIONES COMPARTIDAS
// ─────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>🐺</span> ${msg}`;
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, 3500);
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

async function handleLogout() {
  await window.auth.signOut();
  showToast('🚪 Sesión cerrada');
  setTimeout(() => window.location.href = 'index.html', 1000);
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('userDropdown');
  const avatar = document.querySelector('.user-avatar');
  if (dropdown && avatar && !avatar.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Funciones vacías para compatibilidad
window.toggleCart = () => {};
window.checkout = () => {};
window.toggleTheme = () => {};
window.handleSearch = () => {};
window.openModal = () => {};
window.closeModal = () => {};

// Exponer funciones globales
window.enableEditMode = enableEditMode;
window.cancelEditMode = cancelEditMode;
window.saveProfileChanges = saveProfileChanges;
window.toggleUserDropdown = toggleUserDropdown;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.toggleOrderDetailsUser = toggleOrderDetailsUser;

console.log('usuario.js cargado correctamente');