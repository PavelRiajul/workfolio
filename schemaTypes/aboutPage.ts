import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'leadParagraph', title: 'Lead paragraph', type: 'text', rows: 4 }),
    defineField({ name: 'secondParagraph', title: 'Second paragraph', type: 'text', rows: 4 }),
    defineField({
      name: 'tags',
      title: 'Interest tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery captions',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Caption shown under each placeholder/photo.',
    }),
    defineField({ name: 'outsideTitle', title: 'Outside-the-code title', type: 'string' }),
    defineField({ name: 'outsideBody', title: 'Outside-the-code body', type: 'text', rows: 4 }),
    defineField({
      name: 'traits',
      title: 'Developer traits',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'trait',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text', rows: 3 },
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({ name: 'closingTitle', title: 'Closing CTA title', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
});
