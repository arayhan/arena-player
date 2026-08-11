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
            step ? "grid-cols-[auto_1fr]" : "grid-cols-1",
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
            <div className={cn("mt-8 md:mt-12", step ? "col-start-2" : undefined)}>{children}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
