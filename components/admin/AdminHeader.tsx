"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Moon, ShieldCheck, Sun } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onLogin = pathname === "/admin/login";
  const isDark = resolvedTheme === "dark";

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-brand" />
          <span>
            Maximum <span className="text-brand">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              type="button"
              aria-label="Promijeni temu"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground/80 transition-colors hover:border-brand hover:text-brand"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          {!onLogin && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-brand hover:text-brand"
            >
              <LogOut className="h-4 w-4" />
              Odjava
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
