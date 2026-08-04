/**
 * Add glyphs to `src/lib/icons.ts` from Font Awesome Free.
 *
 *   npm run icons -- brands:instagram brands:youtube solid:link
 *
 * `src/lib/icons.ts` has always pointed at a script like this; it didn't exist,
 * so every glyph had to be pasted in by hand and the site shipped with an
 * `fa-x-twitter` class that had no geometry behind it and rendered nothing.
 *
 * Keys are the same "<style>:<name>" pair the Studio authors as
 * "fa-brands fa-instagram". Existing entries are left alone, so re-running is
 * safe. Icons are CC BY 4.0 — https://fontawesome.com/license/free
 */
import { readFileSync, writeFileSync } from 'node:fs';

const VERSION = '6.5.1';
const ICONS_FILE = new URL('../src/lib/icons.ts', import.meta.url);

const requested = process.argv.slice(2);
if (!requested.length) {
  console.error('Usage: npm run icons -- brands:instagram solid:link');
  process.exit(1);
}

const source = readFileSync(ICONS_FILE, 'utf8');
const additions: string[] = [];

for (const key of requested) {
  const [style, name] = key.split(':');
  if (!style || !name) {
    console.error(`  skip  ${key} — expected "<style>:<name>"`);
    continue;
  }
  if (source.includes(`'${key}'`)) {
    console.log(`  have  ${key}`);
    continue;
  }

  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@${VERSION}/svgs/${style}/${name}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  FAIL  ${key} — ${res.status} ${res.statusText}`);
    continue;
  }

  const svg = await res.text();
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  const path = svg.match(/ d="([^"]+)"/)?.[1];
  if (!viewBox || !path) {
    console.error(`  FAIL  ${key} — no viewBox/path in the response`);
    continue;
  }

  additions.push(`  '${key}': ['${viewBox}', '${path}'],`);
  console.log(`  add   ${key}`);
}

if (!additions.length) {
  console.log('\nNothing to add.');
  process.exit(0);
}

// Insert before the closing brace of the ICONS object so the file stays valid
// whatever order the entries were added in.
const close = source.lastIndexOf('};');
if (close === -1) {
  console.error('Could not find the end of the ICONS object — aborting.');
  process.exit(1);
}
writeFileSync(ICONS_FILE, source.slice(0, close) + additions.join('\n') + '\n' + source.slice(close));
console.log(`\nAdded ${additions.length} icon(s) to src/lib/icons.ts`);
