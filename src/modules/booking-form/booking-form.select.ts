"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The listbox behaviour both schedule fields share.
 *
 * WRITTEN RATHER THAN INSTALLED, and the arithmetic is the reason. react-select
 * v5 brings `@emotion` with it — roughly 35-45KB gzip on a route that already
 * spends 126.5 on the framework, 63.2 on zod and 17.5 on axios against a 240KB
 * ceiling — and it would style itself through emotion objects while every other
 * surface here is Tailwind v4 tokens. The interaction is the ask; the package is
 * not. This is the whole of what the package would have been used for.
 *
 * FOCUS NEVER LEAVES THE TRIGGER. The active option is tracked by index and
 * announced through `aria-activedescendant`, which is what makes a multi-select
 * survivable: moving DOM focus into the list means every toggle either closes
 * the list or fights the browser for where focus should land next.
 *
 * DISABLED OPTIONS STAY IN THE ARROW ORDER. A visitor arrowing through the day
 * must be able to reach 20.00 and hear "Terisi" — an hour that is missing from
 * the keyboard order is an hour they will assume nobody has taken. `onCommit`
 * refuses it instead, which is the same trade `SlotCell` makes with
 * `aria-disabled` on the landing page.
 */
export function useListbox({
  count,
  onCommit,
}: {
  count: number;
  onCommit: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // DISMISSAL LIVES IN ONE EFFECT AND ONLY SUBSCRIBES. It attaches two document
  // listeners while the list is open and removes them when it closes; the state
  // changes happen inside those handlers, in response to a real event, never
  // synchronously in the effect body. That distinction is what React's
  // `set-state-in-effect` rule is about, and this session has already been
  // caught by it once.
  //
  // `pointerdown`, not `click`: a click fires after the button it started on has
  // possibly moved, and a mousedown that starts inside the list and drags out
  // must not count as an outside dismissal.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (count === 0) return;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          event.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          const step = event.key === "ArrowDown" ? 1 : -1;
          // Wraps, because a nine-row list is short enough that walking off
          // either end and stopping feels like the control jammed.
          setActive((i) => (i + step + count) % count);
          return;
        }
        case "Home":
          if (open) {
            event.preventDefault();
            setActive(0);
          }
          return;
        case "End":
          if (open) {
            event.preventDefault();
            setActive(count - 1);
          }
          return;
        case "Enter":
        case " ":
          event.preventDefault();
          if (!open) setOpen(true);
          else onCommit(active);
          return;
        case "Tab":
          // Tab moves on rather than being trapped, and the list closes behind
          // it. Nothing is lost: every toggle already committed.
          if (open) setOpen(false);
          return;
        default:
          return;
      }
    },
    [active, count, onCommit, open],
  );

  return { open, setOpen, active, setActive, close, rootRef, triggerRef, onTriggerKeyDown };
}
