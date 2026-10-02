export type EditableImage = {
  kind: 'element' | 'hero';
  index: number;
  label: string;
  src: string;
  alt: string;
};

const heroImages: Record<string, string> = {
  about: '/assets/somalia-about.webp',
  consulting: '/assets/somalia-consulting.webp',
  contact: '/assets/contact-guidance.png',
  education: '/assets/somalia-education.webp',
  insights: '/assets/somalia-insights.webp',
  'international-education': '/assets/somalia-universities.webp',
};

const cssImageUrl = (value: string) => value.match(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/i)?.[1] || '';

export function sectionImages(section: HTMLElement, pageSlug: string): EditableImage[] {
  const images: EditableImage[] = Array.from(section.querySelectorAll('img')).map((element, index) => ({
    kind: 'element', index, label: `Section image ${index + 1}`,
    src: element.getAttribute('src') || '', alt: element.getAttribute('alt') || '',
  }));
  if (section.classList.contains('page-hero') && !section.classList.contains('service-hero-no-image')) {
    const source = cssImageUrl(section.style.getPropertyValue('--page-hero-image'))
      || cssImageUrl(section.style.getPropertyValue('--service-hero-image'))
      || heroImages[pageSlug];
    if (source) images.unshift({ kind: 'hero', index: -1, label: 'Hero background', src: source, alt: '' });
  }
  return images;
}

export function setHeroImage(section: HTMLElement, src: string) {
  section.style.setProperty('--page-hero-image', `url("${src.replace(/["\\]/g, '')}")`);
}
