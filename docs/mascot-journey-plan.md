# Mascot Journey — Plan & Feasibility

Status: **planning / not built yet**. Captures the vision, the technical approach, the
physics-library trade-off, and the decisions still open.

The base mascot already exists: `src/components/Mascot.astro` — a reusable animated SVG
blob (idle / walking / one-shot physics jump), homepage-only, bottom-left corner. This
doc is about an *additional* choreographed "playground" journey layered on top.

---

## The vision (storyboard)

The blob uses the homepage hero as a jungle gym, and the page reacts to its weight.

1. **Long jump** — launches from its bottom-left corner in a low, *flat* arc (horizontal
   velocity, not the vertical hop it does now) and travels rightward across the hero.
2. **Lands on a button → button depresses** — sits on a real button; under its weight the
   button presses down a few px and its shadow flattens. Blob squashes on contact, little
   "oof" wobble, settles a beat.
3. **Springs into the 3D element** — crouches, then leaps up-right onto one of the floating
   glass cards (the Next.js / Shopify / phone / code stack in the hero).
4. **Weighted tilt → "fun" rotation** — the blob's weight tips the card like a seesaw; the
   landing side dips and the card rotates. The tilt is the playful moment.
5. **Slide down** — the tilted card becomes a ramp; the blob slides down its surface, drops
   back to the ground, and walks/settles back into its corner.

### Mapped to real hero elements
- Start point: the fixed mascot, bottom-left.
- The button (beat 2): likely the hero's **"Start a project"** primary CTA (mid-hero, gives a
  natural left-to-right path). Alternatives: "See my work", a tab-bar item.
- The 3D element (beats 3–4): the hero's floating card stack (`.hv-stage` / `.hv-card`).

---

## Feasibility — pure CSS + JS (no libraries)

All five beats are doable with the current toolkit (vanilla JS + CSS transforms, no GSAP):

| Beat | Difficulty | How |
| --- | --- | --- |
| Long jump | Easy | Animate the fixed pet along a flat translate arc with gravity easing (already built). |
| Button depress | Easy | Measure the button's live rect, fly the pet there, toggle a class that presses the button down + flattens its shadow. |
| Spring into 3D card | **Approximate** | Measure card rect, arc the pet onto it. See caveat below. |
| Weighted tilt | Medium | Rotate the target card via transform; must cooperate with the existing mouse-tilt on the stack. |
| Slide down | Easy | Translate the pet along the card's tilt angle back to the ground. |

### The one genuinely approximate part
The cards are rendered in real CSS **perspective** (`preserve-3d`, rotated in 3D space); the
pet is a flat 2D element. Making it look like it's truly *sitting on* a perspective-tilted
surface is fakeable and reads as fun, but won't be pixel-perfect. It'll feel playful, not
simulation-accurate (which usually looks better anyway).

### Hard constraints (not blockers)
- **Desktop-only**, and only while the **hero is in view** — the 3D cards don't exist
  below 900px and the targets sit at the top of the page. Recompute on resize.
- It's **choreography faking weight** (easing + squash), not a rigid-body sim.
- **Reduced-motion**: skip the tour (or a minimal version).
- It becomes a **homepage-specific scripted scene** — it must know where the button and
  cards are. The reusable base mascot stays simple; this is a bespoke layer on top.

---

## Should we use a physics library?

Short version: **you can, but for a *scripted* sequence it's usually the wrong tool**, and
on this page it has a specific catch.

**What an engine buys you:** real gravity, velocity, bounciness, friction, springs,
collisions — emergent motion you don't hand-author.

**Why it fights a scripted cutscene:** physics is emergent / non-deterministic. Landing the
blob *exactly* on a specific button and a specific card, every time and every screen size,
means constraining the engine so hard it's basically scripted anyway — more code, plus a
sim loop running. Engines shine for the *opposite*: a **sandbox** where you throw/drag the
blob and let it tumble, bounce off elements, and settle wherever it lands.

**The page-specific catch:** the 3D cards use CSS perspective. 2D engines (Matter.js,
Planck) treat them as flat rectangles, so a blob "landing on" a tilted card won't line up.
True physics with those cards means moving the whole scene to **Three.js + a 3D physics
engine** (Rapier / cannon) — a big rebuild and a heavy bundle (~100kb+ plus wasm), for a
mascot.

### Recommended middle ground: spring dynamics (no heavy dep)
Use **springs**, not a full engine. A spring integrator is ~15 lines of JS — gives the exact
"weight" feel: the button press that overshoots and settles, the card that tips and wobbles,
the blob squash on impact. Pair with **scripted arcs** for the travel between targets.
Believable weight + reliable choreography + zero heavy dependencies.

### The real fork
- **Scripted cutscene** — springs + scripting. Light, reliable, matches the storyboard.
- **Interactive sandbox** — real engine; throw / drag / collide. Heavier, and the 3D cards
  force a Three.js rebuild.

---

## Open decisions (need answers before building)

1. **Trigger** — click the blob (recommended) · auto-play once on load · loop on a timer ·
   play when hero scrolls into view.
2. **Landing button** — "Start a project" CTA (recommended) · "See my work" · a tab-bar item
   · pick later (wire a sensible default).
3. **3D tilt** — one card seesaws (recommended, cleaner) · the whole stack tilts.
4. **Ending** — slide down, return to corner, rest (recommended, one-shot) · loop the tour.
5. **Approach** — scripted cutscene (springs, recommended) · interactive physics sandbox.
6. **Feel** — weighty/deliberate vs. light/bouncy; how far the card tips (gentle lean vs.
   dramatic seesaw).
