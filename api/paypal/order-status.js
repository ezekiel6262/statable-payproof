import { json } from '../_lib/http.js'
import { paypalFetch } from '../_lib/paypal.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
    const orderId = String(req.query?.id || '')
    if (!orderId || !/^[A-Z0-9]+$/.test(orderId)) return json(res, 400, { error: 'A valid PayPal order ID is required.' })
    const order = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}`)
    json(res, 200, { id: order.id, status: order.status, amount: order.purchase_units?.[0]?.amount })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to read PayPal order' })
  }
}
