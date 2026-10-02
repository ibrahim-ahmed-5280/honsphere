import type { FooterGroup, Link, SiteSettings } from '../../types';
import { useConfirm } from '../ConfirmProvider';

export function FooterEditor({ site, onChange }: { site: SiteSettings; onChange: (site: SiteSettings) => void }) {
  const confirmAction = useConfirm();
  const updateGroups = (footerGroups: FooterGroup[]) => onChange({ ...site, footerGroups });
  const updateGroup = (index: number, group: FooterGroup) => updateGroups(site.footerGroups.map((item, at) => at === index ? group : item));
  const updateLink = (groupIndex: number, linkIndex: number, key: keyof Link, value: string) => {
    const group = site.footerGroups[groupIndex];
    updateGroup(groupIndex, { ...group, links: group.links.map((link, at) => at === linkIndex ? { ...link, [key]: value } : link) });
  };
  const addGroup = async () => {
    if (!await confirmAction({ title: 'Add a footer group?', description: 'A new group will be added to the editor. Save site settings to publish it.', confirmLabel: 'Add group' })) return;
    updateGroups([...site.footerGroups, { title: '', links: [] }]);
  };
  const addLink = async (index: number) => {
    if (!await confirmAction({ title: 'Add a footer link?', description: 'A new link will be added to this group. Save site settings to publish it.', confirmLabel: 'Add link' })) return;
    const group = site.footerGroups[index];
    updateGroup(index, { ...group, links: [...group.links, { label: '', href: '' }] });
  };
  const removeGroup = async (index: number) => {
    if (!await confirmAction({ title: 'Remove this footer group?', description: 'This group and its links will be removed from the editor. Save site settings to apply the change.', confirmLabel: 'Remove group', destructive: true })) return;
    updateGroups(site.footerGroups.filter((_, at) => at !== index));
  };
  const removeLink = async (groupIndex: number, linkIndex: number) => {
    if (!await confirmAction({ title: 'Remove this footer link?', description: 'The link will be removed from the editor. Save site settings to apply the change.', confirmLabel: 'Remove link', destructive: true })) return;
    const group = site.footerGroups[groupIndex];
    updateGroup(groupIndex, { ...group, links: group.links.filter((_, at) => at !== linkIndex) });
  };
  return <div className="cms-card">
    <div className="cms-section-toolbar"><h2>Footer groups</h2><button type="button" onClick={() => void addGroup()}>+ Add group</button></div>
    {site.footerGroups.map((group, groupIndex) => <div className="cms-footer-group" key={groupIndex}>
      <div className="cms-section-toolbar">
        <input aria-label={`Footer group ${groupIndex + 1}`} placeholder="Group title" value={group.title} onChange={event => updateGroup(groupIndex, { ...group, title: event.target.value })} />
        <button type="button" onClick={() => void addLink(groupIndex)}>+ Link</button>
        <button type="button" onClick={() => void removeGroup(groupIndex)}>Remove group</button>
      </div>
      <div className="cms-link-list">{group.links.map((link, linkIndex) => <div className="cms-link-row" key={linkIndex}>
        <input aria-label="Link label" placeholder="Label" value={link.label} onChange={event => updateLink(groupIndex, linkIndex, 'label', event.target.value)} />
        <input aria-label="Link URL" placeholder="/page.html" value={link.href} onChange={event => updateLink(groupIndex, linkIndex, 'href', event.target.value)} />
        <button type="button" aria-label={`Remove ${link.label || 'link'}`} onClick={() => void removeLink(groupIndex, linkIndex)}>×</button>
      </div>)}</div>
    </div>)}
  </div>;
}
