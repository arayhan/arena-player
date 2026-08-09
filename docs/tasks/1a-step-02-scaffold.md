# 1a · step 02 — Scaffold

**Depends**: 01 (installs the libraries it chose)
**Blocks**: 03, 04, 06, 07, 08 — everything downstream needs a repo that runs
**Agent**: `software-engineer`

> **Superseded paths.** This step ran before step 02b moved everything under `src/` and renamed `lib/shared/` to `src/domain/`. Paths below are left as they were when the work happened — this is a record, not a spec. Current layout: [architecture.md](../architecture.md).


## Goal

Next.js 16 App Router + TypeScript + Tailwind, installed with pnpm, serving at `localhost:3000`. Nothing product-shaped ships here — no page content, no components beyond what the scaffold generates.

## Deliverables

- `pnpm create next-app` with App Router and TypeScript, Tailwind enabled
- Every package from the versions table in [architecture.md](../architecture.md), resolved at install rather than pinned from memory — the table says "latest, resolve at install" for a reason
- `packageManager` pinned to the exact pnpm version once resolved
- `server-only` installed. It is not decorative: importing it in `lib/db/` and `lib/storage/` later makes the build **fail** if a client component reaches a secret, which is how hard rule 4 stops being honour-system
- Folder skeleton matching the tree in `architecture.md` — `app/`, `components/`, `lib/`, `mocks/`, `scripts/`
- `.env.local` created from `.env.local.example` and confirmed gitignored

## Two things to get right

**GSAP's licence must be verified at install**, not assumed from memory. This is a paid client project, so the commercial terms are a commercial check.

**`db/README.md` does not exist** but `.env.local.example` and `database.md` both point at it. Either create it in this step or fix both pointers — a dead link is the first thing a new developer hits.

## Acceptance

```bash
pnpm install                       # completes clean
pnpm dev                           # serves http://localhost:3000
curl -sI localhost:3000 | head -1  # expect: HTTP/1.1 200

# every stack package is present and no extras crept in
node -e "const d=require('./package.json');console.log(Object.keys({...d.dependencies,...d.devDependencies}).sort().join('\n'))"
# cross-check against the versions table in docs/architecture.md

# secrets cannot be committed
git check-ignore -v .env.local     # expect: matched by .gitignore
grep -c "packageManager" package.json   # expect: 1

# the dead pointer is resolved
test -f db/README.md && echo "db/README.md exists" || grep -rn "db/README.md" .env.local.example docs/database.md
```

**Not done until** `pnpm dev` serves a page and `pnpm install` runs clean from a fresh clone.

## First real budget reading

Once a production build runs, record the actual First Load JS against the ≤240KB gzip line in `architecture.md`. Every figure in that table is currently an estimate marked "replace with measured values". This is the first moment they can be measured — step 08 verifies them, but the number comes from here.

```bash
pnpm build   # note the per-route First Load JS it prints
```

### Settle the react-icons gamble here, with a number

`react-icons` was chosen in step 01 because it is the only set carrying all six icons including a WhatsApp mark. It is a re-export barrel, so tree-shaking is a real risk against ~18–21KB of headroom — and if it fails, six icons cost far more than six icons.

Measure it rather than assume it. Build once without the probe for a baseline, then:

```tsx
// app/_probe/page.tsx — DELETE before this step ends
import { FaWhatsapp } from 'react-icons/fa'
import { FiCalendar, FiClock, FiUpload, FiCheck, FiMapPin } from 'react-icons/fi'
export default function P() {
  return <><FaWhatsapp/><FiCalendar/><FiClock/><FiUpload/><FiCheck/><FiMapPin/></>
}
```

`pnpm build`, diff the probe route's First Load JS against the baseline, delete the probe. If the delta is bad, set `experimental.optimizePackageImports: ['react-icons']` in `next.config` and measure again.

**Agreed fallback if it still breaches** — decided in advance so it is not argued later: extract the six used glyphs into `components/icons/*.tsx` and drop the dependency. Same rendering, ~1KB, and the paths come from the installed package rather than being drawn by hand.

Do the same for `date-fns` v4 + `@date-fns/tz`, and **verify its API against Context7** — the v4 `{ in: tz('Asia/Jakarta') }` form is newer than reliable recall.

handoff: `software-engineer` for step 03
