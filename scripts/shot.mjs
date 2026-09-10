// Usage: node scripts/shot.mjs /path [name]
// Screenshots a page at 1440px and 390px into ./screenshots.
import { chromium } from "playwright";

const path = process.argv[2] ?? "/";
const name = process.argv[3] ?? (path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home");
const base = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  const res = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900); // let the single load animation settle
  const file = `screenshots/${name}-${width}.png`;
  await page.screenshot({ path: file, fullPage: true });
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(`${file} status=${res?.status()} scrollWidth=${scrollW}${scrollW > width ? " OVERFLOW" : ""}`);
  for (const e of errors) console.log("  console:", e.slice(0, 200));
  await ctx.close();
}
await browser.close();
