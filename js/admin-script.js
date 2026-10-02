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
  bebidas: { label: "Bebidas", singleLabel: "bebida", title: "GESTIÓN DE <span>BEBIDAS</span>", icon: "🥤", emptyIcon: "🥤", pageSub: "Productos con stock y subcategoría. Los cambios se sincronizan en tiempo real.", subcategories: [["agua","💧 Agua"],["gaseosas","🥤 Gaseosas"],["jugos","🍊 Jugos y néctares"],["energizantes","⚡ Energizantes"],["cervezas","🍺 Cervezas"],["vinos","🍷 Vinos"],["blancas","🥃 Bebidas blancas"],["aperitivos","🌿 Fernet y aperitivos"],["isotonicos","🏃 Isotónicos"]/*:["te-cafe","☕ Té y café"]*/] },
  snacks: { label: "Snacks", singleLabel: "snack", title: "GESTIÓN DE <span>SNACKS</span>", icon: "🍪", emptyIcon: "🍪", pageSub: "Gestión completa de snacks con stock, badge y subcategoría.", subcategories: [["papas-fritas","🥔 Papas fritas"],["galletitas","🍪 Galletitas"],["chocolates","🍫 Chocolates"],["gomitas","🍬 Gomitas"],["salados","🥨 Salados"],["frutos-secos","🥜 Frutos secos"],["barritas","🍯 Barritas"],["alfajores","🍫 Alfajores"]] },
  almacen: { 
  label: "Almacén", 
  singleLabel: "producto", 
  title: "GESTIÓN DE <span>ALMACÉN</span>", 
  icon: "🥫", 
  emptyIcon: "🥫", 
  pageSub: "Gestión de alimentos no perecederos, conservas, pastas, arroces, legumbres y más.", 
  subcategories: [
    ["arroz", "🍚 Arroces"],["fideos", "🍝 Fideos y pastas secas"],["tabaco", "🚬 Tabaco"],["harinas", "🌾 Harinas y premezclas"],["aceites", "🫒 Aceites"],
    ["vinagres", "🍷 Vinagres y aceto"],["conservas", "🥫 Conservas"],["salsas", "🍅 Salsas"],["caldos", "🍜 Caldos y sopas"],["aderezos", "🥗 Aderezos"],["encurtidos", "🥒 Encurtidos"],
    ["dulces", "🍯 Dulces y mermeladas"],["azucar", "🍬 Azúcar y edulcorantes"],["sal", "🧂 Sal y especias"],["yerba", "🧉 Yerba mate"],["cafe", "☕ Café"],
    ["galletitas", "🍪 Galletitas"],["pan-rallado", "🍞 Pan rallado"],["leche-polvo", "🥛 Leche en polvo"],["premezclas", "🥞 Premezclas"],["frutos-secos", "🥜 Frutos secos"],
    ["alimentos-bebe", "🍼 Alimentos bebé"],["aceitunas", "🫒 Aceitunas"],["saborizadores", "💧 Saborizadores"],["reposteria", "🎂 Repostería"],["enlatados", "🥫 Enlatados (atún, paté)"],
    ["jugos-polvo", "🧃 Jugos en polvo"],["postres", "🍮 Postres (flan, gelatina)"],["infusiones", "🍵 Infusiones (té, manzanilla)"],["carbon", "🔥 Carbón y leña"]]
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
  perfumeria: { label: "Perfumería", singleLabel: "producto", title: "GESTIÓN DE <span>PERFUMERÍA</span>", icon: "🌸", emptyIcon: "🌸", pageSub: "Gestión de perfumes, cremas y productos de perfumería (Victoria's Secret, Saphirus, etc.).", subcategories: [["perfumes","🌸 Perfumes"],["cremas","🧴 Cremas y lociones"],["desodorantes","🫧 Desodorantes y body splash"],["ambientadores","🏠 Ambientadores"]] },
  bazar: { label: "Bazar", singleLabel: "producto", title: "GESTIÓN DE <span>BAZAR</span>", icon: "🍽️", emptyIcon: "🍽️", pageSub: "Gestión de artículos de bazar y menaje para el hogar.", subcategories: [["vasos","🥤 Vasos"],["termos","🧊 Termos"],["bombillas","🥤 Bombillas"],["mates","🧉 Mates"],["varios","🍽️ Varios"]] }
};
window.CATEGORY_COLLECTIONS = Object.keys(window.CATEGORY_CONFIG);
window.DATA = {
  carousel: [],
  promos: [],
  categories: [],
  best: [],
  newProds: [],
  offersStrip: [],
  users: [],
  sections: {}
};
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
// Todo lo que escribe un cliente (nombre, notas, dirección) se muestra como
// texto: sin esto, un nombre con código HTML se ejecutaría con los permisos
// del admin. Sirve tanto dentro de una etiqueta como en value="...".
const esc = (v) => String(v ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");
const stockHtml = (stock) => {
  const amount = stock ?? null;
  const color = amount === null ? "#4ade80" : amount <= 0 ? "#f87171" : amount <= 5 ? "#f0c040" : "#4ade80";
  const text = amount === null ? "∞ Sin límite" : amount <= 0 ? "❌ Sin stock" : `📦 ${amount} uds`;
  return `<span style="font-family:var(--font-mono);font-size:11px;color:${color}">${text}</span>`;
};

const maxPorCompraHtml = (maxPorCompra) => {
  if (maxPorCompra === null || maxPorCompra === undefined) return "";
  return `<span style="font-family:var(--font-mono);font-size:11px;color:#e05c20">🚫 Máx ${maxPorCompra}/pedido</span>`;
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
    pedidos: pagePedidos,
    usuarios: pageUsuarios,
    categories: pageCategories,
    sections: pageSections
  };
  for (const key of window.CATEGORY_COLLECTIONS) pages[key] = () => pageCategoryManager(key);
  // Los productos de una categoría se piden a Firestore recién al abrirla.
  if (window.CATEGORY_COLLECTIONS.includes(page) && typeof window.ensureCategoryLoaded === "function") {
    window.ensureCategoryLoaded(page);
  }
  main.innerHTML = pages[page] ? pages[page]() : '<p style="color:var(--muted)">Página no encontrada</p>';
  if (page === 'pedidos' && typeof renderOrdersList === 'function') renderOrdersList();
}
window.render = render;

function getSubcatOptions(collectionName, selected) {
  return window.CATEGORY_CONFIG[collectionName].subcategories.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("");
}

