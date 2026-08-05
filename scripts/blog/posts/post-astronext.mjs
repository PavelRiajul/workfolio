import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/astro-vs-nextjs/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-astro-vs-nextjs',
  slug: 'astro-vs-nextjs',
  title: 'Astro or Next.js: Picking by What the Page Has to Do',
  category: 'frontend',
  order: 61,
  readTime: '13 min read',
  date: 'March 2026',
  publishedAt: '2026-03-13',
  series: 'Foundations',
  excerpt:
    'Not a benchmark. The question is whether your pages are documents or an application — and what it costs when you answer it wrong.',
  coverLabel: 'Astro versus Next.js — cover',
  body: body(
    p('Every comparison of these two ends up measuring the wrong thing. Astro ships less JavaScript, Next.js has more features, both are fast when used properly, and none of that tells you which one your project should use.'),
    p('The useful question is narrower: are the pages you are building **documents that occasionally do something**, or an **application that happens to have pages**? Get that answer right and the framework follows from it. Get it wrong and you spend two years fighting the tool.'),
    p('I use both — this site is Astro, most client applications are Next.js — so here is the decision as I actually make it, including the cases where I have changed my mind.'),

    h2('What is the actual difference?'),
    p('Where JavaScript ends up by default. Everything else follows from that one decision.'),
    table('The default, in one line each', [
      ['', 'Astro', 'Next.js'],
      ['Default output', 'HTML, no JS', 'HTML plus a React runtime'],
      ['Interactivity', 'Opt in, per component', 'Available everywhere'],
      ['Routing', 'File-based, static by default', 'File-based, server by default'],
      ['State across pages', 'None — full navigations', 'Preserved by the client router'],
      ['Best at', 'Content that is mostly read', 'Applications that are used'],
    ]),
    p('Astro renders components to HTML at build time and ships nothing to the browser unless you ask. Next.js ships a React application that renders on the server first. Both produce fast first loads; they differ in what happens afterwards.'),
    p('That difference is invisible on a landing page and decisive on a dashboard, which is exactly why the framework argument never resolves — people are describing different projects.'),
    img('default-output', 'Two build outputs from similar sources, one carrying a runtime alongside the markup', 'Both render HTML first. The difference is what arrives with it, and what that buys you afterwards.'),

    h2('When is Astro obviously right?'),
    p('When most of the page is content, and interactivity is a handful of islands rather than the substance of the thing.'),
    ul([
      '**Marketing sites, portfolios, documentation.** The page is read, not operated. Shipping a component runtime to render text is paying for something the page never uses.',
      '**Blogs and content sites.** Content collections or a CMS, static output, and a CDN. This site is 65 static pages with one small script.',
      '**Anything where the first paint is the product.** Cold traffic gives you seconds; HTML that is already painted beats a runtime that has to boot.',
      '**Sites where a page is genuinely independent** — no shared state to preserve across a navigation, so a full page load costs nothing.',
    ]),
    p('The last point is the one that decides it more often than bundle size. If moving between pages does not need to preserve anything — a half-filled form, an open panel, a websocket, a media player — then the client-side router earns nothing and you are paying for it in every byte.'),

    p('There is a second-order benefit that rarely appears in comparisons: a site with no client runtime has far fewer ways to break. No hydration mismatch, no effect running twice, no state desynchronised from the URL. The page you rendered is the page the reader gets, and the class of bugs that comes from re-running your UI on the client simply does not exist.'),

    h3('Islands are the escape hatch, and they are enough'),
    p('Astro renders a React, Vue or Svelte component to HTML and hydrates only the ones you mark. A search box, a filter, a modal — each is an island with its own runtime, and the rest of the page stays static.'),
    code('astro', `
---
import Filter from '../components/Filter.tsx';
---
<Filter client:visible />   <!-- hydrates when it scrolls into view -->
<article set:html={content} />  <!-- never hydrates -->
`),
    p('`client:visible` rather than `client:load` is the habit worth forming: below-the-fold interactivity does not need to be ready before it is on screen, and deferring it moves work out of the critical path for free.'),

    h2('When is Next.js obviously right?'),
    p('When the page is a surface for doing things, and the things share state.'),
    ul([
      '**Dashboards and admin tools.** Filters, tables, drawers, live data. Every one of those is a stateful component and there are dozens of them.',
      '**Anything behind a login** where the session shapes the whole page and navigation should not reload the app shell.',
      '**Products with real-time or streaming UI** — a chat, a feed, an AI response arriving token by token.',
      '**Teams already fluent in React** who will build faster in one mental model than two.',
    ]),
    p('The last one is not a technical argument and it is frequently the strongest one available. A framework the team knows produces working software sooner than the theoretically better one they are learning.'),

    p('It is also worth being clear that "application" is not a size claim. A five-page internal tool with a login and a table is an application; a two-hundred-page documentation site is not. The number of routes tells you nothing about which model fits — what the routes *do* tells you everything.'),

    h3('Server components change the calculus'),
    p('The App Router lets most of a Next.js page render on the server with no client JavaScript, which narrows the gap considerably. A well-built server-component page ships a fraction of what a pages-router equivalent did.'),
    p('It narrows the gap; it does not close it. The React runtime is still there for the client components you do use, and the discipline required to keep a Next.js page light is real work — whereas in Astro, light is the default and heaviness is opt-in. Defaults decide what a codebase looks like after a year of people being busy.'),
    img('two-shapes', 'A page composed mostly of static regions with small active zones, beside one that is active throughout', 'Documents with islands, or an application with pages. Most projects are clearly one.'),

    h2('What does the wrong choice actually cost?'),
    p('Different things in each direction, and one of them is much worse.'),
    table('Getting it wrong, both ways', [
      ['Wrong choice', 'What it costs', 'Recoverable?'],
      ['Astro for an application', 'Fighting the model — state across pages, shared layouts, client routing', 'Painful; a rewrite of the interactive core'],
      ['Next.js for a content site', 'A heavier bundle and more configuration than needed', 'Yes — it still works, it is just not optimal'],
    ]),
    p('The asymmetry matters. Next.js on a marketing site is a mild inefficiency; Astro on a stateful application is a structural fight you keep losing. When genuinely unsure, that asymmetry is an argument for Next.js — the failure mode is cheaper.'),
    p('It is worth separating the two directions clearly, because people treat them as symmetric and they are not. Over-provisioning costs bytes; under-provisioning costs architecture. Bytes can be optimized later by someone with an afternoon. Architecture is optimized later by someone with a quarter.'),
    p('Where I have changed my mind: I used to reach for Astro on anything content-shaped. Now I check whether the content site will grow an account area, a dashboard, or anything with a session. If that is on the roadmap rather than hypothetical, starting in Next.js avoids a migration that always arrives at a bad moment.'),

    h2('What does each get wrong in practice?'),
    p('Every framework has a failure mode its own documentation is quiet about. Knowing them is worth more than another benchmark.'),

    h3('Astro: the island that should have been a page'),
    p('The temptation is to solve a growing interactive need by making the island bigger. One `client:load` component becomes the whole page, holding its own state and routing internally — at which point you have a single-page application inside a static site, with none of the framework support a real one would have. When an island starts wanting a router, it is telling you something.'),

    h3('Astro: content collections outgrowing the filesystem'),
    p('Markdown files are excellent until somebody who does not use git needs to edit them. Moving to a CMS later is straightforward for the data and annoying for everything that assumed a synchronous filesystem read. If a non-developer will ever edit the content, wire the CMS on day one.'),

    h3('Next.js: the accidental client component'),
    p('One `useState` at the top of a component marks it and everything it renders as client code. A layout that acquires a hook drags the whole tree into the bundle, and nothing warns you — the page still works, it is just heavier every week. Watching bundle size in CI is the only reliable defence.'),

    h3('Next.js: caching that surprises you'),
    p('Fetch caching, route segment config and revalidation are powerful and genuinely confusing, and the common failure is stale content in production that nobody can reproduce locally because the dev server caches differently. Whatever your policy, make it explicit per route rather than inherited.'),
    img('failure-modes', 'Two systems each with a characteristic stress point marked', 'Each framework has a way of going wrong quietly. Knowing which one you are exposed to beats another benchmark.'),

    h2('Can you use both?'),
    p('Yes, and on larger projects it is often correct — but as two deployments, not one hybrid.'),
    p('Marketing and docs on Astro at the apex, the application on Next.js at `app.` — each optimal for its job, each deployed independently. The cost is a shared design system and two pipelines to keep alive.'),

    h3('Where this pays'),
    p('When marketing changes weekly and the app changes daily, coupling them means every copy tweak redeploys the application. Separating them means a content edit is a static rebuild that cannot break a login.'),

    p('It also pays when the two have genuinely different risk profiles — marketing edited by several people under time pressure, the application changed carefully behind review.'),

    h3('Where it does not'),
    p('On a small project, two deployments is two of everything — two CI configs, two sets of environment variables, two places to look during an incident — for a site whose marketing pages number about six. Keep it in one until the split solves a problem you actually have.'),

    img('decision-tree', 'A short sequence of questions resolving to one of two outcomes', 'Two questions settle most projects. The rest is tie-breaking.'),

    h2('What about the ecosystem?'),
    p('This is the practical difference nobody mentions in framework comparisons and it decides more projects than performance does.'),
    p('Next.js has more of everything: auth libraries with first-class support, deployment adapters, examples, and answers to whatever you are stuck on at 1am. Astro is smaller and the gaps show at the edges — a niche integration you would have found ready-made elsewhere is something you write.'),
    p('Astro does render React, Vue, Svelte and Solid components, so a component library is usually usable. What is less portable is anything assuming a client-side router, a React context spanning pages, or a framework-specific data layer — those assume the model Astro deliberately does not have.'),
    img('ecosystem', 'Two toolsets of different breadth serving overlapping needs', 'The gaps show at the edges, and the edges are where deadlines are lost.'),

    h2('How do you actually decide?'),
    p('Four questions, in order. The first two settle most projects.'),
    ol([
      '**Does state need to survive navigation?** A cart, a session-heavy UI, an open editor, a playing media element. Yes means Next.js.',
      '**What proportion of the page is interactive?** Mostly read means Astro. Mostly operated means Next.js.',
      '**Is there an account area now or on the roadmap?** If yes and it is real rather than aspirational, start where it will end up.',
      '**What does the team know?** All else close, the familiar one ships sooner and is maintained better.',
    ]),
    p('What should not decide it: a bundle-size comparison on someone else\'s benchmark. Both frameworks can produce a fast page and both can produce a slow one; the deciding factor is which one makes the fast version the default for *your* page shape.'),

    h2('What does this site use, and why?'),
    p('Astro, static output, one client script — and it is the right call for a specific reason rather than a general one.'),
    p('Every page here is read. The interactive parts are a project filter, a modal, a scroll-driven mascot and a résumé PDF generator, and each is a small piece of vanilla TypeScript rather than a component tree. There is no session, no cart, nothing to preserve across a navigation. A React runtime would render text.'),
    p('The honest counterweight: the CMS is Sanity, whose Studio is React, so React is installed anyway and builds with the site. That is roughly twelve seconds of build time for a route most visitors never see — a real cost, accepted deliberately because [keeping the Studio embedded](/blog/project-stack-templates) is worth more than the seconds.'),
    p('And a limit worth naming: if this site grew a client portal, I would not build it here. It would be a Next.js application on a subdomain, sharing tokens and nothing else — which is the two-deployment split above, arrived at honestly rather than by trying to make one tool do both.'),
    quote('The framework question is really a question about your pages. Answer that one and the other answers itself.'),

    h2('What does migrating between them involve?'),
    p('Less than a rewrite, more than a weekend, and the effort is almost entirely in the parts that were never framework-specific.'),

    h3('Astro to Next.js'),
    p('The usual trigger is an account area. Layouts and pages port with mechanical edits, and React components used as islands move over almost unchanged. What takes the time is everything that assumed a build step: filesystem reads, content collections, and any place the site relied on being fully static.'),

    h3('Next.js to Astro'),
    p('Rarer, and it is really a rewrite of the interactive layer. Server components map onto Astro components reasonably; client components with shared context do not, because the context that spanned pages has nowhere to live. Budget for redesigning that state, not porting it.'),

    h3('What ports for free either way'),
    p('Design tokens, CSS, content models, schema helpers, the data-fetching layer and every accessibility decision. On this site that is the large majority of the code by volume — which is the practical reason to spend your care there rather than on the framework debate.'),
    img('migration', 'Two systems with a broad shared foundation and narrow differing tops', 'The layer that ports is bigger than the layer that does not. That is where the care belongs.'),

    h2('What is the same either way?'),
    p('More than the comparison suggests, and it is where the actual quality of a site is decided.'),

    h3('Images, fonts and third-party scripts'),
    p('Both frameworks will happily ship a 2MB hero image, a render-blocking font from a CDN and four analytics tags. Neither protects you from the things that actually make pages slow, and those are the same problems in both.'),

    h3('Accessibility'),
    p('None of it is free in either framework, and all of it is cheap if you decide it once in your tokens.'),
    p('Contrast, focus order, touch targets, motion preferences — no framework gives you any of it. [Contrast in particular](/blog/wcag-contrast-audit) is a decision in your tokens, not in your build tool.'),

    h3('The content model'),
    p('Whether a heading carries a stable id, whether a category exists in one place or three, whether an editor can leave a required field blank and quietly break a page — none of that is a framework concern, and all of it decides whether the site still works in a year. Those decisions cost the same and pay the same in either tool.'),

    h3('The data layer'),
    p('Whether content comes from a CMS, a database or files, the fetch-and-fallback discipline is identical. A loader that degrades gracefully when the CMS is empty is the same code in both.'),
    p('This is why I am reluctant to spend long on the comparison: the framework is perhaps a fifth of what determines whether the result is good. The tokens, the content model and the discipline around images matter more, and they transfer.'),

    h2('Conclusion'),
    p('Decide by page shape, not by benchmark. Documents that occasionally do something are Astro\'s case; applications that happen to have pages are Next.js\'s. The two frameworks are optimizing for different problems and both are good at theirs.'),
    p('The single most useful test is whether state has to survive a navigation. A cart, a session-shaped UI, an open editor, a playing video — any of those and the client-side router earns its cost. None of them and you are paying for something the page never uses.'),
    p('Respect the asymmetry when unsure. Next.js on a content site is a mild inefficiency you can live with; Astro on a stateful application is a structural fight that ends in rewriting the interactive core. The cheaper mistake is the safer default.'),
    p('If you use both, run them as two deployments with a shared design system rather than one hybrid — and only once the split solves a problem you have, because it is two of every pipeline until then.'),
    p('And keep the choice in proportion. Images, fonts, third-party scripts, contrast and the content model decide more about the finished site than the framework does, and all of them transfer. If you are at the start of a build and want the decision talked through against what you are actually making, [that is a short conversation](/start).'),
  ),
  faqs: faq([
    ['Is Astro faster than Next.js?',
     'On a content page, by default, yes — it ships no JavaScript unless you ask for it. A well-built Next.js page using server components can get very close. The difference that lasts is which behaviour is the default, because defaults decide what a codebase looks like after a year.'],
    ['When should you not use Astro?',
     'When state has to survive navigation — a cart, a session-shaped interface, an open editor, a playing media element — or when most of the page is interactive rather than read. Astro on a stateful application is a structural fight; Next.js on a content site is only a mild inefficiency.'],
    ['Can you use React components in Astro?',
     'Yes, along with Vue, Svelte and Solid, rendered to HTML and hydrated only where you mark them. What does not port is anything assuming a client-side router, React context spanning pages, or a framework-specific data layer — those assume a model Astro deliberately lacks.'],
    ['Should marketing and app be separate deployments?',
     'On larger projects, usually. Marketing on Astro and the app on Next.js means a copy change cannot break a login, and each is optimal for its job. On a small project it is two CI configs and two sets of secrets for six pages — wait until the split solves a real problem.'],
  ]),
};
