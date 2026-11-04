import crypto from 'node:crypto'
import { allowPost, json, readJson } from '../_lib/http.js'
import { listPayments, saveProof } from '../_lib/store.js'

const allowedPurposes = new Set(['Rent a home', 'Apply for a loan', 'Apply for a visa', 'General income proof'])

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const { purpose } = await readJson(req)
    if (!allowedPurposes.has(purpose)) return json(res, 400, { error: 'Choose a valid proof purpose.' })
    const payments = await listPayments(100)
    const income = payments.filter((payment) => payment.status === 'COMPLETED' && !['Not income', 'Refund', 'Loan', 'Internal transfer'].includes(payment.classification))
    if (!income.length) return json(res, 400, { error: 'Complete at least one verified income payment before creating a proof.' })
    const total = income.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const clients = new Set(income.map((payment) => payment.payer)).size
    const timestamps = income.map((payment) => new Date(payment.createdAt).getTime()).filter(Number.isFinite)
    const first = Math.min(...timestamps)
    const months = Math.max(1, Math.ceil((Date.now() - first) / (30 * 86400000)) || 1)
    const monthlyIncome = total / months
    const recurring = income.filter((payment) => payment.classification === 'Recurring client income').length
    const consistency = Math.min(100, Math.round(70 + Math.min(20, income.length * 4) + Math.min(10, recurring * 5)))
    const createdAt = new Date().toISOString()
    const proof = {
      id: `ST-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      purpose,
      createdAt,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      snapshot: {
        subject: 'Amina Marku', monthlyIncome, annualIncome: monthlyIncome * 12, consistency, clients, months, paymentCount: income.length,
        source: 'PayPal', currency: income[0]?.currency || 'USD', verifiedAt: createdAt,
        evidence: income.map(({ id, payer, amount, currency, classification, confidence, createdAt: paidAt }) => ({ id, payer, amount, currency, classification, confidence, paidAt })),
      },
    }
    await saveProof(proof)
    json(res, 201, { id: proof.id, shareUrl: `https://statable-payproof.vercel.app/#proof?id=${proof.id}`, proof })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to create proof' })
  }
}
