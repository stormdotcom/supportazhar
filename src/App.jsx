import React, { useRef, useState } from 'react';

const newAppeal = '/assets/azhar-medical-appeal.png';
const additionalAccounts = '/assets/azhar-additional-accounts.jpg';

const accounts = {
  current: {
    label: 'New account for contributions',
    holderLabel: 'Account Name',
    holder: 'SHAFI S',
    numberLabel: 'Account Number',
    number: '50100912757807',
    ifscLabel: 'IFSC Code',
    ifsc: 'HDFC0004275',
    upi: 'shafi.azar122@okhdfcbank',
    image: newAppeal,
    sourceSize: [1024, 1536],
    crop: [374, 891, 278, 265],
  },
  secondary: {
    label: 'Secondary account',
    holderLabel: 'Account holder',
    holder: 'Muhammed Ashkar N',
    numberLabel: 'Account number',
    number: '3439967725',
    ifscLabel: 'IFSC',
    ifsc: 'SBIN0007253',
    upi: 'ashkarn534-1@oksbi',
    image: additionalAccounts,
    sourceSize: [899, 1599],
    crop: [486, 621, 320, 316],
  },
  primary: {
    label: 'Primary account',
    holderLabel: 'Account holder',
    holder: 'Naseela Nazar',
    numberLabel: 'Account number',
    number: '30990695716',
    ifscLabel: 'IFSC',
    ifsc: 'SBIN0010692',
    upi: 'naseela324@oksbi',
    image: additionalAccounts,
    sourceSize: [899, 1599],
    crop: [137, 679, 171, 170],
  },
};

