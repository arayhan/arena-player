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
        {/* THE MARK AND THE NAME ARE ONE ITEM, not two. The row is
            `justify-between` with exactly two children, so a third child would
            become a third justified item and push the name into the middle of
            the header. Wrapping them keeps the lockup left-grouped. */}
        <span className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/logo-mark.png"
            alt=""
            aria-hidden="true"
            width={1042}
            height={502}
            sizes="72px"
            className={cn(
              // THE MARK YIELDS TO THE NAME BELOW 360px, AND THAT ORDER IS THE
              // WHOLE POINT. Measured: the row's content box is 288px at 320px,
              // and the parts want 58 (mark) + 10 + 117 (name) + 16 + 117 (CTA)
              // = 318. Something has to go, and between a monogram and the
              // words it abbreviates, the words are what identify the business
              // to someone who has never seen the mark before. Hiding the name
              // to keep the mark would fail the thing the header is for.
              // 320px is the only width where this binds; from 360px both fit
              // with room to spare.
              "hidden h-7 w-auto shrink-0 transition-[filter] duration-300 min-[360px]:block md:h-9",
              scrolled ? "" : "brightness-0 invert",
            )}
          />

          {/* THE BUSINESS NAME, RENDERED. Confirmed by the client 2026-08-13,
              and until then it existed on this page only as the mark's `alt`
              text — a screen reader heard it and a visitor never saw it. The
              mark alone is an "AP" monogram, which identifies nothing to
              someone who has not been told what it stands for.

              The `alt` moved to this text and the image became `aria-hidden`:
              with both present, an unchanged `alt` would have made a screen
              reader announce "Arena Player" twice in a row.

              THE BODY FACE, NOT PANCHANG, AND THAT IS A MEASUREMENT. Panchang
              sets "Arena Player" at 136.1px at 14px and 116.7px at 12px; the
              body face sets it at 82.7px. The header row at 320px has 288px of
              content box to hold a mark, this name, and a 44px tap target, and
              the display face does not fit in it. The client's own lockup sets
              the name wide and tracked under the mark, so tracking is what
              carries the character here rather than the face.

              Colour switches on `scrolled` rather than inheriting the mark's
              `invert` filter — a filter on text is a different thing from a
              token, and it would fight the transition rather than share it. */}
          <span
            className={cn(
              "truncate text-[13px] font-bold tracking-[0.14em] uppercase transition-colors duration-300",
              scrolled ? "text-[var(--color-fg)]" : "text-[var(--color-fg-on-band)]",
            )}
          >
            Arena Player
          </span>
        </span>

        {/* 44px MINIMUM, AND DESIGN.md RECORDS THIS AS A CORRECTION TO THE
            CONCEPT RATHER THAN AN INTERPRETATION OF IT. The source prototype's
            header pill computes to roughly 37px, which is under the tap floor
            on the primary device — a phone, held one-handed, at the top of the
            screen where the thumb reaches worst. The pill grows to 44px; the
            text does not shrink to fit a smaller pill. `size="sm"` is the one
            place `Button` is asked for that height instead of the 56px spec
            height — see the comment on `ButtonSize` in Button.tsx. */}
        {/* THE LABEL SHORTENS ON A PHONE, AND IT WAS ALREADY BROKEN BEFORE THE
            NAME ARRIVED. Measured before this change: the CTA's `scrollWidth`
            was 237px inside a 205px box at 320px, 257 inside 245 at 360px, and
            264 inside 260 at 375px — clipped at all three. `whitespace-nowrap`
            was added yesterday to stop the label wrapping to two lines, and it
            traded a visible wrap for an invisible truncation.

            The full label survives from `sm` up, where it fits. Below that the
            header CTA is a duplicate anyway: the hero's own "Pesan Lapangan"
            button sits directly beneath it in a viewport-tall plate, so the
            header copy only earns its place once a visitor has scrolled past
            that. "Pesan" beside the business name on a booking page is not
            ambiguous. */}
        <Button
          href="#order"
          lang="id"
          size="sm"
          variant={scrolled ? "primary" : "on-band"}
          className="shrink-0 px-4 sm:px-5"
        >
          <span className="sm:hidden">Pesan</span>
          <span className="hidden sm:inline">Pesan Lapangan</span>
        </Button>
      </div>
    </header>
  );
}
