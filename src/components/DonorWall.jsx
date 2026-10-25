import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const fmtDate = (d) => d
  ? new Date(d + 'T12:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  : '';

export default function DonorWall() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 30;

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    // Use the public view — no amounts exposed
    supabase
      .from('transaction_history_public')
      .select('id, position, donor_name, txn_date')
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setDonors(data);
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (!donors.length) return null;

  const shown = showAll ? donors : donors.slice(0, INITIAL_COUNT);
  const remaining = donors.length - INITIAL_COUNT;

  return (
    <section className="donor-wall-section" aria-labelledby="donor-wall-title">
      <div className="donor-wall-header">
        <div>
          <h2 id="donor-wall-title">Generous supporters</h2>
          <p>
            {donors.length} donors have already contributed.
            Amounts are kept private — names are shared with their permission.
          </p>
        </div>
        <div className="donor-wall-badge">
          <span>{donors.length}</span>
          <small>supporters</small>
        </div>
      </div>

      <div className="donor-wall-grid">
        {shown.map((d, idx) => (
          <div className="donor-card" key={d.id}>
            <div className="donor-card-inner">
              <span className="donor-number">{String(idx + 1).padStart(2, '0')}</span>
              <span className="donor-name">{d.donor_name}</span>
              <span className="donor-amount" aria-label="Amount hidden for privacy">₹ •••••</span>
              {d.txn_date && <span className="donor-date">{fmtDate(d.txn_date)}</span>}
            </div>
          </div>
        ))}
      </div>

      {!showAll && remaining > 0 && (
        <div className="donor-wall-more">
          <button
            type="button"
            className="donor-show-more"
            onClick={() => setShowAll(true)}
          >
            Show {remaining} more supporter{remaining !== 1 ? 's' : ''} ↓
          </button>
        </div>
      )}
      {showAll && donors.length > INITIAL_COUNT && (
        <div className="donor-wall-more">
          <button
            type="button"
            className="donor-show-more"
            onClick={() => setShowAll(false)}
          >
            Show fewer ↑
          </button>
        </div>
      )}

      <p className="donor-wall-note">
        Contribution amounts are kept private. Only names are listed here, with permission. 
        Thank you for every single contribution — each one matters greatly to Azhar and his family.
      </p>
    </section>
  );
}
