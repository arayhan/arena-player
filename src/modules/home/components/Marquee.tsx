"use client";

import { useEffect, useRef } from "react";

import { useMotion, type MotionApi } from "@/lib/motion";

/**
 * The hero-foot band — DESIGN.md's Marquee section.
 *
 * Full-width `navy-900`, skewed `-1.2deg`, `blue-50` text in the display face
 * at 700 and `0.18em` tracking, `blue-600`... — DESIGN.md's own text says
 * `blue-600` separators, and that value is NOT used below. It is the same
 * class of stale value the redesign has already caught and corrected twice
 * on this page (the wipe's `skewX(-12deg)`, the slot cell's 85%-white label):
 * `blue-600` on `navy-900` computes 3.30:1, which is exactly the failure
 * DESIGN.md's own on-band token row exists to fix, and which Section.tsx and
 * KetentuanRows.tsx already avoid by reading `--color-interactive-on-band`
 * (`blue-400`, 6.72:1) instead. Flagged, not silently "fixed" — DESIGN.md's
 * prose should get the same correction on its own next pass.
 *
 * CONTENT IS FACTS, NEVER A SLOGAN, per DESIGN.md: "it carries facts rather
 * than slogans... so every fact in it appears somewhere reachable." Copied
 * verbatim from the DESIGN.html prototype's own marquee track, and checked
 * against the two numbers it states rather than assumed: nine time slots
 * (`src/domain/slots.ts`'s `TIME_SLOTS`, 06.00–24.00) and a 14-day booking
 * window (`src/domain/dates.ts`'s `BOOKING_WINDOW_DAYS`).
 */
const ITEMS = [
  "9 SLOT / HARI",
  "06.00 — 24.00",
  "WITA",
  "BOOKING VIA WHATSAPP",
  "TANPA AKUN",
  "14 HARI KE DEPAN",
] as const;

// The track holds ITEMS twice back to back (see the render below), so
// translating by exactly one copy's measured width loops seamlessly — the
// visible band is always a full, unclipped repeat of the same six facts.
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
      className="absolute inset-x-0 bottom-0 z-10 overflow-hidden bg-[var(--color-band)] py-3 [transform:skewY(-1.2deg)]"
    >
      {/* THE BAND LEANS; THE TYPE ON IT DOES NOT. The outer element's
          skewY(-1.2deg) shears its own box (background, edges) — the thing
          DESIGN.md calls "the band's edge leans." This inner track carries
          the exact opposite skewY(1.2deg), which composes with the parent's
          to net zero shear on the rendered text: the two skewY matrices are
          around the same axis and cancel algebraically. GSAP's `x` tween
          below reads the computed transform on first run and preserves this
          counter-skew while animating translateX alone — it does not
          overwrite it, which is why the skew is set via a CSS class rather
          than inline style GSAP could clobber. */}
      <div
        ref={trackRef}
        className="flex w-max items-center gap-12 whitespace-nowrap type-display text-[length:var(--text-sm)] font-bold tracking-[0.18em] text-[var(--color-fg-on-band)] uppercase [transform:skewY(1.2deg)]"
      >
        {DOUBLED.flatMap((item, i) => [
          <span key={`item-${i}`}>{item}</span>,
          // The separator itself, correctly on --color-interactive-on-band —
          // see the file header comment on why this is not --color-blue-600.
          // Wrapped as an expression, not raw JSX text: "///" as a literal
          // text node trips react/jsx-no-comment-textnodes, which exists to
          // catch an accidentally-unwrapped `//` comment.
          <em key={`sep-${i}`} className="not-italic text-[var(--color-interactive-on-band)]">
            {"///"}
          </em>,
        ])}
      </div>
    </div>
  );
}
