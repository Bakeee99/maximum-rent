/**
 * Automatic owner notification via Telegram Bot API (free, official,
 * reliable). Sends a short message to the owner's Telegram when a new
 * inquiry arrives. Replaces the earlier CallMeBot/WhatsApp attempt.
 *
 * Setup (one-time, ~2 min):
 *  1. In Telegram, open @BotFather → /newbot → pick a name → you get a
 *     BOT TOKEN (looks like 123456789:AA...).
 *  2. Open your new bot's chat and press START (send /start).
 *  3. Visit https://api.telegram.org/bot<TOKEN>/getUpdates in a browser —
 *     read "chat":{"id": <number>} from the JSON. That number is the CHAT ID.
 *  4. Set env: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
 *
 * If env vars are missing, sending is skipped silently (logged) — the
 * inquiry flow never depends on this.
 */
export async function sendOwnerNotification(
  text: string,
): Promise<{ sent: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[notify] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing — owner notification skipped.",
    );
    return { sent: false, error: "not_configured" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[notify] Telegram error:", res.status, body.slice(0, 200));
      return { sent: false, error: `http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[notify] Telegram send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}
