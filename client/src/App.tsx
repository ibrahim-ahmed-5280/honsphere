import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { api } from './api';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Topbar } from './components/Topbar';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { PageEnhancements } from './widgets/PageEnhancements';
import { AdminApp } from './admin/AdminApp';
import type { Page, SiteSettings } from './types';

function slugFromPath(pathname: string) {
  const last = pathname.split('/').filter(Boolean).pop() || 'index';
  return last.replace(/\.html$/, '').toLowerCase();
}

function PublicPage() {
  const location = useLocation();
  const slug = slugFromPath(location.pathname);
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api<SiteSettings>('/site'), api<Page>(`/pages/${encodeURIComponent(slug)}`)])
      .then(([settings, content]) => { if (alive) { setSite(settings); setPage(content); setError(''); } })
      .catch(cause => { if (alive) setError(cause.message); });
    return () => { alive = false; };
  }, [slug]);
  useEffect(() => {
    if (!page) return;
    document.title = page.title;
    document.body.className = page.bodyClass;
    document.body.dataset.page = page.slug;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.append(meta); }
    meta.content = page.description;
  }, [page]);

  if (error) return <div className="app-error"><img src="/brand/HS Logo-13.png" alt="HornSphere Consulting" width="210" /><h1>Page unavailable</h1><p>{error}</p><a href="/index.html">Back to home</a></div>;
  if (!site || !page) return <div className="app-loading" role="status">Loading HornSphere…</div>;
  return <>
    <a className="hc-skip" href="#main">Skip to content</a>
    <Topbar site={site} />
    <Header site={site} slug={slug} />
    <main id="main" key={slug} className="hc-page-enter" dangerouslySetInnerHTML={{ __html: page.html }} />
    <PageEnhancements slug={slug} html={page.html} />
    <Footer site={site} />
    <WhatsAppWidget site={site} />
  </>;
}

export function App() {
  return <Routes>
    <Route path="/admin/*" element={<AdminApp />} />
    <Route path="/admin-site/loginpage-site" element={<AdminApp />} />
    <Route path="*" element={<PublicPage />} />
  </Routes>;
}
