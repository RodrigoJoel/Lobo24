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
  clearInterval(ctimer); ctimer = setInterval(()=>carouselMove(1),5000);
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
  if (!list.length) { g.innerHTML = '<p style="color:var(--muted);padding:20px">Sin productos cargados.</p>'; return; }
  g.innerHTML = list.map(p => `
    <div class="product-card">
      ${p.badge?`<span class="product-badge badge-${p.badge}">${p.badge==='offer'?'OFERTA':p.badge==='new'?'NUEVO':'🔥 HOT'}</span>`:''}
      <div class="product-img"><img src="${p.img||''}" alt="${p.name||''}" loading="lazy"/></div>
      <div class="product-body">
        <div class="product-name">${p.name||''}</div>
        <div class="product-brand">${p.brand||''}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.old?`<span class="price-old">$${Number(p.old).toLocaleString('es-AR')}</span>`:''}
            <span class="price-new"><span class="curr">$</span>${Number(p.price||0).toLocaleString('es-AR')}</span>
          </div>
          <button class="add-btn" onclick="addToCart('${p.id}',event)">+</button>
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
  cart[id] = cart[id] ? {...cart[id], qty: cart[id].qty+1} : {...p, qty:1};
  updateCartUI();
  showToast(`✅ ${p.name} agregado`);
  if(e){ const b=e.target; b.style.transform='scale(1.3)'; setTimeout(()=>b.style.transform='',200); }
}

function changeQty(id, d) {
  if (!cart[id]) return;
  cart[id].qty += d;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI(); renderCartItems();
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  renderCartItems();
}

function renderCartItems() {
  const c = document.getElementById('drawerItems');
  const f = document.getElementById('drawerFooter');
  const items = Object.values(cart);
  if (!items.length) {
    c.innerHTML = '<div class="drawer-empty"><div class="empty-icon">🛒</div><p>Tu carrito está vacío.<br>¡Agregá algo rico!</p></div>';
    f.style.display = 'none'; return;
  }
  c.innerHTML = items.map(i=>`
    <div class="cart-item">
      <div class="cart-item-img"><img src="${i.img||''}" alt="${i.name||''}"/></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name||''}</div>
        <div class="cart-item-price">$${(Number(i.price||0)*i.qty).toLocaleString('es-AR')}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${i.id}',-1)">−</button>
        <span class="qty-num">${i.qty}</span>
        <button class="qty-btn" onclick="changeQty('${i.id}',1)">+</button>
      </div>
    </div>`).join('');
  document.getElementById('cartTotal').textContent = `$${items.reduce((s,i)=>s+Number(i.price||0)*i.qty,0).toLocaleString('es-AR')}`;
  f.style.display = 'block';
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('drawerOverlay').classList.toggle('open');
}
function checkout() { showToast('🎉 Redirigiendo al checkout...'); setTimeout(()=>toggleCart(),800); }

/* ══════════════════════════════════════
   THEME
══════════════════════════════════════ */
let theme = localStorage.getItem('lob24theme') || 'dark';
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeToggle').textContent = t==='dark'?'🌙':'☀️';
  localStorage.setItem('lob24theme', t);
  theme = t;
}
function toggleTheme() { applyTheme(theme==='dark'?'light':'dark'); }

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
function openModal()  { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
document.getElementById('modalOverlay').addEventListener('click', function(e){ if(e.target===this)closeModal(); });
function switchTab(t) {
  document.getElementById('tabLogin').classList.toggle('active', t==='login');
  document.getElementById('tabReg').classList.toggle('active', t==='reg');
  document.getElementById('formLogin').style.display = t==='login'?'block':'none';
  document.getElementById('formReg').style.display   = t==='reg'?'block':'none';
}
function handleLogin()    { closeModal(); showToast('👋 ¡Bienvenido de vuelta!'); }
function handleRegister() { closeModal(); showToast('🎉 ¡Cuenta creada con éxito!'); }

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg) {
  const t = document.createElement('div'); t.className='toast';
  t.innerHTML = `<span>🐺</span> ${msg}`;
  document.getElementById('toastContainer').appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),400); }, 3000);
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function handleSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (q) showToast(`🔍 Buscando "${q}"...`);
}
document.getElementById('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter')handleSearch(); });

/* ══════════════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════════════ */
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
},{ threshold:.08 });
document.querySelectorAll('.animate').forEach(el=>obs.observe(el));

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
applyTheme(theme);
// --- REGISTRO ---
async function handleRegister() {
    const name = document.querySelector('#formReg input[placeholder="Juan Pérez"]').value;
    const email = document.querySelector('#formReg input[type="email"]').value;
    const pass = document.querySelector('#formReg input[type="password"]').value;
    const phone = document.querySelector('#formReg input[type="tel"]').value;

    if(!name || !email || pass.length < 6) {
        showToast("⚠️ Completa los datos (mínimo 6 caracteres de clave)");
        return;
    }

    try {
        const { auth, createUserWithEmailAndPassword, db, doc, setDoc } = window.fbAuth;
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        
        // Guardar datos extra en Firestore
        await setDoc(doc(db, "users", res.user.uid), {
            name: name,
            email: email,
            phone: phone,
            points: 0,
            createdAt: new Date()
        });

        closeModal();
        showToast("🎉 ¡Cuenta creada con éxito!");
    } catch (error) {
        showToast("❌ Error: " + error.message);
    }
}

// --- LOGIN ---
async function handleLogin() {
    const email = document.querySelector('#formLogin input[type="email"]').value;
    const pass = document.querySelector('#formLogin input[type="password"]').value;

    try {
        const { auth, signInWithEmailAndPassword } = window.fbAuth;
        await signInWithEmailAndPassword(auth, email, pass);
        closeModal();
        showToast("👋 ¡Bienvenido de vuelta!");
    } catch (error) {
        showToast("❌ Credenciales incorrectas");
    }
}

// --- LOGOUT ---
async function handleLogout() {
    const { auth, signOut } = window.fbAuth;
    await signOut(auth);
    showToast("🚪 Sesión cerrada");
}

// --- DROPDOWN ---
function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Cerrar dropdown si se hace click afuera
window.onclick = function(event) {
    if (!event.target.matches('.user-avatar')) {
        const dropdowns = document.getElementsByClassName("user-dropdown");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) dropdowns[i].classList.remove('show');
        }
    }
}