/**
 * The blog's category vocabulary — one list, read by both the Studio dropdown
 * and the site.
 *
 * It used to live only in `schemaTypes/post.ts`, with each post also carrying a
 * hand-typed `categoryLabel`. The topic hub takes its heading from the first
 * post in the category, so a single post saved with that field blank left the
 * hub with no title — and two posts spelling it differently silently changed
 * the heading depending on publish order.
 *
 * Adding a category: add it here, and it appears in the Studio dropdown and
 * gets a hub as soon as a published post uses it.
 */
export const CATEGORIES = [
  { value: 'ai', label: 'AI' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'fullstack', label: 'Full-Stack' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'performance', label: 'Performance' },
  { value: 'career', label: 'Career' },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]['value'];

/**
 * The display name for a category value. Falls back to the value itself so an
 * unrecognised category still renders something readable rather than nothing.
 */
export function categoryLabel(value: string, authored?: string): string {
  if (authored?.trim()) return authored.trim();
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
