import type { University } from '../../types';

export const isPublishedUniversity = (university: University) => Boolean(university.published && university.verifiedAt);

export function universityStatus(university: University) {
  if (isPublishedUniversity(university)) return { label: 'Published', className: 'cms-badge-live' };
  if (university.published) return { label: 'Needs verification', className: 'cms-badge-draft' };
  if (university.verifiedAt) return { label: 'Ready to publish', className: 'cms-badge-ready' };
  return { label: 'Draft', className: 'cms-badge-draft' };
}
