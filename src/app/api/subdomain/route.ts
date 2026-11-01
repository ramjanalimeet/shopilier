import { currentUser } from "@/lib/auth";
import { api, json } from "@/lib/http";
import { subdomainProblem, subdomainTaken } from "@/lib/subdomain";

// Is a free sub-domain free to use? (Settings → Domain checks before saving a new one.)
export const GET = api(async (request, env, url) => {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Not signed in." }, 401);
  const name = String(url.searchParams.get("name") || "").trim().toLowerCase();
  const problem = subdomainProblem(name);
  if (problem) return json({ name, available: false, reason: problem });
  const taken = await subdomainTaken(env, name, user.id);
  return json({ name, available: !taken, reason: taken ? "Another store already uses this name." : "" });
});
