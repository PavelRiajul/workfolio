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
- **`@astrojs/sitemap`** — emits `sitemap-index.xml`; `/admin` is filtered out.
- No animation libraries beyond GSAP. The mascot/3D effects are pure CSS + Web Animations API.
- **No third-party CSS at runtime.** Fonts are self-hosted (`src/styles/fonts.css` +
  `public/fonts/`) and icons are inline SVG (`src/lib/icons.ts`). Both used to be
  render-blocking hops to `fonts.googleapis.com` and `cdnjs.cloudflare.com`. Don't add a CDN
  `<link>` back.
- **One `@font-face` per family per subset — never one per weight.** Geist, Geist Mono and
  Inter are variable fonts carrying `wght 100..900` in a single file, so `font-weight: 100 900`
  is declared once and the browser interpolates. Google's CSS API still emits a face per weight
  and the original generator copied that, which meant four byte-identical `geist-*.woff2` files
  were all declared, all matched, and all downloaded: 351 KB of fonts on the home page against
  122 KB of distinct bytes. It also silently broke Inter 700 — no 700 face was declared, so
  every `<strong>` in the blog clamped to 600. Caveat is genuinely static and stays
  weight-specific; it drives only the `.brand-sig` wordmark and is subset to exactly the
  codepoints its `unicode-range` claims. **Subsetting narrower than the declared range is a
  bug** — the browser picks a face by range and then falls back per missing glyph, so an
  accented name would drop that one letter to `cursive`.
- **`vercel.json` sets the cache headers for `/public` assets.** Vercel gives hashed
  `_astro/*` output a year and everything in `public/` `max-age=0, must-revalidate`, so all
  four fonts were revalidated on every repeat visit before text could render. Fonts are now
  `immutable` for a year, which means **changing a font requires changing its filename** —
  they carry no content hash.

## Commands
```bash
npm run dev      # astro dev — local server (port 4321, or 4322+ if busy)
npm run build    # astro build → dist/
npm run preview  # serve the built site
```
```bash
npm run og            # regenerate the per-page social cards → public/og/ (needs local Chrome)
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

**`withFallback` pairs list items by identity (`slug`/`name`/`id`), not by position.** Object
results have always merged field-by-field; arrays used to be returned wholesale, so a live
document missing a field lost it entirely rather than falling back. That is what suppressed the
blog: ten `post` documents existed in Sanity with no `body`, the non-empty array meant the seed
never applied, and `blog/[slug].astro` generated nothing — no URLs, an empty `rss.xml`, and
`articleSchema()` emitting on zero pages, all while the build reported success. Pairing is by
identity rather than index on purpose: merging positionally would graft one post's body onto
another the moment an editor reorders or inserts a document.

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
**Render those line breaks with `<Headline text={...} />`** (`src/components/Headline.astro`),
which takes either the `\n` string or the pre-split array. It emits a space before each `<br>`:
adjacent text nodes are concatenated when anything extracts the text layer and `<br>` is not a
word boundary, so 38 hand-rolled `.map(... <br/> ...)` call sites were shipping "Builtfor speed."
to crawlers, screen readers and AI retrievers while looking correct on screen.
**Not editable by design:** the decorative mockup internals (`OfferVisual`, `ServiceVisual`, the
3D hero cards) — they're illustrations tied to specific layouts, not copy.

**To add/change content:** edit `src/data/content.ts`, add/update the type in `src/lib/types.ts`,
and (if it's a new type) add a loader + GROQ projection in `src/lib/content.ts`. Loaders:
`getSite, getHome, getServicesPage, getShopifyPage, getWorkPage, getBlogPage, getStartPage,
getCaseStudy, getAbout, getResume, getServices, getShopifyServices, getProjects, getProject, getPosts`.

**Blog specifics.** `src/lib/portable.ts` is the shared brain: `headings()` decides heading
ids and is used by *both* the renderer and the TOC (two implementations would drift and leave
the contents list pointing at nothing), `relatedPosts()` prefers same-`series` over
same-category and only ever returns published posts, `isPublished()` is the one definition of
"has a page". The `/blog` chips are real `<a>` links to the hubs — a crawler follows them, JS
intercepts the click and filters in place. A chip only gets an href if that category actually
has a hub. Body images: Sanity upload wins, else a `src` under `/public`; a missing file
renders no figure rather than a broken image. Code blocks are highlighted at build time by
Astro's bundled Shiki (`astro:components` `Code`) — no new dependency, and an unknown
`language` degrades to plain text.

**Categories live once, in `src/lib/categories.ts`** — the Studio dropdown in `schemaTypes/post.ts`
is built from that list, and `categoryLabel(value, authored?)` derives the display name. A post's
`categoryLabel` field is an optional per-post override, not a required field: the topic hub takes
its heading from the first post in the category, so a single post saved with it blank used to leave
the hub with no title, and two posts spelling it differently changed the heading by publish order.
Each category also carries the **service slug** it points at, resolved by `serviceForCategory()` —
that is what puts the right offer in a post's right rail (`ServiceCard.astro`). It stores a slug,
never copy: the card's title, kicker and tagline all come from `getServices()`, so editing a
service in the Studio updates every post pointing at it. An unmapped category renders no card,
which is better than the wrong offer beside an article.

**The post layout is three columns at ≥1280px** — contents left (`.post-nav`), article centre,
related service right (`.post-aside`) — two at ≥1024 with the offer in flow below the article, and
one below that. The article container widens to 1320px at the three-column tier on purpose: at
`--maxw` the middle track lands at ~556px, which is 62 characters and cramps every comparison
table. Both rails are `position: sticky` and hold **one card each**; three cards in one rail
squeezed the contents list to six of eleven sections. Sharing lives at the end of the article,
which is when somebody decides to share it.

**Social profiles are a repeatable list** (`siteSettings.socialLinks`), resolved in one place by
`src/lib/socials.ts`. The footer, the résumé contact line, the résumé PDF and `sameAs` in the
Person schema all read `resolveSocials()`/`socialUrls()`, so markup and structured data can't claim
different profiles — the footer used to link the bare `https://github.com` while `sameAs` asserted
`github.com/riajulislam`, and a contradiction between the two is worse for entity resolution than
either link alone. A value with no path is treated as unset and renders nothing; an icon with no
glyph in `icons.ts` degrades to `fa-solid fa-link` rather than an empty 44px circle. The old fixed
`socials.{github,linkedin,x}` object is read only when the list is empty.

