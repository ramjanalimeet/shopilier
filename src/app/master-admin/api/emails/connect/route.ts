import { adminApi } from "@/lib/admin-api";
import { checkResendKey, saveResendKey } from "@/lib/growth";
import { clean, json, readJson } from "@/lib/http";
import { emailsView } from "@/lib/emails-view";

// Connect: checks a pasted Resend API key with Resend, then keeps it (in D1, never sent back to the browser).
// Disconnect (DELETE) forgets it. A key set as the RESEND_API_KEY secret is used instead whenever it exists.
export const POST = adminApi(async (request, env) => {
  const key = clean((await readJson(request)).key, 200);
  if (!/^re_[A-Za-z0-9_-]{8,}$/.test(key)) return json({ error: "That doesn't look like a Resend API key. It starts with re_ — copy it from Resend → API Keys." }, 400);
  const check = await checkResendKey(key);
  if (!check.ok) return json({ error: check.error }, 400);
  await saveResendKey(env, key);
  return json(await emailsView(env));
});
export const DELETE = adminApi(async (_request, env) => {
  await saveResendKey(env, null);
  return json(await emailsView(env));
});
