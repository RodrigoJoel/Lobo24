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

const SHIPPING = {
  LOCAL_MIN: 85000,
  CERCA: 3800,
  LEJOS: 7500,
  OTRA_PROV: 27800,
};

/* ══════════════════════════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════════════════════════ */

function initCheckout() {
  loadCartFromStorage();
  loadUserData();
  renderStep(1);
  renderSummary();
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
    old: item.old != null ? Number(item.old) : null,
    stock: item.stock != null ? Number(item.stock) : null,
    coleccion: item.coleccion || item.collection || 'productos',
    name: item.name || '',
    brand: item.brand || '',
    img: item.img || ''
  };
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
          <div class="panel-icon">🛒</div>
          <div>
            <div class="panel-title">TU <span>CARRITO</span></div>
            <div class="panel-sub">Revisá tus productos</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="empty-cart">
            <div class="empty-icon">🛒</div>
            <p>Tu carrito está vacío</p>
            <a href="index.html" class="btn btn-primary" style="display:inline-flex;margin:0 auto">Ver productos →</a>
          </div>
        </div>
      </div>`;
  }

  const itemsHtml = cartItems.map(item => {
    const total = Number(item.price) * item.qty;
    const stock = item.stock ?? null;
    const maxQty = stock !== null ? stock : 999999;
    const atMax = item.qty >= maxQty;

    return `
      <div class="cart-item-row" id="ci-${item.docId}">
        <div class="cart-thumb">
          <img src="${item.img || ''}" alt="${esc(item.name || '')}"/>
        </div>
        <div class="cart-item-meta">
          <div class="cart-item-name">${esc(item.name || '')}</div>
          <div class="cart-item-brand">${esc(item.brand || '')}</div>
          <div class="cart-item-unit">$${Number(item.price).toLocaleString('es-AR')} c/u</div>
          ${atMax && stock !== null ? `<div class="stock-warning">⚠️ Stock máximo alcanzado</div>` : ''}
        </div>
        <div class="qty-row">
          <button class="qty-btn" onclick="changeQtyCheckout('${item.docId}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQtyCheckout('${item.docId}', 1)" ${atMax ? 'disabled' : ''}>+</button>
        </div>
        <div class="cart-item-price">$${total.toLocaleString('es-AR')}</div>
        <button class="remove-btn" onclick="removeFromCheckout('${item.docId}')" title="Eliminar">✕</button>
      </div>`;
  }).join('');

  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon">🛒</div>
        <div>
          <div class="panel-title">TU <span>CARRITO</span></div>
          <div class="panel-sub">${cartItems.length} producto${cartItems.length !== 1 ? 's' : ''} · Revisá antes de continuar</div>
        </div>
      </div>
      <div class="panel-body">
        ${itemsHtml}
        <div class="cart-actions">
          <button class="btn btn-danger" onclick="clearCart()">🗑 Vaciar carrito</button>
          <div style="flex:1"></div>
          <a href="index.html" class="btn btn-ghost">← Seguir comprando</a>
          <button class="btn btn-primary" onclick="renderStep(2)">Proceder al pago →</button>
        </div>
      </div>
    </div>`;
}

