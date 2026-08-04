import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/rag-that-answers/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-rag-that-answers',
  slug: 'rag-that-answers',
  title: 'RAG That Actually Answers: Chunking, Reranking and Citations',
  category: 'ai',
  readTime: '13 min read',
  date: 'June 2026',
  publishedAt: '2026-06-01',
  series: 'RAG',
  excerpt:
    'Most bad AI answers are bad retrieval, not a bad model. The chunking, reranking and citation changes that moved accuracy most on a production assistant.',
  coverLabel: 'RAG pipeline — cover',
  body: body(
    p('A retrieval-augmented generation system gives a wrong answer, and the instinct is to blame the model. Change the prompt. Try a bigger model. Add a firm line telling it not to make things up.'),
    p('That instinct is almost always wrong. In every RAG system I have debugged, the model was handed the wrong passages and then did a competent job of answering the question it appeared to have been asked. The failure happened before the model was involved at all.'),
    p("Everything below comes from [Halo](/work/halo), an AI research assistant that answers questions from a team's own documents, scoped and launched in 19 days. The numbers are from that system's evaluation set rather than a public benchmark, so treat the direction as transferable and the exact figures as one corpus's story."),

    h2('Why are my RAG answers wrong?'),
    p('A RAG pipeline has two halves. Retrieval finds passages that might answer the question. Generation writes an answer from those passages. Only the second half involves the language model, and it collects nearly all the attention.'),
    p('The useful diagnostic is to separate them and measure independently. Take fifty real questions and, for each, record which document actually contains the answer. Then ask one question of your retrieval layer: **did the correct passage appear in what was sent to the model?**'),
    p('If the answer is no, no amount of prompt engineering will save you. The model cannot cite a passage it never received. On the first version of Halo the correct passage was retrieved about 61% of the time, and roughly four in ten answers were consequently wrong or hedged into uselessness. Every improvement below came from moving that number.'),
    img('retrieval-vs-generation', 'Diagram separating the retrieval half of a RAG pipeline from the generation half', 'Measure the two halves separately. Almost every quality problem lives on the left.'),

    h2('How does chunking actually work?'),
    p('Documents are too long to embed whole, so they are split into chunks. Each chunk becomes a vector. At query time the question is embedded the same way and the nearest chunks are returned.'),
    p('That splitting decision is the highest-leverage choice in the pipeline, and it is usually made in the first hour of a project by copying a default out of a tutorial and never revisiting it.'),

    h3('Fixed-size chunking'),
    p('Split every N tokens. Simple, predictable, and it cuts straight through the middle of arguments. A chunk beginning halfway through a sentence and ending halfway through a table row embeds into something that means very little, and it will still be returned confidently.'),

    h3('Fixed-size with overlap'),
    p('The same, except each chunk repeats the tail of the previous one. Overlap means an idea straddling a boundary survives intact in at least one chunk. It costs storage and produces near-duplicate results, both of which are manageable and neither of which is free.'),

    h3('Semantic chunking'),
    p('Split where meaning shifts, by comparing embeddings of adjacent sentences and cutting where similarity drops. Better boundaries, noticeably slower to index, and it produces wildly uneven chunk sizes that complicate everything downstream.'),

    h3('Structural chunking'),
    p('Split on the structure the document already has — headings, sections, list groups. This won on Halo by a clear margin, because the corpus was internal documentation with reliable headings. A section under a heading is a unit of meaning that a human already decided was coherent, which is exactly what you are otherwise trying to reconstruct statistically.'),

    table('Chunking strategies against the same 50-question evaluation set', [
      ['Strategy', 'Retrieval hit rate', 'Index time', 'Weakness'],
      ['Fixed 512 tokens', '61%', 'Fast', 'Splits mid-argument'],
      ['Fixed 512, 15% overlap', '68%', 'Fast', 'Near-duplicate results'],
      ['Semantic', '71%', 'Slow', 'Uneven chunk sizes'],
      ['Structural, by heading', '79%', 'Fast', 'Needs clean structure'],
    ]),

    p('The lesson generalizes even where the numbers do not: **use the structure the document already has before inventing one.** Fall back to fixed-size with overlap only where structure is unreliable, which in practice means scans, exports and anything pasted out of email.'),

    h2('What chunk size should you use?'),
    p('Where structure was unavailable I settled on roughly 512 tokens with about 15% overlap. That is unremarkable and close to where most teams land, which is itself a signal that it is not where your effort belongs.'),
    p('What is worth understanding is why both extremes fail.'),
    ul([
      '**Chunks that are too small** embed cleanly but arrive without context. The model receives a precise fragment and no idea what it refers to — a paragraph of exceptions with no statement of the rule.',
      '**Chunks that are too large** contain the answer alongside several paragraphs about something else. That dilution drags the embedding toward an average of everything inside it, so a 2,000-token chunk covering five topics is not strongly similar to a question about any one of them.',
    ]),
    p('Do not tune this before measuring retrieval. Chunk size is the parameter people spend a week on when the actual problem is that their documents have no structural markup and nobody has looked at the parser output.'),

    h3('Read your parser output before you tune anything'),
    p('This is the least glamorous hour in the whole project and it repeatedly returns more than a week of parameter tuning. Open twenty parsed documents and read them as the pipeline sees them.'),
    p('What turns up is consistently worse than expected. Two-column PDFs interleaved into nonsense, so sentences alternate between unrelated columns. Tables flattened into a single line of numbers with every header lost. Page furniture — running heads, footers, page numbers — injected into the middle of paragraphs. Bullet characters surviving as literal glyphs that fragment the text. Ligatures mangled so common words no longer match a keyword search.'),
    p('Every one of those degrades embeddings silently. There is no error and no warning; retrieval simply performs worse than it should, and the natural conclusion is that the model or the chunk size is at fault. On Halo, fixing table extraction and stripping page furniture was worth several points of hit rate on its own, before any of the changes below.'),
    img('chunk-size-tradeoff', 'Chart showing retrieval quality falling at both very small and very large chunk sizes', 'Both extremes fail, for opposite reasons. The middle is broad and forgiving.'),

    h2('Why is embedding search alone not enough?'),
    p('Embedding search is good at finding roughly relevant passages and bad at ordering them. Ask for the top five and the correct passage is frequently present — at position four, beneath three passages that share vocabulary with the question but do not answer it.'),
    p('This matters more than it appears. Models attend unevenly across a long context, and a correct passage in fourth place competes with three confident-sounding wrong ones. Retrieval hit rate at five looks healthy while answer quality stays poor, which is how teams end up convinced the model is the problem.'),

    h3('The exact-term blind spot'),
    p('Embeddings are also weak on literal strings. Product codes, error identifiers, surnames, version numbers — a vector has no particular respect for `ERR_4021`, so a question about it can return five passages about error handling in general and none containing the code.'),

    h2('Does a reranker make a difference?'),
    p('A reranker is a second, more expensive model that scores each retrieved passage against the question directly, rather than by vector distance. Retrieve twenty candidates cheaply, rerank them, keep the best five.'),
    p('This was the single largest improvement in the entire pipeline. Retrieval hit rate at five went from 79% to 91%, and answer quality moved further than that figure suggests, because the correct passage now arrived first or second instead of fourth.'),
    p('The cost is real and small: one extra call per query, adding roughly 200–400ms. On a feature where a complete answer takes several seconds, nobody notices.'),
    img('reranking-order', 'Illustration of twenty retrieved passages being reordered down to the best five', 'Retrieve wide and cheap, then reorder. Ordering is worth more than recall past a point.'),

    table('Cumulative effect of each retrieval change', [
      ['Pipeline', 'Hit rate at 5', 'Change'],
      ['Fixed chunks, embedding search', '61%', 'Baseline'],
      ['Structural chunks, embedding search', '79%', '+18 points'],
      ['Structural chunks, hybrid search', '84%', '+5 points'],
      ['Structural chunks, hybrid, reranked', '91%', '+7 points'],
    ]),

    h2('How do you combine keyword and vector search?'),
    p('Keyword search is exact where embeddings are fuzzy, and useless where the user phrases something differently to the document. The two fail in opposite directions, which is precisely why running both and merging beats either alone.'),
    p('Postgres does both natively. On [Supabase or Neon](/stack) — the two databases I build on — that means `pgvector` for the vector half and `tsvector` for the keyword half, in one database, queried in one round trip, with the chunks joinable to the rest of your application data in plain SQL. No separate vector service to keep in sync, and no second bill:'),
    code('sql', `
-- Vector candidates
SELECT id, content, 1 - (embedding <=> $1) AS score
FROM chunks
ORDER BY embedding <=> $1
LIMIT 20;

-- Keyword candidates, merged and deduplicated in the application
SELECT id, content, ts_rank(search_vector, plainto_tsquery($2)) AS score
FROM chunks
WHERE search_vector @@ plainto_tsquery($2)
ORDER BY score DESC
LIMIT 20;
`),
    p('Merge the candidate sets, dedupe by chunk id, hand the union to the reranker. The merge does not need to be clever, because the reranker resolves ordering afterwards — reciprocal rank fusion works, and so does plain concatenation.'),

    h3('Keeping embeddings in sync with content'),
    p('The failure mode nobody plans for is drift. A document is edited, the chunk text changes, and the stored vector still describes the old wording. Retrieval quietly degrades over weeks with no error anywhere in the logs.'),
    p('Re-embed on write, in the same transaction that saves the content where you can. Where embedding is too slow for the request cycle, push it onto a job queue and store a flag marking the chunk stale until the job completes. A stale chunk that is knowingly excluded is better than a fresh-looking one that lies.'),

    h3('What happens when you change embedding models'),
    p('Every stored vector becomes meaningless. Vectors from different models are not comparable, so a partially migrated index returns nonsense for exactly the queries that touch both halves. Store the model name and version alongside every embedding, so a mixed state is detectable rather than silently wrong, and treat a model change as a full reindex rather than an upgrade.'),

    h2('What does a RAG pipeline cost to run?'),
    p('Retrieval quality dominates the conversation, and cost is what actually decides whether a feature survives its first quarter. The components price separately and only one of them scales with how good your answers are.'),
    table('Cost per 1,000 answers on the Halo pipeline at launch', [
      ['Component', 'Cost per 1,000 answers', 'Scales with'],
      ['Embedding at index time', 'One-off, ~$2 per 10k chunks', 'Corpus size'],
      ['Query embedding', '~$0.02', 'Query volume'],
      ['Reranking 20 candidates', '~$1.60', 'Query volume'],
      ['Generation with 5 passages', '~$16.00', 'Context size and answer length'],
      ['pgvector on Supabase or Neon', 'Included in the existing database', 'Corpus size'],
    ]),
    p('Routing matters here too. Reranking is latency-sensitive and needs no reasoning, so it goes to a fast model — Groq, in my stack. Generation is where reasoning quality shows, so it goes to Claude or GPT. Behind a provider-agnostic adapter that split is one line of routing, which is exactly why the adapter is worth building before you need it.'),
    p('Generation dominates, and the lever that moves it is context size rather than model choice. Sending five reranked passages instead of twenty unranked ones cut cost per answer by roughly two thirds while *improving* accuracy — which is the unusual case where the cheaper path is also the better one.'),
    p('That worked out to about $0.02 per answer at launch traffic. The number matters less than the fact that it was known: per-user cost logging went in before launch precisely so the question "which account is expensive" had an answer that was not a guess.'),
    img('cost-per-answer', 'Breakdown of cost per answer across embedding, reranking and generation', 'Generation dominates. Fewer, better passages is the only lever that cuts cost and raises quality at once.'),

    h2('How do you make AI citations trustworthy?'),
    p('A citation pointing at the wrong passage is worse than no citation at all. It converts an obviously uncertain answer into a confidently wrong one that survives a spot check, and it costs you the reader the moment they notice.'),
    p('Three rules make citations hold up under scrutiny.'),
    ol([
      '**Cite the chunk, not the sentence.** Store a stable id and character offsets when you index. Pass those ids into the prompt alongside the text, and require the model to reference ids rather than restate sources in prose.',
      '**Verify every id before rendering.** The model will occasionally invent a plausible one. Check each cited id exists in the set you actually sent and drop the ones that do not. This is about ten lines of code and it eliminates fabricated citations as a category.',
      '**Link to the source position, not the document.** A citation opening a 40-page PDF at page one is technically correct and practically useless. The offsets stored at index time are what let you deep-link to the passage itself.',
    ]),
    p('On Halo, 92% of answers carried at least one verified citation. The remaining 8% were mostly questions the corpus genuinely did not answer, which leads directly to the more important behavior.'),
    img('citation-verification', 'Diagram of cited passage identifiers being checked against the retrieved set before rendering', 'Every cited id is checked against what was actually sent. Invented ids never reach the page.'),

    h2('How do you stop a RAG system hallucinating?'),
    p('Hallucination is a symptom. The disease is retrieval returning nothing useful while the model, given no sanctioned way to signal that, fills the gap with something shaped like an answer.'),
    p('Fix it in two places.'),

    h3('A relevance floor in retrieval'),
    p('If the best reranked passage scores below a threshold, do not call the model at all. Return a plain statement that nothing in the documents covers the question. This also saves the token spend on answers that were never going to be correct.'),

    h3('An explicit refusal path in the prompt'),
    p('Make declining a named, legitimate option rather than something the model must infer is acceptable. Models are trained hard toward helpfulness, and "answer from these documents" reads as an instruction to produce an answer regardless.'),
    quote('The most useful thing a research assistant does is tell you when the answer is not in the documents. One confidently wrong answer costs more trust than ten honest refusals.'),
    p('Users tolerate a system that declines. They stop using one that is confidently wrong twice.'),

    h2('How do you evaluate retrieval properly?'),
    p('None of this is worth doing without measurement, and measurement is cheaper than people assume. Fifty real questions, each labelled with the document that answers it, is an afternoon of work. It is the difference between engineering and guessing.'),
    p('Track three numbers on every change:'),
    ul([
      '**Retrieval hit rate at k** — was the correct passage in the top k sent to the model. This one predicts everything else.',
      '**Citation validity** — of the ids cited, how many existed in what the model was given. Fully automatable, and it should sit at 100%.',
      '**Refusal correctness** — when the corpus has no answer, did it decline. An adversarial set of unanswerable questions catches the regression where a prompt tweak makes the model helpful again in the worst way.',
    ]),
    p('Run these on every prompt change as well as every indexing change. Prompt edits look free and are not: a rewording that improves tone can quietly cost four points of refusal correctness, and without a harness you find out from a user.'),

    h2('Which changes moved accuracy most?'),
    p('Ranked by what they actually returned on one production system:'),
    ol([
      '**Structural chunking** — +18 points of hit rate, and the cheapest change on the list.',
      '**A reranker** — +7 points, and a larger quality gain than that implies, because it fixed ordering rather than recall.',
      '**Hybrid search** — +5 points overall, and far more on the subset of questions containing exact identifiers.',
      '**Citation verification** — no effect on hit rate, and the change that most improved whether people trusted the output.',
      '**A relevance floor with an explicit refusal path** — the difference between a demo and something a team relies on.',
    ]),
    p('Four of the five happen before the model is called, and none is a prompt change. That is the point. When a RAG system answers badly, the prompt is the last place to look, not the first.'),
    img('changes-ranked', 'Ranked bar chart of retrieval improvements by their measured effect on accuracy', 'Ranked by measured effect. The prompt is not on the list.'),

    h2('Conclusion'),
    p('The uncomfortable summary is that RAG is mostly a search problem wearing an AI costume. The parts that feel like AI engineering — prompt wording, model selection, temperature — moved accuracy far less than chunking the documents along their own headings and putting a reranker in front of the model.'),
    p('If you are starting from a system that answers badly, work in this order. Build a fifty-question evaluation set with labelled sources, because everything after this is unmeasurable without it. Check your retrieval hit rate before touching anything else. Chunk on document structure. Add hybrid search so exact identifiers stop disappearing. Add a reranker. Verify citation ids before rendering. Only then look at the prompt, and when you do, re-run the evaluation set afterwards, because prompt edits are the changes most likely to regress refusal behavior while appearing to improve everything.'),
    p('None of this requires a specialist stack. The whole pipeline runs on the [setup I start AI projects from](/stack): Next.js and Prisma over Supabase or Neon, `pgvector` and `tsvector` in that same Postgres, Zod validating anything the model hands back, a job queue for indexing so embedding never blocks a request, and per-user cost logging from the first deploy. Retrieval is a module on a normal application, not a stack of its own — which is the same argument as [everything else I build](/services), applied to search.'),
    p('If you are weighing whether retrieval over your corpus is viable at all, the [AI development work I take on](/services) starts with exactly this evaluation set. The honest answer is sometimes that your documents will not clear the bar, and that is far cheaper to discover in week one than in month three.'),
  ),
  faqs: faq([
    ['What is the best chunk size for RAG?',
     'There is no universal answer, but structural chunking by heading beat every fixed size in testing, moving retrieval hit rate from 61% to 79%. Where documents have no reliable structure, 512 tokens with roughly 15% overlap is a solid default. Measure retrieval before tuning anything else.'],
    ['Do I need a reranker in my RAG pipeline?',
     'If answer quality matters, yes. Embedding search finds roughly relevant passages and orders them badly. Retrieving twenty candidates and reranking down to five was the single largest quality improvement in the pipeline, costing about 200 to 400 milliseconds of extra latency per query.'],
    ['How do you make AI citations trustworthy?',
     'Cite the chunk rather than the sentence. Store a stable id and character offsets at index time, pass those ids into the prompt, then verify every cited id exists in what you actually sent before rendering. That final check removes fabricated citations as a category.'],
    ['Why does my RAG system make things up?',
     'Usually because retrieval returned nothing useful and the model had no sanctioned way to say so. Add a relevance floor that skips the model call when the best passage scores too low, and make refusal an explicit named option in the prompt. Hallucination is a symptom; bad retrieval is the disease.'],
  ]),
};
