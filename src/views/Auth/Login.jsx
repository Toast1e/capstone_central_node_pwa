"use client";

import { Layout, Checkbox, Card, Form, Input, Button, Typography, Flex, Alert } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import "./Login.css";
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';

export default function Login() {
  const { login, loading } = useAuth();
  const { centralNodeName, centralNodeLoading, centralNodeError } = useSettings();
  const router = useRouter();
  const centralNodeLabel = centralNodeName
    ?? (centralNodeLoading ? "Loading central node…" : "Central node unavailable");

  // No credentials or validation yet - any submit logs you in.
  const onFinish = async () => {
    await login();
    router.push("/home");
  };

  const connectionStatus = centralNodeLoading
    ? { icon: <WifiOutlined />, title: "Checking central-node connection", type: "info" }
    : centralNodeError
      ? { icon: <DisconnectOutlined />, title: "Couldn't connect to the central node", type: "error" }
      : { icon: <WifiOutlined />, title: "Connected to the central node", type: "success" };

  return (

    <Layout className="login-page">
      <Flex vertical align="center" justify="center" gap="large" style={{ minHeight: "100vh" }}>
        <Card>
          {/* Login Form */}
          <Flex vertical gap="small">
            <Form name="login" onFinish={onFinish} autoComplete="off">

              {/* Vitisense Logo */}
              <Form.Item>
              <Flex vertical align="center" justify="center">
                <Typography.Title level={2}>VitiSense</Typography.Title>
                <Typography.Text type="secondary">Mildew early warning system for your vineyards</Typography.Text>
              </Flex>
              </Form.Item>

              {/* Connection Status Alert */}
              <Form.Item>
                <Flex vertical align="center" justify="center" gap="small">
                  <Alert icon={connectionStatus.icon} showIcon title={connectionStatus.title} type={connectionStatus.type} />
                  {centralNodeError && <Alert showIcon title={centralNodeError} type="error" />}
                </Flex>
              </Form.Item>

              {/* Which connection node */}
              <Typography.Title level={4}>{centralNodeLabel}</Typography.Title>

              {/* Password */}
              <Form.Item name="password">
                <Input.Password placeholder="Password" disabled={loading} />
              </Form.Item>

              {/* Remember Me check */}
              <Form.Item name="remember" valuePropName="checked" label={null}>
                <Checkbox>Keep me signed in this phone</Checkbox>
              </Form.Item>

              {/* Buttons */}
              <Flex vertical gap="small">
                <Form.Item>
                  <Button size="large" type="primary" htmlType="submit" block loading={loading}>
                    Login
                  </Button>
                </Form.Item>
              </Flex>


              {/* Section for no connection */}
              <Form.Item>
                <Flex vertical align="center" justify="center">
                  <Typography.Text type="secondary">No Connection?</Typography.Text>
                  <Button size="large" type="link">
                    Open last saved readings
                  </Button>
                </Flex>
              </Form.Item>

            </Form>
          </Flex>

        </Card>
      </Flex>
    </Layout>
  );
}
