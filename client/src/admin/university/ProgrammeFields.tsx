import type { University } from '../../types';
import { freshProgramme, type ProgrammeFieldSetter, type UniversityFieldSetter } from './types';
import { useConfirm } from '../ConfirmProvider';

export function ProgrammeFields({ university, setField, updateProgramme }: { university: University; setField: UniversityFieldSetter; updateProgramme: ProgrammeFieldSetter }) {
  const confirmAction = useConfirm();
  const addProgramme = async () => {
    if (!await confirmAction({ title: 'Add a programme?', description: 'A new programme will be added to this listing. Save the university when its details are ready.', confirmLabel: 'Add programme' })) return;
    setField('programmes', [...university.programmes, { ...freshProgramme }]);
  };
  const removeProgramme = async (index: number) => {
    if (!await confirmAction({ title: 'Remove this programme?', description: 'The programme will be removed from the editor. Save the university to apply the change.', confirmLabel: 'Remove programme', destructive: true })) return;
    setField('programmes', university.programmes.filter((_, at) => at !== index));
  };
  return <div className="cms-card"><div className="cms-section-toolbar"><h2>Programmes</h2><button type="button" onClick={() => void addProgramme()}>+ Add programme</button></div><p>Use programme-specific fees and requirements when they are available.</p>{university.programmes.map((programme, index) => <div className="cms-programme" key={index}><div className="cms-section-toolbar"><h3>Programme {index + 1}</h3><button type="button" onClick={() => void removeProgramme(index)}>Remove</button></div><div className="cms-two-cols">
    <label>Name<input required placeholder="e.g. Bachelor of Business Administration" value={programme.name} onChange={event => updateProgramme(index, 'name', event.target.value)} /></label>
    <label>Level<input required placeholder="e.g. Bachelor's" value={programme.level} onChange={event => updateProgramme(index, 'level', event.target.value)} /></label>
    <label>Field<input required placeholder="e.g. Business" value={programme.field} onChange={event => updateProgramme(index, 'field', event.target.value)} /></label>
    <label>Tuition<input type="number" min="0" placeholder="e.g. 6500" value={programme.tuition ?? ''} onChange={event => updateProgramme(index, 'tuition', event.target.value ? Number(event.target.value) : null)} /></label>
    <label>Currency<input placeholder="e.g. USD" value={programme.currency} onChange={event => updateProgramme(index, 'currency', event.target.value.toUpperCase())} /></label>
    <label>Duration<input placeholder="e.g. 3 years" value={programme.duration} onChange={event => updateProgramme(index, 'duration', event.target.value)} /></label>
    <label>Intake<input placeholder="e.g. September" value={programme.intake} onChange={event => updateProgramme(index, 'intake', event.target.value)} /></label>
    <label>Requirements<textarea rows={2} placeholder="List academic and English language requirements for this programme." value={programme.requirements} onChange={event => updateProgramme(index, 'requirements', event.target.value)} /></label>
  </div></div>)}</div>;
}
