"use client";

import { cn } from "@/lib/cn";

import type { DisplaySlot } from "../order.utils";

const STATE_LABEL: Record<DisplaySlot["status"], string> = {
  available: "Tersedia",
  pending: "Menunggu Konfirmasi",
  booked: "Terisi",
  elapsed: "Sudah lewat",
};

/**
 * One slot. The signature component of the whole product.
 *
 * FOUR STATES FROM THE DATA, PLUS SELECTION. `elapsed` is separate from
 * `booked` and neither shares the other's colour family: an hour that merely
 * passed is neutral and recessed, an hour somebody else booked is the danger
 * triple. Rendering them alike made a page opened at 19.00 read as sold out.
 *
 * SELECTION LIVES IN `aria-pressed`, NEVER IN A CLASS. A class-only selection
 * looks correct and is silent to a screen reader. Unavailable cells keep
 * `aria-disabled` rather than the native attribute, so they stay focusable —
 * a visitor needs to be able to reach 18.00 and hear that it is taken, not
 * find it missing from the tab order.
 *
 * STACKED AT EVERY WIDTH, NOT JUST ABOVE A BREAKPOINT. DESIGN.md's "velocity"
 * redesign makes the label-under-time layout universal rather than a desktop
 * variant, and this is also what settles the slot grid's 320px overflow: the
 * pre-redesign row layout put time and label side by side and needed ~321px
 * to hold both without truncating the 20-character label; stacked, the cell
 * only needs the WIDER of the two lines plus padding — "Menunggu Konfirmasi"
 * at 13px is DESIGN.md's re-measured 133px floor, comfortably under the
 * ~240-288px a single grid column has even at a 320px viewport. No narrower
 * breakpoint, no truncation, no special-cased width: completing the port is
 * what closes the gap, not a new rule.
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
        "group relative flex min-h-16 w-full flex-col items-start justify-center gap-1",
        "overflow-hidden rounded-[var(--radius-control)] border-[1.5px] px-4 py-[14px] text-left",
        "transition-colors duration-200",
        selectable
          ? // THE HOVER FILL IS THE PAGE GROUND, SO IT NEEDS THE SECOND SIGNAL.
            // `--color-wash` and `--color-page` are both blue-50: measured, an
            // available cell hovers from white to rgb(239,246,255) on a body of
            // rgb(239,246,255), so the surface does not lift, it disappears into
            // the band and leaves the blue keyline floating. `--glow-interactive`
            // is DESIGN.md's own fix — the second signal on the SAME event as
            // the blue border, not a separate lighting effect — and it is
            // `pointer-fine` only, per the Slot Cell spec, so a touch tap never
            // leaves a cell stuck "hovered".
            "cursor-pointer border-[var(--color-interactive)] bg-[var(--color-bg)] text-[var(--color-fg)] pointer-fine:hover:bg-[var(--color-wash)] pointer-fine:hover:shadow-[var(--glow-interactive)]"
          : "cursor-not-allowed",
        !selectable &&
          status === "pending" &&
          "border-[var(--color-warning-line)] bg-[var(--color-warning-surface)] text-[var(--color-warning-strong)]",
        !selectable &&
          status === "booked" &&
          "border-[var(--color-danger-line)] bg-[var(--color-danger-surface)] text-[var(--color-danger-strong)]",
        // Elapsed is the only borderless cell: its border matches its fill.
        // That is the structural difference, deliberately not an accent stripe.
        !selectable &&
          status === "elapsed" &&
          "border-[var(--color-disabled-bg)] bg-[var(--color-disabled-bg)] text-[var(--color-fg-muted)]",
        // Selection is a colour change, and it lands at 0ms rather than at the
        // end of a transition — the fill IS the answer to "is this mine now",
        // so a 200ms ease would make the answer arrive 200ms late.
        selected &&
          "!border-[var(--color-interactive)] !bg-[var(--color-interactive)] !text-[var(--color-fg-inverse)] !transition-none",
      )}
    >
      {/* Time: Orbitron 700 at 16px, 0.02em — no longer the h3 role. An h3
          inside a grid of nine would be nine sub-headings. */}
      <span className="font-[family-name:var(--font-display)] text-[16px] font-bold tracking-[0.02em] whitespace-nowrap">
        {slot}
      </span>
      {/* State: Inter at 13px, sitting UNDER the time at every width — the
          redesign made this universal rather than a desktop-only stack, which
          is what keeps the 20-character label intact at any column count.
          FULL WHITE WHEN SELECTED, NEVER 85%. DESIGN.md said 85% until
          2026-08-12 and DESIGN.html had already overruled it: white at 85%
          over blue-600 composites to rgb(222,232,252) and computes 4.19:1
          against the fill, under AA, and at 13px there is no large-text
          exemption. Full white is 5.17:1. The label separates from the time
          by size and face, not by transparency. */}
      <span className="text-[13px] whitespace-nowrap">{label}</span>

      {/* A quiet second line, not a coloured chip. The state label is what the
          cell exists to carry, and a badge that competes with it would trade
          the primary reading for the secondary one. Column layout already
          puts it on its own line — no `basis-full` needed now that the row
          layout is gone. */}
      {runHours ? (
        <span lang="id" className="text-[length:var(--text-xs)] text-[var(--color-interactive)]">
          Bisa main {runHours} jam berturut-turut
        </span>
      ) : null}

      {/* The decorative half of the tap: a ring that expands from the cell and
          fades. Pure CSS, so it costs no JavaScript and the reduced-motion
          block in globals.css already switches it off. It runs AFTER the fill,
          which is why the fill is not waiting on it. */}
      {selected ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-[slot-ring_300ms_var(--ease-out)_forwards] rounded-[var(--radius-control)] ring-2 ring-[var(--color-interactive)]"
        />
      ) : null}
    </button>
  );
}
