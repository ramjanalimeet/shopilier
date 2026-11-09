import { headers } from "next/headers";
import { notFound } from "next/navigation";
import MasterApp from "@/components/dash/MasterApp";
import MasterShell from "@/components/dash/MasterShell";
import { accessEmail } from "@/lib/access";
import { getEnv } from "@/lib/cf";

// Only visitors Cloudflare Access let through (with a valid Access token) see the dashboard; anyone else gets the
// site's 404, so the page doesn't even show that it exists when the Access application doesn't cover this address.
export const dynamic = "force-dynamic";

export default async function MasterAdminPage() {
  const email = await accessEmail(new Request("https://shopilier.com/master-admin", { headers: await headers() }), await getEnv());
  if (!email) notFound();
  return (
    <>
      <MasterShell />
      <MasterApp />
    </>
  );
}
