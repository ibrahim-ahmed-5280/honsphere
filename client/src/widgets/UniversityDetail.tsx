import { useEffect, useState } from 'react';
import { api } from '../api';
import type { University } from '../types';
import { icon } from '../components/Icon';
import { money, guidanceHref, UniversityMark } from './study';

export function UniversityDetail() {
  const slug = new URLSearchParams(location.search).get('university') || '';
  const [university, setUniversity] = useState<University | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!slug) { setError('Choose a study option from the search page.'); return; }
    api<University>(`/universities/${encodeURIComponent(slug)}`).then(setUniversity).catch(cause => setError(cause.message));
  }, [slug]);
  if (error) return <><a className="detail-back" href="/education.html#search">{icon('arrow_back')} Back to study options</a><h1>Study option not found.</h1><p>{error}</p></>;
  if (!university) return <p role="status">Loading study option…</p>;
  const u = university;
  const verified = u.verifiedAt ? new Date(u.verifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return <>
    <a className="detail-back" href="/education.html#search">{icon('arrow_back')} Back to study options</a>
    <div className="university-detail-heading"><span className="uni-logo-link uni-detail-logo"><UniversityMark university={u} /></span><div><span className="eyebrow">International student recruitment</span><h1>{u.name}</h1><p>{u.city}, {u.country}</p></div><span className="uni-type">{u.type} university</span></div>
    <p className="detail-disclaimer">Information last verified {verified}. Confirm programme fees, intakes and entry requirements before applying.</p>
    {u.description && <p className="detail-intro">{u.description}</p>}
    <div className="detail-facts">
      <div><span>Qualification levels</span><p>{u.levels.join(' · ') || 'Ask an advisor'}</p></div>
      <div><span>Fields of study</span><p>{u.fields.join(' · ') || 'Ask an advisor'}</p></div>
      <div><span>Tuition</span><p>{u.tuitionFrom != null ? `From ${money(u.tuitionFrom, u.tuitionCurrency)} per year` : 'Varies by programme'}{u.tuitionNote ? ` · ${u.tuitionNote}` : ''}</p></div>
      <div><span>Intakes</span><p>{u.intakes || 'Confirm current dates with an advisor.'}</p></div>
      <div><span>Entry requirements</span><p>{u.entryRequirements || 'Requirements depend on the programme.'}</p></div>
      <div><span>How HornSphere helps</span><p>Programme choice, eligibility, application documents and next steps.</p></div>
    </div>
    {u.programmes.length > 0 && <section className="uni-programmes"><h2>Programmes</h2><div className="uni-programmes-grid">{u.programmes.map((programme, index) => <article key={`${programme.name}-${index}`}><span>{programme.level} · {programme.field}</span><h3>{programme.name}</h3>{programme.tuition != null && <p>{money(programme.tuition, programme.currency)} tuition</p>}{programme.duration && <p>Duration: {programme.duration}</p>}{programme.intake && <p>Intake: {programme.intake}</p>}{programme.requirements && <p>{programme.requirements}</p>}</article>)}</div></section>}
    <div className="detail-actions"><a className="btn btn-navy" href={guidanceHref(u.slug)}>Get guidance {icon('arrow_forward')}</a><a className="btn detail-official" href={u.website} target="_blank" rel="noopener noreferrer">Official website {icon('arrow_outward')}</a></div>
  </>;
}

