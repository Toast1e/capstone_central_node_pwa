"use client";

import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import theme from "@/theme/themeConfig";
import { ConnectionProvider } from "@/contexts/ConnectionContext"; // Import the connection provider for the current connection state of the application.

export default function Providers({ children }) {
  return (
    <ConfigProvider theme={theme}>
      {/* Wrap the application with the connection Provider to enforce the connection state across the entire application.
      Put the connection provider underneath the config provider and on top of the auth provier, because the connection state is more important than the auth state.
      Since our application has very basic authentication and not a big focus on security, the more important requirement is to be able to get the connection state, because you won't log in if the connection is down. */}
      <ConnectionProvider> 
        <AuthProvider>{children}</AuthProvider>
      </ConnectionProvider>
        </ConfigProvider>
  );
}
