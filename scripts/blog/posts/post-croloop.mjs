import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/cro-process-loop/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-cro-process-loop',
  slug: 'cro-process-loop',
  title: 'The CRO Loop: How Conversion Work Actually Runs',
  category: 'ecommerce',
  order: 91,
  readTime: '13 min read',
  date: 'May 2026',
  publishedAt: '2026-05-27',
  series: 'CRO',
  excerpt:
    'Measure, hypothesise, build, test, decide, repeat. The loop is simple and almost every team breaks it in the same three places.',
  coverLabel: 'CRO loop — cover',
  body: body(
    p('Conversion work fails for process reasons far more often than for lack of ideas. Teams ship five changes at once and cannot tell which helped. They call a test after four days because the numbers looked good. They run an experiment, get a flat result, and quietly ship the variant anyway because somebody liked it.'),
    p('None of that is an ideas problem. It is a loop that is not closing, and the fix is procedural rather than creative. A team running a disciplined loop with mediocre ideas will beat a team running no loop with brilliant ones, because only one of them accumulates knowledge.'),
    p('Here is the loop I run, what belongs in each stage, and the three places I watch it break.'),

    h2('What are the stages?'),
    p('Six, and the last one is the one that gets dropped.'),
    ol([
      '**Measure** — establish where the funnel actually leaks, segmented by device.',
      '**Hypothesise** — state what you think is wrong, why, and what you expect to change.',
      '**Build** — implement the smallest version that tests the hypothesis.',
      '**Test** — run it against the current version, on a predetermined sample.',
      '**Decide** — ship, revert, or iterate, according to a rule set in advance.',
      '**Record** — write down what you learned, including the failures.'],
    ),
    p('Step six is not administration. Without it a team relearns the same thing every eighteen months as people move on, and the losing tests — which are the more informative half — vanish entirely.'),

    h3('It is a loop, not a project'),
    p('The output of the decide stage is the input to the next measure stage. A conversion "project" that runs for six weeks and ends has produced a handful of changes and no capability. The value compounds only if it keeps going, at whatever cadence the traffic supports.'),

    h3('Cadence follows traffic'),
    p('A store with heavy traffic can complete a cycle in two weeks. A store with modest traffic might need six, because the test stage cannot be rushed. Running the loop faster than your data allows produces confident decisions built on noise, which is worse than running it slowly.'),
    img('the-loop', 'Six stages arranged in a cycle where the final output feeds the first stage again', 'Six stages, and the last one gets dropped. Without it the losing tests vanish and the team relearns the same thing every eighteen months.'),

    h2('What does the measure stage involve?'),
    p('Finding the anomalous step, then watching people fail at it.'),
    p('Quantitative data tells you where; qualitative data tells you why. Teams that only do the first produce hypotheses that are guesses with a chart attached, and teams that only do the second optimise things nobody was struggling with. You need both and they take about a day together.'),

    h3('Start with the funnel, by device'),
    p('Sessions, product views, add-to-carts, checkouts, completions — and the ratios between them, split by mobile and desktop. One step will be worse relative to your own others, and that is where the loop points. [The full version of this audit](/blog/ecommerce-conversion-leaks) is a day of work.'),

    h3('Then watch twenty recordings'),
    p('Specifically of sessions that reached the failing step and did not continue. An hour of this produces better hypotheses than a week of dashboard work, because you see the hesitation and the mis-tap rather than inferring them.'),

    h3('Read your own site search'),
    p('Internal search queries are customers telling you what they cannot find, in their own words, unprompted. Queries returning no results point at a missing product, a naming mismatch or a category nobody can navigate to, and every one of them is directly actionable without any interpretation.'),

    h3('Ask the people who talk to customers'),
    p('Support and customer service already know the top three objections. This is free, it takes twenty minutes, and it is skipped almost universally.'),

    h2('What makes a good hypothesis?'),
    p('A statement that can be wrong, with a number attached.'),
    p('"Improve the product page" is not a hypothesis. "Shipping cost is unknown until checkout, so shoppers who are price-sensitive abandon at the cart; showing the delivery figure on the product page should reduce cart abandonment by at least three points" is one. The difference is that the second can fail, and you will know when it does.'),
    table('Two ways of writing the same idea', [
      ['Weak', 'Strong'],
      ['Make the CTA more prominent', 'Add-to-cart is below the fold on mobile; raising it above should lift add-to-cart rate'],
      ['Add trust signals', 'No reviews on the product page; adding them should lift add-to-cart for first-time visitors'],
      ['Simplify checkout', 'Forced account creation blocks guests; enabling guest checkout should lift completion rate'],
    ]),
    p('The right column names the observation, the mechanism and the metric. That is what lets the test settle the question rather than start an argument about interpretation.'),

    h3('Say which metric, before you build'),
    p('Choosing the success metric after seeing the results is how every change becomes a win. Something always moved. Naming the metric in advance — one primary, at most two secondary — is the single most important discipline in this whole loop.'),

    h3('Prioritise by expected value'),
    p('Effect size multiplied by the traffic through that step, divided by the effort. This is rough and it is enough to stop a team spending three weeks on a page 2% of sessions visit. Formal scoring frameworks exist and mostly add ceremony to the same arithmetic.'),

    h3('Keep a backlog, not a plan'),
    p('Hypotheses accumulate faster than you can test them, and the ranking changes as you learn. A living ranked list is more useful than a quarterly roadmap that is wrong by week three.'),
    img('hypothesis', 'A vague intention beside a specific falsifiable statement with a target metric', 'A hypothesis names the observation, the mechanism and the metric. Choosing the metric afterwards makes every change a win.'),

    h2('How small should the build be?'),
    p('Small enough that the result is attributable to one thing.'),
    p('The temptation is to fix everything you noticed while researching. Resist it — a variant with five changes that wins tells you the bundle was better, not which part. Sometimes that is acceptable and usually it is a wasted cycle, because you cannot carry the learning to the next page.'),

    h3('Test the mechanism, not the polish'),
    p('If the hypothesis is that delivery cost is the blocker, the test is showing the delivery cost. It does not need new iconography, a redesigned panel and a rewritten paragraph. Build the crudest version that tests the claim and make it beautiful once you know it matters.'),

    h3('Watch for performance side effects'),
    p('A variant that adds a script, an image or a font is testing your idea plus a slower page, and on mobile the slowdown can swamp the effect. Keeping the variant\'s weight comparable to the control is a condition of a valid test, not a nicety — [the same reason speed acts as a floor](/blog/shopify-performance-optimization).'),

    h3('Build it where it can be reverted'),
    p('A change made through a testing tool that overwrites the DOM is fine for a test and bad as a permanent implementation. Winners should be re-implemented properly in the theme; leaving them in the testing tool accumulates a layer of client-side patches nobody can audit.'),

    h2('How long should a test run?'),
    p('Until it reaches a sample size you calculated before starting, and at least two full weeks.'),
    p('This is where most teams break the loop. A test that looks positive on day three is showing you variance, and stopping when the numbers are favourable is a procedure that produces winners regardless of whether anything improved. The sample size and the duration are decided in advance and then honoured.'),

    h3('Two weeks is a floor, not a duration'),
    p('Behaviour differs by day of week, and payday and weekend cycles are real. A test that runs Monday to Friday has measured weekday shoppers. Two full weeks covers the cycle; four is better where traffic allows.'),

    h3('Calculate the sample size first'),
    p('Baseline conversion rate, the minimum effect worth detecting, and the confidence you want give you a required number of sessions per variant. If that number is more traffic than you get in six weeks, the test is not worth running — which is useful to know before building it rather than after.'),
    table('Roughly what it takes to detect a lift', [
      ['Baseline rate', 'Detect +10% relative', 'Detect +20% relative'],
      ['1%', '~155,000 per variant', '~40,000 per variant'],
      ['2%', '~77,000 per variant', '~20,000 per variant'],
      ['5%', '~30,000 per variant', '~7,500 per variant'],
    ]),
    p('Read that table once and a lot of conversion advice makes more sense. At a 1% baseline, detecting a 10% relative improvement takes a scale of traffic most stores do not have — which is why small stores should ship obvious fixes rather than test them.'),

    h3('Do not peek and act'),
    p('Looking at a running test is fine; deciding based on what you saw is not. Every early look is an opportunity to stop on noise, and a team that peeks daily will find a reason to stop early most times.'),
    img('sample-size', 'A result stabilising only after a substantial number of observations have accumulated', 'A test that looks positive on day three is showing variance. The sample size is calculated first and then honoured.'),

    h3('Segment the result before trusting it'),
    p('An overall flat result frequently hides a strong mobile win and a desktop loss cancelling each other out. Splitting the result by device before concluding anything is the cheapest additional analysis available, and on a majority-mobile store it changes the decision more often than it does not.'),
    img('peeking', 'A running result checked repeatedly, with several early moments that would have prompted a premature call', 'Looking is fine; deciding on what you saw is not. A team that peeks daily will find a reason to stop early most times.'),

    h2('What if you do not have the traffic?'),
    p('Then do not run tests — ship the obvious fixes and measure before and after.'),
    p('Most stores cannot reach statistical significance on anything short of a very large effect, and pretending otherwise produces confident nonsense. This is not a reason to skip conversion work; it is a reason to change the method.'),

    h3('Ship known-good practice without testing it'),
    p('Guest checkout, delivery cost on the product page, an above-the-fold add-to-cart on mobile, reviews on a product page with none — these are well-established and testing them at low traffic costs more than it teaches. Ship them and move on.'),

    h3('Compare periods carefully'),
    p('Before-and-after comparisons are confounded by season, campaigns and traffic mix. Comparing to the same period last year is better than to last month, and stating the confound out loud keeps everyone honest about what the number proves.'),

    h3('Use qualitative evidence more heavily'),
    p('At low traffic, twenty session recordings and ten customer conversations are a better basis for decisions than an underpowered test. The evidence is weaker in kind and stronger in practice than a result you cannot trust.'),

    h2('How do you decide?'),
    p('Against the rule you wrote before you started, which is the only defence against motivated reasoning.'),

    h3('Three outcomes, not two'),
    p('A test wins, loses, or is flat. Flat is the most common and the most misread — it means the change did not matter, which is genuinely useful information and should usually result in reverting to the simpler version.'),

    h3('A flat result is not permission to ship it anyway'),
    p('This is the second place the loop breaks. If the variant did nothing and somebody prefers it, that is a design decision made on taste, and it should be called that rather than dressed as a conversion win. Confusing the two is how a team stops trusting the process.'),

    h3('Losing tests are the valuable half'),
    p('A variant that lost has told you something true about your customers that you believed otherwise. Those findings generalise better than wins do, and they are the ones nobody records.'),

    h3('Check the secondary metrics before shipping a winner'),
    p('A change that lifts add-to-cart and depresses completion has moved the problem, not solved it. Revenue per session is the honest scoreboard, and a conversion-rate win with lower average order value is not a win.'),
    img('three-outcomes', 'Three possible verdicts where the middle one returns to the simpler starting point', 'Flat is the most common result and the most misread. If somebody prefers the variant anyway, call that a taste decision.'),

    img('low-traffic', 'A smaller store relying on direct observation rather than on statistical comparison', 'Below the traffic where tests can resolve, twenty recordings and ten customer conversations beat a result you cannot trust.'),

    h2('What does recording look like?'),
    p('One short entry per test, in a place the next person will find.'),
    p('Hypothesis, what was built, sample size, duration, result, decision, and one line on what it means. Ten minutes per test. The reason to bother is that in a year this document answers "have we tried this?" instantly, and without it every new hire re-proposes the test that failed in March.'),

    h3('Record the losers in the same place'),
    p('A log of only successes is a marketing document. The failures are what stop the same idea being rebuilt, and they are the part that makes the log worth keeping.'),

    h3('Note the context'),
    p('A result from a Black Friday period, or from before a price change, may not hold. A line about what else was happening keeps a future reader from over-trusting an old finding.'),

    h3('Keep it somewhere the whole team reads'),
    p('A log in a developer\'s repository is invisible to the marketing team who will propose the next test, and a document in a marketing folder is invisible to whoever implements it. Wherever the store\'s other decisions live is the right place — the format matters far less than whether anybody encounters it.'),
    img('test-log', 'A short record per experiment covering the claim, the sample, the outcome and the decision', 'Ten minutes per test. In a year it answers "have we tried this?" instantly, which is the entire reason to bother.'),

    h2('Where does the loop break?'),
    p('Three places, and they are the same three everywhere.'),
    ul([
      '**Stopping early.** A favourable-looking test on day four gets called, and the process now manufactures winners.',
      '**Shipping flat results.** The variant did nothing, somebody liked it, and it goes live as a conversion improvement.',
      '**Not recording anything.** The team has run forty tests and can describe six of them, all wins.',
    ]),
    p('Each of these is a discipline problem rather than a knowledge problem, which is good news — they are fixable by writing the rule down in advance and having somebody hold it. That is most of what a good conversion process is.'),

    h2('What does it cost?'),
    p('A day per cycle for a small store, and a genuine ongoing commitment.'),
    p('Measure is a day at the start and a few hours thereafter. Build is usually a day or two for a properly scoped test. The test stage costs waiting rather than effort, and decide and record together are an hour. The real cost is that it has to keep running, and a loop that stops after two cycles has produced two changes and no capability.'),
    p('The honest counterweight: conversion optimisation has a ceiling and teams routinely run past it. Once the obvious leaks are closed, the remaining gains get small, slow and fragile, and a team still running tests at that point is spending real money on decimal points while the larger levers — product, price, traffic quality, delivery proposition — go untouched. The loop should tell you when to stop, and a run of three flat results in a row usually is that signal.'),
    quote('A team with a disciplined loop and mediocre ideas beats a team with brilliant ideas and no loop. Only one of them is accumulating knowledge.'),

    h2('Conclusion'),
    p('The loop is measure, hypothesise, build, test, decide, record — and the last stage is the one that gets dropped, which is why teams relearn the same lessons and lose the losing tests that were the more informative half.'),
    p('Measure quantitatively to find the anomalous step and qualitatively to understand it: the funnel segmented by device tells you where, twenty session recordings tell you why, and your support inbox already knows the top three objections. Both halves take about a day together.'),
    p('Write hypotheses that can fail. Name the observation, the mechanism and the primary metric before you build, because choosing the metric after seeing the data makes every change a win. Then build the crudest version that tests the claim, keeping the variant\'s page weight comparable so you are not testing your idea plus a slower page.'),
    p('Calculate the sample size before starting and run at least two full weeks. At a 1% baseline, detecting a 10% relative lift needs traffic most stores do not have — and if that is you, ship the well-established fixes without testing them and lean harder on qualitative evidence rather than running experiments you cannot trust.'),
    p('Decide against the rule you set in advance. Flat is the most common outcome and it means revert, not ship-because-somebody-likes-it. Then write it down — hypothesis, sample, result, decision, one line of meaning — including the failures. Watch the three break points: stopping early, shipping flat results, and recording nothing. If you want this run as a standing process rather than a one-off audit, [that is what the CRO work is](/services).'),
  ),
  faqs: faq([
    ['How long should an A/B test run?',
     'Until it reaches a sample size you calculated before starting, and at least two full weeks. Behaviour varies by day of week and by payday cycles, so a Monday-to-Friday test has only measured weekday shoppers. Stopping when the numbers look good manufactures winners regardless of reality.'],
    ['What if my store does not have enough traffic to test?',
     'Then do not test — ship the well-established fixes and measure before and after. At a 1% baseline conversion rate, detecting a 10% relative lift needs roughly 155,000 sessions per variant. Below that scale, session recordings and customer conversations are a better basis for decisions.'],
    ['What should I do with a flat test result?',
     'Revert to the simpler version. Flat means the change did not matter, which is genuinely useful information. If somebody prefers the variant anyway that is a taste decision and should be called one — shipping it as a conversion win is how teams stop trusting the process.'],
    ['Why record the tests that failed?',
     'Because they generalise better than wins and nobody writes them down. A log of only successes is a marketing document. The failures are what stop a new hire re-proposing in November the test that already lost in March, and they say more about your customers than the wins do.'],
    ['How do I write a good hypothesis?',
     'Name the observation, the mechanism and the metric, so the statement can be wrong. "Improve the product page" cannot fail; "shipping cost is unknown until checkout, so showing it on the product page should cut cart abandonment by three points" can, and you will know when it does.'],
  ]),
};
