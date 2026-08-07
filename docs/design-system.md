# Arena Player — Design System

Direction: Awwwards-level, light/clean/blue-white, oversized Orbitron display type, whitespace as a design element. INVERSE of the dark benchmark (bataskotapoint.com) — never dark neon.

## Tokens (CSS variables, define once in globals.css)

| Token | Value | Use |
|---|---|---|
| `--navy` | `#011A43` | Primary, from logo |
| `--accent` | `#2563EB` | Interactive, links, available slots |
| `--bg` | `#FFFFFF` | Background |

Slot status colors:

| State | Style | Label |
|---|---|---|
| Available | Accent-blue outline | — |
| Pending | Yellow, disabled | "Menunggu Konfirmasi" |
| Booked | Red, disabled | — |
| Past (today only) | Same as booked | — |

## Typography

Orbitron (display/headings) + Inter (body), both via `next/font/google`. Never load fonts from a CDN `<link>` — the whole point of `next/font` is self-hosting + zero layout shift from webfont loading.

## Animation budget (hard limits)

**Allowed**: GSAP + ScrollTrigger, CSS `transform`/`opacity`, scroll-driven reveals, pinned and scrubbed sequences, hero parallax, marquee strip (CSS `@keyframes`, not GSAP), magnetic CTAs, slot-cell state transitions, smooth scroll.

**Permitted exception — one WebGL moment**, hero only, under the full conditions in [architecture.md](architecture.md): dynamically imported after the order section is interactive, static fallback rendered first, disabled under reduced-motion and Save-Data, **≤ 40KB gzip**, deletable in one commit. That cap excludes three.js (~150KB) and pixi.js (~140KB) — reach for a GLSL fragment shader on a fullscreen quad (~3–5KB, no library) or OGL (~10KB).

**Forbidden**: Lottie files over 100KB, autoplaying video (unless the Phase 1b hero-video gate passes), animating layout properties (`width`/`height`/`top`/`left` — causes CLS), a second animation runtime alongside GSAP.

**Every** animated component goes through the `gsap.matchMedia()` wrapper in `lib/motion.ts`. GSAP has no built-in equivalent of Framer's reduced-motion hook, so calling `gsap.to()` directly in a component is banned — that is exactly how one component ships without the check. Reduced = static or opacity-only. No CLS: reserve space before animating in, animate `transform` only, never trigger reflow.

All of the above stays inside the performance budget in [architecture.md](architecture.md) — that table is the single source; do not restate its numbers here.

## Choosing motion — ask, don't decide

**Every animation and micro-interaction is the user's choice, presented with `AskUserQuestion` before the code is written.** Motion is the most taste-driven part of this build, and implementing an effect then asking turns a tweak into a rewrite.

Covers: scroll reveals, hover and focus states, parallax, magnetic CTAs, slot-cell state transitions, marquee speed and direction, page transitions, loading and skeleton motion.

How to ask so it stays useful rather than becoming noise:

- **Batch by section, never by element.** One call covering that section's reveal, hover, and transition choices together — not a separate prompt per button. Five sections × per-element prompts is death by a thousand questions.
- **Ask before writing**, at the point the section's motion is being designed.
- **Use the `preview` field** so each option shows its motion concretely instead of relying on adjectives.
- **Name effects precisely** — "Pop in", "Rubber-banding", "Staggered fade-up". The `animation-vocabulary` skill does reverse-lookup when the right term is unclear; vague labels make the options impossible to choose between.
- **State each option's performance cost**, since every section faces the per-section Lighthouse gate.

**Do not ask about `prefers-reduced-motion` fallbacks** — those are mandatory (see the animation budget above), not a preference. And if a specific effect has already been named, just build it.

## Mobile guardrails (primary traffic = Instagram in-app browser, 375px)

