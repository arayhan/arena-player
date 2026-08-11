---
version: alpha
name: Arena Player
description: Light, blue-and-white booking interface for a mini soccer field — the deliberate inverse of the dark-neon local benchmark.
colors:
  navy-900: "#011A43"
  navy-700: "#0A2E6B"
  blue-600: "#2563EB"
  blue-700: "#1D4ED8"
  blue-50: "#EFF6FF"
  white: "#FFFFFF"
  grey-50: "#F9FAFB"
  grey-200: "#E5E7EB"
  navy-400: "#4A5A78"
  amber-100: "#FEF3C7"
  amber-300: "#FCD34D"
  amber-800: "#92400E"
  red-100: "#FEE2E2"
  red-300: "#FCA5A5"
  red-800: "#991B1B"
typography:
  display:
    fontFamily: Orbitron
    fontSize: "clamp(2rem, 1.12rem + 3.76vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Orbitron
    fontSize: "clamp(1.625rem, 1.14rem + 2.07vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.25
  h3:
    fontFamily: Orbitron
    fontSize: "clamp(1.25rem, 0.99rem + 1.13vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.25
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
  sharp: 2px
  card: 4px
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
  24: 96px
  32: 128px
components:
  slot-available:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.sharp}"
    padding: 16px
    height: 56px
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
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.navy-400}"
  pill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.full}"
    padding: 8px 16px
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
    rounded: "{rounded.sharp}"
    padding: 0 24px
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.navy-700}"
  button-primary-active:
    backgroundColor: "{colors.blue-700}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.navy-900}"
    rounded: "{rounded.sharp}"
    padding: 0 24px
    height: 48px
  button-disabled:
    backgroundColor: "{colors.grey-200}"
    textColor: "{colors.navy-400}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.sharp}"
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

Machine-readable tokens are the frontmatter above; this prose says how to apply them. Motion, shadow, breakpoint, and border tokens have no home in the DESIGN.md schema and live in [`.impeccable/design.json`](../.impeccable/design.json). How design work is _run_ here — motion approval, image sourcing, asset locations — is [design-process.md](design-process.md). Live render of everything below: [DESIGN.html](DESIGN.html).

## Overview

**Creative North Star: the build-instruction book.** A booking is an assembly — parts laid out, named, then put together in a fixed order until a thing exists that did not before. The page teaches that assembly the way an instruction booklet does: every part shown before it is used, every step numbered, nothing on the page that is not either a part or a step. Confidence comes from legibility, not from persuasion.

Chosen in Phase 1b task 1. The direction was pinned by the user over the rolled alternative and is rendered in full at [DESIGN.html](DESIGN.html) — that page **is** the specification, and this section is its written form.

**The fusion rule — every colour carries both its instruction-book role and its product meaning.** The two never conflict, because where they would, product meaning wins:

| Instruction-book role                      | Token       | Product meaning                                                       |
| ------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| The ground the parts lie on                | `blue-50`   | The light, blue-white world; the anti-reference to the dark benchmark |
| Keyline ink — every rule, edge and numeral | `navy-900`  | The brand anchor, sampled from the client's logo                      |
| Inventory tags on the parts                | `amber-300` | Pending — "Menunggu Konfirmasi"                                       |
| **The new part being added this step**     | `blue-600`  | Interactive: links, focus, available slots, selection                 |

That last row is the rule doing real work. The source world marks the new part in **brick red**, and taking it literally would have been the obvious move — but **red already means booked here**, and a colour cannot mean "look at this, add it" and "you cannot have this" on the same grid. It maps to Signal Blue instead. When the world and the product disagree, clarity wins and the world bends.

### The four parts of the direction

