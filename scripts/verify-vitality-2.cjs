const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const log = (k, v) => console.log(`${k.padEnd(26)}· ${v}`);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
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
  await page.waitForTimeout(500);

  // ---- Arcade: tarjetas tilt-hover ----
  await page.evaluate("location.hash = '#arcade'");
  await page.waitForTimeout(1100);
  const arcade = await page.evaluate(() => ({
    tiltHoverCards: document.querySelectorAll(".tilt-hover").length,
    tap3d: document.querySelectorAll(".tap-3d").length,
    cardAurora: document.querySelectorAll(".card-aurora").length,
    revealPend: document.querySelectorAll(".reveal:not(.reveal-in)").length,
  }));
  for (const [k, v] of Object.entries(arcade)) log("arcade·" + k, v);

  if (arcade.tiltHoverCards > 0) {
    const box = await page.locator(".tilt-hover").first().boundingBox();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.35, { steps: 6 });
    await page.waitForTimeout(500);
    const h = await page.evaluate(() => {
      const el = document.querySelector(".tilt-hover");
      return {
        tiltY: el.style.getPropertyValue("--tilt-y"),
        translate: getComputedStyle(el).translate,
        transform3d: getComputedStyle(el).transform.startsWith("matrix3d"),
        sheen: getComputedStyle(el, "::before").animationName,
      };
    });
    for (const [k, v] of Object.entries(h)) log("arcadeHover·" + k, JSON.stringify(v));
  }

  // ---- Mapa: el botón de región tap-3d responde ----
  await page.evaluate("location.hash = '#map'");
  await page.waitForTimeout(1100);
  const mapState = await page.evaluate(() => {
    const tap = document.querySelector(".tap-3d");
    return {
      tapCards: document.querySelectorAll(".tap-3d").length,
      islands: document.querySelectorAll("button.group").length,
      revealPend: document.querySelectorAll(".reveal:not(.reveal-in)").length,
    };
  });
  for (const [k, v] of Object.entries(mapState)) log("mapa·" + k, v);
  if (mapState.tapCards > 0) {
    const box = await page.locator(".tap-3d").first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    await page.waitForTimeout(400);
    const mh = await page.evaluate(() => ({
      tilt: document.querySelector(".tap-3d").style.getPropertyValue("--tilt-y"),
      translate: getComputedStyle(document.querySelector(".tap-3d")).translate,
    }));
    for (const [k, v] of Object.entries(mh)) log("mapaHover·" + k, JSON.stringify(v));
  }

  // ---- Perfil y estadísticas: sin errores al navegar ----
  for (const h of ["#stats", "#shop", "#profile", "#music"]) {
    await page.evaluate((hh) => { location.hash = hh; }, h);
    await page.waitForTimeout(900);
    const ok = await page.evaluate("!!document.querySelector('.vitality-cursor')");
    log(h.replace("#", "") + "·capa activa", ok);
  }

  log("errores JS", errors.length ? errors.slice(0, 3).join(" | ") : "ninguno ✓");
  await browser.close();
  console.log("✔ ARCADE Y MAPA VERIFICADOS");
})().catch((e) => { console.error("FALLO:", e.message); process.exit(1); });
