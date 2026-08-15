"use client";

import { useState } from "react";

import { DatePills } from "@/components/DatePills";
import { SlotCell } from "@/components/SlotCell";
import { bookingWindow, todayAtField } from "@/domain/dates";
import type { TimeSlot } from "@/domain/slots";
import type { DisplaySlot } from "@/utils/slot-display";

import { SLOT_PRICE_LABEL } from "../booking-form.constants";

/**
 * THE SCHEDULE, EDITABLE IN THE FORM — added 2026-08-15.
 *
 * Until now `/booking` was handed a date and an hour in the URL and could only
 * send the visitor back to `/` to change them. That is a full page away from a
 * form they have already started filling in, and the round trip loses whatever
 * they typed. The picker brings the plate to them.
 *
 * IT IS THE SAME PLATE, NOT A SECOND VOCABULARY. `SlotCell` and `DatePills` are
 * the landing page's own components, moved to `src/components/` the same day so
 * both surfaces can render them — feature modules never import each other, so
 * shared vocabulary moves out rather than being copied. A visitor who chose an
 * hour on `/` meets the identical control here, in the identical states.
 *
 * SEVERAL HOURS, ONE BOOKING. Selection is an array. Two hours back to back is
 * the common case, and two apart on one day (a morning game and an evening one)
 * is a real booking that nothing here refuses. Each cell keeps `aria-pressed`,
 * which already carries multi-selection correctly — a toggle is a toggle whether
 * one or four of them are on.
 *
 * IT OWNS NO DATA AND NO SELECTION STATE. The rows, the current selection and
 * the dropped-hour list are all computed in `BookingForm`, which holds the form
 * state they belong to. That is not tidiness: an earlier draft fetched here and
 * pruned the parent's selection from an effect, which is a setState-in-effect
 * cascade — React's own lint rejects it, and the derived version cannot get out
 * of step with the form because there is nothing to keep in step.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: check availability again at submit time and
 * refuse to send. That is a check-then-insert race with a UI in front of it —
 * two visitors both pass the check, both submit, and the database is the only
 * thing that can settle it. `uniq_active_slot` does, and the form reads the 409.
 */
