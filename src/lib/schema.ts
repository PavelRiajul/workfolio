// ---------------------------------------------------------------------------
// JSON-LD builders. Everything here is derived from the content loaders — the
// same rule as the pages: no hardcoded copy. Each builder returns one node of
// a single sitewide `@graph`, assembled in Base.astro.
//
// Nodes reference each other by `@id` (`#person`, `#website`) so Google reads
// them as one connected entity instead of several disconnected islands.
// ---------------------------------------------------------------------------
import type { SiteSettings, Faq, Service, ShopifyService, Project, Post } from './types';

/** Absolute URL for a site-relative path. Schema.org requires absolute URLs. */
export function abs(origin: string, path = '/'): string {
  return new URL(path, origin).href;
}

export const personId = (o: string) => `${abs(o)}#person`;
export const siteId = (o: string) => `${abs(o)}#website`;

/**
 * The seed data ships bare-domain placeholders (`https://github.com`) while the
 * *handle* carries the real profile path. Prefer whichever actually resolves to
 * a profile, and drop the entry entirely if neither does — a `sameAs` pointing
 * at a bare homepage is worse than no `sameAs`, because it claims the wrong
 * entity.
 */
function profileUrl(url?: string, handle?: string): string | null {
  if (handle) {
    const h = handle.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (h.includes('/')) return `https://${h}`;
  }
  if (url) {
    try {
      if (new URL(url).pathname.replace(/\/$/, '').length > 0) return url;
    } catch {
      /* malformed URL in the CMS — skip it rather than emit invalid JSON-LD */
    }
  }
  return null;
}

/** The identity node. Everything else on the site points back at this. */
export function personSchema(site: SiteSettings, origin: string) {
  const sameAs = [
    profileUrl(site.socials.github, site.socials.githubHandle),
    profileUrl(site.socials.linkedin, site.socials.linkedinHandle),
    profileUrl(site.socials.x),
  ].filter(Boolean);

  // "Dhaka, Bangladesh" → locality + country.
  const [locality, country] = site.location.split(',').map((s) => s.trim());

  return {
    '@type': 'Person',
    '@id': personId(origin),
    name: site.name,
    jobTitle: site.role,
    description: site.seo.description,
    url: abs(origin),
    email: `mailto:${site.email}`,
    knowsAbout: site.techStack,
    ...(sameAs.length ? { sameAs } : {}),
    ...(locality
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: locality,
            ...(country ? { addressCountry: country } : {}),
          },
        }
      : {}),
  };
}

/**
 * Drives the **site name** line in a Google result — the bold `Riajul Islam`
 * above the URL. Without it Google falls back to printing the bare domain
 * twice with no snippet, which is the failure mode this exists to prevent.
 * Google only reads this from the homepage, so it ships on every page (cheap)
 * and is guaranteed present at `/`.
 */
export function websiteSchema(site: SiteSettings, origin: string) {
  return {
    '@type': 'WebSite',
    '@id': siteId(origin),
    name: site.name,
    alternateName: site.website,
    description: site.seo.description,
    url: abs(origin),
    inLanguage: 'en',
    publisher: { '@id': personId(origin) },
  };
}

/** The page itself. `type` narrows it for pages Google treats specially. */
export function webPageSchema(
  origin: string,
  canonical: string,
  title: string,
  description: string,
  type = 'WebPage',
) {
  return {
    '@type': type,
    '@id': canonical,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': siteId(origin) },
    about: { '@id': personId(origin) },
    inLanguage: 'en',
  };
}

/** Eligible for the FAQ rich result. Only emit where the Q&As are on-page. */
export function faqSchema(faqs: Faq[]) {
  if (!faqs?.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * Breadcrumbs for any path, derived from the URL. This is what turns the grey
 * URL line in a search result into `riajulislam.dev › work › halo`.
 *
 * Segment labels come from the nav/footer links the CMS already defines, so
 * they read the way the site reads ("Résumé", not "Resume"). Anything not in
 * the nav — a case-study slug — falls back to a title-cased segment, and the
 * caller can override the leaf via `leafName` to use the real page title.
 */
export function autoBreadcrumbs(
  site: SiteSettings,
  origin: string,
  pathname: string,
  leafName?: string,
) {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return null; // the homepage is not its own breadcrumb

  const labels = new Map<string, string>();
  for (const l of [...site.nav, ...site.footerLinks]) {
    const path = l.href.split('?')[0].split('#')[0].replace(/\/$/, '');
    if (path && !labels.has(path)) labels.set(path, l.label);
  }

  const trail = [{ name: 'Home', path: '/' }];
  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLeaf = i === segments.length - 1;
    const fallback = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    trail.push({
      name: (isLeaf && leafName) || labels.get(acc) || fallback,
      path: acc,
    });
  });
  return breadcrumbSchema(origin, trail);
}

export function breadcrumbSchema(origin: string, trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(origin, c.path),
    })),
  };
}

/** One node per offer, so each can surface for its own service query. */
export function servicesSchema(services: Service[], site: SiteSettings, origin: string) {
  return services.map((s) => ({
    '@type': 'Service',
    name: s.title,
    description: s.description,
    serviceType: s.kicker,
    url: abs(origin, `/services#${s.slug}`),
    provider: { '@id': personId(origin) },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    ...(site.location ? { availableChannel: { '@type': 'ServiceChannel', servicePhone: site.phone } } : {}),
  }));
}

/** The Shopify sub-services. Same shape, but they have no slug to anchor to. */
export function shopifyServicesSchema(
  services: ShopifyService[],
  origin: string,
  pageUrl: string,
) {
  return services.map((s) => ({
    '@type': 'Service',
    name: s.title,
    description: s.description,
    serviceType: s.tagline,
    url: pageUrl,
    provider: { '@id': personId(origin) },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
  }));
}

/** Case studies are creative work, not articles — CreativeWork fits better. */
export function caseStudySchema(p: Project, origin: string, canonical: string) {
  return {
    '@type': 'CreativeWork',
    '@id': `${canonical}#case-study`,
    name: p.title,
    headline: p.title,
    description: p.summary,
    url: canonical,
    creator: { '@id': personId(origin) },
    author: { '@id': personId(origin) },
    ...(p.year ? { dateCreated: p.year } : {}),
    ...(p.tags?.length ? { keywords: p.tags.join(', ') } : {}),
    isPartOf: { '@id': siteId(origin) },
  };
}

/** Blog posts. `datePublished` must be ISO-8601 for the Article rich result. */
export function articleSchema(post: Post, origin: string, canonical: string, image?: string) {
  return {
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline: post.title,
    description: post.excerpt,
    url: canonical,
    datePublished: post.publishedAt,
    // Falls back to the publish date when the post has never been revised —
    // dateModified only carries a freshness signal if it reflects real work.
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@id': personId(origin) },
    publisher: { '@id': personId(origin) },
    mainEntityOfPage: { '@id': canonical },
    articleSection: post.categoryLabel,
    isPartOf: { '@id': siteId(origin) },
    ...(image ? { image: [image] } : {}),
  };
}
