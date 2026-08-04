import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ai-booking-system-guide/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ai-booking-system-guide',
  slug: 'ai-booking-system-guide',
  title: 'AI Booking Systems for Clinics, Salons and Trades',
  category: 'ai',
  order: 14,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-04',
  series: 'Booking',
  excerpt:
    'A booking assistant that checks real availability and books the slot — and the architecture rule that stops it double-booking your calendar.',
  coverLabel: 'AI booking — cover',
  body: body(
    p('Most booking friction is not the calendar. It is that booking happens at nine in the evening, on a phone, when nobody is answering the shop line, and the alternative is a form with eleven fields.'),
    p('A conversational booking system removes that gap. The customer messages on WhatsApp or the website chat, describes what they want in plain language, and leaves with a confirmed slot. No app, no account, no form.'),
    p('It is also the AI feature where getting the architecture wrong is most visible, because the failure mode is two people arriving for the same appointment. This is how I build them, and the one rule that everything else follows from.'),

    h2('What does an AI booking system actually do?'),
    p('It handles the conversation and nothing else. The customer says "any chance of a cut on Thursday after work"; the assistant works out that this means a specific service, a date, and a time window, checks what is genuinely free, offers two or three options, and confirms one.'),
    p('Around that sit the unglamorous parts that make it usable: a confirmation message, a reminder the day before, an alert to the owner, and a path to a human the moment the conversation stops making sense.'),
    p('What it does not do is decide whether a slot is available, or write the booking. Those belong to a scheduling engine, for reasons that become obvious the first time two people message at once.'),
    img('conversation-to-slot', 'A speech bubble connected by a fine line to a single highlighted slot in a calendar grid', 'The model turns language into an intent. The scheduler decides whether that intent is possible.'),

    h2('Why should the model never touch the calendar?'),
    p('Because availability is a concurrency problem, and language models have no concept of a transaction.'),
    p('Consider two customers messaging simultaneously about the same Thursday slot. The model handling conversation A checks availability, sees the slot is free, and starts composing a friendly confirmation. In the same second, the model handling conversation B does exactly the same thing. Both confirm. One of those customers will arrive to find someone else in the chair.'),
    p('The scheduling engine solves this the way booking systems always have: the check and the write happen as one atomic operation, and the second one fails. That guarantee cannot be produced by a prompt, however carefully worded, because the model is not holding a lock — it is generating text.'),
    quote('Double-booking is a scheduling problem. It has never been a language problem, and no amount of prompt engineering converts one into the other.'),
    p('So the division is strict. The model proposes; [the scheduler decides and commits](/blog/validating-llm-tool-calls-zod). Every booking system I build enforces this at the service layer, where the model cannot reach around it.'),

    h2('Who owns what in a safe architecture?'),
    p('Five responsibilities, each with exactly one owner. Ambiguity here is where systems fail.'),
    table('Responsibility map for a conversational booking system', [
      ['Concern', 'Owner', 'Why it belongs there'],
      ['Understanding the request', 'The model', 'Natural language is what it is good at'],
      ['Real availability', 'Cal.com', 'Single source of truth, already correct'],
      ['Writing the booking', 'Service layer', 'Validated, permissioned, logged, atomic'],
      ['Confirmations and reminders', 'Messaging and email', 'Deliverability is its own discipline'],
      ['Conflict resolution', 'The scheduler', 'Never a language model'],
    ]),
    p('[Cal.com is the scheduling engine in my stack](/stack) for this. It already handles working hours, buffers between appointments, per-service durations, holidays, staff availability and timezone conversion — a list that looks small until you try to reimplement it and discover the fourteenth edge case.'),

    h2('How does the assistant know what is actually free?'),
    p('Through a tool call, and the order of the tools matters more than people expect.'),
    p('The assistant gets three: `list_services`, `check_availability` and `book_appointment`. The schema for `book_appointment` states explicitly that it books a slot already confirmed by `check_availability` and does not check availability itself. That one sentence in a field description prevents the model treating one tool as two.'),
    code('ts', `
const bookAppointment = z.object({
  serviceId: z.string().uuid()
    .describe('Must be an id returned by list_services in this conversation.'),
  startsAt: z.string().datetime()
    .describe('ISO-8601 UTC, and must be a slot returned by check_availability.'),
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(6).max(20),
  channel: z.enum(['web', 'whatsapp']),
});
`),
    p('Even with that, the service re-checks availability at commit time. The gap between offering a slot and the customer accepting it is often several minutes of conversation, which is ample time for somebody else to take it. Re-checking is cheap; apologising is not.'),
    p('The re-check also has to handle the case where the slot has gone. The wrong behaviour is an error message; the right one is to apologise briefly, offer the nearest alternatives, and continue the conversation. Customers accept "that one just went, I can do half past instead" without any friction at all. What they do not accept is being told the booking failed and left to start again.'),
    p('This is a good illustration of why the tools are shaped the way they are. Because availability is a separate call rather than something the model reasons about, the recovery path is ordinary application logic — fetch fresh options, present them — instead of an attempt to get a model to reason correctly about a race condition it cannot observe.'),

    h2('Where do customers actually book from?'),
    p('WhatsApp, overwhelmingly, in the markets where I have built these. There is no app to install, no password, and the conversation sits in a thread the customer already has open all day.'),

    h3('WhatsApp'),
    p('Highest conversion, and the most operational overhead: a Business API number, template messages approved in advance for anything you send proactively, and session-window rules that govern when you may message first. None of it is difficult, all of it is fiddly, and it is worth budgeting properly rather than assuming it is an afternoon.'),

    h3('On-site chat'),
    p('Lower friction to build, lower conversion. Useful for customers already browsing your services page and deciding in the moment. The same assistant and the same tools serve both channels — only the transport differs, which is why `channel` is on the schema.'),

    h3('The phone line you already have'),
    p('Worth saying plainly: if most bookings arrive by phone and somebody answers reliably, a chat assistant may add very little. The honest question is where the *missed* bookings are, and the answer is usually evenings and weekends.'),
    img('channels', 'Two messaging surfaces feeding into one shared assistant module', 'One assistant, one set of tools. The channel is a transport detail.'),

    h2('What happens when the conversation goes wrong?'),
    p('It will, and the design of this path matters more than the happy path, because the happy path is easy and this is where trust is lost.'),

    h3('Two clarifications, then a human'),
    p('If the assistant cannot resolve the request after two attempts to clarify, it hands off with the full transcript attached and tells the customer plainly that a person will follow up. It does not guess. A booking system that guesses is worse than one that asks.'),

    h3('Out-of-scope requests'),
    p('Customers ask about prices, parking, whether you take card, and whether the practitioner they like is in. Answer what you can from a small set of facts, and be explicit about what you cannot. Do not let the assistant improvise policy.'),

    h3('Cancellations and changes'),
    p('These need identity, which a chat thread only weakly provides. In practice the safest pattern is a link: the assistant recognises the intent and sends a management link tied to the booking, rather than mutating a booking on the strength of a phone number in a message.'),

    h2('What about confirmations, reminders and no-shows?'),
    p('The booking is not the deliverable. The customer turning up is.'),
    ul([
      '**Immediate confirmation** in the channel they booked from, with date, time, service and location. This is also the receipt they will search for later.',
      '**A reminder the day before**, which is where most of the no-show reduction comes from.',
      '**A short-notice reminder** a few hours ahead for services with high no-show rates.',
      '**An owner alert** on every booking, because most small businesses want to know immediately, not at end of day.',
    ]),
    p('Reminders go through the scheduling engine rather than the assistant. They are deterministic messages on a schedule, and there is nothing for a model to add — it would only introduce variance into a message that should be identical every time.'),

    h2('How do you keep it from saying something wrong?'),
    p('Constrain what it can know and what it can do.'),
    p('The assistant answers from a small, explicit set of facts: services, durations, prices, location, opening hours, policies. Not a general corpus, not the whole website. A short factual context is far more reliable than retrieval over marketing copy, and for most small businesses the entire fact set fits comfortably in the prompt.'),
    p('For anything outside that set, the correct behaviour is a clear "I do not have that — I can pass it to the team". Making refusal an explicit, named option rather than something the model must infer is what keeps it honest under pressure.'),
    img('fact-scope', 'A small tightly bounded panel of facts beside a much larger unbounded one', 'A short, explicit fact set beats retrieval over your whole site for this use case.'),

    h2('How do you model availability properly?'),
    p('This is where booking systems get genuinely hard, and it is entirely independent of the AI. Getting it wrong produces slots that are offered and then rejected, which reads to the customer as a broken system.'),

    h3('Duration is per service, not per slot'),
    p('A consultation is twenty minutes, a treatment is ninety. A calendar that thinks in fixed slots will either waste capacity or overbook. Duration has to come from the service record, and the assistant must resolve the service before it can meaningfully check availability — which is why `list_services` comes first in the tool order.'),

    h3('Buffers are not optional'),
    p('Cleanup, notes, turnaround between customers. A system that books back-to-back with no buffer will be abandoned within a week by the person actually doing the work. Buffers belong in the scheduling engine, configured once per service, not in the assistant\'s reasoning.'),

    h3('Staff availability is a second dimension'),
    p('Multi-practitioner businesses need availability that is the intersection of the service being offered, who can perform it, and when that person is working. Customers also have preferences — "with Sam if possible" — which the assistant should pass through as a constraint rather than silently ignore.'),

    h3('Timezones will catch you out'),
    p('Store and compute in UTC, display in the business\'s local zone, and never trust a time the model produced without an explicit offset. This is why the schema demands ISO-8601 with a zone rather than accepting anything that looks like a time.'),

    h3('Lead time and cut-offs'),
    p('Most businesses cannot accept a booking twenty minutes from now. A minimum lead time, and a cut-off after which same-day booking closes, are business rules that live in the service layer and are checked at commit — not hints in a prompt.'),
    img('availability-model', 'Three overlapping translucent layers resolving to a single highlighted region', 'Availability is the intersection of service, staff and working hours. The model consumes it; it never computes it.'),

    h2('What does the owner actually see?'),
    p('Less than people expect, deliberately. The best outcome is that the existing calendar simply fills up and the owner changes nothing about how they work.'),
    p('An alert per booking, in whatever channel they already read, is usually the entire interface. Bookings appear in the calendar they were already using, cancellations remove themselves, and nobody has to learn a dashboard.'),
    p('Where a dashboard does earn its place is the escalation queue — conversations the assistant handed off, sitting somewhere visible with the transcript attached. That is the one thing the existing calendar cannot show, and it is also the feedback loop: recurring escalations of the same kind tell you exactly which fact to add or which description to sharpen.'),
    img('owner-view', 'A calendar surface filling with entries beside a small alert card', 'The best interface is usually the calendar they already use, plus one alert.'),

    h2('What does it cost to build and run?'),
    p('Typically **$6,000–$14,000** to build, and **$80–$350 a month** to run. The build range is driven almost entirely by the integration surface rather than by the AI.'),
    table('Where the build cost sits', [
      ['Component', 'Share of build', 'Notes'],
      ['Messaging integration', 'Largest', 'Templates, session rules, delivery states'],
      ['Scheduling integration', 'Moderate', 'Services, durations, staff, buffers'],
      ['Assistant and tools', 'Moderate', 'Prompt, schemas, refusal path'],
      ['Confirmations and reminders', 'Small', 'Deterministic, but fiddly to get right'],
      ['Owner dashboard', 'Varies', 'Often the existing calendar is enough'],
    ]),
    p('Running cost splits between messaging fees and model usage. Model spend is modest here because conversations are short and the context is small — this is nothing like the cost profile of [a document assistant](/blog/ai-feature-development-cost), where every answer carries several retrieved passages.'),

    h2('How long does it take?'),
    p('Three to five weeks for a single-location business with one scheduling system and one channel. Multi-location, multi-practitioner or two channels pushes toward the upper end, mostly because the availability model gets genuinely more complex rather than because there is more AI work.'),
    p('The messaging integration is consistently the longest pole, and it is the one most likely to be underestimated. Business API approval, template review and delivery-state handling all involve waiting on somebody else.'),

    h2('How do you measure whether it is working?'),
    p('Four numbers, and only one of them is about the AI.'),
    p('**Bookings completed in conversation** is the headline: how many people who started a booking conversation left with a confirmed slot. Anything below roughly half suggests the assistant is failing to resolve requests, and the escalation transcripts will tell you which ones.'),
    p('**Bookings outside opening hours** is the number that justifies the whole project. These are appointments that would previously have been a missed call, and it is the cleanest measure of incremental revenue rather than substitution.'),
    p('**Escalation rate and reason** is the improvement loop. Escalations clustering around one topic almost always mean a missing fact rather than a model shortcoming, and adding one sentence to the fact set often removes an entire category.'),
    p('**No-show rate** should fall once reminders are in place. If it does not, the reminders are arriving in a channel nobody reads, which is a delivery problem rather than a booking one.'),
    p('Watch these weekly for the first month and monthly after that. Almost all of the tuning happens in the first two weeks, and it is nearly always to the fact set and the field descriptions rather than to the prompt.'),
    img('measurement', 'Four small gauges of differing sizes arranged on a clean surface, one raised', 'Only one of these four measures the AI. The others measure the business outcome.'),

    h2('When is this the wrong thing to build?'),
    p('Three situations where I say so on the call.'),

    h3('Your availability is genuinely simple'),
    p('If you offer one service at fixed times, a good booking page converts as well as a conversation and costs a fraction. Conversation earns its keep when the request has variables — service, duration, practitioner, preference — that a form handles clumsily.'),

    h3('Nobody will maintain the fact set'),
    p('Prices change, services get added, staff leave. If nothing updates the assistant\'s facts, it confidently quotes last year\'s prices, and that is worse than no assistant. This is a small ongoing commitment and it has to belong to somebody.'),

    h3('The real problem is upstream'),
    p('Sometimes bookings are not being missed at all — the business is at capacity, or the pricing is wrong, or the service page does not explain what is on offer. An assistant does not fix any of those, and installing one is an expensive way to find out.'),

    h2('Conclusion'),
    p('The whole design reduces to one rule: **the scheduler owns correctness and the model owns the conversation.** Everything else — the tool schemas, the re-check at commit, the two-clarification limit, the deterministic reminders — is that rule applied at a specific boundary.'),
    p('Build it that way and the worst realistic failure is an assistant that occasionally hands off to a human, which customers accept without complaint. Build it the other way, with the model reasoning about availability, and the worst realistic failure is two people booked into the same slot, which they do not.'),
    p('If you are weighing whether this fits your business, the useful first question is not about AI at all. It is how many bookings you are losing outside opening hours, because that number is the entire return, and it is usually knowable from your own phone log. [That is where a scoping call starts](/start).'),
    p('One practical note for anyone evaluating quotes. Ask directly what writes the booking. If the answer is that the model calls the calendar API, the system will eventually double-book, and the person quoting has probably not run one of these through a busy weekend. If the answer is that a service layer re-checks availability and commits atomically, with the model only proposing, they have.'),
    p('Ask also what happens at the second failed clarification. A confident answer describing an escalation path with a transcript is a good sign. A vague answer about the model handling it means there is no path, and every genuinely ambiguous request will end in a guess or an abandoned conversation.'),
  ),
  faqs: faq([
    ['Will an AI booking system double-book my calendar?',
     'Not if it is built correctly. The model never writes to the calendar. It proposes a slot, and the scheduling engine validates availability atomically before committing. Double-booking is a concurrency problem that belongs to the scheduler, not to a language model.'],
    ['Can customers book through WhatsApp?',
     'Yes, and it is usually the highest-converting channel because there is no app to install and no form to complete. It carries more setup overhead than web chat: a Business API number, pre-approved template messages, and rules about when you may message first.'],
    ['What happens when the assistant does not understand a request?',
     'It escalates. After two failed clarification attempts the conversation is handed to a human with the full transcript attached and the owner is alerted. A booking system that guesses at an ambiguous request is worse than one that simply asks for help.'],
    ['How much does an AI booking system cost?',
     'Typically $6,000 to $14,000 to build and $80 to $350 a month to run, depending on conversation volume and channels. Most of the build cost is the messaging and scheduling integrations rather than the AI layer, which is comparatively small.'],
  ]),
};
