import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ai-evaluation-harness/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ai-evaluation-harness',
  slug: 'ai-evaluation-harness',
  title: 'Evaluating an AI Feature Before You Trust It',
  category: 'ai',
  order: 21,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-11',
  series: 'AI safety',
  excerpt:
    'A test set, a scoring method and a regression check — so a prompt change cannot quietly make your answers worse without anyone noticing.',
  coverLabel: 'AI evaluation — cover',
  body: body(
    p('Most AI features are shipped on impressions. Someone tries ten questions, the answers look good, and it goes live. Then a prompt gets adjusted to fix a tone complaint, and nobody discovers for three weeks that the change also made the system twice as likely to invent an answer it should have declined.'),
    p('That failure is invisible without measurement, and measurement is far cheaper than people assume. Fifty labelled questions and a scoring script is an afternoon of work, and it is the difference between engineering and guessing.'),
    p('It is also the artefact that earns most after launch rather than during the build, which is why it goes into the base scope of [every AI project I quote](/services) rather than appearing as an optional extra.'),

    h2('Why are vibes not enough?'),
    p('Because the failures that matter are the ones you will not think to check.'),
    p('Manual testing is biased toward questions you already know the system handles. You ask what the product is for, it answers well, and you move on. Nobody manually tests the question the corpus does not cover, or the one whose answer sits in a badly parsed table, or the adversarial phrasing that talks the model out of declining.'),
    p('Manual testing is also not repeatable. When you change the prompt next month, you cannot compare against last month\'s ten questions because you do not remember what they were or exactly how good the answers seemed. Every change becomes an unmeasured bet.'),
    p('The most consequential regressions are silent. Accuracy on answerable questions stays flat, so nothing looks wrong, while refusal behaviour on unanswerable ones quietly collapses. That specific pattern — better tone, worse honesty — is the most common regression I have seen, and no amount of trying it out catches it.'),
    img('vibes-vs-measurement', 'A scattered handful of markers beside an ordered grid of the same markers', 'Ten remembered questions against fifty labelled ones. Only one of them is comparable next month.'),

    h2('What goes in the test set?'),
    p('Real questions, drawn from actual usage or from the people who will use it. Fifty is enough to be useful; a hundred is comfortable; five hundred is a research project nobody asked for.'),

    h3('Questions the system should answer'),
    p('The bulk of the set. Each one labelled with which document or passage contains the answer, and ideally a short reference answer. This is what measures retrieval and correctness.'),

    h3('Questions the system should decline'),
    p('Perhaps a fifth of the set. Things plausibly related to the domain but genuinely absent from the corpus. Without these you cannot measure honesty, and honesty is the property that degrades most easily.'),

    h3('Questions with an exact identifier'),
    p('Product codes, error numbers, reference IDs. These specifically test whether hybrid search is working, because pure embedding search fails on them in a way that aggregate accuracy hides.'),

    h3('Adversarial phrasings'),
    p('The same question asked in a leading way — "confirm that X is true" when X is false. Models are trained toward agreeableness, and this is where that training shows.'),
    p('Draw from real usage as soon as you have any. Questions people actually ask are more varied, worse phrased and more revealing than questions you invent, and the log of queries that returned nothing useful is the best source there is.'),

    h2('What should you actually measure?'),
    p('Four numbers, and they measure different halves of the system. Reporting a single accuracy figure hides which half is broken.'),
    table('The four metrics and what each one tells you', [
      ['Metric', 'Measures', 'Automatable', 'Target'],
      ['Retrieval hit rate at k', 'Did the right passage reach the model', 'Fully', 'Above 85%'],
      ['Answer correctness', 'Was the answer right', 'Partly', 'Domain-specific'],
      ['Citation validity', 'Do cited sources exist', 'Fully', '100%'],
      ['Refusal correctness', 'Did it decline when it should', 'Fully', 'Above 90%'],
    ]),
    p('Retrieval hit rate is the one that predicts everything else, and it is fully automatable because you labelled the correct source when you built the set. If it is low, nothing downstream can be fixed by prompt work — the model never received the answer.'),
    p('Citation validity should sit at exactly 100% and it is trivial to check: every cited identifier must exist in the set actually sent to the model. Anything below 100% means invented citations are reaching users, which is worse than no citations at all.'),

    h2('How do you score correctness automatically?'),
    p('Three approaches, and most systems need a mix rather than a single method.'),

    h3('Exact match on extracted facts'),
    p('Where the answer is a number, a date or a name, compare directly. Cheap, deterministic, no ambiguity. Applicable to fewer questions than you would like, and completely reliable where it applies.'),

    h3('Keyword or entity presence'),
    p('Check the answer contains the entities the reference answer contains. Crude, and it catches the case where the system answers about entirely the wrong thing. Good as a fast first filter, poor at distinguishing a good answer from a mediocre one.'),

    h3('A model as judge, carefully'),
    p('Give a second model the question, the reference answer and the generated answer, and ask it to score. This works better than expected and it comes with real caveats.'),
    p('Use a different model from the one being evaluated, or at minimum a different prompt, because models rate their own output generously. Give a narrow rubric with concrete criteria rather than asking for a general quality score. And calibrate against human judgement on a sample before trusting it — the useful question is whether the judge agrees with a person, not whether it produces plausible numbers.'),
    img('scoring-methods', 'Three measuring instruments of increasing complexity beside one output', 'Exact where possible, entity presence as a filter, a judge model only where neither works.'),

    h2('What does the harness look like in practice?'),
    p('A file of cases, a runner, and a stored result per run. It does not need to be sophisticated — it needs to exist and be runnable in one command.'),
    code('ts', `
type EvalCase = {
  id: string;
  question: string;
  expectedSourceIds: string[];   // for retrieval hit rate
  referenceAnswer?: string;      // for correctness
  shouldRefuse?: boolean;        // for the honesty set
  tags: string[];                // 'exact-id', 'adversarial', ...
};

// One command, deterministic ordering, results written to a file per run.
// npm run eval -- --tag adversarial
`),
    p('Store every run with the prompt version, the model, the retrieval configuration and the resulting scores. That history is what lets you answer "when did this get worse" months later, and reconstructing it after the fact is impossible.'),
    p('Keep the run fast enough that nobody avoids it. Fifty cases against a real model takes a few minutes and costs a few cents, which is comfortably inside what a person will run before opening a pull request. A suite that takes twenty minutes will be skipped under deadline pressure, which is exactly when it is most needed.'),

    h2('When should the harness run?'),
    p('On every change to anything that can affect output, which is a wider set than people expect.'),
    ul([
      '**Prompt edits** — the most common cause of silent regression, and the change that feels most harmless.',
      '**Retrieval changes** — chunking, indexing, reranking, the number of passages sent.',
      '**Model or version changes** — including provider-side updates you did not initiate.',
      '**Content changes** — a large corpus update can move retrieval quality substantially.',
      '**Routing changes** — sending a task to a cheaper model is exactly the change that needs measuring.',
    ]),
    p('In continuous integration, run the fast deterministic subset — retrieval hit rate and citation validity — on every pull request. Run the full set including judged correctness nightly, because it is slower and costs money, and a regression caught the next morning is caught early enough.'),

    h2('What should block a deploy?'),
    p('Set thresholds and enforce them, otherwise the harness becomes a dashboard nobody reads.'),
    p('Citation validity below 100% should block outright — invented citations are a correctness failure with no acceptable rate. Retrieval hit rate dropping more than a few points from the current baseline should block, because that is a large regression appearing suddenly.'),
    p('Judged correctness is noisier and deserves a wider band, but a sharp drop should still stop the deploy. Refusal correctness dropping is the one people forget to gate on, and it is the regression most likely to reach users unnoticed.'),
    p('Compare against the last known-good run rather than an absolute number. Absolute thresholds either sit so low they never fire or so high they block legitimate work, whereas a relative comparison catches the thing you actually care about: something got worse.'),
    img('gate', 'A gate with one item passing and one held back against a measured reference line', 'Compare against the last good run. Absolute thresholds either never fire or always do.'),

    h2('How do you evaluate retrieval separately?'),
    p('This is the highest-value measurement and the easiest to automate, because it needs no model at all.'),
    p('For each case, run retrieval and check whether any of the labelled source identifiers appear in the top k returned. That single number is your retrieval hit rate, and it tells you immediately whether a bad answer is a retrieval problem or a generation problem.'),
    p('Measure at several values of k. Hit rate at 20 being high while hit rate at 5 is low means retrieval is finding the right passage and ranking it badly — which is precisely the situation [a reranker fixes](/blog/rag-that-answers), and it is invisible if you only measure at one k.'),
    p('Because it needs no generation, this runs in seconds and costs nothing. There is no reason not to have it on every pull request.'),

    h2('How do you keep the test set honest?'),
    p('A test set that never changes stops reflecting reality, and one that changes carelessly stops being comparable.'),

    h3('Add from real failures'),
    p('Every genuine bad answer reported by a user becomes a case. This is the highest-quality source of new cases available, and it means the set converges on the things that actually go wrong rather than the things you imagined would.'),

    h3('Version the set'),
    p('When you add cases, the scores are no longer comparable to previous runs. Version it, and when comparing across a version boundary, re-run the old baseline against the new set rather than comparing incomparable numbers.'),

    h3('Do not tune against it exclusively'),
    p('A prompt optimised until it scores perfectly on fifty known questions may be worse on the other thousand. Hold a portion back, or refresh periodically from real usage, so the set measures generalisation rather than memorisation.'),

    h2('What does it cost to build?'),
    p('Half a day for the harness and the runner. A day for the labelled set, mostly spent by a person who knows the domain deciding which document answers each question.'),
    p('That day is frequently the most valuable in the whole project. On one build the first evaluation run returned a 61% retrieval hit rate, which was unshippable, and the two days spent fixing it were only possible because the number existed. Without the harness the same system would have shipped and the problem would have arrived as vague complaints that answers were unreliable.'),
    p('The ongoing cost is a few hours a quarter refreshing cases, plus a few cents per run. Against the cost of a silent regression reaching customers, this is not a close comparison.'),
    quote('Without an evaluation set, "is it good enough" is an argument between people with different impressions. With one, it is a number two people can disagree about productively.'),

    h2('How do you evaluate tool-calling and agents?'),
    p('Features that take actions rather than produce text need a different shape of test, because correctness is about what happened rather than what was said.'),

    h3('Assert the call, not the prose'),
    p('For a booking assistant, the thing to check is that `book_appointment` was called with the right service, the right time and the right customer. The wording around it is almost irrelevant. Build cases as conversations with an expected sequence of tool calls and arguments.'),
    p('Compare structurally rather than exactly. A model that calls `check_availability` twice before booking is not wrong, so assert that the required calls happened with the right arguments rather than that the trace matches exactly.'),

    h3('Test the refusal to act'),
    p('Just as important as testing that it acts. Given a request it should escalate — an ambiguous date, a service you do not offer, a cancellation from someone who cannot be identified — assert that no tool call happened and the escalation path fired.'),
    p('This is the agent equivalent of refusal correctness, and it degrades the same way: a prompt reworded to be more helpful becomes more willing to guess, and the guess writes to your database. Everything relies on [validation catching malformed calls](/blog/validating-llm-tool-calls-zod), but validation cannot catch a well-formed call that should not have been made at all.'),

    h3('Run against a stubbed service layer'),
    p('The evaluation should never book real appointments. Stub the service layer so calls are recorded and asserted rather than executed, which also makes the suite fast and repeatable.'),
    img('tool-call-evals', 'A conversation path resolving into a sequence of discrete action markers', 'For agents, the assertion is on the actions taken, not the words around them.'),

    h2('How do you interpret a score that moved?'),
    p('Carefully, because the first instinct — that the change you just made caused it — is often wrong.'),
    p('Small movements are noise. Model output varies between runs even at low temperature, so a two-point change on a fifty-case set may be nothing. Run the baseline twice before concluding anything, and get a feel for how much your set moves on its own.'),
    p('When a score genuinely drops, look at the failing cases individually before touching the prompt. Frequently the pattern is obvious and specific — all the failures share a document type, or a question phrasing, or an identifier format — and the fix is in retrieval or parsing rather than in generation.'),
    p('Watch for scores moving in opposite directions, which is the signal that a change traded one property for another. Correctness up and refusal correctness down means the system became more willing to answer, which improves the metric you were watching and degrades the one you were not. That trade is almost never the one you want.'),
    p('And re-run before reacting to a single bad result. A provider having a slow afternoon can produce timeouts that score as failures, and rewriting a prompt in response to infrastructure noise is a good way to make things genuinely worse.'),
    img('score-movement', 'Two trend lines diverging, one rising and one falling', 'Two metrics moving in opposite directions is a trade, not an improvement.'),

    h2('What about features without a right answer?'),
    p('Summarisation, tone rewriting and creative work have no reference answer, and the instinct is to conclude they cannot be measured. They can, just differently.'),
    p('Measure the properties you actually require rather than correctness. Does the summary preserve the key entities from the source? Is it within the length bounds? Does it introduce facts absent from the input — which is checkable by extracting claims and verifying each against the source? Is the required tone present, judged by a model against a narrow rubric?'),
    p('Those constraint checks catch the failures that matter. A summary that invents a figure is unacceptable regardless of how well written it is, and that is exactly the kind of thing an automated check finds and a human skim does not.'),
    p('The general principle transfers to anything subjective: stop trying to measure quality and start measuring the specific properties whose absence would make the output unusable. Those are nearly always enumerable, and once enumerated they are nearly always checkable. What remains genuinely unmeasurable — whether the prose is pleasant — is also the part where a regression costs least.'),

    h2('Conclusion'),
    p('Build the test set before the feature. Fifty real questions, each labelled with its source, a fifth of them unanswerable so you can measure honesty, some carrying exact identifiers, some phrased adversarially.'),
    p('Measure four things separately — retrieval hit rate, answer correctness, citation validity and refusal correctness — because a single number hides which half of the system broke. Automate the two that are fully automatable and run them on every pull request. Gate deploys against the last known-good run rather than an absolute threshold.'),
    p('Then feed every real failure back in as a case. The set gets more useful over time, the regressions get caught before users find them, and "we changed the prompt and it seems fine" stops being something anyone has to say.'),
    img('harness-loop', 'A closed loop of markers with one feeding back into the start', 'Every real failure becomes a permanent case. The set converges on what actually breaks.'),
    p('If you are retrofitting this onto something already live, start with retrieval hit rate alone. It needs no model, no judge and no reference answers — only questions labelled with their correct source — and it is the number that predicts everything else. You can have it running in an afternoon, and it will usually tell you immediately whether the problem you are chasing is in retrieval or generation. Everything else on this page can follow once you know which half of the system you are actually working on.'),
  ),
  faqs: faq([
    ['How do you test an AI feature?',
     'Build a set of fifty real questions, each labelled with the document that answers it, including some the system should decline. Then measure retrieval hit rate, answer correctness, citation validity and refusal correctness separately, and run the automatable ones on every change.'],
    ['What is an LLM evaluation set?',
     'A collection of labelled test cases — questions with known correct sources and reference answers — used to score the system consistently across changes. It is what turns "the answers seem better" into a number you can compare against last month.'],
    ['Can you use an LLM to grade another LLM?',
     'Yes, with care. Use a different model or at minimum a different prompt, since models rate their own output generously. Give a narrow rubric rather than asking for general quality, and calibrate against human judgement on a sample before trusting the scores.'],
    ['How do you stop prompt changes making things worse?',
     'Run the evaluation set on every prompt change and gate the deploy against the last known-good run. The regression that matters most is usually refusal correctness, which drops when a prompt is reworded to sound friendlier while accuracy appears unchanged.'],
  ]),
};
