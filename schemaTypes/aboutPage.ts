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
      title: 'Photo gallery',
      description: 'The horizontal photo strip. Upload a photo or leave it empty to show a placeholder.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'galleryPhoto',
          fields: [
            { name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } },
            { name: 'caption', title: 'Caption', type: 'string' },
            {
              name: 'alt',
              title: 'Alt text',
              description: 'Describes the photo for screen readers. Leave blank to reuse the caption.',
              type: 'string',
            },
            {
              name: 'src',
              title: 'File path (optional)',
              description: 'Use instead of an upload to point at a file in /public, e.g. /about/me.jpg',
              type: 'string',
            },
          ],
          preview: { select: { title: 'caption', media: 'image' } },
        }),
      ],
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
