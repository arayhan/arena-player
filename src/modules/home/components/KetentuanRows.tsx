import { cn } from "@/lib/cn";

import { KETENTUAN, KETENTUAN_TITLE } from "../home.content";

/**
 * THE RULES PLATE — "Pelat Enamel" applied to the longest reading on the page.
 *
 * REBUILT 2026-08-13. What stood here was a list of rows floating on the band
 * with a hairline above and below each one, and a heading hovering over them
 * with nothing joining the two. This is ONE OBJECT instead: a plate bolted to
 * the navy band, its painted edges top and bottom, the client's own document
 * title stamped on its head field, and ten ruled fields under it. The same
 * argument the order plate makes — the arrangement is the direction, not the
 * styling — and the same construction: a hard saturated outer edge with quiet
 * interior rules, which is what an enamel notice board actually is.
 *
 * NOT A CARD, STILL. No radius, no shadow, no inset, no fill of its own: the
 * plate is drawn entirely with rules, so it sits ON the band rather than
 * floating above it. A rounded bordered panel here is the "white card on navy"
 * defect the redesign exists to remove, and a rounded DARK panel on a dark band
 * is the same defect wearing its inverse. `<Section>`'s container is the only
 * width constraint.
 *
 * THE HEAD FIELD IS WHY THE TITLE IS NOT A KICKER. "PERATURAN SEWA LAPANGAN" is
 * the client's own heading for this document, verbatim from PRD.md, so it is
 * real information rather than decoration — but a small uppercase line floating
 * above "KETENTUAN ARENA" is dimensionally identical to the kicker pattern
 * DESIGN.md bans, and it read as one. Inside the plate, above the first rule and
 * divided by the same hairline as every other field, it is a label ON the object
 * instead of a second heading before it. Same words, different structure, and
 * the structure is what the ban is actually about.
 *
 * ON-BAND TOKENS ONLY, EVERY COLOUR. `--color-fg-on-band`,
 * `--color-fg-muted-on-band`, `--color-interactive-on-band`,
 * `--color-border-on-band` — never their light-surface counterparts.
 * DESIGN.md's On-Band Rule names this exact section as the place the
 * pre-redesign concept got it wrong, and the failure is invisible in a
 * screenshot: `--color-blue-400` and `--color-navy-200` are on-dark ONLY and
 * must never travel to a light surface.
 *
 * COMPUTED AGAINST THE BAND, AND AGAINST THE HOVER FILL, WHICH IS THE ROW THAT
 * WOULD HAVE BEEN MISSED — every text node here sits on TWO backgrounds:
 *   rule text     blue-50  on navy-900 ......... 15.69:1
 *   rule text     blue-50  on navy-700 (hover) . 11.94:1
 *   head label    navy-200 on navy-900 .......... 7.91:1
 *   numeral       blue-400 on navy-900 .......... 6.72:1
 *   numeral       blue-400 on navy-700 (hover) .. 5.11:1
 * The hairlines are the one thing here that does NOT owe a text ratio:
 * navy-700 on navy-900 computes 1.31:1 and that is correct, because they are
 * structure and carry no state. WCAG 1.4.11's 3:1 boundary bar binds a boundary
 * that CARRIES a state, and nothing in this section has one — DESIGN.md is
 * explicit that no interactive control lives here.
 *
 * `role="list"` ON THE `<ol>`. Some WebKit builds drop the implicit
 * list/listitem semantics from a list the moment `list-style: none` is
 * applied, and this project's primary device is an iOS in-app browser — the
 * one place that bug would actually reach a visitor. `role="list"` restores
 * it regardless of the CSS. The `<ol>` itself (not a `<ul>` with rendered
 * digits) is what makes a screen reader announce "rule 7" as "7 of 10"; the
 * visible `01`-`10` numerals are a compositional device on top of that and
 * are `aria-hidden` so nobody hears the number twice.
 *
 * NO JAVASCRIPT. This stays a server component: the whole section is reading,
 * the hover is a CSS transition, and the landing page's measured framework
 * baseline is 126.5KB against a 200KB ceiling. A scroll reveal here would buy
 * one impression and cost a client boundary on the page that can least afford
 * one — it is offered as a question rather than assumed.
 */
