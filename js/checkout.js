/* ══════════════════════════════════════════════════════════════
   checkout.js — Lógica completa del checkout Lobo24
   Pasos: 1.Carrito → 2.Datos → 3.Envío → 4.Pago → 5.Confirmación
══════════════════════════════════════════════════════════════ */

/* ── Estado global del checkout ── */
const STATE = {
  step: 1,
  cart: [],
  contact: {},
  delivery: null,
  deliveryCost: 0,
  deliveryDistance: null,
  payment: null,
  pointsUsed: 0,
  orderId: null,
  lastOrder: null,
};

/* ── Datos de la tienda ── */
const STORE = {
  name: 'Lobo24',
  address: 'Sarmiento 322, Resistencia, Chaco',
  lat: -27.4514,
  lng: -58.9878,
  hours: 'Abierto 24hs',
  phone: '3624235455',
  email: 'rodrigoatatat@gmail.com'
};

// Valores por defecto: se usan hasta que se cargue (o si no existe)
// config/shipping en Firestore — mismo doc que lee server.js, para que
// el costo de envío se edite en un solo lugar en vez de dos constantes
// que había que mantener sincronizadas a mano.
const DEFAULT_SHIPPING = {
  LOCAL_MIN: 85000,
  COSTO_FIJO: 4500,
  RADIO_KM: 3,
};
let SHIPPING = { ...DEFAULT_SHIPPING };

// Mínimo de compra: mismo documento config/shipping (campo minPurchase),
// así queda editable desde Firestore sin tocar código, igual que el envío.
const DEFAULT_MIN_PURCHASE = 10000;
let MIN_PURCHASE = DEFAULT_MIN_PURCHASE;

async function loadShippingConfig() {
  try {
    if (!window._db || !window._fbDoc || !window._fbGetDoc) return;
    const ref = window._fbDoc(window._db, 'config', 'shipping');
    const snap = await window._fbGetDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      SHIPPING = {
        LOCAL_MIN: Number(data.localMin ?? DEFAULT_SHIPPING.LOCAL_MIN),
        COSTO_FIJO: Number(data.costoFijo ?? DEFAULT_SHIPPING.COSTO_FIJO),
        RADIO_KM: Number(data.radioKm ?? DEFAULT_SHIPPING.RADIO_KM),
      };
      MIN_PURCHASE = Number(data.minPurchase ?? DEFAULT_MIN_PURCHASE);
    }
    renderSummary();
  } catch (e) {
    console.error('No se pudo leer config/shipping, se usan los valores por defecto:', e);
  }
}

/* ══════════════════════════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════════════════════════ */

function initCheckout() {
  loadCartFromStorage();
  loadUserData();
  loadShippingConfig();
  if (handleMpReturn()) return;
  renderStep(1);
  renderSummary();
}

/* ══════════════════════════════════════════════════════════
   VUELTA DESDE MERCADO PAGO
   MP redirige a checkout.html?mp_status=success|pending|failure&order=...
   (ver back_urls en server.js). Antes de esto, nadie leía esos
   parámetros y el checkout siempre mostraba el paso 1 (carrito).
══════════════════════════════════════════════════════════ */

let mpReturnProcessed = false;

function handleMpReturn() {
  if (mpReturnProcessed) return true;

  const params = new URLSearchParams(window.location.search);
  const mpStatus = params.get('mp_status');
  if (!mpStatus) return false;

  mpReturnProcessed = true;
  // El número viene en el link, que cualquiera puede armar a mano: solo se
  // acepta si tiene el formato de un número de pedido.
  const orderParam = params.get('order') || '';
  const orderId = /^LB[A-Z0-9]{6,20}$/.test(orderParam) ? orderParam : null;
  window.history.replaceState({}, '', 'checkout.html');

  if (mpStatus === 'failure') {
    showToast('❌ El pago no pudo procesarse. Podés intentar de nuevo.', 'error');
    mpReturnProcessed = false;
    return false;
  }

  showMpReturnConfirmation(orderId, mpStatus);
  return true;
}

async function showMpReturnConfirmation(orderId, mpStatus) {
  let pedido = null;
  try {
    // Las reglas solo dejan leer los pedidos propios, así que la consulta
    // tiene que filtrar también por la cuenta: sin ese filtro Firestore la
    // rechaza entera. Un invitado no puede leer el pedido; ve la
    // confirmación con el número que vuelve en la URL.
    if (orderId && window._db && window._fbQuery && window._currentUser) {
      const q = window._fbQuery(
        window._fbCollection(window._db, 'pedidos'),
        window._fbWhere('orderId', '==', orderId),
        window._fbWhere('userId', '==', window._currentUser.uid)
      );
      const snap = await window._fbGetDocs(q);
      if (!snap.empty) pedido = snap.docs[0].data();
    }
  } catch (e) {
    console.error('Error buscando pedido tras volver de Mercado Pago:', e);
  }

  STATE.lastOrder = {
    orderId: (pedido && pedido.orderId) || orderId || '—',
    contact: (pedido && pedido.contact) || STATE.contact,
    delivery: (pedido && pedido.delivery) || STATE.delivery,
    deliveryCost: (pedido && pedido.deliveryCost) || 0,
    payment: 'mp',
    subtotal: (pedido && pedido.subtotal) || 0,
    total: (pedido && pedido.total) || 0,
    pointsUsed: (pedido && pedido.pointsUsed) || 0,
    pointsEarned: (pedido && pedido.pointsEarned) || 0,
    mpPending: mpStatus === 'pending'
  };
  STATE.orderId = STATE.lastOrder.orderId;
  STATE.payment = 'mp';

  STATE.cart = [];
  localStorage.removeItem('lobo24_cart');

  if (mpStatus === 'pending') {
    showToast('⏳ Tu pago está pendiente de aprobación por Mercado Pago.', 'warn');
  }

  renderStep(5);
}

async function loadUserData() {
  if (!window._currentUser) return;
  try {
    const userRef = window._fbDoc(window._db, 'users', window._currentUser.uid);
    const userDoc = await window._fbGetDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      window._userPoints = data.points || 0;
      window._userName = data.name || '';
      window._userEmail = data.email || window._currentUser.email || '';
      window._userPhone = data.phone || '';
      if (window._userName) STATE.contact.name = window._userName;
      if (window._userEmail) STATE.contact.email = window._userEmail;
      if (window._userPhone) STATE.contact.phone = window._userPhone;
    }
  } catch (e) {
    console.error('Error loading user data:', e);
  }
  loadPuntosReservados();
}

