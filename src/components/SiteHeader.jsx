import React, { useState } from 'react';
import { Link } from 'react-router';
import { appeal } from '../data/appeal.js';

export default function SiteHeader() {
  const verification = appeal.contacts.reference[0];
  const name = appeal.contacts.verificationName;
  const [copyStatus, setCopyStatus] = useState('');

  async function copyWebsiteLink() {
    try {
      await navigator.clipboard.writeText(appeal.websiteUrl);
      setCopyStatus('Website link copied');
    } catch {
      setCopyStatus('Could not copy. Select the website link to share it.');
    }
  }

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
      <div className="site-actions" aria-label="Share and refresh this appeal">
        <div className="site-actions-link">
          <strong>Share the latest appeal</strong>
          <a href={appeal.websiteUrl} target="_blank" rel="noopener noreferrer">supportazhar.vercel.app</a>
        </div>
        <div className="site-actions-controls">
          <button type="button" onClick={copyWebsiteLink}>Copy website link</button>
          <button type="button" onClick={() => window.location.reload()}>Refresh updates</button>
        </div>
        <span className="site-actions-feedback" role="status" aria-live="polite">{copyStatus}</span>
      </div>
    </header>
  );
}
