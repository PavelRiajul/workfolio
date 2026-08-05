import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/app-store-rejections/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-app-store-rejections',
  slug: 'app-store-rejections',
  title: 'The App Store Rejections You Can Avoid',
  category: 'mobile',
  order: 107,
  readTime: '13 min read',
  date: 'July 2026',
  publishedAt: '2026-07-06',
  series: 'Mobile decisions',
  excerpt:
    'Most first submissions are rejected, and most rejections are for the same handful of things. Here they are, with what to do before you submit.',
  coverLabel: 'Store rejections — cover',
  body: body(
    p('The first submission of a new app is rejected more often than not, and that is worth planning for rather than being surprised by. The causes are remarkably consistent — a missing demo account, a permission with no explanation, a subscription that does not disclose its terms, a web view pretending to be an app.'),
    p('None of these are hard to avoid. They are avoided by knowing about them before the submission rather than after, which is the entire purpose of this post. A rejection costs a day or two of turnaround plus whatever the fix takes, and on a launch with a marketing date attached that delay is expensive in a way the fix itself is not.'),
    p('What follows is the list I check before submitting anything, the differences between the two stores, and how to handle a rejection when one arrives anyway.'),

    h2('Why is review stricter than people expect?'),
    p('Because the stores are curating a catalogue, not just checking for malware.'),
    p('Both platforms review for security, privacy, functionality and a broad notion of quality, and the last one is where judgement enters. An app can be technically perfect and be rejected for offering too little, for duplicating something that already exists, or for feeling like a repackaged website. That subjectivity is frustrating and it is the actual policy.'),
    p('Apple\'s review is more thorough and more human, with a wider range of judgement-based outcomes. Google\'s is more automated and generally faster, with the sharper edge being policy enforcement after publication — an app can go live and be removed later, which is a worse failure mode than a rejection.'),
    table('The two processes, roughly', [
      ['', 'Apple', 'Google'],
      ['Review time', 'Usually 24–48 hours', 'Often faster, variable'],
      ['Style', 'Human, judgement-based', 'More automated'],
      ['Common rejection', 'Guideline interpretation', 'Policy and declarations'],
      ['Appeal', 'Resolution Center, responsive', 'Form-based, slower'],
      ['Post-publication risk', 'Lower', 'Higher — removals happen'],
    ]),
    p('The bottom row is the one to internalise if you have only shipped on one platform. A Google publication is not a guarantee of permanence in the way an Apple approval largely is.'),

    h3('Budget review time into the launch plan'),
    p('A launch date that assumes approval on the first attempt is a launch date at risk. Submitting a week early, with the release scheduled rather than automatic, converts a rejection from a crisis into an inconvenience.'),
    img('two-processes', 'Two review pathways differing in how much human judgement is applied and when', 'Apple rejects more at review; Google removes more after publication. The second is the worse failure mode.'),

    h2('What causes most rejections?'),
    p('Six things, and between them they cover the large majority of first submissions.'),
    ol([
      '**No working demo account** for an app behind a login, so the reviewer cannot see anything.',
      '**Permissions requested without explanation,** or with a generic one that says nothing.',
      '**Subscription terms not disclosed** where the user actually subscribes.',
      '**An app that is essentially a website** in a native container.',
      '**Incomplete or inaccurate privacy declarations** about what data is collected.',
      '**Crashes or broken features** the reviewer hit within the first few minutes.'],
    ),
    p('The first is the single most common and the most avoidable. A reviewer who cannot get past your login has seen nothing of the app, and the only available outcome is rejection.'),

    h3('Give the reviewer everything'),
    p('A demo account that works, is not rate-limited, has realistic data in it, and does not expire. Plus notes explaining anything non-obvious — where to find a feature, what a code does, how to trigger a flow that needs external input. Reviewers are working through many apps and will not hunt.'),

    h3('Test the demo account yourself, that day'),
    p('An account created during development that has since been cleaned up, or a staging environment that was reset, is a rejection you handed over. Logging in with exactly the credentials you submitted, on the build you submitted, takes two minutes.'),

    h2('How should permissions be handled?'),
    p('Asked at the point of use, with a specific reason, and never on launch.'),
    p('Both platforms scrutinise permissions and both want a clear justification for each. The purpose strings on iOS are read by reviewers and by users, and a generic one — "this app needs access to your camera" — is a common rejection reason because it explains nothing about why.'),

    code('json', `
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription":
        "Take a photo of your meal to attach it to a food log entry.",
      "NSPhotoLibraryUsageDescription":
        "Choose an existing photo to attach to a log entry."
    }
  }
}
`),

    h3('Remove permissions you do not use'),
    p('A declared permission with no corresponding functionality is a rejection, and it happens routinely because a library pulled it in or a feature was cut without removing its declaration. Auditing the final manifest against what the app actually does catches it.'),

    h3('Ask in context, not at startup'),
    p('A permission requested when the feature is used is both better received by users and expected by reviewers. A stack of prompts on first launch reads as harvesting, and it [also destroys your acceptance rate](/blog/push-notifications-reliability).'),

    h3('Handle refusal gracefully'),
    p('An app that becomes unusable when a permission is declined will be tested exactly that way. Every permission needs a path where the user says no and the app still functions in a reduced form, and reviewers do check this.'),

    h2('What about payments and subscriptions?'),
    p('This is where rejections become expensive, because the rules are strict and specific.'),
    p('Digital goods and services consumed within the app must use the platform\'s billing, and taking payment another way for that content is a serious violation rather than a technicality. Physical goods and services delivered outside the app are the opposite — those must not use platform billing.'),

    h3('Disclose everything on the paywall'),
    p('The price, the period, what happens at the end of a trial, and how to cancel — all visible on the screen where somebody subscribes, not behind a link. Missing any of these is one of the most frequent subscription rejections.'),

    h3('Link to terms and privacy from the paywall'),
    p('Both stores require these to be reachable from the purchase screen. It is a two-line change and it is missed constantly, because the links exist elsewhere in the app and nobody checked that they exist here.'),

    h3('Include a restore purchases option'),
    p('Users reinstall and change devices, and an app that cannot restore an existing subscription is rejected. It is a required control, not a courtesy.'),

    h3('Do not point users to your website to pay'),
    p('For digital content, directing users off-platform to avoid commission is explicitly against the rules and is enforced. The regulatory position has been shifting and the safe assumption during a review is still the strict one — [a factor worth weighing when choosing app versus web](/blog/app-vs-pwa) in the first place.'),
    img('paywall', 'A subscription screen carrying price, period, renewal terms and required links in one place', 'Price, period, trial behaviour, cancellation, and links to terms — all on the paywall itself, not behind a link elsewhere.'),

    img('demo-account', 'A review path blocked at a login screen with no way through', 'The most common rejection, and the most avoidable. Realistic data, no expiry, no rate limit, and tested on the day.'),

    h2('Why do web-view apps get rejected?'),
    p('Because a website in a container offers nothing the browser did not, and the stores say so explicitly.'),
    p('Apple\'s guidelines are direct about apps that are simply a repackaged website, and this is a common rejection for a certain kind of quick build. The test applied is roughly whether the app does anything a mobile browser could not, and if the answer is no, it does not belong in the catalogue.'),

    h3('Native navigation is not enough on its own'),
    p('Wrapping web content in a native tab bar does not change the substance. What helps is genuine platform integration — offline capability, notifications, camera, biometrics, widgets — things that make it an app rather than a shell.'),

    h3('Hybrid done deliberately is fine'),
    p('A native app that renders certain screens as web content — a help centre, terms, a frequently changing catalogue — is a normal architecture and passes review. The distinction reviewers apply is whether the app is native with web parts or a website with a wrapper.'),

    h3('Minimum functionality applies to thin apps too'),
    p('An app that is a single form, a link list or a brochure is rejected under the same principle even if it is fully native. The catalogue is curated, and "this could be a web page" is a judgement reviewers are explicitly asked to make.'),

    h2('What do the privacy declarations require?'),
    p('An accurate account of every piece of data collected, including by your dependencies.'),
    p('Both stores require a declaration of what data the app collects, how it is used and whether it is linked to identity. The part that catches people is that this includes data collected by SDKs — an analytics library, a crash reporter, an advertising integration — and an inaccurate declaration is treated as a misrepresentation rather than an oversight.'),

    h3('Audit your dependencies, not just your code'),
    p('Most apps declare what the team wrote and forget what the libraries collect. Every third-party SDK publishes what it gathers, and reading those before filling in the form is the only way to make the declaration true.'),

    h3('The privacy policy must be reachable and real'),
    p('A live URL, accurate to what the app actually does, reachable from the store listing and from inside the app. A placeholder page or a policy describing a different product is a straightforward rejection.'),

    h3('Account deletion is required'),
    p('An app that lets users create an account must let them delete it, from within the app, without emailing support. This became a hard requirement and it still catches apps built before it, or built by teams who assumed a support process was sufficient.'),

    h3('Declare tracking honestly'),
    p('Combining data across apps or with data brokers is tracking and requires the relevant permission and declaration. Getting this wrong is among the more serious findings, because it is a truthfulness issue rather than a quality one.'),
    img('privacy-audit', 'Data collection assessed across an application and every dependency it includes', 'The declaration covers what your SDKs collect, not just your own code. An inaccurate one is treated as misrepresentation.'),

    h2('What else gets caught?'),
    p('A handful of smaller things that are trivial to fix and easy to miss.'),

    h3('Crashes on the reviewer\'s device'),
    p('Reviewers test on a range of devices and OS versions, including older ones and the newest beta. A crash on launch on a device family you never tested is an immediate rejection, and testing on the oldest OS you claim to support catches most of it.'),

    h3('Placeholder content and broken links'),
    p('Lorem ipsum in a settings screen, a support link pointing nowhere, a menu item that does nothing. These read as unfinished and they are noticed.'),

    h3('Screenshots that do not match the app'),
    p('Marketing screenshots showing features that do not exist, or a different design entirely, are treated as misleading. They should be actual captures from the submitted build.'),

    h3('Sign in with Apple, when offering third-party login'),
    p('If the app offers Google or Facebook sign-in on iOS, Apple\'s equivalent is generally required alongside. This one is caught late constantly, usually the day before a launch.'),

    h3('Age rating and content declarations'),
    p('User-generated content requires moderation, reporting and blocking. An app allowing people to post to each other without any of those is rejected, and adding them properly is more than an afternoon.'),

    h2('What do you do when rejected?'),
    p('Read it carefully, fix or explain, and reply promptly — most rejections resolve within a day or two.'),
    p('A rejection is a conversation rather than a verdict. Apple\'s Resolution Center is genuinely responsive, and a clear explanation of why a reviewer\'s interpretation does not apply is often accepted. Teams frequently rebuild features they did not need to change because they treated the first message as final.'),

    h3('Work out whether it is a misunderstanding'),
    p('A significant share of rejections are the reviewer not finding or not understanding something. If the feature exists and works, the fix is better reviewer notes and a screen recording rather than a code change.'),

    h3('Reply specifically, not defensively'),
    p('Address the exact guideline cited, describe what you changed or why it does not apply, and include evidence. Arguing about the policy generally goes nowhere; explaining your app clearly usually works.'),

    h3('Escalate when you are genuinely right'),
    p('Both platforms have appeal paths beyond the initial reviewer, and they are worth using for a decision that is plainly mistaken. It is slower and it exists for exactly this case.'),

    h3('Record what each rejection was for'),
    p('A short note per rejection — the guideline cited, what actually caused it, what resolved it — turns the second submission of the next app into a much shorter process. Most teams ship several apps or several major updates, and the same guidelines recur.'),

    h3('Keep the fix minimal'),
    p('Resubmitting with the requested fix plus three unrelated changes reopens the whole review surface. Fix what was raised, ship it, and let the other work go in the next release.'),
    img('resolution', 'A rejection treated as an exchange leading to clarification rather than as a final verdict', 'A large share of rejections are the reviewer not finding something. Better notes and a screen recording often beat a code change.'),

    img('small-catches', 'Minor unfinished details that a reviewer encounters within the first few minutes', 'Placeholder text, a dead support link, a menu item that does nothing. Each is trivial to fix and each reads as unfinished.'),

    h2('What is the pre-submission checklist?'),
    p('Fifteen minutes, and it removes most of the risk.'),
    ul([
      '**Demo account** tested today, on the submitted build, with realistic data and no expiry.',
      '**Reviewer notes** explaining anything non-obvious, with a screen recording of the main flow.',
      '**Every permission** has a specific purpose string and a graceful refusal path.',
      '**No unused permissions** in the final manifest.',
      '**Paywall** shows price, period, trial terms, cancellation, restore, and links to terms and privacy.',
      '**Privacy declarations** match the app and every SDK it includes.',
      '**Account deletion** available in the app.',
      '**Tested on the oldest supported OS** and on a low-end device.',
      '**No placeholder content,** and every link resolves.',
      '**Screenshots** captured from the build being submitted.',
    ]),
    p('That list is worth keeping in the repository and working through deliberately, in the same spirit as [any release checklist](/blog/project-handover-checklist) — the value is that it is boring and complete rather than remembered.'),

    h2('What does it cost?'),
    p('A day of preparation, against a rejection cycle that costs several.'),
    p('Writing purpose strings, preparing a demo account, recording a walkthrough, auditing permissions and filling privacy declarations accurately is most of a day for a first submission and an hour for subsequent ones. A rejection costs the turnaround plus the fix plus, if there is a launch date, whatever the delay does to the plan around it.'),
    p('The honest counterweight: none of this makes approval certain. Review involves human judgement, the same app can be rejected by one reviewer and approved by another, and guidelines are reinterpreted over time. The checklist removes the predictable failures, which is most of them — but a launch plan that treats approval as guaranteed on a fixed date is fragile regardless of how well prepared you are. Submit early, schedule the release manually, and keep a few days of slack.'),
    quote('A reviewer who cannot get past your login has seen nothing of your app, and the only outcome available to them is rejection.'),

    h2('Conclusion'),
    p('Most first submissions are rejected and most rejections come from the same short list: no working demo account, permissions without specific explanations, undisclosed subscription terms, an app that is really a website, inaccurate privacy declarations, and something broken that the reviewer hit early.'),
    p('Give the reviewer everything — an account that works on the submitted build with realistic data, notes explaining anything non-obvious, and a screen recording of the main flow. Test those credentials yourself the day you submit, because a cleaned-up development account is a rejection you handed over.'),
    p('Write purpose strings that say why rather than what, ask at the point of use rather than on launch, remove permissions the app no longer uses, and make sure every refusal path leaves the app functional. On the paywall, show price, period, trial behaviour and cancellation, include restore purchases, and link terms and privacy from that screen specifically.'),
    p('Declare privacy accurately including what your SDKs collect, provide in-app account deletion, and test on the oldest OS you claim to support. Then treat a rejection as a conversation — a large share are the reviewer not finding something, where better notes beat a code change, and resubmitting with unrelated extra work reopens the whole review.'),
    p('Above all, plan for it. Submit a week early with the release scheduled rather than automatic, and keep the checklist in the repository so it is worked through rather than remembered. Approval is never guaranteed, but the predictable failures are most of them. If you want an app taken through submission without the avoidable rounds, [that is part of shipping it](/services).'),
  ),
  faqs: faq([
    ['What is the most common reason apps get rejected?',
     'A demo account that does not work, for any app behind a login. A reviewer who cannot get in has seen nothing and rejection is the only outcome available. Test the exact credentials you submitted, on the exact build, on the day you submit — it takes two minutes.'],
    ['Why was my app rejected for being a website?',
     'Both stores decline apps that are essentially a repackaged site in a native container, because they offer nothing a mobile browser could not. Wrapping web content in native tabs does not change the substance — genuine platform integration like offline, notifications or camera does.'],
    ['What has to be on a subscription paywall?',
     'The price, the billing period, what happens when a trial ends, how to cancel, a restore purchases option, and links to your terms and privacy policy — all on that screen rather than elsewhere in the app. Missing links from the paywall is one of the most frequent subscription rejections.'],
    ['Do privacy declarations cover third-party SDKs?',
     'Yes, and this is what catches most teams. Analytics libraries, crash reporters and advertising integrations all collect data on your behalf and must be declared. An inaccurate declaration is treated as a misrepresentation rather than an oversight, which is a more serious finding.'],
    ['What should I do when my app is rejected?',
     'Read the cited guideline carefully and work out whether it is a genuine issue or the reviewer not finding something — a large share are the latter, where better notes and a screen recording resolve it. Reply specifically with evidence, fix only what was raised, and resubmit promptly.'],
  ]),
};
