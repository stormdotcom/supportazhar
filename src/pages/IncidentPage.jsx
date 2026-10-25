import React, { useState } from 'react';
import { rupees, shortDate, shortStatusDate } from '../data/appeal.js';
import { useAppeal } from '../data/liveAppeal.jsx';

export default function IncidentPage() {
  const { appeal } = useAppeal();
  const [filter, setFilter] = useState('all');
  const visibleEvents = appeal.timeline.filter((event) => filter === 'all' || event.date === filter);
  const dates = [...new Set(appeal.timeline.map((event) => event.date))];
  const statusText = appeal.payments.upiStatus === 'active' ? 'active on all accounts' : appeal.payments.upiStatus === 'partial' ? 'active on some accounts' : 'inactive on all accounts';
  const latestDaily = appeal.dailyCollections[0];
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  return (
    <main id="top" className="incident-page">
      <section className="daily-collection-section" aria-labelledby="daily-collection-title">
        <div>
          <p className="context-line">Contribution report</p>
          <h2 id="daily-collection-title">Daily collection</h2>
          <p>These daily figures are reported by the appeal administrators and are separate from the cumulative amount collected.</p>
        </div>
        {latestDaily ? <div className="daily-collection-card">
          <span className="daily-badge">{latestDaily.report_date === today ? 'Today’s report' : 'Latest report'}</span>
          <strong>{rupees(latestDaily.amount_rupees)}</strong>
          <span>For {shortDate(latestDaily.report_date)} · Reported {shortStatusDate(latestDaily.reported_at)} IST</span>
        </div> : <div className="daily-collection-card"><span className="daily-badge">Awaiting report</span><p>No daily collection has been reported yet.</p></div>}
        {appeal.dailyCollections.length > 1 && <div className="daily-history"><h3>Earlier daily reports</h3><ul>{appeal.dailyCollections.slice(1, 8).map((row) => <li key={row.report_date}><span>{shortDate(row.report_date)}</span><strong>{rupees(row.amount_rupees)}</strong></li>)}</ul></div>}
      </section>
      <section className="incident-section" id="incident" aria-labelledby="incident-title">
        <div className="incident-intro">
          <div><p className="context-line">Account status updates</p><h1 id="incident-title">Account timeline</h1><p>UPI and GPay are currently {statusText} as of {shortStatusDate(appeal.payments.upiStatusAt)}. Bank transfers by NEFT remain available.</p></div>
          <div className="incident-filters" role="group" aria-label="Filter incident dates">
            {[['all', 'All dates'], ...dates.map((date) => [date, shortDate(date).replace(/ \d{4}$/, '')])].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
        </div>
        <ol className="incident-log">
          {visibleEvents.map((event, index) => (
            <li key={event.id ?? `${event.date}-${event.time}-${event.title}`}>
              <time dateTime={event.dateTime}>
                <span>{index === 0 || visibleEvents[index - 1]?.date !== event.date ? shortDate(event.date) : ''}</span>
                <strong>{event.time}</strong>
              </time>
              <div><h3>{event.title}</h3><p>{event.detail}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
