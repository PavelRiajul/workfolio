import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mobile-hero-viewport/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mobile-hero-viewport',
  slug: 'mobile-hero-viewport',
  title: 'Why 100vh Puts Your CTA Underneath the Nav',
  category: 'frontend',
  order: 69,
  readTime: '12 min read',
  date: 'April 2026',
  publishedAt: '2026-04-02',
  series: 'Foundations',
  excerpt:
    'svh, dvh and lvh explained by what breaks, plus the fixed bottom bar that no viewport unit knows about and the shorter lede a phone actually needs.',
  coverLabel: 'Mobile hero viewport — cover',
  body: body(
    p('A full-height hero is one of the oldest patterns on the web and it is still, on a phone, one of the easiest to get wrong. The symptom is always the same: the primary call to action sits just below the fold, or worse, underneath a piece of fixed chrome.'),
    p('There are two separate causes and they need separate fixes. One is that `100vh` on a mobile browser is not the height of what you can see. The other is that no viewport unit knows about your own fixed navigation, because you put it there.'),
    p('Both matter here more than most places: this site is built mobile-first because [most of its traffic arrives on a phone](/blog/mobile-card-density), much of it from cold outreach, and that traffic gives you seconds.'),

    h2('What is wrong with 100vh?'),
    p('On mobile it is the height of the viewport with the browser chrome *retracted* — a state the page is often not in when it first paints.'),
    p('Mobile browsers hide the address bar as you scroll down and show it again as you scroll up, so the visible area changes size during a session. Rather than reflow the page continuously, `vh` was pinned to the largest possible viewport. The result is that a `100vh` hero on first load is taller than the screen by roughly the height of the address bar.'),
    table('The four viewport height units', [
      ['Unit', 'Refers to', 'Behaviour'],
      ['vh', 'Largest viewport', 'Static — chrome retracted'],
      ['lvh', 'Largest viewport', 'Same as vh, explicitly named'],
      ['svh', 'Smallest viewport', 'Static — chrome expanded'],
      ['dvh', 'Current viewport', 'Changes as chrome shows and hides'],
    ]),
    p('`svh` is the useful default for a hero: it assumes the browser chrome is showing, which is the state on first paint, so nothing is pushed off-screen at the moment that matters most.'),

    h3('dvh sounds right and usually is not'),
    p('`dvh` tracks the live viewport, which means a `100dvh` section resizes every time the address bar slides. Anything sized against it reflows mid-scroll — text reflows, layouts jump, and any scroll-triggered position measured earlier is now wrong. Reserve it for elements that genuinely must fill the current view, like a full-screen overlay.'),

    p('There is a second reason to avoid `dvh` on flowing content that is easy to overlook: the resize happens *while the reader is scrolling*, which is the worst possible moment. Text they were reading shifts under their eyes, and on a page with any scroll-linked animation the trigger positions were measured against a viewport that no longer exists.'),

    h3('Use svh for layout, dvh for overlays'),
    p('That split covers nearly every case. Static sections get `svh` so they are correct at first paint and never resize; things that sit above the page and must cover it exactly get `dvh` and accept the reflow, because nothing is flowing around them anyway.'),
    img('viewport-units', 'The same section measured against differing definitions of available height', 'vh assumes the chrome is hidden. On first paint it usually is not, which is where the overflow comes from.'),

    h2('What about your own fixed chrome?'),
    p('No viewport unit knows about it, because it is your element rather than the browser\'s.'),
    p('This site has a bottom tab bar — a floating pill on desktop, a full-width bar on mobile — that is `position: fixed`. A hero sized to `100svh` fills the viewport correctly and then the tab bar sits on top of its last 64 pixels, which is exactly where the primary button was.'),
    code('css', `
/* Sized to the space above the fixed bar, not to the viewport. */
.hero {
  min-height: calc(100svh - var(--tabbar-h) - env(safe-area-inset-bottom));
}
`),
    p('Two subtractions, both necessary. The tab bar height is a token so the calculation cannot drift from the component, and `env(safe-area-inset-bottom)` accounts for the home indicator on devices that have one — without it the bar sits correctly and the *content* still ends underneath a system gesture area.'),

    img('chrome-subtraction', 'A viewport with a persistent strip removed from its usable area', 'The unit measures the viewport. The bar is yours, so the subtraction has to be too.'),

    h3('Safe area insets need the right viewport meta'),
    p('`env()` values are zero unless the document opts into drawing behind the system UI with `viewport-fit=cover` in the viewport meta tag. Without it the insets silently evaluate to nothing and the calculation quietly loses a term.'),

    h3('Any fixed chrome counts'),
    p('And it compounds — two fixed elements at the same edge subtract twice, which is how a hero that was correct becomes wrong after an unrelated feature ships.'),
    p('A cookie banner, a promotional strip, a sticky header — each one reduces the usable height and none of them are in a viewport unit. If it is fixed and it overlaps content, its height belongs in the calculation, and it belongs there as a token rather than a number typed twice.'),

    h2('How do you know content follows?'),
    p('A full-screen hero has one genuine drawback: it looks like the whole page. Nothing about it says there is more.'),
    p('On a desktop, a scrollbar answers that. On a phone there is no scrollbar until you scroll, so the affordance has to be in the design — usually a chevron or a subtle cue at the bottom edge.'),
    code('css', `
.hero::after { content: ''; /* chevron, gently animated */ }

@media (prefers-reduced-motion: reduce) {
  .hero::after { display: none; }   /* honest absence beats a frozen pose */
}
`),
    p('Hiding it under reduced motion rather than freezing it is deliberate. A static arrow that was designed to move reads as a rendering fault, and [an honest absence is better than a frozen pose](/blog/prefers-reduced-motion).'),

    p('Whatever the cue is, it should sit at the bottom edge of the hero rather than floating in the middle of the remaining space. A hint positioned centrally reads as part of the composition; one at the boundary reads as pointing past it, which is the whole job.'),

    h3('Or simply do not fill the screen'),
    p('The most reliable affordance is a hero that ends slightly above the fold, letting the top of the next section peek in. It removes the ambiguity entirely and costs nothing but the commitment to a full-bleed look — which is worth weighing honestly, because a full-screen hero is a design preference and a visible next section is a usability one.'),

    h2('What actually belongs in a mobile hero?'),
    p('Less than fits, and it is a different set from the desktop version rather than a smaller one.'),
    p('The whole pitch has to survive in a screen and a half. On this site the primary call to action lands at about half a screen and the first project at 1.4 screens — those are targets, checked, not accidents.'),
    ul([
      '**One headline** that says what this is. Not a tagline that needs the subhead to make sense.',
      '**A short lede** — genuinely shorter, not the desktop sentence with an ellipsis.',
      '**One primary action.** A second competes with it; a third is decoration.',
      '**Nothing decorative that costs height.** The 3D card stack on this site is hidden below 900px because it pushed everything important off the screen.',
    ]),

    h3('Write a separate short lede, do not truncate'),
    p('A truncated sentence is a worse sentence. The mobile lede should be its own piece of copy that stands alone, with the fuller version rendering on wider screens — which means it is a content field rather than a CSS problem, and it belongs in the CMS beside the full one.'),

    p('The single-action rule is the one designers push back on hardest and it is the one with the clearest evidence behind it. Two buttons of equal weight ask the reader to choose before they know enough to choose, and the usual outcome is neither. If a secondary path genuinely matters, make it a text link — visibly subordinate, still available.'),

    h3('Drop the duplicates rather than shrinking them'),
    p('Mobile layouts accumulate elements that repeat something already visible — an availability chip below a hero that already has one, a scroll hint beside a chevron. Shrinking those keeps the clutter and makes it illegible; removing them buys real height. Ask what each element adds that is not already on screen.'),
    img('mobile-hero-budget', 'A limited vertical allowance allocated across a small number of elements', 'A screen and a half is the whole budget. Everything in it should be earning its height.'),

    h2('Which decorative pieces should just go?'),
    p('The ones whose value is proportional to how much room they have — which is most visual flourish.'),
    p('The 3D hero scenes on this site are hidden below 900px, not scaled down. A perspective card stack at 340px wide is neither impressive nor informative; it is a small confusing shape that cost the reader the first thing they should have seen.'),

    h3('Hidden is better than shrunk'),
    p('The test is whether the small version still does the job the large one was doing. In my experience it almost never does, and the height it costs is unchanged.'),
    p('Scaling a complex visual down usually preserves the height cost and loses the effect. If the point of an element is impact and it has no room to have impact, removing it is the honest call.'),

    p('The same reasoning applies to anything whose job is atmosphere — a background video, a particle field, an animated gradient. On a phone these cost bandwidth and battery on the device least able to spare either, and they occupy the screen where the pitch should be. Hiding them below a breakpoint is usually a straight improvement rather than a compromise.'),

    h3('Keep it in the DOM only if it is content'),
    p('`display: none` removes an element from the accessibility tree as well as the layout, which is correct for decoration and wrong for anything a crawler or a screen reader should have. If it carries meaning, it needs a mobile form rather than removal.'),

    h2('How do you actually test this?'),
    p('On a real phone, and specifically on the smallest one you care about.'),
    ol([
      '**Pick a floor device.** This site is audited at iPhone SE, 375×667 — small enough that anything working there works nearly everywhere.',
      '**Test on first paint, before scrolling.** The bug lives in the initial state, and scrolling once hides it by retracting the chrome.',
      '**Check with the address bar showing and hidden.** They are different heights and the layout should be correct in both.',
      '**Rotate.** Landscape on a phone is a very short viewport, and a `100svh` hero there is a hero taller than the screen with almost nothing in it.',
    ]),
    p('The second is the one devtools makes easy to miss. An emulated viewport has no address bar behaviour at all, so `vh` and `svh` are identical there and the bug is invisible until it reaches a device.'),

    img('device-vs-emulator', 'The same layout behaving differently in a simulated and an actual environment', 'An emulated viewport has no address bar behaviour, so svh and vh look identical and the bug stays invisible.'),

    h3('Landscape deserves its own rule'),
    p('At 667×375 a full-height hero is 375px tall and mostly empty, with the headline and button crammed together. Capping the minimum height in short viewports — or dropping the full-height treatment entirely below some height — is usually the right answer.'),
    code('css', `
@media (max-height: 500px) {
  .hero { min-height: auto; padding-block: var(--space-xl); }
}
`),

    h2('What should the fold actually contain?'),
    p('There is no single fold any more, but there is a budget, and treating it as a measurable target beats treating it as a feeling.'),
    table('Positions worth measuring, in screens', [
      ['Element', 'Target', 'Why'],
      ['Headline visible', '0', 'It is the entire first impression'],
      ['Primary CTA', 'Under 1', 'Reachable without a decision to scroll'],
      ['First proof — work, logo, number', 'Around 1.4', 'Arrives on the first deliberate scroll'],
      ['Second CTA', 'Around 3', 'For readers convinced by the proof'],
    ]),
    p('These are positions you can actually check: load the page at your floor device size, scroll in whole-screen increments, and note where each lands. If the primary action is at 1.8 screens, something above it is too tall — and the measurement tells you that without anyone needing an opinion.'),

    h3('Measure it, do not eyeball it'),
    p('A quick script that reports each key element\'s offset divided by viewport height turns a design argument into a number. It also catches regressions: an added chip or a longer headline moves everything below it, and nobody notices until the numbers move.'),

    h3('The fold is a budget, not a boundary'),
    p('People scroll happily when they have a reason to. The goal is not cramming everything above an imaginary line — it is that what is visible gives them the reason. A page that shows a headline and half a sentence has not earned the scroll, however much is waiting underneath.'),
    img('fold-budget', 'Key elements plotted against successive screen heights', 'These are checkable positions, not a feeling. When something above grows, everything below moves.'),

    h2('What else does fixed chrome break?'),
    p('Three things beyond the hero, all of which produce reports that sound unrelated.'),

    h3('Anchor targets land underneath it'),
    p('Reported as "the link goes to the wrong place", which sends the investigation somewhere unhelpful.'),
    p('A jump to `#section` puts that heading at the top of the viewport, which is behind a sticky header. `scroll-margin-top` on the target is the fix, and it should be a token so every anchor clears the same chrome.'),

    h3('The last section ends under the bar'),
    p('It only shows up on the one page long enough to actually reach the bottom of, which is exactly why it survives review.'),
    p('Bottom-fixed chrome overlaps the end of the document, so the footer\'s final row is unreachable. Padding the page bottom by the bar height plus the safe-area inset is the whole fix and it is easy to forget on exactly one page.'),

    h3('Fixed elements hide behind the keyboard'),
    p('Opening a keyboard shrinks the visible viewport, and a bottom-fixed bar either rides above it or is covered by it depending on the browser. On a page with a form, check what happens with a field focused — a submit button that vanishes under the keyboard is a form nobody completes.'),

    h3('Everything fixed competes for the same corners'),
    p('A chat bubble, a back-to-top button and a cookie banner all default to the bottom right. On this site the WhatsApp button stays hidden until the reader is past the hero — at the top it covered a hero stat, and the hero already has its own call to action, so it was competing with the thing it was meant to support.'),
    img('fixed-chrome', 'Several persistent elements occupying the same edges of a screen', 'Everything fixed defaults to the same corners. The hero has its own action, so the floating one can wait.'),

    h2('What does getting this right buy?'),
    p('The one screen that decides whether anything else gets read.'),
    p('Cold traffic on a phone gives you a few seconds. If the first thing visible is a headline, a sentence and a button, the page has made its case. If it is a headline, a decorative visual, and a button hidden behind a tab bar, it has not — and no amount of quality further down recovers that, because nobody scrolled.'),
    p('The honest counterweight: mobile-first constraints do cost the desktop design something. A hero built to work at 375px, then given room, is rarely as striking as one designed at 1440px and adapted down. That is a real trade and the argument for taking it is traffic composition — if most visitors are on a phone, the phone version is the design and the desktop one is the variant.'),
    quote('The bug is not that 100vh is wrong. It is that no unit knows about the bar you added yourself.'),

    h2('Conclusion'),
    p('Use `svh` rather than `vh` for anything full-height. `vh` measures the viewport with the browser chrome retracted, which is not the state on first paint, so a `100vh` hero starts taller than the screen by about the height of the address bar.'),
    p('Reserve `dvh` for overlays. It tracks the live viewport, so a section sized in it resizes every time the address bar slides — reflowing text and invalidating any position measured earlier.'),
    p('Then subtract your own chrome, because no viewport unit knows about it. Size the hero to `calc(100svh - var(--tabbar-h) - env(safe-area-inset-bottom))`, keep the bar height as a token so it cannot drift, and remember `env()` is zero without `viewport-fit=cover`.'),
    p('Give the reader a reason to believe there is more — a chevron, or simply a hero that stops short of filling the screen. Hide the cue under reduced motion rather than freezing it; a static arrow designed to move reads as broken.'),
    p('Write a genuinely shorter mobile lede rather than truncating, drop duplicated elements instead of shrinking them, and hide decorative visuals that need room to work rather than scaling them into small confusing shapes. Then test on a real device at first paint, before scrolling, and in landscape — because an emulated viewport has no address bar behaviour and the bug is invisible there. If a page is losing people on the first screen, [that is usually quick to diagnose](/start).'),
  ),
  faqs: faq([
    ['What is the difference between vh, svh, dvh and lvh?',
     'vh and lvh both measure the largest viewport, with browser chrome retracted. svh measures the smallest, with chrome showing. dvh tracks the current viewport and changes as chrome slides. Use svh for layout so sections are correct at first paint, and dvh only for overlays.'],
    ['Why is my CTA hidden behind the navigation on mobile?',
     'Because no viewport unit accounts for your own fixed chrome. Size the hero to calc(100svh - var(--tabbar-h) - env(safe-area-inset-bottom)) so it fills the space above the bar rather than the whole viewport, and keep the bar height as a token so the two cannot drift apart.'],
    ['Should a mobile hero fill the whole screen?',
     'Only if you add an affordance that content follows — a chevron, or a hero that stops just short so the next section peeks in. A full-screen hero on a phone has no scrollbar to signal more, so it can read as the entire page.'],
    ['Why do env() safe-area insets evaluate to zero?',
     'Because the document has not opted into drawing behind system UI. Add viewport-fit=cover to the viewport meta tag, or every env() inset resolves to zero and any calculation using one silently loses that term.'],
  ]),
};
