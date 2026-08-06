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

**Allowed**: Framer Motion, CSS `transform`/`opacity`, scroll-driven reveals, hero parallax, marquee strip, magnetic CTAs, slot-cell state transitions, smooth scroll.

**Forbidden**: WebGL, three.js, Lottie files over 100KB, autoplaying video, animating layout properties (`width`/`height`/`top`/`left` — causes CLS).

**Every** animated component checks `prefers-reduced-motion` (Framer's `useReducedMotion` or the CSS media query). Reduced = static or opacity-only. No CLS: reserve space before animating in, animate `transform` only, never trigger reflow.

## Mobile guardrails (primary traffic = Instagram in-app browser, 375px)

- Design 375px first, scale up to 1440px.
- Booking grid reachable within 1–2 scrolls — hero must not push it down. Hero ≤ 100svh (use `svh` not `vh`; in-app browsers lie about `vh`).
- Date pills: horizontal scroll with `overscroll-behavior-x: contain`.
- LCP < 2.5s: hero text/logo is the LCP element — no image LCP, preload the display font. Prefer `font-display: optional` on Orbitron if CLS appears from swap.
- Lighthouse mobile Performance ≥ 85. Marquee via CSS `@keyframes translate` on a duplicated strip, not JS `requestAnimationFrame`.

## Landing page content map (6 sections — copy source of truth is [PRD.md](PRD.md), don't fork wording between docs)

1. Hero — logo, headline, subheadline, CTA "Pesan Lapangan," scroll-driven entrance.
2. Booking section — date pills + slot grid, the product.
3. Rules ("Ketentuan") — 10 verbatim Indonesian rules.
4. Location & Contact — address, maps embed, hours, WhatsApp button.
5. CTA Footer — closing CTA back to booking.
6. Footer — logo, copyright, minimal links.

## Logo / asset placeholders

Generated SVG AP monogram (navy `#011A43`) until the client provides the real logo file. Favicon + OG image generated from the same placeholder. Swap is a `TODO(phase2)` item — see [PRD.md](PRD.md) placeholder categories.

## Consulting order for new sections

1. This doc (constraints) → 2. Design-tool skills/references for style/palette/motion ideas → 3. Aesthetic-direction skills for polish. Constraints here override anything those suggest — e.g. they may propose dark themes or WebGL, which are explicitly rejected above.
