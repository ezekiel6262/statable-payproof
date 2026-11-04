import { allowPost, json, readJson } from '../_lib/http.js'
import { paypalFetch } from '../_lib/paypal.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const { invoiceId } = await readJson(req)
    if (!invoiceId || !/^INV2-[A-Z0-9-]+$/.test(invoiceId)) return json(res, 400, { error: 'A valid PayPal invoice ID is required.' })
    await paypalFetch(`/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}/send`, { method: 'POST', body: JSON.stringify({ send_to_invoicer: false, send_to_recipient: true }) })
    json(res, 200, { id: invoiceId, status: 'SENT', detail: 'PayPal sent the invoice to the sandbox buyer.' })
  } catch (error) { json(res, 502, { error: error instanceof Error ? error.message : 'Unable to send PayPal invoice' }) }
}
