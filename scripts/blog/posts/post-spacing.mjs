import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/fluid-spacing-scale/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-fluid-spacing-scale',
  slug: 'fluid-spacing-scale',
  title: 'A Fluid Spacing Scale That Replaces Ten Breakpoints',
  category: 'frontend',
  order: 65,
  readTime: '12 min read',
  date: 'March 2026',
  publishedAt: '2026-03-23',
  series: 'Foundations',
  excerpt:
    'One clamp per step instead of a media query per component — plus the self-referential custom property that silently flattens a whole stylesheet.',
  coverLabel: 'Fluid spacing scale — cover',
  body: body(
    p('Most stylesheets do not have a spacing system. They have a spacing history: a 48px here because it looked right, a 32px there because 48 was too much on a laptop, and a media query bumping both because neither worked on a phone.'),
    p('It works, and it is unmaintainable in a specific way — nobody can tell you what the spacing rhythm *is*, so every new section is a fresh guess and the guesses drift apart.'),
    p('The fix is a small set of steps that scale themselves with the viewport, so a section has one padding value that is correct at 375px and at 1512px. This site went from ten ad-hoc breakpoint values to four breakpoints and one scale, and here is what that actually involves.'),

    h2('What is the problem with fixed spacing?'),
    p('It forces you to choose a viewport to be right at, and then patch every other viewport with a query.'),
    code('css', `
/* The history version. Three declarations for one idea. */
.section { padding: 80px 0; }
@media (max-width: 900px) { .section { padding: 56px 0; } }
@media (max-width: 640px) { .section { padding: 40px 0; } }
`),
    p('Multiply that by twenty components and you have sixty declarations expressing twenty ideas, plus the certainty that some component was missed and jumps at 640px while its neighbour does not.'),
    p('There is a subtler cost too: the breakpoints become load-bearing. Once forty rules assume 900px, changing it is a project — so the layout ossifies around numbers that were arbitrary when somebody picked them.'),
    img('history-vs-system', 'A set of unrelated values beside a small ordered sequence', 'Not a system — a history. Nobody can tell you what the rhythm is, so every new section is a fresh guess.'),

    h2('How does one clamp replace three declarations?'),
    p('`clamp(min, preferred, max)` gives a value that grows with the viewport and stops at both ends. The middle term does the scaling; the outer two stop it becoming silly.'),
    code('css', `
:root {
  --space-2xs: clamp(6px, 1vw, 10px);
  --space-xs:  clamp(10px, 1.6vw, 16px);
  --space-sm:  clamp(14px, 2.2vw, 24px);
  --space-md:  clamp(22px, 3vw, 32px);
  --space-lg:  clamp(28px, 4vw, 44px);
  --space-xl:  clamp(28px, 6vw, 64px);
  --space-2xl: clamp(40px, 8vw, 88px);
  --space-3xl: clamp(72px, 11vw, 120px);
}
`),
    p('Eight steps, and every gap, padding and margin on the site picks one. `--space-3xl` is 72px on a phone and 120px on a desktop with no media query anywhere, and the transition between them is continuous rather than a jump at some arbitrary width.'),

    h3('The vw term is the whole design'),
    p('Each step needs a different rate of growth. Small gaps should barely change — a 6px gutter inside a chip does not want to become 20px on a large screen — while section rhythm should scale a lot. That is why the `vw` values climb from 1 to 11 rather than being uniform.'),

    p('A worked example: `--space-3xl` is `clamp(72px, 11vw, 120px)`. At 375px, 11vw is 41px, so the minimum holds and you get 72. At 1092px the middle term reaches 120 and the maximum takes over. Between those two widths the value glides, and the two ends are the numbers you actually designed — the middle term only decides how quickly it travels between them.'),

    h3('Set the min from the phone, the max from the desktop'),
    p('Design each step twice: what it should be at 375px, and what it should be at your widest sensible layout. Those become the outer terms, and the middle one is chosen so the curve passes through both roughly where you expect.'),

    h3('Clamp on the value, never a media query on the token'),
    p('The whole benefit is that the token is one number wherever it is read.'),
    p('Redefining `--space-lg` inside a media query defeats the point — you are back to breakpoints, just hidden one level down. If a step needs different behaviour at some width, it is probably two different steps rather than one conditional one.'),

    h2('What is the trap that eats a whole stylesheet?'),
    p('A self-referential custom property. It is invalid, it fails silently, and it takes the entire declaration with it.'),
    code('css', `
/* Invalid. The property is not "the previous value" — it is a cycle, so the
   declaration is dropped and the token becomes its guaranteed-invalid value. */
:root { --section-y: var(--section-y); }
`),
    p('On this site a version of that once flattened every section\'s padding to zero. Nothing errored, no build failed, and the page simply had no vertical rhythm — which looks like a layout bug rather than a token bug, so the search starts in the wrong file.'),
    p('It is worth knowing why it fails so quietly. A cyclic custom property resolves to the guaranteed-invalid value, which behaves like `unset` — so the property is not applied and nothing is reported. Devtools shows the declaration greyed out rather than flagged, which is easy to read as "overridden" rather than "invalid".'),
    p('The rule that avoids it: **a token may reference another token, never itself.** Aliasing across names is fine and useful; `--section-y: var(--space-3xl)` is exactly what aliases are for.'),
    code('css', `
/* Fine — an alias with a meaningful name over a raw step. */
--section-y: var(--space-3xl);
--section-y-tight: var(--space-2xl);
`),

    h3('Never write a bare clamp for spacing'),
    p('The moment a component inlines its own `clamp(24px, 3.4vw, 41px)`, the scale has a member nobody knows about. It will not match anything, it will not update when the scale does, and the next person will add another one beside it. Every value comes from the scale or the scale is wrong.'),
    img('token-cycle', 'A reference pointing back at its own origin, producing nothing', 'A token referencing itself is invalid, silent, and takes the declaration with it. The symptom looks like a layout bug.'),

    h2('How many steps should there be?'),
    p('Between six and eight. Fewer and you start fighting it; more and people pick by trying them.'),
    table('What each end costs', [
      ['Steps', 'Problem'],
      ['3–4', 'Too coarse — components inline their own values to fit'],
      ['6–8', 'The workable range'],
      ['12+', 'Nobody knows the difference between step 7 and step 8'],
    ]),
    p('The test for whether you have the right number: can you name what each step is *for*? On this site `--space-md` is the gap inside a card, `--space-lg` is between related blocks, `--space-2xl` is between sections that belong together, `--space-3xl` is between sections that do not. If two steps share a job, merge them.'),

    img('step-count', 'A short ordered set of gaps beside a much longer one with indistinguishable neighbours', 'If you cannot name what a step is for, it is not a step — it is a value somebody needed once.'),

    h3('Name by size, alias by purpose'),
    p('`--space-lg` is a size and stays stable; `--section-y` is a purpose and can be repointed. Components should reference the purpose where one exists, because that is the layer where a design decision changes — moving section rhythm down a step is then one line rather than forty.'),

    h2('What else belongs in the same system?'),
    p('Three companions, and skipping them means the spacing is systematic while everything around it is not.'),

    h3('The page gutter'),
    p('It is the token most often duplicated by accident, because every component author reaches for one.'),
    p('`--gutter: clamp(20px, 5vw, 40px)` is the inset from the viewport edge, and it must be one value used everywhere. A section with its own inset is the thing that makes a page look subtly misaligned when you scroll past it.'),

    h3('Layout primitives, not repeated padding'),
    p('Three classes cover almost everything: a full-bleed band that supplies rhythm plus gutter, a centred column with gutter, and a centred column inside a band. Once those exist, a page is composition rather than a hundred padding declarations.'),
    code('css', `
.section { padding-block: var(--section-y); padding-inline: var(--gutter); }
.shell   { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--gutter); }
.wrap    { max-width: var(--maxw); margin-inline: auto; }
`),

    p('The distinction between the last two is worth getting right because it causes most of the double-gutter bugs. `.shell` supplies its own inset and is used on its own; `.wrap` assumes a `.section` around it has already supplied one. Nesting a `.shell` inside a `.section` gives you the gutter twice, and the symptom is a column that looks slightly narrow on one page and correct on every other.'),

    h3('Modifiers instead of inline overrides'),
    p('Sections that need less rhythm get `.section-tight`; ones that butt against a neighbour get `.section-flush-top`. The moment somebody writes `style="padding-top: 40px"` the system has a hole, and holes are where drift enters. If you reach for an inline value, the missing thing is a modifier.'),
    img('primitives', 'Three composable layout shells covering the common page structures', 'Three primitives and a set of modifiers. A page becomes composition rather than a hundred padding declarations.'),

    h2('Does this replace breakpoints entirely?'),
    p('No, and claiming it does is where fluid-everything advice goes wrong.'),
    p('Fluid values handle *magnitude* — how much space, how big the type. They cannot handle *arrangement*: a three-column grid becoming one column, a rail appearing, a decorative visual being dropped because it no longer fits. Those are structural changes and they need a query.'),
    ul([
      '**Fluid handles:** padding, gaps, margins, font sizes, section rhythm.',
      '**Breakpoints handle:** column counts, showing and hiding, direction changes, anything where the layout is a different layout.',
    ]),
    p('The win is not zero breakpoints — it is *few* breakpoints, each doing something structural. This site went from ten ad-hoc values to four (480 / 640 / 768 / 900), and every one of those four changes an arrangement rather than a number.'),

    p('There is a practical benefit to that reduction beyond tidiness. Four breakpoints is a number you can actually test at — four widths to check per page, and you have covered every arrangement the layout has. Ten ad-hoc values means no realistic testing pass covers them all, so some combination is always unverified.'),

    h3('Container queries are the missing third tool'),
    p('Viewport units are wrong for a component that appears in both a wide main column and a 250px rail — the same card gets desktop-sized padding in a narrow container. Container queries size a component by its own space, which is what you actually wanted. Use them for reusable components and keep `vw` for page-level rhythm.'),

    h2('Does type get the same treatment?'),
    p('Yes, and it is the same technique with two extra constraints that matter more than they do for spacing.'),
    code('css', `
/* Reading type, sized for a long article rather than a control label. */
.post-body { font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem); }
`),

    h3('Use rem in the outer terms, not px'),
    p('A clamp whose minimum is `16px` ignores a reader who has raised their browser font size, because `px` does not respond to it. `1rem` does. For spacing this is a preference; for type it is an accessibility requirement, and it is the single most common mistake in fluid-type snippets.'),

    h3('Include a rem term in the middle, not pure vw'),
    p('`0.95rem + 0.25vw` scales with the viewport *and* respects the root size. A pure `vw` middle term means zooming does nothing to your text, which breaks a browser feature people rely on.'),

    h3('Watch what the unit is measuring'),
    p('A `ch`-based measure looks like the right way to cap a text column and is not, quite: `ch` is the width of the digit zero, which in Inter is 0.63em — so a 68ch column measures about 86 characters. Set reading measures in rem, check the real character count, and adjust.'),

    h3('Headings and body want different curves'),
    p('Body type should move very little between a phone and a desktop; display headings can move a lot. Giving them the same growth rate produces either headings that are timid on large screens or body text that balloons — which is the type equivalent of using one `vw` value for the whole spacing scale.'),
    img('type-curves', 'Two size ranges growing at visibly different rates across the same span', 'Display type can travel; reading type should barely move. One curve for both gets one of them wrong.'),

    h2('How do you migrate an existing stylesheet?'),
    p('In one pass, mechanically, and it is less frightening than it sounds.'),
    ol([
      '**Inventory every spacing value.** A grep for `padding`, `margin` and `gap` gives the list. It is always shorter than expected — usually a dozen distinct numbers pretending to be forty.',
      '**Cluster them into six to eight groups.** Values within a few pixels of each other were the same intention with different typing.',
      '**Define the scale from the clusters,** setting min and max from what those values were on small and large screens.',
      '**Replace, then delete the media queries.** Most spacing-only queries disappear entirely — that is where the line count goes.',
      '**Sweep for survivors.** Grep for `px` in padding and margin, and for bare `clamp(`. Anything left is either deliberate or a miss.',
    ]),
    p('The satisfying part of step four is how much simply goes. A stylesheet where half the media queries existed only to adjust padding loses them all, and what remains is the queries that were doing structural work — which is a much clearer file to read.'),

    p('Do it as one commit rather than incrementally, too. A stylesheet halfway between two systems is worse than either — reviewers cannot tell an intentional exception from an unconverted leftover, and the migration stalls there indefinitely.'),

    h3('Do it before the site is large, or accept it takes a day'),
    p('Retrofitting is mechanical but it touches everything, so it needs a careful visual pass afterwards at several widths. On a site of this size that is a day including the checking. Doing it at the start costs an hour and the hour is the same hour you would have spent guessing values.'),
    quote('The point is not that the numbers are fluid. It is that a stranger can read the stylesheet and tell you what the rhythm is.'),

    h2('How do you stop it drifting afterwards?'),
    p('With a check that runs, because a spacing system decays one reasonable exception at a time and nobody notices the fourth.'),
    table('Three gates, cheapest first', [
      ['Gate', 'Catches', 'Cost'],
      ['Grep in CI for px in padding/margin', 'The obvious escapes', 'Ten minutes to write'],
      ['Grep for bare clamp( outside the token file', 'Values pretending to be system', 'Same rule, one more pattern'],
      ['A review question: which step is this?', 'Everything the greps miss', 'Free, and needs a person'],
    ]),
    p('The first two are worth adding the day the scale exists rather than the day it breaks. An allowlist handles the genuine exceptions — border widths, the 44px touch minimum, a `1px` rule — and everything else fails the build with a message naming the file.'),

    h3('Document what each step is for, next to the tokens'),
    p('Four lines of comment above the scale saying which step is a card gap and which is section rhythm is the difference between a system people use correctly and one they guess at. It is the cheapest documentation in a codebase and the most consulted.'),

    h3('Treat a new value as a design question'),
    p('When somebody genuinely needs a gap between two steps, the answer is almost never "add a step" — it is that one of the two neighbouring steps is right and the composition around it is off. Adding steps to satisfy individual cases is how a scale of eight becomes a scale of fifteen that nobody trusts.'),
    img('drift-gates', 'Successive filters catching progressively subtler deviations from a standard', 'A scale decays one reasonable exception at a time. Two greps catch most of them before review has to.'),

    h2('What does it look like when it is working?'),
    p('Four signs, all observable.'),
    ul([
      '**No `px` in padding or margin** outside borders and a few deliberate exceptions like touch-target minimums.',
      '**Spacing-only media queries are gone.** The remaining queries change arrangement.',
      '**New sections need no spacing decisions.** You pick `.section` or `.section-tight` and it is right.',
      '**Resizing the window is continuous.** Nothing jumps at a width, because nothing is waiting for one.',
    ]),
    p('It is also what makes a scale survive contact with a second person. A stranger reading the stylesheet can see the rhythm, and [a system nobody has to reconstruct](/blog/reusable-design-system) is the only kind that lasts past its author.'),
    p('The third is the real payoff and the hardest to appreciate until you have it. Adding a section stops involving any judgement about vertical rhythm, which removes both the decision and the chance of getting it slightly different from the section above — the same benefit as [deciding a stack once](/blog/project-stack-templates) rather than per project.'),

    h2('Conclusion'),
    p('Define six to eight steps as clamps and make every gap, padding and margin pick one. Each step needs its own growth rate — small gaps barely change, section rhythm scales a lot — so the `vw` term climbs across the scale rather than staying uniform.'),
    p('Alias by purpose over the raw sizes. `--section-y: var(--space-3xl)` gives you one line to change when section rhythm needs adjusting, instead of forty. A token may reference another token and never itself — a self-referential custom property is invalid, fails silently, and flattens the declaration to nothing.'),
    p('Never inline a bare `clamp()` in a component. The moment one exists, the scale has a member nobody knows about, it will not track the system, and the next person adds another beside it.'),
    p('Add the companions: one page gutter used everywhere, three layout primitives, and modifiers instead of inline overrides. Once those exist, laying out a page is composition rather than a hundred padding declarations.'),
    p('Keep breakpoints for arrangement — column counts, showing and hiding, direction changes — and let fluid values handle magnitude. The goal is four structural breakpoints rather than ten numeric ones. And reach for container queries on components that appear in both a wide column and a narrow rail, where viewport units give the wrong answer by construction. If you have a stylesheet that has become a spacing history, [that migration is a well-defined day](/start).'),
  ),
  faqs: faq([
    ['How many spacing steps should a design system have?',
     'Six to eight. Fewer and components inline their own values because nothing fits; more and nobody can tell step seven from step eight. The test is whether you can name what each step is for — if two share a job, merge them.'],
    ['Does fluid spacing remove the need for breakpoints?',
     'No. Fluid values handle magnitude — how much padding, how big the type. Breakpoints handle arrangement: column counts, showing and hiding, direction changes. The goal is few breakpoints each doing something structural, not zero.'],
    ['Why did my custom property stop working?',
     'Check for self-reference. A declaration like --x: var(--x) is a cycle, so it is invalid and dropped silently — no error, no build failure, just a token resolving to nothing. The symptom looks like a layout bug, which sends the search to the wrong file.'],
    ['When should you use container queries instead of vw?',
     'For any component that appears at more than one width — a card in both a wide main column and a 250px rail. Viewport units give it desktop padding inside a narrow container. Keep vw for page-level rhythm, where the viewport genuinely is the relevant measure.'],
  ]),
};
