import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/staging-environment/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-staging-environment',
  slug: 'staging-environment',
  title: 'The Staging Environment Is Not Optional',
  category: 'fullstack',
  order: 36,
  readTime: '12 min read',
  date: 'January 2026',
  publishedAt: '2026-01-09',
  series: 'Every build',
  excerpt:
    'What shipping straight to production actually costs, and the twenty minutes of setup that prevents it.',
  coverLabel: 'Staging — cover',
  body: body(
    p('Staging gets cut from small projects because it looks like infrastructure for teams. One developer, one client, one site — why maintain two of everything?'),
    p('The answer is that the failures it catches are not team-coordination failures. They are the ones where a migration locks a table, an environment variable was never set outside your laptop, or a third-party integration behaves differently against real credentials. None of those need a team to happen, and all of them are worse on a live site.'),
    p('It is one of [the eight things I set up on every build](/stack) whether or not anyone asks, and it takes about twenty minutes.'),

    h2('What does staging actually catch?'),
    p('A specific and predictable set of failures, all of which are invisible on a development machine.'),
    table('Failures by where they surface', [
      ['Failure', 'Caught locally?', 'Caught in staging?', 'Cost in production'],
      ['Broken migration', 'Sometimes', 'Yes', 'Hours of downtime'],
      ['Missing environment variable', 'No', 'Yes', 'Immediate outage'],
      ['Third-party config wrong', 'No', 'Usually', 'Silent data loss'],
      ['Build succeeds, runtime fails', 'Rarely', 'Yes', 'Broken deploy'],
      ['Slow query on real data volume', 'No', 'Often', 'Degraded service'],
      ['Email or webhook misconfiguration', 'No', 'Yes', 'Silent, found later'],
    ]),
    p('The pattern is that local development lies about anything environmental. Your machine has every variable set because you set them months ago and forgot. Your database has forty rows. Your integrations point at sandbox accounts configured by hand.'),
    p('Staging is the first place the application runs as a deployed thing rather than as a process on your laptop, and that transition is where a specific class of bug lives.'),
    p('The last row of that table is worth dwelling on, because it is the one that fails most quietly. Email and webhook misconfiguration produces no error anywhere — the send succeeds, the request returns two hundred, and the message simply never arrives at a human. Without an environment where you can trigger it deliberately and confirm receipt, the first evidence is a customer asking why they never got a password reset, weeks after it stopped working.'),
    img('what-staging-catches', 'Two similar structures, one on a plain plinth and one on a marked test plinth', 'The first place it runs as a deployed thing rather than a process on your laptop.'),

    h2('Why is local development not enough?'),
    p('Because the differences that matter are not the ones you notice.'),
    p('The obvious ones — different operating system, different Node version — are largely solved by containers and version pinning. The ones that persist are subtler: file paths that resolve differently once bundled, environment variables read at build time rather than runtime, and anything depending on the deployment platform\'s behaviour rather than your framework\'s.'),
    p('This project has a documented instance of exactly that. A build-time check for whether a file exists in `/public` used `import.meta.url`, which is correct locally and wrong once components are bundled, because the module ends up somewhere else in the output tree. It worked in development every single time and failed only in a real build, for only some components.'),
    p('No amount of local testing surfaces that, because locally the module is where you think it is. A deployed environment is the only place the assumption gets tested.'),

    h2('How closely should staging mirror production?'),
    p('The same code path, the same platform, the same build command. Not necessarily the same scale.'),

    h3('Must match'),
    p('Runtime and platform, the build command, the deploy mechanism, and the shape of the environment configuration. If production is a static build on Cloudflare Pages, staging must be too — a staging environment running a dev server proves nothing about the build.'),

    h3('Should match'),
    p('Third-party services in test mode, the same database engine and version, the same storage arrangement. Stripe in test mode is a genuinely different code path from no Stripe at all.'),

    h3('Does not need to match'),
    p('Scale, instance size, CDN configuration, and cost. A staging database on the smallest tier is fine; it is a functional check rather than a load test.'),

    h3('Must not match'),
    p('Credentials, and anything that sends. Staging must not share production API keys, must not send email to real addresses, and must not process real payments. The most common staging incident is a test run emailing every customer in a copied database.'),

    h2('How do you get realistic data safely?'),
    p('This is the part people get wrong, and the wrong version creates a bigger problem than it solves.')
    ,
    p('Copying the production database into staging gives perfect realism and a second copy of every customer\'s personal data in an environment with weaker access controls and no audit trail. That is a data-protection problem, and "it is only staging" is not a defence anyone has successfully used.'),
    p('Three approaches, in the order I reach for them.'),
    ol([
      '**Generated seed data** shaped like production — the same relationships, the same rough volumes, entirely synthetic. Safe, repeatable, and it will not contain the edge cases that break things.',
      '**Anonymised copy** — a real dump with names, emails and payment references replaced deterministically. Realistic structure, real volumes, no real people. This is the best general answer and it costs a script.',
      '**A database branch** for a specific investigation, torn down afterwards. This is where [Neon branching](/blog/supabase-vs-neon-clerk) is genuinely useful: a copy of production data for an hour, in an environment nobody else touches, gone when finished.',
    ]),
    p('Whichever you choose, the anonymisation must be deterministic — the same input producing the same fake output — or every refresh breaks whatever you were comparing against.'),
    img('data-approaches', 'Three data containers of decreasing fidelity, the middle one marked as transformed', 'Anonymised is usually right. A raw copy is a second database of personal data with weaker controls.'),

    h2('How do you keep credentials separate?'),
    p('Different values for every secret, and a hard guard against the ones that reach the outside world.')
    ,
    p('Separate API keys per environment is the baseline, and most services support test modes that make this easy. The riskier category is anything that sends or charges: email, SMS, payments, webhooks to a client\'s system.'),
    p('For those, a guard in the code is worth more than discipline. An email sender that refuses to deliver to addresses outside an allowlist unless the environment is production turns "somebody restored a dump and ran a job" from an incident into a log line.'),
    code('ts', `
// The guard is in the sender, not in every caller. One place to be right.
export async function send(to: string, template: Template) {
  if (env.NAME !== 'production' && !ALLOWED.some((d) => to.endsWith(d))) {
    logger.info({ to, template: template.id }, 'suppressed: non-production');
    return { suppressed: true };
  }
  return resend.emails.send(/* … */);
}
`),
    p('The same logic applies to outbound webhooks and any scheduled job that touches a third party. The rule is that the environment check lives in the one function that does the sending, because a rule enforced per caller will eventually meet a caller that forgot.'),

    h2('Who should have access?'),
    p('The client, and it is worth being deliberate about this rather than treating staging as a developer tool.')
    ,
    p('Staging is where the review step of [the process](/services) actually happens. "We review together" means the client looks at the working application before it is live, and that requires somewhere they can reach that is not production.'),
    p('It also changes the quality of feedback. A client reviewing a deployed environment on their own phone finds things that a screenshare never surfaces — a form that is awkward on their device, a flow that does not match how they actually work.'),
    p('Put basic authentication in front of it and add `noindex`, so it is reachable without being public. A staging site indexed by Google competes with production for the same content, which is a self-inflicted problem that takes weeks to unwind.'),

    h2('Where does staging fit in the pipeline?'),
    p('Between the pull request and production, and it should be automatic.'),
    ol([
      '**Pull request** — CI type-checks, tests and builds. A preview deploy per branch if the platform offers one.',
      '**Merge to main** — deploys to staging automatically. No manual step, because a manual step is a step that gets skipped.',
      '**Verify** — the checklist below, on staging.',
      '**Promote** — deploy the same commit to production.',
    ]),
    p('The important property is that production deploys the same artefact that was verified, not a rebuild from the same source. A rebuild can differ — a dependency resolved differently, a build-time variable read from a different place — and then staging verified something that is not what shipped.'),
    p('Preview deploys per pull request are a useful addition and not a replacement. They are ephemeral and usually lack a real database, so they answer "does this render" rather than "does this work".'),
    p('Rollback deserves the same treatment as deploy. Knowing that you can return to the previous version in one action, and having done it at least once deliberately, changes how a bad release feels — from an emergency requiring a fix under pressure to a decision you can take calmly and then investigate. Most platforms make this a single click, and most teams have never tried it, which means they discover the caveats during an incident.'),
    p('The caveat that catches people is that code rolls back and data does not. A release that ran a migration cannot simply be reverted, because the previous code does not know about the new column. That is the practical argument for [expand-and-contract migrations](/blog/database-design-for-v2): each deploy stays compatible with the one before it, so rollback remains available for the window where you might actually need it.'),

    h2('What do you actually check on staging?'),
    p('A short list, run before every release, that takes about five minutes.'),
    ul([
      '**The critical path end to end** — signup, the main workflow, and payment if there is one. Actually click it.',
      '**The migration ran**, and the new column contains what it should for existing rows rather than only for new ones.',
      '**Anything environmental** — a form that sends, a webhook that fires, a file that uploads.',
      '**The error tracker received something**, by deliberately triggering an error. A silent error tracker in production is indistinguishable from one that is broken.',
      '**The page you changed**, on a phone, at the width you did not test locally.',
    ]),
    p('Five minutes, and it catches the failure modes in the first table. Written down, because a checklist in someone\'s memory degrades under deadline pressure exactly when it matters.'),
    img('release-checklist', 'A short sequence of check marks along a path before a final gate', 'Five minutes before every release. Written down, because memory degrades under pressure.'),

    h2('How do you keep staging from rotting?'),
    p('A broken staging environment is worse than none, because the team learns to skip it and the pipeline acquires a step everyone routes around. Four things keep it honest.'),

    h3('Refresh the data on a schedule'),
    p('Data drifts. Rows accumulate, test bookings pile up, and after a few months staging resembles nothing. A weekly job that resets it from the anonymised source keeps it representative and takes the decision out of anyone\'s hands.'),

    h3('Deploy to it on every merge, without exception'),
    p('Automatic is the whole point. The moment deploying to staging is a manual step, it becomes the step that gets skipped when a release is urgent, which is precisely when the check matters most.'),

    h3('Treat a broken staging as a broken build'),
    p('If staging is down, that is a stop-work condition rather than an inconvenience to work around. Otherwise it degrades into a permanently broken environment nobody trusts, and the fix keeps being deferred because nothing depends on it.'),

    h3('Keep its configuration in the repository'),
    p('Environment variables, redirects and headers should be committed rather than clicked into a dashboard. A staging environment configured by hand drifts from production in ways nobody can see, and eventually verifies something production does not do.'),
    img('keeping-honest', 'A maintained duplicate structure beside a neglected one, the maintained one intact', 'A broken staging environment is worse than none. People learn to route around it.'),

    h2('What about database migrations specifically?'),
    p('The single highest-value thing staging checks, and worth calling out separately because the failure is so expensive.'),
    p('A migration that works against forty local rows can lock a table for minutes against a hundred thousand. Adding a column with a default, changing a type, or creating an index without the concurrent option all take locks that are imperceptible locally and are an outage in production.'),
    p('Staging with production-shaped volumes surfaces the duration. It will not perfectly predict production timing, but the difference between "instant" and "forty seconds" is exactly the signal you need, and it is the difference between deploying normally and scheduling a window.'),
    p('The related check is that the backfill worked. A migration adding a column typically also populates it for existing rows, and it is common for the new code to be correct for new records and wrong for old ones. On staging with real-shaped data that shows up immediately; on a fresh local database there are no old rows to be wrong about.'),
    p('Where the platform supports it, reviewing the migration against [a database branch](/blog/database-design-for-v2) during the pull request is better still — it catches the problem before merge rather than after.'),
    img('migration-check', 'A structural change being applied to a populated form rather than an empty one', 'Forty local rows will not show you the lock. A hundred thousand will.'),

    h2('What does it cost to run?'),
    p('Usually nothing, which removes the last argument against it.'),
    p('On the [landing template](/blog/project-stack-templates) it is a second static deploy — free on Cloudflare Pages. On the web app template it is a second Vercel project and a small database, both of which sit inside free tiers at staging volumes.'),
    p('Where a cost does appear it is a few dollars a month for a small database instance. Against a single production incident caused by an untested migration, that is not a comparison worth making.'),
    p('The real cost is maintenance: keeping staging working. A broken staging environment is worse than none, because people learn to skip it and then the deploy pipeline has a step everyone routes around.'),

    h2('When is staging genuinely unnecessary?'),
    p('Two cases, both narrower than the ones people invoke.'),
    p('**A pure static site with no backend, no forms and no build-time data fetching.** A personal page that is HTML and CSS. Even here, a preview deploy costs nothing and catches the build that succeeded locally and failed on the platform.'),
    p('**A project that has genuinely never deployed.** Before there is a production environment, staging is production. Set it up when the first real deploy happens, not before.'),
    p('What does not qualify: "it is a small project", "it is just me", "we are moving fast". Those are the circumstances in which an untested migration is most likely, because there is nobody else to catch it.'),
    quote('Every argument for skipping staging is an argument about the size of the team. Every failure it catches is about the difference between a laptop and a deployed environment.'),

    h2('Conclusion'),
    p('Set up a second deploy of the same code, on the same platform, with its own credentials and its own database. Seed it with anonymised or generated data, never a raw production copy. Put basic auth and `noindex` in front of it, and give the client access.'),
    p('Deploy to it automatically on merge, run a five-minute checklist, then promote the same artefact to production rather than rebuilding. Guard anything that sends or charges inside the function that does it, so a stray job in a non-production environment is a log line rather than an incident.'),
    p('Twenty minutes to set up, close to nothing to run, and it catches the specific class of failure that only appears once code is deployed. That is not infrastructure for teams — it is the difference between finding a broken migration on a URL nobody uses and finding it on the one your client is looking at.'),
    img('two-urls', 'Two identical structures, one behind a marked barrier and one open', 'The same failure, found on a URL nobody uses instead of the one your client is looking at.'),
    p('The one habit that makes all of it work is refusing to let staging be optional under pressure. Every argument for skipping it arrives at the same moment — a client waiting, a fix that is obviously safe, a Friday afternoon — and that moment is precisely when the checklist earns its cost. A process that holds only when nothing is urgent is not a process; it is a preference that has never been tested.'),
    p('If you take one thing from this, make it the automatic deploy on merge. Everything else here degrades gracefully — imperfect seed data is still useful, a partial checklist still catches things — but a staging environment that requires somebody to remember to deploy to it will quietly stop being deployed to, and nobody will notice until the day it would have mattered.'),
  ),
  faqs: faq([
    ['Do small projects really need a staging environment?',
     'Yes, because the failures it catches are environmental rather than about team coordination. Broken migrations, missing environment variables and third-party misconfiguration all happen to solo developers, and on a small project there is nobody else to catch them.'],
    ['How do you seed staging with realistic data safely?',
     'Use an anonymised copy — a real dump with names, emails and payment references deterministically replaced — or generated data shaped like production. Copying the production database raw creates a second store of personal data in an environment with weaker controls.'],
    ['Should staging be indexed by Google?',
     'No. Put basic authentication in front of it and add a noindex header. An indexed staging site competes with production for the same content, which is a self-inflicted duplication problem that takes weeks to unwind once it is in the index.'],
    ['What is the difference between staging and preview deployments?',
     'Preview deploys are ephemeral, per branch, and usually lack a real database, so they answer whether something renders. Staging is persistent, has its own data and third-party configuration, and answers whether it works. They complement rather than replace each other.'],
  ]),
};
