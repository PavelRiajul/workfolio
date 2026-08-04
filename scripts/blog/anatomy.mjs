/**
 * Anatomy gate. Every post is checked against the structure measured from the
 * Orbix benchmark before it is allowed near the dataset, so "follows the
 * anatomy" is a test rather than an intention.
 *
 * Targets come from 8 parsed competitor posts: median 4,302 body words,
 * 10–16 H2s, 17–45 H3s, one image roughly every 300 words, 1–17 tables.
 * Word count is deliberately set below their median — their upper range is
 * padded listicles, not depth.
 */
export const RULES = {
  words: [2500, 4200],
  h2: [10, 16],
  h3: [8, 45],
  questionH2: [3, 99],
  images: [6, 26],
  tables: [1, 17],
  faqs: [4, 6],
  internalLinks: [3, 99],
  excerpt: [80, 155],
  faqAnswerWords: [30, 75],
};

export function audit(post) {
  const b = post.body;
  const blocks = b.filter((x) => x._type === 'block');
  const text = (x) => (x.children || []).map((s) => s.text).join('');
  const h2 = blocks.filter((x) => x.style === 'h2');
  const h3 = blocks.filter((x) => x.style === 'h3');
  const prose = blocks.map(text).join(' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  const images = b.filter((x) => x._type === 'image');

  const got = {
    words,
    h2: h2.length,
    h3: h3.length,
    questionH2: h2.filter((x) => text(x).includes('?')).length,
    images: images.length,
    tables: b.filter((x) => x._type === 'table').length,
    faqs: (post.faqs || []).length,
    internalLinks: new Set(
      b.flatMap((x) => x.markDefs || []).filter((d) => d.href?.startsWith('/')).map((d) => d.href)
    ).size,
    excerpt: post.excerpt.length,
    faqAnswerWords: Math.round(
      (post.faqs || []).reduce((a, f) => a + f.answer.split(/\s+/).length, 0) / Math.max(1, (post.faqs || []).length)
    ),
  };

  const fails = [];
  for (const [k, [lo, hi]] of Object.entries(RULES)) {
    if (got[k] < lo || got[k] > hi) fails.push(`${k}: ${got[k]} (want ${lo}–${hi})`);
  }
  // Every image needs alt text, and one image per ~300 words is the cadence.
  const noAlt = images.filter((i) => !i.alt?.trim()).length;
  if (noAlt) fails.push(`images without alt text: ${noAlt}`);
  const cadence = Math.round(words / Math.max(1, images.length));
  if (cadence > 450) fails.push(`one image per ${cadence} words (want <450)`);
  // The FAQ heading is rendered by the template, so the body must not repeat it.
  if (h2.some((x) => /frequently asked/i.test(text(x))))
    fails.push('body contains its own "Frequently asked questions" H2 — the template renders it');

  return { got, fails, cadence };
}

export function report(post) {
  const { got, fails, cadence } = audit(post);
  const ok = fails.length === 0;
  console.log(`\n${ok ? 'PASS' : 'FAIL'}  ${post.slug}`);
  console.log(
    `  ${got.words}w · ${got.h2} h2 (${got.questionH2} questions) · ${got.h3} h3 · ` +
      `${got.images} img (1/${cadence}w) · ${got.tables} tbl · ${got.faqs} faq · ${got.internalLinks} links · meta ${got.excerpt}`
  );
  fails.forEach((f) => console.log('    ✗ ' + f));
  return ok;
}
