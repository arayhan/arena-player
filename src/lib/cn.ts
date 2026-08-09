import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names conditionally, then resolve Tailwind conflicts so the last
 * one wins. `clsx` handles the conditionals; `twMerge` is what makes
 * `cn("p-2", "p-4")` collapse to `p-4` instead of emitting both and leaving
 * the winner to CSS source order.
 *
 * Only reach for this where a caller can override — a component taking a
 * `className` prop. A static class list is a plain string and needs neither.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