// Puntos reservados en pagos de Mercado Pago que todavía no se hicieron.
// Al consultarlos, el servidor devuelve los de los pagos que ya vencieron.
// Si no responde (puede tardar cuando estaba dormido), el checkout sigue
// igual: al confirmar, el servidor vuelve a mirar el saldo.
let puntosReservadosConsultados = false;

async function loadPuntosReservados() {
  // initCheckout puede correr más de una vez; la consulta se hace una sola.
  if (!window._currentUser || puntosReservadosConsultados) return;
  puntosReservadosConsultados = true;
  try {
    const res = await fetch('https://lobo24-backend-zibj.onrender.com/puntos-reservados', {
      method: 'POST',
      headers: await backendHeaders()
    });
    if (!res.ok) return;

    const data = await res.json();
    const reservas = Array.isArray(data.reservas) ? data.reservas.filter(r => Number(r.puntos) > 0) : [];
    const cambioSaldo = data.points != null;

    window._puntosReservados = reservas;
    if (cambioSaldo) window._userPoints = Number(data.points) || 0;

    if (STATE.step === 4 && (cambioSaldo || reservas.length)) renderStep(4);
  } catch (e) {
    console.error('No se pudieron consultar los puntos reservados:', e);
  }
}

// Aviso del paso de pago: explica por qué hay menos puntos disponibles.
function puntosReservadosHtml() {
  return (window._puntosReservados || []).map(r => {
    const vence = r.vence ? new Date(r.vence) : null;
    const cuando = r.pagoEnProceso
      ? 'Mercado Pago todavía está procesando ese pago.'
      : (vence && vence > new Date())
        ? `Si no lo pagás, vuelven a tu cuenta a las ${vence.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} h.`
        : 'Si no lo pagaste, vuelven a tu cuenta en unos minutos.';
    return `
        <div class="notice">
          <i class="fa-regular fa-clock"></i>
          <span>Tenés <strong>${Number(r.puntos).toLocaleString('es-AR')} puntos</strong> reservados en el pedido #${esc(r.orderId)} de Mercado Pago, que todavía no se pagó. ${cuando}</span>
        </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   CARRITO
══════════════════════════════════════════════════════════ */

function normalizeCartItem(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    ...item,
    docId: item.docId || item.id || '',
    id: item.id || item.docId || '',
    qty: Number(item.qty || 1),
    price: Number(item.price || 0),
    priceEfectivo: item.priceEfectivo != null ? Number(item.priceEfectivo) : null,
    old: item.old != null ? Number(item.old) : null,
    stock: item.stock != null ? Number(item.stock) : null,
    maxPorCompra: item.maxPorCompra != null ? Number(item.maxPorCompra) : null,
    coleccion: item.coleccion || item.collection || 'productos',
    name: item.name || '',
    brand: item.brand || '',
    img: item.img || ''
  };
}

// Precio efectivo/transferencia (con descuento) para retiro en sucursal o
// transferencia bancaria; para cualquier otro medio (Mercado Pago), el
// precio de tarjeta de siempre. Si el producto todavía no tiene
// priceEfectivo cargado (la mayoría, hasta que se sincronice o se cargue a
// mano), cae al precio de tarjeta — así ningún producto queda roto.
function precioSegunPago(item) {
  const esDescuento = STATE.payment === 'transfer' || STATE.payment === 'efectivo';
  if (esDescuento && item.priceEfectivo != null) return item.priceEfectivo;
  return item.price;
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem('lobo24_cart');
    if (!raw) { STATE.cart = []; return; }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      STATE.cart = parsed.map(normalizeCartItem).filter(Boolean);
    } else if (parsed && typeof parsed === 'object') {
      STATE.cart = Object.values(parsed).map(normalizeCartItem).filter(Boolean);
    } else {
      STATE.cart = [];
    }
  } catch (e) {
    console.error('Error leyendo carrito:', e);
    STATE.cart = [];
  }
}

function saveCartToStorage() {
  localStorage.setItem('lobo24_cart', JSON.stringify(STATE.cart));
}

/* ══════════════════════════════════════════════════════════
   PASO 1 — CARRITO
══════════════════════════════════════════════════════════ */

function renderStep1() {
  const cartItems = STATE.cart;

  if (cartItems.length === 0) {
    return `
      <div class="panel step-content">
        <div class="panel-header">
          <div class="panel-icon"><i class="fa-solid fa-bag-shopping"></i></div>
          <div>
            <div class="panel-title">TU <span>CARRITO</span></div>
            <div class="panel-sub">Revisá tus productos</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="empty-cart">
            <div class="empty-icon"><i class="fa-solid fa-bag-shopping"></i></div>
            <p>Tu carrito está vacío</p>
            <a href="index.html" class="btn btn-primary">Ver productos<i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </div>`;
  }

  const itemsHtml = cartItems.map(item => {
    const total = Number(precioSegunPago(item)) * item.qty;
    const stock = item.stock ?? null;
    const limit = item.maxPorCompra ?? null;
    const maxQty = Math.min(stock ?? 999999, limit ?? 999999);
    const atMax = item.qty >= maxQty;
    const maxReason = (limit !== null && limit <= (stock ?? Infinity))
      ? `Límite de compra: ${limit} unidad${limit !== 1 ? 'es' : ''}`
      : 'Stock máximo alcanzado';

    return `
      <div class="cart-item-row" id="ci-${item.docId}">
        <div class="cart-thumb">
          <img src="${item.img || ''}" alt="${esc(item.name || '')}"/>
        </div>
        <div class="cart-item-meta">
          <div class="cart-item-name">${esc(item.name || '')}</div>
          <div class="cart-item-brand">${esc(item.brand || '')}</div>
          <div class="cart-item-unit">$${Number(precioSegunPago(item)).toLocaleString('es-AR')} c/u</div>
          ${atMax && maxQty < 999999 ? `<div class="stock-warning"><i class="fa-solid fa-circle-info"></i>${maxReason}</div>` : ''}
        </div>
        <div class="qty-row">
          <button class="qty-btn" onclick="changeQtyCheckout('${item.docId}', -1)" aria-label="Quitar una unidad">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQtyCheckout('${item.docId}', 1)" aria-label="Agregar una unidad" ${atMax ? 'disabled' : ''}>+</button>
        </div>
        <div class="cart-item-price">$${total.toLocaleString('es-AR')}</div>
        <button class="remove-btn" onclick="removeFromCheckout('${item.docId}')" title="Eliminar" aria-label="Eliminar ${esc(item.name || '')}"><i class="fa-regular fa-trash-can"></i></button>
      </div>`;
  }).join('');

  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon"><i class="fa-solid fa-bag-shopping"></i></div>
        <div>
          <div class="panel-title">TU <span>CARRITO</span></div>
          <div class="panel-sub">${cartItems.length} producto${cartItems.length !== 1 ? 's' : ''} · Revisá antes de continuar</div>
        </div>
      </div>
      <div class="panel-body">
        ${itemsHtml}
        <div class="cart-actions">
          <button class="btn btn-danger" onclick="clearCart()"><i class="fa-regular fa-trash-can"></i>Vaciar carrito</button>
          <a href="index.html" class="btn btn-ghost"><i class="fa-solid fa-arrow-left"></i>Seguir comprando</a>
          <button class="btn btn-primary" onclick="renderStep(2)">Continuar<i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>`;
}

function changeQtyCheckout(docId, delta) {
  const item = STATE.cart.find(x => x.docId === docId);
  if (!item) return;

  const stock = item.stock ?? null;
  const limit = item.maxPorCompra ?? null;
  const maxQty = Math.min(stock ?? 999999, limit ?? 999999);

  if (delta > 0 && item.qty >= maxQty) {
    const msg = (limit !== null && limit <= (stock ?? Infinity))
      ? `Límite de compra: ${limit} unidad${limit !== 1 ? 'es' : ''} por pedido`
      : `Solo hay ${stock} unidad${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''}`;
    showToast(`⚠️ ${msg}`, 'warn');
    return;
  }

  if (delta < 0 && item.qty <= 1) {
    removeFromCheckout(docId);
    return;
  }

  item.qty += delta;
  saveCartToStorage();
  renderStep(1);
  renderSummary();
}

function removeFromCheckout(docId) {
  STATE.cart = STATE.cart.filter(x => x.docId !== docId);
  saveCartToStorage();
  renderStep(1);
  renderSummary();
}

function clearCart() {
  if (!confirm('¿Vaciar el carrito?')) return;
  STATE.cart = [];
  saveCartToStorage();
  renderStep(1);
  renderSummary();
}

/* ══════════════════════════════════════════════════════════
   PASO 2 — DATOS
══════════════════════════════════════════════════════════ */

function renderStep2() {
  const c = STATE.contact || {};

  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon"><i class="fa-solid fa-user"></i></div>
        <div>
          <div class="panel-title">INFORMACIÓN DE <span>CONTACTO</span></div>
          <div class="panel-sub">Tus datos para gestionar el pedido</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label">Nombre completo <span class="req">*</span></label>
            <input class="form-input" id="f-name" type="text" placeholder="Ej: María García" value="${esc(c.name || window._userName || '')}" autocomplete="name"/>
            <div class="form-error" id="err-name">Ingresá tu nombre completo</div>
          </div>

          <div class="form-group">
            <label class="form-label">Email <span class="req">*</span></label>
            <input class="form-input" id="f-email" type="email" placeholder="tu@email.com" value="${esc(c.email || window._userEmail || '')}" autocomplete="email"/>
            <div class="form-error" id="err-email">Email inválido</div>
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono <span class="req">*</span></label>
            <input class="form-input" id="f-phone" type="tel" placeholder="+54 9 362 4000000" value="${esc(c.phone || window._userPhone || '')}" autocomplete="tel"/>
            <div class="form-error" id="err-phone">Ingresá un teléfono válido</div>
          </div>
        </div>

        <div class="address-section">
          <div class="address-section-title"><i class="fa-solid fa-location-dot"></i>Dirección de entrega</div>
          <div class="form-grid">
            <div class="form-group full">
              <label class="form-label">Calle y número <span class="req">*</span></label>
              <input class="form-input" id="f-street" type="text" placeholder="Ej: Av. 25 de Mayo 1234" value="${esc(c.street || '')}" autocomplete="street-address"/>
              <div class="form-error" id="err-street">Ingresá tu calle y número</div>
            </div>

            <div class="form-group">
              <label class="form-label">Localidad <span class="req">*</span></label>
              <input class="form-input" id="f-city" type="text" placeholder="Ej: Resistencia" value="${esc(c.city || '')}" autocomplete="address-level2"/>
              <div class="form-error" id="err-city">Ingresá tu localidad</div>
            </div>

            <div class="form-group">
              <label class="form-label">Provincia <span class="req">*</span></label>
              <select class="form-input" id="f-province">
                ${getProvincias(c.province || '')}
              </select>
            </div>

            <div class="form-group full">
              <label class="form-label">Notas adicionales <span class="optional">(opcional)</span></label>
              <textarea class="form-input" id="f-notes" rows="2" placeholder="Instrucciones especiales, departamento, timbre...">${esc(c.notes || '')}</textarea>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="renderStep(1)"><i class="fa-solid fa-arrow-left"></i>Volver al carrito</button>
          <button class="btn btn-primary" onclick="submitStep2()">Continuar al envío<i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>`;
}

function getProvincias(selected) {
  const provs = [
    'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos',
    'Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro',
    'Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero',
    'Tierra del Fuego','Tucumán'
  ];
  return `<option value="">Seleccioná provincia</option>` + provs.map(p =>
    `<option value="${p}" ${selected === p ? 'selected' : ''}>${p}</option>`
  ).join('');
}

function submitStep2() {
  const name = document.getElementById('f-name')?.value.trim();
  const email = document.getElementById('f-email')?.value.trim();
  const phone = document.getElementById('f-phone')?.value.trim();
  const street = document.getElementById('f-street')?.value.trim();
  const city = document.getElementById('f-city')?.value.trim();
  const province = document.getElementById('f-province')?.value;
  const notes = document.getElementById('f-notes')?.value.trim();

  let ok = true;

  const validate = (id, errId, condition) => {
    const errEl = document.getElementById(errId);
    const inEl = document.getElementById(id);
    if (!condition) {
      errEl?.classList.add('show');
      inEl?.classList.add('error');
      ok = false;
    } else {
      errEl?.classList.remove('show');
      inEl?.classList.remove('error');
    }
  };

  validate('f-name', 'err-name', name && name.length >= 3);
  validate('f-email', 'err-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''));
  validate('f-phone', 'err-phone', phone && phone.length >= 8);
  validate('f-street', 'err-street', street && street.length >= 3);
  validate('f-city', 'err-city', city && city.length >= 2);

  document.getElementById('f-province')?.classList.toggle('error', !province);
  if (!province) {
    showToast('⚠️ Seleccioná tu provincia', 'warn');
    ok = false;
  }

  if (!ok) {
    showToast('⚠️ Completá todos los campos requeridos', 'warn');
    return;
  }

  STATE.contact = { name, email, phone, street, city, province, notes };
  renderStep(3);
}

/* ══════════════════════════════════════════════════════════
   PASO 3 — ENVÍO
══════════════════════════════════════════════════════════ */

function renderStep3() {
  const subtotal = getSubtotal();
  const province = (STATE.contact.province || '').toLowerCase();
  const city = (STATE.contact.city || '').toLowerCase();

  const isChaco = province.includes('chaco');
  const shippingCost = subtotal >= SHIPPING.LOCAL_MIN ? 0 : SHIPPING.COSTO_FIJO;

  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon"><i class="fa-solid fa-truck"></i></div>
        <div>
          <div class="panel-title">MÉTODO DE <span>ENTREGA</span></div>
          <div class="panel-sub">Envíos hasta ${SHIPPING.RADIO_KM} km desde ${STORE.address}</div>
        </div>
      </div>

      <div class="panel-body">
        <div class="delivery-option${STATE.delivery === 'local' ? ' selected' : ''}" id="del-local" role="button" tabindex="0" onclick="selectDelivery('local', 0)">
          <div class="delivery-option-header">
            <div class="delivery-option-left">
              <div class="delivery-radio"></div>
              <div class="delivery-icon"><i class="fa-solid fa-store"></i></div>
              <div>
                <div class="delivery-name">Retiro en sucursal</div>
                <div class="delivery-sub">Pasá a retirarlo cuando quieras</div>
              </div>
            </div>
            <div class="delivery-price free">GRATIS</div>
          </div>

          <div class="delivery-details">
            <span class="detail-line"><i class="fa-solid fa-location-dot"></i>${STORE.address}</span>
            <span class="detail-line"><i class="fa-regular fa-clock"></i>${STORE.hours}</span>
            <span class="delivery-badge"><i class="fa-solid fa-check"></i>Disponible hoy</span>
          </div>
        </div>

        <div
          class="delivery-option${!isChaco ? ' disabled' : ''}${STATE.delivery === 'domicilio' ? ' selected' : ''}"
          id="del-dom"
          role="button"
          tabindex="0"
          onclick="${isChaco ? `selectDeliveryDomicilio()` : `showToast('No realizamos envíos a otras provincias', 'warn')`}"
        >
          <div class="delivery-option-header">
            <div class="delivery-option-left">
              <div class="delivery-radio"></div>
              <div class="delivery-icon"><i class="fa-solid fa-motorcycle"></i></div>
              <div>
                <div class="delivery-name">Envío a domicilio</div>
                <div class="delivery-sub">
                  Solo hasta ${SHIPPING.RADIO_KM} km desde Av. Sarmiento 322, Resistencia
                </div>
              </div>
            </div>

            <div class="delivery-price ${shippingCost === 0 ? 'free' : 'paid'}">
              ${shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toLocaleString('es-AR')}`}
            </div>
          </div>

          <div class="delivery-details">
            ${isChaco ? `
              <span class="detail-line">Radio máximo de entrega: <strong>${SHIPPING.RADIO_KM} km</strong></span>
              <span class="detail-line">Costo fijo: <strong>$${SHIPPING.COSTO_FIJO.toLocaleString('es-AR')}</strong></span>
              ${subtotal >= SHIPPING.LOCAL_MIN
                ? `<span class="delivery-badge"><i class="fa-solid fa-check"></i>Tenés envío gratis por superar $${SHIPPING.LOCAL_MIN.toLocaleString('es-AR')}</span>`
                : `<span class="delivery-badge"><i class="fa-solid fa-truck"></i>Envío gratis desde $${SHIPPING.LOCAL_MIN.toLocaleString('es-AR')}</span>`
              }
            ` : `
              <strong class="delivery-unavailable">No realizamos envíos a otras provincias, pero próximamente estaremos expandiendo nuestros servicios.</strong>
              <span class="detail-line">Podés elegir retiro en sucursal.</span>
            `}
          </div>
        </div>

        <div class="delivery-info-box">
          <strong><i class="fa-solid fa-location-dot"></i>Tu dirección registrada</strong>
          <span>${esc(STATE.contact.street || '')}, ${esc(STATE.contact.city || '')}, ${esc(STATE.contact.province || '')}</span>
          <small>El envío queda sujeto a validación del radio máximo de ${SHIPPING.RADIO_KM} km desde el local.</small>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="renderStep(2)"><i class="fa-solid fa-arrow-left"></i>Volver</button>
          <button class="btn btn-primary" onclick="submitStep3()">Continuar al pago<i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>`;
}

function selectDelivery(type, cost) {
  STATE.delivery = type;
  STATE.deliveryCost = cost;
  renderSummary();
  document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('del-local')?.classList.add('selected');
  const ds = document.getElementById('distanceSelector');
  if (ds) ds.style.display = 'none';
}

function selectDeliveryDomicilio() {
  const subtotal = getSubtotal();
  const province = (STATE.contact.province || '').toLowerCase();

  if (!province.includes('chaco')) {
    showToast('No realizamos envíos a otras provincias', 'warn');
    return;
  }

  const cost = subtotal >= SHIPPING.LOCAL_MIN ? 0 : SHIPPING.COSTO_FIJO;

  STATE.delivery = 'domicilio';
  STATE.deliveryCost = cost;
  STATE.deliveryDistance = 'radio_18km';

  document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('del-dom')?.classList.add('selected');

  renderSummary();
}

function selectDeliveryExact(type, cost) {
  STATE.delivery = type;
  STATE.deliveryCost = cost;
  STATE.deliveryDistance = type === 'domicilio_cerca' ? 'cerca' : 'lejos';
  renderSummary();
}

async function submitStep3() {
  if (!STATE.delivery) {
    showToast('⚠️ Seleccioná un método de entrega', 'warn');
    return;
  }

  if (STATE.delivery === 'domicilio') {
    const province = (STATE.contact.province || '').toLowerCase();

    if (!province.includes('chaco')) {
      showToast('⚠️ No realizamos envíos a otras provincias', 'warn');
      return;
    }

    // Avisa antes de llegar al pago; el backend vuelve a validar al confirmar.
    const btn = document.querySelector('.btn-row .btn-primary');
    const btnText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Verificando dirección…'; }
    try {
      const res = await fetch('https://lobo24-backend-zibj.onrender.com/validar-distancia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: STATE.contact.street,
          city: STATE.contact.city,
          province: STATE.contact.province
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showToast(`❌ ${data.error || 'No se pudo validar la dirección. Intentá de nuevo.'}`, 'error');
        return;
      }
      STATE.deliveryDistanceKm = data.distanceKm;
    } catch (e) {
      console.error('Error validando distancia:', e);
      showToast('❌ No se pudo validar la dirección. Intentá de nuevo o elegí retiro en sucursal.', 'error');
      return;
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = btnText; }
    }
  }

  renderStep(4);
}
/* ══════════════════════════════════════════════════════════
   PASO 4 — PAGO (CON SISTEMA DE PUNTOS)
══════════════════════════════════════════════════════════ */

const CONFIRM_LABEL = '<i class="fa-solid fa-lock"></i>Confirmar y pagar';

function renderStep4() {
  const subtotal = getSubtotal();
  const shipping = STATE.deliveryCost;
  const totalSinDesc = subtotal + shipping;
  const maxPoints = Math.floor(totalSinDesc * 0.30);
  const userPts = window._userPoints || 0;
  const availPts = Math.min(userPts, maxPoints);
  const canEfectivo = STATE.delivery === 'local';
  const belowMin = subtotal < MIN_PURCHASE;
  const puntosActuales = Math.min(STATE.pointsUsed, availPts);
  
  if (STATE.pointsUsed !== puntosActuales) STATE.pointsUsed = puntosActuales;
  
  // Determinar si el usuario tiene puntos para mostrar
  const hasPoints = userPts > 0;
  
  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon"><i class="fa-solid fa-credit-card"></i></div>
        <div>
          <div class="panel-title">MÉTODO DE <span>PAGO</span></div>
          <div class="panel-sub">Elegí cómo querés pagar tu pedido</div>
        </div>
      </div>
      <div class="panel-body">
        ${belowMin ? `
        <div class="notice notice-warn">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Te faltan $${(MIN_PURCHASE - subtotal).toLocaleString('es-AR')} para el mínimo de compra de $${MIN_PURCHASE.toLocaleString('es-AR')}</span>
        </div>
        ` : ''}
        ${puntosReservadosHtml()}
        ${hasPoints ? `
        <div class="points-section">
          <div class="points-header">
            <div class="points-title">
              <i class="fa-solid fa-star"></i>Usar mis puntos
              <span class="points-badge">${userPts.toLocaleString('es-AR')} pts disponibles</span>
            </div>
            <div class="points-available">Podés usar hasta el 30% del total</div>
          </div>
          <div class="points-slider-wrap">
            <span class="points-min">$0</span>
            <input type="range" class="points-slider" id="pointsSlider"
              min="0" max="${availPts}" value="${puntosActuales}"
              aria-label="Puntos a usar en esta compra"
              oninput="updatePoints(this.value)"/>
            <div class="points-amount" id="pointsAmount">-$${puntosActuales.toLocaleString('es-AR')}</div>
          </div>
          <div class="points-desc">
            Máximo aplicable: <strong>$${availPts.toLocaleString('es-AR')}</strong>
            (30% de $${totalSinDesc.toLocaleString('es-AR')}) · 1 punto = $1
          </div>
        </div>
        ` : `
        <div class="notice">
          <i class="fa-regular fa-star"></i>
          <span>${window._currentUser
            ? 'Todavía no tenés puntos para usar en esta compra.'
            : 'Con una cuenta sumás puntos en cada compra y los usás como descuento.'}</span>
        </div>
        `}

        <div class="payment-option${STATE.payment === 'mp' ? ' selected' : ''}" id="pay-mp" role="button" tabindex="0" onclick="selectPayment('mp')">
          <div class="payment-option-header">
            <div class="payment-radio"></div>
            <div class="payment-icon"><i class="fa-solid fa-credit-card"></i></div>
            <div>
              <div class="payment-name">Mercado Pago</div>
              <div class="payment-sub">Tarjeta de crédito/débito · Cuotas disponibles</div>
            </div>
          </div>
          <div class="payment-detail">
            <div class="mp-form">
              <div class="mp-brand">
                <div class="mp-logo">mercadopago</div>
                <div class="mp-secure"><i class="fa-solid fa-lock"></i>Pago seguro y encriptado</div>
              </div>
              <p>Al confirmar serás redirigido al sitio de Mercado Pago para completar el pago de forma segura.</p>
            </div>
          </div>
        </div>

        <div class="payment-option${STATE.payment === 'transfer' ? ' selected' : ''}" id="pay-transfer" role="button" tabindex="0" onclick="selectPayment('transfer')">
          <div class="payment-option-header">
            <div class="payment-radio"></div>
            <div class="payment-icon"><i class="fa-solid fa-building-columns"></i></div>
            <div>
              <div class="payment-name">Transferencia bancaria</div>
              <div class="payment-sub">Envianos el comprobante por WhatsApp</div>
            </div>
          </div>
          <div class="payment-detail">
            <div class="bank-data">
              <div class="bank-row"><span class="bk-label">Banco</span><span class="bk-value">Mercado Pago</span></div>
              <div class="bank-row"><span class="bk-label">Titular</span><span class="bk-value">Rodrigo Joel Nuñez</span></div>
              <div class="bank-row"><span class="bk-label">CBU</span><span class="bk-value">0000003100090462950726<button class="copy-btn" onclick="copyText('0000003100090462950726', 'CBU copiado')">Copiar</button></span></div>
              <div class="bank-row"><span class="bk-label">Alias</span><span class="bk-value">LOBO24HS<button class="copy-btn" onclick="copyText('LOBO24HS', 'Alias copiado')">Copiar</button></span></div>
              <div class="bank-row"><span class="bk-label">CUIT</span><span class="bk-value">23-37707364-9</span></div>
            </div>
          </div>
        </div>

        <div class="payment-option${canEfectivo ? '' : ' disabled'}${STATE.payment === 'efectivo' ? ' selected' : ''}" id="pay-efectivo"
          ${canEfectivo ? 'role="button" tabindex="0"' : 'aria-disabled="true"'}
          onclick="${canEfectivo ? `selectPayment('efectivo')` : `showToast('Solo disponible con retiro en sucursal','warn')`}">
          <div class="payment-option-header">
            <div class="payment-radio"></div>
            <div class="payment-icon"><i class="fa-solid fa-money-bill-wave"></i></div>
            <div>
              <div class="payment-name">Efectivo en local</div>
              <div class="payment-sub">${canEfectivo ? 'Pagás cuando venís a retirar' : 'Solo disponible con retiro en sucursal'}</div>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="renderStep(3)"><i class="fa-solid fa-arrow-left"></i>Volver</button>
          <button class="btn btn-primary btn-large" id="btnConfirmar" onclick="submitStep4()" ${!STATE.payment || belowMin ? 'disabled' : ''}>
            ${CONFIRM_LABEL}
          </button>
        </div>
      </div>
    </div>`;
}

function selectPayment(type) {
  STATE.payment = type;
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
  document.getElementById(`pay-${type}`)?.classList.add('selected');
  const btn = document.getElementById('btnConfirmar');
  if (btn) btn.disabled = getSubtotal() < MIN_PURCHASE;
  renderSummary();
}

function updatePoints(val) {
  STATE.pointsUsed = Number(val || 0);
  const amtEl = document.getElementById('pointsAmount');
  if (amtEl) amtEl.textContent = `-$${STATE.pointsUsed.toLocaleString('es-AR')}`;
  renderSummary();
}

// El backend identifica al cliente por su sesión de Firebase (el token va
// en el header), no por un userId escrito en el pedido.
async function backendHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (window._currentUser) {
    headers.Authorization = 'Bearer ' + await window._currentUser.getIdToken();
  }
  return headers;
}

