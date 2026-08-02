import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// Singletons we don't want editors creating/deleting copies of.
const SINGLETONS = [
  'siteSettings',
  'homePage',
  'servicesPage',
  'stackPage',
  'shopifyPage',
  'workPage',
  'blogPage',
  'aboutPage',
  'startPage',
  'resume',
  'caseStudyPage',
];
const SINGLETON_TITLES: Record<string, string> = {
  siteSettings: 'Site Settings',
  homePage: 'Home Page',
  servicesPage: 'Services Page',
  stackPage: 'Stack Page',
  shopifyPage: 'Shopify Page',
  workPage: 'Work Page',
  blogPage: 'Blog Page',
  aboutPage: 'About Page',
  startPage: 'Contact Page',
  resume: 'Résumé',
  caseStudyPage: 'Case Study Template',
};

export default defineConfig({
  name: 'default',
  title: 'Riajul Islam — Portfolio',

  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',

  basePath: '/admin',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            ...SINGLETONS.map((type) =>
              S.listItem()
                .title(SINGLETON_TITLES[type])
                .id(type)
                .child(S.document().schemaType(type).documentId(type))
            ),
            S.divider(),
            S.documentTypeListItem('service').title('Services'),
            S.documentTypeListItem('shopifyService').title('Shopify Services'),
            S.divider(),
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('post').title('Blog Posts'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide the "create new" + delete actions for singletons.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },

  document: {
    actions: (input, context) =>
      SINGLETONS.includes(context.schemaType)
        ? input.filter(({ action }) =>
            ['publish', 'discardChanges', 'restore'].includes(action || '')
          )
        : input,
  },
});
