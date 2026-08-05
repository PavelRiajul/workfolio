import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/shared-api-web-mobile/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-shared-api-web-mobile',
  slug: 'shared-api-web-mobile',
  title: 'One API, Two Clients: Sharing Between Web and Mobile',
  category: 'mobile',
  order: 105,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-29',
  series: 'Mobile decisions',
  excerpt:
    'Share the contract, the types and the validation. Share the interface layer and you get something slightly wrong on both platforms.',
  coverLabel: 'Shared API — cover',
  body: body(
    p('When a product has a website and a mobile app, the question of what to share between them gets answered badly in one of two directions. Either nothing is shared, and the two clients slowly develop different opinions about what a valid order looks like, or everything is shared, and you ship a mobile app that navigates like a website.'),
    p('The line that works is specific: share the contract and everything derived from it — types, validation, error shapes, the client that speaks to the server. Do not share the interface. That boundary gives you the correctness benefits of a single source of truth without pretending two very different platforms want the same navigation.'),
    p('This post is about where exactly to draw that line, how to structure a repository so it holds, and the mobile-specific constraints that make a naive shared API painful.'),

    h2('What is actually worth sharing?'),
    p('The parts where disagreement between clients is a bug rather than a design choice.'),
    p('If the web thinks a phone number is optional and the app requires it, that is not two products serving two audiences — it is one product with an inconsistency that will produce a support ticket. Anything in that category belongs in shared code, because the whole point is that there is only one answer.'),
    table('Where the line falls', [
      ['Layer', 'Share it?'],
      ['Database schema and server logic', 'Yes — one server'],
      ['API contract and types', 'Yes — generated from one source'],
      ['Validation rules', 'Yes — same schema both sides'],
      ['Error codes and shapes', 'Yes'],
      ['Domain logic (pricing, permissions)', 'Yes, where it runs on the client at all'],
      ['Data fetching and caching', 'Mostly — the same library, different config'],
      ['Design tokens', 'Yes — values, not components'],
      ['UI components', 'No'],
      ['Navigation', 'No'],
    ]),
    p('The bottom two rows are where projects go wrong, and they go wrong for a good reason: sharing them looks like the natural extension of everything above. It is not, because everything above is about correctness and those two are about how a platform feels.'),

    h3('Validation is the highest-value share'),
    p('One schema, used by the server to validate requests, by the web form to validate input, and by the mobile form to do the same, means the three cannot disagree. The alternative is three implementations of the same rules where two are subtly out of date — [which is what schema-first validation prevents](/blog/zod).'),

    h3('Types are what stop silent breakage'),
    p('When the API response type is generated from the server and consumed by both clients, removing a field breaks the build in both places immediately. Without that, it breaks at runtime, on a user\'s phone, in a build you shipped three weeks ago and cannot recall.'),
    img('the-line', 'Correctness concerns shared across clients while presentation concerns remain separate', 'Share what would be a bug if the clients disagreed. Keep what is a legitimate platform difference apart.'),

    h2('How should the repository be structured?'),
    p('A monorepo with a few small packages, not one large shared package.'),
    p('The arrangement that works is a workspace containing the server, the web client, the mobile client, and two or three genuinely shared packages. Keeping the shared packages small and purposeful matters more than the tooling — a single `shared` package accumulates everything and becomes a dependency both clients drag around for no reason.'),

    code('txt', `
apps/
  server/          # API, database, jobs
  web/             # Next.js or Astro
  mobile/          # Expo / React Native
packages/
  contracts/       # Schemas, request and response types, error codes
  api-client/      # Typed client built on contracts, platform-agnostic
  tokens/          # Colour, spacing and type values — not components
`),

    h3('Contracts is the important one'),
    p('It should contain schemas and types and nothing else — no React, no platform APIs, no fetch. That keeps it importable everywhere including the server, and it means changing it is a deliberate act rather than a side effect of touching a component.'),

    h3('The API client should be transport-only'),
    p('A typed client that knows the endpoints, applies auth headers and parses responses, with no opinion about caching or state. Both platforms then wrap it in their own query layer, which is where the platform differences actually live.'),

    h3('Tokens travel, components do not'),
    p('Sharing the colour values, spacing scale and type scale gives visual consistency at zero cost. Sharing a `Button` component means one implementation trying to satisfy CSS and React Native styling at once, and it will be mediocre at both.'),

    h3('Watch what mobile ends up bundling'),
    p('A shared package importing a server-only dependency, or a large date library, ends up in the mobile bundle and directly delays cold start. Keeping shared packages dependency-light is a mobile performance concern as much as a hygiene one — [bundle size is cold start](/blog/expo-in-production).'),

    img('repo-shape', 'A workspace with two applications drawing on a small number of narrow shared packages', 'Small purposeful packages beat one large shared one. A package called "shared" accumulates everything both clients then carry.'),

    h2('Should the API be REST or GraphQL?'),
    p('It matters less than whether the types are generated, but the mobile constraints do point one way.'),
    p('The genuine mobile pressure is over-fetching. A REST endpoint returning a full object graph so the web dashboard can render everything is sending a large payload to a phone that needs four fields of it, over a connection that may be slow and metered. GraphQL solves that directly by letting the client ask for what it needs.'),

    h3('REST with purpose-built endpoints works fine'),
    p('The pragmatic alternative is a REST API with endpoints shaped for the views that exist — a compact list endpoint and a fuller detail endpoint rather than one generic resource. This is less elegant and entirely workable, and it keeps [the caching story simple](/blog/rest-api-design).'),

    h3('GraphQL costs more on the client'),
    p('The client library is heavier than a fetch wrapper, and on mobile that weight is in the launch path. For a small app the payload savings may not repay the bundle cost, which is a calculation worth actually doing rather than assuming.'),

    h3('Generate types either way'),
    p('Whichever you choose, the response types should be generated from the server definition rather than hand-written. Hand-written client types drift, and they drift silently until a field somebody removed six weeks ago is read as undefined on a user\'s device.'),

    h3('Version deliberately, because mobile cannot be forced forward'),
    p('A web client updates on refresh. A mobile client updates when the user allows it, which for a meaningful share is months. The API therefore has to support old clients for far longer than a web-only API does, and that constraint should shape how you make changes rather than being discovered during a rollout.'),
    img('overfetching', 'A large response payload delivered to a client that displays a small part of it', 'A payload shaped for a desktop dashboard is a real cost on a metered mobile connection. Shape endpoints for the views that exist.'),

    h2('What is different about the mobile client?'),
    p('Everything about the environment, which is why the layers above the contract diverge.'),

    h3('The network is unreliable by default'),
    p('Web clients can broadly assume connectivity. Mobile clients cannot, so retries, timeouts, offline behaviour and queued writes are ordinary requirements rather than edge cases — and if the app is [offline-first](/blog/react-native-offline-first), the data layer is genuinely a different architecture rather than a configured variant.'),

    h3('Storage is different'),
    p('Tokens belong in the platform keychain rather than in local storage, and cached data belongs in a real database rather than in memory. Neither of those has a web equivalent, so the persistence layer is necessarily platform-specific.'),

    h3('The app can be suspended at any moment'),
    p('Backgrounding, termination and restoration are constant, and a request in flight when the app is suspended may complete, may not, and may not report either. That makes idempotency a routine requirement rather than an occasional one.'),

    h3('Battery and data are the user\'s resources'),
    p('Polling that is unremarkable on the web is a battery complaint on a phone. Refetch intervals, background sync frequency and payload sizes all need to be more conservative, and the defaults in most query libraries are tuned for the web.'),

    img('mobile-environment', 'A client operating under intermittent connectivity, suspension and constrained resources', 'The layers above the contract diverge because the environments do. Suspension mid-request makes idempotency routine, not exceptional.'),

    h2('How should authentication work across both?'),
    p('One identity system, two token strategies, because the storage and lifetime constraints differ.'),
    p('The server should have a single notion of a user and a session. What differs is how each client holds credentials: a web client typically uses httpOnly cookies, which a mobile client cannot use in the same way, so mobile holds tokens in secure storage and sends them explicitly.'),

    h3('Mobile sessions should last much longer'),
    p('Re-authenticating a phone every two weeks is a poor experience for an app people expect to open instantly. Long-lived refresh tokens held in the keychain, with short access tokens, is the standard arrangement — [and where the tokens live matters more than how long they last](/blog/mobile-token-storage).'),

    h3('Handle refresh in one place'),
    p('Token refresh belongs in the API client, transparently, with concurrent requests waiting on one refresh rather than each triggering their own. Implementing it per call site guarantees a race that logs users out at random.'),

    h3('Logout has to clear more on mobile'),
    p('Secure storage, the local database, cached images and the push token registration all need clearing. A web logout is mostly a cookie; a mobile logout that misses any of these leaves a previous user\'s data on a device.'),
    img('auth-split', 'A single identity source served by two different credential storage approaches', 'One identity system, two token strategies. The server has one notion of a session; how each client holds it necessarily differs.'),

    h2('What about shared business logic?'),
    p('Share the pure functions and keep the effects local.'),
    p('Pricing rules, permission checks, date calculations, formatting and derivation logic are the same everywhere and belong in a shared package. Anything touching storage, navigation or platform APIs does not, and mixing the two is what makes a shared package impossible to import cleanly.'),

    h3('Keep shared logic free of side effects'),
    p('A function that takes inputs and returns a value runs anywhere. A function that reads from a store, dispatches an action or navigates has bound itself to a platform. That distinction is the practical test for whether something belongs in the shared package.'),

    h3('Duplicate rather than force a bad abstraction'),
    p('Sometimes the web and the app genuinely need different behaviour, and contorting one shared implementation to serve both produces something worse than two clear versions. Two clear implementations beat one abstraction with a platform flag in the middle.'),

    h3('The server owns anything that matters'),
    p('Client-side logic is for responsiveness, not for authority. A price calculated on the client for immediate display should still be computed on the server before it is charged, because the client is not trustworthy — on either platform.'),
    p('This is more pointed on mobile, because an old build carrying an outdated rule can be in circulation for months. A discount calculation shipped in March and changed in May is still running in March\'s version on a meaningful number of phones, and the only defence is that the server recomputes it.'),
    img('pure-logic', 'Calculation separated from the effects that bind code to a particular platform', 'Pure functions run anywhere; anything touching storage or navigation does not. That distinction is the test for what belongs in shared code.'),

    h2('How do you avoid the shared code becoming a bottleneck?'),
    p('By keeping the packages small and the change process light.'),
    p('The failure mode of a monorepo is that touching a shared package requires coordinating both clients, and people start avoiding it — which quietly reintroduces the duplication it existed to prevent. Keeping shared packages minimal reduces how often that coordination is needed.'),

    h3('Additive changes over breaking ones'),
    p('Adding an optional field costs nothing to either client. Renaming one requires both to update simultaneously, and with a mobile client that cannot be forced forward, "simultaneously" is not available. Prefer adding and deprecating over changing.'),

    h3('Type checking both clients in CI'),
    p('A change to the contracts package should fail the build if either client no longer compiles, and that check has to run on every pull request. Otherwise the breakage is discovered by whoever next touches the client, days later — [which is what a typecheck pipeline is for](/blog/ci-pipeline-typecheck-tests).'),

    h3('Do not let the web dictate the API'),
    p('Endpoints shaped entirely around the web dashboard produce a mobile client doing awkward work to use them. Reviewing new endpoints against both consumers takes a few minutes and prevents a long tail of client-side reshaping.'),

    h2('When should you not share anything?'),
    p('When the two products are genuinely different, or when the app is an experiment.'),

    h3('Different products that share a brand'),
    p('A consumer app and an internal admin web tool may have almost no overlap in data or rules. Forcing them into one repository creates coordination cost with no correctness benefit, and separate is the honest answer.'),

    h3('A prototype you may throw away'),
    p('Setting up a monorepo, shared packages and generated types is worthwhile for a product you are committing to. For a two-week validation build it is overhead that delays the thing you are trying to learn.'),

    h3('Teams that cannot coordinate releases'),
    p('If the web and mobile work is done by separate organisations on different cadences, a shared package becomes a negotiation. A versioned published contract may serve better than a workspace dependency, even though it is more ceremony.'),
    img('not-sharing', 'Two products with distinct rules kept deliberately separate rather than merged', 'Sharing has a coordination cost. If two products genuinely differ, separate is the honest answer rather than the lazy one.'),

    h2('What does this look like in practice?'),
    p('One server, one contracts package, two clients that feel native to their platform.'),
    p('The shape I use is a workspace with the server, a contracts package holding schemas and types, a thin typed API client, a tokens package, and then a web app and a mobile app that share nothing above that line. Forms on both sides validate with the same schemas. Both consume the same generated response types.'),
    p('What is deliberately not shared is every screen, every component and all navigation. The mobile app uses native navigation patterns and gesture-driven interactions; the web app uses routes and hover states. Both are better for not pretending to be the other.'),

    h3('The payoff shows up on the third change'),
    p('The first feature feels slower because of the setup. By the third change to a shared rule, the arrangement has already paid for itself — one edit, both clients updated, and a compile error anywhere the change was incomplete.'),

    h2('What does it cost?'),
    p('A day or two of setup, and an ongoing coordination tax that is smaller than the duplication it replaces.'),
    p('Establishing the workspace, the contracts package and generated types is a day or two on a new project and rather more on an existing one. After that the cost is that some changes touch multiple packages, which is real and is a fraction of what maintaining two divergent implementations costs.'),
    p('The honest counterweight: monorepos are fashionable and they are not free. Tooling gets more complex, builds get slower, and a badly structured shared layer can couple two products that would have been happier apart. The test is whether disagreement between the clients would be a bug — if yes, share it; if the two are genuinely different products that happen to share a logo, keep them separate and accept a little duplication rather than buying a coordination problem you did not need.'),
    quote('Share what would be a bug if the clients disagreed. Everything else is a platform difference, and flattening it makes both sides slightly wrong.'),

    h2('Conclusion'),
    p('Share the contract and everything derived from it — schemas, types, error shapes, pure domain logic and design token values. Those are the places where a disagreement between web and mobile is a defect rather than a design choice, and having one source removes an entire class of support ticket.'),
    p('Do not share the interface layer or navigation. A component satisfying both CSS and React Native styling is mediocre at both, and mobile navigation patterns differ from web ones for good reasons. Two clear implementations beat one abstraction with a platform flag in it.'),
    p('Structure it as a monorepo with a few small purposeful packages rather than one large shared one: contracts with no dependencies, a transport-only API client, and tokens as values. Watch what the mobile bundle ends up carrying, because a heavy shared dependency lands directly in cold start.'),
    p('Design the API knowing mobile cannot be forced forward. Prefer additive changes over breaking ones, generate response types rather than hand-writing them, shape endpoints for the views that exist rather than for one generic resource, and typecheck both clients in CI so a contract change fails immediately.'),
    p('Then let the layers above the contract diverge honestly — unreliable networks, keychain storage, suspension mid-request, battery and data as the user\'s resources. And skip the whole arrangement when the two are genuinely different products or when the app is a two-week experiment. If you want a web and mobile product built to share the right things, [that is how I structure it](/services).'),
  ),
  faqs: faq([
    ['What should web and mobile actually share?',
     'The API contract and everything derived from it — validation schemas, request and response types, error codes, pure domain logic like pricing rules, and design token values. The test is whether the two clients disagreeing would be a bug rather than a legitimate platform difference.'],
    ['Should I share UI components between web and React Native?',
     'No. A component trying to satisfy both CSS and React Native styling ends up mediocre at both, and mobile navigation patterns differ from web ones for good reasons. Share the token values so the platforms look consistent, and write the components separately.'],
    ['Is GraphQL better than REST for a shared API?',
     'It solves over-fetching directly, which is a real mobile cost on metered connections. But the client library is heavier, and on mobile that weight lands in cold start. REST with endpoints shaped for actual views — a compact list, a fuller detail — is a perfectly good alternative.'],
    ['How does having a mobile client change API design?',
     'You cannot force clients forward. A web client updates on refresh; a meaningful share of mobile users run builds that are months old. That means supporting old versions far longer, preferring additive changes over renames, and storing the app version so you know what is out there.'],
    ['When is a shared monorepo the wrong choice?',
     'When the web and mobile products genuinely differ — a consumer app and an internal admin tool share little beyond a logo. Also for a short validation build where the setup delays what you are trying to learn, and when separate teams on different release cadences would turn it into a negotiation.'],
  ]),
};
