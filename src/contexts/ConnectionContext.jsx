"use client";

// Component to track the state of the connectivity to the local vineyard hotspot. This is simulates the connection across the entire PWA.
// CURRENTLY USED FOR SIMULATION PRACTICES, BUT CAN EASILY BE EXTENDED WITH THE OFFLINE FUNCTIONALITY IN THE NEAR FUTURE TICKETS.

import { createContext, useContext, useState } from "react";


// Context creation to hold the current state of the connection.
const ConnectionContext = createContext(null);


// The provider is the component that only has access to the context and can update it. Wraps around the entire app in src/app/providers.jsx.
export function ConnectionProvider({ children }) {
    const [status, setStatus] = useState("connected");
    const isOnline = status === "connected";

    return (
        <ConnectionContext.Provider value={{ status, setStatus, isOnline }}>
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