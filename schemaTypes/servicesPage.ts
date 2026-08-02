import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Sections' },
    { name: 'meta', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'meta' }),
    defineField({ name: 'hero', title: 'Hero', type: 'pageHero', group: 'hero' }),
    defineField({
      name: 'velocity',
      title: 'Velocity card',
      description: 'The "same scope, two timelines" comparison in the hero.',
      type: 'object',
      group: 'hero',
      fields: [
        { name: 'kicker', title: 'Kicker', type: 'string' },
        {
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'velocityRow',
              fields: [
                { name: 'label', title: 'Label', type: 'string' },
                { name: 'value', title: 'Value', type: 'string' },
                { name: 'barWidth', title: 'Bar width', description: 'e.g. "38%"', type: 'string' },
                { name: 'muted', title: 'Muted (the "before" row)', type: 'boolean' },
              ],
              preview: { select: { title: 'label', subtitle: 'value' } },
            }),
          ],
        },
        { name: 'foot', title: 'Footnote', type: 'text', rows: 2 },
      ],
    }),

    defineField({ name: 'methodHeading', title: 'Method heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'listHeading', title: 'Services heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'listCta', title: 'Services button', type: 'cta', group: 'sections' }),
    defineField({
      name: 'serviceCta',
      title: 'Per-service button',
      description: 'Repeated on every service row.',
      type: 'cta',
      group: 'sections',
    }),
    defineField({
      name: 'serviceDeepLinkCta',
      title: 'Per-service deep link',
      description: 'Label only — the link comes from the service itself.',
      type: 'cta',
      group: 'sections',
    }),

    defineField({
      name: 'stackLink',
      title: 'Stack page link',
      description: 'Pointer under the services list to the /stack detail page.',
      type: 'cta',
      group: 'sections',
    }),
    defineField({ name: 'engagementsHeading', title: 'Engagements heading', type: 'heading', group: 'sections' }),
    defineField({
      name: 'engagements',
      title: 'Engagement models',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'engagement',
          fields: [
            { name: 'number', title: 'Number', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text', rows: 3 },
            { name: 'meta', title: 'Meta line', description: 'e.g. "3–8 weeks · fixed scope"', type: 'string' },
          ],
          preview: { select: { title: 'title', subtitle: 'meta' } },
        }),
      ],
    }),

    defineField({ name: 'processHeading', title: 'Process heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'faqs', title: 'FAQs', type: 'array', of: [{ type: 'faqItem' }], group: 'sections' }),
    defineField({ name: 'closing', title: 'Closing CTA', type: 'closingCta', group: 'sections' }),
  ],
  preview: { prepare: () => ({ title: 'Services Page' }) },
});
