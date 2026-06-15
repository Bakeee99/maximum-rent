"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DateField } from "@/components/ui/DateField";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * Block-a-vehicle form. Client component so the date pickers (DateField) can
 * hold state; the values are submitted to the `addBlock` server action via
 * hidden inputs (DateField `name`). carId/reason stay native named fields.
 */
export function BlockForm({
  action,
  cars,
  today,
}: {
  action: (formData: FormData) => void;
  cars: { id: string; title: string }[];
  today: string;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <form
      action={action}
      className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr_auto]"
    >
      <div className="min-w-0">
        <label className={lbl}>Vozilo</label>
        <select name="carId" required className={input} defaultValue="">
          <option value="" disabled>
            Odaberite vozilo…
          </option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <label className={lbl}>Od datuma</label>
        <DateField
          name="from"
          value={from}
          min={today}
          locale="hr"
          placeholder="Odaberite…"
          onChange={(v) => {
            setFrom(v);
            if (to && to < v) setTo(v);
          }}
          className={input}
        />
      </div>

      <div className="min-w-0">
        <label className={lbl}>Do datuma</label>
        <DateField
          name="to"
          value={to}
          min={from || today}
          locale="hr"
          placeholder="Odaberite…"
          onChange={setTo}
          className={input}
        />
      </div>

      <div className="min-w-0">
        <label className={lbl}>Razlog</label>
        <input
          type="text"
          name="reason"
          placeholder="Razlog (opcionalno)"
          maxLength={200}
          className={input}
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center gap-1.5 self-end rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
      >
        <Plus className="h-4 w-4" />
        Blokiraj
      </button>
    </form>
  );
}
