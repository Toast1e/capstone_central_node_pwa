"use client";

import { Layout, Card, Form, Input, Button } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();

  // No credentials or validation yet - any submit logs you in.
  const onFinish = async () => {
    await login();
    router.push("/home");
  };

  return (
    <Layout className="login-page">
      <Card
        title={
          <div className="logo-holder">
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: "8px" }}>
              Central Node
            </div>
            <div>Login</div>
          </div>
        }
        style={{ width: 300 }}
      >
        <Form name="login" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username">
            <Input placeholder="Username or Email" disabled={loading} />
          </Form.Item>
          <Form.Item name="password">
            <Input.Password placeholder="Password" disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
}
