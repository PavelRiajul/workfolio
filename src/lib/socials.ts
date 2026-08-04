/**
 * The one place social profiles are turned into links.
 *
 * The footer, the résumé contact line and `sameAs` in the Person schema all
 * read from here. When they each resolved their own, the page asserted one
 * identity in its markup and a different one to a crawler — the footer linked
 * `https://github.com` while `sameAs` claimed `github.com/riajulislam` — and a
 * contradiction between the two is worse for entity resolution than either
 * link on its own.
 */
import type { SiteSettings, SocialLink } from './types';
import { ICONS } from './icons';

/** A social button with no glyph is a blank 44px circle, so unknown icons get one. */
const FALLBACK_ICON = 'fa-solid fa-link';

/** "fa-brands fa-github" -> "brands:github", the key `ICONS` is stored under. */
function hasGlyph(icon: string): boolean {
  const match = icon.match(/fa-(solid|brands|regular)\s+fa-([a-z0-9-]+)/);
  return !!match && `${match[1]}:${match[2]}` in ICONS;
}

/**
 * Normalise an authored value to an absolute profile URL, or null.
 *
 * Accepts a full URL, a bare handle path (`github.com/name`) or an `@handle`
 * with the platform inferred from the label. Returns null for anything that
 * resolves to a bare domain — the placeholder shape the seed data ships.
 */
export function profileUrl(value?: string, fallbackHandle?: string): string | null {
  for (const raw of [fallbackHandle, value]) {
    if (!raw) continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('@')) continue;

    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(withScheme);
      // A path is what makes it a profile rather than a platform homepage.
      if (url.pathname.replace(/\/$/, '').length > 0) return url.href.replace(/\/$/, '');
    } catch {
      /* Malformed value in the CMS — skip it rather than emit a broken link. */
    }
  }
  return null;
}

/**
 * Every resolvable social profile, in authored order.
 *
 * Prefers the repeatable `socialLinks` list. Falls back to the original fixed
 * github/linkedin/x fields so a dataset that predates the list still renders —
 * remove that branch once every environment has been migrated.
 */
export function resolveSocials(site: SiteSettings): Array<SocialLink & { href: string }> {
  const authored: SocialLink[] = site.socialLinks?.length
    ? site.socialLinks
    : [
        { label: 'GitHub', icon: 'fa-brands fa-github', url: site.socials?.githubHandle || site.socials?.github || '' },
        { label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', url: site.socials?.linkedinHandle || site.socials?.linkedin || '' },
        { label: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', url: site.socials?.xHandle || site.socials?.x || '' },
      ];

  return authored.flatMap((link) => {
    const href = profileUrl(link.url);
    if (!href || !link.label) return [];
    return [{ ...link, href, icon: hasGlyph(link.icon) ? link.icon : FALLBACK_ICON }];
  });
}

/** Profile URLs only — what `sameAs` needs. */
export function socialUrls(site: SiteSettings): string[] {
  return resolveSocials(site).map((s) => s.href);
}

/** A single profile by label, for the résumé's named contact links. */
export function socialByLabel(site: SiteSettings, label: string) {
  return resolveSocials(site).find((s) => s.label.toLowerCase() === label.toLowerCase()) ?? null;
}
