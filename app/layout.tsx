import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { DemoProvider } from "@/components/demo-provider";
import { Shell } from "@/components/shell";
import { siteName, siteUrl, webSiteJsonLd } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "./globals.css";
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jost",
  display: "swap",
});
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
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fd" },
    { media: "(prefers-color-scheme: dark)", color: "#141726" },
  ],
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // The head script sets data-theme before React hydrates.
    <html lang="en" className={jost.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {/* One WebSite identity on every route, matching og:site_name. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <DemoProvider>
          <Shell>{children}</Shell>
        </DemoProvider>
      </body>
    </html>
  );
}
