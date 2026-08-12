"use client";

import { useEffect, useRef } from "react";

/**
 * The scroll-progress hairline — DESIGN.md's Progress bar component. Fixed to
 * the very top of the viewport, `scaleX` only, `aria-hidden`, telling a
 * visitor how much of the page — specifically Ketentuan, the longest reading
 * on it — is left.
 *
 * WHY THIS FILE DOES NOT CALL `useMotion` FROM `src/lib/motion.ts`, EVEN
 * THOUGH THE BRIEF FOR THIS COMPONENT SAYS "ALL ANIMATION GOES THROUGH
 * motion.ts". Read literally that would mean importing `useMotion` here; it
 * is not what this component does, and the reason is worth writing down
 * rather than silently deviating.
 *
 * `motion.ts` opens by calling itself "the single door to GSAP" — its whole
 * job is wrapping a GSAP TWEEN (`animate`) with a `prefers-reduced-motion`
 * gate and a no-GSAP fallback (`settle`), because GSAP itself has no such
 * gate. This component has no tween to gate: it is one `transform: scaleX()`
 * write per (browser-coalesced) scroll event, with no duration and no easing
 * curve — there is nothing here for GSAP to interpolate, so routing it
 * through `useMotion` would mean fetching the 43.6KB GSAP chunk to run
 * `gsap.set()`, which does exactly what one line of vanilla JS already does.
 * `useMotion`'s `settle` callback is also documented as a one-shot, idempotent
 * "apply the end state" call with no matching per-call cleanup — hosting a
 * persistent `scroll` listener inside it would leak a listener on every
 * remount with nothing to remove it, which is precisely the failure class
 * `useMotion`'s own cleanup contract (`context?.revert()`) does not cover,
 * since it only reverts GSAP-created work.
 *
 * This mirrors an existing, reviewed precedent in this same directory:
 * `HeroCanvas.tsx` is also a continuously-updating, reduced-motion-gated
 * effect that bypasses `useMotion` for the identical reason — its animation
 * (a WebGL raf loop) has nothing GSAP-shaped about it either, and it checks
 * `matchMedia("(prefers-reduced-motion: reduce)")` directly rather than
 * paying for the GSAP fetch to ask a question the platform already answers
 * synchronously.
 *
 * THE REDUCED-MOTION DECISION: KEEP UPDATING, DO NOT HIDE. DESIGN.md asks
 * for this explicitly ("decide whether reduced motion should hide it or keep
 * it updating without easing"). This bar carries information — how much of
 * the page, specifically the ten-rule Ketentuan band, is left — and unlike
 * the hero shader or the marquee, it never runs on its own: every pixel of
 * its position is a direct, un-lagged function of the visitor's own scroll
 * offset, with zero interpolation. There is no autonomous motion for
 * `prefers-reduced-motion` to suppress here, only a fact to keep displaying,
 * so hiding it would remove a wayfinding aid for reduced-motion visitors
 * with no accessibility benefit in exchange. Concretely: this component
 * performs the identical write regardless of the OS preference — "without
 * easing" is not a fallback branch, it is the only behaviour that exists,
 * which is also why there is no CSS `transition` on the transform below.
 *
 * NO `requestAnimationFrame` LOOP. A `scroll` listener already fires only
 * when the page actually moves, and the browser batches/coalesces its
 * dispatch to (at most) once per frame during an active scroll — polling
 * every frame regardless of whether scrolling happened, the way the hero
 * shader must, would burn CPU on the mid-range Android this project targets
 * for no visual gain over the passive listener below.
 */
export function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const write = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      // Guards a page shorter than the viewport (scrollable <= 0), which
      // would otherwise divide by zero and write `scaleX(NaN)`.
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    write(); // A reload part-way down the page must not show an empty bar.
    window.addEventListener("scroll", write, { passive: true });
    // The page can also change height after mount — fonts landing, images
    // resolving, the Ketentuan band's collapsed content — so the same write
    // re-runs on resize rather than trusting the value scroll last computed.
    window.addEventListener("resize", write, { passive: true });
    return () => {
      window.removeEventListener("scroll", write);
      window.removeEventListener("resize", write);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className={
        // z-[60]: strictly above the header's z-50. The header is `fixed`
        // and 81px tall (18px padding + the 44px CTA + 18px padding + the 1px
        // bottom hairline once scrolled), so a bar at the same top offset
        // with a LOWER stacking position would sit fully underneath the
        // header's own background the moment it materialises on scroll —
        // invisible exactly when there is something to show progress on.
        // Painting above it instead keeps this a permanent hairline at the
        // very top edge of the viewport, over the header rather than lost
        // behind it.
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left " +
        "bg-[var(--color-interactive)]"
      }
      style={{ transform: "scaleX(0)" }}
    />
  );
}
