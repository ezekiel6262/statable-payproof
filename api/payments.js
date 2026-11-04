import { json } from './_lib/http.js'
import { listPayments, storageConfigured } from './_lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  try {
    const payments = await listPayments(100)
    const income = payments.filter((payment) => payment.status === 'COMPLETED' && !['Not income', 'Refund', 'Loan', 'Internal transfer'].includes(payment.classification))
    const total = income.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const clients = new Set(income.map((payment) => payment.payer)).size
    json(res, 200, { configured: storageConfigured(), payments, summary: { total, count: income.length, clients } })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to load payments' })
  }
}
