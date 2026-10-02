import { useEffect, useState } from 'react';
import { api } from '../api';
import type { University } from '../types';
import { icon } from '../components/Icon';
import { money, detailHref, guidanceHref, UniversityMark } from './study';

type UniversityList = { items: University[]; total: number; page: number; pages: number };

export function UniversitySearch({ filters }: { filters: URLSearchParams }) {
  const [data, setData] = useState<UniversityList | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const filterKey = filters.toString();
  useEffect(() => setPage(1), [filterKey]);
  useEffect(() => {
    let alive = true;
    const query = new URLSearchParams(filterKey);
    query.set('page', String(page));
    api<UniversityList>(`/universities?${query}`).then(result => { if (alive) { setData(result); setError(''); } }).catch(cause => { if (alive) setError(cause.message); });
    return () => { alive = false; };
  }, [filterKey, page]);
  useEffect(() => {
    const count = document.getElementById('result-count');
    if (count) count.textContent = data ? `${data.total} study ${data.total === 1 ? 'option' : 'options'} shown` : 'Loading study options…';
  }, [data]);
  if (error) return <div className="no-results"><h3>Study options are unavailable.</h3><p>{error}</p></div>;
  if (!data) return <div className="no-results" role="status">Loading verified study options…</div>;
  if (!data.items.length) return <div className="no-results">{icon('search_off')}<h3>No verified listings match these filters.</h3><p>Adjust your filters or <a href="/contact.html?route=student#contact-form">ask an advisor</a> for current options.</p></div>;
  return <>
    {data.items.map(university => <article className="university-card" key={university.slug}>
      <div className="uni-top"><a className="uni-logo-link" href={detailHref(university.slug)} aria-label={`View ${university.name}`}><UniversityMark university={university} /></a><span className="uni-type">{university.type}</span></div>
      <h3><a href={detailHref(university.slug)}>{university.name}</a></h3><p className="location">{university.city}, {university.country}</p>
      <div className="uni-tags">{university.levels.slice(0, 3).map(level => <span key={level}>{level}</span>)}</div>
      <div className="uni-fee"><strong>{university.tuitionFrom != null ? `From ${money(university.tuitionFrom, university.tuitionCurrency)}` : 'Ask for current fees'}</strong><span>{university.tuitionNote || 'Fees depend on the programme. Confirm before applying.'}</span></div>
      <div className="uni-actions"><a className="btn uni-view" href={detailHref(university.slug)}>View details</a><a className="btn btn-navy" href={guidanceHref(university.slug)}>Get guidance</a></div>
    </article>)}
    {data.pages > 1 && <div className="study-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {data.page} of {data.pages}</span><button type="button" disabled={page >= data.pages} onClick={() => setPage(value => value + 1)}>Next</button></div>}
  </>;
}

