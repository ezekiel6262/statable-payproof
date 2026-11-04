# Statable PayProof

**Proof of income for people without payslips.**

Statable turns verified PayPal payments into clear, privacy-scoped income proof for freelancers, creators, contractors, and other independent earners.

## Prototype flow

1. Connect a PayPal income account.
2. Review AI-assisted payment classifications.
3. Choose what you need to prove.
4. Create a shareable, verifiable proof without exposing purchases or balances.

## Run locally

```bash
npm install
npm run dev
```

## Production services

- `GET /api/health` reports PayPal and AI service readiness without exposing secrets.
- `POST /api/paypal/create-invoice` creates a PayPal Sandbox draft invoice, with a safe demo response when credentials are absent.
- `POST /api/paypal/webhook` verifies PayPal webhook signatures before accepting events.
- `POST /api/ai/classify` uses Vercel AI Gateway for explainable income classification, with a deterministic fallback.
- `POST /api/ai/ask` answers reviewer questions only from the disclosed proof evidence.

Copy `.env.example` to `.env.local` for local integrations. Never commit `.env.local`.

The deployed app remains usable in demo mode when PayPal credentials have not been configured. On Vercel, AI Gateway uses the automatically injected OIDC token.

## License

MIT
