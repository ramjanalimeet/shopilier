import { publicAccount, withSession } from "@/lib/auth";
import { b64, hashPassword, randomBytes } from "@/lib/crypto";
import { api, clean, json, readJson } from "@/lib/http";
import { billingOf, CATEGORY, DEFAULT_PLAN, EMAIL, isPlan, templateOf } from "@/lib/plans";
import { getSettings } from "@/lib/platform";
import { recordSignin, saveLead } from "@/lib/growth";

export const POST = api(async (request, env, url) => {
  // Sign-ups can be paused from the master dashboard (Settings)
  if (!(await getSettings(env)).signups) return json({ error: "New sign-ups are paused for now. Please try again later." }, 403);
  const body = await readJson(request);
  const name = clean(body.name, 80);
  const email = clean(body.email, 254).toLowerCase();
  const password = String(body.password || "");
  if (!name) return json({ error: "Please enter your name." }, 400);
  if (!EMAIL.test(email)) return json({ error: "Please enter a valid email." }, 400);
  if (password.length < 8 || password.length > 200) return json({ error: "Password must be at least 8 characters." }, 400);

  const exists = await env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
  if (exists) return json({ error: "An account with this email already exists. Please sign in." }, 409);

  // The mobile number (optional) is kept with their sign-up in the master dashboard (users have no phone column)
  const phone = clean(body.phone, 30).replace(/[^\d+\-\s]/g, "");
  if (phone) await saveLead(env, { email, name, business: clean(body.business, 80), phone, plan: isPlan(body.plan) ? body.plan : "", billing: billingOf(body.billing), template: templateOf(body.template) });
  const salt = randomBytes(16);
  const user = {
    id: crypto.randomUUID(),
    email,
    name,
    business: clean(body.business, 80) || name + "'s Store",
    category: CATEGORY,
    plan: isPlan(body.plan) ? body.plan : DEFAULT_PLAN,
    billing: billingOf(body.billing),
    template: templateOf(body.template),
    created_at: new Date().toISOString(),
  };
  try {
    await env.DB.prepare(
      "INSERT INTO users (id, email, name, business, password_hash, password_salt, category, plan, billing, template, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(user.id, user.email, user.name, user.business, await hashPassword(password, salt), b64(salt), user.category, user.plan, user.billing, user.template, user.created_at).run();
  } catch (err) {
    // Lost a race with another sign-up for the same email
    if (String(err).includes("UNIQUE")) return json({ error: "An account with this email already exists. Please sign in." }, 409);
    throw err;
  }
  // Their unfinished sign-up becomes "Signed up", the welcome email goes out (both after the response)
  recordSignin(env, request, user, "signup", url.origin);
  return withSession(env, user.id, body.remember !== false, json({ account: publicAccount({ ...user, password_hash: "set" }) }, 201), request);
}, { limit: true });
