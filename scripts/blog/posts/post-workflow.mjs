import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/building-with-ai-workflow/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-building-with-ai-workflow',
  slug: 'building-with-ai-workflow',
  title: 'How I Actually Build With AI — and Where I Still Do the Work',
  category: 'ai',
  order: 1,
  readTime: '12 min read',
  date: 'November 2025',
  publishedAt: '2025-11-18',
  series: 'AI workflow',
  excerpt:
    "The honest version of an AI-accelerated workflow: what gets generated, what gets rewritten, and the review discipline that keeps fast from meaning fragile.",
  coverLabel: 'AI workflow — cover',
  body: body(
    p('"AI-accelerated" is doing a lot of work in a lot of marketing copy right now, usually without anyone saying what it means. Here is what it means in my practice, including the parts that are less flattering than the pitch.'),
    p('The short version: generation compresses the typing by roughly two to three times and does approximately nothing for the parts of a project that decide whether it succeeds. Scoping, data modelling, security and knowing what to cut are unchanged, and they are where the difficulty always was.'),
    p('That is the counterweight to every speed claim on this site, and it is not modesty. It is the thing that makes the speed claim safe to believe.'),

    h2('What does AI actually write?'),
    p('The division is consistent enough across projects to state as a rule, and it maps closely onto how much a wrong answer costs.'),

    h3('Almost entirely generated'),
    p('Scaffolding, forms, CRUD endpoints, component shells, migrations from a schema I have already decided, and the first pass of tests. This is work where the correct answer is conventional, the patterns are well established, and the value is producing it quickly rather than producing it thoughtfully.'),
    p('It is also work where mistakes are loud. A malformed component fails to render; a broken endpoint returns an error. You find out immediately, which is what makes generation safe here.'),

    h3('Generated, then substantially rewritten'),
    p('Business logic and data transformation. A generated first draft gets past the blank file and establishes a shape, and roughly half of it survives contact with the actual requirements. The useful framing is that it produces a strawman quickly, not a solution.'),

    h3('Written by hand, every time'),
    p('Authentication, permissions, anything touching payments, database migrations against live data, and the data model itself. These fail quietly and expensively, and reviewing generated code in these areas takes longer than writing it does.'),
    p('That last point is the one people find surprising. Generation is not free — reading unfamiliar code carefully and verifying its assumptions is real work. Below a certain level of subtlety it is cheaper to write it yourself and know exactly what it does.'),
    table('Where the time goes on a typical two-week feature', [
      ['Task', 'Written by AI', 'Owned by me'],
      ['Scaffolding and boilerplate', 'Almost all', 'Naming and file layout'],
      ['Data model', 'A first draft', 'Every decision that survives'],
      ['Business logic', 'Roughly half', 'Correctness and edge cases'],
      ['Tests', 'The obvious paths', 'The paths that actually break'],
      ['Security and auth', 'Nothing I keep', 'All of it'],
    ]),

    h2('How much faster is it, honestly?'),
    p('Two to three times on the typing-heavy portions. Close to zero on everything else.'),
    p('On a two-week feature, the parts that compress are perhaps 40% of the calendar. Compressing 40% by 2.5x saves around a quarter of the total, which is meaningful and is not the order-of-magnitude change the marketing implies. The remaining 60% — deciding what to build, modelling the data, handling the edge cases nobody described, reviewing, fixing — moves very little.'),
    p('Where it compounds is in the willingness to do things properly. When scaffolding a second admin screen costs twenty minutes instead of half a day, you build the second admin screen instead of overloading the first. The quality benefit of cheap boilerplate is easy to miss and probably larger than the time saving.'),
    img('speed-split', 'Two bands of differing width, the narrower one compressed considerably', 'Generation compresses part of the work. The larger part is unchanged.'),

    h2('What does the review discipline look like?'),
    p('This is the part that separates fast from fragile, and it is unglamorous.'),

    h3('Read every line before it is committed'),
    p('Not skimmed — read. Generated code is plausible by construction, which is exactly what makes it dangerous. It looks like the code you would have written, and the difference is usually one assumption buried three lines in.'),

    h3('Reject on unfamiliar patterns'),
    p('If generated code introduces a pattern the codebase does not already use — a new state approach, an unfamiliar library, a different error convention — it gets rewritten. Consistency is worth more than the individual snippet, and a codebase with five idioms for the same thing is one nobody can maintain.'),

    h3('Delete confidently'),
    p('The temptation is to keep code that works because it exists. Generated code is cheap to regenerate, which means the sunk-cost feeling is illusory. If it is not right, delete it rather than editing around it.'),

    h3('Test the paths that matter, not coverage'),
    p('Generated tests cover the obvious paths and rarely the ones that break. I write the tests for signup, permissions and anything touching money by hand, because those are the tests that earn their keep and the ones a model is least likely to get right.'),
    img('review-gate', 'A sequence of gates with some items passing and others diverted', 'Generation without review is not fast. It is deferred.'),

    h2('What does this look like on a real project?'),
    p('Concretely, on a two-week feature: the first day is scoping and data modelling, entirely by hand and entirely conversational. Nothing is generated because nothing has been decided.'),
    p('Days two and three are heavy generation — models, migrations, endpoints, component shells, the admin screens. This is where the compression happens, and it is genuinely dramatic. Work that used to occupy most of a week occupies two days.'),
    p('Days four through eight are the actual feature: business logic, edge cases, the states nobody designed, the integration that behaves differently from its documentation. Generation helps here in the way a good autocomplete helps, which is to say noticeably but not transformatively.'),
    p('The remaining days are review, tests on the paths that matter, and the small unglamorous work of making it deployable. Almost none of that is generated, and it is a larger share of the calendar than most people expect.'),
    p('The shape worth noticing is that the compression is concentrated in a two-day window near the start. It is not spread evenly across the project, which is why "AI made this feature twice as fast" is almost never true as a statement about the whole feature. It made two days of it roughly four times faster and left the other eight largely alone.'),
    p('This also explains why the approach helps more on greenfield work than on debugging. A new endpoint has a conventional shape a model can produce; a bug that only reproduces under a specific sequence of user actions does not, and no amount of generation shortens the work of understanding why.'),

    h2('Where does it consistently get things wrong?'),
    p('Five failure patterns, in rough order of how often I hit them.'),
    ul([
      '**Confidently wrong about your own codebase.** It will invent a helper that does not exist, or use one whose signature it half-remembers from elsewhere.',
      '**Outdated framework idioms.** Patterns that were correct two major versions ago, presented with no indication that anything has changed.',
      '**Security by omission.** Not insecure code exactly — code that simply does not consider authorisation, because nothing in the prompt raised it.',
      '**Over-engineering small things.** A configuration object and three abstraction layers for a function called once.',
      '**Silent assumptions about data.** That a field is present, that an array is non-empty, that a date is in the timezone it hoped.',
    ]),
    p('None of these are catastrophic when you are reading the output. All of them ship when you are not, and the last two are the ones that reach production, because they do not fail until an unusual input arrives.'),

    h2('What tools are actually in the loop?'),
    p('Worth being specific, because "I use AI" covers a range from autocomplete to something writing whole features unattended.'),

    h3('An agentic editor for the bulk work'),
    p('Claude Code and Cursor do the heavy generation — scaffolding, endpoints, component shells, migrations from a schema I have already written. These operate with the codebase in context, which is what makes the output follow existing conventions rather than inventing new ones.'),
    p('The context matters more than the model. The same request against a codebase with clear patterns produces markedly better output than against one without, which is why the first thing I do on a new project is establish the conventions rather than start generating.'),

    h3('Nothing runs unattended'),
    p('No generated change reaches a branch without being read. There is no configuration where a model commits directly, opens a pull request nobody reviews, or deploys. That is not caution about capability — it is that the review step is where the value is, and automating it away removes the thing that makes the speed safe.'),

    h3('The model is not the differentiator'),
    p('Claude, GPT and the rest are close enough on this kind of work that swapping between them changes very little. What changes output quality is codebase consistency, how specifically the request is framed, and whether the reviewer knows what correct looks like.'),
    p('This is worth saying because "which model do you use" is a common question and it is close to the least important variable. The answer is whichever is currently best at the task, behind an abstraction, which is the same argument as [keeping providers swappable in production code](/blog/ai-is-a-module-not-a-stack).'),
    img('tools-in-loop', 'A workbench with three matte tools and one central reviewed output', 'The tools are interchangeable. The review step is not.'),

    h2('What does the ai-caveat actually mean?'),
    p('Every speed claim on this site is followed by a counterweight, and that is a deliberate structural choice rather than a stylistic one.'),
    p('The reason is simple: a speed claim without a limit is unfalsifiable, and unfalsifiable claims are what clients have learned to discount. "MVPs in weeks" means nothing on its own. "MVPs in weeks, because scope is cut hard and explicitly, and here is what got cut" is a claim someone can evaluate and hold me to.'),
    p('It also filters the right conversations. A prospect who wants the speed without the scope discipline finds out early that those are the same thing, and we both save a fortnight discovering it during a build instead.'),
    img('caveat-balance', 'A balance with a claim on one side and a counterweight on the other, level', 'A speed claim without a stated limit is not a claim. It is an advertisement.'),

    h2('Does this change what clients get?'),
    p('The deliverable is the same. The calendar is shorter and the standards are not different, which is the entire proposition.'),
    p('What clients actually get is unchanged: [a staging environment, CI, error tracking, uptime monitoring, tested backups](/stack), and accounts in their own name. Those were never the parts generation touched, and they are the parts that determine whether software keeps running after handover.'),
    p('The honest way to describe the difference is that the same work costs less calendar time. Not that a different, cheaper kind of work is being sold.'),

    h2('Should you tell clients AI was used?'),
    p('Yes, unprompted, and it is a better conversation than people expect.'),
    p('The concern behind the question is never really about tooling. It is "will I be able to maintain this" and "am I paying you for something a subscription could do". Both deserve direct answers: the code is conventional, typed end to end, and reviewed line by line; and what you are paying for is the architecture, the review and the judgment about what not to build.'),
    p('Being vague about it invites the suspicion that there is something to be vague about. [Saying it plainly](/services), alongside the honest limits, has never once cost me a project — and it has ended a couple of conversations early, which was the right outcome for both sides.'),
    quote('The speed is real and it is bounded. Anyone claiming AI made the whole project ten times faster is describing a project where the hard parts were not the hard parts.'),

    h2('What about the codebase six months later?'),
    p('This is the question that actually matters, and it is the one least often asked during a sales conversation.'),
    p('A codebase built this way is maintainable for the same reasons any codebase is: consistent patterns, a sound data model, meaningful tests on the paths that matter, and no clever abstractions nobody asked for. None of those properties come from generation. They come from rejecting generated code that would have violated them.'),
    p('The failure mode of an unreviewed AI-built codebase is not bad code exactly. It is *inconsistent* code — five approaches to the same problem, because each was generated in a separate conversation with no memory of the others. That is considerably harder to work with than code that is uniformly mediocre.'),
    img('consistency', 'A set of uniform modules beside a set of mismatched ones', 'The risk is not bad code. It is five idioms for the same thing, none of them wrong.'),

    h2('Does it work on an existing codebase?'),
    p('Better than on a new one, with one condition: the codebase has to have patterns worth following.'),
    p('Given an established convention — how endpoints are structured, how errors are handled, how components are composed — generation is genuinely good at producing the next instance of it. That is the highest-value case, and it is where I use it most heavily on client work.'),
    p('On a codebase with no consistent conventions, generation amplifies the inconsistency, because there is no pattern for it to follow and it will invent a reasonable one each time. The fix is to establish the conventions first, which is work that has to happen anyway.'),

    h2('What has actually changed in my process?'),
    p('Less than the framing suggests. [The six steps](/services) are the same: you reach out, we get on a call, I scope the work, I build and commit, we review together, we ship it.'),
    p('Two things did change. Scoping matters more, because the build phase is shorter and so scoping is a larger proportion of the total — getting it wrong now costs relatively more. And I commit more frequently, because generated work arrives in larger increments and needs to be visible as it lands rather than in a weekly lump.'),
    p('The review step matters more too, for the same reason: more code arrives per day, and it all has to be read.'),

    h2('What would make me stop using it?'),
    p('A worthwhile question to ask of any tool, and the answer is specific.'),
    p('If review time started to exceed the writing time it saved, the trade would collapse. It has not, but it comes closer on subtle work, which is exactly why security and auth are hand-written — for those, the crossover has already happened.'),
    p('If it started producing code that was wrong in quiet ways more often than loud ones, I would narrow its scope sharply. The current failure profile is tolerable because most errors surface immediately. A model that failed more subtly would be a worse tool even if it were more capable on average.'),
    p('And if clients started buying the speed rather than the outcome, I would change how I describe the work rather than how I do it. Speed is only worth selling when it comes from cutting scope deliberately and generating the conventional parts — never from skipping review, which is the one saving available to anyone willing to take it and the one nobody should.'),

    table('The five failure patterns, and how each one surfaces', [
      ['Pattern', 'How it fails', 'Caught by'],
      ['Invented helper', 'Immediately, loudly', 'Type-check or first run'],
      ['Outdated idiom', 'Immediately, loudly', 'Type-check or lint'],
      ['Missing authorisation', 'Quietly, in production', 'Hand-written auth only'],
      ['Over-engineering', 'Never — it just accretes', 'Reading every line'],
      ['Assumption about data', 'Quietly, on unusual input', 'Tests on real paths'],
    ]),
    p('The pattern in that table is the whole argument for where the hand-written boundary sits. The top two are safe to generate because they cannot survive a build. The bottom three are the ones that reach users, and two of them are only caught by a human reading carefully.'),
    img('failure-surface', 'Five markers at differing depths, two visible at the surface and three submerged', 'The dangerous failures are the quiet ones. That is where hand-written code earns its cost.'),

    h2('Conclusion'),
    p('The workflow is not complicated. Generate the conventional parts, read every line, reject anything that introduces a pattern the codebase does not already have, and write the security, the data model and the tests that matter by hand.'),
    p('What that buys is roughly a quarter off the calendar and a meaningfully lower barrier to doing things properly, because the boring second admin screen now costs twenty minutes. What it does not buy is any reduction in the difficulty of deciding what to build, modelling the data correctly, or knowing which feature to cut.'),
    p('Someone still has to own the architecture, catch the subtle bug, and say no to the feature that will sink the timeline. That part is still me. The tooling just means you are paying for judgment rather than typing, which was always the better trade.'),
  ),
  faqs: faq([
    ['Does AI-generated code mean lower quality?',
     'Not on its own. Generated code is a first draft, and quality comes from what happens next: reading every line, rejecting unfamiliar patterns, and writing security and tests by hand. Skip that and quality does drop, faster than it would with hand-written code.'],
    ['How much faster is an AI-accelerated workflow, honestly?',
     'Roughly two to three times on typing-heavy work like scaffolding, CRUD and boilerplate, which is about 40% of a typical feature. That works out to around a quarter off the total calendar. Scoping, data modelling and security are essentially unchanged.'],
    ['What do you refuse to let AI write?',
     'Authentication, permissions, anything touching payments, migrations against live data, and the data model. These fail quietly and expensively, and carefully reviewing generated code in those areas takes longer than writing it myself.'],
    ['Will I be able to maintain the codebase afterwards?',
     'Yes, and that is the point of owning the architecture rather than the typing. You get conventional patterns, typed end to end, with staging, CI and error tracking already wired up. No code ships that I could not have written myself.'],
  ]),
};
