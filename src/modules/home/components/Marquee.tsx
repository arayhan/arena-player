"use client";

import { useEffect, useRef } from "react";

import { useMotion, type MotionApi } from "@/lib/motion";

/**
 * The hero-foot band — DESIGN.md's Marquee section.
 *
 * REBUILT 2026-08-13 FOR THE "PELAT ENAMEL" DIRECTION, and two things changed
 * at once.
 *
 * IT IS FLAT. The `-1.2deg` lean is gone at the user's instruction, and so is
 * the cancelling counter-skew that used to sit on the track — a counter-skew
 * with nothing to counter is a compositing layer bought for a net zero.
 *
 * IT IS BLUE, NOT NAVY. On the previous direction the band was a navy stripe
 * under a navy hero, which meant it only existed because of its type. The plate
 * is navy now, so the band inverts to `blue-600` with white type: it reads as
 * the painted stripe across an enamel sign rather than as a slightly different
 * shade of the same field.
 *
 * That inversion also retires the separator problem this file used to carry.
 * DESIGN.md specifies `blue-600` separators on a navy band, which computes
 * 3.30:1 and is exactly the failure the on-band token row exists to prevent.
 * With the band itself blue the question dissolves: separators take `navy-900`,
 * the sign's own second colour.
 *
 * CONTENT IS FACTS, NEVER A SLOGAN, per DESIGN.md: "it carries facts rather
 * than slogans... so every fact in it appears somewhere reachable." Copied
 * verbatim from the DESIGN.html prototype's own marquee track, and checked
 * against the two numbers it states rather than assumed: nine time slots
 * (`src/domain/slots.ts`'s `TIME_SLOTS`, 06.00–24.00) and a 14-day booking
 * window (`src/domain/dates.ts`'s `BOOKING_WINDOW_DAYS`).
 */
const ITEMS = [
  // "LOMBOK" IS THE SEVENTH ITEM AND THE ONE ADDITION TO THE PROTOTYPE'S
  // TRACK. It passes the facts-not-slogans rule the comment above states —
  // it is where the field is, the same class of fact as the slot count and
  // the timezone standing beside it, and it is reachable elsewhere on the
  // page (the location block's third display line). A tagline would not
  // qualify no matter how short.
  "LOMBOK",
  "9 SLOT / HARI",
  "06.00 — 24.00",
  "WITA",
  "BOOKING VIA WHATSAPP",
  "TANPA AKUN",
  "14 HARI KE DEPAN",
] as const;

// The track holds ITEMS twice back to back (see the render below), so
// translating by exactly one copy's measured width loops seamlessly — the
// visible band is always a full, unclipped repeat of the same seven facts.
const DOUBLED = [...ITEMS, ...ITEMS];

// SPEED IS NOT IN DESIGN.md. The Marquee section fixes the axis (X only) and
// the halt conditions; it says nothing about how fast the band moves or
// which way, and design-process.md names "marquee speed and direction" as
// exactly the kind of choice that goes through AskUserQuestion before code —
// this session's tool set does not expose that call. 45px/s and
// right-to-left are a conservative, clearly-flagged default (a steady,
// legible ticker pace, the conventional crawl direction), not a decision —
// PROGRESS.md and the handoff report both name this as needing the user's
// confirmation before the client checkpoint.
const SPEED_PX_PER_SECOND = 45;

type Tween = ReturnType<MotionApi["gsap"]["to"]>;

export function Marquee() {
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<Tween | null>(null);
  // Shared with the plain visibility effect below. GSAP loads asynchronously
  // (a dynamic import, per src/lib/motion.ts), so the IntersectionObserver's
  // first callback routinely fires BEFORE the tween exists — `apply()` would
  // then read a null `tweenRef.current` and silently no-op forever, since
  // nothing re-fires the observer once the element's intersection state has
  // not actually changed. Read live in a browser: without this ref, the
  // track's transform stayed frozen at x:0 for 5+ seconds after the hero
  // painted, fully visible, tween created and immediately paused with
  // nothing left to un-pause it. `animate()` below consults this ref the
  // moment it creates the tween, closing the race from the other side.
  const visibleRef = useRef(false);

  useMotion(
    {
      animate: ({ gsap }) => {
        const track = trackRef.current;
        if (!track) return;

        const setWidth = track.scrollWidth / 2;
        const tween = gsap.to(track, {
          x: -setWidth,
          duration: setWidth / SPEED_PX_PER_SECOND,
          ease: "none",
          repeat: -1,
        });
        tweenRef.current = tween;
        // Start playing or paused based on CURRENT visibility, not
        // unconditionally paused — see visibleRef's comment above.
        if (visibleRef.current && !document.hidden) tween.play();
        else tween.pause();
      },
      // No entrance to reverse: the track is visible and correctly
      // positioned (counter-skewed, at rest) before any GSAP loads — the
      // X-translation loop is ambient decoration on something already
      // settled, not a reveal, so there is nothing to apply here. An empty
      // body written on purpose, per src/lib/motion.ts's own guidance for
      // exactly this case.
      settle: () => {},
    },
    { scope: bandRef },
  );

  // THE OFF-SCREEN-IS-OFF RULE, same shape as HeroCanvas.tsx: `visibleRef`
  // tracks the IntersectionObserver, the tab's own hidden state is checked
  // separately, and the two combine before the tween is allowed to run. A
  // plain effect rather than useMotion's `deps` rebuild — rebuilding the
  // tween on every visibility toggle would restart it from x:0 and visibly
  // jump, where play()/pause() on the SAME tween instance preserves position.
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    const apply = () => {
      if (visibleRef.current && !document.hidden) tweenRef.current?.play();
      else tweenRef.current?.pause();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? false;
        apply();
      },
      { threshold: 0 },
    );
    io.observe(band);

    document.addEventListener("visibilitychange", apply);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="relative z-10 overflow-hidden border-y-[1.5px] border-[var(--color-interactive)] bg-[var(--color-interactive)] py-3"
    >
      {/* THE BAND IS FLAT. It carried `skewY(-1.2deg)` on the outer box and a
          cancelling `skewY(1.2deg)` on this track until 2026-08-13, when the
          user ruled the lean out. Both halves went together — a counter-skew
          with nothing to counter is a transform that costs a compositing layer
          and buys a net zero.

          On the "pelat enamel" direction the flat band is the right answer
          anyway rather than a concession: a painted stripe on a metal sign runs
          parallel to the sign's own edge, and a leaning stripe would be the one
          element on the plate pretending to have perspective. */}
      <div
        ref={trackRef}
        className="type-display flex w-max items-center gap-12 text-[length:var(--text-sm)] font-bold tracking-[0.18em] whitespace-nowrap text-[var(--color-fg-inverse)] uppercase"
      >
        {DOUBLED.flatMap((item, i) => [
          <span key={`item-${i}`}>{item}</span>,
          // Separators in navy-900, the sign's second colour, punched out of
          // the blue stripe — see the file header on why the band inverting to
          // blue retired the old separator-contrast problem entirely.
          // Wrapped as an expression, not raw JSX text: "///" as a literal
          // text node trips react/jsx-no-comment-textnodes, which exists to
          // catch an accidentally-unwrapped `//` comment.
          <em key={`sep-${i}`} className="text-[var(--color-band)] not-italic">
            {"///"}
          </em>,
        ])}
      </div>
    </div>
  );
}
