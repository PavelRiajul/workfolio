import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/gsap-lenis-smooth-scroll/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-gsap-lenis-smooth-scroll',
  slug: 'gsap-lenis-smooth-scroll',
  title: 'GSAP and Lenis Together, Without Breaking Scroll',
  category: 'frontend',
  order: 63,
  readTime: '13 min read',
  date: 'September 2026',
  publishedAt: '2026-09-17',
  series: 'Foundations',
  excerpt:
    'Smooth scroll and scroll-triggered animation fight over the same number. Wiring them properly, and the accessibility work that is not optional.',
  coverLabel: 'GSAP and Lenis — cover',
  body: body(
    p('Smooth scrolling and scroll-triggered animation are two libraries with one shared assumption: that each of them owns the scroll position. Install both and they will disagree quietly — triggers firing at the wrong place, pins sticking a few pixels late, and a page that feels almost right in a way nobody can describe.'),
    p('The fix is small and specific: tell each library where the other thinks the page is. Getting that wiring right takes about fifteen lines, and getting it wrong produces bugs that look like GSAP being unreliable when it is doing exactly what it was told.'),
    p('This is the setup running on this site, along with the parts I would argue about — because smooth scroll is a real accessibility decision, not just a finish.'),

    h2('What is actually fighting?'),
    p('Lenis intercepts the wheel event and animates a transform instead of letting the browser scroll. So `window.scrollY` stops being the truth.'),
    p('ScrollTrigger, meanwhile, reads the native scroll position to decide when a trigger enters, leaves or updates. If Lenis is animating a transform and the native position has not moved the way ScrollTrigger expects, every calculation it makes is against stale numbers.'),
    table('What each library believes', [
      ['', 'Lenis', 'ScrollTrigger'],
      ['Owns', 'The scroll animation', 'When things fire'],
      ['Reads', 'Wheel and touch input', 'Native scroll position'],
      ['Writes', 'A transform or scrollTop', 'Nothing — it observes'],
      ['Assumes', 'It controls the pace', 'Position is authoritative'],
    ]),
    p('The symptom is not a crash. It is a page where a section fades in slightly after it should, a pinned element releases a beat late, and refreshing sometimes fixes it. That intermittency is what makes it expensive to debug if you do not know the cause.'),
    img('two-owners', 'Two systems reading and writing the same value with no agreed order', 'Neither library is wrong on its own. They just both assume they are the one holding the position.'),

    h2('How do you wire them together?'),
    p('Three connections: drive GSAP from Lenis, let ScrollTrigger ask Lenis for the position, and stop GSAP\'s own ticker from smoothing on top.'),
    code('ts', `
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expoOut
});

// 1. Every Lenis frame tells ScrollTrigger to recalculate.
lenis.on('scroll', ScrollTrigger.update);

// 2. One ticker, not two. GSAP drives Lenis rather than both running rAF.
gsap.ticker.add((time) => lenis.raf(time * 1000));

// 3. GSAP's lag smoothing assumes dropped frames mean a stalled tab. With a
//    scroll animation running it fights the easing instead of helping.
gsap.ticker.lagSmoothing(0);
`),
    p('That is the whole integration. The second line is the one people miss: without it both libraries run their own `requestAnimationFrame` loop, the two loops drift apart by a frame, and you get a persistent one-frame lag that reads as sluggishness.'),

    h3('Anchor links need their own path'),
    p('`scrollIntoView` and `hash` navigation both use native scrolling, which Lenis is not driving — so an in-page link jumps while everything else glides. Route anchors through Lenis explicitly and the whole page moves the same way.'),
    code('ts', `
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href')!);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el as HTMLElement, { offset: -24 });
  });
});
`),
    p('The offset matters more than it looks. Without it a heading lands flush against the top of the viewport with no breathing room, and on a site with fixed chrome it lands *underneath* it. Minus 24 is the value this site uses; the right number is whatever clears your header plus a little air.'),

    h2('What breaks after you think it works?'),
    p('Four things, in roughly the order they appear.'),

    h3('Layout changes after ScrollTrigger measured'),
    p('Every one of these is the same bug wearing different clothes: something moved after the measurement was taken.'),
    p('Triggers cache their start and end positions. If an image loads, a font swaps, or an accordion opens above a trigger, every position below it is now wrong. `ScrollTrigger.refresh()` recalculates — call it after anything that changes document height.'),

    h3('Fonts are the usual culprit'),
    p('It fires late enough that the page already looked settled.'),
    p('A font swapping in reflows text and moves everything below it, often hundreds of milliseconds after the page looked finished. Refreshing on `document.fonts.ready` catches the most common version of this and costs one line.'),

    h3('Nested scroll containers'),
    p('The reported symptom is always "the modal will not scroll", never "smooth scroll is intercepting the wheel".'),
    p('A modal with its own scrolling region, a code block that scrolls sideways, a sticky rail with an internal list — Lenis will happily hijack the wheel over all of them. Mark them so it leaves them alone, or the inner element never scrolls and the page moves instead.'),
    code('html', `
<div class="modal" data-lenis-prevent>…</div>
`),

    h3('Resize is a refresh too'),
    p('Rotating a phone, opening a devtools panel, or a browser chrome bar collapsing on scroll all change the viewport and therefore every position expressed in viewport units. ScrollTrigger handles resize on its own in most cases, but a layout that reflows substantially at a breakpoint often needs an explicit refresh after the reflow settles rather than during it.'),

    h3('Anchors on load'),
    p('Landing on a URL with a hash scrolls natively before your script runs, so the page arrives at the right place ungracefully and ScrollTrigger may have measured mid-jump. Handle the initial hash yourself after setup rather than letting the browser do it.'),
    img('refresh-points', 'A measured layout being invalidated by later content changes', 'Triggers cache positions. Anything that changes document height afterwards makes every position below it wrong.'),

    h2('Is smooth scroll a good idea at all?'),
    p('This is the part that deserves more argument than it usually gets, and the honest answer is that it is a trade rather than an improvement.'),
    p('What you gain is a considered, deliberate feel — motion that matches an editorial design and makes scroll-linked animation land properly. What you give up is the scroll behaviour the reader has calibrated to on every other site and in their operating system.'),
    ul([
      '**It overrides a system preference.** Scroll speed and momentum are OS-level settings people have tuned. Replacing them is a decision made on their behalf.',
      '**It can cause motion discomfort.** For some people, content that continues moving after input stops is genuinely unpleasant — closer to nausea than to preference.',
      '**It adds latency to reading.** A reader scanning for a section wants to arrive, not to glide. Long content is where the cost is highest.',
      '**It is another runtime on the critical path.** Small, but not nothing, and it runs on every frame of every scroll.',
    ]),
    p('None of that makes it indefensible — it makes it a design decision with a cost, which is a different thing from a free improvement. The test I apply is whether the page would lose something real without it. If the answer is "it would feel slightly less premium", that is not enough to override an OS-level preference for every visitor.'),
    p('Where I use it: short, designed, editorial pages where the motion is part of the point. Where I would not: documentation, a dashboard, anything long, and anything primarily read rather than experienced. This site is the first category, and I would not put Lenis on a docs site I built tomorrow.'),

    img('smooth-tradeoff', 'A tuned system preference being replaced by an imposed one', 'The reader already chose a scroll feel, at the operating system level. Replacing it is a decision made for them.'),

    h3('Reduced motion is not a toggle, it is an exit'),
    p('The correct handling of `prefers-reduced-motion: reduce` is not gentler smoothing. It is not initialising Lenis at all — native scrolling, no interception, nothing running per frame.'),
    code('ts', `
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSmoothScroll() {
  if (prefersReduced) return;   // native scroll, and no library loaded at all
  lenis = new Lenis({ /* ... */ });
  // ...
}
`),
    p('Every scroll-driven animation then needs the same treatment, because a page with reduced motion honoured in the scroll and ignored in the reveals is still a page full of movement. [Respecting the preference properly](/blog/prefers-reduced-motion) means auditing every animation, not just the obvious one.'),

    h2('How should scroll-triggered reveals actually behave?'),
    p('Subtly, once, and never at the cost of the content being readable.'),

    h3('Never hide content behind an animation that might not run'),
    p('The common pattern sets elements to `opacity: 0` in CSS and animates them to visible on scroll. If the script fails, is blocked, or the element never enters the viewport for some reason, that content is permanently invisible — to readers *and* to anything reading the rendered page.'),
    p('Set the initial state from JavaScript instead. Then no-JS and script-failure both leave the content plainly visible, which is the correct failure direction.'),
    code('ts', `
// The hidden state only exists once we know we can animate out of it.
gsap.set(items, { autoAlpha: 0, y: 16 });
ScrollTrigger.batch(items, {
  start: 'top 85%',
  onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6 }),
  once: true,
});
`),

    p('`autoAlpha` rather than `opacity` is worth the habit too: it animates opacity and flips `visibility` at the ends, so a fully transparent element is also removed from hit testing. Without it, an invisible card that has not revealed yet still swallows clicks meant for whatever is behind it.'),

    h3('Batch, do not create one trigger per element'),
    p('A grid of thirty cards with thirty ScrollTriggers is thirty sets of cached positions recalculated on every refresh. `ScrollTrigger.batch` groups them into one, and staggers the result, which is what you wanted visually anyway.'),

    h3('Use `once: true` for reveals'),
    p('It also halves the work, since a trigger that has fired and finished can stop being consulted on every frame.'),
    p('Content that fades out again when scrolled past is a page that keeps re-introducing itself. Reveals are an entrance, not a state — play them once and leave the element alone.'),

    h3('Start before the element is fully in view'),
    p('The margin is small and the difference in feel is not.'),
    p('`top 85%` rather than `top bottom` means the animation begins as the element approaches, so by the time the reader is looking at it, it has arrived. Animations that start exactly at the viewport edge always feel late.'),
    img('reveal-timing', 'An element beginning its transition slightly before reaching the viewing area', 'Start as it approaches. A reveal that begins at the edge has already finished feeling late.'),

    img('animate-cheap', 'Two property groups feeding different stages of a rendering pipeline', 'Transform and opacity skip layout and paint entirely. Everything else pays on every frame.'),

    h2('What about pinning?'),
    p('Pinning is where the two libraries interact most and where the mobile cost is highest.'),
    p('ScrollTrigger pins by taking an element out of flow and adding a spacer, which changes document height — so anything measured before the pin existed is now wrong, and pins are a common cause of the refresh problems above.'),

    p('It also means a pin near the top of a page interacts with everything below it. Pinned sections are best kept few and far apart; several in sequence produce a page whose real height bears no relation to its apparent one, which makes every other position harder to reason about.'),

    h3('Do not pin on small screens'),
    p('A pinned sequence needs vertical room to play out, and a phone does not have it. The scroll-stacking cards on this site behave differently on mobile for exactly this reason — [the desktop cascade needs more height than a 667px screen has](/blog/scroll-stacking-cards), and forcing it produces transitions that silently reverse.'),

    h3('Pin a wrapper, not the thing you are animating'),
    p('Pinning an element and animating the same element means ScrollTrigger is writing transforms to a node you are also writing transforms to. Pin an outer wrapper and animate the child inside it, and the two never collide — this is the fix for roughly half of "the pin jumps at the start" reports.'),

    h3('Prefer sticky where sticky will do'),
    p('CSS `position: sticky` costs no JavaScript, does not change document height, and cannot desynchronise from anything. If the effect is "this stays put while that scrolls past", sticky is the correct tool and ScrollTrigger is overkill.'),

    h2('How do you debug it when it is wrong?'),
    p('Four checks, and the first one resolves most reports because it tells you which library is confused.'),

    h3('Turn the markers on'),
    p('`markers: true` on a trigger draws its start and end lines on the page. If those lines sit where you expect and the animation still fires late, the problem is the Lenis wiring; if the lines themselves are in the wrong place, the problem is measurement and you need a refresh.'),
    code('ts', `
ScrollTrigger.create({ trigger: el, start: 'top 85%', markers: true });
`),

    h3('Disable Lenis and see if the bug survives'),
    p('Comment out the initialisation. If everything fires correctly with native scrolling, you have a wiring problem; if it is still wrong, the trigger configuration was wrong all along and smooth scroll was only making it harder to see.'),

    h3('Log the two positions side by side'),
    p('Print `window.scrollY` and Lenis\'s own value on the same frame. If they diverge and stay diverged, `ScrollTrigger.update` is not being called on every Lenis scroll — which is the single most common cause of everything in this post.'),

    h3('Check the count'),
    p('`ScrollTrigger.getAll().length` after a few navigations should be stable. If it climbs, old triggers are surviving page changes and you are accumulating both a leak and a set of stale positions competing with the live ones.'),
    img('debug-order', 'A sequence of narrowing checks isolating which of two systems is at fault', 'Markers first: they tell you whether the positions are wrong or only the timing is.'),

    h2('How do you keep it fast?'),
    p('Animate the two properties the compositor can handle alone, and be honest about the rest.'),
    table('What costs what, per frame', [
      ['Animating', 'Cost'],
      ['transform, opacity', 'Compositor only — cheap'],
      ['width, height, top, left', 'Layout on every frame — expensive'],
      ['box-shadow, filter, backdrop-filter', 'Repaint, and often a new layer'],
      ['scroll-linked layout changes', 'The most expensive combination available'],
    ]),
    p('Sticking to transform and opacity is most of the performance work. The second row is the trap: animating `height` for an accordion feels natural and forces a layout recalculation on every frame of the animation.'),

    p('The other half of the work is not animating many things at once. Thirty elements each running their own tween is thirty sets of values written per frame; the same visual result from one staggered tween is one timeline the engine can optimise as a unit.'),

    h3('Measure on a real phone, on battery'),
    p('A desktop with a discrete GPU will run almost anything at sixty frames. A mid-range Android on battery saver is where scroll animation actually gets judged, and it is where a `filter` transition drops to fifteen frames a second.'),

    h3('Clean up on navigation'),
    p('This is easy to miss because nothing visibly breaks at first — the page still works, it is just doing more work each time.'),
    p('With view transitions or any client router, triggers from the previous page survive into the next one, holding references to elements that no longer exist. `ScrollTrigger.getAll().forEach(t => t.kill())` before re-initialising is the fix, and forgetting it is a slow memory leak.'),
    quote('Neither library is unreliable. They are both doing exactly what they were told about a number they each believe they own.'),

    h2('What does this cost to set up?'),
    p('An hour for the wiring, and rather more for the discipline around it.'),
    p('The integration is fifteen lines. What takes longer is auditing every animation for reduced motion, deciding initial states in script rather than CSS, batching reveals, keeping pins off small screens, and testing on a real device. That is most of a day on a site with a lot of motion, and it is the difference between motion that reads as considered and motion that reads as a page struggling.'),
    p('The honest counterweight: this is a real dependency for an aesthetic gain. GSAP plus Lenis plus ScrollTrigger is a meaningful amount of JavaScript on the critical path of a site whose content would render fine without any of it. On this site that trade is deliberate — the motion is part of the pitch. On a client project where the brief is "make it fast", I have removed exactly this stack more than once and the pages were better for it.'),

    h2('Conclusion'),
    p('Wire the two libraries in three lines: `lenis.on(\'scroll\', ScrollTrigger.update)`, drive Lenis from GSAP\'s ticker rather than a second animation frame loop, and turn off lag smoothing. Skip the second and you get a permanent one-frame lag that reads as the page being sluggish.'),
    p('Route anchor links through `lenis.scrollTo` with an offset that clears your fixed chrome, mark nested scroll areas with `data-lenis-prevent`, and refresh ScrollTrigger after anything that changes document height — fonts loading is the usual culprit and the one that fires after the page looks finished.'),
    p('Set reveal initial states from JavaScript, never from CSS. Content hidden by a stylesheet and revealed by a script is content that disappears when the script does not run, which is the wrong direction for a failure to point.'),
    p('Batch reveals instead of one trigger per element, play them once, start them before the element reaches the viewport edge, animate only transform and opacity, and keep pinning off small screens where there is no room for it to play out.'),
    p('Then treat reduced motion as an exit rather than a setting: do not initialise Lenis at all, and audit every animation to match. And ask honestly whether the page wants smooth scroll — it overrides a preference the reader has already tuned, and on anything long or primarily read, native scrolling is the better answer. If you have a site where the motion is fighting the reading, [that is usually a quick thing to unpick](/start).'),
  ),
  faqs: faq([
    ['Why do ScrollTrigger animations fire at the wrong position with Lenis?',
     'Because Lenis animates a transform instead of letting the browser scroll, so the native position ScrollTrigger reads is stale. Call ScrollTrigger.update on every Lenis scroll event, and drive Lenis from GSAP\'s ticker so both run on one animation frame loop rather than two that drift apart.'],
    ['Should reduced motion disable smooth scrolling?',
     'It should skip it entirely — do not initialise the library at all, so scrolling is fully native with nothing running per frame. Gentler smoothing is still smoothing. Audit every scroll-driven animation to match, or the preference is honoured in one place and ignored everywhere else.'],
    ['Why do my scroll animations break after images or fonts load?',
     'ScrollTrigger caches each trigger\'s start and end positions, and anything that changes document height afterwards invalidates every position below it. Call ScrollTrigger.refresh() after images load and on document.fonts.ready — font swap is the common cause because it fires late.'],
    ['Is smooth scroll bad for accessibility?',
     'It overrides scroll behaviour people have tuned at the OS level, and content that keeps moving after input stops causes genuine discomfort for some readers. It is defensible on short editorial pages where motion is part of the design, and a poor fit for documentation or anything long.'],
  ]),
};
