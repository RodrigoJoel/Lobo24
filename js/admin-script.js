/* ══════════════════════════════════════════
   GLOBAL DATA (llenado por Firebase)
══════════════════════════════════════════ */
window.DATA = { carousel:[], promos:[], categories:[], best:[], newProds:[], sections:{} };
window.CONF = {};

/* ══════════════════════════════════════════
   SAVING INDICATOR
══════════════════════════════════════════ */
function setSaving(state) {
  const el = document.getElementById('savingBadge');
  if (state === 'saving') { el.textContent = '⚡ Guardando...'; el.className='show saving'; }
  else if (state === 'ok') { el.textContent = '✅ Guardado'; el.className='show'; setTimeout(()=>el.className='',2500); }
  else { el.className = ''; }
}

async function fbSave(colName, docId, data) {
  setSaving('saving');
  try {
    await window.fsSetDoc(window.fsDoc(window.db, colName, docId), data, { merge: true });
    setSaving('ok');
    return true;
  } catch(e) {
    setSaving('');
    showToast('❌ Error al guardar: '+e.message, 'err');
    return false;
  }
}

async function fbAdd(colName, data) {
  setSaving('saving');
  try {
    const ref = await window.fsAddDoc(window.fsCollection(window.db, colName), data);
    setSaving('ok');
    return ref.id;
  } catch(e) {
    setSaving('');
    showToast('❌ Error: '+e.message, 'err');
    return null;
  }
}

async function fbDelete(colName, docId) {
  setSaving('saving');
  try {
    await window.fsDeleteDoc(window.fsDoc(window.db, colName, docId));
    setSaving('ok');
    return true;
  } catch(e) {
    setSaving('');
    showToast('❌ Error: '+e.message, 'err');
    return false;
  }
}

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
let currentPage = 'dashboard';
function navigate(page, el) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if (el) el.classList.add('active');
  render(page);
}

/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */
function render(page) {
  const main = document.getElementById('mainContent');
  const pages = { dashboard, topbar:pageTopbar, carousel:pageCarousel, promos:pagePromos, banner:pageBanner, best:()=>pageProducts('best'), newp:()=>pageProducts('new'), categories:pageCategories, sections:pageSections };
  main.innerHTML = pages[page] ? pages[page]() : '<p style="color:var(--muted)">Página no encontrada</p>';
}

/* helpers */
const card = (title,icon,body) => `<div class="card"><div class="card-header"><div class="card-title"><span>${icon}</span> ${title}</div></div><div class="card-body">${body}</div></div>`;
const field = (lbl,el,hint='') => `<div class="field"><label>${lbl}</label>${el}${hint?`<div style="font-size:11px;color:var(--muted);margin-top:4px">${hint}</div>`:''}</div>`;
const prodBadge = b => b?`<span class="badge-pill badge-${b}">${b==='offer'?'OFERTA':b==='new'?'NUEVO':'🔥 HOT'}</span>`:'';

/* ══════════════════════════════════════════
   PAGE: DASHBOARD
══════════════════════════════════════════ */
function dashboard() {
  const d = window.DATA;
  const visCount = Object.values(d.sections||{}).filter(Boolean).length;
  return `
    <div class="page-header"><div><div class="page-title">PANEL <span>DE CONTROL</span></div><div class="page-sub">Datos sincronizados en tiempo real con Firebase</div></div></div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-icon purple">🛍️</div><div class="stat-info"><strong>${d.best.length+d.newProds.length}</strong><span>Productos</span></div></div>
      <div class="stat-card"><div class="stat-icon yellow">🗂️</div><div class="stat-info"><strong>${d.categories.length}</strong><span>Categorías</span></div></div>
      <div class="stat-card"><div class="stat-icon green">🖼️</div><div class="stat-info"><strong>${d.carousel.length}</strong><span>Slides</span></div></div>
      <div class="stat-card"><div class="stat-icon red">👁️</div><div class="stat-info"><strong>${visCount}/7</strong><span>Secciones visibles</span></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      ${card('Accesos rápidos','⚡',`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="btn btn-ghost" onclick="navigate('carousel',null)" style="justify-content:flex-start">🖼️ Carrusel</button>
          <button class="btn btn-ghost" onclick="navigate('best',null)" style="justify-content:flex-start">⭐ Más vendidos</button>
          <button class="btn btn-ghost" onclick="navigate('newp',null)" style="justify-content:flex-start">🔥 Novedades</button>
          <button class="btn btn-ghost" onclick="navigate('categories',null)" style="justify-content:flex-start">🗂️ Categorías</button>
          <button class="btn btn-ghost" onclick="navigate('sections',null)" style="justify-content:flex-start">👁️ Secciones</button>
          <button class="btn btn-ghost" onclick="navigate('topbar',null)" style="justify-content:flex-start">📢 Anuncio</button>
        </div>`)}
      ${card('Últimos productos','📦',`
        <div class="prod-list">
          ${[...d.best,...d.newProds].slice(-4).reverse().map(p=>`
            <div class="prod-item">
              <div class="prod-thumb"><img src="${p.img||''}" alt="${p.name||''}"/></div>
              <div class="prod-meta"><strong>${p.name||''}</strong><div class="meta-row"><span class="meta-price">$${Number(p.price||0).toLocaleString('es-AR')}</span><span class="meta-brand">${p.brand||''}</span>${prodBadge(p.badge)}</div></div>
            </div>`).join('')}
        </div>`)}
    </div>`;
}

