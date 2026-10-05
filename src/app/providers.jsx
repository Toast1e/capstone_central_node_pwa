"use client";

// UI librariers ant designs
import { ConfigProvider } from "antd";

// our own contexts and theme
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { lightTheme, darkTheme } from "@/theme/themeConfig";

// sits inside SettingsProvider so it can read isDark, then gives antd the light or dark theme
function ThemedApp({ children }) {
    const { isDark } = useSettings();
    return <ConfigProvider theme={isDark ? darkTheme : lightTheme}>{children}</ConfigProvider>;
}

// wraps the whole app, outside to inside: settings -> theme (needs the settings) -> login -> pages
export default function Providers({ children }) {
    return (
        <SettingsProvider>
            <ThemedApp>
                <AuthProvider>{children}</AuthProvider>
            </ThemedApp>
        </SettingsProvider>
    );
}