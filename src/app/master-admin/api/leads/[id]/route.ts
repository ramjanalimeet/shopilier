import { adminApi } from "@/lib/admin-api";
import { ensureGrowth } from "@/lib/growth";
import { clean, json, readJson } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };
const STATUSES = ["waiting", "contacted", "converted"];

// Change an unfinished sign-up's status or note
export const PATCH = (request: Request, ctx: Ctx) => adminApi(async (req, env) => {
  const { id } = await ctx.params;
  await ensureGrowth(env);
  const body = await readJson(req);
  const row = await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<{ status: string; note: string }>();
  if (!row) return json({ error: "Not found." }, 404);
  const status = STATUSES.includes(String(body.status)) ? String(body.status) : row.status;
  const note = "note" in body ? clean(body.note, 1000) : row.note;
  await env.DB.prepare("UPDATE leads SET status = ?, note = ? WHERE id = ?").bind(status, note, id).run();
  return json({ lead: await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first() });
})(request);

export const DELETE = (request: Request, ctx: Ctx) => adminApi(async (_req, env) => {
  const { id } = await ctx.params;
  await ensureGrowth(env);
  await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
  return json({ ok: true });
})(request);
