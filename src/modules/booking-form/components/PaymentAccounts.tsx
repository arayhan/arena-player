"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

import { cn } from "@/lib/cn";

import { copyableAccountNumber, formatAccountNumber } from "../booking-form.account";
import { usePaymentAccounts } from "../booking-form.queries";

/**
 * The row shell, shared by the skeleton and the real thing so the two cannot
 * differ in padding, border weight or minimum height — which is exactly how the
 * first skeleton ended up 50px shorter than what replaced it.
 */
/**
 * THE ROW STACKS BELOW `sm`, DELIBERATELY AND FOR BOTH STATES. With
 * `flex-wrap` alone, whether the Salin button sat beside the text or under it
 * depended on how long the account holder's name happened to be — so the
 * skeleton measured 126px against a real row's 170px on a phone, a 44px jump in
 * the panel directly above the form fields. A column below `sm` is one layout
 * regardless of content, which is the only version a skeleton can match.
 */
const ROW_CLASS =
  "flex min-h-[126px] flex-col items-start justify-center gap-3 border-2 bg-[var(--color-bg)] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between";

/**
 * The three text lines and the button, as class strings BOTH the skeleton and
 * the real row use.
 *
 * THE SKELETON RENDERS REAL TEXT IN THE REAL CLASSES, tinted out. Bars sized by
 * hand cannot track a fluid type ramp or a line that wraps: measured, a
 * hand-sized skeleton matched the row at 1280px and was 14px short at 390px,
 * where "a.n. …" wraps to two lines. Borrowing the typography makes the line
 * boxes identical by construction, at every width, for free.
 */
const BANK_CLASS =
  "text-[length:var(--text-xs)] font-semibold tracking-[0.08em] text-[var(--color-fg-muted)] uppercase";
const NUMBER_CLASS = "mt-1 text-[length:var(--text-h3)] font-semibold tabular-nums";
const HOLDER_CLASS = "mt-1 text-[length:var(--text-sm)] text-[var(--color-fg-muted)]";
const COPY_CLASS =
  "type-display flex h-11 items-center gap-2 border-2 px-4 text-[length:var(--text-label)] font-medium tracking-[0.06em] uppercase transition-colors";

/**
 * The transfer destinations, read from the API.
 *
 * IT WAS ONE HARD-CODED SENTENCE UNTIL 2026-08-15 — "Nomor rekening & nama
 * pemilik menyusul" baked into the component. The accounts are a list the server
 * owns, so the panel fetches them and handles the states a fetch actually has.
 * What ships today is still the empty one, because the client has supplied no
 * account; the difference is that it is now a fact the server reports rather
 * than a sentence a developer typed.
 *
 * FOUR STATES, AND THE LAST TWO SAY DIFFERENT THINGS ON PURPOSE. An empty list
 * means the field has not given us an account yet — nothing is broken and there
 * is nothing to retry. A failed request means something IS broken and retrying
 * is exactly the useful action. Collapsing them into one "sedang bermasalah"
 * would tell a visitor to wait for a network that is fine, or to retry a fact.
 */
