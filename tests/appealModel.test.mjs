import assert from 'node:assert/strict';
import test from 'node:test';
import { fallbackAppeal, mergeLiveAppeal, overallUpiStatus } from '../src/data/appealModel.js';

const accountRows = fallbackAppeal.accounts.map((account) => fallbackAppeal.accountStatus[account.id]);
const content = {
  person: fallbackAppeal.person,
  accounts: fallbackAppeal.accounts,
  payments: { bankTransferMethod: 'NEFT' },
};
const metrics = { target_rupees: 2_000_000, collected_rupees: 2_000_001, surgery_paid_rupees: 500_000, updated_at: '2026-10-25T12:00:00Z' };

test('derives all three UPI availability states', () => {
  assert.equal(overallUpiStatus(Object.fromEntries(accountRows.map((row) => [row.account_id, row]))), 'active');
  assert.equal(overallUpiStatus({ current: { active: true }, secondary: { active: false }, primary: { active: true } }), 'partial');
  assert.equal(overallUpiStatus({ current: { active: false }, secondary: { active: false }, primary: { active: false } }), 'inactive');
});

test('merges live amounts, statuses, reported daily total, and an imprecise historical time', () => {
  const events = [{ id: 'event-1', event_date: '2026-10-22', occurred_at: null, time_label: 'After 6:00 PM', title: 'Secondary account activated', detail: 'Exact time was not provided.', source: 'historical' }];
  const daily = [{ report_date: '2026-10-25', amount_rupees: 12_000, reported_at: '2026-10-25T09:00:00Z' }];
  const appeal = mergeLiveAppeal(content, metrics, accountRows, events, daily);
  assert.equal(appeal.funding.collected, 2_000_001);
  assert.equal(appeal.payments.upiStatus, 'active');
  assert.equal(appeal.timeline[0].dateTime, '2026-10-22');
  assert.equal(appeal.timeline[0].time, 'After 6:00 PM');
  assert.deepEqual(appeal.dailyCollections, daily);
});

test('rejects incomplete live account data instead of silently showing mixed sources', () => {
  assert.throws(() => mergeLiveAppeal(content, metrics, accountRows.slice(1), [], []), /Incomplete/);
});
