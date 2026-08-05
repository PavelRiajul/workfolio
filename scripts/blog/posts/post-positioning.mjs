import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ai-accelerated-positioning/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ai-accelerated-positioning',
  slug: 'ai-accelerated-positioning',
  title: 'Positioning as AI-Accelerated, Not an AI Consultancy',
  category: 'career',
  order: 113,
  readTime: '13 min read',
  date: 'November 2026',
  publishedAt: '2026-11-06',
  series: 'AI-accelerated delivery',
  excerpt:
    'One says you deliver faster. The other says you sell AI. They attract different clients, and only one of them survives the tooling changing again.',
  coverLabel: 'Positioning — cover',
  body: body(
    p('There are two ways to put AI in your positioning and they lead to different businesses. "AI consultancy" says the AI is the product — you advise on it, build with it, and your expertise is in the technology. "AI-accelerated developer" says the product is still working software, delivered faster because of how you work.'),
    p('The distinction sounds like word choice and it is not. It determines which clients contact you, what they expect, what they compare your price against, and how exposed you are when the tooling shifts again — which it will, because it has twice already in the time most of these positioning statements have existed.'),
    p('I chose the second, deliberately, and this post is about why: what each positioning actually promises, who it attracts, and how to write the version that does not become a liability.'),

    h2('What is the actual difference?'),
    p('What you are accountable for when the project is judged.'),
    p('An AI consultancy is accountable for the AI being the right answer. If the model does not perform well enough, if the use case turns out not to suit it, if the accuracy is not there — that is the engagement failing at its core premise, because the premise was the technology.'),
    p('An AI-accelerated developer is accountable for the software working. The tooling is how the work got done, in the same way a framework or an editor is, and if a part of the build turns out to be better done by hand then that is what happens. The promise survives the tool changing.'),
    table('Two positions, two contracts', [
      ['', 'AI consultancy', 'AI-accelerated developer'],
      ['Sells', 'AI capability', 'Working software'],
      ['Judged on', 'Whether the AI works', 'Whether the product works'],
      ['Client asks for', 'An AI feature', 'A product built well'],
      ['Compared against', 'AI specialists, model vendors', 'Other developers and agencies'],
      ['Exposure', 'High — tooling shifts', 'Low — outcome is stable'],
      ['Budget it comes from', 'Innovation, often temporary', 'Product, ongoing'],
    ]),
    p('The last row matters more than it looks. Innovation budgets are discretionary and get cut first; product budgets are how the business runs. Positioning yourself against the second is a more durable place to be even when the first is where the excitement is.'),

    h3('Both are legitimate businesses'),
    p('This is not an argument that AI consultancy is a bad position. It is a real specialism with real demand, and people who genuinely know model evaluation, retrieval design and cost control are valuable. The point is that it is a different business with different requirements, and drifting into it because the language is fashionable is what causes problems.'),
    img('two-positions', 'Two service descriptions leading to different accountability and different comparisons', 'One is judged on whether the AI works, the other on whether the product does. That difference decides everything downstream.'),

    h2('Who does each one attract?'),
    p('Different buyers with different questions, and the difference shows up in the first email.'),

    h3('AI-first positioning attracts exploration'),
    p('Enquiries arrive asking what AI could do for their business, whether their data is suitable, whether they should be worried. These are interesting conversations and a substantial share do not become projects, because the client is orienting rather than buying. Consulting on that is a business, and it is a sales-heavy one.'),

    h3('Delivery positioning attracts projects'),
    p('Enquiries arrive with a thing that needs building and a reason it needs building now. The conversation starts from scope rather than from possibility, and the conversion rate is higher because the buyer has already decided they need software.'),

    h3('The AI-first version invites the wrong comparison'),
    p('Position on AI and you are compared against specialists, model vendors and the client\'s own experiment with a chatbot. Position on delivery and you are compared against other developers and agencies, where being faster is a straightforward advantage rather than a claim requiring proof.'),

    h3('And the wrong expectation'),
    p('A client hiring an AI specialist expects deep expertise in evaluation, fine-tuning and model selection. If what you actually do is build good software quickly using AI tooling, that expectation is a mismatch you will have to manage on every project — and mismatched expectations are the most common source of an unhappy engagement.'),

    h2('Why is the delivery framing more durable?'),
    p('Because it is not a bet on which tools stay useful.'),
    p('The specific tooling has changed substantially and repeatedly in a short period, and there is no reason to expect that to stop. A position built on being expert in a particular generation of tools has to be rebuilt each time that generation is superseded, which is exhausting and slightly embarrassing in public.'),
    p('A position built on delivering working software faster than the alternative absorbs those changes as improvements. When the tooling gets better, you deliver faster; when it changes shape, you adapt. The promise to the client is identical throughout, which is what lets a reputation compound rather than reset.'),

    h3('The client outcome has not changed in twenty years'),
    p('People have always wanted software that works, delivered when they need it, by somebody who will still answer the phone afterwards. Positioning against that is durable precisely because it is unglamorous, and the fashionable layer sits on top of it rather than replacing it.'),

    h3('It also survives AI becoming unremarkable'),
    p('At some point using these tools will be as noteworthy as using an IDE, and every business whose differentiation was "we use AI" will need a new one. A business whose differentiation is speed and judgement will simply keep operating, and that transition costs nothing.'),
    img('durability', 'A promise that persists while the tooling beneath it is replaced repeatedly', 'Tools have changed twice already. A position built on a tool generation gets rebuilt each time; one built on outcomes absorbs it.'),

    h2('How do you write the claim?'),
    p('Specific about the mechanism, honest about the limit, and with the counterweight attached.'),
    p('The claim that works is not "AI-powered development" — which says nothing — but a description of how the work actually divides. AI writes a lot of the boilerplate; I own the architecture and the review. That is concrete, it is true, and it tells a client exactly what they are paying for.'),

    h3('Every speed claim gets a counterweight'),
    p('This is the rule I hold to throughout, and it is the reason the claims are believable. The version I use: what AI does not change is that someone still has to own the architecture, catch the subtle bug, and say no to the feature that will sink the timeline. That part is still me — the tooling just means you pay for judgement instead of typing.'),

    h3('A counterweight is persuasion, not modesty'),
    p('Stating the limit of your own claim is what makes the claim credible, because an unqualified speed promise reads as marketing and gets discounted accordingly. Naming what does not get faster demonstrates that you understand where the work actually is, which is the thing a client is really evaluating.'),

    h3('Use real numbers with their conditions'),
    p('An MVP delivered in nineteen days is a specific, verifiable claim. It is also conditional — a clear scope, an available decision-maker, no dependency on an undocumented legacy system. Stating the number with its conditions is stronger than either the bare number or a vague "we work fast".'),

    h3('Never claim a capability you would not want tested'),
    p('If a prospect could reasonably read your positioning and ask you to fine-tune a model or design an evaluation harness, you need to either be able to do it or not imply it. This is the most common way an accelerated-delivery practice accidentally becomes an AI consultancy on a project it should not have taken.'),

    h2('What about the sceptical client?'),
    p('There are two kinds and they need different answers.'),

    h3('The one who thinks AI code is bad'),
    p('This is a reasonable position informed by real experience of plausible-but-wrong output. The answer is process rather than reassurance: describe the review, the type checking, the tests on the paths that matter, and the fact that you are accountable for the result regardless of how it was produced.'),

    h3('The one who thinks it should therefore be cheap'),
    p('Also reasonable, and answered by moving from input to outcome — the price reflects the working product and the responsibility, not the keystrokes. [That conversation has its own shape](/blog/pricing-ai-accelerated-work) and it is worth having once, clearly, rather than deflecting.'),

    h3('The one who wants AI in the product'),
    p('A genuinely different request, and worth recognising as such. Building a feature that uses a model is a real specialism with its own concerns — evaluation, cost, failure modes — and if you do that work, it is a service line rather than a consequence of your tooling. Conflating the two in your positioning is what creates the confusion.'),

    h3('Do not argue with the premise'),
    p('A client who is uneasy about AI-assisted development is not wrong to be, and a defensive response confirms the worry. Acknowledging the failure mode plainly and describing how you handle it is more convincing than any assertion about quality.'),
    img('two-sceptics', 'Two distinct objections requiring different responses rather than one general reassurance', 'One doubts the quality and needs to hear about process. One doubts the price and needs the conversation moved to outcomes.'),

    img('page-order', 'Service outcomes presented ahead of the method used to deliver them', 'Putting the mechanism third rather than first is the positioning decision expressed in page order.'),

    h2('What goes on the website?'),
    p('The outcome first, the mechanism second, the caveat immediately after.'),
    ol([
      '**What you build** — the actual services, in the client\'s language.',
      '**Evidence** — real projects with real numbers and their conditions.',
      '**How you work** — including the AI acceleration, described concretely.',
      '**The counterweight** — what does not get faster, stated in your own voice.',
      '**Process and engagement shapes** — so the buying decision is easy.'],
    ),
    p('Putting the AI mechanism third rather than first is the whole positioning decision expressed in page order. A visitor should understand what you deliver before they learn how, because the first is what they are shopping for.'),

    h3('Case studies should lead with the outcome'),
    p('A case study titled around the technology sells the technology. One titled around the result — a store converting better, an MVP shipped in three weeks — sells the outcome, and the technology appears where it belongs, as part of how it was done.'),

    h3('Do not put AI in your job title if delivery is your business'),
    p('It is the fastest way to attract the wrong enquiry. The mechanism belongs in the body copy where it can be described accurately, not in the headline where it becomes the entire proposition.'),

    h3('The evidence has to carry the weight'),
    p('Positioning claims are only as strong as the work behind them, so case studies with real numbers do more than any phrasing. [A nineteen-day MVP with its conditions stated](/work/pulse) is worth more than a paragraph of adjectives, because a prospect can evaluate it.'),
    img('evidence', 'Specific delivered outcomes doing the persuasive work that adjectives cannot', 'Real projects with real numbers and their conditions attached. A prospect can evaluate those; adjectives get discounted.'),

    h2('When should you actually position on AI?'),
    p('When you can do the specialist work and want that to be the business.'),

    h3('If the deep expertise is real'),
    p('Somebody who genuinely knows retrieval architecture, evaluation harnesses, prompt versioning and inference cost control has a specialism worth naming. That is a defensible position with real scarcity, and the delivery framing undersells it.'),

    h3('If you are building products rather than services'),
    p('For a product company where the AI is the product, the positioning is simply accurate. This whole discussion is about service businesses, where the client is buying an outcome and the tooling is your business rather than theirs.'),

    h3('If the market you serve expects it'),
    p('Some sectors and some buyer types are actively looking for AI capability and will filter you out without it. Knowing your market matters more than any general rule, and a position that is right in one context is wrong in another.'),

    h3('Beware positioning on it because everyone else is'),
    p('The most common reason for the AI-first framing is that it appears everywhere and feels necessary. Following that produces a crowded, undifferentiated position competing on the dimension you are least distinctive in, which is the opposite of what positioning is for.'),

    h2('How do you know if the positioning is working?'),
    p('By what arrives in your inbox, which is the only honest test.'),

    h3('Read the enquiries'),
    p('If people write asking what AI could do for them, you are positioned as a consultancy whether you meant to be or not. If they write with a project and a deadline, the delivery framing has landed. That signal is available every week and costs nothing to read.'),

    h3('Notice what you get compared against'),
    p('Prospects mentioning other developers and agencies means you are in the market you intended. Prospects mentioning model vendors and AI platforms means you are in a different one, competing against organisations with very different resources.'),

    h3('Watch the conversion rate, not the volume'),
    p('AI-first positioning frequently produces more enquiries and fewer projects, because exploratory conversations are cheap to start. A narrower position with a higher conversion rate is usually the better business, and volume alone is a misleading measure.'),

    h3('Ask new clients why they got in touch'),
    p('The answer is often nothing you would have predicted, and it is the most direct feedback on positioning available. It takes one question in a first call and it is worth more than any amount of theorising about messaging.'),
    img('inbox-signal', 'Incoming enquiries read as evidence of how a position is actually being received', 'What arrives in your inbox is the only honest test. Exploration enquiries mean consultancy; projects with deadlines mean delivery.'),

    h2('What does it cost?'),
    p('Some enquiries you will not receive, and a discipline about language.'),
    p('Declining to lead with AI means missing the conversations where somebody is specifically shopping for that, and in a period where those conversations are plentiful that is a real cost. The compensation is that the enquiries you do get are closer to work you want, and the position does not need rebuilding when the fashion moves.'),
    p('The honest counterweight: this is a bet that the market rewards durable positioning over current relevance, and that bet can be wrong in the short term. There are people making very good money right now on AI-first positioning who would be doing worse with mine, and if the specialist demand holds for years rather than months, that will have been the better call. What I am confident about is the narrower claim — that a position you have to rebuild every eighteen months is expensive in ways that are easy to underestimate, and that being accountable for working software is a promise you can keep regardless of what the tools do next.'),
    quote('One position says you deliver faster. The other says you sell AI. Only one of them still means something when the tooling changes again.'),

    h2('Conclusion'),
    p('The difference between AI consultancy and AI-accelerated delivery is what you are accountable for. One is judged on whether the AI works; the other on whether the product does. That determines the enquiries you get, the expectations you manage, what you are compared against, and which budget the money comes from — innovation, which gets cut, or product, which is how the business runs.'),
    p('The delivery framing is more durable because it is not a bet on a tool generation. Tooling has changed substantially and repeatedly, and a position built on expertise in a particular generation gets rebuilt each time. A position built on working software delivered faster absorbs those changes as improvements, and survives AI becoming as unremarkable as an IDE.'),
    p('Write the claim concretely — AI writes the boilerplate, you own the architecture and the review — and attach the counterweight every time. Naming what does not get faster is persuasion rather than modesty, because an unqualified speed promise reads as marketing and gets discounted. Use real numbers with their conditions attached.'),
    p('Handle the two sceptics differently: the one who doubts the code needs to hear about review, type checking and accountability; the one who wants a discount needs the conversation moved from input to outcome. And recognise the client who actually wants AI in their product as a different request rather than a variation of yours.'),
    p('Put the outcome first on the page and the mechanism third, lead case studies with results rather than technology, and read your inbox as the honest test of whether it is working. Position on AI itself when the deep expertise is genuinely there and you want that to be the business — not because the language is everywhere. If the delivery framing describes what you need, [that is what I do](/services).'),
  ),
  faqs: faq([
    ['What is the difference between AI-accelerated and an AI consultancy?',
     'Accountability. A consultancy is judged on whether the AI works — if the model underperforms, the engagement failed at its premise. An AI-accelerated developer is judged on whether the software works, with the tooling being how it got built, the same as a framework or an editor.'],
    ['Why not lead with AI when everyone else does?',
     'Because it invites comparison against AI specialists and model vendors rather than other developers, attracts exploratory conversations rather than projects, and draws on innovation budgets that get cut before product budgets do. It also needs rebuilding each time the tooling generation changes.'],
    ['How should a speed claim be written?',
     'Concretely, with the mechanism and the limit both stated. "AI writes the boilerplate, I own the architecture and the review" tells a client what they are paying for. Then name what does not get faster — that counterweight is what makes the claim credible rather than promotional.'],
    ['What do I tell a client who thinks AI-written code is unreliable?',
     'Describe the process rather than reassuring them, because their concern is informed by real experience of plausible-but-wrong output. Review, type checking, tests on the paths that matter, and being accountable for the result regardless of how it was produced is the convincing answer.'],
    ['How do I tell whether my positioning is working?',
     'Read your enquiries. People asking what AI could do for their business means you are positioned as a consultancy whether you intended it or not; people arriving with a project and a deadline means the delivery framing landed. Watch conversion rate rather than volume.'],
  ]),
};
