import React from 'react';
import { additionalAccountsImage, appealImage } from '../data/accounts.js';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>Support for Azhar Shafi</span>
      <div><a href={appealImage} target="_blank" rel="noreferrer">View medical appeal image</a><a href={additionalAccountsImage} target="_blank" rel="noreferrer">View additional accounts image</a></div>
    </footer>
  );
}
