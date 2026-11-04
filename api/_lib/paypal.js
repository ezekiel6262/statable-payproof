const sandbox = process.env.PAYPAL_ENV !== 'live'
export const paypalBase = sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

export function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

export async function paypalToken() {
  if (!paypalConfigured()) throw new Error('PayPal credentials are not configured')
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const response = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!response.ok) throw new Error(`PayPal authentication failed (${response.status})`)
  return (await response.json()).access_token
}

export async function paypalFetch(path, init = {}) {
  const token = await paypalToken()
  const response = await fetch(`${paypalBase}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json', ...(init.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.details?.[0]?.description || data?.message || `PayPal request failed (${response.status})`)
  return data
}
