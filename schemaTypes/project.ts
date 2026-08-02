import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'card', title: 'Card / listing' },
    { name: 'study', title: 'Case study' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'card' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      group: 'card',
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', group: 'card' }),
    defineField({
      name: 'tags',
      title: 'Filter tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: ['ai', 'shopify', 'nextjs', 'reactnative', 'mern', 'react'],
      },
      group: 'card',
    }),
    defineField({ name: 'stack', title: 'Stack (pill)', type: 'string', group: 'card' }),
    defineField({ name: 'type', title: 'Type', type: 'string', group: 'card' }),
    defineField({ name: 'blurb', title: 'Card blurb', type: 'text', rows: 3, group: 'card' }),
    defineField({ name: 'image', title: 'Cover image', type: 'image', options: { hotspot: true }, group: 'card' }),
    defineField({
      name: 'hasCaseStudy',
      title: 'Has case study?',
      type: 'boolean',
      initialValue: true,
      group: 'card',
    }),

    // Modal
    defineField({ name: 'modalSummary', title: 'Modal summary', type: 'text', rows: 3, group: 'card' }),
    defineField({
      name: 'modalOutcomes',
      title: 'Modal outcomes',
      type: 'array',
      group: 'card',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'outcome',
          fields: [
            { name: 'stat', title: 'Stat', type: 'string' },
            { name: 'label', title: 'Label', type: 'string' },
          ],
          preview: { select: { title: 'stat', subtitle: 'label' } },
        }),
      ],
    }),

    // Case study
    defineField({ name: 'year', title: 'Year', type: 'string', group: 'study' }),
    defineField({
      name: 'pills',
      title: 'Pills',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'study',
    }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 3, group: 'study' }),
    defineField({
      name: 'meta',
      title: 'Meta (Role / Stack / Timeline / Type)',
      type: 'array',
      group: 'study',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metaItem',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'value', title: 'Value', type: 'string' },
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'challenge',
      title: 'Challenge paragraphs',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
      group: 'study',
    }),
    defineField({
      name: 'approach',
      title: 'Approach paragraphs',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
      group: 'study',
    }),
    defineField({
      name: 'insights',
      title: 'Key decisions',
      type: 'array',
      group: 'study',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'insight',
          fields: [
            { name: 'number', title: 'Number', type: 'string' },
            { name: 'finding', title: 'Finding', type: 'string' },
            { name: 'did', title: 'How applied', type: 'text', rows: 2 },
          ],
          preview: { select: { title: 'finding', subtitle: 'number' } },
        }),
      ],
    }),
    defineField({
      name: 'processSteps',
      title: 'Process steps',
      type: 'array',
      group: 'study',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processPhase',
          fields: [
            { name: 'number', title: 'Number', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text', rows: 2 },
            { name: 'label', title: 'Placeholder label', type: 'string' },
          ],
          preview: { select: { title: 'title', subtitle: 'number' } },
        }),
      ],
    }),
    defineField({
      name: 'screens',
      title: 'Selected screens',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'study',
    }),
    defineField({
      name: 'mobileScreens',
      title: 'Mobile companion screens',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'study',
    }),
    defineField({
      name: 'outcomes',
      title: 'Outcomes',
      type: 'array',
      group: 'study',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'outcome',
          fields: [
            { name: 'stat', title: 'Stat', type: 'string' },
            { name: 'label', title: 'Label', type: 'string' },
          ],
          preview: { select: { title: 'stat', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'outcomesNote', title: 'Outcomes note', type: 'text', rows: 2, group: 'study' }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'stack' } },
});
