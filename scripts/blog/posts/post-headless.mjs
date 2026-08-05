import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/headless-chrome-screenshots/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-headless-chrome-screenshots',
  slug: 'headless-chrome-screenshots',
  title: 'Headless Chrome for Social Cards and Visual Checks',
  category: 'performance',
  order: 86,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-10',
  series: 'Foundations',
  excerpt:
    'Generating per-route social cards from real HTML, plus the screenshot helper I use to verify layout work — and the colour bug that fools both.',
  coverLabel: 'Headless Chrome — cover',
  body: body(
    p('Every route on this site has its own social card, generated from the same content the page renders, committed to the repository as a PNG. The generator is a script that opens a headless Chrome, points it at a template, and takes a screenshot. It runs when I ask it to, not on every request.'),
    p('The same browser does a second job: when I change a layout, a small helper opens the affected pages at several viewport widths and writes screenshots to a temporary directory so I can look at them side by side. Neither of these is a test framework and neither needed a dependency I did not already have.'),
    p('This post covers both — how to build them, why build time beats an image service for most sites, and the specific rendering trap that made me distrust my own screenshots for about a day.'),

    h2('Why generate social cards at all?'),
    p('Because the alternative is one image for the entire site, and a card that says nothing specific gets a worse click-through than one that names the article.'),
    p('A link shared in Slack, WhatsApp or on a social platform renders as a card with an image, a title and a description. That image is the largest element of the preview and, for a link with no other context, it is most of the reason somebody clicks. A single default card across ninety pages is a missed opportunity that costs nothing to fix once.'),
    table('Three ways to produce them', [
      ['Approach', 'Cost', 'Best for'],
      ['One static default', 'Free', 'Small sites, early stage'],
      ['Build-time generation', 'Build minutes', 'Known routes — most sites'],
      ['On-demand service', 'Per request, metered', 'User-generated content'],
      ['Manual in a design tool', 'Hours, per page', 'A handful of key pages'],
    ]),
    p('The middle row is where most sites belong and where the tooling pushes people away from, because runtime image generation is the more impressive demo. For a site whose routes are known when it builds, generating the cards once and committing them means no service to depend on, no cold first request and no metered line item — the same argument that applies to [image optimisation generally](/blog/image-optimization-strategy).'),

    h3('Cards must not drift from the page'),
    p('The failure mode of any generated asset is that the content changes and the asset does not. Generating from the same loaders the pages use — rather than from a separate list of titles — means the card and the page cannot disagree, because there is only one source.'),

    h3('Commit them, do not generate on deploy'),
    p('Committed PNGs are reviewable in a pull request, cached forever, and unaffected by a build environment that is missing a browser. Regenerating on every deploy adds a browser download to CI for output that changes rarely.'),
    img('card-sources', 'Route content feeding both a rendered page and its preview image from one place', 'Generate from the same loaders the pages use. Two sources of truth is how a card ends up describing an old title.'),

    h2('How does the generator work?'),
    p('Render an HTML template per route, screenshot it at 1200×630, write the file. That is the entire program.'),
    p('The insight that makes this pleasant is that the card is a web page. You have CSS, web fonts, flexbox and your existing design tokens. There is no image API to learn and no canvas drawing code — you write the card the same way you write anything else, and the browser does the rasterising.'),
    code('ts', `
import puppeteer from 'puppeteer-core';
import { writeFile } from 'node:fs/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

for (const route of routes) {
  await page.setContent(cardHtml(route), { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  const png = await page.screenshot({ type: 'png' });
  await writeFile(\`public/og/\${filename(route)}.png\`, png);
}

await browser.close();
`),
    p('One browser, one page, reused across every route. Launching a browser per card is the most common way to make this slow — the launch is by far the most expensive part, and reusing the page turns ninety cards from minutes into seconds.'),

    h3('Wait for fonts, not just the network'),
    p('`document.fonts.ready` is the line people omit and then wonder why some cards render in a fallback face. `networkidle0` means the requests finished; it does not mean the font is applied and the text has been laid out with it. Both waits are needed.'),

    h3('deviceScaleFactor, not a bigger viewport'),
    p('Setting the viewport to 2400×1260 gives you a card with tiny text. Setting `deviceScaleFactor: 2` on a 1200×630 viewport gives you the same layout at twice the resolution, which is what you want for a preview that platforms may display on a dense screen.'),

    h3('The filename rule has to live in two places'),
    p('The generator writes `work-halo.png` for `/work/halo`; the layout looks for the same name when it emits the meta tag. Those two rules are in different files and must agree, so it is worth a comment in both — a card that generates and is never referenced is an invisible failure.'),
    img('one-browser', 'A single browser instance producing many outputs rather than being started for each one', 'Launch once, reuse the page. A browser launch per card is what turns seconds of work into minutes.'),

    h2('What goes on the card?'),
    p('The title, large enough to read at thumbnail size, and almost nothing else.'),
    p('Previews are displayed small and often cropped. A card with a paragraph of description, a logo, a border and a decorative illustration reads as a grey rectangle in a chat window. Two lines of large type and a single identifying mark survives the downscale.'),

    h3('Clamp the title, do not shrink it'),
    p('Auto-fitting the type to the length of the title produces cards where a long headline is unreadably small. Setting one size and clamping to three lines with an ellipsis is the more predictable choice, and it forces the shorter titles that were better anyway.'),

    h3('Design for the crop'),
    p('Different platforms crop differently, and some show a square. Keeping the meaningful content within a safe centre region means the card survives all of them, which is easier than producing a variant per platform.'),

    h3('Check the contrast, because nobody else will'),
    p('A card is text on a background and it is subject to the same legibility rules as the rest of the site, except that no linter looks at it and no screen reader will ever read it aloud. A tasteful low-contrast subtitle that clears review on a large monitor is unreadable at the size a preview is actually shown.'),

    h3('Vary by category, not by page'),
    p('A per-category accent colour gives visual variety and needs no per-page decision. Per-page artwork is lovely and does not scale past about ten pages, which is exactly when you stop making them.'),

    h2('Can the same browser check your layout work?'),
    p('Yes, and it is more useful day to day than the card generator.'),
    p('When I change spacing or a breakpoint, the question is what it looks like at 375, 768 and 1280 pixels wide, on the four pages that use the component. Answering that by dragging a browser window is slow and I miss things. A twenty-line script that writes twelve screenshots to a temporary directory answers it in about fifteen seconds.'),
    code('ts', `
const WIDTHS = [375, 768, 1280];
const ROUTES = ['/', '/services', '/blog', '/work'];

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([
      // Animating, filter-composited layers screenshot pale. See below.
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ]);
    await page.goto(\`http://localhost:4322\${route}\`, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: \`/tmp/vt/\${route.replace(/\\W/g, '_')}-\${width}.png\`,
      fullPage: true,
    });
  }
}
`),
    p('This is not visual regression testing. There is no baseline, no diff and no threshold — it is a faster way to look at things, and for a portfolio-sized project that is the right amount of machinery.'),

    h3('Point it at the dev server'),
    p('Screenshotting the running dev server rather than a production build means the loop is edit, run, look. Remember that the port moves when 4321 is busy, which is the most common reason this script appears to hang.'),

    h3('fullPage for layout, viewport for above-the-fold'),
    p('A full-page capture is right for checking spacing rhythm and section order. For checking what a phone user sees before scrolling — which is [the constraint that matters most](/blog/mobile-hero-viewport) — capture the viewport only, at the real height.'),

    h3('When a baseline is worth it'),
    p('Once several people are changing the CSS, a stored baseline and a pixel diff in CI starts earning its keep, because nobody can see a two-pixel regression by eye. Below that team size the diff maintenance costs more than it catches.'),
    img('viewport-matrix', 'The same routes captured across several widths and arranged for comparison', 'Twelve screenshots in fifteen seconds. Not regression testing — just a faster way to look at four pages at three widths.'),

    h2('Why did my screenshots have the wrong colours?'),
    p('Because headless Chrome renders actively-animating, filter-composited layers pale — and it does it silently.'),
    p('This cost me most of a day. A section with a blurred blue glow behind it screenshotted as a washed-out grey, so I went looking for a CSS bug that did not exist. The element was correct; the capture was not. Anything on its own compositing layer, mid-animation, with a `filter` applied, can be captured before the effect resolves.'),

    h3('Emulate reduced motion before capturing'),
    p('`emulateMediaFeatures` with `prefers-reduced-motion: reduce` stops the loops, and since [every animation here is already disabled under that preference](/blog/prefers-reduced-motion), the page reaches a stable state on its own. This is the fix, and it is one line.'),

    h3('getComputedStyle is the source of truth'),
    p('When a screenshot and your expectation disagree, do not trust either — evaluate the actual computed value in the page. It settles the question in seconds and it is the habit that stopped me chasing rendering artefacts as if they were bugs.'),
    code('ts', `
// Ask the page rather than the picture.
const bg = await page.$eval('.ai-band', (el) => getComputedStyle(el).backgroundColor);
console.log(bg); // the truth, regardless of what the PNG looks like
`),

    h3('Other things that capture wrong'),
    p('Lazy-loaded images below the fold are frequently missing from a `fullPage` capture, because the viewport never reached them. Scrolling the page to the bottom and back before capturing fixes it. Sticky elements can also duplicate in a full-page shot, which is a known behaviour rather than a layout bug.'),
    img('pale-capture', 'A composited effect appearing washed out in a capture while the live element is fully saturated', 'The element was correct; the capture was not. Emulate reduced motion first, and treat computed styles as the source of truth.'),

    h2('How do you stop the cards going stale?'),
    p('By making the missing case harmless and the regeneration cheap, rather than by remembering to run a script.'),
    p('A generated asset that is committed will eventually fall behind the content it describes, because publishing a post and regenerating a card are two actions and only one of them is required. The answer is not discipline — it is arranging things so the gap does not break anything.'),

    h3('Fall back to a default, checked at build time'),
    p('The layout looks for the route\'s card on disk and uses `og/default.png` when it is absent. That single check means a new page with no card ships a generic preview rather than a broken image or a 404 in somebody\'s chat client, which is the difference between a shrug and a bug report.'),

    h3('Check on the filesystem, not from a bundled module'),
    p('The obvious way to test for a file relative to the component is wrong once the component is bundled, because the module ends up somewhere in the output directory and the relative path resolves against that. Resolving from the working directory is correct in both dev and build — and this fails only in production, which is what makes it easy to ship.'),

    h3('Regenerate on content changes, not on a schedule'),
    p('The trigger that actually works is publishing. Adding card regeneration to whatever ritual already surrounds a new post — the same pass that rebuilds and checks the feed — keeps them current without anybody tracking it separately.'),
    img('stale-fallback', 'A route without its own preview image resolving to a generic one rather than to nothing', 'Make the missing case harmless. A new page with no card ships a generic preview, not a broken image in somebody’s chat client.'),

    h2('Should this run in CI?'),
    p('The card generation, no. The screenshots, only once a baseline is worth maintaining.'),
    p('Running a browser in CI means installing one, which adds a couple of hundred megabytes and a minute to every build for output that changes when content changes — not when code does. Committing the PNGs and regenerating deliberately is simpler and it keeps the build fast.'),

    h3('Use puppeteer-core with a local Chrome'),
    p('`puppeteer` downloads its own Chromium on install, which is a large dependency for something you run occasionally. `puppeteer-core` pointed at the Chrome already on the machine avoids that entirely, at the cost of an absolute path that only works on your platform — a fair trade for a script that only you run.'),

    h3('Make it a script, not a build step'),
    p('An `npm run og` that regenerates the cards is discoverable, cheap to run and impossible to accidentally slow the deploy with. The rule I use is that anything requiring a browser is a command somebody types, not something the pipeline does.'),

    h3('Where a browser does belong in CI'),
    p('End-to-end tests on the critical paths — checkout, signup, the contact form — are worth the install cost because they catch failures that matter. A social card that renders slightly wrong is not in that category, which is the whole distinction and it is [the same one that decides what gets tested](/blog/testing-critical-paths).'),

    h2('What else can you do with it?'),
    p('A few things that have earned their place, and one that has not.'),

    h3('PDF export from a real page'),
    p('`page.pdf()` renders a print stylesheet to a real PDF, which is a legitimate alternative to building the document programmatically. It is better at layout and worse at fine control, and for anything invoice-shaped it is usually the faster route.'),

    h3('Rendering charts for email'),
    p('Email clients do not run JavaScript, so a chart in a digest has to be an image. Rendering the same chart component in a headless browser and screenshotting it means one implementation for both surfaces rather than two.'),

    h3('Checking what a crawler sees'),
    p('Loading a page with JavaScript disabled and capturing the result answers the question directly, and it is a quicker sanity check than reading a rendering report. For a static site it should look almost identical, which is the point.'),

    h3('What it is not good for'),
    p('Scraping at volume, and screenshotting third-party sites. Both are technically easy, both get you blocked, and one of them may not be yours to do. If a service publishes an API, use the API.'),
    img('other-uses', 'A single rendering engine producing a document, a chart image and a no-script capture', 'Same engine, several jobs: print-stylesheet PDFs, chart images for email, and a direct look at the no-JavaScript page.'),

    h2('What does it cost?'),
    p('An afternoon for both scripts, and nothing to keep.'),
    p('The card generator was around two hours including designing the template, and the screenshot helper was twenty minutes. Neither has needed maintenance beyond changing a route list, because the surface area is small and there is no baseline to keep current.'),
    p('The honest counterweight: a local Chrome path makes this machine-specific, and a script only I can run is a script that stops working the moment anybody else needs it. That is an acceptable trade for a one-person project and a bad one for a team — at which point the browser belongs in CI with a pinned version and a proper install step, and the afternoon becomes a day. Know which situation you are in before copying this.'),
    quote('A social card is a web page. Once you accept that, there is no image API to learn — you write CSS and let the browser rasterise it.'),

    h2('Conclusion'),
    p('Per-route social cards are worth generating because the preview image is most of why somebody clicks a bare link, and generating them from the same loaders the pages use is what stops the card describing a title that changed six months ago. Commit the PNGs; they are reviewable, permanently cached, and unaffected by a CI environment with no browser in it.'),
    p('The generator is short because the card is a web page — real CSS, real fonts, real tokens. Launch one browser and reuse the page across every route, wait on `document.fonts.ready` as well as the network, and use `deviceScaleFactor: 2` rather than a larger viewport. Keep the route-to-filename rule commented in both places it exists.'),
    p('The same browser doing layout checks is the more useful of the two day to day. Twelve captures across three widths and four routes takes about fifteen seconds and is not a test suite — it is a faster way to look, which is the right amount of machinery until several people are editing the CSS.'),
    p('Emulate `prefers-reduced-motion: reduce` before capturing anything. Headless Chrome renders animating, filter-composited layers pale, and it does it silently — when a capture and your expectation disagree, ask `getComputedStyle` rather than trusting either.'),
    p('Keep both out of the build. A browser in CI is worth its install cost for end-to-end tests on paths where failure matters, and not for regenerating an asset that changes with content rather than code. If you want a look at how this fits alongside the rest of a build, [the stack page has the shape of it](/stack).'),
  ),
  faqs: faq([
    ['Why generate social cards at build time instead of on demand?',
     'For a site whose routes are known when it builds, generating once removes a runtime dependency, a metered per-image cost and a slow first request. On-demand generation earns its place when the content is user-generated and the set genuinely cannot be enumerated in advance.'],
    ['Why do my generated cards use the wrong font?',
     'Almost always a missing wait on document.fonts.ready. networkidle0 tells you the requests finished, not that the font has been applied and the text relaid out with it. Wait for both before screenshotting, and use deviceScaleFactor rather than a larger viewport for resolution.'],
    ['Why are colours washed out in headless screenshots?',
     'Headless Chrome captures actively-animating, filter-composited layers before the effect resolves, so glows and blurs come out pale. Emulate prefers-reduced-motion: reduce before capturing, and treat getComputedStyle inside the page as the source of truth rather than the image.'],
    ['Should headless Chrome run in my CI pipeline?',
     'For end-to-end tests on paths where failure is expensive, yes. For regenerating social cards, no — it adds a browser install and a minute to every build for output that changes with content rather than code. Commit the images and regenerate with a command you type.'],
    ['Is this visual regression testing?',
     'No. There is no stored baseline, no pixel diff and no threshold — it is a script that captures several routes at several widths so you can look at them together. A real baseline starts earning its keep once several people are changing the CSS and nobody can spot a two-pixel shift by eye.'],
  ]),
};
