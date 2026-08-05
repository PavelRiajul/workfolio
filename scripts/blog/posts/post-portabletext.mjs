import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/portable-text-renderer/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-portable-text-renderer',
  slug: 'portable-text-renderer',
  title: 'Writing Your Own Portable Text Renderer',
  category: 'frontend',
  order: 70,
  readTime: '13 min read',
  date: 'April 2026',
  publishedAt: '2026-04-04',
  series: 'Foundations',
  excerpt:
    'Portable Text stores each list item as a sibling, so naive rendering gives one list per bullet. That and four other things the format does not tell you.',
  coverLabel: 'Portable Text renderer — cover',
  body: body(
    p('Portable Text is a good format for the reason that makes it awkward to render: it is a flat array of blocks with no nesting. That means it survives being moved between systems, queried, diffed and stored — and it means the structure your HTML needs is not in the data.'),
    p('The clearest example is lists. Portable Text stores each bullet as its own top-level block with a `listItem` property. Render the array naively and you get five separate `<ul>` elements each containing one `<li>`, which looks almost right and is wrong in every way that matters.'),
    p('This site renders its blog body with about eighty lines of Astro rather than a library. Here is what those lines have to handle and why writing them was the right call.'),

    h2('What does the format actually give you?'),
    p('An array of blocks. Each is either a text block with children and marks, or a custom type you defined in the schema.'),
    code('json', `
[
  { "_type": "block", "style": "h2", "children": [{ "_type": "span", "text": "Why lists break" }] },
  { "_type": "block", "style": "normal", "listItem": "bullet",
    "children": [{ "_type": "span", "text": "First point" }] },
  { "_type": "block", "style": "normal", "listItem": "bullet",
    "children": [{ "_type": "span", "text": "Second point" }] },
  { "_type": "image", "src": "/blog/x/diagram.avif", "alt": "…" }
]
`),
    p('Two bullets, two sibling blocks, no container. Nothing in the data says "these belong to one list" beyond the fact that they are adjacent and share a `listItem` value — so grouping them is the renderer\'s job.'),

    h3('Marks are indirect on purpose'),
    p('The indirection is the part that most people find surprising the first time they sit down and read through the format.'),
    p('A span\'s `marks` array holds strings. Some are literal decorators like `strong`; others are keys pointing into the block\'s `markDefs` array, which is where a link\'s href lives. That indirection is what lets a link carry arbitrary data without inflating every span.'),
    code('json', `
{
  "markDefs": [{ "_key": "a1", "_type": "link", "href": "/services" }],
  "children": [
    { "_type": "span", "text": "See the ", "marks": [] },
    { "_type": "span", "text": "services", "marks": ["a1", "strong"] }
  ]
}
`),
    p('So rendering a span means resolving each mark against `markDefs` first, and treating an unresolved one as a decorator. A mark that matches neither should be ignored rather than crashing the page.'),
    img('flat-array', 'A sequence of equal-level items where some visually belong together', 'Nothing in the data says these two bullets are one list. Adjacency and a shared property is all you get.'),

    h2('How do you coalesce lists?'),
    p('Walk the array, and when you hit a `listItem` block, consume every following block with the same `listItem` value into one container.'),
    code('ts', `
const out = [];
for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  if (!b.listItem) { out.push(render(b)); continue; }

  // Consume the whole run of same-type items into one list.
  const kind = b.listItem;
  const items = [];
  while (i < blocks.length && blocks[i].listItem === kind) items.push(blocks[i++]);
  i--;                                   // step back; the for loop increments
  out.push(list(kind, items));
}
`),
    p('The `i--` is the kind of detail that produces an off-by-one that only shows up when a list is immediately followed by a heading. Worth a test on its own.'),

    img('coalesce', 'Adjacent equivalent items being gathered under a single container', 'Consume the run, then step back one — the off-by-one only shows when a list is followed by a heading.'),

    h3('Match on the list type, not just presence'),
    p('A bulleted list followed immediately by a numbered one is two runs. Consuming on "has `listItem`" merges them into a single `<ul>` and silently loses the numbering — a bug that only appears when an author happens to put the two adjacent.'),

    p('It is worth writing the test for this case specifically rather than trusting a visual check, because the broken version renders almost identically. Five one-item lists and one five-item list look the same until you inspect the markup or apply a style to the container — at which point the spacing between items is wrong in a way nobody can attribute to anything.'),

    h3('Nesting comes from level, not structure'),
    p('Portable Text expresses indentation with a numeric `level`, still flat. Supporting nested lists means tracking level transitions and opening or closing containers as it changes. If your Studio does not allow nesting, do not build this — but make sure the schema actually forbids it rather than allowing something you silently flatten.'),

    h2('Why write it yourself rather than use a library?'),
    p('Because the renderer is where the design system meets the content, and that is exactly the boundary you want to own.'),
    table('The trade, honestly', [
      ['', 'Library', 'Your own'],
      ['Time to first render', 'Minutes', 'An afternoon'],
      ['Handles every block type', 'Yes, generically', 'Only what you ship'],
      ['Framework fit', 'Depends on the package', 'Native by definition'],
      ['Adding a custom type', 'Config plus a component', 'A branch in one file'],
      ['Ownership when it breaks', 'Issue tracker', 'Yours'],
    ]),
    p('Eighty lines is not a serious maintenance burden, and the payoff is that adding a table block, a callout or a code block is one branch in a file you already understand — rather than working out how a package wants custom serializers configured.'),
    p('The honest counterweight: on a large content model with a dozen custom types, a library\'s conventions start earning their keep. The line is roughly whether the renderer stays readable in one screen. Past that, use the library.'),

    p('There is also a portability argument that cuts against writing your own, and it is worth being honest about. A library maintained across frameworks means the same content renders identically in a Next.js app, an email template and a native client. If the content will only ever be read on one site, that guarantee is worth nothing — if it might not, it is worth quite a lot.'),

    h3('Restrict the schema to what you render'),
    p('The safest version of a hand-written renderer is one whose input cannot contain surprises. If the Studio block schema allows exactly the styles and marks you handle, there is no unknown case — an editor cannot produce an `h5` you forgot, because the interface does not offer one.'),

    h2('What must never crash the page?'),
    p('Anything unexpected. A CMS is edited by people, and a renderer that throws takes the whole route down at build time.'),
    ul([
      '**An unknown block type** — skip it silently rather than rendering an error.',
      '**A mark with no matching def** — treat it as a decorator, ignore it if unrecognised.',
      '**An empty block** — filter it, or you get stray empty paragraphs where somebody hit return.',
      '**A missing image file** — render no figure rather than a broken image.',
      '**An unknown code language** — fall back to plain text rather than failing to highlight.',
    ]),
    p('Each of those is one line of defensiveness and each prevents a build failure from a content edit. The asymmetry is stark: the cost of tolerance is a slightly wrong-looking block, and the cost of strictness is a page that does not exist.'),

    img('tolerant-render', 'Several unexpected inputs passing through a process without stopping it', 'Tolerance costs a slightly wrong block. Strictness costs the whole page, triggered by somebody editing text.'),

    h3('Empty blocks are more common than you expect'),
    p('Editors press return to make space, which produces a block with a single empty span. Rendering those gives a document with random gaps that no CSS rule explains. A check for any non-whitespace text across the children handles it.'),

    h2('How do headings and the contents list stay in sync?'),
    p('By having one function decide the ids, used by both.'),
    p('This is the failure that is invisible until somebody clicks. The renderer slugifies a heading one way, the contents list slugifies it another, and the two agree on every heading except the ones with a colon in them — so most links work and a few scroll nowhere.'),
    code('ts', `
// One place decides ids. The renderer stamps them; the TOC links to them.
export function headings(blocks) {
  const seen = new Map();
  return blocks
    .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
    .map((b) => {
      const base = slug(text(b));
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      return { id: n ? \`\${base}-\${n + 1}\` : base, text: text(b), level: … };
    });
}
`),
    p('The duplicate-suffix logic is why sharing matters. Two sections called "Conclusion" need distinct ids, and any suffixing scheme implemented twice will eventually disagree — leaving the contents list pointing at a fragment that does not exist.'),

    p('The slugifier itself deserves care too. Strip punctuation, collapse whitespace, lowercase, and decide explicitly what happens to non-Latin characters — a heading in another script that slugifies to an empty string produces an id of `-2` on the second occurrence and nothing on the first, which is a link to the top of the page.'),

    h3('Derive, do not store'),
    p('Storing heading ids in the content means they go stale the moment somebody edits a heading. Deriving them at render time from the text keeps them correct by construction, at the cost of an id changing when a heading is reworded — which is the right trade for an internal contents list and the wrong one for URLs you have published externally.'),
    img('shared-ids', 'Two consumers reading identity from one shared origin', 'One function decides ids. Two implementations agree on most headings and disagree on the ones with punctuation.'),

    h2('How do you handle code blocks?'),
    p('Highlight at build time, and degrade rather than fail on an unknown language.'),
    p('A build-time highlighter ships coloured HTML and no client JavaScript, which is strictly better than a runtime library for content that never changes after the build. Astro bundles Shiki, so this costs no new dependency at all.'),
    code('astro', `
---
import { Code } from 'astro:components';
---
<Code code={block.code} lang={block.language ?? 'plaintext'} />
`),
    p('The fallback matters because `language` is a free-text field an editor fills in. Somebody will type `node` or leave it blank, and the correct response is unhighlighted code rather than a build error.'),

    p('One detail that repays a minute of thought: the highlighter emits its own `<pre>` with its own class, so your styling belongs on a wrapper around it rather than on the element itself. Fighting a highlighter\'s markup with overrides is how a code block ends up with two backgrounds and inconsistent padding between languages.'),

    h3('Give the wrapper the scroll, not the page'),
    p('A wide code block or table inside a capped reading column will overflow. The wrapper needs `overflow-x: auto`; without it the *document* scrolls sideways on a phone, which is a much worse failure than a scrollable block.'),

    h2('What about images inside the body?'),
    p('Resolve the source in a defined order and render nothing when there is nothing.'),
    ol([
      '**A CMS upload** if there is one — it has dimensions and a CDN behind it.',
      '**A file under `/public`** if the path exists, checked at build time.',
      '**Nothing at all** otherwise. No placeholder, no broken image icon.'
    ]),
    p('That last step is what lets a post reference artwork that has not been produced yet. The post is correct today and improves when the file lands, with no code change and no visible defect in between.'),

    p('It is the same rule the [cover images](/blog/mobile-hero-viewport) follow, and it generalises: where content references an asset that may not exist yet, absence should be invisible rather than a placeholder announcing its own incompleteness.'),

    h3('Check the file the right way'),
    p('The obvious build-time existence check resolves relative to the module, and components get bundled — so the path ends up relative to the build output rather than the project, and every lookup fails. It works in dev, where files are served from source, which is what makes it easy to miss. Resolve from the project root instead.'),

    h3('Captions belong in a figure'),
    p('The association is what assistive technology actually reads out; visual proximity on its own conveys nothing at all to it.'),
    p('An image with a caption is a `<figure>` with a `<figcaption>`, not a paragraph underneath. It costs nothing and it is the difference between a caption that is associated with its image and one that merely sits below it.'),
    img('image-fallback', 'A resolution order ending in an absence rather than an error state', 'A missing file renders no figure. The post is correct now and better later, with nothing in between.'),

    h2('How do you render tables from a flat format?'),
    p('As a custom block type, because Portable Text has no table concept and inventing one out of nested blocks is a trap.'),
    code('json', `
{
  "_type": "table",
  "caption": "Two kinds of pagination",
  "headerRow": true,
  "rows": [
    { "cells": ["", "Offset", "Cursor"] },
    { "cells": ["Correct under inserts", "No", "Yes"] }
  ]
}
`),
    p('A flat array of rows, each a flat array of strings. That is deliberately less capable than HTML tables — no colspan, no rich text inside cells — and the constraint is the point: an editor cannot build something the renderer cannot draw, and a comparison table almost never needs more.'),

    h3('Make the first cell of each row a header'),
    p('The left-hand column of a comparison table is labelling its row, so it is a `<th scope="row">` rather than a `<td>`. Screen readers use that to announce which row a cell belongs to, and without it a table of numbers is read as a stream of numbers.'),

    h3('Wrap it, and let the wrapper scroll'),
    p('A four-column table will not fit a phone. The wrapper scrolls horizontally and the page does not — the same rule as code blocks, and the same failure if you skip it. The caption goes outside the scrolling region so it stays visible.'),

    h3('Shrink the type before you shrink the padding'),
    p('At narrow widths a table needs to give somewhere. Reducing font size a step and cell padding to the smallest token keeps four columns readable down to about 360px, which is usually enough to avoid a horizontal scroll at all — and a table you can read without scrolling is worth more than one at full size that you cannot.'),
    img('table-shape', 'A grid of plain values constrained to a fixed number of columns', 'Deliberately less capable than HTML. An editor cannot build what the renderer cannot draw.'),

    h2('What does the renderer teach you about the schema?'),
    p('That the two should be designed together, because every branch in the renderer is a decision the Studio should be enforcing.'),
    p('If the renderer handles `h2`, `h3`, `h4`, bullets, numbers, blockquote, code and image — then the block schema should allow exactly those. An editor offered `h6` will eventually use it, and a renderer that ignores it produces content that exists in the CMS and not on the site, which is confusing for everyone.'),

    h3('Every custom block needs a rendering plan first'),
    p('Shipping only the schema half of a feature creates content that exists nowhere the reader can ever actually see it.'),
    p('It is tempting to add a block type in the Studio and render it later. In practice "later" means an editor creates content that vanishes. Add the schema type and the renderer branch in the same change.'),

    p('It is the same discipline that keeps a [design system from drifting](/blog/reusable-design-system): the thing that enforces a rule has to be the thing people actually interact with, not a document describing what they should do.'),

    h3('Keep the shared logic in one module'),
    p('This is the highest-leverage structural decision in the whole content layer.'),
    p('Heading ids, the published test, related-post selection — anything both the renderer and the pages need should live in one file that both import. Two implementations of "which posts are published" is how a card links to a page that was never generated.'),
    quote('Portable Text is flat because flat data survives. The nesting your HTML needs is your renderer\'s job, and lists are where you find that out.'),

    h2('What does it cost?'),
    p('An afternoon to write, and very little after.'),
    p('The eighty lines here handle paragraphs, three heading levels, both list types, blockquotes, code blocks, tables, images and four inline marks. It has needed changing twice since it was written, both times to add a block type, and each was a small branch beside the others.'),
    p('The counterweight worth naming: this only stays cheap because the schema is restricted. A renderer written defensively against an open-ended content model grows quickly, and at that point the library exists for a reason. Own the renderer while it fits on a screen, and reach for a package when it does not.'),

    h2('Conclusion'),
    p('Coalesce list items before rendering — Portable Text stores each bullet as a sibling block, so a naive pass produces one list per item. Match on the `listItem` value rather than its presence, or an adjacent bulleted and numbered list merge into one and lose their numbering.'),
    p('Resolve marks against `markDefs` and treat anything unresolved as a decorator. More broadly, make every unexpected input a no-op: an unknown block type, an empty block, a missing image, an unrecognised code language. A renderer that throws turns a content edit into a failed build.'),
    p('Put heading ids in one function used by both the renderer and the contents list. Two implementations agree on most headings and disagree on the ones with punctuation, which produces a contents list that mostly works — the hardest kind of bug to notice.'),
    p('Highlight code at build time so nothing ships to the client, give wide blocks their own horizontal scroll so the document never scrolls sideways, and resolve body images upload-then-file-then-nothing so unmade artwork is invisible rather than broken.'),
    p('Then design the schema and the renderer together. Every branch in the renderer is a rule the Studio should enforce, and an editor offered a heading level nobody renders will eventually use it. Write your own while it fits on one screen — past that, the library\'s conventions start earning their keep. If you are modelling content and want the schema and the rendering thought about at the same time, [that is worth an hour](/start).'),
  ),
  faqs: faq([
    ['Why does Portable Text render one list per bullet?',
     'Because each list item is a separate top-level block with a listItem property — there is no container in the data. The renderer has to walk the array and consume adjacent blocks sharing the same listItem value into a single list element.'],
    ['Should you use a Portable Text library or write your own?',
     'Write your own while it fits on one screen. Around eighty lines covers paragraphs, headings, both list types, quotes, code, tables and images, and adding a custom type is one branch. On a content model with a dozen custom types, a library\'s conventions start paying.'],
    ['How do you keep a table of contents in sync with heading ids?',
     'One function derives the ids, and both the renderer and the contents list call it. Two implementations agree on simple headings and disagree on punctuation or duplicates, producing a contents list where most links work and a few scroll nowhere.'],
    ['What should a renderer do with an unknown block type?',
     'Skip it silently. The same applies to unresolved marks, empty blocks, missing images and unknown code languages. The cost of tolerance is a slightly wrong-looking block; the cost of strictness is a build failure caused by somebody editing content.'],
  ]),
};
