import React from 'react';
import QrCode from './QrCode.jsx';

export default function QrDialog({ dialogRef, account }) {
  return (
    <dialog className="qr-dialog" ref={dialogRef} aria-label={`QR code for ${account.holder}`}>
      <div className="dialog-header"><div><strong>{account.label}</strong><span>{account.holder}</span></div><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close QR code">×</button></div>
      <div className="dialog-qr"><QrCode account={account} /></div>
      <p>Check the current UPI status before paying.</p>
      <a href={account.qrImage} target="_blank" rel="noreferrer">View QR image</a>
    </dialog>
  );
}
