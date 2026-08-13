---
name: arena-player-design
description: Use before any UI, styling, animation, or design work in arena-player-web. Brand tokens, animation budget, and performance guardrails.
---

# Arena Player — design gotchas

Two docs, not one. [docs/DESIGN.md](../../../docs/DESIGN.md) is the visual system — tokens, type, components, do's and don'ts. [docs/design-process.md](../../../docs/design-process.md) is how design work _runs_ — motion approval, image sourcing, the animation budget, asset locations, the landing page content map, and the consulting order. This skill is the quick-reference for both and should not drift from either.

## Direction — DECIDED. Execute it, do not reopen it

**This section said "mostly NOT decided yet" until 2026-08-13 and instructed you to STOP if the art direction was missing from DESIGN.md.** It has been there since 2026-08-12. An agent obeying the old text would have halted on a finished page — which is why a skill file that asserts project state, rather than pointing at where state lives, is a liability. Prefer a pointer to a copy in everything below.

**The north star is velocity: the page leans on the logo's own axis.** One skew value (`--skew: -8deg`), one gradient angle (`--diag: 168deg`), applied to a fixed list of elements. A second skew value anywhere is a defect, not a variation. The hero is a navy "pelat enamel" plate — flat saturated fields, hard edges, no gradients. Read [DESIGN.md](../../../docs/DESIGN.md) → Overview for the whole thing; it is the authority and this paragraph is a signpost.

**Typefaces: Panchang display over Plus Jakarta Sans body.** Changed twice — Orbitron → Saira (2026-08-12) → Panchang (2026-08-13). Panchang loads at **500, 700 and 800 only** and has **no width axis**, so never ask for a weight of 900 or set `font-stretch` on it: neither fails loudly, and both make every document quoting them wrong. `pnpm check:docs` now guards the family name via `typeface-drift`.

**Still owed, and no work here closes it: client re-approval.** The client approved the light-only direction on 2026-08-11 and has not seen this one. Nothing may be presented as client-approved.

## Hard limits (do not violate)

- **ASK BEFORE ANIMATING.** Every animation and micro-interaction — scroll reveals, hover/focus states, parallax, magnetic CTAs, slot-cell transitions, marquee behaviour, page transitions — is the user's choice via `AskUserQuestion`, asked BEFORE the code is written. Batch by section, not by element (one call per section covering its reveal + hover + transition choices). Use `preview` to show the motion, name effects precisely (the `animation-vocabulary` skill does reverse-lookup), and state each option's performance cost. Do NOT ask about `prefers-reduced-motion` fallbacks — mandatory, not a preference. If the user already named the effect, just build it.
- **Animation**: GSAP + ScrollTrigger + CSS `transform`/`opacity` only. No second animation runtime. No Lottie >100KB, no autoplay video unless the Phase 1b hero-video gate passed, no animating layout properties (causes CLS).
- **ONE WebGL moment** permitted, hero only — dynamically imported, static fallback, ≤ 40KB gzip, deletable in one commit. Full conditions in docs/architecture.md. The cap excludes three.js and pixi.js; use a GLSL fragment shader (~3–5KB) or OGL (~10KB).
- **`prefers-reduced-motion`** mandatory on every animated component, enforced through the `gsap.matchMedia()` wrapper in `src/lib/motion.ts`. Direct `gsap.to()` in a component is banned — GSAP has no built-in reduced-motion handling.
- **Mobile-first at 375px.** Order section (`id="order"`) reachable within 1–2 scrolls. Use `svh` not `vh` (in-app browsers lie about `vh`). **The hero's `≤ 100svh` cap is gone** — the user removed it on 2026-08-13 as limiting; the plate takes the height its content needs. The two-scroll rule itself is unchanged and still binds.
- **Performance**: LCP < 2.5s, Lighthouse mobile ≥ 85, no CLS. Stay inside the performance budget in docs/architecture.md. **Currently failing** — the mobile median is 71, deferred by the user while the visual direction settles.
- **No prices on `/`. `/booking` is the exception** — the client settled this 2026-08-11: a real rupiah amount appears there, once the visitor has arrived through the WhatsApp link. The rate card has not been supplied, so the figure is a content placeholder and **no number may be invented** — it is the one placeholder a visitor would act on.
- **Rules section verbatim Indonesian from the PRD.** Ten rules, never reworded; `check:docs` compares them character for character.

## Tokens — the rules, not the values

Navy `#011A43` and accent `#2563EB` are client brand commitments and stable. **Everything else lives in [DESIGN.md](../../../docs/DESIGN.md) → Colors and must not be copied here** — those values moved four times in a single day and this file has no way to notice when they move again.

That is not hypothetical. An earlier version of this line named a single hue for the pending state, which was the unreadable-contrast failure DESIGN.md had already been rewritten to eliminate. The corrected value never reached this file, because a copied value has nothing checking it.

The rules that do belong here, because they are stable:

- **A state is a surface + border + ink triple, never a single hue.** A booking state the user cannot read is a booking state they will get wrong — "Menunggu Konfirmasi" is information, not decoration.
- **Elapsed is not booked.** The client derives elapsed hours from the current time and the canonical slot starts, then collapses them into one row. They never render as taken — at 19.00 that made the whole day read as sold out, which is the worst outcome for a product measured on filling empty slots.
- **Component CSS routes through the semantic tier.** A component rule reaching a raw hue is a defect, not a shortcut; a finish review caught exactly that as a P0 on the one page that teaches the layering rule.
- **A border carrying a state by itself must clear 3:1** (WCAG 1.4.11). Pair it with a fill so the signal never depends on one property or on hue alone.

## Images and icons

- **Need an image? Ask — do not substitute a gradient or placeholder box.** The user generates it externally and commits the file. Hand back: target path in `public/`, dimensions + format (WebP/AVIF, 375px-first), a ready-to-paste prompt, and what it is for.
- **Icons come from an icon library, never AI generation** — generated icons drift in stroke weight and optical grid.
- **AI imagery may be abstract/decorative only** (texture, gradient mesh, grain, pattern). Never anything a customer would read as a photo of the actual field — that misleads someone into booking a facility they have not seen. Real venue photos come from the client, `TODO(content)`.
- Hero LCP element stays text/logo, never an image. All images via `next/image` with explicit dimensions (no CLS).
- **Where files live**: reference/inspiration → `docs/references/` (gitignored scratch, deleted after use). Production assets → `public/`. Throwaway screenshots → `.claude/screenshots/` (gitignored).
- **`docs/references/` is usually EMPTY — that is normal, not an absence of references.** Files there are consumed and deleted once the work they informed is done. The durable record is `docs/DESIGN.md`; read that for benchmark and direction findings, never conclude "no benchmark exists" from an empty folder. If a reference file IS present, read it, write findings into DESIGN.md **before** deleting, and never `git add` anything under that path.

## Consulting order

Lives in [design-process.md](../../../docs/design-process.md) → Consulting order, and is deliberately **not** copied here — a duplicated list is a list that drifts. The one thing worth repeating: the constraints above override anything any skill suggests.
