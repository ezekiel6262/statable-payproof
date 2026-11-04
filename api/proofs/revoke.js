import { allowPost, json, readJson } from '../_lib/http.js'
import { revokeProof } from '../_lib/store.js'

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const { id } = await readJson(req)
    if (!/^ST-[A-F0-9]{10}$/.test(String(id || ''))) return json(res, 400, { error: 'A valid proof ID is required.' })
    const revoked = await revokeProof(id)
    json(res, revoked ? 200 : 404, revoked ? { id, status: 'revoked' } : { error: 'Proof not found.' })
  } catch (error) { json(res, 502, { error: error instanceof Error ? error.message : 'Unable to revoke proof' }) }
}