/* ══════════════════════════════════════════
   PAGE: TOPBAR
══════════════════════════════════════════ */
function pageTopbar() {
  const val = (window.CONF.general||{}).topbar || '';
  return `
    <div class="page-header"><div><div class="page-title">BARRA <span>SUPERIOR</span></div><div class="page-sub">Anuncio visible en la parte superior del sitio</div></div></div>
    ${card('Editar anuncio','📢',`
      ${field('Texto (HTML permitido: <strong>, emojis, etc.)',`<input id="fTopbar" value="${val.replace(/"/g,'&quot;')}"/>`)}
      <div style="margin-top:8px;padding:12px;background:var(--yellow);border-radius:8px;font-size:12px;color:#0c0c0e">
        <strong>Preview:</strong> <span id="topbarPreview">${val}</span>
      </div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-primary" onclick="saveTopbar()">💾 Guardar en Firebase</button>
      </div>`)}`;
}

document.addEventListener('input', e => {
  if (e.target.id === 'fTopbar') {
    const prev = document.getElementById('topbarPreview');
    if (prev) prev.innerHTML = e.target.value;
  }
});

async function saveTopbar() {
  const v = document.getElementById('fTopbar').value.trim();
  if (!v) { showToast('⚠️ El texto no puede estar vacío','err'); return; }
  const ok = await fbSave('config','general',{ topbar:v });
  if (ok) { window.CONF.general = window.CONF.general || {}; window.CONF.general.topbar = v; showToast('✅ Anuncio actualizado en Firebase'); }
}

