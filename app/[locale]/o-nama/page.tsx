import { getTranslations, setRequestLocale } from "next-intl/server";
import { Car, MapPin, Clock } from "lucide-react";

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const stats = [
    { icon: Car, value: "25–30", label: t("stat1") },
    { icon: MapPin, value: "6", label: t("stat2") },
    { icon: Clock, value: "24/7", label: t("stat3") },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
      </header>

      <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
      </div>

      <dl className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-surface p-6 shadow-card"
          >
            <Icon className="h-6 w-6 text-brand" />
            <dd className="mt-4 font-display text-3xl font-bold text-foreground">
              {value}
            </dd>
            <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
