/**
 * Measure a competitor's blog so a content plan is built on numbers rather
 * than impressions.
 *
 *   node scripts/blog/benchmark.mjs <url> [url…]
 *   node scripts/blog/benchmark.mjs --index https://example.com/blog
 *
 * `--index` pulls candidate post URLs off a listing page first, then measures a
 * sample of them. Otherwise every URL given is measured directly.
 *
 * It isolates the article body before counting. Counting the whole document
 * inflates every figure by the nav, footer and mega-menu — on the site this was
 * first written against that was ~1,000 words and 90 images of pure chrome, which
 * is enough to make a 2,800-word post look like a 3,800-word one.
 */
const args = process.argv.slice(2);
if (!args.length) {
  console.error('usage: node scripts/blog/benchmark.mjs [--index] <url> [url…]');
  process.exit(1);
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const fetchText = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
};

/**
 * The article body, as well as it can be identified without a DOM.
 *
 * Prefers an explicit <article> or <main>; falls back to the span between the
 * first <h1> and whatever footer marker appears after it. Imperfect, and far
 * closer than counting the whole page.
 */
function articleHtml(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  const tagged = stripped.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || stripped.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (tagged) return tagged[1];

  const start = stripped.search(/<h1[\s>]/i);
  if (start === -1) return stripped;
  const after = stripped.slice(start);
  const end = after.search(/class="[^"]*footer|id="footer|<\/main>/i);
  return end > 0 ? after.slice(0, end) : after;
}

const count = (s, re) => (s.match(re) || []).length;
const textOf = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function measure(url, html) {
  const art = articleHtml(html);
  const imgs = [...art.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const words = textOf(art).split(' ').filter((w) => /[a-zA-Z0-9]/.test(w)).length;
  const h2s = [...art.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => textOf(m[1]));

  // Schema types, and whether they are one connected graph or several blocks.
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const types = [];
  let graphs = 0;
  for (const m of ld) {
    try {
      const j = JSON.parse(m[1]);
      if (j['@graph']) graphs++;
      types.push(...(j['@graph'] ?? [j]).map((n) => n['@type']).flat());
    } catch {
      types.push('PARSE-ERROR');
    }
  }

  return {
    url,
    words,
    h2: h2s.length,
    h2q: h2s.filter((t) => t.includes('?')).length,
    h3: count(art, /<h3[\s>]/gi),
    images: imgs.length,
    noAlt: imgs.filter((i) => !/\balt\s*=\s*["'][^"']+["']/.test(i)).length,
    tables: count(art, /<table[\s>]/gi),
    listItems: count(art, /<li[\s>]/gi),
    intLinks: new Set([...art.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1])).size,
    title: (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim().slice(0, 70),
    metaDesc: html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]?.length ?? 0,
    schema: [...new Set(types)].join(', ') || 'none',
    ldBlocks: ld.length,
    graphs,
    h2s,
  };
}

// ---------------------------------------------------------------- collect
let urls = args.filter((a) => a !== '--index');
if (args.includes('--index')) {
  const indexUrl = urls[0];
  const html = await fetchText(indexUrl);
  const origin = new URL(indexUrl).origin;
  const base = new URL(indexUrl).pathname.replace(/\/$/, '');
  const found = new Set(
    [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => h.includes(base + '/') && !h.endsWith(base + '/'))
      .map((h) => (h.startsWith('http') ? h : origin + h))
      .map((h) => h.split('#')[0].split('?')[0])
  );
  urls = [...found];
  console.log(`Found ${urls.length} candidate posts on ${indexUrl}`);
  // A sample spread across the listing beats the first N, which are usually
  // the newest and not representative of the back catalogue.
  const SAMPLE = 8;
  if (urls.length > SAMPLE) {
    const step = Math.floor(urls.length / SAMPLE);
    urls = Array.from({ length: SAMPLE }, (_, i) => urls[i * step]);
  }
  console.log(`Measuring ${urls.length}:\n`);
}

