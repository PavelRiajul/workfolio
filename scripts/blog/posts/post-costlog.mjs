import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ai-cost-logging/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ai-cost-logging',
  slug: 'ai-cost-logging',
  title: 'Per-User AI Cost Logging: Finding the Account Burning Your Budget',
  category: 'ai',
  order: 15,
  readTime: '11 min read',
  date: 'August 2026',
  publishedAt: '2026-08-05',
  series: 'AI cost',
  excerpt:
    'What to log on every model call, and the query that finds the one user costing more than their whole plan is worth.',
  coverLabel: 'AI cost logging — cover',
  body: body(
    p('The provider dashboard tells you that you spent $412 last month. It does not tell you that $280 of that came from four accounts, that three of them are on a free tier, or that one integration has been retrying in a loop since the ninth.'),
    p('Aggregate spend is the least actionable number in the entire system. It tells you something changed and gives you no way to find out what. The fix is small, it costs a few columns on a table, and it has to go in before launch because it cannot be applied retroactively to calls that already happened.'),
    p('This is one of the six components that define [Template 04 in my stack](/stack), and it is in the base scope of every AI build I quote rather than something a client can decline.'),

    h2('Why does aggregate spend tell you nothing?'),
    p('Because every useful question about AI cost is a question about a subset. Which customers are unprofitable. Which feature is expensive. Whether the increase this month is more users or the same users doing more. Whether the prompt change last week made things cheaper or dearer.'),
    p('None of those can be answered from a monthly total. You can watch it rise and you cannot act on it, which in practice means the response to a rising bill is either to do nothing or to make a change and hope. Both are common.'),
    p('The asymmetry is what makes this worth doing early. Attribution costs almost nothing to add at the start and is impossible to add later for calls that have already happened. When the alarming invoice arrives, the data you need to investigate it either exists or it does not, and no amount of urgency creates it after the fact.'),
    img('aggregate-vs-attributed', 'A single large undifferentiated block beside the same volume split into labelled segments', 'The same spend. Only one version can be acted on.'),

    h2('What should you log on every call?'),
    p('Seven fields, written at the same time as the response. None of them require a separate service, and the whole thing is one insert on a table you already have.'),
    table('The minimum useful record for a model call', [
      ['Field', 'Why it matters'],
      ['user_id and org_id', 'The entire point — attribution'],
      ['feature', 'Tells you what to optimise'],
      ['model and version', 'Prices and behaviour change over time'],
      ['input_tokens, output_tokens', 'The actual cost drivers'],
      ['cost_cents', 'Computed at write time, never later'],
      ['latency_ms', 'Catches degradation before users report it'],
      ['status', 'Success, refused, rate-limited, error'],
    ]),
    p('The `feature` column earns its place faster than people expect. Knowing that a user is expensive is half the answer; knowing they are expensive because of document extraction rather than chat tells you what to change. Without it you get an expensive account and no idea which part of the product is responsible.'),
    p('`status` matters for a subtler reason. Refusals and rate-limited calls have a cost profile of their own, and a rising refusal rate is usually the earliest signal that something upstream has drifted. Logging it here means one table answers both the cost question and the quality question.'),

    h2('Why compute cost at write time?'),
    p('Because prices change, and a historical record that recalculates itself against today\'s price list is not a historical record.'),
    p('If you store only token counts and multiply by current pricing at query time, then the day a provider changes prices, every past month silently re-prices. Your March figures move. Comparisons across the change become meaningless, and you lose the ability to say what anything actually cost when it happened.'),
    p('Storing `cost_cents` at write time fixes that permanently. It also makes the analytics queries trivial — a sum rather than a join against a pricing table with effective dates, which is a surprisingly awkward thing to model correctly.'),
    code('ts', `
// Written in the same transaction as the response, not after.
await db.aiUsage.create({
  data: {
    userId, orgId, feature: 'document_chat',
    model: 'claude-sonnet-4', modelVersion,
    inputTokens: usage.input, outputTokens: usage.output,
    // Priced now, with the rates in force now. History stays true.
    costCents: priceFor(model, usage),
    latencyMs, status: 'ok',
  },
});
`),
    p('One detail that catches people: log the failed calls too. A request that errored after generating 3,000 tokens still cost money, and a retry storm is composed almost entirely of calls that failed. Systems that only log successes under-report exactly the situations you most need to see.'),

    h2('What is the query that finds your expensive user?'),
    p('Once the data exists, the analysis is ordinary SQL. This is the one I run first on any AI feature that has been live for a month.'),
    code('sql', `
SELECT u.email,
       SUM(a.cost_cents) / 100.0            AS spend,
       COUNT(*)                             AS calls,
       SUM(a.cost_cents) / COUNT(*) / 100.0 AS avg_cost,
       s.plan_price                         AS revenue
FROM ai_usage a
JOIN users u ON u.id = a.user_id
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE a.created_at > now() - interval '30 days'
GROUP BY u.email, s.plan_price
ORDER BY spend DESC
LIMIT 20;
`),
    p('The last column is what turns this from interesting into actionable. Spend on its own is meaningless — a customer costing $180 a month is cheap if they pay $2,000 and ruinous if they pay nothing. The ratio is the number worth watching.'),
    p('The distribution is almost always steeper than expected. On every AI feature I have looked at, the top few percent of users account for a third or more of total spend, and there is usually at least one account whose cost exceeds what it pays.'),
    p('Run the same query grouped by feature rather than by user and you get the other half of the picture. The two together answer nearly every question that matters: which customers are unprofitable, which part of the product is responsible, and whether the two overlap. When they do — one expensive feature used disproportionately by unprofitable accounts — you have found the thing to fix, and it is usually a pricing decision rather than an engineering one.'),
    p('It is worth running both queries the week after launch rather than the month after. The patterns are visible early, and acting on them at ten customers is considerably easier than at a thousand, when the pricing conversation involves people who have already been billed the old way.'),
    img('cost-distribution', 'A row of bars with a very long tail and two dramatically taller bars at one end', 'The distribution is never flat. It is usually steeper than anyone predicts.'),

    h2('What should you actually watch?'),
    p('Four numbers, and none of them is total spend.'),

    h3('Cost as a share of revenue, per account'),
    p('The headline metric. Anything above roughly 20% of what that customer pays deserves attention; anything above 100% needs action this week. This is the only version of the cost question that connects to whether the business works.'),

    h3('Cost per feature'),
    p('Tells you where optimisation effort will actually pay. It is common for one feature to account for most of the spend while receiving none of the attention, usually because it is not the one anyone demos.'),

    h3('Cost per call, over time'),
    p('This should be stable. When it moves without a deliberate change, something has drifted — a longer prompt, more retrieved context, a model switch, a retry loop. It is the earliest signal available and the cheapest to check.'),

    h3('Free-tier spend as a proportion'),
    p('Free users generating a meaningful share of model spend is a pricing problem, not an engineering one. Worth measuring specifically, because it is easy to miss when looking at totals.'),

    h2('How do you cap what a single user can spend?'),
    p('Three controls, layered. Together they turn an open-ended risk into a line item.'),
    ol([
      '**A monthly ceiling per user or organisation**, checked before the call rather than after. When it is reached, the feature degrades rather than erroring.',
      '**A rate limit per minute**, which is what protects you from a loop in your own code — a more common cause of a shocking bill than abuse.',
      '**A global ceiling** as the backstop, so no combination of accounts can produce a bill you did not budget for.',
    ]),
    p('Degradation matters more than the limit itself. Hitting a ceiling should mean a shorter context window, a cheaper model, or a clear message with a reset date — not a failure on a feature the user is halfway through. A hard error reads as broken software, and users do not distinguish between a limit and a bug.'),
    p('Set the ceiling somewhere a normal user will never reach. Its purpose is not to ration ordinary use; it is to bound the worst case. If ordinary users are hitting it regularly, the limit is wrong rather than the users.'),
    img('ceiling', 'A rising line meeting a fixed horizontal boundary and flattening smoothly', 'A ceiling that degrades gracefully is invisible to normal use and bounds the worst case.'),

    h2('When should the alert fire?'),
    p('Before the invoice, and somewhere a human actually reads.'),
    p('A threshold at around 60% of expected monthly spend, checked daily, gives enough warning to investigate without being noisy. Pair it with a second alert on the rate of change — spend doubling week over week is worth knowing about even when the absolute number is still small, because it is small now and will not be in a fortnight.'),
    p('Send it to the same place your error tracking goes. An alert in a channel nobody has open is indistinguishable from no alert, and cost alerts are exactly the kind that get routed somewhere quiet and forgotten.'),
    p('One alert worth adding that most people skip: a threshold on cost per call rather than on total spend. Total spend rising because you gained customers is good news. Cost per call rising means something changed in the system, and the two are indistinguishable on a monthly total. Alerting on the per-call figure separates growth from regression, which is the distinction you actually want to be woken up for.'),

    h2('Where should the logging live?'),
    p('In your own database, alongside the users it refers to. This is not a case for a separate analytics product.'),

    h3('It has to join to your data'),
    p('Every useful query joins spend against users, plans and features. If usage lives in a third-party analytics tool and revenue lives in Postgres, the one question that matters — cost against revenue per account — requires exporting from both and reconciling by hand. Nobody does that twice.'),

    h3('It has to be written transactionally'),
    p('The usage record should be written in the same transaction as whatever the call produced. Fire-and-forget to an external service loses records exactly when the system is under stress, which is precisely when the data matters most.'),

    h3('It does not need to be big'),
    p('One table, indexed on `(user_id, created_at)` and `(feature, created_at)`. At a million calls a month this is a rounding error against your existing database, and it queries fast enough for a dashboard without any additional infrastructure.'),
    p('Retention is worth deciding deliberately. Full detail for ninety days and a daily rollup after that keeps the table small while preserving year-over-year comparisons. The rollup is a scheduled job on the [background worker you already have](/stack).'),
    img('logging-location', 'A single database cylinder with two related tables joined by a short connector', 'It joins to users and plans, so it lives where they do.'),

    h2('What do you do with an expensive account?'),
    p('Four options, roughly in order of how often they are the right answer.'),
    p('**Optimise the feature they are using.** Frequently the expensive account is simply the heaviest user of something inefficient, and the fix helps everyone. Sending five reranked passages instead of twenty unranked ones cut cost per answer by roughly two thirds on one system while improving accuracy — the [retrieval work](/blog/rag-that-answers) paid for itself twice.'),
    p('**Move them to a plan that reflects the cost.** If the usage is legitimate and valuable, the pricing is wrong rather than the usage. This is a commercial conversation and it usually goes better than expected, because heavy users generally know they are heavy users.'),
    p('**Apply a limit.** Appropriate for free tiers and trials, where the account is unlikely to become profitable at that level of use.'),
    p('**Investigate for a bug.** The single most expensive account I have found was not a user at all — it was an integration retrying a failing call every thirty seconds for eleven days. Check this first, because it is both the cheapest to fix and the most embarrassing to discover late.'),

    h2('How do you actually reduce the cost?'),
    p('Once attribution shows you where the money goes, the reductions are usually unglamorous and large. Four levers, in the order I reach for them.'),

    h3('Send less context'),
    p('The single biggest lever, and it usually improves quality at the same time. Generation cost scales with input tokens, and most systems send far more context than the answer requires. Reranking twenty retrieved passages down to the best five cuts input by roughly three quarters.'),
    p('The instinct that more context is safer is wrong in both directions: it costs more and it dilutes the model\'s attention across passages that do not answer the question. This is the rare optimisation with no trade-off to manage.'),

    h3('Route by task, not by preference'),
    p('Not every call needs your best model. Classification, routing and reranking are latency-sensitive and need no reasoning, so they go to something fast and cheap — Groq, in my stack. Generation, where reasoning quality is visible, goes to Claude or GPT.'),
    p('Behind a provider-agnostic adapter this is one line of routing, and it commonly takes a third off the bill. Sending everything to the most capable model because it is simpler is the most common avoidable line on an AI invoice.'),

    h3('Cache what repeats'),
    p('In most products a meaningful share of questions are near-duplicates. Caching answers keyed on the normalised question plus the corpus version removes that cost entirely, and it makes the repeated questions faster, which users notice.'),
    p('Be careful with the cache key. It has to include anything that changes the correct answer — the document set, the user\'s permissions, the model version — or you will serve one user an answer computed from another user\'s documents, which is a considerably worse problem than the one you were solving.'),

    h3('Shorten the output'),
    p('Output tokens usually cost several times more than input tokens. An instruction to answer concisely, plus a sensible max-tokens ceiling, reduces spend directly. It also tends to produce better answers, because the alternative is a model padding toward a length nobody asked for.'),
    img('cost-levers', 'Four levers of decreasing size arranged on a clean panel, the largest engaged', 'Context size is the big lever. The others matter, and none of them is model choice.'),

    h2('Does this apply to small projects?'),
    p('More than to large ones, proportionally. A large company absorbs a surprising invoice; a small business does not, and it is exactly the kind of unexpected cost that turns a client off AI features permanently.'),
    p('The work is genuinely small — a table, an insert, a query and an alert. Roughly a day for a typical feature, and it is the same day whether the product has ten users or ten thousand. There is no scale at which it is not worth doing.'),
    quote('Attribution is the difference between "AI cost us $412 last month" and "one broken integration cost us $280, and here is the account".'),

    h2('What does this look like in the product?'),
    p('Usually invisible, and occasionally worth surfacing. For usage-based pricing it becomes a feature: showing customers their own consumption is straightforward once the data exists, and it reduces support load considerably.'),
    p('Internally, the useful artefact is a single view showing spend by user and by feature over the last thirty days, sorted by cost-to-revenue ratio. That view answers most cost questions immediately, and building it takes an afternoon once the logging is in place.'),
    p('For anything customer-facing, be careful about exposing raw token counts. They mean nothing to most users and they invite questions that are expensive to answer. Show consumption in units that map to what the customer did — answers generated, documents processed — rather than to what it cost you.'),
    img('usage-view', 'A compact panel of ranked rows with one row highlighted', 'One view, sorted by cost against revenue. It answers most questions immediately.'),

    h2('Conclusion'),
    p('Log the user, the feature, the model, the tokens, the computed cost, the latency and the status, on every call including the failures. Compute cost at write time so history stays true when prices move. Then run one query joining spend against revenue, and act on the ratio rather than the total.'),
    p('Add a per-user ceiling that degrades rather than errors, a rate limit that protects you from your own retry logic, and an alert at 60% of expected spend delivered somewhere a person reads.'),
    p('It is roughly a day of work, it goes in before launch because it cannot be added retroactively, and it converts the most anxiety-inducing property of AI features — an open-ended bill — into an ordinary, bounded line item. That is the whole of it, and [it is not an upsell](/services): it is the difference between a feature you can run and one you eventually switch off.'),
  ),
  faqs: faq([
    ['How do you track AI costs per user?',
     'Log the user id, feature, model, input and output tokens, and the computed cost on every call, written at the same time as the response. Computing cost later from a current price list silently rewrites history the moment a provider changes pricing.'],
    ['What is a reasonable AI cost per user?',
     'It depends entirely on context size and usage, so the number to watch is cost as a share of what that user pays you. Anything above roughly 20% of their revenue deserves attention, and anything above 100% needs action that week.'],
    ['How do you stop one user running up a huge bill?',
     'A monthly ceiling per user checked before the call, a per-minute rate limit, and a global backstop. When a ceiling is reached the feature should degrade — shorter context, cheaper model, clear message — rather than returning an error mid-task.'],
    ['Should cost logging go in before launch?',
     'Yes. It cannot be applied retroactively to calls that already happened, so retrofitting after a surprising invoice leaves you unable to answer the only useful question: which user, and which feature. It is about a day of work either way.'],
  ]),
};
