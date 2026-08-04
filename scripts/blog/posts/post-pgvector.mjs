import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/pgvector-semantic-search/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-pgvector-semantic-search',
  slug: 'pgvector-semantic-search',
  title: 'Semantic Search With pgvector Before You Buy a Vector Database',
  category: 'ai',
  order: 17,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-07',
  series: 'RAG',
  excerpt:
    'Postgres handles semantic search for most products. When pgvector is enough, how to index it, and where a dedicated vector database earns its cost.',
  coverLabel: 'pgvector — cover',
  body: body(
    p('The default advice when someone adds semantic search is to reach for a dedicated vector database. It is usually the wrong first move, and it introduces a second data store, a second bill and a synchronisation problem into a product that did not have one.'),
    p('For most products, the database you already run handles this. `pgvector` turns Postgres into a vector store, and because the embeddings live beside your application data, filtering by permissions or joining to a user is ordinary SQL rather than an application-side merge.'),
    p('This is the setup behind [Halo](/work/halo) and it is what I default to on [Supabase and Neon](/stack), which both ship the extension. Here is where it genuinely works, how to index it so it stays fast, and the specific points where a dedicated service starts earning its cost.'),

    h2('What does pgvector actually do?'),
    p('It adds a `vector` column type to Postgres, plus distance operators for comparing vectors and index types for making those comparisons fast at scale. That is the whole surface area, and its smallness is the point.'),
    p('An embedding is a list of numbers representing the meaning of a piece of text. Two passages about the same subject produce vectors that sit close together even when they share no vocabulary. Searching semantically means embedding the question the same way and finding the nearest stored vectors.'),
    p('Without an index, Postgres compares the query against every row — exact, and linear in table size. That is genuinely fine up to tens of thousands of rows and becomes unusable well before a million. The index types exist to trade a small amount of accuracy for a large amount of speed.'),
    img('vectors-in-postgres', 'A database cylinder with a translucent point cloud suspended above it, one cluster highlighted', 'The embeddings live in the same database as the rows they describe. That is the entire argument.'),

    h2('Why keep embeddings in your main database?'),
    p('Three reasons, and the first is worth more than the other two combined.'),

    h3('Filtering by permission is a WHERE clause'),
    p('Real search is almost never "find similar text". It is "find similar text *that this user is allowed to see*". With embeddings in Postgres that is a join and a `WHERE`, evaluated by the query planner alongside the vector comparison.'),
    p('With a separate vector service it becomes an application-side problem, and every solution is bad. Fetch extra candidates and filter afterwards, and you sometimes return fewer results than requested. Push permission metadata into the vector store, and you now have an authorisation model duplicated in two systems that will drift.'),

    h3('No synchronisation problem'),
    p('A document edited in Postgres and embedded in a separate store requires the two to be kept consistent. When that fails — and it fails quietly — search returns stale content with no error anywhere. Writing both in one transaction removes the entire failure mode.'),

    h3('One system to operate'),
    p('One backup, one restore procedure, one set of credentials, one thing to monitor. For a small team this is not a minor consideration; it is often the difference between infrastructure that gets maintained and infrastructure that does not.'),

    h2('How do you set it up?'),
    p('On Supabase and Neon the extension is available immediately. The schema is unremarkable, and the important decisions are the dimension and what you store alongside the vector.'),
    code('sql', `
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chunks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  org_id        uuid NOT NULL,          -- what permission filtering uses
  content       text NOT NULL,
  embedding     vector(1536) NOT NULL,
  model         text NOT NULL,          -- which model produced this vector
  char_start    int  NOT NULL,          -- for deep-linking a citation
  char_end      int  NOT NULL,
  created_at    timestamptz DEFAULT now()
);
`),
    p('The `model` column is the one people leave out and regret. Vectors from different embedding models are not comparable, so a partially migrated table returns nonsense for exactly the queries spanning both. Recording which model produced each vector makes a mixed state detectable rather than silently wrong.'),
    p('The character offsets matter for the same reason they matter in [any retrieval pipeline](/blog/rag-that-answers): a citation that opens a forty-page document at page one is useless, and reconstructing the position later is far harder than storing it at index time.'),

    h2('IVFFlat or HNSW — which index?'),
    p('HNSW for almost everything. It gives better recall at the same latency, and it does not require you to guess a parameter before you know how much data you will have.'),
    table('The two pgvector index types compared', [
      ['Factor', 'IVFFlat', 'HNSW'],
      ['Recall at equal latency', 'Lower', 'Higher'],
      ['Build time', 'Fast', 'Slower'],
      ['Memory use', 'Lower', 'Higher'],
      ['Needs tuning up front', 'Yes — list count', 'No'],
      ['Handles incremental inserts', 'Degrades', 'Well'],
    ]),
    p('IVFFlat partitions vectors into lists and searches only the nearest few. It builds quickly and uses less memory, and it has a trap: the list count must be chosen relative to the eventual table size, and an index built on a small table performs badly once the table grows. Rebuilding is the only fix.'),
    p('HNSW builds a navigable graph. It costs more memory and more build time, and it handles incremental inserts gracefully, which matters when documents arrive continuously rather than in one import.'),
    code('sql', `
-- Cosine distance, which is what most embedding models expect.
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

-- Raise recall at query time when the answer matters more than a few ms.
SET hnsw.ef_search = 100;  -- default is 40
`),

    h2('How do you query it?'),
    p('The `<=>` operator is cosine distance. Order by it, limit, and include the permission filter in the same statement.'),
    code('sql', `
SELECT id, content, document_id, 1 - (embedding <=> $1) AS score
FROM chunks
WHERE org_id = $2                       -- permissions, evaluated by the planner
ORDER BY embedding <=> $1
LIMIT 20;
`),
    p('One subtlety worth knowing: a highly selective `WHERE` clause can cause the planner to skip the index entirely and scan, which is correct when the filtered set is small and slow when it is not. If a filtered query is unexpectedly slow, check the plan before assuming the index is at fault.'),
    p('Retrieve more candidates than you need — twenty, not five — and rerank them. Vector distance is good at finding roughly relevant passages and poor at ordering them, so the top result by distance is frequently not the best answer.'),

    h2('How do you combine it with keyword search?'),
    p('Run both and merge. Embeddings are weak on exact strings — product codes, error identifiers, surnames, version numbers — where keyword search is exact. They fail in opposite directions, which is precisely why the combination beats either.'),
    p('Postgres does full-text search natively, so this is one more column and one more index in the same table rather than a third system.'),
    code('sql', `
ALTER TABLE chunks
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX ON chunks USING gin (search_vector);
`),
    p('A generated column keeps the two representations consistent by construction — the text and its search vector cannot drift, because the database derives one from the other. Merge the two candidate sets in the application, dedupe by chunk id, and hand the union to a reranker.'),
    img('hybrid-search', 'Two streams of markers converging into one ordered sequence', 'Exact and fuzzy fail in opposite directions. Running both is why hybrid search wins.'),

    h2('How do you keep embeddings in sync?'),
    p('This is where systems rot quietly, and it deserves more attention than index tuning.'),

    h3('Re-embed on write'),
    p('When content changes, the vector describing it is wrong. Where embedding is fast enough, do it in the same transaction as the content write. Where it is not, enqueue a job and mark the chunk stale until it completes.'),
    p('A stale flag that excludes the chunk from results is better than a fresh-looking chunk that lies. Silent staleness is the failure mode that degrades retrieval over months without producing a single error.'),

    h3('Handle deletes properly'),
    p('`ON DELETE CASCADE` on the document reference means chunks disappear with their parent. Without it, deleted documents remain searchable, which is a data-retention problem as much as a quality one.'),

    h3('Treat a model change as a full reindex'),
    p('Changing embedding model invalidates every stored vector. Plan it as a migration with a backfill, not an upgrade — and use the `model` column to run both sets in parallel during the transition rather than mixing them in one index.'),

    h2('How do you choose the embedding model?'),
    p('This decision is harder to reverse than the index choice, because changing it invalidates everything you have stored. Three things matter, and dimension count is the one people over-weight.'),

    h3('Dimension is a storage and memory decision'),
    p('Larger vectors carry slightly more information and cost proportionally more memory. A 3072-dimension model doubles your index size against a 1536-dimension one for a modest accuracy gain that frequently does not survive reranking.'),
    p('Since the index wants to be resident in memory, and memory is the first real constraint you will hit, smaller vectors extend the range over which Postgres remains the right answer. I default to 1536 unless a measurement says otherwise.'),

    h3('Domain fit beats benchmark position'),
    p('General-purpose embedding models are trained on general text. If your corpus is legal contracts, medical notes or code, a model with relevant training frequently outperforms a higher-ranked general one on your actual queries.'),
    p('The only way to know is to run both against your own evaluation set. This is another argument for having fifty labelled questions before you build anything — it turns the model choice into a measurement rather than a preference.'),

    h3('Cost is usually irrelevant here'),
    p('Embedding is cheap. Indexing a hundred thousand chunks costs a few dollars once, and query embedding is a rounding error against generation. Choosing a worse model to save on embedding cost is optimising the smallest line on the bill.'),
    img('model-choice', 'Two point clouds of differing density above a single database form', 'Dimension is a memory decision. Domain fit is the one that changes answer quality.'),

    h2('How do you index a large corpus without downtime?'),
    p('Building an HNSW index on millions of rows takes time and, done naively, locks the table for the duration. There are three ways round it and only one is generally correct.'),

    h3('Build concurrently'),
    p('`CREATE INDEX CONCURRENTLY` avoids taking a write lock, at the cost of a slower build and a second pass over the table. On a live system this is nearly always the right choice, and it is the default I use.'),
    p('The caveat is that a concurrent build can fail and leave an invalid index behind, which then has to be dropped explicitly. Check `pg_index.indisvalid` after the build rather than assuming success.'),

    h3('Raise maintenance_work_mem for the build'),
    p('HNSW builds are memory-hungry, and the default setting makes them dramatically slower than they need to be. Raising it for the session running the build — not globally — often cuts build time several-fold.'),

    h3('Backfill embeddings on a queue'),
    p('For an existing corpus, generating embeddings is usually the long pole rather than building the index. Push it through [the background worker you already have](/blog/ai-is-a-module-not-a-stack) in batches, with the stale flag keeping partially-indexed content out of results until it completes.'),
    p('This also makes the operation resumable. A backfill that dies at 60% and restarts from zero is considerably worse than one that picks up where it stopped, and on a large corpus the difference is measured in hours.'),
    img('concurrent-index', 'A structure being extended on one side while remaining in use on the other', 'Build concurrently, backfill on a queue, and keep partially-indexed content out of results.'),

    h2('When does pgvector stop being enough?'),
    p('Later than most people assume. Four genuine signals, none of which is simply "we have a lot of data".'),
    table('Where pgvector strains, and what to do', [
      ['Signal', 'Threshold', 'Response'],
      ['Row count', 'Tens of millions', 'Consider a dedicated store'],
      ['Index memory', 'Exceeds instance RAM', 'Scale up first'],
      ['Query latency', 'Consistently over ~200ms', 'Tune ef_search, then scale'],
      ['Rebuild windows', 'Reindex too slow to run', 'Dedicated store handles this better'],
    ]),
    p('Into the low millions of vectors with an HNSW index on a reasonably sized instance, pgvector performs well. The most common real constraint is memory rather than row count — the index wants to be resident, and an index larger than available RAM degrades sharply.'),
    p('Notably absent from that list: "we want semantic search". That alone is never a reason to add a second data store.'),
    p('It is worth being concrete about what "the index no longer fits in memory" looks like, because it is the constraint you will actually hit. An HNSW index is roughly the size of the vectors themselves plus graph overhead, so a million 1536-dimension chunks is on the order of 8–10GB. On an instance with 16GB that coexists comfortably with the rest of your working set; on one with 4GB it does not, and the symptom is a p95 latency that climbs steadily while the average stays flat.'),
    p('The first response to that is almost always to scale the instance rather than to adopt a new system. Doubling memory is a configuration change with a known cost and no migration; introducing a vector service is a synchronisation problem, a second authorisation model and a new operational surface. The economics only favour the second once you are well past the point where the first has stopped working.'),

    h2('When is a dedicated vector database right?'),
    p('Three situations, and they are narrower than the marketing suggests.'),
    p('**Search is the product.** If the core offering is search over a very large corpus, the specialised tooling — better compression, distributed indexes, purpose-built filtering — earns its operational cost. This is a different business from having search as a feature.'),
    p('**You are past tens of millions of vectors** and the index no longer fits comfortably in memory on an instance you are willing to pay for.'),
    p('**You need filtering behaviour Postgres cannot express efficiently**, such as complex metadata predicates evaluated inside the vector search rather than around it. This is rare and it is worth confirming with a query plan before accepting it.'),
    quote('Adding a second data store is not a performance decision. It is an operational one, and it should be made when the first store is actually failing rather than in anticipation.'),

    h2('How do you know it is actually working?'),
    p('Semantic search fails softly. It always returns something, ranked confidently, and the results look plausible whether or not they contain the answer. Without measurement you will not notice degradation until a user reports it.'),

    h3('Measure retrieval hit rate, not user satisfaction'),
    p('Take fifty real queries and label which chunk should be returned for each. Then measure how often the correct chunk appears in the top k. This one number predicts nearly everything downstream, and it is an afternoon of work to produce.'),
    p('Run it after every change to chunking, the embedding model, the index parameters or the query. Index changes in particular look invisible — nothing errors, latency barely moves, and recall can drop several points.'),

    h3('Watch latency at the ninety-fifth percentile'),
    p('Average latency hides the problem. Vector search degrades unevenly as the index grows, and the slow tail appears well before the average moves. A p95 climbing while the mean holds steady is the signal that the index is outgrowing memory.'),

    h3('Log queries that return nothing useful'),
    p('When the best result scores below your relevance floor, record the query. That log is the most direct product feedback available — it is a list of things people expected to find and did not, and it usually points at missing content rather than bad retrieval.'),
    img('measurement', 'Three small gauges arranged around a database form, one reading low', 'Semantic search never errors. Measurement is the only way to notice it degrading.'),

    h2('What does it cost to run?'),
    p('Nothing extra, which is a substantial part of the argument. The extension runs inside the database you are already paying for, so the marginal cost is storage for the vectors and memory for the index.'),
    p('A 1536-dimension vector is about 6KB. A hundred thousand chunks is roughly 600MB of vector data plus index overhead — comfortably within a modest instance. Compare that to a dedicated service with its own subscription, its own scaling behaviour and its own failure modes to learn.'),
    p('The [cost that actually matters in a retrieval system](/blog/ai-cost-logging) is generation, not storage. Optimising the vector store before measuring where spend goes is almost always effort in the wrong place.'),
    img('cost-comparison', 'Two cost blocks of very different sizes, the smaller one nested inside an existing structure', 'The vector store is rarely the expensive part. Generation is.'),

    h2('Conclusion'),
    p('Start in Postgres. Add the extension, store the vectors beside the content with a model column and character offsets, index with HNSW, add a generated `tsvector` column for hybrid search, and filter by permission in the same query.'),
    p('That handles semantic search for the overwhelming majority of products, with no second system to synchronise, no duplicated authorisation model and no additional bill. The embeddings join to your users and your permissions because they live in the same place as your users and your permissions.'),
    p('Revisit the decision when the index outgrows memory, when latency stops responding to tuning, or when search becomes the product rather than a feature. Until one of those is actually true, a dedicated vector database is a solution to a problem you have not got yet — and it brings a synchronisation problem you definitely will.'),
    p('The broader pattern is the one worth taking away. Reaching for a specialised system before the general one has failed is the most reliable way to acquire operational cost without acquiring capability, and semantic search is a particularly common instance because the marketing around it is loud and the Postgres option is quiet.'),
  ),
  faqs: faq([
    ['Is pgvector good enough for production?',
     'For the large majority of products, yes. Into the low millions of vectors with an HNSW index it performs well, and keeping embeddings in Postgres means permission filtering and joins to application data are ordinary SQL rather than application-side work.'],
    ['Should I use IVFFlat or HNSW?',
     'HNSW for almost everything. It gives better recall at equal latency, handles incremental inserts well, and needs no parameter guessed up front. IVFFlat builds faster and uses less memory but requires a list count sized to the eventual table.'],
    ['What happens when you change embedding models?',
     'Every stored vector becomes meaningless, because vectors from different models are not comparable. Treat it as a full reindex with a backfill, and store the model name alongside each embedding so a partially migrated state is detectable rather than silently wrong.'],
    ['When should I move to a dedicated vector database?',
     'When search is the product rather than a feature, when you are past tens of millions of vectors, or when the index no longer fits in memory on an instance you will pay for. Wanting semantic search is not on its own a reason.'],
  ]),
};