function pageCategoryManager(collectionName) {
  const conf = window.CATEGORY_CONFIG[collectionName];

  // Todavía no llegaron los productos: el listener vuelve a llamar a
  // render() cuando lleguen.
  if (window.CATEGORY_LOADED && !window.CATEGORY_LOADED[collectionName]) {
    return `
    <div class="page-header">
      <div>
        <div class="page-title">${conf.title}</div>
        <div class="page-sub">${conf.pageSub}</div>
      </div>
    </div>
    <p style="color:var(--muted);text-align:center;padding:20px">Cargando productos…</p>`;
  }

  const list = window.DATA[collectionName] || [];

  const searchTerm = window.adminProductSearch?.[collectionName] || "";
  const selectedSubcat = window.adminProductSubcat?.[collectionName] || "all";

  const filteredList = list.filter((p) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !term ||
      (p.name || "").toLowerCase().includes(term) ||
      (p.brand || "").toLowerCase().includes(term) ||
      (p.subcat || "").toLowerCase().includes(term) ||
      (p.codigoBarras || "").toLowerCase().includes(term) ||
      (p.codigoBarrasAlternativo || "").toLowerCase().includes(term);

    const matchesSubcat =
      selectedSubcat === "all" || p.subcat === selectedSubcat;

    return matchesSearch && matchesSubcat;
  });

  return `
    <div class="page-header">
      <div>
        <div class="page-title">${conf.title}</div>
        <div class="page-sub">${conf.pageSub}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>${conf.icon}</span>
          Productos en ${conf.label} (${filteredList.length}/${list.length})
        </div>
      </div>

      <div class="card-body">

        <div style="display:grid;grid-template-columns:1fr 240px;gap:12px;margin-bottom:16px">
          <div class="field" style="margin:0">
            <label>Buscar productos</label>
            <input
              id="${collectionName}AdminSearch"
              placeholder="Buscar por nombre, marca, subcategoría o código de barras..."
              value="${esc(searchTerm)}"
              oninput="filterAdminProducts('${collectionName}')"
            />
          </div>

          <div class="field" style="margin:0">
            <label>Filtrar por subcategoría</label>
            <select
              id="${collectionName}AdminSubcatFilter"
              onchange="filterAdminProducts('${collectionName}')"
            >
              <option value="all">Todas</option>
              ${conf.subcategories.map(([value, label]) => `
                <option value="${value}" ${selectedSubcat === value ? "selected" : ""}>
                  ${label}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="prod-list">
          ${filteredList.length === 0 ? `
            <p style="color:var(--muted);text-align:center;padding:20px">
              No hay productos que coincidan con la búsqueda o filtro seleccionado.
            </p>
          ` : filteredList.map((p) => `
            <div class="prod-item">
              <div class="prod-thumb">
                ${
                  p.img
                    ? `<img src="${p.img}" alt="${p.name || ""}"/>`
                    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:22px">${conf.emptyIcon}</div>`
                }
              </div>

              <div class="prod-meta">
                <strong>${p.name || ""}</strong>
                <div class="meta-row">
                  <span class="meta-price">$${Number(p.price || 0).toLocaleString("es-AR")}</span>
                  <span class="meta-brand">${p.brand || ""}</span>
                  ${
                    p.badge
                      ? `<span class="badge-pill badge-${p.badge}">${p.badge === "offer" ? "OFERTA" : p.badge === "new" ? "NUEVO" : "HOT"}</span>`
                      : ""
                  }
                  ${stockHtml(p.stock)}
                  ${maxPorCompraHtml(p.maxPorCompra)}
                  <span style="font-size:11px;color:var(--muted)">${p.subcat || "sin cat."}</span>
                </div>
              </div>

              <div class="prod-actions">
                <button class="btn btn-ghost btn-sm" onclick="editCategoryItem('${collectionName}','${p.docId}')">✏️ Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategoryItem('${collectionName}','${p.docId}')">🗑 Eliminar</button>
              </div>
            </div>
          `).join("")}
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
        ${field("Código de barras", `<input id="${collectionName}CodigoBarras" placeholder="Ej: 7790895000782"/>`)}
        ${field("Código de barras alternativo", `<input id="${collectionName}CodigoBarrasAlt" placeholder="Por si el producto cambió de código"/>`)}
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

      ${field("Precio efectivo/transferencia ($)", `<input id="${collectionName}PriceEfectivo" type="number" placeholder="Vacío = mismo precio que tarjeta"/>`)}

      ${field("Límite de compra (unidades por pedido)", `<input id="${collectionName}MaxPorCompra" type="number" placeholder="Vacío = sin límite" min="1"/>`)}

      ${field("URL imagen", `<input id="${collectionName}Img" placeholder="https://..." oninput="previewImg('${collectionName}Img','${collectionName}ImgPrev')"/>`)}

      <div class="img-preview-wrap">
        <div class="img-preview" id="${collectionName}ImgPrev"><span>Vista previa</span></div>
      </div>

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
          ${field("Código de barras", `<input id="${collectionName}EditCodigoBarras"/>`)}
          ${field("Código de barras alternativo", `<input id="${collectionName}EditCodigoBarrasAlt" placeholder="Por si el producto cambió de código"/>`)}
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

        ${field("Precio efectivo/transferencia ($)", `<input id="${collectionName}EditPriceEfectivo" type="number" placeholder="Vacío = mismo precio que tarjeta"/>`)}

        ${field("Límite de compra (unidades por pedido)", `<input id="${collectionName}EditMaxPorCompra" type="number" placeholder="Vacío = sin límite" min="1"/>`)}

        ${field("URL imagen", `<input id="${collectionName}EditImg" oninput="previewImg('${collectionName}EditImg','${collectionName}EditImgPrev')"/>`)}

        <div class="img-preview-wrap">
          <div class="img-preview" id="${collectionName}EditImgPrev"><span>Vista previa</span></div>
        </div>

        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-primary" onclick="saveCategoryItem('${collectionName}')">💾 Guardar cambios</button>
          <button class="btn btn-ghost" onclick="closeCategoryModal('${collectionName}')">Cancelar</button>
        </div>
      </div>
    </div>`;
}

window.adminProductSearch = window.adminProductSearch || {};
window.adminProductSubcat = window.adminProductSubcat || {};

function filterAdminProducts(collectionName) {
  const searchInput = document.getElementById(`${collectionName}AdminSearch`);
  const subcatSelect = document.getElementById(`${collectionName}AdminSubcatFilter`);

  const cursorPos = searchInput.selectionStart;

  window.adminProductSearch[collectionName] =
    searchInput ? searchInput.value : "";

  window.adminProductSubcat[collectionName] =
    subcatSelect ? subcatSelect.value : "all";

  render(collectionName);

  setTimeout(() => {
    const newInput = document.getElementById(`${collectionName}AdminSearch`);

    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(cursorPos, cursorPos);
    }
  }, 0);
}

window.filterAdminProducts = filterAdminProducts;

