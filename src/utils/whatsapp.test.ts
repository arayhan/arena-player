import { describe, expect, it } from "vitest";

import { bookingSubmissionWhatsappLink, slotWhatsappLink, WHATSAPP_NUMBER } from "./whatsapp";

describe("whatsapp utils", () => {
  it("exports the verified client admin WhatsApp number", () => {
    // THE DEVELOPMENT NUMBER, 2026-08-16. The client's own is 6289682620666 and
    // this assertion is the second place the swap has to be undone before
    // handover — deliberately, so a revert that misses one is a failing test
    // rather than a booking sent to the wrong phone.
    expect(WHATSAPP_NUMBER).toBe("62895410347567");
  });

  describe("slotWhatsappLink", () => {
    it("builds the wa.me deep link with single slot and formatted Indonesian date", () => {
      const url = slotWhatsappLink(WHATSAPP_NUMBER, "2026-08-16", "20.00 - 21.00");
      expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
      const decoded = decodeURIComponent(url.split("?text=")[1]);
      expect(decoded).toBe(
        "Halo, saya mau booking lapangan Arena Player tanggal 16 Agu 2026 jam 20.00 - 21.00",
      );
    });
  });

  describe("bookingSubmissionWhatsappLink", () => {
    it("builds the submission message with multiselected slots, name, date, and notes", () => {
      const url = bookingSubmissionWhatsappLink({
        date: "2026-08-16",
        slots: ["18.00 - 19.00", "19.00 - 20.00"],
        teamName: "FC Garuda",
        notes: "Tolong siapkan rompi hijau",
      });

      expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
      const decoded = decodeURIComponent(url.split("?text=")[1]);

      expect(decoded).toContain("• Nama: FC Garuda");
      expect(decoded).toContain("• Tanggal: 16 Agu 2026");
      expect(decoded).toContain("• Jam: 18.00 - 19.00, 19.00 - 20.00");
      expect(decoded).toContain("• Catatan: Tolong siapkan rompi hijau");
      expect(decoded).toContain("Mohon konfirmasinya. Terima kasih!");
    });

    it("omits the Catatan bullet point when notes is empty or undefined", () => {
      const url = bookingSubmissionWhatsappLink({
        date: "2026-08-16",
        slots: ["07.00 - 08.00"],
        teamName: "Budi",
      });

      const decoded = decodeURIComponent(url.split("?text=")[1]);
      expect(decoded).toContain("• Nama: Budi");
      expect(decoded).toContain("• Tanggal: 16 Agu 2026");
      expect(decoded).toContain("• Jam: 07.00 - 08.00");
      expect(decoded).not.toContain("Catatan");
    });
  });
});
