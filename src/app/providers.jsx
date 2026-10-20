"use client";

// UI libraries Ant design
import { ConfigProvider } from "antd";
import { SerwistProvider } from "@serwist/turbopack/react";

// our own contexts and theme
import { AuthProvider } from "@/contexts/AuthContext";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { lightTheme, darkTheme } from "@/theme/themeConfig";

// sits inside SettingsProvider so it can read isDark, then gives antd the light or dark theme
function ThemedApp({ children }) {
    const { isDark } = useSettings();
    return <ConfigProvider theme={isDark ? darkTheme : lightTheme}>{children}</ConfigProvider>;
}

// wraps the whole app, outside to inside: service worker -> settings -> theme (needs the settings) -> connection -> login -> pages
// reloadOnOnline is off so getting Wi-Fi back doesn't reload the page and throw away what the user was doing
export default function Providers({ children }) {
    return (
        <SerwistProvider swUrl="/sw.js" reloadOnOnline={false}>
            <SettingsProvider>
                <ThemedApp>
                    <ConnectionProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </ConnectionProvider>
                </ThemedApp>
            </SettingsProvider>
        </SerwistProvider>
    );
}
