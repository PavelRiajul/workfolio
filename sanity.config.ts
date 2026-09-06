import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import {
  BlockElementIcon, CaseIcon, CogIcon, DocumentsIcon, EditIcon, TagIcon,
} from '@sanity/icons';
import { schemaTypes } from './schemaTypes';

// This config is loaded in two very different places: by Vite when the Studio
// is embedded in the Astro app (env on `import.meta.env`), and by the Sanity
// CLI in plain Node (env on `process.env`). Read whichever exists, or the
// CLI commands fail with "Cannot read properties of undefined".
const env: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env) ||
  (typeof process !== 'undefined' ? process.env : {}) ||
  {};

// The document types an editor picks from, in the order they appear. `orderBy`
// sorts the list by the field the site actually renders in, so what an editor
// sees top-to-bottom is what a visitor sees — Sanity's default is "last
// edited", which has nothing to do with either.
const COLLECTIONS: {
  type: string;
  title: string;
  icon: typeof DocumentsIcon;
  orderBy?: string;
}[] = [
  { type: 'service', title: 'Services', icon: BlockElementIcon, orderBy: 'number' },
  { type: 'shopifyService', title: 'Shopify Services', icon: BlockElementIcon, orderBy: 'number' },
  { type: 'shopifyCategory', title: 'Shopify Categories', icon: TagIcon, orderBy: 'order' },
  { type: 'shopifyProject', title: 'Shopify Projects', icon: CaseIcon, orderBy: 'order' },
  { type: 'project', title: 'Projects', icon: CaseIcon, orderBy: 'order' },
  { type: 'post', title: 'Blog Posts', icon: EditIcon, orderBy: 'order' },
];

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

// Site Settings sits at the top level; the rest nest under "Pages".
const PAGES = SINGLETONS.filter((type) => type !== 'siteSettings');

export default defineConfig({
  name: 'default',
  title: 'Riajul Islam — Portfolio',

  projectId: env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: env.PUBLIC_SANITY_DATASET || 'production',

  basePath: '/admin',

  plugins: [
    structureTool({
      // This list is explicit, so a type missing from it is unreachable in the
      // Studio no matter how good its schema is — an editor has no way to
      // create one. Every document type must appear here or under `OTHER`
      // below, which surfaces anything that gets added later and forgotten.
      structure: (S, context) => {
        const listed = [...SINGLETONS, ...COLLECTIONS.map((c) => c.type)];
        // Wrapped because this reaches into the compiled schema: the catch-all
        // is a convenience, and it must not be able to take the whole desk
        // down with it if that shape ever changes.
        let unlisted: string[] = [];
        try {
          unlisted = context.schema
            .getTypeNames()
            .filter(
              (name) =>
                !listed.includes(name) &&
                !name.startsWith('sanity.') &&
                context.schema.get(name)?.type?.name === 'document'
            );
        } catch {
          unlisted = [];
        }

        return S.list()
          .title('Content')
          .items([
            S.listItem()
              .title(SINGLETON_TITLES.siteSettings)
              .icon(CogIcon)
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            // Eleven singletons in one flat column buried the collections
            // below the fold. The pages are one thing an editor picks from, so
            // they nest.
            S.listItem()
              .title('Pages')
              .icon(DocumentsIcon)
              .child(
                S.list()
                  .title('Pages')
                  .items(
                    PAGES.map((type) =>
                      S.listItem()
                        .title(SINGLETON_TITLES[type])
                        .id(type)
                        .child(
                          S.document().schemaType(type).documentId(type).title(SINGLETON_TITLES[type])
                        )
                    )
                  )
              ),
            S.divider(),
            ...COLLECTIONS.map(({ type, title, icon, orderBy }) => {
              const item = S.documentTypeListItem(type).title(title).icon(icon);
              return orderBy
                ? item.child(
                    S.documentTypeList(type)
                      .title(title)
                      .defaultOrdering([{ field: orderBy, direction: 'asc' }])
                  )
                : item;
            }),
            ...(unlisted.length
              ? [S.divider(), ...unlisted.map((type) => S.documentTypeListItem(type))]
              : []),
          ]);
      },
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