// ---------------------------------------------------------------- measure
const MIN_WORDS = Number(process.env.MIN_WORDS ?? 400);
const all = [];
for (const url of urls) {
  try {
    all.push(measure(url, await fetchText(url)));
  } catch (e) {
    console.error(`  skip ${url} — ${e.message}`);
  }
}

// A listing page links to category and tag pages that live under the same path
// as the posts, and they measure as very short articles. Including them drags
// every median toward nonsense, so they are reported and excluded.
const rows = all.filter((r) => r.words >= MIN_WORDS);
const thin = all.filter((r) => r.words < MIN_WORDS);
if (thin.length) {
  console.error(
    `\nExcluded ${thin.length} page(s) under ${MIN_WORDS} words — almost always category or tag pages, not articles:`
  );
  thin.forEach((r) => console.error(`  ${r.words.toString().padStart(5)}w  ${r.url}`));
  console.error('  (override with MIN_WORDS=0)\n');
}

if (!rows.length) {
  console.error(
    'Nothing measurable. If the site renders its articles client-side, this\n' +
      'script sees an empty shell — measure it with a headless browser instead.'
  );
  process.exit(1);
}

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

console.log(
  pad('post', 42) + num('words', 7) + num('h2', 4) + num('?h2', 5) + num('h3', 5) +
    num('img', 5) + num('noalt', 6) + num('tbl', 5) + num('li', 5) + num('links', 6) + num('meta', 6)
);
for (const r of rows) {
  const slug = new URL(r.url).pathname.split('/').filter(Boolean).pop() ?? r.url;
  console.log(
    pad(slug.slice(0, 41), 42) + num(r.words, 7) + num(r.h2, 4) + num(r.h2q, 5) + num(r.h3, 5) +
      num(r.images, 5) + num(r.noAlt, 6) + num(r.tables, 5) + num(r.listItems, 5) +
      num(r.intLinks, 6) + num(r.metaDesc, 6)
  );
}

const stat = (key) => {
  const v = rows.map((r) => r[key]).sort((a, b) => a - b);
  return {
    min: v[0],
    median: v[Math.floor(v.length / 2)],
    mean: Math.round(v.reduce((a, b) => a + b, 0) / v.length),
    max: v[v.length - 1],
  };
};

const w = stat('words');
console.log(`\nWORDS   min ${w.min} · median ${w.median} · mean ${w.mean} · max ${w.max}`);
for (const k of ['h2', 'h2q', 'h3', 'images', 'tables', 'intLinks']) {
  const s = stat(k);
  console.log(`${pad(k.toUpperCase(), 8)}min ${s.min} · median ${s.median} · max ${s.max}`);
}

console.log(`\nSCHEMA          ${rows[0].schema}`);
console.log(`JSON-LD blocks  ${rows.map((r) => r.ldBlocks).join(', ')}  (one connected @graph is better than several)`);
console.log(`Meta desc len   ${rows.map((r) => r.metaDesc).join(', ')}  (0 = missing; Google writes the snippet instead)`);
console.log(`Images w/o alt  ${rows.reduce((a, r) => a + r.noAlt, 0)} of ${rows.reduce((a, r) => a + r.images, 0)}`);

console.log('\nH2 OUTLINE OF THE MEDIAN POST');
const median = rows.slice().sort((a, b) => a.words - b.words)[Math.floor(rows.length / 2)];
console.log(`  ${median.url}`);
median.h2s.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${t.slice(0, 88)}`));

console.log('\nSuggested target for your own posts:');
console.log(`  words ${Math.max(2500, Math.round(w.median * 0.6))}–${Math.round(w.median)} · h2 ${stat('h2').min}–${stat('h2').max} · h3 ${stat('h3').median}+`);
console.log(`  images ${Math.max(6, stat('images').median)} (one per ~${Math.round(w.median / Math.max(1, stat('images').median))} words) · tables ${Math.max(1, stat('tables').median)}+`);
console.log('  Aim below their median, not at their max — the long tail is usually padded listicles.');
