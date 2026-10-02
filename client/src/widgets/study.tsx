import type { University } from '../types';

export const money = (amount: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
export const detailHref = (slug: string) => `/university-detail.html?university=${encodeURIComponent(slug)}`;
export const guidanceHref = (slug: string) => `/contact.html?route=student&university=${encodeURIComponent(slug)}#contact-form`;

export function UniversityMark({ university }: { university: University }) {
  return university.logoUrl
    ? <img className="uni-logo-img" src={university.logoUrl} alt="" width="52" height="52" loading="lazy" />
    : <span className="uni-logo-fallback" aria-hidden="true">{university.name.slice(0, 1)}</span>;
}

