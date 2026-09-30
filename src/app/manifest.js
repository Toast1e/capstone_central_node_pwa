// Web app manifest: lets phones install the app to the home screen and open
// it full screen, without the browser bar. Icons are made by `npm run icons`.
// Installing needs the site to be served over HTTPS.

// required by `output: "export"`: write the manifest to a file at build time
export const dynamic = "force-static";

export default function manifest() {
  return {
    id: "/",
    name: "VitiSense",
    short_name: "VitiSense",
    description: "Mildew early warning system for your vineyards",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5F2EE", // splash screen while the app loads
    theme_color: "#6B4C9A", // phone status bar
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
