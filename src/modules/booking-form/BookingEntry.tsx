import Link from "next/link";

import type { TimeSlot } from "@/domain/slots";
import { cn } from "@/lib/cn";

import { BookingForm } from "./BookingForm";
import { readBookingParams } from "./booking-form.params";

export interface BookingEntryProps {
  /**
   * Raw query params, exactly as `src/app/booking/page.tsx` hands them over —
   * `undefined` when absent, whatever text was on the URL otherwise.
   * `readBookingParams` does the actual validating; this component only
   * routes on the result.
   */
  date?: string;
  /** One value, or one per booked hour — the URL repeats the key. */
  time?: string | string[];
}

// Shared by both non-happy-path notices so the two buttons are pixel-for-pixel
// the same control, styled off the same CTA used in the footer's closing CTA
// (HomePage.tsx) — one destination, one visual language for "go pick a slot".
// SQUARE AND 56px, MATCHING THE PLATE — carbonized 2026-08-14 with the layout
// round the user accepted for the happy path. These two notices are the SAME
// ROUTE in its other states, and leaving them at the old 10px radius and 48px
// height would have given one URL two visual languages depending on whether the
// slot was still valid. The label takes the display face at the `label` role,
// like every other button in the system.
const CTA_CLASS =
  "type-display mt-8 inline-flex h-14 items-center justify-center bg-[var(--color-accent-strong)] px-6 text-[length:var(--text-label)] font-medium tracking-[0.06em] text-[var(--color-fg-inverse)] uppercase transition-colors hover:bg-[var(--color-accent-strong-hover)]";

// A PLATE, not a rounded card. Same 3px navy edge the happy path and the landing
// page's order panel both carry, so all three read as one product. These notices
// are this URL in its other states — an edge that changed with the state would
// have given one route two visual languages depending on whether the slot was
// still valid. Signal Blue until 2026-08-15; see the plate comment in
// BookingForm.tsx for why the accent came off every structural edge.
const PANEL_CLASS = "border-[3px] border-[var(--color-band)] bg-[var(--color-bg)] p-6 md:p-8";

// Hand-written Indonesian month abbreviations, the same technique
// src/modules/home/order.utils.ts uses for the wa.me message template.
// Duplicated rather than imported: feature modules never import each other
// (dev-rules.md), and a three-word date formatter is presentation, not shared
// vocabulary — it does not belong in src/domain/ next to slots and dates.
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

/** `2026-08-16` -> `16 Agu 2026`. Parsed as plain numbers, never `new Date(string)` —
 * that parses as UTC midnight and can render a day early west of Greenwich. */
