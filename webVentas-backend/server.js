const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ===================== CONFIGURACIÓN =====================

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ===================== MERCADO PAGO =====================

const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// ===================== FIREBASE ADMIN =====================
// Usamos la REST API de Firestore para no necesitar firebase-admin
// La autenticación es mediante el Access Token de MP (solo lectura/escritura
// si las reglas de Firestore lo permiten desde el backend).
// ALTERNATIVA SIMPLE: usamos fetch a la REST API de Firestore con la Service Account.
//
// Por simplicidad, usamos el SDK REST directo con la API Key del proyecto
// (funciona mientras las reglas de Firestore permitan escritura autenticada).
// Para producción real, usar firebase-admin con service account.

const FIREBASE_PROJECT  = process.env.FIREBASE_PROJECT  || 'lobo24-9e46b';
const FIREBASE_API_KEY  = process.env.FIREBASE_API_KEY  || 'AIzaSyBiN4r47hmNycD7aZjkZa6XakZSzXwbL8Q';

// Helper: obtener un documento de Firestore via REST
async function firestoreGet(collection, docId) {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${collection}/${docId}?key=${FIREBASE_API_KEY}`;
    const res  = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
}

// Helper: actualizar campos en Firestore via REST (PATCH)
async function firestorePatch(collection, docId, fields) {
    const fieldPaths = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${collection}/${docId}?${fieldPaths}&key=${FIREBASE_API_KEY}`;

    // Convertir valores a formato Firestore
    const firestoreFields = {};
    for (const [k, v] of Object.entries(fields)) {
        if (typeof v === 'string')  firestoreFields[k] = { stringValue: v };
        else if (typeof v === 'number') firestoreFields[k] = { integerValue: String(Math.floor(v)) };
        else if (typeof v === 'boolean') firestoreFields[k] = { booleanValue: v };
    }

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: firestoreFields })
    });
    return res.ok;
}

// Helper: buscar pedido por orderId (external_reference de MP)
async function buscarPedidoPorOrderId(orderId) {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
    const body = {
        structuredQuery: {
            from: [{ collectionId: 'pedidos' }],
            where: {
                fieldFilter: {
                    field: { fieldPath: 'orderId' },
                    op: 'EQUAL',
                    value: { stringValue: orderId }
                }
            },
            limit: 1
        }
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) return null;
    const data = await res.json();
    // El resultado viene como array, primer elemento tiene .document
    if (!data || !data[0] || !data[0].document) return null;
    const doc = data[0].document;
    // Extraer el docId del name: .../documents/pedidos/{docId}
    const docId = doc.name.split('/').pop();
    return { docId, ...extraerCampos(doc.fields) };
}

// Convertir campos Firestore al formato JS
function extraerCampos(fields) {
    if (!fields) return {};
    const result = {};
    for (const [k, v] of Object.entries(fields)) {
        if (v.stringValue  !== undefined) result[k] = v.stringValue;
        else if (v.integerValue !== undefined) result[k] = Number(v.integerValue);
        else if (v.doubleValue  !== undefined) result[k] = Number(v.doubleValue);
        else if (v.booleanValue !== undefined) result[k] = v.booleanValue;
        else if (v.arrayValue) {
            result[k] = (v.arrayValue.values || []).map(item => {
                if (item.mapValue) return extraerCampos(item.mapValue.fields);
                return extraerCampos({ _: item })['_'];
            });
        }
        else if (v.mapValue) result[k] = extraerCampos(v.mapValue.fields);
    }
    return result;
}

// ===================== RUTAS =====================

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor Lobo24 funcionando!' });
});

