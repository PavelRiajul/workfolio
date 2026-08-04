import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ai-feature-development-cost/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ai-feature-development-cost',
  slug: 'ai-feature-development-cost',
  title: 'How Much Does It Cost to Build an AI Feature in 2026?',
  category: 'ai',
  order: 11,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-01',
  series: 'AI cost',
  excerpt:
    'What an AI chat, search or extraction feature actually costs to build and to run — build fees, token spend, and the infrastructure most quotes leave out.',
  coverLabel: 'AI feature cost — cover',
  body: body(
    p('Most quotes for an AI feature price the wrong thing. They price the model call, which is the cheapest and least interesting part, and leave out retrieval quality, evaluation, cost controls and the review path for when the model is wrong.'),
    p('This is what the work actually costs, broken down by feature type, based on features I have built and run rather than on a pricing page. Where a number comes from a specific project I have said so.'),

    h2('What are you actually paying for?'),
    p('An AI feature is not one thing. It is a normal application feature with a probabilistic component bolted into the middle, and the bill splits across four buckets that behave very differently.'),
    ul([
      '**The plumbing** — the endpoint, the queue, the streaming UI, the permissions. This is ordinary engineering and it is priced like ordinary engineering.',
      '**The probabilistic part** — prompts, retrieval, tool definitions and the validation that keeps malformed output away from your database. Small in lines of code, large in iterations.',
      '**Evaluation** — a labelled test set and a scoring harness. Skipped in most quotes, and the reason some AI features quietly degrade for months.',
      '**Controls** — per-user cost logging, rate limits, a spend ceiling. Cheap to build up front and effectively impossible to retrofit after a surprise invoice.',
    ]),
    img('cost-buckets', 'Four cost buckets of an AI feature shown as blocks of differing size', 'The model call is the small block. Everything around it is where the budget goes.'),

    h2('What does an AI feature cost to build?'),
    p('Ranges below assume the feature is going into an existing application with auth and a database already in place. If it is not, add the cost of [the underlying web app](/services) — an AI feature is a module on a real product, never a product on its own.'),
    table('Typical build cost by AI feature type', [
      ['Feature', 'Build', 'Timeline', 'Monthly run'],
      ['Semantic search over your content', '$3k–$7k', '1.5–3 weeks', '$25–$150'],
      ['Chat assistant over your documents', '$4k–$9k', '2–3 weeks', '$40–$300'],
      ['Conversational booking', '$6k–$14k', '3–5 weeks', '$80–$350'],
      ['Document extraction pipeline', '$5k–$12k', '3–5 weeks', '$60–$400'],
      ['Full RAG assistant with citations', '$9k–$20k', '4–7 weeks', '$120–$600'],
    ]),
    p('The spread inside each row is mostly about your data, not about the feature. A chat assistant over clean, well-structured documentation sits at the bottom of the range. The same feature over scanned PDFs, inconsistent exports and a decade of drift sits at the top, and most of the extra work happens before a model is involved at all.'),

    h2('What does each feature type actually involve?'),
    p('The ranges above compress a lot of difference. Here is what the work is in each case, and where the hours go.'),

    h3('Semantic search over your content'),
    p('The cheapest useful AI feature, and the one most often solved with something that is not AI at all. The work is embedding your content, storing vectors alongside the existing data, and merging vector results with keyword results so exact terms like product codes still match.'),
    p('Roughly a third of the build is indexing and keeping embeddings in sync when content changes — the failure mode nobody plans for is a document edited months ago whose vector still describes the old wording. It degrades silently, with no error anywhere in the logs.'),
    p('It stays cheap because there is no generation step. You are not paying a model to write anything, so the running cost is close to the cost of the database you already have.'),

    h3('A chat assistant over your documents'),
    p('Semantic search plus generation, citations and a refusal path. The extra spend over plain search is almost entirely in three places: making retrieval good enough that answers are grounded, verifying that cited sources actually exist, and teaching it to decline when the corpus does not contain the answer.'),
    p('That last one sounds trivial and is the difference between a demo and something a team relies on. Models are trained hard toward helpfulness, so "answer from these documents" reads as an instruction to produce an answer regardless of whether the documents support one.'),

    h3('Conversational booking'),
    p('More expensive than it looks, because correctness lives outside the model. The assistant handles the conversation; a real scheduling engine owns availability and writes the booking. Double-booking is a scheduling problem and never belongs to a language model.'),
    p('The cost sits in the integration surface — calendar, messaging channel, confirmations, reminders, owner alerts — and in the escalation path for when the conversation goes sideways. On a WhatsApp booking flow, the messaging integration and its edge cases took longer than the AI layer did.'),

    h3('Document extraction'),
    p('Priced by how bad the input is. Clean digital PDFs with consistent layouts extract reliably enough to run with spot checks. Photographs and poor scans do not, and any workflow treating extraction there as fully automatic will produce silent errors that surface weeks later.'),
    p('The unavoidable cost is a confidence threshold and a human review queue for anything below it. Extraction without a review path is not cheaper — it just moves the cost to whoever finds the mistakes.'),
    img('feature-types', 'Four AI feature types shown as blocks of increasing size and complexity', 'Cost tracks integration surface and the price of being wrong, not model sophistication.'),

    h2('What drives the price up?'),

    h3('The state of your content'),
    p('This is the single largest variable and the one nobody asks about during a sales call. Clean structure means [retrieval works with modest effort](/blog/rag-that-answers). Two-column PDFs, flattened tables and scanned documents mean a parsing and cleanup phase that can equal the rest of the build.'),

    h3('Whether wrong answers are expensive'),
    p('A feature that suggests a related article can be wrong occasionally at almost no cost. A feature that quotes a policy, prices a job or books an appointment cannot. The second category needs an evaluation harness, a confidence threshold and a human review path, and that is typically 30–40% more work than the first.'),

    h3('How many integrations it touches'),
    p('Every system the feature reads from or writes to is a separate set of auth, error handling and rate limits. Two integrations is not twice one — it is closer to three times, because the failure combinations multiply.'),

    h3('Whether it has to explain itself'),
    p('Citations, audit trails and "why did it say that" views are genuinely useful and genuinely not free. On a RAG assistant, verified citations added roughly a week: storing offsets at index time, threading ids through the prompt, and validating every id before rendering.'),

    h2('What does it cost to run each month?'),
    p('Running cost is dominated by generation, and generation is dominated by how much context you send rather than which model you pick. This is the number most quotes omit entirely.'),
    table('Cost per 1,000 answers on a production RAG assistant', [
      ['Component', 'Cost per 1,000', 'Scales with'],
      ['Query embedding', '~$0.02', 'Query volume'],
      ['Reranking 20 candidates', '~$1.60', 'Query volume'],
      ['Generation with 5 passages', '~$16.00', 'Context size, answer length'],
      ['Postgres with pgvector', '$0 extra', 'Already in the stack'],
      ['Error tracking and monitoring', '$0 extra', 'Already in the stack'],
    ]),
    p('That worked out to about **$0.02 per answer** at launch traffic on [Halo](/work/halo). Cutting from twenty unranked passages to five reranked ones reduced cost per answer by roughly two thirds *and* improved accuracy — the unusual case where the cheaper path is also the better one.'),
    img('run-cost-breakdown', 'Breakdown of monthly running cost across embedding, reranking and generation', 'Generation dominates. Context size is the lever, not model choice.'),

    h3('The number to actually watch'),
    p('Not total spend — cost per user as a share of what that user pays you. A feature costing $180 a month sounds expensive until you find it is one account generating $4,000 of revenue. It sounds cheap until you find it is forty free-tier accounts generating nothing.'),
    p('That is why [per-user cost logging](/stack) goes in before launch on every build, not after the first alarming invoice. Log the user, the model, input and output tokens and the computed cost at write time. Computing cost later from a current price list rewrites history the moment a provider changes pricing.'),

    h2('Can you cap what it costs me?'),
    p('Yes, and you should insist on it regardless of who builds the feature. Three controls, all cheap:'),
    ol([
      '**A per-user monthly ceiling.** When it is reached the feature degrades — shorter context, a cheaper model, or a clear message with a reset date — rather than silently continuing to spend.',
      '**Rate limiting per user and globally.** The global limit is what protects you from a runaway loop in your own code, which is a more common cause of a shocking bill than abuse is.',
      '**An alert before the invoice.** A threshold at 60% of expected monthly spend, delivered somewhere a human reads.',
    ]),
    p('None of this is sophisticated. It is roughly two days of work and it is the difference between a predictable line item and an open-ended one.'),
    img('spend-ceiling', 'A rising cost line meeting a fixed ceiling and levelling off', 'A ceiling turns an open-ended risk into a line item you can budget.'),

    h3('Routing by task, not by preference'),
    p('One more control worth naming, because it typically cuts running cost by a third with no quality loss. Not every call needs your best model.'),
    p('Reranking is latency-sensitive and needs no reasoning, so it goes to a fast, cheap model — Groq, in my stack. Generation is where reasoning quality is visible, so it goes to Claude or GPT. Classification and routing steps go cheaper still. Behind a provider-agnostic adapter that split is one line of routing, which is the main argument for building the adapter before you think you need it.'),
    p('The alternative — sending everything to the most capable model because it is simpler — is the most common avoidable line on an AI invoice.'),

    h2('Is it cheaper to just use ChatGPT?'),
    p('For internal, ad-hoc work, yes, and it is not close. A team subscription costs a fraction of any build and handles a wide range of tasks well.'),
    p('It stops being an option the moment you need the capability *inside* your product: answering from your data, under your branding, with permissions respected, an audit trail, and an interface your customers use without knowing a model is involved. No subscription does that.'),
    table('Subscription versus building it in', [
      ['Requirement', 'ChatGPT subscription', 'Built into your product'],
      ['Internal ad-hoc questions', 'Excellent', 'Overkill'],
      ['Customer-facing', 'Not possible', 'Yes'],
      ['Respects your permissions', 'No', 'Yes'],
      ['Audit trail', 'Limited', 'Yes'],
      ['Cost predictability', 'Flat per seat', 'Per use, capped'],
    ]),
    p('The honest test is whether the capability needs to be in the product or merely available to your team. If it is the latter, buy a subscription and spend the budget elsewhere. I have told clients this on discovery calls and lost the project, which is the correct outcome when the alternative is billing for something they did not need.'),

    h2('What do the hidden costs look like?'),
    p('Four line items that rarely appear in a quote and reliably appear in reality.'),

    h3('The content cleanup nobody scoped'),
    p('The most common budget overrun on an AI project is not the AI. It is discovering in week two that the documents the feature is supposed to answer from are a decade of inconsistent exports, that tables flatten into unreadable strings when parsed, and that half the corpus is scanned.'),
    p('This is knowable in an afternoon. Parse twenty representative documents and read the output as the pipeline sees it, before anyone quotes. I do this during scoping now precisely because it moved a project from a comfortable estimate to an uncomfortable one, and it was better to know in week one.'),

    h3('Re-embedding when you change models'),
    p('Change your embedding model and every stored vector becomes meaningless — vectors from different models are not comparable, so a partially migrated index returns nonsense for exactly the queries touching both halves. Budget a full reindex, not an upgrade, and store the model name alongside every embedding so a mixed state is detectable rather than silently wrong.'),

    h3('Evaluation maintenance'),
    p('An evaluation set is not a one-off deliverable. Content changes, questions change, and a test set that no longer reflects real usage will happily report that everything is fine. Budget a few hours a quarter to refresh it, and treat a prompt change without a re-run as an unreviewed deploy.'),

    h3('The support load of being wrong'),
    p('Every AI feature generates a category of support ticket that did not exist before: "it told me the wrong thing". Features with citations and an honest refusal path generate far fewer of these, which is the practical argument for both — they cost a week up front and save a recurring drag on whoever answers the inbox.'),

    h2('How long does an AI feature take to build?'),
    p('Calendar time is usually shorter than people expect and the shape is not what they expect either. The plumbing goes fast. The last 20% — evaluation, edge cases, cost controls, the refusal path — takes disproportionately long and is exactly what gets cut when a deadline slips.'),
    img('build-timeline', 'Timeline showing a fast build phase followed by a longer evaluation and controls phase', 'The plumbing is quick. Evaluation and controls are the tail that gets cut under pressure.'),
    p('On a 19-day AI MVP, the split was roughly: three days scoping and data modelling, five days on auth, billing and the application shell, six days on the retrieval and AI layer, three days on evaluation and cost caps, two days on staging, monitoring and handover. The AI-specific work was under a third of the calendar.'),

    h2('What does a fixed price actually cover?'),
    p('I quote AI features fixed-price with staged scope, because open-ended time-and-materials on something probabilistic is uncomfortable for both sides. What that means in practice:'),
    ul([
      '**A written scope naming the failure behavior**, not just the happy path. What happens when retrieval finds nothing, when the model returns malformed output, when a provider is down.',
      '**An evaluation set agreed up front** — usually fifty real questions with labelled correct sources. This is the acceptance criteria. Without it "is it good enough" is an argument rather than a measurement.',
      '**Cost controls in the base scope**, never as an add-on.',
      '**A named quality bar** for retrieval hit rate and citation validity, so "done" is a number.',
    ]),
    p('That structure comes out of [how I scope every project](/services): the expensive mistakes happen at the proposal, not during the build.'),

    h2('When is an AI feature not worth building?'),
    p('Three situations where I say no, or say wait.'),

    h3('Your content cannot support it'),
    p('If a labelled test run shows retrieval finding the right passage 50% of the time on clean queries, no model fixes that. The honest sequence is to fix the content first, which is a documentation project rather than an AI project.'),

    h3('A deterministic feature would do the job'),
    p('A surprising share of AI requests are search, filtering or a form. If the answer is always one of eleven things, a well-designed select is faster, cheaper, and correct every time. Models are for open-ended input, not for input you already control.'),

    h3('Nobody has said what "working" means'),
    p('Without an agreed definition of good, an AI feature has no completion condition. It is the one category of work where you can iterate forever and never be finished, and that is the most expensive outcome on this page.'),
    quote('The cheapest AI feature is the one you correctly decided not to build. The second cheapest is the one with an evaluation set agreed before the first line of code.'),
    img('build-or-not', 'A decision gate with one path continuing forward and one turning aside', 'Three of these questions are answerable in a week. All three are cheaper to answer than to discover.'),

    h2('Conclusion'),
    p('The short version: expect $3k–$20k to build depending on feature type and data quality, and $25–$600 a month to run depending on volume and context size. Generation dominates the running cost, context size dominates generation, and your content quality dominates everything.'),
    p('When you compare quotes, the useful questions are not about the model. Ask what happens when retrieval finds nothing. Ask whether an evaluation set is included and who agrees it. Ask what the per-user spend ceiling is and what the feature does when it is hit. Ask whether cost logging is per user or aggregate — an aggregate number cannot answer the only question that matters when the bill arrives.'),
    p('A quote that has good answers to those four will usually be higher than one that does not, and materially cheaper over the first year.'),
    p('One last piece of arithmetic worth doing before you commit. Take the monthly running cost, multiply by twelve, add it to the build. That is the real first-year number, and it changes which option wins more often than people expect — a cheaper build with no cost controls and twenty unranked passages per answer can cost more in twelve months than a more careful build that sends five.'),
    p('If you want that arithmetic done against your actual content and volumes rather than against these ranges, [that is what a scoping call covers](/start). An afternoon spent parsing twenty of your real documents will tell you more about the final number than any estimate on this page.'),
  ),
  faqs: faq([
    ['How much does it cost to build an AI chatbot?',
     'A production chat assistant over your own documents runs $4,000 to $9,000 to build and $40 to $300 a month to operate, depending on traffic and context size. Build cost is dominated by retrieval quality and evaluation rather than by wiring up the model itself.'],
    ['What is the ongoing cost of running an AI feature?',
     'Token spend plus infrastructure, which for most small-business features is $40 to $300 a month. Cost scales with answer volume and how much context each answer needs, which is why per-user cost logging goes in before launch rather than after the first surprising invoice.'],
    ['Is it cheaper to use ChatGPT than to build something custom?',
     'For internal ad-hoc use, yes, and by a wide margin. The moment you need the capability inside your product, answering from your data with permissions respected and an audit trail, a subscription cannot do it at any price. Decide which of the two you actually need.'],
    ['Can you cap what an AI feature costs me per month?',
     'Yes. A per-user monthly ceiling, rate limiting per user and globally, and an alert at 60% of expected spend are standard in every build. You set the ceiling, and the feature degrades gracefully when it is reached rather than quietly running up a bill.'],
  ]),
};
