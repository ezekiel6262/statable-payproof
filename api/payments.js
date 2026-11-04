import { json } from './_lib/http.js'
import { listPayments, storageConfigured } from './_lib/store.js'
import { summarizeIncome } from './_lib/income.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  try {
    const payments = await listPayments(100)
    const summary = summarizeIncome(payments)
    json(res, 200, { configured: storageConfigured(), payments, summary: { total: summary.total, count: summary.count, clients: summary.clients, consistency: summary.consistency, recurringClients: summary.recurringClients, recurringShare: summary.recurringShare } })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to load payments' })
  }
}
