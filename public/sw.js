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

const VERSION = "verbalia-v2.0.0";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]).catch(() => undefined))
      .then(() => self.skipWaiting()),
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

const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/icon.svg"];

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
