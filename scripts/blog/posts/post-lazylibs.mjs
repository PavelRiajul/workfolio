import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/lazy-load-heavy-libraries/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-lazy-load-heavy-libraries',
  slug: 'lazy-load-heavy-libraries',
  title: 'Lazy-Loading the Heavy Libraries Nobody Uses',
  category: 'performance',
  order: 84,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-08',
  series: 'Foundations',
  excerpt:
    'A PDF generator, a chart library and an editor in your main bundle serve a fraction of visits. How to move them behind the click that needs them.',
  coverLabel: 'Lazy-loading heavy libraries — cover',
  body: body(
    p('On this site, the résumé page has a download button that produces a real PDF with a selectable text layer. The library that does it is jsPDF, and it is not in the main bundle — it arrives when somebody presses the button. Nobody who reads the page and leaves ever downloads a line of it.'),
    p('That is the whole pattern, and it applies to more of a typical application than people expect. A charting library on a dashboard that most users never open. A rich text editor behind an admin route. A date picker in a form that appears on step three. A syntax highlighter for the one page with code on it.'),
    p('This post is about identifying those, moving them behind the interaction that needs them, and doing it without producing the jank that makes lazy loading feel worse than the weight it removed.'),

    h2('Which libraries are worth deferring?'),
    p('The ones that are large, and used by a minority of sessions. Both conditions, not either.'),
    p('A 60KB library used on every page is not a candidate — deferring it just moves the cost slightly later and adds a loading state for no benefit. A 4KB utility used once is not worth the machinery. The candidates are the ones where size multiplied by the proportion of sessions that never touch them is a large number.'),
    table('Typical candidates and what they weigh', [
      ['Library', 'Rough size', 'Used by'],
      ['PDF generation', '150–350KB', 'The few who click download'],
      ['Charting', '80–250KB', 'Dashboard routes only'],
      ['Rich text editor', '150–400KB', 'Authors, not readers'],
      ['Map rendering', '150–250KB', 'One page, often below the fold'],
      ['Syntax highlighting', '50–200KB', 'Pages with code blocks'],
      ['Video player', '100–300KB', 'Sessions that press play'],
      ['Date picker', '20–60KB', 'One field, sometimes step three'],
    ]),
    p('Run that table against your own bundle analysis before trusting it. The sizes vary enormously by version and by how much of the library your tooling can shake out, and the usage proportion is something only your analytics knows.'),

    h3('Find them with the bundle analyser, rank them with analytics'),
    p('The analyser tells you what is big; it cannot tell you what is rare. Pairing a treemap with a funnel — how many sessions reach the route, how many press the button — is what turns a list of large modules into an ordered list of things to move. This is the same ranking discipline as [bundle splitting](/blog/bundle-splitting), applied to interaction rather than to route.'),

    h3('Route-level splitting first, then interaction'),
    p('If the heavy library lives on one route, route-based code splitting already handles it and no further work is needed. Interaction-level deferral is for libraries that sit on a route people do visit, behind a control most of them do not press.'),
    img('candidates', 'Modules plotted by size against how often they are actually reached', 'Both conditions matter: large and rare. Large-and-common is not a candidate, and small-and-rare is not worth the machinery.'),

    h2('How does a dynamic import actually work?'),
    p('It returns a promise for a separate chunk, fetched on the first call and cached by the module system afterwards.'),
    p('Every modern bundler treats `import()` as a split point automatically. The code inside moves into its own file, is not requested during initial load, and the second call resolves instantly from the module registry — so you do not need to memoise the result yourself.'),
    code('ts', `
// resume-pdf.ts — the whole file is a separate chunk
export async function downloadResume(data: ResumeData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  // …lay out the text layer…
  doc.save('riajul-islam-resume.pdf');
}
`),
    code('ts', `
// The caller. Nothing about jsPDF exists until this runs.
button.addEventListener('click', async () => {
  button.disabled = true;
  button.textContent = 'Preparing…';
  try {
    const { downloadResume } = await import('./resume-pdf');
    await downloadResume(data);
  } catch {
    button.textContent = 'Download failed — try again';
    return;
  } finally {
    button.disabled = false;
  }
});
`),
    p('Two things in that snippet matter more than the import itself: the button is disabled while the chunk is in flight, and there is a catch. Both are covered below, because omitting either is what makes deferred loading feel broken.'),

    h3('Put the boundary in its own module'),
    p('Importing the library directly at the call site works, but wrapping it in a module that exports one function keeps the split point in one place and gives you somewhere to put the setup code that the library needs. It also means the calling component never imports the library type, which is what accidentally pulls it back into the main bundle.'),

    h3('Watch for the accidental static import'),
    p('The most common failure is importing a type or a constant from the same package at the top of a file. In TypeScript, `import type` is erased and safe; a value import is not, and it silently defeats the whole exercise. If a chunk is not shrinking, this is the first thing to check.'),

    h2('When should the chunk actually load?'),
    p('Earlier than the click, if you can predict it — that is what removes the perceived delay.'),
    p('Loading strictly on click is correct and simple, but it means the user waits for a network round trip after pressing a button, which on a slow connection reads as an unresponsive interface. The better pattern is to start the fetch on a signal of intent that precedes the click.'),
    table('Trigger strategies', [
      ['Trigger', 'Latency felt', 'Wasted loads'],
      ['On click', 'Full network round trip', 'None'],
      ['On hover or focus', 'Usually none', 'Some'],
      ['On viewport entry', 'None', 'Moderate'],
      ['On idle after load', 'None', 'Highest'],
      ['Eager (no deferral)', 'None', 'Every session'],
    ]),
    p('Hover and focus are the sweet spot for buttons: a pointer arriving at a control precedes the press by a few hundred milliseconds, which is usually enough for the chunk, and focus covers keyboard users who never hover.'),

    h3('Prefetch on hover, execute on click'),
    p('These are two separate things and it helps to think of them separately. Hover starts the download and does nothing else. Click awaits the same promise — already resolved, in the common case — and runs the work.'),
    code('ts', `
let chunk: Promise<typeof import('./resume-pdf')> | null = null;
const prefetch = () => (chunk ??= import('./resume-pdf'));

button.addEventListener('pointerenter', prefetch, { passive: true });
button.addEventListener('focus', prefetch);

button.addEventListener('click', async () => {
  const { downloadResume } = await prefetch();
  await downloadResume(data);
});
`),
    p('Six lines, and the perceived latency of the button goes from "a pause after I clicked" to nothing at all in the overwhelming majority of cases. The same idea generalises to [prefetching whole routes on hover](/blog/bundle-splitting).'),

    h3('Viewport entry for anything visual'),
    p('A chart or a map that is below the fold should start loading when it approaches the viewport, not when it enters it. An IntersectionObserver with a generous root margin — a few hundred pixels — means the library arrives while the user is still scrolling toward it.'),

    h3('Idle time for the likely-but-not-certain'),
    p('`requestIdleCallback` after the page is interactive is right for libraries that most sessions will eventually need but none need immediately. It costs those sessions nothing and gives the rest a warm cache.'),
    img('trigger-timing', 'A download beginning at an early signal of intent rather than at the moment of the action', 'Hover precedes click by a few hundred milliseconds. That is usually enough for the chunk, and it removes the pause entirely.'),

    h2('What do you show while it loads?'),
    p('Something that occupies the same space and does not move anything, because a deferred load that shifts the layout has traded one problem for a worse one.'),
    p('This is where lazy loading most often goes wrong. A chart that appears after 400ms and pushes the content below it down is a layout shift, and layout shift is the metric users notice as the interface fighting them. The [rules for reserving space](/blog/near-zero-cls) apply exactly as they do to images.'),

    h3('Reserve the box before the library arrives'),
    p('A placeholder with the final dimensions, or an aspect-ratio container, means the arriving component fills a hole that was already there. For a chart, the aspect ratio is known; for an editor, the minimum height is.'),

    h3('For buttons, use the button'),
    p('Disabling the control and changing its label is a better loading state than a spinner beside it, because it is in the place the user is already looking and it cannot shift anything. It also prevents the double-click that fires the work twice.'),

    h3('Do not show a skeleton for 80ms'),
    p('A loading state that flashes is worse than none. If the chunk is small and usually cached, a short delay before showing the placeholder — 150ms or so — means fast loads look instant and slow loads still get feedback.'),
    img('reserved-space', 'A component arriving into a container that already held its dimensions', 'A deferred component that pushes content down has traded one problem for a worse one. Reserve the box first.'),

    h2('What happens when the chunk fails to load?'),
    p('Nothing, silently, unless you handle it — and this is the part almost every implementation skips.'),
    p('A dynamic import is a network request, and network requests fail. A user on a flaky connection, a deploy that invalidated the old chunk hash while their tab was open, an aggressive corporate proxy — all of these produce a rejected promise and a button that appears to do nothing when pressed.'),

    h3('Always catch, always tell the user'),
    p('An unhandled rejection on a click handler is invisible to everyone except your error tracker. Catching it and putting a real message on the control is the difference between a bug report and a retry.'),

    h3('Retry once, then stop'),
    p('Transient failures are common enough that a single retry meaningfully improves the success rate. More than one and you are hammering a failing network on behalf of a user who has already moved on.'),
    code('ts', `
async function loadWithRetry<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch {
    // A stale chunk hash after a deploy is the usual cause, and a
    // second attempt against the current manifest often succeeds.
    return await load();
  }
}
`),

    h3('The stale-chunk problem after a deploy'),
    p('When you deploy, chunk filenames change. A tab that has been open since before the deploy holds a manifest pointing at files that no longer exist, so every dynamic import in that session fails. Keeping previous chunks on the CDN for a few days is the usual mitigation; catching the error and offering a reload is the honest fallback.'),

    h3('Report it, do not just swallow it'),
    p('Chunk load failures are a real signal about your deploy strategy and your CDN. Sending them to error tracking — the same Sentry that catches everything else — turns an invisible class of failure into a number you can act on.'),
    img('failure-path', 'A request that does not arrive leaving a control with no visible response', 'A dynamic import is a network request and network requests fail. Unhandled, that is a button that appears to do nothing.'),

    img('deploy-hashes', 'An open session holding references to chunk names that no longer exist on the server', 'After a deploy, an old tab points at chunk hashes that are gone. Every dynamic import in that session fails until it reloads.'),

    h2('Does this help server-rendered pages too?'),
    p('Yes, and the mechanism is slightly different — the saving is in hydration, not only in transfer.'),
    p('On an island-based or server-rendered page, a heavy library imported by a component is shipped and executed as part of that island\'s hydration. Deferring it means the island hydrates with a placeholder and pulls the library only on interaction, which reduces both the download and the main-thread work during load.'),

    h3('Astro islands make the boundary explicit'),
    p('A client directive already declares when a component becomes interactive, and `client:visible` or `client:idle` on a chart component is the same idea expressed declaratively. Most of the time that is enough and no dynamic import is needed at all — which is one of the [reasons the architecture is worth having](/blog/astro-islands).'),

    h3('Keep the server bundle out of it'),
    p('A library used only at build time — a Markdown parser, an image processor — should never reach the client, and occasionally does because a shared module imports it. That is not a lazy-loading problem, it is a boundary problem, and the fix is separating the module rather than deferring it.'),

    h2('How do you keep it from creeping back?'),
    p('A budget on the main chunk, checked in CI, because one careless import undoes the whole exercise.'),

    h3('Assert on the entry chunk, not the total'),
    p('Total bundle size going up is expected as an application grows. The entry chunk going up is the signal that something has been pulled back into the critical path, and it is the number worth failing a build over.'),

    h3('Keep the analyser output in the pipeline'),
    p('A treemap generated on every build and published as an artifact means the answer to "when did this get big" is a comparison rather than an investigation. It costs seconds and it is the thing people wish they had six months later.'),

    h3('Write down which libraries are deferred'),
    p('A short comment at each split point explaining what it is and why it is deferred stops the next person from "simplifying" it back into a static import. This is the same reasoning as documenting anything else non-obvious — the code cannot say why on its own.'),
    img('entry-budget', 'A threshold applied to the initial chunk while total size is allowed to grow', 'Fail on the entry chunk, not the total. Growth is expected; growth in the critical path is the regression.'),

    h2('When is deferring the wrong answer?'),
    p('More often than the enthusiasm for it suggests, and it is worth knowing the cases.'),

    h3('When the library is on the critical path'),
    p('If the page cannot render meaningfully without it, deferring produces a slower first render and a loading state, which is worse than the weight. A framework runtime is the obvious example.'),

    h3('When most sessions use it'),
    p('At high usage, deferral is a net loss: nearly every session pays a round trip and a loading state to save bytes it needs anyway. The crossover is somewhere around half of sessions, and below that the maths is usually still favourable because the ones who do not use it save everything.'),

    h3('When the library is small'),
    p('Under about 15KB the chunk overhead, the extra request and the loading state are comparable to the saving. Leave it, and spend the effort on the 300KB one.'),

    h3('When a smaller library exists'),
    p('Deferring a 300KB date picker is a worse outcome than replacing it with a 12KB one, or with the native date input. Reaching for lazy loading before asking whether the dependency is necessary is a common and expensive reflex — and the same applies to a moment-sized date library that a few lines of `Intl` would replace.'),
    img('wrong-answer', 'A dependency being replaced outright rather than deferred', 'Ask whether the dependency is necessary before deferring it. A 12KB replacement beats a deferred 300KB library every time.'),

    img('split-point-module', 'A single boundary module standing between the application and a heavy dependency', 'One module, one exported function. The caller never imports the library’s types, which is what pulls it back into the entry chunk.'),

    h2('What does this actually save?'),
    p('On a typical application, a third to a half of the entry bundle, from an afternoon of work.'),
    p('A dashboard I worked on shipped 480KB of JavaScript on first load. A charting library at 180KB, a PDF exporter at 140KB and a rich text editor at 160KB accounted for most of it, and between them they were touched by well under a fifth of sessions. Moving all three behind their controls, with hover prefetch on the export button and viewport loading for the charts, took the entry chunk to 160KB.'),
    p('None of the users who did open a chart noticed a difference, because the prefetch fired while they were scrolling. The ones who never opened one downloaded a third of what they had before.'),
    quote('Size multiplied by the proportion of sessions that never touch it. That product is the only number that decides whether deferring a library is worth the machinery around it.'),

    h2('What does it cost?'),
    p('An afternoon for the first three libraries, and a small amount of permanent complexity.'),
    p('Identifying candidates from a bundle analysis, wrapping each in a module with one exported function, adding hover prefetch and a real error path is a few hours for a typical application. After that each new heavy dependency is a five-minute decision rather than a project.'),
    p('The honest counterweight: every split point is a place where the interface can be in a loading state, and loading states are where bugs live. A deferred library that fails on a flaky connection, flashes a skeleton for 80ms, or shifts the layout when it lands has made the experience worse in exchange for a metric. The pattern is only worth it when the error path and the reserved space are done properly — and that, not the import, is the actual work.'),

    h2('Conclusion'),
    p('The libraries worth deferring are the ones that are both large and rare — a PDF generator, a charting library, an editor behind an admin route. Size alone is not the test, and neither is rarity; it is the product of the two, ranked against a bundle analysis and a funnel that tells you how many sessions actually reach the control.'),
    p('Move each one into its own module with a single exported function, so the split point lives in one place and the calling code never imports the library\'s types. If a chunk refuses to shrink, look for a value import at the top of a file that should have been `import type` — that is the usual culprit.'),
    p('Then load earlier than the click. Hover and focus precede a button press by a few hundred milliseconds, which is enough for the chunk in most cases, and viewport entry with a generous root margin covers anything visual. Six lines of prefetch is what makes the difference between a deferred button that feels instant and one that feels broken.'),
    p('Reserve the space before the component arrives, disable the control instead of showing a spinner beside it, and delay any skeleton by 150ms so fast loads never flash. Catch the failure, retry once, tell the user, and report it — a chunk load error after a deploy is invisible otherwise, and it is a button that appears to do nothing.'),
    p('Finally, know when not to do this. Under about 15KB it is not worth the machinery, above roughly half of sessions the maths turns against you, and a smaller dependency beats a deferred large one every time. If an application feels heavy and the obvious cuts have already been made, [that is worth a look](/start).'),
  ),
  faqs: faq([
    ['Which libraries should I lazy-load first?',
     'The ones that are both large and rarely used. Rank candidates by size multiplied by the proportion of sessions that never touch them — a bundle analyser gives you the first number and your analytics gives you the second. PDF generation, charting and rich text editors are the usual top three.'],
    ['Does a dynamic import need caching or memoisation?',
     'No. The module system caches the resolved module, so a second import() of the same specifier returns immediately without another request. You may still want to hold the promise in a variable so that hover prefetch and the later click await the same in-flight request rather than racing.'],
    ['Why did my bundle not get smaller after adding dynamic imports?',
     'Almost always a static import of the same package elsewhere — a constant or a value pulled in at the top of a file. In TypeScript, import type is erased and safe, but a value import silently defeats the split. Check the analyser for which module still references it.'],
    ['What happens when a lazily loaded chunk fails?',
     'The promise rejects and, unhandled, the control appears to do nothing. The common cause is a deploy changing chunk hashes while a tab is open. Catch it, retry once, show a real message, and report it to error tracking — keeping old chunks on the CDN for a few days also helps.'],
    ['Is there a size below which this is not worth it?',
     'Roughly 15KB. Below that the extra request, the chunk overhead and the loading state cost about as much as the saving, and you have added a code path that can fail. Spend the effort on the 300KB dependency instead, or replace it with something smaller.'],
  ]),
};
