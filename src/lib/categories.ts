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
  { value: 'ai', label: 'AI', service: 'ai-web-development' },
  { value: 'ecommerce', label: 'E-commerce', service: 'shopify-cro' },
  { value: 'mobile', label: 'Mobile', service: 'mvp-engineering' },
  { value: 'fullstack', label: 'Full-Stack', service: 'full-stack-apis' },
  { value: 'frontend', label: 'Frontend', service: 'ai-web-development' },
  { value: 'backend', label: 'Backend', service: 'full-stack-apis' },
  { value: 'performance', label: 'Performance', service: 'ai-web-development' },
  { value: 'career', label: 'Career', service: 'mvp-engineering' },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]['value'];

/**
 * The service slug a post's category points at, so an article can offer the
 * work it is actually about rather than a generic "get in touch".
 *
 * The mapping lives here because it is a property of the category, and
 * categories already live in exactly one place. It is a slug rather than any
 * copy: the card's title, tagline and timeline all come from the service
 * loader, so editing a service in the Studio updates every post that points at
 * it and nothing has to be kept in sync by hand.
 *
 * An unmapped category resolves to nothing and the card is simply not rendered
 * — better than showing the wrong offer next to an article.
 */
export function serviceForCategory(value: string): string | undefined {
  return CATEGORIES.find((c) => c.value === value)?.service;
}

/**
 * The display name for a category value. Falls back to the value itself so an
 * unrecognised category still renders something readable rather than nothing.
 */
export function categoryLabel(value: string, authored?: string): string {
  if (authored?.trim()) return authored.trim();
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
