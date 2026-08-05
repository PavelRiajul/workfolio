import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/supabase-row-level-security/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-supabase-row-level-security',
  slug: 'supabase-row-level-security',
  title: 'Supabase Row Level Security Without the Foot-Guns',
  category: 'backend',
  order: 48,
  readTime: '13 min read',
  date: 'February 2026',
  publishedAt: '2026-02-08',
  series: 'B2B',
  excerpt:
    'The policies that actually hold, the service role key that quietly bypasses all of them, and why an unindexed policy turns a fast query into a slow one.',
  coverLabel: 'Supabase row level security — cover',
  body: body(
    p('Supabase hands the browser a database connection. That is the whole product idea and it is genuinely good — but it means the only thing standing between a client-side query and every row in your table is a policy you wrote.'),
    p('Which is fine when the policies are right, and a public API when they are not. I have opened projects where a table had row level security enabled, one policy reading `USING (true)`, and a team who believed the table was protected because the toggle was green.'),
    p('This is how I set it up on the products where Supabase is the database — the same [Supabase and Neon decision](/blog/supabase-vs-neon-clerk) that goes into the stack templates, with the parts that bite spelled out.'),

    h2('What does enabling RLS actually do?'),
    p('It flips the default from "everything is visible" to "nothing is visible", and then policies add back specific visibility. That order matters and it is the opposite of how most access control is written.'),
    p('With no policies at all, a table with row level security enabled returns zero rows to everyone except the roles that bypass it. That is a safe failure and it is why enabling first and adding policies second is the right sequence — the window between the two is closed rather than open.'),
    table('Two states, two defaults', [
      ['State', 'Default for a client query', 'Risk'],
      ['RLS disabled', 'Every row', 'Total exposure through the anon key'],
      ['RLS enabled, no policies', 'No rows', 'Broken feature, no exposure'],
      ['RLS enabled, permissive policy', 'Whatever the policy says', 'Whatever the policy got wrong'],
    ]),
    p('The second row is the one to aim for while building. A feature that returns nothing is a bug you will find in a minute; a table that returns everything is a bug you may not find at all.'),
    img('default-deny', 'A closed boundary with specific labeled openings added to it, rather than an open field with barriers', 'Deny by default, then grant. The reverse ordering is how a table ends up briefly public during a migration.'),

    h2('Which key is the client actually using?'),
    p('This is the question that decides whether any of your policies matter, and it has exactly two answers.'),
    ul([
      '**The anon key** is public by design. It ships in the browser bundle, it is meant to be there, and every query it makes is evaluated against your policies.',
      '**The service role key** bypasses row level security entirely. Every policy is ignored. It exists for trusted server-side work and it must never reach the browser.',
    ]),
    p('The service role key in a client bundle is the single worst mistake available in a Supabase project, and it is easy to make because the fix for a policy problem that is blocking you at 2am is to switch keys and move on.'),
    code('ts', `
// Browser. Anon key only. Policies apply.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Server only. This file must never be imported by a client component.
import 'server-only';
export const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
`),
    p('The `server-only` import is worth adding on the first day. It turns an accidental client import into a build error rather than a deployed secret, which is the difference between a failed build and a key rotation.'),

    h3('A NEXT_PUBLIC prefix on a service key is a shipped secret'),
    p('Anything prefixed for public exposure is inlined into the bundle at build time. There is no runtime check that catches this and no error — the application works perfectly, which is exactly why it survives. Grep for the service key name across everything prefixed public before every release, or better, have CI do it.'),

    h3('Server code that uses the admin client must do its own checks'),
    p('This is the corollary people miss. The moment a route handler uses the service role key, the database has stopped protecting you and every permission decision is back in application code. That is fine, but it has to be deliberate — an admin client used casually for convenience removes the backstop the whole design depends on.'),
    img('two-keys', 'Two keys of different weight, one passing through a checkpoint and one going around it', 'One key is checked at the gate. The other has a key to the gate. Only one belongs in a browser.'),

    h2('What does a correct policy look like?'),
    p('Specific about the operation, specific about the role, and expressed against `auth.uid()` rather than against anything the client sends.'),
    code('sql', `
alter table documents enable row level security;

create policy "read own documents"
  on documents for select
  to authenticated
  using ( owner_id = (select auth.uid()) );

create policy "insert own documents"
  on documents for insert
  to authenticated
  with check ( owner_id = (select auth.uid()) );
`),
    p('Three details in there do real work. The policy names the operation rather than using `for all`, so a read rule cannot accidentally grant writes. It names the `authenticated` role, so anonymous visitors are not evaluated against it at all. And it compares against `auth.uid()`, which comes from the verified JWT and cannot be set by the caller.'),

    h3('USING and WITH CHECK are not the same thing'),
    p('`USING` filters rows that already exist — it decides what a select, update or delete can see. `WITH CHECK` validates rows being written. An update policy needs both, and the second is what stops a user updating their own row into somebody else\'s ownership.'),
    code('sql', `
create policy "update own documents"
  on documents for update
  to authenticated
  using       ( owner_id = (select auth.uid()) )   -- may touch this row
  with check  ( owner_id = (select auth.uid()) );  -- and may not reassign it away
`),
    p('Without the `with check`, a user can take a row they legitimately own and set its owner to another account — or, more usefully to an attacker, set a `role` or `status` column that the application treats as authoritative. Column-level control is a separate mechanism; the policy only decides which rows.'),

    h3('for all is a trap in a hurry'),
    p('One policy covering every operation is shorter, and it means your read rule is also your delete rule. Those are almost never the same rule in a real product — plenty of things a user may see are things they may not remove.'),

    h2('How do you handle organization membership?'),
    p('With a helper function marked `security definer`, so the policy does not have to join through a table the user cannot read.'),
    p('The obvious policy joins to a memberships table. That produces a recursion problem the moment the memberships table has its own policy referencing the same helper, and the error message when it happens is not obvious.'),
    code('sql', `
-- security definer runs as the owner, so the policy on memberships
-- does not re-enter while we are evaluating a policy that needs it.
create function auth.org_ids() returns setof uuid
language sql security definer stable
as $$ select org_id from memberships where user_id = auth.uid() $$;

create policy "read org documents"
  on documents for select to authenticated
  using ( org_id in (select auth.org_ids()) );
`),
    p('`stable` matters as much as `security definer`. It tells Postgres the function returns the same result within a statement, so it is evaluated once rather than once per row — which is the difference between a policy that scales and one that turns a thousand-row query into a thousand function calls.'),

    h3('Wrap auth.uid() in a select'),
    p('The `(select auth.uid())` form rather than a bare `auth.uid()` is not stylistic. The subquery form is evaluated once per statement; the bare call can be re-evaluated per row. On large tables this is the single largest performance difference in the whole policy, and it costs six characters.'),

    h3('Security definer functions need a locked search path'),
    p('A function running as the owner with a caller-controlled search path is a privilege escalation waiting to happen. Set `search_path` explicitly on every `security definer` function, and keep them small enough to read in one go — this is code running with elevated rights and it deserves the same scrutiny as anything else that does.'),
    img('membership-helper', 'A lookup routine sitting beside a gate, consulted once rather than at every passage', 'Marked stable, so it runs once per statement rather than once per row. That single word is most of the performance.'),

    h2('Why did the query get slow?'),
    p('Because a policy is a predicate added to every query, and an unindexed predicate is a sequential scan wearing a security costume.'),
    p('The policy above compares `org_id` to a set. If `org_id` is not indexed, every query against that table now filters the whole table before returning anything — including the queries that were fast yesterday, because the policy applies to all of them.'),
    code('sql', `
-- Index whatever the policy filters on. Filter column first, sort second.
create index documents_org_created_idx
  on documents (org_id, created_at desc);
`),
    p('This is the same composite index rule as [tenant-scoped queries generally](/blog/multi-tenant-prisma-postgres), and it applies with more force here because the filter is now invisible in the application code. A developer reading the query sees no `org_id` condition at all, so the missing index has no obvious cause.'),

    h3('Read the plan with the policy applied'),
    p('`explain analyze` run as the table owner does not show you what the client sees, because the owner bypasses policies. Set the role and the JWT claims first, or the plan you are optimizing is not the plan that runs.'),

    h3('A policy that calls a function per row is the usual culprit'),
    p('If a table got dramatically slower after policies went on, look for a volatile function or a bare `auth.uid()` in the policy before looking anywhere else. Marking the helper `stable` and wrapping the call in a select routinely takes a query from seconds back to milliseconds.'),
    img('policy-plan', 'A query path with an additional filter stage inserted, one branch indexed and one scanning fully', 'The policy is a predicate on every query. Index it, or every query on the table pays for it.'),

    h2('Which policy pattern fits which table?'),
    p('Most tables in a product fall into one of five shapes, and knowing which one you are looking at saves inventing a policy from scratch each time.'),
    table('Five table shapes and their policies', [
      ['Shape', 'Example', 'Policy'],
      ['Owner-scoped', 'Personal notes, saved items', 'owner_id = (select auth.uid())'],
      ['Org-scoped', 'Documents, projects, invoices', 'org_id in (select auth.org_ids())'],
      ['Public read, owner write', 'Published posts, profiles', 'select using (true), write scoped to owner'],
      ['Reference data', 'Plans, countries, feature flags', 'select to authenticated using (true)'],
      ['Server-only', 'Webhook log, audit trail, billing ledger', 'RLS on, no policies at all'],
    ]),
    p('The last row is worth calling out because it looks like a mistake. A table with row level security enabled and no policies returns nothing to any client, which is exactly right for data only the server should ever touch — the service role reaches it and nothing else does, without anyone having to remember not to query it from the browser.'),
    p('The third row is the one that gets written carelessly. A public read policy is legitimate for published content, but it applies to every column, so a profiles table with a public select policy has published every column on it including the ones added later by someone who did not know. Either restrict the grant to specific columns or keep the public shape in its own table.'),

    h2('What about storage and realtime?'),
    p('Both have their own access model, and both are commonly left open on a project where the tables are locked down properly.'),

    h3('Storage buckets have policies too'),
    p('Files live in `storage.objects`, which is an ordinary table with row level security. A public bucket serves anything in it to anyone with the URL, and object paths are frequently guessable. Make buckets private and write policies against the path prefix — the organization id as the first path segment, checked the same way the table policies check it.'),
    code('sql', `
create policy "read own org files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (select auth.org_ids()::text)
  );
`),

    h3('Realtime broadcasts what the policy allows'),
    p('A subscription to table changes is evaluated against the same policies, which is the good news. The bad news is that this is easy to assume rather than verify, and a table with a permissive read policy broadcasts every change to every subscribed client in real time — a leak that is both continuous and invisible in any request log.'),

    h3('Views do not inherit policies the way you expect'),
    p('A view created by a superuser runs with the creator\'s rights, so it can expose rows the underlying policies would deny. Create views with `security_invoker = true` so the caller\'s policies apply, and treat any pre-existing view as unprotected until checked.'),
    img('other-surfaces', 'Three peripheral channels leading out of a protected core, one of them unguarded', 'Tables are one surface. Storage, realtime and views are three more, each with its own default.'),

    h2('How do you test policies?'),
    p('By running the queries as a user rather than as the owner, and by asserting on what is denied.'),
    p('Almost every policy bug survives testing because the test ran as the service role or in the SQL editor, both of which bypass the thing under test. A policy test has to impersonate an actual authenticated user or it proves nothing.'),
    code('sql', `
-- Impersonate a real user inside a transaction, then roll it back.
begin;
  select set_config('request.jwt.claims', json_build_object('sub', :user_a)::text, true);
  set local role authenticated;

  select count(*) from documents;                 -- expect: only user A's rows
  select count(*) from documents where id = :b_id; -- expect: 0, not an error
rollback;
`),
    p('The second assertion is the important one. A policy that denies a row correctly returns zero rows rather than an error, so a test asserting "this throws" will fail even when the policy is right — and a test asserting "this returns nothing" is the one that catches a leak.'),

    h3('Seed two accounts, always'),
    p('A fixture with a single user cannot detect a missing filter, because there is nothing for it to leak. Two accounts with similar-looking data is the minimum, and it is the same rule that applies to every isolation test you will ever write.'),

    h3('Run them in CI, not in the dashboard'),
    p('Policies are schema, so they change in migrations and they break in migrations. Putting the impersonation tests in the same suite that runs [on every push](/blog/ci-pipeline-typecheck-tests) is what turns a policy from something you verified once into something that stays verified.'),

    h2('When should the client not talk to the database at all?'),
    p('Whenever the operation has rules that a policy cannot express, which is more often than the direct-access model suggests.'),
    p('Row level security answers "may this user see or write this row". It cannot easily answer "may this user invite a member, given the plan\'s seat limit and their role and whether billing is current". That is business logic with three inputs, and expressing it in SQL produces a policy nobody can read or change safely.'),
    ol([
      '**Direct client queries** for reads and simple owner-scoped writes. This is where the model earns its keep and removes a whole API layer.',
      '**A route handler or edge function** for anything with a rule, a side effect, or a third-party call. Use the anon key with the user\'s session so policies still apply as a backstop.',
      '**The service role** only for genuinely trusted operations — webhooks, scheduled jobs, admin tooling — with the permission check written explicitly, because the database is no longer doing it.',
    ]),
    p('The mistake at both ends is treating one of these as the answer for everything. All-direct produces policies encoding business rules; all-API throws away the reason to use Supabase and rebuilds a REST layer over a database that did not need one.'),
    quote('Policies are the floor, not the ceiling. They should make a leak impossible, not express your product\'s rules.'),

    h2('What does a review of an existing project look like?'),
    p('Four checks, in order, and the first two find most of it.'),

    h3('List every table without RLS enabled'),
    p('One query against `pg_tables` returns the list. Anything in the public schema without it is readable by anyone holding the anon key, which is everyone who has loaded your site. This is a five-minute check and it is the highest-value five minutes available.'),

    h3('Find the permissive policies'),
    p('Search for `true` in policy definitions. There are legitimate uses — a public content table genuinely readable by everyone — but each one should be a decision somebody made, not a placeholder from a tutorial that stayed.'),

    h3('Grep for the service role key'),
    p('Every use, and specifically every use in a file that could be imported by a client component. Add `server-only` to the module that constructs it so the question cannot recur.'),

    h3('Check storage bucket visibility'),
    p('Public buckets and unguarded object paths are the surface people forget, because the tables felt like the whole job. A private bucket with a path-prefix policy takes ten minutes and closes it.'),
    p('None of this is difficult work and all of it is easy to postpone. It is also the kind of thing where the cost of postponing is not that it becomes harder — it is that the finding comes from somebody outside the project.'),
    img('audit-order', 'Four sequential inspection points along a path, the first two marked as highest yield', 'Four checks. The first two take ten minutes and find most of what is wrong.'),

    h2('Conclusion'),
    p('Enable row level security on every table in the public schema before writing any policy, so the failure state is a broken feature rather than an open table. Then add policies one operation at a time — separate select, insert, update and delete rules, scoped to the `authenticated` role.'),
    p('Compare against `(select auth.uid())` and never against a value the client supplied, pair every update policy with a `with check` so a user cannot reassign a row away from themselves, and put membership lookups in a `stable security definer` function with a locked search path.'),
    p('Index whatever the policies filter on. The predicate is invisible in your application code, so a missing index there produces a slow query with no visible cause — and the composite index leading with the tenant or owner column is what keeps it fast as the table grows.'),
    p('Keep the service role key on the server behind a `server-only` import, and remember that every route using it has opted out of the protection entirely and owes its own permission check. Then extend the same thinking to storage buckets, realtime subscriptions and views, all of which have their own defaults and none of which inherit your table policies.'),
    p('Finally, test by impersonating a real user in a transaction with two accounts seeded, asserting that the other account\'s rows are absent rather than that the query errors — and run those tests in CI, because policies live in migrations and break in migrations. If you have a live Supabase project and want the policies reviewed before it grows, [that is a short, well-defined piece of work](/start).'),
  ),
  faqs: faq([
    ['Is the Supabase anon key safe to expose in the browser?',
     'Yes, that is what it is for — every query it makes is evaluated against your row level security policies. What is never safe to expose is the service role key, which bypasses policies entirely and should live only in server code behind a server-only import.'],
    ['Why is my query slow after enabling row level security?',
     'The policy becomes a predicate on every query, so whatever it filters on needs an index. Also check for a bare auth.uid() in the policy — wrapping it as (select auth.uid()) makes it evaluate once per statement rather than once per row, which is often the whole difference.'],
    ['What is the difference between USING and WITH CHECK?',
     'USING filters rows that already exist and governs select, update and delete visibility. WITH CHECK validates rows being written. An update policy needs both, or a user can modify a row they own into one they should not, such as reassigning its owner.'],
    ['Do I still need server-side checks with RLS enabled?',
     'For anything with a business rule, yes. Policies answer whether a user may touch a row; they express seat limits, billing state and multi-step operations badly. Treat policies as the backstop that makes a leak impossible, and put product rules in a route handler.'],
  ]),
};
