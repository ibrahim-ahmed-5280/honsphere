import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Plus, Search } from 'lucide-react';
import { api } from '../../api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Page } from '../../types';

export function PagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api<Page[]>('/admin/pages').then(setPages).catch(cause => setError(cause.message)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => pages.filter(page =>
    (filter === 'all' || (filter === 'published' ? page.published : !page.published)) &&
    `${page.title} ${page.slug}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [pages, filter, query]);
  const published = pages.filter(page => page.published).length;
  return <div className="cms-form-page">
    <div className="cms-page-editor-head"><div><span className="cms-kicker">WEBSITE CONTENT</span><h1>Pages</h1><p>Edit content and control which pages are live.</p></div><Button asChild><Link to="/admin/pages/new"><Plus size={16} aria-hidden="true" /> New page</Link></Button></div>
    {error && <p className="cms-alert" role="alert">{error}</p>}
    <div className="cms-listing">
      <div className="cms-listing-toolbar">
        <div className="cms-search"><Search size={17} aria-hidden="true" /><Input aria-label="Search pages" placeholder="Search pages" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <div className="cms-filter-group" role="group" aria-label="Filter pages">{([['all', 'All', pages.length], ['published', 'Published', published], ['draft', 'Drafts', pages.length - published]] as const).map(([key, label, count]) => <button key={key} type="button" className={filter === key ? 'active' : ''} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}<span>{count}</span></button>)}</div>
      </div>
      <div className="cms-table-head"><span>Page</span><span>Status</span><span>Last updated</span><span className="sr-only">Open</span></div>
      {visible.length ? visible.map(page => <Link className="cms-table-row" to={`/admin/pages/${page.slug}`} key={page.slug}>
        <span className="cms-row-primary"><span className="cms-row-icon"><FileText size={17} aria-hidden="true" /></span><span><strong>{page.title}</strong><small>/{page.slug}.html</small></span></span>
        <span><Badge variant={page.published ? 'secondary' : 'outline'} className={page.published ? 'cms-badge-live' : 'cms-badge-draft'}>{page.published ? 'Published' : 'Draft'}</Badge></span>
        <span className="cms-row-date">{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'Not yet updated'}</span>
        <ArrowRight size={17} className="cms-row-arrow" aria-hidden="true" />
      </Link>) : <div className="cms-list-empty">{loading ? 'Loading pages…' : pages.length ? 'No pages match your search.' : 'No pages yet. Create the first page to get started.'}</div>}
    </div>
  </div>;
}