export function SchedulePicker({
  date,
  onDateChange,
  elapsed,
  live,
  isPending,
  isError,
  onRetry,
  selected,
  dropped,
  onToggle,
  invalid,
  errorId,
}: {
  date: string;
  onDateChange: (date: string) => void;
  elapsed: readonly DisplaySlot[];
  live: readonly DisplaySlot[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  selected: readonly TimeSlot[];
  /** Chosen hours the current rows show as gone. Announced, never silently lost. */
  dropped: readonly TimeSlot[];
  onToggle: (slot: TimeSlot) => void;
  invalid: boolean;
  errorId?: string;
}) {
  const [window] = useState(() => bookingWindow());
  const [today] = useState(() => todayAtField());
  const [showElapsed, setShowElapsed] = useState(false);

  return (
    <div
      // The focus target for a "pick at least one hour" error. The picker has no
      // input of its own, so without this the error would have nothing to send
      // focus to and a keyboard visitor would be told what is wrong with no way
      // to reach it. `id="slots"` matches the schema's field name, which is what
      // both the client parse and a server 400 look up.
      id="slots"
      tabIndex={-1}
      role="group"
      aria-label="Pilih tanggal dan jam"
      // NOT `aria-invalid` — ARIA does not support it on `role="group"`, and a
      // property a role does not support is one assistive technology may ignore
      // entirely. The error itself is announced by the `role="alert"` message
      // this group points at with `aria-describedby`, which every role supports.
      data-invalid={invalid || undefined}
      aria-describedby={errorId}
      lang="id"
      className="outline-none"
    >
      <div className="border-b-2 border-[var(--color-band)] py-3">
        <DatePills dates={window} selected={date} onSelect={onDateChange} />
      </div>

      {isPending ? (
        // Skeletons in the real grid at the real field height, so nothing shifts
        // under the finger when the rows land.
        <div
          className="grid -mr-0.5 -mb-0.5 sm:grid-cols-2"
          aria-busy="true"
          aria-label="Memuat jadwal"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[110px] animate-pulse border-r-2 border-b-2 border-[var(--color-band)] bg-[var(--color-bg-subtle)]"
            />
          ))}
        </div>
      ) : isError ? (
        // NEVER AN EMPTY GRID ON FAILURE — an empty grid reads as "fully booked",
        // which is the one wrong answer this product can give.
        <div className="bg-[var(--color-danger-surface)] p-4">
          <p className="font-semibold text-[var(--color-danger-strong)]">Gagal memuat jadwal</p>
          <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]">
            Koneksi bermasalah. Coba lagi.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="type-display mt-4 h-12 border-2 border-[var(--color-danger-strong)] px-6 text-[length:var(--text-label)] font-medium tracking-[0.06em] text-[var(--color-danger-strong)] uppercase transition-colors duration-200 hover:bg-[var(--color-danger-strong)] hover:text-[var(--color-fg-inverse)]"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          {elapsed.length > 0 ? (
            <div className="border-b-2 border-[var(--color-band)]">
              <button
                type="button"
                aria-expanded={showElapsed}
                onClick={() => setShowElapsed((v) => !v)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-[length:var(--text-sm)] text-[var(--color-fg-muted)] transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
              >
                <span
                  aria-hidden="true"
                  className={
                    showElapsed ? "rotate-90 transition-transform" : "transition-transform"
                  }
                >
                  ›
                </span>
                Sudah lewat ({elapsed.length})
              </button>

              {showElapsed ? (
                <div className="grid -mr-0.5 -mb-0.5 border-t-2 border-[var(--color-band)] sm:grid-cols-2">
                  {elapsed.map((s) => (
                    <SlotCell
                      key={s.slot}
                      slot={s.slot}
                      status={s.status}
                      selected={false}
                      onSelect={() => {}}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* THE GRID, AND THE RULE TRICK IT INHERITS. Every cell draws its own
              right and bottom rule and the grid pulls itself 2px past its
              container on both axes, so the last column's and last row's rules
              land outside the plate and are clipped. Every interior rule is
              drawn exactly once at any column count.

              TWO COLUMNS HERE, NEVER THREE. The landing page's plate is the full
              content width and reaches three columns at 1120px; this one sits
              inside a form plate that is a third narrower, and a third column
              would put the hour, its state and its price into a 200px field. */}
          <div className="grid -mr-0.5 -mb-0.5 sm:grid-cols-2">
            {live.map((s) => (
              <SlotCell
                key={s.slot}
                slot={s.slot}
                status={s.status}
                selected={selected.includes(s.slot)}
                onSelect={() => onToggle(s.slot)}
                // THE PRICE APPEARS HERE AND NOWHERE ON `/`. Hard rule 2: the
                // landing page renders no number of any kind, the form does —
                // and only because the visitor has already arrived through the
                // WhatsApp link. The cell takes it as a prop precisely so the
                // landing page cannot grow one by accident.
                priceLabel={SLOT_PRICE_LABEL}
              />
            ))}
          </div>

          {/* AN HOUR THAT WENT WHILE THE LINK SAT IN A CHAT. The entry link
              carries an hour the admin chose earlier and the visitor may open it
              a day later. A taken cell refuses selection — correctly — which
              means it also refuses DEselection, so saying nothing would leave a
              value in the payload with no control attached to it. */}
          {dropped.length > 0 ? (
            <p
              role="status"
              className="border-t-2 border-[var(--color-warning-line)] bg-[var(--color-warning-surface)] px-4 py-3 text-[length:var(--text-sm)] text-[var(--color-warning-strong)]"
            >
              Jam {dropped.join(", ")} sudah tidak tersedia, jadi dilepas dari pilihanmu. Silakan
              pilih jam lain.
            </p>
          ) : null}

          {/* The count line. It takes the danger ink once the form has
              complained, so the invalid state is visible at the grid rather than
              only in the message underneath it. The summary above already says
              "Belum ada jam dipilih", so this line says the part the summary
              cannot: what to do about it. */}
          <p
            className={
              invalid
                ? "px-4 py-3 text-[length:var(--text-sm)] font-semibold text-[var(--color-danger-strong)]"
                : "px-4 py-3 text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
            }
          >
            {selected.length === 0
              ? "Ketuk jam yang tersedia — bisa pilih lebih dari satu."
              : `${selected.length} jam dipilih${date === today ? " untuk hari ini" : ""}.`}
          </p>
        </>
      )}
    </div>
  );
}
