import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// new label for version control of pages. Always re-downloads after each new rebuild.
const revision = crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
    createSerwistRoute({
        additionalPrecacheEntries: [
            { url: "/", revision },
            { url: "/login", revision },
            { url: "/home", revision },
            { url: "/profile", revision },
            { url: "/login.txt", revision },
            { url: "/home.txt", revision },
            { url: "/profile.txt", revision },
            { url: "/manifest.webmanifest", revision },
            { url: "/_next/static/media/03bda585a99c6450-s.p.32sris142tqlb.woff2", revision: null },
            { url: "/_next/static/media/fba5a26ea33df6a3-s.p.18rizl4rsrl42.woff2", revision: null },
            { url: "/favicon.ico?favicon.0j6rz85rn2xir.ico", revision: null },
        ],
        swSrc: "src/app/sw.js",
        useNativeEsbuild: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    })

