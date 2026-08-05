import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/testing-critical-paths/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-testing-critical-paths',
  slug: 'testing-critical-paths',
  title: 'Testing the Paths That Actually Break',
  category: 'fullstack',
  order: 43,
  readTime: '12 min read',
  date: 'January 2026',
  publishedAt: '2026-01-27',
  series: 'Every build',
  excerpt:
    'Not 100% coverage. The handful of flows where a regression costs real money, and how to cover them cheaply.',
  coverLabel: 'Testing — cover',
  body: body(
    p('Coverage percentage is the most misleading number in software. A codebase at 90% can have every payment path untested, because payments are complicated and the utility functions are easy, and coverage rewards whichever you wrote more of.'),
    p('The question worth asking is not how much is tested. It is whether the five things that would genuinely hurt if they broke are covered, and on most projects the honest answer is partially.'),
    p('This is how I decide what to test on a project maintained by one person, where the time spent testing is time not spent building.'),

    h2('Why is coverage the wrong target?'),
    p('Because it measures lines executed, not consequences prevented, and those correlate weakly.'),
    p('Chasing a number pushes effort toward whatever is easiest to cover — pure functions, formatters, mappers — because they take a minute each and move the percentage. The genuinely risky code involves a database, an external service and several states, so it costs an hour and moves the percentage barely at all.'),
    p('The result is a suite that runs green while the checkout has never been exercised end to end. The number went up and the risk did not go down, which is worse than having no number because it produces confidence.'),
    p('The alternative framing that works: for each flow, what does it cost if this breaks silently for a week? Order that list, test from the top, and stop when the cost of the next one is genuinely low.'),
    img('coverage-vs-risk', 'A large evenly filled area beside a small area with concentrated markers', 'Lines executed and consequences prevented are different quantities.'),

    h2('What are the paths that actually matter?'),
    p('Five, on nearly every product, and they are the same five regardless of what the product does.'),
    table('Where testing effort belongs', [
      ['Path', 'Cost if broken', 'Test type', 'Priority'],
      ['Signup and login', 'Nobody can use it', 'End-to-end', 'Critical'],
      ['Payment and subscription', 'Lost revenue, refunds', 'End-to-end plus unit', 'Critical'],
      ['Permission checks', 'Data leaked between users', 'Integration', 'Critical'],
      ['The core workflow', 'Product does not work', 'End-to-end', 'High'],
      ['Pricing and calculations', 'Wrong invoices', 'Unit', 'High'],
      ['Marketing pages', 'A typo', 'Smoke only', 'Low'],
    ]),
    p('The bottom row is the point. Content pages account for a large share of most codebases and almost none of the risk, and testing them thoroughly is where a lot of testing effort quietly goes.'),
    p('Permission checks deserve their place near the top despite rarely feeling urgent. A broken permission is not a bug the user reports — it is data shown to somebody who should not see it, and they may not tell you.'),

    h2('What should be a unit test?'),
    p('Anything where the logic is dense and the inputs are enumerable. These are cheap, fast and deterministic, and they are the tests worth writing by hand.'),
    p('Pricing calculations, proration, date arithmetic, permission resolution, anything with branching business rules. The value is that the interesting cases — the boundary, the zero, the negative, the leap year — are exactly the ones a generated test does not think of.'),
    code('ts', `
// The cases worth writing are the ones somebody has to think about.
describe('proration', () => {
  it('charges nothing when upgrading on the renewal date', …);
  it('credits the unused portion when downgrading mid-cycle', …);
  it('handles a month boundary where the next month is shorter', …);
  it('rounds in the customer\\'s favour, never against', …);
});
`),
    p('That last one is a business rule rather than a technical property, and it is the kind of thing that only exists in a test. Six months later nobody remembers the decision, and the test is the only record that it was deliberate.'),
    p('What does not belong here: testing that a framework works, asserting implementation details, or snapshot tests of markup that change whenever anyone adjusts a class name. All three break constantly and catch nothing.'),

    h2('What should be an integration test?'),
    p('Anything crossing a boundary you own — a request through the handler to the database and back.'),
    p('This is where permission bugs live, and unit tests structurally cannot find them. A permission function tested in isolation returns true or false correctly; the bug is the query in a different file that never called it.'),
    p('These are the tests that catch a missing tenant filter, a transaction that does not roll back, or a cascade that deletes more than intended. They need a real database rather than a mock, because a mocked database agrees with whatever assumption you encoded.'),
    p('Run them against a disposable instance — a container in CI, or a [database branch](/blog/multi-tenant-prisma-postgres) where the platform supports it. The important property is isolation between tests, since shared state is the single largest cause of a suite that fails in a different order.'),

    h2('How many end-to-end tests should you have?'),
    p('Five. Not fifty, and the difference matters more than it sounds.'),
    p('End-to-end tests are the slowest and flakiest thing in any suite. They start a browser, wait on network, and depend on timing. That cost is worth paying for the flows where nothing else gives confidence, and it is a bad trade everywhere else.'),
    p('Five keeps the set small enough that a failure is always worth investigating. Fifty produces a suite where two are failing at any moment, everyone knows which two, and a genuine failure hides among them.'),
    ul([
      '**Sign up, verify, log in** — the door into the product.',
      '**The core workflow** — whatever the product is actually for, once, happy path.',
      '**Subscribe and pay**, against the provider in test mode.',
      '**A permission boundary** — attempt to reach another account\'s data and assert failure.',
      '**One critical integration**, if the product depends on a third party.',
    ]),
    p('Those five cover the paths where a silent regression costs real money. Everything else the browser could exercise is covered more cheaply and more reliably a layer down.'),
    p('Notice that four of the five involve money or access rather than functionality. That is deliberate. A feature that renders wrong produces a support ticket; a permission that leaks produces an incident, and a payment path that silently fails produces revenue you never knew you lost. The asymmetry in consequences is what justifies spending the expensive test budget there rather than on the parts of the product that get used most.'),
    p('It is also worth running these against something resembling production rather than a fresh empty database. A checkout test with one product and no history passes on arrangements that break with real catalogue sizes, and the whole reason to accept the cost of end-to-end tests is that they exercise the system as it actually is.'),
    img('five-tests', 'Five distinct paths through a structure, each clearly marked', 'Five keeps a failure worth investigating. Fifty produces a permanently amber suite.'),

    h2('How do you keep the suite from becoming flaky?'),
    p('Three causes account for almost all of it, and each has a standard fix.'),

    h3('Time'),
    p('Tests using the real clock fail at midnight, at month boundaries and in a different timezone on a colleague\'s machine. Inject the clock so a test can state what time it is, and any date-dependent behaviour becomes deterministic.'),

    h3('Shared state'),
    p('Tests that pass individually and fail together are sharing a database, a cache or a module-level variable. Each test should create what it needs and clean up, or run in a transaction rolled back afterwards.'),

    h3('Fixed waits'),
    p('An end-to-end test sleeping two seconds passes on a fast machine and fails on a loaded CI runner. Wait for a condition — an element appearing, a request completing — never for a duration.'),
    p('A test that cannot be stabilised in an hour should be deleted or moved out of the blocking set. An honest suite of twelve tests is more useful than forty where four fail at random, because the second teaches everyone to re-run rather than investigate, and then a real failure gets re-run too.'),

    h2('When should you write them?'),
    p('The critical five before launch. Everything else in response to something breaking.'),
    p('Test-first as a universal practice does not survive contact with an [MVP timeline](/blog/mvp-development-cost), and pretending otherwise produces either a slower build or an abandoned discipline. What does survive is testing the five paths where a regression is expensive, and writing a test for every bug that reaches a user.'),
    p('That second habit is the one that compounds. A bug that reached production is proof that a path was both reachable and untested, which makes it exactly the test worth having. Over a year the suite converges on what actually breaks in this specific product, which is far better targeting than any coverage rule produces.'),
    p('The regression test also settles the question of whether the fix worked, which is otherwise a matter of trying it once and hoping. Writing it before the fix is better still, because a test that fails for the right reason and then passes has demonstrated something, whereas a test written afterwards has only demonstrated that it agrees with the code you just wrote.'),
    p('There is one category worth testing before it breaks rather than after: anything you are about to change substantially. A refactor of a payment flow is considerably safer with tests written the day before, and those tests are easy to write while the existing behaviour is still the correct behaviour. Writing them afterwards means encoding whatever the new code does, which proves nothing about whether it still does the old thing.'),

    h2('How do you write a test that stays useful?'),
    p('Most tests that get deleted were testing how something works rather than what it does. Four habits keep them alive through a refactor.'),

    h3('Assert on behaviour, not on calls'),
    p('A test asserting that a function called the repository twice breaks the moment somebody batches the queries, even though nothing observable changed. Assert on the outcome — the record exists, the total is right — and the test survives any implementation that produces it.'),

    h3('Set up through the public path'),
    p('Creating test data by inserting directly into tables is fast and couples the test to the schema. Creating it through the same service the application uses means the setup itself exercises real code, and a schema change breaks one helper rather than forty tests.'),

    h3('Name the scenario, not the function'),
    p('"charges nothing when upgrading on the renewal date" tells a future reader what rule is being protected. "test upgradeSubscription" tells them nothing, and when it fails they cannot tell whether the behaviour or the expectation is wrong.'),

    h3('One reason to fail'),
    p('A test asserting six things fails on the first and hides the other five. Several focused tests take marginally longer to write and tell you considerably more when something breaks, because the pattern of which ones failed is itself information.'),
    p('The underlying principle is that a test is read far more often than written, usually by somebody who did not write it and is trying to work out whether their change is wrong or the test is stale. Everything above optimises for that moment.'),
    img('durable-tests', 'A set of markers attached to an outer surface rather than to internal mechanisms', 'Attached to behaviour, not to implementation. That is what survives a refactor.'),

    h2('What do you do when the suite gets slow?'),
    p('Fix it, because a slow suite stops being run and an unrun suite is worse than none — it produces confidence without providing any.'),

    h3('Find the slow tests before optimising anything'),
    p('Most runners report per-test timing. It is almost always a handful of tests taking most of the time, usually the ones starting a browser or seeding a large fixture. Optimising the fast majority is effort spent where there is nothing to gain.'),

    h3('Share expensive setup, carefully'),
    p('Starting a database container per test file is slow; starting one for the whole run and isolating each test in a transaction is fast and still isolated. That single change frequently halves an integration suite.'),

    h3('Split the fast set from the slow set'),
    p('Unit tests should run in seconds and be runnable on save. Integration and end-to-end tests belong in a separate command that runs before a push. Conflating them means the fast feedback loop is as slow as the slowest thing in it.'),

    h3('Parallelise last'),
    p('It is the obvious answer and it hides problems rather than solving them, because parallel execution surfaces every shared-state bug at once. Worth doing after isolation is genuinely correct, and painful before.'),
    img('slow-suite', 'A sequence of segments with one disproportionately long, marked for attention', 'A handful of tests take most of the time. Optimising the rest gains nothing.'),

    h2('What about generated tests?'),
    p('Useful for the obvious paths, and they consistently miss the ones that matter.'),
    p('A model writing tests for a function produces the happy path, a null check, and an empty array. Those are worth having and they take seconds. What it does not produce is the case where the discount is larger than the subtotal, or where a customer downgrades on the last day of a month with thirty-one days.'),
    p('This is [the same division that applies to generated code](/blog/building-with-ai-workflow): the conventional parts are generated and the parts requiring judgement about the domain are not. Tests for signup, permissions and anything touching money get written by hand, because the interesting cases are the point.'),
    p('The failure worth avoiding is a large generated suite that raises coverage and tests nothing anyone cared about, while creating maintenance cost every time an implementation detail changes.'),

    h2('What does this cost on a real project?'),
    p('Roughly a day for the critical five, plus ongoing time proportional to how often things break.'),
    p('On a standard web app: the unit tests for pricing and permissions are perhaps three hours, the integration tests around the permission boundary two hours, and the five end-to-end tests three hours including the fixture setup. Call it a day, spread across the build rather than done at the end.'),
    p('The ongoing cost is a test per production bug, which is fifteen minutes each and self-limiting — a codebase that keeps producing bugs in one area gets tests there quickly, and one that does not stays cheap.'),
    quote('Coverage measures how much of the code ran. The useful question is whether the five things that would cost you money are covered, and that number is usually available by counting on one hand.'),

    h2('What runs where?'),
    p('Fast and deterministic on every push; slow and expensive on a schedule.'),
    p('Unit and integration tests run in [CI on every push](/blog/ci-pipeline-typecheck-tests) alongside the type-check, because they are quick enough to be part of the edit loop. End-to-end tests against a deployed preview run on merge to main, since they are slower and need somewhere deployed to point at.'),
    p('Anything touching a paid third-party service belongs on a schedule rather than on every commit, both for the cost of the calls and because your own pipeline should not start failing when somebody else has an outage.'),
    p('The gating rule matters more than the split: whatever runs on a pull request must block merging. A test suite that reports without preventing is one everyone learns to ignore, which is the same failure mode as an alert nobody acts on.'),
    img('what-runs-where', 'Two lanes of differing speed, the faster one gated at every point', 'Fast tests gate every push. Slow ones run where waiting for them is reasonable.'),

    h2('Conclusion'),
    p('Stop measuring coverage and start listing the flows where a silent regression costs money. On nearly every product that list is signup, payments, permissions, the core workflow and the calculations — five things, and they can be covered in about a day.'),
    p('Unit-test the dense logic by hand, because the interesting cases are the ones that require thinking about the domain. Integration-test anything crossing into the database, since that is where permission bugs live. Keep end-to-end tests to five, and treat any flaky test as broken.'),
    p('Then add a test for every bug that reaches a user. Over a year that produces a suite targeted at what actually breaks in your product, which is a better outcome than any percentage — and it costs a fraction of what chasing one does.'),
    img('targeted-suite', 'A small set of markers concentrated on the load-bearing points of a structure', 'Concentrated where a failure costs money, rather than spread evenly across the surface.'),
    p('If you inherit a codebase with no tests at all, resist the instinct to start at the top of a file and work down. Write the five critical-path tests first, in a day, and get them running in CI. That gives you a safety net for everything you are about to change, which is the actual reason to have tests on a codebase you do not yet understand. Broad coverage of code you have not touched protects nothing you are working on.'),
  ),
  faqs: faq([
    ['What should you actually test in a web app?',
     'The flows where a silent regression costs money: signup and login, payments and subscriptions, permission checks, the core workflow, and any pricing calculation. On most products that is five things, coverable in about a day.'],
    ['Is 100% test coverage worth it?',
     'No. Coverage measures lines executed rather than consequences prevented, and chasing it pushes effort toward easy code. A codebase at 90% can have every payment path untested, which is worse than no number because it produces false confidence.'],
    ['Unit tests or end-to-end tests?',
     'Both, in very different quantities. Unit tests for dense logic and integration tests at the database boundary should be numerous, because they are fast and reliable. End-to-end tests should number about five, since they are slow and flaky and each one costs.'],
    ['How do you stop tests being flaky?',
     'Almost all flakiness comes from three causes: tests using the real clock, tests sharing state, and end-to-end tests waiting a fixed duration rather than for a condition. Fix those, and delete or quarantine anything that cannot be stabilised in an hour.'],
  ]),
};
