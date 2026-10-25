-- Generated from data.json. Run once after schema.sql.

insert into public.campaign_content (id, content)
values (1, '{"websiteUrl":"https://supportazhar.vercel.app/","person":{"name":"Azhar Shafi","firstName":"Azhar","age":32,"hometown":"Kazhakkottam"},"medical":{"accidentDate":"2026-10-22","story":["Azhar Shafi, 32, from Kazhakkottam, was seriously injured in a road accident in Marthandam on 22 October 2026.","He is in the ICU at Ananthapuri Hospital, Thiruvananthapuram, with a severe head injury and bleeding in the brain.","On the morning of the accident, he was travelling from Nagercoil to Thiruvananthapuram when his vehicle went out of control and struck the rear of a lorry parked by the roadside."]},"volunteer":{"heading":"Take a step for Azhar","intro":"You can also volunteer to collect cash contributions locally for Azhar.","whatsappGroupUrl":"https://chat.whatsapp.com/D5yIPYsO5X1L5bRiAcJ9jE","steps":["Collect cash contributions.","Deposit the collected cash into your own bank account.","Transfer the combined amount from your account by NEFT to any one of the three accounts below."],"whatsappText":"Volunteers can collect cash contributions, deposit the cash into their own bank account, then transfer the combined amount by NEFT from that account to any one of the accounts below.","posterLines":["Collect cash contributions locally.","Deposit the cash into your own bank account.","Transfer the total by NEFT to any account below."]},"accounts":[{"id":"current","label":"HDFC account","holder":"SHAFI S","number":"50100912757807","ifsc":"HDFC0004275","accountType":"Savings Account","branch":"HDFC Bank Pattoor"},{"id":"secondary","label":"Secondary account","holder":"Muhammed Ashkar N","number":"3439967725","ifsc":"SBIN0007253","phone":"9745527474","phoneLabel":"Contact number"},{"id":"primary","label":"Primary account","holder":"Naseela Nazar","number":"30990695716","ifsc":"SBIN0010692","phone":"9048313713","phoneLabel":"GPay number"}],"contacts":{"reference":[{"display":"+91 70129 57194","tel":"+917012957194"},{"display":"+91 81295 90761","tel":"+918129590761"},{"display":"+91 96336 59500","tel":"+919633659500"}],"verificationName":"Adv. Anas","transactionSupport":"8891590046"},"payments":{"bankTransferMethod":"NEFT"}}'::jsonb)
on conflict (id) do nothing;

insert into public.campaign_metrics (id, target_rupees, collected_rupees, surgery_paid_rupees)
values (1, 2000000, 650532, 500000)
on conflict (id) do nothing;

insert into public.account_upi_status (account_id, account_label, active, reason, changed_at)
values ('current', 'HDFC account', true, '', '2026-10-24T19:16:16+05:30'::timestamptz)
on conflict (account_id) do nothing;

insert into public.account_upi_status (account_id, account_label, active, reason, changed_at)
values ('secondary', 'Secondary account', true, '', '2026-10-24T19:16:16+05:30'::timestamptz)
on conflict (account_id) do nothing;

insert into public.account_upi_status (account_id, account_label, active, reason, changed_at)
values ('primary', 'Primary account', true, '', '2026-10-24T19:16:16+05:30'::timestamptz)
on conflict (account_id) do nothing;

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-22'::date, '2026-10-22T13:00:00+05:30'::timestamptz, '1:00 PM', 'Primary account activated', 'The primary account became available for contributions.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-22'::date, '2026-10-22T18:00:00+05:30'::timestamptz, '6:00 PM', 'Primary account reached its UPI limit', 'The account was blocked for further UPI contributions.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-22'::date, null, 'After 6:00 PM', 'Secondary account activated', 'The secondary account was activated after the primary account was blocked. Exact activation time was not provided.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-22'::date, '2026-10-22T22:00:00+05:30'::timestamptz, '10:00 PM', 'Secondary account blocked', 'The secondary account was also blocked.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-23'::date, '2026-10-23T15:00:00+05:30'::timestamptz, '3:00 PM', 'Third account activated', 'SHAFI S’s account was activated for contributions.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-23'::date, '2026-10-23T17:00:00+05:30'::timestamptz, '5:00 PM', 'Primary account reactivated', 'The primary account became active again.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-23'::date, '2026-10-23T22:00:00+05:30'::timestamptz, '10:00 PM', 'Secondary account reactivated', 'The secondary account became active again. All three accounts were active at that time.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-24'::date, '2026-10-24T12:00:00+05:30'::timestamptz, '12:00 PM', 'All UPI accounts reached their limits', 'UPI and GPay were inactive across all three accounts at that time. Contributions could still be sent by NEFT.', 'historical');

insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values ('2026-10-24'::date, '2026-10-24T19:16:16+05:30'::timestamptz, '7:16 PM', 'All UPI accounts active again', 'UPI and Google Pay are active across all three listed accounts. The exact reactivation time was not provided; this is when the status update was recorded.', 'historical');
