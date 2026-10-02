"use client";

import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import theme from "@/theme/themeConfig";
import { ConnectionProvider } from "@/contexts/ConnectionContext";

export default function Providers({ children }) {
  return (
    <ConfigProvider theme={theme}>
      <ConnectionProvider>
        <AuthProvider>{children}</AuthProvider>
      </ConnectionProvider>
        </ConfigProvider>
  );
}
