import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/shopify-subscriptions/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-shopify-subscriptions',
  slug: 'shopify-subscriptions',
  title: 'Shopify Subscriptions: What Nobody Warns You About',
  category: 'ecommerce',
  order: 99,
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-16',
  series: 'Shopify storefront',
  excerpt:
    'Recurring revenue is the easiest thing to sell internally and the hardest to run. The failure modes are operational, not technical — here they are.',
  coverLabel: 'Shopify subscriptions — cover',
  body: body(
    p('Subscriptions are an easy pitch. Predictable revenue, higher lifetime value, a customer relationship rather than a transaction. Every one of those is true, and none of them is what determines whether a subscription programme works.'),
    p('What determines it is failed payments, cancellation flows, inventory forecasting, customer service load and the specific ways a recurring charge can go wrong in month seven. The build is a few weeks. The operational reality is permanent, and it is the part nobody demonstrates.'),
    p('So this is the version with the operations in it: how subscriptions actually work on Shopify now, what to decide before building, where the money leaks, and the honest cases where the answer is not to do it.'),

    h2('How do subscriptions work on Shopify now?'),
    p('Through selling plans and a subscription app that manages the billing contract, with checkout handling the payment.'),
    p('Shopify\'s subscription support is native at the platform level — selling plans define the cadence and discount, subscription contracts hold the ongoing relationship, and payment method tokens allow the recurring charge. What the apps provide is the management layer: the billing engine, the customer portal, the retry logic and the reporting.'),
    p('That arrangement is much better than what preceded it. The old approach routed subscription customers through a separate checkout, which meant a different payment experience and a permanent source of confusion. Now the same checkout handles both, which removes an entire class of problem.'),
    table('The pieces and who owns them', [
      ['Piece', 'Owner'],
      ['Selling plan — cadence and discount', 'Shopify'],
      ['Subscription contract', 'Shopify, managed by the app'],
      ['Recurring billing and retries', 'The app'],
      ['Customer portal', 'The app, styled by you'],
      ['Checkout and payment', 'Shopify'],
      ['Inventory and fulfilment', 'You'],
    ]),
    p('The bottom row is the one that generates the work. Everything above it is somebody else\'s system behaving predictably; fulfilment on a recurring schedule is your operation, and it is where subscription programmes actually fail.'),

    h3('The app choice matters less than the operations'),
    p('The major subscription apps are broadly similar in capability and pricing shape, and the differences that matter are in the customer portal and the failed-payment handling rather than in the feature grid. Choosing on portal quality and dunning behaviour is a better filter than counting features.'),
    img('the-pieces', 'A recurring purchase split across platform, application and operational responsibilities', 'Everything above the last row is somebody else’s system behaving predictably. Fulfilment on a schedule is yours.'),

    h2('What should you decide before building?'),
    p('Five things, and getting them wrong is expensive to reverse once customers are on contracts.'),

    h3('Subscribe-and-save, or a curated box?'),
    p('These are different businesses. Subscribe-and-save is a discount on a product somebody already buys — low risk, modest uplift, easy to run. A curated box is a product in its own right with merchandising, forecasting and churn dynamics that have nothing to do with your existing catalogue.'),

    h3('What is the discount, and can you afford it forever?'),
    p('A 15% subscription discount is a permanent margin reduction on your best customers, and the maths only works if retention is genuinely long. Modelling it at a realistic churn rate before launching is the difference between a growth programme and a slow erosion of margin.'),

    h3('What cadences do you offer?'),
    p('Fewer is better. Every interval is another forecasting bucket and another thing for the customer to get wrong. Two options that match real consumption rates beat six that cover every preference and leave people choosing badly.'),

    h3('Can customers skip, pause and change?'),
    p('Yes, and building it properly is not optional. The alternative to a skip button is a cancellation, and stores that make pausing hard trade a delayed order for a lost customer. This is the single highest-leverage decision in the whole programme.'),

    h3('What happens when they cancel?'),
    p('There should be a real flow — a reason captured, an offer to pause or change cadence, and a genuinely easy exit. Making cancellation hard is both increasingly regulated and self-defeating, since a customer forced to call their bank does not come back.'),

    h2('Where does the money actually leak?'),
    p('Failed payments, and it is not close.'),
    p('Cards expire, get replaced after fraud, and decline for insufficient funds. On a monthly subscription, a meaningful percentage of charges fail every cycle, and how the system responds to that determines a large share of the programme\'s revenue. This is called dunning and most stores never look at it.'),

    h3('Retry logic is worth real attention'),
    p('Retrying a declined charge on a sensible schedule recovers a substantial proportion of failed payments, because many declines are temporary. Retrying immediately and giving up recovers far fewer, and the difference between a good and bad retry policy is measured in percent of total revenue.'),

    h3('Tell the customer, in a way that lets them act'),
    p('An email saying the payment failed with a one-click link to update the card recovers more than a system that silently retries. Most involuntary churn is not a decision — it is a customer who did not know, and telling them is the entire intervention.'),

    h3('Watch for expiring cards before they expire'),
    p('Card expiry dates are known in advance, so a prompt a month ahead prevents the failure rather than recovering from it. Some payment providers also update tokens automatically when a card is reissued, which is worth confirming your setup supports.'),

    h3('Separate involuntary from voluntary churn'),
    p('These have completely different fixes and reporting them as one number hides both. A programme losing 8% monthly might be losing 3% to decisions and 5% to payment failures, and only one of those requires changing the product.'),
    img('dunning', 'A declined charge recovered through timed retries and a direct prompt to the customer', 'Most involuntary churn is not a decision — it is a customer who did not know. Telling them is the entire intervention.'),

    h2('What does it do to operations?'),
    p('It converts a variable workload into a fixed one with a deadline, which is harder than it sounds.'),
    p('A normal store ships what it sells. A subscription store has to ship a known quantity on a known date regardless of what else is happening, and that changes purchasing, warehousing and staffing. If a thousand boxes go out on the first Tuesday of the month, that Tuesday is a fixed operational event forever.'),

    h3('Forecasting becomes essential rather than useful'),
    p('You know roughly how many orders are coming, which is a genuine advantage and also an obligation — running out of a subscription component is worse than running out of a normal product, because you have already taken the money and the customer expects it.'),

    h3('Batching helps and creates spikes'),
    p('Charging everyone on the same day makes the operation predictable and creates a single enormous day. Spreading billing across the month smooths the workload and makes reporting harder. Most stores end up somewhere between, and the choice should be made deliberately rather than inherited from a default.'),

    h3('Customer service load is higher per customer'),
    p('Subscribers contact you about skips, address changes, cadence adjustments and charges they forgot about. A good self-service portal removes most of this, and a bad one turns every one of those into an email. This is the strongest argument for choosing an app on portal quality.'),

    h3('Returns and complaints compound'),
    p('An unhappy subscriber is unhappy repeatedly, and a problem in the product shows up as a wave of cancellations one cycle later rather than as a single complaint. The feedback loop is slower and the consequence is larger.'),

    img('ops-calendar', 'A fixed recurring shipping obligation sitting alongside ordinary variable order volume', 'A thousand boxes on the first Tuesday is a fixed operational event forever. That is the part a build quote never contains.'),

    h2('How do you present it on the product page?'),
    p('As a clear choice between one-off and recurring, with the recurring terms stated plainly.'),
    p('The most common implementation failure is a subscription option that is either invisible or pre-selected. Invisible means nobody takes it; pre-selected means people buy a subscription they did not intend to, which produces a refund, a chargeback and a bad review — and it is the pattern regulators are increasingly interested in.'),

    h3('Show the saving, and show the commitment'),
    p('"£24 monthly, save 15%, cancel anytime" answers the three questions somebody has. Showing the discount without the cadence, or the cadence without the exit, leaves the most important one unanswered.'),

    h3('Default to one-off unless the product is genuinely consumable'),
    p('For a replenishable staple, defaulting to subscription is defensible. For anything else, it is a dark pattern with a refund attached. The test is whether a reasonable customer would be surprised by the second charge.'),

    h3('Put the terms where the decision is made'),
    p('Cadence, first charge date, subsequent charge dates and cancellation policy belong next to the option, not in a linked page. This is the same principle as [stating delivery cost on the product page](/blog/product-page-elements) — the answer belongs where the question occurs.'),

    h3('Keep the selector simple'),
    p('A radio pair and, if needed, one cadence dropdown. Subscription selectors have a tendency to accumulate options until the product page has a configuration panel on it, which depresses conversion for both purchase types.'),
    img('selector', 'A clear pair of purchase options with recurring terms stated beside the choice', 'Invisible means nobody takes it; pre-selected means refunds and chargebacks. Show the saving, the cadence and the exit together.'),

    h2('What does the customer portal need?'),
    p('Skip, pause, change cadence, swap products, update payment, change address, and cancel — all without contacting you.'),
    p('Every one of those that is missing becomes a support email, and the one that is most often missing is skip. A customer who wants to delay this month and cannot will cancel instead, and you have converted a one-cycle pause into a permanent loss for want of a button.'),

    h3('Skip is the retention feature'),
    p('It is worth stating on its own because it is so consistently underweighted. Making it prominent rather than buried reduces cancellations measurably, and the revenue delayed by a skip is almost always smaller than the revenue lost to the cancellation it prevents.'),

    h3('Style it to match the store'),
    p('Most portals are configurable and most stores leave them on the default. A portal that looks like a different product undermines the relationship the subscription is supposed to build, and matching it is usually a settings exercise rather than a project.'),

    h3('Send a reminder before every charge'),
    p('A few days ahead, with a link to skip or change. Some jurisdictions require it, and beyond compliance it prevents the "I did not know I was still being charged" complaint that becomes a chargeback and a dispute you lose.'),

    h3('Make cancellation genuinely easy'),
    p('Offer alternatives once — pause, change cadence, a smaller box — and then let them go in one click. A retention flow that traps people generates complaints, regulatory attention and reviews that cost more than the retained revenue.'),

    img('portal', 'A self-service management screen covering skip, pause, cadence, payment and cancellation', 'Every missing action becomes a support email. The one most often missing is skip, and skip is the retention feature.'),

    h2('What should you measure?'),
    p('Four numbers, monthly, and most stores track none of them.'),
    table('The subscription metrics that matter', [
      ['Metric', 'What it tells you'],
      ['Active subscribers', 'The base, and its direction'],
      ['Voluntary churn', 'Whether the product is working'],
      ['Involuntary churn', 'Whether dunning is working'],
      ['Average lifetime', 'Whether the discount is affordable'],
      ['Skip rate', 'Early warning before cancellation'],
    ]),
    p('The last row is the leading indicator. A rising skip rate precedes a rising churn rate by a month or two, which makes it the number that gives you time to act rather than the one that tells you what already happened.'),

    h3('Lifetime is what validates the discount'),
    p('A 15% discount pays for itself at eight cycles and does not at three. Knowing your actual average lifetime is what turns the discount from a guess into a decision, and it is usually shorter than people assume.'),

    h3('Cohort it, do not average it'),
    p('An overall churn number mixes subscribers acquired under different offers, seasons and product versions. Cohorts by signup month show whether things are improving, which an average never does — [the same reason percentiles beat means](/blog/field-vs-lab-data) when the distribution matters.'),

    img('cohorts', 'Retention tracked by signup group rather than collapsed into one average figure', 'An average mixes cohorts acquired under different offers and seasons. Only cohorts show whether things are actually improving.'),

    h2('When is a subscription the wrong answer?'),
    p('More often than the recurring-revenue enthusiasm suggests.'),

    h3('When the product is not consumable'),
    p('If a customer does not naturally need another one on a schedule, a subscription is a discount scheme with extra operational overhead. Durable goods, one-off purchases and anything with a long replacement cycle do not fit.'),

    h3('When you cannot forecast supply'),
    p('Committing to ship monthly for a product with an unreliable supply chain converts a stock problem into a broken promise to people who have already paid. That is a much worse failure than an out-of-stock page.'),

    h3('When the team cannot absorb the service load'),
    p('Subscriptions generate ongoing customer contact, and a business with no capacity for that will handle it badly — which shows up as churn rather than as a support backlog.'),

    h3('When it is being used to fix a demand problem'),
    p('A store whose products do not sell will not fix that by offering them monthly. Recurring revenue amplifies whatever the underlying relationship is, in both directions, and it amplifies indifference into churn.'),
    img('wrong-fit', 'A recurring model applied to a purchase that does not naturally repeat', 'If a customer does not naturally need another one on a schedule, a subscription is a discount scheme with overhead attached.'),

    h2('What does it cost to build?'),
    p('Two to four weeks for a competent implementation, and more of it is operational than technical.'),
    ol([
      '**Choose the app** on portal quality and dunning behaviour rather than the feature grid.',
      '**Define selling plans** — as few cadences as the products genuinely need.',
      '**Build the product page selector,** defaulting to one-off unless the product is consumable.',
      '**Style the portal** and make skip prominent.',
      '**Set up the notification emails** — upcoming charge, failed payment, card expiring.',
      '**Agree the operational calendar** with whoever fulfils the orders.'],
    ),
    p('The last step is the one that gets left out of project plans and the one that determines whether the programme works. A subscription launched without the fulfilment conversation is a marketing campaign with a delivery obligation attached.'),

    h2('What does it cost?'),
    p('The build is weeks; the operation is permanent, and the margin cost is ongoing.'),
    p('Beyond development, the real costs are the discount on your best customers, the app subscription and transaction share, the customer service load, and the operational commitment to a fixed shipping calendar. None of those appear in a build quote and together they exceed it within a few months.'),
    p('The honest counterweight: subscription revenue is genuinely valuable and it is also the most oversold model in commerce. It amplifies an existing relationship rather than creating one — a store with good products and loyal customers will do well with subscriptions, and a store hoping subscriptions will produce loyalty will find that recurring billing simply makes the indifference show up as churn instead of silence. Before building, look at how many customers already order the same thing repeatedly without any prompting. If that number is small, the answer is upstream.'),
    quote('Subscriptions amplify whatever relationship already exists, in both directions. A programme built to create loyalty mostly converts indifference into churn.'),

    h2('Conclusion'),
    p('Shopify handles subscriptions natively now through selling plans and contracts, with the app supplying billing, retries and the customer portal, and the same checkout serving both purchase types. That removes the old split-checkout problem entirely, and it means the app choice comes down to portal quality and failed-payment handling rather than the feature grid.'),
    p('Decide the shape before you build: subscribe-and-save or a curated box, a discount you can afford at realistic churn, as few cadences as the product genuinely needs, and real skip and pause functionality. That last one is the highest-leverage decision available — the alternative to a skip button is a cancellation.'),
    p('Then take dunning seriously, because failed payments are where the money leaks. Cards expire and decline routinely, sensible retry schedules recover a large share of them, and a direct prompt to update the card recovers more than silent retries. Report involuntary churn separately from voluntary, since only one of them means the product is wrong.'),
    p('Present it as a clear choice with the terms beside it — the saving, the cadence and the exit — and default to one-off unless the product is genuinely consumable. Anything else produces refunds, chargebacks and regulatory attention. Send a reminder before every charge and make cancellation one click after offering an alternative once.'),
    p('Track active subscribers, voluntary churn, involuntary churn, average lifetime and skip rate, cohorted by signup month, because skip rate is the leading indicator that gives you time to act. And check the premise first: if very few customers already reorder without prompting, subscriptions will amplify that rather than fix it. If you want the build and the operational plan handled together, [that is the conversation to have](/start).'),
  ),
  faqs: faq([
    ['Do I need an app for Shopify subscriptions?',
     'Yes, though less of one than before. Shopify provides selling plans, subscription contracts and checkout support natively; the app supplies the billing engine, retry logic, customer portal and reporting. Choose on portal quality and failed-payment handling rather than on the feature list.'],
    ['What is the biggest source of lost subscription revenue?',
     'Failed payments. Cards expire, get reissued after fraud and decline for insufficient funds every cycle. Good retry scheduling recovers a large share of these, and emailing the customer with a one-click card update recovers more than silent retries ever will.'],
    ['Should the subscription option be selected by default?',
     'Only for genuinely consumable products a customer would expect to reorder. For anything else it is a dark pattern that produces refunds, chargebacks and complaints. The test is whether a reasonable customer would be surprised by the second charge.'],
    ['What is the most important feature in the customer portal?',
     'Skip. A subscriber who wants to delay one delivery and cannot find a way to do it will cancel instead, turning a one-cycle pause into a permanent loss. Making skip prominent rather than buried reduces cancellations more than any retention offer.'],
    ['When are subscriptions a bad idea?',
     'When the product is not naturally consumable, when supply cannot be forecast reliably enough to promise a monthly shipment, when the team has no capacity for ongoing customer contact, or when the underlying problem is that the products are not selling. Recurring billing amplifies, it does not create.'],
  ]),
};
