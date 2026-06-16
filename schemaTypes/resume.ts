import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'resume',
  title: 'Résumé',
  type: 'document',
  fields: [
    defineField({
      name: 'highlights',
      title: 'Highlights (key stats)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlight',
          fields: [
            { name: 'value', title: 'Value', type: 'string' },
            { name: 'label', title: 'Label', type: 'string' },
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 5 }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'skillRow',
          fields: [
            { name: 'label', title: 'Category', type: 'string' },
            { name: 'values', title: 'Values', type: 'string' },
          ],
          preview: { select: { title: 'label', subtitle: 'values' } },
        }),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'Experience',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'job',
          fields: [
            { name: 'title', title: 'Title — Company', type: 'string' },
            { name: 'period', title: 'Period', type: 'string' },
            {
              name: 'bullets',
              title: 'Bullets',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
          preview: { select: { title: 'title', subtitle: 'period' } },
        }),
      ],
    }),
    defineField({
      name: 'projects',
      title: 'Selected projects',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'resumeProject',
          fields: [
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'description', title: 'Description', type: 'text', rows: 2 },
          ],
          preview: { select: { title: 'name' } },
        }),
      ],
    }),
    defineField({
      name: 'education',
      title: 'Education & certifications',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'eduItem',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'year', title: 'Year', type: 'string' },
          ],
          preview: { select: { title: 'title', subtitle: 'year' } },
        }),
      ],
    }),
    defineField({ name: 'languages', title: 'Languages', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Résumé' }) },
});
