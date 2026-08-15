"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiImage } from "react-icons/fi";
import { useForm } from "react-hook-form";

import { bookingWindow, isWithinBookingWindow, todayAtField } from "@/domain/dates";
import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";
import { cn } from "@/lib/cn";

import { buildTimeOptions } from "./booking-form.options";
import { checkProof, PROOF_ACCEPT, type ProofProblem } from "./booking-form.proof";
import {
  useBookingAvailability,
  useCreateBooking,
  useRefreshAvailability,
} from "./booking-form.queries";
import { bookingFormSchema, type BookingFormValues } from "./booking-form.schema";
import type { BookingOutcome } from "./booking-form.service";
import { DateSelect } from "./components/DateSelect";
import { TimeMultiSelect } from "./components/TimeMultiSelect";

export interface BookingFormProps {
  /** The date the entry link carried, and the picker's starting date. */
  date: string;
  /**
   * The slot the entry link carried, preselected in the picker. **Null for an
   * expired link**, which now opens the picker with nothing chosen rather than
   * ending at a notice: an expired link is exactly when a visitor needs to pick
   * a different time.
   */
  slot: TimeSlot | null;
}

/**
 * TWO FIELDS ARE HIDDEN, AND THESE CONSTANTS ARE THE WHOLE MECHANISM — so
 * bringing either back is one word, and the reason travels with the switch
 * instead of living in a commit message.
 *
 * PHONE, hidden 2026-08-15: the visitor arrives through the admin's WhatsApp
 * link, so the admin already has the number from the chat that sent them here.
 * Asking for it again is a field that buys nothing.
 *
 * PROOF, hidden the same day: payment proof is handled in that same chat for
 * now. The dropzone, its drag handlers, `booking-form.proof.ts` and the
 * react-icons mark all stay in this file — hidden is not deleted.
 *
 * WHAT THIS DOES NOT TOUCH: the payload keys, `booking-form.schema.ts`'s field
 * names, or the columns. The schema validates both fields IF a value is present
 * and requires neither, which is what lets a hidden field submit without ever
 * fabricating a phone number. `phone not null` and `proof_key not null` in
 * db/migrations still contradict that — recorded in database.md as Phase 4 debt.
 */
const SHOW_PHONE_FIELD = false;
const SHOW_PROOF_FIELD = false;

// A PANEL OF ONE PLATE, NOT A CARD — carbonized 2026-08-14 from the
// layout round the user accepted on /booking. It was
// `rounded-[14px] border border-[var(--color-border)]`, which is a
// rounded card floating in a gap: the exact arrangement "Pelat Enamel"
// was defined against, and the one the landing page spent its whole
// rewrite removing. Three stacked cards are now three panels divided by
// the plate's own 2px navy rules, which is what the order panel does.
//
// `border-b` ONLY. The plate draws its outer edge once, on the wrapper;
// a panel that also drew left, right and top would double every seam.
const PANEL_CLASS = "border-b-2 border-[var(--color-band)] bg-[var(--color-bg)] px-4 py-4 md:px-6";

const CTA_CLASS =
  "type-display mt-4 inline-flex h-14 items-center justify-center bg-[var(--color-accent-strong)] px-6 text-[length:var(--text-label)] font-medium tracking-[0.06em] text-[var(--color-fg-inverse)] uppercase transition-colors hover:bg-[var(--color-accent-strong-hover)]";

const INPUT_CLASS =
  // SQUARE, AND A 2px NAVY RULE RATHER THAN A GREY HAIRLINE. `rounded.control`
  // is 0px system-wide since 2026-08-13, and on this plate a field is a
  // ruled box like a slot cell rather than a floating input.
  "h-12 w-full border-2 border-[var(--color-band)] bg-[var(--color-bg)] px-3 text-[var(--color-fg)] outline-none";
// THE MERGE ORDER IS LOAD-BEARING HERE. This class is passed to `cn()` AFTER
// `INPUT_CLASS`, so tailwind-merge drops the navy above and keeps whatever
// border colour this string names. It said `--color-border` — a grey #e5e7eb
// hairline — from the carbonize round until 2026-08-15, which is why the two
// text inputs rendered grey while the textarea and the dropzone beside them,
// neither of which goes through this constant, rendered navy. Nothing in the
// file said "grey": the navy was written and silently overridden.
const INPUT_VALID_CLASS = "border-[var(--color-band)]";
const INPUT_ERROR_CLASS = "border-[var(--color-danger-line)] bg-[var(--color-danger-surface)]";

