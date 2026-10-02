import type { SiteSettings } from '../../types';
import { ImageUploadField } from '../ImageUploadField';

const fields: { key: keyof SiteSettings; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: 'brandName', label: 'Company name', placeholder: 'e.g. HornSphere Consulting' },
  { key: 'tagline', label: 'Brand line', placeholder: 'A short line about your organisation' },
  { key: 'footerIntro', label: 'Footer introduction', placeholder: 'Briefly describe your work and location.', multiline: true },
  { key: 'address', label: 'Office address', placeholder: 'District, city, country' },
  { key: 'email', label: 'Contact email', placeholder: 'office@example.com' },
  { key: 'phoneDisplay', label: 'Displayed phone number', placeholder: '+252 61 0000000' },
  { key: 'phoneE164', label: 'Telephone link (international format)', placeholder: '+252610000000' },
  { key: 'whatsappPhone', label: 'WhatsApp number (digits only)', placeholder: '252610000000' },
  { key: 'whatsappSubtitle', label: 'WhatsApp subtitle', placeholder: 'How can we help?' },
  { key: 'whatsappGreeting', label: 'WhatsApp greeting', placeholder: 'Welcome! Tell us how we can help.', multiline: true },
  { key: 'headerCtaLabel', label: 'Header button text', placeholder: 'Start a conversation' },
  { key: 'headerCtaHref', label: 'Header button link', placeholder: '/contact.html#contact-form' },
];

type Props = {
  site: SiteSettings;
  onField: (key: keyof SiteSettings, value: string) => void;
  onUpload: (file: File, key: 'logoPath' | 'darkLogoPath' | 'iconPath') => void;
};

export function BrandAndContact({ site, onField, onUpload }: Props) {
  return <>
    <div className="cms-card"><h2>Brand assets</h2><p className="cms-brand-hint">Upload a logo for each appearance. Until a dark mode logo is added, the current logo appears in white in dark mode.</p><div className="cms-two-cols">
      <ImageUploadField label="Light mode logo" imageUrl={site.logoPath} onUpload={file => onUpload(file, 'logoPath')} />
      <ImageUploadField label="Dark mode logo" imageUrl={site.darkLogoPath || ''} onUpload={file => onUpload(file, 'darkLogoPath')} />
      <ImageUploadField label="Icon logo" imageUrl={site.iconPath} onUpload={file => onUpload(file, 'iconPath')} />
    </div></div>
    <div className="cms-card"><h2>Company and contact</h2><div className="cms-two-cols">
      {fields.map(field => <label key={field.key}>{field.label}{field.multiline
        ? <textarea rows={3} placeholder={field.placeholder} value={String(site[field.key])} onChange={event => onField(field.key, event.target.value)} />
        : <input placeholder={field.placeholder} value={String(site[field.key])} onChange={event => onField(field.key, event.target.value)} />}
      </label>)}
    </div></div>
  </>;
}
