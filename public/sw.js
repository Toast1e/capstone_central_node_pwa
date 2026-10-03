// Prechaching method to quickly cache the mock backend CSV files.
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open("vitisense-cache")
            .then((cache) => {
                cache.addAll([
                    "/CSV/mildew_2026-07-07 copy.csv",
                    "/CSV/mildew_2026-07-08.csv",
                ]);
            }),
    );
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    console.log('service worker activated')
});