/**
 * Renders a per-page 1200×630 social card into public/og/.
 *
 *   npm run og
 *
 * Every card is generated from the same content the page renders — no separate
 * copy to keep in sync. Output is committed to public/, so a normal build (and
 * CI, and Netlify/Vercel) never needs Chrome; re-run this only when the copy or
 * the card design changes.
 *
 * Uses the local Chrome via puppeteer-core, matching the .vt-shoot.mjs pattern.
 */
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { loadEnv } from 'vite';

import {
  site,
  home,
  about,
  posts as seededPosts,
  projects,
  servicesPage,
  stackPage,
  shopifyPage,
  workPage,
  blogPage,
  startPage,
} from '../src/data/content.ts';
import { categoryLabel } from '../src/lib/categories.ts';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/og');
mkdirSync(OUT, { recursive: true });

// Plain `node` doesn't read .env, and reaching for process.env alone would make
// this fall back to the seed silently on a machine that is configured correctly.
const {
  PUBLIC_SANITY_PROJECT_ID: PROJECT_ID = 'placeholder',
  PUBLIC_SANITY_DATASET: DATASET = 'production',
} = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

/**
 * The posts that actually have pages, which is not the same as the seeded ones.
 *
 * This script runs outside the Astro runtime, so it can't use the loaders in
 * `src/lib/content.ts` — hence the direct query, exactly as `blogLastmod()` in
 * `astro.config.mjs` does it. It applies the same rule the loaders do: the live
 * documents decide membership, the seed fills any field they're missing.
 *
 * Importing the seed array alone is what left 97 of 106 posts on the generic
 * fallback card — `src/data/content.ts` still holds the original ten, while
 * every post published since lives only in Sanity.
 */
