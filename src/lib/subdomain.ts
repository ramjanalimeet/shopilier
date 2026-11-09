// Free sub-domains (<name>.shopilier.com, live at /s/<name>): 3–40 letters, numbers or hyphens, not starting or
// ending with a hyphen, not a reserved word, and not used by another store.
const RESERVED = new Set(["www", "app", "api", "admin", "master", "master-admin", "mail", "shop", "store", "help", "support", "blog", "demo", "static", "assets", "media", "shopilier", "shopiliar", "dashboard", "signin", "signup", "login", "s"]);

export const subdomainProblem = (name: string) =>
  name.length < 3 ? "Use at least 3 characters." : name.length > 40 ? "Use 40 characters or fewer."
    : !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(name) ? "Use only English letters, numbers and hyphens (not at the start or end)."
    : RESERVED.has(name) ? "That name is reserved. Please pick another." : "";

export const subdomainTaken = async (env: CloudflareEnv, name: string, userId: string) =>
  !!(await env.DB.prepare("SELECT 1 FROM stores WHERE json_extract(data, '$.settings.subdomain') = ? AND user_id != ? LIMIT 1").bind(name, userId).first());

/**
 * A free sub-domain close to `wanted`, for a store's first save: the dashboard suggests one from the business
 * name, which another store may already use (or which may break the rules, like a name in Bangla becoming "mystore").
 */
export async function freeSubdomain(env: CloudflareEnv, wanted: string, userId: string) {
  let base = wanted.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 34).replace(/-+$/, "");
  if (subdomainProblem(base)) base = "mystore";
  for (let i = 1; i <= 20; i++) {
    const name = i === 1 ? base : `${base}-${i}`;
    if (!subdomainProblem(name) && !(await subdomainTaken(env, name, userId))) return name;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}
