---
name: arena-design
description: Use before any UI, styling, animation, or design work in arena-player-web. Brand tokens, animation budget, and performance guardrails.
---

# Arena Player — design gotchas

Full detail: [docs/design-system.md](../../../docs/design-system.md). This skill is the quick-reference — consult the doc for the complete token table, content map, and rationale, this file should not drift from it.

## Direction

Awwwards-level, light/clean/blue-white, oversized Orbitron display type, whitespace as a design element. INVERSE of the dark benchmark site — never dark neon.

## Hard limits (do not violate)

- **Animation**: Framer Motion + CSS `transform`/`opacity` only. No WebGL/three.js, no Lottie >100KB, no autoplay video, no animating layout properties (causes CLS).
- **`prefers-reduced-motion`** mandatory on every animated component.
- **Mobile-first at 375px.** Booking grid reachable within 1–2 scrolls — hero ≤ 100svh, use `svh` not `vh` (in-app browsers lie about `vh`).
- **Performance**: LCP < 2.5s, Lighthouse mobile ≥ 85, no CLS.
- **No prices anywhere.** Rules section verbatim Indonesian from the PRD.

## Tokens (quick reference — full table in design-system.md)

Navy `#011A43`, accent `#2563EB`, white bg. Slot status: available = accent outline, pending = yellow ("Menunggu Konfirmasi"), booked/past = red/disabled.

## Consulting order for new sections

1. `docs/design-system.md` (constraints, source of truth) → 2. Design/style reference tools for palette or motion ideas → 3. Aesthetic-direction tools for polish. The constraints above override anything those suggest.
