"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";

import { useMotion } from "@/lib/motion";

// ssr:false and no loading state — the static fallback IS the loading state,
// and it is already painted. Removing the WebGL moment is deleting this import,
// the <HeroCanvas /> below, and one file. That deletability is a condition of
// the permission, not a nicety.
const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

/**
 * The hero.
 *
 * THE LCP ELEMENT IS THE HEADLINE — text, server-rendered, in a self-hosted
 * font with no layout shift. Not the canvas, which is client-only and arrives
 * later; not an image, because the hero-video gate failed and there is no
 * photograph of this field that anyone has supplied.
 *
 * Capped at `100svh`, never `100vh`: in-app browsers report `vh` incorrectly
 * and a hero sized in `vh` overshoots on exactly the device this site is
 * designed for.
 */
export function Hero() {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrambling, setScrambling] = useState(false);

  // The client asked for "scramble effect ketika hover". GSAP's ScrambleText
  // is a paid Club plugin and is not installed, so the scramble is hand-driven
  // by a tween on a proxy object — free GSAP, no extra kilobytes, and it still
  // routes through motion.ts so reduced-motion is honoured.
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
          A fallback that depends on the thing it is a fallback for is not one. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-blue-50)_0%,var(--color-white)_45%,var(--color-blue-50)_100%)]"
      />
      <HeroCanvas />

      <div ref={rootRef} className="relative mx-auto w-full max-w-[1100px] px-4">
        {/* The real mark, supplied by the client 2026-08-11 — the AP monogram
            placeholder that stood here is gone.

            NOT `priority`, and that is deliberate. The LCP element is the
            headline below: text, server-rendered, in a self-hosted font. A
            preloaded 1042×502 logo would compete for that slot and could take
            it, which would trade the cheapest, most reliable LCP there is for
            an image. Explicit width and height keep it off the CLS budget
            regardless. */}
        <Image
          src="/logo-mark.png"
          alt="Arena Player"
          width={1042}
          height={502}
          className="h-10 w-auto md:h-12"
        />

        <h1 className="mt-8 max-w-[14ch]">Pilih Jam. Kirim. Main.</h1>

        <p
          lang="id"
          className="mt-6 max-w-[46ch] text-[color:var(--color-fg-muted)] md:text-[length:var(--text-h3)]"
        >
          Jadwal Arena Player tampil langsung. Pilih jam kosong, lanjut lewat WhatsApp.
        </p>

        <a
          ref={ctaRef}
          href="#order"
          lang="id"
          data-label="Pesan Lapangan"
          onMouseEnter={() => setScrambling(true)}
          onMouseLeave={() => setScrambling(false)}
          className="mt-10 inline-flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-accent-strong-hover)]"
        >
          Pesan Lapangan
        </a>
      </div>
    </section>
  );
}
