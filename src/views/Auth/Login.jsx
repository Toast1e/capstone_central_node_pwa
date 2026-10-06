"use client";

import { Layout, Checkbox, Card, Form, Input, Button, Typography, Flex, Alert } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useState } from "react";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);

  

  const onFinish = async ({password,remember}) => {
    setError(null);
    const result = await login(password, remember);
    if (result.success) {
      router.push("/home");
    } else {
      setError(result.error);
    }
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
                  <Alert icon={connectionStatus.connected.icon} showIcon title={connectionStatus.connected.title} type={connectionStatus.connected.type} />
                </Flex>
              </Form.Item>

              {/* Which connection node */}
              <Typography.Title level={4}>Central Node 1</Typography.Title>

              {/* Password */}
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Enter your password" }]}
                validateStatus={error ? "error" : undefined}
                help={error}
              >
                <Input.Password
                  placeholder="Password"
                  disabled={loading}
                  onChange={() => setError(null)}
                />
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
