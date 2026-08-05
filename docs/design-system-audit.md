# Design system audit

Measured from `src/styles/global.css`, August 2026. Every number here is
counted, not estimated.

The short version: **spacing and buttons are a real system. Type, radius and
shadow are not.** Colour is disciplined on content surfaces and sprawls inside
the decorative mockups.

---

## Scoreboard

| Dimension | Tokens declared | Raw values in use | Verdict |
|---|---:|---:|---|
| Spacing | 8 + gutter + 2 section | 22 bare `clamp()` vs 77 token uses | **Good** |
| Font weight | — | 4 (400/500/600/700) | **Good** |
| Buttons | 5 classes | — | **Good** |
| Colour (content) | 6 | low | **Good** |
| **Type size** | **0** | **57 distinct** | **Broken** |
| **Border radius** | **0** | **27 distinct** | **Broken** |
| **Shadow** | **0** | **21 distinct** | **Broken** |
| Colour (decoration) | 0 | 63 hex + 99 rgba | **Unmanaged** |

---

## 1. Type — the main finding

**57 distinct font sizes, no scale, no tokens.**

Nine of them are half-pixel values used 100 times:

```
9.5px  10.5px  11.5px  12.5px  13.5px  14.5px  15.5px  17px  19px
```

Half-pixel sizes are the signature of nudging a number until it looked right,
one component at a time. They are why the tab bar reads as cheap: an 11px label
under a 16px icon was not chosen from a scale, it was arrived at.

The most-used sizes cluster tightly with no rhythm between them:

| Size | Uses | | Size | Uses |
|---|---:|---|---|---:|
| 13px | 39 | | 12.5px | 18 |
| 15px | 31 | | 13.5px | 17 |
| 12px | 27 | | 10.5px | 16 |
| 11px | 27 | | 16px | 15 |
| 14px | 25 | | 11.5px | 15 |

Six sizes between 10px and 13.5px doing essentially the same job.

**Proposed scale** — 8 steps, a ~1.2 ratio, fluid where it matters:

```css
--text-2xs:  11px;                        /* micro-labels, chips */
--text-xs:   12px;                        /* captions, meta */
--text-sm:   13px;                        /* dense UI, table cells */
--text-base: 15px;                        /* body */
--text-md:   17px;                        /* lede, large body */
--text-lg:   clamp(20px, 2.2vw, 24px);    /* card headings */
--text-xl:   clamp(26px, 4vw, 38px);      /* section headings */
--text-2xl:  clamp(34px, 6vw, 58px);      /* page titles */
```

57 → 8. Every half-pixel size maps to the nearest step; nothing on the site
needs a 0.5px distinction.

---

## 2. Border radius — 27 values

```
9999px (49 uses — the pill, correct and consistent)
50%     (9 — avatars and dots, correct)
then: 3, 4, 5, 6, 9, 14, 16, 17, 18, 22 …
```

The pill is a genuine brand signature and it is applied consistently. The
problem is the 3–9px cluster, which is six values doing one job, and the
14–22px cluster, which is five doing another.

**Proposed:**

```css
--radius-sm:   6px;      /* inputs, small chips, code */
--radius-md:   14px;     /* cards */
--radius-lg:   22px;     /* panels, large surfaces */
--radius-pill: 9999px;   /* buttons, tabs, chips — unchanged */
--radius-full: 50%;      /* dots, avatars — unchanged */
```

27 → 5.

---

## 3. Shadow — 21 values

No elevation model. Twenty-one distinct shadows means each was written where it
was needed rather than picked from a set, so two cards at the same conceptual
depth can render differently.

**Proposed:**

```css
--shadow-sm: 0 1px 3px rgba(10,10,10,.06);
--shadow-md: 0 4px 16px rgba(10,10,10,.08);
--shadow-lg: 0 14px 38px rgba(10,10,10,.14), 0 2px 8px rgba(10,10,10,.06);
```

The `lg` value is the tab bar's current shadow, which is the one that looks
right — worth keeping as the top of the scale.

---

## 4. Colour

**Content surfaces are fine.** Six tokens, used consistently, and the contrast
work has already been done — `--color-grey-3` is `#767676` because that is the
lightest grey clearing AA on white, and grey-2 is used on grey panels for the
same reason. That reasoning is documented and holds.

**Decoration is unmanaged.** Hex values inside the illustrative mockups:

| Component group | Hex occurrences |
|---|---:|
| `.hv-*` (hero cards) | 109 |
| `.sv-*` (service visuals) | 91 |
| `.cro*` (CRO dashboard) | 80 |
| `.velo*` (velocity card) | 45 |
| `.ov-*` (offer visuals) | 41 |
| `.sh-*` (Shopify scene) | 8 |

These are `aria-hidden` illustrations, so this is not an accessibility problem
and it is not visible as inconsistency to a visitor — each mockup is internally
coherent. But there is no palette governing them, so a new mockup has nothing
to inherit from and the brand accent has no defined relationship to the
illustration colours.

**Lower priority than type.** Worth a `--viz-*` palette eventually; not the
thing making the site look cheap.

---

## 5. What is already good

Worth stating, because a system this disciplined in places should not be
rebuilt wholesale.

- **Spacing.** Eight fluid tokens plus `--gutter` and the section rhythm, 77
  uses against 22 bare `clamp()`. The documented rule — never write a bare
  clamp for spacing — is largely honoured.
- **Font weight.** Four values. 600 for headings and labels, 500 for UI, 700
  for emphasis, 400 for body. Genuinely restrained.
- **Buttons.** Five classes covering base, dark, light, small and CTA. One
  coherent shape, one padding rhythm, the pill radius throughout.
- **The pill.** `border-radius: 9999px` across 49 rules. This is the strongest
  single brand signature the site has.

Two small button leaks worth fixing while in there:

```css
.btn-dark:hover { background: #222; }                     /* raw hex */
.btn-light      { border: 1px solid rgba(10,10,10,0.14) } /* not --line */
```

---

## Recommended order

1. **Type scale.** 57 → 8. Biggest visible improvement, and it is what makes
   the tab bar and every dense UI surface read as designed.
2. **Radius scale.** 27 → 5. Cheap, mechanical, immediately tidier.
3. **Shadow scale.** 21 → 3. Establishes a real elevation model.
4. **Button token leaks.** Two lines.
5. **Decoration palette.** `--viz-*`. Do last, or never.

Steps 1–4 are roughly a day including a visual pass over every page, and they
are almost entirely find-and-replace against a decided scale rather than design
work. The design work is choosing the eight numbers, and they are proposed
above.
