import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

// TODO(content): hero copy — the Indonesian title and meta description are
// decided in Phase 1b task 2 alongside the type scale, because a three-word
// headline and a twelve-word one need different sizes. Do not invent them.
export const metadata: Metadata = {
  title: "Arena Player",
  description: "Booking lapangan mini soccer Arena Player.",
};

// lang is "id": every string a visitor reads on this site is Indonesian.
// Leaving it "en" makes a screen reader pronounce Indonesian copy with English
// phonemes, which is the same defect the DESIGN.html critique already flagged.
//
// No web font is loaded yet, deliberately. DESIGN.md names Orbitron and Inter,
// but the art direction that confirms them is Phase 1b task 1 — wiring faces
// here would mean choosing twice.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      {/*
        This layout stays a SERVER component. Providers is the client boundary
        and holds nothing but the QueryClient and the dev mock gate, so the
        boundary sits as far down as it can while still wrapping every route.
      */}
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
