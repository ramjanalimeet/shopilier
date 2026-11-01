import { api, json } from "@/lib/http";
import { addWebOrder, liveWebsite, storeBySub } from "@/lib/storefront";

// An order from a live website's checkout. It's kept as sent; the owner's dashboard checks prices, stock and
// discount codes against the store before adding it (the same checks as an order from the preview).
export const POST = (request: Request, ctx: { params: Promise<{ sub: string }> }) => api(async (req, env) => {
  const { sub } = await ctx.params;
  const text = await req.text();
  if (text.length > 20_000) return json({ error: "Order too large." }, 413);
  let o: Record<string, unknown>;
  try { o = JSON.parse(text); } catch { return json({ error: "Expected JSON." }, 400); }
  const items = Array.isArray(o.items) ? o.items.slice(0, 50) : [];
  if (!items.length) return json({ error: "Your cart is empty." }, 400);
  const found = await storeBySub(env, sub);
  if (!found || !liveWebsite(found.store)) return json({ error: "This shop isn't open." }, 404);
  const order = {
    items: items.map((it: Record<string, unknown>) => ({ id: String(it?.id || "").slice(0, 40), qty: Math.max(1, Math.min(99, Math.floor(Number(it?.qty) || 1))), v: String(it?.v || "").slice(0, 120) })),
    answers: (Array.isArray(o.answers) ? o.answers : []).slice(0, 20).map((a: Record<string, unknown>) => ({ label: String(a?.label || "").slice(0, 60), type: String(a?.type || "").slice(0, 20), value: String(a?.value || "").slice(0, 300) })),
    delivery: String(o.delivery || "").slice(0, 80), payment: String(o.payment || "").slice(0, 40), code: String(o.code || "").slice(0, 40),
  };
  await addWebOrder(env, found.userId, order);
  return json({ ok: true });
}, { limit: true })(request);
