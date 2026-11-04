# Statable — Devpost submission draft

## Tagline

Proof of income for people without payslips.

## Inspiration

Freelancers and independent earners are routinely asked for a payslip they do not have. Their alternative is often a full financial statement that exposes purchases, balances, unrelated transfers, and client details. Their income is real; the paperwork has not caught up.

## What it does

Statable turns completed PayPal payments into a clear, shareable income proof. It preserves verified PayPal facts, uses explainable AI to classify income and detect recurring patterns, and generates only the disclosure needed for rent, lending, visa, or general verification. Every proof expires, can be revoked, and carries a server-verified integrity signature.

## How we built it

The product uses PayPal Orders v2 and Sandbox checkout for real approval and capture events. Vercel Functions preserve order metadata and call Vercel AI Gateway through the AI SDK for schema-validated classification. Supabase stores the order ledger, captured payments, and proof snapshots behind RLS. A React/Vite interface displays the income record and public verification experience, deployed on Vercel.

## PayPal + AI

PayPal is the evidence layer: capture status, amount, currency, payer, and payment identifiers originate from PayPal. AI never invents those facts. AI explains whether the evidence represents recurring income, a one-off project, a transfer, loan, refund, or non-income event by comparing a new capture with recent history.

## Challenges

PayPal approval and capture are separate stages, and return parameters must survive browser routing. We also needed to preserve the user's client label through that redirect without treating unverified metadata as a PayPal fact. The final architecture uses a server-side order ledger and clearly distinguishes declared context from PayPal-verified evidence.

## Accomplishments

- Genuine end-to-end PayPal Sandbox approvals and captures
- Structured AI classification with explicit fallback observability
- Purpose-specific, privacy-scoped proof snapshots
- HMAC-SHA256 integrity verification
- Proof expiration and revocation
- Server-only Supabase access with RLS

## What we learned

Financial explainability is as important as automation. A useful proof must show where each number came from, distinguish verified facts from AI interpretation, and share less—not more—of a person's financial life.

## What's next

PayPal OAuth account import, document matching for invoices and contracts, multi-currency normalization, institution-facing verification APIs, and user authentication for production workspaces.

## Links

- Demo: https://statable-payproof.vercel.app
- Source: https://github.com/ezekiel6262/statable-payproof