/* ══════════════════════════════════════════
   PAGE: CAROUSEL
══════════════════════════════════════════ */
function pageCarousel() {
  return `
    <div class="page-header">
      <div><div class="page-title">CARRUSEL <span>HERO</span></div><div class="page-sub">Los cambios se reflejan en tiempo real en el sitio</div></div>
      <button class="btn btn-primary" onclick="showAddSlide()">+ Agregar slide</button>
    </div>
    <div class="slides-grid">
      ${window.DATA.carousel.map((s,i)=>`
        <div class="slide-card">
          <div class="slide-thumb">
            <img src="${s.img||''}" id="sthumb${s.docId}"/>
            <div class="slide-thumb-overlay"><div class="slide-thumb-tag">${s.tag||''}</div><div class="slide-thumb-title">${(s.title||'').split('\n')[0]}</div></div>
          </div>
          <div class="slide-card-body">
            <div class="slide-num">SLIDE ${i+1}</div>
            ${field('URL imagen',`<input id="si${s.docId}" value="${(s.img||'').replace(/"/g,'&quot;')}" oninput="document.getElementById('sthumb${s.docId}').src=this.value"/>`)}
            ${field('Etiqueta',`<input id="st${s.docId}" value="${(s.tag||'').replace(/"/g,'&quot;')}"/>`)}
            ${field('Título (\\n = salto)',`<input id="sh${s.docId}" value="${(s.title||'').replace(/"/g,'&quot;')}"/>`)}
            ${field('Descripción',`<textarea id="sd${s.docId}">${s.desc||''}</textarea>`)}
            ${field('Texto botón',`<input id="sb${s.docId}" value="${(s.btnText||'').replace(/"/g,'&quot;')}"/>`)}
            <div class="btn-row">
              <button class="btn btn-success btn-sm" onclick="saveSlide('${s.docId}')">💾 Guardar</button>
              ${window.DATA.carousel.length>1?`<button class="btn btn-danger btn-sm" onclick="delSlide('${s.docId}')">🗑 Eliminar</button>`:''}
            </div>
          </div>
        </div>`).join('')}
    </div>
    <div class="add-panel hidden" id="addSlidePanel">
      <div class="add-panel-title">🖼️ NUEVO SLIDE</div>
      <div class="field-row">
        ${field('URL imagen',`<input id="nslImg" placeholder="https://..." oninput="previewImg('nslImg','nslPrev')"/>`)}
        ${field('Etiqueta',`<input id="nslTag" placeholder="Ej: 🔥 Oferta especial"/>`)}
      </div>
      <div class="img-preview-wrap"><div class="img-preview" id="nslPrev"><span>Vista previa</span></div></div>
      ${field('Título',`<input id="nslTitle" placeholder="TÍTULO DEL SLIDE"/>`)}
      ${field('Descripción',`<textarea id="nslDesc"></textarea>`)}
      ${field('Texto botón',`<input id="nslBtn" value="Ver productos"/>`)}
      <div class="btn-row">
        <button class="btn btn-primary" onclick="addSlide()">✅ Agregar slide</button>
        <button class="btn btn-ghost" onclick="document.getElementById('addSlidePanel').classList.add('hidden')">Cancelar</button>
      </div>
    </div>`;
}

function showAddSlide() {
  const p = document.getElementById('addSlidePanel');
  if (p) { p.classList.remove('hidden'); p.scrollIntoView({behavior:'smooth'}); }
}

async function saveSlide(docId) {
  const data = {
    img:     document.getElementById(`si${docId}`).value,
    tag:     document.getElementById(`st${docId}`).value,
    title:   document.getElementById(`sh${docId}`).value,
    desc:    document.getElementById(`sd${docId}`).value,
    btnText: document.getElementById(`sb${docId}`).value,
  };
  const ok = await fbSave('carousel', docId, data);
  if (ok) {
    const idx = window.DATA.carousel.findIndex(s=>s.docId===docId);
    if (idx>-1) window.DATA.carousel[idx] = {...window.DATA.carousel[idx],...data};
    showToast('✅ Slide guardado — el sitio se actualiza automáticamente');
  }
}

async function delSlide(docId) {
  if (!confirm('¿Eliminar este slide?')) return;
  const ok = await fbDelete('carousel', docId);
  if (ok) {
    window.DATA.carousel = window.DATA.carousel.filter(s=>s.docId!==docId);
    render('carousel'); showToast('🗑 Slide eliminado');
  }
}

async function addSlide() {
  const img   = document.getElementById('nslImg').value.trim();
  const tag   = document.getElementById('nslTag').value.trim();
  const title = document.getElementById('nslTitle').value.trim();
  const desc  = document.getElementById('nslDesc').value.trim();
  const btn   = document.getElementById('nslBtn').value.trim();
  if (!img||!title) { showToast('⚠️ Completá imagen y título','err'); return; }
  const order = window.DATA.carousel.length;
  const newId = await fbAdd('carousel', { img, tag, title, desc, btnText:btn, btnLink:'#elBest', order });
  if (newId) {
    window.DATA.carousel.push({ docId:newId, img, tag, title, desc, btnText:btn, btnLink:'#elBest', order });
    render('carousel'); showToast('✅ Slide agregado al carrusel en tiempo real');
  }
}

