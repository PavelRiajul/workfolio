import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/inline-icon-system/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-inline-icon-system',
  slug: 'inline-icon-system',
  title: 'An Icon System a CMS Can Author',
  category: 'frontend',
  order: 76,
  readTime: '12 min read',
  date: 'April 2026',
  publishedAt: '2026-04-19',
  series: 'Foundations',
  excerpt:
    'Inline SVG keyed on the class strings a CMS already stores, a missing icon that renders nothing, and the script that stops paths being pasted by hand.',
  coverLabel: 'Inline icon system — cover',
  body: body(
    p('Replacing an icon font with inline SVG is usually described as a performance change. It is, but the harder problem is authoring: if the CMS stores `fa-solid fa-house` on a navigation item, and forty content records reference icons that way, the replacement has to keep working with those strings or it is a content migration rather than a component change.'),
    p('That constraint turns out to shape the whole design, and for the better. An icon system keyed on what the CMS already stores is one an editor can keep using unchanged, and it is a smaller change to ship.'),
    p('This is the system on this site — twenty-five glyphs, one component, one map, and a script that fetches real geometry so nothing is transcribed by hand.'),

    h2('What is wrong with an icon font?'),
    p('Three things, and the third is the one that decides it.'),
    table('Icon font versus inline SVG', [
      ['', 'Icon font', 'Inline SVG'],
      ['Requests', 'A stylesheet and a font file', 'None — it is in the HTML'],
      ['Payload', 'Every glyph, always', 'Only the ones used'],
      ['Failure mode', 'A tofu box where a control should be', 'Nothing renders'],
      ['Styling', 'Colour and size', 'Any property, any part'],
      ['Announced as', 'A private-use character', 'Explicitly hidden or labelled'],
    ]),
    p('The failure row matters most. When an icon font does not load, `<i class="fa-solid fa-house">` renders a private-use codepoint, which shows as a tofu box or an unrelated glyph. Somebody sees a broken square where a button belongs. A missing inline icon renders nothing, and nothing beside a text label is invisible rather than wrong.'),
    p('The payload argument is real too but smaller than usually claimed. A font ships every glyph it contains; twenty-five inline paths are a couple of kilobytes inside HTML that was already being downloaded. Meaningful, not transformative.'),
    img('failure-modes', 'A control rendering with a placeholder character beside one rendering with nothing', 'A tofu box is a visible defect. An absent icon beside a label is invisible. That asymmetry decides it.'),

    h2('How do you keep the CMS working?'),
    p('Key the map on the class pair the CMS already stores, and translate at render time.'),
    code('ts', `
// "fa-solid fa-house" -> "solid:house". Nothing in the content changes.
export function iconKey(name?: string): string | undefined {
  if (!name) return undefined;
  const style = name.match(/fa-(solid|regular|brands)/)?.[1];
  const glyph = name.match(/fa-(?!solid|regular|brands)([a-z0-9-]+)/)?.[1];
  return style && glyph ? \`\${style}:\${glyph}\` : undefined;
}
`),
    p('The component takes the same string an editor types, derives a key, looks up geometry, and renders an SVG. From the Studio\'s side nothing has changed — the field is still a Font Awesome class, the documentation is still whatever the editor already knew.'),

    p('It also means the change is reversible. If the inline system turns out to be wrong for some reason, putting the icon font back is deleting a component — the content still holds valid Font Awesome classes and nothing has to be translated in either direction. Changes that can be undone cheaply get made; ones that cannot get deferred indefinitely.'),

    h3('This is what makes it a component change, not a migration'),
    p('The alternative is a new field with a new vocabulary, which means updating every existing record and retraining whoever fills them in. Keying on the existing format means the change ships in one commit and no content moves.'),

    h3('The regex has to reject, not guess'),
    p('A malformed string should produce `undefined` rather than a best effort. An icon key derived optimistically from `fa house` will miss the map and render nothing — which is the right outcome, but arriving there by accident rather than by decision means the same string might resolve differently after a refactor.'),

    h2('What does the map look like?'),
    p('A key, a viewBox and a path. Nothing else, because nothing else is needed.'),
    code('ts', `
export const ICONS: Record<string, [string, string]> = {
  'solid:house': ['0 0 576 512', 'M575.8 255.5c0 18-15 32.1-32 32.1h-32…'],
  'regular:clock': ['0 0 512 512', 'M464 256A208 208 0 1 1 48 256a208…'],
  'brands:linkedin-in': ['0 0 448 512', 'M100.28 448H7.4V148.9h92.88z…'],
};
`),
    p('The viewBox has to travel with the path, because icon sets are not drawn on one grid — Font Awesome uses several, and rendering a 576-wide path in a 512 viewBox crops it. Storing them as a pair makes that impossible to get wrong.'),

    p('Keeping the value a tuple rather than an object is a small decision that pays off in the diff. Adding an icon is one line, and a reviewer can see at a glance whether the viewBox looks plausible for the path — a 512 grid with a path whose coordinates run past 570 is visibly wrong before anybody renders it.'),

    h3('One path per icon, or accept a more complex value'),
    p('Most icons are a single path. A few are multiple paths or need a fill rule, and the honest options are to exclude those or to make the value a small object rather than a tuple. Excluding them is usually fine and keeps the map trivially readable.'),

    h3('The map is a list, and lists get reviewed'),
    p('Adding an icon is a visible diff, so somebody can ask whether the site needs a twenty-sixth. That question is impossible when icons arrive by class name from a CDN carrying two thousand glyphs — the marginal cost of one more is zero, so the count grows without anybody deciding.'),

    h2('How should the component behave?'),
    p('Decorative by default, silent when the icon is unknown, and inheriting colour and size from its context.'),
    code('astro', `
---
const { name, class: cls = '', label } = Astro.props;
const icon = ICONS[iconKey(name) ?? ''];
---
{icon && (
  <svg viewBox={icon[0]} class={cls} aria-hidden={label ? undefined : 'true'}
       role={label ? 'img' : undefined} focusable="false">
    {label && <title>{label}</title>}
    <path d={icon[1]} />
  </svg>
)}
`),
    p('Four decisions in that markup, each preventing a specific defect.'),

    h3('An unknown icon renders nothing'),
    p('No placeholder, no console error, no empty box. Almost every icon on a site sits beside a text label, so its absence is invisible and the interface remains complete. A tofu box or a dotted square is a visible fault reporting a cosmetic problem.'),

    h3('aria-hidden by default'),
    p('An icon next to the word "Home" adds nothing to a screen reader except the announcement "image, home icon". Hiding it by default makes the common case correct without anyone thinking about it, and the `label` prop opts into the rare case.'),

    h3('focusable="false" for old browsers'),
    p('Some engines put SVG elements in the tab order. One attribute keeps a decorative graphic out of the keyboard path, and its absence is why a page occasionally has an invisible tab stop nobody can explain.'),

    h3('fill: currentColor, size in em'),
    p('An icon that inherits colour darkens on hover, inverts on a dark band and dims when disabled with no rules of its own. Sizing in `em` makes it scale with the label beside it, so one component works in a nav and in a caption without a size prop.'),
    img('component-defaults', 'A small rendering unit whose appearance is drawn entirely from its surroundings', 'Inherit colour and size, hide by default, render nothing when unknown. The defaults do the work.'),

    h2('Where does the geometry come from?'),
    p('A script, never a browser inspector.'),
    p('Paths get copied out of devtools, mangled by an editor, truncated by a line-length rule, and quietly wrong in a way that renders as a slightly odd shape nobody questions. A script that reads the icon package and merges entries into the map removes the transcription step entirely.'),
    code('bash', `
npm run icons -- brands:instagram solid:link
`),
    p('One command, real geometry, correct viewBox. Write it the same day you write the map — this site documented such a script long before it existed, and in the interim every glyph was pasted by hand, which is exactly the drift a documented-but-absent tool produces.'),

    h3('Merge, do not regenerate'),
    p('The script should add entries and leave existing ones alone. Regenerating the whole file means any hand-adjusted icon is silently reverted, and it makes the diff for adding one icon unreadable.'),

    img('fetch-not-paste', 'Geometry travelling from a source package into a map without a manual step', 'A path copied from an inspector is a path that can be subtly wrong in a way nobody questions.'),

    h3('Keep the map sorted'),
    p('Alphabetical by key means the diff for a new icon is one line in a predictable place, and two people adding icons in the same week do not conflict. It is the kind of thing a formatter should enforce rather than a convention people remember.'),

    h2('When does an icon need a label?'),
    p('When it is the only thing conveying the meaning, which is less often than people add labels and more often than they omit them.'),
    ul([
      '**Beside a text label** — decorative. Hide it. "Home" is already announced.',
      '**Alone in a control** — a close button, a share button with no text — it needs an accessible name, and that name is the *action*, not the picture.',
      '**Conveying status on its own** — a warning triangle, a green check with no text — it needs a label and it needs [3:1 contrast](/blog/wcag-contrast-audit), because it is carrying information.',
      '**Purely ornamental** — a flourish, a background shape — hidden, always.',
    ]),
    p('The second bullet is where the common mistake lives: labelling an icon "cross icon" rather than "Close". The name should say what activating the control does, because that is what somebody needs in order to decide whether to activate it.'),

    p('There is a fifth case worth naming because it produces duplicated announcements: an icon inside a control that *also* has a visually hidden label. Both get announced, so the reader hears the name twice. The icon is decorative in that arrangement — the hidden text is doing the naming — and it should be hidden like any other decorative glyph.'),

    h3('A labelled icon still needs a fallback'),
    p('If a standalone icon is missing from the map, rendering nothing leaves a control with no visible content and no name — a button that is invisible and unusable. Standalone icons should fall back to a generic glyph rather than to nothing, which is the one case where the silent default is wrong.'),

    h2('What about icons stored in content?'),
    p('Validate them where they are authored, so a typo is caught by the person who made it.'),
    p('If a CMS field accepts a free-text class string, an editor will eventually type `fa-solid fa-hous`. The site then renders nothing, correctly, and nobody finds out until somebody notices a nav item looks bare.'),

    h3('A dropdown beats a text field'),
    p('If the Studio can offer the list of keys the map actually contains, a typo becomes impossible and an editor gets to see what is available. That means the schema reads from the same map the component does — the same single-source discipline that applies everywhere else.'),

    p('That is the same argument as [a design system enforcing itself](/blog/reusable-design-system) rather than describing itself: the constraint belongs in the interface people use, not in a document about how they should use it.'),

    h3('Or validate on save'),
    p('Where a free-text field is unavoidable, a validation rule that rejects a string not matching the pattern gives feedback at the moment of the mistake. Either is better than silence at render time.'),

    h3('Report unknown keys at build time'),
    p('Warn rather than fail here — an icon is cosmetic, and a single missing one should never be able to stop a deploy.'),
    p('A build-time warning listing every icon key referenced by content but missing from the map turns an invisible gap into a line of output. It does not fail the build — an icon is cosmetic — but it means nobody has to notice by eye.'),
    img('authoring-path', 'A constrained selection preventing an invalid value from being entered', 'Catch it where it is typed. Rendering nothing is the right behaviour and a poor way to learn about a typo.'),

    h2('How many icons should a site have?'),
    p('Fewer than the set you installed, and the number is worth deciding rather than discovering.'),
    table('What a count tells you', [
      ['Count', 'Usually means'],
      ['Under 15', 'Icons are used deliberately'],
      ['15–30', 'A normal site with navigation and social links'],
      ['30–60', 'Icons are decorating things that had labels'],
      ['60+', 'Nobody is deciding — they arrive with components'],
    ]),
    p('This site has twenty-five, and the number is visible because they live in a file. That visibility is the mechanism: when adding one is a diff, somebody can ask whether the interface is clearer with it or just busier.'),

    h3('Most icons beside labels are decoration'),
    p('An icon next to "Services" does not help anybody find services — the word does that. It can still be worth having for rhythm or recognition, but it should be a design decision rather than an assumption that every list item needs a glyph.'),

    h3('Icons alone are worse than words, with three exceptions'),
    p('Close, search and menu are near-universally understood. Almost everything else — a gear, a bookmark, three dots — is a guess, and the research on icon comprehension without labels is consistently unflattering. If space allows a word, use the word.'),

    h3('One set, one weight'),
    p('Mixing outline and filled icons, or two icon families, reads as inconsistency even to people who cannot say why. A single source keeps stroke weights and optical sizing coherent, which is most of what makes an icon set look designed rather than assembled.'),
    img('icon-count', 'A modest set of glyphs beside a much larger unmanaged collection', 'When adding one is a visible diff, somebody gets to ask whether it helps. From a CDN, the marginal cost is zero and the count only grows.'),

    h2('What does this cost?'),
    p('An afternoon to build, and it is one of the smaller wins with one of the better ratios.'),
    p('The component is thirty lines, the key parser is five, the map is data, and the fetch script is perhaps fifty. Against that: two render-blocking requests removed, a whole class of tofu-box failure gone, and icons that inherit colour and size rather than needing rules.'),
    p('The honest counterweight: the map is a manual dependency. A designer who wants an icon you do not have cannot add one themselves, which is friction that did not exist when any Font Awesome class worked. On a small team that is a one-command turnaround; on a larger one it wants either the dropdown above or a documented path for adding glyphs, or it becomes a bottleneck.'),
    quote('Key it on what the CMS already stores. An icon system that requires a content migration is a much bigger change than the one you were trying to make.'),

    h2('How do you verify it?'),
    p('Four checks, none of which take long.'),

    h3('Every referenced key resolves'),
    p('This is the check that turns a silent gap into an actionable to-do list rather than a discovery.'),
    p('Walk the content, collect every icon string, derive keys, and compare against the map. The gap is the list of icons to fetch, and running it in CI means a new content record cannot silently reference something that does not exist.'),

    h3('Nothing renders an empty SVG'),
    p('An empty one still takes up its space and shows nothing at all, which is the worst of both possible behaviours.'),
    p('Grep the built HTML for `<svg` with no `<path>`. An empty SVG occupies space and shows nothing, which is worse than the component having rendered nothing at all — it usually means a map entry exists with a missing path string.'),

    h3('Standalone icons have names'),
    p('Find every SVG that is the only child of a link or a button and check it has a `title` or an `aria-label` somewhere in that control. These are the ones where a missing name makes the control unusable rather than merely unlabelled.'),

    img('verify-passes', 'Four checks applied to a rendered result rather than to source', 'All four run against built output. Three of them can live in CI and cost nothing after the first afternoon.'),

    h3('Colours actually inherit'),
    p('Check an icon on a dark band and in a disabled control. If it stayed dark on dark, something set an explicit fill — and one hardcoded fill in a shared component is an icon that will be wrong on every surface it was not designed against.'),

    h2('Conclusion'),
    p('Key the icon map on the class string the CMS already stores. That turns an icon-font replacement from a content migration into a component change, and editors keep the interface and documentation they already have.'),
    p('Store the viewBox alongside the path, because icon sets are drawn on different grids and a mismatched viewBox crops the glyph. Keeping them as a pair makes the mistake impossible rather than unlikely.'),
    p('Make the component decorative by default with `aria-hidden`, render nothing for an unknown key, add `focusable="false"`, and let colour and size inherit through `currentColor` and `em`. Those defaults handle the common case correctly with no thought at the call site — which is the property that makes a component get used properly.'),
    p('Write the fetch script the same day as the map. A documented tool that does not exist is how twenty-five paths end up pasted from a browser inspector, subtly wrong and impossible to audit.'),
    p('Then close the authoring loop: offer a dropdown built from the map rather than a free-text field, or validate on save, and report unresolved keys at build time so a typo is a line of output rather than a nav item somebody eventually notices looks bare. And give standalone icons a fallback glyph — silence is the right default everywhere except the one place where it leaves a control with no visible content at all. If you want an icon font swapped out without touching content, [that is a well-defined afternoon](/start).'),
  ),
  faqs: faq([
    ['Why replace an icon font with inline SVG?',
     'Mainly the failure mode: a font that does not load renders tofu boxes where controls should be, while a missing inline icon renders nothing, which beside a text label is invisible. It also removes two render-blocking requests and ships only the glyphs you actually use.'],
    ['How do you switch icons without migrating CMS content?',
     'Key the icon map on the class string already stored — parse "fa-solid fa-house" into a lookup key at render time. The field, the vocabulary and the editor documentation all stay the same, so the change ships in one commit and no content records move.'],
    ['Should icons be hidden from screen readers?',
     'By default yes, with aria-hidden, because almost every icon sits beside a text label and announcing both is noise. Opt into a name only when the icon is the sole content of a control — and make that name the action, "Close", not the picture, "cross icon".'],
    ['What should render when an icon key is unknown?',
     'Nothing, in the usual case where the icon sits beside a text label — an absence is invisible while a placeholder box is a visible defect. The exception is a standalone icon in a control, which should fall back to a generic glyph so the control is not empty and unnamed.'],
  ]),
};