**1. Type scale — fluid, never stepped.** A 1.25 ratio at 375px growing to 1.5 at 1440px through `clamp()`, with no breakpoint jumps anywhere. Full hierarchy under [Typography](#typography). The one addition the direction makes: `sm` and `xs` are **fixed** and do not scale, because shrinking a caption below 14px on a phone is an accessibility failure and growing it on desktop stops it reading as secondary.

**2. Spacing rhythm — 4px base, two registers.** Components use 4/8/12/16 for interior padding; **section rhythm only ever uses 48/64/96/128**. Fine control where it is needed, strict rhythm where it is visible. A section gap that is not one of those four numbers is a mistake, not a judgement call.

**3. Section-transition language — numbered assembly steps.** Each landing section is a step in the build, carrying an oversized Orbitron numeral in `grey-200` that bleeds off the left edge, with a navy keyline between steps. This is the load-bearing decision of the whole direction, and it exists to fix one specific failure: the benchmark runs six identically-treated centred headings in a column, so a visitor has no sense of progress or place — and the first draft of [DESIGN.html](DESIGN.html) was graded with the same flaw ("one compositional idea repeated eight times"). An ordinal fixes it for free. It costs **zero kilobytes**, requires **no motion**, and works at 375px, which matters because the alternatives all spend budget on the problem instead of composition.

**4. Surpassing the benchmark** — defined as four falsifiable claims, not as ambition. See [the benchmark, read](#the-benchmark-read--what-inverted-and-surpass-mean-concretely) below.

### What the direction forbids

- **No section may be composed the same way as its neighbour.** The numeral gives the sequence; the composition has to give the variety. Five sections improvising five visual ideas is the failure this direction exists to prevent, but so is five sections that are one idea five times.
- **No third typeface.** Orbitron and Inter only. `DESIGN.html` uses Archivo for its own document chrome — that is the _manual's_ voice, not the product's, and it never ships in the app.
- **Nothing else becomes fully round.** The date pill is the only `9999px` shape and its roundness is what signals "this row scrolls".
- **No decorative colour.** Every hue outside the neutrals carries a meaning from the fusion table above.

What _is_ settled is the world's polarity. `bataskotapoint.com` is a binding reference **as an anti-reference**: dark, neon, saturated. Arena Player is its inverse — light, clean, blue-and-white, with whitespace treated as a material rather than as leftover room. Navy `#011A43` is sampled from the client's own logo, so the palette is inherited, not invented.

### The benchmark, read — what "inverted" and "surpass" mean concretely

Read once from `docs/references/benchmark-bataskotapoint.png`, a full-page desktop capture at 1920×7888. **The source file is gitignored and gets deleted; this section is the only thing that survives it**, so it is written to be specific enough to design against without the image.

**What the benchmark does.** Near-black ground with a spring-green accent. The hero is a night photograph of a floodlit field used as the light source, with a wireframe geodesic polyhedron floating top-right and a wide-tracked uppercase two-tone headline. Then six more sections, then a booking section, then a map and a footer.

| Trait              | Benchmark                                                           | Arena Player                                                                    |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Ground             | Near-black, glow, photo-as-light-source                             | Light `blue-50`/white; whitespace is the material                               |
| Accent             | Spring green, saturated, decorative                                 | Navy inherited from the logo; `blue-600` earns its use by meaning "interactive" |
| Heading treatment  | Six sections, six **identical** centred uppercase two-tone headings | See the section-transition language below — this is the gap being closed        |
| Order section      | Buried ~5 scrolls down, after hero, video, specs and gallery        | Within 1–2 scrolls at 375px. **A hard rule, and this is its evidence**          |
| Prices             | Shown in the order summary rail                                     | Rendered nowhere until the client answers                                       |
| Third-party embeds | A raw YouTube player, chrome and all, mid-page                      | None; an undesigned rectangle inside a designed page is a defect                |
| Design target      | Desktop-first at 1920                                               | 375px-first, mid-range Android in an in-app browser                             |

**Two things it gets right, kept deliberately rather than inverted:**

1. **Booked slots are red with a lock glyph.** Arena Player arrived at the same red triple independently. Convergence here is a reason to keep it, not to differentiate: this is the local convention the audience already reads, and a booking grid is the wrong place to be original.
2. **The date row is pills, the selected one is filled.** Same conclusion, same reason.

**What "surpass" means, stated as falsifiable claims rather than as ambition** — the benchmark's real weaknesses, each one something to be measurably better at:

- **The product is buried.** Five scrolls of marketing precede the thing the visitor came for. Arena Player's two-scroll rule is not a performance nicety; it is the single largest difference in the visitor's experience.
- **Every section looks like every other section.** Six centred two-tone uppercase headings in a column give the page no sense of progress or place. A visitor cannot tell where they are.
- **The rules are three near-identical dark cards** with keywords highlighted inline in green, red and yellow. Dense, low-contrast, and unscannable — and Arena Player's Ketentuan is ten verbatim rules, which is more content in the same trap.
- **The map is a dead grey rectangle** in the capture, i.e. an unloaded embed shipped as the final state. Location has to survive its own loading state here.

The system's personality comes from a deliberate tension: Orbitron is a wide, geometric, athletic display face, and it sits on near-sharp geometry and generous white space. That combination is what keeps a booking utility from reading as a generic form, without a single decorative flourish being added. The one fully-round shape in the entire system is the date pill, and its roundness is functional.

Density is low by intent. The primary visitor is a team captain on a 375px Android inside the Instagram in-app browser, mid-conversation in another chat, deciding fast for eight to twelve people. Speed of comprehension outranks completeness of information everywhere the two conflict.

### Settled in task 1 — Inter stays, and here is why

The design detector flagged it and the flag was correct: **Inter is one of a handful of faces that every AI-generated interface converges on**, so it contributes nothing to the personality this system credits to Orbitron. The display face carries the identity alone.

**Kept anyway, deliberately.** Three reasons, in order of weight:

1. It is a **stated client commitment** — [PRODUCT.md](PRODUCT.md) records "Orbitron for display type, Inter for body" as given, not chosen. Overriding that unasked is not task 1's call, and asking would spend a client-checkpoint question on a cosmetic issue when the first two questions there block Phases 2 and 3.
2. **"Invisible" is the right brief for body type here.** The reader is a team captain deciding fast for eight to twelve people on a 375px Android. Body type that draws attention to itself is working against the outcome.
3. **Every printed number in this system was computed against Inter's metrics** — the 60–68ch measure, the 14px and 12px fixed sizes, the state-label ratios. Swapping the face invalidates all of them at once, and this document's credibility rests on those numbers being checkable.

The identity is carried by Orbitron, by the light blue-white world, and by the numbered-step composition — **not** by body type. That is the decision, not an oversight, and the detector's finding stands recorded rather than suppressed.

### Client directive — minimal form, rich behaviour

The client asked for a **minimalist UI, but modern — with many animations, transitions, and micro-interactions.**

This is an **input to Phase 1b task 1, not a north star.** Task 1 still owns the art direction; this constrains what it may decide.

Read as a whole rather than as two competing requests: **minimal in form, rich in behaviour.** Few elements, each responding precisely. The restraint is not despite the motion — it is what makes dense motion legible. The same effects on a busy layout read as noise. "Minimalist" here is confirmed to mean _few elements and generous whitespace_, which the system already says above, and **not** reduced colour: the status triples are an accessibility requirement, not decoration, and the palette is unchanged by this directive.

**Where the motion lives — this split is a rule, not a preference:**

| Area                                        | Motion                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Hero, content sections, section transitions | Expressive. This is where the directive is spent                             |
| **Order section**                           | **Functional feedback only** — state change, selection, the elapsed collapse |

The order section is exempt for a stated reason, not by oversight. It is where the booking happens, where the per-section Lighthouse gate bites hardest, and where the organiser is deciding fastest with people waiting on them. Motion that delays that decision works against the outcome the client is paying for. Withholding it there is the directive being honoured, not ignored.

**What this does not change:**

- **Every effect is still chosen by the user before code is written**, via `AskUserQuestion`, batched by section — see [design-process.md](design-process.md). This directive raises the ceiling; it pre-approves nothing.
- **Everything still routes through `src/lib/motion.ts`.** More motion means more `prefers-reduced-motion` surface to cover, not less.
- **No CLS, and the performance budget is untouched.** GSAP is already the largest single item in a tight budget, so added effects reuse the existing instance. On a mid-range Android in an in-app webview the binding cost is CPU per frame, not kilobytes — an effect can pass the KB budget and still fail the Lighthouse gate.

### Hero-video gate — DECIDED, and it failed

Settled in Phase 1b as the PRD requires, **before** anything was produced. The hero is **text and logo**, and there is no hero video.

It failed on the gate's second condition, which was always the binding one: the poster-only path must look intentional, because **iOS Low Power Mode and in-app webviews block autoplay outright** — and the in-app browser is not an edge case here, it is the _primary device_. A real share of visitors would only ever see the poster, which makes the video an expensive enhancement for the minority and a compromised hero for everyone else. Conditions 1 and 3 were not reached; there was no need.

Consequences, all of them deliberate:

- The **LCP element is the Orbitron headline plus the logo** — text, which is the cheapest and most reliable LCP there is.
- The `/` budget stays at its measured 137.0 KB against a 240 KB ceiling, with 103.0 KB of headroom preserved for the sections still to be built.
- The **"no autoplaying video" guardrail in [CLAUDE.md](../CLAUDE.md) stays as written, unamended.** It would only have needed an exception clause had the gate passed.
- `/remotion-create` is reserved for **off-site** assets — an Instagram Reel, a social preview — which cost the landing page nothing and are where motion actually reaches this audience.

**Key Characteristics:**

- Light and blue-white, never dark — the anti-reference is binding
- **The build-instruction book: every part shown before it is used, every step numbered**
- Oversized Orbitron display against Inter body; no third face
- Near-sharp corners throughout; exactly one round shape, and it means something
- Status is a colour _triple_, never a single hue
- Navy-tinted shadows only; black shadows read as dirt on a blue-white page
- Whitespace is the layout device, not a shortage of content
- Minimal in form, rich in behaviour — few elements, each responding precisely

## Colors

Inherited navy and blue over near-white neutrals, with amber and red reserved entirely for booking state. Nothing in the palette is decorative — every hue outside the neutrals carries meaning.

### Primary

- **Arena Navy** (`navy-900`): the brand anchor, sampled from the client's logo. Body text, headings, and primary button fills. It is the darkest value in the system and the only one that reads as "the brand".
- **Navy Depth** (`navy-700`): pressed and hover depth on navy surfaces. Never used for text.

### Secondary

- **Signal Blue** (`blue-600`): every interactive affordance — links, focus rings, available-slot borders, selected states. 5.17:1 on white.
- **Signal Blue Pressed** (`blue-700`): the active state of a blue affordance.
- **Signal Wash** (`blue-50`): hover fill. Light enough that navy text on it still passes AA, which is why hover never needs a text-colour change.

### Tertiary — status only

Status colours are **triples**, never single hues. Each is a surface, a border, and a text colour chosen together so the label passes AA.

- **Pending Amber** (`amber-100` / `amber-300` / `amber-800`): 6.37:1 for "Menunggu Konfirmasi".
- **Booked Red** (`red-100` / `red-300` / `red-800`): 6.80:1 for "Terisi".

### Neutral

- **Page White** (`white`): the default page surface.
- **Band Grey** (`grey-50`): alternating section bands and disabled fills.
- **Hairline** (`grey-200`): dividers and resting borders.
- **Muted Ink** (`navy-400`): captions and secondary text. 6.94:1 on white and 6.38:1 on the blue wash. It replaced a neutral grey, which computed 4.44:1 against `blue-50` and failed AA the moment secondary text sat on a coloured surface.

### The Semantic Layer

The frontmatter carries **primitives only**, because a DESIGN.md token may not reference another token in the same group. The implementation adds a semantic layer between primitives and components, and that layer is the one a re-theme edits:

| Semantic                                        | Primitive                     | Purpose                                                           |
| ----------------------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| `--color-bg`                                    | `white`                       | Page background                                                   |
| `--color-bg-subtle`                             | `grey-50`                     | Alternating section bands                                         |
| `--color-fg`                                    | `navy-900`                    | Body and heading text                                             |
| `--color-fg-muted`                              | `navy-400`                    | Secondary text, captions                                          |
| `--color-interactive`                           | `blue-600`                    | Links, focus, available slots                                     |
| `--color-interactive-pressed`                   | `blue-700`                    | Active state                                                      |
| `--color-border`                                | `grey-200`                    | Hairlines                                                         |
| `--color-focus`                                 | `blue-600`                    | Focus ring                                                        |
| `--color-fg-inverse`                            | `white`                       | Text on a filled dark surface                                     |
| `--color-wash`                                  | `blue-50`                     | The hover tint                                                    |
| `--color-accent-strong`                         | `navy-900`                    | Heaviest actionable surface — primary button, secondary border    |
| `--color-accent-strong-hover`                   | `navy-700`                    | Its hover                                                         |
| `--color-disabled-bg`                           | `grey-200`                    | Disabled fill                                                     |
| `--color-warning-surface` / `-line` / `-strong` | `amber-100` / `-300` / `-800` | The pending triple                                                |
| `--color-danger-surface` / `-line` / `-strong`  | `red-100` / `-300` / `-800`   | The booked triple, and the error boundary                         |
| `--color-success-fg`                            | `navy-900`                    | Success carries on weight and copy, never on the interactive blue |

**State colour needs its own semantic tier.** Without one, every component showing a state
reaches for a raw hue, and a re-theme silently misses all of them. That is not hypothetical: it
is exactly what a finish review found in the first build of `DESIGN.html`, where seventeen
component tokens skipped this layer while the page argued they did not.

**The Three-Layer Rule.** Reference flows one direction only: primitive → semantic → component. No component file contains a hex code, and no component reaches past its own layer for a raw value. Re-theming touches the semantic layer and nothing else.

**The Status-Is-Information Rule.** A booking state the user cannot read is a booking state they will get wrong. "Menunggu Konfirmasi" is information, not decoration — so no status may be expressed as a single hue, and no status label may fall below AA. An earlier draft specified "Pending: yellow"; yellow text on white is roughly 1.4:1 and unreadable.

## Typography

**Display Font:** Orbitron (fallback `system-ui, sans-serif`)
**Body Font:** Inter (fallback `system-ui, sans-serif`)

**Character:** Orbitron is wide, geometric, and athletic — it does the entire job of making a booking utility feel like sport. Inter carries everything that has to be read rather than seen. There is no third face, and adding one would dilute the only strong voice in the system.

### Hierarchy

- **Display** (Orbitron 900, 32→72px fluid, 1.1): hero headline. The single largest gesture on the page.
- **H2** (Orbitron 700, 26→48px fluid, 1.25): section headings.
- **H3** (Orbitron 500, 20→32px fluid, 1.25): sub-headings and slot times.
- **Body** (Inter 400, 16→18px fluid, 1.6): all prose. Cap measure at 60–68ch.
- **Sm** (Inter 400, 14px fixed, 1.5): state labels, helper text, field labels.
- **Xs** (Inter 400, 12px fixed, 1.5): captions and metadata.
  There is no eyebrow or kicker role, deliberately. See the Don'ts.

**The Fluid-Not-Stepped Rule.** The scale runs a 1.25 ratio at 375px growing to 1.5 at 1440px via `clamp()`. There are no breakpoint jumps anywhere in the type system — restrained where space is scarce, oversized where there is room for it.

**The Fixed-Small Rule.** `sm` and `xs` deliberately do not scale. Shrinking a caption below 14px on mobile is an accessibility failure, and growing it on desktop makes it stop reading as secondary.

**The Tight-Display Rule.** Orbitron takes tighter leading than Inter or it reads as loose: 1.1 for display, 1.25 for headings, 1.6 for body. Never apply body leading to Orbitron.

**Loading is not a style choice.** Both faces load through `next/font/google`, self-hosted with zero layout shift — never a CDN `<link>` in production. [architecture.md](architecture.md) records `next/font` as load-bearing for the no-CLS and LCP guarantees, which makes it non-swappable rather than a preference.

## Layout

Mobile-first at 375px, scaling to a 1100px content maximum. The primary device is a mid-range Android inside the Instagram in-app browser; that is the design target, not a fallback.

Spacing runs a **4px base**. Components use 4/8/12/16 for interior padding. **Section rhythm only ever uses 48/64/96/128** — fine control where it matters, strict rhythm where it shows.

**The Numbered-Step Rule.** Sections are separated by a **step numeral and a navy keyline**, not by dividers or borders. Each landing section carries an oversized Orbitron numeral in `grey-200` bleeding off the left edge, and a `navy-900` keyline runs between consecutive steps. Alternating `grey-50` bands remain available as a secondary device but are no longer the primary one — on their own they were the flaw the art direction exists to fix, since a column of identically-banded sections tells the visitor nothing about where they are. The numeral is text: **zero kilobytes, no motion required, legible at 375px.**

**The Two-Scroll Rule.** The order section must be reachable within one to two scrolls at 375px. The hero is capped at 100svh — `svh`, not `vh`, because in-app browsers report `vh` incorrectly and a hero sized in `vh` overshoots exactly on the primary device. A hero that pushes the order section below two scrolls has failed regardless of how it looks.

**The Horizontal-Containment Rule.** The date row scrolls horizontally with `overscroll-behavior-x: contain`, so a sideways swipe never bounces the page underneath it.

Layout is answerable to a hard budget, not to taste: LCP under 2.5s, Lighthouse mobile Performance at or above 85, verified per section as it merges. The numbers live in [architecture.md](architecture.md) and are never restated elsewhere.

## Elevation & Depth

**Near-flat by default.** Depth comes from tonal layering — white cards on `grey-50` bands, separated by `grey-200` hairlines — not from shadows. Only two shadows exist in the whole system, and both are subtle enough to read as edge definition rather than lift.

### Shadow Vocabulary

- **shadow-sm** (`0 1px 2px rgb(1 26 67 / 0.06)`): resting cards.
- **shadow-md** (`0 4px 12px rgb(1 26 67 / 0.08)`): raised or hovered surfaces.

**The Tinted-Shadow Rule.** Shadows are navy-tinted, never neutral black. A black shadow on a blue-white page reads as dirt rather than as depth. Both values are `rgb(1 26 67 / …)` — the brand navy at low alpha.

## Shapes

**Architectural sharpness, with one deliberate exception.** Interactive surfaces take a 2px radius; cards and panels take 4px. That near-sharp geometry is what carries the athletic Orbitron feel — softer corners would make the same type read as generic SaaS.

The exception is the **date pill**, the only fully round shape in the system (`9999px`). Its roundness is functional signalling, not decoration: a row of pills reads as horizontally scrollable without needing an arrow, a gradient fade, or a hint label.

**The One-Round-Shape Rule.** Nothing else in the system is fully round. The moment a second element takes the pill radius, the date row stops meaning "this scrolls" and becomes just another style.

Borders are 1px hairlines at rest and 2px only to signal focus or error — weight change carries the state, so no state depends on colour alone.

## Components

### Buttons

- **Shape:** near-sharp (2px), 48px tall, comfortably above the 44px tap minimum.
- **Primary:** navy fill, white text, 24px horizontal padding.
- **Hover / Active:** hover deepens to `navy-700`; active shifts to `blue-700`, so the press reads as the interactive colour rather than as more navy.
- **Secondary:** transparent fill, 1px navy border, navy text. Hover fills `grey-50`.
- **Disabled:** `grey-200` fill, muted text, no border, `not-allowed`.

**The Never-Native-Disabled Rule.** A disabled button uses `aria-disabled="true"`, never the native `disabled` attribute. Native `disabled` removes the control from the tab order entirely, so a keyboard user tabbing through the `/booking` form reaches the last field and then nothing — no submit button, no explanation, no way to discover why. `aria-disabled` keeps it focusable and announced, and the press is refused in code instead of by the browser.

This is the same rule the slot cell and the date pill already follow, and the submit button was the one place breaking it. Worth stating separately because the pull toward native `disabled` is strong: it is shorter, it is what the platform suggests, and it produces a control that looks correct while being unreachable.

**One column, full-width rows.** This is not a stylistic preference and must not be "improved" into a grid.

"Menunggu Konfirmasi" is 20 characters. A 3-column grid at 375px gives roughly 110px per cell and the label cannot fit at all; 2-column forces truncation. Full-width fits it at full size and yields a tap target far above minimum.

- **Layout:** time left, state right, 16px padding, 56px minimum height, 2px radius.
- **Available:** white fill, 1px `blue-600` border, navy text, label "Tersedia", `cursor: pointer`.
- **Hover:** fills `blue-50`. Available cells only.
- **Selected:** `blue-600` fill, white text, label "Dipilih".
- **Pending:** the amber triple, label "Menunggu Konfirmasi", `aria-disabled="true"`, `not-allowed`.
- **Booked:** the red triple, label "Terisi", `aria-disabled="true"`, `not-allowed`.
- **Elapsed:** `grey-50` fill, `navy-400` text and a **3px `navy-400` left rule**, label "Sudah lewat", `aria-disabled="true"`, `not-allowed`.

**The Visible-Unavailable Rule.** Disabled cells stay visible and legibly labelled. An organiser needs to see that 18.00 is taken, not wonder why the list skips it. Hiding an unavailable slot is never the answer.

**Elapsed slots are not booked slots, and the distinction is now the client's to make.** `GET /api/availability` returns `booked` for today's elapsed slots, so an earlier draft of this section concluded the client could not tell them apart and that separating them needed a `past` status in the API contract — a Phase 4 change.

That is resolved and the conclusion was wrong. The client already knows the current time and the canonical starts in `src/domain/slots.ts`, so it can derive "elapsed" itself without the API saying anything. `GET /api/availability` needs no `past` status and stays **FIRM**. The full reasoning and the chosen treatment — a collapsed `Sudah lewat (N)` group rather than nine rows labelled "Terisi" — are in the order-section brief at [`.impeccable/surfaces/app-page-tsx.md`](../.impeccable/surfaces/app-page-tsx.md).

Why it mattered enough to reopen: with same-day booking confirmed as the primary journey, a page opened at 19.00 rendered the whole day as "Terisi" and read as sold out. For a product measured on filling empty hours, that is the worst outcome the design can produce, and it was one derivation away from being avoidable.

**And elapsed is therefore its own state, not a shade of booked.** Having established the distinction, the artifact went on rendering elapsed rows in the red triple while labelling them "Sudah lewat" — the collapse fixed the count but not the colour, so the page contradicted the rule printed directly above it and still overstated how busy the day had been. Fixed in Phase 1b task 3.

**The separation is structural, not chromatic.** Elapsed and booked are both unavailable, and a hue swap alone would leave them reading as the same family. The 3px left rule is what distinguishes them: only one of the two is somebody else's booking, and the visitor is entitled to see which. `navy-400` on `grey-50` computes **6.64:1**, well clear of the 3:1 boundary requirement.

### Date Pill

- **Shape:** fully round, 64px minimum width, 8px vertical / 16px horizontal padding, day name above date.
- **Default:** white fill, `grey-200` border, navy text.
- **Hover:** `blue-50` fill, `blue-600` border.
- **Selected:** `blue-600` fill, transparent border, white text; the day name drops to 80% white so the date stays dominant.
- **Disabled:** `grey-50` fill, muted text.

### Inputs / Fields

- **Style:** 48px tall, 2px radius, 1px `grey-200` border, 12px padding, white fill.
- **Focus:** 2px `blue-600` outline at 2px offset. Never `outline: none` without a replacement.
- **Error:** 2px `red-800` border **and** `red-100` field fill, with `red-800` message text tied to the field via `aria-describedby`.
- **Disabled:** `grey-50` fill, muted text.
- **Placeholder:** `navy-400` at `opacity: 1`.

**The Placeholder-Is-A-Token Rule.** The system carried no placeholder rule at all, so every field Phase 3 adds would have inherited the user agent's default — around **2.35:1** on white, which fails AA for text and is the most common accessibility defect in a booking form. `navy-400` computes **6.94:1** on white while staying visibly lighter than the `navy-900` body text, so it still reads as a prompt rather than as a filled value. `opacity: 1` is explicit because several browsers apply their own alpha on top of the colour and would drag the computed ratio back down.

**Placeholders never replace labels.** Every field keeps its visible `<label>`; the placeholder is a format hint (`08123456789`) and nothing else. A placeholder-as-label disappears the moment the user types, which is exactly when they need it.

**The Focus-Is-Required Rule.** Focus rings are restyled, never removed. Keyboard operability is a Phase 3 Definition-of-Done item, not a styling preference.

**The Visible-Boundary Rule.** When a border is a state's only visual signal, it must clear **3:1** — WCAG 1.4.11 for non-text UI boundaries. An earlier draft used `red-300` on a white field, which computes to **1.90:1** and fails: the field stayed white, so the border carried the whole signal and did so invisibly. `red-800` computes to **8.31:1** on white, and the `red-100` fill adds a second, non-border signal so the state does not depend on one property or on hue alone. This token ships into the `/booking` form, which is the conversion point.

### Cards / Containers

4px radius, 1px `grey-200` border, white fill, 16px internal padding, `shadow-sm` at rest.

**Callouts are tonal, not tabbed.** A callout card drops its shadow and fills `grey-50` instead. It does **not** take a thick coloured left border — that side-tab treatment is one of the most recognisable tells of generated UI, and it contradicts the tonal-layering approach the rest of the system uses for depth.

## Do's and Don'ts

### Do:

- **Do** keep every reference flowing primitive → semantic → component. A hex code in a component file is a defect.
- **Do** express every booking status as a surface + border + text triple that passes AA at the stated ratio.
- **Do** route every animation through `src/lib/motion.ts`. GSAP has no built-in `prefers-reduced-motion` handling, so a direct `gsap.to()` in a component is banned — that is exactly how one component ships without the check.
- **Do** animate `transform` and `opacity` only, and reserve space before animating in. No CLS.
- **Do** keep the hero LCP element as text or logo, never an image.
- **Do** tint shadows navy at low alpha.
- **Do** let the date pill be the only fully round shape in the system.

### Don't:

- **Don't** go dark, neon, or saturated. The anti-reference is binding, and this is the one direction the client has ruled out by name.
- **Don't** render a price anywhere. Pricing is an unresolved client decision; until the rate card arrives, no number appears on either page.
- **Don't** turn the slot grid into 2 or 3 columns. The 20-character state label does not fit, and truncating it destroys the information the cell exists to carry.
- **Don't** hide unavailable slots.
- **Don't** add a third typeface, or apply body leading to Orbitron.
- **Don't** load fonts from a CDN `<link>` in production — `next/font` is load-bearing for the no-CLS guarantee.
- **Don't** use black shadows, or add a shadow where a hairline and a tonal band already separate two surfaces.
- **Don't** add a second animation runtime beside GSAP, a Lottie file over 100KB, or an autoplaying video. The hero-video gate ran in Phase 1b and **failed** — the "unless it passes" clause is spent, so this one is now absolute.
- **Don't** animate layout properties (`width`, `height`, `top`, `left`).
- **Don't** let a component token point at a primitive. It must route through the semantic tier, including for state colour — that is the half that gets skipped.
- **Don't** use a neutral grey for secondary text on a coloured surface. Tint the mute from the surface's own hue.
- **Don't** put a kicker or eyebrow above a heading. The heading carries its own weight. Where the small label holds real information — `Layer 1`, `Layer 2` — fold it into the heading instead of setting it as a separate uppercase line above. **The step numeral is not an eyebrow**: it is oversized, set in `grey-200`, bleeds off the left edge, and sits beside the heading rather than above it. A small uppercase numeral stacked over a heading is the banned pattern wearing a number.
- **Don't** compose a section the same way as the one before it. The numeral carries the sequence; composition has to carry the variety. Five sections improvising five visual ideas is one failure — five sections repeating one idea is the other, and it is the one the benchmark commits.
- **Don't** invent art direction here. It was decided in Phase 1b task 1 and is written in the Overview — execute it, don't reopen it. A section that needs a new visual idea has found a gap in the direction, which is a question for the user, not a licence.
