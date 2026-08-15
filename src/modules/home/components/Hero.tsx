"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

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
 * PANCHANG IS WIDE, AND THE HEADLINE IS SIZED OUT OF THAT RATHER THAN AROUND
 * IT. `PILIH JAM.` measures 427.5px at 57.25px — wider than the entire 343px
 * content box at 375px — so whatever the three beats do, that line decides how
 * large they may be.
 *
 * This hero answered that with three escalating sizes, longest line smallest.
 * **The user chose a flat setting on 2026-08-13**: one size for all three,
 * derived from the longest line. The face's width still governs the scale; it
 * no longer governs the composition, which now rests on colour and rhythm
 * alone. The derivation is on the `h1` below.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const offerRef = useRef<HTMLParagraphElement>(null);

  // THE OFF-SCREEN-IS-OFF RULE, ENFORCED RATHER THAN ASSUMED. DESIGN.md
  // requires every continuously-running animation to stop when its section
  // leaves the viewport; the background grid added on 2026-08-14 is the second
  // one on this page, after the marquee. A CSS animation otherwise keeps
  // ticking while a visitor reads the Ketentuan five screens down, which is
  // exactly the CPU this page cannot spend on a mid-range Android in an in-app
  // webview.
  //
  // NOT ROUTED THROUGH `motion.ts`, AND THAT IS NOT AN EXCEPTION TO THE BAN.
  // The ban exists because GSAP ships no `prefers-reduced-motion` handling, so
  // a direct `gsap.to()` escapes the guarantee. There is no GSAP here — this
  // toggles one attribute, and the animation it gates is CSS, which the
  // reduced-motion block in `globals.css` already neutralises on its own.
  //
  // `IntersectionObserver` is guarded rather than assumed: it is universal on
  // the target devices, but a missing one must leave the animation RUNNING
  // rather than dead, so the attribute defaults to on in the markup below.
  useEffect(() => {
    const section = rootRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        section.dataset.heroInview = String(entry.isIntersecting);
      },
      // A zero threshold, so the grid stops the moment the plate's last pixel
      // leaves rather than when its centre does — the hero is taller than one
      // screen, and a midpoint threshold would keep it running through most of
      // the order section.
      { threshold: 0 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

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

        // THE OFFER PLATE ARRIVES AFTER THE COLUMN HAS SETTLED, and it is the
        // one element here deliberately NOT carrying `data-rise`. Sharing that
        // selector would mean sharing its ease, and the whole point is that this
        // one lands differently: `back.out` overshoots a few pixels and settles,
        // which is what makes the eye go back to it after the column is already
        // still. The delay clears the four staggered elements (0.18s of stagger
        // plus their 0.55s), so it reads as an arrival rather than a straggler.
        const offer = offerRef.current;
        if (offer) {
          gsap.from(offer, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: 0.28,
            ease: "back.out(1.6)",
          });

          // THE PULSE — the only continuously-running thing in this hero, and it
          // is scoped to the GLYPH, never the plate. A whole badge breathing
          // beside a flat painted sign reads as a rendering fault; one small
          // mark moving in one place reads as a signal.
          const glyph = offer.querySelector("[data-offer-glyph]");
          if (glyph) {
            const pulse = gsap.to(glyph, {
              scale: 1.09,
              duration: 1.1,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              transformOrigin: "50% 50%",
              paused: true,
            });

            // OFF-SCREEN-IS-OFF, satisfied with ScrollTrigger rather than a
            // fourth hand-rolled IntersectionObserver. The gain is not brevity:
            // a trigger created inside this context is REVERTED with it, so the
            // observer cannot outlive the component — which is exactly what a
            // hand-rolled one inside `animate` would do, since `animate` has no
            // cleanup channel of its own.
            ScrollTrigger.create({
              trigger: plate,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => {
                if (self.isActive) pulse.play();
                else pulse.pause();
              },
            });
          }
        }

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
      // Defaults to "true" so the grid runs even if the observer above never
      // attaches — a missing IntersectionObserver must cost a little CPU, not
      // a dead background.
      data-hero-inview="true"
      className="relative overflow-hidden border-b-[3px] border-[var(--color-interactive)] bg-[var(--color-band)]"
    >
      {/* THE MARK IS THE PLATE'S FACE — it replaces the ghost `24` on 2026-08-14,
          chosen by the user from two candidates in live mode. The rejected one kept
          the numeral's top-right slot and simply swapped a number for the brand;
          this one moves the visual mass, so the mark stops being an ornament in a
          corner and becomes the surface the type sits on. An enamel plate is
          stamped, and this is what stamped looks like.

          IT STILL CARRIES THE PARALLAX. `markRef` was on the `24`, which was the
          ScrollTrigger's target — dropping the numeral without moving the ref would
          have killed the one motion this plate already had, silently and with no
          error. The wrapper keeps it, so the drift is unchanged.

          `brightness(0) invert(1)` RATHER THAN A COLOUR TOKEN. The supplied mark is
          a dark navy lockup drawn for a light ground; on a navy plate it is navy on
          navy and effectively invisible. Inverting is honest because the mark is a
          single flat colour — there is no photographic content for a filter to
          distort — and it is the same argument the header already makes for the
          same file.

          9% INK, BAKED FROM THE ACCEPTED KNOB. It sits UNDER the reading rather
          than beside it, so it takes about a third of the ghost numeral's weight;
          the `contained` and `full` bleed alternatives are deleted rather than
          commented out.

          NOT `priority`, AND `sizes` IS NOT OPTIONAL. DESIGN.md fixes the LCP as
          the display headline — text is the cheapest and most reliable there is —
          and a raster at plate scale is a plausible LCP candidate in a way a text
          watermark never was. `sizes` declares the real painted width so the srcset
          resolver picks a candidate near it; leaving it off once cost this project
          81.7KB on a header mark the size of a fingernail. */}
      <span
        ref={markRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[-18%] z-0 w-[118%] -translate-y-[52%] opacity-[0.09] [filter:brightness(0)_invert(1)] select-none"
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={1042}
          height={502}
          sizes="(min-width: 1280px) 1000px, 95vw"
          className="h-auto w-full"
        />
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
              Lombok and the date layer pins Asia/Makassar.

              KNOWN DEFECT, LEFT ALONE DELIBERATELY: this line needs 388px and has
              297px (the 343px content box less the 34px rule and its 12px gap), so
              it wraps to two lines at 375px and 414px. It is recorded as open in
              DESIGN.md and PROGRESS.md. The headline round below deliberately did
              not touch it — the user's prompt named the headline, and refinement
              preserves what sits outside the ask. */}
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

        {/* TWO CURVES, NOT ONE, AND THE PHONE OWNS THE FIRST OF THEM. Chosen by
              the user 2026-08-14 from two candidates in live mode, against the
              brief "make the hero fonts a bit smaller, and also do on a responsive
              side (mobile first)". The rejected candidate dropped the single flat
              clamp uniformly from 88% to 80% box fill; this one splits the curve
              so the phone can be designed rather than derived from the desktop.

              THE SIZES ARE STILL DERIVED FROM ONE MEASUREMENT. "Pilih Jam." sets at
              **7.231x its font size** in Panchang at this tracking — measured with
              `Range.getBoundingClientRect` on the live node, consistent to three
              digits at 375px and 1280px, which is what distinguishes a real per-em
              constant from one width's coincidence. A target FILL of the content
              box therefore resolves to a size at every width:

                375px   box 343   ->  34px   (70% fill)
                600px   box 552   ->  53px   (70%)
                640px   box 589   ->  62px   (76%, the desktop curve takes over)
                768px   box 707   ->  74px   (76%)
               1280px   box 1184  -> 124px   (76%)
               1440px   box 1184  -> 128px   (the cap; the container stops growing)

              WHY THE PHONE FILLS LESS. Below 640px the headline shares one fold
              with an eyebrow, a sub-lede and two STACKED CTAs; above it, the plate
              is wide and the headline is effectively alone in it. One clamp cannot
              express that — a single curve has one slope, and the constraint
              changes shape at the breakpoint rather than scaling with the
              viewport. This is what "on the responsive side" asked for.

              THE 640px RULE CARRIES NO CONDITION, AND THE FIRST DRAFT'S DID. Both
              breakpoint branches were authored behind a live-mode parameter
              attribute, which the browser only stamps once the knob is MOVED — so
              at rest neither matched, the desktop curve never applied, and the
              headline sat at the phone clamp's 60px cap all the way to 1280px:
              60px where it specifies 124px. It failed silently, with no error and
              no mount failure. A default belongs in plain CSS; only an override
              belongs behind an attribute. */}
        <h1
          data-rise
          lang="id"
          className="mt-6 text-[color:var(--color-fg-on-band)] [font-size:clamp(29px,8.9vw,60px)] min-[640px]:[font-size:clamp(60px,9.7vw,128px)]"
        >
          <span className="block leading-[0.9]">Pilih Jam.</span>
          <span className="block leading-[0.9] text-[color:var(--color-interactive-on-band)]">
            Kirim.
          </span>
          <span className="block leading-[0.9]">Main.</span>
        </h1>

        <p
          data-rise
          lang="id"
          className="mt-7 max-w-[42ch] text-[color:var(--color-fg-muted-on-band)]"
        >
          Jadwal lapangan mini soccer di Lombok, tampil langsung. Pilih jam kosong, lanjut lewat
          WhatsApp.
        </p>

        {/* THE OFFER PLATE — a smaller enamel field riveted onto the big one.
            Everything about its shape is a rule rather than a preference:

            SQUARE, because `--radius-control` is 0 and the date pill is the only
            fully round shape on the page — its roundness is what says "this row
            scrolls", and a second pill would spend that signal.

            NOT AN EYEBROW. The system allows exactly one, above the h1, and
            `Mini Soccer · WITA · 06.00–24.00` already spent it. So this is body
            face at `--text-sm`, sentence case — never the small tracked
            uppercase that is the eyebrow's costume.

            NO STATUS TRIPLE. Amber and red were computed against white plates
            only and DESIGN.md forbids placing them on a navy ground, so the
            obvious "promo chip" in warning yellow is out of bounds here.

            THE HAIRLINE IS NOT DECORATION, IT IS THE FIX FOR A MEASUREMENT.
            navy-700 fill against the navy-900 plate computes 1.31:1 — the field
            was very nearly invisible as a field, which defeats the one thing
            this element exists to do. blue-400 measures 6.72:1 against the
            plate, well clear of the 3:1 non-text bar, and it is a FULL border
            rather than a left tab: the side-tab accent is banned twice in this
            project and was added and removed once already.

            Measured on this fill: blue-50 text 11.94:1, blue-400 hours 5.11:1. */}
        <p
          ref={offerRef}
          lang="id"
          className="mt-9 flex w-fit max-w-[38ch] items-start gap-3 border border-[var(--color-interactive-on-band)] bg-[var(--color-border-on-band)] px-4 py-3 text-[length:var(--text-sm)] text-[color:var(--color-fg-on-band)]"
        >
          {/* Feather's own camera, drawn inline rather than imported. The
              landing page has no `react-icons` import and PROGRESS.md records
              that as deliberate — "so the landing page's budget is untouched".
              Same 24px grid and 2px stroke as FiImage over on the form, so the
              two surfaces still read as one icon family. */}
          <svg
            data-offer-glyph
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-[2px] h-5 w-5 shrink-0 text-[color:var(--color-interactive-on-band)]"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>
            <strong className="font-semibold">Gratis fotografer</strong> di 1 jam pertama,{" "}
            <span className="font-semibold text-[color:var(--color-interactive-on-band)]">
              16.00–24.00
            </span>
          </span>
        </p>

        {/* mt-4, not the mt-9 this row used to carry. The offer and the CTA are
            one act-now cluster — that grouping is the whole argument for letting
            the offer borrow the interactive blue — so they sit tight to each
            other and the generous gap moves above the offer instead. */}
        <div data-rise className="mt-4 flex flex-col gap-3 min-[420px]:flex-row">
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

      {/* THE SKEWED FIELD — the hero's background, chosen by the user on
            2026-08-13 from three candidates in live mode. The other two were a
            drawn pitch (centre circle, halfway line, penalty box) and mown
            stripes on `--diag`; this one won.

            IT IS THE AXIS STATED ONCE AND LARGE. `--skew` already carries the
            button wipe, the section numerals and the rule numerals at component
            scale; here it runs at plate scale, which is the same idea rather
            than a fourth one. Nothing new tilts — the value is the system's own
            single skew token, and a second skew value anywhere would be a
            defect rather than a variation.

            THE FILLS ARE TRANSLUCENT ON PURPOSE, NOT FOR SUBTLETY. This layer
            sits at `z-0` and comes LATER in the DOM than the ghost `24` above,
            which is also `z-0` — so an opaque fill would paint the numeral out
            entirely. At 0.55 both read, and the plate gains the second board
            the parallax comment already describes.

            Tailwind utilities rather than a stylesheet rule: every other
            element in this file is styled the same way, and three declarations
            do not earn a named class in `globals.css`.

            `aria-hidden` and `pointer-events-none` — it is paint on the sign,
            not content, and it must never intercept a tap meant for the CTAs
            sitting above it. Clipped by the section's own `overflow-hidden`, so
            it cannot widen the page at any width. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <span className="absolute top-[-20%] right-[-14%] h-[150%] w-[76%] bg-[var(--color-border-on-band)] opacity-[0.55] [transform:skewX(var(--skew))]" />
        <span className="absolute top-[-20%] right-[24%] h-[150%] w-[3px] bg-[var(--color-interactive-on-band)] opacity-[0.34] [transform:skewX(var(--skew))]" />
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

      {/* THE PITCH DRIFTS — the hero's background motion, chosen by the user on
        2026-08-14 from two candidates in live mode against "add a three.js
        effect on this section as background".

        THE ENGINE IS NOT WHAT SHIPPED, AND THAT IS ARITHMETIC. architecture.md
        caps the hero's lazy WebGL chunk at 40KB gzip; three.js is ~150KB, 3.75x
        over, and the same document already recorded the answer the first time
        this was asked for — reach for the shader, not the engine. This goes one
        step further and costs ZERO: no canvas, no library, no rAF loop, two
        compositor-only transforms. The one WebGL permission is still UNSPENT,
        and `HeroCanvas.tsx` is still in the repo if a later round wants it.

        IT IS THE SUBJECT, NOT AN ABSTRACTION OF IT. Hard flat strokes rather
        than a colour ramp, because the direction refuses gradient haze on this
        plate — the WebGL field that used to live here was removed on 2026-08-13
        for exactly that reason. This is the markings of the field itself, seen
        from a camera easing toward them.

        ONE ELEMENT, AND THE RING IS ITS `::before`. Three sibling spans arrived
        in the live preview as one: the mount keeps only a container's FIRST
        child. Measured rather than assumed — the server HTML carried zero and
        the DOM carried one. A pseudo-element cannot be dropped that way, and it
        costs one node instead of two. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <span className="hero-pitch" />
      </div>
    </section>
  );
}
