# Architecture

```mermaid
flowchart LR
  U[Independent earner] --> UI[React workspace]
  UI --> O[Create PayPal order]
  O --> L[(Server-side order ledger)]
  O --> PP[PayPal Sandbox approval]
  PP --> C[Capture function]
  C --> PAPI[PayPal Orders v2]
  C --> AI[Vercel AI Gateway]
  AI --> C
  C --> DB[(Supabase payments)]
  UI --> G[Proof generator]
  DB --> G
  G --> S[HMAC signed snapshot]
  S --> PR[(Supabase proofs)]
  R[Reviewer] --> V[Public verification route]
  V --> PR
  V --> R
```

## Trust boundaries

- The browser can request operations but cannot access Supabase tables directly.
- PayPal is the source of capture status, amount, currency, payer, refund, and dispute evidence.
- The order ledger preserves the merchant-declared client label and service description across redirect/capture boundaries.
- AI can classify and explain evidence; it cannot create or alter PayPal capture facts.
- Proof verification recomputes the snapshot signature and checks active/expiry state.

## Classification approach

Statable sends a bounded, privacy-minimized payment record plus recent history to AI Gateway. The response must satisfy a Zod schema containing a fixed classification, confidence, short explanation, and evidence list. If Gateway is unavailable, deterministic rules remain operational and the record explicitly shows fallback status.
