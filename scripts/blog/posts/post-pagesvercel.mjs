import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/cloudflare-pages-vs-vercel/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-cloudflare-pages-vs-vercel',
  slug: 'cloudflare-pages-vs-vercel',
  title: 'Cloudflare Pages or Vercel: Deciding by What You Deploy',
  category: 'performance',
  order: 79,
  readTime: '13 min read',
  date: 'April 2026',
  publishedAt: '2026-04-27',
  series: 'Foundations',
  excerpt:
    'Both serve static files fast. The decision is about runtime, framework fit and what happens when the bill scales — not about which edge is closer.',
  coverLabel: 'Cloudflare Pages vs Vercel — cover',
  body: body(
    p('For a static site these two are close enough that the comparison is not worth having. Both put files on a global network, both are fast, and any difference in time-to-first-byte is smaller than the variance between two visitors on the same street.'),
    p('The decision becomes real the moment something has to *run*. Then you are choosing between two different runtimes with different constraints, different framework support, and pricing that diverges sharply once traffic is non-trivial.'),
    p('I use both — this site is on Pages, most Next.js client work is on Vercel — so here is how I actually decide, and where I have got it wrong.'),

    h2('What is the same on both?'),
    p('More than the marketing suggests, and it is worth clearing this away first.'),
    ul([
      '**Global static delivery.** Both serve prebuilt files from a network with hundreds of locations. Neither is meaningfully faster at this.',
      '**Git-connected deploys.** Push to a branch, get a build, get a preview URL. Same workflow, same ergonomics.',
      '**Free TLS, custom domains, automatic HTTPS.** Table stakes on both.',
      '**Preview deployments per pull request,** which is most of the day-to-day value either provides.',
    ]),
    p('If your site is prebuilt HTML with no server logic, you can flip a coin. What follows only matters once there is a runtime in the picture — and for a lot of projects there eventually is, which is why the choice is worth making deliberately rather than by default.'),
    img('same-baseline', 'Two delivery networks providing an equivalent static foundation', 'For prebuilt files these are equivalent. Everything that follows is about what happens when code has to run.'),

    h2('What is the actual difference?'),
    p('The runtime. Workers versus a Node-compatible serverless function, and that shapes everything downstream.'),
    table('The two runtimes', [
      ['', 'Cloudflare Workers', 'Vercel Functions'],
      ['Model', 'V8 isolates', 'Node, or an edge runtime'],
      ['Cold start', 'Effectively none', 'Small on Node, none on edge'],
      ['Node APIs', 'A compatibility layer', 'Full on the Node runtime'],
      ['npm packages', 'Many, not all', 'Essentially all'],
      ['Bundle limit', 'Small — a few MB', 'Generous'],
      ['Runs in', 'Every location', 'Region you choose, or edge'],
    ]),
    p('Workers are isolates rather than containers, which is why they start instantly and why they cannot do everything Node can. A package depending on native modules, the filesystem, or a large chunk of the Node standard library will not run there without work — and finding that out mid-build is the most common source of regret.'),
    p('Vercel\'s Node runtime removes that question entirely at the cost of a small cold start and a region choice. Its edge runtime is closer to Workers in both capability and constraint.'),

    img('two-runtimes', 'Two execution environments with differing capability and startup characteristics', 'Isolates start instantly and cannot do everything. Node does everything and starts a little later.'),

    h3('The compatibility gap is narrowing but real'),
    p('Node compatibility on Workers has improved substantially and covers most of what a typical API route needs. What still catches people is the long tail: an SDK bundling a native binding, a PDF library, an image processor, anything assuming a real filesystem.'),

    h2('How does framework fit change the answer?'),
    p('It decides it, more often than any performance consideration.'),

    h3('Next.js on Vercel is a different product'),
    p('Vercel builds Next.js, so features land there first and work without configuration — incremental regeneration, image optimisation, middleware, streaming, the newest routing. Running Next.js elsewhere is entirely possible and it is always a step behind, with an adapter in the middle that can break on a minor release.'),
    p('If the project is Next.js and you have no strong reason to be elsewhere, Vercel is the low-friction answer and I would not argue hard against it.'),

    h3('Astro, SvelteKit and static frameworks fit Pages naturally'),
    p('A static Astro build is files, so it deploys anywhere. Where Pages earns its place is the adjacency: if you want a Worker for an API route, R2 for uploads, or KV for a cache, they are bindings rather than network calls with credentials.'),
    p('That adjacency is why this site is on Pages. It is static, it has no runtime at all today, and if it ever needs one the pieces are already in the same place — which is [the same reasoning behind putting storage next to compute](/blog/r2-vs-s3).'),

    p('It is worth naming what "runs elsewhere" actually costs, because it is not nothing and it is not catastrophic. An adapter translates the framework\'s server output into the host\'s runtime, so you inherit that adapter\'s release cadence and its author\'s priorities. Most of the time it works. Occasionally a Next.js minor release changes something internal and the adapter needs a week to catch up, which is a week you cannot upgrade.'),

    h3('Anything with heavy Node dependencies wants Vercel'),
    p('An API doing image processing, PDF generation or anything with a native module is a Node workload. Forcing it onto Workers means finding WebAssembly alternatives or moving that work elsewhere, and both are real projects rather than configuration.'),

    h2('Where does the pricing actually diverge?'),
    p('Bandwidth, and it diverges sharply rather than gradually.'),
    p('Cloudflare does not meter bandwidth on Pages. Vercel includes an allowance and charges beyond it, and the overage is the line item that surprises people — a site that becomes popular, or one serving large assets, can move from comfortable to expensive quickly.'),
    ul([
      '**Low traffic:** both effectively free. Not a decision factor.',
      '**Moderate traffic with heavy assets:** Cloudflare\'s unmetered bandwidth starts to matter.',
      '**High traffic:** the gap can be large enough to decide the question on its own.',
      '**Heavy compute, low bandwidth:** the comparison inverts and depends on invocation pricing.',
    ]),
    p('The honest version: for most projects this never becomes relevant, and choosing infrastructure on a bill you do not yet have is optimising for a problem you may never get. It becomes relevant for media-heavy sites and anything with a genuine traffic spike, and those are usually predictable in advance.'),

    p('The other thing to model, if you model anything, is the shape rather than the total. Bandwidth scales with traffic times page weight, so halving your image payload halves that line — which means performance work and cost work are the same work here. Invocations scale with requests to dynamic routes, so making a route static removes it from the bill entirely rather than making it cheaper.'),

    h3('Watch the image optimisation line'),
    p('On-demand image transforms are metered separately on both, and a site with thousands of images across many breakpoints generates a lot of transforms. Pre-optimising at build time avoids the charge entirely and is [usually the better approach anyway](/blog/image-optimization-strategy).'),
    img('cost-shape', 'Two pricing curves diverging as one variable grows', 'Bandwidth is where they separate, and it separates sharply rather than gradually.'),

    h2('What about the surrounding platform?'),
    p('This is where the choice stops being about hosting and starts being about which set of primitives you want nearby.'),
    table('What each brings adjacent', [
      ['Need', 'Cloudflare', 'Vercel'],
      ['Object storage', 'R2, as a binding', 'Bring your own'],
      ['Key-value cache', 'KV, as a binding', 'Vercel KV'],
      ['SQL database', 'D1', 'Postgres integrations'],
      ['Queues and cron', 'Queues, Cron Triggers', 'Cron; queues via partners'],
      ['Analytics', 'Web Analytics, free', 'Analytics and Speed Insights'],
    ]),
    p('The word doing the work is *binding*. On Workers, R2 and KV are objects injected into your handler — no credentials, no network round trip out of the platform, nothing to rotate. That is a genuine simplification and it is the strongest argument for the Cloudflare side.'),
    p('Vercel\'s equivalent story is integrations with best-in-class third parties, which is more flexible and more moving parts. Neither is wrong; they are different bets about whether you want a coherent platform or the freedom to assemble one.'),

    h2('What are the practical annoyances?'),
    p('Four, two on each side, and none of them appear in a comparison table.'),

    h3('Cloudflare: build limits and the bundle ceiling'),
    p('It is the one annoyance here most likely to change an actual project plan rather than merely a configuration file.'),
    p('The Workers bundle limit is small, and a large application with heavy dependencies will hit it. The error arrives at deploy time rather than build time, which is a bad moment to discover a dependency needs replacing.'),

    h3('Cloudflare: the dashboard is a large surface'),
    p('Breadth is the whole product, and that same breadth is why finding one particular setting takes three levels of menu.'),
    p('Pages sits inside a product with DNS, WAF, Zero Trust, R2 and much else. That is powerful and it means the thing you need is three levels into a menu, and a setting you did not know existed can affect your site.'),

    h3('Vercel: the bill is not obvious in advance'),
    p('Usage-based pricing across bandwidth, invocations, image transforms and build minutes is hard to model before you have traffic. The first month at real volume is often a surprise, and the surprise is usually the image line.'),

    h3('Vercel: the framework gravity is real'),
    p('It is the most defensible kind of lock-in there is — earned by making one particular path genuinely better — and it is still lock-in.'),
    p('Everything is smoothest on Next.js. That is convenient and it is a form of lock-in — not technically, since Next.js runs elsewhere, but practically, because the version that runs elsewhere is the one with more configuration and fewer features.'),

    h2('Which should you actually pick?'),
    p('Four questions in order, and the first two settle most projects.'),
    ol([
      '**Is it Next.js?** If yes and you have no specific reason not to, use Vercel. The friction saved is real and immediate.',
      '**Does the runtime need full Node?** Native modules, filesystem access, heavy libraries — that is Vercel, or a container somewhere else.',
      '**Do you want storage, KV or queues nearby?** Cloudflare\'s bindings are meaningfully simpler than credentialled network calls.',
      '**Is bandwidth going to be large?** If you are serving media at volume, unmetered bandwidth is a structural advantage rather than a discount.',
    ]),
    p('What should not decide it: an edge-latency benchmark. Both networks are fast and the difference is invisible next to a poorly optimised image or a slow database query — the things that actually determine whether a page feels quick.'),
    img('decision-order', 'A short sequence of questions resolving to one of two platforms', 'Framework and runtime settle most projects. Latency benchmarks settle none of them.'),

    h2('Can you use both?'),
    p('Yes, and on larger projects it is often right — a static marketing site on Pages, the application on Vercel, one design system between them.'),
    p('The cost is two pipelines, two dashboards and two sets of environment variables. The benefit is that a copy change to marketing cannot break a login, and each half is deployed on the platform that suits it. That is the same split as [running Astro and Next.js side by side](/blog/astro-vs-nextjs), and the same threshold applies: worth it when the two halves have genuinely different change rates, overkill before that.'),

    p('One practical benefit of splitting that rarely gets mentioned: it caps the blast radius of a platform incident. A marketing site and an application on the same provider go down together, and the status page you would point customers at is on the thing that is down. Two providers means the outage is partial, which is a materially better conversation to have.'),

    h3('Keep the domain strategy simple'),
    p('Apex on one, `app.` on the other, DNS wherever you already manage it. Trying to route paths on a single hostname across two platforms is possible and it introduces a proxy layer that will eventually be the thing that broke.'),

    h2('What does the deploy workflow feel like?'),
    p('Similar enough day to day that it rarely decides anything, with three differences worth knowing before you commit.'),

    h3('Preview URLs and who can see them'),
    p('Both give a URL per branch and per commit. Both default to those being public, which matters more than people think — a preview of unreleased work, or one pointed at production-shaped data, is a page anybody with the link can read. Both offer protection; on neither is it the default.'),

    h3('Build minutes and concurrency'),
    p('Free tiers cap concurrent builds, so a repository with several people pushing will queue. On a project where the Studio bundles with the site — this one takes about twelve seconds of its build for a route most visitors never see — that queue is felt sooner than the raw build time suggests.'),

    h3('Rollback is a click on both'),
    p('Every deploy is retained and promoting an older one is immediate. This is the single most valuable operational feature either provides and it is easy to forget it exists until the afternoon you need it — worth actually trying once on a staging project so the path is familiar under pressure.'),

    h3('Environment variables per environment'),
    p('Both scope variables to production, preview and development. The failure mode is identical on each: a variable set only in production means every preview silently uses a missing value, and the symptom is a feature that works live and not in review. Set them everywhere, with test credentials in preview.'),
    img('deploy-workflow', 'A repository producing separate outputs for review and for release', 'The workflows are near-identical. The differences that matter are who can see a preview and what credentials it carries.'),

    h2('How hard is it to move later?'),
    p('For a static site, an afternoon. For anything with a runtime, a project.'),
    p('Static files move by pointing a new build at the same repository. What does not move cleanly is everything platform-specific: middleware semantics, redirect and header syntax, image optimisation behaviour, environment variable handling, and any binding or integration you leaned on.'),

    img('portability', 'A core of ordinary code surrounded by a thin platform-specific shell', 'If the adapter is thin, moving means rewriting the adapter. If platform APIs run throughout, moving means touching everything.'),

    h3('Keep platform-specific code at the edges'),
    p('If your handlers are ordinary functions and the platform adapter is thin, moving is mostly rewriting the adapter. If platform APIs are used throughout, moving means touching everything — which is the general argument for [keeping a thin interface](/blog/r2-vs-s3) around anything a vendor provides.'),

    h3('Redirects and headers are the fiddly part'),
    p('Small, mechanical, and by some distance the most likely thing to leave a quietly broken URL behind after a move.'),
    p('Both support them, with different files and different matching rules. It is not difficult work and it is the kind that produces a broken URL nobody notices for a fortnight, so it deserves a checklist rather than a memory.'),

    h2('What does this site use, and why?'),
    p('Cloudflare Pages, and the reasoning is narrow enough to be worth stating precisely.'),
    p('It is a static Astro build with no runtime — 82 prebuilt pages and one client script. There is no server logic, no session, nothing to run. That makes the hosting decision almost arbitrary, so it came down to adjacency: if the site ever grows a contact endpoint, an upload, or a cached API response, the pieces are bindings rather than another account.'),
    p('The honest counterweight: that is a bet on a future that may not arrive, and if this site were Next.js I would be on Vercel without hesitation. The choice is defensible rather than obviously correct, which is true of most infrastructure decisions at this scale.'),
    quote('Both networks are fast. The decision is about what runs, what is adjacent, and what the bill does at scale — none of which a latency benchmark tells you.'),

    h2('Conclusion'),
    p('For a purely static site, either. The static delivery is equivalent and any difference is smaller than the variance between two visitors, so spending time on the comparison is spending it in the wrong place.'),
    p('The decision becomes real when code has to run. Workers are isolates with no cold start and a compatibility layer rather than full Node; Vercel functions give you the whole Node ecosystem at the cost of a small cold start and a region. A dependency with a native binding decides this on its own.'),
    p('Let framework fit carry more weight than performance. Next.js on Vercel works without configuration and gets features first; Astro and other static frameworks fit Pages naturally, and Cloudflare\'s bindings make storage, KV and queues adjacent rather than credentialled.'),
    p('Watch bandwidth if you serve media at volume — that is where the pricing diverges sharply — and pre-optimise images at build time rather than paying for on-demand transforms on either platform.'),
    p('If you split across both, split by change rate: marketing on one, application on the other, apex and subdomain rather than path routing. And keep platform-specific code at the edges of your codebase, because a static site moves in an afternoon and a runtime tangled with vendor APIs moves over a quarter. If you are choosing at the start of a build, [that is a short conversation](/start) worth having before the runtime exists.'),
  ),
  faqs: faq([
    ['Is Cloudflare Pages faster than Vercel?',
     'Not meaningfully, for static files. Both serve from large global networks and the difference is smaller than the variance between two visitors on the same connection. Real page speed is decided by images, third-party scripts and database queries, not by which edge network delivered the HTML.'],
    ['When should you not use Cloudflare Workers?',
     'When the runtime needs full Node — native modules, filesystem access, image processing, PDF generation, or an SDK with a native binding. Workers are V8 isolates with a compatibility layer, so the long tail of Node packages is where projects get stuck, usually at deploy time.'],
    ['Is Next.js worth hosting outside Vercel?',
     'It runs elsewhere and it is always a step behind — an adapter in the middle, newer features arriving later, and more configuration. If the project is Next.js and you have no specific reason to be elsewhere, Vercel removes friction that is real and immediate.'],
    ['How hard is it to migrate between them?',
     'A static site moves in an afternoon by pointing a new build at the same repo. Anything with a runtime is a project: middleware semantics, redirect and header syntax, image handling, environment variables and any bindings all differ. Keep platform APIs at the edges of your code.'],
  ]),
};
