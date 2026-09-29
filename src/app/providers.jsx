"use client";

import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import theme from "@/theme/themeConfig";

export default function Providers({ children }) {
  return (
    <ConfigProvider theme={theme}>
        <AuthProvider>{children}</AuthProvider>
    </ConfigProvider>
  );
}
