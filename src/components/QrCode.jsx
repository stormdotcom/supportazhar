import React from 'react';

export default function QrCode({ account, className = '' }) {
  return (
    <img
      className={`qr-code ${className}`}
      src={account.qrImage}
      alt={`Google Pay QR code for ${account.holder}`}
    />
  );
}
