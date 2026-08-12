---
version: alpha
name: Arena Player
description: A light blue-and-white booking interface leaning on the logo's own diagonal, punctuated by full-bleed navy bands — the deliberate inverse of the dark-neon local benchmark.
colors:
  navy-900: "#011A43"
  navy-700: "#0A2E6B"
  navy-400: "#4A5A78"
  navy-200: "#9FB2CE"
  blue-700: "#1D4ED8"
  blue-600: "#2563EB"
  blue-400: "#60A5FA"
  blue-100: "#DBEAFE"
  blue-50: "#EFF6FF"
  white: "#FFFFFF"
  grey-50: "#F9FAFB"
  grey-200: "#E5E7EB"
  amber-100: "#FEF3C7"
  amber-300: "#FCD34D"
  amber-800: "#92400E"
  red-100: "#FEE2E2"
  red-300: "#FCA5A5"
  red-800: "#991B1B"
typography:
  display:
    fontFamily: Orbitron
    fontSize: "clamp(3rem, 1rem + 11vw, 9.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  numeral:
    fontFamily: Orbitron
    fontSize: "clamp(3.5rem, 2rem + 8vw, 9rem)"
    fontWeight: 900
    lineHeight: 0.8
  h2:
    fontFamily: Orbitron
    fontSize: "clamp(1.75rem, 1rem + 3.4vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Orbitron
    fontSize: "clamp(1.25rem, 0.99rem + 1.13vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.25
  eyebrow:
    fontFamily: Orbitron
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.22em"
  body:
    fontFamily: Inter
    fontSize: "clamp(1rem, 0.96rem + 0.19vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: 12px
  panel: 22px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
  12: 48px
  16: 64px
  20: 80px
  24: 96px
  32: 128px
  40: 160px
components:
  header:
    backgroundColor: transparent
    textColor: "{colors.navy-900}"
    padding: 18px 16px
    height: 66px
  header-scrolled:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
  header-cta:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: 0 22px
    height: 44px
  header-cta-hover:
    backgroundColor: "{colors.blue-600}"
  section-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    padding: 96px 16px
  section-ground:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.navy-900}"
    padding: 96px 16px
  section-dark:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.blue-50}"
    padding: 96px 16px
  section-numeral:
    backgroundColor: transparent
    textColor: "{colors.grey-200}"
  section-numeral-on-dark:
    backgroundColor: transparent
    textColor: "{colors.navy-700}"
  marquee:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.blue-50}"
    padding: 16px 0
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.panel}"
    padding: 24px
  slot-available:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
    padding: 14px 16px
    height: 64px
  slot-available-hover:
    backgroundColor: "{colors.blue-50}"
  slot-selected:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.white}"
  slot-pending:
    backgroundColor: "{colors.amber-100}"
    textColor: "{colors.amber-800}"
  slot-booked:
    backgroundColor: "{colors.red-100}"
    textColor: "{colors.red-800}"
  slot-elapsed:
    backgroundColor: "{colors.grey-200}"
    textColor: "{colors.navy-400}"
  slot-time:
    backgroundColor: transparent
    textColor: "{colors.navy-900}"
  pill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.full}"
    padding: 10px 16px
    width: 64px
  pill-hover:
    backgroundColor: "{colors.blue-50}"
  pill-selected:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.white}"
  pill-disabled:
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.navy-400}"
  button-primary:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: 0 34px
    height: 56px
  button-primary-hover:
    backgroundColor: "{colors.blue-600}"
  button-primary-active:
    backgroundColor: "{colors.blue-700}"
  button-primary-on-dark:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
    padding: 0 30px
    height: 56px
  button-secondary-hover:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.white}"
  button-disabled:
    backgroundColor: "{colors.grey-200}"
    textColor: "{colors.navy-400}"
  rule-row:
    backgroundColor: transparent
    textColor: "{colors.blue-50}"
    padding: 22px 0
  rule-row-hover:
    backgroundColor: "{colors.navy-700}"
  rule-numeral:
    backgroundColor: transparent
    textColor: "{colors.blue-400}"
    width: 84px
  progress-bar:
    backgroundColor: "{colors.blue-600}"
    height: 3px
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
    padding: 0 12px
    height: 48px
  input-error:
    backgroundColor: "{colors.red-100}"
    textColor: "{colors.red-800}"
  input-disabled:
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.navy-400}"
  input-placeholder:
    textColor: "{colors.navy-400}"
---

# Design System: Arena Player

Machine-readable tokens are the frontmatter above; this prose says how to apply them. Motion, shadow, breakpoint, and border tokens have no home in the DESIGN.md schema and live in [`.impeccable/design.json`](../.impeccable/design.json). How design work is _run_ here — motion approval, image sourcing, asset locations — is [design-process.md](design-process.md).

