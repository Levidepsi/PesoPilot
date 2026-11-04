import type { Metadata, Viewport } from "next";
import { siteUrl, siteDescription } from "@/lib/site-metadata";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "PesoPilot | Small Business Finance",
    template: "%s | PesoPilot",
  },
  description: siteDescription,
  applicationName: "PesoPilot",
  category: "business",
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
  openGraph: {
    title: "PesoPilot | Small Business Finance",
    description: siteDescription,
    type: "website",
    siteName: "PesoPilot",
    locale: "en_PH",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "PesoPilot — clarity for your everyday business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PesoPilot | Small Business Finance",
    description: siteDescription,
    images: ["/social-preview.png"],
  },
};
export const viewport: Viewport = {
  themeColor: "#173e31",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
