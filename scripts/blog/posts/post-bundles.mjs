import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/bundle-splitting/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-bundle-splitting',
  slug: 'bundle-splitting',
  title: 'Bundle Splitting That Actually Changes the Number',
  category: 'performance',
  order: 80,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-04',
  series: 'Foundations',
  excerpt:
    'Splitting moves bytes around; it does not remove them. What to split, what to delete instead, and why the shared chunk grows quietly.',
  coverLabel: 'Bundle splitting — cover',
  body: body(
    p('Bundle splitting is one of the more satisfying kinds of performance work and one of the most frequently misapplied. It is easy to do, it produces a visible change in the build output, and on a lot of sites it moves nothing that a visitor would notice.'),
    p('The reason is simple: splitting relocates bytes, it does not remove them. Code that was in one file is now in three, and if all three are needed on the first screen you have added round trips to a payload that is the same size.'),
    p('Splitting earns its place when a chunk is genuinely *not needed* for most visits. That is the whole test, and applying it honestly turns a vague optimisation into a short list of specific things worth doing.'),

    h2('What does splitting actually do?'),
    p('It breaks one output file into several so the browser can request only what a route needs, and cache the rest across navigations.'),
    table('The two mechanisms, and what each buys', [
      ['Mechanism', 'Effect', 'Worth it when'],
      ['Route-based splitting', 'A page loads only its own code', 'Routes differ substantially'],
      ['Dynamic import', 'A module loads on demand', 'The feature is used by a minority'],
      ['Vendor chunking', 'Dependencies cached separately', 'Dependencies change less than your code'],
      ['No splitting', 'One file, one request', 'Small apps — genuinely fine'],
    ]),
    p('Every modern framework does route-based splitting by default, so most projects already have the largest win without configuring anything. The remaining decisions are about dynamic imports and how vendor code is grouped, and those are where both the wins and the mistakes live.'),

    h3('More chunks is not better'),
    p('Each chunk is a request, and a request has overhead even on a warm connection. Splitting a 40KB module into eight 5KB chunks that all load together makes the page slower, not faster — you have added seven round trips for no reduction in bytes.'),
    img('move-vs-remove', 'A quantity redistributed across several containers without changing in total', 'Splitting relocates bytes. If everything is still needed on the first screen, you have added round trips to the same payload.'),

    h2('What is actually worth splitting?'),
    p('Anything a majority of visits does not use. That is a much smaller set than it first appears, and it is worth naming explicitly.'),
    ul([
      '**Modal and dialog contents** — the code behind a dialog nobody opens on most visits.',
      '**Editor and rich-text libraries,** which are enormous and used on one route.',
      '**Charting libraries,** same reasoning, usually behind a dashboard tab.',
      '**PDF generation, image manipulation, date libraries with locales** — heavy, occasional.',
      '**Anything below the fold that requires a runtime,** since it can load while the reader is still at the top.',
    ]),
    p('On this site the résumé PDF generator is the clearest case. It is a real dependency, it exists for one button on one page, and almost nobody clicks it. Loading it lazily means the visitors who never generate a PDF never download the library — which is the entire point, and it is invisible to everyone else.'),
    code('ts', `
// Loaded when the button is pressed, not when the page is.
btn.addEventListener('click', async () => {
  const { generateResume } = await import('./resume-pdf');
  await generateResume(data);
});
`),

    h3('Split on interaction, not on presence'),
    p('The trigger should be the moment somebody indicates they want the feature — a click, a focus, a hover — rather than the component merely existing on the page. A dynamic import that runs in an effect on mount has not deferred anything meaningful; it has just made the load slightly later and less predictable.'),

    h3('Preload on intent, load on action'),
    p('For something with a visible latency cost, start the import on hover or focus and await it on click. The download overlaps the time somebody spends deciding, so the feature is usually ready by the time it is wanted — the same idea as [prefetching a page on hover](/blog/prefetch-on-hover), applied to a module.'),

    h2('What should you delete instead?'),
    p('This is the question that produces bigger wins than splitting does, and it gets asked less because deleting is less interesting than configuring.'),
    p('A dependency you split still ships to the people who use that route. A dependency you remove ships to nobody. Before splitting anything large, it is worth checking whether it needs to be there at all.'),

    h3('Date libraries are the classic'),
    p('A full date library with every locale is a large dependency doing what `Intl.DateTimeFormat` does natively. Formatting a handful of dates rarely justifies it, and the native API has been available everywhere for years.'),

    h3('Utility libraries imported wholesale'),
    p('Importing a whole utility package for three functions ships the package. Named imports with a tree-shakeable build fix it; so does writing the three functions, which are usually five lines each.'),

    h3('Polyfills for browsers you do not support'),
    p('This is the highest ratio of bytes removed to minutes spent available anywhere in front-end performance.'),
    p('A default build target of "everything" ships transforms and polyfills for engines nobody uses. Setting a realistic browserslist is a one-line change that often removes more bytes than a week of splitting.'),

    h3('Two libraries doing one job'),
    p('It happens because dependencies tend to arrive attached to other dependencies, rather than because anybody deliberately chose twice.'),
    p('An animation library plus a second one that arrived with a component. A date library and a date-picker with its own. Checking for duplicates is a five-minute audit and it is startling how often it finds something.'),
    img('delete-first', 'A dependency removed entirely beside one merely relocated', 'A split dependency still ships to the route that uses it. A deleted one ships to nobody.'),

    h2('Why does the shared chunk keep growing?'),
    p('Because anything imported by two routes gets hoisted into it, and one careless import in a shared component pulls a large dependency into every page.'),
    p('This is the most common way a well-split application quietly regresses. The routes still look clean, the shared chunk grows by 40KB, and nothing in the build output says which import caused it.'),

    h3('Watch the shared chunk specifically'),
    p('Track its size as a separate number rather than the total. Total size can stay flat while the shared chunk doubles and route chunks shrink — which is strictly worse, because the shared chunk is on the critical path for every visit.'),

    h3('A layout component is the usual route in'),
    p('A header or shell imported by every page is the highest-leverage file in the codebase for this. One icon library, one analytics wrapper or one date helper added there is added everywhere, and it never looks like a performance decision at the time.'),

    img('shared-growth', 'A common region expanding while the regions around it stay constant', 'Total size flat, shared chunk doubled. Strictly worse, and invisible in a single headline number.'),

    h3('Barrel files make it worse'),
    p('An `index.ts` re-exporting everything in a directory means importing one thing can pull in the whole directory if tree-shaking cannot prove the rest is unused. Side effects in any module in that barrel defeat it entirely. Import from the specific file.'),

    h2('How do you find what is actually large?'),
    p('A visualiser, and then the import path rather than the package.'),
    p('Every bundler has a treemap plugin. It shows which modules occupy which chunks and it is usually surprising — the thing you suspected is fine and something you had forgotten is a third of the output.'),

    h3('The size that matters is compressed'),
    p('Raw size is a poor proxy. Code compresses well and repetitive code compresses extremely well, so a 300KB raw module might be 40KB over the wire while a 100KB one might be 60KB. Measure gzip or brotli, which is what the visitor downloads.'),

    h3('Find why it is included, not just that it is'),
    p('Knowing a package is large is half an answer. The useful question is which import pulled it in, and most bundlers can print that path. Frequently it is a transitive dependency of something small, and the fix is replacing the small thing.'),

    h3('Compare against a baseline, not a target'),
    p('An absolute byte budget is arbitrary and gets argued about. A rule that a pull request may not increase the shared chunk by more than a few kilobytes is concrete, hard to dispute, and catches the regression at the moment it is introduced.'),
    code('yaml', `
# Fails the PR when the entry chunk grows beyond the agreed ceiling.
- run: npx size-limit --json
`),
    img('treemap', 'A proportional map of module sizes within an output file', 'The thing you suspected is usually fine. Something forgotten is usually a third of the output.'),

    h2('Does splitting help Core Web Vitals?'),
    p('Indirectly, and less than the effort usually suggests — which is worth knowing before spending a week on it.'),
    p('LCP is dominated by the largest element, normally an image or the server response. A smaller bundle helps if JavaScript was blocking the render, and does nothing if the bottleneck is [an unoptimised hero image](/blog/core-web-vitals-nextjs).'),
    p('Where it genuinely helps is INP, because less JavaScript means less parsing and less hydration, which means a shorter window where the main thread is busy and interactions queue. If your INP is poor and your LCP is fine, bundle work is pointed in the right direction.'),

    h3('Parsing costs more than downloading on cheap phones'),
    p('On a fast connection a 200KB bundle downloads quickly and still takes real time to parse, compile and execute — and that cost falls hardest on the mid-range devices that decide your 75th percentile. Bytes are a proxy for main-thread time, and main-thread time is the thing that hurts.'),

    h2('What about caching?'),
    p('The reason vendor chunking exists, and the reason aggressive splitting can backfire.'),
    p('Dependencies change rarely; your code changes constantly. Separating them means a deploy invalidates your chunk and leaves the vendor chunk cached, so returning visitors download only what changed.'),

    h3('Content hashes make this work'),
    p('Filenames containing a content hash can be cached permanently, because a change produces a new filename. Without that you are choosing between short cache lifetimes and stale code, and every bundler does this by default now.'),

    h3('One vendor chunk, or a few'),
    p('A single vendor chunk containing everything is invalidated whenever any dependency updates. Splitting the largest and most stable dependencies into their own chunks means a minor update to one does not invalidate the others — worth doing for two or three, not worth doing for twenty.'),

    h3('Do not optimise for repeat visits on a marketing site'),
    p('Caching strategy matters for an application people use daily. For a site where most visits are the first, the cold-load payload is the number that counts, and vendor chunking mostly adds requests to it.'),

    h2('When is no splitting the right answer?'),
    p('More often than the discourse suggests, and it is worth saying plainly.'),
    ol([
      '**Small applications** where the whole bundle is under about 100KB compressed. One request beats several.',
      '**Sites with little JavaScript to begin with** — a static site with one script has nothing to split.',
      '**Single-route tools** where every visitor uses everything.',
      '**Before you have measured,** because splitting the wrong thing adds latency and removes nothing.',
    ]),
    p('This site is the second case. It is static Astro with one client module, and there is nothing meaningful to split — the only dynamic import is the PDF generator, which is exactly the case that justifies one. Everything else is small enough that a second request would cost more than it saved.'),

    h2('What does a sensible strategy look like?'),
    p('Four steps, in order, and most projects stop after the second.'),
    ol([
      '**Keep route-based splitting,** which the framework already does. Do not fight it.',
      '**Delete what is not needed.** Native APIs over libraries, realistic browser targets, no duplicate dependencies.',
      '**Dynamically import the genuinely occasional** — editors, charts, PDF, anything behind an interaction most visits do not perform.',
      '**Separate one or two large stable dependencies** for caching, if repeat visits actually matter for your product.',
    ]),
    p('The ordering is the advice. Step two produces larger wins than step three on most codebases, and step four is a refinement that only pays on applications people return to.'),
    img('strategy-order', 'A sequence of interventions ordered by the size of their effect', 'Deleting beats splitting. Most projects should stop after step two.'),

    h2('What breaks when you split badly?'),
    p('Three failures, and the first two only appear in production because a dev server serves modules differently.'),
    table('Splitting failures worth knowing', [
      ['Failure', 'Symptom'],
      ['A chunk fails to load after a deploy', 'A feature throws for anyone with the old page open'],
      ['A waterfall of dependent imports', 'Each chunk requests the next, serially'],
      ['A loading state that shifts layout', 'The page jumps when the module arrives'],
    ]),
    p('The first is the one that produces confusing reports. A visitor with a page open across a deploy requests a chunk whose hashed filename no longer exists, and the dynamic import rejects. The fix is to catch it and offer a reload rather than letting a button do nothing — and to keep old chunks available for a while rather than purging on deploy.'),

    h3('Handle the rejection'),
    p('A dynamic import returns a promise that can fail, and unhandled it fails silently from the user\'s point of view. Catching it, logging it, and prompting a refresh converts an inexplicable dead control into something a person can act on.'),

    h3('Reserve the space before the module arrives'),
    p('A lazily loaded component appearing into unreserved space is a layout shift, and it is the kind that fires after the page looked settled. Size the container up front — [the same rule as any async content](/blog/near-zero-cls).'),
    img('split-failures', 'Several ways a deferred load can fail after appearing to work', 'A dev server hides two of these. They arrive in production, after a deploy, for people who already had the page open.'),

    h2('How do you keep it from regressing?'),
    p('One number in CI, and a habit of asking where an import goes.'),

    h3('Budget the entry chunk, not the total'),
    p('The total can grow harmlessly if the growth is in a route nobody visits. The entry and shared chunks are on every visit\'s critical path, and those are the numbers worth failing a build over.'),

    h3('Report the delta on the pull request'),
    p('A comment saying "shared chunk +12KB" turns an invisible change into a visible one, and it usually prompts the author to notice a stray import themselves. This works better than a hard threshold, because most growth is legitimate and the point is visibility rather than prohibition.'),

    h3('Ask which chunk a new dependency lands in'),
    p('One review question — "is this in the shared chunk?" — catches the layout-component import that would otherwise ship a library to every page. It is the same shape of question as asking [which token a value came from](/blog/reusable-design-system), and it works for the same reason.'),

    h2('What does this cost?'),
    p('An afternoon for the audit, and the honest answer is that most of the value is in the first hour.'),
    p('Running a visualiser, finding the two or three surprises, deleting a redundant dependency and lazily importing the one heavy feature is an afternoon. Setting a CI budget is another hour. Beyond that, returns fall off quickly and the configuration starts costing more clarity than it buys bytes.'),
    p('The honest counterweight: this is the most over-invested area of front-end performance. Teams spend weeks on chunk configuration while a 900KB hero image sits at the top of the page, because splitting is engaging engineering work and image compression is somebody else\'s job. Measure first, and be prepared for the answer to be that your bundle was never the problem.'),
    quote('Splitting moves bytes. Deleting removes them. Do the second one first, and you often find the first one was unnecessary.'),

    h2('Conclusion'),
    p('Split what a majority of visits does not use, and nothing else. Code that is still needed on the first screen has not been optimised by being placed in three files — it has been given extra round trips at the same total size.'),
    p('Delete before you split. Native `Intl` over a date library, named imports over whole packages, a realistic browserslist over universal polyfills, and one library where two are doing the same job. That audit routinely removes more than a week of chunk configuration.'),
    p('Trigger dynamic imports on interaction rather than on mount, and start the download on hover or focus so the module is ready by the time it is wanted. An import that fires in an effect has deferred almost nothing.'),
    p('Watch the shared chunk as its own number. It is where a single import in a layout component quietly ships a library to every page, and total size can stay flat while the part on every critical path doubles.'),
    p('Expect the effect on Core Web Vitals to be indirect — real for INP through reduced parsing and hydration, marginal for LCP unless JavaScript was blocking the render. Measure with a treemap on compressed sizes, budget the entry chunk in CI, and be ready to discover the bundle was never what made the page slow. If you want a second opinion on where the actual bottleneck is, [that is usually an hour](/start).'),
  ),
  faqs: faq([
    ['Does bundle splitting make a site faster?',
     'Only when a chunk is genuinely not needed for most visits. Splitting relocates bytes rather than removing them, so if every chunk still loads on the first screen you have added round trips to an identical payload. The test is whether a majority of visitors can skip it.'],
    ['What should you split out of the main bundle?',
     'Code behind an interaction most visits never perform — modal contents, editors, charting libraries, PDF generation, image manipulation. Trigger the import on click, hover or focus rather than on mount, or you have deferred the load without deferring anything meaningful.'],
    ['Why does my shared chunk keep growing?',
     'Anything imported by two or more routes gets hoisted into it, and a layout or shell component is the usual route in. One icon library or date helper added to a header ships to every page. Track the shared chunk as its own number, because total size can stay flat while it doubles.'],
    ['Does bundle size affect Core Web Vitals?',
     'It affects INP substantially, through parsing, compilation and hydration time on the main thread. It affects LCP only if JavaScript was blocking the render — if the largest element is an unoptimised image, no amount of chunk work will move that number.'],
  ]),
};
