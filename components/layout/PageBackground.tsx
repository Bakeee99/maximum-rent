"use client";

import { usePathname } from "@/i18n/navigation";

// Route → mesh position. Logic: calm pages get corner glows, the fleet page
// stays whisper-subtle (cards are the star), contact gets a livelier diagonal.
const VARIANTS: { match: string; cls: string }[] = [
  { match: "/o-nama", cls: "page-bg--tl" }, // about — top-left, calm
  { match: "/poslovna-ponuda", cls: "page-bg--tr" }, // business — top-right, dynamic
  { match: "/vozila", cls: "page-bg--top" }, // fleet — single faint top glow
  { match: "/uvjeti-najma", cls: "page-bg--bottom" }, // terms — bottom
  { match: "/kontakt", cls: "page-bg--center" }, // contact — diagonal
];

export function PageBackground() {
  const pathname = usePathname();

  // Homepage has its own hero backdrop — no page background there.
  if (pathname === "/") return null;

  const variant =
    VARIANTS.find((v) => pathname.startsWith(v.match))?.cls ?? "page-bg--tr";

  return <div aria-hidden className={`page-bg ${variant}`} />;
}
