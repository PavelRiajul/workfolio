import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'stackPage',
  title: 'Stack Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'templates', title: 'Templates' },
    { name: 'tools', title: 'Toolbox' },
    { name: 'every', title: 'In every build' },
    { name: 'meta', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'meta' }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
        {
          name: 'headlineLines',
          title: 'Headline lines',
          type: 'array',
          of: [{ type: 'string' }],
        },
        { name: 'accentWord', title: 'Accent word', type: 'string' },
        { name: 'lede', title: 'Lede', type: 'text', rows: 4 },
        { name: 'primaryCta', title: 'Primary button', type: 'cta' },
        { name: 'secondaryCta', title: 'Secondary button', type: 'cta' },
      ],
    }),

    defineField({ name: 'templatesHeading', title: 'Templates heading', type: 'heading', group: 'templates' }),
    defineField({
      name: 'templates',
      title: 'Build templates',
      type: 'array',
      group: 'templates',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'buildTemplate',
          fields: [
            { name: 'number', title: 'Number', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'tagline', title: 'Tagline', type: 'text', rows: 2 },
            { name: 'bestFor', title: 'Best for', type: 'string' },
            { name: 'stack', title: 'Stack chips', type: 'array', of: [{ type: 'string' }] },
            { name: 'note', title: 'Footnote', type: 'text', rows: 2 },
            {
              name: 'tone',
              title: 'Tone',
              description: 'Tints the number and stack chips.',
              type: 'string',
              options: {
                list: [
                  { title: 'Sage', value: 'sage' },
                  { title: 'Indigo', value: 'indigo' },
                  { title: 'Ink', value: 'ink' },
                  { title: 'Amber', value: 'amber' },
                  { title: 'Terracotta', value: 'terracotta' },
                  { title: 'AI (blue)', value: 'ai' },
                ],
              },
            },
          ],
          preview: { select: { title: 'title', subtitle: 'bestFor' } },
        }),
      ],
    }),

    defineField({ name: 'toolsHeading', title: 'Toolbox heading', type: 'heading', group: 'tools' }),
    defineField({
      name: 'toolGroups',
      title: 'Tool groups',
      type: 'array',
      group: 'tools',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'toolGroup',
          fields: [
            { name: 'title', title: 'Group', type: 'string' },
            {
              name: 'tools',
              title: 'Tools',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'tool',
                  fields: [
                    { name: 'name', title: 'Name', type: 'string' },
                    { name: 'role', title: 'What it does here', type: 'string' },
                  ],
                  preview: { select: { title: 'name', subtitle: 'role' } },
                }),
              ],
            },
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),

    defineField({ name: 'everyBuildHeading', title: '"In every build" heading', type: 'heading', group: 'every' }),
    defineField({
      name: 'everyBuild',
      title: 'Checklist',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'every',
    }),
    defineField({ name: 'everyBuildNote', title: 'Note', type: 'text', rows: 3, group: 'every' }),
    defineField({ name: 'closing', title: 'Closing CTA', type: 'closingCta', group: 'every' }),
  ],
  preview: { prepare: () => ({ title: 'Stack Page' }) },
});
