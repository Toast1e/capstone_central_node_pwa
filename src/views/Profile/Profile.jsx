"use client";

import { Typography, Card, Avatar, Descriptions, Button, Flex } from "antd";
import { useRouter } from "next/navigation";
import { RiUserLine, RiLogoutBoxRLine } from "@remixicon/react";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Paragraph } = Typography;

// Example page only - it exists to demonstrate navigating with the app bar.
export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const username = user?.username ?? "guest";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Flex vertical gap="large">
      <div>
        <Title level={2}>Profile</Title>
        <Paragraph type="secondary">
          Example second page. Use the app bar at the bottom to move between
          pages.
        </Paragraph>
      </div>

      <Card>
        <Flex vertical align="center" gap="middle">
          <Avatar size={72} icon={<RiUserLine />} />
          <Title level={4} style={{ margin: 0 }}>
            {username}
          </Title>
        </Flex>
        <Descriptions
          column={1}
          style={{ marginTop: 24 }}
          items={[
            { key: "username", label: "Username", children: username },
            { key: "status", label: "Status", children: "Example account" },
          ]}
        />
      </Card>

      <Button danger block icon={<RiLogoutBoxRLine />} onClick={handleLogout}>
        Log out
      </Button>
    </Flex>
  );
}
