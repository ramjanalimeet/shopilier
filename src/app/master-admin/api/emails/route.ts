import { adminApi } from "@/lib/admin-api";
import { emailsView } from "@/lib/emails-view";
import { saveEmailSettings } from "@/lib/growth";
import { json, readJson } from "@/lib/http";

export const GET = adminApi(async (_request, env) => json(await emailsView(env)));
export const PUT = adminApi(async (request, env) => {
  await saveEmailSettings(env, await readJson(request));
  return json(await emailsView(env));
});
