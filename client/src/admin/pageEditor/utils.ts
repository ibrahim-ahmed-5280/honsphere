import type { Page } from '../../types';

export const initialPage = (slug: string): Page => ({ slug, title: '', description: '', bodyClass: '', html: '<section class="section"><div class="hs-container"><h1>New page</h1><p>Add your content here.</p></div></section>', published: false });
export const parseSection = (html: string) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement | null;
};
export const splitSections = (html: string) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return Array.from(template.content.children).map(element => element.outerHTML);
};
export type EditableText = { index: number; value: string; hint: string };
export function textNodes(section: HTMLElement): { node: Text; item: EditableText }[] {
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
  const result: { node: Text; item: EditableText }[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    const value = node.textContent?.trim() || '';
    if (!value || !parent || parent.closest('svg,.material-symbols-outlined,script,style')) continue;
    result.push({ node: node as Text, item: { index: result.length, value, hint: parent.tagName.toLowerCase() } });
  }
  return result;
}
