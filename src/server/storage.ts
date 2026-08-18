import "server-only";

/**
 * Uploads a payment proof image to Supabase Storage.
 * Returns the object key (e.g. `2026-08-20/uuid.jpg`).
 */
export async function uploadProof(file: File, date: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${date}/${crypto.randomUUID()}.${ext}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_PROOFS_BUCKET || "arena-player-proofs";

  if (!supabaseUrl || !anonKey) {
    return key;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${key}`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: arrayBuffer,
    });

    if (!res.ok) {
      console.warn("Storage upload response not ok:", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    console.error("Storage upload error:", error);
  }

  return key;
}
