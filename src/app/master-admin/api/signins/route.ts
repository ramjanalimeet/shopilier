import { adminApi } from "@/lib/admin-api";
import { ensureGrowth } from "@/lib/growth";
import { json } from "@/lib/http";

// Sign-in activity: the latest sign-ins and new accounts, with each person's business name
export const GET = adminApi(async (_request, env) => {
  await ensureGrowth(env);
  const { results } = await env.DB.prepare(
    "SELECT signins.*, users.name AS name, users.business AS business FROM signins LEFT JOIN users ON users.id = signins.user_id ORDER BY signins.created_at DESC LIMIT 300"
  ).all();
  return json({ signins: results });
});
