import React from 'react';
import { Link } from 'react-router';
import AccountDetails from '../components/AccountDetails.jsx';
import FundingProgress from '../components/FundingProgress.jsx';
import QrCode from '../components/QrCode.jsx';
import { getAccounts } from '../data/accounts.js';
import { rupees, shortStatusDate } from '../data/appeal.js';
import { useAppeal } from '../data/liveAppeal.jsx';

function AccountCard({ account, status }) {
  return (
    <article className="other-account-card">
      <div className="card-heading">
        <span className={`card-status ${status.active ? 'active' : 'limited'}`}>UPI {status.active ? 'active' : 'inactive'}</span>
        <h3>{account.holder}</h3>
      </div>
      <div className="other-account-body">
        <div className="other-qr">
          <div className="qr-frame"><QrCode account={account} /></div>
          <p>Google Pay QR for {account.holder}</p>
          <small>{status.active ? 'UPI is active. Check the recipient name before paying.' : `${status.reason || 'UPI is unavailable.'} Please use NEFT for now.`}</small>
        </div>
        <AccountDetails account={account} showUpi={false} showPhone={false} />
      </div>
    </article>
  );
}

export default function HomePage() {
  const { appeal } = useAppeal();
  const accounts = getAccounts(appeal);
  const { target, collected } = appeal.funding;
  const remaining = Math.max(0, target - collected);
  const statusAt = shortStatusDate(appeal.payments.upiStatusAt);
  const upiStatus = appeal.payments.upiStatus;
  const currentStatus = appeal.accountStatus.current;
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
            <p>Check each account’s status before using its Google Pay QR code. Bank transfers by NEFT remain available. <Link to="/incident">Read the account updates <span aria-hidden="true">→</span></Link></p>
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
            <p>UPI and GPay are currently {statusText}. Use the account number and IFSC below for a bank transfer.</p>
          </div>
          <span className={upiStatus === 'active' ? 'active-pill' : 'inactive-pill'}>UPI {upiStatus === 'partial' ? 'partly active' : upiStatus} · {statusAt}</span>
        </div>
        <div className="current-account bank-account">
          <div className="bank-account-intro">
            <span>01 / 03</span>
            <h3>{accounts.current.holder}</h3>
            <p>{accounts.current.branch}</p>
            <div className="current-qr-block" id="google-pay-qr">
              <div className="qr-frame qr-frame-current"><QrCode account={accounts.current} /></div>
              <p>Google Pay QR for {accounts.current.holder}</p>
              <small>{currentStatus.active ? 'UPI is active. Check the recipient name before paying.' : `${currentStatus.reason || 'UPI is unavailable.'} Please use NEFT for now.`}</small>
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
          <h2 id="incident-preview-title">{upiStatus === 'active' ? 'UPI available' : upiStatus === 'partial' ? 'Some UPI accounts available' : 'UPI unavailable'}</h2>
          <p>UPI is currently {statusText}. The account timeline records this update and earlier changes.</p>
        </div>
        <Link className="incident-preview-link" to="/incident">View account timeline <span aria-hidden="true">→</span></Link>
      </section>

      <FundingProgress />

      <section className="more-accounts" aria-labelledby="more-accounts-title">
        <div className="section-intro narrow">
          <div>
            <h2 id="more-accounts-title">Two more accounts for NEFT</h2>
            <p>You can transfer to any one of the three accounts. UPI and GPay are currently {statusText}.</p>
          </div>
        </div>
        <div className="other-account-grid">
          <AccountCard account={accounts.secondary} status={appeal.accountStatus.secondary} />
          <AccountCard account={accounts.primary} status={appeal.accountStatus.primary} />
        </div>
      </section>

      <section className="contacts-section" aria-labelledby="contacts-title">
        <div><h2 id="contacts-title">Reference contacts</h2><p>For questions about volunteering or the appeal, contact the people listed in the supplied reference.</p></div>
        <div className="contact-links">
          {appeal.contacts.reference.map((contact) => <a key={contact.tel} href={`tel:${contact.tel}`}>{contact.display}</a>)}
        </div>
      </section>

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
