import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/react-native-deep-linking/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-react-native-deep-linking',
  slug: 'react-native-deep-linking',
  title: 'Deep Linking That Works From a Cold Start',
  category: 'mobile',
  order: 109,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-11',
  series: 'React Native in production',
  excerpt:
    'A link that opens the right screen when the app is already running, and the home screen when it is not, is the standard half-finished implementation.',
  coverLabel: 'Deep linking — cover',
  body: body(
    p('Deep linking is one of those features that looks finished long before it is. A developer tests a link with the app already open, the correct screen appears, and the ticket closes. In real use most links are opened by people whose app is not running — from a notification, an email, a message — and that is the path nobody tested.'),
    p('The symptom is familiar from the user side. You tap a link about a specific thing, the app launches, and you land on the home screen with no indication of what you were trying to reach. The link technically worked and the intent was lost, which for the person tapping is the same as it not working.'),
    p('This post covers the three states a link can arrive in, how to set up verified links rather than custom schemes, and the specific things that break — including the ones that only break in production.'),

    h2('Why is cold start the hard case?'),
    p('Because the app has to finish becoming an app before it can navigate anywhere.'),
    p('When the app is already running, a link arrives as an event and the navigation stack exists to receive it. When the app is not running, the link arrives as part of launch — before the JavaScript has loaded, before the navigator has mounted, and often before you know whether the user is even logged in. Navigating at that moment does nothing, silently.'),
    table('The three arrival states', [
      ['State', 'How it arrives', 'What usually breaks'],
      ['Foreground', 'An event', 'Rarely anything'],
      ['Background', 'An event on resume', 'Occasionally the stack is stale'],
      ['Not running', 'Part of launch', 'Navigator not mounted yet'],
    ]),
    p('The bottom row is the majority of real usage and the one that gets tested last. Anything you build should be tested by force-quitting the app first, because that is how most links are actually opened.'),

    h3('Hold the intent, do not fire it'),
    p('The pattern that works is capturing the incoming URL, storing it, and acting on it once the app declares itself ready — navigator mounted, session resolved, initial data loaded. Attempting to navigate immediately and hoping the stack exists is the underlying cause of most cold-start failures.'),

    h3('Authentication is part of readiness'),
    p('A link to a screen requiring a session cannot resolve before you know whether there is one. Holding the intent through the auth check and applying it afterwards — including after a login the link itself triggered — is what makes shared links work for logged-out users.'),
    img('three-states', 'One incoming link handled through three different application lifecycle conditions', 'Cold start is the majority of real usage and the last thing tested. Force-quit the app before testing any link.'),

    h2('What kind of links should you use?'),
    p('Verified https links — Universal Links on iOS, App Links on Android — not a custom scheme.'),
    p('A custom scheme like `myapp://` is easy to set up and has two serious problems. It does nothing if the app is not installed, so a link in an email is a dead end for anybody who has not installed yet. And any other app can claim the same scheme, which is a genuine hijacking risk for anything carrying a token.'),
    table('Two linking mechanisms', [
      ['', 'Custom scheme', 'Verified https link'],
      ['Setup', 'Trivial', 'Requires a file on your domain'],
      ['App not installed', 'Fails', 'Opens the web page'],
      ['Can be claimed by others', 'Yes', 'No — domain-verified'],
      ['Works from email and messages', 'Unreliably', 'Yes'],
      ['Good for', 'Internal use, OAuth callbacks', 'Everything user-facing'],
    ]),
    p('The second row is the one that matters commercially. A verified link opens the app for people who have it and the website for people who do not, which means one URL works for your whole audience instead of only the installed portion.'),

    h3('The association files are the whole setup'),
    p('iOS looks for `apple-app-site-association` and Android for `assetlinks.json`, both served from a well-known path on your domain over HTTPS with no redirects. Getting these right is most of the work, and getting them slightly wrong fails silently.'),

    code('json', `
// https://example.com/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.app",
    "sha256_cert_fingerprints": ["AB:CD:..."]
  }
}]
`),

    h3('Use the production signing fingerprint'),
    p('The certificate fingerprint in the Android file must match the key the released app is signed with. If the store re-signs your app — which is normal with app signing enabled — the fingerprint is the store\'s, not your upload key, and using the wrong one is why links work in a local build and not in production.'),

    h3('Cache behaviour makes this slow to debug'),
    p('Both platforms fetch and cache the association file at install time, so a corrected file may not take effect until reinstall. That delay makes this feel intermittent and is the main reason it consumes an afternoon rather than an hour.'),

    h2('How should the routes be defined?'),
    p('As a declarative map from URL patterns to screens, matching your website\'s structure.'),
    p('The link configuration should mirror the real web URLs, so `/products/123` opens the product screen with that id and also works as a web page. Inventing app-only paths means maintaining two mental models of the same content and guarantees they drift.'),

    code('ts', `
const linking = {
  prefixes: ['https://example.com', 'example://'],
  config: {
    screens: {
      Product: 'products/:id',
      Order:   'orders/:id',
      Profile: 'u/:username',
      NotFound: '*',
    },
  },
  // Cold start: the URL that launched the app.
  async getInitialURL() {
    const fromNotification = await getNotificationLaunchUrl();
    return fromNotification ?? (await Linking.getInitialURL());
  },
};
`),

    h3('Always define a catch-all'),
    p('A URL that matches no route should land somewhere sensible with an explanation, not nowhere. Links get shared long after content is removed, and a wildcard route handling that gracefully is a few lines against a dead end.'),

    h3('Give every deep-linked screen a back destination'),
    p('Arriving directly at a product page from a cold start leaves no history, so the back gesture exits the app. Constructing a sensible stack — the list beneath the detail — means the user can continue rather than being ejected.'),

    h3('Validate the parameters'),
    p('A URL is user input and can contain anything. An id that is not a number, a username with unexpected characters, a truncated link — each needs to fail into the not-found route rather than into a crash, and parsing with a schema is [the same discipline as any boundary](/blog/zod).'),

    h3('Keep the mapping in one file'),
    p('Route patterns tend to accumulate in several places once notifications, share sheets and marketing links all need to produce URLs. Keeping one module that both parses incoming links and constructs outgoing ones means a path can only be defined once, and a change to a URL structure cannot leave half the app pointing at the old shape.'),
    img('route-map', 'URL patterns mapped declaratively onto application screens mirroring a website structure', 'Mirror the real web URLs. App-only paths mean two mental models of the same content, and they drift.'),

    h2('How do notifications fit in?'),
    p('A notification tap is a deep link, and it should go through exactly the same path.'),
    p('The temptation is to handle notification taps separately, because the payload arrives through a different API. That produces two navigation implementations that drift, and typically only one of them handles cold start correctly. Putting a URL in the notification payload and routing it through the same handler keeps one code path.'),

    h3('Cold start from a notification is its own case'),
    p('When the app was terminated, the tapped notification arrives as launch data rather than as an event, which is a different API from the one that fires when the app is running. Both need handling, and the launch case is the one that ships broken.'),

    h3('Version-guard the target'),
    p('A notification linking to a screen that only exists in a newer build reaches devices running older ones. Falling back to a sensible destination rather than crashing is what stops a campaign becoming a crash spike — [and storing the app version alongside the push token](/blog/push-notifications-reliability) lets you avoid sending it at all.'),

    h3('Never put credentials in a link payload'),
    p('A notification or link carrying a session token can be read by anything with access to it in transit through the OS. Send an identifier and let the app fetch what it needs with its existing credentials — [which belong in secure storage](/blog/mobile-token-storage), not in a URL.'),
    img('one-path', 'Notification taps and external links converging on a single navigation handler', 'A notification tap is a deep link. Two implementations drift, and only one of them ever handles cold start correctly.'),

    h2('What about links to content that needs a login?'),
    p('Capture the intent, authenticate, then continue — never discard it.'),
    p('Somebody taps a link to a shared document, the app opens, they are not logged in, and they get the login screen. After logging in they should land on the document. Landing on the home screen instead means the link failed for them even though every individual step worked.'),

    h3('Store the pending route through the auth flow'),
    p('The intent has to survive the login screen, an account creation flow, an email verification round trip and possibly an app restart. Persisting it rather than holding it in component state is what makes that reliable.'),

    h3('Do not lose the link if they sign up instead'),
    p('A recipient without an account will often register rather than log in, which is a longer flow with more places for a stored intent to be dropped. Testing that specific path — link, register, verify, arrive — is worth doing deliberately, because it is the journey new users take and the one most likely to lose them.'),

    h3('Handle the wrong-account case'),
    p('A link to content belonging to a different account than the one signed in should say so and offer to switch, rather than showing a permission error that reads as a bug. This happens more than expected on shared devices.'),

    h3('Decide what unauthenticated users see'),
    p('For shareable content, a public preview with a prompt to sign in converts far better than a bare login wall. That is a product decision the linking implementation has to support, so it is worth making before building rather than after.'),

    img('pending-intent', 'A destination preserved across an authentication detour and applied afterwards', 'The intent has to survive login, account creation, verification and possibly a restart. Persist it rather than holding it in state.'),

    h2('What breaks in production but not in development?'),
    p('Four things, and they are the reason this feature is deceptively expensive.'),

    h3('The signing certificate mismatch'),
    p('Already mentioned and worth repeating, because it is the most common production-only failure. Local builds are signed with your debug key and store builds are not, so verification succeeds in development and fails on the release.'),

    h3('Association files behind redirects or auth'),
    p('The file must be served over HTTPS with no redirect and no authentication, at the exact path. A hosting setup that redirects to a canonical domain, or serves the file with the wrong content type, breaks verification silently.'),

    h3('Links wrapped by other services'),
    p('Email marketing tools and link shorteners rewrite URLs for tracking, and the rewritten domain is not one your app has claimed. The link then opens a browser instead of the app, which looks like your implementation failing when it is the wrapper. Configuring the tool to use a domain you control resolves it.'),

    h3('Platform-specific interception'),
    p('Some apps open links in their own in-app browser rather than handing them to the system, which bypasses verified linking entirely. There is limited control over this and it is worth knowing so it is not diagnosed as your bug.'),
    img('production-only', 'A link path that succeeds under development signing and fails against a released build', 'The certificate fingerprint is the most common production-only failure. Local builds verify; the store-signed release does not.'),

    h2('How do you test it properly?'),
    p('On real devices, from a cold start, using the actual delivery channels.'),

    h3('Force-quit before every test'),
    p('Testing with the app in the background exercises the easy path. Swiping the app away first and then tapping the link is the case that matters, and it should be how the feature is demonstrated as done.'),

    h3('Test from the channels you will actually use'),
    p('A link tapped from Notes behaves differently from the same link in an email client, a messaging app or a social feed, because each handles URLs its own way. Testing the real channels catches wrapping and in-app-browser interception that a local test never will.'),

    h3('Use the command line for iteration'),
    p('Simulator and emulator tooling can open a URL directly, which is far quicker than sending yourself messages while iterating on route configuration.'),

    code('bash', `
# iOS simulator
xcrun simctl openurl booted "https://example.com/products/123"

# Android device or emulator
adb shell am start -W -a android.intent.action.VIEW \\
  -d "https://example.com/products/123" com.example.app
`),

    h3('Add the common links to your release checklist'),
    p('Deep links break quietly — a domain change, a hosting migration, a new signing configuration — and nothing fails at build time to tell you. Opening three representative links from a cold start before each release takes two minutes and catches a regression that would otherwise be reported by a user weeks later.'),

    h3('Test the uninstalled case'),
    p('The behaviour for somebody without the app is half the value of verified links. The URL should render a real web page that works, ideally with a prompt to open or install the app, and that page is what most recipients will see.'),

    img('testing', 'Links exercised from real delivery channels on a terminated application', 'Force-quit first, then tap. Testing with the app backgrounded exercises the easy path and proves very little.'),

    h2('What about deferred deep linking?'),
    p('Preserving the destination through an install — genuinely useful and not natively supported.'),
    p('Somebody without the app taps a link to a specific item, installs, and opens for the first time. Ideally they land on that item. Neither platform provides this directly, because the link and the install are not connected, so it requires a third-party attribution service or a fingerprinting approach with real limitations.'),

    h3('It is a marketing feature with a privacy cost'),
    p('The services that provide it work by matching a browser visit to an install, which is exactly the kind of cross-context tracking platforms have been restricting. Accuracy has fallen and the privacy declarations it requires are not trivial.'),

    h3('A simpler version often suffices'),
    p('A landing page that shows the content and offers an install, combined with a clipboard hint or a code the user enters once, gets much of the benefit without an attribution SDK. It is less seamless and considerably less to explain in a privacy declaration.'),

    h2('What does it cost?'),
    p('A day for the setup, and half of it goes on the association files.'),
    p('Route configuration, cold-start handling, the pending-intent flow through authentication and notification integration is a day of work. The association files, certificate fingerprints and the caching behaviour that makes them slow to verify account for a disproportionate share of it, and that is normal rather than a sign anything is wrong.'),
    p('The honest counterweight: deep linking only pays off if links are actually part of how people reach your app. For a product where usage starts from the home screen icon and notifications are rare, a full verified-link setup is a day spent on a path few people take, and a basic scheme for OAuth callbacks would do. Check where your traffic actually comes from before building the complete version — and if the answer is that nobody links to your app, that may be worth more attention than the linking itself.'),
    quote('A link that opens the right screen when the app is running and the home screen when it is not has failed in the case that describes most real usage.'),

    h2('Conclusion'),
    p('Three arrival states matter — foreground, background and not running — and the last is both the most common in real use and the one that ships broken. Capture the incoming URL, hold it, and act only once the navigator has mounted and the session has resolved, rather than navigating immediately and hoping the stack exists.'),
    p('Use verified https links rather than custom schemes. A custom scheme fails entirely for anybody without the app installed and can be claimed by other applications, while a verified link opens the app for people who have it and the website for everybody else — one URL for your whole audience.'),
    p('Most of the setup is the association files: correct well-known paths, HTTPS with no redirects, and the signing fingerprint that matches the released build rather than your debug key. That last one is the classic production-only failure, and platform caching of those files is why debugging them takes an afternoon.'),
    p('Mirror your web URL structure in the route config, always define a catch-all, construct a sensible back stack so a cold-start arrival does not eject the user, and validate URL parameters as the untrusted input they are. Route notification taps through the same handler rather than building a second navigation path.'),
    p('Persist the pending route through login, account creation and verification so a shared link survives authentication, and never put credentials in a link payload. Then test by force-quitting first, from the channels you actually use, on real devices — and check that linking is genuinely how people reach your app before building the full version. If you want this done so it works on the path most people take, [that is the level of detail I plan for](/services).'),
  ),
  faqs: faq([
    ['Why does my deep link open the home screen instead of the right page?',
     'Almost always the cold-start path. When the app is not running the URL arrives as launch data before the navigator has mounted, so an immediate navigation call does nothing. Capture the URL, hold it, and apply it once the navigator is mounted and the session has resolved.'],
    ['Should I use a custom scheme or a verified https link?',
     'Verified https links — Universal Links on iOS, App Links on Android — for anything user-facing. A custom scheme does nothing for people who have not installed the app and can be claimed by other applications, which is a real hijacking risk for links carrying anything sensitive.'],
    ['Why do my links work in development but not in production?',
     'Usually the signing certificate fingerprint in assetlinks.json. Local builds use your debug key while the store re-signs the release with its own, so verification passes locally and fails on the published app. Platform caching of the association file makes this slow to confirm.'],
    ['Should notification taps use the same code as deep links?',
     'Yes. Handling them separately produces two navigation implementations that drift, and typically only one handles cold start correctly. Put a URL in the notification payload and route it through the same handler — but note the terminated-app case arrives via a different API.'],
    ['What happens if the link needs a login?',
     'Persist the pending route so it survives the login screen, account creation, email verification and possibly an app restart, then continue to it afterwards. Landing on the home screen after login means the link failed for that user even though every individual step worked correctly.'],
  ]),
};
