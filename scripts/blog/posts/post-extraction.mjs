import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/document-extraction-pipeline/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-document-extraction-pipeline',
  slug: 'document-extraction-pipeline',
  title: 'Document Extraction Pipelines That Survive Messy Input',
  category: 'ai',
  order: 19,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-09',
  series: 'AI architecture',
  excerpt:
    'Turning PDFs, scans and inconsistent forms into structured data — with validation, confidence scores and a human review path that makes it trustworthy.',
  coverLabel: 'Document extraction — cover',
  body: body(
    p('Extraction demos beautifully. You upload an invoice, the fields come back correct, and it looks like the problem is solved. Then it meets a real document set — photographs taken at an angle, a supplier who changed their layout in March, a scan where the total is partly obscured by a staple — and the accuracy that looked like 95% turns out to be 95% on the clean half.'),
    p('The difference between a demo and a pipeline is almost entirely in what happens to the documents that do not extract cleanly. That is where the engineering is, and it is where the cost is.'),
    p('This is one of the four AI feature types I build, and it prices higher than chat or search for exactly this reason: [the cost is driven by how bad the input is](/blog/ai-feature-development-cost), not by the model.'),

    h2('What does extraction actually involve?'),
    p('Five stages, and only one of them is a model call. Teams that treat it as a single step are usually the ones surprised by accuracy.'),
    ol([
      '**Ingest** — accept the file, store it, and record where it came from.',
      '**Parse** — turn the file into text with structure preserved, or as much as survives.',
      '**Extract** — ask the model for structured fields, with a schema and confidence per field.',
      '**Validate** — check the shape, the types, the business rules, and resolve any identifiers.',
      '**Review** — route anything below the confidence threshold to a human, and learn from the corrections.',
    ]),
    p('The parse stage is where most quality is won or lost, and it receives the least attention because it is not the interesting part. The review stage is what makes the whole thing trustworthy, and it is the one most often cut for time.'),
    img('five-stages', 'Five sequential modules with a document passing through and one branch diverting', 'Only stage three involves a model. Stages two and five decide whether it works.'),

    h2('Why does parsing matter more than the model?'),
    p('Because the model can only extract what the parser gave it, and parsers fail in ways that produce plausible-looking text.'),
    p('A two-column PDF parsed naively interleaves the columns, so sentences alternate between unrelated topics. A table flattened to a single line loses which number belonged to which header. Page furniture — running heads, footers, page numbers — is injected into the middle of paragraphs. None of these produce an error. They produce text that reads as slightly odd and extracts as confidently wrong.'),
    p('Before touching a prompt, parse twenty representative documents and read the output as the pipeline sees it. This is an afternoon and it repeatedly changes the estimate more than any other single activity. I do it during scoping now, having once discovered a day and a half of unplanned work in week two.'),

    h3('Digital PDFs with a text layer'),
    p('The good case. Text extraction is reliable, and the work is preserving structure — headings, tables, reading order — rather than recovering characters. Layout-aware parsers are worth the extra dependency here.'),

    h3('Scans and photographs'),
    p('OCR territory, and quality varies enormously with the source. A flatbed scan of a printed page is usually fine; a photograph taken at an angle in poor light is not, and no downstream cleverness recovers characters the OCR never saw.'),

    h3('Office formats and email'),
    p('Frequently the messiest, because they carry history. Tracked changes, embedded tables, forwarded chains with quoted replies, and content pasted from other formats. Worth handling explicitly rather than hoping a generic parser copes.'),

    h2('How do you design the extraction schema?'),
    p('Schema-first, with Zod, exactly as with [any other structured model output](/blog/validating-llm-tool-calls-zod). The schema is both the instruction to the model and the validation on the way back.'),
    code('ts', `
const InvoiceField = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({
    value: inner.nullable(),
    confidence: z.number().min(0).max(1),
    // Where in the document this came from, for the review UI.
    sourcePage: z.number().int().nullable(),
  });

export const Invoice = z.object({
  invoiceNumber: InvoiceField(z.string().min(1)),
  issueDate:     InvoiceField(z.string().date()),
  totalCents:    InvoiceField(z.number().int()),
  currency:      InvoiceField(z.enum(['USD', 'EUR', 'GBP', 'BDT'])),
  supplierName:  InvoiceField(z.string().min(1)),
});
`),
    p('Wrapping every field in a value-plus-confidence envelope is the single most useful decision in the whole design. It lets the model say "I found this, and I am not sure" instead of forcing a binary between a guess and a failure, and the confidence is what drives everything downstream.'),
    p('Make the value nullable and instruct the model explicitly that absent is a valid answer. A field that does not appear in the document should come back null with high confidence, not as a plausible invention with medium confidence.'),

    h2('How reliable are the confidence scores?'),
    p('Usefully but not perfectly, and this deserves saying plainly because it is where people over-trust the design.'),
    p('Model-reported confidence correlates with correctness well enough to rank documents for review, which is what you need it for. It is not calibrated in a statistical sense — a field reported at 0.9 is not correct exactly 90% of the time — and treating it as a probability will mislead you.'),
    p('Calibrate empirically instead. Run a few hundred documents through, have a person check them, and plot correctness against reported confidence. That tells you where your actual threshold should sit, and it is usually higher than the intuitive 0.8.'),
    p('Cross-checks are stronger than self-reported confidence where they exist. If line items should sum to the total, verify it. If a date should fall within the billing period, check. A field that fails arithmetic is wrong regardless of how confident the model was.'),
    img('confidence-calibration', 'A scatter of markers against two axes with a threshold line drawn across', 'Confidence ranks well and calibrates poorly. Set the threshold from measurement, not intuition.'),

    h2('What does the review queue look like?'),
    p('This is the part that makes extraction trustworthy, and it is the part most often deferred. Without it, low-confidence extractions are either accepted silently or discarded silently, and both are worse than showing them to somebody.'),

    h3('Show the document beside the fields'),
    p('The reviewer needs the source in view, ideally scrolled to where the field was found. The `sourcePage` in the schema exists for this. A review UI that shows extracted values without the document forces the reviewer to open the file separately, which triples the time per document.'),

    h3('Only flag what needs flagging'),
    p('Route individual fields, not whole documents. An invoice where eleven fields are confident and one is not should present one field for confirmation, not a full re-entry. This is the difference between a review queue people use and one they abandon.'),

    h3('Make correction cheap and logged'),
    p('One keystroke to accept, one field to fix. Every correction is a labelled example, and the log of corrections is the most valuable artefact the pipeline produces — it tells you which fields, suppliers and document types are failing.'),

    h2('What do you do with the corrections?'),
    p('Three things, in increasing order of effort and decreasing order of how often they are worth it.'),
    p('**Fix the prompt or the schema description.** Corrections clustering on one field almost always mean that field is underspecified. A description saying "total including tax, in the document\'s own currency" resolves an entire class of error that no amount of retrying will.'),
    p('**Fix the parser.** If corrections cluster on one document type or one supplier, the problem is usually upstream in parsing rather than in the model. This is the most common finding and the one people look at last.'),
    p('**Fine-tune, rarely.** Worth considering only at high volume with a stable document set and hundreds of corrections. For most projects the first two options exhaust the available improvement, and fine-tuning adds a retraining pipeline nobody wanted to own.'),

    h2('How do you handle documents that fail entirely?'),
    p('Explicitly, and visibly. A document that cannot be parsed at all is a different failure from one that extracted with low confidence, and conflating them hides real problems.'),
    p('Give every document a terminal state: extracted, needs review, or failed. Failed documents need a reason — unreadable, unsupported format, password protected, empty after parsing — and a queue of their own. That queue is a much better product signal than an error log, because it is a list of things a customer tried to do and could not.'),
    p('Never silently drop a document. The worst version of this system accepts a file, fails to parse it, records nothing, and leaves the user assuming it worked. They find out weeks later when something that should have been in a report is missing.'),

    h2('How do you process at volume?'),
    p('On a queue, always. Extraction is slow, bursty and expensive, and none of those characteristics belong in a request cycle.'),
    p('Each document becomes a job. Jobs retry with backoff on transient failures, fail terminally on structural ones, and land in a dead letter queue when they exhaust attempts. This is [the same background worker every AI feature already needs](/blog/ai-is-a-module-not-a-stack).'),
    p('Idempotency matters here more than in most places. A retried extraction job must not create a second record, and the natural key is usually a hash of the file contents rather than the upload id, because the same document frequently arrives twice.'),
    table('Job states and what each means', [
      ['State', 'Meaning', 'Next step'],
      ['queued', 'Accepted, not started', 'Worker picks it up'],
      ['parsing', 'Extracting text', 'Automatic'],
      ['extracting', 'Model call in flight', 'Automatic'],
      ['needs_review', 'Below confidence threshold', 'Human queue'],
      ['extracted', 'Accepted and validated', 'Available downstream'],
      ['failed', 'Terminal, with a reason', 'Failure queue'],
    ]),

    h2('What does it cost?'),
    p('Usually fractions of a cent to a few cents per page, driven by page length rather than document count. A hundred-page contract costs roughly fifty times a two-page invoice.'),
    p('The larger cost is frequently the review time, and it is the one nobody budgets. If 30% of documents need a human to look at one field, and that takes twenty seconds, the labour cost at volume can exceed the model cost comfortably. Raising extraction accuracy is therefore a labour saving, not just a quality improvement.'),
    p('This is why measuring the review rate matters as much as measuring accuracy. It converts a quality metric into a number the client can price, which makes the argument for improving the parser considerably easier to have.'),
    img('cost-split', 'Two cost blocks, the labour block noticeably larger than the model block', 'At volume, review labour usually costs more than the model. Accuracy is a labour saving.'),

    h2('How do you validate beyond the schema?'),
    p('Shape validation catches malformed output. It does not catch output that is well-formed and wrong, which is the more common failure once the schema is right.'),

    h3('Arithmetic cross-checks'),
    p('Line items summing to a subtotal, subtotal plus tax equalling the total, quantities multiplied by unit prices matching line amounts. These are free to compute and they catch a large share of extraction errors, because a misread digit almost always breaks the arithmetic.'),
    p('When a cross-check fails, the useful behaviour is to flag the fields involved rather than the whole document. Usually one number is wrong and the reviewer can see immediately which, because the others agree with each other.'),

    h3('Range and plausibility checks'),
    p('An invoice dated three years in the future, a total of nine million on an account whose average is four hundred, a quantity of 10,000 for a service billed by the hour. None of these are schema violations and all of them are worth a human glance.'),
    p('Set the ranges from your own data rather than from intuition. The distribution of real values is usually narrower than expected, which makes outlier detection more useful than people assume.'),

    h3('Identifier resolution'),
    p('Supplier names, account codes and product references should resolve against records you already hold, scoped to what the requesting organisation may see. An unresolvable identifier is not necessarily wrong — it may be a genuinely new supplier — but it is exactly the case a person should confirm once.'),
    p('Fuzzy matching helps here and needs a threshold. "Acme Ltd" and "ACME Limited" are the same supplier; "Acme Ltd" and "Acme Holdings Ltd" may not be, and guessing costs more than asking.'),
    img('cross-checks', 'A set of values with connecting lines forming a closed loop, one line broken', 'Arithmetic that does not close is the cheapest error detector available.'),

    h2('How do you handle layout changes?'),
    p('They happen without warning. A supplier redesigns their invoice, a form gains a field, a government template changes between tax years — and a pipeline that was performing well quietly starts failing on one source.'),
    p('Schema-first extraction is considerably more robust here than template matching, which is its main practical advantage. A model reading for meaning finds the total whether it sits top-right or bottom-left; a template keyed to coordinates does not.'),
    p('Robust is not immune, though. Track accuracy and review rate grouped by source, and alert when either moves sharply for a single supplier while the aggregate stays flat. That grouping is what turns a layout change from a slow mystery into a same-week fix.'),
    p('Keep the original file and the parsed text for every document, at least for a retention window. When a source starts failing, the diagnosis nearly always requires looking at what the parser produced before and after, and reconstructing that later is impossible if only the extracted fields were kept.'),
    img('layout-drift', 'Two similar document forms with elements arranged differently, both resolving to the same field set', 'Reading for meaning survives a redesign. Reading by coordinates does not.'),

    h2('When should you not build this?'),
    p('Three cases where I say so early.'),
    p('**The documents are already structured.** If the supplier can send a CSV or provide an API, extraction is solving a problem that upstream cooperation solves better and permanently. It is worth one conversation before building anything.'),
    p('**The volume does not justify it.** Below roughly a few hundred documents a month, a person doing data entry is often cheaper than a pipeline plus its review queue plus its maintenance. The threshold is lower than it used to be and it is not zero.'),
    p('**Being wrong is unacceptable and volume is high.** Where every field must be correct and there are too many documents to review them all, extraction does not remove the review burden — it just changes what the reviewer is doing. That may still be worth it, but it should be decided knowingly.'),
    quote('Extraction without a review path is not cheaper. It moves the cost onto whoever eventually finds the mistakes, which is usually a customer.'),

    h2('How do you measure it honestly?'),
    p('Field-level accuracy on a labelled set, not document-level, and reported separately by input type.'),

    h3('Label a real sample'),
    p('A hundred documents drawn from actual traffic, with every field checked by a person. This is the ground truth and it takes a day. Without it, accuracy claims are impressions.'),

    h3('Report per field and per input type'),
    p('Aggregate accuracy hides everything useful. Totals may extract at 98% while supplier names sit at 82%, and digital PDFs may be excellent while photographs are unusable. The aggregate tells you nothing about which to fix.'),

    h3('Track review rate as the operational number'),
    p('Accuracy is the engineering metric; the proportion of documents needing human attention is the one the business feels. Watch it weekly — a rising review rate is usually a new supplier or a changed layout, and it is the earliest available signal.'),

    h2('Conclusion'),
    p('Parse before you prompt, and read the parser output on real documents before quoting. Define the schema with a confidence and a source position on every field. Validate shape, then business rules, then cross-checks like line items summing to the total.'),
    p('Route low-confidence fields — not whole documents — to a review queue that shows the source alongside the value, and treat the correction log as the primary improvement signal. Give failed documents a terminal state with a reason and a queue, so nothing disappears silently.'),
    p('Do all of that and extraction becomes a system you can trust with a known review rate and a known cost per page. Skip the review path and you have something that is right most of the time, wrong invisibly, and impossible to price — which is the version that gets switched off six months in.'),
    img('trusted-pipeline', 'A settled sequence of modules with one branch flowing to a small review station', 'The review branch is what makes the rest trustworthy. It is also the part most often cut.'),
    p('If you are scoping one of these, the two questions worth answering before any estimate are what proportion of the corpus is digital versus scanned, and what happens downstream when a field is wrong. The first sets the accuracy you can expect; the second sets how much review the system needs. Everything else on this page follows from those two answers, and both are knowable in an afternoon with twenty real documents.'),
  ),
  faqs: faq([
    ['How accurate is AI document extraction?',
     'On clean digital PDFs with consistent layouts, high enough to run with spot checks. On photographs and poor scans it is variable, and any workflow treating extraction there as fully automatic will produce silent errors. Report accuracy per field and per input type, never in aggregate.'],
    ['How do you handle low-confidence extractions?',
     'Route the individual field, not the whole document, to a human review queue showing the source alongside the extracted value. Confidence thresholds are what make a pipeline trustworthy, and they should be set from measured calibration rather than intuition.'],
    ['What does document extraction cost per page?',
     'Usually fractions of a cent to a few cents, driven by page length rather than document count. At volume the larger cost is often review labour rather than the model, which is why improving accuracy is a labour saving as much as a quality one.'],
    ['Can extraction handle documents it has never seen?',
     'Schema-first extraction generalises to new layouts reasonably well, which is its advantage over template matching. Accuracy still drops on unfamiliar formats, so new document types should route through review until you have measured them.'],
  ]),
};
