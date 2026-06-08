import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Terms");

  const items = t.raw("items") as string[];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
      </header>

      <ul className="mt-10 space-y-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand/10 text-brand">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm leading-relaxed text-foreground/90">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
