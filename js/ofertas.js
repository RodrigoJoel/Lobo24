/* ─────────────────────────────────────
   ESTADO DE FILTROS
───────────────────────────────────── */
const filters = {
  category: 'all',
  search: '',
  priceMin: 0,
  priceMax: Infinity,
  stock: 'all',
  sort: 'default',
};

const CATEGORY_LABELS = {
  bebidas: '🥤 Bebidas',
  snacks: '🍪 Snacks',
  almacen: '🍝 Almacén',
  higiene: '🧼 Higiene',
  limpieza: '🧴 Limpieza',
  congelados: '🧊 Congelados',
  lacteos: '🧀 Lácteos',
  panaderia: '🍞 Panadería',
  mascotas: '🐾 Mascotas',
};

/* ─────────────────────────────────────
   PAGINACIÓN / MOSTRAR MÁS
───────────────────────────────────── */
const PRODUCTS_PER_PAGE = 12;
let visibleProductsLimit = PRODUCTS_PER_PAGE;
let lastFilteredProducts = [];

/* ─────────────────────────────────────
   FILTROS
───────────────────────────────────── */
function selectCategory(el) {
  document.querySelectorAll('#categoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filters.category = el.dataset.category;
  applyFilters();
}

function selectStock(el) {
  document.querySelectorAll('[data-stock]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filters.stock = el.dataset.stock;
  applyFilters();
}

function clearFilter(type) {
  if (type === 'category') {
    filters.category = 'all';
    document.querySelectorAll('#categoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-category="all"]')?.classList.add('active');
  }

  if (type === 'price') {
    filters.priceMin = 0;
    filters.priceMax = Infinity;

    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');

    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
  }

  applyFilters();
}

function resetAllFilters() {
  clearFilter('category');
  clearFilter('price');

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
  const all = window._ofertasAll || [];

  filters.search = (document.getElementById('catSearch')?.value || '').toLowerCase().trim();
  filters.sort = document.getElementById('sortSelect')?.value || 'default';

  const pMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
  const pMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;

  filters.priceMin = pMin;
  filters.priceMax = pMax;

  let result = all.filter(p => {
    if (filters.category !== 'all' && p.coleccion !== filters.category) return false;

    if (filters.search) {
      const haystack = `${p.name || ''} ${p.brand || ''} ${p.subcat || ''}`.toLowerCase();
      if (!haystack.includes(filters.search)) return false;
    }

    const price = Number(p.price || 0);

    if (price < filters.priceMin) return false;
    if (filters.priceMax !== Infinity && price > filters.priceMax) return false;

    if (filters.stock === 'in' && (p.stock === 0 || p.stock == null)) return false;

    return true;
  });

  result = sortProducts(result, filters.sort);

  visibleProductsLimit = PRODUCTS_PER_PAGE;
  lastFilteredProducts = result;

  renderProducts(result);
  renderActiveFilterTags();
  renderLoadMoreButton(result.length);

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
   RENDER DE PRODUCTOS
───────────────────────────────────── */
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="nr-icon">🔍</div>
        <p>No encontramos ofertas con esos filtros.</p>
        <button onclick="resetAllFilters()">Limpiar filtros</button>
      </div>`;

    renderLoadMoreButton(0);
    return;
  }

  const visibleList = list.slice(0, visibleProductsLimit);

  grid.innerHTML = visibleList.map(p => {
    const stock = p.stock ?? null;
    const sinStock = stock !== null && stock <= 0;
    const stockBajo = stock !== null && stock > 0 && stock <= 5;

    const stockBadgeHtml = sinStock
      ? `<span class="stock-badge out">Sin stock</span>`
      : stockBajo
        ? `<span class="stock-badge low">¡Últimas ${stock}!</span>`
        : '';

    // Comentado a pedido de Rodrigo: no mostrar la cantidad disponible por ahora.
    const stockInfoHtml = ''; /* sinStock
      ? `<span class="stock-info empty">Sin stock</span>`
      : stockBajo
        ? `<span class="stock-info low">⚠️ Solo quedan ${stock}</span>`
        : stock !== null
          ? `<span class="stock-info">${stock} disponibles</span>`
          : ''; */

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
   BOTÓN MOSTRAR MÁS
───────────────────────────────────── */
function renderLoadMoreButton(totalProducts) {
  let wrap = document.getElementById('loadMoreWrap');

  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'loadMoreWrap';
    wrap.className = 'load-more-wrap';

    const grid = document.getElementById('productsGrid');
    if (grid) grid.insertAdjacentElement('afterend', wrap);
  }

  if (!wrap) return;

  if (totalProducts <= visibleProductsLimit) {
    wrap.innerHTML = '';
    return;
  }

  const remaining = totalProducts - visibleProductsLimit;

  wrap.innerHTML = `
    <button class="load-more-btn" onclick="loadMoreProducts()">
      Mostrar más productos
      <span>Quedan ${remaining}</span>
    </button>
  `;
}

function loadMoreProducts() {
  visibleProductsLimit += PRODUCTS_PER_PAGE;

  renderProducts(lastFilteredProducts);
  renderLoadMoreButton(lastFilteredProducts.length);
}

/* ─────────────────────────────────────
   TAGS DE FILTROS ACTIVOS
───────────────────────────────────── */
function renderActiveFilterTags() {
  const wrap = document.getElementById('activeFilterTags');
  if (!wrap) return;

  const tags = [];

  if (filters.category !== 'all') {
    tags.push({ label: CATEGORY_LABELS[filters.category] || filters.category, key: 'category' });
  }

  if (filters.search) tags.push({ label: `"${filters.search}"`, key: 'search' });

  if (filters.priceMin > 0 || filters.priceMax !== Infinity) {
    const max = filters.priceMax === Infinity ? '∞' : `$${filters.priceMax}`;
    tags.push({ label: `$${filters.priceMin} — ${max}`, key: 'price' });
  }

  if (filters.stock === 'in') tags.push({ label: 'En stock', key: 'stock' });

  wrap.innerHTML = tags.map(t => `
    <span class="active-filter-tag">
      ${t.label}
      <button onclick="removeFilterTag('${t.key}')">✕</button>
    </span>
  `).join('');
}

function removeFilterTag(key) {
  if (key === 'category') {
    clearFilter('category');
  } else if (key === 'search') {
    filters.search = '';
    const catSearch = document.getElementById('catSearch');
    if (catSearch) catSearch.value = '';
    applyFilters();
  } else if (key === 'price') {
    clearFilter('price');
  } else if (key === 'stock') {
    filters.stock = 'all';
    document.querySelector('[data-stock="all"]')?.classList.add('active');
    document.querySelector('[data-stock="in"]')?.classList.remove('active');
    applyFilters();
  }
}

/* ─────────────────────────────────────
   CONTADORES DE CATEGORÍAS
───────────────────────────────────── */
function updateCategoryCounts(prods) {
  const counts = {};

  prods.forEach(p => {
    if (p.coleccion) {
      counts[p.coleccion] = (counts[p.coleccion] || 0) + 1;
    }
  });

  Object.keys(CATEGORY_LABELS).forEach(slug => {
    const el = document.getElementById('cnt-' + slug);
    const n = counts[slug] || 0;
    if (el) el.textContent = n;
  });

  const allEl = document.getElementById('cnt-all');
  if (allEl) allEl.textContent = prods.length;
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
   BÚSQUEDA DE LA CATEGORÍA
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
window.selectCategory = selectCategory;
window.selectStock = selectStock;
window.clearFilter = clearFilter;
window.resetAllFilters = resetAllFilters;
window.applyFilters = applyFilters;
window.removeFilterTag = removeFilterTag;
window.loadMoreProducts = loadMoreProducts;

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
applyFilters();