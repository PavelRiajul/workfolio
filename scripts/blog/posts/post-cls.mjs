import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/near-zero-cls/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-near-zero-cls',
  slug: 'near-zero-cls',
  title: 'Getting CLS to Near Zero by Reserving Space',
  category: 'performance',
  order: 78,
  readTime: '12 min read',
  date: 'October 2026',
  publishedAt: '2026-10-02',
  series: 'Foundations',
  excerpt:
    'Every shift is something arriving into space nobody reserved. Aspect ratios, font metrics, and the banner that pushes the page down mid-read.',
  coverLabel: 'Near-zero CLS — cover',
  body: body(
    p('Cumulative Layout Shift is the most mechanical of the three Core Web Vitals, which makes it the one most worth getting to almost nothing. Every shift has a single cause — something arrived and the space it needed was not there — and every fix is a variation of reserving that space in advance.'),
    p('It is also the metric people feel most directly. Nobody notices a 300ms difference in load time. Everybody notices tapping a link and hitting an ad because the page moved under their thumb.'),
    p('This is the full list of what shifts, in the order it usually appears, and what reserving space looks like in each case.'),

    h2('What is the number actually measuring?'),
    p('How much of the viewport moved, multiplied by how far it moved, summed over the visit.'),
    p('An element occupying half the screen that jumps a quarter of the screen scores 0.5 × 0.25 = 0.125 — already above the 0.1 threshold from one shift. That maths is why a single large shift fails a page while many tiny ones may not, and it is a good instinct to carry: fix the big movements first.'),
    table('What counts and what does not', [
      ['Movement', 'Counts?'],
      ['An image loading and pushing content down', 'Yes'],
      ['A banner injected above the fold', 'Yes'],
      ['A font swapping and reflowing text', 'Yes'],
      ['An element moving within 500ms of a click', 'No — treated as expected'],
      ['A transform animation', 'No — transforms do not affect layout'],
      ['Content below the viewport moving', 'Yes, if it later enters view'],
    ]),
    p('The fourth row is the escape hatch that makes interactive interfaces possible. An accordion opening because somebody clicked it is a response to input, not an unexpected shift — which is also why animating with `transform` rather than `height` avoids the metric entirely as well as being faster.'),
    img('shift-maths', 'A movement scored by both the area affected and the distance travelled', 'Area times distance. One large movement fails a page where many small ones might not.'),

    h2('Why are images the biggest cause?'),
    p('Because without dimensions the browser has no idea how tall the element will be, so it reserves nothing and lays out the page as though the image were zero height.'),
    code('html', `
<!-- No dimensions. Everything below moves when this arrives. -->
<img src="/hero.jpg" alt="">

<!-- Dimensions given. The browser reserves the ratio immediately. -->
<img src="/hero.jpg" alt="" width="1600" height="900">
`),
    p('Modern browsers derive an aspect ratio from the `width` and `height` attributes and apply it even when CSS resizes the image, so those two attributes give you responsive images with reserved space — which was not true a few years ago and is why a lot of older advice omits them.'),

    p('There is an ordering subtlety worth knowing. If CSS sets only a width and leaves height auto, the attribute-derived ratio still applies and the reserved height is correct. If CSS sets *both* dimensions to something with a different ratio, the CSS wins and the reservation is whatever CSS said — which is fine, because it is still a reservation. The failure is only when neither the attributes nor the CSS establish a height at all.'),

    h3('Use aspect-ratio when dimensions are unknown'),
    p('For a remote image whose size you do not know at build time, the container can carry the ratio instead. This is the fix for CMS images, user uploads and anything from an external API.'),
    code('css', `
.cover { aspect-ratio: 16 / 10; overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; }
`),
    p('The container reserves the shape before the file exists, and `object-fit` handles whatever arrives not matching it. On this site every card cover and case-study hero works this way, which is why a missing image produces a blank space of the right size rather than a collapsed layout.'),

    img('reserve-ratio', 'A container holding a defined shape before its contents arrive', 'The container carries the ratio. What arrives fits into space that already existed.'),

    h3('Store dimensions in the CMS'),
    p('Better still, capture width and height at upload and store them alongside the asset. Sanity does this automatically; most systems can. Then a remote image is as safe as a local one and the ratio is the real one rather than an assumed crop.'),

    h2('What about fonts?'),
    p('A font swap reflows text, and text is usually most of the page.'),
    p('When a web font replaces the fallback, every line box changes height slightly and every paragraph re-wraps. The shift is small per element and enormous in aggregate because it happens to everything at once.'),

    h3('Match the fallback metrics'),
    p('CSS can adjust a fallback font so it occupies almost exactly the same space as the real one, which makes the swap nearly invisible.'),
    code('css', `
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
}
`),
    p('The numbers come from comparing the two fonts\' metrics — several tools generate them, and `next/font` does it automatically. It is the difference between a visible reflow and one you have to look for.'),

    h3('font-display: optional removes the shift entirely'),
    p('With `optional`, the browser uses the web font only if it arrives almost immediately; otherwise it keeps the fallback for that page load. No swap means no shift, at the cost of some visitors never seeing your typeface. For a decorative face that is often the right trade; for your body font it usually is not.'),

    h3('Self-hosting makes the font arrive sooner'),
    p('The swap window is however long the font takes to load. [Removing two connection setups](/blog/self-host-fonts-inline-icons) shortens it substantially, which reduces both the chance of a swap being noticed and the amount of reading disturbed by it.'),
    img('font-swap', 'Text reflowing as one typeface is substituted for another with different proportions', 'Small per element, enormous in aggregate — it happens to every line on the page simultaneously.'),

    h2('What about things injected after load?'),
    p('Banners, notification bars, cookie notices and ads — all of which arrive into a page that has already been laid out.'),
    p('The rule is the same: if something might appear, reserve its space from the start. What differs is that these are often conditional, so reserving space unconditionally means a gap for visitors who never see the element.'),

    h3('Reserve, or overlay'),
    p('There is genuinely no third option here that avoids both the empty gap and the movement.'),
    p('Two honest options. Reserve the height always and accept a small empty strip when the element does not appear, or position it as an overlay so it never participates in layout at all. A cookie banner fixed to the bottom of the viewport causes no shift whatsoever.'),

    h3('Decide before render, not after'),
    p('If the decision to show a banner depends on a cookie, read it server-side and render the page with or without the banner already in place. A client-side check that injects it afterwards guarantees a shift for exactly the visitors who see it.'),

    h3('Never insert above existing content'),
    p('Anything appearing above content the reader may already be looking at pushes everything down mid-read. If a message must appear late, put it at the bottom, or make it an overlay — the position is the fix, not the timing.'),

    h2('What about lazy-loaded and async content?'),
    p('Same principle, applied to components rather than images.'),
    ul([
      '**Skeleton placeholders** should match the real content\'s dimensions, not merely suggest that something is coming. A 40px skeleton replaced by a 120px card is a shift with extra steps.',
      '**A component loaded on demand** needs its container sized before the import resolves.',
      '**An embed** — a map, a video, a tweet — has a known aspect ratio. Wrap it in a container carrying that ratio.',
      '**Data-dependent lists** should reserve a plausible height, or render into a fixed-height scroll area.',
    ]),
    p('The skeleton case is the one that produces smug failures, because the team added a loading state specifically to improve the experience and it made the metric worse. A skeleton is only useful if it is the same shape as what replaces it.'),

    p('Infinite scroll deserves a specific mention because it is a whole feature built on inserting content. Appending below the current view is safe — nothing the reader is looking at moves. What breaks it is a loading spinner that occupies less space than the batch replacing it, or a "load more" button that disappears as the content arrives. Both are solved by giving the loading region the height of what it will become.'),

    h3('min-height is the blunt instrument that works'),
    p('When a container\'s eventual size genuinely cannot be known, a sensible `min-height` bounds the shift to the difference rather than the whole element. It is not elegant and it converts a large movement into a small one, which is what the metric measures.'),

    h2('How do you find the shifts?'),
    p('The browser reports them with the responsible element attached, so this is one of the easier things to diagnose precisely.'),
    code('ts', `
new PerformanceObserver((list) => {
  for (const entry of list.getEntries() as any[]) {
    if (entry.hadRecentInput) continue;        // user-initiated, not counted
    console.log('shift', entry.value.toFixed(4), entry.sources?.map((s) => s.node));
  }
}).observe({ type: 'layout-shift', buffered: true });
`),
    p('`entry.sources` names the nodes that moved. That turns "the page jumps" into "this element moved 180px at 1.4 seconds", which is a fixable statement.'),

    h3('Devtools shows them visually'),
    p('The Performance panel marks layout shifts on the timeline and highlights the affected region when you select one. For a shift you can reproduce, this is faster than the observer and shows you the before and after.'),

    h3('Throttle, or you will not see them'),
    p('An unthrottled test on a fast development machine is very close to a guarantee of a clean, meaningless result.'),
    p('On a fast connection images arrive before layout settles and there is no shift at all. Every CLS test has to run throttled — slow 3G in devtools — or you are testing a condition none of your visitors are in.'),

    h3('Test the whole session, not the load'),
    p('This is the single most common reason a locally clean page fails in the field.'),
    p('CLS accumulates for as long as the page is open. A shift caused by a lazy-loaded section two screens down still counts, and a load-time-only test never sees it. Scroll the whole page before reading the number.'),
    img('find-shifts', 'A timeline with movement events marked against the elements responsible', 'The observer names the node that moved. That converts "the page jumps" into something specific enough to fix.'),

    h2('Where do the remaining shifts hide?'),
    p('Four places that survive a careful first pass, because none of them appear on a page you are actively looking at.'),
    table('The ones found last', [
      ['Source', 'Why it survives an audit'],
      ['Scrollbar appearing', 'Only on pages that grow past one screen'],
      ['A late-loading section two screens down', 'Never seen in a load-time test'],
      ['An error or empty state', 'Requires the failure to reproduce it'],
      ['Content that differs per visitor', 'Your session is not the failing one'],
    ]),
    p('The scrollbar one is genuinely subtle. A page that starts shorter than the viewport and grows past it gains a scrollbar, which narrows the content area and reflows everything. `scrollbar-gutter: stable` reserves the space from the start and removes it — one declaration for a shift that is otherwise very hard to attribute.'),

    h3('Empty states are content too'),
    p('A list that renders nothing while loading and then shows "No results" has changed height twice. Both states need a reserved size, and the empty state is the one nobody designs because it is not the happy path.'),

    h3('Test the failure cases'),
    p('An image that 404s, a fetch that times out, a feed that returns nothing — each produces a layout the successful path never shows. Those are exactly the sessions where somebody is already having a bad time, which is a poor moment to also move the page under them.'),
    img('hidden-shifts', 'Movements occurring outside the initially visible region and outside the successful path', 'None of these appear in a load-time test on a working page, which is why they survive the first audit.'),

    h2('Which shifts are acceptable?'),
    p('The ones a person caused, and only for a short window afterwards.'),
    p('A shift within 500ms of an interaction is excluded, on the reasoning that somebody who clicked "show more" expects the page to change. Outside that window, even a response to input counts — which is a good incentive to make interactive changes fast rather than eventually.'),

    h3('Animate with transform, not layout properties'),
    p('A panel sliding in with `transform: translateY` does not affect layout and cannot cause a shift. The same panel animating `height` or `top` reflows on every frame — worse for the metric and considerably worse for [frame rate](/blog/gsap-lenis-smooth-scroll).'),

    h3('Use the animation to hide the reflow'),
    p('Where a size change is unavoidable, animating it inside the 500ms window after the click both looks better and stays excluded from the metric. Immediate and instant is fine; delayed and instant is what hurts.'),

    h2('What does a near-zero page look like?'),
    p('Five properties, all of which are checkable rather than aspirational.'),
    ol([
      '**Every image has dimensions or a ratio container.** No exceptions, including CMS and remote images.',
      '**Fonts have adjusted fallback metrics,** or use `optional`.',
      '**Nothing is injected above existing content** after first paint.',
      '**Every async region has a reserved size** matching what will fill it.',
      '**Size changes are transforms,** or happen within 500ms of input.'],
    ),
    p('A page satisfying those five reliably lands under 0.05, which is comfortably inside the threshold and leaves room for the one thing you will inevitably miss.'),

    h3('It is worth going past the threshold'),
    p('Stability is felt as care in a way that a few hundred milliseconds of load time simply is not.'),
    p('0.1 is a pass mark, not a target. Layout stability is one of the few performance properties a visitor experiences as *quality* rather than speed, and the difference between 0.09 and 0.01 is noticeable even though both pass.'),

    h2('What does this cost?'),
    p('An afternoon on an existing site, and close to nothing if the habits are in place.'),
    p('Most of the work is an audit: throttle, scroll every page, log the shifts, and fix each named element. The fixes themselves are dimensions attributes, ratio containers and a fallback font declaration — none of which take long once you know where they belong.'),
    p('The honest counterweight: reserving space for conditional content means occasionally showing an empty strip to somebody who will never see the thing that fills it. That is a real design cost, and the answer is usually to make the element an overlay rather than to accept either the gap or the shift — but sometimes there is no good option and you pick the least bad one deliberately.'),
    quote('Every shift is something arriving into space nobody reserved. There is no other cause, which is why this is the most fixable of the three metrics.'),

    h2('How do you stop it regressing?'),
    p('A check on the build, and one habit in review.'),

    h3('Assert CLS in CI'),
    p('Lighthouse CI with an asserted CLS budget catches the pull request that adds an image without dimensions. It runs throttled by default, which is exactly the condition that reveals shifts, and it is one of the more reliable synthetic assertions because CLS is far less noisy than timing metrics.'),

    img('regression-gates', 'A check applied before release alongside a question asked during review', 'CLS is far less noisy than timing metrics, which makes it one of the more reliable things to assert in CI.'),

    h3('Lint for images without dimensions'),
    p('A rule requiring `width` and `height` on every `img`, or the use of your image component, catches the cause rather than the symptom. It is faster to fix at the pull request than to diagnose from a score three weeks later.'),

    h3('Ask where the space is reserved'),
    p('For any new component that loads content asynchronously, one review question — "what is the size of this before the data arrives?" — catches the majority of what a linter cannot. It is the same shape of question as asking which token a value came from, and it works for the same reason.'),

    h2('Conclusion'),
    p('Give every image dimensions or an aspect-ratio container. The `width` and `height` attributes now produce a reserved ratio even when CSS resizes the image, which makes them the correct default rather than a legacy habit, and a ratio container covers everything remote whose size you do not know.'),
    p('Adjust your fallback font metrics with `size-adjust` and the ascent and descent overrides so the swap is nearly invisible, or use `font-display: optional` to remove the swap entirely where a face is decorative enough to risk not showing.'),
    p('Never inject anything above content somebody may already be reading. Decide server-side whether a banner appears so it is in the first render, or make it an overlay that never participates in layout at all.'),
    p('Match skeleton dimensions to the real content — a loading state that is a different size from what replaces it makes the metric worse, which is a particularly annoying way to be punished for adding one.'),
    p('Then diagnose with a `layout-shift` observer, which names the node that moved, and always test throttled and after scrolling the whole page — CLS accumulates for the life of the visit, so a load-only test on a fast connection sees almost nothing. Hold it with a CI budget and a lint rule for missing dimensions. If a page moves under people and you cannot pin down what, [that is quick to find](/start).'),
  ),
  faqs: faq([
    ['What causes most layout shift?',
     'Images without dimensions, by a wide margin. Without width and height the browser reserves no space and lays out as though the element were zero height, so everything below moves when the file arrives. Aspect-ratio containers cover remote images whose size is unknown at build time.'],
    ['Do width and height attributes still matter with responsive CSS?',
     'Yes — modern browsers derive an aspect ratio from them and apply it even when CSS resizes the image. That makes them the correct default rather than a legacy habit, and it is why older advice telling you to omit them is out of date.'],
    ['Does animation count towards CLS?',
     'Transforms do not, because they do not affect layout. Animating height, top or margin does. A shift within 500ms of a user interaction is also excluded, on the reasoning that somebody who clicked expects the page to change.'],
    ['Why does my CLS look fine locally but fail in the field?',
     'Because a fast connection delivers images before layout settles, so no shift occurs. Always test throttled, and scroll the entire page — CLS accumulates for the whole visit, so a lazily loaded section two screens down still counts against you.'],
  ]),
};
