# CLAUDE.md — workfolio

Riajul Islam's portfolio, positioned as an **AI-powered full-stack developer** —
AI-accelerated delivery (AI writes the boilerplate, he owns the architecture and review),
not "AI consultancy". Every speed claim on the site is followed by an honest counterweight
(`home.aiCaveat`, rendered as `.ai-caveat`). Editorial, minimal, white-on-ink with a single
blue accent; heavy on tasteful motion (GSAP reveals, Lenis smooth scroll, CSS 3D, an
autonomous SVG mascot). Static Astro site with an optional embedded Sanity CMS.

## Stack
- **Astro 5** (static output) — `.astro` components + islands. React integration is installed (for Sanity Studio) but the UI is plain Astro + vanilla TS.
- **Tailwind CSS v4** via `@tailwindcss/vite` — but most styling is hand-written in `src/styles/global.css` using CSS custom properties (design tokens live in `@theme`).
- **GSAP + ScrollTrigger** for scroll reveals, count-ups, pinning. **Lenis** for smooth scroll.
- **Sanity v3** — Studio embedded at `/admin`. Content is fetched via GROQ with a **seeded offline fallback**, so the whole site renders with zero credentials.
- **jsPDF** — generates the downloadable résumé PDF (text-layer) from data.
- No animation libraries beyond GSAP. The mascot/3D effects are pure CSS + Web Animations API.

## Commands
```bash
npm run dev      # astro dev — local server (port 4321, or 4322+ if busy)
npm run build    # astro build → dist/
npm run preview  # serve the built site
```
```bash
npm run seed:build    # src/data/content.ts → sanity/seed.ndjson
npm run seed:import   # ...then import it into the production dataset (needs `sanity login`)
npm run schema:deploy # push the schema to the Content Lake (needs `sanity login`)
```
`.env` (see `.env.example`): `PUBLIC_SANITY_PROJECT_ID=1tfx8i80`, `PUBLIC_SANITY_DATASET=production`.
Set the project id to `placeholder` to run fully offline against `src/data/content.ts`.

**The Studio stays embedded at `/admin`** (single package, `studioBasePath` in `astro.config.mjs`) —
deliberately not split into `studio/` + `web/`. Note this means the Studio bundle builds with the
site (~12s of the build).

**The dataset is empty until seeded**, so the site still renders from `src/data/content.ts` via
`safeFetch`'s fallback. Live content takes over per-query the moment matching documents exist.

## Architecture / data flow
Pages **never** hardcode content or query Sanity directly. The flow is:

```
src/data/content.ts   ← seeded fallback content (the source of truth offline)
src/lib/types.ts      ← all content TypeScript interfaces
src/lib/sanity.ts     ← safeFetch(): query Sanity, fall back to seeded content on miss/empty/error
src/lib/content.ts    ← one loader per content type (GROQ query + fallback). Pages import ONLY from here.
```

**Keep four things in sync** when adding a content type: `src/data/content.ts` (seed),
`src/lib/types.ts` (interface), `src/lib/content.ts` (loader + GROQ), and `schemaTypes/` (Studio).
Miss the last one and editors can't author what the site queries.

**Pages hold no copy.** Every heading, label, list, stat, chip and CTA comes from a loader —
`.astro` files contain layout only. A hardcoded string in a page is a bug. Each landing page has
its own singleton (`servicesPage`, `shopifyPage`, `workPage`, `blogPage`, `startPage`,
`caseStudyPage`); site-wide chrome (nav, footer links, skip link, default SEO, default closing-CTA
buttons) lives in `siteSettings`. Shared shapes — `Heading`, `Cta`, `TextStat`, `CountStat`,
`PageHero`, `ClosingCtaContent` — are defined once in `types.ts` and registered as reusable Studio
objects in `schemaTypes/objects.ts`.

Conventions worth knowing: a `\n` inside a `Heading.title` (or any headline field) renders as a
line break; `headlineLines[]` does the same for heroes; filter/category chips reuse `Cta` where
`label` is the visible text and `href` holds the filter value ("all", "ai", "shopify").
**Not editable by design:** the decorative mockup internals (`OfferVisual`, `ServiceVisual`, the
3D hero cards) — they're illustrations tied to specific layouts, not copy.

