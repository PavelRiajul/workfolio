/**
 * Spread `publishedAt` across a plausible past schedule, ending today.
 *
 *   node scripts/blog/redate.mjs            # dry run — prints the plan
 *   node scripts/blog/redate.mjs --write    # rewrite the source files, then patch Sanity
 *
 * 98 of 106 posts were dated in the future, which Google treats as a
 * reliability signal: it ignores the date, can suppress the date-based rich
 * result, and a feed reader hides future-dated items entirely. The date reaches
 * three places that matter — `datePublished` in the Article JSON-LD, `lastmod`
 * in the sitemap, and `pubDate` in RSS.
 *
 * The source `.mjs` files are rewritten first and Sanity is patched from what
 * they now say, so a later `blog:push` can't silently revert the fix — which is
 * exactly what would happen if only the dataset were corrected.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const PROJECT = '1tfx8i80';
const DATASET = 'production';
const WRITE = process.argv.includes('--write');

/** Ends today; ~2.5 days between posts, preserving the authored `order`. */
const END = '2026-08-05';
const SPACING_DAYS = 2.5;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const dir = new URL('./posts/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.startsWith('post-') && f.endsWith('.mjs'));

// Load every post so the schedule follows the authored order rather than
// filename order, which is arbitrary.
const posts = [];
for (const f of files) {
  const mod = (await import(new URL(f, dir).href)).default;
  posts.push({ file: f, id: mod._id, slug: mod.slug, order: mod.order ?? 0 });
}
posts.sort((a, b) => a.order - b.order);

const end = new Date(`${END}T00:00:00Z`);
for (const [i, p] of posts.entries()) {
  const back = Math.round((posts.length - 1 - i) * SPACING_DAYS);
  const d = new Date(end.getTime() - back * 86400_000);
  p.publishedAt = d.toISOString().slice(0, 10);
  // The display label is a month-and-year string and has to agree with the
  // ISO date, or the page contradicts its own structured data.
  p.date = `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

console.log(`${posts.length} posts · ${posts[0].publishedAt} → ${posts.at(-1).publishedAt}`);
for (const p of [...posts.slice(0, 3), null, ...posts.slice(-3)]) {
  if (!p) { console.log('  …'); continue; }
  console.log(`  ${String(p.order).padStart(3)}  ${p.publishedAt}  ${p.date.padEnd(15)} ${p.slug}`);
}

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply.');
  process.exit(0);
}

// 1. Rewrite the source files, so they remain the source of truth.
let rewritten = 0;
for (const p of posts) {
  const path = new URL(p.file, dir);
  const before = readFileSync(path, 'utf8');
  const after = before
    .replace(/(\n\s*publishedAt:\s*')[\d-]+(')/, `$1${p.publishedAt}$2`)
    .replace(/(\n\s*date:\s*')[^']+(')/, `$1${p.date}$2`);
  if (after === before) {
    console.error(`  ! ${p.file} — no date fields matched, leaving it alone`);
    continue;
  }
  writeFileSync(path, after);
  rewritten++;
}
console.log(`\nRewrote ${rewritten}/${posts.length} source files.`);

// 2. Patch Sanity from what the files now say.
const token = JSON.parse(
  readFileSync(process.env.HOME + '/.config/sanity/config.json', 'utf8')
).authToken;

const mutations = posts.map((p) => ({
  patch: { id: p.id, set: { publishedAt: p.publishedAt, date: p.date } },
}));

const res = await fetch(
  `https://${PROJECT}.api.sanity.io/v2024-10-01/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  }
);
const out = await res.json();
if (!res.ok) {
  console.error('\nSanity rejected the write:', JSON.stringify(out, null, 2));
  process.exit(1);
}
console.log(`Patched ${posts.length} documents in Sanity.`);
