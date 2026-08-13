# Code style — naming, placement, component patterns

Read before writing any code. These are the conventions an agent cannot infer from the code itself.

**Authority:** this file is the single source for naming, file placement, and component patterns. Where a rule belongs to another document it is linked, never copied — [CLAUDE.md](../../CLAUDE.md) hard rules win over everything here, [architecture.md](../../docs/architecture.md) owns folder rationale and the API contract, [DESIGN.md](../../docs/DESIGN.md) owns anything visual.

---

## Naming

| Kind          | Convention                                                             | Example                                         |
| ------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| Module file   | `<module>.<role>.ts`                                                   | `home.service.ts`, `booking-form.schema.ts`     |
| Component     | `PascalCase.tsx`, matching the export                                  | `OrderSection.tsx` → `OrderSection`             |
| Hook          | `use-<thing>.ts` in `src/hooks/`, or `<module>.queries.ts` in a module | `use-media-query.ts`, `home.queries.ts`         |
| Test          | colocated `<file>.test.ts`, beside what it covers                      | `slots.ts` → `slots.test.ts`                    |
| Route handler | `route.ts` under its path segment                                      | `src/app/api/availability/route.ts`             |
| Domain module | plain noun, no suffix                                                  | `slots.ts`, `dates.ts`, `status.ts`, `phone.ts` |

### The role suffixes

Nine are in use, one is reserved:

| Role        | Holds                                   | Example                  |
| ----------- | --------------------------------------- | ------------------------ |
| `service`   | the transport call                      | `home.service.ts`        |
| `queries`   | TanStack Query hooks                    | `home.queries.ts`        |
| `schema`    | zod schemas — **restricted, see below** | `booking-form.schema.ts` |
| `types`     | shared types for the module             | `home.types.ts`          |
| `params`    | URL / search-param parsing              | `booking-form.params.ts` |
| `utils`     | pure helpers belonging to one module    | `order.utils.ts`         |
| `constants` | fixed values                            | `home.constants.ts`      |
| `content`   | Indonesian copy held as data            | `home.content.ts`        |
| `proof`     | upload constraints                      | `booking-form.proof.ts`  |
| `store`     | zustand — **reserved, none exists yet** | —                        |

**Do not invent a tenth role without adding it to this table.** Two documents previously carried partial copies of this list — one omitted `params`/`utils`, the other omitted `types`/`store`/`proof` — and neither listed `constants` or `content` at all. That is the drift this table exists to end.

### Casing

Components are the one PascalCase thing here, and `src/app/` is the one place they are not. `layout.tsx`, `page.tsx` and `route.ts` are framework-mandated filenames; `providers.tsx` is not, but it sits beside them and keeps their casing rather than being the single PascalCase file in a lowercase folder.

A component file's name and its export are the same string, so a stale import reads as wrong at a glance instead of resolving to something that merely looks plausible.

### `schema` is not available to every module

zod measures **63.2KB gzip** on `/` — 26% of the entire budget, measured by building a probe against the real page. ESLint allows it in `src/modules/booking-form/**`, `src/app/api/**` and `src/server/**` only. A `home.schema.ts` is a lint error, not an oversight.

`/booking` earns that 63.2KB: six fields, a 2MB upload, four response codes, and a `fields` object keyed by field name. `/` does not — it makes one GET and validates nine entries, which `home.service.ts` does by hand in twenty lines. That hand-written validator is not a shortcut; it is what buys a quarter of the landing page's budget back.

### Language seam

Indonesian in UI strings, English everywhere else. Inside one component the seam falls between the identifier and the literal:

```tsx
// English: identifier, comment, prop name
// Indonesian: only what a visitor reads
export function SlotCell({ slot, status }: SlotCellProps) {
  // Elapsed slots collapse into one row rather than nine "Terisi" labels.
  const label = status === "booked" ? "Terisi" : "Pilih";
  return <button aria-label={`Pilih slot ${slot}`}>{label}</button>;
}
```

An `aria-label` is UI copy — it is read aloud to a visitor, so it is Indonesian.

---

## Where a thing goes

Ask these **in order**. An unordered list gives contradicting answers: `slots.ts` has no package dependency (Q2 says `utils/`) but the admin repo needs it (Q1 says `domain/`), and `dates.ts` is worse — it exists because of `date-fns` _and_ the admin needs it, so Q2 alone sends a frozen file to `src/lib/`.

The admin question comes first because it is the only one whose wrong answer is expensive. Everything else is a move; that one is a contract in two repos.

| Order | Ask                                                                                                                                                                    | Settles                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **1** | **Does `arena-player-admin` need it?** Yes → `src/domain/`, and stop here — it is now byte-identical in both repos, dependencies and all, with everything that implies | `domain/` vs everything else                         |
| **2** | **Does this file exist because of a package in `package.json`?** Yes → `lib/` (polish over an installed library). No → `utils/` (ours)                                 | `src/lib/` vs `src/utils/`                           |
| **3** | **Does more than one module use it?** One consumer means it belongs to that module. Promote later, when a second consumer actually appears — not in anticipation       | `src/components/` and `src/hooks/` vs a module's own |
| **4** | `services/` holds the configured client (the axios instance). A module's `*.service.ts` holds the calls that use it                                                    | `src/services/` vs `<module>.service.ts`             |

