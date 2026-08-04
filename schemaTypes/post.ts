import { defineField, defineType } from 'sanity';
import { CATEGORIES } from '../src/lib/categories';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      description: 'The URL: /blog/<slug>. Changing it after publishing breaks every existing link.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the blog grid. Lower comes first.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description:
        'Also decides which topic hub this post appears on. A hub is created automatically once a category has at least one published post.',
      options: { list: CATEGORIES.map((c) => ({ title: c.label, value: c.value })) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categoryLabel',
      title: 'Category label (optional)',
      type: 'string',
      description:
        'Leave blank. The category’s own name is used automatically — this only exists to override it for one post.',
    }),
    defineField({
      name: 'readTime',
      title: 'Read time',
      type: 'string',
      description: 'Shown on the card, e.g. "6 min read".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date label',
      type: 'string',
      description: 'The human label on the card, e.g. "July 2026". The real date is the field below.',
      validation: (r) => r.required(),
    }),
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
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description:
        'The card summary, and the fallback meta description. Aim for under 155 characters so it does not truncate in search results.',
      validation: (r) => r.required(),
    }),
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
            {
              name: 'src',
              type: 'string',
              title: 'Or a file path under /public',
              description:
                'e.g. /blog/my-post/diagram.avif. Used only when no image is uploaded above. The renderer has always supported this; the field was missing here, so a path could not be authored. A path whose file does not exist yet renders no figure rather than a broken image, which lets alt text and captions be written before the artwork lands.',
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
        {
          type: 'object',
          name: 'table',
          title: 'Comparison table',
          description:
            'The format featured snippets and AI answers lift most reliably. Use it for anything shaped like "X vs Y", a pricing breakdown, or a spec sheet — a bulleted list of the same content carries none of the row and column relationships.',
          fields: [
            {
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'row',
                  fields: [{ name: 'cells', title: 'Cells', type: 'array', of: [{ type: 'string' }] }],
                  preview: {
                    select: { cells: 'cells' },
                    prepare: ({ cells }: { cells?: string[] }) => ({
                      title: (cells ?? []).join('  ·  ') || 'Empty row',
                    }),
                  },
                },
              ],
              validation: (r: any) => r.min(1),
            },
            {
              name: 'headerRow',
              title: 'First row is a header',
              type: 'boolean',
              description: 'Leave on unless the table genuinely has no column headings.',
              initialValue: true,
            },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
          preview: {
            select: { rows: 'rows', caption: 'caption' },
            prepare: ({ rows, caption }: { rows?: unknown[]; caption?: string }) => ({
              title: caption || 'Comparison table',
              subtitle: `${rows?.length ?? 0} rows`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'faqs',
      title: 'Frequently asked questions',
      type: 'array',
      description:
        'Rendered at the end of the article and emitted as FAQPage structured data, which is what puts a post in a People Also Ask box. Answer in 40–60 words — long answers do not get lifted.',
      of: [
        {
          type: 'object',
          name: 'faq',
          fields: [
            {
              name: 'question',
              title: 'Question',
              type: 'string',
              description: 'Phrase it the way someone would type it, question mark and all.',
              validation: (r: any) => r.required(),
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (r: any) => r.required(),
            },
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
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