**Add icons with `npm run icons -- brands:instagram solid:link`** (`scripts/fetch-icons.mts`),
which pulls real geometry from Font Awesome Free 6.5.1 and merges it into `src/lib/icons.ts`.
`icons.ts` always documented this script; it didn't exist, so glyphs were pasted by hand.

**`/llms.txt`** (`src/pages/llms.txt.ts`) is generated from the same loaders as the pages, so it
can't drift from the site it describes, and it lists only posts that have a page.

**Sitemap `lastmod` covers the blog routes only** — `blogLastmod()` in `astro.config.mjs` derives
dates from `updatedAt || publishedAt`. Static pages deliberately get none: stamping all fourteen
with the build time marks everything as modified on every deploy, and Google discards a sitemap
whose dates are obviously synthetic. The config runs before the Astro runtime exists, so it can't
use `src/lib/content.ts` and queries Sanity directly — it applies the same rule the loaders do.

**`publicFileExists()` (`src/lib/public-file.ts`) must be used for every build-time /public
check.** The obvious `new URL('../../public' + p, import.meta.url)` is wrong: components get
bundled, so `import.meta.url` points at `dist/pages/*.mjs` and the check resolves to
`dist/public/…`, which never exists. It silently "worked" for components that happened to land
in `dist/chunks/` (right depth by luck) and failed for anything inlined into a page module —
and it always works in dev, which is what makes it easy to miss. `process.cwd()` is correct in
both.

