/**
 * Turns the seeded fallback content in src/data/content.ts into an NDJSON
 * file the Sanity CLI can import, so the Studio starts with exactly what the
 * site already renders offline.
 *
 *   npm run seed:build                          # writes sanity/seed.ndjson
 *   npx sanity dataset import sanity/seed.ndjson production --replace
 *
 * Re-runnable: every document gets a deterministic _id, so importing again
 * updates the same documents instead of creating duplicates.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  site,
  home,
  services,
  shopifyServices,
  projects,
  posts,
  about,
  resume,
} from '../src/data/content.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'sanity/seed.ndjson');

type Doc = Record<string, unknown> & { _id: string; _type: string };

/** Sanity requires a stable, unique _key on every object inside an array. */
function keyed<T extends object>(items: T[] | undefined, type: string): unknown[] {
  return (items || []).map((item, i) => ({
    _type: type,
    _key: `${type}-${i}`,
    ...item,
  }));
}

function slug(current: string) {
  return { _type: 'slug', current };
}

/** Drop nulls/undefined so empty seed values don't land in the dataset. */
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as T;
}

const docs: Doc[] = [];

// ---- Singletons (fixed ids — the Studio structure pins these) -------------
docs.push({ _id: 'siteSettings', _type: 'siteSettings', ...site });

docs.push({
  _id: 'homePage',
  _type: 'homePage',
  ...home,
  stats: keyed(home.stats, 'stat'),
  principles: keyed(home.principles, 'principle'),
  services: keyed(home.services, 'homeService'),
  aiWorkflow: keyed(home.aiWorkflow, 'aiWorkflowStep'),
  process: keyed(home.process, 'processStep'),
  testimonials: keyed(home.testimonials, 'testimonial'),
  faqs: keyed(home.faqs, 'faq'),
});

docs.push({
  _id: 'aboutPage',
  _type: 'aboutPage',
  ...about,
  traits: keyed(about.traits, 'trait'),
});

docs.push({
  _id: 'resume',
  _type: 'resume',
  ...resume,
  highlights: keyed(resume.highlights, 'highlight'),
  skills: keyed(resume.skills, 'skillRow'),
  experience: keyed(resume.experience, 'job'),
  projects: keyed(resume.projects, 'resumeProject'),
  education: keyed(resume.education, 'eduItem'),
});

// ---- Collections ----------------------------------------------------------
for (const s of services) {
  docs.push(clean({ _id: `service-${s.slug}`, _type: 'service', ...s, slug: slug(s.slug) }));
}

for (const s of shopifyServices) {
  docs.push({ _id: `shopifyService-${s.number}`, _type: 'shopifyService', ...s });
}

for (const p of projects) {
  docs.push(
    clean({
      _id: `project-${p.slug}`,
      _type: 'project',
      ...p,
      slug: slug(p.slug),
      image: undefined, // imagery is uploaded in the Studio, not seeded
      modalOutcomes: keyed(p.modalOutcomes, 'outcome'),
      meta: keyed(p.meta, 'metaItem'),
      insights: keyed(p.insights, 'insight'),
      processSteps: keyed(p.processSteps, 'processPhase'),
      outcomes: keyed(p.outcomes, 'outcome'),
    })
  );
}

for (const p of posts) {
  docs.push(clean({ _id: `post-${p.slug}`, _type: 'post', ...p, slug: slug(p.slug), image: undefined }));
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');

const counts = docs.reduce<Record<string, number>>((acc, d) => {
  acc[d._type] = (acc[d._type] || 0) + 1;
  return acc;
}, {});
console.log(`Wrote ${docs.length} documents → sanity/seed.ndjson`);
console.log(
  Object.entries(counts)
    .map(([t, n]) => `  ${t}: ${n}`)
    .join('\n')
);
