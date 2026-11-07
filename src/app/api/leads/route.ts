import { api, clean, json, readJson } from "@/lib/http";
import { later, saveLead, sendDueReminders } from "@/lib/growth";
import { billingOf, EMAIL, isPlan, templateOf } from "@/lib/plans";

// The sign-up page saves what the visitor has typed on its last step (name, email, mobile number), so the
// Shopilier team can help people who stop before creating their account (master dashboard → Sign-up leads).
// Always answers the same way, so it never reveals whether an email already has an account.
export const POST = api(async (request, env, url) => {
  const body = await readJson(request);
  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return json({ ok: true });
  await saveLead(env, {
    email, name: clean(body.name, 80), business: clean(body.business, 80), phone: clean(body.phone, 30).replace(/[^\d+\-\s]/g, ""),
    plan: isPlan(body.plan) ? body.plan : "", billing: billingOf(body.billing), template: body.template ? templateOf(body.template) : "",
  });
  later(sendDueReminders(env, url.origin));
  return json({ ok: true });
}, { limit: true });
