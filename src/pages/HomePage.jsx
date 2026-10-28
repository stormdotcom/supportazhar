import React from 'react';
import { Link } from 'react-router';
import AccountDetails from '../components/AccountDetails.jsx';
import DonorWall from '../components/DonorWall.jsx';
import FundingProgress from '../components/FundingProgress.jsx';
import QrCode from '../components/QrCode.jsx';
import { getAccounts } from '../data/accounts.js';
import { rupees, shortStatusDate } from '../data/appeal.js';
import { fallbackAppeal } from '../data/appealModel.js';
import { useAppeal } from '../data/liveAppeal.jsx';

function AccountCard({ account, status }) {
  return (
    <article className="other-account-card">
      <div className="card-heading">
        <span className={`card-status ${status.active ? 'active' : 'limited'}`}>UPI {status.active ? 'active' : 'inactive'}</span>
        <h3>{account.holder}</h3>
      </div>
      <div className="other-account-body">
        {status.active && account.qrImage && <div className="other-qr"><div className="qr-frame"><QrCode account={account} /></div><p>UPI QR for {account.holder}</p></div>}
        <p className="limit-note">{status.active ? 'UPI is active. Check the recipient name before paying.' : `${status.reason || 'UPI is currently unavailable.'} Bank transfers by NEFT remain available.`}</p>
        <AccountDetails account={account} showUpi={false} showPhone={false} />
      </div>
    </article>
  );
}

export default function HomePage() {
  const { appeal } = useAppeal();
  const accounts = getAccounts(appeal);
  const accountStatus = appeal.accountStatus.shaina ? appeal.accountStatus : fallbackAppeal.accountStatus;
  const { target, collected } = appeal.funding;
  const remaining = Math.max(0, target - collected);
  const statusAt = shortStatusDate(appeal.accountStatus.shaina ? appeal.payments.upiStatusAt : fallbackAppeal.payments.upiStatusAt);
  const upiStatus = appeal.accountStatus.shaina ? appeal.payments.upiStatus : fallbackAppeal.payments.upiStatus;
  const primaryAccount = accounts.shaina ?? getAccounts(fallbackAppeal).shaina;
  const primaryStatus = accountStatus.shaina;
  const statusText = upiStatus === 'active' ? 'active on all accounts' : upiStatus === 'partial' ? 'active on some accounts' : 'inactive on all accounts';

  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="context-line">Medical assistance appeal</p>
          <h1 id="hero-title">Help Azhar reach his treatment goal.</h1>
          <p className="hero-lede">Your contribution can help Azhar and his family meet urgent treatment costs.</p>
          <p className="collection-update"><strong>{rupees(collected)} collected</strong> toward the {rupees(target)} target. We still have a long way to go.</p>
          {upiStatus !== 'active' && <div className="upi-context-card">
            <strong>{upiStatus === 'partial' ? 'Some UPI accounts are unavailable' : 'UPI is currently unavailable'}</strong>
            <p>Use Shaina N S’s UPI ID or QR code for contributions. The older UPI accounts reached their limits and should be checked again after 24 hours. Bank transfers by NEFT remain available. <Link to="/incident">Read the account updates <span aria-hidden="true">→</span></Link></p>
          </div>}
          <div className="hero-actions">
            <Link className="primary-cta" to="/#contribute">Contribute by UPI <span aria-hidden="true">↓</span></Link>
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
            <h2 id="contribute-title">Contribute by UPI</h2>
            <p>Shaina N S’s new UPI account is the primary payment option. The three older UPI accounts are inactive after reaching their limits; check their status again after 24 hours.</p>
          </div>
          <span className={upiStatus === 'active' ? 'active-pill' : 'inactive-pill'}>UPI {upiStatus === 'partial' ? 'partly active' : upiStatus} · {statusAt}</span>
        </div>
        <div className="current-account bank-account">
          <div className="bank-account-intro">
            <span>Primary UPI account</span>
            <h3>{primaryAccount.holder}</h3>
            <p>New account for contributions</p>
            {primaryStatus.active && <div className="current-qr-block" id="google-pay-qr">
              <div className="qr-frame qr-frame-current"><QrCode account={primaryAccount} /></div>
              <p>UPI QR for {primaryAccount.holder}</p>
              <small>Check the recipient name and UPI ID before paying.</small>
            </div>}
          </div>
          <div className="current-payment-block">
            <p className="payment-instruction">{primaryStatus.active ? 'Pay using this UPI ID or scan the QR code.' : primaryStatus.reason || 'This UPI account is unavailable.'} Bank account number and IFSC have not been provided for this account.</p>
            <AccountDetails account={primaryAccount} current showUpi={primaryStatus.active} />
          </div>
        </div>
      </section>

      <section className="incident-preview" aria-labelledby="incident-preview-title">
        <div>
          <p className="context-line">{statusAt}</p>
          <h2 id="incident-preview-title">{upiStatus === 'active' ? 'UPI available' : upiStatus === 'partial' ? 'Some UPI accounts available' : 'UPI unavailable'}</h2>
          <p>UPI is currently {statusText}. The account timeline records this update and earlier changes.</p>
        </div>
        <Link className="incident-preview-link" to="/incident">View account timeline <span aria-hidden="true">→</span></Link>
      </section>

      <FundingProgress />

      <section className="more-accounts" aria-labelledby="more-accounts-title">
        <div className="section-intro narrow">
          <div>
            <h2 id="more-accounts-title">Bank accounts for NEFT</h2>
            <p>The three older UPI IDs are temporarily inactive. Their bank details remain available for NEFT transfers.</p>
          </div>
        </div>
        <div className="other-account-grid">
          <AccountCard account={accounts.secondary} status={accountStatus.secondary} />
          <AccountCard account={accounts.primary} status={accountStatus.primary} />
          <AccountCard account={accounts.current} status={accountStatus.current} />
        </div>
      </section>

      <section className="contacts-section" aria-labelledby="contacts-title">
        <div><h2 id="contacts-title">Reference contacts</h2><p>For questions about volunteering or the appeal, contact the people listed in the supplied reference.</p></div>
        <div className="contact-links">
          {appeal.contacts.reference.map((contact) => <a key={contact.tel} href={`tel:${contact.tel}`}>{contact.display}</a>)}
        </div>
      </section>

      <DonorWall />

      <section className="volunteer-join-section" aria-labelledby="volunteer-join-title">
        <div>
          <h2 id="volunteer-join-title">Interested in volunteering?</h2>
          <p>Join the WhatsApp group to help coordinate support for Azhar.</p>
        </div>
        <a className="volunteer-join-link" href={appeal.volunteer.whatsappGroupUrl} target="_blank" rel="noopener noreferrer">Start volunteering <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
