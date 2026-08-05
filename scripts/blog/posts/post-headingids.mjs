import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/toc-shared-heading-ids/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-toc-shared-heading-ids',
  slug: 'toc-shared-heading-ids',
  title: 'The Table of Contents That Points at Nothing',
  category: 'frontend',
  order: 74,
  readTime: '12 min read',
  date: 'April 2026',
  publishedAt: '2026-04-14',
  series: 'Foundations',
  excerpt:
    'Two slugifiers agree on most headings and disagree on the ones with punctuation. One function, used by both the renderer and the contents list.',
  coverLabel: 'Shared heading ids — cover',
  body: body(
    p('A contents list is a set of links to fragments. The renderer stamps ids onto headings; the list links to them. If those two things are computed in different places, they will agree on almost every heading and disagree on a few — and the few are the ones with a colon, an ampersand, or a duplicate title.'),
    p('That is a nasty shape of bug. It is not obviously broken: nine links work, one scrolls nowhere, and nobody reports it because they assume they mis-clicked. It survives review because reviewing a contents list means looking at it, not clicking every entry.'),
    p('The fix is structural rather than careful: one function decides ids, and both consumers call it. Here is what that function has to handle, and the failure modes it prevents.'),

    h2('Why do two implementations drift?'),
    p('Because slugifying is a series of small decisions and nobody makes the same series twice.'),
    table('Where two slugifiers disagree', [
      ['Heading', 'One might produce', 'The other might'],
      ['What about PUT or PATCH?', 'what-about-put-or-patch', 'what-about-put-or-patch-'],
      ['Errors: what to return', 'errors-what-to-return', 'errors--what-to-return'],
      ['R2 vs S3', 'r2-vs-s3', 'r2-vs-s3'],
      ['Cost & timeline', 'cost-timeline', 'cost--timeline'],
      ['Conclusion (second one)', 'conclusion-2', 'conclusion-1'],
    ]),
    p('Trailing punctuation, collapsing repeated separators, and how duplicates are suffixed — three decisions, each with two reasonable answers, and eight possible combinations of which only one matches.'),
    p('The last row is the worst because it is the one that appears on a well-structured article. Any post with two sections called "Conclusion" or two called "Overview" needs distinct ids, and every disambiguation scheme implemented twice will eventually diverge.'),
    img('two-slugifiers', 'The same inputs producing mostly matching but occasionally different outputs', 'Nine links work and one does not. Nobody reports it, because they assume they mis-clicked.'),

    h2('What does the shared function look like?'),
    p('It walks the content once, produces an ordered list of headings with final ids, and is the only thing in the codebase that decides what an id is.'),
    code('ts', `
export function headings(blocks: Block[] = []): TocEntry[] {
  const seen = new Map<string, number>();
  const out: TocEntry[] = [];

  for (const b of blocks) {
    if (b._type !== 'block' || (b.style !== 'h2' && b.style !== 'h3')) continue;
    const text = blockText(b);
    if (!text) continue;

    const base = slug(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ id: n ? \`\${base}-\${n + 1}\` : base, text, level: b.style === 'h2' ? 2 : 3 });
  }
  return out;
}
`),
    p('The renderer consumes this in document order and stamps `out[i].id` onto the i-th heading. The contents list consumes the same array and links to the same ids. Neither computes anything.'),

    h3('The order dependency is the whole design'),
    p('Because ids depend on how many times a slug has been seen, the function has to see every heading in order to be correct. That means the renderer must consume the list positionally rather than re-deriving per heading — a cursor incremented as it renders, not a lookup by text.'),
    code('ts', `
// The renderer walks the same array with a cursor. No recomputation.
let cursor = 0;
const id = headingIds[cursor++];
`),

    img('one-source', 'A single computation feeding two separate consumers', 'Neither consumer computes anything. That is the property that makes disagreement impossible rather than unlikely.'),

    h3('Filter identically in both consumers'),
    p('If the function includes h4 and the contents list filters them out for display, that is fine — the ids still match. What breaks is filtering *before* the ids are assigned, because the duplicate counter then sees a different sequence and the numbering diverges again.'),

    h2('What does the slugifier itself need to handle?'),
    p('Five cases, and the fifth is the one that produces a link to the top of the page.'),
    ul([
      '**Lowercase and trim** — the easy part.',
      '**Strip punctuation** rather than replacing it, or "PUT or PATCH?" gains a trailing separator.',
      '**Collapse runs of separators** so "Cost & timeline" does not produce a double hyphen.',
      '**Strip leading and trailing separators** after the collapse, not before.',
      '**Handle a result that is empty** — a heading in a non-Latin script, or one that is only punctuation.',
    ]),
    p('That last case is the silent one. A heading that slugifies to an empty string produces `id=""`, which is an invalid fragment; the link goes to the top of the page and the contents list appears to have one entry that does nothing. Falling back to a positional id — `section-4` — keeps it navigable.'),

    h3('Decide about non-Latin scripts deliberately'),
    p('Transliterating, percent-encoding the original, or falling back to a positional id are all defensible. What is not defensible is stripping the characters and ending up with nothing, which is what a naive regular expression does by default.'),

    h3('Cap the length'),
    p('Long fragments are also the ones most likely to get truncated when pasted into a chat client.'),
    p('A twelve-word heading produces an unwieldy fragment that is awkward to share and awkward to read in a URL bar. Truncating at a word boundary around sixty characters is a reasonable default, and it has to happen before the duplicate check so two long headings sharing a prefix still get distinct ids.'),
    img('slug-pipeline', 'A transformation applied in a fixed order with a fallback at the end', 'The order matters: collapse, then trim. And something has to catch the case where nothing survives.'),

    h2('Why not just generate ids in the renderer?'),
    p('Because then the contents list has to read them back out of the rendered output, which is worse in every direction.'),
    p('In a server-rendered context you could render the body, parse the HTML, extract the headings and build a list. That means rendering twice, or rendering to a string and parsing it — and it makes the contents list depend on the exact markup the renderer produces, which is a far more fragile coupling than sharing a function.'),

    p('There is also a client-side version of the same mistake, which is generating ids in a script after the page loads. It works until somebody arrives on a URL with a fragment already in it — the browser tries to scroll before the ids exist, finds nothing, and the reader lands at the top of an article they were linked into the middle of.'),

    h3('Deriving is better than storing'),
    p('The other tempting option is storing ids in the content itself, assigned when the heading is written. That keeps them stable across edits, which sounds appealing until an editor changes a heading and the id no longer bears any relation to it — and until two editors in two documents produce colliding ids that nothing checks.'),
    p('Derivation keeps ids correct by construction. The cost is that rewording a heading changes its fragment, which matters if you have published those links externally — and does not matter at all for an in-page contents list, which is regenerated with the page.'),

    h3('If you must keep fragments stable, be explicit'),
    p('For documentation where people bookmark deep links, an optional authored id field is worth having: derive by default, honour an override when set. That gives stability where it is needed without making every heading carry a field nobody fills in.'),

    h2('What else should the shared module own?'),
    p('Anything both the pages and the renderer need to agree about, because each of those is the same bug in a different costume.'),
    ol([
      '**Which posts are published.** One definition, or a card links to a page that was never generated.',
      '**Related-post selection.** The same rule for the card list and the schema, or structured data claims a relationship the page does not show.',
      '**Reading-time or word-count calculation,** if it appears in more than one place.',
      '**Heading ids,** as above.',
    ]),
    p('The first is the highest-consequence. On this site a post is published by having a body — that single predicate decides which pages exist, which appear in the feed, which are in the sitemap, and which cards are clickable. Two implementations of it means a card linking to a 404, and the failure is invisible in a build that reports success.'),

    p('This is the same argument as [a single source for anything two places read](/blog/portable-text-renderer), and the blog is where it shows up most because the content layer has so many consumers: the page, the feed, the sitemap, the structured data and the contents list all describe the same posts.'),

    h3('The test for whether something belongs there'),
    p('Ask whether two parts of the codebase could ever disagree about it and produce a broken link, a missing page or contradictory structured data. If yes, it is shared logic, and it belongs in one module both import rather than being implemented where it is needed.'),

    h2('How do you catch this in CI?'),
    p('By resolving every internal fragment against the page it points into, which is about twenty lines and catches the whole class.'),
    code('ts', `
// For each built page: every href="#…" must match an element id on that page.
const ids = new Set([...doc.querySelectorAll('[id]')].map((el) => el.id));
const broken = [...doc.querySelectorAll('a[href^="#"]')]
  .map((a) => a.getAttribute('href')!.slice(1))
  .filter((frag) => frag && !ids.has(decodeURIComponent(frag)));
`),
    p('Run it over the built output rather than the dev server, and over every page rather than a sample — the failures cluster in the posts with unusual headings, which are by definition the ones you did not think to check.'),

    p('It is worth deciding what the check does about links to fragments that are legitimately absent — a `#main` skip target that only exists on some layouts, or an anchor into a third-party embed. An allowlist keeps the check useful rather than noisy, and a noisy check is one somebody eventually disables.'),

    h3('Check cross-page fragments too'),
    p('A link to `/blog/other-post#some-section` is the same class of bug with an extra hop. Resolving those means loading the target page, which is slower but not difficult, and it catches links that broke because somebody reworded a heading in a different file.'),

    h3('Assert that ids are unique'),
    p('It is a two-line assertion that proves the most subtle part of the whole function is doing its job.'),
    p('Two elements sharing an id is invalid HTML and makes the first one unreachable by fragment. The duplicate-suffix logic exists to prevent it, and a test that counts ids per page proves the logic is working rather than assuming it.'),
    img('fragment-check', 'Links being resolved against the identifiers actually present on a page', 'Twenty lines over the built output catches the entire class, including the headings you would not have thought to test.'),

    h2('Do heading ids matter beyond the contents list?'),
    p('Yes, in three ways that are easy to overlook because none of them are visible on your own page.'),
    table('Who else uses your fragments', [
      ['Consumer', 'What it does with them'],
      ['Search engines', 'Links directly to a section from a result'],
      ['People sharing', 'Sends a colleague to the exact paragraph'],
      ['Your own cross-links', 'Points one article at a section of another'],
      ['Assistive technology', 'Offers a heading list for navigation'],
    ]),
    p('The first is the one with a business consequence. A search result can deep-link into a specific section when the structure supports it, and that lands somebody exactly where their question is answered rather than at the top of a 2,500-word article. That only works if the ids are stable and meaningful.'),

    h3('Meaningful beats short'),
    p('`#how-should-you-version` is better than `#h2-4` for every consumer on that list. A person can read it in a shared URL, a search engine can infer what the section covers, and a broken one is diagnosable. Positional ids are a fallback for the empty case, not a scheme.'),

    h3('Stability matters more once links leave your site'),
    p('An in-page contents list regenerates with the page, so a changed id is harmless. A link somebody sent a colleague six months ago is not. Once an article is established, treat its heading text as part of its contract — or add the authored-override field and use it on the sections people actually link to.'),

    h3('The heading list is a navigation surface'),
    p('Screen readers offer a list of headings as a way to move through a document, which is the same job the contents list is doing visually. That is a good reason to make sure the levels are correct — an article that goes h2, h4, h2 is confusing in that list in a way it is not on screen.'),
    img('fragment-consumers', 'One set of identifiers being used by several different kinds of reader', 'The contents list is one consumer. Search results, shared links and assistive navigation are three more.'),

    h2('What about the anchor links on the headings?'),
    p('The small link beside a heading that gives you its URL — worth having, and worth getting the details right.'),

    h3('Hide it until hover, keep it reachable by keyboard'),
    p('A permanent anchor mark beside every heading is visual noise in a long article. Fading it in on hover of the heading keeps the reading view clean; adding `:focus-visible` to the same rule keeps it usable for anyone tabbing through.'),
    code('css', `
.pt-anchor { opacity: 0; transition: opacity .18s ease; }
.pt-anchored:hover .pt-anchor,
.pt-anchor:focus-visible { opacity: 1; }
`),

    h3('Give it an accessible name'),
    p('A `#` character is announced as "pound sign" or skipped entirely. `aria-label="Link to this section"` makes it a meaningful control rather than punctuation somebody has tabbed onto.'),

    h3('Add scroll-margin so the target clears fixed chrome'),
    p('Jumping to a fragment puts the heading at the very top of the viewport, which is behind a sticky header. `scroll-margin-top` on the heading fixes it, and it should be a token so every anchor on the site clears the same distance.'),

    h2('What does the contents list itself need?'),
    p('Less than people build, and one thing most omit.'),
    p('The omission is a current-section indicator. A contents list that is sticky for the whole read shows where you *could* go and never where you *are*, which on a long article is most of its value missing. Marking the last heading past a reading line covers it, and it is perhaps thirty lines.'),

    img('current-section', 'A navigation list marking which of its entries corresponds to the reader\'s position', 'A sticky list without this shows where you could go and never where you are.'),

    h3('Scroll the list, never the page'),
    p('If the list scrolls internally, moving the active entry into view must scroll the list itself. `scrollIntoView` on the entry drags the document along with it and fights the reader — a bug that only appears once the list is long enough to overflow.'),

    p('Reading position is the signal to use rather than element visibility. With several headings on screen at once, "which section am I in" is a question about where the scroll is, not about what is visible — so the last heading past a line about a quarter down the viewport is the right answer, and it is [the same reasoning that applies to any scroll-linked state](/blog/gsap-lenis-smooth-scroll).'),

    h3('Do not hide entries the reader might want'),
    p('Collapsing sub-sections under their parent keeps a long list navigable, and the collapsed entries must stay in the DOM so crawlers still see the structure and the parent link still reaches the section. Removing them from the markup to tidy the list removes them from the page\'s structure too.'),
    quote('Nine links work and one does not. That is not a smaller bug than all ten failing — it is a harder one, because nobody reports it.'),

    h2('What does this cost?'),
    p('An hour to build properly, and it is one of the clearest cases of structure preventing a whole bug class rather than fixing instances of it.'),
    p('The function is thirty lines, the fragment check in CI is twenty, and the anchor and scroll-margin details are a handful of CSS. What it buys is that no future heading, however punctuated, can produce a contents entry that goes nowhere — because there is no second implementation to disagree with the first.'),
    p('The honest counterweight: the shared-module discipline does add indirection. Somebody reading the renderer has to open another file to find out how ids are decided, and on a small site with three headings per page that indirection is not obviously earning its keep. It starts earning it the moment there are two consumers, which for a contents list is immediately.'),

    h2('Conclusion'),
    p('Compute heading ids in one function and have both the renderer and the contents list consume its output. Two slugifiers agree on simple headings and disagree on punctuation and duplicates, which produces a list where most links work — the hardest kind of failure to notice.'),
    p('Make the function order-dependent and consume it positionally. Duplicate suffixing needs to see every heading in sequence, so the renderer walks the array with a cursor rather than re-deriving an id per heading.'),
    p('Handle the slugifier\'s five cases properly, especially the empty result: a heading that strips to nothing produces an invalid fragment and a link to the top of the page. Fall back to a positional id, and decide about non-Latin scripts deliberately rather than by regular expression default.'),
    p('Put everything else two consumers could disagree about in the same module — which posts are published above all, since two implementations of that means a card linking to a page that was never generated, in a build that reports success.'),
    p('Then add the fragment check in CI over the built pages. Twenty lines resolving every `#` link against the ids actually present catches the entire class, including the headings nobody thought to test. And give the contents list a current-section indicator, because a sticky list without one is showing where you could go and never where you are. If you have a site where some in-page links quietly go nowhere, [that is a quick thing to find](/start).'),
  ),
  faqs: faq([
    ['Why do some table-of-contents links not work?',
     'Almost always because the ids are computed in two places. Two slugifiers agree on simple headings and disagree on trailing punctuation, repeated separators or duplicate titles — so most links work and a few scroll nowhere, which nobody reports because they assume they mis-clicked.'],
    ['Should heading ids be stored in the content or derived?',
     'Derived, for an in-page contents list — stored ids go stale the moment somebody edits a heading. Add an optional authored override only where deep links are published externally and need to stay stable, so most headings carry no field at all.'],
    ['How do you handle two sections with the same heading?',
     'Suffix duplicates by counting occurrences as you walk the content in order. This is exactly why the id logic must be shared: every disambiguation scheme implemented twice eventually diverges, and the divergence lands on well-structured articles with two Conclusions.'],
    ['How do you test for broken in-page links?',
     'Over the built pages, collect every element id and every href starting with a hash, and assert each fragment resolves. It is about twenty lines, catches the whole class, and should run on every page rather than a sample — the failures cluster in posts with unusual headings.'],
  ]),
};
