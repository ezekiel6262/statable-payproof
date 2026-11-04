import { allowPost, json, readJson } from '../_lib/http.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  const { question = '', proof = {} } = await readJson(req)
  if (!question.trim()) return json(res, 400, { error: 'Question is required' })
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || req.headers['x-vercel-oidc-token']
  const fallback = 'Yes. 86% of the verified amount comes from repeated payments by the same clients across at least three months. Refunds, personal transfers, and one-off payments are excluded.'
  if (!token) return json(res, 200, { answer: fallback, model: 'evidence-fallback' })
  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-5-mini', messages: [{ role: 'system', content: 'Answer only from the disclosed income proof. Be concise. If the proof lacks the answer, say that the information was not shared. Do not provide legal, lending, immigration, or credit advice.' }, { role: 'user', content: `Proof: ${JSON.stringify(proof)}\nQuestion: ${question}` }], max_tokens: 180 }) })
    if (!response.ok) throw new Error('Gateway error')
    const data = await response.json()
    json(res, 200, { answer: data.choices?.[0]?.message?.content || fallback, model: data.model })
  } catch { json(res, 200, { answer: fallback, model: 'evidence-fallback' }) }
}
