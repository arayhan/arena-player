import { cn } from "@/lib/cn";

import type { DisplayStatus } from "@/utils/slot-display";

/**
 * The key to the plate's four fields — DESIGN.md's Order section, "The legend".
 *
 * IT MOVED INSIDE THE PLATE ON 2026-08-13, and it changed axis with the move.
 * DESIGN.md describes three stacked rows in a column beside the panel, which
 * was written for the two-column `0.9fr 1.1fr` composition the "Pelat Enamel"
 * rebuild retires: that composition is what held the panel to 477px at 1440px
 * and left its slot grid a single column at every viewport ever rendered. With
 * the plate taking the full content width there is no column beside it, so the
 * legend becomes a wrapping row along the plate's head, directly above the
 * fields it explains rather than off to one side of them.
 *
 * THREE LIVE STATES ONLY, `elapsed` DELIBERATELY EXCLUDED. DESIGN.md is
 * explicit: "it carries the three live states only; elapsed is explained by
 * its own collapsed group's label and adding a fourth row would imply
 * elapsed slots are something a visitor might act on." The collapsed
 * `Sudah lewat (N)` group in the plate is where that state is explained
 * instead.
 *
 * LABEL TEXT MATCHES THE PRODUCT, NOT THE PROSE. DESIGN.md's Order section
 * writes "Menunggu konfirmasi" (lowercase k); `SlotCell.tsx`'s STATE_LABEL
 * renders "Menunggu Konfirmasi" (capital K) — that second one is what a
 * visitor actually sees on a pending cell, so the legend has to say the same
 * thing or it stops matching what it is explaining.
 */
const LEGEND_ROWS: ReadonlyArray<{
  readonly status: Exclude<DisplayStatus, "elapsed">;
  readonly label: string;
  readonly swatchClassName: string;
}> = [
  {
    status: "available",
    label: "Tersedia",
    // The available field is white, which on a white plate would be an
    // invisible swatch — so this one keeps a rule of its own, in the same navy
    // the plate divides its fields with. It is not a state border reappearing;
    // it is the swatch standing in for the rules that surround a real field.
    swatchClassName: "border-2 border-[var(--color-band)] bg-[var(--color-bg)]",
  },
  {
    status: "pending",
    label: "Menunggu Konfirmasi",
    swatchClassName: "bg-[var(--color-warning-surface)]",
  },
  {
    status: "booked",
    label: "Terisi",
    swatchClassName: "bg-[var(--color-danger-surface)]",
  },
];

/**
 * THE RADIUS CONFLICT IS GONE, AND IT IS WORTH RECORDING THAT IT DISSOLVED
 * RATHER THAN THAT IT WAS SOLVED.
 *
 * This constant used to be `h-7 w-10` (28×40px) carrying a long argument: the
 * spec asked for "a 40×22px chip at `rounded.control`", `--radius-control` is
 * 12px, and CSS clamps a corner to at most half the shorter side — so a 12px
 * radius on a 22px-tall box already renders as a capsule, which collided with
 * DESIGN.md's own One-Round-Shape Rule. The chip was grown to 28px tall so that
 * 12px stopped being at least half of it.
 *
 * "Pelat Enamel" has no radius on the plate or its fields, so the swatch has
 * none either, and a rectangle with a 0 radius cannot be clamped into a
 * capsule at any height. The spec's two rules stop contradicting each other at
 * these dimensions because one of them no longer applies. The swatch goes back
 * to the spec's own 40×22px proportion — 40×20px here, so it sits on the 4px
 * spacing base — and the date pill remains the only fully round shape on the
 * page, which is the rule that was actually being protected.
 */
const SWATCH_HEIGHT_WIDTH = "h-5 w-10"; // 20 × 40px — see the block comment above

export function SlotLegend() {
  return (
    <ul
      lang="id"
      aria-label="Keterangan status jadwal"
      // WRAPS RATHER THAN SCROLLS OR TRUNCATES. Measured in Plus Jakarta Sans
      // at 14px with the face loaded, the three labels total 232.24px
      // ("Menunggu Konfirmasi" alone is 143.33px) and the swatches and gaps add
      // roughly 116px — against 305px of plate content width at 375px. So it
      // takes two lines on a phone and one from tablet up. A legend on two
      // lines is not a defect; a truncated state name would be.
      className="flex flex-wrap items-center gap-x-5 gap-y-2"
    >
      {LEGEND_ROWS.map((row) => (
        <li key={row.status} className="flex items-center gap-2">
          {/* Decorative: the adjacent text already states the same fact, and a
              screen reader gains nothing from an unlabelled colour swatch. */}
          <span
            aria-hidden="true"
            className={cn("shrink-0", SWATCH_HEIGHT_WIDTH, row.swatchClassName)}
          />
          <span className="text-[length:var(--text-sm)] text-[var(--color-fg)]">{row.label}</span>
        </li>
      ))}
    </ul>
  );
}
