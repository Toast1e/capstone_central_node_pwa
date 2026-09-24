"use client";

import { Layout, Flex, Button } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { RiHome5Line, RiUserLine } from "@remixicon/react";
import "./MainLayout.css";

const { Content, Footer } = Layout;

// Add an entry here (plus a page under src/app/(main)/) to extend the app bar.
const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/home", icon: <RiHome5Line /> },
  { key: "profile", label: "Profile", path: "/profile", icon: <RiUserLine /> },
];

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Layout className="layout">
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
          <Button> Press me Toast Man</Button>
        </Flex>
      </Footer>
    </Layout>
  );
}
