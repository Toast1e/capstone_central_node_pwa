"use client";

import { Layout, Card, Form, Input, Button } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

let connectedNode = "Central node 1";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();

  // No credentials or validation yet - any submit logs you in.
  const onFinish = async () => {
    await login();
    router.push("/overview");
  };

  return (
    <Layout className="login-page">
      <Card
        title={
          <div className="logo-holder">
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: "8px" }}>
              VitiSense
            </div>
            <div>Mildew early warning system</div>
          </div>
        }
        style={{ width: 300 }}
      >
        <div style={{ fontSize: 20, fontWeight: 600}}>Central node</div>
        <div style={{ fontSize: 16, fontWeight: 400, marginBottom: "20px" }}>{connectedNode}</div>

        <Form name="login" onFinish={onFinish} autoComplete="off">
          <Form.Item name="password">
            <Input.Password placeholder="Password" disabled={loading} />
          </Form.Item>

          <div className="checkboxCentering" style={{ marginBottom: "20px" }}>
            <input type="checkbox" name="signInAgain" />
            <label htmlFor="signInAgain"> Keep me signed in on this phone</label>
          </div>

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