const LABEL_CLASS = "block text-[length:var(--text-sm)] font-semibold text-[var(--color-fg)]";

const PROOF_ERROR_MESSAGE: Record<ProofProblem, string> = {
  missing: "Bukti transfer wajib diunggah",
  wrong_type: "Format harus JPG, PNG, atau WEBP",
  too_large: "Ukuran file maksimal 2MB",
};

// Duplicated rather than imported from BookingEntry.tsx on purpose, same
// reasoning that file already states: feature modules never import each
// other, and this three-word date formatter is presentation, not shared
// vocabulary — it does not belong in src/domain/ next to slots and dates.
// Parsed as plain numbers, never `new Date(string)`, which parses as UTC
// midnight and can render a day early west of Greenwich.
const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

function formatSummaryDate(date: string): string {
  const [year, month, dayOfMonth] = date.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, dayOfMonth).getDay();
  return `${DAY_NAMES[dayOfWeek]}, ${dayOfMonth} ${MONTH_NAMES[month - 1]} ${year}`;
}

function describedBy(...ids: Array<string | false | undefined>): string | undefined {
  const list = ids.filter((id): id is string => Boolean(id));
  return list.length > 0 ? list.join(" ") : undefined;
}

/**
 * `/booking`'s form — Phase 3. Only ever mounted for the "valid" branch of
 * `BookingEntry`; the expired/unusable states are handled entirely there.
 *
 * NO ZOD RESOLVER. `@hookform/resolvers` is not an installed dependency and
 * the stack is fixed, so `bookingFormSchema` is run by hand inside the
 * submit handler instead — react-hook-form only tracks values and drives
 * `setError`.
 */