function changeQtyCheckout(docId, delta) {
  const item = STATE.cart.find(x => x.docId === docId);
  if (!item) return;

  const stock = item.stock ?? null;
  const maxQty = stock !== null ? stock : 999999;

  if (delta > 0 && item.qty >= maxQty) {
    showToast(`⚠️ Solo hay ${stock} unidad${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''}`, 'warn');
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
        <div class="panel-icon">👤</div>
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
          <div class="address-section-title">📍 Dirección de entrega</div>
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
              <label class="form-label">Notas adicionales <span style="color:var(--muted);font-weight:400">(opcional)</span></label>
              <textarea class="form-input" id="f-notes" rows="2" placeholder="Instrucciones especiales, departamento, timbre...">${esc(c.notes || '')}</textarea>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="renderStep(1)">← Volver al carrito</button>
          <button class="btn btn-primary" onclick="submitStep2()">Continuar al envío →</button>
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
  const isChaco = province.includes('chaco');
  
  let costCerca = SHIPPING.CERCA;
  let costLejos = SHIPPING.LEJOS;
  let costOtraProv = SHIPPING.OTRA_PROV;
  
  if (subtotal >= SHIPPING.LOCAL_MIN && isChaco) {
    costCerca = 0;
    costLejos = 0;
  }
  
  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon">🚚</div>
        <div>
          <div class="panel-title">MÉTODO DE <span>ENTREGA</span></div>
          <div class="panel-sub">Elegí cómo querés recibir tu pedido</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="delivery-option${STATE.delivery === 'local' ? ' selected' : ''}" id="del-local" onclick="selectDelivery('local', 0)">
          <div class="delivery-option-header">
            <div class="delivery-option-left">
              <div class="delivery-radio"></div>
              <div class="delivery-icon">🏪</div>
              <div>
                <div class="delivery-name">Retiro en sucursal</div>
                <div class="delivery-sub" style="font-size:12px;color:var(--muted)">Pasá a retirarlo cuando quieras</div>
              </div>
            </div>
            <div class="delivery-price free">GRATIS</div>
          </div>
          <div class="delivery-details">
            📍 ${STORE.address}<br>
            🕐 ${STORE.hours}<br>
            <span class="delivery-badge">✅ Disponible hoy</span>
          </div>
        </div>

        <div class="delivery-option${STATE.delivery && STATE.delivery.startsWith('domicilio') ? ' selected' : ''}" id="del-dom"
          onclick="selectDeliveryDomicilio(${costCerca}, ${costLejos}, ${costOtraProv}, ${isChaco ? 1 : 0})">
          <div class="delivery-option-header">
            <div class="delivery-option-left">
              <div class="delivery-radio"></div>
              <div class="delivery-icon">🛵</div>
              <div>
                <div class="delivery-name">Envío a domicilio</div>
                <div class="delivery-sub" style="font-size:12px;color:var(--muted)">Lo llevamos a tu puerta</div>
              </div>
            </div>
            <div class="delivery-price paid">
              ${isChaco
                ? (subtotal >= SHIPPING.LOCAL_MIN
                  ? '<span style="color:var(--green)">GRATIS</span>'
                  : `Desde $${costCerca.toLocaleString('es-AR')}`)
                : `$${costOtraProv.toLocaleString('es-AR')}`}
            </div>
          </div>
          <div class="delivery-details">
            ${isChaco ? `
              ≤ 10 cuadras del local: <strong style="color:var(--accent)">$${costCerca.toLocaleString('es-AR')}</strong><br>
              > 10 cuadras: <strong style="color:var(--accent)">$${costLejos.toLocaleString('es-AR')}</strong><br>
              ${subtotal >= SHIPPING.LOCAL_MIN ? `<span class="delivery-badge">🎉 ¡Envío gratis!</span>` : ''}
            ` : `
              Otra provincia: <strong style="color:var(--accent2)">$${costOtraProv.toLocaleString('es-AR')}</strong><br>
              Entrega estimada: 3-7 días hábiles
            `}
          </div>
        </div>

        <div id="distanceSelector" style="display:${STATE.delivery && STATE.delivery.startsWith('domicilio') && isChaco ? 'block' : 'none'};margin-top:8px;">
          <div style="padding:16px;background:var(--bg3);border-radius:12px;border:1px solid var(--border)">
            <div style="font-size:13px;color:var(--muted);margin-bottom:12px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em;font-size:11px">
              ¿A cuántas cuadras estás del local (${STORE.address})?
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);">
                <input type="radio" name="distancia" value="cerca" ${STATE.deliveryDistance === 'cerca' ? 'checked' : ''}
                  onchange="selectDeliveryExact('domicilio_cerca', ${costCerca})"
                  style="accent-color:var(--accent);width:16px;height:16px"/>
                <div>
                  <div style="font-size:13px;font-weight:500">≤ 10 cuadras del local</div>
                  <div style="font-size:12px;color:var(--muted)">
                    ${subtotal >= SHIPPING.LOCAL_MIN ? `<span style="color:var(--green)">GRATIS</span>` : '$' + costCerca.toLocaleString('es-AR')}
                  </div>
                </div>
              </label>
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);">
                <input type="radio" name="distancia" value="lejos" ${STATE.deliveryDistance === 'lejos' ? 'checked' : ''}
                  onchange="selectDeliveryExact('domicilio_lejos', ${costLejos})"
                  style="accent-color:var(--accent);width:16px;height:16px"/>
                <div>
                  <div style="font-size:13px;font-weight:500">> 10 cuadras del local</div>
                  <div style="font-size:12px;color:var(--muted)">
                    ${subtotal >= SHIPPING.LOCAL_MIN ? `<span style="color:var(--green)">GRATIS</span>` : '$' + costLejos.toLocaleString('es-AR')}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="delivery-info-box">
          <strong>📦 Tu dirección registrada:</strong><br>
          ${esc(STATE.contact.street || '')}, ${esc(STATE.contact.city || '')}, ${esc(STATE.contact.province || '')}
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="renderStep(2)">← Volver</button>
          <button class="btn btn-primary" onclick="submitStep3()">Continuar al pago →</button>
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