/* ══════════════════════════════════════════
   PAGE: PROMOS
══════════════════════════════════════════ */
function pagePromos() {
  return `
    <div class="page-header"><div><div class="page-title">PROMOS <span>LATERALES</span></div><div class="page-sub">Las dos tarjetas al costado del carrusel</div></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      ${window.DATA.promos.map((p,i)=>card(`Promo ${i+1}`,'🏷️',`
        <div class="slide-thumb" style="margin-bottom:14px">
          <img src="${p.img||''}" id="pimg${p.docId}" style="filter:brightness(.45)"/>
          <div class="slide-thumb-overlay"><div class="slide-thumb-tag">${p.label||''}</div><div class="slide-thumb-title">${(p.title||'').replace(/\n/g,' ')}</div></div>
        </div>
        ${field('Etiqueta',`<input id="pl${p.docId}" value="${(p.label||'').replace(/"/g,'&quot;')}"/>`)}
        ${field('Título',`<input id="pt${p.docId}" value="${(p.title||'').replace(/"/g,'&quot;')}"/>`)}
        ${field('URL imagen',`<input id="pi${p.docId}" value="${(p.img||'').replace(/"/g,'&quot;')}" oninput="document.getElementById('pimg${p.docId}').src=this.value"/>`)}
        <div class="btn-row"><button class="btn btn-success btn-sm" onclick="savePromo('${p.docId}')">💾 Guardar en Firebase</button></div>
      `)).join('')}
    </div>`;
}

async function savePromo(docId) {
  const data = {
    label: document.getElementById(`pl${docId}`).value,
    title: document.getElementById(`pt${docId}`).value,
    img:   document.getElementById(`pi${docId}`).value,
  };
  const ok = await fbSave('promos', docId, data);
  if (ok) {
    const idx = window.DATA.promos.findIndex(p=>p.docId===docId);
    if(idx>-1) window.DATA.promos[idx]={...window.DATA.promos[idx],...data};
    showToast('✅ Promo guardada — visible en el sitio al instante');
  }
}

/* ══════════════════════════════════════════
   PAGE: BANNER
══════════════════════════════════════════ */
function pageBanner() {
  const desc = (window.CONF.general||{}).bannerDesc || '';
  return `
    <div class="page-header"><div><div class="page-title">BANNER <span>APP</span></div><div class="page-sub">Sección de descarga de la aplicación</div></div></div>
    ${card('Contenido','📱',`
      ${field('Descripción',`<textarea id="fBannerDesc">${desc}</textarea>`)}
      <div class="btn-row"><button class="btn btn-primary" onclick="saveBanner()">💾 Guardar en Firebase</button></div>`)}`;
}

async function saveBanner() {
  const v = document.getElementById('fBannerDesc').value;
  const ok = await fbSave('config','general',{ bannerDesc:v });
  if (ok) { window.CONF.general = window.CONF.general||{}; window.CONF.general.bannerDesc=v; showToast('✅ Banner actualizado'); }
}

/* ══════════════════════════════════════════
   PAGE: PRODUCTS
══════════════════════════════════════════ */
function pageProducts(sec) {
  const list   = sec==='best' ? window.DATA.best : window.DATA.newProds;
  const colName = sec==='best' ? 'bestSellers' : 'newProducts';
  const title  = sec==='best' ? 'MÁS VENDIDOS' : 'NOVEDADES';
  return `
    <div class="page-header"><div><div class="page-title">${title.split(' ')[0]} <span>${title.split(' ').slice(1).join(' ')}</span></div><div class="page-sub">Los cambios se sincronizan en tiempo real</div></div></div>
    ${card(`Productos (${list.length})`, '🛍️', `
      <div class="prod-list">
        ${list.map(p=>`
          <div class="prod-item">
            <div class="prod-thumb"><img src="${p.img||''}" alt="${p.name||''}"/></div>
            <div class="prod-meta">
              <strong>${p.name||''}</strong>
              <div class="meta-row">
                <span class="meta-price">$${Number(p.price||0).toLocaleString('es-AR')}</span>
                ${p.old?`<span style="font-size:12px;color:var(--muted);text-decoration:line-through;font-family:var(--font-mono)">$${Number(p.old).toLocaleString('es-AR')}</span>`:''}
                <span class="meta-brand">${p.brand||''}</span>
                ${prodBadge(p.badge)}
              </div>
            </div>
            <div class="prod-actions">
              <button class="btn btn-ghost btn-sm" onclick="openEditModal('${p.docId}','${colName}')">✏️ Editar</button>
              <button class="btn btn-danger btn-sm" onclick="delProd('${p.docId}','${colName}','${sec}')">🗑</button>
            </div>
          </div>`).join('')}
      </div>`)}
    <div class="add-panel">
      <div class="add-panel-title">➕ AGREGAR PRODUCTO</div>
      <div class="field-row">
        ${field('Nombre',`<input id="npName" placeholder="Ej: Coca-Cola 2.25L"/>`)}
        ${field('Marca',`<input id="npBrand" placeholder="Ej: Coca-Cola"/>`)}
      </div>
      <div class="field-row3">
        ${field('Precio ($)',`<input id="npPrice" type="number"/>`)}
        ${field('Precio tachado ($)',`<input id="npOld" type="number" placeholder="0 = sin tachado"/>`)}
        ${field('Badge',`<select id="npBadge"><option value="">Ninguno</option><option value="new">NUEVO</option><option value="offer">OFERTA</option><option value="hot">HOT</option></select>`)}
      </div>
      ${field('URL imagen',`<input id="npImg" placeholder="https://..." oninput="previewImg('npImg','npImgPrev')"/>`)}
      <div class="img-preview-wrap"><div class="img-preview" id="npImgPrev"><span>Vista previa</span></div></div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-primary" onclick="addProd('${colName}','${sec}')">✅ Agregar a Firebase</button>
      </div>
    </div>`;
}

