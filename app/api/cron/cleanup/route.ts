import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

/**
 * Daily DB cleanup (Vercel Cron → GET with `Authorization: Bearer CRON_SECRET`,
 * which Vercel attaches automatically when the CRON_SECRET env var is set).
 *
 * Conservative deletion rule — removes only records that can no longer affect
 * availability or operations:
 *  - Inquiries older than 30 days whose status is CANCELLED or COMPLETED
 *    AND whose rental period is fully in the past (returnAt < now). Active,
 *    pending (NEW/CONTACTED) and CONFIRMED inquiries are NEVER deleted —
 *    pending ones are the agency's lead list, confirmed ones are bookings.
 *  - Manual car blocks whose window ended more than 30 days ago.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - DAYS_30);

  try {
    const [inquiries, blocks] = await Promise.all([
      prisma.inquiry.deleteMany({
        where: {
          createdAt: { lt: cutoff },
          status: { in: ["CANCELLED", "COMPLETED"] },
          returnAt: { lt: now },
        },
      }),
      prisma.carBlock.deleteMany({
        where: { endAt: { lt: cutoff } },
      }),
    ]);

    console.log(
      `[cron/cleanup] deleted ${inquiries.count} inquiries, ${blocks.count} blocks`,
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
