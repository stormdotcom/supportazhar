import React from 'react';

export default function QrCode({ account, className = '' }) {
  const [x, y, width, height] = account.crop;
  const [imageWidth, imageHeight] = account.sourceSize;

  return (
    <svg
      className={`qr-code ${className}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      role="img"
      aria-label={`Google Pay QR code for ${account.holder}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <image href={account.image} x="0" y="0" width={imageWidth} height={imageHeight} />
    </svg>
  );
}
