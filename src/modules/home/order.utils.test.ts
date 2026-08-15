/**
 * What is left of the order-section utilities once the shared display helpers
 * moved to `src/utils/slot-display.ts`: the wa.me hand-off, which is home's
 * alone. Its tests live here for the same reason the function does — no other
 * surface links to WhatsApp.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";

import { formatPill, whatsappLink } from "./order.utils";

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

describe("formatPill — Indonesian, and zone-proof", () => {
  it("names the weekday correctly", () => {
    // 2026-08-11 is a Tuesday.
    expect(formatPill("2026-08-11")).toEqual({ day: "Sel", label: "11 Agu" });
  });

  it("uses Indonesian month abbreviations, including the ones that differ", () => {
    // Mei, Agu, Okt and Des are where a copied English list goes wrong.
    expect(formatPill("2026-05-01").label).toBe("1 Mei");
    expect(formatPill("2026-08-01").label).toBe("1 Agu");
    expect(formatPill("2026-10-01").label).toBe("1 Okt");
    expect(formatPill("2026-12-01").label).toBe("1 Des");
  });

  it("does not shift the date across a timezone boundary", () => {
    // The suite pins TZ=UTC, but this is the defect the parse-by-split exists
    // to prevent: new Date("2026-01-01") is UTC midnight, and rendering that
    // anywhere west of Greenwich yields 31 Dec. The label must be the calendar
    // date it was handed, always.
    expect(formatPill("2026-01-01").label).toBe("1 Jan");
    expect(formatPill("2026-12-31").label).toBe("31 Des");
  });

  it("covers every weekday across one week", () => {
    // 2026-08-09 is a Sunday.
    const days = ["2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12"].map(
      (d) => formatPill(d).day,
    );
    expect(days).toEqual(["Min", "Sen", "Sel", "Rab"]);
  });
});
