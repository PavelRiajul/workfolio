import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/react-native-gesture-performance/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-react-native-gesture-performance',
  slug: 'react-native-gesture-performance',
  title: 'Gestures at 60fps in React Native',
  category: 'mobile',
  order: 103,
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-26',
  series: 'React Native in production',
  excerpt:
    'A drag that lags by two frames feels broken in a way users cannot name. Keeping animation off the JavaScript thread is the whole technique.',
  coverLabel: 'Gesture performance — cover',
  body: body(
    p('Pulse is gesture-driven — swipe to complete a habit, drag to reorder, pull to reveal. Its case study carries a 60fps claim, and that number is not a benchmark result. It is the difference between an app that feels like a native app and one that feels like a website in a shell, and users detect it instantly without being able to say what is wrong.'),
    p('The reason gestures are the hard part of React Native is structural. Touch events originate on the native side, application logic runs in JavaScript, and rendering happens natively again. If a finger movement has to cross that boundary twice before anything moves on screen, the interaction is late — not slow, exactly, but late, and lateness during a drag is what reads as broken.'),
    p('This post is about avoiding that: what actually causes dropped frames, how to keep animation off the JavaScript thread, and the specific patterns that produce interactions that track a finger properly.'),

    h2('Why do gestures stutter?'),
    p('Because the work is happening on a thread that is also doing everything else.'),
    p('React Native runs your application code on the JavaScript thread. That thread also handles state updates, network responses, timers and re-renders. When a gesture handler updates state on every touch move, each movement triggers a render, and the render competes with whatever else is queued. Miss the 16-millisecond window and a frame is dropped.'),
    p('The critical insight is that dropped frames during a gesture are far more noticeable than dropped frames anywhere else. A list that takes an extra 80ms to appear is barely perceptible; a drag that lags a finger by two frames is immediately, viscerally wrong, because the user has a physical reference for where the object should be.'),
    table('What runs where', [
      ['Thread', 'Responsibility', 'Blocked by'],
      ['UI (native)', 'Rendering, touch capture', 'Heavy native work'],
      ['JavaScript', 'App logic, state, renders', 'Everything you write'],
      ['Worklet / UI runtime', 'Animation callbacks', 'Only its own work'],
    ]),
    p('The third row is the whole technique. Running gesture and animation code in a worklet on the UI thread means the interaction cannot be delayed by application work, however heavy that work is.'),

    h3('The old bridge made this worse'),
    p('Historically every cross-thread message was serialised and passed asynchronously, so gesture handling in JavaScript was structurally late. The newer architecture removes much of that overhead, and it does not remove the underlying reason to keep animation off the JavaScript thread — it just makes the failure less severe.'),
    img('threads', 'Interaction work isolated on a rendering thread rather than queued behind application logic', 'A drag that lags a finger by two frames is viscerally wrong, because the user has a physical reference for where the object should be.'),

    h2('What does a worklet actually do?'),
    p('It runs a small piece of JavaScript on the UI thread, synchronously with rendering.'),
    p('Reanimated compiles marked functions so they can execute in a separate runtime on the UI thread. A gesture handler written as a worklet receives touch events and updates shared values without ever involving the JavaScript thread, so the animation continues smoothly even while the app is doing something expensive elsewhere.'),

    code('tsx', `
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const x = useSharedValue(0);

const pan = Gesture.Pan()
  .onUpdate((e) => {
    // Runs on the UI thread. No render, no bridge, no queue.
    x.value = e.translationX;
  })
  .onEnd(() => {
    x.value = withSpring(0);
  });

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));

return (
  <GestureDetector gesture={pan}>
    <Animated.View style={style} />
  </GestureDetector>
);
`),

    h3('Shared values are the state that lives on both sides'),
    p('A shared value can be read and written from either thread and does not trigger a React render when it changes. That last property is the point — updating it sixty times a second costs nothing, whereas updating component state sixty times a second is what caused the problem.'),

    h3('Never call setState during a gesture'),
    p('This is the single most common mistake. A state update on every touch move re-renders the component tree at gesture frequency, and no amount of memoisation makes that free. If something needs to happen in React, it happens once at the end of the gesture.'),

    h3('Crossing back to JavaScript is explicit'),
    p('When the gesture ends and you need to persist something, `runOnJS` schedules that work on the JavaScript thread. Calling it on every update defeats the entire arrangement, so it belongs in `onEnd` and almost never in `onUpdate`.'),

    h2('Which properties are cheap to animate?'),
    p('Transform and opacity. Everything else is a compromise.'),
    p('Animating `translateX`, `translateY`, `scale`, `rotate` and `opacity` is handled efficiently by the platform because they do not require re-measuring or re-laying-out anything. Animating width, height, margin or padding forces a layout pass on every frame, and a layout pass at 60fps is a great deal of work for something that usually looks identical.'),
    table('The cost of animating different properties', [
      ['Property', 'Cost', 'Alternative'],
      ['transform, opacity', 'Cheap — no layout', '—'],
      ['width, height', 'Layout every frame', 'scale'],
      ['top, left, margin', 'Layout every frame', 'translate'],
      ['backgroundColor', 'Moderate', 'Acceptable, but not per-frame'],
      ['shadow properties', 'Expensive, especially iOS', 'Animate opacity of a shadowed layer'],
    ]),
    p('This mirrors the web exactly, and for the same reason — the animation pipeline can composite a transform without asking the layout engine anything. Where a design calls for an animated height, scaling a fixed-size element usually produces a result nobody can distinguish.'),

    h3('Layout animations are for entry and exit'),
    p('Reanimated\'s layout animations handle items appearing, disappearing and repositioning in a list, and they are the right tool for that. They are not a substitute for a transform-driven gesture, because they respond to layout changes rather than to a finger.'),

    h3('Avoid animating anything that reflows a list'),
    p('Changing the height of a row inside a long list forces the list to recalculate positions for everything after it. That is expensive, and during a gesture it is the difference between smooth and unusable.'),
    img('cheap-properties', 'Transform-based movement composited directly against a layout-triggering alternative', 'Transform and opacity composite without a layout pass. Animating width or margin does layout work sixty times a second.'),

    h2('What about lists?'),
    p('They are where most real performance problems live, and gestures inside them compound it.'),
    p('A scrollable list of a few hundred items with images, swipe actions and animated rows is the standard case that breaks. The list needs to render rows fast enough to keep up with scrolling, and each row carries gesture handlers and animated styles that have their own cost.'),

    h3('Use a virtualised list, correctly'),
    p('Only rendering what is visible is the baseline. Getting the configuration right — item sizing, window size, batch sizes — matters more than the choice of library, and a poorly configured virtualised list can perform worse than a plain one.'),

    h3('Give the list a known item height where you can'),
    p('Fixed-height rows let the list calculate positions without measuring, which removes a large amount of work during fast scrolling. Variable heights are sometimes unavoidable and they are never free.'),

    h3('Memoise rows and keep them shallow'),
    p('A row component that re-renders because a parent state changed is doing work for every visible item. Memoising rows and keeping their prop surface small is what makes that stop, and it is the highest-value optimisation in most lists.'),

    h3('Keep images out of the critical path'),
    p('Decoding images during a scroll competes for the same resources as rendering rows. Correctly sized images, a cache, and placeholders that reserve space keep scrolling smooth — [the same principle as reserving space on the web](/blog/near-zero-cls), for the same reason.'),

    h2('How do you make a gesture feel right?'),
    p('Track the finger exactly, then apply physics when it lets go.'),
    p('The mechanical part is only half of it. An interaction can hit 60fps and still feel wrong if it moves linearly, stops abruptly or ignores the velocity the user imparted. What people read as quality is mostly momentum, resistance and settling behaviour.'),

    h3('Use velocity at the end of the gesture'),
    p('A flick should continue and decelerate; a slow drag released should settle gently. Passing the gesture\'s final velocity into the spring or decay animation is what makes both behave as expected, and it is a single parameter that transforms how an interaction feels.'),

    h3('Add resistance at boundaries'),
    p('When a drag reaches its limit, continuing to track the finger exactly feels broken and stopping dead feels worse. Applying a diminishing factor past the boundary — the rubber-banding every platform uses — communicates the limit without blocking the gesture.'),

    h3('Prefer springs to durations'),
    p('A spring configured with sensible damping and stiffness responds to how the gesture ended, whereas a fixed 300ms animation always takes 300ms regardless. Springs feel physical because they are, and they interrupt gracefully when a second gesture arrives.'),

    h3('Give immediate feedback on touch'),
    p('A subtle scale or opacity change on touch down, before any movement, tells the user the element is responding. It costs one animated style and it is a large part of why an interaction feels solid rather than uncertain.'),
    img('gesture-feel', 'A released drag continuing with momentum and settling rather than stopping abruptly', 'Hitting 60fps is half of it. Momentum, resistance at the boundaries and settling behaviour are what people read as quality.'),

    h3('Make the target big enough to hit'),
    p('A swipe area that only responds within a narrow band is a gesture that fails intermittently for reasons the user cannot see, and intermittent failure reads as unreliability rather than as a missed target. Extending the touch region beyond the visible element — the mobile equivalent of a generous hit area — fixes a class of complaint that looks like a performance problem and is not.'),
    img('list-cost', 'Rows rendered only within the visible window while the rest are represented by measured space', 'Lists are where most real problems live. Memoised rows with a small prop surface is the highest-value fix in almost all of them.'),

    h2('How do gestures compose?'),
    p('Explicitly — and this is where most gesture bugs come from.'),
    p('A swipeable row inside a scrolling list inside a swipeable pager has three gesture recognisers competing for the same touch. Left undeclared, the resolution is arbitrary, and the symptom is a gesture that works most of the time and occasionally does the wrong thing, which is the hardest kind of bug to pin down.'),

    h3('Declare the relationships'),
    p('Gesture Handler provides composition for exactly this: gestures that should run together, gestures that must wait for another to fail, and gestures that block others. Stating the relationship removes the ambiguity rather than tuning around it.'),

    h3('Constrain by direction and distance'),
    p('A horizontal swipe inside a vertical list should activate only after clear horizontal movement, and not at all if the movement is mostly vertical. Setting activation thresholds and axis constraints resolves most conflicts without any explicit composition.'),

    h3('Test the awkward combinations deliberately'),
    p('A diagonal drag, a second finger arriving mid-gesture, a swipe started at the very edge of the screen where the system has its own gestures. These are where composition problems surface, and they will not appear in ordinary use during development.'),

    h3('Leave the system gestures alone'),
    p('The screen edges belong to the operating system — back navigation, the home indicator, notification and control panels. A custom gesture starting in those regions competes with the platform and loses unpredictably, which users experience as the app interfering with their phone. Keeping interactive edges inset by a reasonable margin avoids the whole category.'),
    img('composition', 'Several overlapping recognisers on one touch resolved by declared precedence', 'Three recognisers competing for one touch resolve arbitrarily unless you say otherwise — and the symptom is intermittent wrongness.'),

    h2('How do you actually measure it?'),
    p('On a mid-range Android device, with the profiler, in a release build.'),
    p('Testing gestures on a recent iPhone in development mode tells you almost nothing. Development builds are slower in ways that do not match production, and flagship hardware hides problems that most users will experience. The honest test is a three-year-old mid-range Android running a release build.'),

    h3('Watch both frame rates'),
    p('React Native reports UI thread and JavaScript thread frame rates separately, and the distinction is diagnostic. A smooth UI thread with a struggling JavaScript thread means animation is correctly offloaded and something else is heavy; both struggling means the animation is on the wrong thread.'),

    h3('Profile the render count'),
    p('Counting how many times a component renders during a gesture answers the main question immediately. A row that renders sixty times during a drag has a state update in the handler, and finding that is usually the entire fix.'),

    h3('Test with realistic data'),
    p('Twenty seeded items behave nothing like eight hundred real ones with images and varying text lengths. Most list performance problems only appear at realistic volume, which is why they tend to be discovered by users rather than in development.'),
    img('measuring', 'Interaction smoothness assessed on modest hardware running a production build', 'A development build on a flagship phone proves nothing. Three-year-old mid-range Android, release build, realistic data volume.'),

    h2('What did this look like on Pulse?'),
    p('Swipe-to-complete, drag-to-reorder and a pull gesture, all running entirely on the UI thread.'),
    p('Every gesture updates shared values in worklets. The only crossing back to JavaScript happens when a gesture completes and something needs to be written to the local database — which, because the app is [offline-first](/blog/react-native-offline-first), is a local write rather than a network call and completes immediately.'),
    p('That combination is why the app holds 60fps. There is no network request during an interaction, no state update per frame, and no layout animation in the gesture path. The heaviest thing the JavaScript thread does during a swipe is nothing at all.'),

    h3('The reorder gesture took the longest'),
    p('Drag-to-reorder in a list is the hardest of the three, because it involves an item following a finger while the items around it move out of the way and the list scrolls at the edges. Getting all three to cooperate is genuinely fiddly and it is where most of the gesture time went.'),

    h3('Haptics carry more than they cost'),
    p('A light impact when a swipe passes its commit threshold, and a softer one when a reordered item drops into place, communicate state through a channel that costs no frames at all. It is a single call per event and it does a surprising amount of the work that people attribute to the animation itself.'),

    h3('Reduced motion still applies'),
    p('Users who have asked for reduced motion should get instant transitions rather than springs, and gesture tracking should still work — the movement is the interaction, not decoration. Respecting the setting is [a requirement rather than a preference](/blog/prefers-reduced-motion), on mobile as much as on the web.'),

    h2('What does it cost?'),
    p('Roughly twice as long as the naive version, concentrated in the last ten percent.'),
    p('Getting a gesture working is quick. Getting it to track precisely, respond to velocity, resist at boundaries, compose correctly with the gestures around it and hold frame rate on a mid-range Android is where the time goes, and that portion is easily half the total effort for the interaction.'),
    p('The honest counterweight: this level of polish is worth it for the two or three interactions a user performs constantly, and it is a poor use of time for everything else. A settings screen does not need spring physics. I have seen more time lost to animating things nobody notices than to any genuine performance problem — the discipline is choosing which interactions carry the product and treating the rest as ordinary screens.'),
    quote('A dropped frame during a drag is worse than a dropped frame anywhere else, because the user has a physical reference for where the object should be.'),

    h2('Conclusion'),
    p('Gestures stutter because touch handling, application logic and rendering are on different threads, and the JavaScript thread is doing everything else. The fix is structural rather than incremental: run gesture and animation code in worklets on the UI thread, where application work cannot delay it.'),
    p('Use shared values rather than component state, because a shared value updates without triggering a render. Never call `setState` during a gesture — that single mistake causes most stuttering — and cross back to JavaScript with `runOnJS` only when the gesture ends.'),
    p('Animate transform and opacity, which composite without a layout pass, and avoid width, height, margin and shadow properties, which do layout work on every frame. In lists, virtualise properly, prefer known item heights, memoise rows with a small prop surface, and keep image decoding out of the scroll path.'),
    p('Then make it feel right, which is a separate problem from making it fast. Pass the gesture\'s final velocity into a spring so a flick continues and a slow release settles, add rubber-band resistance at boundaries, prefer springs to fixed durations, and give immediate feedback on touch down. Declare how competing gestures compose rather than tuning around the ambiguity.'),
    p('Measure on a three-year-old mid-range Android running a release build with realistic data, watch the UI and JavaScript frame rates separately because the difference is diagnostic, and count renders during a gesture. And spend this effort only on the interactions people perform constantly — a settings screen does not need spring physics. If you want an app where the core interactions genuinely feel native, [that is the work](/services).'),
  ),
  faqs: faq([
    ['Why do my React Native gestures stutter?',
     'Almost always a state update inside the gesture handler. Calling setState on every touch move re-renders the component tree at gesture frequency, and no amount of memoisation makes that free. Use shared values in a worklet instead, and cross back to JavaScript only when the gesture ends.'],
    ['What is a worklet and why does it matter?',
     'A small JavaScript function compiled to run on the UI thread, synchronously with rendering. Gesture handlers written as worklets update shared values without involving the JavaScript thread at all, so the interaction stays smooth even while the app is doing something expensive elsewhere.'],
    ['Which properties are safe to animate at 60fps?',
     'Transform — translate, scale, rotate — and opacity, because they composite without a layout pass. Width, height, margin, top and left force layout on every frame, and shadow properties are expensive on iOS. Where a design wants animated height, scaling a fixed-size element usually looks identical.'],
    ['How do I stop competing gestures from conflicting?',
     'Declare the relationship explicitly rather than tuning around it — which gestures run simultaneously, which must wait for another to fail, which block others. Also constrain by axis and activation distance, so a horizontal swipe in a vertical list only activates on clear horizontal movement.'],
    ['How should I test gesture performance?',
     'On a three-year-old mid-range Android, in a release build, with realistic data volume. Development builds on flagship hardware hide almost everything. Watch the UI and JavaScript frame rates separately — a smooth UI thread with a struggling JS thread means the animation is correctly offloaded.'],
  ]),
};
