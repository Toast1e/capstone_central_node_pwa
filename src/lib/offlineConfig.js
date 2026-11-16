// ------ Offline settings ------
// Shared by the app and the service worker (src/app/sw.js). The service worker
// is built on its own, so keep this file free of imports.

// Where the service worker saves the central node's answers on the phone (the
// Home page's readings, the alerts and the central node's name). The app reads
// it too, to show what's saved straight away while the live answer is on its way.
export const API_CACHE_NAME = "vitisense-api-data";
