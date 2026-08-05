import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/product-page-elements/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-product-page-elements',
  slug: 'product-page-elements',
  title: 'What Actually Belongs on a Product Page',
  category: 'ecommerce',
  order: 93,
  readTime: '13 min read',
  date: 'October 2026',
  publishedAt: '2026-10-17',
  series: 'CRO',
  excerpt:
    'The page that decides the sale, element by element — in the order a buyer needs them, and with the things that only add weight left out.',
  coverLabel: 'Product page elements — cover',
  body: body(
    p('The product page is the only page on a store whose job is unambiguous. A visitor arrives already interested and leaves having either bought or not. Everything on the page either helps that decision or gets in its way, and most product pages contain a surprising amount of the second category.'),
    p('This is the element-by-element version: what belongs, what order it goes in, what each one is actually doing, and the things that are on almost every product page for no reason anybody can articulate. It is the practical companion to [the funnel-level view of where stores lose people](/blog/ecommerce-conversion-leaks).'),
    p('The organising principle throughout: a buyer has a list of questions, and the page converts when it answers them in the order they are asked.'),

    h2('What order should things be in?'),
    p('The order a buyer asks the questions, which is not the order a designer usually arranges them.'),
    p('Is this the right thing? What does it cost? Will it fit or suit me? When will it arrive? Can I trust these people? What if it is wrong? Those six questions, in that sequence, are the page. Anything that answers a question earlier than it is asked is clutter, and anything that answers one late is a reason to leave.'),
    table('The sequence, and what each part answers', [
      ['Position', 'Element', 'Question answered'],
      ['1', 'Images', 'Is this the right thing?'],
      ['2', 'Title and price', 'What is it and what does it cost?'],
      ['3', 'Variants', 'Can I get the one I want?'],
      ['4', 'Add to cart', 'How do I proceed?'],
      ['5', 'Delivery and returns', 'When does it arrive, what if it is wrong?'],
      ['6', 'Description and specifics', 'Tell me more'],
      ['7', 'Reviews', 'Do other people agree?'],
    ]),
    p('Note that the description sits sixth. It is the element most teams spend the most time on and it is consulted after the decision is largely made — by people looking for a reason to confirm rather than a reason to choose.'),

    h3('On mobile the first screen is nearly everything'),
    p('The first viewport should carry the image, the title, the price and ideally the add-to-cart button. A hero image that fills the entire screen pushes the price below the fold, which means the most common single question requires a scroll to answer. [Mobile viewport space is the binding constraint](/blog/mobile-hero-viewport) on this page more than any other.'),
    img('question-order', 'Page elements arranged to match the sequence in which a buyer raises each question', 'Six questions in a fixed order. Anything answering one early is clutter; anything answering one late is a reason to leave.'),

    h2('How many images, and of what?'),
    p('Five to eight, each answering a different question, and at least one showing scale.'),
    p('The most common photography failure is not quality — it is redundancy. Six studio shots from slightly different angles answer one question six times while leaving scale, texture and context unanswered. A shorter set that covers more ground converts better than a longer set that does not.'),

    h3('The set that works'),
    p('A clean primary on plain background, the product in use or worn, a detail shot showing material and finish, something establishing size against a familiar reference, the packaging if it matters, and any variant the customer might choose. That is five or six images doing five or six jobs.'),

    h3('Scale is the question nobody answers'),
    p('Returns data is unambiguous about this: a large share of returns are "smaller than expected" or "bigger than expected". A photograph with a hand, a room or a known object in it prevents more returns than any amount of dimension text, because nobody converts millimetres into a mental image.'),

    h3('Alt text is not optional here'),
    p('Product images carry the information the page depends on, so an empty alt attribute makes the page unusable for anyone relying on a screen reader and tells search engines nothing about what you sell. Describing the specific view — "grey wool coat shown from the back" — is more useful than repeating the product title on every image.'),

    h3('Zoom matters more than a gallery'),
    p('For anything where material quality is part of the purchase, the ability to look closely is the feature. A carousel that cycles through images without letting anyone examine one is optimising for movement over usefulness.'),

    h3('Video where it earns its place'),
    p('A short clip showing movement, drape or operation answers questions still images cannot. It should not autoplay with sound, it should not be the first thing that loads, and it should have a poster image so the page is not waiting on it — the [facade pattern applies here](/blog/third-party-script-cost) exactly as it does elsewhere.'),
    img('image-set', 'A small set of photographs each covering a different attribute rather than repeating one angle', 'Six angles of the same shot answer one question six times. Scale, texture and context go unanswered — and scale drives returns.'),

    h2('What about the price?'),
    p('Visible without scrolling, unambiguous, and never the first surprise.'),

    h3('One price, clearly'),
    p('A price with a struck-through original, a member price, a subscription price and a bundle price is a page that has made its most important number ambiguous. Show what this customer pays, and put the comparison next to it only if it is genuine.'),

    h3('State the full cost early'),
    p('Delivery is part of the price and everybody knows it. Showing the delivery figure — or a threshold the customer can see they have met — near the price removes the single largest reason people abandon later. This is the highest-value change on most product pages.'),

    h3('Be careful with urgency'),
    p('A genuine low-stock indicator is useful information. A countdown timer that resets on reload is a lie the customer will notice, and the damage to trust outlasts the transaction. If the scarcity is real, say it plainly; if it is not, leave it out.'),

    h3('Instalment options belong near the price'),
    p('For a considered purchase, showing the monthly equivalent alongside the total reframes the decision and is worth having. It belongs adjacent to the price, not as a banner competing with the add-to-cart button.'),

    img('price-clarity', 'A single unambiguous figure with the delivery cost stated immediately beside it', 'Four competing prices make the most important number ambiguous. Delivery belongs next to the price, not at checkout.'),

    h2('How should variants work?'),
    p('Visibly, with availability shown before selection, and without a page reload.'),
    p('Variant selection is where a decided customer most often falls out, usually because the interface makes them work to discover that the thing they want is unavailable. Every selection that leads to a dead end is a chance to leave.'),

    h3('Show what is out of stock, do not hide it'),
    p('Removing unavailable options makes the customer wonder whether they missed something. Showing them, marked clearly, communicates that you know what they wanted and it is not available — which is information, and which supports a back-in-stock signup.'),

    h3('Swatches for colour, buttons for size'),
    p('A dropdown hides the options behind an interaction and gives no sense of what is available. Visible controls answer at a glance, and they are far easier to hit on a phone — where the [44px minimum](/blog/accessible-forms) is not a guideline.'),

    h3('Update the image with the selection'),
    p('Choosing green should show the green one. This is expected behaviour and its absence reads as a broken page, particularly when the primary image contradicts the selection sitting beneath it.'),

    h3('Never reload the page'),
    p('A variant change that reloads loses scroll position, costs a round trip and feels broken on a slow connection. Everything needed is already in the page — updating in place is straightforward and it is the difference between a page that responds and one that restarts.'),
    img('variant-picker', 'Selectable options displayed openly with unavailable combinations marked rather than removed', 'Hiding out-of-stock options makes buyers wonder what they missed. Showing them marked communicates that you know what they wanted.'),

    h2('What makes the add-to-cart button work?'),
    p('Position, contrast and a response — in that order of importance.'),

    h3('Above the fold on mobile'),
    p('If the button requires a scroll, a proportion of visitors never see it. On a phone this frequently means constraining the image height, which feels like a sacrifice and is not — the price and the action matter more than a taller photograph.'),

    h3('One primary action'),
    p('Add to cart, buy now, wishlist, compare and share competing at equal weight means no primary action. Wallet buttons convert well and belong near the main button, but everything else should be visibly quieter.'),

    h3('Confirm the add without leaving the page'),
    p('A drawer or an inline confirmation tells the customer it worked and offers checkout. Redirecting to a cart page ends the browsing session and costs multi-item orders — this is a genuine revenue difference on stores with a browsable catalogue.'),

    h3('Make a sticky button behave on mobile'),
    p('A persistent bar with price and add-to-cart works well on long product pages. It must clear the safe area at the bottom of the screen and must not cover content the customer is reading, which is the detail most implementations get wrong.'),

    img('sticky-cta', 'A persistent price and action bar remaining reachable as a long page scrolls', 'A sticky bar works well on a long product page — provided it clears the safe area and never covers what is being read.'),

    h2('What do delivery and returns need to say?'),
    p('A date, a cost and a clear return window — as specifics, not as links to a policy page.'),

    h3('A date beats a duration'),
    p('"Arrives Thursday 12 August" is a commitment; "ships in 2–4 business days" requires the customer to do arithmetic they will get wrong. For anything bought for an occasion, the date is the decision.'),

    h3('Returns are a purchase enabler'),
    p('For a first-time buyer, the return policy is what makes the risk acceptable. Stating it in one plain line on the product page — not behind a link — converts hesitation into a purchase more reliably than most design work on the same page.'),

    h3('Say where it ships from and to'),
    p('International visitors hit customs charges and delivery times that nobody mentioned. Naming the shipping origin and whether duties are included prevents an expensive category of complaint and a worse category of return.'),
    img('delivery-promise', 'A specific arrival date and return window stated in place rather than linked elsewhere', '"Arrives Thursday" is a commitment. "Ships in 2–4 days" asks the customer to do arithmetic they will get wrong.'),

    h2('How much description is enough?'),
    p('Two lines that could sell it alone, then structured detail for people who want it.'),
    p('The description is read in two entirely different modes: skimmed by most people looking for one specific fact, and read closely by a few. Writing for only one of those produces either a wall nobody reads or a summary that answers nothing.'),

    h3('Lead with the reason to buy'),
    p('The first two sentences should work as the entire description if that is all anybody reads. Feature lists and material composition follow; they are reference material, not persuasion.'),

    h3('Specifications belong in a table'),
    p('Dimensions, materials, weight, care and compatibility are lookup data. A table lets somebody find the one row they came for; the same information in prose forces them to read all of it to find none of it.'),

    h3('Answer the questions support keeps getting'),
    p('Whoever answers customer emails knows the three questions asked about each product line. Those answers belong on the page, and adding them is the cheapest conversion work available because the research is already done.'),

    h3('Write for the person comparing two tabs'),
    p('A serious buyer usually has your page open beside a competitor\'s. The description that wins is the one that makes the comparison easy — naming the material, the dimension or the guarantee explicitly rather than describing it atmospherically. Vague copy loses to specific copy in a side-by-side every time, regardless of which product is better.'),

    h3('Do not hide essentials in an accordion'),
    p('Collapsed sections are good for reference detail and bad for anything that decides a purchase. If the material composition determines whether somebody buys, it is not reference detail.'),

    h2('Do reviews matter that much?'),
    p('For an unfamiliar brand they are frequently the deciding factor, and how they are presented matters as much as having them.'),

    h3('A rating summary near the price'),
    p('The star average and count belong high on the page, near the title, because they are part of the initial assessment. The reviews themselves belong lower, where somebody looking for reassurance will go.'),

    h3('Show the negative ones'),
    p('A product with only five-star reviews reads as filtered and is trusted less than one with a visible range. A three-star review explaining a specific limitation often converts better than another perfect one, because it makes the rest credible.'),

    h3('Photographs in reviews do the scale job again'),
    p('Customer photographs show the product in real conditions, at real scale, which is the question the professional photography usually failed to answer. They are worth actively soliciting.'),

    h3('Load them lazily'),
    p('Reviews are below the fold and most review apps are heavy. Deferring the widget until it approaches the viewport keeps a genuinely valuable feature from costing the page its [first paint](/blog/shopify-performance-optimization).'),
    img('reviews', 'A rating summary placed high with the full review content positioned further down the page', 'The star summary belongs near the price; the reviews themselves belong lower. Only-perfect ratings read as filtered.'),

    h2('What should you take off?'),
    p('More than you expect, and most of it was added because a stakeholder asked rather than because a buyer needed it.'),
    ul([
      '**Carousels of related products above the fold** — they invite the customer to leave the page they are converting on.',
      '**Social sharing buttons** — usage on product pages is negligible and each is a third-party script.',
      '**Fake urgency** — reset countdowns and invented viewer counts, which cost trust permanently when noticed.',
      '**A second newsletter popup** — the customer is mid-purchase; ask afterwards.',
      '**Duplicate calls to action** at the bottom that repeat what is already sticky at the top.',
    ]),
    p('The test for anything on the page is simple: name the buyer question it answers. If nobody can, it is weight — and weight on this page is measured in orders, not kilobytes.'),
    p('Related products are worth keeping somewhere, and the somewhere is beneath the reviews. By that point the visitor has either decided against this item or is browsing for a second one, and both of those are served by a recommendation. Placed above the fold, the same block competes with the purchase it is supposed to follow.'),

    h2('What does it cost?'),
    p('A week to rebuild a product page properly, and the photography is the long pole.'),
    p('The template work — layout, variant behaviour, sticky add-to-cart, delivery messaging, deferred reviews — is a few days. Writing better descriptions across a catalogue and shooting the missing scale and in-use photographs takes longer and matters more, which is an uncomfortable order for a developer to admit.'),
    p('The honest counterweight: none of this beats the product, the price or the delivery proposition. A well-built product page for something priced wrong, or shipped in three weeks when competitors ship in two, converts poorly and the page is not why. Fixing the page is the cheapest lever available and it is the smallest one — if the numbers stay bad after this work, the answer is upstream and it is a harder conversation.'),
    quote('The test for anything on a product page is naming the buyer question it answers. If nobody can, it is weight — and weight here is measured in orders.'),

    h2('Conclusion'),
    p('Arrange the page in the order buyers ask their questions: is this right, what does it cost, can I get the one I want, how do I proceed, when does it arrive, tell me more, do others agree. The description sits sixth, which is uncomfortable given how much time teams spend on it — it confirms a decision rather than making one.'),
    p('Shoot five to eight images that each answer a different question, and make sure one establishes scale against something familiar. Redundant angles are the most common photography failure, and "bigger than expected" is one of the most common return reasons. On mobile, keep the image, title, price and ideally the button on the first screen.'),
    p('Show one unambiguous price with the delivery cost stated near it, make variants visible with out-of-stock options marked rather than hidden, update the image with the selection, and never reload the page to change a size. Put a single primary add-to-cart button above the fold and confirm the add in place instead of redirecting to a cart.'),
    p('Give a delivery date rather than a duration, state the return window in one plain line on the page instead of behind a link, and lead the description with two sentences that could sell it alone, with specifications in a table beneath. Put the rating summary near the title, the reviews lower, show the negative ones, and defer the widget until it is needed.'),
    p('Then remove everything nobody can attach a buyer question to — above-the-fold related carousels, social buttons, fake urgency, mid-purchase popups. And remember the page is the cheapest lever, not the biggest one. If it is already good and the numbers are not, [that is worth talking through](/start).'),
  ),
  faqs: faq([
    ['What is the most important element on a product page?',
     'On mobile, whatever occupies the first screen — the image, title, price and ideally the add-to-cart button. The single highest-value addition is usually the delivery cost or a visible free-shipping threshold near the price, because unknown shipping is the largest source of later abandonment.'],
    ['How many product images should I have?',
     'Five to eight, each answering a different question rather than repeating an angle: a clean primary, the product in use, a detail shot for material, something establishing scale against a familiar object, and any variant a customer might choose. Scale is the one most often missing.'],
    ['Should I hide out-of-stock variants?',
     'No. Removing them makes customers wonder whether they missed an option. Showing them clearly marked communicates that you understood what they wanted and it is unavailable, which is useful information and creates a natural place to offer a back-in-stock notification.'],
    ['Where should the product description go?',
     'Below the price, variants, add-to-cart and delivery information. It is consulted after the decision is largely made, mostly by people looking to confirm a choice. Lead with two sentences that could sell the product alone, then put specifications in a table rather than in prose.'],
    ['Do I need reviews on the product page?',
     'For an unfamiliar brand they are often the deciding factor. Put the star summary near the title where it forms part of the initial assessment, the reviews themselves lower down, and show the negative ones — only-perfect ratings read as filtered and are trusted less than a visible range.'],
  ]),
};
