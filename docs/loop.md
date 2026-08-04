# loop.md — restarting the blog pipeline

Everything needed to resume writing posts lives in the repo. Nothing depends on a
previous Claude session.

## The one-liner

In Claude Code, type:

```
/loop /blog-loop
```

That runs the `blog-loop` skill on a self-paced loop: it reads the queue, writes the
next posts, gates them on the anatomy checker, publishes to Sanity, rebuilds, and
repeats until every category is done.

To do a single batch without looping, just:

```
/blog-loop
```

To stop a running loop, say so — or it stops itself when the queue empties.

## Where things stand

```bash
npm run blog:queue
```

```
16 published, 90 remaining
next: fullstack
  fullstack   16  project-stack-templates, mvp-development-cost, supabase-vs-neon-clerk
  backend     15  role-based-auth-nextjs-express, stripe-webhooks-idempotency, …
  frontend    16  astro-vs-nextjs, astro-islands, gsap-lenis-smooth-scroll
  performance 10  core-web-vitals-nextjs, near-zero-cls, cloudflare-pages-vs-vercel
  ecommerce   13  shopify-hydrogen-worth-it, ecommerce-conversion-leaks, …
  mobile      10  react-native-offline-first, app-vs-pwa, expo-in-production
  career      10  project-scoping, development-process, pricing-ai-accelerated-work
```

`scripts/blog/queue.json` is the source of truth. `push.mjs` advances it on every
successful write, so it cannot drift from what is actually in the dataset.

## The files

| Path | What it is |
|---|---|
| `scripts/blog/pt.mjs` | Authoring DSL — markdown-ish marks in, Portable Text out |
| `scripts/blog/anatomy.mjs` | The rules, measured from the competitor benchmark |
| `scripts/blog/push.mjs` | Gate + write to Sanity + advance the queue |
| `scripts/blog/anatomy-check.mjs` | Check without publishing |
| `scripts/blog/queue.json` | What is published, what is left, which category is next |
| `scripts/blog/posts/` | The 16 published posts, as source |
| `.claude/skills/blog-loop/SKILL.md` | The instructions Claude follows |
| `~/Desktop/riajulislam-blog-plan.xlsx` | All 105 posts: outlines, tables, FAQs, image prompts |

## Commands

```bash
npm run blog:queue                        # where am I
npm run blog:check                        # check every post
npm run blog:check -- scripts/blog/posts/post-foo.mjs
npm run blog:push  -- scripts/blog/posts/post-foo.mjs
npm run build                             # always, after a push
```

## Doing it by hand

1. Pick the next slug from `npm run blog:queue`.
2. Find its row in the workbook — outline, table contents, FAQ questions, image prompt.
3. Copy an existing file from `scripts/blog/posts/` and rewrite it.
4. `npm run blog:check -- <file>` until it passes.
5. `npm run blog:push -- <file>`, then `npm run build`.

## The anatomy, in short

2,500–4,200 words · 10–16 H2 with 3+ as questions · 8–45 H3 · 6+ images with alt
text, one per <450 words · 1+ table · 4 FAQs of 30–75 words · 3+ internal links ·
excerpt 80–155 chars.

First drafts reliably land around 1,800 words. Budget two to four expansion passes,
or write long from the start.

## Still outstanding

- **Images.** No files exist yet. Posts reference `/blog/<slug>/<name>.avif`; a
  missing file renders no figure rather than a broken image, so nothing is broken —
  the posts just improve when artwork lands. Prompts are in the workbook.
- **`wa.me/8801`** in `src/data/content.ts` is a placeholder number, live on every page.
