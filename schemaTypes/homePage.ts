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
  ],
  fields: [
    // Hero
    defineField({ name: 'badge', title: 'Hero badge', type: 'string', group: 'hero' }),
    defineField({
      name: 'headlineLines',
      title: 'Headline lines',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'hero',
    }),
    defineField({ name: 'accentWord', title: 'Accent word (blue)', type: 'string', group: 'hero' }),
    defineField({ name: 'lede', title: 'Lede', type: 'text', rows: 3, group: 'hero' }),
    defineField({ name: 'primaryCta', title: 'Primary CTA label', type: 'string', group: 'hero' }),
    defineField({ name: 'secondaryCta', title: 'Secondary CTA label', type: 'string', group: 'hero' }),
    defineField({ name: 'availabilityNote', title: 'Availability note', type: 'string', group: 'hero' }),
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
            { name: 'initials', title: 'Initials', type: 'string' },
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

    defineField({ name: 'closingTitle', title: 'Closing CTA title', type: 'string', group: 'sections' }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
