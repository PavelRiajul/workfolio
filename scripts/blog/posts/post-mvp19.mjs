import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mvp-in-19-days/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mvp-in-19-days',
  slug: 'mvp-in-19-days',
  title: 'Shipping an MVP in 19 Days Without Shipping Garbage',
  category: 'ai',
  order: 2,
  readTime: '12 min read',
  date: 'November 2025',
  publishedAt: '2025-11-20',
  series: 'MVP',
  excerpt:
    'A real 19-day build of an AI research assistant: what got scoped out, what got generated, and the four things that never get cut no matter the deadline.',
  coverLabel: 'MVP in 19 days — cover',
  body: body(
    p('Nineteen days is a real number from a real project. [Halo](/work/halo) is an AI research assistant that answers questions from a team\'s own documents, with citations. It went from a first call to real users in nineteen working days, and it is still running.'),
    p('The interesting part is not the speed. It is what the nineteen days did not include, and the four things that stayed in scope no matter how tight it got. Both lists are more useful than the timeline.'),
    p('I am wary of timeline claims generally, including this one, because they are usually quoted without the scope that made them possible. Nineteen days for six features on a stack that was already settled is a different statement from nineteen days for eleven features on a stack chosen during the project, and only the first is a claim anyone should make.'),

    h2('What did nineteen days actually buy?'),
    p('A working product that a team could use daily and judge honestly: authentication with real accounts, billing, document upload and indexing, a question interface with streamed answers, verified citations back to source passages, per-user cost tracking, and a spend ceiling.'),
    p('It also bought the boring infrastructure that determines whether something survives its first month — a staging environment, continuous integration running type-checks and tests, error tracking wired up before launch, uptime monitoring, and automated backups with a restore that had actually been tested once.'),
    p('That last sentence is where most "we shipped in three weeks" stories quietly differ from this one. Those things are not polish added later. They were in scope from day one, which is precisely why the calendar held.'),
    img('what-19-days-bought', 'A compact structure with several small modules visibly integrated into it', 'The list is short on features and complete on foundations. That is the trade.'),

    h2('What got cut, and how quickly?'),
    p('The original brief had eleven features. Six shipped. The cuts happened on day two, in writing, before any code existed — which is the only time cutting is cheap.'),
    table('The eleven features and what happened to them', [
      ['Feature', 'Decision', 'Reason'],
      ['Ask questions, get cited answers', 'Shipped', 'The entire thesis'],
      ['Document upload and indexing', 'Shipped', 'No corpus, no product'],
      ['Accounts and billing', 'Shipped', 'Needed to charge anyone'],
      ['Team workspaces', 'Cut to v2', 'One workspace proved the thesis'],
      ['Slack integration', 'Cut to v2', 'Nice, not load-bearing'],
      ['Admin analytics dashboard', 'Cut', 'The database answered the same questions'],
      ['Custom branding', 'Cut', 'No user asked'],
      ['Bulk import from Drive', 'Cut to v2', 'Manual upload was acceptable at ten users'],
      ['Answer history and sharing', 'Cut to v2', 'Genuinely wanted, not required to learn'],
      ['Mobile app', 'Cut', 'A responsive web app was sufficient'],
      ['SSO', 'Cut', 'No prospect had asked yet'],
    ]),
    p('The test applied to each one was narrow: does this feature change what we learn from putting the product in front of users? If it did not, it was not in the nineteen days. Team workspaces and answer sharing were the hardest to cut because both are obviously useful, and neither changed what the first ten users would teach us.'),
    p('It is worth noticing what that test excludes. It says nothing about how difficult a feature is, or how often it will eventually be requested, or how impressive it looks in a demo. SSO was cut despite being straightforward, because no prospect had asked for it. Bulk import was cut despite being obviously convenient, because ten users uploading files manually still produces exactly the same learning as ten users importing them.'),
    p('The cuts that hurt are always the reasonable ones. Anything obviously unnecessary would not have reached a feature list in the first place, so scope reduction is entirely a matter of declining things that are genuinely worth building — just not yet, and not if they cost the deadline.'),
    p('Cutting on day two also meant nothing was half-built. The most expensive version of scope reduction is discovering on day fourteen that three features are each 60% complete, because none of them can ship and all of them cost real time.'),

    h2('Where did the nineteen days go?'),
    p('Not where people assume. The AI layer was under a third of the calendar.'),
    table('Days by phase, and who wrote the code', [
      ['Phase', 'Days', 'AI-generated', 'Hand-written'],
      ['Scoping and data model', '3', 'A first draft only', 'Every decision that stuck'],
      ['Auth, billing, app shell', '5', 'Most of it', 'Security and roles'],
      ['Retrieval and AI layer', '6', 'Roughly half', 'Prompt, retrieval, evaluation'],
      ['Evaluation and cost caps', '3', 'Very little', 'Nearly all'],
      ['Staging, monitoring, handover', '2', 'None', 'All'],
    ]),
    p('Five days on auth, billing and the application shell might look like a lot for something with no AI in it. It is the reason the six days on retrieval were possible: there was already a real user model to filter documents against, and a real user record to attribute cost to.'),
    p('Building the AI layer first and adding accounts afterwards is the standard path and it is what produces [retrieval that cannot be filtered by permission without a reindex](/blog/ai-is-a-module-not-a-stack). That mistake costs weeks, and it lands well after the deadline that made it seem sensible.'),

    h2('What did AI actually write?'),
    p('Most of the typing, very little of the thinking. The split was consistent enough to describe as a rule.'),

    h3('Almost entirely generated'),
    p('Scaffolding, forms, CRUD endpoints, the component shell, migrations from a schema I had already decided, and the first pass of tests. This is the work where the correct answer is conventional and the value is in producing it quickly.'),

    h3('Generated then substantially rewritten'),
    p('Business logic and the retrieval pipeline. A generated first draft is a useful starting point that gets you past the blank file, and roughly half of it survived contact with the actual requirements.'),

    h3('Written by hand'),
    p('Authentication, permissions, the data model, anything touching billing, and the entire evaluation harness. These fail quietly and expensively, and reviewing generated code in these areas takes longer than writing it.'),
    p('That division is the whole of what [an AI-accelerated workflow](/blog/building-with-ai-workflow) means in practice. It compresses the typing-heavy parts by two to three times and does approximately nothing for scoping, data modelling or deciding what to cut — which are the parts that determine whether the project succeeds.'),
    img('who-wrote-what', 'Three stacked bands of differing widths representing generated, revised and hand-written code', 'Generation compresses the typing. It does not compress the judgment.'),

    h2('What never gets cut?'),
    p('Four things. Every one of them was in scope on day one and none of them was negotiable when the calendar tightened.'),

    h3('The data model'),
    p('The schema is the expensive thing to change. Features built quickly on a sound model are cheap to replace; a rushed schema is not, and it taxes every subsequent change. Three days on scoping and data modelling was the highest-return time in the project.'),

    h3('Authentication and permissions'),
    p('Not just login — who may see which document. This is the constraint that has to exist before indexing, because retrieval built without a permission dimension cannot acquire one later without rebuilding the index.'),

    h3('Error tracking and backups'),
    p('Wired up before launch, not after the first incident. A tested restore takes an hour and it is the difference between a bad afternoon and an unrecoverable one. Backups nobody has restored from are not backups.'),

    h3('The evaluation set'),
    p('Fifty real questions with labelled correct sources. Without it, "is the assistant good enough" is an argument rather than a measurement, and every subsequent prompt change is unreviewed. It cost an afternoon.'),
    quote('Speed comes from cutting features, never from cutting foundations. The first is a product decision; the second is a loan at a punitive rate.'),

    h2('How does a nineteen-day timeline hold?'),
    p('Three things, none of them about working faster.'),
    p('**Scope froze on day two.** Everything cut went onto a written v2 list rather than into a conversation. When new ideas arrived mid-build — and they did — they went on that list too, which took about thirty seconds and avoided the negotiation that normally consumes an afternoon.'),
    p('**The stack was not a decision.** This was [Template 04 from my stack](/stack): a standard web app with an AI module. No time was spent choosing a database, an auth provider or a hosting platform, because those were settled long before this project existed. That alone is worth two or three days on a build this size.'),
    p('**Progress was visible daily.** Commits went up continuously and the client could see the app as it existed rather than as it was described. Nothing accumulated into a surprise, which is what usually causes a late-stage rewrite disguised as "feedback".'),

    h2('What did each week look like?'),
    p('Nineteen working days is just under four weeks. The shape of each was distinct enough to be worth describing, because the ordering is most of the method.'),

    h3('Week one: decide, then build the boring half'),
    p('Three days of scoping produced two artefacts: a written scope naming what was explicitly excluded, and a data model. Not a diagram — actual schema, with the decisions about identity, tenancy and money already made, because those are the ones that are expensive to revisit.'),
    p('The remaining two days started the application shell. Auth, the account model, the empty dashboard. Unglamorous, fast to generate, and the foundation everything else attaches to.'),

    h3('Week two: the shell finishes, retrieval starts'),
    p('Billing and onboarding completed, then document upload and the first indexing pipeline. By the end of the week a document could be uploaded and searched, with no generation involved at all — which is deliberately the order, because search quality is measurable on its own and generation only obscures it.'),

    h3('Week three: answers, citations and the uncomfortable number'),
    p('Generation, streaming and citations. This is also when the evaluation set was run properly for the first time and returned 61%, which consumed most of two days in retrieval work rather than prompt work.'),
    p('It is worth being explicit that this was the week the project felt least certain. Everything visible worked; the measurement said the answers were not good enough. Having the measurement is what turned that into two days of targeted work rather than a fortnight of adjusting prompts hopefully.'),

    h3('Week four: the four remaining days'),
    p('Cost caps, rate limiting, the spend ceiling, staging, monitoring, backups, restore test, handover. No features. This is the block that gets eaten when a project runs late, and protecting it is most of what "shipped in nineteen days" actually means.'),
    img('four-weeks', 'Four sequential bands of differing composition on a clean surface', 'The ordering is the method: decide, build the boring half, then the AI, then the things that keep it alive.'),

    h2('What went wrong?'),
    p('Two things, and both are worth naming because they are the honest part of any timeline claim.'),
    p('The document parsing was worse than expected. The corpus included two-column PDFs that interleaved into nonsense when parsed, and tables that flattened into unreadable strings. This cost roughly a day and a half that was not in the estimate, and it would have been caught by parsing twenty representative documents during scoping. I now do exactly that before quoting.'),
    p('The first evaluation run was uncomfortable. Retrieval was finding the correct passage about 61% of the time, which is not good enough to ship. Fixing it — [structural chunking, hybrid search, a reranker](/blog/rag-that-answers) — took most of two days and lifted it to 91%. That work was in scope, but the amount of it was not, and it is the reason the evaluation set exists before the deadline rather than after.'),
    img('what-went-wrong', 'Two visible fractures in an otherwise clean structure, both repaired', 'Both overruns were discoverable during scoping. Both are now scoping steps.'),

    h2('What did it cost to run?'),
    p('About **$0.02 per answer** at launch traffic, plus hosting and database on an existing plan. Generation dominated that figure; embedding and reranking were rounding errors against it.'),
    p('The number mattered less than the fact that it was known. Per-user cost logging went in before launch, which meant the question "which account is expensive" had an answer on day one rather than after an invoice. Reducing context from twenty unranked passages to five reranked ones cut cost per answer by roughly two thirds while improving accuracy.'),

    h2('What did the client have to do?'),
    p('More than clients usually expect, and it is the most common reason a timeline like this fails. A nineteen-day build requires a decision-maker available inside the same week, not the same month.'),

    h3('Available for the cutting conversation'),
    p('Somebody with authority had to agree, on day two, that five of eleven features were not in this build. That is not a technical decision and it cannot be delegated to a developer. Where it gets deferred, the build stretches by the length of the deferral and then some.'),

    h3('Reachable for the questions that block'),
    p('Roughly a dozen questions came up that only the client could answer — what happens to a document when a user leaves, whether trials need a card, how invoices should read. Each took minutes to answer and would have blocked for days if they had gone unanswered.'),

    h3('Willing to look at it as it existed'),
    p('Reviewing the actual app twice a week, not a demo at the end. This is what stops the late-stage surprise, and it is the fifth step of [the process I run on every project](/services) for exactly that reason.'),
    p('None of this is onerous — perhaps three hours a week. But it is real, and a client who cannot commit it should not be sold a nineteen-day timeline, because the calendar will be spent waiting rather than building.'),
    img('client-involvement', 'A shared surface with two sets of markers meeting at regular points', 'Roughly three hours a week. The build stalls without them, no matter how fast the code is written.'),

    h2('Would this work for any product?'),
    p('No, and the boundary is fairly clear.'),
    p('Nineteen days works when the thesis is narrow and testable by a small number of users, when the data model is genuinely understood by day three, and when someone with authority can make scope decisions in the same week they are asked. Remove any one of those and the timeline stretches regardless of how the code gets written.'),
    p('It does not work for products needing regulatory review, complex multi-party workflows, or integrations with systems whose behaviour is undocumented. It also does not work when the person approving scope is unavailable, because the freeze on day two is the mechanism holding the whole thing together.'),

    h2('What happened after launch?'),
    p('The part that decides whether a fast build was actually good. A nineteen-day MVP that needs rewriting in month two was not fast, it was deferred.'),
    p('The first month brought the usual: a handful of bugs, most of them in document parsing edge cases rather than in generated code, and a steady stream of requests from the v2 list. Two things from that list shipped in the following fortnight — answer history and bulk import — and both slotted in without touching the schema, which is the practical test of whether the data model was right.'),
    p('Nothing from the foundations needed revisiting. Auth held, permissions held, the cost ceiling was never hit because the routing work had already brought spend down, and the restore was never needed. That is an unexciting paragraph and it is the entire point of the four things that did not get cut.'),
    p('The one genuine surprise was how much the evaluation set earned after launch rather than during the build. Every prompt adjustment in the following month was re-run against it, and two changes that read as improvements were reverted because refusal correctness dropped. Without the harness those would have shipped, and the regression would have been reported by a user weeks later.'),
    img('after-launch', 'A settled structure with two new modules attached cleanly at existing points', 'Two v2 features attached without touching the schema. That is the test of whether the data model was right.'),

    h2('What would I do differently?'),
    p('Three things, all cheap.'),
    ol([
      '**Parse the real documents during scoping.** A day and a half of surprise, avoidable in an afternoon. This is now a standard scoping step rather than a lesson.',
      '**Build the evaluation set before the retrieval layer, not alongside it.** Having the measurement first would have made the 61% result a day-one fact rather than a day-twelve shock.',
      '**Write the handover document as I go.** Compressed into the final two days, it was the only genuinely rushed artefact in the project, and it is the one the client reads most.',
    ]),

    h2('Conclusion'),
    p('The nineteen days were not the achievement. Cutting five of eleven features on day two was, and so was refusing to cut the data model, permissions, backups or the evaluation set when the schedule got tight.'),
    p('If you want a timeline like this, the work happens before anyone opens an editor. Decide what the product must prove, cut everything that does not change what you learn, freeze it in writing, and start from a stack you are not re-deciding. Then let generation compress the typing, and spend the time it saves on the parts that determine whether the thing survives — which are the same parts they have always been.'),
    p('If you have a deadline that already passed and a feature list that has not been cut, [that conversation is where a build starts](/start), and the cutting is usually the most valuable half hour of it.'),
  ),
  faqs: faq([
    ['Can you really build an MVP in 19 days?',
     'Yes, when scope is controlled and the feature set is genuinely minimal. Nineteen days bought auth, billing, retrieval, citations and cost controls. It did not buy team workspaces, a Slack integration, an admin dashboard or a mobile app, all of which were cut on day two.'],
    ['What gets cut first in a tight MVP?',
     'Anything that does not change what you learn from real users: extra integrations, custom admin tooling, edge-case flows and design polish beyond a consistent system. Nothing gets cut from the data model, authentication, error tracking, backups or the evaluation set.'],
    ['Does building fast mean rebuilding later?',
     'Only if you cut the wrong things. The data model and permissions are the expensive things to change, so they get full attention regardless of deadline. Features built quickly on a sound schema are cheap to replace; a rushed schema taxes every change that follows.'],
    ['What did the finished MVP cost to run?',
     'Around two cents per answer at launch traffic, plus hosting and database on an existing plan. Per-user cost logging went in before launch precisely so that number was measured rather than estimated, and so an expensive account could be identified immediately.'],
  ]),
};
