# docs/references/

**Scratch folder. Nothing here is committed, and nothing here is permanent.**

Drop-off point for visual reference material — benchmark screenshots, icon style examples, hero and banner inspiration, moodboards. Everything in this directory is gitignored and gets deleted once the work it informed is done. This README is the only tracked file.

## Lifecycle

1. You drop a file in
2. It gets read
3. **Findings are written into a durable doc first** — `../DESIGN.md` for visual and motion conclusions, `../PRD.md` if it changes product scope
4. The file stays while the sections it informs are being built
5. It gets deleted afterwards, with an explicit note naming what was removed

**Step 3 happens before step 5, always.** The file is never committed and then gets deleted, so anything not written down disappears with it — leaving a future session, or whoever maintains this after handover, with "invert the dark neon benchmark" and no benchmark. Deleting the source is only safe once the conclusion outlives it.

## Naming

| Prefix | Contents |
|---|---|
| `benchmark-*` | Screenshots of bataskotapoint.com or any other site being referenced |
| `icon-*` | Icon style examples — stroke weight, corner radius, fill vs outline |
| `hero-*` | Hero layout and composition inspiration |
| `banner-*` | Banner and section-break inspiration |
| `moodboard-*` | Palette, type, texture, general direction |

- **PNG or JPG.** Those read reliably; other formats may not.
- **Descriptive filenames** — `benchmark-bataskota-hero-mobile.png`, not `Screenshot 2026-08-07 141233.png`. The filename is how the right reference gets found without opening all of them.
- **Note the viewport** when it matters (`-mobile`, `-desktop`). The site is designed 375px-first, so a desktop-only reference can quietly mislead.
- **~1200px wide is plenty** to judge composition and hierarchy. Not a repo-weight concern any more — nothing here is committed — just that oversized files are slower to read for no added insight.

## Where everything else goes

| Kind | Location | Committed? |
|---|---|---|
| Reference / inspiration | `docs/references/` | No — gitignored, deleted after use |
| Production assets (logo, favicon, OG image, any shipped image) | `public/` | Yes — Next.js serves this directory |
| Throwaway "does this look right" screenshots | `.claude/screenshots/` | No — already gitignored |

Nothing visual belongs in `.claude/` beyond that screenshot folder. That directory is agent config — skills, agents, hooks, settings.
