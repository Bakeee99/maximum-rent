// Filterable vehicle categories. Mirrors the Prisma `CarCategory` enum.
// A car can have several (e.g. a luxury sedan = ["LIMUZINA", "LUXURY"]).

export const CAR_CATEGORIES = [
  "LIMUZINA",
  "LUXURY",
  "SUV",
  "COUPE",
  "COMPACT",
  "KARAVAN",
  "CABRIO",
  "TRANSPORT",
  "MINIBUS",
] as const;

export type CarCategory = (typeof CAR_CATEGORIES)[number];

// Fallback: map a car's single `carClass` to a sensible category so filters
// work out of the box for cars that haven't been tagged with explicit
// `categories` yet. Explicit categories always take precedence.
const CLASS_TO_CATEGORY: Record<string, CarCategory> = {
  CITY_CAR: "COMPACT",
  ECONOMY: "COMPACT",
  COMPACT: "COMPACT",
  MIDSIZE: "LIMUZINA",
  FULLSIZE: "LIMUZINA",
  LUXURY: "LUXURY",
  SUV: "SUV",
  VAN: "TRANSPORT",
  MINIBUS: "MINIBUS",
};

/** Effective categories for a car: explicit `categories` if present,
 *  otherwise a single derived one from `carClass`. */
export function carCategories(car: {
  categories?: string[] | null;
  carClass: string;
}): CarCategory[] {
  if (car.categories && car.categories.length > 0) {
    return car.categories.filter((c): c is CarCategory =>
      (CAR_CATEGORIES as readonly string[]).includes(c),
    );
  }
  const derived = CLASS_TO_CATEGORY[car.carClass];
  return derived ? [derived] : [];
}
