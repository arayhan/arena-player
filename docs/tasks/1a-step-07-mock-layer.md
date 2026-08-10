# 1a · step 07 — Mock layer and data plumbing

**Depends**: 02 (repo runs), 05 (there is a contract to implement), 06 (the primitives it must import)
**Blocks**: Phase 2's order section and Phase 3's whole form — both build against this and never touch real data
**Agent**: `software-engineer`

## Goal

MSW v2 handlers implementing the API contract exactly, `QueryClientProvider`, and the shared axios instance. Phases 2 and 3 run entirely against this, so the site will look finished while taking zero real bookings.

## MSW v2, not v1

Training data gets this wrong. v2 is `http.get()` and `HttpResponse.json()`; v1's `rest.get()` and `res(ctx.json())` are gone. **Check the syntax against Context7 rather than recalling it** — `.mcp.json` wires it up for exactly this class of problem.

## Deliverables

**`src/mocks/handlers.ts`**

- `GET /api/availability?date=` — always all 9 slots, always canonical order, **derived from `TIME_SLOTS`**. A mock with its own hardcoded slot strings is a second source of truth that drifts silently and only surfaces when the real backend lands, which is why step 06 comes first
- Realistic mixed data, not all-available. Some `pending`, some `booked`, and at least one date that is fully booked so Phase 2 has to design that state
- `400` on a malformed date or one outside the 14-day window
- `POST /api/bookings` — must mock **all four** codes: `201`, `400` with a `fields` object, `409`, `429`. A code the mock cannot produce is a UI state Phase 3 builds blind

**Triggering the error paths deliberately.** Phase 3 needs to see a 409 on demand, not by luck. Pick a mechanism and write it down — a reserved team name, a specific slot, or a query flag — so the form's error states can be exercised repeatedly.

**Elapsed slots stay a client concern.** The contract says the server returns `booked` for today's passed hours, but the client derives elapsed itself and renders `Sudah lewat (N)` collapsed into one row. The mock implements the server side of that; it does not invent a `past` status.

**The data layer, split across four files rather than one folder** — the route split is structural now, so this step lands each piece where it belongs:

| File                               | Holds                                          |
| ---------------------------------- | ---------------------------------------------- |
| `src/services/api-client.ts`       | the axios instance — **`/booking` only**       |
| `src/modules/home/home.service.ts` | the availability GET, native `fetch`, no axios |
| `src/modules/home/home.queries.ts` | `useAvailability`                              |
| `src/lib/query-client.ts`          | the `QueryClient` factory and its defaults     |

No bare `fetch` in a component: components call `*.queries.ts`, which calls `*.service.ts`.

**`QueryClientProvider`** wired via `src/app/providers.tsx` (a client component) into the App Router layout, with deliberate defaults. `staleTime` matters: availability that never refetches shows a slot as free after someone else took it.

## The production trap

**MSW registers a service worker.** A stray `mockServiceWorker.js` in a production build intercepts real requests and serves fake availability — a site that looks entirely correct while showing invented data, with nothing in the console. Gate registration on `NODE_ENV` here, in this step, rather than adding it to Phase 4's retirement checklist and hoping.

## Acceptance

**The `curl` acceptance this block used to carry could never pass.** MSW is a
**service worker** — it intercepts browser fetches and nothing else, so `curl`
reaches Next's router and 404s no matter how correct the handlers are. The
paths were pre-`src/` too. Replaced with `msw/node`, which exercises the same
`handlers` array the browser uses.

```bash
# the handlers themselves, through setupServer — 9 slots, 400 out of window,
# and all four POST codes reachable on demand
pnpm check:unit

# the mock derives from the primitives rather than restating them
grep -n "06\.00\|08\.00" src/mocks/*.ts    # expect: no match outside comments
grep -n "TIME_SLOTS" src/mocks/*.ts        # expect: a match

# the service worker is gated, and the gate is a build-time constant
grep -n "NODE_ENV" src/app/providers.tsx

# THE ONE THAT MATTERS: msw must be absent from a production build
pnpm build
grep -rl "mockServiceWorker\|setupWorker\|onUnhandledRequest" .next/static/   # expect: nothing
grep -rl "TEST409\|availabilityFor" .next/static/                             # expect: nothing
```

**Not done until** both `.next/static/` greps return nothing. A hardcoded slot
string in the mock is the same defect class as a drifted copy in the admin
repo, just discovered later — and a mock that reaches production is the same
class again, discovered by a customer.

handoff: `code-reviewer`, then `software-engineer` for step 08
