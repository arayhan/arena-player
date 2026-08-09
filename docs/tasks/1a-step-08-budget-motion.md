# 1a · step 08 — Performance budget enforcement and the motion wrapper

**Depends**: 02 (a build must exist to measure), 07 (the last Phase 1a code that adds weight)
**Blocks**: Phase 1b and everything after — this is the Phase 1a gate
**Agent**: `software-engineer`

## Goal

Replace every estimated figure in the budget with a measured one, make a command enforce it, and land `src/lib/motion.ts` so no component can animate without a reduced-motion check.

## Step 02 already measured. This step enforces.

The numbers are settled and written into [architecture.md](../architecture.md). The estimates they replaced were 30% low — the framework alone measured **126.5KB against an estimated 90**, which put `/` at 208.6KB before a single component existed.

Two route-split decisions closed the gap: GSAP moved behind a lazy import in `src/lib/motion.ts` (−43.6KB) and axios became `/booking`-only (−17.5KB). `/` now sits at **147.5KB**, and the ceiling was raised 200 → **240KB** with those measurements in hand rather than ahead of them. Headroom is **~92KB**.

**Do not re-measure and re-decide. Enforce what is there.**

Three things step 02 resolved that this step must not reopen:

- **`react-icons` tree-shakes.** 2.2KB for six icons, measured. The extract-the-glyphs fallback is retired — do not implement it.
- **React Compiler costs 0KB.** Measured with it on and off. It stays enabled.
- **Three packages are `/booking`-only**: `react-hook-form`, `zod`, and axios. `/` uses native `fetch` from `src/modules/home/home.service.ts`.
- **`cn()` costs 8.2KB, measured in step 02b** (clsx 0.2 + tailwind-merge 8.0, isolated against a control probe). Kept deliberately; the clsx-only fallback is measured and is a one-file swap. Do not re-measure it.

The one thing genuinely still open is enforcement: nothing currently fails when a dependency pushes `/` past 240KB.

## Deliverables

**`pnpm check:budget`** — reads Next's per-route First Load JS from the build output and exits non-zero on breach. Next already prints the number; this is parsing and comparing, not new tooling.

It must be **per route**, not just a total. A single global number hides the case this project actually cares about: `/booking`'s form libraries leaking into `/`.

**Measured figures written back** into the budget table, replacing the `~` estimates, and the resolved versions written back into the versions table.

**`src/lib/motion.ts`** — a single `gsap.matchMedia()` wrapper. GSAP has no built-in `prefers-reduced-motion` handling, which is the entire reason a direct `gsap.to()` in a component is banned. Also handle:

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
# expect: no match — every animation goes through src/lib/motion.ts

test -f src/lib/motion.ts && grep -n "matchMedia" src/lib/motion.ts
```

**Not done until** `check:budget` has been seen exiting non-zero. A budget nothing measures is a wish, and a check that has only ever passed is a check nobody has tested.

handoff: `code-reviewer`, then `/plan-eng-review` and `/devex-review` — the Phase 1a gate
