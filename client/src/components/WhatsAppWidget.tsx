import { useEffect, useRef, useState } from 'react';
import type { SiteSettings } from '../types';
import { icon } from './Icon';

const whatsAppIcon = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.76-1.653-2.057-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.496.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.009-.372-.01-.57-.01-.198 0-.52.074-.793.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.073c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.888-9.884a9.82 9.82 0 0 1 6.989 2.897 9.82 9.82 0 0 1 2.893 6.99c-.003 5.45-4.438 9.884-9.886 9.884m8.413-18.297A11.87 11.87 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.586 5.945L.057 24l6.307-1.654a11.86 11.86 0 0 0 5.68 1.447h.005c6.554 0 11.89-5.335 11.893-11.89A11.82 11.82 0 0 0 20.464 3.49z" /></svg>;

export function WhatsAppWidget({ site }: { site: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const onClick = (event: MouseEvent) => { if (open && !widgetRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [open]);
  const close = () => { setOpen(false); requestAnimationFrame(() => toggleRef.current?.focus()); };
  return <div className={`whatsapp-widget${open ? ' is-open' : ''}`} ref={widgetRef}>
    <section className={`whatsapp-panel${open ? ' is-open' : ''}`} id="whatsapp-panel" role="dialog" aria-labelledby="whatsapp-title" aria-hidden={!open} inert={!open}>
      <div className="whatsapp-panel-header"><span className="whatsapp-panel-avatar"><img src={site.iconPath} alt="" width="37" height="37" /></span><div className="whatsapp-panel-heading"><strong id="whatsapp-title">{site.brandName}</strong><span>{site.whatsappSubtitle}</span></div><button className="whatsapp-panel-close" type="button" aria-label="Close chat" onClick={close}>{icon('close')}</button></div>
      <div className="whatsapp-panel-body"><div className="whatsapp-greeting"><strong>{site.brandName}</strong><p>{site.whatsappGreeting}</p></div></div>
      <form className="whatsapp-composer" action={`https://wa.me/${site.whatsappPhone}`} method="get" target="_blank" rel="noopener noreferrer" onSubmit={event => {
        const value = inputRef.current?.value.trim() || '';
        if (!value) { event.preventDefault(); inputRef.current?.focus(); }
        else if (inputRef.current) inputRef.current.value = value;
      }}>
        <label className="sr-only" htmlFor="whatsapp-message">Your message</label><input id="whatsapp-message" name="text" type="text" placeholder="Type a message..." maxLength={500} required ref={inputRef} /><button type="submit" aria-label="Send message in WhatsApp">{icon('send')}</button>
      </form>
      <p className="whatsapp-handoff">Send continues in WhatsApp.</p>
    </section>
    <button className="whatsapp-float" type="button" aria-controls="whatsapp-panel" aria-expanded={open} aria-label="Open WhatsApp chat" ref={toggleRef} onClick={() => setOpen(true)}>{whatsAppIcon}<span>WhatsApp</span></button>
  </div>;
}

