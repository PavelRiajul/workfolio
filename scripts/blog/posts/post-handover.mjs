import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/project-handover-checklist/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-project-handover-checklist',
  slug: 'project-handover-checklist',
  title: 'Handing Over a Project So the Client Owns Everything',
  category: 'fullstack',
  order: 40,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-24',
  series: 'Process',
  excerpt:
    'The accounts and access that belong in the client’s name from day one, and the handover document that stops the late-night support calls.',
  coverLabel: 'Handover — cover',
  body: body(
    p('Handover is usually treated as the last two days of a project. It is actually a decision made in the first hour, when the accounts get created — and by the final week it is either already true or expensive to fix.'),
    p('The test is simple: if you disappeared tomorrow, could the client keep their software running and hire somebody else to change it? On plenty of projects the honest answer is no, and nobody discovers that until the developer is unreachable.'),
    p('This is what a clean handover contains, and why most of it is set up months before it happens.'),

    h2('Who should own the accounts?'),
    p('The client, on everything, from the beginning. This is the single most consequential thing on the list and it costs nothing when done at the start.'),
    table('Account ownership at handover', [
      ['Account', 'Owner', 'Developer role', 'Why'],
      ['Domain and DNS', 'Client', 'None needed', 'Losing this loses the business'],
      ['Hosting', 'Client', 'Team member', 'They pay, they control'],
      ['Database', 'Client', 'Team member', 'Their data'],
      ['Object storage', 'Client', 'Team member', 'Their files'],
      ['Error tracking', 'Client', 'Team member', 'Continuity after handover'],
      ['Payment provider', 'Client', 'Restricted access', 'Their money, always'],
      ['Repository', 'Client org', 'Collaborator', 'Removable without loss'],
    ]),
    p('The pattern is that the client holds the root account and the developer is added as a member. That inverts the common arrangement — developer creates everything on their own account and adds the client later — and the difference only shows up when the relationship ends.'),
    p('The domain deserves particular emphasis. A domain registered on a developer\'s account, renewing to their card, is a business-ending dependency sitting inside a routine relationship. It should be in the client\'s name before anything else exists.'),

    h2('Why does this go wrong so often?'),
    p('Because the fast path at the start is to create everything yourself and sort ownership out later, and later never has a natural moment.'),
    p('Setting up hosting on your own account takes two minutes. Setting it up on a client\'s account requires them to create one, verify an email, add a payment method, and invite you — perhaps twenty minutes of their time, spread across a day, before anything can be built.'),
    p('So it gets deferred, and by the time it matters the project is live and migrating means downtime, DNS changes and a maintenance window nobody wants to schedule. The deferral was rational at every individual step and produces a bad outcome overall.'),
    p('The fix is treating it as part of the kickoff rather than the handover. It goes on the list for the first call, alongside the [three questions that pick a template](/blog/project-stack-templates), because both are decisions that get expensive if left.'),
    img('ownership-inversion', 'Two structures with the ownership marker on the outer boundary in one and the inner in the other', 'The client holds the root account, the developer is a member. Inverting that only shows up at the end.'),

    h2('What goes in the handover document?'),
    p('Less than people write, and specifically the parts somebody would need at 9pm with the site down.'),
    ul([
      '**An access inventory** — every account, what it does, who owns it, and where the credentials live.',
      '**Three runbooks** — the site is down, emails are not arriving, restore from backup.',
      '**One page of architecture** — what runs where, and what talks to what. A diagram, not prose.',
      '**How to deploy**, and how to roll back.',
      '**What is monitored**, where alerts go, and who receives them.',
      '**Known limitations** — the things you would fix with more time, stated plainly.',
    ]),
    p('What does not belong: a full API reference, a code walkthrough, or anything restating what the codebase already says. Those are written once, read never, and they go stale within a month, which makes the whole document less trustworthy.'),
    p('The test for including something is whether it is knowable from the repository. Architecture and access are not. How a particular function works is.'),

    h2('What are the three runbooks?'),
    p('The ones that cover most incidents, written as steps rather than as explanation.'),

    h3('The site is down'),
    p('Check the status page of the host first, since it is frequently not your problem. Then the deploy log for a failed release, then error tracking for a spike, then the database. Include the rollback command with real values, because the fastest fix for a bad deploy is going back.'),

    h3('Emails are not arriving'),
    p('The most common silent failure, and the least obvious to diagnose. Check the provider dashboard for bounces or suppressions, verify the domain records are intact, and confirm the sending limits have not been reached. Include how to send a test message.'),

    h3('Restore from backup'),
    p('Where backups live, the exact restore command, how long it took the last time somebody [actually did it](/blog/tested-database-backups), and what to do about uploaded files afterwards. This is the runbook most likely to be needed under real stress, which is why it must be specific rather than a link to a provider\'s documentation.'),
    p('Each is half a page. The virtue is being short enough that somebody reads it during an incident rather than skimming and guessing.'),
    p('Write them in the imperative and with real values. "Run `npm run db:restore --from=<backup-id>` after finding the id in the Neon dashboard under Backups" is usable at 9pm; "restore the database from the most recent backup" is a restatement of the problem. Anywhere a placeholder appears, somebody has to make a decision under pressure, and that is where mistakes happen.'),
    p('The test for whether a runbook is finished is handing it to somebody who has never seen the project and watching them follow it. Every question they ask is a missing line. That takes twenty minutes and is the only reliable way to find the steps that were living in your head rather than on the page.'),

    h2('Where should the documentation live?'),
    p('In the repository, and duplicated somewhere reachable when the application is down.'),
    p('In the repository means it is versioned alongside the code, it survives any tool the business stops paying for, and a new developer finds it without being told where to look. That is the primary copy.'),
    p('The duplication matters for the incident case. A runbook hosted on the infrastructure that is currently broken is a document about an incident rather than one for it, which sounds obvious and is the reason a surprising number of runbooks are unreachable exactly when needed.'),
    p('A printed page or a note in the client\'s password manager covering "where things are and how to reach me" is sufficient. It does not need to be sophisticated; it needs to exist outside the system it describes.'),

    h2('How do you transfer the repository?'),
    p('Into an organisation owned by the client, with the developer as a collaborator who can be removed without anything breaking.'),
    p('A repository under a personal account is a single point of failure. The account is suspended, the person is unreachable, and the client has no path to their own source code beyond whatever clone happens to exist locally.'),
    p('Transferring at the end works and creates avoidable friction — repository URLs change, CI integrations need reconnecting, and deploy hooks break. Creating it in the right place at the start avoids all of it.'),
    p('Include the git history, not a fresh initial commit. History is how somebody understands why a decision was made, and squashing eighteen months into one commit destroys the only record of that reasoning.'),
    img('repo-ownership', 'A container with a removable member marker at its edge, the container itself unchanged', 'The collaborator can be removed without anything breaking. That is the property that matters.'),

    h2('What about credentials and secrets?'),
    p('Handed over deliberately, rotated where they should be, and stored somewhere the client controls.'),

    h3('Rotate anything you generated'),
    p('API keys, database passwords and webhook secrets created during development have been in your terminal history, your environment files and possibly your clipboard manager. Rotating them at handover is cheap and it makes the boundary clean.'),

    h3('Use a shared vault, not a document'),
    p('Credentials in an email, a spreadsheet or a chat message stay there permanently and get forwarded. A password manager the client owns, with the developer removed on exit, is the arrangement that ends when the relationship does.'),

    h3('Prefer per-person access to shared logins'),
    p('Where a service supports team members, use them. A shared login means every departure requires a password change and a redistribution, and it makes the audit log useless because everything was done by "the account".'),

    h2('What happens after handover?'),
    p('A defined window, stated up front, rather than an open-ended expectation nobody agreed to.'),
    p('I include thirty days of support for anything that was broken at handover — a bug in delivered work, a configuration that was wrong, a runbook step that turns out to be inaccurate. That is finishing the job rather than a favour.'),
    p('New work after that is new work, quoted separately. Being explicit about the boundary is kinder than being vague about it, because vagueness produces a slow drift where every request is small and the total is a second project nobody agreed to.'),
    p('The related conversation is who maintains it. Software needs dependency updates, certificate renewals and occasional platform changes whether or not anyone is adding features. If the answer is nobody, the honest thing is to say so — that is a decision with consequences and the client should make it knowingly.'),

    h2('What does a good handover call look like?'),
    p('An hour, screen shared, walking the document rather than presenting the code.'),
    ol([
      '**Open every account together** and confirm they can sign in without you. This is the step that surfaces the account nobody transferred.',
      '**Walk one runbook end to end** — usually the deploy, because it is the one they will use soonest.',
      '**Trigger a monitoring alert deliberately** so they see what it looks like and where it arrives.',
      '**Show the known limitations** and what each would take to address.',
      '**Agree what happens next** — the support window, who to contact, and how.',
    ]),
    p('Recording it is worth the two minutes of setup. The person on the call is rarely the person who needs it six months later, and a recording answers most of what would otherwise be an email.'),
    img('handover-call', 'Two figures at a shared surface with a document and a set of access markers between them', 'Open every account together. That is the step that finds the one nobody transferred.'),

    h2('How does this fit the rest of the process?'),
    p('It is the last of [the six steps](/services) and the one most affected by the first.'),
    p('Everything here is easier when the infrastructure was standard, the conventions were conventional, and the [eight things that go into every build](/blog/staging-environment) are already present. A project with staging, CI, error tracking and tested backups hands over in an afternoon, because the documentation describes an arrangement that is unremarkable.'),
    p('A project assembled ad hoc — bespoke deployment, undocumented environment variables, no monitoring — cannot be handed over cleanly regardless of how much documentation is written, because the thing being described is genuinely hard to operate.'),
    p('That is the argument for the boring choices, stated from the other end. Conventional infrastructure is not about elegance; it is about whether somebody else can run it.'),
    quote('The measure of a handover is not the document. It is whether another developer could take over on Monday without calling you.'),

    h2('What does the client actually need to know?'),
    p('Less than a developer instinctively wants to explain, and different from what a technical handover covers.'),

    h3('What it costs to run, and where the bills go'),
    p('An itemised list of every recurring charge, what it is for, and which card it hits. Clients discover forgotten subscriptions years later, and a service that lapses because a card expired is an outage nobody understands.'),

    h3('What to do first when something looks wrong'),
    p('Not the runbook — the one step before it. Usually: check whether it is affecting everyone or one person, and check the status page. That distinction changes who they need to contact and prevents a great many false alarms.'),

    h3('What they can safely change themselves'),
    p('Content in the CMS, yes. Environment variables, no. Being explicit about the boundary means they edit confidently within it rather than avoiding everything out of fear, which is the more common outcome.'),

    h3('What will need attention eventually'),
    p('Dependency updates, certificate renewals, a platform deprecation on a known date. Naming these converts "it just works until it doesn\'t" into a maintenance expectation they can plan for.'),
    p('This is a different document from the technical one, and it is shorter. A page, in plain language, written for the person who signs the invoices rather than the one who reads the code.'),
    img('client-facing', 'A short summary card beside a thicker technical document', 'Two documents. The short one is for the person who signs the invoices.'),

    h2('What should be handed over that is not code?'),
    p('Several things that are genuinely part of the deliverable and get forgotten because they are not in the repository.'),

    h3('Design source files'),
    p('Figma files, logo originals, and any font licences purchased for the project. A client with only exported assets cannot make a variation of their own logo, which becomes apparent the first time they need a different format.'),

    h3('Third-party account configuration'),
    p('Webhook endpoints registered with a payment provider, DNS records that are not obvious, redirect rules, and anything configured in a dashboard rather than in code. This is the category most likely to be reconstructed by trial and error later.'),

    h3('The seed and test data'),
    p('Whatever populates a fresh environment. Without it, standing up a new instance for a future developer means inventing plausible data before anything can be tested.'),

    h3('Decisions and their reasons'),
    p('Not a full architecture treatise — a short list of the choices somebody will question. Why this database, why this hosting, why the thing that looks odd is deliberate. It prevents a future developer from "fixing" something load-bearing.'),
    p('Anything configured through a dashboard rather than a file is worth writing down for exactly this reason. Configuration in the repository documents itself; configuration clicked into a web interface exists only in that interface and in the memory of whoever clicked it.'),
    img('beyond-code', 'Four supplementary items arranged around a central code artefact', 'The deliverable is larger than the repository. These are the parts reconstructed by trial and error later.'),

    h2('What if the client does not want to own it?'),
    p('Some do not, and that is a legitimate arrangement provided it is deliberate rather than accidental.'),
    p('A client without technical staff may genuinely prefer the developer to hold the accounts and handle everything. What makes that acceptable is that the domain is still theirs, they can obtain access on request, and there is a written statement of what happens if you become unavailable.'),
    p('What is not acceptable is the arrangement arising by default, with the client unaware of the dependency until it becomes a problem. The difference between a managed service and a hostage situation is entirely whether the client knowingly chose it.'),
    p('Even then, keep the domain and the repository in their name. Those two are the ones with no recovery path, and no convenience justifies holding them.'),

    h2('Conclusion'),
    p('Create every account in the client\'s name at kickoff and add yourself as a member. That single decision does most of the work, and it is free at the start and expensive at the end.'),
    p('Write an access inventory, three runbooks, one page of architecture, and an honest list of limitations. Keep it in the repository and duplicate the essentials somewhere reachable when the application is down. Rotate the credentials you generated and hand them over through a vault the client controls.'),
    p('Then run an hour-long call where they sign into everything themselves, and state plainly what support looks like afterwards. Handover done this way is an afternoon — because the work was distributed across the project rather than deferred to its final week.'),
    img('distributed-work', 'A sequence of small deposits along a path rather than one large one at the end', 'An afternoon at the end, because the work happened along the way.'),
    p('If you are a client rather than a developer, the version of this to remember is a single question worth asking before a project starts, not after: whose name will the accounts be in? A developer who answers "yours, and I will be added as a member" has done this before. One who says it can be sorted out later is describing a migration you will pay for, and one who is surprised by the question is telling you something more important than any technical answer they gave.'),
  ),
  faqs: faq([
    ['Who should own the hosting account for my website?',
     'You should, with the developer added as a team member. The inverse arrangement — developer owns it and adds you later — only reveals itself as a problem when the relationship ends, and migrating a live site afterwards means downtime and a maintenance window.'],
    ['What should a software handover document include?',
     'An access inventory, three runbooks covering downtime, email failures and restoring from backup, one page of architecture, deploy and rollback instructions, what is monitored, and an honest list of known limitations. Not an API reference — the code already says that.'],
    ['What happens if my developer disappears?',
     'If the accounts are in your name and the repository is in your organisation, you hire somebody else and they pick it up. If everything sits on a personal account you cannot access, recovery ranges from difficult to impossible, particularly for the domain.'],
    ['How long should post-launch support last?',
     'Thirty days for anything that was broken at handover is a reasonable default — that is finishing the job rather than a favour. New work after that should be quoted separately, and saying so explicitly is kinder than letting the boundary blur.'],
  ]),
};
