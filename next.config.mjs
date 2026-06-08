import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage (car photos)
      { protocol: "https", hostname: "*.supabase.co" },
      // YouTube thumbnails (hero fallback)
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
