"use client";

import { cn } from "@/lib/cn";

import type { DisplaySlot } from "@/utils/slot-display";

const STATE_LABEL: Record<DisplaySlot["status"], string> = {
  available: "Tersedia",
  pending: "Menunggu Konfirmasi",
  booked: "Terisi",
  elapsed: "Sudah lewat",
};

/**
 * One slot. The signature component of the whole product.
 *
 * REBUILT 2026-08-13 FOR "PELAT ENAMEL". The cell is no longer a rounded card
 * with its own border floating in a gutter — it is one FIELD of a single enamel
 * plate. Square corners, and the 2px navy edges below are not the cell's
 * decoration: they are the plate's rules, drawn by the cells and clipped at the
 * plate's own edge (see the negative-margin note in OrderSection.tsx). Nine
 * fields divided by hard rules is what an enamel schedule board actually is,
 * and it is the structural refusal of the rounded-cards-on-a-gradient
 * arrangement this category always ships.
 *
 * FOUR STATES FROM THE DATA, PLUS SELECTION — unchanged, because this part is
 * product truth rather than style. `elapsed` is separate from `booked` and
 * neither shares the other's colour family: an hour that merely passed is
 * neutral and recessed, an hour somebody else booked is the danger triple.
 * Rendering them alike made a page opened at 19.00 read as sold out.
 *
 * WHAT CARRIES A STATE NOW THAT EVERY BORDER IS THE SAME NAVY. The triple moves
 * from surface+border+ink to SURFACE + INK + LABEL, which is three independent
 * signals and satisfies WCAG 1.4.1 the same way it always did — the word
 * "Terisi" is doing work no colour does. The uniform rule carries no state at
 * all, so WCAG 1.4.11's 3:1 boundary bar has nothing to bind to here; it binds
 * to the fills, which are the documented state surfaces, untouched.
 *
 * THE HOUR AND THE LABEL TAKE DIFFERENT INK, AND THAT SERVES THE ONE OUTCOME
 * THE CLIENT IS MEASURED ON. An AVAILABLE hour is set in `navy-900` on white —
 * 17.07:1, the highest-contrast ink anywhere on the page — while a taken hour is
 * tinted into its own state family. So the bookable hours are literally the
 * loudest thing on the plate, and a day with three free slots cannot read as a
 * day with none.
 *
 * SELECTION LIVES IN `aria-pressed`, NEVER IN A CLASS. A class-only selection
 * looks correct and is silent to a screen reader. Unavailable cells keep
 * `aria-disabled` rather than the native attribute, so they stay focusable —
 * a visitor needs to be able to reach 18.00 and hear that it is taken, not
 * find it missing from the tab order.
 */
