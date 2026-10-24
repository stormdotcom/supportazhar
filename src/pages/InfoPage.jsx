import React from 'react';
import { Link } from 'react-router';
import { appeal, rupees } from '../data/appeal.js';

export default function InfoPage() {
  return (
    <main id="top" className="info-page">
      <section className="story-section incident-story" aria-labelledby="story-title">
        <div className="story-heading"><p className="context-line">About Azhar</p><h1 id="story-title">What happened</h1></div>
        <div className="story-copy">
          {appeal.medical.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p>Treatment is estimated at {rupees(appeal.funding.target)}; {rupees(appeal.funding.surgeryPaid)} has already been paid towards surgery.</p>
          <Link className="story-action" to="/#contribute">See ways to contribute <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
