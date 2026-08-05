import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ai-is-a-module-not-a-stack/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ai-is-a-module-not-a-stack',
  slug: 'ai-is-a-module-not-a-stack',
  title: 'Why AI Is a Module on a Real App, Never a Stack of Its Own',
  category: 'ai',
  order: 12,
  readTime: '11 min read',
  date: 'November 2025',
  publishedAt: '2025-11-25',
  series: 'AI architecture',
  excerpt:
    'AI-first architectures fall over the moment you need auth, billing or an audit trail. The case for bolting AI onto a boring, well-built application.',
  coverLabel: 'AI as a module — cover',
  body: body(
    p('There is a particular kind of AI project that demos beautifully in week two and becomes unmaintainable in month three. It is almost always the same shape: the architecture was organised around the model, and everything that makes software survivable was treated as something to add later.'),
    p('The alternative is unglamorous and it is what I build. A conventional web application — auth, database, billing, background jobs — with the AI capability as one module inside it, behind an interface. This is [Template 04 in my stack](/stack), and it is deliberately defined as "Template 02 or 03 with an AI module bolted on properly" rather than as a stack of its own.'),

    h2('What does "AI as a module" actually mean?'),
    p('It means the AI capability is a service your application calls, not the thing your application is arranged around. Concretely: there is a `ChatService` or a `SearchService` with a typed interface, and the rest of the codebase talks to that interface without knowing which provider is behind it or what the prompt says.'),
    p('Everything else stays exactly where it always was. Users are rows in a database. Permissions are checked in middleware. Billing is Stripe. Long jobs go on a queue. None of that becomes special because a model is involved somewhere downstream.'),
    p('The test is simple: could you delete the AI feature and still have a working product? If the answer is no, and the product is not literally an AI research tool, the architecture is probably upside down.'),
    p('This is not an argument against AI features. It is an argument about where the load-bearing walls go. A booking system with a conversational front end is a booking system: the scheduler owns availability and correctness, and the model owns the conversation. Get that backwards and you have built something that double-books charmingly.'),
    p('The same holds for search, extraction and assistants. In each case there is a deterministic core that must be right, and a probabilistic layer that makes it pleasant to use. Keeping those separate is most of the architecture.'),
    img('module-in-app', 'A small glowing module slotting into a recess on a much larger matte structure', 'The application is the structure. The model is one part that slots into it.'),

    h2('Why does AI-first architecture fail?'),
    p('Not because the code is bad. Because the hard parts of a product are not the model, and an architecture organised around the model treats them as afterthoughts.'),

    h3('Auth and permissions arrive too late'),
    p('An AI-first prototype usually has one user: the developer. Roles, organisations and per-record permissions get added once real customers appear, and by then the retrieval layer has been written on the assumption that it can see everything.'),
    p('Retrofitting permissions into retrieval is genuinely hard. Every query needs filtering by what the requesting user may see, and if the index was built without a tenant or permission dimension, you are reindexing. I have seen this cost more than the original build.'),

    h3('Billing and limits have nowhere to live'),
    p('Metering usage requires knowing who is calling, what it cost and what their plan allows. In a module-on-an-app design those facts already exist. In an AI-first design there is often no user record to attach spend to, which is how teams discover their per-user cost only after the invoice.'),

    h3('Debugging is opaque'),
    p('When the model is the centre of the architecture, failures surface as "the answer was bad" rather than as a stack trace. In a conventional application the AI call is one span in a request you can already trace, with normal logs on either side.'),

    h3('Swapping providers becomes a rewrite'),
    p('If model calls are scattered through the codebase — different formats, bespoke retry logic, provider-specific streaming — changing provider touches every feature. Behind one adapter it touches one file. Given how fast pricing and capability move, that difference is worth more than the abstraction costs.'),

    table('Where each concern lives', [
      ['Concern', 'AI-first stack', 'AI as a module'],
      ['Auth and roles', 'Bolted on late', 'Built in from day one'],
      ['Per-user cost', 'Often unattributable', 'Ordinary metering'],
      ['Model swap', 'Touches every feature', 'One adapter file'],
      ['Debugging', 'Opaque', 'Normal logs and traces'],
      ['Long-running work', 'Ad hoc', 'Existing job queue'],
    ]),

    h2('What does every AI product still need?'),
    p('Strip away the model and an AI product has the same requirements as any other product. This is the list that gets skipped when the model is the centre of attention.'),
    ul([
      '**Authentication and roles** — who is asking, and what may they see.',
      '**A real data model** — the expensive thing to change, and the thing prototypes get wrong first.',
      '**Billing and usage limits** — if it costs money per use, it needs a ceiling.',
      '**Background jobs** — anything over about thirty seconds does not belong in a request.',
      '**Error tracking and monitoring** — a silently degrading AI feature is the hardest kind to notice.',
      '**A staging environment** — prompts and indexes need somewhere to be wrong safely.',
    ]),
    p('Every one of those is in [what I set up on every build regardless of the brief](/stack). None of them is AI-specific, which is precisely the point: an AI feature inherits a working foundation instead of inventing a worse one.'),

    h2('Where does the AI module actually plug in?'),
    p('At the service layer, between your application code and the provider. Three boundaries matter.'),

    h3('The application never calls a provider directly'),
    p('Features call your service. The service owns prompt construction, retrieval, provider selection and validation. This is what makes routing by task possible — reranking to a fast cheap model, generation to a stronger one — without any caller knowing.'),

    h3('The model never writes to your database'),
    p('The model proposes an action; your service validates and performs it. That boundary is where permissions, rate limits and audit logging live, and none of them can be enforced inside a prompt no matter how firmly it is worded.'),
    p('In practice this means [every tool call is validated against a schema](/blog/rag-that-answers) before anything executes. A malformed call becomes a logged retry rather than a corrupted row.'),

    h3('Long work goes on the queue, not the request'),
    p('Generation that takes minutes, indexing, batch extraction — all of it belongs in a job with a status endpoint. Holding an HTTP connection open for four minutes fails in ways that are miserable to debug, and serverless functions will time out underneath you regardless.'),
    img('service-boundary', 'A gate between an application structure and an external provider, with data passing through validation', 'The service layer is where permissions, validation and routing live. The prompt is not a security boundary.'),

    h2('Is the job queue really part of the AI feature?'),
    p('It is arguably the most important part, and it is the one most often missing from a prototype.'),
    p('Synchronous model calls work fine until they do not: a slow provider, a long document, a retry storm, a user who submits twice. Once any of those happens in production, a request-scoped design produces timeouts with no record of what was in flight.'),
    p('With a queue, each unit of work is a row. It can be retried with backoff, inspected when it fails, cancelled when the user navigates away, and rate-limited independently of your web traffic. Failed jobs go to a dead letter queue instead of vanishing.'),
    table('Sync call versus queued job', [
      ['Situation', 'Synchronous', 'Queued'],
      ['Provider slow', 'Request times out', 'Retried with backoff'],
      ['User submits twice', 'Two full charges', 'Deduplicated by key'],
      ['Job fails', 'Lost', 'Dead letter queue'],
      ['Needs cancelling', 'No handle', 'Job id'],
      ['Cost spike', 'Uncontrolled', 'Queue depth is a signal'],
    ]),

    h2('How do you swap models without a rewrite?'),
    p('Keep every provider call behind one adapter with a schema-validated interface. Normalise four things: message format, tool calls, streaming events, and errors. Prompts and tool definitions stay provider-agnostic on your side of the boundary.'),
    code('ts', `
// One interface, several providers behind it.
export interface CompletionService {
  complete(input: CompletionInput): Promise<CompletionResult>;
  stream(input: CompletionInput): AsyncIterable<StreamEvent>;
}

// Routing by task, not by preference — the reason the adapter pays for itself.
const forReranking = groq;      // latency-critical, no reasoning needed
const forGeneration = anthropic; // reasoning quality is visible here
`),
    p('Keep an escape hatch for genuinely provider-specific capabilities, and accept those paths are not portable. The abstraction is not meant to be pure; it is meant to make a provider change an afternoon rather than a quarter.'),
    p('The test that the adapter is real is running your suite against two providers in continuous integration. Divergence then shows up as a failing build rather than as a surprise on the day you actually need to switch. It costs a little extra spend per run and it is the only thing that keeps the abstraction honest, because an untested adapter quietly accumulates assumptions about whichever provider you use daily.'),

    h2('What does this look like in the codebase?'),
    p('Concretely, the AI capability occupies four files and touches nothing else. That containment is the whole deliverable.'),

    h3('The interface'),
    p('One typed contract describing what the capability does in your domain language — `answerQuestion`, `extractInvoice`, `findSimilar` — not in the provider\'s language. No feature outside this file knows a model exists. When a designer asks what happens if the model is down, the answer is a documented error type rather than a shrug.'),

    h3('The adapter'),
    p('The only place a provider SDK is imported. It normalises message shapes, tool calls, streaming events and errors, and it is where routing by task lives. When pricing changes or a better model appears, this is the file that changes and the only one.'),

    h3('The validation layer'),
    p('Zod schemas for every tool call and every structured output, applied before anything executes. Validation failures return the error text to the model for one retry, then fail loudly. This is the boundary that lets the model be wrong without the database becoming wrong.'),

    h3('The evaluation harness'),
    p('A labelled test set and a scorer, runnable in CI. This is the file most teams never write, and its absence is why prompt changes ship unreviewed. If a prompt is code — and it is — then changing it without re-running the suite is deploying without tests.'),
    img('four-files', 'Four small matte modules arranged in sequence inside a larger housing', 'Interface, adapter, validation, evaluation. Everything else in the codebase stays ordinary.'),

    h2('What breaks when you get this wrong?'),
    p('Four failures I have either caused or been called in to fix. All four are architectural rather than about model quality.'),

    h3('The retrieval layer that saw everything'),
    p('An assistant built before roles existed indexed every document with no permission dimension. When the first customer with restricted content arrived, the fix was not a filter — it was a reindex, plus a new field on every chunk, plus a migration for content already embedded. Roughly three weeks to add something that costs an hour on day one.'),

    h3('The invoice nobody could explain'),
    p('Aggregate token spend tripled over a month with no obvious cause. Because calls were not attributed to users, the only way to investigate was reading logs by hand. It turned out to be one integration retrying in a loop. Per-user cost logging would have surfaced it the same day, and it is a few columns on a table.'),

    h3('The prompt change that regressed refusals'),
    p('A reword to make answers friendlier also made the model markedly less willing to say it did not know. Accuracy on answerable questions was unchanged, so nothing looked wrong, and hallucinations on unanswerable ones roughly doubled. With no evaluation harness this was invisible for weeks, and it was reported by a customer rather than a test.'),

    h3('The four-minute request'),
    p('A document-generation feature worked in development and timed out in production, because the serverless function had a limit the developer\'s laptop did not. The queue that should have been there from the start went in afterwards, under deadline pressure, which is the most expensive time to add infrastructure.'),
    img('failure-modes', 'Four matte structures, each with a visible fracture at a different structural point', 'None of these are model problems. All of them are architecture problems.'),

    h2('Does this slow down the build?'),
    p('Slightly at the start, considerably faster after the first change request — which is the trade almost every project should take.'),
    p('The foundation is reusable. Auth, billing, queue, monitoring and staging are the same on the next project and the one after, which is the entire argument for [starting from a setup I already trust](/stack) rather than re-deciding each time. An AI-first prototype is usually reusable for nothing.'),
    img('build-curve', 'Two build curves, one starting faster and flattening, one starting slower and continuing to rise', 'The prototype wins the first two weeks. The foundation wins every week after.'),
    p('On a 19-day AI MVP the split was roughly five days on the conventional application shell and six on the AI layer. The five days are what made the six possible — retrieval had a real user model to filter against, and cost logging had a real user to attribute to.'),

    h2('How do you retrofit this onto an existing prototype?'),
    p('Most people asking this question already have an AI-first prototype in production and cannot start again. The good news is that the order of operations is well defined, and each step is independently useful.'),

    h3('Step one: put a user on every call'),
    p('Before anything architectural, make every model call record who triggered it, what it cost and which feature it served. This is a few columns and it immediately answers the questions you cannot currently answer. Do it even if you change nothing else.'),

    h3('Step two: collapse provider calls into one adapter'),
    p('Find every place a provider SDK is imported and route them through a single module. This is mechanical, low-risk work that can be done incrementally, and it is the prerequisite for routing by task, which usually pays for the whole exercise in reduced running cost.'),

    h3('Step three: add validation at the write boundary'),
    p('Anywhere model output reaches your database, put a schema in front of it. Reject rather than coerce. You will discover how often output was malformed and being silently accepted, which is usually a more uncomfortable number than expected.'),

    h3('Step four: build the evaluation set'),
    p('Fifty real questions with labelled correct answers. Until this exists, every subsequent change is unmeasured. It is an afternoon of work and it converts "the answers seem better" into a number you can defend.'),

    h3('Step five: move long work onto a queue'),
    p('Last, because it is the largest change. By this point you have attribution, one adapter, validation and measurement, so the migration can be verified rather than hoped about.'),
    p('Notice that permissions are not on this list. If retrieval was built without a permission dimension, that is a reindex and it should be scheduled as its own project rather than smuggled into a refactor.'),
    img('retrofit-steps', 'Five matte markers ascending a clean stepped surface, the lowest edge-lit', 'Each step is independently useful. You do not need permission to start at step one.'),

    h2('When is an AI-first stack justified?'),
    p('It genuinely is, sometimes. Three cases:'),
    ol([
      '**The model is the product.** A research tool, an evaluation harness, something where the application shell is thin by design.',
      '**A throwaway prototype with a decision attached.** Building the wrong thing quickly to learn something specific is legitimate, as long as everyone agrees it is disposable.',
      '**Research and experimentation**, where the point is exploring behaviour rather than shipping to customers.',
    ]),
    p('The failure is not choosing AI-first. It is choosing AI-first for a customer-facing product and then discovering the requirements were never optional.'),
    quote('Nobody has ever regretted having auth, a job queue and error tracking already in place. Plenty of teams have regretted adding them after the fact.'),

    h2('Conclusion'),
    p('The summary is unfashionable: an AI product is mostly a normal product. The parts that determine whether it survives contact with real customers — permissions, data modelling, metering, reliability, observability — are the same parts that have always determined that, and none of them get easier because a model is involved.'),
    p('Build the application first. Give it auth, a real schema, billing, a queue, monitoring and a staging environment. Then add the AI capability as one service behind one interface, with validation between the model and your data, and routing by task rather than by preference.'),
    p('That ordering costs a little at the start and it is the difference between a feature you can change and one you eventually replace. It is also why [my AI work](/services) is priced as application engineering with an AI module, not as a separate category — because architecturally, that is exactly what it is.'),
    p('If you are evaluating quotes for an AI feature, this is a useful thing to ask about directly. Ask where the model sits relative to the database, and what stands between them. Ask what happens to the codebase when the provider changes. Ask whether permissions are enforced in retrieval or after it. The answers separate people who have run one of these in production from people who have demoed one, and that distinction is worth more than any comparison of model choices.'),
  ),
  faqs: faq([
    ['What does "AI as a module" actually mean?',
     'The application is a conventional web app with auth, a database, billing and background jobs. The AI capability is one service inside it, behind a typed interface. Everything that makes software maintainable stays exactly where it was, and the model is a dependency rather than a foundation.'],
    ['Why not build AI-first?',
     'Because the hard parts of a product remain permissions, billing, data modelling and reliability. An architecture organised around the model treats those as afterthoughts, and retrofitting them, particularly permissions inside a retrieval layer, costs far more than building them first.'],
    ['How do you swap AI providers without a rewrite?',
     'Keep provider calls behind one adapter that normalises message format, tool calls, streaming events and errors. Prompts and validation stay provider-agnostic. Swapping then touches one file instead of every feature, which matters given how quickly pricing and capability change.'],
    ['Does building this way slow the project down?',
     'Slightly at the start, considerably faster after the first change request. The foundation is reusable across projects, whereas an AI-first prototype usually is not reusable at all. On a 19-day MVP, five days of application shell made the six days of AI layer possible.'],
  ]),
};
