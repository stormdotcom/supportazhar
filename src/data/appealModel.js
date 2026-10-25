import snapshot from '../../data.json' with { type: 'json' };

const fallbackStatus = Object.fromEntries(snapshot.accounts.map((account) => [account.id, {
  account_id: account.id,
  account_label: account.label,
  active: snapshot.payments.upiStatus === 'active',
  reason: snapshot.payments.upiStatusReason,
  changed_at: snapshot.payments.upiStatusAt,
}]));

export const fallbackAppeal = { ...snapshot, accountStatus: fallbackStatus, dailyCollections: [] };

export function overallUpiStatus(statuses) {
  const values = Object.values(statuses);
  if (values.length === 0) return 'inactive';
  if (values.every((item) => item.active)) return 'active';
  if (values.some((item) => item.active)) return 'partial';
  return 'inactive';
}

export function mergeLiveAppeal(content, metrics, accountRows, eventRows, dailyRows) {
  if (!content?.person || !Array.isArray(content.accounts) || !metrics || accountRows.length !== content.accounts.length) {
    throw new Error('Incomplete Supabase appeal data.');
  }
  const accountStatus = Object.fromEntries(accountRows.map((row) => [row.account_id, row]));
  if (!content.accounts.every((account) => accountStatus[account.id])) throw new Error('Missing account UPI status.');
  const latestStatus = accountRows.reduce((latest, row) => new Date(row.changed_at) > new Date(latest) ? row.changed_at : latest, accountRows[0].changed_at);
  return {
    ...content,
    funding: { target: metrics.target_rupees, collected: metrics.collected_rupees, surgeryPaid: metrics.surgery_paid_rupees },
    payments: { ...content.payments, upiStatus: overallUpiStatus(accountStatus), upiStatusAt: latestStatus },
    accountStatus,
    timeline: eventRows.map((row) => ({
      id: row.id,
      date: row.event_date,
      dateTime: row.occurred_at ?? row.event_date,
      time: row.time_label,
      title: row.title,
      detail: row.detail,
      source: row.source,
    })),
    dailyCollections: dailyRows,
    updatedAt: metrics.updated_at,
  };
}
