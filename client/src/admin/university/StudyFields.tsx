import type { University } from '../../types';
import type { UniversityFieldSetter } from './types';

export function StudyFields({ university, levelsText, fieldsText, setLevelsText, setFieldsText, setField }: { university: University; levelsText: string; fieldsText: string; setLevelsText: (value: string) => void; setFieldsText: (value: string) => void; setField: UniversityFieldSetter }) {
  return <div className="cms-card"><h2>Study information</h2><div className="cms-two-cols">
    <label>Qualification levels (comma separated)<input placeholder="Foundation, Bachelor's, Master's" value={levelsText} onChange={event => setLevelsText(event.target.value)} /></label>
    <label>Fields of study (comma separated)<input placeholder="Business, Engineering, Health Sciences" value={fieldsText} onChange={event => setFieldsText(event.target.value)} /></label>
    <label>Lowest verified yearly tuition<input type="number" min="0" placeholder="e.g. 5200" value={university.tuitionFrom ?? ''} onChange={event => setField('tuitionFrom', event.target.value ? Number(event.target.value) : null)} /></label>
    <label>Tuition currency<input placeholder="e.g. USD" value={university.tuitionCurrency} onChange={event => setField('tuitionCurrency', event.target.value.toUpperCase())} /></label>
    <label className="cms-wide">Tuition note<textarea rows={2} placeholder="Explain what the tuition estimate covers and when it was checked." value={university.tuitionNote} onChange={event => setField('tuitionNote', event.target.value)} /></label>
    <label>Intakes<textarea rows={3} placeholder="e.g. February and September; confirm dates with the university." value={university.intakes} onChange={event => setField('intakes', event.target.value)} /></label>
    <label>Entry and English requirements<textarea rows={3} placeholder="Summarise programme-specific entry and English language requirements." value={university.entryRequirements} onChange={event => setField('entryRequirements', event.target.value)} /></label>
  </div></div>;
}
