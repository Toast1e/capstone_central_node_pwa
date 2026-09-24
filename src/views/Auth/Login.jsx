"use client";

import { Layout, Checkbox, Card, Form, Input, Button } from "antd";
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
              VitiSense
            </div>
            <div>Login</div>
          </div>
        }
        style={{ width: 300 }}
      >
        <Form name="login" onFinish={onFinish} autoComplete="off">

          <Card style={{ justifyContent: "center", alignItems: "center", marginBottom: "16px", backgroundColor: "lightgreen" }}>
            {/* Add wifi logo later on */}
            <p>Connected to local vineyard hotspot</p>
          </Card>

          <h1>Central Node 1</h1>

          <Form.Item name="password">
            <Input.Password placeholder="Password" disabled={loading} />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" label={null}>
            <Checkbox>Keep me signed in this phone</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
            <br />
            No Connection?
            <br />
            <a href="">Open Last saved readings</a>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
}
