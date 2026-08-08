# 1a · step 07 — Mock layer and data plumbing

**Depends**: 02 (repo runs), 05 (there is a contract to implement), 06 (the primitives it must import)
**Blocks**: Phase 2's order section and Phase 3's whole form — both build against this and never touch real data
**Agent**: `software-engineer`

## Goal

MSW v2 handlers implementing the API contract exactly, `QueryClientProvider`, and the shared axios instance. Phases 2 and 3 run entirely against this, so the site will look finished while taking zero real bookings.

## MSW v2, not v1

Training data gets this wrong. v2 is `http.get()` and `HttpResponse.json()`; v1's `rest.get()` and `res(ctx.json())` are gone. **Check the syntax against Context7 rather than recalling it** — `.mcp.json` wires it up for exactly this class of problem.

## Deliverables

**`mocks/handlers.ts`**
- `GET /api/availability?date=` — always all 9 slots, always canonical order, **derived from `TIME_SLOTS`**. A mock with its own hardcoded slot strings is a second source of truth that drifts silently and only surfaces when the real backend lands, which is why step 06 comes first
- Realistic mixed data, not all-available. Some `pending`, some `booked`, and at least one date that is fully booked so Phase 2 has to design that state
- `400` on a malformed date or one outside the 14-day window
- `POST /api/bookings` — must mock **all four** codes: `201`, `400` with a `fields` object, `409`, `429`. A code the mock cannot produce is a UI state Phase 3 builds blind

**Triggering the error paths deliberately.** Phase 3 needs to see a 409 on demand, not by luck. Pick a mechanism and write it down — a reserved team name, a specific slot, or a query flag — so the form's error states can be exercised repeatedly.

**Elapsed slots stay a client concern.** The contract says the server returns `booked` for today's passed hours, but the client derives elapsed itself and renders `Sudah lewat (N)` collapsed into one row. The mock implements the server side of that; it does not invent a `past` status.

**`lib/api/`** — the axios instance and the TanStack Query hooks. No bare `fetch` in a component.

**`QueryClientProvider`** wired in the App Router layout, with deliberate defaults. `staleTime` matters: availability that never refetches shows a slot as free after someone else took it.

## The production trap

**MSW registers a service worker.** A stray `mockServiceWorker.js` in a production build intercepts real requests and serves fake availability — a site that looks entirely correct while showing invented data, with nothing in the console. Gate registration on `NODE_ENV` here, in this step, rather than adding it to Phase 4's retirement checklist and hoping.

## Acceptance

```bash
pnpm dev
curl -s "localhost:3000/api/availability?date=$(date +%Y-%m-%d)" | node -e "
  const d=JSON.parse(require('fs').readFileSync(0));
  console.log('count:', d.length, '| statuses:', [...new Set(d.map(x=>x.status))].join(','))"
# expect: count: 9, and more than one distinct status

# the mock derives from the primitives rather than restating them
grep -n "06.00\|08.00" mocks/handlers.ts   # expect: no match — it must import TIME_SLOTS
grep -n "TIME_SLOTS" mocks/handlers.ts     # expect: a match

# all four POST codes are reachable
grep -cE "201|400|409|429" mocks/handlers.ts

# out-of-window dates are rejected, not served
curl -s "localhost:3000/api/availability?date=2030-01-01"   # expect: {"error":"invalid_date"}

# the service worker is gated
grep -n "NODE_ENV" mocks/*.ts app/**/*.tsx | head
```

**Not done until** the first grep returns nothing. A hardcoded slot string in the mock is the same defect class as a drifted copy in the admin repo, just discovered later.

handoff: `code-reviewer`, then `software-engineer` for step 08
