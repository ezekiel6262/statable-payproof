import { json } from '../_lib/http.js'
import { paypalFetch } from '../_lib/paypal.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  try {
    const invoiceId = String(req.query?.id || '')
    if (!invoiceId || !/^INV2-[A-Z0-9-]+$/.test(invoiceId)) return json(res, 400, { error: 'A valid PayPal invoice ID is required.' })
    const invoice = await paypalFetch(`/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`)
    json(res, 200, { id: invoice.id, status: invoice.status, amount: invoice.amount, dueAmount: invoice.due_amount, payments: invoice.payments || {} })
  } catch (error) { json(res, 502, { error: error instanceof Error ? error.message : 'Unable to read PayPal invoice' }) }
}
