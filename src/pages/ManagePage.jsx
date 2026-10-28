import React, { useCallback, useEffect, useRef, useState } from 'react';
import AnnouncementGenerator from '../components/AnnouncementGenerator.jsx';
import TransactionManager from '../components/TransactionManager.jsx';
import { useAppeal } from '../data/liveAppeal.jsx';
import { getAccounts } from '../data/accounts.js';
import { supabase } from '../lib/supabase.js';
import snapshot from '../../data.json' with { type: 'json' };

// Static UPI IDs from data.json
const STATIC_UPI_IDS = Object.fromEntries(
  (snapshot.accounts || []).map(a => [a.id, a.upiId || a.upi_id || ''])
);
const FUND_STORAGE_KEY = '_az_ann_collected_v1';

const ADMIN_EMAIL = import.meta.env.VITE_SUPABASE_ADMIN_EMAIL;
const UI_UNLOCK_KEY = ['_az', 'mgr', 'v1'].join('_');
const LAST_ACTIVITY_KEY = '_az_mgr_activity_v1';
const INACTIVITY_MS = 30 * 60 * 1000;

const indiaDate = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const indiaDateTimeInput = (value = new Date()) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(value).map(({ type, value: part }) => [type, part]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

const emptyEvent = () => ({ id: null, title: '', detail: '', dateTime: indiaDateTimeInput(), published: true });
const validAmount = (value) => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value));

// ─── Shared ConfirmDialog ───────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="ann-overlay" role="dialog" aria-modal="true">
      <div className="ann-confirm-box">
        <div className="ann-confirm-icon">⚠️</div>
        <p className="ann-confirm-msg">{message}</p>
        <div className="ann-confirm-actions">
          <button className="ann-btn ann-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="ann-btn ann-btn-ok" onClick={onConfirm} autoFocus>Yes, proceed</button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      label: '📋 Overview',      title: 'Campaign overview' },
  { id: 'transactions',  label: '💰 Transactions',   title: 'Transaction history' },
  { id: 'announcements', label: '📢 Announcements',  title: 'Generate announcements' },
];

