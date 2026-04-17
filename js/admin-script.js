document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("admin_session_token");
  const expiry = localStorage.getItem("admin_session_expiry");
  if (!token || !expiry) return (window.location.href = "admin-login.html");
  if (Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem("admin_session_token");
    localStorage.removeItem("admin_session_expiry");
    window.location.href = "admin-login.html";
  }
});

window.CATEGORY_CONFIG = {
  bebidas: { label: "Bebidas", singleLabel: "bebida", title: "GESTIÓN DE <span>BEBIDAS</span>", icon: "🥤", emptyIcon: "🥤", pageSub: "Productos con stock y subcategoría. Los cambios se sincronizan en tiempo real.", subcategories: [["agua","💧 Agua"],["gaseosas","🥤 Gaseosas"],["jugos","🍊 Jugos y néctares"],["energizantes","⚡ Energizantes"],["cervezas","🍺 Cervezas"],["vinos","🍷 Vinos"],["espirituosas","🥃 Espirituosas"],["sin-alcohol","🌿 Sin alcohol"],["isotonicos","🏃 Isotónicos"],["te-cafe","☕ Té y café"]] },
  snacks: { label: "Snacks", singleLabel: "snack", title: "GESTIÓN DE <span>SNACKS</span>", icon: "🍪", emptyIcon: "🍪", pageSub: "Gestión completa de snacks con stock, badge y subcategoría.", subcategories: [["papas-fritas","🥔 Papas fritas"],["galletitas","🍪 Galletitas"],["chocolates","🍫 Chocolates"],["gomitas","🍬 Gomitas"],["salados","🥨 Salados"],["frutos-secos","🥜 Frutos secos"],["barritas","🍯 Barritas"],["alfajores","🍫 Alfajores"]] },
  almacen: { 
  label: "Almacén", 
  singleLabel: "producto", 
  title: "GESTIÓN DE <span>ALMACÉN</span>", 
  icon: "🥫", 
  emptyIcon: "🥫", 
  pageSub: "Gestión de alimentos no perecederos, conservas, pastas, arroces, legumbres y más.", 
  subcategories: [
    ["arroz", "🍚 Arroces"],["fideos", "🍝 Fideos y pastas secas"],["legumbres", "🫘 Legumbres"],["harinas", "🌾 Harinas y premezclas"],["aceites", "🫒 Aceites"],
    ["vinagres", "🍷 Vinagres y aceto"],["conservas", "🥫 Conservas"],["salsas", "🍅 Salsas"],["caldos", "🍜 Caldos y sopas"],["aderezos", "🥗 Aderezos"],["encurtidos", "🥒 Encurtidos"],
    ["dulces", "🍯 Dulces y mermeladas"],["azucar", "🍬 Azúcar y edulcorantes"],["sal", "🧂 Sal y especias"],["yerba", "🧉 Yerba mate"],["cafe", "☕ Café"],
    ["galletitas", "🍪 Galletitas de agua"],["pan-rallado", "🍞 Pan rallado"],["leche-polvo", "🥛 Leche en polvo"],["premezclas", "🥞 Premezclas"],["frutos-secos", "🥜 Frutos secos"],
    ["alimentos-bebe", "🍼 Alimentos bebé"],["aceitunas", "🫒 Aceitunas"],["saborizadores", "💧 Saborizadores"],["reposteria", "🎂 Repostería"],["enlatados", "🥫 Enlatados (atún, paté)"],
    ["jugos-polvo", "🧃 Jugos en polvo"],["postres", "🍮 Postres (flan, gelatina)"],["infusiones", "🍵 Infusiones (té, manzanilla)"]] 
},
  higiene: { 
  label: "Higiene",
  singleLabel: "producto", 
  title: "GESTIÓN DE <span>HIGIENE</span>", 
  icon: "🧼", 
  emptyIcon: "🧼", 
  pageSub: "Gestión de productos de higiene personal, cuidado corporal y farmacia.", 
  subcategories: [
    ["cuidado-personal", "🚿 Cuidado personal"],
    ["farmacia", "💊 Farmacia"],
    ["bucal", "🦷 Higiene bucal"],
    ["capilar", "💇‍♂️ Cuidado capilar"],
    ["corporal", "🧴 Cuidado corporal"],
    ["facial", "🧖‍♀️ Cuidado facial"],
    ["perfumeria", "🌸 Perfumería"],
    ["proteccion", "☀️ Protección solar"],
    ["infantil", "👶 Infantil"],
    ["desodorantes", "🫧 Desodorantes"]
  ] 
},
  limpieza: { 
  label: "Limpieza", 
  singleLabel: "producto", 
  title: "GESTIÓN DE <span>LIMPIEZA</span>", 
  icon: "🧴", 
  emptyIcon: "🧴", 
  pageSub: "Gestión de artículos de limpieza para hogar y ropa.", 
  subcategories: [
    ["cocina", "🍳 Limpieza del hogar"],
    ["bano", "🚽 Papel y descartables"],
    ["ropa", "👕 Limpieza de ropa"],
    ["multiuso", "✨ Multiuso"],
    ["lavandina", "🧴 Lavandina y blanqueadores"],
    ["detergente", "🧼 Detergentes"],
    ["ambientadores", "🌸 Ambientadores"]
  ] 
},
  congelados: { 
  label: "Congelados", 
  singleLabel: "producto", 
  title: "GESTIÓN DE <span>CONGELADOS</span>", 
  icon: "🧊", 
  emptyIcon: "🧊", 
  pageSub: "Gestión de alimentos congelados y listos para hornear.", 
  subcategories: [
    ["helados","🍨 Helados y postres congelados"],
    ["pizzas","🍕🥟 Pizzas y empanadas"],
    ["medallones","🍔 Medallones y hamburgesas"],
    ["verduras","🥦 Frutas y verduras congeladas"],
    ["hielo","🧊 Hielo"],
    ["rebozados","🍗 Rebozados"],
    ["papas","🍟 Papas fritas congeladas"],
    ["masas","🍞 Masas congeladas"]
  ] 
},
  lacteos: { label: "Lácteos", singleLabel: "producto", title: "GESTIÓN DE <span>LÁCTEOS</span>", icon: "🧀", emptyIcon: "🧀", pageSub: "Gestión de leches, quesos, yogures y derivados.", subcategories: [["leches","🥛 Leches"],["quesos","🧀 Quesos"],["yogures","🍶 Yogures"],["manteca","🧈 Manteca y crema"],["postres","🍮 Postres"],["huevos","🥚 Huevos"]] },
  panaderia: { label: "Panadería", singleLabel: "producto", title: "GESTIÓN DE <span>PANADERÍA</span>", icon: "🍞", emptyIcon: "🍞", pageSub: "Gestión de panificados, facturas y productos dulces.", subcategories: [["panes","🍞 Panes"],["facturas","🥐 Facturas"],["tortillas","🫓 Tortillas"],["budines","🍰 Budines"],["galletas","🧁 Galletas"],["sin-tacc","🌾 Sin TACC"],["prepizzas","🍕 PREPIZZAS"],["tostadas","🍞 TOSTADAS"]] },
  mascotas: { label: "Mascotas", singleLabel: "producto", title: "GESTIÓN DE <span>MASCOTAS</span>", icon: "🐾", emptyIcon: "🐾", pageSub: "Gestión de alimento, higiene y accesorios para mascotas.", subcategories: [["perros","🐶 Perros"],["gatos","🐱 Gatos"],["higiene","🧴 Higiene"],["snacks","🦴 Snacks"],["arena","🪨 Arena"],["accesorios","🎾 Accesorios"]] },
  ofertas: { label: "Ofertas", singleLabel: "oferta", title: "GESTIÓN DE <span>OFERTAS</span>", icon: "🔥", emptyIcon: "🔥", pageSub: "Gestión de productos destacados en oferta con el mismo flujo de edición.", subcategories: [["flash","⚡ Oferta flash"],["2x1","🛍️ 2x1"],["combo","🎁 Combo"],["bebidas","🥤 Bebidas"],["snacks","🍪 Snacks"],["hogar","🏠 Hogar"]] }
};
window.CATEGORY_COLLECTIONS = Object.keys(window.CATEGORY_CONFIG);
window.DATA = { carousel: [], promos: [], categories: [], best: [], newProds: [],offersStrip: [], sections: {} };
for (const k of window.CATEGORY_COLLECTIONS) window.DATA[k] = [];
window.CONF = {};
window.currentPage = "dashboard";

