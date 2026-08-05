import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/shopify-hydrogen-worth-it/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-shopify-hydrogen-worth-it',
  slug: 'shopify-hydrogen-worth-it',
  title: 'Is Headless Shopify Worth It? An Honest Answer',
  category: 'ecommerce',
  order: 87,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-11',
  series: 'Headless commerce',
  excerpt:
    'Going headless cut one store’s load time by 58% and lifted mobile conversion 24%. It also cost more to build and more to run. When that trade makes sense.',
  coverLabel: 'Headless Shopify — cover',
  body: body(
    p('I rebuilt a fashion retailer\'s storefront headless on Hydrogen with a Next.js front end. Page load time fell 58%, mobile conversion rose 24%, Lighthouse went to 98, and the cutover had no downtime. Those are good numbers and they are the reason people ask me about headless.'),
    p('They are also not an argument that headless is right for you. That project had a specific set of conditions — a mobile-heavy audience, a theme fighting its own page weight, and a merchandising team who had stopped asking for things because the answer was always "that needs a developer". Change any of those and the same rebuild is a worse business than leaving it alone.'),
    p('So this is the version with the costs in it. What you actually gain, what you actually give up, what it costs to build and to keep, and the specific situations where I recommend against it.'),

    h2('What does headless actually mean here?'),
    p('You keep Shopify for everything commercial and replace only the storefront.'),
    p('Products, inventory, orders, discounts, customers, payments and checkout stay exactly where they are, in the Shopify admin your team already uses. What changes is the layer that renders pages: instead of Liquid templates served by Shopify, a front end you control queries the Storefront API and renders whatever it likes.'),
    table('What moves and what does not', [
      ['Concern', 'Standard theme', 'Headless'],
      ['Product data', 'Shopify', 'Shopify — via Storefront API'],
      ['Checkout', 'Shopify', 'Shopify — you redirect to it'],
      ['Payments, orders, inventory', 'Shopify', 'Shopify'],
      ['Templates and routing', 'Liquid, Shopify-hosted', 'Yours, your host'],
      ['Apps with front-end scripts', 'Drop in', 'Reimplement or lose'],
      ['Theme editor sections', 'Full', 'Only what you build'],
    ]),
    p('The bottom two rows are where the cost lives, and they are the two nobody quotes when they estimate this. Everything above them is genuinely fine.'),

    h3('Hydrogen is Shopify\'s own answer'),
    p('Hydrogen is a React framework with commerce primitives — cart, product, variant selection — built on Remix conventions, deployed to Oxygen, Shopify\'s hosting. It exists so you do not build the commerce plumbing yourself, and it is the sensible default if you have decided to go headless.'),

    h3('You do not have to use Hydrogen'),
    p('The Storefront API is a GraphQL endpoint and anything can call it. Next.js, Astro, SvelteKit — all fine, and the choice matters less than people think because the hard parts are the cart and the checkout handoff, not the rendering. Where the site is largely content with a store attached, [a mostly-static architecture](/blog/astro-vs-nextjs) is often a better fit than a full React app.'),
    img('what-moves', 'A commerce backend left intact while only the presentation layer is replaced', 'Products, orders, inventory and checkout all stay in Shopify. Only the layer that renders pages changes hands.'),

    h2('What do you actually gain?'),
    p('Control over performance, and control over what the front end can be.'),
    p('A Liquid theme is fast enough until it is not, and what makes it not fast is rarely Shopify — it is six apps injecting scripts, a theme built for flexibility rather than speed, and a page weight nobody owns. Headless does not automatically fix that, but it makes it fixable, because every byte on the page is one you chose to put there.'),

    h3('The performance ceiling is much higher'),
    p('On the rebuild I mentioned, most of the 58% came from three things: removing app scripts that had accumulated over two years, serving properly sized images at modern formats, and rendering the product page from the edge instead of assembling it per request. Two of those were possible in a theme. The third was not, and it was the largest.'),

    h3('The front end can be anything'),
    p('A store that needs a configurator, a quiz, a subscription flow or a genuinely custom product page is fighting the theme system. Headless removes that constraint entirely — you are writing an application that happens to sell things.'),

    h3('Content and commerce in one place'),
    p('Editorial content in Shopify is workable and not good. A headless front end can pull products from Shopify and articles from a proper CMS and render them in the same layout, which is what a brand-led store usually wants and cannot easily have otherwise.'),

    h3('Your team owns the stack'),
    p('The front end lives in your repository with your CI, your review process and your rollback. For a team with developers, that is a meaningful improvement over theme deployment. For a team without them, it is the problem — see below.'),

    h2('What do you give up?'),
    p('The ecosystem, and the ability for non-developers to change the site.'),
    p('This is the part that gets discovered after the decision. Shopify\'s value is not only its checkout — it is that thousands of apps drop into a theme and work, and that a merchandiser can rearrange a landing page without opening a ticket. Headless costs you a large share of both.'),

    h3('Apps that inject front-end scripts stop working'),
    p('Reviews, upsells, quizzes, loyalty widgets, live search — anything whose integration is a script tag in a theme has no theme to inject into. Some vendors offer a headless SDK or a plain API. Many do not, and the honest options are reimplementing the feature, switching vendors, or dropping it.'),

    h3('Audit the apps before you commit'),
    p('This is the single most valuable hour in the whole decision. List every installed app, mark which ones touch the storefront, and check each one for headless support. I have seen this audit end the conversation twice, both times correctly.'),
    table('How storefront apps tend to fare', [
      ['App type', 'Headless outlook'],
      ['Reviews', 'Usually has an API — rebuild the display'],
      ['Search and filtering', 'Often supported, sometimes better'],
      ['Upsell and bundling', 'Frequently theme-only — rebuild'],
      ['Loyalty and rewards', 'Mixed; check before committing'],
      ['Page builders', 'Gone entirely, by definition'],
      ['Back-office apps', 'Unaffected — they never touched the theme'],
    ]),

    h3('The theme editor goes away'),
    p('Whatever a merchandiser could do themselves, they now cannot, unless you build it back. That means either a CMS with editable page sections — real work, and worth doing — or a developer in the loop for every campaign. Underestimating this is the most common way a headless project makes a team slower rather than faster.'),
    img('app-audit', 'A list of installed integrations sorted by whether each survives the move', 'The most valuable hour in the decision: list every app, mark which touch the storefront, check each for headless support.'),

    h2('What does checkout look like?'),
    p('Still Shopify\'s, and that is not a limitation worth fighting.'),
    p('Your front end builds a cart through the Storefront API and hands off to Shopify\'s hosted checkout for payment. On Plus you get more control over it; below that you get very little. Either way, the highest-converting and most compliance-sensitive part of the funnel remains somebody else\'s problem, which is a good arrangement.'),

    h3('The handoff is visible'),
    p('The customer moves from your domain to a Shopify checkout domain, and if the two look different the transition reads as a broken flow at exactly the wrong moment. Matching the checkout branding to the storefront closely is not cosmetic work — it is conversion work.'),

    h3('Do not try to rebuild checkout'),
    p('The Storefront API can drive a custom checkout and doing so takes on PCI scope, fraud handling, tax logic, wallet payments and every edge case Shopify has already solved. The number of stores that should do this is very small and yours is probably not one of them.'),

    h3('Cart state is yours now'),
    p('Persisting the cart across sessions and devices is handled by the theme in a standard store and by you in a headless one. It is not difficult and it is one of several small responsibilities that add up to why this costs more than it looks.'),
    p('The related detail worth planning for is what happens after checkout. The customer returns from Shopify\'s domain to a thank-you page, and getting that redirect, the order confirmation and any post-purchase tracking right is a small piece of work that is invisible until the first real order goes through it. Test it with a live transaction before launch rather than a draft order — the two do not follow identical paths.'),
    img('checkout-handoff', 'A cart assembled on one domain being passed to a hosted payment flow on another', 'The handoff is visible to the customer. Matching the checkout branding closely is conversion work, not cosmetic work.'),

    h2('Is it actually faster?'),
    p('It can be substantially faster, and it is not faster by default — a badly built headless store is slower than a good theme.'),
    p('Headless gives you a higher ceiling, not a better floor. A React storefront that ships 600KB of JavaScript, fetches products client-side and loads the same six app scripts is worse than the Liquid theme it replaced. I have seen that outcome and it is not rare.'),

    h3('Where the wins actually come from'),
    p('Edge rendering with cached product data, images at correct sizes in modern formats, and ruthless control over third-party scripts. Those three account for most of the improvement on every rebuild I have done — and two of them are things you should [do to a theme first](/blog/third-party-script-cost) before concluding you need a rebuild.'),

    h3('Measure the theme before deciding'),
    p('Run the existing store through field data, not a Lighthouse screenshot. If the 75th percentile LCP is failing because of app scripts and unoptimised images, that is fixable in place for a fraction of the cost — and knowing [which number to trust](/blog/field-vs-lab-data) is what keeps this from becoming an expensive answer to a cheap problem.'),

    h3('The conversion link is real but indirect'),
    p('The 24% mobile conversion lift on that project came alongside the speed improvement, not straightforwardly because of it — the rebuild also fixed a product page that buried the add-to-cart below three folds. Attributing all of it to performance would be dishonest, and separating the two is why [running experiments](/blog/near-zero-cls) matters more than a single before-and-after.'),
    img('ceiling-not-floor', 'Two possible outcomes from the same architecture, one well above and one below the starting point', 'Headless raises the ceiling, not the floor. A React storefront shipping 600KB is slower than the theme it replaced.'),

    h2('What does it cost to build?'),
    p('Several times a theme customisation, and the range is wide because the app situation drives it.'),
    table('Rough build comparison', [
      ['', 'Premium theme, customised', 'Headless rebuild'],
      ['Initial build', 'Weeks', 'Months'],
      ['App integration', 'Install', 'Rebuild or replace each'],
      ['Editor experience', 'Included', 'Build it or lose it'],
      ['Hosting', 'Included in Shopify', 'Separate, ongoing'],
      ['Ongoing maintenance', 'Theme updates', 'A full application'],
    ]),
    p('The row that surprises people is the fourth. A theme is hosted by Shopify at no additional cost; a headless front end needs hosting, a build pipeline and monitoring, and while that bill is usually modest it is a new line item and a new thing that can be down at 2am.'),

    h3('Budget for the editor experience explicitly'),
    p('If you do not, the project ships and the marketing team cannot change a homepage banner. Building editable sections into a CMS is often a quarter of the total effort and it is the part most likely to be cut when the timeline slips — which is precisely the wrong thing to cut.'),

    h3('It is an application now, permanently'),
    p('A theme is maintained by updating it. A headless storefront has dependencies, a build, a deployment and an on-call story. That means [staging, CI, error tracking and uptime monitoring](/stack) are not optional extras — they are the cost of the architecture.'),

    img('cost-shape', 'A build estimate with a large portion allocated to work outside the visible storefront', 'The surprise line is hosting and the editor experience — neither appears in a theme project, and both are permanent.'),

    h2('When should you actually do it?'),
    p('When at least two of these are true, and preferably three.'),
    ol([
      '**Performance is measurably costing you money** on mobile, and you have already removed the app scripts and fixed the images.',
      '**The theme system is blocking the product** — a configurator, a subscription flow, a genuinely custom purchase path.',
      '**Content is central to the brand** and Shopify\'s editorial tooling is holding it back.',
      '**You have developers**, in-house or retained, who will still be there in a year.',
      '**Volume justifies it** — a store doing meaningful revenue where a few percent of conversion pays for the build many times over.',
    ]),
    p('One of these alone is usually not enough. Performance alone, in particular, is the weakest reason to go headless, because it is the one most often solvable without the rebuild.'),

    h3('The case that keeps recurring'),
    p('A brand doing solid volume, majority mobile traffic, a theme carrying two years of accumulated apps, and a marketing team who want the site to do things a theme cannot. That combination is where the numbers at the top of this post came from, and it is the shape I say yes to.'),

    h3('The case I say no to'),
    p('A store under a certain size with no developer, whose real problem is a slow theme and six apps. The correct advice there is to fix the theme, and it is worth about a tenth of what a rebuild costs. Saying so has cost me projects and it has never once been wrong.'),
    img('decision', 'A set of conditions with a threshold that must be met on more than one before proceeding', 'One reason is rarely enough. Performance alone is the weakest case, because it is usually the one solvable without a rebuild.'),

    h2('What about the middle ground?'),
    p('There is more of it than the headless-or-theme framing suggests, and it is where most stores should look first.'),

    h3('Fix the theme properly'),
    p('Removing dead apps, deferring the ones that remain, optimising images and cutting unused Liquid regularly takes a struggling store most of the way to where a rebuild would land, for a fraction of the cost. It is unglamorous and it is the highest return per hour available in commerce work.'),

    h3('Hydrogen for part of the site'),
    p('A headless landing page, campaign microsite or configurator alongside a standard theme is a legitimate architecture. You get the flexibility where it pays and keep the theme where it works — and the Storefront API does not care that two front ends are talking to it.'),

    h3('A custom theme rather than a premium one'),
    p('A theme built for your store, rather than a flexible commercial theme carrying features you do not use, closes much of the performance gap while keeping the entire ecosystem. This is the option most often skipped and it deserves a serious look.'),

    img('middle-ground', 'Intermediate options sitting between an untouched theme and a full rebuild', 'A cleaned theme, a custom theme, or Hydrogen for one part of the site. Most stores should exhaust these first.'),

    h2('What does it cost to be wrong?'),
    p('Not catastrophic, which is the genuinely good news here.'),
    p('Because Shopify remains the system of record, a headless front end that does not work out can be turned off. The products, orders, customers and inventory were never anywhere else. You revert to a theme, you lose the build cost, and the business continues. Compared with a replatform, the downside is contained.'),
    p('The honest counterweight to everything above: I have delivered a headless rebuild that produced excellent numbers, and I have talked two other clients out of one. The second outcome was worth more to those businesses than the first was to mine. Headless is a real capability with a real cost, and the most common mistake is buying the capability before exhausting the cheap version of the same result — so measure the theme, audit the apps, and be genuinely willing to conclude that a fortnight of cleanup beats a quarter of rebuilding.'),
    quote('Headless raises the ceiling on what a storefront can be. It does nothing for the floor, and most struggling stores have a floor problem.'),

    h2('Conclusion'),
    p('Headless Shopify means keeping Shopify for products, orders, inventory and checkout, and replacing only the layer that renders pages. What you gain is a much higher performance ceiling and a front end that can be anything. What you give up is the app ecosystem and the theme editor, and those two are where the unbudgeted cost lives.'),
    p('Audit your storefront apps before anything else — it is an hour, and reviews, upsells, loyalty widgets and page builders are the ones that most often do not survive. Then budget the editor experience explicitly, because a store whose marketing team needs a developer to move a banner has been made slower, not faster, whatever the load time says.'),
    p('Do not expect speed for free. The gains come from edge-rendered cached product data, correctly sized modern images and ruthless control of third-party scripts — and two of those three are available in a theme today for a fraction of the price. A React storefront shipping 600KB is slower than the Liquid it replaced.'),
    p('Go headless when several conditions hold at once: measurable mobile performance cost that survives the cheap fixes, a product the theme system genuinely blocks, content central to the brand, developers who will still be there in a year, and volume where a few points of conversion pays for the work. Performance alone is the weakest of those.'),
    p('And look hard at the middle ground first — a properly cleaned theme, a custom theme instead of a premium one, or Hydrogen for one part of the site. If you want a straight answer about which side of that line your store is on, [that is a short conversation](/start), and the work either way is [what I do](/services).'),
  ),
  faqs: faq([
    ['Does headless Shopify replace Shopify?',
     'No. Products, inventory, orders, customers, discounts, payments and checkout all stay in Shopify and your team keeps the same admin. Only the storefront rendering moves — your front end queries the Storefront API and hands off to Shopify’s hosted checkout for payment.'],
    ['Will my Shopify apps still work?',
     'Back-office apps are unaffected. Anything that injects a script into the theme — reviews, upsells, loyalty widgets, page builders — has no theme to inject into. Some vendors provide a headless SDK or API; many do not. Auditing your installed apps is the first hour of this decision.'],
    ['Is headless automatically faster than a Liquid theme?',
     'No. It raises the ceiling, not the floor. A headless storefront shipping heavy JavaScript and fetching products client-side is slower than a good theme. The real gains come from edge-rendered cached data, correct image sizing and removing third-party scripts — two of which you can do in a theme.'],
    ['What does going headless cost compared with a theme?',
     'Several times more to build and meaningfully more to run. A theme is hosted by Shopify; a headless front end needs its own hosting, build pipeline, error tracking and uptime monitoring. Budget the editor experience separately — it is often a quarter of the work and the first thing cut.'],
    ['Can I go back if it does not work out?',
     'Yes, and this is the reassuring part. Shopify remains the system of record throughout, so products, orders and customers were never anywhere else. Reverting to a theme costs you the build investment but not the business, which makes this far less risky than a full replatform.'],
  ]),
};
