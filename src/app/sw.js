import { NetworkFirst, Serwist } from "serwist";

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
            // Currently just gets the mock backend csvs. Swap for the actual path once the backend api is finished.
            matcher: ({ url }) => url.pathname.endsWith(".csv"),
            handler: new NetworkFirst({
                cacheName: "vitisense-csv-data",
                networkTimeoutSeconds: 3,
            })
        },
    ],
});

serwist.addEventListeners();