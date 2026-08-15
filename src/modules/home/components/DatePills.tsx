"use client";

import { useMemo, useRef, useState } from "react";

import { FiCalendar } from "react-icons/fi";

import { cn } from "@/lib/cn";
import { useMotion } from "@/lib/motion";

import { calendarMonths, DAY_NAMES, formatPill } from "../order.utils";

/**
 * How many of the window's dates get a pill.
 *
 * FOURTEEN, AND IT IS THE OLD WINDOW'S LENGTH ON PURPOSE. The booking window
 * went from 14 days to 92 on 2026-08-15, and handing all 92 to this row would
 * have made it ninety-two pills in one hidden-scrollbar strip — a control whose
 * far end nobody reaches, on the exact device where horizontal space is
 * scarcest. PRODUCT.md's most shaping confirmed fact is that people book
 * SAME-DAY OR NEXT-DAY; two weeks of pills covers that with room to spare, and
 * the other seventy-eight days go behind the disclosure below, where a month
 * grid can reach any of them in the same number of taps.
 */
const PILL_DAYS = 14;

/**
 * The date row along the head of the plate: two weeks of pills, then a
 * calendar for the rest of the 92-day window.
 *
 * THE PILLS ARE THE ONLY FULLY ROUND SHAPE IN THE SYSTEM, and "Pelat Enamel"
 * makes that exception louder rather than weaker. The plate and every field in
 * it is square, so a row of capsules sitting on it is unmistakably a different
 * KIND of thing — which is the entire job the roundness was doing: a row of
 * pills reads as horizontally scrollable without an arrow, a gradient fade, or
 * a hint label. Squaring these off to match the plate would have been
 * consistency bought by deleting the one signal that says "this row scrolls".
 *
 * THE CALENDAR IS SQUARE FOR THE SAME REASON, INVERTED. It does not scroll
 * sideways and it is not a strip, so it takes the plate's own geometry — square
 * cells, ruled columns, the sign's face — and the two controls stay
 * distinguishable at a glance rather than becoming one long undifferentiated
 * date picker.
 *
 * THE PILLS SPEAK THE PLATE'S FACE. Both lines take the display face uppercase
 * — the sign's own voice — where the date used to sit in the body face.
 * Measured with Panchang loaded: "HARI INI" is 81.02px at 14px/700 against
 * 49.98px for "Hari ini" in Plus Jakarta Sans at 16px, so a pill is roughly
 * 30px wider than it was. That is affordable precisely because this row
 * scrolls: the cost of a wide face lands on how many pills are visible at once,
 * not on whether the row fits, and the row has never been required to fit.
 *
 * `overscroll-behavior-x: contain` stops a sideways swipe bouncing the page
 * underneath the row — the defect is invisible on a trackpad and immediate on
 * the phone this site is designed for. The scrollbar itself is hidden across
 * engines (`scrollbar-width`, `-ms-overflow-style`, the WebKit pseudo-element),
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
  const [open, setOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // The window's opening year decides whether a pill prints its year at all.
  // In August this is dead weight; opened in December it is the only thing
  // separating two bookable dates that both read "1 Jan".
  const openingYear = dates[0]?.slice(0, 4) ?? "";

  /**
   * The pills actually rendered: the first fortnight, plus the selection when
   * it came from the calendar and therefore sits outside that fortnight.
   *
   * WITHOUT THE SECOND HALF THE ROW LIES. Picking 12 November in the calendar
   * and closing it would leave fourteen pills, none of them selected, above a
   * grid showing November's slots — the control would contradict the data
   * directly underneath it.
   */
  const pills = useMemo(() => {
    const head = dates.slice(0, PILL_DAYS);
    return head.includes(selected) ? head : [...head, selected];
  }, [dates, selected]);

  const months = useMemo(() => calendarMonths(dates), [dates]);

  // THE SAME DISCLOSURE MOTION THE ELAPSED GROUP USES, deliberately — this
  // plate has one way of opening a panel and a second easing or duration here
  // would be a variation nothing asked for. GSAP measures the natural height
  // rather than animating to `auto`, which is what keeps it off the CLS budget.
  //
  // THE CALENDAR IS CONDITIONALLY RENDERED, NOT HIDDEN AT `height: 0`. A
  // collapsed panel that still holds ninety-two buttons is ninety-two invisible
  // tab stops; unmounting is the only version of "not focusable when not shown"
  // that cannot be got wrong later. Closing is therefore instant, which is what
  // the elapsed group already does in practice.
  useMotion(
    {
      animate: ({ gsap }) => {
        const el = calendarRef.current;
        if (!el) return;
        gsap.set(el, { overflow: "hidden" });
        gsap.from(el, {
          height: 0,
          duration: 0.28,
          ease: "power3.out",
          // `clearProps` IS NOT TIDINESS, IT IS THE BUG FIX. A height tween
          // resolves `auto` to a pixel value and leaves it inline when it
          // finishes — measured, this wrapper kept `height: 420px` after
          // opening. The scroller inside is capped at `min(58svh, 420px)`, so
          // rotating a phone or opening the keyboard shrinks the scroller to
          // 232px while the frozen wrapper stays at 420px, leaving 188px of
          // blank plate under the calendar. Clearing the property hands the
          // height back to CSS the instant the animation is over. `overflow`
          // is set separately and survives, which is what the tween needs
          // while it runs.
          clearProps: "height",
        });
      },
      // Nothing to undo: the resting state is the rendered state, so a visitor
      // who declined motion — or whose GSAP fetch failed — gets the calendar
      // open, at full height, immediately.
      settle: () => {},
    },
    { scope: calendarRef, deps: [open], enabled: open },
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Pilih tanggal"
        lang="id"
        className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2 [overscroll-behavior-x:contain] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pills.map((date, index) => {
          const { day, label } = formatPill(date, { withYear: date.slice(0, 4) !== openingYear });
          const isSelected = date === selected;

          return (
            <button
              key={date}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(date)}
              className={cn(
                // 64px minimum width, 10px vertical / 16px horizontal padding —
                // DESIGN.md's Date Pill spec.
                "min-w-16 shrink-0 rounded-[var(--radius-pill)] border-2 px-4 py-[10px] text-center",
                "transition-colors duration-150",
                isSelected
                  ? "border-[var(--color-interactive)] bg-[var(--color-interactive)] text-[var(--color-fg-inverse)]"
                  : // TWO SIGNALS ON HOVER, AND THE 2px LIFT IS NO LONGER ONE OF
                    // THEM. DESIGN.md's Date Pill spec reads "blue-50 fill,
                    // blue-600 border, 2px lift", and the lift was there as a
                    // second signal because the fill used to be invisible — the
                    // pills sat on the `blue-50` page ground and hovered to
                    // `blue-50`. On the plate they sit on WHITE, so the fill is a
                    // real change on its own and the border is the second signal
                    // beside it. The lift goes because nothing on an enamel sign
                    // lifts: it is the one motion in this section that would have
                    // claimed a depth the world does not have.
                    "border-[var(--color-band)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:border-[var(--color-interactive)] hover:bg-[var(--color-wash)]",
              )}
            >
              <span
                className={cn(
                  "type-display block text-[length:var(--text-xs)] font-medium tracking-[0.1em] uppercase",
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
              <span className="type-display mt-0.5 block text-[length:var(--text-sm)] font-bold tracking-[0.02em] whitespace-nowrap uppercase">
                {/* Today is the default and reads as a word, not a date: it is
                    the day people actually want, and the far end of the window
                    is the secondary path. */}
                {index === 0 ? "Hari ini" : label}
              </span>
            </button>
          );
        })}
      </div>

      {/* THE DISCLOSURE, LOUD AND EXPLAINED — reworked 2026-08-15.
          
          IT WAS THE ELAPSED TOGGLE'S TWIN: same caret, same muted `sm` label,
          same hover wash, on the argument that this plate has one way of saying
          "there is more behind this". That symmetry cost it the two things it
          needed. It looked like the same class of thing as a collapsed list of
          hours nobody can book, so it read as skippable — and it said nothing
          about WHY a visitor would open it. The pills reach fourteen days; the
          bookable window is three months. A visitor wanting a date in October
          has no way to learn from "Pilih tanggal lain" that October is even
          available.
          
          SO IT TAKES THE INTERACTIVE BLUE, the display face, and a second line
          that states the fact. It is still a full-width disclosure row rather
          than a pill or a filled bar: a pill would read as a third date, and a
          filled navy bar is the hand-off band's device, which means "go to
          WhatsApp" on this plate and may not mean anything else.
          
          The mark is `react-icons`, per the project rule that icons come from a
          library rather than a drawn glyph. */}
      <button
        type="button"
        lang="id"
        aria-expanded={open}
        aria-controls="order-calendar"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-[var(--color-wash)]"
      >
        <FiCalendar
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-[var(--color-interactive)]"
        />
        <span className="min-w-0 flex-1">
          <span className="type-display block text-[length:var(--text-label)] font-medium tracking-[0.06em] text-[var(--color-interactive)] uppercase">
            Pilih tanggal lain
          </span>
          <span className="mt-1 block text-[length:var(--text-sm)] text-[var(--color-fg-muted)]">
            Tanggal lebih dari 14 hari ke depan bisa dipilih lewat kalender.
          </span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 inline-block text-[var(--color-interactive)] transition-transform duration-150",
            open && "rotate-90",
          )}
        >
          ›
        </span>
      </button>

      {open ? (
        <div ref={calendarRef} id="order-calendar">
          {/* THE HEIGHT CAP IS A PHONE RULE NOW, not a universal one — changed
              2026-08-15.
              
              WHY IT EXISTS AT ALL: three month grids unrolled inline are well
              over a thousand pixels, which on a phone would shove the slot grid
              — the product — off the screen the moment a visitor went looking
              for a date. Capped, the calendar scrolls inside itself and the grid
              stays where it was. `overscroll-contain` for the same reason the
              pill row has it: a flick at the end of this list must not scroll
              the page behind it.
              
              WHY IT LIFTS FROM 980px: on a desktop there is no such trade. The
              plate is wide, the viewport is tall, and a scrollbar INSIDE a panel
              that the page could simply scroll past is a second scrollport a
              visitor has to notice and aim at. Above the query the months unroll
              in full and the page does the scrolling, which is the behaviour the
              user asked for.
              
              `@min-[980px]` is the PLATE's container query, not a viewport
              breakpoint — the same unit every other responsive decision on this
              panel uses, so the calendar changes shape with the object it lives
              in rather than with the window. */}
          <div
            lang="id"
            className="max-h-[min(58svh,420px)] overflow-y-auto border-t-2 border-[var(--color-band)] [overscroll-behavior-y:contain] @min-[980px]:max-h-none @min-[980px]:overflow-visible"
          >
            {months.map((month) => (
              <section
                key={month.key}
                aria-label={month.label}
                className="px-2 pb-3 @min-[360px]:px-4"
              >
                {/* `sticky`, so the month a visitor is scrolling through is
                    always named. Inside a capped scroller a heading that has
                    left the top is a heading that has stopped doing its job. */}
                <h4 className="type-display sticky top-0 z-10 bg-[var(--color-bg)] py-2 text-[length:var(--text-sm)] font-bold tracking-[0.04em] text-[var(--color-fg)] uppercase">
                  {month.label}
                </h4>

                {/* The weekday heads are decoration for a sighted scanner: each
                    day button already carries its full date as its accessible
                    name, so announcing seven abbreviations first is noise. */}
                <div
                  aria-hidden="true"
                  className="grid grid-cols-7 pb-1 text-center text-[length:var(--text-xs)] text-[var(--color-fg-muted)]"
                >
                  {DAY_NAMES.map((day) => (
                    <span
                      key={day}
                      className="type-display font-medium tracking-[0.06em] uppercase"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {Array.from({ length: month.leading }, (_, i) => (
                    <span key={`lead-${i}`} aria-hidden="true" />
                  ))}

                  {month.days.map(({ date, dayOfMonth }) => {
                    // OUT OF WINDOW IS NOT "UNAVAILABLE", and that distinction
                    // is why these are `aria-hidden` spans rather than
                    // `aria-disabled` buttons. The Visible-Unavailable Rule is
                    // about SLOTS — a taken hour is information a visitor wants.
                    // Yesterday is not information; it is the shape of the
                    // month. It stays visible so the grid keeps its geometry
                    // and silent so a screen reader hears only the days that
                    // can be chosen.
                    if (!date) {
                      return (
                        <span
                          key={dayOfMonth}
                          aria-hidden="true"
                          className="flex h-11 items-center justify-center text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
                        >
                          {dayOfMonth}
                        </span>
                      );
                    }

                    const isSelected = date === selected;
                    const isToday = date === dates[0];

                    return (
                      <button
                        key={dayOfMonth}
                        type="button"
                        aria-pressed={isSelected}
                        // The full date, not the bare number: inside a scrolling
                        // four-month list "15" alone tells a screen-reader
                        // visitor nothing about which fifteenth they landed on.
                        aria-label={`${dayOfMonth} ${month.label}`}
                        onClick={() => {
                          onSelect(date);
                          // Closing on choose is what makes this two taps rather
                          // than three. The pill row re-renders with the chosen
                          // date appended, so the selection is still visible.
                          setOpen(false);
                        }}
                        className={cn(
                          // Square, because everything on this plate except the
                          // pills is. 44px tall, which is the tap floor on the
                          // primary device; the width is one seventh of the
                          // plate and is measured rather than set.
                          "flex h-11 items-center justify-center border-2 text-[length:var(--text-sm)] font-semibold",
                          "transition-colors duration-150",
                          isSelected
                            ? "border-[var(--color-interactive)] bg-[var(--color-interactive)] text-[var(--color-fg-inverse)]"
                            : cn(
                                "text-[var(--color-fg)] hover:border-[var(--color-interactive)] hover:bg-[var(--color-wash)]",
                                // Today keeps a navy ring so the visitor can
                                // find where they are in a four-month list.
                                // A ring, never a fill: a filled today next to
                                // a filled selection would be two cells claiming
                                // the same meaning.
                                isToday ? "border-[var(--color-band)]" : "border-transparent",
                              ),
                        )}
                      >
                        {dayOfMonth}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
