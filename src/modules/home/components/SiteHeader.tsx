"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { Button } from "./Button";

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
        // TWO SURFACES, NOT TWO OPACITIES — and this is a contrast fix, not a
        // style tweak. The hero became a navy plate on 2026-08-13, so a
        // transparent header at rest was putting a navy logo and a navy-filled
        // CTA on navy: the button was legible only by its own hairline, and the
        // mark was almost gone. At rest the header now reads ON-BAND; past 40px
        // it materialises as the white bar the light sections below need.
        //
        // THE BLUR IS PROGRESSIVE ENHANCEMENT, NOT THE MECHANISM. DESIGN.md is
        // explicit: `backdrop-filter` is unavailable or disabled on a real
        // share of in-app webviews. The 82% white has to separate the header
        // from the page on its own, so the fill is unconditional and only the
        // blur is gated behind `@supports`.
        scrolled
          ? "border-b border-[var(--color-border)] bg-[rgb(255_255_255/0.82)] supports-[backdrop-filter:blur(1px)]:backdrop-blur-[14px]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex w-full max-w-[var(--container-max)] items-center justify-between gap-4 px-[var(--space-section-x)]">
        {/* NOT `priority`: the LCP element is the hero headline, and a
            preloaded logo can take that slot. Explicit width and height keep it
            off the CLS budget regardless.

            `sizes` IS NOT OPTIONAL HERE, AND LEAVING IT OFF COST 81.7KB.
            `width={1042}` describes the SOURCE file, not the rendered box —
            this mark paints at 32px tall, roughly 66px wide. Without `sizes`,
            `next/image` cannot know that and generates the largest candidate in
            the device list: measured in a production Lighthouse run, the header
            requested `/_next/image?url=%2Flogo-mark.png&w=3840&q=75` and pulled
            **81.7KB** — the second-heaviest asset on the page, for an element
            the size of a fingernail.

            Declaring the real painted width lets the srcset resolver pick a
            candidate near it instead. It is a one-attribute fix for a sixth of
            the page's transfer weight, and nothing in the build would ever have
            reported it: `check:budget` measures JavaScript and cannot see an
            image at all. */}
        {/* `invert` while the header sits on the navy plate. The supplied mark
            is a dark navy lockup drawn for a light ground; on the hero it was
            navy-on-navy and effectively invisible. Inverting is honest here
            because the mark is a single flat colour — there is no photographic
            content for the filter to distort — and it costs nothing at runtime.
            It reverts the moment the header materialises over the light
            sections. */}
        <Image
          src="/logo-mark.png"
          alt="Arena Player"
          width={1042}
          height={502}
          sizes="80px"
          className={cn(
            "h-8 w-auto transition-[filter] duration-300 md:h-9",
            scrolled ? "" : "brightness-0 invert",
          )}
        />

        {/* 44px MINIMUM, AND DESIGN.md RECORDS THIS AS A CORRECTION TO THE
            CONCEPT RATHER THAN AN INTERPRETATION OF IT. The source prototype's
            header pill computes to roughly 37px, which is under the tap floor
            on the primary device — a phone, held one-handed, at the top of the
            screen where the thumb reaches worst. The pill grows to 44px; the
            text does not shrink to fit a smaller pill. `size="sm"` is the one
            place `Button` is asked for that height instead of the 56px spec
            height — see the comment on `ButtonSize` in Button.tsx. */}
        <Button href="#order" lang="id" size="sm" variant={scrolled ? "primary" : "on-band"}>
          Pesan Lapangan
        </Button>
      </div>
    </header>
  );
}
