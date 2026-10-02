import type { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import { config } from './config.js';

const safeTags = [
  'a', 'article', 'aside', 'br', 'button', 'circle', 'desc', 'div', 'figcaption', 'figure',
  'form', 'g', 'h1', 'h2', 'h3', 'h4', 'img', 'input', 'label', 'li', 'main', 'nav', 'ol',
  'option', 'p', 'path', 'section', 'select', 'small', 'span', 'strong', 'svg', 'text',
  'textarea', 'title', 'ul', 'time', 'picture', 'source', 'em', 'b', 'i', 'blockquote', 'hr',
];
const safeAttrs = [
  'class', 'id', 'title', 'role', 'aria-*', 'data-*', 'style', 'hidden', 'width', 'height',
  'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'x', 'y', 'cx', 'cy', 'r', 'font-family', 'font-size', 'font-weight', 'text-anchor',
  'letter-spacing', 'transform', 'xmlns', 'preserveAspectRatio', 'focusable', 'tabindex',
  'href', 'src', 'alt', 'loading', 'decoding', 'type', 'name', 'value', 'placeholder',
  'required', 'rows', 'autocomplete', 'for', 'target', 'rel', 'selected', 'disabled',
];

export function cleanPageHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: safeTags,
    allowedAttributes: { '*': safeAttrs },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
    disallowedTagsMode: 'discard',
  });
}

const hits = new Map<string, { count: number; reset: number }>();
export function limitRequests(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    if (entry.count >= max) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    entry.count++;
    next();
  };
}

export function checkOrigin(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // non-browser clients still need authentication on admin routes
  const host = req.get('host') || '';
  const allowed = [config.publicOrigin, `https://${host}`, `http://${host}`, `http://127.0.0.1:${config.port}`, 'http://127.0.0.1:5173', 'http://localhost:5173']
    .filter(Boolean);
  if (allowed.includes(origin)) return next();
  return res.status(403).json({ error: 'Request origin is not allowed.' });
}
