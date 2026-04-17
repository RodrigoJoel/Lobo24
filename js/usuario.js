/* ══════════════════════════════════════
   USUARIO - LÓGICA COMPLETA (VERSIÓN MODULAR)
══════════════════════════════════════ */

let currentUser = null;
let userData = null;

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
  } catch (error) {
    console.error('Error al cargar usuario:', error);
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
// MIS COMPRAS
// ─────────────────────────────────────────────
async function loadUserOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;
  
  try {
    const ordersRef = collection(window.db, 'orders');
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
  const orderPoints = Math.floor(order.total / 100);
  
  card.innerHTML = `
    <div class="order-header">
      <div class="order-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</div>
      <div class="order-total">
        <span class="order-amount">$${order.total.toLocaleString('es-AR')}</span>
        <span class="order-points">⭐ +${orderPoints} puntos</span>
        <span class="order-payment"><i class="fas fa-credit-card"></i> ${order.paymentMethod || 'Efectivo'}</span>
      </div>
    </div>
    <div class="order-products">
      ${order.items?.map(item => `
        <div class="order-product-item">
          <span class="order-product-name">${item.name}</span>
          <span class="order-product-qty">x${item.qty}</span>
          <span class="order-product-price">$${item.price.toLocaleString('es-AR')}</span>
          <span class="order-product-subtotal">$${(item.price * item.qty).toLocaleString('es-AR')}</span>
        </div>
      `).join('')}
    </div>
  `;
  return card;
}

// ─────────────────────────────────────────────
// MIS PUNTOS
// ─────────────────────────────────────────────
async function loadUserPoints() {
  try {
    const ordersRef = collection(window.db, 'orders');
    const q = query(ordersRef, where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    let totalPoints = 0;
    const now = new Date();
    let expiringPoints = 0;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    querySnapshot.forEach(docSnap => {
      const order = docSnap.data();
      let orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const orderPoints = Math.floor(order.total / 100);
      const expiryDate = new Date(orderDate);
      expiryDate.setDate(expiryDate.getDate() + 60);
      
      if (expiryDate > now) {
        totalPoints += orderPoints;
        if (expiryDate <= nextWeek) expiringPoints += orderPoints;
      }
    });
    
    const totalPointsEl = document.getElementById('totalPoints');
    const pointsValueEl = document.getElementById('pointsValue');
    const expiringPointsEl = document.getElementById('expiringPoints');
    
    if (totalPointsEl) totalPointsEl.textContent = totalPoints;
    if (pointsValueEl) pointsValueEl.textContent = `$${(totalPoints * 100).toLocaleString('es-AR')}`;
    if (expiringPointsEl) expiringPointsEl.textContent = expiringPoints;
    
    const userDocRef = doc(window.db, 'users', currentUser.uid);
    await updateDoc(userDocRef, { points: totalPoints });
  } catch (error) {
    console.error('Error al cargar puntos:', error);
  }
}

// ─────────────────────────────────────────────
// FUNCIONES COMPARTIDAS
// ─────────────────────────────────────────────
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

console.log('usuario.js cargado correctamente');