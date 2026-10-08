import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo-provider";
import { Shell } from "@/components/shell";
import { siteName, siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Product Feedback — local demo",
    template: "%s · Product Feedback demo",
  },
  description:
    "Explore a fictional feedback board, roadmap and local edits in this browser. No account or shared data.",
  openGraph: { siteName },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // The head script sets data-theme before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <DemoProvider>
          <Shell>{children}</Shell>
        </DemoProvider>
      </body>
    </html>
  );
}
