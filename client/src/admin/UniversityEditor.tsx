import { useEffect, useState, type FormEvent } from 'react';
import { api, sendJson } from '../api';
import { Button } from '../components/ui/button';
import type { Programme, University } from '../types';
import { uploadImage } from './upload';
import { IdentityFields } from './university/IdentityFields';
import { ProgrammeFields } from './university/ProgrammeFields';
import { PublicationFields } from './university/PublicationFields';
import { StudyFields } from './university/StudyFields';
import { freshUniversity, joinCsv, parseCsv } from './university/types';
import { useConfirm } from './ConfirmProvider';

type Props = { slug: string; onBack: () => void; presentation?: 'page' | 'dialog'; onCreated?: (university: University) => void };

export function UniversityEditor({ slug, onBack, presentation = 'page', onCreated }: Props) {
  const confirmAction = useConfirm();
  const isNew = slug === 'new';
  const [university, setUniversity] = useState<University>(freshUniversity);
  const [levelsText, setLevelsText] = useState('');
  const [fieldsText, setFieldsText] = useState('');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'notice' | 'alert'>('notice');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!isNew) api<University>(`/admin/universities/${encodeURIComponent(slug)}`).then(result => { setUniversity(result); setLevelsText(joinCsv(result.levels)); setFieldsText(joinCsv(result.fields)); }).catch(error => { setMessageTone('alert'); setMessage(error.message); }); }, [isNew, slug]);

  const setField = <K extends keyof University>(key: K, value: University[K]) => setUniversity(current => ({ ...current, [key]: value }));
  const updateProgramme = <K extends keyof Programme>(index: number, key: K, value: Programme[K]) => setField('programmes', university.programmes.map((item, at) => at === index ? { ...item, [key]: value } : item));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!await confirmAction({
      title: isNew ? 'Create this university?' : 'Save university changes?',
      description: university.published && university.verifiedAt ? 'The updated listing will appear in Study abroad immediately.' : 'The listing will remain unpublished until it has a verification date and is published.',
      confirmLabel: isNew ? 'Create university' : 'Save changes',
    })) return;
    setBusy(true); setMessage('');
    try {
      const data = { ...university, levels: parseCsv(levelsText), fields: parseCsv(fieldsText), slug: university.slug.trim().toLowerCase().replace(/\s+/g, '-'), verifiedAt: university.verifiedAt ? new Date(university.verifiedAt).toISOString() : null };
      const result = await sendJson<University>(isNew ? '/admin/universities' : `/admin/universities/${encodeURIComponent(slug)}`, isNew ? 'POST' : 'PUT', data);
      setUniversity(result); setMessageTone('notice'); setMessage('University saved. Published records appear in Study abroad.');
      if (isNew) {
        if (onCreated) onCreated(result);
        else location.href = `/admin/universities/${result.slug}`;
      }
    } catch (error) { setMessageTone('alert'); setMessage(error instanceof Error ? error.message : 'Save failed.'); }
    finally { setBusy(false); }
  };

  const uploadLogo = async (file: File) => {
    if (!await confirmAction({ title: 'Upload this university logo?', description: 'The image will be stored now. Save the listing to use it.', confirmLabel: 'Upload logo' })) return;
    try { const result = await uploadImage(file); setField('logoUrl', result.url); setMessageTone('notice'); setMessage('Logo uploaded. Save the listing to use it.'); }
    catch (error) { setMessageTone('alert'); setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
  };

  const details = <>
    <IdentityFields university={university} isNew={isNew} setField={setField} uploadLogo={uploadLogo} />
    <StudyFields university={university} levelsText={levelsText} fieldsText={fieldsText} setLevelsText={setLevelsText} setFieldsText={setFieldsText} setField={setField} />
    <ProgrammeFields university={university} setField={setField} updateProgramme={updateProgramme} />
  </>;
  const publication = <PublicationFields university={university} setField={setField} />;

  if (presentation === 'dialog') return <form className="cms-form-page cms-university-modal-form" onSubmit={event => void save(event)}>
    <div className="cms-university-modal-scroll">
      {message && <p className={messageTone === 'alert' ? 'cms-alert' : 'cms-notice'} role={messageTone === 'alert' ? 'alert' : 'status'}>{message}</p>}
      {details}
      {publication}
    </div>
    <div className="cms-university-modal-actions"><Button type="button" variant="outline" onClick={onBack}>Cancel</Button><Button className="cms-create-university-button" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create university'}</Button></div>
  </form>;

  return <form className="cms-form-page" onSubmit={event => void save(event)}>
    <div className="cms-page-editor-head"><div><button className="cms-text-button" type="button" onClick={onBack}>← Universities</button><h1>{isNew ? 'Add university' : university.name}</h1><p>Set the verification date and publication status below, then save the listing.</p></div><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save university'}</Button></div>
    {message && <p className={messageTone === 'alert' ? 'cms-alert' : 'cms-notice'} role={messageTone === 'alert' ? 'alert' : 'status'}>{message}</p>}
    {publication}
    {details}
  </form>;
}
