import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/mobile-token-storage/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-mobile-token-storage',
  slug: 'mobile-token-storage',
  title: 'Where Auth Tokens Belong on a Phone',
  category: 'mobile',
  order: 108,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-08',
  series: 'React Native in production',
  excerpt:
    'AsyncStorage is a plain file on disk. Keychain and Keystore exist for exactly this, and the difference matters more than most teams assume.',
  coverLabel: 'Token storage — cover',
  body: body(
    p('The default way to persist a login in React Native is AsyncStorage, because it is the first storage API anybody encounters and it works. It is also an unencrypted file in the app\'s data directory, which means the session token sitting in it is readable by anything that can read that directory — a rooted device, a jailbroken one, a compromised backup, or a piece of malware with the right access.'),
    p('The platforms provide dedicated secure storage for exactly this purpose. Keychain on iOS and Keystore on Android are hardware-backed where the device supports it, survive app reinstalls or not depending on how you configure them, and can require biometric confirmation before releasing a value. Using them instead is a small amount of work.'),
    p('This post covers where credentials should actually live, how the token lifecycle should work on a device that is offline half the time, and the mobile-specific mistakes that turn a reasonable auth design into a real problem.'),

    h2('What is wrong with AsyncStorage?'),
    p('It offers no protection beyond the operating system\'s own sandbox, which is not the threat model you care about.'),
    p('On an intact device, app sandboxing does prevent other applications from reading your files, and for a lot of data that is sufficient. The problem is that the interesting attacks are precisely the cases where the sandbox is not intact: a rooted or jailbroken phone, a device backup extracted to a computer, a malicious app exploiting a privilege escalation, or a phone handed to somebody at a repair shop.'),
    table('What each storage option actually gives you', [
      ['Option', 'Encrypted', 'Hardware-backed', 'Use for'],
      ['AsyncStorage', 'No', 'No', 'Preferences, flags, cache'],
      ['MMKV (default)', 'No', 'No', 'Fast non-sensitive state'],
      ['MMKV with encryption', 'Yes', 'No — key must live somewhere', 'Bulk data at rest'],
      ['SecureStore / Keychain / Keystore', 'Yes', 'Usually', 'Tokens, credentials, keys'],
    ]),
    p('The third row is the one that catches people. Encrypting a store is only as good as where the encryption key lives, and if that key is in AsyncStorage you have added a step rather than a protection. The key belongs in the platform secure storage, and at that point you may as well put the token there directly.'),

    h3('The practical rule'),
    p('Anything that would let somebody act as the user goes in secure storage. Everything else — theme preference, onboarding completion, cached content — can go anywhere convenient, and putting it in secure storage instead is slower for no benefit.'),

    h3('Read once at launch, keep it in memory'),
    p('The pattern that works is reading the token once during startup, holding it in a module-level variable, and writing back only when it changes. That keeps the slow read off every request path while still ensuring the durable copy lives somewhere protected, and it makes the refresh logic simpler because there is one authoritative value in memory.'),

    h3('Secure storage is not free'),
    p('Reads are meaningfully slower than a key-value store, and on iOS a Keychain read can be several milliseconds. That is irrelevant for one token read at launch and noticeable if you put something in there that a list renders per row.'),
    img('storage-tiers', 'Sensitive credentials isolated in protected storage while ordinary state sits alongside it', 'Anything that lets somebody act as the user goes in secure storage. Everything else can go wherever is convenient.'),

    h2('How do you actually use it?'),
    p('A small wrapper around the platform API, used everywhere, with no direct access anywhere else.'),
    p('The mechanics are straightforward. What matters is that the whole app goes through one module, so the storage decision is made once and cannot be quietly bypassed by somebody adding a token read in a hurry.'),

    code('ts', `
import * as SecureStore from 'expo-secure-store';

const ACCESS = 'auth.access';
const REFRESH = 'auth.refresh';

export const tokens = {
  async save(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS, access, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    await SecureStore.setItemAsync(REFRESH, refresh, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  get: () => Promise.all([
    SecureStore.getItemAsync(ACCESS),
    SecureStore.getItemAsync(REFRESH),
  ]),
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
  },
};
`),

    h3('Choose the accessibility level deliberately'),
    p('The option above restricts the value to this device and requires the device to be unlocked. That prevents a token being restored onto a different phone from a backup, which is usually what you want for a credential. The permissive default — available always, migratable — is convenient and weaker.'),

    h3('Decide what happens on reinstall'),
    p('On iOS, Keychain items can survive an app being deleted and reinstalled, which surprises people when a fresh install is already logged in. Whether that is a feature or a bug depends on the product, and it should be a decision rather than a discovery. Clearing secure storage on first launch after install is the usual fix.'),

    h3('Handle the failure case'),
    p('Secure storage can fail — a device in a strange state, an OS bug, a value that cannot be decrypted after a restore. The app should treat that as logged out rather than crashing, because a crash loop on launch is unrecoverable without a reinstall.'),

    h2('What should the token lifecycle look like?'),
    p('Short access tokens, a long refresh token, and refresh handled in exactly one place.'),
    p('The standard arrangement applies on mobile with one important difference: sessions should last far longer than on the web. Re-authenticating a phone every fortnight is a poor experience for an app people expect to open and use immediately, and it pushes users toward weaker passwords rather than improving anything.'),

    h3('Refresh belongs in the API client'),
    p('One interceptor that catches an expired-token response, refreshes once, and retries the original request. Implementing this per call site produces a race where five concurrent requests each trigger a refresh, four of them fail against a rotated token, and the user is logged out for no reason.'),

    code('ts', `
let refreshing: Promise<string> | null = null;

async function withAuth(request: () => Promise<Response>) {
  let res = await request();
  if (res.status !== 401) return res;

  // Everybody waits on the same refresh, not their own.
  refreshing ??= doRefresh().finally(() => { refreshing = null; });
  await refreshing;
  return request();
}
`),

    h3('Rotate refresh tokens and detect reuse'),
    p('Issuing a new refresh token on each use, and treating the reappearance of an old one as a compromise signal, is what makes a long-lived session defensible. Without rotation, a stolen refresh token is effectively permanent access.'),

    h3('Give the user a way to see and end sessions'),
    p('A list of active devices with the ability to revoke one is both a genuine security control and increasingly expected. It also gives you a way to respond to a compromised device without invalidating everybody.'),

    h3('Never put anything sensitive in the token payload'),
    p('A JWT is signed, not encrypted, and anybody holding it can read its contents. Roles and identifiers are fine; anything you would not want visible is not — which is [the same rule as anywhere else](/blog/role-based-auth-nextjs-express), and easier to forget when the token is only ever handled by your own app.'),
    img('refresh-race', 'Several concurrent requests waiting on a single credential renewal rather than each starting one', 'Five concurrent requests each triggering their own refresh is how users get logged out at random. One promise, everybody waits.'),

    h2('What about biometrics?'),
    p('Useful as a gate on an existing session, not as an authentication method.'),
    p('The common misunderstanding is that Face ID or a fingerprint authenticates the user to your server. It does not — it authenticates them to the device, and what your app learns is that the person holding the phone is its owner. The correct use is to require that check before releasing a token from secure storage.'),

    h3('Bind the token to the biometric check'),
    p('Both platforms allow a stored item to require biometric confirmation before it is returned. That is meaningfully stronger than checking biometrics and then reading an unprotected value, because the second can be bypassed by anything that can read the store directly.'),

    h3('Always keep a fallback'),
    p('Biometrics fail — a wet finger, a mask, a sensor fault, a user who never enrolled. A passcode or password path must exist, and an app that locks somebody out because a sensor is dirty is a support problem rather than a security feature.'),

    h3('Re-check when the risk changes'),
    p('Requiring biometric confirmation for a sensitive action — a payment, changing an email, viewing stored details — is proportionate. Requiring it for every app launch of a habit tracker is friction with no threat model behind it.'),

    h3('Watch for enrolment changes'),
    p('If a new fingerprint or face is enrolled on the device, the platform can invalidate keys tied to biometrics. That is a deliberate protection against somebody adding their own biometric to a stolen phone, and the app needs to handle the resulting failure by falling back rather than breaking.'),

    img('biometric-gate', 'A stored credential released only after a device-level identity check succeeds', 'Biometrics authenticate the user to the device, not to your server. Bind the token release to the check, not just the screen.'),

    h2('What happens when the app is backgrounded?'),
    p('More than people expect, and a couple of it is worth handling explicitly.'),
    p('A mobile app spends most of its life suspended, and the transitions in and out are where several small security details live. None of them are dramatic and all of them are cheap to address once you know they exist.'),

    h3('The app switcher takes a screenshot'),
    p('Both platforms capture the current screen when an app is backgrounded, to show in the task switcher, and that image is stored on disk. For a screen showing account details or a document, obscuring the view on the way out is a one-line change that prevents the snapshot containing anything sensitive.'),

    h3('Decide whether to re-lock on return'),
    p('For a banking or health app, requiring a biometric check after a period in the background is proportionate and expected. For most apps it is friction, and the right answer is a timeout long enough that ordinary switching between apps does not trigger it.'),

    h3('Requests in flight may not complete'),
    p('A token refresh interrupted by suspension can leave the app in an ambiguous state — the server may have rotated the token, the client may not have received it. Retrying on foreground with the stored refresh token, and treating a failure as logged out rather than crashing, is what keeps that recoverable.'),
    img('background-state', 'An application suspended mid-operation with its current screen captured for the task switcher', 'The task switcher stores a screenshot on disk. Obscuring a sensitive screen on the way out is one line.'),

    h2('What does logging out have to clear?'),
    p('More than the token, and this is where real leaks happen.'),
    p('A web logout is largely a cookie. A mobile logout has to clear several stores, and missing any of them leaves one user\'s data accessible to the next person who opens the app — which on a shared, resold or repaired device is a genuine incident rather than a theoretical one.'),
    ol([
      '**Secure storage** — access and refresh tokens.',
      '**The local database** — any cached user records, [including an offline-first store](/blog/react-native-offline-first).',
      '**Cached images and files** — profile photos, downloaded documents.',
      '**In-memory state** — stores and query caches that survive a navigation reset.',
      '**Push token registration** — unbind on the server, or notifications follow the device.',
      '**Analytics identity** — reset it, or the next user is attributed to the previous one.'],
    ),
    p('The fifth is the one that produces a privacy complaint. A device still registered to a previous user will deliver their notifications to whoever holds the phone, and the content of a notification is often enough to matter.'),

    h3('Make logout a single function'),
    p('Every one of those steps in one place, called from everywhere logout can happen — the button, a forced logout after token revocation, an account deletion. Partial logouts come from having three code paths and only maintaining one.'),

    h3('Test it by logging in as somebody else'),
    p('The reliable check is to log out and log in as a different user, then look for anything from the previous session. Stale cached content appearing under a new account is exactly the failure this prevents, and it is easy to miss when you always test with one account.'),
    img('logout-scope', 'Several distinct stores all requiring clearance rather than a single credential', 'A web logout is mostly a cookie. Miss any of these on a device and the next person to open the app inherits a session.'),

    h2('What else is specific to mobile?'),
    p('Four things that have no direct web equivalent.'),

    h3('The binary is readable'),
    p('Anything compiled into the app can be extracted, including strings in the JavaScript bundle. API keys with real privileges do not belong in a mobile app under any storage scheme — they belong on a server the app calls. This catches people because the same pattern is harmless for a public analytics key.'),

    h3('Certificate pinning is available and double-edged'),
    p('Pinning the expected server certificate defeats interception on a compromised device, and it also means a certificate rotation you forgot about breaks every installed app until users update. For most products the risk of the second outweighs the benefit of the first.'),

    h3('Deep links can carry credentials, and should not'),
    p('A magic-link or OAuth callback arriving via a deep link passes through the operating system and can potentially be intercepted by another app claiming the same scheme. Using verified app links and exchanging a short-lived code rather than a token is the safer pattern — [and deep link handling has its own subtleties](/blog/react-native-deep-linking).'),

    h3('Old versions live on forever'),
    p('A security fix shipped today reaches users over weeks or months, and some never update. That means server-side controls — revocation, rate limiting, validation — carry more weight than on the web, because you cannot rely on the client being current.'),

    img('mobile-specifics', 'Constraints that apply to a distributed binary rather than to a server-rendered client', 'The binary is readable and old versions persist for months. Both push the real controls onto the server.'),

    h2('What does a reasonable setup look like?'),
    p('Six decisions, most of which take an hour.'),
    ul([
      '**Tokens in platform secure storage,** device-only, unlocked-required.',
      '**Short access token, long rotating refresh token,** refreshed in one interceptor.',
      '**Biometric gate** on sensitive actions, binding the token release to the check.',
      '**One logout function** clearing every store, tested by logging in as another user.',
      '**No privileged secrets in the bundle** — anything sensitive is behind your API.',
      '**Server-side revocation** and a visible session list for the user.',
    ]),
    p('None of this is exotic and all of it is easier to build at the start than to retrofit, particularly the logout function — which tends to grow organically into three partial implementations if it is not written once deliberately.'),

    h2('What does it cost?'),
    p('A day, and slightly slower reads at launch.'),
    p('Wrapping secure storage, writing the refresh interceptor, adding a biometric gate and building a complete logout is comfortably a day on a new app. On an existing one the retrofit is longer, mostly because token reads have usually spread to several places and finding them all is the work.'),
    p('The honest counterweight: this protects against a device-level compromise, and for many apps that is a modest threat compared with the ordinary ones — a weak password, a phishing email, an over-permissive API. A habit tracker storing tokens correctly while the server lets any authenticated user read anybody\'s records has secured the wrong end. Do this because it is a day and it removes an obvious weakness, but do the server-side authorisation first if you have to choose, because that is where the data actually is.'),
    quote('AsyncStorage is a plain file. Encrypting it with a key stored in the same place is a step, not a protection — the key belongs where the token should have been.'),

    h2('Conclusion'),
    p('AsyncStorage offers no protection beyond the OS sandbox, and the attacks worth defending against are exactly the ones where the sandbox is not intact — a rooted device, an extracted backup, a phone handed to a stranger. Keychain and Keystore exist for credentials and are usually hardware-backed.'),
    p('Put anything that lets somebody act as the user in secure storage and leave everything else where it is convenient, since secure reads are slower. Go through one wrapper module so the decision is made once, choose the accessibility level deliberately — device-only and unlocked-required is the sensible default — and decide explicitly whether tokens should survive a reinstall.'),
    p('Use short access tokens with a long, rotating refresh token, and handle refresh in a single interceptor where concurrent requests wait on one promise. Per-call-site refresh produces a race that logs people out at random. Detect refresh-token reuse as a compromise signal, and give users a visible list of sessions they can revoke.'),
    p('Treat biometrics as a gate on an existing session rather than as authentication, bind the token release to the check rather than checking and then reading freely, always keep a fallback path, and handle the platform invalidating keys when enrolment changes.'),
    p('Then write logout once, clearing secure storage, the local database, cached files, in-memory state, the push registration and the analytics identity — and test it by logging in as somebody else. Remember the binary is readable, so no privileged secrets ship in it, and old versions persist for months, so server-side revocation and authorisation carry the real weight. If you want this set up properly on a build, [it is part of how I ship](/services).'),
  ),
  faqs: faq([
    ['Is AsyncStorage safe for auth tokens?',
     'No. It is an unencrypted file in the app’s data directory, protected only by the OS sandbox — which is exactly what fails on a rooted or jailbroken device, in an extracted backup, or under a privilege-escalation exploit. Use SecureStore, backed by Keychain or Keystore, for anything credential-shaped.'],
    ['Does encrypting AsyncStorage solve the problem?',
     'Only if the encryption key lives somewhere safer than the data, and if it is in AsyncStorage too you have added a step rather than a protection. The key belongs in platform secure storage — at which point storing the token there directly is simpler and equally strong.'],
    ['Why do users get randomly logged out?',
     'Usually a refresh race. Several concurrent requests each hit an expired token and each trigger their own refresh; the rotated token invalidates all but one, and the failures cascade into a logout. Handle refresh in one interceptor where every waiting request awaits the same promise.'],
    ['Does Face ID authenticate the user to my server?',
     'No. It authenticates them to the device, telling your app that the person holding the phone is its owner. Use it as a gate that must pass before secure storage releases a token, and always provide a passcode fallback — sensors fail and not everybody enrols.'],
    ['What does mobile logout need to clear?',
     'Secure storage, the local database, cached images and files, in-memory stores, the push token registration on your server, and the analytics identity. Missing the push registration means a resold or shared device keeps delivering the previous user’s notifications, which is a real incident.'],
  ]),
};
