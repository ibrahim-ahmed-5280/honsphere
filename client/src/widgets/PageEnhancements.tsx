import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UniversitySearch } from './UniversitySearch';
import { UniversityDetail } from './UniversityDetail';
import { useContactForm } from './useContactForm';

export function PageEnhancements({ slug, html }: { slug: string; html: string }) {
  const [resultsMount, setResultsMount] = useState<HTMLElement | null>(null);
  const [detailMount, setDetailMount] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState(new URLSearchParams());
  useEffect(() => {
    setResultsMount(document.getElementById('university-results'));
    setDetailMount(document.getElementById('university-detail'));
    const search = document.getElementById('university-search') as HTMLFormElement | null;
    if (!search) return;
    const onSubmit = (event: Event) => {
      event.preventDefault();
      const form = new FormData(search);
      const query = new URLSearchParams();
      for (const [key, value] of form) if (typeof value === 'string' && value) query.set(key === 'location' ? 'city' : key, value);
      setFilters(query);
    };
    const onReset = () => setTimeout(() => setFilters(new URLSearchParams()), 0);
    search.addEventListener('submit', onSubmit);
    search.addEventListener('reset', onReset);
    return () => { search.removeEventListener('submit', onSubmit); search.removeEventListener('reset', onReset); };
  }, [slug, html]);

  useContactForm(slug, html);


  return <>
    {resultsMount && createPortal(<UniversitySearch filters={filters} />, resultsMount)}
    {detailMount && createPortal(<UniversityDetail />, detailMount)}
  </>;
}

