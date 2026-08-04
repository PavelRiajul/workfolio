import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/supabase-vs-neon-clerk/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-supabase-vs-neon-clerk',
  slug: 'supabase-vs-neon-clerk',
  title: 'Supabase or Neon + Clerk? The Org Model Test',
  category: 'fullstack',
  order: 32,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-16',
  series: 'Templates',
  excerpt:
    'One vendor for database, auth and storage, or best-of-breed pieces. The single question about your organisation model that settles it.',
  coverLabel: 'Supabase vs Neon — cover',
  body: body(
    p('This gets discussed as a database comparison and it is not one. Both are managed Postgres, both are good, and for the overwhelming majority of applications either would be fine forever.'),
    p('The decision is actually about authentication, and specifically about whether your customers are people or organisations. Answer that and the rest follows, including which database you end up on.'),
    p('These are [the two setups I build from](/blog/project-stack-templates) for anything with a login, so the comparison below is from running both rather than from reading feature pages.'),

    h2('What is actually being compared?'),
    p('Two bundles, not two databases.'),
    p('**Supabase** is Postgres with authentication, file storage, realtime subscriptions and auto-generated APIs in one product, one dashboard and one bill. **Neon + Clerk** is Postgres with branching from one vendor and a dedicated identity product from another, with storage bought separately.'),
    p('Framed that way the trade is obvious: fewer moving parts against better parts. What is not obvious is where the crossover sits, and it sits at organisations.'),
    table('The two bundles', [
      ['Concern', 'Supabase', 'Neon + Clerk'],
      ['Postgres', 'Yes', 'Yes, with branching'],
      ['Authentication', 'Included', 'Clerk'],
      ['Organisations and roles', 'Build it yourself', 'Built in'],
      ['SSO and SAML', 'Manual', 'Included on paid tiers'],
      ['File storage', 'Included', 'Separate (R2)'],
      ['Vendors to manage', 'One', 'Two, plus storage'],
    ]),

    h2('What is the org model test?'),
    p('One question: **is the unit of account a person or an organisation?**'),
    p('If a customer is one person with a login and a card, that is Supabase. If a customer is a company where several people share data, one of them administers the others, and the invoice goes to the company, that is Clerk.'),
    p('Note what the question is not. It is not whether your customers are businesses — plenty of B2B products have exactly one user per customer, and those are person-shaped. It is not company size. It is whether two people from the same customer will ever need to see the same records.'),
    p('The reason this single question decides so much is that organisation modelling is the one thing in the bundle that is genuinely hard to build and genuinely hard to retrofit. Everything else — email login, password reset, file uploads — is comparable work on either stack.'),
    img('org-test', 'A single figure marker beside a grouped cluster marker, one edge-lit', 'Person or organisation. That question decides more than any feature comparison.'),

    h2('What does Supabase give you in one box?'),
    p('More than people expect, and the integration is the value rather than any individual component.'),

    h3('Auth that knows about your tables'),
    p('The auth system and the database are the same system. `auth.uid()` is available inside a row-level security policy, which means a permission rule can live next to the data it protects rather than in application code that might be bypassed.'),

    h3('Storage with the same permission model'),
    p('File access uses the same policies as table access. On a split stack you are wiring an identity provider to an object store yourself, which is not difficult and is one more thing that can be subtly wrong.'),

    h3('Realtime without extra infrastructure'),
    p('Subscribe to table changes over a websocket with no additional service. For anything collaborative or live-updating, this removes a whole component from the architecture.'),

    h3('One place to look when something breaks'),
    p('Underrated until it matters. A failed signup on Supabase is one dashboard and one log stream. On a split stack it is at least two, and the interesting failures are the ones that fall between them.'),

    h2('Where does Supabase auth start to strain?'),
    p('At organisations, and it is a cliff rather than a slope.'),
    p('Supabase auth models users. It does not model companies containing users, roles within those companies, invitations to people who do not have accounts yet, or a billing relationship with the organisation rather than the individual. All of that is buildable — it is tables, policies and flows — and it is roughly two to four weeks of work you did not plan for.'),
    p('It is also work that is easy to get subtly wrong in ways that leak data. Every query needs an organisation filter, every policy needs to account for role, and the invitation flow has to handle a person accepting an invite to a second organisation while already logged into a first.'),
    p('Single sign-on is the second cliff. Enterprise customers ask for it, it is a per-customer integration, and it is the sort of thing you want to buy rather than build.'),
    p('The specific bug this produces is worth describing, because it is the one that actually happens. A developer writes a query, forgets the organisation filter on one path — usually a report, an export or an admin view added under time pressure — and that endpoint returns every tenant\'s rows. Nothing errors. It surfaces when a customer sees a name they recognise from another company, which is the worst possible way to find out.'),
    p('Row-level security is the defence, and it only works if every table has a policy from the beginning. Adding policies to a schema that has been running without them means auditing every existing query, because a policy that is correct will break the queries that were relying on its absence.'),

    h2('What does Clerk do that is genuinely hard?'),
    p('Three things, all of which are weeks rather than days if you build them.'),
    ul([
      '**Organisations as a first-class object** — membership, roles, permissions, and a current-organisation concept that survives a user belonging to several.',
      '**Invitations** to email addresses that do not yet correspond to accounts, including the flow where the invitee signs up and lands in the right organisation.',
      '**SSO and SAML** per enterprise customer, with the provisioning and directory sync that usually arrives alongside.',
    ]),
    p('If you need all three, buying them is straightforwardly cheaper than building them, and the resulting code is less of yours to maintain. If you need none of them, you are paying for a second vendor and gaining nothing.'),
    img('org-machinery', 'Nested translucent containers with membership markers linking between layers', 'Organisations, invitations and SSO are weeks of work each. Buy them or genuinely do not need them.'),

    h2('What does Neon add?'),
    p('Database branching, which is a genuinely different capability rather than a better version of an existing one.'),
    p('A Neon branch is a copy-on-write copy of your database, created in seconds, with production-shaped data. Give every pull request one and migrations get reviewed against real data before merge, rather than being discovered at deploy time.'),
    p('This is the thing I would miss most moving off it. A shared development database drifts, breaks for everyone when one person runs a bad migration, and never resembles production closely enough to catch the interesting failures. Branch-per-pull-request eliminates all three.'),
    p('It also decouples compute from storage, so an idle branch costs nothing. Fifteen open pull requests with fifteen databases is not fifteen database bills.'),
    p('The second use is recovery. Because a branch is a point-in-time copy, restoring after a bad migration or a mistaken delete means branching from a moment before it happened and inspecting the difference — rather than restoring a nightly dump and losing everything since. That turns a genuinely frightening incident into an ordinary afternoon, and it is the kind of capability whose value is invisible until the day you need it.'),
    p('Neither of these is a reason on its own to choose Neon over Supabase. They are the reason that, once the org model test has already pointed you at the split stack, the database half stops feeling like a compromise.'),

    h2('What is it like to work with each day to day?'),
    p('Feature tables miss the thing that actually determines whether a stack is pleasant, which is what the routine operations feel like at 4pm on a Thursday.'),

    h3('Local development'),
    p('Supabase runs locally in Docker with the full stack — database, auth, storage — so an offline environment matches production closely. Neon has no local mode; you develop against a branch, which is arguably better for fidelity and worse on a train.'),

    h3('Schema changes'),
    p('Both are Postgres, so Prisma migrations behave identically. The difference is review: with branching, a migration runs against production-shaped data in the pull request. Without it, staging is your only signal and staging data is usually thinner than production.'),

    h3('Seeing what went wrong'),
    p('Supabase puts auth logs, database logs and storage in one place. On a split stack the interesting failures are the ones spanning both vendors — a user exists in the identity provider and has no row in your database, which is two dashboards and a theory.'),

    h3('The dashboard as a working tool'),
    p('Supabase\'s table editor is genuinely useful for small operations — correcting a record, checking a value — without reaching for a SQL client. Small thing, used constantly, and worth more than it sounds when a client asks a question mid-call.'),
    img('daily-use', 'Two workbenches, one consolidated and one with separated stations', 'The feature table misses this entirely, and it is what you actually feel.'),

    h2('How do the costs compare?'),
    p('Closer than the vendor count suggests, and both are small until you are large.'),
    table('Rough monthly cost at three stages', [
      ['Stage', 'Supabase', 'Neon + Clerk + R2'],
      ['Prototype / early', '$0', '$0'],
      ['~1,000 users, modest data', '$25', '$19 + $25 + ~$1'],
      ['~20,000 users, orgs, SSO', '$100+ and self-built orgs', '$69 + $100+ + ~$5'],
    ]),
    p('The figures move, so check current pricing rather than trusting these. The shape is what matters: at small scale both are free or nearly so, and at the point where the split stack costs meaningfully more, you are buying organisation modelling you would otherwise be building.'),
    p('The cost that does not appear on either pricing page is your time. Two to four weeks building organisations is the real comparison against Clerk\'s monthly fee, and on that basis Clerk is inexpensive for anyone who genuinely needs it. It is equally expensive for anyone who does not, which is the whole point of running the test before reading a pricing page at all.'),

    h2('What about row-level security?'),
    p('Available on both, since it is a Postgres feature rather than a vendor one, but the ergonomics differ sharply.'),
    p('On Supabase, `auth.uid()` is available inside policies because auth and data share a database. Policies are self-contained and testable in SQL.'),
    p('With an external identity provider, the database does not inherently know who is asking. You pass identity through — a session variable set per request, or a signed claim — and the policy reads that. It works, it is a well-trodden pattern, and it is more moving parts and one more thing to get right.'),
    p('In both cases row-level security is a backstop rather than the primary control. Application-level permission checks are still required; the policies exist so that a query with a forgotten filter returns nothing rather than everything.'),

    h2('How hard is it to migrate later?'),
    p('Asymmetric, and worth knowing before choosing.'),

    h3('Database: straightforward'),
    p('Postgres to Postgres is a dump and restore plus a connection string. Both are standard Postgres, so an application using Prisma barely notices. Plan for a maintenance window and some care over sequences and extensions.'),

    h3('Auth: painful'),
    p('Password hashes can usually be migrated, but sessions cannot, so every user is logged out. External identity providers, magic-link tokens and anything storing a provider-specific user id all need attention. Doable, disruptive, and best done once.'),

    h3('The practical implication'),
    p('The auth decision is the sticky one. If organisations are plausibly coming within a year, starting on Clerk is cheaper than migrating to it — which is the same logic as [taking the heavier template when a project is borderline](/blog/project-stack-templates).'),
    img('migration-asymmetry', 'Two paths of visibly different difficulty leading between the same two points', 'The database moves easily. Auth does not. Choose on the sticky one.'),

    h2('What about lock-in?'),
    p('Worth asking of any bundle, and the answer differs sharply between the two halves.'),
    p('The database is not lock-in on either. Both are standard Postgres, both allow a plain dump, and an application talking to them through Prisma is not aware of the vendor. That is the whole reason to prefer managed Postgres over a proprietary data store — the exit is a documented, boring procedure.'),
    p('Auth is where lock-in genuinely lives, and it is unavoidable rather than vendor-specific. Any identity provider holds sessions, hashes and provider-specific user ids, and moving means logging everyone out at minimum. The mitigation is not avoiding managed auth — it is storing your own user record keyed to the provider id rather than scattering the provider id through your schema, so a migration touches one mapping table.'),
    p('Supabase\'s realtime and auto-generated APIs are the components I use most cautiously for this reason. They are convenient and they are the parts with no equivalent elsewhere, so leaning on them heavily is a genuine commitment in a way that using it as plain Postgres is not.'),
    img('lock-in', 'A container with one standard exit and one bespoke fitting, the standard one open', 'The database exit is boring and documented. Auth is the sticky half on any provider.'),

    h2('What do I actually default to?'),
    p('Supabase, and it is not close for the majority of projects.'),
    p('Most things I build have individual users. One vendor covering database, auth and storage means fewer failure points, one bill and one dashboard, and for a project maintained by one person that is worth more than any individual component being marginally better.'),
    p('I move to Neon and Clerk when the org model test comes back "organisation" — teams sharing data, roles, invitations, an invoice to a company. At that point the two-vendor cost is buying weeks of work rather than convenience, and Neon\'s branching is a bonus that turns out to matter on any project with real migrations.'),
    quote('The question is never which database is better. It is whether you are about to build organisation modelling by hand, and whether you realise that is what you are agreeing to.'),

    h2('When would I use neither?'),
    p('Two cases.'),
    p('**The client already has infrastructure.** An existing Postgres on RDS with an existing auth system is the stack, and importing a preference into a working codebase costs the client more than it gains them.'),
    p('**There is no login at all.** A marketing site or a blog has no application database, and reaching for either of these is solving a problem that does not exist. That is [template 01](/stack), and it runs on static hosting for almost nothing.'),
    p('There is a third case worth naming because it comes up in [MVP conversations](/blog/mvp-development-cost) constantly: the product that will need organisations eventually but has no customers yet. The temptation is to build for the eventual shape, and the better answer is usually Clerk from the start without using the organisation features — you pay a small monthly fee and skip the migration entirely when the requirement arrives. Buying optionality here is cheap; retrofitting it is not.'),
    img('third-case', 'A fitted socket with a smaller connector in place and room for a larger one', 'Buying the optionality early is cheap. Retrofitting auth is the expensive path.'),

    h2('Conclusion'),
    p('Ask whether two people from the same customer will ever need to see the same records. If no, use Supabase — one vendor, fewer parts, and auth that understands your tables. If yes, use Neon and Clerk, because organisations, invitations and single sign-on are weeks of work each and buying them is the cheaper trade.'),
    p('Do not choose on the database. Both are managed Postgres, both are genuinely good, and moving between them later is a dump and a restore. Choose on auth instead, because that is the one decision here you cannot cheaply reverse.'),
    p('And if the answer is genuinely uncertain, lean toward the one that handles organisations. Discovering you did not need it costs a monthly fee; discovering you did costs a month.'),
    p('One caveat on everything above: both products move quickly. Supabase has been steadily adding to its auth capabilities, and if organisations become first-class there the calculus in this post changes materially. Neon\'s pricing and Clerk\'s free tier have both shifted more than once. Treat the shape of the argument as durable and the specifics as worth re-checking, which is a reasonable rule for any comparison written about managed services.'),
    p('What will not change is the underlying point. The database is a commodity decision you can reverse in an afternoon, and the identity decision is the one that sets your data model, your permission story and your migration cost. Spend the deliberation there, and let the database follow from it rather than the other way round.'),
  ),
  faqs: faq([
    ['Is Supabase good enough for a B2B SaaS?',
     'It depends on whether customers are organisations or individuals. Plenty of B2B products have one user per customer, and those are well served. Once teams share data with roles and invitations, you are building organisation modelling by hand — two to four weeks of work.'],
    ['When should I use Clerk instead of Supabase Auth?',
     'When you need organisations as a first-class object, invitations to people without accounts, or single sign-on for enterprise customers. Each of those is weeks of work to build and easy to get subtly wrong in ways that leak data between tenants.'],
    ['What is database branching and do I need it?',
     'A copy-on-write copy of your database created in seconds with production-shaped data. Give every pull request one and migrations get reviewed against real data before merge rather than discovered at deploy. Not essential, and hard to give up once used.'],
    ['How hard is it to migrate from Supabase to Neon?',
     'The database is easy — Postgres to Postgres is a dump, a restore and a connection string. Auth is the painful part: sessions cannot migrate so every user is logged out, and anything storing provider-specific user ids needs attention. Choose on auth, not the database.'],
  ]),
};
