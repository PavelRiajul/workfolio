import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/ecommerce-conversion-leaks/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-ecommerce-conversion-leaks',
  slug: 'ecommerce-conversion-leaks',
  title: 'Where Ecommerce Conversion Actually Leaks',
  category: 'ecommerce',
  order: 88,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-12',
  series: 'CRO',
  excerpt:
    'Most stores lose more revenue between the product page and the cart than anywhere else — and fix the homepage instead. Where to look, in order.',
  coverLabel: 'Conversion leaks — cover',
  body: body(
    p('Every store I audit has a homepage somebody is proud of and a product page nobody has touched in a year. The homepage gets the redesigns because it is the page the founder looks at. The product page is where the money is decided.'),
    p('Conversion work is unglamorous in exactly this way. It is mostly finding the step where people are leaving, looking at what that step asks of them, and removing something. The wins are rarely clever and they are frequently large — a shipping cost shown two steps earlier is worth more than a year of homepage iterations.'),
    p('What follows is the order I actually work in, the leaks that recur across almost every store, and the ones that look like leaks and are not.'),

    h2('Where do you look first?'),
    p('At the funnel, in aggregate, before touching a single page.'),
    p('The instinct is to start from opinions about the site. The correct start is four numbers: sessions, sessions that viewed a product, sessions that added to cart, and sessions that completed. Each ratio between them is a step, and one of those steps is worse than the others. That step is the work.'),
    table('A funnel with a leak in it', [
      ['Step', 'Sessions', 'Rate', 'Typical'],
      ['Landed', '100,000', '—', '—'],
      ['Viewed a product', '43,000', '43%', '40–55%'],
      ['Added to cart', '4,300', '10%', '8–12%'],
      ['Reached checkout', '2,800', '65%', '60–70%'],
      ['Completed', '840', '30%', '45–60%'],
    ]),
    p('Read that bottom row and the whole audit is decided. Every step is roughly normal except the last, which is at half what it should be. Nothing on the homepage matters until checkout completion is fixed, and no amount of intuition would have pointed there.'),

    h3('Benchmarks are directional, not targets'),
    p('The typical ranges above vary enormously by category, price point and traffic source. Their use is to spot a step that is anomalous relative to your own other steps, not to hit somebody else\'s number.'),

    h3('Segment by device before anything else'),
    p('An aggregate funnel usually hides the finding. Mobile and desktop behave differently enough that a store with acceptable overall numbers can have a mobile checkout that is failing badly, and since mobile is normally the majority of traffic, that is most of the loss. This is the same argument as [reading the 75th percentile rather than the average](/blog/field-vs-lab-data) — the aggregate is where problems go to hide.'),
    img('funnel-shape', 'A stepped drop-off where one transition falls far more sharply than the others', 'Four numbers decide the audit. One step is anomalous relative to your own others, and that step is the work.'),

    h2('Why do people leave the product page?'),
    p('Because a question they had was not answered, and leaving is cheaper than asking.'),
    p('The product page is the highest-intent page on the store. Somebody arriving there has already decided they are interested. If they leave without adding to cart, something specific stopped them, and it is nearly always one of a short list.'),

    h3('The price of delivery is unknown'),
    p('This is the largest single leak in ecommerce and it is not close. A shopper who cannot find out what delivery costs assumes the worst, and a shopper who discovers it at checkout feels misled. Stating it on the product page — as a figure, or as a threshold they can see they have met — removes the reason to leave.'),

    h3('Whether it will arrive in time is unknown'),
    p('"Ships in 2–4 days" is worth more than most design work on the same page. For anything bought for an occasion, the delivery date is the purchase decision, and a store that will not commit to one loses to a store that will.'),

    h3('The photography does not answer the question'),
    p('Three studio shots on white answer nothing about scale, texture or how a thing looks in use. The photograph that converts is usually the one that shows the product being used at real size, and it is frequently the one missing.'),

    h3('The buy button is below the fold on mobile'),
    p('Astonishingly common. A hero image that fills the viewport, a title, a price, and the add-to-cart button somewhere under all of it. On a phone the primary action should be reachable without a deliberate scroll — the same constraint that governs [any mobile hero](/blog/mobile-hero-viewport).'),

    h3('There is nothing to establish trust'),
    p('For a brand nobody has heard of, reviews are not decoration — they are the entire basis on which a stranger hands over a card number. A product page with no reviews, no returns statement and no visible contact route is asking for a lot on no evidence.'),
    img('product-questions', 'A set of unanswered buyer questions sitting between interest and the add-to-cart action', 'Delivery cost, delivery date, scale, and whether anyone else has bought it. Leaving is cheaper than asking.'),

    h2('What goes wrong in the cart?'),
    p('The total changes, or the path forward is unclear.'),
    p('Cart abandonment is heavily blamed on price, and price is usually not what changed — what changed is the price the shopper was holding in their head. Delivery, tax and fees appearing at this step is the moment a considered purchase becomes a reconsidered one.'),

    h3('Show the full total as early as possible'),
    p('Every cost the customer will pay should be visible before the checkout step, ideally on the product page. This is not a conversion trick; it is the removal of an unpleasant surprise, and it is the highest-value change available in most carts.'),

    h3('A free-shipping threshold needs a progress indicator'),
    p('"Spend £12 more for free delivery" reliably increases average order value and it only works if the shopper can see it. A threshold buried in a policy page is a promotion nobody is running.'),

    h3('Do not make them leave to change their mind'),
    p('Quantity changes, variant swaps and removals should all happen in the cart without a page reload. Every navigation is a chance to abandon, and a cart that sends people back to the product page to change a size is manufacturing those chances.'),

    h3('One clear next action'),
    p('A cart with continue shopping, checkout, express payment buttons, a discount field and an upsell carousel has no primary action. Checkout should be unmistakably the main thing, and everything else should be quieter than it.'),
    p('Upsells in the cart are worth having and worth constraining. One relevant, cheap addition presented quietly converts; a carousel of six products reopens the browsing decision at the exact moment the shopper had finished making it. The test is whether the suggestion could plausibly be added without reconsidering the original purchase.'),
    img('cart-total', 'A running total changing between the moment of decision and the moment of payment', 'Abandonment is blamed on price, but price rarely changed — the number the shopper was holding in their head did.'),

    h2('What about checkout itself?'),
    p('On Shopify you control less of it than you think, and the things you do control matter more than the things you do not.'),
    p('The hosted checkout is genuinely well optimised, which is one of the better reasons to stay on it. The leaks that remain are mostly things you put there: a forced account, a discount field that sends people hunting for a code, and payment methods your customers do not use.'),

    h3('Forced account creation'),
    p('Requiring registration before purchase is among the most expensive defaults available, and guest checkout is a setting. Offer the account afterwards, when the customer has a reason to want one.'),

    h3('The discount code field'),
    p('A visible empty box marked "promo code" tells a shopper that a better price exists and they do not have it. Many then leave to look for one, and a proportion do not come back. Collapsing it behind a small link keeps it available to people who have a code without advertising it to those who do not.'),

    h3('Express payment placement'),
    p('Wallet buttons at the top of checkout convert well, particularly on mobile, because they eliminate typing an address. Below the form they are a fallback nobody reaches. This is a placement change, not a feature.'),

    h3('Match the branding across the handoff'),
    p('Moving from a branded storefront to a checkout that looks like a different company reads as a redirect gone wrong at the least forgiving moment in the funnel. It is a settings page and it is worth spending an hour on — and if you are considering [a headless rebuild](/blog/shopify-hydrogen-worth-it), this becomes a real design task rather than a settings one.'),
    img('checkout-leaks', 'Late-stage friction points concentrated around account creation, codes and payment options', 'Most remaining checkout leaks are things you added: a forced account, a discount box, and wallets placed below the form.'),

    h2('Does site speed really move conversion?'),
    p('Yes, and the effect is smaller and less direct than the case studies imply.'),
    p('Speed is a floor, not a lever. A store where the product page takes six seconds on mobile is losing people who never see anything you designed, and fixing that produces a real lift. A store already at two seconds does not double conversion by reaching 1.5 — it earns a fraction of a point, which is worth having and is not the headline.'),

    h3('The leak is bounce before render'),
    p('The mechanism is people leaving before the page appears. That loss shows up as low product-page views relative to sessions, not as poor add-to-cart rate, which is a useful way to tell whether speed is your problem at all.'),

    h3('Layout shift costs orders directly'),
    p('A page whose buttons move as it loads produces mis-taps, and a mis-tap on a mobile product page sends somebody to the wrong variant or the wrong page entirely. [Reserving space for everything](/blog/near-zero-cls) is a conversion fix as much as a metric one.'),

    h3('Fix the scripts before rebuilding anything'),
    p('On most stores the load time is dominated by accumulated app scripts rather than by the platform. Auditing what each one costs and removing the dead ones is a day of work and it routinely halves the page weight — [the cheapest performance win in commerce](/blog/third-party-script-cost).'),

    h2('Which leaks are not leaks?'),
    p('Several numbers that look alarming are normal, and chasing them wastes the effort a real leak deserves.'),

    h3('A 70% cart abandonment rate'),
    p('That is roughly the industry norm. Carts are used as wishlists, price comparisons and reminders. The number worth watching is the change in your own rate, not its distance from zero.'),

    h3('High bounce on blog traffic'),
    p('Someone who arrives from search, reads an article and leaves has not failed a funnel — they were never in one. Judging content traffic by ecommerce conversion is how useful content gets deleted.'),

    h3('Low conversion on paid social'),
    p('Cold interruption traffic converts far below search traffic and always has. Comparing the two in one number hides both. Segment by source or the averages will mislead you in both directions.'),

    h3('A drop after a price rise'),
    p('Conversion rate falling while revenue per session holds or rises is not a leak, it is a price change working as intended. Conversion rate alone is a poor objective — revenue per session is the honest one.'),
    img('false-leaks', 'Several alarming-looking metrics marked as expected rather than as problems', 'A 70% cart abandonment rate is normal. So is blog bounce and cold-social conversion. Chasing these costs you the real leak.'),

    h2('How do you find your own leaks?'),
    p('Three tools, and the cheapest one is the most useful.'),

    h3('Watch session recordings on the failing step'),
    p('Twenty recordings of sessions that reached the cart and did not check out will teach you more in an hour than a week of analytics. You see the hesitation, the scrolling back, the tap that did nothing. It is the closest thing to watching somebody use the store.'),

    h3('Read the search queries on your own site'),
    p('Internal search is customers telling you what they cannot find, in their own words. Queries with no results are a product page you are missing or a naming mismatch, and both are directly actionable.'),

    h3('Ask the customer service inbox'),
    p('Whoever answers your support email already knows the top three reasons people hesitate, because they answer them every day. This is free research and almost nobody does it.'),

    h3('Then instrument the specific step'),
    p('Once you have a hypothesis, event tracking on that one interaction tells you the size of the problem. Instrumenting everything first produces a dashboard nobody reads — [start from the question](/blog/field-vs-lab-data), not from the data.'),
    img('research-tools', 'Recordings, search queries and support conversations feeding into one prioritised finding', 'Twenty recordings of the failing step beat a week of analytics. Your support inbox already knows the top three objections.'),

    h2('In what order should you fix them?'),
    p('By expected value, which means the leak size multiplied by the traffic through it.'),
    ol([
      '**Find the anomalous step** in the funnel, segmented by device.',
      '**Watch twenty recordings** of sessions that failed at that step.',
      '**Fix the single most obvious thing** you saw, and ship it alone.',
      '**Measure for two weeks** before deciding it worked.',
      '**Repeat**, rather than batching five changes and losing the attribution.',
    ]),
    p('Shipping one change at a time feels slow and is the only way to know what worked. A release containing five improvements that collectively move conversion by nothing has told you that one of them helped and one hurt, and you cannot tell which — which is the whole argument for [running them as experiments](/blog/near-zero-cls) where volume allows.'),

    h3('Do the free ones first'),
    p('Guest checkout, collapsing the promo field, moving express payments up, adding a shipping figure to the product page — each is minutes of configuration. Doing all of them before any design work is the most efficient day in commerce.'),

    h3('Beware of seasonality in the measurement'),
    p('A two-week window that straddles a payday, a holiday or a campaign is comparing two different populations, not two versions of a page. Where traffic allows, run a proper split test so both variants see the same conditions; where it does not, compare against the same period last year rather than the fortnight before.'),
    img('one-at-a-time', 'A sequence of single changes each measured before the next is introduced', 'Five improvements shipped together that net to nothing have told you one helped and one hurt. You cannot tell which.'),

    h2('What does this cost?'),
    p('A day to find the leaks, and usually less than a week to fix the first three.'),
    p('The audit — funnel by device, twenty recordings, an app cost census, a look at internal search — is a day. The first round of fixes is typically settings changes and product page copy, which is a few days rather than a project. What takes time is the discipline of one change at a time.'),
    p('The honest counterweight: conversion work has a floor and it is easy to keep pushing past the point of return. Once the obvious leaks are closed, the remaining gains get small, slow and statistically fragile, and a team that keeps optimising at that stage is spending on decimal points while ignoring the product, the price and the traffic mix — which are larger levers and harder conversations. Know when you have finished, and go and work on those instead.'),
    quote('The homepage gets redesigned because the founder looks at it. The product page decides the money, and it usually has not been touched in a year.'),

    h2('Conclusion'),
    p('Start with four numbers, segmented by device: sessions, product views, add-to-carts, completions. One step will be anomalous relative to your own others, and that step is the work — no amount of opinion about the site points there reliably.'),
    p('On the product page the recurring leaks are the same everywhere. Delivery cost unknown, delivery date uncommitted, photography that does not show scale or use, an add-to-cart button below the fold on a phone, and no reviews to justify trusting a stranger with a card number. Each of those is a question the shopper had, and leaving is cheaper than asking.'),
    p('In the cart, the problem is nearly always that the total changed. Show every cost before checkout, put a visible progress indicator on any free-shipping threshold, allow quantity and variant changes in place, and make checkout unmistakably the primary action. In checkout itself, the leaks that remain are the ones you added — a forced account, an advertised discount box, and wallet buttons below the form.'),
    p('Treat speed as a floor rather than a lever. Six seconds on mobile is a real leak that shows up as low product views per session; going from two seconds to 1.5 earns a fraction of a point. Audit the app scripts before rebuilding anything, because that is usually where the seconds are.'),
    p('Then fix one thing at a time and measure for two weeks, starting with the changes that are pure configuration. And know which numbers are not leaks — a 70% cart abandonment rate, blog bounce and cold-social conversion are all normal, and chasing them costs you the one that is real. If you want somebody to run this audit properly, [it is one of the things I do](/services).'),
  ),
  faqs: faq([
    ['What is the biggest conversion leak in ecommerce?',
     'Unknown delivery cost, by a wide margin. A shopper who cannot find out what shipping costs assumes the worst, and one who discovers it at checkout feels misled. Putting the figure or a visible free-shipping threshold on the product page is the highest-value change in most stores.'],
    ['Is a 70% cart abandonment rate a problem?',
     'No, that is roughly the industry norm. Carts get used as wishlists, price comparisons and reminders to come back later. What matters is the change in your own rate over time, not its distance from zero — chasing the absolute number wastes effort a real leak deserves.'],
    ['Does making my store faster increase sales?',
     'Only up to a point. Speed is a floor, not a lever: a product page taking six seconds on mobile loses people before they see anything, and fixing that produces a genuine lift. Going from two seconds to 1.5 earns a fraction of a percent — worth having, not a strategy.'],
    ['Should I remove the discount code field at checkout?',
     'Collapse it behind a small link rather than removing it. A visible empty promo box tells shoppers a better price exists that they do not have, and some leave to hunt for a code and never return. Behind a link, it stays available to anyone who actually has one.'],
    ['How do I find the leaks in my own funnel?',
     'Segment the funnel by device to find the anomalous step, then watch twenty session recordings of visitors who failed at it. Add your internal site search queries and a conversation with whoever answers support email. That combination costs a day and beats any amount of dashboard building.'],
  ]),
};
