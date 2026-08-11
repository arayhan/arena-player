import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The landing page's section wrapper, and the art direction's load-bearing
 * device.
 *
 * DESIGN.md settles the section-transition language as numbered assembly
 * steps: an oversized Orbitron ordinal in `grey-200` beside the heading, with
 * a navy keyline between steps. It exists to fix one specific failure — the
 * benchmark runs six identically-treated centred headings in a column, so a
 * visitor has no sense of progress or place, and the first draft of
 * DESIGN.html was graded with the same flaw.
 *
 * Why an ordinal rather than something richer: it costs ZERO KILOBYTES, needs
 * NO MOTION, and works at 375px. Every alternative considered spent budget on
 * a problem that composition solves for free.
 *
 * THE NUMERAL IS NOT AN EYEBROW. DESIGN.md bans the kicker-above-heading
 * pattern, and a small uppercase ordinal stacked over a title is that pattern
 * wearing a number. This one is oversized, muted, and sits BESIDE the heading —
 * bleeding into the left margin where there is margin to bleed into.
 */
export function Section({
  id,
  step,
  title,
  lede,
  children,
  className,
}: {
  /** Anchor target. `#order` is linked from both CTAs and must not change. */
  id?: string;
  /**
   * The ordinal. Omitted for the hero, which opens the page rather than
   * continuing a sequence — a step 00 before the thing being assembled has
   * been introduced would be counting for its own sake.
   */
  step?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        // Section rhythm only ever uses 48/64/96/128. These are py-12 (48px)
        // and py-24 (96px) — inside the scale, not near it.
        "scroll-mt-4 border-t border-[var(--color-border)] py-12 md:py-24",
        // The keyline between steps. First section suppresses it, so the page
        // does not open on a rule.
        "first:border-t-0",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1100px] px-4">
        {/* A GRID, NOT A FLEX ROW, SO THE CONTENT ALIGNS WITH THE HEADING.
            The first draft put the numeral and title in a flex row and hung
            children underneath at full width. The heading was then indented by
            the numeral and the body copy was not, which at 375px read as a
            mistake rather than as a device. Two columns fix it: the numeral
            owns column 1, and everything the section says lives in column 2. */}
        <div
          className={cn(
            "grid gap-x-4 md:gap-x-6",
            // minmax(0,1fr), NOT 1fr. `1fr` expands to `minmax(auto, 1fr)`, and
            // that auto minimum sits on the TRACK — so the column refuses to
            // shrink below its content's intrinsic width no matter what
            // min-width the item carries. Measured at 375px: the date row and
            // the 20-character state labels pushed the page 41px wide and
            // clipped every line on the right, and adding `min-w-0` to the item
            // changed nothing, because the item was never the constraint.
            // A FIXED NUMERAL TRACK, NOT `auto`. `auto` sizes the column to the
            // ordinal's intrinsic width, and Orbitron ships no `tnum` feature —
            // so `tabular-nums` below is a silent no-op and "1" measures far
            // narrower than "0", "2" or "3". Measured at 1280px: the heading of
            // step 01 started at x=141 and steps 02 and 03 at x=179, a 38px jog
            // in the one column the whole art direction asks the visitor to
            // read down. The spine of the page has to be a straight line.
            //
            // 1.7em of the numeral's OWN font-size covers two digits at
            // Orbitron's widest (a "0" measures ~0.83em), and it is expressed
            // against `--text-step` so the track scales with the clamp instead
            // of being pinned to one viewport.
            //
            // AT EVERY WIDTH, INCLUDING 375px, AND THE PHONE IS THE CHEAP CASE
            // RATHER THAN THE EXPENSIVE ONE. Measured at 375px before the fix:
            // headings sat at x=91, 112, 112 — so TWO OF THREE were already
            // where the fixed track puts all three (x=114), and only step 01
            // moves, by 23px. All three still set on one line and the page
            // still does not scroll sideways.
            step
              ? "grid-cols-[calc(var(--text-step)*1.7)_minmax(0,1fr)]"
              : "grid-cols-1",
            // BLEEDS LEFT ONLY WHERE THERE IS GUTTER TO BLEED INTO. At 375px
            // the content column is the whole screen, so a negative margin
            // would push the numeral off-screen and steal width from the
            // heading. Past the 1100px column plus the numeral there is real
            // margin, and that is where the device earns its keep.
            step ? "xl:-ml-24" : undefined,
          )}
        >
          {step ? (
            <span
              aria-hidden="true"
              className={cn(
                "font-[family-name:var(--font-display)] font-black leading-none",
                "text-[color:var(--color-border)] [font-variant-numeric:tabular-nums]",
                "text-[length:var(--text-step)] select-none",
              )}
            >
              {step}
            </span>
          ) : null}

          <div className="min-w-0">
            <h2>{title}</h2>
            {lede ? (
              // Body copy caps at 60–68ch. Past that the eye loses the line
              // return, which matters most on the widest screens.
              <p className="mt-4 max-w-[64ch] text-[color:var(--color-fg-muted)]">{lede}</p>
            ) : null}
          </div>

          {children ? (
            // FULL WIDTH ON A PHONE, INDENTED FROM md UP — and this one is a
            // product requirement beating an aesthetic preference, not a
            // compromise.
            //
            // Indenting the content to align with the heading looks better, and
            // it is what this component did first. But the numeral is 59px plus
            // a 16px gap, so at 375px it left the content column 268px — and
            // DESIGN.md's slot-cell measurement is explicit that the row needs
            // 343px, because "Menunggu Konfirmasi" is 20 characters and cannot
            // truncate. Measured: the cell needed 323px and had 268, and the
            // page scrolled sideways by 41px.
            //
            // The 343px is a measured constraint on the product; the indent is
            // taste. When the two disagree, clarity wins — the same rule that
            // put Signal Blue where the source world wanted brick red.
            <div
              className={cn(
                "mt-8 min-w-0 md:mt-12",
                step ? "col-span-2 md:col-span-1 md:col-start-2" : undefined,
              )}
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
