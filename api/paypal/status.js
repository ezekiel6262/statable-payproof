import { json } from '../_lib/http.js'
import { paypalConfigured } from '../_lib/paypal.js'

export default function handler(_req, res) {
  json(res, 200, { configured: paypalConfigured(), environment: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox' })
}
