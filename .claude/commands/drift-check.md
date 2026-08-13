---
description: Check every surface where the same value is written twice and can silently diverge
---

Check all four places this project duplicates a value on purpose, and report any that have diverged.

This exists because **the worst defect available here fails silently.** `uniq_active_slot` compares `time_slot` as text, so a one-character drift in `TIME_SLOTS` disables anti-double-booking in _both_ apps with nothing throwing anywhere.

## 1. Domain layer, web vs admin — byte-identical

Eight files must match exactly between `src/domain/` here and `../arena-player-admin/src/domain/`: `slots`, `dates`, `status`, `phone`, and each one's `.test.ts`.

Tests are inside the diff deliberately — the admin repo inherits the _proof_, not just the code, so the copy is verified to behave identically rather than merely look identical.

```bash
pnpm check:domain
```

If the sibling repo is absent the script skips **loudly** and names how many files went unguarded. A skip is not a pass — report it as unverified, never as green.

Also diff by hand if `check:domain` is unavailable:

```bash
for f in slots dates status phone; do
  for ext in ts test.ts; do
    cmp -s "src/domain/$f.$ext" "../arena-player-admin/src/domain/$f.$ext" \
      && echo "ok   $f.$ext" || echo "DRIFT $f.$ext"
  done
done
```

## 2. Slot strings vs the SQL constraint

The nine canonical strings live in `src/domain/slots.ts` (`TIME_SLOTS`) **and** in the `time_slot_canonical` CHECK inside `db/migrations/`. `pnpm check:docs` compares them as `slot-canonical-drift`.

Scope each side to its own declaration before extracting — an earlier version of this check compared three prose mentions in a doc comment against the nine real constraint entries, and was taken in by exactly the confusion it exists to catch.

## 3. Shared peer dependencies

`src/domain/dates.ts` imports `date-fns` and `@date-fns/tz`. Both repos must declare a **matching major**: v3 and v4 differ in precisely the timezone API that file uses, so two repos on different majors produce a byte-identical `dates.ts` computing different dates. `check:domain` compares the declared ranges, not the lockfile.

## 4. Timezone

The field is in Lombok — **WITA, `Asia/Makassar`, UTC+8**. Grep both repos for `Asia/Jakarta`. Two kinds of hit, and only one is a defect:

- **A defect** — a date helper, a test instant, or a product-truth doc line pinning WIB.
- **Not a defect** — prose describing the _developer's_ machine, e.g. the Neon OID parser note about "shifting a date on an Asia/Jakarta machine". Leave those.

## Output

One line per surface: `ok` or the exact drift with both sides quoted. Then a verdict.

**If nothing drifted, say what was compared and how many files** — a check reporting success having compared nothing is worse than no check at all.
