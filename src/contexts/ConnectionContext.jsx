"use client";

// Component to track the state of the connectivity to the central node.

import { createContext, useContext, useEffect, useState } from "react";
import { API_URL, apiFetch } from "../../lib/api";

const PING_URL = "/";
const PING_INTERVAL_MS = 5000; // wait between next ping from phone to central node.
const PING_TIMEOUT_MS = 3000; // wait for 3 seconds until connection timesout and state gets switched.

// Requests everything Home can display, so the service worker's NetworkFirst rule (sw.js) caches it for offline use.
// The URLs must match Home.jsx exactly (same path, same parameter order), otherwise the cache keys differ and offline misses them.
// Node IDs come from the API, so any number of leaf nodes works.
async function warmCache() {
    try {
        const { leafNodes } = await apiFetch("/api/leafnodes/status");

        const paths = ["/api/alerts", "/api/centralnode"];
        for (const { leafNodeID } of leafNodes) {
            paths.push(
                `/api/history?hours=24&leafNodeID=${leafNodeID}`,  // Home 24h view
                `/api/history?hours=168&leafNodeID=${leafNodeID}`, // Home 7-day view
                `/api/leafnodes/${leafNodeID}/details`,            // Home latest-reading cards
            );
        }

        // failures are ignored: one bad request must not stop the others, and offline there is nothing to warm
        await Promise.allSettled(paths.map((path) => fetch(`${API_URL}${path}`)));
        return true;
    } catch {
        // status call failed (API down or still starting): nothing to warm, the caller retries on the next ping
        return false;
    }
}

// Context creation to hold the current state of the connection.
const ConnectionContext = createContext(null);


// The provider is the component that only has access to the context and can update it. Wraps around the entire app in src/app/providers.jsx.
export function ConnectionProvider({ children }) {
    const [status, setStatus] = useState("connecting");
    const isOnline = status === "connected";

    useEffect(() => {
        let cancelled = false;
        let timer;
        let warmed = false;  // so the cache is only warmed once per connection, not on every ping
        let warming = false; // a warm-up is in flight: don't start a second one

        async function ping() {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
            let reachable = false;

            try {
                const response = await fetch(`${PING_URL}?ping=${Date.now()}`, {
                    method: "HEAD",
                    cache: "no-store",
                    signal: controller.signal,
                });
                reachable = response.ok && response.headers.get("x-vitisense-ping") !== "unreachable";
            } catch {
                reachable = false;
            } finally {
                clearTimeout(timeout);
            }

            if (cancelled) return;
            setStatus(reachable ? "connected" : "disconnected");

            // warmed = the cache was filled since we last (re)connected; stays false until warmCache succeeds, so a failed attempt is retried
            if (!reachable) {
                warmed = false;
            } else if (!warmed && !warming) {
                warming = true;
                warmCache().then((ok) => {
                    warmed = ok;
                    warming = false;
                });
            }

            timer = setTimeout(ping, PING_INTERVAL_MS);
        }

        ping();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };

    }, []);

    return (
        <ConnectionContext.Provider value={{ status, isOnline }}>
            {children}
        </ConnectionContext.Provider>
    );
}

// Function to quickly read from the component. Shortcut to the context. Throws an error if used outside of the provider.
export function useConnection() {
    const ctx = useContext(ConnectionContext);
    if (!ctx) throw new Error("useConnection must be used inside ConnectionProvider");
    return ctx;
}