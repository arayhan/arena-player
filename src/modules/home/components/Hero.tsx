"use client";

import { useRef } from "react";

import { useMotion } from "@/lib/motion";

import { Button } from "./Button";
import { Marquee } from "./Marquee";

/**
 * THE HERO — "PELAT ENAMEL", the direction the 2026-08-13 roll landed on.
 *
 * THESIS: this opens like the enamel plate bolted to the field gate, not like a
 * booking product. Flat saturated fields that own the whole viewport, hard
 * edges, hours set at plate scale. What it refuses is the arrangement this
 * category always ships — a rounded card floating on a soft gradient over a
 * stadium photograph.
 *
 * NO 100vh CAP. The user removed that rule on 2026-08-13 as limiting, so the
 * plate takes the height its content needs: `min-h-[100svh]`, never a fixed
 * height. It opens above the fold on a 375px phone because the type scale was
 * measured at that width rather than chosen on a desktop and shrunk afterwards.
 *
 * PANCHANG IS WIDE, AND THE COMPOSITION IS BUILT OUT OF THAT RATHER THAN AROUND
 * IT. `PILIH JAM.` measures 427.5px at 57.25px — wider than the entire 343px
 * content box at 375px. The previous hero set all three beats at ONE size, so
 * the longest line decided the scale for the other two, which is exactly how a
 * 427px line ends up in a 343px box. Here the three beats take THREE sizes, and
 * they run the other way: the longest string is the smallest, the shortest is
 * the largest. The face's width became the composition.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);

  // PARALLAX, ADDED 2026-08-13 AT THE USER'S REQUEST — and on a flat enamel
  // plate it has to be argued for rather than sprinkled on. A painted sign has
  // no depth, so the depth here comes from LAYERS OF SIGN: the oversized ghost
  // numeral behind the headline drifts slower than the plate scrolls, the way a
  // second board seen past a fence lags the fence in front of it. Nothing tilts,
  // nothing scales, nothing blurs — those would be the 3D illusion this world
  // does not have.
  //
  // Routed through `motion.ts` because a direct `gsap.to()` is banned in this
  // repo: GSAP ships no reduced-motion handling of its own, and a continuous
  // scroll-linked transform is precisely what has to stop dead for a visitor
  // who asked for less motion.
  useMotion(
    {
      animate: ({ gsap, ScrollTrigger }) => {
        const mark = markRef.current;
        const plate = plateRef.current;
        if (!mark || !plate) return;

        gsap.to(mark, {
          // A share of the plate's own height, resolved as a function so it is
          // recomputed on refresh rather than baked at build time. A fixed
          // pixel drift is invisible on a 1440px screen and absurd on a phone.
          y: () => plate.offsetHeight * 0.18,
          ease: "none",
          scrollTrigger: {
            trigger: plate,
            start: "top top",
            end: "bottom top",
            // `scrub`, not a duration: the numeral's position is a function of
            // scroll offset and has to track the finger exactly. A timed tween
            // desynchronises the moment someone flicks instead of dragging.
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // REVEAL ON ENTER, the behaviour the user chose on 2026-08-12. One
        // orchestrated rise for the whole column rather than scattered
        // per-element effects: the plate is a single object arriving, and a
        // stagger of six independent fades would read as six decisions.
        gsap.from(plate.querySelectorAll("[data-rise]"), {
          y: 18,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.06,
        });

        ScrollTrigger.refresh();
      },
      // The resting state IS the finished state. Nothing here starts hidden in
      // the markup, so a failed GSAP fetch or a reduced-motion preference
      // leaves a complete, readable hero rather than an empty navy plate.
      settle: () => {},
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b-[3px] border-[var(--color-interactive)] bg-[var(--color-band)]"
    >
      {/* THE GHOST NUMERAL — the parallax layer, `aria-hidden` decoration
          rather than content. `24` is the only number on this plate that is not
          a bookable time: it is the hours the field spans, 06.00 to 24.00. Sized
          in `vw` so it stays the largest thing in the composition at every
          width, and clipped by the section's own `overflow-hidden` so it can
          never widen the page. */}
      <span
        ref={markRef}
        aria-hidden="true"
        className="type-display pointer-events-none absolute -top-[6vw] -right-[3vw] z-0 leading-[0.7] font-extrabold text-[color:var(--color-border-on-band)] opacity-70 select-none [font-size:clamp(190px,44vw,580px)]"
      >
        24
      </span>

      {/* THE WEBGL FIELD IS GONE FROM THIS HERO, AND THAT IS THE DIRECTION
          TALKING RATHER THAN THE BUDGET. "Pelat enamel" is defined by flat
          saturated fields and zero gradients; a generative gradient behind the
          plate is the one thing the world explicitly refuses. Rendered at 35%
          over navy it also produced visible rectangular banding — it read as
          compression artefacts on the sign, not as paint on metal.

          architecture.md PERMITS one WebGL moment; it never required one. The
          file stays in the repo untouched, so restoring it is an import and a
          div if a later direction wants it. */}

      <div
        ref={plateRef}
        // `100svh` MINUS THE BAND, not `100svh` flat. The stripe is a signature
        // element of this plate, and measured at 1440x900 a plain `100svh`
        // column put its top edge at exactly y=900 — one pixel past the fold,
        // so the first viewport ended on empty navy and the band was something
        // you had to scroll to discover. Subtracting its height lands it inside
        // the opening screen, which is where a painted stripe on a sign is.
        className="relative z-10 mx-auto flex min-h-[calc(100svh-52px)] w-full max-w-[var(--container-max)] flex-col justify-end px-[var(--space-section-x)] pt-32 pb-0"
      >
        {/* THE ONE EYEBROW IN THE SYSTEM, and on this plate it reads as the
            maker's mark stamped along the top edge: what the venue is, which
            clock it runs on, when it opens. WITA, never WIB — the field is in
            Lombok and the date layer pins Asia/Makassar. */}
        <p
          data-rise
          lang="id"
          className="type-display flex items-center gap-3 text-[length:var(--text-eyebrow)] font-medium tracking-[0.22em] text-[color:var(--color-interactive-on-band)] uppercase"
        >
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-[34px] shrink-0 bg-[var(--color-interactive-on-band)]"
          />
          Mini Soccer · WITA · 06.00–24.00
        </p>

        {/* THREE BEATS AT THREE SIZES — the answer to Panchang's width, and the
            one structural idea in this hero.

            `KIRIM.` takes the accent colour rather than an outline. On a navy
            plate an outlined word reads as a hollow punched through the sign,
            and this direction is made of filled fields; the colour change does
            the same job without contradicting the world. */}
        <h1 data-rise lang="id" className="mt-6 text-[color:var(--color-fg-on-band)]">
          <span className="block leading-[0.9] [font-size:clamp(38px,10vw,104px)]">Pilih Jam.</span>
          <span className="block leading-[0.9] text-[color:var(--color-interactive-on-band)] [font-size:clamp(46px,12.4vw,128px)]">
            Kirim.
          </span>
          <span className="block leading-[0.9] [font-size:clamp(54px,14.6vw,152px)]">Main.</span>
        </h1>

        <p
          data-rise
          lang="id"
          className="mt-7 max-w-[42ch] text-[color:var(--color-fg-muted-on-band)]"
        >
          Jadwal Arena Player tampil langsung. Pilih jam kosong, lanjut lewat WhatsApp.
        </p>

        <div data-rise className="mt-9 flex flex-col gap-3 min-[420px]:flex-row">
          <Button
            href="#order"
            variant="on-band"
            lang="id"
            icon={<span aria-hidden="true">→</span>}
          >
            Pesan Lapangan
          </Button>
          <Button href="#lokasi" variant="secondary-on-band" lang="id">
            Lihat Lokasi
          </Button>
        </div>

        <div className="h-16" />
      </div>

      {/* THE BAND SITS FLAT ON THE PLATE'S BOTTOM EDGE, EDGE TO EDGE.

          Flat because the user ruled out the skew on 2026-08-13, and on an
          enamel plate that is the right answer anyway: a painted stripe on a
          metal sign runs parallel to the sign's own edge.

          OUTSIDE the container rather than inside it with a negative margin.
          The negative-margin version only reached the container's padding, so
          on a 1440px screen the stripe stopped dead at the 1280px maximum with
          navy either side — a painted band that does not touch both edges of
          its sign reads as a mistake, not as a margin. */}
      <div className="relative z-10">
        <Marquee />
      </div>
    </section>
  );
}
