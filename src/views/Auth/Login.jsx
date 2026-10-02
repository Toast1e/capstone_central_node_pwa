"use client";

import { Layout, Checkbox, Card, Form, Input, Button, Typography, Flex, Alert, Switch } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useConnection } from "@/contexts/ConnectionContext";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const { status, setStatus, isOnline } = useConnection();

  // No credentials or validation yet - any submit logs you in.
  const onFinish = async () => {
    await login();
    router.push("/home");
  };

  const connectionStatus = {
    connected: {
      icon: <WifiOutlined />,
      title: "Connected to local vineyard hotspot",
      type: "success",
    },
    disconnected: {
      icon: <DisconnectOutlined />,
      title: "Not connected to local vineyard hotspot",
      type: "error",
    },
  }

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
                  <Alert icon={connectionStatus[status].icon} showIcon title={connectionStatus[status].title} type={connectionStatus[status].type} />
                </Flex>
              </Form.Item>

              {/* Which connection node */}
              <Typography.Title level={4}>Central Node 1</Typography.Title>

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
                  <Button size="large" type="primary" htmlType="submit" block loading={loading} disabled={!isOnline}>
                    Login
                  </Button>
                </Form.Item>
              </Flex>


              {/* Section for no connection */}
              <Form.Item>
                <Flex vertical align="center" justify="center">
                  <Typography.Text type="secondary">No Connection?</Typography.Text>
                  <Button size="large" type="link" onClick={() => router.push("/home")} disabled={isOnline}>
                    Open last saved readings
                  </Button>
                </Flex>
              </Form.Item>

              <Form.Item>
                <Flex gap={"5pt"}>
                  <Switch
                    checked={isOnline}
                    onChange={(on) => { setStatus(on ? "connected" : "disconnected"); }}
                    checkedChildren="Live"
                    unCheckedChildren="Offline"
                  />
                </Flex>
              </Form.Item>

            </Form>
          </Flex>

        </Card>
      </Flex>
    </Layout>
  );
}
