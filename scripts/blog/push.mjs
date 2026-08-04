/**
 * Write posts into the production dataset.
 *
 * Uses `patch`/`set` on named fields rather than `createOrReplace`, so nothing
 * already on the document — order, featured, coverLabel, an uploaded image — is
 * dropped by a write that simply did not mention it. `createIfNotExists` runs
 * first so the same script handles new and existing posts.
 *
 * Every post must clear the anatomy gate before it is sent.
 */
import { readFileSync, writeFileSync } from 'fs';
import { audit, report } from './anatomy.mjs';

const PROJECT = '1tfx8i80';
const DATASET = 'production';
const token = JSON.parse(readFileSync(process.env.HOME + '/.config/sanity/config.json', 'utf8')).authToken;

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: npm run blog:push -- scripts/blog/posts/post-<name>.mjs');
  process.exit(1);
}

// Resolve against the working directory. A bare `scripts/blog/posts/x.mjs` is a
// package specifier to `import()`, not a path, so it has to become a file URL.
const resolved = files.map((f) => new URL(f, `file://${process.cwd()}/`).href);

const posts = [];
for (const f of resolved) {
  const post = (await import(f)).default;
  if (!report(post)) {
    console.error(`\nRefusing to publish ${post.slug} — it does not meet the anatomy.`);
    process.exit(1);
  }
  posts.push(post);
}

const mutations = [];
for (const p of posts) {
  mutations.push({
    createIfNotExists: {
      _id: p._id,
      _type: 'post',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      category: p.category,
    },
  });
  mutations.push({
    patch: {
      id: p._id,
      set: {
        title: p.title,
        slug: { _type: 'slug', current: p.slug },
        category: p.category,
        readTime: p.readTime,
        date: p.date,
        publishedAt: p.publishedAt,
        excerpt: p.excerpt,
        coverLabel: p.coverLabel,
        body: p.body,
        faqs: p.faqs,
        ...(p.series ? { series: p.series } : {}),
        ...(p.order !== undefined ? { order: p.order } : {}),
      },
    },
  });
}

const res = await fetch(
  `https://${PROJECT}.api.sanity.io/v2024-10-01/data/mutate/${DATASET}?returnIds=true`,
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
console.log(`\nWrote ${posts.length} post(s):`, out.results.map((r) => r.id).join(', '));

// Advance the queue here rather than by hand. Doing it manually is how the
// record of what has shipped drifts from what actually shipped, and the queue
// is the only thing that makes the work resumable in a later session.
const QUEUE = new URL('./queue.json', import.meta.url);
const queue = JSON.parse(readFileSync(QUEUE, 'utf8'));

for (const post of posts) {
  if (queue.done.some((d) => d.slug === post.slug)) continue;
  queue.done.push({
    slug: post.slug,
    cat: post.category,
    id: post._id,
    words: audit(post).got.words,
  });
  const list = queue.remaining[post.category];
  if (list) queue.remaining[post.category] = list.filter((s) => s !== post.slug);
}

// The next category with anything left in it, in the declared order.
queue.current_category =
  queue.categories.find((c) => (queue.remaining[c] ?? []).length) ?? null;

writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + '\n');

const left = Object.values(queue.remaining).reduce((a, v) => a + v.length, 0);
console.log(
  `Queue: ${queue.done.length} published, ${left} remaining` +
    (queue.current_category ? ` — next category: ${queue.current_category}` : ' — all categories complete')
);
