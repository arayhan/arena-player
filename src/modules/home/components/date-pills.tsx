"use client";

import { cn } from "@/lib/cn";

import { formatPill } from "../order.utils";

/**
 * The 14-day date row.
 *
 * THE ONLY FULLY ROUND SHAPE IN THE SYSTEM, and that is functional rather than
 * decorative: a row of pills reads as horizontally scrollable without an
 * arrow, a gradient fade, or a hint label. Everything else in the system sits
 * at 10px or 14px, which is what leaves 999px meaning something.
 *
 * `overscroll-behavior-x: contain` stops a sideways swipe bouncing the page
 * underneath the row — the defect is invisible on a trackpad and immediate on
 * the phone this site is designed for.
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
      className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] [overscroll-behavior-x:contain]"
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
              "shrink-0 rounded-full border px-4 py-2 text-center transition-colors duration-150",
              isSelected
                ? "border-[var(--color-interactive)] bg-[var(--color-interactive)] text-[var(--color-fg-inverse)]"
                : // HOVER HAS TO CHANGE THE BORDER, NOT ONLY THE FILL.
                  // `--color-wash` and `--color-page` are both blue-50, so the
                  // fill this pill hovers to is EXACTLY the band it sits on —
                  // measured, white to rgb(239,246,255) against a body of
                  // rgb(239,246,255). The pill did not light up, it dissolved,
                  // and with the border left at the hairline there was no
                  // hover feedback at all. DESIGN.md's Date Pill spec already
                  // called for both halves: "Hover: blue-50 fill, blue-600
                  // border". Only the fill had been implemented.
                  "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:border-[var(--color-interactive)] hover:bg-[var(--color-wash)]",
            )}
          >
            <span
              className={cn(
                "block text-[length:var(--text-xs)]",
                // The day name is secondary INSIDE an unselected pill, but on
                // the filled pill it sits on blue-600, where the muted navy
                // would drop under AA. It inherits the pill's own colour there
                // instead of keeping a mute that only works on white.
                isSelected ? "opacity-80" : "text-[var(--color-fg-muted)]",
              )}
            >
              {day}
            </span>
            <span className="block font-medium whitespace-nowrap">
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
