"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";

// Defense in depth: middleware already guards /admin, but server actions are
// HTTP endpoints of their own — re-check the session cookie in each one.
async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

function backTo(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  redirect(`/admin${qs ? `?${qs}` : ""}`);
}

/** PENDING/CONTACTED → CONFIRMED, with an overlap re-check inside a
 *  transaction so two admins can't double-book the same car. */
export async function confirmInquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("statusFilter") ?? "pending");
  if (!id) backTo({ status, msg: "error" });

  const result = await prisma.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.findUnique({ where: { id } });
    if (!inquiry || inquiry.status === "CANCELLED") return "error" as const;
    if (inquiry.status === "CONFIRMED") return "confirmed" as const;

    if (inquiry.carId) {
      const [conflictsRes, conflictsBlk] = await Promise.all([
        tx.inquiry.count({
          where: {
            carId: inquiry.carId,
            status: "CONFIRMED",
            id: { not: inquiry.id },
            pickupAt: { lt: inquiry.returnAt },
            returnAt: { gt: inquiry.pickupAt },
          },
        }),
        tx.carBlock.count({
          where: {
            carId: inquiry.carId,
            startAt: { lt: inquiry.returnAt },
            endAt: { gt: inquiry.pickupAt },
          },
        }),
      ]);
      if (conflictsRes > 0 || conflictsBlk > 0) return "conflict" as const;
    }

    await tx.inquiry.update({
      where: { id: inquiry.id },
      data: { status: "CONFIRMED" },
    });
    return "confirmed" as const;
  });

  revalidatePath("/admin");
  backTo({ status, msg: result });
}

export async function cancelInquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("statusFilter") ?? "pending");
  if (!id) backTo({ status, msg: "error" });

  await prisma.inquiry.updateMany({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin");
  backTo({ status, msg: "cancelled" });
}

/** Manual unavailability window (service etc.). Day-granularity, inclusive:
 *  [from 00:00 UTC, to+1d 00:00 UTC). */
export async function addBlock(formData: FormData) {
  await requireAdmin();
  const carId = String(formData.get("carId") ?? "");
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);

  const startAt = new Date(`${from}T00:00:00.000Z`);
  const endAt = new Date(`${to}T00:00:00.000Z`);
  endAt.setUTCDate(endAt.getUTCDate() + 1);

  const valid =
    carId &&
    !Number.isNaN(startAt.getTime()) &&
    !Number.isNaN(endAt.getTime()) &&
    endAt.getTime() > startAt.getTime();

  if (!valid) backTo({ msg: "error" });

  await prisma.carBlock.create({
    data: { carId, startAt, endAt, reason: reason || null },
  });

  revalidatePath("/admin");
  backTo({ msg: "blocked" });
}

export async function removeBlock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.carBlock.deleteMany({ where: { id } });
  }
  revalidatePath("/admin");
  backTo({ msg: "unblocked" });
}
