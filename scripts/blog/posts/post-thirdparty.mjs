import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/third-party-script-cost/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-third-party-script-cost',
  slug: 'third-party-script-cost',
  title: 'What Third-Party Scripts Actually Cost You',
  category: 'performance',
  order: 83,
  readTime: '13 min read',
  date: 'May 2026',
  publishedAt: '2026-05-07',
  series: 'Foundations',
  excerpt:
    'A tag manager, a chat widget and two analytics scripts can outweigh your entire application. How to measure the damage and what to do about each one.',
  coverLabel: 'Third-party script cost — cover',
  body: body(
    p('I have audited sites where the team spent a fortnight on code splitting and shipped 90KB of application JavaScript, then loaded 800KB of third-party scripts on every page without anybody signing off on it. The optimisation was real and it was rounding error.'),
    p('Third-party scripts are the largest performance liability on most commercial sites, and they are uniquely hard to argue about because each one was added for a defensible reason by somebody who is not a developer. The chat widget is there because support asked for it. The tag manager is there because marketing needed to move without a deploy.'),
    p('So this is not an argument for removing them. It is a method for finding out what each one costs, and a set of techniques for keeping the ones you need without paying full price for them.'),

    h2('Why are third-party scripts so much worse than your own?'),
    p('Because you control none of the variables that matter and they execute with the same privileges as your code.'),
    p('Your own bundle is versioned, measured, minified against a budget, and served from your CDN. A third-party script is fetched from somebody else\'s origin, at whatever size they shipped today, executing whatever they changed this morning, at a priority you did not set. You cannot cache it usefully, you cannot split it, and you cannot fix it.'),
    table('Your code versus theirs', [
      ['', 'Your bundle', 'Third-party script'],
      ['Size', 'Measured, budgeted', 'Whatever they ship'],
      ['Changes', 'On your deploy', 'Without notice'],
      ['Origin', 'Your CDN', 'Theirs — extra DNS, TLS, connection'],
      ['Caching', 'Long, immutable, hashed', 'Short, often uncacheable'],
      ['Failure', 'Caught in CI', 'Live, at their pace'],
      ['Removal', 'A pull request', 'A negotiation'],
    ]),
    p('The last row is the one that makes this a management problem rather than an engineering one. Removing a tracking script means telling somebody their dashboard is going away, and that conversation needs a number attached to it — which is what the measurement section below is for.'),

    h3('Every new origin costs a round trip before it costs bytes'),
    p('Each distinct third-party domain requires DNS resolution, a TCP handshake and a TLS negotiation before a single byte of script arrives. On a fast connection that is perhaps 100ms; on mobile it is regularly 300ms or more. Four vendors is four of those, and they often chain — a tag manager that loads three tags, each from a different origin, serialises the cost.'),

    h3('They compete with your critical path'),
    p('The browser has a finite number of connections and one main thread. A tracking script parsing and executing during page load is directly delaying your own render, and the priority it gets is frequently higher than you would choose. This is the mechanism behind most third-party [LCP damage](/blog/core-web-vitals-nextjs) — not the download, the contention.'),
    img('origin-cost', 'Several separate connection setups happening before any useful bytes arrive', 'Every vendor is a new DNS lookup, handshake and TLS negotiation before the first byte. On mobile that is 300ms each, and they chain.'),

    h2('How do you measure what each one costs?'),
    p('Block it and measure the difference, one at a time. Everything else is guesswork.'),
    p('The Coverage and Network panels tell you the byte cost, which is the least interesting part. The Performance panel attributes main-thread time by origin, which is closer. But the number that ends the argument is the A/B: run the page five times with the script, five times with it blocked, compare median LCP and total blocking time.'),

    h3('Request blocking in DevTools'),
    p('The Network panel has a block-request-domain option in its context menu. Block one vendor, run Lighthouse, record the result, unblock, repeat. Twenty minutes for four vendors and you have a table nobody can argue with.'),

    h3('Attribute main-thread time by origin'),
    p('In a Performance recording, group the bottom-up view by URL and the third-party origins separate out immediately. It is common to find a single tag consuming 400ms of scripting on a page whose own application code uses 200ms.'),

    h3('Check what the tag manager is really loading'),
    p('A tag manager is one script that loads an unknown number of others, and the list drifts as people add tags. Opening the network waterfall and counting requests from origins you did not choose is often the moment the problem becomes visible to everybody in the room.'),
    code('js', `
// Quick census: what did third parties actually cost this page load?
const own = location.origin;
const rows = performance.getEntriesByType('resource')
  .filter((r) => !r.name.startsWith(own))
  .reduce((acc, r) => {
    const host = new URL(r.name).host;
    acc[host] ??= { requests: 0, bytes: 0, ms: 0 };
    acc[host].requests += 1;
    acc[host].bytes += r.transferSize || 0;
    acc[host].ms += r.duration;
    return acc;
  }, {});

console.table(rows);
`),
    p('Paste that into the console on any page and you get a per-vendor breakdown in about a second. It is the fastest way I know to start a conversation about the fourth analytics script.'),
    img('per-vendor-table', 'A breakdown of requests, bytes and time attributed to each external origin', 'Block one vendor, measure, unblock, repeat. Twenty minutes produces a table nobody can argue with.'),

    h2('What does a typical stack actually add up to?'),
    p('More than the site, on a majority of commercial pages I have looked at.'),
    table('Common vendors and their rough weight', [
      ['Script', 'Transfer', 'Main thread', 'Notes'],
      ['Tag manager', '~40KB', '50–150ms', 'Plus everything it loads'],
      ['Analytics', '~50KB', '50–100ms', 'Often two of them'],
      ['Chat widget', '150–400KB', '200–500ms', 'Usually the largest single item'],
      ['Ad or remarketing tag', '100–300KB', '100–400ms', 'Frequently chains to more origins'],
      ['A/B testing', '~60KB', '100–300ms', 'Blocking by design — see below'],
      ['Consent banner', '30–80KB', '50–150ms', 'Must run first, so it delays everything'],
    ]),
    img('typical-stack', 'A stack of external dependencies whose combined weight exceeds the application beneath it', 'The shape is consistent: the chat widget is biggest, the consent banner does the most damage per kilobyte, and the total exceeds the app.'),
    p('Those are ranges, not measurements of your site — measure your own. But the shape is consistent: the chat widget is usually the biggest, the consent banner is usually the most damaging per kilobyte because of when it runs, and the total is usually a multiple of the application bundle.'),

    h3('The chat widget nobody uses'),
    p('It is worth knowing the conversation rate before defending the cost. A widget loading 300KB on every page view to serve a fraction of a percent of sessions is an expensive rounding error, and the vendor\'s own dashboard has the number.'),

    h3('Two analytics scripts is common and rarely deliberate'),
    p('One was added by a developer, one by a marketing agency, and neither party knows about the other. An audit turns this up often enough that it is worth checking first — it is the cheapest win available.'),

    h2('What can you do about it?'),
    p('Four techniques, in descending order of how much they save.'),
    ol([
      '**Remove it.** The only intervention that saves the whole cost, and it is available more often than people assume.',
      '**Defer it** until after the page is interactive, or until the user does something that needs it.',
      '**Move it off the main thread** with a partytown-style worker, where the vendor tolerates it.',
      '**Self-host it,** which removes the connection setup and lets you cache properly — for the few vendors that permit it.',
    ]),
    p('Most teams reach for the third and fourth because they are technical and do not require a conversation. The first two save vastly more, and the conversation is the work.'),

    h3('Removal starts with usage data'),
    p('Every one of these vendors reports its own usage. Pull the number of sessions that actually interacted with the widget, the number of experiments the A/B tool ran last quarter, the number of times anybody opened the second analytics dashboard. Bring those to the meeting rather than a performance opinion.'),

    h3('Deferring is usually free'),
    p('Almost nothing a third party does needs to happen during initial render. Analytics can fire after load, chat can load when the user scrolls or clicks, remarketing tags can wait. The only genuine exception is a consent banner, and personalisation tools that must run before paint — which is exactly why those two do the most damage.'),
    code('ts', `
// Load the chat widget on intent, not on page load.
const load = () => {
  if (window.__chat) return;
  window.__chat = true;
  const s = document.createElement('script');
  s.src = 'https://vendor.example/widget.js';
  s.async = true;
  document.head.append(s);
};

// Whichever comes first: a real signal of intent, or idle time.
['pointerdown', 'keydown', 'touchstart'].forEach((e) =>
  addEventListener(e, load, { once: true, passive: true })
);
requestIdleCallback?.(load, { timeout: 8000 });
`),
    p('That pattern — bind to first interaction, with an idle fallback — moves a 300KB widget entirely out of the load path while keeping it available before any user could plausibly want it. The facade below is the version with a visible button.'),
    img('defer-on-intent', 'A heavy widget loading only after a signal of user intent rather than during initial render', 'Bind to first interaction with an idle fallback. A 300KB widget leaves the load path and nobody notices.'),

    h2('What is a facade and when should you use one?'),
    p('A cheap placeholder that looks like the widget and loads the real thing on click. It is the highest-leverage technique in this whole area.'),
    p('A chat launcher is a circle with an icon. That is perhaps 2KB of HTML and CSS. The 300KB of vendor JavaScript is only needed once somebody clicks it, and the proportion of visitors who do is small. Rendering your own launcher and swapping in the real widget on click preserves the entire feature at a fraction of a percent of the cost.'),

    h3('The same applies to embedded video'),
    p('An embedded player loads hundreds of kilobytes to display a thumbnail with a play button. A poster image and a play button that swaps in the iframe on click is visually identical and roughly free — and it is the single biggest saving available on most content pages.'),

    h3('And to maps'),
    p('An interactive map on a contact page is heavy and almost nobody pans it. A static map image linking out to the real thing serves the actual need — where are you — for a few kilobytes. This is the version I ship on contact pages by default.'),

    h3('Facades have a real cost too'),
    p('You are rebuilding a small piece of the vendor\'s interface, which means it can drift from theirs and you own the accessibility of it. Keep it genuinely simple: a button with a proper label that swaps in the real thing. Anything more elaborate stops being worth it.'),
    img('facade-swap', 'A lightweight placeholder standing in for a heavy embed until it is activated', 'A launcher is a circle with an icon. The 300KB behind it is only needed on click, and most visitors never click.'),

    h2('Should you self-host third-party scripts?'),
    p('Where the vendor allows it and the script does not change often, yes — but the benefit is smaller than people expect.'),
    p('Self-hosting removes the connection setup and lets you serve the file with your own cache headers and compression, which is worth perhaps 100–300ms of the total. What it does not do is reduce the parse and execute cost, which is usually the larger half. It also means you are now responsible for updating a file whose contents you do not understand.'),

    h3('Analytics is the usual candidate'),
    p('Some analytics vendors publish a self-hostable script and a proxy endpoint, and this also survives ad blockers — which is a data-quality argument as much as a performance one. Check the terms; some licences forbid it.'),

    h3('Never self-host anything that must be current'),
    p('A payment provider\'s script, a fraud tool, a consent platform — these change for security and compliance reasons and a stale copy is a genuine liability. Leave those where they are.'),

    h3('A worker is the other half of this'),
    p('Moving a script into a web worker with a proxied DOM removes it from the main thread entirely, which addresses the execution cost that self-hosting does not. It works well for analytics and badly for anything that needs to render, and it is worth an afternoon of testing before committing.'),

    img('self-host-limits', 'A file moved onto a local origin while its execution cost stays exactly where it was', 'Self-hosting removes the connection setup, not the parse and execute cost — which is usually the larger half.'),

    h2('How do you stop new ones appearing?'),
    p('A policy with a number in it, and a check in CI. Otherwise this grows back within two quarters.'),

    h3('One owner per script'),
    p('Every third-party script should have a named owner and a stated purpose in a document somebody can find. Scripts without an owner are the ones that survive for three years after the campaign ended.'),

    h3('A review date'),
    p('Adding a tag with a date attached — "review in six months" — makes removal the default rather than a fight. Most tags added for a campaign should not outlive it.'),

    h3('Assert on third-party weight in CI'),
    p('Lighthouse CI can assert on total byte weight and on the third-party summary specifically. A build that fails when external scripts exceed a threshold turns a slow accumulation into a decision at the moment it is made, which is the same argument as every other [budget in the pipeline](/blog/bundle-splitting).'),

    h3('Route tags through one place'),
    p('If a tag manager exists, everything should go through it — not because it is fast, but because it is the only way to see the full list. Half the tags in the manager and half in the template is how a site ends up with two analytics scripts.'),
    img('governance', 'A list of external dependencies each carrying an owner and a review date', 'One owner and a review date per script. Without them, the tag added for a six-week campaign is still loading three years later.'),

    h2('What about the ones you cannot remove?'),
    p('Payment, consent and fraud tools, mostly — and the technique there is sequencing rather than removal.'),

    h3('Load payment scripts on the pages that need them'),
    p('A checkout provider\'s script on every page of the site is common and unnecessary. Loading it on the cart and checkout routes only is usually a two-line change and removes it from the ninety percent of pageviews that never reach checkout. This is standard on the [Shopify and commerce work](/services) I do.'),

    h3('Give the consent banner the smallest possible footprint'),
    p('It has to run first, so its size is multiplied by its position. A lightweight self-hosted banner that writes a cookie and then loads the vendor tooling is meaningfully faster than a hosted platform that arrives from a third origin before anything else can happen.'),

    h3('Preconnect to the ones that survive'),
    p('For a vendor you cannot defer, `<link rel="preconnect">` starts the DNS, TCP and TLS work early and reclaims most of the connection cost. Use it for two or three origins at most — every preconnect competes for the same connections, and a dozen of them is slower than none.'),
    code('html', `
<!-- Only for origins you know will be requested, early, on this page. -->
<link rel="preconnect" href="https://js.stripe.com" crossorigin>
<link rel="dns-prefetch" href="https://js.stripe.com">
`),

    img('unavoidable-tags', 'A required dependency narrowed to the routes that need it rather than loading everywhere', 'The scripts you cannot remove get sequenced instead: checkout-only loading, a small consent footprint, two preconnects at most.'),

    h2('What does this actually save?'),
    p('On a typical commercial site, more than any change to your own code.'),
    p('A recent audit: 780KB of third-party JavaScript across six vendors, 1.4 seconds of main-thread scripting on a mid-range phone. Removing a duplicate analytics tag, putting the chat widget behind a facade, deferring the remarketing tag and loading the payment script only on checkout took it to 190KB and about 350ms. The application code was not touched.'),
    p('That is a four-fold reduction from four decisions, none of which were technically difficult and three of which required somebody to agree. Against that, the [image work](/blog/image-optimization-strategy) on the same site saved more bytes and the bundle work saved fewer — all three were worth doing and this one was the fastest.'),
    quote('Most sites ship more of somebody else\'s JavaScript than their own. The work is not technical — it is finding the number that makes the conversation short.'),

    h2('What does it cost?'),
    p('An afternoon to measure, and then as long as the conversations take.'),
    p('The measurement is genuinely half a day: census the origins, block each vendor in turn, produce the table. Implementing facades and deferral for the two or three worst offenders is another day. The remaining time is organisational, and it is the part that determines whether the work happens.'),
    p('The honest counterweight: some of these scripts earn their cost. A remarketing tag that measurably drives revenue is not a performance problem, it is a trade, and a developer who removes it on performance grounds without checking has made the site faster and the business worse. Bring the measurement, let the owner weigh it, and be genuinely willing to hear that a 200ms cost is worth paying. The ones that cannot survive that conversation are the ones to remove.'),

    h2('Conclusion'),
    p('Third-party scripts are usually the largest performance liability on a commercial site and the one least often measured, because each was added by somebody who is not watching the waterfall. Start by counting: a few lines in the console produce a per-vendor breakdown of requests, bytes and time, and blocking each vendor in turn for a Lighthouse run turns that into a table nobody can argue with.'),
    p('Then work in order of saving. Removal beats everything, and duplicate analytics tags plus tags outliving their campaigns are more common than you would expect. Deferring is next and is nearly free — almost nothing a third party does needs to happen during initial render, so bind heavy widgets to first interaction with an idle fallback.'),
    p('Use facades for anything with a visible entry point. A chat launcher is a circle with an icon, an embedded video is a poster and a play button, and a contact-page map is an image. Each of those preserves the feature at a fraction of a percent of the weight, and video facades in particular are usually the single biggest saving on a content page.'),
    p('Self-host only where the vendor allows it and the script is stable — never for payment, consent or fraud tooling. Preconnect to the two or three origins you genuinely cannot defer, and no more than that.'),
    p('Then govern it: one named owner and a review date per script, everything routed through one place so the full list is visible, and a CI assertion on third-party weight so growth is a decision rather than a drift. If a site is slow and the application code already looks fine, [this is where to look next](/start).'),
  ),
  faqs: faq([
    ['How do I find out what a third-party script costs?',
     'Block it and measure. The Network panel can block a domain; run Lighthouse five times with it blocked and five times without, then compare median LCP and total blocking time. For a quick census, iterate performance.getEntriesByType("resource") and group requests, bytes and duration by host.'],
    ['Is a tag manager bad for performance?',
     'The container itself is around 40KB, which is modest. The problem is what it loads — an unknown and growing list of tags from origins you did not choose, each with its own connection setup. Route everything through it anyway, because it is the only way to see the full list.'],
    ['What is a facade and why does it help so much?',
     'A lightweight placeholder that looks like the widget and loads the real one on click. A chat launcher is a couple of kilobytes of HTML; the 300KB of vendor code behind it is only needed once somebody clicks, which most visitors never do. The same applies to video embeds and maps.'],
    ['Should I self-host third-party scripts?',
     'Only where the vendor permits it and the script does not change often. It removes the connection setup and lets you cache properly, worth roughly 100–300ms, but it does not reduce parse and execute cost. Never self-host payment, consent or fraud scripts — a stale copy is a liability.'],
    ['Can I just remove the ones that look slow?',
     'Measure first, then bring the number to whoever owns the script. Some of these genuinely earn their cost, and removing a remarketing tag that drives revenue makes the site faster and the business worse. The ones that cannot survive an honest cost conversation are the ones to remove.'],
  ]),
};
