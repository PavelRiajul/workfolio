import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/client-objections/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-client-objections',
  slug: 'client-objections',
  title: 'The Objections You Get, and What They Actually Mean',
  category: 'career',
  order: 115,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-26',
  series: 'Working together',
  excerpt:
    '"It is too expensive" is rarely about the price. The eight objections that recur, what is underneath each one, and how to answer honestly.',
  coverLabel: 'Client objections — cover',
  body: body(
    p('Objections are usually treated as obstacles to overcome, which is both unpleasant and ineffective. They are better understood as information: a client raising a concern is telling you what is unresolved for them, and the useful response is to find out what is actually being asked rather than to deploy a rehearsed answer.'),
    p('The recurring ones are remarkably consistent across projects and industries, and almost all of them are proxies. "It is too expensive" is usually about risk. "Can you start sooner" is usually about a deadline nobody has explained. Answering the surface question leaves the real one untouched, which is why an objection that seems resolved often reappears a week later.'),
    p('This post covers the eight I hear most, what is generally underneath each, and how to answer in a way that is honest rather than persuasive — including the cases where the correct answer is that the objection is right.'),

    h2('Why treat objections as information?'),
    p('Because a client who raises one is engaged, and a client who does not is often gone.'),
    p('Silence after a proposal is the outcome to worry about. An objection means somebody has read it, taken it seriously, and identified the thing preventing a yes. That is a gift, and treating it as an argument to win wastes it.'),
    p('It also changes what a good response looks like. If the goal is understanding rather than conversion, the first move is always a question, and the question is nearly always some version of what specifically is causing the concern. That single habit resolves more objections than any script.'),
    table('The surface and the substance', [
      ['They say', 'Often means'],
      ['Too expensive', 'I am not sure this will work'],
      ['Can you start sooner', 'There is a deadline I have not told you'],
      ['Can we use X instead', 'Somebody senior prefers X'],
      ['Why does it take that long', 'I do not know what is in the work'],
      ['Can you do a fixed price', 'I have been burned by an overrun'],
      ['We might do it in-house', 'I need to justify this internally'],
      ['Send more detail', 'I am not the decision-maker'],
      ['We need to think about it', 'Something specific is unresolved'],
    ]),
    p('Every row on the right is answerable and every row on the left is not, which is why answering the stated version so often fails.'),

    h3('Ask before answering, every time'),
    p('"Can I ask what you were expecting?" or "what is driving that?" costs one sentence and reframes the conversation from defence to diagnosis. It also signals that you are interested in their situation rather than in closing, which is more persuasive than anything you could argue.'),
    img('surface-substance', 'A stated concern with a different underlying question sitting beneath it', 'Almost every objection is a proxy. Answering the stated version leaves the real one untouched, so it returns a week later.'),

    h2('"It is too expensive"'),
    p('Almost always about risk rather than the number.'),
    p('Very few clients have a precise sense of what development should cost, so "expensive" usually means "this feels like a lot to commit to something I am not certain about". The concern is not the figure — it is the possibility of paying it and not getting what they need.'),

    h3('Reduce the risk before reducing the price'),
    p('A smaller first engagement that produces something real is a better answer than a discount. A one-to-two week fixed-scope piece that delivers a working component lets them evaluate you at a fraction of the exposure, and most of those become larger projects.'),

    h3('Show what is in the number'),
    p('Clients frequently imagine they are paying for code and are surprised by the rest — environment setup, testing, review cycles, deployment, documentation, handover. Making the composition visible converts an opaque figure into an itemised one, and opaque figures feel expensive by default.'),

    h3('Offer less scope, never a lower price'),
    p('Dropping the price for the same deliverable tells them the original number was arbitrary and invites further negotiation. Offering a reduced scope at a lower figure keeps the rate intact and often reveals that a third of the scope was optional anyway.'),

    h3('Sometimes it is genuinely too expensive'),
    p('If their budget is a quarter of what the work costs, that is not an objection to handle — it is a mismatch. Saying so directly, and suggesting what could be done within their budget or who might suit them better, is more useful than a negotiation neither side can win.'),

    img('risk-not-price', 'A smaller initial commitment offered in place of a reduced figure', 'Reduce the risk before reducing the price. A small first engagement lets them evaluate you at a fraction of the exposure.'),

    h2('"Why does it take that long?"'),
    p('Usually a genuine gap in understanding rather than scepticism.'),
    p('From outside, software looks like typing, and estimates that include review cycles, testing and deployment appear padded. The client is not accusing you of inefficiency — they are missing information about what the work contains, and that is straightforward to supply.'),

    h3('Break the timeline into visible pieces'),
    p('Showing the phases and roughly what happens in each turns an unexplained duration into a sequence somebody can follow. It also gives them a place to push back meaningfully, which is a better conversation than arguing about a total.'),

    h3('Name the parts that are not building'),
    p('Review cycles depend on their availability. Deployment and testing take real time. The operational baseline — staging, monitoring, backups — is a day that pays for itself the first time something breaks. Naming these makes the timeline legible.'),

    h3('Offer the fast version honestly'),
    p('There is usually a shorter path with real trade-offs — fewer tests, less polish, deferred edge cases. Presenting that as a genuine option with its costs stated respects their judgement, and clients frequently choose the longer version once they can see what the shorter one omits.'),

    h2('"Can we use a different technology?"'),
    p('Find out whether it is a constraint or a preference, because they need opposite responses.'),

    h3('A constraint deserves compliance or a referral'),
    p('An in-house team, an existing codebase, a corporate standard or a compliance requirement is real. Work within it or decline — arguing against a genuine constraint is a poor use of the relationship and it rarely works.'),

    h3('A preference deserves a question'),
    p('When it comes from an article or a colleague\'s enthusiasm, asking what problem they hope it solves is the right move. Often the underlying concern — performance, hiring, longevity — can be addressed within your stack, and the specific technology stops mattering once the worry is named.'),

    h3('Be straight about your own capability'),
    p('If you do not know their preferred stack well, saying so is better than learning at their expense. A referral costs you a project and builds more credibility than a mediocre delivery would, and referrals tend to come back.'),

    h3('Price the unfamiliarity if you take it'),
    p('Working outside your defaults is slower and riskier, and that belongs in the estimate rather than being absorbed. Stated plainly, this is an uncontroversial conversation — [and it is why having defaults matters](/blog/choosing-a-stack-once).'),
    img('constraint-or-preference', 'A technology request separated into a genuine requirement and a stated preference', 'A constraint deserves compliance or a referral. A preference deserves a question about what problem it is meant to solve.'),

    h2('"Can you do it for a fixed price?"'),
    p('Usually a request for certainty, and often reasonable.'),
    p('Behind this is nearly always a previous experience of an open-ended engagement that ran over. The client is not trying to transfer risk maliciously; they are trying to bound an outcome they have been burned by before, and that is a legitimate thing to want.'),

    h3('Fix what is understood, not what is not'),
    p('Well-defined work with a clear boundary can be fixed confidently. Work depending on an undocumented legacy system cannot, and fixing a price on it means either padding heavily or accepting an overrun you will resent.'),

    h3('Phase it instead of refusing'),
    p('A fixed-price discovery phase that produces a fixed price for the build gives them the certainty they want without asking you to guarantee something unknowable. It is a genuinely good answer and it is available more often than people use it.'),

    h3('State what changes the price'),
    p('A fixed price with written assumptions is fixed conditionally, and saying so up front is what makes it fair. The conversation to avoid is discovering in week four that an assumption was wrong and having nothing written down about it.'),

    img('fixed-price', 'A defined portion priced firmly while an undefined portion is deliberately staged', 'Fix what is understood and phase what is not. A fixed-price discovery producing a fixed-price build gives them the certainty.'),

    h2('"We might build it in-house"'),
    p('Frequently a real option and sometimes a negotiating position — and the distinction matters less than you would think.'),
    p('Either way, the useful response is the same: help them evaluate it honestly. A client who reaches the conclusion themselves is more committed than one who was argued out of it, and if in-house genuinely is better, you did not want that project anyway.'),

    h3('Name the real comparison'),
    p('The comparison is not your fee against a salary. It is your fee against hiring time, onboarding, the opportunity cost of the team\'s existing work, and the fact that a first project on an unfamiliar stack takes longer. Laying that out neutrally is more persuasive than advocacy.'),

    h3('Offer to complement rather than replace'),
    p('Building the foundation and handing it to their team, or working alongside them, is often the actual best answer and it is one they may not have considered. It also produces a relationship rather than a transaction.'),

    h3('Accept it gracefully when it is right'),
    p('Some things genuinely should be built in-house — anything core to the business that will need continuous evolution. Saying so costs a project and it is the advice that gets you recommended, which is worth more over time.'),

    h2('"Send me more detail"'),
    p('Sometimes a genuine request, often a way of not deciding.'),
    p('The tell is whether the request is specific. "Can you clarify how the migration would work" is a real question. "Send over some more information" with no specifics usually means either they are not the decision-maker or something unstated is blocking it.'),

    h3('Ask what would make the decision easy'),
    p('A direct question — "what would you need to see to move forward?" — either produces a real answer or reveals that the decision is not theirs. Both are useful, and both save you from writing a document nobody reads.'),

    h3('Do not write a proposal you were not asked for'),
    p('Responding to vagueness with volume is a common and expensive habit. A long document produced speculatively is unpaid work with a low conversion rate, and it rarely addresses whatever the actual blocker was.'),

    h3('Find the decision-maker politely'),
    p('"Is there anyone else who should be part of this conversation?" is a normal question and it saves weeks. A proposal that never reaches the person who decides cannot succeed regardless of how good it is.'),
    img('stalling', 'A request for more information distinguished from a genuine question by its specificity', 'A specific question is real. An unspecific request for more information usually means the decision sits with somebody else.'),

    h2('"Can you start sooner?"'),
    p('There is a deadline, and it is worth understanding before agreeing to anything.'),
    p('Urgency always has a source. A contract, a funding milestone, an event, a competitor — or sometimes nothing beyond impatience. The source determines whether the timeline is a genuine constraint worth reorganising around, and it is a single question away.'),

    h3('Ask what happens on that date'),
    p('The answer tells you how real it is and often reveals that a partial delivery would satisfy it. A launch that needs one flow working by a date is a very different project from one needing everything, and clients frequently have not made that distinction themselves.'),

    h3('Do not agree to a timeline you do not believe'),
    p('Accepting an unrealistic date to win the work guarantees a difficult project and a bad outcome for both parties. Saying what is achievable, and what would need to be cut to hit their date, is the honest version of the same conversation.'),

    h3('Offer a phased delivery'),
    p('Something working by their date and the rest afterwards is often exactly what they need and rarely what they asked for. Proposing it demonstrates that you engaged with the constraint rather than the request.'),

    h2('"We need to think about it"'),
    p('Something specific is unresolved, and it is worth finding out what before the conversation ends.'),
    p('This is rarely a considered pause — usually there is a particular concern that has not been said aloud, and once the meeting ends the chance to address it goes with it. A single direct question at that moment is worth more than any follow-up email.'),

    h3('Ask what the hesitation is'),
    p('"Is there anything in particular giving you pause?" is unpushy and frequently produces the real objection, which is often something small you can resolve in a sentence. People will usually tell you if asked directly and gently.'),

    h3('Agree a next step, not a follow-up'),
    p('"I will check in next week" puts the burden on you and invites a slow fade. "Shall we speak on Thursday once you have discussed it internally?" produces a decision point, and their willingness to agree one is itself informative.'),

    h3('Let some go'),
    p('Not every conversation should convert, and chasing one that has gone quiet costs time and standing. A polite close that leaves the door open is better than three follow-ups, and clients do come back — [and some projects should be declined anyway](/blog/declining-projects).'),

    h2('What about objections during the project?'),
    p('Different in character — these are about expectations rather than about buying.'),

    h3('"This is not what I expected"'),
    p('Usually a scoping failure surfacing late, and the response is to establish exactly where the divergence is rather than to defend the work. Sometimes it is a genuine miss on your part, and saying so quickly costs far less than defending it.'),

    h3('"Can we just add..."'),
    p('Normal, healthy, and requiring a process rather than a judgement. Every addition gets a quick estimate and an explicit decision, presented as a trade — added to the timeline or swapped for something else — so it is a choice rather than an argument.'),

    h3('"Why is this taking longer?"'),
    p('Usually because something was harder than estimated, and the honest answer is that. Explaining the specific reason, what it means for the date, and what the options are is more reassuring than reassurance, and it protects the relationship for the next estimate.'),
    img('mid-project', 'Concerns arising during delivery treated as expectation gaps rather than as disputes', 'Mid-project objections are about expectations. "Not what I expected" is usually a scoping gap surfacing late.'),

    img('willing-to-lose', 'A position held credibly because the outcome of the conversation is not decisive', 'Every technique here depends on it. If you need this project, the pressure is visible and nothing you say lands.'),

    h2('What is the underlying skill?'),
    p('Being willing to lose the project, which is what makes honesty possible.'),
    p('Every technique here depends on it. If you need this particular project, you will agree to the timeline you do not believe, accept the fixed price on unknowable work, and answer the stated objection rather than the real one. The pressure is visible to the client and it makes everything less convincing.'),

    h3('A pipeline is what buys the freedom'),
    p('The practical foundation for saying no is having enough other conversations that any single one is not decisive. That is a business development problem rather than a communication one, and it is the actual root of most difficulty in this area.'),

    h3('Honesty converts better anyway'),
    p('Telling somebody their deadline is unrealistic, or that their budget does not match the scope, or that they should build it in-house, is more persuasive than the alternative — because almost nobody does it and it signals that your other statements are reliable too.'),

    h2('What does it cost?'),
    p('Some projects, and the discomfort of asking direct questions.'),
    p('Handling objections honestly means losing work you could have won by being agreeable — the unrealistic deadline you declined, the fixed price you would not quote, the in-house option you validated. Those are real losses and they are mostly projects that would have gone badly.'),
    p('The honest counterweight: this approach assumes a market where you can afford to be selective, and that is not everybody\'s situation. Somebody starting out, or in a thin period, has to take work that a more established practice would decline, and there is nothing shameful in that — the advice to walk away from a bad-fit project is much easier to give than to follow when the pipeline is empty. The realistic version is to be as honest as you can afford to be, and to treat building the pipeline as the thing that makes the rest of it possible.'),
    quote('An objection is a client telling you what is unresolved. Treating it as an argument to win wastes the most useful thing they have said.'),

    h2('Conclusion'),
    p('Objections are information rather than obstacles, and a client who raises one is engaged — silence after a proposal is the outcome to worry about. Almost all of them are proxies, so the first move is always a question about what specifically is causing the concern.'),
    p('"Too expensive" is usually about risk, answered with a smaller first engagement rather than a discount. "Why so long" is usually a genuine gap in understanding, answered by making the phases and the non-building work visible. "Can we use X" needs separating into a constraint, which deserves compliance or a referral, and a preference, which deserves a question.'),
    p('A fixed-price request is a request for certainty from somebody previously burned — fix what is understood, phase what is not, and state in writing what changes the number. An in-house option deserves an honest comparison rather than advocacy, because a client who reaches the conclusion themselves is more committed either way.'),
    p('Treat an unspecific request for more detail as a signal that the decision sits elsewhere, ask what happens on the date behind any urgency, and when somebody needs to think about it, ask directly what is giving them pause before the conversation ends.'),
    p('Mid-project, the same principle applies to different content: expectation gaps rather than buying concerns, handled with a change process rather than a debate. All of it rests on being willing to lose the project, which is a pipeline problem before it is a communication one — and honesty converts better anyway, because almost nobody offers it. If that is the sort of conversation you want to have, [start here](/start).'),
  ),
  faqs: faq([
    ['What does "it is too expensive" usually mean?',
     'Usually risk rather than the number. Most clients have no precise sense of what development costs, so it means committing this much to something uncertain feels dangerous. Reduce the risk with a smaller first engagement that delivers something real, rather than reducing the price.'],
    ['Should I lower my price when a client pushes back?',
     'Offer less scope instead. Dropping the price for the same deliverable tells them the original figure was arbitrary and invites further negotiation. A reduced scope at a lower number keeps the rate intact, and it frequently reveals that part of the scope was never needed.'],
    ['How do I respond to "we might build it in-house"?',
     'Help them evaluate it honestly. Name the real comparison — your fee against hiring time, onboarding, opportunity cost and a first project on an unfamiliar stack — rather than advocating. If in-house genuinely is right, saying so costs a project and earns the recommendation.'],
    ['What if a client asks for a fixed price on unclear work?',
     'Fix what is understood and phase what is not. A fixed-price discovery that produces a fixed price for the build gives them the certainty they want without asking you to guarantee something unknowable. Write down the assumptions the number depends on.'],
    ['What makes handling objections honestly possible?',
     'Being able to lose the project. If you need this particular one, you will accept the timeline you do not believe and answer the stated objection rather than the real one — and the pressure is visible. That is a pipeline problem before it is a communication problem.'],
  ]),
};
