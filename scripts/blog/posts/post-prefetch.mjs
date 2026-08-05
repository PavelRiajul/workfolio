import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/prefetch-on-hover/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-prefetch-on-hover',
  slug: 'prefetch-on-hover',
  title: 'Prefetch on Hover: Navigation That Feels Instant',
  category: 'performance',
  order: 85,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-09',
  series: 'Foundations',
  excerpt:
    'A pointer arrives at a link about 200ms before the click. That gap is enough to load the next page — if you spend it carefully and not on everything.',
  coverLabel: 'Prefetch on hover — cover',
  body: body(
    p('There is a gap of roughly 200 milliseconds between a pointer arriving at a link and the button going down. On touch, the gap between `touchstart` and `click` is around 90. Neither is long, but both are free, and a page that starts loading in that window arrives before the user has finished deciding they wanted it.'),
    p('This is the cheapest perceived-performance win available on a multi-page site, and unlike most of the work in this category it does not require making anything smaller. It requires spending idle time and network on the right guesses.'),
    p('The catch, and the reason this post is longer than the technique deserves, is that prefetching everything is worse than prefetching nothing. Below is how I decide what to prefetch, when, and how to keep it from quietly costing more than it saves.'),

    h2('Why does hover work as a signal?'),
    p('Because pointing at something is a decision that precedes acting on it, and the delay between the two is remarkably consistent.'),
    p('Measurements of this vary by study and by interface, but the range people quote — 150 to 300 milliseconds between hover and click — matches what you see in a session recording. On a fast connection that window is enough to fetch a whole HTML document and often its critical assets. The navigation then resolves from cache and the page appears with no visible load at all.'),
    table('Signals and how much time each buys', [
      ['Signal', 'Lead time', 'Precision'],
      ['In viewport', 'Seconds', 'Low — most links are never clicked'],
      ['Pointer within 100px', '~400ms', 'Moderate'],
      ['Hover or focus', '150–300ms', 'Good'],
      ['touchstart / pointerdown', '~90ms', 'Very high'],
      ['mousedown', '~50ms', 'Near certain'],
    ]),
    p('Read that table as a trade rather than a ranking. Viewport-based prefetching buys the most time and wastes the most bandwidth; `mousedown` wastes almost nothing and buys almost nothing. Hover sits at the point where both numbers are acceptable, which is why it is the default in most frameworks that have one.'),

    h3('Focus covers the people hover does not'),
    p('Keyboard users never hover, and a prefetch strategy bound only to pointer events silently excludes them. Binding to `focus` alongside `pointerenter` costs one extra line and means tabbing through a nav gets the same benefit — the same reasoning behind every other [keyboard-parity requirement](/blog/accessible-forms).'),

    h3('Touch needs its own answer'),
    p('There is no hover on a phone. `touchstart` fires around 90ms before `click`, which is less useful but not nothing — it covers the network setup at least. For touch the more effective strategy is usually viewport-based, because a link the user has scrolled to is a link they may be reading.'),
    img('hover-gap', 'A short interval between a pointer arriving at a target and the press that follows', 'Roughly 200ms between hover and click, and about 90 between touchstart and click. Both are free and both are enough to matter.'),

    h2('What should you actually prefetch?'),
    p('The document, and only the document, for most sites.'),
    p('An HTML page is typically 15–50KB compressed. Its CSS and JavaScript are usually already cached from the current page, because they are shared. So prefetching the document alone captures most of the benefit at a fraction of the cost, and it is what the browser-native mechanisms do by default.'),

    h3('For a client-rendered app, prefetch the route chunk'),
    p('On a single-page application there is no document to fetch — the navigation is a JavaScript route transition, and what it needs is the code chunk and often the data. Frameworks that ship a link component do both, and the equivalent for a hand-rolled router is a dynamic import fired on hover, exactly [as with any deferred module](/blog/lazy-load-heavy-libraries).'),

    h3('Data is the harder half'),
    p('Prefetching the code but not the data means the page appears instantly and then shows a spinner, which is arguably worse than a slightly slower navigation — it moves the wait to a more visible place. If the destination is data-driven, prefetch the query too, or do not bother.'),

    h3('Do not prefetch images'),
    p('The temptation is to warm the destination hero, and it is almost always a mistake. Images are the largest thing on the page and the least likely to be needed, so a wrong guess is expensive in exactly the way [image weight is always expensive](/blog/image-optimization-strategy). Let the destination request its own.'),

    h2('How do you implement it?'),
    p('Three options, and the right one depends on whether your framework already has an opinion.'),

    h3('The framework already does this'),
    p('Astro has `prefetch` with a `hover` default and a `prefetchAll` option. Next.js prefetches `Link` components in the viewport. If you are on either, the work is configuration rather than code, and the useful question is whether the default strategy matches your traffic.'),
    code('js', `
// astro.config.mjs — hover is the sensible default.
export default defineConfig({
  prefetch: {
    prefetchAll: false,          // opt in per link, not everywhere
    defaultStrategy: 'hover',
  },
});
`),
    code('html', `
<!-- Opt a specific link in, or upgrade its strategy. -->
<a href="/work" data-astro-prefetch>Work</a>
<a href="/start" data-astro-prefetch="viewport">Start a project</a>
`),

    h3('Speculation Rules, where it is supported'),
    p('The Speculation Rules API is the browser-native version and it goes further than prefetch: it can prerender the destination, meaning the page is fully constructed in the background and the navigation is genuinely instant. It is declarative, it respects the user\'s data preferences, and where it is unsupported it is ignored.'),
    code('html', `
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/work/*" },
    "eagerness": "moderate"
  }],
  "prefetch": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
`),
    p('`eagerness` is the whole control surface: `conservative` waits for pointer-down, `moderate` fires on hover, and `eager` fires as soon as the rule matches. Start at moderate and only go higher for a link you are confident about.'),

    h3('Or roughly fifteen lines of your own'),
    p('If neither applies, the manual version is short. Bind to `pointerenter` and `focus`, insert a `<link rel="prefetch">`, and keep a set so each URL is only requested once.'),
    code('ts', `
const seen = new Set<string>();

function prefetch(href: string) {
  if (seen.has(href)) return;
  seen.add(href);
  const l = document.createElement('link');
  l.rel = 'prefetch';
  l.href = href;
  document.head.append(l);
}

document.addEventListener('pointerenter', (e) => {
  const a = (e.target as Element)?.closest?.('a[href^="/"]');
  if (a) prefetch(a.getAttribute('href')!);
}, { capture: true, passive: true });

document.addEventListener('focusin', (e) => {
  const a = (e.target as Element)?.closest?.('a[href^="/"]');
  if (a) prefetch(a.getAttribute('href')!);
});
`),
    p('Delegated listeners on the document rather than one per link, because a nav with forty links should not mean forty listeners, and links added later work without rebinding.'),
    img('three-implementations', 'The same behaviour expressed as configuration, as a declarative rule, and as a short handler', 'Configuration if the framework has an opinion, Speculation Rules where supported, fifteen lines otherwise.'),

    h2('When does prefetching make things worse?'),
    p('When the guesses are wrong often enough that the wasted bandwidth competes with the current page.'),
    p('Every prefetch is a request. On a page with sixty links, a viewport-based strategy fires sixty requests for pages the user will mostly never see — and those requests share connections and bandwidth with the assets the current page still needs. On a fast connection this is invisible. On a metered mobile connection it is somebody\'s data allowance.'),

    h3('The hit rate is the number that matters'),
    p('A prefetch strategy is worth it when a meaningful share of prefetched pages get visited. Hover typically lands well above half; viewport on a long listing page can be under five percent. Both are defensible, but only one of them is defensible on a phone.'),

    h3('Respect Save-Data and reduced data preferences'),
    p('The `Save-Data` header and `navigator.connection.saveData` exist precisely for this, and honouring them is a one-line guard. Speculation Rules do it automatically; a hand-rolled implementation must be told.'),
    code('ts', `
const conn = (navigator as any).connection;
const frugal = conn?.saveData || /2g/.test(conn?.effectiveType ?? '');
if (!frugal) enablePrefetching();
`),

    h3('Do not prefetch anything with a side effect'),
    p('A `GET` that mutates state — a logout link, a one-click unsubscribe, an "approve" URL in an email — will be triggered by prefetching, by a link scanner, or by a mail client. This is not a new problem and prefetching makes it visible. If a URL changes something, it should not be reachable by `GET`, which is a [REST design rule](/blog/rest-api-design) before it is a performance one.'),
    img('wasted-requests', 'Many speculative requests issued for destinations that are never visited', 'Viewport prefetching on a long listing page can hit under five percent. On a metered connection that is somebody’s data allowance.'),

    h2('What about prerendering?'),
    p('It is the same idea taken to its conclusion, and it is dramatically more effective and dramatically more expensive.'),
    p('A prefetch stores bytes. A prerender builds the whole page in a hidden tab: HTML parsed, CSS applied, JavaScript executed, layout done. Activating it is close to instantaneous because there is nothing left to do. The cost is a full page render — memory and CPU — for a page that may never be shown.'),

    h3('Reserve it for high-confidence destinations'),
    p('One or two links per page at most: the primary call to action, the next step in a funnel, the first result on a search page. Prerendering an entire nav is how you get a memory complaint from a user with fourteen tabs open.'),

    h3('Analytics will double-count it'),
    p('A prerendered page runs its scripts, so analytics may record a view for a page nobody saw. The Page Visibility API and the `prerenderingchange` event exist to handle this, and any tag that fires on load needs to be aware of it — one more thing to check when you [audit what the third parties are doing](/blog/third-party-script-cost).'),

    h3('Test it deliberately'),
    p('A prerendered page starts hidden and becomes visible later, which is an execution order most code has never seen. Animations that assume they start visible, measurements taken at load, and anything using `IntersectionObserver` on a hidden document can all behave oddly. It is worth a pass before shipping.'),

    img('prerender-cost', 'A destination fully constructed in the background while the current page is still in view', 'A prerender parses, styles and executes the whole destination. Activation is instant; the cost is a full render that may never be shown.'),

    h2('What about going back?'),
    p('The back button should already be instant, and if it is not, the cause is usually something you did rather than something you failed to add.'),
    p('Every modern browser has a back/forward cache that stores the entire page — DOM, JavaScript heap and scroll position — when the user navigates away, and restores it in a few milliseconds when they come back. No prefetching strategy competes with that, and it covers a meaningful share of navigations on any site with a listing page.'),

    h3('Things that disqualify a page'),
    p('An `unload` listener disqualifies the page outright in most browsers, and it is the single most common cause. An open WebSocket or an in-flight fetch can too, as can a `Cache-Control: no-store` header on the document. DevTools reports the reason directly, which makes this a five-minute check rather than an investigation.'),

    h3('Use pagehide, not unload'),
    p('The replacement for `unload` is `pagehide` together with the Page Visibility API, and it is strictly better — `unload` is unreliable on mobile anyway, so code depending on it was already losing events. This is the same reason [analytics beacons fire on visibility change](/blog/field-vs-lab-data) rather than at unload.'),

    h3('Restore is not load'),
    p('A restored page does not fire `DOMContentLoaded` or `load` again, so anything that must run per view needs to listen for `pageshow` and check the `persisted` flag. Getting this wrong produces a page that looks correct and is showing stale data, which is a worse failure than a slow one.'),
    img('bfcache', 'A previous page restored complete with its state rather than being fetched and rebuilt', 'The back/forward cache beats any prefetch strategy. Usually the work is removing whatever disqualified the page, not adding anything.'),

    h2('How do you know it is working?'),
    p('By measuring the navigation, not the prefetch — the prefetch always looks fine.'),
    p('The Network panel shows prefetch requests with a low priority and, on a subsequent navigation, a cache hit. That confirms the mechanism. What it does not tell you is whether users are faster, which is a field question and needs [field instrumentation](/blog/field-vs-lab-data).'),

    h3('Measure hit rate first'),
    p('Count prefetches issued and prefetches followed by a navigation to that URL. If the ratio is poor, the strategy is wrong and no amount of tuning the implementation fixes it.'),

    h3('Then measure the navigation itself'),
    p('The metric that improved is the time from click to the next page being useful, which is not one of the Core Web Vitals and needs its own measurement. A `performance.mark` on click and a comparison against the next page\'s paint is the crude version and it is enough to tell you whether the work landed.'),

    h3('Watch total bytes as a counterweight'),
    p('If prefetching is enabled and transferred bytes per session rise sharply without a navigation improvement, the strategy is spending money on nothing. That pair of numbers — hit rate and bytes per session — is the whole evaluation.'),
    img('measure-navigation', 'A comparison of time from action to usable page rather than of the speculative request itself', 'The prefetch always looks fine in the network panel. The number that matters is click to useful, measured in the field.'),

    h2('What do I actually ship?'),
    p('Hover prefetching on internal links, viewport prefetching on the two or three destinations that matter, and nothing else.'),
    p('On this site that means the nav, the work cards and the primary call to action are prefetched on hover, and `/start` — the page most journeys end on — is prefetched when it enters the viewport. The blog index prefetches nothing on viewport, because a listing page of twenty cards is exactly the case where viewport strategy wastes the most.'),

    h3('Static sites benefit most'),
    p('A prerendered HTML document from a CDN edge is small, cacheable and fast to fetch, so the prefetch almost always completes in the hover window. This is one of the quieter arguments for [static output](/blog/astro-vs-nextjs): the technique works better when there is a file to fetch than when there is a server to wait for.'),

    h3('It stacks with everything else'),
    p('Prefetching does not replace making the destination fast. A page that takes 3 seconds to render still takes 3 seconds after an instant fetch — you have removed the network, not the work. It is a multiplier on a page that is already reasonable, not a fix for one that is not.'),

    img('what-i-ship', 'A small set of links given speculative loading while the majority of a listing page is left alone', 'Hover on internal links, viewport on two or three destinations, nothing on the listing page. That is the whole configuration.'),

    h2('Does this help SEO?'),
    p('Not directly, and it is worth being precise about why, because the claim gets made.'),
    p('Core Web Vitals are measured per page load, and a prefetched navigation is still a page load with its own LCP. If the destination renders instantly from cache, its LCP genuinely improves and that is a real field-data effect. But no crawler hovers, so nothing about this changes how a page is assessed when it is fetched by a bot.'),

    h3('The real benefit is behavioural'),
    p('Faster navigation reduces the drop-off between pages, which shows up as more pages per session and lower bounce. Those are business numbers rather than ranking factors, and they are the honest reason to do this.'),

    h3('Do not let a crawler trigger prefetch logic'),
    p('Since the mechanism is bound to pointer and focus events, bots do not fire it — but a viewport-based implementation using `IntersectionObserver` can behave unexpectedly in headless rendering. Worth a check if you are also generating pages with a headless browser.'),

    h2('What does it cost?'),
    p('An hour to implement, and an ongoing bandwidth bill you should look at once.'),
    p('If the framework supports it, this is a configuration change and a decision about which links get the more aggressive strategy — well under an hour. The hand-rolled version is fifteen lines plus the Save-Data guard. Neither is difficult and both are easy to get subtly wrong by being too eager.'),
    p('The honest counterweight: this optimises the experience of people who already decided to click, using bandwidth belonging to people who did not. On a fast connection that trade is invisible and clearly worth it. On a $2-per-gigabyte mobile plan, prefetching sixty listing pages that nobody opens is a real cost transferred quietly onto the user. Hover-only, with a Save-Data guard, keeps that trade honest — and if you cannot measure the hit rate, default to the conservative setting rather than the impressive one.'),
    quote('Prefetching spends the bandwidth of people who did not click to speed up the people who did. Hover keeps that trade defensible; prefetching everything does not.'),

    h2('Conclusion'),
    p('The 200 milliseconds between hover and click is free and is usually enough to fetch a whole document, which makes hover prefetching the cheapest perceived-performance win on a multi-page site. Bind it to `focus` as well as `pointerenter`, or keyboard users get nothing.'),
    p('Prefetch the document and, on a client-rendered app, the route chunk and its data — code without data just moves the spinner somewhere more visible. Leave images alone; they are the biggest thing to guess wrong about.'),
    p('Use what your framework provides if it has an opinion, Speculation Rules where you want prerendering, and about fifteen delegated lines otherwise. Whichever you pick, guard it with `Save-Data` and never point it at a URL that has a side effect — prefetching does not create that bug, it just finds it.'),
    p('Keep the eagerness low. Viewport prefetching on a twenty-card listing page can land under a five percent hit rate, which is bandwidth taken from people who never clicked. Reserve prerendering for one or two high-confidence destinations, and check what it does to your analytics before you ship it.'),
    p('Then evaluate it on two numbers only: hit rate, and bytes per session against navigation time. If bytes went up and navigation did not, the strategy is wrong regardless of how good the implementation is. And remember this is a multiplier — a slow destination is still slow after an instant fetch, so [fix the page first](/start).'),
  ),
  faqs: faq([
    ['How much time does hover prefetching actually buy?',
     'Roughly 150 to 300 milliseconds between the pointer arriving and the click, which on a typical connection is enough to fetch a 15–50KB HTML document. On touch there is no hover, but touchstart fires about 90 milliseconds before click, which still covers connection setup.'],
    ['Is prefetching everything on the page a good idea?',
     'Rarely. A viewport strategy on a long listing page can fire sixty requests at a hit rate under five percent, competing for bandwidth with the current page and spending a mobile user’s data allowance. Hover typically lands above half, which is why it is the sensible default.'],
    ['What is the difference between prefetch and prerender?',
     'Prefetch stores the bytes; prerender builds the entire page in the background with CSS applied and JavaScript executed, so activation is near-instant. Prerender is far more effective and far more expensive, so reserve it for one or two high-confidence destinations per page.'],
    ['Will prefetching break anything?',
     'Only URLs with side effects. A GET that mutates state — logout, unsubscribe, an approve link — gets triggered by prefetching, by link scanners and by mail clients. Prefetching does not create that bug, it exposes it. Also check that prerendered pages do not double-count in analytics.'],
    ['Does prefetching improve Core Web Vitals?',
     'Indirectly. Each navigation is still its own page load with its own LCP, and a destination that renders from cache genuinely scores better in field data. But crawlers do not hover, so nothing changes about how a bot-fetched page is assessed. The real gain is behavioural, not ranking.'],
  ]),
};
