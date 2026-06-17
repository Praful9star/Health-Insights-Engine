const CACHE = "curecheck-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  OFFLINE_URL,
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ error: "Offline" }), { headers: { "Content-Type": "application/json" } })));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.destination === "document") return caches.match(OFFLINE_URL);
      });
    })
  );
});
