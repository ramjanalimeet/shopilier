import { getEnv } from "@/lib/cf";
import { ensureMedia, ensureTemplateMedia, MEDIA_ID, MEDIA_TYPES, mediaKey, TEMPLATE_MEDIA_ID } from "@/lib/media";

// Serves an image uploaded in the website editor (or in the master dashboard's template builder)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tpl = TEMPLATE_MEDIA_ID.test(id);
  if (!MEDIA_ID.test(id) && !tpl) return new Response("Not found", { status: 404 });
  // D1 returns a BLOB as an array of byte values (an ArrayBuffer in some runtimes)
  let row: { type: string; data: ArrayBuffer | number[] | null; user_id?: string } | null = null;
  let body: BodyInit | null = null;
  try {
    const env = await getEnv();
    if (tpl) await ensureTemplateMedia(env); else await ensureMedia(env);
    row = await env.DB.prepare(`SELECT type, data${tpl ? "" : ", user_id"} FROM ${tpl ? "template_media" : "media"} WHERE id = ?`).bind(id).first<{ type: string; data: ArrayBuffer | number[] | null; user_id?: string }>();
    // New images keep their bytes in R2 (D1's data is empty); older ones still have them in D1
    const bytes = row?.data ? new Uint8Array(row.data) : null;
    if (row && bytes && bytes.byteLength) body = bytes;
    else if (row && env.MEDIA) body = (await env.MEDIA.get(mediaKey(id, row.user_id)))?.body ?? null;
  } catch (err) { console.error(err); }
  if (!row || !body || !MEDIA_TYPES[row.type]) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: { "Content-Type": row.type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
