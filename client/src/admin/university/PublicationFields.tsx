import type { University } from '../../types';
import { Badge } from '../../components/ui/badge';
import type { UniversityFieldSetter } from './types';
import { isPublishedUniversity, universityStatus } from './status';

export function PublicationFields({ university, setField }: { university: University; setField: UniversityFieldSetter }) {
  const status = universityStatus(university);
  return <div className="cms-card cms-publication-card" id="publication-status">
    <div className="cms-publication-heading"><h2>Publication status</h2><span>After saving: <Badge variant={isPublishedUniversity(university) ? 'secondary' : 'outline'} className={status.className}>{status.label}</Badge></span></div>
    <p>Confirm details with the university or an official source before publishing.</p>
    <div className="cms-two-cols"><label>Last verified on<input type="date" required={university.published} value={university.verifiedAt?.slice(0, 10) || ''} onChange={event => setField('verifiedAt', event.target.value || null)} /></label><label className="cms-check"><input type="checkbox" checked={university.published} onChange={event => setField('published', event.target.checked)} /> Publish listing</label></div>
    <p>Only listings with a verification date and Publish listing enabled appear in Study abroad.</p>
  </div>;
}
