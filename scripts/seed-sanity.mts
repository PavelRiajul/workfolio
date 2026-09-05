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
  servicesPage,
  stackPage,
  shopifyPage,
  workPage,
  blogPage,
  startPage,
  caseStudy,
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

/**
 * Portable Text needs a _key on the blocks *and* on every child span — the
 * generic `keyed` above only reaches the top level, and a span without a _key
 * makes the Studio's block editor throw as soon as you open the post.
 */
function portable(blocks: unknown[] | undefined) {
  if (!blocks?.length) return undefined;
  return blocks.map((block, i) => {
    const b = block as Record<string, unknown>;
    const children = b.children as Record<string, unknown>[] | undefined;
    return {
      _key: `blk-${i}`,
      ...b,
      ...(children
        ? {
            children: children.map((c, j) => ({ _type: 'span', _key: `blk-${i}-${j}`, ...c })),
          }
        : {}),
    };
  });
}

/** Drop nulls/undefined so empty seed values don't land in the dataset. */
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as T;
}

const docs: Doc[] = [];

// ---- Singletons (fixed ids — the Studio structure pins these) -------------
docs.push({
  _id: 'siteSettings',
  _type: 'siteSettings',
  ...site,
  nav: keyed(site.nav, 'navItem'),
  footerLinks: keyed(site.footerLinks, 'cta'),
});

docs.push({
  _id: 'homePage',
  _type: 'homePage',
  ...home,
  stats: keyed(home.stats, 'stat'),
  principles: keyed(home.principles, 'principle'),
  services: keyed(home.services, 'homeService'),
  aiBand: { ...home.aiBand, stats: keyed(home.aiBand.stats, 'countStat') },
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
  gallery: keyed(about.gallery, 'galleryPhoto'),
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

// `velocity` is seed-only (tier b) — it isn't in the Studio schema or the GROQ
// projection, so writing it here would only put an uneditable "unknown field"
// into the dataset. Stripped rather than left to the spread.
const { velocity: _velocity, ...servicesPageDoc } = servicesPage;

docs.push({
  _id: 'servicesPage',
  _type: 'servicesPage',
  ...servicesPageDoc,
  hero: { ...servicesPage.hero, stats: keyed(servicesPage.hero.stats, 'textStat') },
  engagements: keyed(servicesPage.engagements, 'engagement'),
  faqs: keyed(servicesPage.faqs, 'faqItem'),
});

docs.push({
  _id: 'stackPage',
  _type: 'stackPage',
  ...stackPage,
  hero: { ...stackPage.hero, stats: keyed(stackPage.hero.stats, 'textStat') },
  templates: keyed(stackPage.templates, 'buildTemplate'),
  toolGroups: keyed(stackPage.toolGroups, 'toolGroup').map((g: any) => ({
    ...g,
    tools: keyed(g.tools, 'tool'),
  })),
});

// Same as `velocity` above: `croDashboard` is seed-only (tier b).
const { croDashboard: _croDashboard, ...shopifyPageDoc } = shopifyPage;

docs.push({
  _id: 'shopifyPage',
  _type: 'shopifyPage',
  ...shopifyPageDoc,
  hero: { ...shopifyPage.hero, stats: keyed(shopifyPage.hero.stats, 'textStat') },
  approach: keyed(shopifyPage.approach, 'numberedCard'),
  numbers: keyed(shopifyPage.numbers, 'countStat'),
  funnel: keyed(shopifyPage.funnel, 'funnelStage'),
  fixes: keyed(shopifyPage.fixes, 'croFix'),
  croProcess: keyed(shopifyPage.croProcess, 'numberedCard'),
  experiments: keyed(shopifyPage.experiments, 'experiment'),
  testimonials: keyed(shopifyPage.testimonials, 'testimonialItem'),
  faqs: keyed(shopifyPage.faqs, 'faqItem'),
});

docs.push({
  _id: 'workPage',
  _type: 'workPage',
  ...workPage,
  filters: keyed(workPage.filters, 'cta'),
});

docs.push({
  _id: 'blogPage',
  _type: 'blogPage',
  ...blogPage,
  categories: keyed(blogPage.categories, 'cta'),
});

docs.push({ _id: 'startPage', _type: 'startPage', ...startPage });
docs.push({ _id: 'caseStudyPage', _type: 'caseStudyPage', ...caseStudy });

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
  docs.push(
    clean({
      _id: `post-${p.slug}`,
      _type: 'post',
      ...p,
      slug: slug(p.slug),
      body: portable(p.body),
      image: undefined,
    })
  );
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
