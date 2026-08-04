import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/accessible-forms/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-accessible-forms',
  slug: 'accessible-forms',
  title: 'Forms That Work Without a Framework',
  category: 'frontend',
  order: 72,
  readTime: '13 min read',
  date: 'September 2026',
  publishedAt: '2026-09-26',
  series: 'Foundations',
  excerpt:
    'Labels, error announcement, autocomplete and the keyboard a phone shows — the plain HTML most form libraries reimplement badly.',
  coverLabel: 'Accessible forms — cover',
  body: body(
    p('Most form problems are solved by HTML that has existed for twenty years and gets replaced by JavaScript that does it worse. A `<label>` associated with an input, a `required` attribute, the right `type` and `autocomplete` — that is most of an accessible form before any library is involved.'),
    p('What libraries genuinely add is state management for complex multi-step flows. What they frequently subtract is native validation, the browser\'s autofill, the correct mobile keyboard, and the ability to submit with the keyboard — because a `<div onClick>` is not a button.'),
    p('This is the baseline I build every contact and signup form on, which on this site is plain HTML with a small amount of script for the parts HTML genuinely does not cover.'),

    h2('What does the label actually do?'),
    p('Three things, and only one of them is announcing the field name.'),
    p('An associated label is read by a screen reader when the field receives focus, it extends the click target to include the text, and it tells assistive technology which of several fields an error belongs to. A placeholder does none of these — and it disappears the moment somebody types, so the person who paused mid-form no longer knows what they were filling in.'),
    code('html', `
<!-- Explicit association: the for attribute matches the id. -->
<label for="email">Email address</label>
<input id="email" name="email" type="email" autocomplete="email" required>
`),
    p('Wrapping the input inside the label works too and needs no ids, which is convenient — but explicit `for`/`id` is more robust when styling puts elements in different containers, and it is what I default to.'),

    h3('Never use a placeholder as the label'),
    p('It is low contrast by default, it vanishes on input, it cannot be translated by some tools, and it is announced inconsistently. If a field is important enough to have a name, it is important enough for that name to stay visible.'),

    h3('Placeholders are for format hints, and often not even then'),
    p('`+880 1XXX XXXXXX` in a phone field is a reasonable placeholder. A better version is a small hint below the label, associated with `aria-describedby`, which stays visible while typing — which is exactly when somebody needs to know the format.'),

    h2('Which input type and autocomplete?'),
    p('The pair that determines whether a phone shows the right keyboard and whether the browser can fill the field.'),
    table('The combinations worth memorising', [
      ['Field', 'type', 'autocomplete'],
      ['Email', 'email', 'email'],
      ['Phone', 'tel', 'tel'],
      ['Full name', 'text', 'name'],
      ['Company', 'text', 'organization'],
      ['One-time code', 'text with inputmode="numeric"', 'one-time-code'],
      ['New password', 'password', 'new-password'],
      ['Current password', 'password', 'current-password'],
    ]),
    p('`type="email"` gives a keyboard with an `@` key. `type="tel"` gives a number pad. Getting these wrong forces somebody to switch keyboard layouts mid-field, which is a small friction repeated on every form they meet.'),

    h3('autocomplete is not a convenience feature'),
    p('For somebody using a password manager, a switch-access device, or simply typing on a phone in a hurry, autofill is the difference between a form taking five seconds and forty. The attribute is one token from a defined list and it is the highest-value character-per-benefit change available in a form.'),

    h3('Distinguish new-password from current-password'),
    p('It tells a password manager whether to offer a saved credential or to generate one. Without it, signup forms get autofilled with an existing password and generation is never offered, which quietly pushes people toward reuse.'),

    h3('inputmode when type is wrong'),
    p('A numeric code should not be `type="number"` — that brings spinner arrows, strips leading zeros and allows exponent notation. `type="text"` with `inputmode="numeric"` gives the number pad without the semantics of a quantity.'),
    img('keyboard-match', 'Different on-screen keyboards presented for different declared field types', 'The type attribute decides which keyboard a phone shows. Getting it wrong is friction on every field, every time.'),

    h2('How should validation actually work?'),
    p('Native constraints first, custom messages second, and never validate somebody as they type a field for the first time.'),
    p('The browser already knows an email is malformed and a required field is empty. Using `required`, `type`, `minlength` and `pattern` means validation works before any script loads, and script can then improve the messages rather than provide them.'),

    p('Suppressing the browser\'s own bubble while keeping its logic is the usual arrangement: call `preventDefault` on the invalid event, read `validity` to find out which constraint failed, and render your own message in your own markup. You get the browser\'s parsing and your design, rather than reimplementing email validation with a regular expression that will be subtly wrong.'),

    h3('Validate on blur, not on keystroke'),
    p('Marking a field invalid while somebody is still typing it tells them they are wrong before they have finished being right. Validate when they leave the field, and once a field has been marked invalid, re-validate on input so the error clears as soon as it is fixed.'),

    h3('Errors need to be announced, not just shown'),
    p('A red border and a message below the field is invisible to a screen reader unless the association is explicit. Three attributes make it work.'),
    code('html', `
<label for="email">Email address</label>
<input id="email" type="email" aria-describedby="email-err" aria-invalid="true" required>
<p id="email-err" class="err">Enter an email address like name@example.com</p>
`),
    p('`aria-invalid` says this field is wrong; `aria-describedby` links it to the text that explains why. Without the second, a screen reader announces "invalid" with no indication of what to do about it.'),

    h3('Summarise on submit, and move focus'),
    p('When a submission fails, put a summary at the top listing each problem as a link to its field, and move focus to that summary. Otherwise focus stays on the submit button and a screen reader user is told nothing happened — the errors are further up the page where nothing directed them.'),

    h2('What makes an error message useful?'),
    p('Saying what to do, in the field\'s own terms, without blaming anybody.'),
    ul([
      '**"Enter an email address like name@example.com"** rather than "Invalid email". One shows the shape; the other restates the failure.',
      '**"Passwords need at least 8 characters"** rather than "Password too short". The first is a rule; the second is a verdict.',
      '**"Choose a date in the future"** rather than "Invalid date". It names the actual constraint.',
      '**Never "This field is required"** on a field the person can see is empty. Say what goes in it.',
    ]),
    p('The pattern across all four: describe the target state, not the failed one. Somebody stuck in a form is trying to work out what you want, and an error that only tells them what they did wrong leaves them guessing.'),

    img('error-shape', 'A field paired with a corrective instruction rather than a verdict', 'Describe the target state, not the failure. Somebody stuck in a form is working out what you want.'),

    h3('Put the message where the eye already is'),
    p('Below the field, before the next one. A message at the top of the form for a field halfway down means scrolling back and forth, and on a phone the field and its error can end up on different screens.'),

    h2('What about the submit button?'),
    p('It should be a `<button type="submit">` inside a `<form>`, which sounds too obvious to state and is wrong on a large share of forms.'),
    p('A real submit button inside a real form gives you Enter-to-submit from any field, native validation firing before your handler, and a control that is focusable and announced correctly — all of which have to be reimplemented, usually incompletely, when the button is a styled `div`.'),

    h3('Disabling it during submission needs care'),
    p('Preventing a double submission is right; disabling the button the moment it is clicked moves focus nowhere and a screen reader loses its place. Better to keep it focusable, change the label to "Sending…", and set `aria-busy` on the form.'),

    h3('Never disable it until the form is valid'),
    p('A permanently disabled button with no explanation is a dead end — the person cannot tell what is missing and cannot trigger the validation that would say. Let them submit, then show them what needs fixing.'),

    h3('Say what happened afterwards'),
    p('A success message that appears silently is invisible to anyone not watching that region. Put it in a container with `role="status"` so it is announced, and move focus to it if the form is replaced.'),
    img('submit-states', 'A control moving through its resting, working and completed appearances', 'Keep it focusable while working. Disabling on click moves focus nowhere and loses a screen reader\'s place.'),

    h2('What does mobile need specifically?'),
    p('Four things, and they are the difference between a form that gets completed on a phone and one that gets abandoned.'),

    h3('44px targets, including the inputs'),
    p('Fields, checkboxes, radios and the submit button all need to clear the touch minimum. Checkboxes are the usual offender — a 16px box with a label beside it is a 16px target unless the label is part of it, which is another reason for the association.'),

    h3('The keyboard covers the bottom of the screen'),
    p('A submit button fixed to the bottom, or simply near it, can end up underneath the keyboard while a field is focused. Check the form with a field focused rather than at rest — this is [the same class of problem as fixed chrome](/blog/mobile-hero-viewport) and it is invisible in a desktop emulator.'),

    h3('Ask for less'),
    p('The cheapest accessibility improvement to any form is deleting a field. Every one is a chance to make a mistake, a decision about whether to bother, and on a phone another keyboard interaction. A contact form asking for company, role, budget and timeline before a conversation has started is asking for four reasons to close the tab.'),

    h3('One column, always'),
    p('Two fields side by side at 375px are two cramped fields. The only common exception is a pair that is genuinely one value, like expiry month and year, and even then the pair should be wide enough to type into comfortably.'),

    h3('Do not turn off zoom to stop the input jump'),
    p('iOS zooms when focusing an input under 16px. The fix is 16px inputs, not `user-scalable=no` — disabling zoom breaks the page for anybody who needs to magnify it, which is a far larger group than people annoyed by the jump.'),

    h2('How do you group related fields?'),
    p('With a `<fieldset>` and a `<legend>`, which is the one piece of native form structure people avoid because it is awkward to style.'),
    table('When grouping is required, not optional', [
      ['Situation', 'Why grouping matters'],
      ['A set of radio buttons', 'The question itself has no label without one'],
      ['Checkboxes answering one question', 'Same — each box is an option, not the question'],
      ['A billing versus delivery address', 'Two "Postcode" fields need distinguishing'],
      ['A multi-part date or code', 'Three inputs, one value'],
    ]),
    p('The radio case is the clearest. Each button has a label for its option — "Email", "Phone", "WhatsApp" — but nothing states the question those options answer. A screen reader announces "Email, radio button, one of three" with no idea what is being chosen. The legend supplies it.'),
    code('html', `
<fieldset>
  <legend>How should we reply?</legend>
  <label><input type="radio" name="reply" value="email"> Email</label>
  <label><input type="radio" name="reply" value="phone"> Phone</label>
</fieldset>
`),

    h3('Style the legend rather than replacing it'),
    p('Legends have unusual default rendering, which is why people reach for a heading instead. A heading has no association with the group — it is just text nearby. Restyle the legend; do not swap it for something that looks the same and means nothing.'),

    h3('Do not wrap the whole form in one fieldset'),
    p('A fieldset around everything with a legend of "Contact form" adds an announcement before every field and groups nothing. Group the sets that answer one question; leave standalone fields alone.'),
    img('field-grouping', 'Several related options bounded together beneath a single question', 'Each radio has a label for its option. Without a legend, nothing states the question they answer.'),

    h2('What do you actually need script for?'),
    p('Less than expected. Four things, and each is an enhancement over something that already works.'),
    ol([
      '**Better messages** than the browser defaults, using `setCustomValidity` or your own rendering off the constraint API.',
      '**Submitting without navigation,** so the page does not reload — with a fallback that still works if the script fails.',
      '**Cross-field rules** the browser cannot express, like "end date after start date".',
      '**Progressive enhancements** — character counters, conditional fields, saving a draft.',
    ]),
    p('Everything else — required, format, focus order, keyboard submission, autofill — is already there. The test for whether a form is built on solid ground: disable JavaScript and try to submit it. If nothing happens, the script is not enhancing the form, it *is* the form.'),

    h3('Keep the server as the real validator'),
    p('Client-side validation is a convenience for the person filling it in and provides no guarantee at all — anything can post to your endpoint. [Parse the payload with a schema](/blog/validating-llm-tool-calls-zod) server-side and treat the client rules as a nicety on top.'),

    h3('Spam protection without a puzzle'),
    p('A honeypot field hidden from people and a timing check catch most automated submissions with no interaction cost, and they do not fail for anyone using assistive technology. Reach for a challenge widget only when those stop being enough.'),
    img('js-boundary', 'A working baseline with a smaller layer of improvements above it', 'Disable script and submit. If nothing happens, the script is not enhancing the form — it is the form.'),

    h2('How do you test one?'),
    p('Four passes, none of which need tooling beyond a browser.'),

    h3('Keyboard only'),
    p('Put the mouse down entirely for this one — it is the pass most people think they have done and have not.'),
    p('Tab through from the top. Every field reachable, focus visible at every stop, order matching the visual layout, and Enter submitting from any field. If focus jumps somewhere unexpected, the DOM order and the visual order disagree.'),

    img('four-passes', 'A form checked from four different directions of use', 'None of these need tooling. The phone pass finds the most and is done the least.'),

    h3('With a screen reader'),
    p('Ten minutes with VoiceOver or NVDA finds more than any automated check. Listen for whether each field announces its name, whether required is conveyed, and whether an error is read when it appears.'),

    h3('With autofill'),
    p('It is the only one of the four that produces a number you can act on directly.'),
    p('Trigger the browser\'s saved-address fill and see how much lands correctly. Fields that stay empty are missing or wrong `autocomplete` values, and that is a direct measure of how much work you are asking of everybody.'),

    h3('On a phone, with the keyboard open'),
    p('Focus each field, check the keyboard matches the type, and check the submit button is reachable without dismissing it. This is the pass most likely to find something and least likely to be done.'),
    quote('The test is whether the form works with JavaScript off. If it does, everything you add is an improvement rather than a dependency.'),

    h2('What does this cost?'),
    p('Almost nothing on a new form, and it is mostly a matter of not replacing things that already work.'),
    p('Labels, types, autocomplete and native constraints are attributes, not code. The error summary and announcement is perhaps thirty lines. On this site the contact form is plain HTML with a small handler, and it works with script disabled because the form element and the button are real.'),
    p('The honest counterweight: a complex multi-step flow with conditional branches and cross-field dependencies genuinely benefits from a form library, and rebuilding that state management by hand is a poor use of time. The point is not to avoid libraries — it is that the library should sit on top of correct HTML rather than replacing it, and many do not by default.'),

    h2('Conclusion'),
    p('Start with a real `<form>`, real `<label>` elements associated by `for`/`id`, a real `<button type="submit">`, and the correct `type` and `autocomplete` on every field. That is most of an accessible form and none of it is code.'),
    p('Never use a placeholder as a label — it is low contrast, it vanishes on input, and it leaves somebody who paused mid-form without the field name. Put format hints below the label with `aria-describedby` instead, where they stay visible while typing.'),
    p('Validate on blur rather than keystroke, then re-validate on input once a field has failed so the error clears as it is fixed. Announce errors with `aria-invalid` and `aria-describedby`, and on submit put a summary at the top linking to each field — then move focus to it, or the failure is silent.'),
    p('Write messages that describe the target rather than the failure: "Enter an email address like name@example.com" beats "Invalid email" because one shows the shape and the other restates the problem.'),
    p('On mobile, keep 44px targets including checkboxes, use one column, size inputs at 16px so iOS does not zoom — rather than disabling zoom, which breaks the page for people who need it — and test with the keyboard open, because a submit button underneath it is a form nobody completes. Then disable JavaScript and try to submit: if nothing happens, the script is not enhancing the form, it is the form. If you have one that people abandon, [that is usually quick to diagnose](/start).'),
  ),
  faqs: faq([
    ['Can a placeholder replace a form label?',
     'No. It is low contrast by default, disappears the moment somebody types, is announced inconsistently by screen readers, and leaves anyone who paused mid-form without the field name. Use a visible label associated by for/id, and put format hints below it with aria-describedby.'],
    ['Why does iOS zoom in when I focus an input?',
     'Because the input font size is under 16px. Fix it by sizing inputs at 16px, not by adding user-scalable=no — disabling zoom breaks the page for anyone who needs to magnify it, which is a much larger group than people irritated by the jump.'],
    ['How should form errors be announced to screen readers?',
     'Set aria-invalid on the field and aria-describedby pointing at the message element, so the field announces both that it is wrong and what to do. On submit, render a summary at the top linking to each failing field and move focus to it — otherwise the failure is silent.'],
    ['Do you still need a form library?',
     'For multi-step flows with conditional branches and cross-field dependencies, often yes. For a contact or signup form, rarely — labels, types, autocomplete and native constraints cover most of it. Whatever you use should sit on top of correct HTML rather than replacing it.'],
  ]),
};
