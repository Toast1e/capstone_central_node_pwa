import { NetworkFirst, Serwist } from "serwist";

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false,
    runtimeCaching: [
        {
            // Currently just gets the mock backend csvs. Swap for the actual path once the backend api is finished.
            matcher: ({ url }) => url.pathname.endsWith(".csv"),
            handler: new NetworkFirst({
                cacheName: "vitisense-csv-data",
                networkTimeoutSeconds: 3,
            })
        }
    ],
});

serwist.addEventListeners();