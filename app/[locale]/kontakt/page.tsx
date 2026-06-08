import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SITE, LOCATIONS } from "@/lib/site-config";

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const whatsappUrl = `https://wa.me/${SITE.whatsapp}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Phones */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Phone className="h-5 w-5 text-brand" />
            {t("callUs")}
          </h2>
          <ul className="mt-4 space-y-2">
            {SITE.phones.map((p) => (
              <li key={p.value} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{p.label}</span>
                <a
                  href={p.href}
                  className="text-sm font-medium text-foreground transition-colors hover:text-brand"
                >
                  {p.value}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Email + WhatsApp */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Mail className="h-5 w-5 text-brand" />
              {t("emailUs")}
            </h2>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-3 inline-block text-sm font-medium text-foreground transition-colors hover:text-brand"
            >
              {SITE.email}
            </a>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
          >
            <MessageCircle className="h-5 w-5" />
            {t("whatsappCta")}
          </a>
        </div>
      </div>

      {/* Offices */}
      <div className="mt-14">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <MapPin className="h-6 w-6 text-brand" />
          {t("ourOffices")}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.name}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <h3 className="font-medium text-foreground">{loc.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{loc.street}</p>
              <p className="text-sm text-muted-foreground">{loc.city}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
