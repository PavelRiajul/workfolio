import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/cro-experiment-results/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-cro-experiment-results',
  slug: 'cro-experiment-results',
  title: 'Reading an Experiment Result Without Fooling Yourself',
  category: 'ecommerce',
  order: 97,
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-11',
  series: 'CRO',
  excerpt:
    'The test finished and the number is green. Here is what to check before you ship it, and the ways a result can be real and still not repeat.',
  coverLabel: 'Experiment results — cover',
  body: body(
    p('Running an experiment is the easy part. Reading it correctly is where the value is created or thrown away, and most teams throw it away in the same handful of ways — stopping when the line looked good, celebrating a number the sample never supported, or shipping a variant that did nothing because somebody preferred it.'),
    p('The frustrating thing is that a badly read experiment is worse than no experiment. It produces a decision with a number attached, which is far harder to argue with than an opinion, and it makes the whole programme less trustworthy the third time it happens.'),
    p('This is the checklist I apply to a finished test before acting on it: what the numbers mean, what to verify, what to do with each outcome, and the failure modes that look like wins. It is the decide stage of [the conversion loop](/blog/cro-process-loop), done properly.'),

    h2('What do the numbers actually mean?'),
    p('Less than the interface implies, and the phrasing matters.'),
    p('A tool reporting "92% probability to beat baseline" is not saying the variant is 92% better, and a p-value of 0.04 is not saying there is a 4% chance you are wrong. Both are statements about how surprising your data would be under a specific assumption, and the gap between that and what people hear is where most misreadings begin.'),
    table('What the common numbers mean', [
      ['Reported', 'What it means', 'What people hear'],
      ['p = 0.04', 'Data this extreme is unlikely if there were no effect', 'A 4% chance of being wrong'],
      ['95% confidence', 'The method captures the true value 95% of the time', 'A 95% chance this result is right'],
      ['+12% uplift', 'The point estimate from this sample', 'Conversion will rise 12%'],
      ['Interval −2% to +26%', 'The effect is plausibly anywhere in here', '(Usually not read at all)'],
    ]),
    p('The bottom row is the one that matters most and gets displayed least prominently. A headline uplift of 12% with an interval spanning −2% to +26% is a result that is entirely consistent with the change doing nothing, and shipping it on the strength of the headline is shipping on noise.'),

    h3('Read the interval, not the point estimate'),
    p('If the range includes zero, the honest summary is "we cannot tell". If the whole range is positive but the lower bound is 1%, the honest summary is "probably a small win". Both are useful and neither is the number on the card.'),

    h3('The reported uplift is an overestimate'),
    p('This is not intuitive and it is important. Tests that reach significance tend to do so partly because the sample happened to favour the variant, so the measured effect is systematically larger than the real one. Expect the effect in production to be smaller than the result claimed, and budget accordingly.'),
    img('interval', 'A headline figure shown alongside the much wider range of values the data actually supports', 'A +12% headline with an interval from −2% to +26% is consistent with the change doing nothing at all.'),

    h2('Did the test run properly?'),
    p('Check this before reading the result, because a broken test produces a number regardless.'),

    h3('Was the sample reached?'),
    p('The size calculated before starting, not the size that happened to accumulate. A test stopped at 60% of its target has a wider interval than the tool\'s headline suggests and a much higher false-positive rate, whatever the display says.'),

    h3('Did it run for at least two full weeks?'),
    p('Behaviour differs by day of week, and payday cycles are real. A test covering nine days has measured a specific slice of the month, and if that slice included a campaign or a bank holiday it has measured the campaign.'),

    h3('Was the split actually even?'),
    p('A 50/50 test that delivered 52/48 traffic is a sample ratio mismatch, and it usually means something is wrong with assignment — a bot filter, a caching layer, a redirect. That is a reason to discard the result rather than to interpret it.'),

    h3('Did both variants perform normally otherwise?'),
    p('Compare the pages on things the test should not have affected — load time, error rate, bounce on unrelated pages. A variant that was 400ms slower was testing your idea plus a slower page, and on mobile the slowdown can be the whole effect. [Speed acts as a floor](/blog/shopify-performance-optimization) and it contaminates results quietly.'),

    img('validity-checks', 'A finished test being verified against its own preconditions before its result is read', 'Check the test before reading it. A broken experiment reports a number just as confidently as a sound one.'),

    h2('Is the win real?'),
    p('Four checks that separate a finding from a coincidence.'),

    h3('Does the mechanism make sense?'),
    p('A result you cannot explain is a result you should not trust much. If moving a button lifted conversion, that is plausible. If changing a footer colour lifted checkout completion by 15%, something else happened and it is worth finding out what.'),

    h3('Did the secondary metrics hold?'),
    p('A change that lifts add-to-cart while depressing completion has moved the problem downstream, not solved it. Revenue per session is the honest scoreboard — a conversion-rate win with a lower average order value is frequently a loss.'),

    h3('Does it survive segmentation?'),
    p('Split the result by device and by new versus returning visitors. A flat overall result concealing a strong mobile win and a desktop loss is common and changes the decision entirely. So is a "win" driven entirely by one traffic source that was running an unrelated campaign.'),

    h3('Would you have believed the opposite?'),
    p('The most useful question in the list. If the result had gone the other way, would you have accepted it as readily, or gone looking for reasons the test was flawed? An honest answer usually reveals whether you are reading or confirming.'),
    img('segmented', 'One overall figure separating into two opposing effects when broken down by device', 'A flat overall result often conceals a strong mobile win and a desktop loss. That changes the decision entirely.'),

    h2('What do you do with a flat result?'),
    p('Revert, and record it — this is the most common outcome and the most mishandled.'),
    p('Flat means the change did not matter at the scale you can detect. That is genuinely useful: it tells you the thing you thought was blocking people was not, which redirects effort better than another small win would. Treating it as a failure of the experiment rather than an answer is what makes teams stop running them.'),

    h3('Revert to the simpler version'),
    p('If two versions perform identically, keep the one that is less code, fewer requests and easier to maintain. Complexity that buys nothing should not survive on the grounds that it already exists.'),

    h3('Do not ship it because somebody prefers it'),
    p('If the variant did nothing and a stakeholder likes it, that is a taste decision and should be called one. It may well be the right call — brand consistency is a real reason — but describing it as a conversion improvement is how the numbers stop meaning anything internally.'),

    h3('Ask whether the test was too small to detect the effect'),
    p('A flat result on an underpowered test means "we could not tell", not "there is no effect". If the interval spans −8% to +9%, a genuine 3% improvement was never detectable, and concluding the change does not work is overreading the data.'),

    h3('Consider what else changed that fortnight'),
    p('A test does not run in isolation. A price change, a stock-out on a popular line, a campaign sending different traffic, or a competitor’s promotion all move conversion during the window and none of them appear in the tool. Writing down what else was happening turns an unexplained result into an explained one.'),
    img('flat-result', 'Two versions performing indistinguishably, with the simpler one retained', 'Flat is an answer, not a failure. Keep whichever version is less code — complexity that buys nothing should not survive.'),

    h2('What do you do with a loss?'),
    p('Learn from it, because losses generalise better than wins.'),
    p('A variant that lost has told you something true about your customers that you believed otherwise, and that belief was probably applied elsewhere on the site. Finding out that adding urgency messaging depressed conversion is more valuable than another confirmation that a bigger button helps, because it changes what you do next in several places.'),

    h3('Check it was not an implementation bug'),
    p('A large unexplained loss is often a broken variant rather than a bad idea — a button that failed on Safari, an image that did not load, a script error on one device class. Look at the error rate before concluding anything about the hypothesis.'),

    h3('Write down what it disproved'),
    p('Specifically. "Adding a countdown timer to the product page reduced completed orders by 4%" is a finding somebody can act on in a year. "The urgency test failed" is not.'),

    h3('Losses are why the log exists'),
    p('A record of only wins is a marketing document. The failures are what stop a new colleague re-proposing in November the test that already lost in March, and they are the half of the record that nobody keeps.'),

    h2('When can you trust a small win?'),
    p('When it is cheap to keep, consistent across segments, and you are not stacking it on other unverified small wins.'),
    p('A 2% lift that clears significance on a well-run test is probably real and probably smaller than 2%. If the change costs nothing to maintain, ship it. The problem is not any individual small win; it is a programme that has claimed fourteen of them and cannot find the 30% compound improvement they imply.'),

    h3('Beware the accumulation fallacy'),
    p('Small wins do not add up the way a spreadsheet suggests. They interact, they decay, and some were false positives that nobody revisited. Reporting a cumulative uplift by multiplying individual results out is a number that will not survive contact with the actual conversion rate.'),

    h3('Re-test the important ones'),
    p('If a result is going to drive significant investment, run it again. Replication is unglamorous and it is the only real defence against a false positive, and the second run costs a fraction of the decision it protects.'),

    h3('Check the effect persists'),
    p('Novelty effects are real: returning visitors respond to a change partly because it is new, and that response fades. A win measured in week one that has vanished by week six was a reaction to change rather than an improvement, and only looking again reveals it.'),
    img('accumulation', 'Individual small gains that do not combine into the total a naive sum would predict', 'Fourteen claimed small wins rarely produce the compound improvement they imply. They interact, they decay, and some were noise.'),

    h2('What are the common ways to be wrong?'),
    p('Five, and they account for most bad decisions in conversion work.'),
    ul([
      '**Stopping early** — checking daily and calling it when the line looks good, which manufactures winners from noise.',
      '**Choosing the metric afterwards** — something always moved, so any test can be a win if you pick the number last.',
      '**Testing many things at once** — twenty simultaneous comparisons will produce a "significant" result by chance alone.',
      '**Ignoring the interval** — reading the point estimate as the effect and shipping on a range that includes zero.',
      '**Not segmenting** — an aggregate that hides opposite effects on mobile and desktop.',
    ]),
    p('The first is by far the most common and the easiest to fix, because it requires no statistics — only the discipline to write down the duration in advance and honour it.'),

    h3('Multiple comparisons deserve their own warning'),
    p('If you measure eight metrics on one test, one of them will look significant at the usual threshold by chance. That is not a subtle statistical point; it is arithmetic. Naming one primary metric before starting is what protects you from it.'),

    img('failure-modes', 'Several routines that reliably turn noise into an apparent finding', 'Stopping early is the most common and the easiest to fix — it needs no statistics, only a duration written down in advance.'),

    h2('How do you report a result?'),
    p('In a short, honest format that includes what you did not learn.'),
    ol([
      '**The hypothesis** as it was written before the test.',
      '**What was built,** in one sentence.',
      '**Sample and duration** — planned and actual.',
      '**The result,** with the interval, not only the point estimate.',
      '**Segment breakdown** by device at minimum.',
      '**The decision** and, in one line, what it means for what you do next.'],
    ),
    p('Ten minutes per test. The value is entirely in a year\'s time, when somebody asks whether you have tried something and the answer takes thirty seconds instead of a week.'),

    h3('Say what you could not detect'),
    p('A line stating the smallest effect the test could have found is worth including, because it distinguishes "this does nothing" from "we could not tell". Those two conclusions lead to very different next steps.'),

    h3('Write for the person who was not there'),
    p('In eighteen months everybody in the room will have partially forgotten and some will have left. A result that needs its author present to interpret is a result that will be re-run, which is the cost the log exists to avoid — the same argument as [documenting anything else non-obvious](/blog/project-handover-checklist).'),
    img('report-format', 'A concise record covering the claim, the sample, the range and the resulting decision', 'Ten minutes per test. The value arrives in a year, when "have we tried this?" takes thirty seconds instead of a week.'),

    h2('When should you stop testing?'),
    p('When three consecutive tests come back flat, which is usually the signal that the cheap wins are gone.'),
    p('Conversion work has a ceiling. Once the obvious leaks are closed, remaining gains get small, slow and statistically fragile, and a team still grinding out tests at that point is spending real money on decimal points while the larger levers go untouched.'),

    h3('The bigger levers are harder conversations'),
    p('Price, product range, delivery proposition and traffic quality all move conversion more than any page change, and none of them are a developer\'s decision. A conversion programme that never escalates to those is optimising within a constraint nobody has examined.'),

    h3('Return to the funnel, not to the backlog'),
    p('Rather than working further down a list of hypotheses about one page, re-run the funnel measurement. The leak has often moved, and the next round of work belongs somewhere else entirely — [which is where the loop restarts](/blog/ecommerce-conversion-leaks).'),

    h2('What does it cost?'),
    p('An hour per result to read properly, against weeks of work spent acting on one read badly.'),
    p('Checking the sample, the duration, the split, the interval and the segments is genuinely under an hour. Writing the record is ten minutes. That is a very small tax on a test that took three weeks to produce, and it is the step most often skipped because the result is already on screen and everybody wants to move.'),
    p('The honest counterweight: rigour has a cost too, and it is possible to be so careful that nothing ever ships. Most stores do not have the traffic to resolve a 3% effect, and a team that refuses to act without significance on a store like that will act on nothing at all. The correct response to low traffic is not more statistical caution — it is to ship well-established improvements without testing them and reserve experiments for the genuinely uncertain and genuinely expensive decisions.'),
    quote('A badly read experiment is worse than no experiment. It produces a decision with a number attached, which is much harder to argue with than an opinion.'),

    h2('Conclusion'),
    p('Read the interval rather than the headline. A +12% uplift with a range from −2% to +26% is entirely consistent with the change doing nothing, and the reported effect is systematically larger than the real one because tests reach significance partly when the sample happened to favour the variant.'),
    p('Verify the test before interpreting it: was the calculated sample reached, did it run two full weeks, was the traffic split actually even, and did both variants behave normally on things the test should not have touched. A variant 400ms slower was testing your idea plus a slower page.'),
    p('Then check whether the win is real — does the mechanism make sense, did secondary metrics hold, does it survive segmentation by device and visitor type, and would you have accepted the opposite result as readily. Revenue per session is the honest scoreboard, not conversion rate.'),
    p('Treat flat as an answer rather than a failure: revert to the simpler version, record what it disproved, and do not let a preference be reported as a conversion improvement. Treat losses as the valuable half, after ruling out an implementation bug, because they generalise better than wins and nobody writes them down.'),
    p('Watch the five failure modes — stopping early, choosing the metric afterwards, testing many things at once, ignoring the interval, and not segmenting. And know when to stop: three flat results in a row usually means the cheap wins are gone and the remaining levers are price, product, delivery and traffic quality, which are harder conversations than any page change. If you want the programme run with that discipline built in, [that is the CRO work](/services).'),
  ),
  faqs: faq([
    ['What does 95% confidence actually mean?',
     'That the method used captures the true effect 95% of the time across many repetitions — not that there is a 95% chance this particular result is correct. The more useful output is the confidence interval: if it includes zero, the honest summary is that you cannot tell.'],
    ['Why is my measured uplift bigger than what I see after shipping?',
     'Because tests reach significance partly when the sample happened to favour the variant, so the reported effect is systematically inflated. Expect the production effect to be smaller than the headline, and treat the lower bound of the interval as the more realistic planning figure.'],
    ['What should I do with a flat result?',
     'Revert to the simpler version and record what it disproved. Flat means the change did not matter at a detectable scale, which is genuinely useful information. If the test was underpowered, though, flat means "we could not tell" rather than "there is no effect" — check the interval width.'],
    ['How do I know a win is not a false positive?',
     'Check the mechanism is explicable, that secondary metrics and revenue per session held, and that the result survives segmentation by device and visitor type. If the finding will drive significant investment, run it again — replication is the only real defence and costs a fraction of the decision.'],
    ['When should we stop running experiments?',
     'When three consecutive tests come back flat. That usually means the cheap wins are gone and further testing is spending real money on decimal points. At that point the larger levers are price, product range, delivery proposition and traffic quality, none of which are page changes.'],
  ]),
};
