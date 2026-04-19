import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/*
  Variables de entorno requeridas:
  - MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
  - FRONTEND_URL=http://127.0.0.1:5500
  - PORT=3000
*/

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error('❌ Falta MP_ACCESS_TOKEN en el archivo .env');
  process.exit(1);
}

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
  options: {
    timeout: 5000
  }
});

const preferenceClient = new Preference(client);

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function buildExternalReference(orderData = {}) {
  return sanitizeString(orderData.orderId) ||
         sanitizeString(orderData.orderNumber) ||
         `LOBO-${Date.now()}`;
}

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Servidor Mercado Pago Lobo24 activo'
  });
});

app.post('/crear-preferencia', async (req, res) => {
  try {
    const { items, customerData, orderData } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'No se recibieron productos para crear la preferencia'
      });
    }

    const normalizedItems = items.map((item, index) => {
      const title = sanitizeString(item.name || item.title, `Producto ${index + 1}`);
      const quantity = Math.max(1, toNumber(item.quantity, 1));
      const unit_price = toNumber(item.price, 0);

      if (!unit_price || unit_price <= 0) {
        throw new Error(`El producto "${title}" tiene un precio inválido`);
      }

      return {
        id: sanitizeString(item.id, `item-${index + 1}`),
        title,
        quantity,
        unit_price,
        currency_id: 'ARS'
      };
    });

    const payerEmail = sanitizeString(customerData?.email);
    const payerName = sanitizeString(customerData?.name);
    const payerPhone = sanitizeString(customerData?.phone);

    const externalReference = buildExternalReference(orderData);

    const body = {
      items: normalizedItems,
      payer: {
        name: payerName || undefined,
        email: payerEmail || undefined,
        phone: payerPhone ? { number: payerPhone } : undefined
      },
      external_reference: externalReference,
      back_urls: {
        success: `${FRONTEND_URL}/checkout.html?status=success&order=${encodeURIComponent(externalReference)}`,
        failure: `${FRONTEND_URL}/checkout.html?status=failure&order=${encodeURIComponent(externalReference)}`,
        pending: `${FRONTEND_URL}/checkout.html?status=pending&order=${encodeURIComponent(externalReference)}`
      },
      auto_return: 'approved',
      notification_url: `${FRONTEND_URL}/mp-webhook-placeholder`,
      statement_descriptor: 'LOBO24',
      binary_mode: false
    };

    const result = await preferenceClient.create({ body });

    return res.status(200).json({
      ok: true,
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      external_reference: externalReference
    });
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error);

    return res.status(500).json({
      ok: false,
      error: error.message || 'Error interno al crear la preferencia'
    });
  }
});

/*
  Endpoint opcional para futuro webhook real de Mercado Pago.
  Por ahora queda disponible para que no falle si luego querés usar notificaciones.
*/
app.post('/webhook/mercadopago', async (req, res) => {
  try {
    console.log('📩 Webhook Mercado Pago recibido:', JSON.stringify(req.body, null, 2));
    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server corriendo en http://localhost:${PORT}`);
});