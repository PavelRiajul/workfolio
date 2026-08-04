import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/neon-database-branching/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-neon-database-branching',
  slug: 'neon-database-branching',
  title: 'Database Branching in Neon, and What It Actually Fixes',
  category: 'backend',
  order: 50,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-04',
  series: 'Foundations',
  excerpt:
    'A branch per pull request with production-shaped data, why it makes migration review possible, and the two ways it quietly leaks customer records.',
  coverLabel: 'Neon database branching — cover',
  body: body(
    p('The reason migrations get reviewed badly is that nobody can run them against anything real. The diff shows a column being dropped, the reviewer has a local database with eleven rows in it, and the question "will this lock the table for four minutes" has no answer available at review time.'),
    p('Neon\'s branching changes that specific thing. A branch is a copy-on-write fork of the database that takes about a second regardless of size, so every pull request can have its own database containing production-shaped data — and the migration can run there before anybody approves it.'),
    p('This is why Neon is the Postgres in my B2B and web-app [stack templates](/stack) rather than a managed instance elsewhere. Here is what it genuinely fixes, what it does not, and the part that will leak customer data if you are careless.'),

    h2('What is a database branch, actually?'),
    p('A pointer to a moment in the storage layer, not a copy of the data. Neon separates storage from compute, keeps a write-ahead log, and a branch is a new head over the same underlying pages.'),
    p('That is why the operation is instant and why a branch of a 200GB database does not cost 200GB. Storage is only consumed as the branch diverges — the pages you write, not the pages you inherit.'),
    table('Branch versus the alternatives', [
      ['Approach', 'Time to create', 'Data realism', 'Storage cost'],
      ['Neon branch', 'About a second', 'Exact', 'Only the divergence'],
      ['pg_dump and restore', 'Minutes to hours', 'Exact', 'Full copy'],
      ['Seed script', 'Seconds', 'Invented', 'Tiny'],
      ['Shared staging database', 'Already exists', 'Stale and shared', 'One copy'],
    ]),
    p('The last row is what most teams have, and it is the one this replaces. A single shared staging database means two people testing migrations at once corrupt each other\'s work, and it means the database drifts from production in ways nobody tracks.'),
    img('branch-model', 'A shared base layer with several divergent heads reading from it', 'Copy-on-write. The branch costs what it changes, not what it contains.'),

    h2('What does a branch per pull request give you?'),
    p('Four things, and the second is the one that changes how migrations get reviewed.'),

    h3('The migration runs before approval'),
    p('CI creates a branch, applies the migration, runs the test suite against it, and reports the result on the pull request. A migration that fails, locks, or takes eleven minutes is visible in the check rather than at deploy time.'),

    h3('Preview deployments get their own data'),
    p('A Vercel or Cloudflare preview pointed at a branch can be clicked through with real-shaped content. Reviewing a UI change against three seeded rows and reviewing it against a customer\'s actual data volume are different activities, and only the second finds the pagination bug.'),

    h3('Destructive tests become safe'),
    p('You can delete everything on a branch. That makes it possible to actually test the account-deletion path, the data-export path, and the bulk-import path — all of which are normally under-tested because nobody wants to run them anywhere real.'),

    h3('Reset is instant'),
    p('A branch that gets into a bad state is deleted and recreated in a second, rather than being repaired. This sounds minor and it changes behavior: people experiment more when undo is free.'),
    code('yaml', `
# The whole thing is one step in CI.
- run: neonctl branches create --name pr-\${{ github.event.number }} --parent main
- run: npx prisma migrate deploy
- run: npm test
# ...and a delete step on PR close, or branches accumulate.
`),
    p('One thing worth getting right in that workflow is where the branch name comes from. Deriving it from the pull request number means a re-run of the same pipeline reuses the branch instead of creating a second one, and it means the delete step on close knows exactly what to remove without any state passed between jobs. A random name works until a job fails between creation and cleanup, which happens weekly on a busy repository.'),
    p('That cleanup step is not optional housekeeping. Branches hold their divergence in storage and a repository with three hundred stale branches is paying for three hundred sets of changes, most belonging to pull requests merged months ago.'),

    h2('How does this change migration review?'),
    p('It turns an argument about what a statement will do into a measurement of what it did.'),
    p('Most dangerous migrations are dangerous for reasons that depend on data volume, and volume is exactly what a local database lacks. Adding a non-null column with a default, creating an index without `concurrently`, changing a column type — all of these are instant on eleven rows and hold an exclusive lock for minutes on eleven million.'),
    code('sql', `
-- Instant locally. On a large table this rewrites and holds a lock throughout.
alter table events alter column payload type jsonb using payload::jsonb;

-- What the branch tells you that the diff cannot: how long, and what it locked.
`),
    p('Running it on a branch with real volume produces a number. A reviewer can then make an actual decision — ship it, or split it into the concurrent-index-then-swap version — instead of guessing based on how the statement reads.'),
    p('This connects directly to [zero-downtime migrations](/blog/zero-downtime-migrations): the techniques there are only worth applying to the migrations that need them, and a branch is how you find out which ones those are.'),
    img('migration-review', 'A proposed change being executed in an isolated copy before being approved', 'The diff tells you what the statement says. The branch tells you what it does.'),

    h2('Where does customer data leak?'),
    p('Two places, and both are the direct consequence of the thing that makes branching useful — the data on the branch is real.'),

    h3('Preview environments are less protected than production'),
    p('A preview URL is usually unauthenticated or behind a shared password, it is not monitored, and it is often indexed if somebody links to it. Pointing that at a branch containing real customer records puts production data behind preview-grade access control.'),

    h3('Third-party integrations fire for real'),
    p('A branch carries the rows. If the preview environment also carries production API keys, a test run sends real emails to real customers, charges real cards and posts real webhooks. The database was branched; the outside world was not.'),
    p('Both problems have the same fix and it has to be automatic rather than remembered.'),
    code('ts', `
// Anonymize on branch creation, not "before somebody uses it".
update users set
  email = 'user' || id || '@example.invalid',
  phone = null,
  name  = 'Test User ' || left(id::text, 8);

truncate table payment_methods, sessions, audit_log;
`),
    p('Run that as a step in the same CI job that creates the branch, so a branch that exists has always been through it. And keep every outbound integration on test credentials in preview — the anonymized addresses above are `.invalid` on purpose, since a send to them cannot reach anyone even if the email code runs.'),

    h3('The safer default: branch the schema, seed the data'),
    p('For most preview work you need production\'s *shape*, not its contents. A branch created from a schema-only parent plus a generous seed gives you realistic volume and structure with nothing sensitive in it, and removes the whole class of problem. Use the real-data branch for migration timing, where the volume is the point, and keep it out of anything with a public URL.'),
    img('leak-paths', 'Two outward paths from a copied dataset, one to an exposed surface and one to external services', 'The database got branched. The email provider, the payment processor and the preview URL did not.'),

    h2('How do you name and expire branches?'),
    p('With a scheme derived from something automatic, and a deletion rule that does not depend on anybody remembering. Branch sprawl is the failure mode of this workflow and it arrives quietly.'),

    h3('Derive the name, never type it'),
    p('`pr-482` from the pull request number, `preview-<sha>` from a commit, `restore-<timestamp>` for a recovery fork. A hand-typed name means two people eventually pick the same one, and it means a cleanup job cannot tell a disposable branch from a deliberate one.'),

    h3('Delete on close, and sweep on a schedule'),
    p('The delete step in the pull-request workflow handles the common case and misses every branch created by a job that failed halfway. A weekly sweep that removes anything matching the disposable prefix older than a week catches the rest, and it is fifteen lines.'),

    h3('Protect the branches that matter'),
    p('`main` and anything a real environment points at should be protected so a cleanup script cannot reach them. This is worth doing before writing the cleanup script rather than after, for the obvious reason.'),
    p('The reason to be strict here is that a stale branch is not inert. It holds its divergence in storage, it may have a compute endpoint that occasionally wakes, and — worst — it holds a snapshot of whatever data was on it, including the customer records from the pull request nobody ever merged.'),
    img('branch-sprawl', 'Many short divergent paths from a trunk, most of them terminated and a few continuing', 'Derive names, delete on close, sweep weekly. A stale branch still holds the data it was created with.'),

    h2('How does this compare to the alternatives?'),
    p('Every hosted Postgres has some answer to "give me a copy". They differ in whether the answer is fast enough to put in CI.'),
    table('Getting a realistic database, four ways', [
      ['Approach', 'Realistic', 'Fast enough for CI', 'Sensitive data risk'],
      ['Neon branch', 'Exact', 'Yes', 'High, unless anonymized'],
      ['Supabase branching', 'Schema, seeded data', 'Yes', 'Low'],
      ['Restore from snapshot', 'Exact', 'No', 'High'],
      ['Docker Postgres + seed', 'Invented', 'Yes', 'None'],
    ]),
    p('The row that surprises people is the last one, because it is the right answer more often than the branching pitch suggests. If your tests only need a schema and fixtures, a container is faster, free, offline and carries no data risk at all — and it is what I use for the unit suite even on projects where branching is set up for pull requests.'),
    p('The case for branching is specifically the middle ground: work that needs production\'s volume and distribution, for a few hours, and then needs to disappear. Migration timing, pagination behavior, query plans on real cardinality. Outside that band the simpler option usually wins, and reaching for the impressive one is how a pipeline acquires a dependency it did not need.'),
    img('four-options', 'Four routes to a working dataset, ranked on speed against realism', 'A container is the right answer more often than the branching pitch suggests. Branching wins in one specific band.'),

    h2('How do you handle branching with Prisma?'),
    p('One connection string per environment, resolved at runtime, and a migration workflow that never runs `db push` anywhere that matters.'),
    code('ts', `
// The branch URL comes from the environment. Nothing in the app knows
// which branch it is on, which is the property you want.
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // pooled vs direct — migrations need direct
}
`),
    p('The pooled-versus-direct split is the detail that costs an afternoon if missed. Neon\'s pooler is right for application queries and wrong for migrations, which need a session-level connection to take advisory locks. Prisma\'s `directUrl` exists for exactly this, and a migration run through the pooler fails in a way that does not obviously say so.'),

    p('The application itself should be entirely unaware of which branch it is talking to. Any code that reads a branch name, checks an environment string to decide behavior, or has a special case for preview is code whose preview path is untested in production and whose production path is untested in preview. The connection string is the only thing that differs.'),

    h3('Never use db push outside a scratch branch'),
    p('`prisma db push` reconciles the schema without producing a migration file. On a scratch branch that is a fast loop; anywhere else it means the schema history and the database have diverged, and the next real migration is generated against the wrong baseline.'),

    h3('Generate the migration against a branch that matches production'),
    p('A migration generated against a local database that has drifted produces statements for a schema nobody has. Creating it against a fresh branch of the production schema is one command and removes the entire category.'),

    h2('What about the compute side?'),
    p('Branches have their own compute, and the default behavior is worth understanding before it surprises you in a bill or a benchmark.'),

    h3('Scale to zero means a cold start'),
    p('An idle branch suspends. The first query after that pays a start-up cost of a few hundred milliseconds. On preview environments this is exactly right. On a production branch it is not, and the setting is per branch rather than global.'),

    h3('Do not benchmark on a branch and conclude anything'),
    p('A branch is on shared infrastructure with its own compute sizing, and its page cache is empty. A query that is slow on a fresh branch may be fast on production simply because production has the relevant pages resident. Use branches to find missing indexes and locking behavior, which are structural, and measure timings where the cache is warm.'),

    p('There is a related trap in autoscaling. A branch sized smaller than production will hit resource limits on a query production handles comfortably, and the failure looks like a bug in the query rather than a difference in the environment. When you are using a branch to judge whether something is fast enough, match the compute size deliberately — otherwise you are measuring the branch, not the change.'),

    h3('Branch from a point in time, not just from the head'),
    p('Neon can branch from a timestamp within the retention window. That is the recovery story: something deleted an hour ago is recoverable by branching from ninety minutes ago and copying the rows across, without restoring anything or touching the live database.'),
    p('The workflow is worth rehearsing once before you need it, because the useful version is not "restore everything". It is: branch from before the incident, connect to both branches at once, and copy across only the affected rows. Production keeps serving throughout, and the blast radius of the fix is the rows you name rather than the whole database.'),
    p('It is worth being clear that this is not a substitute for backups. Retention is bounded, and a bug discovered three weeks later is outside it — which is the argument for [backups you have actually restored](/blog/tested-database-backups) sitting underneath this rather than beside it.'),
    img('point-in-time', 'A timeline with a new path forking from an earlier marked position', 'Branch from ninety minutes ago, copy the rows across, leave production untouched. Bounded by retention, so not a backup.'),

    h2('When is branching not the answer?'),
    p('Three cases where reaching for it adds process without adding safety.'),
    ul([
      '**Unit tests.** They should run against an ephemeral local Postgres in a container. A network round trip per test is slower than the tests are, and the data realism is irrelevant when the input is a fixture.',
      '**Long-lived environments.** A branch that lives for six months is a second production database with none of the operational attention. If an environment is permanent, make it a project rather than a branch.',
      '**Load testing.** Shared compute produces numbers that are not reproducible and not representative. Provision something sized for it.',
    ]),
    p('The pattern in all three is the same: branching is for short-lived, disposable, data-shaped work. The moment something is permanent, or the moment the measurement is about infrastructure rather than about your schema, it belongs elsewhere.'),

    h2('What does this cost to adopt?'),
    p('An afternoon of CI configuration, and it is one of the few pieces of infrastructure work where the payoff is visible in the first week.'),
    p('The pieces are: a create step and a delete step in the pull-request workflow, an anonymization step between them, the preview environment reading its connection string from the branch, and test credentials for every outbound integration in preview. That is a day at the outside, most of it spent on the integration credentials rather than on Neon.'),
    p('The honest counterweight is that it adds a moving part to CI. A branch-creation step that fails blocks the pipeline, and a quota reached on a busy day blocks everybody\'s pull request at once. Set a branch limit, delete on close, and have the workflow fail loudly rather than silently falling back to a shared database — a fallback that quietly points CI at production data is a considerably worse outcome than a red pipeline.'),
    quote('The value is not that branching is clever. It is that a reviewer can finally answer "what will this migration do" with a number instead of an opinion.'),

    h2('Conclusion'),
    p('Create a branch per pull request, run the migration and the test suite against it in CI, and delete it when the pull request closes. That single loop turns migration review from a reading exercise into a measurement, which is the whole reason to bother.'),
    p('Anonymize on creation as an automated step rather than a remembered one, and keep every outbound integration on test credentials in preview environments. The database is the only thing that got branched — the email provider, the payment processor and the public preview URL did not, and each is a route for real data or real side effects to escape.'),
    p('Use the direct connection for migrations and the pooled one for queries, never run `db push` outside a scratch branch, and generate migrations against a branch of the production schema so the baseline is right. These are small details that each cost an afternoon when missed.'),
    p('Keep branches short-lived and disposable. Unit tests belong on a local container, permanent environments belong in their own project, and load tests belong on dedicated compute — branching is for the case where you need production\'s shape for a few hours and then need it gone. If you are choosing a Postgres host and want to talk through whether this workflow is worth building around, [get in touch](/start).'),
  ),
  faqs: faq([
    ['How is a Neon branch different from a database copy?',
     'A branch is copy-on-write over shared storage, so it is created in about a second regardless of database size and only consumes storage as it diverges. A dump-and-restore copies every page, takes minutes to hours, and costs the full size of the database for as long as it exists.'],
    ['Is it safe to use production data in preview environments?',
     'Not without anonymizing it first. Preview URLs have weaker access control than production and are rarely monitored, and preview environments often carry live API keys that will send real email and charge real cards. Anonymize as an automated step at branch creation, not as a remembered one.'],
    ['Can database branching replace backups?',
     'No. Point-in-time branching is bounded by the retention window, so it handles a mistake noticed within hours and cannot help with one found three weeks later. Keep restore-tested backups underneath it — branching is a fast recovery path, not a durable one.'],
    ['Should unit tests run against a database branch?',
     'No. Use an ephemeral local Postgres in a container. A network round trip per test is slower than the tests themselves, and data realism does not matter when every input is a fixture. Save branches for migration timing and preview environments where volume is the point.'],
  ]),
};
