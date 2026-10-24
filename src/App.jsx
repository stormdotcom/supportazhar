import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const IncidentPage = lazy(() => import('./pages/IncidentPage.jsx'));
const InfoPage = lazy(() => import('./pages/InfoPage.jsx'));

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

function AppRoutes() {
  return (
    <Suspense fallback={<main className="route-loading" aria-live="polite">Loading appeal…</main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/incident" element={<IncidentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppShell() {
  return (
    <>
      <ScrollToHash />
      <div className="site-shell">
        <SiteHeader />
        <AppRoutes />
        <SiteFooter />
      </div>
    </>
  );
}

export default function App() {
  return <BrowserRouter><AppShell /></BrowserRouter>;
}