function setSaving(state) {
  const el = document.getElementById("savingBadge");
  if (!el) return;
  if (state === "saving") {
    el.textContent = "⚡ Guardando...";
    el.className = "show saving";
  } else if (state === "ok") {
    el.textContent = "✅ Guardado";
    el.className = "show";
    setTimeout(() => el.className = "", 2500);
  } else el.className = "";
}

async function fbSave(colName, docId, data) {
  setSaving("saving");
  try {
    await window.fsSetDoc(window.fsDoc(window.db, colName, docId), data, { merge: true });
    setSaving("ok");
    return true;
  } catch (e) {
    setSaving("");
    showToast("❌ Error al guardar: " + e.message, "err");
    return false;
  }
}

async function fbAdd(colName, data) {
  setSaving("saving");
  try {
    const ref = await window.fsAddDoc(window.fsCollection(window.db, colName), data);
    setSaving("ok");
    return ref.id;
  } catch (e) {
    setSaving("");
    showToast("❌ Error: " + e.message, "err");
    return null;
  }
}

async function fbDelete(colName, docId) {
  setSaving("saving");
  try {
    await window.fsDeleteDoc(window.fsDoc(window.db, colName, docId));
    setSaving("ok");
    return true;
  } catch (e) {
    setSaving("");
    showToast("❌ Error: " + e.message, "err");
    return false;
  }
}

function navigate(page, el) {
  window.currentPage = page;
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  if (el) el.classList.add("active");
  render(page);
}
window.navigate = navigate;

