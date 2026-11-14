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

const VERSION = "verbalia-v2.5.0"; // ola E · 5: ambiente único de estudio (2 loops) + banco SFX normalizado precacheado
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
  "/sfx/buoy.mp3",
  "/sfx/buoy.ogg",
  "/sfx/buy.mp3",
  "/sfx/buy.ogg",
  "/sfx/chime.mp3",
  "/sfx/chime.ogg",
  "/sfx/claim.mp3",
  "/sfx/claim.ogg",
  "/sfx/clockSoft.mp3",
  "/sfx/clockSoft.ogg",
  "/sfx/close.mp3",
  "/sfx/close.ogg",
  "/sfx/coin.mp3",
  "/sfx/coin.ogg",
  "/sfx/coins.mp3",
  "/sfx/coins.ogg",
  "/sfx/combo.mp3",
  "/sfx/combo.ogg",
  "/sfx/confetti.mp3",
  "/sfx/confetti.ogg",
  "/sfx/correct.mp3",
  "/sfx/correct.ogg",
  "/sfx/countdown.mp3",
  "/sfx/countdown.ogg",
  "/sfx/deal.mp3",
  "/sfx/deal.ogg",
  "/sfx/error.mp3",
  "/sfx/error.ogg",
  "/sfx/flip.mp3",
  "/sfx/flip.ogg",
  "/sfx/gift.mp3",
  "/sfx/gift.ogg",
  "/sfx/go.mp3",
  "/sfx/go.ogg",
  "/sfx/levelUp.mp3",
  "/sfx/levelUp.ogg",
  "/sfx/levelUp2.mp3",
  "/sfx/levelUp2.ogg",
  "/sfx/open.mp3",
  "/sfx/open.ogg",
  "/sfx/page.mp3",
  "/sfx/page.ogg",
  "/sfx/place.mp3",
  "/sfx/place.ogg",
  "/sfx/pop.mp3",
  "/sfx/pop.ogg",
  "/sfx/sessionEnd.mp3",
  "/sfx/sessionEnd.ogg",
  "/sfx/sessionLose.mp3",
  "/sfx/sessionLose.ogg",
  "/sfx/sessionWin.mp3",
  "/sfx/sessionWin.ogg",
  "/sfx/slide.mp3",
  "/sfx/slide.ogg",
  "/sfx/snap.mp3",
  "/sfx/snap.ogg",
  "/sfx/sparkle.mp3",
  "/sfx/sparkle.ogg",
  "/sfx/stamp.mp3",
  "/sfx/stamp.ogg",
  "/sfx/stepUp.mp3",
  "/sfx/stepUp.ogg",
  "/sfx/streak.mp3",
  "/sfx/streak.ogg",
  "/sfx/tinta.mp3",
  "/sfx/tinta.ogg",
  "/sfx/typeKey.mp3",
  "/sfx/typeKey.ogg",
  "/sfx/typeWord.mp3",
  "/sfx/typeWord.ogg",
  "/sfx/unlock.mp3",
  "/sfx/unlock.ogg",
  "/sfx/whoosh.mp3",
  "/sfx/whoosh.ogg",
  "/sfx/wrong.mp3",
  "/sfx/wrong.ogg",
  "/music/estudio-brisa.ogg",
  "/music/estudio-olas.ogg",
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
