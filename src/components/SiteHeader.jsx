import React from 'react';
import { Link } from 'react-router';

export default function SiteHeader() {
  return (
    <header className="site-header-wrap">
      <div className="site-header">
        <Link className="brand" to="/" aria-label="Support for Azhar, back to top">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Support for Azhar</span>
        </Link>
        <nav className="header-nav" aria-label="Main navigation">
          <Link className="header-link" to="/incident">Incident</Link>
          <Link className="header-link" to="/#contribute">Contribute <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
      <div className="verification-strip">
        <div className="verification-marquee" aria-label="Questions about this appeal's authenticity? Contact Adv. Anas at +91 70129 57194.">
          <div className="verification-track" aria-hidden="true">
            <span>Questions about this appeal's authenticity? Contact Adv. Anas: +91 70129 57194</span>
            <span>Questions about this appeal's authenticity? Contact Adv. Anas: +91 70129 57194</span>
          </div>
        </div>
        <a className="verification-call" href="tel:+917012957194" aria-label="Call Adv. Anas at +91 70129 57194">Call Adv. Anas <span>+91 70129 57194</span></a>
      </div>
    </header>
  );
}
