"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * The page chrome — DESIGN.md's Header component.
 *
 * FIXED, NOT `position: sticky`, AND THE SPEC WORD IS "STICKY" FOR A REASON
 * THAT DOES NOT SURVIVE CONTACT WITH THE HERO. A `sticky top-0` header
 * occupies flow space before it sticks, so the hero would start below it and
 * the two together would exceed one viewport — and DESIGN.md's Hero section
 * opens with "Full `100svh`". The header has to sit OVER the hero, transparent,
 * which is what "transparent at rest, materialises on scroll" describes.
 * `fixed` is the layout that produces the specified behaviour; `sticky` is the
 * word for how it feels.
 *
 * NO NAV LINKS, and that is a decision rather than an omission: the page has
 * four sections, and a menu for four anchors is furniture. Logo left, one CTA
 * right, nothing else.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Reads once on mount before subscribing, because a reload part-way down
    // the page fires no scroll event and would otherwise leave the header
    // transparent over the Ketentuan band — the one place transparency is
    // unreadable rather than merely wrong.
    const read = () => setScrolled(globalThis.scrollY > 40);
    read();
    // Passive: this listener never calls preventDefault, and saying so lets the
    // browser scroll without waiting on it. The state setter is a no-op when
    // the boolean has not changed, so this re-renders twice per page — at the
    // 40px crossing in each direction — rather than once per scroll event.
    globalThis.addEventListener("scroll", read, { passive: true });
    return () => globalThis.removeEventListener("scroll", read);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 py-[18px] transition-[background-color,border-color,backdrop-filter] duration-300",
        // THE BLUR IS PROGRESSIVE ENHANCEMENT, NOT THE MECHANISM. DESIGN.md is
        // explicit: `backdrop-filter` is unavailable or disabled on a real
        // share of in-app webviews, and this header sits over a moving
        // generative field. The 82% white has to separate the header from the
        // hero on its own, so the fill is unconditional and only the blur is
        // gated behind `@supports`.
        scrolled
          ? "border-b border-[var(--color-border)] bg-[rgb(255_255_255/0.82)] supports-[backdrop-filter:blur(1px)]:backdrop-blur-[14px]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex w-full max-w-[var(--container-max)] items-center justify-between gap-4 px-[var(--space-section-x)]">
        {/* The same mark the hero uses, and NOT `priority` for the same reason
            it is not there either: the LCP element is the hero headline, and a
            preloaded logo can take that slot. Explicit width and height keep
            it off the CLS budget regardless. */}
        <Image
          src="/logo-mark.png"
          alt="Arena Player"
          width={1042}
          height={502}
          className="h-8 w-auto md:h-9"
        />

        {/* 44px MINIMUM, AND DESIGN.md RECORDS THIS AS A CORRECTION TO THE
            CONCEPT RATHER THAN AN INTERPRETATION OF IT. The source prototype's
            header pill computes to roughly 37px, which is under the tap floor
            on the primary device — a phone, held one-handed, at the top of the
            screen where the thumb reaches worst. The pill grows to 44px; the
            text does not shrink to fit a smaller pill. */}
        <a
          href="#order"
          lang="id"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent-strong)] px-5 type-display text-[length:var(--text-label)] font-extrabold tracking-[0.06em] text-[var(--color-fg-inverse)] uppercase transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong-hover)]"
        >
          Pesan Lapangan
        </a>
      </div>
    </header>
  );
}
