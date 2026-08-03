// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const {
  PUBLIC_SANITY_PROJECT_ID = 'placeholder',
  PUBLIC_SANITY_DATASET = 'production',
} = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://riajulislam.dev',
  // Secretly fetch a page on link hover so in-site navigation feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // CRO used to be its own page; it now lives inside /shopify.
  redirects: {
    '/cro': '/shopify#cro',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      // Pull live data; flip to true once you point at a real project + CDN.
      useCdn: false,
      apiVersion: '2024-10-01',
      // Embedded Sanity Studio served at /admin
      studioBasePath: '/admin',
    }),
    react(),
    // The Studio is a private app, not a page — keep it out of the sitemap.
    // `/resume` is deliberately included: it's a real landing page for name searches.
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],
});
