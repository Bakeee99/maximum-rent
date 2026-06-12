/**
 * Automatic WhatsApp notification to the owner via CallMeBot
 * (https://www.callmebot.com) — a free service for personal WhatsApp
 * notifications. Unlike wa.me links (which only prefill a chat), this
 * actually DELIVERS the message server-side, with no paid WhatsApp
 * Business API.
 *
 * Setup (one-time, on the receiving phone):
 *  1. Add CallMeBot's activation number to contacts (see callmebot.com →
 *     "WhatsApp Text Messages" for the current number).
 *  2. From WhatsApp, send it: "I allow callmebot to send me messages".
 *  3. The bot replies with a personal API key.
 *  4. Set env: CALLMEBOT_PHONE (E.164, e.g. 38762784029) and CALLMEBOT_APIKEY.
 *
 * If the env vars are missing, sending is skipped silently (logged) — the
 * inquiry flow never depends on this.
 */
export async function sendOwnerWhatsApp(
  text: string,
): Promise<{ sent: boolean; error?: string }> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.warn(
      "[whatsapp] CALLMEBOT_PHONE/CALLMEBOT_APIKEY missing — auto notification skipped.",
    );
    return { sent: false, error: "not_configured" };
  }

  try {
    const url =
      `https://api.callmebot.com/whatsapp.php` +
      `?phone=${encodeURIComponent(phone)}` +
      `&apikey=${encodeURIComponent(apikey)}` +
      `&text=${encodeURIComponent(text)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[whatsapp] CallMeBot error:", res.status, body.slice(0, 200));
      return { sent: false, error: `http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[whatsapp] CallMeBot send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}
