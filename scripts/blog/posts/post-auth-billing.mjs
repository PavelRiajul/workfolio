import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/auth-billing-onboarding-mvp/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-auth-billing-onboarding-mvp',
  slug: 'auth-billing-onboarding-mvp',
  title: 'Auth, Billing and Onboarding Out of the Box',
  category: 'fullstack',
  order: 39,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-23',
  series: 'MVP',
  excerpt:
    'The three systems every product needs and nobody wants to pay for twice — built once, reused on every project.',
  coverLabel: 'Auth and billing — cover',
  body: body(
    p('Every product with customers needs the same three things before it can do anything distinctive: a way for people to sign in, a way to take their money, and a path from signing up to actually using it.'),
    p('None of them differentiate you. All of them have to work perfectly, because a broken password reset or a failed payment is not a feature gap — it is the product not functioning. And on a first build they routinely consume a third of the calendar.'),
    p('This is what each one actually involves, what to buy versus build, and why they are the reason [starting from a settled template](/blog/project-stack-templates) shortens a project more than any framework choice.'),

    h2('Why do these three consume so much time?'),
    p('Because the happy path is a fraction of the work and the surrounding cases are where the hours go.'),
    p('Signing up is one form. What surrounds it: email verification, password reset, expired reset links, a user who signs up twice, someone who registers with a social provider and later tries a password, session expiry, logging out everywhere, and what happens when an email address changes.'),
    p('Nobody scopes those. They scope "login", which sounds like an afternoon, and then discovers the states are the product. Billing is the same shape and worse, because the failure modes involve money.'),
    p('The reason this matters for planning is that it is genuinely predictable work. It is the same every time, which makes it exactly the thing to solve once and reuse rather than re-derive per project.'),
    img('iceberg', 'A small visible form above a much larger structure of connected states below it', 'The form is the visible part. The states around it are the work.'),

    h2('What does authentication actually have to handle?'),
    p('More than login, and the list is stable across products.'),
    table('The authentication surface', [
      ['Flow', 'Frequently forgotten', 'Cost if wrong'],
      ['Sign up and verify email', 'Verification expiry', 'Unusable accounts'],
      ['Sign in', 'Rate limiting', 'Credential stuffing'],
      ['Password reset', 'Token single-use and expiry', 'Account takeover'],
      ['Session management', 'Revocation on password change', 'Stale access'],
      ['Social or magic-link login', 'Linking to an existing account', 'Duplicate users'],
      ['Change email address', 'Verifying the new one first', 'Lockout or takeover'],
    ]),
    p('The right-hand column is why I do not hand-roll this. Most of these failures are security failures rather than bugs, and the cost of getting one subtly wrong is not proportional to the effort saved by writing it yourself.'),
    p('The one part worth writing yourself is the mapping between the identity provider and your own user record — a `users` table keyed to the provider id, so your data model is not scattered with the provider\'s identifiers. That keeps a future migration to one table rather than to every table.'),

    h2('Should you build authentication?'),
    p('Almost never. Buy it, and spend the time on the part that is actually yours.'),
    p('The argument for building is usually cost or control. Cost is generally not real — the free tiers on managed providers cover more users than most products reach, and the paid tiers arrive around the point where revenue exists. Control is real and is mostly satisfied by keeping your own user table.'),
    p('The situation where building is right: an unusual requirement that no provider handles, or a hard constraint about where credentials may be stored. Both are rare, and both are worth confirming rather than assuming.'),
    p('The [org model test](/blog/supabase-vs-neon-clerk) decides which to buy. Individual users are well served by the auth bundled with your database platform; organisations with roles and invitations are worth a dedicated identity product, because that is weeks of work rather than days.'),

    h2('What does billing actually involve?'),
    p('Substantially more than a checkout button, and the parts after payment are where the complexity lives.'),

    h3('Taking the first payment'),
    p('The easiest part, and largely solved by a hosted checkout. Redirect, take the payment, return. Building a custom payment form means handling card data, which changes your compliance obligations considerably for no benefit.'),

    h3('Knowing what somebody is entitled to'),
    p('The part that is genuinely yours. A subscription in the payment provider is not access control — your application needs to know a customer is on a plan and what that permits, and it needs to be right when the webhook is late.'),

    h3('Changes mid-cycle'),
    p('Upgrades, downgrades, cancellations, and what happens to the remainder of a period already paid for. Proration is a decision, and deciding it deliberately once beats discovering an edge case per customer.'),

    h3('Failed payments'),
    p('Cards expire routinely, and a failed renewal is a customer you keep if it is handled well and lose if it is not. Retry schedules, a notification that does not read as an accusation, and a grace period before access is removed.'),
    p('The distinction that keeps this manageable is that the payment provider owns money and your application owns entitlement. They synchronise through webhooks, and treating the provider as the source of truth for both is what produces access that is briefly wrong after every change.'),
    p('Trials sit awkwardly across that boundary and are worth deciding early. A trial managed by the payment provider requires a card up front, which suppresses signups and produces cleaner conversion. A trial managed in your own database needs no card, converts a larger number of signups into users and a smaller proportion into customers. Both are defensible; running one while the code assumes the other is what produces accounts in an undefined state.'),
    p('Whichever you choose, the trial should be a field on your subscription record rather than an inference from an absent one. "No subscription row means trialling" works until somebody cancels, and then a cancelled customer looks identical to a new one.'),

    h2('How do you keep entitlement correct?'),
    p('Store it in your database, updated by webhooks, and never derive it from a live API call in a request.'),
    code('ts', `
model Subscription {
  id                 String   @id
  orgId              String   @unique
  plan               String              // your language, not the provider's
  status             String              // active | past_due | canceled
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean  @default(false)

  @@index([status, currentPeriodEnd])
}
`),
    p('Two properties matter. Reading entitlement is a local query, so a permission check never depends on a third-party API being reachable. And the plan is expressed in your own vocabulary rather than the provider\'s price identifiers, so changing pricing is a mapping change rather than a migration.'),
    p('Webhooks arrive out of order, more than once, and occasionally late. Handle them idempotently, keyed on the event id, and reconcile periodically against the provider for anything that drifted — a nightly job comparing the two is unglamorous and catches the cases webhooks missed.'),
    img('entitlement', 'A local record connected by a thin synchronising link to an external source', 'The provider owns money. Your application owns entitlement. They synchronise; they are not the same thing.'),

    h2('What makes onboarding worth building?'),
    p('It is the one of the three that is genuinely product-specific, and the only one where effort differentiates you.'),
    p('The purpose is reducing time to value — the gap between signing up and the product having done something useful. That gap is where most trials are lost, and it is not solved by a tour.'),
    p('Product tours are worth a word, because they are the reflexive answer and they usually address the wrong problem. A tour explains an interface; it does not make the product useful. If somebody needs six tooltips to reach the first valuable action, the sequence is too long, and shortening it beats explaining it. Tours are a reasonable addition once the path is short and genuinely non-obvious, and a poor substitute for making the path short.'),
    p('The measurement that tells you whether any of this is working is not completion of the onboarding flow. It is how many accounts reach the first genuinely useful action, and how long that takes. Those two numbers point directly at what to change, whereas a completion percentage mostly tells you how patient people were.'),

    h3('The empty state is the onboarding'),
    p('A new account has no data, and the default is a blank screen with a table header. What it should have is the shortest path to one useful thing: sample data to explore, a single obvious action, or an import that populates it.'),

    h3('Ask for the minimum'),
    p('Every field between signing up and the first useful moment costs completion. Company size, role and how they heard about you can be asked later, after the product has demonstrated something.'),

    h3('Progressive rather than upfront'),
    p('Configuration requested when it is needed makes sense; the same configuration requested as a nine-step wizard before anything works does not. Defer everything that is not required for the first action.'),

    h2('What should you buy and what should you build?'),
    table('Build or buy, by system', [
      ['System', 'Build', 'Buy', 'My default'],
      ['Authentication', 'Rarely', 'Usually', 'Buy'],
      ['Payment processing', 'Never', 'Always', 'Stripe'],
      ['Entitlement model', 'Always', 'Never', 'Build'],
      ['Transactional email', 'Never', 'Always', 'Resend'],
      ['Onboarding', 'Always', 'Never', 'Build'],
    ]),
    p('The pattern is that anything security-critical or compliance-heavy is bought, and anything encoding what your product means is built. Entitlement is on the build side precisely because it is where your plans, limits and permissions live.'),
    p('Transactional email deserves its place. Running a mail server is a job, and deliverability is a discipline — SPF, DKIM, DMARC, warming, bounce handling. A provider does this and it costs nothing at the volumes an early product sends.'),

    h2('How do you model plans and limits?'),
    p('In your own vocabulary, in one place, and expressed as data rather than as conditionals scattered through the codebase.'),

    h3('One definition of what each plan permits'),
    p('A single object mapping plan names to limits — seats, projects, storage, monthly AI spend. Every check reads from it, so changing a limit is one edit and adding a plan does not require finding every place a comparison was written.'),
    code('ts', `
export const PLANS = {
  free:  { seats: 1,  projects: 3,   aiCents: 200 },
  team:  { seats: 10, projects: 50,  aiCents: 5_000 },
  scale: { seats: 50, projects: 500, aiCents: 25_000 },
} as const;

export function limitFor(plan: PlanName, key: LimitKey) {
  return PLANS[plan][key];
}
`),

    h3('Check on the action, not on the page'),
    p('The enforcement point is the moment something is created, not the moment a screen is rendered. Rendering checks are for hiding buttons; they are not access control, and a client that can call the endpoint directly is a client that will.'),

    h3('Decide what happens at the limit'),
    p('Blocking is the obvious answer and rarely the best one. Allowing the action and prompting to upgrade converts better for soft limits like projects, while hard limits — seats, spend — genuinely need to block. Decide per limit rather than applying one policy to all.'),

    h3('Handle downgrades gracefully'),
    p('A customer on fifty projects who downgrades to a plan allowing three is the case nobody scopes. Deleting their data is unacceptable; silently keeping the excess undermines the plan. Read-only above the limit, with a clear prompt, is usually the right compromise.'),
    img('plans-as-data', 'A single reference card feeding several checkpoints across a structure', 'One definition, many checks. Adding a plan should not mean finding every comparison.'),

    h2('What about the admin side?'),
    p('The part nobody scopes and everybody needs by week two, because supporting customers without it means running SQL against production.'),
    p('The minimum is the ability to find a customer, see their plan and subscription status, and change it. That covers the overwhelming majority of support requests — a refund, a manual upgrade, extending a trial for somebody evaluating.'),
    p('It does not need to be a dashboard. On an early product, a handful of carefully written scripts with confirmation prompts is faster to build and safer than a UI, and the database itself covers reporting. Building an admin panel is one of the first things I cut from an [MVP scope](/blog/mvp-development-cost), and one of the first things added afterwards.'),
    p('What is worth building early is impersonation — signing in as a customer to see what they see. It turns most support conversations from a diagnostic exchange into a look, and it needs to be audited, restricted to staff, and obviously indicated in the interface so nobody forgets which account they are in.'),
    img('admin-minimum', 'A small control panel beside a much larger interface, the small one in use', 'Scripts with confirmation prompts beat a dashboard on an early product.'),

    h2('How long does this take on a real project?'),
    p('Around five days on a standard web app, and that is with a settled stack and prior implementations to draw on.'),
    p('On a [19-day MVP](/blog/mvp-in-19-days) it was days four through eight: authentication and the account model, then billing and the shell. Roughly a quarter of the calendar, spent on nothing a user would describe as a feature.'),
    p('That is the honest number, and it is why templates matter more here than anywhere else. The work is genuinely identical between projects, so the second time it is three days and the fifth time it is two — which is compounding you cannot get by choosing a better framework.'),
    quote('These three are the least interesting and least optional part of any product. Solving them once is the difference between a five-week build and an eight-week one.'),

    h2('What does testing these look like?'),
    p('Different from testing features, because the failure modes are states rather than logic, and the expensive ones only occur in sequences.'),
    p('The tests worth writing by hand are the sequences: sign up, verify, log in, subscribe, upgrade, fail a renewal, recover. Each step individually is trivial and the interesting bugs live in the transitions — an upgrade during a grace period, a password reset for an account that never verified.'),
    p('Webhooks need explicit tests for the awkward cases rather than the happy one. Deliver the same event twice and assert nothing changed the second time. Deliver a cancellation before the subscription creation it refers to, which happens more often than seems reasonable. Deliver an event for a customer that does not exist locally.'),
    p('And test the entitlement check on the server directly, not through the interface. A test driving the UI proves the button is hidden; a test calling the endpoint proves the action is refused. Only the second is a security test, and it is the one that matters when somebody has read your JavaScript.'),
    img('sequence-tests', 'A chain of connected state markers with the transitions between them highlighted', 'The bugs live in the transitions, not in the individual steps.'),

    h2('What gets these wrong most often?'),
    p('Four failures I see repeatedly, all cheap to avoid and expensive to discover.'),

    h3('Entitlement checked in the client'),
    p('Hiding a feature from a free plan in the interface, without the server enforcing it. The check has to be on the server, at the point the action is performed, because the interface is a suggestion.'),

    h3('No grace period on failed payment'),
    p('Access removed the moment a renewal fails means a customer whose card expired is locked out before they know. A few days of grace with a clear notification keeps most of them.'),

    h3('Deleting accounts that owe money or hold data'),
    p('Account deletion interacting with active subscriptions, retained invoices and other users\' shared records. Decide what deletion means before offering it, because the alternative is deciding it during a support conversation.'),

    h3('Email that quietly does not arrive'),
    p('Password reset and verification are the two emails a product cannot afford to lose, and they fail silently. Domain authentication set up before launch, and a deliberate test that one actually arrives, is the whole fix.'),
    img('common-failures', 'Four small breaks along an otherwise continuous chain', 'All four are cheap to avoid and expensive to find. None of them announce themselves.'),

    h2('Conclusion'),
    p('Buy authentication and payment processing, build entitlement and onboarding. Keep your own user table keyed to the identity provider, and your own subscription record updated by idempotent webhooks so a permission check is a local query rather than an API call.'),
    p('Treat the states around each flow as the actual scope. Password reset expiry, out-of-order webhooks, failed renewals, the empty state on day one — those are the work, and scoping "login and payments" as two features is how a fortnight becomes five weeks.'),
    p('And solve it once. This is the most reusable code in any product because it is the least specific, which makes it the clearest argument for building from a template rather than from a blank repository each time.'),
    p('There is a sequencing point worth making for anyone planning a first build. These three are not the thing to defer until the product works, even though they feel like plumbing. The data model they imply — users, organisations, subscriptions, entitlement — is the same data model everything else attaches to, and building features first means building them against a user concept that does not exist yet and retrofitting one later.'),
    p('That is why five days near the start is the right shape rather than a week near the end. It is not that authentication is urgent; it is that the shape of your data is decided by it, and every feature built before that decision is a feature built on a guess.'),
  ),
  faqs: faq([
    ['Should I build authentication myself?',
     'Almost never. Most of what can go wrong is a security failure rather than a bug, and the cost of one subtle mistake outweighs the effort saved. Buy it, but keep your own user table keyed to the provider id so a future migration touches one table.'],
    ['What does SaaS billing actually involve?',
     'Taking the first payment is the easy part. The work is entitlement — knowing what a customer may do — plus upgrades, downgrades, proration, failed renewals and grace periods. The provider owns money; your application owns entitlement, synchronised by webhooks.'],
    ['How long does auth and billing take to build?',
     'Around five days on a standard web app with a settled stack, or roughly a quarter of a short MVP. It is identical between projects, so it drops to two or three days once you have an implementation to reuse.'],
    ['What is the fastest way to launch a paid product?',
     'Buy authentication and payments, build entitlement and onboarding, and reuse the whole arrangement from a previous project. The differentiating work is the empty state and time to value; the rest is plumbing that should be solved once.'],
  ]),
};
