import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ci-pipeline-typecheck-tests/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ci-pipeline-typecheck-tests',
  slug: 'ci-pipeline-typecheck-tests',
  title: 'CI That Type-Checks and Tests on Every Push',
  category: 'fullstack',
  order: 37,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-21',
  series: 'Every build',
  excerpt:
    'A pipeline that catches the class of bug that reaches production most often, in under sixty lines of config.',
  coverLabel: 'CI pipeline — cover',
  body: body(
    p('Continuous integration on a solo project sounds like ceremony. There is no team to integrate with, the tests are the ones you wrote, and you already ran them before pushing.'),
    p('Except you did not run them on the last commit, because the change was small. And the type error is in a file you did not open, in a package that imports the one you edited. And the build that works locally uses a `.env` that does not exist on the deploy platform.'),
    p('CI is not about coordination. It is about the checks running when you would not have bothered, which is precisely when they catch something. It is one of [the eight things in every build](/stack) and it is about fifty lines of configuration.'),

    h2('What are the three checks that matter?'),
    p('Type-check, tests on the paths that break, and a real build. In that order, because that is roughly the order of cost per bug caught.'),
    table('What each check catches, and what it costs', [
      ['Check', 'Catches', 'Typical runtime'],
      ['Type-check', 'Contract mismatches across files and packages', '20–40s'],
      ['Unit tests', 'Logic regressions in dense code', '30–60s'],
      ['Build', 'Config, imports, bundling assumptions', '60–120s'],
      ['End-to-end smoke', 'Broken critical paths', '60–90s'],
    ]),
    p('Type-checking is the cheapest test anyone will ever write, because it is already written. Running `tsc --noEmit` across the whole workspace catches every place a change broke a consumer, which is exactly the failure a single-package check misses.'),
    p('The build deserves its place despite feeling redundant. A project can type-check cleanly and fail to build — a missing dependency that resolves locally from a hoisted `node_modules`, an environment variable read at build time, an import that works in development and not in the bundler. Those only appear when something actually builds.'),
    p('There is a fourth check worth considering once the first three are stable, and it is easy to miss because it does not resemble a test at all: run the build twice and confirm the output is identical. A build that produces different output from the same input has non-determinism in it — a timestamp baked into a file, a dependency resolved loosely, an ordering that depends on the filesystem. None of those break immediately, and all of them make it impossible to reason about whether the thing you verified is the thing you shipped.'),

    h2('What does a minimal pipeline look like?'),
    p('One workflow, one job, four steps. This is close to the whole thing.'),
    code('yaml', `
name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm            # the single biggest speed win

      - run: npm ci             # not 'npm install' — respects the lockfile
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
`),
    p('`npm ci` rather than `npm install` is the detail worth understanding. It installs exactly what the lockfile specifies and fails if the lockfile and manifest disagree, which means CI cannot silently resolve a different dependency version than your machine did.'),
    p('The Node version should be pinned to what the deploy platform runs. A pipeline passing on 22 while production runs 20 is verifying something other than what ships, which is the same failure staging exists to prevent one layer up.'),

    h2('Should CI block merging?'),
    p('Yes, and this is the part that turns a pipeline from decoration into a control.'),
    p('A pipeline that reports failure without preventing anything trains everyone to ignore red. Within a month the default state is failing, nobody knows which failures are real, and the signal is gone.'),
    p('On GitHub this means branch protection requiring the check to pass. On a solo project it feels absurd to protect a branch from yourself — and it is exactly as useful, because the person who pushes a type error on a Friday afternoon is you.'),
    p('The rule I hold to is that a red build is a stop-work condition. Not "fix it before the next release" — fix it now, or revert the commit that caused it. Tolerating a red build for a day is how a team ends up tolerating it for a month.'),
    img('gate-not-report', 'A gate blocking one item while another passes, beside an unblocked path', 'A check that reports and does not block trains everyone to ignore red.'),

    h2('Which tests actually belong in CI?'),
    p('The ones covering paths where a regression costs money, not the ones that raise a coverage number.'),

    h3('Unit tests where the logic is dense'),
    p('Pricing calculations, permission checks, date handling, anything with branches. These are fast, deterministic and they catch real regressions. They are also the tests worth writing by hand rather than generating, because the interesting cases are the ones a generator does not think of.'),

    h3('Integration tests at the boundaries'),
    p('A request through the handler to the database and back. Slower, and they catch the class of bug unit tests structurally cannot — a query that is wrong, a transaction that does not roll back, a permission filter that is missing.'),

    h3('A handful of end-to-end smoke tests'),
    p('Signup, login, the core workflow, and checkout if money is involved. Five tests, not fifty. They are the slowest and flakiest thing in the suite, so the set should be small enough that a failure is always worth investigating.'),

    h3('What does not belong'),
    p('Snapshot tests of markup that change every time anyone touches CSS. Tests asserting implementation rather than behaviour. Anything hitting a live third-party service, which makes your pipeline fail when somebody else has an outage.'),

    h2('How do you keep it fast?'),
    p('Under two minutes, because past that people stop waiting for it and start merging on hope.'),
    ul([
      '**Cache dependencies.** The single largest win, and one line of configuration. Without it every run reinstalls everything.',
      '**Run the fast checks first.** Type-check before tests before build. A type error should fail in forty seconds, not after a four-minute build.',
      '**Parallelise where the work is independent.** Lint and type-check do not depend on each other and can run as separate jobs.',
      '**Cache the build output** where the framework supports it, so unchanged parts are not rebuilt.',
      '**Keep end-to-end tests to a smoke set.** They dominate the runtime and their value does not scale with count.',
    ]),
    p('The target matters more than the exact number. A pipeline people wait for is a pipeline that gates; a pipeline people merge past is decoration with a monthly bill.'),

    h2('What about flaky tests?'),
    p('Treat them as broken, because a flaky test is worse than no test.'),
    p('The damage is not the failed run. It is that a suite failing intermittently teaches everyone to re-run rather than investigate, and once re-running is the reflex, a genuine failure gets re-run too and merged when it passes on the third attempt.'),
    p('The usual causes are narrow: a test depending on wall-clock time, tests sharing state through a database that is not reset, and end-to-end tests waiting a fixed duration rather than for a condition. Each has a standard fix — inject the clock, isolate per test, wait for the element rather than the timeout.'),
    p('When a test cannot be stabilised quickly, delete it or quarantine it out of the blocking set. An honest suite of twelve tests is more useful than a suite of forty where four fail at random.'),
    img('flaky', 'A sequence of consistent signals with one irregular element among them', 'A flaky test teaches everyone to re-run. Then a real failure gets re-run too.'),

    h2('What should run on a pull request versus on main?'),
    p('Everything fast on every push; anything slow or expensive on a schedule.'),
    p('Type-check, unit tests and the build should run on every push and pull request. They are quick enough to be part of the edit loop and they catch the majority of problems.'),
    p('End-to-end tests against a deployed preview, dependency audits, and anything that costs money — a live API call, an image generation, a full performance run — belong nightly or on merge to main. The distinction is whether the check is fast enough that waiting for it is reasonable.'),
    p('For this project the blog pipeline follows the same split: the [anatomy gate](/blog/project-stack-templates) runs on the file being published because it takes seconds, while a full check of every post is a separate command run deliberately.'),

    h2('What else is worth putting in the pipeline?'),
    p('Four additions that are cheap, catch real problems, and are not tests in the usual sense.'),

    h3('Lint, but only rules that catch bugs'),
    p('Formatting belongs to a formatter running on save, not to a pipeline that fails your build over a semicolon. What earns its place in CI is the subset catching genuine mistakes: unused variables, floating promises, exhaustive switch checks, and any project-specific rule enforcing an architectural boundary.'),
    p('This project has one of the latter kind — a rule that the unscoped database client cannot be imported outside the file constructing the tenant-scoped one. That is not style; it is a data-isolation control that a human reviewer will eventually miss.'),

    h3('A dependency audit, on a schedule'),
    p('Nightly rather than per-push, because a new advisory published overnight should not fail an unrelated pull request at nine in the morning. What you want is to know within a day, not to be blocked by somebody else\'s disclosure timing.'),

    h3('Generated artefacts must match'),
    p('If types are generated from a schema, regenerate in CI and fail if the output differs from what is committed. That catches the case where somebody edits the schema and forgets to regenerate — which otherwise surfaces at runtime, as [the type-sharing post covers](/blog/type-safe-mern).'),

    h3('A bundle size budget, where size matters'),
    p('For anything user-facing, failing when the JavaScript bundle grows past a threshold catches the accidental import of a heavy library. It is a single check and it prevents the slow accretion that nobody notices until a page is measurably slower.'),
    img('extra-checks', 'A row of four small inspection stations along a single line', 'None of these are tests. All of them catch things tests do not.'),

    h2('How do you handle secrets in CI?'),
    p('Carefully, because a pipeline is a place where credentials sit next to arbitrary code.'),
    p('The basic rules are unremarkable: store them in the platform\'s secret store rather than the repository, scope each to the minimum it needs, and never echo them into logs. Most CI systems mask known secret values in output, which helps and is not a substitute for not printing them.'),
    p('The genuinely risky configuration is running the full pipeline on pull requests from forks. A fork can modify the workflow file, so a build with access to production secrets is a build a stranger can rewrite. The standard answer is that fork pull requests run a reduced pipeline without secrets, and anything needing credentials runs after a maintainer has reviewed the diff.'),
    p('For a solo project this is less pressing and worth setting up correctly anyway, because the day the repository gains a second contributor is not the day you want to be thinking about it. The same reasoning applies to deployment credentials: CI should hold a token scoped to deploying, not a personal access token that can do anything.'),
    img('secrets', 'A sealed compartment adjacent to a working area, with a narrow controlled opening', 'A pipeline is where credentials sit next to arbitrary code. Scope them accordingly.'),

    h2('How does CI relate to deployment?'),
    p('CI verifies; deployment ships. Keeping them separate is what makes both trustworthy.'),
    p('The useful arrangement is that merging to main runs the checks, and a successful run triggers a deploy to [staging](/blog/staging-environment) automatically. Production is a promotion of the same verified artefact rather than a fresh build.'),
    p('The failure mode to avoid is a deploy pipeline that builds independently of the check pipeline. Then CI passing tells you a build succeeded, and the deploy runs a different build that might not. They should be the same artefact or the verification is theatre.'),

    h2('What does this catch in practice?'),
    p('Concretely, from this codebase during the work that produced these posts.'),
    p('A type error in `astro.config.mjs` — the file is `@ts-check`ed, and additions to it broke on implicit `any` and a map typed too narrowly. Invisible in a normal build, caught by `tsc --noEmit`.'),
    p('An RSS feed rejecting its entire contents because one item had a null category. That failed the build rather than shipping a broken feed, which is the correct outcome and only happens because the build is a gated step rather than something that happens after merge.'),
    p('Both are the same shape: something that works in the file you edited and breaks somewhere you did not look. That is the category CI exists for, and it is a category that does not care how large the team is.'),
    quote('The checks that matter are the ones running when you would not have bothered. That is the entire value, and it is why it must be automatic rather than remembered.'),

    h2('What does a failing build actually look like?'),
    p('Worth designing for, because the first thing anyone sees on a red build is the output, and most pipelines make that harder than necessary.'),

    h3('Fail fast and name the step'),
    p('Separate steps rather than one script chaining commands. A run that says "type-check failed" is immediately actionable; one that says "npm run verify exited 1" means opening the logs to find out which of four things went wrong.'),

    h3('Print the useful part, not everything'),
    p('Default test output on a large suite buries three failures under two hundred passes. Reporters that summarise failures at the end, and a type-checker configured to be terse, turn triage from scrolling into reading.'),

    h3('Make it reproducible locally'),
    p('Every check should be a command someone can run on their machine and get the same answer. A pipeline doing something clever that cannot be reproduced locally means debugging by pushing commits, which is slow and demoralising.'),
    p('This is the practical argument for putting the checks in `package.json` scripts and having CI call those, rather than writing the logic in the workflow file. The pipeline becomes a list of scripts to run, and every one of them works locally by construction.'),
    img('failing-build', 'A sequence of stages with one clearly marked as stopped, the others unlit', 'Separate steps. "Type-check failed" beats "exited 1".'),

    h2('Is it worth it on a small project?'),
    p('Fifty lines of configuration against a class of bug that otherwise ships. Yes, and the smaller the project the more it matters, because there is nobody else reviewing.'),
    p('The version I add on day one is the four steps above. Nothing sophisticated, no matrix builds, no coverage reporting. Those are optimisations for problems a small project does not have, and adding them early is how a pipeline becomes slow enough to be routed around.'),
    p('The addition worth making early is a preview deploy per pull request, if the platform offers it free. It costs nothing and it turns "I think this looks right" into a URL somebody can open.'),

    h2('Conclusion'),
    p('Four steps: install from the lockfile, type-check the whole workspace, run the tests that cover paths where a regression costs money, and build. Pin the Node version to what production runs, cache dependencies, and keep the whole thing under two minutes.'),
    p('Then make it block. A check that reports without preventing anything is a check everyone learns to ignore, and a red build should stop work rather than join a list. Treat flaky tests as broken and remove them from the blocking set until they are fixed.'),
    p('That is an hour of setup for the specific failure mode that reaches production most reliably: something correct in the file you changed and broken in one you did not open. No amount of care substitutes for the check running every time, including the times you were sure it was fine.'),
    img('every-push', 'A repeating sequence of identical checkpoints along a continuous line', 'The value is that it runs every time, including the times you were certain it was fine.'),
    p('If you are adding this to an existing project, resist the temptation to make the first pipeline comprehensive. Start with type-check and build only — two steps, no tests — and get them green. A pipeline that is red on day one because the codebase has forty pre-existing type errors will be disabled by the end of the week, and the second attempt is always harder than the first because everyone now believes CI is a nuisance.'),
    p('Get two steps passing and blocking, then add tests to the blocking set as they become reliable. Green and narrow beats comprehensive and ignored, and it is the only version that survives contact with a deadline.'),
  ),
  faqs: faq([
    ['What should a minimal CI pipeline include?',
     'Install from the lockfile with npm ci, type-check the whole workspace, run tests covering paths where a regression costs money, and run a real build. Four steps, about fifty lines of configuration, and under two minutes with dependency caching.'],
    ['Is type-checking enough without tests?',
     'It catches a surprising amount, because it is a test you already wrote and it verifies every consumer of a change. It cannot tell you the logic is right, so dense areas like pricing, permissions and date handling still need real tests.'],
    ['How do you keep CI from getting slow?',
     'Cache dependencies, run fast checks first so a type error fails in forty seconds rather than after a build, parallelise independent jobs, and keep end-to-end tests to a small smoke set. Past two minutes people stop waiting and merge on hope.'],
    ['Should CI block merging?',
     'Yes. A pipeline that reports failure without preventing anything trains everyone to ignore red, and within a month nobody knows which failures are real. On a solo project this feels absurd and is exactly as useful, because you are the one pushing on Friday.'],
  ]),
};
