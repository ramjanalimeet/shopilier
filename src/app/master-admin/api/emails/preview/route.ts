import { adminApi } from "@/lib/admin-api";
import { BUTTONS, clean, fill, layout, SAMPLE, type Kind } from "@/lib/growth";
import { json, readJson } from "@/lib/http";

// The email as it will look, with sample details, for the editor's live preview (nothing is sent or saved)
export const POST = adminApi(async (request, env, url) => {
  void env;
  const body = await readJson(request);
  const kind = (["welcome", "signin", "password", "reminder"].includes(String(body.kind)) ? body.kind : "welcome") as Kind;
  const subject = fill(clean(body.subject, 150), SAMPLE), text = fill(clean(body.body, 3000), SAMPLE);
  return json({ subject, html: layout(text, { label: BUTTONS[kind], url: url.origin + (kind === "reminder" ? "/signup" : "/admin") }) });
});
