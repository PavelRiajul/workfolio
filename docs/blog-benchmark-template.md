# Blog benchmark template

A reusable method for deciding what a blog should look like, by measuring a
competitor who is already winning rather than guessing.

Run `node scripts/blog/benchmark.mjs --index <competitor-blog-url>` first. It
produces the numbers for sections 2 and 6 directly. Fill the rest by reading a
handful of their posts and looking at three of their images.

**The rule that makes this worth doing:** every number in the report is measured,
not estimated. "Their posts are long" is an impression. "Median 3,845 words across
eight sampled posts" is a target you can build against.

---

## 1. What `<COMPETITOR>` actually is

> Establish what you are looking at before drawing conclusions from it. A
> lead-gen content farm and a genuine publication need opposite responses.

**Platform:** `<CMS / framework — check for w-richtext (Webflow), wp-content
(WordPress), _next (Next.js), __NUXT__>`. Note whether posts are one rich-text
field or repeating blocks; the second is what lets them ship tables and varied
media consistently.

**Scale:** `<N>` published posts. `<author byline present / absent>`.
`<original publish date shown / only "last updated">`.

**The play:** `<who is this for and what does it sell>`. Look at the topic
distribution — it is the clearest statement of intent on the whole site:

| Pattern | Count | Example |
|---|---:|---|
| `<X vs Y>` | | |
| `<How much does X cost>` | | |
| `<Best/Top N …>` | | |
| `<What is X>` | | |
| `<How to X>` | | |

Then say plainly what the mix targets: **commercial intent** (someone with budget,
about to buy) or **informational** (someone learning). Most agency blogs are the
first and do not hide it.

---

## 2. Word counts — measured

Paste the table from `benchmark.mjs`. It strips nav, header and footer before
counting; counting the whole document inflates every figure by the chrome.

| Post | Words | H2 | ?H2 | H3 | Images | Tables | List items |
|---|---:|---:|---:|---:|---:|---:|---:|
| | | | | | | | |

**Median `<N>` · Mean `<N>` · Range `<N>–<N>`**

Check their declared read times against the word counts at ~250wpm. Where the two
disagree badly, the number is UI decoration rather than a calculation — worth
knowing before you copy the convention.

**Your target: `<lower>–<median>` words.** Aim below their median, not at their
max. The long tail is almost always a listicle padded with list items, which is
volume rather than depth, and it is the least defensible thing to imitate.

---

## 3. Anatomy of one post

Take the post nearest their median and list its H2s in order, annotating what
each one is doing:

```
<H2 1>                        ← definition, answers the title immediately
<H2 2>
<H2 3>                        ← comparison table
<H2 4>                        ← numbered process
<H2 5>                        ← the unique asset (sample, template, real data)
<H2 6>                        ← commercial intent (cost / how long / who for)
<H2 7>                        ← the conversion hinge (DIY or hire)
Frequently Asked Questions    ← FAQPage schema
Conclusion
```

That sequence is the reusable part. Most high-performing commercial posts follow
it: define, elaborate, compare, qualify, process, prove, price, convert.

**Schema per post:** `<types>`. Note whether it is one connected `@graph` with
`@id` cross-references or several loose `<script>` blocks — the first is better
and is a cheap advantage to hold.

**Their gaps you should not copy:**

- `<missing meta descriptions — Google writes the snippet instead>`
- `<no table of contents>`
- `<N internal links in an M-word article>`
- `<no author, no E-E-A-T>`
- `<N CTAs mid-article>`

**Freshness tactics:** check whether "last updated" dates cluster on today. Constant
re-touching to keep dates current works until it doesn't — engines discount
`dateModified` when the content has not actually changed. Set yours on real
revisions only.

---

## 4. The image system, decoded

Download three of their images and look at them properly. A consistent blog has a
formula, and the formula is more useful than any single image.

**Specs:** banner `<W×H (ratio)>`, card thumb `<W×H>`, format `<AVIF/WebP/JPEG>`,
alt text `<pattern — often the post title verbatim>`.

**The formula — list every element that appears in all three:**

