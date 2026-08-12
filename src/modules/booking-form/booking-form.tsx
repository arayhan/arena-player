"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

import type { TimeSlot } from "@/domain/slots";
import { cn } from "@/lib/cn";

import { checkProof, PROOF_ACCEPT, type ProofProblem } from "./booking-form.proof";
import { useCreateBooking } from "./booking-form.queries";
import { bookingFormSchema, type BookingFormValues } from "./booking-form.schema";
import type { BookingOutcome } from "./booking-form.service";

export interface BookingFormProps {
  date: string;
  slot: TimeSlot;
}

const PANEL_CLASS = "rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4";

const CTA_CLASS =
  "mt-4 inline-flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-accent-strong-hover)]";

const INPUT_CLASS =
  "h-12 w-full rounded-[10px] border bg-[var(--color-bg)] px-3 text-[var(--color-fg)] outline-none";
const INPUT_VALID_CLASS = "border-[var(--color-border)]";
const INPUT_ERROR_CLASS = "border-[var(--color-danger-line)] bg-[var(--color-danger-surface)]";

const LABEL_CLASS = "block text-[length:var(--text-sm)] font-semibold text-[var(--color-fg)]";

const PROOF_ERROR_MESSAGE: Record<ProofProblem, string> = {
  missing: "Bukti transfer wajib diunggah",
  wrong_type: "Format harus JPG, PNG, atau WEBP",
  too_large: "Ukuran file maksimal 2MB",
};

// Duplicated rather than imported from booking-entry.tsx on purpose, same
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
  const mutation = useCreateBooking(date, slot);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues: { teamName: "", phone: "", notes: "", website: "", proof: null },
  });

  const notes = watch("notes") ?? "";
  const proofFile = watch("proof");

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
    const parsed = bookingFormSchema.safeParse(values);
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
      for (const [field, message] of Object.entries(outcome.fields)) {
        firstField ??= field;
        setError(field as keyof BookingFormValues, { type: "server", message });
      }
      if (firstField) document.getElementById(firstField)?.focus();
      return;
    }

    resultRef.current?.focus();
  }, [outcome, setError]);

  function onProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setValue("proof", file, { shouldDirty: true });
    const problem = checkProof(file);
    if (problem) {
      setError("proof", { type: "manual", message: PROOF_ERROR_MESSAGE[problem] });
    } else {
      clearErrors("proof");
    }
  }

  // Terminal states with nothing left to fix: the form is retired rather
  // than left sitting behind the message. `created` is done; `slot_taken`
  // needs a different slot, not a resubmit of this one.
  const showForm = outcome?.kind !== "created" && outcome?.kind !== "slot_taken";

  return (
    <div className="flex flex-col gap-6">
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
      <h1 lang="id" className="max-w-[24ch] text-[length:var(--text-h2)]">
        Lengkapi Pemesanan
      </h1>

      {/* Locked summary card. Not editable inline — go back to /#order to
          change date or slot, same destination BookingEntry's other two
          notices use. */}
      <section aria-label="Ringkasan jadwal" className={PANEL_CLASS}>
        <p
          lang="id"
          className="text-[length:var(--text-xs)] font-semibold tracking-[0.08em] text-[var(--color-fg-muted)] uppercase"
        >
          Jadwal terpilih
        </p>
        <p className="mt-2 text-[length:var(--text-h3)] font-semibold text-[var(--color-fg)]">
          {formatSummaryDate(date)}
        </p>
        <p lang="id" className="mt-1 text-[color:var(--color-fg-muted)]">
          Jam {slot}
        </p>
        <Link
          href="/#order"
          lang="id"
          className="mt-3 inline-block text-[length:var(--text-sm)] font-semibold text-[var(--color-interactive)] underline underline-offset-2"
        >
          Ubah jadwal
        </Link>
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
        <div className="mt-3 rounded-[10px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
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
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <div>
            <label htmlFor="teamName" className={LABEL_CLASS}>
              Nama Tim
            </label>
            <input
              id="teamName"
              type="text"
              autoComplete="organization"
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
                "mt-1 w-full rounded-[10px] border bg-[var(--color-bg)] p-3 text-[var(--color-fg)] outline-none",
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

          <div>
            <label htmlFor="proof" className={LABEL_CLASS}>
              Bukti Transfer
            </label>
            <input
              id="proof"
              type="file"
              accept={PROOF_ACCEPT}
              aria-invalid={Boolean(errors.proof)}
              aria-describedby={describedBy(errors.proof && "proof-error")}
              onChange={onProofChange}
              className="mt-1 block w-full text-[length:var(--text-sm)] text-[var(--color-fg)] file:mr-3 file:h-10 file:rounded-[10px] file:border-0 file:bg-[var(--color-accent-strong)] file:px-4 file:font-semibold file:text-[var(--color-fg-inverse)] hover:file:bg-[var(--color-accent-strong-hover)]"
            />
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

          {outcome?.kind === "rate_limited" ? (
            <div
              ref={resultRef}
              tabIndex={-1}
              role="alert"
              lang="id"
              className="rounded-[14px] border-2 border-[var(--color-warning-line)] bg-[var(--color-warning-surface)] p-4 text-[var(--color-warning-strong)] outline-none"
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
              className="rounded-[14px] border-2 border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-4 text-[var(--color-danger-strong)] outline-none"
            >
              <p className="font-semibold">Terjadi kendala di server.</p>
              <button
                type="button"
                onClick={() => void submit()}
                className="mt-3 h-10 rounded-[10px] border border-[var(--color-danger-strong)] px-4 font-semibold text-[var(--color-danger-strong)] hover:bg-[var(--color-bg)]"
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
            className="flex h-12 w-full items-center justify-center rounded-[10px] bg-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-accent-strong-hover)] aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
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
                Yah, slot ini baru saja diambil orang lain. Silakan pilih waktu lain.
              </p>
              <Link href="/#order" className={CTA_CLASS}>
                Lihat Jadwal Kosong
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
