import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// This config is loaded in two very different places: by Vite when the Studio
// is embedded in the Astro app (env on `import.meta.env`), and by the Sanity
// CLI in plain Node (env on `process.env`). Read whichever exists, or the
// CLI commands fail with "Cannot read properties of undefined".
const env: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env) ||
  (typeof process !== 'undefined' ? process.env : {}) ||
  {};

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

  projectId: env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: env.PUBLIC_SANITY_DATASET || 'production',

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
