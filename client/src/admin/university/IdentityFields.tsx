import type { University } from '../../types';
import { ImageUploadField } from '../ImageUploadField';
import type { UniversityFieldSetter } from './types';

export function IdentityFields({ university, isNew, setField, uploadLogo }: { university: University; isNew: boolean; setField: UniversityFieldSetter; uploadLogo: (file: File) => void }) {
  return <div className="cms-card"><h2>Identity</h2><div className="cms-two-cols">
    <label>Name<input required minLength={2} maxLength={160} placeholder="e.g. Universiti Putra Malaysia" value={university.name} onChange={event => setField('name', event.target.value)} /></label>
    <label>URL slug<input required pattern="[a-z0-9-]{2,80}" title="Use 2–80 lowercase letters, numbers, or hyphens." value={university.slug} disabled={!isNew} onChange={event => setField('slug', event.target.value)} placeholder="e.g. universiti-putra-malaysia" /></label>
    <label>Type<select value={university.type} onChange={event => setField('type', event.target.value as University['type'])}><option>Public</option><option>Private</option><option>Other</option></select></label>
    <label>City<input required placeholder="e.g. Selangor" value={university.city} onChange={event => setField('city', event.target.value)} /></label>
    <label>Country<input required placeholder="e.g. Malaysia" value={university.country} onChange={event => setField('country', event.target.value)} /></label>
    <label>Official website<input required type="url" pattern="https://.*" title="Use a secure HTTPS website URL." value={university.website} onChange={event => setField('website', event.target.value)} placeholder="https://www.university.edu" /></label>
    <ImageUploadField label="University logo" imageUrl={university.logoUrl} onUpload={uploadLogo} />
    <label className="cms-wide">Description<textarea rows={5} placeholder="Describe the university, its strengths, and the support available to international students." value={university.description} onChange={event => setField('description', event.target.value)} /></label>
  </div></div>;
}
