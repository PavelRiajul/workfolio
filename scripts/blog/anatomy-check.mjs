/**
 * Check post files against the anatomy without publishing anything.
 *
 *   npm run blog:check -- scripts/blog/posts/post-foo.mjs
 *   npm run blog:check                 # every post in scripts/blog/posts
 *
 * Exits non-zero if any post fails, so it can gate a commit or a CI step.
 */
import { readdirSync } from 'fs';
import { report } from './anatomy.mjs';

const dir = new URL('./posts/', import.meta.url);
const args = process.argv.slice(2);

const files = args.length
  ? args.map((a) => new URL(a, `file://${process.cwd()}/`).href)
  : readdirSync(dir)
      .filter((f) => f.startsWith('post-') && f.endsWith('.mjs'))
      .sort()
      .map((f) => new URL(f, dir).href);

if (!files.length) {
  console.error('No post files found.');
  process.exit(1);
}

let failed = 0;
for (const f of files) {
  const post = (await import(f)).default;
  if (!report(post)) failed++;
}

console.log(`\n${files.length - failed}/${files.length} passed.`);
process.exit(failed ? 1 : 0);
