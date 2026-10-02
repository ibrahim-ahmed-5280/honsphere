import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api, sendJson } from '../api';
import { Button } from '../components/ui/button';
import type { Page } from '../types';
import { initialPage, parseSection, splitSections, textNodes } from './pageEditor/utils';
import { sectionImages, setHeroImage, type EditableImage } from './pageEditor/images';
import { SectionControls } from './pageEditor/SectionControls';
import { PagePreview } from './pageEditor/PagePreview';
import { uploadImage as uploadImageFile } from './upload';
import { useConfirm } from './ConfirmProvider';

export function PageEditor({ slug, onBack }: { slug: string; onBack: () => void }) {
  const confirmAction = useConfirm();
  const isNew = slug === 'new';
  const [page, setPage] = useState<Page>(initialPage(''));
  const [sections, setSections] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<'fields' | 'html'>('fields');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (isNew) { const fresh = initialPage(''); setPage(fresh); setSections(splitSections(fresh.html)); return; }
    api<Page>(`/admin/pages/${encodeURIComponent(slug)}`).then(found => { setPage(found); setSections(splitSections(found.html)); }).catch(error => setMessage(error.message));
  }, [slug, isNew]);
  const section = useMemo(() => parseSection(sections[selected] || ''), [sections, selected]);
  const fields = useMemo(() => section ? textNodes(section).map(entry => entry.item) : [], [section]);
  const links = useMemo(() => section ? Array.from(section.querySelectorAll('a')).map((element, index) => ({ index, label: element.textContent?.trim() || `Link ${index + 1}`, href: element.getAttribute('href') || '' })) : [], [section]);
  const images = useMemo(() => section ? sectionImages(section, page.slug || slug) : [], [section, page.slug, slug]);
  const updateSection = (index: number, html: string) => setSections(current => current.map((item, at) => at === index ? html : item));
  const updateText = (index: number, value: string) => {
    const element = parseSection(sections[selected]);
    if (!element) return;
    const entry = textNodes(element)[index];
    if (entry) { entry.node.textContent = value; updateSection(selected, element.outerHTML); }
  };
  const updateLink = (index: number, href: string) => {
    const element = parseSection(sections[selected]);
    const target = element?.querySelectorAll('a')[index];
    if (element && target) { target.setAttribute('href', href); updateSection(selected, element.outerHTML); }
  };
  const updateImage = (index: number, attr: 'src' | 'alt', value: string) => {
    const element = parseSection(sections[selected]);
    const target = element?.querySelectorAll('img')[index];
    if (element && target) { target.setAttribute(attr, value); updateSection(selected, element.outerHTML); }
  };
  const move = (direction: -1 | 1) => {
    const target = selected + direction;
    if (target < 0 || target >= sections.length) return;
    setSections(current => { const copy = [...current]; [copy[selected], copy[target]] = [copy[target], copy[selected]]; return copy; });
    setSelected(target);
  };
  const addSection = async () => {
    if (!await confirmAction({ title: 'Add a section?', description: 'A new section will be added to this page. Save the page when you are ready to publish the change.', confirmLabel: 'Add section' })) return;
    const html = '<section class="section"><div class="hs-container"><span class="eyebrow">New section</span><h2 class="section-title">Section heading</h2><p class="body-large mt-6">Write the section content here.</p></div></section>';
    setSections(current => [...current, html]);
    setSelected(sections.length);
  };
  const removeSection = async () => {
    if (!await confirmAction({ title: 'Remove this section?', description: 'The section will be removed from the editor. Save the page to apply the change to the website.', confirmLabel: 'Remove section', destructive: true })) return;
    setSections(current => current.filter((_, index) => index !== selected));
    setSelected(Math.max(0, selected - 1));
  };
  const save = async () => {
    if (!await confirmAction({
      title: isNew ? 'Create this page?' : 'Save changes to this page?',
      description: page.published ? 'These changes will appear on the public website as soon as they are saved.' : 'This page will stay a draft until you publish it.',
      confirmLabel: isNew ? 'Create page' : 'Save changes',
    })) return;
    setBusy(true); setMessage('');
    try {
      const body = { ...page, slug: page.slug.trim().toLowerCase().replace(/\s+/g, '-'), html: sections.join('\n') };
      const saved = await sendJson<Page>(isNew ? '/admin/pages' : `/admin/pages/${encodeURIComponent(slug)}`, isNew ? 'POST' : 'PUT', body);
      setPage(saved); setSections(splitSections(saved.html)); setMessage('Saved. The public page now uses this content.');
      if (isNew) location.href = `/admin/pages/${saved.slug}`;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save page.'); }
    finally { setBusy(false); }
  };
  const uploadImage = async (file: File, image: EditableImage, sectionIndex: number) => {
    if (!await confirmAction({ title: 'Upload this page image?', description: 'The image will be stored now. Save the page to publish it.', confirmLabel: 'Upload image' })) return;
    try {
      const result = await uploadImageFile(file);
      setSections(current => current.map((html, at) => {
        if (at !== sectionIndex) return html;
        const element = parseSection(html);
        if (!element) return html;
        if (image.kind === 'hero') setHeroImage(element, result.url);
        else element.querySelectorAll('img')[image.index]?.setAttribute('src', result.url);
        return element.outerHTML;
      }));
      setMessage('Image uploaded. Save the page to publish it.');
    }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
  };
  return <div className="cms-page-editor">
    <div className="cms-page-editor-head"><div><button className="cms-text-button" type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" /> Pages</button><h1>{isNew ? 'Create page' : `Edit ${page.slug}`}</h1><p>Change content, links, images and section order while keeping the site's design.</p></div><Button type="button" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save page'}</Button></div>
    {message && <p className="cms-notice" role="status">{message}</p>}
    <div className="cms-page-meta">
      {isNew && <label>Page URL slug<input value={page.slug} onChange={event => setPage({ ...page, slug: event.target.value })} placeholder="new-page" /></label>}
      <label>Browser title<input placeholder="Page title | HornSphere" value={page.title} onChange={event => setPage({ ...page, title: event.target.value })} /></label>
      <label>Search description<textarea rows={2} placeholder="Summarise this page for search results." value={page.description} onChange={event => setPage({ ...page, description: event.target.value })} /></label>
      <label>Body CSS classes<input placeholder="Optional classes, separated by spaces" value={page.bodyClass} onChange={event => setPage({ ...page, bodyClass: event.target.value })} /></label>
      <label className="cms-check"><input type="checkbox" checked={page.published} onChange={event => setPage({ ...page, published: event.target.checked })} /> Published</label>
    </div>
    <div className="cms-editor-grid">
      <SectionControls
        sections={sections} selected={selected} onSelect={setSelected}
        mode={mode} onModeChange={setMode} fields={fields} links={links} images={images}
        onAdd={() => void addSection()} onMove={move}
        onRemove={() => void removeSection()}
        onText={updateText} onLink={updateLink} onImage={updateImage}
        onUpload={(file, image) => void uploadImage(file, image, selected)}
        onHtml={html => updateSection(selected, html)}
      />
      <PagePreview page={page} sections={sections} />
    </div>
  </div>;
}

