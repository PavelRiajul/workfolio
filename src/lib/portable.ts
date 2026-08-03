// Helpers shared by the Portable Text renderer and the table of contents.
// They must agree on heading ids, or every TOC link points at nothing —
// hence one implementation rather than one per component.
import type { PortableBlock, Post } from './types';

/** The plain text of a block, marks stripped. */
export function blockText(block: PortableBlock): string {
  return (block.children ?? []).map((c) => c.text).join('').trim();
}

/**
 * URL fragment for a heading. Intentionally simple and stable: lowercase,
 * non-alphanumerics collapsed to hyphens. Two identical headings in one post
 * would collide, which `tableOfContents` resolves by suffixing.
 */
export function headingSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  );
}

export interface TocEntry { id: string; text: string; level: 2 | 3 }

/**
 * Every h2/h3 in order, with its final id. This is the single place heading
 * ids are decided: the renderer stamps them onto the headings and the TOC
 * links to them, so a duplicate-heading suffix can't drift between the two
 * and leave the contents list pointing at nothing.
 */
export function headings(blocks: PortableBlock[] = []): TocEntry[] {
  const seen = new Map<string, number>();
  const out: TocEntry[] = [];

  for (const b of blocks) {
    if (b._type !== 'block' || (b.style !== 'h2' && b.style !== 'h3')) continue;
    const text = blockText(b);
    if (!text) continue;
    const base = headingSlug(text);
    // Same fragment twice would make the first one unreachable.
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ id: n ? `${base}-${n + 1}` : base, text, level: b.style === 'h2' ? 2 : 3 });
  }
  return out;
}

/**
 * Contents list for a post. Empty when there are too few headings to be worth
 * one — a TOC over two entries is furniture, not navigation.
 */
export function tableOfContents(blocks: PortableBlock[] = [], min = 3): TocEntry[] {
  const h = headings(blocks);
  return h.length >= min ? h : [];
}

/** A post is published — and therefore linkable — once it has a body. */
export const isPublished = (p: Post) => Boolean(p.body?.length);

/**
 * Posts to suggest at the end of an article. Same series first (a cluster is a
 * stronger relationship than a shared tag), then same category, then anything
 * else recent, so the slot is never empty on a small blog. Only ever returns
 * posts that actually have a page.
 */
export function relatedPosts(post: Post, all: Post[], limit = 2): Post[] {
  const pool = all.filter((p) => p.slug !== post.slug && isPublished(p));
  const rank = (p: Post) =>
    post.series && p.series === post.series ? 0 : p.category === post.category ? 1 : 2;
  return pool
    .sort((a, b) => rank(a) - rank(b) || (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);
}
