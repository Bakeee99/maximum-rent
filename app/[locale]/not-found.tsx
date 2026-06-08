"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default function LocaleNotFound() {
  const t = useTranslations("Common");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-7xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        {t("notFound")}
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>
    </div>
  );
}
