"use client";

import { Layout, Flex, Button } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { RiHome5Line, RiNotificationLine, RiCpuLine, RiDownload2Line, RiLogoutBoxRLine } from "@remixicon/react";
import "./MainLayout.css";
import { useAuth } from "../contexts/AuthContext";

const { Content, Footer } = Layout;

// Add an entry here (plus a page under src/app/(main)/) to extend the app bar.
const NAV_ITEMS = [
  { key: "Overview", label: "Overview", path: "/overview", icon: <RiHome5Line /> },
  { key: "Alerts", label: "Alerts", path: "/alerts", icon: <RiNotificationLine /> },
  { key: "Nodes", label: "Nodes", path: "/nodes", icon: <RiCpuLine /> },
  { key: "Export", label: "Export", path: "/export", icon: <RiDownload2Line /> }
];

let isLive = true;

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Layout className="layout">
      <Content className="content">{children}</Content>

      {/* Top app bar */}
      <header className="top-app-bar">
          <div style={{ fontSize: 32, fontWeight: 600, marginBottom: "4px", width: "90%" }} className="top-app-block">
            Central node 1: {isLive ? "Online" : "Offline"}
          </div>
          <Button style={{ width: "10%" }} danger block icon={<RiLogoutBoxRLine />} onClick={handleLogout}>
            Log out
          </Button>
      </header>

      {/* Bottom app bar */}
      <Footer className="bottom-app-bar">
        <Flex
          component="nav"
          aria-label="Main navigation"
          justify="space-around"
          align="center"
          className="app-bar-items"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <Button
                key={item.key}
                className="app-bar-button"
                variant="text"
                color={active ? "primary" : "default"}
                icon={item.icon}
                aria-current={active ? "page" : undefined}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </Button>
            );
          })}
        </Flex>
      </Footer>
    </Layout>
  );
}
