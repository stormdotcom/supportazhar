-- Introduce Shaina's UPI account and pause older UPI accounts after their limits were reached.
begin;

alter table public.account_upi_status
  drop constraint account_upi_status_account_id_check;
alter table public.account_upi_status
  add constraint account_upi_status_account_id_check
  check (account_id in ('shaina', 'current', 'secondary', 'primary'));

update public.campaign_content
set content = jsonb_set(
  content,
  '{accounts}',
  jsonb_build_array(jsonb_build_object(
    'id', 'shaina',
    'label', 'Primary UPI account',
    'holder', 'SHAINA N S',
    'upiId', 'shainans1@fbl'
  )) || (
    select jsonb_agg(
      case when account ->> 'id' = 'primary'
        then jsonb_set(account, '{label}', '"Naseela Nazar account"'::jsonb)
        else account end
      order by position
    )
    from jsonb_array_elements(content -> 'accounts') with ordinality as old_accounts(account, position)
  )
), updated_at = now()
where id = 1
  and not exists (
    select 1 from jsonb_array_elements(content -> 'accounts') as account
    where account ->> 'id' = 'shaina'
  );

update public.campaign_content
set content = jsonb_set(
  content,
  '{volunteer}',
  (content -> 'volunteer') || jsonb_build_object(
    'steps', jsonb_build_array(
      'Collect cash contributions.',
      'Deposit the collected cash into your own bank account.',
      'Transfer the combined amount by NEFT to one of the bank accounts below, or use Shaina N S’s UPI ID.'
    ),
    'whatsappText', 'Volunteers can collect cash contributions, deposit the cash into their own bank account, then transfer the combined amount by NEFT to a listed bank account or by UPI to Shaina N S.',
    'posterLines', jsonb_build_array(
      'Collect cash contributions locally.',
      'Deposit the cash into your own bank account.',
      'Transfer the total by NEFT to a listed bank account or by UPI to Shaina N S.'
    )
  )
), updated_at = now()
where id = 1;

insert into public.account_upi_status (account_id, account_label, active, reason)
values ('shaina', 'Primary UPI account', true, '')
on conflict (account_id) do nothing;

update public.account_upi_status
set account_label = case when account_id = 'primary' then 'Naseela Nazar account' else account_label end,
    active = false,
    reason = 'UPI limit reached. Recheck after 24 hours; use the new primary UPI account for now.'
where account_id in ('current', 'secondary', 'primary')
  and not exists (
    select 1 from public.timeline_events
    where title = 'New primary UPI account introduced' and source = 'manual'
  );

insert into public.timeline_events
  (event_date, occurred_at, time_label, title, detail, source)
select
  (now() at time zone 'Asia/Kolkata')::date,
  now(),
  to_char(now() at time zone 'Asia/Kolkata', 'FMHH12:MI AM'),
  'New primary UPI account introduced',
  'SHAINA N S (shainans1@fbl) is now the primary UPI option. The three older UPI accounts reached their limits and are paused pending a status check after 24 hours. NEFT remains available for the older bank accounts.',
  'manual'
where not exists (
  select 1 from public.timeline_events
  where title = 'New primary UPI account introduced' and source = 'manual'
);

commit;
