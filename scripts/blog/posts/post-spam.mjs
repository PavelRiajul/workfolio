import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/form-spam-protection/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-form-spam-protection',
  slug: 'form-spam-protection',
  title: 'Spam Protection on Every Public Form',
  category: 'fullstack',
  order: 44,
  readTime: '12 min read',
  date: 'January 2026',
  publishedAt: '2026-01-29',
  series: 'Every build',
  excerpt:
    'Stopping bot submissions without making a human prove they are one — honeypots, Turnstile, rate limits and server-side verification.',
  coverLabel: 'Spam protection — cover',
  body: body(
    p('A contact form goes live on a Tuesday. By Friday it has produced forty submissions, thirty-eight of which are advertising search engine optimisation services, and the client has stopped reading the inbox.'),
    p('That is the real cost of form spam. Not server load, not storage — the client no longer trusts the notification, so the two genuine enquiries sit unread among the noise. A form nobody reads is a form that does not work.'),
    p('It is one of [the eight things in every build](/stack), and it is about twenty minutes of work spread across three layers.'),

    h2('Why not just use a CAPTCHA?'),
    p('Because the traditional version taxes every human to stop a machine, and the machines have been better at it than people for years.'),
    p('Selecting traffic lights across nine tiles takes eight to fifteen seconds and fails often enough to require a second attempt. On a contact form that is a meaningful share of people abandoning, and the ones most affected are those using screen readers or on poor connections.'),
    p('The modern alternatives — Turnstile, and the invisible modes of the older services — assess signals in the background and only present a challenge when something looks unusual. For the overwhelming majority of visitors there is nothing to do, which is the correct experience.'),
    p('The framing I hold to: spam protection should cost the spammer something and the visitor nothing. Anything requiring effort from a legitimate user has the incentive backwards.'),
    img('cost-asymmetry', 'Two paths through a barrier, one open and one narrowed', 'It should cost the sender something and the visitor nothing.'),

    h2('What are the three layers?'),
    p('Each catches a different class of submission, and each is cheap enough that there is no reason to pick one.'),
    table('Protection layers and what each stops', [
      ['Layer', 'Stops', 'User friction', 'Effort'],
      ['Honeypot field', 'Naive form-filling bots', 'None', 'Ten minutes'],
      ['Turnstile', 'Most automated abuse', 'Near none', 'Thirty minutes'],
      ['Rate limit', 'Floods and scripted retries', 'None for humans', 'Twenty minutes'],
      ['Content heuristics', 'What gets through', 'None', 'Ongoing'],
      ['Manual review', 'Targeted, human-driven abuse', 'None', 'Continuous'],
    ]),
    p('The first three take under an hour combined and stop the overwhelming majority. The last two are for what remains, and on a small site what remains is usually a handful a month rather than a problem.'),

    h2('Do honeypot fields still work?'),
    p('Against unsophisticated bots, yes, and those are still most of the volume.'),
    p('The technique is a field that is present in the markup and hidden from humans. A bot filling every input it finds fills that one too; a person never sees it. A submission with it populated is discarded.'),
    code('html', `
<!-- Hidden from sight and from assistive technology, present in the DOM. -->
<div aria-hidden="true" style="position:absolute;left:-9999px" >
  <label for="company_url">Leave this blank</label>
  <input id="company_url" name="company_url" type="text"
         tabindex="-1" autocomplete="off">
</div>
`),
    p('Three details make it work properly. Hide it with positioning rather than `display:none`, since some bots specifically skip hidden inputs. Set `tabindex="-1"` and `aria-hidden` so keyboard and screen-reader users never encounter it. And name it something plausible — `email_confirm`, `company_url` — because a field named `honeypot` is a field bots learn to skip.'),
    p('A second variant catches more: a timestamp when the form was rendered, checked on submission. A form completed in under two seconds was not completed by a person reading it. Both are free and neither is visible.'),

    h2('How does Turnstile differ?'),
    p('It assesses behavioural and browser signals rather than asking anyone to identify a bicycle, and it is free at any volume.'),
    p('The widget runs in the background, produces a token, and your server verifies that token against Cloudflare before accepting the submission. Most visitors see a brief automatic tick and nothing else. Where signals are ambiguous, a lightweight interactive challenge appears.'),
    p('The reason it is in my stack rather than a competitor: no cost at any scale, no visible challenge for typical users, and no ad-tech relationship attached to visitors who never consented to one. On a contact form that last point is worth something.'),
    p('It is not perfect. A determined operator using a real browser and paying humans will get through, and that is true of every option. The realistic goal is eliminating automated volume, not making submission impossible.'),
    p('One practical caveat: the widget is a third-party script, so anything blocking it blocks your form. Aggressive privacy extensions, corporate networks with restrictive egress rules and some regions all produce visitors who genuinely cannot load it. That is a small proportion and it is not zero, which is the entire argument for the fallback described later rather than a theoretical concern.'),
    p('It also has an implicit dependency worth knowing about. If verification is unreachable — the provider having an incident, or your server unable to make outbound requests — every submission fails closed. Deciding in advance whether that is acceptable, or whether the form should accept and flag when verification is unavailable, is better than discovering the behaviour during an outage.'),

    h2('Why is server-side verification mandatory?'),
    p('Because everything on the client is a suggestion, and a bot posting directly to your endpoint never runs any of it.'),
    p('The widget produces a token. That token means nothing until your server exchanges it with the provider and receives confirmation. Skipping that step — rendering the widget and trusting its presence — is the single most common implementation mistake, and it provides no protection whatsoever against anything posting directly.'),
    code('ts', `
// The token is worthless until the server checks it.
const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: new URLSearchParams({
    secret: env.TURNSTILE_SECRET,
    response: token,
    remoteip: request.headers.get('cf-connecting-ip') ?? '',
  }),
});

const { success } = await verify.json();
if (!success) return json({ error: 'verification_failed' }, { status: 400 });
`),
    p('The same reasoning applies to the honeypot and the timestamp: both are checked on the server, because both are trivially removable by anything not using a browser. This is [the same principle as validating anything crossing a boundary](/blog/type-safe-mern) — the client is a convenience, never a control.'),
    img('server-side', 'A token passing from an outer boundary to an inner verification point before proceeding', 'The client produces a token. The server decides whether it means anything.'),

    h2('Where do rate limits fit?'),
    p('Catching what the other two miss — the same submission repeated, or a script hammering an endpoint regardless of what it returns.'),
    p('Two limits are worth having. A per-IP limit of a handful of submissions an hour, which no legitimate user reaches. And a global limit, which protects against a distributed flood where each address is individually unremarkable.'),
    p('Both belong on the server, and both should fail quietly. A rate-limited bot receiving a clear "too many requests" learns something; one receiving what looks like success learns nothing and stops trying. For genuine users the limit is invisible, since nobody sends five contact form submissions in an hour.'),
    p('Keying the limit deserves a moment of thought. Address alone is imperfect — an office behind one shared connection looks like a single sender, and a distributed script looks like hundreds of different ones. Combining the address with something else present in the request, and keeping the global ceiling as the backstop, covers both directions better than either key on its own.'),
    p('This matters most on endpoints that cost you money to process — anything triggering an email, an SMS, or [an AI call](/blog/rate-limiting-ai-features). A form that sends a notification per submission is a form where volume converts directly into spend.'),

    h2('What about the submissions that get through?'),
    p('Filter on content, and accept that a small residue is normal.'),

    h3('Score rather than block'),
    p('A submission containing three links, written entirely in a language your business does not operate in, from a domain registered yesterday, is probably spam. Any one signal alone is not. Scoring several and flagging above a threshold is more accurate than any single rule.'),

    h3('Flag, do not delete'),
    p('A false positive on a contact form is a lost customer, which is worse than a spam message in a folder. Route suspicious submissions somewhere reviewable rather than discarding them, at least until the rules have proven themselves.'),

    h3('Watch the words that recur'),
    p('Most spam to a small site comes from a handful of templates. A short list of phrases, updated occasionally from what actually arrives, catches a disproportionate share for almost no effort.'),

    h3('Make the reply address useless'),
    p('Much of this exists to harvest a reply. A notification that does not expose the recipient address, and a form that does not confirm whether an address exists, makes the site a poor target — which reduces the volume over time.'),

    h2('What should the user experience be?'),
    p('Invisible when it works, and clear when it does not.'),
    p('A legitimate submission should involve no extra step. That is achievable now, and any design requiring a person to prove something before contacting you is costing enquiries.'),
    p('When verification genuinely fails — an old browser, an aggressive extension, a network blocking the widget — the message must say what happened and offer an alternative. "Verification failed" with no path forward converts a false positive into a lost customer.'),
    p('Always publish a direct email address somewhere. It is the fallback for everyone the form rejects incorrectly, and it costs nothing beyond the spam that address will attract, which is a filtering problem your mail provider already solves well.'),
    img('invisible-when-working', 'A clear path through a checkpoint with no visible obstruction', 'Invisible when it works. Clear, with a way forward, when it does not.'),

    h2('What happens after the form is submitted?'),
    p('The protection story does not end at acceptance, and two things downstream are worth getting right.'),

    h3('Never echo submitted content into an email unescaped'),
    p('A notification rendering user input as HTML is an injection vector, and form submissions are the most reliably hostile input a site receives. Escape it, or send plain text, and treat anything that arrived from outside as untrusted right through to the inbox.'),

    h3('Do not confirm what you know'),
    p('A form replying "that email is already registered" tells an attacker which addresses exist. The same applies to password reset and to newsletter signup. Respond identically whether or not the address is known, and put the difference in the email that follows.'),

    h3('Send from your domain, not the submitter\'s'),
    p('Setting the sender to the visitor\'s address makes replies convenient and makes the message fail authentication, since your server is not authorised to send as their domain. Send from your own address with reply-to set to theirs — the same [deliverability discipline](/blog/staging-environment) that applies to every other transactional message.'),

    h3('Store what you accept'),
    p('A submission that only exists as an email is a submission lost when somebody deletes the wrong thing. Writing it to the database as well costs a table and means the enquiry survives an inbox, which clients appreciate more than any anti-spam measure.'),
    img('after-submission', 'A received item passing through a sanitising stage before two separate destinations', 'Form input is the most reliably hostile data a site receives. It stays untrusted all the way to the inbox.'),

    h2('How does this apply to other public endpoints?'),
    p('Contact forms get the attention and they are rarely the most attractive target on a site.'),

    h3('Newsletter signup'),
    p('Frequently abused to send confirmation emails to addresses the sender does not own, using your domain as the delivery mechanism. Double opt-in and rate limiting per address prevent it, and without them your sending reputation pays for somebody else\'s activity.'),

    h3('Search and filter endpoints'),
    p('Cheap to call and sometimes expensive to serve. An unauthenticated search hitting the database on every keystroke is a denial-of-service tool somebody else operates. Rate limit it, and debounce on the client so ordinary use does not resemble abuse.'),

    h3('Anything that costs money per call'),
    p('An endpoint triggering an SMS, a document generation or a model call converts requests directly into spend. These deserve authentication rather than only rate limiting, because a limit bounds the damage and an authenticated endpoint prevents most of it.'),

    h3('File uploads'),
    p('The most consequential public endpoint on most sites. Constrain type and size before accepting, generate your own filenames rather than trusting the supplied one, and store outside the web root so nothing uploaded can be executed by being requested.'),
    p('The general rule is that every endpoint reachable without a login should have a stated answer to two questions: what does one call cost, and what stops somebody making a million of them. Most sites have answered neither for anything other than the contact form.'),
    img('other-endpoints', 'Several entry points around a boundary, each with a differently sized control', 'The contact form gets the attention. It is rarely the most attractive target.'),

    h2('What about forms behind a login?'),
    p('Different problem, lighter protection, and worth distinguishing.'),
    p('An authenticated form has already established a human on the other end at signup. Turnstile there is friction with no benefit, and the honeypot is unnecessary. What still applies is rate limiting, because a compromised or automated account is a real scenario and the limit is invisible either way.'),
    p('The place to spend effort on an authenticated product is signup itself. That is the public form, and it is where abuse enters — fake accounts consuming free-tier resources, or created in bulk to be sold later. Protecting signup and leaving internal forms open is the correct allocation.'),
    p('Email verification does most of the remaining work. An account that cannot receive mail at a real address is a considerably less attractive target, and requiring verification before anything expensive can be used prevents the most common abuse pattern.'),

    h2('What does this cost?'),
    p('Nothing to run, and under an hour to build.'),
    p('Turnstile is free at any volume. The honeypot is markup and a conditional. Rate limiting is a counter you likely already have for other endpoints. There is no ongoing subscription for any of it.'),
    p('The cost people miss is the maintenance of content rules, which drift as spam patterns change. Keeping that list short and reviewing it when something notable gets through is a few minutes a quarter, and elaborate rule sets are not worth building for the volume a small site receives.'),
    quote('The measure is not how many spam messages you blocked. It is whether the client still reads the notifications, because a form nobody reads is a form that does not work.'),

    h2('How do you know it is working?'),
    p('Two numbers, and neither is the count of blocked submissions.'),
    p('The first is how many genuine enquiries arrive per month. If that falls after adding protection, something is rejecting real people, and the block count being impressive is beside the point.'),
    p('The second is whether the client reads notifications. Ask, rather than inferring it — a client who has muted the notification because of noise has the same outcome as a broken form, and the block count will look excellent throughout.'),
    p('Log rejections with the reason, at least initially. A rejection log showing everything caught by the honeypot suggests it is working; one showing regular Turnstile failures from ordinary browsers suggests it is rejecting people, which is worth investigating before it becomes normal.'),
    p('The check I would run at least once on any live form is submitting it yourself, from a phone, on mobile data, with whatever browser you do not normally use. It takes two minutes and it is the only way to be certain the arrangement works for somebody who is not you on the machine it was built on. A form that has only ever been tested by its author in a development environment has not really been tested.'),

    h2('Conclusion'),
    p('Three layers, none of which asks a visitor to do anything. A properly hidden honeypot with a plausible name, plus a timestamp check. Turnstile with the token verified on the server, because the client-side widget alone protects nothing. Rate limits per address and globally, failing quietly.'),
    p('Then score the residue on content, flag rather than delete, and always publish a direct email address for anyone the form wrongly rejects.'),
    p('Under an hour, no ongoing cost, and it means the client keeps reading their notifications — which is the only outcome that matters, since a contact form is worth exactly as much as the attention paid to what it delivers.'),
    img('attention-preserved', 'A small set of items arriving at a reading point, with noise diverted before it', 'The measure is whether the notifications still get read.'),
    p('The mistake worth avoiding at the other extreme is over-building this. Spam protection is an area where it is easy to keep adding layers — reputation scoring, behavioural analysis, elaborate content rules — chasing the last few submissions a month. That effort is better spent almost anywhere else, and each additional layer carries a risk of rejecting somebody real. Three layers, a short content filter, and a published email address is the point of diminishing returns for a small business site, and stopping there is the correct decision rather than an incomplete one.'),
  ),
  faqs: faq([
    ['How do you stop contact form spam?',
     'Three layers, none of which asks the visitor to do anything: a properly hidden honeypot field with a plausible name, Turnstile with its token verified server-side, and rate limits per IP and globally. Under an hour of work and no ongoing cost.'],
    ['Is Turnstile better than reCAPTCHA?',
     'For most sites, yes. It is free at any volume, shows no visible challenge to typical visitors, and carries no ad-tech relationship with people who never consented to one. Neither stops a determined human operator, which is true of every option.'],
    ['Do honeypot fields still work?',
     'Against unsophisticated bots, which are still most of the volume. Hide it with positioning rather than display:none, set tabindex minus one and aria-hidden so real users never encounter it, and give it a plausible name — a field called honeypot gets skipped.'],
    ['Should form validation happen on the server?',
     'Always. Everything on the client is a suggestion, and a bot posting directly to your endpoint runs none of it. Rendering a widget without verifying its token server-side is the most common implementation mistake and provides no protection at all.'],
  ]),
};
