"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import type { CarListItem, SearchContext } from "@/lib/types";
import { buildWhatsAppUrl, type InquiryContext } from "@/lib/whatsapp";

type Props = {
  car: CarListItem | null;
  search?: SearchContext;
  onClose: () => void;
};

// 24-hour, 30-minute slots (00:00 → 23:30). A native <select> keeps a
// predictable width on every browser, unlike iOS <input type="time">.
const pad = (n: number) => String(n).padStart(2, "0");
const TIME_SLOTS = Array.from(
  { length: 48 },
  (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`,
);

function splitISO(iso?: string | null, fallbackOffsetDays = 1) {
  const d = iso ? new Date(iso) : new Date(Date.now() + fallbackOffsetDays * 86_400_000);
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);
  return { date, time };
}

// Snap any "HH:MM" to the nearest valid 30-minute slot so it matches a
// dropdown option (00:00 → 23:30).
function snapTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const total = Math.min(Math.round((h * 60 + m) / 30) * 30, 23 * 60 + 30);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function InquiryModal({ car, search, onClose }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Inquiry");

  const initPickup = useMemo(() => splitISO(search?.pickupAt, 1), [search?.pickupAt]);
  const initReturn = useMemo(() => splitISO(search?.returnAt, 3), [search?.returnAt]);

  const [pickupDate, setPickupDate] = useState(initPickup.date);
  const [pickupTime, setPickupTime] = useState(snapTime(initPickup.time));
  const [returnDate, setReturnDate] = useState(initReturn.date);
  const [returnTime, setReturnTime] = useState(snapTime(initReturn.time));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form whenever a new car is selected
  useEffect(() => {
    if (car) {
      setStatus("idle");
      setErrorMsg("");
      setPickupDate(initPickup.date);
      setPickupTime(initPickup.time);
      setReturnDate(initReturn.date);
      setReturnTime(initReturn.time);
    }
  }, [car, initPickup, initReturn]);

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!car) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [car, onClose]);

  if (!car) return null;

  const pickupISO = new Date(`${pickupDate}T${pickupTime}`).toISOString();
  const returnISO = new Date(`${returnDate}T${returnTime}`).toISOString();

  const inquiryCtx: InquiryContext = {
    car: { title: car.title },
    pickupLocation: search?.pickupLocation,
    returnLocation: search?.returnLocation,
    pickupAt: pickupISO,
    returnAt: returnISO,
    locale,
  };
  const whatsappUrl = buildWhatsAppUrl(inquiryCtx);

  async function handleSubmit() {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car!.id,
          carTitle: car!.title,
          pickupLocationId: search?.pickupLocationId,
          returnLocationId: search?.returnLocationId,
          pickupAt: pickupISO,
          returnAt: returnISO,
          firstName,
          lastName,
          email,
          phone,
          flightNumber,
          message,
          locale,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg(t("errGeneric"));
    }
  }

  const input =
    "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
  const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-6 shadow-card-hover sm:rounded-2xl"
        >
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          {status === "success" ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold">{t("success")}</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("successBody")}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-700"
              >
                {t("close")}
              </button>
            </div>
          ) : (
            <>
              <h3 className="pr-8 font-display text-xl font-semibold tracking-tight">
                {t("title")}
              </h3>
              <p className="mt-1 text-sm font-medium text-brand">{car.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="mt-5 space-y-4"
              >
                {/* Dates */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={lbl}>{t("summaryPickup")}</label>
                    <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
                      <input
                        type="date"
                        value={pickupDate}
                        min={splitISO(undefined, 0).date}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className={`${input} w-full`}
                        required
                      />
                      <div className="relative">
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className={`${input} w-full appearance-none pr-8`}
                          required
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{t("summaryReturn")}</label>
                    <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
                      <input
                        type="date"
                        value={returnDate}
                        min={pickupDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className={`${input} w-full`}
                        required
                      />
                      <div className="relative">
                        <select
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className={`${input} w-full appearance-none pr-8`}
                          required
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t("firstName")}</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={input}
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <label className={lbl}>{t("lastName")}</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={input}
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t("email")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={input}
                      required
                    />
                  </div>
                  <div>
                    <label className={lbl}>{t("phone")}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={input}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={lbl}>{t("flight")}</label>
                  <input
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className={input}
                  />
                </div>

                <div>
                  <label className={lbl}>{t("message")}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className={`${input} h-auto py-2`}
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm font-medium text-brand">{errorMsg}</p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("send")}
                      </>
                    )}
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-5 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.06 1.6 5.83L2 22l4.4-1.15a9.86 9.86 0 0 0 5.64 1.76h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.96 14.13c-.25.7-1.45 1.34-2 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.57.35.07.13.07.7-.18 1.4Z" />
                    </svg>
                    {t("whatsapp")}
                  </a>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
