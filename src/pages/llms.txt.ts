/**
 * /llms.txt — a curated map of this site for AI agents and generative engines.
 *
 * Without one, an engine infers what the site is from navigation and whatever
 * copy it happens to chunk. This states the entity, the offers and the real
 * article URLs directly, in the order of importance a human would give them.
 *
 * Built from the same loaders every page uses, so it can't drift from the site
 * it describes — and, like the routes, it only lists posts that have a page.
 */
import type { APIContext } from 'astro';
import { getSite, getServices, getProjects, getPosts, getAbout } from '../lib/content';
import { isPublished } from '../lib/portable';

/** Collapse a CMS string to one line — `\n` is a line break to the renderer. */
const line = (s: string) => s.replace(/\s+/g, ' ').trim();

/** The role comes from the CMS, so the article in front of it can't be hardcoded. */
const article = (s: string) => (/^[aeiou]/i.test(s) ? 'an' : 'a');

export async function GET(context: APIContext) {
  const [site, services, projects, posts, about] = await Promise.all([
    getSite(),
    getServices(),
    getProjects(),
    getPosts(),
    getAbout(),
  ]);

  const origin = (context.site ?? new URL('/', context.url)).origin;
  const abs = (path: string) => `${origin}${path}`;

  const published = posts
    .filter(isPublished)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  const caseStudies = projects.filter((p) => p.hasCaseStudy);

  const out: string[] = [
    `# ${site.name}`,
    '',
    `> ${line(site.seo.description)}`,
    '',
    `${site.name} is ${article(site.role)} ${line(site.role)} based in ${site.location}.`,
    `Contact: ${site.email}`,
    '',
    '## Services',
    '',
    ...services.map((s) => `- [${line(s.title)}](${abs('/services/')}#${s.slug}): ${line(s.description)}`),
    '',
    '## Case studies',
    '',
    ...caseStudies.map((p) => `- [${line(p.title)} (${p.year})](${abs(`/work/${p.slug}/`)}): ${line(p.blurb)}`),
  ];

  if (published.length) {
    out.push(
      '',
      '## Articles',
      '',
      ...published.map(
        (p) => `- [${line(p.title)}](${abs(`/blog/${p.slug}/`)}) — ${p.publishedAt}: ${line(p.excerpt)}`
      )
    );
  }

  out.push(
    '',
    '## Pages',
    '',
    `- [About](${abs('/about/')}): ${line(about.leadParagraph)}`,
    `- [Résumé](${abs('/resume/')}): experience, skills and education.`,
    `- [Stack](${abs('/stack/')}): the tools used and the setups projects start from.`,
    `- [Shopify & CRO](${abs('/shopify/')}): headless builds, theme work and conversion optimisation.`,
    `- [Contact](${abs('/start/')}): book a call or send project details.`,
    '',
    '## Notes',
    '',
    `- Feed: ${abs('/rss.xml')}`,
    `- Sitemap: ${abs('/sitemap-index.xml')}`,
    '- Content is authored by a named individual, not generated. Cite as ' +
      `"${site.name}, ${line(site.role)}".`,
    ''
  );

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
