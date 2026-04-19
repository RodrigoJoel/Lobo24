/* ─────────────────────────────────────
   ESTADO DE FILTROS
───────────────────────────────────── */
const filters = {
  subcat: 'all',
  search: '',
  priceMin: 0,
  priceMax: Infinity,
  badges: new Set(),
  stock: 'all',
  sort: 'default',
};

/* ─────────────────────────────────────
   FILTROS
───────────────────────────────────── */
function selectSubcat(el) {
  document.querySelectorAll('#subcatFilters .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filters.subcat = el.dataset.subcat;
  applyFilters();
}

function selectStock(el) {
  document.querySelectorAll('[data-stock]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filters.stock = el.dataset.stock;
  applyFilters();
}

function toggleBadge(b) {
  const btn = document.getElementById('badge' + b.charAt(0).toUpperCase() + b.slice(1));
  if (!btn) return;

  if (filters.badges.has(b)) {
    filters.badges.delete(b);
    btn.classList.remove('active');
  } else {
    filters.badges.add(b);
    btn.classList.add('active');
  }

  applyFilters();
}

function clearFilter(type) {
  if (type === 'subcat') {
    filters.subcat = 'all';
    document.querySelectorAll('#subcatFilters .filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-subcat="all"]')?.classList.add('active');
  }

  if (type === 'price') {
    filters.priceMin = 0;
    filters.priceMax = Infinity;
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
  }

  if (type === 'badge') {
    filters.badges.clear();
    document.querySelectorAll('.filter-badge-btn').forEach(b => b.classList.remove('active'));
  }

  applyFilters();
}

function resetAllFilters() {
  clearFilter('subcat');
  clearFilter('price');
  clearFilter('badge');

  filters.stock = 'all';
  filters.search = '';
  filters.sort = 'default';

  const catSearch = document.getElementById('catSearch');
  const sortSelect = document.getElementById('sortSelect');

  if (catSearch) catSearch.value = '';
  if (sortSelect) sortSelect.value = 'default';

  document.querySelectorAll('[data-stock]').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-stock="all"]')?.classList.add('active');

  applyFilters();
}

function applyFilters() {
  const all = window._snacksAll || [];

  filters.search = (document.getElementById('catSearch')?.value || '').toLowerCase().trim();
  filters.sort = document.getElementById('sortSelect')?.value || 'default';

  const pMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
  const pMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
  filters.priceMin = pMin;
  filters.priceMax = pMax;

  let result = all.filter(p => {
    if (filters.subcat !== 'all' && p.subcat !== filters.subcat) return false;

    if (filters.search) {
      const haystack = `${p.name || ''} ${p.brand || ''} ${p.subcat || ''}`.toLowerCase();
      if (!haystack.includes(filters.search)) return false;
    }

    const price = Number(p.price || 0);
    if (price < filters.priceMin) return false;
    if (filters.priceMax !== Infinity && price > filters.priceMax) return false;

    if (filters.badges.size > 0 && !filters.badges.has(p.badge)) return false;

    if (filters.stock === 'in' && (p.stock === 0 || p.stock == null)) return false;

    return true;
  });

  result = sortProducts(result, filters.sort);

  renderProducts(result);
  renderActiveFilterTags();

  const countNum = document.getElementById('countNum');
  if (countNum) countNum.textContent = result.length;
}

function sortProducts(list, sort) {
  const arr = [...list];

  if (sort === 'price-asc') return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === 'price-desc') return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === 'name-asc') return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  if (sort === 'stock-desc') return arr.sort((a, b) => (b.stock || 0) - (a.stock || 0));

  return arr.sort((a, b) => {
    const aIn = (a.stock ?? 0) > 0 ? 1 : 0;
    const bIn = (b.stock ?? 0) > 0 ? 1 : 0;
    return bIn - aIn;
  });
}

