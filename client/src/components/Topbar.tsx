import type { SiteSettings } from '../types';
import { icon } from './Icon';

export function Topbar({ site }: { site: SiteSettings }) {
  return <div className="hc-topbar"><div className="hs-container">
    <span>{icon('location_on')} {site.address}</span>
    <div><a href={`mailto:${site.email}`}>{icon('mail')} {site.email}</a><a href={`tel:${site.phoneE164}`}>{icon('call')} {site.phoneDisplay}</a></div>
  </div></div>;
}

