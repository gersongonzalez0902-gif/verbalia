const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  if (!(await page.evaluate("!!document.querySelector('.dock')"))) {
    const start = page.getByRole("button", { name: /empezar|comenzar|crear|explorar/i }).first();
    if (await start.count()) { await start.click(); await page.waitForTimeout(500); }
    const inp = page.locator("input").first();
    if (await inp.count()) await inp.fill("Marina");
    for (let i = 0; i < 6; i++) {
      const opt = page.locator("section button").first();
      if (await opt.count()) { await opt.click(); await page.waitForTimeout(120); }
      const cont = page.getByRole("button", { name: /continuar|ir a la evaluación/i }).first();
      if (await cont.count() && !(await cont.isDisabled())) { await cont.click(); await page.waitForTimeout(350); }
    }
    const skip = page.getByRole("button", { name: /saltar/i }).first();
    if (await skip.count()) { await skip.click(); await page.waitForTimeout(800); }
  }
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => ({
    dockVisible: !!document.querySelector(".dock"),
    vitalityCursor: !!document.querySelector(".vitality-cursor"),
    vitalityProgress: !!document.querySelector(".vitality-progress"),
    seccionesReveal: document.querySelectorAll(".reveal").length,
    tapTransform: getComputedStyle(document.querySelector(".tap-3d") ?? document.body).transform,
    smoothScroll: getComputedStyle(document.documentElement).scrollBehavior,
    finePointer: matchMedia("(hover: hover) and (pointer: fine)").matches,
  }));
  console.log(JSON.stringify(m, null, 1));
  console.log("errores JS:", errors.length ? errors.slice(0, 2).join(" | ") : "ninguno ✓");
  await browser.close();
})().catch((e) => { console.error("FALLO:", e.message); process.exit(1); });
