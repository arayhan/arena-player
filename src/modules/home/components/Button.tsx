import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "on-band" | "secondary-on-band";

/**
 * `lg` (56px) is DESIGN.md's Buttons spec, used by the hero and closing CTAs.
 * `sm` (44px) exists ONLY because the header CTA is DESIGN.md's own stated
 * correction to the source prototype's ~37px pill — 44px is the tap-floor,
 * not the component's spec height, so the header keeps its own size while
 * every other button on the page uses the real one. Both sizes share the
 * same `rounded.control` radius and the same label typography; only height
 * and horizontal padding change.
 */
export type ButtonSize = "sm" | "lg";

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * The trailing glyph (the hero's `→`). A SEPARATE element from `children`
   * on purpose: Hero.tsx's scramble-on-hover tween targets the label text
   * only, and a scramble sweeping through the arrow would substitute it with
   * a random glyph mid-tween. Rendered above the wipe, never inside it.
   */
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

type AnchorProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

type NativeButtonProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children" | "disabled" | "type" | "href"
  > & {
    href?: undefined;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

const HEIGHT: Record<ButtonSize, string> = {
  sm: "h-11", // 44px
  lg: "h-14", // 56px
};

/**
 * Horizontal padding, split by fill kind rather than by variant name: a
 * bordered button's 2px border eats into its own box, so `secondary`'s
 * padding is 4px narrower than a filled button's at the same size — the
 * original hand-rolled `Hero.tsx` already tuned this (34px filled / 30px
 * bordered) so text lines up flush across button kinds sitting side by side.
 */
const PADDING_X: Record<ButtonSize, { filled: string; outlined: string }> = {
  sm: { filled: "px-5", outlined: "px-[18px]" },
  lg: { filled: "px-[34px]", outlined: "px-[30px]" },
};

interface VariantStyle {
  root: string;
  /** `null` means no travelling wipe — see the comment on VARIANT below. */
  wipe: string | null;
  hoverText: string;
  kind: "filled" | "outlined";
}

/**
 * `secondary` gets no `wipe` entry, and that is a reading of DESIGN.md's own
 * wording rather than an omission: primary and on-band "wipe", secondary
 * "fills [...] and inverts the text" — a plain colour transition, not the
 * travelling pseudo-element.
 */
const VARIANT: Record<ButtonVariant, VariantStyle> = {
  primary: {
    root: "bg-[var(--color-accent-strong)] text-[var(--color-fg-inverse)]",
    wipe: "bg-[var(--color-accent-strong-hover)]",
    hoverText: "",
    kind: "filled",
  },
  "on-band": {
    // The on-dark primary fill DESIGN.md's Closing CTA section names
    // directly: "a navy-900 button on a navy-900 band is invisible."
    root: "bg-[var(--color-interactive)] text-[var(--color-fg-inverse)]",
    wipe: "bg-[var(--color-fg-inverse)]",
    hoverText: "group-hover:text-[var(--color-fg)]",
    kind: "filled",
  },
  secondary: {
    root: "border-2 border-[var(--color-accent-strong)] bg-transparent text-[var(--color-accent-strong)] transition-colors duration-300 hover:bg-[var(--color-accent-strong)] hover:text-[var(--color-fg-inverse)]",
    wipe: null,
    hoverText: "",
    kind: "outlined",
  },
  // ADDED 2026-08-13, and it is a real gap rather than a nicety. `secondary`
  // draws a navy-900 border and navy-900 text — on a navy-900 band that is an
  // invisible button, the exact defect the on-band row of the semantic layer
  // exists to prevent, and the hero is now a navy plate with two CTAs on it.
  // It inverts the same way `secondary` does, in the band's own foreground.
  "secondary-on-band": {
    root: "border-2 border-[var(--color-fg-on-band)] bg-transparent text-[var(--color-fg-on-band)] transition-colors duration-300 hover:bg-[var(--color-fg-on-band)] hover:text-[var(--color-fg)]",
    wipe: null,
    hoverText: "",
    kind: "outlined",
  },
};

/**
 * The shared button — DESIGN.md's Buttons section, all three variants.
 *
 * `<a>` when given `href`, `<button>` otherwise. A booking site's every real
 * call to action is a navigation (an anchor jump or a link to `/booking`),
 * so the anchor path is the common one rather than an edge case.
 *
 * NEVER native `disabled` — `aria-disabled` only, DESIGN.md's
 * Never-Native-Disabled Rule. Native `disabled` drops a control from the tab
 * order entirely, so a keyboard user tabbing past it gets no explanation of
 * why. The press itself is refused in the caller's own handler; this
 * component only carries the visual and the attribute.
 */
export function Button({
  variant = "primary",
  size = "lg",
  icon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isAnchor = typeof rest.href === "string";
  const style = VARIANT[variant];

  const classes = cn(
    // `overflow-hidden` IS LOAD-BEARING, NOT DECORATION. The wipe below is a
    // translated pseudo-element, and translating it past its own box without
    // this clips nowhere — it reintroduces horizontal page scroll, the exact
    // defect this component exists not to repeat. `isolate` keeps the wipe's
    // z-index scoped to this button rather than fighting page-level stacking.
    // `whitespace-nowrap` is a correctness rule, not a style preference. A
    // button whose label wraps to two lines stops reading as a control: the
    // fixed height then either clips the second line or the pill grows and
    // breaks the row it sits in. Caught at 375px, where the header's
    // "PESAN LAPANGAN" broke across two lines and crowded the mark beside it.
    "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap",
    // SQUARE, AND WEIGHT 500 — both chosen by the user 2026-08-13, and both
    // are the button catching up with the redesign rather than a new idea.
    //
    // THE RADIUS: an inventory of every computed `border-radius` on the page
    // found exactly four non-zero values — this button at 12px, the date pills
    // at 9999px, the map placeholder at 22px, and the map pin's teardrop.
    // Slot cells, panels, the order plate and the Ketentuan rows are all 0px.
    // The redesign squared the world and the button was the survivor. The pill
    // keeps its radius because a pill IS its shape; the map placeholder's 22px
    // is a known outlier still owed a fix.
    //
    // Primary stays FILLED and secondary stays OUTLINED. Square corners are a
    // shape decision; fill is the hierarchy, and the hero carries two CTAs
    // where "Pesan Lapangan" has to win — the product is measured on filling
    // empty slots, not on visual symmetry.
    //
    // THE WEIGHT: Panchang is already a wide face. At 800, uppercase, and
    // 0.06em tracking, three separate emphases stacked on a 15px label and it
    // read as a block rather than as type. 500 is the lightest weight this
    // project loads, so it costs no additional font file.
    "rounded-[var(--radius-control)] type-display text-[length:var(--text-label)] font-medium tracking-[0.06em] uppercase",
    "transition-transform duration-300",
    HEIGHT[size],
    PADDING_X[size][style.kind],
    style.root,
    !disabled && "hover:-translate-y-[3px]",
    disabled &&
      "pointer-events-none border-0 bg-[var(--color-disabled-bg)] text-[var(--color-fg-muted)]",
    className,
  );

  const content = (
    <>
      {style.wipe && (
        // THE WIPE. Sits under the label (z-0 against the label's z-10), so
        // the text never moves relative to its own box — only the fill
        // beneath it travels. `-101%` rather than `-100%`: at exactly -100% a
        // sub-pixel rounding difference can leave a hairline of the wipe
        // colour visible at rest on some zoom levels. `var(--skew)`, never a
        // hard-coded angle — DESIGN.md records this line as `skewX(-12deg)`
        // until 2026-08-12, contradicting the One-Axis Rule four hundred
        // lines above it in the same document.
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 z-0 transition-transform duration-[350ms]",
            "[transform:translateX(-101%)_skewX(var(--skew))]",
            "group-hover:[transform:translateX(0)_skewX(var(--skew))]",
            style.wipe,
          )}
        />
      )}
      <span className={cn("relative z-10 transition-colors duration-[350ms]", style.hoverText)}>
        {children}
      </span>
      {icon && (
        <span
          aria-hidden="true"
          className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-[5px]"
        >
          {icon}
        </span>
      )}
    </>
  );

  if (isAnchor) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a href={href} aria-disabled={disabled} className={classes} {...anchorRest}>
        {content}
      </a>
    );
  }

  const buttonRest = rest as Omit<NativeButtonProps, "href">;
  return (
    <button type="button" aria-disabled={disabled} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
