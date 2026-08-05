import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/app-vs-pwa/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-app-vs-pwa',
  slug: 'app-vs-pwa',
  title: 'Native App or PWA? The Decision in Practice',
  category: 'mobile',
  order: 101,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-25',
  series: 'Mobile decisions',
  excerpt:
    'Most people asking for an app need a fast mobile site. Some genuinely need the store. The question that separates them is not technical.',
  coverLabel: 'App vs PWA — cover',
  body: body(
    p('"We need an app" is one of the most common requests I get, and roughly half the time the honest answer is that a fast mobile web experience would serve the business better for a fraction of the cost. The other half genuinely need to be in the store, and it is usually obvious why within about ten minutes of asking.'),
    p('What makes this decision hard is that it gets framed technically — capabilities, performance, offline support — when the deciding factors are almost always distribution, business model and who maintains it. The technical gap between a good progressive web app and a native app has narrowed considerably. The distribution gap has not.'),
    p('So this is the practical framing: what each one genuinely gives you, what the real costs are on both sides, and the specific questions that resolve it.'),

    h2('What is the actual difference now?'),
    p('Distribution, a handful of platform capabilities, and who owns the relationship with the user.'),
    p('A progressive web app is a website that can be installed to the home screen, works offline, and receives push notifications on most platforms. A native app — or React Native, which is native from the user\'s point of view — is distributed through app stores, has full access to device capabilities, and runs as a first-class application.'),
    table('Where they actually differ', [
      ['', 'PWA', 'Native / React Native'],
      ['Distribution', 'A URL', 'App stores, with review'],
      ['Discovery', 'Search, links, ads', 'Store search plus everything else'],
      ['Install friction', 'None to visit, awkward to install', 'Store install, then one tap'],
      ['Device access', 'Camera, location, most sensors', 'Everything, including background work'],
      ['Push on iOS', 'Supported, with caveats', 'Full support'],
      ['Payments', 'Your processor, your margin', 'Store billing for digital goods'],
      ['Updates', 'Instant, you control them', 'Review, then user adoption'],
    ]),
    p('The rows that decide most projects are the first and the second-to-last. Being in a store is a distribution channel and a payment constraint at the same time, and both of those are business decisions rather than engineering ones.'),

    h3('The capability gap is smaller than the reputation'),
    p('Camera, geolocation, offline storage, push notifications, background sync to a degree — a modern PWA does all of this. The genuine remaining gaps are sustained background execution, deep hardware integration such as Bluetooth peripherals and health data, widgets, and anything requiring tight system integration.'),

    h3('The install gap is larger than the reputation'),
    p('Installing a PWA on iOS still means finding a share menu and choosing an option most people have never used. That friction is real and it is the single biggest practical disadvantage — not because installation is technically hard, but because nobody knows how.'),
    img('the-gap', 'Two delivery routes differing mainly in how they reach a device rather than in what they can do', 'The capability gap has narrowed. The distribution gap has not, and that is what usually decides the project.'),

    h2('Which questions actually resolve it?'),
    p('Six, and none of them are about features.'),
    ol([
      '**How do users find you?** If it is search and links, the web wins. If it is a store, or word of mouth naming an app, that matters.',
      '**How often will they use it?** Daily-use tools benefit from a home screen presence people trust. Occasional-use services do not.',
      '**Do you charge for digital goods?** Store billing takes a substantial share and it is mandatory for in-app digital purchases.',
      '**Do you need background work or deep hardware access?** Real-time location tracking, Bluetooth devices, health data — that is native.',
      '**Who maintains it in two years?** Store builds need signing certificates, SDK updates and periodic re-submission forever.',
      '**Does the audience expect an app?** For some categories it is a credibility signal, whatever the technical merits.'],
    ),
    p('Answer those honestly and the decision usually makes itself. In my experience the fifth is the one most often skipped and most often decisive, because a store presence is a permanent maintenance commitment that a website is not.'),

    h3('Answer them about the users you have'),
    p('These questions are easy to answer aspirationally — about the audience you intend to reach rather than the one currently using the product. Analytics already knows how people arrive, how often they return and what device they are on, and reading that before the discussion keeps the decision anchored to evidence rather than to ambition.'),

    h3('The credibility answer is legitimate'),
    p('For some audiences, not being in the store reads as not being a real product. That is not a technical argument and it is a real market fact, and treating it as irrational is a good way to lose an argument you were right about on the merits.'),

    h2('When is the web genuinely better?'),
    p('More often than the request implies, and for reasons that compound.'),

    h3('When discovery happens through search'),
    p('A store listing is not indexed the way a page is. If people find you by searching for the problem you solve rather than for your brand, the web is where they find you, and an app is a second destination you have to drive traffic to.'),

    h3('When the interaction is occasional'),
    p('Nobody installs an app to do something twice a year. Booking, one-off purchases, occasional lookups — these are web interactions, and putting them behind an install requirement loses most of the audience at the first step.'),

    h3('When you want to ship on your own schedule'),
    p('A web deploy is live in minutes. A store update is a review, then a gradual adoption curve, and for weeks afterwards you are supporting two versions. For anything iterating quickly that difference is substantial.'),

    h3('When you charge for digital goods'),
    p('Store commission on in-app digital purchases is significant and largely unavoidable. For a subscription business, moving that transaction to the web changes the unit economics materially, and it is worth modelling before committing.'),

    h3('When the content needs to be findable'),
    p('Anything you want indexed, linked to, quoted or shared has to be a page. Content locked inside an app is invisible to search, to anyone who has not installed it, and increasingly to the AI systems people now ask instead of searching. For a product whose value is partly its content, that is a decisive constraint rather than a minor one.'),

    h3('When the budget is finite'),
    p('One responsive web application serves every device. Two native platforms plus a web presence is three surfaces, and even React Native — which meaningfully reduces that — is still a store build plus a website.'),
    img('web-wins', 'A single addressable destination reached from search, links and messages without installation', 'If people find you by searching for the problem you solve, the web is where they find you. An app is a second destination.'),

    h2('When do you genuinely need an app?'),
    p('When one of a fairly short list of things is true.'),

    h3('Background execution'),
    p('Location tracking while the app is closed, continuous sensor recording, geofencing, activity recognition. The web cannot do these and the workarounds are not workarounds. This is the clearest technical case.'),

    h3('Deep hardware or platform integration'),
    p('Bluetooth peripherals, health and fitness data, HomeKit, widgets, watch apps, secure biometric flows tied to platform keychains. If the product is defined by one of these, the decision is made.'),

    h3('Reliable push as a core mechanic'),
    p('Web push exists on iOS and it comes with more caveats and lower reliability than the native equivalent. If notifications are how the product works rather than a nice addition, that difference matters — [and it is a fraught area even natively](/blog/push-notifications-reliability).'),

    h3('Store distribution is the channel'),
    p('For consumer products in categories where people browse the store, being absent from it is being absent from the market. That is a marketing fact rather than a technical one and it is decisive when it applies.'),

    h3('Daily-use tools with real retention'),
    p('An app people open every day earns its home screen icon, and the presence itself drives usage. Pulse is this shape — a habit tracker opened daily, offline, gesture-driven — and it would not work as well behind a browser tab.'),

    h2('What about React Native?'),
    p('It is the answer to "we need an app but not two of them", and it is what I build.'),
    p('React Native produces genuinely native apps for both platforms from one codebase, using the same language and much of the same reasoning as the web work around it. It is not a compromise in the way a wrapped website is — the interface is native components, the performance is native, and the store treats it as a normal app.'),

    h3('It does not remove the store overhead'),
    p('One codebase, still two store listings, two review processes, two sets of signing credentials and two platforms to test on. The saving is in development, not in distribution or maintenance, and people consistently underestimate the second.'),

    h3('Expo makes the operational part manageable'),
    p('Managed builds, over-the-air updates for JavaScript changes, and a build service that removes most of the native toolchain pain. For a small team it is the difference between shipping and fighting Xcode — [worth a post of its own](/blog/expo-in-production).'),

    h3('You still need native knowledge occasionally'),
    p('Some integrations require touching native modules, and when that happens you need someone who can. It is a smaller share of the work than it used to be and it is not zero, which is worth knowing before committing to a stack on the basis that it avoids native code entirely.'),
    img('react-native', 'A single codebase producing two store-distributed applications alongside a separate web presence', 'One codebase, still two store listings and two review processes. The saving is in development, not in distribution.'),

    h3('The web is still the acquisition layer either way'),
    p('Even for products that clearly need an app, almost nobody discovers it inside the store. They arrive from a search, a link, an advertisement or a recommendation, and that journey passes through a web page. A store-first product with a weak site is losing people before the install is ever offered, which is why the two decisions are less independent than they look.'),
    img('need-native', 'A small set of requirements that only a store-distributed application can satisfy', 'The clear cases: background execution, hardware integration, notifications as a core mechanic, and store distribution as the channel.'),

    h2('Can you do both?'),
    p('Yes, and the sensible version is a shared backend with two front ends rather than one codebase rendering everywhere.'),
    p('A web application and a mobile app talking to the same API is a normal architecture and usually the right one. The temptation to share the interface layer as well — running React Native for Web, or wrapping the site in a shell — produces something that is slightly wrong on every platform.'),

    h3('Share the API, the types and the validation'),
    p('This is where the genuine reuse is. One schema, one set of validation rules, one authorisation model, consumed by both clients. That removes the class of bug where web and mobile disagree about what a valid input is — [which is what a shared contract is for](/blog/shared-api-web-mobile).'),

    h3('Do not share the interface'),
    p('Mobile navigation patterns, gesture expectations and layout conventions differ from web ones for good reasons. A shared component layer tends to converge on the lowest common denominator and satisfies neither audience.'),

    h3('Start with the web unless you know otherwise'),
    p('If you are unsure, building the web version first gives you an audience, real usage data and a working backend. Adding an app afterwards to a validated product is a straightforward project; building both simultaneously for an unvalidated one is how budgets disappear.'),

    img('shared-backend', 'Two separate front ends drawing on one shared contract and data layer', 'Share the API, the types and the validation. Sharing the interface layer converges on a lowest common denominator that satisfies neither.'),

    h2('What does a wrapped website cost you?'),
    p('The store overhead of an app and the experience of a website, which is the worst arrangement available.'),
    p('Putting a web view in a native shell is superficially attractive — one codebase, store presence, quick to build. What you ship is an app that feels like a website: browser scroll physics, no native transitions, a visible loading state on launch, and gestures that behave slightly wrong.'),

    h3('Reviewers are unsympathetic'),
    p('App stores have explicit guidance about apps that are simply a website in a container, and rejections on those grounds are common. If the app offers nothing beyond what the site does, it is at genuine risk — [one of the more predictable rejection reasons](/blog/app-store-rejections).'),

    h3('Users notice, even if they cannot name it'),
    p('The feedback is rarely "this is a web view". It is that the app feels slow or cheap, which is harder to act on and just as damaging to retention.'),

    h3('The exception is a genuinely hybrid product'),
    p('Native shell, native navigation, and specific screens rendered as web content that changes frequently — a help centre, a terms page, a rapidly iterating catalogue. That is a deliberate architecture rather than a shortcut, and it works.'),

    h2('What does each cost to build and run?'),
    p('The build difference is real and the running difference is larger.'),
    table('Cost shape over two years', [
      ['', 'PWA', 'React Native'],
      ['Initial build', 'One surface', '~40–60% more'],
      ['Store submission', 'None', 'Two, plus review cycles'],
      ['Updates', 'Deploy', 'Build, review, adopt'],
      ['Certificates and provisioning', 'None', 'Renewed, forever'],
      ['SDK and OS updates', 'Browser handles it', 'Yearly, mandatory'],
      ['Supporting old versions', 'No', 'Yes — users do not update'],
    ]),
    p('The bottom three rows are the ongoing tax people forget. An app that is finished still needs attention every year, because the platforms move and a build that stops meeting their requirements gets removed.'),

    h3('Version fragmentation is a real support cost'),
    p('A meaningful share of users will be on a build several months old, so the API has to keep working for them and bugs have to be diagnosed against versions you no longer run. The web simply does not have this problem.'),

    h3('Budget for the store presence itself'),
    p('Screenshots for several device sizes, a description, keywords, a privacy policy, data-handling disclosures and a support URL are all required before the first submission, and they need revisiting whenever the app changes materially. It is not development work and it is several days of somebody\'s time that never appears in an estimate.'),
    img('ongoing-tax', 'Recurring obligations continuing long after a build is considered finished', 'A finished app still needs attention yearly. Certificates expire, platform requirements move, and a non-compliant build gets removed.'),

    h2('What do I usually recommend?'),
    p('A fast, installable mobile web experience for most projects, and React Native when the answers point clearly at the store.'),
    p('The default recommendation is an excellent mobile web build — properly fast, installable, working offline where that helps. It reaches everyone, ships continuously, costs less, and for a large share of the businesses that ask me for an app it is what they actually needed.'),
    p('When background work, hardware access, store distribution or daily-use retention genuinely apply, React Native is the efficient way to get there, and Expo makes the operational side manageable for a small team.'),
    p('The honest counterweight: I build both, and recommending the web version means a smaller project. But an app nobody installs is worth less than a site people use, and the failure mode of this decision is not a slightly suboptimal technology — it is a six-figure build sitting at two hundred downloads while the mobile site it replaced was serving thousands. That outcome is common enough that the question deserves ten honest minutes before anybody writes a line of code.'),
    quote('Roughly half the people asking for an app need a fast mobile site. The question that separates them is about distribution and maintenance, not capabilities.'),

    h2('Conclusion'),
    p('The capability gap between a good PWA and a native app has narrowed to background execution, deep hardware access, widgets and reliable push. The distribution gap has not narrowed at all, and that — plus store billing on digital goods and the permanent maintenance commitment — is what actually decides the project.'),
    p('Resolve it with six questions: how users find you, how often they use it, whether you sell digital goods, whether you need background or hardware access, who maintains the store builds in two years, and whether your audience treats an app as a credibility signal. That last one is a legitimate market fact rather than an irrational preference.'),
    p('Choose the web when discovery happens through search, when the interaction is occasional, when you want to deploy on your own schedule, when store commission would change your unit economics, or when the budget only stretches to one surface done well.'),
    p('Choose an app when you need background execution, deep platform integration, notifications as a core mechanic, store distribution as your channel, or when it is a daily-use tool that earns its home screen icon. React Native is the efficient route there — but it saves development time, not distribution or maintenance overhead, and people underestimate the second consistently.'),
    p('Avoid the wrapped website: it carries the full store overhead and delivers a web experience, reviewers are explicitly unsympathetic to it, and users notice without being able to name why. If both make sense eventually, share the API, types and validation and keep the interfaces separate — and build the web version first unless you already know otherwise. If you want a straight answer for your particular case, [that is a ten-minute conversation](/start).'),
  ),
  faqs: faq([
    ['Can a PWA do everything a native app can?',
     'Nearly, but not quite. Camera, location, offline storage and push are all available. The genuine gaps are sustained background execution, deep hardware integration like Bluetooth peripherals and health data, widgets, and anything needing tight system integration. For most products those never come up.'],
    ['Why does the choice usually come down to distribution?',
     'Because a store listing is a channel, a payment constraint and a permanent maintenance commitment all at once, while a URL is none of those. If your users find you by searching for the problem you solve, the web is where they are, and an app becomes a second destination you must drive traffic to.'],
    ['Does React Native remove the cost of building two apps?',
     'It removes most of the duplicated development, not the distribution or maintenance. You still have two store listings, two review processes, two sets of signing credentials, yearly SDK updates and users running builds from six months ago. That ongoing overhead is what people underestimate.'],
    ['Is wrapping my website in an app a reasonable shortcut?',
     'No. You take on the full store overhead while delivering a web experience — browser scroll physics, no native transitions, gestures that feel slightly wrong. Stores explicitly discourage it and reject on those grounds, and users report it as the app feeling slow or cheap.'],
    ['Should I build the web version or the app first?',
     'The web version, unless you already know you need background work, hardware access or store distribution. It gives you an audience, real usage data and a working backend, and adding an app to a validated product afterwards is a straightforward project rather than a gamble.'],
  ]),
};
