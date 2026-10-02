import { useEffect, useMemo, useState } from 'react';
import { Mail, Search } from 'lucide-react';
import { api, sendJson } from '../../api';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import type { Inquiry } from '../../types';
import { useConfirm } from '../ConfirmProvider';

const statusLabel: Record<Inquiry['status'], string> = { new: 'New', 'in-progress': 'In progress', closed: 'Closed' };

export function Inquiries() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<'all' | Inquiry['status']>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<Inquiry[]>('/admin/inquiries').then(result => { setItems(result); setSelectedId(current => current || result[0]?._id || ''); })
      .catch(error => setMessage(error.message)).finally(() => setLoading(false));
  }, []);
  const visible = useMemo(() => items.filter(item =>
    (filter === 'all' || item.status === filter) &&
    `${item.name} ${item.email} ${item.subject} ${item.message}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [items, filter, query]);
  const selected = visible.find(item => item._id === selectedId) || visible[0];
  const update = async (id: string, status: Inquiry['status']) => {
    if (!await confirmAction({ title: 'Update enquiry status?', description: `Mark this enquiry as ${statusLabel[status].toLowerCase()}?`, confirmLabel: 'Update status' })) return;
    setMessage('');
    try {
      const updated = await sendJson<Inquiry>(`/admin/inquiries/${id}`, 'PATCH', { status });
      setItems(current => current.map(item => item._id === id ? updated : item));
      setMessage('Enquiry status updated.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Update failed.'); }
  };
  return <div className="cms-form-page cms-inbox-page">
    <div className="cms-page-editor-head"><div><span className="cms-kicker">CONTACT REQUESTS</span><h1>Enquiries</h1><p>Read new messages and keep each request moving.</p></div></div>
    {message && <p className="cms-notice" role="status">{message}</p>}
    <div className="cms-inbox">
      <div className="cms-inbox-list">
        <div className="cms-inbox-toolbar">
          <div className="cms-search"><Search size={17} aria-hidden="true" /><Input aria-label="Search enquiries" placeholder="Search enquiries" value={query} onChange={event => setQuery(event.target.value)} /></div>
          <select aria-label="Filter enquiries" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option value="all">All statuses</option><option value="new">New</option><option value="in-progress">In progress</option><option value="closed">Closed</option></select>
        </div>
        <div className="cms-inbox-count">{visible.length} {visible.length === 1 ? 'enquiry' : 'enquiries'}</div>
        {visible.length ? visible.map(item => <button type="button" key={item._id} className={`cms-inbox-item ${selected?._id === item._id ? 'active' : ''}`} onClick={() => setSelectedId(item._id)} aria-pressed={selected?._id === item._id}>
          <span className="cms-inbox-item-top"><strong>{item.name}</strong><small>{new Date(item.createdAt).toLocaleDateString()}</small></span>
          <span className="cms-inbox-subject">{item.subject || 'Website enquiry'}</span>
          <span className="cms-inbox-preview">{item.message}</span>
          <Badge variant={item.status === 'new' ? 'default' : 'secondary'}>{statusLabel[item.status]}</Badge>
        </button>) : <p className="cms-panel-empty">{loading ? 'Loading enquiries…' : 'No enquiries match this view.'}</p>}
      </div>
      <div className="cms-inbox-detail">
        {selected ? <>
          <div className="cms-inbox-detail-head"><div><span className="cms-kicker">{selected.subject || 'WEBSITE ENQUIRY'}</span><h2>{selected.name}</h2><p>Received {new Date(selected.createdAt).toLocaleString()}</p></div><Badge variant={selected.status === 'new' ? 'default' : 'secondary'}>{statusLabel[selected.status]}</Badge></div>
          <div className="cms-inbox-contact"><span><Mail size={16} aria-hidden="true" /><a href={`mailto:${selected.email}`}>{selected.email}</a></span>{selected.organisation && <span>Organisation: {selected.organisation}</span>}{selected.universitySlug && <span>University: {selected.universitySlug}</span>}</div>
          <div className="cms-inbox-message"><span className="cms-field-caption">MESSAGE</span><p>{selected.message}</p></div>
          <div className="cms-inbox-status"><label htmlFor="inquiry-status">Status</label><select id="inquiry-status" value={selected.status} onChange={event => void update(selected._id, event.target.value as Inquiry['status'])}><option value="new">New</option><option value="in-progress">In progress</option><option value="closed">Closed</option></select></div>
        </> : <div className="cms-inbox-placeholder"><Mail size={30} strokeWidth={1.5} aria-hidden="true" /><h2>No enquiry selected</h2><p>Choose a message to read its details.</p></div>}
      </div>
    </div>
  </div>;
}
