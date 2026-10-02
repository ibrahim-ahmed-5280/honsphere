import { useEffect, useRef, useState } from 'react';
import type { SiteSettings, Link } from '../types';
import { icon } from './Icon';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrandLogo } from '../theme/BrandLogo';

function isCurrentLink(link: Link, slug: string) {
  return link.href.replace(/^\//, '').split(/[?#]/)[0] === `${slug}.html`;
}

export function Header({ site, slug }: { site: SiteSettings; slug: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const desktopServicesRef = useRef<HTMLDivElement>(null);
  const services = site.serviceLinks || [];
  const mobileLinks = site.navLinks.some(link => link.href.includes('contact.html'))
    ? site.navLinks : [...site.navLinks, { label: 'Contact', href: '/contact.html' }];
  const serviceCurrent = services.some(link => isCurrentLink(link, slug));

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', mobileOpen);
    if (mobileOpen && headerRef.current) headerRef.current.style.setProperty('--mobile-nav-top', `${headerRef.current.getBoundingClientRect().bottom}px`);
    return () => document.body.classList.remove('mobile-menu-open');
  }, [mobileOpen]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileOpen(false); setDesktopServicesOpen(false); setMobileServicesOpen(false); }
    };
    const onClick = (event: MouseEvent) => {
      if (desktopServicesRef.current && !desktopServicesRef.current.contains(event.target as Node)) setDesktopServicesOpen(false);
    };
    const onResize = () => { if (innerWidth > 820) setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); window.removeEventListener('resize', onResize); };
  }, []);

  const serviceButton = (mobile: boolean) => <button
    type="button"
    className={`${mobile ? 'mobile-services-toggle' : 'nav-services-toggle'}${serviceCurrent ? ' is-current' : ''}`}
    aria-controls={mobile ? 'mobile-services-menu' : 'desktop-services-menu'}
    aria-expanded={mobile ? mobileServicesOpen : desktopServicesOpen}
    onClick={() => mobile ? setMobileServicesOpen(value => !value) : setDesktopServicesOpen(value => !value)}
  >Services {icon('expand_more')}</button>;
  const serviceMenu = (mobile: boolean) => <div className={mobile ? 'mobile-services-menu' : 'services-menu'} id={mobile ? 'mobile-services-menu' : 'desktop-services-menu'} hidden={mobile ? !mobileServicesOpen : !desktopServicesOpen}>
    {services.map(link => <a href={link.href} key={`${mobile ? 'm' : 'd'}-${link.href}`} aria-current={isCurrentLink(link, slug) ? 'page' : undefined}>{link.label}{!mobile && icon('arrow_outward')}</a>)}
  </div>;

  return <header className="site-header" id="site-header" ref={headerRef}>
    <div className="hs-container header-inner">
      <a className="brand" href="/index.html" aria-label={`${site.brandName} home`}><BrandLogo lightPath={site.logoPath} darkPath={site.darkLogoPath} alt={site.brandName} /></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {site.navLinks.map(link => link.label.toLowerCase() === 'services'
          ? <div className="nav-services" key={link.href} ref={desktopServicesRef}>{serviceButton(false)}{serviceMenu(false)}</div>
          : <a href={link.href} key={link.href} aria-current={isCurrentLink(link, slug) ? 'page' : undefined}>{link.label}</a>)}
      </nav>
      <ThemeToggle className="site-theme-toggle" />
      <a className="header-action" href={site.headerCtaHref}>{site.headerCtaLabel} {icon('arrow_outward')}</a>
      <button className="menu-toggle" type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-controls="mobile-nav" aria-expanded={mobileOpen} onClick={() => { setMobileOpen(value => !value); setMobileServicesOpen(false); }}>
        {icon(mobileOpen ? 'close' : 'menu')}
      </button>
    </div>
    <nav id="mobile-nav" className={`mobile-nav${mobileOpen ? ' open' : ''}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen} inert={!mobileOpen}>
      {mobileLinks.map(link => link.label.toLowerCase() === 'services'
        ? <div className="mobile-services" key={link.href}><div className="mobile-services-row">{serviceButton(true)}</div>{serviceMenu(true)}</div>
        : <a href={link.href} key={link.href} aria-current={isCurrentLink(link, slug) ? 'page' : undefined}>{link.label}</a>)}
    </nav>
  </header>;
}

