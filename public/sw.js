const CACHE_NAME = "vitisense-cache-v3";
const ASSETS_TO_CACHE = [
    "/CSV/mildew_2026-07-07 copy.csv",
    "/CSV/mildew_2026-07-08.csv",
    "/",
    "/login",
    "/home",
    "/profile"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                cache.addAll(ASSETS_TO_CACHE);
            }),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            ))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(event.request).then((response) => {
                if (!response.ok) return response;   
                const copy = response.clone();            
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;                   
            });
        })
    );
});