> **Read this before anything else.** The art direction was **replaced on 2026-08-12**. The direction the client saw and approved on 2026-08-11 was the light-only, instruction-book direction that this file used to describe, and it is now superseded. **A re-approval is owed and has not happened.** Until it does, nothing in this document may be presented as client-approved. See [What changed on 2026-08-12](#what-changed-on-2026-08-12) below, and the dated entry in [PROGRESS.md](PROGRESS.md).
>
> Two artifacts still render the **superseded** direction and are owed a regeneration: [DESIGN.html](DESIGN.html) and the shadow/breakpoint blocks of [`.impeccable/design.json`](../.impeccable/design.json). Neither is authority any more; this file is.

## Overview

**Creative North Star: velocity — the page leans on the logo's own axis.**

The client's mark is an `AP` monogram tilted roughly 20° off vertical. That tilt is not decoration in the logo and it is not decoration here: it is the one geometric fact the brand already owns, and the whole page is built on the axis it implies. Numerals lean. The band under the hero leans. The wipe inside a button travels along the same diagonal, the hero's generative field flows down it, and the section heads sit on it. Nothing on the page is tilted for effect — everything tilted is tilted **the same amount, in the same direction**, which is what turns a skew into an axis instead of a gimmick.

The direction expresses the product, not just the brand: this is a page about a clock running down. Slots elapse. Evenings fill. The visitor is deciding fast, mid-conversation, for eight to twelve people. A page built on forward lean says that before a single word is read.

Two tokens carry it, and every leaning element reads from them rather than restating a number:

| Token    | Value    | What uses it                                                                              |
| -------- | -------- | ----------------------------------------------------------------------------------------- |
| `--skew` | `-8deg`  | Section numerals, rule numerals, the hero eyebrow rule, the button wipe, the marquee band |
| `--diag` | `168deg` | Gradient axis — the hero shader fallback, the map placeholder                             |

`-8deg` rather than the mark's own 20°: at 20° an uppercase Orbitron numeral at 144px overhangs its own column by more than 40px and collides with the heading beside it at every width below 900px. The axis is the mark's _direction_, sampled and reduced until it survives 375px. **A second skew value anywhere in the system is a defect**, not a variation.

**The fusion rule — every colour carries both its world role and its product meaning.** The two never conflict, because where they would, product meaning wins:

| World role                                  | Token       | Product meaning                                                   |
| ------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| The ground the whole page lies on           | `blue-50`   | The light, blue-white world; the answer to the dark benchmark     |
| The plate the product sits on               | `white`     | Cards, panels, the slot grid — where booking actually happens     |
| The band that punctuates                    | `navy-900`  | The brand anchor, sampled from the client's logo                  |
| **The lean, the outline, the thing moving** | `blue-600`  | Interactive: links, focus, available slots, selection             |
| The same, legible on a navy band            | `blue-400`  | Interactive, on dark only — see [On a navy band](#on-a-navy-band) |
| Inventory tags                              | `amber-300` | Pending — "Menunggu Konfirmasi"                                   |

The fourth row is the rule doing real work, and it survived the redesign unchanged. The obvious move for "the thing in motion" is a hot accent — the benchmark uses spring green, and red is the instinct for velocity — but **red already means booked here**, and a colour cannot mean "this is live, take it" and "you cannot have this" on the same grid. It maps to Signal Blue instead. When the world and the product disagree, clarity wins and the world bends.

### The five parts of the direction

**1. The axis.** Everything above. One skew value, one gradient angle, applied to a fixed list of elements. The lean is what makes the page recognisable in a screenshot; it is also the cheapest identity available, because `transform: skewX()` is compositor-only and costs nothing per frame.

**2. Outline as a second weight.** The system's boldest typographic device is **stroked type**: `color: transparent` with a `-webkit-text-stroke` in the accent. It appears in exactly four places — one word of the hero headline (`KIRIM.`), the section numerals, the middle line of the location block, and one word of the closing heading. Outline is how the page says "emphasis" without a second typeface, a second colour, or a highlight box. It costs zero kilobytes and works at 375px.

Outlined type carries a hard implementation rule, because its failure mode is not "looks wrong" but **"is invisible"**. See [The Outline-Needs-A-Floor Rule](#the-outline-needs-a-floor-rule).

**3. Light world, navy punctuation.** The page ground is `blue-50` and the product's own surfaces are white. Navy arrives as **full-bleed bands** that punctuate that world — never as the world itself. Which sections may be navy, and why this does not break the client's anti-reference, is the whole of [The anti-reference, re-read](#the-anti-reference-re-read--what-changed-and-what-did-not).

**4. Type scale — fluid, and much larger at the top.** A `clamp()` scale with no breakpoint jumps anywhere. The display size roughly doubled in the redesign: 48px at 375px growing to 152px at 1440px, at `0.95` leading and `-0.03em` tracking, uppercase. The `3rem` floor is a measurement, not a taste: `PILIH JAM.` at Orbitron 900 and 48px occupies about 324px, and the content box at 375px is 343px. **That is the binding number in the whole type system** — it is why the hero headline's longest word is five characters, and why a copy change there is a layout change.

`sm` and `xs` remain **fixed** and do not scale, because shrinking a caption below 14px on a phone is an accessibility failure and growing it on desktop stops it reading as secondary.

**5. Spacing rhythm — 4px base, one fluid section rhythm.** Components use 4/8/12/16/24 for interior padding. Section rhythm is now a **single fluid value**, `clamp(96px, 12vw, 160px)`, used by every section on the page, with the head-to-body gap at `clamp(48px, 6vw, 80px)`. Both ends of both clamps are numbers from the spacing scale. **A section gap that is not that clamp is a mistake, not a judgement call** — the previous fixed 48/64/96/128 rule is replaced, because a stepped rhythm under a fluid type scale means the whitespace-to-type ratio changes at every width.

### What the direction forbids

- **No second skew value, and nothing tilts that is not on the list.** The list is in the axis table above. A tilted card, a tilted photo, a tilted button is a different design.
- **No section may be composed the same way as its neighbour.** The light/navy alternation gives the rhythm; the composition still has to give the variety. Five sections improvising five visual ideas is the failure this direction exists to prevent, but so is five sections that are one idea five times.
- **No third typeface.** Orbitron and Inter only.
- **Nothing else becomes fully round.** The date pill is the only `9999px` shape and its roundness is what signals "this row scrolls".
- **No decorative colour.** Every hue outside the neutrals carries a meaning from the fusion table above.
- **No glow.** Navy bands take no bloom, no neon rim, no saturated halo. That is the specific thing the client ruled out by name, and it is what a dark band tempts a designer into.

### The anti-reference, re-read — what changed and what did not

[PRODUCT.md](PRODUCT.md) records the client's own words as a brand commitment: `bataskotapoint.com` is binding **as an anti-reference** — "the direction is explicitly its inverse — light, clean, blue-and-white, **never dark neon**."

**This document used to state that as "light and blue-white, never dark". That was a paraphrase, it was stricter than what the client said, and the new direction contradicts it.** So it is rewritten here rather than left to argue with the code.

**What the client ruled out is a dark-neon _world_.** The benchmark is near-black end to end, lit by a spring-green glow and a night photograph used as a light source, with saturated accents floating on top. Every one of those properties is still forbidden. What is not forbidden — and what the client never said — is that the brand's own navy may never be a surface.

**Five conditions make a navy band a punctuation mark instead of a dark world.** All five bind; a band that misses one is the thing the client ruled out:

1. **The ground stays light.** `blue-50` is the page. `<body>` is never navy, and a navy band is always a bounded section with a light section before or after it.
2. **Light sections outnumber navy ones, and the two the visitor came for are always light.** The hero and the order section are never navy. Navy is for reading (Ketentuan) and for the closing call to action — surfaces where nothing is being chosen.
3. **The band's text is the page ground itself.** `blue-50` on `navy-900`, **15.69:1**. That is what makes a band read as the page inverted rather than as a different site.
4. **No glow, no neon, no saturated hue.** The only accent permitted inside a navy band is the Signal Blue family, and only in the on-dark tint — see below.
5. **The navy is the logo's navy.** `#011A43` is sampled from the client's mark. The benchmark's ground is a neutral near-black chosen to make green glow; this one is a brand colour used at full strength.

**Why the change is worth having at all**, since the safe move was to leave the page light throughout: the previous direction had one composition device (a grey numeral and a keyline) doing the entire job of telling a visitor where they were, and a graded review of its first build named the failure precisely — _"one compositional idea repeated eight times."_ Banding is the cheapest possible fix. It costs zero kilobytes, needs no motion, is legible at 375px, and it makes the ten-rule Ketentuan — the densest reading on the page — a deliberate destination instead of the longest scroll.

**The falsifiable version, so this is checkable rather than arguable:** take a full-page screenshot at 375px. If more than half its height is navy, if the hero or the order section is navy, if any navy pixel is adjacent to a saturated non-blue hue, or if any element inside a navy band has a `box-shadow` with a colour other than a navy or blue tint — the direction has drifted back toward the anti-reference and the band is wrong.

### The benchmark, read — what "inverted" and "surpass" mean concretely

Read once from `docs/references/benchmark-bataskotapoint.png`, a full-page desktop capture at 1920×7888. **The source file is gitignored and gets deleted; this section is the only thing that survives it**, so it is written to be specific enough to design against without the image.

**What the benchmark does.** Near-black ground with a spring-green accent. The hero is a night photograph of a floodlit field used as the light source, with a wireframe geodesic polyhedron floating top-right and a wide-tracked uppercase two-tone headline. Then six more sections, then a booking section, then a map and a footer.

| Trait              | Benchmark                                                           | Arena Player                                                                    |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Ground             | Near-black, glow, photo-as-light-source                             | Light `blue-50`/white ground; navy arrives as bounded bands, never as the world |
| Accent             | Spring green, saturated, decorative                                 | Navy inherited from the logo; `blue-600` earns its use by meaning "interactive" |
| Heading treatment  | Six sections, six **identical** centred uppercase two-tone headings | Leaning outlined numeral beside the heading, plus light/navy alternation        |
| Order section      | Buried ~5 scrolls down, after hero, video, specs and gallery        | Within 1–2 scrolls at 375px. **A hard rule, and this is its evidence**          |
| Prices             | Shown in the order summary rail                                     | Rendered nowhere on `/`, ever                                                   |
| Third-party embeds | A raw YouTube player, chrome and all, mid-page                      | None; an undesigned rectangle inside a designed page is a defect                |
| Design target      | Desktop-first at 1920                                               | 375px-first, mid-range Android in an in-app browser                             |

**Two things it gets right, kept deliberately rather than inverted:**

1. **Booked slots are red with a lock glyph.** Arena Player arrived at the same red triple independently. Convergence here is a reason to keep it, not to differentiate: this is the local convention the audience already reads, and a booking grid is the wrong place to be original.
2. **The date row is pills, the selected one is filled.** Same conclusion, same reason.

**What "surpass" means, stated as falsifiable claims rather than as ambition:**

- **The product is buried.** Five scrolls of marketing precede the thing the visitor came for. Arena Player's two-scroll rule is not a performance nicety; it is the single largest difference in the visitor's experience.
- **Every section looks like every other section.** Six centred two-tone uppercase headings in a column give the page no sense of progress or place.
- **The rules are three near-identical dark cards** with keywords highlighted inline in green, red and yellow. Dense, low-contrast, and unscannable — and Arena Player's Ketentuan is ten verbatim rules, which is more content in the same trap. The answer here is the [numbered rule row](#ketentuan-rule-row): ten full-width rows, each with its own leaning outlined numeral, on a navy band that makes reading the point of the section.
- **The map is a dead grey rectangle** in the capture, i.e. an unloaded embed shipped as the final state. Location has to survive its own loading state here.

The system's personality comes from a deliberate tension: Orbitron is a wide, geometric, athletic display face, and it sits on rounded geometry and generous white space, leaning eight degrees. That combination is what keeps a booking utility from reading as a generic form, without a single decorative flourish being added.

Density is low by intent. The primary visitor is a team captain on a 375px Android inside the Instagram in-app browser, mid-conversation in another chat, deciding fast for eight to twelve people. Speed of comprehension outranks completeness of information everywhere the two conflict.

### Where the eyebrow lives — the ban narrowed, it did not go

The previous rule was **"don't put a kicker or eyebrow above a heading"**, stated without qualification. The new hero has one, so the rule is narrowed rather than deleted, and the narrowing is a rule in its own right:

> **The One-Eyebrow Rule.** The page carries **exactly one** eyebrow, in the hero, above the display headline. Nowhere else — and specifically never above an `h2`.

**Why the hero earns the exception.** The eyebrow reads `Mini Soccer · WITA · 06.00–24.00`. Every token in it is a fact the headline cannot carry and does not repeat: what the venue is, which clock the times on this page are in, and when it is open. `Pilih Jam. Kirim. Main.` is an instruction; the eyebrow is the operating envelope. A visitor who arrives from a pasted chat link and reads nothing else has still learned the three things they would otherwise have to ask for. That is information, not a label announcing the heading beneath it.

**Why the ban still holds for section headings, which is what it was written against.** The banned pattern is a small uppercase line that _names the same thing the heading already names_ — `LAYER 1` over "Layer 1", `OUR RULES` over "Ketentuan Arena". It adds a row of visual noise, an extra stop for a screen reader, and no fact. That pattern is the single most recognisable tell of generated UI and is still forbidden. Where a small label holds real information, fold it into the heading.

**The tests that keep the exception from spreading**, in order:

1. **Count.** `rg` for the eyebrow class must return one usage. Two makes it a pattern, and a pattern is the thing that was banned.
2. **Content.** It must state facts absent from the headline. If deleting the eyebrow loses no information, delete it.
3. **Position.** It is above the `h1` only. An eyebrow above an `h2` is the banned pattern regardless of what it says.

**The section numeral is not an eyebrow either**, and it never was: it is oversized, outlined, leaning, `aria-hidden`, and sits **beside** the heading on the baseline rather than above it. A small uppercase numeral stacked over a heading would be the banned pattern wearing a number.

### Settled — Inter stays, and here is why

The design detector flagged it and the flag was correct: **Inter is one of a handful of faces that every AI-generated interface converges on**, so it contributes nothing to the personality this system credits to Orbitron. The display face carries the identity alone.

**Kept anyway, deliberately.** Three reasons, in order of weight:

1. It is a **stated client commitment** — [PRODUCT.md](PRODUCT.md) records "Orbitron for display type, Inter for body" as given, not chosen.
2. **"Invisible" is the right brief for body type here.** The reader is a team captain deciding fast for eight to twelve people on a 375px Android. Body type that draws attention to itself is working against the outcome.
3. **Every printed number in this system was computed against Inter's metrics** — the 60–68ch measure, the 14px and 12px fixed sizes, the state-label ratios. Swapping the face invalidates all of them at once, and this document's credibility rests on those numbers being checkable.

**The redesign concept dropped Inter for a system stack, and that is a prototyping artefact, not a direction.** Its `--font-body` is `ui-sans-serif, system-ui, …` because only Orbitron was embedded in the single-file prototype. Inter ships. The identity is carried by Orbitron, by the axis, by the outline, and by the light-with-navy world — **not** by body type.

### Client directive — minimal form, rich behaviour

The client asked for a **minimalist UI, but modern — with many animations, transitions, and micro-interactions.**

Read as a whole rather than as two competing requests: **minimal in form, rich in behaviour.** Few elements, each responding precisely. The restraint is not despite the motion — it is what makes dense motion legible. The same effects on a busy layout read as noise. "Minimalist" here means _few elements and generous whitespace_, and **not** reduced colour: the status triples are an accessibility requirement, not decoration.

**Where the motion lives:**

| Area                                        | Motion                                              |
| ------------------------------------------- | --------------------------------------------------- |
| Hero, content sections, section transitions | Expressive. This is where the directive is spent    |
| **Order section**                           | **Expressive too — opened by the user, 2026-08-11** |

**The order section used to be exempt and no longer is.** The client asked for many animations and did not carve out the section where their product actually happens. Recorded as a decision with a name and a date rather than quietly relaxed, because the old rule was stated emphatically and a future session will otherwise read the two as a contradiction.

**One thing survives, and it is latency rather than taste.** Selection feedback stays immediate: when a slot is tapped, the state change reads at once rather than arriving at the end of a transition. That is a rule about the one moment where animation and feedback are the same event, and where a delay is not decoration but a slower answer to "is 8pm free". Everything around that moment is open.

**The per-section performance gate is unchanged**, and it is the real constraint: LCP under 2.5s and Lighthouse mobile at or above 85, verified as the section merges. On a mid-range Android in an in-app webview the binding cost of motion is CPU per frame, not kilobytes — an effect can pass the KB budget and still fail the gate.

#### The motion inventory the redesign adds

Everything here is `transform` and `opacity` only, and everything routes through `src/lib/motion.ts` — a direct `gsap.to()` in a component is banned, because GSAP has no built-in `prefers-reduced-motion` handling and the wrapper is the only thing that supplies it.

| Moment                      | Effect                                                                                                    | Timing                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Hero on load                | Headline words rise out of their clipped line box with a small counter-rotation, one line at a time       | 900ms, 130ms between lines       |
| Hero on load                | Eyebrow, sub and CTA row fade and rise 24px behind the headline                                           | 800ms, at 100 / 750 / 900ms      |
| Hero, continuous            | The generative field behind the headline; the marquee band scrolling under it                             | See the two budget rules below   |
| Scroll, page-wide           | Reveal on enter — fade with a 48px rise, `cubic-bezier(0.22, 1, 0.36, 1)`, fired once and then unobserved | 700ms                            |
| Scroll, page-wide           | A 3px `blue-600` progress bar scaling on the X axis at the top of the viewport                            | Per frame, `scaleX` only         |
| Section enters the viewport | Heading and body reveal; date pills slide in; **slot cells stagger upward one at a time**                 | ~400ms total, 40ms between cells |
| An available slot is tapped | **Fill lands at 0ms**; a ring expands out from the tap point and fades                                    | 0ms + 300ms decorative           |
| A slot is selected          | The WhatsApp hand-off bar rises 12px into the panel and fades in                                          | 350ms                            |
| `Sudah lewat (N)` is opened | Caret rotates 90°; container height opens; the elapsed rows stagger in                                    | 280ms + 30ms between rows        |
| A rule row is hovered       | Row tints and slides 14px along the axis                                                                  | 250ms, pointer-fine only         |

**The tap effect is split into two layers on purpose**, and it is the one place the latency rule bites. The fill is the _answer_ to "is this slot mine now", so it lands immediately; the expanding ring is decoration and runs after. A single 300ms transition would have made the answer arrive 300ms late, which is a slower reply dressed as polish.

**The Off-Screen-Is-Off Rule.** The hero field and the marquee are the only two continuously-running animations in the system, and they are the only two things on this page that can burn CPU while the visitor is reading something else. Both **must** stop when their section leaves the viewport, via `IntersectionObserver`, and both must stop under `prefers-reduced-motion` and under `navigator.connection.saveData`. The prototype's own loop runs forever; that is the one thing about it that must not be copied. Two uncapped `requestAnimationFrame` loops on a mid-range Android is the most plausible way this page fails a Lighthouse gate it would otherwise pass.

**The One-Marquee Rule.** A scrolling marquee is a strong device and a cheap one to over-use. There is exactly one, at the foot of the hero, and it carries facts (`9 SLOT / HARI`, `06.00 — 24.00`, `WITA`, `BOOKING VIA WHATSAPP`, `TANPA AKUN`, `14 HARI KE DEPAN`) rather than slogans. It is `aria-hidden`, because a screen reader reading an infinite loop of duplicated text is a trap, which means **every fact in it must also appear somewhere reachable** — all six do. It carries no price and no claim the page cannot compute.

### Motion, settled at the 2026-08-11 checkpoint — the vehicles, unchanged by the redesign

The client asked for four things: creative button micro-interactions ("misal scramble effect ketika hover"), a header animation "menggunakan three.js, atau anime.js", scroll-triggered animation, and genuinely designed responsive behaviour. All four are in. **Neither named library is.**

| Asked for                   | Ships as                                                                                      | Why                                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `three.js` header animation | **A hand-written GLSL fragment shader on a fullscreen quad**, or OGL if the shader needs help | three.js is ~150 KB gzip — larger than the entire remaining page budget, and 3.75× the 40 KB lazy-chunk cap the WebGL exception is granted under. A shader is ~3–5 KB with no library; OGL is ~10 KB |
| `anime.js`                  | **GSAP**, already installed and already lazy-loaded                                           | A second animation runtime costs kilobytes for no capability GSAP lacks. [architecture.md](architecture.md) settled this: _"Reach for the shader, not the engine."_                                  |
| Scramble-on-hover buttons   | GSAP, through `src/lib/motion.ts`                                                             | Text scramble is a per-frame character swap; GSAP drives it                                                                                                                                          |
| Scroll-triggered reveals    | GSAP ScrollTrigger, through `src/lib/motion.ts`                                               | Measure the plugin against the budget before it merges                                                                                                                                               |

**The redesign concept's own footer tag claims "produksi memakai three.js + GSAP". It does not, and that line is wrong.** The prototype is a single file with no build step, so it says what would be convenient there; this repo has an arithmetic budget that predates the concept. The hero field ships as the hand-written shader it already is in the prototype — the prototype is the proof it needs no engine, not an argument for one.

### Hero copy — chosen in task 2, unchanged by the redesign

| Slot             | Copy                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Eyebrow          | **Mini Soccer · WITA · 06.00–24.00**                                                                     |
| Headline         | **Pilih Jam. Kirim. Main.** — set uppercase, one line per sentence, `KIRIM.` outlined                    |
| Subheadline      | Jadwal Arena Player tampil langsung. Pilih jam kosong, lanjut lewat WhatsApp.                            |
| Meta description | Cek jadwal lapangan mini soccer Arena Player. Jam kosong hari ini tampil langsung, pesan lewat WhatsApp. |
| Primary CTA      | **Pesan Lapangan →** `#order` (fixed by the PRD, not a copy decision)                                    |
| Secondary CTA    | **Lihat Lokasi** → `#lokasi`                                                                             |

**Why the headline survived a total redesign.** It is three steps in three beats, which is what the page argues a booking is, and it is the shortest of the three drafts. Length is a hard constraint rather than a stylistic one: at Orbitron 900 the longest word is what breaks the layout, and this headline's longest word is five characters. That mattered at 72px and it matters more at 152px.

**`KIRIM.` is the outlined line, not `PILIH JAM.` or `MAIN.`** It is the middle beat, so the outline sits inside the block rather than at an edge where it would read as a heading treatment; it is the only single-word line, so the stroke has one shape to describe rather than two; and it is the step the visitor is being asked to take. Outlining the verb is the closest this page comes to persuasion.

**The eyebrow says WITA, and the timezone is not negotiable.** The redesign concept's eyebrow reads `Asia/Jakarta` and its location block reads `06.00–24.00 WIB`. Both are **pre-migration and wrong**: the field is in Lombok and the entire date layer pins `Asia/Makassar` (WITA, UTC+8), settled 2026-08-11 and recorded in [PRODUCT.md](PRODUCT.md). A page that prints Jakarta time next to a WITA availability grid is off by an hour on the one number the visitor is deciding with. `WITA` is what renders — the human-readable abbreviation, not the IANA identifier, because the reader is a team captain and not a developer.

**What the hero deliberately does not do:** it names no price, promises no availability, and does not say "malam ini" — a hero cannot know what time of day it is being read without client JS, and a page that says "tonight" to someone arriving at 9am is wrong on its face.

**The headline is still `TODO(content)`.** It is drafted in-house and user-approved, unlike the Ketentuan, which is verbatim client content. If the client supplies their own wording it swaps like the WhatsApp number and the bank details.

### The hero surface — the WebGL moment is spent here

**The hero-video gate ran in Phase 1b and failed.** The hero is text, logo, and a generative field; there is no hero video. It failed on the gate's second condition, which was always the binding one: **iOS Low Power Mode and in-app webviews block autoplay outright**, and the in-app browser is not an edge case here, it is the _primary device_. A real share of visitors would only ever see the poster.

Consequences, all of them deliberate:

- The **LCP element is the Orbitron headline plus the logo** — text, which is the cheapest and most reliable LCP there is. The field behind it is `aria-hidden`, non-blocking, and **must never become the LCP element**.
- The **"no autoplaying video" guardrail in [CLAUDE.md](../CLAUDE.md) stays as written, unamended.**
- `/remotion-create` is reserved for **off-site** assets — an Instagram Reel, a social preview — which cost the landing page nothing.

**The one WebGL moment permitted by CLAUDE.md hard rule 6 is spent, and this is it.** A flow-field fragment shader on a fullscreen quad, flowing along `--diag`, mixing between the ground (`blue-50`), the signal (`blue-600`) and the ink (`navy-900`) at low amplitude, and fading out toward the bottom of the hero so the headline never competes with it. It ships under all five conditions in [architecture.md](architecture.md): dynamic import, static fallback, ≤ 40 KB gzip, deletable in one commit, hero only.

**Its fallback is not a blank canvas.** When WebGL2 is unavailable, when the visitor asked for reduced motion, or when `saveData` is set, the canvas takes `linear-gradient(168deg, #EFF6FF 0%, #FFFFFF 45%, #DBEAFE 100%)` — the same three colours on the same axis, held still. That gradient is the reason `blue-100` exists as a token, and it is why the hero looks deliberate rather than broken on the device most likely to hit the fallback.

**Key Characteristics:**

- **Light world, navy punctuation** — a light `blue-50`/white ground with bounded full-bleed navy bands, never a dark world and never a glow
- **Everything leans on one axis**, `-8deg`, sampled from the client's mark and reduced until it survives 375px
- **Outline is the second weight** — stroked type instead of a second face, a second colour, or a highlight box
- Oversized uppercase Orbitron display against Inter body; no third face
- Rounded throughout — 12px controls, 22px panels; exactly one **fully** round shape, and it means something
- Status is a colour _triple_, never a single hue
- Navy-tinted shadows only; black shadows read as dirt on a blue-white page
- Whitespace is the layout device, not a shortage of content
- Minimal in form, rich in behaviour — few elements, each responding precisely

## Colors

Inherited navy and blue over near-white neutrals, with amber and red reserved entirely for booking state. Nothing in the palette is decorative — every hue outside the neutrals carries meaning.

### Primary

- **Arena Navy** (`navy-900`): the brand anchor, sampled from the client's logo. Body text, headings, primary button fills — and, new in the redesign, **the full-bleed band surface**. It is the darkest value in the system and the only one that reads as "the brand".
- **Navy Depth** (`navy-700`): pressed and hover depth on navy surfaces, and the hairline that divides content **inside** a navy band. Never used for text.

### Secondary

- **Signal Blue** (`blue-600`): every interactive affordance on a light surface — links, focus rings, available-slot borders, selected states, the progress bar. **5.17:1** on white.
- **Signal Blue Pressed** (`blue-700`): the active state of a blue affordance.
- **Signal Wash** (`blue-50`): hover fill on white plates, and the page ground. See the trap under [The Semantic Layer](#the-semantic-layer).
- **Signal Tint** (`blue-100`): gradient terminal only — the hero fallback and the map placeholder. It is never a text colour and never a state.

### On a navy band

Two tokens exist solely because a navy surface is a different contrast problem, and skipping them is the most likely way this redesign ships an accessibility failure.

- **Signal Blue On Dark** (`blue-400`): every accent and interactive tint **inside** a navy band — the accent word in a section heading, the rule numerals, any link. **6.72:1** on `navy-900`.
- **Muted Ink Inverse** (`navy-200`): secondary text, captions and metadata inside a navy band. **7.91:1** on `navy-900`.

**Both are on-dark only, and the constraint runs both ways.** `blue-400` on white computes **2.54:1** and must never appear on a light surface. `navy-200` on white is lighter still. A component that renders in both a light and a navy section reads its colour from the semantic layer, never from a primitive — that is precisely what the semantic layer's on-dark rows are for.

**These tokens exist because the redesign concept got this wrong, measurably.** In the prototype the Ketentuan band uses `blue-600` for its accent word and its rule numerals, and `navy-400` for the note beneath the list. On `navy-900` those compute **3.30:1** and **2.46:1**. The first clears AA only as large text and would fail the moment it carried a caption or a thin outline stroke; the second fails outright at any size. The band is where the ten rules a visitor is agreeing to are read, so it is the worst place on the page to be a hundredth of a ratio short.

### Tertiary — status only

Status colours are **triples**, never single hues. Each is a surface, a border, and a text colour chosen together so the label passes AA.

- **Pending Amber** (`amber-100` / `amber-300` / `amber-800`): 6.37:1 for "Menunggu Konfirmasi".
- **Booked Red** (`red-100` / `red-300` / `red-800`): 6.80:1 for "Terisi".

**All four booking states live on white plates only.** No status triple was computed against a navy ground and none may be placed on one. The order section is a light section, permanently, and this is one of the reasons.

### Neutral

- **Page White** (`white`): the plate surface — panels, cards, slot cells. **17.07:1** on `navy-900`.
- **Band Grey** (`grey-50`): disabled fills.
- **Hairline** (`grey-200`): dividers and resting borders on light surfaces, and the stroke colour of a section numeral on a light section.
- **Muted Ink** (`navy-400`): captions and secondary text **on light surfaces**. 6.94:1 on white and 6.38:1 on the blue wash. It replaced a neutral grey, which computed 4.44:1 against `blue-50` and failed AA the moment secondary text sat on a coloured surface.

### The Semantic Layer

The frontmatter carries **primitives only**, because a DESIGN.md token may not reference another token in the same group. The implementation adds a semantic layer between primitives and components, and that layer is the one a re-theme edits:

| Semantic                                        | Primitive                     | Purpose                                                           |
| ----------------------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| `--color-page`                                  | `blue-50`                     | **The page ground.** The light blue everything sits on            |
| `--color-bg`                                    | `white`                       | The plates content sits on — cards, panels, slot cells            |
| `--color-bg-subtle`                             | `grey-50`                     | Disabled fills                                                    |
| `--color-band`                                  | `navy-900`                    | **The full-bleed navy band surface**                              |
| `--color-fg`                                    | `navy-900`                    | Body and heading text on light                                    |
| `--color-fg-muted`                              | `navy-400`                    | Secondary text on light                                           |
| `--color-fg-on-band`                            | `blue-50`                     | Body and heading text on a navy band                              |
| `--color-fg-muted-on-band`                      | `navy-200`                    | Secondary text on a navy band                                     |
| `--color-interactive`                           | `blue-600`                    | Links, focus, available slots — on light                          |
| `--color-interactive-on-band`                   | `blue-400`                    | The same, on a navy band                                          |
| `--color-interactive-pressed`                   | `blue-700`                    | Active state                                                      |
| `--color-border`                                | `grey-200`                    | Hairlines on light                                                |
| `--color-border-on-band`                        | `navy-700`                    | Hairlines inside a navy band                                      |
| `--color-focus`                                 | `blue-600`                    | Focus ring on light                                               |
| `--color-focus-on-band`                         | `blue-400`                    | Focus ring on a navy band                                         |
| `--color-fg-inverse`                            | `white`                       | Text on a filled dark surface                                     |
| `--color-wash`                                  | `blue-50`                     | The hover tint — **the same value as `--color-page`, see below**  |
| `--color-accent-strong`                         | `navy-900`                    | Heaviest actionable surface — primary button, secondary border    |
| `--color-accent-strong-hover`                   | `blue-600`                    | Its hover — the wipe travels along `--skew`                       |
| `--color-gradient-end`                          | `blue-100`                    | Terminal stop of the two gradients in the system                  |
| `--color-disabled-bg`                           | `grey-200`                    | Disabled fill                                                     |
| `--color-warning-surface` / `-line` / `-strong` | `amber-100` / `-300` / `-800` | The pending triple                                                |
| `--color-danger-surface` / `-line` / `-strong`  | `red-100` / `-300` / `-800`   | The booked triple, and the error boundary                         |
| `--color-success-fg`                            | `navy-900`                    | Success carries on weight and copy, never on the interactive blue |

**`--color-wash` and `--color-page` are the same blue, and that is a trap this document set.** A hover that tints to `blue-50` reads as "lifts toward blue" on paper and renders as **exactly the band behind it** when the element sits on the page ground — measured, white to `rgb(239,246,255)` on a body of `rgb(239,246,255)`. In the redesign the slot grid and the date row live inside a **white panel**, so the wash is visible there and the old defect does not recur. The rule remains: **anything hovering directly on the page ground needs a second signal** — a border change, or a shadow.

**The On-Band Rule.** Every colour decision has two answers, and a component that can appear on both surfaces must read both. Six of the semantic rows above exist only for the navy band; without them, every component inside a band reaches for a light-surface primitive and the band ships at 2.46:1. **This is the redesign's single largest new source of defects**, because the failure is invisible in a light-only screenshot.

**The Three-Layer Rule.** Reference flows one direction only: primitive → semantic → component. No component file contains a hex code, and no component reaches past its own layer for a raw value. Re-theming touches the semantic layer and nothing else.

**The Status-Is-Information Rule.** A booking state the user cannot read is a booking state they will get wrong. "Menunggu Konfirmasi" is information, not decoration — so no status may be expressed as a single hue, and no status label may fall below AA.

## Typography

**Display Font:** Orbitron (fallback `system-ui, sans-serif`)
**Body Font:** Inter (fallback `system-ui, sans-serif`)

**Character:** Orbitron is wide, geometric, and athletic — it does the entire job of making a booking utility feel like sport. Inter carries everything that has to be read rather than seen. There is no third face, and adding one would dilute the only strong voice in the system.

### Hierarchy

- **Display** (Orbitron 900, 48→152px fluid, 0.95, `-0.03em`, **uppercase**): the hero headline only. The single largest gesture on the page.
- **Numeral** (Orbitron 900, 56→144px fluid, 0.8, skewed `-8deg`, **outlined**): the section ordinal. `aria-hidden` — it is a compositional device, not content.
- **H2** (Orbitron 800, 28→56px fluid, 1.05, `-0.01em`, **uppercase**): section headings. One word per heading may take the accent colour; the rest is the surface's foreground.
- **H3** (Orbitron 500, 20→32px fluid, 1.25): sub-headings. **No longer the slot time** — see the slot cell.
- **Eyebrow** (Orbitron 600, 12px fixed, 1, `0.22em`, uppercase): the hero eyebrow, and nothing else. See [The One-Eyebrow Rule](#where-the-eyebrow-lives--the-ban-narrowed-it-did-not-go).
- **Body** (Inter 400, 16→18px fluid, 1.6): all prose. Cap measure at 60–68ch.
- **Sm** (Inter 400, 14px fixed, 1.5): state labels, helper text, field labels.
- **Xs** (Inter 400, 12px fixed, 1.5): captions and metadata.

**The Fluid-Not-Stepped Rule.** There are no breakpoint jumps anywhere in the type system — restrained where space is scarce, oversized where there is room for it. One exception exists, below, and it is 39 pixels wide.

**The Sub-360 Floor.** Below `360px`, and only there, `h2` is pinned to **24px**. Everything at 360px and above is the clamp above, untouched.

The reason is geometry, not taste. At 320px the section content box is 288px; the [numeral track](#the-numbered-step-rule) takes 97.9px and the gutter 16px, leaving the heading column **174px**. Two headings do not fit that at 28px — "KETENTUAN" measures 198px and "PESAN LAPANGAN" 182px — and "KETENTUAN" is a single word, so wrapping cannot absorb it. The page scrolled sideways by 8px.

**A lower `clamp()` floor cannot deliver this**, which is worth writing down because it is the obvious fix and it fails silently. At 320px the clamp's _middle_ term is what governs: drop the floor to 1.5rem and `1rem + 3.4vw` still computes 26.88px there. Steepening the middle term to reach 24px at 320px drags every width from 375px to 738px off the approved scale. The floor is the only part of the curve that moves without moving 375px, and a floor only binds where the viewport is narrow enough to reach it — hence a media query rather than a second scale. The frontmatter keeps the one canonical clamp.

This is a floor under a device class the scale was never measured against, not a stepped scale returning by the back door. If a second exception is ever proposed, the honest conclusion is that the numeral track — not the type — is the thing that needs to change.

**The Fixed-Small Rule.** `sm`, `xs` and `eyebrow` deliberately do not scale. Shrinking a caption below 12px on mobile is an accessibility failure, and growing it on desktop makes it stop reading as secondary. The eyebrow is fixed for a further reason: at `0.22em` tracking a fluid size would change the eyebrow's own line length at every viewport, and it has to hold on one line at 375px.

**The Tight-Display Rule.** Orbitron takes tighter leading than Inter or it reads as loose: 0.95 for display, 1.05 for section headings, 1.25 for sub-headings, 1.6 for body. Never apply body leading to Orbitron. The display value went _below_ 1 in the redesign because at 152px an uppercase Orbitron line has no descenders to clear and 1.1 leaves a visible gutter between the three headline lines that reads as three separate headings.

**The Uppercase-Is-Display-Only Rule.** `display`, `numeral`, `h2` and `eyebrow` are uppercase. Body, `sm` and `xs` never are. Uppercase Indonesian body text is measurably slower to read and the Ketentuan is the longest reading on the page.

### The Outline-Needs-A-Floor Rule

Outlined type is `color: transparent` plus `-webkit-text-stroke`. **Its failure mode is invisibility, not ugliness**, and it fails in three ways that a screenshot will never show:

1. **No stroke support.** The word renders transparent on transparent and disappears. Apply the transparency **only inside `@supports (-webkit-text-stroke: 1px currentColor)`**; the fallback is the same word filled solid in the accent colour.
2. **Forced colours.** Under `@media (forced-colors: active)` the transparency must be dropped and the word filled with `CanvasText`. Windows High Contrast Mode does not honour a text stroke.
3. **Thin strokes at small sizes.** The stroke is 2px on the hero headline and the closing heading, 1.5px on the section numerals and the location block, 1px on the rule numerals — and **no outlined text is ever smaller than 24px**. Below that the stroke eats the counters and the glyph stops being a letter.

**Outlined text is still text**, so it stays in the DOM as text and inherits the heading's semantics. Nothing outlined is ever an image, and nothing outlined is ever the only place a word appears.

**Loading is not a style choice.** Both faces load through `next/font/google`, self-hosted with zero layout shift — never a CDN `<link>` in production. [architecture.md](architecture.md) records `next/font` as load-bearing for the no-CLS and LCP guarantees, which makes it non-swappable rather than a preference.

## Layout

Mobile-first at 375px, scaling to a **1280px** content maximum. The primary device is a mid-range Android inside the Instagram in-app browser; that is the design target, not a fallback.

The container widened from 1100px because the redesign's two-column sections — the order section and the location section — put a panel beside a column of copy, and at 1100px the panel is narrow enough that the slot grid drops to two columns on a desktop where three fit comfortably.

Spacing runs a **4px base**. Components use 4/8/12/16/24 for interior padding.

**The Fluid-Rhythm Rule.** Section vertical padding is `clamp(96px, 12vw, 160px)` and horizontal padding is `clamp(16px, 4vw, 48px)` — **the same two values on every section on the page**, light or navy. The head-to-body gap is `clamp(48px, 6vw, 80px)`. This replaces the previous fixed 48/64/96/128 section rhythm, because a stepped rhythm sitting under a fluid type scale changes the whitespace-to-type ratio at every width, and at 152px display type that shows.

**The Band Rule.** A navy band is **full-bleed** — edge to edge, no radius, no margin, no inset card. A navy section that is a rounded rectangle floating on the page ground is a large dark card, which is a different and much worse idea: it reads as an ad unit. The band's own inner content still respects the container maximum.

**The Numbered-Step Rule.** Every landing section carries an ordinal — `01`, `02`, `03` — set in the `numeral` role, outlined, leaning `-8deg`, sitting **on the baseline beside the heading**, not above it and not bleeding off the page edge. Its stroke is `grey-200` on light sections and `navy-700` on navy ones, so it reads as embossed structure rather than as a second heading; both are deliberately below text contrast because the numeral is `aria-hidden` decoration, and a numeral that competes with its own heading has inverted the hierarchy. The heading beside it is what carries meaning.

This replaces the previous treatment — a filled `grey-200` numeral bleeding off the left edge with a navy keyline between steps. The keyline is gone: the light/navy alternation now separates sections, and a hairline plus a band is two devices doing one job.

**The Two-Scroll Rule.** The order section must be reachable within one to two scrolls at 375px. The hero is capped at `100svh` — `svh`, not `vh`, because in-app browsers report `vh` incorrectly and a hero sized in `vh` overshoots exactly on the primary device. **The redesign puts pressure on this rule and it does not bend**: a 48px display headline, an eyebrow, a sub, two stacked CTAs and a marquee band all have to fit inside one `svh` at 375px, and if they do not, the marquee is what gets cut. A hero that pushes the order section below two scrolls has failed regardless of how it looks.

**The Horizontal-Containment Rule.** The date row scrolls horizontally with `overscroll-behavior-x: contain`, so a sideways swipe never bounces the page underneath it. The same applies to the marquee, and the page itself carries `overflow-x: hidden` — with a skewed band and a display size that can exceed the viewport, a horizontal scrollbar is one bad measurement away.

Layout is answerable to a hard budget, not to taste: LCP under 2.5s, Lighthouse mobile Performance at or above 85, verified per section as it merges. The numbers live in [architecture.md](architecture.md) and are never restated elsewhere.

## Elevation & Depth

**Near-flat on light, flat on navy.** Depth comes from tonal layering — white plates on the `blue-50` ground, navy bands between them — not from shadows. Shadows exist to lift the two surfaces that genuinely float.

### Shadow Vocabulary

- **shadow-sm** (`0 1px 2px rgb(1 26 67 / 0.06)`): resting cards.
- **shadow-md** (`0 4px 12px rgb(1 26 67 / 0.08)`): raised or hovered surfaces.
- **shadow-lg** (`0 24px 70px -30px rgb(1 26 67 / 0.25)`): **the order panel only.** New in the redesign.
- **glow-interactive** (`0 10px 30px -12px rgb(37 99 235 / 0.4)`): **hovered available slot cells only.**

**Why a third shadow, when the previous system said two was the whole vocabulary.** The order panel is now a single object holding the entire product — date row, slot grid, hand-off bar — sitting on the light ground beside a column of copy. `shadow-md` is edge definition; it does not read as an object at 660px wide. `shadow-lg` is a wide, very soft, heavily negative-spread navy shadow, which is depth rather than a border. It is used **once per page** and adding a second usage is a defect.

**Why a blue shadow, when the Tinted-Shadow Rule says navy.** `glow-interactive` is the second signal on an available cell's hover, and it is the accent colour because it is the _same event_ as the blue border it sits under, not a lighting effect. The Tinted-Shadow Rule is written against **neutral black**, which reads as dirt on a blue-white page; a Signal Blue shadow under a Signal Blue border is the palette behaving consistently. It never appears on a disabled cell.

**The Tinted-Shadow Rule.** Shadows are navy- or Signal-Blue-tinted, never neutral black.

**The No-Shadow-On-Band Rule.** Nothing inside a navy band takes a shadow. A shadow on a dark surface is either invisible or a glow, and glow is the anti-reference. Depth inside a band comes from `navy-700` hairlines and from the row hover tint.

Borders are 1px hairlines at rest and 2px only to signal focus or error — weight change carries the state, so no state depends on colour alone. Slot cells are the exception at 1.5px, because their border is a state signal at rest.

## Shapes

**Rounded, with one shape reserved.** Interactive surfaces take a **12px** radius (`rounded.control`); cards and panels take **22px** (`rounded.panel`).

**These moved with the redesign, in the direction the client already asked for.** At the 2026-08-11 checkpoint the client asked for noticeably rounder geometry across inputs, buttons and layout, and the system went from 2px/4px to 10px/14px. The redesign takes them to 12px/22px. The panel radius moved further than the control radius on purpose: the order panel is now a large floating object rather than a card in a stack, and 14px on a 660px-wide surface reads as a rectangle with the corners filed off rather than as a rounded panel.

The exception is the **date pill**, the only fully round shape in the system (`9999px`). Its roundness is functional signalling, not decoration: a row of pills reads as horizontally scrollable without needing an arrow, a gradient fade, or a hint label.

**The One-Round-Shape Rule.** Nothing else in the system is **fully** round. The moment a second element takes the pill radius, the date row stops meaning "this scrolls" and becomes just another style. The gap between 22px and `9999px` is what still carries the signal — and it is wider now than it was, which is the point of how the rounding was applied.

**No third radius.** The redesign concept uses 8px for its legend chips, its hand-off button and its map note. That is a prototype convenience; those take `rounded.control` here. Three radii plus a pill is a system nobody can hold in their head, and a `12px` button beside an `8px` button reads as a mistake rather than as a hierarchy.

## Components

### Header

**Sticky, transparent at rest, materialises on scroll.** Logo left, one CTA right, nothing else — no nav links, because the page has four sections and a menu for four anchors is furniture.

- **At rest:** transparent background, no border, 18px vertical padding.
- **Scrolled past 40px:** `white` at 82% with a 14px backdrop blur, and a 1px `grey-200` bottom edge. Transitions over 300ms.
- **CTA:** "PESAN LAPANGAN" — `navy-900` fill, white text, `rounded.control`, hovering to `blue-600` with a 2px lift.

**The header CTA is 44px tall minimum, and this is a correction to the concept.** The prototype's header pill computes to roughly 37px tall, which is below the tap minimum on the primary device — a phone, held one-handed, at the top of the screen. 44px is the floor; the pill grows to meet it rather than the text shrinking.

**The blur is progressive enhancement, not a requirement.** The `white`-at-82% fill has to be legible on its own, because `backdrop-filter` is unavailable or disabled on a real share of in-app webviews and the header sits over a moving generative field. If the blur does not land, the header must still separate from the hero.

### Progress bar

A 3px `blue-600` bar fixed to the top of the viewport, `transform: scaleX()` from a `0 0` origin, `pointer-events: none`, `aria-hidden`. It is the one piece of pure page chrome in the system and it earns its place on a page with a 5000px scroll: it tells a visitor how much Ketentuan is left. It animates `transform` only — a `width` animation here would be a layout property changing every frame, which is banned.

### Hero

Full `100svh`, with the generative field behind and the marquee band across the foot. In stacking order: canvas (`aria-hidden`), the client mark at 7% opacity with a slow scroll parallax, the content column, the marquee.

- **Eyebrow**: `eyebrow` role in `blue-600`, preceded by a 34px × 2px `blue-600` rule skewed on the axis.
- **Headline**: three lines, each in its own clipped line box so the entrance can translate the word out of it.
- **Sub**: `body` in `navy-400`, capped at 46ch.
- **Actions**: primary and secondary side by side, wrapping to stacked below roughly 420px.

**The mark is decoration and is `aria-hidden`.** It is the same logo file the header uses, at 7% opacity — it must never be the only place the brand appears, and it must never move under `prefers-reduced-motion`.

### Marquee

Full-width `navy-900` band skewed `-1.2deg` and pulled up over the hero's lower edge, `blue-50` text in Orbitron 700 at `0.18em` tracking, with `blue-600` `///` separators. `aria-hidden`, translated on the X axis only, halted off-screen and under reduced motion.

**The `-1.2deg` is not a second axis value.** It is the same lean read at band scale: a full-width band skewed `-8deg` would drop its corner more than 100px below the fold at 1280px. The band's _edge_ leans; the _content on it_ does not, so the type stays horizontal and legible.

### Section head

The `numeral` and the `h2` on one baseline, `align-items: baseline`, with a `clamp(16px, 3vw, 40px)` gap. One word of the heading may take the accent — `blue-600` on light, `blue-400` on a navy band. Section headings on the page:

| #   | Heading                              | Surface | Anchor       |
| --- | ------------------------------------ | ------- | ------------ |
| 01  | Jadwal **Hari Ini**, Bukan Janji     | White   | `#order`     |
| 02  | Ketentuan **Arena**                  | Navy    | `#ketentuan` |
| 03  | Datang & **Main**                    | Ground  | `#lokasi`    |
| —   | Lapangan **Menunggu.** Jam Berjalan. | Navy    | closing      |

The closing heading carries no numeral: it is a call to action, not a step, and numbering it would imply a fourth thing to read.

**`#order`, deliberately not `#booking`.** The anchor must never shadow the `/booking` route.

### Order section

Two columns above 980px — copy and legend left, the panel right, at `0.9fr 1.1fr`. One column below, **panel first**, because the two-scroll rule is about reaching the grid and not about reaching the paragraph that introduces it.

**The panel** is white, `rounded.panel`, 1px `grey-200`, `shadow-lg`, holding the date row, the slot grid and the hand-off bar.

**The legend** is three rows — Tersedia, Menunggu konfirmasi, Terisi — each a 40×22px chip at `rounded.control` in the state's surface and border, with an `sm` label. It carries the three **live** states only; `elapsed` is explained by its own collapsed group's label and adding a fourth row would imply elapsed slots are something a visitor might act on.

**The hand-off bar** appears inside the panel when a slot is selected: `navy-900` fill, white text, `rounded.control`, showing the selected slot on the left and "Lanjut ke WhatsApp →" on the right. It is the moment the page's whole purpose becomes a single button, and it is the only navy surface inside a light section.

- It rises 12px and fades in over 350ms. **The selection fill it follows still lands at 0ms** — see the latency rule.
- It is `aria-live="polite"`, so a screen-reader user learns the hand-off exists without having to find it.
- When it is not shown it is `pointer-events: none` and its link is not focusable, so a keyboard user never tabs into an invisible control.

### Slot Cell

**One column on a phone. Two from 640px. Three from 1180px.** The single-column rule was never about taste, and the grid does not overturn it — it applies it where the measurement actually binds.

"Menunggu Konfirmasi" is 20 characters and needs **133px**.

> **The 146px this section carried until 2026-08-12 was measured against the pre-redesign 14px state label; the redesign sets it at 13px, and re-measuring with Orbitron actually loaded gives 133px.** Both breakpoint justifications below were computed from the stale figure. They still hold — 133px is _smaller_, so every column that cleared 146px clears this too — but the number a future decision is built on is now the measured one. Re-measure rather than reuse if the label size moves again.
> A 3-column grid at 375px gives roughly 110px per cell and the label cannot fit at all; 2-column forces truncation. So **below 640px the grid stays one full-width column.**

**The breakpoints moved down from 768px because the grid no longer measures the viewport.** It measures the panel, which is `1.1fr` of a 1280px two-column layout above 980px and full width below it. At a 640px viewport the panel is the content width, roughly 570px, so two columns give about 280px each and the 20-character label fits with room to spare. Three columns wait until 1180px, where the panel is wide enough that each cell still clears 133px.

The state label sits **under** the time inside every cell at every width — the redesign made the stacked layout universal rather than a desktop variant, because it is what keeps all 20 characters at any column count and it puts the Orbitron time on its own line where it reads as the thing being chosen.

- **Layout:** time above, state below, 14px/16px padding, 64px minimum height, `rounded.control`, 1.5px border.
- **Time:** Orbitron 700 at 16px, `0.02em`. It is no longer the `h3` role — an `h3` inside a grid of nine is nine sub-headings, and the time is a label on a control.
- **State:** Inter at 13px.
- **Available:** white fill, 1.5px `blue-600` border, navy text, label "Tersedia", `cursor: pointer`.
- **Hover:** fills `blue-50` **and takes `glow-interactive`**. Available cells only, and pointer-fine only.
- **Selected:** `blue-600` fill and border, white text, state label **full white**, label "Dipilih".

  This line read "state label at 85% white" until 2026-08-12, and that was a contrast failure, not a style. White at 85% over `blue-600` composites to `rgb(222,232,252)` and computes **4.19:1** against the fill — under the 4.5:1 AA bar, and the state label is 13px, so the large-text exemption does not apply. Full white computes 5.17:1. The label separates from the time by size and face, never by transparency; DESIGN.html had already caught and corrected this once, on the date pill's day label, and recorded it there while this line still said 85%.

- **Pending:** the amber triple, label "Menunggu Konfirmasi", `aria-disabled="true"`, `not-allowed`.
- **Booked:** the red triple, label "Terisi", `aria-disabled="true"`, `not-allowed`.
- **Elapsed:** `grey-200` fill with a matching `grey-200` border — the only borderless-reading cell in the system — `navy-400` text, label "Sudah lewat", `aria-disabled="true"`, `not-allowed`.

**The Never-Native-Disabled Rule.** A disabled control uses `aria-disabled="true"`, never the native `disabled` attribute. Native `disabled` removes the control from the tab order entirely, so a keyboard user tabbing through the `/booking` form reaches the last field and then nothing — no submit button, no explanation, no way to discover why. `aria-disabled` keeps it focusable and announced, and the press is refused in code instead of by the browser. This applies to the slot cell, the date pill **and** the submit button.

### The free-run affordance — the one place the design serves the business goal

[PRODUCT.md](PRODUCT.md) names this as the clearest gap between the goal and the build: the client measures this product by **whether dead hours get booked**, and the grid was neutral about that. 07.00 and 20.00 rendered identically even though one is nearly always free and the other is contested.

**The signal is a consecutive free run**, derived from the nine statuses already returned per date. No new endpoint, no price, no claim that cannot be computed.

- **`Bisa main {n} jam berturut-turut`**, `xs` in `--color-interactive`, on its own line inside the cell.
- **Minimum three consecutive available slots (6 hours).** Two is ordinary — most days have several — so badging runs of two would mark half the grid and the signal would read as decoration.
- **One badge per date, on the run's first slot only.** The longest run; an earlier run wins a tie, because it leaves the evening open behind it. Three badges for one fact would be three claims.
- **`pending`, `booked` and `elapsed` all break a run.** Computed from `partitionSlots`' `live` array, never the raw response — a morning that has already passed is not six bookable hours.

**Why this is an affordance and not a nudge.** It never says "take this dead hour" — that is the client's interest, not the visitor's, and a booking grid is the wrong place to push. It answers a question the organiser genuinely has: _can we play longer?_ The two interests happen to align on quiet hours, and that alignment is what makes it honest. It also names **no price**.

**It survives the redesign untouched, and the concept simply does not model it.** The prototype's slot cell has two lines; the real one has three when the badge is present, which is why the cell has a minimum height rather than a fixed one.

**The Visible-Unavailable Rule.** Disabled cells stay visible and legibly labelled. An organiser needs to see that 18.00 is taken, not wonder why the list skips it. Hiding an unavailable slot is never the answer.

**Elapsed slots are not booked slots.** `GET /api/availability` returns `booked` for today's elapsed slots, but the client already knows the current time and the canonical starts in `src/domain/slots.ts`, so it derives "elapsed" itself. The contract needs no `past` status and stays **FIRM**. The chosen treatment — a collapsed `Sudah lewat (N)` group rather than nine rows labelled "Terisi" — is in the order-section brief at [`.impeccable/surfaces/app-page-tsx.md`](../.impeccable/surfaces/app-page-tsx.md).

**The collapse survives the redesign, and the concept does not model it.** The prototype renders elapsed cells inline in the grid. That is not a direction change — it is a demo with no clock. With same-day booking confirmed as the primary journey, a page opened at 19.00 that renders the whole day as unavailable reads as sold out, and for a product measured on filling empty hours that is the worst outcome the design can produce.

**The separation is by colour _family_, not by accent.** Elapsed and booked are both unavailable, but only one of them is somebody else's booking and the visitor is entitled to see which. The **neutral** family (`grey-200` / `navy-400`) against the **danger** family (`red-100` / `red-300` / `red-800`), plus the label itself — "Sudah lewat" against "Terisi" — which is what satisfies WCAG 1.4.1, since colour is never the only means. `navy-400` on `grey-200` computes **5.61:1**.

**No left accent rule, and this is the second time.** A draft added a 3px `navy-400` left border and argued it was structural rather than chromatic. It is also the single most recognisable tell of AI-generated UI, and **this project already added one and removed it once for exactly this reason**. The fix for a weak state is a heavier fill, not an accent tab.

### Date Pill

- **Shape:** fully round, 64px minimum width, 10px vertical / 16px horizontal padding, day name above date.
- **Default:** white fill, `grey-200` border, `navy-400` day name, `navy-900` date.
- **Hover:** `blue-50` fill, `blue-600` border, 2px lift.
- **Selected:** `blue-600` fill and border, white date; the day name drops to 80% white so the date stays dominant.
- **Disabled:** `grey-50` fill, muted text.

The row scrolls horizontally with its scrollbar hidden and `overscroll-behavior-x: contain`. **The scrollbar is hidden, not absent** — the pill shape is what says "this scrolls", which is the whole justification for it being the one fully round thing in the system.

### Ketentuan rule row

Ten full-width rows on the navy band, divided by 1px `navy-700` hairlines above and below each, in an `84px 1fr` grid.

- **Numeral:** `01`–`10`, Orbitron 900 at 24px, outlined at 1px in `blue-400`, skewed on the axis. 24px is the floor the outline rule sets, and this is the one place the system sits exactly on it.
- **Text:** `blue-50`, `body`, capped at 72ch. **Verbatim from [PRD.md](PRD.md) — never reworded, never tidied, never re-capitalised.** `check:docs` compares it character for character.
- **Hover:** the row tints toward `navy-700` and slides 14px along the axis over 250ms. Pointer-fine only; a touch device gets no hover state.

**The row treatment is the answer to the benchmark's worst section.** Three dense dark cards with inline colour highlights become ten scannable rows with an ordinal each, on a surface that makes reading the point. The `navy-700` hairlines compute **1.31:1** against the band and that is correct — they are structure, not state. **Any boundary on a navy band that carries a _state_ must clear 3:1**, which is why no interactive control lives inside this section.

### Location section

Stacked uppercase display lines with the **middle** line outlined at 1.5px in `navy-400`, a metadata list, and the map placeholder beside them above 980px.

**The map placeholder is a designed state, not an empty box.** `rounded.panel`, 4:3, a `--diag` gradient from `blue-50` through white to `blue-100`, a 44px `grey-200` grid at 50% opacity, and a `blue-600` pin. It carries its own note explaining that coordinates are pending. This exists because the benchmark shipped a dead grey rectangle as its final state, and because the address and coordinates are `TODO(content)` — the section has to look finished while the content is missing.

The metadata list is `Alamat`, `Jam operasional` and `WhatsApp`. **Operating hours read `06.00–24.00 WITA`** — the concept's `WIB` is the pre-migration zone and is wrong. Two of the three lines are `TODO(content)`.

### Closing CTA

Navy band, centred, no numeral. The heading is display-scale with `Menunggu.` outlined at 2px in `blue-50`, and one primary button beneath it in `blue-600` — the on-dark primary fill, because a `navy-900` button on a `navy-900` band is invisible. Its hover wipe inverts to white with `navy-900` text.

This is the only centred composition on the page, which is what makes it read as an ending rather than as a sixth section.

### Buttons

- **Shape:** `rounded.control`, 56px tall, comfortably above the 44px tap minimum.
- **Primary:** `navy-900` fill, white text, 34px horizontal padding, uppercase Orbitron 800 at 15px with `0.06em`.
- **Primary hover:** a `blue-600` wipe travels in **along the axis** — `translateX(-101%) skewX(var(--skew))` to `translateX(0)` over 350ms — and the button lifts 3px.

  > **This line said `skewX(-12deg)` until 2026-08-12 and contradicted the axis rule four hundred lines above it**, which states there is exactly one skew value in the system and that a second is a defect rather than a variation. `-12deg` was a transcription from the prototype, not a decision. The token is the value; nothing may hard-code an angle beside it. The arrow glyph advances 5px. The wipe is a pseudo-element under the label, so the text never moves relative to its own box.

- **Primary active:** `blue-700`.
- **Primary on a navy band:** `blue-600` fill, white text (**5.17:1**), wiping to white with `navy-900` text.
- **Secondary:** transparent fill, 2px `navy-900` border, navy text. Hover fills `navy-900` and inverts the text.
- **Disabled:** `grey-200` fill, muted text, no border, `not-allowed`, `aria-disabled`.

**The wipe is the axis made interactive**, and it is the only place a `skewX` is animated rather than static. It runs on `transform` alone, on a compositor layer, and it collapses to a plain colour change under `prefers-reduced-motion`.

### Inputs / Fields

- **Style:** 48px tall, `rounded.control`, 1px `grey-200` border, 12px padding, white fill.
- **Focus:** 3px `blue-600` outline at 3px offset. Never `outline: none` without a replacement.
- **Error:** 2px `red-800` border **and** `red-100` field fill, with `red-800` message text tied to the field via `aria-describedby`.
- **Disabled:** `grey-50` fill, muted text.
- **Placeholder:** `navy-400` at `opacity: 1`.

**The focus ring went from 2px/2px to 3px/3px with the redesign**, matching the page-wide `:focus-visible`. At 22px panel radii and 12px controls a 2px ring at 2px offset gets visually absorbed by the corner; 3px clears it. The ring is the same on every focusable thing on the page — one ring, one offset, everywhere — with `blue-400` substituted inside a navy band.

**The Placeholder-Is-A-Token Rule.** Without a placeholder rule every field inherits the user agent's default — around **2.35:1** on white, which fails AA for text and is the most common accessibility defect in a booking form. `navy-400` computes **6.94:1** on white while staying visibly lighter than the `navy-900` body text. `opacity: 1` is explicit because several browsers apply their own alpha on top of the colour.

**Placeholders never replace labels.** Every field keeps its visible `<label>`; the placeholder is a format hint (`08123456789`) and nothing else.

**The Focus-Is-Required Rule.** Focus rings are restyled, never removed. Keyboard operability is a Definition-of-Done item, not a styling preference.

**The Visible-Boundary Rule.** When a border is a state's only visual signal, it must clear **3:1** — WCAG 1.4.11 for non-text UI boundaries. An earlier draft used `red-300` on a white field, which computes to **1.90:1** and fails. `red-800` computes to **8.31:1** on white, and the `red-100` fill adds a second, non-border signal.

### Cards / Containers

`rounded.panel`, 1px `grey-200` border, white fill, 24px internal padding, `shadow-sm` at rest.

**Callouts are tonal, not tabbed.** A callout card drops its shadow and fills `grey-50` instead. It does **not** take a thick coloured left border — that side-tab treatment is one of the most recognisable tells of generated UI.

## What changed on 2026-08-12

The direction was replaced wholesale. This section exists so a later session can tell what is new, what merely survived, and what is still owed.

**Replaced:**

| Was                                                           | Is now                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| North star: the build-instruction book, every step numbered   | North star: velocity, the page leans on the logo's own axis             |
| Light throughout, banded with `grey-50`                       | Light ground, white plates, full-bleed `navy-900` bands                 |
| Filled grey numeral bleeding off the left edge + navy keyline | Outlined leaning numeral on the baseline beside the heading; no keyline |
| Display 32→72px at 1.1, sentence case                         | Display 48→152px at 0.95, uppercase, one word outlined                  |
| No eyebrow anywhere                                           | Exactly one eyebrow, hero only, above the `h1`                          |
| Fixed section rhythm 48/64/96/128                             | One fluid rhythm, `clamp(96px, 12vw, 160px)`, every section             |
| `rounded.control` 10px, `rounded.panel` 14px                  | 12px and 22px                                                           |
| Container 1100px                                              | 1280px                                                                  |
| Two shadows                                                   | Three plus one interactive glow; none inside a navy band                |
| Slot columns at 768px / 1024px                                | 640px / 1180px, measured against the panel rather than the viewport     |
| Focus ring 2px at 2px offset                                  | 3px at 3px offset                                                       |

**Survived unchanged, because it is behaviour and constraint rather than look:** the four slot states including `elapsed` and its collapsed group; the `aria-pressed` / `aria-disabled` patterns and the never-native-disabled rule; the status triples and every contrast floor; the free-run affordance; the two-scroll rule; the no-price rule; the verbatim Ketentuan; the performance budget; the motion-through-`src/lib/motion.ts` rule; the hero-video gate's failure; Orbitron and Inter; and every colour primitive that already existed.

**Where the concept contradicted product truth, and what ships instead:**

| Concept says                                            | Ships as                                                  | Why                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hero eyebrow `Asia/Jakarta`; location `06.00–24.00 WIB` | `WITA` in both                                            | The field is in Lombok; the date layer pins `Asia/Makassar`               |
| Marquee item `ASIA/JAKARTA`                             | `WITA`                                                    | Same                                                                      |
| "produksi memakai three.js + GSAP"                      | Hand-written GLSL shader + GSAP                           | three.js is ~150 KB gzip against a 40 KB lazy-chunk cap                   |
| `blue-600` accent and `navy-400` note on the navy band  | `blue-400` and `navy-200`                                 | 3.30:1 and 2.46:1 measured; the new tokens are 6.72:1 and 7.91:1          |
| Header CTA ~37px tall                                   | 44px minimum                                              | Tap target floor on the primary device                                    |
| Body type on a system sans stack                        | Inter                                                     | Client commitment recorded in PRODUCT.md; the prototype embedded one face |
| Elapsed cells rendered inline in the grid               | The collapsed `Sudah lewat (N)` group                     | The prototype has no clock; a 19.00 arrival must not read as sold out     |
| Hero field loop runs forever                            | Halted off-screen, under reduced motion, under `saveData` | Two uncapped rAF loops is the likeliest way the Lighthouse gate fails     |
| 8px radius on chips, hand-off button and map note       | `rounded.control`                                         | No third radius                                                           |
| No free-run badge; legend has three rows and no elapsed | Badge ships; legend stays three rows                      | The badge is the one place design serves the client's own metric          |

**Still owed, and not done in this pass:**

- **Client re-approval.** The client approved the light-only direction on 2026-08-11. They have not seen this one.
- **[DESIGN.html](DESIGN.html)** still renders the superseded direction.
- **[`.impeccable/design.json`](../.impeccable/design.json)** still carries the old `shadows` array (two entries), `breakpoints` (`container-max: 1100px`, `tablet: 720px`) and `typographyMeta` (no `numeral`, no `eyebrow`). Its `semanticLayer.map` is missing every on-band row.
- **Code.** Nothing under `src/` was touched. `/` and `/booking` still implement the superseded direction, and this document is deliberately ahead of them.

## Do's and Don'ts

### Do:

- **Do** keep every reference flowing primitive → semantic → component. A hex code in a component file is a defect.
- **Do** read the on-band semantic rows for anything that can render inside a navy band. That is where this redesign will ship its first accessibility failure.
- **Do** express every booking status as a surface + border + text triple that passes AA at the stated ratio.
- **Do** route every animation through `src/lib/motion.ts`. GSAP has no built-in `prefers-reduced-motion` handling, so a direct `gsap.to()` in a component is banned.
- **Do** animate `transform` and `opacity` only, and reserve space before animating in. No CLS.
- **Do** stop the hero field and the marquee when they leave the viewport.
- **Do** guard every outlined word with an `@supports` fallback and a `forced-colors` fallback.
- **Do** keep the hero LCP element as text or logo, never an image and never the canvas.
- **Do** tint shadows navy, or Signal Blue when the shadow is the same event as a Signal Blue border.
- **Do** let the date pill be the only fully round shape in the system.

### Don't:

- **Don't** make the page dark, neon, glowing, or saturated. The anti-reference is binding. Navy **bands** are permitted under the five conditions above; a navy **world** is the thing the client ruled out by name.
- **Don't** put a shadow, a glow, or a saturated non-blue hue inside a navy band.
- **Don't** make the hero or the order section navy.
- **Don't** use a light-surface primitive on a navy band — `blue-600` computes 3.30:1 there and `navy-400` computes 2.46:1.
- **Don't** introduce a second skew value, or tilt anything that is not on the axis list.
- **Don't** set outlined text below 24px, or ship `color: transparent` without both fallbacks. The failure mode is an invisible word, not an ugly one.
- **Don't** render a price on `/`. That half of the rule is permanent. `/booking` is the exception the client settled on 2026-08-11 — a real rupiah amount appears there, once the visitor has arrived through the WhatsApp link.
- **Don't** invent a placeholder price on `/booking` either. The rate card has not been supplied, so the figure is `TODO(content)`. Every other placeholder in this project is inert if it ships by accident; a price is the one a visitor would act on.
- **Don't** print `Asia/Jakarta`, `WIB`, or any Jakarta-derived time anywhere. The field runs on WITA.
- **Don't** reword, retitle, re-capitalise or shorten the Ketentuan. Ten rules, verbatim, and `check:docs` compares them character for character.
- **Don't** turn the slot grid into 2 or 3 columns **below 640px**, and don't truncate the state label to make columns fit at any width. The 20-character label is the information the cell exists to carry.
- **Don't** hide unavailable slots.
- **Don't** add a third typeface, a third radius, a second marquee, or a second eyebrow.
- **Don't** put a kicker or eyebrow above an `h2`, ever. The one exception is the hero, above the `h1`, and it is exhausted.
- **Don't** load fonts from a CDN `<link>` in production — `next/font` is load-bearing for the no-CLS guarantee.
- **Don't** use black shadows, or add a shadow where a hairline and a band already separate two surfaces.
- **Don't** add a second animation runtime beside GSAP, a Lottie file over 100KB, or an autoplaying video. The hero-video gate ran in Phase 1b and **failed** — the "unless it passes" clause is spent, so this one is now absolute. The one WebGL exception is spent too, on the hero field.
- **Don't** animate layout properties (`width`, `height`, `top`, `left`).
- **Don't** let a component token point at a primitive. It must route through the semantic tier, including for state colour — that is the half that gets skipped.
- **Don't** use a neutral grey for secondary text on a coloured surface. Tint the mute from the surface's own hue.
- **Don't** compose a section the same way as the one before it. The alternation carries the rhythm; composition has to carry the variety.
- **Don't** invent art direction here. It was replaced on 2026-08-12 and is written in the Overview — execute it, don't reopen it. A section that needs a new visual idea has found a gap in the direction, which is a question for the user, not a licence.
- **Don't** present anything in this document as client-approved until the re-approval named at the top of this file has actually happened.
