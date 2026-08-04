import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/validating-llm-tool-calls-zod/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-validating-llm-tool-calls-zod',
  slug: 'validating-llm-tool-calls-zod',
  title: 'Validating Every LLM Tool Call With Zod',
  category: 'ai',
  order: 13,
  readTime: '11 min read',
  date: 'August 2026',
  publishedAt: '2026-08-03',
  series: 'AI safety',
  excerpt:
    'The model will eventually return a malformed tool call. The Zod schema layer that turns that from a corrupted database into a logged retry.',
  coverLabel: 'Tool call validation — cover',
  body: body(
    p('Tool calling works so well that it is easy to forget it is probabilistic. The model returns well-formed arguments hundreds of times in a row, you ship, and then at some volume it returns a date as `"next Tuesday"`, a quantity as `"a few"`, or an id for a record that does not exist.'),
    p('At a few thousand calls a day, a 0.5% malformed rate is dozens of bad writes. If those calls reach your database directly, you now have corrupted rows and no log explaining where they came from.'),
    p('The fix is a validation layer between the model and anything that executes. This is one of the six things that define [Template 04 in my stack](/stack) — "validated tool calls" is listed there for exactly this reason.'),

    h2('What is a tool call, precisely?'),
    p('A tool call is the model asking your application to do something. You describe the available functions and their parameters; the model returns a function name and a JSON object of arguments; your code runs it and returns the result.'),
    p('The important part is that both halves of that exchange are just text until you decide otherwise. The model does not call your function. It emits a structured suggestion, and every guarantee about that suggestion is one you enforce yourself.'),
    p('Providers help — most support a JSON schema for arguments and will usually produce conforming output. Usually is the operative word, and it is doing more work in that sentence than most architectures account for.'),
    p('It is worth being precise about what provider-side schema enforcement does and does not give you. It constrains the shape of the JSON: the right keys, roughly the right primitive types. It knows nothing about your domain. It cannot tell you that a booking must be in the future, that this user may not modify that record, that the referenced service was discontinued last quarter, or that an identical booking was created four seconds ago by a duplicate submission.'),
    p('Those are the failures that cost money, and every one of them is invisible to a JSON schema. Treating provider enforcement as sufficient is the specific mistake this post is about — it produces well-formed arguments that are wrong in ways only your application can detect.'),
    img('tool-call-flow', 'A proposal passing from a sphere through a gate into a structured record', 'The model proposes. Your code decides whether anything happens.'),

    h2('Why do models return invalid arguments?'),
    p('Four causes, in rough order of how often I have seen them.'),

    h3('Ambiguity in the user request'),
    p('The user said "book me in for next Tuesday afternoon". There is no unambiguous timestamp in that sentence, and the model has to invent one. It will, confidently, and it may pick a different Tuesday than the user meant.'),

    h3('Schema descriptions that are too thin'),
    p('A parameter called `date` with no description invites any date format in existence. A parameter described as "ISO-8601 date in UTC, e.g. 2026-08-03" gets ISO-8601 dates. Most malformed arguments are a documentation problem wearing a validation costume.'),

    h3('Enum drift'),
    p('You allow four status values. The model returns a fifth that is plausible in English and meaningless in your system — `"pending_review"` where you defined `"pending"`. This is the single most common failure I see, and the most dangerous, because a string field will happily accept it.'),

    h3('Hallucinated identifiers'),
    p('The model returns a record id that looks exactly right and does not exist. Format validation passes cleanly. Only a database lookup catches it, which is why validation and authorisation are separate steps.'),

    h2('Where should validation happen?'),
    p('Before execution, never after. That sounds obvious and it is routinely violated, because the natural way to write the code is to call the function and handle errors from the database.'),
    p('By then it is too late in two ways. You may have already performed a partial write, and the error you get back is a constraint violation rather than an explanation of what the model got wrong — which means you cannot hand anything useful back for a retry.'),
    table('The four validation layers and what each catches', [
      ['Layer', 'Catches', 'On failure'],
      ['Provider JSON schema', 'Gross shape errors', 'Provider retries internally'],
      ['Zod schema', 'Types, ranges, enums, formats', 'Reject, return error to model'],
      ['Service layer', 'Business rules and permissions', 'Typed error, no execution'],
      ['Database constraints', 'Referential integrity', 'Last line of defence'],
    ]),
    p('Each layer catches things the one above cannot. The provider schema does not know that a booking must be in the future. Zod does not know whether this user may modify that record. The database does not know why it was asked to.'),

    h2('What does a schema-first tool definition look like?'),
    p('Define the Zod schema first, derive the provider-facing JSON schema from it, and use the same object to validate the response. One definition, no drift between what you advertise and what you accept.'),
    code('ts', `
import { z } from 'zod';

export const bookAppointment = {
  name: 'book_appointment',
  description: 'Book a slot that has already been confirmed as available.',
  schema: z.object({
    serviceId: z.string().uuid()
      .describe('The service being booked. Must come from list_services.'),
    startsAt: z.string().datetime()
      .describe('ISO-8601 UTC start time, e.g. 2026-08-03T14:30:00Z.'),
    durationMinutes: z.number().int().min(15).max(240),
    channel: z.enum(['web', 'whatsapp'])
      .describe('Where the conversation happened.'),
    notes: z.string().max(500).optional(),
  }),
};
`),
    p('Three things are doing real work here. `.describe()` on each field becomes the documentation the model sees, which prevents most malformed arguments before they happen. `z.enum` makes an invalid status a rejection rather than a string that flows into your database. The `min`/`max` bounds turn an absurd duration into a caught error rather than a four-hour booking.'),

    h2('What should happen when validation fails?'),
    p('Return the validation error to the model as the tool result, and let it try once more.'),
    p('This works better than it sounds. Most malformed calls self-correct immediately when the model can see precisely which field was wrong and why — it is the same feedback loop a compiler gives a developer. Zod\'s error messages are specific enough to be useful verbatim.'),
    code('ts', `
const parsed = bookAppointment.schema.safeParse(args);

if (!parsed.success) {
  // The model sees exactly what was wrong and usually fixes it first try.
  return {
    ok: false,
    error: parsed.error.issues
      .map((i) => \`\${i.path.join('.')}: \${i.message}\`)
      .join('; '),
  };
}

return bookingService.book(parsed.data, { userId, orgId });
`),
    p('Cap retries at one, or two at the outside. After that, fail loudly to the user rather than looping — a model that has failed the same schema twice is not going to succeed on the fifth attempt, and each round costs tokens and latency.'),
    img('retry-loop', 'A rejected item returning through a feedback path and passing on the second attempt', 'A rejection with a reason is a retry. A rejection without one is a dead end.'),

    h2('Why should the model never write to your database?'),
    p('Because everything you need to enforce lives outside the prompt.'),
    p('Permissions are the clearest case. Whether this user may cancel that booking is a fact about your data, not something a language model can be instructed into reliably. Put a service layer between the model and the data and the check happens where it always happened.'),
    ul([
      '**Permissions** — is this user allowed to perform this action on this record.',
      '**Rate limits** — has this user exhausted their allowance this month.',
      '**Business rules** — is the slot still free, is the account in good standing.',
      '**Audit logging** — who did what, when, and via which conversation.',
      '**Idempotency** — has this exact action already been performed.',
    ]),
    p('None of those can be enforced by wording. A prompt saying "only cancel bookings belonging to this user" is a suggestion; a service that filters by `userId` is a guarantee. This is the same boundary that keeps [a conversational booking system from double-booking](/services) — the scheduler owns correctness, the model owns the conversation.'),
    quote('A prompt is not a security boundary. It is a request, and the model is under no obligation to honour it under adversarial input.'),

    h2('How do you handle hallucinated identifiers?'),
    p('Schema validation passes them, because a well-formed UUID that refers to nothing is still a well-formed UUID. This needs a separate step, and it is worth being deliberate about the order.'),
    ol([
      '**Validate shape** with Zod. Cheap, synchronous, catches most problems.',
      '**Resolve every identifier** against the database, scoped to what this user may see. A record that does not exist and a record they may not access should return the same error — otherwise the error message itself leaks which ids are real.',
      '**Check business rules** on the resolved objects, not on the raw arguments.',
    ]),
    p('Doing the scoped lookup before the business rules means one query answers both existence and authorisation, which is faster and closes the enumeration hole in one move.'),

    h2('What should you log on a rejected call?'),
    p('Rejections are the most useful signal an AI feature produces, and they are usually discarded. Log the tool name, the raw arguments, the validation error and the conversation id.'),
    p('A rejection rate climbing over time means something has drifted — content changed, a prompt was edited, a provider updated a model. Clustered rejections on one field almost always mean that field needs a better description rather than more retries.'),
    table('What a rejection pattern usually means', [
      ['Pattern', 'Likely cause', 'Fix'],
      ['One field, many calls', 'Weak description', 'Improve `.describe()`'],
      ['Enum values near-miss', 'Model paraphrasing', 'Tighten enum, add examples'],
      ['Ids that do not resolve', 'Missing lookup step', 'Force a list call first'],
      ['Sudden rate increase', 'Prompt or model change', 'Re-run the evaluation set'],
      ['Rejections on retry too', 'Genuinely ambiguous request', 'Ask the user, do not guess'],
    ]),

    h2('How do you test a validation layer?'),
    p('The awkward part of testing anything model-facing is that the model is non-deterministic. The trick is that you do not need to test the model — you need to test that your layer behaves correctly given every shape of input the model might produce.'),

    h3('Unit tests with hand-written bad payloads'),
    p('Write the malformed arguments yourself. A wrong enum value, a date as prose, a negative duration, a missing required field, an extra field nobody asked for, a null where a string belongs. These are fast, deterministic and they cover the overwhelming majority of real failures.'),
    p('Keep the payloads from real rejections in this suite. Every genuine malformed call your logs capture becomes a permanent regression test, which turns production incidents into coverage.'),

    h3('Integration tests against a real model, sparingly'),
    p('A handful of tests that actually call a provider with deliberately ambiguous prompts — "book me in sometime next week" — confirm the loop works end to end and that the retry path produces a valid call. Keep these few and keep them out of the fast suite; they are slow and they cost money on every run.'),

    h3('Adversarial tests for permission bypass'),
    p('The interesting failure is not a malformed date. It is a well-formed call referencing a record belonging to somebody else. Write tests that pass valid arguments pointing at another user\'s data and assert the service refuses.'),
    p('This is the test that catches the mistake of validating shape and then trusting the ids, which is the most common way an otherwise careful implementation leaks data.'),

    h3('A canary on rejection rate'),
    p('Beyond tests, alert when the rejection rate for any tool moves sharply. It is the earliest available signal that a prompt edit, a content change or a provider update has broken something, and it fires well before anyone reports a bad answer.'),
    img('test-layers', 'Four matte test gates arranged in sequence with one item passing through each', 'You are not testing the model. You are testing that your layer holds for every input it might send.'),

    h2('What about structured output that is not a tool call?'),
    p('Extraction, classification and summarisation with a fixed shape have the same problem and the same fix. Whether the model is calling a function or filling a form, you are receiving JSON you did not write.'),

    h3('Parse, do not trust'),
    p('Run the same Zod schema over the parsed response. If it fails, retry once with the error attached, exactly as with tool calls. The only difference is that there is usually no side effect to guard, so a failure degrades to "we could not extract this" rather than to a bad write.'),

    h3('Confidence belongs in the schema'),
    p('For extraction work, make the model return a confidence value per field and validate it as a bounded number. That field is what drives the human review queue — anything below the threshold goes to a person rather than into the system.'),
    p('This is what makes [a document extraction pipeline](/blog/ai-feature-development-cost) trustworthy rather than merely fast. Extraction without a review path is not cheaper; it just moves the cost onto whoever eventually finds the mistakes.'),

    h3('Partial results beat total failure'),
    p('When one field of twelve fails validation, returning the eleven that passed with the twelfth flagged is almost always more useful than rejecting the document. Model this explicitly in the schema rather than deciding it ad hoc in a catch block.'),
    img('structured-output', 'A form-shaped panel with eleven filled fields and one marked for review', 'One bad field should not discard eleven good ones. Decide that in the schema, not in a catch block.'),

    h2('Does this work across providers?'),
    p('Yes, and that is one of the better arguments for it. Zod validates the parsed arguments rather than the wire format, so the schemas are unchanged when you swap providers.'),
    p('That is what makes a provider-agnostic setup practical rather than theoretical. The adapter normalises how tool calls arrive; the validation layer is identical on the other side of it. Swapping a model becomes an adapter change instead of a re-audit of every tool.'),

    h2('How do you write field descriptions that actually work?'),
    p('This is the highest-leverage and least discussed part of the whole exercise. Most malformed arguments are not a model failing — they are a model guessing, because the schema did not tell it enough.'),

    h3('State the format, then give an example'),
    p('`"ISO-8601 UTC timestamp, e.g. 2026-08-03T14:30:00Z"` eliminates an entire class of date problems that no amount of retry logic will. The example does more work than the format name, because it is unambiguous where a format name is a claim about a standard the model has to recall correctly.'),

    h3('Say where the value comes from'),
    p('For any identifier, name the tool that produces it: `"Must be an id returned by list_services in this conversation."` This is the single most effective guard against hallucinated ids, because it reframes the field from "produce a plausible id" to "reuse one you were given".'),

    h3('Describe the constraint, not just the type'),
    p('`durationMinutes: number` invites anything. `"Length in minutes, in 15-minute increments, between 15 and 240"` gets valid durations, and the Zod bounds then catch the rare miss rather than doing all the work alone.'),

    h3('Say what the tool does not do'),
    p('A description reading `"Books a slot that has already been confirmed available by check_availability. Does not check availability itself."` prevents the model from treating one tool as two. Negative statements are underused and they resolve a lot of ambiguity cheaply.'),
    p('Descriptions are cheap to iterate on and they change behaviour immediately. When a rejection pattern clusters on one field, rewriting that description is almost always the fix, and it is faster than any change to the prompt.'),
    img('field-descriptions', 'A labelled schema panel with one field annotated in detail beside three sparse ones', 'Most malformed arguments are a documentation problem, not a model problem.'),

    h2('What does this cost to build?'),
    p('Less than a day for a typical feature with three or four tools, and it is not the sort of work that expands.'),
    p('Set against that: one corrupted write discovered a week later, in a table other things depend on, is usually a multi-day recovery. The asymmetry is not close, which is why this goes into the base scope of [every AI build I quote](/services) rather than appearing as a line item someone can decline.'),
    img('cost-asymmetry', 'A small block on one side of a balance outweighed by a much larger one on the other', 'A day of schemas against a week of recovery. The asymmetry is the whole argument.'),

    h2('Conclusion'),
    p('Treat every tool call as untrusted input, because that is exactly what it is. The model is a very capable, occasionally unreliable client of your API, and you would not let an external client write to your database without validation simply because it usually behaves.'),
    p('The pattern is small: define schemas with real field descriptions, validate before execution, return errors to the model for one retry, resolve identifiers with a scoped lookup, and keep permissions and business rules in a service the model cannot reach. Log every rejection, because that log tells you what to fix.'),
    p('None of it is sophisticated, and it is the difference between an AI feature that fails visibly and recoverably and one that fails quietly into your data.'),
    p('If you take one thing from this, make it the ordering. Validate shape, then resolve identifiers with a query scoped to what the caller may see, then check business rules on the resolved objects, then execute. Skipping the middle step is the mistake that looks safest and leaks the most, because a well-formed identifier belonging to somebody else passes every schema you can write.'),
    p('And keep the rejection log. It is the cheapest observability an AI feature offers: it tells you which field needs a better description, when a prompt edit has quietly changed behaviour, and whether a provider update has moved something underneath you. Most teams discover all three from a customer instead, weeks later, which is a considerably more expensive way to learn the same facts.'),
  ),
  faqs: faq([
    ['Why validate LLM tool calls if the model usually gets it right?',
     'Because "usually" is the problem. At a few thousand calls a day, a 0.5% malformed rate is dozens of bad writes. Validation turns an occasional silent data corruption into a logged retry costing a few hundred milliseconds, which is an unambiguously good trade.'],
    ['Should the model be allowed to write to the database?',
     'No. The model proposes an action and a service layer you control validates and performs it. That boundary is where permissions, rate limits, business rules and audit logging live, and none of them can be enforced inside a prompt regardless of how firmly it is worded.'],
    ['What do you do when a tool call fails validation?',
     'Return the validation error to the model as the tool result and allow one retry. Most malformed calls self-correct when the model can see exactly which field was wrong. After two failures, fail loudly to the user rather than looping and spending tokens.'],
    ['Does Zod validation work with every AI provider?',
     'Yes, because it validates the parsed arguments rather than the wire format. That is what makes a provider-agnostic setup practical: the adapter normalises how tool calls arrive, and the identical validation layer sits behind it regardless of which model produced them.'],
  ]),
};
