// Free store sub-domains: <name>.shopilier.com opens that store's live website.
// Used by the Worker entry (worker.ts) before Next.js sees the request, so keep it free of imports.

/** Paths a store's sub-domain passes through untouched: the checkout's order API, uploaded photos, static files. */
const PASS = ["/api/shop/", "/media/", "/assets/", "/_next/", "/favicon.ico", "/robots.txt"];

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type HostAction =
  | { kind: "pass" }
  | { kind: "rewrite"; path: string }
  | { kind: "redirect"; to: string };

/**
 * What to do with a request, from its host and path:
 * - www.<root>/…            → redirect to <root>/… (one address for the main site, so sign-in cookies match)
 * - <name>.<root>/…         → the store's website, served from /s/<name>/…
 * - <root>/s/<name>/…       → redirect to <name>.<root>/… (store websites run the owner's own code, so they
 *                              never open on the main site, where Shopilier's sign-in cookie lives)
 * - anything else (workers.dev, localhost, custom domains) → unchanged
 */
export function storeHost(hostname: string, pathname: string, search: string, root: string): HostAction {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  root = root.toLowerCase();
  if (!root) return { kind: "pass" };
  if (host === "www." + root) return { kind: "redirect", to: `https://${root}${pathname}${search}` };
  if (host === root) {
    const m = /^\/s\/([^/]+)(\/.*)?$/.exec(pathname);
    if (m) {
      const sub = decodeSafe(m[1]).toLowerCase();
      if (LABEL.test(sub)) return { kind: "redirect", to: `https://${sub}.${root}${m[2] || "/"}${search}` };
    }
    return { kind: "pass" };
  }
  if (!host.endsWith("." + root)) return { kind: "pass" };
  const sub = host.slice(0, -(root.length + 1));
  if (!LABEL.test(sub)) return { kind: "pass" };
  if (PASS.some((p) => pathname === p || pathname.startsWith(p))) return { kind: "pass" };
  return { kind: "rewrite", path: `/s/${sub}${pathname === "/" ? "" : pathname}` };
}

const decodeSafe = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
