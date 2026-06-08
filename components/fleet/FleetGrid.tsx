"use client";

import { useState } from "react";
import { CarCard } from "./CarCard";
import { InquiryModal } from "@/components/reservation/InquiryModal";
import type { CarListItem, SearchContext } from "@/lib/types";

type Props = {
  cars: CarListItem[];
  search?: SearchContext;
};

/**
 * Client wrapper that owns the "which car is selected" state and renders the
 * inquiry modal. Cards trigger `onSelect`; the modal handles Option A (email)
 * and Option B (WhatsApp). Server pages stay RSC and just pass plain data in.
 */
export function FleetGrid({ cars, search }: Props) {
  const [selected, setSelected] = useState<CarListItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, i) => (
          <CarCard
            key={car.id}
            car={car}
            search={search}
            index={i}
            onSelect={setSelected}
          />
        ))}
      </div>

      <InquiryModal
        car={selected}
        search={search}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
