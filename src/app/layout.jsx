import { AntdRegistry } from "@ant-design/nextjs-registry";
import {Plus_Jakarta_Sans, Fraunces} from "next/font/google"; //font import
import Providers from "./providers";

import "./globals.css";

// loads the font  --font-jakarta for the theme
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
//serif font for headings
const fraunces = Fraunces({subsets: ["latin"], variable: "--font-fraunce" });

export const metadata = {
  title: "Central Node",
  description: "Central Node progressive web app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
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
