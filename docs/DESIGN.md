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
    fontFamily: Panchang
    fontSize: "clamp(3rem, 1rem + 11vw, 9.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  heroHeadline:
    fontFamily: Panchang
    fontSize: "clamp(29px, 8.9vw, 60px)"
    fontSizeFrom640: "clamp(60px, 9.7vw, 128px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  numeral:
    fontFamily: Panchang
    fontSize: "clamp(2.5rem, 1.4rem + 5.6vw, 6.25rem)"
    fontWeight: 800
    lineHeight: 0.8
  h2:
    fontFamily: Panchang
    fontSize: "clamp(1.75rem, 1rem + 3.4vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Panchang
    fontSize: "clamp(1.25rem, 0.99rem + 1.13vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.25
  eyebrow:
    fontFamily: Panchang
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.22em"
  ruleNumeral:
    fontFamily: Panchang
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1
  label:
    fontFamily: Panchang
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.06em"
  closing:
    fontFamily: Panchang
    fontSize: "clamp(1.875rem, 9.6vw, 7rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  location:
    fontFamily: Panchang
    fontSize: "clamp(2.25rem, 4.8vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: 0px
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
    textColor: "{colors.blue-50}"
    padding: 18px 16px
    height: 80px
  header-scrolled:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
  header-wordmark:
    backgroundColor: transparent
    textColor: "{colors.blue-50}"
    typography: "{typography.sm}"
  header-cta:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: 0 20px
    height: 44px
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
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.white}"
    padding: 16px 0
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
    padding: 24px
  map-placeholder:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.navy-400}"
    rounded: "{rounded.panel}"
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
  button-secondary-on-dark:
    backgroundColor: transparent
    textColor: "{colors.blue-50}"
    rounded: "{rounded.control}"
    padding: 0 30px
    height: 56px
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

**Owned by the `ui-designer` agent**, who authors this file and every component it describes.

**Rewritten from the built result on 2026-08-13.** Not edited — rewritten, because the previous version had drifted past the point where a value could be trusted without checking it. It named a typeface the build had replaced, a weight the build cannot load, and three type scales that no longer existed. Every number below was read out of `src/app/globals.css`, `src/app/layout.tsx`, or a live browser measurement, and where a figure is quoted the method that produced it is quoted with it.

Machine-readable tokens are the frontmatter above; this prose says how to apply them. Motion, shadow, breakpoint and border tokens have no home in the DESIGN.md schema and live in [`.impeccable/design.json`](../.impeccable/design.json). How design work is _run_ here — motion approval, image sourcing, asset locations — is [design-process.md](design-process.md).

> **Read this before anything else.** The art direction was **replaced on 2026-08-12**. The direction the client saw and approved on 2026-08-11 was the light-only, instruction-book direction that this file used to describe. **A re-approval is owed and has not happened**, and it now covers the typeface as well. Until it does, nothing in this document may be presented as client-approved.
>
> [DESIGN.html](DESIGN.html) still renders the **superseded** direction and carries a banner saying so. It is retained deliberately: it is the record of what the client actually approved, and the re-approval above is still outstanding. It is not authority; this file is.

## Overview

**Creative North Star: velocity — the page leans on the logo's own axis.**

The client's mark is an `AP` monogram tilted roughly 20° off vertical. That tilt is not decoration in the logo and it is not decoration here: it is the one geometric fact the brand already owns, and the page is built on the axis it implies. Numerals lean. The wipe inside a button travels along the same diagonal. The hero's background field is one large plane skewed on it. Nothing is tilted for effect — everything tilted is tilted **the same amount, in the same direction**, which is what turns a skew into an axis instead of a gimmick.

The direction expresses the product, not just the brand: this is a page about a clock running down. Slots elapse. Evenings fill. The visitor is deciding fast, mid-conversation, for eight to twelve people. A page built on forward lean says that before a single word is read.

Two tokens carry it, and every leaning element reads from them rather than restating a number:

| Token    | Value    | What uses it                                                                                         |
| -------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `--skew` | `-8deg`  | Section numerals, rule numerals, the hero eyebrow rule, the button wipe, the hero's background field |
| `--diag` | `168deg` | Gradient axis — the map placeholder                                                                  |

`-8deg` rather than the mark's own 20°: at 20° an uppercase display numeral overhangs its own column by more than 40px and collides with the heading beside it at every width below 900px. The axis is the mark's _direction_, sampled and reduced until it survives 375px. **A second skew value anywhere in the system is a defect**, not a variation.

**The marquee is no longer on the list.** It carried `skewY(-1.2deg)` with a cancelling counter-skew on its track until 2026-08-13, when the user ruled the lean out. Both halves went together; the band is now flat on the plate's bottom edge, which is where a painted stripe on an enamel sign sits anyway.

**The fusion rule — every colour carries both its world role and its product meaning.** The two never conflict, because where they would, product meaning wins:

