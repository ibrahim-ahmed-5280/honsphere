import type { Link, SiteSettings } from '../../types';
import { useConfirm } from '../ConfirmProvider';

function LinkList({ title, description, links, onChange }: { title: string; description?: string; links: Link[]; onChange: (links: Link[]) => void }) {
  const confirmAction = useConfirm();
  const update = (index: number, key: keyof Link, value: string) => onChange(links.map((link, at) => at === index ? { ...link, [key]: value } : link));
  const add = async () => {
    if (!await confirmAction({ title: 'Add a navigation link?', description: `A new link will be added to ${title.toLowerCase()}. Save site settings to publish it.`, confirmLabel: 'Add link' })) return;
    onChange([...links, { label: '', href: '' }]);
  };
  const remove = async (index: number) => {
    if (!await confirmAction({ title: 'Remove this link?', description: 'The link will be removed from the editor. Save site settings to apply the change.', confirmLabel: 'Remove link', destructive: true })) return;
    onChange(links.filter((_, at) => at !== index));
  };
  return <div className="cms-card">
    <div className="cms-section-toolbar"><h2>{title}</h2><button type="button" onClick={() => void add()}>+ Add link</button></div>
    {description && <p>{description}</p>}
    <div className="cms-link-list">{links.map((link, index) => <div className="cms-link-row" key={index}>
      <input aria-label={`${title} label ${index + 1}`} placeholder="Label" value={link.label} onChange={event => update(index, 'label', event.target.value)} />
      <input aria-label={`${title} URL ${index + 1}`} placeholder="/page.html" value={link.href} onChange={event => update(index, 'href', event.target.value)} />
      <button type="button" aria-label={`Remove ${link.label || 'link'}`} onClick={() => void remove(index)}>×</button>
    </div>)}</div>
  </div>;
}

export function NavigationEditor({ site, onChange }: { site: SiteSettings; onChange: (site: SiteSettings) => void }) {
  return <>
    <LinkList title="Main navigation" links={site.navLinks} onChange={navLinks => onChange({ ...site, navLinks })} />
    <LinkList title="Services dropdown" description="These links appear under Services in the desktop and mobile menus." links={site.serviceLinks} onChange={serviceLinks => onChange({ ...site, serviceLinks })} />
  </>;
}
