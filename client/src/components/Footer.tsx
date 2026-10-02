import type { SiteSettings } from '../types';

export function Footer({ site }: { site: SiteSettings }) {
  return <footer className="site-footer" id="site-footer">
    <div className="hs-container footer-grid">
      <div className="footer-lead"><a className="footer-logo" href="/index.html"><img src={site.iconPath} alt="" width="46" height="46" /><span>{site.brandName.split(' ')[0]}</span></a><p>{site.tagline}</p><span>{site.footerIntro}</span></div>
      {site.footerGroups.map(group => <div className="footer-col" key={group.title}><h3>{group.title}</h3>{group.links.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}</div>)}
    </div>
    <div className="hs-container footer-bottom"><span>© {new Date().getFullYear()} {site.brandName} · {site.address}</span><span><a href={`mailto:${site.email}`}>{site.email}</a><a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a></span></div>
  </footer>;
}

