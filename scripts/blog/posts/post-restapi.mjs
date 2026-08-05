import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/rest-api-design/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-rest-api-design',
  slug: 'rest-api-design',
  title: 'REST API Design Decisions That Age Well',
  category: 'backend',
  order: 53,
  readTime: '13 min read',
  date: 'February 2026',
  publishedAt: '2026-02-21',
  series: 'Foundations',
  excerpt:
    'Pagination, errors, versioning and partial updates — the four choices that are trivial before launch and permanent afterwards.',
  coverLabel: 'REST API design — cover',
  body: body(
    p('An API is the hardest thing in a codebase to change, because the people depending on it do not work for you. Everything else can be refactored on a Tuesday; a response shape somebody parses in their own code is permanent until you can persuade them to update.'),
    p('Which means the decisions worth spending time on are not the interesting ones. They are the boring, structural ones — how you paginate, what an error looks like, how you version — because those are the ones that leak into every endpoint and cannot be corrected later without breaking somebody.'),
    p('This is the set I apply on every API I build, whether it is Express behind a Next.js front end or route handlers doing both jobs. It is the same reasoning as [choosing a stack once](/blog/project-stack-templates): decide well early, then stop deciding.'),

    h2('What should a resource URL look like?'),
    p('Plural nouns, nested only one level deep, and no verbs. This is close to settled and the value is in the consistency rather than in any single rule.'),
    code('http', `
GET    /orders                 # list
POST   /orders                 # create
GET    /orders/:id             # read
PATCH  /orders/:id             # partial update
DELETE /orders/:id             # remove

GET    /orders/:id/items       # a genuine sub-resource, one level
GET    /items?orderId=:id      # the same thing, and it scales better
`),
    p('The second-to-last and last lines are the interesting pair. Nesting reads nicely and stops being pleasant at two levels — `/orgs/1/projects/2/tasks/3/comments` is a URL nobody enjoys constructing, and it forces the client to know a hierarchy that may change.'),
    p('My rule is one level of nesting when the child genuinely cannot exist without the parent, and a filter parameter otherwise. That keeps most collections addressable at the top level, which is what you want when a new screen needs "all tasks assigned to me" across every project.'),

    h3('Verbs in URLs are sometimes correct'),
    p('The purist position is that everything is a resource. In practice some operations are actions with side effects that no noun describes honestly — `POST /orders/:id/refund`, `POST /invitations/:id/resend`. Modelling those as a resource creation produces contortions that are less clear, not more.'),
    p('Use them sparingly and deliberately. A handful of action endpoints among fifty resource endpoints is fine; an API where everything is a verb has stopped being REST and should probably admit it.'),
    img('url-shape', 'A shallow tree of addressable collections beside a deeply nested one', 'One level of nesting. Past that, the hierarchy is the client\'s problem and it changes.'),

    h2('Which pagination do you pick?'),
    p('Cursor, unless you have a specific reason not to. This is the decision most often made by default and most expensive to reverse.'),
    table('Two kinds of pagination', [
      ['', 'Offset / page', 'Cursor'],
      ['Client complexity', 'Trivial', 'Slightly more'],
      ['Jump to page 40', 'Yes', 'No'],
      ['Correct under inserts', 'No — items shift', 'Yes'],
      ['Cost at page 5,000', 'Scans everything skipped', 'Constant'],
      ['Total count available', 'Yes, at a cost', 'Not naturally'],
    ]),
    p('The row that decides it is "correct under inserts". With offset pagination, a row added while a user is reading page two pushes an item from page two onto page three — so they see it twice, or never. On a feed with steady writes this is not an edge case, it is the normal behavior.'),
    code('ts', `
// Cursor pagination. The cursor encodes the sort key of the last item.
const items = await db.order.findMany({
  where: { orgId, ...(cursor && { createdAt: { lt: decode(cursor) } }) },
  orderBy: { createdAt: 'desc' },
  take: limit + 1,                       // one extra tells you if there is more
});
const hasMore = items.length > limit;
return { data: items.slice(0, limit), nextCursor: hasMore ? encode(last) : null };
`),
    p('Fetching one extra row is the neat trick in there: it answers "is there another page" without a count query, which on a large filtered table is often more expensive than the page itself.'),

    img('pagination-drift', 'A windowed view over a sequence where an insertion shifts items across the window boundary', 'One insert during reading, and an item moves from page two to page three. The reader sees it twice, or not at all.'),

    h3('Sort by something unique'),
    p('A cursor on `createdAt` breaks when two rows share a timestamp — the page boundary lands between identical values and rows are skipped or repeated. Sort by the timestamp and the id together, and encode both in the cursor. This bug appears exactly when a bulk import creates a thousand rows in the same second.'),

    h3('Treat the cursor as opaque'),
    p('Base64 it and document it as meaningless. The moment a client parses your cursor, its internal structure is part of your contract and you cannot change the sort without breaking them.'),

    h2('What should an error look like?'),
    p('Consistent, machine-readable, and with a stable code that is not the HTTP status.'),
    code('json', `
{
  "error": {
    "code": "insufficient_seats",
    "message": "Your plan includes 5 seats and all 5 are in use.",
    "details": { "limit": 5, "used": 5 },
    "requestId": "req_01J8X2..."
  }
}
`),
    p('Four fields, each doing a distinct job. The `code` is what client code branches on and it must never change. The `message` is for humans and can be reworded freely. `details` carries the specifics a good error message needs. And `requestId` is what turns a support conversation from guesswork into a log lookup.'),

    h3('The status code is not enough information'),
    p('A 400 tells a client that something about the request was wrong. It does not distinguish a malformed body from a business rule refusal, and those need completely different handling — one is a bug, the other is a message to show the user. That is the entire reason for a separate code field.'),

    h3('Return all the validation errors, not the first'),
    p('A form submission with three invalid fields should come back with three errors. Returning the first means the user fixes it, resubmits, and discovers the second — three round trips for one form. [Validating with a schema](/blog/validating-llm-tool-calls-zod) gives you the full set for free; returning only one is throwing that away.'),

    h3('Never leak internals in the message'),
    p('A stack trace, a SQL fragment or a constraint name in a public error response is reconnaissance. Log the detail with the request id, return the id, and let the person with access to the logs correlate them.'),
    img('error-shape', 'A structured response with separate channels for machine handling, human reading and correlation', 'The status is a category. The code is the contract. The request id is what makes support possible.'),

    h2('How should you version?'),
    p('In the URL, and only when you actually break something. Both halves of that matter.'),
    p('`/v1/orders` is unambiguous, visible in logs, cacheable and trivially routable. Header-based versioning is more elegant and less operable — you cannot tell which version a request used by reading an access log, and that is worth more than the elegance.'),
    p('The more important half is the second: most changes do not need a version. Adding a field, adding an endpoint, adding an optional parameter — none of these break a client that ignores what it does not recognize. Versioning every change produces `/v7` within a year and an obligation to maintain seven code paths.'),
    table('What breaks a client and what does not', [
      ['Change', 'Breaking?'],
      ['Adding a response field', 'No'],
      ['Adding an optional request parameter', 'No'],
      ['Adding a new endpoint', 'No'],
      ['Removing or renaming a field', 'Yes'],
      ['Changing a field\'s type or format', 'Yes'],
      ['Making an optional parameter required', 'Yes'],
      ['Changing the meaning of a value', 'Yes, and silently'],
    ]),
    p('The last row is the dangerous one because nothing detects it. A `status` field that used to mean one thing and now means another will not fail any client\'s parser — it will just make their logic quietly wrong, which is considerably worse than an error.'),

    p('There is a middle path worth knowing about for the cases where you genuinely must change something. Keep the old field alongside the new one, populate both, and instrument which clients still read the old one. When the count reaches zero you can remove it without a version bump at all — and when it does not, you at least know exactly whom to email. That is the same expand-and-contract shape as [a schema change](/blog/zero-downtime-migrations), applied to a public contract instead of a table.'),

    h3('Additive change is a discipline, not a technique'),
    p('If you can hold the line on additive-only changes, you may never need a second version. That means tolerating a field name you regret and a response shape that carries a little history — which is a real cost, and still cheaper than maintaining two versions of everything.'),

    h2('PUT or PATCH?'),
    p('PATCH for updates, and be explicit about how you treat a missing field versus a null one.'),
    p('PUT is a replacement: whatever you send becomes the resource, and omitted fields are cleared. That is rarely what a client means, and a PUT implemented as a partial update is worse than either — it is a lie about the semantics that somebody will eventually rely on.'),
    code('json', `
// PATCH — three distinct intentions, and they must be distinguishable.
{ "name": "New name" }        // change name, leave everything else
{ "note": null }              // explicitly clear the note
{ }                           // change nothing
`),
    p('The null case is where implementations get it wrong. If your deserializer collapses "absent" and "null" into the same thing, clients cannot clear a field at all, and you will discover this from a support ticket rather than from a test.'),

    p('The other thing PATCH needs is a story for concurrent edits. Two clients reading a record and each patching a different field will both succeed, and the second write silently discards nothing — which is fine. Two clients patching the *same* field means the later one wins with no indication that it overwrote anything. If that matters for your data, return a version on reads and require it on writes, rejecting a stale one with a 409.'),

    h3('Return the updated resource'),
    p('A 204 with no body forces the client into a second request to see the result, including any server-computed fields. Returning the full updated object costs nothing and removes a round trip from every mutation.'),

    h2('What about filtering and sorting?'),
    p('Query parameters with an explicit allowlist, never a pass-through to the database.'),
    code('ts', `
// The allowlist is the security boundary. Anything not on it is rejected,
// not ignored — ignoring an unknown filter silently returns wrong data.
const SORTABLE = new Set(['createdAt', 'total', 'status']);
const FILTERABLE = new Set(['status', 'customerId']);
`),
    p('A generic filter syntax that maps onto your query builder is a tempting piece of engineering and it is how an API becomes impossible to change — the database schema becomes the public contract, and every column rename is a breaking change.'),

    h3('Reject unknown parameters loudly'),
    p('Silently ignoring `?statuss=open` returns every order, which the client renders as though the filter worked. A 400 naming the unknown parameter turns a subtle data bug into an obvious mistake, and it costs one line.'),

    h3('Every list endpoint needs a default limit'),
    p('An endpoint with no cap returns fifty thousand rows the first time a customer\'s data grows, and it takes the process with it. Default to something small, cap the maximum, and document both.'),
    img('allowlist', 'A set of permitted parameters gating access to an underlying structure', 'The allowlist keeps the schema private. A generic filter syntax publishes it.'),

    h2('How do you handle authentication and rate limits?'),
    p('With a bearer token, a scope model, and limits that are visible in the response rather than discovered by hitting them.'),

    h3('Keys are not sessions'),
    p('A browser session and a machine credential have different lifetimes, different revocation needs and different storage. An API key should be long-lived, individually revocable, scoped to a set of permissions, and displayed exactly once at creation — stored as a hash, never retrievable afterwards.'),
    code('ts', `
// Prefix the key so it is identifiable in a leaked log or a public repo,
// and store only the hash.
const raw = \`sk_live_\${randomBytes(24).toString('base64url')}\`;
await db.apiKey.create({ data: { hash: sha256(raw), prefix: raw.slice(0, 12), scopes } });
return raw;   // the only time this value exists outside the client
`),
    p('The prefix earns its keep twice: it lets you show the user which key is which without storing the secret, and it lets secret-scanning tools recognize your keys in a public repository and tell you before somebody else finds them.'),

    h3('Tell the client where it stands'),
    p('Rate limit headers on every response — the limit, the remaining count and when the window resets — let a well-behaved client slow itself down. Without them the only way to discover a limit is to exceed it, which means your best-integrated customers are the ones getting 429s.'),

    h3('429 must say when to retry'),
    p('A rejection with a `Retry-After` header is actionable. One without is an invitation to retry immediately, which is how a rate limit turns into a retry storm. This is the same shape as [rate limiting expensive features](/blog/rate-limiting-ai-features) — the limit is only half the design, and the client\'s response to it is the other half.'),
    img('key-lifecycle', 'A credential shown once at creation and thereafter represented only by a short identifying fragment', 'Shown once, stored as a hash, identifiable by its prefix. The prefix is what lets a scanner warn you before an attacker finds it.'),

    h2('How do you document it?'),
    p('From the code, so the documentation cannot describe an API that does not exist.'),
    p('Hand-written API docs are accurate on the day they are written. Generating an OpenAPI document from the same schemas that validate requests means the description and the behavior have one source, and a change to one is a change to both.'),
    p('This is the same argument as [deriving types from one place](/blog/type-safe-mern), and it applies with more force here because the audience is external. A wrong type in your own codebase is a compile error; a wrong type in your public documentation is somebody else\'s afternoon.'),

    h3('Document the errors, not just the happy path'),
    p('Most API documentation lists request and response shapes and says nothing about what can go wrong. The error codes are the part a client integrating with you actually needs, because handling them is most of the integration work.'),

    p('Keep a changelog too, dated, listing every addition. Consumers cannot adopt a field they do not know exists, and a changelog is how an integration built a year ago finds out that the thing it works around has since been solved.'),

    h3('Give people something to run'),
    p('A curl example per endpoint with a real request body is worth more than a schema table. It is the thing people copy, and it is the fastest possible path from reading to a working call.'),

    h2('What do you get wrong the first time?'),
    p('Four things, consistently, on nearly every API I have reviewed including my own early ones.'),
    ol([
      '**Timestamps without timezones.** Store and return ISO-8601 with an offset, always UTC. A bare date-time string is ambiguous and the ambiguity surfaces as an off-by-hours bug in somebody else\'s client.',
      '**Numbers for money.** Floating point cannot represent currency exactly. Use integer minor units and name the field accordingly — `amountCents`, not `amount`.',
      '**Enums that grow.** A client with a switch over four statuses breaks when you add a fifth. Document that new values may appear and that unknown ones must be tolerated, from version one.',
      '**IDs that are integers.** Sequential ids leak volume, are enumerable, and make merging data across environments painful. Use UUIDs or a prefixed identifier from the start.',
    ]),
    p('Each of these is a five-minute decision before launch and a breaking change afterwards. The enum one is the sneakiest, because it does not break until you ship a feature and then it breaks in somebody else\'s deployment rather than yours.'),
    quote('Every one of these is trivial to get right on day one and impossible to fix without breaking somebody on day two hundred. That asymmetry is the whole reason to think about them early.'),

    h2('When should it not be REST?'),
    p('When the client\'s needs vary so widely that every screen wants a different shape, or when the operations are genuinely not resource-shaped.'),
    ul([
      '**A single first-party client** — a Next.js app talking to its own route handlers — barely needs an API at all. Server components and actions remove the boundary entirely, and inventing one adds a serialization step for nothing.',
      '**Many clients with divergent needs** are where GraphQL earns its complexity. If you have one web app, it does not.',
      '**Real-time or streaming** is not REST-shaped and should not be forced into it. Use SSE or WebSockets and keep them separate.',
    ]),
    p('The honest position is that most projects I build need a REST API for exactly one reason: something other than the web app consumes it — a mobile client, a customer integration, an automation. If nothing does yet, keep the boundary internal and add the public API when there is a second consumer, because designing a public contract for a hypothetical audience is how you get one that fits nobody.'),
    img('when-rest', 'A single consumer connected directly, beside several consumers behind a shared contract', 'One client does not need a public contract. The second one is what makes it worth designing.'),

    h2('Conclusion'),
    p('Use plural nouns, one level of nesting, and filter parameters beyond that. Reserve verb endpoints for genuine actions and keep them rare enough to be obviously deliberate.'),
    p('Paginate with cursors sorted on a unique key, return one extra row to answer "is there more" without a count, and keep the cursor opaque. Offset pagination silently duplicates and skips items whenever writes happen during reading, which on any active collection is constantly.'),
    p('Give errors a stable machine-readable code separate from the HTTP status, return every validation failure rather than the first, include a request id, and never let an internal detail into the message. That single response shape is most of what makes an API pleasant to integrate with.'),
    p('Version in the URL and only when you break something — additive changes need no version, and holding that line is what keeps you at v1 for years. Know which changes are breaking, especially the silent one where a value keeps its name and changes its meaning.'),
    p('Then get the four boring things right on day one: timestamps with offsets, money in integer minor units, enums documented as extensible, and non-sequential ids. Each is five minutes now and a breaking change later. If you are designing an API that customers will integrate against and want the contract reviewed before it is public, [that is worth an hour of someone else\'s eyes](/start).'),
  ),
  faqs: faq([
    ['Should an API use cursor or offset pagination?',
     'Cursor, unless users genuinely need to jump to a numbered page. Offset pagination shifts items when rows are inserted during reading, so users see duplicates or miss records, and it gets slower the deeper you go. Cursor pagination is constant-cost and stable under writes.'],
    ['When should you version a REST API?',
     'Only when you break something. Adding fields, endpoints or optional parameters does not break a client that ignores what it does not recognize. Versioning every change produces a maintenance burden of several parallel code paths within a year, for no benefit to anyone.'],
    ['What is the difference between PUT and PATCH?',
     'PUT replaces the resource, so omitted fields are cleared. PATCH applies a partial update. Use PATCH for normal updates, and make sure your deserializer distinguishes an absent field from an explicit null — otherwise clients cannot clear a value at all.'],
    ['Should error responses include a code separate from the HTTP status?',
     'Yes. A 400 cannot distinguish a malformed body from a business rule refusal, and those need different handling — one is a bug, the other is a message for the user. A stable string code is what client logic branches on; the human-readable message stays free to change.'],
  ]),
};