async function submitStep4() {
  if (!STATE.payment) {
    showToast('⚠️ Seleccioná un método de pago', 'warn');
    return;
  }

  if (getSubtotal() < MIN_PURCHASE) {
    showToast(`⚠️ El pedido no alcanza el mínimo de compra de $${MIN_PURCHASE.toLocaleString('es-AR')}`, 'warn');
    return;
  }

  const btn = document.getElementById('btnConfirmar');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Procesando…';
  }
  
  try {
    const totalAmount = getTotal();
    const orderId = 'LB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Calcular puntos ganados (1 punto cada $100 gastados en productos, sin contar envío)
    const pointsEarned = Math.floor(getSubtotal() / 100);
    
    STATE.lastOrder = {
      orderId,
      contact: { ...STATE.contact },
      delivery: STATE.delivery,
      deliveryCost: STATE.deliveryCost,
      payment: STATE.payment,
      subtotal: getSubtotal(),
      total: totalAmount,
      pointsUsed: STATE.pointsUsed,
      pointsEarned: pointsEarned
    };
    
    // Items con coleccion, necesaria para que el backend pueda buscar el
    // precio real del producto en Firestore y no confiar en el precio que
    // manda el navegador.
    const cartItemsParaMP = STATE.cart.map(i => ({
      id:        i.docId,
      coleccion: i.coleccion,
      name:      i.name,
      quantity:  i.qty,
      price:     i.price
    }));

    STATE.orderId = orderId;

    // 5. Redirigir a Mercado Pago si corresponde
    if (STATE.payment === 'mp') {
      showToast('⏳ Conectando con Mercado Pago...', 'ok');

      // El pedido lo guarda el backend (status pending_payment) con los
      // valores validados contra Firestore y su propio número de pedido, y
      // recién se confirma cuando el webhook de MP avisa que el pago se
      // acreditó.
      const mpRes = await fetch('https://lobo24-backend-zibj.onrender.com/crear-preferencia', {
        method: 'POST',
        headers: await backendHeaders(),
        body: JSON.stringify({
          items: cartItemsParaMP,
          customerData: {
            name:  STATE.contact.name,
            email: STATE.contact.email,
            phone: STATE.contact.phone
          },
          orderData: {
            delivery:     STATE.delivery,
            pointsUsed:   STATE.pointsUsed,
            contact:      STATE.contact,
            address: {
              street:   STATE.contact.street,
              city:     STATE.contact.city,
              province: STATE.contact.province
            },
            // El backend recalcula el total real desde Firestore y lo usa
            // para cobrar en Mercado Pago; esto solo viaja a modo informativo.
            total:        totalAmount
          }
        })
      });

      if (!mpRes.ok) {
        const errBody = await mpRes.json().catch(() => ({}));
        console.error('MP backend error:', errBody);
        throw new Error(errBody.error || 'Error al crear la preferencia de Mercado Pago');
      }

      const mpData = await mpRes.json();

      STATE.orderId = mpData.orderId;
      STATE.lastOrder.orderId = mpData.orderId;

      // Produccion: usar init_point. Para volver a TEST cambiar a sandbox_init_point
      const mpUrl = mpData.init_point || mpData.sandbox_init_point;

      if (!mpUrl) {
        throw new Error('No se recibio la URL de pago de Mercado Pago');
      }

      // NO limpiar el carrito todavía.
      // Se limpia recién cuando el pago se confirma o cuando el usuario finaliza por transferencia/efectivo.
      showToast('🎉 Pedido #' + mpData.orderId + ' registrado. Te redirigimos a Mercado Pago.', 'success');

      // Redirigir al checkout de MP
      window.location.href = mpUrl;

    // ══════════════════════════════════════════════════════════════
// (el bloque que maneja transfer/efectivo, después del if de MP)
// Buscar: "// Transferencia o efectivo: descontar stock y puntos inmediatamente"
// ══════════════════════════════════════════════════════════════

      } else {
        // Transferencia o efectivo: el backend valida precios reales,
        // mínimo de compra y límites por producto contra Firestore antes
        // de guardar el pedido, descontar stock y acreditar/descontar
        // puntos — nada de esto puede depender de lo que mande el
        // navegador, que puede manipularse desde las herramientas de
        // desarrollador.
        const confirmRes = await fetch('https://lobo24-backend-zibj.onrender.com/confirmar-pedido-manual', {
          method: 'POST',
          headers: await backendHeaders(),
          body: JSON.stringify({
            orderId,
            items: cartItemsParaMP,
            contact: STATE.contact,
            delivery: STATE.delivery,
            payment: STATE.payment,
            pointsUsed: STATE.pointsUsed
          })
        });

        if (!confirmRes.ok) {
          const errBody = await confirmRes.json().catch(() => ({}));
          throw new Error(errBody.error || 'No se pudo confirmar el pedido');
        }

        const confirmData = await confirmRes.json();

        STATE.orderId = confirmData.orderId;
        STATE.lastOrder = {
          orderId: confirmData.orderId,
          contact: { ...STATE.contact },
          delivery: STATE.delivery,
          deliveryCost: confirmData.deliveryCost,
          payment: STATE.payment,
          subtotal: confirmData.subtotal,
          total: confirmData.total,
          pointsUsed: confirmData.pointsUsed,
          pointsEarned: confirmData.pointsEarned
        };

        STATE.cart = [];
        localStorage.removeItem('lobo24_cart');
        // Los puntos solo se acreditan con sesión iniciada, y recién cuando
        // el local confirma el pago.
        showToast('Pedido #' + confirmData.orderId + ' realizado con éxito.' + (window._currentUser && confirmData.pointsEarned > 0 ? ' Vas a sumar ' + confirmData.pointsEarned + ' puntos cuando confirmemos tu pago.' : ''), 'success');
        renderStep(5);
      }

  } catch (err) {
    console.error('Error al procesar el pedido:', err);
    showToast(`❌ ${err.message || 'Error al procesar el pedido. Intentá de nuevo.'}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = CONFIRM_LABEL;
    }
  }
}

/* ══════════════════════════════════════════════════════════
   PASO 5 — CONFIRMACIÓN
══════════════════════════════════════════════════════════ */

function renderStep5() {
  const paymentLabels = { mp: 'Mercado Pago', transfer: 'Transferencia bancaria', efectivo: 'Efectivo en local' };
  const deliveryLabels = {
    local: 'Retiro en sucursal',
    domicilio: 'Envío a domicilio'
  };

  const order = STATE.lastOrder || {};
  const contact = order.contact || STATE.contact || {};

  const totalFinal = Number(order.total || 0);
  const pointsEarned = Number(order.pointsEarned || 0);
  const pointsUsed = Number(order.pointsUsed || 0);
  const orderNum = order.orderId || STATE.orderId || 'LB' + Date.now().toString(36).toUpperCase().slice(-6);
  const payment = order.payment || STATE.payment;
  const delivery = order.delivery || STATE.delivery;

  const whatsMsg = encodeURIComponent(
    `Hola Lobo24! Mi número de pedido es #${orderNum}. ${payment === 'transfer' ? 'Adjunto el comprobante de transferencia.' : 'Quiero confirmar mi pedido.'}`
  );

  return `
    <div class="panel step-content panel-confirmation">
      <div class="confirmation">
        <div class="confirmation-icon"><i class="fa-solid fa-check"></i></div>
        <h2>¡PEDIDO REALIZADO!</h2>
        <p>Tu pedido fue registrado con éxito. Recibirás confirmación en <strong>${esc(contact.email || 'tu correo')}</strong>.</p>

        <div class="order-number"><i class="fa-solid fa-receipt"></i>Pedido #${esc(orderNum)}</div>

        <div class="confirmation-detail">
          <div class="cd-row">
            <span class="cd-label">Cliente</span>
            <span class="cd-value">${esc(contact.name || '—')}</span>
          </div>

          <div class="cd-row">
            <span class="cd-label">Entrega</span>
            <span class="cd-value">${deliveryLabels[delivery] || esc(delivery) || '—'}</span>
          </div>

          ${delivery !== 'local'
            ? `<div class="cd-row"><span class="cd-label">Dirección</span><span class="cd-value">${esc(contact.street || '')}, ${esc(contact.city || '')}, ${esc(contact.province || '')}</span></div>`
            : `<div class="cd-row"><span class="cd-label">Dirección</span><span class="cd-value">${STORE.address}</span></div>`
          }

          <div class="cd-row">
            <span class="cd-label">Pago</span>
            <span class="cd-value">${paymentLabels[payment] || esc(payment) || '—'}</span>
          </div>

          <div class="cd-row cd-total">
            <span class="cd-label">Total</span>
            <span class="cd-value">$${totalFinal.toLocaleString('es-AR')}</span>
          </div>

          ${window._currentUser && pointsEarned > 0
            ? `<div class="cd-row cd-earned"><span class="cd-label"><i class="fa-solid fa-star"></i>${payment === 'mp' ? 'Puntos ganados' : 'Puntos al confirmar el pago'}</span><span class="cd-value">+${pointsEarned} puntos</span></div>`
            : ''
          }

          ${pointsUsed > 0
            ? `<div class="cd-row cd-used"><span class="cd-label"><i class="fa-solid fa-star"></i>Puntos usados</span><span class="cd-value">-${pointsUsed} puntos</span></div>`
            : ''
          }
        </div>

        ${payment === 'transfer' ? `
          <div class="next-step">
            <strong><i class="fa-solid fa-thumbtack"></i>Próximo paso</strong>
            Realizá la transferencia por <b>$${totalFinal.toLocaleString('es-AR')}</b> al alias <b>LOBO24HS</b>
            y enviá el comprobante por WhatsApp mencionando el pedido #${esc(orderNum)}.
          </div>
        ` : ''}

        ${payment === 'mp' ? `
          <div class="next-step">
            <strong><i class="fa-solid fa-thumbtack"></i>Sobre tu pago</strong>
            ${order.mpPending
              ? 'Mercado Pago todavía está procesando tu pago. Te vamos a avisar por email en cuanto se confirme.'
              : 'Mercado Pago está validando la acreditación del pago. En unos minutos vas a recibir la confirmación por email.'}
          </div>
        ` : ''}

        <div class="confirmation-actions">
          <a href="https://wa.me/54${STORE.phone}?text=${whatsMsg}" target="_blank" rel="noopener" class="whatsapp-btn"><i class="fa-brands fa-whatsapp"></i>Contactar por WhatsApp</a>
          <a href="index.html" class="btn btn-ghost">Seguir comprando</a>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   FUNCIONES DE UTILIDAD
══════════════════════════════════════════════════════════ */

function renderSummary() {
  const itemsEl = document.getElementById('summaryItems');
  const totalsEl = document.getElementById('summaryTotals');
  const miniEl = document.getElementById('summaryMini');
  const noticeEl = document.getElementById('summaryNotice');
  if (!itemsEl || !totalsEl) return;

  if (STATE.cart.length === 0) {
    itemsEl.innerHTML = `<p class="summary-empty">Carrito vacío</p>`;
    totalsEl.innerHTML = '';
    if (miniEl) miniEl.textContent = '';
    if (noticeEl) noticeEl.innerHTML = '';
    return;
  }
  
  itemsEl.innerHTML = STATE.cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img"><img src="${item.img || ''}" alt="${esc(item.name)}"/><span class="summary-item-qty">${item.qty}</span></div>
      <div class="summary-item-info"><div class="summary-item-name">${esc(item.name)}</div><div class="summary-item-brand">${esc(item.brand)}</div></div>
      <div class="summary-item-price">$${(precioSegunPago(item) * item.qty).toLocaleString('es-AR')}</div>
    </div>
  `).join('');
  
  const subtotal = getSubtotal();
  const shipping = STATE.deliveryCost;
  const pointsDisc = STATE.pointsUsed;
  const total = Math.max(0, subtotal + shipping - pointsDisc);
  
  totalsEl.innerHTML = `
    <div class="summary-row"><span class="label">Subtotal</span><span class="value">$${subtotal.toLocaleString('es-AR')}</span></div>
    <div class="summary-row${shipping > 0 ? ' shipping-cost' : ''}"><span class="label">Envío</span><span class="value">${shipping === 0 ? '<span class="free">Gratis</span>' : '$' + shipping.toLocaleString('es-AR')}</span></div>
    ${pointsDisc > 0 ? `<div class="summary-row discount"><span class="label"><i class="fa-solid fa-star"></i>Descuento puntos</span><span class="value">-$${pointsDisc.toLocaleString('es-AR')}</span></div>` : ''}
    <div class="summary-row total"><span class="label">Total</span><span class="value">$${total.toLocaleString('es-AR')}</span></div>
  `;

  // En celular el resumen está plegado: el total y el aviso de mínimo quedan siempre a la vista.
  if (miniEl) miniEl.textContent = `$${total.toLocaleString('es-AR')}`;
  if (noticeEl) {
    noticeEl.innerHTML = subtotal < MIN_PURCHASE
      ? `<i class="fa-solid fa-circle-info"></i><span>Faltan $${(MIN_PURCHASE - subtotal).toLocaleString('es-AR')} para el mínimo de compra ($${MIN_PURCHASE.toLocaleString('es-AR')})</span>`
      : '';
  }
}

