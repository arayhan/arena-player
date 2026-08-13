# Git workflow — commits and worktrees

Read before committing anything, and before starting work large enough to want splitting.

**Authority:** this file is the single source for commit shape and worktree practice. [CLAUDE.md](../../CLAUDE.md) hard rule 10 — _one writing session per worktree_ — outranks everything here and is not restated; this file says how to work within it.

---

## Atomic commits

**One commit per work step that passes.** Not one giant commit at the end, and not a commit per file.

The test is not size, it is **consistency**: could someone check out this commit and find the repo in a working, coherent state? If reverting it would leave a dangling reference, a doc pointing at a file that no longer exists, or a test importing something unwritten, it was not atomic — it was half a change.

```
# WRONG — one commit, four unrelated things, impossible to revert one
feat: redesign hero, fix timezone, add logo, update docs

# WRONG — split so fine that no single commit builds
chore: add file
chore: add import for the file
chore: actually use the file

# RIGHT — each leaves the repo coherent
feat(brand): client logo lands — favicon, apple icon, lockup, mark
fix(domain): the field is in Lombok — WITA, not WIB, and names that say so
```

**Run the gate before each commit, not once at the end.** `pnpm check` is the bar. A commit that was never verified is a commit somebody has to bisect through later.

**When one change genuinely spans files that must move together, they belong in one commit.** Renaming a folder and repointing every link to it is one atomic change, not two — splitting it produces a middle commit where the links are dead.

---

## Semantic commits

Conventional-Commits-flavored. Six types are in use here, and that is deliberately the whole vocabulary:

| Type       | For                                                        |
| ---------- | ---------------------------------------------------------- |
| `feat`     | new behaviour a user or agent can observe                  |
| `fix`      | corrected behaviour that was wrong                         |
| `docs`     | documentation only, no code path changes                   |
| `style`    | visual/design changes that ship, and formatting-only edits |
| `refactor` | structure changes with identical behaviour                 |
| `chore`    | tooling, config, dependency housekeeping                   |

**Scope is optional and should say where, not what.** In use here: an area (`design`, `dx`, `brand`, `domain`, `mocks`, `agents`, `home`, `hero`, `booking`, `docs`) or a phase number (`2`, `3`). Pick the one a reader would grep for.

### The subject line

- Imperative mood, lowercase after the type, **no trailing period**.
- Say the outcome, not the mechanics. `fix(domain): the field is in Lombok — WITA, not WIB` beats `fix(domain): change timezone constant`.
- If you cannot describe it in one line, that is usually the commit telling you it is not atomic.

### The body

Optional, and only when _why_ is not obvious from the subject. When present:

- **Why over what.** `git diff` already holds the what. The body holds the reasoning that would otherwise be lost — the alternative rejected, the measurement that decided it, the trap avoided.
- Name the thing that would otherwise be re-litigated. A commit body saying _"the escalating sizes were built to survive Panchang's width; the flat setting solves it the other way"_ stops the next session undoing it by accident.
- Wrap at a readable width. No bullet-point walls — this is prose.

---

## Never sign the work

**No attribution trailers of any kind.** Not `Co-Authored-By:`, not "Generated with", not a 🤖 line, not "by Claude", not "by Antigravity", not any agent or tool name.

This applies to commit messages, PR bodies, and issue text alike.

The reason is ownership, not modesty: this is a paid client project, the git history may transfer to the client at handover, and the log should read as the work of the developer who is accountable for it. A trailer naming a tool turns every commit into an advertisement for something the client did not buy, and invites a question about authorship that the repository should not be raising on its own.

---

## Never commit

- **`.env.local`** or any real credential. Gitignored, and that is not a reason to relax — check the diff.
- **`package-lock.json` / `yarn.lock`.** pnpm only.
- **Anything a tool injected that you did not write.** This is not hypothetical: `/impeccable live` injects a `<script src="http://localhost:8400/live.js?token=…">` into `src/app/layout.tsx` between `impeccable-live-start`/`-end` markers, and a `git add -A` will happily commit a localhost dev script with a session token into the app shell. It was caught once by reading `git status` against what had actually been edited, and only for that reason.

**Before any broad `git add`, compare `git status` against the files you touched.** A path you do not recognise is the signal — read it before staging it.

---

## Worktrees for large work

**The problem they solve** is hard rule 10: two sessions editing one checkout cannot see each other. That has cost this project twice — two design defects shipped in a single day, and later a domain re-copy silently reverted mid-flight when a concurrent session restored its tree.

A worktree gives each line of work its own directory and branch against the same repository, so parallel work stops overwriting itself.

### When to reach for one

Split when the work has **independent parts that do not need each other's output**:

- Several features or sections that touch different folders
- A long build alongside a review or audit of existing code
- Anything you would otherwise be tempted to interleave in one branch

Do **not** split when the parts share files, must land in order, or are small enough that sequencing costs less than the setup.

### Propose, do not create

**An agent proposes the split and waits.** A worktree creates a real directory and a real branch — visible consequences, not internal detail — so the shape is offered through `AskUserQuestion` and only built once chosen.

Name the parts, say which folders each would touch, and say plainly if they overlap. Overlapping parts are the case where worktrees make things worse rather than better.

### Working with them

```bash
claude --worktree <branch-name>            # a session in its own worktree
git worktree list                          # what is live right now
git worktree remove <path>                 # when the branch has landed
```

**Each worktree commits its own work before handing off.** The failure mode is not the branch — it is uncommitted changes in a tree another session then restores over.

**`.impeccable/critique/` is gitignored**, so a graded review of a design artifact never travels between worktrees and is invisible to `git log`. Read it in the tree it was written in, before editing anything under `docs/DESIGN.*`. That blind spot produced two of the defects above.
