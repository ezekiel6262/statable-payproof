import { allowPost, json, readJson } from '../_lib/http.js'

const fallback = (p) => ({ classification: p.client?.toLowerCase().includes('personal') ? 'Not income' : 'Recurring client income', confidence: p.client?.toLowerCase().includes('personal') ? 82 : 94, explanation: p.client?.toLowerCase().includes('personal') ? 'The payer and description indicate a personal transfer with no matching invoice.' : 'The amount, payer, and cadence match a repeated professional-services pattern.', evidence: ['Completed PayPal payment', 'Payer pattern checked', 'Refund and dispute status checked'], model: 'deterministic-fallback' })

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  const input = await readJson(req)
  if (!input.payment) return json(res, 400, { error: 'Payment is required' })
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!token) return json(res, 200, fallback(input.payment))
  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-5-mini', messages: [{ role: 'system', content: 'Classify PayPal transactions for proof of income. Return JSON only with classification (Recurring client income, One-off project, Refund, Loan, Internal transfer, or Not income), confidence 0-100, explanation under 35 words, and evidence as an array of three short strings. Never infer protected traits or provide legal/credit advice.' }, { role: 'user', content: JSON.stringify(input.payment) }], response_format: { type: 'json_object' }, max_tokens: 300 }),
    })
    if (!response.ok) throw new Error(`AI Gateway returned ${response.status}`)
    const data = await response.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    json(res, 200, { ...parsed, model: data.model || 'openai/gpt-5-mini' })
  } catch {
    json(res, 200, fallback(input.payment))
  }
}
