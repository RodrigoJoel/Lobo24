/* ══════════════════════════════════════
   BUSCADOR DE TODA LA TIENDA (buscar.html)
   El catálogo de las 11 categorías lo carga el módulo de Firebase de la página
   y lo deja en window._<categoria>All, igual que cada página de categoría;
   por eso addToCart() de app-global.js funciona acá sin cambios.
══════════════════════════════════════ */

const SEARCH_CATEGORIES = [
  { slug: 'bebidas', label: 'Bebidas', icon: 'fa-bottle-water' },
  { slug: 'snacks', label: 'Snacks', icon: 'fa-cookie-bite' },
  { slug: 'almacen', label: 'Almacén', icon: 'fa-basket-shopping' },
  { slug: 'higiene', label: 'Higiene', icon: 'fa-pump-soap' },
  { slug: 'limpieza', label: 'Limpieza', icon: 'fa-spray-can-sparkles' },
  { slug: 'congelados', label: 'Congelados', icon: 'fa-snowflake' },
  { slug: 'lacteos', label: 'Lácteos', icon: 'fa-cheese' },
  { slug: 'panaderia', label: 'Panadería', icon: 'fa-bread-slice' },
  { slug: 'mascotas', label: 'Mascotas', icon: 'fa-paw' },
  { slug: 'perfumeria', label: 'Perfumería', icon: 'fa-bottle-droplet' },
  { slug: 'bazar', label: 'Bazar', icon: 'fa-utensils' }
];
const CATEGORY_LABEL = Object.fromEntries(SEARCH_CATEGORIES.map(c => [c.slug, c.label]));

const WHATSAPP_URL = 'https://api.whatsapp.com/message/UOEZNW4JNST4C1?autoload=1&app_absent=0&utm_source=ig';
const PRODUCTS_PER_PAGE = 24;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 80;

const state = {
  query: '',
  category: 'all',
  sort: 'default',
  limit: PRODUCTS_PER_PAGE,
  results: []
};
let typingTimer;

/* ─────────────────────────────────────
   CATÁLOGO
───────────────────────────────────── */
const loadedSlugs = new Set();
const failedSlugs = new Set();
let catalogIndex = [];
let catalogTimer;

// El catálogo se pide recién cuando hay algo para buscar.
function requestCatalog() {
  window._catalogWanted = true;
  if (typeof window.startCatalog === 'function') window.startCatalog();
}

function catalogReady() {
  return loadedSlugs.size === SEARCH_CATEGORIES.length;
}

// Lo llama el módulo de Firebase cada vez que llega o cambia una categoría.
function onCatalogUpdate(slug, error) {
  loadedSlugs.add(slug);
  if (error) failedSlugs.add(slug);
  else failedSlugs.delete(slug);

  if (!catalogReady()) return;

  clearTimeout(catalogTimer);
  catalogTimer = setTimeout(() => {
    buildIndex();
    update();
  }, 120);
}

function buildIndex() {
  catalogIndex = SEARCH_CATEGORIES.flatMap(cat =>
    (window['_' + cat.slug + 'All'] || []).map(p => {
      const name = normalizeText(p.name);
      const brand = normalizeText(p.brand);
      const haystack = `${name} ${brand} ${normalizeText(p.subcat).replace(/-/g, ' ')} ${normalizeText(cat.label)}`;
      return {
        p,
        name,
        brand,
        haystack,
        words: toWords(name),
        allWords: toWords(haystack)
      };
    })
  );
}

/* ─────────────────────────────────────
   BÚSQUEDA
───────────────────────────────────── */
const STOPWORDS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'con', 'para', 'por', 'en', 'y', 'un', 'una']);

