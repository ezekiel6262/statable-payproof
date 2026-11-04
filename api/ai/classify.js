import { allowPost, json, readJson } from '../_lib/http.js'
import { classifyPayment } from '../_lib/classify-payment.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const input = await readJson(req)
    if (!input.payment) return json(res, 400, { error: 'Payment is required' })
    json(res, 200, await classifyPayment(input.payment, Array.isArray(input.history) ? input.history : []))
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to classify payment' })
  }
}
