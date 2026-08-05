import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/tested-database-backups/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-tested-database-backups',
  slug: 'tested-database-backups',
  title: 'Automated Backups With a Restore You Have Actually Tested',
  category: 'fullstack',
  order: 38,
  readTime: '12 min read',
  date: 'January 2026',
  publishedAt: '2026-01-14',
  series: 'Every build',
  excerpt:
    'An untested backup is not a backup. The restore drill that takes an hour and the failure it prevents.',
  coverLabel: 'Backups — cover',
  body: body(
    p('Almost every project has backups. Managed databases take them automatically, the dashboard shows a green tick, and the box is ticked on whatever checklist prompted the question.'),
    p('Far fewer have ever restored one. That distinction only matters on a single day, and on that day it is the only thing that matters — because a backup you have never restored is a file you believe in rather than a recovery you can perform.'),
    p('This is what "tested" means concretely, why the drill takes about an hour, and what it reliably surfaces the first time anybody runs it.'),

    h2('Why is an untested backup not a backup?'),
    p('Because "a backup exists" and "we can be running again from it" are different claims, and only the second is useful.'),
    p('The gap between them is full of things nobody discovers until they try. The dump excludes a schema. The restore needs an extension the new instance does not have. The file is encrypted with a key stored only in the environment that is gone. The credentials for the storage bucket were on the machine that died.'),
    p('None of those are exotic. They are the ordinary result of a backup process that was configured once and never exercised, and every one of them turns a two-hour recovery into a day.'),
    p('The honest framing is that an untested backup is a hypothesis. It is probably true, it has never been checked, and the checking costs an hour on a calm afternoon rather than an unknowable number of hours during an incident.'),
    img('hypothesis', 'A sealed container beside an opened one with contents verified on a surface', 'A backup you have never restored is a hypothesis, not a recovery.'),

    h2('What should actually be backed up?'),
    p('More than the database, and the extras are the ones people notice missing halfway through a restore.'),
    table('What to back up, and how often', [
      ['Data', 'Frequency', 'Retention', 'Restore tested'],
      ['Primary database', 'Daily plus point-in-time', '30 days', 'Quarterly'],
      ['Uploaded files (R2/S3)', 'Daily or versioned', '30 days', 'Quarterly'],
      ['Environment configuration', 'On change', 'Indefinite', 'On change'],
      ['CMS content', 'Daily', '14 days', 'Quarterly'],
      ['Infrastructure definitions', 'In git', 'Indefinite', 'On change'],
    ]),
    p('Environment configuration is the one most often missed and the most annoying to reconstruct. A restored database in a new project with none of the API keys, redirect rules or webhook secrets is not a working application, and rebuilding that from memory during an incident is where hours disappear.'),
    p('Uploaded files matter more than people assume. A database restore that leaves every document, avatar and attachment pointing at objects that no longer exist is a half-recovery, and users experience it as broken.'),

    h2('What does the restore drill involve?'),
    p('Restoring to a fresh environment, pointing an application at it, and confirming the data is genuinely there. About an hour, and it should be done from the documentation rather than from memory.'),
    ol([
      '**Take the most recent backup**, as an ordinary user would — not with special access you happen to have.',
      '**Restore into a new, empty instance.** Never over the top of anything real, and never into staging without warning, since it will destroy whatever is there.',
      '**Point an application at it** and start it. This catches missing extensions, permission problems and schema mismatches immediately.',
      '**Verify content, not just structure.** Row counts on the main tables, and open a handful of records to confirm they contain what they should.',
      '**Check the files too.** Pick three records with attachments and confirm those objects resolve.',
      '**Write down how long it took**, and every step that was not already in the runbook.',
    ]),
    p('That last step is the deliverable. The drill produces a runbook that somebody else could follow under pressure, and the value of the exercise is mostly in discovering which steps were living in your head.'),
    p('Two numbers are worth writing down explicitly, because they are the ones a client will ask about and the ones that turn a vague reassurance into a commitment. How much data would be lost in the worst case — the gap between the incident and the last recoverable point — and how long being unavailable would last. With point-in-time recovery the first is usually a minute or two; without it, up to a full day.'),
    p('Both numbers are decisions rather than facts. If a day of lost data is unacceptable for the business, that is an argument for point-in-time recovery rather than something to discover afterwards. Stating them before an incident is what makes the backup strategy a deliberate choice instead of whatever the defaults happened to be.'),

    h2('What does the first drill usually find?'),
    p('Consistently the same handful of things, in my experience, and none of them announce themselves beforehand.'),

    h3('Something was never included'),
    p('A schema outside the default, a sequence that did not reset, an extension the application depends on. The dump completed successfully and quietly omitted something.'),

    h3('The restore needs privileges you did not plan for'),
    p('Creating extensions frequently requires elevated rights. On a managed platform that may mean the restore only works through their tooling, which is fine to know and expensive to discover on the day.'),

    h3('It takes far longer than expected'),
    p('A database that dumps in four minutes may restore in forty, because index rebuilding dominates. If your recovery expectation was "about ten minutes", that is a useful correction to receive calmly.'),

    h3('The credentials are somewhere fragile'),
    p('Backup storage keys in one person\'s password manager, or in an environment variable on the server being restored. Circular dependencies like this are obvious in hindsight and invisible until tested.'),
    img('first-drill', 'Four small faults revealed on an otherwise sound structure under inspection', 'The same handful of findings every time, and none of them announce themselves in advance.'),

    h2('How often should you test it?'),
    p('Quarterly for most projects, and after any change to the database, the platform or the backup configuration.'),
    p('Quarterly is frequent enough that the runbook stays accurate and infrequent enough that nobody resents it. The more important trigger is change: a Postgres major version upgrade, a move between providers, or a new extension all invalidate a previously successful drill.'),
    p('Where the platform supports database branching, the drill becomes cheap enough to do more often. Creating a branch from a point in time and pointing an application at it is minutes rather than an hour, which is [one of the quieter arguments for Neon](/blog/supabase-vs-neon-clerk) — not the branching-per-pull-request use everyone mentions, but recovery rehearsal.'),

    h2('What is point-in-time recovery?'),
    p('The ability to restore to any moment within a window, rather than to whenever the last snapshot happened.'),
    p('It matters because the damage you most want to undo is usually not a server failing. It is a bad migration at 14:32, or a script that deleted the wrong rows, and a nightly snapshot from 02:00 loses everything since.'),
    p('With point-in-time recovery you restore to 14:31 and lose ninety seconds. Most managed Postgres providers include it with a retention window of a week or more, and it is worth confirming it is actually enabled rather than assuming — it is occasionally a paid tier or an opt-in setting.'),
    p('It does not replace snapshots. A retained snapshot protects against damage discovered after the recovery window has passed, which is common with subtle data corruption that nobody notices for a fortnight.'),

    h2('Where should backups live?'),
    p('Somewhere the loss of your main account does not take with it.'),
    p('Provider-managed backups are the baseline and they share a failure domain with the thing they protect. An account suspended, credentials compromised, or a region-wide incident affects both. That is an unlikely scenario and it is the scenario backups exist for.'),
    p('For anything holding meaningful business data, a periodic copy to separate object storage under a different provider is worth the small effort. Weekly is usually enough, since the provider backups cover the common cases and this covers the uncommon one.'),
    p('Encrypt it, and store the key somewhere other than the environment being backed up. An encrypted archive whose key lived in the deleted project is an expensive lesson in circular dependencies.'),
    img('separate-domain', 'Two storage containers in visibly separate enclosures, one connected by a thin link', 'Provider backups share a failure domain with the thing they protect.'),

    h2('What about personal data in backups?'),
    p('Backups are copies of production data and carry the same obligations, which is easy to forget when they are invisible.'),
    p('Two practical consequences. Retention should be bounded rather than indefinite — keeping every backup forever means holding personal data long after any legitimate need, and a fixed window is both simpler to defend and easier to reason about.'),
    p('And deletion requests interact awkwardly with backups. A user deleted from production still exists in every retained backup, and most positions accept that provided backups are not used for ordinary access and the record disappears as the window rolls forward. What matters is having a stated position rather than discovering the question during an audit.'),
    p('The related habit is not restoring production backups into environments with weaker controls, which is the same reasoning that keeps [staging on anonymised data](/blog/staging-environment).'),

    h2('How do you back up uploaded files?'),
    p('Differently from the database, because copying the whole bucket nightly is wasteful and unnecessary.'),
    p('Object storage generally offers versioning, which keeps previous copies when an object is overwritten or deleted. Enabling it, with a lifecycle rule expiring old versions after thirty days, covers accidental deletion and overwriting at close to no cost.'),
    p('For cross-provider redundancy, a scheduled sync to a second bucket elsewhere. This is a job on the [background worker](/blog/project-stack-templates) rather than anything sophisticated, and weekly is usually sufficient.'),
    p('The check that matters during a drill is referential: after restoring the database, pick records with attachments and confirm the objects they point at resolve. A file backup that is technically complete but keyed differently from what the database expects is a restore that produces broken links everywhere.'),

    h2('What are you actually recovering from?'),
    p('Naming the scenarios is useful, because they need different things and a backup strategy tuned for one is frequently useless for another.'),

    h3('Human error'),
    p('By far the most common, and it looks like a script run against the wrong environment, a migration that dropped a column, or a delete without a where clause. Recovery needs point-in-time restore to a few minutes ago, not last night\'s snapshot.'),

    h3('Application bugs corrupting data slowly'),
    p('The nastiest category, because the damage is discovered long after it started. A calculation writing wrong values for three weeks cannot be fixed by restoring, since restoring loses three weeks of legitimate work. What you need here is a retained older snapshot to compare against, so you can identify what changed and repair selectively.'),

    h3('Infrastructure failure'),
    p('Rare on managed platforms and the one everyone pictures. Provider backups handle it well, which is why it is the least interesting scenario despite being the one that justifies the budget.'),

    h3('Account or access loss'),
    p('Credentials compromised, an account suspended, a payment method failing while nobody is watching. This is the only scenario where a copy outside the provider matters, and it is the reason that copy exists despite the others not needing it.'),
    p('Notice that the two most likely scenarios — human error and slow corruption — are both about time rather than about hardware. That is why point-in-time recovery and retained snapshots matter more than redundancy, which is the opposite of the intuition most people start with.'),
    img('four-scenarios', 'Four differently shaped faults approaching a single protected store', 'The likely scenarios are about time, not hardware. That inverts what the strategy should optimise for.'),

    h2('How do you know a backup succeeded?'),
    p('Not by the absence of an error, which is how most teams currently know.'),

    h3('Alert on absence, not on failure'),
    p('A backup job that stops running produces no failure notification, because nothing ran to fail. The check that catches it is one asserting a recent backup exists — if the newest is older than expected, something is wrong even though nothing errored.'),

    h3('Check the size, not just the timestamp'),
    p('A dump that completes in two seconds and produces a forty-kilobyte file is a successful backup of almost nothing. Comparing size against the previous run catches a misconfigured job that is technically working and capturing an empty schema.'),

    h3('Restore automatically where you can'),
    p('The strongest version of this is a scheduled job that restores the latest backup into a scratch instance, runs a few row counts, and reports. That turns the quarterly drill into a continuous check, and it is not much more work than the alerting above.'),
    p('This is the same principle as [monitoring uptime rather than only tracking errors](/blog/staging-environment): the failures that hurt most are the ones producing silence rather than noise, and silence has to be checked for deliberately.'),
    img('silent-failure', 'A sequence of regular markers with one absent, the gap highlighted', 'A job that stops running raises no error. Alert on absence, not on failure.'),

    h2('What does this cost?'),
    p('Almost nothing to run, and about an hour of attention per quarter.'),
    p('Managed database backups are included in nearly every plan. Object versioning costs the storage of the retained versions. A weekly cross-provider copy is a few pence at the volumes a small application produces.'),
    p('The genuine cost is the drill, and it is an hour by somebody who could otherwise be building something. Against a restore attempted for the first time during an incident — with a client waiting and every unknown surfacing at once — that hour is the best-value time in the whole operations budget.'),
    quote('The question is never whether backups exist. It is whether anyone has ever turned one back into a running system, and how long that took.'),

    h2('What should the runbook say?'),
    p('Enough that somebody who did not build the system could follow it while stressed. Short, specific, and stored somewhere reachable when the application is down.'),
    ul([
      '**Where backups live**, and how to get to them, including which account and which credentials.',
      '**The exact restore command**, with real values rather than placeholders.',
      '**What to do about files**, and how they relate to the database records.',
      '**Environment configuration** — where the variables are recorded and how to apply them to a new instance.',
      '**How long it took last time**, so expectations during an incident are calibrated.',
      '**Who to tell**, and what to say, because a client learning about an outage from you is a different conversation from one learning about it from their customers.',
    ]),
    p('It belongs in the repository and in [the handover document](/blog/project-stack-templates), not in a wiki behind the login of the system that is down. This sounds obvious and is the reason a surprising number of runbooks are unreachable during exactly the event they were written for.'),
    img('runbook', 'A short document card beside a set of labelled access keys', 'Reachable when the application is down. Otherwise it is a document about an incident, not for one.'),

    h2('Conclusion'),
    p('Enable automated database backups with point-in-time recovery, turn on versioning for uploaded files, and record environment configuration somewhere it survives the environment. That is the setup, and it is close to free.'),
    p('Then restore one. Into a fresh instance, from the documentation, with an application pointed at it and content actually verified. Write down what it took and everything the runbook was missing, and repeat it quarterly and after any platform change.'),
    p('The setup is not the work — the drill is, and it is an hour. It converts a green tick in a dashboard into a procedure you have performed, and those are different things on precisely the day it matters.'),
    p('There is a second benefit worth naming, because it arrives long before any incident. Having done a restore changes how you make decisions. A migration that felt risky becomes a migration with a known recovery path and a known recovery time, and that changes whether you deploy it on a Thursday or defer it for a fortnight. Teams that have never restored tend to accumulate deferred changes, because every one of them carries an unquantified risk.'),
    p('If you do nothing else from this post, do the drill once. Not the cross-provider copy, not the automated verification, not the runbook — just take today\'s backup, restore it somewhere empty, point something at it, and see what happens. Whatever you find in that hour is the thing that would otherwise have been found during an incident, and finding it now is the entire point.'),
  ),
  faqs: faq([
    ['How often should you test a database restore?',
     'Quarterly for most projects, and after any change to the database version, the platform or the backup configuration. Frequent enough to keep the runbook accurate, infrequent enough that nobody resents it. Where branching is available it is minutes rather than an hour.'],
    ['What is point-in-time recovery?',
     'The ability to restore to any moment within a retention window rather than to the last snapshot. It matters because the damage you most want to undo is usually a bad migration or a mistaken delete at a specific time, not a server failing overnight.'],
    ['Are managed database backups enough?',
     'For most failures, yes. They share a failure domain with the thing they protect, though — an account suspension or region-wide incident affects both — so anything holding meaningful business data deserves a periodic encrypted copy to separate storage under a different provider.'],
    ['How long should backups be retained?',
     'Bounded rather than indefinite. Thirty days covers the overwhelming majority of recovery needs, and keeping personal data forever creates an obligation with no corresponding benefit. Set a window, state it, and let the lifecycle rules enforce it.'],
  ]),
};
