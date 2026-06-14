import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

// Public, indexable pages (locale-less). /admin and /api are intentionally
// excluded (also blocked in robots).
const PATHS = [
  "",
  "/vozila",
  "/o-nama",
  "/poslovna-ponuda",
  "/uvjeti-najma",
  "/kontakt",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    // hreflang alternates shared by both locale variants of this page.
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = `${SITE_URL}/${l}${path}`;

    for (const l of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${l}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: { languages },
      });
    }
  }

  return entries;
}
