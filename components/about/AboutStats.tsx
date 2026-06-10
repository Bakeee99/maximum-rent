"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type Stat = { value: number; label: string; suffix?: string };

function Counter({
  value,
  suffix,
  locale,
}: {
  value: number;
  suffix?: string;
  locale: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {n.toLocaleString(locale)}
      {suffix}
    </span>
  );
}

export function AboutStats({
  items,
  locale,
}: {
  items: Stat[];
  locale: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border bg-surface p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover"
        >
          <div className="font-display text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
            <Counter value={it.value} suffix={it.suffix} locale={locale} />
          </div>
          <div className="mt-2 text-sm font-medium text-muted-foreground">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
