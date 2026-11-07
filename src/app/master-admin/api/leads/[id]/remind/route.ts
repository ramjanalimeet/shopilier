import { adminApi } from "@/lib/admin-api";
import { ensureGrowth, remindLead } from "@/lib/growth";
import { json } from "@/lib/http";

// "Send reminder" on an unfinished sign-up: sends the reminder email now, even when the automatic one is off
export const POST = (request: Request, ctx: { params: Promise<{ id: string }> }) => adminApi(async (_req, env, url) => {
  const { id } = await ctx.params;
  await ensureGrowth(env);
  const lead = await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<Parameters<typeof remindLead>[1]>();
  if (!lead) return json({ error: "Not found." }, 404);
  const r = await remindLead(env, lead, url.origin, true);
  if (r.status !== "sent") return json({ error: r.error || "The email wasn't sent." }, 400);
  return json({ ok: true, lead: await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first() });
})(request);
