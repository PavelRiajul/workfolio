import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/multi-tenant-prisma-postgres/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-multi-tenant-prisma-postgres',
  slug: 'multi-tenant-prisma-postgres',
  title: 'Multi-Tenant Data Isolation in Prisma and Postgres',
  category: 'fullstack',
  order: 35,
  readTime: '13 min read',
  date: 'August 2026',
  publishedAt: '2026-08-19',
  series: 'B2B',
  excerpt:
    'Shared schema, schema-per-tenant or database-per-tenant — and the middleware that stops a missing where clause leaking another customer’s data.',
  coverLabel: 'Multi-tenant isolation — cover',
  body: body(
    p('There is one bug that matters in a multi-tenant application, and it is not a performance problem. It is a query somewhere that forgot to filter by tenant, returning another customer\'s rows to somebody who should never see them.'),
    p('It does not throw. Nothing in the logs looks wrong. It surfaces when a user recognises a company name that is not theirs, which is the worst possible way to discover it and the one that ends contracts.'),
    p('This is how to make that structurally difficult rather than a matter of remembering, using the [Neon and Prisma setup](/blog/supabase-vs-neon-clerk) I build B2B products on.'),

    h2('What are the three isolation models?'),
    p('They differ in where the boundary sits, and the trade is always isolation strength against operational cost.'),
    table('The three models compared', [
      ['Model', 'Isolation', 'Ops cost', 'Best for'],
      ['Shared schema, tenant column', 'Logical', 'Low', 'Most SaaS'],
      ['Schema per tenant', 'Strong', 'Medium', 'Regulated data'],
      ['Database per tenant', 'Strongest', 'High', 'Few large enterprise customers'],
    ]),
    p('Almost everything should be shared schema. The other two exist for genuine constraints — a compliance requirement naming physical separation, or a customer contract demanding their own database — and both cost real operational effort per tenant that scales badly past a few dozen.'),
    p('It is worth noticing that the isolation column is about where the boundary is enforced rather than how strong it is in practice. A shared schema with policies enforced by the database is meaningfully safer than separate databases where the application picks the connection string from user input, and the second arrangement is more common than it should be.'),

    h2('How does shared schema actually work?'),
    p('Every table holding customer data carries an organisation reference, and every query filters on it. That is the whole model, and its weakness is right there in the word "every".'),
    code('ts', `
model Document {
  id        String   @id @default(uuid(7))
  orgId     String                          // on every customer-owned table
  title     String
  createdAt DateTime @default(now())

  org       Organization @relation(fields: [orgId], references: [id])

  // Filter column first, sort column second, or the sort will not use it.
  @@index([orgId, createdAt(sort: Desc)])
}
`),
    p('The index matters as much as the column. Nearly every query in a tenant-scoped application starts with the organisation and orders by time, and a composite index on that pair is what keeps it fast as the table grows past a few million rows.'),
    p('What this model does not give you is any protection when the filter is forgotten. That is the next three sections.'),
    img('shared-schema', 'A single container with contents grouped into distinct labelled regions', 'One table, logical partitions. Fast and cheap, and it depends entirely on the filter.'),

    h2('What does the leaking query look like?'),
    p('Boring, which is why it survives review.'),
    code('ts', `
// The intended query.
const docs = await prisma.document.findMany({
  where: { orgId, status: 'active' },
});

// The one added in a hurry for an admin report, six weeks later.
const docs = await prisma.document.findMany({
  where: { status: 'active' },        // no orgId — returns every tenant
  orderBy: { createdAt: 'desc' },
});
`),
    p('The second is not obviously wrong on its own. It becomes wrong because of a constraint that lives in a different file and in somebody\'s head. Reviewers reading a diff about reporting do not reliably notice a missing clause in a where object.'),
    p('These appear in predictable places: exports, admin views, reports, background jobs, and anything written against a deadline. All four are code paths where the author is thinking about the output format rather than about tenancy.'),
    p('Raw SQL is the other reliable source. The moment somebody drops to a raw query for a report or an aggregate that the ORM expresses awkwardly, every automatic protection is bypassed — the query goes straight to the database with whatever filters were typed by hand. That is not an argument against raw SQL, which is frequently the right tool; it is an argument for row-level policies underneath, since they are the only layer a raw query cannot skip.'),

    h2('How do you enforce it in Prisma?'),
    p('A client extension that injects the tenant filter on every query, so forgetting it is not possible rather than not recommended.'),
    code('ts', `
// One tenant-scoped client per request. Every query gets the filter,
// whether or not the caller remembered it.
export function tenantClient(orgId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          args.where = { ...args.where, orgId };
          return query(args);
        },
      },
    },
  });
}
`),
    p('Two details make this work in practice. `TENANT_MODELS` is an explicit list, because global tables — plans, feature flags, country codes — must not be filtered and would return nothing if they were. And the filter is applied last so a caller cannot accidentally override it by passing their own `orgId`.'),
    p('The remaining hole is anyone importing the base client directly. Close that with a lint rule banning the raw import outside the file that constructs the scoped one. A convention that is enforced is a control; a convention that is documented is a hope.'),

    h2('Where does row-level security fit?'),
    p('Underneath, as the backstop that catches whatever gets past the application.'),
    p('Postgres policies are evaluated by the database itself, so a query that reaches it without a tenant filter still returns nothing. That is the difference between a bug that leaks data and a bug that returns an empty list — one is an incident and the other is a ticket.'),
    code('sql', `
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON documents
  USING (org_id = current_setting('app.current_org', true));
`),
    p('The application sets `app.current_org` at the start of each request or transaction. With a connection pool this needs care: the setting must be scoped to the transaction rather than the session, or a pooled connection carries one tenant\'s context into another\'s request — which is a considerably worse bug than the one you were preventing.'),
    p('Note that the database owner and any superuser bypass policies entirely, so the application must connect as a restricted role. A policy that the application user bypasses is decoration.'),
    img('two-layers', 'Two concentric barriers around a data core, the inner one continuous', 'The extension is the control. The policy is the backstop for whatever gets past it.'),

    h2('How do you test isolation properly?'),
    p('With tests written from the attacker\'s position, not the user\'s.'),

    h3('Seed two tenants, always'),
    p('Every integration test fixture should contain at least two organisations with overlapping-looking data. A test suite with one tenant cannot detect a missing filter, because there is nothing to leak.'),

    h3('Assert on absence, not presence'),
    p('The useful assertion is that tenant B\'s records do not appear in tenant A\'s results — not merely that tenant A\'s do. Those are different tests and only the first catches the bug.'),

    h3('Test by id, not just by list'),
    p('A list endpoint that filters correctly may sit beside a detail endpoint that fetches by primary key without checking ownership. Request tenant B\'s record id as tenant A and assert a not-found, which is also the correct response — a forbidden reveals that the id is real.'),

    h3('Cover the paths nobody thinks about'),
    p('Exports, reports, webhooks, background jobs, admin views. These are where the leaks actually live, and they are the least-tested code in most applications precisely because they are not the main flow.'),

    h2('What about migrations across tenants?'),
    p('On shared schema this is the model\'s biggest advantage: one migration, applied once, done.'),
    p('Schema-per-tenant means running every migration N times, handling the case where it succeeds for 40 tenants and fails on the 41st, and living with a system that is temporarily in two states. Database-per-tenant is the same problem plus connection management.'),
    p('That difference is worth more than it first appears. With shared schema a migration is an ordinary deploy concern; with the alternatives it is a distributed operation with partial-failure semantics, and it needs tooling and a runbook of its own.'),
    p('It is also why per-tenant models scale badly with tenant count rather than with data volume. Fifty tenants is manageable. Five thousand is a platform team.'),

    h2('How do you handle the noisy neighbour?'),
    p('The objection people raise against shared schema is that one heavy customer degrades everyone. It is a real effect and it is almost never solved by separating the data.'),
    p('The usual cause is a single tenant with far more rows than the rest, and the fix is indexing rather than isolation. A composite index starting with the tenant column means a query for a small tenant does not care how large the biggest one is — the index scan is scoped before any rows are read.'),
    p('Where a genuine problem remains, it is usually one of three things: a query without a tenant-leading index doing a sequential scan, an unbounded result set where a large tenant returns a hundred thousand rows to a page expecting fifty, or a background job for one tenant occupying every worker. All three are addressed with limits and queue concurrency caps rather than with separate databases.'),
    p('Separating the data does fix noisy neighbours, at the cost of multiplying every migration, every connection pool and every operational task by tenant count. That trade is worth making for a handful of very large customers and is a poor one below that, which is why the honest answer is nearly always to fix the index first and measure again.'),
    img('noisy-neighbour', 'One oversized element among many small ones, contained by a boundary rather than removed', 'Almost always an indexing problem wearing a scaling costume.'),

    h2('When is schema-per-tenant actually right?'),
    p('Three situations, and none of them is "our customers are large".'),
    ul([
      '**A compliance requirement naming separation.** Some regulated sectors specify it, and an auditor is not persuaded by row-level security however sound it is.',
      '**A contractual commitment** made during a sale. Occasionally the honest answer is that this was promised and now has to be delivered.',
      '**Genuinely divergent schemas per customer** — an enterprise product where tenants have custom fields and tables. Rare, and usually better solved with a JSON column.',
    ]),
    p('What is not on the list: performance. A shared schema with proper composite indexes handles very large tenant counts, and the noisy-neighbour problem is better addressed with query limits and connection pooling than with physical separation.'),
    img('when-separate', 'Three separated containers beside one partitioned container, the partitioned one lit', 'Almost always the partitioned one. The others are for compliance and contracts, not performance.'),

    h2('How do you handle a user in several organisations?'),
    p('A membership table, and an explicit current-organisation concept in the session.'),
    p('The common mistake is putting `orgId` on the user record, which makes belonging to two organisations impossible and is exactly the kind of thing that becomes a schema migration later. Membership is a relationship, so it belongs in its own table with the role on it.'),
    code('ts', `
model Membership {
  userId String
  orgId  String
  role   String                 // owner | admin | member

  @@id([userId, orgId])         // one membership per pair
  @@index([orgId])              // "who is in this org"
}
`),
    p('The session then carries a current organisation, validated against membership on every request. Validated, not trusted — a client that can set its own current organisation is a client that can read any tenant by changing a value, which is the same leak arriving through the front door.'),
    p('Switching organisations then needs care about anything cached per user rather than per membership. A user with two organisations who switches while a cached list is still warm will see the previous tenant\'s data, which looks exactly like a leak to whoever reports it. Include the current organisation in every cache key that holds tenant data, and invalidate on switch.'),
    p('Invitations are the other place this model gets fiddly. An invite is sent to an email address that may not correspond to an account yet, so it cannot reference a user id. Model it as its own record keyed by email and organisation, consumed when somebody signs up or accepts while logged in — and expire them, because an invitation that works indefinitely is a standing grant to whoever eventually controls that address.'),

    h2('What else leaks besides database rows?'),
    p('Four surfaces that sit outside the query layer entirely, and are missed precisely because the database work felt like the whole job.'),

    h3('Uploaded files'),
    p('Object storage has no tenant column. A file at a guessable path is readable by anyone who guesses it, and "nobody will guess" is not access control. Prefix every key with the organisation id and serve through short-lived signed URLs issued only after the same membership check the database queries use.'),

    h3('Background jobs'),
    p('A job carries an id and runs later, outside the request that created it. If the worker loads data using an unscoped client — which is the easy way to write it — the tenant filter never applies. Jobs should carry the organisation id in their payload and construct a scoped client from it, exactly as a request does.'),

    h3('Caches and search indexes'),
    p('A cache key without the organisation in it serves one tenant\'s data to another, and it is worse than a database leak because it is intermittent and therefore hard to reproduce. The same applies to any search index: the tenant has to be part of the key or the filter, not applied afterwards.'),

    h3('Error reports and logs'),
    p('Exception payloads frequently contain the record that caused them. Anyone with access to error tracking can then read customer data without touching the application. Scrub before sending, and treat the error tracker as a system that holds production data — because it does.'),
    p('Each of these needs the same membership check the database uses, which is an argument for that check living in one function rather than being reimplemented per surface. [Deriving it from one place](/blog/type-safe-mern) is the same discipline that stops types drifting.'),
    img('other-surfaces', 'Four peripheral containers around a central protected core, one unsealed', 'The database is one surface. Files, jobs, caches and error reports are four more.'),

    h2('How do you find the leaks you already have?'),
    p('Three passes, in increasing order of effort, and the first finds most of them.'),

    h3('Grep for the unscoped client'),
    p('Every direct import of the base Prisma client outside the file that builds the scoped one is a candidate. This is a five-minute audit and it reliably surfaces the exports and admin views that were added quickly.'),

    h3('Turn on policies in staging and watch what breaks'),
    p('With row-level security enabled, any query missing its tenant context returns nothing rather than everything. Run the application against production-shaped data on a branch and the broken pages are the list of unfiltered queries — an unusually direct way to find them.'),

    h3('Write the two-tenant test suite before fixing anything'),
    p('Seed two organisations and assert absence across every endpoint. The failures are the audit, and unlike a manual review the suite keeps working afterwards. This is the same reasoning as [gating on tests rather than intentions](/blog/project-stack-templates) — a check that runs is a control, and a checklist is a hope.'),
    img('finding-leaks', 'A surface with several marked points, three highlighted by different inspection methods', 'Policies in staging turn an invisible bug into a visibly broken page.'),

    h2('What does this cost in practice?'),
    p('A day or two on a new project, and considerably more retrofitted.'),
    p('On a greenfield build: an `orgId` column on customer tables, one client extension, policies on the tenant-scoped tables, and two-tenant test fixtures. Perhaps two days including the tests, and it is invisible thereafter.'),
    p('Retrofitting is the expensive path — a column on every table, a backfill inferring which tenant historical rows belong to, an audit of every existing query, and policies added to a schema whose queries were written assuming their absence. Two to four weeks is realistic, and the backfill is the part that can genuinely be impossible if the information was never recorded.'),
    quote('The column is free on day one and a multi-week migration on day two hundred. That asymmetry is the entire argument for adding it before you need it.'),

    h2('Conclusion'),
    p('Use shared schema with a tenant column unless a compliance requirement or a contract says otherwise. Put `orgId` on every customer-owned table with a composite index on it and your common sort column.'),
    p('Then make forgetting the filter impossible rather than discouraged: a Prisma client extension that injects it on every query, a lint rule preventing direct use of the unscoped client, and row-level policies underneath as the backstop for whatever still gets through.'),
    p('Test from the attacker\'s side with two tenants seeded, asserting that the other tenant\'s data is absent — including on fetch-by-id, exports and background jobs, which is where the real leaks live. The whole thing is about two days on a new project, and it is the difference between a bug that returns an empty list and one that ends a contract.'),
    p('And remember the surfaces outside the database. Files in object storage, cache keys, search indexes, job payloads and error reports all hold tenant data and none of them is protected by a Postgres policy. Each needs the same membership check, which is the argument for that check existing once in a function everything calls rather than being reimplemented per surface.'),
    p('If you are adding this to something already live, start by enabling policies against a branch with production-shaped data. The pages that break are your list of unfiltered queries, and it is a far more direct audit than reading code hoping to spot a missing clause. Fix those, add the client extension so new code cannot reintroduce the problem, then write the two-tenant suite so the fix stays fixed.'),
  ),
  faqs: faq([
    ['What is the safest multi-tenant database design?',
     'Shared schema with a tenant column, a query layer that injects the filter automatically, and row-level security as a backstop. Schema-per-tenant is stronger but multiplies migration and operational cost per tenant, and is justified by compliance rather than by performance.'],
    ['How do you stop one tenant seeing another tenant\'s data?',
     'Do not rely on remembering the filter. Inject it in a Prisma client extension on every query, ban direct use of the unscoped client with a lint rule, and add Postgres row-level policies so a query reaching the database unfiltered returns nothing rather than everything.'],
    ['Does row-level security slow Postgres down?',
     'Marginally, and far less than the cost of a leak. The policy becomes part of the query plan and behaves like an extra predicate. With an index on the tenant column the impact is usually not measurable at typical scale.'],
    ['How do you run migrations across thousands of tenants?',
     'On shared schema you do not — one migration applies to everyone at once, which is the model\'s largest practical advantage. Schema-per-tenant means running each migration N times with partial-failure handling, which needs its own tooling and a runbook.'],
  ]),
};
