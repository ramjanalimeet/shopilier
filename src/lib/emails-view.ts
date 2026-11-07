// The Email automation page's data for the master dashboard (used by the /master-admin/api/emails routes)
import { checkResendKey, ensureGrowth, getEmailSettings, resendKey } from "./growth";

// Email automation: the settings, how sending is connected (never the key itself), the key's domains in Resend,
// and the latest emails
export const emailsView = async (env: CloudflareEnv) => {
  await ensureGrowth(env);
  const settings = await getEmailSettings(env);
  const { key, source } = await resendKey(env);
  const check = key ? await checkResendKey(key) : null;
  const { results } = await env.DB.prepare("SELECT * FROM email_log ORDER BY created_at DESC LIMIT 100").all();
  return {
    settings,
    connected: {
      key: !!key, source, last4: key ? key.slice(-4) : "",
      keyOk: check ? check.ok : false, keyError: check && !check.ok ? check.error : "",
      domains: check && check.ok ? check.domains : null,
      ready: !!key && !!settings.fromEmail && (!check || check.ok),
    },
    log: results,
  };
};