export function KetentuanRows() {
  return (
    // THE PLATE'S PAINTED EDGES. 2px `--color-interactive-on-band` top and
    // bottom, which is the hero's blue rule and the order plate's blue edge
    // stepped down one pixel for the band it sits on. It is what turns ten rows
    // into one object, and it is the only thing on this plate that is not either
    // structure or text.
    //
    // EDGES ONLY, NEVER A FRAME. A four-sided box here would be a card, and the
    // Band Rule's whole point is that the band goes edge to edge; two horizontal
    // rules read as a plate riveted across the sign, which is the thing being
    // described.
    <div className="border-y-2 border-[var(--color-interactive-on-band)]">
      {/* THE HEAD FIELD. `<h3>`, so the heading order under the section's `<h2>`
          is unbroken, and `--text-sm` rather than the h3 ramp step — this is a
          stamped label, not a sub-heading, and the base `h3` rule in globals.css
          is in `@layer base` precisely so this utility wins.

          VERBATIM CLIENT CONTENT, like the ten rules below it: this string is
          the title line of the same PRD.md block. It is not ours to shorten. */}
      <h3
        lang="id"
        className="border-b border-[var(--color-border-on-band)] py-4 text-[length:var(--text-sm)] tracking-[0.08em] text-[color:var(--color-fg-muted-on-band)] uppercase"
      >
        {KETENTUAN_TITLE}
      </h3>

      {/* KETENTUAN IS VERBATIM CLIENT CONTENT. Mapped over, never quoted —
          `check:docs`'s `ketentuan-verbatim` check compares home.content.ts
          against docs/PRD.md character for character, and a hard-coded string
          here would be exactly the rewrite that check exists to catch. */}
      <ol role="list" lang="id" className="list-none divide-y divide-[var(--color-border-on-band)]">
        {KETENTUAN.map((rule, index) => (
          <li
            key={rule}
            className={cn(
              // THE NUMERAL TRACK, RE-DERIVED AGAINST PANCHANG RATHER THAN
              // SCALED. It was a flat `84px`, a figure inherited from a retired
              // typeface, and NOT ONE NUMBER IN THIS FILE SURVIVED THE RE-MEASURE.
              //
              // Measured on the live page with the face loaded, Panchang 900 at
              // the 24px the numeral actually runs at, all ten pairs:
              //   01 42.16   02 53.72   03 53.91   04 55.95   05 53.75
              //   06 55.19   07 54.16   08 55.77   09 55.19   10 42.16
              // Widest is "04" at 55.95px; "01" and "10" are the narrowest at
              // 42.16px, a 13.79px spread, because Panchang's digits are
              // deliberately unequal — "1" advances 56.00px where "0" advances
              // 119.61px at 100px/900, a 2.14:1 ratio. NO `tabular-nums` HERE:
              // the face ships no `tnum` at all, measured and recorded in
              // PROGRESS.md, so the class would be a no-op claiming to be a fix.
              // The spread shows as a ragged RIGHT edge inside the track; the
              // left edge is what forms the spine, and it is exact.
              //
              // Add the skew: `skewX(-8deg)` on a `leading-none` 24px line box
              // overhangs by `tan(8deg) x 24` = 3.37px, so worst-case ink is
              // 59.32px. The track is `--text-rule-numeral x 2.75` = 66px,
              // leaving 6.68px. The old 84px carried 24.68px of dead space — a
              // quarter of the track — which came straight out of the reading
              // column on the narrowest device.
              //
              // Expressed against the token rather than as `66px` so the track
              // follows the numeral if the outline floor ever moves, and so a
              // visitor with a larger root font size gets a track that grew with
              // the glyph instead of one that clips it.
              //
              // `minmax(0,1fr)`, NOT `1fr`. `1fr` expands to `minmax(auto,1fr)`
              // and that auto minimum sits on the TRACK, so the column refuses to
              // shrink below its content's intrinsic width no matter what
              // min-width the item carries — Section.tsx measured this costing
              // 41px of page width.
              "grid grid-cols-[calc(var(--text-rule-numeral)*2.75)_minmax(0,1fr)] items-baseline gap-x-4",
              // 24px, on the 4px interior scale. It was 22px, which is not a step
              // this system has — an off-ramp number nothing would have caught,
              // since spacing has no equivalent of the type detector.
              "py-6",
              "[transition:background-color_250ms]",
              // POINTER-FINE ONLY — SlotCell.tsx's precedent for the same
              // constraint. A touch tap has no hover to leave, so an
              // unguarded hover here would strand a touch device mid-tint
              // with no way to clear it.
              //
              // THE FIELD FILLS AND NOTHING MOVES, and that is a deliberate
              // departure from DESIGN.md, which specifies the row also sliding
              // 14px. Two reasons, one measured and one structural. Measured: at
              // 375px the row is 343px starting at x=16, so a 14px slide puts its
              // right edge at 373px — 2px from the viewport, and past the plate's
              // own painted edge, which is the one line on this object that is
              // supposed to be fixed. Structural: the order plate answered the
              // identical question by replacing its wash-and-glow with a flat
              // fill, because a field painted on a sign does not slide. This is
              // the same world and the same answer.
              //
              // It stays QUIET on purpose. Nothing in this section is clickable,
              // so a loud hover would promise an affordance that is not there;
              // this is a reading aid marking the line you are on, which is why
              // it is the hairline colour and not the accent.
              "pointer-fine:hover:bg-[var(--color-border-on-band)]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "type-display font-extrabold leading-none select-none",
                "inline-block origin-bottom [transform:skewX(var(--skew))]",
                // 24px IS THE FLOOR THE OUTLINE RULE SETS — DESIGN.md: "this
                // is the one place the system sits exactly on it." No smaller
                // outlined text exists anywhere in the system, and because the
                // token is fixed rather than a clamp, no viewport can push it
                // under the floor.
                "text-[length:var(--text-rule-numeral)]",
                // THE OUTLINE-NEEDS-A-FLOOR RULE'S THREE-BRANCH PATTERN,
                // Section.tsx's precedent, with this row's own token
                // (`--color-interactive-on-band`) and its own 1px stroke width.
                //
                // 1. No stroke support: solid fill, the fallback DESIGN.md
                //    requires rather than a transparent word that vanishes.
                "text-[color:var(--color-interactive-on-band)]",
                // 2. Stroke supported: swap to transparent-fill + stroke,
                //    gated on the exact feature query DESIGN.md specifies.
                "supports-[-webkit-text-stroke:1px_currentColor]:text-transparent",
                "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:1px_var(--color-interactive-on-band)]",
                // 3. Forced colours (Windows High Contrast): stroke is not
                //    honoured there, so drop it and fill with the system's
                //    own text colour. `!` wins over the @supports rule above
                //    regardless of generated source order.
                "forced-colors:text-[CanvasText]! forced-colors:[-webkit-text-stroke:0]!",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* 72ch per DESIGN.md's rule-row spec — wider than the 60-68ch body
                measure because each rule is one short sentence read on its own
                line, not a paragraph the eye has to return through. */}
            <p className="max-w-[72ch] text-[color:var(--color-fg-on-band)]">{rule}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
