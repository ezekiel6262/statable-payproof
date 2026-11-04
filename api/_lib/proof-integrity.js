import crypto from 'node:crypto'

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

function signingKey() {
  return process.env.PROOF_SIGNING_SECRET || process.env.SUPABASE_SECRET_KEY || 'statable-local-demo-key'
}

export function signProof({ id, purpose, snapshot, createdAt, expiresAt }) {
  const canonicalCreatedAt = new Date(createdAt).toISOString()
  const canonicalExpiresAt = new Date(expiresAt).toISOString()
  return crypto.createHmac('sha256', signingKey()).update(stable({ id, purpose, snapshot, createdAt: canonicalCreatedAt, expiresAt: canonicalExpiresAt })).digest('hex')
}

export function verifyProof(proof) {
  if (!proof.digest) return false
  const expected = signProof(proof)
  const supplied = Buffer.from(proof.digest, 'hex')
  const computed = Buffer.from(expected, 'hex')
  return supplied.length === computed.length && crypto.timingSafeEqual(supplied, computed)
}
