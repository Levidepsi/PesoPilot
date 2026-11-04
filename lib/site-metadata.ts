import type { Metadata } from "next";

const configuredUrl =
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
export const siteUrl = new URL(new URL(configuredUrl).origin);
export const siteDescription =
  "Track income, expenses, inventory and customer credit with PesoPilot. Simple finance tools for small businesses in the Philippines.";
export function pageMetadata(
  title: string,
  description: string,
  path?: string,
): Metadata {
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      title: `${title} | PesoPilot`,
      description,
      siteName: "PesoPilot",
      type: "website",
      locale: "en_PH",
      ...(path ? { url: path } : {}),
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
      title: `${title} | PesoPilot`,
      description,
      images: ["/social-preview.png"],
    },
  };
}
