import "server-only";

import { FIELD_ADDRESS, MAP_EMBED_SRC, WHATSAPP_NUMBER } from "@/modules/home/home.constants";
import sql from "@/server/db";

export interface SiteSettings {
  whatsapp_number: string;
  address: string;
  operating_hours: string;
  maps_embed_url: string;
  dp_percent: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp_number: WHATSAPP_NUMBER,
  address: FIELD_ADDRESS,
  operating_hours: "06.00–24.00 WITA",
  maps_embed_url: MAP_EMBED_SRC,
  dp_percent: "50",
};

/**
 * Reads live site configuration from `site_settings` table in Supabase Postgres.
 * If the table or database is unavailable, falls back to default settings safely.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const settings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

  try {
    const rows = await sql<{ key: string; value: string }[]>`
      select key, value from site_settings
    `;

    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (row.key === "whatsapp_number" && row.value?.trim()) {
          settings.whatsapp_number = row.value.trim();
        } else if (row.key === "address" && row.value?.trim()) {
          settings.address = row.value.trim();
        } else if (row.key === "operating_hours" && row.value?.trim()) {
          settings.operating_hours = row.value.trim();
        } else if (row.key === "maps_embed_url" && row.value?.trim()) {
          settings.maps_embed_url = row.value.trim();
        } else if (row.key === "dp_percent" && row.value?.trim()) {
          settings.dp_percent = row.value.trim();
        }
      }
    }

    return settings;
  } catch (error) {
    console.error("[site-settings] Failed to fetch site_settings from DB:", error);
    return settings;
  }
}