function selectDeliveryDomicilio(costCerca, costLejos, costProv, isSameCity) {
  document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('del-dom')?.classList.add('selected');
  
  if (!isSameCity) {
    STATE.delivery = 'domicilio_prov';
    STATE.deliveryCost = costProv;
    STATE.deliveryDistance = null;
    renderSummary();
    return;
  }
  
  STATE.delivery = 'domicilio';
  STATE.deliveryCost = costCerca;
  STATE.deliveryDistance = 'cerca';
  
  const ds = document.getElementById('distanceSelector');
  if (ds) ds.style.display = 'block';
  renderSummary();
}

function selectDeliveryExact(type, cost) {
  STATE.delivery = type;
  STATE.deliveryCost = cost;
  STATE.deliveryDistance = type === 'domicilio_cerca' ? 'cerca' : 'lejos';
  renderSummary();
}

function submitStep3() {
  if (!STATE.delivery) {
    showToast('⚠️ Seleccioná un método de entrega', 'warn');
    return;
  }
  renderStep(4);
}

/* ══════════════════════════════════════════════════════════
   PASO 4 — PAGO (CON SISTEMA DE PUNTOS)
══════════════════════════════════════════════════════════ */

function renderStep4() {
  const subtotal = getSubtotal();
  const shipping = STATE.deliveryCost;
  const totalSinDesc = subtotal + shipping;
  const maxPoints = Math.floor(totalSinDesc * 0.30);
  const userPts = window._userPoints || 0;
  const availPts = Math.min(userPts, maxPoints);
  const canEfectivo = STATE.delivery === 'local';
  const puntosActuales = Math.min(STATE.pointsUsed, availPts);
  
  if (STATE.pointsUsed !== puntosActuales) STATE.pointsUsed = puntosActuales;
  
  // Determinar si el usuario tiene puntos para mostrar
  const hasPoints = userPts > 0;
  
  return `
    <div class="panel step-content">
      <div class="panel-header">
        <div class="panel-icon">💳</div>
        <div>
          <div class="panel-title">MÉTODO DE <span>PAGO</span></div>
          <div class="panel-sub">Elegí cómo querés pagar tu pedido</div>
        </div>
      </div>
      <div class="panel-body">
        ${hasPoints ? `
        <div class="points-section">
          <div class="points-header">
            <div class="points-title">
              ⭐ Usar mis puntos
              <span class="points-badge">${userPts.toLocaleString('es-AR')} pts disponibles</span>
            </div>
            <div class="points-available">Podés usar hasta el 30% del total</div>
          </div>
          <div class="points-slider-wrap">
            <span style="font-size:12px;color:var(--muted)">$0</span>
            <input type="range" class="points-slider" id="pointsSlider"
              min="0" max="${availPts}" value="${puntosActuales}"
              oninput="updatePoints(this.value)"/>
            <div class="points-amount" id="pointsAmount">-$${puntosActuales.toLocaleString('es-AR')}</div>
          </div>
          <div class="points-desc">
            Máximo aplicable: <strong style="color:var(--accent)">$${availPts.toLocaleString('es-AR')}</strong>
            (30% de $${totalSinDesc.toLocaleString('es-AR')}) · 1 punto = $1
          </div>
        </div>
        ` : `
        <div class="points-section" style="background:rgba(229,62,62,0.1);border-color:rgba(229,62,62,0.2)">
          <div class="points-header">
            <div class="points-title">
              ⭐ Puntos
            </div>
          </div>
          <div style="font-size:13px;color:var(--red);text-align:center;padding:8px 0">
            ❌ No tenés puntos disponibles para usar en esta compra.
          </div>
        </div>
        `}

        <div class="payment-option${STATE.payment === 'mp' ? ' selected' : ''}" id="pay-mp" onclick="selectPayment('mp')">
          <div class="payment-option-header">
            <div class="payment-radio"></div>
            <div class="payment-icon">⚡</div>
            <div>
              <div class="payment-name">Mercado Pago</div>
              <div class="payment-sub">Tarjeta de crédito/débito · Cuotas disponibles</div>
            </div>
          </div>
          <div class="payment-detail">
            <div class="mp-form">
              <div class="mp-brand">
                <div class="mp-logo">mercadopago</div>
                <div class="mp-secure">🔒 Pago seguro y encriptado</div>
              </div>
              <p style="font-size:13px;color:var(--muted);text-align:center;padding:12px 0">
                Al confirmar serás redirigido al sitio de Mercado Pago para completar el pago de forma segura.
              </p>
            </div>
          </div>
        </div>

        <div class="payment-option${STATE.payment === 'transfer' ? ' selected' : ''}" id="pay-transfer" onclick="selectPayment('transfer')">
          <div class="payment-option-header">
            <div class="payment-radio"></div>
            <div class="payment-icon">🏦</div>
            <div>
              <div class="payment-name">Transferencia bancaria</div>
              <div class="payment-sub">Envianos el comprobante por WhatsApp</div>
            </div>
          </div>
          <div class="payment-detail">
            <div class="bank-data">
              <div class="bank-row"><span class="bk-label">Banco</span><span class="bk-value">Banco Nación Argentina</span></div>
              <div class="bank-row"><span class="bk-label">Titular</span><span class="bk-value">LOBO24 S.A.S.</span></div>
              <div class="bank-row"><span class="bk-label">CBU</span><span class="bk-value">0110599920000012345678<button class="copy-btn" onclick="copyText('0110599920000012345678', 'CBU copiado')">Copiar</button></span></div>
              <div class="bank-row"><span class="bk-label">Alias</span><span class="bk-value">LOBO24.PAGO<button class="copy-btn" onclick="copyText('LOBO24.PAGO', 'Alias copiado')">Copiar</button></span></div>
              <div class="bank-row"><span class="bk-label">CUIT</span><span class="bk-value">20-12345678-9</span></div>
            </div>
          </div>
        </div>

        <div class="payment-option${canEfectivo ? '' : ' disabled'}${STATE.payment === 'efectivo' ? ' selected' : ''}" id="pay-efectivo"
          onclick="${canEfectivo ? `selectPayment('efectivo')` : `showToast('Solo disponible con retiro en sucursal','warn')`}">
          <div class="payment-option-header">
            <div class="payment-radio"></div>
            <div class="payment-icon">💵</div>
            <div>
              <div class="payment-name">Efectivo en local</div>
              <div class="payment-sub">${canEfectivo ? 'Pagás cuando venís a retirar' : '⚠️ Solo disponible con retiro en sucursal'}</div>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="renderStep(3)">← Volver</button>
          <button class="btn btn-primary btn-large" id="btnConfirmar" onclick="submitStep4()" ${!STATE.payment ? 'disabled' : ''}>
            🔒 Confirmar y Pagar
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
  if (btn) btn.disabled = false;
  renderSummary();
}

function updatePoints(val) {
  STATE.pointsUsed = Number(val || 0);
  const amtEl = document.getElementById('pointsAmount');
  if (amtEl) amtEl.textContent = `-$${STATE.pointsUsed.toLocaleString('es-AR')}`;
  renderSummary();
}

async function submitStep4() {
  if (!STATE.payment) {
    showToast('⚠️ Seleccioná un método de pago', 'warn');
    return;
  }
  
  const btn = document.getElementById('btnConfirmar');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Procesando...';
  }
  
  try {
    const totalAmount = getTotal();
    const orderId = 'LB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Calcular puntos ganados (1 punto cada $100 gastados en productos, sin contar envío)
    const pointsEarned = Math.floor(getSubtotal() / 100);
    
    const orderData = {
      orderId,
      userId: window._currentUser?.uid || null,
      contact: STATE.contact,
      items: STATE.cart.map(i => ({
        docId: i.docId,
        coleccion: i.coleccion,
        name: i.name,
        brand: i.brand,
        price: i.price,
        qty: i.qty,
        subtotal: i.price * i.qty,
        stockOriginal: i.stock
      })),
      subtotal: getSubtotal(),
      delivery: STATE.delivery,
      deliveryCost: STATE.deliveryCost,
      pointsUsed: STATE.pointsUsed,
      pointsEarned: pointsEarned,
      payment: STATE.payment,
      total: totalAmount,
      status: STATE.payment === 'mp' ? 'pending_payment' : 'confirmed',
      createdAt: new Date()
    };
    
    // 1. Guardar en Firestore
    if (window._fbAddDoc && window._db) {
      const ordersRef = window._fbCollection(window._db, 'pedidos');
      await window._fbAddDoc(ordersRef, orderData);
    }

    // 2. Guardar items para MP ANTES de limpiar el carrito
    const cartItemsParaMP = STATE.cart.map(i => ({
      id:       i.docId,
      name:     i.name,
      quantity: i.qty,
      price:    i.price
    }));

    STATE.orderId = orderId;

    // 5. Redirigir a Mercado Pago si corresponde
    if (STATE.payment === 'mp') {
      showToast('⏳ Conectando con Mercado Pago...', 'ok');

      const mpRes = await fetch('http://localhost:3000/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItemsParaMP,
          customerData: {
            name:  STATE.contact.name,
            email: STATE.contact.email,
            phone: STATE.contact.phone
          },
          orderData: {
            orderNumber: orderId
          }
        })
      });

      if (!mpRes.ok) {
        const errBody = await mpRes.text();
        console.error('MP backend error:', errBody);
        throw new Error('Error al crear la preferencia de Mercado Pago');
      }

      const mpData = await mpRes.json();

      // sandbox_init_point = modo TEST | init_point = produccion
      const mpUrl = mpData.sandbox_init_point || mpData.init_point;

      if (!mpUrl) {
        throw new Error('No se recibio la URL de pago de Mercado Pago');
      }

      // Limpiar carrito justo antes de redirigir
      STATE.cart = [];
      localStorage.removeItem('lobo24_cart');
      showToast('⏳ Pedido #' + orderId + ' registrado. Estamos esperando la confirmación del pago.', 'ok');

      // Redirigir al checkout de MP
      window.location.href = mpUrl;

    } else {
      // Transferencia o efectivo: descontar stock y puntos inmediatamente
      for (const item of cartItemsParaMP) {
        const cartItem = STATE.cart.find(x => x.docId === item.id);
        if (cartItem && cartItem.coleccion && cartItem.docId && cartItem.stock !== null && cartItem.stock !== undefined) {
          try {
            const productRef = window._fbDoc(window._db, cartItem.coleccion, cartItem.docId);
            const newStock = Math.max(0, Number(cartItem.stock) - Number(cartItem.qty));
            await window._fbUpdateDoc(productRef, { stock: newStock });
          } catch (err) { console.error('Stock err:', err); }
        }
      }
      if (window._currentUser) {
        try {
          const userRef = window._fbDoc(window._db, 'users', window._currentUser.uid);
          const userSnap = await window._fbGetDoc(userRef);
          if (userSnap.exists()) {
            const currentPoints = userSnap.data().points || 0;
            const newPoints = Math.max(0, currentPoints - STATE.pointsUsed + pointsEarned);
            await window._fbUpdateDoc(userRef, { points: newPoints });
          }
        } catch (err) { console.error('Points err:', err); }
      }
      STATE.cart = [];
      localStorage.removeItem('lobo24_cart');
      showToast('🎉 Pedido #' + orderId + ' realizado con exito! Ganaste ' + pointsEarned + ' puntos.', 'success');
      renderStep(5);
    }
    
  } catch (err) {
    console.error('Error al procesar el pedido:', err);
    showToast('❌ Error al procesar el pedido. Intentá de nuevo.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔒 Confirmar y Pagar';
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
    domicilio_cerca: 'Envío a domicilio',
    domicilio_lejos: 'Envío a domicilio',
    domicilio_prov: 'Envío a otra provincia'
  };
  
  const pointsEarned = Math.floor(getSubtotal() / 100);
  const puntosConfirmados = STATE.payment !== 'mp';
  const orderNum = STATE.orderId || 'LB' + Date.now().toString(36).toUpperCase().slice(-6);
  const whatsMsg = encodeURIComponent(`Hola Lobo24! Mi número de pedido es #${orderNum}. ${STATE.payment === 'transfer' ? 'Adjunto el comprobante de transferencia.' : 'Quiero confirmar mi pedido.'}`);
  
  return `
    <div class="panel step-content" style="grid-column:1/-1;max-width:680px;margin:0 auto;width:100%">
      <div class="confirmation">
        <div class="confirmation-icon">✅</div>
        <h2>¡PEDIDO REALIZADO!</h2>
        <p>Tu pedido fue registrado con éxito. Recibirás confirmación en <strong>${esc(STATE.contact.email || 'tu correo')}</strong>.</p>
        <div class="order-number">📋 Pedido #${orderNum}</div>
        <div class="confirmation-detail">
          <div class="cd-row"><span class="cd-label">Cliente</span><span class="cd-value">${esc(STATE.contact.name || '—')}</span></div>
          <div class="cd-row"><span class="cd-label">Entrega</span><span class="cd-value">${deliveryLabels[STATE.delivery] || STATE.delivery || '—'}</span></div>
          ${STATE.delivery !== 'local' ? `<div class="cd-row"><span class="cd-label">Dirección</span><span class="cd-value">${esc(STATE.contact.street || '')}, ${esc(STATE.contact.city || '')}</span></div>` : `<div class="cd-row"><span class="cd-label">Dirección</span><span class="cd-value">${STORE.address}</span></div>`}
          <div class="cd-row"><span class="cd-label">Pago</span><span class="cd-value">${paymentLabels[STATE.payment] || STATE.payment || '—'}</span></div>
          <div class="cd-row"><span class="cd-label">Total abonado</span><span class="cd-value" style="color:var(--accent)">$${getTotal().toLocaleString('es-AR')}</span></div>
          ${puntosConfirmados
            ? `<div class="cd-row"><span class="cd-label">⭐ Puntos ganados</span><span class="cd-value" style="color:var(--green)">+${pointsEarned} puntos</span></div>`
            : `<div class="cd-row"><span class="cd-label">⭐ Puntos</span><span class="cd-value" style="color:var(--accent)">Pendientes hasta aprobación del pago</span></div>`
          }
          ${STATE.pointsUsed > 0
            ? (puntosConfirmados
                ? `<div class="cd-row"><span class="cd-label">⭐ Puntos usados</span><span class="cd-value" style="color:var(--accent2)">-${STATE.pointsUsed} puntos</span></div>`
                : `<div class="cd-row"><span class="cd-label">⭐ Puntos usados</span><span class="cd-value" style="color:var(--accent2)">-${STATE.pointsUsed} (pendiente)</span></div>`)
            : ''}
          ${STATE.pointsUsed > 0 ? `<div class="cd-row"><span class="cd-label">⭐ Puntos usados</span><span class="cd-value" style="color:var(--accent2)">-${STATE.pointsUsed} puntos</span></div>` : ''}
        </div>
        ${STATE.payment === 'transfer' ? `
        <div style="background:rgba(240,192,64,.08);border:1px solid rgba(240,192,64,.2);border-radius:12px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:var(--muted);text-align:left">
          <strong style="color:var(--accent)">📌 Próximo paso:</strong><br>
          Realizá la transferencia por <strong>$${getTotal().toLocaleString('es-AR')}</strong> al alias <strong>LOBO24.PAGO</strong>
          y enviá el comprobante por WhatsApp mencionando el pedido #${orderNum}.
        </div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">
          <a href="https://wa.me/54${STORE.phone}?text=${whatsMsg}" target="_blank" class="whatsapp-btn">💬 Contactar por WhatsApp</a>
          <a href="index.html" class="btn btn-ghost">🛍️ Seguir comprando</a>
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
  if (!itemsEl || !totalsEl) return;
  
  if (STATE.cart.length === 0) {
    itemsEl.innerHTML = `<p style="text-align:center;color:var(--muted);padding:20px">Carrito vacío</p>`;
    totalsEl.innerHTML = '';
    return;
  }
  
  itemsEl.innerHTML = STATE.cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img"><img src="${item.img || ''}" alt="${esc(item.name)}"/><span class="summary-item-qty">${item.qty}</span></div>
      <div class="summary-item-info"><div class="summary-item-name">${esc(item.name)}</div><div class="summary-item-brand">${esc(item.brand)}</div></div>
      <div class="summary-item-price">$${(item.price * item.qty).toLocaleString('es-AR')}</div>
    </div>
  `).join('');
  
  const subtotal = getSubtotal();
  const shipping = STATE.deliveryCost;
  const pointsDisc = STATE.pointsUsed;
  const total = Math.max(0, subtotal + shipping - pointsDisc);
  
  totalsEl.innerHTML = `
    <div class="summary-row"><span class="label">Subtotal</span><span class="value">$${subtotal.toLocaleString('es-AR')}</span></div>
    <div class="summary-row${shipping > 0 ? ' shipping-cost' : ''}"><span class="label">Envío</span><span class="value">${shipping === 0 ? '<span style="color:var(--green)">Gratis</span>' : '$' + shipping.toLocaleString('es-AR')}</span></div>
    ${pointsDisc > 0 ? `<div class="summary-row discount"><span class="label">⭐ Descuento puntos</span><span class="value">-$${pointsDisc.toLocaleString('es-AR')}</span></div>` : ''}
    <div class="summary-row total"><span class="label">Total</span><span class="value">$${total.toLocaleString('es-AR')}</span></div>
  `;
}

function getSubtotal() {
  return STATE.cart.reduce((s, i) => s + (i.price * i.qty), 0);
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

function showToast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast' + ((type === 'error' || type === 'warn') ? ' error' : '');
  t.innerHTML = `<span>${type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '🐺'}</span> ${msg}`;
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
    if (conn) conn.className = 'step-connector' + (i < active ? ' done' : '');
  }
}

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
window.initCheckout = initCheckout;

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initCheckout, 500));
} else {
  setTimeout(initCheckout, 500);
}