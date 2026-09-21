"use client";

import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#CD6103",
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </ConfigProvider>
  );
}
