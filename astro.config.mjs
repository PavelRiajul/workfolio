// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const {
  PUBLIC_SANITY_PROJECT_ID = 'placeholder',
  PUBLIC_SANITY_DATASET = 'production',
} = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

/**
 * `lastmod` dates for the blog routes, keyed by pathname.
 *
 * The config is evaluated before the Astro runtime exists, so it can't use the
 * loaders in `src/lib/content.ts` — hence the direct query here. It applies the
 * same rule they do: Sanity wins, the seed fills the gaps.
 *
 * Only the blog gets a `lastmod`, because only posts carry a real revision
 * date. Stamping the static pages with the build time would mark all fourteen
 * as modified on every deploy, and a sitemap whose dates are obviously
 * synthetic is one Google stops trusting entirely.
 */
async function blogLastmod() {
  const { posts: seeded } = await import('./src/data/content.ts');
  /** @type {Map<string, Record<string, any>>} */
  const dates = new Map(seeded.map((p) => [p.slug, { ...p }]));

  if (PUBLIC_SANITY_PROJECT_ID !== 'placeholder') {
    try {
      const query = encodeURIComponent(
        '*[_type=="post"]{"slug":slug.current,publishedAt,updatedAt,category,"hasBody":defined(body)}'
      );
      const res = await fetch(
        `https://${PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-10-01/data/query/${PUBLIC_SANITY_DATASET}?query=${query}`
      );
      if (res.ok) {
        const { result = [] } = await res.json();
        for (const doc of result) {
          if (!doc.slug) continue;
          const base = dates.get(doc.slug) ?? {};
          dates.set(doc.slug, {
            ...base,
            ...Object.fromEntries(Object.entries(doc).filter(([, v]) => v != null)),
          });
        }
      }
    } catch {
      /* Offline or unreachable — the seeded dates are still real dates. */
    }
  }

  /** @type {Map<string, string>} */
  const map = new Map();
  /** @type {(a: string | undefined, b: string | undefined) => string | undefined} */
  const newest = (a, b) => (!a || (b && b > a) ? b : a);
  /** @type {string | undefined} */
  let blogNewest = undefined;

  for (const post of dates.values()) {
    // Match the publish gate: a post without a body has no page to date.
    if (!post.slug || !(post.hasBody || post.body?.length)) continue;
    const when = post.updatedAt || post.publishedAt;
    if (!when) continue;
    map.set(`/blog/${post.slug}/`, when);
    if (post.category) {
      const hub = `/blog/category/${post.category}/`;
      const latest = newest(map.get(hub), when);
      if (latest) map.set(hub, latest);
    }
    blogNewest = newest(blogNewest, when);
  }
  if (blogNewest) map.set('/blog/', blogNewest);

  return map;
}

const lastmodByPath = await blogLastmod();

// https://astro.build/config
export default defineConfig({
  // The canonical origin — it must be a host that actually resolves.
  //
  // Every canonical, `og:url`, sitemap `<loc>`, RSS `<link>` and JSON-LD `@id`
  // is built from this value, so a host that fails to resolve tells crawlers
  // "the real copy of this page lives over there" and points them at nothing —
  // which suppresses indexing far more effectively than having no canonical at
  // all. That is what `https://riajulislam.dev` did here: never registered, no
  // A record, no NS delegation. It was parked on the Vercel preview host until
  // a real domain existed.
  //
  // Change `Sitemap:` in `public/robots.txt` with this — that file is static,
  // so it does not read this value.
  site: 'https://pavelriajul.com',
  // Secretly fetch a page on link hover so in-site navigation feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // CRO used to be its own page; it now lives inside /shopify.
  redirects: {
    '/cro': '/shopify#cro',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      // Pull live data; flip to true once you point at a real project + CDN.
      useCdn: false,
      apiVersion: '2024-10-01',
      // Embedded Sanity Studio served at /admin
      studioBasePath: '/admin',
    }),
    react(),
    // The Studio is a private app, not a page — keep it out of the sitemap.
    // `/resume` is deliberately included: it's a real landing page for name searches.
    sitemap({
      // A sitemap is a list of URLs you are asking Google to index, so a
      // malformed one is worse than an omission. `/work/beauty%20/` (a slug
      // authored with a trailing space) and `/work/Gym/` (uppercase) are both
      // live and were both being advertised here. They stay reachable — the
      // route still builds and the slug is fixed in the Studio, not by
      // deleting someone's page — they just stop being recommended.
      filter: (page) => {
        if (page.includes('/admin')) return false;
        const path = new URL(page).pathname;
        return path === path.toLowerCase() && !/%20|\s/.test(path);
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const lastmod = lastmodByPath.get(path);
        return lastmod ? { ...item, lastmod: new Date(lastmod).toISOString() } : item;
      },
    }),
  ],
});
