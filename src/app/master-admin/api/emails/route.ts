import { adminApi } from "@/lib/admin-api";
import { emailReady, ensureGrowth, getEmailSettings, saveEmailSettings } from "@/lib/growth";
import { json, readJson } from "@/lib/http";

// Email automation: the settings, whether sending is connected, and the latest emails sent
const view = async (env: CloudflareEnv) => {
  await ensureGrowth(env);
  const settings = await getEmailSettings(env);
  const { results } = await env.DB.prepare("SELECT * FROM email_log ORDER BY created_at DESC LIMIT 100").all();
  return { settings, connected: { key: !!env.RESEND_API_KEY, ready: emailReady(env, settings) }, log: results };
};
export const GET = adminApi(async (_request, env) => json(await view(env)));
export const PUT = adminApi(async (request, env) => {
  await saveEmailSettings(env, await readJson(request));
  return json(await view(env));
});