function openEditModal(docId, colName) {
  const list = colName==='bestSellers' ? window.DATA.best : window.DATA.newProds;
  const p = list.find(x=>x.docId===docId); if(!p) return;
  document.getElementById('mDocId').value      = docId;
  document.getElementById('mCollection').value = colName;
  document.getElementById('mName').value  = p.name||'';
  document.getElementById('mBrand').value = p.brand||'';
  document.getElementById('mPrice').value = p.price||'';
  document.getElementById('mOld').value   = p.old||'';
  document.getElementById('mImg').value   = p.img||'';
  document.getElementById('mBadge').value = p.badge||'';
  previewImg('mImg','mImgPrev');
  document.getElementById('editModal').classList.add('open');
}

async function saveEditModal() {
  const docId   = document.getElementById('mDocId').value;
  const colName = document.getElementById('mCollection').value;
  const data = {
    name:  document.getElementById('mName').value,
    brand: document.getElementById('mBrand').value,
    price: Number(document.getElementById('mPrice').value)||0,
    old:   Number(document.getElementById('mOld').value)||null,
    img:   document.getElementById('mImg').value,
    badge: document.getElementById('mBadge').value||null,
  };
  const ok = await fbSave(colName, docId, data);
  if (ok) {
    const list = colName==='bestSellers' ? window.DATA.best : window.DATA.newProds;
    const idx = list.findIndex(x=>x.docId===docId);
    if(idx>-1) list[idx]={...list[idx],...data};
    closeModal();
    render(colName==='bestSellers'?'best':'newp');
    showToast('✅ Producto actualizado en Firebase');
  }
}

function closeModal() { document.getElementById('editModal').classList.remove('open'); }
document.getElementById('editModal').addEventListener('click',function(e){ if(e.target===this)closeModal(); });

async function delProd(docId, colName, sec) {
  if (!confirm('¿Eliminar este producto?')) return;
  const ok = await fbDelete(colName, docId);
  if (ok) {
    if (sec==='best') window.DATA.best = window.DATA.best.filter(p=>p.docId!==docId);
    else window.DATA.newProds = window.DATA.newProds.filter(p=>p.docId!==docId);
    render(sec==='best'?'best':'newp');
    showToast('🗑 Producto eliminado de Firebase');
  }
}

async function addProd(colName, sec) {
  const name  = document.getElementById('npName').value.trim();
  const brand = document.getElementById('npBrand').value.trim();
  const price = Number(document.getElementById('npPrice').value)||0;
  const old   = Number(document.getElementById('npOld').value)||null;
  const img   = document.getElementById('npImg').value.trim();
  const badge = document.getElementById('npBadge').value||null;
  if (!name||!price) { showToast('⚠️ Completá nombre y precio','err'); return; }
  const newId = await fbAdd(colName, {name,brand,price,old,img,badge});
  if (newId) {
    const prod = {docId:newId,name,brand,price,old,img,badge};
    if (sec==='best') window.DATA.best.push(prod); else window.DATA.newProds.push(prod);
    render(sec==='best'?'best':'newp');
    showToast('✅ Producto agregado — ya visible en el sitio');
  }
}

