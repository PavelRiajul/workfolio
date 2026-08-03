// RSS feed of published posts. Developer audiences and aggregators still run
// on feeds, and it's the cheapest distribution a blog has.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSite, getPosts, getBlogPage } from '../lib/content';
import { isPublished } from '../lib/portable';

export async function GET(context: APIContext) {
  const [site, page, posts] = await Promise.all([getSite(), getBlogPage(), getPosts()]);

  // Same rule as the routes: no body, no page, so nothing to link to.
  const published = posts
    .filter(isPublished)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return rss({
    title: page.seo.title,
    description: page.seo.description,
    site: context.site ?? new URL('/', context.url),
    items: published.map((p) => ({
      title: p.title,
      description: p.excerpt,
      link: `/blog/${p.slug}/`,
      pubDate: new Date(p.publishedAt),
      categories: [p.categoryLabel],
      author: site.email,
    })),
    customData: '<language>en</language>',
  });
}
