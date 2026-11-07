const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // ¿Hay perfil? Si no, crear flujo corto
  if (!(await page.evaluate("!!document.querySelector('aside')"))) {
    const start = page.getByRole("button", { name: /empezar|comenzar|crear|explorar/i }).first();
    if (await start.count()) { await start.click(); await page.waitForTimeout(500); }
    const inp = page.locator("input").first();
    if (await inp.count()) await inp.fill("Navegante");
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

  // ---- Debug 1: transform de tap-3d en hover ----
  const tap = page.locator(".tap-3d").first();
  const box = await tap.boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.4, { steps: 6 });
  await page.waitForTimeout(600);
  const d1 = await page.evaluate(() => {
    const el = document.querySelector(".tap-3d");
    const cs = getComputedStyle(el);
    return {
      transform: cs.transform,
      transformOrigin: cs.transformOrigin,
      matchedHover: el.matches(":hover"),
      inlineTiltX: el.style.getPropertyValue("--tilt-x"),
    };
  });
  console.log("DEBUG tap-3d:", JSON.stringify(d1, null, 1));

  // ---- Debug 2: indicador sidebar ::after ----
  const nav = page.locator("aside nav button").nth(2);
  const nb = await nav.boundingBox();
  await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2, { steps: 4 });
  await page.waitForTimeout(500);
  const d2 = await page.evaluate(() => {
    const btn = document.querySelectorAll("aside nav button")[2];
    const after = getComputedStyle(btn, "::after");
    return {
      hovered: btn.matches(":hover"),
      content: after.content,
      position: after.position,
      height: after.height,
      top: after.top,
      width: after.width,
    };
  });
  console.log("DEBUG sidebar ::after:", JSON.stringify(d2, null, 1));

  // ---- Debug 3: scroll real de la página ----
  await page.evaluate("window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })");
  await page.waitForTimeout(900);
  const d3 = await page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    progress: document.documentElement.style.getPropertyValue("--progress"),
    revealIn: document.querySelectorAll(".reveal.reveal-in").length,
    pendientes: document.querySelectorAll(".reveal:not(.reveal-in)").length,
  }));
  console.log("DEBUG scroll:", JSON.stringify(d3, null, 1));

  await browser.close();
})().catch((e) => { console.error("FALLO:", e.message); process.exit(1); });
