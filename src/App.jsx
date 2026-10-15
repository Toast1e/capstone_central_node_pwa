import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider } from "antd";
import { ConnectionProvider } from "./contexts/ConnectionContext"; // Fix error here when trying to put on top of the authProvider.

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
