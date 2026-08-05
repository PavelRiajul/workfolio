import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/streaming-ai-ui/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-streaming-ai-ui',
  slug: 'streaming-ai-ui',
  title: 'Streaming AI Responses Without Thrashing Your UI',
  category: 'ai',
  order: 16,
  readTime: '11 min read',
  date: 'December 2025',
  publishedAt: '2025-12-05',
  series: 'AI architecture',
  excerpt:
    'Token streaming that stays smooth: batching updates, avoiding layout shift, and handling a dropped connection mid-answer.',
  coverLabel: 'Streaming UI — cover',
  body: body(
    p('Streaming makes an AI feature feel fast even when it is not. A response that takes eight seconds to complete but starts appearing in four hundred milliseconds reads as responsive; the same response delivered whole after eight seconds reads as broken.'),
    p('It is also where a lot of otherwise good AI features feel cheap. The text stutters, the page jumps as the answer grows, the scroll position fights the user, and a dropped connection leaves half an answer on screen with no indication anything went wrong.'),
    p('All of those are solvable, and none of the fixes are about the model.'),

    h2('Why does streaming feel janky?'),
    p('Almost always one state update per token. It is the obvious implementation and it is the wrong one.'),
    p('A model producing sixty tokens a second, wired naively into React state, triggers sixty re-renders a second of a component whose content grows every time. Each render reconciles a progressively larger string. The frame budget is 16 milliseconds and reconciliation alone eats it well before the browser attempts to paint.'),
    p('The symptom is text that arrives in visible lurches rather than flowing, and input elsewhere on the page becoming unresponsive while the answer generates. On a mid-range Android phone it is dramatic; on a fast laptop it is subtle enough that people ship it.'),
    img('render-thrash', 'A stuttering sequence of frames beside a smooth continuous one', 'Sixty state updates a second against a sixty-frame budget. Something has to give.'),

    h2('How do you batch tokens correctly?'),
    p('Buffer incoming tokens in a ref and flush once per animation frame. The network delivers at whatever rate it delivers; the UI updates at the rate the display can actually show.'),
    code('ts', `
const buffer = useRef('');
const frame = useRef<number | null>(null);

function onToken(chunk: string) {
  buffer.current += chunk;
  // One scheduled flush at a time, regardless of token rate.
  if (frame.current !== null) return;
  frame.current = requestAnimationFrame(() => {
    frame.current = null;
    setText((prev) => prev + buffer.current);
    buffer.current = '';
  });
}
`),
    p('This decouples the two rates entirely. At sixty tokens a second you get sixty updates; at six hundred you still get sixty, and the extra tokens simply arrive in larger batches. Nothing is dropped, and the component never renders more often than the screen refreshes.'),
    p('The `frame.current` guard is the part people omit. Without it, every token schedules its own frame callback and you are back where you started, with the additional overhead of the scheduling.'),

    h2('Should you stream at the character or sentence level?'),
    p('Depends on what the answer looks like, and it is worth deciding deliberately rather than defaulting.'),

    h3('Token batching, flushed per frame'),
    p('The default, and correct for conversational answers. Text appears at a natural reading pace and the user can start reading immediately. This is what most people mean by streaming.'),

    h3('Sentence boundaries'),
    p('Better for long-form structured answers. Holding until a sentence completes avoids showing half-formed clauses that change meaning as they finish, which is distracting when the reader is skimming for a conclusion.'),
    p('The cost is a slower first paint, so it is the wrong choice for short answers where the whole response is two sentences.'),

    h3('Block boundaries for structured output'),
    p('When the model is producing markdown with headings, lists and code, streaming raw tokens shows the syntax before it renders. Buffering until a block closes avoids displaying a half-written code fence, which looks like a bug rather than progress.'),
    table('Streaming granularity compared', [
      ['Approach', 'First paint', 'Smoothness', 'Use for'],
      ['One update per token', 'Fast', 'Poor', 'Never in production'],
      ['Batched per frame', 'Fast', 'Good', 'Conversational answers'],
      ['Sentence boundary', 'Slower', 'Very good', 'Long-form prose'],
      ['Block boundary', 'Slowest', 'Very good', 'Markdown and code'],
    ]),

    h2('How do you stop the page jumping?'),
    p('Layout shift during streaming is the most visible quality difference between a polished AI feature and a rushed one, and it is entirely avoidable.'),

    h3('Never let surrounding content reflow'),
    p('Anything below the answer — related questions, sources, action buttons — will be pushed down on every flush if it sits in normal flow. Either position it above, or reserve space so it does not move as the answer grows.'),

    h3('Anchor the scroll only when already at the bottom'),
    p('Auto-scrolling as text arrives is helpful when the user is following along and infuriating when they have scrolled up to re-read something. Track whether they are near the bottom and only follow when they are.'),
    p('The threshold matters: within roughly a hundred pixels of the bottom counts as following. An exact check fails the moment the user nudges the scroll by a few pixels.'),

    h3('Reserve space for what you know is coming'),
    p('If every answer ends with citations, the citation area can exist from the start at its eventual height. The alternative is a jump at the moment the answer completes, which is the most jarring possible timing because the user has just started reading.'),
    img('layout-shift', 'A growing panel with surrounding elements holding position', 'The answer grows. Nothing else moves. That is the whole requirement.'),

    h2('What should happen before the first token?'),
    p('Something, immediately. The gap between submitting and the first token is where users decide whether the feature works, and on a retrieval-backed answer that gap can be well over a second.'),
    p('A skeleton or a pulsing indicator is enough, but a more useful pattern is showing the retrieval step explicitly — "searching your documents", then "found 5 sources", then the answer. It fills the time with information rather than decoration, and it makes the eventual citations feel earned rather than decorative.'),
    p('This is worth building even though it is not strictly necessary, because it converts dead time into an explanation of what the system is doing. Users who understand that a search happened trust the answer more than users who watched a spinner.'),

    h2('What happens when the connection drops?'),
    p('It will, particularly on mobile, and the default behaviour is the worst possible one: a truncated answer sitting on screen looking complete.'),
    p('Decide deliberately between two options and implement one properly. **Restarting** is simpler — discard the partial answer, show a clear error, offer a retry. **Resuming** requires the server to buffer the full response as it generates so a reconnecting client can request everything after byte N.'),
    p('For most products restarting is correct. Resuming is worth the complexity only when answers are long enough that discarding one is genuinely costly, and it requires the generation to be running server-side in a job rather than being driven by the request.'),
    p('What is not acceptable is silence. A partial answer with no indication it is partial will be read as a complete answer, and the user will act on it. This is the failure that matters most in a research or support context, where the missing half of the answer is frequently the qualification that changes what someone does.'),
    p('There is also a cost dimension people miss. A dropped connection at token three hundred has already been paid for in full — the provider generated those tokens whether or not the client received them. Systems that silently restart on failure can double or triple the cost of an answer without any of it appearing as an error, which is exactly the pattern that surfaces later as an unexplained spend increase.'),

    h3('Detect the drop, do not wait for a timeout'),
    p('A stream that stops delivering is not the same as one that closed. Track time since the last token and treat an unusually long gap as a failure, because a silently stalled connection can hang for the full socket timeout otherwise — which is often minutes.'),

    h2('How do you cancel a running generation?'),
    p('An `AbortController` on the client stops the rendering, and by itself it does not stop the spend. The request continues generating on the provider unless the server also aborts.'),
    p('Propagate cancellation all the way through: client abort signals the server, server aborts the provider call. Without that last hop, a user who navigates away has cancelled the display and paid for the full answer, which shows up in [per-user cost logging](/blog/ai-cost-logging) as spend with no corresponding answer.'),
    p('Cancel on the obvious triggers — navigation, an explicit stop button, submitting a new question. The stop button is worth including even if rarely used; its presence makes a long generation feel controlled rather than something happening to the user.'),
    img('cancellation', 'A signal travelling from one end of a chain to the far end, halting flow at the source', 'Cancelling the display is not cancelling the spend. The signal has to reach the provider.'),

    h2('Should long jobs stream at all?'),
    p('Past about thirty seconds, no. Move to a job queue with a status endpoint.'),
    p('Holding a streaming connection open for minutes fails in ways that are miserable to debug. Proxies and load balancers close idle-looking connections. Serverless functions hit execution limits regardless of whether data is flowing. Mobile clients lose the connection on network handover between wifi and cellular.'),
    p('The alternative is straightforward: the request enqueues a job and returns an id, the client polls or subscribes for status, and the result is fetched when ready. This is [the same job queue every AI feature already needs](/blog/ai-is-a-module-not-a-stack) for indexing and batch work, so it is rarely new infrastructure.'),
    table('Streaming versus queued, by duration', [
      ['Duration', 'Approach', 'Why'],
      ['Under 30 seconds', 'Stream directly', 'Simple, and the connection holds'],
      ['30 seconds to minutes', 'Queue plus polling', 'Connections do not survive'],
      ['Minutes to hours', 'Queue plus notification', 'Nobody waits on a page'],
    ]),

    h2('How do you handle errors mid-stream?'),
    p('An error after two hundred tokens is harder than an error before any, because there is already content on screen the user has begun reading.'),
    p('The rule is that partial content is either clearly marked as incomplete or removed. Leaving it unmarked is the failure. A short inline notice at the end — that the answer was interrupted, with a retry — is usually better than discarding text the user has already read.'),
    p('Errors also need to reach your error tracking with the partial output attached. A mid-stream failure that only surfaces as a client-side message is invisible in monitoring, and these tend to cluster around particular inputs rather than occurring randomly.'),

    h2('What transport should you use?'),
    p('Three realistic options, and the choice is less about capability than about what your infrastructure will tolerate.'),

    h3('Server-sent events'),
    p('The default for this, and the one I reach for. It is one-directional, which matches the problem exactly, it runs over ordinary HTTP so proxies and CDNs understand it, and browsers reconnect automatically. The main limitation is that it is text-only, which is rarely a constraint for token streaming.'),
    p('The practical gotcha is buffering. Some proxies and hosting layers buffer responses by default, which holds the entire stream until it completes and produces the exact behaviour you were trying to avoid. Disabling buffering for the streaming route is a one-line config change that is easy to forget and confusing to debug.'),

    h3('Chunked fetch with a reader'),
    p('Reading directly from the response body gives you full control over parsing and works identically across environments. Slightly more code than server-sent events, and no automatic reconnection, but no protocol assumptions either. This is the pragmatic choice when the response mixes tokens with structured metadata.'),

    h3('WebSockets'),
    p('Genuine bidirectional communication, and usually more than this problem needs. Worth it when the same connection carries other real-time traffic — presence, collaborative editing, live updates — because then the connection already exists. Standing one up solely to stream tokens is additional infrastructure for no benefit.'),
    img('transports', 'Three channels of differing complexity connecting two points', 'Server-sent events fit the shape of the problem. The other two are for when something else already justifies them.'),

    h2('What should the server send besides tokens?'),
    p('More than most implementations do. A stream carrying only text forces the client to infer everything else, and inference is where the fragile behaviour comes from.'),
    p('Send typed events. A `status` event for retrieval progress, `token` events for content, a `sources` event when citations resolve, a `done` event carrying usage and cost, and an `error` event that arrives as data rather than as a broken connection.'),
    p('The `done` event is the one worth insisting on. Without an explicit completion signal, the client cannot distinguish a finished answer from a dropped connection — the stream simply stops in both cases. That single event removes an entire class of ambiguity, and it is where the token counts for cost logging naturally arrive.'),
    code('ts', `
// Typed events, so the client never has to guess what happened.
data: {"type":"status","stage":"retrieving"}
data: {"type":"status","stage":"found","sources":5}
data: {"type":"token","text":"The "}
data: {"type":"sources","items":[...]}
data: {"type":"done","inputTokens":4210,"outputTokens":388}
`),
    img('typed-events', 'A sequence of differently shaped markers travelling along one channel', 'One channel, several event types. The completion signal is the important one.'),

    h2('How do you test a streaming endpoint?'),
    p('Three layers, none of which require calling a real model on every run.'),

    h3('A fake stream with controllable timing'),
    p('Most of the interesting behaviour — batching, scroll anchoring, cancellation, error handling — is testable against a stub that emits tokens on a schedule you control. This is where the majority of the coverage should live, because it is fast and deterministic.'),

    h3('Deliberate failure injection'),
    p('Drop the connection at token fifty. Stall for thirty seconds mid-stream. Emit a malformed chunk. These are the paths that break in production and they never occur during manual testing, because manual testing happens on a good connection.'),

    h3('One real end-to-end test'),
    p('A single test against an actual provider confirms the wiring is correct. Keep it out of the fast suite; it is slow and it costs money on every run.'),
    quote('The bugs in streaming are almost never in the happy path. They are in the drop, the stall, the cancel and the error — none of which occur while you are building it.'),

    h2('What does this look like on a phone?'),
    p('Worse than on your laptop, which is where most of this work is done and none of it is felt.'),
    p('Mid-range Android devices have considerably less headroom, so per-token re-rendering that is merely suboptimal on a laptop becomes visibly broken. Network handover between wifi and cellular drops connections mid-answer routinely. And the on-screen keyboard resizing the viewport while an answer streams is a layout-shift scenario that simply does not exist on desktop.'),
    p('Test on a real mid-range device, on cellular, with the keyboard open. This is the same discipline as [the rest of the mobile work on this site](/stack), where the layouts were audited on an actual 375px screen rather than a simulated one.'),

    h2('What about accessibility?'),
    p('Streaming text is genuinely hostile to screen readers if you do nothing, and this is the part of the feature most likely to be skipped entirely.'),
    p('A naive implementation inside an assertive live region announces every flush, which means the reader interrupts itself sixty times a second and the user hears fragments. Marking the container `aria-live="polite"` and `aria-atomic="false"` helps, but the reliable approach is not to announce the stream at all — announce that a response is generating, then announce the completed answer once, on the `done` event.'),
    p('The visible streaming remains for sighted users; the assistive experience becomes a single coherent announcement rather than a stutter. Both are better than the compromise where each partial update fights the last.'),
    p('The same reasoning applies to `prefers-reduced-motion`. Any cursor blink or fade-in on arriving text is a looping animation, and [it has to be named explicitly in the reduced-motion block](/blog/building-with-ai-workflow) — `animation` does not inherit, so disabling it on a parent does not reach a caret inside the streamed content.'),
    img('accessibility', 'A single clear announcement marker beside a cluster of fragmented ones', 'Announce once on completion, not sixty times a second.'),

    h2('Conclusion'),
    p('Streaming is mostly an exercise in decoupling rates. The model produces tokens at its rate, the network delivers them at another, and the display updates at sixty frames a second regardless of either. Buffer between them and most of the jank disappears.'),
    p('Then handle the paths that only occur in production: the dropped connection, the stall, the cancellation that has to reach the provider, and the error arriving after the user has already started reading. Each of those is a small piece of work and each is the difference between a feature that feels considered and one that feels like a demo.'),
    p('And past thirty seconds, stop streaming entirely. A job queue with a status endpoint is less work than making a long-lived connection survive proxies, function timeouts and a phone changing networks — and unlike streaming, it still works when the user closes the tab.'),
    p('If you are retrofitting this onto something already shipped, the order that gets the most improvement soonest is: batch the token updates first, because it is twenty lines and it fixes the most visible problem; then add the explicit completion event, because it removes the ambiguity every other error path depends on; then fix the layout shift; then propagate cancellation to the provider. The accessibility and transport work can follow, and neither is urgent if the first four are done.'),
  ),
  faqs: faq([
    ['Why does my streaming AI response feel janky?',
     'Almost always one React state update per token. At sixty tokens a second that is sixty re-renders a second of continuously growing text, which exceeds the frame budget before the browser paints. Buffer tokens in a ref and flush once per animation frame.'],
    ['How do you avoid layout shift while text streams in?',
     'Never let content below the answer sit in normal flow where it will be pushed down on every update. Reserve space for elements you know are coming, such as citations, and anchor scroll to the bottom only while the user is already near the bottom.'],
    ['What happens if the connection drops mid-answer?',
     'Choose deliberately between restarting and resuming. Restarting is simpler and usually correct; resuming needs the server to buffer the full response. The unacceptable option is leaving a truncated answer on screen unmarked, because it will be read as complete.'],
    ['Should long AI jobs stream at all?',
     'Past roughly thirty seconds, no. Move to a job queue with a status endpoint. Long-lived connections are closed by proxies, hit serverless execution limits, and drop when a phone switches between wifi and cellular.'],
  ]),
};
