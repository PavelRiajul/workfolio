import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/wcag-contrast-audit/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-wcag-contrast-audit',
  slug: 'wcag-contrast-audit',
  title: 'The Contrast Audit That Found 300 Failing Elements',
  category: 'frontend',
  order: 66,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-20',
  series: 'Foundations',
  excerpt:
    'One grey token failed AA across an entire site. How to find that, why the same grey passes on white and fails on a panel, and how to stop it recurring.',
  coverLabel: 'Contrast audit — cover',
  body: body(
    p('The muted grey on this site used to be `#9a9a9a`. It looked correct — light, quiet, exactly the weight a secondary label wants. Against white it measures 2.81:1, and the minimum for body text is 4.5:1.'),
    p('That single token was used by roughly three hundred elements. Every caption, every meta line, every helper text, every card subtitle on every page failed at once, and nothing about looking at the site told me so.'),
    p('That is the thing worth understanding about contrast: it is not a per-element problem you fix by eye. It is a property of about four tokens, and fixing those fixes everything downstream.'),

    h2('What do the numbers actually require?'),
    p('Three thresholds, and knowing which applies to what is most of the work.'),
    table('The thresholds that matter', [
      ['Content', 'AA minimum', 'AAA'],
      ['Body text under 18.66px, or under 24px bold', '4.5:1', '7:1'],
      ['Large text — 18.66px+, or 24px+ bold', '3:1', '4.5:1'],
      ['Icons and interface controls carrying meaning', '3:1', '—'],
      ['Focus indicators', '3:1 against adjacent colours', '—'],
      ['Purely decorative graphics', 'No requirement', '—'],
    ]),
    p('The large-text exemption is more generous than people assume and it is where a lot of design gets rescued: a 20px heading in a mid grey can pass at 3:1 where the same grey fails as a 14px caption. It also means a caption is the hardest thing on your page to get right, which is the opposite of where attention usually goes.'),
    p('The row people miss entirely is icons. An icon that carries meaning on its own — a status dot, a warning triangle, an arrow that is the only indication a card is a link — needs 3:1 like any other control. A decorative icon beside a text label does not.'),
    img('thresholds', 'Several content types placed against their differing minimum requirements', 'A caption is the hardest thing on the page to get right, and it is where the least attention goes.'),

    h2('Why does the same grey pass and then fail?'),
    p('Because contrast is a relationship between two colours, and most audits only check one of them.'),
    p('`#767676` on white is 4.54:1 — the lightest grey that clears AA, which is why it is the value this site settled on. Put the same text on a `#f4f4f5` surface panel and it drops to 4.13:1 and fails. Nothing changed about the token; the background moved.'),
    code('css', `
/* AA on white at 4.54:1 — and below it on any tinted panel. */
--color-grey-3: #767676;

/* So muted text on a surface uses the next step up. */
.panel .muted { color: var(--color-grey-2); }
`),
    p('This is the rule that has to be written down somewhere people will read it, because it is invisible in the token definition itself. A token is not "accessible" — a *pairing* is.'),

    h3('Every surface needs its own safe pairs'),
    p('Enumerate the backgrounds you actually use — white, the surface grey, the dark band, the blue accent — and for each one record which text tokens are allowed on it. Four backgrounds and four text greys is sixteen combinations, of which perhaps nine are usable, and the list takes twenty minutes to produce.'),

    p('Semi-transparent colours are the version of this that defeats most tooling. A grey set with an alpha channel has no fixed ratio at all — it composites with whatever is behind it, so the same declaration passes over white and fails over a photograph two sections down. Either use opaque values for text, or measure every background it can land on.'),

    h3('Watch the ones that only exist in one place'),
    p('Dark bands are the usual offender: a light grey chosen for white will be far too bright inverted, and a body grey chosen for a dark band is unreadable on white. Those need their own tokens rather than reuse.'),

    h2('How do you find every failure at once?'),
    p('Programmatically, against the rendered page. Reading the stylesheet cannot tell you what is actually behind an element.'),
    code('ts', `
// Walk every element with text, compare its computed colour against the
// nearest non-transparent background above it, and report anything under
// its threshold. Run against the built pages, not the design file.
const failing = [...document.querySelectorAll('*')].filter((el) => {
  if (!el.textContent?.trim() || el.children.length) return false;
  const s = getComputedStyle(el);
  const size = parseFloat(s.fontSize);
  const large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
  return contrast(s.color, effectiveBg(el)) < (large ? 3 : 4.5);
});
`),
    p('The two details that make this work are `effectiveBg` walking up until it finds a non-transparent background, and skipping elements with children so you measure leaf text rather than counting a paragraph three times.'),

    h3('Group by token, not by element'),
    p('Three hundred findings is unactionable; four tokens is a morning. Map each failure back to the CSS variable producing the colour and the list collapses immediately — that is the whole reason this is worth automating rather than clicking through an extension.'),

    p('Run it against the built output rather than the dev server, and against every route rather than a sample. Contrast failures cluster in the components that appear on one page each — a résumé header, a pricing table, a case-study callout — precisely because those got less attention than the shared ones.'),

    h3('Browser tooling is for spot checks'),
    p('Devtools shows a contrast ratio in the colour picker and Lighthouse flags a sample. Both are useful and neither is exhaustive: Lighthouse checks what it happened to sample, so a passing score means very little about the rest of the page.'),
    img('token-rollup', 'Many individual findings collapsing back to a handful of shared origins', 'Three hundred findings is unactionable. The same three hundred rolled up to four tokens is a morning.'),

    h2('What do you do about the elements you cannot fix?'),
    p('Decide honestly whether they carry information, and mark the ones that do not.'),
    p('This site has low-contrast text inside its decorative mockups — the fake browser chrome, the illustrative dashboards, the code-preview panels. Those are pictures of interfaces, not interfaces, and their labels are `aria-hidden` for exactly that reason.'),
    ul([
      '**If it conveys something**, it must pass. No exceptions worth making.',
      '**If it is genuinely decorative**, hide it from assistive technology and stop treating it as text.',
      '**If you are unsure**, it conveys something. The uncertainty is the answer.',
    ]),
    p('The dishonest version of this is marking real content decorative to clear a report. The test: if the element were removed entirely, would a reader lose anything? If yes, it is content and the colour has to change.'),

    h2('What breaks when you fix it?'),
    p('The design gets heavier, and pretending otherwise is why these fixes get reverted.'),
    p('Darkening every muted grey by a step makes a page busier — secondary text stops receding, and a layout tuned so the eye lands on the heading first now competes with itself. That is a real cost and it needs designing around rather than absorbing.'),

    p('It is also worth being clear that the audit is not the design. A page can clear every ratio and still be a wall of undifferentiated text, which is a worse reading experience than the failing version was. Fixing contrast without redesigning hierarchy trades one problem for another and it is why these changes get quietly reverted a month later.'),

    h3('Recover hierarchy with size and weight'),
    p('Contrast is one of three ways to make text recede, and the other two are free. A caption at 13px in a darker grey reads as secondary through size; a label at 500 weight beside a 600 heading reads as secondary through weight. Lean on those and the darker colour stops mattering.'),

    h3('Use space instead of lightness'),
    p('Separation does much of the work colour was doing. More room around a group, or a hairline rule, tells the eye "this is a different thing" without needing the text to be faint.'),

    h3('Do not fix it by shrinking the text'),
    p('Text under 18.66px needs 4.5:1 and above it needs 3:1, so making type *larger* relaxes the requirement. Going the other way — shrinking a label so it looks quieter — makes the threshold stricter at the same time as making it harder to read, which is the wrong move twice.'),
    img('hierarchy-tools', 'The same information de-emphasised three different ways', 'Colour is one of three levers. The other two cost nothing and do not fail an audit.'),

    h2('What about the blue?'),
    p('Accent colours are where the most confident mistakes live, because a brand colour feels non-negotiable.'),
    p('This site uses `#2563eb` for links and accents. On white that is 5.17:1 — fine for body text. As white text *on* that blue it is 4.06:1, which fails for small text and passes for large, so a small button label in white on brand blue is a failure that looks completely normal.'),
    code('css', `
/* Passes as link text on white. Fails as small white text on a blue fill. */
--color-blue: #2563eb;
`),
    p('The usual fix is a second, darker shade used only for fills behind small text. That is not a compromise of the brand — it is the same recognition that [a token is not accessible, a pairing is](/blog/reusable-design-system), applied to the one colour people are least willing to change.'),

    img('accent-two-uses', 'One colour serving as text on a light field and as a field behind light text', 'The same blue in two roles with two different requirements. Passing one says nothing about the other.'),

    h3('Never let colour be the only signal'),
    p('A link that is identified only by being blue disappears for anyone who cannot separate it from the surrounding text. Underline links in body copy — this is a separate requirement from contrast and it is failed constantly by designs that pass every ratio.'),

    h2('What does the ratio not tell you?'),
    p('Quite a lot, and treating 4.5:1 as the finish line is how a technically compliant page ends up hard to read anyway.'),
    table('Passing, and still difficult', [
      ['Situation', 'Ratio says', 'Reality'],
      ['Thin weight at a large size', 'Passes at 3:1', 'Hairline strokes disappear on a low-density screen'],
      ['Light text on a dark background', 'Same number both ways', 'Reads heavier — often needs a lighter weight'],
      ['Saturated colour on saturated colour', 'Can pass', 'Vibrates uncomfortably regardless'],
      ['Long paragraph at exactly 4.5:1', 'Passes', 'Tiring over hundreds of words'],
    ]),
    p('The second row is the one that catches people building a dark section. Contrast maths is symmetrical and perception is not: the same pairing inverted looks bolder, so type on dark usually wants to drop a weight to feel equivalent. A dark band using the identical weights as the light page always looks slightly shouty.'),

    h3('Aim above the minimum for anything long'),
    p('4.5:1 is a floor for a compliance test, not a target for a 2,500-word article. Body copy sitting comfortably above it — 7:1 or better where the design allows — is noticeably less tiring, and costs nothing but a slightly darker grey.'),

    h3('Check on a bad screen, in bad light'),
    p('Everything passes on a calibrated display in a dim room. A cheap laptop at half brightness outdoors is the honest test, and it will show you that a technically compliant caption is unreadable in the conditions a lot of people actually use.'),
    img('beyond-ratio', 'Two pairings with identical measured values but visibly different legibility', 'The number is symmetrical. Perception is not — the same pairing inverted reads heavier.'),

    h2('How do you stop it coming back?'),
    p('A check that runs, because contrast regresses through entirely reasonable individual decisions.'),
    ol([
      '**Put the ratio in the token comment.** `--color-grey-3: #767676; /* 4.54:1 on white — do not lighten */` is one line and it stops the change at the moment somebody considers it.',
      '**Record the allowed pairings** beside the tokens: which text colours are permitted on which surfaces.',
      '**Run the audit script in CI** over the built pages, failing on any regression. This is [the same argument as any other gate](/blog/ci-pipeline-typecheck-tests) — a rule that runs is a control.',
      '**Check new components against the surface they sit on**, not against white, because that is the assumption that produces the panel failures.',
    ]),
    p('The first is the highest-value line in the whole list. The reason a grey gets lightened is always that someone looked at it in isolation and thought it was heavy; a comment stating the measured ratio answers that thought in place.'),

    h2('What does the audit actually cost?'),
    p('A morning to find everything, a day to fix and redesign around it, and close to nothing if the tokens were measured when they were chosen.'),
    p('The finding is fast once scripted. The expensive part is the design work after: re-tuning hierarchy on pages that relied on faintness, deciding which decorative elements are genuinely decorative, and adding the second accent shade. On this site that was most of a day, and about half of it was hierarchy rather than colour.'),
    p('The honest counterweight: some of what you lose is real. A very light grey does something specific — it recedes completely — and no combination of size and weight replicates that exactly. What you get in exchange is a site that is readable in sunlight, on a bad screen, and by people whose vision is not yours, which is a considerably larger group than it is comfortable to assume.'),
    quote('Contrast is not a hundred small mistakes. It is three or four token decisions, made once, that every element inherits.'),

    h2('What about the states, not just the resting colour?'),
    p('Every interactive element has four or five appearances and audits usually check one of them.'),

    h3('Hover is frequently lighter than rest'),
    p('A link that lightens on hover is a link whose most-used state is its least readable one. If the hover is doing something visually, make it darker or add an underline rather than fading toward the background.'),

    h3('Visited links get forgotten entirely'),
    p('Browsers restyle visited links unless you say otherwise, and the default purple against your background is nobody\'s decision. Either style it deliberately at a passing ratio or set it to match the unvisited colour.'),

    h3('Error and success text carries the most meaning'),
    p('A red that reads as a warning at 18px often fails at the 13px an inline field error actually uses — and it is the single worst place for text somebody cannot read, because it is the moment they are already stuck. Check validation copy at its real size.'),

    h3('Selected and active states in navigation'),
    p('A tab marked current only by a slightly different grey is failing twice: too little contrast against its neighbours, and colour as the only signal. Weight, a rule or a background solves both at once.'),
    img('state-matrix', 'One control shown across its several appearances, one visibly weaker than the rest', 'Four or five appearances per control, and the audit usually checked one. Hover is often the lightest.'),

    h2('Where do the failures actually cluster?'),
    p('Five places, in the order I find them.'),

    h3('Placeholder text in form fields'),
    p('Two failures at once, since a placeholder-as-label also vanishes the moment somebody starts typing.'),
    p('Browser defaults are very light, and a placeholder standing in for a label is content. Style it explicitly and never use it as the only label.'),

    h3('Disabled controls'),
    p('Technically permitted to fail, and still worth fixing.'),
    p('Exempt from the requirement, and still usually too faint to read. A disabled button nobody can read is a button nobody can tell is disabled rather than broken.'),

    h3('Text over images'),
    p('This is the one that fails after launch rather than during the audit, because the failing image had not been uploaded yet.'),
    p('The ratio changes with the photograph, so it can pass on one image and fail on the next. A scrim or a solid panel behind the text is the only reliable answer.'),

    h3('Meta and caption rows'),
    p('The largest cluster by a wide margin, on almost every site I have audited.'),
    p('Dates, read times, categories, figure captions — small, grey, everywhere, and subject to the strictest threshold. This is where the three hundred were.'),

    h3('Focus indicators'),
    p('The one nobody sees, because auditing is done with a mouse.'),
    p('Needs 3:1 against what it sits on, which a default blue ring often fails against a blue button. Test the focus state on every surface, not just the default one.'),

    h2('Conclusion'),
    p('Treat contrast as a token property, not an element property. Three hundred failures on this site were four token decisions, and finding that out took a script rather than an afternoon of clicking.'),
    p('Remember that a token is not accessible — a pairing is. The lightest grey that clears AA on white fails on a tinted panel, so enumerate your surfaces and record which text colours are allowed on each. That list is twenty minutes and it prevents the whole category.'),
    p('Write the measured ratio into the token comment. The reason a grey gets lightened again is always somebody looking at it in isolation and finding it heavy, and a comment answers that at the moment it occurs.'),
    p('When the design feels heavier afterwards, recover hierarchy with size, weight and space rather than reaching back for lightness — and never by shrinking text, which tightens the threshold and hurts readability at the same time.'),
    p('Check the accent separately: a brand blue that passes as link text on white frequently fails as small white text on a blue fill, and the fix is a second darker shade for fills. Then put the audit in CI over the built pages, and check the five clusters — placeholders, disabled states, text over images, meta rows and focus rings — because that is where it comes back. If you want a site checked properly rather than sampled, [that is a well-defined morning](/start).'),
  ),
  faqs: faq([
    ['What contrast ratio does text need to pass WCAG AA?',
     '4.5:1 for body text, and 3:1 for large text — 18.66px and up, or 24px and up when bold. Icons and controls that carry meaning on their own also need 3:1, as do focus indicators against whatever they sit on. Purely decorative graphics have no requirement.'],
    ['Why does the same grey pass on white but fail on a panel?',
     'Because contrast is a relationship between two colours and the background moved. #767676 is 4.54:1 on white and 4.13:1 on a light surface panel. A token is not accessible on its own — a pairing is, so record which text colours are allowed on which surfaces.'],
    ['How do you audit contrast across a whole site?',
     'Script it against the rendered pages: walk every leaf element with text, compare its computed colour against the nearest non-transparent background above it, and apply the right threshold for its size and weight. Then group findings by token — hundreds of elements collapse to a handful of decisions.'],
    ['Can low-contrast decorative text be exempt?',
     'Only if it is genuinely decorative — a label inside an illustrative mockup, for instance — in which case hide it from assistive technology too. The test is whether a reader would lose anything if the element vanished. If you are unsure, treat it as content.'],
  ]),
};
