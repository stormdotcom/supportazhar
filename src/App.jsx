import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import QrDialog from './components/QrDialog.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import { accounts } from './data/accounts.js';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const IncidentPage = lazy(() => import('./pages/IncidentPage.jsx'));

function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return undefined;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    let finished = false;
    let frameId;
    let timeoutId;
    const scrollToTarget = () => {
      if (finished) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      finished = true;
      target.scrollIntoView({ block: 'start' });
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
    const observer = new MutationObserver(scrollToTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    frameId = requestAnimationFrame(scrollToTarget);
    timeoutId = window.setTimeout(() => {
      if (finished) return;
      finished = true;
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    }, 5000);

    return () => {
      finished = true;
      observer.disconnect();
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname, hash, key]);

  return null;
}

function AppRoutes({ onShowQr }) {
  return (
    <Suspense fallback={<main className="route-loading" aria-live="polite">Loading appeal…</main>}>
      <Routes>
        <Route path="/" element={<HomePage onShowQr={onShowQr} />} />
        <Route path="/incident" element={<IncidentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppShell() {
  const dialogRef = useRef(null);
  const [selectedQr, setSelectedQr] = useState(accounts.current);

  function showQr(account) {
    setSelectedQr(account);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <ScrollToHash />
      <div className="site-shell">
        <SiteHeader />
        <AppRoutes onShowQr={showQr} />
        <SiteFooter />
      </div>
      <QrDialog dialogRef={dialogRef} account={selectedQr} />
    </>
  );
}

export default function App() {
  return <BrowserRouter><AppShell /></BrowserRouter>;
}
