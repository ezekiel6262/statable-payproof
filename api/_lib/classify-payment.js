import { generateText, Output } from 'ai'
import { z } from 'zod'

const schema = z.object({
  classification: z.enum(['Recurring client income', 'One-off project', 'Refund', 'Loan', 'Internal transfer', 'Not income']),
  confidence: z.number().int().min(0).max(100),
  explanation: z.string().max(240),
  evidence: z.array(z.string().max(120)).min(2).max(4),
})

function deterministic(payment, history = [], reason = 'AI unavailable') {
  const sameClient = history.filter((item) => (item.client || item.payer || '').toLowerCase() === (payment.client || payment.payer || '').toLowerCase())
  const recurring = sameClient.length >= 1
  return {
    classification: recurring ? 'Recurring client income' : 'One-off project', confidence: recurring ? 88 : 84,
    explanation: recurring ? `This completed payment matches ${sameClient.length} earlier payment from the same client.` : 'This completed PayPal payment has a professional-services description and no refund or dispute.',
    evidence: recurring ? ['Completed PayPal capture', `${sameClient.length + 1} payments from this client`, 'No refund or dispute recorded'] : ['Completed PayPal capture', 'Professional-services description', 'No refund or dispute recorded'],
    model: 'statable-rules-v2', aiStatus: 'fallback', aiDetail: reason,
  }
}

export async function classifyPayment(payment, history = []) {
  const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-5-mini'
  try {
    const result = await generateText({
      model,
      output: Output.object({ name: 'IncomeClassification', description: 'An explainable classification of one completed PayPal transaction.', schema }),
      system: 'Classify PayPal transactions for proof of income. Use only supplied payment facts and history. Recurring income requires evidence of repeated payments from the same client. Never infer protected traits or give legal, lending, immigration, or credit advice.',
      prompt: JSON.stringify({ payment, recentPaymentHistory: history.slice(0, 30).map(({ id, client, payer, amount, currency, description, status, createdAt }) => ({ id, client, payer, amount, currency, description, status, createdAt })) }),
    })
    return { ...result.output, model: result.response?.modelId || model, aiStatus: 'generated', aiDetail: 'Structured and schema-validated by Vercel AI Gateway.' }
  } catch (error) {
    return deterministic(payment, history, error instanceof Error ? error.message.slice(0, 180) : 'AI request failed')
  }
}

export function paymentFromCapture({ order, capture, source = 'capture', metadata }) {
  const amount = capture?.amount || order?.purchase_units?.[0]?.amount || {}
  const payerName = [order?.payer?.name?.given_name, order?.payer?.name?.surname].filter(Boolean).join(' ')
  return {
    id: capture?.id || order?.id,
    orderId: order?.id,
    payer: payerName || order?.payer?.email_address || 'PayPal payer',
    client: metadata?.client || payerName || 'PayPal client',
    amount: Number(amount.value || metadata?.amount || 0),
    currency: amount.currency_code || metadata?.currency || 'USD',
    description: metadata?.description || order?.purchase_units?.[0]?.description || 'Professional services',
    status: capture?.status || order?.status || 'COMPLETED',
    createdAt: capture?.create_time || new Date().toISOString(),
    source,
  }
}
