import { defineArrayMember, defineField, defineType } from 'sanity';
import { numberedCard } from './objects';

export default defineType({
  name: 'shopifyPage',
  title: 'Shopify Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'build', title: 'Build half' },
    { name: 'cro', title: 'CRO half' },
    { name: 'proof', title: 'Proof & FAQ' },
    { name: 'meta', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'meta' }),
    defineField({ name: 'hero', title: 'Hero', type: 'pageHero', group: 'hero' }),

    // ---- Build half ----
    defineField({ name: 'brandsHeading', title: 'Brands heading', type: 'heading', group: 'build' }),
    defineField({
      name: 'brands',
      title: 'Brand wall',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'build',
    }),
    defineField({ name: 'servicesHeading', title: 'Services heading', type: 'heading', group: 'build' }),
    defineField({ name: 'servicesCta', title: 'Services button', type: 'cta', group: 'build' }),
    defineField({
      name: 'serviceTagLabel',
      title: 'Service tag label',
      description: 'The pill above each service title — e.g. "Shopify service".',
      type: 'string',
      group: 'build',
    }),
    defineField({ name: 'serviceCta', title: 'Per-service button', type: 'cta', group: 'build' }),
    defineField({ name: 'approachHeading', title: 'Approach heading', type: 'heading', group: 'build' }),
    defineField({ name: 'approach', title: 'Approach steps', type: 'array', of: [numberedCard], group: 'build' }),
    defineField({ name: 'numbersHeading', title: 'Numbers heading', type: 'heading', group: 'build' }),
    defineField({
      name: 'numbers',
      title: 'Numbers',
      description: 'Five reads best — the last one becomes the big cell on mobile.',
      type: 'array',
      of: [{ type: 'countStat' }],
      group: 'build',
    }),
    defineField({ name: 'numbersNote', title: 'Numbers note', type: 'text', rows: 3, group: 'build' }),

    // ---- CRO half ----
    defineField({
      name: 'cro',
      title: 'CRO intro',
      type: 'object',
      group: 'cro',
      fields: [
        { name: 'heading', title: 'Heading', type: 'heading' },
        { name: 'lede', title: 'Lede', type: 'text', rows: 4 },
        { name: 'features', title: 'Feature pills', type: 'array', of: [{ type: 'string' }] },
        { name: 'primaryCta', title: 'Primary button', type: 'cta' },
        { name: 'secondaryCta', title: 'Secondary button', type: 'cta' },
      ],
    }),
    // The CRO dashboard visual is seed-only (tier b): the whole subtree lives
    // inside aria-hidden="true" on /shopify and contains no string a person or
    // crawler reads, so its sixteen fields -- invented rates, fake A/B variants
    // and bar widths that are literally CSS percentages -- are authored in
    // src/data/content.ts and never shown to an editor. See CLAUDE.md, tiers.
    defineField({ name: 'leakHeading', title: 'Funnel-leak heading', type: 'heading', group: 'cro' }),
    defineField({
      name: 'funnel',
      title: 'Funnel stages',
      type: 'array',
      group: 'cro',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'funnelStage',
          fields: [
            { name: 'name', title: 'Stage', type: 'string' },
            { name: 'count', title: 'Count', type: 'number' },
            // `width` is seed-only (tier b) — a CSS percentage, hand-tuned to
            // the shape of the drawing rather than derived from the count.
            { name: 'drop', title: 'Drop-off', description: 'e.g. "−43%" — omit on the first stage', type: 'string' },
            { name: 'why', title: 'Why it drops', type: 'string' },
          ],
          preview: { select: { title: 'name', subtitle: 'count' } },
        }),
      ],
    }),
    defineField({
      name: 'funnelNote',
      title: 'Funnel disclosure',
      description:
        'Says plainly that these counts are an illustrative example, not measured client results. Keep it — the figures are invented, and they are read by visitors, crawlers and screen readers alike.',
      type: 'text',
      rows: 3,
      group: 'cro',
    }),
    defineField({
      name: 'fixes',
      title: 'Fixes',
      type: 'array',
      group: 'cro',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'croFix',
          fields: [
            { name: 'icon', title: 'Icon', description: 'Font Awesome name, e.g. "fa-box-open".', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'string' },
            // `barWidth` is seed-only (tier b) — a CSS percentage, and it was
            // also this list's preview subtitle, so an editor's item list was
            // labelled with a bar length.
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
    defineField({ name: 'croProcessHeading', title: 'CRO process heading', type: 'heading', group: 'cro' }),
    defineField({ name: 'croProcess', title: 'CRO process steps', type: 'array', of: [numberedCard], group: 'cro' }),
    defineField({ name: 'croProcessLoopNote', title: 'Loop note', type: 'string', group: 'cro' }),
    defineField({ name: 'calcHeading', title: 'Calculator heading', type: 'heading', group: 'cro' }),
    defineField({ name: 'calcCta', title: 'Calculator button', type: 'cta', group: 'cro' }),
    defineField({
      name: 'calcLabels',
      title: 'Calculator labels',
      type: 'object',
      group: 'cro',
      fields: [
        { name: 'visitors', title: 'Visitors slider', type: 'string' },
        { name: 'aov', title: 'AOV slider', type: 'string' },
        { name: 'current', title: 'Current rate slider', type: 'string' },
        { name: 'target', title: 'Target rate slider', type: 'string' },
        { name: 'outKicker', title: 'Result kicker', type: 'string' },
        { name: 'revenueNow', title: 'Revenue now row', type: 'string' },
        { name: 'revenueAfter', title: 'Revenue after row', type: 'string' },
        { name: 'monthlyUplift', title: 'Monthly uplift row', type: 'string' },
        { name: 'extraOrders', title: 'Extra orders row', type: 'string' },
      ],
    }),
    defineField({ name: 'calcNote', title: 'Calculator note', type: 'text', rows: 2, group: 'cro' }),

    // ---- Proof & FAQ ----
    defineField({ name: 'experimentsHeading', title: 'Experiments heading', type: 'heading', group: 'proof' }),
    defineField({
      name: 'experimentsColumns',
      title: 'Experiments column labels',
      type: 'object',
      group: 'proof',
      fields: [
        { name: 'test', title: 'Test column', type: 'string' },
        { name: 'metric', title: 'Metric column', type: 'string' },
        { name: 'lift', title: 'Lift column', type: 'string' },
      ],
    }),
    defineField({
      name: 'experiments',
      title: 'Experiments',
      type: 'array',
      group: 'proof',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'experiment',
          fields: [
            { name: 'title', title: 'Test', type: 'string' },
            { name: 'area', title: 'Area', type: 'string' },
            { name: 'metric', title: 'Metric', type: 'string' },
            { name: 'lift', title: 'Lift (%)', type: 'number' },
          ],
          preview: { select: { title: 'title', subtitle: 'metric' } },
        }),
      ],
    }),
    defineField({
      name: 'experimentsNote',
      title: 'Experiments disclosure',
      description:
        'Says plainly that these lifts are example ranges, not client results. Keep it — the numbers are invented and read as this developer\'s track record otherwise.',
      type: 'text',
      rows: 3,
      group: 'cro',
    }),
    defineField({ name: 'featuredHeading', title: 'Featured-work heading', type: 'heading', group: 'proof' }),
    defineField({ name: 'featuredCta', title: 'Featured-work button', type: 'cta', group: 'proof' }),
    defineField({ name: 'testimonialsHeading', title: 'Testimonials heading', type: 'heading', group: 'proof' }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [{ type: 'testimonialItem' }],
      group: 'proof',
    }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'heading', group: 'proof' }),
    defineField({ name: 'faqs', title: 'FAQs', type: 'array', of: [{ type: 'faqItem' }], group: 'proof' }),
    defineField({ name: 'closing', title: 'Closing CTA', type: 'closingCta', group: 'proof' }),
  ],
  preview: { prepare: () => ({ title: 'Shopify Page' }) },
});
