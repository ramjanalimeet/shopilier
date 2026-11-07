// User interaction, for the master dashboard: unfinished sign-ups (people who typed their contact details on the
// sign-up page but didn't create the account), sign-in activity, and the automatic emails (welcome, new sign-in,
// password changed, and a reminder to finish signing up). The tables are created on first use, like the others.
// Emails go out through Resend (https://resend.com) once the RESEND_API_KEY secret is set; without it nothing is
// sent and each email shows in the log as "Not sent", so the rest keeps working.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { clean, EMAIL } from "./platform-clean";

declare global {
  interface CloudflareEnv {
    RESEND_API_KEY?: string;
  }
}

// ---------- Tables ----------
let ready = false;
export const ensureGrowth = async (env: CloudflareEnv) => {
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', business TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '', plan TEXT NOT NULL DEFAULT '', billing TEXT NOT NULL DEFAULT '', template TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'waiting',
      note TEXT NOT NULL DEFAULT '', reminded_at TEXT, user_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS leads_updated ON leads(updated_at)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS signins (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, email TEXT NOT NULL, method TEXT NOT NULL, device TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS signins_created ON signins(created_at)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_log (id TEXT PRIMARY KEY, to_email TEXT NOT NULL, kind TEXT NOT NULL, subject TEXT NOT NULL, status TEXT NOT NULL,
      error TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS email_log_created ON email_log(created_at)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS platform (key TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)"),
  ]);
  ready = true;
};

/** Runs work after the response is sent (emails, logging), so visitors never wait for it. */
export const later = (work: Promise<unknown>) => {
  const safe = work.catch((err) => console.error("Background work failed", err));
  try { getCloudflareContext().ctx.waitUntil(safe); } catch { /* not on Cloudflare: it just runs */ }
};

// ---------- Who and where ----------
/** "Chrome on Windows" from the browser's User-Agent. */
export const deviceOf = (request: Request) => {
  const ua = request.headers.get("User-Agent") || "";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "A browser";
  const os = /iPhone|iPad|iPod/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "Mac"
    : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
};
const COUNTRIES: Record<string, string> = { BD: "Bangladesh", IN: "India", US: "United States", GB: "United Kingdom", AE: "United Arab Emirates", SA: "Saudi Arabia", MY: "Malaysia", SG: "Singapore", CA: "Canada", AU: "Australia" };
export const countryOf = (request: Request) => {
  const code = (request.headers.get("CF-IPCountry") || "").toUpperCase();
  return !code || code === "XX" || code === "T1" ? "" : COUNTRIES[code] || code;
};

// ---------- Email settings (master dashboard → Email automation) ----------
export type Kind = "welcome" | "signin" | "password" | "reminder";
export type Auto = { on: boolean; subject: string; body: string };
export type EmailSettings = { fromName: string; fromEmail: string; replyTo: string; welcome: Auto; signin: Auto; password: Auto; reminder: Auto & { hours: number } };

export const EMAIL_DEFAULTS: EmailSettings = {
  fromName: "Shopilier", fromEmail: "", replyTo: "",
  welcome: {
    on: true, subject: "Welcome to Shopilier, {name}!",
    body: "Hi {name},\n\nThank you for joining Shopilier. Your store {business} is ready on the {plan} plan.\n\nOpen your dashboard to add your first products and publish your website. If you get stuck, just reply to this email and we'll help.",
  },
  signin: {
    on: true, subject: "New sign-in to your Shopilier account",
    body: "Hi {name},\n\nYour Shopilier account ({email}) was just signed in to.\n\nWhen: {time}\nDevice: {device}\nWhere: {location}\n\nIf this was you, there's nothing to do. If it wasn't, change your password right away from your dashboard (Settings → Password).",
  },
  password: {
    on: true, subject: "Your Shopilier password was changed",
    body: "Hi {name},\n\nThe password for your Shopilier account ({email}) was changed on {time} from {device}.\n\nIf you didn't do this, reply to this email straight away and we'll secure your account.",
  },
  reminder: {
    on: false, hours: 24, subject: "Your Shopilier store is almost ready, {name}",
    body: "Hi {name},\n\nYou started creating your online store on Shopilier but didn't finish. It only takes a minute, and everything is free until online payments are switched on.\n\nPick up where you left off with the button below. Questions? Just reply to this email.",
  },
};

