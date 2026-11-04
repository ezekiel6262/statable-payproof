import { allowPost, json, readJson } from '../_lib/http.js'
import { paypalConfigured, paypalFetch } from '../_lib/paypal.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const input = await readJson(req)
    const amount = Number(input.amount)
    if (!input.client || !Number.isFinite(amount) || amount <= 0) {
      return json(res, 400, { error: 'Client and a positive amount are required.' })
    }
    if (!paypalConfigured()) {
      return json(res, 200, { demo: true, id: `ORDER-DEMO-${Date.now().toString(36).toUpperCase()}`, status: 'CREATED', detail: 'Demo payment request created. Add PayPal Sandbox credentials to create it in PayPal.' })
    }

    const requestId = `statable-${Date.now().toString(36)}`
    const data = await paypalFetch('/v2/checkout/orders', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': requestId, Prefer: 'return=representation' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: requestId,
          custom_id: `STATABLE-${Date.now().toString(36).toUpperCase()}`,
          description: input.description || 'Professional services',
          amount: { currency_code: input.currency || 'USD', value: amount.toFixed(2) },
          payee: undefined,
        }],
        application_context: {
          brand_name: 'Statable',
          user_action: 'PAY_NOW',
          return_url: 'https://statable-payproof.vercel.app/?paypal=approved',
          cancel_url: 'https://statable-payproof.vercel.app/?paypal=cancelled',
        },
      }),
    })
    const approveUrl = data.links?.find((link) => link.rel === 'approve' || link.rel === 'payer-action')?.href
    json(res, 201, { demo: false, id: data.id, status: data.status, approveUrl, detail: `Payment request created for ${input.client}.` })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to create PayPal payment request' })
  }
}