1. `<background treatment and dominant hue>`
2. `<lighting and vignette>`
3. `<hero subject, and where it sits in frame>`
4. `<typographic lockup — how many lines, which typeface pairing, accent colour>`
5. `<kicker line above the title>`
6. `<micro-detail garnish>`
7. `<logo placement>`

Then describe one image concretely, so the formula is not abstract:

> `<one-paragraph description of a single banner>`

---

## 5. Generating the images

**Current models** — verify at [ai.google.dev](https://ai.google.dev) before wiring
anything up, because ids and pricing move fast.

| Model | Model ID | Price/image |
|---|---|---|
| Nano Banana Pro (Gemini 3 Pro Image) | `gemini-3-pro-image-preview` | $0.134 (1–2K), $0.24 (4K) |
| Batch / async 2K | — | $0.067 |
| Nano Banana 2 (Flash) | `gemini-3-1-flash-image` | cheaper, faster |

### The workflow that actually holds up

Look closely at the competitor's kerning. Precisely letter-spaced type over a
licensed typeface was almost certainly set in a design tool over a generated
plate, not generated. Do the same:

```
Image model  →  background plate (no text)
                      ↓
Figma        →  typographic lockup in YOUR brand fonts
                      ↓
Export       →  AVIF/WebP → public/blog/<slug>.avif
```

Generating text-free plates sidesteps the one thing image models still fumble, and
keeps your brand fonts exact rather than approximate.

### Prompt template

```
<Cinematic|Editorial> 3D hero plate, 1.85:1, 2K.
<Background colour and treatment>, single <colour> light source from the
<direction>, <vignette / shadow behaviour>.

Centre-low subject: {SUBJECT}.

Materials: <material vocabulary>.
Exactly one accent colour, <hex>, used only on {ACCENT}.
Micro-detail: {GARNISH}.

<Depth of field, lens, grain, negative space>.

NEGATIVE: no text, no letters, no numbers, no words, no logos, no
watermarks, no UI labels. Keep the upper-centre third visually calm and
uncluttered for a headline.
```

**That last line is the one people miss.** Say it every time, or the model fills
the headline area with detail and the plate is unusable.

### Adapt, do not copy

If the competitor is dark and cinematic and your site is light and minimal, a copy
of their palette will look pasted on. **Keep the composition discipline, swap the
palette.** The rigour is the part worth taking; the colours are not.

### One subject per cluster

Reuse a subject per content cluster so posts read as a set:

| Cluster | Subject |
|---|---|
| | |

---

## 6. What to copy, and what not to

**Copy:**

- `<word count and H2 range>` — your current longest page is `<N>`
- Comparison tables — they ship `<N>` per post, you have `<N>`
- Question-shaped H2s — `<N>` of theirs, `<N>` of yours
- An FAQ block per post with `FAQPage` schema
- One image every ~`<N>` words at a consistent aspect ratio
- `<their highest-intent topic patterns that genuinely fit you>`

**Do not copy:**

- `<anonymity, if your named author is the product>`
- `<rolling "last updated" dates>`
- `<their internal linking, if it is thin>`
- `<listicle formats that do not fit your scale>`
- `<several loose JSON-LD blocks, if yours is one graph>`

---

## 7. Where this leaves you

State the competitor's actual advantage in one sentence, honestly. Usually it is
**volume and commercial intent, not craft** — `<N>` posts × `<N>` words ≈ `<total>`
words. You will not out-publish that and should not try.

Then state what beats it on a smaller number of posts:

- `<a named practitioner with a verifiable track record>`
- `<real numbers from real projects they cannot access>`
- `<the honest counterweight that makes your claims believable>`

The test for every planned post: **could the competitor write this?** If yes, you
are competing on volume, which is the one axis you lose. If no — because it needs
receipts you have and they do not — that is the post to write.

---

## Turning this into a plan

Once the report is filled in:

1. Encode the numbers as a **gate**, not a guideline — see `scripts/blog/anatomy.mjs`.
   A rule that is checked is a rule; a rule in a document is a suggestion.
2. Write the topic list against the patterns in section 1, filtered by the test above.
3. Build one image prompt per post from the section 5 template, changing only the
   subject and accent so the set stays coherent.
4. Publish through a script that refuses anything failing the gate.
