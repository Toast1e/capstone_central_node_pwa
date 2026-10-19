import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider } from "antd";

import "antd/dist/reset.css";
import "./App.css";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#CD6103",
        },
      }}
    >
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
    </ConfigProvider>
  );
}
