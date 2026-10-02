import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search } from 'lucide-react';
import { api } from '../../api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { University } from '../../types';
import { CreateUniversityDialog } from '../university/CreateUniversityDialog';
import { isPublishedUniversity, universityStatus } from '../university/status';

export function UniversitiesList() {
  const [items, setItems] = useState<University[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'not-live'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => { api<University[]>('/admin/universities').then(setItems).catch(cause => setError(cause.message)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => items.filter(item =>
    (filter === 'all' || (filter === 'published' ? isPublishedUniversity(item) : !isPublishedUniversity(item))) &&
    `${item.name} ${item.city} ${item.country}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [items, filter, query]);
  const published = items.filter(isPublishedUniversity).length;
  const created = (university: University) => {
    setItems(current => [...current, university].sort((a, b) => a.name.localeCompare(b.name)));
    setCreateOpen(false);
    setNotice(`${university.name} was created. Open Edit to review or update its details.`);
  };
  return <div className="cms-form-page">
    <div className="cms-page-editor-head"><div><span className="cms-kicker">STUDY ABROAD</span><h1>Universities</h1><p>Drafts stay off the public site. Open Edit to add a verification date and publish a listing.</p></div><Button className="cms-create-university-button" type="button" onClick={() => setCreateOpen(true)}><Plus size={16} aria-hidden="true" /> Create university</Button></div>
    {error && <p className="cms-alert" role="alert">{error}</p>}
    {notice && <p className="cms-notice" role="status">{notice}</p>}
    <div className="cms-listing">
      <div className="cms-listing-toolbar">
        <div className="cms-search"><Search size={17} aria-hidden="true" /><Input aria-label="Search universities" placeholder="Search universities" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <div className="cms-filter-group" role="group" aria-label="Filter universities">{([['all', 'All', items.length], ['published', 'Published', published], ['not-live', 'Not live', items.length - published]] as const).map(([key, label, count]) => <button key={key} type="button" className={filter === key ? 'active' : ''} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}<span>{count}</span></button>)}</div>
      </div>
      {visible.length ? <div className="cms-university-table-scroll" role="region" aria-label="Universities table" tabIndex={0}>
        <table className="cms-university-table">
          <thead><tr><th scope="col">University</th><th scope="col">Location</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Last verified</th><th scope="col" aria-label="Actions" /></tr></thead>
          <tbody>{visible.map(item => <tr key={item.slug}>
            <th scope="row"><span className="cms-university-name">{item.name}</span><span className="cms-university-slug">/{item.slug}</span></th>
            <td>{[item.city, item.country].filter(Boolean).join(', ') || '—'}</td>
            <td>{item.type}</td>
            <td><Badge variant={isPublishedUniversity(item) ? 'secondary' : 'outline'} className={universityStatus(item).className}>{universityStatus(item).label}</Badge></td>
            <td>{item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : 'Not verified'}</td>
            <td><Link className="cms-university-edit" to={`/admin/universities/${item.slug}`} aria-label={`Edit ${item.name}`}><Pencil size={15} aria-hidden="true" /> Edit</Link></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="cms-list-empty">{loading ? 'Loading universities…' : items.length ? 'No universities match your search.' : 'No university records yet. Create one to get started.'}</div>}
    </div>
    <CreateUniversityDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={created} />
  </div>;
}
