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
          <a href="${s.btnLink || '#'}" class="btn btn-yellow">${s.btnText || 'Ver más'}</a>
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
function buildCategories(cats) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  grid.innerHTML = cats.map(c => {
    const slug = c.slug || '';
    const cache = window._catCounts || {};
    const count = (typeof cache[slug] === 'number') ? cache[slug] : (c.count || 0);

    return `
      <a class="category-card" href="${slug}.html">
        <div class="cat-emoji">${c.emoji || '🛒'}</div>
        <div class="cat-name">${c.name || ''}</div>
        <div class="cat-count" id="catcount-${slug}">${count} productos</div>
      </a>
    `;
  }).join('');
}

function updateCategoryCount(slug, count) {
  if (!window._catCounts) window._catCounts = {};
  window._catCounts[slug] = count;

  const el = document.getElementById('catcount-' + slug);
  if (el) el.textContent = count + ' productos';
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

  grid.innerHTML = list.map(p => `
    <div class="product-card">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'offer' ? 'OFERTA' : p.badge === 'new' ? 'NUEVO' : '🔥 HOT'}</span>` : ''}
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
          <button class="add-btn" onclick="addToCart('${p.docId || p.id}', event)">+</button>
        </div>
      </div>
    </div>
  `).join('');
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