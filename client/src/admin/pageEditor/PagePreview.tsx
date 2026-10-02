import { useState } from 'react';
import type { Page } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';

export function PagePreview({ page, sections }: { page: Page; sections: string[] }) {
  const [size, setSize] = useState<'desktop' | 'mobile'>('desktop');
  const { theme } = useTheme();
  const productionSheet = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .map(link => link.href).find(href => !href.includes('fonts.googleapis'));
  const sheet = import.meta.env.DEV ? '/src/styles/site.css?direct' : productionSheet;
  const preview = `<!doctype html><html data-theme="${theme}"><head><base href="${location.origin}/"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${sheet || ''}"></head><body class="${page.bodyClass}" data-page="${page.slug || 'index'}"><main id="main">${sections.join('')}</main></body></html>`;

  return <div className="cms-preview-panel">
    <div className="cms-preview-bar"><strong>Page preview</strong><div>
      <button type="button" className={size === 'desktop' ? 'active' : ''} onClick={() => setSize('desktop')}>Desktop</button>
      <button type="button" className={size === 'mobile' ? 'active' : ''} onClick={() => setSize('mobile')}>Mobile</button>
    </div></div>
    <iframe title="Page preview" sandbox="allow-same-origin" className={size === 'mobile' ? 'cms-preview-mobile' : ''} srcDoc={preview} />
  </div>;
}
