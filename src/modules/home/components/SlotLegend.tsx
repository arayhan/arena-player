import { cn } from "@/lib/cn";

import type { DisplayStatus } from "../order.utils";

/**
 * The three-row key beside the order panel — DESIGN.md's Order section, "The
 * legend" paragraph.
 *
 * THREE LIVE STATES ONLY, `elapsed` DELIBERATELY EXCLUDED. DESIGN.md is
 * explicit: "it carries the three live states only; elapsed is explained by
 * its own collapsed group's label and adding a fourth row would imply
 * elapsed slots are something a visitor might act on." The collapsed
 * `Sudah lewat (N)` group in the order panel is where that state is
 * explained instead.
 *
 * LABEL TEXT MATCHES THE PRODUCT, NOT THE PROSE. DESIGN.md's Order section
 * writes "Menunggu konfirmasi" (lowercase k); `SlotCell.tsx`'s STATE_LABEL
 * renders "Menunggu Konfirmasi" (capital K) — that second one is what a
 * visitor actually sees on a pending cell, so the legend has to say the same
 * thing or it stops matching what it is explaining. Using DESIGN.md's own
 * casing here would make the legend and the grid disagree about a label a
 * visitor is meant to compare the two against.
 */
const LEGEND_ROWS: ReadonlyArray<{
  readonly status: Exclude<DisplayStatus, "elapsed">;
  readonly label: string;
  readonly swatchClassName: string;
}> = [
  {
    status: "available",
    label: "Tersedia",
    // Same triple as SlotCell's selectable branch: white fill, blue-600 border.
    swatchClassName: "border-[var(--color-interactive)] bg-[var(--color-bg)]",
  },
  {
    status: "pending",
    label: "Menunggu Konfirmasi",
    swatchClassName: "border-[var(--color-warning-line)] bg-[var(--color-warning-surface)]",
  },
  {
    status: "booked",
    label: "Terisi",
    swatchClassName: "border-[var(--color-danger-line)] bg-[var(--color-danger-surface)]",
  },
];

/**
 * THE RADIUS CONFLICT, AND HOW IT IS RESOLVED HERE.
 *
 * DESIGN.md's Order section spec asks for "a 40×22px chip at rounded.control"
 * — `--radius-control` is 12px. But DESIGN.md's own One-Round-Shape Rule
 * ("Nothing else in the system is fully round. The moment a second element
 * takes the pill radius, the date row stops meaning 'this scrolls' and
 * becomes just another style") is violated by those exact numbers, not by an
 * implementation choice: CSS clamps a rectangle's corner radius to at most
 * half its shorter side, so a 22px-tall box can render at most an 11px
 * corner before adjacent corners start to overlap. A 12px request on a 22px
 * box therefore ALREADY renders as a capsule — visually indistinguishable
 * from the pill — regardless of the token value written in the class list.
 * The spec's two rules contradict each other at these dimensions; this is
 * not a rendering bug to work around, it is a numbers problem to resolve.
 *
 * Three ways out were on the table: (a) shrink the radius below 12px, which
 * "No third radius" forbids outright ("Three radii plus a pill is a system
 * nobody can hold in their head"); (b) drop `rounded.control` for something
 * bespoke, which loses the visual link between this swatch and the actual
 * `SlotCell` it is illustrating — the cell it explains uses
 * `--radius-control` too; or (c) grow the chip's height so 12px stops being
 * at least half of it. (c) is what ships: height goes from the spec's 22px
 * to 28px (`h-7`), width stays close to the spec's 40px (`w-10`). Half of
 * 28px is 14px, strictly above the 12px radius, so all four corners stay
 * genuinely rounded rather than capsule-clamped, `--radius-control` is kept
 * intact (no fourth radius is invented), and the swatch still reads as the
 * same rounding language as the slot grid beside it. The One-Round-Shape
 * Rule holds: the date pill remains the only fully round shape on the page.
 */
const SWATCH_HEIGHT_WIDTH = "h-7 w-10"; // 28 x 40px — see the block comment above

export function SlotLegend() {
  return (
    <ul lang="id" aria-label="Keterangan status jadwal" className="flex flex-col gap-3">
      {LEGEND_ROWS.map((row) => (
        <li key={row.status} className="flex items-center gap-3">
          {/* Decorative: the adjacent text already states the same fact, and a
              screen reader gains nothing from an unlabelled colour swatch. */}
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 rounded-[var(--radius-control)] border-[1.5px]",
              SWATCH_HEIGHT_WIDTH,
              row.swatchClassName,
            )}
          />
          <span className="text-[length:var(--text-sm)] text-[var(--color-fg)]">{row.label}</span>
        </li>
      ))}
    </ul>
  );
}
