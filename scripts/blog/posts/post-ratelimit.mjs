import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/rate-limiting-ai-features/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-rate-limiting-ai-features',
  slug: 'rate-limiting-ai-features',
  title: 'Rate Limiting an AI Feature So One User Cannot Drain the Budget',
  category: 'ai',
  order: 20,
  readTime: '11 min read',
  date: 'December 2025',
  publishedAt: '2025-12-15',
  series: 'AI cost',
  excerpt:
    'Per-user, per-org and global limits for AI endpoints — and why degrading gracefully beats returning an error the user cannot act on.',
  coverLabel: 'Rate limiting — cover',
  body: body(
    p('Rate limiting an ordinary API is about protecting your servers. Rate limiting an AI feature is about protecting your bank account, and that difference changes almost every design decision.'),
    p('A normal endpoint handling ten times its expected traffic costs you some CPU. An AI endpoint handling ten times its expected traffic costs you ten times the money, immediately, with no upper bound until somebody notices. The most expensive account I have investigated was not abuse — it was an integration retrying a failing call every thirty seconds for eleven days.'),
    p('This is one of the six components of [Template 04](/stack), and it goes in before launch alongside cost logging rather than after the first surprising invoice.'),

    h2('Why do AI endpoints need different limits?'),
    p('Three properties make them unlike the rest of your API.'),
    p('**Cost per request varies enormously.** A short classification and a long-context generation might differ by a factor of a thousand in spend while both counting as one request. Any limit expressed in requests is therefore a poor proxy for the thing you actually care about.'),
    p('**The damage is financial and immediate.** An overloaded database recovers when load drops. Money spent does not come back, and there is no natural backpressure — providers are happy to keep serving requests indefinitely.'),
    p('**Legitimate use is bursty.** A user uploading forty documents at once is behaving normally, and a limit tuned to block that will annoy exactly the customers you most want. The limit has to distinguish a burst from a runaway, which a naive per-minute cap does not.'),
    img('cost-variance', 'A row of bars of dramatically different heights, all the same width', 'Same request count, thousandfold cost difference. Counting requests measures the wrong thing.'),

    h2('What should the limit actually count?'),
    p('Cost, with a request-rate limit sitting alongside it for a different purpose.'),
    p('A monthly spend ceiling per user is the primary control, because spend is what you are protecting. A per-minute request limit is the secondary one, and its job is not budget — it is catching loops, because a runaway is defined by frequency rather than by total.'),
    p('Running both means the two failure modes are covered separately. A heavy legitimate user hits the monthly ceiling and gets a clear message; a broken integration hits the per-minute limit within a minute and never reaches the monthly ceiling at all.'),
    p('The distinction matters because the correct response differs completely. A user at their monthly ceiling should be offered an upgrade — they are demonstrating value, and the limit is a pricing conversation waiting to happen. A client making four hundred requests a minute should be cut off immediately and someone should be paged, because nothing legitimate looks like that.'),
    p('Systems with a single limit inevitably tune it for one case and get the other wrong. Tuned for the loop, it is too tight and blocks real users; tuned for the heavy user, it is too loose and a runaway spends thousands before it trips. Two limits with two responses is barely more code and it stops the tuning from being a compromise.'),
    table('What each limit protects against', [
      ['Limit', 'Catches', 'Window', 'Typical response'],
      ['Spend per user', 'Legitimate heavy use', 'Monthly', 'Degrade, notify'],
      ['Requests per minute', 'Loops and runaways', 'Minute', 'Reject, alert'],
      ['Spend per organisation', 'One customer\'s whole team', 'Monthly', 'Degrade, notify owner'],
      ['Global spend', 'Everything, as a backstop', 'Daily', 'Page someone'],
      ['Concurrent jobs', 'Queue starvation', 'Instant', 'Queue behind'],
    ]),

    h2('Where should the check happen?'),
    p('In the adapter, before the provider call — which is one of the better reasons to have [a single provider adapter](/blog/provider-agnostic-ai-sdk) in the first place.'),
    p('Putting the check at each call site guarantees that the fifth feature, written three months later by someone in a hurry, will not have it. And it will be missing quietly, because nothing fails — the feature works perfectly right up until it produces an unbounded bill.'),
    p('One place, applied to every call, with the task kind available so limits can differ by operation. Reranking might be unlimited because it is cheap and internal; generation is limited because it is neither.'),
    code('ts', `
// Inside the adapter, before any provider is touched.
async function complete(input: CompletionInput, ctx: CallContext) {
  const check = await limits.check(ctx.userId, ctx.orgId, input.task);

  if (check.state === 'blocked') {
    throw new RateLimited(check.reason, check.resetAt);
  }
  if (check.state === 'degraded') {
    // Still serve the user — just more cheaply.
    input = { ...input, maxTokens: 500, task: 'generate_cheap' };
  }

  return providerFor(input.task).complete(input);
}
`),

    h2('What should happen when a limit is hit?'),
    p('Degrade, do not fail. This is the design decision that separates a limit users never notice from one that reads as broken software.'),

    h3('Shorten the context'),
    p('Retrieving five passages instead of twenty cuts cost substantially with a modest quality reduction. For a user who has exhausted their allowance, a slightly worse answer is vastly better than no answer.'),

    h3('Route to a cheaper model'),
    p('A smaller model at a fraction of the cost is usually adequate for straightforward questions. The user notices little, and the ones who do are generally the heavy users who understand why.'),

    h3('Queue instead of rejecting'),
    p('For non-interactive work — batch extraction, background indexing — exceeding a rate limit should slow the queue rather than fail the job. Nobody is waiting on a screen, so latency is nearly free.'),

    h3('Only then, a clear message'),
    p('When degradation is not possible, say what happened, what the limit was, and when it resets. "Something went wrong" for a rate limit is a support ticket; "you have used this month\'s allowance, which resets on the 1st" is not.'),
    img('degradation-ladder', 'A descending series of steps with an item moving down rather than falling off', 'Four rungs before failure. Most users never reach the bottom one.'),

    h2('How do you implement it without a new service?'),
    p('For spend limits, a query against the usage table you already have. For rate limits, a counter — Postgres is fine at small scale, and Redis or a Durable Object once the check itself becomes hot.'),
    p('The spend check is straightforward: sum this month\'s `cost_cents` for the user, compare against their plan ceiling. That is a single indexed query on [the table cost logging already writes](/blog/ai-cost-logging), and at reasonable volume it is fast enough to run inline.'),
    p('Where it gets slow, cache the answer for a minute. A user cannot meaningfully exceed a monthly ceiling in sixty seconds, so a slightly stale figure is harmless — and it turns a per-request query into one query per user per minute.'),

    h3('The distributed counter problem'),
    p('Per-minute limits across multiple instances need shared state, because each instance counting locally means the effective limit multiplies by instance count. A single Redis counter or a Durable Object solves it; an in-memory counter per process does not, and it fails silently by being too permissive.'),

    h2('What limits should you actually set?'),
    p('Set them from your own data rather than from intuition, once you have a month of usage.'),
    p('Look at the distribution of monthly spend per user. Set the ceiling somewhere above the ninety-fifth percentile — high enough that normal use never approaches it, low enough to bound the worst case. On most products this lands surprisingly high, because the distribution has a long tail and a fat head.'),
    p('For per-minute rates, look at what a legitimate burst looks like. A user uploading a batch of documents might legitimately make thirty requests in a minute; a loop makes several hundred. There is usually a wide gap between the two, and the limit belongs in the middle of it.'),
    table('Reasonable starting points before you have data', [
      ['Tier', 'Monthly spend cap', 'Requests/minute'],
      ['Free trial', '$2–5', '10'],
      ['Standard paid', '15–20% of plan price', '30'],
      ['Team or business', '15–20% of plan price', '60 per user'],
      ['Internal or admin', 'Alert only', '120'],
    ]),
    p('The 15–20% figure is the one worth internalising. If a customer\'s AI usage consistently exceeds a fifth of what they pay, the pricing is wrong rather than the usage, and a limit is a temporary measure while that conversation happens.'),

    h2('Should free tiers be limited differently?'),
    p('Yes, and more tightly than feels comfortable, because free-tier AI spend is unbounded by definition.'),
    p('A free tier with a generous AI allowance is a marketing budget with no cap, and it will be found. The useful framing is to decide what a free trial is worth as customer acquisition, then set the ceiling to that number and treat overspend as an over-budget campaign.'),
    p('Degradation matters even more here. A trial user hitting a hard error learns the product is broken; a trial user hitting a clear "upgrade for more" learns the pricing. Same limit, entirely different outcome.'),

    h2('How do you communicate limits in the interface?'),
    p('Before they bind, not at the moment they do. A limit encountered without warning feels arbitrary; a limit you have been watching approach feels like a plan.'),
    p('Show remaining allowance where it is relevant — near the input for usage-based products, in account settings otherwise. Warn at around 80%, in a way that is informative rather than alarming, and make the upgrade path obvious at that point rather than at the wall.'),
    p('Avoid exposing raw token counts. They mean nothing to most users and they invite questions expensive to answer. Express allowance in units that map to what the customer did — answers, documents, searches — which also insulates you from provider pricing changes.'),
    img('usage-indicator', 'A progress indicator approaching but not reaching a marked boundary', 'Warn at 80%. A limit you watched approach is a plan; one you hit without warning is a fault.'),

    h2('What should you monitor?'),
    p('Limit hits are a product signal, not just an operational one, and they are frequently the most informative thing in your logs.'),

    h3('Hit rate by tier'),
    p('A rising proportion of paid users hitting ceilings means either the limits are too low or the pricing is wrong. Either way it is a commercial signal arriving before the churn does.'),

    h3('Which limit fires'),
    p('Per-minute limits firing suggests loops or abuse. Monthly ceilings firing suggests pricing. They are different problems with different owners, and aggregating them hides which you have.'),

    h3('Users who hit repeatedly'),
    p('An account hitting a ceiling every month is either a pricing mismatch or an unusually valuable customer being throttled. Both warrant a human looking, and neither is visible in an aggregate count.'),

    h2('How do limits interact with the job queue?'),
    p('Background work needs different treatment from interactive requests, and conflating them produces the two worst outcomes: interactive users blocked by a batch job, or a batch job failing because it was treated like a page load.'),

    h3('Separate the budgets'),
    p('Interactive and background work should draw on distinct allowances. A user who queues a hundred documents for extraction should not find their chat feature unusable for the rest of the month as a result, and the reverse is equally unwelcome.'),
    p('In practice this means the spend check takes the task kind into account, with separate ceilings per category. It costs one more column and it removes an entire class of confusing support conversation.'),

    h3('Throttle the queue, do not fail it'),
    p('When background work approaches a limit, slow the worker rather than rejecting jobs. A queue that drains over four hours instead of one is almost always acceptable; a queue that drops a third of its jobs is not, and the user has no way to tell which third.'),

    h3('Cap concurrency per organisation'),
    p('Without it, one customer submitting a large batch monopolises the workers and everyone else waits. A per-organisation concurrency cap — say four simultaneous jobs — keeps the queue fair without needing a priority system, which is considerably more machinery than most products need.'),
    img('queue-fairness', 'Several parallel lanes with items advancing at an even pace, one lane held back', 'A concurrency cap per organisation gives you fairness without building a priority system.'),

    h2('What happens when the provider rate limits you?'),
    p('The other direction, and it needs handling too. Providers impose their own limits, and hitting theirs looks different from hitting yours.'),
    p('A provider rate limit is retryable and usually short-lived. The adapter should recognise it, respect any retry-after header, back off with jitter, and retry — all without the feature knowing anything happened. Users should never see a provider limit surfaced directly, because it is not something they did or can act on.'),
    p('Where it matters is capacity planning. Provider limits firing regularly means you are near an account ceiling that needs raising, and that is a request with lead time. Log them distinctly from your own limits so the two are separable — they have entirely different owners and remedies.'),
    p('There is also a queue interaction worth anticipating. If a batch of background jobs all start simultaneously and all hit the provider limit, naive retries produce a thundering herd that keeps the limit saturated. Jitter and a concurrency cap between them prevent it, which is the same pair of controls that solves fairness.'),
    img('provider-limits', 'An outward flow meeting a boundary and redistributing over time rather than stopping', 'Provider limits are the adapter\'s problem, not the user\'s. Absorb them and log them separately.'),

    h2('What about abuse specifically?'),
    p('Genuine abuse is rarer than accidental overuse, and the defences overlap enough that it is worth treating as a secondary concern rather than the primary design driver.'),
    p('The controls that matter are the ones already described: per-user ceilings, per-minute rates, and a global backstop. Add authentication requirements on anything expensive — an unauthenticated AI endpoint is an invitation — and rate limit by IP at the edge for whatever remains public.'),
    p('Where AI features are genuinely different is prompt-based abuse: using your feature as a free general-purpose model by embedding unrelated instructions. Constraining what the feature will answer, and refusing clearly outside its scope, handles most of this and is worth doing regardless because it also improves quality.'),
    quote('Design for the accidental runaway first. A loop in your own retry logic will find your limits before an attacker does.'),

    h2('How do you test limits?'),
    p('Deliberately, because these paths never occur during normal development and always occur in production.'),
    p('Write tests that drive a user past each ceiling and assert the degraded behaviour rather than an exception. Test the boundary specifically — at 99% and at 101% of the limit — because off-by-one errors here either block legitimate users or let the limit be exceeded.'),
    p('Test the distributed case if you run multiple instances. A counter that works on one process and fails on four is a common and expensive bug, and it only appears under the load that made you scale out in the first place.'),
    p('And run a periodic check that limits are actually enforced on every AI endpoint. A new feature that bypasses the adapter is the realistic way this protection disappears — which is why the adapter boundary is worth enforcing with a lint rule.'),
    p('One test worth writing that people usually skip: assert that a degraded response is still a valid response. It is easy to write a degradation path that shortens the context so aggressively the answer becomes useless, or that switches to a model whose output does not satisfy the schema the caller expects. A degradation that produces broken output is worse than a clean refusal, because the user acts on it.'),

    h2('Conclusion'),
    p('Limit on cost, not on request count, because request count is a poor proxy for the thing that hurts. Put the check in the adapter so no feature can be written without it. Run a monthly spend ceiling for legitimate heavy use and a per-minute rate limit for loops, since those are different failures.'),
    p('When a limit binds, degrade — shorter context, cheaper model, slower queue — and only fail with a clear message when degradation is impossible. Warn at 80% in the interface, express allowance in units the customer understands, and set the numbers from your own distribution once you have a month of data.'),
    p('That is roughly two days of work. It converts the most uncomfortable property of shipping an AI feature — a bill with no ceiling — into a bounded, predictable line item, and it means the answer to "what is the worst case?" is a number rather than a shrug.'),
    img('bounded-worst-case', 'An area enclosed by a defined boundary with a marked maximum', 'The point is not to ration ordinary use. It is to make the worst case a number you can state.'),
    p('If you are adding this to something already live, do it in the order the risk sits. The global daily backstop first, because it takes an hour and bounds everything else while you work. Then the per-minute rate limit, because loops are the most common cause of a shocking bill and they are the fastest to trigger. Then per-user monthly ceilings, which need a month of data to set sensibly. The interface work — the allowance indicator and the 80% warning — can follow once the numbers have settled, since it is the only part users see and the last part worth guessing at.'),
  ),
  faqs: faq([
    ['Should AI rate limits count requests or tokens?',
     'Cost, ideally. One long-context request can cost more than a hundred short ones, so request count is a poor proxy. Run a monthly spend ceiling as the primary control and a per-minute request limit alongside it to catch loops.'],
    ['What should happen when a user hits the limit?',
     'Degrade rather than fail: a smaller model, a shorter context, or a slower queue for background work. Only return an error when degradation is impossible, and then say what the limit was and when it resets.'],
    ['Where should rate limiting live?',
     'In the provider adapter, before any call goes out. Implementing it per call site guarantees the next feature written under time pressure will be missing it, and it will be missing quietly because nothing fails until the bill arrives.'],
    ['Do rate limits hurt the user experience?',
     'Well-designed ones are invisible to normal use because they only bind on outliers. Set the ceiling above the ninety-fifth percentile of your own usage distribution, warn at 80%, and degrade rather than erroring when it is reached.'],
  ]),
};
