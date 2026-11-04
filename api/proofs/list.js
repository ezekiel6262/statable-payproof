import { json } from '../_lib/http.js'
import { listProofs } from '../_lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  try { json(res, 200, { proofs: await listProofs(100) }) }
  catch (error) { json(res, 502, { error: error instanceof Error ? error.message : 'Unable to load proofs' }) }
}
