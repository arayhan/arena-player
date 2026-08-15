"use client";

import { cn } from "@/lib/cn";

import { formatPill } from "../order.utils";

/**
 * The 14-day date row, along the head of the plate.
 *
 * THE ONLY FULLY ROUND SHAPE IN THE SYSTEM, and "Pelat Enamel" makes that
 * exception louder rather than weaker. The plate and every field in it is now
 * square, so a row of capsules sitting on it is unmistakably a different KIND
 * of thing — which is the entire job the roundness was doing: a row of pills
 * reads as horizontally scrollable without an arrow, a gradient fade, or a hint
 * label. Squaring these off to match the plate would have been consistency
 * bought by deleting the one signal that says "this row scrolls".
 *
 * THE PILLS SPEAK THE PLATE'S FACE NOW. Both lines take the display face
 * uppercase — the sign's own voice — where the date used to sit in the body
 * face. Measured with Panchang loaded: "HARI INI" is 81.02px at 14px/700
 * against 49.98px for "Hari ini" in Plus Jakarta Sans at 16px, so a pill is
 * roughly 30px wider than it was. That is affordable precisely because this row
 * scrolls: the cost of a wide face lands on how many pills are visible at once,
 * not on whether the row fits, and the row has never been required to fit.
 *
 * `overscroll-behavior-x: contain` stops a sideways swipe bouncing the page
 * underneath the row — the defect is invisible on a trackpad and immediate on
 * the phone this site is designed for. The scrollbar itself is hidden across
 * engines (`scrollbar-width`, `-ms-overflow-style`, the WebKit pseudo-element),
 * because the pill shape is what already says "this scrolls" — a visible
 * scrollbar is a second device doing the same job.
 */
export function DatePills({
  dates,
  selected,
  onSelect,
}: {
  dates: readonly string[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Pilih tanggal"
      lang="id"
      className="flex gap-2 overflow-x-auto pb-1 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {dates.map((date, index) => {
        const { day, label } = formatPill(date);
        const isSelected = date === selected;

        return (
          <button
            key={date}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(date)}
            className={cn(
              // 64px minimum width, 10px vertical / 16px horizontal padding —
              // DESIGN.md's Date Pill spec.
              "min-w-16 shrink-0 rounded-[var(--radius-pill)] border-2 px-4 py-[10px] text-center",
              "transition-colors duration-150",
              isSelected
                ? "border-[var(--color-interactive)] bg-[var(--color-interactive)] text-[var(--color-fg-inverse)]"
                : // TWO SIGNALS ON HOVER, AND THE 2px LIFT IS NO LONGER ONE OF
                  // THEM. DESIGN.md's Date Pill spec reads "blue-50 fill,
                  // blue-600 border, 2px lift", and the lift was there as a
                  // second signal because the fill used to be invisible — the
                  // pills sat on the `blue-50` page ground and hovered to
                  // `blue-50`. On the plate they sit on WHITE, so the fill is a
                  // real change on its own and the border is the second signal
                  // beside it. The lift goes because nothing on an enamel sign
                  // lifts: it is the one motion in this section that would have
                  // claimed a depth the world does not have.
                  "border-[var(--color-band)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:border-[var(--color-interactive)] hover:bg-[var(--color-wash)]",
            )}
          >
            <span
              className={cn(
                "type-display block text-[length:var(--text-xs)] font-medium tracking-[0.1em] uppercase",
                // The day name is secondary INSIDE an unselected pill, but on
                // the filled pill it sits on blue-600, where the muted navy
                // would drop under AA. It takes the pill's own colour there,
                // AT FULL STRENGTH — the first fix for this was `opacity-80`,
                // which measured 3.89:1 against the fill (white at 80%
                // composites to rgb(211,224,251)) and is under AA at 12px,
                // trading one contrast failure for a quieter one. DESIGN.html
                // recorded this as a P0 and its rule is the one applied here:
                // the day separates from the date by SIZE, never by
                // transparency. Full white is 5.17:1.
                isSelected ? undefined : "text-[var(--color-fg-muted)]",
              )}
            >
              {day}
            </span>
            <span className="type-display mt-0.5 block text-[length:var(--text-sm)] font-bold tracking-[0.02em] whitespace-nowrap uppercase">
              {/* Today is the default and reads as a word, not a date: it is
                  the day people actually want, and the far end of the window
                  is the secondary path. */}
              {index === 0 ? "Hari ini" : label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
