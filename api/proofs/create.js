import crypto from 'node:crypto'
import { allowPost, json, readJson } from '../_lib/http.js'
import { listPayments, saveProof } from '../_lib/store.js'
import { summarizeIncome } from '../_lib/income.js'
import { signProof } from '../_lib/proof-integrity.js'

const allowedPurposes = new Set(['Rent a home', 'Apply for a loan', 'Apply for a visa', 'General income proof'])

export default async function handler(req, res) {
  if (!allowPost(req, res)) return
  try {
    const { purpose, subject } = await readJson(req)
    if (!allowedPurposes.has(purpose)) return json(res, 400, { error: 'Choose a valid proof purpose.' })
    const payments = await listPayments(100)
    const summary = summarizeIncome(payments)
    const income = summary.income
    if (!income.length) return json(res, 400, { error: 'Complete at least one verified income payment before creating a proof.' })
    const createdAt = new Date().toISOString()
    const disclosure = {
      'Rent a home': ['Verified monthly income', 'Income consistency', 'Paying-client count', 'Completed-payment evidence'],
      'Apply for a loan': ['Verified monthly and annualized income', 'Income consistency', 'Client concentration', 'Payment history'],
      'Apply for a visa': ['Verified income period', 'Completed-payment evidence', 'Income sources', 'Verification timestamp'],
      'General income proof': ['Verified monthly and annualized income', 'Income consistency', 'Income sources', 'Completed-payment evidence'],
    }[purpose]
    const proof = {
      id: `ST-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      purpose,
      createdAt,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'active',
      snapshot: {
        subject: String(subject || 'Amina Marku').trim().slice(0, 80), monthlyIncome: summary.monthlyIncome, annualIncome: summary.annualIncome, consistency: summary.consistency, clients: summary.clients, months: summary.months, paymentCount: summary.count, recurringClients: summary.recurringClients, recurringShare: summary.recurringShare, disclosure,
        source: 'PayPal', currency: income[0]?.currency || 'USD', verifiedAt: createdAt,
        evidence: income.map(({ id, client, amount, currency, classification, confidence, createdAt: paidAt, model, aiStatus }) => ({ id, client, amount, currency, classification, confidence, paidAt, model, aiStatus })),
      },
    }
    proof.digest = signProof(proof)
    await saveProof(proof)
    json(res, 201, { id: proof.id, shareUrl: `https://statable-payproof.vercel.app/#proof?id=${proof.id}`, proof })
  } catch (error) {
    json(res, 502, { error: error instanceof Error ? error.message : 'Unable to create proof' })
  }
}
