/**
 * Fails when the Studio schema and the seeded content disagree about which
 * fields a singleton has.
 *
 *   npm run schema:check
 *
 * Why this exists: the Content Lake is schemaless and `withFallback` fills any
 * gap from the seed, so the two surfaces can drift apart in complete silence.
 * They had — `siteSettings.nav` and `footerLinks` were authored, projected and
 * rendering while being absent from the schema, which meant nobody could edit
 * the site navigation and Sanity's unknown-fields panel offered a Remove
 * button next to it. Nothing failed. Nothing looked wrong.
 *
 * Two surfaces, deliberately, not three:
 *   - seed ↔ types is already enforced by TypeScript (`site` is `SiteSettings`)
 *   - projection ↔ types is enforced by `safeFetch<T>`
 *   - a seed key with no projection key is legal — that is tier (b)
 *
 * So the only unguarded pair is seed ↔ schema, and that is what this checks.
 *
 * It imports both surfaces rather than parsing them. A regex over the source
 * misses fields declared through a shared const (`workPage.hero` comes from
 * `listHero` in simplePages.ts) and reports them as drift.
 */
import { register } from 'node:module';
import {
  site, home, about, resume, servicesPage, stackPage, shopifyPage,
  workPage, blogPage, startPage, caseStudy,
} from '../src/data/content.ts';

/**
 * `schemaTypes/` is written for a bundler, so its relative imports carry no
 * extension and Node's ESM resolver rejects them. This hook retries a failed
 * relative specifier with `.ts` (and as a directory index), which is what Vite
 * does for the Studio. It has to be registered before the import runs, so that
 * import is dynamic — a static one would be hoisted above this.
 */
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try {
          return await next(specifier, context);
        } catch (err) {
          if (!specifier.startsWith('.')) throw err;
          for (const ext of ['.ts', '/index.ts']) {
            try { return await next(specifier + ext, context); } catch {}
          }
          throw err;
        }
      }
    `)
);

const { schemaTypes } = await import('../schemaTypes/index.ts');

/**
 * Seed-only by design — tier (b) in CLAUDE.md. Every entry needs a reason.
 *
 * An explicit list, not a naming convention: exempting a field should be a
 * visible, reviewable edit in one place. A convention would make it
 * frictionless, and frictionless exemption is how a schema fills up with CSS
 * percentages in the first place.
 */
const SEED_ONLY = new Set([
  'servicesPage.velocity',       // aria-hidden hero mockup, rows carry CSS widths
  'shopifyPage.croDashboard',    // aria-hidden CRO mockup, 16 invented values
  'homePage.stats',              // hero stat bar, decorative counters
]);

/** Singleton document type → its seeded object. */
const SINGLETONS: Record<string, Record<string, unknown>> = {
  siteSettings: site,
  homePage: home,
  aboutPage: about,
  resume,
  servicesPage,
  stackPage,
  shopifyPage,
  workPage,
  blogPage,
  startPage,
  caseStudyPage: caseStudy,
};

type Field = { name?: string };
type SchemaType = { name?: string; fields?: Field[] };

const byName = new Map<string, SchemaType>(
  (schemaTypes as SchemaType[]).filter((t) => t.name).map((t) => [t.name as string, t])
);

let problems = 0;

for (const [typeName, seed] of Object.entries(SINGLETONS)) {
  const schema = byName.get(typeName);
  if (!schema) {
    console.error(`✗ ${typeName}: no such type in schemaTypes/index.ts`);
    problems++;
    continue;
  }

  const declared = new Set((schema.fields ?? []).map((f) => f.name).filter(Boolean) as string[]);
  const seeded = new Set(Object.keys(seed));

  // Authored and rendering, but no editor can reach it. This is the failure
  // that prompted the script.
  const missing = [...seeded].filter(
    (k) => !declared.has(k) && !SEED_ONLY.has(`${typeName}.${k}`)
  );

  // Declared in the Studio but absent from the seed: an editor can fill in a
  // field that nothing renders, or the seed lost a key the schema still offers.
  const orphaned = [...declared].filter((k) => !seeded.has(k));

  for (const k of missing) {
    console.error(`✗ ${typeName}.${k} — in the seed, not in the Studio schema (uneditable)`);
    problems++;
  }
  for (const k of orphaned) {
    console.error(`✗ ${typeName}.${k} — in the Studio schema, not in the seed (unused?)`);
    problems++;
  }
}

if (problems) {
  console.error(
    `\n${problems} field(s) out of sync. Add the field to schemaTypes/ (tier a), ` +
      'or add it to SEED_ONLY in this script with a reason (tier b).'
  );
  process.exit(1);
}

console.log(`✓ schema and seed agree across ${Object.keys(SINGLETONS).length} singletons`);