export function SlotCell({
  slot,
  status,
  selected,
  onSelect,
  runHours,
}: {
  slot: DisplaySlot["slot"];
  status: DisplaySlot["status"];
  selected: boolean;
  onSelect: () => void;
  /**
   * Set ONLY on the first slot of the day's longest free run, and only when
   * that run is three slots or more. At most one cell on the page carries it.
   *
   * It answers the organiser's own question — *can we play longer?* — rather
   * than saying "take this dead hour", which is the client's interest and not
   * theirs. The two align on quiet hours, which is what makes it an affordance
   * instead of a nudge. See `longestFreeRun` for the anti-dilution rules.
   */
  runHours?: number;
}) {
  const selectable = status === "available";
  // "Dipilih" replaces the status label the instant a slot is selected —
  // DESIGN.md's Slot Cell spec, and the label the fill is answering for.
  const label = selected ? "Dipilih" : STATE_LABEL[status];

  return (
    <button
      type="button"
      lang="id"
      data-state={status}
      aria-pressed={selectable ? selected : undefined}
      aria-disabled={selectable ? undefined : true}
      // aria-disabled keeps the control in the tab order, which means the
      // browser no longer refuses the press — so the handler must. Returning
      // early here is the other half of that trade, and it covers keyboard
      // activation, which `pointer-events: none` does not.
      onClick={selectable ? onSelect : undefined}
      className={cn(
        // `h-full` ALONGSIDE `min-h`, AND THE MISSING ONE WAS A VISIBLE DEFECT.
        // This button is not the grid item — `OrderSection` wraps it in a
        // `data-motion` div so GSAP has a stagger target — and CSS Grid stretches
        // that WRAPPER to the tallest cell in its row, not this button. Without
        // `h-full` the button stops at its own content height, and since the
        // button is what draws the plate's rules, they stop with it.
        //
        // MEASURED, at 1280px on a date where all nine slots are live: the row
        // holding a free-run badge gave every wrapper 117px, and the two buttons
        // WITHOUT a badge stayed at 94px — a 23px shortfall. The result is the
        // defect the user circled: a vertical rule that ends early and a
        // horizontal rule sitting at two different heights across one row.
        //
        // It only appears when a row contains the badge, which is why measuring
        // today's date proved nothing — three slots are elapsed and collapsed
        // there, no badge is visible, and every cell reads a uniform 94px.
        //
        // `min-h-[88px]` STAYS, and it is the BUILD's floor rather than the
        // document's. DESIGN.md said 64px until 2026-08-14; the shipped value
        // has been 88px, measured. The document was corrected to match the
        // build rather than the other way round, because 88px is what the
        // three-line cell (time, state, free-run badge) actually needs.
        // `h-full` only takes over when the row is taller than that.
        "group relative flex h-full min-h-[88px] w-full flex-col items-start justify-center gap-1",
        // SQUARE, AND THE BORDERS ARE THE PLATE'S RULES. `border-r` and
        // `border-b` only: the grid above pulls itself 2px past its container
        // on both of those axes, so the last column's and last row's rules land
        // outside the plate and are clipped. Every interior rule is drawn
        // exactly once, at every column count, with no orphan-cell special case.
        "overflow-hidden border-r-2 border-b-2 border-[var(--color-band)]",
        "px-4 py-4 text-left @min-[1120px]:px-3",
        "transition-colors duration-200",
        selectable
          ? // HOVER FILLS THE FIELD NAVY AND INVERTS THE INK — a panel of the
            // sign lighting up. It replaces the pre-redesign wash + glow pair,
            // and it replaces them for a reason rather than a taste: the wash
            // was `blue-50` on a `blue-50` page ground, so the surface did not
            // lift, and `--glow-interactive` was a soft coloured shadow, which
            // is the one thing "no gradients, no soft shadows" rules out. A
            // flat fill needs no second signal because it is not subtle.
            // `pointer-fine` only, so a touch tap never leaves a cell stuck
            // "hovered".
            //
            // THE INK INVERTS ON THE SAME EVENT AS THE FILL, and it is declared
            // here rather than left to inherit. Left to inherit, the hour would
            // have stayed `navy-900` on the new `navy-900` fill — 1:1, an hour
            // that vanishes on hover. The whole cell's ink is set on the button
            // so the hour follows the fill by construction; only the state
            // label and the badge override it below.
            "cursor-pointer bg-[var(--color-bg)] text-[var(--color-fg)] pointer-fine:hover:bg-[var(--color-accent-strong)] pointer-fine:hover:text-[var(--color-fg-inverse)]"
          : "cursor-not-allowed",
        !selectable &&
          status === "pending" &&
          "bg-[var(--color-warning-surface)] text-[var(--color-warning-strong)]",
        !selectable &&
          status === "booked" &&
          "bg-[var(--color-danger-surface)] text-[var(--color-danger-strong)]",
        !selectable &&
          status === "elapsed" &&
          "bg-[var(--color-disabled-bg)] text-[var(--color-fg-muted)]",
        // Selection is a colour change, and it lands at 0ms rather than at the
        // end of a transition — the fill IS the answer to "is this mine now",
        // so a 200ms ease would make the answer arrive 200ms late.
        selected &&
          "!bg-[var(--color-interactive)] !text-[var(--color-fg-inverse)] !transition-none",
      )}
    >
      {/* THE HOUR, AT PLATE SCALE. It takes `--text-h3` — 20.08px at 375px,
          24.52px at 768px, capped at 32px — where it was a hard-coded 16px
          before. "The hours are the product", and a 16px label was the one
          element on the page that did not say so.

          `--text-h3` RATHER THAN A LITERAL, and the distinction DESIGN.md draws
          is about the ELEMENT, not the size: "it is no longer the h3 role — an
          h3 inside a grid of nine is nine sub-headings". That objection is to
          the heading tag, which this is not; it is a `<span>`. Borrowing the h3
          STEP keeps the hour on the documented ramp instead of inventing a
          fourth literal, which is exactly the drift that made `label`,
          `closing` and `ruleNumeral` earn tokens on 2026-08-12.

          TABULAR NUMERALS ARE GONE, AND THAT IS A CORRECTION RATHER THAN A
          SIMPLIFICATION. This file carried `tabular-nums` with a comment
          claiming Saira shipped `tnum` and the fix therefore "goes back in, this
          time doing something". PANCHANG DOES NOT SHIP IT. Measured on the live
          page with the face loaded: "111" and "888" at 100px measure 169.5px and
          333.81px proportionally, and measure 169.5px and 333.81px — byte
          identical — under BOTH `font-variant-numeric: tabular-nums` and
          `font-feature-settings: "tnum" 1`. The face's digits are wildly
          unequal on purpose ("1" is 56.00px where "0" is 119.61px at 100px/800,
          a 2.14:1 ratio), so the nine slot strings span 159.94px to 180.86px at
          16px and nothing in CSS closes that gap. The class was a no-op
          asserting it was not one, which is the same defect this file recorded
          against Orbitron and then re-shipped against a different face. It is
          removed rather than left in place with a comment.

          Nothing depends on it any more: each hour is left-aligned in its own
          field, so the spread shows as a ragged right edge inside a cell with
          78.1px of slack at 375px, not as a wrapped row.

          THE 0.02em TRACKING IS GONE TOO, AND IT PAID FOR THE TIGHTEST CELL ON
          THE PAGE. DESIGN.md specifies `0.02em` for the slot time, written when
          the time was 16px in a narrower face. At `--text-h3`'s 32px ceiling
          that tracking adds 8.3px across the thirteen characters, and measured
          at 1440px in the three-column grid the widest string ("06.00 - 08.00")
          came to 361.7px against 367.3px of content — 5.6px of slack, thin
          enough that it would be re-broken by the next padding change. Panchang
          is an extended face that needs no help spacing out; removing the
          tracking takes the same cell to 13.9px. The nine strings themselves
          cannot drift underneath this — they are `TIME_SLOTS`, guarded by both
          `check:domain` and check:docs' `slot-canonical-drift`. */}
      <span className="type-display text-[length:var(--text-h3)] leading-[1.1] font-bold whitespace-nowrap">
        {slot}
      </span>

      {/* THE STATE LABEL CARRIES THE STATE'S HUE, the hour does not.
          `--text-sm`, NOT a literal — it was a hard-coded thirteen pixels until
          2026-08-12, which is a step the ramp does not have, and the `xs` step
          below is already spoken for by the free-run badge, so putting the state
          there would make the cell's primary content the same size as its
          secondary affordance.

          EVERY BRANCH BELOW IS COMPUTED AGAINST THE FILL IT ACTUALLY SITS ON,
          because this cell has five backgrounds and a colour that is correct on
          one of them is a silent failure on another:
            available          blue-600 on white .......... 5.17:1
            available, hovered blue-400 on navy-900 ....... 6.72:1
            selected           white on blue-600 .......... 5.17:1
            pending            amber-800 on amber-100 ..... 6.37:1
            booked             red-800 on red-100 ......... 6.80:1
            elapsed            navy-400 on grey-200 ....... 5.61:1
          The hovered row is the one that would have been missed: `blue-600` on
          `navy-900` computes 3.30:1, under AA, which is precisely the failure
          the on-band token row exists to prevent. */}
      <span
        className={cn(
          "text-[length:var(--text-sm)] whitespace-nowrap",
          // Only the available branch differs from the ink the button already
          // sets: the three unavailable states want their label in exactly the
          // state ink their hour is in, so they inherit and say nothing here.
          selectable &&
            "text-[var(--color-interactive)] pointer-fine:group-hover:text-[var(--color-interactive-on-band)]",
          // FULL WHITE WHEN SELECTED, NEVER 85%. DESIGN.md said 85% until
          // 2026-08-12 and DESIGN.html had already overruled it: white at 85%
          // over blue-600 composites to rgb(222,232,252) and computes 4.19:1
          // against the fill, under AA. Full white is 5.17:1. The label
          // separates from the hour by size and face, not by transparency.
          selected && "!text-[var(--color-fg-inverse)]",
        )}
      >
        {label}
      </span>

      {/* THE FREE-RUN AFFORDANCE. A quiet second line, not a coloured chip: the
          state label is what the cell exists to carry, and a badge competing
          with it would trade the primary reading for the secondary one.

          THE SELECTED BRANCH FIXES A LIVE DEFECT, verified in the browser before
          it was written rather than reasoned about. This span carried a flat
          `text-[var(--color-interactive)]`, and a span's own colour beats the
          `!text-...` the button sets on itself — so selecting the one badged
          slot rendered `rgb(37, 99, 235)` text on a `rgb(37, 99, 235)` fill.
          That is 1.00:1: the sentence did not fade, it disappeared, on the
          single cell in the whole grid that has something extra to say. Read
          live at 375px on 16.00 - 18.00 with `getComputedStyle`. The hover
          branch is the same failure one step away, for the same reason. */}
      {runHours ? (
        <span
          lang="id"
          className={cn(
            "text-[length:var(--text-xs)]",
            "text-[var(--color-interactive)] pointer-fine:group-hover:text-[var(--color-interactive-on-band)]",
            selected && "!text-[var(--color-fg-inverse)]",
          )}
        >
          Bisa main {runHours} jam berturut-turut
        </span>
      ) : null}

      {/* The decorative half of the tap: a hard ring struck at the field's edge
          that expands and fades. SQUARE now, with the `rounded` dropped — a
          rounded pulse inside a square field was the corner radius reappearing
          on the one element that only exists for 300ms.

          Pure CSS, so it costs no JavaScript and the reduced-motion block in
          globals.css already switches it off. It runs AFTER the fill, which is
          why the fill is not waiting on it. */}
      {selected ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-[slot-ring_300ms_var(--ease-out)_forwards] ring-2 ring-inset ring-[var(--color-fg-inverse)]"
        />
      ) : null}
    </button>
  );
}
