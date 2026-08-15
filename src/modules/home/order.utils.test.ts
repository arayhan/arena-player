/**
 * What is left of the order-section utilities once the shared display helpers
 * moved to `src/utils/slot-display.ts`: the wa.me hand-off, which is home's
 * alone. Its tests live here for the same reason the function does — no other
 * surface links to WhatsApp.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";

import { whatsappLink } from "./order.utils";

describe("whatsappLink — the one destination", () => {
  const NUMBER = "6289682620666";

  it("builds the wa.me deep link with the number in wa.me form", () => {
    const url = whatsappLink(NUMBER, "2026-08-11", "20.00 - 22.00");
    expect(url.startsWith(`https://wa.me/${NUMBER}?text=`)).toBe(true);
    // No plus, no spaces, no punctuation — the shape wa.me and the WhatsApp
    // Business API both expect, and the shape domain/phone.ts normalises to.
    expect(url).not.toContain("+");
  });

  it("prefills the message the PRD specifies, with the Indonesian date", () => {
    const url = whatsappLink(NUMBER, "2026-08-11", "20.00 - 22.00");
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(
      "Halo, saya mau booking lapangan Arena Player tanggal 11 Agu 2026 jam 20.00 - 22.00",
    );
  });

  it("percent-encodes the message", () => {
    // The slot contains spaces and the message contains commas; an unencoded
    // href would truncate at the first space in some clients.
    const url = whatsappLink(NUMBER, "2026-08-11", "20.00 - 22.00");
    expect(url).not.toMatch(/\s/);
    expect(url).toContain("%20");
  });

  it("carries the exact slot string, not a reformatted one", () => {
    // uniq_active_slot compares time_slot as TEXT. A slot that arrives at the
    // admin reading "20.00-22.00" is a different slot to the database than
    // "20.00 - 22.00", so the separator survives the round trip verbatim.
    for (const slot of TIME_SLOTS) {
      const decoded = decodeURIComponent(
        whatsappLink(NUMBER, "2026-08-11", slot).split("?text=")[1],
      );
      expect(decoded.endsWith(`jam ${slot}`)).toBe(true);
    }
  });
});
