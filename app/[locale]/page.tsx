import { getTranslations, setRequestLocale } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { toCarListItem } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { WhyChoose } from "@/components/home/WhyChoose";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Locations } from "@/components/home/Locations";
import { Reviews } from "@/components/home/Reviews";
import { BusinessTeaser } from "@/components/home/BusinessTeaser";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { ReservationSearchForm } from "@/components/reservation/ReservationSearchForm";
import { FleetGrid } from "@/components/fleet/FleetGrid";

// Re-fetch featured fleet at most every 5 minutes (ISR) so new cars added in
// Prisma Studio appear without a redeploy, while keeping the page static-fast.
export const revalidate = 300;

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Fleet");

  const [locations, featured] = await Promise.all([
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, city: true },
    }),
    prisma.car.findMany({
      where: { isAvailable: true, isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
  ]);

  const cars = featured.map(toCarListItem);

  return (
    <>
      <Hero />

      {/* Search — pulled up to overlap the hero edge */}
      <section
        id="rezervacija"
        className="relative z-10 mx-auto -mt-20 w-full max-w-6xl scroll-mt-24 px-4 sm:-mt-24 sm:px-6"
      >
        <ReservationSearchForm locations={locations} />
      </section>

      <WhyChoose />

      <HowItWorks />

      {/* Featured fleet */}
      {cars.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-7 bg-brand" />
              {t("title")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("subtitle")}
            </h2>
          </div>
          <FleetGrid cars={cars} />
        </section>
      )}

      <Locations />

      <Reviews />

      <BusinessTeaser />

      <Faq />

      <FinalCta />
    </>
  );
}
