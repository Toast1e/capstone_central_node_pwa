"use client";

import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import theme from "@/theme/themeConfig";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { SerwistProvider } from "@serwist/turbopack/react";

export default function Providers({ children }) {
  return (
    <SerwistProvider swUrl="/sw.js">
      <ConfigProvider theme={theme}>
        <ConnectionProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConnectionProvider>
      </ConfigProvider>
    </SerwistProvider>
  );
}
