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
 */
export function SlotCell({
  slot,
  status,
  selected,
  onSelect,
}: {
  slot: DisplaySlot["slot"];
  status: DisplaySlot["status"];
  selected: boolean;
  onSelect: () => void;
}) {
  const selectable = status === "available";

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
        "group relative flex w-full min-h-14 items-center justify-between gap-x-3 gap-y-1",
        "overflow-hidden rounded-[10px] border p-4 text-left",
        // Above 768px the cell stacks so the 20-character state label keeps
        // its full width in a narrower column. Below that it stays a row,
        // where the label fits at 146px inside a 343px screen.
        "md:flex-col md:items-start",
        "transition-colors duration-200",
        selectable
          ? // THE HOVER FILL IS THE PAGE GROUND, SO IT NEEDS THE SECOND SIGNAL.
            // `--color-wash` and `--color-page` are both blue-50: measured, an
            // available cell hovers from white to rgb(239,246,255) on a body of
            // rgb(239,246,255), so the surface does not lift, it disappears into
            // the band and leaves the blue keyline floating. The fill stays
            // because DESIGN.md specifies it; `shadow-md` is what makes the
            // state perceptible, and it is the system's own vocabulary for it —
            // "shadow-md: raised or hovered surfaces", navy-tinted, no new token.
            "cursor-pointer border-[var(--color-interactive)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:bg-[var(--color-wash)] hover:shadow-[var(--shadow-md)]"
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
      <span className="font-[family-name:var(--font-display)] font-medium tracking-[0.01em] whitespace-nowrap">
        {slot}
      </span>
      <span className="text-[length:var(--text-sm)] whitespace-nowrap">{STATE_LABEL[status]}</span>

      {/* The decorative half of the tap: a ring that expands from the cell and
          fades. Pure CSS, so it costs no JavaScript and the reduced-motion
          block in globals.css already switches it off. It runs AFTER the fill,
          which is why the fill is not waiting on it. */}
      {selected ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-[slot-ring_300ms_var(--ease-out)_forwards] rounded-[10px] ring-2 ring-[var(--color-interactive)]"
        />
      ) : null}
    </button>
  );
}
