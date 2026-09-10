/* INMOBILIARIA CHUO-ZU - Service Worker
 * Estrategia:
 *  - Snapshot (/api/snapshot) y feed (/api/rastrear): network-first con
 *    respaldo en caché → el radar funciona OFFLINE.
 *  - Navegación (HTML) y estáticos: stale-while-revalidate → carga instantánea
 *    y disponible sin conexión en el interior del país.
 */
const CACHE = "chuo-zu-v1";
const CACHE_SNAPSHOT = "chuo-zu-snapshot-v1";
const SNAPSHOT_KEY = "/api/snapshot";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE && k !== CACHE_SNAPSHOT)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, error: "Sin conexión" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  // Devuelve lo cacheado de inmediato; si no hay nada, espera la red
  if (cached) return cached;
  const res = await network;
  if (res) return res;
  return new Response("Página no disponible sin conexión", { status: 503 });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Snapshot y feed del radar: network-first (respaldo offline)
  if (url.pathname === SNAPSHOT_KEY || url.pathname === "/api/rastrear") {
    event.respondWith(networkFirst(req, url.pathname === SNAPSHOT_KEY ? CACHE_SNAPSHOT : CACHE));
    return;
  }

  // Imágenes de Supabase Storage: cache-first
  if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // Navegación y resto de GETs: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});