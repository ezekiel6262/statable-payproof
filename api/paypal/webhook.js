import { json, readJson } from '../_lib/http.js'
import { paypalConfigured, paypalFetch } from '../_lib/paypal.js'
import { classifyPayment, paymentFromCapture } from '../_lib/classify-payment.js'
import { savePayment } from '../_lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  try {
    const event = await readJson(req)
    if (!paypalConfigured() || !process.env.PAYPAL_WEBHOOK_ID) return json(res, 503, { error: 'PayPal webhook verification is not configured' })
    const verification = await paypalFetch('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'], cert_url: req.headers['paypal-cert-url'], transmission_id: req.headers['paypal-transmission-id'], transmission_sig: req.headers['paypal-transmission-sig'], transmission_time: req.headers['paypal-transmission-time'], webhook_id: process.env.PAYPAL_WEBHOOK_ID, webhook_event: event,
      }),
    })
    if (verification.verification_status !== 'SUCCESS') return json(res, 400, { error: 'Invalid PayPal webhook signature' })
    let saved = false
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const basePayment = paymentFromCapture({ order: { id: event.resource?.supplementary_data?.related_ids?.order_id, purchase_units: [{ description: event.resource?.description }], payer: event.resource?.payer }, capture: event.resource, source: 'webhook' })
      const classification = await classifyPayment(basePayment)
      saved = await savePayment({ ...basePayment, ...classification })
    }
    json(res, 200, { received: true, event: event.event_type, id: event.id, saved })
  } catch (error) {
    json(res, 400, { error: error instanceof Error ? error.message : 'Webhook verification failed' })
  }
}
