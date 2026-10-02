import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink, FileText, Inbox, LayoutDashboard, LogOut, Menu, Settings2, UsersRound } from 'lucide-react';
import { api } from '../api';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import type { AdminUser } from '../types';
import { PageEditor } from './PageEditor';
import { SettingsEditor } from './SettingsEditor';
import { UniversityEditor } from './UniversityEditor';
import { Login } from './screens/Login';
import { Overview } from './screens/Overview';
import { PagesList } from './screens/PagesList';
import { UniversitiesList } from './screens/UniversitiesList';
import { Inquiries } from './screens/Inquiries';
import { Team } from './screens/Team';
import { ConfirmProvider } from './ConfirmProvider';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrandLogo } from '../theme/BrandLogo';
import type { SiteSettings } from '../types';

const baseLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'Universities', href: '/admin/universities', icon: BookOpen },
  { label: 'Enquiries', href: '/admin/inquiries', icon: Inbox },
  { label: 'Site settings', href: '/admin/settings', icon: Settings2 },
];

function AdminNavigation({ path, user, brand, onNavigate, onSignOut }: { path: string; user: AdminUser; brand: SiteSettings | null; onNavigate?: () => void; onSignOut: () => void }) {
  const links = user.role === 'owner' ? [...baseLinks, { label: 'Admin team', href: '/admin/team', icon: UsersRound }] : baseLinks;
  return <>
    <Link className="cms-brand" to="/admin" onClick={onNavigate} aria-label="HornSphere admin overview">
      <BrandLogo lightPath={brand?.logoPath} darkPath={brand?.darkLogoPath} alt={brand?.brandName || 'HornSphere Consulting'} />
    </Link>
    <div className="cms-sidebar-content">
      <nav aria-label="Admin navigation">
        {links.map(({ label, href, icon: Icon }) => {
          const active = path === href || (href !== '/admin' && path.startsWith(`${href}/`));
          return <Link key={href} to={href} onClick={onNavigate} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>;
        })}
      </nav>
    </div>
    <div className="cms-account">
      <span className="cms-account-avatar" aria-hidden="true">{(user.fullName || user.email).slice(0, 1).toUpperCase()}</span>
      <div><strong>{user.fullName || user.email}</strong><small>{user.role === 'owner' ? 'Owner' : 'Editor'}</small></div>
      <button type="button" onClick={onSignOut} aria-label="Sign out"><LogOut size={18} strokeWidth={1.8} /></button>
    </div>
  </>;
}

export function AdminApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brand, setBrand] = useState<SiteSettings | null>(null);
  useEffect(() => { document.body.className = 'admin-body'; document.body.dataset.page = 'admin'; return () => { document.body.className = ''; }; }, []);
  useEffect(() => { api<AdminUser>('/admin/me').then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  useEffect(() => {
    api<SiteSettings>('/site').then(setBrand).catch(() => {});
    const onBrandUpdated = (event: Event) => setBrand((event as CustomEvent<SiteSettings>).detail);
    window.addEventListener('hornsphere:brand-updated', onBrandUpdated);
    return () => window.removeEventListener('hornsphere:brand-updated', onBrandUpdated);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  if (checking) return <div className="app-loading" role="status">Checking admin access…</div>;
  const loginPath = '/admin-site/loginpage-site';
  const isLoginPage = location.pathname === loginPath;
  const returnPath = location.state?.from?.startsWith('/admin/') ? location.state.from : '/admin';
  if (!user) {
    if (!isLoginPage) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
    return <Login onLogin={setUser} brand={brand} />;
  }
  if (isLoginPage) return <Navigate to={returnPath} replace />;

  const path = location.pathname.replace(/\/$/, '') || '/admin';
  const pageMatch = path.match(/^\/admin\/pages\/([a-z0-9-]+)$/);
  const universityMatch = path.match(/^\/admin\/universities\/([a-z0-9-]+)$/);
  const pageLabel = pageMatch ? 'Edit page' : universityMatch ? 'Edit university' : baseLinks.find(link => link.href === path)?.label || (path === '/admin/team' ? 'Admin team' : 'Overview');
  const signOut = async () => {
    await api('/admin/logout', { method: 'POST' });
    setUser(null);
    navigate(loginPath, { replace: true });
  };

  return <ConfirmProvider><div className="cms-app">
    <aside className="cms-sidebar cms-desktop-sidebar"><AdminNavigation path={path} user={user} brand={brand} onSignOut={() => void signOut()} /></aside>
    <div className="cms-content">
      <header className="cms-topbar">
        <div className="cms-topbar-title">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><Button className="cms-menu-button" variant="ghost" size="icon" aria-label="Open navigation"><Menu size={26} strokeWidth={1.8} /></Button></SheetTrigger>
            <SheetContent side="left" className="cms-mobile-sheet">
              <SheetHeader className="cms-sheet-accessible"><SheetTitle>HornSphere navigation</SheetTitle><SheetDescription>Choose an admin section.</SheetDescription></SheetHeader>
              <AdminNavigation path={path} user={user} brand={brand} onNavigate={() => setMobileOpen(false)} onSignOut={() => void signOut()} />
            </SheetContent>
          </Sheet>
          <span>Workspace <span aria-hidden="true">/</span> <strong>{pageLabel}</strong></span>
        </div>
        <div className="cms-topbar-actions">
          <ThemeToggle className="cms-theme-toggle" />
          <a className="cms-site-link" href="/index.html" target="_blank" rel="noopener noreferrer">View website <ExternalLink size={15} aria-hidden="true" /></a>
        </div>
      </header>
      <main className="cms-main" key={path}>
        {pageMatch ? <PageEditor slug={pageMatch[1]} onBack={() => navigate('/admin/pages')} />
          : universityMatch ? <UniversityEditor slug={universityMatch[1]} onBack={() => navigate('/admin/universities')} />
            : path === '/admin/pages' ? <PagesList />
              : path === '/admin/universities' ? <UniversitiesList />
                : path === '/admin/inquiries' ? <Inquiries />
                  : path === '/admin/settings' ? <SettingsEditor />
                    : path === '/admin/team' && user.role === 'owner' ? <Team />
                      : <Overview />}
      </main>
    </div>
  </div></ConfirmProvider>;
}
