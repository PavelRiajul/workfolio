import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/semantic-search-guide/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-semantic-search-guide',
  slug: 'semantic-search-guide',
  title: 'Semantic Search That Understands What People Meant',
  category: 'ai',
  order: 22,
  readTime: '11 min read',
  date: 'August 2026',
  publishedAt: '2026-08-12',
  series: 'RAG',
  excerpt:
    'Why keyword search fails on natural questions, what semantic search costs to add to an existing product, and when it is the wrong answer.',
  coverLabel: 'Semantic search — cover',
  body: body(
    p('The clearest sign a product needs semantic search is a support inbox full of "I could not find X" for things that are definitely there. Users searched for what they meant; the search matched on what they typed; the two did not overlap.'),
    p('Semantic search closes that gap by matching on meaning rather than characters. It is one of the cheapest AI features to add, one of the most immediately noticeable to users, and one of the most frequently over-bought — plenty of products would be better served by fixing their existing keyword search first.'),
    p('This is the decision framing rather than the implementation. If you have already decided and want the technical version, that is [the pgvector post](/blog/pgvector-semantic-search).'),

    h2('Where does keyword search break down?'),
    p('Four specific failures, and they account for most "I could not find it" reports.'),

    h3('Different words, same meaning'),
    p('A user searches "cancel my subscription"; the help article says "end your plan". No word overlaps. Keyword search returns nothing, or worse, returns something irrelevant that happens to contain "cancel".'),

    h3('Questions rather than terms'),
    p('People increasingly type whole questions, because that is what they have learned to do everywhere else. "Why is my invoice higher this month" tokenises into common words that match nearly everything, so relevance collapses.'),

    h3('Concepts with no canonical name'),
    p('A user wants to know about "the thing where it charges you again if you forget to cancel". There is no keyword for that. There is a document about automatic renewal, and only meaning-based matching connects the two.'),

    h3('Long-tail phrasing'),
    p('The same intent arrives in fifty different phrasings, and keyword search rewards whichever one happens to match your documentation\'s vocabulary. That is a lottery your users did not know they entered.'),
    img('search-gap', 'Two clusters of markers, one matching by shape and one by position', 'Keyword search matches characters. Users search meaning. The gap is where the support tickets come from.'),

    h2('What does semantic search actually do?'),
    p('It converts text into a numerical representation of its meaning, then finds stored text whose representation is close by. Two passages about the same idea sit near each other even when they share no vocabulary.'),
    p('That is the entire mechanism, and its consequence is that "cancel my subscription" finds "end your plan" without anyone having written a synonym list. It also means the system handles phrasings nobody anticipated, which is where the maintenance saving comes from.'),
    p('The important limitation is the mirror image: it is fuzzy where you sometimes need exact. A vector has no special respect for the literal string `INV-40219`, so a search for that invoice number can return five documents about invoicing and not the one you wanted.'),
    p('It is worth being clear that this is not the model understanding your content in any deep sense. It is a similarity measure over a representation learned from a great deal of text, and it is very good at the specific job of noticing that two passages are about the same thing. That narrowness is a feature — there is no generation step, nothing is being invented, and the failure mode is returning a less relevant document rather than a confidently wrong statement.'),

    h2('Should you use semantic or keyword search?'),
    p('Both, nearly always. They fail in opposite directions, which is why running them together outperforms either.'),
    table('Where each approach wins', [
      ['Query type', 'Keyword', 'Semantic', 'Hybrid'],
      ['Exact code or reference', 'Excellent', 'Poor', 'Excellent'],
      ['Natural question', 'Poor', 'Excellent', 'Excellent'],
      ['Synonyms and paraphrase', 'Poor', 'Excellent', 'Excellent'],
      ['Rare proper nouns', 'Excellent', 'Fair', 'Excellent'],
      ['Typos', 'Poor', 'Fair', 'Fair'],
    ]),
    p('The practical answer is to run both, merge the candidate sets, and rank the union. On Postgres this is one extra column and one extra index rather than a second system, which is what makes hybrid the sensible default rather than an advanced option.'),
    p('Pure semantic search is worth considering only when your content genuinely has no exact identifiers — a blog, a knowledge base of prose. The moment SKUs, order numbers or error codes are involved, dropping keyword matching is a downgrade users notice immediately.'),

    h2('What does it cost to add?'),
    p('Less than most AI features, because there is no generation step. You are not paying a model to write anything.'),
    table('Typical cost to add semantic search to an existing product', [
      ['Item', 'Cost', 'Notes'],
      ['Build', '$3k–$7k', 'Indexing, hybrid query, ranking, UI'],
      ['Initial embedding', '~$2 per 10k chunks', 'One-off'],
      ['Query embedding', '~$0.02 per 1,000 searches', 'Negligible'],
      ['Storage and index', '$0 extra', 'Runs in your existing database'],
      ['Ongoing', '$25–$150/month', 'Dominated by re-embedding on content change'],
    ]),
    p('The spread in the build figure is almost entirely about your content, not the feature. Clean structured content indexes quickly; a corpus of scanned PDFs and inconsistent exports needs a parsing phase that can equal the rest of the work.'),
    p('Compared to [a full chat assistant](/blog/ai-feature-development-cost), this is roughly half the cost and a third of the ongoing spend, because generation is where both the money and the risk concentrate.'),

    h2('How long does it take to build?'),
    p('One and a half to three weeks for a product with reasonably clean content, and the phases are predictable.'),
    p('A few days on ingestion and chunking, which is where quality is decided. A few days on the hybrid query, ranking and permission filtering. A few days on the interface, which matters more than people expect — semantic results feel wrong if the UI does not show why something matched.'),
    p('The variable is content preparation. I now parse twenty representative documents during scoping precisely because that is where estimates go wrong, and it is an afternoon that has repeatedly changed a quote in both directions.'),
    p('What is genuinely quick is the search itself. Embedding a corpus, writing the hybrid query and returning ranked results is a couple of days for anyone who has done it before. What takes the remaining time is everything around it: getting the chunks right, filtering by permission correctly, building an interface that explains its matches, and producing the labelled set that tells you whether any of it worked.'),
    p('That ratio is worth knowing when comparing quotes. A quote that prices only the search mechanism will be low and will land you with the other 70% of the work unbudgeted, which then arrives as change requests during the build.'),

    h2('How do you know if it is working?'),
    p('Not by trying it. Semantic search always returns something, ranked confidently, and the results look plausible whether or not they are right.'),

    h3('A labelled query set'),
    p('Fifty real searches, each labelled with which document should be returned. Then measure how often the correct document appears in the top five. That number is the whole quality story, and it takes an afternoon to produce.'),

    h3('Zero-result and abandoned searches'),
    p('Track searches where nothing scored above your relevance floor, and searches where the user clicked nothing. Both are lists of things people expected to find and did not, and they usually point at missing content rather than bad retrieval.'),

    h3('The support inbox'),
    p('The original signal. If "I could not find" tickets do not fall after launch, the search is not the thing that was broken.'),
    img('measurement', 'Three gauges of differing sizes with one clearly leading', 'Retrieval hit rate is the number. Everything else is a proxy for it.'),

    h2('What does the interface need to get right?'),
    p('More than a results list, because semantic matches are not self-explanatory the way keyword matches are.'),
    p('When keyword search returns a document, the user can see their word in it. When semantic search returns a document with none of their words, it looks like a mistake unless you show why it matched — a snippet around the relevant passage, with the conceptually matching sentence highlighted.'),
    p('Show the match location, not just the document. Deep-link into the position where the relevant passage sits, which is why storing character offsets at index time matters. Opening a forty-page document at page one and expecting the user to search again defeats the purpose.'),
    p('And keep a visible fallback. When results are weak, saying so and offering browse or contact options is better than presenting four irrelevant documents with confidence.'),
    p('Ranking presentation deserves a moment too. Semantic scores are not intuitive — a 0.82 and a 0.79 may be equally good matches, or one may be irrelevant, depending on the query. Exposing raw scores invites users to interpret a number that does not mean what they think. Show ordering and a relevance floor, not the arithmetic behind it.'),
    p('Filters remain valuable, and people frequently drop them when adding semantic search on the assumption that meaning-matching replaces them. It does not. Date ranges, document types and categories are how users narrow a result set they can already see, and combining a semantic query with structured filters is one of the clearest advantages of keeping everything in one database.'),

    h2('How does it handle permissions?'),
    p('This is the requirement that quietly decides your architecture, and it is worth settling before anything is built.'),
    p('Real search is never "find similar content". It is "find similar content this user may see". If embeddings live in your main database, that is a `WHERE` clause the query planner evaluates alongside the vector comparison — ordinary, correct, and fast.'),
    p('If they live in a separate service, it becomes an application-side problem with no good solution. Over-fetch and filter afterwards and you sometimes return fewer results than requested; push permissions into the vector store and you now maintain an authorisation model in two systems that will drift.'),
    p('That single consideration is why I keep embeddings in Postgres by default on [the stack I build from](/stack), and why "we will add permissions later" is the most expensive sentence in a search project.'),

    h2('What about typos and misspellings?'),
    p('Semantic search handles them better than keyword search and not as well as people expect.'),
    p('Minor misspellings usually still embed near the correct meaning, so "subscripton" finds subscription content. Badly mangled words do not, and neither approach recovers a query that has lost its meaning.'),
    p('Where it matters, Postgres trigram matching handles fuzzy string similarity and slots into the same hybrid merge as a third candidate source. This is worth adding when your content is full of proper nouns — product names, people, places — where users routinely get the spelling nearly right.'),

    h2('What do you actually index?'),
    p('Not whole documents. The unit you index is the unit you can return, and returning a forty-page manual because page thirty-one is relevant helps nobody.'),

    h3('Chunk on the structure the content already has'),
    p('Headings, sections, list groups. A section under a heading is a unit of meaning somebody already decided was coherent, which is exactly what you would otherwise try to reconstruct statistically. Where structure is unreliable, fixed chunks with modest overlap are the fallback.'),
    p('Chunks that are too large dilute meaning — a passage covering five topics is not strongly similar to a question about any one of them. Chunks that are too small arrive without context, so the reader sees an answer fragment with no idea what it refers to.'),

    h3('Index the title and heading path with the chunk'),
    p('Prefixing each chunk with its document title and heading trail measurably improves matching, because it supplies context the chunk text alone lacks. A paragraph about limits means something different under "Rate limits" than under "Refund limits", and the raw paragraph may not say which.'),

    h3('Decide what not to index'),
    p('Navigation text, boilerplate footers, cookie notices and legal preambles will match queries and waste result slots. Excluding them at index time is cheaper than filtering them at query time and produces visibly better results immediately.'),
    img('chunking', 'A large document form separating into several proportional segments, one highlighted', 'You can only return what you indexed. Chunk on the structure the content already has.'),

    h2('How does it fit into an existing product?'),
    p('More easily than most AI features, because it replaces something rather than adding a new surface. Users already understand a search box.'),
    p('The usual sequence is to run it alongside the existing search first. Index the content, build the hybrid query, and compare results against the current implementation on real queries before changing anything users see. That comparison is also your evaluation set, so the work does double duty.'),
    p('Roll it out behind a flag to a proportion of traffic and watch zero-result rate and click-through. This is the same [feature-flag discipline any other change gets](/blog/ai-feature-development-cost) — semantic search is not special enough to skip it, and the metrics are unusually clear.'),
    p('One integration detail worth planning: search is often the first feature to expose a permissions model nobody had formalised. Content that was reachable only by people who knew the URL becomes findable, and that occasionally surfaces documents somebody assumed were private. Audit what becomes visible before the rollout rather than after.'),
    img('rollout', 'Two parallel paths converging, one gradually taking more of the flow', 'Run it alongside the old search first. The comparison is also your evaluation set.'),

    h2('When is semantic search the wrong answer?'),
    p('Three situations where I say so before quoting.'),

    h3('Your keyword search is badly configured'),
    p('A surprising number of "we need semantic search" conversations turn out to be a default search with no stemming, no field weighting and no synonym list. Fixing that is days rather than weeks and frequently resolves most of the complaints.'),

    h3('The content is the problem'),
    p('If the article people cannot find does not exist, or exists in a form nobody would recognise, search is not the constraint. This is diagnosable from the zero-result log, and it is a content project wearing a search costume.'),

    h3('Your corpus is small and browsable'),
    p('Below a few hundred documents, good navigation and filters often beat search entirely. People find things by browsing a well-organised structure, and building search for a corpus that fits on two screens is effort spent in the wrong place.'),
    quote('Half the products that ask for semantic search need better content and a properly configured keyword index. The half that genuinely need it usually needed it a year earlier.'),

    h2('What should you ask a developer about it?'),
    p('Four questions that separate an implementation that will work from one that will disappoint.'),
    ol([
      '**Is it hybrid, or semantic only?** Semantic-only fails on exact identifiers, and that failure is the one users report most sharply.',
      '**Where does permission filtering happen?** In the database query is correct. In the application after retrieval is a bug waiting to surface.',
      '**How is quality measured?** If the answer is not "a labelled query set", quality is an impression and regressions will be invisible.',
      '**What happens when content changes?** Re-embedding on write, with staleness handled explicitly, or the index silently rots.',
    ]),
    p('The last one is the most commonly missed. A search index that drifts out of sync with the content produces confidently wrong results with no error anywhere, and it degrades over months rather than failing visibly.'),
    p('A fifth question, if the answer to the first four is convincing: what happens when you want to change the embedding model? The correct answer involves a stored model identifier and a planned reindex, not a shrug. Models improve, and a system built without a migration path locks you into whichever one was current when it was built.'),
    img('four-questions', 'Four markers arranged before a single gateway', 'These four separate an implementation that holds up from one that disappoints in month three.'),

    h2('Conclusion'),
    p('Semantic search fixes a real and specific problem: users searching for meaning against a system matching characters. It is among the cheapest AI features to add, it needs no generation, and on most stacks it runs inside the database you already have.'),
    p('Run it hybrid so exact identifiers keep working. Filter by permission inside the query rather than around it. Measure with a labelled set rather than by trying it. Show why each result matched, and deep-link to the passage rather than the document.'),
    p('And check first that the problem is search rather than content or configuration. The cheapest version of this project is the one where a properly tuned keyword index and three missing help articles resolve the complaints entirely — and that is worth an afternoon of investigation before anyone quotes for weeks of work.'),
    img('search-outcome', 'A query resolving cleanly into one highlighted result among several', 'The measure of success is a falling "I could not find it" rate, not a better-looking results page.'),
    p('There is also a natural next step worth knowing about, because it changes how you build this one. Semantic search is the retrieval half of a question-answering assistant. If answering questions directly is plausibly on the roadmap, index with that in mind — store character offsets, keep chunks coherent, build the labelled query set — and the later project becomes an addition rather than a rebuild. Skip those and the assistant starts by redoing the indexing work you already paid for, which is the most common avoidable expense in this area.'),
  ),
  faqs: faq([
    ['What is semantic search?',
     'Search that matches on meaning rather than characters, so "cancel my subscription" finds an article titled "end your plan" despite sharing no words. It works by comparing numerical representations of meaning rather than by matching text directly.'],
    ['Is semantic search better than keyword search?',
     'Better on natural questions and paraphrasing, worse on exact identifiers like order numbers and error codes. They fail in opposite directions, so running both and merging the results outperforms either alone in almost every product.'],
    ['How much does semantic search cost to run?',
     'Typically $25 to $150 a month, dominated by re-embedding when content changes. There is no generation step, so it is considerably cheaper than a chat assistant, and on Postgres the storage and index add nothing beyond your existing database.'],
    ['How do you handle permissions in search results?',
     'Filter inside the database query, alongside the vector comparison, so the planner evaluates both together. Filtering after retrieval in application code means you sometimes return fewer results than requested and duplicates your authorisation model.'],
  ]),
};
