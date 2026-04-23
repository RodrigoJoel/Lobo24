/* ══════════════════════════════════════
   APP GLOBAL LOBO24
   Compartido por index + secciones
══════════════════════════════════════ */

/* ─────────────────────────────────────
   THEME
───────────────────────────────────── */
let theme = localStorage.getItem('lob24theme') || 'dark';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('lob24theme', t);
  theme = t;
}

function toggleTheme() {
  applyTheme(theme === 'dark' ? 'light' : 'dark');
}

/* ─────────────────────────────────────
   TOAST
───────────────────────────────────── */
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>🐺</span> ${msg}`;
  container.appendChild(t);

  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));

  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

/* ─────────────────────────────────────
   SEARCH GLOBAL
───────────────────────────────────── */
function handleSearch() {
  const q = document.getElementById('searchInput')?.value.trim();
  if (!q) return;

  const catSearch = document.getElementById('catSearch');
  if (catSearch) {
    catSearch.value = q;
    if (typeof applyFilters === 'function') {
      applyFilters();
    }
    document.querySelector('.cat-search-bar')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } else {
    showToast(`🔍 Buscando "${q}"...`);
  }
}

/* ─────────────────────────────────────
   MODAL LOGIN / REGISTRO
───────────────────────────────────── */
function openModal() {
  document.getElementById('modalOverlay')?.classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
}

function switchTab(t) {
  document.getElementById('tabLogin')?.classList.toggle('active', t === 'login');
  document.getElementById('tabReg')?.classList.toggle('active', t === 'reg');

  const formLogin = document.getElementById('formLogin');
  const formReg = document.getElementById('formReg');

  if (formLogin) formLogin.style.display = t === 'login' ? 'block' : 'none';
  if (formReg) formReg.style.display = t === 'reg' ? 'block' : 'none';
}

/* ─────────────────────────────────────
   FORGOT PASSWORD MODAL
───────────────────────────────────── */
function showForgotPassword(e) {
  if (e) e.preventDefault();
  closeModal();

  const forgot = document.getElementById('forgotModal');
  if (forgot) forgot.classList.add('open');

  const email = document.getElementById('resetEmail');
  const msg = document.getElementById('resetMessage');

  if (email) email.value = '';
  if (msg) {
    msg.textContent = '';
    msg.style.color = '';
  }
}

function closeForgotModal() {
  document.getElementById('forgotModal')?.classList.remove('open');
}

async function sendResetEmail() {
  const emailInput = document.getElementById('resetEmail');
  const msg = document.getElementById('resetMessage');
  const btn = document.getElementById('resetBtn');
  const email = emailInput?.value.trim();

  if (!email) {
    if (msg) {
      msg.textContent = '⚠️ Ingresá un email válido';
      msg.style.color = '#f87171';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
  }

  try {
    if (typeof window.fbSendPasswordReset !== 'function') {
      throw new Error('No se inicializó Firebase Auth');
    }

    await window.fbSendPasswordReset(email);

    if (msg) {
      msg.textContent = `📩 Enlace enviado a ${email}. Revisá tu bandeja de entrada.`;
      msg.style.color = '#4ade80';
    }

    setTimeout(() => closeForgotModal(), 4000);
  } catch (error) {
    const errMap = {
      'auth/user-not-found': '❌ No existe una cuenta con ese email.',
      'auth/invalid-email': '❌ El formato del email no es válido.',
      'auth/too-many-requests': '⚠️ Demasiados intentos. Esperá unos minutos.'
    };

    if (msg) {
      msg.textContent = errMap[error.code] || ('❌ Error: ' + error.message);
      msg.style.color = '#f87171';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Enviar enlace';
    }
  }
}

/* ─────────────────────────────────────
   AUTH
───────────────────────────────────── */
async function handleLogin() {
  const email =
    document.getElementById('loginEmail')?.value.trim() ||
    document.querySelector('#formLogin input[type="email"]')?.value.trim();

  const pass =
    document.getElementById('loginPass')?.value ||
    document.querySelector('#formLogin input[type="password"]')?.value;

  if (!email || !pass) {
    showToast('⚠️ Ingresá email y contraseña');
    return;
  }

  try {
    const { auth, signInWithEmailAndPassword } = window.fbAuth;
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal();
    showToast('👋 ¡Bienvenido de vuelta!');
  } catch (error) {
    const errMap = {
      'auth/user-not-found': '❌ No existe una cuenta con ese email.',
      'auth/wrong-password': '❌ Contraseña incorrecta.',
      'auth/invalid-email': '❌ Email no válido.',
      'auth/too-many-requests': '⚠️ Demasiados intentos. Esperá un momento.'
    };
    showToast(errMap[error.code] || '❌ Credenciales incorrectas');
  }
}

async function handleRegister() {
  const name =
    document.getElementById('regName')?.value.trim() ||
    document.querySelector('#formReg input[placeholder="Juan Pérez"]')?.value.trim();

  const email =
    document.getElementById('regEmail')?.value.trim() ||
    document.querySelector('#formReg input[type="email"]')?.value.trim();

  const pass =
    document.getElementById('regPass')?.value ||
    document.querySelector('#formReg input[type="password"]')?.value;

  const phone =
    document.getElementById('regPhone')?.value.trim() ||
    document.querySelector('#formReg input[type="tel"]')?.value.trim();

  if (!name || !email || !pass || pass.length < 6) {
    showToast('⚠️ Completá todos los datos (mínimo 6 caracteres de contraseña)');
    return;
  }

  try {
    const { auth, createUserWithEmailAndPassword, db, doc, setDoc } = window.fbAuth;
    const res = await createUserWithEmailAndPassword(auth, email, pass);

    await setDoc(doc(db, 'users', res.user.uid), {
      name,
      email,
      phone,
      points: 0,
      createdAt: new Date()
    });

    closeModal();
    showToast('🎉 ¡Cuenta creada con éxito!');
  } catch (error) {
    const errMap = {
      'auth/email-already-in-use': '❌ Ese email ya tiene una cuenta.',
      'auth/weak-password': '❌ La contraseña es muy débil.',
      'auth/invalid-email': '❌ El email no es válido.'
    };
    showToast(errMap[error.code] || ('❌ Error: ' + error.message));
  }
}

async function handleLogout() {
  const { auth, signOut } = window.fbAuth;
  await signOut(auth);
  showToast('🚪 Sesión cerrada');
}

/* ─────────────────────────────────────
   USER DROPDOWN
───────────────────────────────────── */
function toggleUserDropdown() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}

/* ─────────────────────────────────────
   HELPERS DE PRODUCTO / CARRITO
───────────────────────────────────── */
function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return null;

  return {
    ...product,
    docId: product.docId || product.id || '',
    id: product.id || product.docId || '',
    coleccion: product.coleccion || product.collection || '',
    name: product.name || '',
    brand: product.brand || '',
    img: product.img || product.image || '',
    price: Number(product.price || 0),
    old: product.old != null ? Number(product.old) : null,
    stock: product.stock != null ? Number(product.stock) : null,
    qty: Number(product.qty || 1)
  };
}

function getCartKey(product) {
  const docId = product?.docId || product?.id || '';
  const coleccion = product?.coleccion || product?.collection || '';
  return `${coleccion}::${docId}`;
}

function getAllAvailableProducts() {
  const pools = [
    window._bestProds || [],
    window._newProds || [],
    window._almacenAll || [],
    window._bebidasAll || [],
    window._snacksAll || [],
    window._higieneAll || [],
    window._limpiezaAll || [],
    window._congeladosAll || [],
    window._lacteosAll || [],
    window._panaderiaAll || [],
    window._mascotasAll || [],
    window._ofertasAll || []
  ];

  return pools.flat().map(normalizeProduct).filter(Boolean);
}

/* ─────────────────────────────────────
   CART PERSISTENTE
───────────────────────────────────── */
let cart = {};

function saveCart() {
  localStorage.setItem('lobo24_cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  try {
    const raw = localStorage.getItem('lobo24_cart');
    if (!raw) {
      cart = {};
      return;
    }

    const parsed = JSON.parse(raw);
    cart = {};

    if (Array.isArray(parsed)) {
      parsed.forEach(item => {
        const normalized = normalizeProduct(item);
        if (!normalized) return;
        const key = getCartKey(normalized);
        if (key !== '::') cart[key] = normalized;
      });
    } else if (parsed && typeof parsed === 'object') {
      Object.values(parsed).forEach(item => {
        const normalized = normalizeProduct(item);
        if (!normalized) return;
        const key = getCartKey(normalized);
        if (key !== '::') cart[key] = normalized;
      });
    }
  } catch (e) {
    console.error('Error cargando carrito desde localStorage:', e);
    cart = {};
  }
}

function addToCart(id, e) {
  const p = getAllAvailableProducts().find(x => (x.docId || x.id) === id);
  if (!p) {
    showToast('❌ No se encontró el producto');
    return;
  }

  const normalized = normalizeProduct(p);
  if (!normalized?.docId || !normalized?.coleccion) {
    console.error('Producto sin docId o coleccion:', normalized);
    showToast('❌ El producto no tiene referencia válida para descontar stock');
    return;
  }

  const key = getCartKey(normalized);
  const stock = normalized.stock ?? null;
  const inCart = cart[key]?.qty || 0;

  if (stock !== null && stock <= 0) {
    showToast('❌ Este producto no tiene stock disponible');
    return;
  }

  if (stock !== null && inCart >= stock) {
    showToast(`⚠️ Solo hay ${stock} unidad${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''}`);
    return;
  }

  cart[key] = cart[key]
    ? { ...cart[key], qty: cart[key].qty + 1 }
    : { ...normalized, qty: 1 };

  saveCart();
  updateCartUI();
  showToast(`✅ ${normalized.name} agregado al carrito`);

  if (e) {
    const b = e.target;
    b.style.transform = 'scale(1.3)';
    setTimeout(() => b.style.transform = '', 200);
  }
}

function changeQty(key, delta) {
  if (!cart[key]) return;

  const item = cart[key];
  const liveProduct = getAllAvailableProducts().find(
    x => (x.docId === item.docId && x.coleccion === item.coleccion) ||
         (x.id === item.id && x.coleccion === item.coleccion)
  );

  const stock = liveProduct?.stock ?? item.stock ?? null;

  if (delta > 0 && stock !== null && cart[key].qty >= stock) {
    showToast('⚠️ No hay más stock disponible');
    return;
  }

  cart[key].qty += delta;

  if (cart[key].qty <= 0) {
    delete cart[key];
  }

  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = {};
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    countEl.textContent = Object.values(cart).reduce((s, i) => s + Number(i.qty || 0), 0);
  }
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('drawerItems');
  const footer = document.getElementById('drawerFooter');

  if (!container || !footer) return;

  const items = Object.entries(cart);

  if (!items.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <div class="empty-icon">🛒</div>
        <p>Tu carrito está vacío.<br>¡Agregá algo rico!</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  container.innerHTML = items.map(([key, i]) => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${i.img || ''}" alt="${i.name || ''}"/>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name || ''}</div>
        <div class="cart-item-price">$${(Number(i.price || 0) * Number(i.qty || 0)).toLocaleString('es-AR')}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${key}', -1)">−</button>
        <span class="qty-num">${i.qty}</span>
        <button class="qty-btn" onclick="changeQty('${key}', 1)">+</button>
      </div>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent =
    `$${items.reduce((s, [, i]) => s + Number(i.price || 0) * Number(i.qty || 0), 0).toLocaleString('es-AR')}`;

  footer.style.display = 'block';
}

function toggleCart() {
  document.getElementById('cartDrawer')?.classList.toggle('open');
  document.getElementById('drawerOverlay')?.classList.toggle('open');
}

function saveCartToLocalStorage() {
  const items = Object.values(cart).map(item => ({
    docId: item.docId || item.id || '',
    id: item.id || item.docId || '',
    qty: Number(item.qty || 1),
    price: Number(item.price || 0),
    old: item.old != null ? Number(item.old) : null,
    stock: item.stock != null ? Number(item.stock) : null,
    coleccion: item.coleccion || item.collection || '',
    name: item.name || '',
    brand: item.brand || '',
    img: item.img || ''
  }));

  localStorage.setItem('lobo24_cart', JSON.stringify(items));
}

function checkout() {
  const items = Object.values(cart);

  if (!items.length) {
    showToast('⚠️ Tu carrito está vacío');
    return;
  }

  saveCartToLocalStorage();
  window.location.href = 'checkout.html';
}

/* ─────────────────────────────────────
   BOOTSTRAP GLOBAL
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(theme);
  loadCartFromLocalStorage();
  updateCartUI();

  document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.getElementById('forgotModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeForgotModal();
  });

  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });

  window.addEventListener('click', function(e) {
    if (!e.target.matches('.user-avatar')) {
      document.querySelectorAll('.user-dropdown').forEach(d => d.classList.remove('show'));
    }
  });
});

/* ─────────────────────────────────────
   EXPORT GLOBAL
───────────────────────────────────── */
window.toggleTheme = toggleTheme;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.showForgotPassword = showForgotPassword;
window.closeForgotModal = closeForgotModal;
window.sendResetEmail = sendResetEmail;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleUserDropdown = toggleUserDropdown;
window.handleSearch = handleSearch;
window.showToast = showToast;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.clearCart = clearCart;
window.saveCartToLocalStorage = saveCartToLocalStorage;