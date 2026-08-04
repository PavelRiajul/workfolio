import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/reusable-design-system/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-reusable-design-system',
  slug: 'reusable-design-system',
  title: 'A Design System Small Enough That People Use It',
  category: 'frontend',
  order: 68,
  readTime: '13 min read',
  date: 'September 2026',
  publishedAt: '2026-09-22',
  series: 'Foundations',
  excerpt:
    'Tokens, four primitives and a rule about inline styles. What to build, what to skip, and the signs a system has quietly stopped being used.',
  coverLabel: 'Reusable design system — cover',
  body: body(
    p('Most design systems fail the same way. They are built thoroughly, documented properly, and then somebody needs a card that is slightly different at 4pm on a Thursday. They write it inline. The next person copies that. Six months later the system describes a site that no longer exists.'),
    p('The failure is not usually discipline. It is that the system was built to be complete rather than to be *easier than the alternative* — and a system that is more work than writing the CSS yourself will lose that comparison every time.'),
    p('This is what I actually build, which is much smaller than the word "system" suggests: a set of tokens, four layout primitives, and a rule about where values are allowed to come from.'),

    h2('What is the smallest thing that counts?'),
    p('Three layers. Anything beyond them is optional and most of it is optional for longer than people expect.'),
    table('The three layers, in build order', [
      ['Layer', 'Contains', 'Changes'],
      ['Tokens', 'Colour, spacing, type, radius, line', 'Rarely, and everything follows'],
      ['Primitives', 'Layout shells, stack helpers, measure caps', 'Almost never'],
      ['Components', 'Cards, buttons, chips, form controls', 'Constantly'],
    ]),
    p('The order matters because each layer is built from the one above. Components that reference raw values instead of tokens are components that cannot be restyled, and the whole point of the exercise is that a colour change is one line rather than a search.'),
    p('Most systems that collapse under their own weight collapsed in the third row — a component library trying to anticipate every variation, which is both endless and the part that changes most.'),
    img('three-layers', 'Three stacked levels with the upper ones feeding the lower', 'Each layer is built from the one above it. The bottom one changes constantly, which is why it should be the thinnest.'),

    h2('What goes in the token layer?'),
    p('Values with names, and nothing that is not reused.'),
    code('css', `
:root {
  /* Colour — one accent, three greys, two surfaces. Not a palette of forty. */
  --color-ink: #0a0a0a;
  --color-grey-1: #4b4b4b;
  --color-grey-2: #6b6b6b;
  --color-grey-3: #767676;   /* 4.54:1 on white — do not lighten */
  --color-surface: #f4f4f5;
  --color-blue: #2563eb;

  --line: rgba(10,10,10,.08);
  --maxw: 1180px;
}
`),
    p('Six colours. Not a generated ramp of ten steps per hue, because ninety percent of a generated ramp is never used and its presence invites people to reach for shade 300 when the system meant grey-2.'),

    h3('Name by role where the role is stable'),
    p('`--color-blue` is a value; `--color-accent` is a role. Roles are better when the value might change and worse when it will not — a portfolio with one brand colour forever gains nothing from the indirection, while a product that might rebrand gains a lot. Pick deliberately rather than by convention.'),

    h3('Put the constraint in the comment'),
    p('The `4.54:1 on white — do not lighten` beside the grey is the highest-value character in that file. Someone will look at that grey in isolation, decide it is heavy, and lighten it — and the comment answers that thought at the exact moment it occurs. [Contrast lives in about four tokens](/blog/wcag-contrast-audit), so four comments protect it.'),

    h3('Tokens may reference tokens, never themselves'),
    p('Aliasing is the mechanism that makes a system adjustable: `--section-y: var(--space-3xl)` means the rhythm changes in one line. A token referencing *itself* is invalid CSS, fails silently, and drops the declaration entirely — which looks like a layout bug rather than a token bug and is [genuinely painful to find](/blog/fluid-spacing-scale).'),

    h2('Which primitives are worth having?'),
    p('Four, and they cover the overwhelming majority of layout.'),
    code('css', `
.section { padding-block: var(--section-y); padding-inline: var(--gutter); }
.shell   { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--gutter); }
.wrap    { max-width: var(--maxw); margin-inline: auto; }
.stack-md { margin-top: var(--space-md); }
`),
    p('A full-bleed band that supplies rhythm and gutter, a centred column with its own gutter, the same column inside a band that already has one, and a set of stack helpers for vertical spacing between siblings. Everything else is composition.'),

    img('four-primitives', 'Four composable containers covering the common page structures', 'Four shells and a stack helper. Past that, layout is composition rather than declaration.'),

    h3('Modifiers, not overrides'),
    p('A section needing less rhythm gets `.section-tight`; one butting against a neighbour gets `.section-flush-top`. The moment somebody writes an inline `padding-top`, the system has a hole — and holes are how drift enters. If you reach for an inline value, the thing that is missing is a modifier.'),

    p('It is worth being strict about what qualifies. A primitive solves a structural problem that recurs on every page; a component solves a specific one. If a candidate primitive is used on two pages, it is a component with an ambitious name — and putting it in the primitive layer means everyone has to learn it to read the codebase, for no benefit.'),

    h3('Measure caps belong here too'),
    p('A reading column has a correct width and it is a system decision, not a per-page one. Naming it — `--prose` for the text column, `--prose-wide` for tables and code — means every long-form page shares an axis instead of each one guessing.'),

    h2('When should something become a component?'),
    p('On the third use, not the first — and the third use has to be genuinely the same thing.'),
    p('Abstracting at the first repetition produces components with six props to cover variations that turned out not to exist. Abstracting at the third means you have seen the actual shape of the variation and can build for it.'),
    ol([
      '**First use:** write it inline where it lives. It might be a one-off.',
      '**Second use:** copy it. Two copies is cheaper than the wrong abstraction, and you now have data.',
      '**Third use:** extract, using what the three cases actually needed rather than what you imagine a fourth might.',
    ]),
    p('The rule people resist is the second one, because copying feels wrong. It is much less wrong than a component with a `variant` prop taking five values, three of which exist to support a single page.'),

    h3('Prop count is the health signal'),
    p('A component with more than about five props is usually two components wearing one name. When a `variant` prop starts branching layout rather than appearance, split it — the shared name is doing nothing but hiding that these are different things.'),

    p('There is a related failure worth naming: the component that exists but nobody can find. If extracting something means it lives three directories away under a name only its author would guess, the next person writes it again — and now you have the abstraction *and* the duplication. Extraction is only half the job; discoverability is the other half.'),

    h3('Some things should never be components'),
    p('The decorative mockups on this site — the fake browser windows, the illustrative dashboards — are tied to specific layouts and specific copy. Making them configurable would produce a component with a dozen props used once each. They are illustrations, and illustrations are allowed to be bespoke.'),
    img('extract-timing', 'The same element appearing several times before being consolidated', 'Extract on the third use. Two copies is cheaper than the wrong abstraction, and it shows you what varies.'),

    h2('What actually makes people use it?'),
    p('Being faster than the alternative at the moment of the decision. Everything else is secondary.'),
    ul([
      '**Findable.** If someone has to remember whether it is `--space-lg` or `--spacing-large`, they will type a value. Consistent naming is a usability feature.',
      '**Documented where it lives.** A comment above the tokens beats a documentation site nobody opens. The best documentation is the file people already have open.',
      '**Small enough to hold in your head.** Eight spacing steps and six colours can be memorised. Forty of each cannot, and unmemorable systems get guessed at.',
      '**Enforced by something that runs.** A grep in CI for hardcoded `px` catches drift at the moment it happens rather than at the next audit.',
    ]),
    p('The last one is the difference between a system and a suggestion. [A rule that runs is a control](/blog/ci-pipeline-typecheck-tests); a rule in a document is a hope, and hopes lose to Thursday afternoons.'),

    p('Speed at the moment of decision is the thing to optimise, and it is why naming matters more than completeness. A system with eight well-named steps beats one with thirty perfectly-designed ones, because the first can be used from memory and the second requires opening a file.'),

    h3('The check has to name the fix'),
    p('A CI failure saying "hardcoded px at Card.astro:34" is annoying. One saying "hardcoded 22px at Card.astro:34 — did you mean --space-md?" is helpful, and helpful checks get kept rather than disabled.'),

    h2('How do you know it has stopped working?'),
    p('Four signals, all visible in the codebase rather than in a survey.'),

    h3('Inline styles for spacing'),
    p('Grep for `style="padding` or `style="margin`. Every hit is a place the system did not have an answer, and the pattern in those hits tells you which modifier is missing.'),

    h3('Values close to but not equal to a token'),
    p('These are the most informative hits, because each one is a decision somebody made deliberately and did not tell anyone about.'),
    p('A `23px` beside a `--space-md` of 22px is somebody who did not know the token existed, or knew and thought it was slightly wrong. Both are findings — the first is a discoverability problem, the second is a scale problem.'),

    h3('Component props that only one caller passes'),
    p('An option used exactly once is a one-off that was absorbed into a shared thing. It makes the component harder to understand for everyone else and it should probably be a wrapper instead.'),

    h3('Two components doing the same job'),
    p('This is the most reliable signal of the four, because it takes real effort to produce.'),
    p('`Card` and `PostCard` and `ProjectCard` with 80% shared markup means the first one did not fit and nobody felt able to change it. That is a signal about the system\'s flexibility, not about the people.'),

    h2('Where do the tokens actually live?'),
    p('One file, in CSS, as custom properties — and the reasons are practical rather than ideological.'),
    table('Three places tokens get kept', [
      ['Location', 'Cost', 'Right when'],
      ['CSS custom properties', 'None — the browser resolves them', 'Almost always'],
      ['A JS/TS object', 'A build step, and a second source', 'Values needed in script as well'],
      ['A Tailwind theme block', 'Config indirection', 'The project is Tailwind-first'],
    ]),
    p('Custom properties win because they are live: they cascade, they can be overridden per section, they respond to media queries, and JavaScript can read them at runtime with `getComputedStyle`. A build-time constant can do none of that.'),

    h3('Duplicating tokens in JS is where drift starts'),
    p('The moment a colour exists in both a stylesheet and a TypeScript object, they will disagree — usually months later, in one component nobody looks at. If script genuinely needs a value, read it from the custom property rather than keeping a copy.'),

    h3('Tailwind is a consumer, not an owner'),
    p('A `@theme` block that defines tokens and exposes them as CSS variables is fine, and this site does exactly that. What is not fine is tokens living only in a config file, because then anything outside the utility system — a scoped component style, a third-party embed — cannot reach them.'),

    h3('Scope overrides where they belong'),
    p('Custom properties cascade, so a dark band can redefine `--sfg` and `--sbg` for everything inside it without a single component knowing. That is the mechanism that makes tone variants cheap, and it only works if the components read tokens rather than values.'),
    img('token-home', 'A single definition consumed from several directions', 'Custom properties are live: they cascade, respond to queries, and can be read at runtime. A build-time constant does none of that.'),

    h2('What does portability actually require?'),
    p('Reading host values rather than baking your own, which is a small discipline with a large payoff.'),
    p('The mascot on this site is meant to be droppable into another project. It manages that by reading `--color-blue`, `--color-ink`, `--color-surface` and `--font-body` from whatever surrounds it, with its own fallbacks — so moving it means editing one theme block rather than hunting hardcoded hex values through a component.'),
    code('css', `
/* Read the host, fall back to something sane. Nothing is baked in. */
.mascot {
  --m-accent: var(--color-blue, #2563eb);
  --m-ink: var(--color-ink, #0a0a0a);
}
`),
    p('That pattern generalises. Any component that reads tokens with fallbacks works in a project that has them and works in one that does not, which is most of what portability means in practice.'),
    img('portable-component', 'A component drawing its appearance from the surrounding context rather than its own definitions', 'Read the host, fall back sensibly. Portability is mostly the absence of baked-in values.'),

    img('drift-signals', 'Several small deviations accumulating around an established pattern', 'All four signals are visible in the codebase. None of them requires asking anyone whether the system is working.'),

    h2('What should you not build?'),
    p('The parts that feel most like a design system and cost the most to maintain.'),
    ul([
      '**A component for every element.** A `<Heading level={2} size="lg">` is worse than an `h2` with a class. Wrapping HTML in a component that adds nothing is pure overhead.',
      '**A documentation site,** until more than about three people use the system. A well-commented token file serves a small team better and cannot go stale separately from the code.',
      '**Every state up front.** Build hover when something needs hover. Speculative states are the bulk of an unused component library.',
      '**A theming layer for one theme.** If there is no second theme and none planned, the indirection costs clarity and buys nothing — [add it when the second theme is real](/blog/dark-mode-tokens).',
    ]),
    p('All four are things that make a system feel serious and make it slower to use, which is precisely the trade that gets systems abandoned.'),

    h2('What does this cost?'),
    p('A day at the start, and it is the highest-leverage day in a project.'),
    p('Tokens, four primitives, a naming convention and a CI check is a day. What it buys is that every subsequent layout decision is a choice from a small set rather than an invention, which compounds across every page anybody builds afterwards.'),
    p('Retrofitting is a different matter. Inventorying values, clustering them, replacing them and visually checking the result is a day on a site this size — and it has to happen in one commit, because a stylesheet halfway between two systems is worse than either. Reviewers cannot tell a deliberate exception from an unconverted leftover, and the migration stalls there permanently.'),
    p('The honest counterweight: a system is a constraint, and constraints occasionally cost you the right answer. Sometimes a layout genuinely wants a value that is not on the scale, and the correct response is to use it and write down why rather than to bend the page around the system. A system that never bends is one people route around entirely.'),
    quote('A design system is not a library. It is the set of decisions you have agreed not to make again.'),

    h2('How do you keep it alive?'),
    p('Three habits, none of which need a meeting.'),

    h3('Review against it, in one question'),
    p('Four words, asked consistently.'),
    p('"Which token is this?" asked in a pull request is the whole governance process for a small team. It catches the drift, it teaches the system, and it costs nothing.'),

    h3('Let the exceptions accumulate before changing anything'),
    p('One component needing a value off the scale is a one-off. Four needing the same value is a missing step, and now you have evidence rather than an opinion about what to add.'),

    h3('Delete more than you add'),
    p('It is the habit that keeps the other two workable, and it is the one nobody ever schedules time for.'),
    p('The natural direction is growth — a variant here, a token there — and a system grows until it is unmemorable and then stops being used. Periodically finding the component with one caller and inlining it back is maintenance, not regression.'),

    h2('Conclusion'),
    p('Build three layers in order: tokens, primitives, components. Keep the token layer small enough to memorise — six colours and eight spacing steps, not generated ramps — because a system nobody can hold in their head gets guessed at.'),
    p('Write constraints into the token comments. The measured contrast ratio beside a grey is what stops it being lightened by somebody looking at it in isolation, and that is the most common way accessibility regresses.'),
    p('Four primitives cover most layout: a full-bleed band, a centred column with gutter, the same column inside a band, and stack helpers. Add modifiers rather than allowing inline overrides — every inline padding is a hole where drift enters, and it is telling you which modifier is missing.'),
    p('Extract components on the third use, not the first. Two copies is cheaper than the wrong abstraction, and by the third you know what actually varies. Treat a growing prop count as a signal that one name is hiding two components.'),
    p('Then make it enforceable and keep it small. A grep in CI that names the token you probably meant catches drift on Thursday afternoons, when documentation does not. And delete as readily as you add — a system grows until it is unmemorable, and unmemorable systems quietly stop being used. If you want a second pair of eyes on one that has started to drift, [that is a useful half-day](/start).'),
  ),
  faqs: faq([
    ['When should you extract a design system component?',
     'On the third use, not the first. Abstracting at the first repetition produces components with props covering variations that never materialise. Two copies is cheaper than the wrong abstraction, and by the third case you can see what genuinely varies rather than guessing.'],
    ['How many colours and spacing steps should a system have?',
     'Around six colours and six to eight spacing steps — small enough to memorise. Generated ramps of ten shades per hue are mostly unused and invite people to reach for an arbitrary step instead of the one the system meant. If you cannot name what a step is for, it is not a step.'],
    ['Do you need a documentation site for a design system?',
     'Not until more than about three people use it. A well-commented token file serves a small team better, is already open in their editor, and cannot go stale separately from the code. A documentation site that disagrees with the codebase is worse than no site.'],
    ['How do you stop a design system drifting?',
     'A check that runs. Grep in CI for hardcoded px in padding and margin, and for bare clamp() outside the token file, with a message naming the token they probably meant. Documented conventions lose to deadlines; a failing build does not.'],
  ]),
};
