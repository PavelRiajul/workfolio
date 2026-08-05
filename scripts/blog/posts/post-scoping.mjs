import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/project-scoping/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-project-scoping',
  slug: 'project-scoping',
  title: 'How I Scope a Project Before Quoting It',
  category: 'career',
  order: 110,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-13',
  series: 'Working together',
  excerpt:
    'Most projects that go wrong were mis-scoped, not mis-built. The questions that surface the real work, and what to do with the answers.',
  coverLabel: 'Project scoping — cover',
  body: body(
    p('Almost every project I have seen go badly went wrong before any code was written. Not because somebody built the wrong thing badly, but because the thing everybody agreed to build turned out to contain three pieces of work nobody had mentioned — a migration from a system that was never named, an approval flow that lived in somebody\'s head, an integration whose API turned out to be a spreadsheet emailed weekly.'),
    p('Scoping is the process of finding those before quoting rather than during delivery. It is not writing a specification, and it is not asking a client to produce a brief they do not have. It is a structured conversation aimed at converting a vague intention into a set of deliverables with a shape you can reason about.'),
    p('This is how I run it, what I ask, what I do when the answers are unsatisfying, and the specific signals that mean a project is not ready to be quoted yet.'),

    h2('What is scoping actually for?'),
    p('Making the unknown work visible while it is still cheap to talk about.'),
    p('Every project contains work that nobody articulated at the start. The purpose of scoping is not to eliminate that — it cannot be eliminated — but to surface enough of it that the estimate is honest and the surprises are small. A project where the surprise is "we also need to import fifteen years of records from a legacy system" is a different project from the one that was quoted.'),
    p('The second purpose is deciding whether to take the work at all. A conversation that reveals a client who cannot describe what success looks like, or a timeline driven by something arbitrary, is worth having before a contract rather than after — and [saying no is sometimes the right outcome](/blog/declining-projects).'),
    table('What scoping produces', [
      ['Output', 'Why it matters'],
      ['A list of deliverables', 'Something concrete to agree on'],
      ['A stated set of exclusions', 'What is not included, in writing'],
      ['Identified unknowns', 'Named risks rather than hidden ones'],
      ['A rough shape and timeline', 'Enough to decide, not a Gantt chart'],
      ['A go or no-go', 'Some projects should not start'],
    ]),
    p('The second row does more work than the first. Agreement about what is included is usually easy; disagreement arrives over what somebody assumed was included, and the only defence is having written down that it is not.'),

    h3('It is not a specification'),
    p('A full specification written before any building has started is mostly fiction, because the useful details emerge from contact with the real system. Scoping aims at enough definition to commit to a direction and a price, not at removing every decision from the build.'),
    img('surfacing', 'Concealed work being made visible before commitments are made rather than during delivery', 'The purpose is not eliminating unknown work — it is surfacing enough that the estimate is honest and the surprises are small.'),

    h2('What do you ask first?'),
    p('What happens if this does not get built, which tells you more than any feature question.'),
    p('The answer separates real projects from ideas. "We lose the contract in March" is a project. "It would be nice to have" is an idea that will lose to something more urgent halfway through, usually after enough work has been done to matter. Understanding the driving pressure also tells you which parts of the scope are genuinely negotiable.'),

    h3('Who is this for, specifically?'),
    p('Not a market segment — an actual person doing an actual task. If nobody can describe one, the project is a solution looking for a problem, and the requirements will change every time somebody new joins the conversation because there is no reference point to settle disagreements against.'),

    h3('What are they doing today instead?'),
    p('Every replacement project has an incumbent, even if the incumbent is a spreadsheet, an email thread or an intern. Understanding it tells you the real requirements — the ones people rely on without noticing — and it is where the unstated must-haves live.'),

    h3('What does success look like in three months?'),
    p('A concrete answer gives you an acceptance criterion. A vague one is a warning: a project without a definition of done finishes when somebody runs out of patience, and that moment is unpredictable and usually unpleasant for both sides.'),

    h3('What is the deadline and where does it come from?'),
    p('A date tied to something real — a contract, an event, a funding round — is a genuine constraint you can plan around. A date that came from a meeting is negotiable, and knowing which kind you are dealing with changes what you propose entirely.'),

    h2('Where does the hidden work live?'),
    p('In four places, and asking about each one directly is most of the value of a scoping call.'),

    h3('Data that already exists'),
    p('Any project replacing something has data to migrate, and migration is consistently underestimated because the existing data is messier than anybody remembers. Ask to see it. Not a description of it — the actual export, with its inconsistent dates, duplicate records and the column somebody used for three different purposes.'),

    h3('Integrations with other systems'),
    p('"It needs to connect to our CRM" can mean a documented API, an undocumented one, a nightly CSV, or a person copying values between tabs. These are wildly different amounts of work and they are described identically. Ask which system, which version, and whether anybody has authenticated against it before.'),

    h3('Approval and exception flows'),
    p('The happy path is easy to describe and rarely the hard part. What happens when a request is rejected, when somebody is on leave, when an order needs manual override — those flows exist, they are usually undocumented, and they are frequently half the build.'),

    h3('Who has to sign off'),
    p('A project with one decision-maker moves at one speed. A project needing agreement from marketing, legal, IT and a regional director moves at another, and the difference is not in the code. Establishing the approval chain early prevents a two-week delay appearing in week five.'),
    img('hidden-work', 'Four recurring areas where unquoted work tends to be concealed', 'Data, integrations, exception flows and sign-off. Asking about each directly is most of the value of the conversation.'),

    h2('How do you handle vague answers?'),
    p('By making the vagueness concrete rather than by filling it in yourself.'),
    p('The instinctive response to an unclear requirement is to assume a reasonable interpretation and move on. That is how a project ends up delivering something defensible and wrong. The better move is to state the interpretation explicitly and get it confirmed or corrected, which takes a sentence and is remarkably effective.'),

    h3('Propose a version and let them react'),
    p('People find it much easier to correct a concrete proposal than to specify from nothing. "I am assuming users can be invited by email and there are two roles, admin and member — is that right?" gets a useful answer where "how should permissions work?" gets a shrug.'),

    h3('Ask what happens in the awkward case'),
    p('"What happens if two people edit the same record?" or "what if the payment fails halfway?" surfaces requirements nobody would volunteer. These questions also demonstrate that you are thinking about their system rather than about a generic one, which does more for trust than any credential.'),

    h3('Timebox the unknowable'),
    p('Some things genuinely cannot be determined without investigation — whether an old API can do what is needed, whether the data is clean enough. Those become a small paid discovery piece rather than a guess embedded in a fixed price, and framing it that way is usually welcomed.'),

    h3('Write the assumptions into the proposal'),
    p('Every assumption you made to produce a number belongs in writing, next to the number. It converts a future argument into a reference, and it makes explicit that the price depends on those things being true.'),

    h2('How do you size the work?'),
    p('By breaking it into pieces small enough to estimate, then adding for what you cannot see.'),
    p('An estimate for "a customer portal" is a guess. An estimate for a schema, an auth flow, four screens, a document upload, an admin view and a deployment is a sum of things you have built before. The granularity is what makes it defensible — and where a component is too large to estimate, that is a signal it is not understood well enough yet.'),

    h3('Estimate the whole thing, not the code'),
    p('The build is often half the work. Environment setup, error tracking, testing, review cycles, revisions, deployment, documentation and handover are all real and routinely omitted from estimates because they are not features. [The eight things I set up on every project](/stack) are part of the quote, not a favour.'),

    h3('Add contingency, and say that you have'),
    p('A buffer that is hidden inside inflated line items is dishonest and gets negotiated away line by line. A stated contingency for named unknowns is a professional position, and clients accept it far more readily than people expect.'),

    h3('Match the engagement to the certainty'),
    p('Well-understood work with a clear boundary suits a fixed-scope sprint. A larger build with a real launch date suits a fixed-scope product engagement. Work that genuinely cannot be pinned down suits an ongoing arrangement — [three shapes for three levels of certainty](/services), and picking the wrong one is what makes fixed-price projects painful.'),
    img('granularity', 'A large undefined request decomposed into pieces small enough to price individually', 'Anything too large to estimate is a signal it is not understood yet. Granularity is what makes a number defensible.'),

    img('assumptions', 'Stated conditions recorded beside the figure that depends on them', 'Every assumption you made to produce a number belongs next to the number. It turns a future argument into a reference.'),

    h2('What goes in the proposal?'),
    p('Deliverables, exclusions, assumptions, a timeline shape and a price — on two pages, not twelve.'),
    ol([
      '**What I understood** — the problem in my words, so a misunderstanding surfaces immediately.',
      '**What is included** — concrete deliverables, specific enough to check off.',
      '**What is not included** — the exclusions, stated plainly rather than implied.',
      '**Assumptions** — everything the price depends on being true.',
      '**Timeline shape** — phases and a launch window, not a day-by-day plan.',
      '**Price and terms** — how it is structured and what triggers a change.'],
    ),
    p('The first item catches more problems than the rest combined. Restating the problem in your own words gives the client something to correct, and a client who reads it and says "that is not quite it" has just saved both of you a fortnight.'),

    h3('Make exclusions specific'),
    p('"Content creation not included" is weaker than "I will build the CMS; writing and uploading the 40 product descriptions is yours." Naming the actual thing prevents the disagreement rather than merely giving you a position in it.'),

    h3('Have a change process before you need one'),
    p('Scope changes are normal and healthy. What causes friction is having no agreed way to handle them, so each one becomes a negotiation about whether it was implied. A stated process — new work is estimated and approved before it starts — makes change routine rather than adversarial.'),

    h2('What are the warning signs?'),
    p('Six, and any two together are usually enough to walk away.'),
    ul([
      '**Nobody can describe the user** — the requirements will never stabilise.',
      '**The deadline predates the scope** — the date was set before anyone knew the work.',
      '**"It should be simple"** — usually said about the part that is not.',
      '**No named decision-maker** — every review will reopen settled questions.',
      '**The previous developer is unmentionable** — there is a story you are not being told.',
      '**Price is the only question** — a client optimising solely on cost will optimise on it throughout.',
    ]),
    p('None of these is disqualifying alone, and each is worth naming out loud. Some resolve immediately — a client who cannot describe the user may simply not have been asked before, and the conversation itself fixes it.'),

    h3('The unmentionable predecessor deserves a question'),
    p('There is always a reason the last person left, and it is sometimes the client. Asking directly and listening to how it is described tells you a great deal about what working with them will be like, and the answer is usually given freely.'),
    img('warning-signs', 'A set of early indicators suggesting a project is not yet ready to be committed to', 'None is disqualifying alone, and each is worth naming aloud. Some resolve the moment somebody asks the question.'),

    img('proposal-shape', 'A short document restating the problem before listing what will be delivered', 'The restatement catches more problems than everything else combined. A client saying "not quite" there has saved you a fortnight.'),

    h2('How long should scoping take?'),
    p('A call and a couple of hours for most projects, longer for genuinely complex ones — and it is not free.'),
    p('A one-hour conversation followed by two hours of thinking and writing produces a proposal for a typical project. That time is a real cost of doing business and it is worth spending properly, because a bad estimate costs far more than the hours saved by rushing it.'),

    h3('Charge for deep discovery'),
    p('When scoping requires reading a codebase, interviewing several people or investigating whether an integration is feasible, that is consulting work rather than a sales conversation. Charging for it filters out clients who were never going to commit and gives you the access you need to be accurate.'),

    h3('Do not scope for free at length'),
    p('An unpaid scoping process that stretches across four meetings and a written technical plan is a project being delivered without a contract. Recognising where the line falls — and saying so pleasantly — is part of practising sustainably.'),

    h3('Reuse what you can'),
    p('Similar projects have similar shapes, and a set of reference estimates from past work makes each new one faster and more accurate. Keeping actuals against your original estimates is what turns experience into calibration — [which is the whole subject of estimation](/blog/estimation-lessons).'),

    h2('What if the client wants a number immediately?'),
    p('Give a range with the assumptions attached, or decline to guess.'),
    p('The request is reasonable — people need to know whether something is a five-thousand or fifty-thousand pound problem before investing time. A wide range with explicit conditions serves that need honestly, where a precise-sounding number produced in thirty seconds does not.'),

    h3('A range is a real answer'),
    p('"Between X and Y depending on whether the data migration is needed and how the CRM integration works" is genuinely useful. It tells them the order of magnitude and shows them which decisions move the number, which is often exactly what they wanted to know.'),

    h3('Never let an off-the-cuff number become the budget'),
    p('A figure mentioned casually in a first conversation has a way of becoming the expectation regardless of what is learned afterwards. If you give one, frame it explicitly as pre-scope and repeat that framing when you deliver the real estimate.'),

    h2('What does it cost?'),
    p('Two to three hours per proposal, on work you may not win.'),
    p('That is the honest arithmetic of it, and at a reasonable win rate the time spent on proposals that go nowhere is a real overhead. It is still cheaper than the alternative, which is winning a project you have not understood and discovering its true shape in week three with a fixed price already agreed.'),
    p('The honest counterweight: scoping cannot eliminate uncertainty, and a process that tries becomes its own problem. I have seen fixed-price work where the scoping was so thorough that it consumed a week and produced a document nobody read, on a project that changed direction in the second sprint anyway. The goal is enough definition to commit responsibly, not certainty — and for genuinely exploratory work, the right answer is often to stop trying to scope it and structure the engagement so it does not need to be scoped.'),
    quote('Most projects that go wrong were mis-scoped, not mis-built. The work nobody mentioned is still work, and it is cheapest to find before there is a price attached.'),

    h2('Conclusion'),
    p('Scoping exists to make unknown work visible while it is still cheap to discuss, and to decide whether to take the project at all. It is not a specification — a full spec written before contact with the real system is mostly fiction — it is enough definition to commit to a direction and a number responsibly.'),
    p('Start with what happens if this is not built, because that separates real projects from ideas and tells you which parts of the scope are negotiable. Then ask who specifically it is for, what they do today instead, what success looks like in three months, and where the deadline came from.'),
    p('Go looking for hidden work in the four places it lives: data that already exists and is messier than anybody remembers, integrations described identically whether they are a documented API or a weekly CSV, exception flows that are usually half the build, and the sign-off chain that determines how fast anything moves.'),
    p('When answers are vague, propose a concrete interpretation and let people correct it rather than filling the gap yourself. Timebox genuinely unknowable things into a small paid discovery piece instead of burying a guess inside a fixed price, and write every assumption next to the number it supports.'),
    p('Then keep the proposal to two pages: what you understood in your own words, what is included, what is explicitly not, the assumptions, a timeline shape and the price. Match the engagement type to how certain the work actually is, and treat the warning signs as questions to ask rather than reasons to stay quiet. If you have a project that needs this done properly, [start here](/start).'),
  ),
  faqs: faq([
    ['What is the difference between scoping and writing a specification?',
     'A specification tries to define everything before building; scoping aims for enough definition to commit to a direction and a price. Detailed specs written before any contact with the real system are largely fiction, because the useful details only emerge once you are working with the actual data and systems.'],
    ['What is the single most useful scoping question?',
     'What happens if this does not get built. A concrete answer — losing a contract in March — means a real project with real pressure. A vague one means an idea that will lose to something more urgent halfway through, usually after enough work has been done to matter.'],
    ['Where does unquoted work usually hide?',
     'Four places: migrating data that is messier than anyone remembers, integrations described the same way whether they are a real API or a weekly spreadsheet, exception and approval flows that are frequently half the build, and the sign-off chain that determines how fast decisions happen.'],
    ['Should I charge for scoping?',
     'For a conversation and a proposal, no — that is the cost of doing business. When it requires reading a codebase, interviewing several people or investigating whether an integration is feasible, that is consulting work. Charging for it filters out clients who were never going to commit.'],
    ['What do I say when a client wants a price immediately?',
     'Give a range with the conditions that move it — "between X and Y depending on whether the data migration is needed". That answers the real question, which is usually about order of magnitude. Frame it explicitly as pre-scope, or it quietly becomes the budget regardless.'],
  ]),
};
