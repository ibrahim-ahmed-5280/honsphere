import type { Programme, University } from '../../types';

export type UniversityFieldSetter = <K extends keyof University>(key: K, value: University[K]) => void;
export type ProgrammeFieldSetter = <K extends keyof Programme>(index: number, key: K, value: Programme[K]) => void;

export const freshUniversity: University = { slug: '', name: '', type: 'Other', city: '', country: 'Malaysia', website: '', logoUrl: '', description: '', levels: [], fields: [], tuitionFrom: null, tuitionCurrency: 'USD', tuitionNote: '', intakes: '', entryRequirements: '', programmes: [], verifiedAt: null, published: false };
export const freshProgramme: Programme = { name: '', level: '', field: '', tuition: null, currency: 'USD', duration: '', intake: '', requirements: '' };

export const joinCsv = (items: string[]) => items.join(', ');
export const parseCsv = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);
