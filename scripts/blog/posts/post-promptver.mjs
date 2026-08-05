import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/prompt-versioning/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-prompt-versioning',
  slug: 'prompt-versioning',
  title: 'Prompt Versioning and Why Prompts Belong in Git',
  category: 'ai',
  order: 23,
  readTime: '11 min read',
  date: 'December 2025',
  publishedAt: '2025-12-23',
  series: 'AI safety',
  excerpt:
    'A prompt is code. Storing it in a dashboard means no review, no history, and no way to tell what changed when quality dropped.',
  coverLabel: 'Prompt versioning — cover',
  body: body(
    p('Answer quality drops. Somebody asks what changed. The prompt lives in a vendor dashboard where three people have edit access, there is no history, and nobody remembers whether the wording was adjusted last Tuesday or the Tuesday before.'),
    p('That situation is entirely avoidable and remarkably common, because prompts do not feel like code. They are prose, they are edited by non-engineers, and the tooling encourages putting them somewhere convenient rather than somewhere reviewable.'),
    p('They are code. They determine program behaviour, they break things when changed carelessly, and they need the same review, history and rollback as anything else that ships.'),

    h2('Why does a dashboard-stored prompt fail?'),
    p('Four properties you lose the moment the prompt leaves your repository, and each of them matters more than it sounds.'),

    h3('No review'),
    p('A prompt edit changes production behaviour immediately, with no second pair of eyes. The equivalent for code would be editing a live server through a web form, which nobody would accept.'),

    h3('No history'),
    p('When quality drops, the first question is what changed and when. Without history the answer is a conversation about who remembers doing what, which is not an answer.'),

    h3('No connection to a release'),
    p('Code deploys are tied to versions, tags and changelogs. A prompt edited independently is invisible in that record, so a bisect over deploys finds nothing — the change was not in a deploy.'),

    h3('No relationship to the evaluation set'),
    p('[The harness](/blog/ai-evaluation-harness) runs against a prompt. If the prompt can change without a commit, the harness result belongs to a version that no longer exists, and the number stops meaning anything.'),
    img('dashboard-vs-git', 'A loose panel of text beside the same text held within a structured stack of versions', 'Same prompt. Only one of the two can answer "what changed and when".'),

    h2('What does it look like in the repository?'),
    p('A file per prompt, in the language the codebase uses, with the tools and schemas it depends on beside it.'),
    code('ts', `
// prompts/answer-from-documents.ts
export const ANSWER_FROM_DOCUMENTS = {
  id: 'answer-from-documents',
  version: 7,
  model: 'claude-sonnet-4',
  template: \`You answer questions using only the provided documents.

If the documents do not contain the answer, say so plainly and stop.
Do not use general knowledge to fill gaps.

Cite sources by their [id]. Only cite ids present in the documents below.\`,
} as const;
`),
    p('The `version` field is not decoration. It is written into the usage log on every call, which is what lets you group quality and cost figures by prompt version afterwards. Without it you have a history of edits and no way to connect them to outcomes.'),
    p('Keep the template as a plain string rather than assembling it from fragments scattered across the codebase. A prompt you cannot read in one place is a prompt nobody will review properly, and reviewability is the entire point.'),
    p('Bumping the version is a manual step and it should stay that way. Deriving it from a content hash sounds tidier and loses the distinction between a typo correction and a change in refusal policy. The number is a claim about significance, and a person is better placed to make that claim than a checksum.'),
    p('Where a repository holds several prompts, keeping their versions independent matters. A shared version across all prompts means every change appears to touch everything, which makes the log useless for the one question it exists to answer: which specific behaviour changed, and when.'),

    h2('How do you review a prompt change?'),
    p('Like any other change, with one addition: the pull request should carry the evaluation result.'),
    p('A prompt diff is unusually hard to reason about by reading. Small wording changes have large behavioural effects and large rewrites sometimes change nothing measurable. Reviewers cannot reliably predict which, so the numbers have to be in front of them.'),
    p('Run the harness in continuous integration on any pull request touching a prompt file, and post the scores as a comment. The review question becomes "correctness up two points, refusal correctness down six — is that trade acceptable?" which is a question a person can actually answer.'),
    table('What a prompt pull request should show', [
      ['Item', 'Why'],
      ['The diff', 'Obviously, and it should be readable'],
      ['Evaluation scores versus baseline', 'The only reliable signal'],
      ['Which cases changed verdict', 'Shows the shape of the change'],
      ['Cost per call before and after', 'Longer prompts cost more on every request'],
      ['Model and version pinned', 'A prompt is tuned against a specific model'],
    ]),

    h2('Should non-engineers be able to edit prompts?'),
    p('This is the real argument for dashboards, and it deserves a direct answer rather than a dismissal.'),
    p('The pull is genuine: a support lead knows the right wording for a refusal message far better than I do, and making them wait for a developer is wasteful. But the ability to edit production behaviour without review is not the only way to solve that.'),
    p('Two approaches work. Let non-engineers open pull requests against the prompt file directly — the barrier is smaller than it appears, and the evaluation comment gives them feedback without needing to read code. Or separate the parts that genuinely need editing, such as tone guidance and refusal wording, into a reviewed content file while the structural instructions stay in the prompt.'),
    p('The first works better than expected in practice. Editing one string in one file, with automated feedback on the result, is a smaller ask than most people assume, and it has the useful side effect that the person making the change sees its measured consequence rather than assuming it was an improvement.'),
    p('What does not work is unreviewed editing of the whole prompt, because the structural instructions and the wording are not separable in their effects. A friendlier refusal message frequently makes the model refuse less often, which is a behavioural change made by someone editing what they believed was copy.'),

    h2('How do you roll back?'),
    p('The same way as any other code change, which is the point. Revert the commit, deploy, and the previous behaviour returns exactly.'),
    p('This matters most in the situation it is designed for: quality has dropped, you are not certain which change caused it, and you need to get back to a known-good state while you investigate. With prompts in git that is a revert. With prompts in a dashboard it is an attempt to remember what the text used to say.'),
    p('Keep the model pinned in the same file for the same reason. A prompt is tuned against a specific model, and reverting the prompt while the model has silently moved underneath you restores neither the behaviour nor the ability to reason about it.'),
    img('rollback', 'A stack of versioned layers with one being lifted back into place', 'Rollback is a revert. That is the whole argument, and it only works if the prompt is in the repository.'),

    h2('How do you run experiments?'),
    p('Prompts in git and prompt experimentation are frequently presented as opposed. They are not, and the resolution is the mechanism you already use for other risky changes.'),
    p('Put the variant behind a feature flag. Both prompts live in the repository, both are reviewed, and the flag decides which users see which. That gives real experimentation with a full audit trail, and the losing variant is deleted in a normal pull request rather than lingering in a dashboard nobody has opened since.'),
    p('Record the prompt id and version alongside the outcome in your usage table. Then the comparison is a query over real traffic rather than an impression, and it joins naturally to cost — which frequently changes the conclusion, since the better-performing variant is sometimes materially more expensive per call.'),

    h2('How should prompt files be organised?'),
    p('Flat, named by what they do, and colocated with the things they depend on. The structure matters less than the consistency, but a few conventions repay themselves.'),

    h3('One file per prompt, named by purpose'),
    p('`answer-from-documents`, `classify-intent`, `extract-invoice`. Naming by purpose rather than by feature means a prompt reused across two features has one obvious home rather than living under whichever feature happened to need it first.'),

    h3('Keep tools and schemas beside the prompt'),
    p('A prompt that offers three tools is coupled to those tool definitions. Changing a tool\'s description changes model behaviour just as surely as changing the prompt text, so they belong in the same review and ideally the same directory.'),

    h3('Separate the system prompt from the task'),
    p('Instructions that apply to every call — tone, refusal policy, citation rules — belong in one place rather than duplicated across five prompts that will drift apart. Compose them explicitly at call time so the assembly is visible.'),

    h3('Do not template across prompts'),
    p('Sharing fragments between prompts feels efficient and makes every prompt unreadable in isolation. Some duplication is the right trade here; a prompt you can read top to bottom is worth more than a prompt with no repeated sentences.'),
    img('prompt-files', 'A tray of clearly labelled units, each self-contained', 'Readable in isolation beats free of duplication. Reviewability is the whole point.'),

    h2('What changes when several people edit prompts?'),
    p('The failure modes shift from technical to social, and they are worth anticipating because they arrive quickly once more than one person is involved.'),
    p('The most common is uncoordinated tuning. Two people fix two different complaints in the same week, each verifying their own case works, and the combination degrades a third behaviour neither was watching. The evaluation set catches this and only if it runs on every change rather than on the ones people judge risky.'),
    p('The second is prompt sprawl. Instructions accumulate because adding a sentence is easier than working out why the existing ones are not producing the behaviour. Prompts grow to a page, cost more on every call, and contain contradictions nobody has read carefully enough to notice.'),
    p('Periodic pruning helps, and the evaluation set makes it safe: remove an instruction, run the harness, and if nothing moves the instruction was doing nothing. That is a genuinely satisfying exercise and it routinely removes a third of a mature prompt without any measurable loss.'),
    p('The third is fixing the wrong layer. A complaint about answer quality frequently gets addressed in the prompt when the actual cause is [retrieval returning the wrong passages](/blog/rag-that-answers). Measuring retrieval separately is what prevents a fortnight of prompt tuning against a problem the prompt cannot solve.'),
    img('prompt-sprawl', 'A compact block beside a much taller accumulated stack of similar fragments', 'Prompts grow because adding is easier than diagnosing. Pruning against the harness is safe and usually large.'),

    h2('What about prompts that are genuinely dynamic?'),
    p('Most prompts are assembled at runtime from a template plus context — retrieved passages, user details, the conversation so far. That does not change the argument; it clarifies what is being versioned.'),
    p('The template is versioned. The context is data. Keep the boundary sharp: the file contains instructions and structure, and everything interpolated into it arrives as clearly marked parameters.'),
    p('Where this goes wrong is conditional prompt construction spread across the codebase — a paragraph appended here when a flag is set, a sentence removed there for a plan tier. The effective prompt then exists nowhere and cannot be reviewed. If variants are needed, write them as separate named templates rather than assembling them from fragments.'),
    p('For debugging, log the fully assembled prompt for a sampled proportion of calls, with personal data redacted. When an answer is inexplicable, the assembled prompt usually explains it immediately, and reconstructing it later from a template and a database row is considerably harder than it sounds.'),

    h2('What should you log with each call?'),
    p('The prompt id and version, alongside everything [cost logging already records](/blog/ai-cost-logging). Two extra columns, and they turn the usage table into a history of behaviour rather than only of spend.'),
    p('With those in place you can answer the questions that actually come up. Did quality change when we shipped version 7? Is version 7 more expensive per call than version 6? Which version was running when this specific customer complained? Each is a straightforward query, and each is unanswerable without the two columns.'),
    p('This is also what makes a gradual rollout measurable. Running versions 6 and 7 side by side across real traffic is only useful if the outcomes are attributable to a version, and attribution has to be recorded at write time.'),
    img('version-in-logs', 'A table of records with one column highlighted across every row', 'Two columns. They convert a spend log into a behaviour history.'),

    h2('How do prompts interact with model upgrades?'),
    p('Badly, if the two are not treated as one change. A prompt is tuned against a specific model, and a provider updating that model beneath you is a behavioural change you did not make and did not review.'),
    p('Pin the model version explicitly wherever the provider allows it. Automatic upgrades are convenient and they mean production behaviour can change without a deploy, which is precisely the situation this whole post exists to prevent.'),
    p('When you do upgrade, treat it as a prompt change: run the harness, compare against the baseline, review the trade, ship it as a commit. Frequently a prompt tuned for one model needs adjustment for its successor, and discovering that through evaluation is considerably cheaper than discovering it through support tickets.'),
    quote('A prompt and the model it runs against are one unit. Versioning either alone gives you half a history and a misleading one.'),

    h2('How do you handle prompts in multiple languages?'),
    p('A question that arrives later than it should, usually when a product expands and someone discovers the refusal message has been appearing in English to Bengali-speaking customers for two months.'),
    p('Treat each language as its own versioned prompt rather than translating at runtime. A machine-translated instruction does not reliably produce the behaviour the original did, and refusal wording in particular is sensitive enough that a near-translation can change how often the model declines.'),
    p('That means the evaluation set needs cases per language too, which is genuine additional work — but it is the only way to know the Bengali prompt behaves like the English one rather than merely reading like it. Half a dozen cases per language covering the important behaviours is usually enough to catch the meaningful divergences.'),
    p('The structural instructions can often stay in one language while user-facing wording is localised, since the model follows English instructions reliably while producing output in another language. That keeps the maintenance burden on the part that genuinely needs translating.'),
    img('multilingual', 'A single structural frame with several differently marked panels fitted into it', 'One structure, localised wording, and evaluation cases in each language.'),

    h2('What does this cost to set up?'),
    p('Close to nothing if done at the start — it is a file instead of a text box. Retrofitting is an afternoon: copy the prompts out of wherever they live, commit them, add the id and version to the usage log, and point the code at the files.'),
    p('The ongoing cost is a review step on prompt changes, which is where the objection usually lands. In practice that review is fast because the evaluation comment does the analytical work, and it is considerably faster than diagnosing a silent regression three weeks after it shipped.'),
    p('The thing that actually costs is not having it. Every hour spent trying to reconstruct what a prompt used to say, or arguing about whether behaviour genuinely changed, is an hour this would have saved, and those hours arrive at the least convenient possible moment.'),

    h2('Conclusion'),
    p('Put prompts in the repository, one file each, with an id, a version and a pinned model. Run the evaluation set in CI on any change to them and post the scores on the pull request, so review is about measured trade-offs rather than intuitions about wording.'),
    p('Log the prompt id and version with every call, so quality and cost can be grouped by version afterwards. Use feature flags for experiments so both variants stay reviewed and the loser gets deleted properly. Pin model versions, and treat a model upgrade as a prompt change.'),
    p('None of this is sophisticated, and all of it comes free with tooling you already run. The alternative is a system whose behaviour is defined in a text box nobody is reviewing, changing at times nobody is recording — which is fine right up until the week it is not.'),
    p('The underlying principle generalises past prompts. Anything that determines production behaviour belongs under the same controls, whatever it happens to look like. Prompts get an exemption because they read as prose and are edited by people who do not think of themselves as shipping code, and that exemption is exactly what makes the resulting incidents so hard to diagnose.'),
    p('If you take one action from this, make it the two log columns. Recording the prompt id and version on every call costs almost nothing and it is what converts every later question — did this change help, when did it regress, which version was this customer on — from a discussion into a query.'),
    img('one-action', 'A single small component being fitted into an existing larger assembly', 'Two columns in the usage table. Everything else on this page becomes answerable.'),
  ),
  faqs: faq([
    ['Should prompts be in version control?',
     'Yes. A prompt determines production behaviour, so it needs the same review, history and rollback as any other code. Storing it in a vendor dashboard means changes ship unreviewed with no record of what the text used to say.'],
    ['How do you review a prompt change?',
     'Run the evaluation set in continuous integration and post the scores on the pull request. Prompt diffs are hard to reason about by reading, so the review question should be whether a measured trade is acceptable rather than whether the wording looks better.'],
    ['How do you roll back a bad prompt?',
     'Revert the commit and deploy, exactly as with any code change. This only works if the prompt and its pinned model version are both in the repository, since reverting a prompt while the model has moved restores neither the behaviour nor your ability to reason about it.'],
    ['Should prompts be editable without a deploy?',
     'Not the whole prompt. Structural instructions and wording are not separable in their effects, and a friendlier refusal message frequently makes a model refuse less often. Separate genuinely editable content into a reviewed file, or let non-engineers open pull requests.'],
  ]),
};
