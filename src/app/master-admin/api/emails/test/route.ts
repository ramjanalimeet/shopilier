import { adminApi } from "@/lib/admin-api";
import { SAMPLE, sendEmail, type Kind } from "@/lib/growth";
import { clean, json, readJson } from "@/lib/http";
import { EMAIL } from "@/lib/plans";

// "Send a test": one automatic email with sample details, to the address typed in the dashboard
export const POST = adminApi(async (request, env, url) => {
  const body = await readJson(request);
  const kind = String(body.kind) as Kind;
  const to = clean(body.to, 254).toLowerCase();
  if (!["welcome", "signin", "password", "reminder"].includes(kind)) return json({ error: "Unknown email." }, 400);
  if (!EMAIL.test(to)) return json({ error: "Enter a valid email to send the test to." }, 400);
  const r = await sendEmail(env, kind, to, { ...SAMPLE, email: to }, { force: true, origin: url.origin });
  if (r.status !== "sent") return json({ error: r.error || "The email wasn't sent." }, 400);
  return json({ ok: true });
});