export function PaymentAccounts() {
  const { data, isPending, isError, refetch } = usePaymentAccounts();

  return (
    <div className="mt-3">
      {isPending ? (
        <ul aria-busy="true" aria-label="Memuat info rekening" className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            // THE SAME SHELL AND THE SAME THREE LINES AS A REAL ROW. A skeleton
            // that only approximates the shape is a layout shift wearing a
            // loading state's clothes: the first draft here was 76px against a
            // real row's 126px, so the form fields below it jumped 50px the
            // moment the data landed. `ROW_CLASS` is shared by both so the
            // padding, border and minimum height cannot drift apart again, and
            // the bars inside stand in for the three text lines at their own
            // heights.
            <li
              key={i}
              aria-hidden="true"
              className={cn(ROW_CLASS, "animate-pulse border-[var(--color-border)]")}
            >
              <div className="min-w-0">
                <p className={cn(BANK_CLASS, "w-fit bg-[var(--color-border)] text-transparent")}>
                  BANK
                </p>
                <p className={cn(NUMBER_CLASS, "w-fit bg-[var(--color-border)] text-transparent")}>
                  0000 0000 00
                </p>
                <p className={cn(HOLDER_CLASS, "w-fit bg-[var(--color-border)] text-transparent")}>
                  a.n. Nama Pemilik
                </p>
              </div>
              <span className={cn(COPY_CLASS, "border-[var(--color-border)] text-transparent")}>
                Salin
              </span>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div
          role="alert"
          lang="id"
          className="flex flex-wrap items-center gap-3 border-2 border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-3 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]"
        >
          <p className="flex-1">
            Info rekening sedang tidak bisa dimuat. Nomornya juga bisa diminta ke admin lewat
            WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="h-10 shrink-0 border-2 border-[var(--color-danger-strong)] px-4 font-semibold transition-colors hover:bg-[var(--color-bg)]"
          >
            Coba lagi
          </button>
        </div>
      ) : data.length === 0 ? (
        // THE DASHED BOX STAYS FOR THE EMPTY STATE. Product Principle 7: a
        // placeholder must look like one. A missing account rendered as ordinary
        // prose reads as a paragraph somebody wrote; dashed reads as a gap.
        <div className="border-2 border-dashed border-[var(--color-band)] bg-[var(--color-bg-subtle)] p-3">
          <p lang="id" className="text-[length:var(--text-sm)] text-[var(--color-fg-muted)]">
            Nomor rekening &amp; nama pemilik menyusul — menunggu data dari pihak lapangan.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.map((account) => (
            <AccountRow key={`${account.bank}-${account.accountNumber}`} account={account} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountRow({
  account,
}: {
  account: { bank: string; accountNumber: string; accountHolder: string };
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The confirmation clears itself, and the timer is cleared on unmount so a
  // visitor who submits the form before it fires does not get a setState on a
  // component that is gone.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      // DIGITS ONLY, NEVER WHAT IS ON SCREEN. The screen carries the client's
      // own punctuation — their BRI number is written `4736-01-017915-53-2` —
      // and a banking app's account field takes neither dashes nor the grouping
      // spaces this UI adds. A paste that fails gets blamed on the app.
      await navigator.clipboard.writeText(copyableAccountNumber(account.accountNumber));
      setState("copied");
    } catch {
      // `navigator.clipboard` rejects outside a secure context and when the
      // permission is denied. Saying so beats a button that looks like it
      // worked — the visitor can still select the number by hand.
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 2500);
  }

  return (
    <li className={cn(ROW_CLASS, "border-[var(--color-band)]")}>
      <div className="min-w-0">
        <p lang="id" className={BANK_CLASS}>
          {account.bank}
        </p>
        {/* TABULAR NUMERALS, which Plus Jakarta Sans does ship — unlike the
            display face, where the same class was measured to be a no-op. Even
            digit widths are what make a long number checkable against a banking
            app one group at a time. */}
        <p className={NUMBER_CLASS}>{formatAccountNumber(account.accountNumber)}</p>
        <p lang="id" className={HOLDER_CLASS}>
          a.n. {account.accountHolder}
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-1 sm:w-auto sm:items-end">
        <button
          type="button"
          onClick={() => void copy()}
          // NAMES ITS OWN ROW. "Salin" alone in a list of three accounts names
          // nothing, and a screen reader user hears the same word three times.
          aria-label={`Salin nomor rekening ${account.bank}`}
          className={cn(
            COPY_CLASS,
            state === "copied"
              ? "border-[var(--color-success-fg)] text-[var(--color-success-fg)]"
              : "border-[var(--color-band)] text-[var(--color-fg)] hover:bg-[var(--color-accent-strong)] hover:text-[var(--color-fg-inverse)]",
          )}
        >
          {state === "copied" ? (
            <FiCheck aria-hidden="true" className="size-4 shrink-0" />
          ) : (
            <FiCopy aria-hidden="true" className="size-4 shrink-0" />
          )}
          {state === "copied" ? "Tersalin" : "Salin"}
        </button>

        {/* `role="status"` rather than a tooltip: the confirmation has to reach
            a screen reader too, and this is the one polite live region on the
            page. Empty when idle, so nothing is announced on mount. */}
        <span
          role="status"
          lang="id"
          className={cn(
            "text-[length:var(--text-xs)]",
            state === "failed"
              ? "text-[var(--color-danger-strong)]"
              : "text-[var(--color-fg-muted)]",
          )}
        >
          {state === "failed" ? "Gagal menyalin — salin manual" : ""}
        </span>
      </div>
    </li>
  );
}
