export const GOOGLE_STATE_COOKIE = "shopiliar_google";
export const googleRedirectUri = (url: URL) => url.origin + "/api/auth/google/callback";
// Only send people back to pages inside their dashboard
export const nextPath = (v: string | null | undefined) => (/^\/admin(\/|$)/.test(v || "") ? (v as string) : "/admin");

/**
 * Google proved this person owns `email`. If the account was made (or its email changed) with a password and that
 * email was never proved, anyone could have registered it first, so the password stops working and every other
 * device is signed out: the inbox's owner takes over, and can set a new password in Settings. After that, the email
 * counts as proved and later Google sign-ins change nothing.
 */
export async function claimWithGoogle(env: CloudflareEnv, user: { id: string; email: string; password_hash: string }) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS verified_emails (user_id TEXT PRIMARY KEY, email TEXT NOT NULL, verified_at TEXT NOT NULL)").run();
  const row = await env.DB.prepare("SELECT email FROM verified_emails WHERE user_id = ?").bind(user.id).first<{ email: string }>();
  if (row && row.email === user.email) return false;
  const cleared = !!user.password_hash;
  await env.DB.batch([
    ...(cleared ? [
      env.DB.prepare("UPDATE users SET password_hash = '', password_salt = '' WHERE id = ? AND email = ?").bind(user.id, user.email),
      env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
    ] : []),
    env.DB.prepare("INSERT INTO verified_emails (user_id, email, verified_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, verified_at = excluded.verified_at")
      .bind(user.id, user.email, new Date().toISOString()),
  ]);
  return cleared;
}
