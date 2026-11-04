const excluded = new Set(['Not income', 'Refund', 'Loan', 'Internal transfer'])

export function isIncome(payment) {
  return payment.status === 'COMPLETED' && !excluded.has(payment.classification)
}

export function paymentPatterns(payments) {
  const groups = new Map()
  for (const payment of payments.filter(isIncome)) {
    const key = (payment.client || payment.payer || 'Unknown client').trim().toLowerCase()
    const current = groups.get(key) || []
    current.push(payment)
    groups.set(key, current)
  }
  return [...groups.entries()].map(([key, records]) => {
    const timestamps = records.map((record) => new Date(record.createdAt).getTime()).filter(Number.isFinite).sort((a, b) => a - b)
    const gaps = timestamps.slice(1).map((time, index) => Math.round((time - timestamps[index]) / 86400000))
    const average = records.reduce((sum, record) => sum + Number(record.amount || 0), 0) / records.length
    const variance = records.reduce((sum, record) => sum + Math.abs(Number(record.amount || 0) - average), 0) / records.length
    return { key, client: records[0].client || records[0].payer, count: records.length, average, amountStability: average ? Math.max(0, 1 - variance / average) : 0, gaps }
  })
}

export function summarizeIncome(payments) {
  const income = payments.filter(isIncome)
  const total = income.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const clients = new Set(income.map((payment) => payment.client || payment.payer)).size
  const timestamps = income.map((payment) => new Date(payment.createdAt).getTime()).filter(Number.isFinite)
  const first = timestamps.length ? Math.min(...timestamps) : Date.now()
  const months = Math.max(1, Math.ceil((Date.now() - first) / (30 * 86400000)) || 1)
  const patterns = paymentPatterns(income)
  const recurringClients = patterns.filter((pattern) => pattern.count >= 2 && pattern.amountStability >= 0.65).length
  const recurringPayments = patterns.filter((pattern) => pattern.count >= 2 && pattern.amountStability >= 0.65).reduce((sum, pattern) => sum + pattern.count, 0)
  const recurringShare = income.length ? Math.round((recurringPayments / income.length) * 100) : 0
  const consistency = income.length ? Math.min(100, Math.round(55 + Math.min(20, income.length * 4) + Math.min(15, recurringShare * 0.15) + Math.min(10, clients * 2))) : 0
  return { income, total, count: income.length, clients, months, monthlyIncome: total / months, annualIncome: (total / months) * 12, consistency, recurringClients, recurringShare, patterns }
}