const auto = (raw: unknown, d: Auto): Auto => {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return { on: typeof r.on === "boolean" ? r.on : d.on, subject: clean(r.subject ?? d.subject, 150) || d.subject, body: clean(r.body ?? d.body, 3000) || d.body };
};
export const sanitizeEmails = (raw: unknown, base: EmailSettings = EMAIL_DEFAULTS): EmailSettings => {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const mail = (v: unknown, d: string) => { const s = clean(v ?? d, 254).toLowerCase(); return s === "" || EMAIL.test(s) ? s : d; };
  const hours = Number(b.reminder?.hours ?? base.reminder.hours);
  return {
    fromName: clean(b.fromName ?? base.fromName, 60).replace(/[<>"]/g, "") || "Shopilier",
    fromEmail: mail(b.fromEmail, base.fromEmail), replyTo: mail(b.replyTo, base.replyTo),
    welcome: auto(b.welcome, base.welcome), signin: auto(b.signin, base.signin), password: auto(b.password, base.password),
    reminder: { ...auto(b.reminder, base.reminder), hours: [1, 3, 6, 12, 24, 48, 72].includes(hours) ? hours : 24 },
  };
};
export async function getEmailSettings(env: CloudflareEnv): Promise<EmailSettings> {
  await ensureGrowth(env);
  const row = await env.DB.prepare("SELECT data FROM platform WHERE key = 'emails'").first<{ data: string }>();
  if (!row) return EMAIL_DEFAULTS;
  try { return sanitizeEmails(JSON.parse(row.data)); } catch { return EMAIL_DEFAULTS; }
}
export async function saveEmailSettings(env: CloudflareEnv, input: unknown) {
  const next = sanitizeEmails(input, await getEmailSettings(env));
  await env.DB.prepare("INSERT INTO platform (key, data, updated_at) VALUES ('emails', ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
    .bind(JSON.stringify(next), new Date().toISOString()).run();
  return next;
}
/** Ready to send: a Resend key and a sender address on a domain verified in Resend. */
export const emailReady = (env: CloudflareEnv, s: EmailSettings) => !!env.RESEND_API_KEY && !!s.fromEmail;

// ---------- Sending ----------
const escHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

// A simple, light email in the Shopilier green: the text as paragraphs, then an optional button
const layout = (body: string, button?: { label: string; url: string }) => `<!doctype html><html><body style="margin:0;background:#f4faef;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4faef;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e3eedb">
<tr><td style="padding:26px 28px 6px"><span style="display:inline-block;width:30px;height:30px;border-radius:8px;background:#41a212;color:#fff;font-weight:800;font-size:18px;line-height:30px;text-align:center">S</span>
<b style="font-size:19px;vertical-align:middle;margin-left:8px;color:#0b0d12">Shopilier</b></td></tr>
<tr><td style="padding:12px 28px 4px;font-size:15px;line-height:1.65">${body.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${escHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}</td></tr>
${button ? `<tr><td style="padding:4px 28px 26px"><a href="${escHtml(button.url)}" style="display:inline-block;background:#41a212;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px">${escHtml(button.label)}</a></td></tr>` : ""}
</table><p style="font-size:12px;color:#6b7280;margin:16px 0 0">Shopilier · Made in Bangladesh</p></td></tr></table></body></html>`;

const BUTTONS: Record<Kind, string> = { welcome: "Open my dashboard", signin: "Open my dashboard", password: "Open my dashboard", reminder: "Finish creating my store" };

/** Sends one automatic email (when that automation is on) and logs it. Returns how it went. */
export async function sendEmail(env: CloudflareEnv, kind: Kind, to: string, vars: Record<string, string>, opts: { force?: boolean; origin?: string } = {}) {
  const s = await getEmailSettings(env);
  const a = s[kind];
  if (!a.on && !opts.force) return { status: "off" as const };
  const origin = opts.origin || "https://shopilier.com";
  const all = { name: "there", business: "your store", plan: "Starter", email: to, time: "", device: "", location: "", ...vars };
  const subject = fill(a.subject, all), text = fill(a.body, all);
  const url = origin + (kind === "reminder" ? "/signup" : "/admin");
  let status: "sent" | "failed" | "skipped" = "skipped", error = "";
  if (!emailReady(env, s)) error = !env.RESEND_API_KEY ? "Email isn't connected yet (no Resend key)." : "Add the sender email in Email automation.";
  else {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${s.fromName} <${s.fromEmail}>`, to: [to], subject, ...(s.replyTo ? { reply_to: s.replyTo } : {}),
          html: layout(text, { label: BUTTONS[kind], url }), text: `${text}\n\n${BUTTONS[kind]}: ${url}`,
        }),
      });
      if (res.ok) status = "sent";
      else { status = "failed"; error = clean(((await res.json().catch(() => ({}))) as { message?: string }).message || `Resend answered ${res.status}`, 300); }
    } catch (err) { status = "failed"; error = clean(String(err), 300); }
  }
  await env.DB.prepare("INSERT INTO email_log (id, to_email, kind, subject, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), to, kind, clean(subject, 200), status, error, new Date().toISOString()).run();
  return { status, error };
}

const when = () => new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) + " (Bangladesh time)";
const PLAN_NAMES: Record<string, string> = { starter: "Starter", business: "Business", pro: "Pro" };
export const planName = (p: string) => PLAN_NAMES[p] || "Starter";

type Who = { id: string; email: string; name: string; business: string; plan: string };

/** A sign-in (or a new account): logged for Sign-in activity, and the account owner gets the matching email. */
export function recordSignin(env: CloudflareEnv, request: Request, user: Who, method: "password" | "google" | "signup" | "google-signup", origin: string) {
  later((async () => {
    await ensureGrowth(env);
    const device = deviceOf(request), location = countryOf(request) || "Unknown";
    await env.DB.prepare("INSERT INTO signins (id, user_id, email, method, device, country, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user.id, user.email, method, device, location === "Unknown" ? "" : location, new Date().toISOString()).run();
    const vars = { name: user.name, business: user.business, plan: planName(user.plan), time: when(), device, location };
    if (method === "signup" || method === "google-signup") {
      // They finished: their unfinished sign-up (if any) becomes "Signed up"
      await env.DB.prepare("UPDATE leads SET status = 'converted', user_id = ?, updated_at = ? WHERE email = ?").bind(user.id, new Date().toISOString(), user.email).run();
      await sendEmail(env, "welcome", user.email, vars, { origin });
    } else await sendEmail(env, "signin", user.email, vars, { origin });
    await sendDueReminders(env, origin);
  })());
}

/** The password was changed: the owner gets an alert. */
export function passwordChanged(env: CloudflareEnv, request: Request, user: Who, origin: string) {
  later(sendEmail(env, "password", user.email, { name: user.name, business: user.business, plan: planName(user.plan), time: when(), device: deviceOf(request), location: countryOf(request) || "Unknown" }, { origin }));
}

// ---------- Unfinished sign-ups ----------
export type Lead = { email: string; name: string; business: string; phone: string; plan: string; billing: string; template: string };

/** Saves (or updates) what someone typed on the sign-up page. Accounts that already exist are left alone. */
export async function saveLead(env: CloudflareEnv, lead: Lead) {
  await ensureGrowth(env);
  const user = await env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(lead.email).first();
  if (user) return;
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO leads (id, email, name, business, phone, plan, billing, template, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?, ?)
    ON CONFLICT(email) DO UPDATE SET name = CASE WHEN excluded.name <> '' THEN excluded.name ELSE leads.name END,
      business = CASE WHEN excluded.business <> '' THEN excluded.business ELSE leads.business END,
      phone = CASE WHEN excluded.phone <> '' THEN excluded.phone ELSE leads.phone END,
      plan = excluded.plan, billing = excluded.billing, template = excluded.template, updated_at = excluded.updated_at
    WHERE leads.status <> 'converted'`)
    .bind(crypto.randomUUID(), lead.email, lead.name, lead.business, lead.phone, lead.plan, lead.billing, lead.template, now, now).run();
}

type LeadRow = { id: string; email: string; name: string; business: string; plan: string; reminded_at: string | null; status: string; updated_at: string };

/** Sends the reminder to one unfinished sign-up and notes when. */
export async function remindLead(env: CloudflareEnv, lead: LeadRow, origin: string, force = false) {
  const r = await sendEmail(env, "reminder", lead.email, { name: lead.name || "there", business: lead.business || "your store", plan: planName(lead.plan) }, { origin, force });
  if (r.status === "sent") await env.DB.prepare("UPDATE leads SET reminded_at = ? WHERE id = ?").bind(new Date().toISOString(), lead.id).run();
  return r;
}

/** The automatic reminder: unfinished sign-ups older than the chosen wait that haven't had one yet (a few at a time).
 *  Runs after sign-ups, sign-ins and new unfinished sign-ups, and whenever the master dashboard opens that page. */
export async function sendDueReminders(env: CloudflareEnv, origin: string) {
  const s = await getEmailSettings(env);
  if (!s.reminder.on || !emailReady(env, s)) return;
  const before = new Date(Date.now() - s.reminder.hours * 36e5).toISOString();
  const { results } = await env.DB.prepare("SELECT * FROM leads WHERE status = 'waiting' AND reminded_at IS NULL AND updated_at < ? ORDER BY updated_at LIMIT 5").bind(before).all<LeadRow>();
  for (const lead of results) await remindLead(env, lead, origin);
}