**A blog post is published by having a `body`.** `blog/[slug].astro` only generates pages for
posts whose `body` is non-empty, so an unwritten post gets no URL, no sitemap entry and an
unlinked card. This is deliberate: an indexable page carrying nothing but an excerpt is thin
content, which costs the domain more than the extra URL gains. `publishedAt` (ISO-8601) is
separate from `date` (the display label like "July 2026") because `datePublished` in the
Article JSON-LD has to parse, and a month-and-year string doesn't.

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
| `/blog` | `blog.astro` | Featured post + category-filtered grid. A card only links once its post has a `body` |
| `/blog/[slug]` | `blog/[slug].astro` | The article — Portable Text body, TOC, author card, series/related, Article JSON-LD |
| `/blog/category/[category]` | `blog/category/[category].astro` | Topic hub — one per category that has published posts, with `ItemList` JSON-LD |
| `/rss.xml` | `rss.xml.ts` | Feed of published posts |
| `/resume` | `resume.astro` | ATS résumé; copy-email, print, real downloadable PDF (jsPDF, lazy-loaded `resume-pdf.ts`) |
| `/start` | `start.astro` | Contact — "book a call" (inline Calendly iframe, URL from `startPage.call.schedulerUrl`) / "send a message" tabs |
| `/admin` | (Sanity) | Embedded Studio |

## Components (`src/components/`)
- `Navbar.astro` — **bottom tab bar** (not a top navbar). Floating pill on desktop, full-width bar on mobile. Tabs: Home · Work · Services · Shopify · Blog · About · Talk. Supports `fa-solid`/`fa-brands` icons via full icon class. Has `id="nav"`.
- `Footer.astro`, `WhatsApp.astro` (floating FAB, bottom-right), `BackToTop.astro` (`#b2t`, bottom-left).
- `Mascot.astro` — autonomous animated SVG blob pet (see below). Home only.
- `WorkCard.astro`, `ProjectModal.astro`, `Marquee.astro`, `ClosingCta.astro`.
- `Icon.astro` — inline SVG icon. Takes the **same Font Awesome class string** the CMS stores
  (`fa-solid fa-house`), so nav/service icons stay authorable. Geometry lives in
  `src/lib/icons.ts` (25 glyphs, Font Awesome Free 6.5.1). **A new icon must be added to that
  map** — an unknown key renders nothing rather than a tofu box. Decorative by default; pass
  `label` for a standalone icon that carries meaning.
- `PortableText.astro` + `PortableSpan.astro` — the blog body renderer. Handles paragraphs,
  h2–h4, bullet/number lists, blockquote, code blocks, and `strong`/`em`/`code`/link marks.
  Coalesces consecutive list items into one `<ul>`/`<ol>` — Portable Text stores each bullet as
  its own sibling block, so rendering naively gives one list per item. The Studio's block
  schema is restricted to exactly what this renders.
- `Placeholder.astro` — image with a hatched fallback. Source order: Sanity upload → `src` file in `/public` → placeholder. A `src` whose file doesn't exist yet falls back to the placeholder (checked with `fs` at build time), so captions can be wired before photos land.
- **Project covers:** drop `public/work/<slug>.jpg` (e.g. `halo.jpg`, `vellum.jpg`) and it fills the work card, the case-study hero and the Shopify featured card. A Sanity upload on the project wins over the file.
- **About photos:** drop files into `public/about/` matching the paths in `about.gallery` (`me.jpg`, `setup.jpg`, `project.jpg`, `coffee.jpg`, `gaming.jpg`, `books.jpg`, `outdoors.jpg`) — they appear with no code change. Or upload per-photo in the Studio (About Page → Photo gallery), which wins over the file. Frames are 4:5, so crop portrait.
- `ServiceStack.astro` — home scroll-stacking glimpse of the four services (sticky cards + GSAP settle, still `#sstack`). Pairs copy with `OfferVisual`.
- `OfferVisual.astro` — mockup per top-level service, keyed by `service.visual` (`ai` prompt→reviewed-code, `mvp` sprint timeline, `commerce` storefront+uplift, `api` endpoints). Shared by `ServiceStack` and `/services`. Uses the `.sv`/`.sv-panel` shell plus `.ov-*` internals.
- `ServiceVisual.astro` — tone-matched mockup of each **Shopify** sub-service (`tone`: indigo/terracotta/amber/sage/ink). Used by `/shopify` only.
- `CroDashboard.astro` — CRO visual (uplift card + live A/B test + checkout funnel). Wrap in an element with `data-bars` so bars grow on scroll. Used by `/shopify`.

## SEO
Four separate things drive the four lines of a Google result. Don't collapse them:

