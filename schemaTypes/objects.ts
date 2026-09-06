import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Small building blocks reused across the page documents. Registering them as
 * named types (rather than repeating inline objects) keeps the Studio
 * consistent and avoids duplicate type-name collisions.
 */

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Browser / search title', type: 'string' }),
    defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 3 }),
  ],
});

export const cta = defineType({
  name: 'cta',
  title: 'Link / button',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({
      name: 'href',
      title: 'Link',
      description: 'A path like /work, an anchor like #cro, or a full URL.',
      type: 'string',
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
});

export const heading = defineType({
  name: 'heading',
  title: 'Section heading',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      description: 'The small label above the heading — usually starts with "— ".',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Press Enter for a deliberate line break.',
      type: 'text',
      rows: 2,
    }),
    defineField({ name: 'lede', title: 'Lede (optional)', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'title', subtitle: 'eyebrow' } },
});

export const textStat = defineType({
  name: 'textStat',
  title: 'Stat',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      description: 'Written exactly as it should appear — "−58%", "3 wk", "12".',
      type: 'string',
    }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
  ],
  preview: { select: { title: 'value', subtitle: 'label' } },
});

export const countStat = defineType({
  name: 'countStat',
  title: 'Counting stat',
  type: 'object',
  description: 'Counts up from zero when it scrolls into view.',
  fields: [
    defineField({ name: 'value', title: 'Value (number)', type: 'number' }),
    defineField({ name: 'prefix', title: 'Prefix', description: 'e.g. "+", "−", "$"', type: 'string' }),
    defineField({ name: 'suffix', title: 'Suffix', description: 'e.g. "%", " wk", "M+"', type: 'string' }),
    defineField({ name: 'decimals', title: 'Decimal places', type: 'number' }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    // `barWidth` is seed-only (tier b) — it held a CSS percentage, in the one
    // object every page reuses. Still in src/data/content.ts and types.ts.
  ],
  preview: { select: { title: 'label', subtitle: 'value' } },
});

export const pageHero = defineType({
  name: 'pageHero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'chip', title: 'Availability chip', type: 'string' }),
    defineField({
      name: 'headlineLines',
      title: 'Headline lines',
      description: 'One line per item — they stack with line breaks.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'accentWord', title: 'Accent word', type: 'string' }),
    defineField({ name: 'lede', title: 'Lede', type: 'text', rows: 4 }),
    defineField({ name: 'primaryCta', title: 'Primary button', type: 'cta' }),
    defineField({ name: 'secondaryCta', title: 'Secondary button', type: 'cta' }),
    defineField({ name: 'stats', title: 'Stats', type: 'array', of: [{ type: 'textStat' }] }),
  ],
});

export const closingCta = defineType({
  name: 'closingCta',
  title: 'Closing CTA',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'text', rows: 2 }),
    defineField({ name: 'primary', title: 'Primary button', type: 'cta' }),
    defineField({ name: 'secondary', title: 'Secondary button', type: 'cta' }),
  ],
});

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string' }),
    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4 }),
  ],
  preview: { select: { title: 'question' } },
});

export const testimonialItem = defineType({
  name: 'testimonialItem',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'color', title: 'Avatar color (hex)', type: 'string' }),
  ],
  preview: { select: { title: 'name', subtitle: 'role' } },
});

/** A numbered card — used for approach steps, CRO steps and engagements. */
export const numberedCard = defineArrayMember({
  type: 'object',
  name: 'numberedCard',
  fields: [
    { name: 'number', title: 'Number', type: 'string' },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'body', title: 'Body', type: 'text', rows: 3 },
  ],
  preview: { select: { title: 'title', subtitle: 'number' } },
});

export const sharedObjects = [
  seo,
  cta,
  heading,
  textStat,
  countStat,
  pageHero,
  closingCta,
  faqItem,
  testimonialItem,
];
