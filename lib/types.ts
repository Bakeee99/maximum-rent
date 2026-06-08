import type { Car } from "@prisma/client";

/**
 * Prisma `Decimal` cannot be passed from a Server Component into a Client
 * Component. We convert price fields to plain numbers before crossing the
 * boundary; everything else (enums, Date) serializes fine.
 */
export type CarListItem = Omit<Car, "pricePerDay" | "deposit"> & {
  pricePerDay: number | null;
  deposit: number | null;
};

export function toCarListItem(car: Car): CarListItem {
  return {
    ...car,
    pricePerDay: car.pricePerDay != null ? Number(car.pricePerDay) : null,
    deposit: car.deposit != null ? Number(car.deposit) : null,
  };
}

/** Shared shape for passing the active search down to cards / modal. */
export type SearchContext = {
  pickupLocationId?: string;
  returnLocationId?: string;
  pickupLocation?: { name: string } | null;
  returnLocation?: { name: string } | null;
  pickupAt?: string | null;
  returnAt?: string | null;
};
