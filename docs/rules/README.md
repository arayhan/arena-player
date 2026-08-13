# Arena Player — Development rules

The conventions an agent cannot infer from the code. Getting one wrong here costs a review comment; getting a [CLAUDE.md](../../CLAUDE.md) hard rule wrong costs a phase.

**This folder is the rules.** One file per theme, so a session reads only the one it needs — [CLAUDE.md](../../CLAUDE.md) points at each with a "read before X" line rather than pulling all of it into every session. This README is the index and nothing else.

**Nothing is restated in two places.** A copied rule is one that drifts, and this repo has lost time to exactly that three separate ways — the skills, the agents, and the hooks each ended up holding a stale copy of a value that had moved. That is why this file is a pointer and not a summary: a summary is a copy with better manners.

## The rules

| File                                     | Covers                                                                                                                            | Read before                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [code-style.md](code-style.md)           | Naming and the nine role suffixes, the ordered "where does this go" table, the three import rules, no barrels, component patterns | writing any code                    |
| [testing.md](testing.md)                 | Colocated tests, the command table, pinning the clock, proving a check can fail                                                   | writing or changing a test          |
| [api-conventions.md](api-conventions.md) | Insert→catch `23505`→409, canonicalise vs reject, status codes that are not interchangeable, keeping MSW out of production        | touching a route handler or service |
| [accessibility.md](accessibility.md)     | Labels, errors, focus, `aria-disabled` over native `disabled`, keyboard, targets                                                  | writing any markup or form control  |
| [git-workflow.md](git-workflow.md)       | Atomic commits, the six semantic types, never signing the work, what never gets committed, worktrees for parallel work            | committing, or splitting large work |

## Where authority sits when documents disagree

| If you need                                           | Read                                               |
| ----------------------------------------------------- | -------------------------------------------------- |
| The rules whose violation means rework                | [CLAUDE.md](../../CLAUDE.md) hard rules            |
| Folder boundaries and why each is shaped that way     | [architecture.md](../architecture.md)              |
| Colour, type, spacing, contrast ratios                | [DESIGN.md](../DESIGN.md) — normative              |
| API shapes, field names, status codes                 | [architecture.md](../architecture.md) API contract |
| What the product is for and what must not be invented | [PRODUCT.md](../PRODUCT.md)                        |

A hard rule in CLAUDE.md beats anything in this folder. Where a rules file needs a number — a contrast ratio, a budget ceiling, a field name — it links to the owning document rather than copying the value.

## Not in this folder

Agent-only tooling lives in [`.claude/commands/`](../../.claude/commands/) as slash commands, not here and not in `scripts/`. Those are prompts an agent invokes; these are rules an agent reads.
