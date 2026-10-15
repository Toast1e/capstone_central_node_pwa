"use client";

import { Layout, Flex, Button, Typography, Switch } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { RiHome5Line, RiUserLine, RiNotification2Line, RiCpuLine, RiExportLine } from "@remixicon/react";
import "./MainLayout.css";
import {useSettings} from "../contexts/SettingsContext";
import { useConnection } from "@/contexts/ConnectionContext";

const { Text } = Typography;
const { Header, Content, Footer } = Layout;

const STATUS_DISPLAY = {
  connecting: { label: "Connecting…", type: "secondary" },
  connected: { label: "Live", type: "success" },
  disconnected: { label: "Offline", type: "warning" },
}

// Add an entry here (plus a page under src/app/(main)/) to extend the app bar.
const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/home", icon: <RiHome5Line />, worksOffline: true },
  { key: "alerts", label: "Alerts", path: "/alerts", icon: <RiNotification2Line />, worksOffline: false },
  { key: "nodes", label: "Nodes", path: "/nodes", icon: <RiCpuLine />, worksOffline: false },
  { key: "export", label: "Export", path: "/export", icon: <RiExportLine />, worksOffline: false },
  { key: "profile", label: "Profile", path: "/profile", icon: <RiUserLine />, worksOffline: true },
];

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // the central node's name from the Profile page settings
  const { username: centralNode } = useSettings();
  const { status, isOnline } = useConnection();
  const display = STATUS_DISPLAY[status];

  return (
    <Layout className="layout">
      {/* Top app bar */}
      <Header className="top-app-bar" color={isOnline ? "primary" : "default"}>
        <Flex align="center" className="top-app-bar-items" justify="space-between">
          <Flex gap={"5pt"}>
            <Text strong className="textSize">
              {centralNode} |
            </Text>

            <Text type={ display.type } strong className="textSize">
              { display.label }
            </Text>
          </Flex>

          <Text strong className="textSize">
            {NAV_ITEMS.find(options => options.path == pathname).label}
          </Text>

        </Flex>
      </Header>

      <Content className="content">{children}</Content>

      {/* Bottom app bar */}
      <Footer className="app-bar">
        <Flex
          component="nav"
          aria-label="Main navigation"
          justify="space-around"
          align="center"
          className="app-bar-items"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.path);
            const disabled = status === "connecting" || (status === "disconnected" && !item.worksOffline);
            return (
              <Button
                key={item.key}
                className="app-bar-button"
                variant="text"
                color={active ? "primary" : "default"}
                icon={item.icon}
                aria-current={active ? "page" : undefined}
                disabled={disabled}
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
