import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, Inbox, Plus } from 'lucide-react';
import { api } from '../../api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import type { Page, University } from '../../types';

type Summary = { pages: number; universities: number; inquiries: number; newInquiries: number };
type OverviewData = { summary: Summary; pages: Page[]; universities: University[] };

export function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      api<Summary>('/admin/summary'),
      api<Page[]>('/admin/pages'),
      api<University[]>('/admin/universities'),
    ]).then(([summary, pages, universities]) => setData({ summary, pages, universities }))
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Could not load the overview.'));
  }, []);

  const drafts = data?.universities.filter(item => !item.published || !item.verifiedAt) ?? [];
  const recentPages = [...(data?.pages ?? [])].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 4);
  const metrics = [
    { label: 'Website pages', value: data?.summary.pages, href: '/admin/pages', icon: FileText, hint: 'Manage content' },
    { label: 'Study listings', value: data?.summary.universities, href: '/admin/universities', icon: BookOpen, hint: 'Review records' },
    { label: 'New enquiries', value: data?.summary.newInquiries, href: '/admin/inquiries', icon: Inbox, hint: 'Respond to requests' },
  ];

  return <div className="cms-form-page cms-overview">
    <div className="cms-page-editor-head">
      <div><span className="cms-kicker">CONTENT OVERVIEW</span><h1>Manage your website</h1><p>Review what needs attention and continue editing where you left off.</p></div>
      <Button asChild><Link to="/admin/pages/new"><Plus size={16} aria-hidden="true" /> New page</Link></Button>
    </div>
    {error && <p className="cms-alert" role="alert">{error}</p>}
    <div className="cms-metrics" aria-label="Website summary">
      {metrics.map(({ label, value, href, icon: Icon, hint }) => <Link to={href} key={label} className="cms-metric">
        <span className="cms-metric-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
        <span className="cms-metric-number">{value ?? '–'}</span>
        <strong>{label}</strong><small>{hint} <ArrowRight size={14} aria-hidden="true" /></small>
      </Link>)}
    </div>
    <div className="cms-overview-grid">
      <section className="cms-panel">
        <div className="cms-panel-heading"><div><h2>Needs attention</h2><p>Items waiting for a response or publication review.</p></div></div>
        {data && !data.summary.newInquiries && !drafts.length ? <p className="cms-panel-empty">Everything is up to date.</p> : <div className="cms-action-list">
          <Link to="/admin/inquiries" className="cms-action-row"><span className="cms-action-icon"><Inbox size={18} aria-hidden="true" /></span><span><strong>New enquiries</strong><small>Review messages from the contact form</small></span><Badge variant="secondary">{data?.summary.newInquiries ?? '–'}</Badge><ArrowRight size={16} aria-hidden="true" /></Link>
          <Link to="/admin/universities" className="cms-action-row"><span className="cms-action-icon"><BookOpen size={18} aria-hidden="true" /></span><span><strong>Listings not live</strong><small>Verify details and publish when ready</small></span><Badge variant="secondary">{data ? drafts.length : '–'}</Badge><ArrowRight size={16} aria-hidden="true" /></Link>
        </div>}
      </section>
      <section className="cms-panel">
        <div className="cms-panel-heading"><div><h2>Recently edited pages</h2><p>Return to content that was updated most recently.</p></div><Link to="/admin/pages">All pages <ArrowRight size={15} aria-hidden="true" /></Link></div>
        {recentPages.length ? <div className="cms-recent-list">{recentPages.map(page => <Link to={`/admin/pages/${page.slug}`} key={page.slug}><span><strong>{page.title}</strong><small>/{page.slug}.html</small></span><Badge variant={page.published ? 'secondary' : 'outline'}>{page.published ? 'Published' : 'Draft'}</Badge></Link>)}</div> : <p className="cms-panel-empty">Pages will appear here after they are added.</p>}
      </section>
    </div>
  </div>;
}
