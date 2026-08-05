import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/estimation-lessons/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-estimation-lessons',
  slug: 'estimation-lessons',
  title: 'Everything I Have Learned About Estimating',
  category: 'career',
  order: 118,
  readTime: '13 min read',
  date: 'August 2026',
  publishedAt: '2026-08-02',
  series: 'Freelance practice',
  excerpt:
    'You are not bad at estimating the work. You are bad at remembering everything that is not the work — and that is the recoverable part.',
  coverLabel: 'Estimation — cover',
  body: body(
    p('Most developers estimate the coding accurately and the project badly, and the gap between those two is remarkably consistent. Asked how long a feature takes, the answer is usually close. Asked how long a project takes, the answer is routinely half of what happens, and the missing half is almost never code.'),
    p('It is review cycles waiting on somebody, environment setup, the integration whose documentation was wrong, deployment, revisions after a demo, the bug found in the last week, and the fortnight of unavailability nobody mentioned. Every one of those is predictable in aggregate and invisible when estimating a feature list.'),
    p('This post is what I have learned about closing that gap: where the time actually goes, which techniques help, and the honest limits of estimation as a practice.'),

    h2('Why are estimates consistently short?'),
    p('Because you estimate the thing you can picture, and you can only picture the code.'),
    p('When somebody describes a feature, you construct a mental model of building it — the schema, the endpoint, the interface — and time that. The model is usually accurate for what it contains, and what it contains is a version of the work where nothing is ambiguous, nobody is unavailable and the third-party API behaves as documented.'),
    p('This is why experienced developers still underestimate. Experience improves the accuracy of the coding estimate, which was never the problem, and it improves the surrounding estimate only if somebody has deliberately started tracking where the rest of the time went.'),
    table('Where a project actually goes', [
      ['Category', 'Rough share'],
      ['Writing the code you pictured', '30–40%'],
      ['Setup, environments, deployment', '10–15%'],
      ['Integration reality — wrong docs, edge cases', '10–20%'],
      ['Review cycles and revisions', '15–25%'],
      ['Testing, fixing, launch', '10–15%'],
      ['Communication and coordination', '5–10%'],
    ]),
    p('The top row is the only one most people estimate, which explains the factor of roughly two-and-a-half that so many projects land on. That number is stable enough across projects to be useful on its own.'),

    h3('Optimism is structural, not personal'),
    p('The tendency to imagine the version where everything goes well is a well-documented cognitive pattern rather than a character flaw, and it does not respond to trying harder. It responds to method — decomposition, historical data and explicit accounting for the invisible categories.'),
    img('what-you-picture', 'A mental model of building something containing only the parts that are easy to visualise', 'You estimate what you can picture, and you can only picture the code. The missing half is everything around it.'),

    h2('What actually improves an estimate?'),
    p('Breaking it down until each piece is something you have built before.'),
    p('An estimate for "a customer portal" is a guess dressed as a number. An estimate for a schema, an auth flow, four screens, a file upload, an admin view and a deploy is a sum of things with precedent. The decomposition is what converts intuition into arithmetic, and it is most of the available improvement.'),

    h3('Anything you cannot decompose, you cannot estimate'),
    p('If a component resists being broken into pieces you recognise, that is the signal — it is not understood well enough yet. The honest response is a timeboxed investigation rather than a number, and saying so is more professional than producing a figure you do not believe.'),

    h3('Estimate a range, not a point'),
    p('A single number implies precision that does not exist. A range communicates the uncertainty honestly, and the width of the range is itself information — a piece estimated at two to ten days is flagging something that needs resolving before anybody commits.'),

    h3('Estimate the non-code categories explicitly'),
    p('Add lines for setup, review cycles, testing and deployment rather than hoping they are absorbed. Written down separately, they are visible in the total and defensible in a conversation, instead of being an unexplained gap between the feature list and the price.'),

    h3('Use your own history, not a rule of thumb'),
    p('Multiplying by two is folklore. Multiplying by your own measured ratio between estimates and actuals is calibration, and it takes a few projects of recorded data to obtain. That data is the single most valuable estimating asset available and almost nobody keeps it.'),

    h2('How do you actually calibrate?'),
    p('By recording the estimate and the actual, every time, and looking at the pattern.'),
    p('This is unglamorous and it is the whole thing. A simple record of what you estimated, what it took and what caused the difference turns years of experience into something usable, where without it you can accumulate a decade of projects and estimate no better than at the start.'),

    code('md', `
| Project      | Estimated | Actual | Ratio | Main cause of overrun          |
|--------------|-----------|--------|-------|--------------------------------|
| Portal       | 20d       | 31d    | 1.55  | Legacy data migration          |
| Marketing    | 8d        | 9d     | 1.13  | —                              |
| Integration  | 12d       | 26d    | 2.17  | Undocumented third-party API   |
| Mobile MVP   | 25d       | 27d    | 1.08  | —                              |
`),

    h3('The causes column is the valuable one'),
    p('Ratios alone tell you to add a buffer. Causes tell you which kinds of work to buffer, and the pattern usually emerges within a handful of projects — for most people it is integrations and anything touching data somebody else created.'),

    h3('Track by category, not just overall'),
    p('You are probably accurate on familiar work and badly wrong on unfamiliar work, and an overall multiplier applies the same correction to both. Separate ratios for known and unknown categories are considerably more useful.'),

    h3('Record it when the project ends, not later'),
    p('A note written the week a project finishes is accurate. One reconstructed six months later is a story, and it will systematically favour the interpretation that makes the estimate look reasonable.'),
    img('calibration', 'Past estimates compared against outcomes to reveal a personal correction factor', 'Multiplying by two is folklore. Multiplying by your own measured ratio is calibration, and it takes a handful of recorded projects.'),

    h2('Which things are always underestimated?'),
    p('Six categories, and they account for most overruns.'),
    ol([
      '**Data migration** — the existing data is always messier than described.',
      '**Third-party integrations** — documentation is wrong, sandboxes differ from production.',
      '**Anything requiring somebody else** — content, approvals, credentials, access.',
      '**The last ten percent** — polish, edge cases, the bug found during testing.',
      '**Review and revision cycles** — feedback arrives late and changes things.',
      '**Environments and deployment** — never as smooth as expected on the first attempt.'],
    ),
    p('Every one of these is predictable. Naming them explicitly in an estimate rather than absorbing them is both more accurate and easier to defend, because the client can see what they are paying for.'),

    h3('Integrations deserve their own multiplier'),
    p('The gap between an API\'s documentation and its behaviour is the single most reliable source of overrun I have measured. Estimating integration work at two to three times the naive figure is not pessimism, it is the observed rate.'),

    h3('Dependencies on other people are not your estimate'),
    p('Waiting for content, approval or access is elapsed time you cannot compress, and it belongs in the timeline as a stated dependency rather than inside your effort estimate. Making it visible also creates the right pressure, since a client can see their own item on the critical path.'),

    img('always-under', 'Recurring categories of work that fall outside a feature list but inside every project', 'All six are predictable. Naming them explicitly is more accurate than absorbing them, and easier to defend.'),

    h2('What about the last ten percent?'),
    p('It is routinely a third of the project, and it is where most overruns become visible.'),
    p('The point at which the feature works is not the point at which it is finished. Between them sit error states, empty states, loading behaviour, edge cases, mobile layout, accessibility, the bug found while testing and the polish that separates a demo from a product — and none of it appears in a feature list.'),

    h3('It is not optional work'),
    p('Everything in that gap is what makes the difference between something that demonstrates and something that ships. Treating it as a buffer to be cut under pressure is how a project delivers on time and badly.'),

    h3('Budget it as a named line'),
    p('Adding an explicit allowance for completion — perhaps a quarter of the build estimate — makes it visible and defensible rather than an unexplained overrun in the final week. Clients accept it readily when it is described concretely.'),

    h3('Demo early to move the discovery forward'),
    p('Much of the late work comes from feedback arriving late. Weekly demos on a real deploy pull that discovery earlier, where it is cheaper — [which is what the review cadence is for](/blog/development-process).'),
    img('last-ten', 'The gap between a feature working and a feature being finished occupying a large share of the timeline', 'The point where it works is not the point where it ships. Error states, edge cases and polish are routinely a third of the project.'),

    h2('How do you present an estimate?'),
    p('With the composition visible and the assumptions attached.'),
    p('A single figure invites negotiation about the figure. An estimate broken into components, with the non-code categories named and the assumptions listed, invites a conversation about scope — which is the conversation worth having and the one that produces better outcomes for both sides.'),

    h3('Show the parts'),
    p('Even roughly. A client seeing that the integration is a third of the estimate can ask whether it is necessary, which is a productive question. Seeing only a total, they can only ask whether the total could be lower.'),

    h3('State assumptions next to the number'),
    p('Everything the estimate depends on — that the API works as documented, that content will be supplied by a date, that there is one decision-maker. When one turns out to be false, the conversation refers to a document rather than to competing recollections.'),

    h3('Say what would make it faster'),
    p('Offering the levers — fewer edge cases, deferring a feature, using a template rather than a custom design — gives the client agency and demonstrates that the number reflects specific choices rather than a mood.'),

    h3('Never let a rough figure become the budget'),
    p('A number mentioned casually in a first conversation has a strong tendency to become the expectation. If you give one, frame it as pre-scope and repeat that framing when the real estimate arrives — [and scoping properly is what produces it](/blog/project-scoping).'),

    h2('What do you do when it is going over?'),
    p('Say so immediately, with the reason and the options.'),
    p('The instinct is to work harder and hope to recover, and that reliably makes it worse — the overrun continues, the disclosure arrives later, and the client has lost the chance to make a decision about it. Raising it as soon as it is visible is both the honest and the tactically better move.'),

    h3('Bring options, not just news'),
    p('Extend the timeline, cut scope, or accept a reduced version of the remaining work. Presenting the choice makes it their decision rather than your failure, which is both accurate and easier for everyone.'),

    h3('Explain the specific cause'),
    p('"The migration is taking longer because the source data has duplicate records that need resolving" is a reason somebody can evaluate. "It is taking longer than expected" is not, and the difference determines whether trust survives.'),

    h3('Absorb the ones that are yours'),
    p('An overrun caused by your own misjudgement on a fixed-price project is yours to absorb. Attempting to recharge it damages the relationship far more than the money is worth, and it is the cost of the pricing model you chose.'),

    h3('Update the estimate rather than defending it'),
    p('Once something is known to be wrong, the useful action is a revised number for the remaining work. Continuing to reference the original figure serves nobody and delays every decision that depends on knowing where things stand.'),
    img('going-over', 'An overrun disclosed early alongside choices rather than absorbed silently', 'Working harder and hoping to recover reliably makes it worse. Early disclosure with options is both honest and tactically better.'),

    img('composition', 'A figure presented as its constituent parts rather than as a single total', 'A total invites negotiation about the total. A broken-down estimate invites a conversation about scope, which is the useful one.'),

    h2('Does experience actually help?'),
    p('Yes, on the parts you have done before — and it creates a specific new failure mode.'),
    p('Familiar work gets estimated well after enough repetitions, which is a genuine and substantial improvement. What experience does not confer is accuracy on unfamiliar work, and confidence generalises more readily than skill does.'),

    h3('The confident wrong estimate'),
    p('The worst estimates I have produced were on work that resembled something familiar and differed in a way that mattered. Recognising surface similarity as a warning rather than a reassurance is a discipline that comes later than it should.'),

    h3('Standardising improves calibration directly'),
    p('Repeating the same stack and the same project shapes is what makes historical data comparable, and comparable data is what makes estimates reliable. Novelty resets the calibration each time — [which is one of the strongest arguments for defaults](/blog/choosing-a-stack-once).'),

    h3('Estimate with somebody else when you can'),
    p('Two people estimating independently and comparing surfaces assumptions immediately, because the divergences are always about something one person accounted for and the other did not. Even a short conversation catches things.'),

    h2('When should you refuse to estimate?'),
    p('When you would be guessing, and a guess would be treated as a commitment.'),

    h3('Genuinely novel work'),
    p('Something nobody has built, an integration with an undocumented system, a performance target with no known solution. The honest answer is a timeboxed investigation that produces an estimate, not a number produced in advance of understanding.'),

    h3('When the scope is still moving'),
    p('Estimating against a requirement that changes weekly produces a number that is wrong before it is delivered. Stabilising the scope first is a prerequisite rather than a preference.'),

    h3('When somebody wants a number in the meeting'),
    p('The pressure to produce a figure on the spot is strong and it is where the worst estimates come from. A range with explicit conditions, or an offer to send something considered within a day, serves the real need without the damage.'),

    h3('Say what you can commit to instead'),
    p('Refusing to estimate is unhelpful on its own. Offering what you can commit to — a discovery phase, a first milestone, a range for the parts that are understood — keeps things moving without inventing certainty.'),

    h2('What does it cost?'),
    p('An hour per project to estimate properly, and ten minutes at the end to record the outcome.'),
    p('The decomposition, the non-code lines, the assumptions and the range take about an hour for a typical project. The record afterwards takes ten minutes and is the part that compounds — it is the only mechanism by which estimating actually improves rather than merely feeling more familiar.'),
    p('The honest counterweight: estimation has a ceiling, and beyond a certain point the effort produces false precision rather than accuracy. Software work contains genuine unknowns that no method resolves in advance, and a detailed estimate can be more dangerous than a rough one because it invites more confidence than it deserves. For genuinely uncertain work the better answer is usually not a better estimate but a different arrangement — staged delivery, a discovery phase, or an engagement that does not require the number to be right. Knowing which situation you are in matters more than the technique.'),
    quote('You estimate the code accurately and the project badly, because the code is the only part you can picture. The rest is predictable in aggregate and invisible in the moment.'),

    h2('Conclusion'),
    p('Estimates are short because you estimate what you can picture, and what you can picture is the code — roughly a third of a project. The rest is setup, integration reality, review cycles, testing, launch and coordination, all predictable in aggregate and all invisible when looking at a feature list.'),
    p('Decompose until every piece is something you have built before, and treat anything that resists decomposition as a signal it is not understood rather than as something to estimate anyway. Give ranges rather than points, and add explicit lines for the non-code categories so they are visible and defensible.'),
    p('Then calibrate against your own history rather than folklore. Record the estimate, the actual and the cause every time a project ends — the causes column is where the value is, and the pattern usually emerges within a handful of projects. Track familiar and unfamiliar work separately, because one multiplier applied to both corrects neither.'),
    p('Watch the six categories that are always underestimated, particularly integrations, which deserve their own multiplier, and dependencies on other people, which belong in the timeline as stated items rather than inside your effort. Budget the last ten percent as a named line, because it is routinely a third of the work and it is not optional.'),
    p('Present estimates with the composition visible and assumptions attached, raise overruns immediately with the cause and the options, and absorb the ones that are your own misjudgement. And refuse to estimate genuinely novel work — offer a timeboxed investigation instead, because for truly uncertain work the answer is a different arrangement rather than a better number. If you want work estimated on that basis, [start here](/start).'),
  ),
  faqs: faq([
    ['Why are my estimates always short?',
     'Because you estimate the code, which is roughly a third of a project. The rest — environment setup, integration reality, review cycles, testing, launch and coordination — is invisible when looking at a feature list but entirely predictable in aggregate, which is why the factor is so consistent.'],
    ['Should I just multiply my estimates by two?',
     'That is folklore, and it applies the same correction to familiar and unfamiliar work. Record estimates against actuals for a handful of projects and you will have your own ratio, plus a causes column showing which categories to buffer — usually integrations and anything touching existing data.'],
    ['What is always underestimated?',
     'Data migration, third-party integrations, anything requiring another person to act, the last ten percent of polish and edge cases, review and revision cycles, and deployment. Integrations deserve their own multiplier — the gap between documentation and actual behaviour is the most reliable overrun.'],
    ['How should I present an estimate to a client?',
     'With the composition visible and the assumptions written next to the number. A single total invites negotiation about the total; a broken-down estimate invites a conversation about scope, which is the useful conversation. Say what would make it faster so they have real levers.'],
    ['What do I do when a project is running over?',
     'Say so as soon as it is visible, with the specific cause and a set of options — extend, cut scope, or reduce the remaining work. Working harder and hoping to recover reliably makes it worse and removes the client’s chance to decide. Absorb overruns caused by your own misjudgement.'],
  ]),
};
