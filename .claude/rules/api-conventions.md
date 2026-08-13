# API conventions — route handlers and the client edge

Read before touching anything under `src/app/api/`, `src/server/`, `src/mocks/`, or a `*.service.ts`.

**Authority:** the contract itself — exact field names, response shapes, status codes — lives in [architecture.md](../../docs/architecture.md) and is normative. This file holds the _conventions_ for implementing against it, which that document does not state. Postgres error codes and Neon/R2 gotchas belong to the `arena-player-database` skill. The race condition is [CLAUDE.md](../../CLAUDE.md) hard rule 1 and outranks everything here.

---

## Never check-then-insert

The only thing preventing a double booking is the partial unique index `uniq_active_slot`. Not a query. Not a transaction you wrote. The index.

```ts
// WRONG — two requests both pass the check, both insert, field is double-booked
const existing = await db`select 1 from bookings where ...`;
if (existing.length) return conflict();
await db`insert into bookings ...`;

// RIGHT — let the database arbitrate, then translate its answer
try {
  await db`insert into bookings ...`;
} catch (e) {
  if (isUniqueViolation(e)) return conflict(); // 23505 → 409
  throw e;
}
```

The window between the check and the insert is small, and this product's whole promise is that it cannot silently double-book. **Insert, catch `23505`, return 409.**

A retried POST is a second insert attempt. Mutations therefore retry **zero** times — that setting in `query-client.ts` is a correctness decision, not tuning.

---

## Validate at the edge, reject at the API

Two functions, deliberately both existing:

| Function        | Where        | Behaviour                                                 |
| --------------- | ------------ | --------------------------------------------------------- |
| `canonicalSlot` | client edge  | **repairs** a near miss, returns `null` if unrecognisable |
| `isTimeSlot`    | API boundary | **rejects** anything not exactly in `TIME_SLOTS`          |

Canonicalise where user or URL text _enters_ the client. Reject at the API.

An API that silently repairs means a caller sending the wrong format never learns, and the one place the format is enforced becomes the route handler nobody has written yet. `uniq_active_slot` compares `time_slot` as **text** — `"20.00-22.00"` and `"20.00 - 22.00"` are different slots to the database, so a repaired value is a real defect, not a kindness.

The MSW handler is the rehearsal for the Phase 4 route. It has to be as strict as that route must be — a mock that accepts more than the real thing teaches the client bad habits that only surface in production.

---

## Status codes are not interchangeable

| Code | Means                        | Must render as                                          |
| ---- | ---------------------------- | ------------------------------------------------------- |
| 201  | booked                       | success                                                 |
| 400  | validation failed            | field-level errors, mapped back via the `fields` object |
| 409  | somebody took the slot first | the slot is **gone** — offer another                    |
| 429  | too many requests            | **nothing is wrong with the booking** — wait and retry  |

**409 and 429 must differ in copy _and_ colour family.** Telling a rate-limited user their slot is gone sends them to pick a different time they did not need to pick. The two share no wording and no palette — 429 uses the amber (warning) triple, 409 the danger one.

**400 carries `fields`, and the client must use it.** Map each entry back onto its input with `aria-invalid` and `aria-describedby`, rather than showing one generic banner. See [accessibility.md](accessibility.md).

---

## Errors are answers, not exceptions

The axios instance sets `validateStatus: (s) => s < 500`. 400, 409 and 429 are **expected outcomes with different UI** — turning them into thrown exceptions loses the response body holding `fields`, and forces the caller into try/catch for the normal path.

Reserve throwing for what is genuinely broken: 5xx, network failure, a malformed body.

---

## Server-only means server-only

`DATABASE_URL` and the R2 credentials never reach client code and are never `NEXT_PUBLIC_*`. Every file in `src/server/` starts with `import "server-only"` so the **build** fails rather than the review catching it.

The browser never touches Neon or R2. Only route handlers do.

---

## The mock must not survive into production

MSW registers a service worker. A stray `mockServiceWorker.js` in a production build intercepts real requests and serves fake availability — and it fails **silently**, looking like a working site showing wrong data.

The gate is `process.env.NODE_ENV`, compared so the bundler **inlines** it: in a production build the branch is a literal `false` and the dynamic `import("@/mocks/browser")` is never emitted, so msw is not in any page's module graph rather than merely unreached. A runtime flag would ship the mock and then trust a value.

Verify against the built artifact, never the source:

```bash
grep -rl "mockServiceWorker\|setupWorker\|onUnhandledRequest" .next/static/   # must return nothing
```

`onUnhandledRequest` is `"bypass"` so an un-mocked call fails like a real one instead of being swallowed.
