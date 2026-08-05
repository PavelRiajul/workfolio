import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/handover-documentation/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-handover-documentation',
  slug: 'handover-documentation',
  title: 'Documentation That Survives You Leaving',
  category: 'career',
  order: 116,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-28',
  series: 'Working together',
  excerpt:
    'Most project documentation describes what the code does, which the code already says. What is missing is why, and who has the passwords.',
  coverLabel: 'Handover documentation — cover',
  body: body(
    p('Almost all project documentation is written to the wrong specification. It describes what the system does — the endpoints, the models, the components — which is information already present in the code and more reliably so, since the code cannot be out of date with itself.'),
    p('What is missing when somebody inherits a project is different: why decisions were made, which parts are load-bearing, what has already been tried and abandoned, and where the accounts and credentials live. None of that is derivable from reading the source, and all of it is expensive to reconstruct.'),
    p('This post is about writing the second kind. What actually needs recording, where each thing belongs, and how to produce it as a by-product of the work rather than as a document written miserably in the last week.'),

    h2('Who is the documentation for?'),
    p('Somebody competent who has never seen this project, arriving under time pressure.'),
    p('That is the correct mental model and it changes what gets written. They do not need JavaScript explained; they need to know that the sync logic is more delicate than it looks, that the reporting query is deliberately denormalised, and that the payment webhook has a retry behaviour somebody spent two days getting right.'),
    p('The second audience is the client themselves, who needs something different again — how to do the routine things, who to contact, what they own and where. Conflating the two produces a document that serves neither, so they should be separate artefacts with different tones.'),
    table('Two documents, two purposes', [
      ['', 'For the next developer', 'For the client'],
      ['Contains', 'Decisions, gotchas, architecture', 'Access, routine tasks, contacts'],
      ['Written as', 'Technical notes', 'Plain instructions'],
      ['Lives in', 'The repository', 'Somewhere they will find it'],
      ['Read when', 'Onboarding or debugging', 'Something needs doing'],
      ['Fails by', 'Describing what the code says', 'Assuming technical knowledge'],
    ]),
    p('The last row is where each one usually goes wrong, and both failures come from writing for yourself rather than for the reader you named.'),

    h3('Write for the moment of need'),
    p('Documentation is not read start to finish; it is consulted when something is wrong or something must be done. That means headings that match the question somebody is asking, short sections, and answers near the top rather than after context.'),
    img('two-audiences', 'Two documents serving different readers rather than one attempting to serve both', 'The next developer needs decisions and gotchas. The client needs access and routine tasks. One document serves neither.'),

    h2('What actually needs writing down?'),
    p('The things that are not recoverable from the code.'),
    ol([
      '**Why the architecture is shaped this way** — the constraints that produced it.',
      '**Decisions and their alternatives** — what was considered and rejected, and why.',
      '**The delicate parts** — what will break if touched carelessly.',
      '**What was tried and abandoned** — so nobody repeats it.',
      '**External dependencies** — accounts, services, who owns each.',
      '**The routine operations** — deploying, restoring a backup, rotating a key.'],
    ),
    p('The fourth item is the most neglected and among the most valuable. Somebody inheriting a project will look at an obvious improvement and implement it, without knowing it was tried and reverted for a reason nobody recorded — and that is a week lost to a decision already made.'),

    h3('Constraints outlive their context'),
    p('A schema shaped oddly because of a legacy system, a workaround for a third-party bug, a denormalisation added for a specific report. Each looks like a mistake to a newcomer, and each has a reason that will be invisible in six months unless it is written next to the thing it explains.'),

    h3('Name what is load-bearing'),
    p('Every project has two or three places where a careless change causes disproportionate damage — an auth boundary, a migration path, a sync routine. Saying explicitly which those are is one of the highest-value paragraphs you can write, and it takes five minutes.'),

    h2('Where should each thing live?'),
    p('As close to what it describes as possible, which is usually not in a document.'),
    p('The failure mode of a central documentation file is that it drifts, because updating it is a separate act from making the change. Information that lives next to the code it describes gets updated as a side effect of the work, which is the only mechanism that reliably keeps documentation true.'),

    h3('Decisions go in commit messages'),
    p('The reason for a change belongs in the commit that makes it, where it is permanently attached and cannot drift. Writing why rather than what turns the history into a record of reasoning — and it costs one extra sentence at the moment you are best placed to write it.'),

    h3('Gotchas go in code comments'),
    p('A comment explaining that a value is 3000 because the upstream API times out at 3200 belongs exactly there, not in a wiki nobody opens. Comments describing what the code does are noise; comments describing why it is unusual are the useful kind.'),

    h3('Architecture goes in a document'),
    p('The overall shape — how the pieces fit, what the data model represents, why the boundaries are where they are — genuinely needs a single narrative and does not attach to any one file. A short document in the repository, updated when the shape changes, is the right home.'),

    h3('Operations go in a runbook'),
    p('How to deploy, roll back, restore a backup, rotate a credential, run the seed script. Step-by-step, tested by following them exactly, in the repository next to the code they operate on.'),
    img('proximity', 'Explanations positioned beside what they describe rather than gathered in a separate document', 'Documentation that lives next to the code gets updated as a side effect of the work. A separate file drifts.'),

    img('not-in-code', 'Reasoning and abandoned attempts recorded alongside the system they explain', 'The abandoned-attempts section is the most neglected. Without it, somebody spends a week rediscovering a decision.'),

    h2('What goes in the README?'),
    p('Enough to get running in ten minutes, and pointers to everything else.'),
    p('The README is read once, by somebody who wants the project running locally, and it should be optimised entirely for that. Everything else it contains is a distraction from the one job, and every unnecessary paragraph reduces the chance the important lines are read.'),

    code('md', `
# Project

One sentence: what this is and who uses it.

## Running locally
1. Prerequisites (versions that matter)
2. Copy .env.example to .env — see "Environment" below
3. Install, migrate, seed, start

## Environment
Each variable, what it is for, where to get it, whether it is required.

## Deploying
How, from where, what triggers it, how to roll back.

## Where things are
- Architecture and decisions → docs/architecture.md
- Operational procedures → docs/runbook.md
- Gotchas → in the code, near the thing
`),

    h3('Test it on a clean machine'),
    p('The instructions are correct only if somebody following them exactly, on a machine that has never built this project, ends up with it running. Every set-up guide accumulates assumptions about what is already installed, and the only way to find them is to try.'),

    h3('Document every environment variable'),
    p('Not just the name — what it does, where to obtain it, whether it is required and what a valid value looks like. An undocumented variable is a blocker that stops somebody entirely, and it is the most common reason a handover stalls on the first day.'),

    h2('What does the client actually need?'),
    p('Access, routine tasks and contacts — in plain language, somewhere they can find it.'),

    h3('Everything they own, listed'),
    p('Domain registrar, hosting, database, email service, analytics, error tracking, any third-party service. Each with what it is for, which account owns it and roughly what it costs. This list is the single most useful thing you can hand over.'),

    h3('Accounts in their name, not yours'),
    p('Every service should be registered to the client with you as a collaborator, not the reverse. An account in your name is a dependency they did not agree to and a genuine problem if you are unavailable — [which is why client-owned accounts are part of the baseline](/stack).'),

    h3('How to do the things they will do'),
    p('Adding a page, uploading an image, changing a price, exporting orders. Short, specific, written for somebody non-technical, ideally with screenshots. This is the document that determines whether they feel ownership or dependency.'),

    h3('Who to contact for what'),
    p('You, the host, the payment provider, the domain registrar — with what each is responsible for. During an incident, knowing who to call is most of the response, and nobody assembles that list under pressure.'),

    h2('How do you write it without hating it?'),
    p('Continuously, as a by-product, rather than in a miserable final week.'),
    p('Documentation written at the end is bad for structural reasons: the decisions are months old, the reasoning has faded, and the task competes with wanting the project finished. Written as you go, it is a few minutes each time and the reasoning is fresh.'),

    h3('Write the decision when you make it'),
    p('A short note at the moment of choosing — what was chosen, what else was considered, why — takes two minutes and is impossible to reconstruct later. A file of these accumulated across a project is the most valuable document at handover and it was never actually written.'),

    h3('Document the thing that just confused you'),
    p('Any moment spent working out something non-obvious is a signal. Writing it down immediately, wherever it belongs, converts a fifteen-minute investigation into a paragraph and prevents the next person repeating it.'),

    h3('Update as part of the change'),
    p('Documentation edits belong in the same commit as the change they describe. Separated, they get skipped, and a document that is confidently wrong is worse than one that is absent — because it is trusted.'),

    h3('Let the code carry what it can'),
    p('Clear names, small functions, types and a well-organised structure remove the need for a great deal of prose. The best documentation reduction available is code that does not require explanation, and effort spent there pays back more than effort spent describing unclear code.'),
    img('as-you-go', 'Records produced alongside the work rather than assembled at the end of a project', 'Written at the end, the reasoning has faded and it competes with wanting to finish. Written as you go, it is two minutes.'),

    h2('What about diagrams?'),
    p('Two are worth having and the rest are usually not.'),

    h3('The system diagram'),
    p('Boxes for the pieces and arrows for what talks to what. Nothing more detailed, because detail is what makes a diagram go stale. This single image saves a newcomer more time than several pages of prose.'),

    h3('The data model'),
    p('Entities and relationships, at the conceptual level. The database schema is authoritative for detail; the diagram exists to convey the shape, which is the part that takes longest to infer from a schema.'),

    h3('Keep them in text where you can'),
    p('A diagram defined in text lives in the repository, diffs meaningfully and can be updated by anybody. A image exported from a design tool cannot be edited by whoever inherits it and becomes wrong permanently the first time the system changes.'),

    h3('Do not diagram the sequence of everything'),
    p('Detailed interaction diagrams for each flow are expensive to produce, go out of date immediately, and are usually less clear than reading the code. Reserve them for the one or two flows that are genuinely difficult to follow.'),

    img('two-diagrams', 'A system overview and a conceptual data model, without further detail', 'Two diagrams earn their place. Detail is what makes a diagram go stale, so keep both at the level that survives change.'),

    h2('How much is enough?'),
    p('Proportional to how long the project will outlive your involvement.'),
    table('Documentation by project shape', [
      ['Project', 'Needs'],
      ['A one-week fix', 'Commit messages and a note in the pull request'],
      ['A marketing site', 'README, client guide, account list'],
      ['A product build', 'All of the above plus architecture and runbook'],
      ['A system with a team inheriting it', 'Plus decision records and onboarding notes'],
    ]),
    p('The error in both directions is common. A substantial system handed over with only a README costs the receiving team weeks; a small site with a fifteen-page manual has consumed effort that produced nothing anybody will read.'),

    h3('Ask who reads it and when'),
    p('If you cannot name a person and a moment for a document, it probably should not exist. That question removes most of the documentation that gets written out of a sense of obligation.'),

    h2('What makes documentation go bad?'),
    p('Being wrong, which is worse than being absent.'),
    p('An out-of-date document is actively harmful because it is trusted. Somebody follows deployment instructions that no longer apply, or relies on an architectural description that has since changed, and the failure is worse than if they had read the code because they had no reason to doubt it.'),

    h3('Delete rather than let it rot'),
    p('A section describing a system that no longer exists should be removed, not left with a note. Less documentation that is true beats more that is partially false, and deleting is a legitimate maintenance action rather than a failure.'),

    h3('Date the things that age'),
    p('Anything reflecting a point in time — a cost estimate, a performance figure, a third-party behaviour — should carry the date it was true. A reader can then judge it rather than trusting it blindly.'),

    h3('Prefer the durable over the specific'),
    p('"Deploy by pushing to main" outlives "click the button in the top right of the dashboard". Describing the mechanism rather than the interface means the documentation survives the interface changing, which it will.'),
    img('rot', 'Instructions that no longer match the system they describe being followed with confidence', 'Wrong documentation is worse than none, because it is trusted. Deleting a stale section is maintenance, not failure.'),

    h2('What does a handover session look like?'),
    p('A walkthrough of the documents rather than a substitute for them.'),
    p('A live session is valuable and it is not documentation — everything said in it is forgotten within a fortnight. The right shape is to write everything first, then use the session to walk through it, answer questions and find the gaps the writing missed.'),

    h3('Have them do it, not watch it'),
    p('The person taking over should run the project locally, deploy it, and perform a routine operation while you are available. Watching a demonstration proves nothing; doing it proves the documentation works and finds the missing step.'),

    h3('Record the session'),
    p('A recording costs nothing and is genuinely useful for whoever joins three months later. It does not replace the written material and it captures the incidental explanations that never make it into a document.'),

    h3('Agree what happens afterwards'),
    p('Whether there is a support window, what it covers and how to reach you. An ambiguous ending produces either an awkward unpaid obligation or a client who feels abandoned, and both are avoidable with one sentence agreed in advance — [part of a complete handover](/blog/project-handover-checklist).'),

    h2('What does it cost?'),
    p('Perhaps two percent of the project if done continuously, and considerably more if left to the end.'),
    p('Written as you go, it is a few minutes per decision and a day at the end for the architecture document, the runbook and the client guide. Left until the final week it becomes several unpleasant days of reconstruction, done badly, on work you have already mentally finished.'),
    p('The honest counterweight: documentation has a real opportunity cost and the instinct to write more of it is often misplaced. I have seen substantial effort go into architecture documents for projects that were rewritten within a year, and detailed API references maintained by hand alongside code that already described itself. The parts that reliably repay the effort are narrow — the decision record, the gotchas, the runbook and the account list — and everything beyond those should be justified by naming who reads it and when. If you cannot, the honest answer is to write less and spend the time making the code clearer instead.'),
    quote('Documentation describing what the code does is redundant. What is missing is why, what is fragile, what was already tried, and who has the passwords.'),

    h2('Conclusion'),
    p('Write for somebody competent who has never seen the project and is under time pressure — they do not need the language explained, they need to know which parts are load-bearing and why the odd-looking decisions were made. Keep the client document separate, in plain language, covering access and routine tasks.'),
    p('Record only what is not recoverable from the code: the constraints that shaped the architecture, the alternatives considered and rejected, the delicate parts, what was tried and abandoned, the external accounts, and the routine operations. The abandoned-attempts section is the most neglected and prevents somebody spending a week rediscovering a decision.'),
    p('Put each thing as close to what it describes as possible. Reasons go in commit messages where they cannot drift, gotchas go in comments beside the unusual code, the overall shape goes in one document, and procedures go in a runbook that has been tested by following it exactly.'),
    p('Keep the README focused on getting running in ten minutes, document every environment variable including where to obtain it, and test the instructions on a machine that has never built the project. Hand over accounts registered in the client\'s name with you as collaborator, never the reverse.'),
    p('Write it continuously rather than in a final miserable week, update it in the same commit as the change, and delete sections that have gone stale — wrong documentation is worse than none because it is trusted. Then run a handover session where they do it rather than watch, and agree explicitly what support follows. If you want a project handed over so you actually own it, [that is how I finish](/services).'),
  ),
  faqs: faq([
    ['What should project documentation actually contain?',
     'The things not recoverable from the code: why the architecture is shaped this way, what was considered and rejected, which parts are fragile, what was tried and abandoned, which external accounts exist and who owns them, and how to perform routine operations like deploying and restoring a backup.'],
    ['Why is documenting what the code does a waste?',
     'Because the code already says it, and says it more reliably — source cannot be out of date with itself, while a written description can. Effort spent describing behaviour is better spent on clear naming and structure, which removes the need for the explanation entirely.'],
    ['Where should documentation live?',
     'As close to what it describes as possible. Reasons in commit messages, gotchas in comments beside the unusual code, overall architecture in one document, procedures in a runbook. Anything in a separate central file drifts, because updating it is a separate act from making the change.'],
    ['How do I write documentation without leaving it to the end?',
     'Record each decision when you make it — what was chosen, what else was considered, why — which takes two minutes and cannot be reconstructed later. Document anything that just confused you, and put documentation edits in the same commit as the change they describe.'],
    ['How much documentation is enough?',
     'Proportional to how long the project outlives your involvement. A one-week fix needs good commit messages; a product build needs an architecture document, a runbook and a client guide. If you cannot name who reads a document and when, it probably should not exist.'],
  ]),
};
