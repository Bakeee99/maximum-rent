import { prisma } from "@/lib/prisma";
import { toCarListItem, type CarListItem } from "@/lib/types";

/**
 * Availability rules (Model A — "client asks, agency confirms"):
 * - Only CONFIRMED inquiries block a car. NEW/CONTACTED (pending) do not.
 * - Manual CarBlock windows (service etc.) block exactly like CONFIRMED.
 * - Overlap of [pickupAt, returnAt) with [existing.pickupAt, existing.returnAt):
 *   existing.pickupAt < requested.returnAt AND existing.returnAt > requested.pickupAt
 */

export function isValidPeriod(pickupAt: Date, returnAt: Date): boolean {
  return (
    !Number.isNaN(pickupAt.getTime()) &&
    !Number.isNaN(returnAt.getTime()) &&
    returnAt.getTime() > pickupAt.getTime()
  );
}

/** All offerable cars that are free for the whole requested period. */
export async function getAvailableCars(
  pickupAt: Date,
  returnAt: Date,
): Promise<CarListItem[]> {
  const cars = await prisma.car.findMany({
    where: {
      isAvailable: true,
      inquiries: {
        none: {
          status: "CONFIRMED",
          pickupAt: { lt: returnAt },
          returnAt: { gt: pickupAt },
        },
      },
      blocks: {
        none: {
          startAt: { lt: returnAt },
          endAt: { gt: pickupAt },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  return cars.map(toCarListItem);
}

/**
 * Is a specific car free for the period? Used when the agency confirms an
 * inquiry, to prevent double-booking. `excludeInquiryId` ignores the inquiry
 * being confirmed itself.
 */
export async function isCarFreeFor(
  carId: string,
  pickupAt: Date,
  returnAt: Date,
  excludeInquiryId?: string,
): Promise<boolean> {
  const [conflictingInquiries, conflictingBlocks] = await Promise.all([
    prisma.inquiry.count({
      where: {
        carId,
        status: "CONFIRMED",
        pickupAt: { lt: returnAt },
        returnAt: { gt: pickupAt },
        ...(excludeInquiryId ? { id: { not: excludeInquiryId } } : {}),
      },
    }),
    prisma.carBlock.count({
      where: {
        carId,
        startAt: { lt: returnAt },
        endAt: { gt: pickupAt },
      },
    }),
  ]);
  return conflictingInquiries === 0 && conflictingBlocks === 0;
}
