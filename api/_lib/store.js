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
      client: payment.client || payment.payer,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      classification: payment.classification,
      confidence: payment.confidence,
      explanation: payment.explanation,
      evidence: payment.evidence,
      model: payment.model,
      ai_status: payment.aiStatus || 'unknown',
      ai_detail: payment.aiDetail || null,
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
    client: row.client || row.payer,
    amount: Number(row.amount),
    currency: row.currency,
    description: row.description,
    status: row.status,
    classification: row.classification,
    confidence: row.confidence,
    explanation: row.explanation,
    evidence: row.evidence,
    model: row.model,
    aiStatus: row.ai_status || 'unknown',
    aiDetail: row.ai_detail,
    source: row.source,
    createdAt: row.created_at,
  }))
}

export async function saveProof(proof) {
  if (!storageConfigured()) return false
  await request('proofs?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: proof.id,
      merchant_id: 'demo',
      purpose: proof.purpose,
      snapshot: proof.snapshot,
      digest: proof.digest,
      status: proof.status || 'active',
      created_at: proof.createdAt,
      expires_at: proof.expiresAt,
    }),
  })
  return true
}

export async function getProof(id) {
  if (!storageConfigured()) return null
  const rows = await request(`proofs?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
  const row = rows?.[0]
  if (!row) return null
  return { id: row.id, purpose: row.purpose, snapshot: row.snapshot, digest: row.digest, status: row.status, revokedAt: row.revoked_at, createdAt: row.created_at, expiresAt: row.expires_at }
}

export async function listProofs(limit = 50) {
  if (!storageConfigured()) return []
  const rows = await request(`proofs?select=*&merchant_id=eq.demo&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 100))}`)
  return (rows || []).map((row) => ({ id: row.id, purpose: row.purpose, snapshot: row.snapshot, digest: row.digest, status: row.status, revokedAt: row.revoked_at, createdAt: row.created_at, expiresAt: row.expires_at }))
}

export async function revokeProof(id) {
  if (!storageConfigured()) return false
  const rows = await request(`proofs?id=eq.${encodeURIComponent(id)}&merchant_id=eq.demo`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'revoked', revoked_at: new Date().toISOString() }),
  })
  return Boolean(rows?.length)
}

export async function saveOrderRequest(order) {
  if (!storageConfigured()) return false
  await request('order_requests?on_conflict=order_id', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ order_id: order.orderId, merchant_id: 'demo', client_name: order.client, description: order.description, amount: order.amount, currency: order.currency, status: order.status || 'CREATED', updated_at: new Date().toISOString() }),
  })
  return true
}

export async function getOrderRequest(orderId) {
  if (!storageConfigured()) return null
  const rows = await request(`order_requests?select=*&order_id=eq.${encodeURIComponent(orderId)}&limit=1`)
  const row = rows?.[0]
  return row ? { orderId: row.order_id, client: row.client_name, description: row.description, amount: Number(row.amount), currency: row.currency, status: row.status } : null
}
