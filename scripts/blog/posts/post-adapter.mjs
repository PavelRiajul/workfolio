import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/provider-agnostic-ai-sdk/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-provider-agnostic-ai-sdk',
  slug: 'provider-agnostic-ai-sdk',
  title: 'Provider-Agnostic AI: Swapping Models Without a Rewrite',
  category: 'ai',
  order: 18,
  readTime: '12 min read',
  date: 'December 2025',
  publishedAt: '2025-12-10',
  series: 'AI architecture',
  excerpt:
    'The adapter layer that let a production app move between Claude, GPT and Groq by changing one file — and the four things it has to normalise.',
  coverLabel: 'Provider adapter — cover',
  body: body(
    p('Provider lock-in in an AI feature does not arrive as a decision. It accumulates. One file imports the SDK directly because it is the fastest way to ship, then a second, then error handling gets written against one provider\'s exception types, and by the fourth feature the cost of switching is a fortnight nobody has.'),
    p('That matters more here than in most integrations because the ground moves quickly. Prices change, context windows grow, a model that was clearly best six months ago is now merely adequate, and a cheaper option appears that is entirely sufficient for two of your five call sites.'),
    p('The fix is small — usually a few hundred lines — and it has to exist before you need it. This is one of the six components that define [Template 04 in my stack](/stack), and it is the one that pays for itself most reliably.'),

    h2('What actually differs between providers?'),
    p('Less than the SDKs suggest, and in four specific places. Knowing which four is most of the work, because everything else is genuinely similar enough to ignore.'),
    table('What varies, and what to normalise it to', [
      ['Surface', 'Varies by provider', 'Normalise to'],
      ['Message format', 'Yes — roles, system prompts, content shapes', 'One internal message type'],
      ['Tool calls', 'Significantly', 'Zod-validated arguments'],
      ['Streaming events', 'Yes — event names and payloads', 'One event union'],
      ['Errors and retries', 'Yes — types, codes, retry-after headers', 'Typed error classes'],
      ['Token accounting', 'Yes — field names and timing', 'Cost in your own units'],
    ]),
    p('Notice what is not on that list. Prompts are portable. Temperature and top-p mean approximately the same thing everywhere. Streaming as a concept is universal. The differences are concentrated in the plumbing, which is exactly the kind of thing an adapter is good at hiding.'),
    img('four-surfaces', 'Four differently shaped connectors converging into one standard socket', 'Four surfaces differ. Everything else is portable, which is why the adapter stays small.'),

    h2('What does the interface look like?'),
    p('Define it in your domain language, not the provider\'s. The rest of the application should ask for what it wants, not for a chat completion.'),
    code('ts', `
export interface CompletionService {
  complete(input: CompletionInput): Promise<CompletionResult>;
  stream(input: CompletionInput): AsyncIterable<StreamEvent>;
}

export interface CompletionInput {
  messages: Message[];
  tools?: ToolDefinition[];        // Zod schemas, provider-neutral
  maxTokens?: number;
  temperature?: number;
  task: TaskKind;                  // what this call is FOR — drives routing
}

export type StreamEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_call'; name: string; args: unknown }
  | { type: 'done'; usage: Usage }
  | { type: 'error'; error: ProviderError };
`),
    p('The `task` field is the one people leave out and it is the most valuable. It carries intent — reranking, classification, generation, extraction — which is what lets the adapter route intelligently rather than sending everything to a default. Without it, routing decisions have to be made at every call site, which defeats the purpose.'),
    p('The `StreamEvent` union is the second thing worth getting right. A discriminated union means the consumer handles four cases exhaustively and the compiler complains when a new one appears, which is considerably safer than a stream of untyped chunks.'),

    h2('How do you normalise tool calls?'),
    p('This is the surface that differs most and the one where a leaky abstraction hurts most, because tool calls are where the model touches your data.'),
    p('Define tools as Zod schemas on your side. Generate the provider-specific JSON schema from them at call time. When arguments come back, parse them with the same Zod schema regardless of which provider produced them.'),
    p('That gives you one definition, one validation path, and identical behaviour across providers. It also means [the validation layer](/blog/validating-llm-tool-calls-zod) is written once rather than per provider, which matters because that layer is what stands between a malformed call and your database.'),
    p('The awkward part is that providers differ in how many tool calls they will emit at once and how they represent parallel calls. Normalise to an array always — a single call becomes an array of one — so consumers never branch on provider behaviour.'),

    h2('How do you normalise streaming?'),
    p('Every provider streams, and every provider names its events differently. Some emit content deltas, some emit whole message objects with a delta inside, some interleave tool-call fragments that must be accumulated before they parse.'),
    p('The adapter\'s job is to absorb all of that and emit the union above. Consumers should never see a provider-shaped event, and in particular should never accumulate partial tool-call JSON — that reassembly belongs in the adapter, where it is written once and tested once.'),
    p('One detail that repeatedly causes trouble: providers differ on whether usage figures arrive with the final event or require a separate lookup. Normalise so the `done` event always carries usage, even if the adapter has to compute it. Downstream [cost logging](/blog/ai-cost-logging) depends on it being reliably present.'),
    img('stream-normalisation', 'Several irregular input streams resolving into one regular output sequence', 'Reassembly belongs in the adapter. Consumers see one event shape.'),

    h2('How do you handle errors consistently?'),
    p('Providers signal the same conditions with different types, codes and headers. Map them to a small set of typed errors that describe what happened rather than which vendor said it.'),
    ul([
      '**RateLimited** — carries a retry-after when the provider supplies one. Retryable with backoff.',
      '**ContextTooLong** — the input exceeded the window. Not retryable; the caller must shorten.',
      '**ContentFiltered** — the provider refused. Not retryable, and it needs a distinct user-facing message.',
      '**ProviderUnavailable** — a 5xx or a timeout. Retryable, and the trigger for failover if you have it.',
      '**InvalidRequest** — a bug on your side. Not retryable, and it should page someone.',
    ]),
    p('The retryable/not-retryable distinction is the one that earns its keep. Retrying a context-length error wastes money and time and will never succeed; failing to retry a rate limit loses a request that would have worked in two hundred milliseconds.'),
    p('Each of these also needs a distinct user-facing consequence, and mapping them once in the adapter means every feature gets that behaviour for free. A rate limit should be invisible — retried and served. A context-length error should tell the user their input was too long, ideally with a suggestion. A content filter refusal needs wording that does not imply the system is broken, because it is not.'),
    p('Getting this wrong produces the most common bad AI user experience: a generic "something went wrong" for five genuinely different situations, three of which the user could have resolved themselves if told what happened.'),

    h2('How do you route by task?'),
    p('This is where the adapter stops being insurance and starts paying rent, usually taking a third off the bill.'),
    code('ts', `
// One place decides. No call site knows which provider ran.
const ROUTING: Record<TaskKind, Provider> = {
  rerank:     groq,        // latency-critical, no reasoning needed
  classify:   groq,        // short, high volume, cheap
  generate:   anthropic,   // reasoning quality is visible here
  extract:    anthropic,   // structured output, correctness matters
  summarise:  openai,      // whichever measures best this quarter
};
`),
    p('Reranking twenty retrieved passages is a comparison task with no reasoning in it, and it happens on every single query. Sending that to a frontier model is the most common avoidable line on an AI invoice. Generation, where reasoning quality is directly visible in the answer, is worth paying for.'),
    p('Because routing lives in one map, changing it is a one-line change reviewable in a pull request, and it can be measured — run the evaluation set before and after and you know whether the cheaper route cost you anything.'),
    p('The measurement is what makes this safe to do aggressively. The intuition that a cheaper model must produce worse results is often wrong for narrow tasks: reranking is a comparison problem where a fast model performs indistinguishably, and classification into five known categories is not where frontier reasoning shows. Without an evaluation set you are guessing, and the guess usually errs toward overpaying.'),
    p('Route in the other direction too. If the evaluation set shows a cheaper model failing on extraction, that is a reason to route extraction upward rather than to accept degraded output. The point of the map is that both moves cost the same one line.'),

    h2('When should you fail over automatically?'),
    p('Rarely, and deliberately. Automatic failover sounds like resilience and frequently produces surprise.'),

    h3('Failover is safe for stateless, idempotent calls'),
    p('Reranking or classification can retry against a second provider with no consequence beyond latency. If the primary is down, using the backup is strictly better than failing.'),

    h3('Failover is dangerous for tool-calling flows'),
    p('If the first provider already emitted a tool call that executed, retrying against another provider may execute it again. Idempotency keys protect you here, and without them failover is a duplication bug waiting for an outage to trigger it.'),

    h3('Failover changes output quality silently'),
    p('A user who gets a noticeably worse answer during a provider incident has no way to know why, and neither does your support team unless the fallback is logged. Record which provider served each call — it belongs in the same table as cost.'),
    p('My default is failover for the cheap stateless tasks and a clear error for generation, on the grounds that a visible failure is easier to reason about than a quietly degraded answer.'),
    img('failover', 'A primary path blocked with a secondary path engaging, one branch marked', 'Failover is right for stateless work and risky anywhere a tool call already ran.'),

    h2('How do you handle retries and backoff?'),
    p('Retries belong in the adapter, not at the call sites, because every call site would otherwise implement them slightly differently and none would get the details right.'),

    h3('Exponential backoff with jitter'),
    p('Doubling delays without jitter produces synchronised retry storms — every failed request retries at the same instant, hits the same limit, and fails together. Adding randomness spreads them out, and it is the difference between recovering from a rate limit and extending it.'),

    h3('Respect retry-after when it is given'),
    p('Providers frequently tell you exactly when to come back. Ignoring that header in favour of your own backoff curve is both slower and more likely to fail again, and it is a common oversight because the header is easy to miss in the error object.'),

    h3('Cap total attempts and total time'),
    p('Three attempts and a hard ceiling on elapsed time. A request that has been retrying for thirty seconds has almost certainly lost its user, and continuing to spend on it helps nobody. The ceiling matters more than the attempt count, because a slow provider can blow the time budget in two tries.'),

    h3('Never retry a terminal error'),
    p('This is why the typed error classes exist. Retrying a context-length error or a content filter refusal wastes money and cannot succeed. The classification is what makes automatic retry safe to apply everywhere.'),
    img('retry-curve', 'A stepped sequence of increasing gaps with slight irregularity between them', 'Backoff with jitter, capped by elapsed time rather than attempt count.'),

    h2('Where does the adapter sit in the stack?'),
    p('Below your services and above the SDKs, and it should be the only place a provider package is imported. That constraint is worth enforcing with a lint rule rather than a convention, because the fastest path when shipping a feature is always to import the SDK directly.'),
    p('Above it sit the domain services — a `SearchService`, an `AnswerService`, an `ExtractionService`. Those own prompts, retrieval and business rules. They call the adapter for completions and know nothing about which provider ran or how the response was shaped.'),
    p('Below it sit the provider packages themselves. Each provider implementation is one file, and adding a new provider means writing one more file that satisfies the same interface and passes the same contract suite. Nothing above the adapter changes.'),
    p('That layering is also what makes [the whole AI capability a module rather than an architecture](/blog/ai-is-a-module-not-a-stack). The application depends on your interface, and your interface happens to be implemented by somebody else\'s API.'),
    img('layering', 'Three horizontal bands with one narrow band between two larger ones', 'One layer, one import boundary. Enforce it with a lint rule, not a convention.'),

    h2('What about provider-specific features?'),
    p('Keep an escape hatch and accept it is not portable. The abstraction is not meant to be pure; it is meant to make the common case swappable.'),
    p('Prompt caching, extended thinking modes, structured output enforcement, very long context windows — these differ genuinely and sometimes matter enough to use directly. Expose them through an optional field the adapter passes through, and document that any call site using it is pinned to one provider.'),
    p('The discipline is that such call sites should be few and identifiable. If half your features use provider-specific capabilities, you do not have an adapter, you have an indirection layer that costs maintenance and provides nothing.'),

    h2('How do you test it?'),
    p('Run the same suite against at least two providers in continuous integration. This is the only thing that keeps the abstraction honest.'),

    h3('The contract suite'),
    p('One set of tests, parameterised over providers. Every adapter must produce the same event sequence, the same typed errors, the same normalised tool-call shape and the same usage figures for equivalent input.'),
    p('Divergence then appears as a failing build rather than as a discovery on the day you need to switch. Without this, an adapter quietly accumulates assumptions about whichever provider you use daily, and those assumptions are invisible until they break.'),

    h3('Recorded fixtures for the fast suite'),
    p('Record real provider responses once and replay them. This gives deterministic tests covering the parsing and normalisation logic without cost or network flakiness, and it is where the bulk of the coverage should live.'),

    h3('A small live suite'),
    p('A handful of tests that genuinely call each provider, run on a schedule rather than on every commit. These catch the case where a provider changes its response shape without announcing it, which does happen.'),
    quote('An adapter you have never run against a second provider is not an abstraction. It is a wrapper with aspirations.'),

    h2('What does this cost to build?'),
    p('For two providers, roughly two to three days including the contract suite. Adding a third afterwards is typically half a day, because the interface has already absorbed the variability.'),
    p('Set against that: the last time I moved a production feature between providers, the change was one routing map and a configuration value, and it took under an hour including running the evaluation set to confirm quality had not moved. Without the adapter that same change touches every call site, every error handler and every streaming consumer.'),
    p('It is also what makes cost routing possible at all, and cost routing alone has paid for the adapter on every project where I have measured it.'),
    p('There is a second, less obvious return. Because every call passes through one place, the adapter is the natural home for cross-cutting concerns that would otherwise be scattered: usage logging, latency tracking, the per-user spend ceiling, and the rate limiter. Each of those is written once and applies to every feature automatically, including features written after it.'),
    p('That consolidation is worth as much as the swappability. A cost ceiling implemented at four call sites will be missing from the fifth, and it will be missing quietly, which is exactly the failure mode the ceiling existed to prevent.'),

    h2('Is this over-engineering for a small project?'),
    p('It is a fair question, and the honest answer is that it depends on how many call sites you have rather than on how big the project is.'),
    p('With one AI call in the entire application, an adapter is genuinely unnecessary — swapping providers means editing one file either way. The threshold is around three or four call sites, which most features reach quickly once retrieval, generation and classification are separate steps.'),
    p('The other consideration is timing. Building it up front costs two days. Retrofitting it across a codebase where provider calls have spread costs considerably more and tends to happen under pressure, because the trigger is usually a price change or an outage.'),
    img('threshold', 'A single connection beside a bundle of several, one routed through a hub', 'One call site needs no adapter. Four do, and most features reach four quickly.'),

    h2('Conclusion'),
    p('Normalise four things: messages, tool calls, streaming events and errors. Define the interface in your domain language with a `task` field carrying intent. Validate tool arguments with Zod on your side of the boundary. Map provider errors to typed classes that distinguish retryable from terminal.'),
    p('Then route by task rather than by preference, keep an escape hatch for genuinely provider-specific features, and run one contract suite against two providers in CI so the abstraction stays real.'),
    p('That is two or three days of work that makes a provider change an afternoon instead of a fortnight, and it usually pays for itself through routing before it is ever needed for switching. Given how fast pricing and capability move, being able to act on a better option quickly is worth considerably more than the abstraction costs.'),
    p('If you already have provider calls spread across a codebase, the migration is mechanical rather than difficult. Add the interface, implement one adapter for the provider you currently use, then move call sites to it one at a time — each move is independently shippable and independently reversible. Add the second provider and the contract suite last, once the interface has stopped changing shape.'),
  ),
  faqs: faq([
    ['Is a provider-agnostic layer worth the effort?',
     'Past three or four call sites, yes. It is usually a few hundred lines and two to three days including tests. Prices, limits and model quality move quickly, and being able to switch in an afternoon is worth far more than the abstraction costs.'],
    ['Does abstraction cost you provider-specific features?',
     'Some. Keep an escape hatch for genuinely unique capabilities like prompt caching or extended thinking, and accept those call sites are pinned to one provider. Keep them few and identifiable, or the abstraction stops providing anything.'],
    ['How do you route between models?',
     'By task. Latency-sensitive work with no reasoning, such as reranking and classification, goes to a fast cheap model. Complex reasoning goes to a frontier model. Routing by task rather than by default preference usually takes about a third off the bill.'],
    ['How do you test a provider-agnostic layer?',
     'Run one contract suite against at least two providers in CI, asserting identical event sequences, typed errors and usage figures. Divergence then shows up as a failing build rather than as a surprise on the day you need to switch.'],
  ]),
};
