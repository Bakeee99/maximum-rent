import { getTranslations } from "next-intl/server";
import { CalendarDays, MapPin } from "lucide-react";

function fmt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function dayCount(a: string, b: string): number {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  return Math.max(1, Math.ceil((end - start) / 86_400_000));
}

type Props = {
  pickupAt: string;
  returnAt: string;
  pickupName?: string | null;
  returnName?: string | null;
};

export async function ReservationSummary({
  pickupAt,
  returnAt,
  pickupName,
  returnName,
}: Props) {
  const t = await getTranslations("Fleet");
  const days = dayCount(pickupAt, returnAt);

  const cards = [
    {
      title: `${t("period")} · ${days} ${days === 1 ? t("day") : t("days")}`,
      icon: CalendarDays,
      lines: [fmt(pickupAt), fmt(returnAt)],
    },
    {
      title: t("pickup"),
      icon: MapPin,
      lines: [pickupName ?? "—"],
    },
    {
      title: t("return"),
      icon: MapPin,
      lines: [returnName ?? pickupName ?? "—"],
    },
  ];

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {t("detailsTitle")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
          >
            <div className="bg-brand px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-brand-foreground">
              {c.title}
            </div>
            <div className="space-y-1.5 p-4">
              {c.lines.map((line, i) => (
                <p key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <c.icon className="h-4 w-4 shrink-0 text-brand" />
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
