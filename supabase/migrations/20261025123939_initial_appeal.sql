-- Run once in the Supabase SQL Editor, before seed.sql.
-- A single, pre-provisioned Auth user has app_metadata.role = "appeal_admin".
begin;

create table if not exists public.campaign_content (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_metrics (
  id smallint primary key default 1 check (id = 1),
  target_rupees bigint not null check (target_rupees >= 0),
  collected_rupees bigint not null check (collected_rupees >= 0),
  surgery_paid_rupees bigint not null check (surgery_paid_rupees >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_upi_status (
  account_id text primary key check (account_id in ('current', 'secondary', 'primary')),
  account_label text not null,
  active boolean not null,
  reason text not null default '' check (char_length(reason) <= 300),
  changed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  position bigint generated always as identity unique,
  event_date date not null,
  occurred_at timestamptz,
  time_label text not null check (char_length(time_label) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  detail text not null check (char_length(detail) between 1 and 2000),
  source text not null check (source in ('historical', 'automatic', 'manual')),
  account_id text references public.account_upi_status(account_id),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists timeline_events_public_order on public.timeline_events (event_date, position) where published;

create table if not exists public.daily_collections (
  report_date date primary key,
  amount_rupees bigint not null check (amount_rupees >= 0),
  reported_at timestamptz not null default now()
);

create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  attempted_at timestamptz not null default now(),
  succeeded boolean
);
create index if not exists admin_login_attempts_recent on public.admin_login_attempts (attempted_at desc, ip_hash);

alter table public.campaign_content enable row level security;
alter table public.campaign_metrics enable row level security;
alter table public.account_upi_status enable row level security;
alter table public.timeline_events enable row level security;
alter table public.daily_collections enable row level security;
alter table public.admin_login_attempts enable row level security;

revoke all on public.campaign_content, public.campaign_metrics, public.account_upi_status, public.timeline_events,
  public.daily_collections, public.admin_login_attempts from anon, authenticated;
grant select on public.campaign_content to anon, authenticated;
grant select on public.campaign_metrics, public.account_upi_status, public.daily_collections to anon, authenticated;
grant select on public.timeline_events to anon, authenticated;
grant update (target_rupees, collected_rupees, surgery_paid_rupees) on public.campaign_metrics to authenticated;
grant update (active, reason) on public.account_upi_status to authenticated;
grant insert (report_date, amount_rupees) on public.daily_collections to authenticated;
grant update (amount_rupees) on public.daily_collections to authenticated;
grant insert (event_date, occurred_at, time_label, title, detail, source, published) on public.timeline_events to authenticated;
grant update (event_date, occurred_at, time_label, title, detail, published) on public.timeline_events to authenticated;
grant usage, select on sequence public.timeline_events_position_seq to authenticated;

create policy "read content" on public.campaign_content for select to anon, authenticated using (true);
create policy "read metrics" on public.campaign_metrics for select to anon, authenticated using (true);
create policy "admin edits metrics" on public.campaign_metrics for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin');
create policy "read account status" on public.account_upi_status for select to anon, authenticated using (true);
create policy "admin edits account status" on public.account_upi_status for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin');
create policy "read published events" on public.timeline_events for select to anon, authenticated using (published);
create policy "admin reads all events" on public.timeline_events for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin');
create policy "admin adds manual events" on public.timeline_events for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin' and source = 'manual' and account_id is null);
create policy "admin edits manual events" on public.timeline_events for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin' and source = 'manual')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin' and source = 'manual');
create policy "read daily collections" on public.daily_collections for select to anon, authenticated using (true);
create policy "admin adds daily collections" on public.daily_collections for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin');
create policy "admin edits daily collections" on public.daily_collections for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'appeal_admin');

create or replace function public.stamp_operational_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'campaign_metrics' then
    new.updated_at := now();
  elsif tg_table_name = 'account_upi_status' then
    new.updated_at := now();
    if new.active is distinct from old.active then new.changed_at := now(); end if;
  elsif tg_table_name = 'daily_collections' then
    new.reported_at := now();
  end if;
  return new;
end;
$$;
create trigger stamp_metrics before update on public.campaign_metrics for each row execute function public.stamp_operational_change();
create trigger stamp_account before update on public.account_upi_status for each row execute function public.stamp_operational_change();
create trigger stamp_daily before update on public.daily_collections for each row execute function public.stamp_operational_change();

-- This function is trigger-only. Never expose direct EXECUTE to browser roles.
create or replace function public.record_upi_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  event_time timestamptz := now();
  action text;
begin
  if new.active is not distinct from old.active then return new; end if;
  action := case when new.active then 'activated' else 'deactivated' end;
  insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source, account_id)
  values (
    (event_time at time zone 'Asia/Kolkata')::date,
    event_time,
    to_char(event_time at time zone 'Asia/Kolkata', 'FMHH12:MI AM'),
    new.account_label || ' UPI ' || action,
    new.account_label || ' UPI was ' || action || '. ' ||
      case when not new.active and new.reason <> '' then new.reason else 'Status recorded when the update was saved.' end,
    'automatic',
    new.account_id
  );
  return new;
end;
$$;
revoke all on function public.record_upi_change() from public, anon, authenticated;
create trigger account_upi_event after update of active on public.account_upi_status
  for each row execute function public.record_upi_change();

-- Called only by the PIN Edge Function with the server-side secret key.
create or replace function public.reserve_pin_attempt(p_ip_hash text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(78243611);
  if (select count(*) from public.admin_login_attempts
      where ip_hash = p_ip_hash and attempted_at > now() - interval '15 minutes' and succeeded is distinct from true) >= 5
    or (select count(*) from public.admin_login_attempts
      where attempted_at > now() - interval '1 hour' and succeeded is distinct from true) >= 30 then
    return null;
  end if;
  insert into public.admin_login_attempts (ip_hash) values (p_ip_hash) returning id into result;
  return result;
end;
$$;
create or replace function public.finish_pin_attempt(p_id uuid, p_succeeded boolean) returns void
language sql security definer set search_path = '' as $$
  update public.admin_login_attempts set succeeded = p_succeeded where id = p_id and succeeded is null;
$$;
revoke all on function public.reserve_pin_attempt(text), public.finish_pin_attempt(uuid, boolean) from public, anon, authenticated;
grant execute on function public.reserve_pin_attempt(text), public.finish_pin_attempt(uuid, boolean) to service_role;
commit;
