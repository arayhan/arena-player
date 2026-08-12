"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { useMotion } from "@/lib/motion";

// ssr:false and no loading state — the static fallback IS the loading state,
// and it is already painted. Removing the WebGL moment is deleting this import,
// the <HeroCanvas /> below, and one file. That deletability is a condition of
// the permission, not a nicety.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/**
 * The hero — DESIGN.md's "velocity" redesign, 2026-08-12.
 *
 * THE LCP ELEMENT IS THE HEADLINE — text, server-rendered, in a self-hosted
 * font with no layout shift. Not the canvas, which is client-only and arrives
 * later; not an image, because the hero-video gate failed and there is no
 * photograph of this field that anyone has supplied. Nothing added by the
 * redesign may compete for that slot, which is why the eyebrow, the outlined
 * word and both CTAs below are all plain server-rendered text with no
 * entrance animation gating their first paint — an animation that starts an
 * element at `opacity: 0` in its initial markup would delay exactly the
 * element this file exists to protect.
 *
 * Capped at `100svh`, never `100vh`: in-app browsers report `vh` incorrectly
 * and a hero sized in `vh` overshoots on exactly the device this site is
 * designed for.
 *
 * THE ONE EYEBROW IN THE WHOLE SYSTEM lives here, above the `h1`, per
 * DESIGN.md's One-Eyebrow Rule. It carries three facts the headline cannot:
 * what the venue is, which clock the page runs on, and when it is open. It
 * reads WITA, never `Asia/Jakarta` or `WIB` — the field is in Lombok and the
 * date layer pins `Asia/Makassar`.
 */
