import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/discovery-call-questions/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-discovery-call-questions',
  slug: 'discovery-call-questions',
  title: 'What a Discovery Call Should Actually Cover',
  category: 'fullstack',
  order: 41,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-25',
  series: 'Process',
  excerpt:
    'Thirty minutes, and the questions that decide whether a quote is realistic or fiction.',
  coverLabel: 'Discovery call — cover',
  body: body(
    p('Most project trouble starts at the proposal, and most bad proposals come from a call where the wrong things were discussed at length.'),
    p('The failure mode is spending thirty minutes on features. It feels productive — the client describes what they want, you nod, everyone leaves with a shared picture — and it produces an estimate that is a guess dressed as a number, because the things that actually determine cost were never raised.'),
    p('This is the second step of [the process](/services), and it is thirty minutes. Here is what it needs to cover.'),

    h2('What is the call for?'),
    p('Deciding whether to work together, and gathering enough to quote honestly. Not designing the solution.'),
    p('That framing matters because it changes what a good call feels like. A call that ends with a clear technical plan and no idea of the budget or the deadline has succeeded at the wrong thing. One that ends with an unclear solution and complete clarity on constraints and decision-making has gone well.'),
    p('The solution can be worked out later, alone, with more care than a live conversation allows. The constraints cannot — they live in the client\'s head and the only way to get them is to ask.'),
    p('It is also a two-way assessment, and treating it that way improves the outcome. The client is deciding whether to trust you with something that matters to their business, and a call where somebody asks careful questions about their situation is considerably more convincing than one where somebody enthusiastically agrees to everything.'),

    h2('Who needs to be on it?'),
    p('Whoever can say yes, and whoever knows how the work is done today. Frequently two different people, and a call missing either is a call that will be repeated.'),
    p('Without the decision-maker, everything is provisional and there is a second call to have the same conversation with the person who matters. Without somebody who does the actual work, you get a description of how the process is supposed to run rather than how it does.'),
    p('The gap between those two is where scope hides. A manager describes a five-step approval; the person doing it explains that steps two and three are skipped for anything urgent, which is most things. Only one of those descriptions should be built.'),
    p('It is reasonable to ask for both before scheduling. A client who cannot produce a decision-maker for thirty minutes is telling you something useful about how the project will run.'),
    img('two-people', 'Two distinct figures at a shared table, one marked with an authority indicator', 'One can say yes. One knows how the work actually happens. Both are needed.'),

    h2('What do you ask about the problem?'),
    p('Start here and stay longer than feels comfortable, because the stated request is usually a proposed solution rather than the problem.'),

    h3('What happens today?'),
    p('The current process, in detail, including the spreadsheet and the WhatsApp group. Whatever is being replaced is working well enough that the business runs on it, and understanding why is how you avoid removing something load-bearing.'),

    h3('What does this cost you now?'),
    p('In hours, errors, or lost sales. If nobody can quantify it, the project has no measurable success condition, and that is worth knowing before quoting rather than after delivering.'),

    h3('What happens if nothing changes?'),
    p('The most useful question on this page. If the answer is "we carry on as we are", urgency is low regardless of what the timeline claims. If it is "we lose a contract in March", the deadline is real and everything else should be organised around it.'),

    h3('Why now?'),
    p('Something changed — a hire, a customer, a competitor, a system being retired. The trigger explains the deadline and frequently reveals a constraint nobody mentioned.'),

    h2('What do you ask about the users?'),
    p('Who they are, how many, and what they will tolerate. This determines more of the build than the feature list does.'),
    p('The number of distinct user types is the single largest cost multiplier a client controls. Each one is a permission surface, a navigation, a set of empty states and a multiplier on testing. Two types is closer to 1.6× the build than 1.2×, and clients rarely realise a request implies a second one.'),
    p('How users access it matters just as much. Staff on desktops in an office is a different product from field workers on phones with poor signal, and the second implies [offline handling](/blog/project-stack-templates) that changes the architecture rather than the styling.'),
    p('And what they will tolerate: an internal tool for ten colleagues can be blunt, while something customer-facing carries a design cost that is real work rather than polish.'),

    h2('What do you ask about existing systems?'),
    p('Everything it must talk to, and — critically — what state that data is in.'),
    table('Integration questions and what the answer changes', [
      ['Question', 'Cheap answer', 'Expensive answer'],
      ['What must it integrate with?', 'Nothing, or one modern API', 'Three, one of them legacy'],
      ['Is there existing data to migrate?', 'No', 'Yes, in spreadsheets'],
      ['Who owns the system it talks to?', 'You do', 'A third party who must cooperate'],
      ['Is there documentation?', 'Yes, current', 'Someone remembers'],
      ['Can I see a sample export?', 'Here it is', 'We will have to ask'],
    ]),
    p('That last row is the one I insist on. "We have existing customers to bring across" can mean an afternoon or three weeks, and the difference is entirely the state of the data. Twenty minutes looking at a real export before quoting has changed my number in both directions more than any other single activity.'),
    p('Integrations compound rather than add. Two is nearer three times one, because each has its own authentication, rate limits and undocumented behaviour, and the failure combinations multiply.'),
    p('The question people forget entirely is what happens when an integration is unavailable. Every third-party system will be down at some point, and the answer determines real work: whether the action queues and retries, fails visibly, or degrades to a manual process. A client who has never considered it will assume the first, and building the first is considerably more than building the second.'),
    p('Ownership of the other system matters as much as its technical quality. An integration with something the client controls can be adjusted when it turns out to be awkward. One with a third party cannot, and any change needs somebody else\'s cooperation on somebody else\'s timeline — which belongs in the risk section of a proposal rather than being discovered in week five.'),

    h2('What do you ask about the deadline?'),
    p('Not when they want it — what is behind the date.'),
    p('"As soon as possible" is not a deadline, it is an absence of one, and it usually means nothing external depends on the timing. A date tied to a trade show, a contract start or a system being switched off is a real constraint and should shape scope accordingly.'),
    p('The follow-up that matters: what happens if it ships two weeks late? If the answer is "nothing much", the deadline is a preference and scope has room. If it is "we lose the customer", scope needs cutting now rather than in week six.'),
    p('This is also where you find out whether the timeline is achievable at all. A fixed external date with a scope that cannot fit is a conversation to have on the call, not a discovery to make halfway through the build.'),
    img('deadline-behind', 'A date marker with a supporting structure behind it, and another with none', 'A date with nothing behind it is a preference. A date with a contract behind it is a constraint.'),

    h2('How do you ask about budget?'),
    p('Directly, as a range, early. Treating it as impolite wastes both parties\' time.'),
    p('The wording that works: "So I can point you at the right approach — is this a five-thousand, fifteen-thousand or fifty-thousand kind of project?" It gives permission to answer in bands, it is obviously about scoping rather than about extracting a maximum, and it is answerable by somebody who has not costed it.'),
    p('A client who genuinely does not know is fine — the honest response is to describe what different budgets buy, which is more useful than a number anyway. A client who declines to indicate a range at all is a signal, and usually the signal is that they are collecting quotes to find the lowest.'),
    p('The reason to ask early is that it changes what you propose. A fifty-thousand solution described to a five-thousand budget wastes the rest of the call, and there is frequently a genuinely good five-thousand answer that never gets discussed.'),

    h2('What do you ask about afterwards?'),
    p('Who runs it, who changes it, and where the accounts live. Rarely raised on a first call and it shapes several decisions.'),
    p('A client with an internal developer needs conventional choices and good documentation. A client with nobody needs the [boring, managed, low-maintenance version](/blog/project-stack-templates) and an honest conversation about ongoing maintenance being a real cost rather than an optional extra.'),
    p('The accounts question belongs here too. Establishing at the outset that hosting, domain and database will be in the client\'s name is a thirty-second conversation on the first call and [a migration if left to the end](/blog/project-handover-checklist).'),
    p('And ask what happens if they want changes in six months. The answer tells you whether they are buying a project or beginning a relationship, and both are fine as long as everyone knows which.'),

    h2('How do you keep them talking about the problem?'),
    p('Clients arrive having already designed a solution, and the instinct to discuss it is strong on both sides. Three techniques keep the conversation upstream long enough to be useful.'),

    h3('Ask for the last time it happened'),
    p('"Tell me about the last order that went wrong" produces something specific and true. "What problems do you have with orders" produces a generalisation that has been smoothed by retelling. Specific incidents contain the details that matter and generalisations do not.'),

    h3('Ask who else is involved'),
    p('Most processes touch more people than the person describing them mentions. Following the work from where it starts to where it ends reliably surfaces a step, an approval or a spreadsheet nobody had brought up.'),

    h3('Ask what they would do with no software at all'),
    p('An odd question that works. It forces a description of the underlying need rather than the intended implementation, and it occasionally reveals that the software is the wrong shape for what they actually do.'),
    p('When a client insists on describing screens, the useful redirect is to ask what somebody would be doing when they reach that screen. That converts an interface description back into a workflow, which is the thing you can actually estimate.'),
    img('upstream', 'A path traced backwards from an endpoint to its origin, the origin highlighted', 'The stated request is a proposed solution. The useful conversation is upstream of it.'),

    h2('What should you be watching for besides answers?'),
    p('The call is also an assessment of whether this will be a good working relationship, and several signals appear early.'),

    h3('How they handle not knowing'),
    p('A client who says "I do not know, I will find out" is straightforward to work with. One who invents an answer to avoid the gap is one who will do the same during the build, and you will discover it from the code not matching the description.'),

    h3('Whether they can prioritise'),
    p('Ask which of three features they would keep if only one could ship. An immediate answer means scope conversations will be productive. "All three are essential" means every future cut will be a negotiation, which is a cost worth pricing in.'),

    h3('How they talk about their own users'),
    p('Clients who describe users concretely — a name, a situation, what annoys them — usually have a product that fits somebody. Clients who describe users as a market segment frequently have not spoken to any, which changes how much the requirements should be trusted.'),

    h3('Whether the timeline and the availability match'),
    p('A four-week deadline from somebody who reviews work fortnightly is not a four-week project. Client availability is part of the timeline, and [three hours a week is a real requirement](/blog/mvp-in-19-days) rather than a nice-to-have.'),
    img('signals', 'Several small indicators arranged beside a central conversation marker', 'The answers matter. So does how they arrive.'),

    h2('What are the answers that end the call?'),
    p('Some responses mean the project should not proceed, and recognising them early is a service to both sides.'),

    h3('No decision-maker available'),
    p('If the person on the call cannot approve scope and the person who can is unavailable for the foreseeable future, the project will be a sequence of provisional agreements revised by somebody who was not there.'),

    h3('The budget and the scope are an order of magnitude apart'),
    p('Not a negotiation — an arithmetic problem. Worth saying plainly, along with what the available budget could genuinely buy, which is sometimes a smaller thing that solves most of the problem.'),

    h3('The previous developer is described as an idiot'),
    p('Sometimes true, and it is also the most reliable predictor of how you will be described. Ask what happened specifically. A clear technical account is reassuring; a purely emotional one is a pattern.'),

    h3('The real problem is not software'),
    p('A great many "we need a system" conversations are actually about a process nobody follows or a decision nobody has made. Building software around an unresolved process makes the process harder to change, not easier.'),
    img('call-endings', 'A path splitting, one branch continuing and one clearly terminated', 'Recognising these early is a service to both sides, not a lost sale.'),

    h2('What happens at the end of the call?'),
    p('A stated next step with a date, not "I will send something over".'),
    p('My version: I will send a written scope by a specific day, it will name what is excluded as well as what is included, and it will carry a fixed price with staged phases. That is a commitment they can hold me to and it demonstrates the working relationship better than any description of it.'),
    p('If the answer is no — wrong fit, wrong budget, wrong problem — say so on the call rather than in a follow-up email that never arrives. People remember a clear no considerably more warmly than a slow fade, and it is the version that produces referrals.'),
    p('Either way, write the notes immediately. The specific phrasing a client used about their problem is the most useful material for the proposal, and it degrades within an hour.'),

    h2('How long should it take?'),
    p('Thirty minutes, and it is a genuine constraint rather than a courtesy.'),
    p('A shorter call has not covered constraints. A longer one has usually drifted into designing the solution, which is the work you are about to be paid for and is done better with time to think.'),
    p('Where thirty minutes is genuinely insufficient — a complex integration landscape, several stakeholders, an existing system that needs examining — the right answer is a paid discovery engagement rather than a longer free call. That is a small fixed-price piece producing a written technical assessment, and it de-risks the real quote considerably.'),
    quote('The call is not where you solve the problem. It is where you find out whether you can, whether they can afford it, and whether anyone can decide.'),

    h2('Conclusion'),
    p('Cover the problem before the solution, and ask what happens if nothing changes. Establish who can say yes and who does the work today. Count the user types, because that is the multiplier the client controls without realising.'),
    p('Ask to see a real data export before quoting anything involving migration. Find out what is behind the deadline. Ask about budget as a range, early, and ask who will run the thing after launch.'),
    p('End with a specific commitment and a date, or a clear no. Thirty minutes spent on those questions produces a quote you can hold to — and the alternative is thirty minutes on features and a number that is a hope with a decimal point.'),
    img('thirty-minutes', 'A bounded time marker with several distinct segments filled', 'Thirty minutes, spent on constraints rather than on features.'),
    p('If you are the client reading this rather than the developer, the same questions are worth preparing answers to before the call. Knowing what happens if nothing changes, roughly what you can spend, who can approve, and who will run it afterwards will get you a materially better proposal — because a developer who has those answers can propose the right size of thing rather than hedging against everything they were not told.'),
  ),
  faqs: faq([
    ['What should you ask on a discovery call?',
     'What happens today, what it costs, and what happens if nothing changes. Then who the users are and how many types, what it must integrate with, what is behind the deadline, the budget as a range, and who runs it after launch. Features come last.'],
    ['How long should a discovery call be?',
     'Thirty minutes. Shorter means constraints were missed; longer usually means the call drifted into designing the solution, which is better done afterwards with time to think. If genuinely more is needed, that is a paid discovery engagement.'],
    ['Should you quote on the first call?',
     'No. Quote in writing afterwards, with what is excluded named as clearly as what is included. A number given live is either padded against unknowns or optimistic, and both create problems that surface during the build.'],
    ['Who should attend a project kickoff call?',
     'Somebody who can approve scope and somebody who does the work being changed. They are often different people, and the gap between how a process is described and how it actually runs is exactly where scope hides.'],
  ]),
};
