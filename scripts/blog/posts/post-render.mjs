import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/render-background-jobs/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-render-background-jobs',
  slug: 'render-background-jobs',
  title: 'Running Background Workers and Cron Jobs on Render',
  category: 'backend',
  order: 58,
  readTime: '12 min read',
  date: 'March 2026',
  publishedAt: '2026-03-05',
  series: 'Foundations',
  excerpt:
    'Background workers, cron jobs and the free-tier spin-down that quietly stops them — the practical setup for the always-on half of a serverless stack.',
  coverLabel: 'Render background workers — cover',
  body: body(
    p('Most of my builds put the site on Cloudflare Pages or Vercel, which is the right place for it. Neither gives you a process that is simply always running, and eventually something needs one — a queue worker, a nightly reconciliation, a long import that outlives any request timeout.'),
    p('Render is where I put that half. It runs an ordinary long-lived process, it has a cron primitive that is not a hack, and it deploys from the same repository as everything else. This is the practical setup, including the things that go wrong on it.'),
    p('The queue design itself is [a separate decision](/blog/background-job-queues) — this is about where the worker actually runs once you have one.'),

    h2('Which service type do you actually want?'),
    p('Render has several and the names are close enough that the wrong one gets picked, usually for the reason that it was the one already there.'),
    table('Four service types, four jobs', [
      ['Type', 'Runs', 'Has a URL', 'Use for'],
      ['Web Service', 'Continuously', 'Yes', 'An API or server-rendered app'],
      ['Background Worker', 'Continuously', 'No', 'Queue consumers, long-lived listeners'],
      ['Cron Job', 'On a schedule, then exits', 'No', 'Nightly reports, cleanup, reconciliation'],
      ['Static Site', 'Build only', 'Yes', 'Prebuilt front ends'],
    ]),
    p('The distinction that matters most is Background Worker versus Web Service. A worker has no HTTP port and Render does not expect one, so it is not health-checked by request and it is not subject to the free-tier spin-down that catches people out.'),
    p('The common mistake is running the worker loop inside the web service because it was already deployed. That couples the two — every web deploy restarts your jobs, and scaling the API to three instances silently gives you three workers competing for the same queue.'),
    img('service-types', 'Four deployment shapes distinguished by lifetime and whether they accept incoming requests', 'A worker has no port, so nothing pings it and nothing spins it down. That is the whole reason for the separate type.'),

    h2('What does the configuration look like?'),
    p('A `render.yaml` in the repository, so the infrastructure is reviewed in pull requests like everything else rather than clicked into a dashboard.'),
    code('yaml', `
services:
  - type: web
    name: api
    runtime: node
    buildCommand: npm ci && npm run build
    startCommand: npm run start
    healthCheckPath: /healthz

  - type: worker
    name: jobs
    runtime: node
    buildCommand: npm ci && npm run build
    startCommand: npm run worker
    envVars:
      - key: DATABASE_URL
        fromDatabase: { name: app-db, property: connectionString }

  - type: cron
    name: nightly
    runtime: node
    schedule: "0 3 * * *"          # UTC, always
    buildCommand: npm ci && npm run build
    startCommand: npm run task:nightly
`),
    p('Three services from one repository, each with its own start command. The build is duplicated, which is the honest cost of this arrangement — three services means three builds of the same code, and on a large project that is real minutes.'),

    h3('The schedule is UTC, and it will bite you once'),
    p('Every cron expression runs in UTC regardless of where you or your customers are. A "9am daily report" configured as `0 9 * * *` arrives at 9am UTC, which is a different hour for most of the world and a different hour again after a daylight-saving change. Compute the local time inside the job, and schedule the trigger conservatively.'),

    p('Where the duplicated build genuinely hurts, the way out is to build once and have the services run different commands against the same artifact — a container image built in CI and deployed to all three. That is a step up in complexity and it is not worth taking until the build minutes are an actual complaint rather than an aesthetic one.'),

    h3('Secrets come from the dashboard or a group, not the file'),
    p('`render.yaml` is in the repository, so anything sensitive lives in an environment group referenced by name. Committing a database URL because the file already had one is the mistake this arrangement makes easy, and it is worth a moment of care each time.'),

    h2('What breaks on the free tier?'),
    p('Two things, and both look like bugs in your code rather than properties of the plan.'),

    h3('Web services spin down after inactivity'),
    p('A free web service with no traffic for fifteen minutes is stopped, and the next request pays a cold start of thirty seconds or more. For a demo this is fine. For anything a client is looking at, it reads as a broken site — and the temptation is to fix it with an uptime pinger, which works and is a slightly dishonest way to hold a free instance open.'),

    p('It is worth being precise about who this affects, because the free tier is genuinely useful. A staging environment, a demo you send to a client, a side project with no scheduled work — all fine, and the cold start is an acceptable trade for the price. The moment something is meant to happen without a human triggering it, the calculation changes completely.'),

    h3('Free instances are not where jobs belong'),
    p('The important consequence is for anything running work. A spun-down service is not processing anything, so a queue worker on a free instance stops when it goes quiet — which is exactly when it has a backlog to clear. If jobs matter, they need a paid instance, and that is the actual line rather than a nudge to upgrade.'),
    p('This is also why [uptime monitoring belongs on the worker](/blog/uptime-vs-error-tracking) and not only on the site. A stopped worker produces no errors at all, because nothing is running to produce them.'),
    img('spin-down', 'A process becoming inactive during a quiet period while work accumulates beside it', 'The worker stops exactly when the queue is quietest, and resumes to a backlog nobody was told about.'),

    h2('How do you make a cron job reliable?'),
    p('Five properties. A cron job that lacks any of them will eventually fail in a way you find out about weeks later.'),
    ol([
      '**Idempotent.** Cron can fire twice — a retry, an overlapping run, a manual trigger. Running the nightly reconciliation twice must produce the same result as running it once.',
      '**Bounded.** A job with no timeout that hangs will still be hanging when the next one starts, and now two are running against the same data.',
      '**Non-overlapping.** Take an advisory lock at the start. If another run holds it, exit cleanly rather than proceeding in parallel.',
      '**Observed.** A cron job that silently stops running is the classic invisible failure. Emit a heartbeat on success to a dead-man switch, so the absence of a run raises the alert.',
      '**Chunked.** Work that grows with your data will eventually exceed any time limit. Process a bounded batch and let the next run continue, rather than assuming one run can finish.',
    ]),
    code('ts', `
// Advisory lock: cheap, automatic release on disconnect, no cleanup job.
const [{ locked }] = await db.$queryRaw\`select pg_try_advisory_lock(\${LOCK_ID}) as locked\`;
if (!locked) { console.log('already running, exiting'); process.exit(0); }
`),
    p('The advisory lock is my default for this because it needs no table and it releases when the connection drops — including when the process is killed, which a lock stored in a row does not. Pick the lock id once, keep it in a constant beside the task, and never reuse it for anything else.'),

    img('cron-properties', 'A scheduled action guarded by a claim, a boundary, a limit and an outward signal', 'Five properties. The fifth — something watching for the run that did not happen — is the one that catches the real failure.'),

    h3('The dead-man switch is the one people skip'),
    p('Alerting on failure catches a job that ran and threw. It does not catch a job that never ran, which is the more common failure — a misconfigured schedule, a service deleted during a cleanup, a build that has been failing for a fortnight. A check that expects a ping every 24 hours and alerts on its absence catches all of those.'),

    h2('How do the worker and the web service share code?'),
    p('One repository, one build, different entry points. Anything else and they drift.'),
    code('json', `
{
  "scripts": {
    "start":        "node dist/server.js",
    "worker":       "node dist/worker.js",
    "task:nightly": "node dist/tasks/nightly.js"
  }
}
`),
    p('The value of the shared repository is that the worker imports the same database client, the same schemas and the same domain functions as the API. A job that creates an invoice runs the same code path the API does, so a fix applies to both — and a change to a shared type breaks both at compile time rather than one at runtime.'),

    h3('Do not let the worker import the HTTP layer'),
    p('It is easy for a worker to end up pulling in the Express app because a handler lives in a file that also exports a route. That drags middleware, sessions and sometimes a listening port into a process that needs none of them. Keep the domain logic in modules neither layer owns, and have both import from there.'),

    p('The same applies in reverse: the API should not import the worker\'s job handlers. It has no reason to run them, and importing them drags in whatever they depend on — a PDF renderer, a model client, an image library — into a process that pays for that at cold start and never uses it.'),

    h3('Health checks for something with no URL'),
    p('A worker cannot be health-checked by HTTP because it has no port. Either have it write a heartbeat timestamp to the database on each loop, and alert when that goes stale, or give it a minimal HTTP server that exists only to answer a health probe. I prefer the heartbeat, because it proves the loop is turning rather than that the process exists.'),
    img('shared-code', 'Two runtime entry points drawing on a common core of shared modules', 'Same repository, same domain modules, different entry points. The HTTP layer belongs to only one of them.'),

    h2('How do you handle deploys and scaling?'),
    p('Independently per service, which is most of the reason to split them in the first place — and it introduces one coordination problem worth planning for.'),

    h3('Only one service should run migrations'),
    p('If both the web service and the worker run migrations on start, a deploy runs them concurrently from two processes. Most tools take an advisory lock and survive this; relying on that is a choice rather than a default. Run migrations in a single pre-deploy step and have the runtime services assume the schema is already current.'),

    p('Deploy order matters too. A worker running new code against a schema the pre-deploy step has already migrated is fine; a worker running old code that picks up a job enqueued by new code is the case to think about, and it is the same rolling-window problem a [staged schema change](/blog/zero-downtime-migrations) has. Deploy the worker first when it needs to understand a new job kind, and the API first when the API needs a schema the worker does not touch.'),

    h3('Scale the worker on queue depth, not on traffic'),
    p('The web service scales with requests. The worker should scale with backlog, and those are unrelated — a quiet night with a large import queued needs more workers and fewer web instances. Splitting them is what makes each answer to the right signal.'),

    h3('More workers means the claim has to be safe'),
    p('Two worker instances polling the same table will hand the same row to both unless the claim is atomic. This is the `FOR UPDATE SKIP LOCKED` question from [the queue design](/blog/background-job-queues), and it stops being theoretical the moment the instance count goes above one.'),

    h3('Preview environments need a worker too, or they lie'),
    p('A preview with no worker looks fine and quietly does nothing asynchronous — the email never arrives, the export never completes, and it is written off as a preview quirk. Either run a worker per preview or make its absence obvious in the interface, because a silent half-working environment is worse for review than a clearly incomplete one.'),
    img('scaling-signals', 'Two independently sized groups of processes responding to different measured inputs', 'Requests and backlog are unrelated signals. Splitting the services is what lets each follow its own.'),

    h2('Where does Render fit against the alternatives?'),
    p('It is the boring always-on piece in a stack whose other parts are not. That is a narrow role and it does it well.'),
    table('What runs where, in the stacks I build', [
      ['Piece', 'Where', 'Why'],
      ['Marketing site, docs', 'Cloudflare Pages', 'Static, global, free'],
      ['App front end and API routes', 'Vercel or Workers', 'Scales to zero, deploys per push'],
      ['Queue worker', 'Render Background Worker', 'Needs to be always on'],
      ['Scheduled tasks', 'Render Cron', 'Real cron, not a request trigger'],
      ['Database', 'Neon or Supabase', 'Branching, and independent of compute'],
    ]),
    p('The alternative for the bottom two rows is a container platform — Fly, Railway, a small VPS, or a cloud provider\'s container service. Any of them works. Render\'s advantage is that the configuration is small and the failure modes are few, which matters more on a solo or small-team project than raw flexibility does.'),
    p('The honest counterweight: Render is not the cheapest at scale and it is not the most configurable. If you are already deep in one cloud, running the worker there is fewer accounts and one less dashboard, and that is a real argument. Render wins when the rest of the stack is deliberately spread across specialists and you want the always-on piece to be the least interesting part of it.'),

    h2('What do you get wrong the first time?'),
    p('Five things, all of which I have done.'),
    ul([
      '**Running the worker inside the web service.** Every deploy interrupts jobs, and scaling the API multiplies the workers.',
      '**Assuming the free tier keeps running.** It does not, and the failure is silent.',
      '**Scheduling in local time.** The cron is UTC and the report arrives at the wrong hour for half the year.',
      '**No shutdown handling.** A deploy kills the process mid-job; without a signal handler the work is abandoned rather than finished.',
      '**No alert on absence.** Failures are noticed and disappearances are not, and disappearances are more common.',
    ]),
    p('The shutdown one is worth a sentence more. Render sends a termination signal and waits before killing the process. A worker that catches it, finishes the job in hand, declines to claim another and exits turns every deploy into a clean handover. Ignoring it means every deploy abandons a job to its lease timeout, which is recoverable and needlessly untidy.'),
    quote('The two failures that actually cost you are a worker that stopped and a cron that never ran. Both are silent, and neither is caught by alerting on errors.'),

    img('common-mistakes', 'Five recurring configuration faults arranged around a running service', 'All five are configuration rather than code, which is why none of them are caught by a test suite.'),

    h2('How do you test any of this locally?'),
    p('By running the same entry points, against the same database, with the schedule replaced by your own hand.'),
    p('The worker needs nothing special — `npm run worker` against a local database, with jobs enqueued by using the application normally. That loop is the real one, and it is where you find the bugs.'),

    h3('Run the cron task as a command'),
    p('Because a cron job is just a script that exits, testing it is running the script. Keep the schedule entirely in `render.yaml` and none of it inside the task, so the task itself has no notion of when it runs and can be invoked at will.'),

    p('The one thing that genuinely cannot be tested locally is the schedule itself — whether the cron expression means what you think, and whether the service is wired up at all. The cheap substitute is to check the first real run in the dashboard after deploying, and then to rely on the dead-man switch for every run after that. Reading one log line the day you ship it is the only manual step in this whole arrangement, and skipping it is how a task turns out to have never run at all.'),

    h3('Test the second run, not the first'),
    p('The interesting test is running the task twice in a row and asserting nothing changed the second time. That is the idempotency property the whole design rests on, and it is four lines — [the same test that matters for job handlers](/blog/idempotency-keys) and for webhook consumers.'),

    h2('Conclusion'),
    p('Put the always-on work in a Background Worker rather than inside the web service. It has no port, so nothing spins it down, and it deploys and scales independently of the API — which stops every front-end release from interrupting jobs and stops scaling the API from multiplying the workers.'),
    p('Keep the configuration in `render.yaml` so infrastructure changes go through review, with secrets in an environment group rather than in the file. Three services from one repository costs three builds, which is the honest price of the arrangement.'),
    p('Do not run anything that matters on a free instance. The spin-down stops the worker exactly when the queue is quiet, and it resumes to a backlog that nobody was alerted about. That is the real line between the tiers rather than a soft nudge.'),
    p('Make every cron task idempotent, bounded, non-overlapping via an advisory lock, and chunked so it does not outgrow its window. Then add the thing most people miss: a dead-man switch that alerts on a run *not* happening, because a schedule that silently stopped produces no errors to alert on.'),
    p('Handle the termination signal so a deploy finishes the job in hand instead of abandoning it, and heartbeat from the worker loop so "the process is alive" and "the loop is turning" are distinguishable. If you have a stack that is serverless everywhere and needs one always-on piece, [that is a conversation worth having](/start) before it becomes three.'),
  ),
  faqs: faq([
    ['Should background jobs run in the web service or a separate worker?',
     'A separate Background Worker. Running the loop inside the web service means every front-end deploy restarts your jobs, and scaling the API to several instances silently gives you several workers competing for the same queue. A worker also has no port, so nothing spins it down.'],
    ['Do Render free instances keep background work running?',
     'No. Free services spin down after a period of inactivity, so a queue worker stops exactly when the queue is quiet and resumes to a backlog. The failure is silent — a stopped worker produces no errors because nothing is running. Anything that matters needs a paid instance.'],
    ['What timezone do Render cron jobs use?',
     'UTC, always. A schedule written as 9am fires at 9am UTC, which is a different local hour for most of the world and shifts again across daylight-saving changes. Schedule conservatively and compute the local time inside the job rather than in the cron expression.'],
    ['How do you monitor a worker that has no URL?',
     'Have the loop write a heartbeat timestamp on each pass and alert when it goes stale. That proves the loop is turning rather than merely that the process exists. For cron tasks, use a dead-man switch that alerts on the absence of a run, since a job that never fires raises no error.'],
  ]),
};
