import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/dark-mode-tokens/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-dark-mode-tokens',
  slug: 'dark-mode-tokens',
  title: 'Structuring Tokens So Dark Mode Is Possible Later',
  category: 'frontend',
  order: 73,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-27',
  series: 'Foundations',
  excerpt:
    'Semantic tokens over literal ones, the two-layer split that makes a second theme a data change, and an honest case for not shipping dark mode at all.',
  coverLabel: 'Dark mode tokens — cover',
  body: body(
    p('This site does not have a dark mode. It is deliberately white-on-ink with a single blue accent, and adding a second theme would mean maintaining two versions of a look that only makes sense as one.'),
    p('Which makes it a useful place to write about the question, because the interesting decision is not how to implement dark mode. It is how to structure tokens so that adding it later is a data change rather than a rewrite — and how to tell whether you should.'),
    p('The short version: two layers of tokens, semantic names in the outer one, and inversion handled by role rather than by lightness. Get that right and a second theme is a block of overrides. Get it wrong and it is every component.'),

    h2('Why do literal token names block a second theme?'),
    p('Because a name that describes a colour cannot describe its opposite.'),
    code('css', `
/* Literal. Reads fine in one theme, absurd in two. */
--color-white: #ffffff;
--color-near-black: #0a0a0a;

.card { background: var(--color-white); color: var(--color-near-black); }
`),
    p('To invert that, `--color-white` has to become `#0a0a0a`, and now every reader of that token is lying. The alternative — swapping the references in every component — is exactly the rewrite you were trying to avoid.'),
    p('Semantic names do not have this problem because they describe a role in the interface rather than a value on a colour wheel.'),
    code('css', `
/* Semantic. The names stay true whichever theme is active. */
--surface: #ffffff;
--surface-raised: #f4f4f5;
--text: #0a0a0a;
--text-muted: #767676;
--border: rgba(10,10,10,.08);
`),
    p('`--surface` is the thing content sits on. That is true in both themes; only the value changes. Every component reads roles, so a theme is a block that redefines values and touches no component at all.'),
    img('literal-vs-semantic', 'Two naming schemes, one describing appearance and one describing purpose', 'A name describing a colour cannot describe its opposite. A name describing a role stays true in both themes.'),

    h2('What are the two layers?'),
    p('A palette of raw values, and a set of semantic roles that point at them. Components only ever read the second.'),
    code('css', `
:root {
  /* Layer 1 — the palette. Literal names are correct here. */
  --grey-0: #ffffff;
  --grey-50: #f4f4f5;
  --grey-500: #767676;
  --grey-950: #0a0a0a;
  --blue-600: #2563eb;
  --blue-400: #60a5fa;

  /* Layer 2 — roles. This is the only layer components read. */
  --surface: var(--grey-0);
  --surface-raised: var(--grey-50);
  --text: var(--grey-950);
  --text-muted: var(--grey-500);
  --accent: var(--blue-600);
}
`),
    p('The palette is a fixed vocabulary of the colours that exist. The role layer is an assignment of those colours to jobs. A theme changes assignments, not colours — which is why a dark theme is short.'),
    code('css', `
[data-theme='dark'] {
  --surface: var(--grey-950);
  --surface-raised: #17171a;
  --text: var(--grey-0);
  --text-muted: #a1a1aa;
  --accent: var(--blue-400);   /* lighter, for contrast on dark */
}
`),
    p('Six lines. That is the entire payoff of the two-layer structure, and it only works if no component ever reached past the role layer to a palette value directly.'),

    p('There is a third layer some systems add — component-level tokens like `--button-bg` pointing at roles. It is occasionally justified on a large component library where a single component genuinely needs to deviate. On anything smaller it is indirection for its own sake: three hops to find out that a button is blue, and a token nobody remembers exists.'),

    h3('The palette usually grows for the second theme'),
    p('Notice `--blue-400` and the raised-surface value. Dark themes need their own shades: an accent that passes contrast on white is often too dark on near-black, and dark surfaces are lifted with lighter greys rather than shadows. Expect the palette to gain three or four entries, not to be reused wholesale.'),

    p('It is the same discipline as any other part of [a system that has to survive people being busy](/blog/reusable-design-system): the layer everyone reads should be the one that is safe to read, and the layer that is unsafe should be unreachable rather than discouraged.'),

    h3('Ban palette references in components with a check'),
    p('One direct `var(--grey-500)` in a component is a value that will not invert, and it will be the one nobody notices until somebody reports white text on white. A grep in CI for palette token names outside the theme file catches it at the moment it is introduced.'),

    h2('Which roles do you actually need?'),
    p('Fewer than a generated theme suggests. Around ten covers most interfaces.'),
    table('The roles worth defining', [
      ['Role', 'Used for'],
      ['surface', 'The page background'],
      ['surface-raised', 'Cards and panels above it'],
      ['surface-sunken', 'Wells, code blocks, inset areas'],
      ['text', 'Primary reading colour'],
      ['text-muted', 'Secondary and meta text'],
      ['text-inverse', 'Text on an accent or inverted band'],
      ['border', 'Hairlines and dividers'],
      ['accent', 'Links and primary actions'],
      ['accent-contrast', 'Text placed on the accent'],
      ['focus', 'Focus indicators'],
    ]),
    p('The last two exist because they are the ones that break first. An accent that works as link text on a light background frequently fails as a background behind small white text, and a focus ring tuned for one theme is often invisible in the other.'),

    img('role-set', 'A compact set of named purposes covering an interface', 'Around ten roles covers most interfaces. The last two exist because they are the ones that break first.'),

    h3('Name by elevation, not by lightness'),
    p('`--surface-raised` inverts naturally: on light it is slightly darker than the page, on dark it is slightly lighter. `--surface-light` cannot, because in a dark theme the raised surface is not light. Elevation is a role; lightness is a value.'),

    h3('Do not model states as separate roles'),
    p('Hover, active and disabled are usually derived — a `color-mix` against the surface, or an opacity. Defining `--button-hover-bg` per theme per component is how a ten-role system becomes eighty.'),
    img('two-layers', 'A fixed vocabulary of values feeding a smaller set of named purposes', 'The palette says what colours exist. The role layer assigns them jobs. A theme changes the assignment.'),

    h2('How should the theme be selected?'),
    p('System preference by default, with an override that persists, and the override applied before first paint.'),
    code('css', `
/* Default to the system, with a data attribute able to win in either direction. */
:root { color-scheme: light; /* light values */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { color-scheme: dark; /* dark values */ }
}

:root[data-theme='dark'] { color-scheme: dark; /* dark values */ }
`),
    p('The `:not([data-theme="light"])` is what lets somebody choose light while their system is dark. Without it the media query wins and the toggle appears broken in exactly one direction — the classic implementation bug.'),

    h3('Set the attribute before the CSS paints'),
    p('A stored preference applied by a script after load produces a flash of the wrong theme. The fix is a tiny inline script in the `<head>`, before the stylesheet, that reads storage and sets the attribute. It is one of very few defensible uses of a blocking inline script.'),
    code('html', `
<script>
  try {
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch {}
</script>
`),

    p('Storing the value is worth a moment of thought too. `localStorage` is the usual choice and it fails in a specific way: it is unavailable in some privacy modes and throws rather than returning null, which is why the read above is wrapped. A cookie is the alternative when the theme also needs to be known server-side to render the correct markup on the first response.'),

    h3('Declare color-scheme'),
    p('It tells the browser to render form controls, scrollbars and the default canvas in the matching scheme. Without it a dark page keeps light scrollbars and white-backgrounded inputs, which is the detail that makes a theme look half-finished.'),

    h2('What breaks in a dark theme that did not before?'),
    p('Five things, and none of them are token problems — which is why they survive a well-structured migration.'),

    h3('Images with baked-in white backgrounds'),
    p('The most immediately visible of the five, and the easiest to overlook in a component library.'),
    p('Logos, diagrams and screenshots exported on white become bright rectangles. Transparent PNGs or SVGs solve it; a `<picture>` with a dark variant solves the rest.'),

    h3('Shadows stop working'),
    p('This is the one that makes a hastily converted interface look flat rather than genuinely dark.'),
    p('A shadow on a dark surface is invisible, because the shadow is already darker than the background. Dark themes convey elevation with lighter surfaces and borders instead — which means the elevation mechanism itself is theme-dependent, not just its values.'),

    h3('Pure white text is too bright'),
    p('`#fff` on near-black causes halation — the text appears to glow and blur at the edges. A slightly dimmed white is more comfortable, and the same applies in reverse: pure black on white is harsher than a near-black.'),

    h3('Contrast has to be rechecked entirely'),
    p('The maths is symmetrical and perception is not. The same pairing inverted reads heavier, so type on dark often wants a lighter weight, and a muted grey tuned for one theme is rarely right in the other. This is [a full audit, not a spot check](/blog/wcag-contrast-audit).'),

    h3('Third-party embeds ignore you'),
    p('It is the one item on this list you cannot fix from your own stylesheet, however well the tokens are organised.'),
    p('A map, a video player, a payment iframe or a chat widget renders in its own theme. Some accept a parameter, some do not, and a bright white embed in a dark page is more jarring than no dark mode at all.'),
    img('dark-breaks', 'Several elements that behave differently when the surrounding tone is inverted', 'None of these are token problems, which is exactly why they survive a well-structured migration.'),

    h2('What about surfaces that are already dark?'),
    p('Most single-theme sites have one, and it is a useful rehearsal for the whole exercise.'),
    p('This site has a dark band on the home and services pages — an inverted section carrying the AI-method content. It is not a theme, but it has exactly the same problem: text, borders and muted greys inside it need different values from the page around them.'),
    code('css', `
/* A scoped inversion. Same mechanism as a theme, one section wide. */
.band-dark {
  --surface: var(--grey-950);
  --text: var(--grey-0);
  --text-muted: #a1a1aa;
  --border: rgba(255,255,255,.12);
}
`),
    p('Because custom properties cascade, every component inside that band picks up the new values with no knowledge that it is on a dark background. That is the same mechanism a full theme uses, applied to one section — so building it correctly is a genuine test of whether components are reading roles.'),

    h3('If a scoped inversion needs component changes, a theme will too'),
    p('This is the cheapest diagnostic available. Drop a dark band into a page and see what breaks: a card with a hardcoded white background, a border in a literal grey, an icon with a fixed fill. Each one is a component that would have broken in a theme, found for the price of one section.'),

    h3('Tone variants are the same idea again'),
    p('Coloured surfaces — an indigo card, a green commerce panel — work identically: a class sets the surface, foreground and muted values, and the component inside is unaware. Once that pattern exists, a full theme is not a new mechanism, only a wider scope.'),
    img('scoped-inversion', 'A single region overriding shared values for everything inside it', 'A dark band is a theme one section wide. What breaks inside it is what would break in a theme.'),

    h2('Should you build it at all?'),
    p('This is the question worth asking before the implementation one, and the answer is genuinely sometimes no.'),
    p('Dark mode doubles the visual surface you maintain. Every new component needs checking twice, every screenshot exists in two versions, every contrast decision is made twice, and every third-party embed becomes a small problem.'),
    ul([
      '**Build it** for anything people use for hours — a dashboard, an editor, a reading application. The comfort argument is real and the audience expects it.',
      '**Consider it** for developer-facing products, where the expectation is close to universal.',
      '**Skip it** for a short marketing site, a portfolio, or anything with a deliberate single-tone identity where two themes means two identities.',
    ]),
    p('This site is the third case. It is white-on-ink with one accent by design; a dark version would not be the same design with different values, it would be a different design. Structuring the tokens so it *could* exist costs nothing, and that is the useful position — prepared, not committed.'),

    p('It is worth separating two things people conflate here. Supporting `prefers-color-scheme` is not the same as having a dark theme — a site can honour the preference for form controls and scrollbars via `color-scheme` while remaining a light design, and that is a coherent position rather than a half-measure. What is incoherent is a dark theme that only covers the pages somebody remembered.'),

    h3('Prepared is cheaper than committed'),
    p('Semantic roles and a two-layer palette cost nothing extra on a single-theme site. They make the codebase more readable regardless, and they mean a decision to add a theme later is a week rather than a quarter. That asymmetry is the whole argument for doing the structural work without shipping the feature.'),

    h2('Is a toggle worth offering?'),
    p('If you have two themes, yes — and it needs to be findable rather than tucked into a settings page.'),
    table('Three toggle shapes', [
      ['Shape', 'Cost', 'Right when'],
      ['Two states — light, dark', 'Simplest', 'You are confident about the default'],
      ['Three — light, dark, system', 'One more state to render', 'Almost always the honest option'],
      ['Automatic only, no control', 'Nothing', 'You would rather not maintain a toggle'],
    ]),
    p('The three-state version is usually right because "follow my system" is a real preference distinct from either fixed choice, and a two-state toggle forces somebody who wanted the system default to pick a side permanently. It also means the stored value can be absent rather than requiring a sentinel.'),

    h3('Label it for its action, not its state'),
    p('A moon icon alone is ambiguous — is that the current theme or the one it switches to? A control with an accessible name saying what it does, and `aria-pressed` or a grouped set of radios conveying which is active, removes the guess.'),

    h3('Do not animate the transition'),
    p('A crossfade between themes sounds pleasant and is a full-page colour animation, which is exactly what somebody with a motion sensitivity has asked you not to do. Switch instantly, or gate the transition behind `prefers-reduced-motion: no-preference`.'),
    img('toggle-states', 'A control offering two explicit choices plus deference to an external setting', 'Three states, because "follow my system" is a real preference and a two-state toggle forces people off it.'),

    h2('How do you test a second theme?'),
    p('Systematically, because the failures are visual and cluster in the places nobody visits.'),
    ol([
      '**Toggle on every page**, including the ones with no content — error pages, empty states, the confirmation screen after a form.',
      '**Re-run the contrast audit** in both themes. Two tokens that pass on light frequently fail on dark, particularly muted text and the accent.',
      '**Check every state:** hover, focus, active, disabled, error, success. States are where per-theme derivations go wrong.',
      '**Look for hardcoded colours** with a grep for hex values outside the palette file. Each one is a value that will not invert.',
    ]),
    p('The fourth is the most productive and takes a minute. Any literal colour in a component is a token that was never made, and in a single-theme site it is invisible — which is why the check belongs in CI from the start rather than at migration time.'),

    img('theme-audit', 'A checking pass applied twice across the same set of surfaces', 'The grep for literal colours is the most productive minute in the whole audit.'),

    h3('Screenshot both, and diff the layout not the colour'),
    p('Visual regression across themes is noisy by definition. What is worth catching is a layout that changed — an element that disappeared because its colour matched its background, or text that wrapped differently because a weight changed. Compare structure rather than pixels.'),

    h2('What does this cost?'),
    p('Nothing to prepare for, and a week or two to actually build on an existing site.'),
    p('The preparation — two layers, semantic roles, a CI check for palette leakage — is how tokens should be organised anyway. It makes a single-theme codebase easier to read and costs no extra time at the point of writing.'),
    p('Building the theme afterwards is where the work is: choosing dark values, adding the palette entries a dark theme needs, re-auditing contrast, handling images, replacing shadows with surfaces, and dealing with every embed. A week or two on a site of moderate size, most of it in the audit rather than the CSS.'),
    p('The honest counterweight: it is also permanent maintenance. Every component built afterwards is built twice, and the second version is the one that gets checked less carefully. That ongoing cost is the strongest argument for deciding deliberately rather than adding dark mode because it feels expected.'),
    quote('Structure the tokens as though a second theme is coming. Ship the second theme only if somebody actually needs it.'),

    h2('Conclusion'),
    p('Use two layers: a palette of literal values, and a set of semantic roles that point at them. Components read only the role layer, which is what makes a theme a block of reassignments rather than a change to every file.'),
    p('Name roles by purpose and elevation, never by lightness. `--surface-raised` inverts naturally; `--surface-light` cannot, because in a dark theme the raised surface is not light.'),
    p('Keep the role set small — around ten — and derive states rather than defining them per theme, or a tidy system becomes eighty tokens. Include `accent-contrast` and `focus` explicitly, because those are the two that break first.'),
    p('Select the theme from the system preference with an override that can win in both directions, apply the stored value in an inline script before first paint, and declare `color-scheme` so scrollbars and form controls follow.'),
    p('Then be honest about whether to ship it. Dark mode doubles the surface you maintain and every subsequent component is built twice. It is clearly right for anything used for hours and clearly optional for a short marketing site with a deliberate single-tone identity. Structuring the tokens so it *could* exist costs nothing — being prepared without being committed is the position worth holding. If you want tokens organised so a later theme is a week rather than a quarter, [that is a short piece of work](/start).'),
  ),
  faqs: faq([
    ['How should design tokens be structured for dark mode?',
     'Two layers: a palette of literal values, and semantic roles pointing at them. Components read only the roles, so a theme becomes a block that reassigns values rather than a change across every component. Expect the palette to gain a few dark-specific shades.'],
    ['Why should tokens be named semantically rather than by colour?',
     'Because a name describing a colour cannot describe its opposite. Making --color-white resolve to near-black in a dark theme means every reader of that token is lying. A role like --surface stays true in both themes; only the value behind it changes.'],
    ['How do you avoid a flash of the wrong theme?',
     'Apply the stored preference in a small inline script in the head, before the stylesheet loads, so the attribute is already set when the CSS first paints. A script that runs after load will always show the default theme briefly first.'],
    ['Is dark mode always worth building?',
     'No. It doubles the visual surface you maintain and every later component is built twice. It is clearly right for products people use for hours and clearly optional for short marketing sites with a deliberate single-tone identity. Structure tokens so it could exist, then decide separately.'],
  ]),
};
