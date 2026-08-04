/**
 * A tiny authoring DSL that emits Portable Text in exactly the shape
 * `PortableText.astro` renders and `schemaTypes/post.ts` allows.
 *
 * Inline marks are written markdown-style — **strong**, _em_, `code`,
 * [text](url) — and parsed into spans with markDefs, because hand-writing
 * span arrays for a 3,000-word article is where mistakes come from.
 */
let n = 0;
const key = () => `k${(n++).toString(36)}${Math.floor(1e6 * 0.618033).toString(36)}`;

/** Split a line into spans, lifting **strong**, _em_, `code` and links. */
function spans(text) {
  const out = [];
  const defs = [];
  const rx = /\*\*(.+?)\*\*|_(.+?)_|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m;
  const push = (t, marks) => {
    if (t) out.push({ _type: 'span', _key: key(), text: t, marks: marks ?? [] });
  };
  while ((m = rx.exec(text))) {
    push(text.slice(last, m.index));
    if (m[1] !== undefined) push(m[1], ['strong']);
    else if (m[2] !== undefined) push(m[2], ['em']);
    else if (m[3] !== undefined) push(m[3], ['code']);
    else {
      const dk = key();
      defs.push({ _type: 'link', _key: dk, href: m[5] });
      push(m[4], [dk]);
    }
    last = rx.lastIndex;
  }
  push(text.slice(last));
  return { children: out, markDefs: defs };
}

const block = (style, text) => {
  const { children, markDefs } = spans(text);
  return { _type: 'block', _key: key(), style, children, markDefs };
};

export const p = (t) => block('normal', t);
export const h2 = (t) => block('h2', t);
export const h3 = (t) => block('h3', t);
export const h4 = (t) => block('h4', t);
export const quote = (t) => block('blockquote', t);

const listItem = (t, listItem) => {
  const b = block('normal', t);
  return { ...b, listItem, level: 1 };
};
export const ul = (items) => items.map((t) => listItem(t, 'bullet'));
export const ol = (items) => items.map((t) => listItem(t, 'number'));

export const code = (language, codeText) => ({
  _type: 'code', _key: key(), language, code: codeText.trim(),
});

export const table = (caption, rows, headerRow = true) => ({
  _type: 'table', _key: key(), caption, headerRow,
  rows: rows.map((cells) => ({ _type: 'row', _key: key(), cells })),
});

export const faq = (pairs) =>
  pairs.map(([question, answer]) => ({ _type: 'faq', _key: key(), question, answer }));

/** Flatten nested arrays (ul/ol return arrays) into one body array. */
export const body = (...parts) => parts.flat();

/** Rough word count of the rendered prose, for sanity-checking length. */
export function words(blocks) {
  let t = 0;
  for (const b of blocks) {
    if (b._type === 'block') t += (b.children || []).map((s) => s.text).join(' ').split(/\s+/).filter(Boolean).length;
    if (b._type === 'table') t += (b.rows || []).flatMap((r) => r.cells).join(' ').split(/\s+/).filter(Boolean).length;
  }
  return t;
}
