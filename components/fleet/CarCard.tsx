"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Car as CarIcon, ChevronRight, Cog, Fuel, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import {
  CLASS_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  label,
} from "@/lib/car-labels";
import { buildWhatsAppUrl, type InquiryContext } from "@/lib/whatsapp";
import type { CarListItem, SearchContext } from "@/lib/types";
import { CarGallery } from "./CarGallery";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  car: CarListItem;
  search?: SearchContext;
  onSelect?: (car: CarListItem) => void;
  index?: number;
};

export function CarCard({ car, search, onSelect, index = 0 }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Fleet");
  const common = useTranslations("Common");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const images = car.images ?? [];

  const inquiry: InquiryContext = {
    car: { title: car.title },
    pickupLocation: search?.pickupLocation,
    returnLocation: search?.returnLocation,
    pickupAt: search?.pickupAt,
    returnAt: search?.returnAt,
    locale,
  };
  const whatsappUrl = buildWhatsAppUrl(inquiry);

  const specs = [
    { icon: CarIcon, value: label(CLASS_LABELS[car.carClass], locale) },
    { icon: Calendar, value: String(car.year) },
    { icon: Cog, value: label(TRANSMISSION_LABELS[car.transmission], locale) },
    { icon: Users, value: String(car.passengers) },
    {
      icon: Fuel,
      value: [label(FUEL_LABELS[car.fuelType], locale), car.emissionClass]
        .filter(Boolean)
        .join(" · "),
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <span className="absolute left-4 top-4 z-10 rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-foreground shadow-brand">
        {label(CLASS_LABELS[car.carClass], locale)}
      </span>

      <CarGallery images={images} title={car.title} onOpen={setLightbox} />

      <ImageLightbox
        images={images}
        title={car.title}
        openIndex={lightbox}
        onClose={() => setLightbox(null)}
      />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">
            {car.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {car.brand} {car.model}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <spec.icon className="h-4 w-4 shrink-0 text-brand" />
              <dd className="truncate text-sm font-medium text-foreground">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>

        {car.pricePerDay != null && (
          <p className="text-sm text-muted-foreground">
            {common("from")}{" "}
            <span className="text-base font-semibold text-foreground">
              {car.pricePerDay.toFixed(0)} {car.currency}
            </span>{" "}
            / {common("perDay")}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onSelect?.(car)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("select")}
            <ChevronRight className="h-4 w-4" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-foreground transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.06 1.6 5.83L2 22l4.4-1.15a9.86 9.86 0 0 0 5.64 1.76h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8a8.08 8.08 0 0 1 8.1 8.1c0 4.47-3.63 8.1-8.1 8.1a8.08 8.08 0 0 1-4.12-1.13l-.3-.18-2.61.68.7-2.55-.2-.31a8.06 8.06 0 0 1-1.23-4.3 8.1 8.1 0 0 1 8.1-8.1Zm4.96 12.33c-.25.7-1.45 1.34-2 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.57.35.07.13.07.7-.18 1.4Z" />
            </svg>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
