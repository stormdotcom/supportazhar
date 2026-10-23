import React, { useState } from 'react';

const incidentEvents = [
  { date: '2026-10-22', dateTime: '2026-10-22T13:00', time: '1:00 PM', title: 'Primary account activated', detail: 'The primary account became available for contributions.' },
  { date: '2026-10-22', dateTime: '2026-10-22T18:00', time: '6:00 PM', title: 'Primary account reached its UPI limit', detail: 'The account was blocked for further UPI contributions.' },
  { date: '2026-10-22', dateTime: '2026-10-22', time: 'After 6:00 PM', title: 'Secondary account activated', detail: 'The secondary account was activated after the primary account was blocked. Exact activation time was not provided.' },
  { date: '2026-10-22', dateTime: '2026-10-22T22:00', time: '10:00 PM', title: 'Secondary account blocked', detail: 'The secondary account was also blocked.' },
  { date: '2026-10-23', dateTime: '2026-10-23T15:00', time: '3:00 PM', title: 'Third account activated', detail: 'SHAFI S’s account was activated for contributions.' },
  { date: '2026-10-23', dateTime: '2026-10-23T17:00', time: '5:00 PM', title: 'Primary account reactivated', detail: 'The primary account became active again.' },
  { date: '2026-10-23', dateTime: '2026-10-23T22:00', time: '10:00 PM', title: 'Secondary account reactivated', detail: 'The secondary account became active again. All three accounts are currently active.' },
];

export default function IncidentPage() {
  const [filter, setFilter] = useState('all');
  const visibleEvents = incidentEvents.filter((event) => filter === 'all' || event.date === filter);

  return (
    <main id="top" className="incident-page">
      <section className="story-section incident-story" aria-labelledby="story-title">
        <div className="story-heading"><p className="context-line">Medical incident</p><h1 id="story-title">What happened</h1></div>
        <div className="story-copy">
          <p>On the morning of 22 October 2026, Azhar was travelling from Nagercoil to Thiruvananthapuram when his vehicle went out of control at Marthandam and struck the rear of a lorry parked by the roadside.</p>
          <p>He is receiving treatment in the intensive care unit at Ananthapuri Hospital, Thiruvananthapuram. The accident caused a severe head injury and bleeding in his brain. The supplied appeal asks for support with treatment costs.</p>
        </div>
      </section>
      <section className="incident-section" id="incident" aria-labelledby="incident-title">
        <div className="incident-intro">
          <div><p className="context-line">Account status updates</p><h2 id="incident-title">Incident</h2><p>Chronological account activity. All three contribution accounts are currently active.</p></div>
          <div className="incident-filters" role="group" aria-label="Filter incident dates">
            {[['all', 'All dates'], ['2026-10-22', '22 Oct'], ['2026-10-23', '23 Oct']].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
        </div>
        <ol className="incident-log">
          {visibleEvents.map((event, index) => (
            <li key={`${event.date}-${event.time}-${event.title}`}>
              <time dateTime={event.dateTime}>
                <span>{index === 0 || visibleEvents[index - 1]?.date !== event.date ? new Date(`${event.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''}</span>
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
