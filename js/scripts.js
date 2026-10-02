/* ══════════════════════════════════════
   HOME - CARRUSEL
══════════════════════════════════════ */
let ci = 0;
let ctimer;
window._slides = [];

function buildCarousel(slides) {
  window._slides = slides;

  const track = document.getElementById('carouselTrack');
  const dots = document.getElementById('carouselDots');

  if (!track || !dots) return;
  if (ci >= slides.length) ci = 0;

  track.innerHTML = slides.map((s, i) => `
    <div class="carousel-slide${i === ci ? ' active-slide' : ''}">
      <img class="slide-bg" src="${s.img || ''}" alt="slide"/>
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <div class="hero-tag">${s.tag || ''}</div>
        <h1>${(s.title || '').replace(/\n/g, '<br>')}</h1>
        <p class="slide-desc">${s.desc || ''}</p>
        <div class="hero-cta">
          <a href="${s.btnLink || '#'}" class="btn btn-yellow">${cleanLabel(s.btnText || 'Ver más')}</a>
          <button class="btn btn-ghost" onclick="openModal()">Crear cuenta gratis →</button>
        </div>
      </div>
    </div>
  `).join('');

  dots.innerHTML = slides.map((_, i) =>
    `<button class="c-dot${i === ci ? ' active' : ''}" onclick="goSlide(${i})"></button>`
  ).join('');

  clearInterval(ctimer);
  ctimer = setInterval(() => carouselMove(1), 5000);
}

function goSlide(i) {
  ci = i;

  const track = document.getElementById('carouselTrack');
  if (track) {
    track.style.transform = `translateX(-${i * 100}%)`;
  }

  document.querySelectorAll('.c-dot').forEach((d, j) => d.classList.toggle('active', j === i));
  document.querySelectorAll('.carousel-slide').forEach((s, j) => s.classList.toggle('active-slide', j === i));

  clearInterval(ctimer);
  ctimer = setInterval(() => carouselMove(1), 5000);
}

function carouselMove(dir) {
  const n = window._slides.length || 1;
  goSlide((ci + dir + n) % n);
}

/* ══════════════════════════════════════
   HOME - CATEGORÍAS
══════════════════════════════════════ */
const CAT_ICONS = {
  bebidas: 'fa-bottle-water', snacks: 'fa-cookie-bite', almacen: 'fa-basket-shopping', higiene: 'fa-pump-soap',
  limpieza: 'fa-spray-can-sparkles', congelados: 'fa-snowflake', lacteos: 'fa-cheese', panaderia: 'fa-bread-slice',
  mascotas: 'fa-paw', perfumeria: 'fa-bottle-droplet', bazar: 'fa-utensils', ofertas: 'fa-tags'
};

// Quita el emoji inicial de un texto cargado desde el panel ("🛒 Ver productos" → "Ver productos").
function cleanLabel(text) {
  return String(text).replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '');
}

function countLabel(slug, count) {
  if (slug === 'ofertas') return 'Ver descuentos';
  return count > 0 ? count + ' productos' : '';
}

function buildCategories(cats) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  grid.innerHTML = cats.map(c => {
    const slug = c.slug || '';
    const cache = window._catCounts || {};
    const count = (typeof cache[slug] === 'number') ? cache[slug] : (c.count || 0);
    const icon = CAT_ICONS[slug]
      ? `<i class="fa-solid ${CAT_ICONS[slug]}"></i>`
      : (c.emoji || '<i class="fa-solid fa-store"></i>');

    return `
      <a class="category-card" href="${slug}.html">
        <div class="cat-emoji">${icon}</div>
        <div class="cat-text">
          <div class="cat-name">${c.name || ''}</div>
          <div class="cat-count" id="catcount-${slug}">${countLabel(slug, count)}</div>
        </div>
      </a>
    `;
  }).join('');
}

function updateCategoryCount(slug, count) {
  if (!window._catCounts) window._catCounts = {};
  window._catCounts[slug] = count;

  const el = document.getElementById('catcount-' + slug);
  if (el) el.textContent = countLabel(slug, count);
}

window.updateCategoryCount = updateCategoryCount;

/* ══════════════════════════════════════
   HOME - PRODUCTOS
══════════════════════════════════════ */
function renderProducts(list, id) {
  const grid = document.getElementById(id);
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--muted);padding:20px">Sin productos cargados.</p>';
    return;
  }

  grid.innerHTML = list.map(p => {
    // stock sin cargar = producto sin control de stock
    const sinStock = p.stock != null && Number(p.stock) <= 0;

    return `
    <div class="product-card${sinStock ? ' out-of-stock' : ''}">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'offer' ? 'OFERTA' : p.badge === 'new' ? 'NUEVO' : 'HOT'}</span>` : ''}
      ${sinStock ? '<span class="stock-badge out">Sin stock</span>' : ''}
      <div class="product-img">
        <img src="${p.img || ''}" alt="${p.name || ''}" loading="lazy"/>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name || ''}</div>
        <div class="product-brand">${p.brand || ''}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.old ? `<span class="price-old">$${Number(p.old).toLocaleString('es-AR')}</span>` : ''}
            <span class="price-new">
              <span class="curr">$</span>${Number(p.price || 0).toLocaleString('es-AR')}
            </span>
          </div>
          <button class="add-btn" ${sinStock ? 'disabled' : ''} onclick="addToCart('${p.docId || p.id}', event)" title="${sinStock ? 'Sin stock' : 'Agregar al carrito'}">${sinStock ? '✕' : '+'}</button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

/* ══════════════════════════════════════
   HOME - SCROLL ANIMATIONS
══════════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.animate').forEach(el => obs.observe(el));

/* ══════════════════════════════════════
   EXPORTS HOME
══════════════════════════════════════ */
window.buildCarousel = buildCarousel;
window.goSlide = goSlide;
window.carouselMove = carouselMove;
window.buildCategories = buildCategories;
window.renderProducts = renderProducts;