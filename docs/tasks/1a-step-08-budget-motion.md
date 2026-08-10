# 1a · step 08 — Performance budget enforcement and the motion wrapper

**Depends**: 02 (a build must exist to measure), 07 (the last Phase 1a code that adds weight)
**Blocks**: Phase 1b and everything after — this is the Phase 1a gate
**Agent**: `software-engineer`

## Goal

Replace every estimated figure in the budget with a measured one, make a command enforce it, and land `src/lib/motion.ts` so no component can animate without a reduced-motion check.

## Step 02 already measured. This step enforces.

The numbers are settled and written into [architecture.md](../architecture.md). The estimates they replaced were 30% low — the framework alone measured **126.5KB against an estimated 90**, which put `/` at 208.6KB before a single component existed.

Two route-split decisions closed the gap: GSAP moved behind a lazy import in `src/lib/motion.ts` (−43.6KB) and axios became `/booking`-only (−17.5KB). The ceiling was raised 200 → **240KB** with those measurements in hand rather than ahead of them.

**The 147.5KB / ~92KB figures this paragraph used to quote are superseded.** They predate `cn()` (step 02b) and the query plumbing (step 07). Measured now: `/` is **137.0KB**, the projected subtotal once every installed library is actually reached is **156.4KB**. `docs/architecture.md` holds both and is the only place either belongs.

**Do not re-measure and re-decide. Enforce what is there.**

Three things step 02 resolved that this step must not reopen:

- **`react-icons` tree-shakes.** 2.2KB for six icons, measured. The extract-the-glyphs fallback is retired — do not implement it.
- **React Compiler costs 0KB.** Measured with it on and off. It stays enabled.
- **Three packages are `/booking`-only**: `react-hook-form`, `zod`, and axios. `/` uses native `fetch` from `src/modules/home/home.service.ts`.
- **`cn()` costs 8.2KB, measured in step 02b** (clsx 0.2 + tailwind-merge 8.0, isolated against a control probe). Kept deliberately; the clsx-only fallback is measured and is a one-file swap. Do not re-measure it.

The one thing genuinely still open is enforcement: nothing currently fails when a dependency pushes `/` past 240KB.

## Deliverables

**`pnpm check:budget`** — exits non-zero on breach, **per route**. A single global number hides the case this project actually cares about: `/booking`'s form libraries leaking into `/`.

**Where the number comes from is not what this file assumed.** It said "reads Next's per-route First Load JS from the build output". Next 16 removed that table, Turbopack emits no top-level `app-build-manifest.json`, and the per-route `.next/server/app/<route>/build-manifest.json` it does emit lists only the polyfill and shared root files — **the route's own chunk is missing from it**, which is exactly the number worth watching.

The **prerendered HTML** is the honest source: it is literally the list of scripts the browser is told to fetch for that route. Verified — `index.html` references all six chunks including the route chunk the manifest omits.

**The ceiling is read from `docs/architecture.md`, not copied into the script**, and an unparseable row is a failure rather than a fallback. That doc calls itself the single source; a check restating the limit would be one more copy to drift against.

**Measured figures written back** into the budget table, replacing the `~` estimates, and the resolved versions written back into the versions table.

**`src/lib/motion.ts`** — a single `gsap.matchMedia()` wrapper. GSAP has no built-in `prefers-reduced-motion` handling, which is the entire reason a direct `gsap.to()` in a component is banned. Also handle:

- React cleanup — see the correction below
- ScrollTrigger registration is client-only
- ScrollTrigger must refresh on navigation between `/` and `/booking` — App Router client transitions do not recalculate trigger positions

**`useGSAP()` from `@gsap/react` cannot be used, and this file was wrong to name it.** Its source opens `import gsap from "gsap"`, and it is a hook, so importing it means importing it **statically** — which puts the full 43.6KB back on first load and undoes the lazy decision this same step is enforcing. `useMotion` does directly what `useGSAP` wraps: `gsap.context()` for scoped cleanup, driven from a `useEffect` around a dynamic `import("gsap")`.

**`settle` is a required field, not a convention.** A `MotionSpec` cannot describe an animation without also saying what a reduced-motion visitor sees. Skipping the tween is not the answer — an entrance animation starts at `opacity: 0`, so "no animation" leaves the element invisible forever.

## The check must be proven to fail

```bash
pnpm build && pnpm check:budget          # passes, prints every route

# 1. lowered ceiling
pnpm check:budget --limit 50 ; echo "expect non-zero: $?"

# 2. THE CASE THE CHECK ACTUALLY EXISTS FOR — a legal import chain lint cannot see.
#    Add a client component to src/modules/home/components/ that calls
#    useAvailability, render it from src/app/page.tsx, rebuild.
#    / grows and no other route does. Revert.

# 3. no build at all
mv .next/server/app /tmp/ ; pnpm check:budget ; echo "expect non-zero: $?" ; mv /tmp/app .next/server/
```

## Acceptance

```bash
pnpm build
pnpm check:budget                        # exits 0, prints the per-route numbers it compared

# the route split holds where it matters — src/ paths, not the pre-02b ones
grep -rn "react-hook-form\|from \"zod\"" src/app/page.tsx src/components/ src/modules/home/
# expect: no match

# animation cannot bypass the wrapper. Static GSAP is an eslint error in every
# zone; the dynamic form is a check:docs failure outside motion.ts.
pnpm lint && pnpm check:docs
grep -n "matchMedia" src/lib/motion.ts

# and the lazy import is genuinely lazy
grep -rl "gsap\|ScrollTrigger" .next/static/   # expect: nothing until something animates
```

**Not done until** `check:budget` has been seen exiting non-zero **and** `grep -rl "gsap" .next/static/` returns nothing. A budget nothing measures is a wish; a lazy import that is not lazy is 43.6KB nobody notices.

handoff: `code-reviewer`, then `/plan-eng-review` and `/devex-review` — the Phase 1a gate
