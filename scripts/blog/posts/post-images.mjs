import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/image-optimization-strategy/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-image-optimization-strategy',
  slug: 'image-optimization-strategy',
  title: 'Images Are the Performance Problem',
  category: 'performance',
  order: 81,
  readTime: '13 min read',
  date: 'May 2026',
  publishedAt: '2026-05-02',
  series: 'Foundations',
  excerpt:
    'Format, dimensions, the sizes attribute nobody sets, and why build-time optimisation beats an on-demand service for most sites.',
  coverLabel: 'Image optimisation — cover',
  body: body(
    p('On most sites images are the majority of the transferred bytes and the cause of the largest contentful paint. They are also the part of the stack nobody owns — a designer exports them, a content editor uploads them, and a developer notices six months later that the hero is 1.4MB.'),
    p('The work is not difficult and it is unusually well-defined: pick the right format, ship the right dimensions, reserve the space, and decide once whether optimisation happens at build time or on demand. Four decisions that between them determine most of a page\'s weight.'),
    p('Here is the version I apply, in the order that removes the most bytes first.'),

    h2('Which format should you actually use?'),
    p('AVIF where you can, WebP as the fallback, and the original only for browsers that need it — which by now is almost none.'),
    table('The formats worth shipping', [
      ['Format', 'Size vs JPEG', 'Use for'],
      ['AVIF', '40–60% smaller', 'Photographs, first choice'],
      ['WebP', '25–35% smaller', 'Fallback, and animation'],
      ['JPEG', 'Baseline', 'Legacy fallback only'],
      ['PNG', 'Large', 'Transparency without alpha WebP'],
      ['SVG', 'Tiny', 'Logos, icons, diagrams'],
    ]),
    p('The saving from AVIF is large enough that it is worth the extra encode time on its own. A hero photograph that is 400KB as a well-compressed JPEG is often 160KB as AVIF at visually equivalent quality, and that difference is bigger than every other optimisation on this list combined.'),

    h3('Let the browser choose'),
    p('A `<picture>` element with sources in order lets each browser take the best format it supports, and falls back without any detection.'),
    code('html', `
<picture>
  <source srcset="/hero.avif" type="image/avif">
  <source srcset="/hero.webp" type="image/webp">
  <img src="/hero.jpg" alt="" width="1600" height="900">
</picture>
`),
    p('The `<img>` inside is not optional — it is what actually renders, what carries the alt text, and what supplies the dimensions. A `<picture>` with no `<img>` displays nothing.'),

    h3('SVG for anything drawn rather than photographed'),
    p('Logos, icons, charts and diagrams are geometry, and geometry as SVG is smaller than any raster version and sharp at every size. Exporting a logo as a 2x PNG is a habit worth breaking — it is larger, blurrier and cannot inherit colour.'),

    h3('Do not ship animated GIFs'),
    p('A GIF is an enormous, poorly compressed video. The same animation as a muted, looping MP4 or WebM is routinely a tenth of the size, and unlike a GIF it can be paused — which matters for [anyone who has asked for reduced motion](/blog/prefers-reduced-motion).'),

    h2('What about dimensions?'),
    p('This is where the largest waste hides, because an oversized image looks perfect.'),
    p('A card thumbnail displayed at 300px wide, served as the 1600px original, is downloading roughly 28 times more pixels than it displays. Nothing about the page looks wrong — it looks slightly sharper on a high-density screen — and the cost is invisible until somebody measures.'),

    h3('Serve several widths and describe them'),
    p('`srcset` offers the browser a set of candidates and `sizes` tells it how wide the image will actually be, so it can pick before layout.'),
    code('html', `
<img
  src="/card-600.jpg"
  srcset="/card-300.jpg 300w, /card-600.jpg 600w, /card-1200.jpg 1200w"
  sizes="(max-width: 640px) 50vw, 300px"
  width="600" height="400" alt="">
`),

    h3('The sizes attribute is the one people skip'),
    p('Without it the browser assumes the image occupies the full viewport width and picks the largest candidate — so a `srcset` without `sizes` frequently makes things worse, not better. On a grid of thumbnails that single omission can be most of the page weight.'),
    p('Getting `sizes` right means describing your own layout in CSS terms, which is tedious and is the actual work. It is also why an image component that knows the layout is worth having.'),

    img('sizes-attribute', 'A selection made against a described display width rather than an assumed one', 'sizes describes your layout to the browser. Without it, srcset picks the largest candidate every time.'),

    h3('Two densities is enough'),
    p('Beyond 2x the returns are negligible and the file sizes are not. Serving a 3x asset to a phone is a large download for a difference nobody can see at reading distance.'),
    img('oversized', 'A large source reduced to a small display area with most of it discarded', 'A 1600px file in a 300px slot downloads 28 times the pixels it shows. Nothing looks wrong, which is why it survives.'),

    h2('Build time or on demand?'),
    p('The decision that shapes everything else, and build time is right more often than the tooling implies.'),
    table('Two strategies', [
      ['', 'Build time', 'On demand'],
      ['First request', 'Already optimised', 'Slow — transform then cache'],
      ['Cost', 'Build minutes', 'Per transform, metered'],
      ['Works for', 'Known images', 'User uploads, remote sources'],
      ['Cache warmth', 'Permanent', 'Cold after cache eviction'],
      ['Failure mode', 'Longer builds', 'A slow or failed transform in production'],
    ]),
    p('For a site whose images are known at build time — a marketing site, a portfolio, a blog — pre-generating every variant is simpler, cheaper and faster. There is no transform service to depend on, no metered line item, and no cold first request.'),
    p('On-demand transformation earns its place when the images are not knowable in advance: user uploads, a product catalogue that changes hourly, anything remote. Then it is the only workable answer and the caching behaviour is the thing to get right.'),

    h3('Watch the metered line'),
    p('On-demand services charge per transformation, and a site with a thousand images across five breakpoints and three formats is fifteen thousand transforms. That is a bill nobody modelled, and it is [where hosting costs surprise people](/blog/cloudflare-pages-vs-vercel).'),

    p('There is a middle option worth knowing about: transform on demand once, then commit the result. A script that pulls the current set of CMS images, generates every variant and writes them into the build produces static files from dynamic sources, at the cost of a rebuild when content changes. For a site that publishes a few times a week rather than continuously, that is often the best of both — no runtime dependency and no manual export step.'),

    h3('Hybrid is normal'),
    p('Build-time for the design assets and on-demand for user content is a perfectly coherent arrangement, and it is what most real projects end up with. The mistake is routing the hero image through a transform service because the uploads already go there.'),

    h2('What does lazy loading actually do?'),
    p('Defers off-screen images so the initial load carries only what is visible — and it is a one-word attribute.'),
    code('html', `
<img src="/below-fold.jpg" loading="lazy" decoding="async" alt="" width="800" height="600">
`),

    h3('Never lazy-load the LCP image'),
    p('This is the most common self-inflicted performance wound available. Marking the hero `loading="lazy"` means the browser waits to confirm it is in view before requesting it, which delays the single element the metric is measuring. Above-the-fold images should be eager and, ideally, preloaded.'),

    p('The boundary is less obvious than "above the fold" suggests, because it moves with the viewport. An image that is below the fold on a phone may be the LCP element on a wide screen. The safe rule is to mark only the first one or two images eager and lazy-load everything after, rather than trying to compute where the fold is for each device.'),

    h3('fetchpriority is the finer control'),
    p('`fetchpriority="high"` on the hero tells the browser this matters more than the other requests competing with it. It is a small change and on image-led pages it is often worth more than the format switch.'),

    h3('decoding="async" costs nothing'),
    p('It lets the browser decode off the main thread rather than blocking. There is no case where you want the opposite for a content image, so it may as well be a default in your component.'),

    h2('What about the images you cannot control?'),
    p('CMS uploads and user content, which is where a good strategy usually fails in practice.'),
    p('An editor with a phone photograph will upload a 6MB, 4000px file, because nothing told them not to and the interface accepted it. That single image is larger than the rest of the page combined.'),

    h3('Transform on upload, not on request'),
    p('Resizing and re-encoding when the file arrives means it is done once, the original is retained, and every subsequent request is a static file. Most CMS platforms do this or can be made to.'),

    h3('Set a maximum and say so'),
    p('The message is doing as much work as the limit — a silent rejection is a support ticket rather than a fix.'),
    p('A limit in the upload path with a clear message — "images are resized to 2000px" — prevents the problem at the point it is created. Silently accepting a 6MB file and dealing with it later is how it reaches production.'),

    h3('Store the dimensions'),
    p('Capturing width and height at upload lets every consumer reserve space without guessing, which is what keeps [layout shift near zero](/blog/near-zero-cls) for remote images. Sanity does this automatically; most systems can.'),
    img('upload-path', 'A file being reduced and measured at the point of arrival rather than at each request', 'Transform once on upload. Every request afterwards is a static file with known dimensions.'),

    h2('How much compression is enough?'),
    p('More than most people apply, and the right number is found by looking rather than by rule.'),
    p('Quality 80 is the usual advice and it is a reasonable default for JPEG. For AVIF the equivalent visual quality often comes in considerably lower, because the codec is better — and the difference between a setting that looks identical and one that is visibly soft is narrow enough to be worth checking per image type.'),

    h3('Photographs and graphics compress differently'),
    p('A photograph tolerates aggressive lossy compression because noise hides artefacts. A screenshot with text or a flat-colour illustration shows banding and ringing at the same settings. Those want either a higher quality or a different format entirely.'),

    h3('Check the file, not the preview'),
    p('Comparing a compressed image against the original at full size, side by side, is the only reliable test. A thumbnail in a build log tells you nothing, and a difference that is invisible at 400px is sometimes obvious at 1600.'),

    p('One caution about encoding AVIF: it is markedly slower to encode than JPEG or WebP, and on a large image set that shows up as build time rather than as a warning. Encoding in parallel and caching the results between builds keeps it manageable; encoding several hundred images serially on every deploy does not, and it is the reason some teams conclude AVIF is impractical when the format was never the problem.'),

    h3('Strip the metadata'),
    p('Camera EXIF data, colour profiles and thumbnails embedded by editing software can be tens of kilobytes per file and serve no purpose on the web. Most optimisers strip them by default; some do not, and it is worth confirming.'),

    h2('What order should you work in?'),
    p('Largest effect first, which means starting with the one image that decides the metric.'),
    ol([
      '**Find the LCP image** and fix that one — format, dimensions, eager loading, preload. This is frequently the entire job.',
      '**Audit total image weight per page.** Sort by size; the top three usually account for most of it.',
      '**Add `sizes` wherever `srcset` exists,** because a `srcset` without it is often making things worse.',
      '**Set up the pipeline** so new images are optimised automatically rather than by remembering.',
    ]),
    p('The fourth step is what makes the first three stick. Manual optimisation lasts until the next person adds an image in a hurry, which is usually within a fortnight.'),
    img('work-order', 'A ranked sequence of interventions with the first accounting for most of the effect', 'One image usually decides the metric. Find it before optimising anything else.'),

    h2('What about the images that are not photographs?'),
    p('Screenshots, diagrams and illustrations each fail differently under the same settings, and treating them as photographs is why some pages look soft.'),

    h3('Screenshots want fewer colours, not more compression'),
    p('A screenshot is mostly flat regions and text. Lossy compression at photograph settings produces ringing around every letter, and the file is often larger than a well-quantised PNG would be. Reducing the palette usually beats increasing compression.'),

    h3('Diagrams should be SVG, or drawn at 2x'),
    p('A diagram exported as a raster is blurry on a dense screen and large at 2x. If it started as vectors, keep it as vectors — the file is smaller, it is sharp everywhere, and text inside it can be real text that scales and can be selected.'),

    h3('Illustrations with flat colour compress badly as JPEG'),
    p('Large areas of a single colour are exactly what JPEG handles worst, producing visible blocking at the edges. AVIF handles them far better, and PNG with a reduced palette is often smallest of all for a limited-colour illustration.'),

    h3('Photographs of text are the worst case'),
    p('A photographed document or a screenshot of a screenshot combines the problems of both. Where it is avoidable, replace it with real text — which is smaller, selectable, translatable and readable by anyone using assistive technology.'),
    img('by-content-type', 'Several image kinds responding differently to identical processing', 'Flat colour and text fail where photographs succeed. One quality setting across all of them gets some of them wrong.'),

    h2('How do you stop it regressing?'),
    p('A budget that fails the build, because this is the category most likely to be undone by somebody with good intentions and a deadline.'),

    h3('Fail on total page weight'),
    p('An asserted byte budget per route catches the 2MB hero at the pull request rather than in a Core Web Vitals report three weeks later. It is a blunt instrument and this is a domain where blunt works.'),

    h3('Lint for unoptimised source files'),
    p('A check that rejects a committed `.jpg` or `.png` over some size in the repository catches the original that was meant to be processed and was not. Ten lines, and it prevents the most common single failure.'),

    img('regression-budget', 'A threshold applied before release catching an oversized addition', 'Blunt works here. A page-weight budget catches the 2MB hero at the pull request, not in a report weeks later.'),

    h3('Require dimensions and format'),
    p('A rule that every `<img>` has width, height and a modern-format source enforces the two things that matter most, at the moment they are easiest to fix.'),

    h2('What does this actually save?'),
    p('More than everything else on a typical page, which is why it deserves the attention that usually goes to JavaScript.'),
    p('A page with a 1.4MB hero, six unoptimised 400KB cards and no lazy loading is around 3.8MB. The same page with AVIF at appropriate widths, lazy loading below the fold and a preloaded hero is comfortably under 400KB — an order of magnitude, from work that requires no architectural change at all.'),
    p('Against that, [bundle splitting](/blog/bundle-splitting) on the same site might move 40KB. Both are worth doing and only one of them is worth doing first.'),
    quote('The image nobody owns is usually the largest thing on the page. Format and dimensions beat every clever optimisation downstream of them.'),

    h2('What does it cost?'),
    p('A day to set the pipeline up, and close to nothing afterwards.'),
    p('Generating variants, wiring a component that knows the layout well enough to emit correct `sizes`, and adding a budget in CI is a day. After that, adding an image is adding an image — the pipeline handles format, widths and dimensions without anybody thinking about it.'),
    p('The honest counterweight: an automated pipeline makes it easy to stop looking. Automatic compression at a fixed quality will occasionally produce a visibly soft result on the one image where it matters — a product shot, a portrait — and nobody notices because the process is trusted. Keeping a manual override for the handful of images that carry weight is worth the small inconsistency.'),

    h2('Conclusion'),
    p('Ship AVIF with a WebP fallback through `<picture>`, and keep a real `<img>` inside it — that is what renders, what carries the alt text and what supplies the dimensions. The format change alone typically halves a photograph.'),
    p('Then fix dimensions, which is where the largest waste hides because an oversized image looks perfect. Offer widths with `srcset` and always describe the layout with `sizes` — without it the browser assumes full viewport width and picks the largest candidate, so a `srcset` alone frequently makes a grid heavier rather than lighter.'),
    p('Decide build-time versus on-demand deliberately. If the images are known when you build, pre-generate them: no transform service, no metered per-transform line, no slow first request. Reserve on-demand for content that genuinely is not knowable in advance, and transform uploads when they arrive rather than on every request.'),
    p('Lazy-load below the fold and never the LCP image — marking the hero lazy is the most common self-inflicted wound in this whole area. Give it `fetchpriority="high"` instead, and preload it.'),
    p('Then put a page-weight budget in CI and a lint rule for unoptimised files in the repository, because this is the category most easily undone by one person in a hurry. The whole exercise routinely takes a page from several megabytes to a few hundred kilobytes with no architectural change at all — which is a different order of magnitude from anything downstream of it. If a page is slow and nobody is sure why, [start here](/start).'),
  ),
  faqs: faq([
    ['Which image format should I use in 2026?',
     'AVIF first, WebP as a fallback, delivered through a picture element so each browser takes the best it supports. AVIF is typically 40–60% smaller than JPEG at equivalent visual quality, which is a bigger saving than every other image optimisation combined.'],
    ['Why is my srcset not helping?',
     'Almost certainly a missing sizes attribute. Without it the browser assumes the image spans the full viewport and selects the largest candidate, so a srcset alone can make a thumbnail grid heavier. sizes describes how wide the image will actually render.'],
    ['Should images be optimised at build time or on demand?',
     'Build time whenever the images are known in advance — no transform service to depend on, no per-transform billing, and no slow first request. On-demand is for user uploads and remote catalogues, where the set genuinely cannot be enumerated at build.'],
    ['Is lazy loading always a good idea?',
     'For below-the-fold images, yes. Never for the LCP image — marking a hero loading="lazy" makes the browser wait to confirm it is in view before requesting it, delaying the exact element the metric measures. Above the fold, use eager loading and fetchpriority="high".'],
  ]),
};
