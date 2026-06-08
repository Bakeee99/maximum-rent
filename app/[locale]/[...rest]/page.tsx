import { notFound } from "next/navigation";

// Any unmatched path under a locale prefix (e.g. /hr/foo) renders the
// localized not-found page inside the locale layout.
export default function CatchAll() {
  notFound();
}
