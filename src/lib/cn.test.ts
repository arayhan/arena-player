import { describe, it, expect } from "vitest";
// Imported through the alias on purpose. A colocated test would normally use
// "./cn"; this one proves vitest.config.ts resolves "@/" to ./src exactly as
// tsconfig.json does. If those two drift, every other test in this repo starts
// asserting against a different file from the one the app ships.
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("resolves conflicting Tailwind utilities so the last one wins", () => {
    // This is the whole reason tailwind-merge is here and costs 8.0KB. Plain
    // clsx would emit "p-2 p-4" and leave the winner to CSS source order.
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("keeps utilities that do not conflict", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("drops falsy conditionals", () => {
    expect(cn("flex", false && "hidden", undefined, null, "gap-2")).toBe("flex gap-2");
  });

  it("lets a caller override a component's own class", () => {
    // The case that justifies cn() existing at all: a component ships w-auto,
    // the caller passes w-full, and the caller must win.
    const componentClass = "inline-flex w-auto rounded-md";
    expect(cn(componentClass, "w-full")).toBe("inline-flex rounded-md w-full");
  });

  it("accepts arrays and objects, the clsx surface", () => {
    expect(cn(["flex", "gap-2"], { hidden: false, "rounded-md": true })).toBe(
      "flex gap-2 rounded-md",
    );
  });

  it("treats display utilities as one conflict group", () => {
    // Found by this test failing on its first run against a wrong assumption.
    // flex and block are both `display`, so the later one wins rather than both
    // surviving — worth pinning, because it is the non-obvious half of what
    // tailwind-merge does and the half a hand-rolled cn() would get wrong.
    expect(cn("flex", "block")).toBe("block");
  });
});
