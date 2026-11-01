import { currentUser } from "@/lib/auth";
import { api, json, readJson } from "@/lib/http";
import { clearWebOrders, pendingWebOrders } from "@/lib/storefront";

// The signed-in owner's dashboard picks up orders placed on their live website…
export const GET = api(async (request, env) => {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Not signed in." }, 401);
  return json({ orders: await pendingWebOrders(env, user.id) });
});

// …and, once they're saved in the store, clears them here
export const POST = api(async (request, env) => {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Not signed in." }, 401);
  const body = await readJson(request);
  const ids = (Array.isArray(body.ids) ? body.ids : []).map((x) => String(x)).filter((x) => /^w_[a-z0-9]{1,32}$/.test(x));
  await clearWebOrders(env, user.id, ids);
  return json({ ok: true });
});
