import { Resend } from "resend";
import type { InquiryInput } from "@/lib/validations";

type InquiryEmailData = InquiryInput & {
  reference: string;
  pickupLocationName?: string | null;
  returnLocationName?: string | null;
};

function fmt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function row(label: string, value?: string | null): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 0;color:#888;font-size:13px;width:170px;vertical-align:top">${label}</td>
    <td style="padding:8px 0;color:#111;font-size:14px;font-weight:600">${value}</td>
  </tr>`;
}

/**
 * Sends the inquiry notification to the business inbox.
 * Returns { sent:false } (instead of throwing) when RESEND_API_KEY is absent,
 * so local development works without email configured.
 */
export async function sendInquiryEmail(
  data: InquiryEmailData,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? "info@maximum-rent.com";
  const from =
    process.env.INQUIRY_FROM_EMAIL ?? "Maximum Rent <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY missing — inquiry stored, notification email skipped.",
    );
    return { sent: false, error: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const fullName = `${data.firstName} ${data.lastName}`;

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    <div style="background:#E30613;padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#fff;font-size:18px;letter-spacing:.02em">Maximum Rent a Car</h1>
      <p style="margin:4px 0 0;color:#ffd7d9;font-size:13px">Novi upit za rezervaciju · ${data.reference}</p>
    </div>
    <div style="border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;padding:24px">
      <table style="width:100%;border-collapse:collapse">
        ${row("Vozilo", data.carTitle)}
        ${row("Period", `${fmt(data.pickupAt)} → ${fmt(data.returnAt)}`)}
        ${row("Preuzimanje", data.pickupLocationName)}
        ${row("Povratak", data.returnLocationName)}
        <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:8px"></td></tr>
        ${row("Ime i prezime", fullName)}
        ${row("Email", data.email)}
        ${row("Telefon", data.phone)}
        ${row("Broj leta", data.flightNumber || null)}
        ${row("Napomena", data.message || null)}
        ${row("Jezik", data.locale.toUpperCase())}
      </table>
    </div>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Upit: ${data.carTitle} (${data.reference})`,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { sent: false, error: String(error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}
