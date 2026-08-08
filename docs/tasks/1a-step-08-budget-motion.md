# 1a · step 08 — Performance budget enforcement and the motion wrapper

**Depends**: 02 (a build must exist to measure), 07 (the last Phase 1a code that adds weight)
**Blocks**: Phase 1b and everything after — this is the Phase 1a gate
**Agent**: `software-engineer`

## Goal

Replace every estimated figure in the budget with a measured one, make a command enforce it, and land `lib/motion.ts` so no component can animate without a reduced-motion check.

## The budget table is currently a wish

Every number in [architecture.md](../architecture.md)'s breakdown is an estimate, and the doc says so: *"replace with measured values once `pnpm install` and a production build have actually run."* Step 02 took the first reading. This step makes it authoritative.

The estimated subtotal was ~179–182KB against a 200KB ceiling, leaving **~18–21KB for every component on both pages**. That is tight enough that it may not survive contact with a real build — in which case the resolution is a deliberate decision, not a quiet ceiling raise.

Two decisions already exist for that moment, so it is not debated under pressure:

- **The route split** — `/` must never load `react-hook-form` or `zod`. Together they are ~22KB, more than the entire headroom. This is named in `architecture.md` as *"the most likely fix"*
- **`react-icons`** — a re-export barrel chosen because it is the only set carrying a WhatsApp mark. If it fails to tree-shake even with `optimizePackageImports`, the agreed fallback is extracting the six used glyphs into `components/icons/` and dropping the dependency

## Deliverables

**`pnpm check:budget`** — reads Next's per-route First Load JS from the build output and exits non-zero on breach. Next already prints the number; this is parsing and comparing, not new tooling.

It must be **per route**, not just a total. A single global number hides the case this project actually cares about: `/booking`'s form libraries leaking into `/`.

**Measured figures written back** into the budget table, replacing the `~` estimates, and the resolved versions written back into the versions table.

**`lib/motion.ts`** — a single `gsap.matchMedia()` wrapper. GSAP has no built-in `prefers-reduced-motion` handling, which is the entire reason a direct `gsap.to()` in a component is banned. Also handle:
- `useGSAP()` from `@gsap/react` for React cleanup
- ScrollTrigger registration is client-only
- ScrollTrigger must refresh on navigation between `/` and `/booking` — App Router client transitions do not recalculate trigger positions

## The check must be proven to fail

```bash
pnpm build && pnpm check:budget          # passes

# plant a breach: temporarily lower the ceiling below the measured figure
pnpm check:budget --limit 50 ; echo "expect non-zero: $?"

# or import a form library into the landing route and confirm the split is enforced
# (revert immediately either way)
```

## Acceptance

```bash
pnpm build
pnpm check:budget                        # exits 0, and prints the per-route numbers it compared

# no estimate survives in the table
grep -n "~90\|~35\|replace with measured" docs/architecture.md   # expect: no match

# the route split holds where it matters
grep -rn "react-hook-form\|from \"zod\"" app/page.tsx components/   # expect: no match

# animation cannot bypass the wrapper
grep -rn "gsap\.\(to\|from\|fromTo\|timeline\)" components/ app/ | grep -v "lib/motion"
# expect: no match — every animation goes through lib/motion.ts

test -f lib/motion.ts && grep -n "matchMedia" lib/motion.ts
```

**Not done until** `check:budget` has been seen exiting non-zero. A budget nothing measures is a wish, and a check that has only ever passed is a check nobody has tested.

handoff: `code-reviewer`, then `/plan-eng-review` and `/devex-review` — the Phase 1a gate
