import { parseSection, type EditableText } from './utils';
import { ImageUploadField } from '../ImageUploadField';
import type { EditableImage } from './images';

type LinkField = { index: number; label: string; href: string };

type Props = {
  sections: string[];
  selected: number;
  onSelect: (index: number) => void;
  mode: 'fields' | 'html';
  onModeChange: (mode: 'fields' | 'html') => void;
  fields: EditableText[];
  links: LinkField[];
  images: EditableImage[];
  onAdd: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onText: (index: number, value: string) => void;
  onLink: (index: number, href: string) => void;
  onImage: (index: number, attr: 'src' | 'alt', value: string) => void;
  onUpload: (file: File, image: EditableImage) => void;
  onHtml: (html: string) => void;
};

export function SectionControls(props: Props) {
  const { sections, selected, onSelect, mode, onModeChange, fields, links, images, onAdd, onMove, onRemove, onText, onLink, onImage, onUpload, onHtml } = props;
  return <div className="cms-editor-controls">
    <div className="cms-section-toolbar"><h2>Sections</h2><button type="button" onClick={onAdd}>+ Add</button></div>
    <div className="cms-section-list">{sections.map((html, index) => {
      const element = parseSection(html);
      const heading = element?.querySelector('h1,h2,h3')?.textContent?.trim() || element?.getAttribute('aria-label') || `Section ${index + 1}`;
      return <button type="button" key={index} className={selected === index ? 'active' : ''} onClick={() => onSelect(index)}><span>{String(index + 1).padStart(2, '0')}</span>{heading.slice(0, 70)}</button>;
    })}</div>
    {sections[selected] && <>
      <div className="cms-section-toolbar cms-section-actions">
        <button type="button" onClick={() => onMove(-1)} disabled={selected === 0}>↑ Move</button>
        <button type="button" onClick={() => onMove(1)} disabled={selected === sections.length - 1}>↓ Move</button>
        <button type="button" onClick={onRemove}>Remove</button>
      </div>
      <div className="cms-tabs"><button type="button" className={mode === 'fields' ? 'active' : ''} onClick={() => onModeChange('fields')}>Content</button><button type="button" className={mode === 'html' ? 'active' : ''} onClick={() => onModeChange('html')}>HTML</button></div>
      {mode === 'fields' ? <div className="cms-field-list">
        <h3>Visible text</h3>{fields.map(field => <label key={field.index}><span>{field.hint.toUpperCase()}</span><textarea rows={field.value.length > 90 ? 3 : 2} placeholder="Enter the text shown in this section." value={field.value} onChange={event => onText(field.index, event.target.value)} /></label>)}
        {links.length > 0 && <><h3>Links</h3>{links.map(link => <label key={link.index}><span>{link.label}</span><input placeholder="/page.html or https://example.com" value={link.href} onChange={event => onLink(link.index, event.target.value)} /></label>)}</>}
        {images.length > 0 && <><h3>Images</h3>{images.map(image => <div className="cms-image-fields" key={`${image.kind}-${image.index}`}>
          <ImageUploadField label={image.label} imageUrl={image.src} onUpload={file => onUpload(file, image)} />
          {image.kind === 'element' && <label><span>Alternative text</span><input placeholder="Describe the image for screen readers." value={image.alt} onChange={event => onImage(image.index, 'alt', event.target.value)} /></label>}
        </div>)}</>}
      </div> : <label className="cms-html-editor">Section HTML<textarea spellCheck={false} placeholder="<section>...</section>" value={sections[selected]} onChange={event => onHtml(event.target.value)} /></label>}
    </>}
  </div>;
}