**To add/change content:** edit `src/data/content.ts`, add/update the type in `src/lib/types.ts`,
and (if it's a new type) add a loader + GROQ projection in `src/lib/content.ts`. Loaders:
`getSite, getHome, getServicesPage, getShopifyPage, getWorkPage, getBlogPage, getStartPage,
getCaseStudy, getAbout, getResume, getServices, getShopifyServices, getProjects, getProject, getPosts`.

Two service datasets, deliberately separate:
- `services` (`Service[]`) — the four top-level offers: **AI Web Development, MVP Engineering, Shopify & CRO, Full-Stack & APIs**. Drives the home stack and `/services`.
- `shopifyServices` (`ShopifyService[]`) — the five Shopify sub-services shown only on `/shopify`.

## Routes (`src/pages/`)
| Path | File | Notes |
| --- | --- | --- |
| `/` | `index.astro` | Hero (3D card stack), tech marquee, service scroll-stack (4 offers), AI-method dark band + caveat, testimonials, work grid, process, FAQ, closing CTA. **Hosts the Mascot.** |
| `/work` | `work.astro` | Filterable project grid + case-study modal |
| `/work/[slug]` | `work/[slug].astro` | Case study — `halo`, `vellum`, `northwind`, `pulse`, `anchor` |
| `/services` | `services.astro` | Services landing — hero (velocity card `.velo`), AI-method cards + caveat, the four services as `svcf` rows (`OfferVisual`), engagement models, process, FAQ |
| `/stack` | `stack.astro` | The toolbox and the four locked build templates (Landing · Web App · B2B · AI). Linked from `/services` and the footer, not the tab bar. Source: `docs/mvp-stack-reference.md` — **only the publishable parts**; pricing, market strategy and studio gaps stay in that doc. |
| `/shopify` | `shopify.astro` | **Shopify + CRO merged.** Hero (Shopify 3D scene), brands, 5 Shopify services (`ServiceVisual`), approach, dark by-the-numbers, then the CRO half at `#cro`: `CroDashboard`, funnel leak + fixes, CRO loop (`#cro-process`), ROI calculator (`#cro-calc`, inline script), experiments leaderboard, featured work, testimonials, merged FAQ |
| `/cro` | — | Retired; redirects to `/shopify#cro` via `redirects` in `astro.config.mjs` |
| `/about` | `about.astro` | Bio, photo gallery, traits |
| `/blog` | `blog.astro` | Featured post + category-filtered grid |
| `/resume` | `resume.astro` | ATS résumé; copy-email, print, real downloadable PDF (jsPDF, lazy-loaded `resume-pdf.ts`) |
| `/start` | `start.astro` | Contact — "book a call" (inline Calendly iframe, URL from `startPage.call.schedulerUrl`) / "send a message" tabs |
| `/admin` | (Sanity) | Embedded Studio |

## Components (`src/components/`)
- `Navbar.astro` — **bottom tab bar** (not a top navbar). Floating pill on desktop, full-width bar on mobile. Tabs: Home · Work · Services · Shopify · Blog · About · Talk. Supports `fa-solid`/`fa-brands` icons via full icon class. Has `id="nav"`.
- `Footer.astro`, `WhatsApp.astro` (floating FAB, bottom-right), `BackToTop.astro` (`#b2t`, bottom-left).
- `Mascot.astro` — autonomous animated SVG blob pet (see below). Home only.
- `WorkCard.astro`, `ProjectModal.astro`, `Marquee.astro`, `ClosingCta.astro`.
- `Placeholder.astro` — image with a hatched fallback. Source order: Sanity upload → `src` file in `/public` → placeholder. A `src` whose file doesn't exist yet falls back to the placeholder (checked with `fs` at build time), so captions can be wired before photos land.
- **Project covers:** drop `public/work/<slug>.jpg` (e.g. `halo.jpg`, `vellum.jpg`) and it fills the work card, the case-study hero and the Shopify featured card. A Sanity upload on the project wins over the file.
- **About photos:** drop files into `public/about/` matching the paths in `about.gallery` (`me.jpg`, `setup.jpg`, `project.jpg`, `coffee.jpg`, `gaming.jpg`, `books.jpg`, `outdoors.jpg`) — they appear with no code change. Or upload per-photo in the Studio (About Page → Photo gallery), which wins over the file. Frames are 4:5, so crop portrait.
- `ServiceStack.astro` — home scroll-stacking glimpse of the four services (sticky cards + GSAP settle, still `#sstack`). Pairs copy with `OfferVisual`.
- `OfferVisual.astro` — mockup per top-level service, keyed by `service.visual` (`ai` prompt→reviewed-code, `mvp` sprint timeline, `commerce` storefront+uplift, `api` endpoints). Shared by `ServiceStack` and `/services`. Uses the `.sv`/`.sv-panel` shell plus `.ov-*` internals.
- `ServiceVisual.astro` — tone-matched mockup of each **Shopify** sub-service (`tone`: indigo/terracotta/amber/sage/ink). Used by `/shopify` only.
- `CroDashboard.astro` — CRO visual (uplift card + live A/B test + checkout funnel). Wrap in an element with `data-bars` so bars grow on scroll. Used by `/shopify`.

## Layout — `src/layouts/Base.astro`
Wraps every page. Renders: handwritten brand signature (`.brand-sig`, Caveat font, fixed top-left, links home), a "← Home" pill (`.back-home`, fixed top-right, only when `subpage`), `Navbar`, `<slot/>`, `Footer`, `WhatsApp`, `BackToTop` (unless `backToTop={false}`), and imports `src/scripts/main.ts`.
Props: `title, description, onHome, subpage, bodyClass, printChrome, backToTop`.
- `onHome` is set on `/`; `subpage` on every other page (shows the back-home pill, hides chrome on print when `printChrome`).
- Home passes `bodyClass="home"` (used to stack `.b2t` above the mascot).

## Design system (`src/styles/global.css`)
Tokens in `@theme` (also exposed as CSS vars):
- Colors: `--color-ink #0a0a0a`, `--color-grey-1/2/3`, `--color-surface #f4f4f5`, `--color-blue #2563eb` (the single brand accent). Shopify green `#5e8e3e` used on Shopify/CRO surfaces.
- **Contrast is a constraint, not a preference.** `--color-grey-3` is `#767676` — the lightest grey that clears WCAG AA (4.54:1) on white. It was `#9a9a9a` (2.81:1) and failed across ~300 elements. On `--color-surface` panels grey-3 only reaches 4.13:1, so muted text *on a grey panel* uses `--color-grey-2`. Don't lighten either one back. The only text still under AA is inside the decorative mockups (`hv-*`, `sv-*`, `ov-*`, `sh-*`), which are `aria-hidden` illustrations.
- Fonts: `--font-display 'Geist'`, `--font-body 'Inter'`, `--font-mono 'Geist Mono'`, `--font-hand 'Caveat'`.
- `:root`: `--line` / `--line-soft` (subtle borders), `--maxw 1180px`, `--tabbar-h 64px`.
**Spacing & layout system (use it — do not invent values):**
- One fluid scale: `--space-2xs … --space-3xl`, plus `--gutter` (page inset) and `--section-y` / `--section-y-tight` (band rhythm). Every gap, pad and margin picks a step. **Never write a bare `clamp()` for spacing** and never write a token as `--x: var(--x)` — a self-referential custom property is invalid and silently drops the whole declaration (it once flattened every section's padding to zero).
- Layout primitives: `.section` (full-bleed band = rhythm + gutter), `.shell` (centred column *with* gutter), `.wrap` (centred column *inside* a section). Modifiers instead of inline padding: `.section-tight`, `.section-tight-top/-bottom`, `.section-flush-top/-bottom`, `.section-bleed`.
- Stacking helpers `.stack-sm/-md/-lg`, measure helpers `.measure` / `.measure-wide` (ch-based), anchor offsets `.anchor` / `.anchor-deep`.
- **Four breakpoints only — 480 / 640 / 768 / 900.** Nothing else. (Was 10 ad-hoc values.)
- Pages carry no inline `style` for spacing. If you reach for one, add a modifier instead.
- **Don't put two accordion sections back to back** — Process uses the `.cyc` timeline (`.cyc-blue` off commerce pages) precisely so it doesn't read as a second FAQ.

**Visual language:** flat/minimal, white bg + ink text + blue accent, **pill** buttons (`border-radius: 9999px`), cards ~14–22px radius, **soft shadows, no outlines** (only thin `rgba(10,10,10,.08)` borders), dotted-grid hero motif. Motion = smooth ease (`cubic-bezier(.22,.61,.36,1)`), gentle. **Never hardcode a palette — use the tokens.**

global.css is organized in clearly-labeled `/* ===== ... ===== */` sections (tokens, base, tab bar, hero, Shopify/CRO, AI/services surfaces, components, mobile polish).
Tone keys (`.tone-*`) set `--sbg/--sfg/--smut/--spill*` for stack + showcase cards: `indigo, terracotta, amber, sage, ink` (Shopify) and `ai` (dark with a blue spill).
`svcf` showcase rows take a per-row `--acc` accent (blue by default; the commerce row passes Shopify green).

## Client interactions (`src/scripts/main.ts`)
Single module imported once by `Base.astro`; runs on `DOMContentLoaded`. Every feature is guarded by element presence (safe on every route) and respects `prefers-reduced-motion`. Init functions:
`initSmoothScroll` (Lenis⇄ScrollTrigger + anchor glide, offset −24), `initNav`, `initWhatsAppFab` (tucks the FAB when the footer is in view), `initHeroTilt` (mouse-tilt the 3D stack via `--rx`/`--ry`; skipped when `#hv-stage[data-locked]`), `initShopifyStack` (drives `#sstack`), `initBarGrow` (grows any `.bargrow` inside a `[data-bars]` group), `initTabSpy` (scroll-spy for in-page anchor tabs), `initReveal`, `initHeroIntro`, `initCountUp`, `initRotatingWord`, `initProjectFilter`, `initModal`, `initBlogFilter`, `initStart`, `initResume`, `initClock`, `initBackToTop`.

## The 3D hero card stack
`index.astro` and `shopify.astro` heroes have `.hero > .hero-visual > .hv-stage#hv-stage > .hv-card`.
CSS `preserve-3d`; each card is positioned with `translate3d(...)` and floats (`hvFloat`). The stage tilts toward the pointer via `--rx`/`--ry` (`initHeroTilt`). Hidden below 900px. Cards: code / browser / phone / shop (home), store / stat / cart / badge (shopify).

## The Mascot (`Mascot.astro`) — autonomous roaming pet
Reusable, drop-in, no libraries. Home only, **desktop only** (`display:none` ≤767px), bottom-left.
- **Self-themes**: a `THEME` block in its scoped `<style>` reads the host's CSS vars (`--color-blue`, `--color-ink`, `--color-surface`, `--font-body`) with fallbacks.
- **States/poses** via CSS keyframes (idle breathe + blink, walking, one-shot physics jump with anticipation → gravity arc → squash → settle).
- **Autonomous roam loop** (JS): auto-starts ~1.6s after load, then every couple seconds picks a behaviour: wander to a random point, **interact** with any visible element across the whole page (`PLAY` selector → adds `.mascot-bonk`, a safe `translate`/`scale` dip), the **3D-stack play** (leap on → tilt the stack via `--rx`/`--ry` while locking the mouse-tilt → slide off; hero only), or an **idle act** (look-around / double-bounce / 360° spin). Travel uses the **Web Animations API** (`commitStyles` to bake each phase); body deformation uses CSS classes (`crouch/leaping/landing/sliding`). Flips to face travel direction (`.face-left`).
- **Reduced-motion**: no roaming at all; click still does a single hop. Pauses when the tab is hidden / below 900px.
- Plan/notes: `docs/mascot-journey-plan.md`.

## Conventions & gotchas
- **Floating chrome occupies the corners** — WhatsApp FAB (bottom-right, tucks near footer), back-to-top (`#b2t`, bottom-left; lifted above the mascot on `body.home`), Mascot (bottom-left, home). Keep new fixed UI clear of these and the bottom tab bar.
- **Respect `prefers-reduced-motion`** everywhere — disable continuous loops (CSS) and guard autonomous JS motion. This is a hard requirement, verified per feature.
- **Reusability:** when adding effects, read the host tokens; don't bake in colors. The mascot is meant to be droppable into other sites by editing only its `THEME` block.
- **Verification:** there's a Puppeteer screenshot helper pattern (`.vt-shoot.mjs`, uses local Chrome at `/Applications/Google Chrome.app/...`, writes to `/tmp/vt`). Adapt the port to the running dev port. **Headless Chrome renders actively-animating, `filter`-composited layers pale/translucent** — to capture true colors, emulate `prefers-reduced-motion: reduce` or pause animations; `getComputedStyle` is the source of truth for debugging motion.
- Sanity is optional; everything works offline against `src/data/content.ts`.