function formatDisplayDate(date: string): string {
  const [year, month, dayOfMonth] = date.split("-").map(Number);
  return `${dayOfMonth} ${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * `/booking`'s entry router — Phase 3 task 1.
 *
 * TWO ENTRIES SINCE 2026-08-15. The order section's hand-off band on `/` now
 * links straight here with `date` and `time` already correct, which is the main
 * path and arrives `valid`. The second is the one this component was built for
 * and still exists for: a link pasted into WhatsApp by the admin (or sent by
 * the bot later), where a malformed or stale link is routine rather than an
 * edge case — a link sitting in a chat has no deploy and no rollback. A blank
 * form or a crash is the one response it may never give — see
 * `booking-form.params.ts` for the three-way split this switches on.
 */
export function BookingEntry({ date, time }: BookingEntryProps) {
  const params = readBookingParams(date, time);

  return (
    <main className="flex-1">
      {/* THE CONTAINER FINALLY MATCHES THE LANDING PAGE. `max-w-[1100px]`
          was the PRE-REDESIGN value: the container went to 1280px on
          2026-08-12 and this route never followed, so the two surfaces
          measured differently on the same screen. The padding takes the
          section tokens for the same reason — one rhythm, not two. */}
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--space-section-x)] py-[clamp(44px,7vw,96px)]">
        {/* AN EXPIRED LINK NO LONGER ENDS AT A NOTICE — changed 2026-08-15,
            when the form grew a schedule picker. Until then this route could not
            change the schedule, so a stale link had nowhere to go but a dead end
            with a way back to `/`. Now the one thing an expired link needs is
            exactly what the form does: it opens on that link's date with NO hour
            selected, and the visitor picks a live one without leaving the page.
            `ExpiredNotice` still exists and still explains itself — it renders
            above the form rather than instead of it.

            `unusable` keeps the notice alone. There is no date to open on: the
            URL had nothing readable in it, so a picker would be opening on a
            guess. */}
        {params.kind === "valid" ? (
          <BookingForm date={params.date} slots={params.slots} expired={params.expired} />
        ) : params.kind === "expired" ? (
          <div className="flex flex-col gap-6">
            <ExpiredNotice date={params.date} slots={params.slots} />
            <BookingForm date={params.date} slots={[]} expired={params.slots} />
          </div>
        ) : (
          <UnusableNotice />
        )}
      </div>
    </main>
  );
}

/**
 * Missing, unparseable, or not a real slot — a link that never worked.
 * Deliberately vaguer than `ExpiredNotice`: there is no date or slot worth
 * naming because `readBookingParams` could not read one out of the URL.
 */
function UnusableNotice() {
  return (
    <div className={PANEL_CLASS}>
      {/* Sized off --text-h2, not the global h1 (--text-display). See the
          matching comment on BookingForm's own <h1> in BookingForm.tsx for
          the full reasoning — duplicated rather than shared per this file's
          own convention of not importing small presentational decisions
          across these two files. Short version: this route's h1 is a single
          page-level heading with no sibling display content, DESIGN.md's
          display scale is measured against the hero's one-word-per-line
          headline and overflows 375px on multi-word Indonesian titles, and
          h2's 28px->56px "section heading" role is the closest defined scale.
          Only font-size is borrowed; weight/leading/tracking/case stay h1's. */}
      <h1 lang="id" className="max-w-[20ch] text-[length:var(--text-h2)]">
        Tautan Booking Tidak Valid
      </h1>
      <p lang="id" className="mt-4 max-w-[60ch] text-[color:var(--color-fg-muted)]">
        Tautan ini tidak lengkap atau tidak bisa dibaca. Coba cek jadwal kosong dan pilih jam yang
        masih tersedia lewat WhatsApp.
      </p>
      <Link href="/#order" lang="id" className={cn(CTA_CLASS)}>
        Lihat Jadwal Kosong
      </Link>
    </div>
  );
}

/**
 * Well-formed but past — a link that USED to work. Names the date and slot it
 * was for on purpose: a visitor whose link expired already knows there was a
 * slot behind it, and telling them nothing reads as the same broken link as
 * `UnusableNotice`, which it is not.
 */
function ExpiredNotice({ date, slots }: { date: string; slots: readonly TimeSlot[] }) {
  return (
    /* THE DANGER SURFACE, NOT THE PLATE'S — changed 2026-08-16. This notice used
       to wear `PANEL_CLASS`, the same navy-edged white plate as the payment
       panel and the form itself, which meant an expired link looked exactly like
       a page working normally. It is the one state on this route that is a
       problem rather than a step, and it now says so before it is read.

       `role="alert"` so it is announced rather than found: a visitor who
       followed a stale link arrives with the answer already scrolled past. */
    <div
      role="alert"
      className="border-[3px] border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-6 md:p-8"
    >
      {/* Sized off --text-h2 — see the comment on UnusableNotice's <h1>
          above for the reasoning. */}
      <h1
        lang="id"
        className="max-w-[24ch] text-[length:var(--text-h2)] text-[var(--color-danger-strong)]"
      >
        Jadwal Ini Sudah Lewat
      </h1>
      <p lang="id" className="mt-4 max-w-[60ch] text-[color:var(--color-danger-strong)]">
        Tautan ini untuk tanggal {formatDisplayDate(date)} jam {slots.join(", ")}, dan jamnya sudah
        lewat. Pilih tanggal dan jam lain di bawah — form di bawah sudah terbuka di tanggal itu.
      </p>
      <Link href="/#order" lang="id" className={cn(CTA_CLASS)}>
        Lihat Jadwal Kosong
      </Link>
    </div>
  );
}
