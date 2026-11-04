import { allowPost, json, readJson } from '../_lib/http.js'
import { paypalFetch } from '../_lib/paypal.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const { orderId } = await readJson(req)
    if (!orderId || !/^[A-Z0-9]+$/.test(orderId)) return json(res, 400, { error: 'A valid PayPal order ID is required.' })
    const order = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${orderId}` },
      body: '{}',
    })
    const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
    json(res, 200, { id: order.id, status: order.status, captureId: capture?.id, detail: capture?.status === 'COMPLETED' ? 'PayPal verified and captured this payment.' : 'PayPal processed the payment capture.' })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to capture PayPal order' })
  }
}
