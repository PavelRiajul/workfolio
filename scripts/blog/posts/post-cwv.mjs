import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/core-web-vitals-nextjs/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-core-web-vitals-nextjs',
  slug: 'core-web-vitals-nextjs',
  title: 'Core Web Vitals in Next.js: The Handful of Changes That Move the Number',
  category: 'performance',
  order: 77,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-01',
  series: 'Foundations',
  excerpt:
    'LCP is usually one image, INP is usually one handler, and CLS is usually one element with no reserved space. Fixing those beats a rewrite.',
  coverLabel: 'Core Web Vitals — cover',
  body: body(
    p('Most Core Web Vitals work goes wrong in the same way: somebody runs Lighthouse, gets a number, and starts optimising everything. Six hours later the bundle is smaller, the score has moved four points, and the actual problem — one unoptimised hero image — is untouched.'),
    p('The three metrics have narrow causes. LCP is nearly always a single element, usually an image. INP is nearly always a single handler doing too much. CLS is nearly always one thing appearing without reserved space. Finding *which* one is the entire job.'),
    p('This is the sequence I actually use on Next.js projects, in the order that finds the largest wins first.'),

    h2('What are the three metrics measuring?'),
    p('Loading, responsiveness and stability — each expressed as a single number with a threshold that maps to something a person would notice.'),
    table('The thresholds that matter', [
      ['Metric', 'Measures', 'Good', 'Poor'],
      ['LCP', 'When the main content appeared', 'Under 2.5s', 'Over 4s'],
      ['INP', 'How fast interactions respond', 'Under 200ms', 'Over 500ms'],
      ['CLS', 'How much the layout moved', 'Under 0.1', 'Over 0.25'],
    ]),
    p('They are measured at the 75th percentile of real visits, which is the part people miss. Passing means three quarters of your visitors get a good experience — so a site that is fast on a desktop and slow on a mid-range Android fails, because the Android sessions are in the tail that decides the number.'),

    p('It is also worth knowing that the three are largely independent. A page can have excellent LCP and terrible INP, because one is about how fast the first picture arrives and the other is about whether the thread is free afterwards. Treating them as one "speed" number is how a team optimises the metric that was already passing.'),

    h3('These are diagnostic, not the goal'),
    p('The goal is a site that feels quick. The metrics are proxies for that, chosen because they correlate with abandonment, and they are useful precisely because they are specific enough to act on. A page can pass all three and still feel sluggish, and that is worth fixing too.'),
    img('three-metrics', 'Three separate measurements of a page load, each with its own threshold', 'Three narrow questions with narrow causes. The work is identifying which element is responsible.'),

    h2('How do you find the LCP element?'),
    p('The browser tells you. Do not guess.'),
    code('ts', `
new PerformanceObserver((list) => {
  const e = list.getEntries().at(-1) as any;
  console.log('LCP', Math.round(e.startTime), e.element);
}).observe({ type: 'largest-contentful-paint', buffered: true });
`),
    p('That logs the actual element and the time. In Chrome devtools the Performance panel marks it directly on the timeline, which is faster still. Either way you now know whether you are optimising an image, a heading or a video poster.'),
    p('In my experience it is an image about seven times out of ten, a block of text most of the rest, and occasionally a video poster frame that nobody thought of as content.'),

    h3('If it is an image, four things fix it'),
    p('Serve it in a modern format, size it for the viewport it appears in, mark it `priority` so it is not lazy-loaded, and preload it. `next/image` handles the first two and the third with one prop; the fourth it does for you when `priority` is set.'),
    code('tsx', `
<Image src={hero} alt="" priority sizes="100vw" />
`),
    p('The single most common LCP bug in Next.js is a hero image *without* `priority`. Images are lazy by default, so the most important image on the page waits until layout has established that it is in view — which is exactly the delay you are trying to remove.'),

    img('lcp-culprits', 'A page with one dominant element identified among several candidates', 'An image roughly seven times in ten. Knowing which removes most of the guessing.'),

    h3('If it is text, it is usually the font'),
    p('Text cannot paint until its font resolves or the fallback is accepted. `font-display: swap` paints immediately in a fallback; self-hosting removes the two connection setups a font CDN costs. That combination is [most of the fix](/blog/self-host-fonts-inline-icons) and it is not a Next.js concern at all.'),

    p('The `sizes` attribute is the half of this that gets skipped. Without it the browser assumes the image occupies the full viewport width and picks the largest candidate, so a card thumbnail 300px wide downloads a 1600px file. On a page with a grid of them that single omission can be most of the transferred bytes, and it produces no visible defect at all — the image simply looks fine and costs five times what it should.'),

    h3('And sometimes it is the server'),
    p('If time-to-first-byte is 1.2 seconds, no amount of image work gets LCP under 2.5. Check TTFB first — it is the floor everything else sits on, and a slow one points at rendering strategy or a database call in the request path rather than at the front end.'),

    h2('What actually causes bad INP?'),
    p('A long task blocking the main thread between the input and the next paint. Usually one handler, occasionally hydration.'),
    p('INP measures the worst interaction latency across a visit, so a single slow handler on a frequently-used control decides the number even if everything else is instant. It replaced FID specifically because FID only measured the *first* interaction, which flattered pages that got slow later.'),

    h3('Find it with the interaction breakdown'),
    p('The three phases are the whole diagnosis, and devtools gives them to you directly.'),
    p('Devtools shows input delay, processing time and presentation delay separately. Long input delay means the main thread was already busy — often hydration or a third-party script. Long processing means your handler is slow. They need completely different fixes, which is why the split matters.'),

    h3('Break up the long task'),
    p('Yielding once before the expensive part is usually enough to change how the whole interaction feels to somebody using it.'),
    p('A handler doing a lot of work can yield so the browser can paint. `scheduler.yield()` where available, or a `setTimeout` fallback, lets an interaction feel responsive while the work continues.'),
    code('ts', `
async function onFilter(value: string) {
  setPending(value);              // paint the response immediately
  await new Promise((r) => setTimeout(r, 0));
  applyExpensiveFilter(value);    // then do the work
}
`),

    h3('Hydration is the Next.js-specific cause'),
    p('A page with many client components hydrates a large tree, and interactions during that window queue behind it. Server components are the real fix — the less that hydrates, the shorter the window — which is [the same argument as islands](/blog/astro-islands) arriving in a different framework.'),

    p('There is a subtlety in what INP counts that changes how you read it. It measures from the input to the *next paint*, not to the end of your handler — so a handler that finishes quickly but triggers an expensive re-render still scores badly. That is why "my click handler is 3ms" and "INP is 400ms" are consistent statements, and why the presentation-delay column is often the interesting one.'),

    h3('Watch for the handler that runs on every scroll'),
    p('A non-passive scroll or wheel listener blocks scrolling itself. Marking listeners passive where they do not call `preventDefault` is one line and it removes an entire category of jank.'),
    img('inp-breakdown', 'An interaction separated into waiting, processing and painting phases', 'Input delay and processing time have different causes. The split tells you whether the thread was busy or your handler was slow.'),

    h2('Where does CLS come from?'),
    p('Four sources, and images without dimensions is the biggest by a wide margin.'),
    ul([
      '**Images with no width and height,** so the browser reserves nothing until the file arrives.',
      '**Ads, embeds and iframes** injected into a space that was not reserved.',
      '**Web fonts swapping** and reflowing text with different metrics.',
      '**Content inserted above the fold** — a banner, a notification, a lazily-mounted component.',
    ]),
    p('Next.js handles the first automatically when you use `next/image` with static imports, because it knows the dimensions at build time. It cannot help with a remote image whose size you did not declare, which is where the failures cluster.'),
    p('This deserves its own treatment — [getting CLS near zero](/blog/near-zero-cls) is mostly about reserving space for things that do not exist yet, and it is more systematic than the other two metrics.'),

    h2('Which Next.js features actually matter?'),
    p('Four, and the rest are marginal by comparison.'),
    table('The features worth using deliberately', [
      ['Feature', 'Fixes', 'Cost'],
      ['next/image with priority', 'LCP on image-led pages', 'One prop'],
      ['next/font', 'Font-driven LCP and CLS', 'An import'],
      ['Server components', 'INP via less hydration', 'A mental model'],
      ['next/script strategy', 'Third-party blocking the thread', 'One attribute'],
    ]),

    h3('next/font self-hosts and preloads for you'),
    p('It downloads the font at build time, serves it from your origin, generates the `@font-face`, and can calculate fallback metrics to reduce the swap shift. That is four separate manual steps collapsed into an import, and it is the highest-value single change on most Next.js sites.'),

    p('One caution about `next/image` worth knowing before you adopt it wholesale: on a self-hosted deployment the default loader optimises images at request time, which means the first request for each size is slow and the cache has to be persistent across deploys or it warms from cold every release. On Vercel this is handled; elsewhere it is a decision, and pre-optimising at build time is often the calmer answer.'),

    h3('next/script strategy is a real decision'),
    p('`afterInteractive` is the sensible default for analytics. `lazyOnload` is right for anything that can wait — chat widgets, review badges. `beforeInteractive` should be almost nothing, because it blocks. Most third-party performance problems are a script loaded with the wrong strategy [rather than a script that is inherently expensive](/blog/third-party-script-cost).'),

    h2('What is the order of operations?'),
    p('Measure, find the responsible element, fix that one thing, measure again. Repeat rather than batching.'),
    ol([
      '**Get field data first.** Lab tools tell you what could be slow; field data tells you what is. Start from the Chrome UX Report or your own real-user monitoring.',
      '**Identify the LCP element** on the slowest real page, not the home page.',
      '**Fix that element,** deploy, and wait for the field data to move. This takes days, which is uncomfortable and unavoidable.',
      '**Then look at INP,** which is usually the second-largest gap and the hardest to reproduce in a lab.',
      '**Then CLS,** which is the most mechanical to fix once you know what is shifting.',
    ]),
    p('The discipline that matters is one change at a time. Batching five optimisations means you cannot tell which one helped, and the usual outcome is that four were neutral and one mattered — but you now maintain all five.'),
    img('order-of-work', 'A repeating cycle of measuring, isolating and correcting a single cause', 'One change at a time. Batching five means you cannot tell which of them was the one that mattered.'),

    h2('What does not move the number?'),
    p('Most of what performance advice suggests, on most sites.'),
    ul([
      '**Shaving a few KB off the bundle** when LCP is a 900KB image. The image is 100 times the problem.',
      '**Micro-optimising React renders** when INP is fine and LCP is the failing metric.',
      '**Adding a service worker** before the first load is fast. It helps repeat visits and does nothing for the visitor who leaves.',
      '**Switching frameworks** because a benchmark said so. Framework choice matters at the margins; images and third-party scripts matter by multiples.',
    ]),
    p('There is a fifth worth adding because it wastes the most time: reading a Lighthouse opportunity list top to bottom and working through it. Those items are ranked by estimated saving on that one simulated load, not by what is failing for your real visitors, and the estimates are frequently generous. Treat it as a list of candidates to check against field data rather than a work queue.'),
    p('The pattern is that all four are satisfying, measurable engineering work that is unrelated to the specific thing making your specific page slow. The uncomfortable version of this job is that the fix is usually boring and belongs to someone who uploaded a photograph.'),

    h2('Does rendering strategy change the answer?'),
    p('It changes the floor, which is the part of LCP no front-end work can reach.'),
    table('What each strategy costs at the first byte', [
      ['Strategy', 'TTFB', 'Right when'],
      ['Static, prerendered', 'Near zero from a CDN', 'Content that is the same for everyone'],
      ['Incremental regeneration', 'Near zero, occasionally slow', 'Content that changes on a schedule'],
      ['Server-rendered per request', 'Whatever your slowest query is', 'Content personalised per visitor'],
      ['Client-fetched after load', 'Fast TTFB, late LCP', 'Almost never for main content'],
    ]),
    p('The last row is the trap. Rendering a shell quickly and fetching the content afterwards produces an excellent-looking first byte and a terrible LCP, because the largest element does not exist until a request completes. It also gives crawlers an empty page — a cost that does not show up in any performance metric.'),

    h3('Personalisation is usually narrower than the page'),
    p('A page is often served dynamically because one element differs per visitor — a name in a header, a cart count. Rendering the whole page per request to personalise a badge means every visitor pays the query. Serve the page statically and fetch the personal fragment separately.'),

    h3('Check what is actually in the request path'),
    p('A server-rendered page waits for whatever the handler waits for. A CMS call without a timeout, an analytics write before the response, a session lookup that could have been cached — each adds directly to TTFB, and TTFB is a floor under LCP that no image optimisation can lift.'),
    img('ttfb-floor', 'A minimum delay established before any subsequent work can begin', 'TTFB is the floor everything else sits on. No amount of image work gets under it.'),

    h2('How do you keep it from regressing?'),
    p('Budgets in CI and field monitoring in production, because the two catch different failures.'),

    h3('A budget that fails the build'),
    p('Lighthouse CI with an asserted LCP and total byte budget catches the pull request that adds a 2MB image. It runs on a synthetic page load, which is a poor absolute measure and an excellent relative one — the number does not need to be true, it needs to be comparable.'),

    p('Run it against a deployed preview rather than a local build, too. A local server has no network latency, no CDN and no compression settings, so the numbers bear little relation to production — useful for catching a doubled bundle, useless for anything expressed in seconds.'),

    h3('Field monitoring for what CI cannot see'),
    p('INP in particular only appears with real interaction on real devices. The `web-vitals` library reporting to your analytics gives you the distribution that actually decides your scores, and it costs a few kilobytes.'),
    code('ts', `
import { onLCP, onINP, onCLS } from 'web-vitals';
[onLCP, onINP, onCLS].forEach((fn) => fn((m) => report(m.name, m.value)));
`),

    img('budget-and-field', 'A pre-release check paired with an ongoing measurement of real use', 'CI catches the 2MB image before it ships. Only field data shows an INP problem that needs a real device to appear.'),

    h3('Alert on the 75th percentile, not the average'),
    p('An average hides the tail, and the tail is the metric. A page with a 1.2s median LCP and a 6s p75 fails, and the average looks fine — which is why an average-based dashboard reliably tells you everything is well while the score says otherwise.'),

    h2('What does this cost?'),
    p('A day for the first pass on a typical site, and most of it is measurement rather than code.'),
    p('Finding the LCP element takes minutes. Fixing it — resizing an image, adding `priority`, moving a font — takes an hour. The rest of the day goes on setting up field monitoring, adding a CI budget, and waiting for real-user data to confirm the change actually landed.'),
    p('The honest counterweight: Core Web Vitals are a proxy and treating them as the objective produces odd decisions. I have seen a team remove a genuinely useful interactive element because it hurt INP, when the right answer was to make it faster. Optimise the experience and use the metrics to find where it is worst — not the other way around.'),
    quote('LCP is one element. INP is one handler. CLS is one thing with no reserved space. The work is finding which, not optimising everything.'),

    h2('Conclusion'),
    p('Start by identifying the LCP element with a `PerformanceObserver` or the devtools timeline rather than guessing. It is an image roughly seven times in ten, and the most common Next.js cause is a hero image without `priority` — lazy by default, so the most important image on the page waits for layout.'),
    p('For INP, split the interaction into input delay and processing time. Delay means the thread was already busy — usually hydration or a third-party script — and processing means your handler is slow. Yield inside long handlers so the browser can paint the response before the work finishes.'),
    p('Use `next/font` for self-hosting, preloading and fallback metrics in one import; set `next/script` strategies deliberately, with `beforeInteractive` reserved for almost nothing; and reach for server components to shrink the hydration window rather than micro-optimising renders.'),
    p('Work from field data, fix one thing at a time, and re-measure between changes. Batching five optimisations means four were probably neutral and you now maintain all of them.'),
    p('Then hold it with a Lighthouse budget in CI for the pull request that adds a 2MB image, and real-user monitoring for INP, which only appears with real interaction on real devices. Alert on the 75th percentile — an average hides the tail, and the tail is the whole metric. If a site is failing its vitals and the cause is not obvious, [finding it is usually a short piece of work](/start).'),
  ),
  faqs: faq([
    ['What is the most common cause of poor LCP in Next.js?',
     'A hero image without the priority prop. next/image lazy-loads by default, so the largest element on the page waits for layout to confirm it is in view. Adding priority marks it eager and preloads it, which is usually the single biggest change available.'],
    ['How do you find which element is the LCP?',
     'A PerformanceObserver for largest-contentful-paint logs the element and the time, and the devtools Performance panel marks it on the timeline. Do not guess — it is an image most of the time, but text and video posters both happen and they need different fixes.'],
    ['Why did my Lighthouse score improve but the field data did not?',
     'Lab tests run one simulated load on one device profile. Field data is the 75th percentile of real visits, which includes mid-range phones on poor connections. Use lab tools to find causes and field data to decide whether a fix actually landed.'],
    ['Does bundle size affect Core Web Vitals much?',
     'Less than people expect. It affects INP through hydration and long tasks, but LCP is usually dominated by a single image or the server response. Shaving kilobytes while an unoptimised hero image loads is optimising the wrong order of magnitude.'],
  ]),
};