Worked through for the four frozen files: all four answer **yes** at question 1 and never reach question 2. `dates.ts` importing `date-fns` does not make it `lib/` — it makes it the one file in `domain/` that carries a dependency, and the reason the admin repo is obliged to install one.

**`src/hooks/` and `src/components/` share question 3 and its exception.** A data-fetching hook is never promoted, however many surfaces call it: `home.queries.ts` belongs to `/` because the query key, the cache lifetime, and the retry policy are decisions about that surface, not reusable machinery. What belongs in `src/hooks/` is behaviour with no surface attached — `use-media-query.ts`, `use-scroll-lock.ts`. **If a hook's name would have to mention a route to be honest, it is a module hook.**

Both folders are organised by _kind_ in a repo otherwise organised by _feature_. That is a real inconsistency, tolerated for one reason: the one-consumer rule keeps them small. A `src/hooks/` that grows past a handful of files means the rule stopped being applied, not that the folder needed subfolders.

`src/app/` and `src/mocks/` are not in the table because nothing is ever torn about them: `app/` is routes and composition, `mocks/` is MSW handlers and is retired in Phase 4.

`src/lib/` stays flat. Nesting it is the first sign it has started collecting features rather than polishing libraries.

**Adding to `src/domain/` is not a neutral act.** Every dependency it gains is one the admin repo is obliged to install at a matching major. Three of its four files have none; keep it that way. Full contract in [architecture.md](../../docs/architecture.md).

---

## What never goes in `src/app/`

`src/app/` holds routes, layouts, and composition. It wires modules together and owns nothing else — no business logic, no data shaping, no reusable UI.

### Three import rules

1. **Nothing under `src/` imports from `src/app/`.** The extraction boundary. Anything below it can move to another app without dragging routing along, which is what keeps slot and date code shareable with the admin repo.
2. **Feature modules never import each other.** Shared vocabulary goes in `src/domain/`. One `home` → `booking-form` import is all it takes for a later `import { z }` in that module to ship zod to `/` with nothing failing.
3. **`src/domain/` imports nothing from the rest of `src/`**, and imports its own siblings **relatively** (`./slots`, never `@/domain/slots`) so the byte-identical copy resolves the same in both repos.

**Corollary, enforced the same two ways:** `src/components/` and `src/hooks/` never import a module. They sit below modules in the graph. A shared hook that reaches into `@/modules/home` is not shared — it is a home hook in the wrong folder, and it drags whatever that module imports onto every surface using it.

### Why each rule is enforced twice

ESLint zones in `eslint.config.mjs` match the `@/` alias form; `pnpm check:docs` resolves the **relative** form, which no glob can express — banning `../*` outright would break `src/modules/home/components/x.tsx` importing `../home.service`, which is correct and routine.

Before that second half existed, this passed both `pnpm lint` and `pnpm check:docs`:

```ts
// WRONG — inside src/modules/home/, and it linted clean
import { schema } from "../booking-form/booking-form.schema";
```

That is precisely the import rule 2 exists to stop, and it is why the relative-form check is not redundant.

### No barrels

**No `index.ts` barrels under `src/modules/`.** A barrel re-exports the whole module, so one import from it drags zod, react-hook-form, and axios onto whatever route did the importing. Nothing errors — the page just gets slower. Import deep paths. `pnpm check:docs` asserts this.

---

## Component patterns

**Server Component by default.** `"use client"` is a decision with a reason, not a reflex. Valid reasons: an event handler, a hook with state, a browser API, or a library that needs one. "It felt easier" is not one. Push the boundary as far down the tree as it will go — one interactive button does not make its page a client component.

**Where the fetch boundary sits.** A component that renders and a component that fetches are different jobs:

```
component  →  *.queries.ts  →  *.service.ts  →  transport
(renders)     (TanStack Query)  (the call)      (fetch or axios)
```

**No bare `fetch` in a component.** That rule is about the _component_, not the transport — `/` legitimately uses native `fetch`, it just does so from `home.service.ts`. Which transport belongs to which route is in [architecture.md](../../docs/architecture.md).

**Props typing.** Export a named `<Component>Props` type. Prefer a discriminated union over a bag of optional booleans:

```ts
// WRONG — three flags that can contradict each other
type SlotCellProps = { isBooked?: boolean; isPending?: boolean; isPast?: boolean };

// RIGHT — one status, and it cannot be two things at once
type SlotCellProps = { status: "available" | "pending" | "booked" | "elapsed" };
```

**Ownership.** Components, styling, tokens, layout, typography and motion belong to `ui-designer` — decision and code both. A form's validation and submit path belong to `software-engineer`; the same form's markup does not.
