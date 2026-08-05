import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mongodb-schema-indexes/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mongodb-schema-indexes',
  slug: 'mongodb-schema-indexes',
  title: 'MongoDB Schema and Index Decisions That Do Not Age Badly',
  category: 'backend',
  order: 54,
  readTime: '13 min read',
  date: 'February 2026',
  publishedAt: '2026-02-23',
  series: 'Foundations',
  excerpt:
    'Embed or reference, the compound index rule that decides whether a query is fast, and the unbounded array that eventually breaks a document.',
  coverLabel: 'MongoDB schema and indexes — cover',
  body: body(
    p('MongoDB is easy to start with and unforgiving about early modelling decisions, which is an unusual combination. There is no schema to stop you, so the first version works; and there is no schema to stop you, so the tenth version is carrying five shapes of the same document.'),
    p('The two decisions that matter are what you embed versus what you reference, and which compound indexes you create. Get those right and it scales quietly. Get them wrong and you get a database that is fast on your laptop and slow on real data, for reasons that are not visible in the code.'),
    p('This is the set of rules I apply on MERN builds, and it pairs with the [type safety work](/blog/type-safe-mern) that makes a schemaless database tolerable in the first place.'),

    h2('Embed or reference?'),
    p('Embed when the child is only ever read with the parent and the set is bounded. Reference otherwise. Most modelling mistakes are a violation of one half of that sentence.'),
    table('The decision, in four questions', [
      ['Question', 'Embed', 'Reference'],
      ['Read without the parent?', 'Never', 'Sometimes'],
      ['How many children?', 'Bounded, small', 'Unbounded or large'],
      ['Updated independently?', 'Rarely', 'Often'],
      ['Shared with other parents?', 'No', 'Yes'],
    ]),
    p('An order\'s line items are the canonical embed: you never want line items without the order, there are a handful of them, and they are written once. A user\'s posts are the canonical reference: unbounded, listed on their own, written constantly.'),
    code('js', `
// Embedded — read in one operation, always together.
{ _id, customerId, total: 4250,
  items: [ { sku: 'A-1', qty: 2, unitPrice: 1500 } ] }

// Referenced — the array grows forever, so it does not live in the document.
{ _id, authorId, title, body }        // posts, queried by authorId
`),

    h3('Embedding duplicates data, and that is often correct'),
    p('The line item above stores `unitPrice` rather than looking it up from a product. That is deliberate: an order must record what the customer actually paid, not what the product costs today. Denormalization is not a compromise here — it is the accurate model.'),
    p('The mistake is duplicating data that should stay consistent. A customer\'s current email copied into every order means a change of address requires updating every historical order, and missing one leaves two answers to the same question.'),

    p('A useful way to test which category you are in is to ask what the field means. If it means "the customer\'s email", it is a reference to a living value and belongs in one place. If it means "the email we sent this receipt to", it is a historical fact about this order and belongs in the order. The same string, two different meanings, two different homes.'),

    h3('The rule of thumb that actually holds'),
    p('If updating the duplicate everywhere would be a bug, reference it. If updating it everywhere would be wrong, embed it. Prices, addresses at time of shipment and names on a signed document all belong in the second category.'),
    img('embed-reference', 'One container holding its contents directly, beside another pointing at separately stored items', 'Embed what is read with the parent and bounded. Reference what is read alone or grows without limit.'),

    h2('What breaks when an array grows without limit?'),
    p('Three things, at three different sizes, and the first two arrive long before the hard limit anybody quotes.'),
    ol([
      '**Document rewrites.** Every update to a document rewrites it. A document with five thousand array entries is rewritten in full to append the five thousand and first, and write throughput falls with it.',
      '**Index bloat.** An index on a field inside an array creates an entry per element. A thousand-element array means a thousand index entries per document, and the index outgrows the collection.',
      '**The 16MB ceiling.** Eventually the document cannot be written at all, and the failure is an error on a write that used to work — usually for the busiest customer, which is the worst one to break.',
    ]),
    p('The point is that the ceiling is not the problem. Performance degrades continuously from the first few hundred elements, so by the time you hit the limit the collection has been slow for months and nobody connected the two.'),

    img('array-growth', 'A container expanding past its comfortable size, with the cost rising well before the outer boundary', 'The ceiling is not the problem. Throughput falls from the first few hundred elements, months before the hard error.'),

    h3('Bound it, or move it out'),
    p('If an array is genuinely bounded — a handful of tags, five recent items, a fixed set of settings — embedding is fine and it stays fine. If it can grow with usage, it belongs in its own collection from the start, because moving it later is a migration across every document.'),

    h3('The hybrid: embed a capped subset'),
    p('A common pattern is embedding the most recent N alongside a reference to the full set. The document carries the last five comments for display, the comments collection holds all of them, and the list view needs no second query. It duplicates, and here the duplication is a cache with a clear invalidation rule.'),

    h2('How do compound indexes actually work?'),
    p('Left to right, as a prefix. This single fact explains most of the confusion about why an index is not being used.'),
    p('An index on `{ orgId: 1, status: 1, createdAt: -1 }` serves a query on `orgId`, on `orgId` and `status`, and on all three. It does not serve a query on `status` alone, because `status` is not a prefix of the index.'),
    code('js', `
db.orders.createIndex({ orgId: 1, status: 1, createdAt: -1 })

db.orders.find({ orgId })                                    // uses it
db.orders.find({ orgId, status: 'open' })                    // uses it
db.orders.find({ orgId, status: 'open' }).sort({ createdAt: -1 })  // uses it, no sort step
db.orders.find({ status: 'open' })                           // does not use it
`),
    p('The third line is the one worth internalizing. Because `createdAt` is in the index after the equality fields, the results come out already sorted and MongoDB skips the sort stage entirely. Put the sort field in the wrong position and it has to collect every match and sort them in memory, which fails outright past a size limit.'),

    h3('Equality, sort, range — in that order'),
    p('The ordering rule: fields matched for equality first, then the field you sort on, then fields matched as a range. Following it produces indexes that serve both the filter and the sort; ignoring it produces indexes that serve only the filter and then sort in memory.'),

    h3('Fewer, wider indexes beat more, narrower ones'),
    p('Because of the prefix rule, one three-field index often replaces three single-field ones. Every index costs write throughput and storage, so a collection with eleven indexes is usually a collection where nobody removed the redundant ones.'),

    h3('The tenant field goes first, always'),
    p('In a multi-tenant application, every index should lead with the tenant identifier. It is in every query, it partitions the data before anything else is evaluated, and it means a small customer\'s queries do not care how large the biggest customer is. Same rule as [tenant-scoped Postgres](/blog/multi-tenant-prisma-postgres), same reason.'),
    img('compound-prefix', 'A layered key structure readable from one end, with matching queries entering from that end only', 'Left to right. A query that does not match a prefix does not use the index, however many of its fields appear.'),

    h2('How do you tell whether an index is being used?'),
    p('`explain`, and specifically the winning plan\'s stage. Everything else is guessing.'),
    code('js', `
db.orders.find({ orgId, status: 'open' }).sort({ createdAt: -1 }).explain('executionStats')

// What you want to see:
//   stage: 'IXSCAN'            — using an index
//   totalDocsExamined ≈ nReturned   — not reading rows it discards
// What you do not want:
//   stage: 'COLLSCAN'          — reading the whole collection
//   stage: 'SORT'              — sorting in memory after the fetch
`),
    p('The ratio in the second line is the most useful single number. Examining fifty thousand documents to return twenty means the index narrowed almost nothing, which is usually a compound index in the wrong field order rather than a missing index.'),

    h3('Explain on production-shaped data or not at all'),
    p('The query planner chooses based on statistics. On a collection with two hundred documents it will pick a collection scan because that genuinely is faster, and the plan you see tells you nothing about production. Test against realistic volume.'),

    img('explain-ratio', 'A wide input narrowing to a small output, measured at the narrowing point', 'Documents examined against documents returned. That ratio names the problem more precisely than the presence of an index.'),

    h3('Watch the slow query log, not your intuition'),
    p('MongoDB logs queries over a threshold. Setting that threshold low in staging and reading the output is a faster route to the missing index than reasoning about which queries ought to be slow — the ones that actually are slow are frequently not the ones you would have guessed.'),

    h2('Which index types are worth knowing?'),
    p('Four beyond the ordinary compound index, and each solves a problem that is awkward without it.'),

    h3('Partial indexes shrink the index, not the collection'),
    p('If ninety percent of your orders are archived and every query filters to the active ones, an index over all of them is mostly dead weight. A partial index covers only documents matching a condition, so it is smaller, faster to traverse and cheaper to maintain on write.'),
    code('js', `
db.orders.createIndex(
  { orgId: 1, createdAt: -1 },
  { partialFilterExpression: { status: { $in: ['draft', 'open'] } } },
);
`),
    p('The catch is that the query must include the same condition for the planner to use it. An index partial on open orders is invisible to a query that does not mention status, which surprises people the first time.'),

    h3('TTL indexes delete for you'),
    p('A TTL index removes documents a set time after a date field, which is exactly right for sessions, verification tokens, rate-limit records and anything else with a natural expiry. It replaces a cleanup job you would otherwise write, forget, and discover has not run for four months.'),

    h3('Unique indexes are the only real constraint you get'),
    p('Without a unique index, two concurrent requests both check that an email is unused and both insert it. Application-level uniqueness checks have a race window by construction; the index is what closes it. This is the same argument as the [unique constraint on webhook event ids](/blog/stripe-webhooks-idempotency) — let the database decide, because it is the only thing that can.'),

    h3('Text and vector search are usually somebody else\'s job'),
    p('MongoDB has both. They are adequate for simple cases and they are not what a dedicated search index gives you. If search is a feature rather than a convenience, it is worth its own system — [semantic search has its own considerations](/blog/semantic-search-guide) that a general-purpose database index does not address.'),
    img('index-types', 'Several index structures of different shapes over a single collection, one covering a subset only', 'A partial index covers a slice. It is invisible to any query that does not name the same condition.'),

    h2('What about schema validation?'),
    p('Use it. "Schemaless" is a property of the database, not a goal for your data.'),
    p('The absence of a schema does not mean documents have no shape; it means the shape is enforced somewhere else or not at all. In practice it ends up enforced in application code, in three places, inconsistently — and one script written in a hurry writes a document that none of the three expects.'),
    code('js', `
db.createCollection('orders', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['orgId', 'customerId', 'total', 'createdAt'],
    properties: {
      total: { bsonType: 'int', minimum: 0 },
      status: { enum: ['draft', 'open', 'paid', 'void'] },
    },
  }},
  validationLevel: 'moderate',   // existing documents keep working
});
`),
    p('`validationLevel: moderate` is the setting that makes this adoptable on a live collection: new documents and updates to conforming ones are checked, while existing non-conforming documents are left alone. That lets you turn validation on today and fix history gradually rather than needing a migration first.'),

    h3('Validate in the application too, and derive both from one place'),
    p('Database validation is the backstop; application validation is what produces a good error message. Defining the shape once and generating both — a Zod schema for the application, a JSON Schema for the collection — is what keeps them from drifting, which is [the same discipline as everywhere else](/blog/validating-llm-tool-calls-zod).'),

    h2('Which schema mistakes are hardest to undo?'),
    p('Four, in rough order of how much they cost to fix later.'),
    ul([
      '**Unbounded embedded arrays.** Moving them out means rewriting every document and every query that touched them.',
      '**Storing money as a double.** Floating point cannot represent currency exactly, and the errors accumulate silently. Use integer minor units.',
      '**Dates as strings.** Range queries on a string date work only if the format sorts lexicographically, and timezone handling becomes manual. Store real date types.',
      '**Missing tenant field on a collection.** Adding it later means inferring which customer historical documents belong to, which is sometimes genuinely impossible.',
    ]),
    p('The last one is the same lesson as everywhere else in this series: the column is free on day one and a multi-week backfill on day two hundred, and the backfill can fail outright if the information was never recorded.'),
    img('costly-mistakes', 'Four structural flaws in a stored record, ordered by the effort required to correct each', 'All four are five-minute decisions before launch. Two of them are unrecoverable afterwards.'),

    h2('How do you handle transactions?'),
    p('By designing so you rarely need them, and by knowing they exist for the cases where you do.'),
    p('MongoDB has multi-document transactions and they work. They are also more expensive than single-document operations and they carry a time limit, so reaching for them habitually is a sign the model is fighting the database rather than a sign you are being careful.'),

    h3('A single document update is already atomic'),
    p('Every update to one document is atomic, including updates that modify several fields and array elements at once. That is the real argument for embedding: an order and its line items in one document means adjusting a quantity and a total together needs no transaction at all.'),

    h3('Use them for the genuine cross-document cases'),
    p('Moving a balance between two accounts, or creating a record and consuming a quota held elsewhere, are real multi-document operations and should be transactional. Keep them short, keep the number of documents small, and expect to handle a transient error and retry — that is a documented part of the model rather than a failure.'),

    h3('Design the common path to be one document'),
    p('Where a workflow keeps needing two documents changed together, that is information about the model. Frequently the two belong in one document, and the transaction was compensating for a boundary drawn in the wrong place.'),

    h2('When should this be Postgres instead?'),
    p('More often than the MERN acronym implies, and it is worth being honest about since I build on both.'),
    p('MongoDB is a good fit when documents are genuinely document-shaped: variable structure per record, nested data read as a unit, and few relationships that need joining. Content, event payloads, configuration and product catalogs with heterogeneous attributes all fit.'),
    p('It is a poor fit when your data is relational and you are simulating joins in application code. If half your queries fetch a document and then fetch three referenced collections and stitch them together, you have written a query planner by hand, and it is slower and buggier than the one Postgres ships with.'),
    table('Which one, by what the data looks like', [
      ['Data shape', 'Better fit'],
      ['Variable fields per record, read as a unit', 'MongoDB'],
      ['Heavily relational, joins in most queries', 'Postgres'],
      ['Strong transactional guarantees across entities', 'Postgres'],
      ['High write volume of self-contained events', 'MongoDB'],
      ['Reporting and ad-hoc aggregate queries', 'Postgres'],
    ]),
    p('The decision is genuinely about the data rather than about preference, and the failure mode is choosing by familiarity and then fighting the choice for two years. If you are not sure, [the questions in a stack decision](/blog/project-stack-templates) apply here as much as anywhere.'),

    h2('What should you do on day one?'),
    p('Six things, none of which take more than an hour, all of which are expensive later.'),
    ol([
      '**Put the tenant or owner field on every collection**, and lead every index with it.',
      '**Turn on schema validation** at `moderate`, derived from the same definition your application validates against.',
      '**Store money as integers and dates as dates.** Name the money field for its unit.',
      '**Decide embed versus reference per relationship** explicitly, and write the reason down. The reason is what tells the next person whether it still holds.',
      '**Create the compound indexes your known queries need**, in equality-sort-range order, rather than single-field indexes on everything.',
      '**Set the slow query threshold low in staging** so the missing index tells you about itself.',
    ]),
    quote('MongoDB does not stop you from modelling badly, which means the modelling discipline has to come from you rather than from an error message.'),

    h2('Conclusion'),
    p('Embed what is bounded and only ever read with its parent; reference everything that grows with usage or is queried on its own. The test that decides it: if updating the duplicate everywhere would be a bug, reference it — if updating it everywhere would be wrong, embed it.'),
    p('Never embed an array that grows without limit. Performance degrades from the first few hundred elements through document rewrites and index bloat, long before the 16MB ceiling, so by the time the hard error arrives the collection has been slow for months.'),
    p('Build compound indexes in equality, sort, range order and lead every one with the tenant field. The prefix rule is what determines whether an index is used at all, and the sort position is what determines whether MongoDB skips the sort stage or collects everything into memory.'),
    p('Verify with `explain` against production-shaped data and watch the ratio of documents examined to documents returned — that number, not the presence of an index, is what tells you the index is doing its job.'),
    p('Turn on schema validation at `moderate` so it can be adopted on a live collection, derive it from the same definition the application validates against, and get money, dates and the tenant field right before there is data. And check honestly whether the data is document-shaped at all — simulating joins in application code is a sign the answer was Postgres. If you want that decision reviewed before it is load-bearing, [get in touch](/start).'),
  ),
  faqs: faq([
    ['When should you embed instead of reference in MongoDB?',
     'Embed when the child is only ever read with its parent, the set is bounded and small, and it is rarely updated on its own. Reference when the collection grows with usage, is queried independently, or is shared across parents. An unbounded embedded array is the mistake that is hardest to undo.'],
    ['Why is my MongoDB query slow even though there is an index?',
     'Usually the field order. Compound indexes work left to right as a prefix, so a query that does not match a prefix cannot use the index however many of its fields appear in it. Run explain and check for IXSCAN rather than COLLSCAN, and for the absence of an in-memory SORT stage.'],
    ['Should MongoDB collections have schema validation?',
     'Yes. Schemaless means the shape is enforced somewhere else or not at all, and in practice that means inconsistently across several places in application code. Start at validationLevel moderate so existing documents keep working and history can be corrected gradually.'],
    ['How large can an embedded array get before it is a problem?',
     'Long before the 16MB document limit. Every update rewrites the whole document, and an index on a field inside the array creates one entry per element, so throughput degrades from a few hundred elements onward. Treat anything that grows with usage as a separate collection.'],
  ]),
};
