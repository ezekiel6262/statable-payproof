import { json } from '../_lib/http.js'
import { getProof } from '../_lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  try {
    const id = String(req.query?.id || '')
    if (!/^ST-[A-F0-9]{10}$/.test(id)) return json(res, 400, { error: 'A valid proof ID is required.' })
    const proof = await getProof(id)
    if (!proof) return json(res, 404, { error: 'Proof not found.' })
    if (new Date(proof.expiresAt).getTime() < Date.now()) return json(res, 410, { error: 'This proof has expired.' })
    json(res, 200, { proof })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to read proof' })
  }
}
