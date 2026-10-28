import React from 'react';
import { Link } from 'react-router';
import { useAppeal } from '../data/liveAppeal.jsx';

export default function SiteFooter() {
  const { appeal } = useAppeal();
  return (
    <footer className="site-footer">
      <span>Support for {appeal.person.name}</span>
      <div><Link to="/incident">View latest account updates</Link></div>
    </footer>
  );
}
