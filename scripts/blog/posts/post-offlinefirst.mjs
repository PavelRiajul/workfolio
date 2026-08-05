import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/react-native-offline-first/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-react-native-offline-first',
  slug: 'react-native-offline-first',
  title: 'Building Offline-First in React Native',
  category: 'mobile',
  order: 100,
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-18',
  series: 'React Native in production',
  excerpt:
    'An app that needs a connection to show data the user already owns is broken on a train. Local-first storage, sync, and the conflicts nobody plans for.',
  coverLabel: 'Offline-first — cover',
  body: body(
    p('Pulse is a habit and fitness tracker I built in React Native. It has a stat on its case study that people read as a performance claim and is really an architectural one: zero network needed. You can open it in a tunnel, log a workout, check a streak and close it, and nothing about the experience indicates the connection is gone.'),
    p('That is not a feature that was added. It is a consequence of deciding, before writing anything, that the local database is the source of truth and the server is a synchronisation target. Retrofitting that decision into an app built the other way round is close to a rewrite, which is why it belongs at the start.'),
    p('This post is about how that works in practice: what to store locally, how sync actually behaves, what happens when two devices disagree, and the honest cost of the approach.'),

    h2('Why does offline-first matter?'),
    p('Because mobile connections are not binary, and the bad state is worse than being offline.'),
    p('Developers test on wifi and think about offline as a state the app enters when the connection drops. Real usage is a spectrum: a train with intermittent signal, a lift, a basement, a crowded venue where the network is technically present and useless. An app that shows a spinner until a request resolves will spin for thirty seconds on a connection that is technically working, and that is a worse experience than a clear offline state.'),
    p('The second reason is simpler. Data the user already created belongs to them, and asking a server for permission to display it is an odd arrangement that is only normal because it is common. A habit logged yesterday should be visible today regardless of anything.'),
    table('Three architectures and how they behave', [
      ['', 'Server-first', 'Cached', 'Offline-first'],
      ['Source of truth', 'Server', 'Server', 'Local database'],
      ['Cold start', 'Waits on network', 'Shows stale, then updates', 'Instant'],
      ['On a bad connection', 'Spinner', 'Stale until timeout', 'Fully usable'],
      ['Writes while offline', 'Fail', 'Fail', 'Queued'],
      ['Complexity', 'Low', 'Moderate', 'High'],
    ]),
    p('The last row is the honest one. Offline-first is meaningfully more complex than the alternatives, and the complexity is concentrated in sync and conflict handling rather than spread evenly. That is the trade, and for a lot of apps it is not worth making.'),

    h3('It is also how you get a fast cold start'),
    p('Pulse opens in under half a second because opening does not involve a request. Reading from a local database and rendering is fast in a way that no amount of network optimisation can match, so the architecture that makes the app work offline also makes it feel instant online.'),
    img('connection-spectrum', 'A range of network conditions between fully connected and fully absent, with the middle band highlighted', 'Offline is not a binary state. The worst case is a connection that technically works and takes thirty seconds to resolve.'),

    h2('What does local-first actually mean?'),
    p('The app reads and writes to a local database, and a separate process reconciles that database with the server.'),
    p('The critical property is that no user-facing operation ever waits on the network. Tapping a button writes to local storage and the interface updates immediately, because the write already succeeded. Whether the server has heard about it yet is a separate concern handled by code the user never sees.'),

    h3('The UI never awaits a request'),
    p('This is the rule that everything else follows from. If a component awaits a fetch before rendering, the app is not offline-first regardless of what else it does. Every screen reads from the local store, and the local store is populated by sync rather than by the screen.'),

    h3('Writes go to a queue'),
    p('A change is written locally and an entry is appended to an outbox describing what needs to happen on the server. When connectivity allows, the queue drains. If the app is killed, the queue survives, because it lives in the same durable storage as everything else.'),

    h3('Sync is a background concern'),
    p('Pulling server changes and pushing the outbox happens on a schedule, on connectivity change, and on app foreground. None of those are triggered by a user action, which is what keeps the interface independent of the network.'),

    h2('What should you use for storage?'),
    p('Something with real queries and observable reads — not AsyncStorage.'),
    p('AsyncStorage is a key-value store, and it is fine for a token or a preference flag. Using it as an application database means serialising a whole collection to JSON to change one record, which stops scaling around the point the app becomes useful.'),
    table('Storage options in React Native', [
      ['Option', 'Good for'],
      ['AsyncStorage', 'Flags, tokens, small preferences'],
      ['MMKV', 'Fast key-value, synchronous reads'],
      ['SQLite (expo-sqlite, op-sqlite)', 'Relational data, real queries'],
      ['WatermelonDB', 'Large datasets with built-in sync'],
      ['Realm', 'Object database with sync as a product'],
    ]),
    p('For most apps SQLite is the right answer. It is on the device already, it handles relational data properly, and it does not tie the architecture to a vendor. A schema and a few queries is less machinery than a sync framework and it is much easier to reason about when something goes wrong.'),

    h3('Make reads observable'),
    p('The interface should re-render when the local data changes, whether that change came from the user or from sync. A query layer that emits on change — rather than components re-fetching — is what makes incoming sync updates appear without any coordination.'),

    h3('Migrations exist on mobile too'),
    p('A local schema needs versioned migrations exactly as a server database does, with the added constraint that users may skip several app versions. Getting this wrong corrupts data on devices you cannot access — [the same discipline as any database change](/blog/zero-downtime-migrations), with a worse failure mode.'),

    h3('Do not put everything in the database'),
    p('Cached images, large media and derived values do not belong in the same store as user records. Keeping the database small keeps queries fast and migrations quick, and media has its own cache with its own eviction rules.'),
    img('local-store', 'An interface reading from a device-local store that a background process keeps reconciled', 'No user-facing operation waits on the network. If a component awaits a fetch to render, the app is not offline-first.'),

    h2('How does sync actually work?'),
    p('Pull changes since a checkpoint, push the outbox, resolve anything that collided.'),
    p('The mechanics are simpler than the reputation suggests, provided the data model was designed for it. Every record carries an identifier the client can generate, a version or timestamp, and a deleted flag. The server exposes a way to ask "what changed since X" and a way to accept a batch of changes.'),
    code('ts', `
async function sync() {
  // 1. Push first, so the server sees local work before we overwrite anything.
  const outbox = await db.getPendingChanges();
  if (outbox.length) {
    const accepted = await api.push(outbox);
    await db.markSynced(accepted);
  }

  // 2. Pull everything changed since our last checkpoint.
  const since = await db.getCheckpoint();
  const { changes, checkpoint } = await api.pull(since);
  await db.applyRemote(changes);
  await db.setCheckpoint(checkpoint);
}
`),

    h3('Generate ids on the client'),
    p('A UUID created on the device means a record is complete and referenceable the instant it is made, with no waiting for a server-assigned id. Server-generated ids force a placeholder state and break every relationship created while offline, so this is the single most important schema decision.'),

    h3('Soft delete, always'),
    p('A hard delete cannot be synchronised, because the absence of a record is indistinguishable from never having seen it. A `deleted_at` column lets the deletion propagate like any other change, and a periodic cleanup removes the tombstones once everyone has seen them.'),

    h3('Push before you pull'),
    p('Ordering matters. Pushing first means the server has the client\'s work before the client applies the server\'s state, which avoids a class of bug where local changes are overwritten by a pull that started before they were sent.'),

    h3('Make the whole thing idempotent'),
    p('A sync that fails halfway will be retried, and a push that succeeded on the server but failed to acknowledge will be sent again. Every operation needs to be safe to apply twice — [the same requirement as any retried write](/blog/idempotency-keys), and mobile networks make it a routine occurrence rather than an edge case.'),

    img('sync-cycle', 'Local changes sent before remote changes are applied, with a checkpoint advanced afterwards', 'Push before pull. Sending local work first avoids the class of bug where a pull overwrites changes made while it was in flight.'),

    h2('What happens when two devices disagree?'),
    p('Something has to win, and the honest answer is that you choose the rule per field rather than per record.'),
    p('Conflict resolution has a reputation for being intractable, which comes from imagining the general case. In a real app most conflicts are trivial and the few that are not are usually resolvable by understanding what the field means. A habit streak, a note body and a settings toggle each want different behaviour.'),

    h3('Last write wins, mostly'),
    p('For most fields, the most recent change is the one the user meant. It is simple, predictable, and wrong occasionally in ways nobody notices. Using the client timestamp needs care because device clocks drift; using a server-assigned version is more reliable.'),

    h3('Some fields should merge'),
    p('A counter that both devices incremented should end at the sum rather than at one of the values. A list of completed items should be the union. Recognising which fields are additive rather than replaceable removes most of the genuinely lossy conflicts.'),

    h3('A few need the user'),
    p('For a long text field edited on two devices, silently discarding one version is bad. Keeping both and asking is more work and it is the only honest option for content somebody spent time on. This should be rare — if it is common, the data model is fighting the usage pattern.'),

    h3('Log every conflict'),
    p('Conflicts you never see are conflicts you cannot evaluate. Recording that one occurred, on which field, and how it was resolved is what tells you whether the rules are right, and it is trivially cheap compared with the confusion of a user losing data silently.'),
    img('conflict-rules', 'Different reconciliation strategies applied per field rather than one rule for the whole record', 'Most conflicts are trivial. Choose the rule per field — replace, merge or ask — and the intractable general case disappears.'),

    h2('What does the interface need to show?'),
    p('Enough that the user trusts the app, and not so much that connectivity becomes their problem.'),

    h3('Optimistic by default'),
    p('The change appears immediately because it has already happened locally. There is no pending state for the common case, because there is nothing pending from the user\'s point of view — the write succeeded.'),

    h3('A quiet indicator for unsynced work'),
    p('A small marker showing that something has not reached the server yet is reassuring without being alarming. It should be quiet — a subtle dot rather than a banner — because on an offline-first app it is a normal condition rather than an error.'),

    h3('Say something when it actually matters'),
    p('If a sync has failed repeatedly over days, that is worth surfacing, because it may mean an expired token or a server problem the user can act on. A single failed attempt is not.'),

    h3('Never block on connectivity'),
    p('The banner reading "no internet connection" over a fully functional local database is the exact failure this architecture exists to prevent. If the app works, do not tell the user it does not.'),

    img('quiet-indicator', 'A subtle marker for unsent work rather than a prominent connectivity warning', 'Unsynced is a normal condition here, not an error. A prominent offline banner over a working app is the failure this prevents.'),

    h2('What is genuinely hard about it?'),
    p('Four things, and they are worth knowing before committing.'),

    h3('Testing the middle states'),
    p('Fully online and fully offline are easy to test. The hard cases are a request that succeeded on the server and failed to acknowledge, a sync interrupted halfway, an app killed with a half-drained queue. Those need deliberate simulation and they are where the real bugs live.'),

    h3('Schema changes across versions'),
    p('A user on a three-month-old build syncing against a server that has moved on is a compatibility problem in both directions. The server has to accept old payloads and the client has to tolerate unknown fields, and forgetting either produces failures on devices you cannot reach.'),

    h3('Storage growth'),
    p('Local databases grow, and a user with two years of records on an old device with little free space is a real scenario. Archiving old data, capping media caches and pruning tombstones are all things somebody has to decide.'),

    h3('Debugging what happened on a device'),
    p('When a user says their data is wrong, the state that produced it is on their phone. Structured sync logging that can be sent with a support request is the difference between diagnosing it and guessing — worth building before you need it, alongside [the error tracking every project gets](/stack).'),
    img('hard-parts', 'Partially completed synchronisation states that are neither fully online nor fully offline', 'The bugs live in the middle: a push that succeeded and failed to acknowledge, a queue half-drained when the app was killed.'),

    h2('When is it not worth it?'),
    p('When the data is inherently shared, live, or not the user\'s own.'),

    h3('Collaborative editing'),
    p('Multiple people editing the same document simultaneously is a different problem requiring different machinery — CRDTs or operational transforms rather than field-level conflict rules. Do not build that with a sync queue.'),

    h3('Live or transactional data'),
    p('Stock levels, prices, availability, anything with a real-time constraint. Showing a stale local copy of a number that must be current is worse than showing a spinner, and pretending otherwise causes real problems.'),

    h3('Content the user only reads'),
    p('A news or catalogue app mostly needs good caching rather than a local source of truth. Caching gets most of the benefit for a fraction of the complexity, and the distinction is whether the user creates data or consumes it.'),

    h3('A first version testing an idea'),
    p('Offline-first is architecture, and architecture is what you commit to when you know the app is worth building. For an MVP proving a concept, a well-cached server-first app ships faster — and this is exactly the kind of trade-off [worth deciding deliberately at the start](/blog/project-stack-templates).'),

    img('fit-test', 'A distinction between users who create data and users who only read it', 'The question to answer first: does the user create the data or consume it? Creators need this; consumers usually need caching.'),

    h2('What did this look like on Pulse?'),
    p('Seven weeks, SQLite as the source of truth, and an app that genuinely does not care about the network.'),
    p('Habits, entries and settings all live in a local database with client-generated ids and soft deletes. Every screen reads from it through observable queries, so a sync arriving updates the interface with no coordination. The outbox drains on foreground, on connectivity change and on a timer.'),
    p('The measurable outcomes were a cold start under half a second and full functionality with no connection at all. The less measurable one is that the app never shows a spinner for data the user already owns, which is the thing people actually notice — and it is why the gesture work that gave it [60fps interactions](/work/pulse) was worth doing, since nothing else was competing for the main thread.'),

    h3('What I would do the same'),
    p('Client ids and soft deletes from the first commit. Both are trivial at the start and painful to retrofit, and together they remove most of the ways sync goes wrong.'),

    h3('What I would do differently'),
    p('Build the sync log and a way to export it before shipping rather than after the first confusing support message. It took an afternoon and it should have existed on day one.'),

    h2('What does it cost?'),
    p('Roughly a third more build time, concentrated in sync rather than spread across the app.'),
    p('The screens are not harder to write — arguably easier, since they read from a local store synchronously. The cost is the sync layer, the conflict rules, the migration story and the testing of partial states, and that is a genuine two to three weeks on a typical app rather than a few days.'),
    p('The honest counterweight: this is the right architecture for an app whose data belongs to the user, and it is over-engineering for one whose data does not. I have seen offline-first applied to a dashboard that reads live server metrics, where it added weeks of sync complexity to display numbers that are meaningless when stale. The question to answer first is whether the user creates the data or consumes it — creators need this, consumers usually need good caching and nothing more.'),
    quote('An app that asks a server for permission to display data the user already created is a strange arrangement that is only normal because it is common.'),

    h2('Conclusion'),
    p('Offline-first means the local database is the source of truth and the server is a synchronisation target, and the rule everything follows from is that no user-facing operation ever waits on the network. If a component awaits a fetch before rendering, the app is not offline-first no matter what else it does.'),
    p('Use SQLite rather than AsyncStorage for anything relational, make reads observable so sync updates appear without coordination, and treat local schema migrations with the same seriousness as server ones — users skip versions and you cannot reach their devices.'),
    p('Generate ids on the client so records are complete the instant they are made, soft delete so removals can propagate, push before you pull so local work is never overwritten, and make every operation idempotent because a retried sync is routine on mobile rather than exceptional.'),
    p('Resolve conflicts per field rather than per record: replace for most, merge for counters and sets, and ask the user only for content they spent real time on. Log every conflict, because rules you cannot evaluate are rules you cannot trust.'),
    p('Then be honest about fit. This suits apps where the user creates the data — trackers, journals, field tools, anything used on a train. It suits live prices, stock levels and collaborative documents badly, and it costs roughly a third more build time concentrated entirely in the sync layer. If you are weighing it for an app you are planning, [that is a good conversation to have early](/start).'),
  ),
  faqs: faq([
    ['What does offline-first actually mean?',
     'That the local database is the source of truth and the server is a synchronisation target, rather than the other way around. The practical rule is that no user-facing operation waits on the network — every screen reads from local storage, and sync populates that storage in the background.'],
    ['Should I use AsyncStorage for offline data?',
     'Only for tokens, flags and small preferences. As an application database it means serialising an entire collection to JSON to change one record, which stops scaling around the point the app becomes useful. SQLite is the right default for anything relational.'],
    ['How do I handle two devices editing the same record?',
     'Choose the rule per field rather than per record. Most fields want last-write-wins using a server-assigned version rather than a device clock. Counters and sets should merge. Only long text a user invested time in justifies asking them, and if that happens often the data model is wrong.'],
    ['Why generate record ids on the client?',
     'So a record is complete and referenceable the moment it is created, with no waiting for the server. Server-assigned ids force a placeholder state and break every relationship formed while offline, which makes this the single most consequential schema decision in an offline-first app.'],
    ['When is offline-first the wrong choice?',
     'When the data is live, shared or not the user’s own — stock levels, prices, collaborative documents. It also over-serves an app whose users only read content, where good caching gets most of the benefit for a fraction of the complexity, and an MVP still testing whether the idea works.'],
  ]),
};
