/**
 * SEO invariants, asserted against the built site in dist/.
 *
 *   npm run seo:check          # after npm run build
 *
 * These are the things that silently broke, or nearly did, and that no test
 * would otherwise catch. Each one failed at least once in this repo:
 *
 *   - a slug authored with a trailing space shipped /work/beauty%20/ into the
 *     sitemap, duplicating a real page
 *   - project covers went out as 6.65 MB PNGs because the CDN transform was
 *     never wired up
 *   - the case-study hero, the LCP element, was marked loading="lazy"
 *
 * It reads the build output rather than the source, because the build output
 * is what Google sees. Static site, so dist/ is the server response.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const failures = [];
const fail = (msg) => failures.push(msg);

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/** Every built page except the embedded Studio, which is an app, not content. */
function pages(dir = DIST, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry !== 'admin' && entry !== '_astro') pages(p, out);
    } else if (entry.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const html = pages();
if (html.length < 50) fail(`only ${html.length} pages built — expected the full site`);

const titles = new Map();

for (const file of html) {
  const src = readFileSync(file, 'utf8');
  const route = '/' + relative(DIST, file).replace(/index\.html$/, '');

  const title = src.match(/<title>([^<]*)<\/title>/)?.[1];
  const canonical = src.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const description = src.match(/name="description" content="([^"]*)"/)?.[1];

  // Nothing indexable may be missing the basics.
  if (!title) fail(`${route} — no <title>`);
  if (!description) fail(`${route} — no meta description`);
  if (!canonical) fail(`${route} — no canonical`);
  if (canonical && !canonical.startsWith('https://')) {
    fail(`${route} — canonical is not absolute: ${canonical}`);
  }
  if ((src.match(/<h1/g) || []).length !== 1) {
    fail(`${route} — expected exactly one <h1>, found ${(src.match(/<h1/g) || []).length}`);
  }

  // A sitewide noindex is the classic "traffic vanished overnight" incident.
  if (/name="robots"[^>]*noindex/.test(src)) fail(`${route} — carries noindex`);

  if (title) {
    titles.set(title, [...(titles.get(title) ?? []), route]);
  }

  // Raw Sanity CDN URLs mean the transform pipeline was bypassed again.
  const untransformed = src.match(/cdn\.sanity\.io\/images\/[^"?]+\.(png|jpg|jpeg)(?=["&])/g);
  if (untransformed) {
    fail(`${route} — ${untransformed.length} untransformed Sanity image(s); use Placeholder`);
  }
}

for (const [title, routes] of titles) {
  if (routes.length > 1) fail(`duplicate <title> ${JSON.stringify(title)} on ${routes.join(', ')}`);
}

/* ---- Sitemap ----------------------------------------------------------- */
const smFile = join(DIST, 'sitemap-0.xml');
if (!existsSync(smFile)) {
  fail('no sitemap-0.xml');
} else {
  const sm = readFileSync(smFile, 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) fail('sitemap is empty');
  // Google ignores both; leaving them in just invites someone to tune them.
  if (sm.includes('<priority>')) fail('sitemap contains <priority>');
  if (sm.includes('<changefreq>')) fail('sitemap contains <changefreq>');
  for (const loc of locs) {
    if (loc.includes('/admin')) fail(`sitemap lists the Studio: ${loc}`);
    const path = new URL(loc).pathname;
    if (path !== path.toLowerCase() || /%20|\s/.test(path)) {
      fail(`sitemap lists a malformed URL: ${loc}`);
    }
    // Every sitemap entry must be a page we actually built.
    const asFile = join(DIST, decodeURIComponent(path), 'index.html');
    if (!existsSync(asFile)) fail(`sitemap lists a URL with no page: ${loc}`);
  }
}

/* ---- robots.txt -------------------------------------------------------- */
const robotsFile = join(DIST, 'robots.txt');
if (!existsSync(robotsFile)) {
  fail('no robots.txt');
} else {
  const robots = readFileSync(robotsFile, 'utf8');
  // The staging Disallow reaching production is the most common serious SEO
  // incident there is.
  if (/^\s*Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt contains a bare `Disallow: /`');
  if (!/^Sitemap:\s*https:\/\//m.test(robots)) fail('robots.txt has no absolute Sitemap: line');
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} SEO check(s) failed:\n`);
  for (const f of failures) console.error(`  · ${f}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ SEO checks passed across ${html.length} pages`);
