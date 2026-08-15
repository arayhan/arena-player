"use client";

import { cn } from "@/lib/cn";

import { useListbox } from "../booking-form.select";

/**
 * The date field — a single select over the 14 bookable days.
 *
 * IT WAS THE LANDING PAGE'S PILL ROW FOR HALF A DAY, and that is what this
 * replaces. A horizontally scrolling row of capsules is right on the landing
 * plate, where it is the page's own furniture; sitting between "Jadwal terpilih"
 * and "Nama Tim / Pemesan" it read as the homepage pasted into a form. Two
 * labelled selects read as what this is: a form.
 */
export function DateSelect({
  id,
  dates,
  value,
  onChange,
  formatOption,
}: {
  id: string;
  dates: readonly string[];
  value: string;
  onChange: (date: string) => void;
  /** `2026-08-16` → `Minggu, 16 Agustus 2026`. Owned by the form, not by this control. */
  formatOption: (date: string) => string;
}) {
  const { open, setOpen, active, setActive, rootRef, triggerRef, onTriggerKeyDown } = useListbox({
    count: dates.length,
    onCommit: (index) => {
      onChange(dates[index]);
      setOpen(false);
      triggerRef.current?.focus();
    },
  });

  const listId = `${id}-listbox`;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        lang="id"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onClick={() => {
          setActive(Math.max(0, dates.indexOf(value)));
          setOpen(!open);
        }}
        onKeyDown={onTriggerKeyDown}
        className="flex h-12 w-full items-center justify-between gap-3 border-2 border-[var(--color-band)] bg-[var(--color-bg)] px-3 text-left text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-subtle)]"
      >
        <span className="truncate">{formatOption(value)}</span>
        {/* The caret is the one thing on this control that says "there is more
            behind me". It rotates rather than swapping glyphs, so nothing
            reflows on open. */}
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 text-[length:var(--text-sm)] transition-transform duration-200",
            open && "rotate-90",
          )}
        >
          ›
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Pilih tanggal"
          lang="id"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto border-2 border-[var(--color-band)] bg-[var(--color-bg)] shadow-[var(--shadow-md)]"
        >
          {dates.map((date, index) => {
            const selected = date === value;
            return (
              <li
                key={date}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={selected}
                // `pointerdown`, not `click`: the dismissal listener in
                // `useListbox` runs on pointerdown too, and a click handler here
                // would fire only after that listener had already closed the
                // list out from under it.
                onPointerDown={(event) => {
                  event.preventDefault();
                  onChange(date);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                onPointerEnter={() => setActive(index)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center px-3 py-2",
                  index === active && "bg-[var(--color-wash)]",
                  selected && "font-semibold text-[var(--color-interactive)]",
                )}
              >
                {formatOption(date)}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
