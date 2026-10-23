import React from 'react';
import { Link } from 'react-router';
import AccountDetails from '../components/AccountDetails.jsx';
import FundingProgress from '../components/FundingProgress.jsx';
import QrCode from '../components/QrCode.jsx';
import TransactionSupport from '../components/TransactionSupport.jsx';
import { accounts } from '../data/accounts.js';

function AccountCard({ account, status, note, onShowQr }) {
  return (
    <article className="other-account-card">
      <div className="card-heading"><div><span className="card-status active">{status}</span><h3>{account.label}</h3></div></div>
      {note && <p className="limit-note">{note}</p>}
      <div className="other-account-body">
        <div className="other-qr">
          <div className="qr-frame"><QrCode account={account} /></div>
          <button className="text-button" type="button" onClick={() => onShowQr(account)}>View QR larger</button>
        </div>
        <AccountDetails account={account} />
      </div>
    </article>
  );
}

export default function HomePage({ onShowQr }) {
  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="context-line">Medical assistance appeal</p>
          <h1 id="hero-title">Help Azhar through his recovery.</h1>
          <p className="hero-lede">Azhar Shafi, 32, from Kazhakkottam, is in the ICU at Ananthapuri Hospital after a serious road accident in Marthandam on 22 October 2026.</p>
          <p className="hero-detail">He has a severe head injury and bleeding in the brain. Treatment is estimated at ₹20 lakh; ₹5 lakh has already been paid towards surgery.</p>
          <p className="collection-update">Reported collected: <strong>₹3 lakh</strong> against the ₹20 lakh treatment target; ₹17 lakh remains.</p>
          <aside className="upi-context-card" aria-label="UPI contribution information">
            <strong>Why multiple UPI accounts?</strong>
            <p>High contribution volume can reach daily UPI limits. The appeal organizer reports coordinating with the HDFC Bank Pattoor branch manager to help clear transaction blockers and support smoother contributions. All three accounts are currently active.</p>
          </aside>
          <Link className="primary-cta" to="/#contribute">See ways to contribute <span aria-hidden="true">↓</span></Link>
        </div>
        <aside className="need-panel" aria-label="Treatment funding details">
          <span className="need-panel-rule" aria-hidden="true" />
          <p>Treatment estimate</p><strong>₹20 lakh</strong>
          <div className="need-panel-divider" />
          <p>Already paid towards surgery</p><strong>₹5 lakh</strong>
          <small>Details from the supplied medical assistance appeal.</small>
        </aside>
      </section>

      <section className="contribution-section" id="contribute" aria-labelledby="contribute-title">
        <div className="section-intro">
          <div><h2 id="contribute-title">Active UPI for Contributions</h2><p>Please use the new account shown in the medical assistance appeal.</p></div>
          <span className="active-pill"><span aria-hidden="true" /> Activated 23 Oct, 3 PM</span>
        </div>
        <div className="current-account">
          <div className="current-qr-block">
            <div className="qr-frame qr-frame-current"><QrCode account={accounts.current} /></div>
            <p>Scan with a UPI app</p>
            <button className="text-button" type="button" onClick={() => onShowQr(accounts.current)}>View QR larger</button>
          </div>
          <div className="current-payment-block">
            <h3>SHAFI S</h3>
            <p className="payment-instruction">Scan the QR code or copy the UPI ID to contribute.</p>
            <AccountDetails account={accounts.current} current />
          </div>
        </div>
        <TransactionSupport />
      </section>

      <section className="incident-preview" aria-labelledby="incident-preview-title">
        <div>
          <p className="context-line">Account status updates</p>
          <h2 id="incident-preview-title">Account activity</h2>
          <p>All three contribution accounts are currently active. See the dated account changes and the full medical incident story.</p>
        </div>
        <Link className="incident-preview-link" to="/incident">View incident timeline <span aria-hidden="true">→</span></Link>
      </section>

      <FundingProgress />

      <section className="more-accounts" aria-labelledby="more-accounts-title">
        <div className="section-intro narrow">
          <div><h2 id="more-accounts-title">Accounts in the additional appeal</h2><p>All three contribution accounts are currently active. The additional appeal image marked the primary account as having reached its UPI limit; it was reactivated on 23 October at 5 PM.</p></div>
        </div>
        <div className="other-account-grid">
          <AccountCard account={accounts.secondary} status="Currently active · reactivated 23 Oct, 10 PM" onShowQr={onShowQr} />
          <AccountCard account={accounts.primary} status="Active again · 23 Oct, 5 PM" note="The supplied image marked this account as having reached its UPI limit. It was reactivated on 23 October at 5 PM." onShowQr={onShowQr} />
        </div>
      </section>

      <section className="contacts-section" aria-labelledby="contacts-title">
        <div><h2 id="contacts-title">Reference Contacts</h2><p>For questions about this appeal, contact the people listed in the supplied reference.</p></div>
        <div className="contact-links">
          <a href="tel:+917012957194">+91 70129 57194</a>
          <a href="tel:+918129590761">+91 81295 90761</a>
          <a href="tel:+919633659500">+91 96336 59500</a>
        </div>
      </section>
    </main>
  );
}
