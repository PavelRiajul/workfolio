import { defineField, defineType } from 'sanity';

/**
 * A top-level offering — AI Web Development, MVP Engineering, Shopify & CRO,
 * Full-Stack & APIs. Drives the home scroll-stack and the /services showcase.
 * Mirrors the `Service` interface in src/lib/types.ts.
 */
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: 'Number',
      description: 'Two digits — also sets the display order ("01", "02"…).',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Anchor id on /services (e.g. #mvp-engineering).',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'kicker',
      title: 'Kicker',
      description: 'Small label above the title — "AI-accelerated", "Commerce"…',
      type: 'string',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'One punchy line — used on the home stack card.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Fuller paragraph — used on the /services row.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'The first four also appear as tags on the home stack card.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'Full Font Awesome class, e.g. "fa-solid fa-rocket".',
      type: 'string',
    }),
    defineField({
      name: 'timeline',
      title: 'Typical timeline',
      description: 'Shown as a chip on /services — e.g. "3–6 weeks".',
      type: 'string',
    }),
    defineField({
      name: 'visual',
      title: 'Mockup',
      description: 'Which OfferVisual mockup renders beside this service.',
      type: 'string',
      options: {
        list: [
          { title: 'AI — prompt to reviewed code', value: 'ai' },
          { title: 'MVP — sprint timeline', value: 'mvp' },
          { title: 'Commerce — storefront + uplift', value: 'commerce' },
          { title: 'API — endpoints + stack chain', value: 'api' },
        ],
      },
    }),
    defineField({
      name: 'href',
      title: 'Deep link',
      description: 'Optional — a dedicated landing page for this service (e.g. /shopify).',
      type: 'string',
    }),
    defineField({
      name: 'tone',
      title: 'Card tone',
      type: 'string',
      options: {
        list: [
          { title: 'AI (dark / blue)', value: 'ai' },
          { title: 'Indigo', value: 'indigo' },
          { title: 'Terracotta', value: 'terracotta' },
          { title: 'Amber', value: 'amber' },
          { title: 'Sage', value: 'sage' },
          { title: 'Ink', value: 'ink' },
        ],
      },
    }),
  ],
  orderings: [
    { title: 'Number', name: 'numberAsc', by: [{ field: 'number', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'number' } },
});
