import type { NextConfig } from "next";
import { networkInterfaces } from "os";

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
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;
