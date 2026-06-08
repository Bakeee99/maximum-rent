"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CalendarDays, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type SimpleLocation = { id: string; name: string; city: string };

function dateOffset(days = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
}

// 30-minute slots 00:00 → 23:30
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export function ReservationSearchForm({ locations }: { locations: SimpleLocation[] }) {
  const t = useTranslations("Search");
  const router = useRouter();

  const [sameLocation, setSameLocation] = useState(true);
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [returnLocationId, setReturnLocationId] = useState("");
  const [pickupDate, setPickupDate] = useState(dateOffset(1));
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState(dateOffset(3));
  const [returnTime, setReturnTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);

  const effectiveReturnId = sameLocation ? pickupLocationId : returnLocationId;

  const pickupAt = useMemo(
    () => new Date(`${pickupDate}T${pickupTime}`),
    [pickupDate, pickupTime],
  );
  const returnAt = useMemo(
    () => new Date(`${returnDate}T${returnTime}`),
    [returnDate, returnTime],
  );

  function handleSubmit() {
    setError(null);
    if (!pickupLocationId || !effectiveReturnId) {
      setError(t("errRequired"));
      return;
    }
    if (returnAt <= pickupAt) {
      setError(t("errOrder"));
      return;
    }
    const params = new URLSearchParams({
      pickupLocationId,
      returnLocationId: effectiveReturnId,
      pickupAt: pickupAt.toISOString(),
      returnAt: returnAt.toISOString(),
    });
    router.push(`/vozila?${params.toString()}`);
  }

  const field =
    "h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
  const lbl =
    "mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full rounded-2xl border border-border bg-surface/95 p-5 shadow-card backdrop-blur-md sm:p-6"
    >
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end">
        {/* Locations */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pickup-loc" className={lbl}>
              <MapPin className="h-3.5 w-3.5 text-brand" />
              {t("pickupLocation")}
            </label>
            <select
              id="pickup-loc"
              value={pickupLocationId}
              onChange={(e) => setPickupLocationId(e.target.value)}
              className={field}
            >
              <option value="" disabled>
                {t("placeholder")}
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {!sameLocation && (
              <motion.div
                key="return-loc"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="return-loc" className={lbl}>
                  <MapPin className="h-3.5 w-3.5 text-brand" />
                  {t("returnLocation")}
                </label>
                <select
                  id="return-loc"
                  value={returnLocationId}
                  onChange={(e) => setReturnLocationId(e.target.value)}
                  className={field}
                >
                  <option value="" disabled>
                    {t("placeholder")}
                  </option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dates + times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pickup-date" className={lbl}>
              <CalendarDays className="h-3.5 w-3.5 text-brand" />
              {t("pickupDate")}
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                id="pickup-date"
                type="date"
                min={dateOffset(0)}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className={field}
              />
              <select
                aria-label={t("time")}
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className={`${field} w-[4.5rem] px-2`}
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="return-date" className={lbl}>
              <Clock className="h-3.5 w-3.5 text-brand" />
              {t("returnDate")}
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                id="return-date"
                type="date"
                min={pickupDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={field}
              />
              <select
                aria-label={t("time")}
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className={`${field} w-[4.5rem] px-2`}
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("search")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={sameLocation}
            onChange={(e) => setSameLocation(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-brand"
          />
          {t("sameLocation")}
        </label>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="flex items-center gap-1.5 text-sm font-medium text-brand"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}
