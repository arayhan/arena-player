---
name: arena-design
description: Use before any UI, styling, animation, or design work in arena-player-web. Brand tokens, animation budget, and performance guardrails.
---

# Arena Player — design gotchas

Full detail: [docs/DESIGN.md](../../../docs/DESIGN.md). This skill is the quick-reference — consult the doc for the complete token table, content map, and rationale, this file should not drift from it.

## Direction

Awwwards-level, light/clean/blue-white, oversized Orbitron display type, whitespace as a design element. INVERSE of the dark benchmark site — never dark neon.

## Hard limits (do not violate)

- **ASK BEFORE ANIMATING.** Every animation and micro-interaction — scroll reveals, hover/focus states, parallax, magnetic CTAs, slot-cell transitions, marquee behaviour, page transitions — is the user's choice via `AskUserQuestion`, asked BEFORE the code is written. Batch by section, not by element (one call per section covering its reveal + hover + transition choices). Use `preview` to show the motion, name effects precisely (the `animation-vocabulary` skill does reverse-lookup), and state each option's performance cost. Do NOT ask about `prefers-reduced-motion` fallbacks — mandatory, not a preference. If the user already named the effect, just build it.
- **Animation**: GSAP + ScrollTrigger + CSS `transform`/`opacity` only. No second animation runtime. No Lottie >100KB, no autoplay video unless the Phase 1b hero-video gate passed, no animating layout properties (causes CLS).
- **ONE WebGL moment** permitted, hero only — dynamically imported, static fallback, ≤ 40KB gzip, deletable in one commit. Full conditions in docs/architecture.md. The cap excludes three.js and pixi.js; use a GLSL fragment shader (~3–5KB) or OGL (~10KB).
- **`prefers-reduced-motion`** mandatory on every animated component, enforced through the `gsap.matchMedia()` wrapper in `lib/motion.ts`. Direct `gsap.to()` in a component is banned — GSAP has no built-in reduced-motion handling.
- **Mobile-first at 375px.** Order section (`id="order"`) reachable within 1–2 scrolls — hero ≤ 100svh, use `svh` not `vh` (in-app browsers lie about `vh`).
- **Performance**: LCP < 2.5s, Lighthouse mobile ≥ 85, no CLS. Stay inside the performance budget in docs/architecture.md.
- **No prices anywhere.** Rules section verbatim Indonesian from the PRD.

## Tokens (quick reference — full table in DESIGN.md)

Navy `#011A43`, accent `#2563EB`, white bg. Slot status: available = accent outline, pending = yellow ("Menunggu Konfirmasi"), booked/past = red/disabled.

## Images and icons

- **Need an image? Ask — do not substitute a gradient or placeholder box.** The user generates it externally and commits the file. Hand back: target path in `public/`, dimensions + format (WebP/AVIF, 375px-first), a ready-to-paste prompt, and what it is for.
- **Icons come from an icon library, never AI generation** — generated icons drift in stroke weight and optical grid.
- **AI imagery may be abstract/decorative only** (texture, gradient mesh, grain, pattern). Never anything a customer would read as a photo of the actual field — that misleads someone into booking a facility they have not seen. Real venue photos come from the client, `TODO(content)`.
- Hero LCP element stays text/logo, never an image. All images via `next/image` with explicit dimensions (no CLS).
- **Where files live**: reference/inspiration → `docs/references/` (gitignored scratch, deleted after use). Production assets → `public/`. Throwaway screenshots → `.claude/screenshots/` (gitignored).
- **`docs/references/` is usually EMPTY — that is normal, not an absence of references.** Files there are consumed and deleted once the work they informed is done. The durable record is `docs/DESIGN.md`; read that for benchmark and direction findings, never conclude "no benchmark exists" from an empty folder. If a reference file IS present, read it, write findings into DESIGN.md **before** deleting, and never `git add` anything under that path.

## Consulting order for new sections

1. `docs/DESIGN.md` (constraints, source of truth) → 2. `/impeccable` for direction and polish — the single named design driver, do not stack it with other aesthetic-direction skills on one section → 3. `/remotion-create` only for produced video assets. The constraints above override anything any skill suggests.
