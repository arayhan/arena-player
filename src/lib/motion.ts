"use client";

/**
 * The single door to GSAP. Nothing else in this repo may import it.
 *
 * TWO RULES LIVE HERE, AND BOTH ARE ENFORCED RATHER THAN ASKED FOR.
 *
 * 1. GSAP LOADS LAZILY. It measured 43.6KB gzip with ScrollTrigger, against a
 *    framework baseline that already came in 30% over estimate. `/` only fits
 *    its budget because that 43.6KB is behind the dynamic import below.
 *    eslint.config.mjs bans `gsap`, `gsap/*` and `@gsap/react` everywhere —
 *    `no-restricted-imports` matches static imports and not `import()`, so the
 *    dynamic form here is the one remaining way in, and `check:docs` asserts
 *    that form appears in this file only.
 *
 * 2. REDUCED MOTION IS NOT OPTIONAL. GSAP has no built-in
 *    `prefers-reduced-motion` handling — a bare `gsap.to()` in a component
 *    animates for a visitor who asked the operating system not to. That is why
 *    `settle` below is a REQUIRED field and not a convention: you cannot
 *    describe an animation here without also saying what someone who declined
 *    it sees.
 *
 * @gsap/react's `useGSAP` is deliberately unused. Its source opens with
 * `import gsap from "gsap"`, and it is a hook, so importing it means importing
 * it statically — which puts the whole 43.6KB back on first load. What it wraps
 * is `gsap.context()`, which this file uses directly.
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";

type Gsap = Awaited<typeof import("gsap")>["gsap"];
type ScrollTriggerType = Awaited<typeof import("gsap/ScrollTrigger")>["ScrollTrigger"];

export interface MotionApi {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerType;
}

let pending: Promise<MotionApi> | null = null;

/**
 * Loads GSAP and ScrollTrigger once per page, on demand.
 *
 * Memoised on the promise, not the result: two components mounting in the same
 * tick would otherwise each start a download and each call registerPlugin.
 *
 * Exported for the rare case that is not a React component — a route
 * transition, an imperative one-shot. Prefer `useMotion`, which handles
 * cleanup.
 */
export function loadMotion(): Promise<MotionApi> {
  pending ??= (async () => {
    const [core, scrollTrigger] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
    const { gsap } = core;
    const { ScrollTrigger } = scrollTrigger;

    // Registration is client-only by construction: this module is "use client"
    // and the import happens inside an effect, so it never runs during SSR —
    // where ScrollTrigger would reach for `window` and throw.
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  })();
  return pending;
}

export interface MotionSpec {
  /**
   * The full animation. Runs only under
   * `(prefers-reduced-motion: no-preference)`.
   */
  animate: (api: MotionApi) => void;

  /**
   * What a reduced-motion visitor gets. REQUIRED, and it is not "nothing":
   * an entrance animation typically starts at `opacity: 0`, so skipping the
   * tween leaves the element invisible forever. Apply the END STATE here —
   * usually one `gsap.set()` — or, if the animation only decorates something
   * already at rest, an empty body written on purpose.
   */
  settle: (api: MotionApi) => void;
}

export interface MotionOptions {
  /**
   * Scopes selector strings to a subtree and, more importantly, scopes
   * cleanup: everything created inside is reverted together when this
   * unmounts.
   */
  scope?: RefObject<HTMLElement | null>;

  /** Extra values that should rebuild the animation when they change. */
  deps?: readonly unknown[];

  /** Set false to build nothing — a section that has not entered yet. */
  enabled?: boolean;
}

/**
 * Declare an animation. The only supported way to animate in this repo.
 *
 * Rebuilds on pathname change as well as on `deps`, because App Router client
 * transitions do not recalculate ScrollTrigger positions: navigating from `/`
 * to `/booking` and back leaves triggers pointing at offsets from the previous
 * document height, so pinned and scrubbed sections fire at the wrong scroll
 * position with nothing in the console.
 */
export function useMotion(spec: MotionSpec, options: MotionOptions = {}): void {
  const { scope, deps = [], enabled = true } = options;
  const pathname = usePathname();

  // `spec` is a fresh object literal on every render, so depending on it would
  // rebuild the animation every time the component re-renders. Held in a ref
  // instead, and read at build time, so the callbacks are always the current
  // ones without being inputs to the effect.
  const specRef = useRef(spec);

  // Updated in an effect, not during render: React 19 rejects a ref write in
  // the render body, and rightly — it makes a component's output depend on how
  // many times it happened to render. `useRef(spec)` already seeds the first
  // value, and this effect is declared before the one below so it has always
  // run by the time an animation is built.
  useEffect(() => {
    specRef.current = spec;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let context: ReturnType<Gsap["context"]> | undefined;

    void loadMotion().then((api) => {
      if (cancelled) return;

      context = api.gsap.context(() => {
        const media = api.gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => specRef.current.animate(api));
        media.add("(prefers-reduced-motion: reduce)", () => specRef.current.settle(api));
      }, scope?.current ?? undefined);

      // Positions are measured at creation. Anything laid out after this tick
      // — a web font landing, an image resolving — moves the trigger points.
      api.ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      // Reverts the matchMedia and every tween created inside it. This is what
      // @gsap/react's useGSAP does, minus the static import of gsap.
      context?.revert();
    };
    // The spread is deliberate and is why this line carries a disable: the
    // caller's deps are the whole point of the option, and a spread cannot be
    // statically verified. Keep the array a fixed length at each call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, enabled, scope, ...deps]);
}
