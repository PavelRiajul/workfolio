import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mvp-development-cost/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mvp-development-cost',
  slug: 'mvp-development-cost',
  title: 'How Much Does an MVP Cost in 2026?',
  category: 'fullstack',
  order: 31,
  readTime: '13 min read',
  date: 'August 2026',
  publishedAt: '2026-08-15',
  series: 'MVP',
  excerpt:
    'What an MVP actually costs by scope, what drives the number up, and the features that get cut first without hurting the launch.',
  coverLabel: 'MVP cost — cover',
  body: body(
    p('Most MVP quotes are answering a question nobody asked. The founder wants to know what it costs to test whether the idea works. The quote prices the feature list, which is a different thing and usually two or three times larger.'),
    p('These are real ranges from projects I have built and run, with the drivers named. Where a figure comes from a specific build I have said so.'),
    p('The most useful part is not the numbers. It is the section on what gets cut, because that is the lever that actually moves the total.'),

    h2('What counts as an MVP?'),
    p('The smallest thing that produces a real answer to the question your business depends on. Not the smallest version of the product you eventually want — those are different, and conflating them is where budgets go.'),
    p('The test I apply to every proposed feature: **does this change what we learn from putting it in front of users?** If the answer is no, it is not in the MVP, however obviously useful it is. On a recent build, five of eleven features failed that test and were cut on day two.'),
    p('An MVP is also not a prototype. It has real accounts, real data, real money if money is involved, and it has to survive being used daily. A clickable mockup answers a design question; it does not answer whether people will pay.'),
    img('mvp-definition', 'A small solid structure beside a much larger outlined one, the small one edge-lit', 'The smallest thing that answers the question — not the smallest version of the eventual product.'),

    h2('What does an MVP cost?'),
    p('Ranges assume a single-developer build with the foundations included. They are not agency prices and they are not marketplace prices; they sit between.'),
    table('Build cost by MVP type', [
      ['MVP type', 'Build', 'Timeline', 'Monthly run'],
      ['Landing page plus waitlist', '$1.5k–$4k', '1–2 weeks', 'Under $20'],
      ['Single-workflow web app', '$6k–$14k', '3–5 weeks', '$30–$120'],
      ['AI-featured product', '$9k–$25k', '4–8 weeks', '$120–$600'],
      ['Marketplace or two-sided', '$15k–$35k', '8–14 weeks', '$80–$300'],
      ['Web plus mobile app', '$20k–$45k', '10–16 weeks', '$150–$500'],
    ]),
    p('The spread inside each row is scope, not quality. A single-workflow app at $6k has one user type, one core flow and a payment; the same row at $14k has three user types, an admin surface and two integrations. Both are built to the same standard.'),

    h2('What are you actually paying for?'),
    p('The feature list is usually the smaller half. Four buckets, and only one of them is what gets discussed on a first call.'),

    h3('The foundation'),
    p('Authentication, the data model, billing, the application shell, deployment. Largely the same on every project, which is why [starting from a settled setup](/blog/project-stack-templates) is what makes fixed pricing honest. Roughly a third of a typical build.'),

    h3('The thing that makes it your product'),
    p('The actual workflow — what the user comes to do. This is the part founders picture when they imagine the cost, and it is frequently the smallest of the four.'),

    h3('The edges'),
    p('Empty states, error states, what happens when an integration is down, what a half-completed flow does on refresh. Rarely specified, always necessary, and reliably underestimated by everyone including me.'),

    h3('The things that keep it alive'),
    p('Staging, CI, error tracking, uptime monitoring, tested backups, spam protection, email authentication. About two days across a project, non-negotiable, and the reason a launched thing is still running a year later.'),
    img('cost-buckets', 'Four blocks of differing size stacked, the second smallest highlighted', 'The feature everyone pictures is frequently the smallest block.'),

    h2('What drives the price up?'),
    p('Six things, in rough order of impact.'),
    table('Cost drivers, ranked', [
      ['Driver', 'Effect', 'Controllable?'],
      ['Number of user types', 'Large — each adds a permission surface', 'Yes, by scoping'],
      ['Third-party integrations', 'Large — 2 is nearer 3x than 2x', 'Sometimes'],
      ['Custom design vs a system', 'Moderate to large', 'Yes'],
      ['Money changing hands', 'Moderate — compliance and edge cases', 'Rarely'],
      ['Real-time features', 'Moderate — different architecture', 'Often deferrable'],
      ['Migrating existing data', 'Highly variable, usually underestimated', 'No'],
    ]),
    p('Integrations deserve emphasis. Two is not twice one — it is closer to three times, because the failure combinations multiply and each system has its own auth, rate limits and undocumented behaviour. The most reliable overrun on any project I have run is an integration whose documentation described something other than what the API did.'),
    p('Data migration is the other one. "We have existing customers to bring across" is a sentence that can mean an afternoon or three weeks, and the difference is entirely the state of the data. It is knowable in an hour by looking at an export, and worth doing before anyone quotes.'),
    p('User types are the driver founders control most and consider least. Each one is not just a login — it is a set of permissions, a distinct navigation, its own empty states, and a multiplier on every test. Going from one user type to two is closer to 1.6x the build than 1.2x, and the second type is frequently an admin view that a database query would have covered for the first six months.'),
    p('Design sits in a similar position. A consistent design system applied competently costs little; bespoke design for every screen costs a great deal and rarely changes whether the thesis is proven. For an MVP the honest sequence is a system now, distinctiveness once you know which screens people actually use — and by then you will be designing against evidence rather than taste.'),

    h2('What gets cut first?'),
    p('The list is more consistent across projects than founders expect, and none of it is difficult to build. It is cut because it does not change what you learn.'),
    ol([
      '**Admin dashboards.** You have ten users and a database. Query it. This is usually the single largest saving on the list and the one clients resist most.',
      '**Team and workspace features.** One workspace proves the thesis. Sharing, invitations and roles are a v2 that arrives with revenue attached.',
      '**Integrations beyond the first.** Each one is a week you are not spending on the core flow.',
      '**Bulk import.** Ten users uploading manually produce exactly the same learning.',
      '**Custom branding and white-labelling.** Nobody has asked yet.',
      '**A mobile app**, where a responsive web app answers the question.',
      '**Single sign-on**, until a prospect names it as a condition.',
      '**Analytics dashboards**, when an off-the-shelf product tells you the same thing.',
    ]),
    p('What never gets cut: the data model, authentication and permissions, error tracking, backups. Those are the expensive things to change and the ones that make everything built afterwards cheap to change.'),
    p('The timing matters as much as the list. Cutting on day two, in writing, is nearly free — nothing has been built and nobody has grown attached. Cutting on day fourteen means discovering that three features are each 60% complete, none can ship, and all of them consumed real time. [On a 19-day build](/blog/mvp-in-19-days) five of eleven features went on day two and nothing was half-built at any point, which is most of why the date held.'),
    p('New ideas will arrive mid-build regardless — they always do, and usually they are good. The mechanism that keeps them from eating the timeline is a written v2 list that takes thirty seconds to add to, rather than a conversation about whether this one is small enough to squeeze in. Every one of those conversations costs an afternoon and the answer is almost always the same.'),
    quote('Speed comes from cutting features, never from cutting foundations. The first is a product decision. The second is a loan at a punitive rate.'),

    h2('How long does an MVP take?'),
    p('Three to sixteen weeks depending on the row above, and the shape matters more than the total.'),
    p('The foundation goes fast and predictably. The core workflow is the bulk. The last 20% — edge cases, error states, cost controls, the review path when something is wrong — takes disproportionately long and is exactly what gets sacrificed when a date slips.'),
    p('On a 19-day AI MVP the split was three days scoping and data modelling, five on auth and billing and the shell, six on the AI layer, three on evaluation and cost caps, two on staging and handover. The AI-specific work was under a third of the calendar, which surprises people every time.'),
    img('timeline-shape', 'A timeline with an even early stretch and a compressed, dense final section', 'The last fifth takes longest and is the first thing sacrificed when a date slips.'),

    h2('What does it cost to run afterwards?'),
    p('Less than people expect, and it is the number most quotes omit entirely.'),
    table('Monthly running cost by component', [
      ['Component', 'Typical', 'Notes'],
      ['Hosting', '$0–$20', 'Free tiers cover early traffic'],
      ['Database', '$0–$25', 'Managed Postgres, small instance'],
      ['Auth', '$0–$25', 'Free below a few thousand users'],
      ['Transactional email', '$0–$20', 'Free tier covers most MVPs'],
      ['Error tracking and analytics', '$0–$30', 'Free tiers are generous'],
      ['AI features, if any', '$40–$600', 'Scales with usage, needs a ceiling'],
    ]),
    p('Most non-AI MVPs run for under $50 a month at launch traffic. AI features are the exception and the one line that needs a spend ceiling from day one, because it is the only component that scales with use rather than with users — [the ceiling and the per-user logging](/blog/ai-cost-logging) go in before launch, since neither can be applied retroactively.'),
    p('One number worth calculating before committing to anything: monthly running cost times twelve, added to the build. That is the real first-year figure, and it changes which option wins more often than people expect. A cheaper build with no cost controls can cost more across twelve months than a more careful one, and the comparison is never made because the two numbers arrive in different conversations.'),

    h2('Should you get a fixed price?'),
    p('Yes, with staged scope, and be suspicious of anyone who offers one without asking about your data.'),
    p('A fixed price is only honest when the shape of the work is known. That requires a written scope naming what is excluded, not just what is included; agreement on what "done" means for each deliverable; and someone having actually looked at any existing data or systems being integrated.'),
    p('Time and materials is the right model for genuinely open-ended work — an ongoing product relationship, or research where the answer determines the next step. For an MVP it usually transfers the risk of poor scoping to the client, which is the wrong way round.'),

    h3('What a good quote contains'),
    ul([
      '**What is explicitly out**, listed. This is more informative than the inclusion list.',
      '**A staged scope**, so a phase can be stopped without the whole thing being wasted.',
      '**The running cost**, monthly, itemised.',
      '**Who owns the accounts** — hosting, database, domain. The answer should be you.',
      '**What happens after launch**, and for how long.',
    ]),

    h2('Who should build it?'),
    p('Four options, and the right one depends more on what happens after launch than on the build itself.'),

    h3('A freelance developer'),
    p('Cheapest for a defined scope, fastest to start, and the whole thing depends on one person. The risk is continuity, and it is mitigated by conventional choices, documentation and accounts in your name — which is why I set every project up that way rather than because a client asked.'),
    p('Best when the scope is clear and the product is one workflow rather than five.'),

    h3('A small studio'),
    p('More capacity and a designer, at roughly two to three times the cost. Worth it when the product needs genuine design work rather than a competent design system, or when several workstreams have to run at once.'),

    h3('An offshore agency'),
    p('The lowest headline number, and the variance is enormous. The ones that work well have a technical lead you speak to directly; the ones that go badly have an account manager between you and whoever is writing the code, and the cost surfaces as rounds of revision rather than as invoices.'),

    h3('A technical co-founder'),
    p('Cheapest and slowest, and the only option that leaves the capability inside the business. If the product is the business rather than a tool for it, this is usually correct, and an MVP built by a contractor is a bridge to it rather than a substitute.'),
    img('who-builds', 'Four differently sized workbenches arranged in a row, one edge-lit', 'The right choice depends on what happens after launch more than on the build itself.'),

    h2('What happens after the MVP?'),
    p('The part that decides whether the money was well spent, and the part almost never budgeted.'),
    p('Expect a fortnight of small fixes after real users arrive. Not bugs exactly — the things that only surface when someone who did not build it tries to use it, which no amount of testing substitutes for.'),
    p('Then the v2 list, which by then is written from evidence rather than assumption. On one build, two features from the deferred list shipped within a fortnight of launch and both attached without touching the schema. That is the practical test of whether the data model was right, and it is worth more than any code-quality metric.'),
    p('Budget roughly 15–20% of the build cost for the first three months of iteration. Products that skip this ship an MVP, learn things, and then have no capacity to act on what they learned — which wastes the learning and most of the build.'),
    img('after-launch', 'A settled structure with two new components attaching at existing points', 'Two deferred features attaching without schema changes is the real test of the data model.'),

    h2('Why are quotes so far apart?'),
    p('Because "MVP" is not a specification and three quotes for the same brief are frequently pricing three different products.'),
    p('An offshore agency at $4k and a local studio at $60k are not disagreeing about difficulty. The first has probably scoped a prototype without the foundations; the second has scoped the full product with a design phase. Neither is dishonest, and comparing the numbers directly is meaningless.'),
    p('The way to make quotes comparable is to write the scope yourself first — the one workflow, the one user type, the one payment — and ask everyone to price that. Differences then reflect approach rather than interpretation.'),
    p('Two questions expose the gap faster than reading the proposals. Ask what happens when a third-party integration is down, and ask who owns the hosting account. The first tells you whether error states were priced or assumed; the second tells you whether you are buying software or renting a dependency. A quote that has not considered either is not cheaper, it is incomplete, and the difference surfaces as change requests in week four.'),
    p('It is also worth asking what the developer would cut if the budget were 30% lower. A good answer names specific features and explains why they do not change what you learn. A bad answer offers to reduce testing or skip staging, which is not a smaller project — it is the same project with the safety removed, and it costs more within the year.'),
    img('quote-spread', 'Three bars of very different heights above a single fixed reference line', 'Three quotes for "an MVP" are usually pricing three different products.'),

    h2('When is an MVP the wrong thing to build?'),
    p('Three cases where I say so on the call.'),

    h3('The question is answerable without software'),
    p('If the thesis is "will people pay for X", a landing page, a waitlist and twenty conversations frequently answer it for a few hundred pounds. Building first is the expensive way to learn something a survey would have told you.'),

    h3('The real constraint is distribution'),
    p('Plenty of products fail with working software and no route to users. If there is no plausible answer to how the first hundred people arrive, the MVP is not the bottleneck and building it will not reveal that.'),

    h3('The scope cannot be cut'),
    p('Some products genuinely do not work below a threshold — a marketplace needs both sides, a compliance tool needs the compliance. Where nothing can be removed without the thing being pointless, it is not an MVP, it is a v1, and it should be budgeted as one.'),

    h2('Conclusion'),
    p('Expect **$1.5k–$4k** for a landing page and waitlist, **$6k–$14k** for a single-workflow app, **$9k–$25k** with an AI feature, and **$15k–$45k** for a marketplace or a web-plus-mobile build. Running costs are usually under $50 a month unless AI is involved.'),
    p('The number moves most through scope, not through hourly rate. Cutting five of eleven features saves more than any negotiation, and the cuts that hurt are always the reasonable ones — anything obviously unnecessary would not have reached the list.'),
    p('When you compare quotes, ask what is excluded, what "done" means, what it costs monthly, and who owns the accounts. A quote with good answers to those four is usually higher than one without, and materially cheaper across the first year. [That conversation is where a build starts](/start), and the cutting is normally the most valuable half hour in it.'),
    p('One last framing that helps founders more than any number here. Do not ask what the product costs to build. Ask what it costs to find out whether the product should exist — and then check whether the thing being quoted actually answers that. The gap between the two questions is where most MVP budgets are spent, and it is entirely avoidable with an afternoon of scoping.'),
  ),
  faqs: faq([
    ['How much does it cost to build an MVP?',
     'A landing page with a waitlist runs $1,500 to $4,000. A single-workflow web app with accounts and payments is $6,000 to $14,000. Adding an AI feature takes it to $9,000 to $25,000, and a marketplace or web-plus-mobile build reaches $15,000 to $45,000.'],
    ['How long does an MVP take to build?',
     'Three to sixteen weeks depending on scope. The foundation is fast and predictable, the core workflow is the bulk, and the final fifth — edge cases, error states, monitoring — takes disproportionately long and is what gets sacrificed when a deadline slips.'],
    ['What should an MVP include?',
     'The smallest set of features that changes what you learn from real users, plus foundations that are never cut: a sound data model, authentication and permissions, error tracking and tested backups. Admin dashboards, team features and extra integrations usually go.'],
    ['Is a fixed price realistic for an MVP?',
     'Yes, with staged scope, provided the quote names what is excluded, defines what done means, and follows someone actually looking at any existing data. Be wary of a fixed price offered without those, because the risk of poor scoping lands on you.'],
  ]),
};