| SERP line | Driven by |
| --- | --- |
| Site name (**Riajul Islam**) | `WebSite` JSON-LD — `websiteSchema()`. Google reads it from the homepage only. |
| URL breadcrumb (`riajulislam.dev › work › halo`) | `BreadcrumbList` — `autoBreadcrumbs()` |
| Title link | `<title>` |
| Snippet | `<meta name="description">` |

- **`src/lib/schema.ts`** builds every JSON-LD node from the loaders (no hardcoded copy, same
  rule as pages). `Base.astro` assembles `Person` + `WebSite` + a `WebPage` node + breadcrumbs
  into **one `@graph`** per page; pages add more via the `schema` prop
  (`faqSchema`, `servicesSchema`, `caseStudySchema`, `articleSchema`).
  Nodes cross-reference by `@id` (`#person`, `#website`) — keep it one graph, not several
  `<script>` blocks.
- `Base.astro` props: `schema`, `pageType` (schema.org `WebPage` subtype), `ogType`,
  `ogImage`, `breadcrumbLeaf`, `noindex`. **`pageType` and `ogType` are deliberately separate** —
  a post is `WebPage` + `og:type=article`, because the `BlogPosting` is its own node and two
  `BlogPosting` nodes would claim the same article twice.
- `sameAs` drops bare-domain placeholders (`https://x.com`) and derives real profile URLs from
  the `*Handle` fields. **The handles in `siteSettings.socials` must be real** — a `sameAs`
  pointing at a nonexistent profile is worse than none.
- **Social cards are per route**, generated by `npm run og` from the same content the page
  renders, committed to `public/og/`. The route→filename rule (`/work/halo` → `work-halo.png`)
  lives in *both* `scripts/og-images.mts` and `Base.astro` — change one, change the other.
  A route with no card falls back to `og/default.png` (build-time `fs` check).
- `public/robots.txt` disallows `/admin` and points at the sitemap.

## Layout — `src/layouts/Base.astro`
Wraps every page. Renders: handwritten brand signature (`.brand-sig`, Caveat font, fixed top-left, links home), a "← Home" pill (`.back-home`, fixed top-right, when `subpage` **and** `backHome`), `Navbar`, `<slot/>`, `Footer`, `WhatsApp`, `BackToTop` (unless `backToTop={false}`), and imports `src/scripts/main.ts`.
Props: `title, description, onHome, subpage, bodyClass, printChrome, backToTop, backHome`.
- `onHome` is set on `/`; `subpage` on every other page (shows the back-home pill, hides chrome on print when `printChrome`).
- **`backHome={false}` on any page that renders its own `.cs-back` link** — the three detail routes (`blog/[slug]`, `work/[slug]`, `blog/category/[category]`). Their "← Back to blog" / "← Back to work" landed in the same band as the fixed "← Home" pill, giving two back buttons a few hundred pixels apart while the wordmark and the Home tab already went home twice more. The contextual link wins: from an article, up one level is the useful move, not up to the root.
- Home passes `bodyClass="home"` (used to stack `.b2t` above the mascot).

## Design system (`src/styles/global.css`)
Tokens in `@theme` (also exposed as CSS vars):
- Colors: `--color-ink #0a0a0a`, `--color-grey-1/2/3`, `--color-surface #f4f4f5`, `--color-blue #2563eb` (the single brand accent). Shopify green `#5e8e3e` used on Shopify/CRO surfaces.
- **Contrast is a constraint, not a preference.** `--color-grey-3` is `#767676` — the lightest grey that clears WCAG AA (4.54:1) on white. It was `#9a9a9a` (2.81:1) and failed across ~300 elements. On `--color-surface` panels grey-3 only reaches 4.13:1, so muted text *on a grey panel* uses `--color-grey-2`. Don't lighten either one back. The only text still under AA is inside the decorative mockups (`hv-*`, `sv-*`, `ov-*`, `sh-*`), which are `aria-hidden` illustrations.
- Fonts: `--font-display 'Geist'`, `--font-body 'Inter'`, `--font-mono 'Geist Mono'`, `--font-hand 'Caveat'`.
- `:root`: `--line` / `--line-soft` (subtle borders), `--maxw 1180px`, `--tabbar-h 64px`.
**Mobile-first is the priority — most visitors arrive on a phone, much of it
from cold outreach.** That traffic gives you seconds, so the top of the page
carries the whole pitch: on the home page the primary CTA lands at 0.5 screens
and the first project at 1.4. Heroes therefore have a `ledeShort` for phones
(a genuinely shorter sentence, not a truncation — the full lede still renders
on desktop), and anything redundant on mobile is dropped rather than shrunk
(`.hero-avail` duplicates the availability chip above it). The WhatsApp FAB
stays hidden until the reader is past the hero: at the top it covered a hero
stat, and the hero's own CTA is right there.

