import React, { useState } from 'react';

const fmtINR = (n) => Number(n).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d + 'T12:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';
const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

const EMPTY_FORM = () => ({
  id: null,
  donor_name: '',
  amount_rupees: '',
  note: '',
  txn_date: todayISO(),
  visible: true,
});

// ─── Confirm dialog ─────────────────────────────────────────────────────────
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

export default function TransactionManager({ supabase, onRefresh }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM());
  const [editing, setEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('position');
  const [sortAsc, setSortAsc] = useState(true);

  function askConfirm(message) {
    return new Promise(resolve => {
      setConfirm({
        message,
        onConfirm: () => { setConfirm(null); resolve(true); },
        onCancel: () => { setConfirm(null); resolve(false); },
      });
    });
  }

  async function loadRows() {
    if (!supabase) return;
    setLoading(true);
    setStatusMsg('');
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      setRows(data || []);
      setLoaded(true);
    } catch (err) {
      setStatusMsg('Error loading transactions: ' + err.message);
    } finally { setLoading(false); }
  }

  function setF(key, val) { setForm(prev => ({ ...prev, [key]: val })); }

  function startEdit(row) {
    setForm({
      id: row.id,
      donor_name: row.donor_name,
      amount_rupees: String(row.amount_rupees),
      note: row.note || '',
      txn_date: row.txn_date,
      visible: row.visible,
    });
    setEditing(true);
    document.getElementById('txn-form-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm(EMPTY_FORM());
    setEditing(false);
  }

  async function saveTransaction(e) {
    e.preventDefault();
    const name = form.donor_name.trim();
    const amt = parseInt(form.amount_rupees, 10);
    if (!name) { setStatusMsg('Please enter a donor name.'); return; }
    if (!amt || amt < 0 || isNaN(amt)) { setStatusMsg('Please enter a valid amount (0 or more).'); return; }
    if (!form.txn_date) { setStatusMsg('Please select a date.'); return; }

    const isEdit = !!form.id;
    const ok = await askConfirm(
      isEdit
        ? `You are about to update this transaction:\n\nDonor: "${name}"\nAmount: ₹${fmtINR(amt)}\nDate: ${fmtDate(form.txn_date)}\nVisible on public page: ${form.visible ? 'Yes' : 'No'}\n\nAre you sure you want to save these changes?`
        : `You are about to add a new transaction:\n\nDonor: "${name}"\nAmount: ₹${fmtINR(amt)}\nDate: ${fmtDate(form.txn_date)}\n\nThis donor name will be visible on the public donations wall (amounts are hidden). Are you sure?`
    );
    if (!ok) return;

    setBusy(true); setStatusMsg('');
    try {
      const payload = {
        donor_name: name,
        amount_rupees: amt,
        note: form.note.trim(),
        txn_date: form.txn_date,
        visible: form.visible,
      };
      let result;
      if (isEdit) {
        result = await supabase.from('transaction_history').update(payload).eq('id', form.id).select('id');
      } else {
        result = await supabase.from('transaction_history').insert(payload).select('id');
      }
      if (result.error) throw result.error;
      setStatusMsg(isEdit ? `✓ Transaction updated for "${name}".` : `✓ New transaction added for "${name}".`);
      cancelEdit();
      await loadRows();
      if (onRefresh) onRefresh();
    } catch (err) {
      setStatusMsg('Error saving transaction: ' + err.message);
    } finally { setBusy(false); }
  }

  async function deleteTransaction(row) {
    const ok = await askConfirm(
      `You are about to permanently delete this transaction:\n\nDonor: "${row.donor_name}"\nAmount: ₹${fmtINR(row.amount_rupees)}\nDate: ${fmtDate(row.txn_date)}\n\nThis action cannot be undone. The donor name will be removed from the public donations wall too. Are you sure?`
    );
    if (!ok) return;
    setBusy(true); setStatusMsg('');
    try {
      const { error } = await supabase.from('transaction_history').delete().eq('id', row.id);
      if (error) throw error;
      setStatusMsg(`✓ Transaction deleted for "${row.donor_name}".`);
      await loadRows();
      if (onRefresh) onRefresh();
    } catch (err) {
      setStatusMsg('Error deleting transaction: ' + err.message);
    } finally { setBusy(false); }
  }

  async function toggleVisible(row) {
    const newVisible = !row.visible;
    const ok = await askConfirm(
      `You are about to ${newVisible ? 'show' : 'hide'} "${row.donor_name}" on the public donations wall.\n\n${newVisible ? 'Their name will become visible to everyone on the website.' : 'Their name will be hidden from the public page, but the record stays in admin.'}\n\nAre you sure?`
    );
    if (!ok) return;
    setBusy(true); setStatusMsg('');
    try {
      const { error } = await supabase.from('transaction_history').update({ visible: newVisible }).eq('id', row.id);
      if (error) throw error;
      setStatusMsg(`✓ "${row.donor_name}" is now ${newVisible ? 'visible' : 'hidden'} on the public wall.`);
      setRows(rows.map(r => r.id === row.id ? { ...r, visible: newVisible } : r));
    } catch (err) {
      setStatusMsg('Error updating visibility: ' + err.message);
    } finally { setBusy(false); }
  }

  // Sort & filter
  const totalAmount = rows.reduce((s, r) => s + Number(r.amount_rupees), 0);
  const filtered = rows.filter(r =>
    r.donor_name.toLowerCase().includes(search.toLowerCase()) ||
    String(r.amount_rupees).includes(search) ||
    (r.note || '').toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (sortKey === 'amount_rupees') { va = Number(va); vb = Number(vb); }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  function toggleSort(key) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  const SortIcon = ({ k }) => sortKey === k ? (sortAsc ? ' ↑' : ' ↓') : ' ⇅';

  if (!loaded) {
    return (
      <div className="txn-load-wrap">
        <p className="txn-load-text">Transaction history is not loaded yet. Click below to fetch all records.</p>
        <button className="txn-load-btn ann-btn ann-btn-ok" onClick={loadRows} disabled={loading}>
          {loading ? 'Loading…' : '📂 Load Transaction History'}
        </button>
        {statusMsg && <p className="ann-status">{statusMsg}</p>}
      </div>
    );
  }

  return (
    <div className="txn-manager">

      {/* Summary bar */}
      <div className="txn-summary-bar">
        <div className="txn-summary-stat">
          <span>Total records</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="txn-summary-stat">
          <span>Total amount</span>
          <strong>₹{fmtINR(totalAmount)}</strong>
        </div>
        <div className="txn-summary-stat">
          <span>Visible on public page</span>
          <strong>{rows.filter(r => r.visible).length}</strong>
        </div>
        <div className="txn-summary-stat">
          <span>Hidden records</span>
          <strong>{rows.filter(r => !r.visible).length}</strong>
        </div>
        <button className="ann-btn ann-btn-cancel txn-reload-btn" onClick={loadRows} disabled={loading}>
          {loading ? 'Loading…' : '↻ Reload'}
        </button>
      </div>

      {statusMsg && <p className="ann-status" role="status">{statusMsg}</p>}

      {/* Add / Edit form */}
      <div className="manage-card txn-form-card" id="txn-form-section">
        <h3>{editing ? `✏️ Edit Transaction — ${form.donor_name}` : '➕ Add New Transaction'}</h3>
        <form onSubmit={saveTransaction} className="txn-form">
          <label>Donor name
            <input
              maxLength={200}
              value={form.donor_name}
              onChange={e => setF('donor_name', e.target.value)}
              placeholder="e.g. Firdous"
              required
            />
          </label>
          <label>Amount (₹)
            <input
              type="number" min="0" step="1"
              value={form.amount_rupees}
              onChange={e => setF('amount_rupees', e.target.value)}
              placeholder="e.g. 5000"
              required
            />
          </label>
          <label>Date
            <input
              type="date"
              value={form.txn_date}
              onChange={e => setF('txn_date', e.target.value)}
              required
            />
          </label>
          <label>Note (optional)
            <input
              maxLength={500}
              value={form.note}
              onChange={e => setF('note', e.target.value)}
              placeholder="e.g. transferred via GPay"
            />
          </label>
          <label className="txn-check-label">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={e => setF('visible', e.target.checked)}
            />
            Show donor name on public donations wall
          </label>
          <div className="txn-form-actions">
            <button type="submit" className="ann-btn ann-btn-ok" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add transaction'}
            </button>
            {editing && (
              <button type="button" className="ann-btn ann-btn-cancel" onClick={cancelEdit}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search + Table */}
      <div className="txn-table-wrap">
        <div className="txn-table-toolbar">
          <input
            className="txn-search"
            type="search"
            placeholder="Search by name, amount, or note…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="txn-count">{filtered.length} of {rows.length} records</span>
        </div>

        <div className="txn-scroll">
          <table className="txn-table">
            <thead>
              <tr>
                <th className="txn-th-num">#</th>
                <th className="txn-th-sortable" onClick={() => toggleSort('donor_name')}>
                  Donor name <SortIcon k="donor_name" />
                </th>
                <th className="txn-th-sortable txn-th-amt" onClick={() => toggleSort('amount_rupees')}>
                  Amount <SortIcon k="amount_rupees" />
                </th>
                <th className="txn-th-sortable" onClick={() => toggleSort('txn_date')}>
                  Date <SortIcon k="txn_date" />
                </th>
                <th>Note</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr key={row.id} className={row.visible ? '' : 'txn-row-hidden'}>
                  <td className="txn-td-num">{idx + 1}</td>
                  <td className="txn-td-name">{row.donor_name}</td>
                  <td className="txn-td-amt">₹{fmtINR(row.amount_rupees)}</td>
                  <td className="txn-td-date">{fmtDate(row.txn_date)}</td>
                  <td className="txn-td-note">{row.note || <span className="txn-empty">—</span>}</td>
                  <td className="txn-td-vis">
                    <button
                      type="button"
                      className={`txn-vis-btn ${row.visible ? 'txn-vis-on' : 'txn-vis-off'}`}
                      onClick={() => toggleVisible(row)}
                      disabled={busy}
                      title={row.visible ? 'Click to hide from public' : 'Click to show on public'}
                    >
                      {row.visible ? '👁 Shown' : '🙈 Hidden'}
                    </button>
                  </td>
                  <td className="txn-td-actions">
                    <button
                      type="button"
                      className="txn-action-btn txn-edit-btn"
                      onClick={() => startEdit(row)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="txn-action-btn txn-del-btn"
                      onClick={() => deleteTransaction(row)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="txn-empty-row">
                    {search ? 'No transactions match your search.' : 'No transactions yet. Add the first one above.'}
                  </td>
                </tr>
              )}
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={2} className="txn-foot-label">Total ({sorted.length} shown)</td>
                  <td className="txn-td-amt txn-foot-total">
                    ₹{fmtINR(sorted.reduce((s, r) => s + Number(r.amount_rupees), 0))}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </div>
  );
}
