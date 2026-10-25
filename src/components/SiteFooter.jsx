import React from 'react';
import { additionalAccountsImage, appealImage } from '../data/accounts.js';
import { useAppeal } from '../data/liveAppeal.jsx';

export default function SiteFooter() {
  const { appeal } = useAppeal();
  return (
    <footer className="site-footer">
      <span>Support for {appeal.person.name}</span>
      <div><a href={appealImage} target="_blank" rel="noreferrer">View medical appeal image</a><a href={additionalAccountsImage} target="_blank" rel="noreferrer">View additional accounts image</a></div>
    </footer>
  );
}
