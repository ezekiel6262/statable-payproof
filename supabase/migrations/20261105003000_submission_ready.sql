create table if not exists public.order_requests (
  order_id text primary key,
  merchant_id text not null default 'demo',
  client_name text not null,
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (char_length(currency) = 3),
  status text not null default 'CREATED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments add column if not exists client text;
alter table public.payments add column if not exists ai_status text not null default 'unknown';
alter table public.payments add column if not exists ai_detail text;
update public.payments set client = payer where client is null;
alter table public.payments alter column client set not null;

alter table public.proofs add column if not exists digest text;
alter table public.proofs add column if not exists status text not null default 'active';
alter table public.proofs add column if not exists revoked_at timestamptz;

create index if not exists order_requests_merchant_created_at_idx on public.order_requests (merchant_id, created_at desc);
create index if not exists payments_merchant_client_created_at_idx on public.payments (merchant_id, client, created_at desc);
create index if not exists proofs_merchant_status_created_at_idx on public.proofs (merchant_id, status, created_at desc);

alter table public.order_requests enable row level security;
revoke all on table public.order_requests from anon, authenticated;
grant select, insert, update on table public.order_requests to service_role;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.proofs from anon, authenticated;
grant select, insert, update on table public.payments to service_role;
grant select, insert, update on table public.proofs to service_role;
