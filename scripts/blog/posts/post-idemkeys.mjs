import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/idempotency-keys/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-idempotency-keys',
  slug: 'idempotency-keys',
  title: 'Idempotency Keys: Making Retries Safe on Your Own API',
  category: 'backend',
  order: 56,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-10',
  series: 'Foundations',
  excerpt:
    'A timeout tells the client nothing about whether the work happened. Idempotency keys are how a retry becomes safe instead of a second order.',
  coverLabel: 'Idempotency keys — cover',
  body: body(
    p('A request times out. The client has no idea whether the server did the work — a timeout is the absence of an answer, not a negative one. So it retries, because the alternative is silently dropping something the user asked for.'),
    p('If the endpoint creates an order, the user now has two. This is not a rare race; it is the ordinary consequence of an unreliable network meeting a client that behaves sensibly, and it happens on a train, in a lift, and on any mobile connection.'),
    p('Idempotency keys are the standard fix: the client names the attempt, the server remembers the name, and a retry returns the original result instead of doing the work again. I wrote about [surviving duplicate webhooks from Stripe](/blog/stripe-webhooks-idempotency); this is the same problem from the other side, where you are the API being retried.'),

    h2('Why is a timeout worse than an error?'),
    p('Because an error is information and a timeout is the absence of it. Every other response tells the client what happened.'),
    table('What each outcome tells the client', [
      ['Response', 'Did the work happen?', 'Safe to retry?'],
      ['200 / 201', 'Yes', 'No'],
      ['400 / 422', 'No', 'Not without changing the request'],
      ['500', 'Unknown, probably not', 'Risky'],
      ['Timeout / connection reset', 'Completely unknown', 'Necessary and dangerous'],
    ]),
    p('The bottom row is the whole problem. The request may have been processed fully and the response lost on the way back; it may never have arrived. Both look identical to the client, and the two correct behaviors are opposite.'),
    p('Without idempotency keys the client has to choose between duplicating work and losing it. Neither is acceptable for anything that charges money or creates a record, and no amount of care on the client side resolves it — the information the client would need does not exist.'),
    img('timeout-ambiguity', 'A message path where the outbound leg and the return leg fail identically from the sender\'s view', 'Processed and lost on the way back, or never received. The client cannot tell, and the right response differs.'),

    h2('How does an idempotency key work?'),
    p('The client generates a unique value per logical operation and sends it as a header. The server stores it with the result. A second request with the same key returns the stored result without re-executing.'),
    code('http', `
POST /orders
Idempotency-Key: 8f2b1c94-3d47-4a1e-9f60-2b7c5e1a0d33
Content-Type: application/json

{ "items": [...], "total": 4250 }
`),
    p('The key is generated once, when the user takes the action, and reused across every retry of that same attempt. That last part is what people get wrong: a key regenerated on retry is a new operation as far as the server is concerned, which is exactly the behavior you were trying to avoid.'),

    p('Everything else about the mechanism follows from that one property. The server has no way to recognize that two requests represent the same intent — the bodies may be identical for two genuinely separate orders, and identical bodies are not evidence of a duplicate. The client is the only party that knows whether this is a new intent or a repeat of an old one, which is why the naming has to come from there.'),

    h3('Per operation, not per request'),
    p('One key covers one thing the user meant to do. If they click "place order" twice deliberately, that is two operations and two keys — the mechanism is not there to prevent a user ordering twice, only to prevent one intent becoming two records.'),

    h3('The client generates it, always'),
    p('A server-generated key would have to be fetched first, which means a round trip that can itself time out, which is the same problem one level up. A UUID from the client costs nothing and needs no coordination.'),

    h2('What do you store, and when?'),
    p('The key, the request fingerprint, the status, and the response — written before the work starts, updated when it finishes.'),
    code('sql', `
create table idempotency_keys (
  key            text primary key,
  org_id         uuid not null,
  request_hash   text not null,           -- detects a reused key with a different body
  status         text not null,           -- 'in_progress' | 'completed'
  response_code  int,
  response_body  jsonb,
  created_at     timestamptz not null default now()
);
`),
    p('Inserting the row with status `in_progress` before doing anything is what makes concurrent retries safe. Two requests arriving at once both try to insert; the primary key means only one succeeds, and the other knows immediately that the work is already underway.'),
    code('ts', `
try {
  await db.idempotencyKey.create({ data: { key, orgId, requestHash, status: 'in_progress' } });
} catch (e) {
  if (e.code !== 'P2002') throw e;
  return replay(key, requestHash);        // someone got here first
}
`),

    h3('Storing the response is the point'),
    p('A retry should return exactly what the first attempt returned — the same status, the same body, the same created id. Returning a generic "already processed" forces the client to go and look the record up, which it cannot always do, and it makes the retry path behave differently from the original.'),

    h3('Hash the request body'),
    p('The same key with a different body is a client bug, and it should be a loud one. Without the check, a key reused across two genuinely different operations returns the first result for the second request, which is a silently wrong answer rather than an error.'),
    img('key-record', 'A record claimed at the start of work and completed at the end, with the outcome retained', 'Insert before the work, not after. The insert is what makes two simultaneous retries safe.'),

    h2('What happens when a retry arrives mid-flight?'),
    p('It waits, or it is told to wait. What it must not do is proceed.'),
    p('A request that finds an `in_progress` row is looking at an operation that is still running somewhere. Returning a 409 with a `Retry-After` header is the honest answer — nothing has failed, the result is simply not available yet.'),
    ul([
      '**409 Conflict with Retry-After** is the common choice. It is unambiguous and puts the client in control of when to check back.',
      '**Blocking briefly** and returning the result if it appears is friendlier for fast operations and worse for slow ones, since it holds a connection open.',
      '**Never fall through to executing.** This is the failure that undoes the whole mechanism, and it usually arrives as an "optimization" for the case where the in-progress row looks stale.',
    ]),

    img('inflight', 'A second arrival encountering a claim already held, and being told to return later', 'A 409 is the honest answer. Nothing failed — the result simply does not exist yet.'),

    h3('Expire in-progress rows, carefully'),
    p('A process that crashes mid-operation leaves a row that never completes, and every retry after that gets a 409 forever. Some expiry is necessary — but an expiry shorter than the operation\'s worst case will release a key while the original work is still running, which produces exactly the duplicate you were preventing. Set it well above the request timeout, not near it.'),

    h2('Which endpoints need this?'),
    p('The ones where doing the work twice is worse than not doing it at all. That is a smaller set than it first appears.'),
    table('Where keys earn their complexity', [
      ['Operation', 'Needs a key?', 'Why'],
      ['Charge a card, transfer funds', 'Yes', 'Duplicating money is unrecoverable'],
      ['Create an order or booking', 'Yes', 'A second record has real consequences'],
      ['Send an email or message', 'Yes', 'Cannot be unsent'],
      ['Provision an external resource', 'Yes', 'Costs money, needs cleanup'],
      ['Update a record to a given state', 'No', 'Already idempotent by construction'],
      ['Delete by id', 'No', 'Second delete is a no-op'],
      ['Any GET', 'No', 'No side effects'],
    ]),
    p('The two "no" rows in the middle are worth dwelling on, because they show the cheaper alternative. An endpoint that sets values rather than adjusting them is idempotent without any machinery at all — `PUT /subscription { plan: "pro" }` can run five times with the same outcome.'),
    p('Wherever an operation can be expressed that way, do that instead. Idempotency keys are the answer for operations that genuinely create something new, and creating something new is what makes them irreducibly non-idempotent.'),

    p('There is a middle category worth naming: operations that are idempotent in the database and not idempotent in the world. Marking a subscription as cancelled twice changes nothing in Postgres and sends two cancellation emails, because the email is a side effect of the transition rather than of the state. Those need protection even though the data looks safe, and they are easy to miss precisely because the record ends up correct.'),

    h3('A natural key beats a generated one'),
    p('Sometimes the domain already contains a uniqueness constraint that solves this for free. One booking per slot per user, one invoice per subscription period, one referral per pair of accounts — a unique index on those columns makes the second attempt fail cleanly with no key mechanism at all.'),
    p('That is strictly better where it applies: fewer moving parts, no expiry policy, and the constraint documents a real business rule rather than an infrastructure concern.'),
    img('needs-key', 'A set of operations divided by whether repetition changes the outcome', 'Most endpoints do not need this. The ones that create something, spend something or send something do.'),

    h2('How does the client use it correctly?'),
    p('Generate at intent, persist across retries, and clear when the operation resolves.'),
    code('ts', `
// Generated once when the user acts, kept for the life of the attempt.
const key = useRef(crypto.randomUUID());

async function submit() {
  return retry(() => api.post('/orders', payload, {
    headers: { 'Idempotency-Key': key.current },   // same key on every attempt
  }));
}
`),
    p('The mistake is generating the key inside the retry loop, which produces a fresh key per attempt and makes the header decorative. It is an easy mistake because the code looks almost identical either way.'),

    p('It is worth putting the key generation in whatever wraps your API calls rather than leaving it to each call site. A client library that attaches a key automatically for every non-idempotent method, and reuses it across the retries it performs internally, makes the correct behavior the default — and the default is the only version that survives a busy afternoon.'),

    h3('Retry with backoff, and only on the ambiguous cases'),
    p('Retry timeouts, connection failures and 5xx responses. Do not retry a 400 — the request is wrong and will be wrong again. Use exponential backoff with jitter, because synchronized retries from many clients turn a brief blip into a sustained overload.'),

    h3('Survive a reload if the operation matters enough'),
    p('For a checkout, holding the key only in memory means a user who refreshes mid-request loses it and can submit again. Persisting it in session storage against the form state closes that, and it is worth doing exactly where the duplicate would cost money.'),

    h2('What about the side effects inside the operation?'),
    p('This is the part the header does not solve, and it is where a correct-looking implementation still produces two emails.'),
    p('The key protects the endpoint. It does not protect anything the handler did before it crashed. An operation that creates a record, charges a card and sends a receipt, and then fails after the charge, leaves the key row `in_progress` and the card charged — and whatever happens next has to cope with that.'),

    h3('Wrap the whole thing in one transaction where you can'),
    p('If every effect is a database write, put the key row and the work in a single transaction and the problem disappears — both commit or neither does. This is the easy case and it is more common than it sounds, because a great deal of what looks like a multi-system operation is one write plus a queued job.'),

    h3('Order external calls so the unrecoverable one is last'),
    p('Where effects reach outside the database, sequence matters. Do the reversible and cheap things first and the irreversible one last, so a failure partway through leaves the least damage. Charging before creating the record and charging after are the same code with very different incident reports.'),

    h3('Give each external call its own idempotency'),
    p('Most payment and messaging providers accept an idempotency key of their own. Derive it deterministically from yours — `\${key}:charge`, `\${key}:receipt` — and a retry of your operation becomes a retry of theirs, safely, without any coordination.'),
    code('ts', `
// The provider's key is derived, so a retry reaches the same one.
await stripe.paymentIntents.create(params, { idempotencyKey: \`\${key}:charge\` });
await queue.enqueue('receipt', { orderId }, { dedupeKey: \`\${key}:receipt\` });
`),
    p('That derivation is the whole trick, and it composes: one key from the client propagates through every system the operation touches, and each of them independently refuses to do its part twice.'),
    img('effect-chain', 'A sequence of actions where each step carries a derived marker preventing repetition', 'One key from the client, derived per side effect. Each system refuses its own duplicate.'),

    h2('How long do you keep the keys?'),
    p('Twenty-four hours is the common answer and it is a reasonable default, because the window only has to cover realistic retry behavior.'),
    p('A retry arriving three days later is not a retry; it is a new intent, and treating it as a duplicate of something from Tuesday would be its own bug. The table should be pruned on a schedule, which also keeps it from growing without bound on a busy API.'),

    h3('Scope keys to the caller'),
    p('The key is unique per client, not globally. Two customers can generate the same UUID in principle, and more practically two clients might use a sequence-based scheme. Making the primary key the pair of account and key removes the question entirely.'),

    h3('Document the retention window'),
    p('Clients need to know how long a key is honored, because it determines their own retry policy. This belongs in the [API documentation](/blog/rest-api-design) alongside the error codes, and it is the kind of detail whose absence produces an integration that works until it does not.'),
    img('retention', 'A bounded window over a sequence of attempts, with earlier entries falling out of scope', 'The window covers realistic retries. Beyond it, the same key is a new intent rather than a duplicate.'),

    h2('What does this cost, and when is it not worth it?'),
    p('An afternoon for the mechanism, and it is genuinely not worth it on most endpoints.'),
    p('The implementation is a table, a middleware wrapper and a pruning job. The ongoing cost is more subtle: an extra write on every protected request, an expiry policy that has to be right, and a failure mode where a crashed process blocks a key until it expires. That is real complexity and it should be spent where duplicates actually hurt.'),
    p('On an internal tool with ten users on a reliable network, this is over-engineering — the duplicate happens rarely and is fixed by deleting a row. On anything taking payments, sending messages to customers, or serving mobile clients on unreliable connections, it is the difference between an occasional support ticket and an occasional refund.'),
    p('The honest counterweight is that idempotency keys do not make retries free. They make a retried operation safe; they do nothing about a client that retries too aggressively, and a protected endpoint under a retry storm is still an endpoint under a retry storm. Backoff on the client and [a rate limit on the server](/blog/rate-limiting-ai-features) are separate problems that this does not solve.'),
    quote('The key does not prevent duplicates. It makes the second attempt return the first attempt\'s answer, which is a different and much more useful thing.'),

    h2('How do you test it?'),
    p('Three tests, and they take about ten minutes to write.'),
    ol([
      '**Same key twice, sequentially.** The second call returns the first response byte for byte, and exactly one record exists afterwards.',
      '**Same key twice, concurrently.** Fire both without awaiting the first. One completes, the other gets a 409 or the same response, and still exactly one record exists.',
      '**Same key, different body.** Returns an error rather than the first result, because that is a client bug and silence makes it invisible.',
    ]),
    p('A fourth is worth adding once the mechanism is in place: kill the process partway through a protected operation and assert that a retry afterwards either completes the work or reports it cleanly, rather than hanging on a key that will never be released. That is the failure this design is most likely to have, and it is invisible in the other three.'),
    p('The concurrent test is the one that catches a check-then-act implementation, and it is the one most likely to be skipped because writing it takes slightly more thought than the sequential version. It is also the only one that exercises the constraint that makes the whole design work.'),

    h2('Conclusion'),
    p('Accept an `Idempotency-Key` header on every endpoint where repeating the work is worse than not doing it — charging, creating, sending, provisioning. Leave it off everything else, because the mechanism has real cost and most endpoints do not need it.'),
    p('Insert the key row with an `in_progress` status before starting the work, and let the primary key constraint reject the concurrent duplicate. A check followed by a write has a window that two simultaneous retries will find, which is precisely the situation this exists for.'),
    p('Store the full response and replay it byte for byte. A retry that returns a generic "already handled" behaves differently from the original call and pushes the client into a lookup it may not be able to perform.'),
    p('Hash the request body so a reused key with different contents is a loud error rather than a silently wrong answer, scope keys per account, and prune after about a day — a retry three days later is a new intent, not a duplicate.'),
    p('Before building any of it, check whether the operation can simply be made idempotent instead. An endpoint that sets a state rather than creating a record needs none of this, and a natural uniqueness constraint in the domain — one booking per slot, one invoice per period — is better than a generated key because it also documents a real rule. If you have an endpoint where a duplicate would cost real money and want the retry path reviewed, [get in touch](/start).'),
  ),
  faqs: faq([
    ['What is an idempotency key?',
     'A unique value the client generates per logical operation and sends as a header. The server stores it alongside the result, so a retry with the same key returns the original response instead of doing the work again. It turns an ambiguous timeout into a safe retry.'],
    ['Which endpoints need idempotency keys?',
     'Ones where doing the work twice is worse than not doing it: charging a card, creating an order, sending a message, provisioning a paid resource. Endpoints that set a value rather than creating a record are already idempotent, and deletes by id are no-ops the second time.'],
    ['Should the client or the server generate the key?',
     'The client, always. A server-generated key requires fetching it first, and that request can itself time out — the same problem one level up. A UUID generated when the user takes the action costs nothing and needs no coordination between the two sides.'],
    ['How long should idempotency keys be retained?',
     'Around twenty-four hours covers realistic retry behavior. A request arriving days later with the same key is a new intent rather than a retry, and treating it as a duplicate would be its own bug. Prune on a schedule and document the window so clients can set their retry policy.'],
  ]),
};