// ── Crear preferencia de pago ──
app.post('/crear-preferencia', async (req, res) => {
    try {
        const { items, customerData, orderData } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No hay productos en el carrito' });
        }

        const mpItems = items.map(item => ({
            id:         item.id || String(Math.random()),
            title:      item.name,
            quantity:   Number(item.quantity),
            unit_price: Number(item.price),
            currency_id:'ARS'
        }));

        const preference = new Preference(mpClient);
        const result = await preference.create({
            body: {
                items: mpItems,
                payer: {
                    name:  customerData.name,
                    email: customerData.email,
                    phone: { number: customerData.phone }
                },
                external_reference:   orderData.orderNumber,
                statement_descriptor: 'LOBO24',
                // URLs de retorno después del pago
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/checkout.html?mp_status=success&order=${orderData.orderNumber}`,
                    failure: `${process.env.FRONTEND_URL}/checkout.html?mp_status=failure&order=${orderData.orderNumber}`,
                    pending: `${process.env.FRONTEND_URL}/checkout.html?mp_status=pending&order=${orderData.orderNumber}`
                },
                auto_return: 'approved',
                notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/webhook`
            }
        });

        console.log('✅ Preferencia creada:', result.id, '| Orden:', orderData.orderNumber);

        res.json({
            id:                  result.id,
            init_point:          result.init_point,
            sandbox_init_point:  result.sandbox_init_point
        });

    } catch (error) {
        console.error('❌ Error creando preferencia MP:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
});

// ── Webhook: MP avisa cuando se paga ──
app.post('/webhook', async (req, res) => {
    // Responder 200 inmediatamente (MP requiere respuesta rápida)
    res.sendStatus(200);

    try {
        const { type, data } = req.body;
        console.log('📬 Webhook recibido — tipo:', type, '| id:', data?.id);

        if (type !== 'payment' || !data?.id) return;

        // Obtener info del pago
        const payment   = new Payment(mpClient);
        const payInfo   = await payment.get({ id: data.id });
        const status    = payInfo.status;          // approved | rejected | pending
        const orderId   = payInfo.external_reference; // nuestro LB...

        console.log(`💳 Pago ${data.id} | Estado: ${status} | Orden: ${orderId}`);

        if (!orderId) return;

        // Buscar el pedido en Firestore
        const pedido = await buscarPedidoPorOrderId(orderId);
        if (!pedido) {
            console.warn('⚠️  Pedido no encontrado para orderId:', orderId);
            return;
        }

        console.log('📋 Pedido encontrado:', pedido.docId);

        if (status === 'approved') {
            // ── PAGO APROBADO: actualizar estado, descontar stock y puntos ──
            console.log('✅ Pago APROBADO — procesando...');

            // 1. Actualizar estado del pedido
            await firestorePatch('pedidos', pedido.docId, {
                status:    'payment_confirmed',
                mpPaymentId: String(data.id)
            });

            // 2. Descontar stock de cada producto
            const items = pedido.items || [];
            for (const item of items) {
                const col    = item.coleccion;
                const docId  = item.docId;
                const qty    = Number(item.qty || 1);
                const stockO = item.stockOriginal;

                if (!col || !docId || stockO === null || stockO === undefined) continue;

                const newStock = Math.max(0, Number(stockO) - qty);
                const ok = await firestorePatch(col, docId, { stock: newStock });
                if (ok) console.log(`  📦 Stock ${item.name}: ${stockO} → ${newStock}`);
                else    console.warn(`  ⚠️ No se pudo actualizar stock de ${item.name}`);
            }

            // 3. Actualizar puntos del usuario
            const userId      = pedido.userId;
            const pointsUsed  = Number(pedido.pointsUsed  || 0);
            const pointsEarned= Number(pedido.pointsEarned|| 0);

            if (userId) {
                const userDoc = await firestoreGet('users', userId);
                if (userDoc && userDoc.fields) {
                    const campos  = extraerCampos(userDoc.fields);
                    const current = Number(campos.points || 0);
                    const newPts  = Math.max(0, current - pointsUsed + pointsEarned);
                    await firestorePatch('users', userId, { points: newPts });
                    console.log(`  ⭐ Puntos usuario ${userId}: ${current} → ${newPts}`);
                }
            }

            console.log(`✅ Pedido ${orderId} procesado completamente`);

        } else if (status === 'rejected') {
            // Pago rechazado: actualizar estado y reponer stock (si se había reservado)
            await firestorePatch('pedidos', pedido.docId, {
                status: 'cancelled',
                mpPaymentId: String(data.id)
            });
            console.log(`❌ Pago rechazado para orden ${orderId}`);

        } else if (status === 'pending' || status === 'in_process') {
            // Pago pendiente (ej: Rapipago, PagoFácil)
            await firestorePatch('pedidos', pedido.docId, {
                status: 'pending_payment',
                mpPaymentId: String(data.id)
            });
            console.log(`⏳ Pago pendiente para orden ${orderId}`);
        }

    } catch (error) {
        console.error('❌ Error en webhook:', error);
    }
});

// ===================== INICIAR SERVIDOR =====================

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor Lobo24 en http://localhost:${PORT}`);
    console.log(`📦 Modo: ${process.env.MP_ACCESS_TOKEN?.startsWith('TEST') ? 'TEST' : 'PRODUCCIÓN'}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
    console.log(`🔥 Firebase: ${FIREBASE_PROJECT}\n`);
});