function QrCode({ account, className = '' }) {
  const [x, y, width, height] = account.crop;
  const [imageWidth, imageHeight] = account.sourceSize;

  return (
    <svg
      className={`qr-code ${className}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      role="img"
      aria-label={`Original UPI QR code for ${account.holder}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <image href={account.image} x="0" y="0" width={imageWidth} height={imageHeight} />
    </svg>
  );
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="copy-button" type="button" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function AccountDetails({ account, current = false }) {
  return (
    <dl className={`account-details ${current ? 'account-details-current' : ''}`}>
      <div>
        <dt>UPI ID</dt>
        <dd className="with-copy"><span>{account.upi}</span><CopyButton value={account.upi} label="UPI ID" /></dd>
      </div>
      <div>
        <dt>{account.holderLabel}</dt>
        <dd>{account.holder}</dd>
      </div>
      <div>
        <dt>{account.numberLabel}</dt>
        <dd className="with-copy"><span>{account.number}</span><CopyButton value={account.number} label="account number" /></dd>
      </div>
      {current && <div><dt>Account Type</dt><dd>Savings Account</dd></div>}
      <div><dt>{account.ifscLabel}</dt><dd>{account.ifsc}</dd></div>
      {current && <div><dt>Branch</dt><dd>HDFC Bank Pattoor</dd></div>}
      {account === accounts.secondary && <div><dt>Contact number</dt><dd><a href="tel:+919745527474">9745527474</a></dd></div>}
      {account === accounts.primary && <div><dt>GPay number</dt><dd><a href="tel:+919048313713">9048313713</a></dd></div>}
    </dl>
  );
}

const incidentEvents = [
  { date: '2026-10-22', dateTime: '2026-10-22T13:00', time: '1:00 PM', title: 'Primary account activated', detail: 'The primary account became available for contributions.' },
  { date: '2026-10-22', dateTime: '2026-10-22T18:00', time: '6:00 PM', title: 'Primary account reached its UPI limit', detail: 'The account was blocked for further UPI contributions.' },
  { date: '2026-10-22', dateTime: '2026-10-22', time: 'After 6:00 PM', title: 'Secondary account activated', detail: 'The secondary account was activated after the primary account was blocked. Exact activation time was not provided.' },
  { date: '2026-10-22', dateTime: '2026-10-22T22:00', time: '10:00 PM', title: 'Secondary account blocked', detail: 'The secondary account was also blocked.' },
  { date: '2026-10-23', dateTime: '2026-10-23T15:00', time: '3:00 PM', title: 'Third account activated', detail: 'SHAFI S’s account was activated for contributions.' },
  { date: '2026-10-23', dateTime: '2026-10-23T17:00', time: '5:00 PM', title: 'Primary account reactivated', detail: 'The primary account became active again.' },
  { date: '2026-10-23', dateTime: '2026-10-23T22:00', time: '10:00 PM', title: 'Secondary account reactivated', detail: 'The secondary account became active again. All three accounts are currently active.' },
];

function FundingProgress() {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const collectedLength = circumference * (3 / 20);

  return (
    <section className="funding-section" aria-labelledby="funding-title">
      <div className="funding-copy">
        <p className="context-line">Treatment funding</p>
        <h2 id="funding-title">₹3 lakh collected</h2>
        <p>₹17 lakh remains to reach the ₹20 lakh treatment target. The collected amount is 15% of the target.</p>
      </div>
      <div className="funding-visual">
        <svg className="funding-chart" viewBox="0 0 160 160" role="img" aria-labelledby="chart-title chart-description">
          <title id="chart-title">Collected amount compared with treatment target</title>
          <desc id="chart-description">₹3 lakh collected, 15% of the ₹20 lakh treatment target, with ₹17 lakh remaining.</desc>
          <circle className="chart-track" cx="80" cy="80" r={radius} />
          <circle className="chart-target" cx="80" cy="80" r={radius} strokeDasharray={`${collectedLength} ${circumference - collectedLength}`} />
          <text className="chart-center-value" x="80" y="76" textAnchor="middle">15%</text>
          <text className="chart-center-label" x="80" y="96" textAnchor="middle">of target</text>
        </svg>
        <div className="funding-legend" aria-label="Funding amounts">
          <p><span className="legend-swatch target-swatch" />Collected <strong>₹3 lakh</strong></p>
          <p><span className="legend-swatch extra-swatch" />Remaining <strong>₹17 lakh</strong></p>
          <p className="legend-total">Treatment target <strong>₹20 lakh</strong></p>
        </div>
      </div>
    </section>
  );
}

function IncidentSection() {
  const [filter, setFilter] = useState('all');
  const visibleEvents = incidentEvents.filter((event) => filter === 'all' || event.date === filter);

  return (
    <section className="incident-section" id="incident" aria-labelledby="incident-title">
      <div className="incident-intro">
        <div>
          <p className="context-line">Account status updates</p>
          <h2 id="incident-title">Incident</h2>
          <p>Chronological account activity. All three contribution accounts are currently active.</p>
        </div>
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
  );
}

function App() {
  const dialogRef = useRef(null);
  const [selectedQr, setSelectedQr] = useState(accounts.current);

  function showQr(account) {
    setSelectedQr(account);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="site-shell">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Support for Azhar, back to top">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span>Support for Azhar</span>
          </a>
          <nav className="header-nav" aria-label="Page sections">
            <a className="header-link" href="#incident">Incident</a>
            <a className="header-link" href="#contribute">Contribute <span aria-hidden="true">↗</span></a>
          </nav>
        </header>

        <main id="top">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="context-line">Medical assistance appeal</p>
              <h1 id="hero-title">Help Azhar through his recovery.</h1>
              <p className="hero-lede">Azhar Shafi, 32, from Kazhakkottam, is in the ICU at Ananthapuri Hospital after a serious road accident in Marthandam on 22 October 2026.</p>
              <p className="hero-detail">He has a severe head injury and bleeding in the brain. Treatment is estimated at ₹20 lakh; ₹5 lakh has already been paid towards surgery.</p>
              <p className="collection-update">Reported collected: <strong>₹3 lakh</strong> against the ₹20 lakh treatment target; ₹17 lakh remains.</p>
              <a className="primary-cta" href="#contribute">See ways to contribute <span aria-hidden="true">↓</span></a>
            </div>
            <aside className="need-panel" aria-label="Treatment funding details">
              <span className="need-panel-rule" aria-hidden="true" />
              <p>Treatment estimate</p>
              <strong>₹20 lakh</strong>
              <div className="need-panel-divider" />
              <p>Already paid towards surgery</p>
              <strong>₹5 lakh</strong>
              <small>Details from the supplied medical assistance appeal.</small>
            </aside>
          </section>

          <section className="contribution-section" id="contribute" aria-labelledby="contribute-title">
            <div className="section-intro">
              <div>
                <h2 id="contribute-title">Active UPI for Contributions</h2>
                <p>Please use the new account shown in the medical assistance appeal.</p>
              </div>
              <span className="active-pill"><span aria-hidden="true" /> Activated 23 Oct, 3 PM</span>
            </div>

            <div className="current-account">
              <div className="current-qr-block">
                <div className="qr-frame qr-frame-current"><QrCode account={accounts.current} /></div>
                <p>Scan with a UPI app</p>
                <button className="text-button" type="button" onClick={() => showQr(accounts.current)}>View QR larger</button>
              </div>
              <div className="current-payment-block">
                <h3>SHAFI S</h3>
                <p className="payment-instruction">Scan the QR code or copy the UPI ID to contribute.</p>
                <AccountDetails account={accounts.current} current />
              </div>
            </div>
            <p className="transaction-help"><strong>For UPI transaction issues, contact <a href="tel:8891590046">8891590046</a>.</strong></p>
          </section>

          <section className="story-section" aria-labelledby="story-title">
            <div className="story-heading">
              <h2 id="story-title">What happened</h2>
            </div>
            <div className="story-copy">
              <p>On the morning of 22 October 2026, Azhar was travelling from Nagercoil to Thiruvananthapuram when his vehicle went out of control at Marthandam and struck the rear of a lorry parked by the roadside.</p>
              <p>He is receiving treatment in the intensive care unit at Ananthapuri Hospital, Thiruvananthapuram. The accident caused a severe head injury and bleeding in his brain. The supplied appeal asks for support with treatment costs.</p>
            </div>
          </section>

          <FundingProgress />
          <IncidentSection />

          <section className="more-accounts" aria-labelledby="more-accounts-title">
            <div className="section-intro narrow">
              <div>
                <h2 id="more-accounts-title">Accounts in the additional appeal</h2>
                <p>All three contribution accounts are currently active. The additional appeal image marked the primary account as having reached its UPI limit; it was reactivated on 23 October at 5 PM.</p>
              </div>
            </div>
            <div className="other-account-grid">
              <article className="other-account-card">
                <div className="card-heading"><div><span className="card-status active">Active again · 23 Oct, 10 PM</span><h3>Secondary account</h3></div></div>
                <div className="other-account-body">
                  <div className="other-qr"><div className="qr-frame"><QrCode account={accounts.secondary} /></div><button className="text-button" type="button" onClick={() => showQr(accounts.secondary)}>View QR larger</button></div>
                  <AccountDetails account={accounts.secondary} />
                </div>
              </article>
              <article className="other-account-card">
                <div className="card-heading"><div><span className="card-status active">Active again · 23 Oct, 5 PM</span><h3>Primary account</h3></div></div>
                <p className="limit-note">The supplied image marked this account as having reached its UPI limit. It was reactivated on 23 October at 5 PM.</p>
                <div className="other-account-body">
                  <div className="other-qr"><div className="qr-frame"><QrCode account={accounts.primary} /></div><button className="text-button" type="button" onClick={() => showQr(accounts.primary)}>View QR larger</button></div>
                  <AccountDetails account={accounts.primary} />
                </div>
              </article>
            </div>
          </section>

          <section className="contacts-section" aria-labelledby="contacts-title">
            <div>
              <h2 id="contacts-title">Reference Contacts</h2>
              <p>For questions about this appeal, contact the people listed in the supplied reference.</p>
            </div>
            <div className="contact-links">
              <a href="tel:+917012957194">+91 70129 57194</a>
              <a href="tel:+918129590761">+91 81295 90761</a>
              <a href="tel:+919633659500">+91 96336 59500</a>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <span>Support for Azhar Shafi</span>
          <div><a href={newAppeal} target="_blank" rel="noreferrer">View medical appeal image</a><a href={additionalAccounts} target="_blank" rel="noreferrer">View additional accounts image</a></div>
        </footer>
      </div>

      <dialog className="qr-dialog" ref={dialogRef} aria-label={`QR code for ${selectedQr.holder}`}>
        <div className="dialog-header"><div><strong>{selectedQr.label}</strong><span>{selectedQr.holder}</span></div><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close QR code">×</button></div>
        <div className="dialog-qr"><QrCode account={selectedQr} /></div>
        <p>Scan this QR code with a UPI app.</p>
        <a href={selectedQr.image} target="_blank" rel="noreferrer">View original appeal image</a>
      </dialog>
    </>
  );
}

export default App;