export function Hero() {
  const ctaRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrambling, setScrambling] = useState(false);

  // The client asked for "scramble effect ketika hover". GSAP's ScrambleText
  // is a paid Club plugin and is not installed, so the scramble is hand-driven
  // by a tween on a proxy object — free GSAP, no extra kilobytes, and it still
  // routes through motion.ts so reduced-motion is honoured.
  //
  // ctaRef targets the LABEL SPAN, not the whole anchor: the arrow glyph
  // beside it is a separate element so scrambling the label never touches it.
  useMotion(
    {
      animate: ({ gsap }) => {
        const el = ctaRef.current;
        if (!el || !scrambling) return;
        const target = el.dataset.label ?? "";
        const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const proxy = { progress: 0 };

        gsap.to(proxy, {
          progress: 1,
          duration: 0.45,
          ease: "power2.out",
          onUpdate: () => {
            const settled = Math.floor(proxy.progress * target.length);
            el.textContent = target
              .split("")
              .map((ch, i) =>
                i < settled || ch === " " ? ch : glyphs[Math.floor(Math.random() * glyphs.length)],
              )
              .join("");
          },
          // The label MUST end exactly right. A scramble that leaves one wrong
          // character on the primary call to action is worse than no effect,
          // and rounding in onUpdate cannot be trusted to land on the last
          // index.
          onComplete: () => {
            el.textContent = target;
          },
        });
      },
      settle: () => {
        const el = ctaRef.current;
        if (el) el.textContent = el.dataset.label ?? "";
      },
    },
    { scope: rootRef, deps: [scrambling] },
  );

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-[var(--color-border)]">
      {/* The static fallback. Painted first, stays if WebGL never arrives or
          is refused, and is what a reduced-motion or save-data visitor keeps.
          A fallback that depends on the thing it is a fallback for is not one.
          The gradient axis is --diag, the same one the map placeholder uses. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(var(--diag),var(--color-blue-50)_0%,var(--color-white)_45%,var(--color-blue-100)_100%)]"
      />
      <HeroCanvas />

      <div ref={rootRef} className="relative mx-auto w-full max-w-[1100px] px-4">
        {/* THE SOLID MARK THAT STOOD HERE IS GONE, AND THE HEADER IS WHY.
            It was correct while the page had no header: the brand had to appear
            somewhere above the fold. Now `SiteHeader` carries it, fixed, ~100px
            higher — and the two rendered stacked, which reads as a duplication
            bug rather than as emphasis. Caught in a 375px screenshot, not in
            code review.

            DESIGN.md's Hero stacking order asks for the mark here in one form
            only: "the client mark at 7% opacity with a slow scroll parallax",
            `aria-hidden`, decoration rather than identification. That is a
            motion piece and is deliberately not built yet — it needs the
            user's choice on parallax distance first, and DESIGN.md leaves the
            speed unspecified. So the hero shows no mark at all this turn,
            which is honest: the brand still appears above the fold, once, in
            the header. */}

        {/* THE ONE EYEBROW. Two parts: an `aria-hidden` 34×2px rule skewed on
            the system's one axis, and the fact itself, which is real content
            and stays in reading order. Fixed size and tracking, never fluid —
            at 0.22em a fluid size would change the line's own length at every
            viewport, and it has to hold one line at 375px. */}
        <p
          lang="id"
          className="mt-8 flex items-center gap-3 type-display text-[length:var(--text-eyebrow)] font-semibold tracking-[0.22em] text-[var(--color-interactive)] uppercase"
        >
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-[34px] shrink-0 bg-[var(--color-interactive)] [transform:skewX(var(--skew))]"
          />
          Mini Soccer · WITA · 06.00–24.00
        </p>

        {/* Three lines, one beat each — `Pilih Jam.` / `Kirim.` / `Main.` The
            global h1 rule already sets 48→152px uppercase Orbitron at 0.95
            leading; this only breaks it into its three sentences and outlines
            the middle one. No `max-w` constraint: each line is a short phrase
            in its own block box already, so nothing here depends on wrapping. */}
        <h1 lang="id" className="mt-4">
          <span className="block">Pilih Jam.</span>
          {/* THE OUTLINED WORD — DESIGN.md's Outline-Needs-A-Floor Rule, all
              three conditions:
                1. No-stroke fallback: the base state (no `@supports` match)
                   is the word filled solid in the accent colour, never
                   invisible.
                2. `forced-colors`: Windows High Contrast Mode does not honour
                   a text stroke, so the transparency is dropped and the word
                   fills with the system's own `CanvasText`, `!important` so
                   it always wins over the `@supports` branch.
                3. Floor: the stroke is 2px, and this line is never smaller
                   than the 48px display floor — nowhere near the 24px
                   minimum the rule sets. */}
          <span
            className={cn(
              "block text-[color:var(--color-interactive)]",
              "supports-[-webkit-text-stroke:1px_currentColor]:text-[color:transparent]",
              "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:2px_var(--color-interactive)]",
              "forced-colors:!text-[color:CanvasText] forced-colors:[-webkit-text-stroke:0px]",
            )}
          >
            Kirim.
          </span>
          <span className="block">Main.</span>
        </h1>

        <p
          lang="id"
          className="mt-6 max-w-[46ch] text-[color:var(--color-fg-muted)] md:text-[length:var(--text-h3)]"
        >
          Jadwal Arena Player tampil langsung. Pilih jam kosong, lanjut lewat WhatsApp.
        </p>

        {/* Two CTAs, side by side above ~420px and stacked below it — a phone
            narrow enough for two 56px-tall full-width buttons to collide
            otherwise. Filled primary, outlined secondary — the same
            accent-strong / accent-strong-hover pair every other button on the
            page reads from the semantic tier. */}
        <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center">
          <a
            href="#order"
            lang="id"
            onMouseEnter={() => setScrambling(true)}
            onMouseLeave={() => setScrambling(false)}
            className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent-strong)] px-[34px] type-display text-[length:var(--text-label)] font-extrabold tracking-[0.06em] text-[var(--color-fg-inverse)] uppercase transition-colors min-[420px]:w-auto hover:bg-[var(--color-accent-strong-hover)]"
          >
            <span ref={ctaRef} data-label="Pesan Lapangan">
              Pesan Lapangan
            </span>
            {/* The arrow is its own element, deliberately outside the scramble
                target — a scramble tween would otherwise substitute it with a
                random glyph mid-tween. It advances 5px on hover, a plain CSS
                transform that the page-wide reduced-motion rule in
                globals.css already neutralises without any JS of its own. */}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:translate-x-[5px]"
            >
              →
            </span>
          </a>

          <a
            href="#lokasi"
            lang="id"
            className="inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-control)] border-2 border-[var(--color-accent-strong)] px-[30px] type-display text-[length:var(--text-label)] font-extrabold tracking-[0.06em] text-[var(--color-accent-strong)] uppercase transition-colors min-[420px]:w-auto hover:bg-[var(--color-accent-strong)] hover:text-[var(--color-fg-inverse)]"
          >
            Lihat Lokasi
          </a>
        </div>
      </div>
    </section>
  );
}
