import { allowPost, json, readJson } from '../_lib/http.js'
import { paypalConfigured, paypalFetch } from '../_lib/paypal.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const input = await readJson(req)
    const amount = Number(input.amount)
    if (!input.client || !input.email || !Number.isFinite(amount) || amount <= 0) return json(res, 400, { error: 'Client, email, and a positive amount are required.' })
    if (!paypalConfigured()) {
      return json(res, 200, { demo: true, id: `INV2-DEMO-${Date.now().toString(36).toUpperCase()}`, status: 'DRAFT', detail: 'Demo invoice created. Add PayPal Sandbox credentials to create it in PayPal.' })
    }
    const invoiceNumber = `STATABLE-${Date.now().toString(36).toUpperCase()}`
    const data = await paypalFetch('/v2/invoicing/invoices', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': invoiceNumber },
      body: JSON.stringify({
        detail: { invoice_number: invoiceNumber, reference: 'Statable income verification', currency_code: input.currency || 'USD', note: 'Payment will be included in your Statable income record after completion.' },
        primary_recipients: [{ billing_info: { name: { given_name: input.client }, email_address: input.email } }],
        items: [{ name: input.description || 'Professional services', quantity: '1', unit_amount: { currency_code: input.currency || 'USD', value: amount.toFixed(2) }, unit_of_measure: 'AMOUNT' }],
      }),
    })
    json(res, 201, { demo: false, id: data.id, status: 'DRAFT', href: data.href })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to create PayPal invoice' })
  }
}
