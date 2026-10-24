import React from 'react';
import { Link } from 'react-router';
import { appeal } from '../data/appeal.js';

export default function SiteHeader() {
  const verification = appeal.contacts.reference[0];
  const name = appeal.contacts.verificationName;
  return (
    <header className="site-header-wrap">
      <div className="site-header">
        <Link className="brand" to="/" aria-label="Support for Azhar, back to top">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Support for Azhar</span>
        </Link>
        <nav className="header-nav" aria-label="Main navigation">
          <Link className="header-link" to="/info">Info</Link>
          <Link className="header-link" to="/incident">Updates</Link>
          <Link className="header-link" to="/#contribute">Contribute <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
      <div className="verification-strip">
        <div className="verification-marquee" aria-label={`Questions about this appeal's authenticity? Contact ${name} at ${verification.display}.`}>
          <div className="verification-track" aria-hidden="true">
            <span>Questions about this appeal's authenticity? Contact {name}: {verification.display}</span>
            <span>Questions about this appeal's authenticity? Contact {name}: {verification.display}</span>
          </div>
        </div>
        <a className="verification-call" href={`tel:${verification.tel}`} aria-label={`Call ${name} at ${verification.display}`}>Call {name} <span>{verification.display}</span></a>
      </div>
    </header>
  );
}
