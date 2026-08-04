---
name: blog-benchmark
description: Benchmark a competitor's blog and produce a content plan from measured numbers — word counts, heading structure, images, schema, topic patterns and an image-prompt system. Use when the user wants to analyse a competitor blog, decide what their own posts should look like, or plan blog content against a rival.
---

# Blog benchmark

Turns "their blog looks good, make ours like that" into measured targets.

## Run the measurement first

```bash
node scripts/blog/benchmark.mjs --index <competitor-blog-url>
```

It pulls candidate post URLs off the listing page, samples eight spread across the
catalogue rather than the newest eight, isolates each article body, and reports
word counts, H2/H3 counts, question-shaped headings, images, missing alt text,
tables, list items, internal links, meta description length and schema types.

Specific URLs work too:

```bash
node scripts/blog/benchmark.mjs <url> <url> <url>
```

**Never report a number you did not measure.** The script exists because eyeballing
a blog produces "their posts are long", which is not something anyone can build
against.

## Then fill in the report

`docs/blog-benchmark-template.md` is the structure. Seven sections:

1. **What they actually are** — platform, scale, and the topic distribution that
   reveals intent. A lead-gen content farm and a real publication need opposite responses.
2. **Word counts** — the script's table, plus median and range.
3. **Anatomy of one post** — H2 outline of their median post, annotated with what
   each heading is doing, plus their schema and their gaps.
4. **The image system** — download three images, look at them, extract the formula.
5. **Generating the images** — the prompt template, adapted to the user's palette.
6. **Copy / don't copy** — explicit both ways.
7. **Where this leaves you** — their real advantage, and what beats it.

## Things worth getting right

**Strip the chrome before counting.** Counting a whole document inflates every
figure by nav, footer and mega-menu. On the first site this ran against that was
roughly 1,000 words and 90 images of pure chrome — enough to make a 2,800-word
post look like 3,800. The script handles it; if you count by hand, do the same.

**Sample across the catalogue.** The newest eight posts are usually their best and
least representative. The script strides through the listing for this reason.

**Aim below their median, not at their max.** The long tail is almost always a
listicle padded with list items. Volume is not depth, and it is the least
defensible thing to imitate.

**Look at the images properly.** Download three and view them. A consistent blog
has a formula — one dominant hue, one light source, one subject placement, one
type treatment — and the formula transfers even when the palette should not.

**Adapt the palette, keep the composition.** If they are dark and cinematic and the
user's site is light and minimal, copying their colours produces something that
looks pasted on. The compositional rigour is the transferable part.

**Every prompt ends with the negative clause** — no text, no letters, no logos, and
keep the upper-centre third calm for a headline. Omit it and the model fills the
headline area with detail.

## The test that decides the topic list

For every candidate post: **could the competitor write this?**

If yes, the plan competes on volume, which is the axis a smaller site loses. If no
— because it needs receipts, numbers or a named practitioner they do not have —
that is the post worth writing.

## Finish by making it enforceable

A benchmark that ends as a document gets ignored. Encode the numbers as a gate the
publishing step actually runs, the way `scripts/blog/anatomy.mjs` does — word
floor, heading counts, question-shaped H2 minimum, image cadence, table minimum,
FAQ count, internal links, meta length. Then have the publish script refuse
anything that fails.

For this project specifically, that pipeline already exists: `/blog-loop` writes
against the gate, and `docs/loop.md` explains it.
