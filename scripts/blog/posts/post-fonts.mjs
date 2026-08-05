import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/self-host-fonts-inline-icons/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-self-host-fonts-inline-icons',
  slug: 'self-host-fonts-inline-icons',
  title: 'Killing Every Third-Party CSS Request',
  category: 'frontend',
  order: 67,
  readTime: '13 min read',
  date: 'March 2026',
  publishedAt: '2026-03-28',
  series: 'Foundations',
  excerpt:
    'Two render-blocking hops to other people\'s servers, removed. Self-hosted fonts with the right preload, and icons as inline SVG instead of a webfont.',
  coverLabel: 'Self-hosted fonts and inline icons — cover',
  body: body(
    p('This site used to make two requests to servers I do not control before it could paint anything: one to `fonts.googleapis.com` for a stylesheet, one to `cdnjs.cloudflare.com` for an icon font. Both were in the `<head>`. Both were render-blocking.'),
    p('Each of those is a DNS lookup, a TLS handshake and a round trip to somewhere else, and the second one only *starts* after the first one finishes — because the Google stylesheet then triggers font files from a third origin. On a good connection nobody notices. On a phone on mobile data, which is [where most of this site\'s traffic arrives](/blog/mobile-hero-viewport), it is the difference between a page that appears and a page that thinks about it.'),
    p('Removing both took an afternoon and changed how the site starts up. Here is what that involved and what it costs to maintain.'),

    h2('What is actually slow about a font CDN?'),
    p('Not the file. The chain of things that have to happen before the file is even requested.'),
    ol([
      '**Parse the `<link>`** in your HTML and discover a new origin.',
      '**DNS, TCP and TLS** to that origin — three round trips before a single byte of CSS arrives.',
      '**Download and parse the stylesheet,** which contains `@font-face` rules pointing at *another* origin.',
      '**DNS, TCP and TLS again** to that second origin.',
      '**Download the font files,** and only now can text render in its intended face.',
    ]),
    p('That is two connection setups in series, and the browser cannot start step four until step three has finished parsing. Preconnect hints help with the handshakes and cannot remove the dependency — the second request genuinely does not exist until the first is parsed.'),
    p('Self-hosting collapses the whole chain. The font files are on the origin you already connected to in order to fetch the HTML, so there is no new connection at all, and you can tell the browser about them in the same document.'),
    img('request-chain', 'A sequence of dependent network steps across two additional origins', 'Two connection setups in series, and the second cannot begin until the first has been parsed.'),

    h2('And the privacy argument?'),
    p('It is a real one and worth stating plainly rather than as a footnote.'),
    p('A font request sends the visitor\'s IP address, user agent and referring page to a third party, on every page load, for every visitor. In several jurisdictions that has been found to be a data transfer requiring a legal basis — German courts have ruled specifically on the Google Fonts case, and it has produced actual claims against site owners.'),
    p('Self-hosting removes the question entirely. There is no third party, so there is nothing to disclose, nothing to obtain consent for, and no dependency on someone else\'s privacy policy staying acceptable.'),

    h2('How do you self-host properly?'),
    p('Download the woff2 files, write your own `@font-face` block, and get three properties right.'),
    code('css', `
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900;      /* one file, the whole weight range */
  font-display: swap;        /* show fallback text immediately */
  font-style: normal;
  unicode-range: U+0000-00FF, U+2000-206F;   /* Latin plus punctuation */
}
`),
    p('`woff2` only. Every browser that matters has supported it for years, and shipping `woff`, `ttf` and `eot` fallbacks alongside it is copying a snippet from 2015 into a modern site — the older formats are 30–50% larger and nothing will ever request them.'),

    img('font-face-anatomy', 'A single declaration covering a full range of weights from one source', 'One file, the whole axis, and a range of weights you could not previously reach.'),

    h3('Variable fonts are usually one file instead of six'),
    p('A variable font covers the whole weight axis in a single file. Where you previously loaded regular, medium, semibold and bold as four requests, you load one — and you can use any weight in between, including the 450 that solves a heading nobody could get right.'),
    p('The caveat: a variable file is larger than any single static weight. If a site genuinely only uses regular and bold, two static files can be smaller. Two weights is roughly the break-even; three or more and variable wins.'),

    p('One practical caution: variable files sometimes carry axes you will never touch — optical size, slant, width. Some foundries publish a trimmed version with only the weight axis, and where they do it is materially smaller. Check what you downloaded before assuming one file is automatically the lighter option.'),

    h3('Subset to the characters you actually use'),
    p('A full Latin-Extended face carries glyphs for languages your site does not have. Subsetting to Latin plus punctuation typically halves the file, and the `unicode-range` descriptor means the browser only downloads a subset when a character in that range appears.'),

    h3('font-display: swap, with one exception'),
    p('`swap` renders fallback text immediately and switches when the font arrives — no invisible text, at the cost of a visible reflow. `optional` avoids the reflow entirely by giving up if the font is not ready almost instantly, which is right for a decorative face where the swap is more distracting than the substitution.'),

    h2('What does preloading change?'),
    p('It moves the font request from "discovered when CSS is parsed" to "started immediately", which is most of the remaining win.'),
    code('html', `
<link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
`),
    p('The `crossorigin` attribute is mandatory even for same-origin fonts. Fonts are fetched in anonymous CORS mode, so a preload without it is a *different* request from the one the CSS will make, and the browser downloads the file twice — one of the more expensive typos available.'),

    p('Preload also does nothing for a font you do not actually use above the fold. A monospace face that only appears inside code blocks halfway down an article should not be competing with the hero for bandwidth — the browser will fetch it when it becomes relevant, which is exactly the right time.'),

    h3('Preload only what paints first'),
    p('Preloading is a priority instruction, so preloading five fonts tells the browser that nothing is more important than fonts, and it competes with the CSS and the hero image. One or two faces that appear above the fold, and let the rest arrive normally.'),

    h3('Match the fallback metrics'),
    p('The reflow when a font swaps is caused by the fallback having different proportions. `size-adjust`, `ascent-override` and `descent-override` on a `@font-face` for the *fallback* let you tune a system font to occupy nearly the same space, which reduces the shift to something imperceptible — this is the cheapest [layout-shift fix](/blog/near-zero-cls) available on a text-heavy page.'),
    img('preload-priority', 'A resource being requested early versus discovered later in a parse sequence', 'Preload starts the request immediately — but it is a priority claim, so preloading everything means prioritising nothing.'),

    h2('Why replace an icon font at all?'),
    p('Because an icon font is a stylesheet, a font file, and a category of failure that has nothing to do with icons.'),
    table('Icon font versus inline SVG', [
      ['', 'Icon font', 'Inline SVG'],
      ['Requests', 'CSS plus a font file', 'None — it is in the HTML'],
      ['Failure mode', 'Tofu boxes or missing glyphs', 'Nothing renders'],
      ['Payload', 'Every glyph, always', 'Only the ones used'],
      ['Styling', 'Colour and size only', 'Any property, any part'],
      ['Accessibility', 'A character screen readers may announce', 'Explicitly decorative or labelled'],
    ]),
    p('The failure mode row is the one that decides it. When an icon font fails to load, `<i class="fa-solid fa-house">` renders a private-use character, which shows as a tofu box or an unrelated glyph. Users see a broken square where a button should be. When an inline SVG is missing, nothing appears — and beside a text label, nothing is invisible rather than wrong.'),

    h3('The payload difference is the whole file versus a path'),
    p('A font ships every glyph it contains whether you use six or six hundred. A site using twenty-five icons ships twenty-five path strings, which is a couple of kilobytes inside HTML that was already being downloaded.'),

    h2('How do you build an inline icon system?'),
    p('A map of geometry, one component that reads it, and the same authoring interface you already had.'),
    code('ts', `
// Keys mirror the Font Awesome class pair, so "fa-solid fa-house" still
// works and nothing that stored an icon name has to change.
export const ICONS: Record<string, [string, string]> = {
  'solid:house': ['0 0 576 512', 'M575.8 255.5c0 18-15 32.1-32 32.1h-32…'],
  'brands:linkedin-in': ['0 0 448 512', 'M100.28 448H7.4V148.9h92.88z…'],
};
`),
    p('Keying on the class pair matters more than it looks. If a CMS already stores `fa-solid fa-house` on a nav item or a service, translating at render time means editors keep the interface they know and no content has to be migrated.'),

    p('The other benefit of a map is that it is a list. Adding an icon is a visible diff, so a review can ask whether the site needs a twenty-sixth one — which is a question nobody gets to ask when icons arrive by class name from a CDN carrying two thousand glyphs.'),

    h3('An unknown icon must render nothing'),
    p('A missing key should produce no element at all. Beside a visible label that is invisible; a placeholder box is a visible defect. The one place to be careful is a standalone icon carrying meaning on its own — there, nothing means the control has no name, so those need a label and a fallback glyph.'),

    h3('Decorative by default, labelled on request'),
    p('Almost every icon sits beside a text label, so it is decorative and should be `aria-hidden`. Announcing "house icon Home" is noise. A component that hides by default and takes an optional `label` prop makes the common case correct without thinking about it.'),

    h3('Fetch the geometry, do not hand-copy it'),
    p('Paths get pasted from a browser inspector, mangled by an editor, and quietly wrong. A script that pulls the real geometry from the icon package and merges it into the map turns adding an icon into one command and removes the transcription step entirely.'),
    code('bash', `
npm run icons -- brands:instagram solid:link
`),
    p('Write that script the same day you write the map. This site documented such a script long before it existed, and in the meantime every icon was pasted by hand — which is exactly the drift a documented-but-absent tool produces.'),
    img('icon-map', 'A lookup of shapes consumed by a single rendering component', 'One map, one component, the same authoring string the CMS already stored.'),

    h2('Where should the SVG actually live?'),
    p('Three options, and the right one depends on how many times the same icon appears.'),
    table('Three ways to ship an SVG icon', [
      ['Approach', 'Cost', 'Right when'],
      ['Inline per use', 'The path repeats in the HTML', 'A handful of uses, small paths'],
      ['A sprite plus `<use>`', 'One definition, references after', 'The same icon many times per page'],
      ['A separate .svg file', 'A request each', 'Large illustrations, not icons'],
    ]),
    p('For a normal site the first is correct and the repetition is a non-issue: gzip collapses a repeated path string to almost nothing, and the alternative costs you a sprite to maintain. The sprite earns its place when one icon appears forty times — a chevron in a long list, a check in a comparison table.'),

    h3('Never a separate request per icon'),
    p('An `<img src="icon.svg">` per icon is the icon-font problem with extra steps: a request each, no ability to colour it with `currentColor`, and a visible pop-in on a slow connection. Fine for a logo, wrong for interface icons.'),

    h3('Use currentColor and inherit'),
    p('An icon whose `fill` is `currentColor` picks up the text colour of whatever contains it, so it darkens on hover, inverts on a dark band and matches a disabled state without a single extra rule. It is one attribute and it removes most icon-colour CSS from a codebase.'),

    h3('Size in em, not px'),
    p('An icon sized in `em` scales with the label beside it, so a button and a caption get proportionate icons from the same component. Fixed pixel sizes are how you end up with an icon that looks right in the nav and oversized in a footnote.'),
    img('svg-placement', 'The same shape delivered three ways with differing repetition and request counts', 'Inline is right until one icon appears dozens of times on a page. Then a sprite starts paying.'),

    h2('What else is worth pulling in-house?'),
    p('Anything render-blocking, and most things that are not.'),
    ul([
      '**Analytics** loaded synchronously in the head. Almost none of it needs to be — defer it, or use something that ships a fraction of the script.',
      '**Embedded widgets** — chat, booking, review badges. Each is another origin, another handshake, and usually more JavaScript than your entire site.',
      '**Icon and UI CSS frameworks** pulled from a CDN for three utility classes.',
      '**Hosted images** on a third-party domain when the same file could sit on your own CDN behind the connection you already have.',
    ]),
    p('The general rule: every additional origin in the critical path costs a connection setup, and connection setups are the expensive part on mobile networks. Count the origins on your page — the number is usually surprising.'),

    img('origin-count', 'A page assembling from one source beside one assembling from several', 'Count the origins in the network panel. One is achievable on a static content page, and the number is usually a surprise.'),

    h3('Third-party CDNs are no longer even a cache win'),
    p('The historical argument for a shared CDN was that a visitor might already have the file cached from another site. Browsers now partition their cache by top-level site precisely to prevent that being a tracking vector, so a shared CDN provides no cross-site cache benefit at all. The argument is simply obsolete.'),

    h2('What does this cost to maintain?'),
    p('An occasional update, and a small amount of discipline about not adding one back.'),
    p('Self-hosted fonts need re-downloading when you want a newer version of the typeface, which is roughly never. Inline icons need one command when a new glyph is required. Neither is ongoing work in any meaningful sense.'),
    p('The real maintenance is social: a CDN `<link>` is one line and looks harmless, so it comes back the next time somebody needs an icon in a hurry. A comment at the top of the stylesheet saying why there are no external requests, and a check in CI for `<link>` tags pointing off-origin, are what actually holds the line.'),
    p('The honest counterweight: you are now responsible for the files. If a font renders badly on some platform, that is yours to debug rather than a CDN\'s to fix, and you have to remember the licence permits self-hosting — most open fonts do, many commercial ones require a specific licence tier, and getting that wrong is a legal problem rather than a technical one.'),
    quote('Every third-party origin in the head is a connection setup before your page can paint. The fix is not faster requests — it is fewer origins.'),

    h2('How do you verify it worked?'),
    p('Four checks, and the first two take two minutes.'),

    h3('Count the origins in the network panel'),
    p('It is the fastest signal available and it needs no tooling beyond a browser.'),
    p('Load the page with the cache disabled and look at the domain column. Every distinct origin is a handshake. On this site the answer is one, and that is the number to aim for on a static content page.'),

    h3('Look for render-blocking resources'),
    p('Lighthouse lists them explicitly. A self-hosted stylesheet is still render-blocking, which is correct — what should not be there is anything on another origin.'),

    h3('Throttle to a slow connection and watch the paint'),
    p('This is the check that reflects what a visitor on mobile data actually experiences.'),
    p('Fast 3G in devtools, then reload and watch. Text should appear immediately in a fallback and switch once; it should never be invisible, and it should never reflow the page around it.'),

    h3('Check the font is fetched once'),
    p('Filter the network panel by font. Two entries for the same file is the missing `crossorigin` on the preload, and it is the single most common self-hosting bug.'),

    h2('Conclusion'),
    p('Self-host the fonts. It removes two connection setups from the critical path — the second of which cannot even begin until the first is parsed — and it removes a third-party data transfer that has produced real legal claims.'),
    p('Ship woff2 only, prefer a variable file above two weights, subset to the characters you use, and set `font-display: swap` unless the face is decorative enough that `optional` is kinder. Then preload the one or two faces that paint first — with `crossorigin`, or the browser downloads each file twice.'),
    p('Replace the icon font with inline SVG. The payload argument is real, but the deciding one is the failure mode: a missing webfont renders tofu boxes where buttons should be, while a missing inline icon renders nothing, and nothing beside a label is invisible rather than broken.'),
    p('Key the icon map on whatever string your CMS already stores so editors keep their interface and no content migrates, make icons decorative by default with an optional label, and write the fetch-geometry script on day one — a documented tool that does not exist is how twenty-five paths end up hand-pasted.'),
    p('Then hold the line: count the origins on your page, put a check in CI for off-origin `<link>` tags, and leave a comment saying why there are none. The line is one line, it looks harmless, and it comes back the moment somebody needs an icon in a hurry. If you have a site with a head full of other people\'s domains, [that is a well-defined afternoon](/start).'),
  ),
  faqs: faq([
    ['Is self-hosting fonts actually faster than a CDN?',
     'Yes, because it removes two connection setups that run in series — the stylesheet origin and then the font origin, where the second request does not exist until the first is parsed. Self-hosted files ride the connection already open for your HTML, and can be preloaded from the same document.'],
    ['Do I still need woff and ttf fallbacks?',
     'No. Every browser in current use supports woff2, and the older formats are 30–50% larger and will never be requested. Shipping them is a 2015 snippet copied into a modern site. Use woff2 only, and prefer a variable file if you use more than two weights.'],
    ['Why is my preloaded font downloaded twice?',
     'The preload is missing the crossorigin attribute. Fonts are fetched in anonymous CORS mode, so without it the preload is a different request from the one the stylesheet makes and the browser fetches the file twice. It is required even for same-origin fonts.'],
    ['Are icon fonts still worth using?',
     'Rarely. They cost a stylesheet plus a font file, ship every glyph whether used or not, and fail by rendering tofu boxes where controls should be. Inline SVG ships only the paths you use, inside HTML already being downloaded, and renders nothing when absent rather than something wrong.'],
  ]),
};
