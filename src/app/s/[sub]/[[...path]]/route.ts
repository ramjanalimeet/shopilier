import { Dash } from "@/dashboard/dash";
import { SiteKit } from "@/dashboard/site";
import { getEnv } from "@/lib/cf";
import { liveWebsite, siteDiscounts, storeBySub } from "@/lib/storefront";

// A store's live website: what the owner last published, with their products, discount codes and pixels.
// /s/<sub-domain> opens the home page; /s/<sub-domain>/<page> opens that page. The checkout sends orders
// to /api/shop/<sub-domain>/order, and they appear in the owner's dashboard.
export const dynamic = "force-dynamic";

const page = (title: string, text: string, status: number) => new Response(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f8f7;color:#101828;text-align:center;padding:24px;box-sizing:border-box}
  b{display:block;font-size:22px;margin-bottom:8px}p{margin:0;color:#667085;line-height:1.5}a{color:#0e7a4b;font-weight:600}</style></head>
  <body><div><b>${title}</b><p>${text}</p><p style="margin-top:18px"><a href="/">Made with Shopilier</a></p></div></body></html>`,
  { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
);

export async function GET(_request: Request, { params }: { params: Promise<{ sub: string; path?: string[] }> }) {
  const { sub, path = [] } = await params;
  const found = await storeBySub(await getEnv(), sub);
  if (!found) return page("Website not found", "There's no Shopilier website at this address.", 404);
  const live = liveWebsite(found.store);
  if (!live) return page("Coming soon", "This shop isn't open yet. Please check back soon.", 200);
  const { site, pages } = live as { site: Record<string, unknown>; pages: { id: string; slug?: string }[] };
  const products = found.store.products || [];
  SiteKit.ensure(site, pages, { products });
  const slug = path.join("/");
  const start = slug ? pages.find((p) => (p.slug || "") === slug) : null;
  if (slug && !start) return page("Page not found", "This page doesn't exist on this website.", 404);
  const html = SiteKit.storeHTML(site, pages, {
    products, discounts: siteDiscounts(found.store), tracking: Dash.trackingCode(found.store.marketing || {}),
    origin: "", start: start ? start.id : undefined, orderUrl: `/api/shop/${encodeURIComponent(sub)}/order`,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
