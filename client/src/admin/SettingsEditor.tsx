import { useEffect, useState } from 'react';
import { api, sendJson } from '../api';
import { Button } from '../components/ui/button';
import type { SiteSettings } from '../types';
import { uploadImage } from './upload';
import { BrandAndContact } from './settings/BrandAndContact';
import { NavigationEditor } from './settings/NavigationEditor';
import { FooterEditor } from './settings/FooterEditor';
import { useConfirm } from './ConfirmProvider';

export function SettingsEditor() {
  const confirmAction = useConfirm();
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { api<SiteSettings>('/admin/settings').then(setSite).catch(error => setMessage(error.message)); }, []);
  if (!site) return <div className="cms-empty">{message || 'Loading settings…'}</div>;

  const setField = (key: keyof SiteSettings, value: string) => setSite({ ...site, [key]: value });
  const save = async () => {
    if (!await confirmAction({ title: 'Save site settings?', description: 'Brand, contact, navigation and footer changes will appear across the public website.', confirmLabel: 'Save settings' })) return;
    setSaving(true); setMessage('');
    try { const result = await sendJson<SiteSettings>('/admin/settings', 'PUT', site); setSite(result); window.dispatchEvent(new CustomEvent('hornsphere:brand-updated', { detail: result })); setMessage('Site settings saved. Reload the public site to see the changes.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Save failed.'); }
    finally { setSaving(false); }
  };
  const uploadBrand = async (file: File, key: 'logoPath' | 'darkLogoPath' | 'iconPath') => {
    if (!await confirmAction({ title: 'Upload this brand image?', description: 'The image will be stored now. Save site settings to use it on the website.', confirmLabel: 'Upload image' })) return;
    try { const result = await uploadImage(file); setField(key, result.url); setMessage('Image uploaded. Save settings to use it.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  return <div className="cms-form-page">
    <div className="cms-page-editor-head"><div><span className="cms-kicker">SHARED CONTENT</span><h1>Site settings</h1><p>Update the brand, contact details, navigation and footer.</p></div><Button type="button" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save settings'}</Button></div>
    {message && <p className="cms-notice" role="status">{message}</p>}
    <BrandAndContact site={site} onField={setField} onUpload={(file, key) => void uploadBrand(file, key)} />
    <NavigationEditor site={site} onChange={setSite} />
    <FooterEditor site={site} onChange={setSite} />
  </div>;
}
