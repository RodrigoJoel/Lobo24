/* ─── Estado de filtros ─── */
const filters = {
  subcat:  'all',
  search:  '',
  priceMin: 0,
  priceMax: Infinity,
  badges:  new Set(),   // 'offer', 'new', 'hot'
  stock:   'all',       // 'all' | 'in'
  sort:    'default',
};

/* ─── Seleccionar subcategoría ─── */
function selectSubcat(el) {
  document.querySelectorAll('#subcatFilters .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filters.subcat = el.dataset.subcat;
  applyFilters();
}

/* ─── Seleccionar stock ─── */
function selectStock(el) {
  document.querySelectorAll('[data-stock]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filters.stock = el.dataset.stock;
  applyFilters();
}

/* ─── Toggle badge ─── */
function toggleBadge(b) {
  const btn = document.getElementById('badge' + b.charAt(0).toUpperCase() + b.slice(1));
  if (filters.badges.has(b)) { filters.badges.delete(b); btn.classList.remove('active'); }
  else { filters.badges.add(b); btn.classList.add('active'); }
  applyFilters();
}

/* ─── Limpiar filtro individual ─── */
function clearFilter(type) {
  if (type === 'subcat') {
    filters.subcat = 'all';
    document.querySelectorAll('#subcatFilters .filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-subcat="all"]').classList.add('active');
  }
  if (type === 'price') {
    filters.priceMin = 0; filters.priceMax = Infinity;
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
  }
  if (type === 'badge') {
    filters.badges.clear();
    document.querySelectorAll('.filter-badge-btn').forEach(b => b.classList.remove('active'));
  }
  applyFilters();
}

/* ─── Resetear todo ─── */
function resetAllFilters() {
  clearFilter('subcat'); clearFilter('price'); clearFilter('badge');
  filters.stock  = 'all';
  filters.search = '';
  filters.sort   = 'default';
  document.getElementById('catSearch').value = '';
  document.getElementById('sortSelect').value = 'default';
  document.querySelectorAll('[data-stock]').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-stock="all"]').classList.add('active');
  applyFilters();
}

/* ─── Aplicar todos los filtros ─── */
function applyFilters() {
  const all = window._snacksAll || [];

  // Leer búsqueda y sort en tiempo real
  filters.search = (document.getElementById('catSearch')?.value || '').toLowerCase().trim();
  filters.sort   = document.getElementById('sortSelect')?.value || 'default';

  // Leer precio
  const pMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
  const pMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
  filters.priceMin = pMin;
  filters.priceMax = pMax;

  let result = all.filter(p => {
    // Subcategoría
    if (filters.subcat !== 'all' && p.subcat !== filters.subcat) return false;
    // Búsqueda
    if (filters.search) {
      const haystack = `${p.name||''} ${p.brand||''} ${p.subcat||''}`.toLowerCase();
      if (!haystack.includes(filters.search)) return false;
    }
    // Precio
    const price = Number(p.price || 0);
    if (price < filters.priceMin) return false;
    if (filters.priceMax !== Infinity && price > filters.priceMax) return false;
    // Badge
    if (filters.badges.size > 0 && !filters.badges.has(p.badge)) return false;
    // Stock
    if (filters.stock === 'in' && (p.stock === 0 || p.stock == null)) return false;
    return true;
  });

  // Ordenar
  result = sortProducts(result, filters.sort);

  renderProducts(result);
  renderActiveFilterTags();
  document.getElementById('countNum').textContent = result.length;
}

/* ─── Ordenar ─── */
function sortProducts(list, sort) {
  const arr = [...list];
  if (sort === 'price-asc')  return arr.sort((a,b) => (a.price||0)-(b.price||0));
  if (sort === 'price-desc') return arr.sort((a,b) => (b.price||0)-(a.price||0));
  if (sort === 'name-asc')   return arr.sort((a,b) => (a.name||'').localeCompare(b.name||''));
  if (sort === 'stock-desc') return arr.sort((a,b) => (b.stock||0)-(a.stock||0));
  // default: en stock primero, luego sin stock
  return arr.sort((a,b) => {
    const aIn = (a.stock??0) > 0 ? 1 : 0;
    const bIn = (b.stock??0) > 0 ? 1 : 0;
    return bIn - aIn;
  });
}

/* ─── Renderizar productos ─── */
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');

  if (!list.length) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="nr-icon">🔍</div>
        <p>No encontramos snacks con esos filtros.</p>
        <button onclick="resetAllFilters()">Limpiar filtros</button>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const stock     = p.stock ?? null;  // null = sin control de stock (ilimitado)
    const sinStock  = stock !== null && stock <= 0;
    const stockBajo = stock !== null && stock > 0 && stock <= 5;
    const stockOk   = stock === null || stock > 5;

    const stockBadgeHtml = sinStock  ? `<span class="stock-badge out">Sin stock</span>`
                         : stockBajo ? `<span class="stock-badge low">¡Últimas ${stock}!</span>`
                         : '';

    const stockInfoHtml  = sinStock  ? `<span class="stock-info empty">Sin stock</span>`
                         : stockBajo ? `<span class="stock-info low">⚠️ Solo quedan ${stock}</span>`
                         : stock !== null ? `<span class="stock-info">${stock} disponibles</span>`
                         : '';

    return `
      <div class="product-card${sinStock ? ' out-of-stock' : ''}">
        ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge==='offer'?'OFERTA':p.badge==='new'?'NUEVO':'🔥 HOT'}</span>` : ''}
        ${stockBadgeHtml}
        <div class="product-img">
          <img src="${p.img||''}" alt="${p.name||''}" loading="lazy"/>
          <div class="out-overlay">SIN STOCK</div>
        </div>
        <div class="product-body">
          <div class="product-name">${p.name||''}</div>
          <div class="product-brand">${p.brand||''}</div>
          <div class="product-footer">
            <div class="product-price">
              ${p.old ? `<span class="price-old">$${Number(p.old).toLocaleString('es-AR')}</span>` : ''}
              <span class="price-new"><span class="curr">$</span>${Number(p.price||0).toLocaleString('es-AR')}</span>
              ${stockInfoHtml}
            </div>
            <button
              class="add-btn"
              ${sinStock ? 'disabled' : ''}
              onclick="addToCart('${p.docId}', event)"
              title="${sinStock ? 'Sin stock' : 'Agregar al carrito'}"
            >
              ${sinStock ? '✕' : '+'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ─── Tags de filtros activos ─── */
function renderActiveFilterTags() {
  const wrap = document.getElementById('activeFilterTags');
  const tags = [];

  if (filters.subcat !== 'all') {
    const label = document.querySelector(`[data-subcat="${filters.subcat}"] .chip-icon`)?.textContent || '';
    tags.push({ label: label + ' ' + filters.subcat, key: 'subcat' });
  }
  if (filters.search) tags.push({ label: `"${filters.search}"`, key: 'search' });
  if (filters.priceMin > 0 || filters.priceMax !== Infinity) {
    const max = filters.priceMax === Infinity ? '∞' : `$${filters.priceMax}`;
    tags.push({ label: `$${filters.priceMin} — ${max}`, key: 'price' });
  }
  filters.badges.forEach(b => tags.push({ label: b.toUpperCase(), key: `badge-${b}` }));
  if (filters.stock === 'in') tags.push({ label: 'En stock', key: 'stock' });

  wrap.innerHTML = tags.map(t => `
    <span class="active-filter-tag">
      ${t.label}
      <button onclick="removeFilterTag('${t.key}')">✕</button>
    </span>`).join('');
}

function removeFilterTag(key) {
  if (key === 'subcat') clearFilter('subcat');
  else if (key === 'search') { filters.search=''; document.getElementById('catSearch').value=''; applyFilters(); }
  else if (key === 'price') clearFilter('price');
  else if (key.startsWith('badge-')) toggleBadge(key.replace('badge-',''));
  else if (key === 'stock') { filters.stock='all'; document.querySelector('[data-stock="all"]').classList.add('active'); document.querySelector('[data-stock="in"]').classList.remove('active'); applyFilters(); }
}

/* ─── Contadores de subcategorías (SNACKS) ─── */
/* ─── Contadores de subcategorías (SNACKS) ─── */
function updateSubcatCounts(prods) {
  const counts = {};
  prods.forEach(p => { 
    if (p.subcat) {
      counts[p.subcat] = (counts[p.subcat] || 0) + 1;
    }
  });
  
  // Estos valores deben coincidir con los data-subcat del HTML
  const subcats = [
    'papas-fritas',
    'galletitas', 
    'chocolates',
    'gomitas',
    'salados',
    'frutos-secos',
    'barritas',
    'alfajores'
  ];
  
  subcats.forEach(s => {
    const el = document.getElementById('cnt-' + s);
    const n = counts[s] || 0;
    if (el) el.textContent = n;
  });
  
  const allEl = document.getElementById('cnt-all');
  if (allEl) allEl.textContent = prods.length;
  
  // Actualizar contador de subcategorías en el hero
  const heroSubcats = document.getElementById('heroSubcats');
  if (heroSubcats) heroSubcats.textContent = subcats.length;
}

/* ─── Stats del hero ─── */
function updateHeroStats(prods) {
  const totalEl = document.getElementById('heroTotalProds');
  const inStockEl = document.getElementById('heroInStock');
  
  if (totalEl) totalEl.textContent = prods.length;
  if (inStockEl) {
    const inStock = prods.filter(p => p.stock === null || p.stock > 0).length;
    inStockEl.textContent = inStock;
  }
}

/* ─── CART ─── */
let cart = {};

function addToCart(docId, e) {
  const prods = window._snacksAll || [];
  const p = prods.find(x => x.docId === docId);
  if (!p) return;

  const stock = p.stock ?? null;
  if (stock !== null && stock <= 0) {
    showToast('❌ Este snack no tiene stock disponible');
    return;
  }

  // Verificar que no se agregue más de lo que hay en stock
  const enCarrito = cart[docId]?.qty || 0;
  if (stock !== null && enCarrito >= stock) {
    showToast(`⚠️ Solo hay ${stock} unidad${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''}`);
    return;
  }

  cart[docId] = cart[docId]
    ? { ...cart[docId], qty: cart[docId].qty + 1 }
    : { ...p, qty: 1 };

  updateCartUI();
  showToast(`✅ ${p.name} agregado al carrito`);
  if (e) { 
    const b = e.target; 
    b.style.transform='scale(1.3)'; 
    setTimeout(()=>b.style.transform='',200); 
  }
}

function changeQty(docId, d) {
  if (!cart[docId]) return;
  const p = (window._snacksAll||[]).find(x=>x.docId===docId);
  const stock = p?.stock ?? null;

  if (d > 0 && stock !== null && cart[docId].qty >= stock) {
    showToast(`⚠️ No hay más stock disponible`);
    return;
  }

  cart[docId].qty += d;
  if (cart[docId].qty <= 0) delete cart[docId];
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  }
  renderCartItems();
}

