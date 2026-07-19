const CACHE = "phoenix-aid-v4";

self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const home = await fetch("/");
      const html = await home.clone().text();
      const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((path) => path.startsWith("/_next/static/"));
      await cache.put("/", home);
      await cache.addAll([
        "/manifest.webmanifest",
        "/icon.svg",
        ...new Set(assets),
      ]);
      await self.skipWaiting();
    })(),
  ),
);

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              (key.startsWith("phoenix-ayuda-") ||
                key.startsWith("phoenix-aid-")) &&
              key !== CACHE,
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  ),
);

self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);
      const networkFirst = async () => {
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            const cache = await caches.open(CACHE);
            await cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return (await caches.match(event.request)) || Response.error();
        }
      };
      if (event.request.mode === "navigate") {
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            const cache = await caches.open(CACHE);
            await cache.put("/", response.clone());
          }
          return response;
        } catch {
          return (await caches.match("/")) || Response.error();
        }
      }
      // Next's development chunks keep stable paths between edits. Prefer a
      // fresh bundle so an old offline cache can never leave a visible UI with
      // stale click handlers; retain the cached bundle as the offline fallback.
      if (url.pathname.startsWith("/_next/")) return networkFirst();
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match("/")) || Response.error();
      }
    })(),
  );
});
