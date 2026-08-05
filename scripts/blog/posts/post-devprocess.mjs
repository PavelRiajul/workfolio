import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/development-process/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-development-process',
  slug: 'development-process',
  title: 'A Development Process Without the Ceremony',
  category: 'career',
  order: 111,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-16',
  series: 'Working together',
  excerpt:
    'Six steps from first message to production. What each one is actually for, and why most process overhead solves problems small teams do not have.',
  coverLabel: 'Development process — cover',
  body: body(
    p('Most development process was designed for teams of forty and gets applied to teams of two. Sprint ceremonies, story points, three-tier estimation and a project manager translating between people who sit next to each other — these solve coordination problems that exist at scale and cost real time when there is nothing to coordinate.'),
    p('The opposite failure is just as common: no process at all, work that drifts, a client who has not seen anything in three weeks, and a launch that arrives as a surprise to everybody. Process exists to prevent that, and the useful amount is smaller than agencies suggest and larger than nothing.'),
    p('What follows is the six-step process I actually run, what each step exists to prevent, and where I have seen the lightweight version fail.'),

    h2('What is process actually for?'),
    p('Removing the two failure modes that account for most unhappy projects — surprise and drift.'),
    p('Surprise is a client discovering in week six that the thing being built is not the thing they imagined. Drift is a project that never quite finishes because the definition of done kept moving. Almost every process ritual is aimed at one of those, and any ritual that is not aimed at either is worth questioning.'),
    p('Once you frame it that way, the amount of process needed becomes a function of how much surprise and drift the arrangement is prone to, rather than a fixed methodology applied uniformly. A two-week fixed-scope piece needs very little. A three-month build with several stakeholders needs more.'),
    table('What each mechanism prevents', [
      ['Mechanism', 'Prevents'],
      ['Written scope', 'Disagreement about what was agreed'],
      ['Preview deploy on every push', 'Surprise — they see it as it is built'],
      ['Small pull requests', 'Large, unreviewable changes late'],
      ['Weekly demo', 'Drift — direction corrected early'],
      ['Change process', 'Scope creep arriving unpriced'],
      ['Handover', 'A project that only you can maintain'],
    ]),
    p('The second row does the most work for the least effort. A client who can open a URL and see the current state at any time asks better questions and asks them earlier, which is the cheapest correction mechanism available.'),

    h3('The right amount scales with the stakes'),
    p('A one-week audit needs a scope and a report. An eight-week product build needs weekly demos and a change process. Applying the second to the first is overhead; applying the first to the second is how projects go quiet and then go wrong.'),
    img('two-failures', 'Two distinct project failure patterns addressed by different lightweight mechanisms', 'Surprise and drift account for most unhappy projects. Any ritual not aimed at one of them is worth questioning.'),

    h2('How does it start?'),
    p('A message, then a call, then a scope — in that order and quickly.'),
    p('The first contact does not need to be a brief. Most people asking for work do not have a specification and producing one is a task they should not be doing, because the useful questions are ones they would not know to answer. A few lines about the problem is enough to decide whether a call is worth having.'),

    h3('The call is for questions, not a pitch'),
    p('Thirty minutes of asking about the problem, the users, what exists today and where the deadline came from. A call that is mostly me talking about how I work has learned nothing and is why so many first conversations produce misaligned quotes.'),

    h3('Then a written scope, before anything else'),
    p('Deliverables, exclusions, assumptions, timeline shape and price. Two pages. This is the artefact everything downstream refers back to, and building without it is the single most reliable way to end up in a disagreement neither side can resolve — [the whole subject of scoping properly](/blog/project-scoping).'),

    h3('A quick no is a service'),
    p('If the project is not a fit — wrong technology, wrong timeline, wrong shape — saying so in the first conversation is worth more to them than a polite delay. It is also faster than producing a proposal designed not to win.'),

    h2('What does building look like day to day?'),
    p('Small commits, small pull requests, and a deploy on every push.'),
    p('The mechanical part of the process is deliberately unremarkable. Work happens in small increments, each with a clear commit message, each pushed to a branch that produces a preview deployment. Nothing is hidden on a local machine for a week.'),

    h3('Preview deploys change the relationship'),
    p('When every push produces a URL, progress stops being a status update and becomes something the client can look at. That removes the weekly ritual of describing work in words, which is a lossy medium for anything visual, and it catches misunderstandings within a day rather than at a milestone.'),

    h3('Small pull requests are for the client too'),
    p('A pull request that changes forty files cannot be meaningfully reviewed by anybody, including a technical client who wanted to follow along. Keeping them small makes the work legible and it makes reverting a mistake trivial instead of surgical.'),

    h3('Commit messages are documentation'),
    p('A year later, the reason a decision was made lives in the commit that made it or nowhere. Writing why rather than what takes an extra sentence and it is what makes a codebase explicable to whoever inherits it.'),

    h3('The baseline goes in first, not last'),
    p('Staging, CI, error tracking, uptime monitoring, backups, spam protection, email authentication and client-owned accounts are set up at the start of the build rather than before launch. [Those eight things](/stack) are an hour each at the beginning and a crisis each in production.'),
    img('preview-deploys', 'Each increment producing an inspectable running version rather than a written status update', 'A URL beats a status update. It catches misunderstanding within a day rather than at a milestone.'),

    h2('How does review actually work?'),
    p('On a real deploy, with real feedback, on a regular cadence.'),
    p('The demo is the correction mechanism, and its value comes from being regular rather than from being polished. A weekly look at the actual thing, with an explicit invitation to say what is wrong, surfaces direction problems while they cost a day rather than a fortnight.'),

    h3('Show the unfinished version'),
    p('There is a strong temptation to hide work until it is presentable. That defeats the purpose — feedback on something half-built is cheap to act on, and feedback on something finished arrives after the cost has been paid. Showing rough work requires a little trust and it saves a great deal of rework.'),

    h3('Ask specific questions'),
    p('"What do you think?" produces politeness. "Is this the order somebody would actually do these steps in?" produces information. Directing attention at the decisions you are unsure about is what turns a demo into a review.'),

    h3('Write down what came out of it'),
    p('A short list of what was agreed and what changed, sent afterwards. Verbal agreement in a call evaporates, and two people remembering a conversation differently a month later is a category of dispute that a three-line summary prevents entirely.'),

    h3('Separate feedback from scope changes'),
    p('"The button should be blue" is feedback. "It should also handle recurring bookings" is a new project. Handling both in the same conversation without naming the difference is how scope grows without anybody deciding to grow it.'),

    img('review-cadence', 'Direction corrected at regular short intervals rather than at a single late milestone', 'Show the unfinished version. Feedback on half-built work is cheap to act on; feedback on finished work arrives after the cost.'),

    h2('How do you handle changes?'),
    p('With a stated process, so change is routine rather than adversarial.'),
    p('Scope changes are not a problem; unmanaged ones are. A client who learns something in week three and wants to act on it is behaving correctly, and a process that treats that as a violation makes them stop telling you things, which is much worse.'),

    h3('Estimate before agreeing, always'),
    p('Every change gets a quick estimate and an explicit yes before work starts. That is often five minutes, and it prevents the accumulation of small unpriced additions that turn a profitable project into an unprofitable one without any single decision causing it.'),

    h3('Offer the trade, not just the cost'),
    p('"That is two days — we can add it to the timeline, or drop the export feature to keep the date" gives the client a real decision. Presenting only the extra cost frames you as an obstacle; presenting the trade frames you as a partner managing a constraint.'),

    h3('Keep a visible list of deferred items'),
    p('Things agreed as out of scope should go somewhere both parties can see rather than being forgotten or silently reintroduced. It also becomes the natural starting point for a second phase, which is a much easier conversation than starting from nothing.'),
    img('change-process', 'A proposed addition estimated and decided before it enters the work rather than after', 'Change is normal. What causes friction is having no agreed way to handle it, so each one becomes a negotiation.'),

    h2('What happens at launch?'),
    p('A rehearsed deploy, a checked list, and somebody available afterwards.'),
    p('Launch is the step most likely to be treated as an event rather than a process, and it is where avoidable problems concentrate. The deployment itself should be boring because it has been done many times to staging; what needs attention is everything around it.'),

    h3('Deploy to production before launch day'),
    p('The first production deployment should not be the launch. Getting the environment, the domain, the certificates and the environment variables working days earlier means launch day is a promotion rather than a first attempt.'),

    h3('Work through a real checklist'),
    p('Monitoring live, backups running and tested, error tracking receiving events, email authentication configured, analytics recording, and the forms actually sending. Each is trivial and each is forgotten regularly, which is exactly what a written list is for.'),

    h3('Be available for the first few days'),
    p('Real traffic finds things staging never did. A short period of active attention after launch is part of delivering the project rather than a separate support arrangement, and treating it that way avoids an awkward conversation in the first week.'),

    h3('Then hand it over properly'),
    p('Repository access, deployment instructions, environment variables, account ownership and a short document covering how to do the routine things. [A proper handover](/blog/project-handover-checklist) is the difference between a client who owns their product and one who is dependent on you by accident.'),

    h2('What about testing?'),
    p('On the paths where failure is expensive, and not everywhere.'),
    p('Comprehensive test coverage on a small project is a cost that rarely repays itself, and no tests at all means every deployment is a gamble. The useful middle is testing the flows whose failure would actually hurt — checkout, signup, the form that generates leads — and leaving the rest to review.'),

    h3('Type checking earns its place first'),
    p('A typecheck across the whole codebase catches an entire category of error for a fraction of the cost of unit tests, and it runs in seconds. It is the highest-return check available and it belongs in [the pipeline from day one](/blog/ci-pipeline-typecheck-tests).'),

    h3('Test the thing that breaks twice'),
    p('The most reliable signal for what deserves a test is what has already broken. A regression test written after the second occurrence of a bug is worth more than ten speculative ones written in advance.'),

    h3('Manual checks are legitimate when written down'),
    p('For a small project, a checklist somebody works through before release is a reasonable substitute for automation, provided it exists as a document rather than as a habit. The failure mode is not manual testing; it is undocumented manual testing that varies by who is doing it.'),
    img('launch-checklist', 'A release verified against a written list rather than from memory on the day', 'Deploy to production days before launch day, so the launch is a promotion rather than a first attempt.'),

    h2('Where does this process fail?'),
    p('Three places, and all three are about people rather than mechanics.'),

    h3('When the client cannot make decisions'),
    p('Weekly demos only work if somebody can act on them. A client who defers every question to an absent stakeholder turns the demo into a status meeting, and the drift the process exists to prevent happens anyway. The fix is establishing who decides before starting.'),

    h3('When feedback arrives all at once at the end'),
    p('A client who says everything is fine each week and then produces forty comments at the end has not been engaged, and the cost of that lands on both sides. Asking pointed questions during reviews rather than open ones is the main defence, and where it does not work, more frequent smaller checkpoints sometimes do.'),

    h3('When the work is genuinely exploratory'),
    p('A fixed scope and a launch date do not fit research — building something nobody has built, integrating with a system nobody understands. Forcing that into a fixed-scope shape produces either a padded estimate or an overrun, and the honest answer is a different engagement model entirely.'),

    img('where-it-fails', 'A lightweight approach depending on responsiveness that is not always present', 'All three failures are about people, not mechanics. A process this light does not degrade gracefully without an engaged decision-maker.'),

    h2('Why so few ceremonies?'),
    p('Because most of them coordinate between people, and on a small engagement there is nobody to coordinate with.'),
    p('Standups exist so a team knows what everyone else is doing. Story points exist to make estimates comparable across people. Retrospectives exist to improve a team\'s working agreements. Each is genuinely valuable at scale and each is a solution to a problem that does not arise when the delivery team is one or two people talking daily.'),

    h3('Keep the ones that still apply'),
    p('Written scope, visible progress, regular review and a change process are the parts that survive at any size, because they address the client relationship rather than internal coordination. Those four are the process; everything else is optional.'),

    h3('Add ceremony when the team grows'),
    p('The moment there are three or four people building, coordination becomes a real problem and some of the machinery starts paying for itself. Adding it then, in response to an actual difficulty, works far better than adopting it in advance because it is standard.'),

    h2('What does it cost?'),
    p('Perhaps a tenth of the project, and it is not optional overhead.'),
    p('Scoping, weekly demos, writing summaries, running a change process and doing a proper handover is roughly ten percent of the time on a typical build. That is real and it is far less than the cost of one significant misunderstanding discovered late, which is what all of it exists to prevent.'),
    p('The honest counterweight: a light process depends heavily on the individuals involved being communicative and decisive, and it does not degrade gracefully when they are not. A larger agency\'s heavier machinery exists partly to produce acceptable outcomes with a rotating cast and an absent client, which is a genuine advantage in some situations. If your organisation cannot give a project a decision-maker who will look at it weekly, more structure will serve you better than less — and that is worth knowing about yourself before choosing who to work with.'),
    quote('Process exists to prevent surprise and drift. Any ritual not aimed at one of those was designed for a coordination problem you do not have.'),

    h2('Conclusion'),
    p('Six steps: a message, a call, a written scope, building with visible progress, regular review on a real deploy, and a launch with a proper handover. Each exists to prevent either surprise — the client discovering the wrong thing is being built — or drift, where the definition of done keeps moving.'),
    p('Do not ask for a brief; ask questions. Thirty minutes about the problem, the users, what exists today and where the deadline came from produces a better scope than any document a client writes unprompted. Then put deliverables, exclusions, assumptions, timeline and price on two pages before anything gets built.'),
    p('Make progress visible continuously rather than reporting it. A preview deploy on every push turns status into something the client can open, and it catches misunderstanding within a day. Keep pull requests small so the work stays legible and mistakes stay revertible, and put the eight-item baseline in at the start rather than before launch.'),
    p('Demo weekly on the real thing, show the unfinished version, ask specific questions rather than open ones, and write down what was agreed. Separate feedback from scope changes explicitly, estimate every change before agreeing to it, and offer the trade rather than only the cost.'),
    p('Then launch as a rehearsed promotion rather than a first attempt, work through a written checklist, stay available for a few days, and hand over so the client owns their product. Skip the ceremonies that coordinate between people you do not have — and add them the moment the team grows enough to need them. If that way of working suits you, [that is how I run projects](/services).'),
  ),
  faqs: faq([
    ['Why so little process for a professional engagement?',
     'Because most standard process solves coordination problems that arise at team scale. Standups, story points and retrospectives are genuinely valuable with forty people and pure overhead with two who talk daily. What survives at any size is scope, visible progress, regular review and a change process.'],
    ['What is the single highest-value process mechanism?',
     'A preview deployment on every push. It turns progress from a status update the client has to interpret into a URL they can open at any time, which surfaces misunderstandings within a day instead of at a milestone. It costs nothing once configured and changes the whole relationship.'],
    ['How should scope changes be handled?',
     'With a stated process agreed up front: every change gets a quick estimate and an explicit yes before work starts. Present the trade rather than just the cost — add it to the timeline or drop something to hold the date — so you are managing a constraint rather than being an obstacle.'],
    ['How much testing does a small project need?',
     'Type checking everywhere, because it catches a whole category of error in seconds, plus tests on the flows whose failure would actually hurt — checkout, signup, the lead form. Write regression tests for anything that has broken twice. Comprehensive coverage rarely repays itself at this size.'],
    ['When does this lightweight approach fail?',
     'When the client has no decision-maker who will look at the work weekly, when feedback is withheld until the end, or when the work is genuinely exploratory and does not fit a fixed scope. Heavier agency process exists partly to produce acceptable results despite an absent client.'],
  ]),
};
