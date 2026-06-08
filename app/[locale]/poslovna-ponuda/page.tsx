import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarRange, Truck, Plane, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function BusinessPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Business");

  const features = [
    { icon: CalendarRange, title: t("f1Title"), body: t("f1Body") },
    { icon: Truck, title: t("f2Title"), body: t("f2Body") },
    { icon: Plane, title: t("f3Title"), body: t("f3Body") },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
        <p className="mt-6 text-base leading-relaxed text-foreground/90">
          {t("intro")}
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <Link
          href="/kontakt"
          className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
        >
          {t("cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
