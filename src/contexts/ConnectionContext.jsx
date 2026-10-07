"use client";

// Component to track the state of the connectivity to the central node.

import { createContext, useContext, useEffect, useState } from "react";

const PING_URL = "/";
const PING_INTERVAL_MS = 5000; // wait between next ping from phone to central node.
const PING_TIMEOUT_MS = 3000; // wait for 3 seconds until connection timesout and state gets switched.

// Context creation to hold the current state of the connection.
const ConnectionContext = createContext(null);


// The provider is the component that only has access to the context and can update it. Wraps around the entire app in src/app/providers.jsx.
export function ConnectionProvider({ children }) {
    const [status, setStatus] = useState("connecting");
    const isOnline = status === "connected";

    useEffect(() => {
        let cancelled = false;
        let timer;

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