- Design 375px first, scale up to 1440px.
- Order section reachable within 1–2 scrolls — hero must not push it down. Hero ≤ 100svh (use `svh` not `vh`; in-app browsers lie about `vh`).
- Date pills: horizontal scroll with `overscroll-behavior-x: contain`.
- LCP < 2.5s: hero text/logo is the LCP element — no image LCP, preload the display font. Prefer `font-display: optional` on Orbitron if CLS appears from swap.
- Lighthouse mobile Performance ≥ 85. Marquee via CSS `@keyframes translate` on a duplicated strip, not JS `requestAnimationFrame`.

## Landing page content map (copy source of truth is [PRD.md](PRD.md), don't fork wording between docs)

Rendered top to bottom:

1. Hero — logo, headline, subheadline, CTA "Pesan Lapangan," scroll-driven entrance.
2. Order section (`id="order"`) — date pills + slot grid, the product.
3. Rules ("Ketentuan") — 10 verbatim Indonesian rules.
4. Location & Contact — address, maps embed, hours, WhatsApp button.
5. CTA Footer + Footer — closing CTA back to `#order`, logo, copyright, minimal links.

**Built** in a different order — layout → order → hero → content → footer. The order section carries all the state and data-fetching risk, so it gets built first and iterated most. Rendered position is unaffected.

## Logo / asset placeholders

Generated SVG AP monogram (navy `#011A43`) until the client provides the real logo file. Favicon + OG image generated from the same placeholder. Swap is a `TODO(content)` item — see [PRD.md](PRD.md) placeholder categories.

## Getting images made (workflow)

**Do not silently substitute a gradient or a grey box to avoid asking for an image.** The user generates images through their own AI tooling and commits the file. When a design needs one, hand over a request containing all four of:

1. **Target path** — `public/<name>.<ext>`
2. **Dimensions + format** — WebP or AVIF, sized for 375px first, 2× for retina
3. **A complete, ready-to-paste prompt**
4. **What it is for**, so the result can be judged against the design

Then wire it up once the file lands.

**Icons are the exception — use an icon library, never AI generation.** Generated icons drift in stroke weight and optical grid, so a set of them never looks like a set. The needed icons are few (calendar, clock, upload, check, WhatsApp, map pin). Picking the library is a Phase 1a decision since it is a dependency and must clear the performance budget — favour one with per-icon tree-shaking so unused icons cost nothing.

### What AI imagery may and may not depict

This is a booking page for a real venue that real customers pay to use.

- **Fine**: abstract and decorative work — background textures, gradient meshes, grain, pattern, atmospheric shapes.
- **Not fine**: anything a customer would reasonably read as *this specific field*. A generated photo of "a mini soccer field" on a booking page misleads someone into booking a facility they have not actually seen. Real venue photos come from the client, and stay `TODO(content)` until they arrive.

### Where visual files live

| Kind | Location |
|---|---|
| Reference / inspiration — benchmark screenshots, icon style examples, hero and banner inspiration, moodboards | `docs/references/` — **gitignored scratch, deleted after use**; see its README |
| Production assets — logo, favicon, OG image, anything shipped | `public/` |
| Throwaway "does this look right" screenshots | `.claude/screenshots/` (gitignored) |

**Findings from a reference image get written into this document before the source file is deleted.** Reference files are never committed and do not survive the work they informed, so an observation left only in the image is an observation lost. `docs/references/` being empty means the references were consumed, not that none existed — **this document is the durable record, that folder is only a staging area.**

### Image performance rules

- The hero LCP element stays **text/logo** — never an image (see the mobile guardrails above).
- Every image goes through `next/image` with explicit `width`/`height` so it reserves space and contributes no CLS.
- Image weight counts against the LCP budget in [architecture.md](architecture.md) even though that table measures JS. A 400KB hero JPEG defeats a 200KB JS budget.

## Consulting order for new sections

1. This doc (constraints) → 2. `/impeccable` for direction and polish → 3. `/remotion-create` if a section needs produced animation assets. `/impeccable` is the single named design driver — do not stack it with other aesthetic-direction skills on the same section, since three skills opining on direction produce three directions. Constraints here override anything any skill suggests — a skill may propose a dark theme (rejected outright) or an unbounded WebGL scene (only the single capped hero moment above is permitted).
