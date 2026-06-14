import { SITE } from "@/lib/site-config";
import { SITE_URL } from "@/lib/seo";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Only emit real social profiles (the defaults in site-config are placeholders).
function realSocials(): string[] {
  const out: string[] = [];
  for (const url of Object.values(SITE.socials)) {
    try {
      const u = new URL(url);
      // skip bare "facebook.com" / "instagram.com" placeholders (no path)
      if (u.pathname && u.pathname !== "/") out.push(url);
    } catch {
      /* ignore */
    }
  }
  return out;
}

/**
 * Structured data (schema.org AutoRental). Helps Google understand this is a
 * car-rental business with locations, hours and a rating — enabling richer
 * local results. Injected once per page via the locale layout.
 */
export function JsonLd({ locale }: { locale: string }) {
  const sameAs = realSocials();
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#business`,
    name: SITE.name,
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/logo.png`,
    telephone: "+38763660444",
    email: SITE.email,
    priceRange: "€€",
    currenciesAccepted: "BAM, EUR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Potpolje b.b.",
      addressLocality: "Čitluk",
      postalCode: "88260",
      addressCountry: "BA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.map.lat,
      longitude: SITE.map.lng,
    },
    hasMap: SITE.map.link,
    areaServed: [
      "Mostar",
      "Međugorje",
      "Čitluk",
      "Čapljina",
      "Ljubuški",
      "Herzegovina",
    ].map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAYS,
        opens: "07:30",
        closes: "20:30",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating.score.toString(),
      reviewCount: SITE.rating.count.toString(),
      bestRating: "5",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
