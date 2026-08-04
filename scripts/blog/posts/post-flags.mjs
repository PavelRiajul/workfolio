import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/feature-flags-simple/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-feature-flags-simple',
  slug: 'feature-flags-simple',
  title: 'Feature Flags Without a Platform',
  category: 'fullstack',
  order: 45,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-29',
  series: 'Every build',
  excerpt:
    'Shipping unfinished work safely with a database table and twenty lines of code, before paying for a flag service.',
  coverLabel: 'Feature flags — cover',
  body: body(
    p('Feature flags are sold as an enterprise practice — experimentation platforms, targeting rules, percentage rollouts with statistical significance built in. All of which is real, and none of which is where the value starts.'),
    p('The value starts with a much smaller thing: being able to merge unfinished work without it being visible, and being able to turn something off without a deploy. Both are worth having on a project of one person, and both are about twenty lines of code.'),
    p('This is the version I put on projects before any platform is justified, and the signals that indicate one has become worth paying for.'),

    h2('Why bother on a small project?'),
    p('Because the alternative to a flag is a long-lived branch, and long-lived branches are where merge pain comes from.'),
    p('A feature taking three weeks on its own branch diverges from main every day. By the end the merge is a substantial event with genuine risk, and the temptation is to rush it because the branch has become uncomfortable to maintain.'),
    p('With a flag the same work merges daily, disabled, exercised by nothing. The code is in main, the tests run against it, and the divergence never accumulates. Turning it on becomes a separate, small decision made when it is ready rather than when the branch becomes unbearable.'),
    p('The second reason is the one you appreciate later: turning something off without a deploy. A feature causing problems at 9pm is a database update rather than a build, and that difference matters most at exactly the moment everything else is going wrong.'),
    p('There is a third that applies specifically to client work. A flag lets a client see something before anyone else does — enabled for their account alone, on production, with real data — which is a considerably better review than a screenshare or a staging environment full of invented records. It also means the review step of a project stops being a scheduled event and becomes something they can do whenever they have ten minutes, which materially improves how much feedback you get.'),
    img('branch-vs-flag', 'Two paths, one diverging steadily and one rejoining repeatedly', 'The flag is what lets the work merge daily instead of diverging for three weeks.'),

    h2('What is the simplest thing that works?'),
    p('A table, a lookup, and a cache. That is genuinely the whole implementation.'),
    code('ts', `
model FeatureFlag {
  key         String   @id           // 'new-checkout'
  enabled     Boolean  @default(false)
  description String
  // Optional targeting, added only when needed.
  orgIds      String[] @default([])
  percentage  Int?                   // 0-100, hashed on a stable id
  updatedAt   DateTime @updatedAt
}
`),
    p('The evaluation is equally unremarkable: load all flags once per request, or cache them for a minute, and check them synchronously. A flag lookup should never be an async call at the point of use, because that turns every conditional into something that can fail.'),
    code('ts', `
// Cached for 60s. A flag change taking a minute to propagate is fine;
// a flag lookup that can throw in the middle of a render is not.
export function isEnabled(key: FlagKey, ctx: { orgId?: string; userId?: string }) {
  const flag = flagCache.get(key);
  if (!flag) return false;                    // unknown flag is always off
  if (flag.orgIds.includes(ctx.orgId ?? '')) return true;
  if (flag.percentage != null && ctx.userId)
    return bucket(ctx.userId, key) < flag.percentage;
  return flag.enabled;
}
`),
    p('Two decisions in there are worth making deliberately. An unknown flag returns false, so a typo hides a feature rather than exposing an unfinished one. And bucketing hashes a stable identifier with the flag key, so a user gets a consistent answer across requests and a different bucket per flag.'),

    h2('What kinds of flags are there?'),
    p('Four, and confusing them is the main source of flag debt.'),
    table('Flag types and their lifespan', [
      ['Type', 'Purpose', 'Lifespan', 'Remove after?'],
      ['Release', 'Hide unfinished work', 'Days to weeks', 'Always'],
      ['Experiment', 'Compare two variants', 'Weeks', 'Always'],
      ['Kill switch', 'Disable something expensive or fragile', 'Permanent', 'Never'],
      ['Permission', 'Plan or role gating', 'Permanent', 'Never'],
    ]),
    p('The top two must be removed and the bottom two must not. A codebase where all four are treated identically accumulates conditionals nobody dares delete, because it is no longer obvious which are temporary.'),
    p('The practical fix is naming them differently and recording intent. A release flag with a removal date in its description is a flag somebody will remove; one with no stated end is one that lives forever by default.'),
    p('Permission flags arguably are not flags at all — they are [entitlement](/blog/auth-billing-onboarding-mvp), and they belong in the plan definition rather than in a flag table. Keeping them separate stops the flag list becoming a second, competing source of truth about what a customer can do.'),

    h2('How do you do a percentage rollout?'),
    p('Hash a stable identifier with the flag key and compare against the threshold. No platform required.'),
    p('The stable part matters. Bucketing on something that changes between requests means a user seeing the new version, then the old, then the new — which is worse than either and produces support tickets nobody can reproduce.'),
    p('Including the flag key in the hash matters too. Without it, the same users land in the first bucket for every flag, so a small percentage rollout always tests on the same unlucky group and the results are correlated in ways nobody accounts for.'),
    code('ts', `
// Stable per (user, flag). Same user, same answer, forever.
function bucket(userId: string, flagKey: string) {
  const h = createHash('sha256').update(\`\${flagKey}:\${userId}\`).digest();
  return h.readUInt32BE(0) % 100;
}
`),
    p('For a genuine experiment rather than a cautious rollout, record which variant each user saw alongside the outcome you care about. Without that the comparison is an impression, which is the same failure as [measuring an AI change without an evaluation set](/blog/ai-evaluation-harness).'),
    p('A cautious rollout and an experiment are different activities worth keeping separate. A rollout goes 5%, 25%, 100% over a few days and the only question is whether anything broke — you are watching error rates, not conversion. An experiment holds two variants at 50% for long enough to reach significance and compares an outcome. Running the first while describing it as the second produces confident conclusions from a few hundred sessions, which is a good way to ship a change that made things worse.'),

    h2('How do you use flags on the front end?'),
    p('Evaluate on the server and send the result, rather than sending the flags and evaluating in the browser.'),
    p('Shipping the whole flag list to the client leaks the names of unreleased features, which is a minor confidentiality problem and a genuine competitive one for some products. It also means a curious user can flip a boolean in devtools and see something unfinished.'),
    p('Send only the resolved booleans the page needs. For a server-rendered application this is natural — the conditional runs at render and the client never knows a flag existed.'),
    p('The important corollary is that a flag hiding something in the interface is not access control. If a feature must not be used, the server has to refuse the action, not merely omit the button. That is the same distinction as [permission checks belonging on the server](/blog/multi-tenant-prisma-postgres), and flags make it easy to forget because hiding feels like preventing.'),
    img('server-evaluated', 'A decision point inside a boundary emitting a single resolved value outward', 'Send the answer, not the question. A hidden button is not a control.'),

    h2('How do you avoid flag debt?'),
    p('Treat a release flag as a task with an owner and a date, not as a configuration value.'),

    h3('Record why and until when'),
    p('Every temporary flag gets a description saying what it hides and roughly when it should go. A flag table with bare keys and no context is one nobody will ever confidently clean up.'),

    h3('Remove the flag in the same pull request as the cleanup'),
    p('When a feature is fully rolled out, deleting the conditional and the flag together is a small change. Deferring it means a codebase where the old path still exists, untested, until somebody eventually removes the wrong branch.'),

    h3('Audit quarterly, and be ruthless'),
    p('A short review of the flag list every few months. Anything at 100% for a month is removed. Anything at 0% for a month is either removed or was abandoned work that should also go.'),

    h3('Cap the number'),
    p('More than about a dozen temporary flags at once means each combination is untested, and the number of possible states is exponential. A hard limit is arbitrary and it forces the cleanup conversation, which is the point.'),
    p('The failure this prevents is a codebase where every function has three branches and nobody knows which are reachable. That is meaningfully worse than the long-lived branches flags were introduced to avoid.'),

    h2('How do you test code behind a flag?'),
    p('Both sides, deliberately, because the whole premise is that two paths exist simultaneously in production.'),

    h3('Parameterise the test over the flag'),
    p('Run the relevant tests with the flag on and off rather than picking one. It is usually a loop around an existing describe block, and it prevents the common failure where the new path is well tested and the old one silently rots while still serving most users.'),

    h3('Set flags explicitly in tests, never read them'),
    p('A test whose behaviour depends on the current database state is a test that changes meaning when somebody toggles a flag. Inject the flag state per test so the suite is deterministic regardless of what production is currently serving.'),

    h3('Test the default'),
    p('An unknown or unreachable flag should resolve to off. Assert that directly, because it is the behaviour protecting you during a database problem and it is otherwise never exercised.'),

    h3('Do not test every combination'),
    p('With eight flags there are two hundred and fifty-six states and testing them is neither possible nor useful. Test each flag independently and any pair that genuinely interacts — which should be a short list, and if it is not, that is a signal the flag count is too high.'),
    img('both-paths', 'Two parallel routes through a structure, both marked as verified', 'Both paths exist in production simultaneously. Both need to work.'),

    h2('What should the flag list look like to a human?'),
    p('Readable by somebody who did not create the flags, because in six months that includes you.'),
    p('The minimum useful view is a list showing the key, whether it is on, who it applies to, when it was last changed and what it is for. On a small project that is a page in the admin area or a well-formatted query — it does not need to be a product.'),
    p('What makes it useful is the description field being taken seriously. "new-checkout" tells a reader nothing; "New Stripe checkout flow, replacing legacy form. Remove after full rollout, target end of September" tells them whether they can delete it. The second takes ten seconds to write and is the difference between a list that gets cleaned up and one that accumulates.'),
    p('Recording who changed a flag and when is worth the extra column even without an audit requirement. During an incident, "this was toggled twenty minutes ago" is frequently the entire diagnosis, and reconstructing it from memory across two people is unreliable.'),
    img('readable-list', 'A short list of labelled entries with clear state indicators beside each', 'The description field is what makes the difference between a list you clean up and one you accumulate.'),

    h2('When is a platform worth paying for?'),
    p('Four signals, and none of them is "we have feature flags".'),
    ul([
      '**Non-engineers need to change them.** A product manager toggling a rollout without a deploy needs an interface, and building a decent one costs more than buying it.',
      '**You are running genuine experiments** with statistical significance rather than cautious rollouts. Doing that correctly is a real discipline and platforms encode it.',
      '**Audit requirements.** Regulated environments needing a record of who changed what, when, get that free from a platform and expensively from a table.',
      '**Many services need the same flags.** Consistent evaluation across several deployables is where a shared service earns its cost.',
    ]),
    p('Below those, a table is not a compromise. It is fewer moving parts, no additional latency, no external dependency in a request path, and no bill — which is the same reasoning that keeps [semantic search in Postgres](/blog/pgvector-semantic-search) until it genuinely outgrows it.'),

    h2('How do flags interact with the database?'),
    p('This is where the practice gets genuinely harder, and it is the part most introductions skip.'),
    p('Hiding a user interface behind a flag is easy, because the two paths share the same data. Changing what is stored is not, because the old code has to keep working for everyone still on the old path — and turning the flag off has to remain safe after new-shape data exists.'),
    p('The workable pattern is the same expand-and-contract sequence [schema changes already use](/blog/database-design-for-v2). Add the new column alongside the old, have the flagged path write both, and only remove the old one once the flag has been at 100% long enough that rolling back is no longer a consideration.'),
    p('What does not work is a flag guarding a destructive migration. Once a column is dropped, turning the flag off does not bring it back, and the toggle has become one-way while still appearing reversible — which is worse than having no flag, because it invites a rollback that will fail.'),
    p('The useful rule: a flag is only genuinely reversible if both paths can operate on the same data at the same moment. Where that is not true, it is a deploy sequence rather than a toggle, and calling it a flag misleads whoever reaches for it during an incident.'),
    img('flag-and-schema', 'Two operating paths drawing from one shared store, both connected', 'A flag is reversible only when both paths work on the same data. Otherwise it is a deploy sequence.'),

    h2('What breaks when flags go wrong?'),
    p('Three failure modes worth anticipating, because all three are quiet.'),

    h3('The stale cache'),
    p('A flag turned off during an incident that keeps serving for a minute is usually acceptable. One that keeps serving for an hour because the cache is longer than anyone remembers is not. Know the propagation time, and make it short for anything acting as a kill switch.'),

    h3('The flag that fails open'),
    p('If the flag lookup errors and the code treats that as enabled, an unfinished feature ships during a database blip. Default to disabled on every failure path, which is why the unknown-flag case returns false.'),

    h3('The untested combination'),
    p('Two flags each tested independently, never together, producing a state nobody anticipated. This is the strongest argument for keeping the count low, since the combinations grow far faster than the flags do.'),
    img('failure-modes', 'Three small breaks along a control path, each at a different junction', 'All three are quiet. Defaulting to off is what makes the failure safe.'),

    h2('Does this change how you deploy?'),
    p('It decouples deploying from releasing, which is the underlying shift and the reason the practice exists at all.'),
    p('Without flags, shipping code and exposing a feature are the same event, so every release carries the risk of everything in it. With flags, code ships continuously and features are exposed individually, so a problem is traceable to one toggle rather than to a batch of changes.'),
    p('That pairs naturally with the rest of the pipeline. Merging daily behind a flag means [CI runs against the real code](/blog/ci-pipeline-typecheck-tests) rather than against a branch nobody else sees, and [staging](/blog/staging-environment) can have the flag on while production has it off — which is a considerably better test than a preview environment with no data.'),
    quote('The point is not the flag. It is that deploying and releasing stop being the same decision, and each becomes smaller and safer as a result.'),

    h2('Conclusion'),
    p('A table with a key, a boolean, an optional org list and an optional percentage. A cached lookup that is synchronous, defaults to off, and hashes a stable identifier with the flag key for bucketing. That is the implementation, and it is an afternoon.'),
    p('Separate the four types and treat them differently: release and experiment flags are tasks with an end date, kill switches and permission gates are permanent — and the permission ones probably belong in your plan definition instead.'),
    p('Evaluate on the server and send only the answer, remember that a hidden button is not access control, and audit the list quarterly with a hard cap on how many temporary flags exist at once. Buy a platform when non-engineers need to change them or when you are running real experiments — and until then, twenty lines is genuinely enough.'),
    img('twenty-lines', 'A single small mechanism controlling a much larger structure', 'A table, a cached lookup, and a default of off. That is the whole implementation.'),
    p('The habit worth building alongside the code is asking, for anything that will take more than a few days, whether it can go behind a flag. Frequently the answer is yes and nobody considered it, and the work merges in three small pieces instead of arriving as one large branch. That is the actual return here — not the ability to turn things off, which is used rarely, but the ability to integrate continuously, which is used every day.'),
    p('And when the answer is no — because the change is structural, or touches data in ways both paths cannot share — knowing that in advance is worth as much. That is a change to plan carefully and deploy deliberately, rather than one to attempt on a Friday with a toggle you believe is a safety net.'),
  ),
  faqs: faq([
    ['What are feature flags?',
     'Conditionals letting code ship without the feature being visible, and letting something be turned off without a deploy. The core value is decoupling deploying from releasing, which makes both smaller decisions and keeps work merging daily rather than diverging on a branch.'],
    ['Do you need a feature flag service?',
     'Not initially. A table, a cached synchronous lookup and twenty lines of code cover release flags, kill switches and percentage rollouts. Buy a platform when non-engineers need to toggle them, when running genuine experiments, or when audit requirements apply.'],
    ['How do you do percentage rollouts?',
     'Hash a stable identifier together with the flag key and compare against the threshold. Stability means a user always sees the same variant; including the key means the same unlucky users are not in the first bucket for every flag you roll out.'],
    ['What is feature flag debt?',
     'Temporary flags that were never removed, leaving conditionals nobody dares delete because it is unclear which branch is live. Prevent it by recording why each flag exists and when it should go, removing them with the cleanup, and auditing the list quarterly.'],
  ]),
};
