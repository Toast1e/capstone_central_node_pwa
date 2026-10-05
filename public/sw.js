const CACHE_NAME = "vitisense-cache-v4";
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
    // Navigation routing requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (!response.ok) return response;

                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                })
            })
        )
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            // Look in the cache first for the file/resource needed.
            if (cached) {
                return cached;
            }

            // If not in the cache, look at the live version first and cache any other remaining assets.
            return fetch(event.request).then((response) => {
                if (!response.ok) return response;   
                const copy = response.clone();            
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;                   
            });
        })
    );
});

