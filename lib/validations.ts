import { z } from "zod";

export const inquirySchema = z.object({
  carId: z.string().min(1).optional(),
  carTitle: z.string().min(1),
  pickupLocationId: z.string().min(1).optional(),
  returnLocationId: z.string().min(1).optional(),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  flightNumber: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  locale: z.enum(["hr", "en"]).default("hr"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
