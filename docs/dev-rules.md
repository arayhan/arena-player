# Arena Player — Development rules

The conventions an agent cannot infer from the code. Getting one wrong here costs a review comment; getting a [CLAUDE.md](../CLAUDE.md) hard rule wrong costs a phase.

**The rules themselves now live in [`.claude/rules/`](../.claude/rules/).** This file is the index. They moved there so an agent loads only the rule it needs — the four files are themed, and CLAUDE.md points at each one with a "read before X" line rather than pulling all of it into every session.

**Nothing is restated in two places.** A copied rule is one that drifts, and this repo has lost time to exactly that three separate ways — the skills, the agents, and the hooks each ended up holding a stale copy of a value that had moved. That is why this file became a pointer instead of keeping a summary.

## The rules

| File                                                      | Covers                                                                                                                            | Read before                         |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [code-style.md](../.claude/rules/code-style.md)           | Naming and the nine role suffixes, the ordered "where does this go" table, the three import rules, no barrels, component patterns | writing any code                    |
| [testing.md](../.claude/rules/testing.md)                 | Colocated tests, the command table, pinning the clock, proving a check can fail                                                   | writing or changing a test          |
| [api-conventions.md](../.claude/rules/api-conventions.md) | Insert→catch `23505`→409, canonicalise vs reject, status codes that are not interchangeable, keeping MSW out of production        | touching a route handler or service |
| [accessibility.md](../.claude/rules/accessibility.md)     | Labels, errors, focus, `aria-disabled` over native `disabled`, keyboard, targets                                                  | writing any markup or form control  |

## Where authority sits when documents disagree

| If you need                                           | Read                                            |
| ----------------------------------------------------- | ----------------------------------------------- |
| The rules whose violation means rework                | [CLAUDE.md](../CLAUDE.md) hard rules            |
| Folder boundaries and why each is shaped that way     | [architecture.md](architecture.md)              |
| Colour, type, spacing, contrast ratios                | [DESIGN.md](DESIGN.md) — normative              |
| API shapes, field names, status codes                 | [architecture.md](architecture.md) API contract |
| What the product is for and what must not be invented | [PRODUCT.md](PRODUCT.md)                        |

A hard rule in CLAUDE.md beats anything in `.claude/rules/`. Where a rules file needs a number — a contrast ratio, a budget ceiling, a field name — it links to the owning document rather than copying the value.
