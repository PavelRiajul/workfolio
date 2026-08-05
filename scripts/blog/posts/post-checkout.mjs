import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/shopify-checkout-customization/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-shopify-checkout-customization',
  slug: 'shopify-checkout-customization',
  title: 'How Much of Shopify Checkout Can You Change?',
  category: 'ecommerce',
  order: 96,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-20',
  series: 'Shopify storefront',
  excerpt:
    'Less than you want and more than you think. What is configurable, what needs Plus, what needs an extension, and what you should not touch at all.',
  coverLabel: 'Checkout customisation — cover',
  body: body(
    p('Checkout is the one part of a Shopify store you cannot rewrite, and that is deliberate. It handles payment, fraud, tax, wallets and compliance, and Shopify has spent years optimising it across an enormous sample of transactions. Every constraint you run into there is protecting something.'),
    p('That does not mean it is fixed. Between theme settings, checkout branding, Shopify Functions and checkout UI extensions, there is a real amount you can change — and a smaller amount you should. The trick is knowing which category a given request falls into before you promise anybody a timeline.'),
    p('This is the map: what is available on every plan, what needs Plus, what needs code, and the things worth doing versus the things people ask for and regret.'),

    h2('Why is checkout locked down?'),
    p('Because it is the highest-consequence surface in commerce and it converts better than anything you would build.'),
    p('A checkout handles card data, regional tax rules, address validation across dozens of formats, wallet integrations, fraud scoring and a long tail of payment methods. Getting any of those wrong costs money directly or creates a compliance problem. Shopify absorbs that entire surface, and the price of that is that you cannot restructure it.'),
    p('The second reason is empirical. Shopify tests its checkout against a volume of transactions no individual store can approach, so the default arrangement is usually better than a bespoke alternative — which makes most of the customisation people want a request to make the funnel worse in a way that feels like control.'),
    table('What you can change, and what it takes', [
      ['Change', 'Requirement'],
      ['Logo, colours, typography', 'Any plan — checkout branding'],
      ['Guest checkout, required fields', 'Any plan — settings'],
      ['Order status page content', 'Any plan — additional scripts'],
      ['Discount and shipping logic', 'Shopify Functions'],
      ['Extra fields, banners, upsells', 'Checkout UI extensions'],
      ['Custom layout or step order', 'Plus, within limits'],
      ['Replacing checkout entirely', 'Not advisable'],
    ]),
    p('Most requests land in the middle three rows, which is good news — those are supported paths rather than workarounds, and they survive platform updates.'),

    h3('The old script-based approach is gone'),
    p('If you find a tutorial about `checkout.liquid`, it is describing a deprecated approach. Extensibility replaced it, and anything still relying on the old mechanism is on borrowed time. Building new work on Functions and UI extensions is the only durable option.'),
    img('locked-surface', 'A payment flow enclosed by a boundary with defined extension points around its edges', 'Every constraint here is protecting something — card data, tax rules, fraud scoring. The extension points are the supported way in.'),

    h2('What can you change on any plan?'),
    p('More than most stores bother with, and the branding is the part that actually matters.'),

    h3('Checkout branding'),
    p('Logo, colours, fonts, corner radii and button styles are configurable in the admin without code. This is the highest-value change available because the handoff from your storefront to a checkout that looks like a different company reads as a redirect gone wrong, at the least forgiving moment in the funnel.'),
    p('Match it closely rather than approximately. The same accent colour, the same button shape, the same typeface if it is available. A customer should not be able to tell that the domain changed, and every point of visual discontinuity is a moment of doubt in a flow where doubt is expensive.'),

    h3('Guest checkout'),
    p('A setting, and forcing account creation is among the most expensive defaults available. Offer the account after the purchase, when the customer has a reason to want one. This is a checkbox and it is worth more than most design work.'),

    h3('Which fields are required'),
    p('Company name, second address line and phone number can each be optional, required or hidden. Every unnecessary required field is friction, and phone number in particular is one people resist giving. Require it only if the carrier genuinely needs it.'),

    h3('The order status page'),
    p('It accepts additional scripts, which is where post-purchase tracking belongs and where the completed order becomes visible to your analytics. Without this, [every experiment result is missing its outcome](/blog/posthog-ab-testing-shopify), because the store sees people leave for checkout and never learns what happened.'),

    h2('What do Shopify Functions do?'),
    p('They let you change checkout logic — discounts, shipping, payment options, bundles — with code that runs on Shopify\'s infrastructure.'),
    p('A Function is a small program, compiled to WebAssembly, that Shopify executes at a defined point in the checkout. It receives structured input and returns structured output, and because it runs server-side within the platform there is no script on the page and no latency added to the customer.'),

    h3('Discount logic beyond what the admin allows'),
    p('Tiered discounts, buy-one-get-one across specific collections, customer-segment pricing, quantity breaks. All of this used to require an app rewriting the cart; a Function expresses it directly and applies it consistently in checkout.'),

    h3('Hiding or reordering shipping and payment methods'),
    p('Hiding express shipping for addresses it cannot serve, hiding cash on delivery above an order value, promoting a method for a particular region. These are common requests and they are exactly what Functions are for.'),

    h3('They run everywhere, which is the point'),
    p('Cart logic implemented in the theme applies only where the theme runs. A Function applies in checkout, in draft orders and through the API — so a rule cannot be bypassed by a route you forgot about. That consistency is the real argument for moving logic into them.'),

    h3('They are code, with the usual obligations'),
    p('A Function is deployed software: it needs a repository, review, testing and somebody who understands it in a year. That is a step up from configuring an app, and it is why the decision to write one should be deliberate rather than incidental.'),
    img('functions', 'Business rules evaluated within the platform rather than by a script on the page', 'A Function runs server-side, so it adds no page weight and applies everywhere — checkout, draft orders and API alike.'),

    h2('What are checkout UI extensions?'),
    p('Small components you can place at defined points in the checkout to show information or collect input.'),
    p('An extension renders in a sandboxed frame using Shopify\'s own components, so it inherits the checkout\'s styling and accessibility rather than fighting it. You get placement, not layout control — which is the constraint that keeps a hundred thousand checkouts from degrading individually.'),

    h3('Collect the thing you actually need'),
    p('A delivery instruction, a gift message, a VAT number, a purchase order reference. These are genuine requirements and the extension point exists precisely so they do not have to become a note in the order comments.'),

    h3('Show trust and delivery information'),
    p('A returns statement or a delivery estimate at the payment step addresses the hesitation that occurs there. It is the same content as [on the product page](/blog/product-page-elements), repeated at the moment of commitment where it does the most work.'),

    h3('Post-purchase upsells convert well'),
    p('An offer after payment and before the thank-you page is the one upsell placement that does not risk the original order, because the money is already taken. On stores with a natural add-on it is a genuine revenue increase for modest effort.'),

    h3('Every extension is a decision point'),
    p('Each addition is something else for a customer to read while deciding whether to pay. Two well-chosen extensions help; five turn a fast flow into a page of components. The default answer to "can we add a field" should be no unless somebody can say what happens to the data.'),

    p('One caution about extension points: they are versioned, and Shopify deprecates targets as the checkout evolves. An extension written against a placement that later disappears stops rendering, usually without an obvious failure — which is an argument for keeping the number of them small and knowing who owns each one.'),
    img('ui-extensions', 'Small components placed at fixed points within a payment flow rather than freely positioned', 'You get placement, not layout control. Two well-chosen extensions help; five turn a fast flow into a page of components.'),

    h2('What needs Shopify Plus?'),
    p('The deeper layout control, and a few things that matter at scale.'),

    h3('More branding control'),
    p('Plus exposes more of the checkout\'s appearance — layout variants, more granular styling, and the ability to depart further from the default arrangement. For a brand where the checkout visibly not matching is a genuine problem, this is the main reason it is on the list.'),

    h3('Checkout on your own domain'),
    p('Reducing the visible discontinuity of the handoff. It is a real improvement in perceived continuity and it is one of the more concrete things the plan buys.'),

    h3('Scripts and B2B features'),
    p('Wholesale pricing, customer-specific catalogues and payment terms are Plus features and they are what usually justifies it for a business selling to other businesses — much more than the checkout styling does.'),

    h3('Do not upgrade for the checkout alone'),
    p('The cost difference is substantial and the checkout gains are incremental. Plus makes sense when the volume, the B2B requirements or the multi-store needs justify it; upgrading to change a layout is an expensive way to buy a small visual improvement.'),
    img('plus-tier', 'Additional configuration becoming available only above a certain plan boundary', 'Plus buys layout control and a checkout on your own domain. It rarely justifies itself on checkout styling alone.'),

    h2('What should you not do?'),
    p('Four things people ask for that make the funnel worse.'),

    h3('Do not build your own checkout'),
    p('The Storefront API can drive one, and doing so takes on PCI scope, fraud handling, tax calculation, wallet support, address validation and every regional edge case Shopify has already solved. The number of stores for which this is correct is very small, and it is a decision that should survive a serious conversation about liability. It applies equally [when going headless](/blog/shopify-hydrogen-worth-it) — the storefront moves, the checkout stays.'),

    h3('Do not add steps'),
    p('Every additional screen loses people. A survey, an upsell interstitial or a confirmation step inserted before payment costs orders, and the data collected is worth less than the orders lost. If you need the information, ask afterwards.'),

    h3('Do not advertise the discount field'),
    p('A prominent empty promo box tells a shopper that a better price exists and they do not have it. Some leave to hunt for a code and do not return. Collapsed behind a small link, it stays available to those who have one — [one of the cheapest fixes in the whole funnel](/blog/ecommerce-conversion-leaks).'),

    h3('Do not collect data you have nowhere to put'),
    p('A custom field added at checkout has to arrive somewhere a human or a system will read it. A delivery instruction that lands in an order note nobody opens is worse than not asking, because the customer believes it was received. Decide the destination before adding the field.'),

    h3('Do not put wallets below the form'),
    p('Express payment buttons convert well specifically because they remove typing an address on a phone. Placed underneath the form, they are only reached by people who have already done the typing, which defeats the purpose entirely.'),

    img('do-not', 'Additions to a payment flow that each introduce a new reason to stop', 'Every extra step loses people. If you need the information, ask after payment rather than before it.'),

    h2('How do you test checkout changes?'),
    p('Carefully, with real transactions, because the failure mode is lost orders rather than a bug report.'),

    h3('Use a test payment gateway first'),
    p('Shopify provides a test mode that lets you complete orders without charging anything, which is the right place to walk the whole flow — including the failure paths, a declined card and an invalid address.'),

    h3('Then do one real transaction'),
    p('Test mode does not exercise every path, and a small real order on the live store catches the things it misses: the actual payment provider, the real confirmation email, the order status page scripts. Refund it afterwards.'),

    h3('Test on a phone, on mobile data'),
    p('Most checkouts happen on phones, frequently on a connection worse than your office wifi. A wallet flow that works on desktop and stalls on a cellular connection is a common and invisible failure.'),

    h3('Check the emails as well as the pages'),
    p('The order confirmation, shipping notification and refund emails are part of checkout as customers experience it, and they are edited in a different place than everything else — which is why they are the part most often left on the default template with a mismatched logo.'),
    img('test-flow', 'A purchase path exercised end to end including the failure branches, not only the success case', 'Test mode for the whole flow including declines, then one real transaction. The failure mode here is lost orders.'),

    h2('What actually moves the number?'),
    p('Three things, and none of them are visual.'),
    ol([
      '**Guest checkout enabled** — a setting, and one of the largest single effects available.',
      '**Express wallets placed above the form** — removes address typing on the device where most orders happen.',
      '**The discount field collapsed** — stops sending price-sensitive shoppers away to search for a code.'],
    ),
    p('All three are configuration rather than development, and a store that has not done them is leaving more on the table than any extension will recover. Do these before commissioning anything.'),

    h3('Then match the branding'),
    p('Once the mechanics are right, visual continuity across the handoff is the next most valuable change, and it is also free. It is worth an hour of careful matching rather than fifteen minutes of approximate matching.'),

    h3('Then check the abandoned-checkout data'),
    p('Shopify records checkouts that were started and not completed, including where the customer stopped. That is a free diagnostic most stores never open, and it points at the specific step losing people rather than requiring a hypothesis about it.'),

    h3('Then measure before adding anything'),
    p('An extension that adds a field or a message should be justified by a number, not by a preference. Checkout is the part of the funnel where changes are most likely to do harm, so the burden of proof is higher here than anywhere else.'),

    h2('What does it cost?'),
    p('An afternoon for the settings and branding, and a few days per Function or extension.'),
    p('The configuration work — guest checkout, required fields, wallet placement, branding, order status scripts — is an afternoon and it captures most of the available benefit. A Function is a couple of days including testing and deployment. A UI extension is similar, plus whatever it takes to decide the data has somewhere to go.'),
    p('The honest counterweight: the strongest advice in this whole area is to change very little. Shopify\'s checkout converts well because it has been tested against a volume of transactions no store can match, and most requests to customise it are attempts to make it feel more like the brand at the cost of making it work slightly less well. Do the three configuration changes, match the branding, and then require a genuine number before touching anything else — the checkout you did not build is usually the one that performs best.'),
    quote('Every constraint in Shopify checkout is protecting something. Most customisation requests are asking to make the funnel worse in a way that feels like control.'),

    h2('Conclusion'),
    p('Checkout is deliberately constrained because it carries payment, tax, fraud and compliance, and because Shopify has optimised it against a volume of transactions no individual store can approach. The extension points — branding settings, Shopify Functions, checkout UI extensions — are the supported way in, and anything relying on the old `checkout.liquid` approach is on borrowed time.'),
    p('Start with what every plan allows, because that is where the value is. Enable guest checkout, make unnecessary fields optional, put express wallets above the form rather than below it, and collapse the discount field behind a link. Those are settings, they cost an afternoon, and they beat anything you could commission.'),
    p('Match the checkout branding closely rather than approximately — same accent, same button shape, same typeface. A customer noticing the domain changed is a moment of doubt at the least forgiving point in the funnel, and closing that gap is free.'),
    p('Use Functions for logic that must apply everywhere — tiered discounts, hiding shipping methods by region, quantity breaks — because they run server-side and cannot be bypassed by a route you forgot. Use UI extensions sparingly for information you genuinely need, and remember post-purchase upsells are the one placement that cannot cost you the original order.'),
    p('Then test properly: the whole flow in test mode including declines and invalid addresses, one real transaction on the live store, on a phone over mobile data, and check the emails as well as the pages. And keep the bar high — this is the part of the funnel where a change is most likely to do harm. If you want a checkout review as part of a wider audit, [that is part of the CRO work](/services).'),
  ),
  faqs: faq([
    ['Can I fully customise Shopify checkout?',
     'No, and that is deliberate — it handles payment, tax, fraud and compliance. You can change branding on any plan, alter logic with Shopify Functions, and add components at defined points with checkout UI extensions. Layout control is limited and largely reserved for Plus.'],
    ['What is the single best checkout change I can make?',
     'Enable guest checkout if you have not. Forcing account creation before purchase is among the most expensive defaults available and it is a setting rather than a project. Moving express wallet buttons above the form is a close second, since most orders happen on phones.'],
    ['Do I need Shopify Plus to customise checkout?',
     'Not for branding, guest checkout, required fields, Functions or UI extensions — all available on standard plans. Plus adds deeper layout control, checkout on your own domain, and B2B features. Upgrading purely for checkout styling is an expensive way to buy a small improvement.'],
    ['Should I remove the discount code field?',
     'Collapse it behind a small link rather than removing it. A prominent empty promo box signals that a better price exists which the shopper does not have, and some leave to search for a code and never return. Behind a link, it stays available to anyone who actually has one.'],
    ['Can I build my own checkout with the Storefront API?',
     'Technically yes, and almost no store should. You take on PCI scope, fraud handling, tax calculation, wallet support, address validation and every regional edge case Shopify already solves. This holds even when going headless — the storefront moves and the checkout stays.'],
  ]),
};
