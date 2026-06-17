const CACHE = "curecheck-v2";
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  OFFLINE_URL,
];

/* ─── Install: pre-cache shell ──────────────────────────────────────── */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ─── Activate: purge old caches ────────────────────────────────────── */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ─── Fetch strategy ─────────────────────────────────────────────────
   API calls    → network-only, offline → JSON error
   Fonts/CDN    → cache-first (long-lived)
   HTML nav     → network-first, fallback to offline.html
   Assets       → stale-while-revalidate
   ─────────────────────────────────────────────────────────────────── */
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Skip OneSignal SDK requests — let them pass through unmodified
  if (url.hostname.includes("onesignal.com")) return;

  // API: network-only
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "Offline — no network." }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // External fonts / CDN: cache-first
  if (url.hostname.includes("fonts.gstatic.com") || url.hostname.includes("fonts.googleapis.com")) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            c.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // HTML navigations: network-first, then cache, then offline page
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          if (res && res.status === 200 && res.type !== "opaque") {
            c.put(request, res.clone());
          }
          return res;
        }).catch(() => cached ?? new Response("", { status: 503 }));
        return cached ?? fetchPromise;
      })
    )
  );
});

/* ─── Push notifications (OneSignal handles its own worker,
       this handles any direct push events if needed) ─────────────── */
self.addEventListener("push", (e) => {
  if (!e.data) return;
  try {
    const data = e.data.json();
    e.waitUntil(
      self.registration.showNotification(data.title ?? "CureCheck", {
        body: data.body ?? "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: data.url ?? "/" },
      })
    );
  } catch {
    // ignore malformed push
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.notification.data?.url ?? "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return clients.openWindow(target);
    })
  );
});
