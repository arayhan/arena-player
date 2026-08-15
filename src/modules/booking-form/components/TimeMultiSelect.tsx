"use client";

import { FiX } from "react-icons/fi";

import type { TimeSlot } from "@/domain/slots";
import { cn } from "@/lib/cn";

import type { TimeOption } from "../booking-form.options";
import { useListbox } from "../booking-form.select";

/**
 * The time field — several hours, one booking, one control.
 *
 * THE SHAPE IS react-select's AND THE CODE IS NOT. A control box holding a chip
 * per chosen hour, a dropdown listing the whole day with its states, keyboard
 * navigation throughout — that is the interaction the user asked for, and it is
 * ~90 lines here against roughly 35-45KB gzip for the package plus `@emotion` on
 * a route that has 240KB to spend and has already spent 207 of it.
 *
 * CHIPS ARE SIBLINGS OF THE TRIGGER, NEVER INSIDE IT. A `<button>` inside a
 * `<button>` is invalid HTML and the browser's own recovery is to close the
 * outer one early, which silently breaks both. The box is a plain `div`: chips
 * first, then the trigger stretching across whatever is left, so a tap anywhere
 * in the empty part opens the list exactly as a single control would.
 *
 * EVERY HOUR IS LISTED, INCLUDING THE ONES NOBODY CAN BOOK. A dropdown holding
 * only free hours makes a nearly full day look like a day with two hours on
 * offer, and "why is 20.00 missing" has no answer on screen. Taken, pending and
 * elapsed rows stay, dimmed, each carrying its own state word — and they stay in
 * the arrow order too, so a keyboard visitor reaches 20.00 and hears "Terisi"
 * rather than finding it absent.
 */
export function TimeMultiSelect({
  id,
  options,
  selected,
  onToggle,
  onRemove,
  disabled,
  invalid,
  describedBy,
  placeholder,
}: {
  id: string;
  options: readonly TimeOption[];
  selected: readonly TimeSlot[];
  onToggle: (slot: TimeSlot) => void;
  onRemove: (slot: TimeSlot) => void;
  /** True while the rows are loading or failed — there is nothing to pick from yet. */
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  placeholder: string;
}) {
  const { open, setOpen, active, setActive, rootRef, triggerRef, onTriggerKeyDown } = useListbox({
    count: options.length,
    onCommit: (index) => {
      const option = options[index];
      // The refusal lives here rather than in the arrow keys: an unselectable
      // row is reachable on purpose, so pressing Enter on it has to be the thing
      // that does nothing.
      if (option?.selectable) onToggle(option.slot);
    },
  });

  const listId = `${id}-listbox`;

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          "flex min-h-12 w-full flex-wrap items-center gap-2 border-2 bg-[var(--color-bg)] p-1.5",
          invalid ? "border-[var(--color-danger-strong)]" : "border-[var(--color-band)]",
          // The box shows the trigger's focus ring, so focus is visible on the
          // object a sighted keyboard user is looking at rather than on the
          // button alone inside it.
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-focus)]",
        )}
      >
        {selected.map((slot) => (
          <span
            key={slot}
            className="inline-flex items-center gap-1 bg-[var(--color-accent-strong)] py-1 pr-1 pl-2 text-[length:var(--text-sm)] text-[var(--color-fg-inverse)]"
          >
            {slot}
            <button
              type="button"
              // The visible mark is decorative; the accessible name says which
              // hour is being removed, because "remove" alone in a row of four
              // chips names nothing.
              aria-label={`Hapus jam ${slot}`}
              onClick={() => onRemove(slot)}
              // 24 × 24 is WCAG 2.2's target-size minimum (2.5.8) exactly, and
              // that is the floor rather than an accident of the chip's height.
              className="flex size-6 items-center justify-center text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-accent-strong-hover)]"
            >
              {/* AN ICON, NOT THE `×` CHARACTER, AND THE DIFFERENCE IS MEASURED.
                  U+00D7 draws at x-height in Plus Jakarta Sans inside an 18px
                  inline box that also reserves ascender and descender space it
                  never uses — so flexbox centred the BOX correctly (offset x 0,
                  y -0.2 when measured) while the visible mark still sat high and
                  small: 8.5px of ink in a 24px target. Aligning a glyph aligns
                  the metrics, not the drawing. An SVG's viewBox IS its geometry,
                  so there is nothing between the two. Same set as the dropzone's
                  mark; icons come from a library here, never a generated glyph. */}
              <FiX aria-hidden="true" className="size-3.5 shrink-0" />
            </button>
          </span>
        ))}

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
          aria-describedby={describedBy}
          aria-disabled={disabled || undefined}
          onClick={() => {
            if (disabled) return;
            setOpen(!open);
          }}
          onKeyDown={disabled ? undefined : onTriggerKeyDown}
          className={cn(
            "flex min-h-9 flex-1 basis-40 items-center justify-between gap-3 px-1.5 text-left",
            disabled ? "cursor-not-allowed text-[var(--color-fg-muted)]" : "text-[var(--color-fg)]",
          )}
        >
          <span className={cn("truncate", selected.length > 0 && "sr-only")}>
            {selected.length > 0 ? `${selected.length} jam dipilih` : placeholder}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "ml-auto shrink-0 text-[length:var(--text-sm)] transition-transform duration-200",
              open && "rotate-90",
            )}
          >
            ›
          </span>
        </button>
      </div>

      {open && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label="Pilih jam"
          lang="id"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto border-2 border-[var(--color-band)] bg-[var(--color-bg)] shadow-[var(--shadow-md)]"
        >
          {options.map((option, index) => {
            const isSelected = selected.includes(option.slot);
            return (
              <li
                key={option.slot}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.selectable ? undefined : true}
                onPointerDown={(event) => {
                  event.preventDefault();
                  if (option.selectable) onToggle(option.slot);
                }}
                onPointerEnter={() => setActive(index)}
                className={cn(
                  // TWO LINES ON A PHONE, ONE FROM `sm`. MEASURED, not guessed:
                  // at 390px the hour, its state word and "Harga menyusul" need
                  // 368px inside a 316px row, so the price was cut off by 50px —
                  // the field that exists to answer "what does it cost" losing
                  // exactly that answer on the primary device.
                  "flex min-h-12 flex-col items-start justify-center gap-0.5 border-b-2 border-[var(--color-border)] px-3 py-2 last:border-b-0",
                  "sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                  index === active && option.selectable && "bg-[var(--color-wash)]",
                  option.selectable
                    ? "cursor-pointer text-[var(--color-fg)]"
                    : "cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]",
                  isSelected && "bg-[var(--color-wash)] font-semibold",
                )}
              >
                <span className="type-display text-[length:var(--text-label)] tracking-[0.02em] whitespace-nowrap">
                  {option.slot}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-[length:var(--text-sm)]">
                  {/* The state word carries the state, not colour alone — the
                      same WCAG 1.4.1 argument the slot cell makes. */}
                  <span
                    className={cn(
                      option.selectable
                        ? "text-[var(--color-interactive)]"
                        : "text-[var(--color-fg-muted)]",
                    )}
                  >
                    {isSelected ? "Dipilih" : option.statusLabel}
                  </span>
                  {/* An em dash where a taken hour's price would be. A blank
                      column reads as a missing value; the dash says there is
                      nothing to quote. */}
                  <span className="text-[var(--color-fg-muted)]">{option.priceLabel ?? "—"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
