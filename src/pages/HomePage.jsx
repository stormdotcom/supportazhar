import React from 'react';
import { Link } from 'react-router';
import AccountDetails from '../components/AccountDetails.jsx';
import FundingProgress from '../components/FundingProgress.jsx';
import QrCode from '../components/QrCode.jsx';
import { accounts } from '../data/accounts.js';
import { appeal, rupees, shortStatusDate } from '../data/appeal.js';

function AccountCard({ account }) {
  const upiInactive = appeal.payments.upiStatus !== 'active';
  return (
    <article className="other-account-card">
      <div className="card-heading">
        <span className={`card-status ${upiInactive ? 'limited' : 'active'}`}>UPI {upiInactive ? 'inactive · limit reached' : 'active'}</span>
        <h3>{account.holder}</h3>
      </div>
      <div className="other-account-body bank-only">
        <AccountDetails account={account} showUpi={false} showPhone={false} />
      </div>
    </article>
  );
}

export default function HomePage() {
  const { target, collected } = appeal.funding;
  const remaining = Math.max(0, target - collected);
  const statusAt = shortStatusDate(appeal.payments.upiStatusAt);
  const upiInactive = appeal.payments.upiStatus !== 'active';

  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="context-line">Medical assistance appeal</p>
          <h1 id="hero-title">Help Azhar reach his treatment goal.</h1>
          <p className="hero-lede">Your contribution can help Azhar and his family meet urgent treatment costs.</p>
          <p className="collection-update"><strong>{rupees(collected)} collected</strong> toward the {rupees(target)} target. We still have a long way to go.</p>
          {upiInactive && <div className="upi-context-card">
            <strong>UPI limit reached</strong>
            <p>UPI and Google Pay have reached their limits. The <Link to="/#google-pay-qr">Google Pay QR remains visible</Link>, but payments may fail. You can contribute by NEFT or help collect contributions locally. <Link to="/incident">Read more about the account update <span aria-hidden="true">→</span></Link></p>
          </div>}
          <div className="hero-actions">
            <Link className="primary-cta" to="/#contribute">Contribute by bank transfer <span aria-hidden="true">↓</span></Link>
            <Link className="secondary-cta" to="/#volunteer">Start volunteering <span aria-hidden="true">↓</span></Link>
          </div>
        </div>
        <aside className="need-panel" aria-label="Contribution progress">
          <span className="need-panel-rule" aria-hidden="true" />
          <p>Still needed</p><strong>{rupees(remaining)}</strong>
          <div className="need-panel-divider" />
          <p>Collected so far</p><strong>{rupees(collected)}</strong>
          <small>Based on the {rupees(target)} treatment estimate.</small>
        </aside>
      </section>

      <section className="volunteer-section" id="volunteer" aria-labelledby="volunteer-title">
        <div>
          <h2 id="volunteer-title">{appeal.volunteer.heading}</h2>
          <p>{appeal.volunteer.intro}</p>
          <ol className="volunteer-steps">
            {appeal.volunteer.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
        <Link className="volunteer-link" to="/#contribute">See bank accounts <span aria-hidden="true">↓</span></Link>
      </section>

      <section className="contribution-section" id="contribute" aria-labelledby="contribute-title">
        <div className="section-intro">
          <div>
            <h2 id="contribute-title">Contribute by NEFT</h2>
            <p>{upiInactive ? 'UPI and GPay are currently inactive because the transaction limits have been reached.' : 'UPI and GPay are currently active.'} Use the account number and IFSC below for a bank transfer.</p>
          </div>
          <span className="inactive-pill">UPI {upiInactive ? 'inactive' : 'active'} · {statusAt}</span>
        </div>
        <div className="current-account bank-account">
          <div className="bank-account-intro">
            <span>01 / 03</span>
            <h3>{accounts.current.holder}</h3>
            <p>{accounts.current.branch}</p>
            <div className="current-qr-block" id="google-pay-qr">
              <div className="qr-frame qr-frame-current"><QrCode account={accounts.current} /></div>
              <p>Google Pay QR for {accounts.current.holder}</p>
              <small>{upiInactive ? 'UPI limit reached. Google Pay payments may fail; please use NEFT for now.' : 'UPI is active. Check the recipient name before paying.'}</small>
            </div>
          </div>
          <div className="current-payment-block">
            <p className="payment-instruction">Transfer by NEFT using these bank details. Check the recipient name before sending.</p>
            <AccountDetails account={accounts.current} current showUpi={false} />
          </div>
        </div>
      </section>

      <section className="incident-preview" aria-labelledby="incident-preview-title">
        <div>
          <p className="context-line">{statusAt}</p>
          <h2 id="incident-preview-title">{upiInactive ? 'UPI limit reached' : 'UPI available again'}</h2>
          <p>{upiInactive ? 'All three UPI options are inactive for now.' : 'UPI is active again.'} The account timeline records this update and earlier changes.</p>
        </div>
        <Link className="incident-preview-link" to="/incident">View account timeline <span aria-hidden="true">→</span></Link>
      </section>

      <FundingProgress />

      <section className="more-accounts" aria-labelledby="more-accounts-title">
        <div className="section-intro narrow">
          <div>
            <h2 id="more-accounts-title">Two more accounts for NEFT</h2>
            <p>You can transfer to any one of the three accounts. UPI and GPay are currently {upiInactive ? 'inactive' : 'active'}.</p>
          </div>
        </div>
        <div className="other-account-grid">
          <AccountCard account={accounts.secondary} />
          <AccountCard account={accounts.primary} />
        </div>
      </section>

      <section className="contacts-section" aria-labelledby="contacts-title">
        <div><h2 id="contacts-title">Reference contacts</h2><p>For questions about volunteering or the appeal, contact the people listed in the supplied reference.</p></div>
        <div className="contact-links">
          {appeal.contacts.reference.map((contact) => <a key={contact.tel} href={`tel:${contact.tel}`}>{contact.display}</a>)}
        </div>
      </section>
    </main>
  );
}
