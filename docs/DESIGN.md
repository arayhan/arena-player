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
---

# Design System: Arena Player

Machine-readable tokens are the frontmatter above; this prose says how to apply them. Motion, shadow, breakpoint, and border tokens have no home in the DESIGN.md schema and live in [`.impeccable/design.json`](../.impeccable/design.json). How design work is _run_ here — motion approval, image sourcing, asset locations — is [design-process.md](design-process.md). Live render of everything below: [DESIGN.html](DESIGN.html).

## Overview

**Creative North Star: not yet established.** Art direction is Phase 1b task 1 and has not been decided. This document currently carries tokens and component behaviour only. Writing a north star here before that task runs would pre-empt the decision the phase exists to make — see [PRD.md](PRD.md).

What _is_ settled is the world's polarity. `bataskotapoint.com` is a binding reference **as an anti-reference**: dark, neon, saturated. Arena Player is its inverse — light, clean, blue-and-white, with whitespace treated as a material rather than as leftover room. Navy `#011A43` is sampled from the client's own logo, so the palette is inherited, not invented.

The system's personality comes from a deliberate tension: Orbitron is a wide, geometric, athletic display face, and it sits on near-sharp geometry and generous white space. That combination is what keeps a booking utility from reading as a generic form, without a single decorative flourish being added. The one fully-round shape in the entire system is the date pill, and its roundness is functional.

Density is low by intent. The primary visitor is a team captain on a 375px Android inside the Instagram in-app browser, mid-conversation in another chat, deciding fast for eight to twelve people. Speed of comprehension outranks completeness of information everywhere the two conflict.

### Open input — the body face is Inter, and Inter is everywhere

Flagged by the design detector, recorded here rather than acted on. **Inter is one of a handful of faces that every AI-generated interface converges on**, so it contributes nothing to the personality the paragraph above credits to Orbitron. The display face is carrying the whole identity alone.

Not changed in Phase 1a for two reasons. It is a **stated brand commitment** — [PRODUCT.md](PRODUCT.md) records "Orbitron for display type, Inter for body" as given, not chosen — and body type is **Phase 1b task 1's decision**, which has not run. Overriding it here would pre-empt the task, and suppressing the finding would hide a real one.

So it is task 1's to settle, with three honest outcomes: keep Inter deliberately (it is genuinely excellent at 375px, and "invisible" is a defensible brief for a booking utility), replace it with a body face that shares Orbitron's athletic geometry, or confirm with the client that the commitment was a default rather than a preference. **What is not acceptable is inheriting it without noticing** — which is what would have happened had the detector not flagged it.

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

**Key Characteristics:**

- Light and blue-white, never dark — the anti-reference is binding
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

Spacing runs a **4px base**. Components use 4/8/12/16 for interior padding. **Section rhythm only ever uses 48/64/96/128** — fine control where it matters, strict rhythm where it shows. Sections separate with a `grey-200` hairline and alternating `grey-50` bands rather than with dividers or borders.

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

### Slot Cell — the signature component

**One column, full-width rows.** This is not a stylistic preference and must not be "improved" into a grid.

"Menunggu Konfirmasi" is 20 characters. A 3-column grid at 375px gives roughly 110px per cell and the label cannot fit at all; 2-column forces truncation. Full-width fits it at full size and yields a tap target far above minimum.

- **Layout:** time left, state right, 16px padding, 56px minimum height, 2px radius.
- **Available:** white fill, 1px `blue-600` border, navy text, label "Tersedia", `cursor: pointer`.
- **Hover:** fills `blue-50`. Available cells only.
- **Selected:** `blue-600` fill, white text, label "Dipilih".
- **Pending:** the amber triple, label "Menunggu Konfirmasi", `aria-disabled="true"`, `not-allowed`.
- **Booked / past:** the red triple, label "Terisi", `aria-disabled="true"`, `not-allowed`.

**The Visible-Unavailable Rule.** Disabled cells stay visible and legibly labelled. An organiser needs to see that 18.00 is taken, not wonder why the list skips it. Hiding an unavailable slot is never the answer.

**Elapsed slots are not booked slots, and the distinction is now the client's to make.** `GET /api/availability` returns `booked` for today's elapsed slots, so an earlier draft of this section concluded the client could not tell them apart and that separating them needed a `past` status in the API contract — a Phase 4 change.

That is resolved and the conclusion was wrong. The client already knows the current time and the canonical starts in `src/domain/slots.ts`, so it can derive "elapsed" itself without the API saying anything. `GET /api/availability` needs no `past` status and stays **FIRM**. The full reasoning and the chosen treatment — a collapsed `Sudah lewat (N)` group rather than nine rows labelled "Terisi" — are in the order-section brief at [`.impeccable/surfaces/app-page-tsx.md`](../.impeccable/surfaces/app-page-tsx.md).

Why it mattered enough to reopen: with same-day booking confirmed as the primary journey, a page opened at 19.00 rendered the whole day as "Terisi" and read as sold out. For a product measured on filling empty hours, that is the worst outcome the design can produce, and it was one derivation away from being avoidable.

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
- **Don't** add a second animation runtime beside GSAP, a Lottie file over 100KB, or an autoplaying video unless the Phase 1b hero-video gate passed.
- **Don't** animate layout properties (`width`, `height`, `top`, `left`).
- **Don't** let a component token point at a primitive. It must route through the semantic tier, including for state colour — that is the half that gets skipped.
- **Don't** use a neutral grey for secondary text on a coloured surface. Tint the mute from the surface's own hue.
- **Don't** put a kicker or eyebrow above a heading. The heading carries its own weight. Where the small label holds real information — `Layer 1`, `Layer 2` — fold it into the heading instead of setting it as a separate uppercase line above.
- **Don't** invent art direction here. It is Phase 1b task 1 and belongs to that task.
