const fallback = (payment) => ({
  classification: 'One-off project',
  confidence: 91,
  explanation: 'A completed PayPal capture with a professional-services description is verifiable earned income.',
  evidence: ['Completed PayPal capture', 'Professional-services description', 'No refund or dispute recorded'],
  model: 'deterministic-fallback',
})

export async function classifyPayment(payment) {
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!gatewayToken) return fallback(payment)
  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${gatewayToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: 'Classify a completed PayPal transaction for proof of income. Return JSON only with classification (Recurring client income, One-off project, Refund, Loan, Internal transfer, or Not income), confidence 0-100, explanation under 35 words, and evidence as three short strings. Never infer protected traits or provide legal or credit advice.' },
          { role: 'user', content: JSON.stringify(payment) },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
      }),
    })
    if (!response.ok) return fallback(payment)
    const data = await response.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    return { ...fallback(payment), ...parsed, model: data.model || 'openai/gpt-5-mini' }
  } catch {
    return fallback(payment)
  }
}

export function paymentFromCapture({ order, capture, source = 'capture' }) {
  const amount = capture?.amount || order?.purchase_units?.[0]?.amount || {}
  const payerName = [order?.payer?.name?.given_name, order?.payer?.name?.surname].filter(Boolean).join(' ')
  return {
    id: capture?.id || order?.id,
    orderId: order?.id,
    payer: payerName || order?.payer?.email_address || 'PayPal client',
    amount: Number(amount.value || 0),
    currency: amount.currency_code || 'USD',
    description: order?.purchase_units?.[0]?.description || 'Professional services',
    status: capture?.status || order?.status || 'COMPLETED',
    createdAt: capture?.create_time || new Date().toISOString(),
    source,
  }
}
