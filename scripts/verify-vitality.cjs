/**
 * Crea un perfil de prueba en VERBALIA y luego verifica la Capa Viva
 * de Escritorio (Vitality): aura del cursor, tilt 3D, spotlight,
 * reveal al scroll, barra de progreso y parallax.
 */
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const log = (k, v) => console.log(`${k.padEnd(26)}· ${v}`);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // ---- Bienvenida ----
  const startBtn = page.getByRole("button", { name: /empezar|comenzar|crear|explorar/i }).first();
  if (await startBtn.count()) {
    await startBtn.click();
    await page.waitForTimeout(600);
  }

  // ---- Onboarding: 6 pasos (nombre, género, avatar, objetivo, experiencia, paleta) ----
  const nameInput = page.locator("input").first();
  if (await nameInput.count()) {
    await nameInput.fill("Navegante");
    await page.waitForTimeout(200);
  }
  for (let step = 0; step < 6; step++) {
    // Elegir la primera opción del paso (habilita Continuar)
    const option = page.locator("section button").first();
    if (await option.count()) { await option.click(); await page.waitForTimeout(150); }
    const cont = page.getByRole("button", { name: /continuar|ir a la evaluación/i }).first();
    if (await cont.count()) {
      const disabled = await cont.isDisabled();
      if (!disabled) { await cont.click(); await page.waitForTimeout(450); }
    }
  }

  // ---- Placement: saltar ----
  const skip = page.getByRole("button", { name: /saltar/i }).first();
  if (await skip.count()) { await skip.click(); await page.waitForTimeout(900); }

  const txt = (await page.evaluate("document.body.innerText")).substring(0, 70).replace(/\n/g, " · ");
  log("pantalla", txt);

  // ================= VERIFICACIONES =================
  await page.waitForTimeout(700);

  // 1 · Estado base
  const base = await page.evaluate(() => ({
    cursor: !!document.querySelector(".vitality-cursor"),
    progress: !!document.querySelector(".vitality-progress"),
    sections: document.querySelectorAll("section").length,
    marked: document.querySelectorAll("section[data-vita]").length,
    revealOcultas: document.querySelectorAll(".reveal:not(.reveal-in)").length,
    revealVisibles: document.querySelectorAll(".reveal.reveal-in").length,
    smoothScroll: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  for (const [k, v] of Object.entries(base)) log(k, JSON.stringify(v));

  // 2 · Hover: tilt 3D + aura + sheen sobre la primera tarjeta tap-3d
  const tap = page.locator(".tap-3d").first();
  log("tarjetas tap-3d", await page.locator(".tap-3d").count());
  if (await tap.count()) {
    const box = await tap.boundingBox();
    const cx = box.x + box.width * 0.75, cy = box.y + box.height * 0.3;
    await page.mouse.move(cx, cy, { steps: 8 });
    await page.waitForTimeout(500);
    const h = await page.evaluate(() => {
      const el = document.querySelector(".tap-3d");
      const glow = document.querySelector(".vitality-cursor");
      return {
        tiltX: el.style.getPropertyValue("--tilt-x"),
        tiltY: el.style.getPropertyValue("--tilt-y"),
        translate: getComputedStyle(el).translate,
        transform3d: getComputedStyle(el).transform.startsWith("matrix3d"),
        sheenAnim: getComputedStyle(el, "::before").animationName,
        glowOpacity: glow?.style.opacity,
        glowTransform: glow?.style.transform?.slice(0, 40),
      };
    });
    for (const [k, v] of Object.entries(h)) log("hover·" + k, JSON.stringify(v));
    await page.screenshot({ path: "/tmp/render/pc-hover-tilt.png" });
  }

  // 3 · Spotlight card-aurora
  if (await page.locator(".card-aurora").count()) {
    const box = await page.locator(".card-aurora").first().boundingBox();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5, { steps: 5 });
    await page.waitForTimeout(350);
    const s = await page.evaluate(() => {
      const el = document.querySelector(".card-aurora");
      return {
        mx: el.style.getPropertyValue("--mx"),
        my: el.style.getPropertyValue("--my"),
        afterOpacity: getComputedStyle(el, "::after").opacity,
        borderHover: getComputedStyle(el).borderColor,
      };
    });
    for (const [k, v] of Object.entries(s)) log("spot·" + k, JSON.stringify(v));
  }

  // 4 · Scroll: reveal + progreso + parallax
  await page.evaluate("window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })");
  await page.waitForTimeout(1000);
  const sc = await page.evaluate(() => ({
    progress: document.documentElement.style.getPropertyValue("--progress"),
    scrollFX: document.documentElement.style.getPropertyValue("--scroll-fx"),
    revealIn: document.querySelectorAll(".reveal.reveal-in").length,
    pendientes: document.querySelectorAll(".reveal:not(.reveal-in)").length,
  }));
  for (const [k, v] of Object.entries(sc)) log("scroll·" + k, JSON.stringify(v));
  await page.screenshot({ path: "/tmp/render/pc-home-scroll.png" });

  // 5 · Vuelta arriba + navegación sidebar (indicador + icono)
  await page.evaluate("window.scrollTo({top:0})");
  await page.waitForTimeout(600);
  const navBtn = page.locator("aside nav button").nth(2); // Juegos educativos
  if (await navBtn.count()) {
    const nb = await navBtn.boundingBox();
    await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2, { steps: 4 });
    await page.waitForTimeout(400);
    const n = await page.evaluate(() => {
      const btn = document.querySelectorAll("aside nav button")[2];
      return {
        indicadorH: getComputedStyle(btn, "::after").height,
        iconoTransform: getComputedStyle(btn.querySelector("svg")).transform.slice(0, 26),
      };
    });
    for (const [k, v] of Object.entries(n)) log("nav·" + k, JSON.stringify(v));
    await navBtn.click();
    await page.waitForTimeout(1000);
    log("arcade·tarjetas", await page.locator(".tap-3d").count());
    await page.mouse.move(1000, 400, { steps: 4 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: "/tmp/render/pc-arcade-hover.png" });
  }

  // 6 · Consola
  log("errores JS", errors.length ? errors.slice(0, 3).join(" | ") : "ninguno ✓");

  await browser.close();
  console.log("\n✔ VERIFICACIÓN COMPLETA");
})().catch((e) => { console.error("FALLO:", e.message); process.exit(1); });
