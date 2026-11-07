import { adminApi } from "@/lib/admin-api";
import { ensureGrowth, later, sendDueReminders } from "@/lib/growth";
import { json } from "@/lib/http";

// Unfinished sign-ups for the master dashboard, newest activity first. Opening the page also sends any reminders
// that are due (when the automatic reminder is on).
export const GET = adminApi(async (_request, env, url) => {
  await ensureGrowth(env);
  const { results } = await env.DB.prepare("SELECT * FROM leads ORDER BY updated_at DESC LIMIT 500").all();
  later(sendDueReminders(env, url.origin));
  return json({ leads: results });
});
