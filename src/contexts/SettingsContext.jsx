"use client";

// React and NextJS
import {createContext, useContext, useEffect, useState} from "react";

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


const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    // Step 1: Remember settings
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // true if device itself is in dark mode
    const [systemDark, setSystemDark] = useState(false);

    // Step 2: load saved settings/preferences
    useEffect(() => {
        try {
            // localStorage only holds text, so the settings are saved as JSON text and turned back into an object
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            // default first... then save options on top
            if (saved) setSettings({...DEFAULT_SETTINGS, ...saved});
        } catch {
            // storage blocked or the saved text is broken: keep the defaults
        }
    }, []);

    // Step 3: use device's dark mode
    useEffect(() => {
        // asks the browser "is the device in dark mode?"
        const query = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemDark(query.matches); //current answer

        // will listen if device mode changes
        const onChange = (event) => setSystemDark(event.matches);
        query.addEventListener("change", onChange);

        return () => query.removeEventListener("change", onChange);
    }, []);

    //Step 4: change settings
    function updateSetting(key, value) {
        //copy every setting then replace
        const updated = {...settings, [key]: value};
        setSettings(updated); // the app updates immediately
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
            // couldn't save (e.g. storage blocked): the change still applies until browser refresh
        }
    }

    // Step 5: Light or dark mode
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