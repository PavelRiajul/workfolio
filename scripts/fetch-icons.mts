/**
 * Regenerate `src/lib/icons.ts` from two upstream sources.
 *
 *   npm run icons                     # refresh the set already in use
 *   npm run icons -- ui:layout-grid   # add a Lucide UI icon
 *   npm run icons -- brands:instagram # add a Font Awesome brand mark
 *
 * TWO SOURCES, DELIBERATELY:
 *
 * - **UI icons come from Lucide** (ISC). One 24×24 grid, one 2px stroke, every
 *   glyph drawn to the same optical rules. That systematic consistency is the
 *   entire point. The Font Awesome Free solid set this replaced mixed dense
 *   glyphs (house, user) with thin fiddly ones (feather, wand-magic-sparkles)
 *   that turned to mush at 16px — and paying for a Pro tier would not have
 *   fixed a set that was never designed as a system.
 *
 * - **Brand marks stay on Font Awesome** (CC BY 4.0). Lucide excludes brand
 *   logos on purpose, and a brand mark has to be the actual mark — you cannot
 *   represent GitHub with a generic glyph. They render filled; UI icons render
 *   stroked, and `Icon.astro` switches on the stored mode.
 *
 * Keys still mirror the Font Awesome class pair the CMS stores
 * ("fa-solid fa-house" → "solid:house"), so nothing authored in the Studio has
 * to change even though the geometry behind it is no longer Font Awesome's.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const LUCIDE = '1.28.0';
const ICONS_FILE = new URL('../src/lib/icons.ts', import.meta.url);

/**
 * Stored key → Lucide icon name.
 *
 * The key keeps its Font Awesome shape so the CMS keeps working; only the
 * drawing changes. Where Lucide names the same concept differently — envelope
 * → mail, bolt → zap, paper-plane → send — the mapping records the translation
 * so the next person does not have to rediscover it.
 */
const UI: Record<string, string> = {
  'solid:arrow-rotate-left': 'rotate-ccw',
  'solid:arrow-trend-up': 'trending-up',
  'solid:bag-shopping': 'shopping-bag',
  'solid:bolt': 'zap',
  'solid:calendar-check': 'calendar-check',
  'solid:check': 'check',
  'solid:circle-check': 'circle-check',
  'solid:envelope': 'mail',
  'solid:feather': 'feather',
  'solid:folder-open': 'folder-open',
  'solid:globe': 'globe',
  'solid:house': 'house',
  'solid:layer-group': 'layers',
  'solid:link': 'link',
  'solid:paper-plane': 'send',
  'solid:pen': 'pen',
  'solid:reply': 'reply',
  'solid:rocket': 'rocket',
  'solid:server': 'server',
  'solid:store': 'store',
  'solid:user': 'user',
  'solid:wand-magic-sparkles': 'wand-sparkles',
  'regular:clock': 'clock',
};

/** Anything passed as `ui:<lucide-name>` joins the set under a solid: key. */
for (const arg of process.argv.slice(2)) {
  const m = /^ui:([a-z0-9-]+)$/.exec(arg);
  if (m) UI[`solid:${m[1]}`] = m[1];
}

/** Strip a Lucide SVG down to the drawing inside it. */
function inner(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>[\s\S]*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

console.log(`Lucide v${LUCIDE} — fetching ${Object.keys(UI).length} UI icons`);

const ui: Record<string, [string, string]> = {};
for (const [key, name] of Object.entries(UI)) {
  const res = await fetch(`https://unpkg.com/lucide-static@${LUCIDE}/icons/${name}.svg`);
  if (!res.ok) {
    console.error(`  x ${key} — lucide/${name} not found (${res.status})`);
    process.exit(1);
  }
  const markup = inner(await res.text());
  if (!markup) {
    console.error(`  x ${key} — lucide/${name} parsed to nothing`);
    process.exit(1);
  }
  ui[key] = ['0 0 24 24', markup];
  console.log(`  + ${key.padEnd(30)} <- lucide/${name}`);
}

// Brand marks are the one thing here that cannot be regenerated from a package,
// so they are parsed out of the current file and carried across verbatim.
const current = readFileSync(ICONS_FILE, 'utf8');
const brands: Record<string, [string, string]> = {};
for (const m of current.matchAll(/'(brands:[a-z0-9-]+)':\s*\[\s*'([^']+)',\s*'([^']+)'/g)) {
  brands[m[1]] = [m[2], `<path d="${m[3]}"/>`];
}
if (!Object.keys(brands).length) {
  console.error('No brand marks found in the current file — aborting rather than dropping them.');
  process.exit(1);
}
console.log(`\nCarried over ${Object.keys(brands).length} Font Awesome brand marks.`);

const line = ([k, [vb, markup]]: [string, [string, string]], mode: string) =>
  `  '${k}': ['${vb}', '${markup.replace(/'/g, "\\'")}', '${mode}'],`;
const sorted = (o: Record<string, [string, string]>) =>
  Object.entries(o).sort(([a], [b]) => a.localeCompare(b));

writeFileSync(
  ICONS_FILE,
  `// ---------------------------------------------------------------------------
// Inline icon geometry. Replaces a render-blocking 110KB stylesheet from cdnjs
// plus two icon webfonts with a few KB of inline markup.
//
// TWO SOURCES, ON PURPOSE:
//
//   solid:/regular:  Lucide ${LUCIDE} (ISC). One 24x24 grid, one 2px stroke,
//                    drawn as a system. Rendered stroked.
//   brands:          Font Awesome Free 6.5.1 (CC BY 4.0). Lucide excludes brand
//                    logos deliberately, and a brand mark has to be the real
//                    mark. Rendered filled.
//
// Keys mirror the Font Awesome class pair the CMS stores ("fa-solid fa-house"
// -> "solid:house"), so icons stay authorable in the Studio unchanged even
// though the geometry behind them is no longer Font Awesome's.
//
// GENERATED - do not edit by hand. \`npm run icons\` refreshes the set;
// \`npm run icons -- ui:<lucide-name>\` adds one. An unknown key renders
// nothing rather than a broken glyph.
//
// Lucide https://lucide.dev  |  Font Awesome Free https://fontawesome.com/license/free
// ---------------------------------------------------------------------------

/** [viewBox, inner SVG markup, render mode] keyed by "<style>:<name>". */
export const ICONS: Record<string, [string, string, 'stroke' | 'fill']> = {
${sorted(ui).map((e) => line(e, 'stroke')).join('\n')}

${sorted(brands).map((e) => line(e, 'fill')).join('\n')}
};

/** Turns a Font Awesome class string into an ICONS key.
 *  "fa-solid fa-house" -> "solid:house". Returns null if it isn't one. */
export function iconKey(cls?: string): string | null {
  if (!cls) return null;
  const style = /fa-(solid|brands|regular)/.exec(cls)?.[1];
  const name = cls
    .split(/\\s+/)
    .map((c) => c.trim())
    .find((c) => c.startsWith('fa-') && !/^fa-(solid|brands|regular|fw|lg)$/.test(c));
  if (!style || !name) return null;
  return \`\${style}:\${name.slice(3)}\`;
}
`
);
console.log(`Wrote ${Object.keys(ui).length + Object.keys(brands).length} icons to src/lib/icons.ts`);
