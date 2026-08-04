import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/stripe-webhooks-idempotency/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-stripe-webhooks-idempotency',
  slug: 'stripe-webhooks-idempotency',
  title: 'Stripe Webhooks That Do Not Double-Charge',
  category: 'backend',
  order: 47,
  readTime: '13 min read',
  date: 'September 2026',
  publishedAt: '2026-09-01',
  series: 'B2B',
  excerpt:
    'Stripe sends the same event twice, out of order, and to an endpoint that timed out. The handler shape that survives all three without granting twice.',
  coverLabel: 'Stripe webhooks and idempotency — cover',
  body: body(
    p('The first billing bug on a subscription product is almost never a failed payment. It is a customer who got two months of credit for one payment, or an account that stayed active for six weeks after cancelling, and in both cases the webhook handler ran exactly as written.'),
    p('Stripe guarantees at-least-once delivery. That phrase is doing a lot of work: it means the same event will sometimes arrive twice, occasionally arrive out of order, and reliably be retried if your endpoint is slow. A handler written as though each event arrives once, in order, is a handler that will eventually grant something twice.'),
    p('This is the shape I use on every product with billing in it — the [auth and billing setup](/blog/auth-billing-onboarding-mvp) that goes into the B2B template, with the delivery guarantees taken seriously rather than assumed away.'),

    h2('Why do webhooks arrive more than once?'),
    p('Because the alternative is worse. A delivery system that guarantees exactly-once has to solve the case where it sent the event, your server processed it, and the acknowledgement was lost in transit — and it cannot distinguish that from the case where you never received it at all.'),
    p('Faced with that ambiguity, there are two options. Retry and risk a duplicate, or do not retry and risk a permanent loss. Stripe chose retry, which is the right choice for billing, and it moved the deduplication problem to your side of the wire.'),
    table('Three delivery behaviors to design for', [
      ['Behavior', 'Cause', 'What it breaks'],
      ['Same event twice', 'Retry after a lost or slow acknowledgement', 'Anything that adds rather than sets'],
      ['Events out of order', 'Independent retry schedules per event', 'State machines that assume sequence'],
      ['Event before your API call returns', 'Webhook races the API response', 'Handlers that expect a local record to exist'],
    ]),
    p('The third row is the one that catches people off guard. Stripe can deliver `checkout.session.completed` before your own `stripe.checkout.sessions.create` call has finished returning to your server, so a handler that looks up a local record created just after that call will find nothing. It is not a race you can win by being faster; it is one you design around.'),
    img('at-least-once', 'A message path branching into two identical arrivals at a single endpoint', 'The duplicate is not a bug in Stripe. It is the price of never silently losing a payment event.'),

    h2('What does the duplicate actually cost?'),
    p('It depends entirely on whether your handler adds or sets, and this is the single most useful distinction in the whole topic.'),
    code('ts', `
// Runs twice, grants twice. The bug.
await db.account.update({
  where: { id }, data: { credits: { increment: 500 } },
});

// Runs twice, same result. Not a bug.
await db.account.update({
  where: { id }, data: { plan: 'pro', currentPeriodEnd: period.end },
});
`),
    p('The second version is idempotent by construction: applying it twice produces the same state as applying it once. Wherever you can express the change as "set this to the value implied by the event" rather than "adjust this by an amount", you have removed the problem rather than guarded against it.'),
    p('Not everything can be written that way. Sending a receipt email, incrementing a usage counter, provisioning a resource with a new identifier — these genuinely happen a second time if the handler runs a second time. Those are the ones that need an explicit ledger, and they are a minority of the code.'),

    h3('Sort your handlers into the two piles first'),
    p('Before writing any deduplication, go through each event you handle and label it. Most subscription handling is naturally set-shaped, because the event carries the full subscription object and you are mirroring it. The add-shaped handlers are usually emails, credits and anything that calls a third party.'),
    p('That triage is worth doing explicitly because it tells you where to spend effort. Guarding a handler that was already idempotent adds a table write and no safety; leaving one unguarded that increments a balance is the bug you will be explaining to a customer.'),

    h2('How do you deduplicate properly?'),
    p('A table with a unique constraint on the event id, written inside the same transaction as the work. Not a cache, and not a check-then-act.'),
    p('The version everyone writes first checks whether the event has been seen and returns early if so. It is right most of the time and wrong exactly when it matters, because two retries arriving concurrently both pass the check before either writes.'),
    code('ts', `
// Wrong: two concurrent deliveries both see "not processed" and both proceed.
if (await db.webhookEvent.findUnique({ where: { id: event.id } })) return;
await handle(event);
await db.webhookEvent.create({ data: { id: event.id } });

// Right: the database decides, and only one insert can win.
try {
  await db.$transaction(async (tx) => {
    await tx.webhookEvent.create({ data: { id: event.id, type: event.type } });
    await handle(event, tx);
  });
} catch (e) {
  if (e.code === 'P2002') return;   // unique violation — already handled
  throw e;
}
`),
    p('The transaction is what makes this correct. The insert and the work either both commit or both roll back, so there is no window where the event is marked processed but the work failed, and none where the work succeeded but a crash lost the marker.'),
    p('A concurrent duplicate hits the unique constraint and returns cleanly, which is exactly the behavior you want — the second delivery is not an error, it is a no-op, and treating it as an error means alerting on normal operation.'),

    h3('Why not Redis'),
    p('Because a cache can evict, and the eviction is silent. A `SETNX` with a TTL works until memory pressure drops the key or the instance restarts, at which point a retry arriving after the eviction is processed as new. For billing, the deduplication record should have the same durability as the thing it is protecting.'),

    h3('Prune the table, do not let it grow forever'),
    p('Stripe retries for up to three days. A row older than a week is dead weight, and on a busy account the table will otherwise outgrow the data it protects. A daily delete of rows past the retry window keeps it small and costs nothing.'),
    img('unique-constraint', 'Two identical items arriving at a single-slot receptacle, one accepted and one deflected', 'The database decides, not the application. A check followed by a write has a window; a unique constraint does not.')  ,

    h2('How do you connect the Stripe customer to your account?'),
    p('This is the mapping everything else depends on, and it is the one most often built as a lookup by email.'),
    p('Email is the wrong key. People change it, use a different address in checkout than in your app, and occasionally share one across two accounts. A subscription attached to the wrong account because two records shared an address is a bug that is discovered by the customer whose access disappeared.'),
    code('ts', `
// Create the checkout session with your own identifiers attached.
const session = await stripe.checkout.sessions.create({
  customer: account.stripeCustomerId ?? undefined,
  client_reference_id: account.id,
  subscription_data: { metadata: { accountId: account.id, orgId: account.orgId } },
  // ...
});
`),
    p('Put your identifier on the Stripe object at creation and every later event carries it back to you. The handler then reads `metadata.accountId` rather than searching for a match, which is both faster and incapable of matching the wrong record.'),
    p('Store the Stripe customer id on the account the first time you see it and reuse it forever. Creating a new customer per checkout produces duplicates in the Stripe dashboard, splits a customer\'s billing history across records, and makes the customer portal show only part of it.'),

    h3('Handle the event arriving before your record exists'),
    p('The race mentioned earlier is real: the webhook can land before the row it refers to has been committed on your side. Do not treat that as an error and do not retry in a loop. Either create the checkout session only after the local record is committed, or let the handler fail cleanly and rely on the queue\'s retry — a second attempt thirty seconds later will find it.'),
    img('customer-map', 'Two identifier fields linked by an explicit reference rather than by a matched attribute', 'Attach your own id at creation. Matching on email works until two records share one.'),

    h2('Why does the signature check have to come first?'),
    p('Because without it the endpoint is an unauthenticated API that grants subscriptions, and the payload is entirely under the caller\'s control.'),
    p('This is not theoretical. A webhook URL is discoverable, the event shape is public and documented, and a `POST` with a plausible `customer.subscription.updated` body is not difficult to construct. The signature is the only thing distinguishing a real event from a forged one.'),
    code('ts', `
// The raw body is required — a parsed and re-serialized object will not verify.
export const config = { api: { bodyParser: false } };

const event = stripe.webhooks.constructEvent(
  await rawBody(req),
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET,
);
`),
    p('The raw-body requirement is where most integrations go wrong, and the failure is confusing: the signature check fails for reasons that have nothing to do with the signature. JSON parse-and-restringify changes key order and whitespace, so the bytes no longer match what was signed, and the resulting error says only that verification failed.'),

    h3('The framework will parse it for you unless you stop it'),
    p('Every framework has its own way of opting out — the config export above in a Next.js API route, `express.raw({ type: \'application/json\' })` mounted before the JSON parser in Express, a request clone in an app-router route handler. Get this wrong and the endpoint works perfectly in every test that skips verification and fails on every real event.'),

    h3('Each endpoint has its own secret'),
    p('The signing secret is per endpoint, not per account, so the local CLI listener and the deployed endpoint have different ones. Sharing a `.env` between them produces failures that look intermittent and are actually deterministic per environment.'),

    h3('Verification happens before anything else'),
    p('Not after logging the payload, not after looking up the customer. An unverified payload should not reach any code that reads its fields, because at that point it is untrusted input from the internet that happens to be shaped like a Stripe event.'),
    img('signature-first', 'A sealed envelope being checked at a gate before its contents are read', 'The check is the front door. Everything past it is trusted, so nothing untrusted may get past it.'),

    h2('Why does the handler need to return quickly?'),
    p('Because Stripe times out at around twenty seconds and treats a timeout as a failure, which means a retry — of a handler that may have already done the work.'),
    p('A handler that verifies, records and acknowledges takes a few milliseconds. A handler that also sends an email, calls a third-party API and regenerates a PDF takes as long as the slowest of those, and one of them is eventually slow.'),
    code('ts', `
// Fast path: verify, record, acknowledge. Everything else is queued.
const event = stripe.webhooks.constructEvent(raw, sig, secret);
await db.webhookEvent.create({ data: { id: event.id, type: event.type, payload: event } });
res.status(200).end();                  // acknowledged in milliseconds
await queue.enqueue('stripe-event', { id: event.id });
`),
    p('This splits the reliability problem in two. Delivery becomes a fast, near-certain write. Processing becomes a job with its own retries, its own error handling and no external timeout — and a failure in the slow part no longer causes Stripe to resend the whole event.'),
    p('It also gives you replay for free. The stored payload means a handler bug can be fixed and the affected events reprocessed from your own database, without asking Stripe to resend anything or reconstructing state by hand. That is worth the extra table on its own.'),

    h3('When the queue is not worth it'),
    p('If every handler is a single database write, this is over-engineering. Handle inline, keep it fast, and add the queue when the first slow thing appears. What matters is noticing the moment a handler starts calling out to something, because that is when the timeout stops being theoretical — the same reasoning as [background jobs generally](/blog/ai-cost-logging), where the trigger is the first call you do not control.'),

    h2('How do you handle events arriving out of order?'),
    p('By ignoring stale ones rather than by trying to reorder them.'),
    p('Each event carries a `created` timestamp and, for subscriptions, the object carries its own version markers. If you store the timestamp of the last event applied to a record, an arriving event older than that can be discarded — its information is already superseded.'),
    code('ts', `
// Applies only if this event is newer than whatever last touched the record.
const { count } = await db.subscription.updateMany({
  where: { id, lastEventAt: { lt: new Date(event.created * 1000) } },
  data: { status: sub.status, currentPeriodEnd: end, lastEventAt: new Date(event.created * 1000) },
});
`),
    p('Using `updateMany` with the condition in the `where` rather than reading, comparing and writing keeps the whole thing atomic. A read-compare-write has the same race as the check-then-act deduplication, and it fails the same way under concurrent delivery.'),

    h3('The safest handler ignores the payload'),
    p('For subscription state specifically, the most robust handler treats the event as a signal rather than as data. Receive the event, fetch the subscription from the API, write what the API says. The API is always current; the event is a snapshot of some moment that may no longer be true.'),
    p('It costs an extra round trip per event and it makes ordering almost irrelevant, because whichever event you process last, you end up writing the same current truth. On billing state, that trade is nearly always worth taking.'),
    img('out-of-order', 'Two timestamped items arriving in reverse sequence, the older one being set aside', 'Do not reorder. Compare timestamps, discard the stale one, and let the newest write win.'),

    h2('Which events actually matter?'),
    p('Far fewer than the list suggests. Subscribing to everything produces a handler full of empty branches and a dashboard full of noise.'),
    table('The subscription events worth handling', [
      ['Event', 'What it means', 'What to do'],
      ['checkout.session.completed', 'Checkout finished', 'Link customer to account'],
      ['customer.subscription.created', 'Subscription exists', 'Set plan and period'],
      ['customer.subscription.updated', 'Plan, status or period changed', 'Mirror current state'],
      ['customer.subscription.deleted', 'Subscription ended', 'Downgrade at period end'],
      ['invoice.payment_failed', 'Charge did not go through', 'Notify, start dunning'],
      ['invoice.payment_succeeded', 'Recurring charge cleared', 'Extend period, send receipt'],
    ]),
    p('Six events covers the majority of subscription products. Add more only when a specific behavior needs them, and delete any subscription you are not acting on — an event you receive and ignore is a line in the logs that makes real problems harder to see.'),

    h3('Do not provision on checkout completion alone'),
    p('A completed checkout session means the customer finished the flow, not that money moved. For some payment methods the charge settles later and can still fail. Granting access on `checkout.session.completed` and again on `invoice.payment_succeeded` is both a duplicate grant and, occasionally, a grant for a payment that never cleared.'),

    h3('Cancellation is usually not immediate'),
    p('A subscription cancelled mid-period should keep working until the period ends. `customer.subscription.deleted` at the moment of cancellation with immediate downgrade takes away access the customer has paid for, which generates a support ticket every single time.'),

    h2('How do you test a webhook handler?'),
    p('With the CLI for the shape and with your own fixtures for the behavior, and the second is where the value is.'),

    h3('The CLI for the integration'),
    p('`stripe listen --forward-to localhost:3000/api/webhooks` gives you real signed events against real API behavior, and `stripe trigger` produces specific ones. This proves the plumbing — raw body, secret, parsing — and it proves it in the environment where the plumbing usually breaks.'),

    h3('Stored fixtures for the logic'),
    p('Save real event payloads as JSON and run the handler against them directly in the test suite. This is fast, deterministic, runs [in CI](/blog/ci-pipeline-typecheck-tests), and lets you assert on the cases that are hard to trigger on demand — a failed payment, a downgrade, a subscription that ends mid-cycle.'),

    h3('Test the duplicate explicitly'),
    p('The single most valuable test in the file is the one that calls the handler twice with the same event and asserts the state is identical afterwards. It takes four lines and it is the direct test of the property the whole design exists to guarantee.'),
    code('ts', `
it('is idempotent', async () => {
  await handle(fixture('invoice.payment_succeeded'));
  const first = await db.account.findUnique({ where: { id } });
  await handle(fixture('invoice.payment_succeeded'));
  expect(await db.account.findUnique({ where: { id } })).toEqual(first);
});
`),
    img('replay-test', 'The same input applied twice to a system, with an unchanged output state', 'Four lines, and it tests the exact property the whole design exists to provide.'),

    img('event-shortlist', 'Six selected items drawn from a much longer list, the remainder faded', 'Six events covers most subscription products. Every extra subscription is noise in the log you will read during an incident.'),

    h2('What do you do when a handler fails in production?'),
    p('Look at the stored payload, fix the code, replay from your own table. That sequence only works if you stored the payload, which is the argument for doing it from the first version.'),
    ol([
      '**Find the failed events.** The Stripe dashboard lists delivery attempts and responses, and your own table lists the ones that were received but threw.',
      '**Reproduce locally** against the stored payload. A real failing event is a better test case than anything you would have invented.',
      '**Fix and deploy,** then replay the affected events from your table rather than asking Stripe to resend — you control the ordering and can do it in batches.',
      '**Reconcile the state** for accounts touched by the bug. This is the part people skip, and it is the part customers notice.',
    ]),
    p('The reconciliation step deserves its own note. Webhook bugs leave accounts in states that no future event will correct, because Stripe has already sent everything it is going to send. A short script that compares your subscription table against the Stripe API and reports mismatches is the only reliable way to find them — and it is worth running on a schedule, not only after an incident.'),
    quote('The webhook table is not overhead. It is the difference between fixing a billing bug from your own database and reconstructing three days of subscription state by hand.'),

    h2('Conclusion'),
    p('Verify the signature against the raw body before touching anything else, and make sure the framework is not parsing it out from under you — that failure mode is silent in tests and total in production.'),
    p('Deduplicate with a unique constraint on the event id inside the same transaction as the work, not with a check-then-act and not with a cache. Two concurrent retries should collide in the database, where only one can win, rather than in the application, where both can.'),
    p('Write handlers that set rather than add wherever the event allows it, so most of them are idempotent by construction and the ledger only has to protect the genuine minority — emails, counters and calls to systems you do not control.'),
    p('Acknowledge fast and process in a job once anything slow appears, store every payload so a handler bug can be fixed and replayed from your own database, and discard events older than the last one applied instead of trying to reorder them. For subscription state specifically, treat the event as a signal and fetch the current object from the API — it costs a round trip and makes ordering stop mattering.'),
    p('Then write the test that runs the handler twice and asserts nothing changed the second time. It is four lines, and it is the only direct evidence that any of the above is working. If you are adding billing to something already live and want the guards reviewed before real money moves through it, [that is a short conversation](/start).'),
  ),
  faqs: faq([
    ['Why does Stripe send the same webhook twice?',
     'Stripe guarantees at-least-once delivery, so a lost or slow acknowledgement causes a retry even though your server processed the event. The alternative — not retrying — risks losing a payment event permanently, which is worse. Deduplication is deliberately left to the receiving side.'],
    ['How do you make a Stripe webhook handler idempotent?',
     'Insert the event id into a table with a unique constraint inside the same transaction as the work. A duplicate hits the constraint and returns as a no-op. A check-then-act has a window where two concurrent retries both pass the check before either writes.'],
    ['Why does webhook signature verification keep failing?',
     'Almost always because the framework parsed the body before verification ran. The signature covers the exact bytes Stripe sent, and parsing then re-serializing changes them. Disable the body parser on that route, and check you are using the signing secret for that specific endpoint.'],
    ['Should webhook handlers run inline or in a background job?',
     'Inline while every handler is a single database write. Move to a queue as soon as one calls an email service, a third party or anything else you do not control, because Stripe times out around twenty seconds and treats a timeout as a failure worth retrying.'],
  ]),
};
