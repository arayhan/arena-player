"use client";

import { useRef } from "react";

import { useMotion } from "@/lib/motion";

/**
 * THE PAGE-WIDE SCROLL REVEAL — DESIGN.md's motion inventory has specified this
 * since the redesign ("Scroll, page-wide — reveal on enter, fade with a 48px
 * rise, fired once and then unobserved, 700ms") and nothing had built it. The
 * location and closing sections were recorded in PROGRESS.md as having no
 * reveal at all; this closes that.
 *
 * ONE CLIENT ISLAND, NOT A CLIENT PAGE. `HomePage` and every section it renders
 * are server components, and they stay that way: they mark participating
 * elements with a plain `data-reveal` attribute, which costs a server component
 * nothing, and this file — which renders no DOM of its own — is the only thing
 * that ships JavaScript. Converting the sections to client components to give
 * them a hook each would have paid for the same effect several times over.
 *
 * IT TARGETS EVERY MATCH, WHICH IS WHAT WAS ASKED FOR. `[data-reveal]` is read
 * from the document at build time rather than from a fixed list, so a section
 * added later opts in by writing one attribute and never touches this file.
 *
 * NOTHING STARTS HIDDEN IN THE MARKUP. `gsap.from` sets the start state only
 * after GSAP has loaded, so a failed fetch, a reduced-motion preference, or JS
 * disabled all leave a complete, readable page — the same guarantee `Hero`
 * already relies on, and the reason `settle` below is deliberately empty rather
 * than absent.
 */
export function ScrollReveal() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useMotion(
    {
      animate: ({ gsap, ScrollTrigger }) => {
        // `document.querySelectorAll`, NOT `gsap.utils.toArray("[data-reveal]")`,
        // AND THE FIRST VERSION SHIPPED THE WRONG ONE. `useMotion` runs this
        // inside `gsap.context(fn, scope)`, and a context RESOLVES SELECTOR
        // STRINGS WITHIN ITS SCOPE ELEMENT. The scope here is this component's
        // own empty `<div>`, so the selector matched **zero** elements and the
        // reveal silently did nothing — no error, no warning, every target
        // sitting at `opacity: 1` exactly as if the feature had never been
        // written. Passing real elements bypasses context scoping entirely
        // while the context still owns their cleanup.
        const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (targets.length === 0) return;

        targets.forEach((el) => {
          gsap.from(el, {
            y: 48,
            opacity: 0,
            duration: 0.7,
            // DESIGN.md names `cubic-bezier(0.22, 1, 0.36, 1)`. GSAP reaches
            // that curve family through `power3.out` without loading
            // `CustomEase`, which is a separate plugin and a separate download;
            // `Hero` already uses the same easing for the same reason, so the
            // two entrances on this page match rather than merely rhyme.
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              // 88% rather than the viewport edge: on a phone the fold is the
              // scarce resource, and a reveal that waits for the element to be
              // fully inside fires after the visitor has already read it.
              start: "top 88%",
              // FIRED ONCE AND THEN UNOBSERVED, verbatim from the spec. A
              // reveal that replays on every scroll-back is a page that will
              // not settle, and it keeps a trigger alive for the whole session
              // for an effect the visitor has already seen.
              once: true,
            },
          });
        });

        ScrollTrigger.refresh();
      },
      // Empty ON PURPOSE, not by omission. Nothing here starts at `opacity: 0`
      // in the markup, so the resting state IS the finished state and there is
      // nothing to restore.
      settle: () => {},
    },
    // The scope exists for CLEANUP OWNERSHIP ONLY — everything built inside is
    // reverted together on unmount. It deliberately does NOT select the
    // targets: they live all over the page and none is a descendant of this
    // component. The first version relied on `gsap.utils.toArray` here and got
    // exactly what that combination promises — an empty list. See the note at
    // the query above.
    { scope: scopeRef },
  );

  return <div ref={scopeRef} aria-hidden="true" className="hidden" />;
}
