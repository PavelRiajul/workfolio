import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/field-vs-lab-data/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-field-vs-lab-data',
  slug: 'field-vs-lab-data',
  title: 'Field Data vs Lab Data: Which Number Do You Trust?',
  category: 'performance',
  order: 82,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-06',
  series: 'Foundations',
  excerpt:
    'Lighthouse says 98 and Search Console says the page is failing. Both are right. Here is what each measurement is for and which one decides.',
  coverLabel: 'Field vs lab data — cover',
  body: body(
    p('The most common performance conversation I have starts the same way: somebody shares a Lighthouse screenshot showing 98, and a screenshot from Search Console showing the same URL marked as failing Core Web Vitals. They want to know which one is broken.'),
    p('Neither is. They are measuring different things, and the disagreement between them is usually the most informative signal available — it tells you the problem is real users on real networks with real devices, not the code path a synthetic run happened to take.'),
    p('This post is about knowing which number to look at when, because pointing the wrong instrument at a problem is how a week disappears optimising something that was never slow.'),

    h2('What is the difference, exactly?'),
    p('Lab data is one measurement, taken by you, under conditions you chose. Field data is millions of measurements, taken by browsers, under conditions nobody chose.'),
    p('That is the whole distinction and it explains every downstream difference. A lab run is repeatable, controllable and available before you ship. Field data is representative, uncontrollable, and only available weeks after you ship. Neither property is better; they answer different questions.'),
    table('The two measurements side by side', [
      ['', 'Lab (synthetic)', 'Field (real user)'],
      ['Who measures', 'You, on demand', "Users' browsers, continuously"],
      ['Sample size', 'One run', 'Thousands to millions'],
      ['Conditions', 'Chosen and fixed', 'Whatever people actually have'],
      ['Available', 'Before you ship', '28 days after you ship'],
      ['Good for', 'Debugging, regression gates', 'Deciding what is actually broken'],
      ['Tools', 'Lighthouse, WebPageTest, DevTools', 'CrUX, Search Console, RUM'],
    ]),
    p('The row that causes most of the confusion is the last one on availability. Field data in Search Console is a rolling 28-day window, so the fix you deployed on Monday does not move the number until most of that window is on the new code. People conclude the fix did not work and revert it, which is the worst possible outcome.'),

    h3('Lab data is a hypothesis, field data is the result'),
    p('It is worth internalising that ordering. You use the lab to form a theory about what is slow and to verify that your change did what you intended. You use the field to find out whether it mattered to anybody. Skipping the second step is how sites end up with excellent scores and unhappy users.'),

    h3('Both are legitimate; only one is the grade'),
    p('Google ranks on field data. Whatever Lighthouse says, the Core Web Vitals assessment that appears in Search Console comes from the Chrome User Experience Report, which is field data from real Chrome users who opted into reporting. A perfect lab score with a failing field assessment is a failing page.'),
    img('two-instruments', 'One controlled measurement beside a large distribution of uncontrolled ones', 'Lab is one run under conditions you chose. Field is millions of runs under conditions nobody chose. Only one of them is the grade.'),

    h2('Why does Lighthouse disagree with Search Console?'),
    p('Because your laptop is not a median device and your office is not a median network.'),
    p('A Lighthouse run in DevTools on a modern machine, over fibre, with a warm cache and no extensions, is close to the best case a page will ever see. The throttling presets help, but they simulate a slow network on a fast CPU — which is not what a mid-range Android phone is. The gap between simulated 4G on an M-series laptop and actual 4G on a three-year-old phone is large enough to hide a whole class of problems.'),

    h3('The device gap is bigger than the network gap'),
    p('Networks have improved faster than the median phone. A device at the 75th percentile of your audience may have a CPU several times slower than your development machine, and JavaScript execution scales with CPU almost linearly. This is why a page that feels instant to the team can be genuinely slow in the field — and why [bundle size matters more than it looks](/blog/bundle-splitting) on a fast laptop.'),

    h3('The lab does not know about your users'),
    p('A synthetic run visits one URL, once, cold, from one location, in one country, without a consent banner interaction, without a logged-in session, and without the third-party tag that only fires for returning visitors. Every one of those is a real condition that real users hit.'),

    h3('Variance in the lab is enormous'),
    p('Running Lighthouse three times in a row on the same unchanged page routinely produces three different scores, sometimes by ten points or more. A single run is not evidence of anything. If you are comparing before and after, run five and take the median, or use a tool that does it for you.'),
    img('lab-variance', 'Repeated identical runs producing a spread of results rather than one value', 'Three runs of the same unchanged page routinely differ by ten points. A single Lighthouse number is not evidence.'),

    h2('What is lab data actually good for?'),
    p('Finding causes and preventing regressions — the two things field data cannot do.'),
    p('When Search Console tells you LCP is 4.1 seconds at the 75th percentile, it does not tell you why. It gives you a URL group and a number. The lab is where you attach a profiler, look at the network waterfall, find the render-blocking request and the 900ms of main-thread work, and form a theory you can act on.'),

    h3('Debugging with a controlled variable'),
    p('The value of a controlled environment is that you can change exactly one thing and see the effect. Remove the font preload, re-run, compare. That loop is impossible in the field, where a thousand other variables move at the same time.'),

    h3('Regression gates in CI'),
    p('A Lighthouse run in the pull request that fails when the JavaScript budget is exceeded catches the problem when it costs ten minutes to fix, rather than eight weeks later in a field report. This is the single highest-value use of lab data and the one most often skipped.'),
    code('yaml', `
- name: Lighthouse CI
  run: |
    npx @lhci/cli autorun \\
      --collect.numberOfRuns=5 \\
      --assert.assertions.total-byte-weight="error:400000" \\
      --assert.assertions.largest-contentful-paint="error:2500"
`),
    p('Five runs, asserted on the median, on the routes that matter. Not the whole site — the three or four templates that account for most traffic, which is usually a landing page, a listing page and a detail page.'),

    h3('Comparing against a competitor'),
    p('You cannot see a competitor\'s field data at URL granularity, but you can run their pages in the same lab conditions as yours. That comparison is fair precisely because the conditions are artificial and identical for both.'),
    img('ci-gate', 'A budget threshold rejecting a change before it reaches production', 'The highest-value use of lab data: fail the build at the pull request, not the field report eight weeks later.'),

    h2('What is field data actually good for?'),
    p('Deciding what is broken, and proving that a fix worked.'),
    p('Field data is the only source that answers the question that matters — are real people having a slow experience — and it answers it with a sample size no lab run can approach. It is also the only data that reflects your actual traffic mix: the proportion of mobile to desktop, the countries, the devices, the returning visitors with warm caches.'),

    h3('It finds the pages you were not looking at'),
    p('Teams optimise the homepage because it is the page they open. Field data grouped by URL pattern regularly shows that the homepage is fine and a product listing template nobody thought about is the failing one, on ten times the traffic.'),

    h3('It surfaces problems the lab cannot reproduce'),
    p('Interaction problems that only appear after a user has scrolled and clicked twice, layout shifts caused by a slow third party that was cached during your test, memory pressure on a low-end device. These are invisible synthetically and obvious in a distribution.'),

    h3('It is the number Google uses'),
    p('Worth repeating because it settles most arguments. The assessment is field, at the 75th percentile, over 28 days, per URL group. Optimising for a lab score without checking the field is optimising for a proxy.'),

    h2('How do you collect field data yourself?'),
    p('With about fifteen lines, using the same library Chrome uses to define the metrics.'),
    p('CrUX and Search Console are free and require no code, but they only cover Chrome, only include URLs with enough traffic to be statistically meaningful, and lag by weeks. Your own real-user monitoring covers every browser, every URL including the low-traffic ones, and reports today.'),
    code('ts', `
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals';

function send(metric: { name: string; value: number; rating: string; id: string }) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: location.pathname,
  });
  // sendBeacon survives the page being closed; fetch does not.
  navigator.sendBeacon?.('/api/vitals', body) ??
    fetch('/api/vitals', { body, method: 'POST', keepalive: true });
}

onLCP(send);
onINP(send);
onCLS(send);
onTTFB(send);
`),
    p('The detail that catches people is `sendBeacon`. CLS and INP are only final when the page is being unloaded, and a normal `fetch` at that moment is frequently cancelled. Using a beacon, or `keepalive`, is the difference between complete data and a dataset biased toward users who stayed.'),

    h3('You do not need a vendor to start'),
    p('An endpoint that writes to Postgres and a query that computes the 75th percentile per route is a genuinely useful RUM setup for an afternoon\'s work. Most projects I build already have somewhere to put it — a Supabase or Neon instance is right there, and the volume is trivial.'),

    h3('Segment by device and connection'),
    p('An aggregate number hides the problem. Store the device memory, the effective connection type and whether the visit was mobile, and the same dataset tells you the median is fine and the bottom quartile is unusable — which is the actionable version.'),

    h3('Sample if the volume warrants it'),
    p('At high traffic, reporting every metric from every session is more data than you need for a percentile. Sampling at ten percent produces the same numbers at a tenth of the storage, and it is a one-line change to add later.'),
    img('rum-pipeline', 'Metrics leaving a browser at unload and arriving at a small store for aggregation', 'Fifteen lines and an endpoint. The detail that matters is sendBeacon — a normal fetch at unload is often cancelled.'),

    h2('Why is the 75th percentile the number?'),
    p('Because an average hides the users who are suffering, and the maximum is noise.'),
    p('If the median load is 1.8 seconds and the 75th percentile is 5.4, three quarters of your visits are acceptable and a quarter are bad enough to lose. An arithmetic mean of that distribution reports something around 2.5 seconds and reads as fine. Percentiles are used here specifically because performance distributions have a long tail and the tail is the problem.'),

    h3('Averages are actively misleading'),
    p('A single 40-second visit from someone on a train drags the mean and tells you nothing. Percentiles are robust against that in a way means are not, which is why every serious latency conversation is in percentiles.'),

    h3('Per URL group, not per site'),
    p('CrUX groups URLs; a site-level number is an average of averages and is almost never actionable. When the assessment fails, the first job is to find which group is dragging it.'),
    table('The same page, described three ways', [
      ['Statistic', 'Value', 'What it tells you'],
      ['Mean LCP', '2.5s', 'Almost nothing — one outlier moves it'],
      ['Median (p50)', '1.8s', 'The typical visit is fine'],
      ['p75', '5.4s', 'A quarter of visits are failing'],
      ['p95', '11.2s', 'The tail — real, but not the grade'],
    ]),
    p('Read that table top to bottom and the story changes completely at the third row. That is the row Google reads.'),
    img('percentiles', 'A long-tailed distribution with the mean, median and upper percentiles marked at very different points', 'The mean reads as fine while a quarter of visits fail. Percentiles are used here because the tail is the problem.'),

    h2('How do you debug a field problem in the lab?'),
    p('By making the lab resemble the failing segment before you start measuring.'),
    p('The default Lighthouse configuration is not the environment your failing users are in. If the field data says the problem is mobile users in a specific country on slow connections, reproduce that: throttle the CPU by 4x, use the slow 4G preset, and test from a location that matches. A problem that will not reproduce usually means the lab settings are still too generous.'),

    h3('Start from the failing segment, not the failing page'),
    p('Segmenting your RUM data by device class first often collapses the mystery immediately — the page is fine on desktop and terrible on mobile, which points at JavaScript execution rather than at bytes.'),

    h3('Match the cache state'),
    p('A returning visitor with a warm cache is a different page than a cold first visit, and if most of your traffic is returning, testing cold every time is measuring an experience few people have. Test both and know which one you are looking at.'),

    h3('Reproduce the third parties'),
    p('Blocking trackers in your browser while testing is the fastest way to produce a number that has no relationship to reality, and it is common because most developers block them by default. If a consent banner injects four scripts after acceptance, your test needs to accept.'),
    img('reproduce-segment', 'A controlled run reconfigured to match the conditions of a failing group of visits', 'If it will not reproduce, the lab settings are too generous. Match the segment before you measure.'),

    h2('What I actually run'),
    p('Three things, in a fixed order, on every project I take responsibility for.'),
    ol([
      '**Lighthouse CI in the pull request**, five runs, asserting byte weight and LCP on the three or four templates that carry the traffic.',
      '**`web-vitals` reporting to a small endpoint** from day one, so there is a baseline before anybody asks for one.',
      '**Search Console checked monthly**, because it is the assessment that affects ranking and it costs nothing to look at.',
    ]),
    p('That combination catches regressions before release, explains them when they happen, and confirms whether a fix moved the number that counts. It is not elaborate and it is more than most sites have.'),
    img('three-tools', 'A gate before release, continuous collection after it, and a periodic check of the graded result', 'Three tools in a fixed order: catch it in CI, explain it in the lab, confirm it in the field.'),

    h3('The eight-thing baseline this belongs to'),
    p('Real-user monitoring sits alongside the other things I set up on every build — staging, CI, error tracking, uptime checks, tested backups, spam protection, email authentication and client-owned accounts. It is the same argument each time: the cost of adding it at the start is an hour, and the cost of adding it after an incident is the incident. The full list is on [the stack page](/stack).'),

    h3('Where it goes in the process'),
    p('Instrumentation lands in the same pass as [the Core Web Vitals work itself](/blog/core-web-vitals-nextjs), because a fix you cannot measure is a fix you cannot defend when somebody asks whether it was worth the day.'),

    h2('Where does field data mislead?'),
    p('Less often than lab data, but the failure modes are worth knowing because they are quiet.'),

    h3('Survivorship bias'),
    p('Users who abandon a page before it loads may never report a metric. The very slowest experiences can be systematically underrepresented, which means the real distribution is worse than the one you are looking at. This is an argument for beacons and against assuming your data is complete.'),

    h3('Chrome only, for CrUX'),
    p('The Chrome User Experience Report is Chrome. If a meaningful share of your traffic is Safari on iOS — and for a consumer product it usually is — CrUX is describing a subset. Your own RUM does not have this limitation, which is one of the better reasons to run it.'),

    h3('The 28-day lag'),
    p('Worth stating once more because it causes real damage: a fix deployed today shows up gradually over the following month. Judging a change after a week and reverting it is a mistake I have watched teams make more than once.'),

    h3('Traffic thresholds hide small pages'),
    p('URLs without enough Chrome traffic get no CrUX data at all and are rolled into an origin-level number. For a site with a long tail of low-traffic pages, that means the pages you can see are not the pages you have.'),
    img('field-blind-spots', 'A distribution with parts of its range unobserved and shaded out', 'Field data has quiet failure modes: abandoned visits, Chrome-only sampling, a 28-day lag, and small pages with no data at all.'),

    h2('What does this cost?'),
    p('An hour to instrument, half a day to gate CI, and then nothing.'),
    p('Adding `web-vitals` and an endpoint is genuinely under an hour on any project. Lighthouse CI with sensible assertions on three routes is half a day, most of which is choosing thresholds that fail on real regressions without failing on variance. After that both run themselves.'),
    p('The honest counterweight: instrumentation creates the temptation to optimise the dashboard. A p75 that improves by 200ms is not automatically worth a week, and a page that passes every threshold can still be a bad page. Numbers are a check on judgement, not a substitute for it — and I have seen more time lost to chasing a score from 94 to 99 than to any genuine performance problem.'),
    quote('Lab data tells you why. Field data tells you whether it mattered. Using either one alone is how a week disappears optimising something nobody was waiting on.'),

    h2('Conclusion'),
    p('When Lighthouse and Search Console disagree, both are correct and the disagreement is the finding. Your laptop is not a median device, your network is not a median network, and the gap between the two numbers is a measurement of that difference.'),
    p('Use the lab to form a theory and to hold the line: attach a profiler, change one variable, and put a byte-weight and LCP assertion in the pull request so regressions are caught when they cost ten minutes rather than eight weeks. Run five times and take the median, because a single Lighthouse score varies by ten points on an unchanged page.'),
    p('Use the field to decide what to work on and to prove the fix landed. Read the 75th percentile, per URL group, and remember the 28-day window — a fix deployed today moves the number over the following month, so judging it after a week and reverting is the failure mode to avoid.'),
    p('Collect your own real-user data rather than relying only on CrUX. Fifteen lines with `web-vitals` and a beacon endpoint covers Safari, covers low-traffic URLs, and reports today instead of in four weeks. Segment it by device class, because the aggregate hides exactly the users you are losing.'),
    p('Then keep the two in their lanes. Lab data that is not confirmed in the field is a hypothesis, and field data with no lab work behind it is a complaint without a cause. If a site is failing its assessment and the reason is not obvious, [that is a good conversation to have](/start).'),
  ),
  faqs: faq([
    ['Why does my Lighthouse score not match Search Console?',
     'They measure different things. Lighthouse is one synthetic run on your machine under conditions you chose; Search Console reports field data from real Chrome users at the 75th percentile over 28 days. Your laptop and network are far better than the median, so the lab number is close to a best case.'],
    ['Which one does Google actually rank on?',
     'Field data. The Core Web Vitals assessment comes from the Chrome User Experience Report — real users, 75th percentile, rolling 28-day window, grouped by URL pattern. A perfect Lighthouse score with a failing field assessment is a failing page as far as ranking is concerned.'],
    ['How long before a fix shows up in field data?',
     'Up to 28 days, because the window is a rolling month and improvement is gradual as old measurements age out. Judging a deployment after a week and reverting it is a common and expensive mistake. Use lab data to confirm the change did what you intended in the meantime.'],
    ['Do I need a paid RUM tool?',
     'No. The web-vitals library plus an endpoint that stores metrics and a query that computes the 75th percentile per route is a genuinely useful setup you can build in an hour. Paid tools add session replay, alerting and correlation, which are worth money later, not first.'],
    ['Why the 75th percentile and not an average?',
     'Performance distributions have long tails, and an average is dragged by outliers while hiding the quarter of users having a bad time. A page with a 1.8-second median and a 5.4-second p75 averages out to something that reads as acceptable while a quarter of visits are failing.'],
  ]),
};
