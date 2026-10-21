"use client";

// React and NextJS
import {createContext, useContext, useEffect, useSyncExternalStore} from "react";

// ------ App settings ------
// saved on the current device so they survive a refresh
// TODO save username and readingInterval to backend

//name settings are saved under in browser's storage
const STORAGE_KEY = "vitisense-settings";

// default settings used until saved settings are loaded
const DEFAULT_SETTINGS = {
    username: "Central Node 1",
    themeMode: "system", // light or dark or system(i.e. match phone settings)
    readingInterval: 15, // minutes between getting new readings
};

// --- saved settings: the text stored in localStorage ---

// components to tell when the settings are saved
const settingsListeners = new Set();

// used instead of localStorage if the browser blocks it (e.g. private browsing)
let blockedStorageText = null;

function subscribeToSettings(listener) {
    settingsListeners.add(listener);
    return () => settingsListeners.delete(listener); // clean-up: stop telling this one
}

// the saved text, or null if nothing has been saved yet
function readSettingsText() {
    if (blockedStorageText !== null) return blockedStorageText;
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null; // storage blocked: nothing saved
    }
}

function saveSettingsText(text) {
    try {
        localStorage.setItem(STORAGE_KEY, text);
    } catch {
        blockedStorageText = text; // couldn't save (e.g. private browsing): keep it until refresh
    }
    settingsListeners.forEach((listener) => listener()); // tell React the settings changed
}

// localStorage only holds text: turn it back into settings, defaults first then saved values on top
function parseSettings(text) {
    if (!text) return DEFAULT_SETTINGS;
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(text) };
    } catch {
        return DEFAULT_SETTINGS; // the saved text is broken: keep the defaults
    }
}

// --- the device's dark mode ---

const DARK_QUERY = "(prefers-color-scheme: dark)";

// the browser tells us when the device switches between light and dark
function subscribeToDeviceDark(listener) {
    const query = window.matchMedia(DARK_QUERY);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
}

// asks the browser "is the device in dark mode?"
function readDeviceDark() {
    return window.matchMedia(DARK_QUERY).matches;
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    // Step 1: the saved settings (the server assumes nothing is saved)
    const settingsText = useSyncExternalStore(subscribeToSettings, readSettingsText, () => null);
    const settings = parseSettings(settingsText);

    // Step 2: true if the device itself is in dark mode (the server assumes light)
    const systemDark = useSyncExternalStore(subscribeToDeviceDark, readDeviceDark, () => false);

    // Step 3: change one setting and save them all; saving tells React, which redraws the app
    function updateSetting(key, value) {
        saveSettingsText(JSON.stringify({ ...settings, [key]: value }));
    }

    // Step 4: Light or dark mode
    const isDark = settings.themeMode === "dark" || (settings.themeMode === "system" && systemDark);

    // puts data-theme="dark" or "light" on the <html> tag, so globals.css can colour the page background to match
    useEffect(() => {
        document.documentElement.dataset.theme = isDark ? "dark" : "light";
    }, [isDark]);

    return (
        <SettingsContext.Provider value={{ ...settings, isDark, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

// use this in any component to read or change the settings example const { username, isDark, updateSetting } = useSettings();
export function useSettings() {
    return useContext(SettingsContext);
}