import React, { useState } from 'react';
import { appeal, shortDate, shortStatusDate } from '../data/appeal.js';

export default function IncidentPage() {
  const [filter, setFilter] = useState('all');
  const visibleEvents = appeal.timeline.filter((event) => filter === 'all' || event.date === filter);
  const dates = [...new Set(appeal.timeline.map((event) => event.date))];
  const upiInactive = appeal.payments.upiStatus !== 'active';

  return (
    <main id="top" className="incident-page">
      <section className="incident-section" id="incident" aria-labelledby="incident-title">
        <div className="incident-intro">
          <div><p className="context-line">Account status updates</p><h1 id="incident-title">Account timeline</h1><p>UPI and GPay are currently {upiInactive ? 'inactive' : 'active'} as of {shortStatusDate(appeal.payments.upiStatusAt)}. Bank transfers by NEFT remain available.</p></div>
          <div className="incident-filters" role="group" aria-label="Filter incident dates">
            {[['all', 'All dates'], ...dates.map((date) => [date, shortDate(date).replace(/ \d{4}$/, '')])].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
        </div>
        <ol className="incident-log">
          {visibleEvents.map((event, index) => (
            <li key={`${event.date}-${event.time}-${event.title}`}>
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
