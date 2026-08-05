import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/shopify-product-schema/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-shopify-product-schema',
  slug: 'shopify-product-schema',
  title: 'Product Schema on Shopify, Done Properly',
  category: 'ecommerce',
  order: 94,
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-03',
  series: 'Shopify storefront',
  excerpt:
    'Rich results need structured data that matches the page exactly. Most Shopify themes emit something close enough to look fine and wrong enough to fail.',
  coverLabel: 'Product schema — cover',
  body: body(
    p('Structured data is the difference between a plain blue link and a search result carrying a price, a stock status and a star rating. On a product page that difference is a measurable share of the clicks, and it costs a Liquid snippet.'),
    p('The reason it is worth writing about is that most themes ship something already, and most of what they ship is subtly wrong — a price that ignores the selected variant, an availability value that is out of date, a rating aggregated from reviews the page does not show. Google is strict about the match between markup and page, and "close enough" is the state that produces a warning in Search Console and no rich result.'),
    p('So: what to emit, how to build it from Liquid, what breaks it, and how to check.'),

    h2('What does structured data actually buy you?'),
    p('Eligibility for rich results, and a machine-readable description of what you sell.'),
    p('Correct `Product` markup makes a listing eligible for price, availability and review stars in search, and feeds the merchant listings that appear in shopping surfaces. Eligibility is not a guarantee — Google decides per query — but without the markup there is no possibility at all.'),
    table('What each property enables', [
      ['Property', 'Effect in search'],
      ['name, image, description', 'The basic product entity'],
      ['offers.price, priceCurrency', 'Price shown in the result'],
      ['offers.availability', 'In stock / out of stock label'],
      ['aggregateRating, review', 'Star rating and count'],
      ['brand', 'Brand association and disambiguation'],
      ['gtin, mpn, sku', 'Matching to the same product elsewhere'],
      ['shippingDetails, hasMerchantReturnPolicy', 'Delivery and returns in the result'],
    ]),
    p('The bottom row is the one most stores skip and it has become one of the more visible. Delivery cost and return window shown directly in a search result answers two of the buyer questions before they have clicked — the same two that [decide the sale on the page itself](/blog/product-page-elements).'),

    h3('It also feeds things that are not Google'),
    p('The same markup is read by AI assistants, price comparison services and anything else parsing the page. A store with accurate structured data is legible to systems that were not built when the markup was added, which is a reasonable argument for doing it properly rather than minimally.'),

    h3('JSON-LD, not microdata'),
    p('Google prefers JSON-LD and it is far easier to maintain, because the data sits in one block rather than being woven through the markup as attributes. A theme still using microdata on the product page is worth migrating.'),
    img('rich-result', 'A search listing carrying price, availability and rating rather than a plain title and description', 'Correct markup makes a listing eligible for price, stock and stars. Without it there is no possibility at all.'),

    h2('What does a correct product block look like?'),
    p('One JSON-LD script, built from the product and the selected variant.'),
    code('liquid', `
{%- assign v = product.selected_or_first_available_variant -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": {{ product.title | json }},
  "description": {{ product.description | strip_html | truncate: 500 | json }},
  "image": [
    {%- for image in product.images limit: 5 -%}
      {{ image | image_url: width: 1200 | prepend: "https:" | json }}
      {%- unless forloop.last -%},{%- endunless -%}
    {%- endfor -%}
  ],
  "sku": {{ v.sku | json }},
  "brand": { "@type": "Brand", "name": {{ product.vendor | json }} },
  "offers": {
    "@type": "Offer",
    "url": {{ request.origin | append: product.url | append: v.url | json }},
    "price": {{ v.price | divided_by: 100.0 | json }},
    "priceCurrency": {{ cart.currency.iso_code | json }},
    "availability": "https://schema.org/{% if v.available %}InStock{% else %}OutOfStock{% endif %}",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
</script>
`),
    p('Three details in there matter more than the rest: `json` filters on every value, the price divided by 100, and the availability derived from the actual variant rather than the product.'),
    p('The snippet belongs in the product template rather than the theme layout, and it is worth putting in its own file so that a future theme update does not quietly overwrite it alongside everything else in the template.'),

    h3('Always use the json filter'),
    p('A product title containing a quotation mark, an apostrophe or a line break will break the entire block without it, and the failure is silent — the page renders, the markup is invalid, and nothing tells you. This single filter prevents the most common cause of broken schema on Shopify.'),

    h3('Prices are in cents'),
    p('Shopify stores money as an integer, so `product.price` is 2499 rather than 24.99. Emitting the raw value advertises a price a hundred times too high, which is both a warning and a genuinely bad look if it reaches a shopping surface.'),

    h3('Use the selected variant, not the product'),
    p('`product.price` is the minimum across variants. If a shirt is £29 in small and £34 in large, the page shows one price and the markup claims another, which is the mismatch Google penalises. Deriving everything from `selected_or_first_available_variant` keeps them aligned.'),

    h2('How do you handle multiple variants?'),
    p('Either one offer for the selected variant, or an `AggregateOffer` describing the range — and the choice depends on your URLs.'),

    h3('If variants have their own URLs, emit one offer'),
    p('When `?variant=` produces a distinct indexable page, each of those pages should describe exactly that variant. This is the cleanest arrangement and the one that produces the most accurate results.'),

    h3('If there is one URL, use AggregateOffer'),
    p('A single product page covering a price range should say so rather than picking one number. `lowPrice`, `highPrice` and `offerCount` describe the reality, and search results show a range.'),
    code('json', `
"offers": {
  "@type": "AggregateOffer",
  "lowPrice": 29.00,
  "highPrice": 34.00,
  "priceCurrency": "GBP",
  "offerCount": 4,
  "availability": "https://schema.org/InStock"
}
`),

    h3('Update it when the variant changes'),
    p('If your page swaps price and availability on variant selection without a reload — which it should, because [reloading to change a size feels broken](/blog/product-page-elements) — the JSON-LD becomes stale. Crawlers render pages, so a block that no longer matches the visible price is a mismatch. Rewriting the script content on variant change is a few lines and worth it.'),

    h3('Do not mark up variants you do not sell'),
    p('An offer for a combination that has never existed produces a warning and, worse, a shopping listing for something nobody can buy. Only emit combinations Shopify actually has.'),
    img('variant-mismatch', 'A displayed price differing from the value described in the page metadata', 'product.price is the minimum across variants. Show £34 and claim £29 and the mismatch is exactly what gets penalised.'),

    h2('What about reviews and ratings?'),
    p('Only mark up ratings that are visible on the page, and only from your own customers.'),
    p('This is the most commonly abused property and the one with the clearest enforcement. `aggregateRating` must correspond to reviews a visitor can see on that page. Marking up a rating that appears nowhere, or one aggregated from a third-party site, is a manual-action risk rather than a technicality.'),

    h3('Get it from the reviews app'),
    p('Most review apps expose the average and count in Liquid or via metafields. Building the markup from that source keeps it correct as reviews accumulate, which hand-maintained values never do.'),

    h3('Individual reviews as well as the average'),
    p('The `review` property carries a handful of actual reviews alongside the aggregate, each with an author, a rating and the text. It is more work than the average alone and it gives search engines something specific to quote. Three or four recent ones is plenty — the property is not a place to dump the whole set.'),

    h3('Omit it when there are no reviews'),
    p('A zero rating or an invented default is worse than nothing. If the product has no reviews, leave the property out entirely — the rest of the block is still valid and still eligible.'),

    h3('Do not mark up your own testimonials as product reviews'),
    p('A quote from the brand about its own product is not a review, and structured data that says it is will eventually be treated as what it is. Keep marketing copy out of the review properties.'),

    h2('What else breaks it?'),
    p('Duplication, staleness, and markup that describes a different page than the one it is on.'),

    h3('Two product blocks on one page'),
    p('This is common after installing an SEO app: the theme emits schema and the app emits schema, and the page now claims to be two different products. Search Console reports it and neither block is trusted. Check for both before adding anything.'),

    h3('Availability that lags reality'),
    p('An out-of-stock product still marked `InStock` is one of the fastest ways to lose trust in a shopping surface, and it happens whenever availability is cached or hardcoded. Derive it from the variant every render.'),

    h3('Images that do not resolve'),
    p('Shopify image URLs are protocol-relative in some contexts, so a raw value can emit `//cdn.shopify.com/…`, which is invalid inside JSON-LD. Prepending `https:` fixes it and is easy to miss because the page looks fine.'),

    h3('Markup on the wrong page type'),
    p('Product schema on a collection page, or on the homepage because the snippet is in the layout rather than the product template, describes something the page is not. Structured data belongs to the template that renders the thing it describes — [the same discipline as any page-level schema graph](/blog/rest-api-design).'),
    img('duplicate-blocks', 'Two independent descriptions of the same page contradicting each other', 'A theme emitting schema plus an SEO app emitting schema means the page claims to be two products. Neither block is trusted.'),

    h2('How does this relate to a product feed?'),
    p('They are two descriptions of the same catalogue, and they need to agree.'),
    p('If you run shopping ads or free listings, a product feed sends your catalogue to Google directly, and the structured data on the page is checked against it. A feed saying £29 and a page saying £34 is a disapproval, and the mismatch is usually the same variant problem that broke the markup in the first place.'),

    h3('The page is the arbiter'),
    p('When the two disagree, the crawled page wins and the feed entry is suspended. That makes correct on-page markup the foundation rather than an addition — fixing the feed while the page still contradicts it solves nothing.'),

    h3('Identifiers are what link everything'),
    p('`gtin` where you have one, `mpn` and `sku` otherwise. These are what let Google match your listing to the same product sold elsewhere, which is how a product page competes on a comparison surface at all. A store selling branded goods without GTINs is invisible in exactly the place it would benefit most.'),

    h3('Structured data can substitute for a feed, partially'),
    p('Free listings can be sourced from on-page markup where no feed exists, which makes correct schema the cheapest route into shopping surfaces for a small store. It is less controllable than a feed and it costs nothing, which is a reasonable place to start.'),
    img('feed-and-page', 'Two catalogue descriptions being compared, with the page taking precedence over the submitted one', 'Feed and page must agree. When they disagree the crawled page wins and the feed entry is suspended.'),

    h2('How do you test it?'),
    p('Three checks, in increasing order of what they tell you.'),

    h3('The Rich Results Test, on the live URL'),
    p('Testing pasted code validates the code; testing the URL validates what Google actually receives after rendering. Those differ whenever JavaScript modifies the block, which is exactly the case worth checking.'),

    h3('The Schema Markup Validator for correctness'),
    p('Google\'s tool reports only what affects Google. The generic validator reports schema.org correctness, which catches properties that are wrong but not currently used — worth knowing, because usage changes.'),

    h3('Search Console for the truth over time'),
    p('The enhancement reports show errors and warnings across every indexed product, which is the only view that catches a problem affecting one product type out of forty. Check it after any theme change that touches the product template.'),

    h3('Re-check after every app install'),
    p('Apps are the most common way correct markup becomes incorrect, because installing one can inject a second block without any announcement that it has done so. Adding a schema check to whatever you already do after installing an app costs two minutes and catches the problem while you still remember what changed.'),

    h3('Test your worst product'),
    p('The one with an apostrophe in the title, forty variants, no reviews and a description containing HTML. Validating the tidy demo product proves very little, and the messy one is where the `json` filter earns its place.'),
    img('validation', 'A live page being checked as rendered rather than as authored', 'Test the URL, not pasted code. They differ whenever JavaScript rewrites the block, which is the case worth checking.'),

    h2('What about the rest of the store?'),
    p('Four more types are worth having, and none of them take long.'),

    h3('BreadcrumbList on product and collection pages'),
    p('It produces the readable path in place of a raw URL in search results, and it is directly derivable from the collection the visitor arrived through. Cheap and visible.'),

    h3('Organization on the homepage'),
    p('Name, logo, contact details and social profiles, which is what associates your brand with the entity Google holds. The profile links must be real — asserting a profile that does not exist is worse than asserting none.'),

    h3('WebSite with SearchAction'),
    p('It can enable a search box within your search result, and it identifies the site name properly. One block on the homepage.'),

    h3('FAQPage where the questions are genuine'),
    p('If the product page carries real answers to real questions, marking them up is legitimate. Inventing questions to occupy more of the results page is the abuse that got this feature restricted, and it is not worth the risk.'),

    img('site-wide-types', 'A small set of additional structured types covering the pages around the product', 'Four more types, none of them long: breadcrumbs, organisation, website, and FAQ where the questions are real.'),

    h2('Should you just use an app?'),
    p('It is a reasonable shortcut with a specific failure mode worth knowing.'),
    p('SEO apps that inject structured data work, and they are the right answer for a store with no development capacity. The failure mode is that they usually do not know the theme is already emitting schema, so you end up with duplicates — and the app cannot see the variant state your theme manages, so its price can be the one that goes stale.'),

    h3('An app cannot fix a bad catalogue'),
    p('Structured data is generated from your product data, so missing vendors, empty SKUs and descriptions that are a single line of marketing copy produce thin markup regardless of which tool emits it. Where a store\'s schema is weak, the cause is usually the catalogue rather than the snippet, and no app resolves that.'),

    h3('Check what the theme already emits before installing anything'),
    p('View source, search for `application/ld+json`, and count the blocks. Two minutes, and it prevents the most common problem in this whole area.'),

    h3('An app is another script'),
    p('One that injects markup client-side is doing so after load, which is fine for a rendering crawler and adds weight for every visitor — [worth including in the app census](/blog/shopify-performance-optimization) rather than treating as free.'),

    h2('What does it cost?'),
    p('Half a day to write and validate, and near zero afterwards.'),
    p('The snippet is an hour. Wiring the variant update, connecting the reviews source and validating against three awkward products is the rest of the day. After that it maintains itself, because everything is derived from the product rather than authored.'),
    p('The honest counterweight: structured data makes a listing eligible for a richer result and it does not improve ranking. A store convinced that schema is why it is not ranking has usually mistaken a presentation feature for a relevance one, and the hours would be better spent on the product page, the delivery proposition or the reasons anybody would link to the store at all. Do it because it is cheap and correct, not because it is a growth lever.'),
    quote('Google is strict about markup matching the page. "Close enough" is the state that produces a Search Console warning and no rich result at all.'),

    h2('Conclusion'),
    p('Emit one JSON-LD `Product` block per product page, built in Liquid from the product and the selected variant. Put the `json` filter on every value — a single apostrophe in a title breaks the whole block silently — divide prices by 100 because Shopify stores money in cents, and derive availability from the variant rather than the product.'),
    p('Use `selected_or_first_available_variant` throughout, because `product.price` is the minimum across variants and will contradict the price on screen. Where variants share one URL, describe the range with `AggregateOffer` instead of picking a number, and rewrite the block when the visitor changes variant so it does not go stale.'),
    p('Mark up ratings only when the reviews are visible on that page and come from your own customers, and omit the property entirely when there are none — an invented default is worse than nothing. Add shipping and returns properties, which most stores skip and which answer two buyer questions before the click.'),
    p('Watch for the failures that look fine: two product blocks after installing an SEO app, protocol-relative image URLs, stale availability, and product schema sitting in the layout so it appears on the homepage. Validate the live URL rather than pasted code, and test your messiest product rather than a tidy one.'),
    p('Then check Search Console after any theme change touching the product template. The whole thing is half a day and it maintains itself — but keep it in proportion: it makes a listing eligible for a richer result, not a better-ranked one. If you want it done alongside the rest of a store audit, [that is part of the work](/services).'),
  ),
  faqs: faq([
    ['Does my Shopify theme already have product schema?',
     'Most do, and much of it is subtly wrong — commonly a price taken from product.price rather than the selected variant, which is the minimum across variants and contradicts the page. View source and search for application/ld+json before adding anything, since duplicates are the usual result.'],
    ['Why is my product schema invalid?',
     'The most common cause on Shopify is a missing json filter. An apostrophe or quotation mark in a product title breaks the entire block, and the failure is silent — the page renders fine and nothing indicates a problem. Protocol-relative image URLs are the second most common cause.'],
    ['Can I mark up review ratings from another site?',
     'No. aggregateRating must correspond to reviews visible on that page and originating from your own customers. Marking up ratings aggregated elsewhere, or ones that appear nowhere on the page, is a manual-action risk rather than a technical warning. Omit the property when there are none.'],
    ['Does structured data improve my search ranking?',
     'No. It makes a listing eligible for rich results — price, stock status, stars, delivery and returns — which affects click-through rather than position. It is worth doing because it is cheap and correct, not because it is a ranking lever, and treating it as one leads to misplaced effort.'],
    ['Should I use an SEO app instead of writing it myself?',
     'It is reasonable if you have no development capacity, with one caveat: apps generally cannot tell that your theme already emits schema, so you end up with two contradicting blocks and neither is trusted. They also cannot see the variant state your theme manages, so their price can go stale.'],
  ]),
};
