# Arena Player — Development rules

The conventions an agent cannot infer from the code. Getting one wrong here costs a review comment; getting a [CLAUDE.md](../CLAUDE.md) hard rule wrong costs a phase.

**This file never restates a rule that lives elsewhere.** Where the authority is another document, it is linked and not copied. A copied rule is one that drifts, and this repo has lost time to exactly that three separate ways — the skills, the agents, and the hooks each ended up holding a stale copy of a value that had moved.

| If you need                                           | Read                                            |
| ----------------------------------------------------- | ----------------------------------------------- |
| The rules whose violation means rework                | [CLAUDE.md](../CLAUDE.md) hard rules            |
| Folder boundaries and why each is shaped that way     | [architecture.md](architecture.md)              |
| Colour, type, spacing, contrast ratios                | [DESIGN.md](DESIGN.md) — normative              |
| API shapes, field names, status codes                 | [architecture.md](architecture.md) API contract |
| What the product is for and what must not be invented | [PRODUCT.md](PRODUCT.md)                        |

---

## Naming

| Kind          | Convention                                                            | Example                                         |
| ------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| Module file   | `<module>.<role>.ts`                                                  | `home.service.ts`, `booking-form.schema.ts`     |
| Component     | kebab-case file, PascalCase export                                    | `order-section.tsx` → `OrderSection`            |
| Hook          | `use-<thing>.ts`, or `<module>.queries.ts` for a TanStack Query group | `home.queries.ts` → `useAvailability`           |
| Test          | colocated `<file>.test.ts`, beside what it covers                     | `slots.ts` → `slots.test.ts`                    |
| Route handler | `route.ts` under its path segment                                     | `src/app/api/availability/route.ts`             |
| Domain module | plain noun, no suffix                                                 | `slots.ts`, `dates.ts`, `status.ts`, `phone.ts` |

Roles in use: `service` (transport), `queries` (TanStack Query hooks), `schema` (zod), `types`, `store` (zustand), `proof` (upload constraints).

**Indonesian in UI strings, English everywhere else.** Inside one component the seam falls between the identifier and the literal:

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

The eight folders under `src/` each have one job. Four pairs are genuinely ambiguous; these are the questions that settle them.

