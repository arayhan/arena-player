import { getSiteSettings } from "@/server/site-settings";

export const dynamic = "force-dynamic";

/**
 * `GET /api/site-settings`
 *
 * Reads site settings (address, WhatsApp number, operational hours, maps embed URL, DP percentage)
 * live from database managed in the admin dashboard.
 */
export async function GET(): Promise<Response> {
  const settings = await getSiteSettings();
  return Response.json(settings, {
    headers: {
      "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}
