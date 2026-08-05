import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/declining-projects/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-declining-projects',
  slug: 'declining-projects',
  title: 'The Projects Worth Turning Down',
  category: 'career',
  order: 119,
  readTime: '13 min read',
  date: 'August 2026',
  publishedAt: '2026-08-05',
  series: 'Freelance practice',
  excerpt:
    'Every bad project was visible in the first conversation. The signals, what they cost when ignored, and how to say no without burning anything.',
  coverLabel: 'Declining projects — cover',
  body: body(
    p('Every difficult project I have taken was recognisable before it started. Not with hindsight — at the time, in the first conversation, in a moment where something did not quite fit and I decided it was probably fine. It usually was not, and the pattern is consistent enough to be worth writing down.'),
    p('The difficulty is that turning down work feels like failure, particularly early on. A project declined is revenue not earned, and the cost of taking a bad one is deferred and invisible at the moment of the decision. That asymmetry is what makes people say yes to things they already know about.'),
    p('This post is the accounting: what a bad project actually costs, the signals that predict one, how to decline without damaging anything, and — importantly — when the advice to be selective does not apply.'),

    h2('What does a bad project actually cost?'),
    p('Far more than the revenue, because it takes the capacity you would have used on a good one.'),
    p('The direct costs are visible enough: the overrun you absorb, the scope that grew, the payment that arrives late. What is larger and less visible is everything the project displaced — the enquiry you could not take because you were busy, the work that would have produced a case study and a referral, the weeks of attention spent on something that generated neither.'),
    table('The real cost of a bad fit', [
      ['Cost', 'Visible?'],
      ['Overrun absorbed', 'Yes, immediately'],
      ['Scope creep unbilled', 'Partly'],
      ['Capacity displaced', 'No — you never see the alternative'],
      ['No case study or referral', 'No — it simply does not happen'],
      ['Reputational risk from a poor outcome', 'Later, if at all'],
      ['Attention and morale', 'Felt but rarely counted'],
    ]),
    p('The third row is the one that changes the arithmetic. A difficult project does not merely earn less — it occupies the slot a better one would have filled, and that opportunity cost is invisible precisely because the alternative never happened.'),

    h3('Bad projects also produce bad work'),
    p('An engagement that is fighting you produces something you would not show anybody, which means it generates no case study, no referral and no compounding value. Your portfolio is built from projects that went well, and a run of difficult ones leaves you no better positioned than before them.'),
    img('displacement', 'Capacity consumed by one engagement that was unavailable for another', 'The invisible cost is displacement. A difficult project occupies the slot a better one would have filled, and you never see the alternative.'),

    h2('What are the signals?'),
    p('Eight, and most appear in the first conversation if you are listening for them.'),
    ol([
      '**Nobody can describe the user** — requirements will never stabilise.',
      '**The deadline predates the scope** — the date was set before anyone knew the work.',
      '**No named decision-maker** — every review reopens settled questions.',
      '**The previous developer is unmentionable** — there is a story you are not hearing.',
      '**Price is the only question** — cost will drive every decision that follows.',
      '**"It should be simple"** — usually said about the part that is not.',
      '**Urgency with no explanation** — a manufactured deadline is a pressure tactic.',
      '**Reluctance to put anything in writing** — the most reliable single signal.'],
    ),
    p('One of these is a question to ask. Two together is a pattern. Three is a decision, and the projects I regret taking all had at least three visible before I started.'),

    h3('The unmentionable predecessor deserves a direct question'),
    p('There is always a reason the last developer left, and it is sometimes the client. Asking plainly and listening to how it is characterised is enormously informative — a fair account of a mismatch reads very differently from a story where everyone else was incompetent.'),

    h3('Reluctance about writing is the strongest single indicator'),
    p('A client who resists a written scope, a contract or a change process is telling you they want flexibility that operates in one direction. Nothing else on the list predicts difficulty as reliably, and it is the one I now treat as close to disqualifying on its own.'),

    h2('What about the client relationship itself?'),
    p('The way somebody behaves before money changes hands is the best available prediction of afterwards.'),

    h3('Responsiveness during the sale is the ceiling'),
    p('If replies take a week while they are trying to hire you, they will take two once you are engaged. Review cycles will stall, decisions will wait, and a fixed timeline built on their input will not survive.'),

    h3('How they discuss previous suppliers'),
    p('Someone who describes every past developer as having failed them is giving you the outline of how you will be described. It is not conclusive — sometimes people genuinely have bad luck — and it is worth noticing.'),

    h3('Whether they respect your expertise'),
    p('A client who overrides technical decisions without discussion during the sale will do it throughout, and you will be accountable for outcomes you did not choose. That is a specific and unpleasant arrangement, and it is visible early.'),

    h3('Small disrespect scales'),
    p('Missed calls without notice, negotiation on already-agreed terms, an offhand remark about how quick this should be. None is significant alone; each indicates how the working relationship will feel, and they rarely improve after a contract is signed.'),
    img('behaviour-preview', 'Conduct during the sales conversation treated as a preview of the engagement', 'How somebody behaves before money changes hands is the best available prediction of how they will behave after.'),

    h2('When is the work itself wrong?'),
    p('When you cannot do it well, or doing it well would make you worse at what you are for.'),

    h3('Outside your capability'),
    p('Taking work you do not know how to do, and learning on the client\'s budget, produces a mediocre result and a stressful project. Saying so and referring elsewhere costs one project and builds more credibility than a poor delivery would.'),

    h3('Technically possible but strategically wrong'),
    p('Sometimes the client is asking for the wrong thing — an app when they need a website, a rebuild when a cleanup would serve them. If they will not hear the alternative, building the wrong thing competently is still building the wrong thing, and the outcome will be judged as your work.'),

    h3('Work you do not want more of'),
    p('Every project you take makes you more likely to be offered similar ones, because that is how referrals and portfolios function. A well-paid project in a direction you do not want to go has a cost that arrives eighteen months later as a pipeline full of the same thing.'),

    h3('Anything requiring you to misrepresent something'),
    p('A client wanting a claim on their site that is not true, an accessibility requirement they want signed off without meeting, a security practice they want to skip quietly. These are not negotiations — they are the point at which the answer is no regardless of the fee.'),

    img('wrong-work', 'Work declined for reasons of fit rather than capability or availability', 'Some projects are wrong even when you could do them — the wrong thing built well is still the wrong thing, and it is judged as yours.'),

    h2('How do you actually say no?'),
    p('Quickly, plainly, with a reason and ideally an alternative.'),
    p('Most people handle this badly by delaying — the enquiry sits unanswered, the reply becomes harder to write, and eventually it is either sent apologetically or not at all. A prompt, straightforward no is a service to somebody who needs to find another option.'),

    code('md', `
Thanks for sending this over — I have had a proper look.

I am going to pass on this one. The timeline needs a team rather than
one person, and I would rather say so now than commit to a date I do
not believe.

Two people who would suit it well: [names]. Happy to make an
introduction if it helps.

If the timeline changes later, do come back to me.
`),

    h3('Give a real reason, not a vague one'),
    p('"I am not available" is easy and it tells them nothing. A specific reason — the timeline, the fit, the technology — is more useful, and it frequently produces a better conversation because the constraint turns out to be negotiable.'),

    h3('Refer somebody, when you can'),
    p('A good referral converts a rejection into a favour. It also builds the reciprocal relationships that produce your own referrals later, which is most of how work arrives in a small practice.'),

    h3('Do not explain at length'),
    p('An over-justified decline invites negotiation about each reason and reads as uncertainty. Two or three sentences is respectful and final, and it leaves the relationship intact.'),

    h3('Leave the door open where you mean it'),
    p('Circumstances change, and a client who was a poor fit this quarter may be a good one next year. Saying so genuinely — and not saying it when you do not mean it — keeps the ending clean.'),
    img('saying-no', 'A prompt clear decline paired with an onward suggestion rather than a delayed apology', 'A prompt no is a service. Delay makes it harder to write, and eventually it is sent apologetically or not at all.'),

    h2('What about declining mid-project?'),
    p('Rarer, harder, and occasionally necessary.'),
    p('Sometimes a project turns out to be something other than what was agreed — the scope has tripled, the relationship has become untenable, or the client is asking for something you will not do. Leaving is a serious step with real consequences and it is preferable to a slow failure that harms both parties.'),

    h3('Raise it before deciding it'),
    p('Almost every mid-project problem has a version that can be resolved by a direct conversation about what has changed. Attempting that first is both fair and often successful, and it means an exit is a last resort rather than a surprise.'),

    h3('Exit responsibly'),
    p('Complete a defined piece, document what exists, hand over access, and be honest about the state of things. Walking away from a half-finished system with no documentation is the version that genuinely damages a reputation — [handover is what makes an exit professional](/blog/handover-documentation).'),

    h3('Have a termination clause before you need one'),
    p('An agreement specifying notice, what is paid for, and what is delivered on exit turns a difficult situation into a procedure. Negotiating it during a dispute is considerably worse than agreeing it while everybody is happy.'),

    h3('Expect it to cost something'),
    p('Leaving mid-project may mean unpaid work, an unhappy former client and a story you do not control. It is still frequently better than continuing, and knowing that in advance makes the decision cleaner when it arrives.'),

    h2('When does this advice not apply?'),
    p('When the pipeline is empty, which is a genuinely different situation.'),
    p('The whole framework assumes you can afford to be selective, and that assumption is not universal. Somebody starting out, or in a thin quarter, or with obligations that do not pause, has to take work that a more established practice would decline — and there is nothing wrong with that.'),

    h3('Early on, take more and learn faster'),
    p('The first projects teach you what a bad fit actually feels like, and that knowledge is not available theoretically. Some of the most useful things I know came from projects I would now decline, and I would not know them otherwise.'),

    h3('A bad project is better than no project, sometimes'),
    p('Rent is real. The honest position is that declining is a privilege that grows with your pipeline, and the advice to be selective is much easier to give than to follow when there is nothing else in view.'),

    h3('Take it with your eyes open'),
    p('If you take work despite the signals, do it deliberately: tighter scope, shorter engagement, more of the payment up front, everything in writing. Recognising the risk changes how you structure the arrangement even when it does not change the decision.'),

    h3('Build the pipeline as the actual fix'),
    p('The reason to be able to say no is that there is something else to say yes to. Business development is what buys that freedom, and it is the underlying answer to almost every difficult situation described here.'),
    img('privilege', 'Selectivity increasing as available alternatives increase rather than being universally available', 'Declining is a privilege that grows with the pipeline. The advice is far easier to give than to follow with nothing else in view.'),

    h2('How do you decide faster?'),
    p('Write down your criteria in advance, before a specific opportunity is applying pressure.'),
    p('The decision is much harder in the moment, with a real number attached and a real person waiting. Having decided beforehand what you take and what you do not converts an emotional judgement into a check against a list, and the list was written by a version of you who was not being tempted.'),

    h3('Name the categories you do not take'),
    p('Specific technologies, project shapes, engagement models, industries. Written down, they are a policy rather than a per-case negotiation with yourself, and they are much easier to state to somebody else.'),

    h3('Set a floor and hold it'),
    p('A minimum engagement size or rate, decided in advance, removes a whole class of deliberation. Exceptions should be rare and deliberate rather than a pattern that quietly redefines the floor downward.'),

    h3('Ask whether you would be pleased'),
    p('A useful instinct check: imagine the project has just been confirmed. Relief and interest is a good sign. A slight sinking feeling is information, and it is almost always right — every project I regretted produced exactly that feeling and I overrode it.'),

    h3('Sleep on the ambiguous ones'),
    p('A day of distance resolves most borderline decisions, and almost nothing genuinely requires an answer within the hour. A client insisting otherwise is demonstrating one of the signals.'),

    img('criteria-first', 'Standards written before a specific opportunity applies pressure to them', 'The list was written by a version of you who was not being tempted. That is what makes it useful in the moment.'),

    h2('What does saying no actually get you?'),
    p('Capacity for the work you want, and a practice that compounds rather than churns.'),
    p('The projects that produce referrals, case studies and repeat work are the ones that went well, and those are disproportionately the ones that were a good fit at the start. Selecting for fit is therefore not merely defensive — it is how the good work accumulates into something.'),

    h3('Clarity attracts the right enquiries'),
    p('Being specific publicly about what you do, and being willing to decline what falls outside it, changes the shape of what arrives. A narrower position produces fewer enquiries with a higher conversion rate, which is a better business than the reverse — [and that is what positioning is for](/blog/ai-accelerated-positioning).'),

    h3('It makes the yes mean something'),
    p('A person who takes everything gives you no information by agreeing. Somebody who declines work is making a statement when they accept, and clients notice that — being told the project is a good fit by somebody who says otherwise sometimes carries actual weight.'),

    h2('What does it cost?'),
    p('Revenue you can point at, against costs you cannot.'),
    p('That asymmetry is the entire difficulty. The declined project has a number attached and the avoided overrun does not, so the decision always feels expensive at the moment it is made and rarely feels wrong a year later.'),
    p('The honest counterweight: selectivity can become an excuse, and it is possible to talk yourself out of perfectly good work by reading ordinary friction as a warning sign. Most projects have something slightly awkward about them — a tight budget, an unclear requirement, a client who is a bit disorganised — and that is normal rather than disqualifying. The signals worth acting on are the ones that predict a broken working relationship, not the ones that predict a project requiring effort. If you are declining more than you take, the problem is probably not the enquiries.'),
    quote('Every difficult project I took was visible in the first conversation. I noticed, and decided it was probably fine.'),

    h2('Conclusion'),
    p('A bad project costs far more than the revenue it earns, because it occupies the capacity a better one would have filled — and that displacement is invisible, since the alternative never happened. It also produces work you cannot show, which means no case study and no referral, so a run of them leaves you no better positioned than before.'),
    p('The signals are consistent and mostly visible in the first conversation: nobody can describe the user, the deadline predates the scope, there is no named decision-maker, the previous developer is unmentionable, price is the only question, urgency has no explanation, and — most reliably — a reluctance to put anything in writing. One is a question, two is a pattern, three is a decision.'),
    p('Watch the behaviour as much as the brief. Responsiveness during the sale is the ceiling, how somebody describes past suppliers is how you will be described, and small disrespect scales. And decline work that is outside your capability, strategically wrong for the client, in a direction you do not want more of, or that requires misrepresenting something.'),
    p('Say no quickly and plainly with a real reason and a referral where you can, keep it to a few sentences, and leave the door open only when you mean it. Mid-project exits should be raised before they are decided, exited responsibly with a proper handover, and covered by a termination clause agreed while everybody was happy.'),
    p('Decide your criteria in advance, because the decision is much harder with a number attached and a person waiting — and be honest that selectivity is a privilege that grows with the pipeline. Early on, take more and learn faster; when you do take something despite the signals, tighten the scope and get more up front. If your project has none of these problems, [I would like to hear about it](/start).'),
  ),
  faqs: faq([
    ['What actually makes a bad project expensive?',
     'Displacement more than the direct losses. The overrun and the unbilled scope creep are visible, but the larger cost is the capacity it consumed — the better enquiry you could not take, and the case study and referral that a well-fitting project would have produced and this one will not.'],
    ['What is the strongest warning sign?',
     'Reluctance to put things in writing. A client who resists a written scope, a contract or a change process wants flexibility that operates in one direction only. Nothing else predicts difficulty as reliably, and it is close to disqualifying on its own.'],
    ['How should I decline a project?',
     'Quickly, in two or three sentences, with a specific reason rather than a vague unavailability, and a referral if you have one. Over-explaining invites negotiation about each reason and reads as uncertainty. Only say you would like to work together later if you mean it.'],
    ['Can I leave a project part-way through?',
     'Occasionally it is necessary, and it should be a last resort after a direct conversation about what has changed. Exit responsibly — finish a defined piece, document what exists, hand over access — and have a termination clause agreed at the start rather than negotiated during a dispute.'],
    ['What if I cannot afford to turn work down?',
     'Then take it, with your eyes open — tighter scope, shorter engagement, more payment up front, everything in writing. Selectivity is a privilege that grows with your pipeline, and early projects teach you what a bad fit feels like in a way no advice can. Building the pipeline is the real fix.'],
  ]),
};
