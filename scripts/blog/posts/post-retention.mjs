import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mobile-app-retention/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mobile-app-retention',
  slug: 'mobile-app-retention',
  title: 'Why Nobody Opens Your App a Second Time',
  category: 'mobile',
  order: 106,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-03',
  series: 'Mobile decisions',
  excerpt:
    'Most apps lose the majority of users within a week, and most of that happens in the first session. What actually causes it, and what fixes it.',
  coverLabel: 'App retention — cover',
  body: body(
    p('The uncomfortable statistic about mobile apps is that a large majority of people who install one never open it a third time, and a meaningful share never open it a second. Whatever the exact figures for your category, the shape is consistent: the losses are enormous and they are concentrated at the very start.'),
    p('That concentration is the useful part. Retention work is usually discussed as a long-term engagement problem — notifications, streaks, rewards — when the majority of the loss happened in the first ninety seconds, before any of that machinery had a chance to run. Fixing the first session is worth more than every re-engagement tactic combined.'),
    p('This post is about where the drop actually happens, what causes each part of it, and what to do differently — including the honest cases where retention is not the number you should be optimising.'),

    h2('Where do people actually leave?'),
    p('In the first session, mostly before doing anything useful.'),
    p('If you plot the funnel from install through to first meaningful action, the losses stack up in a predictable order: some never open it at all, more abandon during signup, more again before the first real interaction, and the remainder over the following days. Only the last of those is what people usually mean by retention.'),
    table('A typical first-week funnel', [
      ['Step', 'Remaining', 'Usual cause of loss'],
      ['Installed', '100%', '—'],
      ['Opened once', '~75%', 'Installed on impulse, forgot'],
      ['Past signup', '~45%', 'Account required before value'],
      ['First real action', '~30%', 'Unclear what to do'],
      ['Opened day 2', '~20%', 'No reason to return'],
      ['Opened day 7', '~10%', 'Habit never formed'],
    ]),
    p('Read that top to bottom and note where the largest single drop is. It is signup, and signup is entirely under your control — unlike almost everything below it.'),

    h3('Instrument this before optimising anything'),
    p('The specific numbers for your app matter more than any benchmark, and most teams cannot produce this table because they measure sessions rather than the funnel. Five events — opened, signup started, signup completed, first action, returned — is enough to see where you are actually losing people.'),

    h3('Cohort by install date'),
    p('An aggregate retention number mixes users acquired through very different channels and app versions. Cohorts show whether last month\'s changes helped, which an average never does — [the same reasoning as any cohorted metric](/blog/cro-experiment-results).'),
    img('funnel-drop', 'A steep sequence of losses concentrated in the earliest steps after installation', 'The largest single drop is usually signup — the one step entirely under your control, unlike most of what follows.'),

    h2('Why is signup the biggest leak?'),
    p('Because you are asking for commitment before demonstrating anything.'),
    p('A person who installed an app thirty seconds ago has no evidence it is worth an account. Presenting a registration form as the first screen asks them to pay a cost — typing on a phone, handing over an email, choosing a password — against a benefit they have only been promised. A substantial share decline that trade, entirely reasonably.'),

    h3('Let people use it first'),
    p('The strongest fix is to defer the account until it is genuinely needed — when data must sync across devices, when something is purchased, when identity matters. A local-only first experience is possible for far more apps than build it that way, and it converts dramatically better.'),

    h3('If you must ask, ask for less'),
    p('Email and password is two fields. Name, email, password, confirm password, date of birth, phone number and a marketing checkbox is a form people abandon. Every field should justify itself against the drop it causes, and most cannot.'),

    h3('Social and platform sign-in remove typing'),
    p('Platform authentication removes the worst part of mobile signup, which is entering a password on a touch keyboard. Offering it alongside email is a meaningful uplift for a small amount of work, and on iOS offering Apple\'s option is a store requirement when you offer others.'),

    h3('Never ask for permissions during signup'),
    p('Notification and location prompts stacked onto the registration flow are a series of decisions before any value has been delivered, and each is declined at a higher rate than it would be later. [Ask for notifications at the moment of relevance](/blog/push-notifications-reliability), not on the way in.'),

    h2('What has to happen in the first session?'),
    p('The user has to experience the thing the app is for, once.'),
    p('Every product has a moment where the value becomes obvious — a first habit logged, a first message sent, a first result found. Retention is largely determined by whether that moment happens in session one. If it does, the second open is likely; if it does not, no amount of later prompting reliably recovers it.'),

    h3('Identify your one moment and measure it'),
    p('Name the single action that means somebody understood the app, and track the proportion of new users who reach it in their first session. That number is the most predictive one you have, and improving it moves everything downstream.'),

    h3('Remove everything between install and that moment'),
    p('Onboarding carousels, feature tours, preference questionnaires and promotional interstitials all sit between the user and the point. Each one is defensible individually and collectively they are the reason nobody gets there.'),

    h3('Seed the empty state'),
    p('An app that opens to nothing asks the user to do the work of imagining what it would be like full. Sample data, a pre-filled example, or a single suggested first item gives them something to react to, which is far easier than creating from nothing.'),

    h3('Teach by doing, not by explaining'),
    p('A three-screen tour is forgotten before it ends. A single contextual hint at the moment an interaction is first available teaches the same thing and is actually retained, because it arrives when it is relevant.'),
    img('first-value', 'A short path from opening an application to experiencing what it is for', 'Name the one action that means somebody understood the app. Whether it happens in session one predicts almost everything after.'),

    h2('What makes people come back?'),
    p('A reason that exists independently of you reminding them.'),
    p('Retention tactics get discussed as things you do to users — notifications, streaks, badges. The apps that actually retain have a reason to return built into what they are: new content, a scheduled use, an ongoing task, other people. Where that reason is genuinely absent, tactics are decoration on a product problem.'),

    h3('Scheduled use is the strongest pattern'),
    p('An app used at a particular time — morning, after exercise, end of day — attaches to an existing routine rather than competing for attention. Pulse works this way: a habit tracker is opened because the habit happens, and the app is a step in something the person already does.'),

    h3('Accumulated value compounds'),
    p('An app holding a month of somebody\'s data is harder to abandon than one holding nothing, because leaving means losing something. That is not a trick — it is the natural consequence of the app being genuinely useful, and it is why the first week matters so much.'),

    h3('Other people are the strongest hook and the hardest to build'),
    p('Anything where somebody else is waiting — a message, a shared list, a turn — creates a return reason you do not have to manufacture. It also requires a critical mass that most apps never reach, so it is not available as a retrofit.'),

    h3('Streaks work and they cut both ways'),
    p('A visible streak is a genuine motivator and a broken one is a reason to stop entirely. Forgiveness mechanics — a skip, a pause, a repair — keep a missed day from ending the relationship, and they are what separates a streak that retains from one that churns.'),

    img('return-reasons', 'Reasons to reopen that arise from the product itself rather than from prompting', 'Scheduled use attaches to a routine instead of competing for attention. Where no reason exists, tactics are decoration on a product problem.'),

    h2('How much does performance matter here?'),
    p('More than the retention literature suggests, because it gates everything else.'),
    p('An app that takes four seconds to become usable is spending the user\'s patience before delivering anything. On a first session, where there is no accumulated goodwill, that is a direct cause of abandonment — and it is measured as a retention problem when it is really a launch problem.'),

    h3('Cold start is the number to watch'),
    p('Pulse opens in under half a second because it reads from a local database rather than waiting on a request. That is an architectural choice — [offline-first pays for itself here](/blog/react-native-offline-first) — and it means the app is usable before a slower one has finished its splash screen.'),

    h3('Never show a loading screen for the user\'s own data'),
    p('Data somebody already created should be visible immediately. Asking a server for permission to display it introduces a wait for no benefit, and it is the most common unnecessary delay in mobile apps.'),

    h3('Interaction quality reads as quality'),
    p('An app whose gestures lag feels cheap in a way people cannot articulate, and cheap-feeling apps get deleted during storage cleanups. [Keeping interactions at 60fps](/blog/react-native-gesture-performance) is retention work as much as it is craft.'),
    img('cold-start', 'An application becoming usable immediately rather than after a visible waiting period', 'Four seconds to usable spends patience before delivering anything. On a first session there is no goodwill to spend.'),

    h2('What about notifications?'),
    p('They are a retention amplifier and a retention risk, in roughly equal measure.'),
    p('A well-timed, relevant notification brings somebody back to something they wanted. A stream of generic ones trains them to dismiss without reading, then to disable, then to delete. The second pattern is more common, and it is usually driven by a target for sends rather than by anything the user needed.'),

    h3('They cannot create a reason that does not exist'),
    p('If the app has nothing new for a user, notifying them does not change that — it just reminds them the app is not useful. Products reaching for notifications to fix retention are usually treating a symptom.'),

    h3('The best ones are things the user asked for'),
    p('A reminder somebody set themselves has a completely different reception from a message you decided to send. Making reminders easy to configure converts a push channel into a service, and it dramatically reduces the opt-out rate.'),

    h3('Watch the permission rate as the ceiling'),
    p('Every user who disables notifications is permanently out of that channel, and the decision is very rarely reversed. Treating enabled-notification share as a resource to preserve rather than a rate to maximise is what keeps the channel useful over years.'),

    h2('How do you find out why people left?'),
    p('By asking a few of them, because the analytics cannot tell you.'),
    p('Event data shows exactly where people stopped and nothing about why. The gap between those is where the actual insight is, and closing it requires talking to humans — which almost no small team does because it feels unscalable. Ten conversations is not unscalable and it is usually decisive.'),

    h3('Ask at the uninstall moment where you can'),
    p('Android allows a response to uninstall; iOS does not. Where it is available, a single question with three options gathers more useful information than a dashboard, and the answers are usually blunter than anybody expects.'),

    h3('Interview people who stayed as well'),
    p('Understanding why the retained users retained tells you what to protect and what to build more of. It is a much easier conversation to get than an interview with somebody who left, and it is nearly as informative.'),

    h3('Watch a first session over somebody\'s shoulder'),
    p('Five people opening the app for the first time, in front of you, will surface more problems in an hour than a quarter of analytics review. The hesitations are visible and they are almost never where the team expected.'),

    h3('Read the reviews properly'),
    p('Store reviews skew negative and are still the cheapest qualitative source available. Recurring specific complaints — a crash on a device family, a confusing flow — are actionable, and they are frequently the same issues the funnel data was hinting at.'),
    img('why-they-left', 'Behavioural data paired with direct accounts of what people were trying to do', 'Analytics shows exactly where people stopped and nothing about why. Ten conversations is not unscalable and is usually decisive.'),

    img('work-order', 'A prioritised sequence with the earliest funnel steps addressed before later ones', 'Order matters. Optimising re-engagement while the first session is broken spends effort on the few who survived it.'),

    h2('What should you actually do first?'),
    p('Five things, in order, and the first two account for most of the improvement.'),
    ol([
      '**Instrument the first-session funnel** so you know which step is losing people.',
      '**Remove the account requirement** from the start, or reduce it to two fields.',
      '**Delete everything between opening and the core action** — tours, questionnaires, interstitials.',
      '**Fix cold start** so the app is usable immediately, ideally without a network call.',
      '**Give people a reason to return** that exists in the product, then support it with notifications.'],
    ),
    p('Working in this order matters, because optimising re-engagement while the first session is broken means spending effort on the small share of users who survived a problem you could have fixed.'),

    h3('Then keep watching cohorts, not averages'),
    p('The measure of whether the work landed is whether last month\'s cohort retains better than the one before it. An overall retention figure moves for reasons unrelated to anything you did — acquisition mix in particular — and is close to useless as feedback.'),

    h2('When is retention the wrong metric?'),
    p('When the product is not supposed to be used repeatedly.'),

    h3('Transactional and occasional apps'),
    p('A booking app, a ticketing app, an insurance app — people should use these when they need them and not otherwise. Judging them by daily active users produces engagement features nobody asked for and a worse product.'),

    h3('Products that succeed by finishing'),
    p('A tool that solves somebody\'s problem completely has succeeded when they stop needing it. Optimising retention there means making the product less effective, which is a genuinely bad trade dressed as a metric win.'),

    h3('When the honest answer is that it should be a website'),
    p('Poor retention sometimes means the app should not have been an app. If people use it rarely and find it through search, an install requirement is a barrier rather than a channel — [and that decision is worth revisiting](/blog/app-vs-pwa) rather than papering over.'),

    h2('What does it cost?'),
    p('A week to instrument and fix the first session, against an acquisition budget it multiplies.'),
    p('The funnel instrumentation is a day. Removing the signup wall and the onboarding sequence is a few days, mostly spent arguing rather than building. Cold start work depends on the architecture. None of it is large next to the cost of the advertising that brings people to an app that loses them in ninety seconds.'),
    p('The honest counterweight: retention work has a floor set by the product. If people genuinely do not need what the app does, a perfect first session produces a slightly slower decline rather than a healthy curve, and I have seen real effort spent optimising the funnel for a product whose actual problem was that nobody wanted it. Before investing here, check that the users who did retain are getting real value — if the retained cohort is small but genuinely engaged, this work will pay off; if nobody is engaged, the answer is upstream and harder.'),
    quote('Most retention work targets people who survived the first ninety seconds. Most of the loss happened inside them.'),

    h2('Conclusion'),
    p('The losses are concentrated at the very start, and the largest single drop is usually signup — the one step entirely under your control. Instrument five events and you can see your own version of the funnel; without that, retention work is guessing at which of several plausible problems you have.'),
    p('Let people use the app before asking for an account, and where that is impossible, reduce the form to the fields that genuinely justify the abandonment they cause. Offer platform sign-in to remove password typing, and never stack permission prompts onto the way in.'),
    p('Name the one action that means somebody understood the product, and clear everything between opening the app and reaching it — tours, questionnaires and interstitials are individually defensible and collectively the reason nobody arrives. Seed the empty state so the first screen gives something to react to.'),
    p('Treat performance as retention work: an app usable in under half a second because it reads local data rather than waiting on a request keeps people who would otherwise leave during a splash screen, and interactions that lag read as cheapness even when users cannot name it.'),
    p('Build a genuine reason to return before reaching for notifications, since a push cannot create value that is not there. Then find out why people left by asking ten of them, because analytics shows precisely where and never why. And check whether retention is even the right metric — some products succeed by being used rarely, and some by finishing the job. If you want an app built to survive its first session, [that is where I would start](/start).'),
  ),
  faqs: faq([
    ['Where do mobile apps actually lose users?',
     'Overwhelmingly in the first session, and the single largest drop is usually signup. Most retention effort targets re-engagement days later, which only reaches the minority who survived the first ninety seconds. Fixing the opening path is worth more than every re-engagement tactic combined.'],
    ['Should I require an account before people can use the app?',
     'Only if you genuinely cannot avoid it. A person who installed thirty seconds ago has no evidence the app is worth an account, so a registration wall asks for commitment before any value. A local-only first experience is possible for far more apps than build one, and converts much better.'],
    ['Do onboarding tours help retention?',
     'Usually the opposite. A three-screen carousel is forgotten before it ends and sits between the user and the point of the app. A single contextual hint at the moment an interaction first becomes available teaches the same thing and is actually remembered, because it arrives when relevant.'],
    ['Can push notifications fix poor retention?',
     'No. They amplify a reason to return that already exists and cannot create one. Notifying people about an app that has nothing new for them just reminds them it is not useful, and the resulting opt-outs permanently remove them from the only channel you had.'],
    ['Is retention always the right thing to optimise?',
     'No. Booking, ticketing and insurance apps should be used when needed and not otherwise, and a tool that fully solves someone’s problem has succeeded when they stop opening it. Persistently poor retention can also mean the product should have been a website rather than an app.'],
  ]),
};
