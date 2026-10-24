import React, { useState } from 'react';

function CopyButton({ value, label }) {
  const [feedback, setFeedback] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback('Copied');
    } catch {
      setFeedback('Copy failed');
    }
    window.setTimeout(() => setFeedback(''), 2000);
  }

  return (
    <span className="copy-control">
      <button className="copy-button" type="button" onClick={copy} aria-label={`Copy ${label}`}>Copy</button>
      <span className="copy-feedback" role="status" aria-live="polite">{feedback}</span>
    </span>
  );
}

export default function AccountDetails({ account, current = false, showUpi = true, showPhone = true }) {
  return (
    <dl className={`account-details ${current ? 'account-details-current' : ''}`}>
      {showUpi && <div><dt>UPI ID</dt><dd className="with-copy"><span>{account.upi}</span><CopyButton value={account.upi} label="UPI ID" /></dd></div>}
      <div><dt>{account.holderLabel}</dt><dd>{account.holder}</dd></div>
      <div><dt>{account.numberLabel}</dt><dd className="with-copy"><span>{account.number}</span><CopyButton value={account.number} label="account number" /></dd></div>
      {current && <div><dt>Account Type</dt><dd>{account.accountType}</dd></div>}
      <div><dt>{account.ifscLabel}</dt><dd className="with-copy"><span>{account.ifsc}</span><CopyButton value={account.ifsc} label="IFSC code" /></dd></div>
      {current && <div><dt>Branch</dt><dd>{account.branch}</dd></div>}
      {showPhone && account.phone && <div><dt>{account.phoneLabel}</dt><dd><a href={`tel:${account.phoneHref}`}>{account.phone}</a></dd></div>}
    </dl>
  );
}
