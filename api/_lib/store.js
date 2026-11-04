const supabaseUrl = () => process.env.SUPABASE_URL
const supabaseKey = () => process.env.SUPABASE_SECRET_KEY

export function storageConfigured() {
  return Boolean(supabaseUrl() && supabaseKey())
}

async function request(path, init = {}) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey(),
      Authorization: `Bearer ${supabaseKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || `Storage request failed (${response.status})`)
  return data
}

export async function savePayment(payment) {
  if (!storageConfigured()) return false
  await request('payments?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: payment.id,
      order_id: payment.orderId || null,
      merchant_id: 'demo',
      payer: payment.payer,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      classification: payment.classification,
      confidence: payment.confidence,
      explanation: payment.explanation,
      evidence: payment.evidence,
      model: payment.model,
      source: payment.source,
      created_at: payment.createdAt,
      updated_at: new Date().toISOString(),
    }),
  })
  return true
}

export async function listPayments(limit = 50) {
  if (!storageConfigured()) return []
  const rows = await request(`payments?select=*&merchant_id=eq.demo&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 100))}`)
  return (rows || []).map((row) => ({
    id: row.id,
    orderId: row.order_id,
    payer: row.payer,
    amount: Number(row.amount),
    currency: row.currency,
    description: row.description,
    status: row.status,
    classification: row.classification,
    confidence: row.confidence,
    explanation: row.explanation,
    evidence: row.evidence,
    model: row.model,
    source: row.source,
    createdAt: row.created_at,
  }))
}