/* ─────────────────────────────────────
   PRODUCTOS
───────────────────────────────────── */
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

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
    const stock = p.stock ?? null;
    const sinStock = stock !== null && stock <= 0;
    const stockBajo = stock !== null && stock > 0 && stock <= 5;

    const stockBadgeHtml = sinStock
      ? `<span class="stock-badge out">Sin stock</span>`
      : stockBajo
        ? `<span class="stock-badge low">¡Últimas ${stock}!</span>`
        : '';

    const stockInfoHtml = sinStock
      ? `<span class="stock-info empty">Sin stock</span>`
      : stockBajo
        ? `<span class="stock-info low">⚠️ Solo quedan ${stock}</span>`
        : stock !== null
          ? `<span class="stock-info">${stock} disponibles</span>`
          : '';

    const id = p.docId || p.id || '';

    return `
      <div class="product-card${sinStock ? ' out-of-stock' : ''}">
        ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'offer' ? 'OFERTA' : p.badge === 'new' ? 'NUEVO' : '🔥 HOT'}</span>` : ''}
        ${stockBadgeHtml}
        <div class="product-img">
          <img src="${p.img || ''}" alt="${p.name || ''}" loading="lazy"/>
          <div class="out-overlay">SIN STOCK</div>
        </div>
        <div class="product-body">
          <div class="product-name">${p.name || ''}</div>
          <div class="product-brand">${p.brand || ''}</div>
          <div class="product-footer">
            <div class="product-price">
              ${p.old ? `<span class="price-old">$${Number(p.old).toLocaleString('es-AR')}</span>` : ''}
              <span class="price-new"><span class="curr">$</span>${Number(p.price || 0).toLocaleString('es-AR')}</span>
              ${stockInfoHtml}
            </div>
            <button
              class="add-btn"
              ${sinStock ? 'disabled' : ''}
              onclick="addToCart('${id}', event)"
              title="${sinStock ? 'Sin stock' : 'Agregar al carrito'}"
            >
              ${sinStock ? '✕' : '+'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────
   TAGS ACTIVOS
───────────────────────────────────── */
function renderActiveFilterTags() {
  const wrap = document.getElementById('activeFilterTags');
  if (!wrap) return;

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
    </span>
  `).join('');
}

function removeFilterTag(key) {
  if (key === 'subcat') {
    clearFilter('subcat');
  } else if (key === 'search') {
    filters.search = '';
    const catSearch = document.getElementById('catSearch');
    if (catSearch) catSearch.value = '';
    applyFilters();
  } else if (key === 'price') {
    clearFilter('price');
  } else if (key.startsWith('badge-')) {
    toggleBadge(key.replace('badge-', ''));
  } else if (key === 'stock') {
    filters.stock = 'all';
    document.querySelector('[data-stock="all"]')?.classList.add('active');
    document.querySelector('[data-stock="in"]')?.classList.remove('active');
    applyFilters();
  }
}

/* ─────────────────────────────────────
   CONTADORES DE SUBCATEGORÍAS
───────────────────────────────────── */
function updateSubcatCounts(prods) {
  const counts = {};

  prods.forEach(p => {
    if (p.subcat) {
      counts[p.subcat] = (counts[p.subcat] || 0) + 1;
    }
  });

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

  const heroSubcats = document.getElementById('heroSubcats');
  if (heroSubcats) heroSubcats.textContent = subcats.length;
}

/* ─────────────────────────────────────
   STATS HERO
───────────────────────────────────── */
function updateHeroStats(prods) {
  const totalEl = document.getElementById('heroTotalProds');
  const inStockEl = document.getElementById('heroInStock');

  if (totalEl) totalEl.textContent = prods.length;

  if (inStockEl) {
    const inStock = prods.filter(p => p.stock === null || p.stock > 0).length;
    inStockEl.textContent = inStock;
  }
}

/* ─────────────────────────────────────
   BÚSQUEDA DE CATEGORÍA
───────────────────────────────────── */
let searchTimer;
const catSearch = document.getElementById('catSearch');

if (catSearch) {
  catSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 280);
  });
}

/* ─────────────────────────────────────
   EXPORTS DE LA SECCIÓN
───────────────────────────────────── */
window.selectSubcat = selectSubcat;
window.selectStock = selectStock;
window.toggleBadge = toggleBadge;
window.clearFilter = clearFilter;
window.resetAllFilters = resetAllFilters;
window.applyFilters = applyFilters;
window.removeFilterTag = removeFilterTag;

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
applyFilters();