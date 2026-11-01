// Makes the home page's dashboard pictures from the real dashboard (the live demo), sharp on every screen.
//   1. Start the site:            npm run build && npm run start   (or any running copy)
//   2. Make the pictures:         node scripts/showcase-shots.mjs [http://localhost:3000]
// Writes public/showcase/: dashboard-desktop-1440.webp and -2880.webp (the computer view at 1× and 2×) and
// dashboard-phone-1170.webp (the phone view at 3×). Needs Playwright with Chromium (npx playwright install chromium).
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

// Playwright from this project, or a global install (NODE_PATH)
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const base = (process.argv[2] || process.env.BASE || "http://localhost:3000").replace(/\/$/, "");
const out = new URL("../public/showcase/", import.meta.url);
await mkdir(out, { recursive: true });

// The real dashboard without the demo's own bar, the "not live yet" notice and the chat button
const clean = ".demo-bar{display:none!important}.callout{display:none!important}.chat-fab{display:none!important}";
const browser = await chromium.launch();
const shoot = async (context, css) => {
  const page = await context.newPage();
  await page.goto(base + "/demo/app#/home", { waitUntil: "load" });
  await page.waitForSelector("#view .stats", { timeout: 20000 });
  await page.addStyleTag({ content: clean + css });
  await page.waitForTimeout(1200); // charts and fonts settle
  return page.screenshot({ type: "png" });
};
const webp = (png, file, width) => sharp(png).resize(width ? { width } : undefined).webp({ quality: 90, effort: 6 }).toFile(new URL(file, out).pathname);

// Computer: 1440 × 782 at 2× (the dashboard is drawn at 80% on computers, so this is its 1800px layout)
const desk = await shoot(await browser.newContext({ viewport: { width: 1440, height: 782 }, deviceScaleFactor: 2 }), ".store-admin.demo .app{height:125vh!important}");
await webp(desk, "dashboard-desktop-2880.webp");
await webp(desk, "dashboard-desktop-1440.webp", 1440);
// Phone: an iPhone screen below its status bar, at 3×
const phone = await shoot(await browser.newContext({ ...devices["iPhone 13"], viewport: { width: 390, height: 797 }, deviceScaleFactor: 3 }), ".store-admin.demo .app{height:100vh!important}");
await webp(phone, "dashboard-phone-1170.webp");
await browser.close();
console.log("Saved the dashboard pictures in public/showcase/");
