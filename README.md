# Statable PayProof

> Proof of income for people without payslips.

Statable converts completed PayPal payments into privacy-scoped, purpose-specific income proofs for freelancers, creators, contractors, gig workers, and founders.

**Live demo:** https://statable-payproof.vercel.app

**Environment:** PayPal Sandbox only

## Why it exists

Independent earners often have real income but no conventional payslip. Sharing a full account statement exposes purchases, balances, and unrelated transfers. Statable verifies the income evidence and shares only the answer a landlord, lender, or visa reviewer needs.

## Working flow

1. A merchant creates a PayPal Sandbox payment request for a client.
2. PayPal approves and captures the payment.
3. Statable preserves the declared client and service metadata in a server-side order ledger.
4. Vercel AI Gateway classifies the capture against recent payment history with a schema-validated explanation.
5. The user generates a rental, loan, visa, or general proof.
6. The proof is signed with HMAC-SHA256, expires after 30 days, and can be revoked.

## What the proof excludes

- PayPal purchases
- Account balance
- Payer email and contact details
- Unrelated transfers
- Full transaction history

## Technology

- React + TypeScript + Vite
- PayPal Orders v2 and Sandbox checkout
- Vercel Functions and AI Gateway (`openai/gpt-5-mini` by default)
- AI SDK structured output with Zod validation
- Supabase Postgres with RLS and server-only secret-key access
- Vercel production hosting

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the data flow and trust boundaries.

## Run locally

Requirements: Node.js 22+, npm, PayPal Sandbox credentials, and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The UI remains available with sample data when integrations are missing. Never commit `.env.local` or any Sandbox password.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PAYPAL_CLIENT_ID` | PayPal Sandbox application client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal Sandbox application secret |
| `PAYPAL_ENV` | Must be `sandbox` for this demo |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Server-only Supabase secret key |
| `PROOF_SIGNING_SECRET` | Dedicated server-side HMAC signing secret |
| `AI_GATEWAY_MODEL` | Optional Gateway model override |
| `AI_GATEWAY_API_KEY` | Local/non-Vercel Gateway authentication; Vercel uses OIDC |

## API map

- `POST /api/paypal/create-order` — creates and records a Sandbox order
- `POST /api/paypal/capture-order` — captures, classifies, and persists payment evidence
- `GET /api/payments` — returns the privacy-safe income record and pattern summary
- `POST /api/proofs/create` — creates a signed, expiring proof
- `GET /api/proofs/get?id=...` — verifies an active proof and signature
- `GET /api/proofs/list` — lists proof lifecycle state for the demo workspace
- `POST /api/proofs/revoke` — revokes a proof
- `POST /api/ai/classify` — schema-validates an explainable AI classification
- `GET /api/health` — reports integration readiness without exposing secrets

## Security model

- Supabase secret credentials never reach the browser.
- RLS is enabled on `payments`, `proofs`, and `order_requests`.
- `anon` and `authenticated` table privileges are revoked; Vercel Functions are the API boundary.
- Public proof IDs are random and proofs contain snapshots, not account access.
- Proof signatures are recomputed server-side before a proof is marked valid.
- Revoked and expired proofs return `410 Gone`.

## Hackathon notes

This repository is the standalone Statable PayProof entry built during the PayPal AI Hackathon submission period. PayPal is central to evidence verification; AI is used for explainable transaction classification and recurring-income pattern analysis.

Submission copy is in [DEVPOST.md](./DEVPOST.md), and the under-three-minute recording plan is in [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

## License

MIT
