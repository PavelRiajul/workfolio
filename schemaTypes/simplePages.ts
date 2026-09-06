import { defineField, defineType } from 'sanity';

/** Hero shared by the Work and Blog index pages. */
const listHero = defineField({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    {
      name: 'headlineLines',
      title: 'Headline lines',
      description: 'One line per item — they stack with line breaks.',
      type: 'array',
      of: [{ type: 'string' }],
    },
    { name: 'lede', title: 'Lede', type: 'text', rows: 4 },
  ],
});

export const workPage = defineType({
  name: 'workPage',
  title: 'Work Page',
  type: 'document',
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    listHero,
    defineField({
      name: 'filters',
      title: 'Filter chips',
      description: 'Label is what visitors see; Link holds the tag it filters by ("all", "ai", "shopify"…).',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
    defineField({
      name: 'modalCtaLabel',
      title: 'Modal case-study label',
      description: 'The case-study button in the project quick-look modal.',
      type: 'string',
    }),
    defineField({
      name: 'modalLiveLabel',
      title: 'Modal live-site label',
      description: 'The second modal button. Only shown for projects that have a Live site set.',
      type: 'string',
    }),
    defineField({ name: 'closing', title: 'Closing CTA', type: 'closingCta' }),
  ],
  preview: { prepare: () => ({ title: 'Work Page' }) },
});

export const blogPage = defineType({
  name: 'blogPage',
  title: 'Blog Page',
  type: 'document',
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    listHero,
    defineField({
      name: 'categories',
      title: 'Category chips',
      description: 'Label is what visitors see; Link holds the category value ("all", "ai"…).',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
    defineField({ name: 'featuredBadge', title: 'Featured badge label', type: 'string' }),
    defineField({ name: 'emptyMessage', title: 'Empty-category message', type: 'string' }),
    defineField({ name: 'browseLabel', title: 'Browse-by-topic label', type: 'string' }),
    defineField({
      name: 'categoryIntros',
      title: 'Category hub copy',
      description:
        'Heading and lede for each /blog/category/<slug> page. A category with no entry falls back to its chip label, so this is optional — but real copy is what makes the hub worth indexing.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'categoryIntro',
          fields: [
            {
              name: 'category',
              type: 'string',
              title: 'Category value',
              description: 'Must match the chip link value ("ai", "ecommerce"…).',
            },
            { name: 'title', type: 'string', title: 'Heading' },
            { name: 'lede', type: 'text', rows: 3, title: 'Lede' },
          ],
          preview: { select: { title: 'title', subtitle: 'category' } },
        },
      ],
    }),
    defineField({ name: 'closing', title: 'Closing CTA', type: 'closingCta' }),
  ],
  preview: { prepare: () => ({ title: 'Blog Page' }) },
});

export const startPage = defineType({
  name: 'startPage',
  title: 'Contact Page',
  type: 'document',
  groups: [
    { name: 'intro', title: 'Intro' },
    { name: 'call', title: 'Book a call' },
    { name: 'form', title: 'Message form' },
    { name: 'meta', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'meta' }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'intro' }),
    defineField({
      name: 'headlineLines',
      title: 'Headline lines',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'intro',
    }),
    defineField({ name: 'lede', title: 'Lede', type: 'text', rows: 4, group: 'intro' }),
    defineField({ name: 'callTabLabel', title: '"Book a call" tab label', type: 'string', group: 'intro' }),
    defineField({ name: 'formTabLabel', title: '"Send a message" tab label', type: 'string', group: 'intro' }),
    defineField({
      name: 'call',
      title: 'Book a call panel',
      type: 'object',
      group: 'call',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'body', title: 'Body', type: 'text', rows: 3 },
        { name: 'points', title: 'Bullet points', type: 'array', of: [{ type: 'string' }] },
        { name: 'embedLabel', title: 'Scheduler placeholder label', type: 'string' },
        {
          name: 'schedulerUrl',
          title: 'Booking link',
          description: 'Calendly or Cal.com URL. Embedded inline; clear it to show the placeholder instead.',
          type: 'url',
        },
        { name: 'schedulerFallbackLabel', title: 'Booking link label', type: 'string' },
      ],
    }),
    defineField({
      name: 'form',
      title: 'Message form',
      type: 'object',
      group: 'form',
      fields: [
        { name: 'nameLabel', title: 'Name label', type: 'string' },
        { name: 'namePlaceholder', title: 'Name placeholder', type: 'string' },
        { name: 'emailLabel', title: 'Email label', type: 'string' },
        { name: 'emailPlaceholder', title: 'Email placeholder', type: 'string' },
        { name: 'needsLabel', title: 'Needs label', type: 'string' },
        { name: 'needs', title: 'Needs checkboxes', type: 'array', of: [{ type: 'string' }] },
        { name: 'budgetLabel', title: 'Budget label', type: 'string' },
        { name: 'budgetPlaceholder', title: 'Budget placeholder', type: 'string' },
        { name: 'budgets', title: 'Budget options', type: 'array', of: [{ type: 'string' }] },
        { name: 'timelineLabel', title: 'Timeline label', type: 'string' },
        { name: 'timelinePlaceholder', title: 'Timeline placeholder', type: 'string' },
        { name: 'timelines', title: 'Timeline options', type: 'array', of: [{ type: 'string' }] },
        { name: 'messageLabel', title: 'Message label', type: 'string' },
        { name: 'messagePlaceholder', title: 'Message placeholder', type: 'text', rows: 2 },
        { name: 'submitLabel', title: 'Submit button', type: 'string' },
        { name: 'note', title: 'Note under the button', type: 'string' },
      ],
    }),
    defineField({
      name: 'success',
      title: 'Success message',
      type: 'object',
      group: 'form',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'body', title: 'Body', type: 'text', rows: 3 },
        { name: 'backLabel', title: 'Back button label', type: 'string' },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});

export const caseStudyPage = defineType({
  name: 'caseStudyPage',
  title: 'Case Study Template',
  type: 'document',
  description: 'Section headings shared by every case study at /work/[slug].',
  fields: [
    defineField({ name: 'challengeHeading', title: 'Challenge', type: 'heading' }),
    defineField({ name: 'approachHeading', title: 'Approach', type: 'heading' }),
    defineField({ name: 'insightsHeading', title: 'Key decisions', type: 'heading' }),
    defineField({ name: 'processHeading', title: 'Process', type: 'heading' }),
    defineField({ name: 'screensHeading', title: 'Selected screens', type: 'heading' }),
    defineField({ name: 'mobileHeading', title: 'Mobile companion', type: 'heading' }),
    defineField({ name: 'outcomesHeading', title: 'Outcomes', type: 'heading' }),
    defineField({ name: 'nextHeading', title: 'Next project', type: 'heading' }),
  ],
  preview: { prepare: () => ({ title: 'Case Study Template' }) },
});
