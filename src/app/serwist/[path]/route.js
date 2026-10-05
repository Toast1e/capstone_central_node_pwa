import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// new label for version control of pages. Always re-downloads after each new rebuild.
const revision = crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
createSerwistRoute({
    additionalPrecacheEntries: [
        {url: "/", revision},
        {url: "/login", revision},
        {url: "/home", revision},
        {url: "/profile", revision},
    ],
    swSrc: "src/app/sw.js",
    useNativeEsbuild: true,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
})

