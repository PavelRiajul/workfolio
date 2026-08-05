import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/shopify-performance-optimization/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-shopify-performance-optimization',
  slug: 'shopify-performance-optimization',
  title: 'Making a Shopify Theme Fast Without Going Headless',
  category: 'ecommerce',
  order: 89,
  readTime: '13 min read',
  date: 'May 2026',
  publishedAt: '2026-05-22',
  series: 'Shopify storefront',
  excerpt:
    'Most slow Shopify stores are slow for four reasons, none of them Shopify. A day of the right work usually beats a quarter of rebuilding.',
  coverLabel: 'Shopify performance — cover',
  body: body(
    p('When a store is slow, the conversation jumps to headless quickly, and it should not. In almost every audit I have run, the platform was not the problem — twelve apps, a theme built to sell to a thousand different merchants, and a hero image nobody had looked at since launch were the problem.'),
    p('That matters because the two paths are not comparable. Cleaning up a theme is days of unglamorous work with a known outcome. Rebuilding headless is months, and it only pays off under [a specific set of conditions](/blog/shopify-hydrogen-worth-it). Doing the cheap version first is how you find out which situation you are actually in.'),
    p('Here is the work, in the order that removes the most milliseconds per hour spent.'),

    h2('What is actually slow?'),
    p('Find out before touching anything, because the intuitive answer is wrong often enough to waste a week.'),
    p('Open the product page — not the homepage — on a throttled mobile profile and look at the waterfall. Then check the field data, because a synthetic run on your laptop is a best case and the store is being judged on real phones. If those two disagree, the field number is the one that counts.'),
    table('Where the seconds usually are', [
      ['Cause', 'Typical share', 'Fixable in a theme'],
      ['Third-party app scripts', '30–50%', 'Yes'],
      ['Unoptimised images', '20–35%', 'Yes'],
      ['Theme JavaScript and CSS', '10–25%', 'Yes'],
      ['Fonts', '5–15%', 'Yes'],
      ['Shopify itself', '5–10%', 'No, and it is rarely the issue'],
    ]),
    p('Note the bottom row. Shopify\'s own response time is fast and consistent, and the share of a slow page it accounts for is small. Every other row is yours.'),

    h3('Measure the product page, not the homepage'),
    p('The homepage gets the attention and the product page carries the revenue. It is also usually heavier, because it loads the reviews app, the upsell app and the size-guide app that the homepage does not.'),

    h3('Get a baseline you can point at later'),
    p('Record the numbers before you start — field LCP at the 75th percentile, total page weight, request count, and the count of distinct third-party origins. Without them you cannot demonstrate the improvement, and demonstrating it is what buys you time to do the rest.'),
    img('waterfall', 'A loading sequence dominated by requests to origins other than the store itself', 'Look at the product page on a throttled mobile profile. Shopify itself is rarely more than a tenth of what you see.'),

    h2('Why are apps the biggest problem?'),
    p('Because each one is a script from another origin that nobody owns, and stores accumulate them faster than they remove them.'),
    p('A typical store installs an app for reviews, one for upsells, one for a size chart, one for loyalty, one for a popup, one for analytics the marketing agency wanted, and one that was trialled two years ago and never uninstalled. Each adds a connection setup, a download and main-thread execution — and the last one adds all of that for a feature nobody uses.'),

    h3('Uninstalling is not enough'),
    p('This catches almost everyone. Removing an app from the admin frequently leaves its script tags and Liquid snippets behind in the theme, so a store can be paying for apps it stopped using a year ago. Searching the theme for the vendor\'s domain is the only reliable check.'),

    h3('Census the origins'),
    p('The fastest way to see the true situation is to list every non-Shopify origin the page requests and what each one costs in requests, bytes and time. The technique is the same as [auditing third parties on any site](/blog/third-party-script-cost), and on a store the list is usually longer than the owner expects.'),

    h3('Defer everything that is not needed to render'),
    p('Reviews below the fold, chat widgets, loyalty badges and popups do not need to load during first paint. Deferring them until idle or until the section approaches the viewport routinely removes several hundred milliseconds without removing a feature.'),

    h3('Replace the heaviest app with theme code'),
    p('A size chart is a table. A recently-viewed carousel is a few lines of local storage. Some apps are shipping a few hundred kilobytes for something the theme could do in twenty lines, and swapping those out is the highest-value change on many stores.'),
    img('app-census', 'A list of external origins with the request count and time attributable to each', 'Uninstalling an app often leaves its script in the theme. Search for the vendor domain — stores pay for apps they stopped using.'),

    h2('What do you do about images?'),
    p('Serve them at the size they display, in a modern format, and stop the CDN doing it at full resolution.'),
    p('Shopify\'s image CDN will resize and convert for you, and the theme has to ask. A product image referenced without a size parameter is served at whatever the merchant uploaded, which is frequently a 3000px file in a 600px slot — [the single largest source of wasted bytes](/blog/image-optimization-strategy) on almost any site.'),
    code('liquid', `
{%- comment -%} Ask the CDN for widths, and describe the layout. {%- endcomment -%}
<img
  src="{{ product.featured_image | image_url: width: 800 }}"
  srcset="{{ product.featured_image | image_url: width: 400 }} 400w,
          {{ product.featured_image | image_url: width: 800 }} 800w,
          {{ product.featured_image | image_url: width: 1200 }} 1200w"
  sizes="(max-width: 640px) 100vw, 50vw"
  width="{{ product.featured_image.width }}"
  height="{{ product.featured_image.height }}"
  alt="{{ product.featured_image.alt | escape }}"
  loading="lazy" decoding="async">
`),

    h3('The sizes attribute is the one that gets skipped'),
    p('Without it the browser assumes the image fills the viewport and picks the largest candidate, so a `srcset` alone often makes a collection grid heavier rather than lighter. Describing the layout is the actual work and it is why a snippet worth reusing is worth writing once.'),

    h3('Never lazy-load the first product image'),
    p('It is the LCP element on a product page. Marking it `loading="lazy"` tells the browser to wait until it confirms the image is in view, which delays the exact thing being measured. Eager, with `fetchpriority="high"`, is correct for the first one and lazy for everything after.'),

    h3('Set width and height on everything'),
    p('Shopify exposes the dimensions on the image object, so there is no excuse for an unreserved box. Missing dimensions are the most common cause of [layout shift on a product page](/blog/near-zero-cls), and a shifting page produces mis-taps that cost orders directly.'),

    h3('Cap what merchandisers can upload'),
    p('A 6MB phone photograph dropped into a collection banner undoes the whole exercise silently. A stated limit and a resize step in whatever process adds images prevents the problem where it starts.'),

    h2('How much theme code can you remove?'),
    p('On a commercial theme, a surprising amount — it was built to support features you are not using.'),
    p('A premium theme ships slideshows, mega-menus, quick-view modals, currency switchers, countdown timers and a dozen section types, because it has to sell to merchants who want all of them. Your store uses perhaps a third. The rest is CSS and JavaScript downloaded and parsed on every page for nothing.'),

    h3('Find the unused CSS and JavaScript'),
    p('The Coverage panel reports how much of each file went unexecuted on a given page. A theme showing 70% unused JavaScript on the product page is normal and is a large, safe saving once you know which parts are dead.'),

    h3('Delete sections you will never enable'),
    p('Removing a section file removes its CSS and JS along with it. This is safe when the section is not used in any template, and the theme editor tells you which are. Keep the deletions in version control so they survive a theme update.'),

    h3('Split the CSS by template'),
    p('Product-page styles do not need to load on the collection page. Most themes ship one large stylesheet because it is simpler; splitting the largest chunks by template is a genuine win on a heavy theme, and it is [the same reasoning as bundle splitting anywhere else](/blog/bundle-splitting).'),

    h3('Watch for jQuery'),
    p('Older themes and older apps still pull it in, sometimes twice at different versions. It is worth checking, because removing a duplicate copy is free and finding one usually means finding other things too.'),
    img('unused-code', 'A large portion of downloaded styles and scripts marked as never executed', 'A commercial theme showing 70% unused JavaScript on the product page is normal. It was built to sell to a thousand merchants.'),

    h2('What about fonts?'),
    p('Two families, two weights, preloaded and swapped — and Shopify makes part of this easy.'),
    p('Fonts block text from rendering and a store using four weights of two custom families is downloading several hundred kilobytes before a word appears. The fix is boring and effective: fewer weights, `font-display: swap`, and a preload for the one used above the fold.'),

    h3('Use Shopify\'s font_face filter'),
    p('For fonts from Shopify\'s library, `font_face` emits a correct declaration and serves from Shopify\'s CDN, which removes a third-party origin. Where the brand allows it, this is the simplest option available.'),

    h3('Self-host anything else'),
    p('A custom font loaded from a third-party font service is a DNS lookup, a handshake and a stylesheet before the font file is even requested. Hosting the file yourself removes all of that, and it is [the same change worth making on any site](/blog/self-host-fonts-inline-icons).'),

    h3('Subset if the family is large'),
    p('A font covering scripts your store does not sell in is downloading glyphs nobody will see. Subsetting to the Latin range typically halves the file, and for a display face used only in headings the saving is larger still.'),

    img('font-budget', 'A type stack reduced to a small number of families and weights loaded ahead of first paint', 'Two families, two weights, preloaded and swapped. Fonts block text from rendering, so this is cheap and immediately visible.'),

    h2('Which Shopify-specific things actually matter?'),
    p('A few, and they are not the ones people talk about.'),

    h3('Use sections everywhere, but not endlessly'),
    p('Online Store 2.0 sections are good for merchandiser control and each one is more Liquid to render and more CSS to ship. A page with twenty sections where five would do costs both server render time and page weight.'),

    h3('Keep Liquid loops small'),
    p('Rendering a loop over every product in a large collection, or nesting metafield lookups inside a loop, shows up as server response time before anything reaches the browser. Paginating and limiting is the fix, and it is easy to do accidentally when a collection grows.'),

    h3('Metafields are cheap to read and easy to overuse'),
    p('A handful per product is fine. Dozens, each fetched individually inside a template, is a measurable cost — worth structuring deliberately rather than adding one at a time until it hurts.'),

    h3('The theme check tool exists'),
    p('Shopify ships a linter for themes that catches performance anti-patterns along with correctness issues. Running it is minutes and it finds things a manual review does not.'),
    img('liquid-cost', 'Template rendering work occurring before any bytes leave the server', 'Loops over large collections and metafield lookups inside them show up as server response time, before the browser sees anything.'),

    h2('Does the Shopify speed score matter?'),
    p('It is a rough directional signal and it is not the number to optimise against.'),
    p('The score in the admin is a lab measurement of a sample of pages, and it moves for reasons that have nothing to do with your changes. It is useful for noticing a large regression and misleading as a target — the same distinction as [any lab number versus field data](/blog/field-vs-lab-data).'),

    h3('Judge on field data'),
    p('The Core Web Vitals assessment for your store is what search ranks on and what reflects real customers. Chasing the admin score while field LCP stays flat is a common and unproductive pattern.'),

    h3('Comparing to other stores is not useful'),
    p('The score is affected by the sample of pages, the traffic mix and the apps installed. Two stores with the same score can have very different real experiences, which makes cross-store comparison close to meaningless.'),

    h2('In what order should you do this?'),
    p('Highest saving per hour first, which puts the unglamorous work at the top.'),
    ol([
      '**Remove dead apps and their leftover script tags** — often the single largest win, and it is deletion rather than development.',
      '**Defer the apps that remain** until idle or viewport, so nothing non-essential runs during first paint.',
      '**Fix the images** — CDN width parameters, a real `sizes` attribute, eager first image, dimensions on everything.',
      '**Cut unused theme CSS and JavaScript,** guided by the Coverage panel rather than by guessing.',
      '**Sort out the fonts** — fewer weights, self-hosted or Shopify-served, preloaded and swapped.',
    ]),
    p('The first two are usually most of the improvement and require no design decisions, which makes them the easiest to get agreed. Do them alone first and measure, so the effect is attributable.'),

    h3('Ship in small batches on a duplicated theme'),
    p('Duplicate the live theme, change one category of thing, preview it, publish. Batching five changes into one release means a regression is a bisect rather than a revert — and on a store, a regression is lost orders while you work it out.'),
    img('work-order', 'A ranked sequence of interventions with deletion tasks placed ahead of development tasks', 'The first two steps are deletion, not development. They are usually most of the win and the easiest to get agreed.'),

    h2('What results should you expect?'),
    p('On a neglected store, roughly a halving of page weight and a second or more off mobile LCP.'),
    p('A representative case: 4.1MB product page, 2.9 seconds field LCP at the 75th percentile, eleven third-party origins. Removing three dead apps and their orphaned script tags, deferring four more, fixing image widths and cutting unused theme code took it to 1.3MB and 1.6 seconds, over about four days. No rebuild, no design change, no app the merchant was actually using.'),

    h3('The conversion effect is real and smaller than the headlines'),
    p('Going from three seconds to 1.6 on mobile produces a measurable lift, and it is a few percent rather than the doubling that case studies imply. Speed is a floor — it stops you losing people who never see the page, and it does not by itself persuade anybody to buy. [The rest of the funnel](/blog/ecommerce-conversion-leaks) is where the larger numbers live.'),

    h3('It will drift back'),
    p('Apps get installed, images get uploaded, sections get added. Without a check, a store returns to roughly where it started within a year — which is the argument for a budget rather than a cleanup.'),

    img('before-after', 'A page weight and load time roughly halved without any change to what the page contains', '4.1MB to 1.3MB and 2.9s to 1.6s over four days. No rebuild, no design change, no app the merchant was using.'),

    h2('How do you keep it fast?'),
    p('A stated limit and somebody who owns it, because this category always regrows.'),

    h3('One person approves app installs'),
    p('Not to block them, but to ask what the last one cost and whether the new one has a lighter alternative. Most stores have never had this conversation and it takes ten minutes.'),

    h3('Recheck quarterly'),
    p('Fifteen minutes: page weight, request count, distinct origins, field LCP. Compared against the baseline you recorded, it either confirms things are stable or catches the drift while it is still small.'),

    h3('Write down what was removed and why'),
    p('Otherwise somebody reinstalls the app you deleted, because nothing recorded that it cost 400KB for a feature nobody used. A short note in the theme repository is enough.'),

    h2('What does it cost?'),
    p('Three to five days for a full pass on a neglected store, and an afternoon a quarter afterwards.'),
    p('The audit is a day. The app cleanup and deferral is a day or two, mostly spent testing that nothing broke. Images and theme code are another day or two. None of it is difficult and most of it is deletion, which is why it is a fraction of the cost of a rebuild for a large share of the benefit.'),
    p('The honest counterweight: this work has a ceiling. A commercial theme carrying two years of merchandising decisions will not reach the numbers a purpose-built storefront can, and there is a point where further cleanup returns very little. If a store is already lean and mobile performance is still costing measurable revenue, that is the genuine case for a rebuild — but you can only know you are there by doing the cheap work first, and most stores never do.'),
    quote('Almost every slow Shopify store is slow for reasons that have nothing to do with Shopify. Four days of deletion usually beats a quarter of rebuilding.'),

    h2('Conclusion'),
    p('Start by measuring the product page on a throttled mobile profile and record a baseline — field LCP at the 75th percentile, page weight, request count, distinct third-party origins. Shopify itself accounts for a small share of a slow page; everything else on the list is yours to fix.'),
    p('Apps are the biggest item and the cheapest to address, because most of the work is deletion. Uninstalling in the admin often leaves script tags behind, so search the theme for the vendor domain — stores routinely carry apps they stopped paying attention to a year ago. Defer everything that is not needed for first paint, and replace the heaviest ones with theme code where the feature is a table or twenty lines of JavaScript.'),
    p('Then images: ask the Shopify CDN for real widths, write a genuine `sizes` attribute, set width and height from the image object, and keep the first product image eager while lazy-loading the rest. A `srcset` without `sizes` makes a collection grid heavier, not lighter.'),
    p('Cut unused theme code using the Coverage panel rather than intuition — 70% unused JavaScript on a commercial theme is normal — and reduce the fonts to two families and two weights, self-hosted or served by Shopify, preloaded and swapped.'),
    p('Expect roughly half the page weight and a second or more off mobile LCP on a neglected store, from three to five days of work. Then keep it there with one person approving app installs and a fifteen-minute check each quarter, or it comes back within a year. If you want this run properly on your store, [it is one of the things I do](/services).'),
  ),
  faqs: faq([
    ['Is Shopify itself slow?',
     'No. Shopify’s own response time is fast and consistent, and it typically accounts for well under a tenth of a slow page. In nearly every audit the seconds come from third-party app scripts, unoptimised images, unused theme code and fonts — all of which are yours to fix.'],
    ['Why is my store still loading an app I uninstalled?',
     'Uninstalling from the admin frequently leaves the app’s script tags and Liquid snippets behind in the theme. The only reliable check is searching the theme files for the vendor’s domain. Stores commonly carry scripts from apps they stopped using more than a year ago.'],
    ['Should I lazy-load my product images?',
     'Every one except the first. The main product image is the LCP element, and marking it loading="lazy" tells the browser to wait until it confirms the image is in view, delaying exactly what is being measured. Keep it eager with fetchpriority="high" and lazy-load the rest.'],
    ['Does the speed score in my Shopify admin matter?',
     'Only as a rough signal. It is a lab measurement of a sample of pages and it moves for reasons unrelated to your changes, which makes it useful for spotting a large regression and poor as a target. Judge the work on field Core Web Vitals, which is what search actually assesses.'],
    ['How much faster can a theme get without going headless?',
     'On a neglected store, typically about half the page weight and a second or more off mobile LCP, in three to five days. That is most of what a rebuild would achieve for a fraction of the cost. There is a ceiling, but you cannot tell whether you have hit it until you do this first.'],
  ]),
};