| World role                                  | Token       | Product meaning                                                   |
| ------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| The ground the whole page lies on           | `blue-50`   | The light, blue-white world; the answer to the dark benchmark     |
| The plate the product sits on               | `white`     | Cards, panels, the slot grid — where booking actually happens     |
| The band that punctuates                    | `navy-900`  | The brand anchor, sampled from the client's logo                  |
| **The lean, the outline, the thing moving** | `blue-600`  | Interactive: links, focus, available slots, selection             |
| The same, legible on a navy band            | `blue-400`  | Interactive, on dark only — see [On a navy band](#on-a-navy-band) |
| Inventory tags                              | `amber-300` | Pending — "Menunggu Konfirmasi"                                   |

The fourth row is the rule doing real work, and it survived both the redesign and the typeface change unchanged. The obvious move for "the thing in motion" is a hot accent — the benchmark uses spring green, and red is the instinct for velocity — but **red already means booked here**, and a colour cannot mean "this is live, take it" and "you cannot have this" on the same grid. It maps to Signal Blue instead. When the world and the product disagree, clarity wins and the world bends.

### The five parts of the direction

**1. The axis.** Everything above. One skew value, one gradient angle, applied to a fixed list of elements. The lean is what makes the page recognisable in a screenshot; it is also the cheapest identity available, because `transform: skewX()` is compositor-only and costs nothing per frame.

**2. Outline as a second weight.** The system's boldest typographic device is **stroked type**: `color: transparent` with a `-webkit-text-stroke` in the accent. It survives in exactly three places — the section numerals, the Ketentuan rule numerals, and the middle line of the location block.

**Outline is a light-ground device, and on navy it is reserved for non-content structure.** That rule was settled on 2026-08-13, when the hero and the closing band both wanted an outlined word. On light, the counters fill with page ground and the letter reads as drawn ink — a stencil on an enamel sign. On navy an outlined word reads as a hollow punched through the sign, and this direction is made of filled fields. So the numerals stay outlined on a band, because they are watermarks and ordinals rather than words anyone reads, and the two words a visitor actually reads — `KIRIM.` in the hero and `MENUNGGU.` in the closing heading — take the **accent colour** instead. The emphasis is identical; the contradiction is gone.

Outlined type carries a hard implementation rule, because its failure mode is not "looks wrong" but **"is invisible"**. See [The Outline-Needs-A-Floor Rule](#the-outline-needs-a-floor-rule).

**3. Light world, navy punctuation.** The page ground is `blue-50` and the product's own surfaces are white. Navy arrives as **full-bleed bands** that punctuate that world — never as the world itself. Which sections may be navy, and why this does not break the client's anti-reference, is the whole of [The anti-reference, re-read](#the-anti-reference-re-read--what-changed-and-what-did-not).

**4. Type scale — fluid, with a floor under the phone widths the face outgrew.** A `clamp()` scale everywhere, plus three stepped `h2` floors below 600px that exist because Panchang is wide enough to break the curve there. See [The Narrow-Width Floors](#the-narrow-width-floors).

**5. Spacing rhythm — 4px base, one fluid section rhythm.** Components use 4/8/12/16/24 for interior padding. Section rhythm is a **single fluid value**, `clamp(96px, 12vw, 160px)`, used by every section on the page, with the head-to-body gap at `clamp(48px, 6vw, 80px)`. **A section gap that is not that clamp is a mistake, not a judgement call** — a stepped rhythm under a fluid type scale changes the whitespace-to-type ratio at every width.

### What the direction forbids

- **No second skew value, and nothing tilts that is not on the list.** A tilted card, a tilted photo, a tilted button is a different design.
- **No section may be composed the same way as its neighbour.** The light/navy alternation gives the rhythm; the composition still has to give the variety.
- **No third typeface.** Panchang and Plus Jakarta Sans only.
- **Nothing else becomes fully round.** The date pill is the only `9999px` shape and its roundness is what signals "this row scrolls".
- **No decorative colour.** Every hue outside the neutrals carries a meaning from the fusion table above.
- **No glow.** Navy bands take no bloom, no neon rim, no saturated halo. That is the specific thing the client ruled out by name, and it is what a dark band tempts a designer into.

### The anti-reference, re-read — what changed and what did not

[PRODUCT.md](PRODUCT.md) records the client's own words as a brand commitment: `bataskotapoint.com` is binding **as an anti-reference** — "the direction is explicitly its inverse — light, clean, blue-and-white, **never dark neon**."

**What the client ruled out is a dark-neon _world_.** The benchmark is near-black end to end, lit by a spring-green glow and a night photograph used as a light source, with saturated accents floating on top. Every one of those properties is still forbidden. What is not forbidden — and what the client never said — is that the brand's own navy may never be a surface.

**Five conditions make a navy band a punctuation mark instead of a dark world.** All five bind; a band that misses one is the thing the client ruled out:

1. **The ground stays light.** `blue-50` is the page. `<body>` is never navy, and a navy band is always a bounded section with a light section before or after it.
2. **Light sections outnumber navy ones, and the two the visitor came for are always light.** The order section is never navy. Navy is for reading (Ketentuan) and for the closing call to action — surfaces where nothing is being chosen. **The hero is the one deliberate exception**, added 2026-08-13: it is a navy plate, because "pelat enamel" is a sign and a sign is a field of colour with type on it. Nothing is chosen on the hero either.
3. **The band's text is the page ground itself.** `blue-50` on `navy-900`, **15.69:1**. That is what makes a band read as the page inverted rather than as a different site.
4. **No glow, no neon, no saturated hue.** The only accent permitted inside a navy band is the Signal Blue family, and only in the on-dark tint.
5. **The navy is the logo's navy.** `#011A43` is sampled from the client's mark. The benchmark's ground is a neutral near-black chosen to make green glow; this one is a brand colour used at full strength.

**The falsifiable version, so this is checkable rather than arguable:** take a full-page screenshot at 375px. If the order section is navy, if any navy pixel is adjacent to a saturated non-blue hue, or if any element inside a navy band has a `box-shadow` with a colour other than a navy or blue tint — the direction has drifted back toward the anti-reference.

### The benchmark, read — what "inverted" and "surpass" mean concretely

Read once from `docs/references/benchmark-bataskotapoint.png`, a full-page desktop capture at 1920×7888. **The source file is gitignored and gets deleted; this section is the only thing that survives it.**

| Trait              | Benchmark                                                           | Arena Player                                                                    |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Ground             | Near-black, glow, photo-as-light-source                             | Light `blue-50`/white ground; navy arrives as bounded plates and bands          |
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

- **The product is buried.** Five scrolls of marketing precede the thing the visitor came for. Arena Player's two-scroll rule is the single largest difference in the visitor's experience.
- **Every section looks like every other section.** Six centred two-tone uppercase headings in a column give the page no sense of progress or place.
- **The rules are three near-identical dark cards** with keywords highlighted inline. Dense, low-contrast, unscannable — and Arena Player's Ketentuan is ten verbatim rules, which is more content in the same trap. The answer is the [numbered rule row](#ketentuan-rule-row).
- **The map is a dead grey rectangle** in the capture — an unloaded embed shipped as the final state. Location has to survive its own loading state here.

Density is low by intent. The primary visitor is a team captain on a 375px Android inside the Instagram in-app browser, mid-conversation in another chat, deciding fast for eight to twelve people. Speed of comprehension outranks completeness of information everywhere the two conflict.

### Where the eyebrow lives — the ban narrowed, it did not go

> **The One-Eyebrow Rule.** The page carries **exactly one** eyebrow, in the hero, above the display headline. Nowhere else — and specifically never above an `h2`.

**Why the hero earns the exception.** The eyebrow reads `Mini Soccer · WITA · 06.00–24.00`. Every token in it is a fact the headline cannot carry and does not repeat: what the venue is, which clock the times on this page are in, and when it is open. `Pilih Jam. Kirim. Main.` is an instruction; the eyebrow is the operating envelope.

**Why the ban still holds for section headings.** The banned pattern is a small uppercase line that _names the same thing the heading already names_ — `OUR RULES` over "Ketentuan Arena". It adds a row of visual noise, an extra stop for a screen reader, and no fact. That pattern is the single most recognisable tell of generated UI.

**The tests that keep the exception from spreading**, in order: **count** (one usage, and two makes it a pattern), **content** (it must state facts absent from the headline), **position** (above the `h1` only).

**The section numeral is not an eyebrow either.** It is oversized, outlined, leaning, `aria-hidden`, and sits **beside** the heading on the baseline rather than above it.

### Client directive — minimal form, rich behaviour

The client asked for a **minimalist UI, but modern — with many animations, transitions, and micro-interactions.** Read as a whole: **minimal in form, rich in behaviour.** Few elements, each responding precisely. The restraint is what makes dense motion legible. "Minimalist" here means _few elements and generous whitespace_, and **not** reduced colour: the status triples are an accessibility requirement, not decoration.

**One thing is a latency rule rather than a taste rule.** Selection feedback stays immediate: when a slot is tapped, the state change reads at once rather than arriving at the end of a transition. That is the one moment where animation and feedback are the same event, and where a delay is a slower answer to "is 8pm free".

Everything animated routes through `src/lib/motion.ts` — a direct `gsap.to()` in a component is banned, because GSAP has no built-in `prefers-reduced-motion` handling and the wrapper is the only thing that supplies it. CSS `@keyframes` are permitted where the reduced-motion block in `globals.css` already neutralises them.

**The page-wide scroll reveal is built, and it is opt-in by attribute.** **Seventeen elements carry it**: the three section heading blocks, the order plate, the ten Ketentuan rows, the location block, and the closing heading and lede. Any element carrying `data-reveal` fades and rises 48px over 700ms when its top reaches 88% of the viewport, **fires once and is then unobserved**. `ScrollReveal.tsx` is a single client island rendering no visible DOM: it reads `[data-reveal]` from the document and drives them through `src/lib/motion.ts`, so every section stays a **server component** and ships no JavaScript for the effect. A section added later opts in by writing one attribute.

**Where the marker goes is a composition decision, not a sweep.** A heading and its lede move as ONE object; revealing them separately reads as two decisions where the composition is one. The section ordinal is excluded — it is `aria-hidden` decoration, and animating a watermark draws the eye to the thing that is not the point. The order plate reveals whole, because the date row, the grid and the hand-off band are a single sign. **The Ketentuan rows are the exception and reveal individually**: ten rows crossing the fold one at a time is the page's longest scroll doing something with the distance, and each row carrying its own trigger makes the cascade a property of scrolling rather than a timed stagger that can run ahead of the reader.

**Nothing starts hidden in the markup.** `gsap.from` sets the start state only after GSAP has loaded, so a failed fetch, a reduced-motion preference or disabled JavaScript all leave a complete, readable page.

**In-page navigation scrolls smoothly**, declared as `scroll-behavior: smooth` on `html` rather than in JavaScript — it covers anchor clicks, `location.hash` changes and `scrollIntoView` alike, and the reduced-motion block already forces it back to `auto`.

**The Off-Screen-Is-Off Rule.** Any continuously-running animation must stop when its section leaves the viewport, via `IntersectionObserver`, and must stop under `prefers-reduced-motion`. **There are two**: the marquee, and the hero's background grid added 2026-08-14. The hero gates its CSS animation on a `data-hero-inview` attribute the observer toggles on the `<section>`, and the attribute **defaults to `"true"` in the markup** — a missing `IntersectionObserver` must cost a little CPU rather than leave a dead background.

**A CSS animation is not exempt from the `motion.ts` rule; it is outside what that rule is for.** The ban on a direct `gsap.to()` exists because GSAP ships no `prefers-reduced-motion` handling, so a tween authored outside the wrapper escapes the guarantee. CSS has that handling natively, and `globals.css` already carries the block. What CSS does _not_ have is a viewport check — hence the observer above, which touches one attribute and drives no animation itself.

**The One-Marquee Rule.** There is exactly one, at the foot of the hero, and it carries facts (`LOMBOK`, `9 SLOT / HARI`, `06.00 — 24.00`, `WITA`, `BOOKING VIA WHATSAPP`, `TANPA AKUN`, `14 HARI KE DEPAN`) rather than slogans. It is `aria-hidden`, because a screen reader reading an infinite loop of duplicated text is a trap, which means **every fact in it must also appear somewhere reachable** — all seven do. It carries no price and no claim the page cannot compute.

### Hero copy

| Slot          | Copy                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Eyebrow       | **Mini Soccer · WITA · 06.00–24.00**                                                             |
| Headline      | **Pilih Jam. Kirim. Main.** — uppercase, one line per sentence, `KIRIM.` in the accent           |
| Subheadline   | Jadwal lapangan mini soccer di Lombok, tampil langsung. Pilih jam kosong, lanjut lewat WhatsApp. |
| Primary CTA   | **Pesan Lapangan →** `#order` (fixed by the PRD, not a copy decision)                            |
| Secondary CTA | **Lihat Lokasi** → `#lokasi`                                                                     |

**The region is in the sub-lede because the header now carries the name.** The business name was confirmed by the client on 2026-08-13 and is rendered in the header; before that it existed on this page only as the logo's `alt` text. The sub-lede therefore spends its first clause on the place rather than repeating the brand. **Only "Lombok"** — the field's town is not among the supplied facts.

**`KIRIM.` is the accented line, not `PILIH JAM.` or `MAIN.`** It is the middle beat, so the emphasis sits inside the block rather than at an edge; it is the only single-word line; and it is the step the visitor is being asked to take.

**The eyebrow says WITA, and the timezone is not negotiable.** The field is in Lombok and the entire date layer pins `Asia/Makassar` (WITA, UTC+8). A page that prints Jakarta time next to a WITA availability grid is off by an hour on the one number the visitor is deciding with. `WITA` is what renders — the human-readable abbreviation, not the IANA identifier.

**What the hero deliberately does not do:** it names no price, promises no availability, and does not say "malam ini" — a hero cannot know what time of day it is being read without client JS.

### The WebGL moment is unspent

**`HeroCanvas.tsx` exists and is not imported.** The one WebGL moment CLAUDE.md hard rule 6 permits was spent on a flow-field shader behind the hero and then **removed by the direction, not by the budget**: "pelat enamel" is defined by flat saturated fields and zero gradients, and a generative gradient behind the plate is the one thing the world explicitly refuses. Rendered at 35% over navy it also produced visible rectangular banding — it read as compression artefacts on the sign, not as paint on metal.

The file stays in the repo untouched, so restoring it is an import and a div if a later direction wants it. **The permission is unspent**; nothing else may claim it without saying so here.

**The hero-video gate ran in Phase 1b and failed**, on its second condition: iOS Low Power Mode and in-app webviews block autoplay outright, and the in-app browser is the _primary device_. The "no autoplaying video" guardrail is therefore absolute rather than conditional. The **LCP element is the display headline** — text, which is the cheapest and most reliable LCP there is.

**Key Characteristics:**

- **Light world, navy punctuation** — a light `blue-50`/white ground with bounded full-bleed navy plates, never a dark world and never a glow
- **Everything leans on one axis**, `-8deg`, sampled from the client's mark and reduced until it survives 375px
- **Outline is the second weight**, and it is a light-ground device — on navy it is reserved for structure a visitor does not read
- Oversized uppercase Panchang display against Plus Jakarta Sans body; no third face
- **Square throughout** — 0px controls, 0px surfaces; exactly one **fully** round shape, the date pill, and it means something
- Status is a colour _triple_, never a single hue
- Navy-tinted shadows only; black shadows read as dirt on a blue-white page
- Minimal in form, rich in behaviour — few elements, each responding precisely

## Colors

Inherited navy and blue over near-white neutrals, with amber and red reserved entirely for booking state. Nothing in the palette is decorative — every hue outside the neutrals carries meaning.

### Primary

- **Arena Navy** (`navy-900`): the brand anchor, sampled from the client's logo. Body text, headings, primary button fills, and the full-bleed band surface. The darkest value in the system and the only one that reads as "the brand".
- **Navy Depth** (`navy-700`): pressed and hover depth on navy surfaces, the hairline that divides content **inside** a navy band, and the fill of the hero's background field. Never used for text.

### Secondary

- **Signal Blue** (`blue-600`): every interactive affordance on a light surface — links, focus rings, available-slot borders, selected states, the progress bar, the marquee band. **5.17:1** on white.
- **Signal Blue Pressed** (`blue-700`): the active state of a blue affordance.
- **Signal Wash** (`blue-50`): hover fill on white plates, and the page ground. See the trap under [The Semantic Layer](#the-semantic-layer).
- **Signal Tint** (`blue-100`): gradient terminal only — the map placeholder. Never a text colour and never a state.

### On a navy band

Two tokens exist solely because a navy surface is a different contrast problem, and skipping them is the most likely way this direction ships an accessibility failure.

- **Signal Blue On Dark** (`blue-400`): every accent and interactive tint **inside** a navy band — the accent word in a section heading, the rule numerals, any link. **6.72:1** on `navy-900`.
- **Muted Ink Inverse** (`navy-200`): secondary text, captions and metadata inside a navy band. **7.91:1** on `navy-900`.

**Both are on-dark only, and the constraint runs both ways.** `blue-400` on white computes **2.54:1** and must never appear on a light surface. A component that renders in both a light and a navy section reads its colour from the semantic layer, never from a primitive.

**These tokens exist because the redesign concept got this wrong, measurably.** In the prototype the Ketentuan band uses `blue-600` for its accent word and `navy-400` for the note beneath the list. On `navy-900` those compute **3.30:1** and **2.46:1**. The band is where the ten rules a visitor is agreeing to are read, so it is the worst place on the page to be a hundredth of a ratio short.

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
| `--color-border-on-band`                        | `navy-700`                    | Hairlines inside a navy band, and the hero's background field     |
| `--color-focus`                                 | `blue-600`                    | Focus ring on light                                               |
| `--color-focus-on-band`                         | `blue-400`                    | Focus ring on a navy band                                         |
| `--color-fg-inverse`                            | `white`                       | Text on a filled dark surface                                     |
| `--color-wash`                                  | `blue-50`                     | The hover tint — **the same value as `--color-page`, see below**  |
| `--color-accent-strong`                         | `navy-900`                    | Heaviest actionable surface — primary button, secondary border    |
| `--color-accent-strong-hover`                   | `blue-600`                    | Its hover — the wipe travels along `--skew`                       |
| `--color-gradient-end`                          | `blue-100`                    | Terminal stop of the map placeholder's gradient                   |
| `--color-disabled-bg`                           | `grey-200`                    | Disabled fill                                                     |
| `--color-warning-surface` / `-line` / `-strong` | `amber-100` / `-300` / `-800` | The pending triple                                                |
| `--color-danger-surface` / `-line` / `-strong`  | `red-100` / `-300` / `-800`   | The booked triple, and the error boundary                         |
| `--color-success-fg`                            | `navy-900`                    | Success carries on weight and copy, never on the interactive blue |

**`--color-wash` and `--color-page` are the same blue, and that is a trap this document set.** A hover that tints to `blue-50` reads as "lifts toward blue" on paper and renders as **exactly the band behind it** when the element sits on the page ground. In the current build the slot grid and the date row live inside a **white panel**, so the wash is visible there. The rule remains: **anything hovering directly on the page ground needs a second signal** — a border change, or a shadow.

**The On-Band Rule.** Every colour decision has two answers, and a component that can appear on both surfaces must read both. Six of the semantic rows above exist only for the navy band; without them, every component inside a band reaches for a light-surface primitive and the band ships at 2.46:1. **This is the direction's single largest source of defects**, because the failure is invisible in a light-only screenshot.

**The Three-Layer Rule.** Reference flows one direction only: primitive → semantic → component. No component file contains a hex code, and no component reaches past its own layer for a raw value. Re-theming touches the semantic layer and nothing else.

**The Status-Is-Information Rule.** A booking state the user cannot read is a booking state they will get wrong. "Menunggu Konfirmasi" is information, not decoration — so no status may be expressed as a single hue, and no status label may fall below AA.

## Typography

**Display Font:** Panchang, loaded through `next/font/local` at weights **500, 700 and 800** (fallback `system-ui, sans-serif`)
**Body Font:** Plus Jakarta Sans, loaded through `next/font/google` (fallback `system-ui, sans-serif`)

**Character:** Panchang is wide, geometric and athletic — it does the entire job of making a booking utility feel like sport. Plus Jakarta Sans carries everything that has to be read rather than seen, and it was drawn for Indonesian city branding: its apertures are more open than Inter's, which is the right property for a team captain reading Indonesian at speed on a mid-range Android. There is no third face.

**There is no width axis, and asking for one is a defect.** The `.type-display` utility carried `font-stretch: 125%` under the previous face and it is **gone**. Panchang ships as separate static cuts with no width axis, so a stretch value would ask the browser to synthesise a width — a smeared approximation of a face that is already wide on its own. The utility stays because it is the one place that NAMES the display face; seven call sites reach it through that class, so the next face change is one line rather than a sweep.

**Never ask for a weight the project does not load.** Only 500, 700 and 800 exist. A declaration of 900 does not fail loudly — CSS font matching walks up, finds nothing, walks down, and renders **800** — so the page looks right while every document quoting 900 is wrong. Verified with `[...document.fonts]` rather than `document.fonts.check()`, which returns `true` for a fallback and has produced a false all-clear on this project before.

### Hierarchy

- **Display** (Panchang 800, 48→152px fluid, 0.95, `-0.03em`, **uppercase**): the `h1` element default. **The hero no longer reads it** — see `heroHeadline` below. Retained as the base `h1` size for any future display usage.
- **Hero headline** (Panchang 800, 29→60px on a phone and 60→128px from 640px, 0.9, `-0.03em`, **uppercase**): the hero's three beats, all at one size, on **two curves**. See [The hero headline's two curves](#the-hero-headlines-two-curves-are-derived-not-picked).
- **Numeral** (Panchang 800, 40→100px fluid, 0.8, skewed `-8deg`, **outlined**): the section ordinal. `aria-hidden` — a compositional device, not content. **Resized for Panchang on 2026-08-13**: the clamp was set against faces whose widest two-digit pair measured about 1.55em, and Panchang's is `04` at **2.33em**, so at the old size the ordinal's ink overflowed its own grid track by 13.9px at 375px and 30.2px at 1280px, drawn straight through the heading beside it.
- **H2** (Panchang 800, 28→56px fluid, 1.05, `-0.01em`, **uppercase**): section headings. One word per heading may take the accent colour; the rest is the surface's foreground.
- **H3** (Panchang 500, 20→32px fluid, 1.25): sub-headings. **Not the slot time** — an `h3` inside a grid of nine is nine sub-headings, and the time is a label on a control.
- **Closing** (Panchang 800, 30→112px fluid, 0.95, `-0.03em`, **uppercase**): the closing band's heading, and nothing else. It is the largest of three beats; the other two are derived from this token rather than introducing two more literals.
- **Location** (Panchang 800, 36→56px fluid, 0.95, `-0.02em`, **uppercase**): the location block's three stacked lines, and nothing else. See [Why `location` is its own role](#why-location-is-its-own-role).
- **Rule numeral** (Panchang 800, 24px fixed, 1, outlined at 1px, skewed): the Ketentuan rule rows, and nothing else. Fixed rather than fluid because 24px IS the Outline-Needs-A-Floor Rule's floor — a clamp would dip under it at some viewport.
- **Label** (Panchang 500, 15px fixed, 1, `0.06em`, uppercase): button labels, and nothing else. Four call sites share it. **Dropped from 800 to 500 on 2026-08-13** — the display face is already wide, and at 800 with uppercase and 0.06em tracking three emphases stacked on a 15px label until it read as a filled block rather than as type.
- **Eyebrow** (Panchang 500, 12px fixed, 1, `0.22em`, uppercase): the hero eyebrow, and nothing else.
- **Body** (Plus Jakarta Sans 400, **16px fixed**, 1.6): all prose. Cap measure at 60–68ch. **See the defect note below — this used to be documented as a 16→18px fluid clamp and the build has never rendered one.**
- **Sm** (Plus Jakarta Sans 400, 14px fixed, 1.5): state labels, helper text, field labels.
- **Xs** (Plus Jakarta Sans 400, 12px fixed, 1.5): captions and metadata.

> **Open defect — `--text-body` is undefined.** `globals.css` sets `body { font-size: var(--text-body) }` and **no such token exists**; the string appears exactly once in the whole repo, at that usage site. An invalid `var()` makes the declaration invalid at computed-value time, so `font-size` inherits and the page renders a flat **16px** at every width — confirmed in the browser, `bodyFontSize=16px`, `--text-body=(UNDEFINED)`. This document previously claimed `clamp(1rem, 0.96rem + 0.19vw, 1.125rem)`, so desktop body text has been 2px smaller than specified for as long as the token has been missing, with nothing erroring. **The frontmatter above records what renders, not what was intended.** Defining the token would grow body text site-wide, which is a visual change the user has not seen — so it is recorded here as owed rather than applied inside a documentation sync.

### The hero headline's two curves are derived, not picked

`clamp(29px, 8.9vw, 60px)` on a phone, `clamp(60px, 9.7vw, 128px)` from **640px**. One size for all three beats within each curve.

The hero has now been resized twice. It shipped with three escalating sizes (104/128/152px), went flat at a single `clamp(35px, 10.95vw, 144px)` on 2026-08-13, and split into two curves on **2026-08-14** — chosen by the user from two candidates against the brief "make the hero fonts a bit smaller, and also do on a responsive side (mobile first)". The rejected candidate dropped the single flat clamp uniformly from 88% to 80% fill.

**The sizes are still derived from one measurement.** `Pilih Jam.` sets at **7.231× its font size** in Panchang at this tracking — measured with `Range.getBoundingClientRect` on the live node, consistent to three digits at 375px and 1280px, which is what distinguishes a real per-em constant from one width's coincidence. A target **fill** of the content box therefore resolves to a size at every width:

| Viewport  | Content box | Size  | Longest line's ink | Fill    |
| --------- | ----------- | ----- | ------------------ | ------- |
| 320px     | 288px       | 29px  | 214px              | 74%     |
| 375px     | 343px       | 33px  | 246px              | 72%     |
| 414px     | 381px       | 37px  | 271px              | 71%     |
| 600px     | 552px       | 53px  | 393px              | 71%     |
| **640px** | 589px       | 62px  | 457px              | **78%** |
| 768px     | 707px       | 74px  | 549px              | 78%     |
| 1280px    | 1184px      | 124px | 915px              | 77%     |
| 1440px    | 1184px      | 128px | 943px              | 80%     |

**Why the phone fills less.** Below 640px the headline shares one fold with an eyebrow, a sub-lede and two **stacked** CTAs; above it, the plate is wide and the headline is effectively alone in it. One clamp cannot express that — a single curve has one slope, and the constraint changes **shape** at the breakpoint rather than scaling with the viewport.

**The 128px cap exists because the container stops growing at 1184px** while the viewport does not; an uncapped `vw` term would push the line off the end of a box that is no longer widening.

> **A live-mode trap worth keeping.** Both breakpoint branches were first authored behind a parameter attribute selector, which the browser only stamps once the knob is **moved**. At rest neither matched, the desktop curve never applied, and the headline sat at the phone clamp's 60px cap all the way to 1280px — 60px where it specifies 124px, with no error and no mount failure. **A default belongs in plain CSS; only an override belongs behind an attribute.**

### Why `location` is its own role

The location block's stacked lines had been reaching for `--text-display` since the day they were written, and that token clamps to 152px. The binding string is **"LOMBOK" at 6.8182em**, which asks for 1036.3px of ink; the block's own column is 288px at 320px and — this is the part that made `#lokasi` the worst section on the page — only **304.7px at 980px**, where the two-column composition splits an already-indented row in half. The section overflowed at every width from 320 to 1440 and was **worse at 768 (158px) than at 375 (31px)**, because the content column is handed to the numeral track at exactly the width where the display clamp climbs fastest.

So the ceiling is set by the narrowest column this block ever gets, not by the widest viewport. **Not merged with `closing`**: the two roles are bound by different words in different boxes, and the last time this system let one number stand for two measurements it shipped a heading 46px wider than its box.

### The Narrow-Width Floors

**There are three, not one, and they replace the single "Sub-360 Floor" this document used to name.** The `h2` clamp cannot serve phone widths in Panchang, because "KETENTUAN" is a single unbreakable word that no wrapping can absorb and Panchang sets it at **278.6px** where the previous face set it at 194px.

| Query                                     | Override                                                       |
| ----------------------------------------- | -------------------------------------------------------------- |
| `min-width: 480px` and `max-width: 599px` | `--text-h2: 1.5rem` (24px)                                     |
| `max-width: 479px`                        | `--text-h2: 1.1875rem` (19px)                                  |
| `max-width: 359px`                        | `--text-h2: 1.125rem` (18px), `--text-numeral: 1.75rem` (28px) |

**A step, not a cliff.** The heading column grows with the viewport while the word stays one width, so there is a band of widths where the clamp is too big and the phone floor needlessly small; 480–599px gets its own step rather than jumping from 19px straight to the curve.

**Below 360px the ordinal gives width back as well.** At 320px the container is 288px and the ordinal track and heading share it; holding the numeral at its clamp floor leaves the heading 162.8px for a word that needs 193.8px even at 20px. So both give.

**A lower `clamp()` floor cannot deliver this**, which is worth writing down because it is the obvious fix and it fails silently. At 320px the clamp's _middle_ term governs: dropping the floor changes nothing, and steepening the middle term drags every width between 375px and 738px off the approved scale. The floor is the only part of the curve that moves without moving 375px, and a floor only binds where the viewport is narrow enough to reach it — hence media queries rather than a second scale. **The frontmatter keeps the one canonical clamp.**

**This rule has now been re-derived three times, and the reason is always the same:** the binding number is one specific word in one specific face, and nothing about it survives a typeface change.

**The Fixed-Small Rule.** `sm`, `xs` and `eyebrow` deliberately do not scale. Shrinking a caption below 12px on mobile is an accessibility failure, and growing it on desktop makes it stop reading as secondary. The eyebrow is fixed for a further reason: at `0.22em` tracking a fluid size would change its own line length at every viewport.

> **Open defect — the hero eyebrow wraps to two lines.** This rule used to end "and it has to hold one line at 375px", **which the build has never satisfied.** Measured 2026-08-13: the eyebrow needs **388px** on one line and has **297px** (a 343px content box, less the 34px rule glyph and its 12px gap), so it sets as 228 + 152 at both 375px and 414px. Fixing it means changing the size, the tracking, or the string — a design decision the user has not been asked — so the false claim is retired and the wrap is recorded as owed.

**The Tight-Display Rule.** Panchang takes tighter leading than Plus Jakarta Sans or it reads as loose: 0.95 for display, 1.05 for section headings, 1.25 for sub-headings, 1.6 for body. Never apply body leading to the display face. The display value sits _below_ 1 because at plate scale an uppercase line has no descenders to clear, and 1.1 leaves a gutter between the headline's three lines that reads as three separate headings instead of one three-beat sentence.

**The Uppercase-Is-Display-Only Rule.** `display`, `numeral`, `h2` and `eyebrow` are uppercase. Body, `sm` and `xs` never are. Uppercase Indonesian body text is measurably slower to read and the Ketentuan is the longest reading on the page.

### The Outline-Needs-A-Floor Rule

Outlined type is `color: transparent` plus `-webkit-text-stroke`. **Its failure mode is invisibility, not ugliness**, and it fails in three ways that a screenshot will never show:

1. **No stroke support.** The word renders transparent on transparent and disappears. Apply the transparency **only inside `@supports (-webkit-text-stroke: 1px currentColor)`**; the fallback is the same word filled solid.
2. **Forced colours.** Under `@media (forced-colors: active)` the transparency must be dropped and the word filled with `CanvasText`. Windows High Contrast Mode does not honour a text stroke.
3. **Thin strokes at small sizes.** The stroke is 1.5px on the section numerals and the location block, 1px on the rule numerals — and **no outlined text is ever smaller than 24px**. Below that the stroke eats the counters and the glyph stops being a letter.

**Outlined text is still text**, so it stays in the DOM as text and inherits the heading's semantics. Nothing outlined is ever an image, and nothing outlined is ever the only place a word appears.

**Loading is not a style choice.** Both faces are self-hosted through `next/font` — Panchang via `next/font/local` because it is not on Google Fonts, Plus Jakarta Sans via `next/font/google` — never a CDN `<link>` in production. [architecture.md](architecture.md) records `next/font` as load-bearing for the no-CLS and LCP guarantees, which makes it non-swappable rather than a preference.

## Layout

Mobile-first at 375px, scaling to a **1280px** content maximum. The primary device is a mid-range Android inside the Instagram in-app browser; that is the design target, not a fallback.

Spacing runs a **4px base**. Components use 4/8/12/16/24 for interior padding.

**The Fluid-Rhythm Rule.** Section vertical padding is `clamp(96px, 12vw, 160px)` and horizontal padding is `clamp(16px, 4vw, 48px)` — **the same two values on every section on the page**, light or navy. The head-to-body gap is `clamp(48px, 6vw, 80px)`.

**The Band Rule.** A navy band is **full-bleed** — edge to edge, no radius, no margin, no inset card. A navy section that is a rounded rectangle floating on the page ground is a large dark card, which reads as an ad unit. The band's own inner content still respects the container maximum.

**The Numbered-Step Rule.** Every landing section carries an ordinal — `01`, `02`, `03` — set in the `numeral` role, outlined, leaning `-8deg`, sitting **on the baseline beside the heading**. Its stroke is `grey-200` on light sections and `navy-700` on navy ones, both deliberately below text contrast because the numeral is `aria-hidden` decoration; a numeral that competes with its own heading has inverted the hierarchy.

**The track is `calc(var(--text-numeral) * 2.85)`, and the multiplier is a measurement.** Panchang's widest two-digit pair is `04` at 2.33em, and the remaining 0.52em is the gutter that keeps the ordinal's ink off the heading beside it. A multiplier tuned against a different face is the single most likely thing to break on the next typeface change.

**The Two-Scroll Rule.** The order section must be reachable within one to two scrolls at 375px, and it is the rule the hero is answerable to.

> **The `100svh` cap on the hero is gone.** It read "the hero is capped at `100svh`" until 2026-08-13, when the user removed it as limiting creativity. The plate now takes the height its content needs — `min-h-[calc(100svh-52px)]`, a minimum rather than a maximum. **The Two-Scroll Rule itself is unchanged and still binds**: a hero that pushes the order section below two scrolls has failed regardless of how it looks. What changed is that the hero is no longer forbidden from exceeding one screen; it is forbidden from costing the visitor a third scroll.

`svh`, not `vh` — in-app browsers report `vh` incorrectly and a hero sized in `vh` overshoots exactly on the primary device. The `-52px` is the marquee band's height, so the band lands inside the opening screen rather than one pixel past the fold.

**The Horizontal-Containment Rule.** The date row scrolls horizontally with `overscroll-behavior-x: contain`, so a sideways swipe never bounces the page underneath it. The same applies to the marquee. **Horizontal page overflow is zero at 320/375/414/768/980/1180/1280/1440**, verified by measuring `documentElement.scrollWidth - clientWidth` rather than by looking; every section that clips a bleeding element does so with its own `overflow-hidden`.

**The header is fixed, so every anchor jump owes it its own height.** `html { scroll-padding-top: 80px }` is declared once on the scroll container rather than as a `scroll-mt` on each section — per-section is exactly how three of four anchors end up correct and the fourth does not.

Layout is answerable to a hard budget, not to taste: LCP under 2.5s, Lighthouse mobile Performance at or above 85, verified per section as it merges. The numbers live in [architecture.md](architecture.md) and are never restated elsewhere.

> **Open — the performance gate is not met.** Lighthouse mobile Performance measures a median of **71** against the ≥85 gate. The user deferred performance while the visual direction was being settled; it is recorded here so the gate is not quietly forgotten.

## Elevation & Depth

**Near-flat on light, flat on navy.** Depth comes from tonal layering — white plates on the `blue-50` ground, navy bands between them — not from shadows. Shadows exist to lift the two surfaces that genuinely float.

### Shadow Vocabulary

- **shadow-sm** (`0 1px 2px rgb(1 26 67 / 0.06)`): resting cards.
- **shadow-md** (`0 4px 12px rgb(1 26 67 / 0.08)`): raised or hovered surfaces.
- **shadow-lg** (`0 24px 70px -30px rgb(1 26 67 / 0.25)`): **the order panel only.** A second usage is a defect.
- **glow-interactive** (`0 10px 30px -12px rgb(37 99 235 / 0.4)`): **hovered available slot cells only.**

**Why a third shadow.** The order panel is a single object holding the entire product — date row, slot grid, hand-off bar — sitting on the light ground beside a column of copy. `shadow-md` is edge definition; it does not read as an object at 660px wide. `shadow-lg` is a wide, very soft, heavily negative-spread navy shadow, which is depth rather than a border.

**Why a blue shadow, when the Tinted-Shadow Rule says navy.** `glow-interactive` is the second signal on an available cell's hover, and it is the accent colour because it is the _same event_ as the blue border it sits under, not a lighting effect. The Tinted-Shadow Rule is written against **neutral black**, which reads as dirt on a blue-white page.

**The Tinted-Shadow Rule.** Shadows are navy- or Signal-Blue-tinted, never neutral black.

**The No-Shadow-On-Band Rule.** Nothing inside a navy band takes a shadow. A shadow on a dark surface is either invisible or a glow, and glow is the anti-reference. Depth inside a band comes from `navy-700` hairlines and from the row hover tint.

Borders are 1px hairlines at rest and 2px only to signal focus or error — weight change carries the state, so no state depends on colour alone. Slot cells are the exception at 1.5px, because their border is a state signal at rest.

## Shapes

**Square, with one shape reserved.** Controls and surfaces take a **0px** radius (`rounded.control`). The date pill is the only fully round shape (`9999px`).

**This reversed on 2026-08-13, and an inventory is what settled it.** The client asked for rounder geometry at the 2026-08-11 checkpoint and the system went 2px/4px → 10px/14px → 12px/22px. Then the velocity redesign squared every surface that reads those tokens — slot cells, the order plate, the Ketentuan rows — and left the button behind. Enumerating every computed `border-radius` on the built page found only **four non-zero values**: the button at 12px, the date pill at 9999px, the map placeholder at 22px, and the map pin's teardrop. Two of the four were oversights rather than decisions. `rounded.control` is now `0px`, which reaches its single consumer and answers the same question for Phase 3's form inputs.

**The One-Round-Shape Rule.** Nothing else in the system is **fully** round. Its roundness is functional signalling, not decoration: a row of pills reads as horizontally scrollable without needing an arrow, a gradient fade, or a hint label. The moment a second element takes the pill radius, the date row stops meaning "this scrolls".

> **Open — `rounded.panel` has one consumer left.** The map placeholder keeps 22px while every other plate has lost its radius. It is not fixed here because that placeholder carries the address-and-coordinates content marker and gets rebuilt when the client supplies real coordinates.

**No third radius.** A `12px` button beside an `8px` button reads as a mistake rather than as a hierarchy.

## Components

### Header

**Fixed, not `sticky`, and the distinction is load-bearing.** A `sticky top-0` header occupies flow space before it sticks, so the hero would start below it. The header sits **over** the hero, transparent, and materialises on scroll.

**Logo, business name, one CTA. No nav links** — the page has four sections and a menu for four anchors is furniture.

- **At rest:** transparent, no border, 18px vertical padding, 80px tall. The mark is inverted to white and the wordmark takes `--color-fg-on-band`, because the header sits on the navy hero plate and a navy mark on navy is invisible.
- **Scrolled past 40px:** `white` at 82% with a 14px backdrop blur and a 1px `grey-200` bottom edge, over 300ms. Mark and wordmark return to ink.
- **CTA:** `blue-600` fill on the band, `navy-900` fill once scrolled.

**The business name is rendered, not just in `alt` text.** Confirmed by the client on 2026-08-13. Before that it existed on this page only as the logo's `alt`, so a screen reader heard the business name and a visitor never saw it — and the supplied mark is an `AP` monogram, which identifies nothing to someone who has not been told what it abbreviates. The image is now `aria-hidden` and the text carries the accessible name; with both present a screen reader announced "Arena Player" twice.

**The wordmark is set in the body face, and that is a measurement.** Panchang sets "Arena Player" at 136.1px at 14px and 116.7px at 12px; Plus Jakarta Sans sets it at 82.7px, and at 13px with `0.14em` tracking it measures **117px**. The row's content box at 320px is 288px and must hold a mark, the name and a 44px tap target. Tracking carries the character instead — which is what the client's own lockup does under the mark.

**Below 360px the mark yields to the name.** At 320px the parts want 58 + 10 + 117 + 16 + 117 = 318px in a 288px box. Between a monogram and the words it abbreviates, the words identify the business; hiding the name to keep the mark would fail what the header is for. 320px is the only width where this binds.

**The header CTA is 44px tall minimum**, which is below the component's 56px spec height and deliberate: 44px is the tap floor on the primary device — a phone, held one-handed, at the top of the screen where the thumb reaches worst. The pill grows to meet it rather than the text shrinking. **Its label shortens to "Pesan" below `sm`**, because the full label measured 237px of content inside a 205px box at 320px and was clipped on every phone width; below `sm` the header CTA duplicates the hero's own button one plate down anyway.

**The blur is progressive enhancement, not the mechanism.** `backdrop-filter` is unavailable or disabled on a real share of in-app webviews, so the 82% white fill has to separate the header from the page on its own; only the blur is gated behind `@supports`.

### Progress bar

A 3px `blue-600` bar fixed to the top of the viewport, `transform: scaleX()` from a `0 0` origin, `pointer-events: none`, `aria-hidden`. It earns its place on a page with a long scroll: it tells a visitor how much Ketentuan is left. It animates `transform` only — a `width` animation would be a layout property changing every frame, which is banned.

### Hero

**A navy plate, `min-h-[calc(100svh-52px)]`, with the marquee band flat on its bottom edge.** In stacking order: the ghost numeral, the skewed background field, the content column at `z-10`, the marquee.

- **Watermark:** the client's mark at 118% of the plate's width, anchored left and vertically centred, at **9% opacity** with `brightness(0) invert(1)`, `aria-hidden`. **It replaced the ghost `24` on 2026-08-14**, chosen by the user from two candidates; the rejected one kept the numeral's top-right slot. It carries the page's one parallax — it drifts at `plate.offsetHeight * 0.18`, scrubbed to scroll, the way a second board seen past a fence lags the fence in front of it — so `markRef` moved with it rather than being dropped.

  **The invert is not a tint choice.** The supplied mark is a dark navy lockup drawn for a light ground; on a navy plate it is navy on navy and invisible. Inverting is honest because the mark is a single flat colour, which is the same argument the header makes for the same file.

  > **Open — the mark is a 202KB PNG and the landing page now pays 81KB for it.** Measured in the browser: the `w=1080` candidate decodes to **81KB**. `sizes` is doing its job (the 3840 candidate is never fetched, and the header's own copy pulls 2KB at `w=96`), but a flat two-colour logo rendered 1510px wide is an SVG-shaped problem being solved with a raster. **An SVG of the same mark would be a couple of KB and scale perfectly** — it is an asset the client would need to supply or have traced, and it is the single cheapest performance win available on this page while Lighthouse sits at 71.

- **Background field:** two `navy-700` planes skewed on `--skew`, anchored bottom-right, one large fill at 55% opacity and one 3px accent edge at 34%. Added 2026-08-13, chosen by the user from three candidates. **The fills are translucent for a stacking reason, not a stylistic one** — the layer sits at `z-0` and comes later in the DOM than the ghost numeral, so an opaque fill would paint it out.
- **Background motion (`.hero-pitch`):** the field's own markings — hard flat strokes on a 96px pitch, plus a centre circle as its `::before` — drifting and scaling over 34s and 22s. Added 2026-08-14, chosen by the user from two candidates against a brief asking for "a three.js effect". **The engine is not what shipped, and that is arithmetic**: three.js is ~150KB gzip against the 40KB WebGL cap, 3.75× over. This costs **zero** — no canvas, no library, no `requestAnimationFrame`, two compositor-only transforms — and **the one WebGL permission remains unspent.** Hard strokes rather than a colour ramp, because the direction refuses gradient haze on this plate; that is the same reason the WebGL field was removed a day earlier.
- **Eyebrow:** the `eyebrow` role in `blue-400`, preceded by a 34px × 2px rule.
- **Headline:** three beats at one size, `KIRIM.` in the accent.
- **Sub:** `body` in `--color-fg-muted-on-band`, capped at 42ch.
- **Actions:** primary and secondary side by side, stacking below roughly 420px.

**Nothing tilts, nothing scales, nothing blurs on scroll.** A painted sign has no depth, so the depth here comes from layers of sign rather than from a 3D illusion this world does not have.

### Marquee

Full-width `blue-600` band on the plate's bottom edge, `blue-50` text in the display face with `///` separators. `aria-hidden`, translated on the X axis only, halted off-screen and under reduced motion.

**The band is flat.** It carried `skewY(-1.2deg)` with a cancelling counter-skew on its track until the user ruled the lean out on 2026-08-13. Both halves went together — a counter-skew exists only to undo an outer skew, so removing one and keeping the other leaves the type rotated against a level band.

Seven facts, doubled back to back so translating by exactly one copy's measured width loops seamlessly.

### Section head

The `numeral` and the `h2` on one baseline, `align-items: baseline`. One word of the heading may take the accent — `blue-600` on light, `blue-400` on a navy band.

| #   | Heading                              | Surface | Anchor       |
| --- | ------------------------------------ | ------- | ------------ |
| 01  | Jadwal **Hari Ini**, Bukan Janji     | Ground  | `#order`     |
| 02  | Ketentuan **Arena**                  | Navy    | `#ketentuan` |
| 03  | Datang & **Main**                    | Ground  | `#lokasi`    |
| —   | Lapangan **Menunggu.** Jam Berjalan. | Navy    | closing      |

The closing heading carries no numeral: it is a call to action, not a step, and numbering it would imply a fourth thing to read.

**`#order`, deliberately not `#booking`.** The anchor must never shadow the `/booking` route.

### Order section

Two columns above 980px — copy and legend left, the panel right. One column below, **panel first**, because the two-scroll rule is about reaching the grid and not about reaching the paragraph that introduces it.

**The panel** is white, square, **3px `navy-900`**, `shadow-lg`, holding the date row, the slot grid and the hand-off bar.

> **The edge moved twice.** It was written here as 1px `grey-200`, built as 3px `blue-600` in the redesign, and went **navy on 2026-08-15** on the user's call — at the same time as `/booking`'s plate, so the two surfaces never drift. **`blue-600` means interactive** in this system: links, focus, available slot borders, selected states. A plate edge is structure and nothing about it is clickable, so the accent was spending itself on the one part of the panel a visitor cannot act on. With the edge navy, the **available slot cells are the only blue on the plate** — which is the whole point of having an accent.

**The legend** is three rows — Tersedia, Menunggu konfirmasi, Terisi — each a 40×22px chip in the state's surface and border with an `sm` label. It carries the three **live** states only; `elapsed` is explained by its own collapsed group's label, and a fourth row would imply elapsed slots are something a visitor might act on.

**The hand-off bar** appears inside the panel when a slot is selected: `navy-900` fill, white text, showing the selected slot on the left and "Lanjut ke WhatsApp →" on the right. It is the moment the page's whole purpose becomes a single button, and the only navy surface inside a light section.

- It rises 12px and fades in over 350ms. **The selection fill it follows still lands at 0ms.**
- It is `aria-live="polite"`, so a screen-reader user learns the hand-off exists without having to find it.
- When hidden it is `pointer-events: none` and its link is not focusable, so a keyboard user never tabs into an invisible control.

### Slot Cell

**One column on a phone. Two from 640px. Three from 1180px.**

"Menunggu Konfirmasi" is 20 characters and needs **143.3px**.

> **This figure has moved four times, which is the whole argument for measuring it rather than quoting it.** 146px was an estimate taken before the fonts had loaded. 133px was measured while the label sat at a hard-coded 13px. 145.5px was measured once it went back onto the `sm` step at 14px in Inter. **143.3px** is the current value, in Plus Jakarta Sans at 14px with the font loaded, `getBoundingClientRect` on the live string. Re-measure rather than reuse if either the label size or the body face moves again.

A 3-column grid at 375px gives roughly 110px per cell and the label cannot fit at all; 2-column forces truncation. **Below 640px the grid stays one full-width column.**

**The breakpoints measure the panel, not the viewport.** The panel is roughly 570px at a 640px viewport, so two columns give about 280px each. Three columns wait until 1180px.

The state label sits **under** the time inside every cell at every width — it is what keeps all 20 characters at any column count and it puts the time on its own line where it reads as the thing being chosen.

- **Layout:** time above, state below, **16px/12px padding, 88px minimum height**, square, **2px right and bottom rules**. **The cell also takes `h-full`**, which is not cosmetic: it is not the grid item — `OrderSection` wraps it so GSAP has a stagger target — so Grid stretches the WRAPPER to the tallest cell in the row and the button must be told to follow. Without it, a row containing a free-run badge left the two cells beside it 23px short at 1280px, and since the button draws the rules, they stopped short with it: a vertical rule ending early and a horizontal rule at two heights across one row.

  > **These figures were 14px/16px, 64px and 1.5px in this document until 2026-08-14 and none of the three matched the build.** Measured on the live node: `min-height: 88px`, `padding: 16px 12px`, `border-right/bottom: 2px`. The document now records what renders.

- **Time:** the display face at 700, 16px, `0.02em`, **tabular numerals**. Plus Jakarta Sans ships a `tnum` feature; the previous display face did not, and `tabular-nums` was a measured no-op there for two separate faces before this was caught.
- **State:** the `sm` role. A token, not a literal.
- **Available:** white fill, 1.5px `blue-600` border, navy text, label "Tersedia", `cursor: pointer`.
- **Hover:** fills `blue-50` **and takes `glow-interactive`**. Available cells only, pointer-fine only.
- **Selected:** `blue-600` fill and border, white text, state label **full white**, label "Dipilih". Never at 85% white — that composites to `rgb(222,232,252)` and computes **4.19:1** against the fill, under the AA bar at 14px. Full white computes 5.17:1. The label separates from the time by size and face, never by transparency.
- **Pending:** the amber triple, label "Menunggu Konfirmasi", `aria-disabled="true"`, `not-allowed`.
- **Booked:** the red triple, label "Terisi", `aria-disabled="true"`, `not-allowed`.
- **Elapsed:** `grey-200` fill and border, `navy-400` text, label "Sudah lewat", `aria-disabled="true"`, `not-allowed`. `navy-400` on `grey-200` computes **5.61:1**.

**The Never-Native-Disabled Rule.** A disabled control uses `aria-disabled="true"`, never the native `disabled` attribute. Native `disabled` removes the control from the tab order entirely, so a keyboard user tabbing through the `/booking` form reaches the last field and then nothing — no submit button, no explanation, no way to discover why. `aria-disabled` keeps it focusable and announced, and the press is refused in code instead of by the browser. This applies to the slot cell, the date pill **and** the submit button.

### The free-run affordance — the one place the design serves the business goal

[PRODUCT.md](PRODUCT.md) names this as the clearest gap between the goal and the build: the client measures this product by **whether dead hours get booked**, and the grid was neutral about that.

**The signal is a consecutive free run**, derived from the nine statuses already returned per date. No new endpoint, no price, no claim that cannot be computed.

- **`Bisa main {n} jam berturut-turut`**, `xs` in `--color-interactive`, on its own line inside the cell.
- **Minimum three consecutive available slots (6 hours).** Two is ordinary, so badging runs of two would mark half the grid and the signal would read as decoration.
- **One badge per date, on the run's first slot only.** The longest run; an earlier run wins a tie, because it leaves the evening open behind it.
- **`pending`, `booked` and `elapsed` all break a run.** Computed from `partitionSlots`' `live` array, never the raw response.

**Why this is an affordance and not a nudge.** It never says "take this dead hour" — that is the client's interest, not the visitor's. It answers a question the organiser genuinely has: _can we play longer?_ The two interests happen to align on quiet hours, and that alignment is what makes it honest. It names **no price**.

**The Visible-Unavailable Rule.** Disabled cells stay visible and legibly labelled. An organiser needs to see that 18.00 is taken, not wonder why the list skips it.

**Elapsed slots are not booked slots.** `GET /api/availability` returns `booked` for today's elapsed slots, but the client already knows the current time and the canonical starts in `src/domain/slots.ts`, so it derives "elapsed" itself. The contract needs no `past` status and stays **FIRM**. With same-day booking confirmed as the primary journey, a page opened at 19.00 that renders the whole day as unavailable reads as sold out — the worst outcome for a product measured on filling empty hours.

**The separation is by colour _family_, not by accent.** The **neutral** family against the **danger** family, plus the label itself — "Sudah lewat" against "Terisi" — which is what satisfies WCAG 1.4.1, since colour is never the only means.

**No left accent rule, and this is the second time.** A draft added a 3px `navy-400` left border and argued it was structural rather than chromatic. It is also the single most recognisable tell of AI-generated UI, and **this project already added one and removed it once for exactly this reason**. The fix for a weak state is a heavier fill, not an accent tab.

### Date Pill

- **Shape:** fully round, 64px minimum width, 10px vertical / 16px horizontal padding, day name above date.
- **Default:** white fill, `grey-200` border, `navy-400` day name, `navy-900` date.
- **Hover:** `blue-50` fill, `blue-600` border, 2px lift.
- **Selected:** `blue-600` fill and border, white date; the day name drops to 80% white so the date stays dominant.
- **Disabled:** `grey-50` fill, muted text.

The row scrolls horizontally with its scrollbar hidden and `overscroll-behavior-x: contain`. **The scrollbar is hidden, not absent** — the pill shape is what says "this scrolls".

### Ketentuan rule row

Ten full-width rows on the navy band, divided by 1px `navy-700` hairlines.

- **Numeral:** `01`–`10`, the display face at 24px, outlined at 1px in `blue-400`, skewed on the axis. 24px is the floor the outline rule sets, and this is the one place the system sits exactly on it.
- **Text:** `blue-50`, `body`, capped at 72ch. **Verbatim from [PRD.md](PRD.md) — never reworded, never tidied, never re-capitalised.** `check:docs` compares it character for character.
- **Hover:** the row tints toward `navy-700` and slides 14px along the axis over 250ms. Pointer-fine only.

**The row treatment is the answer to the benchmark's worst section.** The `navy-700` hairlines compute **1.31:1** against the band and that is correct — they are structure, not state. **Any boundary on a navy band that carries a _state_ must clear 3:1**, which is why no interactive control lives inside this section.

### Location section

Three stacked uppercase display lines in the `location` role — `ARENA` / `PLAYER` / `LOMBOK` — with the **middle** line outlined at 1.5px in `navy-400`, a metadata list, and the map placeholder beside them above 980px. Columns are `minmax(0, 1.25fr) minmax(0, 0.75fr)`.

**`minmax(0, …)` rather than a bare `fr`**, deliberately: a bare `1.25fr` expands to `minmax(auto, 1.25fr)` and the auto minimum sits on the track, which is the exact mechanism behind this section's original overflow.

**The copy is confirmed.** DESIGN.md specifies the treatment and not the words, so `ARENA / PLAYER / LOMBOK` was chosen by an agent on 2026-08-12 and carried an in-file flag saying no one had approved it. The client confirmed both the business name and the region on 2026-08-13. **The scale is still bound to "LOMBOK" specifically**, so any future copy change means re-deriving `--text-location` against the new longest word.

**The map placeholder is a designed state, not an empty box.** 4:3, a `--diag` gradient from `blue-50` through white to `blue-100`, a 44px `grey-200` grid at 50% opacity, and a `blue-600` pin. It carries its own note explaining that coordinates are pending. This exists because the benchmark shipped a dead grey rectangle as its final state, and because the address and coordinates are unsupplied — the section has to look finished while the content is missing.

The metadata list is `Alamat`, `Jam operasional` and `WhatsApp`. **Operating hours read `06.00–24.00 WITA`.**

### Closing CTA

Navy band, centred, no numeral. Three beats in the `closing` role with `MENUNGGU.` in the **accent colour**, and one primary button beneath in `blue-600` — the on-dark primary fill, because a `navy-900` button on a `navy-900` band is invisible.

**`MENUNGGU.` used to be outlined and is not any more.** It was the only word a visitor actually reads that was outlined on navy, and the Outline-Is-A-Light-Ground-Device rule retired it there. It now takes the accent, the same treatment `KIRIM.` gets one plate earlier.

**The clamp was re-derived for Panchang and this is the third time the same word has moved it.** The `1rem + 8vw` curve was measured against a face that set "MENUNGGU." at 6.54em; Panchang sets it at **9.0761em**, 1.39× wider. At the old clamp the word measured 417.5px inside a 343px box at 375px and the page scrolled sideways by 21px. The curve is now anchored to the box rather than to a remembered size: the content box is `100vw - 2 × --space-section-x`, the largest beat is "LAPANGAN" at 8.548em, and the tightest point on the whole curve is 320px, where the beat measures 262.6px inside 288px with **25.4px** to spare.

**Measure on the live node, never on a detached probe.** A `<span>` appended to `<body>` reported LOMBOK at 4.43em — 35% narrow — because `--font-display` does not resolve there and it silently fell back to `system-ui`, while `document.fonts.status` read "loaded" the whole time.

This is the only centred composition on the page, which is what makes it read as an ending rather than as a sixth section.

### Buttons

- **Shape:** square, 56px tall, comfortably above the 44px tap minimum. The header CTA is the one 44px exception.
- **Primary:** `navy-900` fill, white text, 34px horizontal padding, the `label` role — uppercase display face, **500**, 15px, `0.06em`.
- **Primary hover:** a `blue-600` wipe travels in **along the axis** — `translateX(-101%) skewX(var(--skew))` to `translateX(0)` over 350ms — and the button lifts 3px. The arrow glyph advances 5px. **The token is the value; nothing may hard-code an angle beside it.**
- **Primary active:** `blue-700`.
- **Primary on a navy band:** `blue-600` fill, white text (**5.17:1**), wiping to white with `navy-900` text.
- **Secondary:** transparent fill, 2px `navy-900` border, navy text. Hover fills `navy-900` and inverts the text.
- **Secondary on a navy band:** transparent fill, 2px `blue-50` border, `blue-50` text (**15.69:1**), inverting the same way. Added 2026-08-13 — `secondary` draws a `navy-900` border and `navy-900` text, which on a navy plate is an invisible button, and the hero is now a navy plate with two CTAs on it.
- **Disabled:** `grey-200` fill, muted text, no border, `not-allowed`, `aria-disabled`.

**Fill is the hierarchy; square is only the shape.** Primary stays filled and secondary stays outlined even though both are square, because the hero carries two CTAs where "Pesan Lapangan" has to win — the product is measured on filling empty slots, not on visual symmetry.

**`whitespace-nowrap` is a correctness rule, not a style preference.** A button whose label wraps to two lines stops reading as a control: the fixed height then either clips the second line or the pill grows and breaks the row it sits in. It also means a too-long label fails **invisibly**, by clipping, which is what happened to the header CTA on every phone width — so a label that does not fit must be shortened, not left to `nowrap` to hide.

**The wipe is the axis made interactive**, and it is the only place a `skewX` is animated rather than static. It runs on `transform` alone, on a compositor layer, and collapses to a plain colour change under `prefers-reduced-motion`.

### /booking — one plate, ruled

**The route joined the direction on 2026-08-14**, chosen by the user from two layout candidates; the rejected one split it into a receipt rail and a form column above 980px. It had never followed the 2026-08-12 redesign, and the gap was measurable rather than a matter of taste: a **1100px** container against the page's 1280px, **14px** section corners and **10px** controls against a system that is 0px, grey hairlines where the landing page draws 2px navy rules, and no display face anywhere.

**Three stacked rounded cards became one plate.** A 3px **`navy-900`** edge (`blue-600` until 2026-08-15 — see the order panel above for why every structural edge gave the accent back), `gap-0`, and the summary, the payment note and the form as panels divided by the plate's own **2px navy rules** — the same object the order panel is, so the two surfaces finally read as one product. Panels draw `border-b` only; the plate draws its outer edge once, so no seam doubles.

**The proof field is a dropzone**, added 2026-08-14. A square target, **dashed at rest and solid `blue-600` over a `blue-50` wash while a file is over it** — a border weight and fill change rather than colour alone, and the same "this is live, take it" vocabulary the slot grid uses. The label switches from _Tarik gambar ke sini_ to _Lepas di sini_. Dashed is the one border on this plate that is not a rule, and that is deliberate: every other edge is a fixed division, so a broken edge is the only one that reads as _something goes in here_.

**It grew to 160px on 2026-08-15**, with a **44px `FiImage` mark above the label**. The label went to `h3` in the same round and **came back to `label` the same day**: the mark is what carries the emphasis, and a 20-32px label made the zone shout twice while putting its type out of step with every other label on the plate. At the 112px it launched with, it was the quietest control on a plate of hard-ruled fields — and the only one that has to explain itself to a visitor who has never used a dropzone. The alternative considered and rejected was to make it a ruled field of the plate with the mark in a filled navy square: better system fit, but it loses the dashed edge, which is the affordance doing the actual explaining. **Icons come from `react-icons`, never generated** — a generated glyph drifts in stroke weight and optical grid the moment a second one joins it. It is the package's only use in the codebase and reaches `/booking` alone, never `/`.

**It is still a real `<input type="file">`.** The input is `sr-only`, never `hidden`: it keeps its place in the tab order, so a keyboard visitor reaches it and opens the picker with Enter exactly as before, and the zone shows that input's focus ring through `has-[:focus-visible]`. A `display: none` input is the usual cost of a hand-rolled dropzone and removes the only accessible way to attach a file — which this form may not do, because keyboard-operable upload is an established requirement. **Both entry points validate through one function**, so a drop cannot smuggle a file past the size and type check that the picker would have refused.

**The notice states carry it too.** `ExpiredNotice` and `UnusableNotice` are the same URL in its other states, and leaving them rounded would have given one route two visual languages depending on whether the slot was still valid.

### Inputs / Fields

- **Style:** 48px tall, square, **2px `navy-900` border**, 12px padding, white fill. On `/booking` a field is a ruled box like a slot cell, not a floating input.

> **A field rendered grey for a day, and nothing in the file said grey.** `INPUT_CLASS` set the navy border; `INPUT_VALID_CLASS` was appended after it through `cn()` and named `--color-border` (`grey-200`), so tailwind-merge kept the last colour and the two text inputs came out lighter than the textarea and dropzone beside them, which do not go through that constant. Fixed 2026-08-15. **Merge order is a value, not a formatting detail** — when two utilities in a `cn()` chain set the same property, the later one silently wins and no tool reports it.

- **Focus:** 3px `blue-600` outline at 3px offset. Never `outline: none` without a replacement.
- **Error:** 2px `red-800` border **and** `red-100` field fill, with `red-800` message text tied to the field via `aria-describedby`.
- **Disabled:** `grey-50` fill, muted text.
- **Placeholder:** `navy-400` at `opacity: 1`.

> **Known divergence:** `:focus-visible` in `globals.css` is still `2px` at `2px` offset. The 3px/3px above is what this document specifies and what the components should adopt; the token layer has not been updated. Recorded rather than silently reconciled in either direction.

**The Placeholder-Is-A-Token Rule.** Without a placeholder rule every field inherits the user agent's default — around **2.35:1** on white, which fails AA for text and is the most common accessibility defect in a booking form. `navy-400` computes **6.94:1** on white while staying visibly lighter than the body text. `opacity: 1` is explicit because several browsers apply their own alpha on top of the colour.

**Placeholders never replace labels.** Every field keeps its visible `<label>`; the placeholder is a format hint (`08123456789`) and nothing else.

**The Focus-Is-Required Rule.** Focus rings are restyled, never removed. Keyboard operability is a Definition-of-Done item, not a styling preference.

**The Visible-Boundary Rule.** When a border is a state's only visual signal, it must clear **3:1** — WCAG 1.4.11 for non-text UI boundaries. An earlier draft used `red-300` on a white field, which computes to **1.90:1** and fails. `red-800` computes to **8.31:1** on white, and the `red-100` fill adds a second, non-border signal.

### Cards / Containers

Square, 1px `grey-200` border, white fill, 24px internal padding, `shadow-sm` at rest.

**Callouts are tonal, not tabbed.** A callout card drops its shadow and fills `grey-50` instead. It does **not** take a thick coloured left border — that side-tab treatment is one of the most recognisable tells of generated UI.

## Do's and Don'ts

### Do:

- **Do** keep every reference flowing primitive → semantic → component. A hex code in a component file is a defect.
- **Do** read the on-band semantic rows for anything that can render inside a navy band. That is where this direction will ship its first accessibility failure.
- **Do** express every booking status as a surface + border + text triple that passes AA at the stated ratio.
- **Do** route every animation through `src/lib/motion.ts`. GSAP has no built-in `prefers-reduced-motion` handling, so a direct `gsap.to()` in a component is banned.
- **Do** animate `transform` and `opacity` only, and reserve space before animating in. No CLS.
- **Do** guard every outlined word with an `@supports` fallback and a `forced-colors` fallback.
- **Do** keep the hero LCP element as text, never an image and never a canvas.
- **Do** tint shadows navy, or Signal Blue when the shadow is the same event as a Signal Blue border.
- **Do** let the date pill be the only fully round shape in the system.
- **Do** measure on the live node with the font loaded. Every typographic defect this project has shipped was found by `getBoundingClientRect` and almost none by reading code.

### Don't:

- **Don't** make the page dark, neon, glowing, or saturated. The anti-reference is binding. Navy **plates and bands** are permitted under the five conditions above; a navy **world** is the thing the client ruled out by name.
- **Don't** put a shadow, a glow, or a saturated non-blue hue inside a navy band.
- **Don't** make the order section navy.
- **Don't** use a light-surface primitive on a navy band — `blue-600` computes 3.30:1 there and `navy-400` computes 2.46:1.
- **Don't** introduce a second skew value, or tilt anything that is not on the axis list.
- **Don't** outline a word a visitor reads on a navy band. Outline is a light-ground device; on navy it is reserved for `aria-hidden` structure.
- **Don't** set outlined text below 24px, or ship `color: transparent` without both fallbacks. The failure mode is an invisible word, not an ugly one.
- **Don't** ask for a font weight the project does not load. Panchang has 500, 700 and 800; a 900 renders as 800 and every document quoting 900 is then wrong.
- **Don't** render a price on `/`. That half of the rule is permanent. `/booking` is the exception the client settled on 2026-08-11 — a real rupiah amount appears there, once the visitor has arrived through the WhatsApp link.
- **Don't** invent a placeholder price on `/booking` either. The rate card has not been supplied. Every other placeholder in this project is inert if it ships by accident; a price is the one a visitor would act on.
- **Don't** print `Asia/Jakarta`, `WIB`, or any Jakarta-derived time anywhere. The field runs on WITA.
- **Don't** reword, retitle, re-capitalise or shorten the Ketentuan. Ten rules, verbatim, and `check:docs` compares them character for character.
- **Don't** turn the slot grid into 2 or 3 columns **below 640px**, and don't truncate the state label to make columns fit at any width.
- **Don't** hide unavailable slots.
- **Don't** add a third typeface, a third radius, a second marquee, or a second eyebrow.
- **Don't** put a kicker or eyebrow above an `h2`, ever. The one exception is the hero, above the `h1`, and it is exhausted.
- **Don't** load fonts from a CDN `<link>` in production — `next/font` is load-bearing for the no-CLS guarantee.
- **Don't** use black shadows, or add a shadow where a hairline and a band already separate two surfaces.
- **Don't** add a second animation runtime beside GSAP, a Lottie file over 100KB, or an autoplaying video. The hero-video gate ran in Phase 1b and **failed**, so the "unless it passes" clause is spent.
- **Don't** animate layout properties (`width`, `height`, `top`, `left`).
- **Don't** let a component token point at a primitive. It must route through the semantic tier, including for state colour — that is the half that gets skipped.
- **Don't** use a neutral grey for secondary text on a coloured surface. Tint the mute from the surface's own hue.
- **Don't** compose a section the same way as the one before it.
- **Don't** invent art direction here. It was replaced on 2026-08-12 and is written in the Overview — execute it, don't reopen it. A section that needs a new visual idea has found a gap in the direction, which is a question for the user, not a licence.
- **Don't** present anything in this document as client-approved until the re-approval named at the top has actually happened.

## Change log

### 2026-08-13 — the typeface changed, the headline flattened, the world squared

| Was                                    | Is now                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| Saira at `wdth` 125, weights up to 900 | Panchang, static cuts, weights 500 / 700 / 800 only          |
| Hero headline 104 / 128 / 152px        | One size, `clamp(35px, 10.95vw, 144px)`, derived at 88% fill |
| `rounded.control` 12px                 | 0px — the button was the last rounded thing on a square page |
| `label` weight 800                     | 500                                                          |
| Marquee skewed `-1.2deg`               | Flat on the plate's bottom edge                              |
| Hero: WebGL field, capped at `100svh`  | Navy plate, skewed field, `min-h`, no cap                    |
| `MENUNGGU.` and `KIRIM.` outlined      | Both take the accent; outline reserved for structure on navy |
| Header: logo + CTA                     | Logo + **business name** + CTA                               |
| One `h2` floor below 360px             | Three stepped floors below 600px                             |
| `closing`, `numeral` clamps            | Re-derived against Panchang's metrics                        |
| No `location` role                     | `location` added, bound to "LOMBOK"                          |

### 2026-08-12 — the direction was replaced wholesale

| Was                                                           | Is now                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| North star: the build-instruction book, every step numbered   | North star: velocity, the page leans on the logo's own axis             |
| Light throughout, banded with `grey-50`                       | Light ground, white plates, full-bleed `navy-900` bands                 |
| Filled grey numeral bleeding off the left edge + navy keyline | Outlined leaning numeral on the baseline beside the heading; no keyline |
| Display 32→72px at 1.1, sentence case                         | Display at 0.95, uppercase, one word emphasised                         |
| No eyebrow anywhere                                           | Exactly one eyebrow, hero only, above the `h1`                          |
| Fixed section rhythm 48/64/96/128                             | One fluid rhythm, `clamp(96px, 12vw, 160px)`, every section             |
| Container 1100px                                              | 1280px                                                                  |
| Two shadows                                                   | Three plus one interactive glow; none inside a navy band                |
| Slot columns at 768px / 1024px                                | 640px / 1180px, measured against the panel rather than the viewport     |

**Survived both passes, because it is behaviour and constraint rather than look:** the four slot states including `elapsed` and its collapsed group; the `aria-pressed` / `aria-disabled` patterns and the Never-Native-Disabled Rule; the status triples and every contrast floor; the free-run affordance; the two-scroll rule; the no-price rule; the verbatim Ketentuan; the performance budget; the motion-through-`src/lib/motion.ts` rule; the hero-video gate's failure; and every colour primitive.

### Still owed

**A list of what is owed is load-bearing, and a stale one costs more than no list.** Delete an item the moment it lands.

- **Client re-approval.** The client approved the light-only direction on 2026-08-11. They have not seen this one, and the typeface has changed twice since. **No amount of work here closes this.**
- **`--text-body` is undefined**, so body text renders 16px flat instead of scaling to 18px. Defining it is a visual change nobody has approved.
- **The hero eyebrow wraps to two lines** at 375px and 414px.
- **`rounded.panel` survives on the map placeholder** and nowhere else.
- **`:focus-visible` is 2px/2px** where this document specifies 3px/3px.
- **Lighthouse mobile Performance median is 71** against the ≥85 gate.
- **No scroll-reveal on the location and closing sections.** Both are server components with zero JS; whether they should have one is unasked.
