---
name: blog-loop
description: Resume the blog publishing pipeline — write the next posts from the 105-post plan into Sanity, gated on the anatomy checker, category by category. Use when the user asks to continue the blog, write more posts, or restart the blog loop.
---

# Blog publishing loop

Resumes the pipeline that writes long-form posts into the Sanity dataset. Everything
needed lives in `scripts/blog/`; nothing depends on a previous session.

## Start here, every time

```bash
npm run blog:queue
```

That prints how many posts are published, how many remain, and which category is
next. **The queue file is the source of truth** — never guess what has shipped.
`scripts/blog/push.mjs` advances it automatically on a successful write, so it
cannot drift from the dataset.

The full plan, with outlines, table contents, FAQ questions and image prompts for
all 105 posts, is in `~/Desktop/riajulislam-blog-plan.xlsx`.

## The loop

Work through `queue.current_category` in order, then move to the next category
that still has entries. Per iteration, write **one to three posts**:

1. Create `scripts/blog/posts/post-<name>.mjs` using the authoring DSL.
2. `npm run blog:check -- scripts/blog/posts/post-<name>.mjs` until it passes.
3. `npm run blog:push -- scripts/blog/posts/post-<name>.mjs`
4. `npm run build` and confirm zero errors, then report progress.

To keep running unattended, use `/loop` with this skill. To stop, `/loop` stops
on request or when every category is empty.

## Writing a post

`scripts/blog/pt.mjs` is the authoring DSL. Inline marks are markdown-style —
`**strong**`, `_em_`, `` `code` ``, `[text](/href)` — and are parsed into spans
with markDefs, because hand-writing span arrays for a 3,000-word article is where
mistakes come from.

```js
import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/<slug>/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-<slug>', slug: '<slug>', title: '…', category: 'fullstack',
  order: 30, readTime: '12 min read', date: 'August 2026',
  publishedAt: '2026-08-14', series: '…', excerpt: '… (80–155 chars)',
  coverLabel: '… — cover',
  body: body(/* p(), h2(), h3(), ul([]), table(), code(), img() */),
  faqs: faq([['Question?', 'Answer of 30–75 words.'], /* four total */]),
};
```

Copy an existing post from `scripts/blog/posts/` as a starting shape — they all
pass, and matching their structure is faster than building one from the rules.

## The anatomy

Measured from eight parsed Orbix Studio posts, encoded in `scripts/blog/anatomy.mjs`.
`push.mjs` refuses to publish anything that fails, so this is a gate rather than a
guideline.

| Rule | Range |
|---|---|
| Body words | 2,500–4,200 |
| H2 | 10–16, at least 3 phrased as questions |
| H3 | 8–45 |
| Images | 6–26, one per <450 words, all with alt text |
| Tables | 1–17 |
| FAQs | 4–6, answers 30–75 words |
| Internal links | 3+ distinct |
| Excerpt | 80–155 characters |

Also enforced: every image needs alt text, and the body must not contain its own
"Frequently asked questions" heading — the template renders that from `faqs`.

**Expect two to four expansion passes per post.** First drafts land around
1,600–2,100 words against a 2,500 floor. Write long from the start: roughly 14 H2
sections with three substantial paragraphs each, plus 12 H3s, gets there.

## Grounding — the part that matters most

Posts must read as though only this person could have written them. Generic advice
about the topic is a failed post even when it passes the gate.

Draw on:

- **The four stack templates** — Landing, Standard Web App, B2B/Multi-Tenant, AI Feature App
- **The real toolbox** — Astro, Next.js, Tailwind, GSAP, React Native/Expo, Supabase,
  Neon, Prisma, Clerk, Cloudflare Pages/R2, Vercel, Render, Sanity, Shopify, Stripe,
  Resend, Claude/GPT, Groq, Zod, Cal.com, n8n, WhatsApp API, Sentry, PostHog,
  Turnstile, Vitest/Playwright
- **The eight things set up in every build** — staging, CI, error tracking, uptime
  monitoring, tested backups, spam protection, SPF/DKIM/DMARC, client-owned accounts
- **The five services** and the **six-step process**
- **The case studies** — Halo (19-day AI MVP), Vellum (headless Shopify), Northwind,
  Pulse (React Native), Anchor (B2B marketplace)

Every post links to at least three of `/services`, `/stack`, `/work/<slug>`,
`/start`, or another published post. Check `npm run blog:queue` for what is already
published before linking to a post — a link to an unwritten post is a 404.

## Voice

Match the site: direct, first-person, specific. Every speed or capability claim gets
an honest counterweight — that is the `ai-caveat` convention and it is what makes the
claims believable. Prefer a real number from a real project over a general assertion.
US spelling, to match `src/data/content.ts`.

## Images

Posts reference `/blog/<slug>/<name>.avif` files that do not exist yet. This is
deliberate: `publicFileExists()` means a missing file renders no figure rather than a
broken image, so posts are correct today and improve when artwork lands. Prompts for
every planned image are in the workbook's **Image System** sheet.

## Gotchas

- `push.mjs` uses `patch`/`set`, never `createOrReplace`, so fields it does not
  mention are preserved. It reads the Sanity token from `~/.config/sanity/config.json`.
- A post is published by having a `body`. No body, no URL.
- `categoryLabel` is optional — it is derived from `src/lib/categories.ts`. Leave it out.
- Category values must be one of: `ai`, `ecommerce`, `mobile`, `fullstack`, `frontend`,
  `backend`, `performance`, `career`.
- Rebuild after every push. RSS validation in particular fails loudly on a bad field
  and takes the whole build with it.