| Torn between                                      | Ask                                                                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/` vs a module's own `components/` | **Does more than one module render it?** One consumer means it belongs to that module. Promote later, when a second consumer actually appears — not in anticipation |
| `src/lib/` vs `src/utils/`                        | **Does this file exist because of a package in `package.json`?** Yes → `lib/` (it is polish over an installed library). No → `utils/` (it is ours)                  |
| `src/utils/` vs `src/domain/`                     | **Does `arena-player-admin` need it?** Yes → `domain/`, and it is now byte-identical in both repos with everything that implies. No → `utils/`                      |
| `src/services/` vs a module's `*.service.ts`      | `services/` holds the configured client (the axios instance). A module's `*.service.ts` holds the calls that use it                                                 |

`src/lib/` stays flat. Nesting it is the first sign it has started collecting features rather than polishing libraries.

**Adding to `src/domain/` is not a neutral act.** Every dependency it gains is one the admin repo is obliged to install at a matching major. Three of its four files have none; keep it that way. The full contract is in [architecture.md](architecture.md).

---

## What never goes in `src/app/`

`src/app/` holds routes, layouts, and composition. It wires modules together and owns nothing else — no business logic, no data shaping, no reusable UI.

Three import rules, all enforced by ESLint zones in `eslint.config.mjs`:

1. **Nothing under `src/` imports from `src/app/`.** The extraction boundary. Anything below it can move to another app without dragging routing along, which is what keeps slot and date code shareable with the admin repo.
2. **Feature modules never import each other.** Shared vocabulary goes in `src/domain/`. One `home` → `booking-form` import is all it takes for a later `import { z }` in that module to ship zod to `/` with nothing failing.
3. **`src/domain/` imports nothing from the rest of `src/`**, and imports its own siblings **relatively** (`./slots`, never `@/domain/slots`) so the byte-identical copy resolves the same in both repos.

**No `index.ts` barrels under `src/modules/`.** A barrel re-exports the whole module, so one import from it drags zod, react-hook-form, and axios onto whatever route did the importing. Nothing errors — the page just gets slower. Import deep paths. `pnpm check:docs` asserts this.

---

## Component patterns

**Server Component by default.** `"use client"` is a decision with a reason, not a reflex. Valid reasons: an event handler, a hook with state, a browser API, or a library that needs one. "It felt easier" is not one. Push the boundary as far down the tree as it will go — one interactive button does not make its page a client component.

**Where the fetch boundary sits.** A component that renders and a component that fetches are different jobs:

```
component  →  *.queries.ts  →  *.service.ts  →  transport
(renders)     (TanStack Query)  (the call)      (fetch or axios)
```

**No bare `fetch` in a component.** That rule is about the _component_, not the transport — `/` legitimately uses native `fetch`, it just does so from `home.service.ts`. See the route split in [architecture.md](architecture.md) for which transport belongs to which route.

**Props typing.** Export a named `<Component>Props` type. Prefer a discriminated union over a bag of optional booleans — a slot cell has one `status`, not three independent `isBooked` / `isPending` / `isPast` flags that can contradict each other.

---

## Accessibility baseline

The part of this file most likely to be skipped, because nothing fails when it is. Every item below is checkable against code.

**Labels**

- Every input has a real `<label>` associated by `htmlFor`/`id`. A placeholder is not a label — it disappears on focus, exactly when it is needed.
- `inputMode="tel"` on the WhatsApp field. A mis-associated label means the wrong keyboard appears in the Instagram in-app browser, which is most of this site's traffic.

**Errors**

- Every error message is tied to its field with `aria-describedby`, and the field carries `aria-invalid`.
- The error text is the message itself, not a colour change plus a red border. Colour alone is never the signal — see the Visible-Boundary Rule in [DESIGN.md](DESIGN.md).

**Focus**

- Focus is managed on submission. **A 409 must move focus to the message**, or a screen-reader user never learns their slot was taken and simply sees a form that appears to have done nothing.
- 409 and 429 are not interchangeable — see the API contract. Announcing the wrong one tells a rate-limited user their slot is gone when it is not.
- Focus is visible wherever it lands, in a sensible order. Never `outline: none` without a replacement that meets the contrast bar in [DESIGN.md](DESIGN.md).

**Keyboard**

- Everything operable by keyboard, including the file upload — a click-only upload control locks out keyboard users at the conversion point.
- Slot cells are real `<button>`s. A `<div>` with an `onClick` is not reachable, not announced, and not activated by Enter or Space.

**Targets**

- Touch targets ≥ 44px. The order-section slot grid at 375px is what tests this hardest — nine cells in a small viewport is where the temptation to shrink them appears.

**Per-section gate, not an end-of-phase sweep.** Keyboard navigation, `prefers-reduced-motion`, and Lighthouse mobile ≥ 85 are verified as each section merges. Accessibility debt is far cheaper to fix one section at a time than across five.

---

## Verification

Never claim something works without running the check and quoting the decisive line.

| Command             | Proves                                               |
| ------------------- | ---------------------------------------------------- |
| `pnpm lint`         | banned APIs, route-split zones                       |
| `pnpm typecheck`    | types resolve                                        |
| `pnpm check:lib`    | logic gives the right answers — no credentials, ever |
| `pnpm check:docs`   | the docs still describe reality                      |
| `pnpm format:check` | formatting is settled, not argued                    |

A check that has only ever passed is a check nobody has tested. When you add one, plant a violation, watch it fail, then revert — this repo shipped a `Stop` hook that never fired once, and the `check:docs` hook itself returned success on a real failure the first time it was tested.
