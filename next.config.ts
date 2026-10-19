import type { NextConfig } from "next";
import { networkInterfaces } from "os";
import { withSerwist } from "@serwist/turbopack";

// In development Next.js only serves the page's JavaScript to "localhost".
// Opening the Network URL (e.g. on a phone) would then show a page where no
// button works. Allow this machine's own LAN addresses too, so it works for
// everyone on the team without hardcoding an IP.
// Restart `npm run dev` after switching networks.
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net?.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  // `next build` writes plain HTML/CSS/JS to `out/`. The backend repo's NGINX
  // container builds and serves it on the Pi, so no Node.js server runs in
  // production. Server-only features (route handlers, server actions,
  // cookies()...) can't be used — talk to the Pi through its /api/ endpoints.
  output: "export",
  allowedDevOrigins: lanAddresses,
};

export default withSerwist(nextConfig);
