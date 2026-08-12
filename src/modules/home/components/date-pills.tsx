"use client";

import { cn } from "@/lib/cn";

import { formatPill } from "../order.utils";

/**
 * The 14-day date row.
 *
 * THE ONLY FULLY ROUND SHAPE IN THE SYSTEM, and that is functional rather than
 * decorative: a row of pills reads as horizontally scrollable without an
 * arrow, a gradient fade, or a hint label. Everything else in the system sits
 * at 12px or 22px, which is what leaves 9999px meaning something.
 *
 * `overscroll-behavior-x: contain` stops a sideways swipe bouncing the page
 * underneath the row — the defect is invisible on a trackpad and immediate on
 * the phone this site is designed for. The scrollbar itself is hidden across
 * engines (`scrollbar-width`, `-ms-overflow-style`, the WebKit pseudo-element):
 * DESIGN.md's Date Pill spec says the row scrolls "with its scrollbar hidden",
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
      className="flex gap-2 overflow-x-auto pb-2 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              // DESIGN.md's Date Pill spec. `transition` (not `transition-colors`)
              // because the hover lift below animates `transform` too.
              "min-w-16 shrink-0 rounded-[var(--radius-pill)] border px-4 py-[10px] text-center transition duration-150",
              isSelected
                ? "border-[var(--color-interactive)] bg-[var(--color-interactive)] text-[var(--color-fg-inverse)]"
                : // HOVER HAS TO CHANGE THE BORDER, NOT ONLY THE FILL.
                  // `--color-wash` and `--color-page` are both blue-50, so the
                  // fill this pill hovers to is EXACTLY the band it sits on —
                  // measured, white to rgb(239,246,255) against a body of
                  // rgb(239,246,255). DESIGN.md: "Hover: blue-50 fill, blue-600
                  // border, 2px lift" — the lift is the second signal here, the
                  // same role `--glow-interactive` plays on the slot cell.
                  "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:-translate-y-0.5 hover:border-[var(--color-interactive)] hover:bg-[var(--color-wash)]",
            )}
          >
            <span
              className={cn(
                "block text-[length:var(--text-xs)]",
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
