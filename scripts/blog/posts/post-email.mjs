import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/transactional-email-deliverability/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-transactional-email-deliverability',
  slug: 'transactional-email-deliverability',
  title: 'Why Your Password Reset Email Lands in Spam',
  category: 'backend',
  order: 49,
  readTime: '13 min read',
  date: 'February 2026',
  publishedAt: '2026-02-11',
  series: 'Foundations',
  excerpt:
    'SPF, DKIM and DMARC in the order they actually have to be set up, plus the subdomain decision that keeps a marketing blast from killing your login emails.',
  coverLabel: 'Transactional email deliverability — cover',
  body: body(
    p('An email that does not arrive is worse than a feature that does not work, because nobody reports it. The user assumes they typed the wrong address, tries again, gets nothing again, and leaves. Your logs show two successful sends.'),
    p('This is the failure I find most often on projects I inherit, and it is almost never a code problem. The API call returned a 200 and the message was accepted for delivery. It was rejected or filed as junk somewhere between the provider and the inbox, for reasons that are entirely visible if you know where to look.'),
    p('Email authentication is one of the [eight things I set up on every build](/blog/staging-environment) precisely because it is invisible when correct and silent when broken. Here is the whole of it, in the order it has to happen.'),

    h2('What actually decides whether mail is delivered?'),
    p('Three questions, asked by the receiving server in roughly this order, and your infrastructure only answers the first two.'),
    table('What the receiving server is deciding', [
      ['Question', 'Answered by', 'You control it?'],
      ['Is this sender allowed to send as this domain?', 'SPF, DKIM, DMARC', 'Completely'],
      ['Does this domain have a history of sending wanted mail?', 'Reputation', 'Over time'],
      ['Does this specific recipient want it?', 'Engagement, complaints', 'Partly'],
    ]),
    p('Authentication is a gate, not a boost. Passing all three checks does not get you into the inbox; failing any of them keeps you out of it. This is why "we set up SPF and it is still going to spam" is a coherent complaint and also a sign that the problem has moved to the second row.'),
    p('Reputation is the row people underestimate. It attaches to the sending domain and the sending IP, it builds over weeks, and it is destroyed considerably faster than that. Everything in the second half of this post is about not destroying it.'),
    img('three-questions', 'Three sequential checkpoints, the first two marked as controllable and the third partially so', 'Authentication is a gate you must pass, not a score you can raise. The reputation question is where the real work is.'),

    h2('How do SPF, DKIM and DMARC fit together?'),
    p('SPF authorizes servers. DKIM signs messages. DMARC ties either of them to the address the recipient sees, and tells the receiver what to do on failure. You need all three and they answer different questions.'),

    h3('SPF says which servers may send'),
    p('A TXT record listing the services allowed to send as your domain. It is checked against the envelope sender, not the visible From address, which is why SPF alone does not prevent somebody spoofing your brand.'),
    code('dns', `
; One SPF record per domain. Two records is a permanent fail, not a merge.
example.com.  TXT  "v=spf1 include:_spf.resend.com include:_spf.google.com ~all"
`),
    p('The ten-lookup limit is the trap here. Every `include` costs a DNS lookup and the includes have their own includes; exceed ten and the whole record fails, taking previously working mail with it. A domain that accumulates a marketing tool, a CRM, a helpdesk and a transactional provider crosses it without anybody making a decision.'),

    h3('DKIM signs the message'),
    p('A cryptographic signature over the headers and body, verified against a public key in your DNS. Unlike SPF it survives forwarding, which matters more than it sounds — a message forwarded by a mailing list fails SPF at the second hop and passes DKIM.'),
    p('Your provider generates the key pair and gives you records to publish. The only decision you make is the selector name, and the only mistake available is publishing the record on the wrong host — a `resend._domainkey` record placed at the apex instead of as a subdomain silently does nothing.'),

    h3('DMARC ties them to the visible address'),
    p('This is the one that makes the other two mean something. DMARC requires that a passing SPF or DKIM result belongs to the same domain the recipient sees in the From field — alignment — and publishes a policy for what to do when neither aligns.'),
    code('dns', `
; Start here. Monitor only, reports to an address you actually read.
_dmarc.example.com.  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@example.com; pct=100"

; After a few weeks of clean reports, tighten in two steps.
_dmarc.example.com.  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"
_dmarc.example.com.  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"
`),
    p('Going straight to `p=reject` is the mistake that takes a company\'s email down for a morning. There is always one service sending as your domain that nobody remembers — an invoicing tool, a scheduler, a form on an old site — and a reject policy finds it by discarding its mail. Monitor first, read the reports, then tighten.'),
    img('three-records', 'Three linked records forming a chain, with the visible label checked against the chain', 'SPF and DKIM prove something. DMARC is what makes them prove something about the address the recipient actually sees.'),

    h2('Why does the subdomain matter so much?'),
    p('Because reputation is per sending domain, and you do not want the fate of your password resets tied to the performance of a newsletter.'),
    p('If both go out from `example.com`, a marketing send with a poor list generates complaints, the domain\'s reputation drops, and the next password reset is filed as junk. The two kinds of mail have completely different engagement profiles and should not share a reputation.'),
    table('One subdomain per kind of mail', [
      ['Subdomain', 'Carries', 'Why separate'],
      ['mail.example.com', 'Password resets, receipts, invites', 'Must always arrive'],
      ['news.example.com', 'Newsletters, product updates', 'Complaint-prone by nature'],
      ['example.com (apex)', 'Nothing automated', 'Keep it clean; protect it with DMARC'],
    ]),
    p('This costs one extra set of DNS records and it is close to impossible to retrofit cheaply, because moving your transactional mail to a new subdomain means starting its reputation from zero at exactly the moment you needed it to be good. Do it on day one.'),
    p('The apex row is deliberate. Leaving the root domain with a strict DMARC policy and no legitimate senders means anybody spoofing your brand at the most obvious address gets rejected outright, and no real mail is at risk from that policy.'),

    h2('What breaks deliverability from inside the application?'),
    p('Four things, all of them code decisions rather than DNS ones, and all four are more common than a misconfigured record.'),

    h3('Sending from a no-reply address'),
    p('A `no-reply@` sender cannot receive the replies that would otherwise be a positive engagement signal, and it trains people to ignore your mail. Use a real address that routes somewhere a human occasionally looks. Replies to transactional mail are rare, and the ones you get are usually a customer telling you something is broken.'),

    h3('Retrying a hard bounce'),
    p('A permanent bounce means the address does not exist. Retrying it — or worse, leaving it in a list that gets mailed weekly — is one of the strongest negative signals available. Process bounce webhooks, mark the address dead, and stop sending to it in the same transaction.'),

    h3('Not handling complaints'),
    p('A spam complaint arrives as a webhook. If you do not consume it, you keep sending to somebody who has explicitly told their provider your mail is unwanted, and the provider is watching whether you stop. This is the single fastest way to lose a sending reputation.'),

    h3('Sending on a schedule that looks automated'),
    p('Ten thousand identical messages in ninety seconds from a domain that sent forty yesterday is a volume pattern that looks like a compromised account. Ramp new domains gradually and spread bulk sends over hours rather than minutes.'),
    img('four-mistakes', 'Four inputs feeding into a declining measure, each labeled as an application behavior', 'None of these are DNS problems. All four are decisions in the sending code.'),

    h2('How do you write the sending code?'),
    p('As a queued job with a template, an idempotency key and a stored record — not as an inline call in a request handler.'),
    p('An email sent inline makes the request slow and couples it to a third party. When the provider has a bad minute, your signup endpoint has a bad minute, and a user who was successfully created sees an error and tries again.'),
    code('ts', `
// The request commits the work and enqueues the message. It does not send.
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data });
  await tx.outbox.create({
    data: { kind: 'welcome', to: user.email, key: \`welcome:\${user.id}\` },
  });
});
`),
    p('The outbox table is the useful part. It gives the send the same durability as the record that triggered it, so a crash between the two is impossible, and the unique key on the row means a retried job cannot produce a second welcome email.'),

    img('outbox', 'A durable holding record between an application and an external transport', 'The outbox gives the send the same durability as the record that triggered it. A crash between the two stops being possible.'),

    h3('Templates belong in code, not in the provider'),
    p('A provider-hosted template is invisible to code review, untestable in CI, and changes in production with no deploy. Keep the markup in the repository, render it at send time, and use the provider purely as transport. This is the same argument as [keeping content out of the pages themselves](/blog/type-safe-mern) — the thing that can change silently is the thing that will.'),

    h3('Always send a plain-text alternative'),
    p('A multipart message with a text part scores better with filters and is the only version some clients show. Generating it from the same data as the HTML rather than writing it twice keeps them from drifting.'),

    h3('Log the provider message id'),
    p('When a customer says they never got it, the useful answer is a delivery status from the provider, and that requires having stored the id it returned. Without it you are relying on the customer to check a spam folder they have already checked.'),

    h2('How do you test email before it reaches a real inbox?'),
    p('With a catch-all in staging, an authentication check, and one real send to a seeded set of addresses before launch.'),

    h3('Never point staging at real addresses'),
    p('A staging environment with production data and a real email provider sends real mail to real customers, and it does it during a test run at 2am. Route everything in [staging](/blog/staging-environment) to a capture service, or to a single internal address, and make that the default rather than a setting somebody has to remember.'),

    h3('Check the headers, not the appearance'),
    p('Send to an address at each major provider and read the raw headers. `Authentication-Results` tells you exactly what SPF, DKIM and DMARC returned, and it is the only unambiguous answer available. A message that looks fine and shows `dkim=fail` is a message that will start being filtered as soon as volume rises.'),

    h3('Read the DMARC reports for a month'),
    p('The aggregate reports name every service sending as your domain, including the ones you forgot. Reading four weeks of them before tightening the policy is the difference between a clean transition and an outage nobody can immediately explain.'),
    img('header-check', 'A message being inspected at its metadata layer rather than its visible surface', 'The rendered email tells you nothing. Authentication-Results in the raw headers is the only unambiguous answer.'),

    h2('How do you warm a new domain?'),
    p('Gradually, and starting before you need it. A domain that has never sent mail has no reputation, and no reputation is treated closer to bad than to good.'),
    p('The pattern that works is boring: send small volumes of genuinely wanted mail first, increase roughly by doubling every few days, and keep the early sends to addresses that will actually be opened. Your own team, your beta users, the people who signed up and are waiting — engagement from real recipients is what builds the record.'),

    h3('Start the domain before launch, not on launch day'),
    p('The worst possible schedule is publishing DNS records and immediately sending ten thousand invitations. Set the subdomain up two weeks early and let it carry the internal notifications, staging alerts and team invites in the meantime. By launch it has a small, clean history rather than none.'),

    h3('Do not import a list you did not collect'),
    p('A purchased or scraped list contains dead addresses and spam traps, and a spam trap hit on a new domain is close to unrecoverable. This applies to a list inherited from a previous system too — if nobody can say where the addresses came from, treat them as unverified and send a re-confirmation before anything else.'),

    h3('Watch the deferral rate, not just the bounce rate'),
    p('A deferral is the receiver saying "not right now", and a rising deferral rate is the earliest visible sign that you are ramping too fast. Bounces tell you about bad addresses; deferrals tell you about your reputation, and they show up days before anything lands in a junk folder.'),
    img('warm-ramp', 'A gradually increasing series of small volumes rather than a single large one', 'Double every few days to recipients who will actually open. A launch-day blast from a cold domain is the pattern filters are built to catch.'),

    h2('Which provider should you use?'),
    p('Any of the main ones will deliver well. The decision is about the API and the operational surface, not about deliverability, because the domain reputation you build is yours rather than theirs.'),
    table('What actually differs between providers', [
      ['Factor', 'Why it matters'],
      ['Webhook quality', 'Bounces and complaints must arrive reliably or the list rots'],
      ['Shared vs dedicated IP', 'Dedicated needs volume to warm; shared is better below it'],
      ['Suppression handling', 'A provider-side suppression list prevents a bad send from becoming a bad reputation'],
      ['Log retention', 'Answering "did it arrive" three weeks later requires the log to still exist'],
    ]),
    p('The shared-versus-dedicated question is the one people get backwards. A dedicated IP with low volume has no reputation and is treated with suspicion; a shared pool with other well-behaved senders is better below roughly a hundred thousand messages a month. Ask for dedicated when volume justifies it, not before.'),
    p('I use Resend on most builds because the API is small enough to wrap in an afternoon and the webhooks are dependable, which are the two things that actually affect the code. That is a preference rather than a recommendation — the parts of this post that determine whether mail arrives are all on your side of the API.'),

    img('subdomain-split', 'Two separate sending paths from one root, each carrying a different class of message', 'Two subdomains, two reputations. A campaign that goes badly cannot reach the password resets.'),

    h2('What do you do when mail stops arriving?'),
    p('Work outward from the message, and resist the urge to change DNS first.'),
    ol([
      '**Confirm the provider accepted it.** The API response and the provider dashboard tell you whether the problem is before or after the handoff. Most reported failures never left your application.',
      '**Read the delivery event.** Delivered, bounced, deferred and complained are four different problems with four different fixes, and the provider knows which one happened.',
      '**Check authentication on a real received message.** Not on a checker tool — on headers from a message that actually arrived somewhere.',
      '**Look at what changed.** A new sending service, an added SPF include pushing past ten lookups, a marketing campaign last week, a DNS change during a domain migration.',
    ]),
    p('There is one more thing worth checking before any of that, and it is embarrassing often enough to be worth the sentence: confirm the address the application actually sent to. A typo in a signup form, a trimmed string, or a user who genuinely mistyped their own address accounts for a meaningful share of reports, and it is the only cause that produces a delivery event you will never find because the message went somewhere else entirely.'),
    p('That last step resolves more incidents than the other three combined. Deliverability rarely degrades on its own; it degrades because something was added, and the something is usually a marketing tool that somebody connected without mentioning it.'),
    quote('Deliverability is not a setting you get right once. It is a reputation, and reputations respond to behavior over weeks rather than to configuration in an afternoon.'),

    h2('What does this cost to set up properly?'),
    p('About two hours on a new project, and it is the cheapest insurance in the whole build.'),
    p('That is: a sending subdomain, SPF and DKIM records from the provider, a DMARC record at `p=none` with reports going somewhere real, bounce and complaint webhooks wired to a suppression table, an outbox table, templates in the repository, and staging routed to a capture address. Two hours, once.'),
    p('Retrofitting is harder in a specific way — not more work, but slower, because moving transactional mail to a fresh subdomain restarts its reputation and the ramp takes weeks. There is no way to buy your way through that period, which is the argument for the subdomain being a day-one decision rather than a later improvement.'),

    h2('Conclusion'),
    p('Send transactional mail from a dedicated subdomain, publish SPF and DKIM from your provider, and start DMARC at `p=none` with reports going to an address somebody reads. Tighten to quarantine and then reject only after the reports are clean for a few weeks.'),
    p('Keep the sending subdomain separate from anything marketing touches, so a campaign with a poor list cannot take your password resets down with it. This is close to impossible to retrofit without a reputation gap, which is why it belongs in the first day of a build rather than the first incident.'),
    p('In the application, queue the send through an outbox table with a unique key, keep templates in the repository rather than in the provider, generate a plain-text part from the same data, and store the provider message id so "did it arrive" has an answer. Consume bounce and complaint webhooks into a suppression list and treat that as non-optional.'),
    p('Then verify by reading `Authentication-Results` on a message that actually arrived, not by trusting a checker. Two hours of work, and it removes the failure mode where a user cannot get into their account and never tells you. If you want the current setup checked before it matters, [that is a quick piece of work](/start) with a very clear answer at the end.'),
  ),
  faqs: faq([
    ['Why do my transactional emails go to spam?',
     'Usually one of three things: DKIM or DMARC alignment is failing, transactional mail shares a domain with marketing that generates complaints, or bounces and complaints are not being suppressed. Read Authentication-Results on a received message first — it answers the authentication question unambiguously.'],
    ['Do I need SPF, DKIM and DMARC, or is one enough?',
     'All three. SPF authorizes servers, DKIM signs the message and survives forwarding, and DMARC requires that a pass belongs to the domain the recipient actually sees. Without DMARC, anyone can pass SPF on their own domain while displaying yours in the From field.'],
    ['Should transactional email use a subdomain?',
     'Yes, and separately from marketing. Reputation is per sending domain, so a campaign with a poor list can push password resets into spam. It costs one extra set of DNS records on day one and is expensive to retrofit, because a new subdomain starts with no reputation.'],
    ['Is a dedicated IP better for deliverability?',
     'Only above roughly a hundred thousand messages a month. Below that, a dedicated IP has too little volume to build a reputation and is treated with suspicion, while a shared pool of well-behaved senders delivers better. Start shared and move when volume justifies it.'],
  ]),
};