async function publishedPosts() {
  const seeded = new Map(seededPosts.map((p) => [p.slug, p]));
  if (PROJECT_ID === 'placeholder') return [...seeded.values()];

  try {
    const query = encodeURIComponent(
      '*[_type=="post" && defined(body)]{"slug":slug.current,title,excerpt,readTime,category,categoryLabel}'
    );
    const res = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${query}`
    );
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);

    const { result = [] } = await res.json();
    const live = result.filter((d: { slug?: string }) => d.slug);
    if (!live.length) throw new Error('no published posts returned');

    // Live wins per field, seed fills the gaps — `withFallback`, by hand.
    return live.map((doc: Record<string, unknown>) => ({
      ...(seeded.get(doc.slug as string) ?? {}),
      ...Object.fromEntries(Object.entries(doc).filter(([, v]) => v != null)),
    }));
  } catch (err) {
    console.warn(`  ! Sanity unavailable (${(err as Error).message}) — using seeded posts only.`);
    return [...seeded.values()];
  }
}

const posts = await publishedPosts();

/** A card is a route + the two lines of text that go on it. */
type Card = { file: string; eyebrow: string; title: string; sub: string };

/** The route → filename rule Base.astro mirrors: "/work/halo" → "work-halo". */
const fileFor = (path: string) =>
  path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');

const cards: Card[] = [
  // The footer already carries the role — the eyebrow earns its place with the
  // availability line instead of repeating it.
  { file: fileFor('/'), eyebrow: home.availabilityChip, title: home.seo.title.split('—')[0].trim(), sub: home.seo.description },
  { file: fileFor('/work'), eyebrow: 'Selected work', title: 'Work', sub: workPage.seo.description },
  { file: fileFor('/services'), eyebrow: 'What I do', title: 'Services', sub: servicesPage.seo.description },
  { file: fileFor('/shopify'), eyebrow: 'Shopify & CRO', title: 'Shopify & CRO', sub: shopifyPage.seo.description },
  { file: fileFor('/stack'), eyebrow: 'Tools & templates', title: 'The Stack', sub: stackPage.seo.description },
  { file: fileFor('/about'), eyebrow: 'About', title: 'About Riajul', sub: about.seo.description },
  { file: fileFor('/blog'), eyebrow: 'Writing', title: 'Blog', sub: blogPage.seo.description },
  { file: fileFor('/start'), eyebrow: "Let's talk", title: 'Start a project', sub: startPage.seo.description },
  { file: 'resume', eyebrow: 'Résumé', title: 'Résumé', sub: `${site.role} — ${site.location}.` },
  // One per case study and per post, so a shared deep link is never generic.
  ...projects
    .filter((p) => p.hasCaseStudy)
    .map((p) => ({
      file: fileFor(`/work/${p.slug}`),
      eyebrow: `Case study — ${p.type}`,
      title: p.title,
      sub: p.summary,
    })),
  // `categoryLabel` is an optional per-post override, so derive it the way the
  // pages do rather than reading the field — a post that left it blank would
  // otherwise put "undefined" on its card.
  ...posts.map((p) => ({
    file: fileFor(`/blog/${p.slug}`),
    eyebrow: `${categoryLabel(p.category, p.categoryLabel)} · ${p.readTime}`,
    title: p.title,
    sub: p.excerpt,
  })),
  // One per topic hub, so /blog/category/<slug> doesn't fall back to the
  // generic blog card. Driven by the same categoryIntros the hubs render.
  ...(blogPage.categoryIntros ?? []).map((c) => ({
    file: fileFor(`/blog/category/${c.category}`),
    eyebrow: 'Writing',
    title: c.title,
    sub: c.lede,
  })),
  // Fallback for any route without its own card.
  { file: 'default', eyebrow: site.role, title: site.name, sub: site.seo.description },
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The card markup — the site's own visual language: white, ink, one blue
 *  accent, dotted-grid motif, the handwritten signature. */
function template({ eyebrow, title, sub }: Card) {
  // Long headlines need to step down a size or they overflow the card.
  const size = title.length > 60 ? 52 : title.length > 46 ? 58 : title.length > 28 ? 72 : 88;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Geist:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#fff;font-family:Inter,sans-serif;
       position:relative;overflow:hidden}
  .grid{position:absolute;inset:0;
        background-image:radial-gradient(rgba(10,10,10,.10) 1px,transparent 1px);
        background-size:26px 26px;
        -webkit-mask-image:linear-gradient(120deg,#000 0%,transparent 62%)}
  .accent{position:absolute;top:0;left:0;width:100%;height:8px;background:#2563eb}
  .wrap{position:absolute;inset:0;padding:62px 82px;display:flex;
        flex-direction:column;justify-content:space-between;gap:30px}
  .sig{font-family:Caveat,cursive;font-weight:700;font-size:40px;color:#0a0a0a}
  .eyebrow{font-family:'Geist',sans-serif;font-size:20px;font-weight:500;letter-spacing:.14em;
           text-transform:uppercase;color:#2563eb;margin-bottom:22px}
  h1{font-family:'Geist',sans-serif;font-weight:700;font-size:${size}px;line-height:1.06;
     letter-spacing:-.028em;color:#0a0a0a;max-width:15ch}
  p{font-size:25px;line-height:1.5;color:#5c5c5c;max-width:60ch;margin-top:26px}
  .foot{display:flex;align-items:center;justify-content:space-between;
        border-top:1px solid rgba(10,10,10,.10);padding-top:26px}
  .role{font-size:21px;color:#5c5c5c}
  .dom{font-family:'Geist',sans-serif;font-size:21px;font-weight:600;color:#0a0a0a}
</style></head><body>
  <div class="grid"></div><div class="accent"></div>
  <div class="wrap">
    <div class="sig">${esc(site.name)}</div>
    <div>
      <div class="eyebrow">${esc(eyebrow)}</div>
      <h1>${esc(title)}</h1>
      <p>${esc(sub)}</p>
    </div>
    <div class="foot">
      <span class="role">${esc(site.role)}</span>
      <span class="dom">${esc(site.website)}</span>
    </div>
  </div>
</body></html>`;
}

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME} — set CHROME to your browser path.`);
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

for (const card of cards) {
  // `networkidle0` stalls here: the font CSS is served from cache on the second
  // card onward, so the "network went quiet" event never fires again. Waiting
  // on document.fonts is both correct and faster — it's the thing we actually
  // care about, since a screenshot taken pre-swap renders in Times New Roman.
  await page.setContent(template(card), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/${card.file}.png` });
  console.log(`  og/${card.file}.png`);
}

await browser.close();
console.log(`\n${cards.length} cards written to public/og/`);
