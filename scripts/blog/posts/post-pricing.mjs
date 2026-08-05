import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/pricing-ai-accelerated-work/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-pricing-ai-accelerated-work',
  slug: 'pricing-ai-accelerated-work',
  title: 'Pricing Work When AI Makes You Faster',
  category: 'career',
  order: 112,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-18',
  series: 'AI-accelerated delivery',
  excerpt:
    'If you bill by the hour and the hours halve, you have given yourself a pay cut for getting better. What to charge for instead.',
  coverLabel: 'Pricing AI-accelerated work — cover',
  body: body(
    p('There is an uncomfortable arithmetic at the centre of AI-assisted development. If the work that took forty hours now takes twenty, and you bill hourly, you have just halved your income for the same delivered outcome. Getting faster made you poorer, which is a strange result for an improvement.'),
    p('The response people reach for first is to keep quiet about it and bill the old number, which is dishonest and also unstable — clients are not unaware that tooling has changed, and a rate that depends on them not asking is a rate with a short life.'),
    p('The stable answer is to stop selling hours. That sounds like a platitude until you work out what you are actually selling instead, how to price it, and what to say when somebody asks whether AI wrote the code. This post is about those three things.'),

    h2('Why does hourly billing break here?'),
    p('Because it prices the input, and the input is exactly what changed.'),
    p('An hourly rate is a claim that your time is the scarce resource being purchased. When a tool halves the time required to produce the same result, that claim quietly stops describing reality — the scarce thing was never the typing, it was knowing what to type and whether the result is correct.'),
    p('The deeper problem is that hourly billing puts you and the client on opposite sides of every efficiency. They want it done faster; you are paid for it taking longer. That tension is manageable when improvements are incremental and becomes untenable when a tool arrives that changes the number substantially.'),
    table('What each model actually prices', [
      ['Model', 'Prices', 'Effect of getting faster'],
      ['Hourly', 'Your time', 'You earn less'],
      ['Day rate', 'Your availability', 'Neutral, if utilised'],
      ['Fixed scope', 'A defined outcome', 'You earn more'],
      ['Value-based', 'The result to them', 'Decoupled entirely'],
      ['Retainer', 'Reserved capacity', 'You deliver more per month'],
    ]),
    p('Only the first row punishes improvement, and it is the one most freelancers start with because it is the easiest to explain. The move away from it is not about extracting more — it is about aligning the incentive so that working out a faster way to do something is not self-defeating.'),

    h3('The client is not buying hours either'),
    p('Nobody wants forty hours of development. They want a working booking system, a store that converts, a migration completed before a contract expires. Hours are a proxy that both sides tolerate, and dropping the proxy usually makes the conversation clearer rather than more difficult.'),
    img('input-vs-output', 'A price attached to elapsed effort compared with one attached to a delivered result', 'Hourly billing puts you and the client on opposite sides of every efficiency. That becomes untenable when a tool halves the number.'),

    h2('What are you actually selling?'),
    p('Judgement, ownership and a working outcome — none of which got faster.'),
    p('This is the part worth being precise about, because "you are selling value not time" is unhelpfully vague. Concretely, what a client gets that AI does not provide is the decision about what to build, the architecture that will still make sense in a year, the review that catches the subtly wrong output, and somebody accountable when it breaks at 2am.'),

    h3('Deciding what not to build'),
    p('A large part of the value in any project is the feature that was talked out of scope because it would have doubled the timeline for marginal benefit. Faster typing does not produce that judgement, and it arguably makes it more valuable — when building is cheap, the discipline of not building is what protects the timeline.'),

    h3('Architecture that survives'),
    p('Generated code is locally reasonable and globally indifferent. It does not know that this table will be queried by a report nobody has written yet, or that this integration will need to run twice. Someone has to hold the whole shape in mind, and that has not been automated.'),

    h3('The review that catches the subtle bug'),
    p('The failure mode of AI-assisted code is not obvious breakage — it is plausible code that is wrong in a specific case. Catching that requires knowing what to look for, and it is the least visible and most valuable part of the work.'),

    h3('Accountability'),
    p('A client is buying somebody who is responsible for the outcome. That responsibility has no faster version, and it is the thing that distinguishes a professional engagement from a tool subscription.'),

    h2('How do you actually price a fixed-scope project?'),
    p('From the value and the risk, informed by effort rather than derived from it.'),
    p('The practical method is to estimate the work honestly, including everything around the code, then set a price that reflects what the outcome is worth and what you are carrying in risk. The estimate tells you the floor; it does not determine the number.'),

    ol([
      '**Break the work into components** you have built before, and estimate each.',
      '**Add the non-code work** — setup, testing, review cycles, deployment, handover.',
      '**Add contingency** for the named unknowns, stated rather than hidden.',
      '**Consider what the outcome is worth** to the client, which sets the ceiling.',
      '**Price within that range** according to risk, certainty and how much you want the work.'],
    ),
    p('Step four is the one people skip, and it is the difference between a rate and a business. A migration that unblocks a contract worth six figures is not priced the same as a marketing site, even if the effort is similar — and clients understand this intuitively because it is how they price their own work.'),

    h3('Risk belongs in the price'),
    p('Fixed-scope pricing means you carry the overrun risk, and that risk has a value. A well-understood build with a clear boundary carries little; one depending on an undocumented third-party system carries a lot. Pricing them the same means the second one subsidises nothing and eventually costs you.'),

    h3('Do not quote your hourly rate times the hours'),
    p('It is the natural instinct and it recreates the problem in a different format. If a fixed price is just a disguised hourly estimate, the incentive is unchanged and you have added risk without adding margin.'),

    h3('Be prepared to walk away from the number'),
    p('A price you resent is a price that produces resentful work. Setting a number you are genuinely happy with, and being willing to lose the project at it, is what makes the whole model function — [and declining is a legitimate outcome](/blog/declining-projects).'),
    img('price-range', 'A figure positioned between an effort floor and a value ceiling rather than calculated from hours', 'The estimate sets the floor. What the outcome is worth sets the ceiling. Pricing happens between them, according to risk.'),

    img('what-you-sell', 'Judgement, architecture and accountability standing apart from the production of code', 'None of these got faster. When building is cheap, deciding what not to build is worth more, not less.'),

    h2('What do you say when they ask about AI?'),
    p('The truth, framed accurately — which is a better answer than either extreme.'),
    p('Clients do ask, and the two tempting replies are both wrong. Denying it is dishonest and increasingly implausible. Leading with it — positioning yourself as an AI-powered service — invites the response "then why does it cost this much", and it sells the tool rather than the person.'),

    h3('The honest framing'),
    p('AI writes a lot of the boilerplate; I own the architecture and the review. That is accurate, it is easy to say, and it locates the value correctly. Clients are not confused by this — they use the same tools and know perfectly well that output still needs somebody responsible for it.'),

    h3('Always attach the counterweight'),
    p('Every speed claim needs its honest limit stated alongside it, and this is the version I use: what AI does not change is that someone still has to own the architecture, catch the subtle bug, and say no to the feature that will sink the timeline. That part is still me — the tooling just means you pay for judgement instead of typing.'),

    h3('Speed is a benefit to sell, not a discount to offer'),
    p('Getting a working product in three weeks instead of eight is worth something to the client — earlier revenue, earlier learning, an earlier decision about whether to continue. That is a benefit you are delivering, and framing it as a reason to charge less gives away the thing you improved.'),

    h3('Do not claim what you cannot deliver'),
    p('An MVP in nineteen days is a real outcome under specific conditions — a clear scope, an available decision-maker, no dependency on somebody else\'s legacy system. Presenting that as a general promise sets up a failure. The claim needs its conditions attached or it becomes a liability the first time they are not met.'),

    h2('How do the engagement models differ?'),
    p('Three shapes, matched to how certain the work is rather than to how large it is.'),
    table('Matching model to certainty', [
      ['Engagement', 'Suits', 'Shape'],
      ['Fixed-scope sprint', 'One clear outcome, well understood', '1–2 weeks, fixed price'],
      ['Product build', 'An MVP or application with a real launch date', '3–8 weeks, fixed scope'],
      ['Ongoing partner', 'Continuous work, shifting priorities', 'Monthly, rolling'],
    ]),
    p('The mistake is choosing by size. A large, well-defined build fits fixed scope comfortably; a small piece of exploratory work does not, and forcing it there produces either a padded price or an overrun. Certainty is the variable that should decide it.'),

    h3('Retainers price capacity, which is honest'),
    p('An ongoing arrangement reserves a slice of your week, and what the client buys is availability and accumulated context. Neither of those is affected by tooling speed — if anything they improve, because more gets delivered inside the same reserved capacity.'),

    h3('Retainers need a defined shape'),
    p('An unbounded monthly arrangement becomes either an unpaid emergency service or an awkward conversation about whether enough was delivered. Stating what the retainer covers, roughly how much capacity it represents and what falls outside it keeps it working for both sides.'),

    img('engagement-fit', 'Three engagement shapes matched to how well understood the work is', 'Match the model to certainty, not to size. A large well-defined build fits fixed scope; a small exploratory one does not.'),

    h2('Does this mean charging more?'),
    p('For the same outcome delivered faster, often yes — and that is the part people find difficult.'),
    p('The instinct that faster work should cost less is strong and it comes from an hourly worldview. Once the thing being sold is an outcome, the delivery time is a feature of the service rather than a component of its cost, and a faster outcome is a better service.'),

    h3('The market sets the ceiling, not your effort'),
    p('What a client will pay is a function of what the result is worth to them and what alternatives cost. Your internal efficiency does not enter that calculation, and volunteering it as a reason to reduce the price is a negotiation against yourself.'),

    h3('Efficiency gains are yours to keep, up to a point'),
    p('A carpenter with better tools does not charge less for a door. But if a category of work becomes dramatically cheaper across the market, prices do move, and pretending otherwise is a slow way to become uncompetitive. The realistic position is that you keep the gain until the market reprices, and you notice when it starts to.'),

    h3('Where speed genuinely should reduce the price'),
    p('For commodity work — a template site, a standard integration — competing on price is the market and the honest move is to price accordingly or not take it. The distinction is whether the client is buying a known deliverable or a judgement call, and only the second supports a premium.'),
    img('speed-as-benefit', 'A shorter delivery window presented as an advantage rather than as a reason to reduce a price', 'Three weeks instead of eight is earlier revenue and an earlier decision. That is a benefit you deliver, not a discount you owe.'),

    h2('What about the cost of the tools?'),
    p('Real, and small enough that it is not the interesting part.'),
    p('Subscriptions, API usage and the occasional expensive experiment are a genuine business cost, and on projects with heavy AI features the usage cost can be material. It should be in your pricing as an overhead, and where a project involves running models at scale, it belongs in the quote explicitly rather than absorbed.'),

    h3('Pass through variable inference costs'),
    p('When a build includes a feature that calls a model per user action, that is an ongoing operational cost the client will carry. Estimating it during scoping and stating it plainly avoids a surprise on their first bill — [and cost logging belongs in the build](/blog/ai-cost-logging) so the number is observable rather than theoretical.'),

    h3('Do not price your own tooling into line items'),
    p('Your editor, your assistant subscription and your infrastructure are overheads like any other. Itemising them invites a conversation about whether the client should buy them directly, which is not a conversation worth having.'),

    img('tool-costs', 'Fixed overheads separated from usage costs that scale with what is built', 'Your subscriptions are overheads. Per-request inference costs belong in the quote, because the client will carry them monthly.'),

    h2('How do you handle a client who wants the discount?'),
    p('By moving the conversation from cost to outcome, once, and then holding the number.'),
    p('"You are using AI, so it should be cheaper" is a reasonable thing for somebody to say and it deserves a straight answer rather than defensiveness. The answer is that the price reflects the result and the responsibility, and that the speed is what they are getting rather than what they are subsidising.'),

    h3('Offer a smaller scope, not a lower price'),
    p('Reducing the price for the same deliverable sets a precedent and devalues the work. Offering a reduced scope at a lower number keeps the rate intact and gives them a genuine choice, and it often surfaces that half the scope was not needed.'),

    h3('Some clients are not your clients'),
    p('A buyer whose primary criterion is cost will find somebody cheaper, and chasing them means competing on the one dimension where you cannot win sustainably. Letting them go is a decision rather than a failure.'),

    h2('What does it cost?'),
    p('Some lost deals, and a period of discomfort while you adjust.'),
    p('Moving from hourly to fixed pricing means carrying overrun risk, quoting numbers that feel high the first few times, and losing some work to cheaper alternatives. That is the transition cost and it is real, particularly in the first few months while your estimates are still calibrating.'),
    p('The honest counterweight: fixed pricing genuinely transfers risk to you, and if your estimates are poor it transfers it painfully. Hourly billing is not merely a worse model — it is a safer one for work you do not understand well, for a client relationship that is new, and for anybody early enough in their practice that estimates are still unreliable. The right move is to fix the price on work you have done before and bill by time or in stages on work you have not, rather than adopting one model everywhere because it is theoretically superior.'),
    quote('If you bill by the hour and the hours halve, you have given yourself a pay cut for getting better at your job.'),

    h2('Conclusion'),
    p('Hourly billing prices the input, and the input is exactly what AI changed. It also puts you and the client on opposite sides of every efficiency, which is manageable while improvements are incremental and untenable once a tool halves the number. The stable answer is to price outcomes instead.'),
    p('Be precise about what you are actually selling: deciding what not to build, architecture that survives contact with next year, the review that catches plausible-but-wrong output, and somebody accountable when it breaks. None of those got faster, and the first arguably got more valuable — when building is cheap, restraint is what protects the timeline.'),
    p('Price fixed-scope work from a floor set by honest estimation and a ceiling set by what the outcome is worth, positioning within that range according to the risk you are carrying. Do not quote your hourly rate multiplied by hours, because that recreates the same problem with added risk.'),
    p('When clients ask about AI, tell them the truth with the counterweight attached — it writes the boilerplate, you own the architecture and the review, and what has not changed is that somebody has to catch the subtle bug and say no to the feature that would sink the timeline. Sell speed as a benefit rather than offering it as a discount.'),
    p('Match the engagement model to how certain the work is rather than how large: a fixed-scope sprint for a clear outcome, a product build for something with a real launch date, a retainer for continuous work. And be honest about where fixed pricing does not fit — new relationships and unfamiliar work are safer billed by time. If you want to talk about a project on that basis, [start here](/start).'),
  ),
  faqs: faq([
    ['Should I charge less because AI makes me faster?',
     'Not for the same outcome. Hourly billing prices your time, and once a tool halves the time required, that model means getting better makes you poorer. Price the delivered result instead, and treat faster delivery as a benefit the client receives rather than a discount you owe them.'],
    ['What do I say when a client asks if AI wrote the code?',
     'The truth, framed accurately: AI writes a lot of the boilerplate and you own the architecture and the review. Attach the counterweight — someone still has to catch the subtle bug and say no to the feature that sinks the timeline. Clients use these tools too and are not confused by this.'],
    ['How do I price a fixed-scope project?',
     'Estimate honestly including all the non-code work to get a floor, consider what the outcome is worth to the client to get a ceiling, then position within that range according to the risk you are carrying. Do not simply multiply your hourly rate by an estimate — that adds risk without margin.'],
    ['Is fixed pricing always better than hourly?',
     'No. Fixed pricing transfers overrun risk to you, and if your estimates are unreliable it does so painfully. Fix the price on work you have done before; bill by time or in stages on genuinely unfamiliar work and new client relationships where you cannot yet estimate with confidence.'],
    ['What about the cost of AI tooling itself?',
     'Your subscriptions and editor are overheads and should not be itemised. Variable inference costs are different — if a build includes a feature calling a model per user action, estimate that during scoping and state it plainly, since the client will carry it as an ongoing operational cost.'],
  ]),
};
