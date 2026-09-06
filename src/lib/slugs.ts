/**
 * Slug hygiene for anything that becomes a URL.
 *
 * Slugs come from the Studio, so a typo becomes a live URL. Two got through:
 * a project slugged `beauty ` with a trailing space, which builds
 * `/work/beauty%20/` alongside the real `/work/beauty/` — two pages, identical
 * title, both self-canonical, both in the sitemap — and one slugged `Gym`,
 * giving `/work/Gym/` when every other URL on the site is lowercase and URLs
 * are case-sensitive.
 *
 * This reports; it does not rewrite. Trimming `beauty ` would collide with the
 * existing `beauty`, and silently dropping whichever lost would remove a live
 * page — the fix belongs in the Studio, where the slug is authored. What the
 * build can do is refuse to stay quiet about it, and stop advertising the bad
 * URL in the sitemap.
 */

/** A slug is clean when it is lowercase, trimmed, and URL-safe as written. */
export function isCleanSlug(slug: string): boolean {
  return slug === slug.trim().toLowerCase() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** The problem with a slug, phrased for whoever has to fix it. */
function diagnose(slug: string): string {
  if (slug !== slug.trim()) return 'has leading/trailing whitespace → becomes %20 in the URL';
  if (slug !== slug.toLowerCase()) return 'has uppercase letters → URLs are case-sensitive';
  return 'has characters outside a-z, 0-9 and hyphen';
}

/**
 * Warn about every slug that will produce a URL nobody can type. Called from
 * `getStaticPaths`, so it runs once per route at build time.
 */
export function warnOnDirtySlugs(slugs: string[], label: string): void {
  const dirty = slugs.filter((s) => s && !isCleanSlug(s));
  if (!dirty.length) return;
  console.warn(
    `\n[seo] ${dirty.length} ${label} slug(s) will build a malformed URL:\n` +
      dirty.map((s) => `  · ${JSON.stringify(s)} — ${diagnose(s)}`).join('\n') +
      `\n  Fix the slug in the Studio. Until then these are kept out of the sitemap.\n`
  );
}
