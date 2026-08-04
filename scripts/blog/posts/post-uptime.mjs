import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/uptime-vs-error-tracking/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-uptime-vs-error-tracking',
  slug: 'uptime-vs-error-tracking',
  title: 'Uptime Monitoring Versus Error Tracking',
  category: 'fullstack',
  order: 42,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-26',
  series: 'Every build',
  excerpt:
    'They catch different outages. Running only one is how a site stays down all weekend without anyone knowing.',
  coverLabel: 'Monitoring — cover',
  body: body(
    p('A site can be completely unreachable and produce not a single error report. That sounds contradictory until you notice that error tracking runs inside your application, and an application that is not running cannot report anything.'),
    p('This is the failure that produces a weekend of downtime discovered by a customer on Monday. The dashboard was clean the entire time — not because nothing was wrong, but because the thing that reports problems was part of what had stopped.'),
    p('Both tools are in [the eight things I set up on every build](/stack), and they are there because neither substitutes for the other.'),

    h2('What does each one actually see?'),
    p('Error tracking watches from inside. Uptime monitoring watches from outside. That single difference determines everything each can and cannot detect.'),
    table('Coverage by failure type', [
      ['Failure', 'Error tracking', 'Uptime monitor'],
      ['Unhandled exception', 'Yes', 'No'],
      ['Failed database query', 'Yes', 'Sometimes'],
      ['Server completely down', 'No', 'Yes'],
      ['DNS expired or misconfigured', 'No', 'Yes'],
      ['SSL certificate expired', 'No', 'Yes'],
      ['Deploy that never completed', 'No', 'Yes'],
      ['Slow but functioning', 'Partial', 'Yes'],
      ['Wrong content served', 'No', 'With content checks'],
    ]),
    p('The rows where error tracking says no are the ones that matter most, because they are the total failures. An exception affects one request and one user; DNS expiring affects everybody, and it is invisible from inside a process that is no longer being reached.'),
    p('The reverse is equally true. An uptime monitor requesting your homepage every minute will never notice that checkout throws for customers in one country, because the homepage is fine and that is the only thing it looks at.'),
    img('inside-outside', 'Two observation points, one within a structure and one beyond its boundary', 'One watches from inside, one from outside. Neither sees what the other does.'),

    h2('Why is "the site is down" invisible to error tracking?'),
    p('Because reporting an error requires code to run, and several failure modes prevent that entirely.'),
    p('A container that will not start reports nothing — the crash happens before the error reporter initialises. A misconfigured DNS record means requests never arrive. An expired certificate means browsers refuse the connection before any request is made. A build that failed leaves the previous version serving, or nothing at all.'),
    p('There is a subtler version worth knowing. Some deployments fail in a way where the platform serves an error page from its own infrastructure. Your application never runs, the platform returns a clean 500, and error tracking is silent because there is no application to report from.'),
    p('The common property is that all of these are outside the application. Anything that prevents your code executing is by definition something your code cannot report.'),
    p('There is a related blind spot worth knowing about even when the application is running normally. Error tracking depends on being able to reach its own service, so an outbound network problem or an expired ingestion key produces the same silence as a crash. Most SDKs fail quietly by design, on the reasonable grounds that a monitoring tool should never break the application it monitors — which means a broken error tracker looks exactly like a healthy one.'),

    h2('What should the uptime monitor actually check?'),
    p('Not the homepage. An endpoint that exercises the parts most likely to fail.'),
    p('A homepage on a static site proves the CDN is up. It proves nothing about the database, the queue or any third party, all of which can be broken while that page renders perfectly.'),
    p('Add a health endpoint that touches the real dependencies and returns a meaningful status.'),
    code('ts', `
// /api/health — cheap, but it actually touches things.
export async function GET() {
  const checks = await Promise.allSettled([
    db.$queryRaw\`SELECT 1\`,          // database reachable
    redis.ping(),                     // cache/queue reachable
    storage.head('healthcheck.txt'),  // object storage reachable
  ]);

  const failed = checks
    .map((c, i) => (c.status === 'rejected' ? NAMES[i] : null))
    .filter(Boolean);

  return Response.json(
    { ok: failed.length === 0, failed },
    { status: failed.length ? 503 : 200 }
  );
}
`),
    p('Two properties matter. It must be genuinely cheap, because it runs every minute forever — a check doing real work becomes a meaningful share of your database load. And it must return a non-200 status when something is wrong, since most monitors alert on status code rather than parsing a body.'),
    p('Keep it unauthenticated but unguessable, or the monitor cannot reach it. And do not include version numbers or internal hostnames in the response — it is a public endpoint whether or not it is linked.'),

    h2('What else is worth monitoring from outside?'),
    p('Three things beyond "does it respond", each catching a failure the basic check misses.'),

    h3('Certificate expiry, with warning'),
    p('Most platforms renew automatically and occasionally do not. A check warning fourteen days before expiry turns a total outage into a task, and the failure is otherwise sudden and complete — every browser refuses to connect at the same moment.'),

    h3('Content, not just status'),
    p('A page returning 200 with an error message in the body is up as far as a status check is concerned. Asserting that expected text appears catches the deploy that succeeded and rendered nothing.'),

    h3('The critical path, not the front door'),
    p('If you can afford one synthetic check beyond the health endpoint, make it the flow that earns money — a login, a search, an add-to-cart. That is the difference between knowing the site responds and knowing it works.'),
    p('Check from more than one region if the audience is spread. A site reachable from Europe and not from Asia is an outage for half the users and looks perfectly healthy from a single monitoring location.'),
    p('Frequency deserves a moment of thought rather than being left at the default. Every minute is standard and means a failure is detected within roughly two minutes given the two-consecutive-failures rule. Every five minutes is cheaper and means a ten-minute outage may go entirely unnoticed, which for most businesses is the wrong trade — the monitoring costs nothing and the outage does.'),
    p('What the interval genuinely affects is the health endpoint\'s load. A check every minute from three regions is over four thousand requests a day, each touching the database. That is trivial for a single query and becomes meaningful if the endpoint grows into something that does real work, which is the argument for keeping it deliberately cheap and reviewing it if it ever gets extended.'),

    h2('What is error tracking genuinely good at?'),
    p('The failures that affect some requests rather than all of them, which is most of what actually goes wrong day to day.'),
    p('It sees the exception with a stack trace, the request that produced it, the user it affected, and how many others hit the same thing. That last part is what turns a report into a priority — one occurrence is noise, four hundred in an hour is the thing to fix now.'),
    p('It is also the only one of the two that catches regressions introduced by a deploy. A release that breaks one flow while leaving the site up produces a spike in a specific error, which is a signal an uptime monitor structurally cannot generate.'),
    p('Wire it up before launch rather than after the first incident. Retrofitting means the first real problem is diagnosed from a user\'s description rather than from a stack trace, which is a considerably slower and less pleasant way to work — and the first week after launch is precisely when the most problems surface, so it is the week you least want to be blind.'),
    img('spike', 'A flat sequence of markers with a sudden dense cluster at one point', 'One occurrence is noise. Four hundred in an hour is the thing to fix now.'),

    h2('How do you avoid alert fatigue?'),
    p('Alert on the things a human should act on tonight, and route everything else somewhere it can be read tomorrow.'),
    p('The failure mode is a channel producing forty notifications a day, all of which are ignored, including the one that mattered. Once a team is muting a channel the monitoring is decorative regardless of how good the tooling is.'),
    ul([
      '**Page for total outage.** The health check failing twice in a row, from two locations.',
      '**Notify for a new error type**, once, with a count. Not once per occurrence.',
      '**Digest for known noise** — a daily summary of things happening at a steady rate that nobody has fixed.',
      '**Suppress the ones you cannot act on**, such as errors from a browser extension or a bot probing for admin paths.',
      '**Require two consecutive failures** before an uptime alert, or every transient network blip pages somebody.',
    ]),
    p('The rule I hold to: if an alert fires and the correct response is to ignore it, the alert is wrong. Either fix the underlying issue or stop alerting on it, because the third option — receiving it and ignoring it — trains everyone to ignore the next one too.'),

    h2('Where should alerts go?'),
    p('Somewhere a human reads within the response time you are promising, which is usually not email.'),
    p('For a small project that means a phone. An SMS or a push notification for total outage, and a chat channel for everything else. Email alerts arrive alongside everything else in an inbox and are read whenever the inbox is read, which is the wrong latency for a site being down.'),
    p('The question worth answering explicitly at [handover](/blog/project-handover-checklist) is who receives these after the project ends. An alert routed to a developer who is no longer engaged is worse than no alert, because everyone believes monitoring exists.'),
    p('And test the delivery path. An alerting configuration that has never fired is untested, exactly like an untested backup — trigger it deliberately once and confirm the message arrives where you expect.'),

    h2('What does it cost?'),
    p('Nothing, at the scale most projects operate at.'),
    p('Error tracking free tiers cover thousands of events a month, which is more than a healthy application produces. Uptime monitoring free tiers cover several checks at one-minute intervals. Both only start costing money at volumes that imply the project can afford them.'),
    p('The real cost is attention: configuring the health endpoint, setting sensible thresholds, and tuning the noise in the first fortnight. Perhaps half a day, once, and it stays useful indefinitely.'),
    p('Set against the alternative — a client discovering their own outage, or a broken checkout running for a week — this is among the cheapest things on the whole build list.'),
    quote('The failures that hurt most produce silence rather than noise, and silence has to be checked for deliberately.'),

    h2('How do you make errors useful rather than numerous?'),
    p('Raw exception reports are a list of things that went wrong. What you want is a short list of things to fix, and getting there takes a small amount of configuration.'),

    h3('Attach the release'),
    p('Every error should carry the version it occurred in. Without it, a spike after a deploy and a spike from a traffic increase look identical, and the first question during an incident — did we cause this — has no answer.'),

    h3('Attach the user, carefully'),
    p('An identifier is enough. Knowing that four hundred errors come from three users is a completely different problem from four hundred users hitting it once, and the two need opposite responses. Send an id rather than personal data, since the error tracker is a system holding production information.'),

    h3('Filter the noise at the source'),
    p('Browser extensions, bots probing for admin paths, and network errors from users navigating away all generate reports that are never actionable. Filtering them client-side keeps the signal readable and the quota useful.'),

    h3('Group deliberately'),
    p('Default grouping sometimes splits one bug across a dozen entries because a value appears in the message. Fixing the fingerprint so they group correctly turns twelve small problems into one real one, which is the version you will actually prioritise.'),
    p('The measure of whether this is configured well is whether the dashboard is worth opening. If it holds two hundred untriaged entries nobody is reading it, and an important new error will arrive into a list already being ignored.'),
    img('signal-from-noise', 'A dense cluster of markers resolving into a few distinct grouped forms', 'A list of two hundred is ignored. A list of four is triaged.'),

    h2('What should happen when an alert fires?'),
    p('Something written down, because the moment an alert arrives is the worst time to decide what to do about it.'),

    h3('Confirm it is real'),
    p('One failed check from one location is frequently the monitor rather than the site. Two consecutive failures from two regions is real. Building that into the alerting threshold rather than into a human judgement saves the false alarms.'),

    h3('Check the platform first'),
    p('A meaningful share of outages belong to somebody else. The host status page takes ten seconds and occasionally ends the investigation, which is worth doing before opening a terminal.'),

    h3('Check what changed'),
    p('Most incidents follow a deploy. The most recent release, and whether rolling back is available, is the second thing to look at — and [rollback being an available option](/blog/staging-environment) is what makes this a calm question rather than a frightening one.'),

    h3('Tell somebody'),
    p('A client hearing about an outage from you is a different conversation from one hearing about it from their own customers. Even a holding message — we know, we are on it — changes the relationship considerably.'),
    p('This is the "site is down" runbook from [the handover document](/blog/project-handover-checklist), and the reason it exists as a written thing is that all four steps are obvious in the abstract and easy to forget when a client is calling.'),
    img('alert-response', 'A short sequence of decision points following a single trigger marker', 'Four steps, written down. The moment an alert fires is the worst time to be deciding them.'),

    h2('What about the third thing — logs?'),
    p('Different again, and worth naming because people sometimes treat it as covering both.'),
    p('Logs are the record you read after you already know something is wrong. They are for diagnosis rather than detection, and nobody watches them continuously — a problem visible only in logs is a problem nobody knows about.'),
    p('Where logs earn their place is answering "what happened around 14:32", which neither of the other two can. Error tracking shows the exception; logs show the sequence leading to it.'),
    p('Structured logging with a request id threaded through is the version that pays off, because it lets you reconstruct one request across services. Unstructured text logs are searchable and considerably harder to reason about.'),
    img('three-tools', 'Three instruments of different kinds arranged around a single subject', 'Detect from outside, detect from inside, diagnose afterwards. Three jobs, three tools.'),

    h2('What is the minimum worth setting up?'),
    p('Four things, perhaps an hour in total, and they cover the overwhelming majority of what goes wrong.'),
    ol([
      '**Error tracking in the application**, with the release version attached so a spike can be tied to a deploy.',
      '**An uptime check on a health endpoint** that touches the database, from two regions, alerting after two consecutive failures.',
      '**A certificate expiry warning** at fourteen days.',
      '**One synthetic check on the critical path** — whatever flow the business depends on.',
    ]),
    p('That is the version I put on every project including small ones. Anything beyond it — performance monitoring, distributed tracing, custom dashboards — is worth adding when there is a specific question it answers, and is overhead before that.'),

    h2('Conclusion'),
    p('Error tracking watches from inside and sees exceptions, regressions and the failures affecting some users. Uptime monitoring watches from outside and sees the failures that stop your code running at all. Neither can see what the other sees, which is why the question is not which to choose.'),
    p('Point the uptime check at a health endpoint touching real dependencies rather than at the homepage, alert after two consecutive failures, and add certificate expiry warning. Attach release versions to errors so a spike is traceable to a deploy. Send anything urgent to a phone rather than an inbox.'),
    p('Then tune the noise, because monitoring nobody reads is the same as no monitoring with an extra subscription. An hour of setup, close to nothing to run, and it is the difference between hearing about an outage from a dashboard and hearing about it from a customer.'),
    img('two-signals', 'Two distinct detection paths converging on a single notification point', 'Disjoint coverage, one destination. That is the whole arrangement.'),
    p('One habit worth adopting alongside all of this: after any real incident, spend ten minutes asking which of the two tools noticed it, and how long it took. If the answer is that neither did and a user reported it, that is a gap with a specific shape — a check that does not exist, or a threshold set too loosely. Incidents are the only reliable source of information about what your monitoring is missing, and the information decays quickly if nobody writes it down.'),
  ),
  faqs: faq([
    ['What is the difference between uptime monitoring and error tracking?',
     'Error tracking runs inside your application and catches exceptions, so it cannot report anything when the application is not running. Uptime monitoring checks from outside and catches total failures — DNS, certificates, failed deploys — that are invisible from within.'],
    ['Do you need both Sentry and an uptime monitor?',
     'Yes. They cover disjoint failure sets. A site can be completely unreachable with a clean error dashboard, because the thing that reports problems is part of what stopped. Running only one is how an outage lasts a weekend.'],
    ['What endpoint should an uptime monitor check?',
     'A health endpoint that touches your real dependencies — a trivial database query, storage, the cache — and returns a non-200 status when any fail. The homepage proves the CDN is up and nothing else, which is the least likely thing to break.'],
    ['How do you avoid alert fatigue?',
     'Alert only on things a human should act on tonight, require two consecutive failures before paging, notify once per new error type rather than per occurrence, and digest the known noise. If the right response to an alert is to ignore it, the alert is wrong.'],
  ]),
};
