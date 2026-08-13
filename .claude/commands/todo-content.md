---
description: Audit the seven `TODO(content)` placeholder categories — supplied, outstanding, or stray
---

Audit every `TODO(content)` marker against the declared vocabulary.

## The vocabulary

[CLAUDE.md](../../CLAUDE.md) hard rule 3 declares **seven** categories:

1. WhatsApp number
2. Bank account + holder name
3. Address + maps coordinates
4. Photos of the field
5. Logo file
6. Hero copy
7. Rate card

## This is an allowlist, not a headcount

**A supplied item loses its marker.** So "fewer than seven markers" is the expected state, not a failure — do not report a missing marker as a problem. What _is_ a problem is a marker whose category is not one of the seven.

Run `rg "TODO\(content\)"` across the repo and classify every hit:

- **Declared and outstanding** — marker present, category on the list. Report the file and what is still owed.
- **Supplied** — category on the list, no marker anywhere. Report where the real value now lives, so it is verifiable rather than assumed.
- **Stray** — a marker whose category is not one of the seven. **This is a finding.** Either the vocabulary needs extending in CLAUDE.md, or the marker is wrong.

## Also check

- Any marker using the retired `TODO(phase2)` spelling. `pnpm check:docs` asserts none survive; if you find one, that check has a gap.
- Whether an invented placeholder value has crept in where the rule forbids one. **The rate card is the sharp case**: a fabricated price is the single placeholder a visitor would act on, so a number appearing on `/booking` without the client having supplied a rate card is a defect, not a placeholder.

## Output

A table: category · status · location · what is still owed. Then a one-line summary of the count outstanding, and any strays called out separately with a recommendation.
