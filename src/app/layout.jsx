import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";

import "./globals.css";

export const metadata = {
  title: "Central Node",
  description: "Central Node progressive web app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* `layer` puts Ant Design's styles in @layer antd (see globals.css),
            so our own CSS files always win over its defaults. */}
        <AntdRegistry layer>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