function toggleSummary() {
  const open = document.getElementById('orderSummary')?.classList.toggle('summary-open');
  document.getElementById('summaryToggle')?.setAttribute('aria-expanded', String(!!open));
}

function getSubtotal() {
  return STATE.cart.reduce((s, i) => s + (precioSegunPago(i) * i.qty), 0);
}

function getTotal() {
  return Math.max(0, getSubtotal() + STATE.deliveryCost - STATE.pointsUsed);
}

function esc(v) {
  return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function copyText(text, msg) {
  navigator.clipboard.writeText(text).then(() => showToast(`📋 ${msg}`)).catch(() => showToast('Error al copiar', 'error'));
}

const TOAST_ICONS = { ok: 'fa-circle-check', warn: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };

function showToast(msg, type = 'ok') {
  const kind = type === 'error' || type === 'warn' ? type : 'ok';
  // El icono sale del tipo de aviso: se quita el emoji con el que empiezan los textos.
  const text = String(msg).replace(/^[\p{Extended_Pictographic}\p{Mn}\p{Cf}\s]+/u, '');
  const t = document.createElement('div');
  t.className = 'toast' + (kind === 'ok' ? '' : ' ' + kind);
  t.innerHTML = `<i class="fa-solid ${TOAST_ICONS[kind]}"></i><span>${text}</span>`;
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4000);
  }
}

