import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mobile-card-density/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mobile-card-density',
  slug: 'mobile-card-density',
  title: 'Stop Stacking Cards One Per Row on Mobile',
  category: 'frontend',
  order: 71,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-25',
  series: 'Foundations',
  excerpt:
    'Two-up grids on a 375px screen, the CSS that handles an odd card, and why a page 26 screens long is a design problem rather than a content one.',
  coverLabel: 'Mobile card density — cover',
  body: body(
    p('The default responsive behaviour for a card grid is one column on mobile. It is what every framework does, it is what `auto-fit` gives you, and on a page with six cards it turns a glanceable grid into six screens of scrolling.'),
    p('Two of this site\'s pages were 26 and 18 screens tall on a phone. Not because they had too much content — because every grid had collapsed to a single column and every card had kept its desktop padding.'),
    p('Going two-up brought them to 22 and 13. That is the difference between a page somebody skims and a page they abandon, and it costs a few lines of CSS plus a willingness to make cards shorter.'),

    h2('Why is one column the wrong default?'),
    p('Because it optimises for the individual card at the expense of the set, and the set is what a grid is for.'),
    p('A card grid exists so a reader can compare and choose. One card per row removes the comparison — you see one option at a time and have to hold the previous one in memory. Two-up restores it, and at 375px there is room for two cards of roughly 170px each.'),
    table('The same six cards, two ways', [
      ['', 'One column', 'Two columns'],
      ['Screens to view all six', 'About 3', 'About 1.5'],
      ['Cards visible at once', '1–2', '4'],
      ['Comparison possible', 'From memory', 'Directly'],
      ['Card width at 375px', '~335px', '~170px'],
    ]),
    p('The last row is the objection: 170px is narrow. It is narrow enough that the card has to be honest about what it contains, which turns out to be the real benefit — a two-up grid forces you to cut a card down to what a reader actually needs to choose.'),
    img('one-vs-two', 'The same set of items arranged in a single column and in pairs', 'A grid exists so a reader can compare. One per row means comparing from memory.'),

    h2('What does the CSS look like?'),
    p('Two columns from the smallest width, with a rule for the odd one out.'),
    code('css', `
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

/* An odd final card spans the row rather than sitting alone at half width. */
.card-grid > :last-child:nth-child(odd) { grid-column: 1 / -1; }
`),
    p('That selector is the piece worth remembering. `:last-child:nth-child(odd)` matches an element that is both the last and in an odd position — which is exactly the leftover card in a two-column grid, and only then. Five cards become 2 + 2 + one full-width, which reads as deliberate rather than as a gap.'),

    h3('minmax(0, 1fr), never just 1fr'),
    p('A `1fr` track has an implicit minimum of `auto`, so a long unbroken string inside a card can force the column wider than its share and overflow the grid. `minmax(0, 1fr)` lets the track shrink properly. This is the single most common cause of a grid that scrolls sideways on a phone.'),

    p('Note that this is a deliberate override of the usual `auto-fit` pattern. `repeat(auto-fit, minmax(280px, 1fr))` is the standard responsive grid and it produces exactly the behaviour being argued against: below 280px of available width it collapses to one column, which on a 375px screen with gutters is always. The declaration is doing what it was told; the instruction was wrong for phones.'),

    h3('Three cards, two, and one'),
    p('The same rule scales. Four cards go 2×2 evenly. Three go two plus one full-width. A single card is full width by definition. Nothing needs a special case beyond the odd-child rule.'),

    h2('What has to change about the cards?'),
    p('They have to get shorter, and that is the actual work.'),
    p('A card designed at 340px wide with 24px padding, an 18px title, three lines of description and a footer row becomes very tall at 170px, because everything wraps to twice as many lines. Two-up without redesigning the card gives you a grid of tall thin columns, which is worse than what you started with.'),
    ul([
      '**Reduce padding a step.** Desktop card padding at half the width is a large proportion of the card.',
      '**Shrink the type, within limits.** Titles can drop; body text has a floor of 12px for anything read and 11px for micro-labels.',
      '**Clamp the description** to two lines, or remove it. At 170px a three-line description is six lines.',
      '**Cut the footer.** A date, a read time and a tag is three pieces of metadata competing with the title for the smallest space on the page.',
    ]),
    p('The discipline this imposes is the point. A card that survives 170px is a card that says one clear thing, and that card is better at 340px too.'),

    img('card-diet', 'The same card element reduced to its essential parts', 'Everything wraps to twice as many lines at half the width. The card has to lose weight, not just columns.'),

    h3('Long strings break at narrow widths'),
    p('A bordered pill containing wrapped text looks broken at 170px — the border traces an awkward two-line shape. Tags need `white-space: nowrap` with an ellipsis, and any secondary note moves beneath rather than beside.'),

    p('Clamping a description deserves a specific note because the obvious approach is wrong. A fixed height cuts a line in half; `-webkit-line-clamp` with a line count cuts at a line boundary and adds an ellipsis, which reads as intentional truncation rather than as text disappearing behind an edge. It is well supported despite the prefix, and it is the difference between a card that looks trimmed and one that looks broken.'),

    h3('Keep cards a uniform height where they interact'),
    p('In a plain grid, uneven heights are fine. In anything where cards overlap or stack, a short card fails to cover the one beneath it and the sliver that shows through is exactly what reads as broken — which is why [stacking layouts need a minimum height](/blog/scroll-stacking-cards) rather than natural sizing.'),

    h2('Where does two-up not work?'),
    p('Three cases, and forcing it in them is worse than the column it replaced.'),

    h3('Cards with images that carry information'),
    p('A product photo at 170px is a thumbnail. If the image is how somebody judges the item — a garment, a chart, a screenshot with readable text — halving it removes the reason the card exists. Cards where the image is decorative are unaffected.'),

    h3('Cards with a genuine primary action each'),
    p('Two side-by-side buttons at 170px are two narrow targets adjacent to each other, which is a mis-tap waiting to happen. If each card has its own button, either go full width or make the whole card the target and drop the button.'),

    h3('Long-form content, always'),
    p('This one is not a judgement call and there is no width at which it becomes acceptable.'),
    p('Body copy in two 170px columns is unreadable — roughly 20 characters a line, which is a word or two per line. Density applies to cards you scan, never to text you read.'),
    img('when-not', 'Several card types with differing tolerance for reduced width', 'Density is for things you scan. The moment a card is read rather than compared, the column comes back.'),

    h2('What else makes a mobile page too long?'),
    p('Card grids are the largest single cause and they are not the only one.'),

    h3('Decorative visuals that scale rather than disappear'),
    p('An illustrative mockup beside each service is meaningful at 600px and a small confusing shape at 340px, still costing its full height. Hiding them below a breakpoint recovers a screen per section — and if the home page already shows an equivalent, nothing is lost at all.'),

    h3('Long lists that could be collapsed'),
    p('A feature list of eight items per service, times five services, is forty rows nobody reads on a phone. Putting each inside `<details open>` and closing them only below a breakpoint keeps desktop and no-JS unchanged, keeps everything in the DOM for search, and removes most of the height.'),
    code('ts', `
// Collapse below 640px only. Desktop and no-JS keep the open list.
if (window.matchMedia('(max-width: 640px)').matches) {
  document.querySelectorAll('details.feats').forEach((d) => d.removeAttribute('open'));
}
`),

    h3('Repeated calls to action'),
    p('Each one of them felt justified in isolation, which is exactly how there came to be five of them.'),
    p('A CTA after every section is three screens of buttons on a phone. Two — one early, one at the end — is almost always enough, and the early one matters far more than the count.'),

    img('length-causes', 'Several contributors to excessive page height ranked by their share', 'Grids are the biggest single cause. Decorative visuals and unshrunk rhythm are most of the rest.'),

    h3('Section padding that never shrank'),
    p('Vertical rhythm designed for a desktop is enormous on a phone. This is what [a fluid spacing scale](/blog/fluid-spacing-scale) solves at the token level, and it is often worth two or three screens across a long page.'),

    h2('How do you measure the problem?'),
    p('In screens, because that is the unit the reader experiences.'),
    code('ts', `
// Page height in viewport-screens, at the size that matters.
const screens = document.body.scrollHeight / window.innerHeight;
`),
    p('Run it at your floor device size on every page and you have a list ranked by how bad the problem is. Anything over about fifteen screens is worth looking at; anything over twenty-five is a design problem rather than a content one.'),

    h3('Count the scrolls to the first proof'),
    p('More useful than total length: how far to the first piece of evidence — a project, a number, a logo. On this site that is 1.4 screens by design. If a landing page takes four screens to show anything concrete, the length further down is not the problem.'),

    p('It is worth recording the number before and after any layout change, too. "Twenty-six screens to twenty-two" is a claim anybody can verify, and it makes the case for the work far better than a description of what was tightened. It also protects the change: a later addition that pushes it back to twenty-five is visible rather than gradual.'),

    h3('Compare against the same page on desktop'),
    p('A page that is eight screens on desktop and twenty-six on mobile has a layout problem, not a content problem. The ratio tells you whether to cut content or fix the layout, and the answer is usually the layout.'),
    img('screen-count', 'A page length expressed as a series of viewport-sized units', 'Measure in screens, at your floor device. Anything past twenty-five is layout rather than content.'),

    h2('Which grids on a site actually need this?'),
    p('More than you would guess, and the audit is a five-minute grep rather than a design exercise.'),
    p('On this site the rule applies to eleven distinct grids: the approach cards, the trait cards, the stack templates, the engagement models, the toolbox, the "every build includes" list, the CRO fixes, the service feature lists, the work grid, the post grid and the testimonials. Every one of them was one column on a phone and every one of them is a set of things somebody is comparing.'),

    h3('Find them by their container, not their content'),
    p('Grep the stylesheet for `grid-template-columns` and look at each result at 375px. Anything resolving to a single track is a candidate, and the ones that should stay single-track are obvious immediately — they contain paragraphs rather than items.'),

    h3('Apply it as one rule, not eleven'),
    p('Eleven grids each with their own two-column declaration is eleven places to drift. A single shared rule applied by a class, with the odd-child handling in the same place, means the behaviour is defined once and every grid that opts in gets the leftover-card logic for free.'),

    h3('Watch for grids that are already lists'),
    p('Some single-column layouts are correct: a timeline, a numbered process, anything where order carries meaning and the eye should travel straight down. Two-up breaks the reading order into a zigzag, and for sequential content that is a genuine loss rather than a density win.'),
    img('grid-audit', 'A set of layout containers marked according to whether their contents are compared or read', 'Grep for the containers, then judge by content. The ones that should stay single-column are obvious on sight.'),

    h2('What are the floors you cannot go below?'),
    p('Density has limits and they are not negotiable, because past them the page is dense and unusable.'),
    table('Hard minimums on mobile', [
      ['Property', 'Minimum', 'Why'],
      ['Touch target', '44px', 'Below this, mis-taps rise sharply'],
      ['Body text', '12px', 'Anything read needs to be readable'],
      ['Micro-labels', '11px', 'Chips and column headers only'],
      ['Gap between targets', 'About 8px', 'Adjacent targets need separation'],
    ]),
    p('The touch target minimum is the one people erode first, because a 44px control looks large in a dense layout. It is a physical constraint about fingertips rather than an aesthetic preference, and a control that misses is worse than a page one screen longer.'),

    p('Gap between targets is the one that gets squeezed silently, because it is not a property anybody sets deliberately — it is whatever the grid gap happens to be. Two 44px cards separated by a 4px gap are two correct targets in a configuration where a fingertip covers both, and the tap lands wherever the browser decides.'),

    h3('One documented exception, not several'),
    p('This site allows 10px for bottom tab-bar labels below 400px, because seven tabs cannot hold 12px type at that width and it matches the platform convention. That is a single exception with a stated reason. The moment there are four exceptions, there is no floor.'),

    h2('What does this cost?'),
    p('A day for a site of this size, most of it spent on the cards rather than the grids.'),
    p('Changing the grids is minutes. Redesigning cards to be honest at 170px is the work — deciding what each card actually needs, clamping descriptions, cutting metadata, and checking every one at the floor device. On the two pages here that was most of a day.'),
    p('The honest counterweight: two-up cards are less comfortable than one-up cards. Each is smaller, tighter, and carries less. What you get back is that a reader sees four options instead of one and can compare them without scrolling — and on a page whose job is to help somebody choose, that trade is worth taking. On a page whose job is to be read, it is not.'),
    quote('A card that survives 170px is a card that says one thing clearly. That card is better at full width too.'),

    h2('How do you keep it from regressing?'),
    p('With a number in CI and a habit in review.'),

    h3('Assert page length'),
    p('A budget per page, checked at the floor width, is a single number that describes a whole class of regression.'),
    p('A test that loads each page at 375px and fails when it exceeds a screen budget catches the section somebody added without noticing what it did to the phone. It is the same reasoning as any other gate — a rule that runs is a control.'),

    h3('Review at the floor device, not the laptop'),
    p('Which order you look at things in decides which one gets designed and which one gets patched afterwards.'),
    p('A design reviewed at 1440px and checked at 375px afterwards is a desktop design with a mobile fallback. Reviewing the phone version first inverts that, and it is a habit rather than a tool.'),

    p('The review habit matters more than the test, because the test only catches the aggregate. A single card gaining a badge does not move a page budget by a screen — it moves it by a fraction, four times, over a quarter, and then the budget fails and nobody can point to which change did it.'),

    h3('Watch for the card that grew'),
    p('Cards accumulate: a badge here, a date there, a second line of description. Each addition is defensible and the aggregate is a card twice its intended height. Periodically ask what could be removed rather than only what could be added.'),

    h2('Conclusion'),
    p('Go two-up on phones for anything scanned rather than read. One card per row removes the comparison a grid exists to provide, and it turns six cards into three screens of scrolling.'),
    p('Use `repeat(2, minmax(0, 1fr))` — never bare `1fr`, whose implicit `auto` minimum lets a long string push the track wider and scroll the page sideways. Handle the leftover card with `:last-child:nth-child(odd) { grid-column: 1 / -1 }` so five cards read as 2 + 2 + one wide, not as a gap.'),
    p('Then do the actual work, which is making cards shorter: less padding, clamped descriptions, less metadata, and tags that do not wrap. A card that survives 170px is one that says a single clear thing, and it is a better card at full width too.'),
    p('Know where density does not apply — cards whose image carries the information, cards with their own button, and any long-form text. Density is for scanning; the moment something is read, the single column comes back.'),
    p('Measure page length in screens at your floor device, compare it to the desktop count to tell a layout problem from a content one, and hold the floors: 44px targets, 12px for anything read, 11px for micro-labels, with at most one documented exception. If a page is twenty-six screens on a phone, [that is usually a day and mostly recoverable](/start).'),
  ),
  faqs: faq([
    ['Should card grids be one column on mobile?',
     'Not for cards that are scanned and compared — two-up at 375px shows four cards instead of one and restores the comparison a grid exists for. Keep a single column for long-form text, for cards whose image carries the information, and for cards with their own primary button.'],
    ['How do you handle an odd number of cards in a two-column grid?',
     'Let the leftover span the row: :last-child:nth-child(odd) { grid-column: 1 / -1 }. That selector matches only an element that is both last and in an odd position, so five cards render as two, two and one full-width, which reads as deliberate rather than as a gap.'],
    ['Why does my mobile grid scroll sideways?',
     'Almost always a bare 1fr track. Its implicit minimum is auto, so a long unbroken string inside a card forces the column wider than its share. Use minmax(0, 1fr) so the track can actually shrink to its share of the container.'],
    ['What is the smallest text size acceptable on mobile?',
     '12px for anything read and 11px for micro-labels such as chips and column headers. Touch targets stay at 44px regardless. Allow at most one documented exception with a stated reason — once there are several, there is no floor at all.'],
  ]),
};
