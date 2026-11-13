/**
 * Service Worker de VERBALIA.
 *
 * Estrategia deliberadamente conservadora para no romper nunca la
 * experiencia (ni las sesiones de desarrollo):
 *   - Navegación (documentos): RED primero; si falla y hay caché,
 *     sirve la copia; si no, la página offline.
 *   - Estáticos (/_next/static, /icons, fuentes): caché con
 *     actualización en segundo plano (stale-while-revalidate).
 *   - /api y métodos que no son GET: nunca se interceptan.
 *
 * La caché de navegación se refresca en cada visita exitosa para que
 * la app instalada siempre esté al día.
 */

const VERSION = "verbalia-v2.4.0"; // ola D: banco de audio real CC0 (sfx + música por región) precacheado
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

/* Banco de audio real (Ola D): /sfx y /music se precachean completos en
 * segundo plano para que el juego suene igual sin conexión. La lista se
 * regenera con scripts/make-sw-audio-list.py tras tocar public/sfx|music. */
const AUDIO_CACHE = `${VERSION}-audio`;
const AUDIO_FILES = [
  "/sfx/achievement.mp3",
  "/sfx/achievement.ogg",
  "/sfx/achievement2.mp3",
  "/sfx/achievement2.ogg",
  "/sfx/back.mp3",
  "/sfx/back.ogg",
  "/sfx/back2.mp3",
  "/sfx/back2.ogg",
  "/sfx/buoy.mp3",
  "/sfx/buoy.ogg",
  "/sfx/buy.mp3",
  "/sfx/buy.ogg",
  "/sfx/buy2.mp3",
  "/sfx/buy2.ogg",
  "/sfx/chime.mp3",
  "/sfx/chime.ogg",
  "/sfx/chime2.mp3",
  "/sfx/chime2.ogg",
  "/sfx/claim.mp3",
  "/sfx/claim.ogg",
  "/sfx/claim2.mp3",
  "/sfx/claim2.ogg",
  "/sfx/click.mp3",
  "/sfx/click.ogg",
  "/sfx/click2.mp3",
  "/sfx/click2.ogg",
  "/sfx/click3.mp3",
  "/sfx/click3.ogg",
  "/sfx/clockTick.mp3",
  "/sfx/clockTick.ogg",
  "/sfx/clockTick2.mp3",
  "/sfx/clockTick2.ogg",
  "/sfx/clockTick3.mp3",
  "/sfx/clockTick3.ogg",
  "/sfx/close.mp3",
  "/sfx/close.ogg",
  "/sfx/close2.mp3",
  "/sfx/close2.ogg",
  "/sfx/coin.mp3",
  "/sfx/coin.ogg",
  "/sfx/coin2.mp3",
  "/sfx/coin2.ogg",
  "/sfx/coins.mp3",
  "/sfx/coins.ogg",
  "/sfx/coins2.mp3",
  "/sfx/coins2.ogg",
  "/sfx/coins3.mp3",
  "/sfx/coins3.ogg",
  "/sfx/combo.mp3",
  "/sfx/combo.ogg",
  "/sfx/combo2.mp3",
  "/sfx/combo2.ogg",
  "/sfx/confetti.mp3",
  "/sfx/confetti.ogg",
  "/sfx/confetti2.mp3",
  "/sfx/confetti2.ogg",
  "/sfx/correct.mp3",
  "/sfx/correct.ogg",
  "/sfx/correct2.mp3",
  "/sfx/correct2.ogg",
  "/sfx/correct3.mp3",
  "/sfx/correct3.ogg",
  "/sfx/countdown.mp3",
  "/sfx/countdown.ogg",
  "/sfx/countdown2.mp3",
  "/sfx/countdown2.ogg",
  "/sfx/deal.mp3",
  "/sfx/deal.ogg",
  "/sfx/deal2.mp3",
  "/sfx/deal2.ogg",
  "/sfx/error.mp3",
  "/sfx/error.ogg",
  "/sfx/error2.mp3",
  "/sfx/error2.ogg",
  "/sfx/flip.mp3",
  "/sfx/flip.ogg",
  "/sfx/flip2.mp3",
  "/sfx/flip2.ogg",
  "/sfx/gift.mp3",
  "/sfx/gift.ogg",
  "/sfx/go.mp3",
  "/sfx/go.ogg",
  "/sfx/go2.mp3",
  "/sfx/go2.ogg",
  "/sfx/levelUp.mp3",
  "/sfx/levelUp.ogg",
  "/sfx/levelUp2.mp3",
  "/sfx/levelUp2.ogg",
  "/sfx/navigate.mp3",
  "/sfx/navigate.ogg",
  "/sfx/navigate2.mp3",
  "/sfx/navigate2.ogg",
  "/sfx/open.mp3",
  "/sfx/open.ogg",
  "/sfx/open2.mp3",
  "/sfx/open2.ogg",
  "/sfx/page.mp3",
  "/sfx/page.ogg",
  "/sfx/page2.mp3",
  "/sfx/page2.ogg",
  "/sfx/place.mp3",
  "/sfx/place.ogg",
  "/sfx/place2.mp3",
  "/sfx/place2.ogg",
  "/sfx/pop.mp3",
  "/sfx/pop.ogg",
  "/sfx/pop2.mp3",
  "/sfx/pop2.ogg",
  "/sfx/pop3.mp3",
  "/sfx/pop3.ogg",
  "/sfx/sessionEnd.mp3",
  "/sfx/sessionEnd.ogg",
  "/sfx/sessionEnd2.mp3",
  "/sfx/sessionEnd2.ogg",
  "/sfx/sessionLose.mp3",
  "/sfx/sessionLose.ogg",
  "/sfx/sessionWin.mp3",
  "/sfx/sessionWin.ogg",
  "/sfx/slide.mp3",
  "/sfx/slide.ogg",
  "/sfx/slide2.mp3",
  "/sfx/slide2.ogg",
  "/sfx/snap.mp3",
  "/sfx/snap.ogg",
  "/sfx/snap2.mp3",
  "/sfx/snap2.ogg",
  "/sfx/sparkle.mp3",
  "/sfx/sparkle.ogg",
  "/sfx/sparkle2.mp3",
  "/sfx/sparkle2.ogg",
  "/sfx/stamp.mp3",
  "/sfx/stamp.ogg",
  "/sfx/stepUp.mp3",
  "/sfx/stepUp.ogg",
  "/sfx/streak.mp3",
  "/sfx/streak.ogg",
  "/sfx/tap.mp3",
  "/sfx/tap.ogg",
  "/sfx/tap2.mp3",
  "/sfx/tap2.ogg",
  "/sfx/tap3.mp3",
  "/sfx/tap3.ogg",
  "/sfx/tick.mp3",
  "/sfx/tick.ogg",
  "/sfx/tick2.mp3",
  "/sfx/tick2.ogg",
  "/sfx/tinta.mp3",
  "/sfx/tinta.ogg",
  "/sfx/tinta2.mp3",
  "/sfx/tinta2.ogg",
  "/sfx/tock.mp3",
  "/sfx/tock.ogg",
  "/sfx/tock2.mp3",
  "/sfx/tock2.ogg",
  "/sfx/toggle.mp3",
  "/sfx/toggle.ogg",
  "/sfx/toggle2.mp3",
  "/sfx/toggle2.ogg",
  "/sfx/toggle3.mp3",
  "/sfx/toggle3.ogg",
  "/sfx/typeKey.mp3",
  "/sfx/typeKey.ogg",
  "/sfx/typeWord.mp3",
  "/sfx/typeWord.ogg",
  "/sfx/unlock.mp3",
  "/sfx/unlock.ogg",
  "/sfx/whoosh.mp3",
  "/sfx/whoosh.ogg",
  "/sfx/whoosh2.mp3",
  "/sfx/whoosh2.ogg",
  "/sfx/whoosh3.mp3",
  "/sfx/whoosh3.ogg",
  "/sfx/wrong.mp3",
  "/sfx/wrong.ogg",
  "/sfx/wrong2.mp3",
  "/sfx/wrong2.ogg",
  "/sfx/wrong3.mp3",
  "/sfx/wrong3.ogg",
  "/music/arcade.ogg",
  "/music/biblioteca.ogg",
  "/music/bosque.ogg",
  "/music/ciudad.ogg",
  "/music/errors.ogg",
  "/music/forja.ogg",
  "/music/fortaleza.ogg",
  "/music/map.ogg",
  "/music/missions.ogg",
  "/music/observatorio.ogg",
  "/music/puerto.ogg",
  "/music/results.ogg",
  "/music/stats.ogg",
  "/music/torre.ogg",
  "/music/welcome.ogg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES_CACHE);
      await pages.addAll([OFFLINE_URL]).catch(() => undefined);
      // Audio: en piezas, para no tumbar la instalación si un archivo falla.
      const audio = await caches.open(AUDIO_CACHE);
      const CHUNK = 24;
      for (let i = 0; i < AUDIO_FILES.length; i += CHUNK) {
        await Promise.all(
          AUDIO_FILES.slice(i, i + CHUNK).map((f) =>
            audio.add(f).catch(() => undefined),
          ),
        );
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/icon.svg", "/sfx/", "/music/"];
const AUDIO_PREFIXES = ["/sfx/", "/music/"];

function isStaticAsset(url) {
  return STATIC_PREFIXES.some((p) => url.pathname.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET propio; nada de API ni de otros orígenes.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // Documento principal: red primero.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGES_CACHE);
          cache.put(request, fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          const cached = await caches.match(request, { ignoreSearch: true });
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return (
            offline ||
            new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
          );
        }
      })(),
    );
    return;
  }

  // Audio del banco: cache-first inmutable (ya está precacheado).
  if (AUDIO_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(AUDIO_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          return new Response("", { status: 503 });
        }
      })(),
    );
    return;
  }

  // Estáticos: sirve caché y actualiza en segundo plano.
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone()).catch(() => undefined);
            return response;
          })
          .catch(() => undefined);
        return cached || (await network) || new Response("Sin conexión", { status: 503 });
      })(),
    );
  }
});

// Permite activar una nueva versión al instante tras el aviso de la UI.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
