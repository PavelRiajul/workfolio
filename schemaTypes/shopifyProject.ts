import { defineField, defineType } from 'sanity';

/**
 * A piece of Shopify work, shown only on /shopify.
 * Mirrors the `ShopifyProject` interface in src/lib/types.ts.
 *
 * Separate from `project` on purpose: this is card-only, and it sorts by the
 * kind of commerce build rather than by stack, which is what someone reading
 * the Shopify page is actually asking about. It carries no case study of its
 * own — point `caseStudy` at the Project that documents it, if one exists.
 */
export default defineType({
  name: 'shopifyProject',
  title: 'Shopify Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Also names the cover image: /public/work/<slug>.jpg.',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      description: 'Position in the grid, lowest first.',
      type: 'number',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Which chip this sits under. Without one the card shows, but no chip reaches it.',
      type: 'reference',
      to: [{ type: 'shopifyCategory' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stack',
      title: 'Stack (pill)',
      description: 'The pill on the card — "Shopify · Next.js".',
      type: 'string',
    }),
    defineField({ name: 'blurb', title: 'Card blurb', type: 'text', rows: 3 }),
    defineField({
      name: 'image',
      title: 'Cover image',
      description: 'Wins over /public/work/<slug>.jpg when set.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'caseStudy',
      title: 'Case study',
      description:
        'The Project this links to. Leave empty and the card renders without a link rather than pointing at a page that does not exist.',
      type: 'reference',
      to: [{ type: 'project' }],
    }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'category.label' } },
});
