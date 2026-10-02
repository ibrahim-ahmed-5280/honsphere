import { useEffect } from 'react';
import { api } from '../api';
import type { University } from '../types';

export function useContactForm(slug: string, html: string) {
  useEffect(() => {
    const form = document.getElementById('contact-form-fields') as HTMLFormElement | null;
    if (!form) return;
    const select = form.elements.namedItem('subject') as HTMLSelectElement | null;
    const status = document.getElementById('contact-route-status');
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-contact-subject]'));
    const setSubject = (value: string) => {
      if (!select || !Array.from(select.options).some(option => option.value === value)) return;
      select.value = value;
      cards.forEach(card => card.setAttribute('aria-pressed', String(card.dataset.contactSubject === value)));
      if (status) status.textContent = `Selected enquiry: ${select.selectedOptions[0]?.textContent || value}`;
    };
    const route = new URLSearchParams(location.search).get('route');
    const subject = new URLSearchParams(location.search).get('subject');
    if (subject) setSubject(subject);
    else if (route) setSubject(document.getElementById(route)?.getAttribute('data-contact-subject') || route);
    const listeners = cards.map(card => {
      const click = () => { setSubject(card.dataset.contactSubject || ''); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' }); select?.focus({ preventScroll: true }); };
      card.addEventListener('click', click);
      return () => card.removeEventListener('click', click);
    });
    const universitySlug = new URLSearchParams(location.search).get('university') || '';
    if (universitySlug) api<University>(`/universities/${encodeURIComponent(universitySlug)}`).then(university => {
      const message = form.elements.namedItem('message') as HTMLTextAreaElement | null;
      if (message && !message.value) message.value = `I would like guidance about ${university.name}. Please help me check suitable programmes, current tuition and entry requirements.`;
    }).catch(() => {});
    const trap = document.createElement('input');
    trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off'; trap.className = 'sr-only'; trap.setAttribute('aria-hidden', 'true');
    form.append(trap);
    const feedback = document.createElement('p');
    feedback.className = 'contact-submit-status';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    form.querySelector('.contact-form-submit')?.after(feedback);
    const submit = async (event: Event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (button) button.disabled = true;
      feedback.textContent = 'Sending your enquiry…';
      try {
        await api('/inquiries', { method: 'POST', body: JSON.stringify({ name: data.name, email: data.email, organisation: data.organisation || '', subject: data.subject, message: data.message, universitySlug, website: data.website || '' }) });
        feedback.textContent = 'Thank you. Your enquiry has been received. HornSphere will contact you using the email you provided.';
        form.reset();
      } catch (error) {
        feedback.textContent = error instanceof Error ? error.message : 'Your enquiry could not be sent. Please try again.';
      } finally { if (button) button.disabled = false; }
    };
    form.addEventListener('submit', submit);
    return () => { form.removeEventListener('submit', submit); listeners.forEach(remove => remove()); trap.remove(); feedback.remove(); };
  }, [slug, html]);
}

