"use client";

import { Layout, Flex, Button, Typography, Alert } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { RiHome5Line, RiUserLine, RiNotification2Line, RiCpuLine, RiExportLine } from "@remixicon/react";
import "./MainLayout.css";
import {useSettings} from "../contexts/SettingsContext";

const { Text } = Typography;
const { Header, Content, Footer } = Layout;

// Add an entry here (plus a page under src/app/(main)/) to extend the app bar.
const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/home", icon: <RiHome5Line /> },
  { key: "alerts", label: "Alerts", path: "/alerts", icon: <RiNotification2Line /> },
  { key: "nodes", label: "Nodes", path: "/nodes", icon: <RiCpuLine /> },
  { key: "export", label: "Export", path: "/export", icon: <RiExportLine /> },
  { key: "profile", label: "Profile", path: "/profile", icon: <RiUserLine /> },
];

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // the central node's name from the Profile page settings
  const { centralNodeName, centralNodeLoading, centralNodeError } = useSettings();
  const centralNodeLabel = centralNodeName
    ?? (centralNodeLoading ? "Loading central node…" : "Central node unavailable");
  let isOnline = true;

  return (
    <Layout className="layout">
      {/* Top app bar */}
      <Header className="top-app-bar" color={isOnline ? "primary" : "default"}>
        <Flex align="center" className="top-app-bar-items" justify="space-between">
          <Flex gap={"5pt"}>
            <Text strong className="textSize">
              {centralNodeLabel} |
            </Text>

            <Text type={isOnline ? "success" : "warning"} strong className="textSize">
              {isOnline ? "Live" : "Offline"}
            </Text>
          </Flex>

          <Text strong className="textSize">
            {NAV_ITEMS.find(options => options.path == pathname).label}
          </Text>
        </Flex>
      </Header>

      <Content className="content">
        {centralNodeError && (
          <Alert
            type="error"
            showIcon
            title="Couldn't load central-node information"
            description={centralNodeError}
            style={{ marginBottom: 16 }}
          />
        )}
        {children}
      </Content>

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
