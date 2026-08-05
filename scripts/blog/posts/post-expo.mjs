import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/expo-in-production/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-expo-in-production',
  slug: 'expo-in-production',
  title: 'Expo in Production: What It Solves and What It Does Not',
  category: 'mobile',
  order: 102,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-26',
  series: 'React Native in production',
  excerpt:
    'Expo is no longer the beginner option you outgrow. Here is what it actually removes from a React Native project, and where it still bites.',
  coverLabel: 'Expo in production — cover',
  body: body(
    p('There is an old piece of advice that Expo is fine for prototypes and you will eject when the app gets serious. That advice is out of date, and following it now means opting into a large amount of native toolchain work in exchange for capabilities you already had.'),
    p('Pulse shipped to both stores on Expo in seven weeks, and none of that time went on Xcode configuration, Gradle versions or provisioning profiles. That is not because the app was simple — it was offline-first with heavy gesture work — but because the build and release machinery was somebody else\'s problem.'),
    p('This post covers what Expo genuinely removes, where the remaining friction is, and the decisions worth making early so the convenient path stays available.'),

    h2('What does Expo actually give you?'),
    p('A managed build pipeline, over-the-air updates, and a large set of vetted native modules you do not have to wire up.'),
    p('The core value is that the native projects are generated from configuration rather than maintained by hand. You describe what the app needs — permissions, icons, splash screen, native dependencies — and the build service produces signed binaries for both platforms. The two directories that cause most React Native pain simply do not exist in your repository.'),
    table('What Expo replaces', [
      ['Task', 'Bare React Native', 'With Expo'],
      ['Native project files', 'Committed and maintained', 'Generated from config'],
      ['Building for iOS', 'Xcode, locally, on a Mac', 'Cloud build'],
      ['Signing and provisioning', 'Manual, error-prone', 'Managed for you'],
      ['Store submission', 'Manual upload', 'One command'],
      ['JavaScript-only fixes', 'Full store release', 'Over-the-air update'],
      ['Native modules', 'Link and configure', 'Config plugin'],
    ]),
    p('The fifth row is worth pausing on, because it changes how a team operates. Being able to ship a JavaScript fix in minutes rather than waiting on review is the difference between a bug being an incident and a bug being a task.'),

    h3('You do not have to choose managed or bare any more'),
    p('The old distinction — managed workflow versus ejecting — has been replaced by continuous native generation, where native directories are produced on demand and any custom native code lives in a config plugin. You can add arbitrary native functionality without abandoning the tooling, which was the entire reason people used to eject.'),

    h3('The build service is the part you cannot easily replicate'),
    p('Building iOS binaries requires a Mac, correct certificates and a specific toolchain version. A hosted build service removes all of that, and for a team without dedicated mobile infrastructure it is the single largest saving — [the same argument as any managed piece of the stack](/blog/cloudflare-pages-vs-vercel).'),
    img('generated-natives', 'Platform projects produced from a configuration file rather than maintained alongside application code', 'The two directories that cause most React Native pain simply do not exist in the repository.'),

    h2('How do over-the-air updates work?'),
    p('The JavaScript bundle is downloaded and swapped at launch, so a fix reaches users without a store release.'),
    p('An update publishes a new bundle to a channel. Apps configured to that channel fetch it on launch, apply it on the next start, and from then on run the new code. Native code cannot change this way — anything requiring a different binary still needs a store build — but the majority of bug fixes are JavaScript.'),

    h3('Set the fetch policy deliberately'),
    p('Checking for an update on every launch and applying on next start is the sensible default. Downloading and applying immediately produces a jarring reload mid-session, and never checking makes the feature pointless. The middle option is almost always right.'),
    code('json', `
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 3000
    },
    "runtimeVersion": { "policy": "appVersion" }
  }
}
`),

    h3('The runtime version is what keeps it safe'),
    p('An update is only delivered to builds with a compatible runtime version, which prevents a bundle expecting a new native module from reaching a binary that lacks it. Getting this wrong crashes the app on launch for everybody who receives it, so it is worth understanding rather than accepting the default blindly.'),

    h3('Use channels and roll out gradually'),
    p('Separate channels for internal, beta and production, and a staged rollout for anything non-trivial. An over-the-air update reaches users faster than a store release, which means a bad one reaches them faster too — the speed cuts both ways and a rollback plan is the counterweight.'),

    h3('Stores permit it within limits'),
    p('Both platforms allow updating JavaScript, provided you are not fundamentally changing what the app does or bypassing review to introduce different functionality. Bug fixes and improvements are fine; shipping an entirely different product is not, and treating the mechanism as a way around review is how apps get removed.'),

    h2('Where does Expo still bite?'),
    p('Four places, and none of them are dealbreakers if you know about them in advance.'),

    h3('Some native SDKs have no plugin'),
    p('A payment provider, an analytics vendor or a hardware SDK without a config plugin means writing one. That is a real piece of work requiring native knowledge, and it is the most common reason a project stalls. Checking your required integrations for plugin support before committing takes twenty minutes and avoids the surprise.'),

    h3('Build minutes cost money at volume'),
    p('The hosted build service is metered, and a team pushing many builds a day will pay for it or wait in a queue. Building locally is possible and reintroduces the toolchain requirement you were avoiding, so this is a genuine trade rather than a free lunch.'),

    h3('SDK upgrades are periodic work'),
    p('Expo releases align with React Native versions, and staying current means an upgrade every few months. They are usually straightforward and they are not optional, because falling several versions behind makes the next upgrade considerably worse.'),

    h3('The abstraction hides things you occasionally need'),
    p('When a build fails on the service, the error surfaces at a distance from the configuration that caused it, and the mapping between a line in the config file and a Gradle or Xcode failure is not always obvious. This is a fair price for not maintaining those files, and it does mean the first difficult build failure takes longer to resolve than it would in a project you own outright.'),

    h3('Debugging generated native code is awkward'),
    p('When something goes wrong at the native layer, the project you are debugging was generated rather than written, which adds a step to understanding it. It happens rarely and it is disorienting the first time.'),
    img('friction-points', 'A small set of remaining obstacles concentrated around unsupported native dependencies', 'Check your required native SDKs for config-plugin support before committing. That check is twenty minutes and prevents the usual stall.'),

    h3('Keep a manual switch for disabling updates'),
    p('A remote flag that stops the app fetching updates is worth having before you need it. If a bad bundle reaches production and the app crashes on launch, the update mechanism is exactly what you cannot use to fix it — the app has to start in order to fetch anything. Publishing a known-good bundle to the same channel is the actual recovery, and knowing that in advance is better than learning it during an outage.'),
    img('ota-flow', 'A revised bundle reaching installed applications without passing through a release process', 'A JavaScript fix in minutes rather than a week of review. The speed cuts both ways, which is what staged rollouts are for.'),

    h2('What should you set up on day one?'),
    p('Six things, all of which are harder to add later.'),
    ol([
      '**Environment configuration** — separate values for development, staging and production, not a commented-out constant.',
      '**Error tracking,** wired to source maps so a stack trace is readable.',
      '**Update channels** matching your environments, before the first release rather than after.',
      '**A staging build** distributed internally, so somebody tests the real binary.',
      '**Analytics on the core flows,** enough to see retention rather than everything.',
      '**A signing and credential owner** — an account the client controls, not a personal one.'],
    ),
    p('The last is the one that causes genuine problems. Store credentials tied to an individual developer\'s account become a serious obstacle the moment that person is unavailable, and it is [part of what client-owned accounts means](/stack).'),

    h3('Source maps matter more than on the web'),
    p('A minified stack trace from a released app is almost useless, and you cannot attach a debugger to a user\'s device. Uploading source maps as part of the build is a few lines of configuration and it is the difference between diagnosing a crash and guessing at it.'),

    h3('Test the real build, not the development client'),
    p('The development client behaves differently from a production binary in ways that hide real bugs — different bundling, different performance characteristics, different update behaviour. A staging build going to real devices before every release is the only reliable check.'),

    h2('How do you handle environments?'),
    p('With build profiles and typed configuration, so the wrong API URL cannot ship.'),
    p('A mobile app cannot have its environment changed after release, which makes this stricter than on the web. A build pointing at a staging server that reaches the store is not a config fix — it is a new release, a review cycle and days of users on a broken version.'),

    code('ts', `
// One place, typed, failing loudly at startup rather than at first request.
import Constants from 'expo-constants';
import { z } from 'zod';

const Env = z.object({
  apiUrl: z.string().url(),
  environment: z.enum(['development', 'staging', 'production']),
  sentryDsn: z.string().url().optional(),
});

export const env = Env.parse(Constants.expoConfig?.extra);
`),

    h3('Validate at startup, not at first use'),
    p('A missing or malformed value should fail immediately and visibly rather than producing a confusing network error twenty screens in. Parsing the configuration with a schema at launch is the same discipline as [validating anything else at a boundary](/blog/zod).'),

    h3('Make the environment visible in non-production builds'),
    p('A small badge showing "staging" on internal builds prevents the recurring confusion of somebody reporting a bug from an app they believed was production. It costs nothing and it saves a support conversation every few weeks.'),

    h3('Keep secrets out of the bundle entirely'),
    p('Anything shipped in a mobile binary is readable by anyone who wants to read it, regardless of how it is stored. API keys with real privileges belong on a server that the app calls, not in configuration the build embeds — and this catches people out because the same pattern is routine and harmless for a public analytics key.'),
    img('env-config', 'Configuration values fixed at build time rather than adjustable after release', 'A build pointing at staging that reaches the store is not a config fix. It is a new release and days of users on a broken version.'),

    h2('What about performance?'),
    p('Expo does not make an app slower, and it does not make a badly built one fast.'),
    p('There is a persistent belief that managed tooling costs performance. It does not — the output is the same React Native runtime with the same characteristics. What affects performance is how the app is written: what runs on the JavaScript thread, how lists are rendered, how much work happens during a gesture.'),

    h3('Cold start is mostly bundle size'),
    p('The JavaScript bundle has to be parsed before anything renders, so a large dependency graph directly delays launch. Pulse starts in under half a second largely because it ships very little it does not use, which is the same discipline as [keeping a web bundle small](/blog/bundle-splitting).'),

    h3('The new architecture is worth adopting'),
    p('React Native\'s newer rendering and native-module system removes much of the old bridge overhead, and Expo makes enabling it a configuration change rather than a migration project. For gesture-heavy or animation-heavy apps the difference is visible.'),

    h3('Measure on a mid-range Android device'),
    p('Testing on a recent iPhone tells you very little about how the app performs for most users. A three-year-old mid-range Android is the honest test, and the gap between the two is where a large share of real performance problems live.'),
    img('startup-budget', 'Application launch time dominated by parsing a dependency graph before anything renders', 'Cold start is mostly bundle size. Under half a second comes from shipping very little the app does not actually use.'),

    img('device-testing', 'Performance measured on a modest device rather than the newest available hardware', 'A three-year-old mid-range Android is the honest test. The gap to a recent iPhone is where most real performance problems live.'),

    h2('When should you not use Expo?'),
    p('When the app is defined by something the tooling cannot generate.'),

    h3('Heavy custom native requirements'),
    p('An app built around a proprietary hardware SDK, a custom video pipeline or extensive platform-specific code is spending most of its effort in the native layer, and the abstraction stops paying for itself.'),

    h3('An existing native app adding React Native'),
    p('Embedding React Native into an established iOS or Android application is a supported pattern and is not what this tooling is shaped around. That case belongs in the existing native project.'),

    h3('Hard constraints on where builds happen'),
    p('Some organisations require builds inside their own infrastructure for compliance reasons. Local builds are possible, and if every build must be local the main benefit is gone.'),

    h3('Genuinely, that is the list'),
    p('For everything else — which is most apps — the default should be Expo, and the burden of proof belongs with the argument for doing the native project maintenance yourself.'),

    h2('What did this look like on Pulse?'),
    p('Seven weeks to both stores, with essentially no time spent on toolchain problems.'),
    p('Expo handled the builds, the signing, the store submissions and the over-the-air updates. The work went into the offline-first data layer and the gesture performance, which is where it should go — those are the things that make the app good, and neither is helped by hand-maintaining an Xcode project.'),
    p('The over-the-air channel proved its value in the first fortnight after launch, when two small bugs were fixed and delivered the same day. On a store-only release cycle those would have been a week each, live, on a new app in its most fragile period.'),

    h3('Internal distribution mattered more than expected'),
    p('Getting a real build onto the client\'s own phone early, rather than showing a simulator, changed the feedback substantially. People notice different things holding a device than watching a screen share, and the gesture work in particular only got useful review once it was in somebody\'s hand.'),

    h3('The upgrade cadence was the main ongoing cost'),
    p('An SDK upgrade every few months, each a few hours. That is the price of the convenience and it is a fair one, provided it is expected rather than discovered.'),

    h2('What does it cost?'),
    p('A subscription at team scale, and a dependency on somebody else\'s tooling.'),
    p('The free tier covers a small project comfortably. A team building several times a day will pay for build minutes and update bandwidth, and that cost is modest against the salary of the person who would otherwise be maintaining build infrastructure.'),
    p('The honest counterweight: this is a real dependency on a single company for your ability to build and release. Pricing can change, a service can have an outage on the day you need to ship a fix, and the abstraction occasionally hides something you need to see. Local builds are the escape hatch and they are genuinely available, but they require the Mac, the toolchain and the knowledge you adopted this to avoid — so the mitigation is to have built locally at least once, deliberately, before you need to. A team that has never done it is one outage away from finding out how much it does not know.'),
    quote('The advice that you will eject once the app gets serious is out of date. Ejecting now means taking on native maintenance for capabilities you already had.'),

    h2('Conclusion'),
    p('Expo removes the parts of React Native that consume time without producing product: native project files, Xcode and Gradle configuration, signing and provisioning, and store submission. The old managed-versus-bare choice is gone — native code goes in a config plugin, and you never have to eject to add it.'),
    p('Over-the-air updates change how a team operates, turning a JavaScript bug from an incident into a task. Set the fetch policy to check on load and apply on next start, understand the runtime version because getting it wrong crashes the app for everybody who receives the update, and use channels with staged rollouts since a bad update travels as fast as a good one.'),
    p('Know the friction in advance: native SDKs without a config plugin are the usual stall, so check your integrations before committing. Build minutes are metered, SDK upgrades come every few months and are not optional, and debugging generated native code is awkward when it happens.'),
    p('Set up environment configuration validated at startup, error tracking with source maps, update channels, a staging build on real devices, and client-owned signing credentials — all on day one, because each is harder to add later and the credentials one becomes a genuine obstacle.'),
    p('Expo does not affect performance; how you write the app does, and cold start is mostly bundle size. Use it by default unless the product is defined by custom native work or every build must happen in your own infrastructure. Build locally once, deliberately, so the escape hatch is real rather than theoretical. If you want an app built on this stack, [that is what I do](/services).'),
  ),
  faqs: faq([
    ['Do I need to eject from Expo for a serious app?',
     'No — that advice is out of date. Native directories are generated on demand and custom native code lives in a config plugin, so you can add arbitrary native functionality without leaving the tooling. Ejecting now means taking on native project maintenance for capabilities you already had.'],
    ['How do over-the-air updates work, and are they allowed?',
     'A new JavaScript bundle is published to a channel, fetched on launch and applied on next start. Both stores permit it for bug fixes and improvements — what is not allowed is using it to ship substantially different functionality than what was reviewed. Native changes still need a store build.'],
    ['What is the most common reason an Expo project stalls?',
     'A required native SDK with no config plugin, which means writing one and needing native knowledge to do it. Checking your payment, analytics and hardware integrations for plugin support before committing takes about twenty minutes and avoids the surprise entirely.'],
    ['Does Expo make a React Native app slower?',
     'No. The output is the same React Native runtime with the same characteristics. Performance comes down to how the app is written — what runs on the JavaScript thread, how lists render, how much work happens during a gesture — and cold start is mostly a function of bundle size.'],
    ['What is the risk of depending on Expo?',
     'You depend on one company for building and releasing, so pricing changes and service outages are real exposure. Local builds are the escape hatch, but they need the Mac and toolchain you adopted Expo to avoid — so do a local build once deliberately, before you actually need it.'],
  ]),
};