/* ══════════════════════════════════════════
   PAGE: CATEGORIES
══════════════════════════════════════════ */
/* ══════════════════════════════════════════
   PAGE: CATEGORIES (CORREGIDA)
══════════════════════════════════════════ */
function pageCategories() {
  const cats = [...window.DATA.categories].sort((a,b) => (a.order || 0) - (b.order || 0));

  return `
    <div class="page-header">
      <div>
        <div class="page-title">GESTIÓN DE <span>CATEGORÍAS</span></div>
        <div class="page-sub">Se muestran ${cats.length} categorías configuradas</div>
      </div>
      <button class="btn btn-primary" onclick="showAddCat()">+ Nueva Categoría</button>
    </div>

    <div class="cat-table-container">
        <table class="cat-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Emoji</th>
              <th>Nombre</th>
              <th>URL</th>
              <th>Cant.</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${cats.map((c, index) => `
              <tr>
                <td><input id="co${c.docId}" type="number" value="${c.order ?? index}" style="width:45px; text-align:center; background:transparent; border:none; color:var(--purple-lt)"/></td>
                <td><input id="ce${c.docId}" value="${c.emoji || ''}" style="width:40px; text-align:center; font-size:18px; background:transparent; border:none; color:var(--purple-lt)"/></td>
                <td><input id="cn${c.docId}" value="${(c.name || '').replace(/"/g, '&quot;')}" style="width:130px; background:transparent; border:none; color:var(--purple-lt)"/></td>
                <td><code style="font-size:11px; color:var(--muted)">${c.slug || ''}</code></td>
                <td><input class="cat-count-input" id="cc${c.docId}" type="number" value="${c.count || 0}" style="width:55px; background:transparent; border:none; color:var(--purple-lt)"/></td>
                <td>
                  <div style="display:flex; gap:5px">
                    <button class="btn btn-success btn-xs" onclick="saveCat('${c.docId}')">💾</button>
                    <button class="btn btn-danger btn-xs" onclick="delCat('${c.docId}')">🗑</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
    </div>

        <div class="btn-row">
        <button class="btn btn-primary" onclick="saveAllCats()">💾 Guardar todos los cambios</button>
        </div>
        <div class="add-panel hidden" id="addCatPanel">
    <div class="add-panel-title">➕ NUEVA CATEGORÍA</div>

    ${field('Emoji', `<input id="ncEmoji" placeholder="Ej: 🥤"/>`)}
    ${field('Nombre', `<input id="ncName" placeholder="Ej: Bebidas"/>`)}
    ${field('Slug (url)', `<input id="ncSlug" placeholder="Ej: bebidas"/>`)}

    <div class="btn-row">
        <button class="btn btn-primary" onclick="addCategory()">✅ Crear</button>
        <button class="btn btn-ghost" onclick="document.getElementById('addCatPanel').classList.add('hidden')">Cancelar</button>
    </div>
    </div>
  `;
}

async function saveCat(docId) {
  const data = {
    emoji: document.getElementById(`ce${docId}`).value,
    name:  document.getElementById(`cn${docId}`).value,
    count: Number(document.getElementById(`cc${docId}`).value)||0,
  };
  const ok = await fbSave('categories', docId, data);
  if (ok) {
    const idx = window.DATA.categories.findIndex(c=>c.docId===docId);
    if(idx>-1) window.DATA.categories[idx]={...window.DATA.categories[idx],...data};
    showToast(`✅ Categoría "${data.name}" guardada`);
  }
}

async function saveAllCats() {
  for (const c of window.DATA.categories) {
    const emoji = document.getElementById(`ce${c.docId}`)?.value;
    const name  = document.getElementById(`cn${c.docId}`)?.value;
    const count = Number(document.getElementById(`cc${c.docId}`)?.value)||0;
    if (emoji!==undefined) await fbSave('categories', c.docId, {emoji,name,count});
  }
  showToast('✅ Todas las categorías guardadas en Firebase');
}

/* ══════════════════════════════════════════
   PAGE: SECTIONS
══════════════════════════════════════════ */
const SECTION_META = {
  topbar:     { label:'Barra superior',        icon:'📢' },
  stats:      { label:'Barra de estadísticas', icon:'📊' },
  categories: { label:'Explorar categorías',   icon:'🗂️' },
  offers:     { label:'Ofertas del día',        icon:'🔥' },
  best:       { label:'Más vendidos',           icon:'⭐' },
  banner:     { label:'Banner app',             icon:'📱' },
  newProds:   { label:'Novedades',              icon:'✨' },
};

function pageSections() {
  const s = window.DATA.sections || {};
  return `
    <div class="page-header"><div><div class="page-title">VISIBILIDAD DE <span>SECCIONES</span></div><div class="page-sub">Los cambios se guardan en Firebase automáticamente al hacer click</div></div></div>
    ${card('Secciones del sitio','👁️',
      Object.entries(SECTION_META).map(([k,m])=>`
        <div class="toggle-row">
          <div class="toggle-label">
            <span class="tl-icon">${m.icon}</span>
            <div><strong>${m.label}</strong><span>${s[k]?'Visible para los visitantes':'Oculta del sitio'}</span></div>
          </div>
          <label class="tsw">
            <input type="checkbox" ${s[k]?'checked':''} onchange="toggleSection('${k}',this.checked)"/>
            <span class="tsl"></span>
          </label>
        </div>`).join('')
    )}
    <div style="padding:14px 18px;background:rgba(240,192,64,.06);border:1px solid rgba(240,192,64,.2);border-radius:10px;font-size:13px;color:var(--yellow);margin-top:8px">
      ⚡ Cada toggle guarda inmediatamente en Firebase y el sitio se actualiza en tiempo real.
    </div>`;
}

async function toggleSection(key, val) {
  const update = {};
  update[key] = val;
  window.DATA.sections[key] = val;
  const ok = await fbSave('config','sections', update);
  if (ok) showToast(`${val?'👁️ Sección visible':'🙈 Sección oculta'}: ${SECTION_META[key]?.label||key}`);
  render('sections');
}

/* ══════════════════════════════════════════
   IMG PREVIEW
══════════════════════════════════════════ */
function previewImg(inputId, previewId) {
  const val  = document.getElementById(inputId)?.value;
  const prev = document.getElementById(previewId);
  if (!prev) return;
  if (val) {
    prev.innerHTML = `<img src="${val}" onerror="this.parentElement.innerHTML='<span>Imagen no disponible</span>';this.parentElement.classList.remove('has-img')"/>`;
    prev.classList.add('has-img');
  } else {
    prev.innerHTML = '<span>Vista previa</span>';
    prev.classList.remove('has-img');
  }
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function showToast(msg, type='ok') {
  const t = document.createElement('div');
  t.className = `toast${type==='err'?' err':''}`;
  t.innerHTML = `<span>${type==='err'?'⚠️':'🐺'}</span> ${msg}`;
  document.getElementById('toastWrap').appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),400); }, 3500);
}
function showAddCat() {
    const p = document.getElementById('addCatPanel');
    p.classList.remove('hidden');
    p.scrollIntoView({behavior:'smooth'});
}

async function addCategory() {
    const emoji = document.getElementById('ncEmoji').value.trim();
    const name = document.getElementById('ncName').value.trim();
    const slug = document.getElementById('ncSlug').value.trim();
    
    if(!name || !emoji || !slug) { showToast('⚠️ Completa todos los campos','err'); return; }
    
    const order = window.DATA.categories.length;
    const newId = await fbAdd('categories', { emoji, name, slug, count: 0, order });
    
    if(newId) {
        window.DATA.categories.push({ docId: newId, emoji, name, slug, count: 0, order });
        render('categories');
        showToast('✅ Categoría creada exitosamente');
    }
}

async function delCat(docId) {
    if(!confirm('¿Estás seguro de eliminar esta categoría? Esto no borrará los productos, pero ya no se verá en el menú.')) return;
    const ok = await fbDelete('categories', docId);
    if(ok) {
        window.DATA.categories = window.DATA.categories.filter(c => c.docId !== docId);
        render('categories');
        showToast('🗑 Categoría eliminada');
    }
}