// Minúsculas y sin tildes: "almacen" encuentra "Almacén".
function normalizeText(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Se compara sin el plural: "gaseosas" encuentra "Gaseosa", "panes" encuentra "Pan".
function singular(word) {
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function toWords(text) {
  return text.split(/[^a-z0-9]+/).filter(Boolean);
}

function queryTokens(query) {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  const useful = words.filter(w => !STOPWORDS.has(w));
  return (useful.length ? useful : words).map(singular);
}

function scoreEntry(entry, tokens, phrase) {
  let score = 0;

  if (entry.name.startsWith(phrase)) score += 100;
  else if (entry.name.includes(phrase)) score += 60;

  tokens.forEach(t => {
    if (entry.words.some(w => w.startsWith(t))) score += 20;
    else if (entry.name.includes(t)) score += 10;
    else if (entry.brand.includes(t)) score += 8;
    else score += 2;
  });

  return score;
}

function searchCatalog(query) {
  const tokens = queryTokens(query);
  const phrase = normalizeText(query).trim();
  if (!tokens.length) return { matches: [], partial: false };

  const complete = catalogIndex.filter(entry => tokens.every(t => entry.haystack.includes(t)));

  if (complete.length || tokens.length < 2) {
    return {
      matches: complete.map(entry => ({ p: entry.p, score: scoreEntry(entry, tokens, phrase) })),
      partial: false
    };
  }

  // Ningún producto tiene todas las palabras ("yerba mate"): se muestran los que tienen
  // más de ellas. Acá la palabra tiene que empezar igual, para que "mate" no traiga
  // "tomate", y los números o medidas sueltas ("1", "lt") no cuentan.
  const keywords = tokens.filter(t => t.length > 2 && !/^\d+$/.test(t));
  const required = keywords.length ? keywords : tokens;
  const startsWord = (entry, t) => entry.allWords.some(w => w.startsWith(t));

  const partial = catalogIndex
    .map(entry => ({ entry, hits: required.filter(t => startsWord(entry, t)).length }))
    .filter(x => x.hits > 0);
  const best = Math.max(0, ...partial.map(x => x.hits));

  return {
    matches: partial
      .filter(x => x.hits === best)
      .map(x => ({ p: x.entry.p, score: scoreEntry(x.entry, tokens, phrase) })),
    partial: true
  };
}

function inStock(p) {
  return p.stock == null || Number(p.stock) > 0;
}

function sortResults(list, sort) {
  const arr = [...list];
  const byName = (a, b) => (a.p.name || '').localeCompare(b.p.name || '', 'es');

  if (sort === 'price-asc') return arr.sort((a, b) => (a.p.price || 0) - (b.p.price || 0));
  if (sort === 'price-desc') return arr.sort((a, b) => (b.p.price || 0) - (a.p.price || 0));
  if (sort === 'name-asc') return arr.sort(byName);

  // Relevancia: primero lo que hay en stock, después lo que más se parece a lo buscado.
  return arr.sort((a, b) =>
    (inStock(b.p) - inStock(a.p)) || (b.score - a.score) || byName(a, b)
  );
}

/* ─────────────────────────────────────
   RENDER
───────────────────────────────────── */
function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plural(n, one, many) {
  return `${n.toLocaleString('es-AR')} ${n === 1 ? one : many}`;
}

function setHeading(query) {
  const title = document.getElementById('searchTitle');
  if (!title) return;

  title.textContent = query ? 'Resultados para ' : 'Buscar en ';
  const em = document.createElement('em');
  em.textContent = query ? `«${query}»` : 'Lobo24';
  title.appendChild(em);

  document.title = query ? `«${query}» — Buscar en Lobo24` : 'Lobo24 — Buscar';
}

function setSummary(text) {
  const summary = document.getElementById('searchSummary');
  if (summary) summary.textContent = text;
}

function categoryShortcuts() {
  const cards = [...SEARCH_CATEGORIES, { slug: 'ofertas', label: 'Ofertas', icon: 'fa-tags' }].map(c => `
    <a class="category-card" href="${c.slug}.html">
      <div class="cat-emoji"><i class="fa-solid ${c.icon}"></i></div>
      <div class="cat-text"><div class="cat-name">${c.label}</div></div>
    </a>`).join('');

  return `
    <h2 class="search-sub">Explorá por categoría</h2>
    <div class="categories-grid">${cards}</div>`;
}

// Estados sin grilla: sin texto, sin resultados o sin conexión.
function showMessage(kind) {
  const box = document.getElementById('searchState');
  const grid = document.getElementById('productsGrid');
  const bar = document.getElementById('searchBar');
  const more = document.getElementById('loadMoreWrap');
  if (!box || !grid) return;

  let message = '';

  if (kind === 'empty') {
    message = `
      <div class="search-msg">
        <div class="nr-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <h2>No encontramos «${esc(state.query)}»</h2>
        <p>Probá con menos palabras, con la marca o con el tipo de producto, por ejemplo «gaseosa» o «arroz».</p>
        <a class="search-help" href="${WHATSAPP_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>Consultanos por WhatsApp</a>
      </div>`;
  }

  if (kind === 'error') {
    message = `
      <div class="search-msg">
        <div class="nr-icon"><i class="fa-solid fa-wifi"></i></div>
        <h2>No pudimos cargar los productos</h2>
        <p>Revisá tu conexión y volvé a intentar.</p>
        <button class="search-retry" onclick="location.reload()">Reintentar</button>
      </div>`;
  }

  box.innerHTML = message + categoryShortcuts();
  box.hidden = false;
  grid.hidden = true;
  if (bar) bar.hidden = true;
  if (more) more.innerHTML = '';
}

function showGrid() {
  const box = document.getElementById('searchState');
  const grid = document.getElementById('productsGrid');
  if (box) box.hidden = true;
  if (grid) grid.hidden = false;
}

function showSkeletons() {
  const grid = document.getElementById('productsGrid');
  const bar = document.getElementById('searchBar');
  const more = document.getElementById('loadMoreWrap');
  if (!grid) return;

  showGrid();
  if (bar) bar.hidden = true;
  if (more) more.innerHTML = '';
  grid.innerHTML = Array(12).fill(
    '<div class="skeleton"><div class="sk-img"></div><div class="sk-body"><div class="sk-line"></div><div class="sk-line short"></div><div class="sk-line price"></div></div></div>'
  ).join('');
}

function renderCategoryChips(matches) {
  const wrap = document.getElementById('searchCats');
  if (!wrap) return;

  const counts = {};
  matches.forEach(m => { counts[m.p.coleccion] = (counts[m.p.coleccion] || 0) + 1; });

  const cats = SEARCH_CATEGORIES
    .filter(c => counts[c.slug])
    .sort((a, b) => counts[b.slug] - counts[a.slug]);

  // Con una sola categoría no hay nada que filtrar.
  if (cats.length < 2) {
    wrap.innerHTML = '';
    return;
  }

  const chip = (slug, label, count) => `
    <button type="button" class="search-chip${state.category === slug ? ' active' : ''}" aria-pressed="${state.category === slug}" onclick="selectSearchCategory('${slug}')">
      ${label}<span class="chip-count">${count}</span>
    </button>`;

  wrap.innerHTML = chip('all', 'Todas', matches.length) + cats.map(c => chip(c.slug, c.label, counts[c.slug])).join('');
}

function productCard(p) {
  const stock = p.stock ?? null;
  const sinStock = stock !== null && stock <= 0;
  const badge = p.badge === 'offer' ? 'OFERTA' : p.badge === 'new' ? 'NUEVO' : 'HOT';

  return `
    <div class="product-card${sinStock ? ' out-of-stock' : ''}">
      ${p.badge ? `<span class="product-badge badge-${esc(p.badge)}">${badge}</span>` : ''}
      ${sinStock ? '<span class="stock-badge out">Sin stock</span>' : ''}

      <div class="product-img">
        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"/>
        <div class="out-overlay">SIN STOCK</div>
      </div>

      <div class="product-body">
        <div class="product-name">${esc(p.name)}</div>
        <div class="product-brand">${esc(p.brand)}</div>

        <div class="product-footer">
          <div class="product-price">
            ${p.old ? `<span class="price-old">$${Number(p.old).toLocaleString('es-AR')}</span>` : ''}
            <span class="price-new"><span class="curr">$</span>${Number(p.price || 0).toLocaleString('es-AR')}</span>
          </div>

          <button
            class="add-btn"
            ${sinStock ? 'disabled' : ''}
            onclick="addToCart('${esc(p.docId || p.id)}', event)"
            title="${sinStock ? 'Sin stock' : 'Agregar al carrito'}"
          >
            ${sinStock ? '✕' : '+'}
          </button>
        </div>
      </div>
    </div>`;
}

function renderResults() {
  const grid = document.getElementById('productsGrid');
  const more = document.getElementById('loadMoreWrap');
  if (!grid) return;

  grid.innerHTML = state.results.slice(0, state.limit).map(m => productCard(m.p)).join('');

  if (!more) return;

  const remaining = state.results.length - state.limit;
  more.innerHTML = remaining > 0 ? `
    <button class="load-more-btn" onclick="loadMoreResults()">
      Mostrar más productos
      <span>Quedan ${remaining}</span>
    </button>` : '';
}

function update() {
  const query = state.query;
  setHeading(query);

  if (query.length < MIN_QUERY_LENGTH) {
    setSummary(query
      ? `Escribí al menos ${MIN_QUERY_LENGTH} letras para buscar.`
      : 'Escribí arriba lo que necesitás: un producto, una marca o un tipo de producto.');
    showMessage('start');
    return;
  }

  if (!catalogReady()) {
    requestCatalog();
    setSummary('Buscando en toda la tienda…');
    showSkeletons();
    return;
  }

  if (failedSlugs.size === SEARCH_CATEGORIES.length) {
    setSummary('');
    showMessage('error');
    return;
  }

  const { matches, partial } = searchCatalog(query);

  if (!matches.length) {
    setSummary('Ningún producto coincide con lo que escribiste.');
    showMessage('empty');
    return;
  }

  const categories = new Set(matches.map(m => m.p.coleccion));
  if (state.category !== 'all' && !categories.has(state.category)) state.category = 'all';

  const found = categories.size > 1
    ? `${plural(matches.length, 'producto', 'productos')} en ${categories.size} categorías`
    : `${plural(matches.length, 'producto', 'productos')} en ${CATEGORY_LABEL[[...categories][0]]}`;

  setSummary(partial
    ? `No hay productos con todas esas palabras. Los más parecidos: ${found}.`
    : `${found}.`);

  const visible = state.category === 'all' ? matches : matches.filter(m => m.p.coleccion === state.category);
  state.results = sortResults(visible, state.sort);

  const bar = document.getElementById('searchBar');
  if (bar) bar.hidden = false;

  showGrid();
  renderCategoryChips(matches);
  renderResults();
}

/* ─────────────────────────────────────
   ACCIONES
───────────────────────────────────── */
function syncUrl() {
  const url = new URL(window.location.href);
  if (state.query) url.searchParams.set('q', state.query);
  else url.searchParams.delete('q');
  window.history.replaceState(null, '', url);
}

function runStoreSearch(query) {
  clearTimeout(typingTimer);

  const clean = String(query || '').trim().slice(0, MAX_QUERY_LENGTH);
  if (clean === state.query) return;

  state.query = clean;
  state.category = 'all';
  state.limit = PRODUCTS_PER_PAGE;

  syncUrl();
  update();
  window.scrollTo(0, 0);
}

function selectSearchCategory(slug) {
  state.category = slug;
  state.limit = PRODUCTS_PER_PAGE;
  update();
}

function changeSearchSort(value) {
  state.sort = value;
  state.limit = PRODUCTS_PER_PAGE;
  update();
}

function loadMoreResults() {
  state.limit += PRODUCTS_PER_PAGE;
  renderResults();
}

/* ─────────────────────────────────────
   EXPORTS
───────────────────────────────────── */
window.onCatalogUpdate = onCatalogUpdate;
window.runStoreSearch = runStoreSearch;
window.selectSearchCategory = selectSearchCategory;
window.changeSearchSort = changeSearchSort;
window.loadMoreResults = loadMoreResults;

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
const queryInput = document.getElementById('searchInput');

state.query = (new URLSearchParams(window.location.search).get('q') || '').trim().slice(0, MAX_QUERY_LENGTH);

if (queryInput) {
  queryInput.value = state.query;

  // Mientras se escribe, los resultados se actualizan solos.
  queryInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => runStoreSearch(queryInput.value), 250);
  });

  // Sin texto y con teclado físico, el cursor queda listo para escribir.
  if (!state.query && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    queryInput.focus();
  }
}

update();
