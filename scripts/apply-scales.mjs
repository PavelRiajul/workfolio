/**
 * One-shot migration: map raw font-size and border-radius values in
 * `global.css` onto the token scales.
 *
 *   node scripts/apply-scales.mjs          # report only
 *   node scripts/apply-scales.mjs --write
 *
 * Decorative mockups are skipped deliberately. They imitate scaled-down
 * interfaces and their micro-type is doing a job — a fake dashboard set in
 * 15px stops reading as a dashboard. They are aria-hidden, so the 11px content
 * floor doesn't apply to them either.
 *
 * Kept as a record of what moved rather than deleted after running: the
 * mapping below is the answer to "why is this 13px and not 13.5px".
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../src/styles/global.css', import.meta.url);
const WRITE = process.argv.includes('--write');

/** Selector families whose internals are illustrations, not content. */
const DECOR = /\.(hv|sv|ov|sh|cro|velo|wk|bl-ed|bl-kicker|bl-tags|tk|fix|dash|funnel|exp-|lead-)/;

/** Raw px -> token. Half-pixels round down so text never grows into a layout. */
const TEXT = {
  '11px': '--text-2xs', '11.5px': '--text-2xs',
  '12px': '--text-xs', '12.5px': '--text-xs',
  '13px': '--text-sm', '13.5px': '--text-sm',
  '14px': '--text-md', '14.5px': '--text-md',
  '15px': '--text-base', '15.5px': '--text-base',
  '16px': '--text-lg', '17px': '--text-lg',
  '19px': '--text-xl', '20px': '--text-xl', '21px': '--text-xl',
  '22px': '--text-xl', '23px': '--text-xl', '24px': '--text-xl',
  '26px': '--text-2xl', '28px': '--text-2xl', '30px': '--text-2xl',
  '32px': '--text-2xl', '34px': '--text-2xl',
};

const RADIUS = {
  '3px': '--radius-sm', '4px': '--radius-sm', '5px': '--radius-sm',
  '6px': '--radius-sm', '7px': '--radius-sm', '8px': '--radius-sm',
  '9px': '--radius-sm', '10px': '--radius-sm',
  '12px': '--radius-md', '13px': '--radius-md', '14px': '--radius-md',
  '15px': '--radius-md', '16px': '--radius-md', '17px': '--radius-md',
  '18px': '--radius-md',
  '20px': '--radius-lg', '22px': '--radius-lg', '24px': '--radius-lg',
  '26px': '--radius-lg', '28px': '--radius-lg',
  '9999px': '--radius-pill', '50%': '--radius-full',
};

let css = readFileSync(FILE, 'utf8');
const counts = { text: 0, radius: 0, skipped: 0 };

// Rule-by-rule so the selector decides whether the body is content or scenery.
css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (whole, selector, body) => {
  // Never touch the token declarations themselves.
  if (/^:root|^@theme/.test(selector.trim())) return whole;
  if (DECOR.test(selector)) {
    counts.skipped += (body.match(/font-size:|border-radius:/g) || []).length;
    return whole;
  }

  const next = body
    .replace(/font-size:\s*([\d.]+px)/g, (m, v) => {
      const t = TEXT[v];
      if (!t) return m;
      counts.text++;
      return `font-size: var(${t})`;
    })
    .replace(/border-radius:\s*([\d.]+px|50%)(?=\s*[;}])/g, (m, v) => {
      const t = RADIUS[v];
      if (!t) return m;
      counts.radius++;
      return `border-radius: var(${t})`;
    });

  return selector + '{' + next + '}';
});

console.log(`font-size  -> token: ${counts.text}`);
console.log(`radius     -> token: ${counts.radius}`);
console.log(`skipped (decorative): ${counts.skipped}`);

if (!WRITE) {
  console.log('\nReport only. Re-run with --write to apply.');
  process.exit(0);
}
writeFileSync(FILE, css);
console.log('\nWritten.');
