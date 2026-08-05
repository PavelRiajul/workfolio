import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/posthog-ab-testing-shopify/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-posthog-ab-testing-shopify',
  slug: 'posthog-ab-testing-shopify',
  title: 'A/B Testing a Shopify Store with PostHog',
  category: 'ecommerce',
  order: 92,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-16',
  series: 'CRO',
  excerpt:
    'Feature flags, experiments and session recordings on a Liquid theme — without a dedicated testing tool, and without the flicker that ruins the result.',
  coverLabel: 'PostHog A/B testing — cover',
  body: body(
    p('Dedicated A/B testing tools for Shopify are expensive and most of them work by rewriting the DOM after the page loads, which produces a visible flash of the original content and quietly biases every result they produce. For a store already running PostHog for analytics, the experiment tooling is included, and the implementation is better because you control where the variant is decided.'),
    p('This is the setup I use: PostHog for events, feature flags for assignment, experiments for the statistics, and session recordings for the qualitative half. It is one script instead of three, and it runs the whole [conversion loop](/blog/cro-process-loop) rather than just the test stage.'),
    p('Below is how to wire it into a Liquid theme, the flicker problem and how to avoid it, and the specific things that go wrong when you test a store rather than an app.'),

    h2('Why not use a dedicated testing tool?'),
    p('Because most of them are a third-party script that repaints your page, and you are already paying for that twice.'),
    p('A visual testing tool loads, waits for the DOM, applies its changes and reveals the page. That sequence costs a render-blocking script on every page view for a test running on one of them, and it introduces the flash of original content that makes the variant feel broken. Both problems are worse on mobile, which is where the traffic is.'),
    table('Two ways to run an experiment', [
      ['', 'Visual testing tool', 'Flags in the theme'],
      ['Assignment', 'Client-side, after load', 'Client-side or server-side'],
      ['Flicker', 'Common', 'Avoidable'],
      ['Page weight', 'Added on every page', 'A single analytics script'],
      ['Variant code', 'Lives in the tool', 'Lives in the theme, in git'],
      ['Editing', 'Visual, no developer', 'Developer required'],
      ['Cost', 'Per-visitor pricing', 'Included with analytics'],
    ]),
    p('The row that cuts both ways is the fifth. A visual tool lets a marketer build a variant without a developer, which is a real advantage and the main reason those products sell. The trade is that the variants live outside your repository, nobody reviews them, and a winning test leaves a client-side patch in production indefinitely.'),

    h3('You are probably already running analytics'),
    p('Adding a second vendor for experiments means a second origin, a second script and a second set of events that will disagree with the first. Consolidating onto one tool that does events, flags, experiments and recordings removes an entire category of reconciliation work — and [one fewer third-party origin](/blog/third-party-script-cost) is worth having on a store.'),

    h3('The trade is that you need a developer'),
    p('Every variant is a code change. For a team with development capacity that is an improvement, because the variant is reviewed and version controlled. For a team without one it is a blocker, and a visual tool is the honest recommendation instead.'),
    img('two-approaches', 'A variant decided within the page itself compared with one applied after the page has rendered', 'A visual tool repaints the page after load. Deciding the variant in the theme removes both the flash and the extra script.'),

    h2('How do you install it on a Liquid theme?'),
    p('One snippet in the theme layout, and the identity call that makes the data useful later.'),
    code('liquid', `
{%- comment -%} snippets/posthog.liquid, included in theme.liquid head {%- endcomment -%}
<script>
  !function(t,e){/* PostHog snippet */}(document,window.posthog||[]);
  posthog.init('{{ settings.posthog_key }}', {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
  });

  {%- if customer -%}
    posthog.identify('{{ customer.id }}', {
      email: '{{ customer.email }}',
      orders: {{ customer.orders_count }},
    });
  {%- endif -%}
</script>
`),
    p('Putting the key in a theme setting rather than hardcoding it means the same theme works in a development store without editing files, which matters once you have more than one environment.'),

    h3('Choose the region deliberately'),
    p('For a store selling into the EU or UK, the EU host keeps event data in the region and makes the privacy conversation shorter. It is a one-line decision at install and awkward to change later.'),

    h3('Identify customers, but be careful what you send'),
    p('Linking behaviour to a customer id is what lets you segment by returning customer or order count. Sending an email address into an analytics tool is a decision with legal weight attached, and for most stores the id alone is enough.'),

    h3('Respect consent'),
    p('If you show a consent banner, the analytics script should not be capturing before acceptance. PostHog supports opting in explicitly, and wiring it to the banner is a few lines — worth doing properly rather than discovering it during an audit.'),

    h2('How do you avoid the flicker?'),
    p('Decide the variant before the element renders, not after.'),
    p('Flicker happens because the original content paints, then JavaScript changes it. The fix is to make the change part of the initial render, and there are two ways to do that on Shopify — one simple and one better.'),

    h3('Bootstrap the flag value'),
    p('PostHog can evaluate flags locally if you supply the distinct id and the flag payload at init, which means `posthog.getFeatureFlag()` returns synchronously on the very first call rather than after a network round trip. That alone removes most of the delay.'),
    code('js', `
// Read the assignment synchronously on first paint.
posthog.init(KEY, {
  bootstrap: {
    distinctID: localStorage.getItem('ph_id') ?? undefined,
    featureFlags: JSON.parse(localStorage.getItem('ph_flags') ?? '{}'),
  },
});

const variant = posthog.getFeatureFlag('pdp-delivery-estimate');
document.documentElement.dataset.exp = variant ?? 'control';
`),

    h3('Then switch with CSS, not with JavaScript'),
    p('Setting an attribute on `<html>` before the body renders lets the stylesheet do the work. Both variants exist in the markup, one is hidden by CSS, and there is no repaint because the decision was made before anything appeared.'),
    code('css', `
[data-exp='control'] .pdp-delivery { display: none; }
[data-exp='test']    .pdp-delivery-alt { display: none; }
`),

    h3('Ship both variants in the HTML'),
    p('This is the part people resist and it is what makes the technique work. Both versions are in the Liquid output, the class decides which shows, and the cost is a small amount of extra markup — far cheaper than the flash it prevents.'),

    h3('Reserve the space either way'),
    p('If the variants have different heights, showing one still shifts the layout. Giving the container a consistent minimum height keeps the page stable, which matters because [layout shift on a product page costs orders directly](/blog/near-zero-cls) and would otherwise contaminate the result.'),
    img('no-flicker', 'A variant chosen before the first paint rather than swapped in afterwards', 'Ship both variants, set an attribute before body renders, let CSS choose. No repaint, because nothing was ever changed.'),

    h2('What events should a store capture?'),
    p('The funnel steps, and almost nothing else to begin with.'),
    p('The temptation is to instrument everything, which produces a large event catalogue nobody can navigate and a team that never looks at it. Five events cover the commerce funnel, and you can add more once a specific question needs them.'),
    table('The events worth having on day one', [
      ['Event', 'Fired when', 'Key properties'],
      ['product_viewed', 'Product page loads', 'id, title, price, variant'],
      ['variant_selected', 'Size or colour changes', 'option, value, availability'],
      ['add_to_cart', 'Add succeeds', 'id, quantity, cart value'],
      ['checkout_started', 'Checkout button pressed', 'cart value, item count'],
      ['order_completed', 'Thank-you page', 'order value, items, discount'],
    ]),
    p('The last one is the one to get right, because it carries revenue and it is what turns a conversion-rate result into a revenue-per-session result — which is the honest scoreboard.'),

    h3('Capture the order from the thank-you page'),
    p('Shopify\'s order status page allows additional scripts, and that is where the completed order is known. Without it, PostHog sees people leave for checkout and never learns what happened, which makes every experiment result incomplete.'),

    h3('Name events consistently and write it down'),
    p('`add_to_cart`, `addToCart` and `Add to Cart` will all end up in the catalogue if three people implement events over two years. Agreeing snake case once and keeping a short list of the events and their properties prevents a mess that is genuinely painful to unpick later.'),

    h3('Send properties, not more events'),
    p('One `add_to_cart` event with a `source` property beats separate events for the product page, quick view and collection page. Properties can be filtered; a proliferation of event names cannot be aggregated back together.'),

    h2('How do you run an experiment?'),
    p('Create the feature flag, define the experiment against a goal metric, and let it decide the sample size.'),
    p('The mechanical part is straightforward: a multivariate flag with control and test, a goal metric — usually `order_completed` — and an exposure event so the tool knows who actually saw the test. PostHog computes the required sample and the running significance from there.'),

    h3('Get the exposure event right'),
    p('This is the most common implementation error. If the flag is evaluated on every page but the variant only appears on product pages, everybody is counted as exposed and the effect is diluted to nothing. Fire the exposure only where the change is visible.'),
    code('js', `
// Only count someone as exposed where the variant actually renders.
if (document.querySelector('.pdp-delivery, .pdp-delivery-alt')) {
  posthog.capture('$feature_flag_called', {
    $feature_flag: 'pdp-delivery-estimate',
    $feature_flag_response: variant,
  });
}
`),

    h3('Pick one primary metric before starting'),
    p('Revenue per session or completed orders, chosen in advance. Secondary metrics are for diagnosing a result, not for deciding it — choosing the metric after seeing the numbers makes every experiment a win.'),

    h3('Let it run the full duration'),
    p('The tool will show a result from day one and it should be ignored until the calculated sample is reached and at least two full weeks have passed. This is a discipline problem rather than a tooling problem, and it is where most tests fail.'),
    img('experiment-setup', 'An experiment defined by a flag, a goal metric and an exposure point', 'The common error is exposure. If the flag is read everywhere but the variant only shows on one template, the effect dilutes to nothing.'),

    h3('Use flags for rollouts too, not only tests'),
    p('The same mechanism releases a risky change to five percent of visitors before everyone. On a store that is genuinely valuable — a rewritten cart or a new variant picker can be shipped behind a flag, watched for a day, and turned off from a dashboard rather than through a theme rollback. The experiment is one use of flags; the safety valve is the other.'),
    img('event-catalogue', 'A small set of funnel events with properties rather than a sprawling list of event names', 'Five events cover the commerce funnel. Properties can be filtered later; a proliferation of event names cannot be aggregated back.'),

    h2('What about session recordings?'),
    p('They are the qualitative half of the loop and the feature I would keep if I could only keep one.'),
    p('Watching twenty sessions that reached the cart and did not check out produces better hypotheses in an hour than a week of dashboards. PostHog records in the same script, and filtering recordings by an event — everyone who fired `add_to_cart` but not `checkout_started` — is what makes it practical rather than a pile of video.'),

    h3('Mask everything sensitive by default'),
    p('Addresses, payment fields and personal details should never be captured, and the safe posture is masking all input values and opting specific fields in. On a store this is not optional — the checkout is Shopify\'s, but your cart and account pages are not.'),

    h3('Sample the recordings'),
    p('At volume, recording every session is a large amount of data and a real bandwidth cost on the client. Sampling a percentage, or recording only sessions that hit a particular event, gets the same insight for far less.'),

    h3('Recordings explain results that experiments only report'),
    p('When a variant loses and nobody can say why, ten recordings of visitors who saw it usually answer the question in minutes. That pairing — a number from the experiment and a reason from the recordings — is what turns a result into a finding you can apply to the next page.'),

    h3('Watch the failures, not the successes'),
    p('A recording of a smooth purchase teaches nothing. The value is entirely in the sessions that ended badly, and filtering to those is the difference between a useful hour and an aimless one.'),

    img('recording-filter', 'A large set of recorded sessions narrowed to only those that ended without a purchase', 'Filter to sessions that fired add-to-cart and never reached checkout. That filter is what turns a pile of video into an hour of findings.'),

    h2('What goes wrong on Shopify specifically?'),
    p('Four things, and none of them are obvious until they have already spoiled a test.'),

    h3('The checkout is a different domain'),
    p('Shopify\'s hosted checkout is not your site, and by default the session there is not stitched to the one before it. Capturing the completed order from the order status page and identifying by customer id is what reconnects the two halves.'),

    h3('Themes cache more than you expect'),
    p('Section rendering and any edge caching in front of the store can serve a cached variant to the wrong visitor if assignment happens server-side without a cache key. Client-side assignment with bootstrapped flags avoids this entirely, which is one more reason to prefer it here.'),

    h3('Apps fire their own events'),
    p('A reviews or upsell app with its own analytics can produce duplicate or conflicting event names in your catalogue. Worth checking early — reconciling two sources of `add_to_cart` after six months is a bad afternoon.'),

    h3('Test on a duplicated theme first'),
    p('Preview the experiment on an unpublished theme, walk the whole purchase path, and confirm events arrive before publishing. A broken variant on a live store is lost orders, not a bug report — [the same argument as shipping in small batches](/blog/shopify-performance-optimization).'),
    img('shopify-gotchas', 'Points in a store where tracking continuity breaks between the storefront and checkout', 'Checkout is a different domain. Without capturing the completed order, every experiment result is missing its outcome.'),

    h2('What does it cost to run?'),
    p('Free at small volume, and a real line item at large volume — with one lever that matters.'),
    p('PostHog prices on events and recordings with a generous free allowance, so a modest store pays nothing. A high-traffic store capturing every page view and every session can produce a bill that surprises, and the fix is sampling recordings and not instrumenting things nobody looks at.'),

    h3('Watch the recording volume first'),
    p('Recordings are the expensive part by a wide margin. Sampling at ten or twenty percent, or restricting to sessions matching a funnel event, usually cuts the cost substantially with no practical loss.'),

    h3('Self-hosting is possible and usually not worth it'),
    p('The open-source version can be run yourself, and for most stores the operational cost of doing so exceeds the subscription. It becomes interesting when data residency is a hard requirement rather than a preference.'),

    h3('Delete the instrumentation nobody reads'),
    p('Events accumulate the way apps do, and a catalogue with sixty entries of which eight are ever queried is paying for the other fifty-two. A short review once a quarter — which events appeared in an actual analysis — keeps both the bill and the catalogue navigable.'),
    img('cost-drivers', 'Recording volume dominating a usage bill while event capture remains a small share', 'Recordings are the expensive part by a wide margin. Sampling them is the lever; event volume rarely is.'),

    h2('What does the whole setup take?'),
    p('A day to install and instrument, and half a day per experiment after that.'),
    ol([
      '**Install the snippet** in the theme layout with the key as a setting, plus identity for logged-in customers.',
      '**Capture the five funnel events,** including the order from the status page.',
      '**Enable recordings** with input masking and sampling.',
      '**Build the first experiment** with both variants in the markup and CSS switching.',
      '**Leave it alone** until the sample is reached.'],
    ),
    p('The first four are a day. Each subsequent experiment is a few hours of Liquid and CSS, because the plumbing is already there — which is the point of doing the setup properly rather than per test.'),

    h2('What does it cost?'),
    p('A day of setup, and a developer in the loop for every variant thereafter.'),
    p('The honest counterweight: this approach is better engineering and worse for velocity. A marketing team using a visual editor can launch a test the same afternoon; with flags in the theme they cannot launch one without you. If your organisation has ideas faster than it has development time, a visual tool will run more experiments and more experiments is often worth more than cleaner ones — the flicker and the extra script are a real price, and so is a test that never runs. Choose on which constraint your team actually has, not on which implementation is tidier.'),
    quote('A visual testing tool repaints the page after it loads, which biases every result it produces. Deciding the variant before first paint costs a developer and buys you a number you can trust.'),

    h2('Conclusion'),
    p('Running experiments through PostHog rather than a dedicated testing tool consolidates events, flags, experiments and recordings into one script and one origin, and it puts the variant code in your repository where it gets reviewed. The trade is that every variant needs a developer.'),
    p('Install the snippet in the theme layout with the key as a theme setting, choose the data region deliberately, identify logged-in customers by id, and wire opt-in to your consent banner. Then capture five events — product viewed, variant selected, add to cart, checkout started, order completed — with the last one fired from the order status page, because otherwise you never learn what happened after the handoff.'),
    p('Avoid flicker by deciding the variant before first paint: bootstrap the flag value, set an attribute on the root element, ship both variants in the markup and let CSS choose. Give the container a consistent minimum height so a variant with a different length does not shift the page and contaminate the result.'),
    p('Get the exposure event right — firing it on every page when the variant only renders on product pages dilutes the effect to nothing, and it is the most common implementation error. Pick one primary metric before starting, ideally revenue per session, and ignore the running result until the calculated sample and two full weeks have both passed.'),
    p('Use recordings for the qualitative half, filtered to the sessions that failed, with inputs masked and volume sampled. Test everything on a duplicated theme before publishing, because a broken variant on a live store is lost orders rather than a bug report. If you want this set up properly on your store, [it is part of the CRO work](/services).'),
  ),
  faqs: faq([
    ['Why not use a dedicated Shopify A/B testing app?',
     'Most work by rewriting the DOM after load, which adds a render-blocking script on every page and causes a visible flash of the original content that biases results. They do let a marketer build variants without a developer, which is a genuine advantage if you have no development capacity.'],
    ['How do I stop the flash of original content?',
     'Decide the variant before first paint. Bootstrap the feature flag value so it resolves synchronously, set a data attribute on the html element, ship both variants in the Liquid output, and let CSS hide one. Nothing is ever changed after render, so there is nothing to flicker.'],
    ['Why does my experiment show no effect?',
     'Usually the exposure event. If the flag is evaluated on every page load but the variant only renders on product pages, everyone counts as exposed and any real effect is diluted across visitors who never saw the test. Fire the exposure only where the change is actually visible.'],
    ['How do I track orders when checkout is on Shopify’s domain?',
     'Capture the completed order from the order status page, which allows additional scripts, and identify visitors by customer id so the two sessions stitch together. Without that step PostHog sees people leave for checkout and never learns the outcome, leaving every experiment incomplete.'],
    ['Is PostHog expensive for a busy store?',
     'Events are cheap and session recordings are not — they dominate the bill at volume. Sampling recordings at ten or twenty percent, or restricting them to sessions that hit a specific funnel event, usually cuts the cost substantially with no practical loss of insight.'],
  ]),
};
