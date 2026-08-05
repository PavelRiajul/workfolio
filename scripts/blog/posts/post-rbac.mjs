import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/role-based-auth-nextjs-express/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-role-based-auth-nextjs-express',
  slug: 'role-based-auth-nextjs-express',
  title: 'Role-Based Access Control in Next.js and Express',
  category: 'backend',
  order: 46,
  readTime: '13 min read',
  date: 'February 2026',
  publishedAt: '2026-02-03',
  series: 'B2B',
  excerpt:
    'Where the permission check belongs, why hiding a button is not access control, and the one file that stops roles becoming a nest of if statements.',
  coverLabel: 'Role-based access control — cover',
  body: body(
    p('Almost every access-control bug I have been called in to fix has the same shape. The UI hides the button correctly, the route looks protected, and somewhere underneath there is a handler that trusts a value the client sent.'),
    p('It is rarely a dramatic hole. It is usually a delete endpoint that checks whether the user is logged in but not whether the record is theirs, or an admin API that reads a role out of a JSON payload because that was convenient during development and nobody removed it.'),
    p('This is how I build roles and permissions on the B2B products in my [stack templates](/stack) — a Next.js front end talking to either its own route handlers or a separate Express API, with the check living in exactly one place and everything else deriving from it.'),

    h2('What is the difference between authentication and authorization?'),
    p('Authentication answers "who is this". Authorization answers "may they do this". They are separate systems that fail in separate ways, and conflating them is the root of a surprising share of access bugs.'),
    p('A logged-in user is not an authorized user. Once a session exists, every further question — can they read this record, edit this setting, invite this teammate, export this data — is a fresh decision that needs its own answer. The session tells you nothing about it beyond identity.'),
    table('Two systems, two failure modes', [
      ['', 'Authentication', 'Authorization'],
      ['Question', 'Who is this?', 'May they do this?'],
      ['Answered', 'Once per session', 'Once per action'],
      ['Typical owner', 'Clerk, Auth.js, Supabase Auth', 'Your own code'],
      ['Failure looks like', 'Anyone can log in', 'Anyone can act'],
    ]),
    p('The right-hand column is the one nobody outsources. Auth providers solve identity extremely well and deliberately stay out of your domain rules, because "may this user delete this invoice" depends on facts only your application knows. That boundary is where most teams underinvest — the identity piece is bought and finished in an afternoon, and the permission piece is improvised over the next six months.'),
    img('two-questions', 'Two gates in sequence, the first checking a token and the second checking a rule', 'The session gets you through the first gate. Every action after that is the second gate, and it is yours to build.'),

    h2('Why is roles-as-strings not enough?'),
    p('Because the string is the wrong unit. A role is a label; what the code actually needs to know is whether a specific capability is allowed.'),
    p('The version everyone writes first looks like this, and it is fine for about three months.'),
    code('ts', `
if (user.role === 'admin' || user.role === 'owner') {
  await deleteProject(id);
}
`),
    p('Then a customer asks for a billing-only role. Then support needs read access without edit. Then an admin should be able to remove a member but not the owner. Each of those adds a clause to every comparison, and the clauses are scattered across dozens of files with no way to see them together.'),
    p('The failure is not that it breaks — it is that it becomes impossible to answer the question "what can a manager do", which is the question every customer asks in a security review. Nobody can answer it because the answer is distributed across the codebase.'),

    h3('Roles map to permissions, not to checks'),
    p('The fix is one indirection. Code checks permissions; roles are a named bundle of permissions; the mapping lives in a single file. Adding a role becomes a data change rather than a search-and-replace.'),
    code('ts', `
// One file. The entire authorization model is readable in ten seconds.
export const PERMISSIONS = {
  owner:   ['project:*', 'member:*', 'billing:*'],
  admin:   ['project:*', 'member:invite', 'member:remove'],
  member:  ['project:read', 'project:write'],
  billing: ['billing:read', 'billing:write', 'project:read'],
  viewer:  ['project:read'],
} as const;

export function can(role: Role, permission: string) {
  const grants = PERMISSIONS[role] ?? [];
  const [resource] = permission.split(':');
  return grants.includes(permission) || grants.includes(\`\${resource}:*\`);
}
`),
    p('Call sites then read as `can(role, \'project:delete\')` rather than as a chain of role comparisons, and the security review question has a one-file answer. The wildcard is worth the small complexity: without it every new action on a resource means editing the owner and admin arrays, and the arrays that get edited most are the ones that acquire mistakes.'),
    img('role-map', 'A single labeled sheet listing named groups against sets of capability tokens', 'One file, readable in ten seconds. That is the property that makes a security questionnaire answerable.'),
    p('There is a limit to this model and it is worth naming early. Static permissions answer "may this role do this kind of thing" and cannot answer "may this user edit this particular record", because the second depends on the record. You need both, and the next sections are about the second.'),

    h2('Where does the check actually belong?'),
    p('As close to the data as you can put it, and never only in the UI.'),
    p('There are four plausible locations and they are not alternatives — they are layers, each catching what the one above it missed. The mistake is treating the topmost as sufficient because it is the one you can see working.'),
    table('Four layers, four jobs', [
      ['Layer', 'Purpose', 'Security value'],
      ['UI conditional', 'Do not offer what will fail', 'None'],
      ['Route middleware', 'Reject early, cheaply', 'Coarse'],
      ['Handler / service', 'Check the actual record', 'Real'],
      ['Database policy', 'Backstop for everything above', 'Absolute'],
    ]),
    p('The security value column matters. A UI conditional is a usability feature — it stops people clicking things that will fail. It is not a control, because the request it hides can be issued directly with any HTTP client, and treating it as protection is the single most common mistake I see in code I inherit.'),

    h3('The UI layer is honesty, not security'),
    p('Hide the delete button from a viewer, absolutely. Just do not count it. A React component that renders conditionally has shipped its condition to the browser, where it can be edited, ignored or bypassed entirely by talking to the API directly.'),

    h3('Middleware is a filter, not a decision'),
    p('Route middleware knows the URL and the session, which is enough to reject an obviously wrong request cheaply. It does not know which record is being touched or whether the user owns it, so it can never be the last word.'),

    h3('The handler is where the real decision happens'),
    p('Only the handler has both the user and the record. "Is this user an admin" and "is this user an admin of the organization that owns this invoice" are different questions, and only the second is worth asking. That is the check that has to exist.'),

    h3('The database is the backstop'),
    p('Row-level policies catch the handler that forgot. This is the same argument as [tenant isolation in Postgres](/blog/multi-tenant-prisma-postgres), and for the same reason: a bug that returns an empty list is a ticket, and a bug that returns another customer\'s data is an incident.'),
    img('four-layers', 'Four nested boundaries around a data core, the outermost drawn as a dashed line', 'The outer layer is dashed on purpose. It improves the experience and protects nothing.'),

    h2('How do you implement it in Next.js?'),
    p('With a session helper that both server components and route handlers call, so there is one path to "who is this and what may they do".'),
    p('The important property is that the check runs on the server every time, not once at login. A permission cached in a cookie is a permission that survives being revoked, which turns "we removed their access" into "we removed their access in about an hour".'),
    code('ts', `
// lib/auth.ts — the only place the session is read.
export async function requirePermission(permission: string, orgId: string) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  if (!membership || !can(membership.role, permission)) {
    notFound();   // not 403 — see below
  }
  return { userId, role: membership.role };
}
`),
    p('Two decisions in there are deliberate. The membership is read from the database rather than from the token, so a role change takes effect on the next request instead of on the next login. And a failed check returns a not-found rather than a forbidden.'),

    h3('Why not-found beats forbidden'),
    p('A 403 confirms that the resource exists. Iterate over ids against an endpoint that returns 403 for real records and 404 for imaginary ones and you have enumerated the customer list without ever being authorized for anything.'),
    p('For resources the user cannot see at all, a 404 is both safer and more accurate — from their position, it does not exist. Reserve 403 for cases where the user legitimately knows the resource exists and lacks one specific capability on it, such as a member trying to delete a project they can otherwise read.'),

    h3('Server components check too'),
    p('It is tempting to check in the page and trust the components beneath it. That holds until a component is reused on a page that forgot, which happens roughly the second time it is reused. Calling the same helper in the component costs one already-cached query and removes the dependency on the caller doing the right thing.'),

    h3('Server actions are public endpoints'),
    p('This is the one that surprises people. A server action compiles to an HTTP endpoint with a generated identifier, and that identifier is in the client bundle. Anyone can call it with any arguments. An action that trusts its inputs because "only the admin page calls it" is an unauthenticated API, and it needs the same check as any route handler.'),
    img('nextjs-flow', 'A request path branching through session lookup, membership lookup and a permission gate', 'The membership is read per request. A role cached at login is a role that outlives its revocation.'),

    h2('How does this look in Express?'),
    p('Middleware for the coarse check, a service-layer guard for the real one, and no route that reaches a handler without passing through both.'),
    code('ts', `
// Coarse: is there a session, and is this user in the org at all?
export const withOrg: RequestHandler = async (req, res, next) => {
  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId: req.session.userId, orgId: req.params.orgId } },
  });
  if (!membership) return res.status(404).end();
  req.membership = membership;
  next();
};

// Fine: does this role hold this permission?
export const requires = (permission: string): RequestHandler => (req, res, next) =>
  can(req.membership.role, permission) ? next() : res.status(403).end();

router.delete('/orgs/:orgId/projects/:id', withOrg, requires('project:delete'), handler);
`),
    p('That reads well and it is still not complete, which is the part worth dwelling on. The middleware has verified that the user is an admin of the organization in the URL. It has not verified that the project in the URL belongs to that organization.'),

    h3('The ownership check the middleware cannot do'),
    p('Supply your own organization id and somebody else\'s project id and every check above passes. You are a legitimate admin of the organization you named; the project simply is not in it. The fix is a single condition in the query, and it belongs in the handler because only the handler is loading the record.'),
    code('ts', `
// Wrong: authorizes against the URL, then acts on a record that may not match.
const project = await db.project.findUnique({ where: { id } });

// Right: the ownership constraint is part of the lookup, not a later comparison.
const project = await db.project.findFirst({ where: { id, orgId: req.membership.orgId } });
if (!project) return res.status(404).end();
`),
    p('Putting the constraint in the `where` rather than in an `if` afterwards matters more than it looks. A comparison after the fetch can be forgotten, reordered, or skipped by an early return added later; a scoped query cannot return the wrong record in the first place.'),

    h3('Route order is a security property'),
    p('Express applies middleware in registration order, so a route defined above the authentication middleware is a public route regardless of what it looks like. This is easy to do accidentally when adding a health check or a webhook at the top of a file, and the resulting hole is invisible in the route definition itself.'),
    p('I keep a test that walks the router stack and asserts every non-allowlisted route carries the session middleware. It takes twenty minutes to write and it catches the class of bug that code review reliably misses, which is the same trade as [testing the critical paths](/blog/testing-critical-paths) rather than trusting that they still work.'),

    img('express-order', 'A stack of sequential filters with one item positioned above the stack, unfiltered', 'A route registered above the session middleware is a public route, and it does not look like one.'),

    h2('What about the record-level rules?'),
    p('Roles cover categories of action. They cannot express "the author may edit their own comment for fifteen minutes", and most products have several rules of that shape.'),
    p('The mistake is bolting these onto the role model — inventing a `comment-author` pseudo-role, or adding an `isOwner` flag to the session. Both put record-specific facts into a structure designed for user-specific ones, and both fall apart as soon as a user is the author of one record and not another.'),

    h3('Keep them as policy functions'),
    p('A policy is a function taking the user and the record and returning a boolean. It sits beside the permission check rather than inside it, and it is ordinary testable code.'),
    code('ts', `
export const policies = {
  'comment:edit': (u: Actor, c: Comment) =>
    c.authorId === u.id ? Date.now() - +c.createdAt < 15 * 60_000 : can(u.role, 'comment:moderate'),
};
`),
    p('The authorization decision then becomes: does the role grant the capability in general, and does the policy allow it for this record in particular. Both must pass. Splitting them keeps the role table readable while allowing rules that a table could never express.'),

    h3('Do not let policies query'),
    p('A policy that loads its own data is a policy that runs a query per record, and it will be called in a loop over a list eventually. Pass everything it needs as arguments and let the caller decide how to fetch efficiently. This is a performance rule that becomes a correctness rule, because the version that is slow in a list is the version somebody skips in a list.'),
    img('policy-split', 'Two evaluation paths converging on a single allow decision, one labeled by role and one by record', 'Roles answer the general question, policies answer the specific one, and an action needs both.'),

    h2('How do you handle the super admin?'),
    p('Carefully, and with an audit trail, because it is the account most likely to be the subject of a question you cannot answer later.'),
    p('Internal support staff need to see customer data to do their job. The convenient implementation gives them a role that passes every check, which is also the implementation where nobody can tell afterwards what was accessed.'),
    ul([
      '**Make it a separate identity**, not a flag on a customer account. A staff member acting on their own organization and acting on a customer\'s should be two different sessions.',
      '**Scope it in time.** Elevated access that expires in an hour is dramatically safer than a permanent grant, and it is one extra column.',
      '**Log every access**, not every mutation. Reading customer data is the sensitive act; by the time something is being written the damage question has already been answered.',
      '**Default to read.** Most support work is diagnosis. Write access should be a second, deliberate step with its own record.',
    ]),
    p('The reason to build this early is that retrofitting an audit trail cannot recover the past. The first time a customer asks "who at your company looked at our data in March", either the log exists or it does not, and there is no version of the answer that improves the situation if it does not.'),

    h2('How do you test authorization?'),
    p('From the unauthorized side, with a matrix, and as part of the same suite that runs in [CI on every push](/blog/ci-pipeline-typecheck-tests).'),

    h3('Test the denial, not the permission'),
    p('A test that an admin can delete a project passes whether or not the check exists. The test that matters is that a viewer cannot, and that a user from another organization gets a not-found. Those fail loudly when a guard is removed, which is the entire point.'),

    h3('Generate the matrix'),
    p('Write the endpoint list and the role list, and generate a test per pair asserting the expected outcome. Fifty combinations is a lot to write by hand and nothing to generate, and it turns "did we cover the new role" from a memory problem into a data problem — a new role added to the array produces a new column of tests immediately.'),
    code('ts', `
for (const role of ROLES)
  for (const [method, path, permission] of ENDPOINTS)
    it(\`\${role} \${can(role, permission) ? 'may' : 'may not'} \${method} \${path}\`, async () => {
      const res = await request(app)[method.toLowerCase()](path).set(sessionFor(role));
      expect(res.status).toBe(can(role, permission) ? 200 : 403);
    });
`),

    h3('Always test the cross-organization case'),
    p('Every fixture needs two organizations. A suite with one cannot detect a missing ownership constraint, because there is no other tenant\'s record to accidentally return. This is the same reasoning as two-tenant database fixtures and it catches a different set of bugs at the API layer.'),
    img('test-matrix', 'A grid of roles against endpoints with cells marked allow or deny', 'Generated, not written. A new role should produce a column of failing tests before it produces a feature.'),

    img('support-access', 'A time-limited access token beside a running record of entries', 'Elevated access with an expiry and a log. Both columns are cheap on day one and unrecoverable later.'),

    h2('What breaks when roles change?'),
    p('Three things, and all three are cache problems wearing different hats.'),

    h3('Sessions holding a stale role'),
    p('If the role is in the JWT, demoting somebody does nothing until their token expires. Either keep the role out of the token and read membership per request, or accept a bounded staleness window and keep it short. What you cannot do is claim revocation is immediate while the token says otherwise.'),

    h3('Cached queries scoped by user'),
    p('A list cached before a demotion is served after it. Any cache holding permission-dependent data needs the role in its key, or an invalidation on membership change. This is the same class of bug as a tenant-blind cache key and it is equally hard to reproduce.'),

    h3('The last owner leaving'),
    p('Nothing enforces that an organization keeps at least one owner unless something does. An owner who demotes themselves and leaves creates an account nobody can administer, which becomes a support ticket that requires database access to resolve. One check on the demotion path prevents it.'),
    p('All three appear only after the product has been live long enough for roles to change, which is exactly when nobody is looking at the authorization code any more.'),

    h2('What does this cost to build?'),
    p('A day on a new project. Considerably more once the comparisons are scattered.'),
    p('On a greenfield B2B build the whole thing is a permission map, a session helper, one middleware, a policy file and a generated test matrix. That is well within a day, and it is the difference between an access model you can describe in a security questionnaire and one you have to go and read the code to explain.'),
    p('Retrofitting means finding every role comparison, working out what each one meant, and replacing it with a permission — while the meanings have drifted and some of them are wrong. On a medium codebase that is a week, plus the time to write the tests that tell you the replacement was faithful.'),
    p('It is also worth being honest that none of this is difficult work. It is small, unglamorous and easy to postpone, and the cost of postponing it is not that it gets harder — it is that the bug it prevents gets discovered by somebody outside the company.'),
    quote('Authorization is cheap to build in and expensive to add. The permission map is an hour on day one and a week of archaeology on day two hundred.'),

    h2('Conclusion'),
    p('Check permissions, not roles. Map roles to permissions in one file, call `can()` at the point of action, and keep the mapping small enough that anyone can read the entire authorization model in a sitting.'),
    p('Put the real check in the handler where both the user and the record are available, and make the ownership constraint part of the query rather than a comparison afterwards. Middleware rejects the obvious cases; only the handler can answer whether this user may touch this record.'),
    p('Return not-found rather than forbidden when the user should not know the resource exists, read membership per request rather than trusting a token, and add row-level policies underneath as the backstop for the handler that forgot.'),
    p('Then test from the denied side with a generated matrix and two organizations seeded, so a new role produces failing tests before it produces a feature. The whole thing is about a day on a new build, and it removes the class of bug that gets found by a customer rather than by you. If you want to talk through an existing model, [get in touch](/start) — an audit of the guards is usually a short piece of work with a very clear output.'),
  ),
  faqs: faq([
    ['What is the difference between RBAC and ABAC?',
     'Role-based access control grants capabilities by role, which answers general questions well. Attribute-based control evaluates facts about the user and the record together, which is what record-level rules need. Most products want both: roles for the broad grant, small policy functions for the specific case.'],
    ['Should the user role be stored in the JWT?',
     'Only if you accept that revoking it takes until the token expires. Reading membership from the database per request costs one indexed lookup and makes a demotion effective immediately, which is usually the better trade for B2B products where access changes are a routine administrative act.'],
    ['Is hiding a button in the UI enough to secure an action?',
     'No. A React conditional ships to the browser and the underlying endpoint can be called directly with any HTTP client. Hide the button so users are not offered actions that will fail, then check on the server where the decision cannot be edited by the person it applies to.'],
    ['Should an unauthorized request return 403 or 404?',
     'Return 404 when the user should not know the resource exists, because a 403 confirms it does and lets somebody enumerate real records by iterating ids. Use 403 only where the user legitimately knows about the resource and lacks one specific capability on it.'],
  ]),
};
