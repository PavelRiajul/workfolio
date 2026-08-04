import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/zero-downtime-migrations/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-zero-downtime-migrations',
  slug: 'zero-downtime-migrations',
  title: 'Schema Migrations That Do Not Take the Site Down',
  category: 'backend',
  order: 51,
  readTime: '14 min read',
  date: 'September 2026',
  publishedAt: '2026-09-05',
  series: 'Foundations',
  excerpt:
    'The expand-and-contract pattern, which ALTER statements take an exclusive lock, and why the dangerous part of a rename is the deploy rather than the SQL.',
  coverLabel: 'Zero-downtime migrations — cover',
  body: body(
    p('The migration that took a site down was almost never the one anybody worried about. It was a column rename, which is one line, obviously correct, and reviewed in eight seconds.'),
    p('It took the site down because for the ninety seconds between the migration finishing and the last old container being replaced, running code was selecting a column that no longer existed. The SQL was fine. The deployment was the problem, and no amount of care about the statement itself would have caught it.'),
    p('This is the discipline I apply on every project with real traffic, and it is one of the reasons [database design decisions](/blog/database-design-for-v2) are worth making carefully up front — every one of them is cheaper before there are rows.'),

    h2('Why does a migration cause downtime at all?'),
    p('Two independent reasons, and confusing them leads to fixing the wrong one.'),
    table('The two failure modes', [
      ['Cause', 'What happens', 'Fixed by'],
      ['The statement takes a lock', 'Queries queue behind it, requests time out', 'Choosing a non-blocking form'],
      ['Code and schema disagree', 'Running code references something that changed', 'Deploying in stages'],
    ]),
    p('The first is a database problem and it is solved with SQL. The second is a deployment problem and it is solved by never having a moment where the schema and the code in production are incompatible.'),
    p('Most guidance covers the first and stops. The second is the one that produces the pager alert, because it happens on the safe-looking migrations that nobody scheduled a window for.'),
    img('two-causes', 'Two separate failure paths converging on a single outage, one from a lock and one from a version mismatch', 'Locks are a SQL problem. Version skew is a deployment problem. They need different fixes.'),

    h2('Which statements actually block?'),
    p('Fewer than people fear, and a couple that nobody expects. Modern Postgres has made several of these safe, which is why advice from 2015 is misleadingly cautious in some places and dangerously relaxed in others.'),
    table('Common operations and what they cost', [
      ['Operation', 'Lock', 'Safe on a large table?'],
      ['ADD COLUMN, nullable, no default', 'Brief exclusive', 'Yes'],
      ['ADD COLUMN with a constant default', 'Brief exclusive', 'Yes (PG 11+)'],
      ['ADD COLUMN with a volatile default', 'Exclusive, full rewrite', 'No'],
      ['ALTER COLUMN TYPE', 'Exclusive, full rewrite', 'No'],
      ['SET NOT NULL', 'Exclusive, full scan', 'Only with a validated check first'],
      ['CREATE INDEX', 'Blocks writes', 'No — use CONCURRENTLY'],
      ['ADD FOREIGN KEY', 'Blocks writes on both tables', 'Only with NOT VALID first'],
      ['DROP COLUMN', 'Brief exclusive', 'Yes'],
    ]),
    p('The pattern in the safe rows is that nothing rewrites the table. Postgres stores an added column\'s constant default as metadata rather than writing it into every row, which is why that operation went from dangerous to trivial and why a lot of older advice over-warns about it.'),

    h3('Brief exclusive is not free'),
    p('Even a fast exclusive lock has to be acquired, and acquiring it means waiting for every existing transaction on the table to finish. One long-running query — a report, an open transaction in a psql session somebody forgot — holds the migration, and every subsequent query queues behind the migration.'),
    code('sql', `
-- Give up rather than queue. Without this, a single long transaction
-- turns a millisecond migration into a site-wide stall.
set lock_timeout = '3s';
set statement_timeout = '30s';

alter table orders add column region text;
`),
    p('This is the single highest-value line in any migration file. A migration that fails because it could not get a lock is a retry; a migration that waits four minutes for a lock while holding the queue is an outage.'),

    p('The mechanism is worth understanding because it explains a lot of confusing incidents. Postgres queues lock requests in order, and an exclusive request that is waiting also blocks every request behind it — including plain reads that would otherwise be compatible with each other. So one forgotten `BEGIN` in a console session, plus one migration, is enough to stall a table completely even though neither on its own would.'),

    h3('CONCURRENTLY cannot run in a transaction'),
    p('`CREATE INDEX CONCURRENTLY` builds without blocking writes, at the cost of two table passes and the inability to run inside a transaction block. Most migration tools wrap everything in a transaction by default, so this needs an explicit escape — and if the build fails it leaves an invalid index behind that must be dropped before retrying.'),
    img('lock-queue', 'A single blocked item causing a growing line of waiting items behind it', 'The migration waits for one long transaction. Everything else waits for the migration.'),

    h2('What is expand and contract?'),
    p('The pattern that removes version skew: never change something in place, always add the new thing, move traffic, then remove the old thing. Three deploys instead of one.'),
    ol([
      '**Expand.** Add the new column, table or index. Old code ignores it; new code can use it. Both versions run happily.',
      '**Migrate.** Backfill existing rows and write to both old and new for a period. Still compatible in both directions.',
      '**Contract.** Once no running code reads the old thing, remove it.',
    ]),
    p('The cost is real — three pull requests and a backfill for what looks like a one-line change. The benefit is that at no point does a deployed version of your code disagree with the deployed schema, which means a rollback is also safe, and rollback safety is the part people discover they needed at the worst time.'),
    img('expand-contract', 'A three-stage sequence adding a parallel path, shifting traffic to it, then removing the original', 'Three deploys, and no moment where running code and the live schema disagree.'),

    h2('How do you rename a column safely?'),
    p('You do not rename it. You add the new one and remove the old one over three deploys, because a rename is atomic in the database and gradual in your fleet.'),
    code('sql', `
-- Deploy 1 — expand.
alter table users add column full_name text;

-- Application writes both, reads the old one.
`),
    code('ts', `
// Deploy 1 application code: dual-write, read old.
await db.user.update({ where: { id }, data: { name: value, fullName: value } });
const display = user.name;
`),
    p('Then a backfill copies existing rows in batches. Then deploy 2 flips reads to the new column while still writing both. Then deploy 3 stops writing the old one, and a fourth change eventually drops it.'),
    code('sql', `
-- Backfill in batches. One statement over ten million rows is a long
-- transaction that blocks vacuum and bloats the table.
update users set full_name = name
where full_name is null and id in (
  select id from users where full_name is null limit 5000
);
`),
    p('The batching matters for a reason that is not obvious: a single enormous update holds a transaction open for its whole duration, which prevents vacuum from cleaning up dead rows across the database and can bloat the table faster than the update progresses.'),

    p('Batch size is worth tuning rather than guessing. Too small and a ten-million-row backfill takes days; too large and each batch holds locks long enough to be felt. A few thousand rows per statement with a short pause between them is a reasonable starting point, and the right number is whatever keeps replication lag and lock waits flat while the job runs — both of which you should be watching, not assuming.'),

    h3('Why not just rename in the same deploy?'),
    p('Because deployments are not atomic. During a rolling deploy, old and new containers serve traffic simultaneously — that is the point of rolling. A rename means one of the two sets is running against a schema it was not written for, for as long as the rollout takes.'),

    h3('The same applies to dropping anything'),
    p('A dropped column is a rename\'s second half. Deploy the code that stops referencing it, wait until you are certain nothing does — including background jobs, reports and that one Retool query — and only then drop it. The wait should be measured in days, not minutes.'),

    h2('How do you add a NOT NULL constraint?'),
    p('In two steps, because the direct form scans the entire table under an exclusive lock.'),
    code('sql', `
-- Step 1: add the constraint unvalidated. Takes a brief lock, checks nothing.
alter table orders add constraint orders_region_not_null
  check (region is not null) not valid;

-- Step 2: validate it. Scans the table, but only takes a share lock —
-- reads and writes continue throughout.
alter table orders validate constraint orders_region_not_null;
`),
    p('The two-step form exists precisely for this, and the same pattern applies to foreign keys. `NOT VALID` means new rows are checked while existing ones are not, so the constraint is enforced going forward from the first statement and verified for history by the second.'),
    p('One subtlety: a validated check constraint is not the same thing as a real `NOT NULL` on the column, and the planner does not use it identically. On recent Postgres you can promote it — adding `SET NOT NULL` afterwards will use the existing validated constraint as proof and skip the full scan. On older versions, live with the check constraint; the enforcement is the same even if the column definition looks different.'),
    p('Before either step, the backfill has to be complete. A validation that fails leaves the constraint in place but unvalidated, which is a confusing state to find later — it enforces on writes and silently admits that history was never checked.'),

    h2('How do you split a table without downtime?'),
    p('The same pattern, over a longer period, and it is the case where dual-writing stops being optional bookkeeping and becomes the whole mechanism.'),
    p('Say a `users` table has accumulated twenty columns of billing detail that belong in their own table. The direct version is a migration that creates the new table, copies the data and drops the columns — and it is wrong for the usual reason plus a new one: the copy is not instantaneous, so rows written during it are missed.'),

    h3('Write to both, read from the old'),
    p('Deploy code that writes billing fields to both places on every mutation. Now the new table is correct for everything written from this point forward, and the only gap is history. Nothing reads the new table yet, so a bug in this deploy is invisible to users.'),

    h3('Backfill history in batches, then reconcile'),
    p('Copy the old rows in chunks, then run a comparison query that counts mismatches between the two representations. That count reaching zero and staying zero for a day is the actual signal that it is safe to proceed — not the backfill job reporting success, which only says it finished.'),
    code('sql', `
-- The check that decides whether the next deploy is safe.
select count(*) from users u
left join billing_profiles b on b.user_id = u.id
where u.billing_email is distinct from b.email;
`),

    h3('Flip reads behind a flag, not a deploy'),
    p('Reading from the new table should be a flag rather than a release, so it can be turned off in seconds without a rollout. Enable it for internal accounts, then a percentage, then everyone — and if the numbers on a dashboard shift, the flag goes back off while you find out why.'),

    h3('Only then stop dual-writing'),
    p('Remove the writes to the old columns one deploy after reads have been fully migrated and stable. Drop the columns days after that. The whole sequence is four or five deploys spread over a week or two, and at every single point rolling back one version is safe.'),
    img('table-split', 'Data flowing to two destinations simultaneously, with the read path moving between them separately', 'Dual-write first, backfill second, move reads third. The reconciliation count is what says the third step is safe.'),

    h2('How do you know a migration is safe before running it?'),
    p('By running it against production-shaped data, which is exactly what [database branching](/blog/neon-database-branching) is for.'),
    p('A migration reviewed as a diff is reviewed on how it reads. A migration run against a branch of production produces a duration, a lock report and a query plan, and those three things answer the question the diff cannot.'),

    h3('Measure the lock, not just the time'),
    p('A migration that takes eight seconds is fine if it took a share lock and irrelevant if it took an exclusive one. Query `pg_locks` during the run on a branch, or simply run a concurrent write in another session and see whether it blocks — the crude test is the reliable one.'),

    h3('Add a linter to CI'),
    p('Tools that parse migration files and flag the dangerous forms catch the majority automatically. A check that fails a pull request containing `CREATE INDEX` without `CONCURRENTLY` is worth more than any amount of documentation, for the same reason [CI gates beat conventions](/blog/ci-pipeline-typecheck-tests) generally.'),

    h3('Write the rollback before you need it'),
    p('Not every migration is reversible, and the ones that are not should say so explicitly. What matters more is that the *deploy* is reversible: with expand-and-contract, rolling the application back one version always lands on code compatible with the current schema, which is the property that makes an incident recoverable in a minute rather than an hour.'),
    img('branch-check', 'A proposed schema change measured in an isolated copy, producing a duration and a lock reading', 'The diff says what the statement is. The branch says how long it took and what it blocked.'),

    h2('What about migrations that run on deploy?'),
    p('Run them as a separate step that completes before the new code starts, and never as part of application boot.'),
    p('A migration in an application\'s startup path runs once per container. With three replicas rolling, that is three concurrent attempts at the same migration, and whether that is safe depends entirely on whether your tool takes an advisory lock. Some do. Relying on it is a decision, not a default.'),
    code('yaml', `
# Migrate once, as its own job, then roll the deployment.
- name: migrate
  run: npx prisma migrate deploy       # advisory-locked, exits non-zero on failure
- name: deploy
  needs: migrate
  run: ./deploy.sh
`),

    h3('The migration must be compatible with the old code'),
    p('This is the rule that makes the ordering work. Because migrations run before the new code, the schema they produce is briefly serving requests from the *previous* version — so every migration must be backward compatible with the code already running. Expand-and-contract gives you this by construction; a rename does not.'),

    h3('Long migrations do not belong in the deploy pipeline'),
    p('A backfill over ten million rows should be a job you start deliberately and can monitor, not a step that holds a deployment for forty minutes and times out the pipeline. Ship the schema change in the deploy, run the backfill separately, and gate the code that depends on it behind [a flag](/blog/feature-flags-simple) until the backfill reports complete.'),
    img('deploy-order', 'A sequence where a schema step completes before a code rollout begins', 'Migrate, then roll. Which means every migration must be compatible with the code already running.'),

    h2('What does this look like on a small project?'),
    p('Lighter, and it is worth saying so rather than pretending every project needs the full pattern.'),
    p('With no traffic and a single container, a rename in one migration is genuinely fine — there is no rolling window and nobody is served an error. The threshold is not team size or table size; it is whether two versions of the code can be live at once, and whether a request failing during the deploy matters to anyone.'),
    ul([
      '**Pre-launch, single instance:** change things directly. The ceremony buys nothing.',
      '**Live with real users, rolling deploys:** expand and contract for anything that removes or renames.',
      '**Large tables regardless of traffic:** always the non-blocking forms, because a lock does not care how many users are watching.',
    ]),
    p('The mistake in both directions is applying one rule everywhere. Full ceremony on a pre-launch project slows work down for no benefit; a direct rename on a live product with rolling deploys produces an outage that is entirely avoidable and completely predictable.'),
    quote('The safe migration is not the careful SQL. It is the one where rolling the application back does not require rolling the database back too.'),

    h2('What do you do when one goes wrong?'),
    p('Roll the code, not the schema, and that is only possible if the schema change was additive.'),
    ol([
      '**Stop the bleeding.** Roll the application to the previous version. With expand-and-contract this is always safe, which is the entire reason for the pattern.',
      '**Do not reverse the migration under pressure.** A down-migration on a live database, written months earlier and never tested, is a second incident on top of the first.',
      '**If the migration is still running, kill it deliberately.** Cancel the backend rather than restarting the database — a cancelled statement rolls back cleanly, and a restarted instance has to recover.',
      '**Then diagnose.** With traffic served by the old version and the schema still additive, there is no clock running.',
    ]),
    p('The point of the ordering is that step one restores service without touching the database at all. Every incident where the first move was "revert the migration" took longer than it needed to, because reversing schema changes on a live system under time pressure is where second mistakes come from.'),

    h2('Conclusion'),
    p('Set `lock_timeout` at the top of every migration. It is one line and it converts the worst outcome — a migration silently queueing all traffic behind itself — into a failed job you retry.'),
    p('Learn which statements rewrite the table and which do not. Adding a nullable column or one with a constant default is safe at any size; changing a type, adding a volatile default, or setting NOT NULL directly are not, and each has a two-step form that is.'),
    p('Never rename or drop in place while two versions of your code can be live. Add the new thing, backfill in batches, move reads, stop writing the old thing, and drop it days later — three or four deploys for what looks like one line, and no moment where deployed code and deployed schema disagree.'),
    p('Run migrations as their own step before the new code rolls, which means every migration must be compatible with the version already running. Keep long backfills out of the pipeline entirely and gate the dependent code behind a flag until they finish.'),
    p('Then verify against a branch with production volume rather than reviewing the diff, and add a CI linter for the dangerous forms so the rule is enforced rather than remembered. And scale the ceremony honestly: a pre-launch project with one container should just change the column. If you have a schema change coming up on something live and want it reviewed before it runs, [that is a short conversation](/start).'),
  ),
  faqs: faq([
    ['What makes a database migration cause downtime?',
     'Either the statement takes a lock that queues every other query behind it, or the deployed code and the deployed schema disagree during a rolling release. They are separate problems: the first is fixed with non-blocking SQL forms, the second only by deploying additive changes in stages.'],
    ['Is adding a column with a default safe on a large table?',
     'With a constant default, yes on Postgres 11 and later — the default is stored as metadata rather than written into every row. With a volatile default such as a function call, no: that rewrites the entire table under an exclusive lock and needs backfilling in batches instead.'],
    ['How do you rename a database column without downtime?',
     'You do not rename it. Add the new column, write to both while reading the old, backfill existing rows in batches, flip reads to the new column, stop writing the old one, then drop it days later. A rename is atomic in the database and gradual across a rolling deploy.'],
    ['Should migrations run automatically on deploy?',
     'As a separate step that completes before the new code starts, yes. Never inside application startup, where each replica runs it concurrently. Keep long backfills out of the pipeline entirely — run them as a monitored job and gate the dependent code behind a flag.'],
  ]),
};
