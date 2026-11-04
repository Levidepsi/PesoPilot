import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL("/pricing", siteUrl).href }];
}
