/* ══════════════════════════════════════
   CAROUSEL
══════════════════════════════════════ */
let ci = 0, ctimer;
window._slides = [];

function buildCarousel(slides) {
  window._slides = slides;
  const track = document.getElementById('carouselTrack');
  const dots  = document.getElementById('carouselDots');
  if (ci >= slides.length) ci = 0;

  track.innerHTML = slides.map((s, i) => `
    <div class="carousel-slide${i===ci?' active-slide':''}">
      <img class="slide-bg" src="${s.img||''}" alt="slide"/>
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <div class="hero-tag">${s.tag||''}</div>
        <h1>${(s.title||'').replace(/\n/g,'<br>')}</h1>
        <p class="slide-desc">${s.desc||''}</p>
        <div class="hero-cta">
          <a href="${s.btnLink||'#'}" class="btn btn-yellow">${s.btnText||'Ver más'}</a>
          <button class="btn btn-ghost" onclick="openModal()">Crear cuenta gratis →</button>
        </div>
      </div>
    </div>`).join('');

  dots.innerHTML = slides.map((_,i) =>
    `<button class="c-dot${i===ci?' active':''}" onclick="goSlide(${i})"></button>`
  ).join('');

  clearInterval(ctimer);
  ctimer = setInterval(() => carouselMove(1), 5000);
}

function goSlide(i) {
  ci = i;
  document.getElementById('carouselTrack').style.transform = `translateX(-${i*100}%)`;
  document.querySelectorAll('.c-dot').forEach((d,j) => d.classList.toggle('active', j===i));
  document.querySelectorAll('.carousel-slide').forEach((s,j) => s.classList.toggle('active-slide', j===i));
  clearInterval(ctimer);
  ctimer = setInterval(() => carouselMove(1), 5000);
}

function carouselMove(dir) {
  const n = window._slides.length || 1;
  goSlide((ci + dir + n) % n);
}

/* ══════════════════════════════════════
   CATEGORIES
══════════════════════════════════════ */
function buildCategories(cats) {
  document.getElementById('categoriesGrid').innerHTML = cats.map(c =>
    `<a class="category-card" href="${c.slug||'#'}.html">
      <div class="cat-emoji">${c.emoji||'🛒'}</div>
      <div class="cat-name">${c.name||''}</div>
      <div class="cat-count">${c.count||0} productos</div>
    </a>`
  ).join('');
}

/* ══════════════════════════════════════
   PRODUCTS
══════════════════════════════════════ */
function renderProducts(list, id) {
  const g = document.getElementById(id);
  if (!g) return;
  if (!list.length) {
    g.innerHTML = '<p style="color:var(--muted);padding:20px">Sin productos cargados.</p>';
    return;
  }
  g.innerHTML = list.map(p => `
    <div class="product-card">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge==='offer'?'OFERTA':p.badge==='new'?'NUEVO':'🔥 HOT'}</span>` : ''}
      <div class="product-img"><img src="${p.img||''}" alt="${p.name||''}" loading="lazy"/></div>
      <div class="product-body">
        <div class="product-name">${p.name||''}</div>
        <div class="product-brand">${p.brand||''}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.old ? `<span class="price-old">$${Number(p.old).toLocaleString('es-AR')}</span>` : ''}
            <span class="price-new"><span class="curr">$</span>${Number(p.price||0).toLocaleString('es-AR')}</span>
          </div>
          <button class="add-btn" onclick="addToCart('${p.id}', event)">+</button>
        </div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   CART
══════════════════════════════════════ */
let cart = {};

function allProds() {
  return [...(window._bestProds||[]), ...(window._newProds||[])];
}

function addToCart(id, e) {
  const p = allProds().find(x => x.id === id);
  if (!p) return;
  cart[id] = cart[id] ? {...cart[id], qty: cart[id].qty + 1} : {...p, qty: 1};
  updateCartUI();
  showToast(`✅ ${p.name} agregado`);
  if (e) {
    const b = e.target;
    b.style.transform = 'scale(1.3)';
    setTimeout(() => b.style.transform = '', 200);
  }
}

function changeQty(id, d) {
  if (!cart[id]) return;
  cart[id].qty += d;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = Object.values(cart).reduce((s,i) => s + i.qty, 0);
  renderCartItems();
}

