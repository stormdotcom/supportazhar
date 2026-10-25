import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appeal = JSON.parse(readFileSync(join(root, 'data.json'), 'utf8'));
const quote = (value) => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;
const rows = [];

rows.push('-- Generated from data.json. Run once after schema.sql.');
const { funding, payments, timeline, ...staticContent } = appeal;
staticContent.payments = { bankTransferMethod: payments.bankTransferMethod };
rows.push(`insert into public.campaign_content (id, content)
values (1, ${quote(JSON.stringify(staticContent))}::jsonb)
on conflict (id) do nothing;`);
rows.push(`insert into public.campaign_metrics (id, target_rupees, collected_rupees, surgery_paid_rupees)
values (1, ${funding.target}, ${funding.collected}, ${funding.surgeryPaid})
on conflict (id) do nothing;`);

for (const account of appeal.accounts) {
  rows.push(`insert into public.account_upi_status (account_id, account_label, active, reason, changed_at)
values (${quote(account.id)}, ${quote(account.label)}, ${payments.upiStatus === 'active'}, ${quote(payments.upiStatus === 'active' ? '' : payments.upiStatusReason)}, ${quote(payments.upiStatusAt)}::timestamptz)
on conflict (account_id) do nothing;`);
}

for (const event of timeline) {
  const occurredAt = event.dateTime.includes('T') ? `${quote(event.dateTime)}::timestamptz` : 'null';
  rows.push(`insert into public.timeline_events (event_date, occurred_at, time_label, title, detail, source)
values (${quote(event.date)}::date, ${occurredAt}, ${quote(event.time)}, ${quote(event.title)}, ${quote(event.detail)}, 'historical');`);
}

writeFileSync(join(root, 'supabase', 'seed.sql'), `${rows.join('\n\n')}\n`, 'utf8');
