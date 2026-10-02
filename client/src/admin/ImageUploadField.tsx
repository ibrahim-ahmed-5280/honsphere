import { useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, Upload } from 'lucide-react';

type Props = {
  label: string;
  imageUrl?: string;
  onUpload: (file: File) => void;
};

const imageSource = (src: string) => /^(?:[a-z]+:|\/)/i.test(src) ? src : `/${src.replace(/^\.\//, '')}`;
const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function ImageUploadField({ label, imageUrl, onUpload }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const choose = (file?: File) => {
    if (!file) return;
    if (!allowedTypes.has(file.type)) { setError('Choose a PNG, JPG or WebP image.'); return; }
    if (file.size > 2_000_000) { setError('Choose an image under 2 MB.'); return; }
    setError('');
    onUpload(file);
  };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    choose(event.target.files?.[0]);
    event.target.value = '';
  };
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0]);
  };

  return <div className="cms-upload-field">
    <span className="cms-upload-field-title">{label}</span>
    <label className={`cms-image-dropzone${dragging ? ' is-dragging' : ''}`} onDragEnter={event => { event.preventDefault(); setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={onDrop}>
      <input className="cms-upload-input" type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Choose ${label.toLowerCase()}`} onChange={onChange} />
      <span className="cms-image-dropzone-art" aria-hidden="true">{imageUrl ? <img src={imageSource(imageUrl)} alt="" /> : <ImagePlus size={24} strokeWidth={1.6} />}</span>
      <span className="cms-image-dropzone-copy"><strong>{imageUrl ? 'Replace image' : 'Add image'}</strong><small>Choose a file or drag it here</small></span>
      <Upload className="cms-image-dropzone-upload" size={18} strokeWidth={1.7} aria-hidden="true" />
    </label>
    <span className="cms-upload-field-hint">PNG, JPG or WebP · Up to 2 MB</span>
    {error && <span className="cms-upload-error" role="alert">{error}</span>}
  </div>;
}
