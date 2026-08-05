import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/figma-to-shopify/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-figma-to-shopify',
  slug: 'figma-to-shopify',
  title: 'Figma to Shopify Without Losing the Design',
  category: 'ecommerce',
  order: 95,
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-06',
  series: 'Shopify storefront',
  excerpt:
    'A design that looks perfect in Figma and wrong in the theme editor failed at handoff, not at build. What the file needs before anyone writes Liquid.',
  coverLabel: 'Figma to Shopify — cover',
  body: body(
    p('A Shopify build goes wrong at handoff more often than at implementation. The design is approved, the developer builds it faithfully, and then the merchandiser opens the theme editor and finds that the beautiful homepage cannot be changed without breaking, because it was drawn as a picture rather than designed as a system of sections.'),
    p('That failure is not the designer\'s fault or the developer\'s. It is a missing conversation about the medium: a Shopify storefront is a set of configurable sections filled with content that changes weekly, and a Figma file is a fixed-size canvas showing one arrangement of one set of content. Bridging that gap is the work.'),
    p('Here is what I ask for in a design file before quoting a theme build, what to draw and what not to bother drawing, and the specific things that turn into expensive surprises three weeks in.'),

    h2('Why do handoffs go wrong?'),
    p('Because a Figma frame shows one state and a storefront has dozens.'),
    p('A product card in Figma has a two-line title, a price, and a photograph shot at the right aspect ratio. In the store, that same card has to handle a title that runs to four lines, a price with a struck-through original, a sale badge, an out-of-stock state, a portrait photograph somebody uploaded at the wrong ratio, and a name in a language with longer words. None of those are edge cases; they are Tuesday.'),
    p('The design that survives is the one that decided what happens in each of those situations. The design that fails is the one that looked immaculate with the demo content and left every real decision to whoever wrote the CSS at eleven at night.'),
    table('What a frame shows and what a theme needs', [
      ['In the file', 'In the store'],
      ['One product card', 'Long titles, sale badges, sold-out states'],
      ['A four-item grid', 'Three items, or eleven'],
      ['One homepage layout', 'Sections reordered per campaign'],
      ['Two breakpoints', 'Every width between them'],
      ['Perfect photography', 'Whatever was uploaded on Friday'],
    ]),
    p('Every row on the right is a decision somebody makes. The only question is whether the designer makes it deliberately or the developer makes it under time pressure.'),

    h3('The theme editor is a stakeholder'),
    p('Nobody puts the merchandiser in the review, and they are the person who will use the result every week for two years. A design that cannot be rearranged in the editor has quietly converted a marketing capability into a developer ticket, and that cost never appears in the build quote.'),
    img('one-state', 'A single idealised component arrangement beside the many real states it has to cover', 'A frame shows one state; a storefront has dozens. Long titles, sale badges and sold-out variants are not edge cases.'),

    h2('What should the file contain?'),
    p('Tokens, components, states, and the sections a merchandiser can rearrange — in that order of importance.'),

    h3('Design tokens, named and complete'),
    p('Colours, type scale, spacing steps, radii and shadows defined as variables rather than applied ad hoc. This is the single highest-leverage thing in a handoff, because it turns the build from interpretation into transcription. When the file has five greys with names, the theme has five greys; when it has nineteen greys picked visually, the theme has nineteen greys and no system.'),
    p('The spacing scale matters as much as the colours and is skipped more often. A file where margins are 24, 25, 32, 30 and 48 pixels because they were nudged into place produces a theme with the same arbitrary values, and every future change becomes a guess about which number was intentional.'),

    h3('Components with real variants'),
    p('The product card, button, badge, input and section header built as components with their states drawn: default, hover, focus, disabled, loading, error, empty. Focus states in particular are almost never in the file and are a legal requirement rather than a nicety — [keyboard access is not optional](/blog/accessible-forms).'),

    h3('The awkward content, drawn'),
    p('One frame showing the product card with a very long title, one showing an out-of-stock variant, one showing a collection with three products in a four-column grid. Fifteen minutes of drawing that prevents an hour of decisions being made badly under deadline.'),

    img('states-drawn', 'Component variants drawn for hover, focus, empty and error rather than default only', 'Focus, empty, loading and error are the states almost never in the file and always needed in the theme.'),

    h3('A mobile design, not a scaled desktop one'),
    p('Most storefront traffic is mobile, and a desktop design shrunk to 375px is not a mobile design — it is a compromise nobody chose. Draw the phone layout as its own arrangement, decide what is dropped rather than shrunk, and treat the desktop version as the variation.'),

    h2('How should the design map to sections?'),
    p('Every distinct band on the page is a section, and the file should say which are reorderable.'),
    p('Online Store 2.0 lets a merchandiser add, remove and reorder sections on any template. That flexibility is the product, and it constrains the design in ways worth stating early: a section cannot assume what is above or below it, so a layout that depends on the hero touching the collection grid will break the first time somebody inserts a banner between them.'),

    h3('Annotate what is fixed and what is configurable'),
    p('For each band: is this section reorderable, can it be used more than once, which parts are editable, and what happens if the merchandiser leaves a field blank. Four questions per section, answered in the file, and most handoff ambiguity disappears.'),

    h3('Design the empty and overfilled states'),
    p('A testimonial section with one testimonial and the same section with seven. A rich-text block with a heading and no body. These are the states that appear in month three when somebody builds a campaign page, and if nobody decided how they look, they look broken.'),

    h3('Keep the section count honest'),
    p('Every distinct section is build time and a settings schema to maintain. A homepage with fourteen bespoke sections costs meaningfully more than one with six flexible ones, and the six usually serve the store better because they get reused. Pushing for reuse in the design review is a real cost saving.'),
    img('sections', 'A page divided into independently orderable bands rather than one continuous composition', 'Every band is a section that cannot assume what sits above or below it. Six flexible sections beat fourteen bespoke ones.'),

    h2('What about images?'),
    p('Decide the aspect ratios in the design, because the store cannot enforce them.'),
    p('A merchandiser will upload a portrait photograph into a landscape slot, and something has to happen. Cropping, letterboxing and stretching are all defensible and they look very different, so the file should say which one. Left undecided, the theme picks whatever the developer implemented first and the site quietly develops two behaviours.'),

    h3('Name the ratio for every image slot'),
    p('Hero, product card, collection banner, lookbook, editorial. Each gets a stated ratio and a stated behaviour for the wrong ratio. This is ten minutes of decisions that otherwise get made forty times inconsistently.'),

    h3('Design with real photography, or say it is placeholder'),
    p('A design mocked with stock photography shot on white will not survive contact with a catalogue of phone photographs taken against a beige wall. If the client\'s actual imagery is weaker than the mockups, that is a finding to raise during design rather than a disappointment at launch.'),

    h3('Say where art direction is required'),
    p('If the hero needs a different crop on mobile rather than the same image scaled, that is a `<picture>` element with two sources and it needs two uploads in the theme settings. It is a small build detail and an easy one to miss until the mobile hero has a subject\'s head cropped off.'),

    h3('Budget the weight'),
    p('A design with a full-bleed video hero, a six-image lookbook and a parallax band has committed the store to a heavy page before a line of Liquid exists. Raising that in design review is far cheaper than discovering it in [a performance audit after launch](/blog/shopify-performance-optimization).'),

    h2('How do tokens become theme settings?'),
    p('Directly, and this is where a good file pays for itself twice.'),
    p('Shopify themes expose colours, fonts and some spacing through the theme editor, and those settings should be generated from the design tokens rather than invented during the build. A `settings_schema.json` whose colour names match the Figma variable names means a conversation about "the accent colour" refers to the same thing in both places.'),
    code('json', `
{
  "name": "Colors",
  "settings": [
    { "type": "color", "id": "color_ink",     "label": "Ink",     "default": "#0a0a0a" },
    { "type": "color", "id": "color_surface", "label": "Surface", "default": "#f4f4f5" },
    { "type": "color", "id": "color_accent",  "label": "Accent",  "default": "#2563eb" }
  ]
}
`),
    code('liquid', `
{%- comment -%} Emit the tokens once, use them everywhere. {%- endcomment -%}
<style>
  :root {
    --color-ink: {{ settings.color_ink }};
    --color-surface: {{ settings.color_surface }};
    --color-accent: {{ settings.color_accent }};
  }
</style>
`),
    p('Exposing tokens as custom properties means the theme has one source for each value, and a merchandiser changing the accent colour changes it everywhere rather than in the four places somebody remembered.'),

    h3('Do not expose everything'),
    p('A theme settings panel with sixty options is a panel nobody can use, and it guarantees that somebody will eventually set a colour combination that fails contrast. Expose the handful that genuinely need to change seasonally and hardcode the rest.'),

    h3('Check contrast at the token level'),
    p('If the accent colour is configurable, somebody will pick a pale one and put white text on it. Choosing token pairs that pass contrast, and constraining the settings to those, prevents an accessibility failure that nobody will notice until an audit — the [same constraint that applies to any design system](/blog/wcag-contrast-audit).'),
    img('tokens-to-settings', 'Design variables carried through to configurable values in the storefront admin', 'Tokens map to theme settings by name. A conversation about "the accent colour" then refers to the same thing in both places.'),

    img('image-ratios', 'An upload of the wrong proportion resolved by a stated rule rather than an improvised one', 'Somebody will upload a portrait photo into a landscape slot. Crop, letterbox or stretch — the file should say which.'),

    h2('What does the developer need beyond the file?'),
    p('Motion, behaviour and the things a static canvas cannot express.'),

    h3('State what moves and how'),
    p('A note per interaction — what animates, how long, what easing, what happens under reduced motion. Without it, either nothing moves or everything does, and the second is worse. Reduced motion in particular is a requirement rather than a preference and it needs a stated fallback.'),

    h3('Specify the loading and error states'),
    p('What the page looks like while the cart is updating, what happens when adding to cart fails, what an empty search shows. These are real screens with real frequency and they are almost never designed, so they end up as whatever the developer improvised.'),

    h3('Define the breakpoints, and keep them few'),
    p('Two or three breakpoints, chosen deliberately, applied consistently. A file with designs at 375, 768, 1024, 1280 and 1440 implies five sets of rules, and the space between them is undefined. Fewer tiers with fluid behaviour between them is both easier to build and more robust.'),

    h3('Say what happens to sections a merchandiser disables'),
    p('If the announcement bar is turned off, does the header spacing change? These small dependencies between sections are invisible in a file where everything is present and immediately visible in a store where things get switched off.'),

    h2('Should the designer work in the theme editor?'),
    p('At least once, before the design is signed off — it is the fastest way to find the assumptions that will not hold.'),
    p('Half an hour in a demo store, building a page from an existing theme\'s sections, teaches a designer more about the medium than any amount of documentation. It surfaces the constraint that matters: sections are independent, ordered, and full of content somebody else controls.'),

    h3('Review the build in the editor, not in screenshots'),
    p('A screenshot proves the developer can reproduce the frame. Opening the editor and rearranging the sections proves the thing actually works, and that is the review worth doing.'),

    h3('Populate it with real content before signing off'),
    p('Twenty real products with real titles and real photographs, not the demo catalogue. Most handoff problems are visible within two minutes of doing this and invisible before it.'),
    img('editor-review', 'A layout being rearranged in an administrative interface rather than viewed as a static image', 'Review in the editor, not in screenshots. A screenshot proves the frame was reproduced; rearranging proves it works.'),

    h2('What tends to become expensive?'),
    p('Five things, all of which are cheap to change in the file and costly to change in the theme.'),
    ul([
      '**A layout that depends on section order** — it breaks the first time somebody inserts a banner.',
      '**Bespoke sections that are nearly identical** — three variations of a feature band should be one section with a setting.',
      '**Type that only works at one length** — a heading designed for eight words and used with twenty.',
      '**Custom scroll behaviour** — parallax and pinning are disproportionately expensive and fragile on mobile.',
      '**Anything requiring data Shopify does not store** — a field with nowhere to live becomes a metafield project.',
    ]),
    p('The last one is worth catching early. A design showing an ingredient breakdown, a size chart per product or a delivery estimate per region is describing a data model, and somebody has to decide where that lives before it can be built.'),

    h3('Metafields are the usual answer and they are not free'),
    p('Custom product data goes in metafields, which means defining them, populating them across the catalogue and rendering them in the template. The rendering is the small part. Populating four hundred products is the part that gets discovered late — and doing it badly has [a performance cost too](/blog/shopify-performance-optimization).'),

    img('expensive-five', 'A short list of design decisions that are cheap to change early and costly to change late', 'All five are trivial to change in the file. Section-order dependence and undefined product data are the costly ones to find late.'),

    h2('What does a good handoff look like?'),
    p('A file, a short document, and a conversation — in that order and all three are needed.'),
    ol([
      '**Tokens defined** as variables with names the theme will reuse.',
      '**Components with states,** including focus, empty, loading and error.',
      '**Sections annotated** with what is editable, reorderable and repeatable.',
      '**Image ratios stated** per slot, with the wrong-ratio behaviour decided.',
      '**Motion and breakpoints documented,** including the reduced-motion fallback.',
      '**A walkthrough,** because half the value is in the questions asked out loud.'],
    ),
    p('That takes a designer perhaps half a day beyond the design itself, and it routinely saves several days of build and a great deal of rework. It is the highest-return half day in the whole project.'),

    h2('What does it cost?'),
    p('Half a day of extra design work, against days of avoided rework.'),
    p('None of this is elaborate. Tokens are usually already implicit and just need naming. States take an hour. Section annotation is a text layer beside each band. The walkthrough is thirty minutes. The reason it does not happen is not cost — it is that the design is approved by people looking at a picture, and a picture does not reveal what is missing.'),
    p('The honest counterweight: a heavily specified file can also slow a project down and take decisions away from the person best placed to make them. A developer who has built forty themes knows what a long product title does to a card, and asking a designer to draw every state can produce a large file that nobody reads while the actual constraint — which sections are reorderable — is still unstated. Specify the things the developer cannot reasonably infer, and trust them with the rest.'),
    quote('The design fails at handoff, not at build. A frame shows one state; a storefront has dozens, and somebody decides each one — deliberately or at eleven at night.'),

    h2('Conclusion'),
    p('A Shopify design succeeds when it is drawn as a system of independent sections rather than as a picture of one page. Sections get reordered, content changes weekly, and any layout depending on what sits above or below it breaks the first time a merchandiser inserts a banner.'),
    p('Put tokens in the file as named variables — colours, type scale, spacing steps, radii — because that turns the build from interpretation into transcription, and the spacing scale matters as much as the palette. Build components with their real states, including focus, empty, loading and error, which are the ones almost never drawn and always needed.'),
    p('Draw the awkward content deliberately: the four-line product title, the sold-out variant, the three-item grid in a four-column layout. Fifteen minutes there prevents an hour of decisions being made badly under deadline. Design the phone layout as its own arrangement rather than shrinking the desktop one, since that is where most of the traffic is.'),
    p('State an aspect ratio and a wrong-ratio behaviour for every image slot, annotate each section with what is editable, reorderable and repeatable, and document motion and breakpoints including the reduced-motion fallback. Map tokens to theme settings by name, but expose only the handful that genuinely change seasonally.'),
    p('Then review the build in the theme editor with real products rather than in screenshots — most handoff problems appear within two minutes of doing that and are invisible before it. The whole additional effort is about half a day, and it is the highest-return half day in the project. If you want the design and the build handled as one piece of work, [that is how I prefer to run them](/services).'),
  ),
  faqs: faq([
    ['Why does my Figma design not translate to Shopify?',
     'Usually because it was drawn as one fixed arrangement rather than as independent sections. Shopify merchandisers reorder, duplicate and disable sections, so any layout depending on what sits above or below it breaks as soon as somebody inserts a banner between two bands.'],
    ['What should a designer include beyond the visual design?',
     'Named tokens for colour, type and spacing; components with focus, empty, loading and error states; per-section notes on what is editable and reorderable; a stated aspect ratio and wrong-ratio behaviour per image slot; and motion notes including the reduced-motion fallback.'],
    ['How many breakpoints should a Shopify design use?',
     'Two or three, chosen deliberately and applied consistently. Files with designs at five widths imply five sets of rules and leave the space between them undefined. Fewer tiers with fluid behaviour between them is easier to build and far more robust to real content.'],
    ['What makes a theme build unexpectedly expensive?',
     'Layouts that depend on section order, several near-identical bespoke sections that should be one configurable section, type that only works at one length, custom scroll effects, and anything requiring product data Shopify does not store — which becomes a metafield population project.'],
    ['Should the designer use the theme editor?',
     'At least once before sign-off. Half an hour building a page from an existing theme’s sections teaches the medium faster than any documentation, and reviewing the finished build by rearranging sections with real products catches problems that screenshots never reveal.'],
  ]),
};
