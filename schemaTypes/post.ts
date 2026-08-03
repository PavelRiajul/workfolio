import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'AI', value: 'ai' },
          { title: 'E-commerce', value: 'ecommerce' },
          { title: 'Mobile', value: 'mobile' },
          { title: 'Full-Stack', value: 'fullstack' },
          { title: 'Frontend', value: 'frontend' },
          { title: 'Backend', value: 'backend' },
          { title: 'Performance', value: 'performance' },
          { title: 'Career', value: 'career' },
        ],
      },
    }),
    defineField({ name: 'categoryLabel', title: 'Category label', type: 'string' }),
    defineField({ name: 'readTime', title: 'Read time', type: 'string' }),
    defineField({ name: 'date', title: 'Date label', type: 'string' }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'date',
      description:
        'The real date. Drives datePublished in the Article structured data — Google needs ISO-8601, which the label above is not.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last updated',
      type: 'date',
      description:
        'Set only on a real revision. dateModified is a freshness signal, so mirroring the publish date here just tells Google nothing.',
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
      description:
        'Groups posts into a cluster (e.g. "AI booking"). Posts in a series link to each other ahead of ones that merely share a category.',
    }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'coverLabel', title: 'Cover placeholder label', type: 'string' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'image', title: 'Cover image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'body',
      title: 'Article',
      type: 'array',
      description:
        'The post itself. A post has no public page until this has content — an indexable URL with only an excerpt on it is thin content.',
      of: [
        {
          type: 'block',
          // The renderer supports exactly these; anything else would author
          // fine in the Studio and then silently not render on the site.
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Minor heading', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        },
        {
          type: 'object',
          name: 'code',
          title: 'Code block',
          fields: [
            { name: 'code', type: 'text', title: 'Code', rows: 8 },
            {
              name: 'language',
              type: 'string',
              title: 'Language',
              description: 'ts, tsx, js, json, bash, sql, astro… drives highlighting.',
            },
          ],
          preview: { select: { subtitle: 'language' } },
        },
        {
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description:
                'What the image shows, for screen readers and search. Leave empty only if it is purely decorative.',
            },
            { name: 'caption', type: 'string', title: 'Caption' },
            {
              name: 'wide',
              type: 'boolean',
              title: 'Full width',
              description: 'Break out past the text measure — for diagrams and wide screenshots.',
              initialValue: false,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO override',
      type: 'seo',
      description: 'Optional. Falls back to the title and excerpt above.',
    }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'categoryLabel' } },
});
