"use client";

// React and NextJS
import {createContext, useContext, useEffect, useState} from "react";
import { apiGet, apiPatch } from "@/lib/api";

// ------ App settings ------
// saved on the current device so they survive a refresh
// Central-node information is loaded from the backend; device preferences stay local.

//name settings are saved under in browser's storage
const STORAGE_KEY = "vitisense-settings";

// default settings used until saved settings are loaded
const DEFAULT_SETTINGS = {
    themeMode: "system", // light or dark or system(i.e. match phone settings)
    readingInterval: 5, // minutes between getting new readings
};

const REFRESH_MS = 30000;

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    // Device preferences are local; central-node information comes from the API.
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [centralNode, setCentralNode] = useState(null);
    const [centralNodeLoading, setCentralNodeLoading] = useState(true);
    const [centralNodeError, setCentralNodeError] = useState(null);
    const [centralNodeSaving, setCentralNodeSaving] = useState(false);

    // true if device itself is in dark mode
    const [systemDark, setSystemDark] = useState(false);

    // Load only device preferences from local storage.
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved) {
                setSettings({
                    themeMode: saved.themeMode ?? DEFAULT_SETTINGS.themeMode,
                    readingInterval: saved.readingInterval ?? DEFAULT_SETTINGS.readingInterval,
                });
            }
        } catch {
            // storage blocked or the saved text is broken: keep the defaults
        }
    }, []);

    // Load and refresh the central-node record shared by all pages.
    useEffect(() => {
        let cancelled = false;

        async function loadCentralNode() {
            try {
                const node = await apiGet("/api/centralnode");
                if (typeof node.name !== "string" || !node.name.trim()) {
                    throw new Error("The central-node API returned no name.");
                }
                if (cancelled) return;
                setCentralNode(node);
                setCentralNodeError(null);
            } catch (err) {
                if (!cancelled) setCentralNodeError(err.message);
            } finally {
                if (!cancelled) setCentralNodeLoading(false);
            }
        }

        loadCentralNode();
        const timer = setInterval(loadCentralNode, REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, []);

    // Follow the device's dark-mode setting.
    useEffect(() => {
        const query = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemDark(query.matches);

        const onChange = (event) => setSystemDark(event.matches);
        query.addEventListener("change", onChange);

        return () => query.removeEventListener("change", onChange);
    }, []);

    // Update a device-only preference.
    function updateSetting(key, value) {
        const updated = {...settings, [key]: value};
        setSettings(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
            // The preference remains active until the page is refreshed.
        }
    }

    async function updateCentralNodeName(name) {
        setCentralNodeSaving(true);
        setCentralNodeError(null);
        try {
            const updated = await apiPatch("/api/centralnode", { name });
            setCentralNode((current) => ({
                ...current,
                ...updated,
            }));
            return updated;
        } catch (err) {
            setCentralNodeError(err.message);
            throw err;
        } finally {
            setCentralNodeSaving(false);
        }
    }

    const isDark = settings.themeMode === "dark" || (settings.themeMode === "system" && systemDark);

    useEffect(() => {
        document.documentElement.dataset.theme = isDark ? "dark" : "light";
    }, [isDark]);

    return (
        <SettingsContext.Provider value={{
            ...settings,
            centralNode,
            centralNodeID: centralNode?.centralNodeID ?? null,
            centralNodeName: centralNode?.name ?? null,
            centralNodeDescription: centralNode?.description ?? null,
            centralNodeLoading,
            centralNodeError,
            centralNodeSaving,
            isDark,
            updateSetting,
            updateCentralNodeName,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

// Use this to read shared central-node data or device preferences.
export function useSettings() {
    return useContext(SettingsContext);
}