function editCategoryItem(collectionName, docId) {
  const item = (window.DATA[collectionName] || []).find((x) => x.docId === docId);
  if (!item) return;
  document.getElementById(`${collectionName}DocId`).value = docId;
  document.getElementById(`${collectionName}EditName`).value = item.name || "";
  document.getElementById(`${collectionName}EditBrand`).value = item.brand || "";
  document.getElementById(`${collectionName}EditCodigoBarras`).value = item.codigoBarras || "";
  document.getElementById(`${collectionName}EditCodigoBarrasAlt`).value = item.codigoBarrasAlternativo || "";
  document.getElementById(`${collectionName}EditSubcat`).value = item.subcat || window.CATEGORY_CONFIG[collectionName].subcategories[0][0];
  document.getElementById(`${collectionName}EditBadge`).value = item.badge || "";
  document.getElementById(`${collectionName}EditPrice`).value = item.price || "";
  document.getElementById(`${collectionName}EditPriceEfectivo`).value = item.priceEfectivo || "";
  document.getElementById(`${collectionName}EditOld`).value = item.old || "";
  document.getElementById(`${collectionName}EditStock`).value = item.stock !== null && item.stock !== undefined ? item.stock : "";
  document.getElementById(`${collectionName}EditMaxPorCompra`).value = item.maxPorCompra !== null && item.maxPorCompra !== undefined ? item.maxPorCompra : "";
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
  const maxPorCompraRaw = document.getElementById(`${collectionName}EditMaxPorCompra`).value;
  const data = {
    name: document.getElementById(`${collectionName}EditName`).value.trim(),
    brand: document.getElementById(`${collectionName}EditBrand`).value.trim(),
    codigoBarras: document.getElementById(`${collectionName}EditCodigoBarras`).value.trim() || null,
    codigoBarrasAlternativo: document.getElementById(`${collectionName}EditCodigoBarrasAlt`).value.trim() || null,
    subcat: document.getElementById(`${collectionName}EditSubcat`).value,
    badge: document.getElementById(`${collectionName}EditBadge`).value || null,
    price: Number(document.getElementById(`${collectionName}EditPrice`).value) || 0,
    priceEfectivo: Number(document.getElementById(`${collectionName}EditPriceEfectivo`).value) || null,
    old: Number(document.getElementById(`${collectionName}EditOld`).value) || null,
    stock: stockRaw === "" ? null : Number(stockRaw),
    maxPorCompra: maxPorCompraRaw === "" ? null : Number(maxPorCompraRaw),
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
  const maxPorCompraRaw = document.getElementById(`${collectionName}MaxPorCompra`).value;
  const name = document.getElementById(`${collectionName}Name`).value.trim();
  const price = Number(document.getElementById(`${collectionName}Price`).value) || 0;
  if (!name || !price) {
    showToast("⚠️ Completá nombre y precio", "err");
    return;
  }
  const data = {
    name,
    brand: document.getElementById(`${collectionName}Brand`).value.trim(),
    codigoBarras: document.getElementById(`${collectionName}CodigoBarras`).value.trim() || null,
    codigoBarrasAlternativo: document.getElementById(`${collectionName}CodigoBarrasAlt`).value.trim() || null,
    subcat: document.getElementById(`${collectionName}Subcat`).value,
    badge: document.getElementById(`${collectionName}Badge`).value || null,
    price,
    priceEfectivo: Number(document.getElementById(`${collectionName}PriceEfectivo`).value) || null,
    old: Number(document.getElementById(`${collectionName}Old`).value) || null,
    stock: stockRaw === "" ? null : Number(stockRaw),
    maxPorCompra: maxPorCompraRaw === "" ? null : Number(maxPorCompraRaw),
    img: document.getElementById(`${collectionName}Img`).value.trim()
  };
  const newId = await fbAdd(collectionName, data);
  if (newId) {
    showToast(`✅ ${conf.label} agregado - ya visible en el sitio`);
    document.getElementById(`${collectionName}Name`).value = "";
    document.getElementById(`${collectionName}Brand`).value = "";
    document.getElementById(`${collectionName}CodigoBarras`).value = "";
    document.getElementById(`${collectionName}CodigoBarrasAlt`).value = "";
    document.getElementById(`${collectionName}Subcat`).value = conf.subcategories[0][0];
    document.getElementById(`${collectionName}Badge`).value = "";
    document.getElementById(`${collectionName}Price`).value = "";
    document.getElementById(`${collectionName}PriceEfectivo`).value = "";
    document.getElementById(`${collectionName}Old`).value = "";
    document.getElementById(`${collectionName}Stock`).value = "";
    document.getElementById(`${collectionName}MaxPorCompra`).value = "";
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
  // Cantidad por categoría sin haber cargado sus productos (ver loadAll en admin.html).
  const categoryTotal = window.CATEGORY_COLLECTIONS.reduce((acc, key) => acc + (window.CATEGORY_COUNTS?.[key] ?? window.DATA[key]?.length ?? 0), 0);
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
          <button class="btn btn-ghost" onclick="navigate('perfumeria',null)" style="justify-content:flex-start">🌸 Perfumería</button>
          <button class="btn btn-ghost" onclick="navigate('bazar',null)" style="justify-content:flex-start">🍽️ Bazar</button>
          <button class="btn btn-ghost" onclick="navigate('usuarios',null)" style="justify-content:flex-start">👥 Usuarios / Puntos</button>
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

/* ══════════════════════════════════════════
   PAGE: MÁS VENDIDOS / NOVEDADES
   Cada entrada apunta a un producto de una categoría (coleccion +
   productId). En la tienda se muestra y se vende ese producto: su precio,
   su stock y su límite por compra. Lo que queda guardado acá (nombre,
   precio, imagen) es solo una foto del momento en que se eligió.
   Las entradas viejas, cargadas a mano, no tienen vínculo.
══════════════════════════════════════════ */

// Lo que está eligiendo el admin en el selector de producto.
// target: docId de la entrada que se está vinculando, o null si se agrega una nueva.
window.destacadoPicker = window.destacadoPicker || { cat: "", prodId: "", badge: "", target: null };

function destacadoVinculado(p) {
  return window.CATEGORY_COLLECTIONS.includes(p.coleccion) && !!p.productId;
}

function destacadosList(sec) {
  return sec === "best" ? window.DATA.best : window.DATA.newProds;
}

// Lee el producto real de cada entrada vinculada: así la lista muestra su
// precio de hoy y avisa si el producto se borró de su categoría (en ese caso
// la tienda no lo muestra). p._real queda en el producto, en false si no
// existe, o en null si no se pudo leer.
async function refreshDestacados(sec) {
  const pendientes = destacadosList(sec).filter((p) => destacadoVinculado(p) && p._real === undefined);
  if (!pendientes.length || typeof window.fsGetDoc !== "function") return;

  pendientes.forEach((p) => { p._real = null; });
  await Promise.all(pendientes.map(async (p) => {
    try {
      const snap = await window.fsGetDoc(window.fsDoc(window.db, p.coleccion, p.productId));
      p._real = snap.exists() ? snap.data() : false;
    } catch (e) {
      console.error("No se pudo leer el producto vinculado", p.coleccion, p.productId, e);
    }
  }));

  if (window.currentPage === destacadosPage(sec)) render(destacadosPage(sec));
}

function pageProducts(sec) {
  const list = destacadosList(sec);
  const colName = sec === "best" ? "bestSellers" : "newProducts";
  refreshDestacados(sec);
  const title = sec === "best" ? "MÁS VENDIDOS" : "NOVEDADES";
  const sinVincular = list.filter((p) => !destacadoVinculado(p));

  const picker = window.destacadoPicker;
  const target = picker.target ? list.find((p) => p.docId === picker.target) : null;
  const catLoaded = picker.cat && window.CATEGORY_LOADED?.[picker.cat];
  const catProducts = catLoaded
    ? [...(window.DATA[picker.cat] || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"))
    : [];

  const productSelect = !picker.cat
    ? `<select id="npProd" disabled><option>Elegí primero la categoría</option></select>`
    : !catLoaded
      ? `<select id="npProd" disabled><option>Cargando productos…</option></select>`
      : `<select id="npProd" onchange="destacadoPickerProd(this.value)">
           <option value="">Elegí el producto (${catProducts.length})</option>
           ${catProducts.map((p) => `<option value="${esc(p.docId)}" ${picker.prodId === p.docId ? "selected" : ""}>${esc(p.name || "")} — $${Number(p.price || 0).toLocaleString("es-AR")}${p.stock != null && Number(p.stock) <= 0 ? " (sin stock)" : ""}</option>`).join("")}
         </select>`;

  return `
    <div class="page-header"><div><div class="page-title">${title.split(" ")[0]} <span>${title.split(" ").slice(1).join(" ")}</span></div><div class="page-sub">En la tienda se muestran con el precio y el stock del producto real de su categoría</div></div></div>
    ${sinVincular.length ? `
      <div style="padding:14px 18px;background:rgba(240,192,64,.06);border:1px solid rgba(240,192,64,.2);border-radius:10px;font-size:13px;color:var(--yellow);margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <span style="flex:1;min-width:240px">⚠️ ${sinVincular.length} producto${sinVincular.length !== 1 ? "s" : ""} sin vincular a su categoría. Se ${sinVincular.length !== 1 ? "muestran" : "muestra"} con el precio cargado acá, que puede estar desactualizado, y no ${sinVincular.length !== 1 ? "avisan" : "avisa"} si falta stock.</span>
        <button class="btn btn-primary btn-sm" onclick="autoLinkDestacados('${colName}','${sec}')">🔗 Vincular automáticamente por nombre</button>
      </div>` : ""}
    ${card(`Productos (${list.length})`, "🛍️", `
      <div class="prod-list">
        ${list.map((entrada) => {
          const vinculado = destacadoVinculado(entrada);
          const borrado = vinculado && entrada._real === false;
          // Si ya se leyó el producto real, se muestran sus datos de hoy.
          const p = vinculado && entrada._real ? { ...entrada, ...entrada._real, docId: entrada.docId, badge: entrada.badge || entrada._real.badge } : entrada;
          const categoria = esc(window.CATEGORY_CONFIG[entrada.coleccion]?.label || entrada.coleccion);
          return `
          <div class="prod-item">
            <div class="prod-thumb"><img src="${esc(p.img || "")}" alt="${esc(p.name || "")}"/></div>
            <div class="prod-meta">
              <strong>${esc(p.name || "")}</strong>
              <div class="meta-row">
                <span class="meta-price">$${Number(p.price || 0).toLocaleString("es-AR")}</span>
                ${p.old ? `<span style="font-size:12px;color:var(--muted);text-decoration:line-through;font-family:var(--font-mono)">$${Number(p.old).toLocaleString("es-AR")}</span>` : ""}
                <span class="meta-brand">${esc(p.brand || "")}</span>
                ${prodBadge(p.badge)}
                ${borrado
                  ? `<span style="font-family:var(--font-mono);font-size:11px;color:#f87171">❌ Ya no existe en ${categoria}: no se muestra en la tienda</span>`
                  : vinculado
                    ? `<span style="font-family:var(--font-mono);font-size:11px;color:#4ade80">🔗 ${categoria}</span>${p.stock != null && Number(p.stock) <= 0 ? `<span style="font-family:var(--font-mono);font-size:11px;color:#f87171">Sin stock</span>` : ""}`
                    : `<span style="font-family:var(--font-mono);font-size:11px;color:var(--yellow)">⚠️ Sin vincular</span>`}
              </div>
            </div>
            <div class="prod-actions">
              <button class="btn btn-ghost btn-sm" onclick="startLinkDestacado('${p.docId}','${sec}')">${vinculado ? "🔁 Cambiar producto" : "🔗 Vincular"}</button>
              <button class="btn btn-ghost btn-sm" onclick="openEditModal('${p.docId}','${colName}')">✏️ Editar</button>
              <button class="btn btn-danger btn-sm" onclick="delProd('${p.docId}','${colName}','${sec}')">🗑</button>
            </div>
          </div>`;
        }).join("")}
      </div>`)}
    <div class="add-panel" id="destacadoPickerPanel">
      <div class="add-panel-title">${target ? `🔗 VINCULAR «${esc(target.name || "")}» CON SU PRODUCTO` : "➕ AGREGAR PRODUCTO"}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Elegí el producto de su categoría. El precio, la imagen y el stock salen de ahí.</div>
      <div class="field-row">
        ${field("Categoría", `<select id="npCat" onchange="destacadoPickerCat('${sec}', this.value)">
          <option value="">Elegí la categoría</option>
          ${window.CATEGORY_COLLECTIONS.map((c) => `<option value="${c}" ${picker.cat === c ? "selected" : ""}>${window.CATEGORY_CONFIG[c].label}</option>`).join("")}
        </select>`)}
        ${field("Producto", productSelect)}
      </div>
      ${target ? "" : field("Badge", `<select id="npBadge" onchange="window.destacadoPicker.badge = this.value"><option value="" ${!picker.badge ? "selected" : ""}>El del producto</option><option value="new" ${picker.badge === "new" ? "selected" : ""}>NUEVO</option><option value="offer" ${picker.badge === "offer" ? "selected" : ""}>OFERTA</option><option value="hot" ${picker.badge === "hot" ? "selected" : ""}>HOT</option></select>`)}
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-primary" onclick="confirmDestacadoPicker('${colName}','${sec}')">${target ? "🔗 Vincular" : "✅ Agregar"}</button>
        ${target ? `<button class="btn btn-ghost" onclick="cancelLinkDestacado('${sec}')">Cancelar</button>` : ""}
      </div>
    </div>`;
}

const destacadosPage = (sec) => (sec === "best" ? "best" : "newp");

function destacadoPickerCat(sec, cat) {
  window.destacadoPicker.cat = window.CATEGORY_COLLECTIONS.includes(cat) ? cat : "";
  window.destacadoPicker.prodId = "";
  // Los productos de la categoría se piden recién acá (ver ensureCategoryLoaded en admin.html).
  if (window.destacadoPicker.cat && typeof window.ensureCategoryLoaded === "function") {
    window.ensureCategoryLoaded(window.destacadoPicker.cat);
  }
  render(destacadosPage(sec));
}
window.destacadoPickerCat = destacadoPickerCat;

function destacadoPickerProd(prodId) {
  window.destacadoPicker.prodId = prodId;
}
window.destacadoPickerProd = destacadoPickerProd;

function startLinkDestacado(docId, sec) {
  const p = destacadosList(sec).find((x) => x.docId === docId);
  if (!p) return;
  const cat = window.CATEGORY_COLLECTIONS.includes(p.coleccion) ? p.coleccion : "";
  window.destacadoPicker = { cat, prodId: cat ? (p.productId || "") : "", badge: "", target: docId };
  if (cat && typeof window.ensureCategoryLoaded === "function") window.ensureCategoryLoaded(cat);
  render(destacadosPage(sec));
  document.getElementById("destacadoPickerPanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
}
window.startLinkDestacado = startLinkDestacado;

function cancelLinkDestacado(sec) {
  window.destacadoPicker = { cat: "", prodId: "", badge: "", target: null };
  render(destacadosPage(sec));
}
window.cancelLinkDestacado = cancelLinkDestacado;

async function confirmDestacadoPicker(colName, sec) {
  const picker = window.destacadoPicker;
  const list = destacadosList(sec);
  const real = picker.cat ? (window.DATA[picker.cat] || []).find((p) => p.docId === picker.prodId) : null;
  if (!real) return showToast("⚠️ Elegí la categoría y el producto", "err");

  if (list.some((p) => p.docId !== picker.target && p.coleccion === picker.cat && p.productId === real.docId)) {
    return showToast("⚠️ Ese producto ya está en la lista", "err");
  }

  // Vínculo + foto del producto para verlo en esta lista.
  const data = {
    coleccion: picker.cat,
    productId: real.docId,
    name: real.name || "",
    brand: real.brand || "",
    price: Number(real.price) || 0,
    old: Number(real.old) || null,
    img: real.img || ""
  };

  if (picker.target) {
    const ok = await fbSave(colName, picker.target, data);
    if (!ok) return;
    const entry = list.find((p) => p.docId === picker.target);
    if (entry) Object.assign(entry, data, { _real: real });
    showToast("🔗 Producto vinculado - la tienda ya muestra su precio y stock reales");
  } else {
    data.badge = picker.badge || null;
    const newId = await fbAdd(colName, data);
    if (!newId) return;
    list.push({ docId: newId, ...data, _real: real });
    showToast("✅ Producto agregado - ya visible en el sitio");
  }

  window.destacadoPicker = { cat: picker.cat, prodId: "", badge: "", target: null };
  render(destacadosPage(sec));
}
window.confirmDestacadoPicker = confirmDestacadoPicker;

// Busca cada entrada sin vincular por su nombre exacto en las 11 categorías.
// Solo vincula cuando hay un único producto con ese nombre.
async function autoLinkDestacados(colName, sec) {
  const list = destacadosList(sec);
  const pendientes = list.filter((p) => !destacadoVinculado(p));
  if (!pendientes.length) return;
  if (!confirm(`Se va a buscar cada uno de los ${pendientes.length} productos sin vincular por su nombre exacto en las categorías.\n\nLos que tengan un único producto con ese nombre quedan vinculados. Los demás hay que vincularlos a mano.`)) return;

  let vinculados = 0;
  const sinResolver = [];

  for (const p of pendientes) {
    try {
      const encontrados = [];
      if (p.name) {
        const snaps = await Promise.all(window.CATEGORY_COLLECTIONS.map((c) =>
          window.fsGetDocs(window.fsQuery(window.fsCollection(window.db, c), window.fsWhere("name", "==", p.name), window.fsLimit(2)))
        ));
        snaps.forEach((snap, i) => snap.forEach((d) => encontrados.push({ coleccion: window.CATEGORY_COLLECTIONS[i], productId: d.id })));
      }

      if (encontrados.length === 1) {
        const ok = await fbSave(colName, p.docId, encontrados[0]);
        if (ok) {
          Object.assign(p, encontrados[0]);
          vinculados += 1;
          continue;
        }
      }
      sinResolver.push(p.name || p.docId);
    } catch (e) {
      console.error("No se pudo vincular", p.name, e);
      sinResolver.push(p.name || p.docId);
    }
  }

  render(destacadosPage(sec));
  showToast(sinResolver.length
    ? `🔗 ${vinculados} vinculado${vinculados !== 1 ? "s" : ""}. ${sinResolver.length} sin un producto único con ese nombre: vinculalos a mano.`
    : `🔗 ${vinculados} producto${vinculados !== 1 ? "s" : ""} vinculado${vinculados !== 1 ? "s" : ""}`, sinResolver.length ? "err" : "ok");
}
window.autoLinkDestacados = autoLinkDestacados;

function openEditModal(docId, colName) {
  const list = colName === "bestSellers" ? window.DATA.best : window.DATA.newProds;
  const p = list.find((x) => x.docId === docId);
  if (!p) return;
  const vinculado = destacadoVinculado(p);
  document.getElementById("mDocId").value = docId;
  document.getElementById("mCollection").value = colName;
  document.getElementById("mName").value = p.name || "";
  document.getElementById("mBrand").value = p.brand || "";
  document.getElementById("mPrice").value = p.price || "";
  document.getElementById("mOld").value = p.old || "";
  document.getElementById("mImg").value = p.img || "";
  document.getElementById("mBadge").value = p.badge || "";
  // Un producto vinculado toma nombre, precio e imagen de su categoría: acá solo se elige el badge.
  document.getElementById("mCopyFields").style.display = vinculado ? "none" : "";
  document.getElementById("mLinkedNote").style.display = vinculado ? "" : "none";
  if (vinculado) {
    document.getElementById("mLinkedNote").textContent = `«${p.name || ""}» está vinculado a ${window.CATEGORY_CONFIG[p.coleccion]?.label || p.coleccion}. El nombre, el precio, la imagen y el stock se editan en esa categoría; acá solo se elige el badge.`;
  }
  previewImg("mImg", "mImgPrev");
  document.getElementById("editModal").classList.add("open");
}
window.openEditModal = openEditModal;

async function saveEditModal() {
  const docId = document.getElementById("mDocId").value;
  const colName = document.getElementById("mCollection").value;
  const list = colName === "bestSellers" ? window.DATA.best : window.DATA.newProds;
  const entry = list.find((x) => x.docId === docId);
  const badge = document.getElementById("mBadge").value || null;
  const data = entry && destacadoVinculado(entry)
    ? { badge }
    : {
        name: document.getElementById("mName").value,
        brand: document.getElementById("mBrand").value,
        price: Number(document.getElementById("mPrice").value) || 0,
        old: Number(document.getElementById("mOld").value) || null,
        img: document.getElementById("mImg").value,
        badge
      };
  const ok = await fbSave(colName, docId, data);
  if (ok) {
    if (entry) Object.assign(entry, data);
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
    if (window.destacadoPicker.target === docId) window.destacadoPicker.target = null;
    render(sec === "best" ? "best" : "newp");
    showToast("🗑 Producto eliminado de Firebase");
  }
}
window.delProd = delProd;

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

/* ══════════════════════════════════════════
   PAGE: USUARIOS / PUNTOS
══════════════════════════════════════════ */

window.adminUsersSearch = window.adminUsersSearch || "";

function pageUsuarios() {
  const users = window.DATA.users || [];
  const term = (window.adminUsersSearch || "").toLowerCase().trim();

  const filteredUsers = users.filter((u) => {
    if (!term) return true;

    return (
      String(u.name || "").toLowerCase().includes(term) ||
      String(u.email || "").toLowerCase().includes(term) ||
      String(u.phone || "").toLowerCase().includes(term)
    );
  });

  return `
    <div class="page-header">
      <div>
        <div class="page-title">USUARIOS <span>/ PUNTOS</span></div>
        <div class="page-sub">Sumá, restá o fijá puntos manualmente a clientes registrados.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>👥</span> Usuarios registrados (${filteredUsers.length}/${users.length})
        </div>
      </div>

      <div class="card-body">
        <div class="field" style="margin-bottom:16px">
          <label>Buscar usuario</label>
          <input
            id="adminUsersSearch"
            placeholder="Buscar por nombre, email o teléfono..."
            value="${esc(window.adminUsersSearch || "")}"
            oninput="filterAdminUsers()"
          />
        </div>

        <div class="prod-list">
          ${
            filteredUsers.length === 0
              ? `<p style="color:var(--muted);text-align:center;padding:24px">No hay usuarios que coincidan con la búsqueda.</p>`
              : filteredUsers.map((u) => {
                  const points = Number(u.points || 0);
                  const name = u.name || "Usuario sin nombre";
                  const email = u.email || "Sin email";
                  const phone = u.phone || "";

                  return `
                    <div class="prod-item">
                      <div class="prod-thumb">
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:24px">
                          👤
                        </div>
                      </div>

                      <div class="prod-meta">
                        <strong>${esc(name)}</strong>
                        <div class="meta-row">
                          <span class="meta-brand">${esc(email)}</span>
                          ${phone ? `<span class="meta-brand">📞 ${esc(phone)}</span>` : ""}
                          <span style="font-family:var(--font-mono);font-size:12px;color:var(--yellow)">
                            ⭐ ${points.toLocaleString("es-AR")} puntos
                          </span>
                        </div>

                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                          <input
                            id="pointsAmount-${u.docId}"
                            type="number"
                            min="0"
                            placeholder="Cantidad"
                            style="max-width:130px"
                          />

                          <input
                            id="pointsReason-${u.docId}"
                            placeholder="Motivo, opcional"
                            style="max-width:220px"
                          />

                          <button class="btn btn-success btn-sm" onclick="changeUserPoints('${u.docId}', 'add')">
                            ➕ Sumar
                          </button>

                          <button class="btn btn-danger btn-sm" onclick="changeUserPoints('${u.docId}', 'subtract')">
                            ➖ Restar
                          </button>

                          <button class="btn btn-ghost btn-sm" onclick="changeUserPoints('${u.docId}', 'set')">
                            🎯 Fijar
                          </button>
                        </div>
                      </div>
                    </div>`;
                }).join("")
          }
        </div>
      </div>
    </div>`;
}

function filterAdminUsers() {
  const input = document.getElementById("adminUsersSearch");
  window.adminUsersSearch = input ? input.value : "";
  render("usuarios");
}

window.filterAdminUsers = filterAdminUsers;

async function changeUserPoints(userId, mode) {
  const user = (window.DATA.users || []).find((u) => u.docId === userId);
  if (!user) {
    showToast("⚠️ Usuario no encontrado", "err");
    return;
  }

  const amountInput = document.getElementById(`pointsAmount-${userId}`);
  const reasonInput = document.getElementById(`pointsReason-${userId}`);

  const amount = Number(amountInput?.value || 0);
  const reason = reasonInput?.value.trim() || "";

  if (!amount || amount < 0) {
    showToast("⚠️ Ingresá una cantidad válida", "err");
    return;
  }

  const currentPoints = Number(user.points || 0);
  let newPoints = currentPoints;

  if (mode === "add") {
    newPoints = currentPoints + amount;
  }

  if (mode === "subtract") {
    newPoints = Math.max(0, currentPoints - amount);
  }

  if (mode === "set") {
    newPoints = amount;
  }

  const actionLabel =
    mode === "add" ? "sumar" :
    mode === "subtract" ? "restar" :
    "fijar";

  const okConfirm = confirm(
    `¿Confirmás ${actionLabel} puntos a ${user.name || user.email || "este usuario"}?\n\nPuntos actuales: ${currentPoints}\nNuevo saldo: ${newPoints}`
  );

  if (!okConfirm) return;

  const ok = await fbSave("users", userId, {
    points: newPoints,
    pointsUpdatedAt: new Date()
  });

  if (!ok) return;

  await fbAdd("pointMovements", {
    userId,
    userName: user.name || "",
    userEmail: user.email || "",
    previousPoints: currentPoints,
    newPoints,
    amount,
    mode,
    reason,
    createdAt: new Date()
  });

  showToast(`✅ Puntos actualizados: ${newPoints.toLocaleString("es-AR")}`);

  if (amountInput) amountInput.value = "";
  if (reasonInput) reasonInput.value = "";

  render("usuarios");
}

window.changeUserPoints = changeUserPoints;

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

/* ══════════════════════════════════════════
   PAGE: PEDIDOS (Gestión de órdenes)
══════════════════════════════════════════ */

// Estados de un pedido. El orden es el de las tarjetas y el del filtro.
//   pending          transferencia o efectivo: todavía no pagó
//   pending_payment  Mercado Pago: el cliente todavía no pagó
//   payment_confirmed  Mercado Pago avisó que el pago se acreditó
//   confirmed        el admin confirmó el pago a mano
// "next" es el paso siguiente que ofrece el botón; "nextLabel", su texto.
const ORDER_STATUS = {
  pending: { label: '⏳ Pendiente de pago', short: 'Pendiente de pago', color: '#f0c040', next: 'confirmed', nextLabel: '✅ Confirmar pago' },
  pending_payment: { label: '💳 Mercado Pago sin pagar', short: 'MP sin pagar', color: '#f59e0b', next: 'confirmed', nextLabel: '✅ Dar por pagado a mano' },
  payment_confirmed: { label: '✅ Pago acreditado (Mercado Pago)', short: 'Pago acreditado MP', color: '#4ade80', next: 'processing' },
  confirmed: { label: '✅ Pago confirmado', short: 'Pago confirmado', color: '#4ade80', next: 'processing' },
  processing: { label: '📦 En proceso de armado', short: 'En armado', color: '#a78bfa', next: 'shipped' },
  shipped: { label: '🚚 Despachado', short: 'Despachado', color: '#60a5fa', next: 'completed' },
  completed: { label: '🎉 Completado', short: 'Completado', color: '#34d399', next: null },
  cancelled: { label: '❌ Cancelado', short: 'Cancelado', color: '#f87171', next: null }
};

// Un estado que el panel no conoce se muestra tal cual, sin disfrazarlo de otro.
function orderStatusInfo(status) {
  return ORDER_STATUS[status] || { label: esc(status || 'Sin estado'), short: '', color: '#9ca3af', next: null };
}

// Qué pasó con los puntos que gana la compra (ver js/pedidos-estado.js).
function orderPointsNote(order) {
  // El cliente pagó con un descuento en puntos que ya había gastado en otro pedido.
  const faltantes = Number(order.pointsFaltantes) || 0;
  if (faltantes > 0 && order.status !== 'cancelled') {
    return ` · ⚠️ usó puntos que ya había gastado en otro pedido: faltan cobrar $${faltantes.toLocaleString('es-AR')}`;
  }
  if (order.status === 'cancelled') return ' · anulados';
  if (order.pointsApplied === false) return ' · se acreditan al confirmar el pago';
  return '';
}

function pagePedidos() {
  const orders = window.DATA.pedidos || [];
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });

  return `
    <div class="page-header">
      <div>
        <div class="page-title">GESTIÓN DE <span>PEDIDOS</span></div>
        <div class="page-sub">Administrá los pedidos de los clientes y actualizá su estado</div>
      </div>
    </div>

    <div class="orders-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px">
      ${Object.entries(ORDER_STATUS).map(([key, value]) => `
        <div class="stat-card" style="display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;padding:12px;cursor:pointer" onclick="filterOrdersByStatus('${key}')">
          <div style="font-size:24px">${value.label.split(' ')[0]}</div>
          <div style="font-size:28px;font-weight:bold;color:${value.color}" id="count-${key}">0</div>
          <div style="font-size:11px;line-height:1.3;color:var(--muted)">${value.short}</div>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><span>📋</span> Listado de pedidos</div>
        <div class="filters" style="display:flex;gap:10px">
          <select id="statusFilter" onchange="filterOrdersByStatus(this.value)" class="form-input" style="width:180px;padding:6px 10px">
            <option value="all">Todos los estados</option>
            ${Object.entries(ORDER_STATUS).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}
          </select>
          <input type="text" id="searchOrder" placeholder="Buscar por #pedido o cliente..." class="form-input" style="width:200px" oninput="filterOrders()">
        </div>
      </div>
      <div class="card-body">
        <div id="ordersListContainer" class="orders-list-container">
          <div style="text-align:center;padding:40px;color:var(--muted)">Cargando pedidos...</div>
        </div>
      </div>
    </div>

    <div class="modal-back hidden" id="editPedidoModal">
      <div class="modal-box" style="max-width:560px">
        <button class="modal-close" onclick="closeEditPedidoModal()">✕</button>
        <div class="modal-title">EDITAR <span style="color:var(--purple-lt)">PEDIDO</span></div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px">
          Sacá productos sin stock o ajustá la cantidad. El total se recalcula solo.
        </div>
        <div id="editPedidoItemsList"></div>
        <div id="editPedidoTotals" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"></div>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-primary" onclick="saveEditPedido()">💾 Guardar cambios</button>
          <button class="btn btn-ghost" onclick="closeEditPedidoModal()">Cancelar</button>
        </div>
      </div>
    </div>

    <style>
      .order-card {
        background: var(--bg3);
        border: 1px solid var(--border);
        border-radius: 12px;
        margin-bottom: 16px;
        overflow: hidden;
        transition: all 0.2s;
      }
      .order-card:hover {
        border-color: var(--purple);
      }
      .order-header {
        padding: 16px 20px;
        background: rgba(124,58,237,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        border-bottom: 1px solid var(--border);
      }
      .order-id {
        font-family: var(--font-mono);
        font-size: 14px;
        font-weight: bold;
        color: var(--purple-lt);
      }
      .order-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }
      .order-customer {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .order-customer-name {
        font-weight: 600;
      }
      .order-customer-email {
        font-size: 12px;
        color: var(--muted);
      }
      .order-total {
        font-size: 18px;
        font-weight: bold;
        color: var(--yellow);
      }
      .order-details {
        padding: 16px 20px;
        display: none;
        border-top: 1px solid var(--border);
        background: var(--bg2);
      }
      .order-details.show {
        display: block;
      }
      .order-products-list {
        margin-bottom: 16px;
      }
      .order-product {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(61,48,88,0.3);
      }
      .order-product-name {
        flex: 2;
      }
      .order-product-qty {
        width: 60px;
        text-align: center;
      }
      .order-product-price {
        width: 100px;
        text-align: right;
      }
      .order-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
        padding: 12px;
        background: var(--bg3);
        border-radius: 10px;
      }
      .order-info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .order-info-label {
        font-size: 11px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .order-info-value {
        font-size: 14px;
        font-weight: 500;
      }
      .status-buttons {
        display: flex;
        gap: 10px;
        margin-top: 16px;
        justify-content: flex-end;
      }
      .btn-xs {
        padding: 4px 12px;
        font-size: 11px;
      }
    </style>
  `;
}

// Variable para filtro actual
let currentStatusFilter = 'all';
let currentSearchTerm = '';

function renderOrdersList() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  let orders = [...(window.DATA.pedidos || [])];

  // Filtrar por estado
  if (currentStatusFilter !== 'all') {
    orders = orders.filter(o => o.status === currentStatusFilter);
  }

  // Filtrar por búsqueda
  if (currentSearchTerm) {
    const term = currentSearchTerm.toLowerCase();
    orders = orders.filter(o =>
      String(o.orderId || '').toLowerCase().includes(term) ||
      String(o.contact?.name || '').toLowerCase().includes(term) ||
      String(o.contact?.email || '').toLowerCase().includes(term)
    );
  }

  // Ordenar por fecha (más reciente primero)
  orders.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });

  if (orders.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No hay pedidos con los filtros seleccionados.</div>';
    return;
  }

  container.innerHTML = orders.map(order => {
    const status = orderStatusInfo(order.status);
    const cerrado = order.status === 'completed' || order.status === 'cancelled';
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="order-card" data-order-id="${esc(order.orderId || order.id)}">
        <div class="order-header">
          <div>
            <span class="order-id">#${esc(String(order.orderId || order.id).slice(-8).toUpperCase())}</span>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">${formattedDate}</div>
          </div>
          <div class="order-customer">
            <div class="order-customer-name">${esc(order.contact?.name || '—')}</div>
            <div class="order-customer-email">${esc(order.contact?.email || '—')}</div>
          </div>
          <div>
            <span class="order-status" style="background:${status.color}20;color:${status.color};border:1px solid ${status.color}40">
              ${status.label}
            </span>
          </div>
          <div class="order-total">$${Number(order.total || 0).toLocaleString('es-AR')}</div>
          <button class="btn btn-ghost btn-sm" onclick="toggleOrderDetails('${order.id}')">
            <i class="fas fa-chevron-down"></i> Ver detalles
          </button>
        </div>
        <div class="order-details" id="order-details-${order.id}">
          <div class="order-info-grid">
            <div class="order-info-item">
              <span class="order-info-label">📞 Teléfono</span>
              <span class="order-info-value">${esc(order.contact?.phone || '—')}</span>
            </div>
            <div class="order-info-item">
              <span class="order-info-label">📍 Dirección</span>
              <span class="order-info-value">${esc(order.contact?.street || '')}, ${esc(order.contact?.city || '')}, ${esc(order.contact?.province || '')}</span>
            </div>
            <div class="order-info-item">
              <span class="order-info-label">🚚 Envío</span>
              <span class="order-info-value">${order.delivery === 'local' ? 'Retiro en sucursal' : 'Envío a domicilio'} ${Number(order.deliveryCost) > 0 ? '($' + Number(order.deliveryCost).toLocaleString('es-AR') + ')' : ''}</span>
            </div>
            <div class="order-info-item">
              <span class="order-info-label">💳 Pago</span>
              <span class="order-info-value">${order.payment === 'mp' ? 'Mercado Pago' : order.payment === 'transfer' ? 'Transferencia' : 'Efectivo'}${order.mpPaymentId ? ' · pago n.º ' + esc(order.mpPaymentId) : ''}</span>
            </div>
            <div class="order-info-item">
              <span class="order-info-label">⭐ Puntos</span>
              <span class="order-info-value">Usados: ${Number(order.pointsUsed || 0)} | Ganados: ${Number(order.pointsEarned || 0)}${orderPointsNote(order)}</span>
            </div>
            <div class="order-info-item">
              <span class="order-info-label">📝 Notas</span>
              <span class="order-info-value">${esc(order.contact?.notes || '—')}</span>
            </div>
          </div>

          <div class="order-products-list">
            <div style="font-weight:600;margin-bottom:8px">🛍️ Productos:</div>
            ${(order.items || []).map(item => `
              <div class="order-product">
                <span class="order-product-name">${esc(item.name)}</span>
                <span class="order-product-qty">x${esc(item.qty)}</span>
                <span class="order-product-price">$${(Number(item.price) * Number(item.qty)).toLocaleString('es-AR')}</span>
              </div>
            `).join('')}
          </div>

          <div class="status-buttons">
            ${cerrado ? '' : `
              <button class="btn btn-danger btn-xs" style="margin-right:auto" onclick="updateOrderStatus('${order.id}', 'cancelled')">
                ❌ Cancelar pedido
              </button>
              <button class="btn btn-ghost btn-xs" onclick="openEditPedidoModal('${order.id}')">✏️ Editar pedido</button>
            `}
            ${status.next ? `
              <button class="btn btn-primary btn-xs" onclick="updateOrderStatus('${order.id}', '${status.next}')">
                ${status.nextLabel || '→ ' + ORDER_STATUS[status.next].label}
              </button>
            ` : ''}
            ${cerrado ? '' : `
              <button class="btn btn-ghost btn-xs" onclick="updateOrderStatus('${order.id}', 'completed')">
                ✓ Marcar como completado
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Actualizar contadores
  updateStatusCounters();
}

function updateStatusCounters() {
  const orders = window.DATA.pedidos || [];
  Object.keys(ORDER_STATUS).forEach(status => {
    const count = orders.filter(o => o.status === status).length;
    const el = document.getElementById(`count-${status}`);
    if (el) el.textContent = count;
  });
}

function toggleOrderDetails(orderId) {
  const details = document.getElementById(`order-details-${orderId}`);
  if (details) {
    details.classList.toggle('show');
  }
}

function filterOrdersByStatus(status) {
  currentStatusFilter = status;
  const select = document.getElementById('statusFilter');
  if (select) select.value = status;
  renderOrdersList();
}

function filterOrders() {
  const searchInput = document.getElementById('searchOrder');
  currentSearchTerm = searchInput?.value || '';
  renderOrdersList();
}

// Texto del aviso antes de cambiar el estado: dice qué más va a pasar.
function orderStatusConfirmText(order, newStatus) {
  if (newStatus === 'cancelled') {
    return '¿Cancelar este pedido?\n\nSe devuelve el stock al catálogo, se le devuelven al cliente los puntos que usó y se le quitan los que ganó con esta compra.\n\nNo se puede deshacer.';
  }
  if (order?.status === 'pending_payment' && (newStatus === 'confirmed' || newStatus === 'completed')) {
    return 'Mercado Pago todavía no avisó que este pedido esté pago.\n\n¿Lo das por pagado igual? Se descuenta el stock y se aplican los puntos del cliente.';
  }
  if (order?.pointsApplied === false && (newStatus === 'confirmed' || newStatus === 'completed')) {
    return `¿Cambiar el estado del pedido a "${ORDER_STATUS[newStatus]?.label}"?\n\nAl cliente se le acreditan los puntos de esta compra.`;
  }
  return `¿Cambiar el estado del pedido a "${ORDER_STATUS[newStatus]?.label}"?`;
}

async function updateOrderStatus(orderId, newStatus) {
  const order = (window.DATA.pedidos || []).find(o => o.id === orderId);
  if (!confirm(orderStatusConfirmText(order, newStatus))) return;

  try {
    // El cambio de estado, los puntos y el stock van juntos (js/pedidos-estado.js).
    const r = await window.cambiarEstadoPedido(orderId, newStatus);

    const extras = [];
    if (r.puntos > 0) extras.push(`+${r.puntos} puntos al cliente`);
    if (r.puntos < 0) extras.push(`${r.puntos} puntos al cliente`);
    if (r.stock) extras.push(`stock ${r.stock}`);

    showToast(`✅ Pedido actualizado a ${ORDER_STATUS[newStatus]?.label}${extras.length ? ' · ' + extras.join(' · ') : ''}`);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    showToast('❌ ' + esc(error?.message || 'Error al actualizar el estado'), 'err');
  }
}

/* ─────────────────────────────────────
   EDITAR PEDIDO (sacar productos sin stock)
───────────────────────────────────── */
let editingPedido = null;

function openEditPedidoModal(docId) {
  const order = (window.DATA.pedidos || []).find(o => o.id === docId);
  if (!order) return;

  editingPedido = {
    docId,
    items: (order.items || []).map(i => ({ ...i })),
    deliveryCost: Number(order.deliveryCost || 0),
    pointsUsed: Number(order.pointsUsed || 0)
  };

  renderEditPedidoItems();

  const modal = document.getElementById('editPedidoModal');
  modal.classList.remove('hidden');
  modal.classList.add('open');
}
window.openEditPedidoModal = openEditPedidoModal;

function closeEditPedidoModal() {
  const modal = document.getElementById('editPedidoModal');
  if (modal) {
    modal.classList.remove('open');
    modal.classList.add('hidden');
  }
  editingPedido = null;
}
window.closeEditPedidoModal = closeEditPedidoModal;

function removeEditingItem(idx) {
  if (!editingPedido) return;
  editingPedido.items.splice(idx, 1);
  renderEditPedidoItems();
}
window.removeEditingItem = removeEditingItem;

function changeEditingItemQty(idx, delta) {
  if (!editingPedido) return;
  const item = editingPedido.items[idx];
  if (!item) return;

  const newQty = Number(item.qty || 1) + delta;
  if (newQty <= 0) {
    editingPedido.items.splice(idx, 1);
  } else {
    item.qty = newQty;
  }
  renderEditPedidoItems();
}
window.changeEditingItemQty = changeEditingItemQty;

function renderEditPedidoItems() {
  const list = document.getElementById('editPedidoItemsList');
  const totalsEl = document.getElementById('editPedidoTotals');
  if (!list || !totalsEl || !editingPedido) return;

  if (editingPedido.items.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);text-align:center;padding:12px">Sin productos — vaciaste el pedido.</p>`;
  } else {
    list.innerHTML = editingPedido.items.map((item, idx) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1">
          <div style="font-weight:600">${esc(item.name)}</div>
          <div style="font-size:12px;color:var(--muted)">$${Number(item.price || 0).toLocaleString('es-AR')} c/u</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="changeEditingItemQty(${idx}, -1)">−</button>
          <span style="min-width:20px;text-align:center">${esc(item.qty)}</span>
          <button class="btn btn-ghost btn-sm" onclick="changeEditingItemQty(${idx}, 1)">+</button>
        </div>
        <div style="width:90px;text-align:right;font-weight:600">$${(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString('es-AR')}</div>
        <button class="btn btn-danger btn-sm" onclick="removeEditingItem(${idx})" title="Quitar">✕</button>
      </div>
    `).join('');
  }

  const subtotal = editingPedido.items.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0);
  const total = Math.max(0, subtotal + editingPedido.deliveryCost - editingPedido.pointsUsed);

  totalsEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>Subtotal</span><span>$${subtotal.toLocaleString('es-AR')}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>Envío</span><span>$${editingPedido.deliveryCost.toLocaleString('es-AR')}</span></div>
    ${editingPedido.pointsUsed > 0 ? `<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px;color:var(--purple-lt)"><span>⭐ Puntos usados</span><span>-$${editingPedido.pointsUsed.toLocaleString('es-AR')}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;margin-top:8px"><span>Total</span><span style="color:var(--yellow)">$${total.toLocaleString('es-AR')}</span></div>
  `;
}
window.renderEditPedidoItems = renderEditPedidoItems;

async function saveEditPedido() {
  if (!editingPedido) return;

  if (!confirm('¿Guardar los cambios? Esto actualiza el total y los productos que ve el cliente.')) return;

  const newItems = editingPedido.items.map(i => ({
    ...i,
    subtotal: Number(i.price || 0) * Number(i.qty || 0)
  }));
  const subtotal = newItems.reduce((s, i) => s + i.subtotal, 0);
  const total = Math.max(0, subtotal + editingPedido.deliveryCost - editingPedido.pointsUsed);
  const pointsEarned = Math.floor(subtotal / 100);

  const ok = await fbSave('pedidos', editingPedido.docId, {
    items: newItems,
    subtotal,
    total,
    pointsEarned
  });

  if (ok) {
    showToast('✅ Pedido actualizado');
    closeEditPedidoModal();
  }
}
window.saveEditPedido = saveEditPedido;

// Exponer funciones globales
window.pagePedidos = pagePedidos;
window.renderOrdersList = renderOrdersList;
window.toggleOrderDetails = toggleOrderDetails;
window.filterOrdersByStatus = filterOrdersByStatus;
window.filterOrders = filterOrders;
window.updateOrderStatus = updateOrderStatus;