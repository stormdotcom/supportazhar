-- Migration: add transaction_history table
-- Run in Supabase SQL Editor after the initial migration.

create table if not exists public.transaction_history (
  id          uuid primary key default gen_random_uuid(),
  position    bigint generated always as identity unique,
  donor_name  text not null check (char_length(donor_name) between 1 and 200),
  amount_rupees bigint not null check (amount_rupees >= 0),
  note        text not null default '' check (char_length(note) <= 500),
  txn_date    date not null default current_date,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists txn_history_position on public.transaction_history (position);
create index if not exists txn_history_visible   on public.transaction_history (visible, position) where visible;

alter table public.transaction_history enable row level security;

-- Grant: anon/public gets NO access to amounts (privacy). Admin gets full access.
revoke all on public.transaction_history from anon, authenticated;

-- Admin-only full access
grant select, insert, update, delete on public.transaction_history to authenticated;
grant usage, select on sequence public.transaction_history_position_seq to authenticated;

-- Public can read donor_name + visible flag ONLY (not amount_rupees)
-- We use a secure view for the landing-page masked list
create or replace view public.transaction_history_public as
  select
    id,
    position,
    donor_name,
    txn_date,
    visible
  from public.transaction_history
  where visible = true
  order by position;

grant select on public.transaction_history_public to anon, authenticated;

-- RLS Policies
-- Admin can do everything
create policy "admin full access txn"
  on public.transaction_history for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin');

-- Trigger to auto-update updated_at
create or replace function public.stamp_txn_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger stamp_txn before update on public.transaction_history
  for each row execute function public.stamp_txn_change();