**Mobile heroes fill the viewport** — `min-height: calc(100svh - var(--tabbar-h) - env(safe-area-inset-bottom))`. Sized to the space *above* the fixed tab bar, because plain `100svh` doesn't know the bar exists and strands the last CTA underneath it. A `::after` chevron marks that content follows (killed under `prefers-reduced-motion`), since a full-screen hero otherwise hides the fact. Hero visuals (`.hero-visual`, including `.velo-wrap`) stay hidden ≤900px or the hero overflows the viewport.

**Mobile (audited on iPhone SE, 375×667 portrait):**
- Touch targets are **≥44px** — chips, tabs, footer links, accordion summaries, standalone text links and the range sliders all have explicit mobile sizing. Don't ship a control smaller than that.
- **No informative text below 12px.** The one exception is the bottom tab-bar label (10px ≤400px): seven tabs can't hold 12px type at 375px, and 10px matches the iOS tab-bar convention.
- `.hero` drops `min-height:100svh` on mobile — 100svh doesn't account for the fixed tab bar, so the last CTA ended up underneath it.
- Heroes get extra top padding on mobile to clear the fixed wordmark, which otherwise lands on the eyebrow.
- **Headings centre on mobile; body copy stays left-aligned.** Centring a nine-line paragraph gives every line a different start and wrecks readability.
- The calculator's fill is a `--fill` custom property, not an inline `background`, so the track can be restyled for touch.
- **Density over stacking.** Card grids go 2-up on phones rather than one long column: 4 → 2×2, 5 → 2×2 + one full-width (`:last-child:nth-child(odd) { grid-column: 1/-1 }`), 3 → 2 + one full-width. Applies to `.appr-grid`, `.trait-grid`, `.tpl-grid`, `.eng-grid`, `.tool-grid`, `.every-list`, `.fixes`, `.svcf-feats`, `.work-grid`, `.post-grid`, `.tst-grid`. Type and padding shrink to match — **cards must stay short**; long lists get clamped (`.tpl-stack` shows 5 chips + a "+N").
- **The home scroll-stack stays sticky on mobile, but with one pin point.** The desktop cascade (`top: 86px + i*16px`) needs more room than a 667px screen has — the last cards' static positions end up above their own pins, so sticky can't push them down and the final transition silently reverses. On mobile every card pins at `top: 84px`, so each transition is identical. Cards must also stay a **uniform height** (`min-height: 350px`, just above the ~330px tallest natural card) or a short card won't fully cover the one beneath it, and that sliver is exactly what reads as "stacking the wrong way".
- **Two-up cards break long strings.** At ~176px a bordered pill with wrapped text looks broken, so `.tag-pill` is `nowrap` + ellipsis with the type note stacked beneath, and placeholder captions truncate rather than wrap.
- Text floor on mobile is **11px for micro-labels** (chips, column headers) and **12px for anything you read**. Tab-bar labels are the documented 10px exception.
- **Mobile page length is a design constraint.** `/shopify` and `/services` were 26 and 18 screens tall. The `.svcf-media` mockups are hidden ≤640px (decorative, and the home stack already drops its equivalent), and each service's feature list ships inside `<details class="feats" open>` — `initFeatureLists` closes them ≤640px only, so desktop and no-JS are unchanged and the content stays in the DOM for search. Now 22 and 13 screens.

