create table public.oxapay_payments (
  id uuid primary key default gen_random_uuid(),
  track_id text not null unique,
  product_id uuid references public.products(id) on delete cascade not null,
  email text not null,
  amount_minor integer not null,
  currency text not null default 'INR',
  status text not null default 'waiting',
  pay_link text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

grant select, insert, update on public.oxapay_payments to authenticated;
grant all on public.oxapay_payments to service_role;

alter table public.oxapay_payments enable row level security;

create policy "Users can view their own payments by email"
on public.oxapay_payments
for select
to authenticated
using (email = (select email from public.profiles where id = auth.uid()));