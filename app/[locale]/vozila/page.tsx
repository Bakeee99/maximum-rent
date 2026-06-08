import { getTranslations, setRequestLocale } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { toCarListItem, type SearchContext } from "@/lib/types";
import { ReservationSearchForm } from "@/components/reservation/ReservationSearchForm";
import { ReservationSummary } from "@/components/reservation/ReservationSummary";
import { FleetGrid } from "@/components/fleet/FleetGrid";

type RawSearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isValidISO(value?: string): value is string {
  return !!value && !Number.isNaN(Date.parse(value));
}

export default async function VehiclesPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: RawSearchParams;
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Fleet");

  const pickupLocationId = one(searchParams.pickupLocationId);
  const returnLocationId = one(searchParams.returnLocationId);
  const pickupAtRaw = one(searchParams.pickupAt);
  const returnAtRaw = one(searchParams.returnAt);

  const [cars, locations] = await Promise.all([
    prisma.car.findMany({
      where: { isAvailable: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, city: true },
    }),
  ]);

  const byId = new Map(locations.map((l) => [l.id, l]));
  const pickupLocation = pickupLocationId ? byId.get(pickupLocationId) : null;
  const returnLocation = returnLocationId ? byId.get(returnLocationId) : null;

  const hasDates = isValidISO(pickupAtRaw) && isValidISO(returnAtRaw);

  const search: SearchContext = {
    pickupLocationId,
    returnLocationId,
    pickupLocation: pickupLocation ? { name: pickupLocation.name } : null,
    returnLocation: returnLocation ? { name: returnLocation.name } : null,
    pickupAt: hasDates ? pickupAtRaw : null,
    returnAt: hasDates ? returnAtRaw : null,
  };

  const items = cars.map(toCarListItem);
  const heading = hasDates ? t("resultsTitle") : t("allVehicles");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ReservationSearchForm locations={locations} />

      {hasDates && (
        <div className="mt-8">
          <ReservationSummary
            pickupAt={pickupAtRaw}
            returnAt={returnAtRaw}
            pickupName={pickupLocation?.name}
            returnName={returnLocation?.name}
          />
        </div>
      )}

      <div className="mb-8 mt-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {items.length > 0 ? (
        <FleetGrid cars={items} search={search} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted-foreground">
          {t("noResults")}
        </p>
      )}
    </div>
  );
}
