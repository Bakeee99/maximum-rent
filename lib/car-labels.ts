import type { Car } from "@prisma/client";
import type { AppLocale } from "@/i18n/routing";

type Label = Record<AppLocale, string>;

export const CLASS_LABELS: Record<Car["carClass"], Label> = {
  CITY_CAR: { hr: "City car", en: "City car" },
  ECONOMY: { hr: "Ekonomična", en: "Economy" },
  COMPACT: { hr: "Kompaktna", en: "Compact" },
  MIDSIZE: { hr: "Srednja klasa", en: "Midsize" },
  FULLSIZE: { hr: "Velika klasa", en: "Full-size" },
  LUXURY: { hr: "Luksuzna", en: "Luxury" },
  SUV: { hr: "SUV", en: "SUV" },
  VAN: { hr: "Kombi", en: "Van" },
  MINIBUS: { hr: "Minibus", en: "Minibus" },
};

export const TRANSMISSION_LABELS: Record<Car["transmission"], Label> = {
  MANUAL: { hr: "Manualni", en: "Manual" },
  AUTOMATIC: { hr: "Automatik", en: "Automatic" },
};

export const FUEL_LABELS: Record<Car["fuelType"], Label> = {
  PETROL: { hr: "Benzin", en: "Petrol" },
  DIESEL: { hr: "Dizel", en: "Diesel" },
  HYBRID: { hr: "Hibrid", en: "Hybrid" },
  PLUG_IN_HYBRID: { hr: "Plug-in hibrid", en: "Plug-in hybrid" },
  ELECTRIC: { hr: "Električni", en: "Electric" },
};

export function label(map: Label, locale: AppLocale): string {
  return map[locale] ?? map.hr;
}
