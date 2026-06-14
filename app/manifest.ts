import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Maximum Rent",
    description: "Premium najam vozila u Hercegovini / Premium car rental in Herzegovina.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#E30613",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