**Spacing & layout system (use it — do not invent values):**
- One fluid scale: `--space-2xs … --space-3xl`, plus `--gutter` (page inset) and `--section-y` / `--section-y-tight` (band rhythm). Every gap, pad and margin picks a step. **Never write a bare `clamp()` for spacing** and never write a token as `--x: var(--x)` — a self-referential custom property is invalid and silently drops the whole declaration (it once flattened every section's padding to zero).
- Layout primitives: `.section` (full-bleed band = rhythm + gutter), `.shell` (centred column *with* gutter), `.wrap` (centred column *inside* a section). Modifiers instead of inline padding: `.section-tight`, `.section-tight-top/-bottom`, `.section-flush-top/-bottom`, `.section-bleed`.
- Stacking helpers `.stack-sm/-md/-lg`, measure helpers `.measure` / `.measure-wide` (ch-based), anchor offsets `.anchor` / `.anchor-deep`.
- **Four breakpoints only — 480 / 640 / 768 / 900.** Nothing else, with one documented exception: the blog post layout adds **1024** and **1280**, where its column count changes (one → two → three). Those tiers are about how many rails fit beside a fixed reading measure, which is a different question from the mobile scale, and they are confined to `blog/[slug].astro`. Don't add more.
- Pages carry no inline `style` for spacing. If you reach for one, add a modifier instead.
- **Don't put two accordion sections back to back** — Process uses the `.cyc` timeline (`.cyc-blue` off commerce pages) precisely so it doesn't read as a second FAQ.

**Visual language:** flat/minimal, white bg + ink text + blue accent, **pill** buttons (`border-radius: 9999px`), cards ~14–22px radius, **soft shadows, no outlines** (only thin `rgba(10,10,10,.08)` borders), dotted-grid hero motif. Motion = smooth ease (`cubic-bezier(.22,.61,.36,1)`), gentle. **Never hardcode a palette — use the tokens.**

global.css is organized in clearly-labeled `/* ===== ... ===== */` sections (tokens, base, tab bar, hero, Shopify/CRO, AI/services surfaces, components, mobile polish).
Tone keys (`.tone-*`) set `--sbg/--sfg/--smut/--spill*` for stack + showcase cards: `indigo, terracotta, amber, sage, ink` (Shopify) and `ai` (dark with a blue spill).
`svcf` showcase rows take a per-row `--acc` accent (blue by default; the commerce row passes Shopify green).

## Client interactions (`src/scripts/main.ts`)
Single module imported once by `Base.astro`; runs on `DOMContentLoaded`. Every feature is guarded by element presence (safe on every route) and respects `prefers-reduced-motion`. Init functions:
`initSmoothScroll` (Lenis⇄ScrollTrigger + anchor glide, offset −24), `initTabBar` (tucks the bottom bar on scroll-down, restores it on scroll-up and at both ends of the page — it's `position:fixed`, so without this it covers body copy the whole way down), `initWhatsAppFab` (tucks the FAB when the footer is in view), `initHeroTilt` (mouse-tilt the 3D stack via `--rx`/`--ry`; skipped when `#hv-stage[data-locked]`), `initShopifyStack` (drives `#sstack`), `initBarGrow` (grows any `.bargrow` inside a `[data-bars]` group), `initTabSpy` (scroll-spy for in-page anchor tabs), `initReveal`, `initHeroIntro`, `initCountUp`, `initRotatingWord`, `initProjectFilter`, `initModal`, `initBlogFilter`, `initStart`, `initResume`, `initClock`, `initBackToTop`.

## The 3D hero card stack
Every landing page has one: `.hero > .hero-visual > .hv-stage#hv-stage > .hv-card`.
CSS `preserve-3d`; each card is positioned with `translate3d(...)` and floats (`hvFloat`). The stage tilts toward the pointer via `--rx`/`--ry` (`initHeroTilt`). Hidden below 900px. One `#hv-stage` per page — `initHeroTilt` finds it by id, so a new scene needs no JS.
Card sets: code/browser/phone/shop (home), store/stat/cart/badge (shopify), layers/db/deploy/badge (stack),
case/stat/list/badge (work), post/editor/tags/badge (blog), msg/slot/reply/badge (talk).
Index pages (work, blog, talk) add `.hero-compact` — same stage, no 100svh, so the grid below stays in reach.
`.hero-meta` renders its own em-dash; eyebrow values are stripped of a leading one so the CMS can't double it.
**Any looping animation inside a card must be named in the `prefers-reduced-motion` block** — `animation`
doesn't inherit, so killing it on `.hv-inner` doesn't reach children (see `.bl-ed-body .caret`).

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
