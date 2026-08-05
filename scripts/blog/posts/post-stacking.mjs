import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/scroll-stacking-cards/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-scroll-stacking-cards',
  slug: 'scroll-stacking-cards',
  title: 'Scroll-Stacking Cards That Do Not Reverse on Mobile',
  category: 'frontend',
  order: 75,
  readTime: '12 min read',
  date: 'April 2026',
  publishedAt: '2026-04-17',
  series: 'Foundations',
  excerpt:
    'A sticky cascade needs more height than a phone has, so the last cards pin above their own resting position and the effect silently runs backwards.',
  coverLabel: 'Scroll-stacking cards — cover',
  body: body(
    p('The effect is familiar: cards that stick as you scroll, each one sliding up to cover the last, so a set of items reads as a deck being dealt. It is mostly CSS, it is genuinely nice, and it has a failure mode on phones that is very hard to describe and immediately obvious once seen.'),
    p('The symptom is that near the end of the sequence the transitions appear to run backwards — a card seems to slide out from behind the one above rather than over it. Nothing is animating in reverse. The cards have simply run out of room, and sticky positioning cannot push an element below where it already sits.'),
    p('This is the version running on this site, the mobile fix, and the constraint that makes it work rather than nearly work.'),

    h2('How does the effect work at all?'),
    p('Each card is `position: sticky` with a `top` offset, and the offsets increase down the list so each card stops a little lower than the one before.'),
    code('css', `
.stack-card { position: sticky; }
.stack-card:nth-child(1) { top: 86px; }
.stack-card:nth-child(2) { top: 102px; }
.stack-card:nth-child(3) { top: 118px; }
.stack-card:nth-child(4) { top: 134px; }
`),
    p('As you scroll, card one reaches 86px and stops. The page keeps moving, so card two travels up until it reaches 102px and stops — 16px below card one, leaving a sliver of it visible. The cascade is those accumulated offsets, and the sense of stacking comes from each card covering all but a strip of its predecessor.'),
    p('Nothing here needs JavaScript. A scroll library can add a settle or a scale as cards land, but the mechanic itself is four declarations and the browser does the rest.'),
    img('sticky-cascade', 'A series of elements coming to rest at progressively lower positions', 'Each card stops slightly below the last. The visible strip is what reads as a stack rather than a replacement.'),

    h2('Why does it break on a phone?'),
    p('Because sticky positioning can move an element *up* relative to its flow position, never down.'),
    p('A sticky element sticks when its natural position would put it above its `top` offset. If its natural position is already *below* that offset — because the page is short and the card has not scrolled far enough — sticky does nothing at all, and the card simply flows past.'),
    ol([
      '**On desktop** the cards are spread over a long scroll distance, so by the time card four should pin, its natural position is well above 134px and sticky holds it there.',
      '**On a 667px screen** the whole sequence occupies far less scroll distance. Card four\'s natural position is still below 134px when the reader reaches it, so it never pins.',
      '**The result** is that card three is held and card four slides up past it — which looks exactly like the stack coming apart in the wrong order.'
    ]),
    p('The give-away that this is the cause: it is always the *last* cards that misbehave, and adding more content below the stack sometimes fixes it. Both are symptoms of running out of scroll distance rather than of anything being animated incorrectly.'),

    h3('The offsets themselves make it worse'),
    p('Each additional card raises the pin point by another 16px, so the fifth card needs to travel further before sticky engages than the second did. The cascade that produces the effect on desktop is precisely what exhausts the available height on mobile.'),

    h2('What is the fix?'),
    p('One pin point for every card on small screens. The cascade goes away and each transition becomes identical.'),
    code('css', `
@media (max-width: 900px) {
  .stack-card,
  .stack-card:nth-child(1),
  .stack-card:nth-child(2),
  .stack-card:nth-child(3),
  .stack-card:nth-child(4) { top: 84px; }
}
`),
    p('With every card pinning at the same offset, each one covers its predecessor completely and every transition behaves the same way regardless of position in the list. The deck effect is reduced to a straight replacement, which is the right trade on a screen with no room for the cascade.'),

    h3('Cards must be a uniform height'),
    p('This is the second half of the fix and skipping it produces a subtler version of the same complaint. If card three is shorter than card two, it cannot fully cover it — a strip of the previous card shows below, and that sliver is exactly what reads as "stacking the wrong way".'),
    code('css', `
/* Just above the tallest natural card, so a short one still covers. */
.stack-card { min-height: 350px; }
`),
    p('The number has to come from measurement rather than instinct: find the tallest card at the target width, round up slightly, and set that. Too low and short cards leave slivers; too high and the stack is full of empty space.'),

    p('Both halves of the fix have to be applied for either to help, which is why this is often diagnosed twice. Fixing the pin points alone leaves the sliver problem; fixing the heights alone leaves the cards that never pin. The complaint sounds identical in both cases — "the stacking looks wrong at the end" — so it is worth changing both and checking once rather than iterating on one at a time.'),

    h3('Or stop sticking entirely below a breakpoint'),
    p('The honest alternative is to abandon the effect on phones — cards become an ordinary stacked list. It is less impressive and it cannot go wrong, and on a page where the cards are content rather than showmanship, it is frequently the better call.'),
    img('one-pin', 'Elements coming to rest at a single shared position rather than a descending sequence', 'One pin point, uniform heights. The cascade is what needs room; the covering does not.'),

    h2('What else goes wrong with sticky?'),
    p('Four things, and all of them produce "sticky is not working" reports that are actually about the surrounding layout.'),

    h3('An ancestor with overflow'),
    p('Worth checking first every single time, because it explains the largest share of these reports and takes only seconds to rule out.'),
    p('`overflow: hidden`, `auto` or `scroll` on any ancestor makes sticky position relative to that scroll container rather than the viewport — and if that container does not scroll, the element never sticks. This is the single most common cause, and the culprit is usually an `overflow: hidden` added months earlier to fix a horizontal scrollbar.'),

    img('sticky-blockers', 'Several containing conditions that prevent an element from holding its position', 'All four produce "sticky is not working". None of them are about the sticky element.'),

    h3('The parent is not tall enough'),
    p('A sticky element only sticks within its parent. If the parent ends, so does the stickiness — which is correct behaviour and surprising when the parent is a wrapper that hugs its content.'),

    h3('A transform on an ancestor'),
    p('`transform`, `filter`, `perspective` and `will-change` create a containing block, which changes what `position: fixed` resolves against and can interfere with sticky in ways that are hard to trace. A decorative transform on a section wrapper is enough to do it.'),

    h3('Height constraints on the parent'),
    p('A parent with `height: 100%` or a flex context that stretches children can leave a sticky element with no room to move within. It sticks, briefly, and unsticks immediately.'),

    h2('How much scroll distance does it need?'),
    p('Roughly one viewport height per card, and that is the calculation worth doing before building it.'),
    table('Space required, four cards', [
      ['Viewport', 'Rough distance needed', 'Realistic?'],
      ['1440 × 900', '~3,600px', 'Yes, comfortably'],
      ['768 × 1024', '~4,000px', 'Yes, with content around it'],
      ['375 × 667', '~2,600px', 'Only if the cards are the whole section'],
      ['375 × 667, six cards', '~4,000px', 'No — the effect will break'],
    ]),
    p('The bottom row is the practical limit. Four cards is about the maximum a phone can carry with a cascade, and beyond that the fix above stops being enough because even a single pin point needs each card to have scrolled past the previous one.'),

    p('The distance is not something you set directly — it emerges from the height of the cards and the spacing between them, which is why adding padding to a section can fix or break a stack that nobody touched. If the effect starts misbehaving after an unrelated spacing change, that is the mechanism.'),

    h3('Fewer cards on mobile is a legitimate answer'),
    p('If a desktop stack has six cards, showing four on a phone and linking to the rest is often better than making six work badly. The effect exists to make a set feel considered; a set that misbehaves achieves the opposite.'),

    h2('Where does JavaScript actually help?'),
    p('For polish on top of the CSS, never for the mechanic itself.'),
    p('A settle as each card lands, a slight scale on the one being covered, a progress indicator — these are enhancements a scroll library adds cleanly. What it should not be doing is calculating positions and setting transforms, because that reimplements what sticky already does and reintroduces every measurement problem.'),
    code('ts', `
// Enhancement only. The stack works without any of this.
if (prefersReduced) return;
ScrollTrigger.batch('.stack-card', { onEnter: settle, once: true });
`),

    h3('It must work with the script disabled'),
    p('Since the mechanic is CSS, this is nearly free — but it is worth checking, because a common mistake is setting the cards\' initial state in the stylesheet and animating out of it. Then a failed script leaves the whole section invisible, which is the [wrong direction for a failure to point](/blog/gsap-lenis-smooth-scroll).'),

    h3('Under reduced motion, keep the sticky, drop the extras'),
    p('Sticky positioning is not animation — nothing moves except in response to the reader\'s own scrolling, which is motion they initiated. The settle and scale should go; the stacking itself can stay. That distinction is the same one that applies to [every scroll-driven effect](/blog/prefers-reduced-motion).'),
    img('js-layer', 'A working structural behaviour with an optional refinement above it', 'The mechanic is CSS. Script adds the settle, and the section works without it.'),

    h2('What makes the stack readable rather than clever?'),
    p('Four details that decide whether somebody understands what they are looking at or just notices that something is happening.'),

    h3('Leave a visible strip, not a hairline'),
    p('The offset between pin points is what tells the reader there are cards underneath. At 8px it reads as a rendering artefact; at 16 to 20px it reads as a stack. Below about 12px the effect stops communicating and starts looking like a bug.'),

    h3('Number them, or make the count obvious'),
    p('A reader arriving mid-sequence has no idea whether they are on the second of four or the fourth of six. A small index on each card — or a progress marker beside the stack — turns an ambiguous experience into a legible one, and costs nothing.'),

    h3('Keep each card readable on its own'),
    p('Because only one card is fully visible at a time, each has to make sense in isolation. A card whose meaning depends on the one before it is a card most readers will encounter without context, since scanning past the first is the normal behaviour.'),

    h3('Do not stack more than one kind of thing'),
    p('A stack implies the items are peers. Mixing a service card, a testimonial and a call to action into one sequence tells the reader those are three of a kind when they are not, and the effect actively works against comprehension.'),
    img('legible-stack', 'A sequence of peer items with a consistent visible offset and position indicators', 'The offset is the message. Below about 12px it stops saying "there are more" and starts looking like a defect.'),

    h2('Is the effect worth using?'),
    p('On a page selling something, sometimes. On a page explaining something, rarely.'),
    p('What it buys is a sense that a set of items is one considered thing rather than a list — which is genuinely useful for a small number of related offers, and is the reason this site uses it for its four services on the home page.'),
    ul([
      '**It hijacks scroll pacing.** Several screens of scrolling produce one screen of new content, which is frustrating for anyone scanning.',
      '**It hides content from a quick reader.** Somebody scrolling fast sees the last card and nothing else.',
      '**It costs height,** which is a real problem on the device where height matters most.',
      '**It is hard to link into.** A card in a stack has no stable position, so a deep link to one is awkward.',
    ]),
    p('The first is the strongest objection. A stack is a deliberate slowdown, and slowing a reader is only justified when what they are being slowed for is the point of the page. For four services on a home page, it is. For a documentation section, it is an obstacle.'),

    h3('Never put content only reachable through the stack'),
    p('If each card carries something a reader might need — a price, a feature, a link — that content should also exist somewhere linear. A stack is a presentation of a set, not the only route to it.'),

    h2('How do you test it?'),
    p('At three widths and one speed, and the speed is the part people skip.'),

    h3('Scroll slowly through the whole sequence'),
    p('At the floor device width, scroll a few pixels at a time and watch each transition. The reversal is obvious at this pace and easy to miss at normal speed, when it reads as a general impression that something is off.'),

    img('slow-scroll', 'A sequence examined a few pixels at a time rather than at reading speed', 'At normal speed it reads as a vague impression that something is wrong. A few pixels at a time, it is unmistakable.'),

    h3('Check with the address bar showing and hidden'),
    p('The viewport changes height as mobile chrome slides, which changes how much scroll distance the sequence has. A stack that works after the bar retracts can fail on first load, when it has not.'),

    h3('Check the section boundaries'),
    p('The entry and the exit are where a stack that behaves perfectly well internally can still feel unpolished.'),
    p('What happens immediately before the first card pins and immediately after the last unpins is where jumps show. A stack that behaves internally and lurches on entry is a spacing problem in the surrounding section rather than in the stack.'),

    h3('Try it with one card, and with the maximum'),
    p('Both are states a content editor can produce on their own, without anybody reviewing what it does to the layout.'),
    p('A single card should behave sensibly rather than pinning oddly, and the largest number you support should still have the room. Both are edge cases a CMS will eventually produce.'),
    quote('Nothing is animating backwards. The last card never pinned, because sticky can hold an element up and never push it down.'),

    h2('What does it cost to build?'),
    p('An hour for the effect, and most of a day if you count getting it right on phones.'),
    p('The CSS is four declarations plus a media query. What takes the time is measuring the tallest card to set a minimum height, checking every transition slowly at the floor width, deciding what happens with fewer or more cards, and confirming no ancestor has an overflow or transform that quietly disables the whole thing.'),
    p('The honest counterweight: it is a lot of care for a decorative effect, and the mobile version is a diminished form of it regardless. If the cards are load-bearing content rather than presentation, a plain grid is less work, more scannable, and cannot break — and I would choose it without much hesitation on a page whose job is to inform rather than to impress.'),

    h2('Conclusion'),
    p('The mechanic is `position: sticky` with increasing `top` offsets, and it needs roughly a viewport of scroll distance per card. On a phone that runs out, the last cards never pin because sticky can hold an element up and never push it down, and the result looks exactly like the stack coming apart backwards.'),
    p('Fix it with a single pin point for every card below your breakpoint, so each transition is identical regardless of position. Then give the cards a uniform minimum height measured from the tallest one — a short card cannot fully cover its predecessor, and the sliver that shows through is the same complaint in a subtler form.'),
    p('When sticky simply does not work, look outward rather than at the element: an `overflow` on an ancestor, a parent too short to move within, or a `transform` creating a containing block. The overflow is usually something added months earlier to fix a horizontal scrollbar.'),
    p('Keep JavaScript to polish. The mechanic should work with scripts disabled, initial states should never be set in the stylesheet, and under reduced motion the sticky can stay while the settle goes — nothing moves except in response to the reader\'s own scrolling.'),
    p('Then decide honestly whether the effect earns its place. It is a deliberate slowdown, justified when the thing you are slowing somebody for is the point of the page and an obstacle when it is not. Never make a card the only route to something a reader needs. If you have a stack that misbehaves on phones and cannot pin down why, [it is usually this](/start).'),
  ),
  faqs: faq([
    ['Why do sticky stacking cards look like they reverse on mobile?',
     'Because the sequence has run out of scroll distance. Sticky can hold an element above its flow position but never push it below one, so a card whose natural position is still below its top offset never pins — and the card above it appears to slide out from behind rather than being covered.'],
    ['How do you fix a scroll stack on small screens?',
     'Give every card the same top offset below your breakpoint, so each transition is identical instead of needing progressively more distance. Then set a uniform minimum height from the tallest card, or a short card fails to cover its predecessor and leaves a visible strip.'],
    ['Why is position: sticky not working at all?',
     'Usually an ancestor with overflow hidden, auto or scroll, which makes the element stick to that container instead of the viewport. Also check for a parent too short to move within, or an ancestor with transform, filter or perspective creating a containing block.'],
    ['How many cards can a scroll stack have on mobile?',
     'About four. Each card needs roughly a viewport of scroll distance, so a 667px screen supports four comfortably and starts failing beyond that even with a single pin point. Showing fewer cards on a phone is better than making six behave badly.'],
  ]),
};
