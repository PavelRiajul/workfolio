import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/push-notifications-reliability/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-push-notifications-reliability',
  slug: 'push-notifications-reliability',
  title: 'Push Notifications Are Not Guaranteed Delivery',
  category: 'mobile',
  order: 104,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-28',
  series: 'React Native in production',
  excerpt:
    'Every layer between your server and a phone can drop a notification silently. Design for that, and ask for the permission at the right moment.',
  coverLabel: 'Push reliability — cover',
  body: body(
    p('The most common misunderstanding about push notifications is that sending one means it arrives. It does not. A push is a best-effort request to a platform service that may deliver it, may delay it, may collapse it into another, or may quietly discard it — and none of those outcomes are reported back to you in a useful way.'),
    p('That matters because teams routinely build features whose correctness depends on delivery. A reminder that only exists as a notification, a state change communicated only by push, an action the user is expected to take because they were told. Each of those is a feature with a silent failure mode affecting some percentage of users every day.'),
    p('This post covers what actually happens between your server and a phone, why permission timing determines most of your reach, and how to build features that degrade properly when a notification does not arrive.'),

    h2('What happens when you send one?'),
    p('Four hops, each of which can drop it.'),
    p('Your server sends to the platform service — APNs for Apple, FCM for Android. That service queues it, decides whether and when to deliver, and hands it to the device. The device decides whether to display it based on permission state, focus modes, battery state and its own heuristics. Only then does anybody see it.'),
    table('Where a notification can disappear', [
      ['Stage', 'Failure mode'],
      ['Your server → platform', 'Invalid token, rate limit, malformed payload'],
      ['Platform queue', 'Delayed, collapsed, or expired'],
      ['Platform → device', 'Device offline, throttled, doze mode'],
      ['Device → user', 'Permission revoked, focus mode, notification muted'],
      ['User → attention', 'Dismissed in a batch of forty'],
    ]),
    p('The last row is the one nobody models and it is the largest loss. A notification that arrives correctly into a tray with thirty others is delivered and unseen, which for product purposes is the same as not sent.'),

    h3('Delivery receipts do not mean what you want'),
    p('Platform acknowledgement means the service accepted the message, not that a person saw it. Some platforms offer delivery reporting with caveats, and none of them can tell you the notification was read. Treat every number in this pipeline as an upper bound.'),

    h3('Android is stricter than it used to be'),
    p('Aggressive battery optimisation, doze mode and manufacturer-specific power management all delay or suppress notifications, and some manufacturers are considerably more aggressive than the platform baseline. An app that works perfectly on one Android device can be effectively silent on another.'),
    img('four-hops', 'A message passing through several intermediaries before reaching a person, with losses at each stage', 'Four hops, each of which can drop it silently. The largest loss is the last one — delivered into a tray with thirty others.'),

    h2('When should you ask for permission?'),
    p('After the user has a reason to say yes, and never on first launch.'),
    p('This is the single highest-leverage decision in the whole area, because a declined permission is very hard to recover. On iOS you get one system prompt; if the user declines, re-enabling requires them to find the setting themselves, which almost nobody does. The prompt is a one-shot resource and most apps spend it in the first ten seconds on a user who has no idea what the app does yet.'),

    h3('Prime before you prompt'),
    p('Show your own explanation first — what notifications you will send, why they are useful, with a clear way to decline. Only trigger the system prompt for people who said yes to yours. Someone declining your screen costs nothing, because you can ask again later; someone declining the system prompt is gone.'),

    h3('Ask at the moment of relevance'),
    p('Immediately after the user sets a reminder, joins a conversation, or does something whose value depends on being notified. At that point the request is obviously reasonable, and acceptance rates are dramatically higher than on a cold prompt.'),

    h3('Let people choose categories'),
    p('Bundling transactional alerts with marketing means anybody who dislikes the second turns off the first. Separate channels — Android has this natively and iOS has an equivalent — let users keep what they want and mute what they do not, instead of turning everything off.'),

    h3('Handle the declined state properly'),
    p('An app whose core loop assumes notifications must work for the substantial share of users who declined. That means an in-app inbox, a badge, or an email fallback — anything that surfaces the same information through a channel you control.'),

    img('priming', 'An explanatory step preceding an irreversible system request', 'Your own screen first. A decline there costs nothing; a declined system prompt on iOS is close to permanent.'),

    h2('How do you manage tokens?'),
    p('Carefully, because a stale token is the most common cause of a user silently receiving nothing.'),
    p('Device tokens change. They rotate on reinstall, on restore to a new device, occasionally on OS update, and they become invalid when an app is uninstalled. A server sending to a token from four months ago is sending into a void and getting a success response for it.'),

    code('ts', `
// Register on every launch, not just the first — tokens rotate silently.
const token = await Notifications.getExpoPushTokenAsync();
await api.registerDevice({
  token: token.data,
  platform: Platform.OS,
  appVersion: Constants.expoConfig?.version,
  // The user this token currently belongs to, so a shared device
  // does not deliver one person's notifications to another.
  userId: session.userId,
});
`),

    h3('Refresh on every launch'),
    p('Registering once at signup guarantees drift. Sending the current token on every launch is cheap, keeps the mapping accurate, and costs one request against a problem that otherwise degrades invisibly over months.'),

    h3('Prune invalid tokens immediately'),
    p('Both platforms report tokens that are no longer valid. Deleting them when reported keeps the database accurate and prevents your send volume being inflated by devices that no longer exist — which also distorts every delivery metric you have.'),

    h3('Bind tokens to users, and unbind on logout'),
    p('A shared or resold device that still holds a previous user\'s token will deliver their notifications to a stranger. Clearing the association on logout is a two-line fix for what is otherwise a genuine privacy incident.'),

    h3('Store the app version alongside the token'),
    p('Knowing which build a device is running lets you avoid sending a payload that only a newer version can handle. Users do not update promptly, and a deep link into a screen that does not exist yet is a crash rather than a notification.'),
    img('token-drift', 'A stored device identifier that has silently ceased to correspond to any real device', 'Tokens rotate on reinstall, restore and sometimes OS update. Registering once at signup guarantees drift within months.'),

    h2('What makes a notification worth sending?'),
    p('That the user would have wanted to be interrupted, which is a much higher bar than that the event occurred.'),
    p('Every notification spends a small amount of the user\'s tolerance. Spend it well and they stay opted in; spend it on things that did not need interrupting and they mute the app, which is a quieter and more permanent loss than an uninstall because it does not appear in any metric.'),

    h3('Personal and timely beats broadcast'),
    p('"Sarah replied to your comment" is worth an interruption. "Check out what is new this week" generally is not, and the second kind is what trains people to dismiss without reading — which then damages the first kind.'),

    h3('Say something specific in the body'),
    p('A notification that says "You have a new message" forces the user to open the app to learn anything. Including the actual content respects their time and, counterintuitively, drives better engagement than withholding it does.'),

    h3('Batch instead of repeating'),
    p('Three notifications in five minutes from one app is what makes somebody mute it. Collapsing related events into one — with a count — is more useful and much less costly to your standing.'),

    h3('Respect the clock and the calendar'),
    p('A notification at 3am in the user\'s timezone is memorable for the wrong reason. Scheduling in local time, with quiet hours, is basic and frequently missing — usually because the server sends in UTC and nobody checked.'),

    h3('Silent pushes are not a scheduling mechanism'),
    p('Both platforms offer a background push that wakes the app without displaying anything, and both throttle it heavily according to their own judgement of how useful your app is. It is a reasonable way to opportunistically refresh data and a bad foundation for anything that must happen — treating it as a timer produces a feature that works in testing and fires unpredictably in the field.'),
    img('worth-sending', 'A specific personal event beside a generic broadcast, weighted very differently', 'Every notification spends a little of the user’s tolerance. Broadcasts train people to dismiss, which then damages the ones that matter.'),

    h2('What about local notifications?'),
    p('They are more reliable than push and are underused, because they do not involve a network at all.'),
    p('A local notification is scheduled on the device and fires from the device. No server, no platform queue, no connectivity requirement. For anything whose timing is known in advance — a reminder the user set, a recurring prompt, a scheduled check-in — this is strictly better than push and it works offline.'),

    h3('Schedule locally, sync the intent'),
    p('The pattern that works is storing the user\'s intent on the server and scheduling the actual notification on each device. The server owns what should happen; the device owns making it happen, and neither depends on the network at the moment it matters.'),

    h3('Mind the platform limits'),
    p('There is a cap on how many local notifications can be pending — historically 64 on iOS. A daily recurring reminder scheduled individually for a year exceeds it silently, and the ones beyond the limit simply never fire. Use repeating schedules or roll them forward.'),

    h3('Reschedule on launch'),
    p('Local notifications do not survive every reinstall or restore, and the user\'s settings may have changed since. Re-establishing the schedule on launch from the stored intent keeps it correct — which on an [offline-first app](/blog/react-native-offline-first) means reading local state rather than waiting on a request.'),

    h2('How do you handle a notification being tapped?'),
    p('By treating the tap as a deep link into a specific state, from any starting condition.'),
    p('A tap can arrive when the app is in the foreground, in the background, or not running at all, and the three paths behave differently. Handling only the case you tested — usually backgrounded — produces a notification that works during development and does nothing from a cold start, which is the most common way it is used.'),

    h3('Cold start is the case to test'),
    p('When the app was terminated, the notification payload arrives as part of launch rather than as an event, and the navigation stack does not exist yet. Getting this right means deferring the navigation until the app is ready and holding the intent in the meantime.'),

    h3('Do not just open the home screen'),
    p('A notification about a specific thing that opens the app generally has wasted the interruption. It should land on exactly the relevant screen, with a sensible back destination — [which is what deep linking is for](/blog/react-native-deep-linking).'),

    h3('Handle a payload the app does not understand'),
    p('An older build receiving a notification referring to a newer feature should fall back gracefully rather than crash. Version-aware payloads and a defensive default are what prevent a notification campaign becoming a crash spike.'),
    img('tap-paths', 'A single action arriving through three different application states with different handling', 'Foreground, background and cold start behave differently. Cold start is the untested one and the most common in practice.'),

    h2('How do you know if any of this is working?'),
    p('By measuring the funnel rather than the sends, which almost nobody does.'),
    p('The number your provider reports is sends, and sends is the least informative number available. What matters is the chain from sent to delivered to displayed to opened to acted upon, and each step loses a meaningful share.'),
    table('The push funnel worth tracking', [
      ['Step', 'What it tells you'],
      ['Sent', 'Almost nothing on its own'],
      ['Accepted by platform', 'Token validity'],
      ['Opened', 'Relevance and timing'],
      ['Action completed', 'Whether it was worth sending'],
      ['Opt-out rate after send', 'Whether you overspent your welcome'],
    ]),
    p('The last row is the leading indicator. A campaign with a good open rate and a spike in disabled notifications has borrowed from future reach to buy today\'s engagement, and that trade is almost never worth it.'),

    h3('Segment by platform and OS version'),
    p('Delivery behaviour differs substantially between iOS and Android, and between Android manufacturers. An aggregate open rate hides a segment where notifications are effectively not arriving at all, and that segment can be large.'),

    h3('Compare against a held-out group'),
    p('The honest way to know whether a campaign worked is to withhold it from a small random slice of users and compare their behaviour with everyone else. Open rates measure the notification; a holdout measures whether sending it changed anything at all, and the answer is sometimes no.'),

    h3('Watch the permission rate as a health metric'),
    p('The proportion of users who have notifications enabled is the ceiling on everything else. If it is falling, the content is the problem, and no amount of send-time optimisation compensates for a shrinking audience.'),

    img('funnel', 'A sequence narrowing from messages issued to actions actually taken', 'Sends is the least informative number available. The opt-out rate after a campaign is the one that predicts next month.'),

    h2('What should the architecture look like?'),
    p('Notifications as one delivery channel for events that exist independently of them.'),
    ol([
      '**The event happens** and is recorded in your system regardless of any notification.',
      '**An in-app inbox** reflects it, so it is findable whether or not a push arrived.',
      '**A push is attempted** as a way of drawing attention to it, not as the record of it.',
      '**A fallback channel** — email or an in-app badge — covers people who never see it.'],
    ),
    p('Building it this way means a dropped notification degrades from "the user missed something entirely" to "the user found out slightly later", which is the difference between a broken feature and an imperfect one.'),

    h3('Deduplicate at the device'),
    p('Retries, multiple registered devices for one person and an occasional platform redelivery all produce the same notification arriving twice. Including a stable event identifier in the payload lets the app recognise a repeat and collapse it, which is a small amount of work against a failure that looks careless to the user.'),

    h3('Send from a queue, not from the request'),
    p('Notification sends belong in a background job with retries rather than inline in the request that triggered them. A platform outage should not fail the user action that caused it — [the same argument as any external call](/blog/background-job-queues).'),

    h2('What does it cost?'),
    p('A day for the plumbing, and ongoing judgement about what to send.'),
    p('Registration, token lifecycle, tap handling across all three app states and the in-app inbox is roughly a day of work. The permission priming screen is a couple of hours. None of it is difficult; it is just more pieces than people expect from a feature described as "add push notifications".'),
    p('The honest counterweight: the technical work is the easy part and the restraint is the hard part. Most apps that struggle with notifications do not have a delivery problem — they have a relevance problem, and every unnecessary send erodes the permission that makes the necessary ones possible. If you are unsure whether something warrants an interruption, it does not, and an app that sends less usually reaches more people over time than one that sends more.'),
    quote('A push is a best-effort request, not a delivery guarantee. Any feature whose correctness depends on one arriving has a silent failure mode affecting some users every day.'),

    h2('Conclusion'),
    p('A notification passes through four hops, each of which can drop it silently, and the largest loss is the last — arriving correctly into a tray with thirty others. Platform acknowledgement means the message was accepted, never that anybody saw it, so treat every number in the pipeline as an upper bound.'),
    p('Permission timing decides most of your reach. Never prompt on first launch: prime with your own screen first so a decline costs nothing, and trigger the system prompt at the moment of relevance — right after somebody sets a reminder or joins a conversation. On iOS the system prompt is a one-shot resource and a decline is close to permanent.'),
    p('Refresh tokens on every launch rather than once at signup, prune invalid ones as the platforms report them, unbind on logout so a resold device does not deliver a stranger\'s notifications, and store the app version so you never send a payload only a newer build can handle.'),
    p('Use local notifications wherever timing is known in advance — no server, no queue, no connectivity, and they work offline. Store the intent server-side, schedule on the device, mind the pending-notification cap, and reschedule on launch.'),
    p('Then architect around the assumption that delivery fails: record the event independently, surface it in an in-app inbox, treat push as attention-drawing rather than as the record, and provide a fallback channel. Measure the funnel through to action completed and watch the opt-out rate, because a campaign that wins engagement while people disable notifications has borrowed from future reach. If you want this built so it degrades properly, [that is the kind of detail I plan for](/services).'),
  ),
  faqs: faq([
    ['Are push notifications guaranteed to be delivered?',
     'No. They are best-effort. The platform service may delay, collapse or discard a message, the device may suppress it under battery optimisation or a focus mode, and the user may never see it in a crowded tray. Platform acknowledgement confirms acceptance, not that anybody read it.'],
    ['When should I ask for notification permission?',
     'Never on first launch. Show your own priming screen explaining what you will send, and only trigger the system prompt for people who agree — a decline on your screen costs nothing, while a declined system prompt on iOS is close to permanent. Ask at the moment of obvious relevance.'],
    ['Why do some users stop receiving notifications?',
     'Usually a stale device token. Tokens rotate on reinstall, on restore to a new device and sometimes on OS update, and a server sending to an old one gets a success response for a message that reaches nobody. Register the current token on every launch rather than once at signup.'],
    ['Should I use local notifications instead of push?',
     'Wherever the timing is known in advance, yes — reminders, recurring prompts, scheduled check-ins. Local notifications fire from the device with no server, no platform queue and no connectivity requirement, which makes them substantially more reliable. Mind the cap on pending notifications.'],
    ['What should I measure?',
     'The funnel from sent through accepted, opened and action completed — sends alone tell you almost nothing. Segment by platform and Android manufacturer, since delivery behaviour varies widely, and watch the opt-out rate after each campaign as the leading indicator of future reach.'],
  ]),
};
