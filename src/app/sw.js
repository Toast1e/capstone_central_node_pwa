import { ExpirationPlugin, NetworkFirst, Serwist } from "serwist";

// Only what the Home and Profile pages read (GET requests).
// Exact paths: the query string (hours, leafNodeID) isn't part of url.pathname,
// but the cache still keeps one entry per full URL, so each node/range is stored separately.
const DATA_PATHS = new Set([
    "/api/centralnode", // node name (SettingsContext, shown on Home and Profile)
    "/api/alerts",      // Home alert banner
    "/api/history",     // Home charts and condition timeline
    "/api/leafnodes"
]);



// Home's latest-reading cards: /api/leafnodes/1/details ... /api/leafnodes/6/details
const NODE_DETAILS = /^\/api\/leafnodes\/\d+\/details$/;

const isCachedData = ({ url, request }) =>
    request.method === "GET" &&
    (DATA_PATHS.has(url.pathname) || NODE_DETAILS.test(url.pathname));

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    precacheOptions: {
        ignoreURLParametersMatching: [/^_rsc$/],
    },
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false,
    runtimeCaching: [
        {
            matcher: ({ url }) => url.searchParams.has("ping"),
            method: "HEAD",
            handler: async ({ request }) => {
                try {
                    return await fetch(request, { cache: "no-store", signal: AbortSignal.timeout(3000) });
                } catch {
                    // 200 plus a header, so the page sees a normal response instead of a failed request
                    return new Response(null, { status: 200, headers: { "x-vitisense-ping": "unreachable" } });
                }
            },
        },
        {
            matcher: isCachedData,
            handler: new NetworkFirst({
                cacheName: "vitisense-api-data",
                networkTimeoutSeconds: 3,
                // 6 nodes x 2 chart ranges (12) + 6 node details + alerts + centralnode = 20,
                // so 20 would evict something. 30 leaves headroom.
                plugins: [new ExpirationPlugin({ maxEntries: 30 })],
            }),
        },
    ],
});

serwist.addEventListeners();