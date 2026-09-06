import { defineArrayMember, defineField, defineType } from 'sanity';

const stat = defineArrayMember({
  type: 'object',
  name: 'stat',
  fields: [
    { name: 'value', title: 'Value (number)', type: 'number' },
    { name: 'suffix', title: 'Suffix', type: 'string' },
    { name: 'label', title: 'Label', type: 'string' },
  ],
  preview: { select: { title: 'label', subtitle: 'value' } },
});

const numberedItem = (name: string) =>
  defineArrayMember({
    type: 'object',
    name,
    fields: [
      { name: 'number', title: 'Number', type: 'string' },
      { name: 'title', title: 'Title', type: 'string' },
      { name: 'body', title: 'Body', type: 'text', rows: 3 },
    ],
    preview: { select: { title: 'title', subtitle: 'number' } },
  });

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Sections' },
    { name: 'meta', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'meta' }),

    // Hero
    defineField({ name: 'badge', title: 'Hero badge', type: 'string', group: 'hero' }),
    defineField({ name: 'availabilityChip', title: 'Availability chip', type: 'string', group: 'hero' }),
    defineField({
      name: 'headlineLines',
      title: 'Headline lines',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'hero',
    }),
    defineField({ name: 'accentWord', title: 'Accent word (blue)', type: 'string', group: 'hero' }),
    defineField({ name: 'lede', title: 'Lede', type: 'text', rows: 3, group: 'hero' }),
    defineField({
      name: 'ledeShort',
      title: 'Lede (phones)',
      description: 'A genuinely shorter sentence, not a truncation — the full lede still renders on desktop. Falls back to the lede if empty.',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    // These two were declared as plain strings while the data — seeded and
    // live — is a {label, href} object, so the Studio offered a text input over
    // an object and an edit would have written a string that the page then
    // read `.href` off.
    defineField({ name: 'primaryCta', title: 'Primary CTA', type: 'cta', group: 'hero' }),
    defineField({ name: 'secondaryCta', title: 'Secondary CTA', type: 'cta', group: 'hero' }),
    defineField({ name: 'availabilityNote', title: 'Availability note', type: 'string', group: 'hero' }),
    defineField({ name: 'buildingWithLabel', title: 'Tech marquee label', type: 'string', group: 'hero' }),
    defineField({ name: 'stackCta', title: 'Tech marquee link', type: 'cta', group: 'hero' }),
    defineField({
      name: 'rotatingWords',
      title: 'Rotating words',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'hero',
    }),
    defineField({ name: 'stats', title: 'Stats', type: 'array', of: [stat], group: 'hero' }),

    // How I work
    defineField({ name: 'approachEyebrow', title: 'Approach eyebrow', type: 'string', group: 'sections' }),
    defineField({ name: 'approachTitle', title: 'Approach title', type: 'string', group: 'sections' }),
    defineField({ name: 'approachLede', title: 'Approach lede', type: 'text', rows: 2, group: 'sections' }),
    defineField({
      name: 'principles',
      title: 'Principles',
      type: 'array',
      of: [numberedItem('principle')],
      group: 'sections',
    }),

    // Services (short list — the full offers live in the Service documents)
    defineField({
      name: 'services',
      title: 'Services (short list)',
      description: 'Used on the About page. The four full offers are Service documents.',
      type: 'array',
      of: [numberedItem('homeService')],
      group: 'sections',
    }),

    // The AI-accelerated method
    defineField({
      name: 'aiWorkflow',
      title: 'AI workflow steps',
      description: 'The four "where the weeks go" cards on /services.',
      type: 'array',
      of: [numberedItem('aiWorkflowStep')],
      group: 'sections',
    }),
    defineField({
      name: 'aiCaveat',
      title: 'AI caveat',
      description:
        'The honest counterweight shown under every speed claim (home + /services). Keep it candid — it is what stops the AI copy reading as hype.',
      type: 'text',
      rows: 3,
      group: 'sections',
    }),

    // Process
    defineField({
      name: 'process',
      title: 'Process steps',
      type: 'array',
      of: [numberedItem('processStep')],
      group: 'sections',
    }),

    // Testimonials
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            { name: 'quote', title: 'Quote', type: 'text', rows: 3 },
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'role', title: 'Role', type: 'string' },
            { name: 'color', title: 'Avatar color (hex)', type: 'string' },
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        }),
      ],
    }),

    // FAQ
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faq',
          fields: [
            { name: 'question', title: 'Question', type: 'string' },
            { name: 'answer', title: 'Answer', type: 'text', rows: 3 },
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),

    // Section headings and the AI band, in page order. All of these were
    // populated on the live document and rendering, but undeclared here — so
    // the Studio listed them as unknown fields and no editor could reach them.
    defineField({ name: 'servicesStackHeading', title: 'Services stack heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'servicesStackCta', title: 'Services stack button', type: 'cta', group: 'sections' }),
    defineField({
      name: 'aiBand',
      title: 'AI-method band (dark)',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'text', rows: 2 }),
        defineField({ name: 'accentWord', title: 'Accent word', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
        defineField({ name: 'link', title: 'Link', type: 'cta' }),
        defineField({ name: 'stats', title: 'Stats', type: 'array', of: [{ type: 'countStat' }] }),
      ],
    }),
    defineField({ name: 'testimonialsHeading', title: 'Testimonials heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'workHeading', title: 'Work heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'workCta', title: 'Work button', type: 'cta', group: 'sections' }),
    defineField({ name: 'workNote', title: 'Work note', type: 'text', rows: 2, group: 'sections' }),
    defineField({ name: 'workNoteLink', title: 'Work note link', type: 'cta', group: 'sections' }),
    defineField({ name: 'processHeading', title: 'Process heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'heading', group: 'sections' }),
    defineField({ name: 'closingTitle', title: 'Closing CTA title', type: 'string', group: 'sections' }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
