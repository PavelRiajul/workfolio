import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/background-job-queues/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-background-job-queues',
  slug: 'background-job-queues',
  title: 'Background Jobs: Which Queue, and When You Need One',
  category: 'backend',
  order: 57,
  readTime: '13 min read',
  date: 'March 2026',
  publishedAt: '2026-03-03',
  series: 'Foundations',
  excerpt:
    'Postgres table, Redis queue or hosted service — and the four properties that decide which one, starting with whether you need a queue at all.',
  coverLabel: 'Background job queues — cover',
  body: body(
    p('Every project reaches a point where something takes too long to do inside a request. Sending an email, generating a PDF, calling a model, processing an upload. The request that used to take 80ms now takes four seconds, and the user is watching a spinner while your server waits on somebody else\'s API.'),
    p('The answer is to do it afterwards. The question is what "afterwards" is built on, and the available answers range from a table with six columns to a distributed system with its own operational burden.'),
    p('This is a decision I make on most builds, and the honest starting position is that a lot of projects reach for the heavy option too early. Here is how I choose, and the cases where the right answer is not a queue at all.'),

    h2('Do you actually need a queue?'),
    p('Three questions. If all three answers are no, you are adding infrastructure to solve a problem you do not have.'),
    ol([
      '**Does the work make the request slow enough to notice?** Under a couple of hundred milliseconds, inline is fine and simpler.',
      '**Does it call something you do not control?** Any third-party API can be slow or down, and inline it takes your endpoint with it.',
      '**Must it survive a crash?** If losing the work would be a real problem, it needs to be durable somewhere before the request returns.',
    ]),
    p('A yes to any of these means the work should leave the request. A yes to the third specifically rules out the tempting shortcut of a fire-and-forget promise, because an unawaited async call is not a queue — it is work that vanishes when the process restarts, and on a serverless platform it may be killed the moment the response is sent.'),
    img('three-questions', 'Three sequential checks determining whether work should leave a request path', 'Slow, external, or must-not-be-lost. One yes is enough; no yeses means inline is the right answer.'),

    h2('What are the four real options?'),
    p('They differ in operational cost far more than in capability, and for most projects the capability difference is irrelevant.'),
    table('Four ways to run work later', [
      ['Option', 'New infrastructure', 'Good for', 'Main weakness'],
      ['A table in your database', 'None', 'Most projects', 'Polling, and no fan-out'],
      ['Redis-backed queue (BullMQ)', 'Redis', 'High volume, scheduling, priorities', 'Redis durability settings matter'],
      ['Hosted queue (Cloudflare Queues, SQS)', 'A managed service', 'Serverless, spiky load', 'Vendor-shaped, harder locally'],
      ['Platform cron or worker', 'None beyond hosting', 'Periodic and batch work', 'Not for per-event jobs'],
    ]),
    p('The first row is the one people skip and it is usually right. If you already have Postgres, a jobs table gives you durability, transactional enqueue and visibility with no new service to run, monitor, secure or pay for.'),

    h3('The transactional enqueue argument'),
    p('This is the strongest reason to keep jobs in your main database and it is easy to miss. A job enqueued in the same transaction as the record it refers to either both commits or neither does. With an external queue, you can commit the record and fail to enqueue — or enqueue and fail to commit, so the worker looks for a row that does not exist.'),
    code('ts', `
// One transaction. The order and the job that emails about it commit together.
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data });
  await tx.job.create({ data: { kind: 'order.confirm', payload: { id: order.id } } });
});
`),
    p('With an external queue the equivalent needs an outbox — a table row written transactionally, then relayed to the queue by a separate process. That works and it is more machinery, which is the point: you end up with a table anyway.'),

    h2('What does the table version look like?'),
    p('Six columns and one clever query, and it handles more load than most projects will ever produce.'),
    code('sql', `
create table jobs (
  id           bigserial primary key,
  kind         text not null,
  payload      jsonb not null,
  run_at       timestamptz not null default now(),
  attempts     int not null default 0,
  locked_until timestamptz
);
create index jobs_ready_idx on jobs (run_at) where locked_until is null;
`),
    code('sql', `
-- The claim. SKIP LOCKED is what lets many workers poll the same table
-- without blocking each other or handing the same row to two of them.
update jobs set locked_until = now() + interval '5 minutes', attempts = attempts + 1
where id = (
  select id from jobs
  where run_at <= now() and (locked_until is null or locked_until < now())
  order by run_at limit 1
  for update skip locked
)
returning *;
`),
    p('`FOR UPDATE SKIP LOCKED` is the entire trick. Without it, ten workers polling the same table serialize behind each other; with it, each grabs a different row and they scale linearly. It has been in Postgres since 9.5 and it makes the naive implementation genuinely good.'),

    h3('The lease, not a boolean'),
    p('`locked_until` is a timestamp rather than a `claimed` flag on purpose. A worker that crashes mid-job leaves a lease that expires, and the job becomes available again automatically. A boolean flag left set by a dead process requires manual intervention or a reaper.'),

    p('Deleting completed jobs rather than marking them done keeps the table small and the index tight. If you want history, write a row to a separate log table on completion — the working queue should only ever contain work that has not happened yet.'),

    h3('Polling is fine, and the interval matters less than you think'),
    p('A one-second poll on an indexed query is a trivial load, and for most work a one-second delay is invisible. Where it genuinely is not, Postgres `LISTEN/NOTIFY` gives you a push signal — but reach for it after measuring, because it adds a connection concern that polling does not have.'),
    img('claim-query', 'Multiple readers each taking a distinct item from a shared pool without contending', 'SKIP LOCKED is what turns a table into a queue. Without it, workers queue behind each other rather than working in parallel.'),

    h2('When does Redis become worth it?'),
    p('At volume, and when you want scheduling features you would otherwise write yourself.'),
    p('BullMQ gives you delayed jobs, repeatable jobs, priorities, rate limits per queue, parent-child dependencies and a usable dashboard. Every one of those can be built on a table, and by the time you have built four of them you have written a worse BullMQ.'),
    ul([
      '**Thousands of jobs a minute** where the polling query starts to be a real load on your primary database.',
      '**Priority matters** — a password reset must not wait behind a thousand queued report generations.',
      '**Complex scheduling** such as retry with backoff, delayed re-enqueue, or jobs that depend on other jobs completing.',
      '**You want the dashboard.** Being able to see, retry and drain jobs without writing an admin UI is worth more than it sounds at 2am.',
    ]),

    img('when-redis', 'A threshold beyond which a simple mechanism is replaced by a purpose-built one', 'Four features you would otherwise build. By the time you have built the fourth, you have written a worse version of this.'),

    h3('Redis durability is a decision, not a default'),
    p('Redis is a memory-first store. Depending on how it is configured, a crash can lose the last second or the last minute of writes. For a thumbnail job that is fine; for a payment reconciliation job it is not. Check the persistence settings on your managed instance rather than assuming, and use the outbox pattern for anything where losing a job matters.'),

    h3('It is another thing to run'),
    p('A managed Redis is another service, another credential, another dependency in the health check, and another failure mode where your API is up and nothing is being processed. That is a genuine cost and it is the reason not to start here.'),

    h2('What about serverless?'),
    p('It changes the answer, because there is no long-running process to poll and no guarantee the container survives the response.'),
    p('On a serverless platform, work started after the response has been sent may simply not execute — the runtime is entitled to freeze or discard the container immediately. A jobs table with no worker to poll it is a table of things that never happen.'),
    ol([
      '**A hosted queue** — Cloudflare Queues, SQS — where the platform invokes your handler per message. This is the natural fit and it is what I use on Workers.',
      '**A scheduled function** that drains the table on a cron trigger. Simple, and the latency floor is the cron interval.',
      '**A long-running worker elsewhere**, on [Render or a similar platform](/blog/render-background-jobs), polling the same database your serverless functions write to. Best of both, at the cost of a second deployment target.',
    ]),
    p('The third is what I do most often on hybrid stacks: the site is static or serverless, and one small always-on worker handles jobs. It keeps the transactional enqueue and gives you a real process to run them.'),
    img('serverless-gap', 'Work handed off at the moment a short-lived process ends, with and without a durable intermediary', 'On serverless there is no process left to do the work. Something durable has to hold it and something else has to be invoked.'),

    h2('What must every job handler do?'),
    p('Four things, and jobs that skip them are where the operational pain comes from.'),

    h3('Be idempotent'),
    p('A job will run twice. A worker that crashes after doing the work but before marking it complete leaves the lease to expire, and the job is picked up again — correctly, because from the queue\'s side it never finished. Every handler must tolerate that, which is [the same discipline as an idempotent endpoint](/blog/idempotency-keys) applied to work rather than to requests.'),

    p('The cheapest way to get there is usually to make the handler check state rather than assume it. A job that sends a welcome email should first look at whether one has been recorded as sent, not because the queue is unreliable but because it is exactly reliable enough to deliver the same job twice. That check is one query and it converts a duplicate delivery from an incident into a no-op.'),

    h3('Carry its own context'),
    p('The payload should contain the tenant id, not just a record id. A worker constructing a database client scoped to the job\'s organization is the same protection the request path has; a worker using an unscoped client has quietly opted out of it, and background jobs are exactly where that gets missed.'),

    h3('Be bounded in time'),
    p('A job with no timeout can hang forever holding a lease that keeps being renewed, or worse, never renewed while the work continues. Set a timeout shorter than the lease, and make the failure explicit.'),

    h3('Fail into a dead-letter place'),
    p('After N attempts a job should stop retrying and land somewhere visible. A job that retries forever consumes a worker slot permanently and will eventually consume all of them; a job that is silently dropped after five attempts is work the user asked for that never happened and nobody knows.'),
    code('ts', `
if (job.attempts >= MAX_ATTEMPTS) {
  await db.deadJob.create({ data: { ...job, error: String(err) } });
  await db.job.delete({ where: { id: job.id } });
  captureException(err, { tags: { kind: job.kind } });   // and tell someone
  return;
}
`),

    h2('How do you retry without making things worse?'),
    p('Exponential backoff with jitter, and a hard distinction between failures that are worth retrying and failures that are not.'),
    p('A job failing because a third-party API is down should retry in a minute, then four, then sixteen. A job failing because the payload references a deleted record should not retry at all — it will fail identically every time, and each attempt costs a worker slot.'),
    code('ts', `
// Separate the two, or permanent failures burn the retry budget.
class PermanentError extends Error {}

const delay = Math.min(2 ** attempts * 1000, MAX_DELAY) * (0.5 + Math.random());
`),
    p('The jitter is not decoration. Without it, a hundred jobs failing at the same moment because a dependency went down all retry at exactly the same moment, which is a synchronized thundering herd hitting a service that is already unwell.'),

    p('Deciding which failures are permanent is a judgement you make per handler rather than globally. A 404 from a third party is permanent if it means the resource was deleted and transient if it means their index has not caught up yet — and only the person writing that handler knows which. Defaulting to transient is the safer error, since a permanent failure retried five times is wasteful and a transient failure dropped immediately is lost work.'),

    h3('Cap the concurrency per tenant'),
    p('One customer\'s bulk import should not occupy every worker. A concurrency limit keyed on the organization keeps a single heavy tenant from becoming everybody\'s outage — the same noisy-neighbour reasoning that applies [inside the database](/blog/multi-tenant-prisma-postgres).'),
    img('backoff', 'Repeated attempts spaced at growing and slightly irregular intervals', 'Growing intervals, deliberately uneven. Synchronized retries are how a brief outage becomes a sustained one.'),

    h2('How do you deploy a worker safely?'),
    p('The part nobody writes about, and the part that causes a bad afternoon the first time a deploy lands mid-job.'),

    h3('Handle the shutdown signal'),
    p('A deploy sends the process a termination signal. A worker that ignores it is killed mid-job, leaving a lease to expire and the work half-done. Catching the signal, finishing the current job, declining to claim another and then exiting turns a rough edge into a clean handover — and it is about fifteen lines.'),
    code('ts', `
let draining = false;
process.on('SIGTERM', () => { draining = true; });

while (!draining) {
  const job = await claim();
  if (!job) { await sleep(1000); continue; }
  await run(job);
}
process.exit(0);
`),

    h3('Old and new workers run together, briefly'),
    p('During a rolling deploy both versions are claiming from the same queue. That means a job enqueued by new code may be picked up by an old worker that does not know that job kind — so an unknown kind must be left alone rather than failed, or the first deploy of any new job type dead-letters a batch of perfectly good work.'),

    h3('Payloads are a contract'),
    p('A job sitting in the queue was serialized by the previous version. Changing the payload shape and deploying means the worker deserializes something it does not expect, which is the same versioning problem as [a public API](/blog/rest-api-design) with a shorter feedback loop. Add fields, never rename them, and tolerate missing ones.'),

    h3('Keep the worker deployable on its own'),
    p('If shipping a copy change to the website requires restarting the workers, every deploy interrupts in-flight jobs for no reason. Separate deployment targets from the same repository is the arrangement that avoids it, and it costs one extra service definition.'),
    img('worker-deploy', 'Two process generations overlapping briefly while drawing from a shared pool of pending work', 'Both versions claim from the same queue during a rollout. An unknown job kind must be left, not failed.'),

    h2('How do you know it is working?'),
    p('Three numbers, on a dashboard, with an alert on the first.'),
    table('What to measure', [
      ['Metric', 'What it tells you', 'Alert when'],
      ['Queue depth', 'Whether workers keep up', 'Rising for more than a few minutes'],
      ['Oldest pending job age', 'Whether anything is stuck', 'Older than the expected latency'],
      ['Failure rate by kind', 'Which handler is broken', 'A kind starts failing at all'],
    ]),
    p('There is a fourth number worth having even though it rarely needs an alert: jobs processed per minute, by kind. It is the one that tells you whether a rising queue depth is a traffic spike or a worker that has slowed down, and those have completely different responses — one is fine and self-correcting, the other is a problem that grows.'),
    p('Queue depth alone is misleading — a depth of zero with a stuck worker looks identical to a depth of zero with everything healthy. The oldest-job age is the number that distinguishes them, and it is the one I alert on first.'),
    p('This belongs with the rest of the [error tracking and uptime setup](/blog/uptime-vs-error-tracking), because a silently stopped worker is exactly the kind of failure where nothing is down and nothing works. The API responds, the site loads, and no emails have been sent since Tuesday.'),

    h2('What does this cost to build?'),
    p('The table version is a few hours. The Redis version is a day including the deployment. Both are cheaper than the incident where jobs stopped and nobody noticed for a week.'),
    p('For the table version: the schema, the claim query, a worker loop, retry with backoff, a dead-letter table and the two alerts. That is genuinely half a day and it has no new infrastructure in it.'),
    p('The honest counterweight is that a jobs table is not free forever. Past a few hundred thousand jobs a day the polling and the churn become real load on the database that also serves your users, and the answer at that point is a purpose-built queue. But that is a good problem to have and the migration is straightforward, because the handler code does not change — only what hands it work.'),
    quote('Start with a table. You will know when it stops being enough, and until then you have one fewer service to keep alive.'),

    h2('Conclusion'),
    p('First check whether you need a queue at all. Work that is fast, internal and safe to lose belongs inline, and adding infrastructure for it makes the system harder to reason about with nothing gained.'),
    p('When you do need one, start with a table in the database you already have. `FOR UPDATE SKIP LOCKED` makes it genuinely concurrent, a lease timestamp rather than a boolean makes crashed workers self-healing, and enqueueing inside the same transaction as the work removes the entire class of bug where the record exists and the job does not.'),
    p('Move to Redis or a hosted queue when volume, priorities or scheduling justify it — not before. Each is another service to run, another credential and another way for the API to be up while nothing is being processed.'),
    p('On serverless, the calculus changes: there is no process left after the response, so either the platform invokes a handler per message, a cron drains the table, or one small always-on worker polls the database your functions write to. The last is what I use most.'),
    p('Whatever holds the jobs, every handler must be idempotent, carry its tenant in the payload, have a timeout shorter than its lease, and fail into a dead-letter table that somebody is alerted about. Then watch the age of the oldest pending job — not just the depth — because a stuck worker and an empty queue look identical until you measure the right thing. If you want a second opinion on whether your background work needs more than a table, [get in touch](/start).'),
  ),
  faqs: faq([
    ['Do I need Redis for background jobs?',
     'Usually not to begin with. A table in the database you already have, claimed with FOR UPDATE SKIP LOCKED, gives durability, transactional enqueue and concurrency with no new service. Move to Redis when volume, job priorities or complex scheduling genuinely justify another dependency.'],
    ['Why enqueue jobs in the same transaction as the work?',
     'So they cannot disagree. With an external queue you can commit the record and fail to enqueue, or enqueue and fail to commit so the worker looks for a row that does not exist. A jobs table in the same database makes both impossible without any extra machinery.'],
    ['How do background jobs work on serverless platforms?',
     'They need something outside the request. A hosted queue that invokes your handler per message, a scheduled function draining a table, or a small always-on worker polling the same database. Work started after the response may never run — the container can be frozen immediately.'],
    ['What should happen when a job keeps failing?',
     'Retry with exponential backoff and jitter for transient failures, do not retry at all for permanent ones, and after a fixed number of attempts move the job to a dead-letter table and raise it in error tracking. A job retrying forever eventually occupies every worker slot.'],
  ]),
};