function renderCartItems() {
  const c     = document.getElementById('drawerItems');
  const f     = document.getElementById('drawerFooter');
  const items = Object.values(cart);

  if (!items.length) {
    c.innerHTML = '<div class="drawer-empty"><div class="empty-icon">🛒</div><p>Tu carrito está vacío.<br>¡Agregá algo rico!</p></div>';
    f.style.display = 'none';
    return;
  }

  c.innerHTML = items.map(i => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${i.img||''}" alt="${i.name||''}"/></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name||''}</div>
        <div class="cart-item-price">$${(Number(i.price||0) * i.qty).toLocaleString('es-AR')}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${i.id}', -1)">−</button>
        <span class="qty-num">${i.qty}</span>
        <button class="qty-btn" onclick="changeQty('${i.id}', 1)">+</button>
      </div>
    </div>`).join('');

  document.getElementById('cartTotal').textContent =
    `$${items.reduce((s,i) => s + Number(i.price||0) * i.qty, 0).toLocaleString('es-AR')}`;
  f.style.display = 'block';
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('drawerOverlay').classList.toggle('open');
}

function checkout() {
  showToast('🎉 Redirigiendo al checkout...');
  setTimeout(() => toggleCart(), 800);
}

/* ══════════════════════════════════════
   THEME
══════════════════════════════════════ */
let theme = localStorage.getItem('lob24theme') || 'dark';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeToggle').textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('lob24theme', t);
  theme = t;
}

function toggleTheme() {
  applyTheme(theme === 'dark' ? 'light' : 'dark');
}

/* ══════════════════════════════════════
   MODAL LOGIN / REGISTRO
══════════════════════════════════════ */
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function switchTab(t) {
  document.getElementById('tabLogin').classList.toggle('active', t === 'login');
  document.getElementById('tabReg').classList.toggle('active', t === 'reg');
  document.getElementById('formLogin').style.display = t === 'login' ? 'block' : 'none';
  document.getElementById('formReg').style.display   = t === 'reg'   ? 'block' : 'none';
}

/* ══════════════════════════════════════
   FORGOT PASSWORD MODAL
══════════════════════════════════════ */

// Abre el modal de recuperación de contraseña (separado del login modal)
function showForgotPassword(e) {
  e.preventDefault();
  // Cerramos el modal de login para no tener dos encima
  closeModal();
  // Mostramos el modal de forgot
  document.getElementById('forgotModal').classList.add('open');
  // Limpiamos estado previo
  document.getElementById('resetEmail').value = '';
  document.getElementById('resetMessage').textContent = '';
  document.getElementById('resetMessage').style.color = '';
}

function closeForgotModal() {
  document.getElementById('forgotModal').classList.remove('open');
}

// Cerrar forgot modal al hacer click en el fondo
document.getElementById('forgotModal').addEventListener('click', function(e) {
  if (e.target === this) closeForgotModal();
});

// Enviar email de recuperación usando Firebase Auth expuesto por el módulo
async function sendResetEmail() {
  const emailInput = document.getElementById('resetEmail');
  const msg        = document.getElementById('resetMessage');
  const email      = emailInput.value.trim();

  if (!email) {
    msg.textContent   = '⚠️ Ingresá un email válido';
    msg.style.color   = '#f87171';
    return;
  }

  // Deshabilitar botón mientras procesa
  const btn = document.getElementById('resetBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  try {
    // Usamos la función expuesta desde el módulo Firebase
    await window.fbSendPasswordReset(email);

    msg.textContent = `📩 Enlace enviado a ${email}. Revisá tu bandeja de entrada.`;
    msg.style.color = '#4ade80';

    // Cerrar automáticamente a los 4 segundos
    setTimeout(() => closeForgotModal(), 4000);

  } catch (error) {
    // Mensajes de error amigables
    const errMap = {
      'auth/user-not-found':    '❌ No existe una cuenta con ese email.',
      'auth/invalid-email':     '❌ El formato del email no es válido.',
      'auth/too-many-requests': '⚠️ Demasiados intentos. Esperá unos minutos.',
    };
    msg.textContent = errMap[error.code] || ('❌ Error: ' + error.message);
    msg.style.color = '#f87171';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar enlace'; }
  }
}

/* ══════════════════════════════════════
   AUTH: REGISTRO
══════════════════════════════════════ */
async function handleRegister() {
  const name  = document.querySelector('#formReg input[placeholder="Juan Pérez"]').value.trim();
  const email = document.querySelector('#formReg input[type="email"]').value.trim();
  const pass  = document.querySelector('#formReg input[type="password"]').value;
  const phone = document.querySelector('#formReg input[type="tel"]').value.trim();

  if (!name || !email || pass.length < 6) {
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
      'auth/weak-password':        '❌ La contraseña es muy débil.',
      'auth/invalid-email':        '❌ El email no es válido.',
    };
    showToast(errMap[error.code] || ('❌ Error: ' + error.message));
  }
}

/* ══════════════════════════════════════
   AUTH: LOGIN
══════════════════════════════════════ */
async function handleLogin() {
  const email = document.querySelector('#formLogin input[type="email"]').value.trim();
  const pass  = document.querySelector('#formLogin input[type="password"]').value;

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
      'auth/user-not-found':  '❌ No existe una cuenta con ese email.',
      'auth/wrong-password':  '❌ Contraseña incorrecta.',
      'auth/invalid-email':   '❌ Email no válido.',
      'auth/too-many-requests':'⚠️ Demasiados intentos. Esperá un momento.',
    };
    showToast(errMap[error.code] || '❌ Credenciales incorrectas');
  }
}

/* ══════════════════════════════════════
   AUTH: LOGOUT
══════════════════════════════════════ */
async function handleLogout() {
  const { auth, signOut } = window.fbAuth;
  await signOut(auth);
  showToast('🚪 Sesión cerrada');
}

/* ══════════════════════════════════════
   USER DROPDOWN
══════════════════════════════════════ */
function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('show');
}

// Cerrar dropdown al hacer click fuera
window.addEventListener('click', function(e) {
  if (!e.target.matches('.user-avatar')) {
    document.querySelectorAll('.user-dropdown').forEach(d => d.classList.remove('show'));
  }
});

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>🐺</span> ${msg}`;
  document.getElementById('toastContainer').appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function handleSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (q) showToast(`🔍 Buscando "${q}"...`);
}

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSearch();
});

/* ══════════════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll('.animate').forEach(el => obs.observe(el));

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
applyTheme(theme);