import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS_14 = 14 * 24 * 60 * 60 * 1000;

/**
 * Daily DB cleanup (Vercel Cron → GET with `Authorization: Bearer CRON_SECRET`,
 * which Vercel attaches automatically when the CRON_SECRET env var is set).
 *
 * Deletion rule is based on the RENTAL END (`returnAt`), not the creation date:
 *  - An inquiry/reservation is removed only once its rental period ended more
 *    than 14 days ago (returnAt < now − 14d). This way a long rental (e.g. a
 *    two-month booking) is never touched while it's still running or upcoming —
 *    it only disappears 14 days after the car was returned.
 *  - Applies to every status: by the time returnAt is 14+ days in the past the
 *    record can no longer affect availability (the dates are gone), whether it
 *    was confirmed, cancelled or a stale pending lead.
 *  - Manual car blocks are removed 14 days after their window ended.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - DAYS_14);

  try {
    const [inquiries, blocks] = await Promise.all([
      prisma.inquiry.deleteMany({
        where: { returnAt: { lt: cutoff } },
      }),
      prisma.carBlock.deleteMany({
        where: { endAt: { lt: cutoff } },
      }),
    ]);

    console.log(
      `[cron/cleanup] deleted ${inquiries.count} inquiries, ${blocks.count} blocks (returnAt/endAt older than 14 days)`,
    );
    return NextResponse.json({
      ok: true,
      deletedInquiries: inquiries.count,
      deletedBlocks: blocks.count,
    });
  } catch (err) {
    console.error("[cron/cleanup] failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