export function BookingForm({ date, slot }: BookingFormProps) {
  // THE DATE IS STATE NOW, NOT JUST A PROP. The picker can move it, and the
  // link's date is only where it starts. One booking is one date, so this is
  // also what the mutation posts.
  //
  // A DATE OUTSIDE THE WINDOW FALLS BACK TO TODAY, and without this the expired
  // branch would hang: `useBookingAvailability` is disabled outside the 14-day
  // window by contract, so a link pointing at last week would leave the picker
  // showing loading skeletons forever — no error, no rows, nothing to click.
  const [bookingDate, setBookingDate] = useState(() =>
    isWithinBookingWindow(date) ? date : todayAtField(),
  );

  // Server-side field errors that have no input on screen to attach to. See
  // the submission effect below for why they cannot be dropped.
  const [unmappedFields, setUnmappedFields] = useState<string[]>([]);

  const mutation = useCreateBooking(bookingDate);
  const refetchAvailability = useRefreshAvailability(bookingDate);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues: {
      // The link's slot is a STARTING selection, not a lock. An expired link
      // arrives with none and the picker opens empty.
      slots: slot ? [slot] : [],
      teamName: "",
      phone: "",
      notes: "",
      website: "",
      proof: null,
    },
  });

  const notes = watch("notes") ?? "";
  const proofFile = watch("proof");
  const chosenSlots = watch("slots") ?? [];

  // THE ROWS LIVE HERE, NOT IN THE PICKER, because the selection they have to
  // agree with lives here. An earlier draft fetched inside the picker and pruned
  // this form's selection from an effect — a setState cascade React's own lint
  // rejects, and one that can fall out of step for a render. Derived from the
  // same rows in one place, the two cannot disagree at all.
  const availability = useBookingAvailability(bookingDate);
  const timeOptions = useMemo(
    () => buildTimeOptions(availability.data ?? [], bookingDate),
    // The clock is deliberately NOT a dependency: an hour sliding into "sudah
    // lewat" under the visitor's finger is worse than a row that is a minute
    // stale, and the server refuses a past slot anyway.
    [availability.data, bookingDate],
  );
  const bookable = useMemo(
    () => new Set(timeOptions.filter((o) => o.selectable).map((o) => o.slot)),
    [timeOptions],
  );

  // AN HOUR THAT WENT WHILE THE LINK SAT IN A WHATSAPP CHAT. The entry link
  // carries the hour the admin picked earlier, and the visitor may open it a day
  // later. Until the rows arrive nothing is known, so the chosen list stands as
  // it is; once they do, an hour the grid shows as taken stops counting as
  // selected and is named in the picker instead of vanishing.
  //
  // DERIVED, NEVER STORED. Writing the pruned list back into form state would be
  // the effect this replaced. Everything downstream — the summary, the payload,
  // the toggle handler — reads `selectedSlots`, so the stale value in the form
  // has no consumer and cannot leak into a booking.
  //
  // THIS IS NOT THE CHECK-THEN-INSERT THE RACE RULE FORBIDS. It refuses no
  // submission and asks nothing before sending; it only stops carrying an hour
  // the rows on screen already show as gone. The database stays the authority,
  // through `uniq_active_slot` and the 409.
  const rowsReady = !availability.isPending && !availability.isError;
  const selectedSlots = rowsReady ? chosenSlots.filter((s) => bookable.has(s)) : chosenSlots;
  const droppedSlots = rowsReady ? chosenSlots.filter((s) => !bookable.has(s)) : [];

  // The 14-day window and today's date, read once. `useState`'s initialiser
  // rather than a module constant: both are clock-derived, and a module constant
  // would freeze the window at the moment the chunk was first evaluated.
  const [window] = useState(() => bookingWindow());
  const [today] = useState(() => todayAtField());

  // ONE HANDLER FOR THE CHIP'S × AND THE OPTION ROW, because removing an hour
  // and un-picking it are the same event with two entry points — and two code
  // paths for one state change is how they drift.
  //
  // READ THROUGH `getValues`, NEVER THE WATCHED SNAPSHOT. Two taps inside one
  // frame both close over the SAME render's value, so the second computes from a
  // selection that does not yet include the first and silently overwrites it.
  // Measured: two programmatic clicks in one tick produced one selected hour,
  // not two.
  const toggleSlot = (toggled: TimeSlot) => {
    const current = (getValues("slots") ?? []).filter((s) => bookable.has(s));
    const next = current.includes(toggled)
      ? current.filter((s) => s !== toggled)
      : [...current, toggled];
    // Sorted by the canonical order rather than by tap order, so the summary
    // reads as a schedule instead of a history of taps.
    next.sort((a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b));
    setValue("slots", next, { shouldDirty: true });
    if (next.length > 0) clearErrors("slots");
  };

  // Collapses the mutation's own state machine onto BookingOutcome so the
  // render below only ever switches on `.kind`. `mutation.data` already IS a
  // BookingOutcome for every EXPECTED response (201/409/429/400) — only a
  // genuine transport failure needs folding in here.
  const outcome: BookingOutcome | null = useMemo(() => {
    if (mutation.isSuccess) return mutation.data;
    if (mutation.isError) return { kind: "server_error" };
    return null;
  }, [mutation.isSuccess, mutation.isError, mutation.data]);

  const submit = handleSubmit((values) => {
    // Refuses the press here rather than on the button: the button keeps
    // aria-disabled instead of the native attribute, which keeps it in the
    // tab order, so the handler is what actually has to say no.
    if (mutation.isPending) return;

    clearErrors();
    // `selectedSlots`, not `values.slots` — the derived list is the one every
    // other consumer shows, and posting the raw form value would send an hour
    // the picker already told the visitor was gone.
    const parsed = bookingFormSchema.safeParse({ ...values, slots: selectedSlots });
    if (!parsed.success) {
      let firstField: string | undefined;
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field !== "string") continue;
        firstField ??= field;
        setError(field as keyof BookingFormValues, { type: "manual", message: issue.message });
      }
      if (firstField) document.getElementById(firstField)?.focus();
      return;
    }

    mutation.mutate(parsed.data);
  });

  // Focus management on submission. A 400 maps `fields` onto the matching
  // inputs and sends focus to the first one; every other terminal outcome
  // (created, slot_taken, rate_limited, server_error) sends focus to the
  // result message — a 409 is the case this is written down for, but
  // treating it as the only one would leave a rate-limited visitor staring
  // at a form that looks like it did nothing.
  useEffect(() => {
    if (!outcome) return;

    if (outcome.kind === "validation_failed") {
      let firstField: string | undefined;
      const unrendered: string[] = [];

      for (const [field, message] of Object.entries(outcome.fields)) {
        // A 400 MAY NAME A FIELD THIS FORM DOES NOT RENDER, and since two of
        // them are hidden that is no longer hypothetical. `setError` on an
        // unrendered field marks nothing, focuses nothing, and leaves a submit
        // button that visibly does nothing at all — the worst failure a form
        // has, because it looks like a broken button rather than a rejected
        // value. Anything without an element on screen is collected and said
        // out loud in the result panel instead.
        if (document.getElementById(field) === null) {
          unrendered.push(field);
          continue;
        }
        firstField ??= field;
        setError(field as keyof BookingFormValues, { type: "server", message });
      }

      setUnmappedFields(unrendered);
      if (firstField) document.getElementById(firstField)?.focus();
      else resultRef.current?.focus();
      return;
    }

    setUnmappedFields([]);
    resultRef.current?.focus();
  }, [outcome, setError]);

  // ONE ACCEPTANCE PATH FOR BOTH ENTRY POINTS. The picker and the drop target
  // must validate identically or the dropzone becomes a way to smuggle a file
  // past `checkProof` — a 12MB HEIC that the button would have refused.
  function acceptProof(file: File | null) {
    setValue("proof", file, { shouldDirty: true });
    const problem = checkProof(file);
    if (problem) {
      setError("proof", { type: "manual", message: PROOF_ERROR_MESSAGE[problem] });
    } else {
      clearErrors("proof");
    }
  }

  function onProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    acceptProof(event.target.files?.[0] ?? null);
  }

  // DRAG DEPTH, NOT A BOOLEAN. `dragleave` fires every time the pointer crosses
  // into a CHILD of the zone, so a plain boolean flickers the highlight off and
  // on as the cursor moves over the text inside it. Counting enters against
  // leaves is the standard fix and the only one that survives nested content.
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  function onDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  }

  // `dragover` MUST preventDefault or `drop` never fires. That is the single
  // most common reason a hand-rolled dropzone silently does nothing.
  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    // ONE file. The field takes a single proof of transfer, and a multi-file
    // drop should land the first rather than be refused outright — the visitor
    // dropped something, and silence is the worst answer available.
    acceptProof(event.dataTransfer.files?.[0] ?? null);
  }

  // Terminal states with nothing left to fix: the form is retired rather
  // than left sitting behind the message. `created` is done; `slot_taken`
  // needs a different slot, not a resubmit of this one.
  const showForm = outcome?.kind !== "created" && outcome?.kind !== "slot_taken";

  // THE PLATE. One object with a 3px navy edge, exactly like the order panel on
  // the landing page, and no gap between its children — the panels inside are
  // divided by the plate's own rules rather than separated by space. That is the
  // whole point of the layout round the user accepted on 2026-08-14: restyling
  // three rounded cards would have left them three cards.
  //
  // THE EDGE WAS SIGNAL BLUE UNTIL 2026-08-15. DESIGN.md reserves `blue-600` for
  // one meaning — interactive: links, focus rings, available slot borders,
  // selected states. A plate edge is STRUCTURE; nothing about it is clickable.
  // Navy returns the accent to its one job, and inside the order panel it leaves
  // the available-slot borders as the only blue on the plate. Both surfaces moved
  // together, by the user's call, so the two never drift apart.
  //
  // A LINE COMMENT, NOT A JSX ONE. `{/* … */}` placed directly after `return (`
  // is a second child of the return expression, which is a syntax error rather
  // than a comment — it broke the build once on the way in.
  return (
    <div className="flex flex-col border-[3px] border-[var(--color-band)] bg-[var(--color-bg)]">
      {/* DESIGN.md's `display` role is written for the hero: one headline, three
          short lines, one word per line, measured against "PILIH JAM." (its
          longest word is 5 characters). "Lengkapi Pemesanan" is two 8-9 letter
          Indonesian words with no line to itself to control, so at display
          scale (48px -> 152px) it overflowed the 375px viewport (measured:
          320px 61px over, 375px 49px over, 414px 41px over). This is a form
          page, not the hero — it has exactly one heading and no sibling h1
          content, which functionally makes it a single section rather than a
          multi-line display statement. DESIGN.md's `h2` role is written for
          exactly that: "section headings" at a fluid 28px -> 56px, and is the
          closest defined scale to what a lone form-page heading needs. There
          is no form-heading scale in DESIGN.md.

          Only the size is overridden — weight, leading, tracking and uppercase
          still come from the global <h1> rule, because only the size caused
          the overflow.

          This class works because globals.css's heading rules now live in
          `@layer base`. They did not until this fix, and while they sat
          unlayered they outranked every Tailwind utility no matter its
          specificity: the payment card's `<h2 id="payment-heading">` below
          asked for --text-h3 and rendered at h2's size, as did three <h3>
          labels on the landing page. The class was emitted, matched, and lost,
          with nothing to show for it. */}
      <h1
        lang="id"
        className="border-b-2 border-[var(--color-band)] px-4 py-5 text-[length:var(--text-h2)] uppercase md:px-6"
      >
        Lengkapi Pemesanan
      </h1>

      {/* THE SCHEDULE PANEL — TWO FIELDS, NOT A TRANSPLANTED PLATE.

          It was a LOCKED summary until 2026-08-15: the date and hour arrived in
          the URL and "Ubah jadwal" sent the visitor back to `/#order`, a full
          page away from a form they had already started, losing whatever they
          had typed. The first fix brought the landing page's slot grid in here,
          which worked and read as the homepage pasted into a form — a nine-cell
          plate and a scrolling pill row wedged between a summary and a text
          input. Two labelled selects read as what this actually is.

          THE SUMMARY LINE STAYS ABOVE THEM. The fields answer "what can I pick";
          only the summary answers "what did I pick" once they have collapsed. */}
      <section aria-label="Jadwal" className={PANEL_CLASS}>
        <p
          lang="id"
          className="text-[length:var(--text-xs)] font-semibold tracking-[0.08em] text-[var(--color-fg-muted)] uppercase"
        >
          Jadwal terpilih
        </p>
        <p className="mt-2 text-[length:var(--text-h3)] font-semibold text-[var(--color-fg)]">
          {formatSummaryDate(bookingDate)}
        </p>
        <p lang="id" className="mt-1 text-[color:var(--color-fg-muted)]">
          {selectedSlots.length > 0 ? `Jam ${selectedSlots.join(", ")}` : "Belum ada jam dipilih"}
        </p>

        <div className="mt-5 flex flex-col gap-5">
          <div>
            <label htmlFor="bookingDate" className={LABEL_CLASS}>
              Tanggal
            </label>
            <div className="mt-1">
              <DateSelect
                id="bookingDate"
                dates={window}
                value={bookingDate}
                formatOption={(date) =>
                  date === today ? `Hari ini · ${formatSummaryDate(date)}` : formatSummaryDate(date)
                }
                onChange={(next) => {
                  setBookingDate(next);
                  // ONE BOOKING IS ONE DATE. Hours picked on the old date cannot
                  // ride along to the new one — they would be submitted against a
                  // date the visitor never saw them on.
                  setValue("slots", [], { shouldDirty: true });
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="slots" className={LABEL_CLASS}>
              Jam
            </label>
            <div className="mt-1">
              <TimeMultiSelect
                id="slots"
                options={timeOptions}
                selected={selectedSlots}
                disabled={!rowsReady}
                invalid={Boolean(errors.slots)}
                describedBy={describedBy(
                  errors.slots && "slots-error",
                  droppedSlots.length > 0 && "slots-dropped",
                  "slots-hint",
                )}
                placeholder={
                  availability.isPending
                    ? "Memuat jadwal…"
                    : availability.isError
                      ? "Jadwal gagal dimuat"
                      : "Pilih jam"
                }
                onToggle={toggleSlot}
                onRemove={toggleSlot}
              />
            </div>

            {availability.isError ? (
              <p
                lang="id"
                className="mt-2 flex flex-wrap items-center gap-3 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
              >
                Koneksi bermasalah, jadwal belum bisa dimuat.
                <button
                  type="button"
                  onClick={() => void availability.refetch()}
                  className="h-9 border-2 border-[var(--color-danger-strong)] px-3 font-semibold transition-colors hover:bg-[var(--color-danger-surface)]"
                >
                  Coba lagi
                </button>
              </p>
            ) : null}

            {/* AN HOUR THAT WENT WHILE THE LINK SAT IN A CHAT. The entry link
                carries an hour the admin chose earlier and the visitor may open
                it a day later. Saying nothing would leave a value in the payload
                that no control on screen can remove. */}
            {droppedSlots.length > 0 ? (
              <p
                id="slots-dropped"
                role="status"
                lang="id"
                className="mt-2 border-2 border-[var(--color-warning-line)] bg-[var(--color-warning-surface)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-warning-strong)]"
              >
                Jam {droppedSlots.join(", ")} sudah tidak tersedia, jadi dilepas dari pilihanmu.
              </p>
            ) : null}

            {errors.slots ? (
              <p
                id="slots-error"
                role="alert"
                lang="id"
                className="mt-2 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
              >
                {errors.slots.message}
              </p>
            ) : (
              <p
                id="slots-hint"
                lang="id"
                className="mt-2 text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
              >
                Bisa pilih lebih dari satu jam.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Payment info card. */}
      <section aria-labelledby="payment-heading" className={PANEL_CLASS}>
        <h2 id="payment-heading" className="text-[length:var(--text-h3)]">
          Informasi Pembayaran
        </h2>

        {/* TODO(content): bank account + holder. Rendered as a visible gap,
            not invented digits — an account number nobody verified sends a
            payment to the wrong place, which is worse than an obvious
            blank. Product Principle 7: a placeholder must look like one. */}
        <div className="mt-3 border-2 border-dashed border-[var(--color-band)] bg-[var(--color-bg-subtle)] p-3">
          <p lang="id" className="text-[length:var(--text-sm)] text-[var(--color-fg-muted)]">
            Nomor rekening &amp; nama pemilik menyusul — menunggu data dari pihak lapangan.
          </p>
        </div>

        {/* TODO(content): rate card. NO PLACEHOLDER NUMBER MAY BE INVENTED
            HERE. `/booking` is the one page a real rupiah figure is allowed
            to render (CLAUDE.md hard rule 2, narrowed 2026-08-11), but the
            client has only answered WHERE a price goes, not WHAT it is —
            flat rate, or varying by hour, day, or weekend. Every other
            placeholder in this project is inert if it ships by accident; an
            invented price is the one a visitor would act on, and it would be
            the developer's number attached to the client's business. Until
            the rate card arrives, the sentence below is the destination, not
            a stopgap to "clean up" with a guessed figure. */}
        <p lang="id" className="mt-3 text-[length:var(--text-sm)] text-[var(--color-fg)]">
          Transfer DP 50% dari harga sewa. Nominal dikonfirmasi admin via WhatsApp.
        </p>
      </section>

      {showForm ? (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5 px-4 py-5 md:px-6">
          <div>
            {/* THE LABEL NAMES BOTH READINGS, THE KEY NAMES NEITHER. "Nama Tim"
                alone left a visitor booking a casual game with friends unsure
                whose name the admin wanted; the field is the name that will be
                messaged on WhatsApp, which for half the bookings is a person and
                for the other half is a squad. `teamName` and the `team_name`
                column stay exactly as they are — they are the API contract, they
                are in database.md, and the admin repo reads them. */}
            <label htmlFor="teamName" className={LABEL_CLASS}>
              Nama Tim / Pemesan
            </label>
            <input
              id="teamName"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.teamName)}
              aria-describedby={describedBy(errors.teamName && "teamName-error")}
              className={cn(
                INPUT_CLASS,
                "mt-1",
                errors.teamName ? INPUT_ERROR_CLASS : INPUT_VALID_CLASS,
              )}
              {...register("teamName")}
            />
            {errors.teamName ? (
              <p
                id="teamName-error"
                role="alert"
                lang="id"
                className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
              >
                {errors.teamName.message}
              </p>
            ) : null}
          </div>

          {SHOW_PHONE_FIELD ? (
            <div>
              <label htmlFor="phone" className={LABEL_CLASS}>
                Nomor WhatsApp
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy(errors.phone && "phone-error")}
                className={cn(
                  INPUT_CLASS,
                  "mt-1",
                  errors.phone ? INPUT_ERROR_CLASS : INPUT_VALID_CLASS,
                )}
                {...register("phone")}
              />
              {errors.phone ? (
                <p
                  id="phone-error"
                  role="alert"
                  lang="id"
                  className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
                >
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="notes" className={LABEL_CLASS}>
              Catatan
            </label>
            <textarea
              id="notes"
              rows={4}
              maxLength={500}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={describedBy("notes-counter", errors.notes && "notes-error")}
              className={cn(
                "mt-1 w-full border-2 border-[var(--color-band)] bg-[var(--color-bg)] p-3 text-[var(--color-fg)] outline-none",
                errors.notes ? INPUT_ERROR_CLASS : INPUT_VALID_CLASS,
              )}
              {...register("notes")}
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              {errors.notes ? (
                <p
                  id="notes-error"
                  role="alert"
                  lang="id"
                  className="text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
                >
                  {errors.notes.message}
                </p>
              ) : (
                <span />
              )}
              <p
                id="notes-counter"
                className="text-[length:var(--text-xs)] whitespace-nowrap text-[var(--color-fg-muted)]"
              >
                {notes.length}/500
              </p>
            </div>
          </div>

          {/* Honeypot. Hidden from every user, sighted or not — aria-hidden
              takes it out of the accessibility tree and tabIndex={-1} takes
              it out of keyboard order, on top of being visually hidden. A
              real visitor never touches it, so it stays present-and-empty;
              a bot that fills every field gets a fabricated 201 server-side. */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor="website">Nomor HP alternatif</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              {...register("website")}
            />
          </div>

          {SHOW_PROOF_FIELD ? (
            <div>
              <label htmlFor="proof" className={LABEL_CLASS}>
                Bukti Transfer
              </label>
              {/* A DROPZONE THAT IS STILL A REAL FILE INPUT. The `<input>` below is
                  `sr-only`, not `hidden` — it keeps its place in the tab order, so a
                  keyboard visitor reaches it and opens the picker with Enter exactly
                  as before. A `display: none` input would have removed the only
                  accessible way to attach a file.

                  The zone shows the input's focus ring with `has-[:focus-visible]`,
                  so focus is visible on the thing a sighted keyboard user is looking
                  at rather than on a 1px offscreen box.

                  DASHED AT REST, SOLID SIGNAL BLUE WHILE DRAGGING. Dashed is the one
                  border treatment on this plate that is NOT a rule, and that is the
                  point: every other edge here is a fixed division, so a broken edge
                  reads as "something goes in here". The switch to a solid accent edge
                  plus the blue wash is the same "this is live, take it" vocabulary the
                  slot grid uses, and it changes border WEIGHT and FILL, not colour
                  alone.

                  SIZED TO BE FOUND. At the 112px it started as, this was the quietest
                  control on a plate of hard-ruled fields — and it is the only one that
                  has to explain itself to somebody who has never used a dropzone.
                  160px tall with a 44px mark: the same object, loud enough to be the
                  step it actually is. THE LABEL STAYS AT `label` SIZE — it went to h3
                  on the way in and came back on 2026-08-15. The mark is what carries
                  the emphasis; a 20-32px label made the zone shout twice and put the
                  type out of step with every other label on the plate. */}
              <div
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "mt-1 flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-4 py-7 text-center transition-colors duration-200",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-focus)]",
                  dragging
                    ? "border-solid border-[var(--color-interactive)] bg-[var(--color-wash)]"
                    : "border-[var(--color-band)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)]",
                )}
                onClick={() => document.getElementById("proof")?.click()}
              >
                <input
                  id="proof"
                  type="file"
                  accept={PROOF_ACCEPT}
                  aria-invalid={Boolean(errors.proof)}
                  aria-describedby={describedBy(errors.proof && "proof-error")}
                  onChange={onProofChange}
                  className="sr-only"
                />
                {/* react-icons — the library PRODUCT.md names. Never an emoji, and
                    never a generated glyph: those drift in stroke weight and optical
                    grid the moment a second one is added. */}
                <FiImage
                  aria-hidden="true"
                  className="size-11 shrink-0 text-[var(--color-fg-muted)]"
                />
                <span
                  lang="id"
                  className="type-display text-[length:var(--text-label)] font-medium tracking-[0.06em] uppercase"
                >
                  {dragging ? "Lepas di sini" : "Tarik gambar ke sini"}
                </span>
                <span
                  lang="id"
                  className="text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
                >
                  atau klik untuk memilih file · JPG, PNG, WebP
                </span>
              </div>
              {proofFile ? (
                <p
                  lang="id"
                  className="mt-1 text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
                >
                  Terpilih: {proofFile.name}
                </p>
              ) : null}
              {errors.proof ? (
                <p
                  id="proof-error"
                  role="alert"
                  lang="id"
                  className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
                >
                  {errors.proof.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* THE 400 THAT NAMES A FIELD THIS FORM DOES NOT RENDER. With phone
              and proof hidden, a server rejecting either would otherwise mark
              nothing and focus nothing — a submit button that looks broken. The
              form says so out loud instead, names the field, and points at the
              only party who can act on it. It is deliberately not styled as a
              form error next to an input, because there is no input. */}
          {unmappedFields.length > 0 ? (
            <div
              ref={resultRef}
              tabIndex={-1}
              role="alert"
              lang="id"
              className="border-2 border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-4 text-[var(--color-danger-strong)] outline-none"
            >
              <p className="font-semibold">Pemesanan ditolak server.</p>
              <p className="mt-1 text-[length:var(--text-sm)]">
                Ada data yang tidak diterima ({unmappedFields.join(", ")}) dan tidak bisa diperbaiki
                dari halaman ini. Hubungi admin lewat WhatsApp.
              </p>
            </div>
          ) : null}

          {outcome?.kind === "rate_limited" ? (
            <div
              ref={resultRef}
              tabIndex={-1}
              role="alert"
              lang="id"
              className="border-2 border-[var(--color-warning-line)] bg-[var(--color-warning-surface)] p-4 text-[var(--color-warning-strong)] outline-none"
            >
              Terlalu banyak percobaan dalam waktu singkat. Tunggu sebentar, lalu coba kirim lagi —
              tidak ada yang salah dengan pemesananmu.
            </div>
          ) : null}

          {outcome?.kind === "server_error" ? (
            <div
              ref={resultRef}
              tabIndex={-1}
              role="alert"
              lang="id"
              className="border-2 border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-4 text-[var(--color-danger-strong)] outline-none"
            >
              <p className="font-semibold">Terjadi kendala di server.</p>
              <button
                type="button"
                onClick={() => void submit()}
                className="mt-3 h-10 border-2 border-[var(--color-danger-strong)] px-4 font-semibold text-[var(--color-danger-strong)] hover:bg-[var(--color-bg)]"
              >
                Coba lagi
              </button>
            </div>
          ) : null}

          {/* aria-disabled, never the native attribute — the control keeps
              its place in the tab order, so the submit handler is what
              refuses the second press, not the browser. */}
          <button
            type="submit"
            aria-disabled={mutation.isPending}
            className="type-display flex h-14 w-full items-center justify-center bg-[var(--color-accent-strong)] px-6 text-[length:var(--text-label)] font-medium tracking-[0.06em] text-[var(--color-fg-inverse)] uppercase transition-colors hover:bg-[var(--color-accent-strong-hover)] aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          >
            {/* A real ellipsis, not three periods. Three periods set in Inter
                are three separate glyphs with word-spacing between them, so the
                label visibly jitters wider than the resting one on the single
                button that carries the whole conversion. */}
            {mutation.isPending ? "Mengirim…" : "Kirim Pemesanan"}
          </button>
        </form>
      ) : (
        <div
          ref={resultRef}
          tabIndex={-1}
          role={outcome?.kind === "created" ? "status" : "alert"}
          lang="id"
          className={cn(
            PANEL_CLASS,
            "border-2 outline-none",
            outcome?.kind === "created"
              ? // NOT the interactive blue. DESIGN.md reserves blue-600 for
                // "you can act on this", and a confirmed booking is precisely
                // the state with nothing left to act on — a blue-ringed panel
                // invites a click that does not exist. `--color-success-fg` is
                // the token the system defines for exactly this.
                "border-[var(--color-success-fg)]"
              : "border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)]",
          )}
        >
          {outcome?.kind === "created" ? (
            <p className="font-semibold text-[var(--color-fg)]">
              Pemesanan berhasil. Menunggu konfirmasi admin via WhatsApp.
            </p>
          ) : (
            <>
              <p className="font-semibold text-[var(--color-danger-strong)]">
                Yah, jam ini baru saja diambil orang lain. Silakan pilih waktu lain.
              </p>
              {/* IT USED TO BE A LINK BACK TO `/#order`, AND THAT WAS THE ONLY
                  PLACE TO GO WHEN THIS FORM COULD NOT CHANGE THE SCHEDULE. It
                  can now, so a 409 keeps the visitor here: the picker is one
                  panel up, everything they typed is still in it, and the fresh
                  availability read shows the hour that just went. Sending them
                  to another page to do what this page does would be the only
                  step in the flow that loses work. */}
              <button
                type="button"
                lang="id"
                className={CTA_CLASS}
                onClick={() => {
                  mutation.reset();
                  setValue("slots", [], { shouldDirty: true });
                  void refetchAvailability();
                  document.getElementById("slots")?.focus();
                }}
              >
                Pilih Jam Lain
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
