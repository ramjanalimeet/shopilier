// Images uploaded in the website editor, served from /media/<id>. The image itself goes to the R2 bucket (binding
// MEDIA) and D1 keeps a row with its owner, type and size (data is empty). Images uploaded before R2 still have their
// bytes in D1's data column and keep working; without the binding new uploads go to D1 as before.
export const MEDIA_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif" };
export const MAX_IMAGE_BYTES = 1_500_000;
export const MAX_IMAGES_PER_USER = 300;
export const MEDIA_ID = /^[a-f0-9]{32}$/;
// Photos uploaded in the master dashboard's template builder: "t" + 32 hex characters, in their own table
export const TEMPLATE_MEDIA_ID = /^t[a-f0-9]{32}$/;
let templateMediaReady = false;
export async function ensureTemplateMedia(env: CloudflareEnv) {
  if (templateMediaReady) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS template_media (id TEXT PRIMARY KEY, type TEXT NOT NULL, data BLOB NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)").run();
  templateMediaReady = true;
}

// The media table is created on first use, so no manual database step is needed
let mediaReady = false;
export async function ensureMedia(env: CloudflareEnv) {
  if (mediaReady) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, type TEXT NOT NULL, data BLOB NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS media_user ON media(user_id)"),
  ]);
  mediaReady = true;
}

/** Where an image lives in R2: user photos under media/<user id>/, template photos under template/. */
export const mediaKey = (id: string, userId?: string) => (userId ? `media/${userId}/${id}` : `template/${id}`);

/** Stores an image's bytes: in R2 when the bucket is bound (D1 then keeps an empty data column), else in D1. */
export async function putImage(env: CloudflareEnv, key: string, data: ArrayBuffer, type: string) {
  if (!env.MEDIA) return data;
  await env.MEDIA.put(key, data, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
  return new ArrayBuffer(0);
}

/** Deletes every photo a user uploaded from R2 (their D1 rows are deleted with the account). */
export async function deleteUserImages(env: CloudflareEnv, userId: string) {
  if (!env.MEDIA) return;
  let cursor: string | undefined;
  do {
    const list = await env.MEDIA.list({ prefix: `media/${userId}/`, cursor });
    if (list.objects.length) await env.MEDIA.delete(list.objects.map((o) => o.key));
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);
}
