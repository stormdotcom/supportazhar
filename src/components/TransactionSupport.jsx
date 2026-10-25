import React from 'react';
import { useAppeal } from '../data/liveAppeal.jsx';

export default function TransactionSupport() {
  const { appeal } = useAppeal();
  return (
    <p className="transaction-help">
      <strong>For UPI transaction issues, contact <a href={`tel:${appeal.contacts.transactionSupport}`}>{appeal.contacts.transactionSupport}</a>.</strong>
      <a className="whatsapp-link" href={`https://wa.me/91${appeal.contacts.transactionSupport}`} target="_blank" rel="noreferrer">
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M20.2 11.8a8.1 8.1 0 0 1-11.9 7.1L4 20l1.2-4.2a8.1 8.1 0 1 1 15-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .3.1.4.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.8 1.1 1.4 1.9 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.2.1.3.2.3.4 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-2 .6-1-.1-2.3-.7-3.6-1.8-1.1-1-1.9-2.2-2.1-3.2-.2-.9 0-1.6.4-2.1.3-.3.5-.4.7-.4Z" fill="currentColor" />
        </svg>
        <span>Report issue on WhatsApp</span>
      </a>
    </p>
  );
}
