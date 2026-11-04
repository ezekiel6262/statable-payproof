import { json } from './_lib/http.js'
import { paypalConfigured } from './_lib/paypal.js'

export default function handler(req, res) {
  json(res, 200, {
    ok: true,
    service: 'statable-payproof',
    mode: paypalConfigured() ? 'sandbox' : 'demo',
    paypal: paypalConfigured(),
    ai: Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY || req.headers['x-vercel-oidc-token']),
    timestamp: new Date().toISOString(),
  })
}
