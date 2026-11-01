// Live websites: a store's published website at /s/<sub-domain>, and the orders its checkout sends.
// Orders from the website wait in their own table until the owner's dashboard picks them up, checks prices,
// stock and discount codes, and adds them to the store (the dashboard saves the whole store at once, so the
// server never edits the store's data itself and nothing the dashboard saves can overwrite a new order).

type StoreData = {
  settings?: { subdomain?: string };
  site?: unknown; pages?: unknown[]; products?: unknown[]; discounts?: { code?: string }[]; orders?: { status?: string; discount?: { code?: string } | null }[];
  marketing?: unknown; published?: boolean; liveVersion?: string; backups?: { id?: string; kind?: string; data?: { site?: unknown; pages?: unknown[] } }[];
};

export const cleanSub = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 63);

/** The store whose free sub-domain is `sub` (the most recently saved one, if two ever share it). */
export async function storeBySub(env: CloudflareEnv, sub: string) {
  const row = await env.DB.prepare("SELECT user_id, data FROM stores WHERE json_extract(data, '$.settings.subdomain') = ? ORDER BY updated_at DESC LIMIT 1")
    .bind(cleanSub(sub)).first<{ user_id: string; data: string }>();
  if (!row) return null;
  try { return { userId: row.user_id, store: JSON.parse(row.data) as StoreData }; } catch { return null; }
}

/** What visitors see: the version that was last published (not unpublished edits). */
export function liveWebsite(store: StoreData) {
  if (!store.published) return null;
  const backups = store.backups || [];
  const live = backups.find((b) => b.id === store.liveVersion) || backups.find((b) => b.kind === "publish");
  const site = live?.data?.site || store.site, pages = live?.data?.pages || store.pages;
  return site && Array.isArray(pages) && pages.length ? { site, pages } : null;
}

/** Discount codes with how many times each was used, the way the website checks them. */
export const siteDiscounts = (store: StoreData) => (store.discounts || []).map((d) => ({
  ...d, used: (store.orders || []).filter((o) => o.status !== "Cancelled" && o.discount && o.discount.code === d.code).length,
}));

const ensureTable = (env: CloudflareEnv) => env.DB.prepare(
  "CREATE TABLE IF NOT EXISTS web_orders (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL)",
).run();

export async function addWebOrder(env: CloudflareEnv, userId: string, order: unknown) {
  await ensureTable(env);
  const id = "w_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  await env.DB.prepare("INSERT INTO web_orders (id, user_id, data, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, userId, JSON.stringify(order), new Date().toISOString()).run();
  return id;
}

export async function pendingWebOrders(env: CloudflareEnv, userId: string) {
  await ensureTable(env);
  const { results } = await env.DB.prepare("SELECT id, data, created_at FROM web_orders WHERE user_id = ? ORDER BY created_at LIMIT 50")
    .bind(userId).all<{ id: string; data: string; created_at: string }>();
  return (results || []).map((r) => { let order = {}; try { order = JSON.parse(r.data); } catch { /* skip */ } return { id: r.id, order, at: r.created_at }; });
}

export async function clearWebOrders(env: CloudflareEnv, userId: string, ids: string[]) {
  if (!ids.length) return;
  await ensureTable(env);
  await env.DB.batch(ids.slice(0, 50).map((id) => env.DB.prepare("DELETE FROM web_orders WHERE id = ? AND user_id = ?").bind(id, userId)));
}
