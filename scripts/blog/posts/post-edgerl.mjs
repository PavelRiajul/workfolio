import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/edge-rate-limiting/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-edge-rate-limiting',
  slug: 'edge-rate-limiting',
  title: 'Rate Limiting at the Edge, Before It Reaches Your Server',
  category: 'backend',
  order: 59,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-13',
  series: 'Foundations',
  excerpt:
    'Why the limit belongs in front of your origin, which algorithm to pick, and the identity question that decides whether it works at all.',
  coverLabel: 'Edge rate limiting — cover',
  body: body(
    p('A rate limit inside your application still costs you the request. The connection is accepted, the runtime spins up, the middleware runs, a database is consulted about how many requests this client has made — and then you return a 429. You have done most of the work of serving the request in order to refuse it.'),
    p('For an occasional overeager client that is fine. For anything resembling an attack, or a client stuck in a retry loop, it is the wrong place: your origin is absorbing exactly the load the limit exists to prevent.'),
    p('Moving the decision to the edge changes that. The refusal happens in a data center near the client, your origin never sees it, and the cost of a rejected request approaches zero. Here is how to build it, and where the edge is the wrong answer.'),

    h2('What are you actually protecting against?'),
    p('Four different things, and they want different limits. Applying one number to all of them is why rate limits so often block real users while missing the traffic they were built for.'),
    table('Four problems, four shapes of limit', [
      ['Problem', 'Example', 'Limit on', 'Typical window'],
      ['Credential attacks', 'Password guessing', 'IP and account', 'Minutes, strict'],
      ['Expensive operations', 'A model call, a PDF render', 'Account', 'Per hour or day'],
      ['Scraping', 'Bulk reading public pages', 'IP, ASN, fingerprint', 'Minutes, generous'],
      ['Accidental floods', 'A client retry loop', 'API key', 'Seconds, forgiving'],
    ]),
    p('The last row deserves sympathy in the design. Most limits I have seen triggered in production were not attacks — they were somebody\'s integration retrying without backoff after a blip. That client should be slowed down and told clearly why, not banned.'),
    img('four-problems', 'Four distinct traffic patterns approaching a single control point with different characteristics', 'One number for all four is why limits block real users and miss the traffic they were built for.'),

    h2('Why put the limit at the edge?'),
    p('Three reasons, and the third is the one that matters most on a serverless origin.'),
    ul([
      '**The rejected request costs nothing.** No origin invocation, no database round trip, no cold start. A blocked request is answered from a data center near the client.',
      '**Latency is lower for everyone.** The decision happens where the connection lands rather than after a trip to your region, so a legitimate request is not slowed by the check.',
      '**Your origin\'s scaling is protected.** On a per-invocation platform, absorbing a flood costs money directly. The limit that exists to protect a database ends up protecting a bill.',
    ]),
    p('There is a fourth that is easy to overlook: an edge limit still works when your origin is down. If a flood has already knocked something over, a limit running in the same process is no longer running, while one at the edge continues to shed load and gives you room to recover.'),

    h2('Which algorithm should you use?'),
    p('Sliding window for almost everything. Token bucket where bursts are legitimate. Fixed window only if the implementation has to be trivial.'),
    table('Three algorithms', [
      ['Algorithm', 'How it works', 'Weakness'],
      ['Fixed window', 'Count per clock interval, reset at the boundary', 'Allows double the limit across a boundary'],
      ['Sliding window', 'Count over a rolling period', 'Slightly more state'],
      ['Token bucket', 'Tokens refill at a rate; each request spends one', 'Two parameters to tune'],
    ]),
    p('The fixed-window weakness is concrete rather than theoretical. With a limit of 100 per minute, a client can send 100 at 11:00:59 and another 100 at 11:01:00 — 200 requests in a second, entirely within the rules. Any client that discovers this by accident will keep doing it.'),
    code('ts', `
// Sliding window, approximated: weight the previous window by how much
// of it is still in view. One counter per window, close enough, cheap.
const elapsed = (now % windowMs) / windowMs;
const estimate = previousCount * (1 - elapsed) + currentCount;
if (estimate >= limit) return tooManyRequests();
`),
    p('That approximation is what most edge implementations use, because an exact sliding window means storing a timestamp per request. The estimate is slightly generous at the boundary and vastly cheaper, and the trade is right for nearly every application.'),

    img('window-boundary', 'A count resetting at an interval boundary, permitting a concentration of activity across the join', 'A hundred at 11:00:59 and a hundred at 11:01:00. Entirely within the rules, and twice the intended rate.'),

    h3('Token bucket for legitimate bursts'),
    p('If a client\'s natural pattern is quiet for a minute then twenty requests at once — loading a dashboard, syncing after coming back online — a strict per-second limit blocks normal behavior. A bucket that refills steadily and holds a burst allowance permits that while still capping the sustained rate.'),

    h2('What do you key the limit on?'),
    p('This is the decision that determines whether the limit works, and it is harder than choosing an algorithm.'),

    h3('IP address is the default and it is weak'),
    p('An IP identifies a network path, not a person. Behind mobile carrier NAT, thousands of users share one address, so an IP limit either blocks a whole carrier or is set so high it stops anybody. And an attacker with a proxy pool has as many IPs as they care to pay for.'),

    p('It is also worth knowing where the address you are limiting on came from. Behind a proxy, the connecting address is the proxy\'s, and the client\'s appears in a forwarded header — which the client can set. Trusting that header without knowing it was written by your own infrastructure means anyone can present a fresh identity per request, and a limit keyed on it stops nobody at all.'),

    h3('Account or API key is much stronger, where you have one'),
    p('For authenticated traffic, key on the account. It survives IP rotation, it is fair to users behind shared networks, and the limit can vary by plan. The gap is that the endpoints most in need of protection — login, signup, password reset — are precisely the ones without an authenticated identity.'),

    h3('For unauthenticated endpoints, key on two things at once'),
    p('Login is the canonical case. Limit per IP to slow a distributed attempt, and separately per submitted username to stop somebody trying a thousand passwords against one account from a thousand addresses. Either alone leaves a gap the other covers.'),
    code('ts', `
// Two independent limits. Both must pass.
const ok = await Promise.all([
  limiter.check(\`login:ip:\${ip}\`, { limit: 20, windowMs: 60_000 }),
  limiter.check(\`login:user:\${username}\`, { limit: 5, windowMs: 300_000 }),
]);
if (ok.some((r) => !r.allowed)) return tooManyRequests();
`),
    p('Note the username limit is on the value submitted, not on a verified account — you have no verified identity yet. That means it can be used to lock somebody out of their own account by burning their allowance deliberately, so pair it with a signal that lets a legitimate user through, such as a challenge rather than a hard block.'),
    img('key-choice', 'A request being classified by several independent attributes before a decision', 'Two keys, both checked. An IP limit alone misses a targeted attempt; a username limit alone misses a spray.'),

    h2('How do you build it on Cloudflare?'),
    p('Three levels, in increasing order of control, and most projects use the first two.'),
    ol([
      '**Rules in the dashboard.** No code, applied before anything of yours runs, configured per path and method. This is the right answer for login, signup and anything obviously abusable.',
      '**Durable Objects** for a counter with strong consistency. A single object per key is authoritative, which is what you want when the limit protects something expensive.',
      '**KV or a Worker binding** for high-volume, low-stakes limits where eventual consistency is acceptable and the cost per check matters.',
    ]),
    code('ts', `
// Durable Object: one instance per key, so the count is authoritative
// rather than eventually consistent across regions.
export class Limiter {
  async fetch(req: Request) {
    const now = Date.now();
    let { count, resetAt } = (await this.state.storage.get('w')) ?? { count: 0, resetAt: now + WINDOW };
    if (now > resetAt) ({ count, resetAt } = { count: 0, resetAt: now + WINDOW });
    count++;
    await this.state.storage.put('w', { count, resetAt });
    return Response.json({ allowed: count <= LIMIT, resetAt });
  }
}
`),

    p('Which of the three you reach for is mostly a question of what the limit is protecting. A login endpoint is worth the dashboard rule because it is high-value and low-volume; an API serving a mobile client is worth the code because the limit varies per key. Mixing them is normal, and the rules layer runs first regardless.'),

    h3('Global consistency has a latency cost'),
    p('A Durable Object lives in one location. A request from Singapore checking an object in Frankfurt pays that round trip. For a strict limit on an expensive operation that is worth it; for a generous limit on a cheap endpoint it is not, and a per-region approximate count is the better trade.'),
    p('This is the honest counterweight to edge limiting generally. "At the edge" and "globally consistent" pull against each other, and every implementation picks a point between them. Know which one you picked and why.'),

    h2('What must the response tell the client?'),
    p('Enough to behave correctly, which is more than most implementations provide.'),
    code('http', `
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 42
Retry-After: 42
`),
    p('`Retry-After` is the one that matters. Without it a client retries immediately, which converts a rate limit into a tight loop against your edge — the request is cheap to refuse, but the client is now generating far more of them than it was.'),

    h3('Send the headers on success too'),
    p('A client that can see it has 12 of 100 remaining can slow itself down before being blocked. Only sending the numbers on rejection means the only way to discover the limit is to hit it, which makes your best-behaved integrators the ones getting errors.'),

    p('Whatever the API returns, the interface in front of it should say something a person can act on. "Too many requests" is accurate and useless; "you can try again in about a minute" is the same information in a form that stops the user clicking. That sentence is often the difference between a support ticket and no support ticket.'),

    h3('Do not explain the rule'),
    p('Say the request was rate limited and when to retry. Do not say which specific limit was hit or what the thresholds are per key — that is a map for anyone probing the boundaries, and it helps nobody acting in good faith.'),
    img('response-headers', 'A refusal carrying a timing instruction alongside a remaining-allowance figure', 'Retry-After turns a refusal into a schedule. Without it, a rate limit becomes a tight loop.'),

    img('edge-vs-origin', 'A refusal occurring at a near boundary rather than travelling to a distant one', 'The rejected request never reaches your region. That is the whole argument, and it holds even when the origin is already down.'),

    h2('What does the edge limit not solve?'),
    p('Three things, and reaching for the edge when the problem is one of these produces a limit that never fires.'),

    h3('Per-user business quotas'),
    p('"Twenty AI generations per month on this plan" is not a rate limit, it is an entitlement. It needs the account\'s plan, its usage to date and probably a database row. That belongs in the application, close to the data — this is [the metering problem](/blog/ai-cost-logging), not the flooding one.'),

    p('The distinction to hold onto is that a rate limit answers "how often", and an entitlement answers "how much in total". They look similar because both end in a refusal, and they need completely different data to decide — one needs a counter that resets, the other needs a billing period and a plan.'),

    h3('Slow, deliberate abuse'),
    p('A scraper making one request every four seconds from a residential proxy pool is under every reasonable limit and is still extracting your entire catalog. Rate limiting is not the tool; bot detection, and accepting some loss, is.'),

    h3('Expensive work behind cheap requests'),
    p('An endpoint where one request triggers thirty seconds of compute needs a concurrency limit rather than a rate limit. Ten requests a minute is a modest rate and five simultaneous long-running jobs may still exhaust your workers. Cap in-flight work per account, [as you would for any expensive feature](/blog/rate-limiting-ai-features).'),

    h2('How do you test a rate limiter?'),
    p('Deterministically, which means the clock has to be an input rather than something the code reads for itself.'),

    h3('Inject the time'),
    p('A limiter that calls the system clock internally can only be tested by waiting, which makes the suite slow and flaky. Passing a timestamp in lets you assert the boundary behavior exactly — the request at 59.9 seconds and the one at 60.1 — in microseconds.'),
    code('ts', `
// now is a parameter. The window boundary becomes a test case, not a wait.
expect(limiter.check(key, { now: t0 + 59_900 }).allowed).toBe(false);
expect(limiter.check(key, { now: t0 + 60_100 }).allowed).toBe(true);
`),

    h3('Test the boundary, not the middle'),
    p('Nobody ships a limiter that miscounts the tenth request. The bugs live at the window edge, at the moment a counter resets, and in whether a request arriving exactly at the reset is counted against the old window or the new one. Those are the assertions worth writing.'),

    h3('Test that two keys do not interfere'),
    p('A key-derivation bug that collapses two accounts onto one bucket looks fine in a single-user test and blocks half your customers in production. Run the same request as two identities and assert both get a full allowance — the same two-tenant reasoning that applies to [data isolation](/blog/multi-tenant-prisma-postgres).'),

    h3('Load test the limiter, not just the endpoint'),
    p('A limiter with a shared counter is itself a bottleneck. If every request in a burst waits on the same object, you have moved the contention rather than removed it — which is fine if that check is fast and worth measuring before assuming.'),
    img('boundary-test', 'Two probes placed immediately either side of a threshold in a measured interval', 'The bugs are at the window edge. Injecting the clock is what makes that edge testable in microseconds rather than minutes.'),

    h2('How do you roll one out without breaking things?'),
    p('In three stages, because a limit set from intuition is wrong in one direction or the other and you cannot tell which until you look.'),
    ol([
      '**Count without blocking.** Run the limiter, log what it would have rejected, block nothing. A week of this tells you the real distribution rather than your guess at it.',
      '**Set the threshold above the legitimate maximum.** Take the highest rate a real user produced and add headroom. The first version should catch obvious abuse and nothing else.',
      '**Tighten with the data in front of you.** Move the number down while watching what gets caught, and stop when real traffic starts appearing.',
    ]),
    p('Skipping the first stage is how a limit ships that blocks the one customer with a legitimate bulk integration. They notice within an hour, and it is a worse conversation than any attack you were preventing.'),
    quote('Every rate limit I have set from intuition was wrong. Count for a week first — the distribution is never the shape you assumed.'),

    p('The other thing the counting stage gives you is a sense of what normal looks like per endpoint, which is almost never uniform. A search endpoint sees ten times the rate of a settings page from the same user doing nothing unusual, and a single global number set for the quiet endpoint will block the busy one constantly.'),

    h3('Have an escape hatch'),
    p('A per-account override you can raise without a deploy. There will be a legitimate customer who genuinely needs more, and the answer to that should be a configuration change during the call rather than a release.'),

    h2('What should you actually build first?'),
    p('For most projects, two rules and nothing else.'),
    p('A strict limit on authentication endpoints — login, signup, password reset, keyed on both IP and submitted identifier. And a generous limit across everything else, keyed on IP or API key, set well above real usage and there to stop a runaway loop rather than to enforce anything.'),
    p('That is perhaps two hours of work at the CDN level, no code, and it covers the failure modes that actually occur on a small product. Everything beyond it — per-endpoint tuning, plan-based limits, concurrency caps — is worth adding when a specific endpoint proves it needs one, and not in anticipation.'),
    p('The honest counterweight is that a rate limit is a blunt instrument that occasionally hits the wrong person, and every one you add is a way for a legitimate user to see an error. That is a real cost, which is why the answer is two well-chosen rules rather than a limit on everything.'),

    h2('Conclusion'),
    p('Put the limit in front of your origin. A request rejected at the edge costs nothing, does not invoke your functions, does not touch your database, and keeps working when your origin is already struggling — which is exactly when you need it.'),
    p('Use a sliding window rather than a fixed one, because the fixed-window boundary lets a client send double the limit in a moment and any client that finds that by accident will keep doing it. Reach for a token bucket where bursts are a legitimate part of normal use.'),
    p('Spend the thinking on the key rather than the algorithm. IP alone is weak in both directions — shared behind carrier NAT, trivially rotated by anyone determined. Key on the account wherever you have one, and on unauthenticated endpoints check two independent keys so neither a spray nor a targeted attempt slips through.'),
    p('Return `Retry-After` and send the allowance headers on successful responses too, so a well-behaved client can slow itself down instead of discovering the limit by hitting it. Say that the request was limited and when to retry, and nothing about the rule itself.'),
    p('Then roll it out by counting first and blocking later. A week of logging what would have been rejected replaces a guess with a distribution, and the guess is always wrong. Start with two rules — strict on auth, generous everywhere else — and add more only when a specific endpoint has earned one. If something of yours is taking traffic it should not be, [that is usually a short piece of work](/start).'),
  ),
  faqs: faq([
    ['Should rate limiting happen at the edge or in the application?',
     'At the edge for flood protection, in the application for business quotas. An edge rejection costs no origin invocation and keeps working when your origin is struggling. A per-plan monthly allowance needs account data and belongs close to it — that is metering, not rate limiting.'],
    ['Is limiting by IP address good enough?',
     'On its own, no. Carrier NAT puts thousands of users behind one address, so an IP limit either blocks a whole network or is too loose to matter, and anyone determined rotates addresses cheaply. Key on the account where you have one, and use two independent keys on login endpoints.'],
    ['Which rate limiting algorithm should I use?',
     'Sliding window for most cases. A fixed window lets a client send double the limit across a boundary — a hundred at 11:00:59 and a hundred at 11:01:00 — and clients discover this by accident. Use a token bucket where short bursts are legitimate, such as a dashboard loading.'],
    ['What should a 429 response include?',
     'Retry-After, without exception — otherwise clients retry immediately and the limit becomes a tight loop. Send the limit and remaining-allowance headers on successful responses too, so a well-behaved client can slow down before being blocked rather than discovering the ceiling by hitting it.'],
  ]),
};