/* ══════════════════════════════════════════════════════════
   RENDER PASOS PRINCIPAL
══════════════════════════════════════════════════════════ */

function renderStep(n) {
  STATE.step = n;
  updateStepTabs(n);
  const content = document.getElementById('stepContent');
  const summary = document.getElementById('orderSummary');
  if (!content || !summary) return;
  
  if (n === 5) {
    summary.style.display = 'none';
    content.style.gridColumn = '1 / -1';
  } else {
    summary.style.display = '';
    content.style.gridColumn = '';
  }
  
  switch (n) {
    case 1: content.innerHTML = renderStep1(); break;
    case 2: content.innerHTML = renderStep2(); break;
    case 3: content.innerHTML = renderStep3(); break;
    case 4: content.innerHTML = renderStep4(); break;
    case 5: content.innerHTML = renderStep5(); break;
    default: content.innerHTML = renderStep1();
  }
  
  renderSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepTabs(active) {
  for (let i = 1; i <= 5; i++) {
    const tab = document.getElementById(`step-tab-${i}`);
    const conn = document.getElementById(`conn-${i}`);
    if (!tab) continue;
    tab.className = 'step' + (i < active ? ' done' : i === active ? ' active' : '');
    if (i === active) tab.setAttribute('aria-current', 'step');
    else tab.removeAttribute('aria-current');
    if (conn) conn.className = 'step-connector' + (i < active ? ' done' : '');
  }
}

// Las opciones de entrega y de pago son tarjetas: con teclado se eligen con Enter o Espacio.
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.delivery-option, .payment-option')) {
    e.preventDefault();
    e.target.click();
  }
});

/* ══════════════════════════════════════════════════════════
   EXPORTAR FUNCIONES GLOBALES
══════════════════════════════════════════════════════════ */

window.renderStep = renderStep;
window.changeQtyCheckout = changeQtyCheckout;
window.removeFromCheckout = removeFromCheckout;
window.clearCart = clearCart;
window.submitStep2 = submitStep2;
window.selectDelivery = selectDelivery;
window.selectDeliveryDomicilio = selectDeliveryDomicilio;
window.selectDeliveryExact = selectDeliveryExact;
window.submitStep3 = submitStep3;
window.selectPayment = selectPayment;
window.updatePoints = updatePoints;
window.submitStep4 = submitStep4;
window.copyText = copyText;
window.showToast = showToast;
window.toggleSummary = toggleSummary;
window.initCheckout = initCheckout;

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initCheckout, 500));
} else {
  setTimeout(initCheckout, 500);
}