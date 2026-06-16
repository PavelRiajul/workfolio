# Riajul Islam — Portfolio

A full-stack developer portfolio built from the Claude Design handoff. Editorial
black-on-white system (Geist + Inter, single blue accent), fully responsive, with
scroll motion, a filterable project grid, an inline case-study modal, a print-ready
résumé, and an embedded headless CMS.

## Stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | [Astro](https://astro.build) 5 (static output)      |
| Styling        | [Tailwind CSS](https://tailwindcss.com) v4 (`@tailwindcss/vite`) + design tokens |
| Animation      | [GSAP](https://gsap.com) + ScrollTrigger            |
| CMS            | [Sanity](https://www.sanity.io) v3, Studio embedded at `/admin` |
| Content access | GROQ queries with a seeded offline fallback         |

## Routes

| Path              | Page                                                   |
| ----------------- | ------------------------------------------------------ |
| `/`               | Home — hero, tech marquee, work grid, how-I-work, services, process, testimonials, FAQ |
| `/work`           | All projects (filterable) + case-study modal           |
| `/work/[slug]`    | Case study — `vellum`, `northwind`, `pulse`, `anchor`  |
| `/about`          | About — bio, photo gallery, developer traits           |
| `/blog`           | Blog — featured post + category-filtered grid          |
| `/resume`         | ATS-friendly résumé — copy-email, print, and a real downloadable PDF (text-layer, generated from data via jsPDF) |
| `/start`          | Contact — "book a call" / "send a message" tabs        |
| `/admin`          | Sanity Studio (content editor)                         |

## Getting started

```bash
npm install          # uses .npmrc → legacy-peer-deps (Sanity + Astro peer ranges)
npm run dev          # http://localhost:4321
npm run build        # static site → dist/
npm run preview      # serve the production build
```

The site runs **fully offline out of the box** — with no Sanity credentials it serves
the seeded content in `src/data/content.ts` (an exact copy of the design). Nothing to
configure to see the real thing.

## Connecting Sanity (content management)

1. Create a project at <https://www.sanity.io/manage> and note the **Project ID**.
2. Copy `.env.example` → `.env` and set:
   ```
   PUBLIC_SANITY_PROJECT_ID=yourProjectId
   PUBLIC_SANITY_DATASET=production
   ```
3. Add `http://localhost:4321` (and your deploy origin) to **CORS origins** in the
   Sanity project settings.
4. `npm run dev`, open `/admin`, and fill in the content. The schemas
   (`schemaTypes/`) mirror `src/data/content.ts` field-for-field, so the seed doubles
   as a reference for what to enter.

Once a real `PUBLIC_SANITY_PROJECT_ID` is set, every page queries Sanity and only
falls back to the seed if a query errors or returns nothing — so a half-filled CMS
never produces a blank page. See `src/lib/sanity.ts` (`safeFetch`).

## Project structure

```
astro.config.mjs        Astro + Tailwind(vite) + Sanity + React integrations
sanity.config.ts        Embedded Studio config (singletons, desk structure)
schemaTypes/            Sanity schemas: siteSettings, homePage, aboutPage,
                        resume, project, post
src/
  data/content.ts       Seeded fallback content (the design, verbatim)
  lib/
    sanity.ts           Client + safeFetch (offline-aware)
    content.ts          Loaders: getSite/getHome/getProjects/... (Sanity → fallback)
    types.ts            Shared content types
  styles/global.css     Tailwind import, design tokens, all component styles
  scripts/main.ts       GSAP reveal/counter + nav, filters, modal, tabs, clock…
  components/           Navbar, Footer, WhatsApp, BackToTop, Placeholder,
                        Marquee, WorkCard, ClosingCta, ProjectModal
  layouts/Base.astro    Shared shell (fonts, chrome, script)
  pages/                One file per route (see table above)
```

## Notes

- **Images** use labelled striped placeholders until you add real ones. Every
  `project`/`post` schema has an `image` field — upload in Studio and it replaces the
  placeholder automatically.
- **Editable defaults** in `src/data/content.ts` / Site Settings: WhatsApp number
  (`8801XXXXXXXXX`), phone, email, social URLs, and the résumé example details.
- **Motion** respects `prefers-reduced-motion`. Content is never gated behind JS —
  if scripts fail, everything stays visible.
