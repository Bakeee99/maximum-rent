"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontal, SlidersHorizontal } from "lucide-react";
import type { CarCategory } from "@/lib/car-categories";

export type FilterItem = {
  id: CarCategory | "ALL";
  label: string;
  count: number;
};

export function FleetFilters({
  items,
  active,
  onChange,
  label,
  swipeHint,
}: {
  items: FilterItem[];
  active: CarCategory | "ALL";
  onChange: (id: CarCategory | "ALL") => void;
  label: string;
  swipeHint: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  // Show the swipe hint only when the chips actually overflow and the user
  // hasn't started scrolling yet.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const overflowing = el.scrollWidth > el.clientWidth + 4;
      const atStart = el.scrollLeft < 8;
      setShowHint(overflowing && atStart);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [items.length]);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4 text-brand" />
          {label}
        </div>
        {showHint && (
          <span className="flex animate-pulse items-center gap-1 text-xs text-muted-foreground sm:hidden">
            <MoveHorizontal className="h-3.5 w-3.5" />
            {swipeHint}
          </span>
        )}
      </div>

      {/* Always visible. Horizontal scroll on mobile (bleeds to the screen
          edges), wraps onto multiple rows from sm up. py-1 leaves room so the
          active pill isn't visually clipped by the scroll container. */}
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              aria-pressed={isActive}
              className={`inline-flex flex-none items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-surface text-foreground/80 hover:border-brand hover:text-brand"
              }`}
            >
              {it.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  isActive
                    ? "bg-white/25 text-brand-foreground"
                    : "bg-surface-muted text-muted-foreground"
                }`}
              >
                {it.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