const card = (title, icon, body) => `<div class="card"><div class="card-header"><div class="card-title"><span>${icon}</span> ${title}</div></div><div class="card-body">${body}</div></div>`;
const field = (lbl, el, hint = "") => `<div class="field"><label>${lbl}</label>${el}${hint ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">${hint}</div>` : ""}</div>`;
const prodBadge = (b) => b ? `<span class="badge-pill badge-${b}">${b === "offer" ? "OFERTA" : b === "new" ? "NUEVO" : "🔥 HOT"}</span>` : "";
const esc = (v) => String(v || "").replace(/"/g, "&quot;");
const stockHtml = (stock) => {
  const amount = stock ?? null;
  const color = amount === null ? "#4ade80" : amount <= 0 ? "#f87171" : amount <= 5 ? "#f0c040" : "#4ade80";
  const text = amount === null ? "∞ Sin límite" : amount <= 0 ? "❌ Sin stock" : `📦 ${amount} uds`;
  return `<span style="font-family:var(--font-mono);font-size:11px;color:${color}">${text}</span>`;
};

function render(page) {
  const main = document.getElementById("mainContent");
  if (!main) return;
  const pages = {
    dashboard,
    topbar: pageTopbar,
    carousel: pageCarousel,
    promos: pagePromos,
    banner: pageBanner,
    best: () => pageProducts("best"),
    newp: () => pageProducts("new"),
    offersStrip: pageOffersStrip,
    categories: pageCategories,
    sections: pageSections
  };
  for (const key of window.CATEGORY_COLLECTIONS) pages[key] = () => pageCategoryManager(key);
  main.innerHTML = pages[page] ? pages[page]() : '<p style="color:var(--muted)">Página no encontrada</p>';
}
window.render = render;

function getSubcatOptions(collectionName, selected) {
  return window.CATEGORY_CONFIG[collectionName].subcategories.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("");
}

function pageCategoryManager(collectionName) {
  const conf = window.CATEGORY_CONFIG[collectionName];
  const list = window.DATA[collectionName] || [];
  return `
    <div class="page-header">
      <div>
        <div class="page-title">${conf.title}</div>
        <div class="page-sub">${conf.pageSub}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><span>${conf.icon}</span> Productos en ${conf.label} (${list.length})</div>
      </div>
      <div class="card-body">
        <div class="prod-list">
          ${list.length === 0 ? `<p style="color:var(--muted);text-align:center;padding:20px">Sin productos cargados aún.</p>` : list.map((p) => `
            <div class="prod-item">
              <div class="prod-thumb">${p.img ? `<img src="${p.img}" alt="${p.name || ""}"/>` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:22px">${conf.emptyIcon}</div>`}</div>
              <div class="prod-meta">
                <strong>${p.name || ""}</strong>
                <div class="meta-row">
                  <span class="meta-price">$${Number(p.price || 0).toLocaleString("es-AR")}</span>
                  <span class="meta-brand">${p.brand || ""}</span>
                  ${p.badge ? `<span class="badge-pill badge-${p.badge}">${p.badge === "offer" ? "OFERTA" : p.badge === "new" ? "NUEVO" : "HOT"}</span>` : ""}
                  ${stockHtml(p.stock)}
                  <span style="font-size:11px;color:var(--muted)">${p.subcat || "sin cat."}</span>
                </div>
              </div>
              <div class="prod-actions">
                <button class="btn btn-ghost btn-sm" onclick="editCategoryItem('${collectionName}','${p.docId}')">✏️ Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategoryItem('${collectionName}','${p.docId}')">🗑 Eliminar</button>
              </div>
            </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="add-panel">
      <div class="add-panel-title">➕ AGREGAR ${conf.singleLabel.toUpperCase()}</div>
      <div class="field-row">
        ${field("Nombre", `<input id="${collectionName}Name" placeholder="Ej: Producto"/>`)}
        ${field("Marca", `<input id="${collectionName}Brand" placeholder="Ej: Marca"/>`)}
      </div>
      <div class="field-row">
        ${field("Subcategoría", `<select id="${collectionName}Subcat">${getSubcatOptions(collectionName, conf.subcategories[0][0])}</select>`)}
        ${field("Badge", `<select id="${collectionName}Badge"><option value="">Ninguno</option><option value="new">NUEVO</option><option value="offer">OFERTA</option><option value="hot">HOT</option></select>`)}
      </div>
      <div class="field-row3">
        ${field("Precio ($)", `<input id="${collectionName}Price" type="number" placeholder="2200"/>`)}
        ${field("Precio tachado ($)", `<input id="${collectionName}Old" type="number" placeholder="0 = sin tachado"/>`)}
        ${field("Stock (unidades)", `<input id="${collectionName}Stock" type="number" placeholder="Vacío = ilimitado" min="0"/>`)}
      </div>
      ${field("URL imagen", `<input id="${collectionName}Img" placeholder="https://..." oninput="previewImg('${collectionName}Img','${collectionName}ImgPrev')"/>`)}
      <div class="img-preview-wrap"><div class="img-preview" id="${collectionName}ImgPrev"><span>Vista previa</span></div></div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-primary" onclick="addCategoryItem('${collectionName}')">✅ Agregar ${conf.singleLabel}</button>
      </div>
    </div>

    <div class="modal-back hidden" id="${collectionName}Modal">
      <div class="modal-box" style="max-width:520px">
        <button class="modal-close" onclick="closeCategoryModal('${collectionName}')">✕</button>
        <div class="modal-title">EDITAR <span style="color:var(--purple-lt)">${conf.label.toUpperCase()}</span></div>
        <input type="hidden" id="${collectionName}DocId"/>
        <div class="field-row">
          ${field("Nombre", `<input id="${collectionName}EditName"/>`)}
          ${field("Marca", `<input id="${collectionName}EditBrand"/>`)}
        </div>
        <div class="field-row">
          ${field("Subcategoría", `<select id="${collectionName}EditSubcat">${getSubcatOptions(collectionName)}</select>`)}
          ${field("Badge", `<select id="${collectionName}EditBadge"><option value="">Ninguno</option><option value="new">NUEVO</option><option value="offer">OFERTA</option><option value="hot">HOT</option></select>`)}
        </div>
        <div class="field-row3">
          ${field("Precio ($)", `<input id="${collectionName}EditPrice" type="number"/>`)}
          ${field("Precio tachado ($)", `<input id="${collectionName}EditOld" type="number" placeholder="0 = sin tachado"/>`)}
          ${field("Stock (unidades)", `<input id="${collectionName}EditStock" type="number" placeholder="Vacío = ilimitado" min="0"/>`)}
        </div>
        ${field("URL imagen", `<input id="${collectionName}EditImg" oninput="previewImg('${collectionName}EditImg','${collectionName}EditImgPrev')"/>`)}
        <div class="img-preview-wrap"><div class="img-preview" id="${collectionName}EditImgPrev"><span>Vista previa</span></div></div>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-primary" onclick="saveCategoryItem('${collectionName}')">💾 Guardar cambios</button>
          <button class="btn btn-ghost" onclick="closeCategoryModal('${collectionName}')">Cancelar</button>
        </div>
      </div>
    </div>`;
}

function editCategoryItem(collectionName, docId) {
  const item = (window.DATA[collectionName] || []).find((x) => x.docId === docId);
  if (!item) return;
  document.getElementById(`${collectionName}DocId`).value = docId;
  document.getElementById(`${collectionName}EditName`).value = item.name || "";
  document.getElementById(`${collectionName}EditBrand`).value = item.brand || "";
  document.getElementById(`${collectionName}EditSubcat`).value = item.subcat || window.CATEGORY_CONFIG[collectionName].subcategories[0][0];
  document.getElementById(`${collectionName}EditBadge`).value = item.badge || "";
  document.getElementById(`${collectionName}EditPrice`).value = item.price || "";
  document.getElementById(`${collectionName}EditOld`).value = item.old || "";
  document.getElementById(`${collectionName}EditStock`).value = item.stock !== null && item.stock !== undefined ? item.stock : "";
  document.getElementById(`${collectionName}EditImg`).value = item.img || "";
  previewImg(`${collectionName}EditImg`, `${collectionName}EditImgPrev`);
  const modal = document.getElementById(`${collectionName}Modal`);
  modal.classList.remove("hidden");
  modal.classList.add("open");
}
window.editCategoryItem = editCategoryItem;

function closeCategoryModal(collectionName) {
  const modal = document.getElementById(`${collectionName}Modal`);
  if (!modal) return;
  modal.classList.remove("open");
  modal.classList.add("hidden");
}
window.closeCategoryModal = closeCategoryModal;

document.addEventListener("click", (e) => {
  for (const collectionName of window.CATEGORY_COLLECTIONS) {
    const modal = document.getElementById(`${collectionName}Modal`);
    if (modal && modal.classList.contains("open") && e.target === modal) closeCategoryModal(collectionName);
  }
});

async function saveCategoryItem(collectionName) {
  const docId = document.getElementById(`${collectionName}DocId`).value;
  const stockRaw = document.getElementById(`${collectionName}EditStock`).value;
  const data = {
    name: document.getElementById(`${collectionName}EditName`).value.trim(),
    brand: document.getElementById(`${collectionName}EditBrand`).value.trim(),
    subcat: document.getElementById(`${collectionName}EditSubcat`).value,
    badge: document.getElementById(`${collectionName}EditBadge`).value || null,
    price: Number(document.getElementById(`${collectionName}EditPrice`).value) || 0,
    old: Number(document.getElementById(`${collectionName}EditOld`).value) || null,
    stock: stockRaw === "" ? null : Number(stockRaw),
    img: document.getElementById(`${collectionName}EditImg`).value.trim()
  };
  const ok = await fbSave(collectionName, docId, data);
  if (ok) {
    closeCategoryModal(collectionName);
    showToast(`✅ ${window.CATEGORY_CONFIG[collectionName].label} actualizado en Firebase`);
  }
}
window.saveCategoryItem = saveCategoryItem;

async function addCategoryItem(collectionName) {
  const conf = window.CATEGORY_CONFIG[collectionName];
  const stockRaw = document.getElementById(`${collectionName}Stock`).value;
  const name = document.getElementById(`${collectionName}Name`).value.trim();
  const price = Number(document.getElementById(`${collectionName}Price`).value) || 0;
  if (!name || !price) {
    showToast("⚠️ Completá nombre y precio", "err");
    return;
  }
  const data = {
    name,
    brand: document.getElementById(`${collectionName}Brand`).value.trim(),
    subcat: document.getElementById(`${collectionName}Subcat`).value,
    badge: document.getElementById(`${collectionName}Badge`).value || null,
    price,
    old: Number(document.getElementById(`${collectionName}Old`).value) || null,
    stock: stockRaw === "" ? null : Number(stockRaw),
    img: document.getElementById(`${collectionName}Img`).value.trim()
  };
  const newId = await fbAdd(collectionName, data);
  if (newId) {
    showToast(`✅ ${conf.label} agregado - ya visible en el sitio`);
    document.getElementById(`${collectionName}Name`).value = "";
    document.getElementById(`${collectionName}Brand`).value = "";
    document.getElementById(`${collectionName}Subcat`).value = conf.subcategories[0][0];
    document.getElementById(`${collectionName}Badge`).value = "";
    document.getElementById(`${collectionName}Price`).value = "";
    document.getElementById(`${collectionName}Old`).value = "";
    document.getElementById(`${collectionName}Stock`).value = "";
    document.getElementById(`${collectionName}Img`).value = "";
    previewImg(`${collectionName}Img`, `${collectionName}ImgPrev`);
  }
}
window.addCategoryItem = addCategoryItem;

async function deleteCategoryItem(collectionName, docId) {
  if (!confirm(`¿Eliminar este producto de ${window.CATEGORY_CONFIG[collectionName].label}?`)) return;
  const ok = await fbDelete(collectionName, docId);
  if (ok) showToast(`🗑 Producto eliminado de ${window.CATEGORY_CONFIG[collectionName].label}`);
}
window.deleteCategoryItem = deleteCategoryItem;
/* ══════════════════════════════════════════
   PAGE: OFERTAS DEL DÍA (STRIP)
══════════════════════════════════════════ */
function pageOffersStrip() {
  const offers = window.DATA.offersStrip || [];
  return `
    <div class="page-header">
      <div>
        <div class="page-title">OFERTAS <span>DEL DÍA</span></div>
        <div class="page-sub">Gestioná las ofertas que se muestran en la página principal</div>
      </div>
      <button class="btn btn-primary" onclick="showAddOffer()">+ Agregar oferta</button>
    </div>

    ${offers.length === 0 ? `
      <div class="card">
        <div class="card-body" style="text-align:center;padding:40px">
          <div style="font-size:48px;margin-bottom:16px">🏷️</div>
          <p style="color:var(--muted)">No hay ofertas cargadas. Hacé clic en "+ Agregar oferta" para comenzar.</p>
        </div>
      </div>
    ` : `
      <div class="offers-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        ${offers.map((offer, i) => `
          <div class="offer-admin-card" style="background:var(--bg3);border-radius:12px;padding:20px;border:1px solid var(--border);transition:all .2s">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
              <div style="font-size:48px">${offer.emoji || '🏷️'}</div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-xs" onclick="editOffer('${offer.docId}')" style="padding:4px 8px">✏️</button>
                <button class="btn btn-danger btn-xs" onclick="deleteOffer('${offer.docId}')" style="padding:4px 8px">🗑</button>
              </div>
            </div>
            <div style="font-size:28px;font-weight:bold;color:var(--yellow);margin-bottom:6px">${offer.discount || '0%'}</div>
            <div style="color:var(--text);font-size:14px">${offer.category || ''}</div>
            <div style="margin-top:10px;font-size:11px;color:var(--muted)">Orden: ${offer.order ?? i}</div>
          </div>
        `).join('')}
      </div>
    `}

    <!-- Modal para agregar/editar oferta -->
    <div class="modal-back hidden" id="offerModal">
      <div class="modal-box" style="max-width:450px">
        <button class="modal-close" onclick="closeOfferModal()">✕</button>
        <div class="modal-title">OFERTA <span style="color:var(--purple-lt)">DEL DÍA</span></div>
        <input type="hidden" id="offerDocId"/>
        
        <div class="field">
          <label>Emoji</label>
          <input id="offerEmoji" placeholder="Ej: 🥤, 🍕, 🧴" value="🏷️"/>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">Podés usar cualquier emoji</div>
        </div>
        
        <div class="field">
          <label>Descuento / Promoción</label>
          <input id="offerDiscount" placeholder="Ej: 30%, 2×1, 20% OFF"/>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">Ejemplos: 30%, 2×1, 15% OFF</div>
        </div>
        
        <div class="field">
          <label>Categoría</label>
          <input id="offerCategory" placeholder="Ej: En bebidas, En congelados"/>
        </div>
        
        <div class="field">
          <label>Orden</label>
          <input id="offerOrder" type="number" placeholder="Ej: 0, 1, 2" value="0"/>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">Número más bajo = aparece primero</div>
        </div>
        
        <div class="btn-row" style="margin-top:20px">
          <button class="btn btn-primary" onclick="saveOffer()">💾 Guardar oferta</button>
          <button class="btn btn-ghost" onclick="closeOfferModal()">Cancelar</button>
        </div>
      </div>
    </div>

    <style>
      .offer-admin-card:hover {
        border-color: var(--purple);
        transform: translateY(-2px);
      }
    </style>
  `;
}

// Variables globales para ofertas
window._editingOfferId = null;

function showAddOffer() {
  window._editingOfferId = null;
  document.getElementById('offerDocId').value = '';
  document.getElementById('offerEmoji').value = '🏷️';
  document.getElementById('offerDiscount').value = '';
  document.getElementById('offerCategory').value = '';
  document.getElementById('offerOrder').value = (window.DATA.offersStrip?.length || 0);
  
  const modal = document.getElementById('offerModal');
  modal.classList.remove('hidden');
  modal.classList.add('open');
}
window.showAddOffer = showAddOffer;

function editOffer(docId) {
  const offer = (window.DATA.offersStrip || []).find(o => o.docId === docId);
  if (!offer) return;
  
  window._editingOfferId = docId;
  document.getElementById('offerDocId').value = docId;
  document.getElementById('offerEmoji').value = offer.emoji || '🏷️';
  document.getElementById('offerDiscount').value = offer.discount || '';
  document.getElementById('offerCategory').value = offer.category || '';
  document.getElementById('offerOrder').value = offer.order ?? 0;
  
  const modal = document.getElementById('offerModal');
  modal.classList.remove('hidden');
  modal.classList.add('open');
}
window.editOffer = editOffer;

function closeOfferModal() {
  const modal = document.getElementById('offerModal');
  modal.classList.remove('open');
  modal.classList.add('hidden');
  window._editingOfferId = null;
}
window.closeOfferModal = closeOfferModal;

async function saveOffer() {
  const docId = document.getElementById('offerDocId').value;
  const emoji = document.getElementById('offerEmoji').value.trim() || '🏷️';
  const discount = document.getElementById('offerDiscount').value.trim();
  const category = document.getElementById('offerCategory').value.trim();
  const order = Number(document.getElementById('offerOrder').value) || 0;
  
  if (!discount || !category) {
    showToast('⚠️ Completá descuento y categoría', 'err');
    return;
  }
  
  const data = { emoji, discount, category, order };
  
  let ok;
  if (docId) {
    ok = await fbSave('offersStrip', docId, data);
  } else {
    const newId = await fbAdd('offersStrip', data);
    ok = newId !== null;
  }
  
  if (ok) {
    closeOfferModal();
    showToast(`✅ Oferta ${docId ? 'actualizada' : 'agregada'} correctamente`);
    render('offersStrip');
  }
}
window.saveOffer = saveOffer;

async function deleteOffer(docId) {
  if (!confirm('¿Eliminar esta oferta?')) return;
  const ok = await fbDelete('offersStrip', docId);
  if (ok) {
    showToast('🗑 Oferta eliminada');
    render('offersStrip');
  }
}
window.deleteOffer = deleteOffer;

function dashboard() {
  const d = window.DATA;
  const visCount = Object.values(d.sections || {}).filter(Boolean).length;
  const categoryTotal = window.CATEGORY_COLLECTIONS.reduce((acc, key) => acc + (window.DATA[key]?.length || 0), 0);
  return `
    <div class="page-header">
      <div>
        <div class="page-title">PANEL <span>DE CONTROL</span></div>
        <div class="page-sub">Datos sincronizados en tiempo real con Firebase</div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-icon purple">🛍️</div><div class="stat-info"><strong>${d.best.length + d.newProds.length + categoryTotal}</strong><span>Productos</span></div></div>
      <div class="stat-card"><div class="stat-icon yellow">🗂️</div><div class="stat-info"><strong>${d.categories.length}</strong><span>Categorías</span></div></div>
      <div class="stat-card"><div class="stat-icon green">🖼️</div><div class="stat-info"><strong>${d.carousel.length}</strong><span>Slides</span></div></div>
      <div class="stat-card"><div class="stat-icon red">👁️</div><div class="stat-info"><strong>${visCount}/7</strong><span>Secciones visibles</span></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      ${card("Accesos rápidos", "⚡", `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="btn btn-ghost" onclick="navigate('carousel',null)" style="justify-content:flex-start">🖼️ Carrusel</button>
          <button class="btn btn-ghost" onclick="navigate('best',null)" style="justify-content:flex-start">⭐ Más vendidos</button>
          <button class="btn btn-ghost" onclick="navigate('newp',null)" style="justify-content:flex-start">🔥 Novedades</button>
          <button class="btn btn-ghost" onclick="navigate('bebidas',null)" style="justify-content:flex-start">🥤 Bebidas</button>
          <button class="btn btn-ghost" onclick="navigate('snacks',null)" style="justify-content:flex-start">🍪 Snacks</button>
          <button class="btn btn-ghost" onclick="navigate('almacen',null)" style="justify-content:flex-start">🍝 Almacén</button>
          <button class="btn btn-ghost" onclick="navigate('higiene',null)" style="justify-content:flex-start">🧼 Higiene</button>
          <button class="btn btn-ghost" onclick="navigate('limpieza',null)" style="justify-content:flex-start">🧴 Limpieza</button>
          <button class="btn btn-ghost" onclick="navigate('congelados',null)" style="justify-content:flex-start">🧊 Congelados</button>
          <button class="btn btn-ghost" onclick="navigate('lacteos',null)" style="justify-content:flex-start">🧀 Lácteos</button>
          <button class="btn btn-ghost" onclick="navigate('panaderia',null)" style="justify-content:flex-start">🍞 Panadería</button>
          <button class="btn btn-ghost" onclick="navigate('mascotas',null)" style="justify-content:flex-start">🐾 Mascotas</button>
          <button class="btn btn-ghost" onclick="navigate('ofertas',null)" style="justify-content:flex-start">🔥 Ofertas</button>
          <button class="btn btn-ghost" onclick="navigate('categories',null)" style="justify-content:flex-start">🗂️ Categorías</button>
          <button class="btn btn-ghost" onclick="navigate('sections',null)" style="justify-content:flex-start">👁️ Secciones</button>
          <button class="btn btn-ghost" onclick="navigate('topbar',null)" style="justify-content:flex-start">📢 Anuncio</button>
        </div>`)}
      ${card("Últimos productos", "📦", `
        <div class="prod-list">
          ${[...d.best, ...d.newProds, ...window.CATEGORY_COLLECTIONS.flatMap((key) => window.DATA[key] || [])].slice(-4).reverse().map((p) => `
            <div class="prod-item">
              <div class="prod-thumb">${p.img ? `<img src="${p.img}" alt="${p.name || ""}"/>` : ""}</div>
              <div class="prod-meta">
                <strong>${p.name || ""}</strong>
                <div class="meta-row">
                  <span class="meta-price">$${Number(p.price || 0).toLocaleString("es-AR")}</span>
                  <span class="meta-brand">${p.brand || ""}</span>
                  ${prodBadge(p.badge)}
                </div>
              </div>
            </div>`).join("")}
        </div>`)}
    </div>`;
}

function pageTopbar() {
  const val = (window.CONF.general || {}).topbar || "";
  return `
    <div class="page-header"><div><div class="page-title">BARRA <span>SUPERIOR</span></div><div class="page-sub">Anuncio visible en la parte superior del sitio</div></div></div>
    ${card("Editar anuncio", "📢", `
      ${field("Texto (HTML permitido: <strong>, emojis, etc.)", `<input id="fTopbar" value="${esc(val)}"/>`)}
      <div style="margin-top:8px;padding:12px;background:var(--yellow);border-radius:8px;font-size:12px;color:#0c0c0e"><strong>Preview:</strong> <span id="topbarPreview">${val}</span></div>
      <div class="btn-row" style="margin-top:14px"><button class="btn btn-primary" onclick="saveTopbar()">💾 Guardar en Firebase</button></div>`)}
  `;
}
document.addEventListener("input", (e) => {
  if (e.target.id === "fTopbar") {
    const prev = document.getElementById("topbarPreview");
    if (prev) prev.innerHTML = e.target.value;
  }
});
async function saveTopbar() {
  const v = document.getElementById("fTopbar").value.trim();
  if (!v) return showToast("⚠️ El texto no puede estar vacío", "err");
  const ok = await fbSave("config", "general", { topbar: v });
  if (ok) {
    window.CONF.general = window.CONF.general || {};
    window.CONF.general.topbar = v;
    showToast("✅ Anuncio actualizado en Firebase");
  }
}
window.saveTopbar = saveTopbar;

function pageCarousel() {
  return `
    <div class="page-header">
      <div><div class="page-title">CARRUSEL <span>HERO</span></div><div class="page-sub">Los cambios se reflejan en tiempo real en el sitio</div></div>
      <button class="btn btn-primary" onclick="showAddSlide()">+ Agregar slide</button>
    </div>
    <div class="slides-grid">
      ${window.DATA.carousel.map((s, i) => `
        <div class="slide-card">
          <div class="slide-thumb">
            <img src="${s.img || ""}" id="sthumb${s.docId}"/>
            <div class="slide-thumb-overlay"><div class="slide-thumb-tag">${s.tag || ""}</div><div class="slide-thumb-title">${(s.title || "").split("\n")[0]}</div></div>
          </div>
          <div class="slide-card-body">
            <div class="slide-num">SLIDE ${i + 1}</div>
            ${field("URL imagen", `<input id="si${s.docId}" value="${esc(s.img || "")}" oninput="document.getElementById('sthumb${s.docId}').src=this.value"/>`)}
            ${field("Etiqueta", `<input id="st${s.docId}" value="${esc(s.tag || "")}"/>`)}
            ${field("Título (\\n = salto)", `<input id="sh${s.docId}" value="${esc(s.title || "")}"/>`)}
            ${field("Descripción", `<textarea id="sd${s.docId}">${s.desc || ""}</textarea>`)}
            ${field("Texto botón", `<input id="sb${s.docId}" value="${esc(s.btnText || "")}"/>`)}
            <div class="btn-row">
              <button class="btn btn-success btn-sm" onclick="saveSlide('${s.docId}')">💾 Guardar</button>
              ${window.DATA.carousel.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="delSlide('${s.docId}')">🗑 Eliminar</button>` : ""}
            </div>
          </div>
        </div>`).join("")}
    </div>
    <div class="add-panel hidden" id="addSlidePanel">
      <div class="add-panel-title">🖼️ NUEVO SLIDE</div>
      <div class="field-row">
        ${field("URL imagen", `<input id="nslImg" placeholder="https://..." oninput="previewImg('nslImg','nslPrev')"/>`)}
        ${field("Etiqueta", `<input id="nslTag" placeholder="Ej: 🔥 Oferta especial"/>`)}
      </div>
      <div class="img-preview-wrap"><div class="img-preview" id="nslPrev"><span>Vista previa</span></div></div>
      ${field("Título", `<input id="nslTitle" placeholder="TÍTULO DEL SLIDE"/>`)}
      ${field("Descripción", `<textarea id="nslDesc"></textarea>`)}
      ${field("Texto botón", `<input id="nslBtn" value="Ver productos"/>`)}
      <div class="btn-row">
        <button class="btn btn-primary" onclick="addSlide()">✅ Agregar slide</button>
        <button class="btn btn-ghost" onclick="document.getElementById('addSlidePanel').classList.add('hidden')">Cancelar</button>
      </div>
    </div>`;
}
function showAddSlide() {
  const p = document.getElementById("addSlidePanel");
  if (p) {
    p.classList.remove("hidden");
    p.scrollIntoView({ behavior: "smooth" });
  }
}
window.showAddSlide = showAddSlide;
async function saveSlide(docId) {
  const data = { img: document.getElementById(`si${docId}`).value, tag: document.getElementById(`st${docId}`).value, title: document.getElementById(`sh${docId}`).value, desc: document.getElementById(`sd${docId}`).value, btnText: document.getElementById(`sb${docId}`).value };
  const ok = await fbSave("carousel", docId, data);
  if (ok) showToast("✅ Slide guardado - el sitio se actualiza automáticamente");
}
window.saveSlide = saveSlide;
async function delSlide(docId) {
  if (!confirm("¿Eliminar este slide?")) return;
  const ok = await fbDelete("carousel", docId);
  if (ok) {
    window.DATA.carousel = window.DATA.carousel.filter((s) => s.docId !== docId);
    render("carousel");
    showToast("🗑 Slide eliminado");
  }
}
window.delSlide = delSlide;
async function addSlide() {
  const img = document.getElementById("nslImg").value.trim();
  const tag = document.getElementById("nslTag").value.trim();
  const title = document.getElementById("nslTitle").value.trim();
  const desc = document.getElementById("nslDesc").value.trim();
  const btn = document.getElementById("nslBtn").value.trim();
  if (!img || !title) return showToast("⚠️ Completá imagen y título", "err");
  const order = window.DATA.carousel.length;
  const newId = await fbAdd("carousel", { img, tag, title, desc, btnText: btn, btnLink: "#elBest", order });
  if (newId) {
    window.DATA.carousel.push({ docId: newId, img, tag, title, desc, btnText: btn, btnLink: "#elBest", order });
    render("carousel");
    showToast("✅ Slide agregado al carrusel en tiempo real");
  }
}
window.addSlide = addSlide;

function pagePromos() {
  return `
    <div class="page-header"><div><div class="page-title">PROMOS <span>LATERALES</span></div><div class="page-sub">Las dos tarjetas al costado del carrusel</div></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      ${window.DATA.promos.map((p, i) => card(`Promo ${i + 1}`, "🏷️", `
        <div class="slide-thumb" style="margin-bottom:14px"><img src="${p.img || ""}" id="pimg${p.docId}" style="filter:brightness(.45)"/><div class="slide-thumb-overlay"><div class="slide-thumb-tag">${p.label || ""}</div><div class="slide-thumb-title">${(p.title || "").replace(/\n/g, " ")}</div></div></div>
        ${field("Etiqueta", `<input id="pl${p.docId}" value="${esc(p.label || "")}"/>`)}
        ${field("Título", `<input id="pt${p.docId}" value="${esc(p.title || "")}"/>`)}
        ${field("URL imagen", `<input id="pi${p.docId}" value="${esc(p.img || "")}" oninput="document.getElementById('pimg${p.docId}').src=this.value"/>`)}
        <div class="btn-row"><button class="btn btn-success btn-sm" onclick="savePromo('${p.docId}')">💾 Guardar en Firebase</button></div>`)).join("")}
    </div>`;
}
async function savePromo(docId) {
  const data = { label: document.getElementById(`pl${docId}`).value, title: document.getElementById(`pt${docId}`).value, img: document.getElementById(`pi${docId}`).value };
  const ok = await fbSave("promos", docId, data);
  if (ok) showToast("✅ Promo guardada - visible en el sitio al instante");
}
window.savePromo = savePromo;

function pageBanner() {
  const desc = (window.CONF.general || {}).bannerDesc || "";
  return `<div class="page-header"><div><div class="page-title">BANNER <span>APP</span></div><div class="page-sub">Sección de descarga de la aplicación</div></div></div>${card("Contenido", "📱", `${field("Descripción", `<textarea id="fBannerDesc">${desc}</textarea>`)}<div class="btn-row"><button class="btn btn-primary" onclick="saveBanner()">💾 Guardar en Firebase</button></div>`)}`;
}
async function saveBanner() {
  const v = document.getElementById("fBannerDesc").value;
  const ok = await fbSave("config", "general", { bannerDesc: v });
  if (ok) {
    window.CONF.general = window.CONF.general || {};
    window.CONF.general.bannerDesc = v;
    showToast("✅ Banner actualizado");
  }
}
window.saveBanner = saveBanner;

function pageProducts(sec) {
  const list = sec === "best" ? window.DATA.best : window.DATA.newProds;
  const colName = sec === "best" ? "bestSellers" : "newProducts";
  const title = sec === "best" ? "MÁS VENDIDOS" : "NOVEDADES";
  return `
    <div class="page-header"><div><div class="page-title">${title.split(" ")[0]} <span>${title.split(" ").slice(1).join(" ")}</span></div><div class="page-sub">Los cambios se sincronizan en tiempo real</div></div></div>
    ${card(`Productos (${list.length})`, "🛍️", `
      <div class="prod-list">
        ${list.map((p) => `
          <div class="prod-item">
            <div class="prod-thumb"><img src="${p.img || ""}" alt="${p.name || ""}"/></div>
            <div class="prod-meta">
              <strong>${p.name || ""}</strong>
              <div class="meta-row">
                <span class="meta-price">$${Number(p.price || 0).toLocaleString("es-AR")}</span>
                ${p.old ? `<span style="font-size:12px;color:var(--muted);text-decoration:line-through;font-family:var(--font-mono)">$${Number(p.old).toLocaleString("es-AR")}</span>` : ""}
                <span class="meta-brand">${p.brand || ""}</span>
                ${prodBadge(p.badge)}
              </div>
            </div>
            <div class="prod-actions">
              <button class="btn btn-ghost btn-sm" onclick="openEditModal('${p.docId}','${colName}')">✏️ Editar</button>
              <button class="btn btn-danger btn-sm" onclick="delProd('${p.docId}','${colName}','${sec}')">🗑</button>
            </div>
          </div>`).join("")}
      </div>`)}
    <div class="add-panel">
      <div class="add-panel-title">➕ AGREGAR PRODUCTO</div>
      <div class="field-row">
        ${field("Nombre", `<input id="npName" placeholder="Ej: Coca-Cola 2.25L"/>`)}
        ${field("Marca", `<input id="npBrand" placeholder="Ej: Coca-Cola"/>`)}
      </div>
      <div class="field-row3">
        ${field("Precio ($)", `<input id="npPrice" type="number"/>`)}
        ${field("Precio tachado ($)", `<input id="npOld" type="number" placeholder="0 = sin tachado"/>`)}
        ${field("Badge", `<select id="npBadge"><option value="">Ninguno</option><option value="new">NUEVO</option><option value="offer">OFERTA</option><option value="hot">HOT</option></select>`)}
      </div>
      ${field("URL imagen", `<input id="npImg" placeholder="https://..." oninput="previewImg('npImg','npImgPrev')"/>`)}
      <div class="img-preview-wrap"><div class="img-preview" id="npImgPrev"><span>Vista previa</span></div></div>
      <div class="btn-row" style="margin-top:14px"><button class="btn btn-primary" onclick="addProd('${colName}','${sec}')">✅ Agregar a Firebase</button></div>
    </div>`;
}

function openEditModal(docId, colName) {
  const list = colName === "bestSellers" ? window.DATA.best : window.DATA.newProds;
  const p = list.find((x) => x.docId === docId);
  if (!p) return;
  document.getElementById("mDocId").value = docId;
  document.getElementById("mCollection").value = colName;
  document.getElementById("mName").value = p.name || "";
  document.getElementById("mBrand").value = p.brand || "";
  document.getElementById("mPrice").value = p.price || "";
  document.getElementById("mOld").value = p.old || "";
  document.getElementById("mImg").value = p.img || "";
  document.getElementById("mBadge").value = p.badge || "";
  previewImg("mImg", "mImgPrev");
  document.getElementById("editModal").classList.add("open");
}
window.openEditModal = openEditModal;

async function saveEditModal() {
  const docId = document.getElementById("mDocId").value;
  const colName = document.getElementById("mCollection").value;
  const data = {
    name: document.getElementById("mName").value,
    brand: document.getElementById("mBrand").value,
    price: Number(document.getElementById("mPrice").value) || 0,
    old: Number(document.getElementById("mOld").value) || null,
    img: document.getElementById("mImg").value,
    badge: document.getElementById("mBadge").value || null
  };
  const ok = await fbSave(colName, docId, data);
  if (ok) {
    closeModal();
    render(colName === "bestSellers" ? "best" : "newp");
    showToast("✅ Producto actualizado en Firebase");
  }
}
window.saveEditModal = saveEditModal;

function closeModal() {
  document.getElementById("editModal").classList.remove("open");
}
window.closeModal = closeModal;
document.getElementById("editModal")?.addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

async function delProd(docId, colName, sec) {
  if (!confirm("¿Eliminar este producto?")) return;
  const ok = await fbDelete(colName, docId);
  if (ok) {
    if (sec === "best") window.DATA.best = window.DATA.best.filter((p) => p.docId !== docId);
    else window.DATA.newProds = window.DATA.newProds.filter((p) => p.docId !== docId);
    render(sec === "best" ? "best" : "newp");
    showToast("🗑 Producto eliminado de Firebase");
  }
}
window.delProd = delProd;

async function addProd(colName, sec) {
  const name = document.getElementById("npName").value.trim();
  const brand = document.getElementById("npBrand").value.trim();
  const price = Number(document.getElementById("npPrice").value) || 0;
  const old = Number(document.getElementById("npOld").value) || null;
  const img = document.getElementById("npImg").value.trim();
  const badge = document.getElementById("npBadge").value || null;
  if (!name || !price) return showToast("⚠️ Completá nombre y precio", "err");
  const newId = await fbAdd(colName, { name, brand, price, old, img, badge });
  if (newId) {
    const prod = { docId: newId, name, brand, price, old, img, badge };
    if (sec === "best") window.DATA.best.push(prod);
    else window.DATA.newProds.push(prod);
    render(sec === "best" ? "best" : "newp");
    showToast("✅ Producto agregado - ya visible en el sitio");
  }
}
window.addProd = addProd;

function pageCategories() {
  const cats = [...window.DATA.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  return `
    <div class="page-header">
      <div><div class="page-title">GESTIÓN DE <span>CATEGORÍAS</span></div><div class="page-sub">Se muestran ${cats.length} categorías configuradas</div></div>
      <button class="btn btn-primary" onclick="showAddCat()">+ Nueva Categoría</button>
    </div>
    <div class="cat-table-container">
      <table class="cat-table">
        <thead><tr><th>Orden</th><th>Emoji</th><th>Nombre</th><th>URL</th><th>Cant.</th><th>Acción</th></tr></thead>
        <tbody>
          ${cats.map((c, index) => `
            <tr>
              <td><input id="co${c.docId}" type="number" value="${c.order ?? index}" style="width:45px;text-align:center;background:transparent;border:none;color:var(--purple-lt)"/></td>
              <td><input id="ce${c.docId}" value="${c.emoji || ""}" style="width:40px;text-align:center;font-size:18px;background:transparent;border:none;color:var(--purple-lt)"/></td>
              <td><input id="cn${c.docId}" value="${esc(c.name || "")}" style="width:130px;background:transparent;border:none;color:var(--purple-lt)"/></td>
              <td><code style="font-size:11px;color:var(--muted)">${c.slug || ""}</code></td>
              <td><input class="cat-count-input" id="cc${c.docId}" type="number" value="${c.count || 0}" style="width:55px;background:transparent;border:none;color:var(--purple-lt)"/></td>
              <td><div style="display:flex;gap:5px"><button class="btn btn-success btn-xs" onclick="saveCat('${c.docId}')">💾</button><button class="btn btn-danger btn-xs" onclick="delCat('${c.docId}')">🗑</button></div></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="btn-row"><button class="btn btn-primary" onclick="saveAllCats()">💾 Guardar todos los cambios</button></div>
    <div class="add-panel hidden" id="addCatPanel">
      <div class="add-panel-title">➕ NUEVA CATEGORÍA</div>
      ${field("Emoji", `<input id="ncEmoji" placeholder="Ej: 🥤"/>`)}
      ${field("Nombre", `<input id="ncName" placeholder="Ej: Bebidas"/>`)}
      ${field("Slug (url)", `<input id="ncSlug" placeholder="Ej: bebidas"/>`)}
      <div class="btn-row"><button class="btn btn-primary" onclick="addCategory()">✅ Crear</button><button class="btn btn-ghost" onclick="document.getElementById('addCatPanel').classList.add('hidden')">Cancelar</button></div>
    </div>`;
}

async function saveCat(docId) {
  const data = { order: Number(document.getElementById(`co${docId}`).value) || 0, emoji: document.getElementById(`ce${docId}`).value, name: document.getElementById(`cn${docId}`).value, count: Number(document.getElementById(`cc${docId}`).value) || 0 };
  const ok = await fbSave("categories", docId, data);
  if (ok) showToast(`✅ Categoría "${data.name}" guardada`);
}
window.saveCat = saveCat;

async function saveAllCats() {
  for (const c of window.DATA.categories) {
    await fbSave("categories", c.docId, { order: Number(document.getElementById(`co${c.docId}`)?.value) || 0, emoji: document.getElementById(`ce${c.docId}`)?.value, name: document.getElementById(`cn${c.docId}`)?.value, count: Number(document.getElementById(`cc${c.docId}`)?.value) || 0 });
  }
  showToast("✅ Todas las categorías guardadas en Firebase");
}
window.saveAllCats = saveAllCats;

function showAddCat() {
  const p = document.getElementById("addCatPanel");
  p.classList.remove("hidden");
  p.scrollIntoView({ behavior: "smooth" });
}
window.showAddCat = showAddCat;

async function addCategory() {
  const emoji = document.getElementById("ncEmoji").value.trim();
  const name = document.getElementById("ncName").value.trim();
  const slug = document.getElementById("ncSlug").value.trim();
  if (!name || !emoji || !slug) return showToast("⚠️ Completa todos los campos", "err");
  const order = window.DATA.categories.length;
  const newId = await fbAdd("categories", { emoji, name, slug, count: 0, order });
  if (newId) {
    window.DATA.categories.push({ docId: newId, emoji, name, slug, count: 0, order });
    render("categories");
    showToast("✅ Categoría creada exitosamente");
  }
}
window.addCategory = addCategory;

async function delCat(docId) {
  if (!confirm("¿Estás seguro de eliminar esta categoría? Esto no borrará los productos, pero ya no se verá en el menú.")) return;
  const ok = await fbDelete("categories", docId);
  if (ok) {
    window.DATA.categories = window.DATA.categories.filter((c) => c.docId !== docId);
    render("categories");
    showToast("🗑 Categoría eliminada");
  }
}
window.delCat = delCat;

const SECTION_META = {
  topbar: { label: "Barra superior", icon: "📢" },
  stats: { label: "Barra de estadísticas", icon: "📊" },
  categories: { label: "Explorar categorías", icon: "🗂️" },
  offers: { label: "Ofertas del día", icon: "🔥" },
  best: { label: "Más vendidos", icon: "⭐" },
  banner: { label: "Banner app", icon: "📱" },
  newProds: { label: "Novedades", icon: "✨" }
};

function pageSections() {
  const s = window.DATA.sections || {};
  return `
    <div class="page-header"><div><div class="page-title">VISIBILIDAD DE <span>SECCIONES</span></div><div class="page-sub">Los cambios se guardan en Firebase automáticamente al hacer click</div></div></div>
    ${card("Secciones del sitio", "👁️", Object.entries(SECTION_META).map(([k, m]) => `
      <div class="toggle-row">
        <div class="toggle-label"><span class="tl-icon">${m.icon}</span><div><strong>${m.label}</strong><span>${s[k] ? "Visible para los visitantes" : "Oculta del sitio"}</span></div></div>
        <label class="tsw"><input type="checkbox" ${s[k] ? "checked" : ""} onchange="toggleSection('${k}',this.checked)"/><span class="tsl"></span></label>
      </div>`).join(""))}
    <div style="padding:14px 18px;background:rgba(240,192,64,.06);border:1px solid rgba(240,192,64,.2);border-radius:10px;font-size:13px;color:var(--yellow);margin-top:8px">⚡ Cada toggle guarda inmediatamente en Firebase y el sitio se actualiza en tiempo real.</div>`;
}

async function toggleSection(key, val) {
  const update = {};
  update[key] = val;
  window.DATA.sections[key] = val;
  const ok = await fbSave("config", "sections", update);
  if (ok) showToast(`${val ? "👁️ Sección visible" : "🙈 Sección oculta"}: ${SECTION_META[key]?.label || key}`);
  render("sections");
}
window.toggleSection = toggleSection;

function previewImg(inputId, previewId) {
  const val = document.getElementById(inputId)?.value;
  const prev = document.getElementById(previewId);
  if (!prev) return;
  if (val) {
    prev.innerHTML = `<img src="${val}" onerror="this.parentElement.innerHTML='<span>Imagen no disponible</span>';this.parentElement.classList.remove('has-img')"/>`;
    prev.classList.add("has-img");
  } else {
    prev.innerHTML = "<span>Vista previa</span>";
    prev.classList.remove("has-img");
  }
}
window.previewImg = previewImg;

function showToast(msg, type = "ok") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = `toast${type === "err" ? " err" : ""}`;
  t.innerHTML = `<span>${type === "err" ? "⚠️" : "🐺"}</span> ${msg}`;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 3500);
}
window.showToast = showToast;

