import { defineField, defineType } from 'sanity';

/**
 * One of the five Shopify sub-services shown on /shopify.
 * Mirrors the `ShopifyService` interface in src/lib/types.ts.
 */
export default defineType({
  name: 'shopifyService',
  title: 'Shopify Service',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: 'Number',
      description: 'Two digits — also sets the display order ("01", "02"…).',
      type: 'string',
    }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'One punchy line.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Fuller paragraph — used on the /shopify service row.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tone',
      title: 'Card tone',
      description: 'Also picks the mockup ServiceVisual renders for this service.',
      type: 'string',
      options: {
        list: [
          { title: 'Indigo — storefront', value: 'indigo' },
          { title: 'Terracotta — cart', value: 'terracotta' },
          { title: 'Amber — performance', value: 'amber' },
          { title: 'Sage — before / after', value: 'sage' },
          { title: 'Ink — support', value: 'ink' },
        ],
      },
    }),
  ],
  orderings: [
    { title: 'Number', name: 'numberAsc', by: [{ field: 'number', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'number' } },
});
