import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/custom-vs-premium-shopify-theme/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-custom-vs-premium-shopify-theme',
  slug: 'custom-vs-premium-shopify-theme',
  title: 'Custom Theme or Premium Theme? How I Decide',
  category: 'ecommerce',
  order: 90,
  readTime: '13 min read',
  date: 'May 2026',
  publishedAt: '2026-05-24',
  series: 'Shopify storefront',
  excerpt:
    'A £300 theme covers most stores completely. A custom build is right for a narrow set of them. The deciding factor is usually not what people think.',
  coverLabel: 'Theme choice — cover',
  body: body(
    p('A premium Shopify theme costs a few hundred pounds and takes a week or two to set up properly. A custom theme costs several weeks of development and produces something nobody else has. Most stores should buy the theme, and the ones that should not can usually tell you why in one sentence.'),
    p('The uncomfortable part is that the reason people give for wanting custom — "we want to stand out" — is rarely the reason that justifies it. Standing out is mostly photography, copy and product, and those work fine in a purchased theme. What justifies custom is a purchase flow the theme system cannot express.'),
    p('So here is the honest decision framework, including the third option most people skip and the specific signals that make me recommend each one.'),

    h2('What are you actually choosing between?'),
    p('Three options, not two, and the middle one is where a lot of stores belong.'),
    table('The three routes', [
      ['', 'Free theme', 'Premium theme', 'Custom theme'],
      ['Cost', 'Nothing', 'A few hundred', 'Several weeks of build'],
      ['Time to live', 'Days', 'One to three weeks', 'Six to twelve weeks'],
      ['Design range', 'Narrow', 'Wide within its shape', 'Whatever you draw'],
      ['Performance', 'Usually good', 'Heavy by default', 'As good as you build'],
      ['Maintenance', 'Vendor updates', 'Vendor updates', 'You own it'],
      ['Sections and editor', 'Included', 'Extensive', 'Only what you build'],
    ]),
    p('The row people underweight is the last one. A premium theme arrives with dozens of sections a merchandiser can arrange without a developer, and a custom theme arrives with exactly the sections you paid somebody to build. That difference decides how fast the store can move for the next two years.'),

    h3('Free themes are better than their reputation'),
    p('Shopify\'s own themes are well built, genuinely fast, and adequate for a store that is finding out whether it has a market. Starting there and spending the theme budget on photography is frequently the better allocation, and it is easy to move later.'),

    h3('Premium does not mean better made'),
    p('A commercial theme is built to sell to thousands of different merchants, which means it carries every feature any of them might want. That is a design constraint pulling against performance, and it is why a premium theme is often slower out of the box than the free one it replaced — the mechanism behind most [Shopify speed problems](/blog/shopify-performance-optimization).'),
    img('three-routes', 'Three starting points arranged by cost against how much of the result is decided for you', 'Three options, not two. The row people underweight is who can change the site next month without a developer.'),

    h2('When is a premium theme the right answer?'),
    p('Almost always, and the cases are worth naming so you can check yourself against them.'),

    h3('Your products fit a conventional shape'),
    p('If a customer picks a product, chooses a size or colour, and buys it, every theme on the marketplace handles that flow well. Building it again from scratch produces the same page with a bespoke bill attached.'),

    h3('You need to be live this quarter'),
    p('A theme goes live in weeks. A custom build does not, and the revenue from being open two months earlier is usually larger than the difference between a good theme and a bespoke one.'),

    h3('Nobody on the team writes code'),
    p('This is the decisive one for many stores. A purchased theme means the marketing team can build a campaign page themselves. A custom theme means they file a ticket. If there is no developer in the picture, custom is a trap regardless of budget.'),

    h3('Your differentiation is not the layout'),
    p('For most stores the thing that makes a customer choose you is the product, the price, the delivery promise and the photography — none of which require a bespoke template. A conventional layout filled with excellent photographs beats a distinctive layout filled with mediocre ones, every time and by a wide margin.'),

    h3('You are still learning what the store needs'),
    p('Committing a custom build to a merchandising strategy you are still testing means paying to encode assumptions. A theme lets you rearrange cheaply while you find out what works, which is worth more than a distinctive layout in year one.'),

    h2('When does custom actually pay?'),
    p('When the purchase flow itself is the product, or when volume makes small percentages large.'),
    p('These cases are real and they are narrower than the industry sells. If none of the following describes your store, the money is better spent elsewhere.'),

    h3('The buying flow is unusual'),
    p('Made-to-measure, a configurator, bundle building, quantity-break pricing, a quiz that determines the product — these fight the theme system, and the workarounds cost more over time than building the flow properly once.'),

    h3('The catalogue has an unusual structure'),
    p('Products with dozens of interdependent options, or hierarchies a standard collection page cannot express, produce a filtering and navigation problem that themes solve badly. That is a genuine engineering requirement rather than a design preference.'),

    h3('Performance is measurably costing revenue at volume'),
    p('At meaningful traffic, a theme carrying features you do not use is a real cost, and a purpose-built theme shipping only what the store needs recovers it. Note the sequence: this justifies custom only after [cleaning up the theme you have](/blog/shopify-performance-optimization) has failed to close the gap.'),

    h3('The brand experience is the differentiator'),
    p('For a premium brand where the site is part of the product, a theme that a hundred other stores use undermines the positioning. This is a legitimate reason and it is the one most often claimed by stores for which it is not true.'),
    img('custom-signals', 'A narrow set of conditions under which building from scratch is the cheaper path', 'The cases are real and narrower than the industry sells. An unusual purchase flow is the strongest of them.'),

    h2('What does the middle option look like?'),
    p('A premium theme, stripped and rebuilt where it matters, keeping the parts that work.'),
    p('This is what I actually do for most clients who arrive asking for custom, and it gets a large share of the benefit for a fraction of the cost. You buy a well-structured theme, delete what the store does not use, rewrite the product page and the collection page to your own design, and leave the rest.'),

    h3('The product page is where to spend'),
    p('It is the page that converts and the page most constrained by the theme\'s assumptions. Rebuilding just this one, properly, with your photography, your delivery messaging and your trust signals, is often the entire custom requirement.'),

    h3('Keep the sections a merchandiser uses'),
    p('The editor experience is the thing custom builds lose, so keep it deliberately. Leaving the theme\'s section library intact for campaign pages while replacing the templates that convert is the best of both — and it is the arrangement that survives contact with a marketing team.'),

    h3('Delete aggressively, then measure'),
    p('Removing unused sections, scripts and styles from a premium theme regularly halves its weight. Do that before deciding the theme is too slow, because the theme is rarely too slow — the theme plus twelve apps plus unoptimised images is too slow.'),

    h3('Version control it either way'),
    p('A theme edited without version control is a store where nobody can safely change anything. Whichever route you take, the theme belongs in a repository with a review step — the same baseline as [everything else I set up](/stack).'),

    h2('What does custom actually cost?'),
    p('More than the build quote, and the gap is the part worth planning for.'),
    table('Costs beyond the initial build', [
      ['Item', 'Premium theme', 'Custom theme'],
      ['Initial', 'Theme price plus setup', 'Full build'],
      ['New section later', 'Often already exists', 'Development each time'],
      ['Shopify platform changes', 'Vendor updates it', 'You update it'],
      ['New app integration', 'Usually drops in', 'Often needs theme work'],
      ['Design refresh', 'Change settings', 'Development'],
      ['Developer availability', 'Optional', 'Required, ongoing'],
    ]),
    p('The last row is the one that turns a good custom theme into a stalled store. A bespoke theme with no developer attached is a site that cannot change, and that state arrives quietly about eight months after launch when the original builder has moved on.'),

    h3('Budget for the sections, not just the templates'),
    p('The quote covers the pages in the design. What it usually does not cover is the fifteen reusable sections the marketing team will want over the following year. Agreeing a handful of flexible ones up front is much cheaper than commissioning them one at a time.'),

    h3('Handover matters more here'),
    p('With a purchased theme, the vendor documents it. With a custom one, whoever built it is the documentation unless somebody wrote it down. A proper handover — repository access, deployment steps, a note on how the sections work — is what keeps the store maintainable, and it should be [part of the deal](/blog/project-handover-checklist).'),

    img('middle-option', 'A purchased foundation with two templates replaced and the rest left intact', 'Rebuild the product and collection pages, keep the section library. This is where most stores asking for custom actually belong.'),

    h2('What happens when you switch themes?'),
    p('Less than people fear on the data side, and more than they expect on the content side.'),
    p('Products, orders, customers, inventory and discounts live in Shopify and are entirely unaffected by a theme change — you can install a new theme, preview it, and publish without touching any of that. What does not move is everything the old theme stored in its own settings, and that is where the work is.'),

    h3('Theme settings do not transfer'),
    p('Homepage layouts, section arrangements, colour schemes, custom code snippets and anything a merchandiser configured over two years belong to the theme, not the store. Switching means rebuilding those, and the time it takes is proportional to how much the old theme was used rather than to how good the new one is.'),

    h3('Metafields and app blocks need checking'),
    p('Custom fields shown on product pages are stored on the products and survive, but the code displaying them lives in the theme and does not. The same goes for app blocks placed into sections. Both are quick to reinstate and slow to notice missing, so walk the templates deliberately before publishing.'),

    h3('Test the whole purchase path before publishing'),
    p('Preview mode covers the browsing experience and not always the edge cases — variant selection with an out-of-stock combination, a discount code, an express payment on a phone. Running one real transaction through the new theme catches things a preview does not.'),
    img('theme-switch', 'Commercial data unaffected while presentation settings are rebuilt from scratch', 'Products and orders are untouched. Everything a merchandiser configured belongs to the old theme and has to be rebuilt.'),

    h2('How do you evaluate a premium theme?'),
    p('On the demo store, with a throttled connection, not on the marketing page.'),

    h3('Run the demo through a real measurement'),
    p('Every theme looks fast in its own screenshots. Open the demo\'s product page on a throttled mobile profile and look at the weight and the LCP. The spread between themes is large and the marketplace does not surface it.'),

    h3('Count what it does that you do not need'),
    p('A theme advertising forty sections and six homepage variants is carrying all of that for you to use three. That flexibility is the thing you will be deleting, so prefer the theme that is closest to what you want rather than the one that can become the most things.'),

    h3('Check how it handles your worst product'),
    p('The one with fifteen variants, or a very long description, or a name that wraps to three lines. Themes look excellent with the demo\'s tidy catalogue and reveal their assumptions on a real one.'),

    h3('Read the support and refund terms before buying'),
    p('Theme vendors differ widely on what happens after the sale. Some answer questions for a year; some consider the transaction finished at download. Shopify\'s marketplace has a refund policy and third-party marketplaces frequently do not, which matters because you only discover a theme\'s real constraints once your own catalogue is in it.'),

    h3('Look at the update history'),
    p('An actively maintained theme gets fixes and keeps up with platform changes. One that has not been updated in a year is a liability regardless of how good it looks, because Shopify keeps moving.'),
    img('evaluate-demo', 'A theme demonstration being measured under constrained conditions rather than viewed', 'Every theme looks fast in its own screenshots. Open the demo product page on a throttled profile — the spread is large.'),

    h2('Does a custom theme make the store faster?'),
    p('It can, and it does not automatically — the same trap as going headless.'),
    p('A custom theme is fast if somebody made performance a requirement. If the brief was a design and the build met the design, it can easily ship more than the premium theme it replaced, because now there is no vendor optimising it and no constraint from having to work everywhere.'),

    h3('Make it a stated requirement with a number'),
    p('"Product page under 500KB and field LCP under 2 seconds on mobile" is a requirement. "Fast" is not, and it will lose to a hero video in the second week. Put the number in the brief.'),

    h3('The apps still dominate'),
    p('A perfect custom theme with eight app scripts on the product page is a slow store. The theme is one input and usually not the largest — [the third-party scripts are](/blog/third-party-script-cost), whichever theme they sit in.'),

    h3('Check it in the field afterwards'),
    p('A launch-day Lighthouse screenshot proves nothing about real customers. The assessment that matters arrives weeks later from real devices, which is [the number worth judging on](/blog/field-vs-lab-data).'),

    img('speed-requirement', 'A performance figure written into a brief alongside the visual requirements', '"Product page under 500KB, field LCP under 2 seconds on mobile" is a requirement. "Fast" loses to a hero video in week two.'),

    h2('What do I recommend, in practice?'),
    p('A premium theme for most stores, a stripped-and-rebuilt one for the ambitious, and custom for the narrow case that genuinely needs it.'),
    ol([
      '**Starting out or testing a market** — a free Shopify theme, and spend the budget on photography.',
      '**Established, conventional catalogue** — a premium theme chosen on measured performance, set up properly, cleaned of what you do not use.',
      '**Growing, brand-led, some development available** — premium theme with the product and collection pages rebuilt, section library kept.',
      '**Unusual purchase flow, or volume where points matter** — custom, with a performance number in the brief and a developer retained.',
    ]),
    p('Most stores that ask me for the fourth belong in the third, and telling them so has never once turned out to be wrong advice — though it has occasionally been unwelcome.'),

    h2('What does it cost to be wrong?'),
    p('Asymmetric, which is what should make the decision easy.'),
    p('Choosing a premium theme when custom would have been better costs you some performance and some distinctiveness, and you can commission the custom build later with a year of real data about what the store actually needs. Choosing custom when a theme would have done costs the build, the ongoing developer dependency, and a marketing team who cannot change the site.'),
    p('The honest counterweight: I build custom themes and it is better work than configuring somebody else\'s. That is exactly why the advice above is worth stating plainly — the incentive runs the other way. A store that buys a theme, cleans it properly and spends the difference on photography and traffic will usually outperform the same store with a bespoke build and no budget left, and anyone selling you the bespoke build should be willing to say so.'),
    quote('Standing out is photography, copy and product. Those all work in a theme somebody else wrote. What justifies custom is a purchase flow the theme cannot express.'),

    h2('Conclusion'),
    p('There are three routes rather than two, and the free Shopify themes are better than their reputation — for a store still finding its market, the theme budget is usually better spent on photography. Premium does not mean better made, either: a commercial theme carries every feature any merchant might want, which is a constraint pulling directly against speed.'),
    p('Buy the theme when your products fit a conventional flow, when you need to be live this quarter, when you are still learning what the store needs, and above all when nobody on the team writes code. That last one decides it — a custom theme with no developer attached becomes a store that cannot change, about eight months after launch.'),
    p('Build custom when the purchase flow itself is unusual, when the catalogue has a structure themes handle badly, when the brand experience genuinely is the differentiator, or when volume makes a few points of performance worth real money — and in that last case only after cleaning up the theme you already have.'),
    p('Consider the middle option first, because it is where most stores asking for custom actually belong: buy a well-structured theme, delete what you do not use, rebuild the product and collection pages to your own design, and keep the section library so a merchandiser can still build a campaign page without you.'),
    p('Whichever you choose, evaluate the demo under throttling rather than on the marketing page, put a performance number in the brief rather than the word "fast", and keep the theme in version control with a review step. If you want a straight recommendation for your particular store, [that is a short conversation](/start).'),
  ),
  faqs: faq([
    ['Is a premium Shopify theme worth the money?',
     'For most stores, yes. A few hundred pounds buys a well-tested storefront that goes live in weeks and gives merchandisers dozens of sections they can arrange without a developer. The main cost is weight — commercial themes carry features you will not use, which is why cleanup matters.'],
    ['When does a custom Shopify theme make sense?',
     'When the purchase flow is genuinely unusual — made-to-measure, configurators, bundle building, quiz-driven selection — or when the catalogue has a structure standard collection pages handle badly. Volume where a few points of conversion pays for the build is the other case.'],
    ['Will a custom theme be faster than a premium one?',
     'Only if performance was a stated requirement with a number attached. A custom theme built purely to a design can easily ship more than the premium theme it replaced, since no vendor is optimising it. And app scripts usually dominate the page weight regardless of the theme.'],
    ['What is the middle option between the two?',
     'Buy a well-structured premium theme, delete the sections and scripts you do not use, and rebuild the product and collection pages to your own design while keeping the theme’s section library intact. This gets most of the benefit and preserves the editor experience custom builds lose.'],
    ['What happens if I choose wrong?',
     'The risk is asymmetric. Picking a theme when custom would have suited costs some performance and distinctiveness, and you can commission the build later with real data. Picking custom when a theme would have done costs the build, an ongoing developer dependency, and a site nobody else can change.'],
  ]),
};
