"use client";

// Component to track the state of the connectivity to the local vineyard hotspot. This is used to display the connection status in the login page and the top app bar.
// CURRENTLY USED FOR SIMULATION PRACTICES, BUT CAN EASILY BE EXTENDED WITH THE OFFLINE FUNCTIONALITY IN THE NEAR FUTURE TICKETS.

import { createContext, useContext, useState } from "react";


// Context
const ConnectionContext = createContext(null);


// Provider
export function ConnectionProvider({ children }) {
    const [status, setStatus] = useState("connected");
    const isOnline = status === "connected";

    return (
        <ConnectionContext.Provider value={{ status, setStatus, isOnline }}>
            {children}
        </ConnectionContext.Provider>
    );
}

// Function to quickly read from the component.
export function useConnection() {
    const ctx = useContext(ConnectionContext);
    if (!ctx) throw new Error("useConnection must be used inside ConnectionProvider");
    return ctx;
}