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
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'coverLabel', title: 'Cover placeholder label', type: 'string' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'image', title: 'Cover image', type: 'image', options: { hotspot: true } }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'categoryLabel' } },
});
