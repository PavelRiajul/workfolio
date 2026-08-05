import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/project-stack-templates/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-project-stack-templates',
  slug: 'project-stack-templates',
  title: 'The Four Setups I Start Every Project From',
  category: 'fullstack',
  order: 30,
  readTime: '12 min read',
  date: 'December 2025',
  publishedAt: '2025-12-25',
  series: 'Templates',
  excerpt:
    'Landing, web app, B2B multi-tenant or AI app — the three questions that decide which a project gets, and why picking wrong is expensive.',
  coverLabel: 'Stack templates — cover',
  body: body(
    p('I stopped choosing a stack per project several years ago. Not because the choices stopped mattering, but because re-deciding them every time cost two or three days and produced a marginally different answer each occasion, and the marginal difference was never worth the two days.'),
    p('What replaced it is [four setups](/stack) I start from. Which one a project gets is decided in the first hour, by three questions, and the decision is rarely close.'),
    p('The part worth reading is not the tool list. It is why the boundaries sit where they do, and what happens when you pick the wrong one.'),

    h2('Why not choose per project?'),
    p('Because the value of a tool is not fixed — it rises sharply with familiarity, and that compounding is invisible when you evaluate options on a feature comparison.'),
    p('The fourth time you set up authentication with the same provider, you know which edge cases bite, which defaults are wrong, and what the migration path looks like when the client eventually needs single sign-on. The first time with a marginally better provider, you know none of that, and you will discover it during the build rather than before it.'),
    p('There is a second cost people underestimate. Every distinct stack is a codebase you must remember how to operate. Five projects on five stacks means five sets of deployment quirks, five monitoring setups and five things to relearn when a bug is reported eight months later. Five projects on two stacks is a manageable practice.'),
    img('compounding', 'Two ascending curves, one steeper and continuing, one flatter and restarting repeatedly', 'Familiarity compounds. Re-deciding resets it, and the reset is invisible on a feature comparison.'),

    h2('What are the three questions?'),
    p('Asked in this order, on the first call, and they resolve most projects immediately.'),
    ol([
      '**Does it need a login?** Not "might it later" — does the thing being built now have accounts, sessions and per-user data.',
      '**Does it need a database you own?** Content in a CMS does not count. This is about application data: records users create, modify and expect to persist.',
      '**Does money change hands inside it?** Subscriptions, one-off payments, invoices. A contact form that leads to an invoice sent by email is a no.',
    ]),
    p('Three noes is a landing site. A yes to the first two is a standard web app. A yes to all three, plus organisations rather than individuals, is B2B. Any of those with a probabilistic feature bolted on is the AI variant.'),
    p('What makes these the right questions is that each one implies infrastructure you cannot retrofit cheaply. Auth determines your data model. A database determines your hosting and your backup story. Payments determine your compliance surface and your error handling. Everything else is a preference.'),

    h2('What are the four setups?'),
    table('The four templates, and what each is for', [
      ['Template', 'Best for', 'Core stack', 'Typical timeline'],
      ['01 Landing', 'Marketing sites, portfolios, blogs', 'Astro, Tailwind, Sanity, Cloudflare Pages', 'Days'],
      ['02 Web App', 'Portals, dashboards, booking, SaaS v1', 'Next.js, Supabase, Prisma, Stripe, Vercel', '3–6 weeks'],
      ['03 B2B', 'Teams, roles, invites, SSO', 'Next.js, Neon, Clerk, R2, Stripe', '6–10 weeks'],
      ['04 AI App', 'Assistants, search, extraction', '02 or 03 plus an AI module', '+2–4 weeks'],
    ]),

    h3('01 — Landing and marketing'),
    p('Astro, Tailwind, GSAP for motion, Sanity for content, Resend for the contact form, Turnstile against spam, PostHog for analytics, deployed on Cloudflare Pages.'),
    p('No login, no application database, no payments. Content lives in a CMS, everything renders to static HTML at build time, and the running cost is close to nothing because there is no server doing work per request.'),
    p('The mistake here is over-building. A marketing site does not need a framework that can also run a dashboard, and choosing one because the client might want a portal in two years means shipping a heavier site today for a feature that usually never arrives.'),

    h3('02 — The standard web app'),
    p('Next.js, Tailwind, Supabase for database and auth and storage, Prisma as the ORM, Stripe for payments, Resend for transactional email, Sentry, PostHog, deployed on Vercel.'),
    p('This is the default the moment somebody says portal, dashboard, booking system or SaaS. One vendor covering database, auth and storage keeps the moving parts low, which matters more than any individual feature comparison when a single person is maintaining it.'),
    p('Most projects land here, and most projects that think they need something heavier also land here once the org model is examined honestly.'),

    h3('03 — B2B and multi-tenant'),
    p('Next.js, Neon for Postgres with branching, Clerk for organisations and roles and single sign-on, Cloudflare R2 for object storage, Stripe, Sentry, PostHog.'),
    p('The distinguishing requirement is not "business customers" — it is that the unit of account is an organisation rather than a person. Teams, invitations, role hierarchies, a billing relationship with a company rather than an individual.'),
    p('It costs more to build and more to run, and it is the right answer far less often than clients initially believe. The test is in the next section.'),

    h3('04 — AI feature app'),
    p('Template 02 or 03 with an AI module: a provider-agnostic adapter, Zod-validated tool calls, a job queue, a streaming interface, per-user cost logging and rate limiting.'),
    p('Deliberately not a stack of its own. [AI is a module on a real application](/blog/ai-is-a-module-not-a-stack), and organising an architecture around the model is how you end up unable to add permissions without reindexing everything.'),
    img('four-templates', 'Four architectural blocks of increasing size on a clean surface, the second edge-lit', 'Most projects are the second block. The fourth is the third with one module added.'),

    h2('How do you tell 02 from 03?'),
    p('One question: **is the unit of account a person or an organisation?**'),
    p('If a customer is one person with a login and a card, that is 02, regardless of whether they work at a company. If a customer is a company where several people share data, one of them administers the others, and the invoice goes to the company, that is 03.'),
    p('Everything expensive about B2B follows from that distinction. Organisation-scoped data means every query filters by tenant. Roles mean permission checks in three layers. Invitations mean an onboarding flow for users who do not yet exist. Single sign-on means an identity provider integration per enterprise customer.'),
    p('Clients frequently describe requirement 03 while needing 02. "Our customers are businesses" usually means one person at that business logs in. The question that settles it is whether two people from the same customer will ever need to see the same records — and if the answer is "eventually", see the next section.'),
    p('There is a middle case worth naming, because it comes up constantly and has a clean answer. Some products have organisations but no roles: several people share data and all of them can do everything. That is 02 with a tenant column, not 03 — you need the data scoped to a group, and you do not need an invitation flow, a permission matrix or an identity provider integration. Recognising it saves several weeks, and it is the single most common over-specification I see on a first call.'),

    h2('What if it is genuinely borderline?'),
    p('Take the heavier one. This is the only rule here I would call absolute.'),
    p('Moving from 02 to 03 mid-build is not adding a feature. It is a data-model change that touches every table, every query and every permission check, plus a migration of existing records into a tenancy model that did not previously exist. I have watched that consume three weeks on a project scoped for eight.'),
    p('Going the other way — building 03 and discovering 02 would have done — costs a few hundred pounds a month in unnecessary services and some complexity nobody needed. That is a bad outcome. It is not comparable to the first one.'),
    quote('The asymmetry is the whole argument. Over-building costs money; under-building costs a rewrite, and the rewrite arrives at the worst possible moment.'),
    p('The same applies to the AI variant. If a product might plausibly want retrieval later, index with that in mind — permission dimensions on the content, character offsets stored, a labelled evaluation set — and the later project is an addition rather than a rebuild.'),

    h2('What does every template include regardless?'),
    p('Eight things that go in whether or not anybody asks, on all four setups.'),
    ul([
      '**A staging environment** as well as production, because prompts, migrations and configuration need somewhere to be wrong safely.',
      '**CI that type-checks and tests on every push**, catching the class of bug that most often reaches production.',
      '**Error tracking wired up before launch**, not after the first incident.',
      '**Uptime monitoring**, which catches the outages error tracking cannot — an expired certificate, a dead DNS record, a server that is simply gone.',
      '**Automated backups with a restore that has been tested once**, because an untested backup is not a backup.',
      '**Spam protection on every public form.**',
      '**Email authentication records** — SPF, DKIM and DMARC — so password resets reach the inbox.',
      '**Accounts in the client\'s name**, so they own the infrastructure from day one.',
    ]),
    p('None of this is an upsell and none of it is negotiable when a deadline tightens. It is the difference between a site that launches and a site that keeps running after handover, and it is roughly two days across a whole project.'),
    img('every-build', 'A foundation slab with eight small standard fittings set into it before anything is built above', 'Two days across a project. It is what separates launching from still running a year later.'),

    h2('How do you choose the pieces inside a template?'),
    p('The same logic that picks the template picks what goes in it. Four principles, applied consistently enough that the answers stopped being arguments.'),

    h3('The boring option wins unless there is a specific reason'),
    p('Postgres over anything newer. Server-rendered pages over a single-page application unless the interaction genuinely demands one. A relational model over a document store unless the data is genuinely document-shaped. These are not conservative for their own sake — they are the options with the deepest documentation, the most answered questions, and the least chance of a surprise in year two.'),

    h3('Prefer one vendor doing three things adequately over three doing one thing well'),
    p('Supabase covering database, auth and storage is not the best database, the best auth or the best storage. It is one bill, one dashboard, one set of credentials and one place to look when something breaks, and for a project maintained by one person that is worth more than any individual capability.'),
    p('The point where this reverses is organisations and roles, which is exactly where template 03 splits the pieces apart.')
    ,
    h3('Managed over self-hosted, almost always'),
    p('Running your own Postgres, mail server or search cluster is a job. It is a reasonable job for a team with an operations function and a poor trade for anyone else, because the failure modes arrive at night and the client cannot fix them.'),

    h3('Nothing enters without an exit'),
    p('Before adopting anything, know how to leave. Can the data be exported in a usable form? Is the interface standard enough that a replacement is a swap rather than a rewrite? This is why object storage is behind an S3-compatible interface and model calls sit behind an adapter — not because a change is planned, but because one should not be a project.'),
    img('inside-a-template', 'A tray of fitted components with one lifted clear of its recess', 'Nothing goes in without a known way out. That is what makes a swap a swap rather than a rewrite.'),

    h2('What does switching mid-build actually cost?'),
    p('Worth being concrete, because "expensive" is doing a lot of work in that sentence.'),
    table('Cost of changing template after work has started', [
      ['Change', 'When it is noticed', 'Realistic cost'],
      ['01 → 02 (adding auth)', 'Week 1–2', 'Restart; little is salvageable'],
      ['02 → 03 (adding tenancy)', 'Week 3–6', '2–4 weeks, touches every query'],
      ['02 → 04 (adding AI)', 'Any time', 'Additive if the data model allows'],
      ['03 → 02 (simplifying)', 'Any time', 'Days, mostly deleting things'],
    ]),
    p('The 02 → 03 row is the one that hurts, and it is also the most common. Note that 02 → 04 is cheap: the AI module attaches to a working application, which is precisely why it is defined as a module rather than a stack.'),

    h2('How do the templates change over time?'),
    p('Slowly, and deliberately so. A tool enters the set when it solves a problem the current set solves badly, and it survives a real project. It leaves when it stops being maintained, changes pricing model, or is beaten decisively rather than marginally.'),
    p('What does not justify a change is a new tool being interesting. The compounding familiarity is the asset, and churning the stack spends it. I review the set roughly annually and most years change one thing.'),
    p('The most recent additions came from repeated need rather than curiosity: database branching, because reviewing migrations against a real branch caught things staging did not, and a scheduling engine, because reimplementing availability logic was a mistake I made exactly once.'),

    h2('What does this mean for a quote?'),
    p('More than it sounds, because most of the variance in a software estimate is not the features — it is how much of the work is genuinely novel.'),

    h3('A settled stack makes fixed pricing possible'),
    p('I quote fixed price with staged scope, and that is only honest when the shape of the work is known. On a familiar setup, the unknowns are confined to the client\'s actual requirements. On an unfamiliar one they include the infrastructure, and pricing that fixed is either a gamble or padded.'),

    h3('It moves the risk to where it belongs'),
    p('Scoping and data modelling are where projects go wrong, and they get more attention precisely because the build phase is predictable. Spending three days on the data model is affordable when nobody is spending three days choosing a database.'),

    h3('The client inherits something maintainable'),
    p('Handing over a project on the same setup as the last four means the documentation is proven, the runbooks exist, and another developer picking it up meets conventional choices rather than an assembly of preferences. That is worth more at handover than at any point during the build.')
    ,
    img('quote-shape', 'A bounded area with most of it uniform and one clearly marked region of variation', 'A settled stack confines the unknowns to the client\'s actual requirements.'),

    h2('What if a client already has a stack?'),
    p('Then that is the stack, with one exception.'),
    p('Working in an existing codebase means following its conventions, not importing mine. A codebase with one consistent approach that I would not have chosen is far easier to work in — and far cheaper for the client to maintain — than one with two competing approaches because a contractor preferred a different pattern.'),
    p('The exception is when the existing setup cannot support the requirement at all: no auth model where the feature needs permissions, a database that cannot express the relationships, hosting that cannot run the workload. That is a conversation to have in week one with the cost stated plainly, not a decision to make unilaterally.'),

    h2('Does this limit what you can build?'),
    p('It limits what I will build quickly, which is the intended trade.'),
    p('A project genuinely needing something outside these four is a project I will either take on with an honest note that the first fortnight is slower, or decline in favour of someone whose default it already is. Both are better outcomes than pretending familiarity I do not have.'),
    p('In practice the templates cover the overwhelming majority of what small businesses and founders actually need, because the requirements are more similar than the industries are. A booking system for a clinic and a portal for a logistics firm share a data model shape, and the difference is domain language rather than architecture.'),

    h2('Conclusion'),
    p('Ask three questions — login, database, money — and the template picks itself. When it is borderline, take the heavier one, because over-building costs money and under-building costs a rewrite at the worst possible time.'),
    p('The tools matter less than the fact that they are settled. Two or three days per project not spent re-deciding is the smallest part of the benefit; the larger part is knowing where the bodies are buried in each one, which is the thing that turns an estimate into something you can hold.'),
    p('If you are weighing a build, the useful first conversation is not about tools at all — it is those three questions and what the answers imply. [That is where scoping starts](/start), and it usually takes about ten minutes to know which of the four you are looking at.'),
    img('decision', 'Three sequential gates resolving into one of four labelled paths', 'Login, database, money. Three questions and the template picks itself.'),
    p('One last thing worth saying to anyone assembling their own version of this. The specific tools on my list are not the recommendation — the recommendation is having a list at all, reviewing it about once a year, and resisting the urge to change it in between. A stack you know deeply and would not have chosen from first principles will out-deliver a theoretically better one you are meeting for the first time, on every axis a client actually cares about: how fast it ships, how often it breaks, and whether anyone can maintain it afterwards.'),
  ),
  faqs: faq([
    ['Which stack should I use for my web app?',
     'Answer three questions: does it need a login, a database you own, and payments. Three noes is a static marketing site. Yes to the first two is a standard web app on Next.js and Postgres. All three plus organisations rather than individuals means a multi-tenant setup.'],
    ['What is the difference between a landing page and a web app build?',
     'A landing site has no login, no application database and no payments, so it renders to static HTML and costs almost nothing to run. A web app has accounts, persistent user data and a server doing work per request, which changes the hosting, the backup story and the timeline.'],
    ['Can you switch templates partway through a project?',
     'Adding an AI module is cheap and additive. Adding multi-tenancy is not — it changes the data model and touches every query and permission check, realistically two to four weeks. That asymmetry is why a borderline project should start with the heavier template.'],
    ['Why not choose the best tools for each individual project?',
     'Because familiarity compounds and re-deciding resets it. The fourth build with the same auth provider is faster and safer than the first with a marginally better one, and every distinct stack is another set of deployment quirks to relearn when a bug surfaces months later.'],
  ]),
};