export default function ManagePage() {
  const { appeal, refresh } = useAppeal();
  const [activeTab, setActiveTab] = useState('overview');
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [metrics, setMetrics] = useState({ target_rupees: '', collected_rupees: '', surgery_paid_rupees: '' });
  const [accountRows, setAccountRows] = useState([]);
  const [eventRows, setEventRows] = useState([]);
  const [dailyRows, setDailyRows] = useState([]);
  const [dailyDate, setDailyDate] = useState(indiaDate());
  const [dailyAmount, setDailyAmount] = useState('');
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [lastSaved, setLastSaved] = useState('');
  const [accountCollected, setAccountCollected] = useState({});
  const [confirm, setConfirm] = useState(null);
  const lastActivity = useRef(Number(window.sessionStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now());

  function askConfirm(message) {
    return new Promise(resolve => {
      setConfirm({
        message,
        onConfirm: () => { setConfirm(null); resolve(true); },
        onCancel: () => { setConfirm(null); resolve(false); },
      });
    });
  }

  const load = useCallback(async () => {
    if (!supabase) return;
    const results = await Promise.all([
      supabase.from('campaign_metrics').select('*').eq('id', 1).single(),
      supabase.from('account_upi_status').select('*').order('account_id'),
      supabase.from('timeline_events').select('*').order('event_date', { ascending: false }).order('position', { ascending: false }),
      supabase.from('daily_collections').select('*').order('report_date', { ascending: false }).limit(31),
    ]);
    const failed = results.find((result) => result.error);
    if (failed) throw failed.error;
    setMetrics({
      target_rupees: String(results[0].data.target_rupees),
      collected_rupees: String(results[0].data.collected_rupees),
      surgery_paid_rupees: String(results[0].data.surgery_paid_rupees),
    });
    setAccountRows(results[1].data);
    setEventRows(results[2].data);
    setDailyRows(results[3].data);
    setDailyAmount(String(results[3].data.find((row) => row.report_date === dailyDate)?.amount_rupees ?? ''));

    const collRes = await supabase.from('account_collected').select('*').order('account_id');
    if (!collRes.error && collRes.data?.length > 0) {
      const collected = {};
      for (const row of collRes.data) { collected[row.account_id] = row.collected_rupees; }
      setAccountCollected(collected);
    } else {
      try {
        const stored = JSON.parse(window.localStorage.getItem(FUND_STORAGE_KEY) || '{}');
        setAccountCollected(stored);
      } catch { /* ignore */ }
    }
  }, [dailyDate]);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getUser().then(async ({ data, error }) => {
      const expired = Date.now() - lastActivity.current >= INACTIVITY_MS;
      const admin = window.localStorage.getItem(UI_UNLOCK_KEY) === '1'
        && !expired && !error && data.user?.app_metadata?.role === 'appeal_admin';
      if (!admin) {
        window.localStorage.removeItem(UI_UNLOCK_KEY);
        window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        if (expired && data.user) await supabase.auth.signOut();
      }
      setAuthorized(admin);
      setChecking(false);
      if (admin) load().catch((problem) => setMessage(problem.message));
    });
  }, [load]);

  useEffect(() => {
    if (!authorized || !supabase) return undefined;
    const activity = () => {
      lastActivity.current = Date.now();
      window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity.current));
    };
    const timer = window.setInterval(async () => {
      if (Date.now() - lastActivity.current >= INACTIVITY_MS) {
        await supabase.auth.signOut();
        window.localStorage.removeItem(UI_UNLOCK_KEY);
        window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        setAuthorized(false);
        setMessage('Session expired after 30 minutes of inactivity.');
      }
    }, 30_000);
    window.addEventListener('pointerdown', activity);
    window.addEventListener('keydown', activity);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('keydown', activity);
    };
  }, [authorized]);

  async function signIn(event) {
    event.preventDefault();
    if (!supabase || !/^\d{6}$/.test(pin)) { setMessage('Enter a six-digit PIN.'); return; }
    if (!ADMIN_EMAIL) { setMessage('Admin sign-in is not configured.'); return; }
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: pin });
      if (error) throw error;
      if (data.user?.app_metadata?.role !== 'appeal_admin') {
        await supabase.auth.signOut();
        throw new Error('This account does not have administrator access.');
      }
      setPin(''); setAuthorized(true);
      window.localStorage.setItem(UI_UNLOCK_KEY, '1');
      lastActivity.current = Date.now();
      window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity.current));
      await load();
    } catch (problem) {
      setMessage(problem.message === 'Invalid login credentials'
        ? 'Invalid PIN or administrator account not set up.'
        : problem.message);
    } finally { setBusy(false); setPin(''); }
  }

  async function save(action, successMessage) {
    setBusy(true); setMessage('');
    try {
      await action();
      await Promise.all([load(), refresh()]);
      setLastSaved(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      setMessage(successMessage);
    } catch (problem) {
      setMessage(problem.message);
    } finally { setBusy(false); }
  }

  const requireSuccess = (result) => {
    if (result.error) throw result.error;
    if (Array.isArray(result.data) && result.data.length === 0) throw new Error('No row was updated. Check admin access.');
  };

  async function saveMetrics(event) {
    event.preventDefault();
    if (!Object.values(metrics).every(validAmount)) { setMessage('Enter nonnegative whole rupee amounts.'); return; }
    const ok = await askConfirm(
      `You are about to save the following funding figures:\n• Treatment target: ₹${Number(metrics.target_rupees).toLocaleString('en-IN')}\n• Collected so far: ₹${Number(metrics.collected_rupees).toLocaleString('en-IN')}\n• Paid towards surgery: ₹${Number(metrics.surgery_paid_rupees).toLocaleString('en-IN')}\n\nThese will be visible on the public website immediately. Are you sure?`
    );
    if (!ok) return;
    save(async () => requireSuccess(await supabase.from('campaign_metrics').update({
      target_rupees: Number(metrics.target_rupees),
      collected_rupees: Number(metrics.collected_rupees),
      surgery_paid_rupees: Number(metrics.surgery_paid_rupees),
    }).eq('id', 1).select('id')), 'Funding figures saved.');
  }

  async function saveAccount(row) {
    const status = row.active ? 'ACTIVE' : 'INACTIVE';
    const ok = await askConfirm(
      `You are about to mark "${row.account_label}" UPI as ${status}.\n${!row.active && row.reason ? `Reason: "${row.reason.trim()}"` : ''}\nA timeline event will be created on the public site. Are you sure?`
    );
    if (!ok) return;
    save(async () => requireSuccess(await supabase.from('account_upi_status').update({ active: row.active, reason: row.active ? '' : row.reason.trim() }).eq('account_id', row.account_id).select('account_id')), `${row.account_label} UPI status saved.`);
  }

  async function saveDaily(event) {
    event.preventDefault();
    if (!validAmount(dailyAmount)) { setMessage('Enter a nonnegative whole rupee amount.'); return; }
    const ok = await askConfirm(
      `You are about to save the daily collection for ${dailyDate}.\nAmount: ₹${Number(dailyAmount).toLocaleString('en-IN')}\n\nAre you sure?`
    );
    if (!ok) return;
    save(async () => {
      const existing = dailyRows.some((row) => row.report_date === dailyDate);
      const query = existing
        ? supabase.from('daily_collections').update({ amount_rupees: Number(dailyAmount) }).eq('report_date', dailyDate).select('report_date')
        : supabase.from('daily_collections').insert({ report_date: dailyDate, amount_rupees: Number(dailyAmount) }).select('report_date');
      requireSuccess(await query);
    }, `Daily collection for ${dailyDate} reported.`);
  }

  async function saveEvent(event) {
    event.preventDefault();
    const title = eventForm.title.trim();
    const detail = eventForm.detail.trim();
    if (!title || !detail || !eventForm.dateTime) { setMessage('Enter an event time, title, and details.'); return; }
    const occurredAt = new Date(`${eventForm.dateTime}:00+05:30`);
    if (Number.isNaN(occurredAt.getTime())) { setMessage('Enter a valid event time.'); return; }
    const isEdit = !!eventForm.id;
    const ok = await askConfirm(
      `You are about to ${isEdit ? 'update' : 'add'} a timeline event:\n\nTitle: "${title}"\nTime: ${eventForm.dateTime} IST\nPublished: ${eventForm.published ? 'Yes' : 'No'}\n\nAre you sure?`
    );
    if (!ok) return;
    const payload = {
      event_date: eventForm.dateTime.slice(0, 10),
      occurred_at: occurredAt.toISOString(),
      time_label: occurredAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }),
      title, detail, published: eventForm.published,
    };
    save(async () => {
      const query = eventForm.id
        ? supabase.from('timeline_events').update(payload).eq('id', eventForm.id).eq('source', 'manual').select('id')
        : supabase.from('timeline_events').insert({ ...payload, source: 'manual' }).select('id');
      requireSuccess(await query);
      setEventForm(emptyEvent());
    }, isEdit ? 'Manual event updated.' : 'Manual event added.');
  }

  function editEvent(row) {
    setEventForm({ id: row.id, title: row.title, detail: row.detail, dateTime: indiaDateTimeInput(new Date(row.occurred_at)), published: row.published });
    document.getElementById('manual-event-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function signOut() {
    const ok = await askConfirm('You are about to sign out of the admin panel. Any unsaved changes will be lost. Are you sure?');
    if (!ok) return;
    await supabase.auth.signOut();
    window.localStorage.removeItem(UI_UNLOCK_KEY);
    window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    setAuthorized(false); setMessage('Signed out.');
  }

  async function handleAnnouncementFundSave(accountId, newAmount) {
    setBusy(true);
    try {
      const result = await supabase.from('account_collected').upsert({
        account_id: accountId, collected_rupees: newAmount, updated_at: new Date().toISOString(),
      }, { onConflict: 'account_id' }).select('account_id');
      if (result.error) console.warn('account_collected table not found, using localStorage fallback:', result.error.message);
      const stored = JSON.parse(window.localStorage.getItem(FUND_STORAGE_KEY) || '{}');
      stored[accountId] = newAmount;
      window.localStorage.setItem(FUND_STORAGE_KEY, JSON.stringify(stored));
      setAccountCollected(prev => ({ ...prev, [accountId]: newAmount }));
    } finally { setBusy(false); }
  }

  const orderedAccountIds = ['shaina', 'primary', 'secondary', 'current'];
  const announcementAccounts = orderedAccountIds
    .map(id => (appeal?.accounts || snapshot.accounts || []).find(a => a.id === id))
    .filter(Boolean)
    .map(a => ({ ...a, upiId: a.upiId || STATIC_UPI_IDS[a.id] || '', qrImage: getAccounts(appeal)[a.id]?.qrImage,
      upiActive: appeal.accountStatus[a.id]?.active ?? false, collected: accountCollected[a.id] ?? 0 }));

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!supabase) return (
    <main className="manage-page">
      <h1>Manage appeal</h1>
      <p>Supabase is not configured. Add the URL and publishable key to the site environment.</p>
    </main>
  );
  if (checking) return <main className="manage-page"><p>Checking admin session…</p></main>;
  if (!authorized) return (
    <main className="manage-page">
      <div className="manage-login">
        <p className="context-line">Appeal administration</p>
        <h1>Manage appeal</h1>
        <p>Enter the six-digit administrator PIN.</p>
        <form onSubmit={signIn}>
          <label htmlFor="admin-pin">Administrator PIN</label>
          <input id="admin-pin" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" maxLength={6}
            type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} required />
          <button disabled={busy} type="submit">{busy ? 'Checking…' : 'Unlock'}</button>
        </form>
        <p className="manage-message" role="status">{message}</p>
      </div>
    </main>
  );

  // ── Authorized ─────────────────────────────────────────────────────────────
  return (
    <main className="manage-page">
      {/* Page header */}
      <div className="manage-heading">
        <div>
          <p className="context-line">Appeal administration</p>
          <h1>Manage appeal</h1>
          <p>Edit live figures, transaction history, and generate announcements. Changes go live after refresh.</p>
        </div>
        <button type="button" onClick={signOut}>Sign out</button>
      </div>

      <p className="manage-message" role="status">
        {message}{lastSaved ? ` Last saved: ${lastSaved} IST.` : ''}
      </p>

      {/* Tab navigation */}
      <div className="mgr-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`mgr-tab ${activeTab === tab.id ? 'mgr-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <div className="manage-grid">
            <section className="manage-card">
              <h2>Funding figures</h2>
              <form onSubmit={saveMetrics} className="manage-fields">
                {[['target_rupees', 'Treatment target'], ['collected_rupees', 'Collected so far'], ['surgery_paid_rupees', 'Paid towards surgery']].map(([key, label]) => (
                  <label key={key}>{label}
                    <span className="input-prefix">₹
                      <input type="number" min="0" step="1" value={metrics[key]}
                        onChange={(e) => setMetrics({ ...metrics, [key]: e.target.value })} required />
                    </span>
                  </label>
                ))}
                <button disabled={busy} type="submit">Save funding</button>
              </form>
            </section>

            <section className="manage-card">
              <h2>UPI by account</h2>
              <p>Changing an active switch automatically adds one timeline event at save time.</p>
              <div className="manage-accounts">
                {accountRows.map((row) => (
                  <div className="manage-account" key={row.account_id}>
                    <div className="manage-account-top">
                      <strong>{row.account_label}</strong>
                      <label className="manage-switch">
                        <input type="checkbox" checked={row.active}
                          onChange={(e) => setAccountRows(accountRows.map(item =>
                            item.account_id === row.account_id ? { ...item, active: e.target.checked } : item
                          ))} />
                        {' '}UPI active
                      </label>
                    </div>
                    <label>Reason or note
                      <input maxLength={300} value={row.reason}
                        onChange={(e) => setAccountRows(accountRows.map(item =>
                          item.account_id === row.account_id ? { ...item, reason: e.target.value } : item
                        ))} placeholder="Optional; shown when inactive" />
                    </label>
                    <button disabled={busy} type="button" onClick={() => saveAccount(row)}>Save this account</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="manage-card">
              <h2>Daily collection report</h2>
              <p>Report each day's total separately from the cumulative amount above.</p>
              <form onSubmit={saveDaily} className="manage-fields">
                <label>Collection date
                  <input type="date" value={dailyDate}
                    onChange={(e) => {
                      setDailyDate(e.target.value);
                      setDailyAmount(String(dailyRows.find(r => r.report_date === e.target.value)?.amount_rupees ?? ''));
                    }} required />
                </label>
                <label>Reported daily total
                  <span className="input-prefix">₹
                    <input type="number" min="0" step="1" value={dailyAmount}
                      onChange={(e) => setDailyAmount(e.target.value)} required />
                  </span>
                </label>
                <button disabled={busy} type="submit">Save daily report</button>
              </form>
              {dailyRows.length > 0 && (
                <p className="manage-last-report">Latest report: {dailyRows[0].report_date} · ₹{Number(dailyRows[0].amount_rupees).toLocaleString('en-IN')}</p>
              )}
            </section>

            <section className="manage-card">
              <h2>Manual timeline event</h2>
              <p>Use the actual event time. Automatic UPI entries cannot be edited here.</p>
              <form id="manual-event-form" onSubmit={saveEvent} className="manage-fields">
                <label>Event date and time (IST)
                  <input type="datetime-local" value={eventForm.dateTime}
                    onChange={(e) => setEventForm({ ...eventForm, dateTime: e.target.value })} required />
                </label>
                <label>Title
                  <input maxLength={160} value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
                </label>
                <label>Details
                  <textarea maxLength={2000} rows={4} value={eventForm.detail}
                    onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })} required />
                </label>
                <label className="manage-check">
                  <input type="checkbox" checked={eventForm.published}
                    onChange={(e) => setEventForm({ ...eventForm, published: e.target.checked })} />
                  {' '}Publish event
                </label>
                <div className="manage-actions">
                  <button disabled={busy} type="submit">{eventForm.id ? 'Save event' : 'Add event'}</button>
                  {eventForm.id && <button type="button" onClick={() => setEventForm(emptyEvent())}>Cancel edit</button>}
                </div>
              </form>
            </section>
          </div>

          <section className="manage-card manage-events">
            <h2>Timeline entries</h2>
            <ul>
              {eventRows.map((row) => (
                <li key={row.id}>
                  <div>
                    <strong>{row.title}</strong>
                    <span>{row.event_date} · {row.time_label} · {row.source}{!row.published ? ' · Unpublished' : ''}</span>
                  </div>
                  {row.source === 'manual' && <button type="button" onClick={() => editEvent(row)}>Edit</button>}
                </li>
              ))}
            </ul>
          </section>

          <p className="manage-footnote">Public account and medical details are stored in Supabase content and are edited outside this page.</p>
        </>
      )}

      {/* ── Tab: Transactions ─────────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="txn-tab-wrap">
          <div className="txn-tab-intro">
            <h2>Transaction history</h2>
            <p>
              Full donor list with amounts — visible to admins only.
              Donor names appear on the public website as a masked list (amounts hidden).
              You can hide individual donors from the public wall using the visibility toggle.
            </p>
          </div>
          <TransactionManager supabase={supabase} onRefresh={refresh} />
        </div>
      )}

      {/* ── Tab: Announcements ────────────────────────────────────────────── */}
      {activeTab === 'announcements' && (
        <AnnouncementGenerator
          metrics={metrics}
          accounts={announcementAccounts}
          appeal={appeal}
          onFundSave={handleAnnouncementFundSave}
        />
      )}

      {/* Global confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </main>
  );
}
