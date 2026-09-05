import { defineField, defineType } from 'sanity';

/**
 * One chip above the Shopify project grid.
 * Mirrors the `ShopifyCategory` interface in src/lib/types.ts.
 *
 * A category is a document rather than a string on the project so that a chip
 * and a project can never disagree on spelling — the project points at this,
 * and the label is authored once. Rename the label freely; the `value` is what
 * everything is keyed on and has to stay put.
 */
export default defineType({
  name: 'shopifyCategory',
  title: 'Shopify Category',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'What visitors read on the chip, and the note on each card in this category.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      description:
        'The filter key, lowercase and stable ("headless", "subscriptions"). Changing it detaches every project pointing here — rename the Label instead.',
      type: 'slug',
      options: { source: 'label' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      description: 'Left-to-right position of the chip. "All" is always first.',
      type: 'number',
    }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'label', subtitle: 'value.current' } },
});
