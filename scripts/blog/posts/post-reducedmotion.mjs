import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/prefers-reduced-motion/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-prefers-reduced-motion',
  slug: 'prefers-reduced-motion',
  title: 'Respecting prefers-reduced-motion Properly',
  category: 'frontend',
  order: 64,
  readTime: '12 min read',
  date: 'March 2026',
  publishedAt: '2026-03-20',
  series: 'Foundations',
  excerpt:
    'The global override that misses half your animations, why animation does not inherit, and how to check a whole site in ten minutes.',
  coverLabel: 'Reduced motion — cover',
  body: body(
    p('Almost every site that claims to support reduced motion has the same three lines in it: a universal selector, `animation-duration: 0.01ms`, `!important`. It looks thorough. It misses a great deal.'),
    p('What it misses is everything not driven by CSS — scroll libraries, the Web Animations API, autoplaying video, carousels on timers — and it misses the fact that `animation` does not inherit, so killing it on a parent does nothing to the children doing the actual moving.'),
    p('This site is heavy on motion by design: GSAP reveals, smooth scroll, a mascot that roams the page on its own. Making all of it stop properly took an audit rather than a snippet, and here is what that involved.'),

    h2('Who is asking, and for what?'),
    p('People who get sick from motion on screens. That is the plain version, and it reframes the whole thing from a preference to be accommodated into a symptom to be avoided triggering.'),
    p('Vestibular disorders, migraine, motion sensitivity and some concussion recovery all make large or unexpected movement genuinely unpleasant — nausea and dizziness rather than mild annoyance. The setting exists at the operating system level, and someone who has turned it on has done so deliberately.'),
    table('What is uncomfortable, and what is not', [
      ['Effect', 'Problematic?'],
      ['Large translation across the viewport', 'Yes — the main offender'],
      ['Parallax and scroll-linked movement', 'Yes'],
      ['Scale, zoom, perspective shifts', 'Yes'],
      ['Continuous loops in peripheral vision', 'Yes'],
      ['Opacity fades', 'Usually fine'],
      ['Colour transitions', 'Fine'],
      ['Small movements under 5px', 'Usually fine'],
    ]),
    p('Direction and size both matter within that. A 4px settle on a card is nothing; the same easing applied across 400px of viewport is the thing people describe as making them feel unwell. When judging an effect, the useful question is how far something travels relative to the screen, not how elaborate the animation is.'),
    p('That bottom half matters, because "reduced" does not mean "none". Removing every transition makes an interface feel abrupt and can hide state changes that motion was communicating. The goal is to remove the movement that causes trouble, not to freeze the page.'),
    img('what-hurts', 'Several kinds of change ranked by how much positional movement each involves', 'Distance travelled is the thing to remove. A fade is not what anybody turned the setting on for.'),

    h2('Why does the universal reset miss things?'),
    p('Three reasons, and each accounts for a different category of survivor.'),

    h3('animation does not inherit'),
    p('Killing animation on a container does nothing to the elements inside it, because `animation` is not an inherited property. A universal selector `*` does reach every element — but scoped rules like `.card { animation: none }` reach only that element.'),
    p('This is exactly how a caret kept blinking inside an otherwise-frozen card on this site. The reduced-motion block named the card; the caret was two levels down with its own keyframes, and it carried on. **Every looping animation has to be named individually**, or you are relying on a selector that does not reach it.'),

    p('It is also the reason a site can pass a quick visual check and still be full of movement: the elements you thought to name are the ones you were already looking at.'),

    h3('JavaScript does not read your stylesheet'),
    p('GSAP writing inline transforms, the Web Animations API, a carousel on a `setInterval`, a scroll library animating a transform — none of them consult CSS. A `@media (prefers-reduced-motion)` block has no opinion about a library that sets `style.transform` sixty times a second.'),

    h3('The reset is a lie about what happened'),
    p('Which matters more than it sounds, because the failures it produces are silent.'),
    p('`animation-duration: 0.01ms !important` does not prevent the animation — it runs it instantly. Anything relying on an animation *event* still fires, anything with a fill mode still applies its end state, and infinite animations now run their whole cycle thousands of times a second, which is worse for the CPU than letting them play.'),
    code('css', `
/* The common snippet. Useful as a floor, not as the implementation. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`),
    p('Keep it as a safety net for anything you missed. Do not treat it as the answer.'),

    h2('How do you do it properly in CSS?'),
    p('Name the animations, remove distance rather than time, and keep the fades.'),
    code('css', `
@media (prefers-reduced-motion: reduce) {
  /* Every looping animation, named — the parent rule will not reach these. */
  .hv-card, .marquee-track, .bl-ed-body .caret, .mascot-blob { animation: none; }

  /* Keep the transition, remove the travel. State changes stay legible. */
  .card:hover { transform: none; }
  .reveal { opacity: 1; transform: none; }

  /* Decorative affordances that only exist to move. */
  .hero::after { display: none; }
}
`),
    p('The second block is the part people skip. A button that lifts 2px on hover can keep its colour transition and lose the lift; killing the whole transition instead makes the interface feel broken and removes a signal that something is interactive.'),

    img('named-loops', 'A containing element marked as still while a smaller element inside it continues moving', 'A rule on the parent does not reach the child. The survivor is always two levels down.'),

    h3('Write it as opt-in where you can'),
    p('`@media (prefers-reduced-motion: no-preference)` puts the animation behind the preference rather than removing it afterwards. The default state is then the calm one, and motion is the enhancement — which is the right direction, and means a new animation cannot be forgotten in the audit because it was never unconditional.'),
    code('css', `
@media (prefers-reduced-motion: no-preference) {
  .toc a { transition: color .18s ease; }
}
`),

    h3('Scroll behaviour is part of this'),
    p('It is one line and it is skipped constantly, because nobody thinks of a jump to an anchor as an animation.'),
    p('`scroll-behavior: smooth` on the document is motion the reader did not ask for, and it applies to every anchor jump. Under the preference it should be `auto`.'),

    h2('How do you do it in JavaScript?'),
    p('Check once, and branch at the highest level you can — ideally by not starting the thing at all.'),
    code('ts', `
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSmoothScroll() {
  if (prefersReduced) return;   // no library, no rAF loop, nothing per frame
  lenis = new Lenis({ /* ... */ });
}
`),
    p('Returning early beats configuring gentler motion. A smooth-scroll library set to a shorter duration is still intercepting the wheel and still animating a transform on every frame — it is quieter, not absent, and quieter is not what the setting asked for.'),

    h3('The mascot is the clearest case'),
    p('It is the most obviously optional thing on the site, which makes it the easiest place to see the rule.'),
    p('This site has an autonomous animated character that wanders around the page, leaps onto things and spins. Under reduced motion it does not roam at all — no travel loop, no interactions, no idle acts. A click still produces a single hop, because a deliberate response to a deliberate action is a different thing from ambient movement in the corner of the eye.'),
    p('That distinction is the useful principle: **motion the reader initiated is generally fine; motion that happens to them is not.**'),

    p('There is a subtler version of the same mistake in reveal animations. Skipping the entrance but leaving the trigger wired means the element still waits for a scroll event before appearing — so on a page the reader never scrolls, content that should be visible immediately is not. Under the preference the correct move is to set the final state up front and never create the trigger at all.'),

    h3('Do not cache the value forever'),
    p('People change the setting mid-session, particularly if your page is what made them want to. `matchMedia` returns a list you can listen to, and honouring a change without a reload is a few lines.'),
    code('ts', `
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
mq.addEventListener('change', (e) => { if (e.matches) stopEverything(); });
`),
    img('js-branch', 'A decision point placed before a system starts rather than inside it', 'Return before you start. A gentler animation is still an animation running on every frame.'),

    h2('What still needs to move?'),
    p('Removing motion indiscriminately loses information, and a few things are genuinely worse without it.'),
    table('Motion that is doing a job', [
      ['Motion', 'What it communicates', 'Reduced version'],
      ['Focus ring appearing', 'Where the keyboard is', 'Instant, never removed'],
      ['A panel opening', 'Where the content came from', 'Fade, no slide'],
      ['A toast arriving', 'Something new needs attention', 'Fade in place'],
      ['Progress or loading', 'The system is working', 'Pulse or text, no spin'],
      ['A validation error', 'This field, not that one', 'Colour and icon, no shake'],
    ]),
    p('The pattern in the right-hand column is the same each time: keep the signal, drop the travel. A drawer that fades in still tells you a drawer appeared; one that slides 400px across the viewport tells you the same thing and costs somebody their afternoon.'),

    h3('Never remove a focus indicator to satisfy this'),
    p('Focus rings sometimes have a transition, and stripping transitions globally can catch them. The ring itself must always appear — reduced motion is about how it arrives, never whether it does. This is the one place where "instant" is unambiguously correct.'),

    h3('Do not remove the affordance with the animation'),
    p('A chevron that bounces to say "there is more below" is doing real work on a full-screen hero. Under the preference this site hides it rather than freezing it mid-bounce — a static arrow that was designed to move reads as a rendering fault, and an honest absence is better than a frozen pose.'),
    img('signal-vs-travel', 'A change conveyed by two different means, one involving displacement and one not', 'Keep the signal, drop the travel. The message survives; the movement is what causes trouble.'),

    h2('What about video, GIFs and carousels?'),
    p('The category most often forgotten, because none of it looks like "animation" in a stylesheet.'),
    ul([
      '**Autoplaying video** is continuous motion with no off switch. Under the preference, do not autoplay — show the poster frame and a play control.',
      '**Animated GIFs and looping WebP** cannot be paused by CSS at all. Serve a static image and let the reader opt in, or use a `<video>` you can actually control.',
      '**Carousels on a timer** are unexpected movement by definition. Stop the auto-advance and leave the manual controls.',
      '**Animated favicons and loading spinners** are small but continuous, and continuous peripheral motion is exactly the problem.',
    ]),
    p('There is a browser-level wrinkle worth knowing: some platforms already pause animated images when the setting is on, and some do not. Relying on that is relying on the reader\'s particular browser, so serve the static version yourself rather than assuming it has been handled — the same reasoning as [not trusting a client\'s claim](/blog/signed-upload-urls) anywhere else.'),
    p('The spinner case is worth a moment: a busy indicator genuinely communicates something, so removing it entirely is a loss. A pulsing opacity or a static "Loading…" both work and neither rotates.'),

    h2('How do you check a whole site?'),
    p('Turn the preference on and use the site normally — then check the four places it hides.'),
    ol([
      '**Emulate it in devtools.** Rendering panel, "Emulate CSS prefers-reduced-motion". Faster than changing the OS setting each time.',
      '**Scroll every page slowly, top to bottom.** Anything that moves is a finding. Slowly, because a fast scroll hides short animations.',
      '**Hover and focus every interactive element.** Buttons, cards, nav items, form fields. Lifts and slides live here and are easy to miss.',
      '**Wait on each page for thirty seconds.** Looping animations, carousels and idle behaviours only reveal themselves if you stop and watch.',
    ]),
    p('The fourth is the one that finds the caret-style bugs. Nothing about a static screenshot tells you that something in the corner is blinking every 1.2 seconds, and nobody notices while clicking around.'),

    p('It is worth doing this on a real device as well as in devtools, because two of the categories only exist there: a video that autoplays under a mobile browser\'s own rules, and momentum scrolling that a desktop emulation never exercises.'),

    h3('Automate the part that can be'),
    p('A script that walks the pages with the preference emulated and lists elements with a non-`none` computed `animation-name` turns a manual sweep into a report. It will not catch JavaScript-driven transforms, but it catches every CSS animation that escaped a selector.'),
    code('ts', `
// With the preference emulated, anything still animating is a finding.
const still = [...document.querySelectorAll('*')].filter((el) => {
  const a = getComputedStyle(el).animationName;
  return a && a !== 'none';
});
`),

    h3('Screenshots lie about motion'),
    p('It catches people out on exactly the audit where they are most likely to reach for one.'),
    p('This is worth knowing generally: a headless browser capturing an actively animating, filter-composited layer renders it pale or translucent, so screenshot diffs are unreliable for exactly this work. `getComputedStyle` is the source of truth when debugging motion — the picture is not.'),
    img('audit-sweep', 'A systematic pass over several surfaces with attention held on each', 'The thirty-second wait is what finds the loops. Clicking through at speed never does.')  ,

    h2('Should you offer your own toggle?'),
    p('Usually not, and the reasoning is worth being clear about because it comes up in most design reviews.'),

    h3('The OS setting is already the answer'),
    p('Someone with a motion sensitivity has almost certainly turned it on system-wide, precisely so they do not have to hunt for a control on every site. Adding your own toggle asks them to do the work again, on your terms, and only helps if they find it — which is after the page has already moved.'),

    h3('Where a toggle does earn its place'),
    p('On a site whose motion is unusually heavy — a scroll-driven narrative, a WebGL scene — a visible control is a kindness for people who did not set the OS preference but are finding this particular page difficult. Default it from `matchMedia`, persist the override, and make sure the preference still wins for anyone who has set it.'),

    h3('If you build one, put it near the motion'),
    p('A toggle in a settings page three clicks away is decorative. In the footer at minimum, and on a page with a full-screen animated hero, near the hero — the person who needs it needs it immediately, not after finding your preferences panel.'),
    img('toggle-placement', 'A control positioned adjacent to the thing it governs rather than in a distant panel', 'If a toggle exists, it has to be reachable before the motion has already happened.'),

    h2('What does this cost?'),
    p('A day on a motion-heavy site, and almost nothing if you write it as opt-in from the start.'),
    p('Retrofitting means finding every animation, deciding for each whether it is distance or decoration, naming the loops individually, branching every JavaScript feature, and doing the manual sweep. On this site that was a real day of work, with the mascot alone taking a couple of hours because "does not roam" is a different code path rather than a flag.'),
    p('Written as opt-in — motion inside `no-preference` blocks, JavaScript features returning early at the top — it costs close to nothing, because the calm version is what you built first and the motion is the addition. That is the whole argument for doing it that way round.'),
    p('The honest counterweight: it does constrain design. Some of the most effective things you can do with a page are large scroll-linked movements, and building those means building a second, still version that has to hold up on its own. That is real extra work and it is not always obvious how to do it well — the answer is usually that the still version should be a good layout rather than a broken animation, which takes a bit of thought per effect.'),
    quote('Motion the reader initiated is usually fine. Motion that happens to them is what the setting is asking you to stop.'),

    h2('What does good look like?'),
    p('Four properties, and they are all checkable.'),
    ul([
      '**Nothing moves without input.** No loops, no autoplay, no idle behaviour, no scroll-linked travel.',
      '**Every state change is still legible.** Colour and opacity transitions survive so the interface does not feel dead.',
      '**No content is hidden.** Anything revealed by an animation is visible by default — otherwise the still version loses information.',
      '**Nothing is running.** No animation frame loops, no timers, no library intercepting the wheel. Not quieter — not there.',
    ]),
    p('The third is the one that silently fails. A reveal implemented as `opacity: 0` in CSS with a script animating it up leaves that content invisible forever when the animation is disabled — the same failure mode as [setting reveal states in the stylesheet](/blog/gsap-lenis-smooth-scroll) generally, and the reason initial states belong in script.'),

    h2('Conclusion'),
    p('Keep the universal reset as a floor, and do not mistake it for the implementation. It runs animations instantly rather than preventing them, it cannot touch anything driven by JavaScript, and scoped versions of it do not reach children because `animation` is not inherited.'),
    p('Name every looping animation individually in the reduced-motion block. The one that survives is always two levels below the element you named — a caret, a marquee track, a pulse on a badge.'),
    p('Remove distance, not time. A hover that lifts 2px should lose the lift and keep its colour transition; killing every transition makes the interface feel broken and hides state changes that motion was carrying.'),
    p('In JavaScript, branch before you start rather than configuring gentler motion — a smooth-scroll library with a shorter duration is still intercepting the wheel on every frame. Cover the things that do not look like animation too: autoplaying video, looping GIFs, timed carousels, spinning favicons.'),
    p('Then audit by turning the preference on and *waiting* on each page, because loops are invisible to anyone clicking through at speed. Best of all, write it as opt-in from the start — put motion inside `no-preference` and the calm version is the one you cannot forget to build. If you have a motion-heavy site and want it checked properly, [that is a well-defined afternoon](/start).'),
  ),
  faqs: faq([
    ['Is the universal animation reset enough for reduced motion?',
     'No. It runs animations instantly rather than preventing them, so fill modes still apply and animation events still fire, and it cannot touch anything driven by JavaScript — scroll libraries, the Web Animations API, timed carousels. Keep it as a safety net, not as the implementation.'],
    ['Should reduced motion remove all animation?',
     'No — reduced is not none. Remove travel: large translations, parallax, scale and continuous loops. Keep opacity and colour transitions, which are rarely a problem and carry state changes. Stripping everything makes an interface feel abrupt and hides feedback motion was providing.'],
    ['Why does my animation still run inside a reduced-motion block?',
     'Because animation is not an inherited property, so a rule on a parent does not reach its children. Every looping animation has to be named individually — the survivor is usually two levels down, like a blinking caret inside an otherwise-frozen card.'],
    ['How do you test prefers-reduced-motion?',
     'Emulate it in devtools rendering settings, then scroll each page slowly, hover every interactive element, and wait thirty seconds on each page. The wait is what finds looping animations; clicking through quickly never does. Screenshot diffs are unreliable for motion work.'],
  ]),
};
