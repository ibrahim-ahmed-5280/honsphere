import assert from 'node:assert/strict';
import { cleanPageHtml } from '../src/security.js';

const html = '<section class="page-hero" style="--page-hero-image:url(&quot;/uploads/hero.webp&quot;)"><img src="/uploads/card.webp" alt="Campus"></section>';
const cleaned = cleanPageHtml(html);
assert.match(cleaned, /--page-hero-image:url\([^)]*\/uploads\/hero\.webp[^)]*\)/);
assert.match(cleaned, /<img src="\/uploads\/card\.webp" alt="Campus"\s*\/?>/);
assert.doesNotMatch(cleanPageHtml('<img src="javascript:alert(1)" onerror="alert(1)">'), /javascript:|onerror=/);
console.log('Content sanitization preserves uploaded page images.');