function renderCartItems() {
  const c = document.getElementById('drawerItems');
  const f = document.getElementById('drawerFooter');
  const items = Object.values(cart);
  
  if (!items.length) {
    if (c) c.innerHTML = '<div class="drawer-empty"><div class="empty-icon">🛒</div><p>Tu carrito está vacío.</p></div>';
    if (f) f.style.display = 'none';
    return;
  }
  
  if (c) {
    c.innerHTML = items.map(i => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${i.img||''}" alt="${i.name||''}"/></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name||''}</div>
          <div class="cart-item-price">$${(Number(i.price||0)*i.qty).toLocaleString('es-AR')}</div>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${i.docId}',-1)">−</button>
          <span class="qty-num">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty('${i.docId}',1)">+</button>
        </div>
      </div>`).join('');
  }
  
  const cartTotal = document.getElementById('cartTotal');
  if (cartTotal) {
    cartTotal.textContent = `$${items.reduce((s,i)=>s+Number(i.price||0)*i.qty,0).toLocaleString('es-AR')}`;
  }
  if (f) f.style.display = 'block';
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

function checkout() {
  showToast('🎉 Redirigiendo al checkout...');
  setTimeout(()=>toggleCart(), 800);
}

/* ─── Tema ─── */
let theme = localStorage.getItem('lob24theme') || 'dark';
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.textContent = t==='dark'?'🌙':'☀️';
  localStorage.setItem('lob24theme', t);
  theme = t;
}
function toggleTheme() { applyTheme(theme==='dark'?'light':'dark'); }

/* ─── Modal login ─── */
function openModal()  { 
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.add('open');
}
function closeModal() { 
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('open');
}

const modalOverlay = document.getElementById('modalOverlay');
if (modalOverlay) {
  modalOverlay.addEventListener('click', function(e){ if(e.target===this) closeModal(); });
}

function switchTab(t) {
  const tabLogin = document.getElementById('tabLogin');
  const tabReg = document.getElementById('tabReg');
  const formLogin = document.getElementById('formLogin');
  const formReg = document.getElementById('formReg');
  
  if (tabLogin) tabLogin.classList.toggle('active', t==='login');
  if (tabReg) tabReg.classList.toggle('active', t==='reg');
  if (formLogin) formLogin.style.display = t==='login'?'block':'none';
  if (formReg) formReg.style.display = t==='reg'?'block':'none';
}

/* ─── Forgot password ─── */
function showForgotPassword(e) {
  if (e) e.preventDefault();
  closeModal();
  const forgotModal = document.getElementById('forgotModal');
  if (forgotModal) forgotModal.classList.add('open');
  const resetEmail = document.getElementById('resetEmail');
  if (resetEmail) resetEmail.value = '';
  const resetMessage = document.getElementById('resetMessage');
  if (resetMessage) resetMessage.textContent = '';
}

function closeForgotModal() { 
  const modal = document.getElementById('forgotModal');
  if (modal) modal.classList.remove('open');
}

const forgotModal = document.getElementById('forgotModal');
if (forgotModal) {
  forgotModal.addEventListener('click', function(e){ if(e.target===this) closeForgotModal(); });
}

async function sendResetEmail() {
  const email = document.getElementById('resetEmail')?.value.trim();
  const msg = document.getElementById('resetMessage');
  const btn = document.getElementById('resetBtn');
  
  if (!email) { 
    if (msg) { msg.textContent='⚠️ Ingresá un email válido'; msg.style.color='#f87171'; }
    return; 
  }
  
  if (btn) btn.disabled=true;
  if (btn) btn.textContent='Enviando...';
  
  try {
    await window.fbSendPasswordReset(email);
    if (msg) { msg.textContent=`📩 Enlace enviado a ${email}`; msg.style.color='#4ade80'; }
    setTimeout(()=>closeForgotModal(), 4000);
  } catch(err) {
    if (msg) { msg.textContent='❌ Error: '+err.message; msg.style.color='#f87171'; }
  } finally { 
    if (btn) btn.disabled=false;
    if (btn) btn.textContent='Enviar enlace';
  }
}

/* ─── Auth handlers ─── */
async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value;
  
  if (!email||!pass) { 
    showToast('⚠️ Ingresá email y contraseña'); 
    return; 
  }
  
  try {
    const { auth, signInWithEmailAndPassword } = window.fbAuth;
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal(); 
    showToast('👋 ¡Bienvenido de vuelta!');
  } catch { 
    showToast('❌ Credenciales incorrectas'); 
  }
}

async function handleRegister() {
  const name = document.querySelector('#formReg input[placeholder="Juan Pérez"]')?.value.trim();
  const email = document.querySelector('#formReg input[type="email"]')?.value.trim();
  const pass = document.querySelector('#formReg input[type="password"]')?.value;
  const phone = document.querySelector('#formReg input[type="tel"]')?.value.trim();
  
  if (!name||!email||pass.length<6) { 
    showToast('⚠️ Completá todos los datos (contraseña mínimo 6 caracteres)'); 
    return; 
  }
  
  try {
    const { auth, createUserWithEmailAndPassword, db, doc, setDoc } = window.fbAuth;
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db,'users',res.user.uid),{name,email,phone,points:0,createdAt:new Date()});
    closeModal(); 
    showToast('🎉 ¡Cuenta creada exitosamente!');
  } catch(err) { 
    showToast('❌ Error: '+err.message); 
  }
}

async function handleLogout() {
  const { auth, signOut } = window.fbAuth;
  await signOut(auth); 
  showToast('🚪 Sesión cerrada');
}

function toggleUserDropdown() { 
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

window.addEventListener('click', e => {
  if (!e.target.matches('.user-avatar')) {
    document.querySelectorAll('.user-dropdown').forEach(d=>d.classList.remove('show'));
  }
});

/* ─── Búsqueda en categoría ─── */
let searchTimer;
const catSearch = document.getElementById('catSearch');
if (catSearch) {
  catSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 280);
  });
}

/* ─── Búsqueda global (navbar) ─── */
function handleSearch() {
  const q = document.getElementById('searchInput')?.value.trim();
  if (q) {
    const catSearchEl = document.getElementById('catSearch');
    if (catSearchEl) catSearchEl.value = q;
    applyFilters();
    const catSearchBar = document.querySelector('.cat-search-bar');
    if (catSearchBar) catSearchBar.scrollIntoView({ behavior:'smooth', block:'center' });
  }
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter') handleSearch(); });
}

/* ─── Toast ─── */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>🐺</span> ${msg}`;
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(t);
    requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
    setTimeout(()=>{ 
      t.classList.remove('show'); 
      setTimeout(()=>t.remove(),400); 
    }, 3500);
  }
}

/* ─── Exponer funciones globales ─── */
window.selectSubcat = selectSubcat;
window.selectStock = selectStock;
window.toggleBadge = toggleBadge;
window.clearFilter = clearFilter;
window.resetAllFilters = resetAllFilters;
window.applyFilters = applyFilters;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.toggleCart = toggleCart;
window.checkout = checkout;
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
window.removeFilterTag = removeFilterTag;

/* ─── Init ─── */
applyTheme(theme);