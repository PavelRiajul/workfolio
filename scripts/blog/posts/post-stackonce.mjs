import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/choosing-a-stack-once/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-choosing-a-stack-once',
  slug: 'choosing-a-stack-once',
  title: 'Choose Your Stack Once, Then Stop',
  category: 'career',
  order: 114,
  readTime: '13 min read',
  date: 'November 2026',
  publishedAt: '2026-11-07',
  series: 'Working together',
  excerpt:
    'Every project that starts with a technology debate loses a week. Four templates decided in advance, and the narrow cases where you deviate.',
  coverLabel: 'Choosing a stack — cover',
  body: body(
    p('The most expensive week on many projects is the first one, and it is spent deciding things that were already decided. Which framework, which database, which host, which auth provider — questions that have the same answer as last time, re-litigated because starting a project feels like an invitation to reconsider everything.'),
    p('The alternative is to decide once, write it down, and treat each new project as a selection from a small set of known shapes rather than a fresh architectural exercise. That sounds limiting and it is the opposite: the constraint is what makes it possible to start building on day one instead of day six.'),
    p('This post is about how to make those decisions, what a template actually contains, and — importantly — the narrow set of circumstances where deviating is the right call rather than an indulgence.'),

    h2('What does the debate actually cost?'),
    p('A week per project, plus the compounding cost of never getting good at anything.'),
    p('The direct cost is visible: research, comparison, a proof of concept, a decision, and the setup work that follows. On a six-week project that is a meaningful fraction spent producing no client-visible progress, and it is charged to somebody either as time or as margin.'),
    p('The indirect cost is larger and quieter. A developer using a different stack each time is permanently a beginner in all of them — hitting the same category of problem repeatedly, unable to reuse anything, and lacking the accumulated knowledge of where each tool actually breaks. Depth compounds and variety does not.'),
    table('What repetition buys you', [
      ['With a repeated stack', 'With a new stack each time'],
      ['Setup is minutes', 'Setup is days'],
      ['You know the failure modes', 'You discover them in production'],
      ['Estimates are calibrated', 'Estimates are guesses'],
      ['Utilities carry over', 'Everything is rewritten'],
      ['Debugging is pattern matching', 'Debugging is research'],
    ]),
    p('The third row is worth pausing on, because it feeds everything else. Reliable estimation comes almost entirely from having done a similar thing before, and a new stack resets that — [which is the main reason estimates on unfamiliar work are so poor](/blog/estimation-lessons).'),

    h3('Novelty feels like progress'),
    p('Choosing a new tool is genuinely enjoyable and it produces the sensation of moving forward while producing nothing. Recognising that feeling for what it is — a preference for the interesting over the useful — is most of the discipline required here.'),
    img('debate-cost', 'A project week consumed by decisions before any deliverable work begins', 'The most expensive week is often the first, spent re-deciding things that had the same answer last time.'),

    h2('How do you choose the default?'),
    p('On boredom, ecosystem and exit cost — not on benchmarks.'),

    h3('Choose the boring option'),
    p('A tool that has been stable for years, with predictable behaviour and answered questions, is worth more than one that is technically superior and three months old. The excitement of a new tool is paid for in unanswered edge cases at 11pm before a launch.'),

    h3('Weigh the ecosystem heavily'),
    p('How easily can you hire for it, find an answer, or hand it to somebody else? A technically excellent choice with a small community means every unusual problem is yours to solve alone, and that cost lands unpredictably.'),

    h3('Prefer tools you can leave'),
    p('The question is not whether you will migrate away — you probably will not — but how bad it would be if you had to. A managed database speaking standard Postgres is a different risk from a proprietary one with its own query language, and that difference should show up in the decision.'),

    h3('Optimise for the second year'),
    p('Most stack decisions are made for the speed of the first month and paid for over the following two years. The question worth asking is what this will be like to maintain when the person who built it has moved on and the requirements have changed twice.'),

    h3('Performance is rarely the deciding factor'),
    p('Almost every mainstream option is fast enough for almost every project, and the ones that are not are usually slow for architectural reasons rather than framework ones. Choosing on benchmarks optimises a dimension that will not be your constraint.'),

    h2('What does a template actually contain?'),
    p('More than a framework choice — it is everything that would otherwise be decided in week one.'),
    p('A stack template is not "we use Next.js". It is the framework, the database and how it is accessed, the auth approach, the hosting, the styling system, the deployment pipeline, the error tracking, the analytics, and the conventions for how the project is organised. All of it decided, all of it configured, all of it repeatable.'),
    ol([
      '**Framework and rendering approach** — and when to use static rather than server-rendered.',
      '**Database and access layer** — the same one every time, with migrations set up.',
      '**Auth** — a decided approach rather than a per-project evaluation.',
      '**Hosting and deployment** — with staging and preview environments included.',
      '**Styling** — one system, with tokens rather than ad hoc values.',
      '**The operational baseline** — error tracking, uptime, backups, spam protection, email authentication.'],
    ),
    p('That last item is [the eight things set up on every build](/stack), and having them in the template is the difference between them happening and them being intended.'),

    h3('The value is the configuration, not the list'),
    p('Anybody can name a stack. What saves the week is having it already wired — environment handling, the CI pipeline, the error reporting with source maps, the deploy previews. That is a day of work done once and reused indefinitely.'),

    h3('Keep the template alive'),
    p('A template that has not been updated in eighteen months is a liability rather than an asset, because starting from it means starting with an upgrade. Refreshing it between projects, deliberately, is what keeps it worth using.'),

    h2('Why more than one template?'),
    p('Because a landing page and a multi-tenant B2B application genuinely differ, and one shape serving both serves neither well.'),
    p('The number that works is small — four covers almost everything I am asked for. Fewer means forcing projects into the wrong shape; more means the templates stop being familiar and you are back to deciding.'),
    table('Four shapes, four decisions', [
      ['Template', 'Suits', 'Key difference'],
      ['Landing', 'Marketing sites, portfolios', 'Static, no database, fastest possible'],
      ['Standard web app', 'CRUD products, dashboards', 'Auth, database, server rendering'],
      ['B2B / multi-tenant', 'Products sold to organisations', 'Tenancy, roles, billing, audit'],
      ['AI feature app', 'Products with a model in the loop', 'Streaming, cost logging, evaluation'],
    ]),
    p('The selection happens during scoping and takes about a minute, because the questions that determine it — is there a login, are there organisations, is there a model call — are ones you were asking anyway.'),

    h3('The differences are structural, not cosmetic'),
    p('Multi-tenancy is not a feature you add to the standard app later; it changes the schema, the queries and the authorisation model throughout. Starting from the right shape avoids a retrofit that is genuinely expensive — [which is why tenancy belongs in the data model from the start](/blog/multi-tenant-prisma-postgres).'),

    h3('Templates share a base'),
    p('The operational baseline, the styling system and the deployment approach are the same across all four. Only the parts that genuinely differ diverge, which keeps four templates from being four codebases to maintain.'),
    img('four-shapes', 'A small set of starting configurations selected by structural need rather than assembled per project', 'Four covers almost everything. Fewer forces projects into the wrong shape; more and they stop being familiar.'),

    img('template-contents', 'A starting point comprising configured infrastructure rather than a list of technology names', 'Anybody can name a stack. The saved week comes from the wiring — environments, pipeline, error reporting, previews.'),

    h2('When should you deviate?'),
    p('When the project has a requirement the default genuinely cannot meet — which is rarer than it feels.'),

    h3('A hard technical constraint'),
    p('A regulatory requirement about where data lives, an existing system that must be integrated with, a performance characteristic the default cannot reach. These are real and they are identifiable during scoping rather than discovered midway.'),

    h3('The client\'s team has to maintain it'),
    p('If the deliverable is handed to an in-house team who work in a different stack, building in yours is a handover that fails. Their maintainability outweighs your familiarity, and this is the most common legitimate reason to deviate.'),

    h3('The default is genuinely wrong for the shape'),
    p('A real-time collaborative editor, a data pipeline, a native mobile app — some projects are not the shape any of your templates address. Recognising that quickly is better than forcing it, and it is also a signal about whether the project suits you at all.'),

    h3('Not because it would be interesting'),
    p('The most common actual reason for deviation is curiosity, and it is worth being honest about that. Learning a new tool is valuable and it belongs on your own time or on a project where the risk is yours, not billed to a client who wanted their thing built reliably.'),

    h2('How do you learn new tools without churn?'),
    p('Deliberately, on your own projects, and adopt slowly.'),
    p('Standardising does not mean stagnating. The distinction is between evaluating a tool and using it on client work — the first is necessary and continuous, the second should happen only after the first has produced confidence.'),

    h3('Build something real with it first'),
    p('A tutorial teaches the happy path. Building an actual small project — with authentication, deployment and something going wrong — teaches where the tool breaks, which is the information that matters and the part no introduction covers.'),

    h3('Replace one component at a time'),
    p('Swapping the database in an otherwise familiar stack is a controlled experiment. Changing the framework, the database and the host together means any problem could come from anywhere, and you learn nothing transferable.'),

    h3('Have a reason for each change'),
    p('"The current choice causes this specific problem" is a reason. "This is newer" is not. Writing the reason down before adopting something is a cheap filter that removes most of the churn.'),

    h3('Let the template lag deliberately'),
    p('The template should adopt a change after it has proven itself on a real project, not before. That lag is a feature — it means client work runs on choices that have already been tested somewhere with less at stake.'),
    img('learning-lane', 'New tools evaluated separately before entering the configuration used for client work', 'Evaluate continuously, adopt slowly. The template should lag your learning by at least one real project.'),

    h2('What about the client who wants a different stack?'),
    p('Find out why, because the answer determines whether it is a requirement or a preference.'),

    h3('Sometimes it is a real constraint'),
    p('An in-house team, an existing codebase, a corporate standard, a compliance requirement. These are legitimate and the right response is either to work in their stack or to decline — [not to argue them out of it](/blog/client-objections).'),

    h3('Sometimes it is something they read'),
    p('A preference formed from an article or a conference talk is worth a conversation rather than compliance. Asking what problem they are hoping it solves usually reveals either a genuine concern you can address differently or a preference that dissolves once discussed.'),

    h3('Be honest about your own limits'),
    p('If a client wants a stack you do not know well, saying so is better than learning on their budget and delivering something mediocre. The referral you make instead is worth more to your reputation than the project would have been.'),

    h3('Charge for the unfamiliarity if you take it'),
    p('Working outside your defaults is genuinely slower and riskier, and the estimate should reflect that rather than absorbing it. A client choosing a stack you do not specialise in should understand that it costs more, which is a fair and usually uncontroversial conversation.'),

    h2('Does standardising limit you?'),
    p('It limits variety, which is not the same as limiting capability.'),
    p('The concern is that a fixed stack means turning away work or building things badly because the tools do not fit. In practice the range of what a well-chosen general stack handles is very wide, and the projects genuinely outside it are usually ones with other reasons not to take them.'),

    h3('Depth is what clients actually buy'),
    p('A developer who has built twenty things with the same tools knows the failure modes, the performance characteristics and the awkward corners. That knowledge is invisible in a proposal and it is most of the value delivered, and it only exists through repetition.'),

    h3('Reusable pieces accumulate'),
    p('Auth flows, file upload handling, admin scaffolding, deployment configuration, the tested pieces of the operational baseline — these carry over between projects only if the projects are similar. Each one is a compounding return on having standardised.'),

    h3('You still get to be interested'),
    p('The interesting problems in most projects are not the framework choice. They are the data model, the workflow that has to match how a business actually operates, the performance problem with a real cause. Standardising the boring decisions is what leaves time for those.'),
    img('depth-compounds', 'Accumulated familiarity with one configuration compared with shallow exposure to many', 'Depth compounds and variety does not. Knowing the failure modes is invisible in a proposal and most of what is delivered.'),

    img('deviation', 'A narrow set of circumstances justifying departure from an established default', 'Hard constraints and an in-house maintenance team are real reasons. Curiosity is the most common actual one.'),

    h2('How do you write it down?'),
    p('A short document, in the repository, that says what and why.'),
    p('The template needs a written companion explaining the choices, because a configuration without reasoning gets changed by whoever next has an opinion. Recording why each decision was made turns it from a preference into a documented position that can be revisited deliberately.'),

    h3('Record what you rejected'),
    p('Noting the alternatives considered and why they were not chosen is what stops the same evaluation being repeated annually. It also makes revisiting the decision easy when the reason genuinely changes.'),

    h3('Publish the publishable parts'),
    p('A page describing your stack does real work in sales conversations — it answers the technical questions before they are asked and demonstrates that the decisions were considered rather than incidental. The commercial detail stays internal; the technical position is worth being public about.'),

    h3('Review it on a schedule, not on impulse'),
    p('A deliberate look once or twice a year, with the written reasoning in front of you, is how a stack stays current without churning. Reconsidering it whenever something new appears is how the week gets lost again.'),

    h2('What does it cost?'),
    p('A few days to build the templates, and the occasional project you decline.'),
    p('Assembling four templates properly — configured, documented, with the operational baseline wired in — is a few days of unbilled work. It repays itself on the second project and continues indefinitely, which makes it one of the better investments available to a small practice.'),
    p('The honest counterweight: standardisation trades adaptability for depth, and that trade is wrong for some people. Somebody early in their career benefits enormously from variety, because the point is finding out what suits them and building range rather than depth. A team serving many different industries may genuinely need several stacks. And any default carries the risk of applying a familiar tool to a problem it fits badly, which is a real failure mode and one you become less able to see the longer you have standardised. The defence is reviewing the choice deliberately on a schedule and being genuinely willing to hear that a project does not fit — not the absence of a default.'),
    quote('A developer using a different stack every project is permanently a beginner in all of them. Depth compounds; variety does not.'),

    h2('Conclusion'),
    p('Re-deciding the stack on every project costs a week directly and more indirectly, because reliable estimation, known failure modes and reusable pieces all come from repetition. The feeling that choosing a new tool is progress is worth recognising as a preference for the interesting over the useful.'),
    p('Choose defaults on boredom, ecosystem size and exit cost rather than benchmarks, and optimise for the second year rather than the first month. Almost every mainstream option is fast enough, and the ones that are not are usually slow architecturally rather than because of the framework.'),
    p('Make the template more than a list — the framework, database, auth, hosting, styling and the whole operational baseline, already configured. The saved week comes from the wiring, not the naming. Keep four shapes, because a landing page and a multi-tenant application genuinely differ, and select between them during scoping in about a minute.'),
    p('Deviate for hard constraints, for a client team who has to maintain it, or when the project is genuinely a shape none of your templates address — and be honest that curiosity is the most common real reason. Learn new tools continuously on your own projects, adopt them into the template only after they have proven themselves, and change one component at a time.'),
    p('Write the choices down with their reasoning and what you rejected, publish the technical parts, and review on a schedule rather than on impulse. The whole thing is a few days to build and it repays on the second project. If you want to see the version I run, [it is documented](/stack).'),
  ),
  faqs: faq([
    ['Does standardising on one stack limit what you can build?',
     'It limits variety rather than capability. A well-chosen general stack covers a very wide range, and the projects genuinely outside it usually have other reasons not to take them. What you gain is depth — knowing the failure modes and awkward corners, which is invisible in a proposal and most of the value.'],
    ['How should I choose the default stack?',
     'On boredom, ecosystem size and exit cost. A tool stable for years with answered questions beats a technically superior three-month-old one. Weigh how easily you can find an answer or hand it over, and ask how bad a migration would be rather than whether you will do one.'],
    ['How many templates should I keep?',
     'Around four. Enough that a landing page, a standard web app, a multi-tenant B2B product and an AI feature app each start from the right structure, and few enough that all of them stay familiar. More than that and you are back to deciding rather than selecting.'],
    ['When is it right to use a different stack?',
     'A hard technical or regulatory constraint, an in-house team who has to maintain it in their own stack, or a project genuinely shaped unlike anything your templates address. Curiosity is the most common actual reason, and it belongs on your own projects rather than a client’s budget.'],
    ['What if the client insists on a different stack?',
     'Find out why. An existing codebase or corporate standard is a real constraint — work in it or decline. A preference from an article is worth a conversation about what problem they hope it solves. If you take it, price the unfamiliarity rather than absorbing the extra risk silently.'],
  ]),
};
