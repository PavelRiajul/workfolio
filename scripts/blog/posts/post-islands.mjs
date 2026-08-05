import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/astro-islands/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-astro-islands',
  slug: 'astro-islands',
  title: 'Astro Islands: Shipping Interactivity Without Shipping a Framework',
  category: 'frontend',
  order: 62,
  readTime: '12 min read',
  date: 'March 2026',
  publishedAt: '2026-03-15',
  series: 'Foundations',
  excerpt:
    'Which client directive to use and when, the state problem nobody mentions, and why most islands turn out not to need a framework at all.',
  coverLabel: 'Astro islands — cover',
  body: body(
    p('The islands pitch is simple: render everything to HTML, hydrate only the bits that need to be interactive. What the pitch leaves out is that the interesting decisions all come after you agree with it.'),
    p('Which directive does this component need? What happens when two islands need to know about each other? And — the one that saves the most bytes — does this island need a framework at all, or is it forty lines of vanilla TypeScript wearing a React costume?'),
    p('This is what I have settled on after building this site as [static Astro](/blog/astro-vs-nextjs) with a handful of genuinely interactive pieces.'),

    h2('What is an island, mechanically?'),
    p('A component that Astro renders to HTML at build time, plus a small script that mounts the framework at runtime and takes over that subtree. Everything outside it stays inert markup.'),
    p('The important consequence is that each island carries its own cost. Two React islands share the React runtime, but each still costs its own component code and its own mount. Islands are cheap individually and not free collectively.'),
    code('astro', `
---
import Filter from '../components/Filter.tsx';   // React
import Chart from '../components/Chart.svelte';  // Svelte, same page
---
<Filter client:visible />
<Chart client:idle />
<article set:html={content} />   <!-- no JS at all -->
`),
    p('Mixing frameworks on one page works and is occasionally useful when reusing an existing component, but each framework you introduce is a separate runtime in the bundle. Doing it because you can is how a static site ends up shipping both React and Vue to render two widgets.'),
    img('island-anatomy', 'A largely inert surface with a few discrete active regions, each carrying its own small payload', 'Each island brings its own cost. Cheap individually, not free collectively.'),

    h2('Which client directive should you use?'),
    p('Five options, and picking by habit rather than by position on the page is where most of the waste comes from.'),
    table('The directives, and when each is right', [
      ['Directive', 'Hydrates', 'Use for'],
      ['client:load', 'Immediately', 'Above the fold and needed instantly'],
      ['client:idle', 'When the browser is idle', 'Visible but not urgent'],
      ['client:visible', 'When scrolled into view', 'Anything below the fold'],
      ['client:media', 'When a media query matches', 'Interactivity that only exists at one size'],
      ['client:only', 'Client-side, no SSR', 'Components that cannot render on the server'],
    ]),
    p('`client:visible` is the right default for most things. A filter halfway down a page does not need to be interactive before the reader has scrolled to it, and deferring it moves work out of the critical path at no cost to the experience.'),

    h3('client:load is a claim you should be able to defend'),
    p('It says this must work before anything else finishes. That is true of a search box in a header and rarely true of anything else. Every `client:load` competes with the first paint for the same main thread.'),

    h3('client:idle is the middle setting people skip'),
    p('It waits for the browser to finish the work it already has, then mounts — so the component is ready well before anyone interacts with it, without competing with the first paint. For anything visible on load but not the first thing touched, it is usually a better answer than `client:load` and people forget it exists.'),

    h3('client:media is the one people forget'),
    p('A mobile-only drawer or a desktop-only hover behaviour can be scoped to the breakpoint that needs it, so half your visitors never download it. On a site where mobile is [the priority traffic](/blog/mobile-hero-viewport), that is a meaningful saving on exactly the devices that can least afford it.'),

    h3('client:only is a last resort with a real cost'),
    p('It skips server rendering entirely, so that region is empty HTML until JavaScript runs — bad for the first paint, invisible to a crawler, and a layout shift when it appears. Use it for components that genuinely cannot render without a browser API, and reserve space for them so the shift does not move anything else.'),
    img('directive-timing', 'Several activation moments plotted along a page-load sequence', 'Pick by where the component sits, not by habit. Most of the waste is client:load on things nobody has scrolled to.'),

    h2('Do you even need a framework for this island?'),
    p('This is the question that saves the most and gets asked the least.'),
    p('A framework earns its runtime when there is state driving a non-trivial render — a list that filters, a form with validation, a tree that expands. It does not earn it for toggling a class, opening a dialog, or wiring a scroll listener.'),
    code('ts', `
// The entire "island". No runtime, no hydration, no bundle entry.
document.querySelectorAll<HTMLElement>('[data-accordion] summary').forEach((s) => {
  s.addEventListener('click', () => { /* ... */ });
});
`),
    p('On this site every interactive piece — the project filter, the case-study modal, the blog category chips, the résumé PDF generator, the scroll-driven mascot — is plain TypeScript in one module, guarded by element presence so it is safe on every route. There is no framework island at all, and the whole file is smaller than a React runtime.'),

    img('framework-or-not', 'A small mechanism beside a much larger one, both producing the same visible result', 'A runtime is earned by state driving a render. Toggling a class is not that.'),

    h3('The honest counterweight'),
    p('Vanilla stops scaling at exactly the point people claim it does not. Once you are manually diffing a list, tracking which nodes changed, or keeping two representations of the same state in sync, you are writing a worse framework and you should use the real one. The signal is not line count — it is whether you have started re-rendering from state by hand.'),

    p('There is also a maintenance argument that cuts the other way and deserves saying. A React component is a shape every front-end developer recognises; a bespoke module of event listeners is a shape only its author knows. On a team, the framework version may be the cheaper one to own even when it is the heavier one to ship, and that is a legitimate reason to choose it.'),

    h3('And a middle ground worth knowing'),
    p('`<template>` plus a small render function covers a surprising amount: a list that redraws entirely from an array is trivial to write, fast enough at real sizes, and needs no dependency. It stops being viable when redrawing loses focus, scroll position or an in-progress input — which is precisely when a framework starts paying for itself.'),

    h2('How do two islands talk to each other?'),
    p('They do not, directly, and this is the constraint that catches people out.'),
    p('Each island is its own root. Two React islands on the same page do not share context, do not share a store instance unless you build one outside them, and cannot see each other\'s state. Coming from a single-page application, this is the first thing that feels broken and is actually the point.'),
    ol([
      '**Do not split it.** If two regions genuinely share state, they were one component. Wrap them in a single island rather than two.',
      '**Lift the state outside the framework.** A nanostore, a signal, or a plain module holding a value — imported by both islands, owned by neither.',
      '**Use the DOM as the channel.** Custom events on `document` are perfectly good for coarse signals and cost nothing.',
    ]),
    code('ts', `
// A module both islands import. Framework-agnostic, survives either
// island unmounting, and readable by a vanilla script too.
export const filter = atom<string>('all');
`),
    p('Whichever you pick, put the shared value somewhere that does not belong to either island. A store owned by one of them means the other breaks when the first is not on the page — and on a multi-page site, "not on the page" is the normal case rather than an edge one.'),
    p('The first option is the one to reach for. Two islands that need to stay in sync are usually one island drawn with a line through it, and merging them removes the coordination problem instead of solving it.'),
    img('island-isolation', 'Separate active regions with no direct connection, and a shared value held outside both', 'Islands cannot see each other. Either merge them or put the shared value outside both.'),

    h2('What breaks that nobody warns you about?'),
    p('Four things, all of them the consequence of the page being mostly static.'),

    h3('Scripts run once, and navigation is a full load'),
    p('This is the assumption most single-page-app habits quietly depend on.'),
    p('There is no client router by default, so every navigation is a fresh document and your scripts run again from scratch. That is simpler than it sounds — no cleanup, no stale listeners — but it means anything expensive at startup pays on every page.'),

    h3('View transitions change that, and re-break it'),
    p('Turn on Astro\'s view transitions and navigation stops reloading the document, which means scripts do *not* re-run and listeners bound to replaced nodes are lost. Anything set up on `DOMContentLoaded` needs to also handle `astro:page-load`, and this is the single most common bug when the feature is added to an existing site.'),

    h3('Props are serialized'),
    p('The failure is quiet rather than loud: nothing throws, the value simply arrives as something else.'),
    p('Whatever you pass to an island crosses a JSON boundary. Functions, class instances and dates come out the other side wrong or not at all. Pass primitives and plain objects, and construct the rest inside the island.'),

    h3('Styles are scoped, and islands are not exempt'),
    p('An Astro component\'s styles are scoped to it, which is usually what you want and occasionally not: a framework island rendering its own markup will not receive the parent page\'s scoped rules. Either style the island from inside itself or reach for `:global()` deliberately — this is where a stray unstyled component usually comes from on an otherwise tidy page.'),

    h3('Large props are shipped twice'),
    p('An island rendered on the server and hydrated on the client receives its props twice — once as HTML, once as JSON embedded in the page. Passing a large content array to an island doubles it in the payload. Pass an id and fetch, or render the content outside the island entirely.'),

    h2('How do you pass server data into an island?'),
    p('Deliberately, and with an eye on what that data costs when it crosses the boundary.'),
    table('Three ways in, three sets of trade-offs', [
      ['Approach', 'Cost', 'Right when'],
      ['Props from the Astro page', 'Serialized twice into the payload', 'Small, needed at first paint'],
      ['Fetch inside the island', 'A round trip, and a loading state', 'Large, or personal to the visitor'],
      ['Rendered as HTML outside the island', 'Nothing', 'Read-only content the island only frames'],
    ]),
    p('The third row is the one that gets overlooked. A list that is filtered client-side does not need the list as props — Astro can render every row as static HTML and the island can hide and show them. The data never crosses the boundary at all, the content is in the markup for crawlers, and the payload is one array smaller.'),

    h3('Personal data does not belong in props'),
    p('On a static build, anything passed as a prop is baked into the HTML for everyone. That is fine for a product catalog and wrong for anything scoped to a visitor. Session-shaped data has to be fetched at runtime, which is a good early signal that the page may want to be [an application rather than a document](/blog/astro-vs-nextjs).'),

    h3('Give the island a loading state you actually designed'),
    p('If the island fetches, there is a moment before the data arrives, and on a slow connection that moment is long. Reserve the space so nothing shifts, and show something honest — the alternative is a page that visibly assembles itself.'),
    img('data-paths', 'Three routes for information reaching an interactive region, one bypassing it entirely', 'The cheapest path is the one where the data never enters the island — rendered as markup and only framed by it.'),

    h2('How do you keep islands from multiplying?'),
    p('With a rule you apply at review time, because they accumulate one reasonable decision at a time.'),
    ul([
      '**Every island needs a sentence justifying its directive.** "This is above the fold and needed immediately" or "this is below the fold" — if neither is true, the directive is wrong.',
      '**Watch the bundle in CI.** A budget that fails a pull request is the only thing that reliably stops drift, and it is [the same argument as any other gate](/blog/ci-pipeline-typecheck-tests).',
      '**Re-ask the framework question when an island shrinks.** Components lose complexity as often as they gain it, and one that ended up as two event listeners should stop being an island.',
      '**Count them.** A static site with eleven islands has stopped being a static site and should be honest about it.',
    ]),
    p('The last one is a genuine decision point rather than a scolding. If a page keeps growing interactivity, the answer at some stage is a framework page, not more islands — and noticing that early is cheaper than discovering it during a rewrite.'),
    img('island-drift', 'A surface accumulating more and more active regions until little of it is inert', 'Islands accumulate one reasonable decision at a time. A count is the cheapest way to notice.'),

    h2('How do you test them?'),
    p('Separately from the page, and then the one thing that only fails in the page.'),

    h3('The component in isolation'),
    p('An island is an ordinary framework component, so it tests like one — render it, drive it, assert on output. Nothing about Astro changes this, and it is where the logic should be covered.'),

    p('There is no framework-specific harness to set up here, which is one of the quieter benefits of the model: an island is a component, not a page, so nothing about testing it requires knowing it will be embedded in static HTML.'),

    h3('The page with JavaScript disabled'),
    p('This is the check unique to islands and it is worth doing manually once per interactive page. What renders? Is the content still there? Does a `client:only` region leave a hole? A content site should be readable with scripts off — if it is not, the island is doing something that belonged in the markup.'),

    h3('The hydration boundary'),
    p('This is also the cheapest place to catch a directive chosen badly, since a component that never hydrates fails the test immediately.'),
    p('The bug islands actually produce is a mismatch between what the server rendered and what the client mounts — usually because the component reads something only available in a browser. A single end-to-end test per island that loads the page and interacts once catches it, and catches the serialization problems above at the same time.'),
    quote('The best island is the one you did not need. The second best is the one that hydrates when the reader can see it.'),

    h2('What does this look like in practice?'),
    p('On this site: zero framework islands, one module of vanilla TypeScript, and every feature guarded by element presence so the same file is safe on all 65 routes.'),
    p('The mascot is the piece that best makes the case. It is an autonomous animated SVG with pose states, a roam loop and physics-shaped jumps — comfortably the most complex interactive thing on the site — and it is a scoped `<style>` block plus the Web Animations API. A framework would have added a runtime and removed nothing, because none of it is state driving a render.'),
    p('That is not a general recommendation — it is what a site with no shared state and no forms beyond a contact page earns. A documentation site with a live search, a store with a cart, or a marketing site with a configurator would all justify real islands, and I would use them.'),
    p('The rule I actually apply: start with no island, add vanilla when something needs to move, and reach for a framework the moment you catch yourself re-rendering from state by hand. Most things stop at step two, which is the useful finding rather than a purity argument — and it is the same instinct as [choosing the simpler tool](/blog/project-stack-templates) everywhere else in the stack.'),

    h2('Conclusion'),
    p('Default to `client:visible`. Reserve `client:load` for things that must work before the page finishes, use `client:media` to skip shipping an island to half your visitors, and treat `client:only` as a last resort with a real first-paint and crawler cost.'),
    p('Ask whether the island needs a framework at all before you write it. State driving a non-trivial render earns a runtime; toggling a class does not. The signal that you have outgrown vanilla is not line count — it is catching yourself re-rendering from state by hand.'),
    p('Remember that islands cannot see each other. If two need to stay in sync, they were probably one component; if they genuinely are not, put the shared value in a plain module outside both rather than reaching for framework context that does not span roots.'),
    p('Watch for the four sharp edges: props cross a JSON boundary, large props ship twice, scripts re-run on every navigation until view transitions stop them, and `astro:page-load` is what you need once they do.'),
    p('Then keep a count and a bundle budget in CI, because islands accumulate one defensible decision at a time and nobody notices the eleventh. If a page keeps growing interactivity, the honest answer eventually is a framework page rather than more islands — and spotting that early is much cheaper than finding it mid-rewrite. If you want a second opinion on where that line falls for something you are building, [get in touch](/start).'),
  ),
  faqs: faq([
    ['Which Astro client directive should I use by default?',
     'client:visible for most components. Anything below the fold does not need to be interactive before the reader scrolls to it, and deferring moves work off the critical path at no cost. Reserve client:load for things that must work before the page finishes rendering.'],
    ['Can two Astro islands share state?',
     'Not directly — each is its own root with no shared context. Either merge them into one island, which is usually the right answer, or lift the value into a plain module or store that both import and neither owns. Custom DOM events work for coarse signals.'],
    ['Do islands need a framework?',
     'Often not. A framework earns its runtime when state drives a non-trivial render; it does not for toggling a class or wiring a scroll listener. The signal that you have outgrown plain TypeScript is catching yourself re-rendering from state by hand, not the number of lines.'],
    ['Why do my scripts stop working after enabling view transitions?',
     'Navigation no longer reloads the document, so anything bound on DOMContentLoaded never runs again and listeners on replaced nodes are lost. Handle astro:page-load as well. This is the most common bug when view transitions are added to an existing site.'],
  ]),
};
